import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '../common/Button';
import { announcement } from '../../data/site';

const links = [
  { to: '/programmes', label: 'Programmes' },
  { to: '/consultations', label: 'Consultations' },
  { to: '/events', label: 'Events' },
  { to: '/resources', label: 'Resources' },
  { to: '/about', label: 'About' },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="bg-maroon px-4 py-2 text-center text-[13px] text-champagne">
        {announcement.text} ·{' '}
        <Link to={announcement.href} className="text-white underline underline-offset-2">
          {announcement.cta}
        </Link>
      </div>
      <div className="border-b border-hairline">
        <div className="container-page flex h-16 items-center justify-between gap-6">
          <Link to="/" className="font-display text-[18px] text-charcoal">
            Hetty Global Academy
          </Link>

          <nav aria-label="Main" className="hidden items-center gap-8 text-[14px] lg:flex">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `transition-colors duration-200 hover:text-burgundy ${isActive ? 'font-medium text-burgundy' : 'text-charcoal'}`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden lg:block">
            <Button to="/consultations" size="sm">
              Book a consultation
            </Button>
          </div>

          <button
            type="button"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="-mr-2 flex h-11 w-11 items-center justify-center lg:hidden"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 9h16M4 15h16" />}
            </svg>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            aria-label="Mobile"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-b border-hairline bg-white lg:hidden"
          >
            <ul className="container-page flex flex-col py-4">
              {links.map((l) => (
                <li key={l.to}>
                  <NavLink to={l.to} className="block border-t border-hairline py-4 text-[19px] first:border-t-0">
                    {l.label}
                  </NavLink>
                </li>
              ))}
              <li className="pt-4">
                <Button to="/consultations" className="w-full">
                  Book a consultation
                </Button>
              </li>
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
