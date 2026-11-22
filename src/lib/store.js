import { useSyncExternalStore } from 'react';

// Prototype data store. Persists to localStorage so public actions (bookings, payments,
// subscriptions) appear in the admin dashboard in the same browser.
// Replace with API calls when a real backend is added.

const KEY = 'hga.store.v1';

const seed = {
  bookings: [],
  payments: [],
  subscribers: [],
  registrations: [],
};

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

export function addSubscriber(sub) {
  update((s) => ({ ...s, subscribers: [sub, ...s.subscribers.filter((x) => x.email !== sub.email)] }));
}
