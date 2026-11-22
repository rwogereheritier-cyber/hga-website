/** Real image when `src` is set, otherwise a labelled stand-in until the client supplies a photo. */
export default function ImagePlaceholder({ label, className = '', tone = 'grey', src }) {
  if (src) {
    return <img src={src} alt={label} className={`rounded-lg object-cover ${className}`} />;
  }
  const bg = tone === 'ivory' ? 'bg-[#EFE9DF]' : 'bg-grey-100';
  return (
    <div role="img" aria-label={`Photo placeholder: ${label}`} className={`relative rounded-lg ${bg} ${className}`}>
      <span className="absolute bottom-5 left-6 text-caption text-ink-muted">Photo · {label}</span>
    </div>
  );
}
