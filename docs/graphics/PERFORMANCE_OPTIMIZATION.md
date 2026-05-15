# PERFORMANCE OPTIMIZATION

> Companion to: [RENDERING_PIPELINE](RENDERING_PIPELINE.md) · [SCENE_STRUCTURE](SCENE_STRUCTURE.md) · [POST_PROCESSING](POST_PROCESSING.md) · [TESTING_STRATEGY](../workflow/TESTING_STRATEGY.md)

## 1. Targets

| Tier | Hardware | Resolution | Target fps | Min fps |
| --- | --- | --- | --- | --- |
| **Baseline** | 2020+ laptop, integrated Iris Xe | 1920 × 1080 | 60 | 55 |
| **Discrete** | 2020+ desktop, GTX 1660 or better | 1920 × 1080 | 120 | 90 |
| **Mobile** | 2022+ mid-range Android (e.g., SD 7-gen 1) | 1280 × 720 | 30 | 25 |
| **Low** | older laptop, Intel HD 620 | 1280 × 720 | 30 | 22 |

Quality drops automatically on `?fast` and `?mobile`. The user is not surprised — performance comes first, prettiness second.

## 2. Frame Budget at 60 fps

(also in [RENDERING_PIPELINE](RENDERING_PIPELINE.md) §13)

| Bucket | Budget (ms) | Knob if over |
| --- | --- | --- |
| CPU update | 4.0 | reduce dynamic objects |
| Shadow pass | 3.0 | shrink shadow map, narrow bounds |
| Main forward pass | 6.0 | LOD, instancing, draw call merge |
| Bloom + Output | 2.5 | disable post |
| Slack | 1.1 | — |
| **Total** | **16.6** | |

## 3. Draw-Call Budget

Goal: ≤ 200 draw calls per frame in the final scene.

| Source | Draw calls (target) |
| --- | --- |
| Ground + paths + sky | 3 |
| Ferris wheel (multiple meshes, batched by material) | ~12 |
| Carousel | ~10 |
| Roller coaster (rails, ties, posts, cart, passengers) | ~12 |
| Tagada (4 nested links + seats) | ~8 |
| Lampposts (instanced) | 2 (mesh + light updates) |
| Stands (6 stands × ~3 materials each) | ~18 |
| Trees / benches / fence (instanced) | 4 |
| Control panels (4 × 4 meshes) | 16 |
| Visitors (per-instance or instanced) | up to 15 |
| Stage + spotlight cone | 4 |
| Sky shader | 1 |
| Neon shader meshes | 8 |
| HUD overlays (not on canvas) | 0 |
| **Total** | **~113** |

Plus shadow-pass duplication of opaque draws (estimated +60). Total per frame ≈ **170–180 draw calls**, well under 200.

## 4. Instancing Plan

`THREE.InstancedMesh` for any repeated mesh ≥ 4 instances:

| Mesh | Instances | Notes |
| --- | --- | --- |
| Lamppost | 12 | one InstancedMesh; transforms set once |
| Fence post | ~50 | placed procedurally around the park |
| Bench | 6 | shared geometry, shared material |
| Tree | 8 | one mesh; foliage uses alpha-test, so the instanced mesh is in the opaque pass |
| Coaster cross-tie | ~80 | sampled along curve |
| Coaster support post | ~30 | sampled along curve |

Each saves O(instances) draw calls and matrix uploads. The CPU only re-uploads instance matrices when something changes — lampposts never move, so they're written once at boot.

## 5. Frustum & Distance Culling

- Three.js does **frustum culling** automatically per object. Verified by attaching a `BoundingSphere` to each ride root.
- The scene is small enough that distance culling adds little; we skip it.
- Outside the park, the only object is the skybox — drawn last with depth disabled.

## 6. LOD Strategy

Three meshes use Level-of-Detail (`THREE.LOD`):

| Mesh | LOD 0 (high) | LOD 1 (mid) | LOD 2 (low) | Switch distances |
| --- | --- | --- | --- | --- |
| Carousel horse | 6–8 k triangles | 2 k | 600 (silhouette only) | 25 m, 60 m |
| Visitor model | 1.5 k | 600 | 250 | 20 m, 40 m |
| Tree | 800 (with leaves) | 300 | billboard quad | 30 m, 70 m |

We do NOT LOD the ride structures themselves — they're the focus of the scene and the camera tends to stay close.

## 7. Mobile / Low-End Fallback

