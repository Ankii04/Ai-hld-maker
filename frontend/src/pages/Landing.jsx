import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import ParticleBloom from '../components/landing/ParticleBloom'
import {
  Network,
  Database,
  Code2,
  TrendingUp,
  Zap,
  ShieldCheck,
  ArrowRight,
  Check,
  Menu,
  X,
  Github,
  Linkedin,
} from 'lucide-react'

/* ═══════════════════════════════════════════════════════════════
   Shared
   ═══════════════════════════════════════════════════════════════ */

const Grad = ({ children }) => <span className="vesper-grad">{children}</span>

/** Reveal on scroll — fails open so nothing is ever stuck invisible. */
const Reveal = ({ children, delay = 0, className = '' }) => {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const show = () => {
      el.style.transitionDelay = `${delay}ms`
      el.classList.add('reveal-visible')
    }
    if (typeof IntersectionObserver === 'undefined') return show()
    const io = new IntersectionObserver(
      ([e]) => e.isIntersecting && (show(), io.unobserve(el)),
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' },
    )
    io.observe(el)
    const t = setTimeout(() => { show(); io.disconnect() }, 1500)
    return () => { clearTimeout(t); io.disconnect() }
  }, [delay])
  return <div ref={ref} className={`reveal ${className}`}>{children}</div>
}

