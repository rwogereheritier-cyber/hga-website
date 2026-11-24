import { useMemo, useState } from 'react';
import { money } from '../lib/format';
import { updateItem, useStore } from '../lib/store';
import { toast } from '../lib/toast';
import { fmtDateTime } from './metrics';
import { AdminHeader, Btn, Details, Modal, SearchInput, Select, Status, Table, Tabs } from './ui';
import { td } from './styles';
import { useSession } from './auth';
import { canEdit } from './permissions';

const STATUSES = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];

function BookingModal({ booking, serviceName, onClose, editable }) {
  const [status, setStatus] = useState(booking.status);
  const [confirmCancel, setConfirmCancel] = useState(false);

  function save(next = status) {
    const patch = { status: next };
    if (next === 'Cancelled') patch.paymentStatus = 'Refunded';
    updateItem('bookings', 'ref', booking.ref, patch);
    if (next === 'Cancelled') updateItem('payments', 'bookingRef', booking.ref, { status: 'Refunded' });
    toast(next === 'Cancelled' ? `Booking ${booking.ref} cancelled and refunded` : `Booking ${booking.ref} marked ${next.toLowerCase()}`);
    onClose();
  }

  return (
    <Modal
      title={`Booking ${booking.ref}`}
      onClose={onClose}
      footer={
        !editable ? null : confirmCancel ? (
          <>
            <span className="mr-auto self-center text-[14px] text-danger">Cancel this booking and refund the client?</span>
            <Btn variant="ghost" onClick={() => setConfirmCancel(false)}>
              Keep booking
            </Btn>
            <Btn variant="danger" onClick={() => save('Cancelled')}>
              Yes, cancel
            </Btn>
          </>
        ) : (
          <>
            {booking.status !== 'Cancelled' && (
              <Btn variant="danger" className="mr-auto" onClick={() => setConfirmCancel(true)}>
                Cancel booking
              </Btn>
            )}
            {booking.status !== 'Completed' && booking.status !== 'Cancelled' && (
              <Btn variant="ghost" onClick={() => save('Completed')}>
                Mark completed
              </Btn>
            )}
            <Btn onClick={() => save()} disabled={status === booking.status}>
              Save status
            </Btn>
          </>
        )
      }
    >
      <Details
        rows={[
          ['Client', booking.name],
          ['Email', booking.email],
          ['Phone', booking.phone],
          ['Country', booking.country],
          ['Service', serviceName],
          ['Session', `${fmtDateTime(booking.start)} · ${booking.duration} min`],
          ['Amount', `${money(booking.amount)} · ${booking.paymentStatus}`],
          ['Zoom', booking.zoom],
          ['Booked on', fmtDateTime(booking.createdAt)],
        ]}
      />
      <div className="rounded-md bg-grey-100 p-4 text-[14px] leading-[1.6]">
        <span className="mb-1 block text-[12px] text-ink-muted">Client’s note</span>
        {booking.notes}
      </div>
      <label className="flex flex-col gap-1.5 text-caption text-ink-muted">
        Status
        <select disabled={!editable} value={status} onChange={(e) => setStatus(e.target.value)} className="h-11 rounded-md border border-[#E2DED8] px-3 text-[15px] text-charcoal">
          {STATUSES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </label>
    </Modal>
  );
}

export default function Bookings() {
  const bookings = useStore('bookings');
  const consultations = useStore('consultations');
  const { profile } = useSession();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('All');
  const [service, setService] = useState('All services');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [open, setOpen] = useState(null);
  const nameOf = (id) => consultations.find((c) => c.id === id)?.name || id;

  const list = useMemo(() => {
    const query = q.trim().toLowerCase();
    const f = from ? new Date(`${from}T00:00`).getTime() : -Infinity;
    const t = to ? new Date(`${to}T23:59`).getTime() : Infinity;
    return bookings
      .filter((b) => status === 'All' || b.status === status)
      .filter((b) => service === 'All services' || nameOf(b.serviceId) === service)
      .filter((b) => b.start >= f && b.start <= t)
      .filter((b) => !query || `${b.name} ${b.email} ${b.ref}`.toLowerCase().includes(query))
      .sort((a, b) => b.start - a.start);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookings, q, status, service, from, to, consultations]);

  const current = open && bookings.find((b) => b.ref === open);

  return (
    <div className="flex flex-col gap-8">
      <AdminHeader title="Bookings" sub={`${list.length} of ${bookings.length} bookings`} />
      <div className="flex flex-wrap items-center gap-2.5">
        <SearchInput value={q} onChange={setQ} placeholder="Search client or reference" />
        <Select label="Service" value={service} onChange={setService} options={['All services', ...consultations.map((c) => c.name)]} />
        <label className="flex h-10 items-center gap-2 rounded-full border border-[#E2DED8] px-4 text-[14px] text-ink-muted">
          From
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="bg-transparent text-charcoal outline-none" />
        </label>
        <label className="flex h-10 items-center gap-2 rounded-full border border-[#E2DED8] px-4 text-[14px] text-ink-muted">
          To
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="bg-transparent text-charcoal outline-none" />
        </label>
        {(q || from || to || service !== 'All services' || status !== 'All') && (
          <button type="button" onClick={() => { setQ(''); setFrom(''); setTo(''); setService('All services'); setStatus('All'); }} className="px-2 text-[14px] font-medium text-burgundy">
            Clear
          </button>
        )}
      </div>
      <Tabs options={['All', ...STATUSES]} value={status} onChange={setStatus} label="Filter by status" />
      <Table
        columns={[{ key: 'r', label: 'Ref' }, { key: 'c', label: 'Client' }, { key: 's', label: 'Service' }, { key: 'd', label: 'Session' }, { key: 'a', label: 'Amount' }, { key: 'st', label: 'Status' }, { key: 'x', label: '' }]}
        empty={list.length ? null : 'No bookings match these filters.'}
      >
        {list.map((b) => (
          <tr key={b.ref} className="hover:bg-[#FBFAF8]">
            <td className={`${td} text-ink-muted`}>{b.ref}</td>
            <td className={td}>
              <div className="font-medium">{b.name}</div>
              <div className="text-[13px] text-ink-muted">{b.country}</div>
            </td>
            <td className={td}>{nameOf(b.serviceId)}</td>
            <td className={td}>{fmtDateTime(b.start)}</td>
            <td className={td}>{money(b.amount)}</td>
            <td className={td}>
              <Status value={b.status} />
            </td>
            <td className={`${td} text-right`}>
              <button type="button" onClick={() => setOpen(b.ref)} className="font-medium text-burgundy">
                View
              </button>
            </td>
          </tr>
        ))}
      </Table>
      {current && <BookingModal booking={current} serviceName={nameOf(current.serviceId)} onClose={() => setOpen(null)} editable={canEdit(profile.role, 'bookings')} />}
    </div>
  );
}
