import { Route, Routes } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import Home from './pages/public/Home';
import ComingSoon from './pages/public/ComingSoon';
import Programmes from './pages/public/Programmes';
import ProgrammeDetail from './pages/public/ProgrammeDetail';
import BookingPage from './features/booking/BookingPage';

const upcoming = [
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
        <Route path="/programmes" element={<Programmes />} />
        <Route path="/programmes/:slug" element={<ProgrammeDetail />} />
        {upcoming.map(([path, title]) => (
          <Route key={path} path={path} element={<ComingSoon title={title} />} />
        ))}
        <Route path="*" element={<ComingSoon title="Page not found" />} />
      </Route>
      <Route path="/consultations" element={<BookingPage />} />
      <Route path="/admin/*" element={<ComingSoon title="Admin dashboard" />} />
    </Routes>
  );
}
