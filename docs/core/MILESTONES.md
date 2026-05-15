# MILESTONES

> Companion to: [DEVELOPMENT_ROADMAP](DEVELOPMENT_ROADMAP.md) · [TASK_TRACKER](TASK_TRACKER.md) · [TESTING_STRATEGY](../workflow/TESTING_STRATEGY.md)

Each milestone has:
- a single sentence **goal**,
- an explicit **acceptance checklist** (every box must tick),
- a **demonstration script** (what to run/show to prove the milestone),
- an **exit artifact** to commit (screenshot, log, or text dump),
- a **git tag** to mark the milestone in the repo history.

Milestones are gates. Until milestone N is signed off, work on N+1 is allowed only on non-blocking, parallel tracks (e.g. asset authoring, report writing).

## M1 — "Hello, Park" (end of W1)

**Goal**: a baseline Three.js renderer is alive on GitHub Pages and the team's tooling is bootstrapped.

Acceptance checklist:
- [ ] GitHub Classroom repo created, all members joined as collaborators
- [ ] `vendor/` contains Three.js + tween.js + lil-gui + stats.js (committed, not gitignored)
- [ ] `index.html` boots without console errors on Chrome/Firefox/Safari
- [ ] one rotating placeholder cube renders to canvas
- [ ] `?debug=1` shows Stats.js FPS overlay
- [ ] `.nojekyll` present; Pages serves from `main`
- [ ] README has a working live-demo URL pinned at the top
- [ ] all 30 `.md` docs are present and at least skeleton-completed (this package)

Demo: open the Pages URL on a phone, see a green cube spinning.

Exit artifact: `screenshots/m1_hello_park.png` + `git tag m1`.

---

## M2 — "Empty Park is Walkable" (end of W2)

**Goal**: there is a recognizable park footprint and the user can fly around it.

Acceptance checklist:
- [ ] Ground mesh (120 × 120 m) with placeholder grass + path tint
- [ ] Day skybox (any cubemap)
- [ ] `DirectionalLight` + `HemisphereLight` + one `PointLight` + one `SpotLight` instantiated
- [ ] OrbitControls feel smooth (rotate, pan, zoom limits set)
- [ ] camera dolly speed feels right (~8 units/s zoom)
- [ ] `BoxHelper` markers indicate the four future ride sites
- [ ] 60 fps in an empty park (no shadows yet)
- [ ] HUD root visible (empty lil-gui panel)
- [ ] `InputRouter` logs pointer & key events to console under `?debug=1`

Demo: orbit around, pan, zoom, see the four ride placeholders. Toggle `?debug=1` and see live FPS.

Exit artifact: `screenshots/m2_empty_park.png` + `git tag m2`.

---

## M3 — "Hierarchical Ride Works End-to-End" (end of W3)

**Goal**: the Ferris wheel proves the scene graph, the ride state machine, and the in-world control panel.

Acceptance checklist:
- [ ] Ferris wheel built from primitives at the correct site
- [ ] `ring.rotation.y` continuous when ride is `running`
- [ ] each gondola counter-rotates to remain vertical — verified by attaching a labeled cube to one gondola and recording 10 s
- [ ] passenger sub-meshes parented to gondola, swaying with `sin(t)`
- [ ] in-world control-panel mesh exists, signal sphere shows red (idle) / green (running)
- [ ] clicking the panel toggles the ride via the raycaster pipeline
- [ ] tween.js used for the speed ramp (`EaseInOutQuad`)
- [ ] no console errors; no NaN positions
- [ ] code passes structural review against [TECHNICAL_ARCHITECTURE](TECHNICAL_ARCHITECTURE.md) (the `Ride` base class exists; the API surface matches)

Demo: open the URL, click the panel, watch the wheel start; click again, watch it stop with ease.

Exit artifact: `screenshots/m3_ferris.png` + `videos/m3_counter_rotation.mp4` + `git tag m3`.

---

## M4 — "All Four Rides Running" (end of W5)

**Goal**: every ride in the spec works, every interaction pattern exists.

