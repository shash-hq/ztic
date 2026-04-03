import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useTenantStore = create(
  persist(
    (set) => ({
      // ── State ─────────────────────────────────────
      tenant:   null,   // Full Tenant document from API
      loading:  false,
      error:    null,

      // ── Actions ───────────────────────────────────
      setTenant:   (tenant) => set({ tenant, error: null }),

      updateTenantField: (updates) =>
        set((state) => ({
          tenant: state.tenant ? { ...state.tenant, ...updates } : null,
        })),

      updateBranding: (branding) =>
        set((state) => ({
          tenant: state.tenant
            ? { ...state.tenant, branding: { ...state.tenant.branding, ...branding } }
            : null,
        })),

      setLoading: (loading) => set({ loading }),
      setError:   (error)   => set({ error }),
      clearTenant: ()       => set({ tenant: null, error: null }),
    }),
    {
      name:       'ztic-tenant',
      storage:    createJSONStorage(() => localStorage),
      partialize: (state) => ({ tenant: state.tenant }),
    }
  )
);
