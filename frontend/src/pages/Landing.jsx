import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import {
  Network,
  Database,
  Code2,
  TrendingUp,
  Zap,
  BrainCircuit,
  ArrowRight,
  Check,
  Sparkles,
  Github,
  Linkedin,
  Server,
  Menu,
  X,
  Play,
  Layers,
  ShieldCheck,
} from 'lucide-react'

/* ═══════════════════════════════════════════════════════════════
   Shared bits
   ═══════════════════════════════════════════════════════════════ */

const GradientText = ({ children, className = '' }) => (
  <span
    className={`bg-gradient-to-r from-[#7cb0ff] via-[#a78bfa] to-[#67e8f9] bg-clip-text text-transparent ${className}`}
  >
    {children}
  </span>
)

/**
 * Reveals children on scroll (respects prefers-reduced-motion via CSS).
 *
 * Deliberately fails OPEN: content starts at opacity 0, so if the reveal
 * never fired the page would be permanently blank. IntersectionObserver
 * does not fire while a document is hidden (background tab, prerender,
 * non-compositing embed), so a safety timer force-reveals everything
 * regardless. Marketing copy must never be invisible.
 */
const Reveal = ({ children, delay = 0, className = '' }) => {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const show = () => {
      el.style.transitionDelay = `${delay}ms`
      el.classList.add('reveal-visible')
    }

    if (typeof IntersectionObserver === 'undefined') {
      show()
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          show()
          observer.unobserve(el)
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' },
    )
    observer.observe(el)

    // Fail-open safety net
    const fallback = setTimeout(() => {
      show()
      observer.disconnect()
    }, 1500)

    return () => {
      clearTimeout(fallback)
      observer.disconnect()
    }
  }, [delay])

  return (
    <div ref={ref} className={`reveal ${className}`}>
      {children}
    </div>
  )
}

/**
 * Pure-CSS 3D architecture stack — four tier plates orbiting on an
 * isometric axis, linked by a beam with a packet falling through them.
 * Hand-built transforms: no WebGL, no model files, no dependencies.
 */
const TIERS = [
  {
    z: 150,
    ring: 'rgba(59,130,246,0.45)',
    fill: 'rgba(59,130,246,0.07)',
    nodes: [
      { x: 22, y: 30, w: 34, h: 16, c: 'rgba(59,130,246,0.55)', f: 'rgba(59,130,246,0.18)' },
      { x: 60, y: 52, w: 26, h: 16, c: 'rgba(59,130,246,0.55)', f: 'rgba(59,130,246,0.18)' },
    ],
  },
  {
    z: 100,
    ring: 'rgba(139,92,246,0.45)',
    fill: 'rgba(139,92,246,0.07)',
    nodes: [
      { x: 34, y: 40, w: 40, h: 16, c: 'rgba(139,92,246,0.55)', f: 'rgba(139,92,246,0.18)' },
    ],
  },
  {
    z: 50,
    ring: 'rgba(6,182,212,0.45)',
    fill: 'rgba(6,182,212,0.07)',
    nodes: [
      { x: 16, y: 34, w: 24, h: 15, c: 'rgba(6,182,212,0.55)', f: 'rgba(6,182,212,0.18)' },
      { x: 44, y: 26, w: 24, h: 15, c: 'rgba(6,182,212,0.55)', f: 'rgba(6,182,212,0.18)' },
      { x: 34, y: 60, w: 30, h: 15, c: 'rgba(6,182,212,0.55)', f: 'rgba(6,182,212,0.18)' },
    ],
  },
  {
    z: 0,
    ring: 'rgba(16,185,129,0.45)',
    fill: 'rgba(16,185,129,0.07)',
    nodes: [
      { x: 20, y: 44, w: 28, h: 16, c: 'rgba(16,185,129,0.55)', f: 'rgba(16,185,129,0.18)' },
      { x: 56, y: 36, w: 22, h: 16, c: 'rgba(245,158,11,0.55)', f: 'rgba(245,158,11,0.16)' },
    ],
  },
]

