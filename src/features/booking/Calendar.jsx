import { useMemo, useState } from 'react';
import { localKey } from '../../lib/time';

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

/** Month calendar. `available` is a Set of local date keys that have free slots. */
export default function Calendar({ available, selected, onSelect }) {
  const first = useMemo(() => {
    const keys = [...available].sort();
    const start = keys[0] ? new Date(`${keys[0]}T00:00`) : new Date();
    return new Date(start.getFullYear(), start.getMonth(), 1);
  }, [available]);
  const [month, setMonth] = useState(first);

  const lastKey = [...available].sort().pop();
  const lastMonth = lastKey ? new Date(`${lastKey}T00:00`) : first;
  const canPrev = month > first;
  const canNext =
    month.getFullYear() < lastMonth.getFullYear() ||
    (month.getFullYear() === lastMonth.getFullYear() && month.getMonth() < lastMonth.getMonth());

  const cells = useMemo(() => {
    const y = month.getFullYear();
    const m = month.getMonth();
    const lead = (new Date(y, m, 1).getDay() + 6) % 7; // Monday first
    const days = new Date(y, m + 1, 0).getDate();
    const out = Array.from({ length: lead }, () => null);
    for (let d = 1; d <= days; d++) out.push(new Date(y, m, d));
    while (out.length % 7) out.push(null);
    return out;
  }, [month]);

  const title = month.toLocaleDateString([], { month: 'long', year: 'numeric' });
  const shift = (n) => setMonth(new Date(month.getFullYear(), month.getMonth() + n, 1));

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h3 className="text-[19px] font-medium" aria-live="polite">
          {title}
        </h3>
        <div className="flex gap-1">
          <button
            type="button"
            aria-label="Previous month"
            disabled={!canPrev}
            onClick={() => shift(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-[20px] hover:bg-grey-100 disabled:opacity-30 disabled:hover:bg-transparent"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Next month"
            disabled={!canNext}
            onClick={() => shift(1)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-[20px] hover:bg-grey-100 disabled:opacity-30 disabled:hover:bg-transparent"
          >
            ›
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 text-center text-caption text-ink-muted" aria-hidden="true">
        {WEEKDAYS.map((d, i) => (
          <span key={i}>{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 justify-items-center gap-y-1.5">
        {cells.map((date, i) => {
          if (!date) return <span key={i} className="h-11 w-11" />;
          const key = localKey(date);
          const open = available.has(key);
          const isSel = key === selected;
          const label = date.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' });
          return (
            <button
              key={key}
              type="button"
              disabled={!open}
              aria-pressed={isSel}
              aria-label={`${label}${open ? '' : ', unavailable'}`}
              onClick={() => onSelect(key)}
              className={`h-11 w-11 rounded-full text-[15px] transition-colors duration-200 ${
                isSel
                  ? 'bg-burgundy font-semibold text-white'
                  : open
                    ? 'bg-[#F6F0E6] font-medium text-maroon hover:bg-champagne'
                    : 'text-[#B9B3B6]'
              }`}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
