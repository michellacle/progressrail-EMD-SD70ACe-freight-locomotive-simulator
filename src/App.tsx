import { Activity, ArrowRight, CircleAlert, CircleCheck, Info, Pause, Play, RotateCcw, TrainFront } from 'lucide-react'
import { useReducer } from 'react'
import './App.css'
import CabScene from './CabScene'
import { createInitialLessonState, demoSteps, reduceLesson } from './lessonMachine'

function App() {
  const [lesson, dispatch] = useReducer(reduceLesson, createInitialLessonState())
  const currentStep = demoSteps[lesson.stepIndex]
  const displayedStep = lesson.reviewedStepIndex === null ? currentStep : demoSteps[lesson.reviewedStepIndex]
  const completedControlIds = lesson.history.map((stepIndex) => demoSteps[stepIndex].controlId)
  const progress = Math.round((lesson.history.length / demoSteps.length) * 100)

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
              motion={lesson.motion}
              operatingState={{
                fuelPumpOn: lesson.fuelPumpOn,
                engineRunOn: lesson.engineRunOn,
                engineRunning: lesson.engineRunning,
                brakeReleased: lesson.brakeReleased,
                direction: lesson.direction,
                throttleApplied: lesson.throttleApplied,
              }}
              onControl={(controlId) => dispatch({ type: 'interact', controlId })}
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
                <strong>{lesson.brakeReleased ? 'RELEASED / DEMO' : 'APPLIED / DEMO'}</strong>
              </div>
              <div className="readout-cell">
                <span>LOCOMOTIVE</span>
                <strong>{lesson.motion === 'moving' ? 'MOVING / DEMO' : 'STATIONARY / DEMO'}</strong>
              </div>
            </div>

            <p className="scene-caption">The window is background context. Control placement is provisional pending SD70ACe validation.</p>
          </div>

          <aside className="lesson-rail" aria-label="Guided lesson">
            <div className="lesson-rail-head">
              <div>
                <p className="eyebrow">GUIDED PRACTICE</p>
                <h2>Startup / first movement</h2>
              </div>
              <span className={`lesson-state ${lesson.status}`}><i />{lesson.status}</span>
            </div>

            <div className="progress-block">
              <div className="progress-label"><span>DEMO PROGRESS</span><span>{String(lesson.history.length).padStart(2, '0')} / {String(demoSteps.length).padStart(2, '0')}</span></div>
              <div className="progress-track" role="progressbar" aria-label="Demo progress" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
                <span style={{ width: `${progress}%` }} />
              </div>
            </div>

            <div className="prompt-block" aria-live="polite">
              <div className="prompt-kicker"><span>{displayedStep ? lesson.reviewedStepIndex === null ? `STEP ${String(lesson.stepIndex + 1).padStart(2, '0')}` : `REVIEW / STEP ${String(lesson.reviewedStepIndex + 1).padStart(2, '0')}` : 'COMPLETE'}</span><span>DEMO ONLY</span></div>
              <h3>{displayedStep?.label ?? 'Movement demo complete'}</h3>
              <p>{lesson.status === 'ready'
                ? 'Begin the operating demo from the cab controls. Exact SD70ACe steps are awaiting manual review.'
                : displayedStep?.instruction ?? 'The illustrative movement has stopped. No operating steps were validated.'}</p>
            </div>

            <div className={`feedback-line ${lesson.mistakes > 0 && lesson.feedback.startsWith('Use') ? 'warning' : ''}`} role="status">
              {lesson.mistakes > 0 && lesson.feedback.startsWith('Use')
                ? <CircleAlert size={16} aria-hidden="true" />
                : lesson.status === 'complete'
                  ? <CircleCheck size={16} aria-hidden="true" />
                  : <Info size={16} aria-hidden="true" />}
              <span>{lesson.feedback}</span>
            </div>

            <div className="step-history">
              <div className="history-heading"><span>STEP LOG</span><span>{lesson.mistakes ? `${lesson.mistakes} MISSED INPUT${lesson.mistakes === 1 ? '' : 'S'}` : 'SESSION ONLY'}</span></div>
              <ol>
                {demoSteps.map((step, index) => {
                  const visited = lesson.history.includes(index)
                  const current = lesson.stepIndex === index && lesson.status !== 'complete'
                  return (
                    <li key={`${step.controlId}-${index}`}>
                      <button
                        type="button"
                        className={current ? 'history-step current' : 'history-step'}
                        disabled={!visited}
                        onClick={() => dispatch({ type: 'review', stepIndex: index })}
                        aria-label={`Review ${step.label}`}
                      >
                        <span className="history-number">{String(index + 1).padStart(2, '0')}</span>
                        <span className="history-title">{step.label}</span>
                        {visited && <CircleCheck size={15} aria-hidden="true" />}
                      </button>
                    </li>
                  )
                })}
              </ol>
            </div>

            <div className="lesson-actions">
              {lesson.status === 'ready' && (
                <button className="primary-action" type="button" onClick={() => dispatch({ type: 'start' })}>
                  <Play size={16} fill="currentColor" /> Begin demo <ArrowRight size={16} />
                </button>
              )}
              {lesson.status === 'active' && (
                <button className="primary-action" type="button" onClick={() => dispatch({ type: 'pause' })}>
                  <Pause size={16} fill="currentColor" /> Pause demo
                </button>
              )}
              {lesson.status === 'paused' && (
                <button className="primary-action" type="button" onClick={() => dispatch({ type: 'resume' })}>
                  <Play size={16} fill="currentColor" /> Resume demo
                </button>
              )}
              <button className="restart-action" type="button" onClick={() => dispatch({ type: 'restart' })} aria-label="Restart demo" title="Restart demo">
                <RotateCcw size={16} />
              </button>
            </div>

            <div className="validation-footnote"><Info size={15} /><span>High-level practice prototype only. Not for locomotive operation or engineer qualification.</span></div>
          </aside>
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
