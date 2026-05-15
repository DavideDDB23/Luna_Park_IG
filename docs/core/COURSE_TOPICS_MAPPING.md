# COURSE TOPICS MAPPING

> Companion to: [PROJECT_OVERVIEW](PROJECT_OVERVIEW.md) · [EVALUATION_STRATEGY](../evaluation/EVALUATION_STRATEGY.md) · [FINAL_REPORT_OUTLINE](../deliverables/FINAL_REPORT_OUTLINE.md)

A **lecture-by-lecture audit** that links each topic from the course slides to a concrete element of the Luna Park 3D project. The audit serves three purposes:

1. **Coverage proof**: convinces the grader that every part of the syllabus is exercised.
2. **Talking-point inventory**: pre-loads the team with the exact vocabulary the professor uses, so the oral defense uses his terminology.
3. **Report skeleton**: the final report mirrors this table.

> Conventions: **Core** = the project's main visible behaviour relies on it; **Demonstrated** = the project shows it explicitly somewhere; **Referenced** = the report describes it conceptually with code-level evidence.

## Lecture 03 — Raster Images

| Course concept | Project manifestation | Level |
| --- | --- | --- |
| Pixels, RGB cube, bit depth | The canvas backbuffer is RGBA8; tone-mapped from linear-float to sRGB at the output pass | Demonstrated |
| Gamma correction, sRGB 2.2 | `renderer.outputColorSpace = SRGBColorSpace`; every albedo texture is loaded with `texture.colorSpace = SRGBColorSpace`, every normal/specular is loaded as `NoColorSpace` | Core |
| Alpha blending (additive, multiplicative, screen) | Bloom uses additive blend over the lit pass; fairground signs use **additive** material for glow | Demonstrated |
| Image formats (PNG/JPG/HDR) | Color maps in WebP or PNG; HDR cubemap for sky uses `.hdr` via `RGBELoader` | Demonstrated |
| Multi-channel storage | Roughness-Metalness-AO packed into one RGB texture to save fetches | Demonstrated |

See [TEXTURE_LIST](../assets/TEXTURE_LIST.md) §3 for the packing convention.

## Lecture 04 — 2D Transformations

| Course concept | Project manifestation | Level |
| --- | --- | --- |
| Translation, rotation, scale matrices | Every Three.js `Object3D.position/rotation/scale` is internally a TRS matrix | Core |
| Homogeneous coordinates | The Three.js `Matrix4` API uses 4×4 homogeneous matrices throughout | Core |
| Matrix composition / pipeline collapse | The HUD's screen-space color picker uses a 2D `Matrix3` to map mouse → picker UV | Demonstrated |
| Coordinate frames | Each ride defines a local frame; child meshes are authored in that local frame | Core |

## Lecture 05 — 3D Transformations

| Course concept | Project manifestation | Level |
| --- | --- | --- |
| 4×4 matrices, right-hand rule | Default Three.js convention | Core |
| Rotation around arbitrary axis | The Tagada arm uses a `Quaternion.setFromAxisAngle` for its tilted secondary arm | Demonstrated |
| Euler angles | Used for ride initialization and for FPV gondola orientation | Core |
| Model/World/View space transitions | The FPV gondola camera proves the chain: model (gondola) → world (park) → view (camera attached) | Demonstrated |
| Perspective projection, frustum, near/far | `PerspectiveCamera(fov=55, near=0.1, far=500)`; near tuned to avoid clipping when inside gondola | Core |
| Orthographic projection | Used for the small minimap overlay (stretch goal) | Referenced |
| NDC, viewport transform | The raycaster converts pointer event to NDC: `((x/w)*2-1, -(y/h)*2+1, 0.5)` | Core |

## Lecture 06 — GPU Pipeline & WebGL

| Course concept | Project manifestation | Level |
| --- | --- | --- |
| Graphics pipeline overview | Documented end-to-end in [RENDERING_PIPELINE](../graphics/RENDERING_PIPELINE.md) | Core |
| Vertex / fragment / rasterizer stages | A custom `ShaderMaterial` for the neon sign demonstrates each stage explicitly; see [SHADER_PLAN](../graphics/SHADER_PLAN.md) | Demonstrated |
| GLSL: attributes, uniforms, varyings | Same custom shader uses all three qualifiers | Demonstrated |
| `gl.viewport`, canvas resize | Handled in `App.onResize` | Core |
| `gl_Position` built-in | Used by every shader; explicit in the custom neon vertex shader | Core |

