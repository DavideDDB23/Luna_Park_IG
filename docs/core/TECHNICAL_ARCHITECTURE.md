# TECHNICAL ARCHITECTURE

> Companion to: [PROJECT_OVERVIEW](PROJECT_OVERVIEW.md) · [RENDERING_PIPELINE](../graphics/RENDERING_PIPELINE.md) · [STATE_MANAGEMENT](../interaction/STATE_MANAGEMENT.md) · [SCENE_STRUCTURE](../graphics/SCENE_STRUCTURE.md)

This document is the **single source of truth for module decomposition, file layout, data flow, and runtime contracts**. Every other doc may assume these definitions. When the implementation diverges from this document, this document must be updated first.

## 1. Environment & Engine Choice

### 1.1 Why Three.js, not raw WebGL

| Criterion | Raw WebGL | Three.js | Babylon |
| --- | --- | --- | --- |
| Course approval | Yes | Yes (explicit) | Yes (explicit) |
| Scene-graph for hierarchical rides | hand-rolled | built-in `Object3D` | built-in `TransformNode` |
| GLTF model loading | hand-rolled | `GLTFLoader` | `SceneLoader` |
| Shadow mapping | hand-rolled FBOs | `PCFSoftShadowMap` | built-in |
| Post-processing | hand-rolled | `EffectComposer` | built-in |
| Documentation maturity | low | very high | high |
| Time savings vs raw WebGL | — | ~3 weeks | ~3 weeks |
| **Decision** | rejected | **chosen** | rejected |

We choose **Three.js r160+**. It is the most widely-used engine, has the largest community examples, is suggested implicitly in the course slides (Lecture 06 names it), and lets us spend our time on the bespoke parts (hierarchical rigs, interactions, custom shaders) rather than reimplementing wheels the professor explicitly authorized us to skip.

### 1.2 Module / library stack

| Library | Version | Purpose | Vendored in repo? |
| --- | --- | --- | --- |
| `three` | 0.160.0 or newer | engine, scene graph, renderer | **yes** (`vendor/three/`) |
| `three/examples/jsm/controls/OrbitControls` | bundled with three | free-orbit camera | yes |
| `three/examples/jsm/loaders/GLTFLoader` | bundled with three | model loading | yes |
| `three/examples/jsm/loaders/RGBELoader` | bundled with three | HDR cubemap loading | yes |
| `three/examples/jsm/postprocessing/EffectComposer` | bundled with three | post FX | yes |
| `three/examples/jsm/postprocessing/UnrealBloomPass` | bundled with three | bloom for night neon | yes |
| `three/examples/jsm/postprocessing/OutputPass` | bundled with three | tone mapping pass | yes |
| `tween.js` | 23.x | smooth camera tweens and ride start/stop easing | **yes** (explicitly suggested by the prof) |
| `lil-gui` | 0.19.x | HUD widgets (slider, color picker, toggles) | yes |
| `stats.js` | r17 | FPS overlay (dev only, toggle ` ` ` `) | yes |
| `cannon-es` | 0.20.x | **OPTIONAL** physics for coaster cart | yes if used |

Per [GIT_WORKFLOW](../workflow/GIT_WORKFLOW.md) every library above is vendored under `vendor/` so the project runs on GitHub Pages with no build step. ES module loading uses an **import map** in `index.html`.

### 1.3 Tooling

- **Editor / IDE**: VS Code with the Live Server extension for local hot-reload.
- **Bundler**: **none required**. Optional Vite for development convenience; the production build is a no-bundle import-map setup so GitHub Pages can serve it directly.
- **3D modeling**: Blender 4.x for any custom models. Export as `.glb` (binary GLTF 2.0). Mesh-only — animations are NEVER exported.
- **Texture authoring**: Substance Sampler / Materialize / online PBR generators. See [ASSET_PIPELINE](../assets/ASSET_PIPELINE.md).
- **Version control**: Git, hosted on GitHub Classroom.
- **Hosting**: GitHub Pages from `main` branch root.

## 2. Repository Layout

