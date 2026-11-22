/** Square date tile: day number over a short month. */
export default function DateBlock({ iso, strong }) {
  const d = new Date(iso);
  return (
    <span
      className={`flex h-[72px] w-[72px] shrink-0 flex-col items-center justify-center rounded-lg ${
        strong ? 'bg-burgundy text-white' : 'bg-grey-100 text-charcoal'
      }`}
    >
      <span className="font-display text-[28px] leading-none">{d.getDate()}</span>
      <span className={`text-[11px] font-medium tracking-[1px] ${strong ? 'text-champagne' : 'text-burgundy'}`}>
        {d.toLocaleDateString([], { month: 'short' }).toUpperCase()}
      </span>
    </span>
  );
}
