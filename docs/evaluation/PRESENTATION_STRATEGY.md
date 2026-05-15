# PRESENTATION STRATEGY

> Companion to: [EVALUATION_STRATEGY](EVALUATION_STRATEGY.md) · [DEMO_SCRIPT](../deliverables/DEMO_SCRIPT.md) · [SLIDES_PLAN](../deliverables/SLIDES_PLAN.md) · [FINAL_REPORT_OUTLINE](../deliverables/FINAL_REPORT_OUTLINE.md)

## 1. The 5-Minute Oral

Italian university orals for course projects typically last 5–15 minutes. We plan for **5 minutes of demo + 5 minutes of Q&A**. This document captures the narrative beats, talking points, and contingencies.

## 2. The Demo Narrative (5 minutes)

### Beat 1 (0:00–0:20) — Opening shot

Live demo URL is already loaded in a clean browser window. We start at the cinematic overhead view (the default boot state). The Ferris wheel and Carousel are running.

We say: *"This is Luna Park 3D. Everything you see is rendered in real time with WebGL via Three.js. There are four rides, six interactions, a dynamic day-night cycle. Let me walk you through it."*

### Beat 2 (0:20–1:00) — Hierarchical models (THE BIG ONE)

We zoom toward the Ferris wheel. Click on a gondola — it lights up to highlight.

We say: *"The Ferris wheel is our flagship hierarchical model. The ring rotates around Y. Each arm is a child of the ring — they rotate with it. Each gondola is a child of an arm. The gondolas counter-rotate against the ring's rotation. So:"*

(Pointing at the screen.) *"The gondola's local rotation is exactly the negation of the ring's rotation. This is the canonical Lecture-05 demonstration of hierarchical 3D transformations."*

(Optional: hit `T` to dump the scene graph to the console for proof.)

### Beat 3 (1:00–1:30) — Variety of animations

Camera flies to the carousel.

We say: *"The carousel demonstrates phase-offset sinusoid animation: each horse bobs as `y = sin(t + i·2π/8) · amplitude`. The riders are children of the horses — no code for the riders."*

Camera flies to the roller coaster.

We say: *"The coaster cart follows a Catmull-Rom curve. Each frame, we compute the tangent, then the Frenet frame's normal and binormal, then build the cart's local basis. That gives it natural banking through curves — Lecture 07 plus Lecture 18."*

Camera flies to the Tagada.

We say: *"The Tagada arm has four nested rotations with incommensurate frequencies. Layered sinusoids produce a chaotic-looking compound motion from completely deterministic code."*

### Beat 4 (1:30–2:00) — Lights and textures

We say: *"Five light types: directional for the sun, point for the lampposts, spot for the central stage, hemisphere for ambient skybox tint, and emissive materials for the neon signs."*

We open the time-of-day slider and drag it from noon to midnight. The lights ignite. The sky darkens. The neon glows under bloom.

We say: *"All five light types adjust dynamically as the sun orbits. The sun's color and intensity follow a keyframe table — warm at sunset, cool at midnight. PCF-soft shadows cast from the sun."*

### Beat 5 (2:00–2:30) — Interactions

We click a control panel. The ride starts with an ease-in ramp.

We say: *"Every ride has a 3D control panel in the world. Clicking it raycasts against the panel mesh — Lecture 15. The state machine handles the start/stop with tween.js easings — the easing library the professor suggested."*

We scroll on the carousel. Speed adjusts.

We say: *"Scrolling on a ride adjusts its speed multiplier. Each visitor walks waypoints; lamp posts toggle individually; the color picker recolors all ride neon at once."*

### Beat 6 (2:30–3:30) — FPV gondola

Near the Ferris wheel, we press `G`.

We say: *"This is first-person gondola mode. The camera attaches to a non-rendered mount inside the gondola; its world transform is computed every frame from the scene graph. The gondola continues to counter-rotate — so we don't spin head-over-heels."*

Let the FPV ride play for 15 seconds. The night view from the gondola is the visual climax.

### Beat 7 (3:30–4:30) — Custom shader Easter egg + perf

Press `Esc`. Walk the camera up to the entrance arch with the RT-demo billboard.

We say: *"Final detail: this billboard runs a fragment-shader ray tracer. It implements ray-sphere intersection, Blinn–Phong shading, a shadow ray, and one iterative reflection bounce. WebGL has no recursion, so we loop — exactly the Lecture-15-and-16 approach."*

Toggle the perf overlay (backtick).

We say: *"60 fps median on a baseline integrated GPU at 1080p. Draw call count under 200 thanks to instancing. We hit a Phase-5 perf budget of 16.6 ms per frame."*

### Beat 8 (4:30–5:00) — Close

Pull the camera back to the cinematic overview.

We say: *"That's Luna Park 3D. Four hierarchical rides, six interactions, full day-night cycle, custom shaders, all original animations written in JavaScript. Thank you — happy to answer any questions."*

## 3. Demo Backups

Three layers of backup, in order:

1. **Primary**: live demo on the team's primary laptop (Pages URL).
2. **Secondary**: the same URL on a backup laptop (different browser, also pre-loaded).
3. **Tertiary**: the recorded `demo.mp4` ready to play in QuickTime / VLC.
4. **Quaternary** (last resort): screenshots in the slide deck.

Before submission day:
- charge both laptops to 100 %
- close all other tabs
- disable notifications
- pre-warm the URL (load it, navigate around)
- have HDMI / dongle ready

## 4. Talking-Point Cards (one-line answers)

Carry a small mental "deck":

