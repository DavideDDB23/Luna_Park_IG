# FINAL REPORT OUTLINE

> Companion to: [EVALUATION_STRATEGY](../evaluation/EVALUATION_STRATEGY.md) · [SLIDES_PLAN](SLIDES_PLAN.md) · [DEMO_SCRIPT](DEMO_SCRIPT.md)

## 1. Format

- Length: **10–15 pages** (the requirements say 5–10 minimum; we ship 10–15 to demonstrate rigor without bloat).
- Format: PDF, single column, 11-point Garamond or Source Serif, 1.2× line height.
- Author: written in **English** unless the team explicitly wants Italian. English aligns with the codebase comments and the professor accepts both.
- Builder: Markdown → Pandoc → PDF with a stable LaTeX template. Source committed under `report/`.

## 2. Cover Page (½ page)

- Project title: **Luna Park 3D — An interactive 3D amusement park in WebGL/Three.js**
- Course: Interactive Graphics
- Professor: Prof. Marco Schaerf
- Department: DIAG — Sapienza University of Rome
- A.Y. 2025/26 (session: July 12, 2026)
- Student name(s) + matricola
- Live demo URL: `<github.io URL>`
- Repository URL: `<github.com URL>`

A hero image of the park at dusk fills the lower half.

## 3. Sections

### Section 1 — Introduction (1 page)

- One-paragraph project pitch.
- Why a theme park: pedagogical fit (paragraph from [PROJECT_OVERVIEW](../core/PROJECT_OVERVIEW.md) §2).
- Summary of features (bulleted list, 5–6 items).
- Reading guide (the rest of the report follows the lecture order).

### Section 2 — Environment and Libraries (1 page) — REQUIRED BY THE COURSE

Required content per `Project_Requirements.pdf` page 8:
- Engine: Three.js r160+
- Animation: tween.js (course-suggested)
- HUD: lil-gui
- FPS overlay: stats.js
- Optional physics: cannon-es (not shipped in v1.0)
- Hosting: GitHub Pages
- Authoring tools: Blender 4.x, AmbientCG / PolyHaven / Kenney / Sketchfab CC0-CC-BY assets

A subsection lists **all external assets** with full attribution (mirrors `assets/CREDITS.md`).

### Section 3 — Technical Architecture (1 page)

- Module map (architecture diagram from [TECHNICAL_ARCHITECTURE](../core/TECHNICAL_ARCHITECTURE.md) §3, redrawn).
- Frame loop contract (numbered steps).
- Coordinate conventions (units, axes, pivots).

Figure 1: the layered architecture diagram.

### Section 4 — Rendering Pipeline (2 pages) — CORE TECHNICAL CONTENT

- Mapping to Lecture 06: pipeline diagram, vertex shader stage, fragment shader stage, rasterizer, per-fragment ops.
- Configuration of `WebGLRenderer`, color space discipline (Lecture 03).
- Forward vs deferred: explicit decision and justification.
- Anti-aliasing strategy (MSAA + FXAA fallback, Lecture 14).
- Z-buffer depth precision (Lecture 14).
- Frame budget breakdown table.

Figure 2: the pipeline diagram.
Figure 3: the frame-budget chart.

### Section 5 — Lighting and Materials (2 pages)

- Five light types in use (Lecture 11).
- Day/night cycle: sun keyframe table, hemisphere lerp, fog binding (Lecture 11/12).
- BRDF choices per material (Lecture 11/13). Side-by-side render of `MeshStandardMaterial` vs `MeshPhongMaterial` on a gondola.
- Shadow mapping: configuration, bias tuning (Lecture 16). Comparison: acne vs peter-panning.
- Custom shaders summary (with code snippets — small, single-file ones from `src/materials/shaders/`).

Figure 4: day vs dusk vs night triptych.
Figure 5: PBR vs Phong gondola comparison.
Figure 6: shadow bias tuning triptych.

### Section 6 — Textures (1 page)

- Texture channels in use (Lecture 09 + Lecture 10).
- MRA packing convention.
- Color space discipline (sRGB vs linear).
- Anisotropic filtering — comparison images.
- Memory budget.

Figure 7: anisotropy comparison at 1× / 4× / 16× on the asphalt path.

### Section 7 — Scene Graph and Hierarchical Models (2 pages)

- Top-level hierarchy diagram (Lecture 05).
- Four ride hierarchies, one paragraph each.
- The counter-rotation derivation (one line of math).
- Frenet frame derivation for the coaster.

Figure 8: the scene graph hierarchy as printed by `printSceneGraph()` (a literal screenshot of the console).
Figure 9: Ferris wheel labeled diagram.
Figure 10: roller coaster track + Frenet frames sampled.

### Section 8 — Animation System (2 pages) — REQUIRED BY THE COURSE

