import { useEffect, useState } from 'react';
import { update, useStore } from './store';
import { LIVE, callApi, supabase } from './supabase';

// Team data: live from Supabase, or the demo list in browser storage.

export function useTeam() {
  const demo = useStore('team');
  const [live, setLive] = useState(null);
  const [version, setVersion] = useState(0);
  useEffect(() => {
    if (!LIVE) return;
    supabase
      .from('profiles')
      .select('*')
      .order('created_at')
      .then(({ data }) => setLive(data || []));
  }, [version]);
  return { members: LIVE ? live : demo, loading: LIVE && live === null, refresh: () => setVersion((v) => v + 1) };
}

const demoId = () => `demo-${Math.random().toString(36).slice(2, 8)}`;

/** Every action returns nothing on success or throws a readable error. */
export async function teamAction(action, payload) {
  if (LIVE) return callApi('team', { action, ...payload });
  update((s) => {
    let team = s.team;
    const me = team.find((m) => m.role === 'owner');
    switch (action) {
      case 'invite':
        if (team.some((m) => m.email === payload.email.toLowerCase())) throw new Error('This person already has an account.');
        team = [...team, { id: demoId(), email: payload.email.toLowerCase(), full_name: payload.fullName || '', role: payload.role, status: 'invited', created_at: new Date().toISOString() }];
        break;
      case 'role':
        team = team.map((m) => (m.id === payload.id ? { ...m, role: payload.role } : m));
        break;
      case 'status':
        team = team.map((m) => (m.id === payload.id ? { ...m, status: payload.status } : m));
        break;
      case 'remove':
        team = team.filter((m) => m.id !== payload.id);
        break;
      case 'transfer':
        team = team.map((m) => (m.id === payload.id ? { ...m, role: 'owner' } : m.id === me.id ? { ...m, role: 'admin' } : m));
        break;
      default:
        break;
    }
    return { ...s, team };
  });
  return { ok: true };
}
