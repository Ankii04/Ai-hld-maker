import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import {
  Network,
  Database,
  Code2,
  Layout,
  TrendingUp,
  Zap,
  BrainCircuit,
  ArrowRight,
  Play,
  CheckCircle,
  Sparkles,
  ChevronRight,
  Github,
  Twitter,
  Linkedin,
  Server,
  Cpu,
  BookOpen,
  Terminal,
  Copy,
  Check,
} from 'lucide-react'

/* ─────────────────────────── helpers ─────────────────────────── */

const GradientText = ({ children, className = '' }) => (
  <span
    className={`bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent ${className}`}
  >
    {children}
  </span>
)

/* ─────────────────────────── Navbar ─────────────────────────── */

const Navbar = () => {
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#2a2a3d] bg-[#0a0a0f]/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <BrainCircuit className="w-5 h-5 text-white" />
          </div>
          <span className="font-heading text-xl font-bold">
            <GradientText>ArchMind</GradientText>
          </span>
        </div>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-8">
          {['Features', 'Pricing', 'Docs'].map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              className="text-[#94a3b8] hover:text-[#f1f5f9] text-sm font-medium transition-colors duration-200"
            >
              {link}
            </a>
          ))}
        </div>

        {/* CTA buttons */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <button
              onClick={() => navigate('/dashboard')}
              className="px-5 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-400 hover:to-purple-500 transition-all duration-200 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40"
            >
              Go to Dashboard
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate('/login')}
                className="px-4 py-2 text-sm font-medium text-[#94a3b8] hover:text-[#f1f5f9] transition-colors duration-200"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-400 hover:to-purple-500 transition-all duration-200 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40"
              >
                Get Started
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

/* ─────────────────────────── Hero ─────────────────────────── */

