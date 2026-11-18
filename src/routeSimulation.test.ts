import { describe, expect, it } from 'vitest'
import {
  DEMO_SPEED_CAP_MPH,
  STOP_MARKER_PROGRESS,
  advanceRoute,
  createRouteState,
  getRoutePathPoints,
  getRoutePose,
  reduceRoute,
  routePoints,
} from './routeSimulation'

describe('factory-to-test-loop route simulation', () => {
  it('accelerates under throttle only when the operating lesson enables movement', () => {
    const waiting = createRouteState({ throttlePercent: 100, automaticBrakePercent: 0 })
    expect(advanceRoute(waiting, 5, false).speedMph).toBe(0)

    const moving = advanceRoute(waiting, 5, true)
    expect(moving.speedMph).toBeGreaterThan(0)
    expect(moving.progress).toBeGreaterThan(0)
  })

  it('limits simulated speed to the demo cap', () => {
    const fast = createRouteState({ speedMph: DEMO_SPEED_CAP_MPH, throttlePercent: 100, automaticBrakePercent: 0 })
    expect(advanceRoute(fast, 10, true).speedMph).toBeLessThanOrEqual(DEMO_SPEED_CAP_MPH)
  })

  it('decelerates when the automatic brake is applied', () => {
    const braking = createRouteState({ speedMph: 3, throttlePercent: 0, automaticBrakePercent: 100 })
    expect(advanceRoute(braking, 1, true).speedMph).toBeLessThan(3)
  })

  it('records a missed stop and wraps safely onto another circuit', () => {
    const approaching = createRouteState({
      progress: STOP_MARKER_PROGRESS - 0.0001,
      speedMph: 4,
      throttlePercent: 100,
      automaticBrakePercent: 0,
    })
    const passed = advanceRoute(approaching, 20, true)

    expect(passed.missedStops).toBe(1)
    expect(passed.progress).toBeLessThan(STOP_MARKER_PROGRESS)
    expect(passed.progress).toBeGreaterThan(0)
  })

  it('completes only when the train stops at the marked return lead', () => {
    const atMarker = createRouteState({
      progress: STOP_MARKER_PROGRESS - 0.01,
      speedMph: 0.1,
      throttlePercent: 0,
      automaticBrakePercent: 100,
    })
    const stopped = advanceRoute(atMarker, 0.1, true)

    expect(stopped.completed).toBe(true)
    expect(stopped.progress).toBe(STOP_MARKER_PROGRESS)
    expect(stopped.speedMph).toBe(0)
  })

  it('keeps the north-up route position and traveled path tied to the same track geometry', () => {
    expect(getRoutePose(0)).toMatchObject(routePoints[0])

    const traveled = getRoutePathPoints(0.35)
    const pose = getRoutePose(0.35)
    expect(traveled[0]).toEqual(routePoints[0])
    expect(traveled.length).toBeGreaterThan(2)
    expect(traveled.at(-1)).toMatchObject({ x: pose.x, y: pose.y })
  })

  it('updates draggable controls and resets the complete route session', () => {
    let route = createRouteState()
    route = reduceRoute(route, { type: 'set-throttle', value: 130 })
    route = reduceRoute(route, { type: 'set-brake', value: 0 })
    expect(route.throttlePercent).toBe(100)
    expect(route.automaticBrakePercent).toBe(0)

    route = reduceRoute(route, { type: 'tick', deltaSeconds: 2, movementEnabled: true })
    expect(route.progress).toBeGreaterThan(0)

    expect(reduceRoute(route, { type: 'reset' })).toEqual(createRouteState())
  })
})