```
luna-park-3d/
├── index.html                ← entry point, import map, canvas, HUD root
├── style.css                 ← HUD styles only (the scene is on canvas)
├── README.md                 ← entry doc
├── LICENSE
├── .nojekyll                 ← required to prevent Pages from filtering files
├── .gitignore
├── docs/                     ← every planning document (this folder)
├── src/                      ← all JavaScript source, ES modules
│   ├── main.js               ← bootstraps app, owns the renderer + scene + frame loop
│   ├── config.js             ← tunable constants (frame budget, debug flags, asset paths)
│   ├── core/
│   │   ├── App.js            ← lifecycle: init / dispose / pause / resume
│   │   ├── Loop.js           ← rAF frame loop with delta clamping
│   │   ├── Clock.js          ← wrapper around THREE.Clock, day-time = elapsed * speed
│   │   ├── AssetLoader.js    ← centralized loading of textures, GLTFs, cubemaps
│   │   ├── ResourceCache.js  ← dedup textures / materials / geometries
│   │   └── EventBus.js       ← tiny pub/sub, decouples HUD ↔ scene
│   ├── scene/
│   │   ├── SceneRoot.js      ← top-level Three.Scene + groups
│   │   ├── Ground.js         ← terrain + paths + grass
│   │   ├── Skybox.js         ← day/night cubemap blend
│   │   ├── Lampposts.js      ← instanced lamppost field
│   │   ├── Stands.js         ← food stands and decorative props
│   │   └── Visitors.js       ← waypoint-walking crowd
│   ├── rides/
│   │   ├── Ride.js           ← abstract base class — state machine, common API
│   │   ├── FerrisWheel.js
│   │   ├── Carousel.js
│   │   ├── RollerCoaster.js
│   │   ├── Tagada.js
│   │   └── ControlPanel.js   ← shared in-world panel mesh + raycast handler
│   ├── camera/
│   │   ├── CameraRig.js      ← owns the active camera + transitions
│   │   ├── FreeOrbit.js      ← OrbitControls wrapper
│   │   ├── ClickToFly.js     ← raycast → tween position + lookAt
│   │   └── GondolaCam.js     ← attaches camera to a gondola node
│   ├── lighting/
│   │   ├── LightingRig.js    ← directional sun, hemisphere, spot, point pool
│   │   ├── DayNight.js       ← time-of-day controller; updates sun, ambient, fog, sky
│   │   └── Flicker.js        ← per-light intensity modulator for amusement-park feel
│   ├── interaction/
│   │   ├── InputRouter.js    ← centralizes pointer/keyboard/wheel events
│   │   ├── Raycaster.js      ← scene picking with object filtering
│   │   ├── HUD.js            ← lil-gui controls, color picker, help overlay
│   │   └── KeyMap.js         ← keyboard bindings (one source of truth)
│   ├── materials/
│   │   ├── MaterialLibrary.js ← named materials, all PBR/Phong instances
│   │   ├── shaders/
│   │   │   ├── neon.vert      ← (custom shader code lives in src, not docs)
│   │   │   ├── neon.frag
│   │   │   └── ...
│   ├── post/
│   │   ├── Composer.js       ← EffectComposer wiring
│   │   └── Bloom.js          ← night bloom configuration
│   ├── utils/
│   │   ├── math.js           ← clamp, lerp, smoothstep, easeInOutQuad, mod2π
│   │   ├── debug.js          ← axes helpers, scene graph print, perf overlays
│   │   ├── url.js            ← URL parameter parsing for debug presets
│   │   └── disposers.js      ← deep dispose() of geometries/materials/textures
│   └── animation/
│       ├── TweenRegistry.js  ← single tween group, ticked once per frame
│       ├── Easing.js         ← curated easing names → tween.js easings
│       └── ProceduralRigs.js ← sinusoidal drivers, Frenet frame helpers
├── assets/
│   ├── models/               ← .glb files, MESH ONLY (no animations)
│   ├── textures/             ← .ktx2 / .webp / .png, organized by material
│   ├── cubemaps/             ← day + night
│   └── icons/                ← HUD icons (small SVG)
├── vendor/                   ← three.js, tween.js, lil-gui, stats.js
├── report/                   ← LaTeX or Markdown source for the final 10–15-page PDF
└── tools/                    ← optional helper scripts (texture conversion, etc.)
```

## 3. Runtime Architecture — Layered View

