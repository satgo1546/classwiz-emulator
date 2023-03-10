ClassWiz emulator
=================

This repository collects CASIO ClassWiz emulators on ClassPad.net.

Each model requires ~1 MB download.

Differences from the official one:

- The screen is changed from SVG to canvas, which improves the performace greatly. However, rendering is not as crisp as before.
- `requestAnimationFrame` is used to achieve instant feedback whereas the official emulator is capped at 5 FPS.
- The emulation code is moved from a dedicated worker back into the main UI thread. Reduces memory copy.
- ROMs for the following models are added.
  - fx-991CN X
  - fx-82/85/350CN X

Not implemented yet:

- Key log, screenshot, all the bells and whistles.

Known bugs:

- Memory seems not cleared after switching models. This may lead to weird things.

## ROM extraction

Data files are encrypted with a complicated XOR encryption scheme. It is possible to reverse-engineer the algorithm by looking at the Wasm function named `LoadHexFile`. However, it is much easier to get the ROM from the Wasm heap after the ROM is loaded. Since we have access to the simulation API, it is just a call to `ReadCodeMemory` away.

Incidentally, in case we have a memory dump only, it is still possible to locate the ROM. Because physical segment #0 (0x00000..0x0FFFF) is special, it is stored in a separate buffer. A heuristic for finding physical segment #0 is to look for the interrupt vector table. ClassWiz calculators always have an initial value of stack pointer (SP) of 0xF000 and various interrupts with the same handler. Physical segments other than #0 can be found by searching for the model ID near the end of the ROM, but the exact layout varies. This technique is used in `rom_from_dump.py`. It handles raw memory dump formats including the ones produced by Windows task manager and Cheat Engine.

For the curious: in the case of ClassWiz emulators for Windows, the ROM is encoded as a huge list of x86 instructions, and `LoadHexFile` exported in `SimU8.dll` goes unused. What a mess!
