import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import LuxeImage from './LuxeImage'
import { asset } from '../../lib/asset'

gsap.registerPlugin(ScrollTrigger)

/**
 * Gallery — three full-viewport beauty shots.
 *
 * Snap: ScrollTrigger snap (not CSS scroll-snap — CSS snapping fights
 * Lenis, which animates the scroll position itself; ScrollTrigger's snap
 * rides the same scroll pipeline Lenis already reports into). No pin, so
 * it coexists cleanly with the Assembly and Performance pins.
 *
 * Motion: a slow Ken-Burns-style scale scrubbed to the panel's passage —
 * deterministic, reversible, transform-only.
 *
 * Reduced motion: no snap, no scale — static stacked photographs.
 */

interface Shot {
  src: string
  alt: string
  caption: string
  index: string
  title: string
  line: string
}

const SHOTS: Shot[] = [
  {
    src: asset('img/gallery/front.webp'),
    alt: 'VANTERA ONE — front three-quarter studio shot',
    caption: 'Front three-quarter — awaiting photography',
    index: '01',
    title: 'Presence',
    line: 'The face of intent.',
  },
  {
    src: asset('img/gallery/rear.webp'),
    alt: 'VANTERA ONE — rear three-quarter studio shot',
    caption: 'Rear three-quarter — awaiting photography',
    index: '02',
    title: 'Departure',
    line: 'The last thing the road remembers.',
  },
  {
    src: asset('img/gallery/side.webp'),
    alt: 'VANTERA ONE — side profile studio shot',
    caption: 'Side profile — awaiting photography',
    index: '03',
    title: 'Profile',
    line: 'One unbroken line, nose to tail.',
  },
]

export default function GallerySection() {
  const rootRef = useRef<HTMLElement | null>(null)
  const panelsRef = useRef<HTMLDivElement | null>(null)

  useLayoutEffect(() => {
    const root = rootRef.current
    const panels = panelsRef.current
    if (!root || !panels) return

    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      // Snap each panel's top to the viewport top once scrolling settles.
      ScrollTrigger.create({
        trigger: panels,
        start: 'top top',
        end: 'bottom bottom',
        snap: {
          snapTo: 1 / (SHOTS.length - 1),
          duration: { min: 0.45, max: 1.0 },
          delay: 0.12,
          ease: 'power2.inOut',
        },
      })

      // Ken Burns: slow scale scrubbed across each panel's pass.
      gsap.utils
        .toArray<HTMLElement>('[data-gallery-panel]', panels)
        .forEach((panel) => {
          const inner = panel.querySelector<HTMLElement>('[data-luxe-inner]')
          if (!inner) return
          gsap.fromTo(
            inner,
            { scale: 1 },
            {
              scale: 1.14,
              ease: 'none',
              transformOrigin: '50% 50%',
              scrollTrigger: {
                trigger: panel,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1.2,
                invalidateOnRefresh: true,
              },
            },
          )
        })
    })

    return () => mm.revert()
  }, [])

  return (
    <section ref={rootRef} id="gallery" aria-label="Gallery">
      {/* compact head */}
      <div className="border-t hairline px-6 pb-20 pt-32 md:px-[8vw] md:pb-28 md:pt-40">
        <p className="label-luxe mb-8">Gallery</p>
        <h2 className="max-w-3xl font-display text-5xl font-light leading-[1.05] text-ivory md:text-7xl">
          Midnight <span className="italic text-gold">Aurum.</span>
        </h2>
      </div>

      {/* full-viewport snap panels */}
      <div ref={panelsRef}>
        {SHOTS.map((shot) => (
          <div
            key={shot.index}
            data-gallery-panel
            className="relative h-svh overflow-hidden"
          >
            <LuxeImage
              src={shot.src}
              alt={shot.alt}
              caption={shot.caption}
              fallbackInset
              className="absolute inset-0 h-full w-full"
            />
            {/* legibility veil for the caption */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/50 to-transparent"
            />
            <div className="absolute bottom-[9vh] left-6 md:left-[8vw]">
              <p className="label-luxe">
                {shot.index}
                <span className="mx-3 text-gold/40">·</span>
                {shot.title}
              </p>
              <p className="mt-4 font-display text-2xl font-light italic text-ivory/85 md:text-3xl">
                {shot.line}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