## Lecture 07 — Surfaces

| Course concept | Project manifestation | Level |
| --- | --- | --- |
| Implicit surfaces | The infinite-ground plane is implicit (`PlaneGeometry` at very large size, with fog hiding the edge) | Demonstrated |
| Bezier / NURBS | The roller-coaster track is sampled from a **Catmull-Rom spline** (`CatmullRomCurve3`), discussed in the report as a cousin of NURBS | Demonstrated |
| Polygonal meshes | Every prop is a polygonal mesh | Core |
| Subdivision modeling | Performed offline in Blender for the horses and gondolas to soften silhouettes | Referenced |

## Lecture 08 — Triangular Meshes

| Course concept | Project manifestation | Level |
| --- | --- | --- |
| Triangle mesh representation | All geometries are triangle meshes | Core |
| Indexed buffers (Elements) | All loaded GLTFs use indexed geometry; we explicitly call `geometry.toNonIndexed()` only when we want flat shading | Core |
| Triangle strips / fans | Discussed in the report; the ground uses a regular grid → could be a strip (we leave it as triangle list for asset-pipeline simplicity) | Referenced |
| Barycentric coordinates | Used implicitly by the rasterizer; also used by the raycaster to compute the exact intersection point on the panel mesh | Core |
| Vertex deduplication | Asset pipeline runs `optimize` in `gltf-transform` | Demonstrated |

## Lecture 09 — Textures

| Course concept | Project manifestation | Level |
| --- | --- | --- |
| UV mapping | Every custom model is UV-unwrapped in Blender; downloaded models retain their UVs | Core |
| Texels, nearest vs bilinear filtering | Default `LinearFilter`; the pixel-art HUD icons use `NearestFilter` to stay crisp | Core |
| Mipmaps, trilinear filtering | `texture.generateMipmaps = true` for distant textures; `LinearMipmapLinearFilter` for the asphalt | Core |
| Anisotropic filtering | Enabled at `renderer.capabilities.getMaxAnisotropy()` for ground and asphalt textures | Demonstrated |
| Texture coordinates as a vertex attribute | Standard; visible in the custom neon shader's `attribute vec2 uv` | Core |
| Filtering artifact discussion | Comparison screenshots in the report at three anisotropy levels | Referenced |

## Lecture 10 — Textures on GPU

| Course concept | Project manifestation | Level |
| --- | --- | --- |
| Texture wrapping (Clamp/Repeat/Mirror) | Ground asphalt uses `RepeatWrapping`; lamppost decals use `ClampToEdgeWrapping` | Core |
| `sampler2D`, `texture2D` (now `texture()` in GLSL 3) | Used in the custom neon shader | Demonstrated |
| Multiple texture units | The custom shader binds three samplers (color, normal, emissive) on units 0/1/2 | Demonstrated |
| Procedural textures | The day/night sky is partly procedural — a fragment shader generates a star field at night | Demonstrated |
| Mipmap auto-generation | Three.js calls `gl.generateMipmap` when `generateMipmaps = true` | Core |

## Lecture 11 — Shading

| Course concept | Project manifestation | Level |
| --- | --- | --- |
| Lambertian / diffuse / Kd | `MeshStandardMaterial.color` for diffuse albedo on most surfaces | Core |
| Phong specular, Ks, α (shininess) | `MeshPhongMaterial.shininess` on stylized assets (horses, signage frames) | Core |
| Blinn–Phong (half-vector) | `MeshPhongMaterial` is Blinn–Phong in Three.js (uses half vector, not pure Phong) — explicitly noted in the report | Core |
| Ambient Ka | `AmbientLight` + `HemisphereLight` contributions | Core |
| Light types: directional/point/spot/area/IBL | All five present: Directional sun, Point lampposts, Spot stage, area approximated by hemisphere, IBL via the night HDR cubemap | Core |
| Multiple lights additive | Three.js sums lights in its lit fragment shader | Core |

See [LIGHTING_STRATEGY](../graphics/LIGHTING_STRATEGY.md) and [MATERIAL_SYSTEM](../graphics/MATERIAL_SYSTEM.md).

## Lecture 12 — Shading Transformations

