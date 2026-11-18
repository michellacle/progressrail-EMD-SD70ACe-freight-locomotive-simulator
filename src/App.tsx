import { Activity, CircleAlert, TrainFront } from 'lucide-react'
import { useEffect, useReducer, useState } from 'react'
import './App.css'
import CabScene from './CabScene'
import { controlHelp } from './controlHelp'
import { createInitialLessonState, demoSteps, reduceLesson } from './lessonMachine'
import GuidedLesson from './GuidedLesson'
import YardMap from './YardMap'
import { createRouteState, reduceRoute } from './routeSimulation'

function App() {
  const [lesson, dispatch] = useReducer(reduceLesson, createInitialLessonState())
  const [route, dispatchRoute] = useReducer(reduceRoute, undefined, createRouteState)
  const [helpControlId, setHelpControlId] = useState<keyof typeof controlHelp | null>(null)
  const currentStep = demoSteps[lesson.stepIndex]
  const selectedControlHelp = helpControlId === null ? null : controlHelp[helpControlId]
  const completedControlIds = lesson.history.map((stepIndex) => demoSteps[stepIndex].controlId)
  const movementEnabled = lesson.status === 'active' && lesson.stepIndex === demoSteps.length - 1 && !route.completed

  useEffect(() => {
    if (!movementEnabled) return

    let frame = 0
    let previousTime = 0
    const tick = (time: number) => {
      if (previousTime > 0) {
        dispatchRoute({ type: 'tick', deltaSeconds: Math.min((time - previousTime) / 1000, 0.1), movementEnabled: true })
      }
      previousTime = time
      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [movementEnabled])

  useEffect(() => {
    if (route.completed && lesson.status === 'active') {
      dispatch({ type: 'completeMovement' })
    }
  }, [route.completed, lesson.status])

  const handleThrottleChange = (value: number) => {
    dispatchRoute({ type: 'set-throttle', value })
    if (lesson.status === 'active' && lesson.stepIndex === 5 && value > 0) {
      dispatch({ type: 'interact', controlId: 'throttle' })
    }
  }

  const handleAutomaticBrakeChange = (value: number) => {
    dispatchRoute({ type: 'set-brake', value })
    if (lesson.status === 'active' && lesson.stepIndex === 3 && value <= 10) {
      dispatch({ type: 'interact', controlId: 'brake-handle' })
    }
  }

  const restartScenario = () => {
    dispatch({ type: 'restart' })
    dispatchRoute({ type: 'reset' })
  }

  return (
    <div className="simulator-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <a className="brand" href="#top" aria-label="Progress Rail Operator Lab home">
            <span className="brand-mark"><TrainFront size={21} strokeWidth={1.8} /></span>
            <span className="brand-name">PROGRESS RAIL <span>OPERATOR LAB</span></span>
          </a>
          <div className="topbar-meta">
            <span className="topbar-divider" />
            <span>VALIDATION BAY <strong>04</strong></span>
            <span className="prototype-chip"><i /> PROTOTYPE</span>
          </div>
        </div>
      </header>

      <main id="top" className="workspace">
        <section className="module-heading" aria-labelledby="page-title">
          <div>
            <p className="eyebrow">TRAINING MODULE <span>01</span> / CAB ORIENTATION</p>
            <h1 id="page-title">First movement</h1>
            <p className="module-subtitle">EMD SD70ACe <span>·</span> First movement</p>
          </div>
          <div className="module-meta">
            <span className="meta-label">SCENARIO</span>
            <span className="scenario-name"><Activity size={15} /> Startup / controlled first movement</span>
          </div>
        </section>

        <div className="procedure-alert" role="note">
          <CircleAlert size={19} aria-hidden="true" />
          <p><strong>Variant mismatch.</strong> Visible control groups reference a 2005 SD70M-2 manual. This project targets the SD70ACe; use the manual as a layout reference only until the ACe controls and procedure are verified.</p>
        </div>

        <section className="training-grid" aria-label="Cab familiarization simulator">
          <div className="simulator-column">
            <div className="section-bar">
              <div><span className="section-index">A</span><h2>Locomotive cab</h2></div>
              <span className="view-state"><i /> IN CAB <span>·</span> BAY 04</span>
            </div>

            <CabScene
              completedControlIds={completedControlIds}
              currentControlId={currentStep?.controlId ?? null}
              disabled={lesson.status !== 'active'}
              factoryDoorOpen={lesson.stepIndex >= 5 || route.progress > 0}
              motion={route.speedMph > 0.05 ? 'moving' : 'stopped'}
              operatingState={{
                fuelPumpOn: lesson.fuelPumpOn,
                engineRunOn: lesson.engineRunOn,
                engineRunning: lesson.engineRunning,
                brakeReleased: route.automaticBrakePercent <= 10,
                direction: lesson.direction,
                throttleApplied: route.throttlePercent > 0,
                throttlePercent: route.throttlePercent,
                automaticBrakePercent: route.automaticBrakePercent,
              }}
              throttleEnabled={lesson.status === 'active' && lesson.stepIndex >= 5}
              brakeEnabled={lesson.status === 'active' && lesson.stepIndex >= 3}
              onControl={(controlId) => dispatch({ type: 'interact', controlId })}
              onControlHelp={setHelpControlId}
              onThrottleChange={handleThrottleChange}
              onAutomaticBrakeChange={handleAutomaticBrakeChange}
            />

            <div className="readout-strip" aria-label="Demonstration state">
              <div className="readout-cell">
                <span>CONTROL FUEL P.</span>
                <strong><i className={`status-led ${lesson.fuelPumpOn ? 'active' : ''}`} />{lesson.fuelPumpOn ? 'ON / REF' : 'OFF / REF'}</strong>
              </div>
              <div className="readout-cell">
                <span>ENGINE RUN</span>
                <strong>{lesson.engineRunOn ? 'ON / REF' : 'OFF / REF'}</strong>
              </div>
              <div className="readout-cell">
                <span>BRAKE</span>
                <strong>{route.automaticBrakePercent <= 10 ? 'RELEASED / DEMO' : 'APPLIED / DEMO'}</strong>
              </div>
              <div className="readout-cell">
                <span>LOCOMOTIVE</span>
                <strong>{route.speedMph > 0.05 ? 'MOVING / DEMO' : 'STATIONARY / DEMO'}</strong>
              </div>
            </div>

            <p className="scene-caption">The window is background context. Control placement is provisional pending SD70ACe validation.</p>
          </div>

          <div className="map-column">
            <YardMap route={route} />
          </div>

          <GuidedLesson
            lesson={lesson}
            selectedControlHelp={selectedControlHelp}
            onAction={dispatch}
            onRestart={restartScenario}
            onCloseControlHelp={() => setHelpControlId(null)}
          />
        </section>

        <footer className="workspace-footer">
          <span>OPERATOR LAB <b>·</b> SIMULATOR BUILD 0.1</span>
          <span>TRAINING STATUS: <strong>PROTOTYPE</strong></span>
        </footer>
      </main>
    </div>
  )
}

export default App
