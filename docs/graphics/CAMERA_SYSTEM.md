# CAMERA SYSTEM

> Companion to: [INTERACTION_DESIGN](../interaction/INTERACTION_DESIGN.md) · [SCENE_STRUCTURE](SCENE_STRUCTURE.md) · [ANIMATION_SYSTEM](../interaction/ANIMATION_SYSTEM.md)

The camera system has **one camera and three modes**. Mode transitions are smooth tween-driven; the active mode is stored in `CameraRig.mode` and broadcast on `EventBus`.

## 1. Camera Projection

```
PerspectiveCamera(
  fov:    55,       // chosen for natural read; widens in FPV gondola to 70
  aspect: w / h,
  near:   0.1,
  far:    500
)
```

Resize handler keeps `aspect` synchronized with the canvas. **Near** is intentionally small (0.1 m) because the FPV mode places the camera close to the gondola interior; **far** is bounded because the scene is small.

Reference to Lecture 05:
- "Perspective transformation requires the homogeneous divide; the projection matrix here is exactly the one on the Lecture 05 slide titled 'Perspective Projection'."
- "Near and far planes are tuned to keep the depth precision adequate (Lecture 14, z-buffer).".

## 2. Mode: `FreeOrbit`

Wrapper around Three.js `OrbitControls`.

Settings:
- `enableDamping = true`, `dampingFactor = 0.05`
- `screenSpacePanning = false` (pan moves along ground)
- `minPolarAngle = 0.2`, `maxPolarAngle = π/2 - 0.05` (never goes underground, never goes overhead)
- `minDistance = 4`, `maxDistance = 120`
- `maxTargetRadius = 80` (so the user cannot lose the park off-screen)

Behaviour:
- Left mouse / one-finger drag: rotate
- Right mouse / two-finger drag: pan (clamped)
- Scroll / pinch: zoom (clamped)
- **Conflict with `ClickToFly`**: when the user pans/drags, no `ClickToFly` is triggered (we differentiate single-click from drag-end by tracking pointer move distance — see [INTERACTION_DESIGN](../interaction/INTERACTION_DESIGN.md) §6).

## 3. Mode: `ClickToFly`

When the user single-clicks (no drag, no shift, no on-pickable-object) on the ground:

1. Raycaster picks against `ground` mesh.
2. Hit point `P` is computed.
3. Compute target camera position: `cameraTarget = P + (camera.position - lookAtCurrent) projected to keep current direction`, clamped:
   - `cameraTarget.y = max(cameraTarget.y, 2.0)` so the camera never enters the ground
   - distance from `P` clamped to [4, 30]
4. Tween two interpolations in parallel:
   - `camera.position` → `cameraTarget` with `Easing.Quadratic.InOut` over 1200 ms
   - the `OrbitControls.target` → `P` with the same easing
5. While the tween runs, `OrbitControls` is disabled to avoid input fight.
6. On completion, controls re-enabled, `EventBus.emit("camera:flyEnd", P)`.

Special case: clicking on a ride's body (not its panel) flies to a position 6 m away from the ride at human eye level (1.7 m).

## 4. Mode: `GondolaCam`

The "first-person ride" mode.

Trigger: user presses `G` while within ~10 m of the Ferris wheel (we measure `camera.position.distanceTo(ferrisWheel.position) < 10`); otherwise the press is ignored with a HUD toast "Get closer to the Ferris wheel".

Activation sequence:
1. Pick the nearest gondola `gondola_k` (the one with the smallest world distance to the current camera).
2. Tween the camera to a precomputed "mount point" inside the gondola (a child Object3D named `cameraMount`):
   - position offset: (0, 0.6, 0.3) relative to gondola local frame
   - lookAt: directly forward in the gondola local frame
   - duration: 1500 ms with `Easing.Cubic.InOut`
3. Once tween finishes, parent the camera to the `cameraMount` Object3D (or, equivalently, update camera transform from the mount each frame — see §4.1).
4. Disable `OrbitControls`.
5. Show HUD overlay: "Press Esc or G to exit".

Each frame in this mode:
- camera transform = mount's world transform
- the gondola's counter-rotation continues to keep the gondola upright — the camera does NOT spin around its own forward axis as the wheel rotates
- the camera **does** translate along a circular path as the gondola is carried around the wheel

Exit (press `Esc` or `G`):
1. Detach camera (compute its current world transform, set as plain world transform, no parent).
2. Tween to a "viewing point" 12 m away looking at the wheel center.
3. Re-enable `OrbitControls`.

### 4.1 Parent vs follow

We chose **follow, not parent**: each frame in `GondolaCam.update()`, we read the mount's `getWorldPosition()` and `getWorldQuaternion()` and write them onto the camera. This avoids issues with Three.js's `OrbitControls` confusing itself when re-attaching to a parented camera; cleaner contract.

### 4.2 Motion sickness considerations

The Ferris wheel angular velocity is **slow** (ω ≈ 0.25 rad/s = one revolution per 25 s). FPV is smooth on every device tested. We do NOT add camera shake — would worsen sickness and add no grade benefit.

## 5. Camera Transition Tweening

A `CameraRig.flyTo(targetPos, lookAt, dur, easing)` method centralizes all camera moves. Internally:

- Saves current `camera.position`, `controls.target`.
- Runs both tweens in parallel via tween.js, returning a Promise that resolves on completion.
- On start, disables `OrbitControls`. On finish, re-enables.

Used by:
- `ClickToFly`
- Mode entry/exit transitions
- The DemoScript autopilot (used during the recorded demo video and during `?demo` URL mode)

## 6. Cinematic Demo Mode (URL `?demo=1`)

When `?demo=1` is set, on boot the camera runs a pre-scripted path:
1. Start at overhead (camera at (40, 40, 40), looking at origin).
2. Fly to the Ferris wheel (3 s).
3. Trigger ride start.
4. Fly to the Carousel (3 s).
5. ... etc.

This is the **trailer** mode — used to capture the demo video and to give a first-impression cinematic to a new visitor. See [DEMO_SCRIPT](../deliverables/DEMO_SCRIPT.md).

## 7. Frustum, Near, Far Audit Checklist

- [ ] Near is small enough that the FPV camera does not clip into the gondola passenger (≤ 0.1 m).
- [ ] Far is large enough that the skybox is visible from anywhere in the park (≥ 300 m given the 240 × 240 m world).
- [ ] FOV is tested on phone aspect (portrait): the auto-resize keeps aspect right.
- [ ] All four corners of the scene project to within the frustum at the default zoomed-out view.

## 8. Lecture Anchors

- **Lecture 05** (Perspective projection): "Our PerspectiveCamera builds exactly the projection matrix on the slide — fov, aspect, near, far map directly to the matrix entries."
- **Lecture 05** (View transform): "OrbitControls rotates around a `target`; that target plus camera position defines the view matrix. Changing the mode = changing the view matrix."
- **Lecture 15** (Raycasting): "The click-to-fly uses the same raycaster machinery as the ride-panel picking, both derived from the ray definition `p = o + t·d` on Lecture 15's slide 4."
