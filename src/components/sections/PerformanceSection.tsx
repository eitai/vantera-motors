import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * Performance.
 *
 * 1. Count-up numerals on viewport entry — direct DOM writes via refs
 *    (zero React re-renders), long expo ease, staggered, fires once.
 * 2. A horizontal data band: pinned strip that translates sideways while
 *    the page scrolls vertically. Desktop only — on mobile the same words
 *    stack vertically with a quiet reveal (no pin).
 *
 * Markup renders the FINAL values by default, so reduced-motion and no-JS
 * both see the finished state; animations only rewind things when they are
 * actually going to run.
 */

interface Stat {
  value: number
  decimals: number
  group?: boolean
  unit: string
  label: string
}

const STATS: Stat[] = [
  { value: 850, decimals: 0, unit: 'HP', label: 'Combined output' },
  { value: 2.9, decimals: 1, unit: 's', label: '0–100 km/h' },
  { value: 340, decimals: 0, unit: 'km/h', label: 'Top speed' },
  { value: 1240, decimals: 0, group: true, unit: 'kg', label: 'Dry weight' },
]

function formatStat(v: number, stat: Stat): string {
  return stat.group
    ? Math.round(v).toLocaleString('en-US')
    : v.toFixed(stat.decimals)
}

type BandItem =
  | { kind: 'numeral'; text: string; unit?: string }
  | { kind: 'word'; text: string }

const BAND: BandItem[] = [
  { kind: 'numeral', text: '850', unit: 'HP' },
  { kind: 'word', text: 'V8 Hybrid' },
  { kind: 'numeral', text: '2.9', unit: 's' },
  { kind: 'word', text: 'Carbon' },
  { kind: 'numeral', text: '340', unit: 'km/h' },
  { kind: 'word', text: 'Midnight Aurum' },
]

function BandFigure({ item, mobile = false }: { item: BandItem; mobile?: boolean }) {
  if (item.kind === 'numeral') {
    return (
      <span className="flex items-baseline whitespace-nowrap">
        <span
          className={`numeral-luxe leading-none ${
            mobile ? 'text-7xl' : 'text-[24vh]'
          }`}
        >
          {item.text}
        </span>
        {item.unit && (
          <span className={`label-luxe !text-ivory/50 ${mobile ? 'ml-3' : 'ml-6'}`}>
            {item.unit}
          </span>
        )}
      </span>
    )
  }
  return (
    <span
      className={`whitespace-nowrap font-display font-light italic text-gold ${
        mobile ? 'text-4xl' : 'text-[12vh]'
      }`}
    >
      {item.text}
    </span>
  )
}

export default function PerformanceSection() {
  const rootRef = useRef<HTMLElement | null>(null)
  const statsGridRef = useRef<HTMLDivElement | null>(null)
  const numeralRefs = useRef<(HTMLSpanElement | null)[]>([])
  const bandRef = useRef<HTMLDivElement | null>(null)
  const trackRef = useRef<HTMLDivElement | null>(null)

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return

    const mm = gsap.matchMedia()

    // --- count-ups (any width, motion allowed) -------------------------
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const grid = statsGridRef.current
      if (!grid) return

      // Rewind to zero only now that we know the animation will run.
      STATS.forEach((stat, i) => {
        const el = numeralRefs.current[i]
        if (el) el.textContent = formatStat(0, stat)
      })

      ScrollTrigger.create({
        trigger: grid,
        start: 'top 78%',
        once: true,
        onEnter: () => {
          STATS.forEach((stat, i) => {
            const el = numeralRefs.current[i]
            if (!el) return
            const proxy = { v: 0 }
            gsap.to(proxy, {
              v: stat.value,
              duration: 2.6,
              delay: i * 0.15,
              ease: 'expo.out', // fast rise, long settle — heavy, precise
              onUpdate: () => {
                el.textContent = formatStat(proxy.v, stat)
              },
            })
          })
        },
      })
    })

    // --- horizontal band: pinned sideways travel (desktop only) --------
    mm.add(
      '(min-width: 768px) and (prefers-reduced-motion: no-preference)',
      () => {
        const band = bandRef.current
        const track = trackRef.current
        if (!band || !track) return

        const distance = () =>
          Math.max(0, track.scrollWidth - window.innerWidth)

        gsap.to(track, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: band,
            start: 'top top',
            end: () => '+=' + distance(),
            pin: true,
            pinSpacing: true,
            scrub: 1.2,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        })
      },
    )

    // --- mobile: simple stacked reveal, no pin -------------------------
    mm.add(
      '(max-width: 767px) and (prefers-reduced-motion: no-preference)',
      () => {
        gsap.utils
          .toArray<HTMLElement>('[data-band-item-m]', root)
          .forEach((el) => {
            gsap.from(el, {
              autoAlpha: 0,
              y: 28,
              duration: 1.4,
              ease: 'power3.out',
              scrollTrigger: { trigger: el, start: 'top 88%', once: true },
            })
          })
      },
    )

    return () => mm.revert()
  }, [])

  return (
    <section ref={rootRef} id="performance" aria-label="Performance">
      {/* head + count-up stats */}
      <div className="relative border-t hairline px-6 py-32 md:px-[8vw] md:py-44">
        <p className="label-luxe mb-8">Performance</p>
        <h2 className="max-w-3xl font-display text-5xl font-light leading-[1.05] text-ivory md:text-7xl">
          Violence,
          <span className="italic text-gold"> composed.</span>
        </h2>

        <div
          ref={statsGridRef}
          className="mt-24 grid grid-cols-1 gap-14 sm:grid-cols-2 lg:grid-cols-4"
        >
          {STATS.map((stat, i) => (
            <div key={stat.label} className="border-l hairline pl-8">
              <p className="numeral-luxe text-6xl md:text-7xl">
                <span
                  ref={(el) => {
                    numeralRefs.current[i] = el
                  }}
                >
                  {formatStat(stat.value, stat)}
                </span>
                <span className="ml-2 text-lg text-ivory/50">{stat.unit}</span>
              </p>
              <p className="label-luxe mt-4 !text-ivory/55">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* horizontal data band — desktop (pinned) */}
      <div
        ref={bandRef}
        className="relative hidden overflow-hidden border-t hairline md:block"
      >
        <div className="flex h-svh items-center">
          <div
            ref={trackRef}
            className="flex w-max items-center gap-[7vw] pl-[12vw] pr-[16vw] will-change-transform"
          >
            <span className="label-luxe self-center whitespace-nowrap !text-ivory/50">
              Vantera One
              <span className="mx-4 text-gold/50">—</span>
              in numbers
            </span>
            {BAND.map((item, i) => (
              <span key={i} className="flex items-center gap-[7vw]">
                <span aria-hidden="true" className="h-px w-[5vw] bg-gold/30" />
                <BandFigure item={item} />
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* horizontal data band — mobile (stacked, no pin) */}
      <div className="border-t hairline px-6 py-24 md:hidden">
        <p className="label-luxe mb-14 !text-ivory/50">
          Vantera One <span className="mx-2 text-gold/50">—</span> in numbers
        </p>
        <div className="flex flex-col gap-12">
          {BAND.map((item, i) => (
            <span key={i} data-band-item-m className="block">
              <BandFigure item={item} mobile />
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
