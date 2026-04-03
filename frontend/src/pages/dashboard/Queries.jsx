import React, { useMemo, useState } from 'react';

const initialTickets = [
  {
    id: 'TCK-1001',
    customer: 'Aisha Khan',
    message: 'Payment failed at checkout for two cards.',
    category: 'Billing',
    priority: 'High',
    status: 'Pending',
    createdAt: '2026-04-01',
  },
  {
    id: 'TCK-1002',
    customer: 'Omar N.',
    message: 'App stuck on loading after update.',
    category: 'Technical',
    priority: 'Medium',
    status: 'Escalated',
    createdAt: '2026-04-02',
  },
  {
    id: 'TCK-1003',
    customer: 'Sara Lee',
    message: 'Unable to login even after reset.',
    category: 'Login',
    priority: 'Low',
    status: 'Resolved',
    createdAt: '2026-03-31',
  },
  {
    id: 'TCK-1004',
    customer: 'Daniel M.',
    message: 'Invoice total does not match cart value.',
    category: 'Billing',
    priority: 'High',
    status: 'Pending',
    createdAt: '2026-04-03',
  },
  {
    id: 'TCK-1005',
    customer: 'Neha P.',
    message: 'MFA code not arriving on registered email.',
    category: 'Login',
    priority: 'Medium',
    status: 'Pending',
    createdAt: '2026-04-03',
  },
];

const priorityWeight = {
  High: 3,
  Medium: 2,
  Low: 1,
};

const priorityStyles = {
  High: 'bg-rose-100 text-rose-700',
  Medium: 'bg-orange-100 text-orange-700',
  Low: 'bg-emerald-100 text-emerald-700',
};

const statusStyles = {
  Pending: 'bg-amber-100 text-amber-700',
  Resolved: 'bg-emerald-100 text-emerald-700',
  Escalated: 'bg-rose-100 text-rose-700',
};

const categoryStyles = {
  Billing: 'bg-indigo-100 text-indigo-700',
  Technical: 'bg-cyan-100 text-cyan-700',
  Login: 'bg-violet-100 text-violet-700',
};

