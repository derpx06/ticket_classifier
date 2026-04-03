import React, { useEffect, useMemo, useRef, useState } from 'react';

const initialConversations = [
  {
    id: 'TCK-1001',
    customer: 'Aisha Khan',
    topic: 'Payment failed',
    status: 'Pending',
    messages: [
      { sender: 'customer', text: 'My payment keeps failing at checkout.' },
      {
        sender: 'agent',
        text: 'I can help with that. Did you try another card or UPI account?',
      },
    ],
  },
  {
    id: 'TCK-1002',
    customer: 'Omar N.',
    topic: 'App not loading',
    status: 'Escalated',
    messages: [
      { sender: 'customer', text: 'The app is stuck on the loading screen.' },
      {
        sender: 'agent',
        text: 'Please clear cache once. I have also escalated this for tech review.',
      },
    ],
  },
  {
    id: 'TCK-1003',
    customer: 'Sara Lee',
    topic: 'Unable to login',
    status: 'Pending',
    messages: [
      { sender: 'customer', text: 'I cannot login to my account.' },
      { sender: 'agent', text: 'I sent a password reset link and validated account status.' },
    ],
  },
];

const statusStyles = {
  Pending: 'bg-amber-100 text-amber-700',
  Resolved: 'bg-emerald-100 text-emerald-700',
  Escalated: 'bg-rose-100 text-rose-700',
};

const Chat = () => {
  const [conversations, setConversations] = useState(initialConversations);
  const [activeId, setActiveId] = useState(initialConversations[0].id);
  const [draft, setDraft] = useState('');
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef(null);

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeId),
    [activeId, conversations]
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages.length]);

  const updateConversation = (ticketId, updater) => {
    setConversations((previous) =>
      previous.map((conversation) =>
        conversation.id === ticketId ? updater(conversation) : conversation
      )
    );
  };

  const addMessage = (ticketId, message) => {
    updateConversation(ticketId, (conversation) => ({
      ...conversation,
      messages: [...conversation.messages, message],
    }));
  };

  const handleSend = async (event) => {
    event.preventDefault();
    if (!activeConversation || !draft.trim() || isSending) return;

    const text = draft.trim();
    setDraft('');
    setIsSending(true);

    addMessage(activeConversation.id, { sender: 'agent', text });

    window.setTimeout(() => {
      addMessage(activeConversation.id, {
        sender: 'customer',
        text: 'Thanks. I will check and get back if I still need help.',
      });
      setIsSending(false);
    }, 550);
  };

  const updateStatus = (nextStatus) => {
    if (!activeConversation) return;

    updateConversation(activeConversation.id, (conversation) => ({
      ...conversation,
      status: nextStatus,
      messages: [
        ...conversation.messages,
        {
          sender: 'system',
          text:
            nextStatus === 'Resolved'
              ? 'Ticket marked as resolved.'
              : 'Ticket escalated to technical support.',
        },
      ],
    }));
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
            const lastMessage = conversation.messages[conversation.messages.length - 1];
            return (
              <button
                key={conversation.id}
                type="button"
                onClick={() => setActiveId(conversation.id)}
                className={`w-full rounded-xl border p-3 text-left transition ${
                  conversation.id === activeId
                    ? 'border-blue-300 bg-blue-50 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="mb-1 flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {conversation.topic}
                  </p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      statusStyles[conversation.status]
                    }`}
                  >
                    {conversation.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500">{conversation.customer}</p>
                <p className="mt-2 truncate text-xs text-slate-600">{lastMessage.text}</p>
                <p className="mt-2 text-[11px] text-slate-400">{conversation.id}</p>
              </button>
            );
          })}
        </div>
      </aside>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-7">
        {activeConversation ? (
          <>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{activeConversation.topic}</h2>
                <p className="text-sm text-slate-500">{activeConversation.customer}</p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  statusStyles[activeConversation.status]
                }`}
              >
                {activeConversation.status}
              </span>
            </div>

            <div className="mb-4 h-[440px] space-y-3 overflow-y-auto rounded-xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-4">
              {activeConversation.messages.map((entry, index) => (
                <div
                  key={`${activeConversation.id}-${index}`}
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
              {isSending && (
                <div className="mr-auto max-w-[86%] rounded-2xl bg-white px-4 py-2 text-sm text-slate-500 shadow-sm">
                  Customer is typing...
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
                onClick={() => updateStatus('Pending')}
                className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Mark Pending
              </button>
              <button
                type="button"
                onClick={() => updateStatus('Resolved')}
                className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
              >
                Mark as Resolved
              </button>
              <button
                type="button"
                onClick={() => updateStatus('Escalated')}
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
