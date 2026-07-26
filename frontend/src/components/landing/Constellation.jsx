import { useRef, useEffect } from 'react'

/**
 * Constellation — an original 3D "living architecture" field. Nodes float in
 * space, luminous edges connect the nearest of them, and data pulses travel
 * the network. It's a moving abstraction of exactly what ArchMind produces (a
 * system diagram) — deliberately nothing like a particle bloom.
 *
 * Pure canvas 2D with hand-rolled perspective. No WebGL, no deps. Reacts to
 * pointer (parallax) and scroll (drifts back and dissolves). Honors
 * prefers-reduced-motion and pauses when the tab is hidden.
 */

const COOL = [
  [111, 155, 255], // azure
  [157, 140, 255], // iris
  [79, 224, 207],  // teal
]
const EMBER = [255, 158, 92]

function build(count) {
  const nodes = new Array(count)
  for (let i = 0; i < count; i++) {
    // distribute in a flattened sphere shell for depth without a hard ball
    const u = Math.random()
    const v = Math.random()
    const theta = u * Math.PI * 2
    const phi = Math.acos(2 * v - 1)
    const r = 0.55 + Math.random() * 0.5
    const rare = Math.random() < 0.08
    nodes[i] = {
      x: Math.sin(phi) * Math.cos(theta) * r * 1.35,
      y: (Math.cos(phi) * r) * 0.82,
      z: Math.sin(phi) * Math.sin(theta) * r * 1.35,
      col: rare ? EMBER : COOL[i % COOL.length],
      size: 0.7 + Math.random() * 1.5,
      seed: Math.random() * Math.PI * 2,
    }
  }
  return nodes
}

export default function Constellation({ className = '', count = 108, scrollReactive = false }) {
  const canvasRef = useRef(null)
  const pointer = useRef({ x: 0, y: 0, tx: 0, ty: 0 })
  const scroll = useRef({ raw: 0, eased: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const nodes = build(count)
    // Precompute candidate edges (nearest neighbours) once — cheap per frame.
    const edges = []
    const LINK = 0.62
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x
        const dy = nodes[i].y - nodes[j].y
        const dz = nodes[i].z - nodes[j].z
        const d = Math.sqrt(dx * dx + dy * dy + dz * dz)
        if (d < LINK) edges.push({ a: i, b: j, d, pulse: Math.random() < 0.22 ? Math.random() : -1 })
      }
    }

    let W = 0, H = 0, dpr = 1, raf = 0, running = true
    const P = new Array(nodes.length)

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
      pointer.current.tx = ((e.clientX - rect.left) / rect.width - 0.5) * 2
      pointer.current.ty = ((e.clientY - rect.top) / rect.height - 0.5) * 2
    }
    window.addEventListener('pointermove', onMove, { passive: true })

    const onScroll = () => {
      const h = window.innerHeight || 1
      scroll.current.raw = Math.min(Math.max(window.scrollY / (h * 0.95), 0), 1)
    }
    if (scrollReactive) { onScroll(); window.addEventListener('scroll', onScroll, { passive: true }) }

    const onVis = () => { running = !document.hidden; if (running && !reduce) raf = requestAnimationFrame(frame) }
    document.addEventListener('visibilitychange', onVis)

    const render = (time) => {
      const p = pointer.current
      p.x += (p.tx - p.x) * 0.05
      p.y += (p.ty - p.y) * 0.05
      const s = scroll.current
      s.eased += (s.raw - s.eased) * 0.08
      const sc = s.eased

      const spin = (reduce ? 0.4 : time * 0.00007) + p.x * 0.4 + sc * 0.8
      const tiltX = -0.25 + p.y * 0.25 + sc * 0.4
      const cosS = Math.cos(spin), sinS = Math.sin(spin)
      const cosT = Math.cos(tiltX), sinT = Math.sin(tiltX)

      const zoom = 1 - sc * 0.35 // recede on scroll
      const fade = 1 - sc * 0.9
      const scale = Math.min(W, H) * 0.46 * zoom
      const cx = W / 2, cy = H / 2
      const persp = 3.0

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i]
        const breathe = reduce ? 0 : Math.sin(time * 0.0008 + n.seed) * 0.02
        let x = n.x + breathe, y = n.y, z = n.z + breathe
        // spin about Y then tilt about X
        let rx = x * cosS - z * sinS
        let rz = x * sinS + z * cosS
        let ry = y * cosT - rz * sinT
        let rz2 = y * sinT + rz * cosT
        const depth = persp / (persp - rz2)
        P[i] = {
          sx: cx + rx * scale * depth,
          sy: cy + ry * scale * depth,
          d: rz2,
          depth,
        }
      }

      ctx.clearRect(0, 0, W, H)
      ctx.globalCompositeOperation = 'lighter'

      // edges
      for (let k = 0; k < edges.length; k++) {
        const e = edges[k]
        const a = P[e.a], b = P[e.b]
        const near = (a.d + b.d) / 2
        const df = (near + 1.2) / 2.4 // 0..1 depth
        const strength = (1 - e.d / LINK)
        const alpha = strength * (0.05 + df * 0.16) * fade
        if (alpha <= 0.004) continue
        const c = nodes[e.a].col
        ctx.strokeStyle = `rgba(${c[0]},${c[1]},${c[2]},${alpha})`
        ctx.lineWidth = 0.6 + df * 0.5
        ctx.beginPath()
        ctx.moveTo(a.sx, a.sy)
        ctx.lineTo(b.sx, b.sy)
        ctx.stroke()

        // data pulse traveling the edge
        if (e.pulse >= 0 && !reduce) {
          e.pulse = (e.pulse + 0.0024 + strength * 0.004) % 1
          const t = e.pulse
          const px = a.sx + (b.sx - a.sx) * t
          const py = a.sy + (b.sy - a.sy) * t
          const pc = nodes[e.b].col
          ctx.fillStyle = `rgba(${pc[0]},${pc[1]},${pc[2]},${(0.5 * df) * fade})`
          ctx.fillRect(px - 1, py - 1, 2.2, 2.2)
        }
      }

      // nodes (near → last so they sit on top)
      const order = P.map((_, i) => i).sort((i, j) => P[i].d - P[j].d)
      for (let oi = 0; oi < order.length; oi++) {
        const i = order[oi]
        const q = P[i]
        const n = nodes[i]
        const df = (q.d + 1.2) / 2.4
        const alpha = (0.25 + df * 0.7) * fade
        const size = n.size * (0.6 + df * 0.9)
        const [r, g, bb] = n.col
        ctx.fillStyle = `rgba(${r},${g},${bb},${alpha})`
        ctx.beginPath()
        ctx.arc(q.sx, q.sy, size, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.globalCompositeOperation = 'source-over'
    }

    const frame = (time) => { if (!running) return; render(time); raf = requestAnimationFrame(frame) }
    if (reduce) render(performance.now()); else raf = requestAnimationFrame(frame)

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
    <canvas ref={canvasRef} className={className} aria-hidden="true"
      style={{ display: 'block', width: '100%', height: '100%' }} />
  )
}
