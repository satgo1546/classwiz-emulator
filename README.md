ClassWiz emulator
=================

This repository collects CASIO ClassWiz emulators on ClassPad.net.

Each model requires ~1 MB download.

Differences from the official one:

- The screen is changed from SVG to canvas, which improves the performace greatly. However, rendering is not as crisp as before.
- `requestAnimationFrame` is used to achieve instant feedback whereas the official emulator is capped at 5 FPS.
- The emulation code is moved from a dedicated worker back into the main UI thread. Reduces memory copy.

Not implemented yet:

- Does not respond to PC keyboard.
- Key log, screenshot, all the bells and whistles.

Known bugs:

- The display flickers after switching models.

## ROM extraction

Data files are encrypted with a complicated XOR encryption scheme. It is possible to reverse-engineer the algorithm by looking at the Wasm function named `LoadHexFile`. However, it is much easier to search for the ROM in the entire Wasm heap after the ROM is loaded.

Because physical segment #0 (0x00000..0x0FFFF) is special, it is stored in a separate buffer. A heuristic for finding physical segment #0 is to look for the interrupt vector table. CASIO calculators always have an initial value of stack pointer (SP) of 0xF000 and various interrupts with the same handler. Physical segments other than #0 can be found by searching for the model ID near the end of the ROM.

Incidentally, the ROM is encoded as a huge list of x86 instructions in ClassWiz emulators for Windows, and `LoadHexFile` exported in `SimU8.dll` goes unused. What a mess.
