import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { demoPayments, revenueHistory } from '../data/demo';
import { money } from '../lib/format';
import { useStore } from '../lib/store';
import { fmtDay, headline } from './metrics';
import { AdminHeader, Stat, Status, Table } from './ui';
import { td } from './styles';

const axis = { fontSize: 12, fill: '#6E6870' };
const NOV_BASE = 1920;

function ChartTip({ active, payload, label, format }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-hairline bg-white px-3 py-2 text-[13px] shadow-overlay">
      <div className="text-ink-muted">{label}</div>
      <div className="font-medium">{format(payload[0].value)}</div>
    </div>
  );
}

function ChartCard({ title, note, data, valueLabel, format, children }) {
  const [table, setTable] = useState(false);
  return (
    <section className="flex min-w-0 flex-col gap-4">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="text-[16px] font-medium">{title}</h2>
        <span className="flex items-center gap-4 text-[13px] text-ink-muted">
          {note}
          <button type="button" onClick={() => setTable(!table)} className="font-medium text-burgundy">
            {table ? 'Show chart' : 'Show table'}
          </button>
        </span>
      </div>
      {table ? (
        <Table columns={[{ key: 'k', label: 'Period' }, { key: 'v', label: valueLabel, align: 'right' }]} minWidth={280}>
          {data.map((d) => (
            <tr key={d.label}>
              <td className={td}>{d.label}</td>
              <td className={`${td} text-right`}>{format(d.value)}</td>
            </tr>
          ))}
        </Table>
      ) : (
        <div className="h-[220px]">{children}</div>
      )}
    </section>
  );
}

export default function Overview() {
  const bookings = useStore('bookings');
  const payments = useStore('payments');
  const subscribers = useStore('subscribers');
  const events = useStore('events');
  const registrations = useStore('registrations');
  const consultations = useStore('consultations');
  const h = headline({ bookings, payments, subscribers });
  const now = Date.now();
  const upcoming = events.filter((e) => new Date(e.start) >= now).sort((a, b) => new Date(a.start) - new Date(b.start));
  const name = (id) => consultations.find((c) => c.id === id)?.name || id;

  const revenue = useMemo(() => {
    // November = demo baseline, adjusted by payments added or refunded since the seed.
    const inNov = (list) =>
      list
        .filter((p) => p.status === 'Paid' && new Date(p.date).getMonth() === 10 && new Date(p.date).getFullYear() === 2026)
        .reduce((s, p) => s + Number(p.amount), 0);
    const nov = NOV_BASE - inNov(demoPayments) + inNov(payments);
    return [...revenueHistory, { month: 'Nov', value: Math.round(nov) }].map((r) => ({ label: r.month, value: r.value }));
  }, [payments]);

  const activity = useMemo(() => {
    const week = 7 * 86400000;
    const end = Math.max(now, ...bookings.map((b) => b.createdAt));
    return Array.from({ length: 8 }, (_, i) => {
      const to = end - (7 - i) * week;
      const from = to - week;
      return {
        label: new Date(to).toLocaleDateString([], { day: 'numeric', month: 'short' }),
        value: bookings.filter((b) => b.createdAt > from && b.createdAt <= to).length,
      };
    });
  }, [bookings, now]);

  const recent = [...bookings].sort((a, b) => b.createdAt - a.createdAt).slice(0, 6);

  return (
    <div className="flex flex-col gap-12">
      <AdminHeader title="Good day, Hetty" sub={`${new Date().toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' })} · demo data`} />

      <div className="grid grid-cols-2 gap-8 border-b border-hairline pb-10 sm:grid-cols-3 xl:grid-cols-5">
        <Stat label="Total bookings" value={h.bookings.toLocaleString()} />
        <Stat label="Total revenue" value={money(h.revenue)} accent />
        <Stat label="Registered clients" value={h.clients.toLocaleString()} />
        <Stat label="Upcoming events" value={upcoming.length} />
        <Stat label="Newsletter subscribers" value={h.subscribers.toLocaleString()} />
      </div>

      <div className="grid gap-12 xl:grid-cols-2">
        <ChartCard title="Revenue" note="Last 6 months" data={revenue} valueLabel="Revenue" format={money}>
          <ResponsiveContainer>
            <BarChart data={revenue} margin={{ top: 8, right: 0, left: 0, bottom: 0 }} barCategoryGap="28%">
              <CartesianGrid vertical={false} stroke="#F2EFEB" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={axis} />
              <YAxis tickLine={false} axisLine={false} tick={axis} width={48} tickFormatter={(v) => money(v)} />
              <Tooltip cursor={{ fill: '#F6F5F3' }} content={<ChartTip format={money} />} />
              <Bar dataKey="value" fill="#6B142B" radius={[4, 4, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Booking activity" note="New bookings per week" data={activity} valueLabel="Bookings" format={(v) => `${v} booking${v === 1 ? '' : 's'}`}>
          <ResponsiveContainer>
            <LineChart data={activity} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#F2EFEB" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={axis} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={axis} width={32} />
              <Tooltip cursor={{ stroke: '#C9C3BE' }} content={<ChartTip format={(v) => `${v} booking${v === 1 ? '' : 's'}`} />} />
              <Line type="linear" isAnimationActive={false} dataKey="value" stroke="#6B142B" strokeWidth={2} dot={{ r: 4, fill: '#6B142B', stroke: '#fff', strokeWidth: 2 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid gap-12 xl:grid-cols-[1.6fr_1fr]">
        <section className="flex min-w-0 flex-col gap-3">
          <div className="flex items-baseline justify-between">
            <h2 className="text-[16px] font-medium">Recent bookings</h2>
            <Link to="/admin/bookings" className="text-[13px] font-medium text-burgundy">
              View all ›
            </Link>
          </div>
          <Table columns={[{ key: 'c', label: 'Client' }, { key: 's', label: 'Service' }, { key: 'd', label: 'Session' }, { key: 'a', label: 'Amount' }, { key: 'st', label: 'Status' }]} minWidth={600}>
            {recent.map((b) => (
              <tr key={b.ref}>
                <td className={`${td} font-medium`}>{b.name}</td>
                <td className={td}>{name(b.serviceId)}</td>
                <td className={td}>{fmtDay(b.start)}</td>
                <td className={td}>{money(b.amount)}</td>
                <td className={td}>
                  <Status value={b.status} />
                </td>
              </tr>
            ))}
          </Table>
        </section>

        <div className="flex min-w-0 flex-col gap-10">
          <section className="flex flex-col">
            <h2 className="mb-3 text-[16px] font-medium">Upcoming events</h2>
            {upcoming.slice(0, 4).map((e) => (
              <Link key={e.id} to="/admin/events" className="flex justify-between gap-3 border-t border-hairline py-3.5 text-[14px] last:border-b hover:text-burgundy">
                <span>{e.title}</span>
                <span className="shrink-0 text-ink-muted">
                  {fmtDay(new Date(e.start).getTime())} · {e.registered}/{e.capacity}
                </span>
              </Link>
            ))}
          </section>
          <section className="flex flex-col">
            <h2 className="mb-3 text-[16px] font-medium">Recent registrations</h2>
            {registrations.length === 0 ? (
              <p className="border-t border-hairline py-3.5 text-[14px] text-ink-muted">No registrations yet. They appear here when someone registers for an event.</p>
            ) : (
              registrations.slice(0, 4).map((r) => (
                <div key={r.ref} className="flex justify-between gap-3 border-t border-hairline py-3.5 text-[14px] last:border-b">
                  <span>{r.name}</span>
                  <span className="truncate text-ink-muted">{r.eventTitle}</span>
                </div>
              ))
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
