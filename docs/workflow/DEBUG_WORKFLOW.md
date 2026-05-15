# DEBUG WORKFLOW

> Companion to: [TECHNICAL_ARCHITECTURE](../core/TECHNICAL_ARCHITECTURE.md) · [PERFORMANCE_OPTIMIZATION](../graphics/PERFORMANCE_OPTIMIZATION.md) · [TESTING_STRATEGY](TESTING_STRATEGY.md)

## 1. URL Param Toolbox

Every debug knob is a URL parameter. None require a code change to toggle.

| Param | Effect |
| --- | --- |
| `?debug=1` | enables FPS overlay, axes helpers, scene-graph print on `T` |
| `?profile=1` | logs renderer stats every 2 s |
| `?nopost` | disables the EffectComposer pipeline |
| `?fast` | mobile-tier quality on desktop |
| `?mobile` | strict mobile profile |
| `?time=0.8` | sets day-time at boot |
| `?ride=carousel` | flies to a ride on boot |
| `?demo=1` | runs the scripted demo path |
| `?seed=N` | seeds visitor placement for reproducible screenshots |
| `?aa=ssaa` | enables 2× supersampling AA for screenshots |
| `?statepanel=1` | writes a live state dump to a `<pre>` panel |
| `?raycast=1` | draws a tiny line where the user clicks |
| `?wire=1` | wireframe everything (lecture demo) |
| `?gridhelper=1` | adds a `GridHelper(120, 24)` to the scene |
| `?axeshelper=1` | adds `AxesHelper(5)` at origin and at every ride root |
| `?cube=N` | inserts N rotating reference cubes for visibility tests |

All params are read in `utils/url.js` and propagated into `appConfig`.

## 2. Visual Debug Helpers

| Helper | Source | Purpose |
| --- | --- | --- |
| `AxesHelper` | Three.js built-in | confirm local frame orientation of rides |
| `BoxHelper` | Three.js built-in | bounding-box visualization (M2 ride sites) |
| `CameraHelper` (on shadow camera) | Three.js built-in | sanity-check shadow camera bounds |
| `DirectionalLightHelper` | Three.js built-in | visualize sun direction |
| `PointLightHelper` | Three.js built-in | confirm lamppost positions |
| `SpotLightHelper` | Three.js built-in | confirm stage spot direction |
| Custom scene-graph print | `utils/debug.js` | nested `console.log` of node tree |
| Custom ray visualizer | `utils/debug.js` | draws the last raycast as a `LineSegments` for 1 s |

All helpers are added under a top-level `Group("debug")` so they can be hidden by a single `.visible = false`.

## 3. `printSceneGraph` helper

```
function printSceneGraph(root, depth=0):
    indent = "  ".repeat(depth)
    line = `${indent}${root.type}.${root.name || "(unnamed)"} pos=${root.position.toArray()} rot=${root.rotation.toArray()}`
    console.log(line)
    for child in root.children:
        printSceneGraph(child, depth+1)
```

Triggered via `T` (`?debug=1` required). Output looks like:

```
Scene.SceneRoot pos=[0,0,0] rot=[0,0,0]
  Group.world pos=[0,0,0]
    Mesh.ground pos=[0,0,0]
    Mesh.skybox pos=[0,0,0]
    InstancedMesh.lamppostsInstanced pos=[0,0,0]
  Group.rides
    Group.ferrisWheel pos=[-15,0,-10]
      Group.base pos=[0,0,0]
      Group.ring pos=[0,12,0] rot=[0, 1.23, 0]
        Group.arm_0 rot=[0, 0, 0]
          Group.gondola_0 rot=[0, -1.23, 0]   <-- counter-rotation
            ...
```

This dump is **the** strongest visual proof of hierarchical scene-graph design and we screenshot it for the report.

## 4. Frame-by-Frame Stepping

Pressing `Shift+P` (debug mode) toggles single-step mode:
- `Space` advances one frame
- the FPS overlay shows the current frame index
- useful for debugging tween race conditions

## 5. Standard Repro Checklist

When a bug is reported (by a teammate or by self), capture:

1. browser + version + OS + screen DPI
2. URL params used (`?time=...`, etc.)
3. exact reproduction steps (clickable)
4. screenshot at the moment of bug
5. console snapshot (errors, warnings)
6. `renderer.info` snapshot

Paste into a GitHub issue with the `bug` label.

## 6. Common Bug Signatures

| Symptom | Likely cause | Where to look |
| --- | --- | --- |
| Black scene | wrong color space on albedo, or pre-init render | check `texture.colorSpace`, check that scene is added |
| White scene | wrong tonemap / over-exposure | check exposure and emissive intensities |
| Bands on lit surfaces | normals incorrect | verify `geometry.computeVertexNormals()` ran |
| Flickering shadows | bias too low, peter-panning, or moving caster outside shadow frustum | tune `bias`, `normalBias`, shadow.camera bounds |
| Texture appears black | missing color-space declaration | check Loader path |
| Ride suddenly stops animating | NaN in transform | check inputs to `Frenet`, check `dt` clamp |
| Click-to-fly never triggers | raycaster filter / OrbitControls swallowing | enable `?raycast=1`, check `userData.pickable` |
| Counter-rotation drifts | accumulated float error | recompute `gondola.rotation.y = -ring.rotation.y` each frame instead of incrementing |
| Coaster cart wobbles or inverts | Frenet frame discontinuity at high curvature | use `closed=true` and `tube.computeFrenetFrames(N, true)` with adequate N |
| HUD slider doesn't take effect | EventBus subscriber detached | check `on/off` lifecycle |
| GitHub Pages shows old version | browser cache | add `?v=2026-05-14` to script src or open private window |

## 7. Three.js DevTools

Install the official Three.js DevTools Chrome extension. It exposes:
- the scene graph live, with editable transforms
- materials and uniforms live-tweakable
- per-object frame-time

Used during phase 4-6 for material tuning.

## 8. `renderer.info` Logging

When `?profile=1`:

```
every 2 s:
  console.table({
    "draw calls": renderer.info.render.calls,
    "triangles":  renderer.info.render.triangles,
    "geometries": renderer.info.memory.geometries,
    "textures":   renderer.info.memory.textures,
    "programs":   renderer.info.programs.length
  })
```

If `draw calls` climbs over time, we have a leak (typically a tween created but never disposed).
If `triangles` jumps when a ride starts, we forgot frustum culling.

## 9. Source-map & Stack Trace Strategy

We do not bundle, so stack traces reference actual files in `src/`. This makes browser errors very actionable. The team should never reach for source maps.

## 10. Debug Mode for the Demo

For the live oral defense:
- DO NOT use `?debug=1` — overlays look unprofessional.
- DO use `?demo=1` if running the cinematic auto-mode.
- Bring a backup laptop with a different browser open to the URL, in case the primary device fails.

## 11. The "Bug Diary"

A running list of every bug squashed lives in `report/log/bugs.md`. Each entry: symptom, root cause, fix, lesson learned. This file becomes an appendix in the final report and demonstrates engineering rigor — exactly the kind of artifact that earns "polish" points.

Sample entry:

```
2026-06-04 — gondola counter-rotation drifts after 30 s
  symptom: gondola tilts ~0.1 rad after a minute
  cause: accumulated += updates with non-clamped dt and float error
  fix: replaced `gondola.rotation.y -= ω*dt` with absolute assignment `gondola.rotation.y = -ring.rotation.y`
  lesson: prefer absolute assignment from authoritative source over per-frame deltas
```
