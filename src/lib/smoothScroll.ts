import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)

/**
 * Smooth-scroll foundation: Lenis drives the scroll, GSAP's ticker drives
 * Lenis, and every Lenis scroll event pings ScrollTrigger so pins/scrubs
 * stay in sync.
 *
 * Returns a cleanup function. When `prefers-reduced-motion` is set we keep
 * native scrolling (no smoothing) but ScrollTrigger still works.
 */
export function initSmoothScroll(): () => void {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // Re-measure pins once the display fonts have loaded (layout shifts).
  document.fonts?.ready.then(() => ScrollTrigger.refresh()).catch(() => {})

  if (reduced) {
    return () => {}
  }

  const lenis = new Lenis({
    // Heavy, weighted glide — nothing twitchy.
    lerp: 0.09,
    smoothWheel: true,
    wheelMultiplier: 0.9,
  })

  lenis.on('scroll', ScrollTrigger.update)

  const raf = (time: number) => {
    lenis.raf(time * 1000)
  }
  gsap.ticker.add(raf)
  gsap.ticker.lagSmoothing(0)

  return () => {
    gsap.ticker.remove(raf)
    lenis.destroy()
  }
}
