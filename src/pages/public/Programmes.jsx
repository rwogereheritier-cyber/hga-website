import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { LinkAction } from '../../components/common/Button';
import Reveal from '../../components/common/Reveal';
import { consultations, programmeDetails } from '../../data/services';
import { currency } from '../../data/site';

const filters = ['All', ...programmeDetails.map((p) => p.filter)];

const catalogue = programmeDetails.flatMap((p) =>
  p.services.map((s) => ({
    ...s,
    programme: p,
    from: Math.min(...p.consultations.map((id) => consultations.find((c) => c.id === id).price)),
  })),
);

export default function Programmes() {
  const [filter, setFilter] = useState('All');
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return catalogue.filter(
      (s) =>
        (filter === 'All' || s.programme.filter === filter) &&
        (!q || `${s.name} ${s.text} ${s.programme.category}`.toLowerCase().includes(q)),
    );
  }, [filter, query]);

  return (
    <>
      <section className="container-page flex flex-col items-center gap-6 pb-20 pt-24 text-center md:pt-36">
        <Reveal as="span" className="eyebrow">
          Programmes
        </Reveal>
        <Reveal delay={0.05}>
          <h1 className="h-display max-w-[900px]">Learning with a clear next step.</h1>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="max-w-prose text-[17px] leading-[1.55] text-ink-muted md:text-lead">
            Three paths, each built around one-to-one time with Hetty.
          </p>
        </Reveal>
      </section>

      <section className="container-page grid gap-5 pb-section-sm md:grid-cols-3 md:pb-section">
        {programmeDetails.map((p, i) => (
          <Reveal key={p.slug} delay={i * 0.06}>
            <Link
              to={`/programmes/${p.slug}`}
              className="flex h-full flex-col gap-3 rounded-lg bg-grey-100 p-8 transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-hover md:p-10"
            >
              <span className="text-caption font-medium text-burgundy">{p.category}</span>
              <h2 className="h-card">{p.title}</h2>
              <p className="text-small text-ink-muted">{p.intro}</p>
              <span className="mt-4 text-small font-medium text-burgundy">
                Learn more <span aria-hidden="true">›</span>
              </span>
            </Link>
          </Reveal>
        ))}
      </section>

      <section className="mx-auto w-full max-w-[960px] px-6 pb-section-sm md:px-8 md:pb-section">
        <div className="mb-10 flex flex-col gap-6">
          <h2 className="title-section">All services.</h2>
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex h-11 min-w-[240px] flex-1 items-center gap-2 rounded-full border border-[#E2DED8] px-4 text-small text-ink-muted focus-within:border-burgundy">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3.5-3.5" />
              </svg>
              <span className="sr-only">Search services</span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search, e.g. CELPIP"
                className="w-full bg-transparent text-charcoal outline-none placeholder:text-ink-muted"
              />
            </label>
            <div role="group" aria-label="Filter by category" className="flex flex-wrap gap-1 rounded-full bg-grey-100 p-1">
              {filters.map((f) => (
                <button
                  key={f}
                  type="button"
                  aria-pressed={filter === f}
                  onClick={() => setFilter(f)}
                  className={`rounded-full px-4 py-2 text-[14px] transition-colors duration-200 ${
                    filter === f ? 'bg-white font-medium text-charcoal shadow-sm' : 'text-ink-muted hover:text-charcoal'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {results.length === 0 ? (
          <p className="border-t border-hairline py-10 text-ink-muted" role="status">
            No services match “{query}”. Try another word or <button type="button" onClick={() => { setQuery(''); setFilter('All'); }} className="font-medium text-burgundy">clear the search</button>.
          </p>
        ) : (
          <ul className="border-b border-hairline">
            {results.map((s) => (
              <li key={`${s.programme.slug}-${s.name}`} className="flex flex-wrap items-center gap-x-10 gap-y-2 border-t border-hairline py-7">
                <span className="w-[150px] text-caption text-ink-muted">{s.programme.category}</span>
                <span className="flex min-w-[260px] flex-1 flex-col gap-1">
                  <span className="text-[19px] font-medium">{s.name}</span>
                  <span className="text-small text-ink-muted">{s.text}</span>
                </span>
                <span className="text-small text-ink-muted">
                  From {currency}
                  {s.from}
                </span>
                <LinkAction to={`/programmes/${s.programme.slug}`}>Details</LinkAction>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
