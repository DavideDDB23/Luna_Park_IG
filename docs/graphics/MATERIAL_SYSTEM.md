# MATERIAL SYSTEM

> Companion to: [LIGHTING_STRATEGY](LIGHTING_STRATEGY.md) · [TEXTURE_LIST](../assets/TEXTURE_LIST.md) · [SHADER_PLAN](SHADER_PLAN.md) · [ASSET_PIPELINE](../assets/ASSET_PIPELINE.md)

This document defines the **closed set of named materials** used in the scene, the shader model behind each, the texture channels each one binds, and the rules every developer must follow when introducing a new material.

## 1. Goals & Constraints

- The course requires **textures of multiple kinds** (color, normal, specular, etc.). We exceed this requirement: every primary material binds **at least 3** texture channels; the flagship materials bind **5**.
- The course requires materials to interact with lights. We use Three.js's built-in `MeshStandardMaterial` (microfacet/GGX, "PBR") and `MeshPhongMaterial` (Blinn–Phong) — both **lit** by the scene's lights.
- The report will narrate the choice of BRDF per material, with screenshots. The professor can then ask "why Phong on the horses?" and the team has an answer ready (Lecture 11/13 vocabulary).

## 2. Shader Model Decision Matrix

| Material family | Shader | Justification |
| --- | --- | --- |
| Metal structures (rides, lamppost poles) | `MeshStandardMaterial` (Blinn-style microfacet, PBR) | metallic surfaces need physically-correct specular response and respond to environment map |
| Painted wood (carousel, stand fronts) | `MeshStandardMaterial` | wood with painted varnish reads better with PBR roughness map |
| Horses (carousel) | `MeshPhongMaterial` | stylized cartoon look; Phong's separable diffuse+specular suits the painted-plaster aesthetic |
| Fabric (food-stand tarps, banners) | `MeshStandardMaterial` (high roughness) | low specular, slight cloth normal |
| Ground (grass, paths) | `MeshStandardMaterial` | metalness 0, roughness map for moisture variation |
| Sky | custom skybox shader (see [SHADER_PLAN](SHADER_PLAN.md) §4) | day/night blend |
| Neon signs | custom `ShaderMaterial` (see [SHADER_PLAN](SHADER_PLAN.md) §3) | emissive + bloom hook, animated |
| Easter-egg RT billboard | custom fragment-shader ray-tracer (Lecture 15) | proof of pipeline mastery |

The decision is **explicit** in the report: "MeshStandardMaterial implements a GGX/Smith microfacet BRDF, which Lecture 13 describes as a physically-based BRDF. MeshPhongMaterial implements the Blinn–Phong reflection (half-vector form) — Lecture 11 — which is non-energy-conserving and parameterized by diffuse Kd, specular Ks, and shininess α."

## 3. Named Material Library (`materials/MaterialLibrary.js`)

Each entry below specifies: name, shader, texture slots, key parameters, and which meshes use it.

### 3.1 `mat.metal.painted`

- Shader: `MeshStandardMaterial`
- Slots:
  - `map` → `metalPainted_basecolor.webp` (sRGB)
  - `normalMap` → `metalPainted_normal.png` (linear, OpenGL)
  - `metalnessMap` + `roughnessMap` + `aoMap` packed → `metalPainted_mra.png` (B=metalness, G=roughness, R=AO)
- Params: `metalness=1.0` (driven by map), `roughness=1.0` (driven by map), `envMapIntensity=0.6`
- Used by: Ferris wheel structure, Tagada arm joints, roller-coaster rails, lamppost pole.

### 3.2 `mat.wood.varnished`

- Shader: `MeshStandardMaterial`
- Slots: `map`, `normalMap`, `roughnessMap`
- Params: `metalness=0.0`, `roughness=1.0` (driven by map), `envMapIntensity=0.4`
- Used by: carousel pole bases, food-stand counters, signposts.

### 3.3 `mat.horse.painted`

- Shader: `MeshPhongMaterial`
- Slots: `map`, `normalMap`, `specularMap`
- Params: `shininess=80`, `specular=#aaaaaa`, `flatShading=false`
- Used by: carousel horses, jockeys.
- Report note: "Phong shading (Lecture 12) computes lighting per-fragment with interpolated normals from the vertex shader — visible in the smooth highlight that travels along the horse's flank as the platform rotates."

### 3.4 `mat.fabric.striped`

