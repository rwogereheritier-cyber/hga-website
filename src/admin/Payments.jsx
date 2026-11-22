import { useMemo, useState } from 'react';
import { money } from '../lib/format';
import { useStore } from '../lib/store';
import { downloadFile, fmtDateTime, toCSV } from './metrics';
import { AdminHeader, Btn, SearchInput, Stat, Status, Table, Tabs } from './ui';
import { td } from './styles';

export default function Payments() {
  const payments = useStore('payments');
  const [status, setStatus] = useState('All');
  const [q, setQ] = useState('');
  const sum = (s) => payments.filter((p) => p.status === s).reduce((t, p) => t + Number(p.amount), 0);
  const list = useMemo(
    () =>
      payments
        .filter((p) => status === 'All' || p.status === status)
        .filter((p) => !q.trim() || `${p.client} ${p.ref} ${p.service}`.toLowerCase().includes(q.trim().toLowerCase()))
        .sort((a, b) => b.date - a.date),
    [payments, status, q],
  );

  function exportCsv() {
    const csv = toCSV(list, [
      { label: 'Reference', get: (p) => p.ref },
      { label: 'Client', get: (p) => p.client },
      { label: 'Service', get: (p) => p.service },
      { label: 'Amount', get: (p) => p.amount },
      { label: 'Date', get: (p) => new Date(p.date).toISOString() },
      { label: 'Status', get: (p) => p.status },
      { label: 'Method', get: (p) => p.method },
    ]);
    downloadFile('hga-payments.csv', csv);
  }

  return (
    <div className="flex flex-col gap-8">
      <AdminHeader title="Payments" sub="Simulated transactions · no real money moves in the prototype">
        <Btn variant="ghost" onClick={exportCsv}>
          Export CSV
        </Btn>
      </AdminHeader>
      <div className="grid grid-cols-2 gap-8 border-b border-hairline pb-8 md:grid-cols-4">
        <Stat label="Paid" value={money(sum('Paid'))} accent />
        <Stat label="Pending" value={money(sum('Pending'))} />
        <Stat label="Refunded" value={money(sum('Refunded'))} />
        <Stat label="Transactions" value={payments.length} />
      </div>
      <div className="flex flex-wrap items-center gap-2.5">
        <Tabs options={['All', 'Paid', 'Pending', 'Refunded']} value={status} onChange={setStatus} label="Filter by status" />
        <SearchInput value={q} onChange={setQ} placeholder="Search payments" />
      </div>
      <Table
        columns={[{ key: 'r', label: 'Transaction' }, { key: 'c', label: 'Client' }, { key: 's', label: 'Service' }, { key: 'a', label: 'Amount' }, { key: 'd', label: 'Date' }, { key: 'm', label: 'Method' }, { key: 'st', label: 'Status' }]}
        empty={list.length ? null : 'No payments match these filters.'}
      >
        {list.map((p) => (
          <tr key={p.ref}>
            <td className={`${td} text-ink-muted`}>{p.ref}</td>
            <td className={`${td} font-medium`}>{p.client}</td>
            <td className={td}>{p.service}</td>
            <td className={td}>{money(p.amount)}</td>
            <td className={td}>{fmtDateTime(p.date)}</td>
            <td className={`${td} text-ink-muted`}>{p.method}</td>
            <td className={td}>
              <Status value={p.status} />
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
}
