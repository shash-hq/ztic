import {BrowserRouter, Routes, Route} from 'react-router-dom';
import LandingPage from './pages/LandingPage.jsx';
import EventsPage from './pages/EventsPage.jsx';
import SeatSelectionPage from './pages/SeatSelectionPage.jsx';
import ConfirmationPage from './pages/ConfirmationPage.jsx';

// Placeholder pages — wired in 3B/3C/3D
function EventsPage_() {
  return (
    <div style={{padding: 40, fontFamily: 'Space Grotesk'}}>
      Events — Phase 3B
    </div>
  );
}
function SeatSelectionPage_() {
  return (
    <div style={{padding: 40, fontFamily: 'Space Grotesk'}}>
      Seat Selection — Phase 3C
    </div>
  );
}
function ConfirmationPage_() {
  return (
    <div style={{padding: 40, fontFamily: 'Space Grotesk'}}>
      Confirmation — Phase 3D
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route
          path="/events/:slug/shows/:showId"
          element={<SeatSelectionPage />}
        />
        <Route path="/confirmation/:orderRef" element={<ConfirmationPage />} />
      </Routes>
    </BrowserRouter>
  );
}
