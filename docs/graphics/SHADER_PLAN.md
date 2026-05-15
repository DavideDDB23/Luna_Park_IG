# SHADER PLAN

> Companion to: [RENDERING_PIPELINE](RENDERING_PIPELINE.md) · [MATERIAL_SYSTEM](MATERIAL_SYSTEM.md) · [LIGHTING_STRATEGY](LIGHTING_STRATEGY.md)

This document scopes the **custom shaders** we plan to ship. Three.js's built-in materials cover 95 % of the scene; the custom shaders exist to:

1. Demonstrate explicit mastery of the GPU pipeline (Lecture 06) by showing hand-written GLSL.
2. Demonstrate sampler usage and procedural texturing (Lecture 10).
3. Show that the team can implement ray tracing on a fragment shader (Lecture 15 + 16).

Three custom shader programs are planned, plus one optional. **Code is not written in this document** — only specifications, uniforms, varyings, and the algorithmic intent.

## 1. Why Custom Shaders At All

Built-in Three.js materials are efficient and correct. Hand-rolling them adds zero pedagogical value and a lot of bug surface. **However**, the project's grade benefits significantly from being able to point at a specific custom `.vert` / `.frag` file and say: "we wrote this." We restrict custom shaders to three high-leverage cases:

- one ShaderMaterial with attribute / uniform / varying / texture sampling, all visible.
- one custom sky shader that does cubemap blending (a thing Three.js does not natively expose).
- one full-screen-quad ray-tracer Easter egg for the Lecture 15 hook.

## 2. Shader Inventory

| ID | Name | Source files | Status | Lecture hook |
| --- | --- | --- | --- | --- |
| S1 | `neon` | `shaders/neon.vert`, `shaders/neon.frag` | required | 06, 10, 11 |
| S2 | `sky` | `shaders/sky.vert`, `shaders/sky.frag` | required | 09, 10 |
| S3 | `rt_demo` | `shaders/rt_demo.vert`, `shaders/rt_demo.frag` | optional but planned | 15, 16, 17 |
| S4 | `cloth_displace` (stretch) | `shaders/cloth.vert` | stretch | 19, 20 |

## 3. Shader S1 — `neon` (required)

**Purpose**: animated emissive material for ride decorative trim. Demonstrates a complete vertex + fragment shader pair, all variable qualifiers, and texture sampling.

### 3.1 Algorithm

- The trim mesh is a closed strip with a 1-D UV (`uv.x` runs along the strip).
- The fragment shader samples a 1-D pattern texture by `uv.x + offset(t)` where `offset(t) = mod(t * speed, 1.0)` — this makes the pattern run along the strip ("chase lights").
- It computes a final emissive color as `texture(uEmissiveMap, uv').rgb * uColor * (uIntensity + 0.2 * sin(t * 4.0 + vDist))`.
- It writes that to `gl_FragColor.rgb` with `alpha = 1.0`.
- Bloom (post) picks it up and glows it.

### 3.2 Variables

```
attribute  position    (vec3, built-in via Three.js but we declare to be explicit)
attribute  uv          (vec2)

uniform    modelMatrix, viewMatrix, projectionMatrix      (mat4, built-in)
uniform    uTime       (float)
uniform    uColor      (vec3, sRGB — converted to linear in shader)
uniform    uIntensity  (float)
uniform    uEmissiveMap (sampler2D)
uniform    uChaseSpeed (float)

varying    vUv         (vec2)
varying    vDist       (float)    // for spatial flicker
```

### 3.3 Pipeline narration (talking points)

The team can point to each line and say:
- attributes: "data uploaded once per vertex"
- uniforms: "data uniform across the draw call"
- varyings: "perspective-correctly interpolated to each fragment"
- `gl_Position`: "the homogeneous clip-space position (Lecture 06)"
- `texture(uEmissiveMap, vUv + chase)`: "GPU texture sampling, exact subject of Lecture 10"

### 3.4 HUD coupling

`uColor` is bound to the lil-gui color picker via EventBus event `rideNeon:setColor`. Updating the color is a single uniform write.

## 4. Shader S2 — `sky` (required)

**Purpose**: blend between day and night cubemaps as a function of `nightAmount`.

### 4.1 Algorithm

- Vertex shader: a unit cube; outputs the local position as `vDir`.
- Fragment shader: samples both cubemaps with `vDir`, mixes with `smoothstep(0.2, 0.8, uNightAmount)`.
- Skybox is drawn first; depth write disabled; depth test off.

### 4.2 Variables

```
attribute  position    (vec3)
varying    vDir        (vec3)
uniform    uDayMap     (samplerCube)
uniform    uNightMap   (samplerCube)
uniform    uNightAmount (float)
```

### 4.3 Notes

- We must **not** apply view translation to the skybox vertex transform (the sky should appear infinitely far). Achieved by feeding the camera's rotation-only matrix to the shader (Three.js has a helper for this: `material.uniforms.viewRotationOnly`).
- The night cubemap is the dimmer of the two and is in low-DR (the bright stars are augmented by procedural twinkle in the fragment shader — see §4.4).

