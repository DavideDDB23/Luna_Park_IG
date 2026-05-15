# MODEL LIST

> Companion to: [ASSET_PIPELINE](ASSET_PIPELINE.md) · [TEXTURE_LIST](TEXTURE_LIST.md) · [SCENE_STRUCTURE](../graphics/SCENE_STRUCTURE.md) · [SOURCED_MODELS](SOURCED_MODELS.md)

> 📌 **Concrete download URLs** for every asset below — Sketchfab CC-BY picks plus Kenney / Quaternius CC0 bundles — are listed in [SOURCED_MODELS](SOURCED_MODELS.md).

This is the **authoritative inventory** of every 3D model. Each row is one asset (or instanceable group). The team must fill the source URL and the author/license at acquisition time and update the table.

## Legend

- **Strategy** — Custom (C) / Kitbash (K) / Download (D) / Procedural (P).
- **Triangle budget** — soft target; deviations require a note.
- **UVs** — Required / Already-good / N/A (procedural).
- **Maps** — texture channels expected (see [TEXTURE_LIST](TEXTURE_LIST.md) for the full per-texture spec).
- **Collision** — N/A everywhere (we don't simulate collisions).
- **LOD** — see column for # of LOD levels.
- **Animation compat** — must inherit Three.js Object3D so parent-child works.

## 1. Ride Models

### 1.1 Ferris wheel parts

| Part | Strategy | Tri budget | UVs | Maps | LODs | Source / Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Hub (drum) | C | 600 | required | color, normal, MRA | 1 | model in Blender; pivot at center |
| Arm (radial bar) | C | 200 | required | color, normal, MRA | 1 | instanced 8× |
| Gondola shell | C or D | 2000 | required | color, normal, MRA | 2 (1000, 400) | start custom; if D from Kenney's "Carnival" pack, re-pivot |
| Gondola seat bench | C | 300 | required | color, normal | 1 | tucked inside shell |
| Support struts | C | 400 | required | color, normal, MRA | 1 | two angled cylinders |

Best sources: **Kenney** for the gondola if downloaded (`kenney.nl/assets/holiday-kit`); otherwise model in Blender (45 min for the gondola).

### 1.2 Carousel parts

| Part | Strategy | Tri budget | UVs | Maps | LODs | Source / Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Platform (octagonal) | C | 400 | required | color, normal | 1 | octagonal cylinder |
| Decorated canopy | C | 1200 | required | color, normal | 1 | striped tent with scallop edge |
| Vertical pole | C | 80 | required | color, normal | 1 | instanced 8× |
| Horse | D | 3000 (LOD0) / 1000 (LOD1) / 400 (LOD2) | already good | color, normal, specular | 3 | **Quaternius** Animated Animals — strip animations on import! we use the static pose |
| Jockey (rider) | D | 1500 / 500 / 200 | already good | color, normal | 3 | **Kenney** Animated Characters (static pose) |

The horse model is the **single most aesthetic asset**. Spend 30 minutes verifying it reads well from camera distance.

### 1.3 Roller coaster parts

| Part | Strategy | Tri budget | UVs | Maps | LODs | Source / Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Rail | P | up to 6000 (TubeGeometry) | n/a | color (procedural metal) | 1 | procedural from Catmull-Rom |
| Rail tie | P | 80 each × ~80 | n/a | color, normal | 1 | instanced from a single mesh sampled along curve |
| Support post | P | 60 each × ~30 | n/a | color, normal | 1 | sampled along curve |
| Cart chassis | C | 800 | required | color, normal, MRA | 1 | small open-roofed car |
| Cart seat | C | 200 | required | color, normal | 1 | instanced 4× |
| Passenger | D | 1500 / 500 / 200 | already good | color, normal | 3 | reuse the visitor model |

### 1.4 Tagada parts

| Part | Strategy | Tri budget | UVs | Maps | LODs | Source / Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Base ring | C | 600 | required | color, normal, MRA | 1 | thick disk with bolts |
| Arm 1 | C | 400 | required | color, normal, MRA | 1 | rectangular truss |
| Arm 2 | C | 300 | required | color, normal, MRA | 1 | shorter truss |
| Seat platform (rotating) | C | 800 | required | color, normal, MRA | 1 | octagonal disc with seats around perimeter |
| Seat | C | 200 | required | color, normal | 1 | instanced 8× |

## 2. Park Props

| Asset | Strategy | Tri budget | UVs | Maps | LODs | Source / Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Lamppost | C or K | 500 | required | color, normal, MRA | 1 | pole + lamp head; instanced ×12 |
| Bench | D | 400 / 150 | already good | color, normal | 2 | **Quaternius** Park kit |
| Tree (canopy + trunk) | D | 800 / 300 / billboard | already good | color, normal, alphaMap on canopy | 3 | **Quaternius** Nature kit |
| Food stand | K | 1200 | required | color, normal, alpha (tarp) | 1 | box base + tarp roof + small sign |
| Performance stage | C | 800 | required | color, normal | 1 | flat platform with backdrop |
| Fence post | P | 60 each × ~50 | n/a | color, normal | 1 | instanced |
| Sign (welcome arch) | C | 500 | required | color, normal, emissive | 1 | arch at park entry with neon trim |
| Trash bin | D | 300 | already good | color, normal | 1 | Quaternius |
| Speakers/poles (optional) | D | 200 | already good | color, normal | 1 | only if stage gets close-ups |
| RT-demo billboard | C | 50 | required | rendered procedurally | 1 | quad with the rt_demo shader |

## 3. Characters

| Asset | Strategy | Tri budget | UVs | Maps | LODs | Source / Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Visitor body | C | 1500 / 600 / 250 | required | color, normal | 3 | low-poly capsule body + sphere head + 4 limb meshes parented |
| Visitor variants | C | as above | required | color (variants) | 3 | 4 color variants for crowd diversity |

Even though Kenney's character pack ships great rigs, we **explicitly model our own visitor** to keep the **no-imported-animations** rule airtight: we know there's no skeleton, no clips, no fluff. The visitor is a tiny model (~30 minutes of Blender work).

## 4. Procedural Geometry (no `.glb` file)

These exist only in code:

| Geometry | Generator | Notes |
| --- | --- | --- |
| Ground plane | `PlaneGeometry(240, 240)` | with material `mat.ground.grass` |
| Path overlay | `PlaneGeometry(...)` + spline-following decals | drawn on top of ground |
| Skybox cube | `BoxGeometry(500,500,500)`, inverted | with `mat.sky` |
| Rail (coaster) | `TubeGeometry(curve, 200, 0.15, 8, true)` | one mesh per rail |
| Coaster tie/post placement | sample `curve.getPointAt(u)` at 80 uniformly-spaced `u` | InstancedMesh |
| Lamppost grid | hand-placed positions in code; instances written once | InstancedMesh |
| Fence ring | sampled along the park perimeter | InstancedMesh |
| RT-demo quad | `PlaneGeometry(1.5, 1.0)` | one mesh |

## 5. Topology Requirements (universal)

- **Triangles only** (export with triangulation). Three.js handles n-gons but the export pipeline normalizes them.
- **Watertight** is not required — we don't simulate; visibility is just rasterization.
- **Vertex normals smooth** by default, sharp edges authored via a 30° auto-smooth angle in Blender.
- **No degenerate triangles** (Blender's "Clean Up → Delete Loose" before export).
- **Vertex count of ride meshes** kept < 12 k cumulative per ride.

## 6. Pivot & Origin Convention

- **Ferris wheel hub**: origin at center of rotation.
- **Carousel platform**: origin at center on the ground plane.
- **Carousel horse**: origin at the bottom of the pole hole so `position.y = 0` sits the horse on the pole top.
- **Roller coaster cart**: origin at the cart's center of mass — the wheels touch the rail at y = 0.
- **Tagada base**: origin at the floor center.
- **Lamppost**: origin at the base of the pole.
- **Visitor**: origin between the feet.

Pivot errors cause the most visible bugs (a horse hovers above its pole; an arm rotates around its end). The verification step in [ASSET_PIPELINE](ASSET_PIPELINE.md) §6 catches them.

## 7. Texture-Resolution Recommendations

| Asset | Resolution |
| --- | --- |
| Ground (tileable) | 2048² |
| Ride structures | 2048² for marquee parts; 1024² for small parts |
| Horse | 1024² |
| Visitor | 512² (small on screen) |
| Lamppost | 512² (small) |
| Trees | 1024² color + 1024² normal |
| Stands | 1024² |
| Cubemaps | 1024² per face for day; 512² for night |

Choices favor file size; we are not making 4K screenshots.

## 8. Collision Mesh Requirements

**None used at runtime.** The project has no physical collisions:
- The roller-coaster cart follows a curve (not collision-driven).
- Visitors walk on a precomputed graph.
- The user's camera is clamped above ground, not collided.

If Cannon-es is added (stretch goal R4), the cart needs a simplified collision shape — a box ~`cart.size * 0.9`. The track becomes a series of static "rail bumpers". This is documented in [RISK_ANALYSIS](../workflow/RISK_ANALYSIS.md).

## 9. Optimization Constraints

- Total triangle budget: < 250 k triangles in the scene at peak LOD.
- Total material count: < 30 distinct materials.
- Total texture memory: < 200 MB.
- Each model file: < 2 MB (`.glb` after Draco compression).

A `tools/audit-scene.js` script tallies post-load metrics and refuses to commit if any of the above are exceeded.

## 10. Style Consistency Audit

For each downloaded asset, the team must approve:
- color saturation ≥ 60 % at peak channel
- silhouette is readable at 30 m distance
- no realistic photographic textures clashing with the cartoon shading

The audit is performed via a side-by-side "style check" screenshot, committed to `assets/moodboard/style_check.png`.
