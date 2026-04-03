import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { acceptTicket, createTicket, getTickets, updateTicket } from '../../services/api';
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

const surfaceCardClass =
  'relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 p-4 shadow-[0_16px_40px_-26px_rgba(15,23,42,0.45)] backdrop-blur sm:p-5';

const fieldClass =
  'w-full rounded-xl border border-slate-200 bg-white/90 px-3.5 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100/70';

const labelClass = 'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500';

const Queries = () => {
  const { user } = useAuth();
  const companyUuid = user?.company?.uuid || user?.companyUuid || '';
  const [tickets, setTickets] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Newest');
  const [selectedId, setSelectedId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [pendingAcceptId, setPendingAcceptId] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newTicketForm, setNewTicketForm] = useState({
    apiKey: '',
    message: '',
    category: 'billing',
    priority: 'medium',
  });

  useEffect(() => {
    if (companyUuid) {
      setNewTicketForm((previous) =>
        previous.apiKey === '' ? { ...previous, apiKey: companyUuid } : previous
      );
    }
  }, [companyUuid]);

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
  }, [tickets, searchText, statusFilter, priorityFilter, categoryFilter, sortBy]);

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
    try {
      setPendingAcceptId(ticketId);
      const accepted = await acceptTicket(ticketId);
      updateTicketState(ticketId, accepted || { status: 'assigned' });
      toast.success('Ticket accepted and moved to My Chats.');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to accept ticket.');
    } finally {
      setPendingAcceptId('');
    }
  };

  const handleReject = async (ticketId) => {
    try {
      const updated = await updateTicket(ticketId, { status: 'escalated' });
      updateTicketState(ticketId, updated || { status: 'escalated' });
      toast.success('Ticket rejected.');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to reject ticket.');
    }
  };

  const handleCreateTicket = async (event) => {
    event.preventDefault();
    const message = newTicketForm.message.trim();
    if (!message) {
      toast.error('Enter a message to raise a test ticket.');
      return;
    }
    const apiKey = newTicketForm.apiKey.trim();
    if (!apiKey) {
      toast.error('Enter a company API key (UUID).');
      return;
    }
    try {
      setIsCreating(true);
      const created = await createTicket({
        apiKey,
        message,
        category: newTicketForm.category,
        priority: newTicketForm.priority,
        customerName: 'Test Customer',
      });
      setNewTicketForm((previous) => ({ ...previous, message: '' }));

      const result = await getTickets();
      const list = Array.isArray(result) ? result : [];
      setTickets(list);

      const createdId = created?._id ?? created?.id;
      const idStr = createdId != null ? String(createdId) : '';
      const inList = idStr && list.some((t) => String(t._id ?? t.id) === idStr);
      if (inList) {
        setSelectedId(createdId);
      } else if (list.length > 0) {
        setSelectedId(list[0]._id || list[0].id || '');
      } else {
        setSelectedId('');
      }

      const myCompanyId = user?.companyId;
      const raisedForOther =
        created != null
        && myCompanyId != null
        && Number(created.companyId) !== Number(myCompanyId);
      if (raisedForOther) {
        toast.success(
          'Ticket raised for that company. It is not shown here because this list is only for your organization.',
        );
      } else {
        toast.success('Test ticket raised.');
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to raise test ticket.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="rounded-[30px] bg-[linear-gradient(140deg,rgba(125,211,252,0.45),rgba(191,219,254,0.32),rgba(226,232,240,0.6))] p-[1px]">
      <div className="space-y-5 rounded-[29px] bg-slate-50/80 p-3 sm:p-4 lg:p-5">
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
          <form
            onSubmit={handleCreateTicket}
            className={surfaceCardClass}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-16 -top-20 h-44 w-44 rounded-full bg-blue-100/70 blur-3xl"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500"
            />
            <p className="relative text-sm font-semibold tracking-wide text-slate-800">Raise Test Ticket</p>
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-4">
              <label className="md:col-span-2">
                <span className={labelClass}>
                  Company API Key (UUID)
                </span>
                <input
                  value={newTicketForm.apiKey}
                  onChange={(event) =>
                    setNewTicketForm((previous) => ({ ...previous, apiKey: event.target.value }))
                  }
                  placeholder="Company UUID"
                  className={fieldClass}
                />
              </label>
              <label className="md:col-span-2">
                <span className={labelClass}>
                  Message
                </span>
                <input
                  value={newTicketForm.message}
                  onChange={(event) =>
                    setNewTicketForm((previous) => ({ ...previous, message: event.target.value }))
                  }
                  placeholder="Enter a test issue..."
                  className={fieldClass}
                />
              </label>
              <label>
                <span className={labelClass}>
                  Category
                </span>
                <select
                  value={newTicketForm.category}
                  onChange={(event) =>
                    setNewTicketForm((previous) => ({ ...previous, category: event.target.value }))
                  }
                  className={`${fieldClass} pr-9`}
                >
                  <option value="billing">Billing</option>
                  <option value="technical">Technical</option>
                  <option value="login">Login</option>
                  <option value="other">Other</option>
                </select>
              </label>
              <label>
                <span className={labelClass}>
                  Priority
                </span>
                <select
                  value={newTicketForm.priority}
                  onChange={(event) =>
                    setNewTicketForm((previous) => ({ ...previous, priority: event.target.value }))
                  }
                  className={`${fieldClass} pr-9`}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </label>
            </div>
            <button
              type="submit"
              disabled={isCreating}
              className="mt-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_14px_24px_-16px_rgba(37,99,235,0.8)] transition hover:from-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isCreating ? 'Raising...' : 'Raise Test Ticket'}
            </button>
          </form>

          <div className={surfaceCardClass}>
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200"
            />
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
              <label className="xl:col-span-2">
                <span className={labelClass}>
                  Search
                </span>
                <input
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                  placeholder="Ticket ID, customer, message..."
                  className={fieldClass}
                />
              </label>

              <label>
                <span className={labelClass}>
                  Status
                </span>
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className={`${fieldClass} pr-9`}
                >
                  <option>All</option>
                  <option>Pending</option>
                  <option>Assigned</option>
                  <option>Escalated</option>
                  <option>Resolved</option>
                </select>
              </label>

              <label>
                <span className={labelClass}>
                  Priority
                </span>
                <select
                  value={priorityFilter}
                  onChange={(event) => setPriorityFilter(event.target.value)}
                  className={`${fieldClass} pr-9`}
                >
                  <option>All</option>
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </label>

              <label>
                <span className={labelClass}>
                  Category
                </span>
                <select
                  value={categoryFilter}
                  onChange={(event) => setCategoryFilter(event.target.value)}
                  className={`${fieldClass} pr-9`}
                >
                  <option>All</option>
                  <option>Billing</option>
                  <option>Technical</option>
                  <option>Login</option>
                </select>
              </label>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-slate-100/70 px-3 py-2.5">
              <p className="text-xs text-slate-500">
                Showing <span className="font-semibold text-slate-700">{filteredTickets.length}</span>{' '}
                result{filteredTickets.length === 1 ? '' : 's'}
              </p>
              <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Sort
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                >
                  <option>Newest</option>
                  <option>Priority</option>
                </select>
              </label>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 shadow-[0_16px_40px_-26px_rgba(15,23,42,0.45)]">
            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-100/75 backdrop-blur">
                  <tr>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Ticket
                    </th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Category
                    </th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Priority
                    </th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredTickets.map((ticket) => (
                    <tr
                      key={ticket._id || ticket.id}
                      onClick={() => setSelectedId(ticket._id || ticket.id)}
                      className={`cursor-pointer transition duration-200 ${
                        (selectedTicket?._id || selectedTicket?.id) === (ticket._id || ticket.id)
                          ? 'bg-blue-50/80 shadow-[inset_3px_0_0_0_rgb(37_99_235)]'
                          : 'hover:bg-slate-50/90'
                      }`}
                    >
                      <td className="px-5 py-4 align-top">
                        <p className="text-sm font-semibold text-blue-700">
                          {ticket.ticketCode || ticket._id || ticket.id}
                        </p>
                        <p className="mt-1.5 max-w-[280px] truncate text-xs text-slate-600">
                          {ticket.message}
                        </p>
                        <p className="mt-1.5 text-xs text-slate-400">{ticket.customerName || '-'}</p>
                      </td>
                      <td className="px-5 py-4 align-top">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            categoryStyles[ticket.category] || 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {formatLabel(ticket.category)}
                        </span>
                      </td>
                      <td className="px-5 py-4 align-top">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            priorityStyles[ticket.priority] || 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {formatLabel(ticket.priority)}
                        </span>
                      </td>
                      <td className="px-5 py-4 align-top">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            statusStyles[ticket.status] || 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {formatLabel(ticket.status)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600">
                        {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 bg-slate-50/45 p-3 md:hidden">
              {filteredTickets.map((ticket) => (
                <button
                  key={ticket._id || ticket.id}
                  type="button"
                  onClick={() => setSelectedId(ticket._id || ticket.id)}
                  className={`w-full rounded-2xl border p-3 text-left shadow-sm transition ${
                    (selectedTicket?._id || selectedTicket?.id) === (ticket._id || ticket.id)
                      ? 'border-blue-300 bg-blue-50 ring-2 ring-blue-100'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-blue-700">
                      {ticket.ticketCode || ticket._id || ticket.id}
                    </p>
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-[10px] font-semibold ${
                        statusStyles[ticket.status] || 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {formatLabel(ticket.status)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{ticket.customerName || '-'}</p>
                  <p className="mt-2 text-sm text-slate-700">{ticket.message}</p>
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
              <div className="grid h-36 place-items-center bg-white text-sm text-slate-500">
                No tickets match your filters.
              </div>
            )}
          </div>
        </div>

        <aside className="xl:col-span-4">
          <div className={`${surfaceCardClass} xl:sticky xl:top-5`}>
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500/80 via-indigo-500/80 to-cyan-500/80"
            />
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Ticket Details
            </h2>

            {selectedTicket ? (
              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-lg font-semibold text-slate-900">
                    {selectedTicket.ticketCode || selectedTicket._id || selectedTicket.id}
                  </p>
                  <p className="text-sm text-slate-500">{selectedTicket.customerName || '-'}</p>
                </div>

                <p className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm leading-relaxed text-slate-700">
                  {selectedTicket.message}
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-xl border border-slate-200 bg-white p-2.5">
                    <p className="text-slate-400">Category</p>
                    <p className="mt-1 font-semibold text-slate-700">
                      {formatLabel(selectedTicket.category)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-2.5">
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
                      disabled={pendingAcceptId === (selectedTicket._id || selectedTicket.id)}
                      onClick={() => handleAccept(selectedTicket._id || selectedTicket.id)}
                      className="rounded-xl border border-blue-300 bg-blue-50 px-3 py-2.5 text-left text-xs font-semibold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {pendingAcceptId === (selectedTicket._id || selectedTicket.id)
                        ? 'Accepting...'
                        : 'Accept Ticket'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReject(selectedTicket._id || selectedTicket.id)}
                      className="rounded-xl border border-rose-300 bg-rose-50 px-3 py-2.5 text-left text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
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
    </div>
  );
};

export default Queries;
