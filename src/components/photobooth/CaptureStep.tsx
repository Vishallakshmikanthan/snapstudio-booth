// ─── Capture step: live webcam, countdown, multi-shot, retakes, uploads ───
import { useCallback, useEffect, useRef, useState } from 'react'
import { LAYOUTS, type LayoutDef, type LayoutId } from '@/lib/photobooth/data'

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

interface Props {
  layout: LayoutDef
  shots: (string | null)[]
  onShots: (update: (prev: (string | null)[]) => (string | null)[]) => void
  onLayout: (id: LayoutId) => void
  onContinue: () => void
}

export default function CaptureStep({ layout, shots, onShots, onLayout, onContinue }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const aliveRef = useRef(true)

  const [camState, setCamState] = useState<'starting' | 'ready' | 'error'>('starting')
  const [camError, setCamError] = useState('')
  const [mirror, setMirror] = useState(true)
  const [count, setCount] = useState<number | null>(null)
  const [flash, setFlash] = useState(false)
  const [busy, setBusy] = useState(false)

  const startCamera = useCallback(async () => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    setCamState('starting')
    setCamError('')
    try {
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
        setCamError('Camera access was declined. Allow camera permission in your browser, then try again — or upload photos instead.')
      } else if (name === 'NotFoundError' || name === 'OverconstrainedError') {
        setCamError('No camera was found on this device. You can still build your strip with uploaded photos.')
      } else {
        setCamError('The camera could not be started. You can still build your strip with uploaded photos.')
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
        for (let c = 3; c >= 1; c--) {
          setCount(c)
          await sleep(750)
        }
        setCount(null)
        setFlash(true)
        window.setTimeout(() => setFlash(false), 420)
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
    [busy, camState, grabShot, onShots],
  )

  const emptySlots = shots.map((s, i) => (s ? null : i)).filter((i): i is number => i !== null)
  const filled = shots.filter(Boolean).length
  const complete = filled >= layout.slots

  const onUpload = async (files: FileList | null) => {
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
    onShots((prev) => {
      const next = [...prev]
      let ui = 0
      for (let i = 0; i < next.length && ui < urls.length; i++) {
        if (!next[i]) next[i] = urls[ui++]
      }
      let ri = 0
      while (ui < urls.length && next.length > 0) {
        next[ri % next.length] = urls[ui++]
        ri++
      }
      return next
    })
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-6 sm:px-6">
      {/* layout picker */}
      <div className="anim-fade-up flex flex-wrap items-center gap-2">
        <span className="mr-1 text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">Strip size</span>
        {LAYOUTS.map((l) => (
          <button
            key={l.id}
            onClick={() => onLayout(l.id)}
            disabled={busy}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
              l.id === layout.id
                ? 'bg-primary text-primary-foreground shadow'
                : 'border border-border bg-card text-foreground hover:bg-accent'
            }`}
          >
            {l.name}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* camera */}
        <section className="anim-pop">
          <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-[var(--shadow-soft)]">
            <div className="relative aspect-[4/3] w-full bg-secondary">
              <video
                ref={videoRef}
                playsInline
                muted
                autoPlay
                className="h-full w-full object-cover"
                style={{ transform: mirror ? 'scaleX(-1)' : undefined, opacity: camState === 'ready' ? 1 : 0 }}
              />

              {camState !== 'ready' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
                  {camState === 'starting' ? (
                    <>
                      <div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-primary" />
                      <p className="text-sm text-muted-foreground">Waking up the camera…</p>
                    </>
                  ) : (
                    <>
                      <span className="text-4xl">📷</span>
                      <p className="max-w-sm text-sm text-muted-foreground">{camError}</p>
                      <button
                        onClick={() => void startCamera()}
                        className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow transition hover:bg-primary/90"
                      >
                        Try camera again
                      </button>
                    </>
                  )}
                </div>
              )}

              {camState === 'ready' && (
                <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-black/45 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-white backdrop-blur">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-red-400" /> Live
                </div>
              )}

              {count !== null && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <span
                    key={count}
                    className="anim-pop text-[9rem] font-bold leading-none text-white drop-shadow-[0_6px_30px_rgba(0,0,0,0.55)]"
                  >
                    {count}
                  </span>
                </div>
              )}

              {flash && <div className="anim-flash pointer-events-none absolute inset-0 bg-white" />}
            </div>

            {/* camera controls */}
            <div className="flex flex-wrap items-center justify-center gap-3 border-t border-border p-4">
              <button
                onClick={() => void runSequence(emptySlots)}
                disabled={camState !== 'ready' || busy || !emptySlots.length}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <span className="text-base">✦</span>
                {busy ? 'Capturing…' : emptySlots.length ? `Capture ${emptySlots.length} shot${emptySlots.length > 1 ? 's' : ''}` : 'All shots taken'}
              </button>
              <button
                onClick={() => setMirror((m) => !m)}
                disabled={busy}
                className={`rounded-full border px-4 py-2.5 text-sm font-semibold transition ${
                  mirror ? 'border-primary/40 bg-primary/10 text-primary' : 'border-border bg-card text-foreground hover:bg-accent'
                }`}
              >
                🪞 Mirror {mirror ? 'on' : 'off'}
              </button>
              <button
                onClick={() => fileRef.current?.click()}
                disabled={busy}
                className="rounded-full border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-accent"
              >
                ⬆️ Upload photos
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => void onUpload(e.target.files)}
              />
            </div>
          </div>
        </section>

        {/* shots + progress */}
        <aside className="anim-fade-up space-y-5" style={{ animationDelay: '120ms' }}>
          <div className="rounded-3xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
            <div className="flex items-baseline justify-between">
              <h3 className="font-bold">Your shots</h3>
              <span className="text-sm font-semibold text-muted-foreground">
                {filled} / {layout.slots}
              </span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${(filled / layout.slots) * 100}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{layout.hint} · {layout.name}</p>

            <div className="mt-4 grid grid-cols-2 gap-3">
              {Array.from({ length: layout.slots }).map((_, i) => {
                const shot = shots[i]
                return (
                  <div key={i} className="overflow-hidden rounded-2xl border border-border bg-secondary">
                    {shot ? (
                      <div className="relative">
                        <img src={shot} alt={`Shot ${i + 1}`} className="aspect-[3/4] w-full object-cover" />
                        <div className="absolute inset-x-1.5 bottom-1.5 flex gap-1.5">
                          <button
                            onClick={() => void runSequence([i])}
                            disabled={busy || camState !== 'ready'}
                            className="flex-1 rounded-full bg-black/55 px-2 py-1 text-[11px] font-semibold text-white backdrop-blur transition hover:bg-black/75 disabled:opacity-40"
                          >
                            ↺ Retake
                          </button>
                          <button
                            onClick={() => onShots((prev) => prev.map((s, j) => (j === i ? null : s)))}
                            disabled={busy}
                            className="rounded-full bg-black/55 px-2 py-1 text-[11px] font-semibold text-white backdrop-blur transition hover:bg-black/75 disabled:opacity-40"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => void runSequence([i])}
                        disabled={busy || camState !== 'ready'}
                        className="flex aspect-[3/4] w-full flex-col items-center justify-center gap-1 text-muted-foreground transition hover:text-foreground disabled:opacity-50"
                      >
                        <span className="text-2xl">+</span>
                        <span className="text-[11px] font-semibold">Shot {i + 1}</span>
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
            <p className="text-xs text-muted-foreground">
              Tip: strike a pose between beeps — each shot gets a 3-2-1 countdown. Uploaded photos fill the empty slots first.
            </p>
            <button
              onClick={onContinue}
              disabled={!complete}
              className="mt-4 w-full rounded-full bg-foreground px-5 py-3 text-sm font-bold text-background shadow transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-30"
            >
              {complete ? 'Choose a mode →' : `Take ${layout.slots - filled} more shot${layout.slots - filled > 1 ? 's' : ''} to continue`}
            </button>
          </div>
        </aside>
      </div>
    </div>
  )
}
