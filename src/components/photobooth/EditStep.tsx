// ─── EditStep: Professional three-panel dark photo editor with undo/redo, doodles, text stickers & 2x PNG export ───
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  BACKGROUND_PRESETS,
  DOODLE_STICKERS,
  FILTERS,
  FRAMES,
  LAYOUTS,
  MODES,
  STICKER_CATEGORIES,
  STICKER_DEFAULT,
  STICKER_MAX,
  STICKER_MIN,
  type DoodleStickerDef,
  type FilterDef,
  type FontId,
  type FrameDef,
  type LayoutId,
  type Mode,
  type Sticker,
  type StripConfig,
} from '@/lib/photobooth/data'
import { drawStrip, exportStripPng, stripSize } from '@/lib/photobooth/render'
import {
  ArrowDown,
  ArrowUp,
  Check,
  Copy,
  Download,
  Frame as FrameIcon,
  Grid,
  Palette,
  Plus,
  Redo2,
  RotateCcw,
  Sliders,
  Smile,
  Sparkles,
  Trash2,
  Type,
  Undo2,
} from 'lucide-react'

const TABS = [
  { id: 'layout', label: 'Layout', icon: Grid },
  { id: 'frame', label: 'Frame', icon: FrameIcon },
  { id: 'filter', label: 'Filters', icon: Sliders },
  { id: 'stickers', label: 'Stickers', icon: Smile },
  { id: 'text', label: 'Text', icon: Type },
  { id: 'background', label: 'Background', icon: Palette },
] as const

export type EditorTabId = (typeof TABS)[number]['id']

const STICKER_FILTER_TABS = [
  { id: 'all', name: 'All' },
  { id: 'doodles', name: 'Doodle' },
  { id: 'faces', name: 'Emoji' },
  { id: 'memes', name: 'Memes' },
  { id: 'animals', name: 'Animals' },
  { id: 'hearts', name: 'Shapes' },
  { id: 'music', name: 'Music' },
  { id: 'cute', name: 'Cute' },
  { id: 'travel', name: 'Travel' },
  { id: 'stars', name: 'Stars' },
  { id: 'flames', name: 'Flames' },
] as const

const TEXT_STICKER_COLORS = ['#fef08a', '#ffffff', '#fb7185', '#38bdf8', '#4ade80', '#c084fc', '#f97316']

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

interface EditorSnapshot {
  layoutId: LayoutId
  frameId: string
  filterId: string
  stickers: Sticker[]
  caption: string
  dateOn: boolean
  fontId: FontId
  customBg: string
  showGrain: boolean
  showBarcode: boolean
}

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
  onShots?: (update: (prev: (string | null)[]) => (string | null)[]) => void
  stickers: Sticker[]
  onStickers: (update: (prev: Sticker[]) => Sticker[]) => void
  caption: string
  onCaption: (v: string) => void
  dateOn: boolean
  onDateOn: (v: boolean) => void
  fontId: FontId
  onFont: (v: FontId) => void
  dateStr: string
  onDateStr?: (v: string) => void
  onRetake: () => void
  initialTab?: EditorTabId
}

