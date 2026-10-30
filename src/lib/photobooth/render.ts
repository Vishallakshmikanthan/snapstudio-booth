// ─── SNAPSTUDIO canvas renderer: draws the full strip (WYSIWYG preview + 2x PNG export) ───
import type { FontId, LayoutDef, Sticker, StripConfig } from './data'

const PAD = 50
const HEADER = 64
const GAP = 20
const CORNER = 12

const imgCache = new Map<string, HTMLImageElement>()
let filterSupported: boolean | null = null
let fontsReadyResolved = false

function loadImage(src: string): Promise<HTMLImageElement> {
  const hit = imgCache.get(src)
  if (hit) return Promise.resolve(hit)
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      imgCache.set(src, img)
      resolve(img)
    }
    img.onerror = () => reject(new Error('image failed to load'))
    img.src = src
  })
}

function setTracking(ctx: CanvasRenderingContext2D, value: string) {
  const c = ctx as CanvasRenderingContext2D & { letterSpacing?: string }
  if ('letterSpacing' in c) c.letterSpacing = value
}

function supportsFilter(ctx: CanvasRenderingContext2D) {
  if (filterSupported === null) filterSupported = 'filter' in ctx
  return filterSupported
}

function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.max(0, Math.min(r, w / 2, h / 2))
  ctx.beginPath()
  ctx.moveTo(x + rr, y)
  ctx.arcTo(x + w, y, x + w, y + h, rr)
  ctx.arcTo(x + w, y + h, x, y + h, rr)
  ctx.arcTo(x, y + h, x, y, rr)
  ctx.arcTo(x, y, x + w, y, rr)
  ctx.closePath()
}

export function footerHeight(hasFooter: boolean) {
  return hasFooter ? 140 : 64
}

export function stripSize(layout: LayoutDef, hasFooter: boolean) {
  const w = PAD * 2 + layout.cols * layout.cellW + (layout.cols - 1) * GAP
  const h = PAD + HEADER + layout.rows * layout.cellH + (layout.rows - 1) * GAP + footerHeight(hasFooter) + PAD
  return { w, h }
}

function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number) {
  const ir = img.width / img.height
  const cr = w / h
  let dw = w
  let dh = h
  if (ir > cr) {
    dw = h * ir
  } else {
    dh = w / ir
  }
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh)
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/)
  const lines: string[] = []
  let line = ''
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word
    if (ctx.measureText(candidate).width > maxWidth && line) {
      lines.push(line)
      line = word
    } else {
      line = candidate
    }
  }
  if (line) lines.push(line)
  return lines
}

function drawBarcode(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
  const pattern = [3, 1, 2, 1, 4, 1, 1, 2, 3, 1, 2, 1, 1, 3, 2, 1, 2, 2, 1, 3, 1, 1, 2, 4, 1, 2]
  const totalUnits = pattern.reduce((a, b) => a + b, 0) + pattern.length
  const unitW = w / totalUnits
  ctx.save()
  ctx.fillStyle = color
  let cx = x
  for (let i = 0; i < pattern.length; i++) {
    const bw = pattern[i]! * unitW
    if (i % 2 === 0) {
      ctx.fillRect(cx, y, Math.max(1, bw), h)
    }
    cx += bw + unitW * 0.55
  }
  ctx.restore()
}

