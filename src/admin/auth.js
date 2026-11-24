import { useSyncExternalStore } from 'react';
import { LIVE, supabase } from '../lib/supabase';

// Sign-in for the dashboard.
// LIVE (Supabase configured): real accounts, invitations and password resets.
// DEMO (no Supabase yet): a clearly labelled demo account; nothing is protected.

export const DEMO_EMAIL = 'admin@hettyglobalacademy.com';
export const DEMO_PASSWORD = 'Admin123!';
const DEMO_KEY = 'hga.admin.demo';
const DEMO_ROLE_KEY = 'hga.admin.demoRole';

let state = { loading: LIVE, user: null, profile: null };
const listeners = new Set();
const set = (patch) => {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
};

function demoState() {
  try {
    if (sessionStorage.getItem(DEMO_KEY) !== '1') return { loading: false, user: null, profile: null };
    const role = sessionStorage.getItem(DEMO_ROLE_KEY) || 'owner';
    return {
      loading: false,
      user: { id: 'demo-owner', email: DEMO_EMAIL },
      profile: { id: 'demo-owner', email: DEMO_EMAIL, full_name: 'Hetty (demo)', role, status: 'active' },
    };
  } catch {
    return { loading: false, user: null, profile: null };
  }
}

async function loadProfile(user) {
  if (!user) return set({ loading: false, user: null, profile: null });
  const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
  set({ loading: false, user, profile: data });
  if (data) supabase.from('profiles').update({ last_seen_at: new Date().toISOString() }).eq('id', user.id).then(() => {});
}

if (LIVE) {
  supabase.auth.getSession().then(({ data }) => loadProfile(data.session?.user ?? null));
  supabase.auth.onAuthStateChange((_event, session) => {
    if ((session?.user?.id ?? null) !== (state.user?.id ?? null)) loadProfile(session?.user ?? null);
  });
} else {
  state = demoState();
}

export function useSession() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => state,
  );
}

export async function signIn(email, password) {
  if (LIVE) {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) return 'Those details don’t match an account. Check them or reset your password.';
    return null;
  }
  if (email.trim().toLowerCase() !== DEMO_EMAIL || password !== DEMO_PASSWORD) return 'Those details don’t match the demo account.';
  sessionStorage.setItem(DEMO_KEY, '1');
  set(demoState());
  return null;
}

export async function signOut() {
  if (LIVE) await supabase.auth.signOut();
  else {
    sessionStorage.removeItem(DEMO_KEY);
    set(demoState());
  }
}

export async function sendReset(email) {
  if (!LIVE) return 'Password reset works once the real backend is connected.';
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/admin/welcome?reset=1` });
  return error ? 'We couldn’t send the email. Check the address and try again.' : null;
}

/** Finish an invitation or reset: set a password (and name for new members). */
export async function completeAccount({ password, fullName }) {
  const { data, error } = await supabase.auth.updateUser({ password, data: fullName ? { full_name: fullName } : undefined });
  if (error) return error.message;
  if (fullName) await supabase.from('profiles').update({ full_name: fullName }).eq('id', data.user.id);
  await loadProfile(data.user);
  return null;
}

/** Demo only: preview the dashboard as another role. */
export function setDemoRole(role) {
  sessionStorage.setItem(DEMO_ROLE_KEY, role);
  set(demoState());
}

export const refreshProfile = () => (LIVE ? loadProfile(state.user) : set(demoState()));
