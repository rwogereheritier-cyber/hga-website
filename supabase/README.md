# Backend setup (Supabase)

The website runs in **demo mode** (browser storage) until these steps are done. After that it runs
on the real database: real accounts, team roles, photo storage and saved content.

## 1. Run the database script (once)
1. Supabase → your project → **SQL Editor** → **New query**.
2. Paste the whole of `migrations/0001_foundation.sql` and click **Run**.
   It is safe to run again; it skips anything that already exists.

## 2. Settings in Supabase
- **Authentication → Sign In / Providers → Email**: keep Email on; turn **off** "Allow new users to sign up"
  (the dashboard is invite-only).
- **Authentication → URL Configuration**:
  - Site URL: `https://hga-website-zeta.vercel.app` (later: the real domain)
  - Redirect URLs: add `https://hga-website-zeta.vercel.app/admin/welcome` and `http://localhost:5173/admin/welcome`

## 3. Environment variables in Vercel (Settings → Environment Variables)
| Name | Value | Secret? |
|---|---|---|
| `VITE_SUPABASE_URL` | Project URL | No |
| `VITE_SUPABASE_ANON_KEY` | anon / public key | No |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key | **Yes, never in the browser or chat** |

Redeploy after adding them.

## 4. Create the owner account
Supabase → **Authentication → Users → Invite user** → Hetty's email.
The first account created becomes the **owner** automatically. She sets her password from the email,
then invites everyone else from the dashboard (Team).

For local development, copy `.env.example` to `.env.local` with the two public values.
`/api` functions run on Vercel; use `vercel dev` locally to test them.
