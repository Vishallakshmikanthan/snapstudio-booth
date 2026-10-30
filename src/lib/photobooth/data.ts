// ─── SNAPSTUDIO core data: layouts, filters, frames, stickers, modes, samples ───

export type LayoutId = 'strip2' | 'strip4' | 'strip6' | 'grid4' | 'grid6'

export interface LayoutDef {
  id: LayoutId
  name: string
  shortName: string
  hint: string
  cols: number
  rows: number
  cellW: number
  cellH: number
  slots: number
}

export const LAYOUTS: LayoutDef[] = [
  { id: 'strip2', name: '2-Shot Strip', shortName: '2 Shots', hint: 'Two portraits on one vertical strip', cols: 1, rows: 2, cellW: 520, cellH: 640, slots: 2 },
  { id: 'strip4', name: '4-Shot Strip', shortName: '4 Shots', hint: 'The classic four-cut strip', cols: 1, rows: 4, cellW: 520, cellH: 420, slots: 4 },
  { id: 'strip6', name: '6-Shot Strip', shortName: '6 Shots', hint: 'Extended vertical story strip', cols: 1, rows: 6, cellW: 520, cellH: 380, slots: 6 },
  { id: 'grid4', name: '2×2 Collage', shortName: '2×2 Grid', hint: 'Four-up editorial grid collage', cols: 2, rows: 2, cellW: 500, cellH: 620, slots: 4 },
  { id: 'grid6', name: '2×3 Collage', shortName: '2×3 Grid', hint: 'Six-up contact sheet collage', cols: 2, rows: 3, cellW: 480, cellH: 580, slots: 6 },
]

export interface FilterDef {
  id: string
  name: string
  hint: string
  css: string
}

export const FILTERS: FilterDef[] = [
  { id: 'original', name: 'Original', hint: 'Natural studio tone', css: '' },
  { id: 'soft', name: 'Soft Booth', hint: 'Bright studio booth skin tone', css: 'brightness(1.07) saturate(0.9) contrast(0.96)' },
  { id: 'cine', name: 'Portra 400', hint: 'Warm amber cinema stock', css: 'contrast(1.16) saturate(1.14) sepia(0.14) brightness(0.96)' },
  { id: 'noir', name: 'Ilford B&W', hint: 'High-contrast monochrome', css: 'grayscale(1) contrast(1.22) brightness(0.98)' },
  { id: 'silver', name: 'Silver Gelatin', hint: 'Soft editorial black & white', css: 'grayscale(1) brightness(1.08) contrast(0.92)' },
  { id: 'vivid', name: 'Pop Vivid', hint: 'Punchy saturated color', css: 'saturate(1.48) contrast(1.08)' },
  { id: 'sepia', name: '1974 Archive', hint: 'Aged warm vintage print', css: 'sepia(0.55) contrast(1.04) saturate(0.88) brightness(0.98)' },
  { id: 'golden', name: 'Golden Hour', hint: 'Sunlit postcard warmth', css: 'sepia(0.24) saturate(1.28) brightness(1.04)' },
  { id: 'retro', name: 'Crimson Stage', hint: 'Concert red & warm shadows', css: 'sepia(0.32) hue-rotate(-18deg) saturate(1.42) contrast(1.12)' },
  { id: 'dream', name: 'Pastel Dream', hint: 'Airy soft-focus glow', css: 'brightness(1.1) saturate(1.15) contrast(0.93)' },
  { id: 'cool', name: 'Tokyo Night', hint: 'Cool tungsten highlights', css: 'saturate(1.1) hue-rotate(12deg) brightness(1.02) contrast(1.04)' },
  { id: 'faded', name: 'Matte Film', hint: 'Lifted shadows, muted grain', css: 'contrast(0.84) saturate(0.75) brightness(1.07)' },
]

export type FrameStyle =
  | 'plain'
  | 'photoism'
  | 'film'
  | 'vintage74'
  | 'pixel'
  | 'editorial'
  | 'concert'
  | 'meme'
  | 'postcard'
  | 'tape'
  | 'polaroid'
  | 'neon'
  | 'lines'

export interface FrameDef {
  id: string
  name: string
  bg: string
  fg: string
  accent?: string
  secondaryBg?: string
  style: FrameStyle
}

