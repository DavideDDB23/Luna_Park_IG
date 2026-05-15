# SCENE STRUCTURE

> Companion to: [RENDERING_PIPELINE](RENDERING_PIPELINE.md) · [ANIMATION_SYSTEM](../interaction/ANIMATION_SYSTEM.md) · [PERFORMANCE_OPTIMIZATION](PERFORMANCE_OPTIMIZATION.md) · [MODEL_LIST](../assets/MODEL_LIST.md)

The scene graph is the spine of the project. Lecture 05 (3D Transformations) and Lecture 18 (Computer Animations) both rely on the hierarchical model — this document fixes the hierarchy in writing so every later document can refer back to it.

## 1. Top-Level Hierarchy

```
SceneRoot (THREE.Scene)
├── camera (PerspectiveCamera, not a child of Scene — kept by CameraRig)
├── lights/
│   ├── sun                 (DirectionalLight, castShadow=true)
│   ├── ambient             (HemisphereLight)
│   ├── stageSpot           (SpotLight)
│   ├── lamppostPoint_×N    (PointLight, instanced parent)
│   └── ridePoint_×N        (PointLight, parented to ride substructures)
├── world/
│   ├── ground              (Mesh)
│   ├── paths               (Mesh, decal on ground)
│   ├── skybox              (Mesh, BoxGeometry inside-out)
│   ├── lamppostsInstanced  (InstancedMesh)
│   ├── stands/             (Group of stand instances)
│   ├── trees/              (Group of tree instances)
│   ├── benches/            (InstancedMesh)
│   └── stage/              (Group)
├── visitors/               (Group of visitor instances; can be InstancedMesh + per-instance offsets)
└── rides/
    ├── ferrisWheel/        (see §3.1)
    ├── carousel/           (see §3.2)
    ├── rollerCoaster/      (see §3.3)
    └── tagada/             (see §3.4)
```

**Naming convention**: lowerCamelCase for nodes, no spaces. Every node sets `.name` so the dev `printSceneGraph()` helper (in `utils/debug.js`) produces a readable dump.

## 2. World Layout (Top-Down)

```
+Z (north)
 │
 │      ┌──────────────┐
 │      │ Roller Coast │
 │      └──────────────┘
 │      ┌──────┐
 │      │ Tagada│
 │      └──────┘
 │                ┌──── Stage ───┐
 │                │  (SpotLight)  │
 │                └───────────────┘
 │      ┌──────────────┐
 │      │ Carousel     │
 │      └──────────────┘
 │      ┌──────────────┐
 │      │ Ferris Wheel │
 │      └──────────────┘
 │           Stands × 6 around paths
 │           Lampposts × 12
 │
 └──────────────────────────────────── +X (east)
```

Park footprint: 120 × 120 m. Each ride site is a ~25 × 25 m clear circle. Paths are 2.5 m wide. Lampposts spaced 12–15 m along paths.

Coordinate origin (0, 0, 0) is at the center of the central junction between rides; +Y is up.

## 3. Ride Hierarchies

Every ride descends from a `THREE.Group` whose origin sits on the ground at the ride's pivot. Each ride registers itself in `EventBus` with its `rideId` so panels can dispatch toggles.

Every ride owns a `controlPanel` child, defined identically across rides — see §4.

### 3.1 Ferris Wheel

```
ferrisWheel (Group at world pos)
├── base/                  (cylinder, static)
│   └── support_l, support_r   (two angled struts)
├── hub                    (small drum at center of rotation)
├── ring                   (Group, rotates around Y)
│   └── arm_i × 8          (radial bar, child of ring; angular position = i · 2π/8)
│       └── gondola_i      (Group at end of arm; counter-rotates Y to stay vertical)
│           ├── shell      (cabin mesh)
│           ├── seatBench
│           ├── passengerL (parented Group; small sway)
│           └── passengerR
└── controlPanel/          (see §4)
```