| Course concept | Project manifestation | Level |
| --- | --- | --- |
| Flat / Gouraud / Phong shading | All three are documented in the report. The Tagada base intentionally uses `flatShading: true` to expose the polygons — a deliberate stylistic + pedagogical choice. Horses use Phong shading (default in `MeshPhongMaterial`). | Demonstrated |
| Per-vertex normals as area-weighted average | Computed by Blender on export; verified in the asset pipeline | Core |
| Normal matrix (inverse-transpose) | Three.js computes it automatically (`object.normalMatrix`); discussed in the report with a side-by-side screenshot of a non-uniformly scaled mesh with vs without the correction | Demonstrated |
| Shading space (world vs view) | Three.js default is view-space; explicitly stated in the custom neon shader | Core |

## Lecture 13 — The Rendering Equation

| Course concept | Project manifestation | Level |
| --- | --- | --- |
| Kajiya's rendering equation | The report's theory section restates the equation and discusses where rasterized real-time rendering approximates each term | Referenced |
| BRDFs | The choice of `MeshStandardMaterial` (GGX microfacet) is justified as a physically-based BRDF; `MeshPhongMaterial` is justified as a non-energy-conserving heuristic | Referenced |
| Geometry term (cos θ) | Visible in any directional-light contribution; explained in the report | Referenced |
| Energy conservation | Discussed in the report with a screenshot pair comparing PBR (Standard) and Phong on the same gondola | Referenced |

## Lecture 14 — Rendering Algorithms

| Course concept | Project manifestation | Level |
| --- | --- | --- |
| Rasterization vs ray tracing | Project uses rasterization; report explicitly contrasts | Core |
| Z-buffer visibility | Default in WebGL | Core |
| Painter's algorithm + cyclic overlap issue | Discussed in report | Referenced |
| Multi-Sample AA | `renderer.antialias = true` (browser MSAA when available) | Core |
| Super-Sample AA | A `?aa=ssaa` URL flag re-renders at 2× then downscales for screenshots | Demonstrated |
| Order-independent transparency / A-buffer | Discussed; we deliberately keep transparent assets minimal to avoid the limitation | Referenced |
| Hybrid rasterization + RT | Discussed in report; no runtime use | Referenced |

## Lecture 15 — Ray Tracing

| Course concept | Project manifestation | Level |
| --- | --- | --- |
| Ray = origin + direction, t parameter | Used **every frame** by the raycaster for picking | Core |
| Ray-plane / ray-triangle intersection | Three.js `Raycaster.intersectObject` uses Möller-style ray-triangle | Core |
| Bounding-volume hierarchy (BVH) | We optionally use `three-mesh-bvh` to speed up picks against the large ground; mentioned in [PERFORMANCE_OPTIMIZATION](../graphics/PERFORMANCE_OPTIMIZATION.md) | Demonstrated |
| Full-screen quad RT in fragment shader | Implemented as a tiny optional "Easter egg": a billboard at the entrance displays a 64×64 software-ray-traced sphere shader, used as a self-contained illustration. See [SHADER_PLAN](../graphics/SHADER_PLAN.md) §6. | Demonstrated |
| No recursion in WebGL → iterative | Same Easter egg implements iterative reflections | Demonstrated |

The Easter-egg shader is the single strongest "Lecture 15" hook — it lets the team confidently say in the oral: "We rasterize the main scene but we also wrote a fragment-shader ray tracer to demonstrate Lecture 15."

## Lecture 16 — Shadows and Reflections

| Course concept | Project manifestation | Level |
| --- | --- | --- |
| Shadow mapping (depth map from light) | `directionalLight.castShadow = true; renderer.shadowMap.type = PCFSoftShadowMap` | Core |
| Shadow acne, bias | `light.shadow.bias = -0.0005` tuned during M3 milestone | Core |
| Cascaded shadow maps | Not used; one big map with `light.shadow.camera.near/far/left/right` tightened on the active scene | Referenced |
| Reflection ray, Kr | The Easter-egg shader includes one iterative reflection bounce | Demonstrated |
| Imperfect reflections | The roller-coaster cart paint uses higher roughness; report calls this an "imperfect specular reflection" | Referenced |

## Lecture 17 — Sampling

| Course concept | Project manifestation | Level |
| --- | --- | --- |
| Whitted vs Monte Carlo path tracing | Discussed in report | Referenced |
| Importance sampling | Conceptually referenced; the Easter-egg RT uses cosine-weighted sampling for soft shadow (stretch goal) | Referenced |
| Soft shadows via Monte Carlo | Approximated via PCF in the rasterizer instead — report makes the connection | Referenced |
| Path tracing noise + denoising | Referenced only | Referenced |

## Lecture 18 — Computer Animations

