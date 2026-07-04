import { useCallback, useEffect, useRef, useState } from 'react'
import FrameSequenceScrub from './FrameSequenceScrub'
import { generateDummyFrames } from '../lib/dummyFrames'
import { asset } from '../lib/asset'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

/* ------------------------------------------------------------------ */
/*  Frame source                                                       */
/*                                                                     */
/*  useDummyFrames = true  -> runtime-generated placeholder frames.    */
/*  When the real extracted frames land in /public/seq/assembly/,      */
/*  flip the flag to false and adjust REAL_FRAME_COUNT / the URL       */
/*  pattern below. That is the only change required.                   */
/* ------------------------------------------------------------------ */

const useDummyFrames = false

const REAL_FRAME_COUNT = 151
const realFrameUrls = Array.from(
  { length: REAL_FRAME_COUNT },
  (_, i) => asset(`seq/assembly/frame_${String(i + 1).padStart(4, '0')}.webp`),
)

/* ------------------------------------------------------------------ */
/*  Spec overlays — synced to scrub progress                           */
/* ------------------------------------------------------------------ */

interface Spec {
  label: string
  value: string
  unit: string
  /** visible window in scrub progress */
  start: number
  end: number
  /** overlay placement */
  position: string
}

const SPECS: Spec[] = [
  {
    label: 'Carbon monocoque',
    value: '1,240',
    unit: 'kg',
    start: 0.06,
    end: 0.24,
    position: 'left-[8vw] top-[18vh]',
  },
  {
    label: 'Mid-mounted V8 hybrid',
    value: '850',
    unit: 'HP',
    start: 0.26,
    end: 0.42,
    position: 'right-[8vw] top-[22vh] text-right',
  },
  {
    label: 'Sculpted by wind',
    value: 'Cd 0.28',
    unit: '',
    start: 0.44,
    end: 0.6,
    position: 'left-[8vw] bottom-[24vh]',
  },
  {
    label: '0–100 km/h',
    value: '2.9',
    unit: 's',
    start: 0.62,
    end: 0.78,
    position: 'right-[8vw] bottom-[26vh] text-right',
  },
  {
    label: 'Top speed',
    value: '340',
    unit: 'km/h',
    start: 0.8,
    end: 0.95,
    position: 'left-[8vw] top-[20vh]',
  },
]

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}

/** Opacity of a spec overlay at progress `p` — eased fade in, hold, fade out. */
function overlayOpacity(p: number, start: number, end: number): number {
  const feather = 0.045
  return Math.min(
    smoothstep(start, start + feather, p),
    1 - smoothstep(end - feather, end, p),
  )
}

function SpecOverlay({
  spec,
  refCallback,
}: {
  spec: Spec
  refCallback: (el: HTMLDivElement | null) => void
}) {
  return (
    <div
      ref={refCallback}
      className={`absolute will-change-transform ${spec.position}`}
      style={{ opacity: 0 }}
    >
      <p className="label-luxe mb-4">{spec.label}</p>
      <p className="numeral-luxe text-[clamp(3.5rem,9vw,8rem)]">
        {spec.value}
        {spec.unit && (
          <span className="ml-3 align-baseline text-[0.28em] tracking-[0.2em] text-ivory/60">
            {spec.unit}
          </span>
        )}
      </p>
      <div className="mt-5 h-px w-24 bg-gold/60" />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Section                                                            */
/* ------------------------------------------------------------------ */

export default function AssemblySection() {
  const reducedMotion = usePrefersReducedMotion()
  const [frameUrls, setFrameUrls] = useState<string[] | null>(
    useDummyFrames ? null : realFrameUrls,
  )

  useEffect(() => {
    if (!useDummyFrames) return
    let cancelled = false
    generateDummyFrames({ count: 90 }).then((urls) => {
      if (!cancelled) setFrameUrls(urls)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const overlayRefs = useRef<(HTMLDivElement | null)[]>([])
  const introRef = useRef<HTMLDivElement | null>(null)
  const progressRef = useRef<HTMLDivElement | null>(null)

  // Direct DOM writes on every scrub tick — no React re-renders.
  const handleProgress = useCallback((p: number) => {
    SPECS.forEach((spec, i) => {
      const el = overlayRefs.current[i]
      if (!el) return
      const o = overlayOpacity(p, spec.start, spec.end)
      el.style.opacity = o.toFixed(3)
      el.style.transform = `translateY(${((1 - o) * 18).toFixed(2)}px)`
    })
    if (introRef.current) {
      const o = 1 - smoothstep(0.01, 0.06, p)
      introRef.current.style.opacity = o.toFixed(3)
    }
    if (progressRef.current) {
      progressRef.current.style.transform = `scaleX(${p.toFixed(4)})`
    }
  }, [])

  if (!frameUrls) {
    return (
      <section
        id="assembly"
        className="flex h-svh items-center justify-center bg-bg"
        aria-label="The Assembly"
      >
        <p className="label-luxe animate-pulse">Preparing sequence</p>
      </section>
    )
  }

  // Reduced motion: static beauty frame + specs as a calm grid, no pin.
  if (reducedMotion) {
    return (
      <section id="assembly" aria-label="The Assembly">
        <FrameSequenceScrub frameUrls={frameUrls} heightVh={100}>
          <div className="absolute left-[8vw] top-[16vh]">
            <h2 className="label-luxe">The Assembly</h2>
          </div>
        </FrameSequenceScrub>
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-14 border-t hairline px-8 py-24 sm:grid-cols-2 lg:grid-cols-3">
          {SPECS.map((spec) => (
            <div key={spec.label}>
              <p className="label-luxe mb-3">{spec.label}</p>
              <p className="numeral-luxe text-6xl">
                {spec.value}
                {spec.unit && (
                  <span className="ml-2 text-lg text-ivory/60">
                    {spec.unit}
                  </span>
                )}
              </p>
            </div>
          ))}
        </div>
      </section>
    )
  }

  return (
    <section id="assembly" aria-label="The Assembly">
      <FrameSequenceScrub
        frameUrls={frameUrls}
        heightVh={600}
        onProgress={handleProgress}
      >
        {/* intro cue — fades as the build begins */}
        <div
          ref={introRef}
          className="absolute inset-x-0 top-[14vh] text-center"
        >
          <h2 className="label-luxe">The Assembly</h2>
          <p className="mt-4 font-display text-2xl font-light italic text-ivory/50 md:text-3xl">
            Scroll. Watch it become one.
          </p>
        </div>

        {SPECS.map((spec, i) => (
          <SpecOverlay
            key={spec.label}
            spec={spec}
            refCallback={(el) => {
              overlayRefs.current[i] = el
            }}
          />
        ))}

        {/* progress hairline */}
        <div className="absolute inset-x-[8vw] bottom-[7vh] h-px bg-ivory/10">
          <div
            ref={progressRef}
            className="h-full w-full origin-left bg-gold/70"
            style={{ transform: 'scaleX(0)' }}
          />
        </div>
      </FrameSequenceScrub>
    </section>
  )
}
