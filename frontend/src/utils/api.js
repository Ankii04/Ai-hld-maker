import axios from 'axios'

/**
 * Pre-configured Axios instance for ArchMind API calls.
 *
 * Base URL resolves to VITE_API_URL env variable (production) or
 * falls back to '/api' which is proxied to localhost:5000 in dev via vite.config.js.
 *
 * Timeout: 120 s — generous to accommodate long AI generation requests.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 300000,
  headers: {
    'Content-Type': 'application/json',
  },
})

/* ---------------------------------------------------------------
   Request Interceptor
   Reads the persisted Zustand auth slice from localStorage and
   injects the JWT as a Bearer token on every outgoing request.
--------------------------------------------------------------- */
api.interceptors.request.use(
  (config) => {
    try {
      const stored = localStorage.getItem('archmind-auth')
      if (stored) {
        const parsed = JSON.parse(stored)
        const token = parsed?.state?.token
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
      }
    } catch {
      // Silently ignore malformed storage entries
    }
    return config
  },
  (error) => Promise.reject(error),
)

/* ---------------------------------------------------------------
   Response Interceptor
   • On success: unwrap `response.data` so callers receive the
     payload directly (no need to do `.data` everywhere).
   • On error: normalise into a plain object with `message`,
     `data`, and `status` so UI layers can handle it uniformly.
--------------------------------------------------------------- */
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Something went wrong'

    return Promise.reject({
      message,
      data: error.response?.data ?? null,
      status: error.response?.status ?? null,
    })
  },
)

export default api
