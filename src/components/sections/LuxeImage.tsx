import { useCallback, useState } from 'react'

/**
 * Image slot that looks intentional in every state.
 *
 * The real photography lands later at fixed paths (/img/design/*.webp,
 * /img/gallery/*.webp). Until a file exists — or if it ever 404s — the slot
 * renders an elegant placeholder: near-black panel, gold hairline, a quiet
 * wordmark and a small gold caption. When the file appears, the photograph
 * fades in over the placeholder with a long, heavy ease.
 *
 * Hooks for motion (consumed by parent sections via GSAP):
 *   [data-luxe-frame]  — the clipped frame
 *   [data-luxe-inner]  — the moving surface (parallax / Ken Burns target)
 */

type LoadState = 'loading' | 'loaded' | 'error'

export interface LuxeImageProps {
  src: string
  alt: string
  /** Small label shown while the photograph is missing / loading. */
  caption: string
  /** Frame classes (size, aspect, cols). The frame clips its contents. */
  className?: string
  /**
   * Oversize the moving surface vertically (~±9%) so a scrubbed parallax
   * translate never exposes the frame edges. Off for scale-only motion.
   */
  oversize?: boolean
  /** Draw the fallback hairline inset (full-bleed slots) instead of on the frame edge. */
  fallbackInset?: boolean
}

export default function LuxeImage({
  src,
  alt,
  caption,
  className = '',
  oversize = false,
  fallbackInset = false,
}: LuxeImageProps) {
  const [state, setState] = useState<LoadState>('loading')

  // Cached images may be complete before onLoad can fire.
  const imgRef = useCallback((el: HTMLImageElement | null) => {
    if (el && el.complete && el.naturalWidth > 0) setState('loaded')
  }, [])

  const loaded = state === 'loaded'
  const edge = fallbackInset
    ? ''
    : loaded
      ? 'border hairline'
      : 'border border-gold/25'

  return (
    <figure
      data-luxe-frame
      className={`relative overflow-hidden bg-[#111111] ${edge} ${className}`}
    >
      {/* moving surface — parallax / Ken Burns transforms land here */}
      <div
        data-luxe-inner
        className="absolute will-change-transform"
        style={
          oversize
            ? { left: 0, right: 0, top: '-9%', bottom: '-9%' }
            : { inset: 0 }
        }
      >
        {state !== 'error' && (
          <img
            ref={imgRef}
            src={src}
            alt={alt}
            loading="lazy"
            decoding="async"
            onLoad={() => setState('loaded')}
            onError={() => setState('error')}
            className={`h-full w-full object-cover transition-opacity duration-[1600ms] ${
              loaded ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ transitionTimingFunction: 'var(--ease-luxe)' }}
          />
        )}
      </div>

      {/* placeholder — visible until the photograph arrives */}
      {!loaded && (
        <div className="pointer-events-none absolute inset-0">
          {fallbackInset && (
            <div className="absolute inset-4 border border-gold/25 md:inset-6" />
          )}
          <span
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-display text-sm font-light tracking-[0.55em] text-ivory/15"
          >
            VANTERA
          </span>
          <figcaption
            className={`label-luxe absolute !text-gold/80 ${
              fallbackInset ? 'bottom-10 left-10 md:bottom-12 md:left-12' : 'bottom-5 left-5'
            }`}
          >
            {caption}
          </figcaption>
        </div>
      )}
    </figure>
  )
}
