import { useRef, useEffect } from 'react'

/**
 * ParticleBloom — a dependency-free 3D particle point-cloud, in the spirit of
 * getlayers' "Vesper" hero: thousands of glowing points arranged on a ruffled
 * rose/torus surface, slowly rotating, colour-graded green → cyan → blue →
 * purple, reacting to the pointer. Rendered on a 2D canvas with hand-rolled
 * perspective projection and additive ('lighter') compositing for the glow —
 * no Three.js, no WebGL, ~0 bundle cost.
 *
 * Honors prefers-reduced-motion (renders a single static frame) and pauses
 * when the tab is hidden.
 */

const GOLDEN = Math.PI * (3 - Math.sqrt(5)) // phyllotaxis angle, even spread

function buildPoints(count) {
  const pts = new Array(count)
  const inner = 0.2 // hollow centre
  const outer = 1.0
  const petals = 6
  const twist = 2.6
  const ruffle = 0.5 // petal height
  const rim = 0.36 // upward curl at the edge
  const bowl = 0.32 // overall bowl depth

  for (let i = 0; i < count; i++) {
    // Even radial density: area ∝ r², so r ∝ sqrt(t)
    const t = i / (count - 1)
    const r = inner + (outer - inner) * Math.sqrt(t)
    const theta = i * GOLDEN
    const rn = (r - inner) / (outer - inner)

    // Bowl that dips at the centre, petals that ruffle and curl up at the rim
    let y =
      ruffle * rn * rn * Math.sin(petals * theta + rn * twist) + // ruffled petals
      rim * Math.pow(rn, 3) +                                    // rim curls up
      bowl * rn * rn -                                           // bowl rise outward
      bowl * 0.5                                                 // centre sits low

    const x = Math.cos(theta) * r
    const z = Math.sin(theta) * r

    // Hue wraps with angle (top green → round to purple) nudged by height
    const ang = (Math.atan2(z, x) + Math.PI) / (Math.PI * 2) // 0..1
    const hue = 150 + 165 * ((ang + y * 0.5 + 1) % 1)

    pts[i] = { x, y, z, r: rn, hue, seed: Math.random() * Math.PI * 2 }
  }
  return pts
}

function buildDust(count) {
  const d = new Array(count)
  for (let i = 0; i < count; i++) {
    d[i] = {
      x: (Math.random() - 0.5) * 3.4,
      y: (Math.random() - 0.5) * 2.4,
      z: (Math.random() - 0.5) * 3.4,
      s: 0.2 + Math.random() * 0.5,
      sp: 0.04 + Math.random() * 0.09,
    }
  }
  return d
}

