# ASSET PIPELINE

> Companion to: [MODEL_LIST](MODEL_LIST.md) · [TEXTURE_LIST](TEXTURE_LIST.md) · [MATERIAL_SYSTEM](../graphics/MATERIAL_SYSTEM.md)

## 1. Goals

- Produce **mesh-only** GLTF assets (no animations, since they're forbidden).
- Keep file sizes small enough that the live demo loads under 5 s on mid-tier connections.
- Keep authoring repeatable: anyone on the team can re-export a model in 10 minutes.
- Track licenses so the report's attribution section is airtight.

## 2. Acquisition Strategy

For each asset we choose **one of four strategies**, justified per asset in [MODEL_LIST](MODEL_LIST.md):

| Strategy | When | Pro | Con |
| --- | --- | --- | --- |
| **Custom modeled** | the rig matters (Ferris wheel rotates and counter-rotates), the asset is iconic to the project | full control over pivot points and UV layout | takes time |
| **Kitbashed** | the asset is a composition of free primitives (food stand = box + tarp + sign) | fast, looks intentional | mediocre uniqueness |
| **Downloaded** | the asset is unrelated to the marquee animation (trees, benches, the visitor body) | huge time savings, high quality | must respect license & style consistency |
| **Procedurally generated** | the asset is large-scale repeating geometry (fence posts along a curve, ride decorations) | parameter-driven, edit in code | requires upfront procedural code |

## 3. Recommended Sources

**Free, CC0 or permissive (verified license at download time):**

- **PolyHaven** (`polyhaven.com`) — premium-quality PBR materials and HDRs. CC0. Top pick for ground/asphalt/grass textures and the day/night HDRs.
- **Quaternius** (`quaternius.com`) — stylized low-poly props. CC0. Top pick for trees, benches, generic stand decoration.
- **Kenney Assets** (`kenney.nl`) — stylized low-poly props and UI kits. CC0. Top pick for visitors (low-poly character pack) and signs.
- **Sketchfab CC0 filter** — broad selection; filter strictly by CC0; verify before download.
- **OpenGameArt** — older, mixed licenses; only use clearly CC0 entries.
- **AmbientCG** (`ambientcg.com`) — PBR textures (color + normal + roughness + AO + displacement). CC0.

**Note**: **Sketchfab "free" is not always CC0** — many uses are restricted. We only use CC0-tagged downloads.

**To AVOID** unless explicitly justified: TurboSquid (license complexity), CGTrader (royalty-free is not CC0), random Google Image results (almost certainly copyrighted).

## 4. License Tracking

Every external asset is recorded in `assets/CREDITS.md` with:

```
- Asset: <name>
- Source URL: <link>
- Author: <name>
- License: CC0 / CC-BY 4.0 / ...
- Modifications: <e.g., re-UV-mapped, simplified, retextured>
- Used as: <e.g., visitor body>
```

This file is mandatory and is reviewed at M7. A missing entry is a deal-breaker.

## 5. Authoring Workflow (Blender)

For each custom or modified mesh:

1. **Model** at scale (1 Blender unit = 1 m).
2. **Apply transforms** (Ctrl+A → All Transforms) to flush any non-identity transform.
3. **Set the origin** at the intended pivot (Object → Set Origin → To 3D Cursor, with cursor at the pivot).
4. **UV-unwrap**: Smart UV Project for organic; manual unwrap for everything where seams matter (rides, stands).
5. **Triangulate** before export (Modifier → Triangulate, or export option). Three.js converts at load anyway, but pre-triangulation gives us a deterministic mesh.
6. **Generate normals** with correct shading: shade smooth + add a Bevel modifier for hard edges via auto-smooth angle (sharp edges over 30°).
7. **Clean**: remove empty / unused materials, collapse duplicate vertices (`mesh.merge_vertices`).
8. **Name** the object intentionally — these names propagate into the Three.js scene graph (`ferrisWheel_ring`, `carousel_horse_3`, etc.).
9. **Export as GLTF 2.0 binary (.glb)** with:
   - ☑ Selected objects
   - ☐ Apply modifiers (we apply manually so we can see them)
   - ☑ Mesh → UVs, Normals, Tangents
   - ☑ Geometry → Compression (Draco, level 6) — saves ~50 % file size
   - ☐ **Animation** — disabled at every step (this is the legal requirement; we audit it)
10. **Verify**: open the exported GLB in https://gltf.report or `gltf-viewer` to confirm zero animation tracks and correct UVs.

## 6. Verification Checklist Per Asset

Before committing a `.glb`:

- [ ] mesh count ≤ poly budget (see [MODEL_LIST](MODEL_LIST.md))
- [ ] UVs in `[0, 1]` range (no overlapping unless intentional)
- [ ] tangents present (`MESH.tangent` attribute) so normal maps work
- [ ] no animation track (`animations.length === 0` in the export)
- [ ] origin is at the intended pivot (re-import test in Three.js editor)
- [ ] correct material slot count (one material per visual surface family)

A script `tools/audit-glb.js` walks every `.glb` under `assets/models/` and asserts these properties at commit time.

## 7. Texture Pipeline

(See [TEXTURE_LIST](TEXTURE_LIST.md) for the per-texture spec; here we list the conversion pipeline.)

```
raw_PBR_set/ (downloaded)
    ├── basecolor.png        (sRGB)
    ├── normal.png           (linear, OpenGL Y-up)
    ├── roughness.png        (linear)
    ├── metallic.png         (linear)
    ├── ao.png               (linear)
    ↓ pack via tools/pack-mra.js
mra_packed.png
    ├── R: AO
    ├── G: roughness
    ├── B: metalness
    ↓ convert via tools/convert-webp.js
basecolor.webp (sRGB lossless), normal.png (linear lossless), mra.webp (linear lossless)
    ↓ on load
texture in renderer
```

WebP saves significant bandwidth vs PNG and is universally supported. We keep PNG for normal maps (lossless preserves precision) and for normal-only assets where compression artifacts would show.

## 8. Loading Strategy

`AssetLoader.js`:
- preload **only** the assets needed for the first frame; everything else loads lazily.
- show a progress bar in the HUD (`asset:loaded` events accumulate).
- use a single `THREE.LoadingManager` so progress is global.
- cache decoded textures via `ResourceCache.put(key, tex)`; identical references are reused across materials.

Loading order:
1. day cubemap, hemisphere defaults
2. ground textures
3. control panel mesh (it's tiny; needed on first click)
4. Ferris wheel mesh + textures
5. Carousel mesh + textures
6. Coaster mesh + textures
7. Tagada mesh + textures
8. Lampposts, stands, visitors, trees
9. Night cubemap, night HDR — last (only needed once user scrubs time-of-day)

## 9. Style Consistency

The art direction is **stylized, slightly cartoony**:
- saturated palette (the carnival pinks, blues, yellows)
- soft shading via baked AO maps
- low-medium poly meshes (visible faceting on horses is acceptable, supports the carnival kitsch)
- no realistic skin / hair (visitors are cylindrical capsule + sphere head)

A team-internal **mood board** is in `assets/moodboard/` with reference screenshots — all from royalty-free sources. The moodboard is referenced in the report as proof of pre-production discipline.

When sourcing assets, the consistency check is: **does the new asset's color saturation and silhouette read alongside the carousel without standing out?** If not, it gets retextured or excluded.

## 10. Asset Folder Layout

```
assets/
├── models/
│   ├── rides/
│   │   ├── ferris_wheel/
│   │   │   ├── hub.glb
│   │   │   ├── arm.glb       (single arm, instanced 8×)
│   │   │   ├── gondola.glb
│   │   │   └── README.md     (source, license, notes)
│   │   ├── carousel/
│   │   │   ├── horse.glb
│   │   │   ├── canopy.glb
│   │   │   └── ...
│   │   ├── roller_coaster/
│   │   │   └── cart.glb
│   │   └── tagada/
│   ├── props/
│   │   ├── lamppost.glb
│   │   ├── bench.glb
│   │   ├── tree.glb
│   │   ├── stand_food.glb
│   │   └── ...
│   └── characters/
│       └── visitor.glb
├── textures/
│   ├── ground/
│   │   ├── grass_basecolor.webp
│   │   ├── grass_normal.png
│   │   └── grass_mra.webp
│   ├── metal_painted/
│   ├── wood_varnished/
│   ├── horse_painted/
│   └── ...
├── cubemaps/
│   ├── day/
│   │   └── px.hdr, nx.hdr, py.hdr, ny.hdr, pz.hdr, nz.hdr
│   └── night/
├── icons/
│   └── help.svg, fps.svg, ...
├── audio/    (optional)
├── moodboard/
└── CREDITS.md
```

## 11. Replacing Placeholder With Final

Per the [DEVELOPMENT_ROADMAP](../core/DEVELOPMENT_ROADMAP.md) "scaffold first, art last" rule:

- Each ride is first built from primitives. The substitution to final mesh changes:
  1. the `await loader.load("hub.glb")` call,
  2. the post-load `swapMesh(group, "hub", loadedMesh)` helper,
  3. nothing else.

`swapMesh(group, name, mesh)`:
1. find child by `.name === name`
2. preserve its parent, position, rotation, scale
3. dispose old geometry/material
4. add the loaded mesh as a replacement
5. log a confirmation under `?debug=1`

## 12. Tooling Scripts (in `tools/`)

- `tools/pack-mra.js` — packs metalness/roughness/AO into a single RGB texture.
- `tools/convert-webp.js` — batch convert PNG → WebP (lossless for normal maps, near-lossless for color).
- `tools/audit-glb.js` — verifies no animations, mesh budgets, etc.
- `tools/atlas-icons.js` — builds an SVG sprite for HUD icons.

None of these need to run at build time — they are one-time conversions whose outputs we commit.
