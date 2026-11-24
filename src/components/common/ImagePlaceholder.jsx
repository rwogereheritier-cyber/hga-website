import { useSlotPhoto } from '../../lib/photos';

/**
 * A website photo. Pass `slot` to show the photo chosen in the dashboard for that spot,
 * or `src` for a specific image. Falls back to a labelled placeholder until a photo is added.
 */
export default function ImagePlaceholder({ label, className = '', tone = 'grey', src, slot }) {
  const photo = useSlotPhoto(slot);
  if (photo || src) {
    return (
      <img
        src={photo ? photo.url : src}
        alt={photo ? photo.alt : label}
        loading="lazy"
        className={`rounded-lg object-cover ${className}`}
        style={photo ? { objectPosition: `${photo.focalX}% ${photo.focalY}%` } : undefined}
      />
    );
  }
  const bg = tone === 'ivory' ? 'bg-[#EFE9DF]' : 'bg-grey-100';
  return (
    <div role="img" aria-label={`Photo placeholder: ${label}`} className={`relative rounded-lg ${bg} ${className}`}>
      <span className="absolute bottom-5 left-6 text-caption text-ink-muted">Photo · {label}</span>
    </div>
  );
}
