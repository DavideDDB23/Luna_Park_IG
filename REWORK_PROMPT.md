# Rework Prompt — Fix the Visible Defects in v1.0.0

> Paste the **PROMPT** section below into Claude Code with the working directory set to `Luna_Park_IG/`. This is a corrective pass on the v1.0.0 build.

---

## Context (so you understand why)

The v1.0.0 build is in place, but a visual review identified concrete defects:

- `assets/models/` is **empty**. No Sketchfab / Kenney / Quaternius models were actually downloaded. The `AssetLoader.loadModelOrFallback()` helper exists but was never called — every ride and prop is built from `BoxGeometry` / `CylinderGeometry` placeholders. CREDITS.md openly states "No external 3D models are used."
- `assets/textures/` is **empty**. All textures are procedural CanvasTextures generated from noise; the ground reads as muddy noise rather than recognizable grass.
- **BoxHelper debug markers** (the three magenta dashed rings visible on the ground in screenshots) are still visible in production — they should be gated behind `?debug`.
- **Night scene is pitch-black** beyond the lamppost cones. Hemisphere intensity floor is too low; emissive ramp does not visually drive enough fill.
- **Day sky is a flat gradient.** The sky shader's stars-on-day showing through and the sun disc/moon are barely visible.
- **Missing scene elements**: no food stands, no trees, no visitors visible at this scale, no path texture distinct from ground, no welcome arch.

The plan was always to use real models — see `docs/assets/SOURCED_MODELS.md`. This rework executes that plan.

---

## PROMPT

You are continuing work on **Luna Park 3D**. The previous milestone-by-milestone build (v1.0.0, tag exists) is in place but missed the asset-integration plan: every model is a primitive placeholder and every texture is procedural noise. We are now doing a **rework pass** to land the actual assets and fix the visible defects from a user review of the live demo.

### 0. Read these (and only these) first

1. `docs/assets/SOURCED_MODELS.md` — the concrete Sketchfab / Kenney / Quaternius URLs we planned to use.
2. `docs/assets/MODEL_LIST.md` — per-asset polygon budgets and pivots.
3. `docs/assets/TEXTURE_LIST.md` — per-material texture channels.
4. `docs/graphics/MATERIAL_SYSTEM.md` — named-material library and which goes where.
5. `docs/graphics/LIGHTING_STRATEGY.md` §3 + §5 — sun keyframes, lamp ignition threshold, shadow tuning.
6. `src/core/AssetLoader.js` (existing) — note that `loadModelOrFallback(url, fallbackFn)` is already implemented; we just need to call it.
7. `src/main.js` — find the BoxHelper markers section around line 245.

### 1. Hard constraints (still)

- **NO IMPORTED ANIMATIONS.** Every `.glb` we add must be opened in Blender (or run through `gltf-transform`) to strip animation tracks BEFORE commit. Implement `tools/audit-glb.js` if it isn't already, and run it as a pre-commit check.
- **All assets vendored** in `assets/models/` and `assets/textures/` — no CDN lookups at runtime.
- **Vendor folder unchanged** — three.js, tween.js, lil-gui, stats.js only.
- **No new libraries.**

### 2. Defects to fix, in priority order

> Use `TodoWrite` to plan, then fix one defect at a time. Commit after each. Screenshot before/after for each.

#### D1 — Hide debug markers in production

The magenta dashed rings on the ground (ride-site markers) are visible without `?debug`. They are `BoxHelper` or `RingGeometry` decorators added during M2.

- Find them in `src/main.js` (~line 245) and / or `src/scene/SceneRoot.js`.
- Wrap them in `if (config.debug) { ... }` based on the URL-flag config already parsed by `src/utils/url.js`.
- Verify by loading the page without `?debug` — no magenta rings should appear.

Commit: `fix(scene): gate ride-site BoxHelper markers behind ?debug flag`.

#### D2 — Acquire and integrate the real models

`docs/assets/SOURCED_MODELS.md` lists exact URLs. Implementation plan:

**Step 1 — Download.** Sketchfab requires a login; ask the user to download the items below and drop them under `assets/models/<family>/`. List the URLs in chat and ask the user to confirm when files are in place. Wait for the user before proceeding.

| Target file | Source URL | License |
| --- | --- | --- |
| `assets/models/rides/ferris_wheel.glb` | https://sketchfab.com/3d-models/lunapark-ferris-wheel-afa6057645424f2eb5df1f8ad61c5cb3 | CC-BY |
| `assets/models/rides/carousel.glb` | https://sketchfab.com/3d-models/carousel-892f9fd08d3b4c6ab350dfc9ae658dbe | CC-BY |
| `assets/models/rides/horse.glb` | https://sketchfab.com/3d-models/carousel-horse-7872323d00cf4654845c8f39d907e57d | CC-BY |
| `assets/models/rides/coaster_cart.glb` | https://sketchfab.com/3d-models/roller-coaster-cart-66394f093eec43b3ac210b1d92f534ae | CC-BY |
| `assets/models/props/lamppost.glb` | https://sketchfab.com/3d-models/victorian-street-lamp-simplified-1900s-29062e9363d240b49f04346b896692f7 | CC-BY |
| `assets/models/props/food_stand.glb` | https://sketchfab.com/3d-models/stylized-carnival-booth-d8b4a661d433494184403c621818a424 | CC-BY |
| `assets/models/props/welcome_arch.glb` | https://sketchfab.com/3d-models/cc0-neon-sign-open-9a924db296cf4a1eb12991702ab48da5 | CC0 |
| `assets/models/props/trash_bin.glb` | https://sketchfab.com/3d-models/city-park-trash-bin-garbage-can-game-ready-f31efce945584b9791abd1a38afaf575 | CC-BY |

