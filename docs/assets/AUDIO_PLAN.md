# AUDIO PLAN (Stretch / Optional)

> Companion to: [ASSET_PIPELINE](ASSET_PIPELINE.md) · [INTERACTION_DESIGN](../interaction/INTERACTION_DESIGN.md)

Audio is **not required by the course**. We list a plan here so that if M6 lands with slack (a likely outcome for a 2-or-more-person team), audio can be added in ~6 hours and noticeably improves the demo.

## 1. Decision Matrix

| Question | Answer |
| --- | --- |
| Does the course require audio? | No |
| Is the project visually complete without audio? | Yes |
| Does audio meaningfully improve the live demo? | Yes — significantly |
| Is the implementation costly? | Low (Three.js `Audio` + a few short loops) |
| Is the licensing risk manageable? | Yes if we source from Kenney's audio packs (CC0) or freesound.org with CC0 filter |
| **Decision** | **Ship if and only if M6 closes with ≥ 4 hours slack** |

## 2. Sound Inventory

| ID | Use | Length | Loop? | Source |
| --- | --- | --- | --- | --- |
| `amb.park` | ambient park hum (light crowd, distant music) | 30 s | yes | Kenney Sci-Fi Sounds (atmosphere) or freesound CC0 |
| `amb.night` | crickets + low neon hum (night only) | 30 s | yes | freesound CC0 |
| `mech.ferris` | gentle metal creak/whir | 4 s | yes (per ride) | freesound CC0 |
| `mech.carousel` | calliope-style music | 12 s | yes (per ride) | freesound CC0 |
| `mech.coaster` | rolling rumble | 4 s | yes (per ride) | freesound CC0 |
| `mech.tagada` | mechanical hiss | 4 s | yes (per ride) | freesound CC0 |
| `sfx.click` | panel click | 0.3 s | no | Kenney UI Sounds |
| `sfx.bell` | ride start ding | 0.6 s | no | Kenney Casino Sounds |
| `sfx.thunk` | lamp toggle | 0.3 s | no | Kenney UI Sounds |
| `sfx.woosh` | FPV transition | 1.0 s | no | freesound CC0 |

## 3. Implementation Sketch (pseudocode)

Three.js gives us positional audio out of the box (`THREE.PositionalAudio`):

```
audioListener = new AudioListener()
camera.add(audioListener)

For each ride:
  audio = new PositionalAudio(audioListener)
  audio.setBuffer(buffer of mech.<rideId>)
  audio.setLoop(true)
  audio.setRefDistance(6)
  audio.setVolume(0)
  ride.root.add(audio)

  // When ride state machine transitions:
  on "ride:state" with state === "running":
    fade volume from 0 to 0.6 over 1500 ms
  on "ride:state" with state === "idle":
    fade volume from current to 0 over 1500 ms then audio.stop()
```

Ambient track:

```
ambient = new Audio(audioListener)
ambient.setBuffer(amb.park)
ambient.setLoop(true)
ambient.setVolume(0.25)
ambient.play() // after first user gesture (browser autoplay policy)
```

Night ambience crossfades with `amb.night` based on `dayNight.nightAmount`.

## 4. Autoplay Policy

Browsers require a user gesture before audio plays. We handle this by:

1. Booting muted.
2. Showing a small "🔊 enable audio" badge in the HUD until the user clicks or presses a key.
3. On first user gesture, calling `audioContext.resume()` and starting ambient.

If the user never clicks anything, the project remains visually fully functional with no audio.

## 5. HUD Coupling

- A "🔊 audio" toggle in the lil-gui panel (under Misc).
- A master volume slider 0–1 (default 0.5).

## 6. Performance

- Three.js audio decoding cost is one-time at load.
- Per-frame cost of `PositionalAudio` per-ride: negligible (~0.05 ms total for 4 rides).
- Loading audio adds ~0.5 MB total (compressed OGG).
- The audio listener follows the camera — including in FPV gondola mode — automatic.

## 7. Style

Stay in the carnival-cartoon palette: nothing eerie, nothing punishing. Calliope (Wurlitzer-style) for the carousel is the iconic carnival sound — go for it. The coaster rumble should be present but mid-low volume, not dominating.

## 8. License Tracking

All audio entries logged in `assets/CREDITS.md` with source and license. The file is reviewed at M7.

## 9. Risk if NOT Shipped

None to the grade — audio is explicitly optional. The demo's wow-factor is reduced by ~15 %; the project remains visually distinctive.

## 10. Lecture Anchor

Audio doesn't tie to a specific course lecture. It's polish, not pedagogy. The report mentions it as a non-graphics enhancement.
