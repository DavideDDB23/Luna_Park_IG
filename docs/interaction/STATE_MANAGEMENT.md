# STATE MANAGEMENT

> Companion to: [TECHNICAL_ARCHITECTURE](../core/TECHNICAL_ARCHITECTURE.md) · [INPUT_SYSTEM](INPUT_SYSTEM.md) · [INTERACTION_DESIGN](INTERACTION_DESIGN.md)

## 1. Philosophy

The project is small enough that **no state-management library is justified**. We use:

- A flat **AppState** object as the source of truth for HUD-visible values (sliders, toggles).
- **State machines per ride** for ride lifecycle.
- An **EventBus** for cross-module signaling.

This keeps reasoning simple, debugging trivial (`appState` is one object in the console), and dependencies minimal.

## 2. AppState Shape

```
appState = {
  timeOfDay: 0.55,           // [0, 1]
  dayCyclePaused: false,
  dayCycleSpeed: 1.0,        // multiplier; 1 = 60-s day cycle

  rideSpeed: {               // user-set multipliers
    ferrisWheel: 1.0,
    carousel: 1.0,
    rollerCoaster: 1.0,
    tagada: 1.0
  },

  rideState: {               // mirrors per-ride state machines
    ferrisWheel: "idle",     // "idle" | "ramping_up" | "running" | "ramping_down"
    carousel: "idle",
    rollerCoaster: "idle",
    tagada: "idle"
  },

  neonColor: "#ff2ab8",      // hex, single shared color for ride decoratives
  lampOverrides: [null, null, ...],   // length 12; null | true | false

  cameraMode: "orbit",       // "orbit" | "fly" | "gondola"
  fpvGondolaIndex: null,     // 0..7 when in gondola mode

  helpOpen: false,
  debugOverlay: false,

  paused: false              // global hard pause
}
```

The HUD reads from `appState`. When the user moves a slider, lil-gui mutates `appState.timeOfDay` directly; subscribers detect the change via the appropriate `on` event below.

## 3. EventBus — Event Catalog (closed set)

Every event name is namespaced (`area:verb`). Adding a new event requires:
1. adding it to this table,
2. adding a producer comment in code,
3. updating the subscribers list.

| Event | Payload | Producers | Subscribers |
| --- | --- | --- | --- |
| `input:click` | `{ ndc, modifiers }` | InputRouter | Raycaster |
| `input:drag` | `{ dx, dy }` | InputRouter | OrbitControls (via CameraRig) |
| `input:wheel` | `{ dy, ndc }` | InputRouter | OrbitControls, Ride.speed |
| `input:key` | `{ key, action, modifiers }` | InputRouter | HUD, CameraRig, DayNight |
| `input:resize` | `{ w, h }` | InputRouter | App |
| `ride:toggle` | `{ rideId }` | Raycaster (via panel hit) | rides |
| `ride:state` | `{ rideId, state }` | rides | HUD readouts |
| `ride:setSpeed` | `{ rideId, multiplier }` | InputRouter (wheel) | rides |
| `lamp:toggle` | `{ index }` | Raycaster (via lamp hit) | LightingRig |
| `rideNeon:setColor` | `{ color }` | HUD (color picker) | Flicker, MaterialLibrary |
| `dayNight:set` | `{ t }` | HUD slider, key handler | DayNight |
| `camera:setMode` | `{ mode, payload? }` | HUD button, key handler | CameraRig |
| `camera:flyStart` | `{ target }` | ClickToFly | (HUD log) |
| `camera:flyEnd` | `{ target }` | ClickToFly | (HUD log) |
| `app:pause` | none | HUD, key handler | App |
| `app:resume` | none | HUD, key handler | App |
| `asset:loaded` | `{ id }` | AssetLoader | App splash |
| `asset:error` | `{ id, err }` | AssetLoader | HUD toast |

EventBus implementation is a single 20-line file (`EventBus.js`). Closed-set discipline is enforced by lint comments, not at runtime.

## 4. Ride State Machine

Each ride is a finite state machine:

```
             [click panel]
   idle ───────────────────► ramping_up
     ▲                              │
     │ [tween done]                  │  [tween done]
     │                              ▼
ramping_down ◄─────────────── running
              [click panel]
```

Transitions are atomic; a click during `ramping_up` is buffered. Implementation: a queue of length 1 holds the last requested toggle; popped on entering an absorbing state.

```
Ride.toggle():
    switch(state):
        case "idle": _enter("ramping_up")
        case "running": _enter("ramping_down")
        case "ramping_up": queuedToggle = true
        case "ramping_down": queuedToggle = true

Ride._onTweenComplete():
    switch(state):
        case "ramping_up": _enter("running")
        case "ramping_down": _enter("idle")
    if queuedToggle: queuedToggle = false; this.toggle()
```

The signal sphere color reflects state exactly:
- `idle`: red
- `ramping_up`: yellow → green (tween)
- `running`: green
- `ramping_down`: green → red (tween)

## 5. Camera Mode State Machine

```
   orbit ◄─────────► fly         (ClickToFly is a one-shot, returns to orbit on tween end)
     │
     │ G (near ferris)
     ▼
  gondola  ─── Esc or G ──► orbit
```

Mode transitions can be intercepted: pressing `G` during a `fly` tween cancels the tween and goes directly to `gondola`.

## 6. Day/Night Controller State

```
DayNight {
   t: number in [0,1]
   autoCycle: bool
   cycleSpeed: float    // t advance per second
   tweenInProgress: bool
}
```

`update(dt)`:
- if `autoCycle && !tweenInProgress`: `t += cycleSpeed * dt; t = t mod 1`
- always: recompute sun, hemisphere, fog from `t`
- always: update emissive intensities and lamp visibility based on `t`

`setTimeOfDay(t)` (HUD slider drag): hard set; cancels any ongoing tween.

`tweenTimeOfDay(t, dur)`: smooth set; `tweenInProgress = true` during. Used for HUD preset buttons (e.g., "noon", "midnight").

## 7. Persistence

State is **not** persisted across page loads. Reload resets to defaults. Justification: the project is a demo, not an app. Saving local state would be feature creep.

URL parameters (`?time=0.8`, `?ride=carousel`) can preset some state on boot — see [TECHNICAL_ARCHITECTURE](../core/TECHNICAL_ARCHITECTURE.md) §7.

## 8. Debug Surface

Pressing `T` (with `?debug=1`) prints to console:

```
=== App state ===
{ timeOfDay, dayCyclePaused, ... }
=== Ride states ===
ferrisWheel: running (speed=0.25, multiplier=1.0)
carousel:    idle
...
=== Camera ===
mode: orbit, position: (12, 8, 14), target: (0, 0, 0)
```

Same dump is also written to a small `<pre>` element if `?statepanel=1` is set.

## 9. State Hazards Avoided

- **Stale event closures**: subscribers receive their own bound function from EventBus.on; unsubscribers are stored and called in dispose.
- **State write during read**: HUD writes to `appState.timeOfDay`; DayNight reads it in `update()`. We do not re-enter the cycle.
- **Tween race with state machine**: only the state machine writes `state`; tween completion callbacks call `_enter()`, which is the only mutator.

## 10. Lecture Anchors

State management isn't a course topic, but the documentation pattern itself is referenced in [EVALUATION_STRATEGY](../evaluation/EVALUATION_STRATEGY.md) as professionalism evidence.