export const FRAMES: FrameDef[] = [
  { id: 'cloud', name: 'Photoism White', bg: '#f9f8f5', fg: '#1c1c21', accent: '#1c1c21', style: 'photoism' },
  { id: 'filmnoir', name: '35mm Kodak Film', bg: '#0f0f12', fg: '#f2ece1', accent: '#e5a93c', style: 'film' },
  { id: 'butter', name: 'Meme Sky & Sun', bg: '#dcebf7', fg: '#182232', accent: '#facc15', secondaryBg: '#fef08a', style: 'meme' },
  { id: 'tapekraft', name: '1974 Safety Film', bg: '#dfd1b4', fg: '#2b2116', accent: '#181512', style: 'vintage74' },
  { id: 'neonmid', name: 'Concert Red 400', bg: '#12080a', fg: '#f7e8e8', accent: '#ef4444', style: 'concert' },
  { id: 'blush', name: 'Pixel Kawaii', bg: '#f7f3eb', fg: '#1e1b18', accent: '#f472b6', style: 'pixel' },
  { id: 'editorial', name: 'Magazine Issue', bg: '#f4f2ec', fg: '#141416', accent: '#141416', style: 'editorial' },
  { id: 'ocean', name: 'Airmail Postcard', bg: '#eee7da', fg: '#25323d', accent: '#c2410c', style: 'postcard' },
  { id: 'ink', name: 'Midnight Studio', bg: '#151519', fg: '#f4f2ec', accent: '#d6b265', style: 'photoism' },
  { id: 'cinemagold', name: 'Cinema Gold', bg: '#09090b', fg: '#eae7df', accent: '#d9b45b', style: 'lines' },
  { id: 'polaroid', name: 'Instant Polaroid', bg: '#fbfaf6', fg: '#26262c', accent: '#71717a', style: 'polaroid' },
  { id: 'filmsun', name: 'Warm Contact Sheet', bg: '#ebe0c9', fg: '#3d301e', accent: '#b45309', style: 'film' },
  { id: 'kraft', name: 'Taped Kraft', bg: '#d8c39b', fg: '#3c2f1c', accent: '#fef3c7', style: 'tape' },
  { id: 'mint', name: 'Matcha Cream', bg: '#dcece2', fg: '#233d2c', accent: '#10b981', style: 'plain' },
  { id: 'lilac', name: 'Seoul Lavender', bg: '#e5dff5', fg: '#32294d', accent: '#a78bfa', style: 'neon' },
]

export interface BackgroundPreset {
  id: string
  name: string
  bg: string
  fg: string
  grain?: boolean
}

export const BACKGROUND_PRESETS: BackgroundPreset[] = [
  { id: 'default', name: 'Mode Default', bg: '', fg: '' },
  { id: 'alabaster', name: 'Warm Alabaster', bg: '#f8f6f0', fg: '#18181b' },
  { id: 'obsidian', name: 'Darkroom Black', bg: '#0e0e11', fg: '#f4f1ea', grain: true },
  { id: 'parchment', name: 'Aged Parchment', bg: '#e2d4b7', fg: '#2c2217', grain: true },
  { id: 'espresso', name: 'Warm Espresso', bg: '#1e1612', fg: '#f3e9dc', grain: true },
  { id: 'crimson', name: 'Stage Crimson', bg: '#22090d', fg: '#fce7e7', grain: true },
  { id: 'sky', name: 'Soda Sky', bg: '#d8ebf8', fg: '#172536' },
  { id: 'buttercream', name: 'Buttercream', bg: '#f9eec7', fg: '#3f3112' },
  { id: 'sage', name: 'Studio Sage', bg: '#dde9e0', fg: '#1e3528' },
  { id: 'rosewater', name: 'Soft Rosewater', bg: '#f6dfe2', fg: '#4c262e' },
  { id: 'slate', name: 'Editorial Slate', bg: '#23262e', fg: '#f1f5f9' },
  { id: 'concrete', name: 'Gallery Concrete', bg: '#e6e4df', fg: '#18181b', grain: true },
]