`?mobile` (auto-detected from `navigator.userAgent` containing `Mobile`, or forced):
- shadow map 512 × 512 (or off)
- bloom disabled
- environment map disabled (uses flat hemisphere only)
- post-processing chain bypassed
- max device pixel ratio 1.5
- visitors halved (8 instead of 15)
- ride neon flicker disabled (saves uniform uploads)

`?fast` (manual): same as mobile but on desktop, for quick iteration.

## 8. Texture Memory Budget

Conservative budget: 200 MB GPU memory across all textures.

| Asset class | Resolution | Channels | Compressed size | Count | Total |
| --- | --- | --- | --- | --- | --- |
| Albedo (rides, ground) | 2048² | RGB | 4 MB | 8 | 32 MB |
| Normal | 2048² | RGB | 4 MB | 8 | 32 MB |
| MRA packed | 2048² | RGB | 4 MB | 6 | 24 MB |
| Cubemap day/night | 1024² × 6 | RGBA16F | 48 MB | 2 | 96 MB |
| Decals / signs | 512² | RGBA | 0.5 MB | 12 | 6 MB |
| **Total** | | | | | **~190 MB** |

On mobile we substitute 1024² albedo/normal versions, halving each (saves ~50 MB).

KTX2 (Basis Universal) compression is **stretch** — would cut memory by ~6×. Not on the critical path.

## 9. CPU-Side Audit

- Every `Ride.update()` is O(N_children). Total CPU update per ride: 4 horses × 1 transform + 1 platform = ~5 transforms. Negligible.
- Avoid `new THREE.Vector3()` per frame in update loops — use scratch vectors declared once at module scope.
- Avoid string concatenation in update loops (we used to log scene-graph dumps; now gated to `?debug`).

## 10. Triage Matrix (when fps drops below target)

In order, top → bottom, each step expected to save the listed ms:

| Step | Saves (ms) | Visual cost |
| --- | --- | --- |
| 1. Disable bloom (`composer.passes[1].enabled = false`) | 2.5 | night looks flatter |
| 2. Shadow map 4096 → 2048 → 1024 | 1.0 → 1.5 | softer / blockier shadows |
| 3. Disable env map crossfade (use static) | 0.5 | minor specular pop |
| 4. Drop ride neon flicker | 0.3 | static lights |
| 5. Reduce visitor count by half | 0.3 | quieter park |
| 6. Disable post entirely (no composer) | +0.5 vs step 1 | flat scene |
| 7. Drop shadow casters to none | 2.5 | flat ground |

The triage script `tools/triage.js` toggles each step at boot via URL param so the team can A/B fps on a single page reload.

## 11. Memory Disposal

Even though the scene is static, `App.dispose()` releases all GPU resources:

```
for each Object3D in scene.traverse:
  if mesh.geometry: geometry.dispose()
  if mesh.material: dispose all maps then material.dispose()
renderer.dispose()
composer.dispose()
```

Run via the browser-tab `beforeunload` handler. This is hygiene, not gameplay.

## 12. Profiling

- Browser DevTools Performance tab is the primary tool.
- Three.js's `WebGLRenderer.info` is logged via `?profile=1` every 2 s:
  - `info.render.calls`, `info.render.triangles`, `info.render.points`, `info.memory.geometries`, `info.memory.textures`.
- Stats.js for live fps & frame-time.
- One snapshot per milestone committed to `perf/m{N}_baseline.json`.

## 13. Common Mistakes Avoided (lecture-grounded)

- **Phong on every surface even when PBR fits** (over-specular highlights everywhere). We use the right BRDF per material.
- **Importing animations from GLTF** (forbidden). We will trip a CI-equivalent check before each commit (see [GIT_WORKFLOW](../workflow/GIT_WORKFLOW.md)).
- **Z-fighting on coplanar decals**: every decal is offset by 0.001–0.005 m on its normal.
- **Forgetting `texture.colorSpace`**: causes black albedo or washed-out textures. Centralized in `AssetLoader`.
- **Shadow acne**: bias tuned during M3.
- **Painter's algorithm with transparents**: we use alpha test to keep things in the opaque pass.
- **Too many lights without distance clamps**: every PointLight has `distance` set; bounded per-fragment cost.

## 14. Final Checklist

- [ ] Stats.js shows 60 fps median on the baseline laptop at M6.
- [ ] `?mobile` shows 30 fps median on the team's test Android.
- [ ] Draw call count ≤ 200 measured at M6 (logged with `?profile=1`).
- [ ] Texture memory ≤ 200 MB.
- [ ] No per-frame allocations in hot paths (verified via DevTools allocation profiler).
