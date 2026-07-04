import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import CarSilhouette from './CarSilhouette'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

/**
 * Cinematic opening: near-black -> a slow diagonal headlight glint sweeps
 * the screen -> the low-opacity silhouette of the ONE surfaces -> the
 * VANTERA wordmark settles in, letter by letter of air.
 */
export default function Hero() {
  const reducedMotion = usePrefersReducedMotion()

  const sectionRef = useRef<HTMLElement>(null)
  const glintRef = useRef<HTMLDivElement>(null)
  const carRef = useRef<HTMLDivElement>(null)
  const overlineRef = useRef<HTMLParagraphElement>(null)
  const wordmarkRef = useRef<HTMLHeadingElement>(null)
  const ruleRef = useRef<HTMLDivElement>(null)
  const taglineRef = useRef<HTMLParagraphElement>(null)
  const cueRef = useRef<HTMLDivElement>(null)
  const cueLineRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const targets = [
      glintRef.current,
      carRef.current,
      overlineRef.current,
      wordmarkRef.current,
      ruleRef.current,
      taglineRef.current,
      cueRef.current,
      cueLineRef.current,
    ]
    if (targets.some((t) => !t)) return

    const ctx = gsap.context(() => {
      if (reducedMotion) {
        // Everything settled, no glint loop, no pulse.
        gsap.set(
          [
            carRef.current,
            overlineRef.current,
            wordmarkRef.current,
            taglineRef.current,
            cueRef.current,
          ],
          { opacity: 1, y: 0 },
        )
        gsap.set(ruleRef.current, { scaleX: 1 })
        gsap.set(glintRef.current, { opacity: 0 })
        return
      }

      gsap.set(glintRef.current, { rotate: 16, x: '-55vw', opacity: 0.9 })

      // Slow, heavy, precise. No bounce anywhere.
      const tl = gsap.timeline({
        defaults: { ease: 'power2.out' },
        delay: 0.35,
      })

      tl.to(glintRef.current, {
        x: '155vw',
        duration: 3,
        ease: 'power2.inOut',
      })
        .fromTo(
          carRef.current,
          { opacity: 0, y: 26 },
          { opacity: 1, y: 0, duration: 2.4, ease: 'power2.inOut' },
          1.1,
        )
        .fromTo(
          overlineRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 1.2 },
          2.2,
        )
        .fromTo(
          wordmarkRef.current,
          { opacity: 0, y: 28, letterSpacing: '0.6em' },
          {
            opacity: 1,
            y: 0,
            letterSpacing: '0.32em',
            duration: 1.8,
            ease: 'expo.out',
          },
          2.5,
        )
        .fromTo(
          ruleRef.current,
          { scaleX: 0 },
          { scaleX: 1, duration: 1.4, ease: 'expo.out' },
          3.1,
        )
        .fromTo(
          taglineRef.current,
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 1.4 },
          3.4,
        )
        .fromTo(
          cueRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 1.2 },
          4.1,
        )

      // Recurring headlight glint — a patient sweep every few breaths.
      gsap.fromTo(
        glintRef.current,
        { x: '-55vw' },
        {
          x: '155vw',
          duration: 3.4,
          ease: 'power2.inOut',
          repeat: -1,
          repeatDelay: 6.5,
          delay: 6,
        },
      )

      // Scroll cue: the thin line quietly pulses (sine — never springy).
      gsap.fromTo(
        cueLineRef.current,
        { scaleY: 0.25, opacity: 0.35 },
        {
          scaleY: 1,
          opacity: 1,
          duration: 1.6,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
          delay: 4.4,
        },
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [reducedMotion])

  return (
    <header
      ref={sectionRef}
      className="relative flex h-svh flex-col items-center justify-center overflow-hidden bg-bg"
      aria-label="VANTERA — Engineered in silence"
    >
      {/* headlight glint — thin diagonal light blade */}
      <div
        ref={glintRef}
        aria-hidden="true"
        className="pointer-events-none absolute -top-[60%] left-0 h-[220%] w-[38vw] opacity-0 mix-blend-screen"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(243,239,230,0.05) 38%, rgba(179,154,104,0.16) 50%, rgba(243,239,230,0.05) 62%, transparent 100%)',
        }}
      />

      {/* the ONE, surfacing from the dark */}
      <div
        ref={carRef}
        className="pointer-events-none absolute inset-x-0 bottom-[10vh] flex justify-center opacity-0 md:bottom-[8vh]"
      >
        <CarSilhouette className="w-[min(1060px,94vw)] text-ivory/25" />
      </div>

      {/* wordmark block */}
      <div className="relative z-10 -mt-[6vh] px-6 text-center">
        <p ref={overlineRef} className="label-luxe opacity-0">
          The Vantera One
        </p>
        <h1
          ref={wordmarkRef}
          className="mt-8 font-display text-[clamp(3.2rem,11vw,8.5rem)] font-light leading-none tracking-[0.32em] text-ivory opacity-0"
          style={{ paddingLeft: '0.32em' }}
        >
          VANTERA
        </h1>
        <div
          ref={ruleRef}
          className="mx-auto mt-10 h-px w-40 origin-center bg-gold/60"
          style={{ transform: 'scaleX(0)' }}
        />
        <p
          ref={taglineRef}
          className="mt-9 text-[0.72rem] font-light uppercase tracking-[0.42em] text-ivory/60 opacity-0 md:text-xs"
        >
          Engineered in silence. Unleashed by you.
        </p>
      </div>

      {/* scroll cue */}
      <div
        ref={cueRef}
        className="absolute bottom-9 left-1/2 flex -translate-x-1/2 flex-col items-center gap-4 opacity-0"
      >
        <span className="text-[0.6rem] uppercase tracking-[0.4em] text-ivory/55">
          Scroll
        </span>
        <div
          ref={cueLineRef}
          className="h-14 w-px origin-top bg-gradient-to-b from-ivory/60 to-transparent"
        />
      </div>
    </header>
  )
}
