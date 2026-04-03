import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { acceptTicket, getTickets, updateTicket } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

const priorityWeight = {
  high: 3,
  medium: 2,
  low: 1,
};

const priorityStyles = {
  high: 'bg-rose-100 text-rose-700',
  medium: 'bg-orange-100 text-orange-700',
  low: 'bg-emerald-100 text-emerald-700',
  critical: 'bg-red-200 text-red-800',
};

const statusStyles = {
  pending: 'bg-amber-100 text-amber-700',
  assigned: 'bg-blue-100 text-blue-700',
  resolved: 'bg-emerald-100 text-emerald-700',
  escalated: 'bg-rose-100 text-rose-700',
};

const categoryStyles = {
  billing: 'bg-indigo-100 text-indigo-700',
  technical: 'bg-cyan-100 text-cyan-700',
  login: 'bg-violet-100 text-violet-700',
};

const formatLabel = (value = '') => {
  if (!value) return 'Unknown';
  return value.charAt(0).toUpperCase() + value.slice(1);
};

const Queries = () => {
  const { user } = useAuth();
  const userRoleId = user?.companyRole?.id ?? null;
  const [tickets, setTickets] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Newest');
  const [selectedId, setSelectedId] = useState('');
  const [teamView, setTeamView] = useState('my-team');
  const [isLoading, setIsLoading] = useState(true);
  const [pendingAcceptId, setPendingAcceptId] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadTickets = async () => {
      try {
        setIsLoading(true);
        const result = await getTickets();
        const list = Array.isArray(result) ? result : [];
        setTickets(list);
        if (list.length > 0) {
          setSelectedId(list[0]._id || list[0].id || '');
        }
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Failed to load tickets.');
      } finally {
        setIsLoading(false);
      }
    };

    loadTickets();
  }, []);

  const filteredTickets = useMemo(() => {
    const filtered = tickets.filter((ticket) => {
      if (user?.role !== 'admin' && teamView === 'my-team') {
        if (!userRoleId) return false;
        return Number(ticket.assignedRoleId) === Number(userRoleId);
      }
      const matchesSearch =
        (ticket.ticketCode || ticket._id || ticket.id || '').toLowerCase().includes(searchText.toLowerCase()) ||
        (ticket.message || '').toLowerCase().includes(searchText.toLowerCase());
      const matchesStatus =
        statusFilter === 'All' || (ticket.status || '').toLowerCase() === statusFilter.toLowerCase();
      const matchesPriority =
        priorityFilter === 'All'
        || (ticket.priority || '').toLowerCase() === priorityFilter.toLowerCase();
      const matchesCategory =
        categoryFilter === 'All'
        || (ticket.category || '').toLowerCase() === categoryFilter.toLowerCase();
      return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === 'Priority') {
        return priorityWeight[b.priority] - priorityWeight[a.priority];
      }
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });
  }, [
    tickets,
    searchText,
    statusFilter,
    priorityFilter,
    categoryFilter,
    sortBy,
    teamView,
    userRoleId,
    user?.role,
  ]);

  const selectedTicket =
    filteredTickets.find((ticket) => (ticket._id || ticket.id) === selectedId) || filteredTickets[0] || null;

  const updateTicketState = (ticketId, updates) => {
    setTickets((previous) =>
      previous.map((ticket) =>
        (ticket._id || ticket.id) === ticketId ? { ...ticket, ...updates } : ticket
      )
    );
  };

  const handleAccept = async (ticketId) => {
    if (user?.role !== 'admin') {
      const ticket = tickets.find((item) => (item._id || item.id) === ticketId);
      const status = String(ticket?.status || '').toLowerCase();
      if (status === 'assigned' || status === 'resolved') {
        toast.error('This ticket cannot be accepted.');
        return;
      }
      const assignedRoleId = ticket?.assignedRoleId;
      if (!userRoleId || !assignedRoleId || Number(assignedRoleId) !== Number(userRoleId)) {
        toast.error('You can only accept tickets assigned to your team.');
        return;
      }
    }
    try {
      setPendingAcceptId(ticketId);
      const accepted = await acceptTicket(ticketId);
      updateTicketState(ticketId, accepted || { status: 'assigned' });
      toast.success('Ticket accepted and moved to My Chats.');
      const nextId = accepted?._id || accepted?.id || ticketId;
      navigate(`/chat?ticketId=${nextId}`);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to accept ticket.');
    } finally {
      setPendingAcceptId('');
    }
  };

  const handleReject = async (ticketId) => {
    if (user?.role !== 'admin') {
      const ticket = tickets.find((item) => (item._id || item.id) === ticketId);
      const status = String(ticket?.status || '').toLowerCase();
      if (status === 'assigned' || status === 'resolved') {
        toast.error('This ticket cannot be rejected.');
        return;
      }
      const assignedRoleId = ticket?.assignedRoleId;
      if (!userRoleId || !assignedRoleId || Number(assignedRoleId) !== Number(userRoleId)) {
        toast.error('You can only reject tickets assigned to your team.');
        return;
      }
    }
    try {
      const updated = await updateTicket(ticketId, { status: 'escalated' });
      updateTicketState(ticketId, updated || { status: 'escalated' });
      toast.success('Ticket rejected.');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to reject ticket.');
    }
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
          {user?.role !== 'admin' && (
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
              <button
                type="button"
                onClick={() => setTeamView('my-team')}
                className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                  teamView === 'my-team'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                My Team
              </button>
              <button
                type="button"
                onClick={() => setTeamView('all')}
                className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                  teamView === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                All Queries
              </button>
            </div>
          )}
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
                  <option>Assigned</option>
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
                  <option>Critical</option>
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
                      Sentiment
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
                      key={ticket._id || ticket.id}
                      onClick={() => setSelectedId(ticket._id || ticket.id)}
                      className={`cursor-pointer transition-colors ${
                        (selectedTicket?._id || selectedTicket?.id) === (ticket._id || ticket.id)
                          ? 'bg-blue-50'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="px-4 py-3">
                        <p className="max-w-[280px] truncate text-sm font-semibold text-slate-800">
                          {ticket.message || 'No description provided.'}
                        </p>
                        <p className="mt-1 max-w-[260px] break-all text-xs text-blue-700">
                          {ticket.ticketCode || ticket._id || ticket.id}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">{ticket.customerName || '-'}</p>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {ticket.sentimentEmoji ? (
                          <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                            <span className="text-base">{ticket.sentimentEmoji}</span>
                            {formatLabel(ticket.sentiment || 'neutral')}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            categoryStyles[ticket.category] || 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {formatLabel(ticket.category)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            priorityStyles[ticket.priority] || 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {formatLabel(ticket.priority)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            statusStyles[ticket.status] || 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {formatLabel(ticket.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 p-3 md:hidden">
              {filteredTickets.map((ticket) => (
                <button
                  key={ticket._id || ticket.id}
                  type="button"
                  onClick={() => setSelectedId(ticket._id || ticket.id)}
                  className={`w-full rounded-xl border p-3 text-left ${
                    (selectedTicket?._id || selectedTicket?.id) === (ticket._id || ticket.id)
                      ? 'border-blue-300 bg-blue-50'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-800">
                      {ticket.message || 'No description provided.'}
                    </p>
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-[10px] font-semibold ${
                        statusStyles[ticket.status] || 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {formatLabel(ticket.status)}
                    </span>
                  </div>
                  <p className="mt-1 break-all text-xs text-blue-700">
                    {ticket.ticketCode || ticket._id || ticket.id}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{ticket.customerName || '-'}</p>
                  <div className="mt-2 flex gap-2">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-[10px] font-semibold ${
                        categoryStyles[ticket.category] || 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {formatLabel(ticket.category)}
                    </span>
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-[10px] font-semibold ${
                        priorityStyles[ticket.priority] || 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {formatLabel(ticket.priority)}
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
                  <p className="break-all text-lg font-semibold text-slate-900">
                    {selectedTicket.ticketCode || selectedTicket._id || selectedTicket.id}
                  </p>
                  <p className="text-sm text-slate-500">{selectedTicket.customerName || '-'}</p>
                </div>

                <p className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                  {selectedTicket.message}
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg border border-slate-200 p-2">
                    <p className="text-slate-400">Category</p>
                    <p className="mt-1 font-semibold text-slate-700">
                      {formatLabel(selectedTicket.category)}
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-2">
                    <p className="text-slate-400">Created</p>
                    <p className="mt-1 font-semibold text-slate-700">
                      {selectedTicket.createdAt
                        ? new Date(selectedTicket.createdAt).toLocaleString()
                        : '-'}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Actions
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    <button
                      type="button"
                      disabled={
                        pendingAcceptId === (selectedTicket._id || selectedTicket.id) ||
                        ['assigned', 'resolved'].includes(
                          String(selectedTicket.status || '').toLowerCase(),
                        ) ||
                        (user?.role !== 'admin' &&
                          (!userRoleId ||
                            !selectedTicket.assignedRoleId ||
                            Number(selectedTicket.assignedRoleId) !== Number(userRoleId)))
                      }
                      onClick={() => handleAccept(selectedTicket._id || selectedTicket.id)}
                      className="rounded-lg border border-blue-300 bg-blue-50 px-3 py-2 text-left text-xs font-semibold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {pendingAcceptId === (selectedTicket._id || selectedTicket.id)
                        ? 'Accepting...'
                        : 'Accept Ticket'}
                    </button>
                    <button
                      type="button"
                      disabled={
                        ['assigned', 'resolved'].includes(
                          String(selectedTicket.status || '').toLowerCase(),
                        ) ||
                        user?.role !== 'admin' &&
                        (!userRoleId ||
                          !selectedTicket.assignedRoleId ||
                          Number(selectedTicket.assignedRoleId) !== Number(userRoleId))
                      }
                      onClick={() => handleReject(selectedTicket._id || selectedTicket.id)}
                      className="rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-left text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                    >
                      Reject Ticket
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-500">
                {isLoading ? 'Loading tickets...' : 'No ticket selected.'}
              </p>
            )}
          </div>
        </aside>
      </section>
    </div>
  );
};

export default Queries;
