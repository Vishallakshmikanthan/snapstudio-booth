import { createContext, useContext, useState, type ReactNode } from 'react'
import {
  FILTERS,
  FRAMES,
  LAYOUTS,
  MODES,
  SAMPLE_PHOTO_SETS,
  type FilterDef,
  type FontId,
  type FrameDef,
  type LayoutDef,
  type LayoutId,
  type Mode,
  type ModeId,
  type Sticker,
} from './data'
import type { EditorTabId } from '@/components/photobooth/EditStep'

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

export type StepId = 'landing' | 'capture' | 'mode' | 'edit' | 'gallery' | 'about'

export const STEP_TO_PATH: Record<StepId, '/' | '/capture' | '/modes' | '/editor' | '/gallery' | '/about'> = {
  landing: '/',
  capture: '/capture',
  mode: '/modes',
  edit: '/editor',
  gallery: '/gallery',
  about: '/about',
}

export interface PhotoboothContextValue {
  step: StepId
  setStep: (step: StepId) => void
  editorTab: EditorTabId
  setEditorTab: (tab: EditorTabId) => void
  layoutId: LayoutId
  setLayoutId: (id: LayoutId) => void
  modeId: ModeId
  setModeId: (id: ModeId) => void
  frameId: string
  setFrameId: (id: string) => void
  filterId: string
  setFilterId: (id: string) => void
  shots: (string | null)[]
  setShots: React.Dispatch<React.SetStateAction<(string | null)[]>>
  stickers: Sticker[]
  setStickers: React.Dispatch<React.SetStateAction<Sticker[]>>
  caption: string
  setCaption: (caption: string) => void
  dateOn: boolean
  setDateOn: (on: boolean) => void
  fontId: FontId
  setFontId: (font: FontId) => void
  dateStr: string
  setDateStr: (dateStr: string) => void
  layout: LayoutDef
  mode: Mode
  frame: FrameDef
  filter: FilterDef
  filled: number
  canEdit: boolean
  changeLayout: (id: LayoutId) => void
  applyMode: (m: Mode, alsoSwitchLayout?: boolean) => void
  ensureSampleShotsForSlots: (slotsCount: number) => void
}

const PhotoboothContext = createContext<PhotoboothContextValue | null>(null)

export function usePhotoboothState(): PhotoboothContextValue {
  const [step, setStep] = useState<StepId>('landing')
  const [editorTab, setEditorTab] = useState<EditorTabId>('stickers')
  const [layoutId, setLayoutId] = useState<LayoutId>('strip4')
  const [modeId, setModeId] = useState<ModeId>('classic')
  const [frameId, setFrameId] = useState('cloud')
  const [filterId, setFilterId] = useState('soft')
  const [shots, setShots] = useState<(string | null)[]>(() =>
    Array.from({ length: LAYOUTS.find((l) => l.id === 'strip4')!.slots }, () => null),
  )
  const [stickers, setStickers] = useState<Sticker[]>([])
  const [caption, setCaption] = useState('')
  const [dateOn, setDateOn] = useState(true)
  const [fontId, setFontId] = useState<FontId>('hand')
  const [dateStr, setDateStr] = useState(() => {
    const d = new Date()
    return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
  })

  const layout = LAYOUTS.find((l) => l.id === layoutId)!
  const mode = MODES.find((m) => m.id === modeId)!
  const frame = FRAMES.find((f) => f.id === frameId) ?? FRAMES[0]!
  const filter = FILTERS.find((f) => f.id === filterId) ?? FILTERS[0]!

  const changeLayout = (id: LayoutId) => {
    setLayoutId(id)
    const slots = LAYOUTS.find((l) => l.id === id)!.slots
    setShots((prev) => {
      const next = prev.slice(0, slots)
      while (next.length < slots) next.push(null)
      return next
    })
  }

  const applyMode = (m: Mode, alsoSwitchLayout = false) => {
    setModeId(m.id)
    setFrameId(m.defaultFrame)
    setFilterId(m.defaultFilter)
    if (alsoSwitchLayout) {
      changeLayout(m.defaultLayout)
    }
  }

  const filled = shots.slice(0, layout.slots).filter(Boolean).length
  const canEdit = filled >= layout.slots

  const ensureSampleShotsForSlots = (slotsCount: number) => {
    const sample = SAMPLE_PHOTO_SETS[0]!
    setShots((prev) => {
      const hasAny = prev.some(Boolean)
      if (hasAny && prev.filter(Boolean).length >= slotsCount) return prev
      return Array.from(
        { length: slotsCount },
        (_, idx) => prev[idx] || sample.shots[idx % sample.shots.length] || null,
      )
    })
  }

  return {
    step,
    setStep,
    editorTab,
    setEditorTab,
    layoutId,
    setLayoutId,
    modeId,
    setModeId,
    frameId,
    setFrameId,
    filterId,
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
    filled,
    canEdit,
    changeLayout,
    applyMode,
    ensureSampleShotsForSlots,
  }
}

export function PhotoboothProvider({ children }: { children: ReactNode }) {
  const value = usePhotoboothState()
  return <PhotoboothContext.Provider value={value}>{children}</PhotoboothContext.Provider>
}

export function usePhotoboothContext() {
  return useContext(PhotoboothContext)
}

