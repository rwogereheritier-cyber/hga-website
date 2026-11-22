import { Route, Routes } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import Home from './pages/public/Home';
import ComingSoon from './pages/public/ComingSoon';
import Programmes from './pages/public/Programmes';
import ProgrammeDetail from './pages/public/ProgrammeDetail';
import BookingPage from './features/booking/BookingPage';
import Events from './pages/public/Events';
import EventDetail from './pages/public/EventDetail';
import Resources from './pages/public/Resources';
import Article from './pages/public/Article';
import Books from './pages/public/Books';
import BookDetail from './pages/public/BookDetail';
import About from './pages/public/About';
import Responsibility from './pages/public/Responsibility';
import Contact from './pages/public/Contact';

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="/programmes" element={<Programmes />} />
        <Route path="/programmes/:slug" element={<ProgrammeDetail />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:id" element={<EventDetail />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/resources/:slug" element={<Article />} />
        <Route path="/books" element={<Books />} />
        <Route path="/books/:slug" element={<BookDetail />} />
        <Route path="/about" element={<About />} />
        <Route path="/corporate-responsibility" element={<Responsibility />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<ComingSoon title="Page not found" />} />
      </Route>
      <Route path="/consultations" element={<BookingPage />} />
      <Route path="/admin/*" element={<ComingSoon title="Admin dashboard" />} />
    </Routes>
  );
}
