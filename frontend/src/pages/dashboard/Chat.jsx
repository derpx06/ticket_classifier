import React, { useMemo, useState } from 'react';

const mockConversations = [
  {
    id: 'TCK-1001',
    customer: 'Aisha Khan',
    topic: 'Payment failed',
    messages: [
      { sender: 'user', text: 'My payment keeps failing at checkout.' },
      { sender: 'bot', text: 'I can help with that. Did you try another card?' },
    ],
  },
  {
    id: 'TCK-1002',
    customer: 'Omar N.',
    topic: 'App not loading',
    messages: [
      { sender: 'user', text: 'The app is stuck on the loading screen.' },
      { sender: 'bot', text: 'Please clear cache once. I also escalated this for review.' },
    ],
  },
  {
    id: 'TCK-1003',
    customer: 'Sara Lee',
    topic: 'Unable to login',
    messages: [
      { sender: 'user', text: 'I cannot login to my account.' },
      { sender: 'bot', text: 'I sent a password reset link and validated your account status.' },
    ],
  },
];

const Chat = () => {
  const [activeId, setActiveId] = useState(mockConversations[0].id);

  const activeConversation = useMemo(
    () => mockConversations.find((conversation) => conversation.id === activeId),
    [activeId]
  );

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-10">
      <aside className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:col-span-3">
        <h1 className="mb-3 text-xl font-semibold text-slate-900">Chat</h1>
        <div className="space-y-2">
          {mockConversations.map((conversation) => (
            <button
              key={conversation.id}
              type="button"
              onClick={() => setActiveId(conversation.id)}
              className={`w-full rounded-lg border px-3 py-2 text-left transition-colors ${
                conversation.id === activeId
                  ? 'border-primary/35 bg-blue-50'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <p className="text-sm font-semibold text-slate-800">{conversation.topic}</p>
              <p className="text-xs text-slate-500">{conversation.id}</p>
            </button>
          ))}
        </div>
      </aside>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-7">
        {activeConversation && (
          <>
            <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="text-lg font-semibold text-slate-900">{activeConversation.topic}</h2>
              <span className="text-sm text-slate-500">{activeConversation.customer}</span>
            </div>

            <div className="mb-4 max-h-[380px] space-y-3 overflow-y-auto rounded-lg bg-slate-50 p-4">
              {activeConversation.messages.map((entry, index) => (
                <div
                  key={`${activeConversation.id}-${index}`}
                  className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                    entry.sender === 'user'
                      ? 'mr-auto bg-white text-slate-700'
                      : 'ml-auto bg-blue-100 text-blue-800'
                  }`}
                >
                  {entry.text}
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <button type="button" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                Reply
              </button>
              <button type="button" className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
                Mark as Resolved
              </button>
              <button type="button" className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700">
                Escalate
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default Chat;
