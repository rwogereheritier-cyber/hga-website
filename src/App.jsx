import { Route, Routes } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import Home from './pages/public/Home';
import ComingSoon from './pages/public/ComingSoon';

const upcoming = [
  ['/programmes', 'Programmes'],
  ['/programmes/:slug', 'Programme'],
  ['/consultations', 'Book a consultation'],
  ['/events', 'Events & workshops'],
  ['/events/:id', 'Event'],
  ['/resources', 'Resources'],
  ['/resources/:slug', 'Article'],
  ['/books', 'Books & publications'],
  ['/about', 'About'],
  ['/corporate-responsibility', 'Corporate responsibility'],
  ['/contact', 'Contact'],
];

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<Home />} />
        {upcoming.map(([path, title]) => (
          <Route key={path} path={path} element={<ComingSoon title={title} />} />
        ))}
        <Route path="*" element={<ComingSoon title="Page not found" />} />
      </Route>
      <Route path="/admin/*" element={<ComingSoon title="Admin dashboard" />} />
    </Routes>
  );
}
