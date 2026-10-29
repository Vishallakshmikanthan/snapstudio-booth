// ─── SNAPSTUDIO core data: layouts, filters, frames, stickers, modes ───

export type LayoutId = 'strip2' | 'strip4' | 'strip6' | 'grid4' | 'grid6'

export interface LayoutDef {
  id: LayoutId
  name: string
  hint: string
  cols: number
  rows: number
  cellW: number
  cellH: number
  slots: number
}

export const LAYOUTS: LayoutDef[] = [
  { id: 'strip2', name: '2-Shot Strip', hint: 'Two portraits on one strip', cols: 1, rows: 2, cellW: 520, cellH: 660, slots: 2 },
  { id: 'strip4', name: '4-Shot Strip', hint: 'The classic Korean four-cut', cols: 1, rows: 4, cellW: 520, cellH: 660, slots: 4 },
  { id: 'strip6', name: '6-Shot Strip', hint: 'A full photo diary', cols: 1, rows: 6, cellW: 520, cellH: 660, slots: 6 },
  { id: 'grid4', name: '2×2 Collage', hint: 'Four-up grid collage', cols: 2, rows: 2, cellW: 520, cellH: 660, slots: 4 },
  { id: 'grid6', name: '3×2 Collage', hint: 'Six-up wide collage', cols: 3, rows: 2, cellW: 520, cellH: 660, slots: 6 },
]

export interface FilterDef {
  id: string
  name: string
  css: string
}

export const FILTERS: FilterDef[] = [
  { id: 'original', name: 'Original', css: '' },
  { id: 'soft', name: 'Soft', css: 'brightness(1.07) saturate(0.88) contrast(0.96)' },
  { id: 'vivid', name: 'Vivid', css: 'saturate(1.55) contrast(1.08)' },
  { id: 'noir', name: 'Noir', css: 'grayscale(1) contrast(1.15) brightness(0.98)' },
  { id: 'silver', name: 'Silver', css: 'grayscale(1) brightness(1.1) contrast(0.9)' },
  { id: 'sepia', name: 'Sepia', css: 'sepia(0.55) contrast(1.02) saturate(0.9)' },
  { id: 'golden', name: 'Golden', css: 'sepia(0.26) saturate(1.3) brightness(1.04)' },
  { id: 'cool', name: 'Cool', css: 'saturate(1.12) hue-rotate(12deg) brightness(1.02)' },
  { id: 'faded', name: 'Faded', css: 'contrast(0.82) saturate(0.72) brightness(1.08)' },
  { id: 'retro', name: 'Retro', css: 'sepia(0.3) hue-rotate(-15deg) saturate(1.35) contrast(1.06)' },
  { id: 'dream', name: 'Dreamy', css: 'brightness(1.12) saturate(1.18) contrast(0.93) blur(0.5px)' },
  { id: 'cine', name: 'Cinema', css: 'contrast(1.18) saturate(1.12) brightness(0.94)' },
]

export type FrameStyle = 'plain' | 'film' | 'tape' | 'polaroid' | 'neon' | 'lines'

export interface FrameDef {
  id: string
  name: string
  bg: string
  fg: string
  accent?: string
  style: FrameStyle
}

