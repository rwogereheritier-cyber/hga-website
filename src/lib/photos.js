import { useStore } from './store';

/** The photo currently placed in a website slot, or null. */
export function useSlotPhoto(slot) {
  const siteImages = useStore('siteImages');
  const media = useStore('media');
  if (!slot) return null;
  const id = siteImages[slot];
  return (id && media.find((m) => m.id === id)) || null;
}

export const kb = (bytes) => (bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.round((bytes || 0) / 1024)} KB`);
