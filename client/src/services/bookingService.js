import api from './api.js';

export const fetchSeatMap = (showId) =>
  api.get(`/shows/${showId}/seats`);

export const reserveSeats = (showId, seatIds, sessionId) =>
  api.post('/seats/reserve', { showId, seatIds, sessionId });

export const releaseSeats = (seatIds, sessionId) =>
  api.delete('/seats/reserve', { data: { seatIds, sessionId } });

export const createBooking = (showId, seatIds, customerEmail, sessionId) =>
  api.post('/bookings', { showId, seatIds, customerEmail, sessionId });

export const fetchBooking = (orderRef) =>
  api.get(`/bookings/${orderRef}`);
