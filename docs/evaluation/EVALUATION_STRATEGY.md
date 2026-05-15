# EVALUATION STRATEGY

> Companion to: [COURSE_TOPICS_MAPPING](../core/COURSE_TOPICS_MAPPING.md) · [PRESENTATION_STRATEGY](PRESENTATION_STRATEGY.md) · [FINAL_REPORT_OUTLINE](../deliverables/FINAL_REPORT_OUTLINE.md)

> Goal: **maximize the grade** (Sapienza scale 18–30 with possible 30L cum laude). This doc enumerates what evaluators look for in Interactive Graphics projects, what the team has already optimized for, and what to do during the oral defense.

## 1. What Professors Evaluate in Interactive Graphics Projects

Inferred from `Project_Requirements.pdf` (technical correctness, completeness, documentation) and from generally well-known practice in courses of this kind at top universities, the evaluator looks for:

### 1.1 Hard requirements (gate — if missing, the grade is capped)

| Requirement | Where we ship it |
| --- | --- |
| Hierarchical models with ≥ 1 complex model | Ferris wheel (counter-rotated gondolas), 4 total rides — [SCENE_STRUCTURE](../graphics/SCENE_STRUCTURE.md) |
| Lights of multiple kinds | 5 kinds: Directional, Point, Spot, Hemisphere, Emissive — [LIGHTING_STRATEGY](../graphics/LIGHTING_STRATEGY.md) |
| Textures of multiple kinds | color, normal, specular, roughness, metalness, AO, emissive, alpha — [TEXTURE_LIST](../assets/TEXTURE_LIST.md) |
| User interaction | 6 categorically distinct interactions — [INTERACTION_DESIGN](../interaction/INTERACTION_DESIGN.md) |
| JS-only animations (no imported clips) | every animation in `Ride.update()` is procedural; audit script enforces no imported clips — [ANIMATION_SYSTEM](../interaction/ANIMATION_SYSTEM.md), [GIT_WORKFLOW](../workflow/GIT_WORKFLOW.md) |
| GitHub Classroom + Pages | M1 deliverable — [GIT_WORKFLOW](../workflow/GIT_WORKFLOW.md) |
| Accompanying 5–10-page document | 10–15-page report — [FINAL_REPORT_OUTLINE](../deliverables/FINAL_REPORT_OUTLINE.md) |

### 1.2 Soft criteria (where points are won)

1. **Scope coverage** — touching as many lecture topics as possible. We map every lecture in [COURSE_TOPICS_MAPPING](../core/COURSE_TOPICS_MAPPING.md).
2. **Technical depth** — non-trivial uses of the API (custom shaders, instancing, post-processing, shadow tuning). Every one of these is documented.
3. **Visual polish** — does it look like a finished product? We pursue: day/night cycle, bloom, ACES tonemap, careful color, anti-aliasing.
4. **Performance** — 60 fps means we respect the user's hardware. We hold a frame budget — [PERFORMANCE_OPTIMIZATION](../graphics/PERFORMANCE_OPTIMIZATION.md).
5. **Interaction richness** — every interaction is intuitive and rewarding. Six interactions, six different control modalities.
6. **Documentation quality** — the report's clarity. A 5-page sloppy report scores worse than a 7-page disciplined one.
7. **Defensibility** — can the team explain every choice? The oral defense matters; see [PRESENTATION_STRATEGY](PRESENTATION_STRATEGY.md).
8. **Originality** — the theme is unique (a *theme* park rather than a single scene), and the 3D-control-panel UX is rare.

## 2. Common Mistakes to Avoid

