import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { guides } from '../data/help';
import { AdminHeader, SearchInput } from './ui';

export function Guide({ guide }) {
  return (
    <article className="flex flex-col gap-4">
      <h2 className="font-display text-[26px] leading-[1.2]">{guide.title}</h2>
      <p className="text-[15px] text-ink-muted">{guide.summary}</p>
      <ol className="flex flex-col gap-3">
        {guide.steps.map((s, i) => (
          <li key={i} className="flex gap-3 text-[15px] leading-[1.6]">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-grey-100 text-[12px] font-medium">{i + 1}</span>
            <span>{s}</span>
          </li>
        ))}
      </ol>
    </article>
  );
}

export default function Help() {
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState('');
  const open = guides.find((g) => g.id === params.get('guide'));
  const list = guides.filter((g) => !q.trim() || `${g.title} ${g.summary} ${g.steps.join(' ')}`.toLowerCase().includes(q.trim().toLowerCase()));

  if (open) {
    return (
      <div className="flex max-w-[720px] flex-col gap-8">
        <Link to="/admin/help" className="text-[14px] font-medium text-burgundy">
          ‹ All guides
        </Link>
        <Guide guide={open} />
      </div>
    );
  }

  return (
    <div className="flex max-w-[900px] flex-col gap-8">
      <AdminHeader title="Help & guides" sub="Step-by-step help for everything in the dashboard">
        <SearchInput value={q} onChange={setQ} placeholder="Search guides" />
      </AdminHeader>
      {list.length === 0 ? (
        <p className="text-[14px] text-ink-muted">No guides match “{q}”.</p>
      ) : (
        <ul className="border-b border-hairline">
          {list.map((g) => (
            <li key={g.id} className="border-t border-hairline">
              <button type="button" onClick={() => setParams({ guide: g.id })} className="flex w-full flex-col gap-1 py-5 text-left hover:text-burgundy">
                <span className="text-[16px] font-medium">{g.title}</span>
                <span className="text-[14px] text-ink-muted">{g.summary}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