export const FRAMES: FrameDef[] = [
  { id: 'cloud', name: 'Cloud White', bg: '#ffffff', fg: '#232329', style: 'plain' },
  { id: 'ink', name: 'Midnight Ink', bg: '#17171b', fg: '#f4f2ec', style: 'plain' },
  { id: 'kraft', name: 'Kraft Paper', bg: '#d8c39b', fg: '#3c2f1c', style: 'plain' },
  { id: 'blush', name: 'Soft Blush', bg: '#f5dee1', fg: '#5c3a42', style: 'plain' },
  { id: 'mint', name: 'Fresh Mint', bg: '#d8ecdf', fg: '#2e4a39', style: 'plain' },
  { id: 'lilac', name: 'Lilac Haze', bg: '#e3dbf5', fg: '#3e345e', style: 'plain' },
  { id: 'butter', name: 'Butter Yellow', bg: '#f7e9c6', fg: '#5a4720', style: 'plain' },
  { id: 'ocean', name: 'Ocean Air', bg: '#d5e5ef', fg: '#234a5e', style: 'plain' },
  { id: 'filmnoir', name: 'Film Noir', bg: '#101013', fg: '#e9e7e1', style: 'film' },
  { id: 'filmsun', name: 'Sunburn Film', bg: '#ece2cc', fg: '#4a3d27', style: 'film' },
  { id: 'tapekraft', name: 'Taped Kraft', bg: '#e7dcc6', fg: '#4a3d27', style: 'tape' },
  { id: 'polaroid', name: 'Polaroid', bg: '#fbfaf6', fg: '#26262c', style: 'polaroid' },
  { id: 'neonmid', name: 'Neon Night', bg: '#0e0e18', fg: '#f0eefe', accent: '#a78bfa', style: 'neon' },
  { id: 'editorial', name: 'Gallery Line', bg: '#f3f1ea', fg: '#26262b', style: 'lines' },
  { id: 'cinemagold', name: 'Cinema Gold', bg: '#050506', fg: '#eae7df', accent: '#d9b45b', style: 'lines' },
]

export interface StickerCategory {
  id: string
  name: string
  emojis: string[]
}

