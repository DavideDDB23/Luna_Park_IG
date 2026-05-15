# SLIDES PLAN

> Companion to: [PRESENTATION_STRATEGY](../evaluation/PRESENTATION_STRATEGY.md) · [DEMO_SCRIPT](DEMO_SCRIPT.md) · [FINAL_REPORT_OUTLINE](FINAL_REPORT_OUTLINE.md)

The slide deck is the **backup brain**, not the primary medium during the oral. We use it before the demo (1 slide) and during Q&A (reference). Aim for **12 slides** total, including title and thank-you.

## 1. Visual Style

- 16:9 aspect.
- Dark theme, carnival pink (#c2185b) for headings, white text on near-black background.
- One concept per slide.
- Big screenshots; minimum 28-point body text.
- No bullet-list walls. Every slide is either: hero image, diagram, table, or 3-sentence statement.

## 2. The Slides

### Slide 1 — Title (intro)

- Project title: **Luna Park 3D**
- Subtitle: "An interactive 3D amusement park in WebGL — Interactive Graphics A.Y. 2025/26"
- Author(s) + matricola
- Single hero image: dusk shot of the park with bloom on neon.
- Live URL printed at the bottom.

### Slide 2 — Quick stats

A clean dashboard:
- 4 rides (Ferris, Carousel, Coaster, Tagada)
- 6 interactions
- 5 light types
- 6+ material families
- 18/18 lectures referenced
- 60 fps target
- 250+ commits
- 100% JS animations (zero imported)

### Slide 3 — Hierarchical models

A diagram of the Ferris wheel scene graph:

```
ferrisWheel (root)
  hub
  ring  ← rotates
    arm × 8
      gondola  ← counter-rotates
        passenger × 2
```

Plus a small inline equation: `gondola.rotation.y = -ring.rotation.y`.

Lecture footer: **Lecture 05 — 3D Transformations**.

### Slide 4 — Rendering pipeline

Recreate the pipeline diagram from [RENDERING_PIPELINE](../graphics/RENDERING_PIPELINE.md) §1, simplified. Color-code each stage (vertex shader, rasterizer, fragment shader, post).

Lecture footer: **Lecture 06 — GPU Pipeline & WebGL**.

### Slide 5 — Lights and day/night

Triptych: day, dusk, night. Each from the same camera angle.

Lecture footer: **Lectures 11 & 16 — Shading, Shadows**.

### Slide 6 — Materials and textures

A 3×2 grid showing each material family (metal painted, wood varnished, horse painted, fabric striped, grass, asphalt) with their texture-channel labels.

Lecture footer: **Lectures 09, 10, 11 — Textures, Shading**.

### Slide 7 — Animations

Four side-by-side panels:
1. Ferris counter-rotation (icon: ↻ vs ↺)
2. Carousel phase-offset bob (icon: sine wave)
3. Coaster Frenet frame (icon: curve with frames)
4. Tagada compound multi-axis sinusoids (icon: chaotic spiral)

Lecture footer: **Lecture 18 — Computer Animations** (plus 07 for the curve and 19 for the damped stop).

### Slide 8 — Interactions

Two columns: input modalities ↔ effects.

- Click ground → fly camera
- Click panel → toggle ride
- Drag slider → time of day
- Press G → FPV gondola
- Scroll → ride speed
- Click lamp / pick color → light toggle / neon recolor

Lecture footer: **Lecture 15 — Ray Tracing** (raycasting).

### Slide 9 — Custom shaders

Snippet from `shaders/neon.frag` (5 lines) with labels: attribute / uniform / varying / texture2D.

Plus a screenshot of the RT-demo billboard (Easter egg).

Lecture footer: **Lectures 06, 10, 15, 16**.

### Slide 10 — Performance

Frame budget bar chart (CPU, shadow, main, post). Stats from the perf snapshot.

Plus the draw-call count and mobile-fallback note.

### Slide 11 — Architecture and discipline

Folder tree (compact) on the left. Commit count, doc count, milestone tags on the right. Conveys "this is a serious engineering project, not a hackathon submission."

### Slide 12 — Thank you / Q&A

Last live demo URL + repo URL printed large. A small "Press G near the Ferris wheel" Easter-egg note in the corner.

## 3. Delivery Notes

- Pre-export to **both** PDF and PPTX. PDF avoids font/animation surprises; PPTX is editable on the venue's machine if needed.
- Carry the file on a USB stick as a backup.
- Embed no media — use the live demo for video, not embedded clips. Embedded clips crash projectors.

## 4. Practice Plan

- Read through the deck out loud, in order, twice before any oral run-through.
- Time it: should take ~90 seconds if the demo is the primary medium.
- Mark the **single sentence** you say for each slide. Don't read the slide; speak around it.

## 5. Common Pitfalls

- Too many bullets → slide noise. Replace with images.
- Tiny code: unreadable from the back row. Use only 5–7-line snippets at large font.
- Slides as a teleprompter → makes you face the slide, not the audience. Avoid.

## 6. Decks Filing

Committed under `report/slides.pdf` and `report/slides.pptx`. Source (e.g., Keynote or Google Slides export) optionally also in `report/slides_source/`.
