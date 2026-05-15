# ANIMATION SYSTEM

> Companion to: [INTERACTION_DESIGN](INTERACTION_DESIGN.md) · [SCENE_STRUCTURE](../graphics/SCENE_STRUCTURE.md) · [STATE_MANAGEMENT](STATE_MANAGEMENT.md)

> ⚠️ **Hard constraint, repeated**: per `Project_Requirements.pdf` page 3, **animations cannot be imported**. Every animation in this project is implemented in JavaScript. We do NOT use Three.js's `AnimationMixer` to play imported clips. We DO use `Three.Clock` and `tween.js` and our own update loops.

## 1. Architecture

There are **three categories** of animation in this project:

| Category | What it is | Driver | Lecture |
| --- | --- | --- | --- |
| **Procedural** | continuous motion derived from `elapsedTime` | analytic function in `Ride.update()` | 18 (procedural animation) |
| **Tweened** | one-shot eased transitions | tween.js | 18 (keyframes/tweens) |
| **Physics-flavored** | mass-spring damped oscillators | semi-implicit Euler | 19 (physics-based animation) |

Every animation belongs to exactly one category. The categorization is documented in code with a comment header (`// ANIM CATEGORY: procedural`).

## 2. Clock & Frame Update

The single `THREE.Clock` instance lives in `Clock.js`. Each frame:

```
elapsedTime = clock.getElapsedTime()
dt          = clock.getDelta()            // clamped to [0, 1/30]
TWEEN.update(performance.now())
for each ride: ride.update(dt, elapsedTime)
dayNight.update(dt)
flicker.update(dt)
visitors.update(dt)
```

`elapsedTime` is monotonic from app boot. `dt` is the time since the previous frame, clamped so a tab-switch doesn't make ride positions explode.

## 3. Procedural Animations — Per-Ride Drivers

### 3.1 Ferris wheel

```
// in FerrisWheel.update(dt, t)
ω = baseAngularVelocity * currentSpeedMultiplier      // baseAngularVelocity ≈ 0.25 rad/s
ring.rotation.y += ω * dt

for each gondola_i (i = 0..7):
    gondola_i.rotation.y = -ring.rotation.y           // counter-rotation
    passengerL.rotation.z = sin(t * 2.0 + i * 0.8)     * 0.05
    passengerR.rotation.z = sin(t * 2.0 + i * 0.8 + π) * 0.05
```

Lecture-05 talking point: this is the canonical hierarchical transform demo.

### 3.2 Carousel

```
ω = 0.5 * speedMultiplier   // rad/s
platform.rotation.y += ω * dt

for each horse_i (i = 0..7):
    phase = i * 2π / 8
    horse_i.position.y = baseY + sin(t * 2π * 0.4 + phase) * 0.5
    horse_i.rotation.z = cos(t * 2π * 0.4 + phase) * 0.05
```

The carousel demonstrates **phase-offset sinusoidal animation** — Lecture 18.

### 3.3 Roller coaster

```
u += speed * dt / curveLength
u = u mod 1

P = curve.getPointAt(u)
T = curve.getTangentAt(u)

// precomputed once at boot, sampled at this u:
{normals[], binormals[]} = curve.computeFrenetFrames(300, true)
N = normals[ floor(u * 300) ]
B = binormals[ floor(u * 300) ]

// build the cart's local frame (right, up, forward):
cart.matrix.makeBasis(B, N, T.clone().negate())
cart.matrix.setPosition(P)
cart.matrixAutoUpdate = false
cart.matrixWorldNeedsUpdate = true

// speed depends on track gradient:
speed = baseSpeed * (1 - 0.4 * T.y)   // slows uphill, speeds downhill

// passenger tilt is read off Frenet curvature κ:
passenger.rotation.z = κ * 0.3
```

This is the **most technical** animation in the project. The report calls it out as a Catmull-Rom curve sampled with a Frenet frame — Lecture 07 (surfaces) plus Lecture 18 (procedural).

### 3.4 Tagada arm

```
base.rotation.y    += 0.5 * dt
arm1.rotation.x     = sin(t * 1.0)  * 0.5   // ±30°
arm2.rotation.z     = sin(t * 1.7)  * 0.4
seatPlat.rotation.y = (t * 4.0) mod 2π        // fast spin
```

Three nested rotations with **incommensurate frequencies** (1.0, 1.7, 4.0) produce a non-periodic compound motion. Talking point: "the orbit of the seat platform never quite repeats — exactly the kind of compound motion Lecture 18 mentions when introducing procedural animation."

### 3.5 Visitors

```
for each visitor:
    // waypoint following
    pos.lerp(waypointTarget, visitor.speed * dt)
    if distance(pos, waypointTarget) < 0.2:
        pick next waypoint by transition table

    // limb sway
    armL.rotation.x = sin(t * 6.0 + visitor.phase) * 0.4
    armR.rotation.x = sin(t * 6.0 + visitor.phase + π) * 0.4
    legL.rotation.x = sin(t * 6.0 + visitor.phase + π) * 0.5
    legR.rotation.x = sin(t * 6.0 + visitor.phase) * 0.5
```

