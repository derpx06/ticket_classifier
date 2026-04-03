import React, { useMemo, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

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

  const tickets = useMemo(
    () => [
      {
        id: 'TCK-1001',
        message: 'Payment failed',
        category: 'Billing',
        priority: 'High',
        status: 'Pending',
        customer: 'Aisha Khan',
        createdAt: '2026-04-01',
        firstResponseMinutes: 6,
        resolutionHours: null,
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
        createdAt: '2026-04-02',
        firstResponseMinutes: 11,
        resolutionHours: null,
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
        createdAt: '2026-03-31',
        firstResponseMinutes: 4,
        resolutionHours: 1.8,
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
        createdAt: '2026-04-03',
        firstResponseMinutes: 9,
        resolutionHours: null,
        chat: [
          { sender: 'user', text: 'The charged amount differs from my invoice.' },
          { sender: 'bot', text: 'I am reviewing your billing timeline now.' },
        ],
      },
      {
        id: 'TCK-1005',
        message: 'MFA code not arriving',
        category: 'Login',
        priority: 'Medium',
        status: 'Resolved',
        customer: 'Neha P.',
        createdAt: '2026-04-03',
        firstResponseMinutes: 5,
        resolutionHours: 2.2,
        chat: [
          { sender: 'user', text: 'The verification email is not coming through.' },
          { sender: 'bot', text: 'I synced your authentication channel and resent the code.' },
        ],
      },
      {
        id: 'TCK-1006',
        message: 'Refund not reflected',
        category: 'Billing',
        priority: 'High',
        status: 'Escalated',
        customer: 'Rohan S.',
        createdAt: '2026-04-03',
        firstResponseMinutes: 12,
        resolutionHours: null,
        chat: [
          { sender: 'user', text: 'I still do not see my refund after five days.' },
          { sender: 'bot', text: 'I am escalating this to billing operations right away.' },
        ],
      },
    ],
    []
  );

  const [selectedTicketId, setSelectedTicketId] = useState(tickets[0]?.id || '');
  const selectedTicket = tickets.find((ticket) => ticket.id === selectedTicketId) || null;

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

  const adminAnalytics = useMemo(() => {
    const total = tickets.length;
    const statusCount = tickets.reduce(
      (acc, ticket) => {
        acc[ticket.status] = (acc[ticket.status] || 0) + 1;
        return acc;
      },
      { Pending: 0, Resolved: 0, Escalated: 0 }
    );

    const categoryCount = tickets.reduce((acc, ticket) => {
      acc[ticket.category] = (acc[ticket.category] || 0) + 1;
      return acc;
    }, {});

    const responseValues = tickets.map((ticket) => ticket.firstResponseMinutes);
    const avgFirstResponse = responseValues.length
      ? Math.round(responseValues.reduce((sum, value) => sum + value, 0) / responseValues.length)
      : 0;

    const resolvedTickets = tickets.filter((ticket) => ticket.status === 'Resolved');
    const avgResolutionHours = resolvedTickets.length
      ? (
          resolvedTickets.reduce(
            (sum, ticket) => sum + (typeof ticket.resolutionHours === 'number' ? ticket.resolutionHours : 0),
            0
          ) / resolvedTickets.length
        ).toFixed(1)
      : '0.0';

    const resolutionRate = total ? Math.round((statusCount.Resolved / total) * 100) : 0;
    const escalationRate = total ? Math.round((statusCount.Escalated / total) * 100) : 0;
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
    const urgentTickets = tickets.filter(
      (ticket) => ticket.priority === 'High' && ticket.status !== 'Resolved'
    );
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
              {adminAnalytics.statusCount.Pending}
            </p>
          </article>
          <article className="rounded-xl border border-rose-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-rose-700">Escalated</p>
            <p className="mt-2 text-3xl font-bold text-rose-700">
              {adminAnalytics.statusCount.Escalated}
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
                    key={ticket.id}
                    className={`rounded-md border border-rose-200 bg-white p-2 text-sm ${
                      selectedTicketId === ticket.id ? 'ring-2 ring-rose-300' : ''
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedTicketId(ticket.id)}
                      className="w-full text-left"
                    >
                      <p className="font-semibold text-rose-700">{ticket.id}</p>
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
                  <p className="text-sm font-semibold text-blue-700">{selectedTicket.id}</p>
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
