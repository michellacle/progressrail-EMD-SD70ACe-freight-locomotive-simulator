import { Activity, ArrowLeftRight, ArrowUpRight, CircleStop, Power, ToggleLeft, Zap } from 'lucide-react'
import type { DemoControlId, LessonState } from './lessonMachine'

type OperatingState = Pick<LessonState, 'fuelPumpOn' | 'engineRunOn' | 'engineRunning' | 'brakeReleased' | 'direction' | 'throttleApplied'>

type CabControl = {
  controlId: DemoControlId
  label: string
  kind: 'switch' | 'breaker' | 'pushbutton' | 'selector' | 'slider'
}

type ControlPanel = {
  title: string
  controls: CabControl[]
}

type CabSceneProps = {
  completedControlIds: DemoControlId[]
  currentControlId: DemoControlId | null
  disabled: boolean
  motion: 'stopped' | 'moving'
  operatingState: OperatingState
  onControl: (controlId: DemoControlId) => void
}

const controlPanels: ControlPanel[] = [
  {
    title: 'ENGINE CONTROL PANEL',
    controls: [
      { controlId: 'engine-start', label: 'START pushbutton', kind: 'pushbutton' },
      { controlId: 'isolation', label: 'Isolation switch', kind: 'selector' },
    ],
  },
  {
    title: 'SWITCH PANEL',
    controls: [
      { controlId: 'control-fuel-pump', label: 'CONTROL FUEL P.', kind: 'switch' },
      { controlId: 'engine-run', label: 'ENGINE RUN', kind: 'switch' },
      { controlId: 'gen-field', label: 'GEN. FIELD', kind: 'switch' },
      { controlId: 'dynamic-brake-control', label: 'DYN BRK CONT', kind: 'breaker' },
    ],
  },
  {
    title: "ENGINEER'S CONTROL STAND",
    controls: [
      { controlId: 'throttle', label: 'Throttle handle', kind: 'slider' },
      { controlId: 'dynamic-brake', label: 'Dynamic brake handle', kind: 'slider' },
      { controlId: 'reverser', label: 'Reverser', kind: 'selector' },
    ],
  },
  {
    title: 'AIR BRAKE',
    controls: [
      { controlId: 'brake-handle', label: 'Automatic brake handle', kind: 'slider' },
      { controlId: 'independent-brake', label: 'Independent brake handle', kind: 'slider' },
    ],
  },
]

const controlIcons = {
  'control-fuel-pump': Power,
  'engine-run': Power,
  'engine-start': Zap,
  'brake-handle': CircleStop,
  reverser: ArrowLeftRight,
  throttle: ArrowUpRight,
  'gen-field': ToggleLeft,
  'dynamic-brake-control': ToggleLeft,
  isolation: ArrowLeftRight,
  'dynamic-brake': ArrowUpRight,
  'independent-brake': CircleStop,
} satisfies Record<DemoControlId, typeof Power>

function controlPosition(controlId: DemoControlId, state: OperatingState) {
  if (controlId === 'control-fuel-pump') return state.fuelPumpOn ? 'ON' : 'OFF'
  if (controlId === 'engine-run') return state.engineRunOn ? 'ON' : 'OFF'
  if (controlId === 'engine-start') return state.engineRunning ? 'RUNNING' : 'PUSH TO START'
  if (controlId === 'brake-handle') return state.brakeReleased ? 'RELEASED / DEMO' : 'APPLIED / DEMO'
  if (controlId === 'reverser') return state.direction.toUpperCase()
  if (controlId === 'throttle') return state.throttleApplied ? 'POWER / DEMO' : 'IDLE'
  if (controlId === 'dynamic-brake-control') return 'CLOSED'
  if (controlId === 'gen-field') return 'OFF'
  if (controlId === 'isolation') return 'START / STOP / ISOLATE'
  if (controlId === 'dynamic-brake') return 'OFF'
  return 'HANDLE'
}

