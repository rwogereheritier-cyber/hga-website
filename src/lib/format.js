import { currency } from '../data/site';

export const fmtArticleDate = (iso) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString([], { day: 'numeric', month: 'long', year: 'numeric' });

export const money = (n) => `${currency}${Number(n).toFixed(Number.isInteger(+n) ? 0 : 2)}`;

export const priceLabel = (p) => (p > 0 ? money(p) : 'Free');

export const spacesLeft = (e) => Math.max(0, e.capacity - e.registered);
