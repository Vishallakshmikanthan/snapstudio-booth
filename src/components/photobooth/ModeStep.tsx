// ─── Mode step: Warm cream mode-selection screen with 8 premium visual cards + strip comparison ───
import { FILTERS, FRAMES, LAYOUTS, MODES, type Mode, type ModeId } from '@/lib/photobooth/data'

interface Props {
  currentId: ModeId
  shots?: (string | null)[]
  onPick: (mode: Mode) => void
  onSkip: () => void
  onBackToCapture?: () => void
}

export default function ModeStep({ currentId, shots = [], onPick, onSkip, onBackToCapture }: Props) {
  const filledShots = shots.filter((s): s is string => Boolean(s))

  return (
    <div className="min-h-[calc(100vh-4rem)] w-full max-w-full overflow-x-hidden bg-[#f5f2eb] text-[#171614]">
      <div className="mx-auto w-full max-w-7xl px-4 pb-16 pt-6 sm:px-6 sm:pb-20 sm:pt-10 lg:pt-12">
        {/* Top Header matching 02. Mode Selection in reference */}
        <div className="anim-fade-up flex flex-wrap items-end justify-between gap-5 sm:gap-6">
          <div className="min-w-0">
            <div className="inline-flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-[0.24em] text-[#787267] sm:text-xs">
              <span>02 · Mode Selection</span>
              {filledShots.length > 0 && (
                <span className="rounded-full bg-[#171614] px-2.5 py-0.5 text-[10px] font-semibold tracking-wider text-[#f5f2eb]">
                  {filledShots.length} shots ready
                </span>
              )}
            </div>

            <div className="mt-2 flex items-center gap-2.5 sm:gap-3">
              <h1 className="text-3xl font-extrabold leading-[1.06] tracking-tight text-[#141413] sm:text-5xl">
                Choose Your
                <br />
                Photo Mode
              </h1>
              {/* Hand-drawn star doodle from reference */}
              <svg
                aria-hidden="true"
                viewBox="0 0 48 48"
                className="-mt-4 h-7 w-7 shrink-0 text-[#171614] sm:-mt-6 sm:h-9 sm:w-9"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M24 4 L29 18 L44 18 L32 27 L36 42 L24 33 L12 42 L16 27 L4 18 L19 18 Z" />
              </svg>
            </div>

            <p className="mt-2.5 max-w-xl text-sm leading-relaxed text-[#615c52] sm:text-base">
              Different vibes for different stories. Each mode sets a signature frame, filter, and layout — and every sticker and customization mixes freely across modes.
            </p>
          </div>

          <div className="flex w-full flex-wrap items-center gap-2.5 sm:w-auto sm:gap-3">
            {onBackToCapture && (
              <button
                onClick={onBackToCapture}
                className="flex-1 rounded-full border border-[#171614]/20 bg-white/70 px-4 py-2.5 text-center text-xs font-bold text-[#171614] transition hover:border-[#171614] hover:bg-white sm:flex-initial sm:px-5"
              >
                ← Capture Studio
              </button>
            )}
            <button
              onClick={onSkip}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-[#171614]/30 bg-white px-5 py-2.5 text-xs font-bold text-[#171614] shadow-sm transition hover:-translate-y-0.5 hover:border-[#171614] hover:shadow sm:flex-initial sm:px-6"
            >
              <span>Open Editor</span>
              <span>→</span>
            </button>
          </div>
        </div>

        {/* 8 Premium Visual Mode Cards (4x2 grid on desktop) */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:mt-10 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
          {MODES.map((m, i) => {
            const layout = LAYOUTS.find((l) => l.id === m.defaultLayout)
            const defaultFilter = FILTERS.find((f) => f.id === m.defaultFilter)
            const defaultFrame = FRAMES.find((f) => f.id === m.defaultFrame)
            const isSelected = m.id === currentId

            return (
              <button
                key={m.id}
                onClick={() => onPick(m)}
                style={{ animationDelay: `${i * 45}ms` }}
                className={`anim-pop group flex min-w-0 flex-col overflow-hidden rounded-[24px] border p-3 text-left transition duration-300 hover:-translate-y-1.5 ${
                  isSelected
                    ? 'border-[#171614] bg-white ring-2 ring-[#171614] shadow-[0_24px_48px_-18px_rgba(23,22,20,0.22)]'
                    : 'border-[#e2ddd2] bg-[#efece4]/85 hover:border-[#171614]/40 hover:bg-white hover:shadow-[0_22px_44px_-18px_rgba(23,22,20,0.16)]'
                }`}
              >
                {/* Large Layered Preview Stage */}
                <div className="relative aspect-[16/11] w-full overflow-hidden rounded-[18px] bg-[#181716]">
                  <div
                    className="pointer-events-none absolute inset-0 opacity-30 transition duration-500 group-hover:opacity-50"
                    style={{
                      background: `radial-gradient(circle at 50% 45%, ${m.accentColor}, transparent 72%)`,
                    }}
                  />

                  <img
                    src={m.previewImage}
                    alt={`${m.name} example`}
                    className="h-full w-full object-cover opacity-90 transition duration-500 group-hover:scale-105 group-hover:opacity-100"
                  />

                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/25" />

                  <div className="absolute left-3 top-3 flex items-center gap-1.5">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-sm backdrop-blur-md">
                      {m.icon}
                    </span>
                    {isSelected && (
                      <span className="rounded-full bg-[#faf8f5] px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#141416] shadow">
                        Active
                      </span>
                    )}
                  </div>

                  <div className="absolute right-3 top-3 flex items-center -space-x-1 rounded-full bg-black/55 p-1 backdrop-blur-md">
                    {m.frames.map((fid) => {
                      const f = FRAMES.find((fr) => fr.id === fid)
                      return f ? (
                        <span
                          key={fid}
                          title={f.name}
                          className="h-3.5 w-3.5 rounded-full border border-white/40"
                          style={{ background: f.bg }}
                        />
                      ) : null
                    })}
                  </div>

                  <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between gap-1 text-[10px] font-semibold text-white/90">
                    <span className="truncate rounded-full bg-black/60 px-2.5 py-0.5 backdrop-blur-md">
                      {defaultFrame?.name ?? 'Custom Frame'}
                    </span>
                    <span className="shrink-0 rounded-full bg-black/60 px-2.5 py-0.5 backdrop-blur-md">
                      {defaultFilter?.name ?? 'Filter'}
                    </span>
                  </div>
                </div>

                {/* Card Copy */}
                <div className="flex flex-1 flex-col justify-between px-2 pb-1.5 pt-3.5">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="text-base font-extrabold tracking-tight text-[#171614]">{m.name}</h2>
                      <div className="flex items-center gap-0.5 text-sm opacity-80">
                        {m.stickerSample.slice(0, 3).map((e, j) => (
                          <span key={j}>{e}</span>
                        ))}
                      </div>
                    </div>
                    <p className="mt-0.5 text-xs font-semibold text-[#575248]">{m.tagline}</p>
                    <p className="mt-1.5 line-clamp-2 text-[11px] leading-relaxed text-[#787267]">
                      {m.description}
                    </p>
                  </div>

                  <div className="mt-3.5 flex items-center justify-between border-t border-black/10 pt-2.5 text-[11px] font-bold text-[#4a463e]">
                    <span>{layout?.name}</span>
                    <span className="inline-flex items-center gap-1 text-[#171614] transition-transform group-hover:translate-x-0.5">
                      Use Mode →
                    </span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* 05. Mode Examples Strip Lineup */}
        <div className="mt-10 rounded-[24px] border border-[#e0dbd0] bg-[#fbf9f5] p-4 shadow-sm sm:mt-14 sm:rounded-[28px] sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#787267]">
                05 · Mode Strip Lineup
              </p>
              <h3 className="mt-1 text-lg font-extrabold tracking-tight text-[#171614] sm:text-xl">
                Side-by-Side Strip Aesthetics
              </h3>
            </div>
            <button
              onClick={onSkip}
              className="text-xs font-bold text-[#575248] underline-offset-4 transition hover:text-[#171614] hover:underline"
            >
              Skip preset — go straight to full customization →
            </button>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:mt-6 sm:grid-cols-4 sm:gap-3.5 lg:grid-cols-8">
            {MODES.map((m) => {
              const active = m.id === currentId
              return (
                <button
                  key={m.id}
                  onClick={() => onPick(m)}
                  className={`group flex min-w-0 flex-col items-center rounded-2xl p-2 text-center transition ${
                    active ? 'bg-[#efece4] ring-2 ring-[#171614]' : 'hover:bg-[#efece4]/70'
                  }`}
                >
                  <div className="relative aspect-[9/19] w-full overflow-hidden rounded-xl border border-black/10 bg-[#18181b] shadow-md transition duration-300 group-hover:-translate-y-1 group-hover:shadow-lg">
                    <img
                      src={m.previewImage}
                      alt={`${m.name} strip`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <span className="mt-2.5 text-xs font-bold text-[#171614]">{m.name}</span>
                  <span className="text-[10px] text-[#787267]">{m.tagline}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
