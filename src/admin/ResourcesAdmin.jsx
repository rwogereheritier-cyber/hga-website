import { useState } from 'react';
import Field from '../components/common/Field';
import { fieldClass } from '../lib/forms';
import { removeItem, upsertItem, useStore } from '../lib/store';
import { toast } from '../lib/toast';
import { AdminHeader, Btn, Modal, Status, Table } from './ui';
import { td } from './styles';

function ResourceForm({ initial, onClose }) {
  const isNew = !initial.title;
  const [f, setF] = useState({ title: '', type: 'PDF', status: 'Coming soon', link: '', ...initial });
  const [errors, setErrors] = useState({});
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  function save() {
    const e = {};
    if (f.title.trim().length < 3) e.title = 'Add a title.';
    if (f.status === 'Available' && !/^https?:\/\//.test(f.link)) e.link = 'Add a download link before making it available.';
    setErrors(e);
    if (Object.keys(e).length) return;
    upsertItem('library', 'title', f, isNew ? undefined : initial.title);
    toast(isNew ? 'Resource added' : 'Resource updated');
    onClose();
  }

  return (
    <Modal title={isNew ? 'Add resource' : 'Edit resource'} onClose={onClose} footer={<><Btn variant="ghost" onClick={onClose}>Cancel</Btn><Btn variant="primary" onClick={save}>Save</Btn></>}>
      <Field label="Title" error={errors.title}>
        <input value={f.title} onChange={set('title')} className={fieldClass(errors.title)} />
      </Field>
      <Field label="File type">
        <select value={f.type} onChange={set('type')} className={fieldClass()}>
          {['PDF', 'Worksheet', 'Video', 'Audio', 'Link'].map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </Field>
      <Field label="Download link" error={errors.link} hint="For the prototype, any https:// link works.">
        <input value={f.link} onChange={set('link')} placeholder="https://" className={fieldClass(errors.link)} />
      </Field>
      <Field label="Status">
        <select value={f.status} onChange={set('status')} className={fieldClass()}>
          <option>Coming soon</option>
          <option>Available</option>
          <option>Hidden</option>
        </select>
      </Field>
    </Modal>
  );
}

export default function ResourcesAdmin() {
  const library = useStore('library');
  const [editing, setEditing] = useState(null);
  return (
    <div className="flex flex-col gap-8">
      <AdminHeader title="Resources" sub="The free resource library on the Books page">
        <Btn variant="primary" onClick={() => setEditing({})}>
          Add resource
        </Btn>
      </AdminHeader>
      <Table columns={[{ key: 't', label: 'Title' }, { key: 'y', label: 'Type' }, { key: 's', label: 'Status' }, { key: 'x', label: '' }]} empty={library.length ? null : 'No resources yet.'}>
        {library.map((r) => (
          <tr key={r.title}>
            <td className={`${td} font-medium`}>{r.title}</td>
            <td className={td}>{r.type}</td>
            <td className={td}>
              <Status value={r.status} />
            </td>
            <td className={`${td} whitespace-nowrap text-right`}>
              <button type="button" onClick={() => setEditing(r)} className="mr-4 font-medium text-burgundy">
                Edit
              </button>
              <button
                type="button"
                onClick={() => {
                  removeItem('library', 'title', r.title);
                  toast('Resource removed');
                }}
                className="font-medium text-danger"
              >
                Remove
              </button>
            </td>
          </tr>
        ))}
      </Table>
      {editing && <ResourceForm initial={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}
