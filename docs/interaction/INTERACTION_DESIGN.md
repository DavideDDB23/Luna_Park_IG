# INTERACTION DESIGN

> Companion to: [INPUT_SYSTEM](INPUT_SYSTEM.md) · [UI_UX_PLAN](UI_UX_PLAN.md) · [CAMERA_SYSTEM](../graphics/CAMERA_SYSTEM.md) · [STATE_MANAGEMENT](STATE_MANAGEMENT.md)

## 1. Goals

The course requires user interaction. The project ships **six categorically distinct interactions**, each addressing a different point of the course's example list ("turn on/off lights, change viewpoint, configure colors, change difficulty, ..."). The interactions are designed so they:

- are obvious at a glance (zero onboarding needed for the demo),
- feel diegetic (control panels live in the world, not floating on the HTML overlay),
- exercise three different input modalities (pointer, keyboard, scroll-wheel),
- demonstrate raycasting against arbitrary scene-graph meshes — the strongest Lecture 15 hook in the live demo.

## 2. The Six Interactions

| # | Name | Trigger | Effect | Lecture hook |
| --- | --- | --- | --- | --- |
| I1 | **Click-to-fly** | left-click on the ground | camera tweens to the hit point | 05 (projection), 15 (ray) |
| I2 | **3D control panels** | left-click on a ride's panel mesh | the ride toggles (start/stop with easing) | 15 (raycasting), 18 (animation) |
| I3 | **Time-of-day slider** | drag HUD slider OR press `[` / `]` keys | sun orbits, lights ignite, sky lerps | 11 (lighting), 16 (shadows) |
| I4 | **FPV gondola camera** | press `G` near the Ferris wheel; `Esc` to exit | camera follows a gondola | 05 (view transform), 18 (animation) |
| I5 | **Per-ride speed** | scroll wheel while pointer hovers a ride | ride speed multiplier eases up/down | 18 (easing) |
| I6 | **Lamp toggle + neon color** | left-click on a lamppost; or HUD color picker | individual light toggles / ride neon recolor | 11 (lights), 10 (procedural color) |

## 3. Interaction I2 — 3D Control Panels (deep dive)

This is the project's marquee interaction. Each ride owns a `ControlPanel` with this shape:

```
controlPanel (Group, positioned in front of the ride)
├── pedestal       (Box)
├── signalLight    (Sphere; emissive material; red OR green)
├── lever          (small Cylinder; tilts when toggled)
└── pickArea       (invisible Box, larger; userData.pickable=true, userData.rideRef=<id>)
```

Click flow (also in [TECHNICAL_ARCHITECTURE](../core/TECHNICAL_ARCHITECTURE.md) §5):

1. `mousedown` → `mouseup` within 6 px and 250 ms → `click`.
2. `Raycaster.pick(scene, ndc)` filtered to `userData.pickable === true`.
3. First hit's `userData.rideRef` resolves the ride.
4. `EventBus.emit("ride:toggle", { rideId })` is fired.
5. The corresponding `Ride.toggle()` is called.
6. `Ride.toggle()`:
   - if `state === "idle"`: state → `ramping_up`, tween `speed: 0 → targetSpeed * speedMultiplier` over 1500 ms (`EaseInOutQuad`); on completion, state → `running`.
   - if `state === "running"`: state → `ramping_down`, tween `speed → 0` over 1500 ms; on completion, state → `idle`.
   - `signalLight.material.color` lerps between red and green over 250 ms.
   - `lever.rotation.x` tweens between `-0.4` and `+0.4` rad over 400 ms (`EaseOutCubic`).
   - `EventBus.emit("ride:state", { rideId, state })` for HUD readouts.

Edge cases:
- If the user spams the panel during a ramp, the second click queues; we accept at most one queued state change and ignore further clicks.
- If a tween is cancelled mid-way (e.g. URL state reset), the speed must reset cleanly via `tween.stop()` then setting `speed = 0`.

## 4. Interaction I6 — Light Toggle (deep dive)

Lampposts are an InstancedMesh. Clicking picks the instance index via `intersection.instanceId`. Each instance is mirrored by a real `PointLight` object kept in a parallel array `lamps[i]`. Toggle behavior:

- if `lamps[i].visible === true`: tween `intensity → 0` over 600 ms (`EaseInOutQuad`), then `visible = false`. Also disable the corresponding emissive bulb material via `bulbMaterials[i].emissiveIntensity = 0`.
- otherwise: `visible = true`, tween `intensity → 2.0` over 600 ms.

