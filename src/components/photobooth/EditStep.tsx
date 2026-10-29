// ─── Edit step: live strip preview, sticker editing, frames/filters/layout/text, PNG export ───
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  FILTERS,
  FRAMES,
  LAYOUTS,
  MODES,
  STICKER_CATEGORIES,
  STICKER_DEFAULT,
  STICKER_MAX,
  STICKER_MIN,
  type FilterDef,
  type FrameDef,
  type LayoutId,
  type Mode,
  type Sticker,
  type StripConfig,
} from '@/lib/photobooth/data'
import { drawStrip, exportStripPng, stripSize } from '@/lib/photobooth/render'

const TABS = [
  { id: 'layout', label: 'Layout' },
  { id: 'frame', label: 'Frame' },
  { id: 'filter', label: 'Filter' },
  { id: 'stickers', label: 'Stickers' },
  { id: 'text', label: 'Text' },
] as const
type TabId = (typeof TABS)[number]['id']

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

interface Props {
  mode: Mode
  onMode: (mode: Mode) => void
  layoutId: LayoutId
  onLayout: (id: LayoutId) => void
  frame: FrameDef
  onFrame: (id: string) => void
  filter: FilterDef
  onFilter: (id: string) => void
  shots: (string | null)[]
  stickers: Sticker[]
  onStickers: (update: (prev: Sticker[]) => Sticker[]) => void
  caption: string
  onCaption: (v: string) => void
  dateOn: boolean
  onDateOn: (v: boolean) => void
  fontId: 'hand' | 'clean'
  onFont: (v: 'hand' | 'clean') => void
  dateStr: string
  onRetake: () => void
}

