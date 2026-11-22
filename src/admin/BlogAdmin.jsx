import { useState } from 'react';
import Field from '../components/common/Field';
import { slugify } from '../lib/format';
import { fieldClass } from '../lib/forms';
import { removeItem, update, upsertItem, useStore } from '../lib/store';
import { toast } from '../lib/toast';
import { AdminHeader, Btn, ImageUpload, Modal, SearchInput, Status, Table, Tabs } from './ui';
import { td } from './styles';

function Editor({ initial, categories, onClose }) {
  const isNew = !initial.slug;
  const [f, setF] = useState({
    title: '',
    slug: '',
    category: categories[0],
    excerpt: '',
    author: 'Hetty',
    date: new Date().toISOString().slice(0, 10),
    readTime: 3,
    status: 'Draft',
    cover: '',
    ...initial,
    bodyText: (initial.body || []).join('\n\n'),
  });
  const [newCat, setNewCat] = useState('');
  const [errors, setErrors] = useState({});
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value, ...(k === 'title' && isNew ? { slug: slugify(e.target.value) } : {}) });

  function addCategory() {
    const c = newCat.trim();
    if (!c) return;
    if (!categories.includes(c)) update((s) => ({ ...s, categories: [...s.categories, c] }));
    setF({ ...f, category: c });
    setNewCat('');
    toast(`Category “${c}” added`);
  }

  function save(status) {
    const e = {};
    if (f.title.trim().length < 6) e.title = 'Add a title.';
    if (!/^[a-z0-9-]{3,}$/.test(f.slug)) e.slug = 'Lowercase letters, numbers and dashes only.';
    if (f.excerpt.trim().length < 10) e.excerpt = 'Add a short excerpt.';
    if (status === 'Published' && f.bodyText.trim().length < 40) e.bodyText = 'Write the article before publishing.';
    setErrors(e);
    if (Object.keys(e).length) return toast('Please fix the highlighted fields', 'error');
    const { bodyText, ...rest } = f;
    const body = bodyText.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
    const words = body.join(' ').split(/\s+/).length;
    upsertItem('articles', 'slug', { ...rest, status, body, readTime: Math.max(1, Math.round(words / 200)) }, isNew ? undefined : initial.slug);
    toast(status === 'Published' ? 'Article published' : 'Draft saved');
    onClose();
  }

  return (
    <Modal
      title={isNew ? 'New article' : 'Edit article'}
      onClose={onClose}
      wide
      footer={
        <>
          <Btn variant="ghost" onClick={onClose} className="mr-auto">
            Cancel
          </Btn>
          <Btn variant="ghost" onClick={() => save('Draft')}>
            Save draft
          </Btn>
          <Btn variant="primary" onClick={() => save('Published')}>
            {f.status === 'Published' ? 'Update' : 'Publish'}
          </Btn>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Title" error={errors.title} className="sm:col-span-2">
          <input value={f.title} onChange={set('title')} className={fieldClass(errors.title)} />
        </Field>
        <Field label="URL slug" error={errors.slug} hint={`/resources/${f.slug || '…'}`}>
          <input value={f.slug} onChange={set('slug')} className={fieldClass(errors.slug)} />
        </Field>
        <Field label="Category">
          <select value={f.category} onChange={set('category')} className={fieldClass()}>
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Field>
        <div className="flex items-end gap-2 sm:col-span-2">
          <Field label="Add a category" className="flex-1">
            <input value={newCat} onChange={(e) => setNewCat(e.target.value)} placeholder="e.g. Wellbeing" className={fieldClass()} />
          </Field>
          <Btn variant="ghost" onClick={addCategory} className="mb-[1px] h-[52px]">
            Add
          </Btn>
        </div>
        <Field label="Excerpt" error={errors.excerpt} className="sm:col-span-2">
          <input value={f.excerpt} onChange={set('excerpt')} className={fieldClass(errors.excerpt)} />
        </Field>
        <Field label="Author">
          <input value={f.author} onChange={set('author')} className={fieldClass()} />
        </Field>
        <Field label="Publication date">
          <input type="date" value={f.date} onChange={set('date')} className={fieldClass()} />
        </Field>
        <Field label="Article" error={errors.bodyText} hint="Separate paragraphs with a blank line. Start a line with ## for a heading." className="sm:col-span-2">
          <textarea rows={10} value={f.bodyText} onChange={set('bodyText')} className={`${fieldClass(errors.bodyText)} h-auto py-3 leading-[1.6]`} />
        </Field>
        <div className="sm:col-span-2">
          <ImageUpload label="Featured image" value={f.cover} onChange={(cover) => setF({ ...f, cover })} />
        </div>
      </div>
    </Modal>
  );
}

export default function BlogAdmin() {
  const articles = useStore('articles');
  const categories = useStore('categories');
  const [tab, setTab] = useState('All');
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const list = articles
    .filter((a) => tab === 'All' || a.status === tab)
    .filter((a) => !q.trim() || a.title.toLowerCase().includes(q.trim().toLowerCase()))
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="flex flex-col gap-8">
      <AdminHeader title="Blog" sub={`${articles.filter((a) => a.status === 'Published').length} published · ${articles.filter((a) => a.status === 'Draft').length} drafts`}>
        <Btn variant="primary" onClick={() => setEditing({})}>
          New article
        </Btn>
      </AdminHeader>
      <div className="flex flex-wrap items-center gap-2.5">
        <Tabs options={['All', 'Published', 'Draft']} value={tab} onChange={setTab} label="Filter by status" />
        <SearchInput value={q} onChange={setQ} placeholder="Search articles" />
      </div>
      <Table columns={[{ key: 't', label: 'Title' }, { key: 'c', label: 'Category' }, { key: 'd', label: 'Date' }, { key: 's', label: 'Status' }, { key: 'x', label: '' }]} empty={list.length ? null : 'No articles here yet.'}>
        {list.map((a) => (
          <tr key={a.slug} className="hover:bg-[#FBFAF8]">
            <td className={`${td} font-medium`}>{a.title}</td>
            <td className={td}>{a.category}</td>
            <td className={td}>{a.date}</td>
            <td className={td}>
              <Status value={a.status} />
            </td>
            <td className={`${td} whitespace-nowrap text-right`}>
              {a.status === 'Published' && (
                <a href={`/resources/${a.slug}`} target="_blank" rel="noreferrer" className="mr-4 font-medium text-burgundy">
                  View
                </a>
              )}
              <button type="button" onClick={() => setEditing(a)} className="mr-4 font-medium text-burgundy">
                Edit
              </button>
              <button type="button" onClick={() => setDeleting(a)} className="font-medium text-danger">
                Delete
              </button>
            </td>
          </tr>
        ))}
      </Table>
      {editing && <Editor initial={editing} categories={categories} onClose={() => setEditing(null)} />}
      {deleting && (
        <Modal
          title="Delete article?"
          onClose={() => setDeleting(null)}
          footer={
            <>
              <Btn variant="ghost" onClick={() => setDeleting(null)}>
                Keep it
              </Btn>
              <Btn
                variant="danger"
                onClick={() => {
                  removeItem('articles', 'slug', deleting.slug);
                  toast('Article deleted');
                  setDeleting(null);
                }}
              >
                Delete article
              </Btn>
            </>
          }
        >
          <p className="text-[15px]">“{deleting.title}” will be removed from the website.</p>
        </Modal>
      )}
    </div>
  );
}