| Course concept | Project manifestation | Level |
| --- | --- | --- |
| Frame rate (FPS) | Target 60 fps; report includes frame-budget breakdown | Core |
| Procedural animation | Every ride is procedural | Core |
| Keyframing and tweens | tween.js easings on every camera transition and ride ramp | Core |
| Ease-in / ease-out | Quadratic-in-out for camera fly, cubic-in-out for ride start/stop, sinusoidal for HUD slider feedback | Core |
| Morphing | Optional: the visitors blink mouths via morph targets (stretch) | Referenced |
| Skeletal animation, FK, IK, rigging | NOT used — we rely on parent-child Object3D hierarchies as the syllabus's introductory case of FK. Report explicitly justifies the decision (no imported animations, simpler animations match course constraints). | Referenced |
| Flocking | Visitors use a lightweight 2-rule "alignment + separation" flocking when wandering, per Lecture 18 | Demonstrated |
| Physics-based animation | Tagada arm's secondary axis uses a critically-damped spring oscillator on user toggle — bridges Lectures 18 and 19 | Demonstrated |

## Lecture 19 — Physics-based Animations

| Course concept | Project manifestation | Level |
| --- | --- | --- |
| Mass-spring system | Optional: the lamppost flags sway with a 1-D vertical spring chain (stretch goal) | Referenced |
| Explicit / semi-implicit Euler | The Tagada damped-spring uses **semi-implicit Euler** explicitly (energy-stable) | Demonstrated |
| Hooke's-law spring + damping | Tagada arm; report includes the closed-form decay envelope | Demonstrated |
| Collisions, restitution | Roller-coaster cart against the rail is constrained, not collided (curve following). If Cannon-es is used, restitution = 0 | Referenced |

## Lecture 20 — Simulation in Computer Graphics

| Course concept | Project manifestation | Level |
| --- | --- | --- |
| Rigid body simulation | Not at runtime; report references | Referenced |
| Cloth (mass-spring) | Optional: stretch-goal flags / banner cloth using vertex-grid spring mesh | Referenced |
| SPH / grid fluids | Not used | (not addressed) |
| Position-Based Dynamics | Discussed in the report as the alternative to F=ma; not used at runtime | Referenced |

## Coverage Summary Heatmap

```
Lecture                    | Core | Demo | Ref. |
03 Raster images           |  ●●  |  ●●  |      |
04 2D transformations      |  ●●● |  ●   |      |
05 3D transformations      |  ●●● |  ●   |      |
06 GPU pipeline & WebGL    |  ●●● |  ●●  |      |
07 Surfaces                |  ●   |  ●●  |  ●   |
08 Triangular meshes       |  ●●● |  ●   |  ●   |
09 Textures                |  ●●● |  ●●  |      |
10 Textures on GPU         |  ●●● |  ●●  |      |
11 Shading                 |  ●●● |  ●   |      |
12 Shading transformations |  ●●  |  ●●  |      |
13 Rendering equation      |      |      |  ●●● |
14 Rendering algorithms    |  ●●  |  ●   |  ●●  |
15 Ray tracing             |  ●●  |  ●●  |  ●   |
16 Shadows + reflections   |  ●●  |  ●   |  ●   |
17 Sampling                |      |      |  ●●● |
18 Computer animations     |  ●●● |  ●●  |  ●   |
19 Physics-based animation |  ●   |  ●   |  ●●  |
20 Simulation in CG        |      |      |  ●●  |
```

Every lecture is at least Referenced. Eleven of eighteen are Core. The strategy gives the professor unmistakable evidence of mastery on the practical lectures (04–12, 18) while the theoretical lectures (13, 17, 19–20) are addressed through the report and the Easter-egg shader.

## What to Say in the Oral

For each lecture, the team has **one rehearsed sentence**. The full script lives in [PRESENTATION_STRATEGY](../evaluation/PRESENTATION_STRATEGY.md). Examples:

- **L05**: "Every gondola is parented to a radial arm; its counter-rotation is a simple `quaternion.invert()` of the parent — the canonical example of hierarchical 3D transformations."
- **L11**: "Horses use Phong because the cartoon look matters more than energy conservation; metal rides use PBR because we want plausible specular response to the moving sun."
- **L16**: "Shadow bias was tuned to −0.0005; below that we get peter-panning, above we get acne — both visible in our debug screenshots."
- **L18**: "Every animation in this project is JS-driven; no GLTF clip is imported. The carousel horses use a phase-offset sine wave; the wave is exactly the pattern in the slides."
