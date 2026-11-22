import { Link } from 'react-router-dom';
import { contact } from '../../data/site';

const columns = [
  {
    title: 'Programmes',
    links: [
      { to: '/programmes/nursing-education', label: 'Nursing education' },
      { to: '/programmes/mentorship', label: 'Mentorship' },
      { to: '/programmes/english-language', label: 'English' },
    ],
  },
  {
    title: 'Academy',
    links: [
      { to: '/about', label: 'About' },
      { to: '/corporate-responsibility', label: 'Responsibility' },
      { to: '/contact', label: 'Contact' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="container-page pb-12 pt-14 text-caption text-ink-muted">
      <div className="flex flex-wrap justify-between gap-10">
        <Link to="/" className="font-display text-[18px] text-charcoal">
          Hetty Global Academy
        </Link>
        <div className="flex flex-wrap gap-16">
          {columns.map((c) => (
            <div key={c.title} className="flex flex-col gap-2.5">
              <span className="font-medium text-charcoal">{c.title}</span>
              {c.links.map((l) => (
                <Link key={l.to} to={l.to} className="hover:text-burgundy">
                  {l.label}
                </Link>
              ))}
            </div>
          ))}
          <div className="flex flex-col gap-2.5">
            <span className="font-medium text-charcoal">Follow</span>
            {contact.socials.map((s) => (
              <a key={s.label} href={s.href} className="hover:text-burgundy">
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-10 flex flex-wrap justify-between gap-4 border-t border-hairline pt-5">
        <span>
          © {new Date().getFullYear()} Hetty Global Academy. NCLEX® and CELPIP® are trademarks of their owners; HGA is not
          affiliated.
        </span>
        <span>Privacy · Terms · Refunds</span>
      </div>
    </footer>
  );
}
