# SD70M-2 Manual Reference

## Source

[Canadian National Railways - Electro-Motive SD70M-2 Locomotive Operator's Manual](https://ia800508.us.archive.org/17/items/canadian-national-railways-electro-motive-sd70m-2-locomotive-operators-manual-/Canadian%20National%20Railways%20-%20Electro-Motive%20SD70M-2%20Locomotive%20Operator%27s%20Manual%20%28First%20Edition%2C%20November%202005%29_hocr.html), First Edition, November 2005. The cover identifies Electro-Motive Diesel, Inc. as publisher and the locomotive as SD70M-2.

## Useful Control Vocabulary

The manual separates controls into an Engine Control Panel, Switch Panel, Engineer's Control Stand, and Air Brake controls. Its control-stand references include throttle, dynamic brake, and reverser handles. The switch-panel references include Control Fuel Pump, Engine Run, Gen. Field, and Dynamic Brake Control. The Engine Control Panel includes an engine-start pushbutton. The air-brake discussion distinguishes automatic and independent brake handles.

Section 3's electrical setup and engine-start discussion describes required inspection/setup before starting and an automatic engine-start sequence initiated from the engine control panel. The air-brake setup is a separate procedure with lead/trail and brake-system configuration. Those details are configuration- and railroad-specific and are not copied into the simulator as SD70ACe instructions.

## Applicability Limit

This is an SD70M-2 manual for Canadian National Railways, not an SD70ACe manual. It is useful for control terminology and a provisional panel grouping only. It does not verify the SD70ACe control names, positions, interlocks, setup state, or operating sequence. The simulator must not present this reference as an approved SD70ACe procedure; a matching ACe manual and Progress Rail/trainer review are still required.

## Simulator Use

The current interface labels panels and controls using this SD70M-2 reference and marks the model mismatch in the UI. Its high-level power/start/brake/movement logic is a prototype based on the user's scenario, not an operational procedure. The Muncie factory footprint, outbound track, yard, and test loop are illustrative map geometry, not a surveyed site plan; the simulated mph and 5 mph cap are interface-demo values only. Replace or validate every control and transition against an SD70ACe source before using it for training.