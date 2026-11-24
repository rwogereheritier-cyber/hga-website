import { createClient } from '@supabase/supabase-js';

// Team management runs here, on the server, because inviting and removing accounts needs the
// Supabase service key, which must never reach the browser.
// POST /api/team  { action: 'invite' | 'role' | 'status' | 'remove' | 'resend' | 'transfer', ... }

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const INVITABLE = { owner: ['admin', 'assistant', 'editor', 'viewer'], admin: ['assistant', 'editor', 'viewer'] };
const fail = (res, status, error) => res.status(status).json({ error });

export default async function handler(req, res) {
  if (req.method !== 'POST') return fail(res, 405, 'Method not allowed.');
  if (!url || !serviceKey) return fail(res, 500, 'The server is not connected to the database yet.');
  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  const { data: auth } = await admin.auth.getUser(token);
  if (!auth?.user) return fail(res, 401, 'Please sign in again.');
  const { data: me } = await admin.from('profiles').select('*').eq('id', auth.user.id).single();
  if (!me || me.status === 'disabled' || !INVITABLE[me.role]) return fail(res, 403, 'Only the owner or an admin can manage the team.');

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  const { action } = body;
  const origin = req.headers.origin || `https://${req.headers.host}`;

  let target = null;
  if (body.id) {
    const { data } = await admin.from('profiles').select('*').eq('id', body.id).single();
    target = data;
    if (!target) return fail(res, 404, 'That team member no longer exists.');
    if (target.id === me.id && action !== 'resend') return fail(res, 400, 'You can’t change your own access here.');
    if (me.role === 'admin' && ['owner', 'admin'].includes(target.role)) return fail(res, 403, 'Only the owner can change other admins.');
  }

  try {
    switch (action) {
      case 'invite': {
        const email = String(body.email || '').trim().toLowerCase();
        if (!/^\S+@\S+\.\S+$/.test(email)) return fail(res, 400, 'Enter a valid email address.');
        if (!INVITABLE[me.role].includes(body.role)) return fail(res, 403, 'You can’t give that role.');
        const { error } = await admin.auth.admin.inviteUserByEmail(email, {
          data: { role: body.role, full_name: String(body.fullName || '').trim() },
          redirectTo: `${origin}/admin/welcome`,
        });
        if (error) return fail(res, 400, /already/i.test(error.message) ? 'This person already has an account.' : error.message);
        return res.json({ ok: true });
      }
      case 'resend': {
        const { error } = await admin.auth.admin.inviteUserByEmail(target.email, { redirectTo: `${origin}/admin/welcome` });
        if (error) return fail(res, 400, error.message);
        return res.json({ ok: true });
      }
      case 'role': {
        if (!INVITABLE[me.role].includes(body.role)) return fail(res, 403, 'You can’t give that role.');
        const { error } = await admin.from('profiles').update({ role: body.role }).eq('id', target.id);
        if (error) return fail(res, 400, error.message);
        return res.json({ ok: true });
      }
      case 'status': {
        if (!['active', 'disabled'].includes(body.status)) return fail(res, 400, 'Unknown status.');
        const { error } = await admin.from('profiles').update({ status: body.status }).eq('id', target.id);
        if (error) return fail(res, 400, error.message);
        await admin.auth.admin.updateUserById(target.id, { ban_duration: body.status === 'disabled' ? '876000h' : 'none' });
        return res.json({ ok: true });
      }
      case 'remove': {
        const { error } = await admin.auth.admin.deleteUser(target.id);
        if (error) return fail(res, 400, error.message);
        return res.json({ ok: true });
      }
      case 'transfer': {
        if (me.role !== 'owner') return fail(res, 403, 'Only the owner can transfer ownership.');
        const a = await admin.from('profiles').update({ role: 'owner' }).eq('id', target.id);
        if (a.error) return fail(res, 400, a.error.message);
        const b = await admin.from('profiles').update({ role: 'admin' }).eq('id', me.id);
        if (b.error) return fail(res, 400, b.error.message);
        return res.json({ ok: true });
      }
      default:
        return fail(res, 400, 'Unknown action.');
    }
  } catch (e) {
    return fail(res, 500, e.message || 'Something went wrong.');
  }
}
