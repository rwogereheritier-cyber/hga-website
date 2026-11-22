import { useState } from 'react';
import Field from '../components/common/Field';
import { eventCategories } from '../data/content';
import { priceLabel, slugify } from '../lib/format';
import { fieldClass } from '../lib/forms';
import { removeItem, upsertItem, useStore } from '../lib/store';
import { toast } from '../lib/toast';
import { fmtDateTime } from './metrics';
import { AdminHeader, Btn, ImageUpload, Modal, Status, Table, Tabs } from './ui';
import { td } from './styles';

const pad = (n) => String(n).padStart(2, '0');
const toLocalInput = (iso) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
const blank = {
  id: '',
  title: '',
  category: eventCategories[0],
  start: new Date(Date.now() + 14 * 86400000).toISOString(),
  duration: 60,
  format: 'Online',
  price: 0,
  capacity: 30,
  registered: 0,
  summary: '',
  description: '',
  cover: '',
};

function EventForm({ initial, onClose }) {
  const isNew = !initial.id;
  const [f, setF] = useState({ ...blank, ...initial, when: toLocalInput(initial.start || blank.start) });
  const [errors, setErrors] = useState({});
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  function save() {
    const e = {};
    if (f.title.trim().length < 4) e.title = 'Give the event a title.';
    if (!f.when) e.when = 'Choose a date and time.';
    if (+f.duration < 15) e.duration = 'At least 15 minutes.';
    if (+f.price < 0 || f.price === '') e.price = 'Use 0 for a free event.';
    if (+f.capacity < 1) e.capacity = 'At least 1 space.';
    if (+f.capacity < +f.registered) e.capacity = `Already ${f.registered} registered.`;
    if (f.summary.trim().length < 10) e.summary = 'Add a one-line summary.';
    setErrors(e);
    if (Object.keys(e).length) return toast('Please fix the highlighted fields', 'error');
    const { when, ...rest } = f;
    const item = {
      ...rest,
      id: isNew ? `${slugify(f.title)}-${Date.now().toString(36).slice(-4)}` : f.id,
      start: new Date(when).toISOString(),
      duration: +f.duration,
      price: +f.price,
      capacity: +f.capacity,
      description: f.description || f.summary,
    };
    upsertItem('events', 'id', item, isNew ? undefined : initial.id);
    toast(isNew ? 'Event created' : 'Event updated');
    onClose();
  }

  return (
    <Modal title={isNew ? 'New event' : 'Edit event'} onClose={onClose} wide footer={<><Btn variant="ghost" onClick={onClose}>Cancel</Btn><Btn variant="primary" onClick={save}>{isNew ? 'Create event' : 'Save changes'}</Btn></>}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Title" error={errors.title} className="sm:col-span-2">
          <input value={f.title} onChange={set('title')} className={fieldClass(errors.title)} />
        </Field>
        <Field label="Category">
          <select value={f.category} onChange={set('category')} className={fieldClass()}>
            {eventCategories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Field>
        <Field label="Date and time (your time zone)" error={errors.when}>
          <input type="datetime-local" value={f.when} onChange={set('when')} className={fieldClass(errors.when)} />
        </Field>
        <Field label="Duration (minutes)" error={errors.duration}>
          <input type="number" min="15" step="15" value={f.duration} onChange={set('duration')} className={fieldClass(errors.duration)} />
        </Field>
        <Field label="Format">
          <input value={f.format} onChange={set('format')} placeholder="Online, or In person · City" className={fieldClass()} />
        </Field>
        <Field label="Price (0 = free)" error={errors.price}>
          <input type="number" min="0" step="1" value={f.price} onChange={set('price')} className={fieldClass(errors.price)} />
        </Field>
        <Field label="Registration limit" error={errors.capacity}>
          <input type="number" min="1" value={f.capacity} onChange={set('capacity')} className={fieldClass(errors.capacity)} />
        </Field>
        <Field label="Summary" error={errors.summary} className="sm:col-span-2">
          <input value={f.summary} onChange={set('summary')} className={fieldClass(errors.summary)} />
        </Field>
        <Field label="Description" className="sm:col-span-2">
          <textarea rows={4} value={f.description} onChange={set('description')} className={`${fieldClass()} h-auto py-3`} />
        </Field>
        <div className="sm:col-span-2">
          <ImageUpload value={f.cover} onChange={(cover) => setF({ ...f, cover })} />
        </div>
      </div>
    </Modal>
  );
}

export default function EventsAdmin() {
  const events = useStore('events');
  const registrations = useStore('registrations');
  const [tab, setTab] = useState('Upcoming');
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const now = Date.now();
  const list = events
    .filter((e) => (tab === 'Upcoming' ? new Date(e.start) >= now : new Date(e.start) < now))
    .sort((a, b) => (tab === 'Upcoming' ? 1 : -1) * (new Date(a.start) - new Date(b.start)));
  const regs = viewing ? registrations.filter((r) => r.eventId === viewing.id) : [];

  return (
    <div className="flex flex-col gap-8">
      <AdminHeader title="Events & workshops" sub={`${events.length} events`}>
        <Btn variant="primary" onClick={() => setEditing({})}>
          New event
        </Btn>
      </AdminHeader>
      <Tabs options={['Upcoming', 'Past']} value={tab} onChange={setTab} label="Upcoming or past" />
      <Table columns={[{ key: 't', label: 'Event' }, { key: 'd', label: 'Date' }, { key: 'p', label: 'Price' }, { key: 'r', label: 'Registered' }, { key: 'x', label: '' }]} empty={list.length ? null : `No ${tab.toLowerCase()} events.`}>
        {list.map((e) => (
          <tr key={e.id} className="hover:bg-[#FBFAF8]">
            <td className={td}>
              <div className="font-medium">{e.title}</div>
              <div className="text-[13px] text-ink-muted">
                {e.category} · {e.format}
              </div>
            </td>
            <td className={td}>{fmtDateTime(new Date(e.start).getTime())}</td>
            <td className={td}>{priceLabel(e.price)}</td>
            <td className={td}>
              {e.registered} / {e.capacity}
              {e.registered >= e.capacity && <span className="ml-2 text-[12px] text-danger">Full</span>}
            </td>
            <td className={`${td} whitespace-nowrap text-right`}>
              <button type="button" onClick={() => setViewing(e)} className="mr-4 font-medium text-burgundy">
                Registrations
              </button>
              <button type="button" onClick={() => setEditing(e)} className="mr-4 font-medium text-burgundy">
                Edit
              </button>
              <button type="button" onClick={() => setDeleting(e)} className="font-medium text-danger">
                Delete
              </button>
            </td>
          </tr>
        ))}
      </Table>

      {editing && <EventForm initial={editing} onClose={() => setEditing(null)} />}

      {viewing && (
        <Modal title={`Registrations · ${viewing.title}`} onClose={() => setViewing(null)} wide>
          <p className="text-[14px] text-ink-muted">
            {viewing.registered} registered in total. {regs.length ? `${regs.length} made on this site are listed below.` : 'Registrations made on the website will be listed here.'}
          </p>
          {regs.length > 0 && (
            <Table columns={[{ key: 'n', label: 'Name' }, { key: 'e', label: 'Email' }, { key: 'd', label: 'Date' }, { key: 's', label: 'Status' }]} minWidth={520}>
              {regs.map((r) => (
                <tr key={r.ref}>
                  <td className={`${td} font-medium`}>{r.name}</td>
                  <td className={td}>{r.email}</td>
                  <td className={td}>{fmtDateTime(r.date)}</td>
                  <td className={td}>
                    <Status value={r.status} />
                  </td>
                </tr>
              ))}
            </Table>
          )}
        </Modal>
      )}

      {deleting && (
        <Modal
          title="Delete event?"
          onClose={() => setDeleting(null)}
          footer={
            <>
              <Btn variant="ghost" onClick={() => setDeleting(null)}>
                Keep it
              </Btn>
              <Btn
                variant="danger"
                onClick={() => {
                  removeItem('events', 'id', deleting.id);
                  toast('Event deleted');
                  setDeleting(null);
                }}
              >
                Delete event
              </Btn>
            </>
          }
        >
          <p className="text-[15px]">
            “{deleting.title}” will be removed from the website. {deleting.registered > 0 && `${deleting.registered} people are registered.`}
          </p>
        </Modal>
      )}
    </div>
  );
}
