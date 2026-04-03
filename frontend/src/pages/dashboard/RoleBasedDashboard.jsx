import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { getTickets } from '../../services/api';

const formatLabel = (value = '') => {
  if (!value) return 'Unknown';
  return value.charAt(0).toUpperCase() + value.slice(1);
};

const toDateKey = (dateObj) => {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const toWeekdayLabel = (dateKey) =>
  new Date(`${dateKey}T00:00:00`).toLocaleDateString('en-US', { weekday: 'short' });

const RoleBasedDashboard = () => {
  const { role } = useAuth();
  const normalizedRole = typeof role === 'string' ? role.toLowerCase() : '';
  const isAdmin = normalizedRole === 'admin';

  const [tickets, setTickets] = useState([]);
  const [selectedTicketId, setSelectedTicketId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const selectedTicket =
    tickets.find((ticket) => (ticket._id || ticket.id) === selectedTicketId) || null;

  const priorityStyles = {
    high: 'bg-red-100 text-red-700',
    medium: 'bg-orange-100 text-orange-700',
    low: 'bg-green-100 text-green-700',
    critical: 'bg-red-200 text-red-800',
  };

  const statusStyles = {
    assigned: 'bg-blue-100 text-blue-700',
    pending: 'bg-amber-100 text-amber-700',
    resolved: 'bg-emerald-100 text-emerald-700',
    escalated: 'bg-rose-100 text-rose-700',
  };

  useEffect(() => {
    const loadTickets = async () => {
      try {
        setIsLoading(true);
        const result = await getTickets();
        const list = Array.isArray(result) ? result : [];
        setTickets(list);
        if (list.length > 0) {
          setSelectedTicketId(list[0]._id || list[0].id || '');
        }
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Failed to load dashboard tickets.');
      } finally {
        setIsLoading(false);
      }
    };

    loadTickets();
  }, []);

  const statCards = useMemo(() => {
    const assigned = tickets.filter((ticket) => ticket.status === 'assigned').length;
    const pending = tickets.filter((ticket) => ticket.status === 'pending').length;
    const resolved = tickets.filter((ticket) => ticket.status === 'resolved').length;
    const escalated = tickets.filter((ticket) => ticket.status === 'escalated').length;

    return [
      { label: 'Assigned Tickets', value: assigned, subtitle: 'Tickets assigned to you' },
      { label: 'Pending Tickets', value: pending, subtitle: 'Awaiting response' },
      { label: 'Resolved Tickets', value: resolved, subtitle: 'Handled successfully' },
      { label: 'Escalated Tickets', value: escalated, subtitle: 'Forwarded to higher team' },
    ];
  }, [tickets]);

  const recentTickets = useMemo(() => {
    return [...tickets]
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 5);
  }, [tickets]);

  const adminAnalytics = useMemo(() => {
    const total = tickets.length;
    const statusCount = tickets.reduce(
      (acc, ticket) => {
        const status = typeof ticket.status === 'string' ? ticket.status.toLowerCase() : '';
        if (status) acc[status] = (acc[status] || 0) + 1;
        return acc;
      },
      { pending: 0, resolved: 0, escalated: 0 }
    );

    const categoryCount = tickets.reduce((acc, ticket) => {
      acc[ticket.category] = (acc[ticket.category] || 0) + 1;
      return acc;
    }, {});

    const responseValues = tickets.map((ticket) => ticket.firstResponseMinutes);
    const avgFirstResponse = responseValues.length
      ? Math.round(responseValues.reduce((sum, value) => sum + value, 0) / responseValues.length)
      : 0;

    const resolvedTickets = tickets.filter(
      (ticket) => typeof ticket.status === 'string' && ticket.status.toLowerCase() === 'resolved'
    );
    const avgResolutionHours = resolvedTickets.length
      ? (
          resolvedTickets.reduce(
            (sum, ticket) => sum + (typeof ticket.resolutionHours === 'number' ? ticket.resolutionHours : 0),
            0
          ) / resolvedTickets.length
        ).toFixed(1)
      : '0.0';

    const resolutionRate = total ? Math.round((statusCount.resolved / total) * 100) : 0;
    const escalationRate = total ? Math.round((statusCount.escalated / total) * 100) : 0;
    const slaBreached = tickets.filter((ticket) => ticket.firstResponseMinutes > 10).length;
    const slaCompliance = total ? Math.round(((total - slaBreached) / total) * 100) : 0;

    const dailyTrendMap = tickets.reduce((acc, ticket) => {
      acc[ticket.createdAt] = (acc[ticket.createdAt] || 0) + 1;
      return acc;
    }, {});

    const dailyTrend = Object.entries(dailyTrendMap)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .map(([date, count]) => ({ date, count }));

    const highestDay = dailyTrend.reduce(
      (best, day) => (day.count > best.count ? day : best),
      dailyTrend[0] || { date: '-', count: 0 }
    );

    const latestDate = tickets
      .map((ticket) => ticket.createdAt)
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
      .at(-1);

    const weeklyWindow = latestDate
      ? Array.from({ length: 7 }, (_, index) => {
          const date = new Date(`${latestDate}T00:00:00`);
          date.setDate(date.getDate() - (6 - index));
          return toDateKey(date);
        })
      : [];

    const weeklyResponseResolution = weeklyWindow.map((dateKey) => {
      const dayTickets = tickets.filter((ticket) => ticket.createdAt === dateKey);
      const resolvedDayTickets = dayTickets.filter(
        (ticket) => typeof ticket.resolutionHours === 'number'
      );

      const avgResponseMinutes = dayTickets.length
        ? Number(
            (
              dayTickets.reduce((sum, ticket) => sum + ticket.firstResponseMinutes, 0) /
              dayTickets.length
            ).toFixed(1)
          )
        : null;

      const avgResolutionMinutes = resolvedDayTickets.length
        ? Number(
            (
              (resolvedDayTickets.reduce((sum, ticket) => sum + ticket.resolutionHours, 0) * 60) /
              resolvedDayTickets.length
            ).toFixed(1)
          )
        : null;

      return {
        date: dateKey,
        day: toWeekdayLabel(dateKey),
        avgResponseMinutes,
        avgResolutionMinutes,
      };
    });

    return {
      total,
      statusCount,
      categoryCount,
      avgFirstResponse,
      avgResolutionHours,
      resolutionRate,
      escalationRate,
      slaCompliance,
      dailyTrend,
      highestDay,
      weeklyResponseResolution,
    };
  }, [tickets]);

  if (isAdmin) {
    const maxDailyCount = Math.max(...adminAnalytics.dailyTrend.map((item) => item.count), 1);
    const maxCategoryCount = Math.max(...Object.values(adminAnalytics.categoryCount), 1);
    const urgentTickets = tickets.filter((ticket) => {
      const priority = typeof ticket.priority === 'string' ? ticket.priority.toLowerCase() : '';
      const isUrgent = priority === 'high' || priority === 'critical';
      return isUrgent && ticket.status?.toLowerCase() !== 'resolved';
    });
    const chartWidth = 720;
    const chartHeight = 300;
    const chartPadding = { top: 22, right: 24, bottom: 44, left: 48 };
    const plotWidth = chartWidth - chartPadding.left - chartPadding.right;
    const plotHeight = chartHeight - chartPadding.top - chartPadding.bottom;
    const weeklySeries = adminAnalytics.weeklyResponseResolution;
    const weeklyMaxMetric = Math.max(
      ...weeklySeries.flatMap((point) => [
        point.avgResponseMinutes ?? 0,
        point.avgResolutionMinutes ?? 0,
      ]),
      1
    );
    const xStep = weeklySeries.length > 1 ? plotWidth / (weeklySeries.length - 1) : 0;
    const toX = (index) => chartPadding.left + index * xStep;
    const toY = (value) => chartPadding.top + (1 - value / weeklyMaxMetric) * plotHeight;
    const buildLinePath = (key) => {
      let path = '';
      let isSegmentOpen = false;

      weeklySeries.forEach((point, index) => {
        const value = point[key];
        if (typeof value !== 'number') {
          isSegmentOpen = false;
          return;
        }

        path += `${isSegmentOpen ? ' L ' : ' M '}${toX(index)} ${toY(value)}`;
        isSegmentOpen = true;
      });

      return path.trim();
    };
    const responsePath = buildLinePath('avgResponseMinutes');
    const resolutionPath = buildLinePath('avgResolutionMinutes');
    const yAxisTicks = [1, 0.75, 0.5, 0.25, 0].map((ratio) =>
      Math.round(weeklyMaxMetric * ratio)
    );

    return (
      <div className="space-y-5 font-sans">
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-900 p-6 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-200">
              Administrator
            </p>
            <h1 className="mt-2 text-2xl font-semibold">Operations Analytics Dashboard</h1>
            <p className="mt-1 text-sm text-slate-200">
              Real-time health insights for support queues, SLA performance, and ticket risk.
            </p>
          </div>
        </div>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Total Tickets
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{adminAnalytics.total}</p>
          </article>
          <article className="rounded-xl border border-amber-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Pending</p>
              <p className="mt-2 text-3xl font-bold text-amber-700">
              {adminAnalytics.statusCount.pending}
            </p>
          </article>
          <article className="rounded-xl border border-rose-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-rose-700">Escalated</p>
              <p className="mt-2 text-3xl font-bold text-rose-700">
              {adminAnalytics.statusCount.escalated}
            </p>
          </article>
          <article className="rounded-xl border border-emerald-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
              Resolution Rate
            </p>
            <p className="mt-2 text-3xl font-bold text-emerald-700">
              {adminAnalytics.resolutionRate}%
            </p>
          </article>
          <article className="rounded-xl border border-blue-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
              SLA Compliance
            </p>
            <p className="mt-2 text-3xl font-bold text-blue-700">{adminAnalytics.slaCompliance}%</p>
          </article>
        </section>

        <section className="grid grid-cols-1 gap-5 xl:grid-cols-10">
          <div className="space-y-5 xl:col-span-7">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Average Response & Resolution Time
                  </h2>
                  <p className="text-xs text-slate-500">
                    Weekly trend of first reply vs resolution duration (minutes)
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-600">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                    Response
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
                    Resolution
                  </span>
                </div>
              </div>

              <div className="mt-4 overflow-x-auto">
                <svg
                  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                  className="h-64 w-full min-w-[640px]"
                  role="img"
                  aria-label="Average response and resolution time by weekday"
                >
                  {yAxisTicks.map((tick) => {
                    const y = toY(tick);
                    return (
                      <g key={`grid-${tick}`}>
                        <line
                          x1={chartPadding.left}
                          y1={y}
                          x2={chartWidth - chartPadding.right}
                          y2={y}
                          stroke="#e2e8f0"
                          strokeDasharray="3 5"
                        />
                        <text x={chartPadding.left - 10} y={y + 4} textAnchor="end" className="fill-slate-400 text-[11px]">
                          {tick}
                        </text>
                      </g>
                    );
                  })}

                  <line
                    x1={chartPadding.left}
                    y1={chartPadding.top}
                    x2={chartPadding.left}
                    y2={chartHeight - chartPadding.bottom}
                    stroke="#cbd5e1"
                  />
                  <line
                    x1={chartPadding.left}
                    y1={chartHeight - chartPadding.bottom}
                    x2={chartWidth - chartPadding.right}
                    y2={chartHeight - chartPadding.bottom}
                    stroke="#cbd5e1"
                  />

                  {responsePath && (
                    <path
                      d={responsePath}
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  )}
                  {resolutionPath && (
                    <path
                      d={resolutionPath}
                      fill="none"
                      stroke="#16a34a"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  )}

                  {weeklySeries.map((point, index) =>
                    typeof point.avgResponseMinutes === 'number' ? (
                      <circle
                        key={`response-dot-${point.date}`}
                        cx={toX(index)}
                        cy={toY(point.avgResponseMinutes)}
                        r="4"
                        fill="#2563eb"
                      />
                    ) : null
                  )}
                  {weeklySeries.map((point, index) =>
                    typeof point.avgResolutionMinutes === 'number' ? (
                      <circle
                        key={`resolution-dot-${point.date}`}
                        cx={toX(index)}
                        cy={toY(point.avgResolutionMinutes)}
                        r="4"
                        fill="#16a34a"
                      />
                    ) : null
                  )}

                  {weeklySeries.map((point, index) => (
                    <text
                      key={`x-label-${point.date}`}
                      x={toX(index)}
                      y={chartHeight - 16}
                      textAnchor="middle"
                      className="fill-slate-500 text-[11px]"
                    >
                      {point.day}
                    </text>
                  ))}
                </svg>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Ticket Volume Trend</h2>
                <p className="text-xs text-slate-500">
                  Peak: {adminAnalytics.highestDay.date} ({adminAnalytics.highestDay.count})
                </p>
              </div>
              <div className="mt-4 space-y-3">
                {adminAnalytics.dailyTrend.map((item) => (
                  <div key={item.date} className="grid grid-cols-[90px_1fr_40px] items-center gap-3">
                    <p className="text-xs font-medium text-slate-500">{item.date.slice(5)}</p>
                    <div className="h-2 rounded-full bg-slate-100">
                      <div
                        className="h-2 rounded-full bg-blue-600"
                        style={{ width: `${Math.max((item.count / maxDailyCount) * 100, 8)}%` }}
                      />
                    </div>
                    <p className="text-right text-xs font-semibold text-slate-700">{item.count}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Category Distribution</h2>
              <div className="mt-4 space-y-3">
                {Object.entries(adminAnalytics.categoryCount).map(([category, count]) => (
                  <div key={category} className="grid grid-cols-[110px_1fr_40px] items-center gap-3">
                    <p className="text-xs font-medium text-slate-600">{category}</p>
                    <div className="h-2 rounded-full bg-slate-100">
                      <div
                        className={`h-2 rounded-full ${
                          category === 'Billing'
                            ? 'bg-indigo-500'
                            : category === 'Technical'
                              ? 'bg-cyan-500'
                              : 'bg-violet-500'
                        }`}
                        style={{ width: `${Math.max((count / maxCategoryCount) * 100, 8)}%` }}
                      />
                    </div>
                    <p className="text-right text-xs font-semibold text-slate-700">{count}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-5 xl:col-span-3">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Performance Snapshot</h2>
              <div className="mt-4 space-y-3">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Avg First Response</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">
                    {adminAnalytics.avgFirstResponse} mins
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Avg Resolution Time</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">
                    {adminAnalytics.avgResolutionHours} hrs
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Escalation Rate</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">
                    {adminAnalytics.escalationRate}%
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-rose-200 bg-rose-50 p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-rose-700">Urgent Queue</h2>
              <p className="mt-1 text-sm text-rose-700">
                High-priority unresolved tickets: {urgentTickets.length}
              </p>
              <ul className="mt-3 space-y-2">
                {urgentTickets.map((ticket) => (
                  <li
                    key={ticket._id || ticket.id}
                    className={`rounded-md border border-rose-200 bg-white p-2 text-sm ${
                      selectedTicketId === (ticket._id || ticket.id) ? 'ring-2 ring-rose-300' : ''
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedTicketId(ticket._id || ticket.id)}
                      className="w-full text-left"
                    >
                      <p className="font-semibold text-rose-700">
                        {ticket.ticketCode || ticket._id || ticket.id}
                      </p>
                      <p className="truncate text-xs text-slate-600">{ticket.message}</p>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Focused Ticket</h2>
              {selectedTicket ? (
                <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-sm font-semibold text-blue-700">
                    {selectedTicket.ticketCode || selectedTicket._id || selectedTicket.id}
                  </p>
                  <p className="mt-1 text-sm text-slate-700">{selectedTicket.message}</p>
                  <p className="mt-2 text-xs text-slate-500">{selectedTicket.customer}</p>
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-500">No ticket selected.</p>
              )}
            </div>
          </aside>
        </section>
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
                  {recentTickets.map((ticket) => (
                    <tr
                      key={ticket._id || ticket.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedTicketId(ticket._id || ticket.id)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          setSelectedTicketId(ticket._id || ticket.id);
                        }
                      }}
                      className={`cursor-pointer transition-colors hover:bg-blue-50 ${
                        selectedTicketId === (ticket._id || ticket.id) ? 'bg-blue-50/70' : ''
                      }`}
                    >
                      <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-blue-700">
                        {ticket.ticketCode || ticket._id || ticket.id}
                      </td>
                      <td className="max-w-[220px] truncate px-4 py-3 text-sm text-slate-700">
                        {ticket.message}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">{formatLabel(ticket.category)}</td>
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
                <p className="text-sm font-semibold text-blue-800">
                  Pending Tickets: {statCards[1].value}
                </p>
                <p className="mt-1 text-sm text-blue-700">
                  {isLoading
                    ? 'Loading tickets...'
                    : `You have ${statCards[1].value} tickets awaiting response`}
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
