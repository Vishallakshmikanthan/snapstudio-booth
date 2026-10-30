// ─── SNAPSTUDIO Landing Page: Cinematic dark hero, 8-mode strip showcase, curated gallery, craft section ───
import { FILTERS, FRAMES, LAYOUTS, MODES, type Mode, type ModeId } from '@/lib/photobooth/data'
import type { StepId } from '@/lib/photobooth/context'

interface Props {
  sectionView?: 'all' | 'gallery' | 'about'
  onStartCapture: (mode?: Mode) => void
  onExploreModes: () => void
  onNavigateSection?: (step: StepId) => void
  onTryPreset: (preset: {
    modeId: ModeId
    frameId: string
    filterId: string
    caption: string
    withSamples?: boolean
  }) => void
}

const GALLERY_CREATIONS: {
  num: string
  title: string
  subtitle: string
  modeId: ModeId
  frameId: string
  filterId: string
  image: string
  caption: string
  note: string
}[] = [
  {
    num: '01',
    title: 'Seoul Four-Cut',
    subtitle: 'Classic Booth · Photoism White · Soft Booth',
    modeId: 'classic',
    frameId: 'cloud',
    filterId: 'soft',
    image: '/strips/classic-strip.png',
    caption: 'keep yourself alive',
    note: 'good friends, better memories',
  },
  {
    num: '02',
    title: 'Crimson Encore',
    subtitle: 'Music & Concert · 35mm Portra 400 · Crimson Stage',
    modeId: 'music',
    frameId: 'neonmid',
    filterId: 'retro',
    image: '/strips/concert-cine-strip.png',
    caption: 'front row forever',
    note: 'after the encore ✦',
  },
  {
    num: '03',
    title: 'Zero Thoughts Club',
    subtitle: 'Fun & Meme · 2×2 Collage · Pop Vivid',
    modeId: 'fun',
    frameId: 'butter',
    filterId: 'vivid',
    image: '/strips/fun-meme-strip.png',
    caption: 'SILLY PEOPLE HAPPY LIVES',
    note: 'main character energy!',
  },
  {
    num: '04',
    title: 'Summer of ’74',
    subtitle: 'Vintage Camera · 1974 Safety Film · Sepia Archive',
    modeId: 'vintage',
    frameId: 'tapekraft',
    filterId: 'sepia',
    image: '/strips/vintage-strip.png',
    caption: 'JUL 1974',
    note: 'faded but golden',
  },
  {
    num: '05',
    title: 'Arcade Sweetheart',
    subtitle: 'Cute & Playful · Pixel Kawaii · Pastel Dream',
    modeId: 'cute',
    frameId: 'blush',
    filterId: 'dream',
    image: '/strips/cute-pixel-strip.png',
    caption: 'SMILE!',
    note: 'pixel hearts & peace signs',
  },
  {
    num: '06',
    title: 'Monochrome Study',
    subtitle: 'Editorial · Magazine Issue · Ilford B&W',
    modeId: 'editorial',
    frameId: 'editorial',
    filterId: 'noir',
    image: '/strips/editorial-strip.png',
    caption: 'ISSUE №01 — PORTRAIT STUDY',
    note: 'quiet gallery moments',
  },
]

const SAMPLE_AVATARS = [
  '/samples/duo-1.jpg',
  '/samples/solo-1.jpg',
  '/samples/vintage-1.jpg',
  '/samples/solo-2.jpg',
]

const STRIP_SHOWCASE_SHOTS = [
  '/samples/duo-1.jpg',
  '/samples/duo-2.jpg',
  '/samples/duo-3.jpg',
  '/samples/duo-4.jpg',
]

