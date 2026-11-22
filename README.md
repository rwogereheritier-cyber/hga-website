# Hetty Global Academy — website

Interactive frontend prototype for Hetty Global Academy (HGA). Built with React 18, Vite, Tailwind CSS, React Router and Framer Motion. Data is mock data in `src/data` (localStorage persistence comes with the booking and admin features).

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

## Structure

```
src/
  components/common       Button, LinkAction, Reveal (motion), ImagePlaceholder
  components/navigation   Header (sticky, mobile menu), Footer
  layouts                 PublicLayout (later: AdminLayout)
  pages/public            Home, ComingSoon (temporary for unbuilt routes)
  data/site.js            Demo content — every TODO needs client confirmation
  data/services.js        Consultations, prices and programme content
  features/booking        Booking flow and calendar
  lib/time.js             Availability in Hetty's time zone, shown in the visitor's
  lib/store.js            Demo data store shared with the admin dashboard
  styles/index.css        Tailwind layers + shared classes
tailwind.config.js        Design tokens (HGA design system v1)
```

## Design rules

Follow the HGA design system: white page, burgundy as the single accent, gold only for thin rules and large numerals, cards at 16px radius maximum, 160px section spacing, motion only for hover, gentle reveal and step transitions (respecting reduced motion).

## Status

- [x] Foundation: tokens, layout, header, footer, routes
- [x] Home page
- [x] Programmes catalogue (search, filters) and programme pages
- [x] Booking flow: 4 steps, time zones, validation, simulated payment, confirmation, .ics and summary download
- [x] Shared demo store (localStorage): bookings, payments, newsletter subscribers
- [x] Events (tabs, search, filters, detail, registration with demo payment)
- [x] Resources (articles, search, filters, article page, share, related)
- [x] Books (detail, format choice, demo purchase, placeholder download) and resource library
- [x] About, Corporate responsibility, Contact (validated form + FAQ)
- [ ] Admin dashboard (demo login)

NCLEX® and CELPIP® are trademarks of their owners; HGA is not affiliated.