const AnimatedGrid = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {/* Grid lines */}
    <div
      className="absolute inset-0 opacity-[0.04]"
      style={{
        backgroundImage: `
          linear-gradient(to right, #3b82f6 1px, transparent 1px),
          linear-gradient(to bottom, #3b82f6 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
      }}
    />
    {/* Radial glow */}
    <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-blue-600/8 blur-[120px]" />
    <div className="absolute top-2/3 left-1/4 w-[400px] h-[400px] rounded-full bg-purple-600/8 blur-[100px]" />
    <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-cyan-600/6 blur-[80px]" />
    {/* Floating dots */}
    {[...Array(12)].map((_, i) => (
      <div
        key={i}
        className="absolute w-1 h-1 rounded-full bg-blue-400/30 animate-pulse"
        style={{
          left: `${10 + i * 8}%`,
          top: `${20 + (i % 4) * 15}%`,
          animationDelay: `${i * 0.4}s`,
          animationDuration: `${2 + (i % 3)}s`,
        }}
      />
    ))}
  </div>
)

const FloatingPreviewCard = () => (
  <div className="relative mx-auto max-w-lg">
    {/* Outer glow */}
    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-2xl blur-xl" />
    <div className="relative bg-[#12121a] border border-[#2a2a3d] rounded-2xl p-5 shadow-2xl">
      {/* Card header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>
        <span className="text-[10px] text-[#94a3b8] font-mono">architecture.json</span>
      </div>
      {/* Mini architecture diagram */}
      <div className="space-y-3">
        {/* Client layer */}
        <div className="flex items-center gap-2">
          <div className="w-16 h-7 rounded bg-blue-500/20 border border-blue-500/40 flex items-center justify-center">
            <span className="text-[9px] text-blue-400 font-mono font-semibold">Client</span>
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-blue-500/50 to-transparent" />
          <div className="w-16 h-7 rounded bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
            <span className="text-[9px] text-cyan-400 font-mono font-semibold">CDN</span>
          </div>
        </div>
        {/* Arrow */}
        <div className="ml-7 w-px h-4 bg-gradient-to-b from-blue-500/50 to-purple-500/50" />
        {/* API layer */}
        <div className="flex items-center gap-2">
          <div className="w-24 h-7 rounded bg-purple-500/20 border border-purple-500/40 flex items-center justify-center">
            <span className="text-[9px] text-purple-400 font-mono font-semibold">API Gateway</span>
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-purple-500/50 to-transparent" />
          <div className="w-20 h-7 rounded bg-purple-500/20 border border-purple-500/40 flex items-center justify-center">
            <span className="text-[9px] text-purple-400 font-mono font-semibold">Auth Service</span>
          </div>
        </div>
        {/* Arrow */}
        <div className="ml-11 w-px h-4 bg-gradient-to-b from-purple-500/50 to-cyan-500/50" />
        {/* Services layer */}
        <div className="grid grid-cols-3 gap-2">
          {['User SVC', 'Order SVC', 'Notify SVC'].map((svc) => (
            <div
              key={svc}
              className="h-7 rounded bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center"
            >
              <span className="text-[8px] text-cyan-400 font-mono font-semibold">{svc}</span>
            </div>
          ))}
        </div>
        {/* Arrow */}
        <div className="mx-auto w-px h-4 bg-gradient-to-b from-cyan-500/50 to-green-500/50" />
        {/* DB layer */}
        <div className="flex gap-2 justify-center">
          {['PostgreSQL', 'Redis', 'S3'].map((db) => (
            <div
              key={db}
              className="h-7 px-2 rounded bg-green-500/20 border border-green-500/40 flex items-center justify-center"
            >
              <span className="text-[8px] text-green-400 font-mono font-semibold">{db}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Bottom tag */}
      <div className="mt-4 flex items-center gap-2 pt-3 border-t border-[#2a2a3d]">
        <Sparkles className="w-3 h-3 text-purple-400" />
        <span className="text-[10px] text-[#94a3b8] font-mono">Generated in 3.2s • HLD Complete</span>
        <div className="ml-auto w-2 h-2 rounded-full bg-green-400 animate-pulse" />
      </div>
    </div>
  </div>
)

const Hero = () => {
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 pb-16 px-6 overflow-hidden">
      <AnimatedGrid />
      <div className="relative z-10 max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-16 items-center">
        {/* Left: text */}
        <div className="text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold font-mono mb-6">
            <Sparkles className="w-3 h-3" />
            AI-Powered System Design
          </div>
          <h1 className="font-heading text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.05] tracking-tight text-[#f1f5f9] mb-6">
            Turn Ideas Into{' '}
            <GradientText>Complete System Architectures</GradientText>
          </h1>
          <p className="text-[#94a3b8] text-lg lg:text-xl leading-relaxed mb-10 max-w-xl">
            Describe your product in plain English. ArchMind instantly generates
            HLD, LLD, Database schemas, API contracts, and Scalability guides —
            production-ready, in seconds.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            {isAuthenticated ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="group flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:from-blue-400 hover:to-purple-500 transition-all duration-300 shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02]"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate('/signup')}
                  className="group flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:from-blue-400 hover:to-purple-500 transition-all duration-300 shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02]"
                >
                  Start Building Free
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl border border-[#2a2a3d] text-[#f1f5f9] font-semibold hover:bg-[#12121a] hover:border-[#3b82f6]/40 transition-all duration-200 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]"
                >
                  <Play className="w-4 h-4 text-blue-400" />
                  See Demo
                </button>
              </>
            )}
          </div>
          <div className="mt-8 flex items-center gap-6 justify-center lg:justify-start">
            {['3 designs free', 'No credit card', 'Instant results'].map((item) => (
              <div key={item} className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                <span className="text-xs text-[#94a3b8]">{item}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Right: floating card */}
        <div className="hidden lg:block">
          <FloatingPreviewCard />
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────── Features ─────────────────────────── */

const features = [
  {
    icon: Network,
    title: 'Architecture Diagrams',
    desc: 'Generate interactive HLD and LLD diagrams with component relationships, data flows, and deployment topology.',
    color: 'blue',
    tag: 'HLD + LLD',
  },
  {
    icon: Database,
    title: 'Database Design',
    desc: 'Auto-generate normalized ER diagrams, table schemas with indexes, relationships, and migration scripts.',
    color: 'cyan',
    tag: 'Schema + ER',
  },
  {
    icon: Code2,
    title: 'API Contracts',
    desc: 'Full OpenAPI 3.0 specs with endpoints, request/response models, auth schemes, and error codes.',
    color: 'purple',
    tag: 'OpenAPI 3.0',
  },
  {
    icon: TrendingUp,
    title: 'Scalability Guide',
    desc: 'Load balancing strategies, caching layers, CDN configuration, and horizontal scaling recommendations.',
    color: 'green',
    tag: 'Scale Strategy',
  },
  {
    icon: Zap,
    title: 'Challenge Mode',
    desc: 'Find bottlenecks in your design. AI stress-tests your architecture and suggests optimizations.',
    color: 'yellow',
    tag: 'Pro Feature',
  },
]

const colorMap = {
  blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: 'text-blue-400', badge: 'bg-blue-500/10 text-blue-400' },
  cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', icon: 'text-cyan-400', badge: 'bg-cyan-500/10 text-cyan-400' },
  purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/20', icon: 'text-purple-400', badge: 'bg-purple-500/10 text-purple-400' },
  pink: { bg: 'bg-pink-500/10', border: 'border-pink-500/20', icon: 'text-pink-400', badge: 'bg-pink-500/10 text-pink-400' },
  green: { bg: 'bg-green-500/10', border: 'border-green-500/20', icon: 'text-green-400', badge: 'bg-green-500/10 text-green-400' },
  yellow: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', icon: 'text-yellow-400', badge: 'bg-yellow-500/10 text-yellow-400' },
}

const Features = () => (
  <section id="features" className="py-24 px-6 bg-[#0a0a0f]">
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold font-mono mb-4">
          <Sparkles className="w-3 h-3" />
          Everything You Need
        </div>
        <h2 className="font-heading text-4xl lg:text-5xl font-bold text-[#f1f5f9] mb-4">
          One prompt. <GradientText>Five deliverables.</GradientText>
        </h2>
        <p className="text-[#94a3b8] text-lg max-w-2xl mx-auto">
          ArchMind generates a complete technical blueprint across all dimensions of your product — no more context switching between tools.
        </p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map(({ icon: Icon, title, desc, color, tag }) => {
          const c = colorMap[color]
          return (
            <div
              key={title}
              className="group bg-[#12121a] border border-[#2a2a3d] rounded-xl p-6 hover:border-[#3b82f6]/30 hover:shadow-[0_0_30px_rgba(59,130,246,0.08)] transition-all duration-300 cursor-default"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-11 h-11 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-5 h-5 ${c.icon}`} />
                </div>
                <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full ${c.badge}`}>
                  {tag}
                </span>
              </div>
              <h3 className="font-heading text-lg font-bold text-[#f1f5f9] mb-2">{title}</h3>
              <p className="text-[#94a3b8] text-sm leading-relaxed">{desc}</p>
            </div>
          )
        })}
      </div>
    </div>
  </section>
)

/* ─────────────────────────── How It Works ─────────────────────────── */

const steps = [
  {
    num: '01',
    icon: Code2,
    title: 'Describe Your Product',
    desc: 'Write a plain-English description of your product. Include users, features, and scale expectations. No technical jargon required.',
    color: 'blue',
  },
  {
    num: '02',
    icon: BrainCircuit,
    title: 'AI Generates Blueprint',
    desc: 'ArchMind\'s AI analyzes your input and generates a full technical blueprint: HLD, LLD, DB schema, API spec, and scaling strategy.',
    color: 'purple',
  },
  {
    num: '03',
    icon: Zap,
    title: 'Edit, Export, Ship',
    desc: 'Refine any section with follow-up prompts. Export as JSON, download as PDF, or share a live link with your team.',
    color: 'cyan',
  },
]

const HowItWorks = () => (
  <section className="py-24 px-6 bg-[#0d0d15] border-y border-[#2a2a3d]">
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="font-heading text-4xl lg:text-5xl font-bold text-[#f1f5f9] mb-4">
          How It <GradientText>Works</GradientText>
        </h2>
        <p className="text-[#94a3b8] text-lg max-w-xl mx-auto">
          From idea to production-ready architecture in three simple steps.
        </p>
      </div>
      <div className="grid md:grid-cols-3 gap-8 relative">
        {/* Connecting lines */}
        <div className="hidden md:block absolute top-10 left-[calc(16.67%+2.5rem)] right-[calc(50%+2.5rem)] h-px bg-gradient-to-r from-blue-500/30 to-purple-500/30" />
        <div className="hidden md:block absolute top-10 left-[calc(50%+2.5rem)] right-[calc(16.67%+2.5rem)] h-px bg-gradient-to-r from-purple-500/30 to-cyan-500/30" />
        {steps.map(({ num, icon: Icon, title, desc, color }) => {
          const c = colorMap[color]
          return (
            <div key={num} className="relative text-center">
              <div className="relative inline-flex items-center justify-center mb-6">
                <div className={`w-20 h-20 rounded-2xl ${c.bg} border ${c.border} flex items-center justify-center mx-auto`}>
                  <Icon className={`w-8 h-8 ${c.icon}`} />
                </div>
                <div className={`absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[#0a0a0f] border ${c.border} flex items-center justify-center`}>
                  <span className={`text-[10px] font-mono font-bold ${c.icon}`}>{num}</span>
                </div>
              </div>
              <h3 className="font-heading text-xl font-bold text-[#f1f5f9] mb-3">{title}</h3>
              <p className="text-[#94a3b8] text-sm leading-relaxed">{desc}</p>
            </div>
          )
        })}
      </div>
    </div>
  </section>
)

