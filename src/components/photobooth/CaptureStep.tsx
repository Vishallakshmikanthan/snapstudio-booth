// ─── Capture Studio: Dark studio 3-column layout, live webcam, viewfinder brackets, countdown, multi-shot, uploads & sample sets ───
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  FILTERS,
  LAYOUTS,
  MODES,
  SAMPLE_PHOTO_SETS,
  type FilterDef,
  type LayoutDef,
  type LayoutId,
  type Mode,
} from '@/lib/photobooth/data'
import {
  Camera,
  FlipHorizontal,
  Grid,
  ImagePlus,
  Layers,
  Palette,
  RefreshCw,
  Sliders,
  Sparkles,
  Smile,
  Type,
  Upload,
  X,
} from 'lucide-react'

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

interface Props {
  layout: LayoutDef
  shots: (string | null)[]
  onShots: (update: (prev: (string | null)[]) => (string | null)[]) => void
  onLayout: (id: LayoutId) => void
  onContinue: () => void
  onGoEdit?: (initialTab?: 'layout' | 'frame' | 'filter' | 'stickers' | 'text' | 'background') => void
  mode?: Mode
  onMode?: (mode: Mode) => void
  filter?: FilterDef
  onFilter?: (id: string) => void
}

export default function CaptureStep({
  layout,
  shots,
  onShots,
  onLayout,
  onContinue,
  onGoEdit,
  mode = MODES[0]!,
  onMode,
  filter = FILTERS[0]!,
  onFilter,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const slotFileRef = useRef<HTMLInputElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const aliveRef = useRef(true)

  const [camState, setCamState] = useState<'starting' | 'ready' | 'error'>('starting')
  const [camError, setCamError] = useState('')
  const [mirror, setMirror] = useState(true)
  const [count, setCount] = useState<number | null>(null)
  const [flash, setFlash] = useState(false)
  const [busy, setBusy] = useState(false)
  const [activeSubPanel, setActiveSubPanel] = useState<'none' | 'layout' | 'filters'>('none')
  const [uploadTargetSlot, setUploadTargetSlot] = useState<number | null>(null)
  const [countdownSec, setCountdownSec] = useState<3 | 5>(3)

  const startCamera = useCallback(async () => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    setCamState('starting')
    setCamError('')
    try {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
        throw new Error('MediaDevices unavailable')
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 960 }, facingMode: 'user' },
        audio: false,
      })
      if (!aliveRef.current) {
        stream.getTracks().forEach((t) => t.stop())
        return
      }
      streamRef.current = stream
      const v = videoRef.current
      if (v) {
        v.srcObject = stream
        await v.play().catch(() => {})
      }
      setCamState('ready')
    } catch (e) {
      if (!aliveRef.current) return
      setCamState('error')
      const name = (e as DOMException)?.name
      if (name === 'NotAllowedError' || name === 'SecurityError') {
        setCamError(
          'Camera access was declined. Allow camera permission in your browser, or upload photos / load studio sample shots below.',
        )
      } else if (name === 'NotFoundError' || name === 'OverconstrainedError') {
        setCamError('No camera was found on this device. Build your strip with uploaded photos or studio sample shots.')
      } else {
        setCamError('Camera preview unavailable right now. Upload photos from your device or load studio sample shots below.')
      }
    }
  }, [])

  useEffect(() => {
    aliveRef.current = true
    void startCamera()
    return () => {
      aliveRef.current = false
      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
  }, [startCamera])

  const grabShot = useCallback((): string | null => {
    const video = videoRef.current
    if (!video || !video.videoWidth) return null
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    if (mirror) {
      ctx.translate(canvas.width, 0)
      ctx.scale(-1, 1)
    }
    ctx.drawImage(video, 0, 0)
    return canvas.toDataURL('image/jpeg', 0.92)
  }, [mirror])

  const runSequence = useCallback(
    async (indices: number[]) => {
      if (!indices.length || camState !== 'ready' || busy) return
      setBusy(true)
      for (const idx of indices) {
        for (let c = countdownSec; c >= 1; c--) {
          setCount(c)
          await sleep(720)
        }
        setCount(null)
        setFlash(true)
        window.setTimeout(() => setFlash(false), 400)
        const src = grabShot()
        if (src) {
          onShots((prev) => {
            const next = [...prev]
            if (idx < next.length) next[idx] = src
            return next
          })
        }
        await sleep(420)
      }
      setBusy(false)
    },
    [busy, camState, countdownSec, grabShot, onShots],
  )

  const emptySlots = shots
    .slice(0, layout.slots)
    .map((s, i) => (s ? null : i))
    .filter((i): i is number => i !== null)
  const filled = shots.slice(0, layout.slots).filter(Boolean).length
  const complete = filled >= layout.slots

  const onUpload = async (files: FileList | null, targetIndex: number | null = null) => {
    if (!files || !files.length) return
    const urls: string[] = []
    for (const f of Array.from(files).slice(0, 12)) {
      try {
        const url = await new Promise<string>((res, rej) => {
          const r = new FileReader()
          r.onload = () => res(String(r.result))
          r.onerror = () => rej(new Error('read failed'))
          r.readAsDataURL(f)
        })
        urls.push(url)
      } catch {
        /* skip unreadable file */
      }
    }
    if (!urls.length) return

    onShots((prev) => {
      const next = [...prev]
      while (next.length < layout.slots) next.push(null)
      if (targetIndex !== null && targetIndex < next.length) {
        next[targetIndex] = urls[0]!
        return next
      }
      let ui = 0
      for (let i = 0; i < layout.slots && ui < urls.length; i++) {
        if (!next[i]) next[i] = urls[ui++]!
      }
      let ri = 0
      while (ui < urls.length && layout.slots > 0) {
        next[ri % layout.slots] = urls[ui++]!
        ri++
      }
      return next
    })
    if (fileRef.current) fileRef.current.value = ''
    if (slotFileRef.current) slotFileRef.current.value = ''
    setUploadTargetSlot(null)
  }

  const loadSampleSet = (setIndex = 0) => {
    const sample = SAMPLE_PHOTO_SETS[setIndex % SAMPLE_PHOTO_SETS.length]!
    onShots(() =>
      Array.from({ length: layout.slots }, (_, idx) => sample.shots[idx % sample.shots.length] ?? null),
    )
  }

  const handleShutterClick = () => {
    if (camState !== 'ready' || busy) return
    if (emptySlots.length > 0) {
      void runSequence(emptySlots)
    } else {
      void runSequence(Array.from({ length: layout.slots }, (_, i) => i))
    }
  }

  const handleRailAction = (target: 'layout' | 'filters' | 'stickers' | 'text' | 'background') => {
    if (target === 'layout') {
      setActiveSubPanel((prev) => (prev === 'layout' ? 'none' : 'layout'))
      return
    }
    if (target === 'filters') {
      setActiveSubPanel((prev) => (prev === 'filters' ? 'none' : 'filters'))
      return
    }
    if (complete && onGoEdit) {
      onGoEdit(target === 'stickers' ? 'stickers' : target === 'text' ? 'text' : 'background')
    } else if (onGoEdit) {
      loadSampleSet(0)
      window.setTimeout(() => {
        onGoEdit(target === 'stickers' ? 'stickers' : target === 'text' ? 'text' : 'background')
      }, 60)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] w-full max-w-full overflow-x-hidden bg-[#111114] text-[#f6f3ec]">
      <div className="mx-auto w-full max-w-[1440px] px-3 pb-14 pt-4 sm:px-6 sm:pt-5">
        {/* Top Studio Sub-Header Bar */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2.5 rounded-2xl border border-white/10 bg-[#17171c] px-3.5 py-2.5 sm:mb-5 sm:px-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#e5a93c]">
              <Camera className="h-3.5 w-3.5" />
              <span>03 · Capture Studio</span>
            </span>
            <span className="hidden text-white/20 sm:inline">|</span>
            <span className="text-xs text-[#a8a49c]">
              {layout.shortName} ({filled}/{layout.slots})
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onMode && (
              <div className="relative flex items-center">
                <select
                  aria-label="Select photo mode"
                  value={mode.id}
                  onChange={(e) => {
                    const picked = MODES.find((m) => m.id === e.target.value)
                    if (picked) onMode(picked)
                  }}
                  className="cursor-pointer appearance-none rounded-full border border-white/15 bg-[#202027] py-1.5 pl-3 pr-7 text-xs font-semibold text-[#f6f3ec] outline-none transition hover:border-white/30 focus:border-[#e5a93c]"
                >
                  {MODES.map((m) => (
                    <option key={m.id} value={m.id} className="bg-[#18181d] text-[#f6f3ec]">
                      {m.icon} {m.name}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-2.5 text-[10px] text-white/60">▾</span>
              </div>
            )}

            <button
              onClick={() => setCountdownSec((s) => (s === 3 ? 5 : 3))}
              disabled={busy}
              title="Toggle countdown timer duration"
              className="rounded-full border border-white/15 bg-[#202027] px-2.5 py-1.5 text-xs font-semibold text-[#d4d0c8] transition hover:border-white/30 hover:text-white"
            >
              ⏱ {countdownSec}s
            </button>

            <button
              onClick={() => loadSampleSet(0)}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#e5a93c]/40 bg-[#e5a93c]/10 px-3 py-1.5 text-xs font-semibold text-[#f3cf85] transition hover:bg-[#e5a93c]/20"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Demo Shots</span>
            </button>
          </div>
        </div>

        {/* Main 3-Column Studio Grid (Camera First on Mobile) */}
        <div className="grid min-w-0 items-start gap-4 sm:gap-6 lg:grid-cols-[190px_minmax(0,1fr)_310px]">
          {/* ── LEFT TOOL RAIL (Order 2 on mobile, Order 1 on desktop) ── */}
          <aside className="no-scrollbar order-2 flex min-w-0 gap-1.5 overflow-x-auto rounded-2xl border border-white/10 bg-[#17171c] p-2 lg:order-1 lg:flex-col lg:gap-2 lg:overflow-visible lg:p-2.5">
            <button
              onClick={() => setActiveSubPanel('none')}
              className={`relative flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-bold transition lg:gap-3 lg:px-3.5 lg:py-3 ${
                activeSubPanel === 'none'
                  ? 'bg-[#23232b] text-[#faf8f5]'
                  : 'text-[#a8a49c] hover:bg-white/[0.04] hover:text-white'
              }`}
            >
              {activeSubPanel === 'none' && (
                <span className="absolute inset-y-2 left-0 hidden w-1 rounded-r-full bg-[#e5a93c] lg:block" />
              )}
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#e5a93c] text-[#141416] lg:h-7 lg:w-7">
                <Camera className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
              </span>
              <span>Capture</span>
            </button>

            <button
              onClick={() => handleRailAction('layout')}
              className={`relative flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-semibold transition lg:gap-3 lg:px-3.5 lg:py-3 ${
                activeSubPanel === 'layout'
                  ? 'bg-[#23232b] text-[#faf8f5]'
                  : 'text-[#a8a49c] hover:bg-white/[0.04] hover:text-white'
              }`}
            >
              {activeSubPanel === 'layout' && (
                <span className="absolute inset-y-2 left-0 hidden w-1 rounded-r-full bg-[#e5a93c] lg:block" />
              )}
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] lg:h-7 lg:w-7">
                <Grid className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
              </span>
              <div>
                <span className="block">Layout</span>
                <span className="hidden text-[10px] text-white/45 lg:block">{layout.shortName}</span>
              </div>
            </button>

            <button
              onClick={() => handleRailAction('filters')}
              className={`relative flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-semibold transition lg:gap-3 lg:px-3.5 lg:py-3 ${
                activeSubPanel === 'filters'
                  ? 'bg-[#23232b] text-[#faf8f5]'
                  : 'text-[#a8a49c] hover:bg-white/[0.04] hover:text-white'
              }`}
            >
              {activeSubPanel === 'filters' && (
                <span className="absolute inset-y-2 left-0 hidden w-1 rounded-r-full bg-[#e5a93c] lg:block" />
              )}
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] lg:h-7 lg:w-7">
                <Sliders className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
              </span>
              <div>
                <span className="block">Filters</span>
                <span className="hidden text-[10px] text-white/45 lg:block">{filter.name}</span>
              </div>
            </button>

            <button
              onClick={() => handleRailAction('stickers')}
              className="flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-[#a8a49c] transition hover:bg-white/[0.04] hover:text-white lg:gap-3 lg:px-3.5 lg:py-3"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] lg:h-7 lg:w-7">
                <Smile className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
              </span>
              <span>Stickers</span>
            </button>

            <button
              onClick={() => handleRailAction('text')}
              className="flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-[#a8a49c] transition hover:bg-white/[0.04] hover:text-white lg:gap-3 lg:px-3.5 lg:py-3"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] lg:h-7 lg:w-7">
                <Type className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
              </span>
              <span>Text</span>
            </button>

            <button
              onClick={() => handleRailAction('background')}
              className="flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-[#a8a49c] transition hover:bg-white/[0.04] hover:text-white lg:gap-3 lg:px-3.5 lg:py-3"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] lg:h-7 lg:w-7">
                <Palette className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
              </span>
              <span>Background</span>
            </button>

            <div className="mt-2 hidden border-t border-white/10 pt-3 lg:block">
              <p className="px-2 text-[10px] font-bold uppercase tracking-widest text-white/40">
                Sample Sessions
              </p>
              <div className="mt-2 space-y-1">
                {SAMPLE_PHOTO_SETS.map((set, idx) => (
                  <button
                    key={set.id}
                    onClick={() => loadSampleSet(idx)}
                    disabled={busy}
                    className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-[11px] font-medium text-[#c7c2b8] transition hover:bg-white/[0.06] hover:text-white"
                  >
                    <span>{set.name}</span>
                    <span className="text-[10px] text-[#e5a93c]">Load</span>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* ── CENTER CAMERA STAGE (Order 1 on mobile so camera is immediately at top) ── */}
          <section className="anim-pop order-1 flex min-w-0 flex-col lg:order-2">
            {activeSubPanel === 'layout' && (
              <div className="mb-4 rounded-2xl border border-white/10 bg-[#17171c] p-3.5 sm:p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#e5a93c]">
                    Choose Strip Layout
                  </span>
                  <button
                    onClick={() => setActiveSubPanel('none')}
                    className="text-xs text-white/50 hover:text-white"
                  >
                    Close ✕
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {LAYOUTS.map((l) => (
                    <button
                      key={l.id}
                      onClick={() => onLayout(l.id)}
                      disabled={busy}
                      className={`rounded-xl border px-3 py-2 text-left text-xs font-semibold transition ${
                        l.id === layout.id
                          ? 'border-[#e5a93c] bg-[#e5a93c]/15 text-white'
                          : 'border-white/10 bg-[#202027] text-white/75 hover:border-white/25'
                      }`}
                    >
                      <span className="block font-bold">{l.name}</span>
                      <span className="text-[10px] text-white/50">{l.slots} shots</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeSubPanel === 'filters' && onFilter && (
              <div className="mb-4 rounded-2xl border border-white/10 bg-[#17171c] p-3.5 sm:p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#e5a93c]">
                    Live Camera Filter Preview
                  </span>
                  <button
                    onClick={() => setActiveSubPanel('none')}
                    className="text-xs text-white/50 hover:text-white"
                  >
                    Close ✕
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {FILTERS.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => onFilter(f.id)}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                        f.id === filter.id
                          ? 'bg-[#faf8f5] text-[#141416]'
                          : 'border border-white/10 bg-[#202027] text-white/75 hover:border-white/30'
                      }`}
                    >
                      {f.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Camera Viewport Card */}
            <div className="overflow-hidden rounded-[22px] border border-white/10 bg-[#17171c] p-2.5 shadow-[0_25px_70px_-20px_rgba(0,0,0,0.75)] sm:rounded-[26px] sm:p-4">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[16px] bg-[#0e0e11] sm:rounded-[20px]">
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  autoPlay
                  className="h-full w-full object-cover transition-opacity duration-300"
                  style={{
                    transform: mirror ? 'scaleX(-1)' : undefined,
                    filter: filter.css || undefined,
                    opacity: camState === 'ready' ? 1 : 0,
                  }}
                />

                {/* Viewfinder Corner Brackets */}
                <div className="pointer-events-none absolute inset-4 sm:inset-7">
                  <div className="absolute left-0 top-0 h-5 w-5 border-l-2 border-t-2 border-white/50 sm:h-6 sm:w-6" />
                  <div className="absolute right-0 top-0 h-5 w-5 border-r-2 border-t-2 border-white/50 sm:h-6 sm:w-6" />
                  <div className="absolute bottom-0 left-0 h-5 w-5 border-b-2 border-l-2 border-white/50 sm:h-6 sm:w-6" />
                  <div className="absolute bottom-0 right-0 h-5 w-5 border-b-2 border-r-2 border-white/50 sm:h-6 sm:w-6" />
                </div>

                {/* Camera Starting / Fallback Overlay */}
                {camState !== 'ready' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-4 text-center sm:gap-4 sm:px-6">
                    {camState === 'starting' ? (
                      <>
                        <div className="h-9 w-9 animate-spin rounded-full border-2 border-white/20 border-t-[#e5a93c] sm:h-10 sm:w-10" />
                        <p className="text-xs text-[#a8a49c] sm:text-sm">Initializing studio camera…</p>
                      </>
                    ) : (
                      <div className="max-w-md rounded-2xl border border-white/10 bg-[#17171c]/95 p-4 shadow-2xl backdrop-blur-md sm:rounded-3xl sm:p-6">
                        <div className="mx-auto hidden h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.06] text-xl sm:flex">
                          📷
                        </div>
                        <h3 className="text-sm font-bold text-white sm:mt-2 sm:text-base">
                          No Live Camera Connected
                        </h3>
                        <p className="mt-1 text-[11px] leading-relaxed text-[#a8a49c] sm:text-xs">{camError}</p>
                        <div className="mt-3.5 flex flex-wrap items-center justify-center gap-2 sm:mt-5 sm:gap-2.5">
                          <button
                            onClick={() => void startCamera()}
                            className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/[0.06] px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-white/15 sm:px-4 sm:py-2 sm:text-xs"
                          >
                            <RefreshCw className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                            <span>Retry</span>
                          </button>
                          <button
                            onClick={() => fileRef.current?.click()}
                            className="inline-flex items-center gap-1.5 rounded-full bg-[#faf8f5] px-3.5 py-1.5 text-[11px] font-bold text-[#141416] transition hover:bg-white sm:px-4 sm:py-2 sm:text-xs"
                          >
                            <Upload className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                            <span>Upload</span>
                          </button>
                          <button
                            onClick={() => loadSampleSet(0)}
                            className="inline-flex items-center gap-1.5 rounded-full bg-[#e5a93c] px-3.5 py-1.5 text-[11px] font-bold text-[#141416] transition hover:bg-[#f0b84d] sm:px-4 sm:py-2 sm:text-xs"
                          >
                            <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                            <span>Demo Shots</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {camState === 'ready' && (
                  <div className="absolute left-6 top-6 flex items-center gap-2 sm:left-8 sm:top-8">
                    <div className="flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-md">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                      <span>Live</span>
                    </div>
                    {filter.id !== 'original' && (
                      <div className="rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-semibold text-[#f3cf85] backdrop-blur-md">
                        ✦ {filter.name}
                      </div>
                    )}
                  </div>
                )}

                {count !== null && (
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center bg-black/25 backdrop-blur-[1px]">
                    <span
                      key={count}
                      className="anim-pop text-[6rem] font-extrabold leading-none text-white drop-shadow-[0_8px_32px_rgba(0,0,0,0.65)] sm:text-[9rem]"
                    >
                      {count}
                    </span>
                    <span className="mt-2 text-lg font-medium tracking-wide text-white/90 drop-shadow sm:text-xl">
                      Get Ready!
                    </span>
                  </div>
                )}

                {flash && <div className="anim-flash pointer-events-none absolute inset-0 bg-white" />}
              </div>

              {/* ── Bottom Camera Control Dock ── */}
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2.5 px-1 pb-1 sm:mt-4 sm:gap-4 sm:px-2">
                <div className="flex items-center gap-0.5 rounded-xl border border-white/10 bg-[#111114] p-1 sm:gap-1">
                  {LAYOUTS.map((l) => {
                    const active = l.id === layout.id
                    const label =
                      l.id === 'strip2'
                        ? '2'
                        : l.id === 'strip4'
                          ? '4'
                          : l.id === 'strip6'
                            ? '6'
                            : l.id === 'grid4'
                              ? '2×2'
                              : '2×3'
                    return (
                      <button
                        key={l.id}
                        onClick={() => onLayout(l.id)}
                        disabled={busy}
                        title={l.name}
                        className={`min-w-[32px] rounded-lg px-2 py-1.5 text-[11px] font-bold transition sm:min-w-[36px] sm:px-2.5 sm:text-xs ${
                          active
                            ? 'bg-[#2a2a33] text-white shadow'
                            : 'text-[#8e8a82] hover:text-white'
                        }`}
                      >
                        {label}
                      </button>
                    )
                  })}
                </div>

                <div className="flex items-center gap-2.5 sm:gap-3">
                  <button
                    onClick={handleShutterClick}
                    disabled={camState !== 'ready' || busy}
                    aria-label={
                      busy
                        ? 'Capturing'
                        : emptySlots.length
                          ? `Capture ${emptySlots.length} shots`
                          : 'Retake all shots'
                    }
                    title={
                      emptySlots.length
                        ? `Capture ${emptySlots.length} shot(s)`
                        : 'All slots full — click to retake all'
                    }
                    className="group relative flex h-14 w-14 items-center justify-center rounded-full border-2 border-white/85 p-1.5 transition hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 sm:h-16 sm:w-16"
                  >
                    <span
                      className={`h-full w-full rounded-full transition ${
                        busy ? 'animate-pulse bg-[#e5a93c]' : 'bg-white group-hover:bg-[#faf8f5]'
                      }`}
                    />
                  </button>

                  <button
                    onClick={() => void runSequence(emptySlots)}
                    disabled={camState !== 'ready' || busy || !emptySlots.length}
                    className="hidden rounded-full bg-white/[0.08] px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/15 disabled:opacity-40 md:inline-block"
                  >
                    {busy
                      ? 'Capturing…'
                      : emptySlots.length
                        ? `Capture ${emptySlots.length} shot${emptySlots.length > 1 ? 's' : ''}`
                        : 'All shots taken'}
                  </button>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button
                    onClick={() => setMirror((m) => !m)}
                    disabled={busy}
                    title={`Mirror ${mirror ? 'On' : 'Off'}`}
                    className={`flex h-9 items-center gap-1.5 rounded-xl border px-2.5 text-xs font-semibold transition sm:h-10 sm:px-3 ${
                      mirror
                        ? 'border-[#e5a93c]/50 bg-[#e5a93c]/15 text-[#f3cf85]'
                        : 'border-white/10 bg-[#111114] text-[#a8a49c] hover:text-white'
                    }`}
                  >
                    <FlipHorizontal className="h-4 w-4" />
                    <span className="hidden sm:inline">Mirror {mirror ? 'On' : 'Off'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setUploadTargetSlot(null)
                      fileRef.current?.click()
                    }}
                    disabled={busy}
                    className="flex h-9 items-center gap-1.5 rounded-xl border border-white/15 bg-[#111114] px-3 text-xs font-semibold text-[#f6f3ec] transition hover:border-white/35 hover:bg-white/[0.06] sm:h-10 sm:px-3.5"
                  >
                    <Upload className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span>Upload</span>
                  </button>

                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => void onUpload(e.target.files, null)}
                  />
                  <input
                    ref={slotFileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => void onUpload(e.target.files, uploadTargetSlot)}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* ── RIGHT COLUMN: CAPTURED SHOT STACK (Order 3) ── */}
          <aside className="anim-fade-up order-3 flex min-w-0 flex-col gap-4">
            <div className="rounded-[24px] border border-white/10 bg-[#17171c] p-4 shadow-xl">
              <div className="flex items-baseline justify-between">
                <h2 className="text-sm font-bold text-[#faf8f5]">Your Strip Shots</h2>
                <span className="font-mono text-xs font-semibold text-[#e5a93c]">
                  {filled} / {layout.slots}
                </span>
              </div>

              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-[#e5a93c] transition-all duration-500"
                  style={{ width: `${(filled / layout.slots) * 100}%` }}
                />
              </div>

              <div
                className={`mt-4 grid gap-2.5 ${
                  layout.slots <= 4 ? 'grid-cols-2 lg:grid-cols-1' : 'grid-cols-2'
                }`}
              >
                {Array.from({ length: layout.slots }).map((_, i) => {
                  const shot = shots[i]
                  return (
                    <div
                      key={i}
                      className="group relative overflow-hidden rounded-xl border border-white/10 bg-[#111114]"
                    >
                      {shot ? (
                        <div className="relative">
                          <img
                            src={shot}
                            alt={`Shot ${i + 1}`}
                            className={`w-full object-cover ${
                              layout.slots <= 4 ? 'aspect-[16/10]' : 'aspect-[4/3]'
                            }`}
                            style={{ filter: filter.css || undefined }}
                          />
                          <span className="absolute left-2 top-2 rounded bg-black/60 px-1.5 py-0.5 font-mono text-[10px] font-bold text-white/90 backdrop-blur-sm">
                            0{i + 1}
                          </span>
                          <div className="absolute inset-x-1.5 bottom-1.5 flex items-center gap-1 opacity-95 transition group-hover:opacity-100 sm:inset-x-2 sm:bottom-2 sm:gap-1.5">
                            <button
                              onClick={() => void runSequence([i])}
                              disabled={busy || camState !== 'ready'}
                              title="Retake with camera"
                              className="flex-1 rounded-lg bg-black/70 px-1.5 py-1 text-[10px] font-semibold text-white backdrop-blur-md transition hover:bg-black/90 disabled:opacity-40 sm:px-2 sm:text-[11px]"
                            >
                              ↺ Retake
                            </button>
                            <button
                              onClick={() => {
                                setUploadTargetSlot(i)
                                slotFileRef.current?.click()
                              }}
                              disabled={busy}
                              title="Replace with uploaded photo"
                              className="rounded-lg bg-black/70 p-1 text-white backdrop-blur-md transition hover:bg-black/90"
                            >
                              <ImagePlus className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() =>
                                onShots((prev) => prev.map((s, j) => (j === i ? null : s)))
                              }
                              disabled={busy}
                              title="Remove shot"
                              className="rounded-lg bg-black/70 p-1 text-white backdrop-blur-md transition hover:bg-red-500/80"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          className={`flex w-full flex-col items-center justify-center gap-1.5 p-2.5 sm:p-3 ${
                            layout.slots <= 4 ? 'aspect-[16/10]' : 'aspect-[4/3]'
                          }`}
                        >
                          <span className="font-mono text-[10px] font-bold text-white/40 sm:text-[11px]">
                            SHOT 0{i + 1}
                          </span>
                          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
                            {camState === 'ready' && (
                              <button
                                onClick={() => void runSequence([i])}
                                disabled={busy}
                                className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold text-white transition hover:bg-white/20 sm:px-3 sm:text-[11px]"
                              >
                                + Capture
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setUploadTargetSlot(i)
                                slotFileRef.current?.click()
                              }}
                              disabled={busy}
                              className="rounded-full border border-white/15 px-2.5 py-1 text-[10px] font-semibold text-[#c7c2b8] transition hover:border-white/35 hover:text-white sm:px-3 sm:text-[11px]"
                            >
                              Upload
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              <div className="mt-4 flex flex-col gap-2 border-t border-white/10 pt-4">
                {filled > 0 && (
                  <button
                    onClick={() => onShots(() => Array.from({ length: layout.slots }, () => null))}
                    disabled={busy}
                    className="w-full rounded-xl border border-white/10 bg-[#121215] py-2 text-xs font-semibold text-white/60 transition hover:border-white/25 hover:text-white"
                  >
                    Clear All Shots
                  </button>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={onContinue}
                    disabled={busy}
                    className="flex items-center justify-center gap-1 rounded-xl border border-white/15 bg-[#202027] py-3 text-xs font-bold text-white transition hover:border-white/35 hover:bg-[#282832]"
                  >
                    <Layers className="h-3.5 w-3.5 text-[#e5a93c]" />
                    <span>Choose Mode</span>
                  </button>

                  <button
                    onClick={() => (onGoEdit ? onGoEdit() : onContinue())}
                    disabled={!complete || busy}
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-[#faf8f5] py-3 text-xs font-extrabold text-[#141416] shadow-lg transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    <span>Customize</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
