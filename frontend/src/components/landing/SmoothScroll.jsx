import { useEffect, useRef } from 'react'
import Lenis from 'lenis'

/**
 * SmoothScroll — Lenis-driven inertial scrolling for the landing page only.
 * Scoped to this route (mounted/unmounted with Landing), so the app's other
 * pages (editor, canvas, sandbox — all of which need native scroll behavior
 * in nested panels) are never affected. Disabled under prefers-reduced-motion.
 */
export default function SmoothScroll({ children }) {
  const lenisRef = useRef(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.4,
    })
    lenisRef.current = lenis

    let raf
    const tick = (time) => { lenis.raf(time); raf = requestAnimationFrame(tick) }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [])

  return children
}
