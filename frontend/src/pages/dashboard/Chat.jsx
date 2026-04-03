import React, { useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import {
  getMessagesByTicket,
  getMyTickets,
  sendMessage,
  updateTicket,
} from '../../services/api';

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
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState('');
  const [messagesByTicket, setMessagesByTicket] = useState({});
  const [draft, setDraft] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const bottomRef = useRef(null);

  const activeConversation = useMemo(
    () => conversations.find((conversation) => (conversation._id || conversation.id) === activeId),
    [activeId, conversations]
  );
  const activeMessages = messagesByTicket[activeId] || [];

  useEffect(() => {
    const loadConversations = async () => {
      try {
        setIsLoadingConversations(true);
        const result = await getMyTickets();
        const list = Array.isArray(result) ? result : [];
        setConversations(list);
        if (list.length > 0) {
          setActiveId(list[0]._id || list[0].id || '');
        }
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Failed to load conversations.');
      } finally {
        setIsLoadingConversations(false);
      }
    };

    loadConversations();
  }, []);

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

  const handleSend = async (event) => {
    event.preventDefault();
    if (!activeConversation || !activeId || !draft.trim() || isSending) return;

    const text = draft.trim();
    setIsSending(true);

    try {
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
      await updateTicket(activeId, { status: nextStatus });
      setConversations((previous) =>
        previous.filter((conversation) => (conversation._id || conversation.id) !== activeId)
      );
      setMessagesByTicket((previous) => {
        const next = { ...previous };
        delete next[activeId];
        return next;
      });
      setActiveId((previousActiveId) => {
        if (previousActiveId !== activeId) return previousActiveId;
        const remaining = conversations.filter(
          (conversation) => (conversation._id || conversation.id) !== activeId
        );
        return remaining[0]?._id || remaining[0]?.id || '';
      });
      toast.success(
        nextStatus === 'resolved' ? 'Ticket marked as resolved.' : 'Ticket escalated.'
      );
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to update ticket status.');
    }
  };

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-10">
      <aside className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-3">
        <div className="border-b border-slate-200 bg-gradient-to-r from-slate-900 to-slate-700 p-4 text-white">
          <h1 className="text-lg font-semibold">Support Chat</h1>
          <p className="mt-1 text-xs text-slate-200">Active customer conversations</p>
        </div>

        <div className="max-h-[640px] space-y-2 overflow-y-auto p-3">
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

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-7">
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

            <div className="mb-4 h-[440px] space-y-3 overflow-y-auto rounded-xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-4">
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
          <div className="grid h-[240px] place-items-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500">
            Select a conversation to start chatting.
          </div>
        )}
      </section>
    </div>
  );
};

export default Chat;