export default function EditStep(props: Props) {
  const {
    mode, onMode, layoutId, onLayout, frame, onFrame, filter, onFilter,
    shots, stickers, onStickers, caption, onCaption, dateOn, onDateOn, fontId, onFont, dateStr, onRetake,
  } = props

  const layout = LAYOUTS.find((l) => l.id === layoutId)!
  const [tab, setTab] = useState<TabId>('stickers')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [activeCat, setActiveCat] = useState(STICKER_CATEGORIES[0]!.id)
  const [scale, setScale] = useState(0)
  const [exportBusy, setExportBusy] = useState(false)
  const [exported, setExported] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const widthRef = useRef(0)
  const drawIdRef = useRef(0)
  const dragRef = useRef<{ id: string; offX: number; offY: number } | null>(null)

  const config = useMemo<StripConfig>(
    () => ({
      layout,
      shots,
      filter,
      frame,
      modeName: mode.name,
      stickers,
      caption,
      dateStamp: dateOn,
      fontId,
      dateStr,
    }),
    [layout, shots, filter, frame, mode.name, stickers, caption, dateOn, fontId, dateStr],
  )

  const size = useMemo(() => stripSize(layout, Boolean(caption.trim() || dateOn)), [layout, caption, dateOn])

  // keep the WYSIWYG canvas in sync
  useEffect(() => {
    const id = ++drawIdRef.current
    const canvas = canvasRef.current
    if (!canvas) return
    void drawStrip(canvas, config).catch(() => {})
    widthRef.current = size.w
    if (wrapRef.current) setScale(wrapRef.current.clientWidth / size.w)
    return () => {
      void id
    }
  }, [config, size.w])

  // track preview element width for sticker overlay scaling
  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(() => {
      if (widthRef.current) setScale(wrap.clientWidth / widthRef.current)
    })
    ro.observe(wrap)
    return () => ro.disconnect()
  }, [])

  // ── sticker drag ──
  const onDragMove = useCallback(
    (e: PointerEvent) => {
      const d = dragRef.current
      const wrap = wrapRef.current
      if (!d || !wrap) return
      const rect = wrap.getBoundingClientRect()
      const x = clamp((e.clientX - rect.left - d.offX) / rect.width, 0.02, 0.98)
      const y = clamp((e.clientY - rect.top - d.offY) / rect.height, 0.02, 0.98)
      onStickers((prev) => prev.map((s) => (s.id === d.id ? { ...s, x, y } : s)))
    },
    [onStickers],
  )

  const onDragEnd = useCallback(() => {
    dragRef.current = null
    window.removeEventListener('pointermove', onDragMove)
  }, [onDragMove])

  const onStickerPointerDown = useCallback(
    (e: React.PointerEvent, s: Sticker) => {
      e.preventDefault()
      e.stopPropagation()
      setSelectedId(s.id)
      const wrap = wrapRef.current
      if (!wrap) return
      const rect = wrap.getBoundingClientRect()
      dragRef.current = {
        id: s.id,
        offX: e.clientX - rect.left - s.x * rect.width,
        offY: e.clientY - rect.top - s.y * rect.height,
      }
      window.addEventListener('pointermove', onDragMove)
      window.addEventListener('pointerup', onDragEnd, { once: true })
    },
    [onDragEnd, onDragMove],
  )

  const selected = stickers.find((s) => s.id === selectedId) ?? null

  const updateSelected = (patch: Partial<Sticker>) => {
    if (!selectedId) return
    onStickers((prev) => prev.map((s) => (s.id === selectedId ? { ...s, ...patch } : s)))
  }

  const addSticker = (emoji: string) => {
    const id = crypto.randomUUID()
    onStickers((prev) => [
      ...prev,
      {
        id,
        emoji,
        x: clamp(0.5 + (Math.random() - 0.5) * 0.24, 0.1, 0.9),
        y: clamp(0.5 + (Math.random() - 0.5) * 0.24, 0.08, 0.92),
        size: STICKER_DEFAULT,
        rot: Math.round((Math.random() - 0.5) * 16),
      },
    ])
    setSelectedId(id)
  }

  const moveLayer = (dir: 1 | -1) => {
    if (!selectedId) return
    onStickers((prev) => {
      const i = prev.findIndex((s) => s.id === selectedId)
      const j = i + dir
      if (i < 0 || j < 0 || j >= prev.length) return prev
      const next = [...prev]
      const current = next[i]!
      const neighbour = next[j]!
      next[i] = neighbour
      next[j] = current
      return next
    })
  }

  const onDownload = async () => {
    if (exportBusy) return
    setExportBusy(true)
    try {
      const blob = await exportStripPng(config)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `snapstudio-${mode.id}-${layout.id}.png`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 30_000)
      setExported(true)
      window.setTimeout(() => setExported(false), 4000)
    } finally {
      setExportBusy(false)
    }
  }

  const filledCount = shots.slice(0, layout.slots).filter(Boolean).length

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-20 pt-4 sm:px-6">
      {/* toolbar */}
      <div className="anim-fade-up flex flex-wrap items-center gap-3 rounded-3xl border border-border bg-card p-3 shadow-[var(--shadow-soft)]">
        <button
          onClick={onRetake}
          className="rounded-full border border-border px-4 py-2 text-sm font-semibold transition hover:bg-accent"
        >
          ← Retake shots
        </button>
        <div className="flex flex-1 flex-wrap items-center gap-1.5">
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => onMode(m)}
              title={m.tagline}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                m.id === mode.id
                  ? 'bg-primary text-primary-foreground shadow'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
            >
              {m.icon} {m.name}
            </button>
          ))}
        </div>
        <button
          onClick={() => void onDownload()}
          disabled={exportBusy || filledCount < layout.slots}
          title={filledCount < layout.slots ? `Add ${layout.slots - filledCount} more photo(s) first` : 'Download as high-quality PNG'}
          className="rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground shadow transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {exportBusy ? 'Rendering…' : exported ? '✓ Saved!' : '⬇ Download PNG'}
        </button>
      </div>

      <div className="mt-6 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_400px]">
        {/* preview */}
        <section className="rounded-3xl border border-border bg-card p-5 shadow-[var(--shadow-soft)] lg:sticky lg:top-24">
          <div className="flex items-center justify-between px-1 pb-3">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">Live preview</span>
            <span className="text-xs text-muted-foreground">{filledCount}/{layout.slots} photos</span>
          </div>
          <div
            ref={wrapRef}
            className="relative mx-auto w-fit"
            onPointerDown={() => setSelectedId(null)}
          >
            <canvas
              ref={canvasRef}
              className="block h-auto max-h-[72vh] w-auto max-w-full rounded-[18px] shadow-[0_30px_80px_-30px_rgba(0,0,0,0.5)]"
            />
            <div className="pointer-events-none absolute inset-0">
              {stickers.map((s) => (
                <button
                  key={s.id}
                  onPointerDown={(e) => onStickerPointerDown(e, s)}
                  style={{
                    pointerEvents: 'auto',
                    left: `${s.x * 100}%`,
                    top: `${s.y * 100}%`,
                    fontSize: Math.max(10, s.size * scale),
                    transform: `translate(-50%, -50%) rotate(${s.rot}deg)`,
                    boxShadow: selectedId === s.id ? '0 0 0 2px var(--color-primary), 0 0 0 4px var(--color-primary-30, rgba(0,0,0,0.08))' : undefined,
                  }}
                  className="absolute cursor-grab touch-none select-none rounded-lg leading-none active:cursor-grabbing"
                  aria-label={`Sticker ${s.emoji}`}
                >
                  {s.emoji}
                </button>
              ))}
            </div>
          </div>

          {/* selected sticker toolbar */}
          {selected && (
            <div className="anim-pop mt-4 flex flex-wrap items-center gap-x-5 gap-y-3 rounded-2xl border border-primary/30 bg-primary/5 p-4">
              <label className="flex items-center gap-2 text-xs font-semibold">
                Size
                <input
                  type="range"
                  min={STICKER_MIN}
                  max={STICKER_MAX}
                  value={selected.size}
                  onChange={(e) => updateSelected({ size: Number(e.target.value) })}
                  className="w-28 accent-primary"
                />
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold">
                Rotate
                <input
                  type="range"
                  min={-180}
                  max={180}
                  value={selected.rot}
                  onChange={(e) => updateSelected({ rot: Number(e.target.value) })}
                  className="w-28 accent-primary"
                />
              </label>
              <div className="flex items-center gap-1.5">
                <button onClick={() => moveLayer(1)} title="Bring forward" className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold hover:bg-accent">↑ Layer</button>
                <button onClick={() => moveLayer(-1)} title="Send backward" className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold hover:bg-accent">↓ Layer</button>
                <button
                  onClick={() => {
                    const copy: Sticker = { ...selected, id: crypto.randomUUID(), x: clamp(selected.x + 0.05, 0.02, 0.98), y: clamp(selected.y + 0.05, 0.02, 0.98) }
                    onStickers((prev) => [...prev, copy])
                    setSelectedId(copy.id)
                  }}
                  className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold hover:bg-accent"
                >
                  ⧉ Copy
                </button>
                <button
                  onClick={() => {
                    onStickers((prev) => prev.filter((s) => s.id !== selected.id))
                    setSelectedId(null)
                  }}
                  className="rounded-full bg-destructive px-3 py-1.5 text-xs font-semibold text-destructive-foreground hover:opacity-90"
                >
                  🗑 Delete
                </button>
                <button onClick={() => setSelectedId(null)} className="rounded-full px-2 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground">
                  Done
                </button>
              </div>
            </div>
          )}
        </section>

        {/* controls */}
        <aside className="rounded-3xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
          <div className="flex flex-wrap gap-1.5">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  tab === t.id ? 'bg-foreground text-background shadow' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="mt-5 max-h-[60vh] overflow-y-auto pr-1 lg:max-h-[calc(100vh-16rem)]">
            {tab === 'layout' && (
              <div className="grid gap-3">
                {LAYOUTS.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => onLayout(l.id)}
                    className={`flex items-center gap-4 rounded-2xl border p-3 text-left transition ${
                      l.id === layoutId ? 'border-primary ring-2 ring-primary' : 'border-border hover:bg-accent'
                    }`}
                  >
                    <span
                      className="grid shrink-0 gap-1 rounded-lg bg-secondary p-1.5"
                      style={{ gridTemplateColumns: `repeat(${l.cols}, 1fr)` }}
                    >
                      {Array.from({ length: l.cols * l.rows }).map((_, i) => (
                        <span key={i} className="block h-4 w-3 rounded-[3px] bg-foreground/25" />
                      ))}
                    </span>
                    <span>
                      <span className="block text-sm font-bold">{l.name}</span>
                      <span className="block text-xs text-muted-foreground">{l.hint} · needs {l.slots} photos</span>
                    </span>
                  </button>
                ))}
              </div>
            )}

            {tab === 'frame' && (
              <div className="grid grid-cols-2 gap-3">
                {FRAMES.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => onFrame(f.id)}
                    className={`rounded-2xl border p-2 text-left transition ${
                      f.id === frame.id ? 'border-primary ring-2 ring-primary' : 'border-border hover:bg-accent'
                    }`}
                  >
                    <span
                      className="relative block h-16 w-full overflow-hidden rounded-xl border border-black/10"
                      style={{ background: f.bg }}
                    >
                      <span className="absolute inset-x-3 top-2.5 bottom-5 rounded-md border" style={{ borderColor: `${f.fg}33`, background: `${f.fg}0f` }} />
                    </span>
                    <span className="mt-1.5 block px-1 text-xs font-bold">{f.name}</span>
                    <span className="block px-1 text-[10px] capitalize text-muted-foreground">{f.style} style</span>
                  </button>
                ))}
              </div>
            )}

            {tab === 'filter' && (
              <div className="flex flex-wrap gap-2">
                {FILTERS.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => onFilter(f.id)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      f.id === filter.id ? 'bg-primary text-primary-foreground shadow' : 'border border-border hover:bg-accent'
                    }`}
                  >
                    {f.name}
                  </button>
                ))}
                <p className="mt-2 w-full text-xs text-muted-foreground">Filters apply to every photo on the strip — swap them anytime.</p>
              </div>
            )}

            {tab === 'stickers' && (
              <div>
                <div className="flex flex-wrap gap-1.5">
                  {STICKER_CATEGORIES.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setActiveCat(c.id)}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                        c.id === activeCat ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
                <div className="mt-4 grid grid-cols-6 gap-2">
                  {STICKER_CATEGORIES.find((c) => c.id === activeCat)!.emojis.map((e, i) => (
                    <button
                      key={`${e}-${i}`}
                      onClick={() => addSticker(e)}
                      title={`Add ${e} sticker`}
                      className="flex h-11 items-center justify-center rounded-xl border border-border text-2xl transition hover:-translate-y-0.5 hover:border-primary hover:bg-accent"
                    >
                      {e}
                    </button>
                  ))}
                </div>
                <p className="mt-3 text-xs text-muted-foreground">Tap a sticker to add it — then drag it on the strip, resize, rotate and layer it. Stickers from any category can be mixed on any mode.</p>
              </div>
            )}

            {tab === 'text' && (
              <div className="space-y-5">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Caption</label>
                  <input
                    value={caption}
                    onChange={(e) => onCaption(e.target.value)}
                    maxLength={80}
                    placeholder="Write a caption…"
                    className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                  />
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {mode.captions.map((c) => (
                      <button
                        key={c}
                        onClick={() => onCaption(c)}
                        className="rounded-full border border-dashed border-border px-3 py-1 text-xs text-muted-foreground transition hover:border-primary hover:text-foreground"
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Caption font</label>
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => onFont('hand')}
                      className={`flex-1 rounded-2xl border px-4 py-3 text-lg transition ${fontId === 'hand' ? 'border-primary bg-primary/10' : 'border-border hover:bg-accent'}`}
                      style={{ fontFamily: '"Caveat", cursive' }}
                    >
                      Handwritten
                    </button>
                    <button
                      onClick={() => onFont('clean')}
                      className={`flex-1 rounded-2xl border px-4 py-3 text-sm font-bold transition ${fontId === 'clean' ? 'border-primary bg-primary/10' : 'border-border hover:bg-accent'}`}
                    >
                      Clean Sans
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-border p-4">
                  <div>
                    <p className="text-sm font-bold">Date stamp</p>
                    <p className="text-xs text-muted-foreground">{dateStr}</p>
                  </div>
                  <button
                    role="switch"
                    aria-checked={dateOn}
                    onClick={() => onDateOn(!dateOn)}
                    className={`relative h-7 w-12 rounded-full transition ${dateOn ? 'bg-primary' : 'bg-border'}`}
                  >
                    <span
                      className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${dateOn ? 'left-6' : 'left-1'}`}
                    />
                  </button>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
