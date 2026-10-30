import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import PhotoboothApp from '@/components/photobooth/PhotoboothApp'
import { DOODLE_STICKERS, FILTERS, FRAMES, LAYOUTS, MODES, STICKER_CATEGORIES } from '@/lib/photobooth/data'
import { stripSize } from '@/lib/photobooth/render'

describe('SnapStudio core data & workflow', () => {
  it('defines all 8 photo modes with valid default frames, filters, and layouts', () => {
    expect(MODES).toHaveLength(8)
    const modeIds = MODES.map((m) => m.id)
    expect(modeIds).toEqual([
      'classic',
      'cinematic',
      'fun',
      'vintage',
      'music',
      'cute',
      'editorial',
      'travel',
    ])

    for (const mode of MODES) {
      expect(FRAMES.some((f) => f.id === mode.defaultFrame)).toBe(true)
      expect(FILTERS.some((f) => f.id === mode.defaultFilter)).toBe(true)
      expect(LAYOUTS.some((l) => l.id === mode.defaultLayout)).toBe(true)
    }
  })

  it('defines sticker categories and vector doodle stickers', () => {
    expect(STICKER_CATEGORIES.length).toBeGreaterThanOrEqual(8)
    expect(DOODLE_STICKERS.length).toBeGreaterThanOrEqual(15)
  })

  it('calculates strip dimensions for 2, 4, 6 shot strips and collages', () => {
    for (const layout of LAYOUTS) {
      const withFoot = stripSize(layout, true)
      const withoutFoot = stripSize(layout, false)
      expect(withFoot.w).toBeGreaterThan(400)
      expect(withFoot.h).toBeGreaterThan(withoutFoot.h)
    }
  })

  it('renders Landing page and navigates through Modes, Capture, and Editor with sticker & undo support', () => {
    render(<PhotoboothApp />)

    // Verify Landing Page hero
    expect(screen.getByText(/Moments,/i)).toBeInTheDocument()
    expect(screen.getByText(/Start Photobooth/i)).toBeInTheDocument()

    // Navigate to Mode Selection
    fireEvent.click(screen.getByText('See Modes'))
    expect(screen.getByText(/Different vibes for different stories/i)).toBeInTheDocument()
    expect(screen.getAllByText(/Classic Booth/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Travel Diary/i).length).toBeGreaterThan(0)

    // Jump into Editor via Open Editor (auto-loads sample shots when needed)
    fireEvent.click(screen.getByText(/Open Editor/i))
    expect(screen.getByText(/Live Canvas/i)).toBeInTheDocument()
    expect(screen.getByText(/Text Sticker/i)).toBeInTheDocument()

    // Add a custom text sticker
    const textInput = screen.getByPlaceholderText(/Add text/i)
    fireEvent.change(textInput, { target: { value: 'Seoul 2026' } })
    fireEvent.keyDown(textInput, { key: 'Enter' })

    expect(screen.getAllByText('Seoul 2026').length).toBeGreaterThan(0)

    // Test Undo button
    const undoBtn = screen.getByLabelText('Undo')
    expect(undoBtn).not.toBeDisabled()
    fireEvent.click(undoBtn)
  })
})