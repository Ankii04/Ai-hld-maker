import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../utils/api'

/**
 * Auth store — persists token + user to localStorage via Zustand persist.
 * Only the `token` and `user` slices are stored (not transient flags).
 */
const useAuthStore = create(
  persist(
    (set, get) => ({
      /* ─── State ─────────────────────────────────────────── */
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      /* ─── Login ──────────────────────────────────────────── */
      login: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
          const data = await api.post('/auth/login', { email, password })
          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
          return { success: true, user: data.user }
        } catch (err) {
          set({ isLoading: false, error: err.message })
          return { success: false, message: err.message }
        }
      },

      /* ─── Signup ─────────────────────────────────────────── */
      signup: async (name, email, password) => {
        set({ isLoading: true, error: null })
        try {
          const data = await api.post('/auth/signup', { name, email, password })
          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
          return { success: true, user: data.user }
        } catch (err) {
          set({ isLoading: false, error: err.message })
          return { success: false, message: err.message }
        }
      },

      /* ─── Logout ─────────────────────────────────────────── */
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        })
      },

      /* ─── Fetch current user (refresh session) ────────────── */
      fetchMe: async () => {
        const { token } = get()
        if (!token) return { success: false, message: 'No token' }

        set({ isLoading: true, error: null })
        try {
          const data = await api.get('/auth/me')
          const fetchedUser = data.data || data.user
          set({
            user: fetchedUser,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
          return { success: true, user: fetchedUser }
        } catch (err) {
          // Token expired or invalid — clear session
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: err.message,
          })
          return { success: false, message: err.message }
        }
      },

      /* ─── Patch user fields locally (e.g. after profile edit) */
      updateUser: (updates) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : updates,
        }))
      },

      /* ─── Clear transient error ───────────────────────────── */
      clearError: () => set({ error: null }),
    }),

    {
      name: 'archmind-auth',
      // Only persist token + user — avoid persisting loading/error flags
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      // Rehydrate: if a token exists in storage, mark as authenticated
      onRehydrateStorage: () => (state) => {
        if (state?.token && state?.user) {
          state.isAuthenticated = true
        }
      },
    },
  ),
)

export default useAuthStore
