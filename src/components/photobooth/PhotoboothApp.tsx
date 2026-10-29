// ─── SNAPSTUDIO app shell: three-step flow (Capture → Mode → Customize) ───
import { useState } from 'react'
import {
  FILTERS,
  FRAMES,
  LAYOUTS,
  MODES,
  type LayoutId,
  type Mode,
  type ModeId,
  type Sticker,
} from '@/lib/photobooth/data'
import CaptureStep from './CaptureStep'
import ModeStep from './ModeStep'
import EditStep from './EditStep'

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

type StepId = 'capture' | 'mode' | 'edit'

const STEPS: { id: StepId; n: number; label: string }[] = [
  { id: 'capture', n: 1, label: 'Capture' },
  { id: 'mode', n: 2, label: 'Mode' },
  { id: 'edit', n: 3, label: 'Customize' },
]

export default function PhotoboothApp() {
  const [step, setStep] = useState<StepId>('capture')
  const [layoutId, setLayoutId] = useState<LayoutId>('strip4')
  const [modeId, setModeId] = useState<ModeId>('classic')
  const [frameId, setFrameId] = useState('cloud')
  const [filterId, setFilterId] = useState('soft')
  const [shots, setShots] = useState<(string | null)[]>(() => LAYOUTS.find((l) => l.id === 'strip4')!.slots ? Array.from({ length: 4 }, () => null) : [])
  const [stickers, setStickers] = useState<Sticker[]>([])
  const [caption, setCaption] = useState('')
  const [dateOn, setDateOn] = useState(true)
  const [fontId, setFontId] = useState<'hand' | 'clean'>('hand')
  const [dateStr] = useState(() => {
    const d = new Date()
    return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
  })

  const layout = LAYOUTS.find((l) => l.id === layoutId)!
  const mode = MODES.find((m) => m.id === modeId)!
  const frame = FRAMES.find((f) => f.id === frameId) ?? FRAMES[0]
  const filter = FILTERS.find((f) => f.id === filterId) ?? FILTERS[0]

  const applyMode = (m: Mode) => {
    setModeId(m.id)
    setFrameId(m.defaultFrame)
    setFilterId(m.defaultFilter)
  }

  const changeLayout = (id: LayoutId) => {
    setLayoutId(id)
    const slots = LAYOUTS.find((l) => l.id === id)!.slots
    setShots((prev) => {
      const next = prev.slice(0, slots)
      while (next.length < slots) next.push(null)
      return next
    })
  }

  const filled = shots.filter(Boolean).length
  const canEdit = filled >= layout.slots

  const goStep = (id: StepId) => {
    if (id === 'edit' && !canEdit) return
    setStep(id)
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <button onClick={() => goStep('capture')} className="text-lg font-bold tracking-tight">
            <span className="text-primary">✦</span> SNAPSTUDIO
          </button>
          <nav className="flex items-center gap-1.5" aria-label="Progress">
            {STEPS.map((s) => {
              const locked = s.id === 'edit' && !canEdit
              const active = step === s.id
              return (
                <button
                  key={s.id}
                  onClick={() => goStep(s.id)}
                  disabled={locked}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition sm:px-4 ${
                    active
                      ? 'bg-foreground text-background shadow'
                      : locked
                        ? 'cursor-not-allowed text-muted-foreground/50'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  }`}
                >
                  <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${active ? 'bg-background/20' : 'bg-secondary'}`}>
                    {s.n}
                  </span>
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
              )
            })}
          </nav>
        </div>
      </header>

      <main>
        {step === 'capture' && (
          <CaptureStep
            layout={layout}
            shots={shots}
            onShots={(update) => setShots((prev) => update(prev))}
            onLayout={changeLayout}
            onContinue={() => setStep('mode')}
          />
        )}
        {step === 'mode' && (
          <ModeStep
            currentId={modeId}
            onPick={(m) => {
              applyMode(m)
              setStep('edit')
            }}
            onSkip={() => setStep('edit')}
          />
        )}
        {step === 'edit' && (
          <EditStep
            mode={mode}
            onMode={applyMode}
            layoutId={layoutId}
            onLayout={changeLayout}
            frame={frame}
            onFrame={setFrameId}
            filter={filter}
            onFilter={setFilterId}
            shots={shots}
            stickers={stickers}
            onStickers={(update) => setStickers((prev) => update(prev))}
            caption={caption}
            onCaption={setCaption}
            dateOn={dateOn}
            onDateOn={setDateOn}
            fontId={fontId}
            onFont={setFontId}
            dateStr={dateStr}
            onRetake={() => setStep('capture')}
          />
        )}
      </main>

      <footer className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        ✦ SNAPSTUDIO — your photos never leave this device.
      </footer>
    </div>
  )
}