- **Hierarchical model**: "Counter-rotated gondolas. Lecture 5."
- **Lights**: "Five types. Directional, point, spot, hemisphere, IBL. Lecture 11."
- **Textures**: "Color, normal, specular/roughness, AO, alpha, emissive. Lecture 9 and 10."
- **Animations**: "All JS. Procedural drivers plus tweened transitions. Lecture 18."
- **Shadows**: "PCF-soft, bias -0.0005. Lecture 16."
- **BRDFs**: "PBR for metal, Phong for cartoon. Lecture 11/13."
- **Performance**: "60 fps. Draw calls under 200. Frame budget in section 6 of the report."
- **Interactions**: "Six. Click-to-fly, panels, slider, FPV, scroll, color. Lecture 15 raycasting."
- **Day/night**: "Sun orbit, hemisphere lerp, lights ignite at sunlight threshold, sky cubemap crossfade."
- **Custom shaders**: "Three: neon, sky-blend, RT-demo. RT-demo is the Lecture-15 hook."
- **Imports**: "Models, yes. Animations, no. Audited at commit."

## 5. Anticipated Tough Questions (with answers)

(Also see [EVALUATION_STRATEGY](EVALUATION_STRATEGY.md) §6.)

| Q | A |
| --- | --- |
| "Show me the source for the counter-rotation." | Open `src/rides/FerrisWheel.js` line 60-ish; point at the `gondola.rotation.y = -ring.rotation.y` line. |
| "Why not use AnimationMixer?" | "We can't — the requirements forbid imported animations. AnimationMixer would also be playing imported clips, which we don't have. We implement them ourselves." |
| "How does the cart stay on the track?" | Open `src/rides/RollerCoaster.js`. Show the per-frame `curve.getPointAt(u)` + `getTangentAt(u)` + Frenet basis assembly. |
| "Why fewer shadows from point lights?" | "Cubemap shadow maps cost 6 face renders per light per frame. With 12 lampposts that's 72 extra passes. The benefit is negligible at night; the cost is huge. Engineering trade-off documented in `LIGHTING_STRATEGY.md`." |
| "What's the BRDF on the horses?" | "Blinn–Phong with shininess=80. Phong was chosen because the horse is a stylized painted plaster surface — energy conservation isn't a goal." |
| "Could you do soft shadows from point lights?" | "Yes, with much higher cost. We could PCF-sample a cubemap. For this scene's scale, PCF on the directional sun is the win." |
| "Can the player crash the demo?" | "Stress-testing at M4 ran 5 minutes of frantic clicks without console errors. Edge cases — clicking during tweens — are queued, not failed." |
| "Why not Babylon?" | "Three.js has the largest community ecosystem and was named in the lecture deck. The trade-offs are documented in `TECHNICAL_ARCHITECTURE.md` §1.1." |
| "What's in `vendor/`?" | "Three.js, tween.js, lil-gui, stats.js. All vendored per the course requirement to include all libraries in the repo." |

## 6. Rehearsal Plan (Final Week)

- **D-7**: full dry run, time it, record video. Watch the recording.
- **D-5**: dry run with a teammate playing professor. Have them interrupt with hard questions.
- **D-3**: full demo on the backup laptop.
- **D-1**: final dry run on a fresh browser; final perf snapshot.
- **D-0**: 30 minutes before the appointment, do one quiet run-through. Charge devices. Take a screenshot of the live URL as proof.

## 7. Body Language and Pacing

- Stand. Don't sit hunched over the laptop.
- Use the screen as the focal point, not your face.
- Pause after each beat. Let the visual register.
- If you stumble, do NOT apologize. Pause, breathe, restart the sentence.
- Speak slower than feels natural. ~120 words/minute.

## 8. Slide-Deck Coordination

The slide deck (see [SLIDES_PLAN](../deliverables/SLIDES_PLAN.md)) is the **backup brain**, not the primary medium. The primary medium is the demo. Slides are used:
- before the demo: 1 slide intro
- between beats: never (don't toggle)
- after the demo: for Q&A reference

## 9. Etiquette

- Address the professor formally ("Prof. Schaerf", "Lei" if in Italian).
- Thank him for his teaching once, at the very start or very end.
- If asked to skip a section, do so without complaint.
- Stay under time. Better to finish at 4:30 than overflow to 5:30.

## 10. Submission Email Template

```
Subject: Interactive Graphics — Project submission — <Team name / Student name>

Gentile Prof. Schaerf,

Scrivo per comunicare il completamento del progetto del corso di Interactive Graphics
per la sessione di <July 12 / August 28 / etc.>.

Dettagli del progetto:
  - Titolo: Luna Park 3D
  - Studenti / Team: <names + matricole>
  - Repository GitHub Classroom: <url>
  - Demo live (GitHub Pages): <url>
  - Documento di accompagnamento: <link to PDF in repo>
  - Video demo (90 secondi): <link to mp4 in repo>

Il progetto è stato registrato su Infostud per la sessione di <data>.

Ringrazio per il tempo e attendo l'esame.

Cordiali saluti,
<nome studente>
<matricola>
<contact email>
```

Send from the university email account (`@studenti.uniroma1.it` or equivalent). Submit by 11:59 pm of the deadline date; don't push midnight.

## 11. After the Exam

- Update the README with the actual grade if it was published (a tiny pride badge).
- Tag a `v1.1.0` if any post-defense bug fixes happen.
- Make the repo public if it was private (showcase value).
- Add the project to the LinkedIn portfolio with the live URL.