export default function LandingStep({
  sectionView = 'all',
  onStartCapture,
  onExploreModes,
  onNavigateSection,
  onTryPreset,
}: Props) {
  const showHeroAndModes = sectionView === 'all'
  const showGallery = sectionView === 'all' || sectionView === 'gallery'
  const showAbout = sectionView === 'all' || sectionView === 'about'

  return (
    <div className="relative w-full max-w-full overflow-x-hidden bg-[#111114] text-[#f6f3ec]">
      {/* Ambient studio radial lighting */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/4 h-[340px] w-[340px] rounded-full opacity-25 blur-[110px] sm:h-[540px] sm:w-[540px] sm:blur-[130px]"
        style={{ background: 'radial-gradient(circle, #e5a93c 0%, transparent 70%)' }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-20 h-[360px] w-[360px] rounded-full opacity-20 blur-[120px] sm:h-[620px] sm:w-[620px] sm:blur-[150px]"
        style={{ background: 'radial-gradient(circle, #d97757 0%, transparent 72%)' }}
      />

      {/* ── 01. IMMERSIVE HERO SECTION ── */}
      {showHeroAndModes && (
        <section className="relative mx-auto w-full max-w-7xl px-4 pb-16 pt-6 sm:px-6 sm:pb-20 sm:pt-10 lg:pb-28 lg:pt-14">
          {/* Hand-drawn floating star accent near top center */}
          <svg
            aria-hidden="true"
            viewBox="0 0 48 48"
            className="pointer-events-none absolute right-[44%] top-4 hidden h-8 w-8 text-[#f6f3ec]/80 lg:block"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M24 4 L29 18 L44 18 L32 27 L36 42 L24 33 L12 42 L16 27 L4 18 L19 18 Z" />
          </svg>

          <div className="grid min-w-0 items-center gap-10 lg:grid-cols-[1.02fr_1.18fr] lg:gap-10">
            {/* Left Hero Copy */}
            <div className="anim-fade-up relative z-10 min-w-0 max-w-xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] py-1 pl-1.5 pr-3.5 backdrop-blur-md">
                <img src="/logo-camera-transparent.png" alt="SnapStudio" className="h-6 w-auto object-contain" />
                <span className="text-[11px] font-bold tracking-widest text-[#faf8f5]">
                  SnapStudio<span className="text-[#e5a93c]">✦</span>
                </span>
                <span className="hidden text-[10px] text-[#9c988f] sm:inline">
                  · Capture · Create · Keep Forever
                </span>
              </div>

              <div className="inline-flex flex-wrap items-center gap-2.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#c7c2b8] sm:gap-3 sm:text-[11px] sm:tracking-[0.26em]">
                <span>Photography for a brighter tomorrow</span>
                <span className="hidden h-px w-10 bg-[#c7c2b8]/40 sm:inline-block" />
              </div>

              <h1 className="mt-4 text-4xl font-extrabold leading-[1.02] tracking-[-0.03em] text-[#faf8f5] sm:mt-6 sm:text-6xl lg:text-[4.65rem]">
                Your
                <br />
                Moments,
                <br />
                <span className="inline-flex flex-wrap items-baseline gap-x-2.5 sm:gap-x-3">
                  <span>Any</span>
                  <span
                    className="font-normal italic tracking-normal text-[#f3dfb6]"
                    style={{ fontFamily: 'var(--font-serif)' }}
                  >
                    Vibe.
                  </span>
                </span>
              </h1>

              <p className="mt-4 max-w-md text-sm leading-relaxed text-[#a8a49c] sm:mt-6 sm:text-lg">
                A virtual photobooth for every mood. Capture, customize, and keep your best moments — with eight signature photobooth and analog film aesthetics.
              </p>

              {/* Primary & Secondary CTAs */}
              <div className="mt-7 flex flex-wrap items-center gap-3 sm:mt-9 sm:gap-4">
                <button
                  onClick={() => onStartCapture()}
                  className="group inline-flex flex-1 items-center justify-center gap-2.5 rounded-full bg-[#faf8f5] px-6 py-3.5 text-sm font-bold text-[#141416] shadow-[0_16px_40px_-12px_rgba(250,248,245,0.35)] transition duration-200 hover:-translate-y-0.5 hover:bg-white sm:flex-initial sm:px-7 sm:py-4"
                >
                  <span>Start Photobooth</span>
                  <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                </button>

                <button
                  onClick={onExploreModes}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-white/25 bg-white/[0.04] px-6 py-3.5 text-sm font-semibold text-[#f6f3ec] backdrop-blur-sm transition duration-200 hover:border-white/45 hover:bg-white/[0.09] sm:flex-initial sm:px-7 sm:py-4"
                >
                  <span>See Modes</span>
                </button>

                <button
                  onClick={() =>
                    onTryPreset({
                      modeId: 'classic',
                      frameId: 'cloud',
                      filterId: 'soft',
                      caption: 'keep yourself alive',
                      withSamples: true,
                    })
                  }
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-[#e5a93c] transition hover:text-[#f7cf7d] sm:w-auto sm:justify-start"
                >
                  <span>✦ Instant Demo Strip</span>
                </button>
              </div>

              {/* Social Proof Avatars + Handwritten Note */}
              <div className="mt-8 flex flex-wrap items-center gap-3.5 pt-1 sm:mt-12 sm:gap-4">
                <div className="flex -space-x-3">
                  {SAMPLE_AVATARS.map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt="Creator portrait"
                      className="h-10 w-10 rounded-full border-2 border-[#141416] object-cover shadow-md grayscale transition duration-300 hover:grayscale-0 sm:h-11 sm:w-11"
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#e5a93c]">✦</span>
                  <p
                    className="text-lg leading-snug text-[#d8d3c8] sm:text-2xl"
                    style={{ fontFamily: 'var(--font-hand)' }}
                  >
                    Join thousands creating memories
                    <br />
                    with SnapStudio
                  </p>
                </div>
              </div>
            </div>

            {/* Right Hero Layered Photo Strips Composition */}
            <div className="anim-pop relative mx-auto min-w-0 w-full max-w-[420px] sm:max-w-[600px] lg:max-w-none">
              <div className="relative mx-auto flex min-h-[390px] w-full items-center justify-center pb-8 pt-4 sm:min-h-[540px] sm:pb-0 sm:pt-0">
                {/* Peeking Optical CD Disc on Left (Tablet/Desktop) */}
                <div
                  aria-hidden="true"
                  className="absolute left-2 top-1/2 z-0 hidden h-36 w-36 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 shadow-2xl sm:flex"
                  style={{
                    background:
                      'conic-gradient(from 45deg, #d4d4d8, #71717a, #f4f4f5, #a1a1aa, #e4e4e7, #52525b, #d4d4d8)',
                  }}
                >
                  <div className="h-11 w-11 rounded-full border-4 border-white/60 bg-[#141416]" />
                </div>

                {/* Strip 1: Tilted Left Classic B&W 4-Cut Strip */}
                <div
                  onClick={() =>
                    onTryPreset({
                      modeId: 'classic',
                      frameId: 'cloud',
                      filterId: 'noir',
                      caption: 'good friends, better memories',
                      withSamples: true,
                    })
                  }
                  title="Click to remix Classic Booth strip"
                  className="group relative z-10 w-[142px] -translate-x-2 -rotate-[8deg] cursor-pointer rounded-md bg-[#faf8f4] p-2 text-[#141416] shadow-[0_25px_60px_rgba(0,0,0,0.75)] transition duration-300 hover:z-30 hover:-translate-y-2 hover:-rotate-[5deg] sm:w-[215px] sm:-translate-x-20 sm:-rotate-[10deg] sm:p-2.5"
                >
                  {/* Masking tape at top */}
                  <div className="absolute -top-2.5 left-1/2 h-5 w-14 -translate-x-1/2 -rotate-3 bg-[#f3ead2]/85 shadow-sm sm:-top-3 sm:h-6 sm:w-20" />
                  <div className="space-y-1 sm:space-y-1.5">
                    {STRIP_SHOWCASE_SHOTS.map((src, idx) => (
                      <div key={idx} className="overflow-hidden rounded-[2px] bg-zinc-200">
                        <img
                          src={src}
                          alt={`Classic cut ${idx + 1}`}
                          className="aspect-[4/3] w-full object-cover grayscale contrast-125 transition duration-300 group-hover:scale-105"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 flex items-center justify-between px-0.5 pt-0.5 sm:mt-2.5 sm:pt-1">
                    <span className="font-mono text-[7px] font-bold tracking-widest text-zinc-500 sm:text-[8px]">
                      SnapStudio 04
                    </span>
                    <div className="flex h-3 items-center gap-[1px] sm:h-3.5 sm:gap-[1.5px]">
                      {[2, 1, 2, 1, 2, 1, 2, 1, 2].map((w, i) => (
                        <span key={i} className="h-full bg-zinc-900" style={{ width: `${w}px` }} />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Hand-drawn Red Heart overlapping between Strip 1 and Strip 2 */}
                <svg
                  aria-hidden="true"
                  viewBox="0 0 60 60"
                  className="pointer-events-none absolute left-1/2 top-1/2 z-30 h-9 w-9 -translate-x-1/2 -translate-y-1/2 rotate-[-12deg] text-[#ef4444] drop-shadow-md sm:left-[38%] sm:top-[54%] sm:h-12 sm:w-12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M30 48 C12 34 8 18 18 12 C25 8 30 16 30 20 C30 16 35 8 42 12 C52 18 48 34 30 48 Z" />
                </svg>

                {/* Strip 2: Center Tilted Dark Warm Cinematic Strip */}
                <div
                  onClick={() =>
                    onTryPreset({
                      modeId: 'cinematic',
                      frameId: 'filmnoir',
                      filterId: 'cine',
                      caption: 'scene 01 — take 04',
                      withSamples: true,
                    })
                  }
                  title="Click to remix Cinematic strip"
                  className="group relative z-20 w-[146px] translate-x-2 rotate-[6deg] cursor-pointer rounded-md border border-white/15 bg-[#121110] p-2 text-[#f5efe6] shadow-[0_30px_70px_rgba(0,0,0,0.85)] transition duration-300 hover:z-30 hover:-translate-y-2 hover:rotate-[3deg] sm:w-[220px] sm:translate-x-4 sm:p-2.5"
                >
                  {/* Sparkle Star at top-left of Strip 2 */}
                  <span className="absolute -left-2.5 -top-2.5 text-lg text-white drop-shadow sm:-left-3 sm:-top-3 sm:text-xl">
                    ☆
                  </span>
                  <div className="space-y-1 sm:space-y-1.5">
                    {[
                      '/samples/solo-1.jpg',
                      '/samples/solo-2.jpg',
                      '/samples/solo-3.jpg',
                      '/samples/solo-4.jpg',
                    ].map((src, idx) => (
                      <div key={idx} className="overflow-hidden rounded-[2px] bg-zinc-900">
                        <img
                          src={src}
                          alt={`Cinema cut ${idx + 1}`}
                          className="aspect-[4/3] w-full object-cover transition duration-300 group-hover:scale-105"
                          style={{ filter: 'sepia(0.22) saturate(1.25) contrast(1.12)' }}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 border-t border-white/10 pt-1.5 text-center sm:mt-2.5 sm:pt-2">
                    <p className="font-mono text-[8px] font-bold tracking-[0.2em] text-[#e5a93c] sm:text-[10px]">
                      SnapStudio
                    </p>
                    <p className="text-[8px] text-white/60 sm:text-[9px]">See Modes 100</p>
                  </div>
                </div>

                {/* Card 3: Right Tilted Portrait Polaroid + Note (Tablet/Desktop) */}
                <div
                  onClick={() =>
                    onTryPreset({
                      modeId: 'travel',
                      frameId: 'ocean',
                      filterId: 'golden',
                      caption: 'wish you were here ✈️',
                      withSamples: true,
                    })
                  }
                  title="Click to remix Travel Diary card"
                  className="group relative z-10 hidden w-[170px] translate-x-16 translate-y-8 rotate-[4deg] cursor-pointer rounded-md bg-[#f4f1ea] p-2.5 text-[#18181b] shadow-2xl transition duration-300 hover:z-30 hover:-translate-y-1 md:block lg:w-[190px]"
                >
                  <div className="absolute -left-6 top-1/2 h-5 w-16 -rotate-12 bg-[#e8dec5]/90 shadow-sm" />
                  <div className="mb-2 rounded bg-[#faf8f4] p-2 text-center">
                    <p
                      className="rotate-[-6deg] text-sm font-bold leading-tight text-zinc-700"
                      style={{ fontFamily: 'var(--font-hand)' }}
                    >
                      we keep the best moments ✦
                    </p>
                  </div>
                  <div className="relative overflow-hidden rounded-[3px]">
                    <img
                      src="/samples/vintage-2.jpg"
                      alt="Portrait card"
                      className="aspect-[3/4] w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                    <div className="absolute bottom-2 right-2 flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#facc15] bg-black/25 text-lg text-[#facc15] backdrop-blur-[1px]">
                      ☺
                    </div>
                  </div>
                </div>

                {/* Handwritten Caveat Annotation */}
                <div className="pointer-events-none absolute -bottom-1 left-2 z-30 sm:bottom-4 sm:left-4">
                  <p
                    className="-rotate-6 text-lg font-bold leading-tight text-[#f6f3ec] drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] sm:-rotate-12 sm:text-3xl"
                    style={{ fontFamily: 'var(--font-hand)' }}
                  >
                    Good Friends, Better Memories ✦
                  </p>
                </div>

                {/* Bottom Curved Doodle Arrow + Smiley */}
                <div className="pointer-events-none absolute -bottom-2 right-6 z-30 hidden items-center gap-3 sm:flex">
                  <svg width="70" height="32" viewBox="0 0 70 32" fill="none" className="text-white/60">
                    <path
                      d="M4 8 C24 28, 46 28, 64 12"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path d="M58 10 L65 11 L62 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/60 text-sm text-white/80">
                    ☺
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── 05. EIGHT SIGNATURE PHOTO MODES SHOWCASE (Warm Cream Surface) ── */}
      {showHeroAndModes && (
        <section id="modes-preview" className="w-full bg-[#f5f2eb] py-14 text-[#171614] sm:py-20">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
            <div className="flex flex-wrap items-end justify-between gap-4 sm:gap-6">
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#787267] sm:text-xs">
                  01 · Signature Strip Genres
                </p>
                <div className="mt-2 flex items-center gap-2.5 sm:gap-3">
                  <h2 className="text-2xl font-extrabold tracking-tight sm:text-5xl">
                    Choose Your Photo Mode
                  </h2>
                  <span className="text-2xl text-[#171614] sm:text-3xl">☆</span>
                </div>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#615c52] sm:text-base">
                  Different vibes for different stories. Click any strip to launch straight into the booth with that genre’s signature frame, filter, and layout.
                </p>
              </div>

              <button
                onClick={onExploreModes}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#171614]/25 bg-white px-5 py-3 text-xs font-bold uppercase tracking-wider text-[#171614] shadow-sm transition hover:-translate-y-0.5 hover:border-[#171614] hover:shadow-md sm:w-auto sm:px-6"
              >
                <span>Explore All 8 Modes</span>
                <span>→</span>
              </button>
            </div>

            {/* 8 Vertical Strip Examples Side-by-Side */}
            <div className="mt-8 grid grid-cols-2 gap-3.5 sm:mt-12 sm:grid-cols-4 sm:gap-4 lg:grid-cols-8">
              {MODES.map((m) => (
                <button
                  key={m.id}
                  onClick={() => onStartCapture(m)}
                  className="group flex min-w-0 flex-col items-center text-center transition duration-300 hover:-translate-y-2"
                >
                  <div className="relative aspect-[9/19] w-full overflow-hidden rounded-xl border border-black/10 bg-[#18181b] p-1.5 shadow-[0_18px_38px_-15px_rgba(0,0,0,0.28)] transition group-hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.42)]">
                    <img
                      src={m.previewImage}
                      alt={m.name}
                      className="h-full w-full rounded-lg object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
                    <span className="absolute bottom-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold text-zinc-900 opacity-0 shadow transition duration-300 group-hover:opacity-100">
                      Use {m.name} →
                    </span>
                  </div>
                  <h3 className="mt-2.5 text-xs font-bold tracking-tight text-[#171614] sm:mt-3.5 sm:text-sm">
                    {m.name}
                  </h3>
                  <p className="mt-0.5 text-[11px] text-[#787267]">{m.tagline}</p>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CURATED GALLERY OF CREATIONS (Route: /gallery or embedded on /) ── */}
      {showGallery && (
        <section
          id="gallery"
          className="w-full border-t border-white/10 bg-[#121215] py-14 text-[#f6f3ec] sm:py-24"
        >
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
            {sectionView === 'gallery' && onNavigateSection && (
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={() => onNavigateSection('landing')}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.04] px-4 py-1.5 text-xs font-semibold text-[#d4d0c8] transition hover:border-white/30 hover:text-white"
                >
                  <span>← Back to Home</span>
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={onExploreModes}
                    className="rounded-full border border-white/15 px-4 py-1.5 text-xs font-semibold text-white/80 hover:border-white/35 hover:text-white"
                  >
                    Browse 8 Modes
                  </button>
                  <button
                    onClick={() => onStartCapture()}
                    className="rounded-full bg-[#faf8f5] px-4 py-1.5 text-xs font-bold text-[#141416] hover:bg-white"
                  >
                    Open Camera →
                  </button>
                </div>
              </div>
            )}

            <div className="grid min-w-0 items-end gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:gap-8">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[#e5a93c] sm:text-xs">
                  02 · Curated Creations
                </p>
                <h2 className="mt-2.5 text-3xl font-bold tracking-tight sm:mt-3 sm:text-5xl">
                  Visual Stories{' '}
                  <span
                    className="font-normal italic text-[#f3dfb6]"
                    style={{ fontFamily: 'var(--font-serif)' }}
                  >
                    for Real Life
                  </span>
                </h2>
              </div>
              <div className="flex min-w-0 flex-col items-start justify-between gap-4 sm:flex-row sm:items-center lg:justify-end">
                <p className="max-w-sm text-sm leading-relaxed text-[#a8a49c]">
                  Every strip is a keepsake. Remix any curated recipe below with live camera shots or your own uploaded camera roll.
                </p>
                {/* Circular Stamp Seal */}
                <div className="relative hidden h-20 w-20 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.03] sm:flex">
                  <svg viewBox="0 0 100 100" className="anim-spin-slow h-16 w-16 text-[#d6d1c7]">
                    <path
                      id="circlePath"
                      d="M 50, 50 m -36, 0 a 36,36 0 1,1 72,0 a 36,36 0 1,1 -72,0"
                      fill="none"
                    />
                    <text fontSize="8.5" fontWeight="600" letterSpacing="2.4" fill="currentColor">
                      <textPath href="#circlePath">SnapStudio PHOTOGRAPHY • EST 2026 •</textPath>
                    </text>
                  </svg>
                  <span className="absolute text-xs text-[#e5a93c]">✦</span>
                </div>
              </div>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-5 sm:mt-14 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
              {GALLERY_CREATIONS.map((item) => {
                const modeObj = MODES.find((m) => m.id === item.modeId)!
                const frameObj = FRAMES.find((f) => f.id === item.frameId)
                const filterObj = FILTERS.find((f) => f.id === item.filterId)
                const layoutObj = LAYOUTS.find((l) => l.id === modeObj.defaultLayout)
                return (
                  <article
                    key={item.num}
                    className="group relative flex min-w-0 flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#18181d] p-4 transition duration-300 hover:-translate-y-1 hover:border-white/25 sm:p-5"
                  >
                    <div className="flex items-center justify-between gap-2 text-xs text-[#9c988f]">
                      <span className="font-mono font-semibold text-[#e5a93c]">{item.num}</span>
                      <span
                        className="truncate text-base text-[#dfd8c8] sm:text-lg"
                        style={{ fontFamily: 'var(--font-hand)' }}
                      >
                        {item.note}
                      </span>
                    </div>

                    <div className="relative mt-3 aspect-[4/4.4] w-full overflow-hidden rounded-2xl bg-[#101013]">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-1.5">
                        <span className="rounded-full bg-black/65 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-md">
                          {modeObj.icon} {modeObj.name}
                        </span>
                        {frameObj && (
                          <span className="rounded-full bg-black/65 px-2.5 py-1 text-[10px] font-medium text-white/85 backdrop-blur-md">
                            {frameObj.name}
                          </span>
                        )}
                        {filterObj && (
                          <span className="rounded-full bg-black/65 px-2.5 py-1 text-[10px] font-medium text-white/85 backdrop-blur-md">
                            {filterObj.name}
                          </span>
                        )}
                        {layoutObj && (
                          <span className="rounded-full bg-black/65 px-2.5 py-1 text-[10px] font-medium text-white/85 backdrop-blur-md">
                            {layoutObj.shortName}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3 pt-1">
                      <div className="min-w-0">
                        <h3 className="truncate text-base font-bold text-[#faf8f5] sm:text-lg">{item.title}</h3>
                        <p className="truncate text-xs text-[#9c988f]">{item.subtitle}</p>
                      </div>
                      <button
                        onClick={() =>
                          onTryPreset({
                            modeId: item.modeId,
                            frameId: item.frameId,
                            filterId: item.filterId,
                            caption: item.caption,
                            withSamples: true,
                          })
                        }
                        className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-white/20 bg-white/[0.05] px-3.5 text-xs font-semibold text-[#faf8f5] transition group-hover:border-[#faf8f5] group-hover:bg-[#faf8f5] group-hover:text-[#141416] sm:h-10 sm:px-4"
                      >
                        <span>Remix</span>
                        <span>→</span>
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── CONCISE STUDIO FEATURES & EDITORIAL FOOTER CTA (Route: /about or embedded on /) ── */}
      {showAbout && (
        <section id="about" className="w-full border-t border-white/10 bg-[#0e0e11] py-14 text-[#f6f3ec] sm:py-20">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
            {sectionView === 'about' && onNavigateSection && (
              <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={() => onNavigateSection('landing')}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.04] px-4 py-1.5 text-xs font-semibold text-[#d4d0c8] transition hover:border-white/30 hover:text-white"
                >
                  <span>← Back to Home</span>
                </button>
                <button
                  onClick={() => onNavigateSection('gallery')}
                  className="rounded-full border border-white/15 px-4 py-1.5 text-xs font-semibold text-white/80 hover:border-white/35 hover:text-white"
                >
                  View Curated Gallery →
                </button>
              </div>
            )}

            <div className="grid min-w-0 gap-8 lg:grid-cols-[0.9fr_2.1fr] lg:gap-10">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[#a8a49c] sm:text-xs">
                  Turning Moments Into Meaning
                </p>
                <div className="my-3.5 h-px w-12 bg-[#e5a93c] sm:my-4" />
                <h2 className="text-2xl font-bold tracking-tight sm:text-4xl">
                  Crafted like an analog darkroom,{' '}
                  <span
                    className="font-normal italic text-[#f3dfb6]"
                    style={{ fontFamily: 'var(--font-serif)' }}
                  >
                    instant in your browser.
                  </span>
                </h2>
                <p className="mt-3.5 text-sm leading-relaxed text-[#9c988f] sm:mt-4">
                  Photography is more than images. It’s a way of feeling, remembering, and seeing the world differently. Everything happens privately on your device with zero uploads or accounts.
                </p>
              </div>

              <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
                {[
                  {
                    step: '01',
                    title: 'Live Studio & Multi-Shot Timer',
                    desc: 'Mirror-toggle webcam with 3-2-1 countdown, camera flash, individual slot retakes, or drag-and-drop photo uploads.',
                  },
                  {
                    step: '02',
                    title: '8 Art-Directed Strip Genres',
                    desc: 'From Seoul Photoism 4-cut strips and 35mm Kodak Portra film to 1974 archival safety film and pixel-art booths.',
                  },
                  {
                    step: '03',
                    title: 'Hand-Drawn Doodles & Stickers',
                    desc: 'Layer vector sketch doodles, comic speech bubbles, custom text stickers, masking tape, barcodes, and 120+ emojis.',
                  },
                  {
                    step: '04',
                    title: 'High-DPI 2× Canvas Export',
                    desc: 'True WYSIWYG HTML5 Canvas rendering exports crisp, print-ready PNG strips with every filter, grain, and sticker intact.',
                  },
                ].map((feat) => (
                  <div
                    key={feat.step}
                    className="min-w-0 rounded-3xl border border-white/10 bg-[#16161b] p-5 transition hover:border-white/20 sm:p-6"
                  >
                    <span className="font-mono text-xs font-bold text-[#e5a93c]">{feat.step}</span>
                    <h3 className="mt-2 text-base font-bold text-[#faf8f5]">{feat.title}</h3>
                    <p className="mt-2 text-xs leading-relaxed text-[#9c988f]">{feat.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Callout Banner */}
            <div className="mt-12 flex flex-col items-start justify-between gap-5 rounded-3xl border border-white/15 bg-gradient-to-r from-[#18181d] via-[#1d1b18] to-[#18181d] p-6 sm:mt-16 sm:flex-row sm:items-center sm:p-8 sm:px-10">
              <div className="min-w-0">
                <p className="text-xl font-medium text-[#faf8f5] sm:text-3xl">
                  Let’s create{' '}
                  <span
                    className="italic text-[#f3dfb6]"
                    style={{ fontFamily: 'var(--font-serif)' }}
                  >
                    something meaningful.
                  </span>
                </p>
                <p className="mt-1 text-xs leading-relaxed text-[#a8a49c]">
                  Step inside the booth — capture with your camera, upload from your roll, or remix sample shots.
                </p>
              </div>
              <div className="flex w-full flex-wrap items-center gap-2.5 sm:w-auto sm:gap-3">
                <button
                  onClick={onExploreModes}
                  className="flex-1 rounded-full border border-white/20 px-4 py-3 text-center text-xs font-semibold text-[#f6f3ec] transition hover:bg-white/10 sm:flex-initial sm:px-5"
                >
                  Browse 8 Modes
                </button>
                <button
                  onClick={() => onStartCapture()}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#faf8f5] px-5 py-3 text-xs font-bold text-[#141416] transition hover:bg-white sm:flex-initial sm:px-6"
                >
                  <span>Enter Studio</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
