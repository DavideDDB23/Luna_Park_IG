# LIGHTING STRATEGY

> Companion to: [RENDERING_PIPELINE](RENDERING_PIPELINE.md) · [MATERIAL_SYSTEM](MATERIAL_SYSTEM.md) · [SCENE_STRUCTURE](SCENE_STRUCTURE.md) · [SHADER_PLAN](SHADER_PLAN.md)

Lighting is **the single highest-leverage visual decision** in this project. A reasonable park lit poorly looks like a Three.js example; a reasonable park lit well looks finished. This document fixes the rig, the day/night control logic, and the shadow plan.

## 1. Why This Lighting Plan Is Worth Points

- Lecture 11 (Shading) introduces six light types — **the project uses five of them** (Directional, Point, Spot, Hemisphere, Area-approximated, IBL via cubemap), letting us point at each in the oral defense.
- Lecture 12 (Shading transformations) introduces the normal matrix and shading space — exercised whenever a non-uniformly scaled mesh is lit (the canopy tent has non-uniform scale, deliberately).
- Lecture 16 (Shadows) introduces shadow mapping, bias, and acne — our directional sun light demonstrates all three. Bias values are listed in §5.
- The dynamic **day/night cycle** is the most memorable interaction in the demo. It also showcases that we did not lazily ship a single static lighting setup.

## 2. Light Inventory

| ID | Type | Quantity | Role | Cast shadow | Receive shadow |
| --- | --- | --- | --- | --- | --- |
| `sun` | `DirectionalLight` | 1 | sun + moon (single source whose color and intensity change with day-time) | **yes** | n/a |
| `ambientSky` | `HemisphereLight` | 1 | bounce light, day color from above, ground tint from below | no | n/a |
| `stageSpot` | `SpotLight` | 1 | dramatic spot on the central stage | yes (small map) | n/a |
| `lampPoints` | `PointLight` × 12 | 12 | lamppost glow at night | no | n/a |
| `ridePoints` | `PointLight` × ~6 | ~6 | decorative neon points sprinkled on rides | no | n/a |
| `cubemapIBL` | `Texture` (env map) | 1 | ambient cubemap, day vs night variants | n/a | n/a |
| (Emissive materials) | n/a | many | emissive contribution on signs/windows; counts as a "light" visually | n/a | n/a |

Five **distinct types** of `THREE.Light` (Directional, Hemisphere, Spot, Point, plus Ambient-via-Hemisphere). The course only requires "at least one"; we ship five.

## 3. Day/Night Cycle

### 3.1 Variable & domain

```
timeOfDay ∈ [0, 1]
  0.00  → midnight
  0.25  → sunrise
  0.50  → noon
  0.75  → sunset
```

### 3.2 Sun position

The sun orbits a circle of radius 80 m around the park center, on a plane tilted ~12° from vertical (so noon is slightly south rather than overhead — gives nicer shadows):

```
angle = (timeOfDay - 0.25) * 2π     // sunrise = 0
sun.position = ( cos(angle) * 80,  sin(angle) * 80,  0 ) rotated about Z by 12°
```

### 3.3 Sun color & intensity

Cosine-tinted along day-time:
- Noon: `#fff7e0`, intensity 3.0
- Sunset: `#ffaf6d`, intensity 1.8
- Civil twilight: `#5a4585`, intensity 0.5
- Midnight: `#aab5d0`, intensity 0.25 (this is the moon, dimmed-and-cool)

Implemented as a lookup of 5 keyframe colors, lerp'd:

```
colorKeyframes: [
  { t: 0.00, color: "#aab5d0", I: 0.25 },  // midnight
  { t: 0.22, color: "#aab5d0", I: 0.30 },  // pre-dawn
  { t: 0.27, color: "#ffaf6d", I: 1.50 },  // sunrise glow
  { t: 0.50, color: "#fff7e0", I: 3.00 },  // noon
  { t: 0.75, color: "#ffaf6d", I: 1.80 },  // sunset
  { t: 0.82, color: "#5a4585", I: 0.50 },  // civil twilight
  { t: 1.00, color: "#aab5d0", I: 0.25 }
]
```

### 3.4 Hemisphere sky/ground colors

```
skyKeyframes:
  noon:    sky #bcdfff, ground #6a5040
  sunset:  sky #ff9a55, ground #6a5040
  night:   sky #0a0e22, ground #08080a

intensity: 0.6 at noon, 0.35 at night
```

### 3.5 Fog

```
fog.color matches the sky color (lerped)
fog.near = 60
fog.far  = 220
```

### 3.6 Lampposts & neons ignition

When `sun.position.y < 8` (which corresponds to ~`elev < ~15° above horizon`):
- lerp lampposts' `PointLight.intensity` 0 → 2.0 over 5 s
- lerp neon `emissiveIntensity` 0 → 1.5 over 5 s
- enable the **bloom pass** if not already (visible only at night)

When `sun.position.y > 8`:
- reverse the lerps

The ramp is **5 s of cycle time**, not real time. With a default day duration of 60 s, that's about 8 % of the cycle — visually long enough to read as "dusk" but short enough not to feel slow.

### 3.7 Sky background

Two cubemaps:
- `cubemapDay.hdr` (HDR, low-DR sky)
- `cubemapNight.hdr` (HDR, starfield)

A custom skybox shader (described in [SHADER_PLAN](SHADER_PLAN.md) §4) samples both with `texture` and blends with `mix(day, night, smoothstep(0.2, 0.8, nightAmount))`.

### 3.8 HUD coupling

The `DayNight` controller exposes:
- `setTimeOfDay(t)` (immediate, used by slider drag)
- `tweenTimeOfDay(t, duration)` (used by HUD presets)
- auto-advance toggle (default ON, advances `t += 1/CYCLE_S * dt`)
- pause toggle (lil-gui checkbox)

