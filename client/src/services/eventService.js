import api from './api.js';

export const fetchEvents = (params = {}) =>
  api.get('/events', { params });

export const fetchEventBySlug = (slug) =>
  api.get(`/events/${slug}`);

export const fetchShowsForEvent = (slug) =>
  api.get(`/events/${slug}/shows`);
