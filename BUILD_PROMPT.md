# Build Prompt for Claude Code

> Paste the entire content of section **PROMPT** below into a fresh Claude Code session, with the working directory set to this repo (`luna-park-3d/`). Claude Code will read it once, then drive the entire build milestone by milestone.

---

## PROMPT

You are an expert Three.js / WebGL engineer. You are going to implement a complete real-time interactive 3D project named **Luna Park 3D** based on the production-grade planning package already present in this repository under `docs/`. The plan was produced ahead of time; your job is to **execute it incrementally, milestone by milestone**.

### 0. Read these first (in this order)

1. `README.md` — project overview and doc map.
2. `docs/core/PROJECT_OVERVIEW.md` — what we are building.
3. `docs/core/TECHNICAL_ARCHITECTURE.md` — module map, file layout, frame loop, public APIs. **Treat this as authoritative.**
4. `docs/core/MILESTONES.md` — the gated checkpoints M1 → M7.
5. `docs/core/DEVELOPMENT_ROADMAP.md` — phase ordering.
6. `docs/core/TASK_TRACKER.md` — granular task list with doc references.

Skim these. Do not implement anything yet.

### 1. Hard constraints (non-negotiable)

- **NO IMPORTED ANIMATIONS.** Every `.glb` we load must have zero animation tracks. Every animation in the project is implemented in JavaScript. This is the course's strictest rule (`Project_Requirements.pdf`, page 3) and we audit it with a script.
- **No extra libraries beyond those approved in `TECHNICAL_ARCHITECTURE.md` §1.2** (Three.js, tween.js, lil-gui, stats.js, optionally cannon-es). All libraries are **vendored** under `vendor/`, not loaded from CDN.
- **No build step.** Production runs from GitHub Pages via ES module imports + an import map in `index.html`. (Optional dev-time Vite is fine for hot reload; production output stays no-bundle.)
- **Three.js scene-graph parent-child relationships are how we model hierarchical animation.** Counter-rotation = `gondola.rotation.y = -ring.rotation.y` (absolute, not accumulated).
- **Color space discipline** per `docs/graphics/RENDERING_PIPELINE.md` §10 and `docs/graphics/MATERIAL_SYSTEM.md` §4. Misconfiguring this is the #1 cause of "scene looks wrong".

### 2. Working protocol

For each milestone M1 → M7:

**a. Plan the milestone.**
- Open `docs/core/MILESTONES.md` and read the milestone's acceptance checklist.
- Open `docs/core/TASK_TRACKER.md` and read the task rows for that milestone (e.g., M3 rows = T-201..T-207).
- Use the `TodoWrite` tool to create a todo for each task row.
- For each task, also read the **doc referenced in its row** before implementing. Example: T-203 references `docs/interaction/ANIMATION_SYSTEM.md §3.1` — read that section first.

**b. Implement the milestone.**
- Work task by task. Mark each in_progress when starting, completed when done.
- Follow `docs/core/TECHNICAL_ARCHITECTURE.md` for file paths, naming, and module boundaries.
- Keep commits small (~one task per commit) and use Conventional Commits per `docs/workflow/GIT_WORKFLOW.md` §4.
- Use placeholder geometry first (per `docs/core/DEVELOPMENT_ROADMAP.md` §4 "scaffold first, art last"). Real models swap in during Phase 4 (M5).

**c. Verify the milestone.**
- Walk down the acceptance checklist line by line.
- If a checklist item fails, **fix it before continuing** — milestones are gates.
- If the milestone touches assets, run `tools/audit-glb.js` to confirm zero animation channels in any `.glb`.
- Take an exit-artifact screenshot.
- Tag the milestone (`git tag mN`).

**d. Stop and report.**
- Output a short summary: what was implemented, what passed the checklist, any deviations from the docs.
- Wait for the user to say "continue" before starting the next milestone.

### 3. Doc-reading discipline

You do **not** need to read every doc at the start. Read on demand:

| You are working on… | Read first |
| --- | --- |
| Setting up the renderer/scene/loop | `docs/core/TECHNICAL_ARCHITECTURE.md`, `docs/graphics/RENDERING_PIPELINE.md` |
| Implementing a ride | `docs/graphics/SCENE_STRUCTURE.md` (relevant ride), `docs/interaction/ANIMATION_SYSTEM.md` (relevant subsection) |
| Adding a control panel | `docs/interaction/INTERACTION_DESIGN.md` §3, `docs/interaction/STATE_MANAGEMENT.md` §4 |
| Lights / shadows / day-night | `docs/graphics/LIGHTING_STRATEGY.md` |
| Materials / textures | `docs/graphics/MATERIAL_SYSTEM.md`, `docs/assets/TEXTURE_LIST.md` |
| Custom shader | `docs/graphics/SHADER_PLAN.md` |
| Cameras (orbit / fly / FPV) | `docs/graphics/CAMERA_SYSTEM.md` |
| HUD / lil-gui | `docs/interaction/UI_UX_PLAN.md` |
| Input router | `docs/interaction/INPUT_SYSTEM.md` |
| Picking 3D models from the web | `docs/assets/SOURCED_MODELS.md` |
| Bug or perf issue | `docs/workflow/DEBUG_WORKFLOW.md`, `docs/graphics/PERFORMANCE_OPTIMIZATION.md` |

