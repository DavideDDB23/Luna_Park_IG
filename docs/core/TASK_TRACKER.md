# TASK TRACKER

> Companion to: [DEVELOPMENT_ROADMAP](DEVELOPMENT_ROADMAP.md) · [MILESTONES](MILESTONES.md)

## How to Use

The table below is the **canonical task list**. The status column moves between `TODO`, `WIP`, `BLOCKED`, `REVIEW`, `DONE`. Estimate is in **half-day units** (4 h). Owner is a GitHub handle or "—" if unassigned.

When status moves to WIP, append a sub-line indented two spaces. When status moves to DONE, drop the sub-lines and update the parent line only.

For each task we also reference the **`.md` doc** that defines it (so that when a coding assistant ingests this list, it knows which doc to read first).

| ID | Task | Milestone | Owner | Est. | Status | Doc reference |
| --- | --- | --- | --- | --- | --- | --- |
| **PHASE 0 — Bootstrap** | | | | | | |
| T-001 | Initialize GitHub Classroom repo, add collaborators, configure Pages | M1 | — | 1 | TODO | [GIT_WORKFLOW](../workflow/GIT_WORKFLOW.md) |
| T-002 | Add vendored `three`, `tween.js`, `lil-gui`, `stats.js` to `vendor/` | M1 | — | 1 | TODO | [TECHNICAL_ARCHITECTURE](TECHNICAL_ARCHITECTURE.md) §1.2 |
| T-003 | `index.html` + import map + canvas + minimal HUD root | M1 | — | 1 | TODO | [TECHNICAL_ARCHITECTURE](TECHNICAL_ARCHITECTURE.md) §2 |
| T-004 | `src/main.js`: renderer, scene, camera, single placeholder cube | M1 | — | 1 | TODO | [TECHNICAL_ARCHITECTURE](TECHNICAL_ARCHITECTURE.md) §4 |
| T-005 | `App`, `Loop`, `Clock`, `EventBus` skeleton | M1 | — | 1 | TODO | [TECHNICAL_ARCHITECTURE](TECHNICAL_ARCHITECTURE.md) §6 |
| T-006 | `?debug=1` URL parser + Stats.js wiring | M1 | — | 1 | TODO | [DEBUG_WORKFLOW](../workflow/DEBUG_WORKFLOW.md) |
| T-007 | Add `.nojekyll`, `.gitignore`, `LICENSE`, README banner | M1 | — | 0.5 | TODO | this doc |
| T-008 | First Pages deploy + 3-browser smoke test | M1 | — | 0.5 | TODO | [GIT_WORKFLOW](../workflow/GIT_WORKFLOW.md) |
| **PHASE 1 — Scene foundation** | | | | | | |
| T-101 | `SceneRoot.js` with named groups (props, rides, lights) | M2 | — | 1 | TODO | [SCENE_STRUCTURE](../graphics/SCENE_STRUCTURE.md) |
| T-102 | `Ground.js` — 120×120 m plane, placeholder texture, fog blend | M2 | — | 1 | TODO | [SCENE_STRUCTURE](../graphics/SCENE_STRUCTURE.md) §2 |
| T-103 | `Skybox.js` — placeholder day cubemap | M2 | — | 1 | TODO | [LIGHTING_STRATEGY](../graphics/LIGHTING_STRATEGY.md) §6 |
| T-104 | `LightingRig.js` v1 — Directional + Hemisphere + Spot + Point | M2 | — | 1 | TODO | [LIGHTING_STRATEGY](../graphics/LIGHTING_STRATEGY.md) §2 |
| T-105 | `CameraRig.js` with `FreeOrbit` mode | M2 | — | 1 | TODO | [CAMERA_SYSTEM](../graphics/CAMERA_SYSTEM.md) §2 |
| T-106 | `InputRouter.js` — pointer/keyboard/wheel normalization | M2 | — | 1 | TODO | [INPUT_SYSTEM](../interaction/INPUT_SYSTEM.md) |
| T-107 | `BoxHelper` ride-site markers + URL `?site=ferris` jump | M2 | — | 0.5 | TODO | [DEBUG_WORKFLOW](../workflow/DEBUG_WORKFLOW.md) |
| T-108 | M2 perf check (60 fps empty park, no shadows) | M2 | — | 0.5 | TODO | [PERFORMANCE_OPTIMIZATION](../graphics/PERFORMANCE_OPTIMIZATION.md) |
| **PHASE 2 — Ferris Wheel** | | | | | | |
| T-201 | `Ride.js` abstract base (state machine, `update`, `toggle`) | M3 | — | 1 | TODO | [TECHNICAL_ARCHITECTURE](TECHNICAL_ARCHITECTURE.md) §6.1 |
| T-202 | Hierarchical group assembly with primitives | M3 | — | 1.5 | TODO | [SCENE_STRUCTURE](../graphics/SCENE_STRUCTURE.md) §3.1 |
| T-203 | Procedural rotation + counter-rotation logic | M3 | — | 1 | TODO | [ANIMATION_SYSTEM](../interaction/ANIMATION_SYSTEM.md) §3.1 |
| T-204 | Passenger sway (`sin(t + i*π/4) * 0.08`) | M3 | — | 0.5 | TODO | [ANIMATION_SYSTEM](../interaction/ANIMATION_SYSTEM.md) §3.1 |
| T-205 | `ControlPanel.js` — shared mesh + raycast handshake | M3 | — | 1 | TODO | [INTERACTION_DESIGN](../interaction/INTERACTION_DESIGN.md) §3 |
| T-206 | tween.js speed-ramp on toggle | M3 | — | 0.5 | TODO | [ANIMATION_SYSTEM](../interaction/ANIMATION_SYSTEM.md) §4 |
| T-207 | Counter-rotation visual validation (record video, attach colored cube) | M3 | — | 0.5 | TODO | [TESTING_STRATEGY](../workflow/TESTING_STRATEGY.md) |
| **PHASE 2 — Carousel + Coaster** | | | | | | |
| T-301 | Carousel platform + horses parented + phase-offset sine bob | M4 | — | 1.5 | TODO | [ANIMATION_SYSTEM](../interaction/ANIMATION_SYSTEM.md) §3.2 |
| T-302 | Carousel control panel | M4 | — | 0.5 | TODO | [INTERACTION_DESIGN](../interaction/INTERACTION_DESIGN.md) §3 |
| T-303 | Roller-coaster Catmull-Rom curve authoring | M4 | — | 1.5 | TODO | [SCENE_STRUCTURE](../graphics/SCENE_STRUCTURE.md) §3.3 |
| T-304 | Rail `TubeGeometry` build + instanced posts | M4 | — | 1 | TODO | [SCENE_STRUCTURE](../graphics/SCENE_STRUCTURE.md) §3.3 |
| T-305 | Cart per-frame Frenet-frame transform | M4 | — | 1 | TODO | [ANIMATION_SYSTEM](../interaction/ANIMATION_SYSTEM.md) §3.3 |
| T-306 | Speed varies with track tangent.y (uphill slows) | M4 | — | 0.5 | TODO | [ANIMATION_SYSTEM](../interaction/ANIMATION_SYSTEM.md) §3.3 |
| T-307 | Coaster control panel | M4 | — | 0.5 | TODO | [INTERACTION_DESIGN](../interaction/INTERACTION_DESIGN.md) §3 |
| **PHASE 3 — Tagada + Interaction Polish** | | | | | | |
| T-401 | Tagada three-axis hierarchical group | M4 | — | 1 | TODO | [SCENE_STRUCTURE](../graphics/SCENE_STRUCTURE.md) §3.4 |
| T-402 | Layered sinusoid drivers (X + Z + fast Y) | M4 | — | 1 | TODO | [ANIMATION_SYSTEM](../interaction/ANIMATION_SYSTEM.md) §3.4 |
| T-403 | Damped-spring stop animation (semi-implicit Euler) | M4 | — | 1 | TODO | [ANIMATION_SYSTEM](../interaction/ANIMATION_SYSTEM.md) §5 |
| T-404 | Tagada control panel | M4 | — | 0.5 | TODO | [INTERACTION_DESIGN](../interaction/INTERACTION_DESIGN.md) §3 |
| T-405 | `ClickToFly` camera mode | M4 | — | 1 | TODO | [CAMERA_SYSTEM](../graphics/CAMERA_SYSTEM.md) §3 |
| T-406 | Wheel-scroll → ride speed multiplier with easing | M4 | — | 0.5 | TODO | [INTERACTION_DESIGN](../interaction/INTERACTION_DESIGN.md) §5 |
| T-407 | `GondolaCam` attach/detach with `G` and `Esc` | M4 | — | 1 | TODO | [CAMERA_SYSTEM](../graphics/CAMERA_SYSTEM.md) §4 |
| T-408 | Click on lamppost mesh toggles its `PointLight` | M4 | — | 0.5 | TODO | [INTERACTION_DESIGN](../interaction/INTERACTION_DESIGN.md) §4 |
| T-409 | lil-gui HUD: day-time slider, color picker, speed readouts, help | M4 | — | 1 | TODO | [UI_UX_PLAN](../interaction/UI_UX_PLAN.md) |
| **PHASE 4 — Materials + Day/Night** | | | | | | |
| T-501 | `MaterialLibrary.js` — named materials per [MATERIAL_SYSTEM](../graphics/MATERIAL_SYSTEM.md) | M5 | — | 1 | TODO | [MATERIAL_SYSTEM](../graphics/MATERIAL_SYSTEM.md) §3 |
| T-502 | Author/source textures per [TEXTURE_LIST](../assets/TEXTURE_LIST.md) | M5 | — | 3 | TODO | [TEXTURE_LIST](../assets/TEXTURE_LIST.md) |
| T-503 | Apply MRA-packed maps on rides/ground | M5 | — | 1 | TODO | [MATERIAL_SYSTEM](../graphics/MATERIAL_SYSTEM.md) §4 |
| T-504 | Anisotropic filtering on ground/asphalt | M5 | — | 0.5 | TODO | [MATERIAL_SYSTEM](../graphics/MATERIAL_SYSTEM.md) §6 |
| T-505 | `DayNight.js` sun orbit + ambient lerp + sky crossfade | M5 | — | 2 | TODO | [LIGHTING_STRATEGY](../graphics/LIGHTING_STRATEGY.md) §3 |
| T-506 | Lamp + ride-neon ignition threshold | M5 | — | 1 | TODO | [LIGHTING_STRATEGY](../graphics/LIGHTING_STRATEGY.md) §4 |
| T-507 | Emissive map on signs / windows | M5 | — | 0.5 | TODO | [MATERIAL_SYSTEM](../graphics/MATERIAL_SYSTEM.md) §5 |
| T-508 | Visual review red/green checklist | M5 | — | 0.5 | TODO | [TESTING_STRATEGY](../workflow/TESTING_STRATEGY.md) |
| **PHASE 5 — Post + Shadows + FPV + Perf** | | | | | | |
| T-601 | Enable shadow mapping on directional light | M6 | — | 1 | TODO | [LIGHTING_STRATEGY](../graphics/LIGHTING_STRATEGY.md) §5 |
| T-602 | Tighten shadow camera bounds, tune bias/normalBias | M6 | — | 1 | TODO | [LIGHTING_STRATEGY](../graphics/LIGHTING_STRATEGY.md) §5 |
| T-603 | `EffectComposer` pipeline | M6 | — | 1 | TODO | [POST_PROCESSING](../graphics/POST_PROCESSING.md) |
| T-604 | `UnrealBloomPass` + `OutputPass` ACES | M6 | — | 0.5 | TODO | [POST_PROCESSING](../graphics/POST_PROCESSING.md) §3 |
| T-605 | InstancedMesh for lamps/benches/fences | M6 | — | 1 | TODO | [PERFORMANCE_OPTIMIZATION](../graphics/PERFORMANCE_OPTIMIZATION.md) §4 |
| T-606 | Frustum culling check + draw-call audit (<200) | M6 | — | 1 | TODO | [PERFORMANCE_OPTIMIZATION](../graphics/PERFORMANCE_OPTIMIZATION.md) §5 |
| T-607 | Mobile fallback profile (`?mobile`) | M6 | — | 1 | TODO | [PERFORMANCE_OPTIMIZATION](../graphics/PERFORMANCE_OPTIMIZATION.md) §7 |
| T-608 | Perf script + baseline capture | M6 | — | 0.5 | TODO | [TESTING_STRATEGY](../workflow/TESTING_STRATEGY.md) §5 |
| T-609 | Custom neon ShaderMaterial (Lecture 06 hook) | M6 | — | 1 | TODO | [SHADER_PLAN](../graphics/SHADER_PLAN.md) §3 |
| T-610 | Easter-egg fragment-shader ray-tracer billboard (Lecture 15 hook) | M6 | — | 2 | TODO | [SHADER_PLAN](../graphics/SHADER_PLAN.md) §6 |
| **PHASE 6 — Polish + Report + Deploy** | | | | | | |
| T-701 | Final pass on every TODO comment | M7 | — | 1 | TODO | this doc |
| T-702 | `assets/CREDITS.md` | M7 | — | 0.5 | TODO | [ASSET_PIPELINE](../assets/ASSET_PIPELINE.md) |
| T-703 | Final report PDF | M7 | — | 4 | TODO | [FINAL_REPORT_OUTLINE](../deliverables/FINAL_REPORT_OUTLINE.md) |
| T-704 | Slide deck | M7 | — | 2 | TODO | [SLIDES_PLAN](../deliverables/SLIDES_PLAN.md) |
| T-705 | 90-second demo video | M7 | — | 1 | TODO | [DEMO_SCRIPT](../deliverables/DEMO_SCRIPT.md) |
| T-706 | Cross-browser final QA matrix | M7 | — | 1 | TODO | [TESTING_STRATEGY](../workflow/TESTING_STRATEGY.md) |
| T-707 | `git tag v1.0.0` + Pages cache invalidation | M7 | — | 0.5 | TODO | [GIT_WORKFLOW](../workflow/GIT_WORKFLOW.md) |
| T-708 | Submission email + Infostud registration | M7 | — | 0.5 | TODO | [PRESENTATION_STRATEGY](../evaluation/PRESENTATION_STRATEGY.md) |

