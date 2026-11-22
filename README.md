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
  styles/index.css        Tailwind layers + shared classes
tailwind.config.js        Design tokens (HGA design system v1)
```

## Design rules

Follow the HGA design system: white page, burgundy as the single accent, gold only for thin rules and large numerals, cards at 16px radius maximum, 160px section spacing, motion only for hover, gentle reveal and step transitions (respecting reduced motion).

## Status

- [x] Foundation: tokens, layout, header, footer, routes
- [x] Home page
- [ ] Programme pages
- [ ] Booking flow (4 steps, simulated payment, confirmation)
- [ ] Events, Resources, Books, About, Corporate responsibility, Contact
- [ ] Admin dashboard (demo login)

NCLEX® and CELPIP® are trademarks of their owners; HGA is not affiliated.