### 4. When the docs are ambiguous

If a doc gives you two options, **default to the doc's recommended choice**. If a doc disagrees with itself or is silent on a detail, ask the user. Never invent architecture — extend it deliberately and update the relevant doc in the same commit.

### 5. Asset sourcing

When a milestone needs a downloaded model:
1. Open `docs/assets/SOURCED_MODELS.md` and use the listed URL.
2. Download to `assets/models/<family>/<name>.glb`.
3. If the asset has animation tracks, open it in Blender → delete all actions → re-export.
4. Add an entry to `assets/CREDITS.md` (source, author, license, modifications).
5. Run `tools/audit-glb.js`. If it fails, the model isn't ready.

If a URL is dead, search Sketchfab / Kenney / Quaternius for an equivalent CC0 or CC-BY asset, update `SOURCED_MODELS.md` in the same commit.

### 6. Folder layout you will create

Already specified in `docs/core/TECHNICAL_ARCHITECTURE.md` §2. Recreate it exactly:

```
luna-park-3d/
├── index.html                ← import map + canvas + HUD root
├── style.css
├── .nojekyll                 ← required for GitHub Pages
├── .gitignore
├── LICENSE
├── src/                      ← all ES modules, no bundler
│   ├── main.js
│   ├── config.js
│   ├── core/                 (App, Loop, Clock, AssetLoader, EventBus, ResourceCache)
│   ├── scene/                (SceneRoot, Ground, Skybox, Lampposts, Stands, Visitors)
│   ├── rides/                (Ride base, FerrisWheel, Carousel, RollerCoaster, Tagada, ControlPanel)
│   ├── camera/               (CameraRig, FreeOrbit, ClickToFly, GondolaCam)
│   ├── lighting/             (LightingRig, DayNight, Flicker)
│   ├── interaction/          (InputRouter, Raycaster, HUD, KeyMap)
│   ├── materials/            (MaterialLibrary + shaders/)
│   ├── post/                 (Composer, Bloom)
│   ├── animation/            (TweenRegistry, Easing, ProceduralRigs)
│   └── utils/                (math, debug, url, disposers)
├── assets/
│   ├── models/
│   ├── textures/
│   ├── cubemaps/
│   ├── icons/
│   └── CREDITS.md
├── vendor/
├── tools/                    (pack-mra.js, audit-glb.js, etc.)
└── report/                   (final report PDF lives here at M7)
```

### 7. First step

Begin with **Milestone M1** ("Hello, Park"). Read `docs/core/MILESTONES.md` M1 section, create the todo list, then:

1. Set up the repository skeleton above (without writing any feature code).
2. Vendor Three.js, tween.js, lil-gui, stats.js under `vendor/`.
3. Write `index.html` with the import map and an empty `<canvas>` + minimal HUD root.
4. Write `src/main.js` that boots a Three.js scene with one rotating placeholder cube.
5. Write `src/core/App.js`, `Loop.js`, `Clock.js`, `EventBus.js` as skeletons.
6. Wire `?debug=1` → Stats.js overlay (via `src/utils/url.js`).
7. Add `.nojekyll`, `.gitignore`, `LICENSE`.
8. Verify it loads with no console errors. Smoke-test on Chrome, Firefox, Safari (or as many as available).
9. Take a screenshot to `screenshots/m1_hello_park.png`.
10. Commit with messages following Conventional Commits.
11. Tag `git tag m1`.
12. Stop. Print a summary. Wait for "continue".

You may now begin. Confirm you have read sections 0 through 6 above by listing them back in one line, then start executing section 7.

---

## How to use this prompt with Claude Code

1. Open a terminal in this repo's directory:
   ```
   cd "/Users/davide/Desktop/Interactive Graphics/luna-park-3d"
   ```
2. Start Claude Code:
   ```
   claude
   ```
3. Paste the **entire** PROMPT section above (between the two horizontal rules) into the conversation.
4. Claude Code will boot M1, ask you to confirm before tagging, then await `continue` to advance to M2.

## Mid-build commands you can type

- `continue` — advance to the next milestone after sign-off.
- `read docs/graphics/SHADER_PLAN.md and tell me what shaders we plan` — sanity check.
- `summarize what's left for M4` — quick status.
- `re-run the audit script` — manually trigger `tools/audit-glb.js`.
- `descope per RISK_ANALYSIS R9 step 1` — drop Tagada (the documented first descope).
- `we are out of time for M6 stretches — skip the Easter-egg shader and proceed to M7` — graceful descope.

## What to expect

- Each milestone takes Claude Code one focused conversation segment.
- M1 finishes in minutes; M3 (Ferris wheel) takes ~1 hour; M5 (materials + day/night) is the heaviest.
- Claude Code will sometimes ask you to verify a screenshot or run a perf test — answer briefly and let it continue.
- If Claude Code proposes a deviation from the docs, it should also propose a doc edit. If it doesn't, ask for one before approving.

## Bail-out commands

- `pause` — stop work, take stock.
- `revert the last commit` — Claude Code can do this; review carefully first.
- `read the doc for this concept and try again` — sends it back to the planning package for the right approach.
