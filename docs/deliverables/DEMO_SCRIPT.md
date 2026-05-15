# DEMO SCRIPT

> Companion to: [PRESENTATION_STRATEGY](../evaluation/PRESENTATION_STRATEGY.md) · [SLIDES_PLAN](SLIDES_PLAN.md) · [INTERACTION_DESIGN](../interaction/INTERACTION_DESIGN.md)

This document is the **minute-by-minute live demo plan** AND the storyboard for the recorded `demo.mp4`.

## 1. Two Versions

| Version | Length | Audience |
| --- | --- | --- |
| **Recorded demo video** (`report/demo.mp4`) | 90 seconds | Submitted alongside the report and embedded in README |
| **Live oral demo** | 5 minutes | The professor during the oral defense |

The recorded video is the **cinematic version** — it autopilots via `?demo=1` URL flag. The live demo is the **driven version** — the presenter clicks through interactions.

## 2. Recorded Demo Video — 90 seconds

### Setup
- Run via `?demo=1` URL flag, which enables the scripted camera path.
- Render at 1920 × 1080, 60 fps, recorded with OBS at 8 Mbps H.264.
- Export to `report/demo.mp4`.
- No voice-over (silent or with a single licensed music track, no copyright risk).

### Storyboard

| Time | Camera | Action | Note |
| --- | --- | --- | --- |
| 0:00 | Overhead establishing shot | Park visible, daylight, wheel+carousel running | TITLE CARD: "Luna Park 3D" |
| 0:08 | Fly toward Ferris wheel | Camera passes a gondola | LABEL: "Hierarchical counter-rotation" |
| 0:18 | Side view of Ferris wheel | Wheel rotates with gondolas upright | (no label) |
| 0:25 | Fly to carousel | Carousel running with phase-offset bob | LABEL: "Phase-offset sinusoid" |
| 0:35 | Fly to coaster | Cart laps the track | LABEL: "Catmull-Rom + Frenet frame" |
| 0:45 | Fly to Tagada | Three-axis chaotic motion | LABEL: "Compound multi-axis animation" |
| 0:55 | Fly back to overhead | Time-of-day starts advancing | LABEL: "Day/night cycle" |
| 1:00 | Same overhead, time advancing | Sunset → night transition | bloom kicks in on neon |
| 1:15 | Sweep through park at night | Lampposts on, ride neons glowing | LABEL: "Dynamic lighting" |
| 1:25 | Enter FPV gondola | Camera inside a gondola | LABEL: "FPV gondola mode" |
| 1:35 | Pull out, freeze | Logo card | END CARD: live URL |

### Recording

- record in incognito with default config (no debug flags)
- mute browser audio
- record 95 seconds, trim to 90
- export H.264 baseline so all browsers play it

## 3. Live Oral Demo — 5 minutes

Already detailed in [PRESENTATION_STRATEGY](../evaluation/PRESENTATION_STRATEGY.md) §2. We summarize here as a single page for the presenter to hold (printed cue card).

```
00:00  Open URL. State: daylight overhead. Ferris and Carousel running.
       SAY: "Luna Park 3D. Built with Three.js. Four rides. Six interactions. Real-time WebGL."

00:20  Fly to Ferris wheel. Click a gondola to highlight.
       SAY: "Counter-rotation. Gondola's local Y rotation = -ring.rotation.y. Lecture 5."

01:00  Camera to carousel.
       SAY: "Phase-offset sinusoid. y = sin(t + i·2π/N)·amp. Riders parented to horses."

01:15  Camera to coaster.
       SAY: "Catmull-Rom curve. Per-frame Frenet basis. Cart banks naturally."

01:30  Camera to Tagada.
       SAY: "Three nested rotations. Incommensurate frequencies. Chaotic from deterministic code."

02:00  Drag time-of-day slider from 0.5 to 0.0.
       SAY: "Sun orbits. Hemisphere lerps. Lampposts ignite. Bloom on neon."

02:30  Click a control panel.
       SAY: "Raycast against the mesh. State machine ramps with eased tween."

02:45  Scroll on a ride to change speed.
       SAY: "Speed multiplier eased to target. Per-ride."

03:00  Press G near Ferris wheel.
       SAY: "FPV gondola mode. Camera follows the mount node. Gondola still counter-rotates."

03:45  Press Esc. Walk to entrance arch.
       SAY: "RT-demo billboard. Fragment-shader ray tracer. Spheres + plane + shadow + reflection. Iterative — Lecture 16."

04:15  Toggle FPS overlay (`).
       SAY: "60 fps median. Draw calls under 200. Mobile fallback profile via ?mobile."

04:45  Pull back to overhead.
       SAY: "Thank you. Happy to take questions."
```

The cue card lives on paper next to the laptop, in 14-point font.

## 4. Pre-Demo Sanity Checklist

The 5 minutes BEFORE the oral begins:

- [ ] live URL loads in a fresh browser window
- [ ] FPS overlay reads ≥ 55 in the overview shot
- [ ] no error in the console
- [ ] HUD widgets respond to clicks
- [ ] backup video file accessible (just in case)
- [ ] laptop charged
- [ ] notifications silenced (do-not-disturb)
- [ ] cue card printed in 14-point and within reach

## 5. Failure Modes During Live Demo

| Failure | Response |
| --- | --- |
| Browser hangs | Hit refresh. While it reloads, talk about the architecture (10 s buffer). |
| Wifi drops | The live URL is cached; reload still works for a session. If not, fall back to recorded video. |
| Wrong commit deployed | Open the GitHub Pages "View deployments" — confirm the tag, deploy from `v1.0.0` if it's not active. |
| Laptop dies | Switch to backup laptop. |
| Both laptops dead | Play `demo.mp4` from a phone via HDMI dongle. |

## 6. After the Recording / Demo

Demo asset committed:
- `report/demo.mp4` (final video, 90 s, ≤ 30 MB)
- `report/demo.gif` (5 s teaser, looped, ≤ 5 MB) — for the README banner
- `screenshots/anchors/` (the V1–V10 anchors from [TESTING_STRATEGY](../workflow/TESTING_STRATEGY.md) §4)

## 7. The README GIF

A small 5-second teaser:
- 0–1 s: park overhead, wheel rotating
- 1–2 s: carousel bobbing
- 2–3 s: dusk transition starts
- 3–4 s: neon ignites
- 4–5 s: title overlay: "Luna Park 3D"

Loop seamlessly. Use `gifski` for clean colors. Pin at top of README.

## 8. Marketing Screenshot (single hero image)

For the README banner and the slide-1 cover:
- camera angle: 30° down, looking at the park from the southwest
- time of day: 0.78 (just past sunset, lampposts ignited, sky pink-purple)
- bloom on, MSAA on, 2× SSAA via `?aa=ssaa`
- export to `assets/banner/hero.png` at 2560 × 1440, then 1920 × 1080 for the slide deck