Animation drivers (see [ANIMATION_SYSTEM](../interaction/ANIMATION_SYSTEM.md) §3.1):
- `ring.rotation.y = ω_ferris * elapsed`
- `gondola_i.rotation.y = -ring.rotation.y`
- `passengerL.rotation.z = sin(elapsed * 2 + i) * 0.05`
- `passengerR.rotation.z = sin(elapsed * 2 + i + π) * 0.05`

Hierarchical-transform invariant: even though `gondola_i` is a child of `arm_i` (which is a child of `ring` which rotates), the **world-space** rotation around Y of `gondola_i` is zero — its `Object3D.rotation.y` cancels the parent rotation. This is the canonical Lecture 05 example we lean into in the oral defense.

### 3.2 Carousel (Giostra Cavalli)

```
carousel (Group at world pos)
├── base                  (octagonal platform on ground, static)
├── platform              (Group, rotates around Y)
│   ├── decoratedCanopy   (multi-piece tent on poles)
│   ├── verticalPole_i × 8
│   │   └── horse_i       (mesh; bobs vertically with phase offset)
│   │       └── jockey_i  (parented to horse — inherits bobbing automatically)
└── controlPanel
```

Animation drivers (§3.2 of Animation):
- `platform.rotation.y = ω_carousel * elapsed`
- `horse_i.position.y = baseY + sin(elapsed * 2π * 0.4 + i * 2π/8) * 0.5`
- `horse_i.rotation.z = cos(elapsed * 2π * 0.4 + i * 2π/8) * 0.05` (slight tilt for wave feel)
- jockey requires no code — inherits horse transform

### 3.3 Roller Coaster (Ottovolante)

```
rollerCoaster (Group at world pos)
├── trackBuilder/             (Group)
│   ├── leftRail              (Mesh, TubeGeometry from curve)
│   ├── rightRail             (Mesh, TubeGeometry from offset curve)
│   ├── ties                  (InstancedMesh of crossbeams sampled along curve)
│   └── supportPosts          (InstancedMesh of vertical posts sampled along curve)
├── cart/                     (Group, transform set per frame via Frenet frame)
│   ├── chassis
│   ├── seat_i × 4
│   └── passenger_i × 4       (tilted with curvature)
└── controlPanel
```

Curve authoring:
- 30 control points around the park
- closed loop
- elevation varies: max +6 m, min +1 m
- one inversion (loop) introduces sign change in normal — handled by `computeFrenetFrames` consistency option, with a manual fix pass to keep up vector continuous

Cart transform per frame (pseudocode):
```
u = (u + speed * dt / curveLength) mod 1
P = curve.getPointAt(u)
T = curve.getTangentAt(u)
{normals, binormals} = precomputed
N = normals[ closestIndex(u) ]
B = binormals[ closestIndex(u) ]
cart.matrix.makeBasis(B, N, T.negate()).setPosition(P)
cart.matrixAutoUpdate = false
cart.matrixWorldNeedsUpdate = true
```

### 3.4 Tagada Mechanical Arm

```
tagada (Group at world pos)
├── base                       (rotates Y, slow)
│   └── arm1                   (rotates X, sin(t))
│       └── arm2               (rotates Z, sin(t*1.7))
│           └── seatPlatform   (rotates Y, fast)
│               └── seat_i × 8 (riders; no per-seat animation)
└── controlPanel
```

Three nested rotations producing a four-DoF compound motion that looks chaotic but is fully deterministic — the report calls this a "compound procedural animation" tied to Lecture 18.

## 4. Shared `ControlPanel` Substructure

Every ride owns one panel of the form:

```
controlPanel (Group, positioned ~3 m in front of the ride)
├── pedestal             (small box, static)
├── signalLight          (small sphere, emissive material, color reflects ride state)
├── lever                (cylinder, slight tilt animates when toggled)
└── pickArea             (invisible larger box, userData.pickable=true, userData.rideRef=...)
```

