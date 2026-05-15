# DEVELOPMENT ROADMAP

> Companion to: [MILESTONES](MILESTONES.md) · [TASK_TRACKER](TASK_TRACKER.md) · [RISK_ANALYSIS](../workflow/RISK_ANALYSIS.md)

## 1. Calendar

Anchored to the **July 12, 2026 deadline** (preferred), with a 6-day cushion against the alternate **August 28** deadline. Today's date for this plan: **2026-05-14**. That gives **8 working weeks**.

| Week | Dates | Phase | Theme |
| --- | --- | --- | --- |
| W1 | May 18 – May 24 | Phase 0 – Bootstrap | repo, vendoring, baseline scene |
| W2 | May 25 – May 31 | Phase 1 – Scene foundation | ground, sky, lighting rig v1, camera |
| W3 | Jun 1 – Jun 7 | Phase 2 – Ride 1 (Ferris Wheel) | the flagship hierarchical model |
| W4 | Jun 8 – Jun 14 | Phase 2 – Rides 2 + 3 (Carousel, Coaster) | parallel work |
| W5 | Jun 15 – Jun 21 | Phase 3 – Ride 4 + Interaction polish | Tagada arm + raycast panels |
| W6 | Jun 22 – Jun 28 | Phase 4 – Materials + Day/Night | textures, normal maps, sun orbit, neon |
| W7 | Jun 29 – Jul 5 | Phase 5 – Post / shadow / FPV / Optimization | bloom, PCF, gondola cam, perf pass |
| W8 | Jul 6 – Jul 12 | Phase 6 – Polish, report, deploy | report, slides, demo video, GitHub Pages |

If the team is 1 person, **drop Tagada arm** and reduce visitors to 6. If the team is 4 people, **promote stretch goals** (audio, fireworks, cloth).

## 2. Phases — Detailed

### Phase 0 — Bootstrap (W1)

**Goal**: green hello-world Three.js cube rendering on GitHub Pages, repo structure in place.

Deliverables:
- repo initialized via GitHub Classroom
- `vendor/three/`, `vendor/tween.js/`, `vendor/lil-gui/`, `vendor/stats.js/` committed
- `index.html` with import-map, canvas, minimal HUD root
- `src/main.js` boots App, attaches renderer to canvas, draws a placeholder ground
- `.nojekyll`, `.gitignore`, `LICENSE`, `README.md` (with a working live-demo URL)
- CI-equivalent manual check: open Pages URL on three browsers
- doc audit: cross-check every file in `docs/` is linked at least once

Exit criteria:
- `https://<student>.github.io/luna-park-3d/` loads a Three.js scene with one rotating placeholder cube within 1 s on a baseline laptop.

### Phase 1 — Scene Foundation (W2)

**Goal**: a navigable empty park you can fly around.

Deliverables:
- `Ground` mesh with placeholder gradient material covering 120 × 120 m
- `Skybox` with day cubemap (any free cubemap; final cubemap arrives later)
- `LightingRig` v1: Directional sun, Hemisphere ambient, one Spot, one Point
- `CameraRig` with FreeOrbit working; smooth dolly limited above ground
- `InputRouter` skeleton; logs pointer/keyboard to console
- `Stats.js` overlay behind a `?debug=1` flag
- a placeholder `BoxHelper`-marked "site" for each future ride (Ferris position, Carousel position, etc.)

Exit criteria:
- 60 fps in an empty park, orbit controls feel "right" (target dolly speed = 8 units/s, rotate sensitivity tuned).

### Phase 2 — Ride 1 (W3): Ferris Wheel

**Goal**: the flagship hierarchical model. Done well, the rest of the project follows quickly.

Deliverables:
- Built procedurally from primitive geometries first (cylinders, boxes), to lock the **scene graph** before art:
  - Root group `ferris_wheel`
  - `hub` child (static)
  - `ring` child (rotates around Y)
  - eight `arm_i` children of `ring`
  - one `gondola_i` per arm — the counter-rotation lives here
  - two `passenger_i_left/right` per gondola
- `Ride.update()` for the Ferris wheel:
  - `ring.rotation.y += ω * dt`
  - `gondola_i.rotation.y = -ring.rotation.y` to compensate (visual proof of hierarchical transforms)
  - passenger sway: `passenger.rotation.z = sin(t + i*π/4) * 0.08`
