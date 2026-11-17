import { describe, expect, it } from 'vitest'
import { createInitialLessonState, demoSteps, reduceLesson } from './lessonMachine'

describe('first-movement operating demo', () => {
  it('keeps an out-of-order control input on the current step', () => {
    const active = reduceLesson(createInitialLessonState(), { type: 'start' })
    const result = reduceLesson(active, { type: 'interact', controlId: 'throttle' })

    expect(result.stepIndex).toBe(0)
    expect(result.mistakes).toBe(1)
    expect(result.feedback).toMatch(/highlighted locomotive control/i)
  })

  it('simulates power, engine start, brake release, movement, and a controlled stop', () => {
    expect(demoSteps.map((step) => step.controlId)).toEqual([
      'control-fuel-pump',
      'engine-run',
      'engine-start',
      'brake-handle',
      'reverser',
      'throttle',
      'brake-handle',
    ])
    let state = reduceLesson(createInitialLessonState(), { type: 'start' })

    for (const step of demoSteps) {
      state = reduceLesson(state, { type: 'interact', controlId: step.controlId })
      if (step.controlId === 'control-fuel-pump') expect(state.fuelPumpOn).toBe(true)
      if (step.controlId === 'engine-run') expect(state.engineRunOn).toBe(true)
      if (step.controlId === 'engine-start') expect(state.engineRunning).toBe(true)
      if (step.controlId === 'brake-handle' && state.stepIndex === 4) expect(state.brakeReleased).toBe(true)
      if (step.controlId === 'throttle') expect(state.motion).toBe('moving')
    }

    expect(state.motion).toBe('stopped')
    expect(state.brakeReleased).toBe(false)
    expect(state.status).toBe('complete')
  })

  it('supports pause, resume, restart, and reviewing previous instructions', () => {
    let state = reduceLesson(createInitialLessonState(), { type: 'start' })
    state = reduceLesson(state, { type: 'interact', controlId: demoSteps[0].controlId })

    const reviewed = reduceLesson(state, { type: 'review', stepIndex: 0 })
    expect(reviewed.stepIndex).toBe(1)
    expect(reviewed.reviewedStepIndex).toBe(0)
    expect(reviewed.feedback).toBe(demoSteps[0].instruction)

    const paused = reduceLesson(reviewed, { type: 'pause' })
    const resumed = reduceLesson(paused, { type: 'resume' })
    const restarted = reduceLesson(resumed, { type: 'restart' })

    expect(paused.status).toBe('paused')
    expect(resumed.status).toBe('active')
    expect(restarted).toEqual(createInitialLessonState())
  })
})