| Mistake | Severity | How we avoid it |
| --- | --- | --- |
| Importing animations from GLTF | **critical, instant grade hit** | `audit-glb.js` rejects any `.glb` with animation tracks at commit time |
| Single static light | major | five light types, dynamic day/night cycle |
| One-channel-textures only (color) | major | every material binds 3+ channels |
| Black or washed-out colors | major (looks unfinished) | strict color-space discipline — [MATERIAL_SYSTEM](../graphics/MATERIAL_SYSTEM.md) §4 |
| Shadow acne or peter-panning | minor (but visible) | M3 bias tuning protocol — [LIGHTING_STRATEGY](../graphics/LIGHTING_STRATEGY.md) §5.2 |
| Frame rate drops during demo | major | perf budget enforced from M2 |
| Demo crashes during oral | **critical** | rehearse demo 10× before submission; backup laptop ready |
| HUD doesn't work on phone | minor | mobile fallback profile + responsive HUD — [UI_UX_PLAN](../interaction/UI_UX_PLAN.md) §6 |
| Missing GitHub Pages link | major | M1 has the Pages live before any other work |
| Forgotten LICENSE / CREDITS files | minor | M7 checklist enforces them |
| Report under 5 pages or unreadable | major | 10–15-page outline already drafted |
| No discussion of WHY each choice was made | minor (but loses points) | every chapter of report ends in a "decisions" subsection |
| Imported model with hidden animation | **critical** | strip in Blender; audit script catches |
| Reading from slides during oral | minor | rehearsed talking points, eyes on the demo |

## 3. How to Maximize Grading Criteria

### 3.1 Hierarchical models (Lecture 05)

The grader will ask "show me a hierarchical animation". We anticipate by:
- demoing the Ferris wheel counter-rotation as the **first** technical highlight,
- offering to print the scene graph live (`T` key in debug mode),
- naming the construction "parent-child" explicitly in the oral.

### 3.2 Lights and textures

We can confidently say in the oral:
- "Five light types: Directional, Point, Spot, Hemisphere, plus IBL via cubemap."
- "Every material uses three or more texture channels — color, normal, plus either specular (Phong) or metalness+roughness (PBR)."
- "Normal maps are loaded as `NoColorSpace`; albedo as `SRGBColorSpace` — the typical wrong-color bug is avoided."

### 3.3 Animations

Talking points:
- "Every animation is JavaScript. No clip is loaded from any model."
- "Four animation paradigms: rotation, phase-offset sinusoid, parametric curve following with Frenet frame, compound multi-axis sinusoid. Plus a damped-spring stop for one ride."
- "Easing on every transition — tween.js as the professor suggested."

### 3.4 Interaction

- "Six interactions: click-to-fly, in-world 3D control panels, time-of-day slider, FPV gondola, scroll-wheel speed, lamp toggle + color picker."
- "Notably: the control panels are **objects in the scene**, picked by raycast — the same raycast pipeline that Lecture 15 describes."

### 3.5 Performance

- "60 fps target; perf budget allocated per pass; perf snapshots committed at each milestone."
- "Mobile fallback profile via `?mobile` URL flag — 30 fps on a 2022 mid-range Android."

### 3.6 Documentation

The 10–15-page report is the **scorecard** the grader takes home. We:
- structure it to mirror the lecture sequence (their mental model),
- include figures (screenshots, scene-graph dump, shadow bias comparison),
- include a "decisions and trade-offs" subsection per chapter,
- include a development log appendix that demonstrates discipline.

## 4. Surface-Area Strategy

Rather than going extremely deep into one topic, we go **broad and competent**: we touch every lecture (see [COURSE_TOPICS_MAPPING](../core/COURSE_TOPICS_MAPPING.md)). The reasoning:

- The grader is checking a curriculum, not benchmarking against one specific topic.
- Each lecture has one or two killer slides. We have one or two killer demonstrations of each.
- A 30 in this course rewards the student who can wave at every slide and say "we did this" — not the student who optimized one shader for a week.

## 5. The Wow Factor

These project elements consistently earn additional credit and good memory in evaluators:

| Element | Why it wows |
| --- | --- |
| Counter-rotated gondolas | Pure scene-graph elegance; immediately recognizable as Lecture-05 material |
| Day/night cycle | Continuous visual story; demonstrates dynamic lighting and time-of-day shading |
| 3D in-world control panels | Diegetic UX is rare in student projects; demonstrates raycasting against arbitrary meshes |
| FPV gondola camera | Most projects have one camera mode; we have three with smooth transitions |
| Easter-egg ray-tracer shader | An extra Lecture-15 hook on a shader the team wrote by hand |
| Live perf overlay (toggled) | Shows the team thought about performance, not just visuals |
| Polished HUD | A complete-product feel rather than a "demo" feel |

