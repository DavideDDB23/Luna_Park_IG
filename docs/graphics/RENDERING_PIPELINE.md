# RENDERING PIPELINE

> Companion to: [TECHNICAL_ARCHITECTURE](../core/TECHNICAL_ARCHITECTURE.md) · [LIGHTING_STRATEGY](LIGHTING_STRATEGY.md) · [MATERIAL_SYSTEM](MATERIAL_SYSTEM.md) · [SHADER_PLAN](SHADER_PLAN.md) · [POST_PROCESSING](POST_PROCESSING.md)

## 1. Conceptual Pipeline (mapped to Lecture 06)

```
                           ┌───────────────────────────────────┐
                           │  CPU  ─  scene graph traversal    │
                           │  per Object3D: compute world      │
                           │  matrix, frustum cull, sort       │
                           └────────────────┬──────────────────┘
                                            │
       attributes, uniforms, ELEMENT_ARRAY_BUFFER, draw calls
                                            │
                                            ▼
                           ┌───────────────────────────────────┐
                           │  Vertex shader                    │
                           │  gl_Position = P * V * M * vert   │
                           │  varying outputs to fragment      │
                           └────────────────┬──────────────────┘
                                            │
                                            ▼
                           ┌───────────────────────────────────┐
                           │  Primitive assembly + clipping    │
                           │  perspective divide → NDC         │
                           │  viewport transform → screen      │
                           └────────────────┬──────────────────┘
                                            │
                                            ▼
                           ┌───────────────────────────────────┐
                           │  Rasterizer                       │
                           │  triangle → fragments             │
                           │  attribute interpolation          │
                           │  perspective-correct              │
                           └────────────────┬──────────────────┘
                                            │
                                            ▼
                           ┌───────────────────────────────────┐
                           │  Fragment shader                  │
                           │  texture sampling                 │
                           │  lighting integration             │
                           │  shadow map sampling              │
                           │  output: vec4 fragColor           │
                           └────────────────┬──────────────────┘
                                            │
                                            ▼
                           ┌───────────────────────────────────┐
                           │  Per-fragment operations          │
                           │  depth test (z-buffer)            │
                           │  alpha blending                   │
                           │  framebuffer write                │
                           └────────────────┬──────────────────┘
                                            │
                                            ▼
                                  HDR linear framebuffer
                                            │
                                            ▼
                           ┌───────────────────────────────────┐
                           │  Post-processing chain            │
                           │  Bloom → ACES tone map → sRGB     │
                           └────────────────┬──────────────────┘
                                            │
                                            ▼
                                        canvas
```

Every named stage above corresponds to slides in Lecture 06 (GPU pipeline & WebGL); we name them deliberately so the report cross-references the syllabus.

## 2. Renderer Configuration

`new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance", stencil: false, depth: true })`

Configuration set in `App.init`:
- `renderer.setPixelRatio( Math.min(window.devicePixelRatio, 2) )` — capped to 2 to keep fillrate manageable.
- `renderer.setSize(window.innerWidth, window.innerHeight, false)` — `false` because we manage canvas CSS size separately.
- `renderer.outputColorSpace = THREE.SRGBColorSpace` — output transfer.
- `renderer.toneMapping = THREE.ACESFilmicToneMapping` — done by `OutputPass` actually; only set when bypassing the composer.
- `renderer.toneMappingExposure = 1.0`.
- `renderer.shadowMap.enabled = true` (from M6 onward).
- `renderer.shadowMap.type = THREE.PCFSoftShadowMap`.
- Linear depth not required (`renderer.logarithmicDepthBuffer = false`); the scene is shallow enough.

## 3. Frame Pass Layout

| # | Pass | Render target | Notes |
| --- | --- | --- | --- |
| 0 | Shadow map render | `light.shadow.map` (depth only) | once per frame for the directional light only (point/spot lights do not cast shadows in our scene to save fillrate) |
| 1 | Main forward render | composer's `WriteBuffer` (HDR `RGBA16F`) | scene with all materials and lights |
| 2 | Bloom (3 sub-passes) | half-res mip pyramid | UnrealBloomPass: bright-pass → Gaussian → composite |
| 3 | Output pass | canvas | ACES tone-map + sRGB encode |

In `?fast` mode (mobile fallback): passes 2 and 3 are replaced by a direct LDR forward render (no composer). The ACES tonemap is then handled by the renderer's own toneMapping setting.

## 4. Forward vs Deferred — Decision

Three.js's default is **forward rendering**, multipass for lights. For our scene:

- Number of dynamic lights: ≤ 18 (1 directional + 12 point lampposts + 4 ride neon points + 1 spot stage).
- Forward cost: O(lights × pixels-shaded × triangles).
- Deferred (custom): O(pixels × lights), better for many lights, but Three.js does not ship a deferred path natively and reimplementing one is out of scope.

**Decision: forward.** Most lights are **range-clipped**: lampposts use `distance: 14`, ride neons `distance: 8` — the fragment shader early-exits when the fragment is outside the influence sphere, so per-fragment cost is bounded. Audit shows < 4 active lights in the per-fragment loop for the average pixel.

## 5. Sorting

Three.js auto-sorts opaque vs transparent meshes:
- opaque list: front-to-back to maximize early-z benefit
- transparent list: back-to-front, painter-style (Lecture 14)

Cyclic-overlap pathology (Lecture 14) is avoided because the only transparent meshes are:
- frangiated tarp edges on food stands (alpha-tested, treated as opaque-with-discard)
- atmospheric haze billboard around the central stage (small, isolated)
- particle systems if shipped (additive blend, sort-independent)

