export const demoSteps = [
  {
    controlId: 'control-fuel-pump',
    label: 'CONTROL FUEL P. switch',
    instruction: 'Set the Control Fuel Pump switch for this reference demo. Confirm the SD70ACe setting against its own manual.',
  },
  {
    controlId: 'engine-run',
    label: 'ENGINE RUN switch',
    instruction: 'Set the Engine Run switch for this reference demo. Confirm the SD70ACe setting against its own manual.',
  },
  {
    controlId: 'engine-start',
    label: 'ENGINE CONTROL PANEL / START',
    instruction: 'Use the Engine Control Panel START control. This sequence is not yet validated for the SD70ACe.',
  },
  {
    controlId: 'brake-handle',
    label: 'Automatic brake / release',
    instruction: 'Release the brake for this high-level demonstration. The exact SD70ACe brake setup is not validated.',
  },
  {
    controlId: 'reverser',
    label: 'Reverser / forward',
    instruction: 'Set direction forward for this demonstration. The exact setup and interlocks need manual validation.',
  },
  {
    controlId: 'throttle',
    label: 'Throttle / initial movement',
    instruction: 'Apply throttle to begin a short illustrative movement. The exact notch and response need manual validation.',
  },
  {
    controlId: 'brake-handle',
    label: 'Automatic brake / stop',
    instruction: 'Apply the brake to stop the demonstration. The correct SD70ACe stopping technique needs manual validation.',
  },
] as const

export type LessonStatus = 'ready' | 'active' | 'paused' | 'complete'
export type DemoControlId =
  | (typeof demoSteps)[number]['controlId']
  | 'gen-field'
  | 'dynamic-brake-control'
  | 'isolation'
  | 'dynamic-brake'
  | 'independent-brake'

export type LessonState = {
  status: LessonStatus
  stepIndex: number
  reviewedStepIndex: number | null
  mistakes: number
  fuelPumpOn: boolean
  engineRunOn: boolean
  engineRunning: boolean
  brakeReleased: boolean
  direction: 'neutral' | 'forward'
  throttleApplied: boolean
  motion: 'stopped' | 'moving'
  feedback: string
  history: number[]
}

export type LessonAction =
  | { type: 'start' }
  | { type: 'pause' }
  | { type: 'resume' }
  | { type: 'restart' }
  | { type: 'interact'; controlId: DemoControlId }
  | { type: 'review'; stepIndex: number }

export function createInitialLessonState(): LessonState {
  return {
    status: 'ready',
    stepIndex: 0,
    reviewedStepIndex: null,
    mistakes: 0,
    fuelPumpOn: false,
    engineRunOn: false,
    engineRunning: false,
    brakeReleased: false,
    direction: 'neutral',
    throttleApplied: false,
    motion: 'stopped',
    feedback: 'Start the operating demonstration from the cab controls.',
    history: [],
  }
}

export function reduceLesson(state: LessonState, action: LessonAction): LessonState {
  if (action.type === 'restart') {
    return createInitialLessonState()
  }

  if (action.type === 'start' && state.status === 'ready') {
    return { ...state, status: 'active', reviewedStepIndex: null, feedback: demoSteps[0].instruction }
  }

  if (action.type === 'pause' && state.status === 'active') {
    return { ...state, status: 'paused', feedback: 'Demo paused.' }
  }

  if (action.type === 'resume' && state.status === 'paused') {
    return { ...state, status: 'active', feedback: demoSteps[state.stepIndex].instruction }
  }

  if (action.type === 'review') {
    if (action.stepIndex < 0 || action.stepIndex >= state.history.length) {
      return state
    }

    const reviewedStepIndex = state.history[action.stepIndex]
    return {
      ...state,
      reviewedStepIndex,
      feedback: demoSteps[reviewedStepIndex].instruction,
    }
  }

  if (action.type !== 'interact' || state.status !== 'active') {
    return state
  }

  const currentStep = demoSteps[state.stepIndex]
  if (action.controlId !== currentStep.controlId) {
    return {
      ...state,
      mistakes: state.mistakes + 1,
      reviewedStepIndex: null,
      feedback: 'Use the highlighted locomotive control to continue.',
    }
  }

  const nextStepIndex = state.stepIndex + 1
  const completed = nextStepIndex === demoSteps.length
  const controlState = state.stepIndex === 0
    ? { fuelPumpOn: true }
    : state.stepIndex === 1
      ? { engineRunOn: true }
      : state.stepIndex === 2
        ? { engineRunning: true }
        : state.stepIndex === 3
          ? { brakeReleased: true }
          : state.stepIndex === 4
            ? { direction: 'forward' as const }
            : state.stepIndex === 5
              ? { throttleApplied: true, motion: 'moving' as const }
              : { brakeReleased: false, throttleApplied: false, motion: 'stopped' as const }

  return {
    ...state,
    ...controlState,
    status: completed ? 'complete' : 'active',
    stepIndex: nextStepIndex,
    reviewedStepIndex: null,
    feedback: completed ? 'The locomotive is stopped. This high-level demonstration is complete.' : demoSteps[nextStepIndex].instruction,
    history: [...state.history, state.stepIndex],
  }
}