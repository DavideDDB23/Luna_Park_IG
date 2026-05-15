# Luna Park 3D — Interactive Graphics Course Project

**Sapienza University of Rome — DIAG — Prof. Marco Schaerf — A.Y. 2025/26**

A real-time, browser-based 3D amusement park built on **WebGL via Three.js**, conceived as the final capstone for the Interactive Graphics course. The project showcases every required topic of the syllabus through a single coherent experience:

- four hierarchically-animated **rides** (Ferris Wheel, Carousel, Roller Coaster, Tagada Mechanical Arm),
- an explorable park with **click-to-fly navigation**, **3D in-world control panels**, and a **dynamic day/night cycle**,
- a complete **Phong/Blinn–Phong material pipeline** with multi-channel textures (color, normal, specular, roughness, emissive, alpha),
- a layered **lighting rig** mixing Directional, Point, Spot, Hemisphere, and emissive light sources,
- six categories of **user interaction** (raycasting, slider, scroll, keyboard, color picker, mode toggles),
- 100 % JavaScript-implemented animations (no imported animation clips), satisfying the strict requirement of the course.

---

## 1. Live Demo & Repository

| Item | URL |
| --- | --- |
| GitHub Pages (live) | Deployed automatically by `.github/workflows/pages.yml` on push to `main` |
| GitHub Classroom repository | _to be added after `classroom.github.com/a/FF_gLfB-` activation_ |
| Submission deadline target | **July 12, 2026 — 23:59 CEST** (alternate: June 20 or August 28) |

## 2. Documentation Map

All documentation lives under [`docs/`](docs/). Read in this order if you want to follow the planning narrative end-to-end. Read by area if you are looking for a specific concern.

### Core planning

- [PROJECT_OVERVIEW](docs/core/PROJECT_OVERVIEW.md) — what we are building and why, scope, non-goals, success criteria
- [TECHNICAL_ARCHITECTURE](docs/core/TECHNICAL_ARCHITECTURE.md) — module map, data flow, frame loop, scene graph contract
- [DEVELOPMENT_ROADMAP](docs/core/DEVELOPMENT_ROADMAP.md) — eight-week plan, ordered phases, dependency graph
- [MILESTONES](docs/core/MILESTONES.md) — six checkpoints with concrete acceptance criteria
- [TASK_TRACKER](docs/core/TASK_TRACKER.md) — granular task list with status, owner, estimate
- [COURSE_TOPICS_MAPPING](docs/core/COURSE_TOPICS_MAPPING.md) — lecture-by-lecture mapping to demonstrate mastery

### Graphics & rendering

- [RENDERING_PIPELINE](docs/graphics/RENDERING_PIPELINE.md) — render passes, frame breakdown, GPU pipeline mapping
- [SCENE_STRUCTURE](docs/graphics/SCENE_STRUCTURE.md) — scene graph definition, hierarchical model trees
- [LIGHTING_STRATEGY](docs/graphics/LIGHTING_STRATEGY.md) — six light types, day/night logic, shadow plan
- [MATERIAL_SYSTEM](docs/graphics/MATERIAL_SYSTEM.md) — BRDF choice, material library, naming, parameters
- [SHADER_PLAN](docs/graphics/SHADER_PLAN.md) — built-in vs custom shaders, planned ShaderMaterials, uniforms
- [CAMERA_SYSTEM](docs/graphics/CAMERA_SYSTEM.md) — projection, free orbit, click-to-fly, FPV gondola, transitions
- [POST_PROCESSING](docs/graphics/POST_PROCESSING.md) — bloom, tone-mapping, color grading, optional FXAA
- [PERFORMANCE_OPTIMIZATION](docs/graphics/PERFORMANCE_OPTIMIZATION.md) — frame budget, LODs, instancing, draw-call plan

### Interaction & gameplay

- [INTERACTION_DESIGN](docs/interaction/INTERACTION_DESIGN.md) — every interaction, trigger, feedback, edge cases
- [INPUT_SYSTEM](docs/interaction/INPUT_SYSTEM.md) — pointer / keyboard / wheel / touch routing and conflict rules
- [UI_UX_PLAN](docs/interaction/UI_UX_PLAN.md) — HUD, time-of-day slider, color picker, help overlay
- [ANIMATION_SYSTEM](docs/interaction/ANIMATION_SYSTEM.md) — clock, easing, tween.js patterns, procedural drivers
- [STATE_MANAGEMENT](docs/interaction/STATE_MANAGEMENT.md) — global app state, ride state machines, camera modes

### Assets

- [ASSET_PIPELINE](docs/assets/ASSET_PIPELINE.md) — modeling sources, export, GLTF conventions, atlas plan
- [MODEL_LIST](docs/assets/MODEL_LIST.md) — every 3D asset with source / polycount / topology / texture spec
- [SOURCED_MODELS](docs/assets/SOURCED_MODELS.md) — concrete Sketchfab / Kenney / Quaternius URLs picked per asset
- [TEXTURE_LIST](docs/assets/TEXTURE_LIST.md) — every texture map with resolution, channel, filtering
- [AUDIO_PLAN](docs/assets/AUDIO_PLAN.md) — ambient + per-ride sound design (optional, low-priority)

