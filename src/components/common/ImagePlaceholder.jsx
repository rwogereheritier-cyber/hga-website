/** Stand-in for a real photo until the client supplies one. */
export default function ImagePlaceholder({ label, className = '', tone = 'grey' }) {
  const bg = tone === 'ivory' ? 'bg-[#EFE9DF]' : 'bg-grey-100';
  return (
    <div role="img" aria-label={`Photo placeholder: ${label}`} className={`relative rounded-lg ${bg} ${className}`}>
      <span className="absolute bottom-5 left-6 text-caption text-ink-muted">Photo · {label}</span>
    </div>
  );
}