## 6. The Defensive Side: Be Ready for "Gotcha" Questions

Anticipated questions and rehearsed one-line answers:

| Question | Answer |
| --- | --- |
| "Are these animations imported?" | "No. Every animation is JS. We audited every `.glb` — zero animation channels." |
| "What's the difference between Phong and Blinn–Phong?" | "Phong uses the reflection vector; Blinn–Phong uses the half-vector. Three.js's MeshPhongMaterial is actually Blinn–Phong — half-vector — we mention it in the report." |
| "Why MeshStandardMaterial here but MeshPhongMaterial there?" | "PBR (Standard) for metal and varnished surfaces where energy conservation matters; Phong for the cartoon horses where stylization matters." |
| "Show me how the gondola stays upright." | "It's a child of the rotating ring. The gondola's local rotation is the inverse of the ring's. We assign it absolutely each frame, not incrementally — that prevents float drift." |
| "What's a normal matrix?" | "The inverse-transpose of the model-view matrix. Three.js computes it automatically. Without it, normals are wrong under non-uniform scaling — Lecture 12." |
| "What's the bias value, and why?" | "Shadow bias = -0.0005, normalBias = 0.05. Below that, shadow acne; above, peter-panning. Tuned at M3 — see report figure 7." |
| "What's a Frenet frame?" | "An orthonormal frame at each point of a curve: tangent, normal, binormal. We use it to orient the roller-coaster cart so it banks naturally." |
| "Why no path tracing?" | "Real-time. We rasterize. We do reference Lecture 15 in our Easter-egg shader, which is a fragment-shader ray tracer for two spheres — iterative, since WebGL has no recursion." |
| "Why these textures?" | "Color, normal, specular or MRA per material. The choice is justified per material in `MATERIAL_SYSTEM.md`." |
| "Performance numbers?" | "60 fps median on baseline laptop; mobile 30 fps with fallback. Frame budget in section 6 of the report." |

## 7. The "Tell, Don't Show" Anti-Pattern

A common student failure: walking the grader through the codebase line by line. We avoid this. The demo is **visual first, technical second**. We say "this counter-rotation effect is implemented as `gondola.rotation.y = -ring.rotation.y` — that's the whole secret" and move on. If they want more, we open the file.

## 8. The "Show, Don't Tell" Reinforcement

Conversely, when a strong visual element is on screen, we say something quick — "this is bloom on emissive materials" — and let them look. Talking over your own visual is a known oral-defense mistake.

## 9. Submission-Day Checklist (also see M7 in [MILESTONES](../core/MILESTONES.md))

- [ ] live Pages URL works in a private window on a fresh device
- [ ] report PDF in `report/report.pdf`, ≥ 10 pages
- [ ] slide deck in `report/slides.pdf` (also `.pptx`)
- [ ] demo video in `report/demo.mp4`, ≤ 90 s
- [ ] `assets/CREDITS.md` complete
- [ ] commit history tells a coherent story (no dump commits)
- [ ] `v1.0.0` tag applied
- [ ] **email** sent to `marco.schaerf@uniroma1.it` (template in [PRESENTATION_STRATEGY](PRESENTATION_STRATEGY.md) §10)
- [ ] Infostud registration confirmed

## 10. Realistic Grade Estimation

If we hit every milestone on time and the demo runs:
- baseline grade: **27/30**
- with the day/night cycle landing cleanly: **28/30**
- with the FPV gondola landing cleanly: **29/30**
- with the Easter-egg ray-tracer and a polished report: **30/30**, possibly **30L** (cum laude)

The marginal cost of each "+1" gets higher. We optimize the early "+1"s ruthlessly and treat the 30L as bonus. The plan is built around getting to a confident 28–29.
