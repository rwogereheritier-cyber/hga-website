import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHero from '../../components/common/PageHero';
import { SearchBox, Segmented } from '../../components/common/Filters';
import { eventCategories } from '../../data/content';
import DateBlock from '../../components/common/DateBlock';
import { priceLabel, spacesLeft } from '../../lib/format';
import { useStore } from '../../lib/store';
import { fmtTime } from '../../lib/time';

export default function Events() {
  const events = useStore('events');
  const [tab, setTab] = useState('Upcoming');
  const [cat, setCat] = useState('All');
  const [q, setQ] = useState('');

  const list = useMemo(() => {
    const now = Date.now();
    const query = q.trim().toLowerCase();
    return events
      .filter((e) => (tab === 'Upcoming' ? new Date(e.start) >= now : new Date(e.start) < now))
      .filter((e) => cat === 'All' || e.category === cat)
      .filter((e) => !query || `${e.title} ${e.summary} ${e.category}`.toLowerCase().includes(query))
      .sort((a, b) => (tab === 'Upcoming' ? 1 : -1) * (new Date(a.start) - new Date(b.start)));
  }, [events, tab, cat, q]);

  return (
    <>
      <PageHero eyebrow="Events & workshops" title="Learn live, together." lead="Masterclasses, workshops and webinars led by Hetty. Times are shown in your time zone." />

      <section className="mx-auto w-full max-w-[1000px] px-6 pb-section-sm md:px-8 md:pb-section">
        <div className="mb-10 flex flex-wrap items-center gap-4">
          <Segmented options={['Upcoming', 'Past']} value={tab} onChange={setTab} label="Upcoming or past events" />
          <SearchBox value={q} onChange={setQ} placeholder="Search events" label="Search events" />
          <Segmented options={['All', ...eventCategories]} value={cat} onChange={setCat} label="Filter by category" />
        </div>

        {list.length === 0 ? (
          <p className="border-t border-hairline py-10 text-ink-muted" role="status">
            No {tab.toLowerCase()} events match your filters.
          </p>
        ) : (
          <ul className="border-b border-hairline">
            {list.map((e, i) => {
              const left = spacesLeft(e);
              const past = tab === 'Past';
              return (
                <li key={e.id} className="border-t border-hairline">
                  <Link to={`/events/${e.id}`} className="group flex flex-wrap items-center gap-x-8 gap-y-3 py-7">
                    <DateBlock iso={e.start} strong={!past && i === 0} />
                    <span className="flex min-w-[240px] flex-1 flex-col gap-1.5">
                      <span className="text-caption font-medium text-burgundy">{e.category}</span>
                      <span className="text-[21px] font-medium transition-colors group-hover:text-burgundy">{e.title}</span>
                      <span className="text-small text-ink-muted">
                        {e.format} · {fmtTime(new Date(e.start).getTime())} · {e.duration} min
                        {!past && ` · ${left > 0 ? `${left} ${left === 1 ? 'space' : 'spaces'} left` : 'Fully booked'}`}
                      </span>
                    </span>
                    <span className="w-16 text-[17px] font-medium">{priceLabel(e.price)}</span>
                    <span className="text-[16px] font-medium text-burgundy">
                      {past ? 'Details' : left > 0 ? 'Register' : 'View'} <span aria-hidden="true">›</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </>
  );
}