const Star = ({ className = '' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
    <path d="M12 2v20M2 12h20M4.9 4.9l14.2 14.2M19.1 4.9L4.9 19.1"
      stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
)

/* ═══════════════════════════════════════════════════════════════
   Nav
   ═══════════════════════════════════════════════════════════════ */

const NAV_LINKS = [
  { label: 'Capabilities', href: '#capabilities' },
  { label: 'How it works', href: '#how' },
  { label: 'Pricing', href: '#pricing' },
]

const Navbar = () => {
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className={`fixed top-0 inset-x-0 z-50 transition-colors duration-300 ${
      scrolled ? 'bg-black/60 backdrop-blur-xl border-b border-white/[0.06]' : 'border-b border-transparent'
    }`}>
      <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
        <button onClick={() => navigate('/')} className="flex items-center gap-2" aria-label="ArchMind home">
          <Star className="w-4 h-4 text-white" />
          <span className="text-[15px] font-medium tracking-tight">ArchMind</span>
        </button>

        <div className="hidden md:flex items-center gap-7">
          {NAV_LINKS.map((l) => (
            <a key={l.label} href={l.href}
              className="text-[13px] text-[#9aa3b2] hover:text-white transition-colors">
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2.5">
          {isAuthenticated ? (
            <button onClick={() => navigate('/dashboard')} className="vesper-btn vesper-btn-primary">Dashboard</button>
          ) : (
            <>
              <button onClick={() => navigate('/login')} className="text-[13px] text-[#c4cad4] hover:text-white transition-colors px-2">Sign in</button>
              <button onClick={() => navigate('/signup')} className="vesper-btn vesper-btn-primary">Start free</button>
            </>
          )}
        </div>

        <button onClick={() => setOpen((v) => !v)}
          className="md:hidden w-9 h-9 rounded-lg border border-white/10 flex items-center justify-center text-[#9aa3b2]"
          aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open}>
          {open ? <X className="w-[18px] h-[18px]" /> : <Menu className="w-[18px] h-[18px]" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-black/95 backdrop-blur-xl border-t border-white/[0.06] px-6 py-4 flex flex-col gap-1">
          {NAV_LINKS.map((l) => (
            <a key={l.label} href={l.href} onClick={() => setOpen(false)}
              className="py-2.5 text-sm text-[#9aa3b2] hover:text-white">{l.label}</a>
          ))}
          <div className="flex gap-2 pt-3">
            {isAuthenticated ? (
              <button onClick={() => { setOpen(false); navigate('/dashboard') }} className="vesper-btn vesper-btn-primary flex-1 justify-center">Dashboard</button>
            ) : (
              <>
                <button onClick={() => { setOpen(false); navigate('/login') }} className="vesper-btn vesper-btn-ghost flex-1 justify-center">Sign in</button>
                <button onClick={() => { setOpen(false); navigate('/signup') }} className="vesper-btn vesper-btn-primary flex-1 justify-center">Start free</button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Hero — the particle bloom centerpiece
   ═══════════════════════════════════════════════════════════════ */

const Hero = () => {
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const contentRef = useRef(null)

  // Content drifts up and fades faster than the bloom behind it → parallax depth
  useEffect(() => {
    const el = contentRef.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let raf = 0
    const update = () => {
      const p = Math.min(window.scrollY / (window.innerHeight || 1), 1)
      el.style.transform = `translate3d(0, ${p * -80}px, 0)`
      el.style.opacity = String(1 - p * 1.1)
    }
    const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { cancelAnimationFrame(raf); window.removeEventListener('scroll', onScroll) }
  }, [])

  return (
    <section className="relative min-h-screen">
      {/* content (bloom is a fixed page-level layer behind everything) */}
      <div ref={contentRef} className="relative z-10 min-h-screen max-w-6xl mx-auto px-6 flex flex-col will-change-transform">
        <div className="flex-1 flex flex-col justify-center pt-24">
          <Reveal>
            <span className="vesper-tag">AI System Design</span>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="vesper-display mt-5 text-[clamp(2.7rem,7vw,6rem)] max-w-[13ch]">
              Systems that
              <br />
              <Grad>design themselves.</Grad>
            </h1>
          </Reveal>
          <Reveal delay={150}>
            <p className="mt-7 max-w-[46ch] text-[15px] md:text-[16px] leading-relaxed text-[#9aa3b2]">
              Describe a product in plain English. ArchMind renders the architecture,
              database schema, API contracts and scaling plan — then lets you stress-test
              it under live traffic before a line of code exists.
            </p>
          </Reveal>
          <Reveal delay={220}>
            <div className="mt-9 flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <button
                onClick={() => navigate(isAuthenticated ? '/dashboard' : '/signup')}
                className="vesper-btn vesper-btn-primary group">
                {isAuthenticated ? 'Go to dashboard' : 'Start building free'}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </button>
              <a href="#how" className="vesper-btn vesper-btn-ghost">See it work</a>
            </div>
          </Reveal>
        </div>

        {/* bottom rail */}
        <Reveal delay={300}>
          <div className="pb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-t border-white/[0.06] pt-6">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <span className="vesper-tag">HLD + LLD</span>
              <span className="vesper-tag">Live Simulation</span>
              <span className="vesper-tag">Export Anywhere</span>
            </div>
            <p className="max-w-[34ch] text-[12.5px] leading-relaxed text-[#7a8394]">
              A generative layer that turns a single sentence into a production-ready
              blueprint — and pressure-tests it under load.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Capabilities
   ═══════════════════════════════════════════════════════════════ */

const CAPS = [
  { icon: Network, tag: 'HLD + LLD', title: 'Architecture diagrams', body: 'Interactive high- and low-level diagrams with real component relationships, data flows and deployment topology — editable on an infinite canvas.', tone: '#4ade80' },
  { icon: Database, tag: 'Schema + ER', title: 'Database design', body: 'Normalized ER models with indexes and relationships, exportable straight to SQL DDL.', tone: '#22d3ee' },
  { icon: Code2, tag: 'OpenAPI 3.0', title: 'API contracts', body: 'Typed endpoints with request/response payloads and auth — copy as OpenAPI YAML.', tone: '#6aa8ff' },
  { icon: Zap, tag: 'Live sandbox', title: 'Traffic & chaos testing', body: 'Push synthetic load through the design, watch per-node latency climb, then kill a cache or crash the gateway and see exactly what breaks.', tone: '#f5c451' },
  { icon: TrendingUp, tag: 'Scale plan', title: 'Scalability strategy', body: 'Caching layers, load balancing, sharding and CDN posture — with the stress points that break first, called out by tier.', tone: '#b98bff' },
  { icon: ShieldCheck, tag: 'Adversarial', title: 'Challenge mode', body: 'An adversarial pass over your own design: single points of failure, bottlenecks and trade-offs, ranked by severity.', tone: '#fb7185' },
]

const Capabilities = () => (
  <section id="capabilities" className="relative py-28 px-6 bg-[#000005]">
    <div className="max-w-6xl mx-auto">
      <Reveal>
        <div className="max-w-2xl">
          <span className="vesper-tag">Everything you need</span>
          <h2 className="vesper-display mt-4 text-[clamp(2rem,4vw,3.2rem)]">
            One prompt. <Grad>An entire blueprint.</Grad>
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-[#9aa3b2]">
            Not a chatbot that writes paragraphs about architecture — a system that
            produces the actual artifacts you'd hand an engineering team.
          </p>
        </div>
      </Reveal>

      <div className="mt-14 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {CAPS.map((c, i) => (
          <Reveal key={c.title} delay={(i % 3) * 70}>
            <article className="vesper-card h-full p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="w-9 h-9 rounded-lg flex items-center justify-center border"
                  style={{ background: `${c.tone}12`, borderColor: `${c.tone}30` }}>
                  <c.icon size={17} style={{ color: c.tone }} />
                </span>
                <span className="vesper-tag">{c.tag}</span>
              </div>
              <h3 className="text-[17px] font-medium tracking-tight text-white">{c.title}</h3>
              <p className="text-[13.5px] leading-relaxed text-[#9aa3b2]">{c.body}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
)

/* ═══════════════════════════════════════════════════════════════
   How it works
   ═══════════════════════════════════════════════════════════════ */

const STEPS = [
  { n: '01', title: 'Describe the product', body: 'Plain English. Add scale, budget and tech preferences if you have them — skip them if you don\'t.' },
  { n: '02', title: 'Generate the blueprint', body: 'HLD, LLD, schema, API contracts and a scaling plan — produced together, so they actually agree with each other.' },
  { n: '03', title: 'Stress it, then ship it', body: 'Simulate traffic, inject failures, refine on the canvas, then export to PDF, JSON or OpenAPI.' },
]

const HowItWorks = () => (
  <section id="how" className="relative py-28 px-6 border-y border-white/[0.05] bg-[#000005]">
    <div className="max-w-6xl mx-auto">
      <Reveal>
        <div className="max-w-2xl mb-14">
          <span className="vesper-tag">How it works</span>
          <h2 className="vesper-display mt-4 text-[clamp(2rem,4vw,3.2rem)]">
            Idea to architecture, <Grad>in three moves.</Grad>
          </h2>
        </div>
      </Reveal>
      <div className="grid md:grid-cols-3 gap-4">
        {STEPS.map((s, i) => (
          <Reveal key={s.n} delay={i * 80}>
            <div className="vesper-card h-full p-7">
              <span className="font-mono text-[13px] vesper-grad">{s.n}</span>
              <h3 className="mt-4 text-[17px] font-medium tracking-tight text-white">{s.title}</h3>
              <p className="mt-2.5 text-[13.5px] leading-relaxed text-[#9aa3b2]">{s.body}</p>
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

const FREE = ['3 designs per month', 'HLD + LLD diagrams', 'Database schema & SQL export', 'API contracts', 'Scalability plan', 'PDF export']
const FREE_NOT = ['Challenge mode', 'OpenAPI YAML export', 'Shareable links']
const PRO = ['Unlimited designs', 'Everything in Free', 'Challenge mode', 'OpenAPI YAML export', 'Shareable read-only links', 'Priority generation queue']

const Pricing = () => {
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return (
    <section id="pricing" className="relative py-28 px-6 bg-[#000005]">
      <div className="max-w-5xl mx-auto">
        <Reveal>
          <div className="text-center mb-14">
            <span className="vesper-tag">Pricing</span>
            <h2 className="vesper-display mt-4 text-[clamp(2rem,4vw,3.2rem)]">
              Start free. <Grad>Upgrade when it pays for itself.</Grad>
            </h2>
          </div>
        </Reveal>
        <div className="grid md:grid-cols-2 gap-4 items-stretch">
          <Reveal className="h-full">
            <div className="vesper-card h-full p-8 flex flex-col">
              <h3 className="text-[14px] font-medium text-[#c4cad4]">Free</h3>
              <div className="mt-3 flex items-end gap-1.5">
                <span className="vesper-display text-[46px] text-white">$0</span>
                <span className="text-[13px] text-[#9aa3b2] mb-2">/month</span>
              </div>
              <p className="mt-2 text-[13.5px] text-[#9aa3b2]">For exploring, interviews and side projects.</p>
              <button onClick={() => navigate(isAuthenticated ? '/dashboard' : '/signup')}
                className="vesper-btn vesper-btn-ghost w-full justify-center mt-6">
                {isAuthenticated ? 'Go to dashboard' : 'Get started free'}
              </button>
              <div className="mt-7 flex flex-col gap-2.5">
                {FREE.map((f) => (
                  <div key={f} className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#4ade80] shrink-0" />
                    <span className="text-[13.5px] text-[#c4cad4]">{f}</span>
                  </div>
                ))}
                {FREE_NOT.map((f) => (
                  <div key={f} className="flex items-center gap-2.5">
                    <X className="w-4 h-4 text-[#4a5568] shrink-0" />
                    <span className="text-[13.5px] text-[#6a7486]">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={80} className="h-full">
            <div className="relative h-full">
              <div className="absolute -inset-px rounded-[15px] opacity-60 blur-[3px] pointer-events-none"
                style={{ background: 'linear-gradient(140deg,#4ade80,#22d3ee 40%,#b98bff)' }} aria-hidden="true" />
              <div className="relative h-full rounded-[14px] p-8 flex flex-col bg-[#06060c] border border-white/10">
                <div className="flex items-center justify-between">
                  <h3 className="text-[14px] font-medium text-white">Pro</h3>
                  <span className="vesper-tag">7-day trial</span>
                </div>
                <div className="mt-3 flex items-end gap-1.5">
                  <span className="vesper-display text-[46px] text-white">$19</span>
                  <span className="text-[13px] text-[#9aa3b2] mb-2">/month</span>
                </div>
                <p className="mt-2 text-[13.5px] text-[#9aa3b2]">For engineers and teams shipping real systems.</p>
                <button onClick={() => navigate(isAuthenticated ? '/upgrade' : '/signup')}
                  className="vesper-btn vesper-btn-primary w-full justify-center mt-6">
                  {isAuthenticated ? 'Upgrade to Pro' : 'Start free trial'}
                </button>
                <div className="mt-7 flex flex-col gap-2.5">
                  {PRO.map((f) => (
                    <div key={f} className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 shrink-0" style={{ color: '#6aa8ff' }} />
                      <span className="text-[13.5px] text-[#e7eaf0]">{f}</span>
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
   Closing CTA — a second, smaller bloom
   ═══════════════════════════════════════════════════════════════ */

const CTA = () => {
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return (
    <section className="relative overflow-hidden border-t border-white/[0.05] bg-[#000005]">
      <div className="absolute inset-0 opacity-70">
        <ParticleBloom className="w-full h-full" count={2600} />
      </div>
      <div className="vesper-vignette" />
      <div className="relative z-10 max-w-3xl mx-auto px-6 py-32 text-center">
        <Reveal>
          <h2 className="vesper-display text-[clamp(2.2rem,5vw,3.6rem)]">
            Your next system starts <Grad>with one sentence.</Grad>
          </h2>
          <p className="mt-5 text-[15px] leading-relaxed text-[#9aa3b2] max-w-xl mx-auto">
            Describe it, generate the blueprint, and pressure-test the design before you
            write a line of code.
          </p>
          <div className="mt-9 flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => navigate(isAuthenticated ? '/dashboard' : '/signup')}
              className="vesper-btn vesper-btn-primary group">
              {isAuthenticated ? 'Go to dashboard' : 'Start building free'}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </button>
            <a href="#capabilities" className="vesper-btn vesper-btn-ghost">Explore capabilities</a>
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
  <footer className="border-t border-white/[0.06] px-6 py-12 bg-[#000005]">
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div className="flex items-center gap-2">
        <Star className="w-4 h-4 text-white" />
        <span className="text-[14px] font-medium">ArchMind</span>
        <span className="text-[12.5px] text-[#6a7486] ml-3">AI system design, alive under every pointer.</span>
      </div>
      <div className="flex items-center gap-5">
        {NAV_LINKS.map((l) => (
          <a key={l.label} href={l.href} className="text-[12.5px] text-[#9aa3b2] hover:text-white transition-colors">{l.label}</a>
        ))}
        <a href="https://github.com/Ankii04" target="_blank" rel="noopener noreferrer" aria-label="GitHub"
          className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center text-[#9aa3b2] hover:text-white hover:border-white/30 transition-colors">
          <Github className="w-4 h-4" />
        </a>
        <a href="https://www.linkedin.com/in/ankii04/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"
          className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center text-[#9aa3b2] hover:text-white hover:border-white/30 transition-colors">
          <Linkedin className="w-4 h-4" />
        </a>
      </div>
    </div>
    <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-white/[0.05]">
      <p className="text-[12px] text-[#6a7486]">© 2026 ArchMind. All rights reserved.</p>
    </div>
  </footer>
)

/* ═══════════════════════════════════════════════════════════════ */

// No overflow-x-hidden on the root div below: it forces overflow-y to auto too
// (an element can't have overflow-x hidden with overflow-y visible), which
// trapped the whole page's scroll inside that div as a second scrollbar
// instead of letting it bubble up to the natural page-level scroll.
// Horizontal overflow is already contained at the body level.
const Landing = () => (
  <div className="vesper min-h-screen antialiased">
    {/* Fixed 3D field behind the whole page — reacts to scroll and dissolves
        as you move down, so the hero reads as one living scene.
        vesper-grain + overflow-hidden live here (not on the page-scroll root
        above) because its ::after pseudo-element is intentionally 2x this
        box's size (inset: -50%) to bleed texture past the edges — clipping
        that requires overflow-hidden on a viewport-fixed box, not the tall
        scrollable page root, or it leaks into page-level horizontal scroll. */}
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden vesper-grain">
      <div className="vesper-atmos" />
      <ParticleBloom className="absolute inset-0" offsetX={0.1} offsetY={-0.03} scrollReactive />
      <div className="vesper-vignette" />
    </div>

    <div className="relative z-10">
      <Navbar />
      <Hero />
      <Capabilities />
      <HowItWorks />
      <Pricing />
      <CTA />
      <Footer />
    </div>
  </div>
)

export default Landing
