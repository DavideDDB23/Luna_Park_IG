# RISK ANALYSIS

> Companion to: [DEVELOPMENT_ROADMAP](../core/DEVELOPMENT_ROADMAP.md) · [MILESTONES](../core/MILESTONES.md) · [TESTING_STRATEGY](TESTING_STRATEGY.md)

## 1. Risk Register

Probability × Impact = Risk score (1–5 each, multiplied 1–25). All risks ≥ 9 demand a documented mitigation.

| ID | Risk | Prob | Imp | Score | Trigger | Mitigation | Fallback |
| --- | --- | --- | --- | --- | --- | --- | --- |
| R1 | Scene exceeds frame budget | 4 | 5 | 20 | M5/M6 FPS drops < 50 | aggressive instancing, draw-call audit, LOD policy, perf snapshots from M2 | Disable bloom on `?fast`, shrink shadow map, drop visitor count |
| R2 | Roller-coaster Frenet frame flickers / inverts | 3 | 4 | 12 | cart wobbles, normal flips at peaks | precompute Frenet with `closed=true`, sample density 300 | replace inversion with smooth banking using a manually-authored up vector |
| R3 | Counter-rotation drifts visually | 2 | 4 | 8 | gondola tilts after long run | use absolute assignment `gondola.rotation.y = -ring.rotation.y`, never accumulate | none needed if discipline holds |
| R4 | Cannon-es integration too slow | 3 | 2 | 6 | physics step >5 ms on baseline | gate behind `?physics=1`; only run when needed for demo | drop Cannon-es; pure kinematic coaster |
| R5 | Day/night transition pops (env map snap) | 4 | 3 | 12 | visible env map "jump" at midnight | swap PMREMs at lowest sun intensity, document if minor | custom dual-environment shader in `onBeforeCompile` |
| R6 | A custom shader fails to compile on Safari | 3 | 3 | 9 | Safari renders nothing for that material | feature-detect at boot; vendor prefix; precision qualifier | Three.js built-in material fallback |
| R7 | Imported model contains an animation track | 2 | 5 | 10 | tools/audit-glb.js fails | strict pre-commit audit | strip via `gltf-transform` before commit |
| R8 | License of a downloaded asset is unclear | 3 | 5 | 15 | CC0 source loses provenance, or asset is CC-BY-NC | only download from CC0-confirmed sources; record in CREDITS.md at acquisition | re-source from PolyHaven / Kenney / Quaternius |
| R9 | One-person team can't complete in 8 weeks | 3 | 5 | 15 | M4 misses date by > 3 days | drop Tagada, simplify visitors, drop FPV gondola | one-ride descoping ladder in §3 |
| R10 | GitHub Pages misconfigured at deadline | 2 | 5 | 10 | Pages URL 404 the day before submission | Pages enabled at M1, smoke test at every milestone | local zipped fallback; send Prof. Schaerf the zip on submission |
| R11 | Browser auto-update breaks something close to deadline | 1 | 4 | 4 | Chrome 134 breaks our shader | smoke test 1 day before submission | submit a screenshot/video while team patches |
| R12 | Free-orbit camera enters the ground | 2 | 2 | 4 | camera y < 0 visible from below | OrbitControls `minPolarAngle` clamp | additional clamp in `CameraRig.update` |
| R13 | Shadow acne never tunes cleanly | 2 | 3 | 6 | bias=0 has acne, bias=-0.001 has peter-panning | step bias 1e-4 at a time at M3 | accept slight peter-panning; documented |
| R14 | Time of day slider stutters at extreme speeds | 1 | 2 | 2 | rapid slider drag causes light pop | clamp speed of slider-driven time changes; smooth via tween | refresh-only |
| R15 | Mobile Safari memory pressure crashes the tab | 3 | 4 | 12 | iOS Safari "A problem occurred" page | `?mobile` profile keeps memory under 200 MB | swap to 1024² textures, drop env cubemap |
| R16 | Coaster cart appears to leave the track at high speeds | 2 | 3 | 6 | curve sampled too coarsely | sample `getPointAt` at high frequency, precompute frames | reduce max speed multiplier |
| R17 | Visitor pathing produces visible "stuck" agents | 2 | 1 | 2 | one visitor frozen at a waypoint | waypoint timeout: pick a different neighbor | shuffle waypoint graph |
| R18 | Final report PDF doesn't compile (LaTeX) | 2 | 4 | 8 | day-before deadline LaTeX error | write report in Markdown + pandoc with a stable preamble | export from a Google Doc, format-tweak, submit |
| R19 | Submission email gets caught in spam | 1 | 4 | 4 | Prof. doesn't see email | use university account; attach as backup; also confirm Pages URL works | follow-up with private message via classroom |
| R20 | Team member leaves the project mid-build | 1 | 5 | 5 | a key contributor disappears | docs are self-contained — anyone can resume | descope per §3 |

