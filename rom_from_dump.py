#!/usr/bin/env python3

import re
import sys
from typing import List

if len(sys.argv) != 3:
    print("Usage: python rom_from_dump.py input.dmp output.bin")
    sys.exit(1)

print(f"Reading {sys.argv[1]} ...")
with open(sys.argv[1], "rb") as f:
    buffer = f.read()


def ask_for_one(name: str, matches: List[re.Match]) -> re.Match:
    if not matches:
        print(f"Cannot find {name}; extraction failed")
        sys.exit(1)
    elif len(matches) > 1:
        for i, match in enumerate(matches):
            print(i, match.start(), match.group())
        i = int(input(f"Which one is {name}? "))
    else:
        i = 0
    print(f"Found {name} at {matches[i].start():#x}")
    return matches[i]


# Search for the interrupt vector table.
magic0 = re.compile(
    rb"\x00\xf0(..)(..)(..)(.[\x01-\xff]|[\x01-\xff].)\4\4\4\4(..)\4\4\4\4\4\4",
    re.DOTALL,
)
i = ask_for_one(
    "segment #0",
    [
        match
        for match in magic0.finditer(buffer)
        if b"\x00\xf0" not in match.groups() and b"\xff\xff" not in match.groups()
    ],
).start()
segment0 = buffer[i : i + 0x10000]

# Search for the magic trailer and check for the number part of the model.
# Only ClassWiz X series and ES PLUS 1st & 2nd editions are supported.
magic1 = re.compile(
    rb"\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f(?:....((?:CY-|GY)\d{3})|......(CY-\d{3}))",
    re.DOTALL,
)
match = ask_for_one("segment #1+", list(magic1.finditer(buffer)))
i = match.start()
if match.group(2):
    print(f"ClassWiz X series model {match.group(2)}")
    segment1 = buffer[i + 32 - 0x30000 : i + 32]
else:
    print(f"ES PLUS series model {match.group(1)}")
    segment1 = buffer[i + 24 - 0x10000 : i + 24]

print(f"Writing {sys.argv[2]} ...")
with open(sys.argv[2], "wb") as f:
    f.write(segment0)
    f.write(segment1)
