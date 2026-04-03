import React from 'react';

const tickets = [
  { id: 'TCK-1001', message: 'Payment failed', category: 'Billing', priority: 'High', status: 'Pending' },
  { id: 'TCK-1002', message: 'App not loading', category: 'Technical', priority: 'Medium', status: 'Escalated' },
  { id: 'TCK-1003', message: 'Unable to login', category: 'Login', priority: 'Low', status: 'Resolved' },
  { id: 'TCK-1004', message: 'Invoice mismatch', category: 'Billing', priority: 'High', status: 'Pending' },
];

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

const Queries = () => {
  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Queries</h1>
        <p className="mt-1 text-sm text-slate-600">Review recent customer questions and ticket state.</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Ticket ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Message</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Priority</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {tickets.map((ticket) => (
                <tr key={ticket.id} className="cursor-pointer transition-colors hover:bg-slate-50">
                  <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-primary">{ticket.id}</td>
                  <td className="max-w-[220px] truncate px-4 py-3 text-sm text-slate-700">{ticket.message}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{ticket.category}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${priorityStyles[ticket.priority]}`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[ticket.status]}`}>
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
  );
};

export default Queries;
