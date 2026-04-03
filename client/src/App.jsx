import {BrowserRouter, Routes, Route} from 'react-router-dom';
import ErrorBoundary from './components/ui/ErrorBoundary.jsx';
import ProtectedRoute from './components/ui/ProtectedRoute.jsx';
import LandingPage from './pages/LandingPage.jsx';
import EventsPage from './pages/EventsPage.jsx';
import SeatSelectionPage from './pages/SeatSelectionPage.jsx';
import ConfirmationPage from './pages/ConfirmationPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import MagicLinkPage from './pages/MagicLinkPage.jsx';
import ForbiddenPage from './pages/ForbiddenPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

// Organizer portal placeholder — replaced in Phase 6
const OrganizerPortal = () => (
  <div
    style={{
      padding: 40,
      fontFamily: 'Space Grotesk, sans-serif',
      fontWeight: 900,
      fontSize: 28,
    }}>
    Organizer Portal — Phase 6
  </div>
);

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/magic" element={<MagicLinkPage />} />
          <Route path="/403" element={<ForbiddenPage />} />

          {/* Protected — any authenticated user */}
          <Route
            path="/events/:slug/shows/:showId"
            element={
              <ProtectedRoute>
                <SeatSelectionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/confirmation/:orderRef"
            element={
              <ProtectedRoute>
                <ConfirmationPage />
              </ProtectedRoute>
            }
          />

          {/* Protected — organizer + admin only */}
          <Route
            path="/organizer/*"
            element={
              <ProtectedRoute roles={['organizer', 'admin']}>
                <OrganizerPortal />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