- in-world `ControlPanel`:
  - small `Group` with podium box, signal sphere (initial red emissive), lever cylinder
  - `userData = { pickable: true, rideRef: "ferris_wheel" }`
- raycaster picks the panel → toggles ride state via ease-in/out
- tween.js used for the speed ramp; tested with `EaseInOutQuad`

Exit criteria:
- "Counter-rotation" passes the visual test: a gondola is selected with a colored material, recorded for 10 s — its world-Y axis never deviates by more than ±0.05 rad. Camera can also fly to a gondola and confirm.

### Phase 2 — Rides 2 & 3 (W4): Carousel + Roller Coaster

**Goal**: two more rides demonstrating different animation patterns.

Carousel:
- `platform` rotates around Y
- eight horses parented to platform, each with:
  - phase offset `i * 2π / 8`
  - bob `y = baseY + sin(t * 2π * f + phase) * 0.4`
- rider parented to horse
- tent / canopy parented to platform with no relative motion (static-in-local but moves with the world)

Roller coaster:
- a hand-authored array of 30 control points forms a closed `CatmullRomCurve3`
- track is built from `TubeGeometry(curve, 200, 0.15, 8, true)` for the rail; a thinner second tube for the second rail; vertical posts via instanced cylinders sampled along the curve
- cart's transform per frame:
  - `position = curve.getPointAt(u)`
  - tangent `T = curve.getTangentAt(u)`
  - rolling frame from `curve.computeFrenetFrames` — frame.normals and frame.binormals are precomputed for stability
  - `cart.matrix.makeBasis(B, N, -T).setPosition(p)`
- `u` advances `du = speed * dt / curveLength`; speed slows on uphill via `du *= (1 - 0.4 * tangent.y)` (heuristic; documented in [ANIMATION_SYSTEM](../interaction/ANIMATION_SYSTEM.md))
- passengers parented to cart; tilt added via curvature term

Exit criteria:
- both rides start/stop from their own 3D panels; coaster cart stays exactly on the track at 30 m/s scene speed; no inversion glitch.

### Phase 3 — Ride 4 + Interaction Polish (W5): Tagada Arm

**Goal**: cover the **third category of animation** (compound multi-axis sinusoid), and finish all six interaction patterns.

Tagada arm:
- base `Y` rotation at 0.5 rad/s
- primary arm rotates on X with `sin(t)` × 0.5 rad
- secondary arm rotates on Z with `sin(t * 1.7)` × 0.4 rad
- seat platform on Y at 4 rad/s
- when toggled off, all axes ease to zero using a damped-spring (semi-implicit Euler — directly Lecture 19)
- ride panel as above

Interaction polish:
- click-to-fly fully working with collision-with-ground clamp (`max(0.5, target.y)`)
- scroll wheel on a focused ride modifies speed multiplier (eased)
- key `G` attaches camera to nearest gondola, `Esc` detaches
- click on lamppost mesh toggles its `PointLight`
- HUD: lil-gui with day-time slider, color picker for ride neon, ride speeds readouts, help overlay (`H`)

Exit criteria:
- the [DEMO_SCRIPT](../deliverables/DEMO_SCRIPT.md) runs end-to-end without console errors.

### Phase 4 — Materials & Day/Night (W6)

**Goal**: replace placeholders with real materials; ship the day/night cycle.

Materials:
- per [MATERIAL_SYSTEM](../graphics/MATERIAL_SYSTEM.md), one material per family with proper map slots
- color, normal, MRA (metalness/roughness/AO packed), emissive where used
- anisotropic filtering on ground; mipmaps everywhere

Day/Night:
- `DayNight.update(t)` orbits the directional sun on the X-Y plane radius ~80 m
- sun color shifts: noon = `#fff7e0`, sunset = `#ffaf6d`, midnight = `#0a0e22` (the dim ambient)
- hemisphere lerp: sky `#bcdfff` → `#0a0e22`, ground `#5a4030` → `#08080a`
- lampposts turn on when sun elevation < 0.15
- ride neons turn on at the same threshold
- skybox crossfade: a custom shader interpolates between two cube samplers

