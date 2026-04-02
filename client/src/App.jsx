import {BrowserRouter, Routes, Route} from 'react-router-dom';
import ErrorBoundary from './components/ui/ErrorBoundary.jsx';
import LandingPage from './pages/LandingPage.jsx';
import EventsPage from './pages/EventsPage.jsx';
import SeatSelectionPage from './pages/SeatSelectionPage.jsx';
import ConfirmationPage from './pages/ConfirmationPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route
            path="/events/:slug/shows/:showId"
            element={<SeatSelectionPage />}
          />
          <Route
            path="/confirmation/:orderRef"
            element={<ConfirmationPage />}
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
