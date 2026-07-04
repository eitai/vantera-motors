import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  type CSSProperties,
  type ReactNode,
} from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

gsap.registerPlugin(ScrollTrigger)

export interface FrameSequenceScrubProps {
  /**
   * Ordered frame URLs (first = rest pose, last = fully assembled).
   * Swap the placeholder data-URLs for real extracted frames here —
   * e.g. `/seq/assembly/frame_0001.webp … frame_0180.webp`.
   */
  frameUrls: string[]
  /** Total scroll length of the pinned stage, in vh. Default 600. */
  heightVh?: number
  /**
   * Numeric scrub weight passed to ScrollTrigger (never `true` — a numeric
   * value gives the heavy, eased glide instead of twitchy 1:1 tracking).
   */
  scrub?: number
  /** HTML overlays rendered above the canvas inside the pinned stage. */
  children?: ReactNode
  /** Fires on every scrub update with progress [0..1] and the frame index. */
  onProgress?: (progress: number, frameIndex: number) => void
  /** Frame shown statically under prefers-reduced-motion (default: last). */
  reducedMotionFrame?: number
  className?: string
}

const MAX_CONCURRENT_LOADS = 6
const KEYFRAME_STRIDE = 8

/**
 * Scroll-scrubbed image sequence on a full-viewport canvas.
 *
 * The scroll bar IS the play head: one pinned stage, ScrollTrigger maps
 * scroll progress -> frame index, frames are pre-extracted stills drawn
 * onto <canvas> (never a playing <video>). Frames preload as Image objects
 * with priority given to the frames nearest the current scrub position,
 * so scrubbing is usable long before the full set has arrived.
 */