For the **bundle assets** (bench, fence, tree, visitor), tell the user to download the full Kenney kits (CC0, no Sketchfab login):

- `https://kenney.nl/assets/nature-kit` → after download, copy out `bench.glb`, `fence.glb`, `tree_pineRoundC.glb` (or similar) to `assets/models/props/`.
- `https://kenney.nl/assets/mini-characters` → copy one or two character `.glb` files to `assets/models/characters/visitor.glb`.

**Step 2 — Strip animations.** For each downloaded `.glb`, open it in Blender, delete all actions, re-export with the GLB exporter and `Animation` unchecked. As a programmatic safety net, write/extend `tools/audit-glb.js` to fail if any `.glb` under `assets/models/` has nonzero `animations.length`. Run it after each integration commit.

**Step 3 — Wire each model into its module via `loadModelOrFallback`.** Edit:

- `src/rides/FerrisWheel.js` — call `AssetLoader.loadModelOrFallback('assets/models/rides/ferris_wheel.glb', primitiveFerrisWheelFn)`. Identify the loaded model's `ring` / `arm` / `gondola` children by traversing for matching names (e.g., `child.name.includes('ring')`) or by re-naming inside Blender before commit. Re-parent those children to the correct nodes in the existing scene-graph hierarchy (per `docs/graphics/SCENE_STRUCTURE.md` §3.1). Keep the counter-rotation logic untouched.
- `src/rides/Carousel.js` — load the carousel model for the platform + canopy; load **only the horse mesh** from `horse.glb` and instance it 8× yourself in code (per the existing hierarchy in §3.2). Don't trust whatever horse count ships in the model.
- `src/rides/RollerCoaster.js` — load `coaster_cart.glb` into the existing cart group. Keep the track procedural; the cart sits on top.
- `src/scene/Lampposts.js` — replace the cylinder-pole + sphere-lamp primitives with the loaded `lamppost.glb`. Keep the `InstancedMesh` strategy by extracting just the pole/lamp geometry from the loaded scene and feeding it into a single `InstancedMesh`.
- `src/scene/Stands.js` — load `food_stand.glb` and place 6 instances around the path. Vary by hue if convenient.
- `src/scene/SceneRoot.js` — add a single `welcome_arch.glb` at the park entrance (the +Z edge of the central path).
- `src/scene/Furniture.js` (or wherever benches/fence/trash live) — swap in the loaded `bench.glb`, `fence.glb`, `trash_bin.glb`, `tree.glb`.
- `src/scene/Visitors.js` — replace the capsule + sphere bodies with the loaded `visitor.glb` mesh (single mesh, no skeleton). The JS animation drivers (arm/leg sin sway) stay; they will move parented child meshes if your model has any, otherwise replace with a simple body-only sway.

**Step 4 — Update CREDITS.md** with the real assets and licenses. Fix the line that currently says "No external 3D models are used." It is no longer true.

Commit per ride / per asset family. Conventional commits: `feat(rides): integrate ferris_wheel.glb`, `feat(scene): swap lamppost primitives for victorian_lamp.glb`, etc.

#### D3 — Acquire and integrate the real textures

The procedural CanvasTextures look like noise. Replace the high-impact surfaces with downloaded PBR textures (all CC0 from PolyHaven and AmbientCG):

| Target folder | Source | Files we want |
| --- | --- | --- |
| `assets/textures/ground/` | https://polyhaven.com/a/wild_grass (CC0) | basecolor (2K), normal (2K), roughness (2K), AO (2K) |
| `assets/textures/asphalt/` | https://ambientcg.com/view?id=Asphalt026A (CC0) | basecolor, normal, roughness |
| `assets/textures/metal_painted/` | https://ambientcg.com/view?id=Metal052B (CC0) | basecolor, normal, roughness, metalness |
| `assets/textures/wood_varnished/` | https://ambientcg.com/view?id=WoodFloor043 (CC0) | basecolor, normal, roughness |
| `assets/textures/fabric_striped/` | https://ambientcg.com/view?id=Fabric048 (CC0) | basecolor, normal |

Ask the user to download these and drop them under `assets/textures/<family>/` with these filenames:
- `basecolor.webp` (or `.jpg`)
- `normal.png`
- `roughness.png`
- `metalness.png` (where applicable)
- `ao.png` (where applicable)