export interface DoodleStickerDef {
  id: string
  name: string
  category: 'doodles' | 'memes' | 'shapes' | 'music' | 'animals' | 'badges'
  preview: string
}

export const DOODLE_STICKERS: DoodleStickerDef[] = [
  { id: 'star-sketch', name: 'Sketch Star', category: 'doodles', preview: '☆' },
  { id: 'heart-sketch', name: 'Sketch Heart', category: 'shapes', preview: '♡' },
  { id: 'good-vibes', name: 'Good Vibes', category: 'badges', preview: 'GOOD VIBES' },
  { id: 'love-script', name: 'Love Script', category: 'badges', preview: 'LOVE' },
  { id: 'tokyo-script', name: 'Tokyo Script', category: 'badges', preview: 'Tokyo!' },
  { id: 'cute-tag', name: 'CUTE! ♥', category: 'badges', preview: 'CUTE! ♥' },
  { id: 'speech-nah', name: 'Yeah, No.', category: 'memes', preview: '음. 아니야.' },
  { id: 'speech-main', name: 'Main Character', category: 'memes', preview: 'MAIN CHARACTER' },
  { id: 'speech-wish', name: 'Make A Wish', category: 'memes', preview: 'MAKE A WISH ×5' },
  { id: 'headphones-sketch', name: 'Headphones', category: 'music', preview: '🎧' },
  { id: 'cherries-sketch', name: 'Cherries', category: 'doodles', preview: '🍒' },
  { id: 'cat-sketch', name: 'Cat Doodle', category: 'animals', preview: '🐱' },
  { id: 'smiley-sketch', name: 'Smiley Doodle', category: 'doodles', preview: '☺' },
  { id: 'butterfly-sketch', name: 'Butterfly', category: 'animals', preview: '🦋' },
  { id: 'flame-sketch', name: 'Sketch Flame', category: 'shapes', preview: '🔥' },
  { id: 'bolt-sketch', name: 'Lightning Bolt', category: 'shapes', preview: '⚡' },
  { id: 'planet-sketch', name: 'Saturn Doodle', category: 'doodles', preview: '🪐' },
  { id: 'tape-kraft', name: 'Masking Tape', category: 'badges', preview: '▭ TAPE' },
  { id: 'barcode-stamp', name: 'Barcode Label', category: 'badges', preview: '||| BARCODE' },
  { id: 'sparkles-sketch', name: 'Four-Point Sparkle', category: 'shapes', preview: '✦' },
]

export interface StickerCategory {
  id: string
  name: string
  emojis: string[]
}

