import React, { useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import {
  getTickets,
  getMessagesByTicket,
  getMyTickets,
  sendMessage,
  updateTicket,
} from '../../services/api';
import { createAgentSocket } from '../../services/socketClient';
import { useAuth } from '../../hooks/useAuth';

const statusStyles = {
  pending: 'bg-amber-100 text-amber-700',
  assigned: 'bg-blue-100 text-blue-700',
  resolved: 'bg-emerald-100 text-emerald-700',
  escalated: 'bg-rose-100 text-rose-700',
};

const formatLabel = (value = '') => {
  if (!value) return 'Unknown';
  return value.charAt(0).toUpperCase() + value.slice(1);
};

const Chat = () => {
  const { role } = useAuth();
  const isAdmin = String(role || '').toLowerCase() === 'admin';
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState('');
  const [messagesByTicket, setMessagesByTicket] = useState({});
  const [draft, setDraft] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const bottomRef = useRef(null);
  const socketRef = useRef(null);
  const activeIdRef = useRef(activeId);

  const activeConversation = useMemo(
    () => conversations.find((conversation) => (conversation._id || conversation.id) === activeId),
    [activeId, conversations]
  );
  const activeMessages = messagesByTicket[activeId] || [];

  useEffect(() => {
    const loadConversations = async () => {
      try {
        setIsLoadingConversations(true);
        const result = isAdmin ? await getTickets() : await getMyTickets();
        const list = Array.isArray(result) ? result : [];
        setConversations(list);
        setActiveId((previousActiveId) => {
          if (
            previousActiveId
            && list.some((conversation) => (conversation._id || conversation.id) === previousActiveId)
          ) {
            return previousActiveId;
          }
          return list[0]?._id || list[0]?.id || '';
        });
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Failed to load conversations.');
      } finally {
        setIsLoadingConversations(false);
      }
    };

    loadConversations();
  }, [isAdmin]);

  useEffect(() => {
    activeIdRef.current = activeId;
  });

  useEffect(() => {
    const socket = createAgentSocket();
    socketRef.current = socket;

    const onConnect = () => {
      setIsSocketConnected(true);
      const currentActiveId = activeIdRef.current;
      if (currentActiveId) {
        socket.emit('agent:join_ticket', { ticketId: currentActiveId });
      }
    };
    const onDisconnect = () => setIsSocketConnected(false);
    const onSocketError = (payload) => {
      const message = payload?.message || 'Real-time chat connection error.';
      toast.error(message);
    };
    const onIncomingMessage = (message) => {
      const ticketId = String(message?.ticketId || '');
      if (!ticketId || !message?._id) return;

      setMessagesByTicket((previous) => {
        const current = previous[ticketId] || [];
        if (current.some((entry) => entry._id === message._id)) {
          return previous;
        }
        return {
          ...previous,
          [ticketId]: [...current, message],
        };
      });
    };
    const onHandoff = () => {
      if (isAdmin) {
        void (async () => {
          try {
            const refreshed = await getTickets();
            setConversations(Array.isArray(refreshed) ? refreshed : []);
          } catch {
            // handled by user action refresh later
          }
        })();
      }
    };
    const onTicketStatus = (payload) => {
      const ticketId = String(payload?.ticketId || '');
      if (!ticketId) return;
      const nextStatus = String(payload?.status || '').trim().toLowerCase();
      const assignedTo = payload?.assignedTo ?? null;
      setConversations((previous) =>
        previous.map((conversation) => {
          const conversationId = String(conversation._id || conversation.id || '');
          if (conversationId !== ticketId) return conversation;
          return {
            ...conversation,
            status: nextStatus || conversation.status,
            assignedTo:
              typeof assignedTo === 'number'
                ? assignedTo
                : assignedTo === null
                  ? null
                  : conversation.assignedTo ?? null,
          };
        }),
      );
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onSocketError);
    socket.on('chat:error', onSocketError);
    socket.on('chat:message', onIncomingMessage);
    socket.on('chat:handoff_requested', onHandoff);
    socket.on('chat:ticket_status', onTicketStatus);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onSocketError);
      socket.off('chat:error', onSocketError);
      socket.off('chat:message', onIncomingMessage);
      socket.off('chat:handoff_requested', onHandoff);
      socket.off('chat:ticket_status', onTicketStatus);
      socket.close();
      socketRef.current = null;
    };
  }, [isAdmin]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages.length]);

  useEffect(() => {
    const loadMessages = async () => {
      if (!activeId) return;

      try {
        setIsLoadingMessages(true);
        const result = await getMessagesByTicket(activeId);
        const list = Array.isArray(result) ? result : [];
        setMessagesByTicket((previous) => ({ ...previous, [activeId]: list }));
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Failed to load messages.');
      } finally {
        setIsLoadingMessages(false);
      }
    };

    loadMessages();
  }, [activeId]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !activeId) return;

    socket.emit('agent:join_ticket', { ticketId: activeId });
    return () => {
      socket.emit('agent:leave_ticket', { ticketId: activeId });
    };
  }, [activeId]);

  const handleSend = async (event) => {
    event.preventDefault();
    if (!activeConversation || !activeId || !draft.trim() || isSending) return;

    const text = draft.trim();
    setIsSending(true);

    try {
      const socket = socketRef.current;
      if (socket && isSocketConnected) {
        socket.emit('agent:send_message', {
          ticketId: activeId,
          text,
        });
      } else {
        const created = await sendMessage({
          ticketId: activeId,
          text,
          sender: 'agent',
        });

        const fallback = {
          _id: `${Date.now()}`,
          ticketId: activeId,
          text,
          sender: 'agent',
          createdAt: new Date().toISOString(),
        };

        setMessagesByTicket((previous) => ({
          ...previous,
          [activeId]: [...(previous[activeId] || []), created || fallback],
        }));
      }
      setDraft('');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to send message.');
    } finally {
      setIsSending(false);
    }
  };

  const updateStatus = async (nextStatus) => {
    if (!activeConversation || !activeId) return;

    try {
      const updated = await updateTicket(activeId, { status: nextStatus });
      setConversations((previous) =>
        previous.map((conversation) =>
          (conversation._id || conversation.id) === activeId
            ? { ...conversation, status: updated?.status || nextStatus }
            : conversation
        )
      );
      toast.success(
        nextStatus === 'resolved' ? 'Ticket marked as resolved.' : 'Ticket escalated.'
      );
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to update ticket status.');
    }
  };

  return (
    <div className="h-full w-full px-3 pb-4 pt-2">
      <div className="grid h-full grid-cols-1 gap-5 lg:grid-cols-12">
      <aside className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-4">
        <div className="border-b border-slate-200 bg-gradient-to-r from-slate-900 to-slate-700 p-4 text-white">
          <div className="flex items-center justify-between gap-2">
            <h1 className="text-lg font-semibold">Support Chat</h1>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                isSocketConnected ? 'bg-emerald-200 text-emerald-800' : 'bg-amber-200 text-amber-800'
              }`}
            >
              {isSocketConnected ? 'Live' : 'Offline'}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-200">
            {isAdmin ? 'Company-wide customer conversations' : 'Assigned customer conversations'}
          </p>
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto p-3">
          {conversations.map((conversation) => {
            const conversationId = conversation._id || conversation.id;
            const lastMessage = (messagesByTicket[conversationId] || []).at(-1);
            return (
              <button
                key={conversationId}
                type="button"
                onClick={() => setActiveId(conversationId)}
                className={`w-full rounded-xl border p-3 text-left transition ${
                  conversationId === activeId
                    ? 'border-blue-300 bg-blue-50 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="mb-1 flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {conversation.message}
                  </p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      statusStyles[conversation.status] || 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {formatLabel(conversation.status)}
                  </span>
                </div>
                <p className="text-xs text-slate-500">{conversation.customerName || '-'}</p>
                <p className="mt-2 truncate text-xs text-slate-600">
                  {lastMessage?.text || 'No messages yet'}
                </p>
                <p className="mt-2 text-[11px] text-slate-400">
                  {conversation.ticketCode || conversationId}
                </p>
              </button>
            );
          })}
          {!isLoadingConversations && conversations.length === 0 && (
            <p className="rounded-xl border border-dashed border-slate-300 p-3 text-xs text-slate-500">
              No assigned conversations.
            </p>
          )}
        </div>
      </aside>

      <section className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-8">
        {activeConversation ? (
          <>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{activeConversation.message}</h2>
                <p className="text-sm text-slate-500">{activeConversation.customerName || '-'}</p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  statusStyles[activeConversation.status] || 'bg-slate-100 text-slate-700'
                }`}
              >
                {formatLabel(activeConversation.status)}
              </span>
            </div>

            <div className="mb-4 flex-1 space-y-3 overflow-y-auto rounded-xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-4">
              {activeMessages.map((entry, index) => (
                <div
                  key={`${activeId}-${entry._id || index}`}
                  className={`max-w-[86%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                    entry.sender === 'agent'
                      ? 'ml-auto bg-blue-600 text-white'
                      : entry.sender === 'system'
                        ? 'mx-auto bg-slate-100 text-center text-slate-600'
                        : 'mr-auto bg-white text-slate-700'
                  }`}
                >
                  {entry.text}
                </div>
              ))}
              {isLoadingMessages && (
                <div className="mr-auto max-w-[86%] rounded-2xl bg-white px-4 py-2 text-sm text-slate-500 shadow-sm">
                  Loading messages...
                </div>
              )}
              {isSending && (
                <div className="mr-auto max-w-[86%] rounded-2xl bg-white px-4 py-2 text-sm text-slate-500 shadow-sm">
                  Sending...
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <form onSubmit={handleSend} className="mb-3 flex gap-2">
              <input
                type="text"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Type your reply..."
                className="flex-1 rounded-xl border border-slate-300 px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
              <button
                type="submit"
                disabled={!draft.trim() || isSending}
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                Send
              </button>
            </form>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => updateStatus('pending')}
                className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Mark Pending
              </button>
              <button
                type="button"
                onClick={() => updateStatus('resolved')}
                className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
              >
                Mark as Resolved
              </button>
              <button
                type="button"
                onClick={() => updateStatus('escalated')}
                className="rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-rose-700"
              >
                Escalate
              </button>
            </div>
          </>
        ) : (
          <div className="grid flex-1 place-items-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500">
            Select a conversation to start chatting.
          </div>
        )}
      </section>
      </div>
    </div>
  );
};

export default Chat;
