import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom'
import { Toaster, toast } from 'react-hot-toast'
import useAuthStore from './store/authStore'
import ErrorBoundary from './components/shared/ErrorBoundary'

/* ─── Lazy-loaded pages ─────────────────────────────────────── */
const Landing     = lazy(() => import('./pages/Landing'))
const Login       = lazy(() => import('./pages/Login'))
const Signup      = lazy(() => import('./pages/Signup'))
const Dashboard   = lazy(() => import('./pages/Dashboard'))
const Editor      = lazy(() => import('./pages/Editor'))
const PublicShare = lazy(() => import('./pages/PublicShare'))
const NotFound    = lazy(() => import('./pages/NotFound'))

/* ─── Full-screen loading fallback ────────────────────────────── */
const PageLoader = () => (
  <div
    style={{
      minHeight: '100vh',
      background: '#0a0a0f',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '16px',
    }}
  >
    {/* Animated ArchMind logo-mark */}
    <div style={{ position: 'relative', width: 48, height: 48 }}>
      <div
        style={{
          width: 48,
          height: 48,
          border: '2px solid rgba(59,130,246,0.15)',
          borderTop: '2px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 0.9s linear infinite',
        }}
      />
    </div>
    <span
      style={{
        fontFamily: '"Space Grotesk", sans-serif',
        fontSize: 13,
        color: '#94a3b8',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
      }}
    >
      Loading…
    </span>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
)

/* ─── Protected Route wrapper ──────────────────────────────────── */
/**
 * Renders children only when the user is authenticated.
 * Falls back to /login with the current location saved in state
 * so we can redirect back after login.
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore()

  if (isLoading) {
    return <PageLoader />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

/* ─── Public Share page wrapper ─────────────────────────────────── */
/**
 * Thin wrapper that extracts :shareId and passes it down.
 * The actual PublicShare page is a lazy-loaded component.
 */
const PublicShareWrapper = () => {
  const { shareId } = useParams()
  return (
    <Suspense fallback={<PageLoader />}>
      <PublicShare shareId={shareId} readOnly />
    </Suspense>
  )
}

/* ─── Toaster configuration ─────────────────────────────────────── */
const toasterOptions = {
  position: 'top-right',
  gutter: 10,
  toastOptions: {
    duration: 4000,
    style: {
      background: '#12121a',
      color: '#f1f5f9',
      border: '1px solid #2a2a3d',
      borderRadius: '10px',
      fontFamily: '"Inter", system-ui, sans-serif',
      fontSize: '14px',
      padding: '12px 16px',
      boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
      maxWidth: '380px',
    },
    success: {
      iconTheme: {
        primary: '#10b981',
        secondary: '#12121a',
      },
      style: {
        background: '#12121a',
        color: '#f1f5f9',
        border: '1px solid rgba(16,185,129,0.35)',
      },
    },
    error: {
      iconTheme: {
        primary: '#ef4444',
        secondary: '#12121a',
      },
      style: {
        background: '#12121a',
        color: '#f1f5f9',
        border: '1px solid rgba(239,68,68,0.35)',
      },
    },
    loading: {
      iconTheme: {
        primary: '#3b82f6',
        secondary: '#12121a',
      },
      style: {
        background: '#12121a',
        color: '#f1f5f9',
        border: '1px solid rgba(59,130,246,0.35)',
      },
    },
  },
}

/* ─── Root App Component ────────────────────────────────────────── */
const App = () => {
  useEffect(() => {
    const handleWindowError = (event) => {
      console.error('Global Error:', event.error || event.message)
      toast.error('An unexpected error occurred.')
    }

    const handleUnhandledRejection = (event) => {
      console.error('Unhandled Promise Rejection:', event.reason)
      toast.error('A background task failed unexpectedly.')
    }

    window.addEventListener('error', handleWindowError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleWindowError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  return (
    <BrowserRouter>
      {/* Global toast notifications */}
      <Toaster {...toasterOptions} />

      <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* ── Public routes ── */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* ── Public read-only design share ── */}
          <Route path="/share/:shareId" element={<PublicShareWrapper />} />

          {/* ── Protected routes ── */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/editor"
            element={
              <ProtectedRoute>
                <Editor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/editor/:id"
            element={
              <ProtectedRoute>
                <Editor />
              </ProtectedRoute>
            }
          />

          {/* ── 404 fallback ── */}
          <Route path="*" element={<Navigate to="/404" replace />} />
          <Route path="/404" element={<NotFound />} />
        </Routes>
      </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  )
}

export default App
