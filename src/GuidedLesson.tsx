import { ArrowRight, CircleAlert, CircleCheck, Info, Pause, Play, RotateCcw } from 'lucide-react'
import type { ControlHelp } from './controlHelp'
import { demoSteps, type LessonAction, type LessonState } from './lessonMachine'

type GuidedLessonProps = {
  lesson: LessonState
  selectedControlHelp: ControlHelp | null
  onAction: (action: LessonAction) => void
  onRestart: () => void
  onCloseControlHelp: () => void
}

function GuidedLesson({ lesson, selectedControlHelp, onAction, onRestart, onCloseControlHelp }: GuidedLessonProps) {
  const currentStep = demoSteps[lesson.stepIndex]
  const displayedStep = lesson.reviewedStepIndex === null ? currentStep : demoSteps[lesson.reviewedStepIndex]
  const progress = Math.round((lesson.history.length / demoSteps.length) * 100)

  return (
    <aside className="guided-lesson" aria-label="Guided lesson">
      <div className="guided-lesson-head">
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

      {selectedControlHelp && (
        <section className="control-help-panel" aria-labelledby="control-help-title" aria-live="polite">
          <div className="control-help-header">
            <div>
              <p className="eyebrow">CONTROL GUIDE</p>
              <h3 id="control-help-title">{selectedControlHelp.title}</h3>
            </div>
            <button className="control-help-close" type="button" onClick={onCloseControlHelp} aria-label="Close control explanation" title="Close explanation">
              <span aria-hidden="true">×</span>
            </button>
          </div>
          <p>{selectedControlHelp.purpose}</p>
          <p>{selectedControlHelp.context}</p>
          <div className="control-help-model-note"><Info size={14} aria-hidden="true" /><span>{selectedControlHelp.modelNote}</span></div>
        </section>
      )}

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
                  onClick={() => onAction({ type: 'review', stepIndex: index })}
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
          <button className="primary-action" type="button" onClick={() => onAction({ type: 'start' })}>
            <Play size={16} fill="currentColor" /> Begin demo <ArrowRight size={16} />
          </button>
        )}
        {lesson.status === 'active' && (
          <button className="primary-action" type="button" onClick={() => onAction({ type: 'pause' })}>
            <Pause size={16} fill="currentColor" /> Pause demo
          </button>
        )}
        {lesson.status === 'paused' && (
          <button className="primary-action" type="button" onClick={() => onAction({ type: 'resume' })}>
            <Play size={16} fill="currentColor" /> Resume demo
          </button>
        )}
        <button className="restart-action" type="button" onClick={onRestart} aria-label="Restart demo" title="Restart demo">
          <RotateCcw size={16} />
        </button>
      </div>

      <div className="validation-footnote"><Info size={15} /><span>High-level practice prototype only. Not for locomotive operation or engineer qualification.</span></div>
    </aside>
  )
}

export default GuidedLesson