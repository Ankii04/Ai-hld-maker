import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, BrainCircuit, Loader2, AlertCircle, Network, Database, Code2, Zap } from 'lucide-react'
import useAuthStore from '../store/authStore'

/* ─────────────────────────── Decorative Left Panel ─────────────────────────── */

const floatingNodes = [
  { label: 'API Gateway', x: '10%', y: '15%', color: 'blue', delay: '0s' },
  { label: 'Auth Service', x: '60%', y: '10%', color: 'purple', delay: '0.3s' },
  { label: 'PostgreSQL', x: '75%', y: '40%', color: 'cyan', delay: '0.6s' },
  { label: 'Redis Cache', x: '15%', y: '55%', color: 'green', delay: '0.9s' },
  { label: 'Message Queue', x: '55%', y: '65%', color: 'yellow', delay: '1.2s' },
  { label: 'CDN Layer', x: '30%', y: '80%', color: 'pink', delay: '1.5s' },
]

const nodeColors = {
  blue: { bg: 'bg-blue-500/15', border: 'border-blue-500/30', text: 'text-blue-400' },
  purple: { bg: 'bg-purple-500/15', border: 'border-purple-500/30', text: 'text-purple-400' },
  cyan: { bg: 'bg-cyan-500/15', border: 'border-cyan-500/30', text: 'text-cyan-400' },
  green: { bg: 'bg-green-500/15', border: 'border-green-500/30', text: 'text-green-400' },
  yellow: { bg: 'bg-yellow-500/15', border: 'border-yellow-500/30', text: 'text-yellow-400' },
  pink: { bg: 'bg-pink-500/15', border: 'border-pink-500/30', text: 'text-pink-400' },
}

const codeLines = [
  { code: 'POST /api/v1/auth/login', color: 'text-blue-400' },
  { code: '  Content-Type: application/json', color: 'text-[#94a3b8]' },
  { code: '  { "email": "...", "password": "..." }', color: 'text-cyan-400' },
  { code: '', color: '' },
  { code: '→ 200 OK { "token": "eyJhb..." }', color: 'text-green-400' },
  { code: '', color: '' },
  { code: 'GET /api/v1/designs', color: 'text-purple-400' },
  { code: '  Authorization: Bearer <token>', color: 'text-[#94a3b8]' },
  { code: '→ 200 OK { designs: [...] }', color: 'text-green-400' },
]

