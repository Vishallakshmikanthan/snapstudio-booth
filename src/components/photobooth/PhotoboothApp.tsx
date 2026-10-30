// ─── SNAPSTUDIO App Shell: Multi-route navigation (/, /modes, /capture, /editor, /gallery, /about) & mobile-first layout ───
import { useEffect } from 'react'
import { useRouter } from '@tanstack/react-router'
import {
  LAYOUTS,
  MODES,
  type Mode,
} from '@/lib/photobooth/data'
import {
  STEP_TO_PATH,
  usePhotoboothContext,
  usePhotoboothState,
  type StepId,
} from '@/lib/photobooth/context'
import LandingStep from './LandingStep'
import CaptureStep from './CaptureStep'
import ModeStep from './ModeStep'
import EditStep from './EditStep'

export type { StepId }

const STUDIO_STEPS: { id: 'capture' | 'mode' | 'edit'; n: number; label: string; shortLabel: string }[] = [
  { id: 'capture', n: 1, label: 'Capture', shortLabel: 'Capture' },
  { id: 'mode', n: 2, label: 'Mode', shortLabel: 'Mode' },
  { id: 'edit', n: 3, label: 'Customize', shortLabel: 'Edit' },
]

const NAV_ROUTES: { id: StepId; label: string; path: string }[] = [
  { id: 'landing', label: 'Home', path: '/' },
  { id: 'mode', label: 'Modes', path: '/modes' },
  { id: 'capture', label: 'Capture', path: '/capture' },
  { id: 'edit', label: 'Editor', path: '/editor' },
  { id: 'gallery', label: 'Gallery', path: '/gallery' },
  { id: 'about', label: 'About', path: '/about' },
]

interface PhotoboothAppProps {
  routeStep?: StepId
}