## Stretch-goal Tasks (only after M6 sign-off)

| ID | Task | Owner | Est. | Status | Doc |
| --- | --- | --- | --- | --- | --- |
| S-01 | Sky cubemap crossfade with custom shader | — | 1 | TODO | [SHADER_PLAN](../graphics/SHADER_PLAN.md) §4 |
| S-02 | Audio: ambient loop + per-ride sound | — | 1.5 | TODO | [AUDIO_PLAN](../assets/AUDIO_PLAN.md) |
| S-03 | Fireworks particle system at night | — | 2 | TODO | [SHADER_PLAN](../graphics/SHADER_PLAN.md) §5 |
| S-04 | Cannon-es coupling for coaster cart | — | 2 | TODO | [RISK_ANALYSIS](../workflow/RISK_ANALYSIS.md) §3 R4 |
| S-05 | Cloth flag mass-spring | — | 2 | TODO | [ANIMATION_SYSTEM](../interaction/ANIMATION_SYSTEM.md) §6 |
| S-06 | Visitor walking improvements (flocking nuances) | — | 1 | TODO | [ANIMATION_SYSTEM](../interaction/ANIMATION_SYSTEM.md) §7 |

## Estimate Roll-Up

| Phase | Tasks | Estimate (half-days) | Est. hours @ 4 h |
| --- | --- | --- | --- |
| Phase 0 | 8 | 7 | 28 |
| Phase 1 | 8 | 7 | 28 |
| Phase 2 (Ferris) | 7 | 6 | 24 |
| Phase 2 (Carousel+Coaster) | 7 | 6.5 | 26 |
| Phase 3 | 9 | 7 | 28 |
| Phase 4 | 8 | 9 | 36 |
| Phase 5 | 10 | 11 | 44 |
| Phase 6 | 8 | 10.5 | 42 |
| **Total core** | **65** | **64** | **256** |
| Stretch (optional) | 6 | 9.5 | 38 |

256 hours / 8 weeks / 5 days = **6.4 hours per working day** — sustainable for a single full-time student. A two-person team has 50 % slack. A four-person team has 75 % slack and should attempt all stretch goals.

## Backlog Hygiene

- review at the start of each week
- archive DONE tasks below the table once a milestone is signed off
- never rewrite IDs; once issued, an ID is permanent
- regressions become new IDs (e.g. `T-201R1` for a re-open of T-201)
