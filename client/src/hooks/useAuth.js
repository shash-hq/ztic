import { useCallback }    from 'react';
import { useNavigate }    from 'react-router-dom';
import { useAuthStore }   from '../store/authStore.js';
import { logout as logoutApi } from '../services/authService.js';

export const useAuth = () => {
  const navigate        = useNavigate();
  const setSession      = useAuthStore((s) => s.setSession);
  const clearSession    = useAuthStore((s) => s.clearSession);
  const user            = useAuthStore((s) => s.user);
  const accessToken     = useAuthStore((s) => s.accessToken);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());

  const login = useCallback((accessToken, user) => {
    setSession(accessToken, user);
  }, [setSession]);

  const logout = useCallback(async () => {
    try { await logoutApi(); } catch { /* best-effort */ }
    clearSession();
    navigate('/login', { replace: true });
  }, [clearSession, navigate]);

  return { user, accessToken, isAuthenticated, login, logout };
};
