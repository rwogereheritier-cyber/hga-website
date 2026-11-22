import { useSyncExternalStore } from 'react';
import { articleCategories, libraryResources, seedArticles, seedBooks, seedEvents } from '../data/content';
import { defaultContent } from '../data/defaults';
import { demoBookings, demoPayments, demoSubscribers } from '../data/demo';
import { consultations } from '../data/services';

// Prototype data store. Persists to localStorage so public actions (bookings, payments,
// registrations, orders, messages, subscriptions) appear in the admin dashboard in the same
// browser, and admin edits to events, articles and books appear on the public site.
// Replace with API calls when a real backend is added.

const KEY = 'hga.store.v2';

const seed = {
  bookings: demoBookings,
  payments: demoPayments,
  subscribers: demoSubscribers,
  registrations: [],
  orders: [],
  messages: [],
  events: seedEvents,
  articles: seedArticles,
  books: seedBooks,
  library: libraryResources,
  categories: articleCategories,
  consultations,
  content: defaultContent,
};

export const SEED = seed;

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...seed, ...JSON.parse(raw) } : seed;
  } catch {
    return seed;
  }
}

let state = load();
const listeners = new Set();

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Storage full or blocked: keep working in memory.
  }
}

export function update(fn) {
  state = fn(state);
  save();
  listeners.forEach((l) => l());
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Read one top-level collection, e.g. useStore('bookings'). */
export function useStore(key) {
  return useSyncExternalStore(subscribe, () => state[key]);
}

export const getState = () => state;

export function resetStore() {
  state = seed;
  save();
  listeners.forEach((l) => l());
}

export function makeRef(prefix) {
  const n = Math.floor(Math.random() * 36 ** 5)
    .toString(36)
    .toUpperCase()
    .padStart(5, '0');
  return `${prefix}-${n}`;
}

export function addBooking(booking, payment) {
  update((s) => ({ ...s, bookings: [booking, ...s.bookings], payments: [payment, ...s.payments] }));
}

export function addRegistration(reg, payment) {
  update((s) => ({
    ...s,
    registrations: [reg, ...s.registrations],
    payments: payment ? [payment, ...s.payments] : s.payments,
    events: s.events.map((e) => (e.id === reg.eventId ? { ...e, registered: e.registered + 1 } : e)),
  }));
}

export function addOrder(order, payment) {
  update((s) => ({ ...s, orders: [order, ...s.orders], payments: [payment, ...s.payments] }));
}

export function addMessage(msg) {
  update((s) => ({ ...s, messages: [msg, ...s.messages] }));
}

export function addSubscriber(sub) {
  update((s) => ({ ...s, subscribers: [sub, ...s.subscribers.filter((x) => x.email !== sub.email)] }));
}

/** Replace one item in a collection, matched by its key field. */
export function updateItem(collection, keyField, key, patch) {
  update((s) => ({ ...s, [collection]: s[collection].map((x) => (x[keyField] === key ? { ...x, ...patch } : x)) }));
}

export function removeItem(collection, keyField, key) {
  update((s) => ({ ...s, [collection]: s[collection].filter((x) => x[keyField] !== key) }));
}

export function upsertItem(collection, keyField, item, originalKey) {
  update((s) => {
    const list = s[collection];
    const at = list.findIndex((x) => x[keyField] === (originalKey ?? item[keyField]));
    return { ...s, [collection]: at === -1 ? [item, ...list] : list.map((x, i) => (i === at ? item : x)) };
  });
}

export function setContent(patch) {
  update((s) => ({ ...s, content: { ...s.content, ...patch } }));
}
