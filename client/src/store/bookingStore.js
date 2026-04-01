import { create } from 'zustand';
import { v4 as uuid } from 'uuid';

// Session ID persists for the lifetime of the browser tab
// Used to tie seat reservations to this client
const SESSION_ID = uuid();

export const useBookingStore = create((set, get) => ({
  // ── Session ───────────────────────────────────
  sessionId: SESSION_ID,

  // ── Current show context ──────────────────────
  currentShow: null,       // Show object from API
  currentEvent: null,      // Event object from API
  seatMatrix: [],          // 2D array of seat rows from API

  // ── Seat selection (local before reserve API) ─
  selectedSeatIds: new Set(),

  // ── Confirmed booking result ──────────────────
  confirmedBooking: null,

  // ── Loading / error ───────────────────────────
  isLoading: false,
  error: null,

  // ── Actions ───────────────────────────────────
  setShow: (show, event) => set({ currentShow: show, currentEvent: event }),

  setSeatMatrix: (matrix) => set({ seatMatrix: matrix }),

  toggleSeatSelection: (seatId) => {
    const next = new Set(get().selectedSeatIds);
    if (next.has(seatId)) {
      next.delete(seatId);
    } else {
      next.add(seatId);
    }
    set({ selectedSeatIds: next });
  },

  clearSelection: () => set({ selectedSeatIds: new Set() }),

  // Called after Socket.IO broadcasts seat changes from other users
  applyExternalSeatUpdate: (updatedSeats) => {
    const matrix = get().seatMatrix.map((row) =>
      row.map((seat) => {
        const update = updatedSeats.find(
          (u) => u.id === seat._id.toString()
        );
        return update ? { ...seat, status: update.status } : seat;
      })
    );
    set({ seatMatrix: matrix });
  },

  setConfirmedBooking: (booking) => set({ confirmedBooking: booking }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  reset: () =>
    set({
      currentShow: null,
      currentEvent: null,
      seatMatrix: [],
      selectedSeatIds: new Set(),
      confirmedBooking: null,
      isLoading: false,
      error: null,
    }),
}));