export default function EditStep(props: Props) {
  const {
    mode,
    onMode,
    layoutId,
    onLayout,
    frame,
    onFrame,
    filter,
    onFilter,
    shots,
    stickers,
    onStickers,
    caption,
    onCaption,
    dateOn,
    onDateOn,
    fontId,
    onFont,
    dateStr,
    onDateStr,
    onRetake,
    initialTab = 'stickers',
  } = props

  const layout = LAYOUTS.find((l) => l.id === layoutId)!
  const [tab, setTab] = useState<EditorTabId>(initialTab)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [activeCat, setActiveCat] = useState<string>('all')
  const [scale, setScale] = useState(0.5)
  const [exportBusy, setExportBusy] = useState(false)
  const [exported, setExported] = useState(false)

  const [customBg, setCustomBg] = useState<string>('')
  const [showGrain, setShowGrain] = useState<boolean>(false)
  const [showBarcode, setShowBarcode] = useState<boolean>(true)
  const [tiltPreview, setTiltPreview] = useState<boolean>(false)

  const [customTextInput, setCustomTextInput] = useState('')
  const [customTextStyle, setCustomTextStyle] = useState<'hand' | 'bubble' | 'badge' | 'outline'>('hand')
  const [customTextColor, setCustomTextColor] = useState('#fef08a')

  const [recentStickers, setRecentStickers] = useState<
    { label: string; emoji: string; kind?: 'emoji' | 'doodle' | 'text'; doodleId?: string }[]
  >([
    { label: '☆', emoji: '☆', kind: 'doodle', doodleId: 'star-sketch' },
    { label: '♡', emoji: '♡', kind: 'doodle', doodleId: 'heart-sketch' },
    { label: 'GOOD VIBES', emoji: 'GOOD VIBES', kind: 'doodle', doodleId: 'good-vibes' },
    { label: 'LOVE', emoji: 'LOVE', kind: 'doodle', doodleId: 'love-script' },
    { label: '🐱', emoji: '🐱', kind: 'doodle', doodleId: 'cat-sketch' },
    { label: '✨', emoji: '✨', kind: 'emoji' },
  ])

  const [history, setHistory] = useState<EditorSnapshot[]>(() => [
    {
      layoutId,
      frameId: frame.id,
      filterId: filter.id,
      stickers,
      caption,
      dateOn,
      fontId,
      customBg: '',
      showGrain: false,
      showBarcode: true,
    },
  ])
  const [historyIndex, setHistoryIndex] = useState(0)
  const isApplyingHistoryRef = useRef(false)

  useEffect(() => {
    if (initialTab) setTab(initialTab)
  }, [initialTab])

  const pushHistory = useCallback(
    (patch?: Partial<EditorSnapshot>) => {
      if (isApplyingHistoryRef.current) return
      const snap: EditorSnapshot = {
        layoutId,
        frameId: frame.id,
        filterId: filter.id,
        stickers,
        caption,
        dateOn,
        fontId,
        customBg,
        showGrain,
        showBarcode,
        ...patch,
      }
      setHistory((prev) => {
        const sliced = prev.slice(0, historyIndex + 1)
        return [...sliced.slice(-29), snap]
      })
      setHistoryIndex((prev) => Math.min(29, prev + 1))
    },
    [caption, customBg, dateOn, filter.id, fontId, frame.id, historyIndex, layoutId, showBarcode, showGrain, stickers],
  )

  const applySnapshot = useCallback(
    (snap: EditorSnapshot) => {
      isApplyingHistoryRef.current = true
      onLayout(snap.layoutId)
      onFrame(snap.frameId)
      onFilter(snap.filterId)
      onStickers(() => snap.stickers)
      onCaption(snap.caption)
      onDateOn(snap.dateOn)
      onFont(snap.fontId)
      setCustomBg(snap.customBg)
      setShowGrain(snap.showGrain)
      setShowBarcode(snap.showBarcode)
      window.setTimeout(() => {
        isApplyingHistoryRef.current = false
      }, 20)
    },
    [onCaption, onDateOn, onFilter, onFont, onFrame, onLayout, onStickers],
  )

  const canUndo = historyIndex > 0
  const canRedo = historyIndex < history.length - 1

  const handleUndo = useCallback(() => {
    if (!canUndo) return
    const nextIdx = historyIndex - 1
    const snap = history[nextIdx]
    if (snap) {
      setHistoryIndex(nextIdx)
      applySnapshot(snap)
    }
  }, [applySnapshot, canUndo, history, historyIndex])

  const handleRedo = useCallback(() => {
    if (!canRedo) return
    const nextIdx = historyIndex + 1
    const snap = history[nextIdx]
    if (snap) {
      setHistoryIndex(nextIdx)
      applySnapshot(snap)
    }
  }, [applySnapshot, canRedo, history, historyIndex])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')) {
        return
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        if (e.shiftKey) handleRedo()
        else handleUndo()
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault()
        handleRedo()
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        e.preventDefault()
        onStickers((prev) => {
          const next = prev.filter((s) => s.id !== selectedId)
          pushHistory({ stickers: next })
          return next
        })
        setSelectedId(null)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [handleRedo, handleUndo, onStickers, pushHistory, selectedId])

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const widthRef = useRef(0)
  const dragRef = useRef<{ id: string; offX: number; offY: number } | null>(null)
  const latestStickersRef = useRef<Sticker[]>(stickers)
  latestStickersRef.current = stickers

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
      customBg: customBg || undefined,
      showGrain,
      showBarcode,
    }),
    [layout, shots, filter, frame, mode.name, stickers, caption, dateOn, fontId, dateStr, customBg, showGrain, showBarcode],
  )

  const size = useMemo(
    () => stripSize(layout, Boolean(caption.trim() || dateOn || showBarcode)),
    [layout, caption, dateOn, showBarcode],
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    void drawStrip(canvas, config).catch(() => {})
    widthRef.current = size.w
    if (wrapRef.current && size.w > 0) {
      setScale(wrapRef.current.clientWidth / size.w)
    }
  }, [config, size.w])

  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(() => {
      if (widthRef.current) setScale(wrap.clientWidth / widthRef.current)
    })
    ro.observe(wrap)
    return () => ro.disconnect()
  }, [])

  const onDragMove = useCallback(
    (e: PointerEvent) => {
      const d = dragRef.current
      const wrap = wrapRef.current
      if (!d || !wrap) return
      const rect = wrap.getBoundingClientRect()
      const x = clamp((e.clientX - rect.left - d.offX) / rect.width, 0.03, 0.97)
      const y = clamp((e.clientY - rect.top - d.offY) / rect.height, 0.03, 0.97)
      onStickers((prev) => prev.map((s) => (s.id === d.id ? { ...s, x, y } : s)))
    },
    [onStickers],
  )

  const onDragEnd = useCallback(() => {
    if (dragRef.current) {
      pushHistory({ stickers: latestStickersRef.current })
    }
    dragRef.current = null
    window.removeEventListener('pointermove', onDragMove)
  }, [onDragMove, pushHistory])

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

  const updateSelected = (patch: Partial<Sticker>, commitHistory = false) => {
    if (!selectedId) return
    onStickers((prev) => {
      const next = prev.map((s) => (s.id === selectedId ? { ...s, ...patch } : s))
      if (commitHistory) pushHistory({ stickers: next })
      return next
    })
  }

  const addStickerItem = (opts: {
    emoji: string
    kind?: 'emoji' | 'doodle' | 'text'
    doodleId?: string
    textStyle?: 'hand' | 'bubble' | 'badge' | 'outline'
    color?: string
    size?: number
  }) => {
    const id = crypto.randomUUID()
    const newSticker: Sticker = {
      id,
      emoji: opts.emoji,
      kind: opts.kind ?? 'emoji',
      doodleId: opts.doodleId,
      textStyle: opts.textStyle,
      color: opts.color,
      x: clamp(0.5 + (Math.random() - 0.5) * 0.28, 0.12, 0.88),
      y: clamp(0.5 + (Math.random() - 0.5) * 0.28, 0.1, 0.9),
      size: opts.size ?? (opts.kind === 'doodle' || opts.kind === 'text' ? 92 : STICKER_DEFAULT),
      rot: Math.round((Math.random() - 0.5) * 16),
    }
    onStickers((prev) => {
      const next = [...prev, newSticker]
      pushHistory({ stickers: next })
      return next
    })
    setSelectedId(id)

    setRecentStickers((prev) => {
      const filtered = prev.filter((r) => !(r.emoji === opts.emoji && r.doodleId === opts.doodleId))
      return [
        { label: opts.emoji, emoji: opts.emoji, kind: opts.kind, doodleId: opts.doodleId },
        ...filtered,
      ].slice(0, 8)
    })
  }

  const addCustomTextSticker = () => {
    const trimmed = customTextInput.trim()
    if (!trimmed) return
    addStickerItem({
      emoji: trimmed,
      kind: 'text',
      textStyle: customTextStyle,
      color: customTextColor,
      size: 96,
    })
    setCustomTextInput('')
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
      pushHistory({ stickers: next })
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
  const samplePreviewShot = shots.find(Boolean) || '/samples/duo-1.jpg'

  const visibleDoodles = useMemo<DoodleStickerDef[]>(() => {
    if (activeCat === 'all' || activeCat === 'doodles') return DOODLE_STICKERS
    if (activeCat === 'memes') return DOODLE_STICKERS.filter((d) => d.category === 'memes' || d.category === 'badges')
    if (activeCat === 'animals') return DOODLE_STICKERS.filter((d) => d.category === 'animals')
    if (activeCat === 'hearts') return DOODLE_STICKERS.filter((d) => d.category === 'shapes')
    if (activeCat === 'music') return DOODLE_STICKERS.filter((d) => d.category === 'music')
    return []
  }, [activeCat])

  const visibleEmojis = useMemo<string[]>(() => {
    if (activeCat === 'all') {
      return STICKER_CATEGORIES.flatMap((c) => c.emojis.slice(0, 6))
    }
    const cat = STICKER_CATEGORIES.find((c) => c.id === activeCat)
    return cat ? cat.emojis : STICKER_CATEGORIES[0]!.emojis
  }, [activeCat])

  return (
    <div className="min-h-[calc(100vh-4rem)] w-full max-w-full overflow-x-hidden bg-[#111114] text-[#f6f3ec]">
      <div className="mx-auto w-full max-w-[1440px] px-3 pb-16 pt-3.5 sm:px-6 sm:pt-4">
        {/* ── TOP EDITOR HEADER BAR ── */}
        <div className="anim-fade-up flex flex-wrap items-center justify-between gap-2.5 rounded-2xl border border-white/10 bg-[#17171c] px-3 py-2.5 shadow-lg sm:gap-3 sm:px-4">
          <div className="flex items-center gap-2">
            <button
              onClick={onRetake}
              className="rounded-full border border-white/15 bg-[#202027] px-3 py-1.5 text-[11px] font-semibold text-[#f6f3ec] transition hover:border-white/35 hover:bg-white/10 sm:px-4 sm:text-xs"
            >
              ← Retake / Photos
            </button>
            <span className="hidden text-xs text-white/25 sm:inline">|</span>
            <span className="hidden text-xs font-medium text-[#a8a49c] md:inline">
              04 · Photo Editor
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center rounded-full border border-white/10 bg-[#121215] p-0.5">
              <button
                onClick={handleUndo}
                disabled={!canUndo}
                title="Undo (Ctrl+Z)"
                aria-label="Undo"
                className="flex h-7 w-7 items-center justify-center rounded-full text-white/80 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30 sm:h-8 sm:w-8"
              >
                <Undo2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </button>
              <button
                onClick={handleRedo}
                disabled={!canRedo}
                title="Redo (Ctrl+Y)"
                aria-label="Redo"
                className="flex h-7 w-7 items-center justify-center rounded-full text-white/80 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30 sm:h-8 sm:w-8"
              >
                <Redo2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </button>
            </div>

            <div className="relative flex items-center">
              <select
                aria-label="Switch Photo Mode"
                value={mode.id}
                onChange={(e) => {
                  const picked = MODES.find((m) => m.id === e.target.value)
                  if (picked) {
                    onMode(picked)
                    setCustomBg('')
                    pushHistory({
                      frameId: picked.defaultFrame,
                      filterId: picked.defaultFilter,
                      customBg: '',
                    })
                  }
                }}
                className="cursor-pointer appearance-none rounded-full border border-white/15 bg-[#202027] py-1.5 pl-3 pr-7 text-[11px] font-bold text-[#f6f3ec] outline-none transition hover:border-white/35 focus:border-[#e5a93c] sm:py-2 sm:pl-4 sm:pr-9 sm:text-xs"
              >
                {MODES.map((m) => (
                  <option key={m.id} value={m.id} className="bg-[#18181d] text-[#f6f3ec]">
                    {m.icon} {m.name}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-2.5 text-[10px] text-white/60 sm:right-3.5">▾</span>
            </div>

            <button
              onClick={() => void onDownload()}
              disabled={exportBusy || filledCount < layout.slots}
              title={
                filledCount < layout.slots
                  ? `Add ${layout.slots - filledCount} more photo(s) first`
                  : 'Download high-resolution 2× PNG strip'
              }
              className="inline-flex items-center gap-1.5 rounded-full bg-[#f5efe6] px-3.5 py-1.5 text-[11px] font-extrabold text-[#141416] shadow-[0_10px_25px_-8px_rgba(245,239,230,0.45)] transition hover:-translate-y-0.5 hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 sm:gap-2 sm:px-5 sm:py-2 sm:text-xs"
            >
              {exported ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600 sm:h-4 sm:w-4" />
                  <span>Saved PNG!</span>
                </>
              ) : (
                <>
                  <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span>{exportBusy ? 'Rendering…' : 'Download'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ── THREE-PANEL PROFESSIONAL EDITOR LAYOUT (Canvas First on Mobile) ── */}
        <div className="mt-4 grid min-w-0 items-start gap-4 sm:mt-5 sm:gap-5 lg:grid-cols-[96px_minmax(0,1fr)_390px] xl:grid-cols-[104px_minmax(0,1fr)_420px]">
          {/* 1. LEFT TOOL RAIL (Order 2 on Mobile so sits right under Canvas, Order 1 on Desktop) */}
          <nav
            aria-label="Editor tools"
            className="no-scrollbar order-2 flex min-w-0 gap-1.5 overflow-x-auto rounded-2xl border border-white/10 bg-[#17171c] p-1.5 lg:order-1 lg:flex-col lg:overflow-visible lg:p-2"
          >
            {TABS.map((t) => {
              const Icon = t.icon
              const active = tab === t.id
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`relative flex min-w-[66px] shrink-0 flex-col items-center justify-center gap-1 rounded-xl px-2 py-2.5 text-[11px] font-semibold transition lg:min-w-[74px] lg:gap-1.5 lg:py-3 ${
                    active
                      ? 'border border-[#e5a93c]/60 bg-[#23211d] text-[#f3cf85] shadow-sm'
                      : 'border border-transparent text-[#9c988f] hover:bg-white/[0.04] hover:text-white'
                  }`}
                >
                  {active && (
                    <span className="absolute inset-y-2.5 left-0 hidden w-1 rounded-r-full bg-[#e5a93c] lg:block" />
                  )}
                  <Icon className={`h-4 w-4 lg:h-5 lg:w-5 ${active ? 'text-[#e5a93c]' : ''}`} />
                  <span>{t.label}</span>
                </button>
              )
            })}
          </nav>

          {/* 2. CENTER PANEL: Large Central Photo Canvas Stage (Order 1 on Mobile) */}
          <section className="order-1 flex min-w-0 flex-col rounded-[22px] border border-white/10 bg-[#151519] p-3 shadow-2xl sm:rounded-[26px] sm:p-6 lg:order-2">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-1 sm:mb-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#9c988f]">
                  Live Canvas
                </span>
                <span className="rounded-full bg-white/[0.06] px-2.5 py-0.5 text-[10px] font-semibold text-[#d4d0c8]">
                  {frame.name} · {filter.name}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {stickers.length > 0 && (
                  <button
                    onClick={() => {
                      onStickers(() => [])
                      setSelectedId(null)
                      pushHistory({ stickers: [] })
                    }}
                    className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] font-semibold text-white/60 transition hover:border-white/25 hover:text-white"
                  >
                    Clear {stickers.length}
                  </button>
                )}
                <button
                  onClick={() => setTiltPreview((v) => !v)}
                  className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold transition ${
                    tiltPreview
                      ? 'border-[#e5a93c]/50 bg-[#e5a93c]/15 text-[#f3cf85]'
                      : 'border-white/10 bg-white/[0.03] text-white/65 hover:text-white'
                  }`}
                >
                  {tiltPreview ? '✦ Studio Tilt' : 'Flat View'}
                </button>
              </div>
            </div>

            <div
              onPointerDown={() => setSelectedId(null)}
              className="relative flex min-h-[340px] flex-1 items-center justify-center overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0d0d10] px-3 py-5 sm:min-h-[580px] sm:px-4 sm:py-8"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute h-72 w-72 rounded-full opacity-20 blur-[90px] sm:h-96 sm:w-96 sm:blur-[110px]"
                style={{
                  background: `radial-gradient(circle, ${mode.accentColor || '#e5a93c'} 0%, transparent 70%)`,
                }}
              />

              <div
                ref={wrapRef}
                onPointerDown={(e) => {
                  e.stopPropagation()
                  setSelectedId(null)
                }}
                style={{
                  transform: tiltPreview ? 'rotate(-2deg)' : undefined,
                }}
                className="relative mx-auto w-fit max-w-full transition-transform duration-300"
              >
                <canvas
                  ref={canvasRef}
                  className="block h-auto max-h-[52vh] w-auto max-w-full rounded-[10px] shadow-[0_32px_90px_-20px_rgba(0,0,0,0.85)] sm:max-h-[68vh]"
                />

                <div className="pointer-events-none absolute inset-0">
                  {stickers.map((s) => {
                    const isSelected = selectedId === s.id
                    const boxPx = Math.max(28, s.size * scale * (s.kind === 'text' ? 1.6 : 1.15))
                    const boxHeightPx = Math.max(28, s.size * scale * (s.kind === 'text' ? 0.85 : 1.15))
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onPointerDown={(e) => onStickerPointerDown(e, s)}
                        style={{
                          pointerEvents: 'auto',
                          left: `${s.x * 100}%`,
                          top: `${s.y * 100}%`,
                          width: `${boxPx}px`,
                          height: `${boxHeightPx}px`,
                          transform: `translate(-50%, -50%) rotate(${s.rot}deg)`,
                        }}
                        className={`group absolute cursor-grab touch-none select-none rounded-xl transition-shadow active:cursor-grabbing ${
                          isSelected
                            ? 'ring-2 ring-[#e5a93c] bg-[#e5a93c]/10 shadow-[0_0_0_4px_rgba(0,0,0,0.35)]'
                            : 'hover:ring-1 hover:ring-white/60'
                        }`}
                        aria-label={`Sticker ${s.emoji}`}
                      >
                        {isSelected && (
                          <span className="-right-2 -top-2 absolute flex h-4 w-4 items-center justify-center rounded-full bg-[#e5a93c] text-[9px] font-bold text-[#141416] shadow">
                            ✦
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {selected ? (
              <div className="anim-pop mt-3 flex flex-wrap items-center justify-between gap-2.5 rounded-2xl border border-[#e5a93c]/40 bg-[#1d1c18] px-3 py-2.5 sm:mt-4 sm:gap-3 sm:px-4 sm:py-3">
                <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                  <span className="rounded-lg bg-white/10 px-2.5 py-1 text-xs font-bold text-[#f3cf85]">
                    {selected.emoji}
                  </span>

                  <label className="flex items-center gap-2 text-xs font-semibold text-[#d4d0c8]">
                    <span>Size</span>
                    <input
                      type="range"
                      min={STICKER_MIN}
                      max={STICKER_MAX}
                      value={selected.size}
                      onChange={(e) => updateSelected({ size: Number(e.target.value) })}
                      onPointerUp={() => pushHistory({ stickers: latestStickersRef.current })}
                      className="w-20 accent-[#e5a93c] sm:w-24"
                    />
                  </label>

                  <label className="flex items-center gap-2 text-xs font-semibold text-[#d4d0c8]">
                    <span>Rotate</span>
                    <input
                      type="range"
                      min={-180}
                      max={180}
                      value={selected.rot}
                      onChange={(e) => updateSelected({ rot: Number(e.target.value) })}
                      onPointerUp={() => pushHistory({ stickers: latestStickersRef.current })}
                      className="w-20 accent-[#e5a93c] sm:w-24"
                    />
                    <button
                      onClick={() => updateSelected({ rot: 0 }, true)}
                      title="Reset rotation to 0°"
                      className="rounded bg-white/10 p-1 text-white/70 hover:text-white"
                    >
                      <RotateCcw className="h-3 w-3" />
                    </button>
                  </label>

                  {(selected.kind === 'doodle' || selected.kind === 'text') && (
                    <div className="flex items-center gap-1">
                      {TEXT_STICKER_COLORS.map((col) => (
                        <button
                          key={col}
                          onClick={() => updateSelected({ color: col }, true)}
                          className={`h-4 w-4 rounded-full border ${
                            selected.color === col ? 'scale-125 border-white' : 'border-black/40'
                          }`}
                          style={{ background: col }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    onClick={() => moveLayer(1)}
                    title="Bring forward"
                    className="inline-flex items-center gap-1 rounded-lg border border-white/15 bg-white/[0.06] px-2 py-1 text-[11px] font-semibold text-white hover:bg-white/15 sm:px-2.5 sm:py-1.5 sm:text-xs"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                    <span>Up</span>
                  </button>
                  <button
                    onClick={() => moveLayer(-1)}
                    title="Send backward"
                    className="inline-flex items-center gap-1 rounded-lg border border-white/15 bg-white/[0.06] px-2 py-1 text-[11px] font-semibold text-white hover:bg-white/15 sm:px-2.5 sm:py-1.5 sm:text-xs"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                    <span>Down</span>
                  </button>
                  <button
                    onClick={() => {
                      const copy: Sticker = {
                        ...selected,
                        id: crypto.randomUUID(),
                        x: clamp(selected.x + 0.05, 0.04, 0.96),
                        y: clamp(selected.y + 0.05, 0.04, 0.96),
                      }
                      onStickers((prev) => {
                        const next = [...prev, copy]
                        pushHistory({ stickers: next })
                        return next
                      })
                      setSelectedId(copy.id)
                    }}
                    className="inline-flex items-center gap-1 rounded-lg border border-white/15 bg-white/[0.06] px-2 py-1 text-[11px] font-semibold text-white hover:bg-white/15 sm:px-2.5 sm:py-1.5 sm:text-xs"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy</span>
                  </button>
                  <button
                    onClick={() => {
                      onStickers((prev) => {
                        const next = prev.filter((s) => s.id !== selected.id)
                        pushHistory({ stickers: next })
                        return next
                      })
                      setSelectedId(null)
                    }}
                    className="inline-flex items-center gap-1 rounded-lg bg-red-500/90 px-2 py-1 text-[11px] font-semibold text-white hover:bg-red-500 sm:px-2.5 sm:py-1.5 sm:text-xs"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 px-1 text-[11px] text-[#7c7870]">
                <span>Tip: Tap any sticker on the strip to drag, resize, rotate, or layer it.</span>
                <span className="hidden sm:inline">2× High-DPI PNG Export</span>
              </div>
            )}
          </section>

          {/* 3. RIGHT PANEL: Contextual Customization Controls (Order 3) */}
          <aside className="order-3 min-w-0 rounded-[22px] border border-white/10 bg-[#17171c] p-4 shadow-2xl sm:rounded-[26px] sm:p-5">
            {tab === 'stickers' && (
              <div className="flex min-w-0 flex-col">
                <div className="studio-scroll flex items-center gap-1 overflow-x-auto border-b border-white/10 pb-3">
                  {STICKER_FILTER_TABS.map((c) => {
                    const active = c.id === activeCat
                    return (
                      <button
                        key={c.id}
                        onClick={() => setActiveCat(c.id)}
                        className={`relative shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                          active
                            ? 'bg-[#26262f] text-[#f3cf85]'
                            : 'text-[#9c988f] hover:bg-white/[0.04] hover:text-white'
                        }`}
                      >
                        {c.name}
                        {active && (
                          <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-[#e5a93c]" />
                        )}
                      </button>
                    )
                  })}
                </div>

                <div className="studio-scroll mt-4 max-h-[340px] space-y-4 overflow-y-auto pr-1">
                  {visibleDoodles.length > 0 && (
                    <div>
                      <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[#8e8a82]">
                        Studio Doodles & Badges
                      </p>
                      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                        {visibleDoodles.map((d) => (
                          <button
                            key={d.id}
                            onClick={() =>
                              addStickerItem({
                                emoji: d.preview,
                                kind: 'doodle',
                                doodleId: d.id,
                              })
                            }
                            title={`Add ${d.name}`}
                            className="flex h-14 flex-col items-center justify-center rounded-xl border border-white/10 bg-[#1f1f26] px-1.5 text-center transition hover:-translate-y-0.5 hover:border-[#e5a93c]/60 hover:bg-[#272730]"
                          >
                            <span
                              className={`font-bold leading-tight text-[#faf8f5] ${
                                d.preview.length > 3 ? 'text-[10px]' : 'text-xl'
                              }`}
                              style={
                                d.id.includes('script') || d.id === 'good-vibes'
                                  ? { fontFamily: 'var(--font-hand)', fontSize: '14px', color: '#f3cf85' }
                                  : undefined
                              }
                            >
                              {d.preview}
                            </span>
                            <span className="mt-0.5 max-w-full truncate text-[9px] text-[#8e8a82]">{d.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[#8e8a82]">
                      Emojis & Icons
                    </p>
                    <div className="grid grid-cols-5 gap-2 sm:grid-cols-6">
                      {visibleEmojis.map((e, i) => (
                        <button
                          key={`${e}-${i}`}
                          onClick={() => addStickerItem({ emoji: e, kind: 'emoji' })}
                          title={`Add ${e} sticker`}
                          className="flex h-11 items-center justify-center rounded-xl border border-white/10 bg-[#1f1f26] text-xl transition hover:-translate-y-0.5 hover:border-[#e5a93c]/60 hover:bg-[#272730] sm:h-12 sm:text-2xl"
                        >
                          {e}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-5 border-t border-white/10 pt-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="text-xs font-bold text-[#faf8f5]">Text Sticker</label>
                    <div className="flex items-center gap-1">
                      {(
                        [
                          { id: 'hand', label: 'Script' },
                          { id: 'bubble', label: 'Bubble' },
                          { id: 'badge', label: 'Badge' },
                          { id: 'outline', label: 'Bold' },
                        ] as const
                      ).map((st) => (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => setCustomTextStyle(st.id)}
                          className={`rounded-md px-2 py-0.5 text-[10px] font-semibold transition ${
                            customTextStyle === st.id
                              ? 'bg-[#e5a93c] text-[#141416]'
                              : 'bg-white/[0.06] text-[#a8a49c] hover:text-white'
                          }`}
                        >
                          {st.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-2.5 flex items-center gap-2">
                    <input
                      value={customTextInput}
                      onChange={(e) => setCustomTextInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addCustomTextSticker()
                        }
                      }}
                      maxLength={32}
                      placeholder="Add text (e.g. Good Vibes, Seoul ’26)…"
                      className="min-w-0 flex-1 rounded-xl border border-white/15 bg-[#121215] px-3.5 py-2.5 text-xs text-[#faf8f5] placeholder-[#7c7870] outline-none transition focus:border-[#e5a93c]"
                    />
                    <button
                      type="button"
                      onClick={addCustomTextSticker}
                      aria-label="Add text sticker"
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-[#23232b] text-white transition hover:border-[#e5a93c] hover:bg-[#e5a93c] hover:text-[#141416]"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-2 flex items-center gap-1.5">
                    {TEXT_STICKER_COLORS.map((col) => (
                      <button
                        key={col}
                        type="button"
                        onClick={() => setCustomTextColor(col)}
                        className={`h-4 w-4 rounded-full border transition ${
                          customTextColor === col ? 'scale-110 border-white ring-1 ring-white' : 'border-black/40'
                        }`}
                        style={{ background: col }}
                      />
                    ))}
                  </div>
                </div>

                <div className="mt-5 border-t border-white/10 pt-4">
                  <p className="text-xs font-bold text-[#faf8f5]">Recent</p>
                  <div className="mt-2.5 flex flex-wrap items-center gap-2">
                    {recentStickers.map((r, idx) => (
                      <button
                        key={`${r.label}-${idx}`}
                        onClick={() =>
                          addStickerItem({
                            emoji: r.emoji,
                            kind: r.kind,
                            doodleId: r.doodleId,
                          })
                        }
                        className="flex h-10 min-w-[40px] items-center justify-center rounded-xl border border-white/10 bg-[#1f1f26] px-2.5 text-sm font-bold text-[#faf8f5] transition hover:border-[#e5a93c]/60 hover:bg-[#272730]"
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {tab === 'layout' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-[#faf8f5]">Strip & Collage Layouts</h3>
                  <p className="mt-0.5 text-xs text-[#9c988f]">
                    Switch between vertical photo strips and multi-column contact collages.
                  </p>
                </div>

                <div className="grid gap-2.5">
                  {LAYOUTS.map((l) => {
                    const active = l.id === layoutId
                    return (
                      <button
                        key={l.id}
                        onClick={() => {
                          onLayout(l.id)
                          pushHistory({ layoutId: l.id })
                        }}
                        className={`flex items-center gap-4 rounded-2xl border p-3.5 text-left transition ${
                          active
                            ? 'border-[#e5a93c] bg-[#e5a93c]/10 ring-1 ring-[#e5a93c]'
                            : 'border-white/10 bg-[#1f1f26] hover:border-white/25'
                        }`}
                      >
                        <span
                          className="grid shrink-0 gap-1 rounded-lg bg-[#121215] p-2"
                          style={{ gridTemplateColumns: `repeat(${l.cols}, 1fr)` }}
                        >
                          {Array.from({ length: l.cols * l.rows }).map((_, i) => (
                            <span
                              key={i}
                              className={`block h-3.5 w-3 rounded-[2px] ${
                                active ? 'bg-[#e5a93c]' : 'bg-white/35'
                              }`}
                            />
                          ))}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-bold text-[#faf8f5]">{l.name}</span>
                          <span className="block text-xs text-[#9c988f]">
                            {l.hint} · {l.slots} photos
                          </span>
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {tab === 'frame' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-[#faf8f5]">Strip Frames & Borders</h3>
                  <p className="mt-0.5 text-xs text-[#9c988f]">
                    Includes {mode.name} signature frames plus full studio archive.
                  </p>
                </div>

                <div className="studio-scroll grid max-h-[520px] grid-cols-2 gap-2.5 overflow-y-auto pr-1">
                  {FRAMES.map((f) => {
                    const active = f.id === frame.id
                    const isModeRec = mode.frames.includes(f.id)
                    return (
                      <button
                        key={f.id}
                        onClick={() => {
                          onFrame(f.id)
                          setCustomBg('')
                          pushHistory({ frameId: f.id, customBg: '' })
                        }}
                        className={`group relative min-w-0 rounded-2xl border p-2.5 text-left transition ${
                          active
                            ? 'border-[#e5a93c] bg-[#24221d] ring-1 ring-[#e5a93c]'
                            : 'border-white/10 bg-[#1f1f26] hover:border-white/25'
                        }`}
                      >
                        <span
                          className="relative block h-16 w-full overflow-hidden rounded-xl border border-black/20"
                          style={{ background: f.bg }}
                        >
                          <span
                            className="absolute inset-x-3 top-2.5 bottom-4 rounded-md border"
                            style={{ borderColor: `${f.fg}33`, background: `${f.fg}12` }}
                          />
                          {isModeRec && (
                            <span className="absolute right-1.5 top-1.5 rounded bg-black/65 px-1.5 py-0.5 text-[9px] font-bold text-[#f3cf85]">
                              ✦ Mode
                            </span>
                          )}
                        </span>
                        <span className="mt-2 block truncate px-0.5 text-xs font-bold text-[#faf8f5]">
                          {f.name}
                        </span>
                        <span className="block truncate px-0.5 text-[10px] capitalize text-[#9c988f]">
                          {f.style} aesthetic
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {tab === 'filter' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-[#faf8f5]">Color Grading & Film Stocks</h3>
                  <p className="mt-0.5 text-xs text-[#9c988f]">
                    Applied non-destructively to every photo on your strip.
                  </p>
                </div>

                <div className="studio-scroll grid max-h-[520px] grid-cols-2 gap-2.5 overflow-y-auto pr-1">
                  {FILTERS.map((f) => {
                    const active = f.id === filter.id
                    return (
                      <button
                        key={f.id}
                        onClick={() => {
                          onFilter(f.id)
                          pushHistory({ filterId: f.id })
                        }}
                        className={`group min-w-0 overflow-hidden rounded-2xl border p-2 text-left transition ${
                          active
                            ? 'border-[#e5a93c] bg-[#24221d] ring-1 ring-[#e5a93c]'
                            : 'border-white/10 bg-[#1f1f26] hover:border-white/25'
                        }`}
                      >
                        <div className="aspect-[16/10] w-full overflow-hidden rounded-xl bg-black">
                          <img
                            src={samplePreviewShot}
                            alt={`SnapStudio ${f.name} photo filter preset preview`}
                            width={160}
                            height={100}
                            loading="lazy"
                            decoding="async"
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                            style={{ filter: f.css || undefined }}
                          />
                        </div>
                        <span className="mt-2 block truncate px-1 text-xs font-bold text-[#faf8f5]">
                          {f.name}
                        </span>
                        <span className="block truncate px-1 text-[10px] text-[#9c988f]">
                          {f.hint}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {tab === 'text' && (
              <div className="space-y-5">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#9c988f]">
                    Strip Footer Caption
                  </label>
                  <input
                    value={caption}
                    onChange={(e) => onCaption(e.target.value)}
                    onBlur={() => pushHistory({ caption })}
                    maxLength={80}
                    placeholder="Write a caption for the strip footer…"
                    className="mt-2 w-full rounded-xl border border-white/15 bg-[#121215] px-4 py-3 text-sm text-[#faf8f5] placeholder-[#7c7870] outline-none transition focus:border-[#e5a93c]"
                  />
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {mode.captions.map((c) => (
                      <button
                        key={c}
                        onClick={() => {
                          onCaption(c)
                          pushHistory({ caption: c })
                        }}
                        className="rounded-full border border-dashed border-white/20 bg-white/[0.03] px-3 py-1 text-xs text-[#c7c2b8] transition hover:border-[#e5a93c] hover:text-white"
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#9c988f]">
                    Typography Style
                  </label>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {(
                      [
                        { id: 'hand', label: 'Handwritten', family: '"Caveat", cursive', size: 'text-lg' },
                        { id: 'clean', label: 'Clean Sans', family: '"Space Grotesk", sans-serif', size: 'text-xs font-bold' },
                        { id: 'serif', label: 'Editorial Serif', family: '"Instrument Serif", serif', size: 'text-base italic' },
                        { id: 'pixel', label: 'Arcade Pixel', family: '"Silkscreen", monospace', size: 'text-[11px] font-bold' },
                      ] as const
                    ).map((f) => (
                      <button
                        key={f.id}
                        onClick={() => {
                          onFont(f.id)
                          pushHistory({ fontId: f.id })
                        }}
                        style={{ fontFamily: f.family }}
                        className={`rounded-xl border px-3 py-3 text-center transition ${f.size} ${
                          fontId === f.id
                            ? 'border-[#e5a93c] bg-[#e5a93c]/15 text-[#f3cf85]'
                            : 'border-white/10 bg-[#1f1f26] text-white/80 hover:border-white/25'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 rounded-2xl border border-white/10 bg-[#1f1f26] p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-[#faf8f5]">Date Stamp</p>
                      <p className="text-[11px] text-[#9c988f]">Print archival date on footer</p>
                    </div>
                    <button
                      role="switch"
                      aria-checked={dateOn}
                      onClick={() => {
                        const next = !dateOn
                        onDateOn(next)
                        pushHistory({ dateOn: next })
                      }}
                      className={`relative h-6 w-11 rounded-full transition ${
                        dateOn ? 'bg-[#e5a93c]' : 'bg-white/20'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 h-5 w-5 rounded-full bg-[#141416] shadow transition-all ${
                          dateOn ? 'left-5.5' : 'left-0.5'
                        }`}
                      />
                    </button>
                  </div>

                  {dateOn && onDateStr && (
                    <input
                      value={dateStr}
                      onChange={(e) => onDateStr(e.target.value)}
                      maxLength={24}
                      placeholder="e.g. OCT 29, 2026"
                      className="w-full rounded-lg border border-white/15 bg-[#121215] px-3 py-1.5 font-mono text-xs text-[#faf8f5] outline-none focus:border-[#e5a93c]"
                    />
                  )}
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#1f1f26] p-4">
                  <div>
                    <p className="text-xs font-bold text-[#faf8f5]">Studio Barcode Stamp</p>
                    <p className="text-[11px] text-[#9c988f]">Authentic studio booth barcode</p>
                  </div>
                  <button
                    role="switch"
                    aria-checked={showBarcode}
                    onClick={() => {
                      const next = !showBarcode
                      setShowBarcode(next)
                      pushHistory({ showBarcode: next })
                    }}
                    className={`relative h-6 w-11 rounded-full transition ${
                      showBarcode ? 'bg-[#e5a93c]' : 'bg-white/20'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-[#141416] shadow transition-all ${
                        showBarcode ? 'left-5.5' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}

            {tab === 'background' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-bold text-[#faf8f5]">Strip Backdrop & Grain</h3>
                  <p className="mt-0.5 text-xs text-[#9c988f]">
                    Override the frame background color or add analog paper grain.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {BACKGROUND_PRESETS.map((b) => {
                    const active = customBg === b.bg
                    return (
                      <button
                        key={b.id}
                        onClick={() => {
                          setCustomBg(b.bg)
                          if (b.grain !== undefined) setShowGrain(Boolean(b.grain))
                          pushHistory({ customBg: b.bg, showGrain: Boolean(b.grain) })
                        }}
                        className={`flex min-w-0 items-center gap-2.5 rounded-xl border p-2.5 text-left transition ${
                          active
                            ? 'border-[#e5a93c] bg-[#24221d] ring-1 ring-[#e5a93c]'
                            : 'border-white/10 bg-[#1f1f26] hover:border-white/25'
                        }`}
                      >
                        <span
                          className="h-6 w-6 shrink-0 rounded-full border border-white/25 shadow-inner"
                          style={{ background: b.bg || frame.bg }}
                        />
                        <span className="truncate text-xs font-semibold text-[#faf8f5]">{b.name}</span>
                      </button>
                    )
                  })}
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#1f1f26] p-4">
                  <div>
                    <p className="text-xs font-bold text-[#faf8f5]">Custom Color Picker</p>
                    <p className="text-[11px] text-[#9c988f]">Any custom studio tint</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={customBg || frame.bg}
                      onChange={(e) => {
                        setCustomBg(e.target.value)
                        pushHistory({ customBg: e.target.value })
                      }}
                      className="h-8 w-12 cursor-pointer rounded border border-white/20 bg-transparent"
                    />
                    {customBg && (
                      <button
                        onClick={() => {
                          setCustomBg('')
                          pushHistory({ customBg: '' })
                        }}
                        className="text-xs text-[#e5a93c] hover:underline"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#1f1f26] p-4">
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="h-4 w-4 text-[#e5a93c]" />
                    <div>
                      <p className="text-xs font-bold text-[#faf8f5]">35mm Film Grain</p>
                      <p className="text-[11px] text-[#9c988f]">Subtle analog texture overlay</p>
                    </div>
                  </div>
                  <button
                    role="switch"
                    aria-checked={showGrain}
                    onClick={() => {
                      const next = !showGrain
                      setShowGrain(next)
                      pushHistory({ showGrain: next })
                    }}
                    className={`relative h-6 w-11 rounded-full transition ${
                      showGrain ? 'bg-[#e5a93c]' : 'bg-white/20'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-[#141416] shadow transition-all ${
                        showGrain ? 'left-5.5' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  )
}