Therefore no painter's-algorithm bug can manifest.

## 6. Z-Buffer & Precision

- `near = 0.1`, `far = 500` — ratio 5000, well within 24-bit depth precision for our scene scale.
- We do NOT enable `logarithmicDepthBuffer` since the scene is shallow.
- Coplanar geometries (decals on the ground, sign faces on posts) are nudged 0.001 m to avoid z-fighting.

## 7. Alpha & Blending Modes (Lecture 03)

| Surface | Blend mode | Notes |
| --- | --- | --- |
| Skybox | opaque | drawn first, depth disabled |
| Ground / paths | opaque | |
| Buildings / props | opaque | |
| Tarp edges (food stands) | alpha-tested | `material.alphaTest = 0.5`, no transparency cost |
| Neon glow billboards (optional) | additive | `THREE.AdditiveBlending` |
| Bloom intermediate | additive | inherent to the pass |
| Fireworks particles (stretch) | additive | sort-independent |

Reference: Lecture 03 covers additive/multiplicative/screen modes — the report uses our scene's three blend modes as examples.

## 8. Anti-Aliasing Plan

- **Primary**: browser-provided **MSAA** via `antialias: true` on the WebGLRenderer. On most desktop GPUs this gives 4× MSAA.
- **Bloom + tonemap path**: when post is on, MSAA is disabled (because we render to a non-MSAA float target). We compensate with `FXAA` as the last pre-output pass in the composer.
- **`?aa=ssaa` flag**: doubles render resolution and lets the OutputPass downsample. Used for screenshots and the demo video only.

Reference: Lecture 14 (SSAA, MSAA).

## 9. Visibility

- **Z-buffer rasterization** is the only visibility algorithm at runtime (Lecture 14).
- **Painter's algorithm** is *referenced* in the report as the alternative, with the cyclic-overlap diagram redrawn.
- **A-buffer / order-independent transparency** is referenced only — we do not need it.

## 10. Color Management

We follow the modern Three.js linear workflow:
- albedo textures: `texture.colorSpace = SRGBColorSpace` (treated as sRGB on sample, decoded to linear in-shader)
- normal, roughness, metalness, AO maps: `texture.colorSpace = NoColorSpace` (treated as data)
- HDR cubemap: `texture.colorSpace = LinearSRGBColorSpace`
- final output: ACES tonemap → sRGB encode → 8-bit canvas

Misconfiguration of color space is a top-cause of "washed-out" or "too-dark" assets and a likely common-mistake the professor sees from other students. We commit to this convention in [MATERIAL_SYSTEM](MATERIAL_SYSTEM.md) §4.

## 11. Shader Source Strategy

We rely on Three.js built-in shaders (`MeshStandardMaterial`, `MeshPhongMaterial`) for **all** lit geometry. The reasons:

1. Performance: hand-rolled equivalents are slower and bug-prone.
2. Maintenance: updates to Three.js automatically improve our lighting.
3. The pipeline documentation in [SHADER_PLAN](SHADER_PLAN.md) describes the GLSL of these shaders at a level sufficient for the report.

We add **one custom `ShaderMaterial`** for the neon sign (Lecture 06 hook) and **one full-screen-quad fragment-shader ray tracer** (Lecture 15 hook). These are the only two custom shaders.

## 12. Render Loop Pseudocode

```
function frame(now):
    dt = clamp(now - lastNow, 0, 1/30)
    inputRouter.beginFrame()
    hud.applyPendingChanges()
    cameraRig.update(dt)
    TWEEN.update(now)
    for ride in rides: ride.update(dt, clock)
    dayNight.update(dt)
    flicker.update(dt)
    visitors.update(dt)
    composer.render()    // or renderer.render(scene, cam) if !post
    inputRouter.endFrame()
    requestAnimationFrame(frame)
```

## 13. Per-Frame Budget (target 1080p baseline laptop)

| Phase | Budget (ms) | Mitigation if over |
| --- | --- | --- |
| Input + state update | 1 | profile loop |
| Tweens | 0.5 | reduce active tweens |
| Ride updates | 1 | precompute Frenet frames; cache |
| Day/Night update | 0.3 | run every 4th frame for sky |
| Scene traversal + matrix updates | 2 | reduce dynamic objects |
| Shadow pass | 3 | shrink shadow map / area |
| Forward main pass | 6 | LOD, instancing |
| Bloom + Output | 2.5 | drop bloom on `?fast` |
| Slack / variance | 0.5 | — |
| **Total** | **16.6** | (target 16.6 ms = 60 fps) |

If the median frame exceeds 16.6 ms after M6, the priority is: drop bloom on `?fast` (saves 2 ms), shrink shadow map to 1024 (saves ~1.5 ms), instance lampposts (saves ~1 ms). See [PERFORMANCE_OPTIMIZATION](PERFORMANCE_OPTIMIZATION.md) §6 for the full triage matrix.

## 14. Cross-References

- Light contribution math: [LIGHTING_STRATEGY](LIGHTING_STRATEGY.md)
- Material slot mapping: [MATERIAL_SYSTEM](MATERIAL_SYSTEM.md)
- Specific shader code plan: [SHADER_PLAN](SHADER_PLAN.md)
- Post chain detail: [POST_PROCESSING](POST_PROCESSING.md)
- Why these choices help the grade: [EVALUATION_STRATEGY](../evaluation/EVALUATION_STRATEGY.md) §3