## 4. Spot, Point, and Decorative Lights

### 4.1 Stage spot

- `SpotLight(color=#ffe7a0, intensity=8, angle=π/6, penumbra=0.5, distance=30)`
- `castShadow = true` with a 1024² map (only the stage area is in it; the camera bounds are tight)
- A small `lookAt` target ramps in a circle around the stage center every 30 s

### 4.2 Lamppost points

- color `#ffcc88`
- intensity 0 by day, 2.0 at night
- distance 14, decay 1.6
- NOT shadow-casting (perf budget)
- one `PointLight` per lamppost instance (12 lights). They're spatially separated so the per-fragment cost stays low (≤ 2 lights influence a typical fragment).

### 4.3 Ride neon points

- attached to ride substructures so they orbit with the ride
- color is **user-controlled via the color picker**
- intensity flickers ±0.15 with `sin(t * 5)` to feel "amusement-park alive"
- NOT shadow-casting

### 4.4 Emissive contribution (not a `Light` object, but lights the scene visually)

- Sign faces, food-stand windows, ride decals use `emissiveMap` + `emissiveIntensity`.
- They DO NOT contribute to indirect lighting — that would require dynamic GI we don't have.
- Bloom (post) makes them glow, providing the visual impression of an emissive contribution.

## 5. Shadow Mapping (Lecture 16)

### 5.1 Configuration

```
sun.castShadow = true
sun.shadow.mapSize = (4096, 4096)   // 2048 on `?fast`; 1024 on `?mobile`
sun.shadow.camera.left   = -50
sun.shadow.camera.right  =  50
sun.shadow.camera.top    =  50
sun.shadow.camera.bottom = -50
sun.shadow.camera.near   = 10
sun.shadow.camera.far    = 200
sun.shadow.bias        = -0.0005
sun.shadow.normalBias  =  0.05
sun.shadow.radius      =  4         // PCF kernel
renderer.shadowMap.type = THREE.PCFSoftShadowMap
```

### 5.2 Bias tuning protocol (M3 → M6)

1. Disable normalBias, set bias = 0. Observe **shadow acne** (Lecture 16 vocabulary).
2. Increase `bias` magnitude (negative) until acne disappears. The threshold should be around `-0.0005`.
3. Watch for **peter-panning** (shadows detached from feet). If visible, reduce `|bias|` and add `normalBias = 0.05`.
4. Final values committed in `src/config.js` and screenshot-documented in the report.

### 5.3 Why only the directional sun casts shadows

| Light | Shadow cost | Visual gain | Decision |
| --- | --- | --- | --- |
| Sun (directional) | one orthographic map | huge (defines the scene) | **yes** |
| Stage spot | one perspective map | moderate (theatrical) | **yes** (small map) |
| Lamppost points | 6 cubemap faces per light × 12 lights = 72 passes | small | **no** |
| Ride neon | as above | tiny | **no** |

Refusing to shadow the small lights is a deliberate engineering trade — and a strong report sentence: "We restricted shadow casters to the two lights whose shadow influence is visible in the final image, saving roughly 72 cubemap face renders per frame."

### 5.4 PCF and the Lecture-17 sampling tie-in

PCF soft shadows approximate Monte Carlo soft shadows (Lecture 17). The report notes: "PCF can be seen as the deterministic real-time analog of the Monte-Carlo soft-shadow approach described in Lecture 17 — we trade unbiased noise for a bias and a fixed kernel."

## 6. Image-Based Lighting (IBL)

`scene.environment = nightHDR / dayHDR` — Three.js uses the environment map as an ambient prefiltered cubemap for PBR materials' `envMapIntensity`. We set:

- `envMapIntensity = 0.6` for PBR-painted metal surfaces (rides)
- `envMapIntensity = 0.2` for matte materials (cloth, plaster horses)

The environment crossfades with the sky (§3.7). Practically we lerp two preloaded environment maps via a small custom step (Three.js does not natively crossfade environment textures; we re-assign `scene.environment` from one of two precomputed PMREMs depending on which one is dominant — for the transition window, we render twice and blend in the OutputPass, OR we accept a brief snap at midpoint; see [POST_PROCESSING](POST_PROCESSING.md) §6 for the chosen approach).

## 7. Flickering & Animation

`Flicker.update(dt)` modulates a subset of lights to simulate amusement-park theatrics:

| Group | Modulation | Visual effect |
| --- | --- | --- |
| Ferris wheel ring lights | `sin(t*4 + i*π/4)` per-instance | rotating chase pattern around the wheel |
| Carousel canopy bulbs | `0.5 + 0.5*sin(t*3 + i*0.7)` | warm flicker |
| Stage spot | `0.95 + 0.05*sin(t*0.5)` slow | gentle "alive" feel |
| Lampposts | none (steady, realistic) | calmness contrast with rides |

## 8. Color Picker → Ride Neon Coupling

- HUD color picker emits `EventBus.emit("rideNeon:setColor", color)`.
- `Flicker` listens; every ride neon `Light` plus emissive material on the same ride is recolored.
- The signal sphere of the panel does NOT recolor (must remain red/green per ride state).

## 9. Testing Checklist

(see [TESTING_STRATEGY](../workflow/TESTING_STRATEGY.md) §4 for the full matrix)

- [ ] no light goes negative or > 100 at any moment
- [ ] no `NaN` in shadow map (visible as bright white blob)
- [ ] lerp through `t=[0,1]` once with auto-cycle disabled and inspect each 0.05 step
- [ ] confirm at `t=0.25` lamps are 50 % ignited, at `t=0.27` 100 %
- [ ] shadow does not pop when scrubbing time fast
- [ ] FPS stays within 16.6 ms during day/night transition