function ControlMechanism({ control, operatingState }: { control: CabControl; operatingState: OperatingState }) {
  const position = controlPosition(control.controlId, operatingState)

  if (control.kind === 'pushbutton') {
    return <span className={`mechanism-start${operatingState.engineRunning ? ' running' : ''}`}><Zap size={17} /><b>{operatingState.engineRunning ? 'RUNNING' : 'START'}</b></span>
  }

  if (control.kind === 'switch' || control.kind === 'breaker') {
    const isOn = control.controlId === 'control-fuel-pump'
      ? operatingState.fuelPumpOn
      : control.controlId === 'engine-run'
        ? operatingState.engineRunOn
        : control.controlId === 'dynamic-brake-control'
    return <span className={`mechanism-toggle${isOn ? ' on' : ''}`}><i /><b>{position}</b></span>
  }

  if (control.controlId === 'reverser' || control.controlId === 'isolation') {
    const isolation = control.controlId === 'isolation'
    return (
      <span className="mechanism-selector">
        <span className="selector-positions"><b>{isolation ? 'START' : 'REV'}</b><b>{isolation ? 'STOP' : 'N'}</b><b>{isolation ? 'ISOLATE' : 'FWD'}</b></span>
        <span className={`selector-rail${!isolation && operatingState.direction === 'forward' ? ' forward' : ''}`}><i /></span>
        <span className="slider-state">{position} / REF</span>
      </span>
    )
  }

  const brakeControl = control.controlId === 'brake-handle'
  const dynamicBrake = control.controlId === 'dynamic-brake'
  const applied = brakeControl ? operatingState.brakeReleased : control.controlId === 'throttle' && operatingState.throttleApplied
  return (
    <span className={`mechanism-slider${brakeControl ? ' brake-slider' : ''}${applied ? brakeControl ? ' released' : ' applied' : ''}`}>
      <span className="slider-captions"><b>{brakeControl ? 'APPLY' : dynamicBrake ? 'OFF' : 'IDLE'}</b><b>{brakeControl ? 'RELEASE' : dynamicBrake ? 'BRAKE' : 'POWER'}</b></span>
      <span className="slider-rail"><i /></span>
      <span className="slider-state">{position}</span>
    </span>
  )
}

function FactoryWindow({ doorOpen, moving }: { doorOpen: boolean; moving: boolean }) {
  return (
    <svg className={`factory-art ${moving ? 'is-moving' : ''}`} viewBox="0 0 1120 330" role="img" aria-label={`Operator's view through one factory bay. The bay door is ${doorOpen ? 'open' : 'closed'}.`} preserveAspectRatio="xMidYMid slice">
      <rect width="1120" height="330" fill="#33423b" />
      <path d="M0 0h1120v47H0z" fill="#26362f" />
      <path d="M0 24h1120M80 0l82 47m162-47 82 47m162-47 82 47m162-47 82 47m162-47 82 47" stroke="#56645b" strokeWidth="5" />
      <path d="M0 47h1120v35H0z" fill="#526159" />
      <path d="M0 82h1120v168H0z" fill="#68766e" />
      <rect x="188" y="63" width="744" height="187" fill="#263831" />
      <rect x="215" y="76" width="690" height="162" fill="#aebbb3" />
      <rect x="215" y="76" width="690" height="88" fill="#b6c2bc" />
      <path d="M215 163h690v27H215z" fill="#84968b" />
      <path d="M215 190h690v48H215z" fill="#8a938c" />
      <path d="M215 190c100-22 158 10 238-2 86-13 139-22 225-1 67 16 131 15 227-1v31H215z" fill="#576e5a" />
      <path d="M215 238h690v92H215z" fill="#73766d" />
      <path d="M536 190 400 330h320L584 190z" fill="#66665d" />
      <g className="track-ties" stroke="#45443d" strokeWidth="8">
        <path d="M534 196h52M510 205h100M490 215h140M465 226h190M437 239h246M405 255h310M368 276h384M327 301h466" />
      </g>
      <path d="M536 190 400 330M584 190 720 330" stroke="#272c27" strokeWidth="5" />
      <path d="M188 63h744v16H188zM188 238h744v12H188zM188 63v187h19V63m737 0v187h-19V63" fill="#d0d0c3" />
      <g className={`factory-door ${doorOpen ? 'open' : ''}`}>
        <g className="factory-door-leaf">
          <rect x="218" y="79" width="684" height="156" fill="#afb7ac" />
          <path d="M218 98h684m-684 19h684m-684 19h684m-684 19h684m-684 19h684m-684 19h684m-684 19h684" stroke="#828d82" strokeWidth="3" />
          <path d="M246 79v156m628-156v156" stroke="#879187" strokeWidth="3" />
        </g>
      </g>
      <rect x="0" y="250" width="188" height="80" fill="#47564f" />
      <rect x="932" y="250" width="188" height="80" fill="#47564f" />
      <path d="M28 0v330m1064-330v330" stroke="#758178" strokeWidth="12" />
      <circle cx="148" cy="95" r="6" fill="#d9ec9b" />
      <circle cx="972" cy="95" r="6" fill="#d9ec9b" />
      <text x="48" y="120" fill="#e0e3d8" fontFamily="monospace" fontSize="11" letterSpacing="1">BAY 04</text>
      <text x="956" y="120" fill="#e0e3d8" fontFamily="monospace" fontSize="11" letterSpacing="1">EXIT</text>
    </svg>
  )
}