export default function ParticleBloom({ className = '', count = 5200, offsetX = 0, offsetY = 0, scrollReactive = false }) {
  const canvasRef = useRef(null)
  const pointerRef = useRef({ x: 0, y: 0, tx: 0, ty: 0 })
  const scrollRef = useRef({ raw: 0, eased: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const points = buildPoints(count)
    const dust = buildDust(reduce ? 40 : 150)

    let W = 0
    let H = 0
    let dpr = 1
    let raf = 0
    let running = true
    const proj = new Array(points.length)

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      W = Math.max(1, Math.round(rect.width))
      H = Math.max(1, Math.round(rect.height))
      canvas.width = W * dpr
      canvas.height = H * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      pointerRef.current.tx = ((e.clientX - rect.left) / rect.width - 0.5) * 2
      pointerRef.current.ty = ((e.clientY - rect.top) / rect.height - 0.5) * 2
    }
    window.addEventListener('pointermove', onMove, { passive: true })

    // Scroll progress through the first viewport (0 at top → 1 one screen down)
    const onScroll = () => {
      const h = window.innerHeight || 1
      scrollRef.current.raw = Math.min(Math.max(window.scrollY / (h * 0.9), 0), 1)
    }
    if (scrollReactive) {
      onScroll()
      window.addEventListener('scroll', onScroll, { passive: true })
    }

    const onVis = () => {
      running = !document.hidden
      if (running && !reduce) raf = requestAnimationFrame(frame)
    }
    document.addEventListener('visibilitychange', onVis)

    const TILT = -0.9 // view down into the bowl (more top-down)

    const render = (time) => {
      const p = pointerRef.current
      p.x += (p.tx - p.x) * 0.05
      p.y += (p.ty - p.y) * 0.05

      // Ease scroll progress so the reaction feels weighty, not twitchy
      const s = scrollRef.current
      s.eased += (s.raw - s.eased) * 0.08
      const sc = s.eased // 0..1 scroll drive

      // Scroll drives the whole 3D gesture: it spins up, zooms toward the
      // viewer, blooms apart, tilts flatter and dissolves as content arrives.
      const spin = (reduce ? 0.6 : time * 0.00013) + sc * 3.4
      const tilt = TILT + p.y * 0.28 + sc * 0.5
      const cosS = Math.cos(spin)
      const sinS = Math.sin(spin)
      const cosT = Math.cos(tilt)
      const sinT = Math.sin(tilt)

      const zoom = 1 + sc * 0.9
      const disperse = 1 + sc * 1.1 // points fly outward
      const fade = 1 - sc * 0.82 // dissolve on scroll
      const scale = Math.min(W, H) * 0.46 * zoom
      const cx = W / 2 + W * offsetX
      const cy = H / 2 + H * (0.04 + offsetY) + sc * H * 0.12
      const persp = 2.6
      const breathe = reduce ? 1 : 1 + Math.sin(time * 0.0006) * 0.015

      // rotate → tilt → project
      for (let i = 0; i < points.length; i++) {
        const pt = points[i]
        const wobble = reduce ? 0 : Math.sin(time * 0.0012 + pt.seed) * 0.012 * pt.r
        let x = pt.x * breathe * disperse
        let y = (pt.y + wobble) * breathe * disperse
        let z = pt.z * breathe * disperse

        // spin about Y
        let rx = x * cosS - z * sinS
        let rz = x * sinS + z * cosS
        // tilt about X
        let ry = y * cosT - rz * sinT
        let rz2 = y * sinT + rz * cosT

        rx += p.x * 0.12 // subtle pointer parallax

        const depth = persp / (persp - rz2)
        proj[i] = {
          sx: cx + rx * scale * depth,
          sy: cy + ry * scale * depth,
          d: rz2,
          hue: pt.hue,
        }
      }

      // painter's algorithm: far → near
      proj.sort((a, b) => a.d - b.d)

      ctx.clearRect(0, 0, W, H)
      ctx.globalCompositeOperation = 'lighter'

      // ambient dust (behind)
      for (let i = 0; i < dust.length; i++) {
        const g = dust[i]
        if (!reduce) g.y += g.sp * 0.004
        if (g.y > 1.2) g.y = -1.2
        const dp = persp / (persp - g.z)
        const sx = cx + g.x * scale * dp * 0.7
        const sy = cy + g.y * scale * dp * 0.7
        ctx.fillStyle = `rgba(180,200,255,${0.05 + g.s * 0.05})`
        ctx.fillRect(sx, sy, g.s, g.s)
      }

      // bloom points
      for (let i = 0; i < proj.length; i++) {
        const q = proj[i]
        // depth fog: nearer = brighter/bigger
        const f = (q.d + 1.1) / 2.2 // ~0..1
        const alpha = (0.22 + f * 0.72) * fade
        const size = 0.9 + f * 1.9
        const light = 50 + f * 18
        ctx.fillStyle = `hsla(${q.hue},88%,${light}%,${alpha})`
        ctx.fillRect(q.sx, q.sy, size, size)
      }

      ctx.globalCompositeOperation = 'source-over'
    }

    const frame = (time) => {
      if (!running) return
      render(time)
      raf = requestAnimationFrame(frame)
    }

    if (reduce) {
      render(performance.now())
    } else {
      raf = requestAnimationFrame(frame)
    }

    return () => {
      running = false
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('scroll', onScroll)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [count, scrollReactive])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden="true"
      style={{ display: 'block', width: '100%', height: '100%' }}
    />
  )
}