A lightweight **flocking** rule (Lecture 18) optionally adds slight separation:

```
nearby = visitors within 1.5 m
separation = - (Σ (otherPos - pos)) / count(nearby)
visitor.heading += separation * 0.05 * dt
```

## 4. Tweened Animations (tween.js)

Tween.js is the **only** library involved. Easing names map onto tween.js's built-in easings:

| Use case | Easing | Duration (ms) |
| --- | --- | --- |
| Camera fly | Quadratic.InOut | 1200 |
| Ride start/stop ramp | EaseInOutQuad on speed | 1500 |
| Panel signal color | Linear on R/G/B | 250 |
| Panel lever tilt | Cubic.Out | 400 |
| Lamp on/off | Quadratic.InOut on intensity | 600 |
| Ride speed multiplier | Cubic.Out | 400 |
| HUD slider feedback | Sinusoidal.Out | 200 |
| Day/night manual scrub | Linear (we drag) | n/a |

`TweenRegistry` keeps all tweens in one group and ticks them with `TWEEN.update(performance.now())` once per frame. We never call `tween.update()` per object — single update call is more efficient.

## 5. Physics-flavored Animations

### 5.1 Tagada damped stop

When the user toggles Tagada off, the arms ease to zero using **semi-implicit Euler** with a critically damped spring per axis:

```
state:  x, v   (for each axis: arm1.rotation.x, arm2.rotation.z)
target: x_t = 0
k = 50       // spring constant
c = 2 * sqrt(k)  ≈ 14.14   // critical damping

each frame:
    F = -k*(x - x_t) - c*v
    v += F * dt
    x += v * dt
```

When all |v| and |x| are below epsilons, the animation completes.

Lecture-19 talking point: "this is the semi-implicit Euler form from the slide on numerical integration — energy-stable, unlike explicit Euler."

### 5.2 Cloth flag (stretch goal — Lecture 19/20)

A grid of mass-spring particles representing a flag. Vertices attached to a flagpole are fixed. Update step:

```
for each particle p (except fixed):
    F_gravity  = (0, -9.81, 0) * mass
    F_springs  = Σ over neighbors n: k * (|p - n| - rest) * (n - p)/|p - n|
    F_damp     = -damp * (v_p - v_n_avg)
    F          = F_gravity + F_springs + F_damp
    v_p       += F * dt
    p         += v_p * dt
```

Constraints: max stretch limit per spring to prevent blow-up at large `dt`. Semi-implicit Euler keeps it stable.

The cloth flag is **optional** and only ships if M6 is signed off with slack.

## 6. Easing Library

`Easing.js` exposes named easings mapped to tween.js easings:

```
EASE.LINEAR        = TWEEN.Easing.Linear.None
EASE.QUAD_IN_OUT   = TWEEN.Easing.Quadratic.InOut
EASE.CUBIC_OUT     = TWEEN.Easing.Cubic.Out
EASE.SIN_IN_OUT    = TWEEN.Easing.Sinusoidal.InOut
EASE.BACK_OUT      = TWEEN.Easing.Back.Out
EASE.BOUNCE_OUT    = TWEEN.Easing.Bounce.Out
```

Animations reference these aliases; if we ever swap tween library, the change is one file.

## 7. Animation Choreography for the Demo

The pre-scripted demo path uses these animations in this order:
1. on boot, Ferris wheel and Carousel are running (procedural).
2. demo script tweens camera (tween.js).
3. user clicks Carousel panel → ramping_down tween.
4. user drags time-of-day slider → DayNight.update lerps multiple channels.
5. user clicks Ferris panel → ramping_up tween → settles into procedural loop.
6. user presses `G` → camera tween into gondola; gondola continues procedural.
7. demo ends with the user scrubbing time-of-day forward for the night reveal.

## 8. Determinism & Reproducibility

For visual regression tests, animations must be deterministic given an `elapsedTime`. Therefore:
- procedural drivers must depend **only** on `t` and per-instance constants, NOT on accumulated state.
- tweens are seeded from an explicit "start time" (`tween.start(now)`) so a paused-and-resumed tween restarts cleanly.

This determinism lets us screenshot the scene at known `t` values for the report.

## 9. Pause/Resume

A global `App.paused` flag halts:
- procedural updates (skip `Ride.update`, skip `Visitors.update`)
- tween updates (`TWEEN.removeAll()` is too destructive; we use `TWEEN.pauseAll()` if available, else track `paused` manually).
- the day/night auto cycle.

The renderer still renders so the scene is visible.

## 10. Lecture Anchors (summary)

- **Lecture 18**: keyframing vs procedural — every ride is procedural; HUD-driven transitions are tweened. Phase-offset sinusoid on the carousel is the textbook example.
- **Lecture 18 (flocking)**: visitors use a separation rule; can add alignment for stretch.
- **Lecture 19**: Tagada stop uses semi-implicit Euler with a critically-damped spring.
- **Lecture 20**: cloth (optional stretch) is mass-spring on a grid.
