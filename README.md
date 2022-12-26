ClassWiz emulator
=================

This repository collects CASIO ClassWiz emulators on ClassPad.net.

Every model requires ~1 MB download.

Differences from the official one:

- The screen is changed from SVG to canvas, which improves the performace greatly. However, rendering is not as crisp as before.
- `requestAnimationFrame` is used to achieve instant feedback whereas the official emulator is capped at 5 FPS.
- The emulation code is moved from a dedicated worker back into the main UI thread. Reduces memory copy.

Not implemented yet:

- Does not respond to PC keyboard.
- Key log, screenshot, all the bells and whistles.

Known bugs:

- The display flickers after switching models.
