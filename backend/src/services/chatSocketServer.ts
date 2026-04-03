import type { Server as HttpServer } from "http";
import { ObjectId } from "mongodb";
import { Server, type Socket } from "socket.io";
import { getCollections } from "../config/db";
import { verifySocketToken, type AgentTokenPayload, type WidgetTokenPayload } from "../utils/chatTokens";

type AgentSocketAuth = {
  kind: "agent";
  userId: number;
  companyId: number;
  role: string;
};

type WidgetSocketAuth = {
  kind: "widget";
  companyId: number;
  sessionId: string;
  ticketId: string;
};

type SocketAuthContext = AgentSocketAuth | WidgetSocketAuth;

type HandoffPayload = {
  name?: string;
  email?: string;
  issue?: string;
};

type SendMessagePayload = {
  ticketId: string;
  text: string;
};

type WidgetMessagePayload = {
  text: string;
};

let ioRef: Server | null = null;

const companyAgentsRoom = (companyId: number): string => `company:${companyId}:agents`;
const ticketRoom = (ticketId: string): string => `ticket:${ticketId}`;
const sessionRoom = (sessionId: string): string => `session:${sessionId}`;

const toPublicMessage = (doc: {
  _id: ObjectId;
  ticketId: ObjectId;
  companyId: number;
  sessionId?: string | null;
  sender: "user" | "bot" | "agent";
  text: string;
  createdAt: Date;
  updatedAt: Date;
  senderUserId?: number | null;
}) => ({
  _id: doc._id.toString(),
  ticketId: doc.ticketId.toString(),
  companyId: doc.companyId,
  sessionId: doc.sessionId ?? null,
  sender: doc.sender,
  text: doc.text,
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
  senderUserId: doc.senderUserId ?? null,
});

const parseObjectId = (value: string): ObjectId | null =>
  ObjectId.isValid(value) ? new ObjectId(value) : null;

const normalizeText = (value: unknown): string => String(value ?? "").trim();

const getTokenFromSocket = (socket: Socket): string | null => {
  const fromAuth = socket.handshake.auth?.token;
  if (typeof fromAuth === "string" && fromAuth.trim() !== "") return fromAuth.trim();

  const authHeader = socket.handshake.headers.authorization;
  if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7).trim();
  }

  return null;
};

const isWidgetPayload = (
  payload: AgentTokenPayload | WidgetTokenPayload,
): payload is WidgetTokenPayload => {
  return (
    (payload as WidgetTokenPayload).tokenType === "widget" &&
    typeof (payload as WidgetTokenPayload).sessionId === "string" &&
    typeof (payload as WidgetTokenPayload).ticketId === "string"
  );
};

const isAgentPayload = (
  payload: AgentTokenPayload | WidgetTokenPayload,
): payload is AgentTokenPayload => {
  return (
    typeof (payload as AgentTokenPayload).sub === "number" &&
    typeof (payload as AgentTokenPayload).companyId === "number" &&
    typeof (payload as AgentTokenPayload).role === "string"
  );
};

const requireSocketAuth = (socket: Socket): SocketAuthContext => {
  const auth = socket.data.auth as SocketAuthContext | undefined;
  if (!auth) {
    throw new Error("Socket is not authenticated.");
  }
  return auth;
};

type ChatSessionDoc = {
  _id: ObjectId;
  sessionId: string;
  companyId: number;
  ticketId: ObjectId;
  handoffRequested: boolean;
  visitorName: string | null;
  visitorEmail: string | null;
  createdAt: Date;
  updatedAt: Date;
};

const fetchWidgetSession = async (context: WidgetSocketAuth): Promise<ChatSessionDoc | null> => {
  const { users } = await getCollections();
  const db = users.db;
  const ticketObjectId = parseObjectId(context.ticketId);
  if (!ticketObjectId) return null;

  const session = await db.collection<ChatSessionDoc>("chat_sessions").findOne({
    sessionId: context.sessionId,
    companyId: context.companyId,
    ticketId: ticketObjectId,
  });

  return session;
};

