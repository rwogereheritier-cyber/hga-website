import { useState } from 'react';
import Field from '../components/common/Field';
import { money, slugify } from '../lib/format';
import { fieldClass } from '../lib/forms';
import { upsertItem, useStore } from '../lib/store';
import { toast } from '../lib/toast';
import { AdminHeader, Btn, Modal, Status, Table } from './ui';
import { td } from './styles';
import { PhotoField } from './PhotoPicker';

const FORMATS = ['eBook', 'PDF', 'Paperback'];

function BookForm({ initial, onClose }) {
  const isNew = !initial.slug;
  const [f, setF] = useState({
    title: '',
    author: 'Hetty',
    price: 24.99,
    formats: ['eBook', 'PDF'],
    description: '',
    status: 'Available',
    cover: '',
    fileUrl: '',
    ...initial,
    contentsText: (initial.contents || []).join('\n'),
  });
  const [errors, setErrors] = useState({});
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const toggle = (fmt) => setF({ ...f, formats: f.formats.includes(fmt) ? f.formats.filter((x) => x !== fmt) : [...f.formats, fmt] });

  function save() {
    const e = {};
    if (f.title.trim().length < 3) e.title = 'Add a title.';
    if (!(+f.price > 0)) e.price = 'Set a price above 0.';
    if (!f.formats.length) e.formats = 'Choose at least one format.';
    if (f.description.trim().length < 20) e.description = 'Add a short description.';
    if (f.fileUrl && !/^https?:\/\//.test(f.fileUrl)) e.fileUrl = 'Use a full link starting with https://';
    setErrors(e);
    if (Object.keys(e).length) return toast('Please fix the highlighted fields', 'error');
    const { contentsText, ...rest } = f;
    upsertItem(
      'books',
      'slug',
      { ...rest, slug: isNew ? slugify(f.title) : f.slug, price: +f.price, contents: contentsText.split('\n').map((x) => x.trim()).filter(Boolean) },
      isNew ? undefined : initial.slug,
    );
    toast(isNew ? 'Publication added' : 'Publication updated');
    onClose();
  }

  return (
    <Modal title={isNew ? 'Add publication' : 'Edit publication'} onClose={onClose} wide footer={<><Btn variant="ghost" onClick={onClose}>Cancel</Btn><Btn variant="primary" onClick={save}>Save</Btn></>}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Title" error={errors.title} className="sm:col-span-2">
          <input value={f.title} onChange={set('title')} className={fieldClass(errors.title)} />
        </Field>
        <Field label="Author">
          <input value={f.author} onChange={set('author')} className={fieldClass()} />
        </Field>
        <Field label="Price" error={errors.price}>
          <input type="number" min="0" step="0.01" value={f.price} onChange={set('price')} className={fieldClass(errors.price)} />
        </Field>
        <fieldset className="flex flex-col gap-2 text-caption text-ink-muted sm:col-span-2">
          <legend className="mb-2">Formats</legend>
          <div className="flex gap-4">
            {FORMATS.map((fmt) => (
              <label key={fmt} className="flex items-center gap-2 text-[15px] text-charcoal">
                <input type="checkbox" checked={f.formats.includes(fmt)} onChange={() => toggle(fmt)} className="h-4 w-4 accent-burgundy" />
                {fmt}
              </label>
            ))}
          </div>
          {errors.formats && <span className="text-danger">{errors.formats}</span>}
        </fieldset>
        <Field label="Description" error={errors.description} className="sm:col-span-2">
          <textarea rows={3} value={f.description} onChange={set('description')} className={`${fieldClass(errors.description)} h-auto py-3`} />
        </Field>
        <Field label="Contents (one per line)" className="sm:col-span-2">
          <textarea rows={4} value={f.contentsText} onChange={set('contentsText')} className={`${fieldClass()} h-auto py-3`} />
        </Field>
        <Field label="Download link for digital copies" error={errors.fileUrl} hint="Where buyers download the file. Leave empty until the file is ready." className="sm:col-span-2">
          <input value={f.fileUrl} onChange={set('fileUrl')} placeholder="https://" className={fieldClass(errors.fileUrl)} />
        </Field>
        <Field label="Status">
          <select value={f.status} onChange={set('status')} className={fieldClass()}>
            <option>Available</option>
            <option>Hidden</option>
          </select>
        </Field>
        <div className="sm:col-span-2">
          <PhotoField value={f.cover} onChange={(cover) => setF({ ...f, cover })} />
        </div>
      </div>
    </Modal>
  );
}

export default function BooksAdmin() {
  const books = useStore('books');
  const orders = useStore('orders');
  const [editing, setEditing] = useState(null);

  return (
    <div className="flex flex-col gap-8">
      <AdminHeader title="Books & publications" sub={`${books.length} publication${books.length === 1 ? '' : 's'} · ${orders.length} order${orders.length === 1 ? '' : 's'}`}>
        <Btn variant="primary" onClick={() => setEditing({})}>
          Add publication
        </Btn>
      </AdminHeader>
      <Table columns={[{ key: 't', label: 'Title' }, { key: 'f', label: 'Formats' }, { key: 'p', label: 'Price' }, { key: 'o', label: 'Orders' }, { key: 's', label: 'Status' }, { key: 'x', label: '' }]}>
        {books.map((b) => (
          <tr key={b.slug}>
            <td className={`${td} font-medium`}>{b.title}</td>
            <td className={td}>{b.formats.join(', ')}</td>
            <td className={td}>{money(b.price)}</td>
            <td className={td}>{orders.filter((o) => o.book === b.title).length}</td>
            <td className={td}>
              <Status value={b.status} />
            </td>
            <td className={`${td} text-right`}>
              <button type="button" onClick={() => setEditing(b)} className="font-medium text-burgundy">
                Edit
              </button>
            </td>
          </tr>
        ))}
      </Table>
      {orders.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-[16px] font-medium">Recent orders</h2>
          <Table columns={[{ key: 'r', label: 'Order' }, { key: 'c', label: 'Customer' }, { key: 'b', label: 'Item' }, { key: 'a', label: 'Amount' }, { key: 's', label: 'Status' }]}>
            {orders.map((o) => (
              <tr key={o.ref}>
                <td className={`${td} text-ink-muted`}>{o.ref}</td>
                <td className={`${td} font-medium`}>{o.name}</td>
                <td className={td}>
                  {o.book} · {o.format}
                </td>
                <td className={td}>{money(o.amount)}</td>
                <td className={td}>
                  <Status value={o.status} />
                </td>
              </tr>
            ))}
          </Table>
        </section>
      )}
      {editing && <BookForm initial={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}
