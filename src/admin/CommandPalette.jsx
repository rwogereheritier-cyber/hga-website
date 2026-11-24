import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { guides } from '../data/help';
import { canView } from './permissions';

const screens = [
  ['overview', '/admin', 'Overview'],
  ['bookings', '/admin/bookings', 'Bookings'],
  ['clients', '/admin/clients', 'Clients'],
  ['events', '/admin/events', 'Events'],
  ['messages', '/admin/messages', 'Messages'],
  ['payments', '/admin/payments', 'Payments'],
  ['content', '/admin/content', 'Pages & text'],
  ['media', '/admin/media', 'Photos'],
  ['blog', '/admin/blog', 'Blog'],
  ['books', '/admin/books', 'Books'],
  ['resources', '/admin/resources', 'Resources'],
  ['subscribers', '/admin/subscribers', 'Newsletter'],
  ['team', '/admin/team', 'Team'],
  ['connections', '/admin/connections', 'Connections'],
  ['settings', '/admin/settings', 'Settings'],
  ['help', '/admin/help', 'Help & guides'],
];

/** Ctrl/⌘ + K: jump to any screen or guide. */
export default function CommandPalette({ role }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [index, setIndex] = useState(0);
  const input = useRef(null);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (open) {
      setQ('');
      setIndex(0);
      setTimeout(() => input.current?.focus(), 0);
    }
  }, [open]);

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    const s = screens.filter(([a, , label]) => canView(role, a) && label.toLowerCase().includes(query)).map(([, to, label]) => ({ to, label, kind: 'Screen' }));
    const g = guides.filter((x) => query && `${x.title} ${x.summary}`.toLowerCase().includes(query)).map((x) => ({ to: `/admin/help?guide=${x.id}`, label: x.title, kind: 'Guide' }));
    return [...s, ...g].slice(0, 9);
  }, [q, role]);

  if (!open) return null;
  const go = (r) => {
    setOpen(false);
    navigate(r.to);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center bg-[rgba(41,37,42,0.35)] px-4 pt-[12vh]" onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}>
      <div role="dialog" aria-label="Search the dashboard" className="w-full max-w-[560px] overflow-hidden rounded-lg bg-white shadow-overlay">
        <input
          ref={input}
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setIndex(0);
          }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') setIndex((i) => Math.min(i + 1, results.length - 1));
            if (e.key === 'ArrowUp') setIndex((i) => Math.max(i - 1, 0));
            if (e.key === 'Enter' && results[index]) go(results[index]);
          }}
          placeholder="Go to a screen or search help…"
          aria-label="Search"
          className="h-14 w-full border-b border-hairline px-5 text-[16px] outline-none"
        />
        <ul className="max-h-[50vh] overflow-y-auto py-2">
          {results.length === 0 && <li className="px-5 py-3 text-[14px] text-ink-muted">No matches</li>}
          {results.map((r, i) => (
            <li key={r.to + r.label}>
              <button
                type="button"
                onMouseEnter={() => setIndex(i)}
                onClick={() => go(r)}
                className={`flex w-full items-center justify-between px-5 py-2.5 text-left text-[15px] ${i === index ? 'bg-grey-100' : ''}`}
              >
                {r.label}
                <span className="text-[12px] text-ink-muted">{r.kind}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