const persistMessage = async (input: {
  ticketId: ObjectId;
  companyId: number;
  sessionId?: string | null;
  sender: "user" | "bot" | "agent";
  text: string;
  senderUserId?: number | null;
}) => {
  const { users } = await getCollections();
  const db = users.db;
  const now = new Date();
  const messageDoc = {
    ticketId: input.ticketId,
    companyId: input.companyId,
    sessionId: input.sessionId ?? null,
    sender: input.sender,
    text: input.text,
    senderUserId: input.senderUserId ?? null,
    createdAt: now,
    updatedAt: now,
  };

  const inserted = await db.collection("messages").insertOne(messageDoc);
  await db.collection("tickets").updateOne(
    { _id: input.ticketId, companyId: input.companyId },
    { $set: { updatedAt: now } },
  );

  return {
    _id: inserted.insertedId,
    ...messageDoc,
  };
};

const emitMessage = (message: ReturnType<typeof toPublicMessage>, input: {
  companyId: number;
  ticketId: string;
  sessionId: string | null;
  includeAgentsRoom?: boolean;
}): void => {
  if (!ioRef) return;
  ioRef.to(ticketRoom(input.ticketId)).emit("chat:message", message);
  if (input.sessionId) {
    ioRef.to(sessionRoom(input.sessionId)).emit("chat:message", message);
  }
  if (input.includeAgentsRoom) {
    ioRef.to(companyAgentsRoom(input.companyId)).emit("chat:message", message);
  }
};

