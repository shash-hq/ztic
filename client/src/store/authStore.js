import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode';

const isTokenExpired = (token) => {
  try {
    const { exp } = jwtDecode(token);
    // 10-second buffer to avoid edge-case expiry mid-request
    return Date.now() / 1000 > exp - 10;
  } catch {
    return true;
  }
};

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // ── State ───────────────────────────────────
      user:        null,   // { _id, name, email, phone, role, tenantId }
      accessToken: null,

      // ── Derived ─────────────────────────────────
      isAuthenticated: () => {
        const { accessToken } = get();
        return !!accessToken && !isTokenExpired(accessToken);
      },

      isRole: (role) => get().user?.role === role,

      // ── Actions ──────────────────────────────────
      setSession: (accessToken, user) => set({ accessToken, user }),

      updateAccessToken: (accessToken) => set({ accessToken }),

      clearSession: () => set({ user: null, accessToken: null }),

      updateUser: (updates) =>
        set((state) => ({ user: state.user ? { ...state.user, ...updates } : null })),
    }),
    {
      name:    'ztic-auth',
      storage: createJSONStorage(() => localStorage),
      // Only persist non-sensitive fields; access token in memory is fine
      // but we persist it here for page-reload UX — it's short-lived (15m)
      partialize: (state) => ({
        user:        state.user,
        accessToken: state.accessToken,
      }),
    }
  )
);
