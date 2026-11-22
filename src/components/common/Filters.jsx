/** Search box + segmented category filter, used on Programmes, Events and Resources. */
export function SearchBox({ value, onChange, placeholder, label }) {
  return (
    <label className="flex h-11 min-w-[220px] flex-1 items-center gap-2 rounded-full border border-[#E2DED8] px-4 text-small text-ink-muted focus-within:border-burgundy">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-3.5-3.5" />
      </svg>
      <span className="sr-only">{label}</span>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-charcoal outline-none placeholder:text-ink-muted"
      />
    </label>
  );
}

export function Segmented({ options, value, onChange, label }) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-1 rounded-full bg-grey-100 p-1">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          aria-pressed={value === o}
          onClick={() => onChange(o)}
          className={`rounded-full px-4 py-2 text-[14px] transition-colors duration-200 ${
            value === o ? 'bg-white font-medium text-charcoal shadow-sm' : 'text-ink-muted hover:text-charcoal'
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}
