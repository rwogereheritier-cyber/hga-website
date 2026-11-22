import { lazy, Suspense } from 'react';
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

const AdminLayout = lazy(() => import('./admin/AdminLayout'));
const Login = lazy(() => import('./admin/Login'));
const Overview = lazy(() => import('./admin/Overview'));
const Bookings = lazy(() => import('./admin/Bookings'));
const Clients = lazy(() => import('./admin/Clients'));
const Payments = lazy(() => import('./admin/Payments'));
const EventsAdmin = lazy(() => import('./admin/EventsAdmin'));
const Messages = lazy(() => import('./admin/Messages'));
const BlogAdmin = lazy(() => import('./admin/BlogAdmin'));
const BooksAdmin = lazy(() => import('./admin/BooksAdmin'));
const ResourcesAdmin = lazy(() => import('./admin/ResourcesAdmin'));
const Subscribers = lazy(() => import('./admin/Subscribers'));
const Content = lazy(() => import('./admin/Content'));
const Settings = lazy(() => import('./admin/Settings'));

const loading = <div className="p-10 text-[14px] text-ink-muted">Loading…</div>;

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
      <Route path="/admin/login" element={<Suspense fallback={loading}><Login /></Suspense>} />
      <Route path="/admin" element={<Suspense fallback={loading}><AdminLayout /></Suspense>}>
        <Route index element={<Suspense fallback={loading}><Overview /></Suspense>} />
        <Route path="bookings" element={<Suspense fallback={loading}><Bookings /></Suspense>} />
        <Route path="clients" element={<Suspense fallback={loading}><Clients /></Suspense>} />
        <Route path="payments" element={<Suspense fallback={loading}><Payments /></Suspense>} />
        <Route path="events" element={<Suspense fallback={loading}><EventsAdmin /></Suspense>} />
        <Route path="messages" element={<Suspense fallback={loading}><Messages /></Suspense>} />
        <Route path="blog" element={<Suspense fallback={loading}><BlogAdmin /></Suspense>} />
        <Route path="books" element={<Suspense fallback={loading}><BooksAdmin /></Suspense>} />
        <Route path="resources" element={<Suspense fallback={loading}><ResourcesAdmin /></Suspense>} />
        <Route path="subscribers" element={<Suspense fallback={loading}><Subscribers /></Suspense>} />
        <Route path="content" element={<Suspense fallback={loading}><Content /></Suspense>} />
        <Route path="settings" element={<Suspense fallback={loading}><Settings /></Suspense>} />
        <Route path="*" element={<ComingSoon title="Page not found" />} />
      </Route>
    </Routes>
  );
}
