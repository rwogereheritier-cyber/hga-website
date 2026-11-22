import { useMemo, useState } from 'react';
import { money } from '../lib/format';
import { useStore } from '../lib/store';
import { clientsFrom, fmtDateTime, fmtDay } from './metrics';
import { AdminHeader, Details, Modal, SearchInput, Status, Table } from './ui';
import { td } from './styles';

export default function Clients() {
  const bookings = useStore('bookings');
  const consultations = useStore('consultations');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(null);
  const clients = useMemo(() => clientsFrom(bookings), [bookings]);
  const list = clients.filter((c) => !q.trim() || `${c.name} ${c.email} ${c.country}`.toLowerCase().includes(q.trim().toLowerCase()));
  const current = open && clients.find((c) => c.email === open);
  const nameOf = (id) => consultations.find((c) => c.id === id)?.name || id;

  return (
    <div className="flex flex-col gap-8">
      <AdminHeader title="Clients" sub={`${clients.length} clients with bookings`}>
        <SearchInput value={q} onChange={setQ} placeholder="Search clients" />
      </AdminHeader>
      <Table
        columns={[{ key: 'n', label: 'Client' }, { key: 'e', label: 'Email' }, { key: 'p', label: 'Phone' }, { key: 'c', label: 'Country' }, { key: 'b', label: 'Bookings' }, { key: 'd', label: 'Registered' }, { key: 'x', label: '' }]}
        empty={list.length ? null : 'No clients match your search.'}
      >
        {list.map((c) => (
          <tr key={c.email} className="hover:bg-[#FBFAF8]">
            <td className={`${td} font-medium`}>{c.name}</td>
            <td className={td}>{c.email}</td>
            <td className={td}>{c.phone}</td>
            <td className={td}>{c.country}</td>
            <td className={td}>{c.bookings.length}</td>
            <td className={td}>{fmtDay(c.first)}</td>
            <td className={`${td} text-right`}>
              <button type="button" onClick={() => setOpen(c.email)} className="font-medium text-burgundy">
                Profile
              </button>
            </td>
          </tr>
        ))}
      </Table>
      {current && (
        <Modal title={current.name} onClose={() => setOpen(null)} wide>
          <Details
            rows={[
              ['Email', current.email],
              ['Phone', current.phone],
              ['Country', current.country],
              ['Client since', fmtDay(current.first)],
              ['Total spent', money(current.bookings.filter((b) => b.paymentStatus === 'Paid').reduce((s, b) => s + b.amount, 0))],
            ]}
          />
          <h3 className="pt-2 text-[15px] font-medium">Bookings</h3>
          <Table columns={[{ key: 's', label: 'Service' }, { key: 'd', label: 'Session' }, { key: 'st', label: 'Status' }]} minWidth={480}>
            {current.bookings.map((b) => (
              <tr key={b.ref}>
                <td className={td}>{nameOf(b.serviceId)}</td>
                <td className={td}>{fmtDateTime(b.start)}</td>
                <td className={td}>
                  <Status value={b.status} />
                </td>
              </tr>
            ))}
          </Table>
        </Modal>
      )}
    </div>
  );
}
