# VANTERA — The Art of Assembly

A single-car luxury brand site for the **VANTERA ONE**, a fictional boutique hypercar.
The page is one continuous cinematic scroll: a headlight glint opens onto the wordmark,
then the scroll bar itself becomes the play head — as you scroll, the car is assembled
piece by piece (monocoque, drivetrain, body, wheels, paint) on a pinned canvas, each
stage revealing a specification. Built as a production-grade portfolio piece in the
spirit of Apple, Lamborghini and Porsche product pages.

## Features

- **Canvas frame-sequence scroll-scrub** — an AI-generated assembly film, pre-extracted
  into 151 WebP stills and drawn onto a full-viewport `<canvas>` pinned for ~600vh.
  Frames load progressively: poster + sparse keyframes up front, the full set only as
  the section approaches, prioritised around the current scrub position.
- **GSAP ScrollTrigger + Lenis** — weighted (numeric) scrubbing, pinning, snap and a
  heavy, smoothed scroll feel; every scroll surface rides the same pipeline.
- **Spec overlays** — HTML numerals synced to scrub progress via direct DOM writes
  (zero React re-renders per tick).
- **Luxury design system** — deep black `#0A0A0A`, muted gold `#B39A68`, ivory type;
  Cormorant Garamond display serif over Space Grotesk; hairline rules, huge thin
  tabular numerals, long expo easings — slow, heavy, precise.
- **Design / Performance / Gallery / Booking** — parallax macro photography, count-up
  stats, a pinned horizontal data band, snap-scrolled full-viewport gallery with Ken
  Burns drift, and a concierge-style "Book a Private Viewing" form.
- **Accessible & responsive** — full `prefers-reduced-motion` fallbacks (static frames,
  no pins), skip link, landmarks, labelled form, keyboard focus styles, mobile layout.

## Tech stack

| Layer     | Choice                                   |
| --------- | ---------------------------------------- |
| Framework | Vite 8 + React 19 + TypeScript           |
| Animation | GSAP 3 (ScrollTrigger) + Lenis           |
| Styling   | Tailwind CSS v4 + custom design tokens   |
| Assets    | AI-generated film → `ffmpeg` → WebP frames |

## Run it

```bash
npm i
npm run dev
```

Production build:

```bash
npm run build   # tsc -b && vite build → dist/
npm run preview # serve the build locally
```

## Disclaimer

VANTERA is a fictional brand created purely as a design and engineering portfolio
piece. The VANTERA ONE does not exist, no vehicles are offered for sale, and all
specifications are imaginary. All imagery and film were AI-generated for this project.
