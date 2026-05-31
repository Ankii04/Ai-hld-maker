import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  BrainCircuit,
  Loader2,
  AlertCircle,
  User,
  CheckCircle,
  Sparkles,
  Network,
  Layout,
  Database,
} from 'lucide-react'
import useAuthStore from '../store/authStore'

/* ─────────────────────────── Decorative Left Panel ─────────────────────────── */

const featureHighlights = [
  { icon: Network, text: 'HLD + LLD diagrams instantly', color: 'text-blue-400' },
  { icon: Database, text: 'Auto ER schema & migrations', color: 'text-cyan-400' },
  { icon: Layout, text: 'Full UI/UX blueprint generation', color: 'text-purple-400' },
]

const LeftPanel = () => (
  <div className="hidden lg:flex flex-col relative w-1/2 min-h-screen bg-[#0d0d15] border-r border-[#2a2a3d] overflow-hidden">
    {/* Grid */}
    <div
      className="absolute inset-0 opacity-[0.04]"
      style={{
        backgroundImage: `
          linear-gradient(to right, #8b5cf6 1px, transparent 1px),
          linear-gradient(to bottom, #8b5cf6 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px',
      }}
    />
    {/* Glow orbs */}
    <div className="absolute top-1/3 left-1/3 w-72 h-72 rounded-full bg-purple-600/10 blur-[90px]" />
    <div className="absolute bottom-1/3 right-1/4 w-56 h-56 rounded-full bg-blue-600/10 blur-[70px]" />

    {/* Center content */}
    <div className="absolute inset-0 flex flex-col items-center justify-center px-12">
      <div className="w-full max-w-xs">
        {/* Brand */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-xl shadow-purple-500/30">
            <BrainCircuit className="w-5 h-5 text-white" />
          </div>
          <span className="font-heading text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            ArchMind
          </span>
        </div>

        <h2 className="font-heading text-2xl font-bold text-[#f1f5f9] mb-3">
          Your AI system designer
        </h2>
        <p className="text-[#94a3b8] text-sm leading-relaxed mb-8">
          Describe any product. Get a production-ready technical blueprint in seconds.
        </p>

        {/* Feature highlights */}
        <div className="space-y-4 mb-8">
          {featureHighlights.map(({ icon: Icon, text, color }) => (
            <div key={text} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#12121a] border border-[#2a2a3d] flex items-center justify-center flex-shrink-0">
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <span className="text-[#94a3b8] text-sm">{text}</span>
            </div>
          ))}
        </div>

        {/* Free plan card */}
        <div className="relative rounded-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10" />
          <div className="relative border border-blue-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-bold text-[#f1f5f9]">Free Plan — No Credit Card</span>
            </div>
            {['3 complete designs per month', 'HLD, LLD, DB, API, UI/UX', 'Instant generation'].map((item) => (
              <div key={item} className="flex items-center gap-2 mt-2">
                <CheckCircle className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                <span className="text-xs text-[#94a3b8]">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>

    {/* Bottom tagline */}
    <div className="absolute bottom-8 left-0 right-0 text-center">
      <p className="text-[#94a3b8] text-xs font-mono">
        Trusted by engineers at <span className="text-purple-400">startups & enterprises.</span>
      </p>
    </div>
  </div>
)

/* ─────────────────────────── Signup Form ─────────────────────────── */

const Signup = () => {
  const navigate = useNavigate()
  const { signup, isLoading, error, clearError, isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e) => {
    clearError?.()
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) return
    try {
      await signup(form.name, form.email, form.password)
      navigate('/dashboard')
    } catch {
      // error handled by store
    }
  }

  const passwordStrength = () => {
    const p = form.password
    if (!p) return null
    if (p.length < 6) return { label: 'Too short', color: 'bg-red-500', width: 'w-1/4' }
    if (p.length < 8) return { label: 'Weak', color: 'bg-yellow-500', width: 'w-2/4' }
    if (!/[A-Z]/.test(p) || !/[0-9]/.test(p)) return { label: 'Fair', color: 'bg-blue-500', width: 'w-3/4' }
    return { label: 'Strong', color: 'bg-green-500', width: 'w-full' }
  }

  const strength = passwordStrength()

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex">
      <LeftPanel />

      {/* Right: form */}
      <div className="flex-1 lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Logo (mobile only) */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <BrainCircuit className="w-4 h-4 text-white" />
            </div>
            <span className="font-heading text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              ArchMind
            </span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="font-heading text-3xl font-bold text-[#f1f5f9] mb-2">Create your account</h1>
            <p className="text-[#94a3b8] text-sm">
              Free plan includes <span className="text-blue-400 font-medium">3 full designs per month</span> — no credit card required.
            </p>
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
            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8] pointer-events-none" />
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Ada Lovelace"
                  autoComplete="name"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#1a1a28] border border-[#2a2a3d] text-[#f1f5f9] placeholder-[#94a3b8]/50 text-sm focus:outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/10 transition-all duration-200"
                />
              </div>
            </div>

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
                  placeholder="ada@example.com"
                  autoComplete="email"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#1a1a28] border border-[#2a2a3d] text-[#f1f5f9] placeholder-[#94a3b8]/50 text-sm focus:outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/10 transition-all duration-200"
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
                  placeholder="Min. 8 characters"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  className="w-full pl-10 pr-12 py-3 rounded-xl bg-[#1a1a28] border border-[#2a2a3d] text-[#f1f5f9] placeholder-[#94a3b8]/50 text-sm focus:outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/10 transition-all duration-200"
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
              {/* Password strength */}
              {strength && (
                <div className="mt-2">
                  <div className="w-full h-1 bg-[#2a2a3d] rounded-full overflow-hidden">
                    <div className={`h-full ${strength.color} ${strength.width} transition-all duration-300 rounded-full`} />
                  </div>
                  <p className="text-[10px] text-[#94a3b8] mt-1">{strength.label}</p>
                </div>
              )}
            </div>

            {/* Terms note */}
            <p className="text-[11px] text-[#94a3b8] leading-relaxed">
              By creating an account, you agree to our{' '}
              <a href="#" className="text-blue-400 hover:text-blue-300">Terms of Service</a> and{' '}
              <a href="#" className="text-blue-400 hover:text-blue-300">Privacy Policy</a>.
            </p>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:from-blue-400 hover:to-purple-500 transition-all duration-200 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating account…
                </>
              ) : (
                'Create Account — It\'s Free'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#2a2a3d]" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-[#0a0a0f] text-xs text-[#94a3b8]">Already have an account?</span>
            </div>
          </div>

          <Link
            to="/login"
            className="block w-full text-center py-3 rounded-xl border border-[#2a2a3d] text-[#f1f5f9] text-sm font-semibold hover:bg-[#12121a] hover:border-[#8b5cf6]/30 transition-all duration-200 hover:shadow-[0_0_20px_rgba(139,92,246,0.08)]"
          >
            Sign in instead
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Signup
