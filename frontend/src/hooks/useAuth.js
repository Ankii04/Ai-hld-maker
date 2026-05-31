import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'

/**
 * useAuth
 * -------
 * Convenience hook that exposes the full auth store API.
 * Import this instead of useAuthStore directly so we have
 * a single, consistent access point across the codebase.
 */
export const useAuth = () => {
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    signup,
    logout,
    fetchMe,
    updateUser,
    clearError,
  } = useAuthStore()

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    signup,
    logout,
    fetchMe,
    updateUser,
    clearError,
  }
}

/**
 * useRequireAuth
 * --------------
 * Redirect to /login if the user is not authenticated.
 * Use this at the top of any page that requires a logged-in user.
 * Note: prefer using <ProtectedRoute> at the router level — this
 * hook is for imperative/in-component guard scenarios.
 */
export const useRequireAuth = (redirectTo = '/login') => {
  const { isAuthenticated, isLoading } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate(redirectTo, { replace: true })
    }
  }, [isAuthenticated, isLoading, navigate, redirectTo])

  return { isAuthenticated, isLoading }
}

export default useAuth