export const STICKER_CATEGORIES: StickerCategory[] = [
  { id: 'faces', name: 'Faces', emojis: ['😀', '😁', '😂', '🥲', '😎', '🤩', '🥳', '😇', '🙃', '😴', '🤯', '🫡'] },
  { id: 'memes', name: 'Memes', emojis: ['💀', '😭', '🔥', '🫠', '🤡', '🙄', '🤌', '👀', '🧠', '💯', '🥶', '😮‍💨'] },
  { id: 'hearts', name: 'Hearts', emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🩷', '🩵', '🖤', '🫶', '💕', '💖'] },
  { id: 'stars', name: 'Stars', emojis: ['⭐', '🌟', '✨', '💫', '⚡', '🌈', '☄️', '🎉', '🎊', '🎆', '🎇', '🪩'] },
  { id: 'flames', name: 'Flames', emojis: ['🔥', '🌶️', '💥', '🧨', '🌋', '♨️', '🥵', '🚀', '🎯', '💢', '💣', '🧯'] },
  { id: 'animals', name: 'Animals', emojis: ['🐶', '🐱', '🐰', '🐻', '🐼', '🦊', '🐸', '🐧', '🦄', '🐢', '🦋', '🐝'] },
  { id: 'music', name: 'Music', emojis: ['🎤', '🎧', '🎸', '🎹', '🥁', '🎷', '🎻', '🎺', '🎵', '🎶', '💿', '📻'] },
  { id: 'cute', name: 'Cute', emojis: ['🍓', '🌸', '🧸', '🍭', '☁️', '🎀', '🧁', '🪄', '🌙', '🫧', '🍰', '🛼'] },
  { id: 'travel', name: 'Travel', emojis: ['✈️', '🚗', '🚉', '🏝️', '⛰️', '🗺️', '🧭', '📸', '🛄', '🌅', '🌉', '🎫'] },
  { id: 'doodles', name: 'Doodles', emojis: ['❗', '❓', '➡️', '✳️', '〰️', '➰', '☑️', '✔️', '⭕', '❎', '✖️', '💡'] },
]

export interface Sticker {
  id: string
  emoji: string
  /** 0..1 fraction of the strip canvas width */
  x: number
  /** 0..1 fraction of the strip canvas height */
  y: number
  /** size in canvas px */
  size: number
  /** rotation in degrees */
  rot: number
}

export const STICKER_MIN = 30
export const STICKER_MAX = 220
export const STICKER_DEFAULT = 76

export type ModeId =
  | 'classic'
  | 'cinematic'
  | 'fun'
  | 'vintage'
  | 'music'
  | 'cute'
  | 'editorial'
  | 'travel'

export interface Mode {
  id: ModeId
  name: string
  tagline: string
  icon: string
  frames: string[]
  defaultFrame: string
  defaultFilter: string
  defaultLayout: LayoutId
  captions: string[]
  stickerSample: string[]
}

export const MODES: Mode[] = [
  {
    id: 'classic', name: 'Classic Booth', tagline: 'The timeless four-cut strip', icon: '📸',
    frames: ['cloud', 'ink', 'kraft', 'blush'], defaultFrame: 'cloud', defaultFilter: 'soft', defaultLayout: 'strip4',
    captions: ['say cheese ✦', 'good times only', 'film favorites', 'the daily four'],
    stickerSample: ['⭐', '✨', '🫶', '📸'],
  },
  {
    id: 'cinematic', name: 'Cinematic', tagline: 'Moody frames, movie-poster energy', icon: '🎬',
    frames: ['filmnoir', 'cinemagold', 'ink', 'neonmid'], defaultFrame: 'filmnoir', defaultFilter: 'cine', defaultLayout: 'strip4',
    captions: ['now showing', 'scene 01 — take 02', 'the final cut', 'directed by us'],
    stickerSample: ['🎬', '🎞️', '⭐', '🍿'],
  },
  {
    id: 'fun', name: 'Fun & Meme', tagline: 'Goofy, loud and unfiltered', icon: '🤪',
    frames: ['butter', 'mint', 'ocean', 'blush'], defaultFrame: 'butter', defaultFilter: 'vivid', defaultLayout: 'grid4',
    captions: ['certified silliness', 'zero thoughts, head empty', 'main character moment'],
    stickerSample: ['💀', '🤡', '🔥', '💯'],
  },
  {
    id: 'vintage', name: 'Vintage Camera', tagline: 'Warm retro grain, taped edges', icon: '📻',
    frames: ['tapekraft', 'filmsun', 'kraft', 'polaroid'], defaultFrame: 'tapekraft', defaultFilter: 'sepia', defaultLayout: 'strip4',
    captions: ['back in the day', 'film roll №7', 'faded but golden'],
    stickerSample: ['📻', '🎞️', '🌙', '🧳'],
  },
  {
    id: 'music', name: 'Music & Concert', tagline: 'Stage lights, setlists, encores', icon: '🎧',
    frames: ['neonmid', 'ink', 'filmnoir', 'lilac'], defaultFrame: 'neonmid', defaultFilter: 'retro', defaultLayout: 'grid6',
    captions: ['front row forever', 'encore ✦ encore', 'setlist: pure joy'],
    stickerSample: ['🎤', '🪩', '🎧', '🎶'],
  },
  {
    id: 'cute', name: 'Cute & Playful', tagline: 'Pastel playdate energy', icon: '🧸',
    frames: ['blush', 'lilac', 'cloud', 'mint'], defaultFrame: 'blush', defaultFilter: 'dream', defaultLayout: 'strip4',
    captions: ['too cute to handle', 'soft launch 💕', 'sugar rush'],
    stickerSample: ['🧸', '🎀', '🍓', '🌸'],
  },
  {
    id: 'editorial', name: 'Editorial', tagline: 'Gallery-clean, magazine minimal', icon: '🖼️',
    frames: ['editorial', 'cloud', 'ink', 'cinemagold'], defaultFrame: 'editorial', defaultFilter: 'noir', defaultLayout: 'grid4',
    captions: ['issue №1 — the everyday', 'portrait study 04', 'quiet moments'],
    stickerSample: ['❗', '➰', '✔️', '💡'],
  },
  {
    id: 'travel', name: 'Travel Diary', tagline: 'Postcards from everywhere', icon: '✈️',
    frames: ['ocean', 'tapekraft', 'filmsun', 'kraft'], defaultFrame: 'ocean', defaultFilter: 'golden', defaultLayout: 'strip6',
    captions: ['postcard from nowhere', 'km 1024 ✈️', 'wish you were here'],
    stickerSample: ['✈️', '🗺️', '🏝️', '📸'],
  },
]

export type FontId = 'hand' | 'clean'

export interface StripConfig {
  layout: LayoutDef
  shots: (string | null)[]
  filter: FilterDef
  frame: FrameDef
  modeName: string
  stickers: Sticker[]
  caption: string
  dateStamp: boolean
  fontId: FontId
  dateStr: string
}
