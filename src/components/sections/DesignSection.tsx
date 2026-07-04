import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import LuxeImage from './LuxeImage'
import { asset } from '../../lib/asset'

gsap.registerPlugin(ScrollTrigger)

/**
 * Design — editorial, image-led.
 *
 * Three macro-detail panels in an alternating grid. Each photograph drifts
 * slowly inside its clipped frame (scrubbed parallax on the oversized inner
 * surface — transform-only). A serif pull-quote breathes between panels.
 * Reduced motion: no triggers are created; images sit still.
 */

interface Panel {
  src: string
  alt: string
  caption: string
  index: string
  discipline: string
  line: string
  note: string
}

const PANELS: Panel[] = [
  {
    src: asset('img/design/headlamp.webp'),
    alt: 'Macro detail of the VANTERA ONE LED headlamp',
    caption: 'Headlamp — awaiting photography',
    index: '01',
    discipline: 'Light',
    line: 'Sculpted by wind.',
    note: 'The lamp sits where the airflow allowed it. Nowhere else.',
  },
  {
    src: asset('img/design/interior.webp'),
    alt: 'Macro detail of leather and gold stitching inside the VANTERA ONE',
    caption: 'Interior — awaiting photography',
    index: '02',
    discipline: 'Interior',
    line: 'Hand-stitched. Nothing printed.',
    note: 'One artisan, one hide, eleven days.',
  },
  {
    src: asset('img/design/wheel.webp'),
    alt: 'Macro detail of the forged wheel and gold brake caliper',
    caption: 'Wheel — awaiting photography',
    index: '03',
    discipline: 'Metal',
    line: 'Forged, not cast.',
    note: 'Grain follows load. The wheel is stronger where it works harder.',
  },
]

function PanelCaption({ panel }: { panel: Panel }) {
  return (
    <div>
      <p className="label-luxe">
        {panel.index}
        <span className="mx-3 text-gold/40">·</span>
        {panel.discipline}
      </p>
      <p className="mt-6 font-display text-3xl font-light italic leading-snug text-ivory md:text-4xl">
        {panel.line}
      </p>
      <div className="mt-8 h-px w-16 bg-gold/50" />
      <p className="mt-8 max-w-xs text-[0.8rem] font-light leading-7 text-ivory/55">
        {panel.note}
      </p>
    </div>
  )
}

export default function DesignSection() {
  const rootRef = useRef<HTMLElement | null>(null)

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return

    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.utils
        .toArray<HTMLElement>('[data-luxe-frame]', root)
        .forEach((frame) => {
          const inner = frame.querySelector<HTMLElement>('[data-luxe-inner]')
          if (!inner) return
          gsap.fromTo(
            inner,
            { yPercent: -6.5 },
            {
              yPercent: 6.5,
              ease: 'none',
              scrollTrigger: {
                trigger: frame,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1.2, // weighted — matches the house motion character
                invalidateOnRefresh: true,
              },
            },
          )
        })
    })

    return () => mm.revert()
  }, [])

  return (
    <section
      ref={rootRef}
      id="design"
      className="relative border-t hairline px-6 py-32 md:px-[8vw] md:py-48"
      aria-label="Design"
    >
      {/* section head */}
      <p className="label-luxe mb-8">Design</p>
      <h2 className="max-w-3xl font-display text-5xl font-light leading-[1.05] text-ivory md:text-7xl">
        Drawn by wind,
        <br />
        <span className="italic text-gold">finished by hand.</span>
      </h2>

      {/* 01 — image left, caption right */}
      <div className="mt-28 grid grid-cols-1 items-center gap-12 md:mt-44 md:grid-cols-12 md:gap-0">
        <LuxeImage
          src={PANELS[0].src}
          alt={PANELS[0].alt}
          caption={PANELS[0].caption}
          oversize
          className="aspect-video md:col-span-7"
        />
        <div className="md:col-span-4 md:col-start-9">
          <PanelCaption panel={PANELS[0]} />
        </div>
      </div>

      {/* pull-quote */}
      <div className="mx-auto my-32 max-w-3xl text-center md:my-52">
        <div className="mx-auto mb-12 h-px w-16 bg-gold/40" />
        <p className="font-display text-3xl font-light italic leading-[1.35] text-ivory/85 md:text-[2.75rem]">
          Every line has a job.
          <br />
          It does it <span className="text-gold">in silence.</span>
        </p>
        <p className="label-luxe mt-12 !text-ivory/50">Atelier Vantera</p>
      </div>

      {/* 02 — caption left, image right */}
      <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-12 md:gap-0">
        <LuxeImage
          src={PANELS[1].src}
          alt={PANELS[1].alt}
          caption={PANELS[1].caption}
          oversize
          className="aspect-video md:col-span-7 md:col-start-6 md:row-start-1"
        />
        <div className="md:col-span-4 md:col-start-1 md:row-start-1">
          <PanelCaption panel={PANELS[1]} />
        </div>
      </div>

      {/* 03 — wide, caption tucked beneath */}
      <div className="mt-32 md:mt-52">
        <LuxeImage
          src={PANELS[2].src}
          alt={PANELS[2].alt}
          caption={PANELS[2].caption}
          oversize
          className="aspect-video md:mx-[4vw]"
        />
        <div className="mt-12 md:ml-[4vw] md:max-w-md">
          <PanelCaption panel={PANELS[2]} />
        </div>
      </div>
    </section>
  )
}
