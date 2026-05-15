# INPUT SYSTEM

> Companion to: [INTERACTION_DESIGN](INTERACTION_DESIGN.md) · [STATE_MANAGEMENT](STATE_MANAGEMENT.md)

The input system has **one source of truth**: `InputRouter`. Every pointer / keyboard / wheel event lands here first, is normalized, then dispatched. This keeps Three.js's `OrbitControls`, the raycaster, the HUD, and the camera modes from fighting over the same event.

## 1. Goals

- One place to listen, one place to dispatch.
- No double-fire (e.g. pointerdown firing both `OrbitControls` rotate and `ClickToFly` tween).
- Touch + mouse + pen unified through Pointer Events.
- Easy to extend for new interactions.

## 2. Routing Diagram

```
DOM events (canvas, window, document)
   │
   ▼
InputRouter
   │── pointerstate snapshot (per frame)
   │── keystate snapshot (per frame)
   │
   ├── (gesture detector: click vs drag)
   │
   ▼
EventBus events:
   "input:click"        { ndc, world hit, modifiers }
   "input:drag"         { dx, dy }            (only after movement threshold)
   "input:wheel"        { dy, ndc }
   "input:key"          { key, action: down|up, modifiers }
   "input:resize"       { w, h }
```

Subscribers (in `EventBus`):
- `Raycaster` listens to `"input:click"` to dispatch pickable hits.
- `OrbitControls` is fed `pointermove` only when `dragging` is true and target is on the ground.
- `HUD` listens to selected keys (`H`, ``` ` ```).
- `CameraRig` listens to mode-switch keys (`G`, `Esc`, `R`, `1..4`).

## 3. Click vs Drag

Per [INTERACTION_DESIGN](INTERACTION_DESIGN.md) §6:

```
on pointerdown(e):
  pointer.down = { x: e.clientX, y: e.clientY, t: performance.now(), id: e.pointerId }
  pointer.dragging = false

on pointermove(e):
  if pointer.down and distance(pointer.down, e.client) > THRESHOLD:
    pointer.dragging = true
    forward to OrbitControls

on pointerup(e):
  if !pointer.dragging and (time since down < 250 ms):
    emit "input:click" with ndc, modifiers
  pointer.down = null
  pointer.dragging = false

THRESHOLD: 6 px on mouse, 12 px on touch
```

Multi-touch is delegated entirely to `OrbitControls` (pinch zoom, two-finger pan); no `input:click` fires when two pointers are active.

## 4. KeyMap (canonical)

```
src/interaction/KeyMap.js (single source of truth)

export const KEY_BINDINGS = {
  HELP: ["KeyH"],
  FPS_TOGGLE: ["Backquote"],
  GONDOLA_ENTER: ["KeyG"],
  GONDOLA_EXIT: ["Escape"],
  TIME_BACK: ["BracketLeft"],
  TIME_FORWARD: ["BracketRight"],
  DAY_NIGHT_PAUSE: ["KeyP"],
  CAMERA_RESET: ["KeyR"],
  FLY_RIDE_1: ["Digit1"],
  FLY_RIDE_2: ["Digit2"],
  FLY_RIDE_3: ["Digit3"],
  FLY_RIDE_4: ["Digit4"],
  SG_DEBUG_PRINT: ["KeyT"]
};
```

Subscribers query the binding name, not the raw key. Reassignment is one-line.

## 5. Wheel (mouse and trackpad)

`wheel` events:
- raw delta (`event.deltaY`) is normalized by `event.deltaMode`:
  - `0` (pixels) → divide by 100
  - `1` (lines) → divide by 3
  - `2` (pages) → unchanged
- emitted as `input:wheel` with NDC of the pointer at event time.

If the pointer is over a pickable ride, the wheel adjusts that ride's speed multiplier. Otherwise, the event passes through to `OrbitControls` for zoom.

To distinguish "scroll over ride for speed" vs "scroll for zoom" without conflict, when the pointer is over a pickable ride child, we **stopPropagation** on the wheel event so OrbitControls does not also process it. This is exactly what `OrbitControls.enableZoom = false` would do, but we keep zoom enabled by default and disable per-event.

## 6. Touch Handling

- All events arrive as Pointer Events; no separate `touchstart` etc.
- The pointer-event-pointerId is preserved to track multi-touch.
- For two-finger pinch / pan, `OrbitControls`' built-in handling is sufficient.
- Tap-and-hold for 600 ms emits `input:longpress` — reserved for future use; currently unused.

## 7. Pointer Lock (NOT used)

We do not request pointer lock at any point. The FPV gondola is **follow-only**, not free-look; the camera orientation is dictated by the gondola transform.

## 8. Resize

Window-resize is throttled to 100 ms and emitted as `input:resize`. The `App` listens and:
- updates `camera.aspect`
- calls `camera.updateProjectionMatrix()`
- updates `renderer.setSize` and `composer.setSize`
- recomputes any device-pixel-ratio-dependent textures

## 9. Lifecycle

`InputRouter`:
- `init(canvas)`: attaches DOM listeners.
- `beginFrame()`: takes a per-frame snapshot of pressed keys / pointer state.
- `endFrame()`: clears one-shot flags.
- `dispose()`: removes DOM listeners.

The `Loop` calls `beginFrame` and `endFrame` around each animation step.

## 10. Tests

(Mostly manual; see [TESTING_STRATEGY](../workflow/TESTING_STRATEGY.md).)

- click vs drag: drag at 5 px should NOT fire input:click; drag at 7 px should fire input:drag instead
- modifier keys: shift-click is consumed by `OrbitControls` for pan (default)
- key while typing in HUD textbox: should NOT trigger global hotkeys (we check `document.activeElement` is not an `INPUT` / `TEXTAREA`)
- Safari-specific quirks: confirm pointer events work; iOS Safari requires `touch-action: none` on the canvas

## 11. Lecture Anchors

- The raycaster's ray construction (`origin = camera.position, direction = unprojected NDC`) is the literal definition from Lecture 15. The viewport-to-NDC transform is Lecture 05.
- Wheel-to-speed is an example of mapping an analog input to an animation rate — referenced in Lecture 18 (keyframes vs procedural animation).