### Workflow & quality

- [GIT_WORKFLOW](docs/workflow/GIT_WORKFLOW.md) — branching, commit conventions, PR template, release tags
- [DEBUG_WORKFLOW](docs/workflow/DEBUG_WORKFLOW.md) — stat overlay, axes helpers, frame inspector, repro checklist
- [TESTING_STRATEGY](docs/workflow/TESTING_STRATEGY.md) — visual regressions, perf gates, manual QA matrix
- [RISK_ANALYSIS](docs/workflow/RISK_ANALYSIS.md) — top risks, probability, impact, mitigations, fallbacks

### Evaluation & delivery

- [EVALUATION_STRATEGY](docs/evaluation/EVALUATION_STRATEGY.md) — what professors evaluate and how we maximize each axis
- [PRESENTATION_STRATEGY](docs/evaluation/PRESENTATION_STRATEGY.md) — narrative, demo flow, defensive answers
- [FINAL_REPORT_OUTLINE](docs/deliverables/FINAL_REPORT_OUTLINE.md) — the 10–15-page PDF report structure
- [SLIDES_PLAN](docs/deliverables/SLIDES_PLAN.md) — 12-slide oral presentation deck
- [DEMO_SCRIPT](docs/deliverables/DEMO_SCRIPT.md) — minute-by-minute live demo script

## 3. How to Use This Documentation Set

This package is intentionally written as a **specification, not implementation**. The intent is:

1. A human author can follow the plan and produce a coherent, high-grade project.
2. **Claude Code** (or any other code-generation assistant) can ingest these files **incrementally** — one milestone at a time — and produce the actual source code without re-deriving the architecture. Each `.md` file is self-contained enough to scope a single code-generation session and links to the documents it depends on.

To bootstrap a generation session, point the assistant at:
- the relevant milestone in [MILESTONES](docs/core/MILESTONES.md),
- the architectural anchor in [TECHNICAL_ARCHITECTURE](docs/core/TECHNICAL_ARCHITECTURE.md),
- and the topic-specific doc(s) for that milestone.

## 4. Quick Facts

- **Engine:** Three.js (r160+), pure ES modules, no bundler required (importmap + Vite optional).
- **Animation library:** tween.js (suggested by Prof. Schaerf in the requirements deck).
- **Physics:** none required; optional Cannon-es for roller-coaster cart contact (fallback: pure kinematic curve following).
- **Targets:** 60 fps on a 2020+ laptop integrated GPU; 30 fps minimum on mid-range mobile (graceful quality scaling).
- **Browser baseline:** evergreen Chrome / Firefox / Edge / Safari with WebGL 2 support.
- **Hosting:** GitHub Pages, mandatory per project requirements (Project_Requirements.pdf, page 7).

## 5. Compliance Checklist (Project_Requirements.pdf)

| Requirement | Where addressed |
| --- | --- |
| Hierarchical models, ≥ 1 complex | [SCENE_STRUCTURE](docs/graphics/SCENE_STRUCTURE.md), every ride |
| Lights of multiple kinds | [LIGHTING_STRATEGY](docs/graphics/LIGHTING_STRATEGY.md) |
| Textures of multiple kinds | [TEXTURE_LIST](docs/assets/TEXTURE_LIST.md) |
| User interaction | [INTERACTION_DESIGN](docs/interaction/INTERACTION_DESIGN.md) |
| Animations implemented in JS, **no imported clips** | [ANIMATION_SYSTEM](docs/interaction/ANIMATION_SYSTEM.md) |
| GitHub Classroom repo with libraries vendored | [GIT_WORKFLOW](docs/workflow/GIT_WORKFLOW.md) |
| GitHub Pages live build | [GIT_WORKFLOW](docs/workflow/GIT_WORKFLOW.md) |
| Accompanying 5–10 page document | [FINAL_REPORT_OUTLINE](docs/deliverables/FINAL_REPORT_OUTLINE.md) |

---

## 6. Implementation Status

| Milestone | Tag | Status |
|-----------|-----|--------|
| M1 — Bootstrap | `m1` | ✅ Done |
| M2 — Empty park | `m2` | ✅ Done |
| M3 — Ferris Wheel | `m3` | ✅ Done |
| M4 — All rides + camera + HUD | `m4` | ✅ Done |
| M5 — Materials + day/night | `m5` | ✅ Done |
| M6 — Post-processing + instancing | `m6` | ✅ Done |
| M7 — Shippable | `v1.0.0` | ⬜ Report/slides/video pending |

## 7. Running Locally

```bash
# No build step required — pure ES modules with importmap
python3 -m http.server 8080
# Open http://localhost:8080
```

URL parameters:
- `?debug=1` — axes helper, scene-graph dump (T key), debug EventBus
- `?fast` — skip EffectComposer bloom (higher FPS)
- `?mobile` — 30fps target, no bloom
- `?site=ferrisWheel` — start camera at that ride site

_Last updated: 2026-05-15._