Even when the day/night cycle would re-ignite the lamp at dusk, the user's manual override **wins** — we set a `userOverride: true | false | null` flag per lamp:
- `null`: follow the cycle automatically.
- `true`: user wants it on. Stays on regardless of cycle.
- `false`: user wants it off. Stays off regardless of cycle.

Double-tap on a lamp resets `userOverride = null`. HUD has a "Reset lamp overrides" button.

The HUD color picker is a separate widget on the HUD; it emits `EventBus.emit("rideNeon:setColor", color)`. All ride-neon `PointLight` and emissive materials subscribe and update.

## 5. Interaction I5 — Per-Ride Speed (deep dive)

When the pointer is over a pickable child of a ride (filtered by walking parents), scrolling the wheel adjusts that ride's `speedMultiplier` ∈ [0.2, 3.0]. The multiplier doesn't snap — it tweens toward the new value over 400 ms with `EaseOutCubic`. A small HUD overlay shows "Carousel ×1.8" while the user scrolls.

We deliberately do NOT allow speed to go to zero — toggling start/stop is the panel's job; speed is for fine-tuning. Zero is reserved for the explicit toggle UX.

## 6. Drag vs Click Discrimination

A canonical UX bug is "click-to-fly fires while user is panning". We disambiguate:

```
mousedown at (x0, y0, t0)
mouseup   at (x1, y1, t1)
isClick   = distance(x0..x1) < 6 px AND (t1 - t0) < 250 ms AND no shift/ctrl/alt
```

Only `isClick == true` triggers raycasting. Otherwise `OrbitControls` handles it.

Touch events follow the same rule, with a 12 px threshold to forgive finger jitter.

## 7. Keyboard Bindings (master list)

(See [INPUT_SYSTEM](INPUT_SYSTEM.md) §4 for the canonical KeyMap.)

| Key | Action |
| --- | --- |
| `H` | toggle help overlay |
| ``` ` ``` | toggle FPS overlay |
| `G` | enter FPV gondola (if near the Ferris wheel) |
| `Esc` | exit FPV gondola; cancel any active tween |
| `[` | scrub time of day backward |
| `]` | scrub time of day forward |
| `P` | pause / resume day/night auto cycle |
| `R` | reset camera to default overview |
| `1`..`4` | fly to ride 1..4 (`?demo`-style shortcut) |
| `T` | toggle a debug scene-graph print to console (debug build only) |

## 8. Hover Feedback

Every pickable mesh has a hover affordance:
- the mouse cursor changes to `pointer` when over a pickable (via `canvas.style.cursor`)
- the control panel's signal sphere subtly pulses when hovered (uses a per-frame sin modulation)
- ride bodies do NOT highlight on hover — too noisy; only panels and lamps do.

## 9. Sound Feedback (stretch only)

If audio is shipped (see [AUDIO_PLAN](../assets/AUDIO_PLAN.md)):
- ride start: a short bell ding
- panel click: a soft click
- lamp toggle: a soft thunk
- gondola FPV enter/exit: woosh

## 10. Error / Edge UX

| Situation | Behaviour |
| --- | --- |
| User clicks outside the park footprint | flies to closest valid point on the ground (clamped) |
| User clicks during a camera tween | second click is queued; if not on a pickable, ignored |
| User presses `G` not near the Ferris wheel | HUD toast: "Get closer to the Ferris wheel" (2 s) |
| Touch device with no scroll wheel | speed widget on HUD is shown explicitly with ± buttons |

## 11. Accessibility

- keyboard-only fallback exists for every interaction (see §7)
- HUD respects `prefers-reduced-motion` by disabling bloom intensity flicker and the spotlight orbit
- a `?nopost` URL disables bloom for users who find it visually overwhelming
- color picker has accessible labels via `aria-label`

## 12. Pedagogical Talking Points (for oral)

- "Every ride toggle goes through the **same raycasting pipeline** as click-to-fly. We define one `Raycaster.pick(...)`; it returns the first object with `userData.pickable === true`. The ray itself is `origin = camera.position, direction = unprojected NDC` — Lecture 15."
- "Speed ramps use `EaseInOutQuad` from tween.js. The plot of the easing curve is in the report (Lecture 18 'tweens')."
- "FPV camera mode is a Lecture-05 view-transform demo: we recompute the view matrix every frame from a child Object3D whose world transform we read."