## 2. Top Risks (score ≥ 12), with Detail

### R1 — Frame budget overrun

The most likely failure mode. Symptoms appear at M5 (materials added) and M6 (shadows + post). Mitigations are layered:

1. measure early: perf snapshots from M2 (empty park) onward
2. instance any mesh with ≥ 4 copies
3. cap shadow map at 4096 on discrete GPUs, 2048 on integrated, 1024 on mobile
4. early discrimination: `?fast` flag exists from M1 so we can A/B at any time
5. triage matrix in [PERFORMANCE_OPTIMIZATION](../graphics/PERFORMANCE_OPTIMIZATION.md) §10 lists ordered cost reductions

### R5 — Day/night env map snap

Three.js doesn't natively crossfade PMREMs. Two paths:

- accept a snap at `timeOfDay = 0.0` (deepest night, env contribution lowest) — visually OK
- write a `onBeforeCompile` patch that crossfades two env maps in the standard shader (1 day of work)

We default to the first; we upgrade if the snap is visible at M5 review.

### R8 — Asset license uncertainty

Strict process: only download from CC0-confirmed sources. Record in `CREDITS.md` immediately after download with the source URL and license string. The M7 review fails if a row is incomplete.

### R9 — Solo team scope overrun

Descope ladder (in priority of cuts):

1. **Drop the Tagada arm.** It's the lowest-priority ride animation-wise — three nested rotations are educationally redundant with the Ferris wheel and carousel. Save ~3 days.
2. **Drop visitor flocking** (keep waypoint walks). Save ~0.5 day.
3. **Drop the RT-demo Easter egg shader.** Save ~1 day; lose a Lecture-15 hook.
4. **Drop FPV gondola camera.** Save ~1 day; lose a strong interaction.
5. **Single skybox (no crossfade).** Save ~0.5 day; lose visual polish.

Cuts are applied **in order**; the rebudget is logged in the task tracker.

### R15 — Mobile Safari OOM

We've seen Three.js scenes crash iOS Safari at ~250 MB of GPU memory. We pre-budget at 200 MB (PERFORMANCE_OPTIMIZATION §8). On `?mobile`, env cubemaps are dropped entirely (uses hemisphere only), saving ~96 MB. The path is tested at M5.

## 3. Top-of-Mind During Each Week

- W1: ensure Pages works end-to-end (R10)
- W2: confirm baseline 60 fps in an empty park (R1)
- W3: lock counter-rotation absolute (R3)
- W4: tune Frenet frame robustness (R2), audit GLB animations (R7), audit licenses (R8)
- W5: tune shadow bias (R13)
- W6: perf snapshot post-materials (R1), check env map snap (R5)
- W7: cross-browser shader compile (R6), mobile perf (R15)
- W8: deploy smoke test (R10, R11, R19)

## 4. Continuous Risk Practices

- Each milestone gate re-asks "which risks moved up or down?" and updates the register.
- Each PR description states whether it raises or lowers any risk (a free-text line).
- The bug diary (DEBUG_WORKFLOW §11) feeds the risk register monthly — bugs that recur become risks.

## 5. Decision Log (anticipated)

Reserved for the team's actual decisions captured here as they happen. Sample entry:

```
2026-06-08 — env map snap at midnight visible; chose to keep snap and document, vs implementing dual-env shader
- impact: small visual artifact
- alternative: 1 day of shader work
- chose: keep snap (R5)
```
