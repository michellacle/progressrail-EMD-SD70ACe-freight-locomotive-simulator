import type { DemoControlId } from './lessonMachine'

export type ControlHelp = {
  title: string
  purpose: string
  context: string
  modelNote: string
}

const modelNote = 'The supplied manual is for an SD70M-2, not an SD70ACe. Confirm this control’s name, location, and behavior in an approved SD70ACe reference.'

export const controlHelp: Record<DemoControlId, ControlHelp> = {
  'control-fuel-pump': {
    title: 'Control Fuel Pump switch',
    purpose: 'Controls the fuel-pump circuit. The fuel system supplies the diesel engine; this is part of the locomotive setup, not a movement control.',
    context: 'The SD70M-2 manual lists this switch in the cab switch panel and describes fuel priming as part of its engine-start sequence. This screen does not teach a startup checklist.',
    modelNote,
  },
  'engine-run': {
    title: 'Engine Run switch',
    purpose: 'An engine-control switch associated with the locomotive’s run state. It is separate from the throttle, which requests traction power.',
    context: 'The supplied SD70M-2 manual identifies the switch and its setup position but does not explain its full control logic in the material used here.',
    modelNote,
  },
  'engine-start': {
    title: 'Engine Control Panel START',
    purpose: 'Requests the locomotive’s computer-controlled diesel-engine start sequence. The engine does not start instantly when the button is pressed.',
    context: 'The SD70M-2 manual describes a managed sequence involving fuel priming and the starter motor. Required checks, interlocks, and exact sequence are intentionally not simulated here.',
    modelNote,
  },
  'brake-handle': {
    title: 'Automatic brake handle',
    purpose: 'Controls the train’s automatic air brakes. These brakes act through the train brake system, including coupled cars when configured for that service.',
    context: 'Think of this as the train-brake control. Its positions and setup are more involved than the simple release/apply illustration shown here.',
    modelNote,
  },
  reverser: {
    title: 'Reverser',
    purpose: 'Selects the direction used for locomotive traction: forward, neutral, or reverse. It is not the throttle and does not set speed.',
    context: 'The throttle requests traction power; the reverser selects direction. The supplied manual describes a removable directional handle and a neutral position.',
    modelNote,
  },
  throttle: {
    title: 'Throttle handle',
    purpose: 'Requests traction power. The locomotive’s control systems translate the setting into engine output and electrical power for the traction motors.',
    context: 'A throttle setting is a request, not a direct mechanical connection to wheel speed. The control response depends on locomotive state and operating conditions.',
    modelNote,
  },
  'gen-field': {
    title: 'Generator Field switch',
    purpose: 'Controls the generator-field circuit used in the locomotive’s electrical power system. It is a setup switch, not a routine speed control.',
    context: 'The SD70M-2 manual lists this switch and its setup position. This prototype does not simulate its electrical interlocks or effects.',
    modelNote,
  },
  'dynamic-brake-control': {
    title: 'Dynamic Brake Control breaker',
    purpose: 'Enables a circuit associated with dynamic-brake control. A breaker protects a circuit; it is not the handle that requests braking effort.',
    context: 'This is distinct from the dynamic brake handle. The supplied manual lists the breaker in the switch panel and describes it as a control-circuit breaker.',
    modelNote,
  },
  isolation: {
    title: 'Isolation switch',
    purpose: 'Selects an engine-control mode identified in the SD70M-2 reference as START, STOP, or ISOLATE.',
    context: 'The manual says isolation limits automatic engine speed-ups for specific maintenance circumstances. This prototype does not simulate those modes or their safety conditions.',
    modelNote,
  },
  'dynamic-brake': {
    title: 'Dynamic brake handle',
    purpose: 'Uses the traction motors as generators to create a retarding force that helps slow the locomotive. This is electrical braking, separate from the air brakes.',
    context: 'The dynamic brake handle requests dynamic-braking effort; the Dynamic Brake Control breaker is a separate circuit control. This demo does not model braking force, speed limits, or when to use it.',
    modelNote,
  },
  'independent-brake': {
    title: 'Independent brake handle',
    purpose: 'Controls the locomotive’s brakes independently of the automatic train brake, which is used to control braking through the train.',
    context: 'The SD70M-2 manual treats automatic and independent brake handles separately and describes specific setup positions. The handle graphic here is only illustrative.',
    modelNote,
  },
}