Acceptance checklist:
- [ ] Carousel running with phase-offset bobbing
- [ ] Roller coaster cart follows Catmull-Rom curve, never leaves the track, never inverts catastrophically
- [ ] Tagada arm three-axis motion gives plausibly chaotic appearance
- [ ] each ride has its own 3D control panel, toggling independently
- [ ] click-to-fly works on the ground; the camera always lands above terrain
- [ ] scroll wheel modifies the focused ride's speed multiplier with easing
- [ ] `G` toggles FPV gondola camera; `Esc` exits
- [ ] click on a lamppost toggles its `PointLight`
- [ ] HUD lil-gui shows: day-time slider (functional even if cycle isn't styled yet), per-ride speed readouts, help overlay button (`H`)
- [ ] no exception in 60 s of stress-clicking

Demo: full DEMO_SCRIPT runs (the live one in [DEMO_SCRIPT](../deliverables/DEMO_SCRIPT.md)) but without final materials.

Exit artifact: `screenshots/m4_all_rides.png` + `git tag m4`.

---

## M5 — "Park is Beautiful" (end of W6)

**Goal**: materials, textures, and day/night cycle make the scene visually convincing.

Acceptance checklist:
- [ ] every named material from [MATERIAL_SYSTEM](../graphics/MATERIAL_SYSTEM.md) is instantiated and applied to the correct surfaces
- [ ] every material listed has at least 3 texture channels populated (color + normal + specular/roughness, with emissive or alpha where applicable)
- [ ] anisotropic filtering enabled on the ground texture
- [ ] day → night cycle continuous and smooth; lampposts and ride neons turn on around `sunElev < 0.15`
- [ ] skybox crossfades between day and night without visible seam
- [ ] sun color and hemisphere ambient lerp correctly through dawn/dusk
- [ ] HUD time-of-day slider scrubs the cycle in real time
- [ ] visual review by all team members passes (red/green review checklist in [TESTING_STRATEGY](../workflow/TESTING_STRATEGY.md))

Demo: open URL, scrub the time slider from 0 to 1 and back, see lights ignite at dusk, see neon glow.

Exit artifact: `screenshots/m5_day.png`, `screenshots/m5_dusk.png`, `screenshots/m5_night.png`, `videos/m5_timelapse.mp4` + `git tag m5`.

---

## M6 — "Performance + Polish Lock" (end of W7)

**Goal**: project meets the frame-rate target with full post-processing on baseline hardware; FPV gondola lands the climactic interaction.

Acceptance checklist:
- [ ] `EffectComposer` pipeline (Render → Bloom → Output) shipped
- [ ] tone mapping ACES with exposure 1.0
- [ ] directional light shadow map active over the scene; PCF-soft; bias tuned (no acne, no peter-panning)
- [ ] `InstancedMesh` for lampposts (12), benches (≥ 6), fence posts (≥ 50)
- [ ] FPV gondola camera attaches and detaches cleanly; the gondola counter-rotation continues to function while the camera is attached
- [ ] frame budget at 1080p on baseline laptop:
  - [ ] 60 fps median, with `bloom + shadow + 6 lights + 4 rides + 15 visitors`
  - [ ] no frame > 33 ms (drop-frame budget)
- [ ] mobile fallback profile (`?mobile`) reaches 30 fps on a 2022 mid-range Android
- [ ] all `console.warn`/`console.error` paths exercised at least once in dev and silent in production

Demo: run perf script, capture trace, post to `screenshots/m6_perf.png`. Run FPV demo.

Exit artifact: `videos/m6_fpv_demo.mp4`, `perf/m6_baseline.json` + `git tag m6`.

---

## M7 — "Shippable" (end of W8, deadline-3 days)

**Goal**: everything is final, deliverables exist, the team is ready to defend.

Acceptance checklist:
- [ ] no unresolved TODO comments in `src/`
- [ ] no `console.log` left in production code paths
- [ ] all asset attribution recorded in `assets/CREDITS.md`
- [ ] every doc in `docs/` reviewed for internal-link breakage (script in [GIT_WORKFLOW](../workflow/GIT_WORKFLOW.md))
- [ ] final report PDF compiled and committed under `report/report.pdf`, ≥ 10 pages
- [ ] slide deck committed under `report/slides.pdf` and `report/slides.pptx`
- [ ] 90-second demo video committed under `report/demo.mp4`
- [ ] README banner image + GIF embedded
- [ ] Pages live and matches `git tag v1.0.0`
- [ ] submission email drafted (per [PRESENTATION_STRATEGY](../evaluation/PRESENTATION_STRATEGY.md)) and sent to `marco.schaerf@uniroma1.it`
- [ ] Infostud registration done

Demo: open the live URL on a fresh laptop; in 90 seconds, run the full demo script.

Exit artifact: `git tag v1.0.0`, screenshot of the live Pages URL on a fresh browser, email-sent confirmation.

---

## Sign-off Discipline

Milestones are **not negotiable**. If a checklist item fails:
- it is logged in [TASK_TRACKER](TASK_TRACKER.md) as a regression task,
- the milestone is **not signed off**, the git tag is **not applied**,
- subsequent milestones can still progress *only on independent tracks* (e.g. asset authoring during a code regression).

A milestone sign-off entry is a single line in `docs/core/MILESTONE_LOG.md`:

```
M3 signed off 2026-06-07 by @username — screenshots/m3_ferris.png, videos/m3_counter_rotation.mp4
```
