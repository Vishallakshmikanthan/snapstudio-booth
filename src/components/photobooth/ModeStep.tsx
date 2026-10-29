// ─── Mode step: 8 selectable photo modes ───
import { FRAMES, LAYOUTS, MODES, type Mode, type ModeId } from '@/lib/photobooth/data'

interface Props {
  currentId: ModeId
  onPick: (mode: Mode) => void
  onSkip: () => void
}

export default function ModeStep({ currentId, onPick, onSkip }: Props) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-8 sm:px-6">
      <div className="anim-fade-up">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Step 2 · Choose a mode</p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Pick your vibe</h2>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Each mode sets a starting frame, filter and layout. Switch anytime — every sticker and customization mixes freely across modes.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {MODES.map((m, i) => {
          const layout = LAYOUTS.find((l) => l.id === m.defaultLayout)
          return (
            <button
              key={m.id}
              onClick={() => onPick(m)}
              style={{ animationDelay: `${i * 55}ms` }}
              className={`anim-pop group flex flex-col rounded-3xl border bg-card p-5 text-left shadow-[var(--shadow-soft)] transition hover:-translate-y-1 hover:shadow-[var(--shadow-lift)] ${
                m.id === currentId ? 'border-primary ring-2 ring-primary' : 'border-border'
              }`}
            >
              <span className="text-3xl transition-transform group-hover:scale-110">{m.icon}</span>
              <h3 className="mt-3 font-bold">{m.name}</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{m.tagline}</p>
              <div className="mt-4 flex items-center gap-1.5">
                {m.frames.map((fid) => {
                  const f = FRAMES.find((fr) => fr.id === fid)
                  return f ? (
                    <span
                      key={fid}
                      className="h-5 w-5 rounded-full border border-black/10 shadow-inner"
                      style={{ background: f.bg }}
                    />
                  ) : null
                })}
              </div>
              <div className="mt-2 flex items-center gap-1 text-lg">{m.stickerSample.map((e, j) => <span key={j}>{e}</span>)}</div>
              <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-[11px] font-semibold text-muted-foreground">
                <span>{layout?.name}</span>
                <span className="transition-transform group-hover:translate-x-0.5">Start →</span>
              </div>
            </button>
          )
        })}
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={onSkip}
          className="text-sm font-semibold text-muted-foreground underline-offset-4 transition hover:text-foreground hover:underline"
        >
          Skip — go straight to customizing
        </button>
      </div>
    </div>
  )
}
