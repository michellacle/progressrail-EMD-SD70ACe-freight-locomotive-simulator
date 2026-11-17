import { describe, expect, it } from 'vitest'
import { controlHelp } from './controlHelp'
import type { DemoControlId } from './lessonMachine'

const visibleControlIds: DemoControlId[] = [
  'engine-start',
  'isolation',
  'control-fuel-pump',
  'engine-run',
  'gen-field',
  'dynamic-brake-control',
  'throttle',
  'dynamic-brake',
  'reverser',
  'brake-handle',
  'independent-brake',
]

describe('cab control help', () => {
  it('explains every visible control in plain language and states model limits', () => {
    expect(Object.keys(controlHelp).sort()).toEqual([...visibleControlIds].sort())

    for (const controlId of visibleControlIds) {
      const help = controlHelp[controlId]

      expect(help.title.length).toBeGreaterThan(0)
      expect(help.purpose.length).toBeGreaterThan(20)
      expect(help.context.length).toBeGreaterThan(20)
      expect(help.modelNote).toMatch(/SD70ACe/i)
    }
  })

  it('explains dynamic braking without treating it as the air brake', () => {
    expect(controlHelp['dynamic-brake'].purpose).toMatch(/traction motors/i)
    expect(controlHelp['dynamic-brake'].purpose).toMatch(/retard|slow/i)
    expect(controlHelp['dynamic-brake'].purpose).not.toMatch(/air brake handle/i)
  })
})