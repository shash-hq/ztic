import api from './api.js';

export const sendOtp = (contact, channel) =>
  api.post('/auth/otp/send', { contact, channel });

export const verifyOtp = (contact, otp) =>
  api.post('/auth/otp/verify', { contact, otp });

export const sendMagicLink = (email) =>
  api.post('/auth/magic-link/send', { email });

export const verifyMagicLink = (token) =>
  api.get(`/auth/magic-link/verify?token=${token}`);

export const refreshToken = () =>
  api.post('/auth/token/refresh');

export const logout = () =>
  api.post('/auth/logout');

export const getMe = () =>
  api.get('/auth/me');
