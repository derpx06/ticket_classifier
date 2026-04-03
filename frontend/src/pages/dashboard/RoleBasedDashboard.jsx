import React, { useMemo, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

const RoleBasedDashboard = () => {
  const { role } = useAuth();
  const normalizedRole = typeof role === 'string' ? role.toLowerCase() : '';
  const isAdmin = normalizedRole === 'admin';

  const tickets = useMemo(
    () => [
      {
        id: 'TCK-1001',
        message: 'Payment failed',
        category: 'Billing',
        priority: 'High',
        status: 'Pending',
        customer: 'Aisha Khan',
        chat: [
          { sender: 'user', text: 'My payment keeps failing at checkout.' },
          { sender: 'bot', text: 'I can help with that. Did you try another card?' },
        ],
      },
      {
        id: 'TCK-1002',
        message: 'App not loading',
        category: 'Technical',
        priority: 'Medium',
        status: 'Escalated',
        customer: 'Omar N.',
        chat: [
          { sender: 'user', text: 'The app is stuck on the loading screen.' },
          { sender: 'bot', text: 'I have shared this with technical support for deeper checks.' },
        ],
      },
      {
        id: 'TCK-1003',
        message: 'Unable to login',
        category: 'Login',
        priority: 'Low',
        status: 'Resolved',
        customer: 'Sara Lee',
        chat: [
          { sender: 'user', text: 'I was unable to login this morning.' },
          { sender: 'bot', text: 'Your password reset worked and access is restored.' },
        ],
      },
      {
        id: 'TCK-1004',
        message: 'Invoice mismatch',
        category: 'Billing',
        priority: 'High',
        status: 'Pending',
        customer: 'Daniel M.',
        chat: [
          { sender: 'user', text: 'The charged amount differs from my invoice.' },
          { sender: 'bot', text: 'I am reviewing your billing timeline now.' },
        ],
      },
    ],
    []
  );

  const [selectedTicketId, setSelectedTicketId] = useState(tickets[0]?.id || '');

  const priorityStyles = {
    High: 'bg-red-100 text-red-700',
    Medium: 'bg-orange-100 text-orange-700',
    Low: 'bg-green-100 text-green-700',
  };

  const statusStyles = {
    Pending: 'bg-amber-100 text-amber-700',
    Resolved: 'bg-emerald-100 text-emerald-700',
    Escalated: 'bg-rose-100 text-rose-700',
  };

  const statCards = [
    { label: 'Assigned Tickets', value: 12, subtitle: 'Tickets assigned to you' },
    { label: 'Pending Tickets', value: 5, subtitle: 'Awaiting response' },
    { label: 'Resolved Tickets', value: 20, subtitle: 'Handled successfully' },
    { label: 'Escalated Tickets', value: 2, subtitle: 'Forwarded to higher team' },
  ];

  if (isAdmin) {
    return (
      <div className="space-y-5 font-sans">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-slate-900">Support Workspace</h1>
          <p className="mt-1 text-sm text-slate-600">Administrator dashboard view.</p>
        </div>

        <div className="rounded-xl border border-primary/30 bg-primary/5 p-8 text-center shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary/80">Role</p>
          <p className="mt-2 text-3xl font-bold text-primary">ADMIN</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 font-sans">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Support Workspace</h1>
        <p className="mt-1 text-sm text-slate-600">
          AI-powered employee console for monitoring and resolving customer tickets.
        </p>
      </div>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <article
            key={card.label}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <p className="text-sm font-medium text-slate-600">{card.label}</p>
            <p className="mt-2 text-4xl font-bold text-primary">{card.value}</p>
            <p className="mt-1 text-sm text-slate-500">{card.subtitle}</p>
          </article>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-10">
        <div className="space-y-6 lg:col-span-7">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="text-xl font-semibold text-slate-900">Recent Queries</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Ticket ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Message
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Category
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Priority
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {tickets.map((ticket) => (
                    <tr
                      key={ticket.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedTicketId(ticket.id)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          setSelectedTicketId(ticket.id);
                        }
                      }}
                      className={`cursor-pointer transition-colors hover:bg-blue-50 ${
                        selectedTicketId === ticket.id ? 'bg-blue-50/70' : ''
                      }`}
                    >
                      <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-blue-700">
                        {ticket.id}
                      </td>
                      <td className="max-w-[220px] truncate px-4 py-3 text-sm text-slate-700">
                        {ticket.message}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">{ticket.category}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            priorityStyles[ticket.priority]
                          }`}
                        >
                          {ticket.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            statusStyles[ticket.status]
                          }`}
                        >
                          {ticket.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        <aside className="space-y-4 lg:col-span-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Action Center</h2>

            <div className="mt-4 space-y-4">
              <div className="rounded-lg bg-blue-50 p-4">
                <p className="text-sm font-semibold text-blue-800">Pending Tickets: 5</p>
                <p className="mt-1 text-sm text-blue-700">
                  You have 5 tickets awaiting response
                </p>
              </div>

              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-sm font-semibold text-red-700">High Priority Alerts</p>
                <ul className="mt-2 space-y-2 text-sm text-red-700">
                  <li>Payment gateway errors detected for 2 users.</li>
                  <li>Repeated login failures from enterprise account.</li>
                </ul>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-800">AI Suggestions Available</p>
                <p className="mt-1 text-sm text-slate-600">Use AI to reply faster</p>
              </div>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
};

export default RoleBasedDashboard;
