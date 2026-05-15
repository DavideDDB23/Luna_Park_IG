# PROJECT OVERVIEW

> Companion to: [README](../../README.md) · [TECHNICAL_ARCHITECTURE](TECHNICAL_ARCHITECTURE.md) · [COURSE_TOPICS_MAPPING](COURSE_TOPICS_MAPPING.md)

## 1. Vision Statement

Luna Park 3D is a real-time, browser-based, fully interactive 3D amusement park rendered through WebGL. The user opens a single URL and lands inside a stylized, festive theme park populated by four animated rides, decorative stands, lampposts, and walking visitors. They can fly around freely, walk up to any ride, click a small in-world 3D control panel to start or stop the ride, change the time of day to watch the park transition from afternoon to dusk and into a glowing neon night, and even hop into a Ferris-wheel gondola to take a first-person ride.

The project is **conceived as a single integrated demonstration of the full Interactive Graphics syllabus**: rasterized rendering pipeline, 3D transformations and hierarchical scene graphs, mesh modeling, multi-channel texturing, Phong/Blinn–Phong shading, real-time shadow mapping, procedural animation, easing-based interpolations, and physics-flavoured kinematics — every one of these topics is exercised in a way the professor can immediately identify on screen.

## 2. Problem Statement & Theme Justification

The course requires "a theme that you choose" with hierarchical models, lights, textures, animations, and user interaction. An amusement park is an unusually good fit because:

1. **Hierarchical models become spectacular naturally.** A Ferris wheel's gondolas must counter-rotate against the wheel to remain upright — a textbook demonstration of nested transformations. A carousel's horses bob in phase-offset sine waves while their riders inherit the bobbing — exactly the inheritance behaviour the scene graph topic exists to teach.
2. **Multiple animation paradigms fit the scene.** Wheel rotation (constant ω), carousel bob (sinusoidal driver), roller coaster (parametric curve following with Frenet frame), Tagada arm (compound multi-axis sinusoids), visitors (waypoint following), day/night (sun orbit). One scene exhibits **six categorically different animation kinds**.
3. **Lighting is inherent to the theme.** A park has daylight, streetlamps that switch on at dusk, neon ride signs that pulse, and a spotlight on a stage. The day/night cycle gives a continuous visual story rather than a frozen exhibit.
4. **Interaction has obvious diegetic anchors.** Control panels for each ride are physical objects in the world, not floating HTML buttons — the user understands them instantly. Clicking the ground to fly the camera there is intuitive. Selecting individual lampposts to toggle them feels playful.
5. **Texture variety is justified by the props.** Wood (carousel), painted metal (rides), painted plaster (horses), striped fabric (food stands), asphalt, grass, sky — six distinct material families, each requiring at least three texture maps (color + normal + specular/roughness).
6. **Demo-friendliness.** A theme park at night is photogenic. Screenshots and the live demo will be visually memorable, which materially helps the grade.

## 3. Scope

### 3.1 In scope (committed)

- **Four hierarchical rides** with category-distinct animation:
  1. **Ferris Wheel (Ruota Panoramica)** — rotating outer ring with eight gondolas counter-rotating to stay vertical, passengers swaying in phase with centripetal acceleration.
  2. **Carousel (Giostra Cavalli)** — rotating platform with eight horses on poles oscillating in `y = sin(t + i·2π/N)·A`, riders parented to horses.
  3. **Roller Coaster (Ottovolante)** — cart following a `CatmullRomCurve3` with a Frenet-derived rolling frame; passengers tilt with the curve's torsion.
  4. **Tagada Mechanical Arm** — three nested rotating links producing chaotic-looking motion from layered sinusoids of different periods, with a fast-spinning seat platform at the tip.
- **Explorable park ground** with paths, grass plot, six food stands, ~12 lampposts, ~15 procedurally-walking visitors, a central performance stage, decorative trees.
- **In-world 3D control panels** for each ride: a small podium with a green/red signal light and a lever; clicking the podium toggles the ride with ease-in/out velocity ramp.
- **Click-to-fly navigation**: clicking anywhere on the ground initiates a tween of the camera position toward the hit point with a quadratic in-out ease, maintaining a minimum altitude.
- **Free orbit camera** as default (Three.js `OrbitControls`).
- **Dynamic day/night cycle** controlled by a UI slider; the directional sun light orbits, ambient hemisphere tint shifts, lampposts and ride neons toggle on at a sunlight threshold, the sky background lerps between day and night cubemaps.
- **First-person gondola camera**: pressing `G` while near the Ferris wheel attaches the camera to a specific gondola node; press `Esc` or `G` again to detach.
- **Individual light toggles**: clicking on any lamppost mesh toggles its `PointLight`. A small color-picker widget in the HUD recolors the ride neon decorative lights.
- **Per-ride speed control**: scroll-wheel while a ride is in focus modifies its speed multiplier with eased acceleration.
- **Six light types in use**: Directional (sun), Point (×N lampposts and ride decorations), Spot (stage), Hemisphere (sky/ground ambient), Emissive material (windows, signs), and an animated flicker on a subset of the point lights for an "amusement park" feel.
- **Multi-channel materials** for every key surface (color, normal, specular or roughness/metalness, and selectively emissive or alpha) — see [TEXTURE_LIST](../assets/TEXTURE_LIST.md).
- **Shadow mapping** from the directional sun light over the central park region with PCF-soft shadows.
- **Post-processing**: bloom for the night neon, ACES tone mapping for high-DR sun, and a vignette.
- **HUD**: time-of-day slider, ride-speed indicator, help overlay (toggle `H`), color picker for ride decorations, FPS counter (toggle backtick).

