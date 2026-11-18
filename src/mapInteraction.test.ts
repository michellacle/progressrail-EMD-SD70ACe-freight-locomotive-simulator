import { describe, expect, it } from 'vitest'
import { getPinchZoomIndex } from './mapInteraction'

describe('map pinch zoom', () => {
  it('moves one zoom level for a clear pinch in or out', () => {
    expect(getPinchZoomIndex(1, 100, 130, 4)).toBe(2)
    expect(getPinchZoomIndex(2, 100, 78, 4)).toBe(1)
  })

  it('keeps the initial level for small finger movement and clamps to available levels', () => {
    expect(getPinchZoomIndex(1, 100, 108, 4)).toBe(1)
    expect(getPinchZoomIndex(3, 100, 160, 4)).toBe(3)
    expect(getPinchZoomIndex(0, 100, 50, 4)).toBe(0)
  })
})