import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env";

export type AgentTokenPayload = {
  sub: number;
  companyId: number;
  role: string;
  iat?: number;
  exp?: number;
};

export type WidgetTokenPayload = {
  tokenType: "widget";
  companyId: number;
  sessionId: string;
  ticketId: string;
  iat?: number;
  exp?: number;
};

export function signWidgetToken(input: {
  companyId: number;
  sessionId: string;
  ticketId: string;
}): string {
  const options = { expiresIn: env.widgetJwtExpiresIn } as SignOptions;
  return jwt.sign(
    {
      tokenType: "widget",
      companyId: input.companyId,
      sessionId: input.sessionId,
      ticketId: input.ticketId,
    },
    env.jwtSecret,
    options,
  );
}

export function verifySocketToken(token: string): AgentTokenPayload | WidgetTokenPayload {
  return jwt.verify(token, env.jwtSecret) as AgentTokenPayload | WidgetTokenPayload;
}