```
                       ┌──────────────────────────────────────────────┐
                       │                index.html                    │
                       │  <canvas>  +  HUD overlay  +  import map     │
                       └─────────────────────┬────────────────────────┘
                                             │
                       ┌─────────────────────▼────────────────────────┐
   PRESENTATION  →     │                  HUD layer                   │
                       │      lil-gui sliders / picker / help         │
                       └─────────────────────┬────────────────────────┘
                                             │ EventBus
                       ┌─────────────────────▼────────────────────────┐
   APPLICATION   →     │              App / Loop / Clock              │
                       │       owns: renderer, composer, scene        │
                       └────┬───────────────┬───────────────┬────────┘
                            │               │               │
       ┌────────────────────▼──┐  ┌─────────▼─────────┐ ┌───▼──────────────┐
   DOMAIN  →                   │   InputRouter +     │ │   CameraRig      │
                               │   Raycaster        │ │   (3 modes)      │
                               └─────────┬───────────┘ └──────┬───────────┘
                                         │                    │
       ┌─────────────────────────────────▼────────────────────▼─────────┐
       │                            Scene graph                          │
       │  SceneRoot ─┬─ Ground / Skybox / Lampposts / Stands / Visitors  │
       │             ├─ FerrisWheel / Carousel / RollerCoaster / Tagada  │
       │             └─ LightingRig                                      │
       └──────────────────────┬──────────────────────────────────────────┘
                              │
   GPU       →   Three.WebGLRenderer ─► WebGL2 commands ─► GPU pipeline
```

## 4. Frame Loop Contract

Each animation frame (rAF callback) runs **exactly this order**, in `Loop.js`:

1. **Read inputs** — `InputRouter` flushes pending events into a per-frame snapshot.
2. **Update clock** — compute `dt = min(realDt, 1/30)` to clamp pathological dt after tab-switch.
3. **Update HUD state** — apply any pending HUD-driven changes (time-of-day, ride speeds, color picks).
4. **Update camera rig** — depending on `activeMode`: `FreeOrbit.update(dt)`, `ClickToFly.update(dt)`, or `GondolaCam.update(dt)`.
5. **Update tweens** — `TWEEN.update(performance.now())` so HUD-triggered tweens advance.
6. **Update rides** — each `Ride.update(dt, clock)` runs its state machine and procedural drivers.
7. **Update lighting** — `DayNight.update(timeOfDay)` repositions the sun, lerps ambient and fog, toggles point lights below threshold; `Flicker.update(dt)` modulates ride neons.
8. **Update visitors / passive scene** — waypoint kinematics.
9. **Render** — `composer.render()` for post-processed path or `renderer.render(scene, camera)` if post is disabled.
10. **Debug overlays** (if enabled) — Stats.js, scene-graph print.

**Invariant:** Step 5 must come *before* step 6 only when a ride listens to tween-completed events that flip its state. If the order is swapped a one-frame stutter appears at state transitions. Tested via the [DEBUG_WORKFLOW](../workflow/DEBUG_WORKFLOW.md) "single-step" mode.

## 5. Data Flow — One User Click on a Ride Control Panel

```
mousedown
   │
   ▼
InputRouter (normalizes to pointer event in NDC)
   │
   ▼
Raycaster.pick(scene, ndc)
   │   → returns intersection list, filtered by `userData.pickable === true`
   │   → first hit is a panel mesh with `userData.rideRef = "carousel"`
   ▼
EventBus.emit("ride:toggle", { rideId: "carousel" })
   │
   ▼
Carousel.toggle()                       ← state machine: idle ↔ ramping_up ↔ running ↔ ramping_down
   │
   ▼ tween(speed: 0 → targetSpeed, dur: 1500ms, ease: QuadraticInOut)
   │
   ▼ per frame in Ride.update()
   │     platform.rotation.y += currentSpeed * dt
   │     for each horse i:
   │         horse.position.y = baseY + sin(t + phase_i) * amp
   │
   ▼ panel.signal.material.emissiveColor = currentSpeed > 0 ? GREEN : RED
   │
   ▼ HUD.updateRideSpeedReadout("carousel", currentSpeed)
```

## 6. Module Boundaries (Public APIs)

This section is intentionally pseudocode — it specifies the public surface each module exposes. Implementation details (private fields, internal helpers) are not enumerated here.

### 6.1 `Ride` (abstract)
```
Ride(rootObject3D, opts)
    state: "idle" | "ramping_up" | "running" | "ramping_down"
    speed: number               // current angular/linear velocity
    targetSpeed: number
    speedMultiplier: number     // user-controlled, default 1.0
    panel: ControlPanel
    update(dt, clock)           // MUST be deterministic given clock + state
    toggle()                    // flips between idle and running with ramp
    setSpeedMultiplier(x)       // eases via tween
    dispose()                   // free GPU resources
```

### 6.2 `CameraRig`
```
CameraRig(camera, scene)
    mode: "orbit" | "fly" | "gondola"
    flyTo(targetVec3, lookAtVec3, dur)        // tween, returns Promise
    attachToNode(object3D, offset)            // mode = "gondola"
    detach()                                  // mode = "orbit"
    update(dt)
```