function drawPixelIcon(
  ctx: CanvasRenderingContext2D,
  type: 'heart' | 'star' | 'flower' | 'smiley',
  cx: number,
  cy: number,
  size: number,
) {
  ctx.save()
  ctx.translate(cx, cy)
  if (type === 'heart') {
    ctx.fillStyle = '#ef4444'
    ctx.strokeStyle = '#18181b'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(0, size * 0.35)
    ctx.bezierCurveTo(-size * 0.55, -size * 0.1, -size * 0.45, -size * 0.5, 0, -size * 0.18)
    ctx.bezierCurveTo(size * 0.45, -size * 0.5, size * 0.55, -size * 0.1, 0, size * 0.35)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
  } else if (type === 'star') {
    ctx.fillStyle = '#facc15'
    ctx.strokeStyle = '#18181b'
    ctx.lineWidth = 2
    ctx.beginPath()
    for (let i = 0; i < 5; i++) {
      const a1 = ((i * 72 - 90) * Math.PI) / 180
      const a2 = (((i + 0.5) * 72 - 90) * Math.PI) / 180
      const r1 = size * 0.48
      const r2 = size * 0.22
      if (i === 0) ctx.moveTo(Math.cos(a1) * r1, Math.sin(a1) * r1)
      else ctx.lineTo(Math.cos(a1) * r1, Math.sin(a1) * r1)
      ctx.lineTo(Math.cos(a2) * r2, Math.sin(a2) * r2)
    }
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
  } else if (type === 'flower') {
    ctx.strokeStyle = '#18181b'
    ctx.lineWidth = 1.8
    ctx.fillStyle = '#f472b6'
    for (let i = 0; i < 5; i++) {
      const a = (i * 72 * Math.PI) / 180
      ctx.beginPath()
      ctx.arc(Math.cos(a) * size * 0.22, Math.sin(a) * size * 0.22, size * 0.17, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
    }
    ctx.fillStyle = '#facc15'
    ctx.beginPath()
    ctx.arc(0, 0, size * 0.14, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
  } else {
    ctx.fillStyle = '#fde047'
    ctx.strokeStyle = '#18181b'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(0, 0, size * 0.4, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
    ctx.fillStyle = '#18181b'
    ctx.fillRect(-size * 0.16, -size * 0.12, 3, 4)
    ctx.fillRect(size * 0.1, -size * 0.12, 3, 4)
    ctx.beginPath()
    ctx.arc(0, size * 0.04, size * 0.18, 0.15 * Math.PI, 0.85 * Math.PI)
    ctx.stroke()
  }
  ctx.restore()
}

function drawDoodleSticker(ctx: CanvasRenderingContext2D, s: Sticker, defaultFg: string) {
  const r = s.size / 2
  const strokeColor = s.color || (defaultFg === '#1c1c21' ? '#f59e0b' : '#ffffff')
  ctx.save()
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  switch (s.doodleId) {
    case 'star-sketch': {
      ctx.strokeStyle = s.color || '#facc15'
      ctx.lineWidth = Math.max(2.5, s.size * 0.045)
      ctx.beginPath()
      for (let i = 0; i <= 5; i++) {
        const idx = (i * 2) % 5
        const angle = ((idx * 72 - 90) * Math.PI) / 180
        const x = Math.cos(angle) * r * 0.85
        const y = Math.sin(angle) * r * 0.85
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.stroke()
      break
    }
    case 'heart-sketch': {
      ctx.strokeStyle = s.color || '#f43f5e'
      ctx.lineWidth = Math.max(2.8, s.size * 0.05)
      ctx.beginPath()
      ctx.moveTo(0, r * 0.65)
      ctx.bezierCurveTo(-r * 1.1, -r * 0.1, -r * 0.85, -r * 0.9, 0, -r * 0.3)
      ctx.bezierCurveTo(r * 0.85, -r * 0.9, r * 1.1, -r * 0.1, 0, r * 0.65)
      ctx.stroke()
      break
    }
    case 'sparkles-sketch': {
      ctx.strokeStyle = s.color || '#fde047'
      ctx.fillStyle = s.color || '#fde047'
      ctx.lineWidth = Math.max(2, s.size * 0.04)
      ctx.beginPath()
      ctx.moveTo(0, -r * 0.9)
      ctx.quadraticCurveTo(0, 0, r * 0.9, 0)
      ctx.quadraticCurveTo(0, 0, 0, r * 0.9)
      ctx.quadraticCurveTo(0, 0, -r * 0.9, 0)
      ctx.quadraticCurveTo(0, 0, 0, -r * 0.9)
      ctx.closePath()
      ctx.stroke()
      break
    }
    case 'good-vibes': {
      ctx.font = `700 ${Math.round(s.size * 0.42)}px "Caveat", cursive`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.strokeStyle = '#111114'
      ctx.lineWidth = 4
      ctx.strokeText('GOOD', 0, -s.size * 0.18)
      ctx.strokeText('VIBES ✦', 0, s.size * 0.18)
      ctx.fillStyle = s.color || '#fef08a'
      ctx.fillText('GOOD', 0, -s.size * 0.18)
      ctx.fillText('VIBES ✦', 0, s.size * 0.18)
      break
    }
    case 'love-script': {
      ctx.font = `700 ${Math.round(s.size * 0.56)}px "Caveat", cursive`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.strokeStyle = '#111114'
      ctx.lineWidth = 4
      ctx.strokeText('LOVE ♡', 0, 0)
      ctx.fillStyle = s.color || '#fb7185'
      ctx.fillText('LOVE ♡', 0, 0)
      break
    }
    case 'tokyo-script': {
      ctx.font = `700 ${Math.round(s.size * 0.52)}px "Caveat", cursive`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.strokeStyle = '#111114'
      ctx.lineWidth = 3.5
      ctx.strokeText('Tokyo! ✦', 0, 0)
      ctx.fillStyle = s.color || '#f8fafc'
      ctx.fillText('Tokyo! ✦', 0, 0)
      break
    }
    case 'cute-tag':
    case 'speech-nah':
    case 'speech-main':
    case 'speech-wish': {
      const label =
        s.doodleId === 'cute-tag'
          ? 'CUTE! ♥'
          : s.doodleId === 'speech-nah'
            ? '음. 아니야.'
            : s.doodleId === 'speech-main'
              ? 'MAIN CHARACTER'
              : 'MAKE A WISH ×5'
      const fontPx = Math.max(14, Math.round(s.size * 0.25))
      ctx.font = `700 ${fontPx}px "Plus Jakarta Sans", "Space Grotesk", sans-serif`
      const tw = ctx.measureText(label).width
      const bw = tw + fontPx * 1.4
      const bh = fontPx * 2.0
      ctx.fillStyle = '#ffffff'
      ctx.strokeStyle = '#18181b'
      ctx.lineWidth = 2.5
      roundRectPath(ctx, -bw / 2, -bh / 2, bw, bh, bh / 2)
      ctx.fill()
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(-bw * 0.15, bh / 2 - 1)
      ctx.lineTo(-bw * 0.28, bh / 2 + fontPx * 0.45)
      ctx.lineTo(-bw * 0.02, bh / 2 - 1)
      ctx.fill()
      ctx.stroke()
      ctx.fillStyle = '#18181b'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(label, 0, 1)
      break
    }
    case 'tape-kraft': {
      const tw = s.size * 1.5
      const th = s.size * 0.42
      ctx.fillStyle = 'rgba(246, 232, 198, 0.78)'
      ctx.strokeStyle = 'rgba(120, 95, 60, 0.35)'
      ctx.lineWidth = 1.5
      ctx.fillRect(-tw / 2, -th / 2, tw, th)
      ctx.strokeRect(-tw / 2, -th / 2, tw, th)
      break
    }
    case 'barcode-stamp': {
      const bw = s.size * 1.55
      const bh = s.size * 0.56
      ctx.fillStyle = '#ffffff'
      ctx.strokeStyle = '#18181b'
      ctx.lineWidth = 2
      roundRectPath(ctx, -bw / 2, -bh / 2, bw, bh, 6)
      ctx.fill()
      ctx.stroke()
      drawBarcode(ctx, -bw / 2 + 10, -bh / 2 + 8, bw - 20, bh - 20, '#18181b')
      break
    }
    case 'smiley-sketch': {
      ctx.strokeStyle = s.color || '#facc15'
      ctx.lineWidth = Math.max(2.5, s.size * 0.045)
      ctx.beginPath()
      ctx.arc(0, 0, r * 0.72, 0, Math.PI * 2)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(-r * 0.24, -r * 0.15, r * 0.06, 0, Math.PI * 2)
      ctx.arc(r * 0.24, -r * 0.15, r * 0.06, 0, Math.PI * 2)
      ctx.fillStyle = s.color || '#facc15'
      ctx.fill()
      ctx.beginPath()
      ctx.arc(0, r * 0.05, r * 0.36, 0.15 * Math.PI, 0.85 * Math.PI)
      ctx.stroke()
      break
    }
    case 'cat-sketch': {
      ctx.strokeStyle = strokeColor
      ctx.lineWidth = Math.max(2.5, s.size * 0.045)
      ctx.beginPath()
      ctx.arc(0, r * 0.1, r * 0.55, 0.1 * Math.PI, 0.9 * Math.PI)
      ctx.lineTo(-r * 0.55, -r * 0.55)
      ctx.lineTo(-r * 0.18, -r * 0.3)
      ctx.lineTo(r * 0.18, -r * 0.3)
      ctx.lineTo(r * 0.55, -r * 0.55)
      ctx.closePath()
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(-r * 0.35, r * 0.08)
      ctx.lineTo(-r * 0.75, r * 0.02)
      ctx.moveTo(-r * 0.35, r * 0.18)
      ctx.lineTo(-r * 0.75, r * 0.22)
      ctx.moveTo(r * 0.35, r * 0.08)
      ctx.lineTo(r * 0.75, r * 0.02)
      ctx.moveTo(r * 0.35, r * 0.18)
      ctx.lineTo(r * 0.75, r * 0.22)
      ctx.stroke()
      break
    }
    default: {
      ctx.font = `${s.size}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(s.emoji, 0, 0)
    }
  }
  ctx.restore()
}

function drawTextSticker(ctx: CanvasRenderingContext2D, s: Sticker) {
  const text = s.emoji || 'SnapStudio'
  const style = s.textStyle || 'hand'
  ctx.save()
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  if (style === 'bubble') {
    const fontPx = Math.max(15, Math.round(s.size * 0.3))
    ctx.font = `700 ${fontPx}px "Plus Jakarta Sans", "Space Grotesk", sans-serif`
    const tw = ctx.measureText(text).width
    const bw = tw + fontPx * 1.4
    const bh = fontPx * 1.9
    ctx.fillStyle = s.color || '#ffffff'
    ctx.strokeStyle = '#141416'
    ctx.lineWidth = 2.5
    roundRectPath(ctx, -bw / 2, -bh / 2, bw, bh, bh / 2)
    ctx.fill()
    ctx.stroke()
    ctx.fillStyle = '#141416'
    ctx.fillText(text, 0, 1)
  } else if (style === 'badge') {
    const fontPx = Math.max(14, Math.round(s.size * 0.28))
    ctx.font = `700 ${fontPx}px "Space Grotesk", sans-serif`
    const tw = ctx.measureText(text.toUpperCase()).width
    const bw = tw + fontPx * 1.3
    const bh = fontPx * 1.75
    ctx.fillStyle = '#141416'
    ctx.strokeStyle = s.color || '#facc15'
    ctx.lineWidth = 2
    roundRectPath(ctx, -bw / 2, -bh / 2, bw, bh, 8)
    ctx.fill()
    ctx.stroke()
    ctx.fillStyle = s.color || '#facc15'
    ctx.fillText(text.toUpperCase(), 0, 1)
  } else if (style === 'outline') {
    const fontPx = Math.max(18, Math.round(s.size * 0.45))
    ctx.font = `800 ${fontPx}px "Space Grotesk", sans-serif`
    ctx.strokeStyle = '#111114'
    ctx.lineWidth = 5
    ctx.strokeText(text, 0, 0)
    ctx.fillStyle = s.color || '#ffffff'
    ctx.fillText(text, 0, 0)
  } else {
    const fontPx = Math.max(22, Math.round(s.size * 0.58))
    ctx.font = `700 ${fontPx}px "Caveat", cursive`
    ctx.strokeStyle = 'rgba(17,17,20,0.75)'
    ctx.lineWidth = 4
    ctx.strokeText(text, 0, 0)
    ctx.fillStyle = s.color || '#fef08a'
    ctx.fillText(text, 0, 0)
  }
  ctx.restore()
}

function getCaptionFont(fontId: FontId, handSize = 42, cleanSize = 24) {
  switch (fontId) {
    case 'hand':
      return { font: `600 ${handSize}px "Caveat", cursive`, lineH: handSize + 4 }
    case 'serif':
      return { font: `italic 400 ${cleanSize + 10}px "Instrument Serif", Georgia, serif`, lineH: cleanSize + 14 }
    case 'pixel':
      return { font: `700 ${cleanSize - 2}px "Silkscreen", monospace`, lineH: cleanSize + 6 }
    default:
      return { font: `600 ${cleanSize}px "Space Grotesk", sans-serif`, lineH: cleanSize + 8 }
  }
}

export async function drawStrip(canvas: HTMLCanvasElement, config: StripConfig, scale = 1) {
  const { layout, frame, filter } = config
  const shots = config.shots.slice(0, layout.slots)
  const caption = config.caption.trim()
  const hasFooter = Boolean(caption || config.dateStamp || config.showBarcode !== false)
  const { w, h } = stripSize(layout, hasFooter)

  if (!fontsReadyResolved && typeof document !== 'undefined' && document.fonts?.ready) {
    try {
      await document.fonts.ready
      fontsReadyResolved = true
    } catch {
      fontsReadyResolved = true
    }
  }

  const loadedImages: (HTMLImageElement | null)[] = []
  for (let i = 0; i < layout.cols * layout.rows; i++) {
    const shot = shots[i]
    if (!shot) {
      loadedImages.push(null)
      continue
    }
    const cached = imgCache.get(shot)
    if (cached) {
      loadedImages.push(cached)
    } else {
      try {
        loadedImages.push(await loadImage(shot))
      } catch {
        loadedImages.push(null)
      }
    }
  }

  canvas.width = Math.round(w * scale)
  canvas.height = Math.round(h * scale)
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.setTransform(scale, 0, 0, scale, 0, 0)
  ctx.clearRect(0, 0, w, h)
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'

  const bgColor = config.customBg || frame.bg
  const fgColor = frame.fg

  ctx.fillStyle = bgColor
  ctx.fillRect(0, 0, w, h)

  if (frame.style === 'meme' && !config.customBg) {
    const grad = ctx.createLinearGradient(0, 0, 0, h)
    grad.addColorStop(0, '#d8ecfa')
    grad.addColorStop(0.65, '#e8f3fc')
    grad.addColorStop(1, '#fef08a')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, w, h)
  } else if (frame.style === 'vintage74') {
    const grad = ctx.createRadialGradient(w / 2, h / 2, w * 0.1, w / 2, h / 2, Math.max(w, h) * 0.7)
    grad.addColorStop(0, bgColor)
    grad.addColorStop(1, '#c5b089')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, w, h)
    ctx.strokeStyle = 'rgba(72, 52, 28, 0.25)'
    ctx.lineWidth = 8
    ctx.strokeRect(4, 4, w - 8, h - 8)
  } else if (frame.style === 'concert' && !config.customBg) {
    const grad = ctx.createLinearGradient(0, 0, w, h)
    grad.addColorStop(0, '#160709')
    grad.addColorStop(0.5, '#260b10')
    grad.addColorStop(1, '#0f0507')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, w, h)
  }

  if (frame.style === 'film' || frame.style === 'concert') {
    const sprocketColor = frame.style === 'concert' ? 'rgba(255, 220, 220, 0.85)' : '#f4f1ea'
    const edgeAccent = frame.accent || '#e5a93c'
    ctx.fillStyle = sprocketColor
    for (let y = 26; y < h - 32; y += 38) {
      roundRectPath(ctx, 13, y, 16, 22, 3.5)
      ctx.fill()
      roundRectPath(ctx, w - 29, y, 16, 22, 3.5)
      ctx.fill()
    }
    ctx.save()
    ctx.fillStyle = edgeAccent
    ctx.font = '600 11px "JetBrains Mono", monospace'
    ctx.globalAlpha = 0.85
    let frameNum = 21
    for (let y = 120; y < h - 100; y += 260) {
      ctx.save()
      ctx.translate(38, y)
      ctx.rotate(-Math.PI / 2)
      ctx.fillText(`KODAK PORTRA 400`, 0, 0)
      ctx.restore()

      ctx.save()
      ctx.translate(w - 35, y - 40)
      ctx.rotate(-Math.PI / 2)
      ctx.fillText(`◁ ${frameNum}A   ${frameNum + 1}`, 0, 0)
      ctx.restore()
      frameNum++
    }
    ctx.restore()
  }

  if (frame.style === 'photoism') {
    ctx.save()
    ctx.fillStyle = fgColor
    ctx.globalAlpha = 0.72
    ctx.font = '700 11px "Space Grotesk", sans-serif'
    for (let r = 0; r < layout.rows; r++) {
      const ry = PAD + HEADER + r * (layout.cellH + GAP) + layout.cellH * 0.55
      ctx.fillText(`▶ ${r + 1}`, 16, ry)
      ctx.save()
      ctx.translate(w - 16, ry + 40)
      ctx.rotate(-Math.PI / 2)
      setTracking(ctx, '1.5px')
      ctx.fillText(r % 2 === 0 ? 'KEEP YOURSELF ALIVE' : 'SnapStudio', 0, 0)
      setTracking(ctx, '0px')
      ctx.restore()
    }
    ctx.restore()
  }

  if (frame.style === 'pixel') {
    const types: ('heart' | 'star' | 'flower' | 'smiley')[] = ['heart', 'star', 'flower', 'smiley']
    let ti = 0
    for (let y = PAD + HEADER + 28; y < h - footerHeight(hasFooter) - 20; y += 64) {
      const iconType = types[ti % types.length]!
      drawPixelIcon(ctx, iconType, 25, y, 26)
      drawPixelIcon(ctx, iconType, w - 25, y, 26)
      ti++
    }
  }

  const photosTop = PAD + HEADER

  if (frame.style === 'vintage74') {
    const stackW = layout.cols * layout.cellW + (layout.cols - 1) * GAP + 36
    const stackH = layout.rows * layout.cellH + (layout.rows - 1) * GAP + 28
    const sx = (w - stackW) / 2
    const sy = photosTop - 14
    ctx.fillStyle = '#181512'
    ctx.fillRect(sx, sy, stackW, stackH)
    ctx.save()
    ctx.fillStyle = '#d6c7a9'
    ctx.font = '600 11px "JetBrains Mono", monospace'
    for (let r = 0; r < layout.rows; r++) {
      const ry = photosTop + r * (layout.cellH + GAP) + layout.cellH - 24
      ctx.save()
      ctx.translate(sx + 13, ry)
      ctx.rotate(-Math.PI / 2)
      ctx.fillText(r % 2 === 0 ? 'KODAK SAFETY FILM 5063' : `${r + 2}`, 0, 0)
      ctx.restore()
    }
    ctx.fillStyle = '#3d3022'
    ctx.globalAlpha = 0.78
    ctx.font = '700 20px "JetBrains Mono", monospace'
    ctx.translate(w - 14, photosTop + stackH * 0.55)
    ctx.rotate(-Math.PI / 2)
    ctx.fillText(config.dateStr || 'JUL 1974', 0, 0)
    ctx.restore()
  }

  const headY = PAD + 36
  ctx.fillStyle = fgColor

  if (frame.style === 'photoism') {
    const pillW = 152
    const pillH = 34
    ctx.save()
    ctx.strokeStyle = fgColor
    ctx.lineWidth = 1.6
    ctx.beginPath()
    ctx.ellipse(w / 2, PAD + 24, pillW / 2, pillH / 2, 0, 0, Math.PI * 2)
    ctx.stroke()
    ctx.font = '700 16px "Instrument Serif", Georgia, serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    setTracking(ctx, '1.5px')
    ctx.fillText('snapstudio', w / 2, PAD + 25)
    setTracking(ctx, '0px')
    ctx.restore()
  } else if (frame.style === 'pixel') {
    ctx.save()
    ctx.font = '700 24px "Silkscreen", "JetBrains Mono", monospace'
    ctx.fillStyle = fgColor
    ctx.fillText('PHOTO BOOTH', PAD, headY)
    ctx.textAlign = 'right'
    ctx.fillText(new Date().getFullYear().toString(), w - PAD, headY)
    ctx.restore()
  } else if (frame.style === 'editorial') {
    ctx.save()
    ctx.font = '800 44px "Space Grotesk", sans-serif'
    ctx.fillStyle = fgColor
    setTracking(ctx, '-1.5px')
    ctx.fillText('SnapStudio', PAD - 2, headY + 6)
    setTracking(ctx, '0px')
    ctx.font = '500 12px "JetBrains Mono", monospace'
    ctx.textAlign = 'right'
    ctx.fillText('ARCHIVE ISSUE №01', w - PAD, headY)
    ctx.restore()
  } else {
    ctx.globalAlpha = 0.95
    ctx.font = '700 18px "Space Grotesk", sans-serif'
    setTracking(ctx, '3px')
    ctx.fillText('✦ SnapStudio', PAD + 4, headY)
    ctx.font = '500 13px "Space Grotesk", sans-serif'
    ctx.globalAlpha = 0.65
    ctx.textAlign = 'right'
    ctx.fillText((config.modeName || '').toUpperCase(), w - PAD - 4, headY)
    setTracking(ctx, '0px')
    ctx.textAlign = 'left'
    ctx.globalAlpha = 1
    ctx.strokeStyle = fgColor
    ctx.globalAlpha = 0.2
    ctx.lineWidth = 1.2
    ctx.beginPath()
    ctx.moveTo(PAD, PAD + HEADER - 14)
    ctx.lineTo(w - PAD, PAD + HEADER - 14)
    ctx.stroke()
    ctx.globalAlpha = 1
  }

  const isPolaroid = frame.style === 'polaroid' || frame.style === 'postcard'
  const cellCorner =
    frame.style === 'photoism' || frame.style === 'vintage74' || frame.style === 'editorial' ? 3 : CORNER
  const inset = isPolaroid ? { x: 10, y: 10, bottom: 32 } : { x: 0, y: 0, bottom: 0 }

  for (let idx = 0; idx < layout.cols * layout.rows; idx++) {
    const col = idx % layout.cols
    const row = Math.floor(idx / layout.cols)
    const cx = PAD + col * (layout.cellW + GAP)
    const cy = photosTop + row * (layout.cellH + GAP)

    if (isPolaroid) {
      ctx.save()
      ctx.fillStyle = '#ffffff'
      ctx.shadowColor = 'rgba(0,0,0,0.14)'
      ctx.shadowBlur = 14
      ctx.shadowOffsetY = 4
      roundRectPath(ctx, cx, cy, layout.cellW, layout.cellH, 8)
      ctx.fill()
      ctx.restore()
    } else {
      ctx.fillStyle = fgColor
      ctx.globalAlpha = 0.06
      roundRectPath(ctx, cx, cy, layout.cellW, layout.cellH, cellCorner)
      ctx.fill()
      ctx.globalAlpha = 1
    }

    const x = cx + inset.x
    const y = cy + inset.y
    const pw = layout.cellW - inset.x * 2
    const ph = layout.cellH - inset.y - inset.bottom
    const img = loadedImages[idx]

    ctx.save()
    roundRectPath(ctx, x, y, pw, ph, Math.max(2, cellCorner - 2))
    ctx.clip()
    if (img) {
      if (filter.css && supportsFilter(ctx)) ctx.filter = filter.css
      drawCover(ctx, img, x, y, pw, ph)
      if (filter.css) ctx.filter = 'none'

      if (frame.style === 'concert') {
        const stageGrad = ctx.createLinearGradient(x, y, x + pw, y + ph)
        stageGrad.addColorStop(0, 'rgba(220, 38, 38, 0.22)')
        stageGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0)')
        stageGrad.addColorStop(1, 'rgba(239, 68, 68, 0.18)')
        ctx.fillStyle = stageGrad
        ctx.fillRect(x, y, pw, ph)
      }
    } else {
      ctx.fillStyle = fgColor
      ctx.globalAlpha = 0.05
      ctx.fillRect(x, y, pw, ph)
      ctx.globalAlpha = 0.3
      ctx.strokeStyle = fgColor
      ctx.lineWidth = 2
      ctx.setLineDash([10, 8])
      roundRectPath(ctx, x + 12, y + 12, pw - 24, ph - 24, 8)
      ctx.stroke()
      ctx.setLineDash([])
      ctx.globalAlpha = 0.42
      ctx.font = '600 28px "Space Grotesk", sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(`SHOT 0${idx + 1}`, x + pw / 2, y + ph / 2)
      ctx.textAlign = 'left'
      ctx.textBaseline = 'alphabetic'
      ctx.globalAlpha = 1
    }
    ctx.restore()
  }

  if (frame.style === 'tape' || frame.style === 'postcard') {
    let i = 0
    for (let idx = 0; idx < layout.cols * layout.rows; idx++) {
      const col = idx % layout.cols
      const row = Math.floor(idx / layout.cols)
      const cx = PAD + col * (layout.cellW + GAP) + layout.cellW / 2
      const cy = photosTop + row * (layout.cellH + GAP) + 4
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate((i++ % 2 ? 3.2 : -3.2) * (Math.PI / 180))
      ctx.fillStyle = 'rgba(252, 246, 225, 0.65)'
      ctx.fillRect(-58, -13, 116, 26)
      ctx.strokeStyle = 'rgba(0,0,0,0.08)'
      ctx.lineWidth = 1
      ctx.strokeRect(-58, -13, 116, 26)
      ctx.restore()
    }
  }

  if (frame.style === 'postcard') {
    ctx.save()
    ctx.strokeStyle = 'rgba(194, 65, 12, 0.55)'
    ctx.fillStyle = 'rgba(194, 65, 12, 0.55)'
    ctx.lineWidth = 1.8
    const sx = w - PAD - 56
    const sy = photosTop + 44
    ctx.beginPath()
    ctx.arc(sx, sy, 32, 0, Math.PI * 2)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(sx, sy, 26, 0, Math.PI * 2)
    ctx.stroke()
    ctx.font = '700 9px "JetBrains Mono", monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('AIR MAIL', sx, sy - 6)
    ctx.fillText(config.dateStr.slice(0, 6).toUpperCase(), sx, sy + 6)
    ctx.restore()
  }

  if (frame.style === 'lines' || frame.style === 'editorial') {
    ctx.strokeStyle = frame.accent ?? fgColor
    ctx.globalAlpha = frame.style === 'editorial' ? 0.85 : 0.9
    ctx.lineWidth = frame.style === 'editorial' ? 1.5 : 2
    for (let idx = 0; idx < layout.cols * layout.rows; idx++) {
      const col = idx % layout.cols
      const row = Math.floor(idx / layout.cols)
      const cx = PAD + col * (layout.cellW + GAP)
      const cy = photosTop + row * (layout.cellH + GAP)
      roundRectPath(ctx, cx, cy, layout.cellW, layout.cellH, cellCorner)
      ctx.stroke()
    }
    ctx.globalAlpha = 1
  }

  if (frame.style === 'neon') {
    ctx.save()
    ctx.strokeStyle = frame.accent ?? fgColor
    ctx.shadowColor = frame.accent ?? fgColor
    ctx.shadowBlur = 18
    ctx.lineWidth = 3
    roundRectPath(ctx, 20, 20, w - 40, h - 40, 20)
    ctx.stroke()
    ctx.restore()
  }

  if (hasFooter) {
    const footTop = photosTop + layout.rows * layout.cellH + (layout.rows - 1) * GAP + 18
    let yy = footTop
    ctx.textAlign = 'center'
    ctx.fillStyle = fgColor

    if (caption) {
      if (frame.style === 'meme') {
        ctx.font = '800 32px "Space Grotesk", sans-serif'
        const lines = wrapText(ctx, caption.toUpperCase(), w - PAD * 2).slice(0, 2)
        ctx.textBaseline = 'middle'
        for (const line of lines) {
          ctx.fillText(line, w / 2, yy + 18)
          yy += 34
        }
      } else {
        const { font, lineH } = getCaptionFont(config.fontId)
        ctx.font = font
        const lines = wrapText(ctx, caption, w - PAD * 2).slice(0, 2)
        ctx.textBaseline = 'middle'
        for (const line of lines) {
          ctx.fillText(line, w / 2, yy + lineH / 2)
          yy += lineH
        }
      }
      yy += 6
    } else if (frame.style === 'photoism') {
      ctx.font = '500 15px "Instrument Serif", Georgia, serif'
      ctx.globalAlpha = 0.85
      ctx.textBaseline = 'middle'
      ctx.fillText('keep yourself alive at  SnapStudio', w / 2, yy + 22)
      yy += 38
      ctx.globalAlpha = 1
    } else if (frame.style === 'pixel') {
      ctx.font = '700 24px "Silkscreen", monospace'
      ctx.textBaseline = 'middle'
      ctx.fillText('SMILE!', w / 2, yy + 22)
      yy += 38
    }

    const bottomRowY = h - PAD - 12
    if (config.dateStamp) {
      ctx.font = '600 13px "JetBrains Mono", "Space Grotesk", sans-serif'
      setTracking(ctx, '3px')
      ctx.globalAlpha = 0.7
      ctx.textBaseline = 'middle'
      if (config.showBarcode !== false) {
        ctx.textAlign = 'left'
        ctx.fillText(config.dateStr.toUpperCase(), PAD, bottomRowY)
        drawBarcode(ctx, w - PAD - 118, bottomRowY - 11, 118, 22, fgColor)
      } else {
        ctx.textAlign = 'center'
        ctx.fillText(config.dateStr.toUpperCase(), w / 2, bottomRowY)
      }
      setTracking(ctx, '0px')
      ctx.globalAlpha = 1
    } else if (config.showBarcode !== false) {
      ctx.globalAlpha = 0.72
      drawBarcode(ctx, w / 2 - 64, bottomRowY - 11, 128, 22, fgColor)
      ctx.globalAlpha = 1
    }

    ctx.textBaseline = 'alphabetic'
    ctx.textAlign = 'left'
  }

  if (config.showGrain || frame.style === 'film' || frame.style === 'vintage74' || frame.style === 'concert') {
    ctx.save()
    ctx.fillStyle = fgColor
    ctx.globalAlpha = 0.025
    for (let gx = 12; gx < w; gx += 28) {
      for (let gy = 12; gy < h; gy += 28) {
        if ((gx * 17 + gy * 31) % 5 === 0) {
          ctx.fillRect(gx, gy, 2, 2)
        }
      }
    }
    ctx.restore()
  }

  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  for (const s of config.stickers) {
    ctx.save()
    ctx.translate(s.x * w, s.y * h)
    ctx.rotate((s.rot * Math.PI) / 180)
    if (s.kind === 'doodle' && s.doodleId) {
      drawDoodleSticker(ctx, s, fgColor)
    } else if (s.kind === 'text') {
      drawTextSticker(ctx, s)
    } else {
      ctx.font = `${s.size}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`
      ctx.fillText(s.emoji, 0, 0)
    }
    ctx.restore()
  }
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
}

export async function exportStripPng(config: StripConfig): Promise<Blob> {
  const canvas = document.createElement('canvas')
  await drawStrip(canvas, config, 2)
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('PNG export failed'))), 'image/png'),
  )
}