- "All animations are implemented in JavaScript" — stated up front, in bold.
- The three animation categories (procedural / tweened / physics-flavored).
- Per-ride animation drivers (code snippets, one screen each).
- Easing curves visualization (small plot).
- The Tagada damped-spring stop: derivation of the semi-implicit Euler update (Lecture 19).

Figure 11: phase-offset sine bobs on the carousel.
Figure 12: easing-curve gallery from tween.js.

### Section 9 — Interactions (1 page)

- The six interactions table.
- Raycasting pipeline: the ray definition (Lecture 15), the picking filter, the panel mesh contract.
- Camera mode state machine.

Figure 13: the raycasting diagram.

### Section 10 — Performance (1 page)

- Frame budget table.
- Per-milestone perf snapshots in a chart (committed `perf/snapshot_*.json` rendered).
- Mobile fallback strategy.
- Draw-call audit results.

Figure 14: perf-history chart.

### Section 11 — Decisions and Trade-Offs (1 page)

A standalone chapter the grader can skim to see we made considered choices. Bullet form, ~12 entries:

- Engine: Three.js vs raw WebGL vs Babylon → Three.js (large ecosystem, course-named).
- Material: `MeshStandardMaterial` vs `MeshPhongMaterial` → both, per surface family.
- Shadow casters: only Directional + Spot → cost/benefit.
- Day/night env map: snap-at-midnight vs custom crossfade shader → snap (small artifact, large time saving).
- ... (etc., ~12 trade-offs)

### Section 12 — User Manual (1 page) — REQUIRED BY THE COURSE

(`Project_Requirements.pdf` page 8 specifies the document should be "both a technical presentation and a user manual".)

- How to open the demo
- Controls table (keyboard + mouse + touch)
- HUD widgets explanation
- URL parameters list
- Known limitations / browser support

### Section 13 — Course-Topics Coverage (1 page)

Heatmap table from [COURSE_TOPICS_MAPPING](../core/COURSE_TOPICS_MAPPING.md) §coverage-summary, with one-line per lecture stating what the project demonstrates.

### Section 14 — Conclusions & Future Work (½ page)

- What we shipped
- What we'd add with more time (cloth flag, audio, fireworks, VR mode)
- Personal learnings

### Appendix A — Asset Credits (½ page)

Every external asset, author, source, license, modifications (mirror of `assets/CREDITS.md`).

### Appendix B — Development Log (½ page)

Sample entries from `report/log/bugs.md` — proof of engineering rigor.

### Appendix C — Repository Map (½ page)

The folder tree from [TECHNICAL_ARCHITECTURE](../core/TECHNICAL_ARCHITECTURE.md) §2, briefly annotated.

## 4. Figures Checklist

- [ ] Fig 1: layered architecture diagram
- [ ] Fig 2: pipeline diagram
- [ ] Fig 3: frame-budget chart
- [ ] Fig 4: day/dusk/night triptych
- [ ] Fig 5: PBR vs Phong gondola
- [ ] Fig 6: shadow-bias triptych
- [ ] Fig 7: anisotropy comparison
- [ ] Fig 8: console scene-graph dump
- [ ] Fig 9: Ferris wheel labeled diagram
- [ ] Fig 10: roller coaster + Frenet frames
- [ ] Fig 11: carousel phase-offset bob
- [ ] Fig 12: easing-curve gallery
- [ ] Fig 13: raycasting diagram
- [ ] Fig 14: perf-history chart

Each figure has a caption that includes a lecture reference where applicable (e.g., "Figure 6 — Shadow bias tuning. Acne disappears at bias = -0.0005 (Lecture 16)").

## 5. Tone

- Concise and confident — declarative sentences.
- No padding. If a sentence isn't needed, cut it.
- Where a trade-off exists, name it. The grader respects clear thinking more than buried complexity.
- Cite lectures by number when relevant. "(Lecture 11)" is enough.

## 6. Build Pipeline

`report/`:

```
report/
├── report.md
├── figures/
│   ├── fig01_architecture.png
│   ├── fig02_pipeline.png
│   └── ...
├── log/
│   └── bugs.md
├── template.tex   ← LaTeX preamble (font, margins, fancyhdr)
├── build.sh       ← single script: pandoc report.md -o report.pdf --template ./template.tex
└── report.pdf     ← the committed output
```

`build.sh`:

```
pandoc report.md \
  -o report.pdf \
  --template ./template.tex \
  --pdf-engine=xelatex \
  --toc
```

Source committed; PDF also committed (the requirements specify "documentation" is in the repo).

## 7. Final QA on the Report

Before submission:

- [ ] every figure caption is filled in
- [ ] every lecture reference resolves to a real lecture number
- [ ] every URL works (live Pages URL, github repo, any external citations)
- [ ] page count ≥ 10
- [ ] table of contents is correct
- [ ] no broken cross-references
- [ ] no typos in headings (sweep specifically — typos in headings are conspicuous)
- [ ] author + course + date on cover
- [ ] credits appendix matches `assets/CREDITS.md` byte-for-byte