const ArchStack3D = ({ size = 320, className = '', style }) => (
  <div
    className={`stack3d-scene ${className}`}
    style={{ width: size, height: size, ...style }}
    aria-hidden="true"
  >
    <div className="stack3d">
      {TIERS.map((tier) => (
        <div
          key={tier.z}
          className="stack-plate"
          style={{
            transform: `translateZ(${tier.z}px)`,
            borderColor: tier.ring,
            background: tier.fill,
          }}
        >
          {tier.nodes.map((n, i) => (
            <span
              key={i}
              className="stack-node"
              style={{
                left: `${n.x}%`,
                top: `${n.y}%`,
                width: `${n.w}%`,
                height: `${n.h}%`,
                borderColor: n.c,
                background: n.f,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  </div>
)

/* ═══════════════════════════════════════════════════════════════
   Navbar
   ═══════════════════════════════════════════════════════════════ */

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how' },
  { label: 'Pricing', href: '#pricing' },
]

const Navbar = () => {
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'border-b border-[#22222f] bg-[#0a0a0f]/85 backdrop-blur-xl'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2.5 group"
          aria-label="ArchMind home"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6] flex items-center justify-center">
            <BrainCircuit className="w-[18px] h-[18px] text-white" />
          </div>
          <span className="font-heading text-[15px] font-semibold tracking-tight text-[#f1f5f9]">
            ArchMind
          </span>
        </button>

        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="px-3 py-2 rounded-lg text-[13px] font-medium text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#16161f] transition-colors"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2">
          {isAuthenticated ? (
            <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
              Dashboard
            </button>
          ) : (
            <>
              <button onClick={() => navigate('/login')} className="btn btn-ghost">
                Sign in
              </button>
              <button onClick={() => navigate('/signup')} className="btn btn-primary">
                Start free
              </button>
            </>
          )}
        </div>

        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="md:hidden w-9 h-9 rounded-lg border border-[#22222f] flex items-center justify-center text-[#94a3b8]"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X className="w-[18px] h-[18px]" /> : <Menu className="w-[18px] h-[18px]" />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-[#22222f] bg-[#0a0a0f]/97 backdrop-blur-xl px-6 py-4 flex flex-col gap-1">
          {NAV_LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="py-2.5 text-sm font-medium text-[#94a3b8] hover:text-[#f1f5f9]"
            >
              {l.label}
            </a>
          ))}
          <div className="flex gap-2 pt-3">
            {isAuthenticated ? (
              <button
                onClick={() => { setMenuOpen(false); navigate('/dashboard') }}
                className="btn btn-primary flex-1"
              >
                Dashboard
              </button>
            ) : (
              <>
                <button
                  onClick={() => { setMenuOpen(false); navigate('/login') }}
                  className="btn btn-secondary flex-1"
                >
                  Sign in
                </button>
                <button
                  onClick={() => { setMenuOpen(false); navigate('/signup') }}
                  className="btn btn-primary flex-1"
                >
                  Start free
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Hero — 3D tilt card with layered parallax depth
   ═══════════════════════════════════════════════════════════════ */

const NODE_ROWS = [
  {
    depth: 60,
    items: [
      { label: 'Web Client', tone: 'blue' },
      { label: 'Mobile', tone: 'blue' },
    ],
  },
  {
    depth: 44,
    items: [
      { label: 'API Gateway', tone: 'purple' },
      { label: 'Auth', tone: 'purple' },
    ],
  },
  {
    depth: 30,
    items: [
      { label: 'Orders', tone: 'cyan' },
      { label: 'Users', tone: 'cyan' },
      { label: 'Notify', tone: 'cyan' },
    ],
  },
  {
    depth: 16,
    items: [
      { label: 'Postgres', tone: 'green' },
      { label: 'Redis', tone: 'amber' },
      { label: 'Kafka', tone: 'purple' },
    ],
  },
]

const TONES = {
  blue:   { bg: 'rgba(59,130,246,0.12)',  bd: 'rgba(59,130,246,0.45)',  fg: '#93c5fd' },
  purple: { bg: 'rgba(139,92,246,0.12)',  bd: 'rgba(139,92,246,0.45)',  fg: '#c4b5fd' },
  cyan:   { bg: 'rgba(6,182,212,0.12)',   bd: 'rgba(6,182,212,0.45)',   fg: '#67e8f9' },
  green:  { bg: 'rgba(16,185,129,0.12)',  bd: 'rgba(16,185,129,0.45)',  fg: '#6ee7b7' },
  amber:  { bg: 'rgba(245,158,11,0.12)',  bd: 'rgba(245,158,11,0.45)',  fg: '#fcd34d' },
}

const BlueprintCard = () => (
  <div
    className="tilt-layer relative rounded-2xl border border-[#26263a] bg-[#0e0e17]/95 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)] backdrop-blur-xl overflow-hidden"
    style={{ transform: 'translateZ(0px)' }}
  >
    {/* window chrome */}
    <div
      className="flex items-center gap-2 px-4 h-10 border-b border-[#20202e] bg-[#0b0b13]"
      style={{ transform: 'translateZ(20px)' }}
    >
      <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
      <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
      <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
      <span className="ml-2 text-[11px] font-mono text-[#6b7280]">architecture.blueprint</span>
      <span className="ml-auto flex items-center gap-1.5 text-[11px] text-[#67e8f9]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#22d3ee]" />
        live
      </span>
    </div>

    {/* diagram body */}
    <div className="p-5 space-y-3.5" style={{ transformStyle: 'preserve-3d' }}>
      {NODE_ROWS.map((row, ri) => (
        <div key={ri} style={{ transform: `translateZ(${row.depth}px)` }}>
          <div className="flex items-center justify-center gap-2.5">
            {row.items.map(({ label, tone }) => {
              const t = TONES[tone]
              return (
                <div
                  key={label}
                  className="flex-1 h-9 rounded-lg flex items-center justify-center"
                  style={{ background: t.bg, border: `1px solid ${t.bd}` }}
                >
                  <span
                    className="text-[10px] font-semibold font-mono tracking-tight"
                    style={{ color: t.fg }}
                  >
                    {label}
                  </span>
                </div>
              )
            })}
          </div>

          {ri < NODE_ROWS.length - 1 && (
            <div className="relative h-4 flex items-center justify-center">
              <div className="w-px h-full bg-gradient-to-b from-[#3b82f6]/50 to-[#8b5cf6]/30" />
              <span
                className="packet-dot-y absolute top-0 w-1.5 h-1.5 rounded-full bg-[#60a5fa] shadow-[0_0_8px_#60a5fa]"
                style={{ animationDelay: `${ri * 0.5}s` }}
              />
            </div>
          )}
        </div>
      ))}
    </div>

    {/* footer stat strip */}
    <div
      className="flex items-center gap-4 px-5 h-11 border-t border-[#20202e] bg-[#0b0b13]"
      style={{ transform: 'translateZ(28px)' }}
    >
      <Sparkles className="w-3.5 h-3.5 text-[#a78bfa]" />
      <span className="text-[11px] text-[#94a3b8]">Generated in 3.2s</span>
      <span className="text-[11px] text-[#4b5563]">·</span>
      <span className="text-[11px] text-[#94a3b8]">14 components</span>
      <span className="ml-auto text-[11px] font-mono text-[#6ee7b7]">HLD ready</span>
    </div>
  </div>
)

const Hero = () => {
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const sceneRef = useRef(null)
  const bodyRef = useRef(null)

  const handleMove = useCallback((e) => {
    const scene = sceneRef.current
    const body = bodyRef.current
    if (!scene || !body) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const r = scene.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    body.style.transform = `rotateY(${px * 16}deg) rotateX(${-py * 14}deg)`
  }, [])

  const handleLeave = useCallback(() => {
    const body = bodyRef.current
    if (body) body.style.transform = 'rotateY(-9deg) rotateX(6deg)'
  }, [])

  useEffect(() => { handleLeave() }, [handleLeave])

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-28 pb-20">
      {/* ── 3D / atmospheric background ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="aurora-blob aurora-1" style={{ top: '-14%', left: '-6%' }} />
        <div className="aurora-blob aurora-2" style={{ top: '18%', right: '-8%' }} />
        <div className="aurora-blob aurora-3" style={{ bottom: '-6%', left: '32%' }} />
        <div className="grid-floor" />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(10,10,15,0) 0%, rgba(10,10,15,0.75) 100%)',
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl w-full px-6 grid lg:grid-cols-[1.05fr_1fr] gap-14 lg:gap-10 items-center">
        {/* ── Copy ── */}
        <div className="text-center lg:text-left">
          <Reveal>
            <a
              href="#features"
              className="inline-flex items-center gap-2 pl-1.5 pr-3 py-1.5 mb-7 rounded-full border border-[#26263a] bg-[#12121a]/80 backdrop-blur text-[12px] text-[#cbd5e1] hover:border-[#3a3a55] transition-colors"
            >
              <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] text-white text-[10px] font-semibold tracking-wide">
                NEW
              </span>
              Live traffic simulation & chaos testing
              <ArrowRight className="w-3 h-3 text-[#94a3b8]" />
            </a>
          </Reveal>

          <Reveal delay={60}>
            <h1
              className="font-heading font-bold text-[#f8fafc] mb-6"
              style={{
                fontSize: 'clamp(2.6rem, 5.6vw, 4.25rem)',
                lineHeight: 1.04,
                letterSpacing: '-0.035em',
              }}
            >
              Ship system design
              <br />
              <GradientText>at the speed of thought.</GradientText>
            </h1>
          </Reveal>

          <Reveal delay={120}>
            <p className="text-[17px] leading-relaxed text-[#94a3b8] mb-9 max-w-[30rem] mx-auto lg:mx-0">
              Describe your product in plain English. ArchMind generates the architecture,
              database schema, API contracts and scaling plan — then lets you stress-test it
              under real traffic.
            </p>
          </Reveal>

          <Reveal delay={180}>
            <div className="flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start">
              <button
                onClick={() => navigate(isAuthenticated ? '/dashboard' : '/signup')}
                className="btn btn-primary btn-lg group w-full sm:w-auto"
              >
                {isAuthenticated ? 'Go to dashboard' : 'Start building free'}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </button>
              <a href="#how" className="btn btn-secondary btn-lg w-full sm:w-auto">
                <Play className="w-3.5 h-3.5 text-[#7cb0ff]" />
                See how it works
              </a>
            </div>
          </Reveal>

          <Reveal delay={240}>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 justify-center lg:justify-start">
              {['3 designs free', 'No credit card', 'Export anywhere'].map((t) => (
                <span key={t} className="inline-flex items-center gap-1.5 text-[13px] text-[#94a3b8]">
                  <Check className="w-3.5 h-3.5 text-[#34d399]" />
                  {t}
                </span>
              ))}
            </div>
          </Reveal>
        </div>

        {/* ── 3D tilt card ── */}
        <Reveal delay={150} className="hidden lg:block">
          <div
            ref={sceneRef}
            className="tilt-scene relative"
            onMouseMove={handleMove}
            onMouseLeave={handleLeave}
          >
            <div
              className="absolute -inset-8 rounded-[2rem] opacity-60 blur-3xl pointer-events-none"
              style={{
                background:
                  'radial-gradient(circle at 50% 40%, rgba(59,130,246,0.25), rgba(139,92,246,0.16) 45%, transparent 70%)',
              }}
              aria-hidden="true"
            />
            <div ref={bodyRef} className="tilt-body relative">
              <BlueprintCard />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Bento feature grid
   ═══════════════════════════════════════════════════════════════ */

const MiniDiagram = () => (
  <div className="mt-5 rounded-xl border border-[#22222f] bg-[#0b0b12] p-4">
    <div className="flex items-center justify-center gap-2 mb-2.5">
      {['Client', 'CDN'].map((l) => (
        <div
          key={l}
          className="flex-1 h-7 rounded-md flex items-center justify-center border border-[#3b82f6]/40 bg-[#3b82f6]/10"
        >
          <span className="text-[9px] font-mono font-semibold text-[#93c5fd]">{l}</span>
        </div>
      ))}
    </div>
    <div className="relative h-3 flex justify-center">
      <div className="w-px h-full bg-[#3b82f6]/40" />
      <span className="packet-dot-y absolute top-0 w-1 h-1 rounded-full bg-[#60a5fa]" />
    </div>
    <div className="flex items-center justify-center gap-2 mt-2.5">
      {['Gateway', 'Service', 'DB'].map((l, i) => (
        <div
          key={l}
          className="flex-1 h-7 rounded-md flex items-center justify-center"
          style={{
            border: `1px solid ${i === 2 ? 'rgba(16,185,129,0.4)' : 'rgba(139,92,246,0.4)'}`,
            background: i === 2 ? 'rgba(16,185,129,0.1)' : 'rgba(139,92,246,0.1)',
          }}
        >
          <span
            className="text-[9px] font-mono font-semibold"
            style={{ color: i === 2 ? '#6ee7b7' : '#c4b5fd' }}
          >
            {l}
          </span>
        </div>
      ))}
    </div>
  </div>
)

const SchemaPreview = () => (
  <div className="mt-5 rounded-xl border border-[#22222f] bg-[#0b0b12] overflow-hidden font-mono text-[11px]">
    <div className="px-3 py-2 border-b border-[#22222f] bg-[#10101a] text-[#6ee7b7] font-semibold">
      users
    </div>
    {[
      ['id', 'uuid', 'PK'],
      ['email', 'varchar', 'UQ'],
      ['created_at', 'timestamptz', ''],
    ].map(([c, t, k]) => (
      <div key={c} className="flex items-center gap-2 px-3 py-1.5 border-b border-[#1a1a26] last:border-0">
        <span className="text-[#e2e8f0] flex-1">{c}</span>
        <span className="text-[#64748b]">{t}</span>
        {k && (
          <span className="px-1 rounded bg-[#f59e0b]/15 text-[#fcd34d] text-[9px] font-bold">{k}</span>
        )}
      </div>
    ))}
  </div>
)

const EndpointPreview = () => (
  <div className="mt-5 space-y-1.5 font-mono text-[11px]">
    {[
      ['GET', '/api/v1/orders', '#34d399'],
      ['POST', '/api/v1/orders', '#60a5fa'],
      ['DELETE', '/api/v1/orders/:id', '#f87171'],
    ].map(([m, p, c]) => (
      <div
        key={`${m} ${p}`}
        className="flex items-center gap-2.5 px-3 py-2 rounded-lg border border-[#22222f] bg-[#0b0b12]"
      >
        <span className="font-bold w-12 shrink-0" style={{ color: c }}>{m}</span>
        <span className="text-[#cbd5e1] truncate">{p}</span>
      </div>
    ))}
  </div>
)

const Features = () => (
  <section id="features" className="relative py-28 px-6">
    <div className="mx-auto max-w-6xl">
      <Reveal>
        <div className="max-w-2xl mb-14">
          <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#7cb0ff]">
            Everything you need
          </span>
          <h2
            className="mt-3 font-heading font-bold text-[#f8fafc]"
            style={{ fontSize: 'clamp(2rem, 3.6vw, 2.85rem)', letterSpacing: '-0.03em', lineHeight: 1.12 }}
          >
            One prompt. <GradientText>An entire blueprint.</GradientText>
          </h2>
          <p className="mt-4 text-[16px] leading-relaxed text-[#94a3b8]">
            Not a chatbot that writes paragraphs about architecture — a system that produces
            the actual artifacts you'd hand to an engineering team.
          </p>
        </div>
      </Reveal>

      <div className="grid md:grid-cols-6 gap-4">
        <Reveal className="md:col-span-4">
          <article className="bento-card p-7 h-full">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-[#3b82f6]/12 border border-[#3b82f6]/25 flex items-center justify-center">
                <Network className="w-[18px] h-[18px] text-[#7cb0ff]" />
              </div>
              <h3 className="font-heading text-[17px] font-semibold text-[#f1f5f9]">
                Architecture diagrams
              </h3>
            </div>
            <p className="mt-3 text-[14px] leading-relaxed text-[#94a3b8] max-w-md">
              Interactive HLD and LLD graphs with component relationships, data flows and
              deployment topology — editable on an infinite canvas.
            </p>
            <MiniDiagram />
          </article>
        </Reveal>

        <Reveal delay={80} className="md:col-span-2">
          <article className="bento-card p-7 h-full">
            <div className="w-9 h-9 rounded-lg bg-[#10b981]/12 border border-[#10b981]/25 flex items-center justify-center">
              <Database className="w-[18px] h-[18px] text-[#6ee7b7]" />
            </div>
            <h3 className="mt-3 font-heading text-[17px] font-semibold text-[#f1f5f9]">
              Database schema
            </h3>
            <p className="mt-2.5 text-[14px] leading-relaxed text-[#94a3b8]">
              Normalized ER models with indexes and relationships. Export as SQL DDL.
            </p>
            <SchemaPreview />
          </article>
        </Reveal>

        <Reveal delay={40} className="md:col-span-2">
          <article className="bento-card p-7 h-full">
            <div className="w-9 h-9 rounded-lg bg-[#8b5cf6]/12 border border-[#8b5cf6]/25 flex items-center justify-center">
              <Code2 className="w-[18px] h-[18px] text-[#c4b5fd]" />
            </div>
            <h3 className="mt-3 font-heading text-[17px] font-semibold text-[#f1f5f9]">
              API contracts
            </h3>
            <p className="mt-2.5 text-[14px] leading-relaxed text-[#94a3b8]">
              Typed endpoints with payloads and auth. Copy as OpenAPI 3.0.
            </p>
            <EndpointPreview />
          </article>
        </Reveal>

        <Reveal delay={80} className="md:col-span-4">
          <article className="bento-card p-7 h-full relative overflow-hidden">
            <div
              className="absolute -right-16 -top-16 w-56 h-56 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.10), transparent 68%)' }}
              aria-hidden="true"
            />
            <div className="relative">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-[#f59e0b]/12 border border-[#f59e0b]/25 flex items-center justify-center">
                  <Zap className="w-[18px] h-[18px] text-[#fcd34d]" />
                </div>
                <h3 className="font-heading text-[17px] font-semibold text-[#f1f5f9]">
                  Traffic simulation & chaos testing
                </h3>
              </div>
              <p className="mt-3 text-[14px] leading-relaxed text-[#94a3b8] max-w-lg">
                Push synthetic load through your design, watch utilization and latency climb
                per node, then kill a cache or crash the gateway and see exactly what breaks.
              </p>

              <div className="mt-5 grid grid-cols-3 gap-3">
                {[
                  { label: 'Throughput', value: '500', unit: 'RPS', color: '#7cb0ff' },
                  { label: 'p50 latency', value: '14', unit: 'ms', color: '#6ee7b7' },
                  { label: 'Error rate', value: '0.97', unit: '%', color: '#fcd34d' },
                ].map((m) => (
                  <div key={m.label} className="rounded-xl border border-[#22222f] bg-[#0b0b12] p-3">
                    <div className="text-[11px] uppercase tracking-wider text-[#94a3b8]">
                      {m.label}
                    </div>
                    <div className="mt-1.5 font-mono text-[19px] font-semibold" style={{ color: m.color }}>
                      {m.value}
                      <span className="ml-1 text-[11px] text-[#64748b]">{m.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </article>
        </Reveal>

        <Reveal className="md:col-span-3">
          <article className="bento-card p-7 h-full">
            <div className="w-9 h-9 rounded-lg bg-[#06b6d4]/12 border border-[#06b6d4]/25 flex items-center justify-center">
              <TrendingUp className="w-[18px] h-[18px] text-[#67e8f9]" />
            </div>
            <h3 className="mt-3 font-heading text-[17px] font-semibold text-[#f1f5f9]">
              Scalability plan
            </h3>
            <p className="mt-2.5 text-[14px] leading-relaxed text-[#94a3b8]">
              Caching layers, load balancing, sharding strategy and CDN posture — with the
              stress points that break first, called out by scale tier.
            </p>
          </article>
        </Reveal>

        <Reveal delay={80} className="md:col-span-3">
          <article className="bento-card p-7 h-full">
            <div className="w-9 h-9 rounded-lg bg-[#ef4444]/12 border border-[#ef4444]/25 flex items-center justify-center">
              <ShieldCheck className="w-[18px] h-[18px] text-[#fca5a5]" />
            </div>
            <h3 className="mt-3 font-heading text-[17px] font-semibold text-[#f1f5f9]">
              Challenge mode
            </h3>
            <p className="mt-2.5 text-[14px] leading-relaxed text-[#94a3b8]">
              An adversarial pass over your own design: single points of failure, bottlenecks
              and trade-offs you didn't account for — ranked by severity.
            </p>
          </article>
        </Reveal>
      </div>
    </div>
  </section>
)

/* ═══════════════════════════════════════════════════════════════
   How it works
   ═══════════════════════════════════════════════════════════════ */

const STEPS = [
  {
    n: '01',
    icon: Code2,
    title: 'Describe the product',
    body: 'Plain English. Add scale expectations, budget and tech preferences if you have them — skip them if you don\'t.',
    tone: '#7cb0ff',
  },
  {
    n: '02',
    icon: BrainCircuit,
    title: 'Generate the blueprint',
    body: 'HLD, LLD, database schema, API contracts and a scaling plan — produced together so they actually agree with each other.',
    tone: '#c4b5fd',
  },
  {
    n: '03',
    icon: Layers,
    title: 'Stress it, then ship it',
    body: 'Simulate traffic, inject failures, refine on the canvas, then export to PDF, JSON or OpenAPI.',
    tone: '#67e8f9',
  },
]

const HowItWorks = () => (
  <section id="how" className="relative py-28 px-6 border-y border-[#16161f] bg-[#0c0c13]">
    <div className="mx-auto max-w-6xl">
      <Reveal>
        <div className="max-w-2xl mb-14">
          <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#a78bfa]">
            How it works
          </span>
          <h2
            className="mt-3 font-heading font-bold text-[#f8fafc]"
            style={{ fontSize: 'clamp(2rem, 3.6vw, 2.85rem)', letterSpacing: '-0.03em', lineHeight: 1.12 }}
          >
            Idea to architecture in <GradientText>three steps.</GradientText>
          </h2>
        </div>
      </Reveal>

      <div className="grid md:grid-cols-3 gap-4 relative">
        <div
          className="hidden md:block absolute top-[46px] left-[16%] right-[16%] h-px bg-gradient-to-r from-[#3b82f6]/30 via-[#8b5cf6]/30 to-[#06b6d4]/30"
          aria-hidden="true"
        />
        {STEPS.map(({ n, icon: Icon, title, body, tone }, i) => (
          <Reveal key={n} delay={i * 90}>
            <div className="relative bento-card p-7 h-full">
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center border"
                  style={{ background: `${tone}14`, borderColor: `${tone}33` }}
                >
                  <Icon className="w-5 h-5" style={{ color: tone }} />
                </div>
                <span className="font-mono text-[12px] font-bold" style={{ color: tone }}>{n}</span>
              </div>
              <h3 className="mt-4 font-heading text-[17px] font-semibold text-[#f1f5f9]">{title}</h3>
              <p className="mt-2.5 text-[14px] leading-relaxed text-[#94a3b8]">{body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
)

/* ═══════════════════════════════════════════════════════════════
   Pricing
   ═══════════════════════════════════════════════════════════════ */

const FREE_INCLUDED = [
  '3 designs per month',
  'HLD + LLD diagrams',
  'Database schema & SQL export',
  'API contracts',
  'Scalability plan',
  'PDF export',
]
const FREE_EXCLUDED = ['Challenge mode', 'OpenAPI YAML export', 'Shareable links']
const PRO_INCLUDED = [
  'Unlimited designs',
  'Everything in Free',
  'Challenge mode',
  'OpenAPI YAML export',
  'Shareable read-only links',
  'Priority generation queue',
]

const Pricing = () => {
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  return (
    <section id="pricing" className="relative py-28 px-6">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <div className="text-center mb-14">
            <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#67e8f9]">
              Pricing
            </span>
            <h2
              className="mt-3 font-heading font-bold text-[#f8fafc]"
              style={{ fontSize: 'clamp(2rem, 3.6vw, 2.85rem)', letterSpacing: '-0.03em' }}
            >
              Start free. <GradientText>Upgrade when it pays for itself.</GradientText>
            </h2>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-2 gap-5 items-stretch">
          <Reveal className="h-full">
            <div className="bento-card p-8 h-full flex flex-col">
              <h3 className="font-heading text-[15px] font-semibold text-[#f1f5f9]">Free</h3>
              <div className="mt-3 flex items-end gap-1.5">
                <span className="font-heading text-[44px] font-bold text-[#f8fafc] leading-none tracking-tight">$0</span>
                <span className="text-[14px] text-[#94a3b8] mb-1">/month</span>
              </div>
              <p className="mt-3 text-[14px] text-[#94a3b8]">
                For exploring, interviews and side projects.
              </p>
              <button
                onClick={() => navigate(isAuthenticated ? '/dashboard' : '/signup')}
                className="btn btn-secondary w-full mt-6"
              >
                {isAuthenticated ? 'Go to dashboard' : 'Get started free'}
              </button>
              <div className="mt-7 space-y-2.5">
                {FREE_INCLUDED.map((f) => (
                  <div key={f} className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#34d399] shrink-0" />
                    <span className="text-[14px] text-[#cbd5e1]">{f}</span>
                  </div>
                ))}
                {FREE_EXCLUDED.map((f) => (
                  <div key={f} className="flex items-center gap-2.5">
                    <X className="w-4 h-4 text-[#4b5563] shrink-0" />
                    <span className="text-[14px] text-[#64748b]">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={80} className="h-full">
            <div className="relative h-full">
              <div
                className="absolute -inset-px rounded-2xl opacity-70 blur-[3px] pointer-events-none"
                style={{ background: 'linear-gradient(140deg, #3b82f6, #8b5cf6 55%, #06b6d4)' }}
                aria-hidden="true"
              />
              <div className="relative rounded-2xl border border-[#3b82f6]/40 bg-[#12121a] p-8 h-full flex flex-col">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading text-[15px] font-semibold text-[#f1f5f9]">Pro</h3>
                  <span className="px-2.5 py-1 rounded-full bg-[#3b82f6]/15 border border-[#3b82f6]/30 text-[11px] font-semibold text-[#7cb0ff]">
                    7-day free trial
                  </span>
                </div>
                <div className="mt-3 flex items-end gap-1.5">
                  <span className="font-heading text-[44px] font-bold text-[#f8fafc] leading-none tracking-tight">$19</span>
                  <span className="text-[14px] text-[#94a3b8] mb-1">/month</span>
                </div>
                <p className="mt-3 text-[14px] text-[#94a3b8]">
                  For engineers and teams shipping real systems.
                </p>
                <button
                  onClick={() => navigate(isAuthenticated ? '/upgrade' : '/signup')}
                  className="btn btn-primary w-full mt-6"
                >
                  {isAuthenticated ? 'Upgrade to Pro' : 'Start free trial'}
                </button>
                <div className="mt-7 space-y-2.5">
                  {PRO_INCLUDED.map((f) => (
                    <div key={f} className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-[#7cb0ff] shrink-0" />
                      <span className="text-[14px] text-[#e2e8f0]">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Closing CTA
   ═══════════════════════════════════════════════════════════════ */

const CTA = () => {
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  return (
    <section className="relative py-28 px-6 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="aurora-blob aurora-2" style={{ top: '-34%', left: '26%', opacity: 0.7 }} />
        <div className="aurora-blob aurora-3" style={{ bottom: '-24%', right: '18%', opacity: 0.6 }} />
      </div>

      <div className="relative mx-auto max-w-6xl grid lg:grid-cols-[1fr_auto] gap-16 items-center">
        <Reveal>
          <div className="text-center lg:text-left">
            <h2
              className="font-heading font-bold text-[#f8fafc]"
              style={{ fontSize: 'clamp(2.1rem, 4vw, 3.1rem)', letterSpacing: '-0.035em', lineHeight: 1.1 }}
            >
              Your next system starts with <GradientText>one sentence.</GradientText>
            </h2>
            <p className="mt-5 text-[17px] text-[#94a3b8] max-w-xl leading-relaxed mx-auto lg:mx-0">
              Describe it, generate the blueprint, and pressure-test the design before you write
              a single line of code.
            </p>
            <div className="mt-9 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <button
                onClick={() => navigate(isAuthenticated ? '/dashboard' : '/signup')}
                className="btn btn-primary btn-lg group"
              >
                {isAuthenticated ? 'Go to dashboard' : 'Start building free'}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </button>
              <a href="#features" className="btn btn-secondary btn-lg">
                Explore features
              </a>
            </div>
          </div>
        </Reveal>

        {/* 3D architecture stack — the closing visual */}
        <Reveal delay={120} className="hidden lg:block">
          <div className="relative">
            <div
              className="absolute inset-0 blur-3xl opacity-70 pointer-events-none"
              style={{
                background:
                  'radial-gradient(circle at 50% 55%, rgba(59,130,246,0.20), rgba(139,92,246,0.12) 50%, transparent 72%)',
              }}
              aria-hidden="true"
            />
            <ArchStack3D size={340} className="relative" />
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Footer
   ═══════════════════════════════════════════════════════════════ */

const Footer = () => (
  <footer className="border-t border-[#16161f] bg-[#0a0a0f] py-12 px-6">
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-col md:flex-row gap-8 md:items-start justify-between">
        <div className="max-w-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6] flex items-center justify-center">
              <BrainCircuit className="w-4 h-4 text-white" />
            </div>
            <span className="font-heading text-[14px] font-semibold text-[#f1f5f9]">ArchMind</span>
          </div>
          <p className="mt-3 text-[13px] leading-relaxed text-[#94a3b8]">
            AI-powered system design for engineers who'd rather build than draw boxes.
          </p>
          <div className="flex gap-2 mt-5">
            <a
              href="https://github.com/Ankii04"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="w-8 h-8 rounded-lg border border-[#22222f] flex items-center justify-center text-[#94a3b8] hover:text-[#f1f5f9] hover:border-[#3a3a55] transition-colors"
            >
              <Github className="w-4 h-4" />
            </a>
            <a
              href="https://www.linkedin.com/in/ankii04/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="w-8 h-8 rounded-lg border border-[#22222f] flex items-center justify-center text-[#94a3b8] hover:text-[#f1f5f9] hover:border-[#3a3a55] transition-colors"
            >
              <Linkedin className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-14 gap-y-6">
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#64748b]">
              Product
            </h4>
            <ul className="mt-3.5 space-y-2.5">
              {NAV_LINKS.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="text-[13px] text-[#94a3b8] hover:text-[#f1f5f9] transition-colors">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#64748b]">
              Built with
            </h4>
            <ul className="mt-3.5 space-y-2.5 text-[13px] text-[#94a3b8]">
              <li className="flex items-center gap-2">
                <Server className="w-3.5 h-3.5 text-[#64748b]" />
                Gemini 2.5 Flash
              </li>
              <li className="flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-[#64748b]" />
                React & React Flow
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-10 pt-6 border-t border-[#16161f]">
        <p className="text-[12px] text-[#64748b]">© 2026 ArchMind. All rights reserved.</p>
      </div>
    </div>
  </footer>
)

/* ═══════════════════════════════════════════════════════════════ */

const Landing = () => (
  <div className="min-h-screen bg-[#0a0a0f] text-[#f1f5f9] antialiased overflow-x-hidden">
    <Navbar />
    <Hero />
    <Features />
    <HowItWorks />
    <Pricing />
    <CTA />
    <Footer />
  </div>
)

export default Landing