export default function FrameSequenceScrub({
  frameUrls,
  heightVh = 600,
  scrub = 1.2,
  children,
  onProgress,
  reducedMotionFrame,
  className,
}: FrameSequenceScrubProps) {
  const reducedMotion = usePrefersReducedMotion()

  const rootRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // --- frame store (refs: none of this should re-render React) ----------
  const imagesRef = useRef<(HTMLImageElement | undefined)[]>([])
  const loadedRef = useRef<boolean[]>([])
  const startedRef = useRef<boolean[]>([])
  const queueRef = useRef<number[]>([])
  const activeLoadsRef = useRef(0)
  const currentIndexRef = useRef(0)
  const lastDrawnRef = useRef(-1)

  const onProgressRef = useRef(onProgress)
  onProgressRef.current = onProgress

  const frameCount = frameUrls.length
  const staticIndex = Math.min(
    frameCount - 1,
    Math.max(0, reducedMotionFrame ?? frameCount - 1),
  )

  // ---------------------------------------------------------------------
  // Drawing — cover-fit, devicePixelRatio-aware, redraw only when the
  // resolved frame actually changes.
  // ---------------------------------------------------------------------

  const drawFrame = useCallback((index: number, force = false) => {
    const canvas = canvasRef.current
    if (!canvas || frameUrls.length === 0) return

    // Nearest loaded frame to the requested one (search outward) so early
    // scrubbing shows the closest available still instead of black.
    let best = -1
    const n = frameUrls.length
    for (let d = 0; d < n; d++) {
      if (index - d >= 0 && loadedRef.current[index - d]) {
        best = index - d
        break
      }
      if (index + d < n && loadedRef.current[index + d]) {
        best = index + d
        break
      }
    }
    if (best === -1) return
    if (!force && best === lastDrawnRef.current) return

    const img = imagesRef.current[best]
    if (!img) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const cssW = canvas.clientWidth
    const cssH = canvas.clientHeight
    if (cssW === 0 || cssH === 0) return

    const pxW = Math.round(cssW * dpr)
    const pxH = Math.round(cssH * dpr)
    if (canvas.width !== pxW || canvas.height !== pxH) {
      canvas.width = pxW
      canvas.height = pxH
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    // Cover-fit math: scale up to fill, center the overflow.
    const iw = img.naturalWidth
    const ih = img.naturalHeight
    if (iw === 0 || ih === 0) return
    const scale = Math.max(cssW / iw, cssH / ih)
    const dw = iw * scale
    const dh = ih * scale
    const dx = (cssW - dw) / 2
    const dy = (cssH - dh) / 2

    ctx.fillStyle = '#0a0a0a'
    ctx.fillRect(0, 0, cssW, cssH)
    ctx.drawImage(img, dx, dy, dw, dh)

    lastDrawnRef.current = best
  }, [frameUrls])

  // ---------------------------------------------------------------------
  // Loading — chunked priority queue, nearest-to-playhead first.
  // ---------------------------------------------------------------------

  const pumpQueue = useCallback(() => {
    while (
      activeLoadsRef.current < MAX_CONCURRENT_LOADS &&
      queueRef.current.length > 0
    ) {
      const index = queueRef.current.shift()!
      if (startedRef.current[index]) continue
      startedRef.current[index] = true
      activeLoadsRef.current++

      const img = new Image()
      img.decoding = 'async'
      const done = () => {
        activeLoadsRef.current--
        pumpQueue()
      }
      img.onload = () => {
        loadedRef.current[index] = true
        imagesRef.current[index] = img
        // If this frame is at (or nearer to) the playhead than what is on
        // screen, repaint immediately.
        const cur = currentIndexRef.current
        if (
          lastDrawnRef.current === -1 ||
          Math.abs(index - cur) < Math.abs(lastDrawnRef.current - cur)
        ) {
          drawFrame(cur)
        }
        done()
      }
      img.onerror = done
      img.src = frameUrls[index]
    }
  }, [frameUrls, drawFrame])

  /** Reorder the pending queue so frames around `center` load first. */
  const prioritize = useCallback(
    (center: number) => {
      const pending: number[] = []
      for (let i = 0; i < frameUrls.length; i++) {
        if (!startedRef.current[i]) pending.push(i)
      }
      // Ahead-of-playhead frames win ties (scrolling forward is the norm).
      pending.sort((a, b) => {
        const da = a >= center ? (a - center) * 0.75 : center - a
        const db = b >= center ? (b - center) * 0.75 : center - b
        return da - db
      })
      queueRef.current = pending
      pumpQueue()
    },
    [frameUrls, pumpQueue],
  )

  // Kick off loading: poster frame first, then sparse keyframes so any
  // scrub position resolves quickly. The full in-between fill is deferred
  // until the section approaches the viewport — sitting at the hero costs
  // only the poster + keyframes, not the whole sequence. (Scrubbing also
  // pulls frames via `prioritize`, so the fill is belt-and-braces.)
  useEffect(() => {
    imagesRef.current = new Array(frameCount)
    loadedRef.current = new Array(frameCount).fill(false)
    startedRef.current = new Array(frameCount).fill(false)
    queueRef.current = []
    activeLoadsRef.current = 0
    lastDrawnRef.current = -1

    if (frameCount === 0) return

    const seed = reducedMotion ? staticIndex : 0
    const order: number[] = [seed]
    if (!reducedMotion) {
      // Static fallback only ever draws one frame — skip the keyframes.
      for (let i = 0; i < frameCount; i += KEYFRAME_STRIDE) {
        if (i !== seed) order.push(i)
      }
      if (!order.includes(frameCount - 1)) order.push(frameCount - 1)
    }
    queueRef.current = order
    pumpQueue()

    const root = rootRef.current
    if (reducedMotion || !root || typeof IntersectionObserver === 'undefined')
      return

    const backfill = () => {
      const queued = new Set(queueRef.current)
      for (let i = 0; i < frameCount; i++) {
        if (!startedRef.current[i] && !queued.has(i)) queueRef.current.push(i)
      }
      pumpQueue()
    }

    // Bottom margin -20%: fires once the section top rises into the lower
    // fifth of the viewport (i.e. real scroll intent), not while the hero
    // merely sits with the section touching the fold.
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect()
          backfill()
        }
      },
      { rootMargin: '0px 0px -20% 0px' },
    )
    io.observe(root)
    return () => io.disconnect()
  }, [frameUrls, frameCount, reducedMotion, staticIndex, pumpQueue])

  // Repaint on resize (canvas backing store depends on viewport + dpr).
  useEffect(() => {
    const onResize = () => drawFrame(currentIndexRef.current, true)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [drawFrame])

  // ---------------------------------------------------------------------
  // Scroll wiring — ONE pinned stage, a proxy tween scrubbed by scroll.
  // ---------------------------------------------------------------------

  useLayoutEffect(() => {
    if (reducedMotion || frameCount === 0) {
      // Static fallback: a single viewport showing one frame, no pin.
      currentIndexRef.current = staticIndex
      drawFrame(staticIndex, true)
      onProgressRef.current?.(1, staticIndex)
      return
    }

    const root = rootRef.current
    const stage = stageRef.current
    if (!root || !stage) return

    const state = { p: 0 }

    const ctx = gsap.context(() => {
      gsap.to(state, {
        p: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: 'bottom bottom',
          pin: stage,
          // The tall wrapper already provides the scroll distance.
          pinSpacing: false,
          scrub, // numeric -> weighted, eased scrubbing
          invalidateOnRefresh: true,
        },
        onUpdate: () => {
          const p = state.p
          const index = Math.min(
            frameCount - 1,
            Math.max(0, Math.round(p * (frameCount - 1))),
          )
          if (index !== currentIndexRef.current) {
            currentIndexRef.current = index
            prioritize(index)
            drawFrame(index)
          }
          onProgressRef.current?.(p, index)
        },
      })
    }, root)

    // First paint + measurement once mounted.
    drawFrame(0, true)
    onProgressRef.current?.(0, 0)
    ScrollTrigger.refresh()

    return () => ctx.revert()
  }, [reducedMotion, frameCount, scrub, staticIndex, drawFrame, prioritize])

  // ---------------------------------------------------------------------

  const rootStyle: CSSProperties = reducedMotion
    ? {}
    : { height: `${heightVh}vh` }

  return (
    <div
      ref={rootRef}
      className={`relative ${className ?? ''}`}
      style={rootStyle}
    >
      <div
        ref={stageRef}
        className="relative h-svh w-full overflow-hidden bg-bg"
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full"
          aria-hidden="true"
        />
        {/* HTML overlays above the canvas */}
        <div className="pointer-events-none absolute inset-0">{children}</div>
      </div>
    </div>
  )
}
