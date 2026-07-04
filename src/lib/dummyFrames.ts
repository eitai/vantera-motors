/**
 * Development-only placeholder frames for the assembly scrub sequence.
 *
 * Generates ~90 dark frames on an offscreen canvas and returns them as
 * data-URLs, so the FrameSequenceScrub engine is fully testable before the
 * real extracted video frames exist. Each frame shows:
 *   - a large thin frame counter,
 *   - a stylised car assembling piece by piece (chassis -> wheels ->
 *     body -> canopy -> wing -> gold paint sweep),
 *   - a progress tick strip.
 *
 * Swapping in real frames later does NOT touch this file — just flip
 * `useDummyFrames` in AssemblySection and point it at real URLs.
 */

export interface DummyFrameOptions {
  count?: number
  width?: number
  height?: number
}

const IVORY = '243, 239, 230'
const GOLD = '179, 154, 104'

/** Cubic ease-in-out — slow, heavy, no bounce. */
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

/** Progress of `t` within a [start, end] window, eased, clamped 0..1. */
function windowT(t: number, start: number, end: number): number {
  if (t <= start) return 0
  if (t >= end) return 1
  return easeInOutCubic((t - start) / (end - start))
}

function drawWheel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  alpha: number,
  roll: number,
) {
  ctx.save()
  ctx.translate(x, y)
  ctx.strokeStyle = `rgba(${IVORY}, ${0.55 * alpha})`
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(0, 0, r, 0, Math.PI * 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(0, 0, r * 0.55, 0, Math.PI * 2)
  ctx.stroke()
  // spokes rotate while the wheel "rolls" in
  ctx.rotate(roll * Math.PI * 4)
  ctx.lineWidth = 1.5
  for (let s = 0; s < 5; s++) {
    ctx.rotate((Math.PI * 2) / 5)
    ctx.beginPath()
    ctx.moveTo(0, -r * 0.15)
    ctx.lineTo(0, -r * 0.52)
    ctx.stroke()
  }
  ctx.restore()
}

function bodyPath(ctx: CanvasRenderingContext2D) {
  ctx.beginPath()
  ctx.moveTo(330, 470)
  ctx.quadraticCurveTo(345, 428, 425, 412)
  ctx.quadraticCurveTo(520, 382, 605, 372)
  ctx.quadraticCurveTo(665, 332, 762, 332)
  ctx.quadraticCurveTo(852, 332, 892, 368)
  ctx.quadraticCurveTo(948, 382, 958, 422)
  ctx.quadraticCurveTo(964, 454, 938, 470)
  ctx.closePath()
}

function drawFrameToCanvas(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  i: number,
  count: number,
) {
  const t = count <= 1 ? 1 : i / (count - 1)

  // --- background: deep black with a faint centre lift ------------------
  ctx.fillStyle = '#0a0a0a'
  ctx.fillRect(0, 0, w, h)
  const glow = ctx.createRadialGradient(
    w / 2,
    h * 0.62,
    60,
    w / 2,
    h * 0.62,
    w * 0.55,
  )
  glow.addColorStop(0, `rgba(${IVORY}, 0.045)`)
  glow.addColorStop(1, 'rgba(0, 0, 0, 0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, w, h)

  // studio floor line
  ctx.strokeStyle = `rgba(${IVORY}, 0.10)`
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(w * 0.14, 522)
  ctx.lineTo(w * 0.86, 522)
  ctx.stroke()

  // --- piece 1: chassis rises from below --------------------------------
  const chassisT = windowT(t, 0.02, 0.2)
  if (chassisT > 0) {
    ctx.save()
    ctx.translate(0, (1 - chassisT) * 220)
    ctx.globalAlpha = chassisT
    ctx.strokeStyle = `rgba(${IVORY}, 0.5)`
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(340, 470)
    ctx.lineTo(940, 470)
    ctx.stroke()
    ctx.lineWidth = 1
    for (const x of [430, 560, 690, 820]) {
      ctx.beginPath()
      ctx.moveTo(x, 470)
      ctx.lineTo(x, 448)
      ctx.stroke()
    }
    ctx.restore()
  }

  // --- pieces 2 + 3: wheels roll in from the sides -----------------------
  const fwT = windowT(t, 0.16, 0.4)
  if (fwT > 0) drawWheel(ctx, 430 - (1 - fwT) * 520, 470, 52, fwT, fwT)
  const rwT = windowT(t, 0.22, 0.46)
  if (rwT > 0) drawWheel(ctx, 862 + (1 - rwT) * 520, 470, 52, rwT, -rwT)

  // --- piece 4: body drops from above ------------------------------------
  const bodyT = windowT(t, 0.4, 0.66)
  if (bodyT > 0) {
    ctx.save()
    ctx.translate(0, -(1 - bodyT) * 300)
    ctx.globalAlpha = bodyT
    bodyPath(ctx)
    ctx.strokeStyle = `rgba(${IVORY}, 0.55)`
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.restore()
  }

  // --- piece 5: canopy line ----------------------------------------------
  const canopyT = windowT(t, 0.58, 0.76)
  if (canopyT > 0) {
    ctx.save()
    ctx.translate(0, -(1 - canopyT) * 140)
    ctx.globalAlpha = canopyT
    ctx.strokeStyle = `rgba(${IVORY}, 0.4)`
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(640, 375)
    ctx.quadraticCurveTo(690, 344, 764, 344)
    ctx.quadraticCurveTo(830, 344, 862, 372)
    ctx.stroke()
    ctx.restore()
  }

  // --- piece 6: rear wing slides in --------------------------------------
  const wingT = windowT(t, 0.68, 0.84)
  if (wingT > 0) {
    ctx.save()
    ctx.translate((1 - wingT) * 260, -(1 - wingT) * 160)
    ctx.globalAlpha = wingT
    ctx.strokeStyle = `rgba(${IVORY}, 0.5)`
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(900, 330)
    ctx.lineTo(972, 322)
    ctx.stroke()
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(936, 326)
    ctx.lineTo(930, 352)
    ctx.stroke()
    ctx.restore()
  }

  // --- piece 7: gold paint sweep ------------------------------------------
  const paintT = windowT(t, 0.82, 0.98)
  if (paintT > 0) {
    ctx.save()
    ctx.beginPath()
    ctx.rect(320, 300, (970 - 320) * paintT, 200)
    ctx.clip()
    bodyPath(ctx)
    ctx.fillStyle = `rgba(${GOLD}, 0.16)`
    ctx.fill()
    ctx.strokeStyle = `rgba(${GOLD}, 0.75)`
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.restore()
  }

  // --- HUD: large thin counter -------------------------------------------
  ctx.fillStyle = `rgba(${IVORY}, 0.26)`
  ctx.font = '300 128px "Space Grotesk", "Segoe UI", sans-serif'
  ctx.textAlign = 'right'
  ctx.textBaseline = 'alphabetic'
  ctx.fillText(String(i + 1).padStart(3, '0'), w - 56, h - 52)
  ctx.fillStyle = `rgba(${IVORY}, 0.35)`
  ctx.font = '300 22px "Space Grotesk", "Segoe UI", sans-serif'
  ctx.fillText(`/ ${String(count).padStart(3, '0')}`, w - 56, h - 26)

  // small identity label
  ctx.textAlign = 'left'
  ctx.fillStyle = `rgba(${GOLD}, 0.6)`
  ctx.font = '400 15px "Space Grotesk", "Segoe UI", sans-serif'
  ctx.fillText('V A N T E R A   O N E', 56, 64)
  ctx.fillStyle = `rgba(${IVORY}, 0.28)`
  ctx.fillText('P L A C E H O L D E R   S E Q U E N C E', 56, 92)

  // --- progress tick strip -------------------------------------------------
  const ticks = 60
  for (let k = 0; k < ticks; k++) {
    const on = k / (ticks - 1) <= t
    ctx.fillStyle = on ? `rgba(${GOLD}, 0.8)` : `rgba(${IVORY}, 0.12)`
    ctx.fillRect(56 + k * ((w - 112) / ticks), h - 40, 2, on ? 14 : 8)
  }
}

/**
 * Generate `count` placeholder frames as data-URLs. Async and chunked so a
 * ~90-frame batch never locks the main thread on load.
 */
export async function generateDummyFrames(
  options: DummyFrameOptions = {},
): Promise<string[]> {
  const { count = 90, width = 1280, height = 720 } = options

  // Let the display fonts land first so counters render in Space Grotesk.
  try {
    await document.fonts.ready
  } catch {
    /* fonts API unavailable — system fallback is fine for placeholders */
  }

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return []

  const urls: string[] = []
  for (let i = 0; i < count; i++) {
    drawFrameToCanvas(ctx, width, height, i, count)
    urls.push(canvas.toDataURL('image/jpeg', 0.8))
    // yield to the event loop every few frames
    if (i % 8 === 7) {
      await new Promise((resolve) => setTimeout(resolve, 0))
    }
  }
  return urls
}