const LeftPanel = () => (
  <div className="hidden lg:flex flex-col relative w-1/2 min-h-screen bg-[#0d0d15] border-r border-[#2a2a3d] overflow-hidden">
    {/* Grid bg */}
    <div
      className="absolute inset-0 opacity-[0.04]"
      style={{
        backgroundImage: `
          linear-gradient(to right, #3b82f6 1px, transparent 1px),
          linear-gradient(to bottom, #3b82f6 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px',
      }}
    />
    {/* Glow orbs */}
    <div className="absolute top-1/4 left-1/3 w-64 h-64 rounded-full bg-blue-600/10 blur-[80px]" />
    <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-purple-600/10 blur-[60px]" />

    {/* Floating architecture nodes */}
    {floatingNodes.map(({ label, x, y, color, delay }) => {
      const c = nodeColors[color]
      return (
        <div
          key={label}
          className={`absolute px-3 py-1.5 rounded-lg ${c.bg} border ${c.border} animate-pulse`}
          style={{ left: x, top: y, animationDelay: delay, animationDuration: '3s' }}
        >
          <span className={`text-[11px] font-mono font-semibold ${c.text}`}>{label}</span>
        </div>
      )
    })}

    {/* SVG connector lines */}
    <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
      <line x1="20%" y1="18%" x2="65%" y2="13%" stroke="#3b82f6" strokeWidth="1" strokeDasharray="4 4" />
      <line x1="65%" y1="13%" x2="80%" y2="43%" stroke="#8b5cf6" strokeWidth="1" strokeDasharray="4 4" />
      <line x1="80%" y1="43%" x2="60%" y2="68%" stroke="#06b6d4" strokeWidth="1" strokeDasharray="4 4" />
      <line x1="20%" y1="58%" x2="60%" y2="68%" stroke="#22c55e" strokeWidth="1" strokeDasharray="4 4" />
      <line x1="35%" y1="83%" x2="60%" y2="68%" stroke="#ec4899" strokeWidth="1" strokeDasharray="4 4" />
    </svg>

    {/* Center code block */}
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-80 bg-[#12121a]/90 border border-[#2a2a3d] rounded-xl overflow-hidden shadow-2xl backdrop-blur-sm">
        {/* Terminal header */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[#2a2a3d] bg-[#0a0a0f]/60">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
          <span className="ml-2 text-[10px] text-[#94a3b8] font-mono">api-spec.yaml</span>
        </div>
        <div className="p-4 space-y-1">
          {codeLines.map((line, i) => (
            <p key={i} className={`text-[11px] font-mono ${line.color || 'text-transparent'}`}>
              {line.code || '\u00A0'}
            </p>
          ))}
        </div>
        <div className="px-4 py-2 border-t border-[#2a2a3d] flex items-center gap-2">
          <Zap className="w-3 h-3 text-yellow-400" />
          <span className="text-[10px] text-[#94a3b8] font-mono">AI-generated • OpenAPI 3.0</span>
          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
        </div>
      </div>
    </div>

    {/* Bottom brand */}
    <div className="absolute bottom-8 left-0 right-0 text-center">
      <p className="text-[#94a3b8] text-xs font-mono">
        Design faster. Ship smarter. <span className="text-blue-400">ArchMind.</span>
      </p>
    </div>

    {/* Stat badges */}
    <div className="absolute top-8 left-8 flex flex-col gap-3">
      {[
        { icon: Network, label: 'HLD Diagrams', val: '∞' },
        { icon: Database, label: 'DB Schemas', val: '∞' },
        { icon: Code2, label: 'API Specs', val: '∞' },
      ].map(({ icon: Icon, label, val }) => (
        <div key={label} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#12121a]/80 border border-[#2a2a3d] backdrop-blur-sm">
          <Icon className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-[10px] text-[#94a3b8] font-mono">{label}</span>
          <span className="text-[10px] text-blue-400 font-mono ml-1">{val}</span>
        </div>
      ))}
    </div>
  </div>
)

/* ─────────────────────────── Login Form ─────────────────────────── */

const Login = () => {
  const navigate = useNavigate()
  const { login, isLoading, error, clearError, isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e) => {
    clearError?.()
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) return
    try {
      await login(form.email, form.password)
      navigate('/dashboard')
    } catch {
      // error handled by store
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex">
      <LeftPanel />

      {/* Right: form */}
      <div className="flex-1 lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-10">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <BrainCircuit className="w-5 h-5 text-white" />
            </div>
            <span className="font-heading text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              ArchMind
            </span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="font-heading text-3xl font-bold text-[#f1f5f9] mb-2">Welcome back</h1>
            <p className="text-[#94a3b8] text-sm">Sign in to your account to continue designing.</p>
          </div>

          {/* Error toast */}
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-6">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8] pointer-events-none" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#1a1a28] border border-[#2a2a3d] text-[#f1f5f9] placeholder-[#94a3b8]/50 text-sm focus:outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/10 transition-all duration-200"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8] pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="w-full pl-10 pr-12 py-3 rounded-xl bg-[#1a1a28] border border-[#2a2a3d] text-[#f1f5f9] placeholder-[#94a3b8]/50 text-sm focus:outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/10 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#f1f5f9] transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex justify-end mt-1.5">
                <a href="#" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                  Forgot password?
                </a>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:from-blue-400 hover:to-purple-500 transition-all duration-200 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:from-blue-500 disabled:hover:to-purple-600"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#2a2a3d]" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-[#0a0a0f] text-xs text-[#94a3b8]">New to ArchMind?</span>
            </div>
          </div>

          <Link
            to="/signup"
            className="block w-full text-center py-3 rounded-xl border border-[#2a2a3d] text-[#f1f5f9] text-sm font-semibold hover:bg-[#12121a] hover:border-[#3b82f6]/30 transition-all duration-200 hover:shadow-[0_0_20px_rgba(59,130,246,0.08)]"
          >
            Create a free account
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Login
