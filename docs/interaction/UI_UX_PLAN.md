# UI / UX PLAN

> Companion to: [INTERACTION_DESIGN](INTERACTION_DESIGN.md) · [STATE_MANAGEMENT](STATE_MANAGEMENT.md)

The HUD is intentionally minimal. The course requires user interaction, not a heavy menu — the **scene** is the UI. The HUD only contains affordances that cannot live in the world.

## 1. HUD Layout

```
┌────────────────────────────────────────────────────────────────────┐
│ ●  Luna Park 3D                                       [?]    [⏵︎/⏸︎] │ ← top bar
│                                                                    │
│                                                                    │
│                          [3D canvas]                               │
│                                                                    │
│                                                                    │
│ ┌─────── lil-gui panel (collapsible) ──────────┐                   │
│ │ ▾ Day/Night                                  │                   │
│ │     time of day  ───●────  (slider)          │                   │
│ │     auto cycle   ☑                           │                   │
│ │ ▾ Ride speed                                 │                   │
│ │     Ferris     ───●──  ×1.0                  │                   │
│ │     Carousel   ──●───  ×0.8                  │                   │
│ │     Coaster    ────●─  ×1.2                  │                   │
│ │     Tagada     ──●───  ×1.0                  │                   │
│ │ ▾ Neon color                                 │                   │
│ │     color  [■]                               │                   │
│ │ ▾ Misc                                       │                   │
│ │     reset lamps  [button]                    │                   │
│ │     reset camera [button]                    │                   │
│ │     pause cycle  ☐                           │                   │
│ └──────────────────────────────────────────────┘                   │
│                                                                    │
│                                                                    │
│                                    Carousel ×1.8  ← transient HUD  │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
                                              [?] = help overlay
```

## 2. Widgets

| Widget | Library | State source |
| --- | --- | --- |
| Top bar logo / title | plain HTML | static |
| Help (`?`) button | plain HTML; toggles overlay | `appState.helpOpen` |
| Play/pause day-cycle | plain HTML; clicker | `appState.dayCyclePaused` |
| lil-gui panel | lil-gui | various |
| Time-of-day slider | lil-gui slider 0..1 step 0.001 | `appState.timeOfDay` |
| Ride speed sliders × 4 | lil-gui range 0.2..3.0 step 0.05 | `appState.rideSpeed[id]` |
| Neon color picker | lil-gui addColor | `appState.neonColor` |
| Reset lamps button | lil-gui addButton | n/a (action) |
| Reset camera button | lil-gui addButton | n/a (action) |
| Transient speed toast | plain HTML, auto-dismiss 1.5 s | volatile |
| FPS overlay | Stats.js | n/a |

## 3. Help Overlay

Tap `?` or press `H`. Shows:

```
Luna Park 3D — controls

  Mouse left-click:  fly to a point on the ground / click a control panel
  Mouse right-drag:  rotate camera
  Mouse scroll:      zoom / change ride speed when hovering a ride
  Shift + drag:      pan camera

  G       Enter FPV gondola (near the Ferris wheel)
  Esc     Exit FPV
  [   ]   Scrub time of day
  P       Pause auto cycle
  1-4     Fly to ride 1..4
  R       Reset camera
  H       Toggle this help
```

Closes on `Esc`, `H`, or clicking the X.

## 4. Visual Identity

- Color scheme: warm carnival palette
  - primary: `#c2185b` (carnival pink)
  - secondary: `#0d47a1` (deep blue)
  - accent: `#fdd835` (yellow neon)
  - bg dark: `#1a1a2e`
- Type: system stack (`-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`)
- Padding: 16 px around HUD groups; 8 px between widgets
- Border radius: 10 px on panels, 20 px on badges
- Subtle backdrop blur on HUD panels (`backdrop-filter: blur(6px)`) — modern, cheap

These styles match the original project pitch (see `luna_park_idea_completa.html`) so the HUD feels like the same product as the pitch document.

## 5. Empty States & Error States

- Loading screen: full-screen splash with logo and a progress bar (driven by `AssetLoader.onProgress`). Disappears once `progress >= 1`.
- Asset error: scene continues; HUD toast at top-right: "Missing asset: <name>" (5 s).
- WebGL2 unsupported: HUD shows a fallback message instructing the user to use a modern browser.

## 6. Responsive Design

- Desktop / laptop: HUD lives bottom-left, ~280 px wide.
- Tablet: HUD lives bottom-left, ~240 px wide, scaled down.
- Phone: HUD becomes a single bottom drawer that swipes up. Includes a "?fast" button that auto-enables.

## 7. Accessibility (a11y)

- All lil-gui controls have `aria-label`s set via the controller's `.name()`.
- Focus indicators visible on keyboard navigation.
- `prefers-reduced-motion`: disables HUD micro-animations (panel slide-in is instant; signal-pulse hover effect off).
- `prefers-color-scheme: dark` is the default; the HUD already uses a dark palette so there's no light mode to maintain.

## 8. Motion Design

- HUD panel opens with a 200 ms `EaseOutCubic` slide-in (only first time).
- Help overlay fades in with 150 ms ease.
- Transient speed toast fades in 100 ms, sits 1.5 s, fades out 200 ms.
- Slider thumb has no special motion — relies on browser default.

## 9. UX Anti-patterns to Avoid

- **Floating buttons over the rides**: would defeat the diegetic 3D-panel design. Strict no.
- **Modal dialogs**: nothing in the project requires modal interruption.
- **Tutorial popups**: replaced by the help overlay (opt-in).
- **HUD covering the action**: HUD is collapsible and lives bottom-left only.

## 10. Copy & Microcopy

| Element | Copy |
| --- | --- |
| Title | Luna Park 3D |
| Help button | `?` |
| Day/night section | Day / Night |
| Time-of-day label | Time of day |
| Speed section | Ride speed |
| Color picker | Neon color |
| FPV toast | Get closer to the Ferris wheel |
| Loading | Loading the park… |
| Submit (final) | n/a — no forms |
| Error toast | Something didn't load — the scene continues |

Microcopy is checked in [evaluation/PRESENTATION_STRATEGY](../evaluation/PRESENTATION_STRATEGY.md) — typos in HUD copy are a common cosmetic issue.