The invisible `pickArea` exists so the user does not have to click the tiny signal sphere — a 0.6 × 0.6 × 0.6 m forgiving hitbox is mounted around the pedestal. Its material is `new MeshBasicMaterial({ visible: false })`. Three.js raycaster still picks against an invisible mesh as long as `userData.pickable=true` is set and the visit traversal sees it.

Trigger contract:
1. Raycaster hit → `intersection.object.userData.rideRef = "carousel"`
2. `EventBus.emit("ride:toggle", { rideId: "carousel" })`
3. carousel state machine flips
4. signalLight emissive lerps `red ↔ green` over 250 ms
5. lever rotation `−0.4 ↔ 0.4 rad` tweens over 400 ms

See [INTERACTION_DESIGN](../interaction/INTERACTION_DESIGN.md) for the full event flow.

## 5. Passive Scene Objects

### 5.1 Ground

```
ground (Mesh)
geometry: PlaneGeometry(240, 240, 1, 1)            // single quad for simplicity
material: MeshStandardMaterial({
  map: groundColor,
  normalMap: groundNormal,
  roughnessMap: groundRoughness,
  aoMap: groundAO,
  metalness: 0,
  roughness: 1.0
})
rotation.x = -π/2
receiveShadow = true
```

A second mesh on top with `paths` material draws the gravel paths, slightly offset on Y to avoid z-fighting (+0.002 m).

### 5.2 Lampposts (InstancedMesh)

```
lamppostsInstanced (InstancedMesh, count = 12)
geometry: merged from { pole CylinderGeometry, lamp SphereGeometry }
material: MeshStandardMaterial(metal)

For each instance i, also create:
  pointLight_i (PointLight, color = warm white, intensity = 0 by default,
                distance = 14, decay = 1.6, position = lamp world pos)
  pointLight_i.userData.lamppostInstance = i
```

Clicking a lamppost picks the instance index via `intersection.instanceId`, then toggles the corresponding `pointLight_i.visible`.

### 5.3 Visitors

```
visitors (Group, ~15 instances)
each visitor:
  base (Group)
    body (CapsuleGeometry)
    head (SphereGeometry)
    armL, armR, legL, legR (parented to body)
    waypoint state: { currentIndex, t, speed }
```

Update step:
- interpolates between two waypoints along a precomputed walk graph
- arms/legs animate with `sin(elapsed * 6 + phase)` oscillation
- when reaching a waypoint, picks the next according to a transition matrix (lightly weighted toward the ride entrances and the stands)

## 6. Object3D Hygiene Rules

These are non-negotiable for any new code:

1. **Every node** sets `.name` before being added to its parent.
2. **Static meshes** set `matrixAutoUpdate = false` and call `updateMatrix()` once.
3. **Animated meshes** keep `matrixAutoUpdate = true` (default).
4. **userData.pickable** is set explicitly on every mesh that can be raycast-hit. The raycaster filters on this flag.
5. **Group vs Mesh**: use `Group` whenever a node serves as a transform anchor but has no geometry; this avoids accidental draw calls.
6. **Disposal**: every long-lived node has a `dispose()` exit, which calls `geometry.dispose()`, `material.dispose()`, and recursively disposes children.

## 7. Hierarchical-Transform Talking Points

For the oral defense, the team will physically point at the scene graph dump (`printSceneGraph()` output) on screen and say:

- "The ring rotates. Each arm rotates with it because it's a child. The gondola applies the inverse Y rotation to remain upright — this is the canonical demonstration of hierarchical 3D transforms (Lecture 05, slide on coordinate-frame composition)."
- "Each horse on the carousel inherits its rider — the rider node has no animation code, the carousel still moves it correctly because of the parent-child chain."
- "The Tagada arm has four levels of nested rotations. The position of a seat in world space is `M_base · M_arm1 · M_arm2 · M_seatPlatform · v_local` — exactly the formula from Lecture 05 on the matrix-collapse slide."

The talking points are repeated in [PRESENTATION_STRATEGY](../evaluation/PRESENTATION_STRATEGY.md) §4.
