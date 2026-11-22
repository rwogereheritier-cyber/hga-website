/** CSS book cover placeholder until the real cover artwork arrives. */
export default function BookCover({ title, author, size = 'md' }) {
  const dims = size === 'lg' ? 'h-[360px] w-[260px] p-7' : 'h-[240px] w-[176px] p-5';
  const text = size === 'lg' ? 'text-[26px]' : 'text-[18px]';
  return (
    <div
      role="img"
      aria-label={`Cover of ${title}`}
      className={`flex shrink-0 flex-col justify-between rounded-[4px_10px_10px_4px] border-l-[10px] border-maroon bg-burgundy shadow-overlay ${dims}`}
    >
      <span className="text-[11px] font-medium tracking-[1.6px] text-champagne">{author.toUpperCase()}</span>
      <span className={`font-display leading-[1.15] text-white ${text}`}>{title}</span>
      <span className="h-px bg-gold" />
    </div>
  );
}