### 4.4 Procedural twinkle (Lecture 10 "procedural textures")

In addition to sampling the night cubemap, the fragment shader adds a procedural starfield:
- `n = hash(vDir * 200.0)`
- if `n > 0.997`, contribute `(1.0 - distance to nearest star * something) * blink(t, n)` where `blink` is a sinusoid keyed by the star's hash.

The starfield is **procedurally textured on the GPU** — a direct exercise of Lecture 10.

## 5. Shader S4 — `cloth_displace` (stretch goal)

**Purpose**: vertex displacement for ambient flag waving, to demonstrate vertex-shader manipulation.

### 5.1 Algorithm

- A small grid-mesh flag attached at the flagpole top.
- Vertex shader displaces along the local Z axis with:
  ```
  displacement = sin(t * 2 + vertex.x * 4) * 0.1 * vertex.x   // anchored at x=0
  ```
- Normal is recomputed analytically from the displacement gradient so lighting reads correctly.

This shader is **optional** and shipped only after M6 sign-off.

## 6. Shader S3 — `rt_demo` Easter Egg (Lecture 15 hook)

**Purpose**: a self-contained 64 × 64 fragment-shader ray tracer rendered onto a small billboard at the park entrance. The player can walk up to it; it acts as a "developer commentary kiosk".

### 6.1 What it renders

- A scene of **two spheres on a checkered plane**, lit by one directional light.
- Per pixel: cast a primary ray, intersect sphere/plane, compute Blinn–Phong shading, then cast **one** reflection ray and one **shadow ray**.
- Recursion depth: 1 (Lecture 16: "WebGL has no recursion → iterative implementation").

### 6.2 Pipeline

A full-screen-quad-equivalent is mounted at a billboard mesh. The fragment shader treats `vUv` ∈ [0, 1]² as the demo's "screen space" and casts rays from a fixed virtual camera, NOT the main scene camera. This isolates the Easter-egg world from the main scene.

### 6.3 Variables

```
varying    vUv
uniform    uTime
uniform    uSpheres[2] (vec4: xyz=position, w=radius)
uniform    uSphereColor[2] (vec3)
uniform    uLightDir   (vec3)
```

### 6.4 Algorithm pseudo (one fragment)

```
ray = makePrimaryRay(vUv)
hit = intersectScene(ray)
if (!hit) gl_FragColor = skyColor(ray.dir); return
shaded = blinnPhong(hit, uLightDir)
shadowRay = makeRay(hit.point + n * BIAS, uLightDir)
if (intersectScene(shadowRay).t < ∞) shaded *= 0.3
reflRay = makeRay(hit.point + n * BIAS, reflect(ray.dir, n))
reflHit = intersectScene(reflRay)
if (reflHit) shaded += KR * blinnPhong(reflHit, uLightDir)
gl_FragColor = vec4(shaded, 1.0)
```

This implements:
- **ray-sphere intersection** (Lecture 15)
- **ray-plane intersection** (Lecture 15)
- **Blinn–Phong shading** (Lecture 11)
- **shadow ray** (Lecture 16)
- **one iterative reflection** (Lecture 16, "imperfect specular reflection")

The billboard is tiny — performance impact is minimal. It is THE strongest "Lecture 15" hook in the project.

## 7. Naming, Versioning, Documentation

- Shader source files live under `src/materials/shaders/`.
- Each `.vert` / `.frag` file starts with a comment block:
  ```
  // <shader name>
  // Lecture hooks: 06, 10, 11
  // Inputs:  uColor, uIntensity, uEmissiveMap, uTime
  // Outputs: gl_FragColor (RGBA, linear)
  // Notes:   color picker maps onto uColor (sRGB → converted to linear here)
  ```
- A README in the shaders folder lists all three shaders with a one-line summary.

## 8. Failure Plan

If a custom shader breaks (e.g. compile error on Safari), the fallback is:
- S1 `neon` → replace with `MeshBasicMaterial({ color, ... })` plus emissiveIntensity ramped manually
- S2 `sky` → replace with a single static cubemap and skip the crossfade
- S3 `rt_demo` → replace the billboard mesh with a static `MeshBasicMaterial` showing a static screenshot of what it would render

Each fallback is a one-line code change. The custom shaders are wins, not blockers.

## 9. Shader Talking Points (oral defense)

1. "Open `shaders/neon.frag`. Line 1: `attribute vec2 uv` — Lecture 06 attribute. Line 5: `uniform sampler2D uEmissiveMap` — Lecture 10. Line 12: `texture(uEmissiveMap, vUv)` — texture sampling. Done."
2. "Open `shaders/sky.frag`. We sample two cubemaps and blend. The procedural starfield is `hash(vDir * 200.0)` — Lecture 10 procedural texture."
3. "Open `shaders/rt_demo.frag`. Lines 30–80: ray-sphere intersection, exactly Lecture 15 slide N. Line 100: shadow ray, Lecture 16. Line 110: reflection ray, also Lecture 16. The whole thing is iterative because Lecture 16 says WebGL has no recursion."