export const STICKER_CATEGORIES: StickerCategory[] = [
  { id: 'doodles', name: 'Doodles', emojis: ['✦', '☆', '♡', '☺', '⚡', '〰️', '➰', '❗', '❓', '➡️', '⭕', '💡'] },
  { id: 'faces', name: 'Emoji', emojis: ['😀', '😁', '😂', '🥲', '😎', '🤩', '🥳', '😇', '🙃', '😴', '🤯', '🫡'] },
  { id: 'memes', name: 'Memes', emojis: ['💀', '😭', '🔥', '🫠', '🤡', '🙄', '🤌', '👀', '🧠', '💯', '🥶', '😮‍💨'] },
  { id: 'animals', name: 'Animals', emojis: ['🐱', '🐶', '🐰', '🐹', '🐻', '🐼', '🦊', '🐸', '🐧', '🦋', '🐢', '🐝'] },
  { id: 'hearts', name: 'Hearts', emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🩷', '🩵', '🖤', '🫶', '💕', '💖'] },
  { id: 'stars', name: 'Stars', emojis: ['⭐', '🌟', '✨', '💫', '⚡', '🌈', '☄️', '🎉', '🎊', '🎆', '🎇', '🪩'] },
  { id: 'flames', name: 'Flames', emojis: ['🔥', '🌶️', '💥', '🧨', '🌋', '♨️', '🥵', '🚀', '🎯', '💢', '💣', '🧯'] },
  { id: 'music', name: 'Music', emojis: ['🎤', '🎧', '🎸', '🎹', '🥁', '🎷', '🎻', '🎺', '🎵', '🎶', '💿', '📻'] },
  { id: 'cute', name: 'Cute', emojis: ['🍓', '🌸', '🧸', '🍒', '☁️', '🎀', '🧁', '🪄', '🌙', '🫧', '🍰', '🛼'] },
  { id: 'travel', name: 'Travel', emojis: ['✈️', '🚗', '🚉', '🏝️', '⛰️', '🗺️', '🧭', '📸', '🛄', '🌅', '🌉', '🎫'] },
]

export interface Sticker {
  id: string
  emoji: string
  /** Optional specialized rendering kind */
  kind?: 'emoji' | 'doodle' | 'text'
  /** Doodle identifier if kind === 'doodle' */
  doodleId?: string
  /** Text sticker style if kind === 'text' */
  textStyle?: 'hand' | 'bubble' | 'badge' | 'outline'
  /** Custom color for doodle or text sticker */
  color?: string
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
export const STICKER_DEFAULT = 78

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
  description: string
  icon: string
  previewImage: string
  accentColor: string
  frames: string[]
  defaultFrame: string
  defaultFilter: string
  defaultLayout: LayoutId
  captions: string[]
  stickerSample: string[]
}

export const MODES: Mode[] = [
  {
    id: 'classic',
    name: 'Classic Booth',
    tagline: 'Timeless and clean',
    description: 'Authentic Seoul four-cut studio strip with crisp borders, frame micro-markers, and barcode stamp.',
    icon: '📸',
    previewImage: '/strips/classic-strip.png',
    accentColor: '#e5e5e5',
    frames: ['cloud', 'ink', 'polaroid', 'mint'],
    defaultFrame: 'cloud',
    defaultFilter: 'soft',
    defaultLayout: 'strip4',
    captions: ['keep yourself alive', 'good friends, better memories', 'the daily four ✦', 'seoul studio 04'],
    stickerSample: ['⭐', '✨', '🫶', '📸'],
  },
  {
    id: 'cinematic',
    name: 'Cinematic',
    tagline: 'Movie-style moments',
    description: '35mm Kodak Portra sprocket borders, warm golden edge numbers, and atmospheric cinema grading.',
    icon: '🎬',
    previewImage: '/strips/concert-cine-strip.png',
    accentColor: '#e5a93c',
    frames: ['filmnoir', 'cinemagold', 'filmsun', 'ink'],
    defaultFrame: 'filmnoir',
    defaultFilter: 'cine',
    defaultLayout: 'strip4',
    captions: ['scene 01 — take 04', 'directed by us', 'now showing', '35mm safety film'],
    stickerSample: ['🎬', '🎞️', '⭐', '🍿'],
  },
  {
    id: 'fun',
    name: 'Fun & Meme',
    tagline: 'Goofy, fun and expressive',
    description: 'Playful sky-and-butter frames, comic speech bubbles, and bold stacked display typography.',
    icon: '🤪',
    previewImage: '/strips/fun-meme-strip.png',
    accentColor: '#facc15',
    frames: ['butter', 'mint', 'blush', 'cloud'],
    defaultFrame: 'butter',
    defaultFilter: 'vivid',
    defaultLayout: 'grid4',
    captions: ['SILLY PEOPLE HAPPY LIVES', 'zero thoughts, head empty', 'main character moment'],
    stickerSample: ['💀', '🤡', '🔥', '💯'],
  },
  {
    id: 'vintage',
    name: 'Vintage Camera',
    tagline: 'Retro film feels',
    description: 'Distressed 1974 parchment card, black Kodak Safety Film inner borders, and warm archival sepia.',
    icon: '📻',
    previewImage: '/strips/vintage-strip.png',
    accentColor: '#d4a373',
    frames: ['tapekraft', 'filmsun', 'kraft', 'polaroid'],
    defaultFrame: 'tapekraft',
    defaultFilter: 'sepia',
    defaultLayout: 'strip4',
    captions: ['JUL 1974', 'film roll №7 — archive', 'faded but golden'],
    stickerSample: ['📻', '🎞️', '🌙', '🧳'],
  },
  {
    id: 'music',
    name: 'Music & Concert',
    tagline: 'For the music lovers',
    description: 'Deep crimson stage lighting, contact-sheet sprockets, and live show ticket barcode aesthetics.',
    icon: '🎧',
    previewImage: '/strips/concert-cine-strip.png',
    accentColor: '#ef4444',
    frames: ['neonmid', 'filmnoir', 'ink', 'lilac'],
    defaultFrame: 'neonmid',
    defaultFilter: 'retro',
    defaultLayout: 'strip4',
    captions: ['front row forever', 'encore ✦ world tour', 'setlist: pure electricity'],
    stickerSample: ['🎤', '🪩', '🎧', '🎶'],
  },
  {
    id: 'cute',
    name: 'Cute & Playful',
    tagline: 'Bright, cheerful and fun',
    description: 'Retro pixel-art hearts, stars, flowers, and rainbows lining the strip with cheerful arcade headers.',
    icon: '🧸',
    previewImage: '/strips/cute-pixel-strip.png',
    accentColor: '#f472b6',
    frames: ['blush', 'lilac', 'cloud', 'mint'],
    defaultFrame: 'blush',
    defaultFilter: 'dream',
    defaultLayout: 'strip4',
    captions: ['SMILE!', 'CUTE! ♥', 'soft launch 💕', 'sugar rush'],
    stickerSample: ['🧸', '🎀', '🍓', '🌸'],
  },
  {
    id: 'editorial',
    name: 'Editorial',
    tagline: 'Chic and stylish',
    description: 'High-fashion monochrome contact strips with an oversized magazine masthead and gallery hairlines.',
    icon: '🖼️',
    previewImage: '/strips/editorial-strip.png',
    accentColor: '#a1a1aa',
    frames: ['editorial', 'cloud', 'ink', 'cinemagold'],
    defaultFrame: 'editorial',
    defaultFilter: 'noir',
    defaultLayout: 'strip4',
    captions: ['ISSUE №01 — PORTRAIT STUDY', 'quiet moments in monochrome', 'archive collection'],
    stickerSample: ['✦', '➰', '✔️', '💡'],
  },
  {
    id: 'travel',
    name: 'Travel Diary',
    tagline: 'Turn moments into postcards',
    description: 'Layered polaroid frames with airmail postmarks, masking tape corners, and handwritten field notes.',
    icon: '✈️',
    previewImage: '/strips/film-bw-strip.png',
    accentColor: '#38bdf8',
    frames: ['ocean', 'tapekraft', 'polaroid', 'kraft'],
    defaultFrame: 'ocean',
    defaultFilter: 'golden',
    defaultLayout: 'strip4',
    captions: ['wish you were here ✈️', 'postcard from tokyo', '35.6762° N, 139.6503° E'],
    stickerSample: ['✈️', '🗺️', '🏝️', '📸'],
  },
]

export type FontId = 'hand' | 'clean' | 'serif' | 'pixel'

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
  customBg?: string
  showGrain?: boolean
  showBarcode?: boolean
}