function CabScene({ completedControlIds, currentControlId, disabled, motion, operatingState, onControl }: CabSceneProps) {
  return (
    <div className="cab-scene">
      <div className="cab-toolbar">
        <span><i /> OPERATOR'S POSITION / FORWARD VIEW</span>
        <span className="toolbar-mode">OPERATOR CONTROLS <b>·</b> REFERENCE LAYOUT</span>
      </div>

      <div className="window-bezel">
        <div className="window-glass"><FactoryWindow doorOpen moving={motion === 'moving'} /></div>
        <span className="window-reflection" aria-hidden="true" />
        <span className="window-frame-left" aria-hidden="true" />
        <span className="window-frame-right" aria-hidden="true" />
      </div>

      <div className="cab-dashboard">
        <div className="dashboard-topline">
          <span>LOCOMOTIVE OPERATING CONTROLS</span>
          <span className="dashboard-lights"><i className={operatingState.fuelPumpOn ? 'lit' : ''} /><i className={operatingState.engineRunning ? 'lit amber' : ''} /><i className={motion === 'moving' ? 'lit' : ''} /></span>
          <span>CONTROL POSITIONS PENDING</span>
        </div>

        <div className="instrument-deck" aria-label="Illustrative locomotive state instruments">
          <div className="state-instrument">
            <span className="instrument-title">CONTROL FUEL P.</span>
            <span className={`instrument-dial${operatingState.fuelPumpOn ? ' active' : ''}`}><i /></span>
            <strong>{operatingState.fuelPumpOn ? 'ON' : 'OFF'} <small>/ REF</small></strong>
          </div>
          <div className="state-instrument">
            <span className="instrument-title">ENGINE RUN</span>
            <span className={`instrument-dial${operatingState.engineRunOn ? ' active amber' : ''}`}><i /></span>
            <strong>{operatingState.engineRunOn ? 'ON' : 'OFF'} <small>/ REF</small></strong>
          </div>
          <div className="state-instrument">
            <span className="instrument-title">AIR BRAKE</span>
            <span className={`instrument-dial${operatingState.brakeReleased ? ' active amber' : ''}`}><i /></span>
            <strong>{operatingState.brakeReleased ? 'RELEASE' : 'APPLIED'} <small>/ DEMO</small></strong>
          </div>
          <div className="state-display">
            <span>SIMULATED LOCOMOTIVE STATE</span>
            <strong>{motion === 'moving' ? 'MOVING' : 'STATIONARY'}</strong>
            <small>ENGINE: {operatingState.engineRunning ? 'RUNNING' : 'STOPPED'} <b>·</b> THROTTLE: {operatingState.throttleApplied ? 'APPLIED' : 'IDLE'}</small>
          </div>
        </div>

        <div className="control-panel-grid">
          {controlPanels.map((panel) => (
            <section className="control-panel" key={panel.title} aria-label={panel.title}>
              <div className="panel-heading"><span>{panel.title}</span></div>
              <div className="panel-controls">
                {panel.controls.map((control) => {
                  const Icon = controlIcons[control.controlId]
                  const isCurrent = currentControlId === control.controlId
                  const isComplete = completedControlIds.includes(control.controlId)
                  return (
                    <button
                      className={`cab-control ${control.kind}${isCurrent ? ' is-current' : ''}${isComplete ? ' is-complete' : ''}`}
                      type="button"
                      key={control.controlId}
                      disabled={disabled}
                      onClick={() => onControl(control.controlId)}
                      aria-label={`${control.label}, ${controlPosition(control.controlId, operatingState)}${isCurrent ? ', highlighted for the current step' : ''}`}
                      aria-current={isCurrent ? 'step' : undefined}
                    >
                      <span className="cab-control-top"><span>{control.label}</span><Icon size={14} strokeWidth={1.8} /></span>
                      <span className="control-mechanism"><ControlMechanism control={control} operatingState={operatingState} /></span>
                      <span className="control-position"><i className={isComplete ? 'position-on' : ''} />{isComplete ? 'OPERATED / DEMO' : controlPosition(control.controlId, operatingState)}</span>
                    </button>
                  )
                })}
              </div>
            </section>
          ))}
        </div>

        <div className="dashboard-base">
          <span className="cab-status-label"><Activity size={14} /> SIM STATE</span>
          <span className={`cab-motion ${motion}`}>{motion === 'moving' ? 'MOTION ACTIVE' : 'STATIONARY'}</span>
          <span className="dashboard-microcopy">SCHEMATIC ONLY / VALIDATION PENDING</span>
        </div>
      </div>
      <div className="console-lip" aria-hidden="true"><span /><span /><span /></div>
    </div>
  )
}

export default CabScene