### 6.3 `DayNight`
```
DayNight(scene, lightingRig, opts)
    timeOfDay: float in [0,1]    // 0 = midnight, 0.25 = sunrise, 0.5 = noon, 0.75 = sunset
    setTimeOfDay(t)              // immediate
    tweenTimeOfDay(t, dur)       // smooth slider response
    update(dt)                   // applies sun.position, light intensities, sky lerp
```

### 6.4 `EventBus`
```
emit(eventName, payload)
on(eventName, handler) → unsub
once(eventName, handler) → unsub
```
Event names are a closed set; see [STATE_MANAGEMENT](../interaction/STATE_MANAGEMENT.md) §3.

## 7. Configuration Strategy

Every tunable constant lives in `src/config.js`:

- Performance: `FRAME_TARGET_MS`, `MAX_DRAW_CALLS`, `SHADOW_MAP_SIZE`.
- Day/night: `SUN_RADIUS`, `DAY_TURN_DURATION_S`, `LAMP_ON_THRESHOLD`.
- Rides: angular velocities, oscillation amplitudes, phase offsets, ramp durations.
- Debug: `DEBUG_AXES`, `DEBUG_SCENE_GRAPH_PRINT`, `DEBUG_RAYCAST_HELPER`.

URL query parameters override `config.js` values at boot for fast iteration:
- `?fast` reduces shadow map and disables post.
- `?ride=carousel` jumps the camera to a ride and runs it on boot.
- `?time=0.8` initializes the day/night cycle at a given time of day.
- `?debug=1` enables FPS overlay, axes, scene-graph keypress dump.

URL parsing is centralized in `utils/url.js`. See [DEBUG_WORKFLOW](../workflow/DEBUG_WORKFLOW.md).

## 8. Coordinate Conventions

- **Up axis**: +Y (Three.js default).
- **Forward**: -Z (Three.js camera default).
- **Units**: 1 unit = 1 metre. The park footprint is ~120 m × 120 m. The Ferris wheel is ~25 m tall.
- **Pivot conventions**: each ride's local origin is at its physical pivot on the ground. Children are positioned relative to that.
- **Normal-map convention**: OpenGL (Y-up green). Validated in [TEXTURE_LIST](../assets/TEXTURE_LIST.md).

## 9. Browser Targets

| Browser | Minimum | Tested in CI manually | Notes |
| --- | --- | --- | --- |
| Chrome / Edge | 110+ | weekly | reference |
| Firefox | 110+ | weekly | confirm shadow softness identical |
| Safari | 16+ | before each milestone | confirm `ImageBitmap` + sRGB pipeline |
| Mobile Chrome (Android) | 110+ | before final | confirm fallback quality (no post) |
| Mobile Safari (iOS) | 16+ | before final | confirm fallback quality (no post) |

A `?mobile` flag forces the mobile fallback profile.

## 10. Failure & Fallback Strategy

| Subsystem | If it fails / underperforms | Fallback |
| --- | --- | --- |
| Shadows | < 45 fps drop | shadow-map size 2048 → 1024 → 512, then off |
| Bloom + post | < 45 fps | disable post pipeline, render directly |
| GLTF model load error | model missing | substitute with a `BoxGeometry` placeholder, log warning |
| Texture load error | texture missing | substitute a 2-px magenta texture, log warning |
| Cannon-es coaster cart | physics step too slow | switch to pure kinematic curve following |

All fallbacks are silent in production but logged in `console.warn`. See [DEBUG_WORKFLOW](../workflow/DEBUG_WORKFLOW.md).

## 11. Open Architectural Questions

- **Q-1**: Do we use Three's built-in `MeshStandardMaterial` (PBR) or `MeshPhongMaterial` (Blinn–Phong)? The lectures cover Blinn–Phong explicitly (Lecture 11). **Decision: `MeshStandardMaterial` for assets that benefit from metalness/roughness (rides, asphalt, metal); `MeshPhongMaterial` for stylized cartoon assets (horses, signs).** This lets us narrate both BRDFs in the report.
- **Q-2**: Where do we put the gondola's camera offset? Inside or outside the gondola node? **Decision: outside**, as a child of a non-rendered "camera mount" so swapping gondolas does not rebuild the camera.
- **Q-3**: Do visitors collide with rides? **Decision: no**, visitors are kinematic and pre-routed; collision would inflate scope without grading benefit.
- **Q-4**: Day/night affects fog? **Decision: yes**, fog color lerps with sky; this also helps mask draw-distance pops.