Exit criteria:
- a recorded 10 s timelapse of sliding from noon to midnight is visually convincing (no popping, no stuck lights).

### Phase 5 — Post / Shadows / FPV / Optimization (W7)

**Goal**: enable shadow mapping, post-processing, FPV gondola camera, and meet 60 fps target.

Shadows:
- directional light shadow map 4096 if a discrete GPU is detected, else 2048
- camera tightened to scene bounds; `light.shadow.bias = -0.0005`; `normalBias = 0.05`
- `PCFSoftShadowMap` chosen

Post:
- `EffectComposer` with `RenderPass`, `UnrealBloomPass` (threshold 0.85, strength 0.6, radius 0.4), `OutputPass`
- tone mapping `ACESFilmicToneMapping`, exposure 1.0
- bloom dynamically disabled if `?fast` flag set

Optimization (full pass per [PERFORMANCE_OPTIMIZATION](../graphics/PERFORMANCE_OPTIMIZATION.md)):
- merge lampposts into one `InstancedMesh`
- merge bench / fence repeaters
- frustum culling check
- check draw-call budget < 200 in final scene

Exit criteria:
- 60 fps at 1080p on baseline laptop with bloom on; 30 fps on Android mid-range with `?mobile`.

### Phase 6 — Polish, Report, Deploy (W8)

**Goal**: ship deliverables.

- finalize the report (`report/report.pdf`) per [FINAL_REPORT_OUTLINE](../deliverables/FINAL_REPORT_OUTLINE.md)
- record the 90-second demo video and embed link in README
- finalize slides per [SLIDES_PLAN](../deliverables/SLIDES_PLAN.md)
- final pass on **every** TODO comment in code
- final visual QA per [TESTING_STRATEGY](../workflow/TESTING_STRATEGY.md) matrix
- tag `v1.0.0`, ensure Pages serves the tagged commit, send the submission email to `marco.schaerf@uniroma1.it`

## 3. Dependency Graph

```
P0 Bootstrap ──► P1 Scene foundation ──► P2 Ferris ──► P2 Carousel + Coaster
                                            │
                                            └──► P3 Tagada + Interaction polish
                                                          │
                                                          ▼
                                              P4 Materials + Day/Night
                                                          │
                                                          ▼
                                              P5 Post + Shadows + FPV + Perf
                                                          │
                                                          ▼
                                              P6 Polish + Report + Deploy
```

Critical path = P0 → P1 → P2(Ferris) → P3 → P4 → P5 → P6.
Carousel and Coaster (P2) are parallelizable with Ferris but they re-use code patterns established by Ferris, so unless the team is ≥ 2 people, they sequence after.

## 4. Implementation Order Heuristic ("scaffold first, art last")

For every new subsystem we follow the same protocol:

1. **Stub** with placeholder geometry (`BoxGeometry`, `CylinderGeometry`).
2. **Wire interactions and state machine** with the stub.
3. **Lock the public API** (the `Ride` interface, the `CameraRig` interface).
4. **Replace geometry with final mesh** (custom or downloaded).
5. **Apply final materials** with all texture channels.
6. **Tune timing constants** (speeds, easings).

Doing it in this order means art changes never block code. Conversely, swapping the carousel's horse model for a higher-poly one at week 7 changes literally one line.

## 5. Daily Cadence

- **Morning (45 min)**: stand-up against [TASK_TRACKER](TASK_TRACKER.md), pick one task, mark `in_progress`.
- **Coding block (3-4 h)**: implement against the relevant `.md`, commit small.
- **Visual review (15 min)**: take a screenshot, append to `/report/log/` for the development-log appendix in the final report.
- **End-of-day (15 min)**: update task, push branch, tick milestone progress.

## 6. Buffers

- **W7 has a 1-day intentional buffer** for unforeseen integration bugs.
- **W8 has a 2-day buffer** before the deadline.
- If buffers go unused, the slack is allocated to stretch goals **in this priority order**:
  1. Sky cubemap crossfade quality
  2. Audio (looping fairground music + per-ride mechanical sounds)
  3. Fireworks particle system at night
  4. Cloth flag stretch goal
