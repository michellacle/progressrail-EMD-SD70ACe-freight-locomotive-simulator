# Progress Rail Operator Lab

A browser-based prototype for practicing a locomotive startup and first-movement scenario from an illustrated cab. The current build includes an interactive control stand, beginner control explanations, guided prompts, pause/restart, step review, and a north-up schematic map of the factory-to-yard test route. The map follows a centered locomotive marker and displays illustrative speed, route progress, and a demo-only speed cap.

## Run locally

```sh
npm install
npm run dev
```

Check the app with:

```sh
npm test
npm run build
npm run lint
```

## Manual reference and limitations

The visible panel vocabulary is informed by the [2005 CN SD70M-2 Operator's Manual](docs/research/sd70m-2-manual-reference.md). The simulator target is an SD70ACe. The manual is for a different locomotive model and is only a provisional reference for panel grouping and terminology; it does not verify SD70ACe layout, controls, interlocks, or operating procedure.

The startup and movement behavior in this prototype is illustrative, not an operating procedure, qualification tool, or authority to operate a locomotive. Validate all control names, layout, sequence, and responses against an applicable SD70ACe manual and with Progress Rail training experts before using it for training.

The Muncie site, outbound track, yard, and test loop on the map are schematic and not surveyed. The simulated motion model is intentionally simplified; its speed readout and 5 mph cap are interface-demo values, not site restrictions or locomotive performance data.