export default function PhotoboothApp({ routeStep }: PhotoboothAppProps) {
  const ctx = usePhotoboothContext()
  const fallbackState = usePhotoboothState()
  const state = ctx ?? fallbackState

  let router: ReturnType<typeof useRouter> | null = null
  try {
    // Only active when mounted inside TanStack RouterProvider
    // eslint-disable-next-line react-hooks/rules-of-hooks
    router = routeStep ? useRouter() : null
  } catch {
    router = null
  }

  const {
    step: internalStep,
    setStep,
    editorTab,
    setEditorTab,
    layoutId,
    setLayoutId,
    modeId,
    setModeId,
    setFrameId,
    setFilterId,
    shots,
    setShots,
    stickers,
    setStickers,
    caption,
    setCaption,
    dateOn,
    setDateOn,
    fontId,
    setFontId,
    dateStr,
    setDateStr,
    layout,
    mode,
    frame,
    filter,
    canEdit,
    changeLayout,
    applyMode,
    ensureSampleShotsForSlots,
  } = state

  const activeStep: StepId = routeStep ?? internalStep

  // If user navigates directly to /editor before taking photos, populate studio sample shots automatically
  useEffect(() => {
    if (activeStep === 'edit' && !canEdit) {
      ensureSampleShotsForSlots(layout.slots)
    }
  }, [activeStep, canEdit, ensureSampleShotsForSlots, layout.slots])

  const goStep = (id: StepId) => {
    if (id === 'edit' && !canEdit) {
      ensureSampleShotsForSlots(layout.slots)
    }
    setStep(id)
    if (router && routeStep) {
      void router.navigate({ to: STEP_TO_PATH[id] })
    }
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const isCreamScreen = activeStep === 'mode'

  return (
    <div className="min-h-screen w-full max-w-[100vw] overflow-x-hidden bg-[#111114] text-[#f6f3ec]">
      {/* ── GLOBAL HEADER (Adapts seamlessly between Dark Studio & Warm Cream Mode Screen) ── */}
      <header
        className={`sticky top-0 z-50 w-full border-b backdrop-blur-xl transition-colors duration-300 ${isCreamScreen
            ? 'border-[#171614]/10 bg-[#f5f2eb]/92 text-[#171614]'
            : 'border-white/10 bg-[#111114]/90 text-[#f6f3ec]'
          }`}
      >
        <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-2 px-3 py-2.5 sm:gap-4 sm:px-6 sm:py-3.5">
          {/* Brand Logo + Desktop Nav Links */}
          <div className="flex min-w-0 items-center gap-4 lg:gap-6">
            <button
              onClick={() => goStep('landing')}
              className="flex shrink-0 items-center gap-1.5 text-sm font-extrabold tracking-[0.12em] uppercase transition hover:opacity-85 sm:gap-2 sm:text-lg sm:tracking-[0.14em]"
            >
              <span className="text-[#e5a93c]">✦</span>
              <span>SNAPSTUDIO</span>
            </button>

            {/* Primary Navigation Links (Desktop) */}
            <nav aria-label="Main navigation" className="hidden items-center gap-5 md:flex lg:gap-6">
              {NAV_ROUTES.map((item) => {
                const isActive = activeStep === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => goStep(item.id)}
                    className={`relative py-1 text-xs font-semibold transition ${isActive
                        ? isCreamScreen
                          ? 'text-[#171614]'
                          : 'text-white'
                        : isCreamScreen
                          ? 'text-[#615c52] hover:text-[#171614]'
                          : 'text-[#a8a49c] hover:text-white'
                      }`}
                  >
                    {item.label}
                    {isActive && (
                      <span
                        className={`absolute inset-x-0 -bottom-1 h-0.5 rounded-full ${isCreamScreen ? 'bg-[#171614]' : 'bg-[#e5a93c]'
                          }`}
                      />
                    )}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Right Side: Studio Stepper + Start Creating CTA */}
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
            <nav className="flex items-center gap-0.5 sm:gap-1" aria-label="Studio Workflow Progress">
              {STUDIO_STEPS.map((s) => {
                const active = activeStep === s.id
                return (
                  <button
                    key={s.id}
                    onClick={() => goStep(s.id)}
                    title={`${s.n}. ${s.label} (${STEP_TO_PATH[s.id]})`}
                    className={`flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-bold transition sm:gap-1.5 sm:px-3.5 sm:py-1.5 sm:text-xs ${active
                        ? isCreamScreen
                          ? 'bg-[#171614] text-[#f5f2eb] shadow'
                          : 'bg-[#faf8f5] text-[#141416] shadow'
                        : isCreamScreen
                          ? 'text-[#575248] hover:bg-black/5 hover:text-[#171614]'
                          : 'text-[#a8a49c] hover:bg-white/[0.07] hover:text-white'
                      }`}
                  >
                    <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] ${active
                          ? isCreamScreen
                            ? 'bg-white/20 text-white'
                            : 'bg-black/15 text-[#141416]'
                          : isCreamScreen
                            ? 'bg-black/10 text-[#171614]'
                            : 'bg-white/10 text-white/80'
                        }`}
                    >
                      {s.n}
                    </span>
                    <span className="hidden sm:inline">{s.label}</span>
                  </button>
                )
              })}
            </nav>

            {(activeStep === 'landing' || activeStep === 'gallery' || activeStep === 'about') && (
              <button
                onClick={() => goStep('capture')}
                className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#faf8f5] px-3 py-1.5 text-[11px] font-extrabold text-[#141416] shadow transition hover:-translate-y-0.5 hover:bg-white sm:gap-1.5 sm:px-5 sm:py-2 sm:text-xs"
              >
                <span className="hidden xs:inline sm:inline">Start Creating</span>
                <span className="xs:hidden sm:hidden">Booth</span>
                <span>→</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Quick-Route Bar (Visible on small screens so every route is 1-tap accessible) */}
        <div
          className={`no-scrollbar flex items-center gap-1 overflow-x-auto border-t px-3 py-1.5 md:hidden ${isCreamScreen ? 'border-[#171614]/10 bg-[#efece4]/80' : 'border-white/[0.07] bg-[#151519]/90'
            }`}
        >
          {NAV_ROUTES.map((item) => {
            const isActive = activeStep === item.id
            return (
              <button
                key={item.id}
                onClick={() => goStep(item.id)}
                className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold transition ${isActive
                    ? isCreamScreen
                      ? 'bg-[#171614] text-[#f5f2eb]'
                      : 'bg-[#e5a93c] text-[#141416]'
                    : isCreamScreen
                      ? 'text-[#575248] hover:bg-black/5'
                      : 'text-[#a8a49c] hover:bg-white/5 hover:text-white'
                  }`}
              >
                {item.label}
              </button>
            )
          })}
        </div>
      </header>

      {/* ── MAIN WORKFLOW VIEWPORT ── */}
      <main className="min-w-0 w-full overflow-x-hidden">
        {(activeStep === 'landing' || activeStep === 'gallery' || activeStep === 'about') && (
          <LandingStep
            sectionView={activeStep === 'gallery' ? 'gallery' : activeStep === 'about' ? 'about' : 'all'}
            onStartCapture={(pickedMode) => {
              if (pickedMode) applyMode(pickedMode, true)
              goStep('capture')
            }}
            onExploreModes={() => goStep('mode')}
            onNavigateSection={(sec) => goStep(sec)}
            onTryPreset={({ modeId: mId, frameId: fId, filterId: flId, caption: cap, withSamples }) => {
              const pickedMode = MODES.find((m) => m.id === mId) ?? MODES[0]!
              const targetLayoutId = pickedMode.defaultLayout
              const targetSlots = LAYOUTS.find((l) => l.id === targetLayoutId)!.slots
              setModeId(pickedMode.id)
              setLayoutId(targetLayoutId)
              setFrameId(fId)
              setFilterId(flId)
              setCaption(cap)
              if (withSamples) {
                ensureSampleShotsForSlots(targetSlots)
              }
              goStep('edit')
            }}
          />
        )}

        {activeStep === 'capture' && (
          <CaptureStep
            layout={layout}
            shots={shots}
            onShots={(update) => setShots((prev) => update(prev))}
            onLayout={changeLayout}
            onContinue={() => goStep('mode')}
            onGoEdit={(initialTab) => {
              if (initialTab) setEditorTab(initialTab)
              goStep('edit')
            }}
            mode={mode}
            onMode={(m: Mode) => applyMode(m)}
            filter={filter}
            onFilter={setFilterId}
          />
        )}

        {activeStep === 'mode' && (
          <ModeStep
            currentId={modeId}
            shots={shots}
            onPick={(m) => {
              applyMode(m)
              if (!canEdit) {
                goStep('capture')
              } else {
                goStep('edit')
              }
            }}
            onSkip={() => {
              if (!canEdit) {
                ensureSampleShotsForSlots(layout.slots)
              }
              goStep('edit')
            }}
            onBackToCapture={() => goStep('capture')}
          />
        )}

        {activeStep === 'edit' && (
          <EditStep
            mode={mode}
            onMode={(m) => applyMode(m)}
            layoutId={layoutId}
            onLayout={changeLayout}
            frame={frame}
            onFrame={setFrameId}
            filter={filter}
            onFilter={setFilterId}
            shots={shots}
            onShots={(update) => setShots((prev) => update(prev))}
            stickers={stickers}
            onStickers={(update) => setStickers((prev) => update(prev))}
            caption={caption}
            onCaption={setCaption}
            dateOn={dateOn}
            onDateOn={setDateOn}
            fontId={fontId}
            onFont={setFontId}
            dateStr={dateStr}
            onDateStr={setDateStr}
            onRetake={() => goStep('capture')}
            initialTab={editorTab}
          />
        )}
      </main>

      {/* ── GLOBAL FOOTER ── */}
      <footer
        className={`border-t py-6 text-center text-xs transition-colors ${isCreamScreen
            ? 'border-[#171614]/10 bg-[#f5f2eb] text-[#615c52]'
            : 'border-white/10 bg-[#0e0e11] text-[#8e8a82]'
          }`}
      >
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 sm:flex-row sm:px-6">
          <span>✦ SNAPSTUDIO — Virtual Photobooth & Creative Studio</span>
          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px]">
            <button onClick={() => goStep('landing')} className="hover:underline">
              Home
            </button>
            <button onClick={() => goStep('mode')} className="hover:underline">
              Modes
            </button>
            <button onClick={() => goStep('capture')} className="hover:underline">
              Capture
            </button>
            <button onClick={() => goStep('edit')} className="hover:underline">
              Editor
            </button>
            <button onClick={() => goStep('gallery')} className="hover:underline">
              Gallery
            </button>
            <button onClick={() => goStep('about')} className="hover:underline">
              About
            </button>
          </div>
          <span>100% Client-Side Privacy · Your photos never leave this device.</span>
        </div>
      </footer>
    </div>
  )
}
