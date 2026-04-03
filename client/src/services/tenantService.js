import api from './api.js';

export const registerTenant = (payload) =>
  api.post('/tenants/register', payload);

export const getMyTenant = () =>
  api.get('/tenants/me');

export const updateTenant = (updates) =>
  api.patch('/tenants/me', updates);

export const updateBranding = (branding) =>
  api.patch('/tenants/me/branding', branding);

export const addMember = (contact) =>
  api.post('/tenants/me/members', { contact });

export const removeMember = (userId) =>
  api.delete(`/tenants/me/members/${userId}`);
