import { useEffect, useState } from 'react';
import { Link, Navigate, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import Toaster from '../components/common/Toaster';
import { hydrateAdmin } from '../lib/live';
import CommandPalette from './CommandPalette';
import HelpPanel from './HelpPanel';
import { useStore } from '../lib/store';
import { LIVE } from '../lib/supabase';
import { setDemoRole, signOut, useSession } from './auth';
import { ROLES, ROLE_INFO, areaOf, canView } from './permissions';

const groups = [
  { items: [['overview', '/admin', 'Overview']] },
  {
    title: 'Work',
    items: [
      ['bookings', '/admin/bookings', 'Bookings'],
      ['clients', '/admin/clients', 'Clients'],
      ['events', '/admin/events', 'Events'],
      ['messages', '/admin/messages', 'Messages'],
      ['payments', '/admin/payments', 'Payments'],
    ],
  },
  {
    title: 'Website',
    items: [
      ['content', '/admin/content', 'Pages & text'],
      ['media', '/admin/media', 'Photos'],
      ['blog', '/admin/blog', 'Blog'],
      ['books', '/admin/books', 'Books'],
      ['resources', '/admin/resources', 'Resources'],
      ['subscribers', '/admin/subscribers', 'Newsletter'],
    ],
  },
  {
    title: 'Manage',
    items: [
      ['team', '/admin/team', 'Team'],
      ['connections', '/admin/connections', 'Connections'],
      ['settings', '/admin/settings', 'Settings'],
    ],
  },
];

function NoAccess({ role }) {
  return (
    <div className="flex max-w-[520px] flex-col gap-3 pt-10">
      <h1 className="font-display text-[32px]">This area isn’t part of your role.</h1>
      <p className="text-[15px] text-ink-muted">
        You’re signed in as {ROLE_INFO[role]?.label}. Ask the owner or an admin if you need access.
      </p>
      <Link to="/admin" className="font-medium text-burgundy">
        Back to overview ›
      </Link>
    </div>
  );
}

export default function AdminLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { loading, user, profile } = useSession();
  const [open, setOpen] = useState(false);
  const messages = useStore('messages');
  const unread = messages.filter((m) => m.status === 'New').length;

  useEffect(() => {
    setOpen(false);
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    if (profile) hydrateAdmin();
  }, [profile]);

  if (loading) return <div className="p-10 text-[14px] text-ink-muted">Loading your dashboard…</div>;
  if (!user) return <Navigate to="/admin/login" replace state={{ from: pathname }} />;
  if (!profile || profile.status === 'disabled') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="font-display text-[30px]">Your access is paused.</h1>
        <p className="max-w-[420px] text-ink-muted">Ask the owner of Hetty Global Academy to restore it.</p>
        <button type="button" onClick={() => signOut()} className="font-medium text-burgundy">Sign out</button>
      </div>
    );
  }

  const role = profile.role;
  const area = areaOf(pathname);

  const link = ({ isActive }) =>
    `flex items-center justify-between rounded-md px-3 py-2 text-[14px] transition-colors ${
      isActive ? 'border border-hairline bg-white font-medium text-charcoal' : 'border border-transparent text-[#4A454B] hover:text-charcoal'
    }`;

  return (
    <div className="flex min-h-screen flex-col bg-white text-charcoal lg:flex-row">
      <div className="flex items-center justify-between border-b border-hairline bg-[#FAF9F7] px-5 py-3 lg:hidden">
        <span className="font-display text-[17px]">HGA Admin</span>
        <button type="button" aria-expanded={open} onClick={() => setOpen(!open)} className="rounded-full border border-hairline bg-white px-4 py-2 text-[14px]">
          {open ? 'Close' : 'Menu'}
        </button>
      </div>

      <nav
        aria-label="Admin"
        className={`${open ? 'flex' : 'hidden'} w-full flex-col gap-0.5 border-r border-hairline bg-[#FAF9F7] px-4 py-6 lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-[240px] lg:shrink-0 lg:overflow-y-auto`}
      >
        <Link to="/admin" className="hidden px-3 pb-4 font-display text-[18px] lg:block">
          HGA Admin
        </Link>
        <button
          type="button"
          onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
          className="mb-2 flex items-center justify-between rounded-md border border-hairline bg-white px-3 py-2 text-[13px] text-ink-muted hover:border-charcoal"
        >
          Search
          <kbd className="rounded border border-hairline px-1.5 text-[11px]">Ctrl K</kbd>
        </button>
        {groups.map((g, gi) => {
          const items = g.items.filter(([a]) => canView(role, a));
          if (!items.length) return null;
          return (
            <div key={gi} className="flex flex-col gap-0.5">
              {g.title && <span className="px-3 pb-1.5 pt-5 text-[12px] text-ink-muted">{g.title}</span>}
              {items.map(([a, to, label]) => (
                <NavLink key={to} to={to} end={to === '/admin'} className={link}>
                  {label}
                  {a === 'messages' && unread > 0 && <span className="rounded-full bg-burgundy px-2 py-0.5 text-[11px] font-medium text-white">{unread}</span>}
                </NavLink>
              ))}
            </div>
          );
        })}

        <div className="mt-6 flex flex-col gap-0.5 border-t border-hairline pt-4 lg:mt-auto">
          <NavLink to="/admin/help" className={link}>
            Help & guides
          </NavLink>
          <Link to="/" className="px-3 py-2 text-[14px] text-[#4A454B] hover:text-charcoal">
            View website ↗
          </Link>
          <div className="mt-3 flex flex-col gap-2 rounded-md bg-white px-3 py-3 text-[13px]">
            <span className="truncate font-medium">{profile.full_name || profile.email}</span>
            <span className="text-ink-muted">{ROLE_INFO[role].label}</span>
            {!LIVE && (
              <label className="flex flex-col gap-1 text-ink-muted">
                Preview as (demo)
                <select value={role} onChange={(e) => { setDemoRole(e.target.value); navigate('/admin'); }} className="rounded border border-hairline px-1 py-1 text-charcoal">
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{ROLE_INFO[r].label}</option>
                  ))}
                </select>
              </label>
            )}
            <button
              type="button"
              onClick={async () => {
                await signOut();
                navigate('/admin/login');
              }}
              className="self-start font-medium text-burgundy"
            >
              Log out
            </button>
          </div>
        </div>
      </nav>

      <main className="min-w-0 flex-1 px-5 py-8 md:px-10 md:py-12 lg:px-14">
        <div className="mb-8 flex flex-wrap items-center justify-end gap-3">
          {!LIVE && (
            <p className="mr-auto rounded-md bg-[#FBF3E4] px-4 py-2 text-[13px] text-[#7A4E0B]">
              Demo mode: data is saved in this browser only until the real backend is connected.
            </p>
          )}
          <HelpPanel area={area} />
        </div>
        {canView(role, area) ? <Outlet /> : <NoAccess role={role} />}
      </main>
      <CommandPalette role={role} />
      <Toaster />
    </div>
  );
}