export interface SamplePhotoSet {
  id: string
  name: string
  subtitle: string
  shots: string[]
}

export const SAMPLE_PHOTO_SETS: SamplePhotoSet[] = [
  {
    id: 'seoul-duo',
    name: 'Seoul Duo',
    subtitle: 'Classic 4-cut studio session',
    shots: [
      '/samples/duo-1.jpg',
      '/samples/duo-2.jpg',
      '/samples/duo-3.jpg',
      '/samples/duo-4.jpg',
      '/samples/solo-1.jpg',
      '/samples/solo-2.jpg',
    ],
  },
  {
    id: 'playful-solo',
    name: 'Booth Portraits',
    subtitle: 'Expressive curtain-booth poses',
    shots: [
      '/samples/solo-1.jpg',
      '/samples/solo-2.jpg',
      '/samples/solo-3.jpg',
      '/samples/solo-4.jpg',
      '/samples/vintage-1.jpg',
      '/samples/vintage-2.jpg',
    ],
  },
  {
    id: 'warm-archive',
    name: 'Warm Archive',
    subtitle: 'Candid analog portrait sequence',
    shots: [
      '/samples/vintage-1.jpg',
      '/samples/vintage-2.jpg',
      '/samples/vintage-3.jpg',
      '/samples/vintage-4.jpg',
      '/samples/duo-1.jpg',
      '/samples/duo-2.jpg',
    ],
  },
]
