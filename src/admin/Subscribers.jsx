import { useState } from 'react';
import { BASELINE, demoSubscribers } from '../data/demo';
import { removeItem, useStore } from '../lib/store';
import { toast } from '../lib/toast';
import { downloadFile, fmtDay, toCSV } from './metrics';
import { AdminHeader, Btn, SearchInput, Table } from './ui';
import { td } from './styles';

export default function Subscribers() {
  const subscribers = useStore('subscribers');
  const [q, setQ] = useState('');
  const list = subscribers.filter((s) => !q.trim() || `${s.name || ''} ${s.email}`.toLowerCase().includes(q.trim().toLowerCase()));
  const total = BASELINE.subscribers - demoSubscribers.length + subscribers.length;

  function exportCsv() {
    const csv = toCSV(list, [
      { label: 'Name', get: (s) => s.name || '' },
      { label: 'Email', get: (s) => s.email },
      { label: 'Subscribed', get: (s) => new Date(s.date).toISOString().slice(0, 10) },
      { label: 'Source', get: (s) => s.source },
    ]);
    downloadFile('hga-newsletter-subscribers.csv', csv);
    toast(`Exported ${list.length} subscribers`);
  }

  return (
    <div className="flex flex-col gap-8">
      <AdminHeader title="Newsletter subscribers" sub={`${total.toLocaleString()} in total · ${subscribers.length} most recent shown`}>
        <SearchInput value={q} onChange={setQ} placeholder="Search subscribers" />
        <Btn variant="ghost" onClick={exportCsv}>
          Export CSV
        </Btn>
      </AdminHeader>
      <Table columns={[{ key: 'n', label: 'Name' }, { key: 'e', label: 'Email' }, { key: 'd', label: 'Subscribed' }, { key: 's', label: 'Source' }, { key: 'x', label: '' }]} empty={list.length ? null : 'No subscribers match your search.'}>
        {list.map((s) => (
          <tr key={s.email}>
            <td className={`${td} font-medium`}>{s.name || '—'}</td>
            <td className={td}>{s.email}</td>
            <td className={td}>{fmtDay(s.date)}</td>
            <td className={td}>{s.source}</td>
            <td className={`${td} text-right`}>
              <button
                type="button"
                onClick={() => {
                  removeItem('subscribers', 'email', s.email);
                  toast(`${s.email} unsubscribed`);
                }}
                className="font-medium text-danger"
              >
                Remove
              </button>
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
}
