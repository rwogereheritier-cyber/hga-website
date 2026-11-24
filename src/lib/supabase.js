import { createClient } from '@supabase/supabase-js';

// When these two public values are set (Vercel env or .env.local), the site runs on the real
// Supabase backend. Without them it runs in demo mode on browser storage, so previews keep working.
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = url && anonKey ? createClient(url, anonKey, { auth: { persistSession: true, detectSessionInUrl: true } }) : null;
export const LIVE = Boolean(supabase);

/** Call one of our server functions with the signed-in user's token. */
export async function callApi(path, body) {
  const { data } = await supabase.auth.getSession();
  const res = await fetch(`/api/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${data.session?.access_token || ''}` },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || 'Something went wrong. Please try again.');
  return json;
}