const Queries = () => {
  const [tickets, setTickets] = useState(initialTickets);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Newest');
  const [selectedId, setSelectedId] = useState(initialTickets[0].id);

  const ticketStats = useMemo(() => {
    const pending = tickets.filter((ticket) => ticket.status === 'Pending').length;
    const escalated = tickets.filter((ticket) => ticket.status === 'Escalated').length;
    const resolved = tickets.filter((ticket) => ticket.status === 'Resolved').length;
    return {
      total: tickets.length,
      pending,
      escalated,
      resolved,
    };
  }, [tickets]);

  const filteredTickets = useMemo(() => {
    const filtered = tickets.filter((ticket) => {
      const matchesSearch =
        ticket.id.toLowerCase().includes(searchText.toLowerCase()) ||
        ticket.message.toLowerCase().includes(searchText.toLowerCase()) ||
        ticket.customer.toLowerCase().includes(searchText.toLowerCase());
      const matchesStatus = statusFilter === 'All' || ticket.status === statusFilter;
      const matchesPriority = priorityFilter === 'All' || ticket.priority === priorityFilter;
      const matchesCategory = categoryFilter === 'All' || ticket.category === categoryFilter;
      return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === 'Priority') {
        return priorityWeight[b.priority] - priorityWeight[a.priority];
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [tickets, searchText, statusFilter, priorityFilter, categoryFilter, sortBy]);

  const selectedTicket =
    filteredTickets.find((ticket) => ticket.id === selectedId) || filteredTickets[0] || null;

  const updateTicket = (ticketId, updates) => {
    setTickets((previous) =>
      previous.map((ticket) => (ticket.id === ticketId ? { ...ticket, ...updates } : ticket))
    );
  };

  return (
    <div className="space-y-5">
      {/* <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-900 px-6 py-6 text-white">
          <h1 className="text-2xl font-semibold tracking-tight">Queries Workspace</h1>
          <p className="mt-1 text-sm text-slate-200">
            Track, filter, and resolve support tickets faster.
          </p>
        </div>

        <div className="grid gap-3 border-t border-slate-200 bg-slate-50 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <article className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{ticketStats.total}</p>
          </article>
          <article className="rounded-xl border border-amber-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">Pending</p>
            <p className="mt-2 text-2xl font-bold text-amber-700">{ticketStats.pending}</p>
          </article>
          <article className="rounded-xl border border-rose-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-rose-600">Escalated</p>
            <p className="mt-2 text-2xl font-bold text-rose-700">{ticketStats.escalated}</p>
          </article>
          <article className="rounded-xl border border-emerald-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Resolved</p>
            <p className="mt-2 text-2xl font-bold text-emerald-700">{ticketStats.resolved}</p>
          </article>
        </div>
      </section> */}

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <div className="space-y-4 xl:col-span-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
              <label className="xl:col-span-2">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Search
                </span>
                <input
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                  placeholder="Ticket ID, customer, message..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>

              <label>
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </span>
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option>All</option>
                  <option>Pending</option>
                  <option>Escalated</option>
                  <option>Resolved</option>
                </select>
              </label>

              <label>
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Priority
                </span>
                <select
                  value={priorityFilter}
                  onChange={(event) => setPriorityFilter(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option>All</option>
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </label>

              <label>
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Category
                </span>
                <select
                  value={categoryFilter}
                  onChange={(event) => setCategoryFilter(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option>All</option>
                  <option>Billing</option>
                  <option>Technical</option>
                  <option>Login</option>
                </select>
              </label>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <p className="text-xs text-slate-500">
                Showing <span className="font-semibold text-slate-700">{filteredTickets.length}</span>{' '}
                result{filteredTickets.length === 1 ? '' : 's'}
              </p>
              <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Sort
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  className="rounded-lg border border-slate-300 px-2 py-1.5 text-xs text-slate-700 outline-none focus:border-blue-500"
                >
                  <option>Newest</option>
                  <option>Priority</option>
                </select>
              </label>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Ticket
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
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredTickets.map((ticket) => (
                    <tr
                      key={ticket.id}
                      onClick={() => setSelectedId(ticket.id)}
                      className={`cursor-pointer transition-colors ${
                        selectedTicket?.id === ticket.id ? 'bg-blue-50' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="px-4 py-3">
                        <p className="text-sm font-semibold text-blue-700">{ticket.id}</p>
                        <p className="mt-1 max-w-[280px] truncate text-xs text-slate-600">
                          {ticket.message}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">{ticket.customer}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            categoryStyles[ticket.category]
                          }`}
                        >
                          {ticket.category}
                        </span>
                      </td>
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
                      <td className="px-4 py-3 text-sm text-slate-600">{ticket.createdAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 p-3 md:hidden">
              {filteredTickets.map((ticket) => (
                <button
                  key={ticket.id}
                  type="button"
                  onClick={() => setSelectedId(ticket.id)}
                  className={`w-full rounded-xl border p-3 text-left ${
                    selectedTicket?.id === ticket.id
                      ? 'border-blue-300 bg-blue-50'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-blue-700">{ticket.id}</p>
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-[10px] font-semibold ${
                        statusStyles[ticket.status]
                      }`}
                    >
                      {ticket.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{ticket.customer}</p>
                  <p className="mt-2 text-sm text-slate-700">{ticket.message}</p>
                  <div className="mt-2 flex gap-2">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-[10px] font-semibold ${
                        categoryStyles[ticket.category]
                      }`}
                    >
                      {ticket.category}
                    </span>
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-[10px] font-semibold ${
                        priorityStyles[ticket.priority]
                      }`}
                    >
                      {ticket.priority}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {filteredTickets.length === 0 && (
              <div className="grid h-36 place-items-center text-sm text-slate-500">
                No tickets match your filters.
              </div>
            )}
          </div>
        </div>

        <aside className="xl:col-span-4">
          <div className="sticky top-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Ticket Details
            </h2>

            {selectedTicket ? (
              <div className="mt-3 space-y-4">
                <div>
                  <p className="text-lg font-semibold text-slate-900">{selectedTicket.id}</p>
                  <p className="text-sm text-slate-500">{selectedTicket.customer}</p>
                </div>

                <p className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                  {selectedTicket.message}
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg border border-slate-200 p-2">
                    <p className="text-slate-400">Category</p>
                    <p className="mt-1 font-semibold text-slate-700">{selectedTicket.category}</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-2">
                    <p className="text-slate-400">Created</p>
                    <p className="mt-1 font-semibold text-slate-700">{selectedTicket.createdAt}</p>
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Update Status
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    <button
                      type="button"
                      onClick={() => updateTicket(selectedTicket.id, { status: 'Pending' })}
                      className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-left text-xs font-semibold text-amber-700 transition hover:bg-amber-100"
                    >
                      Mark as Pending
                    </button>
                    <button
                      type="button"
                      onClick={() => updateTicket(selectedTicket.id, { status: 'Escalated' })}
                      className="rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-left text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                    >
                      Escalate to Technical Team
                    </button>
                    <button
                      type="button"
                      onClick={() => updateTicket(selectedTicket.id, { status: 'Resolved' })}
                      className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-left text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
                    >
                      Mark as Resolved
                    </button>
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Update Priority
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['High', 'Medium', 'Low'].map((priority) => (
                      <button
                        key={priority}
                        type="button"
                        onClick={() => updateTicket(selectedTicket.id, { priority })}
                        className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                          selectedTicket.priority === priority
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {priority}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-500">No ticket selected.</p>
            )}
          </div>
        </aside>
      </section>
    </div>
  );
};

export default Queries;