export function createChatSocketServer(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: {
      origin: true,
      credentials: true,
    },
  });
  ioRef = io;

  io.use((socket, next) => {
    const token = getTokenFromSocket(socket);
    if (!token) {
      next(new Error("Authentication token is required."));
      return;
    }

    try {
      const payload = verifySocketToken(token);
      if (isWidgetPayload(payload)) {
        socket.data.auth = {
          kind: "widget",
          companyId: payload.companyId,
          sessionId: payload.sessionId,
          ticketId: payload.ticketId,
        } as WidgetSocketAuth;
        next();
        return;
      }

      if (isAgentPayload(payload)) {
        socket.data.auth = {
          kind: "agent",
          userId: payload.sub,
          companyId: payload.companyId,
          role: payload.role,
        } as AgentSocketAuth;
        next();
        return;
      }

      next(new Error("Invalid authentication token."));
    } catch {
      next(new Error("Invalid authentication token."));
    }
  });

  io.on("connection", (socket) => {
    const auth = requireSocketAuth(socket);

    if (auth.kind === "agent") {
      socket.join(companyAgentsRoom(auth.companyId));
    }

    if (auth.kind === "widget") {
      socket.join(sessionRoom(auth.sessionId));
      socket.join(ticketRoom(auth.ticketId));
    }

    socket.on("agent:join_ticket", async (payload: { ticketId?: string } = {}) => {
      const context = requireSocketAuth(socket);
      if (context.kind !== "agent") return;

      const ticketId = String(payload.ticketId ?? "").trim();
      const ticketObjectId = parseObjectId(ticketId);
      if (!ticketObjectId) {
        socket.emit("chat:error", { message: "Invalid ticket id." });
        return;
      }

      const { users } = await getCollections();
      const db = users.db;
      const ticket = await db.collection("tickets").findOne({
        _id: ticketObjectId,
        companyId: context.companyId,
      });
      if (!ticket) {
        socket.emit("chat:error", { message: "Ticket not found." });
        return;
      }

      socket.join(ticketRoom(ticketId));
      socket.emit("agent:joined_ticket", { ticketId });
    });

    socket.on("agent:leave_ticket", (payload: { ticketId?: string } = {}) => {
      const ticketId = String(payload.ticketId ?? "").trim();
      if (!ticketId) return;
      socket.leave(ticketRoom(ticketId));
    });

    socket.on("agent:send_message", async (payload: SendMessagePayload) => {
      const context = requireSocketAuth(socket);
      if (context.kind !== "agent") return;

      const text = normalizeText(payload?.text);
      const ticketObjectId = parseObjectId(String(payload?.ticketId ?? ""));
      if (!ticketObjectId || !text) {
        socket.emit("chat:error", { message: "Ticket id and message text are required." });
        return;
      }

      const { users } = await getCollections();
      const db = users.db;
      const ticket = await db.collection("tickets").findOne({
        _id: ticketObjectId,
        companyId: context.companyId,
      });
      if (!ticket) {
        socket.emit("chat:error", { message: "Ticket not found." });
        return;
      }

      const session = await db.collection<ChatSessionDoc>("chat_sessions").findOne({
        companyId: context.companyId,
        ticketId: ticketObjectId,
      });

      const stored = await persistMessage({
        ticketId: ticketObjectId,
        companyId: context.companyId,
        sessionId: session?.sessionId ?? null,
        sender: "agent",
        text,
        senderUserId: context.userId,
      });
      const message = toPublicMessage(stored);
      emitMessage(message, {
        companyId: context.companyId,
        ticketId: ticketObjectId.toString(),
        sessionId: session?.sessionId ?? null,
      });
    });

    socket.on("widget:request_human", async (payload: HandoffPayload = {}) => {
      const context = requireSocketAuth(socket);
      if (context.kind !== "widget") return;

      const session = await fetchWidgetSession(context);
      if (!session) {
        socket.emit("chat:error", { message: "Chat session not found." });
        return;
      }

      const visitorName = normalizeText(payload.name) || null;
      const visitorEmail = normalizeText(payload.email) || null;
      const issue = normalizeText(payload.issue);
      const now = new Date();

      const { users } = await getCollections();
      const db = users.db;

      await db.collection("chat_sessions").updateOne(
        { _id: session._id },
        {
          $set: {
            handoffRequested: true,
            visitorName: visitorName ?? session.visitorName ?? null,
            visitorEmail: visitorEmail ?? session.visitorEmail ?? null,
            updatedAt: now,
          },
        },
      );

      await db.collection("tickets").updateOne(
        { _id: session.ticketId, companyId: context.companyId },
        {
          $set: {
            status: "pending",
            customerName: visitorName ?? session.visitorName ?? "Website Visitor",
            updatedAt: now,
          },
        },
      );

      if (issue) {
        const stored = await persistMessage({
          ticketId: session.ticketId,
          companyId: context.companyId,
          sessionId: context.sessionId,
          sender: "user",
          text: issue,
        });
        const issueMessage = toPublicMessage(stored);
        emitMessage(issueMessage, {
          companyId: context.companyId,
          ticketId: session.ticketId.toString(),
          sessionId: context.sessionId,
          includeAgentsRoom: true,
        });
      }

      io.to(companyAgentsRoom(context.companyId)).emit("chat:handoff_requested", {
        ticketId: session.ticketId.toString(),
        sessionId: context.sessionId,
        visitorName: visitorName ?? session.visitorName ?? "Website Visitor",
        visitorEmail: visitorEmail ?? session.visitorEmail ?? null,
        issue: issue || null,
      });

      socket.emit("widget:handoff_confirmed", {
        ticketId: session.ticketId.toString(),
        sessionId: context.sessionId,
      });
    });

    socket.on("widget:message", async (payload: WidgetMessagePayload) => {
      const context = requireSocketAuth(socket);
      if (context.kind !== "widget") return;

      const text = normalizeText(payload?.text);
      if (!text) {
        socket.emit("chat:error", { message: "Message text is required." });
        return;
      }

      const session = await fetchWidgetSession(context);
      if (!session) {
        socket.emit("chat:error", { message: "Chat session not found." });
        return;
      }

      const stored = await persistMessage({
        ticketId: session.ticketId,
        companyId: context.companyId,
        sessionId: context.sessionId,
        sender: "user",
        text,
      });
      const message = toPublicMessage(stored);
      emitMessage(message, {
        companyId: context.companyId,
        ticketId: session.ticketId.toString(),
        sessionId: context.sessionId,
        includeAgentsRoom: session.handoffRequested,
      });
    });
  });

  return io;
}

export function emitRealtimeMessageFromHttp(input: {
  companyId: number;
  ticketId: string;
  sessionId?: string | null;
  sender: "user" | "bot" | "agent";
  text: string;
  messageId: string;
  createdAt: Date;
  senderUserId?: number | null;
}): void {
  if (!ioRef) return;
  const message = {
    _id: input.messageId,
    ticketId: input.ticketId,
    companyId: input.companyId,
    sessionId: input.sessionId ?? null,
    sender: input.sender,
    text: input.text,
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    senderUserId: input.senderUserId ?? null,
  };

  ioRef.to(ticketRoom(input.ticketId)).emit("chat:message", message);
  if (input.sessionId) {
    ioRef.to(sessionRoom(input.sessionId)).emit("chat:message", message);
  }
}

