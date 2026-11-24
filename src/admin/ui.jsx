import { useEffect, useRef } from 'react';

/** Page title row with optional actions on the right. */
export function AdminHeader({ title, sub, children }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex flex-col gap-1.5">
        {sub && <span className="text-[14px] text-ink-muted">{sub}</span>}
        <h1 className="font-display text-[32px] font-medium leading-[1.1] tracking-[-0.5px] md:text-[40px]">{title}</h1>
      </div>
      {children && <div className="flex flex-wrap items-center gap-2.5">{children}</div>}
    </div>
  );
}

export function Stat({ label, value, note, accent }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[13px] text-ink-muted">{label}</span>
      <span className={`text-[30px] font-medium tracking-[-0.5px] ${accent ? 'text-burgundy' : ''}`}>{value}</span>
      {note && <span className="text-[12px] text-ink-muted">{note}</span>}
    </div>
  );
}

const dot = {
  Confirmed: 'bg-success',
  Paid: 'bg-success',
  Published: 'bg-success',
  Available: 'bg-success',
  Registered: 'bg-success',
  Active: 'bg-success',
  Connected: 'bg-success',
  Invited: 'bg-gold',
  'Not connected': 'bg-[#9A9499]',
  Paused: 'bg-[#9A9499]',
  Delivered: 'bg-success',
  Pending: 'bg-gold',
  Draft: 'bg-gold',
  New: 'bg-gold',
  Processing: 'bg-gold',
  'Coming soon': 'bg-gold',
  Completed: 'bg-[#9A9499]',
  Read: 'bg-[#9A9499]',
  Hidden: 'bg-[#9A9499]',
  Cancelled: 'bg-danger',
  Refunded: 'bg-danger',
  Failed: 'bg-danger',
};

/** Status shown as a dot plus its word, never colour alone. */
export function Status({ value }) {
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap">
      <span aria-hidden="true" className={`h-[7px] w-[7px] rounded-full ${dot[value] || 'bg-[#9A9499]'}`} />
      {value}
    </span>
  );
}

export function Btn({ variant = 'dark', className = '', ...rest }) {
  const styles = {
    dark: 'bg-charcoal text-white hover:bg-black',
    primary: 'bg-burgundy text-white hover:bg-maroon',
    ghost: 'border border-[#E2DED8] bg-white text-charcoal hover:border-charcoal',
    danger: 'border border-[#F2C9C9] bg-white text-danger hover:bg-[#FBEDED]',
  };
  return (
    <button
      type="button"
      className={`inline-flex h-10 items-center justify-center rounded-full px-4 text-[14px] font-medium transition-colors duration-200 disabled:opacity-40 ${styles[variant]} ${className}`}
      {...rest}
    />
  );
}

export function SearchInput({ value, onChange, placeholder = 'Search' }) {
  return (
    <label className="flex h-10 items-center gap-2 rounded-full border border-[#E2DED8] bg-white px-4 text-[14px] text-ink-muted focus-within:border-burgundy">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-3.5-3.5" />
      </svg>
      <span className="sr-only">{placeholder}</span>
      <input type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-[180px] bg-transparent text-charcoal outline-none" />
    </label>
  );
}

export function Select({ label, value, onChange, options }) {
  return (
    <label className="flex h-10 items-center gap-2 rounded-full border border-[#E2DED8] bg-white pl-4 pr-2 text-[14px] text-ink-muted">
      <span>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="bg-transparent pr-1 text-charcoal outline-none">
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}

/** Pill tabs used for status filters. */
export function Tabs({ options, value, onChange, label }) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-1 rounded-full bg-grey-100 p-1">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          aria-pressed={value === o}
          onClick={() => onChange(o)}
          className={`rounded-full px-3.5 py-1.5 text-[13px] ${value === o ? 'bg-white font-medium text-charcoal shadow-sm' : 'text-ink-muted hover:text-charcoal'}`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

/** Scrollable table shell. columns: [{ key, label, align }] */
export function Table({ columns, children, empty, minWidth = 760 }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-[14px]" style={{ minWidth }}>
        <thead>
          <tr className="text-left text-[13px] text-ink-muted">
            {columns.map((c) => (
              <th key={c.key} scope="col" className={`border-b border-hairline py-3 pr-4 font-normal ${c.align === 'right' ? 'text-right' : ''}`}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
      {empty && <p className="py-10 text-center text-[14px] text-ink-muted">{empty}</p>}
    </div>
  );
}

/** Accessible modal: Escape and backdrop close, focus moves inside. */
export function Modal({ title, onClose, children, footer, wide }) {
  const ref = useRef(null);
  useEffect(() => {
    const prev = document.activeElement;
    ref.current?.querySelector('input, select, textarea, button')?.focus();
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      prev?.focus?.();
    };
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[rgba(41,37,42,0.4)] p-4 md:items-center" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={ref} role="dialog" aria-modal="true" aria-label={title} className={`my-8 flex w-full flex-col rounded-lg bg-white shadow-overlay ${wide ? 'max-w-[760px]' : 'max-w-[560px]'}`}>
        <div className="flex items-center justify-between gap-4 border-b border-hairline px-6 py-4">
          <h2 className="text-[17px] font-medium">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="flex h-9 w-9 items-center justify-center rounded-full text-[18px] text-ink-muted hover:bg-grey-100">
            ×
          </button>
        </div>
        <div className="flex flex-col gap-5 px-6 py-6">{children}</div>
        {footer && <div className="flex flex-wrap justify-end gap-2.5 border-t border-hairline px-6 py-4">{footer}</div>}
      </div>
    </div>
  );
}

/** Two-column definition list for detail views. */
export function Details({ rows }) {
  return (
    <dl className="text-[14px]">
      {rows.map(([k, v]) => (
        <div key={k} className="flex justify-between gap-6 border-t border-hairline py-3 first:border-t-0">
          <dt className="shrink-0 text-ink-muted">{k}</dt>
          <dd className="break-words text-right">{v}</dd>
        </div>
      ))}
    </dl>
  );
}