/* ─────────────────────────── Pricing ─────────────────────────── */

const freeTiers = [
  '3 designs per month',
  'HLD + LLD diagrams',
  'Database schema',
  'API contract',
  'Scalability guide',
]
const freeNot = ['Challenge Mode', 'PDF Export', 'OpenAPI YAML', 'Share links']
const proTiers = [
  'Unlimited designs',
  'HLD + LLD diagrams',
  'Database schema',
  'API contract',
  'Scalability guide',
  'Challenge Mode',
  'PDF Export',
  'OpenAPI YAML',
  'Share links',
]

const Pricing = () => {
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  return (
    <section id="pricing" className="py-24 px-6 bg-[#0a0a0f]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-heading text-4xl lg:text-5xl font-bold text-[#f1f5f9] mb-4">
            Simple <GradientText>Pricing</GradientText>
          </h2>
          <p className="text-[#94a3b8] text-lg">Start free. Upgrade when you need more.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Free */}
          <div className="bg-[#12121a] border border-[#2a2a3d] rounded-2xl p-8">
            <div className="mb-6">
              <h3 className="font-heading text-xl font-bold text-[#f1f5f9] mb-1">Free</h3>
              <div className="flex items-end gap-1 mb-3">
                <span className="text-5xl font-bold text-[#f1f5f9]">$0</span>
                <span className="text-[#94a3b8] mb-2">/month</span>
              </div>
              <p className="text-[#94a3b8] text-sm">Perfect for exploring and side projects.</p>
            </div>
            <button
              onClick={() => navigate(isAuthenticated ? '/dashboard' : '/signup')}
              className="w-full py-3 rounded-xl border border-[#2a2a3d] text-[#f1f5f9] font-semibold hover:bg-[#1a1a28] transition-colors duration-200 mb-6"
            >
              {isAuthenticated ? 'Go to Dashboard' : 'Get Started Free'}
            </button>
            <div className="space-y-3">
              {freeTiers.map((item) => (
                <div key={item} className="flex items-center gap-2.5">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  <span className="text-[#94a3b8] text-sm">{item}</span>
                </div>
              ))}
              {freeNot.map((item) => (
                <div key={item} className="flex items-center gap-2.5 opacity-40">
                  <div className="w-4 h-4 rounded-full border border-[#2a2a3d] flex-shrink-0" />
                  <span className="text-[#94a3b8] text-sm line-through">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pro */}
          <div className="relative">
            <div className="absolute -inset-px bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur-[2px] opacity-60" />
            <div className="relative bg-[#12121a] border border-blue-500/50 rounded-2xl p-8 shadow-[0_0_40px_rgba(59,130,246,0.15)]">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="px-4 py-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-bold font-mono shadow-lg">
                  MOST POPULAR
                </span>
              </div>
              <div className="mb-6">
                <h3 className="font-heading text-xl font-bold text-[#f1f5f9] mb-1">Pro</h3>
                <div className="flex items-end gap-1 mb-3">
                  <span className="text-5xl font-bold text-[#f1f5f9]">$19</span>
                  <span className="text-[#94a3b8] mb-2">/month</span>
                </div>
                <p className="text-[#94a3b8] text-sm">For engineers and teams who ship fast.</p>
              </div>
              <button
                onClick={() => navigate(isAuthenticated ? '/dashboard' : '/signup')}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:from-blue-400 hover:to-purple-500 transition-all duration-200 shadow-lg shadow-blue-500/30 mb-6 hover:shadow-blue-500/50"
              >
                {isAuthenticated ? 'Go to Dashboard' : 'Start Pro Trial'}
              </button>
              <div className="space-y-3">
                {proTiers.map((item) => (
                  <div key={item} className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    <span className="text-[#f1f5f9] text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────── CTA Banner ─────────────────────────── */

const CTABanner = () => {
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  return (
    <section className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="relative rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-cyan-600/20" />
          <div className="absolute inset-0 border border-blue-500/20 rounded-3xl" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
              backgroundSize: '30px 30px',
            }}
          />
          <div className="relative text-center py-16 px-8">
            <h2 className="font-heading text-4xl lg:text-5xl font-bold text-[#f1f5f9] mb-4">
              Ready to architect something{' '}
              <GradientText>great?</GradientText>
            </h2>
            <p className="text-[#94a3b8] text-lg mb-10 max-w-xl mx-auto">
              Join thousands of engineers using ArchMind to design scalable systems in minutes.
            </p>
            <button
              onClick={() => navigate(isAuthenticated ? '/dashboard' : '/signup')}
              className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold text-lg hover:from-blue-400 hover:to-purple-500 transition-all duration-300 shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-[1.02]"
            >
              {isAuthenticated ? 'Go to Dashboard' : 'Start Building Free'}
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────── Footer ─────────────────────────── */

const Footer = () => (
  <footer className="border-t border-[#2a2a3d] bg-[#0a0a0f] py-12 px-6">
    <div className="max-w-7xl mx-auto">
      <div className="grid md:grid-cols-4 gap-8 mb-12">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <BrainCircuit className="w-4 h-4 text-white" />
            </div>
            <span className="font-heading text-lg font-bold">
              <GradientText>ArchMind</GradientText>
            </span>
          </div>
          <p className="text-[#94a3b8] text-sm max-w-xs leading-relaxed">
            AI-powered system design & architecture generator for modern engineering teams.
          </p>
          <div className="flex gap-3 mt-4">
            {[Github, Twitter, Linkedin].map((Icon, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-lg border border-[#2a2a3d] flex items-center justify-center hover:border-blue-500/40 hover:bg-blue-500/5 transition-colors cursor-pointer"
              >
                <Icon className="w-4 h-4 text-[#94a3b8]" />
              </div>
            ))}
          </div>
        </div>
        {[
          { title: 'Product', links: ['Features', 'Pricing', 'Changelog', 'Roadmap'] },
          { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
        ].map(({ title, links }) => (
          <div key={title}>
            <h4 className="text-[#f1f5f9] font-semibold text-sm mb-4">{title}</h4>
            <ul className="space-y-2.5">
              {links.map((link) => (
                <li key={link}>
                  <a href="#" className="text-[#94a3b8] text-sm hover:text-[#f1f5f9] transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-[#2a2a3d] pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-[#94a3b8] text-xs">© 2026 ArchMind. All rights reserved.</p>
        <div className="flex gap-6">
          {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item) => (
            <a key={item} href="#" className="text-[#94a3b8] text-xs hover:text-[#f1f5f9] transition-colors">
              {item}
            </a>
          ))}
        </div>
      </div>
    </div>
  </footer>
)

/* ─────────────────────────── Main Page ─────────────────────────── */

/* ─────────────────────────── Docs Reference ─────────────────────────── */

const Docs = () => {
  const [activeTab, setActiveTab] = useState('stack')
  const [copied, setCopied] = useState(false)

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const vercelJsonText = `{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}`

  return (
    <section id="docs" className="py-24 px-6 bg-[#0a0a0f] border-t border-[#2a2a3d]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold font-mono mb-4">
            <BookOpen className="w-3.5 h-3.5" />
            Documentation
          </div>
          <h2 className="font-heading text-4xl lg:text-5xl font-bold text-[#f1f5f9] mb-4">
            Technical <GradientText>Reference</GradientText>
          </h2>
          <p className="text-[#94a3b8] text-lg max-w-2xl mx-auto">
            Deep dive into the architecture, application flow, artificial intelligence engine, and routing system of ArchMind.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap justify-center gap-2 mb-12 border-b border-[#2a2a3d] pb-4">
          {[
            { id: 'stack', label: 'Tech Stack', icon: Cpu },
            { id: 'flow', label: 'System Flow', icon: Network },
            { id: 'ai', label: 'AI Core Engine', icon: BrainCircuit },
            { id: 'vercel', label: 'Hosting & Routing', icon: Terminal },
          ].map((tab) => {
            const Icon = tab.icon
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  active
                    ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/40 text-[#f1f5f9] shadow-lg shadow-blue-500/5'
                    : 'border border-[#2a2a3d] text-[#94a3b8] hover:text-[#f1f5f9] hover:border-[#3b82f6]/30'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-blue-400' : 'text-[#94a3b8]'}`} />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Tab Content */}
        <div className="bg-[#12121a] border border-[#2a2a3d] rounded-2xl p-6 lg:p-10 shadow-2xl relative min-h-[400px]">
          {activeTab === 'stack' && (
            <div className="space-y-8 animate-fadeIn">
              <div>
                <h3 className="text-2xl font-bold text-[#f1f5f9] mb-2">Decoupled Full-Stack Architecture</h3>
                <p className="text-[#94a3b8] text-sm leading-relaxed max-w-3xl">
                  ArchMind is built using a highly decoupled architecture. The frontend handles interactive, responsive rendering, while the backend processes heavy system design prompting, authentication, and persistence, keeping operations lightning fast.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {/* Frontend Card */}
                <div className="bg-[#0a0a0f] border border-[#2a2a3d] rounded-xl p-6 hover:border-blue-500/30 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4">
                    <Code2 className="w-5 h-5 text-blue-400" />
                  </div>
                  <h4 className="text-lg font-bold text-[#f1f5f9] mb-3">Frontend (Client Side)</h4>
                  <ul className="space-y-2 text-[#94a3b8] text-xs">
                    <li className="flex items-start gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-shrink-0" /> <span><strong className="text-[#f1f5f9]">React & Vite:</strong> Declarative, component-driven UI bundled for instant loading.</span></li>
                    <li className="flex items-start gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-shrink-0" /> <span><strong className="text-[#f1f5f9]">React Flow:</strong> Canvas engine rendering interactive zoomable/draggable architecture flowcharts.</span></li>
                    <li className="flex items-start gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-shrink-0" /> <span><strong className="text-[#f1f5f9]">Zustand:</strong> Lightweight global state managing live editor designs and sessions.</span></li>
                    <li className="flex items-start gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-shrink-0" /> <span><strong className="text-[#f1f5f9]">html2pdf.js:</strong> Client-side high-fidelity vector PDF generation of active editor canvases.</span></li>
                  </ul>
                </div>

                {/* Backend Card */}
                <div className="bg-[#0a0a0f] border border-[#2a2a3d] rounded-xl p-6 hover:border-purple-500/30 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4">
                    <Server className="w-5 h-5 text-purple-400" />
                  </div>
                  <h4 className="text-lg font-bold text-[#f1f5f9] mb-3">Backend (API Engine)</h4>
                  <ul className="space-y-2 text-[#94a3b8] text-xs">
                    <li className="flex items-start gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-purple-400 mt-0.5 flex-shrink-0" /> <span><strong className="text-[#f1f5f9]">Node.js & Express:</strong> Scalable server logic handling REST endpoints, routing, and dynamic CORS.</span></li>
                    <li className="flex items-start gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-purple-400 mt-0.5 flex-shrink-0" /> <span><strong className="text-[#f1f5f9]">MongoDB & Mongoose:</strong> Clean object-relational document modeling for design persistence.</span></li>
                    <li className="flex items-start gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-purple-400 mt-0.5 flex-shrink-0" /> <span><strong className="text-[#f1f5f9]">JWT & Hashing:</strong> Secure authorization using Json Web Tokens and bcryptjs password encryption.</span></li>
                  </ul>
                </div>

                {/* AI / cloud Card */}
                <div className="bg-[#0a0a0f] border border-[#2a2a3d] rounded-xl p-6 hover:border-cyan-500/30 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4">
                    <Cpu className="w-5 h-5 text-cyan-400" />
                  </div>
                  <h4 className="text-lg font-bold text-[#f1f5f9] mb-3">AI Engine & Cloud</h4>
                  <ul className="space-y-2 text-[#94a3b8] text-xs">
                    <li className="flex items-start gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-cyan-400 mt-0.5 flex-shrink-0" /> <span><strong className="text-[#f1f5f9]">Gemini 2.5 Flash:</strong> High-speed LLM formulating structural layouts, schemas, API specifications, and stress testing.</span></li>
                    <li className="flex items-start gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-cyan-400 mt-0.5 flex-shrink-0" /> <span><strong className="text-[#f1f5f9]">Google Generative AI SDK:</strong> Official developer SDK orchestrating reliable API streaming and context variables.</span></li>
                    <li className="flex items-start gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-cyan-400 mt-0.5 flex-shrink-0" /> <span><strong className="text-[#f1f5f9]">Vercel SPA Hosting:</strong> High-performance static web hosting and routing rewrites.</span></li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'flow' && (
            <div className="space-y-8 animate-fadeIn">
              <div>
                <h3 className="text-2xl font-bold text-[#f1f5f9] mb-2">Application Lifecycle</h3>
                <p className="text-[#94a3b8] text-sm leading-relaxed max-w-3xl">
                  Every project generated inside ArchMind traverses a robust step-by-step lifecycle from client entry to visual render:
                </p>
              </div>

              <div className="relative pl-6 border-l border-blue-500/30 space-y-6">
                {[
                  {
                    num: '1',
                    title: 'Authentication & Session initialization',
                    desc: 'User registers or logs in. Credentials are hashed using bcryptjs. The server generates a signed JSON Web Token (JWT) cached in the browser to authorize subsequently spawned requests securely.'
                  },
                  {
                    num: '2',
                    title: 'Requirement Compiling',
                    desc: 'The user creates a new project via the dashboard modal, specifying product goals, anticipated RPS loads, technical constraints, budget ceilings, and framework preferences.'
                  },
                  {
                    num: '3',
                    title: 'AI Blueprint Generation',
                    desc: 'The backend securely relays constraints to Gemini 2.5 Flash under a system prompt dictating standard compliance, structure design protocols, and geometric coordinate layouts.'
                  },
                  {
                    num: '4',
                    title: 'Interactive Editor Render',
                    desc: 'The parsed blueprint compiles on the client. The user visualizes HLD diagrams dynamically (React Flow), inspects Low-Level classes/methods, parses SQL schemas, analyzes caching layers, and stress-tests with Challenge Mode.'
                  },
                  {
                    num: '5',
                    title: 'Sharing & Vector Exports',
                    desc: 'The user can instantly trigger client-side vector PDF downloads, copy standard OpenAPI contracts, or generate unique, shared read-only URLs to distribute live diagrams to coworkers.'
                  }
                ].map((step) => (
                  <div key={step.num} className="relative">
                    <div className="absolute -left-[35px] top-0 w-4 h-4 rounded-full bg-[#0a0a0f] border-2 border-blue-500 flex items-center justify-center">
                      <span className="text-[7px] font-bold text-blue-400">{step.num}</span>
                    </div>
                    <h4 className="text-[#f1f5f9] font-bold text-base mb-1">{step.title}</h4>
                    <p className="text-[#94a3b8] text-xs leading-relaxed max-w-3xl">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="space-y-8 animate-fadeIn">
              <div>
                <h3 className="text-2xl font-bold text-[#f1f5f9] mb-2">How the AI Works: The Secret Sauce</h3>
                <p className="text-[#94a3b8] text-sm leading-relaxed max-w-3xl">
                  ArchMind's core logic lives in the backend system prompts. Our architecture engine coordinates prompting schemas with automatic syntactical recovery models.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="bg-[#0a0a0f] border border-[#2a2a3d] rounded-xl p-5">
                    <h4 className="text-sm font-bold text-blue-400 font-mono mb-2">A. Generator Mode (`generateDesign`)</h4>
                    <p className="text-xs text-[#94a3b8] leading-relaxed">
                      Instructs Gemini AI as a veteran staff system architect. The model must output strictly valid JSON conforming to an explicit schema specifying coordinate geometry. Client nodes are algorithmically anchored at top layers, microservices in the mid-tiers, and DB clusters along the bottom coordinates to ensure clean render flows.
                    </p>
                  </div>

                  <div className="bg-[#0a0a0f] border border-[#2a2a3d] rounded-xl p-5">
                    <h4 className="text-sm font-bold text-purple-400 font-mono mb-2">B. Challenge Mode (`generateChallenge`)</h4>
                    <p className="text-xs text-[#94a3b8] leading-relaxed">
                      Acts as a resilience engineer stress-testing the primary blueprint. It analyzes the diagram structure to identify SPOFs (Single Points of Failure), network latency bottlenecks, and indexing inefficiencies, and provides severity-rated mitigations.
                    </p>
                  </div>
                </div>

                <div className="bg-[#0a0a0f] border border-[#2a2a3d] rounded-xl p-6 flex flex-col justify-between">
                  <div>
                    <h4 className="text-base font-bold text-[#f1f5f9] mb-3">C. JSON Repair Pipeline</h4>
                    <p className="text-xs text-[#94a3b8] leading-relaxed mb-4">
                      Large Language Models can occasionally output extraneous conversational prose or invalid markdown code fences that break native browser parsers. To prevent crashes, our server channels all AI outputs through a multi-tiered repair utility:
                    </p>
                    <ol className="list-decimal pl-4 text-xs text-[#94a3b8] space-y-2">
                      <li><strong className="text-[#f1f5f9]">Direct Parse:</strong> Try native parsing first for clean outputs.</li>
                      <li><strong className="text-[#f1f5f9]">Fence Stripping:</strong> Automatically strip ```json wrapper blocks.</li>
                      <li><strong className="text-[#f1f5f9]">Brace Extraction:</strong> Isolate and extract content strictly between the outermost '{' and '}' braces.</li>
                    </ol>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#2a2a3d] flex items-center justify-between text-[11px] text-[#94a3b8] font-mono">
                    <span>Robust Failure Recovery</span>
                    <span className="text-green-400 flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Activated</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'vercel' && (
            <div className="space-y-8 animate-fadeIn">
              <div>
                <h3 className="text-2xl font-bold text-[#f1f5f9] mb-2">Vercel SPA Routing Configuration</h3>
                <p className="text-[#94a3b8] text-sm leading-relaxed max-w-3xl">
                  Because ArchMind is a client-side Single Page Application (SPA), page routing is processed locally in the browser by React Router. Standard multi-page deployments experience 404 errors when a user refreshes deep links (e.g. `/dashboard`), as the hosting provider checks for physical folder routes. We solve this elegantly by writing global server-side re-route declarations.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 items-start">
                <div className="space-y-4 text-xs text-[#94a3b8] leading-relaxed">
                  <div className="flex gap-3">
                    <div className="w-5 h-5 rounded bg-blue-500/10 flex items-center justify-center flex-shrink-0 text-blue-400 font-bold">1</div>
                    <p>The web server intercepts incoming routing paths (such as sharing endpoints `/share/123` or `/dashboard`).</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-5 h-5 rounded bg-purple-500/10 flex items-center justify-center flex-shrink-0 text-purple-400 font-bold">2</div>
                    <p>Instead of throwing standard Vercel 404 errors, our rewrite instructs the edge proxy to fallback and serve `index.html` silently.</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-5 h-5 rounded bg-cyan-500/10 flex items-center justify-center flex-shrink-0 text-cyan-400 font-bold">3</div>
                    <p>React Router reads the loaded address bar query client-side, dynamically rendering the dashboard modal or read-only editor flawlessly.</p>
                  </div>
                </div>

                <div className="bg-[#0a0a0f] border border-[#2a2a3d] rounded-xl overflow-hidden shadow-lg">
                  <div className="bg-[#12121a] px-4 py-2 border-b border-[#2a2a3d] flex items-center justify-between">
                    <span className="text-[10px] text-[#94a3b8] font-mono">vercel.json</span>
                    <button
                      onClick={() => handleCopy(vercelJsonText)}
                      className="text-[10px] flex items-center gap-1 text-[#94a3b8] hover:text-[#f1f5f9] transition-colors"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3 h-3 text-green-400" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-4 text-[11px] font-mono text-[#f1f5f9] overflow-x-auto leading-relaxed bg-[#0a0a0f]">
                    {vercelJsonText}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

const Landing = () => (
  <div className="min-h-screen bg-[#0a0a0f] text-[#f1f5f9] scroll-smooth">
    <Navbar />
    <Hero />
    <Features />
    <HowItWorks />
    <Pricing />
    <Docs />
    <CTABanner />
    <Footer />
  </div>
)

export default Landing
