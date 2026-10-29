// ─── SNAPSTUDIO canvas renderer: draws the full strip (WYSIWYG preview + PNG export) ───
import type { LayoutDef, StripConfig } from './data'

const PAD = 46
const HEADER = 56
const GAP = 22
const CORNER = 16

const imgCache = new Map<string, HTMLImageElement>()
let filterSupported: boolean | null = null

function loadImage(src: string): Promise<HTMLImageElement> {
  const hit = imgCache.get(src)
  if (hit) return Promise.resolve(hit)
  return new Promise((resolve, reject) => {
    const img = new Image()
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
  return hasFooter ? 128 : 28
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

export async function drawStrip(canvas: HTMLCanvasElement, config: StripConfig, scale = 1) {
  const { layout, frame, filter } = config
  const shots = config.shots.slice(0, layout.slots)
  const caption = config.caption.trim()
  const hasFooter = Boolean(caption || config.dateStamp)
  const { w, h } = stripSize(layout, hasFooter)

  if (typeof document !== 'undefined' && document.fonts?.ready) {
    try {
      await document.fonts.ready
    } catch {
      /* fonts API unavailable — draw anyway */
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

  // ── background ──
  ctx.fillStyle = frame.bg
  ctx.fillRect(0, 0, w, h)

  // ── film perforations (under photos) ──
  if (frame.style === 'film') {
    ctx.fillStyle = frame.fg
    ctx.globalAlpha = 0.3
    for (let y = 20; y < h - 30; y += 36) {
      roundRectPath(ctx, 14, y, 16, 22, 4)
      ctx.fill()
      roundRectPath(ctx, w - 30, y, 16, 22, 4)
      ctx.fill()
    }
    ctx.globalAlpha = 1
  }

  // ── header ──
  const headY = PAD + 34
  ctx.fillStyle = frame.fg
  ctx.globalAlpha = 0.95
  ctx.font = '700 19px "Space Grotesk", sans-serif'
  setTracking(ctx, '3px')
  ctx.fillText('✦ SNAPSTUDIO', PAD + 6, headY)
  ctx.font = '500 14px "Space Grotesk", sans-serif'
  ctx.globalAlpha = 0.65
  ctx.textAlign = 'right'
  ctx.fillText((config.modeName || '').toUpperCase(), w - PAD - 6, headY)
  setTracking(ctx, '0px')
  ctx.textAlign = 'left'
  ctx.globalAlpha = 1
  ctx.strokeStyle = frame.fg
  ctx.globalAlpha = 0.22
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(PAD, PAD + HEADER - 14)
  ctx.lineTo(w - PAD, PAD + HEADER - 14)
  ctx.stroke()
  ctx.globalAlpha = 1

  // ── photo cells ──
  const photosTop = PAD + HEADER
  const isPolaroid = frame.style === 'polaroid'
  const inset = isPolaroid ? { x: 12, y: 12, bottom: 36 } : { x: 0, y: 0, bottom: 0 }

  for (let idx = 0; idx < layout.cols * layout.rows; idx++) {
    const col = idx % layout.cols
    const row = Math.floor(idx / layout.cols)
    const cx = PAD + col * (layout.cellW + GAP)
    const cy = photosTop + row * (layout.cellH + GAP)

    // faint cell backing
    ctx.fillStyle = frame.fg
    ctx.globalAlpha = 0.06
    roundRectPath(ctx, cx, cy, layout.cellW, layout.cellH, CORNER)
    ctx.fill()
    ctx.globalAlpha = 1

    const x = cx + inset.x
    const y = cy + inset.y
    const pw = layout.cellW - inset.x * 2
    const ph = layout.cellH - inset.y - inset.bottom
    const shot = shots[idx]

    ctx.save()
    roundRectPath(ctx, x, y, pw, ph, CORNER - 4)
    ctx.clip()
    if (shot) {
      try {
        const img = await loadImage(shot)
        if (filter.css && supportsFilter(ctx)) ctx.filter = filter.css
        drawCover(ctx, img, x, y, pw, ph)
        if (filter.css) ctx.filter = 'none'
      } catch {
        /* broken image — leave placeholder */
      }
    } else {
      ctx.fillStyle = frame.fg
      ctx.globalAlpha = 0.05
      ctx.fillRect(x, y, pw, ph)
      ctx.globalAlpha = 0.32
      ctx.strokeStyle = frame.fg
      ctx.lineWidth = 2
      ctx.setLineDash([10, 8])
      roundRectPath(ctx, x + 12, y + 12, pw - 24, ph - 24, 10)
      ctx.stroke()
      ctx.setLineDash([])
      ctx.globalAlpha = 0.42
      ctx.font = '600 30px "Space Grotesk", sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('+', x + pw / 2, y + ph / 2)
      ctx.textAlign = 'left'
      ctx.textBaseline = 'alphabetic'
      ctx.globalAlpha = 1
    }
    ctx.restore()
  }

  // ── frame style overlays ──
  if (frame.style === 'tape') {
    let i = 0
    for (let idx = 0; idx < layout.cols * layout.rows; idx++) {
      const col = idx % layout.cols
      const row = Math.floor(idx / layout.cols)
      const cx = PAD + col * (layout.cellW + GAP) + layout.cellW / 2
      const cy = photosTop + row * (layout.cellH + GAP) + 4
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate((i++ % 2 ? 3.5 : -3.5) * (Math.PI / 180))
      ctx.fillStyle = 'rgba(255,255,255,0.55)'
      ctx.fillRect(-58, -14, 116, 28)
      ctx.strokeStyle = 'rgba(0,0,0,0.07)'
      ctx.lineWidth = 1
      ctx.strokeRect(-58, -14, 116, 28)
      ctx.restore()
    }
  }

  if (frame.style === 'lines') {
    ctx.strokeStyle = frame.accent ?? frame.fg
    ctx.globalAlpha = 0.9
    ctx.lineWidth = 2
    for (let idx = 0; idx < layout.cols * layout.rows; idx++) {
      const col = idx % layout.cols
      const row = Math.floor(idx / layout.cols)
      const cx = PAD + col * (layout.cellW + GAP)
      const cy = photosTop + row * (layout.cellH + GAP)
      roundRectPath(ctx, cx, cy, layout.cellW, layout.cellH, CORNER)
      ctx.stroke()
    }
    ctx.globalAlpha = 1
  }

  if (frame.style === 'neon') {
    ctx.save()
    ctx.strokeStyle = frame.accent ?? frame.fg
    ctx.shadowColor = frame.accent ?? frame.fg
    ctx.shadowBlur = 16
    ctx.lineWidth = 3
    roundRectPath(ctx, 22, 22, w - 44, h - 44, 20)
    ctx.stroke()
    ctx.restore()
  }

  // ── footer: caption + date ──
  if (hasFooter) {
    const footTop = photosTop + layout.rows * layout.cellH + (layout.rows - 1) * GAP + 16
    const hand = config.fontId === 'hand'
    let yy = footTop
    ctx.textAlign = 'center'
    ctx.fillStyle = frame.fg
    if (caption) {
      ctx.font = hand ? '600 42px Caveat, cursive' : '600 24px "Space Grotesk", sans-serif'
      const lineH = hand ? 46 : 32
      const lines = wrapText(ctx, caption, w - PAD * 2).slice(0, 2)
      ctx.textBaseline = 'middle'
      for (const line of lines) {
        ctx.fillText(line, w / 2, yy + lineH / 2)
        yy += lineH
      }
      yy += 6
    }
    if (config.dateStamp) {
      ctx.font = '500 15px "Space Grosterk", sans-serif'.replace('Grosterk', 'Grotesk')
      setTracking(ctx, '4px')
      ctx.globalAlpha = 0.65
      ctx.textBaseline = 'middle'
      ctx.fillText(config.dateStr.toUpperCase(), w / 2, yy + 12)
      setTracking(ctx, '0px')
      ctx.globalAlpha = 1
    }
    ctx.textBaseline = 'alphabetic'
    ctx.textAlign = 'left'
  }

  // ── stickers (topmost) ──
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  for (const s of config.stickers) {
    ctx.save()
    ctx.translate(s.x * w, s.y * h)
    ctx.rotate((s.rot * Math.PI) / 180)
    ctx.font = `${s.size}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`
    ctx.fillText(s.emoji, 0, 0)
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