Then:
- Pack `metalness + roughness + AO` into a single `mra.png` using `tools/pack-mra.js` (or write it now if it doesn't exist).
- Extend `src/core/AssetLoader.js` with `loadColor(url)`, `loadData(url)`, `loadCubemap(...)` helpers that set `texture.colorSpace` correctly (sRGB for color, NoColorSpace for data).
- Rewrite `src/materials/MaterialLibrary.js` to bind these textures instead of the procedural CanvasTextures. Keep `ProceduralTextures.js` available as a graceful fallback when a file is missing.
- For each material, enable anisotropic filtering on the ground/asphalt: `texture.anisotropy = renderer.capabilities.getMaxAnisotropy()`.

Commit: `feat(materials): use PolyHaven grass + AmbientCG PBR textures, keep procedural fallback`.

#### D4 — Tune night lighting (it's currently pitch-black)

In `src/lighting/DayNight.js` and `src/lighting/LightingRig.js`:

- **Hemisphere floor**: at midnight (`t=0`), `HemisphereLight.intensity` should be at minimum 0.15 (currently appears to be ~0), with sky color `#0a0e22`, ground `#08080a`. Verify the keyframe table.
- **Lamppost ramp**: at the ignition threshold (`sun.position.y < 8`), each lamppost `PointLight.intensity` should ease from 0 → 2.0 over 5 s of cycle time. Confirm `distance = 14`, `decay = 1.6`.
- **Emissive ramp**: every material in the `nightEmissive` registered set should ramp `emissiveIntensity` from 0 → 2.0 at night. Verify the registry actually contains the neon signs, the welcome arch, and the stand windows.
- **Sky shader**: stars currently bleed through the daytime sky. Open `src/scene/Skybox.js` (or the sky shader source) — `nightAmount` must drive a hard fade of the star contribution to 0 when `t ∈ [0.3, 0.7]`. The current bleed-through is the bug.

Take a triptych screenshot (day / dusk / night) at `?time=0.5`, `?time=0.78`, `?time=0.0` and commit them to `screenshots/`.

Commit: `fix(lighting): tune hemisphere floor and lamppost ignition for visible night scene`, `fix(scene): fade stars to zero during daytime`.

#### D5 — Improve day sky and sun/moon visibility

- Open the sky shader / `Skybox.js`. Add a procedural **sun disc** at the sun's screen position when `nightAmount < 0.5`: a soft white spot, ~0.04 radians angular radius, with a subtle halo. Add a faint **moon disc** opposite when `nightAmount > 0.5`.
- The day-sky gradient currently runs purple-to-white. Adjust the day cubemap blend so noon gives a believable warm-white-to-pale-blue gradient — see `LIGHTING_STRATEGY.md` §3.3 for the target colors.

Commit: `feat(sky): add sun and moon discs; tune day gradient`.

#### D6 — Add the missing scene elements (now that we have models)

- **Trees**: 8–12 trees scattered along the park perimeter using `InstancedMesh` from the Kenney tree model.
- **Visitors**: 15 visitors walking the path graph (the existing `src/scene/Visitors.js` machinery is there; it just needs the model swap).
- **Path texture**: ensure the path mesh uses `mat.ground.asphalt` (not the grass material). The current path appears as a slightly-darker tint of the grass.
- **Welcome arch**: place at the path entrance, large enough to read from the establishing shot. Re-letter the model in Blender to "LUNA PARK" if it has different text; otherwise accept the existing text and add an additional `mat.neon` strip across the top with the project name (see `SHADER_PLAN.md` §3 for the neon shader, which is already implemented).

Commit per element.

### 3. Verification protocol after each defect

- `?debug` round-trip: with the flag, the rings appear; without, they don't.
- `tools/audit-glb.js` passes (zero animation channels in every `.glb`).
- Screenshots before/after committed under `screenshots/rework/`.
- 60 fps median maintained on the baseline laptop. If not, see `docs/graphics/PERFORMANCE_OPTIMIZATION.md` §10 triage matrix.
- Live URL still loads on Chrome, Firefox, Safari.

### 4. After all defects are addressed

- Re-tag: `git tag v1.1.0` and push.
- Update `README.md` with new hero screenshot.
- Re-record the demo video (`report/demo.mp4`) — old one shows the placeholder primitives.

### 5. First action

Read sections 0–2, then **report which Sketchfab URLs you need the user to download**, in a single bulleted list. Wait for the user to confirm "files are in place" before starting D2 step 3 (model wiring).

You may now begin.

---

## How to use this prompt

1. `cd "/Users/davide/Desktop/Luna_Park_IG"`
2. `claude` (open Claude Code)
3. Paste the PROMPT section above
4. Claude Code will list the URLs you need to download from Sketchfab; download each (Sketchfab login required) and drop into `assets/models/...` and `assets/textures/...` as instructed
5. Tell Claude Code "files are in place"
6. It proceeds defect by defect, committing after each

## Quick-fire commands you can give mid-rework

- `skip the Tagada model for now, keep primitive` — descope per `RISK_ANALYSIS.md` R9 step 1
- `use Kenney Holiday Kit for the Ferris wheel instead, my Sketchfab login isn't working` — alt path
- `before D3, just do D1 and D4 so the demo at least looks right tonight` — re-order
- `tools/audit-glb.js is failing on horse.glb` — fix iteratively
