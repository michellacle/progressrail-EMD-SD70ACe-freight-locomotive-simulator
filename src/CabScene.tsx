import { Activity, Info, Zap } from 'lucide-react'
import type { DemoControlId } from './lessonMachine'

type OperatingState = {
  fuelPumpOn: boolean
  engineRunOn: boolean
  engineRunning: boolean
  brakeReleased: boolean
  direction: 'neutral' | 'forward'
  throttleApplied: boolean
  throttlePercent: number
  automaticBrakePercent: number
}

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
  factoryDoorOpen: boolean
  motion: 'stopped' | 'moving'
  operatingState: OperatingState
  throttleEnabled: boolean
  brakeEnabled: boolean
  onControl: (controlId: DemoControlId) => void
  onControlHelp: (controlId: DemoControlId) => void
  onThrottleChange: (value: number) => void
  onAutomaticBrakeChange: (value: number) => void
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

function controlPosition(controlId: DemoControlId, state: OperatingState) {
  if (controlId === 'control-fuel-pump') return state.fuelPumpOn ? 'ON' : 'OFF'
  if (controlId === 'engine-run') return state.engineRunOn ? 'ON' : 'OFF'
  if (controlId === 'engine-start') return state.engineRunning ? 'RUNNING' : 'PUSH TO START'
  if (controlId === 'brake-handle') return state.automaticBrakePercent <= 10 ? 'RELEASED / DEMO' : state.automaticBrakePercent >= 75 ? 'FULL APPLY / DEMO' : 'BRAKE / DEMO'
  if (controlId === 'reverser') return state.direction.toUpperCase()
  if (controlId === 'throttle') return state.throttlePercent === 0 ? 'IDLE / DEMO' : state.throttlePercent < 35 ? 'LOW / DEMO' : state.throttlePercent < 70 ? 'MID / DEMO' : 'HIGH / DEMO'
  if (controlId === 'dynamic-brake-control') return 'CLOSED'
  if (controlId === 'gen-field') return 'OFF'
  if (controlId === 'isolation') return 'START / STOP / ISOLATE'
  if (controlId === 'dynamic-brake') return 'OFF'
  return 'HANDLE'
}

type ControlMechanismProps = {
  control: CabControl
  operatingState: OperatingState
  throttleEnabled: boolean
  brakeEnabled: boolean
  onThrottleChange: (value: number) => void
  onAutomaticBrakeChange: (value: number) => void
}

function ControlMechanism({ control, operatingState, throttleEnabled, brakeEnabled, onThrottleChange, onAutomaticBrakeChange }: ControlMechanismProps) {
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

  if (control.controlId === 'throttle') {
    return (
      <span className="mechanism-slider throttle-slider">
        <span className="slider-captions"><b>IDLE</b><b>POWER</b></span>
        <input
          className="handle-range throttle-range"
          type="range"
          min="0"
          max="100"
          step="1"
          value={operatingState.throttlePercent}
          disabled={!throttleEnabled}
          aria-label="Throttle demo setting"
          aria-valuetext={controlPosition('throttle', operatingState)}
          onChange={(event) => onThrottleChange(Number(event.currentTarget.value))}
        />
        <span className="slider-state">{controlPosition('throttle', operatingState)}</span>
      </span>
    )
  }

  if (control.controlId === 'brake-handle') {
    const releasePosition = 100 - operatingState.automaticBrakePercent
    return (
      <span className="mechanism-slider brake-slider">
        <span className="slider-captions"><b>APPLY</b><b>RELEASE</b></span>
        <input
          className="handle-range brake-range"
          type="range"
          min="0"
          max="100"
          step="1"
          value={releasePosition}
          disabled={!brakeEnabled}
          aria-label="Automatic brake demo setting"
          aria-valuetext={controlPosition('brake-handle', operatingState)}
          onChange={(event) => onAutomaticBrakeChange(100 - Number(event.currentTarget.value))}
        />
        <span className="slider-state">{controlPosition('brake-handle', operatingState)}</span>
      </span>
    )
  }

  const dynamicBrake = control.controlId === 'dynamic-brake'
  return (
    <span className="mechanism-slider">
      <span className="slider-captions"><b>{dynamicBrake ? 'OFF' : 'IDLE'}</b><b>{dynamicBrake ? 'BRAKE' : 'HANDLE'}</b></span>
      <span className="slider-rail"><i /></span>
      <span className="slider-state">{position}</span>
    </span>
  )
}

