import { getState } from './store';

export const fmtArticleDate = (iso) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString([], { day: 'numeric', month: 'long', year: 'numeric' });

/** Price in the academy's currency (Settings → Business details). CAD shows as $75, USD as US$75. */
export const money = (n) => {
  const currency = getState().settings?.business?.currency || 'CAD';
  const whole = Number.isInteger(+n);
  return new Intl.NumberFormat('en-CA', { style: 'currency', currency, minimumFractionDigits: whole ? 0 : 2, maximumFractionDigits: 2 }).format(+n);
};

export const priceLabel = (p) => (p > 0 ? money(p) : 'Free');

export const spacesLeft = (e) => Math.max(0, e.capacity - e.registered);

export const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
