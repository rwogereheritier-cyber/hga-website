import { useEffect, useState } from 'react';
import { Link, Navigate, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import Toaster from '../components/common/Toaster';
import { useStore } from '../lib/store';
import { isSignedIn, signOut } from './auth';

const groups = [
  {
    items: [
      ['/admin', 'Overview'],
      ['/admin/bookings', 'Bookings'],
      ['/admin/clients', 'Clients'],
      ['/admin/payments', 'Payments'],
      ['/admin/events', 'Events & workshops'],
      ['/admin/messages', 'Messages'],
    ],
  },
  {
    title: 'Content',
    items: [
      ['/admin/blog', 'Blog'],
      ['/admin/books', 'Books & publications'],
      ['/admin/resources', 'Resources'],
      ['/admin/subscribers', 'Newsletter subscribers'],
      ['/admin/content', 'Website content'],
    ],
  },
];

const later = ['Courses', 'Students', 'Certificates'];

export default function AdminLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const messages = useStore('messages');
  const unread = messages.filter((m) => m.status === 'New').length;

  useEffect(() => {
    setOpen(false);
    window.scrollTo(0, 0);
  }, [pathname]);

  if (!isSignedIn()) return <Navigate to="/admin/login" replace state={{ from: pathname }} />;

  const link = ({ isActive }) =>
    `flex items-center justify-between rounded-md px-3 py-2.5 text-[14px] transition-colors ${
      isActive ? 'border border-hairline bg-white font-medium text-charcoal' : 'text-[#4A454B] hover:text-charcoal'
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
        className={`${open ? 'flex' : 'hidden'} w-full flex-col gap-0.5 border-r border-hairline bg-[#FAF9F7] px-4 py-6 lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-[248px] lg:shrink-0 lg:overflow-y-auto`}
      >
        <Link to="/admin" className="hidden px-3 pb-8 font-display text-[18px] lg:block">
          HGA Admin
        </Link>
        {groups.map((g, gi) => (
          <div key={gi} className="flex flex-col gap-0.5">
            {g.title && <span className="px-3 pb-2 pt-6 text-[12px] text-ink-muted">{g.title}</span>}
            {g.items.map(([to, label]) => (
              <NavLink key={to} to={to} end={to === '/admin'} className={link}>
                {label}
                {label === 'Messages' && unread > 0 && (
                  <span className="rounded-full bg-burgundy px-2 py-0.5 text-[11px] font-medium text-white">{unread}</span>
                )}
              </NavLink>
            ))}
          </div>
        ))}
        <span className="px-3 pb-2 pt-6 text-[12px] text-ink-muted">Coming later</span>
        {later.map((l) => (
          <span key={l} className="px-3 py-2 text-[14px] text-[#A39CA2]">
            {l}
          </span>
        ))}
        <div className="mt-6 flex flex-col gap-0.5 border-t border-hairline pt-4 lg:mt-auto">
          <NavLink to="/admin/settings" className={link}>
            Settings
          </NavLink>
          <Link to="/" className="px-3 py-2.5 text-[14px] text-[#4A454B] hover:text-charcoal">
            View website ↗
          </Link>
          <button
            type="button"
            onClick={() => {
              signOut();
              navigate('/admin/login');
            }}
            className="px-3 py-2.5 text-left text-[14px] text-[#4A454B] hover:text-charcoal"
          >
            Log out
          </button>
        </div>
      </nav>

      <main className="min-w-0 flex-1 px-5 py-8 md:px-10 md:py-12 lg:px-14">
        <Outlet />
      </main>
      <Toaster />
    </div>
  );
}