function FactoryWindow({ doorOpen, moving }: { doorOpen: boolean; moving: boolean }) {
  return (
    <svg className={`factory-art ${moving ? 'is-moving' : ''}`} viewBox="0 0 1120 330" role="img" aria-label={`Operator's view through one factory bay. The bay door is ${doorOpen ? 'open' : 'closed'}.`} preserveAspectRatio="xMidYMid slice">
      <rect width="1120" height="330" fill="#343431" />
      <path d="M0 0h1120v47H0z" fill="#242422" />
      <path d="M0 24h1120M80 0l82 47m162-47 82 47m162-47 82 47m162-47 82 47m162-47 82 47" stroke="#5d5b54" strokeWidth="5" />
      <path d="M0 47h1120v35H0z" fill="#77746a" />
      <path d="M0 82h1120v168H0z" fill="#99978f" />
      <rect x="188" y="63" width="744" height="187" fill="#292927" />
      <rect x="215" y="76" width="690" height="162" fill="#bdc0b9" />
      <rect x="215" y="76" width="690" height="88" fill="#c9cbc5" />
      <path d="M215 163h690v27H215z" fill="#95958d" />
      <path d="M215 190h690v48H215z" fill="#77766e" />
      <path d="M215 190c100-22 158 10 238-2 86-13 139-22 225-1 67 16 131 15 227-1v31H215z" fill="#6b7651" />
      <path d="M215 238h690v92H215z" fill="#77766e" />
      <path d="M536 190 400 330h320L584 190z" fill="#68675f" />
      <g className="track-ties" stroke="#4b4943" strokeWidth="8">
        <path d="M534 196h52M510 205h100M490 215h140M465 226h190M437 239h246M405 255h310M368 276h384M327 301h466" />
      </g>
      <path d="M536 190 400 330M584 190 720 330" stroke="#292927" strokeWidth="5" />
      <path d="M188 63h744v16H188zM188 238h744v12H188zM188 63v187h19V63m737 0v187h-19V63" fill="#d2cfc4" />
      <g className={`factory-door ${doorOpen ? 'open' : ''}`}>
        <g className="factory-door-leaf">
          <rect x="218" y="79" width="684" height="156" fill="#b4b4ac" />
          <path d="M218 98h684m-684 19h684m-684 19h684m-684 19h684m-684 19h684m-684 19h684m-684 19h684" stroke="#85837a" strokeWidth="3" />
          <path d="M246 79v156m628-156v156" stroke="#8c8a80" strokeWidth="3" />
        </g>
      </g>
      <rect x="0" y="250" width="188" height="80" fill="#57564f" />
      <rect x="932" y="250" width="188" height="80" fill="#57564f" />
      <path d="M28 0v330m1064-330v330" stroke="#89867c" strokeWidth="12" />
      <circle cx="148" cy="95" r="6" fill="#ffcd11" />
      <circle cx="972" cy="95" r="6" fill="#ffcd11" />
      <text x="48" y="120" fill="#f0eee6" fontFamily="monospace" fontSize="11" letterSpacing="1">BAY 04</text>
      <text x="956" y="120" fill="#f0eee6" fontFamily="monospace" fontSize="11" letterSpacing="1">EXIT</text>
    </svg>
  )
}

function CabScene({ completedControlIds, currentControlId, disabled, factoryDoorOpen, motion, operatingState, throttleEnabled, brakeEnabled, onControl, onControlHelp, onThrottleChange, onAutomaticBrakeChange }: CabSceneProps) {
  return (
    <div className="cab-scene">
      <div className="cab-toolbar">
        <span><i /> OPERATOR'S POSITION / FORWARD VIEW</span>
        <span className="toolbar-mode">OPERATOR CONTROLS <b>·</b> REFERENCE LAYOUT</span>
      </div>

      <div className="window-bezel">
        <div className="window-glass"><FactoryWindow doorOpen={factoryDoorOpen} moving={motion === 'moving'} /></div>
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
                  const isCurrent = currentControlId === control.controlId
                  const isComplete = completedControlIds.includes(control.controlId)
                  const isAdjustableHandle = control.controlId === 'throttle' || control.controlId === 'brake-handle'
                  const controlContent = (
                    <>
                      <span className="cab-control-top"><span>{control.label}</span></span>
                      <span className="control-mechanism">
                        <ControlMechanism
                          control={control}
                          operatingState={operatingState}
                          throttleEnabled={throttleEnabled}
                          brakeEnabled={brakeEnabled}
                          onThrottleChange={onThrottleChange}
                          onAutomaticBrakeChange={onAutomaticBrakeChange}
                        />
                      </span>
                      <span className="control-position"><i className={isComplete ? 'position-on' : ''} />{isComplete ? 'OPERATED / DEMO' : controlPosition(control.controlId, operatingState)}</span>
                    </>
                  )
                  return (
                    <div className="cab-control-row" key={control.controlId}>
                      {isAdjustableHandle ? (
                        <div className={`cab-control ${control.kind}${isCurrent ? ' is-current' : ''}${isComplete ? ' is-complete' : ''}`} role="group" aria-label={`${control.label}, ${controlPosition(control.controlId, operatingState)}`}>
                          {controlContent}
                        </div>
                      ) : (
                        <button
                          className={`cab-control ${control.kind}${isCurrent ? ' is-current' : ''}${isComplete ? ' is-complete' : ''}`}
                          type="button"
                          disabled={disabled}
                          onClick={() => onControl(control.controlId)}
                          aria-label={`${control.label}, ${controlPosition(control.controlId, operatingState)}${isCurrent ? ', highlighted for the current step' : ''}`}
                          aria-current={isCurrent ? 'step' : undefined}
                        >
                          {controlContent}
                        </button>
                      )}
                      <button
                        className="control-help-action"
                        type="button"
                        title={`What does ${control.label} do?`}
                        aria-label={`Explain ${control.label}`}
                        onClick={() => onControlHelp(control.controlId)}
                      >
                        <Info size={15} aria-hidden="true" />
                      </button>
                    </div>
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