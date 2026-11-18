export type MapPoint = { x: number; y: number }
export type RoutePose = MapPoint & { headingDegrees: number }

export const MAP_WIDTH = 1000
export const MAP_HEIGHT = 800
export const DEMO_SPEED_CAP_MPH = 5
export const DEMO_ROUTE_LENGTH_MILES = 0.12
export const STOP_MARKER_PROGRESS = 0.86

export const routePoints: MapPoint[] = [
  { x: 430, y: 330 },
  { x: 430, y: 415 },
  { x: 430, y: 475 },
  { x: 500, y: 525 },
  { x: 595, y: 525 },
  { x: 630, y: 500 },
  { x: 640, y: 430 },
  { x: 660, y: 355 },
  { x: 720, y: 315 },
  { x: 800, y: 320 },
  { x: 860, y: 370 },
  { x: 875, y: 440 },
  { x: 850, y: 500 },
  { x: 790, y: 535 },
  { x: 720, y: 530 },
  { x: 665, y: 495 },
  { x: 640, y: 430 },
  { x: 610, y: 485 },
  { x: 570, y: 555 },
  { x: 490, y: 585 },
  { x: 410, y: 580 },
  { x: 340, y: 550 },
  { x: 330, y: 485 },
  { x: 350, y: 430 },
  { x: 390, y: 400 },
  { x: 430, y: 415 },
  { x: 430, y: 330 },
]

const segmentLengths = routePoints.slice(1).map((point, index) => {
  const previous = routePoints[index]
  return Math.hypot(point.x - previous.x, point.y - previous.y)
})
const totalRouteLength = segmentLengths.reduce((total, length) => total + length, 0)
const stopWindow = 0.02
const stopSpeedMph = 0.18

export type RouteState = {
  progress: number
  speedMph: number
  throttlePercent: number
  automaticBrakePercent: number
  completedLaps: number
  missedStops: number
  completed: boolean
}

export type RouteAction =
  | { type: 'set-throttle'; value: number }
  | { type: 'set-brake'; value: number }
  | { type: 'tick'; deltaSeconds: number; movementEnabled: boolean }
  | { type: 'reset' }

export function createRouteState(overrides: Partial<RouteState> = {}): RouteState {
  return {
    progress: 0,
    speedMph: 0,
    throttlePercent: 0,
    automaticBrakePercent: 100,
    completedLaps: 0,
    missedStops: 0,
    completed: false,
    ...overrides,
  }
}

export function setThrottle(state: RouteState, throttlePercent: number): RouteState {
  return { ...state, throttlePercent: clampPercent(throttlePercent) }
}

export function setAutomaticBrake(state: RouteState, automaticBrakePercent: number): RouteState {
  return { ...state, automaticBrakePercent: clampPercent(automaticBrakePercent) }
}

export function reduceRoute(state: RouteState, action: RouteAction): RouteState {
  if (action.type === 'reset') return createRouteState()
  if (action.type === 'set-throttle') return setThrottle(state, action.value)
  if (action.type === 'set-brake') return setAutomaticBrake(state, action.value)
  return advanceRoute(state, action.deltaSeconds, action.movementEnabled)
}

export function advanceRoute(state: RouteState, deltaSeconds: number, movementEnabled: boolean): RouteState {
  if (!movementEnabled || state.completed || deltaSeconds <= 0) return state

  const substeps = Math.max(1, Math.ceil(deltaSeconds / 0.1))
  const substepSeconds = deltaSeconds / substeps
  let nextState = state

  for (let index = 0; index < substeps; index += 1) {
    nextState = advanceSubstep(nextState, substepSeconds)
    if (nextState.completed) break
  }

  return nextState
}

export function getRoutePose(progress: number): RoutePose {
  const normalizedProgress = ((progress % 1) + 1) % 1
  let remaining = normalizedProgress * totalRouteLength

  for (let index = 0; index < segmentLengths.length; index += 1) {
    const length = segmentLengths[index]
    if (remaining <= length || index === segmentLengths.length - 1) {
      const start = routePoints[index]
      const end = routePoints[index + 1]
      const fraction = length === 0 ? 0 : remaining / length
      return {
        x: start.x + (end.x - start.x) * fraction,
        y: start.y + (end.y - start.y) * fraction,
        headingDegrees: Math.atan2(end.y - start.y, end.x - start.x) * (180 / Math.PI),
      }
    }
    remaining -= length
  }

  return { ...routePoints[0], headingDegrees: 0 }
}

export function getRoutePathPoints(progress?: number): MapPoint[] {
  if (progress === undefined) return routePoints

  const pose = getRoutePose(progress)
  const normalizedProgress = Math.max(0, Math.min(1, progress))
  let remaining = normalizedProgress * totalRouteLength
  const points: MapPoint[] = [routePoints[0]]

  for (let index = 0; index < segmentLengths.length; index += 1) {
    if (remaining <= segmentLengths[index]) {
      if (points.at(-1) !== routePoints[index]) points.push(routePoints[index])
      points.push({ x: pose.x, y: pose.y })
      return points
    }
    points.push(routePoints[index + 1])
    remaining -= segmentLengths[index]
  }

  return points
}

function advanceSubstep(state: RouteState, deltaSeconds: number): RouteState {
  const oldSpeed = state.speedMph
  const throttleAcceleration = (state.throttlePercent / 100) * 0.65
  const brakeDeceleration = (state.automaticBrakePercent / 100) * 1.8
  const rollingResistance = oldSpeed > 0 && state.throttlePercent === 0 && state.automaticBrakePercent === 0 ? 0.035 : 0
  const nextSpeed = clamp(oldSpeed + (throttleAcceleration - brakeDeceleration - rollingResistance) * deltaSeconds, 0, DEMO_SPEED_CAP_MPH)
  const distanceMiles = ((oldSpeed + nextSpeed) / 2) * deltaSeconds / 3600
  const progressDelta = distanceMiles / DEMO_ROUTE_LENGTH_MILES
  const unwrappedProgress = state.progress + progressDelta
  const crossedStop = state.progress < STOP_MARKER_PROGRESS && unwrappedProgress >= STOP_MARKER_PROGRESS
  const stoppedNearMarker = nextSpeed <= stopSpeedMph
    && state.automaticBrakePercent > 0
    && Math.abs(unwrappedProgress - STOP_MARKER_PROGRESS) <= stopWindow

  if (stoppedNearMarker || (crossedStop && nextSpeed <= stopSpeedMph && state.automaticBrakePercent > 0)) {
    return {
      ...state,
      progress: STOP_MARKER_PROGRESS,
      speedMph: 0,
      completed: true,
    }
  }

  const missedStops = crossedStop && nextSpeed > stopSpeedMph ? state.missedStops + 1 : state.missedStops
  const completedLaps = Math.floor(unwrappedProgress)

  return {
    ...state,
    progress: unwrappedProgress % 1,
    speedMph: nextSpeed,
    missedStops,
    completedLaps: state.completedLaps + completedLaps,
  }
}

function clampPercent(value: number) {
  return clamp(value, 0, 100)
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.max(minimum, Math.min(maximum, value))
}