- Shader: `MeshStandardMaterial`
- Slots: `map`, `normalMap`, `alphaMap`
- Params: `metalness=0`, `roughness=0.85`, `side=DoubleSide`, `transparent=false`, `alphaTest=0.5`
- Used by: food-stand tarps with frangiated edges, ride banners.
- Alpha test (not alpha blend) keeps the pass opaque (avoids the Lecture-14 painter's-algorithm trap).

### 3.5 `mat.ground.grass`

- Shader: `MeshStandardMaterial`
- Slots: `map`, `normalMap`, `roughnessMap`, `aoMap`
- Params: `metalness=0`, repeat `(40, 40)` on the 240 m plane to hide the tile
- Anisotropic filtering: `texture.anisotropy = renderer.capabilities.getMaxAnisotropy()`
- Used by: ground.

### 3.6 `mat.ground.asphalt`

- Shader: `MeshStandardMaterial`
- Slots: `map`, `normalMap`, `roughnessMap`
- Params: `metalness=0`, slight `clearcoat=0.05` to suggest wet patches (optional via stretch)
- Used by: paths.

### 3.7 `mat.sky`

- Shader: custom `ShaderMaterial`
- Slots: `uDayMap` (samplerCube), `uNightMap` (samplerCube), `uNightAmount` (float)
- See [SHADER_PLAN](SHADER_PLAN.md) §4.

### 3.8 `mat.neon`

- Shader: custom `ShaderMaterial`
- Slots: `uColor` (vec3), `uTime` (float), `uIntensity` (float), `uEmissiveMap` (sampler2D)
- See [SHADER_PLAN](SHADER_PLAN.md) §3. Fed by HUD color picker.

### 3.9 `mat.emissive.window`

- Shader: `MeshStandardMaterial`
- Slots: `map`, `emissiveMap`
- Params: `emissive=#ffe2a0`, `emissiveIntensity=2.0` at night, 0 in day (controlled by `DayNight`)
- Used by: stand windows, fairy-light strings.

### 3.10 `mat.signal.red` / `mat.signal.green`

- Shader: `MeshBasicMaterial` (intentionally unlit — they read regardless of time of day)
- Slots: none; pure colored emissive material with `color=#ff2a2a` or `#23d36a`
- Used by: the signal sphere on each control panel.

### 3.11 `mat.placeholder.magenta`

- Shader: `MeshStandardMaterial({ color: 0xff00ff })`
- Used by: fallback for any missing GLTF or texture. Loud magenta is intentional — the team sees missing assets immediately.

## 4. Texture-Loading Conventions

All textures are loaded via the centralized `AssetLoader`, never inline. Conventions:

```
Color-encoded (interpreted in sRGB):
  basecolor, emissive    → texture.colorSpace = THREE.SRGBColorSpace

Data-encoded (interpreted linearly):
  normal, roughness,     → texture.colorSpace = THREE.NoColorSpace
  metalness, AO,
  packed MRA, alphaMap

Filtering:
  texture.minFilter      = THREE.LinearMipmapLinearFilter
  texture.magFilter      = THREE.LinearFilter
  texture.generateMipmaps = true

Wrapping:
  default: THREE.RepeatWrapping
  decals and panels: THREE.ClampToEdgeWrapping

Anisotropy (ground/asphalt only):
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy()
```

## 5. Emissive & Bloom Coupling

Bloom (UnrealBloomPass) is keyed on luminance above threshold 0.85. To make a surface "glow at night", we modulate `emissiveIntensity` from 0 (day) to 2.0+ (night). The `DayNight.update()` function recomputes a `nightAmount ∈ [0,1]` and writes the corresponding intensity onto every material in a registered "emissive-night-materials" set. The set is populated by `MaterialLibrary` on material creation.

## 6. Anisotropy & Filtering Discussion (report hook)

The asphalt path is the strongest visual case for anisotropic filtering: viewed at a grazing angle, isotropic filtering smears it visibly, while anisotropic preserves the texture detail. The report includes a side-by-side comparison at anisotropy = 1, 4, 16, demonstrating Lecture 09's filtering discussion in a screenshot.

## 7. Material Creation Workflow

Whenever a new mesh is added:

1. Identify which existing named material fits. Reuse instead of inventing.
2. If no existing material fits, define a new entry in `MaterialLibrary` with the same shape as the entries above.
3. Add the entry's textures to [TEXTURE_LIST](../assets/TEXTURE_LIST.md).
4. Note the material in [SCENE_STRUCTURE](SCENE_STRUCTURE.md) §3 for the mesh in question.
5. Run a Lighthouse/manual perf check — adding a material with multiple maps adds GPU memory; the budget is in [PERFORMANCE_OPTIMIZATION](PERFORMANCE_OPTIMIZATION.md).

## 8. Resource Deduplication

`ResourceCache` keeps a Map<materialKey, Material> so that adding the 12th lamppost does not allocate 12 copies of the same material. Same for geometries that are reused across instances (lamppost pole, bench).

## 9. Disposal Rules

- Materials are NEVER disposed at runtime in this project (the scene is static after init).
- On `App.dispose()` (page unload), the library recursively disposes every cached material and texture.

## 10. Lecture Anchors

For each named material, the team has a one-liner ready:

- **`mat.metal.painted`**: "PBR microfacet model (Lecture 11/13), responds to the environment map; the metalness/roughness packing minimizes texture fetches per Lecture 10."
- **`mat.horse.painted`**: "Blinn–Phong with a half-vector specular (Lecture 11). We chose Phong because the horse is a stylized, non-physical surface; energy conservation does not matter here."
- **`mat.fabric.striped`**: "Alpha-tested rather than alpha-blended — Lecture 14's painter's-algorithm pathology is avoided by treating the pass as opaque-with-discard."
- **`mat.ground.grass`**: "Anisotropic filtering at the GPU's maximum (Lecture 09). The trilinear fall-back is documented in the report with comparison screenshots."
