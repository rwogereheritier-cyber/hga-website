import { BASELINE, demoBookings, demoPayments, demoSubscribers } from '../data/demo';

const paidSum = (payments) => payments.filter((p) => p.status === 'Paid').reduce((s, p) => s + Number(p.amount), 0);
const uniqueClients = (bookings) => new Set(bookings.map((b) => b.email.toLowerCase())).size;

// Headline figures = the brief's baseline, adjusted by whatever changed since the demo seed.
export function headline({ bookings, payments, subscribers }) {
  return {
    bookings: BASELINE.bookings - demoBookings.length + bookings.length,
    revenue: BASELINE.revenue - paidSum(demoPayments) + paidSum(payments),
    clients: BASELINE.clients - uniqueClients(demoBookings) + uniqueClients(bookings),
    subscribers: BASELINE.subscribers - demoSubscribers.length + subscribers.length,
  };
}

export function clientsFrom(bookings) {
  const map = new Map();
  for (const b of bookings) {
    const key = b.email.toLowerCase();
    const c = map.get(key) || { name: b.name, email: b.email, phone: b.phone, country: b.country, bookings: [], first: b.createdAt };
    c.bookings.push(b);
    c.first = Math.min(c.first, b.createdAt);
    map.set(key, c);
  }
  return [...map.values()].sort((a, b) => b.first - a.first);
}

export function toCSV(rows, columns) {
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  return [columns.map((c) => esc(c.label)).join(','), ...rows.map((r) => columns.map((c) => esc(c.get(r))).join(','))].join('\n');
}

export function downloadFile(name, text, type = 'text/csv') {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export const fmtDateTime = (ms) =>
  new Date(ms).toLocaleString([], { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });
export const fmtDay = (ms) => new Date(ms).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
