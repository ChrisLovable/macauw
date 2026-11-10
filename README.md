# Macauw E-Kleiduiwe — Version 19 (exact MP4)

- Kudu targets use the **unchanged, byte-for-byte original** `assets/kudu-original-source.mp4` (1152×768; 154 frames at 30 fps, 5.133 s).
- Decoded in real time through an HTML5 video element. The old animated WebP frame-sequence target is **removed**.
- Canvas removes the white MP4 backdrop only during drawing; body and leg movement/timing are not modified.
- Animals are considerably smaller at all three distances.
- Kill-zone scoring: at least 100 kg of biltong, higher for speed and distance.
- Biltong appears where the hit animal was for 0.5 seconds. No card.
- All other disciplines remain in the game.

To run locally (PowerShell):
`cd C:\macauw-eclay; npx --yes serve . -l 3210`

To rebuild standalone file: `python build-standalone.py`