### 3.2 Stretch goals (only if schedule allows)

- Skybox crossfade between day cubemap and night starfield cubemap (priority: high — visually crucial).
- Procedural fireworks particle system at night (priority: medium).
- Cannon-es coupling for roller-coaster cart with proper inertia (priority: low — fallback pure kinematic).
- Audio: looping fairground music + per-ride mechanical sounds (priority: low).
- VR mode via WebXR (priority: very low — only if multiple weeks of slack).
- Reflective puddles on asphalt after a procedural rain (priority: very low).

### 3.3 Out of scope (explicit non-goals)

- No imported animations from GLTF/FBX clips. Forbidden by the course (see Project_Requirements.pdf, page 3).
- No multiplayer / networking.
- No persistent state — the park resets on reload.
- No real money / ticketing simulation; no "gameplay" objectives or scoring.
- No physically-based path tracing — only rasterized Blinn–Phong. (Path tracing concepts are referenced in the report but not executed at runtime; see Lecture 17 "Sampling".)
- No skeletal rigging — visitors will use parented mesh limbs animated with sinusoids, not bones.

## 4. Target User & Use Cases

| Persona | Use case |
| --- | --- |
| **Professor Schaerf, evaluating** | Wants to see the hierarchical model trees, light types, textures, JS-only animations, and a smooth interactive demo. |
| **Curious classmate, visiting via GitHub Pages** | Wants to spend 60 s clicking around, riding the Ferris wheel, and changing the time of day. |
| **The team itself, debugging** | Wants overlays (FPS, axes, scene-graph dump), URL params to jump straight to a ride. |

## 5. Success Criteria

The project is considered complete when **all** of the following hold:

1. The four rides are running, animated, controllable individually from their in-world panels.
2. The day/night cycle is continuous, with lights and emissive materials switching coherently.
3. The camera supports the three modes: free orbit, click-to-fly, FPV-gondola.
4. The scene contains ≥ 6 light objects of ≥ 4 distinct light types and ≥ 6 materials each using ≥ 3 texture channels.
5. The frame rate is ≥ 55 fps on a baseline laptop (Intel Iris Xe class) at 1080p, with no animation glitches.
6. The build is live on GitHub Pages and the repository contains all libraries vendored.
7. The accompanying report (≥ 10 pages) is finalized as PDF under `/report`.
8. No imported `.glb` animation channels are loaded; every `AnimationMixer` interaction is JS-driven if used at all.
9. The presentation deck and the 60-second demo video are recorded and linked from the README.

## 6. Risks at a Glance

(See [RISK_ANALYSIS](../workflow/RISK_ANALYSIS.md) for the full table.)

- **R1**: Scene asset volume slows the frame rate → mitigation: aggressive instancing, draw-call budget tracking, LOD policy.
- **R2**: Day/night transitions look choppy → mitigation: explicit easing on every channel (color, intensity, position).
- **R3**: Animations look mechanical → mitigation: easing curves on start/stop, slight noise on visitor walk.
- **R4**: Project descopes too late, missing milestone 5 → mitigation: ride 4 (Tagada) is the lowest-priority ride and is the explicit drop candidate.

## 7. Definition of "Done" for the Demo

A 90-second demo, performed live or pre-recorded:

1. Camera opens overhead, daylight. The wheel and carousel are already running.
2. The user clicks the ground; camera flies to a stand.
3. The user clicks the carousel's 3D control panel; the carousel slows and stops with easing.
4. The user slides the time-of-day slider; sun orbits down, lampposts turn on, the neon signs ignite, the sky darkens.
5. The user clicks the Ferris wheel's panel to start it, then presses `G` to enter a gondola.
6. The gondola lifts the camera over the park at night. Bloom is visible on neon.
7. The user presses `G` to detach, opens the color picker, recolors the carousel neon.
8. The user clicks a single lamppost — it turns off.
9. Camera pulls back to overview. End of demo.

## 8. Course Topic Coverage Summary

(Detailed mapping in [COURSE_TOPICS_MAPPING](COURSE_TOPICS_MAPPING.md).)

Coverage is **deep on lectures 04–12, 14, 16, 18** (transformations, pipeline, surfaces, meshes, textures, shading, rasterization, shadows, animations) and **conceptual on lectures 13, 15, 17, 19–20** (rendering equation, ray tracing, sampling, physics-based animation, simulation) — those are referenced in the report and partially demonstrated through ad-hoc shader experiments described in [SHADER_PLAN](../graphics/SHADER_PLAN.md).
