import { useSyncExternalStore } from 'react';

// Minimal toast notifications: toast('Saved'), toast('Something failed', 'error').
let toasts = [];
const listeners = new Set();
const emit = () => listeners.forEach((l) => l());

export function toast(message, tone = 'success') {
  const id = Math.random().toString(36).slice(2);
  toasts = [...toasts, { id, message, tone }];
  emit();
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    emit();
  }, 3200);
}

export function useToasts() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => toasts,
  );
}
