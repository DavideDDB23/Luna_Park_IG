# SOURCED MODELS — Concrete URLs and Licenses

> Companion to: [MODEL_LIST](MODEL_LIST.md) · [ASSET_PIPELINE](ASSET_PIPELINE.md) · [TEXTURE_LIST](TEXTURE_LIST.md)

This document lists **actual currently-available 3D model URLs** for every entry in [MODEL_LIST](MODEL_LIST.md). The user requested concrete picks from Sketchfab and equivalent free sources rather than abstract "find on the web" instructions.

> ⚠️ **License hygiene**: ALL downloaded models must have their **animation tracks stripped before commit** (course requirement, `Project_Requirements.pdf` page 3 — "ANIMATIONS CANNOT BE IMPORTED"). The asset-audit script in [ASSET_PIPELINE](ASSET_PIPELINE.md) §6 enforces this. For Sketchfab CC-BY models, attribution must be added to `assets/CREDITS.md`.

## 1. Bundle Sources (preferred — single download covers many assets)

Whenever a bundle covers our needs, use it instead of picking individual assets. All listed bundles are **CC0** (no attribution required, but we credit anyway out of professionalism).

| Bundle | URL | License | Covers in our scene |
| --- | --- | --- | --- |
| **Kenney — Holiday Kit** (100 assets) | https://kenney.nl/assets/holiday-kit | **CC0** | gondola alt, tree variants, fence post, gift / box props, lanterns, sign variants |
| **Kenney — Nature Kit** (330 assets) | https://kenney.nl/assets/nature-kit | **CC0** | trees, bushes, rocks, fences, benches, lampposts, ground decoration |
| **Kenney — Mini Characters** (12 chars × 32 animations) | https://kenney.nl/assets/mini-characters | **CC0** | visitors — **we use the static T-pose meshes only, strip animations** |
| **Quaternius — Stylized Nature MegaKit** (110+) | https://quaternius.itch.io/stylized-nature-megakit | **CC0** | trees, plants, rocks (Ghibli style; alt for Kenney Nature) |
| **Quaternius — 150+ LowPoly Nature Models** | https://quaternius.itch.io/150-lowpoly-nature-models | **CC0** | trees, foliage |
| **Poly Pizza — Quaternius collection mirror** | https://poly.pizza/u/Quaternius/Lists | **CC0** | direct `.glb` downloads (no login) |

These three Kenney bundles alone cover **9 of our 15 model rows**.

## 2. Ride Models (Sketchfab and Poly Pizza)

### 2.1 Ferris wheel — **TOP PICK**

| # | Asset | URL | License | Notes |
| --- | --- | --- | --- | --- |
| 1 | **LunaPark — Ferris wheel** by Vetech82 | https://sketchfab.com/3d-models/lunapark-ferris-wheel-afa6057645424f2eb5df1f8ad61c5cb3 | check CC-BY | **literally named LunaPark**; first choice for theme cohesion |
| 2 | Wheel of Brisbane Ferris Wheel (Low-Poly) FREE | https://sketchfab.com/3d-models/wheel-of-brisbane-ferris-wheel-low-poly-free-6e6178b07a594385a60452f7c1319493 | CC-BY | clean low-poly recreation, made for a Rolling Line competition |
| 3 | Ferris wheel by Alexey | https://sketchfab.com/3d-models/ferris-wheel-bc05f69391814deb8817f75a1df5d046 | CC-BY | simple readable silhouette |
| 4 | Ferris wheel (Low Poly) by game_travel | https://sketchfab.com/3d-models/ferris-wheel-low-poly-669f98a3dcf34443ae88062e498b05bb | CC-BY | original use was manga BG; reads well at small scale |
| 5 | Animated Ferris Wheel by Arif (Poly Pizza) | https://poly.pizza/m/HknNtngih0 | CC-BY | **animated → strip animation channel before use** |
| 6 | Ferris wheel by Poly/Google (Poly Pizza) | https://poly.pizza/m/5KiVEnXN5Cw | CC-BY | Google Poly archive, very low-poly |

**Recommendation**: use pick #1 (Vetech82) as the primary; if license check fails, fall back to #2. **However**, our scene needs the wheel to be **split into hub + arm + gondola** so we can animate the ring and the gondolas independently — see [SCENE_STRUCTURE](../graphics/SCENE_STRUCTURE.md) §3.1. Likely we'll import the model and **manually split it in Blender** into the named sub-meshes.

### 2.2 Carousel & horses

| # | Asset | URL | License | Notes |
| --- | --- | --- | --- | --- |
| 1 | **Carousel** by Tomas Rubianes (rasamot) | https://sketchfab.com/3d-models/carousel-892f9fd08d3b4c6ab350dfc9ae658dbe | CC-BY | full carousel rig — best starting point |
| 2 | Carousel Ride by Matt LeMoine | https://sketchfab.com/3d-models/carousel-ride-fba414bc79bf469899859875bdedfd2e | CC-BY | clean stylized; published Oct 2019 |
| 3 | Carousel by claravnelson | https://sketchfab.com/3d-models/carousel-c3656ae0fbc8492dafb281fe2477e02e | CC-BY | alt with painted finish |
| 4 | **Carousel Horse** by Ramón Ruiz | https://sketchfab.com/3d-models/carousel-horse-7872323d00cf4654845c8f39d907e57d | CC-BY | 2.3 k triangles, 1.2 k vertices — perfect budget |
| 5 | Simple carousel horse by Kaa | https://sketchfab.com/3d-models/simple-carousel-horse-85c8cca7cb8b403192311c110be7fce2 | CC-BY | alt, simpler |

**Recommendation**: take the carousel platform + canopy from #1, take the horse mesh from #4 (instance 8× ourselves to match [SCENE_STRUCTURE](../graphics/SCENE_STRUCTURE.md) §3.2 — we want 8 horses, not whatever the source ships).

### 2.3 Roller coaster cart

| # | Asset | URL | License | Notes |
| --- | --- | --- | --- | --- |
| 1 | **Roller coaster cart** by SuperSnazzyBear | https://sketchfab.com/3d-models/roller-coaster-cart-66394f093eec43b3ac210b1d92f534ae | CC-BY | 1.4 k tri, 940 vert; perfect budget — top pick |
| 2 | Roller Coaster pack by Cihan | https://sketchfab.com/3d-models/roller-coaster-pack-88e455e875354b2ea1780174dddba2f2 | CC-BY | bundle with modular track AND cars — fallback if we want pre-made track |
| 3 | Low Poly Mine Cart by Digital.Dream.Realm | https://sketchfab.com/3d-models/low-poly-mine-cart-c3b25494129145e6a93dbb72067f20e8 | CC-BY | alt mine-cart look |

### 2.4 Roller coaster track / rail

We are generating the rail procedurally via `TubeGeometry(curve, ...)` — see [SCENE_STRUCTURE](../graphics/SCENE_STRUCTURE.md) §3.3. **No model needed.**

If we change our mind, pick #2 above includes modular track pieces.

### 2.5 Tagada mechanical arm ride

**No exact match found on Sketchfab for a "Tagada" amusement ride.** A real Tagada is a rotating spinning-disc ride; the geometry we need is a base disc + nested rotating arms + a fast-spinning seat platform.

**Recommendation: kitbash from primitives** as described in [SCENE_STRUCTURE](../graphics/SCENE_STRUCTURE.md) §3.4 and [MODEL_LIST](MODEL_LIST.md) §1.4. The kitbash uses:
- `CylinderGeometry` for the base disc
- `BoxGeometry` + `Bevel` for the truss arms
- `CylinderGeometry` for the seat platform
- Texturing per the `mat.metal.painted` family.

This kitbash is ~3 hours of work in Blender or pure code. The Tagada is the marquee "uniqueness" item — keeping it custom is intentional.

**Fallback**: the `Amusement park rides set` collection by afelion16 may contain something close: https://sketchfab.com/afelion16/collections/amusement-park-assets-e87730ae9d6840a19d4ba126c193a0c0 — inspect manually.

## 3. Park Props

### 3.1 Lamppost

| # | Asset | URL | License | Notes |
| --- | --- | --- | --- | --- |
| 1 | **Victorian Street Lamp Simplified 1900s** by i-m-a-kitty-cat | https://sketchfab.com/3d-models/victorian-street-lamp-simplified-1900s-29062e9363d240b49f04346b896692f7 | CC-BY | matches the "carnival = vintage" mood |
| 2 | Victorian street lamp by pgonarg | https://sketchfab.com/3d-models/victorian-street-lamp-4a53d586dadb499bb785daf868566667 | CC-BY | richer detail; pick if budget allows |
| 3 | Various Low-Poly Street Lights by KMB3D | https://sketchfab.com/3d-models/various-low-poly-street-lights-1173b0c4d9b0400bbeaafbee0e94ca59 | CC-BY | pack with several variants |
| 4 | Low-Poly Lamp Post by Memorie | https://sketchfab.com/3d-models/low-poly-lamp-post-c466684e819a4428b6d8ed50537615e4 | CC-BY | clean Blender 2.8 model |
| 5 | Street lamp (low poly) by pinokio21 | https://sketchfab.com/3d-models/street-lamp-low-poly-17e2bc2ec7de42d08d98e3a6c886a8b2 | CC-BY | 972 tri, 523 vert |

**Recommendation**: #1 Victorian Street Lamp — matches the vintage carnival aesthetic. Instance 12 times via `InstancedMesh` (see [SCENE_STRUCTURE](../graphics/SCENE_STRUCTURE.md) §5.2).

Alternative: lampposts are also in **Kenney Nature Kit** (CC0), no attribution needed. **This is the path of least resistance**.

### 3.2 Bench

**Primary**: **Kenney Nature Kit** (https://kenney.nl/assets/nature-kit) — CC0, includes park benches in low-poly style consistent with our overall direction. Use the `bench.glb` from that pack.

### 3.3 Tree

**Primary**: **Kenney Nature Kit** (https://kenney.nl/assets/nature-kit) — CC0, includes ~10 tree variants.

**Alternative if we want denser/Ghibli style**: Quaternius Stylized Nature MegaKit (https://quaternius.itch.io/stylized-nature-megakit) — CC0, 40 tree variants.

Pick 2–3 tree types and instance them via `InstancedMesh`.

### 3.4 Food stand / kiosk

| # | Asset | URL | License | Notes |
| --- | --- | --- | --- | --- |
| 1 | **Stylized Carnival Booth** by Keyotine | https://sketchfab.com/3d-models/stylized-carnival-booth-d8b4a661d433494184403c621818a424 | CC-BY | designed for an "old, broken down carnival" — best thematic fit |
| 2 | Wood and Concrete Booth Stall Kiosk by JeffK | https://sketchfab.com/3d-models/wood-and-concrete-booth-stall-kiosk-baked-shadow-13bdd917f7f34901a3d5aca0b2ead8c3 | CC-BY | modular, baked shadow; useful as base mesh |
| 3 | Shack Style Restaurant/Shop/Booth by JeffK | https://sketchfab.com/3d-models/shack-style-restaurant-shop-or-booth-53655d3373494537b518c1eb884176a7 | CC-BY | wood + corrugated metal aesthetic |

**Recommendation**: take #1 (carnival booth) as the master food-stand mesh; for 5 of the 6 stands, retexture it; for the 6th use #2 to break monotony.

### 3.5 Performance stage

**No clean Sketchfab hit.** Kitbash from primitives:
- `BoxGeometry` platform 6 × 0.5 × 4 m
- back wall `BoxGeometry` 6 × 3 × 0.2 m
- two side posts
- texture with `mat.wood.varnished`

The stage is small enough (~15 minutes) that a kitbash is fastest. See [MODEL_LIST](MODEL_LIST.md) §2 row "Performance stage".

### 3.6 Fence post / fence section

**Primary**: **Kenney Nature Kit** (CC0) ships fence assets. Use those instanced along the park perimeter.

Alternative: kitbash a simple `BoxGeometry` post + horizontal rail; texturable with `mat.wood.varnished`.

### 3.7 Welcome arch / entry sign

| # | Asset | URL | License | Notes |
| --- | --- | --- | --- | --- |
| 1 | **CC0 — Neon Sign Open** by plaggy | https://sketchfab.com/3d-models/cc0-neon-sign-open-9a924db296cf4a1eb12991702ab48da5 | **CC0** | clean neon, 974 polys; we re-letter the text to "LUNA PARK" in Blender |
| 2 | NEONPLEX collection (Balloon Entrance Arch + Neon variants) | https://sketchfab.com/NEONPLEX | varies | inspect license per item |

**Recommendation**: #1 Neon Sign Open — CC0 = no attribution headache. Edit the letters in Blender to read "LUNA PARK".

### 3.8 Trash bin

| # | Asset | URL | License | Notes |
| --- | --- | --- | --- | --- |
| 1 | **City Park Trash Bin Garbage Can Game Ready** by KQ92 | https://sketchfab.com/3d-models/city-park-trash-bin-garbage-can-game-ready-f31efce945584b9791abd1a38afaf575 | CC-BY | game-ready, perfect topology |
| 2 | Plastic Trash Bin FREE Low Poly by LordSamueliSolo | https://sketchfab.com/3d-models/plastic-trash-bin-free-low-poly-13f7b7307ead4c34b28018ded717cb55 | CC-BY | 1 k vert, 1.5 k tri |
| 3 | Trash Bin Pack by Lupu Marius | https://sketchfab.com/3d-models/trash-bin-pack-low-poly-078b6fdb708548feba2965bbfc4660df | CC-BY | pack of 2 bins + bags |

**Recommendation**: #1 City Park Trash Bin. Three placed around the park.

## 4. Characters (Visitors)

| # | Asset | URL | License | Notes |
| --- | --- | --- | --- | --- |
| 1 | **Kenney Mini Characters** | https://kenney.nl/assets/mini-characters | **CC0** | 12 characters with 32 animations — **we use only the static rest-pose mesh, strip the animation tracks** |
| 2 | Kenney Modular Character (75+ skins) | search `kenney.nl/assets/` for "Character" | CC0 | modular pack with skins and accessories |

**HARD RULE — animations forbidden**: when importing these characters, the `.glb` MUST be opened in Blender → all animations removed → re-exported. The `tools/audit-glb.js` script in [ASSET_PIPELINE](ASSET_PIPELINE.md) §6 enforces zero animation channels at commit time. The **arm/leg swinging** of our visitors is done in JavaScript per [ANIMATION_SYSTEM](../interaction/ANIMATION_SYSTEM.md) §3.5 — not by playing back imported clips.

## 5. Useful Collections to Browse

These collections are curated by other users and may contain assets matching adjacent needs:

- **Amusement Park Assets** by afelion16 — https://sketchfab.com/afelion16/collections/amusement-park-assets-e87730ae9d6840a19d4ba126c193a0c0
- **Carnival** by Raj.Francis — https://sketchfab.com/Raj.Francis/collections/carnival-9c4a7e867435484290e98e0e475d4fe4
- **Rollercoasters** by DaddyVivi — https://sketchfab.com/DaddyVivi/collections/rollercoasters-57a2d699b9c346c19953bb86126933d7

When time permits, scan these for backup options or unexpected gems (a vintage Tagada might hide in there).

## 6. Coverage Summary

| Item | Source picked | Strategy |
| --- | --- | --- |
| 1. Ferris wheel | Vetech82 "LunaPark — Ferris wheel" (Sketchfab CC-BY) | download + split in Blender |
| 2. Carousel platform + canopy | Tomas Rubianes (Sketchfab CC-BY) | download + use as-is |
| 3. Carousel horses | Ramón Ruiz (Sketchfab CC-BY) | download, instance 8× |
| 4. Roller-coaster cart | SuperSnazzyBear (Sketchfab CC-BY) | download |
| 5. Track / rail | none | procedural via `TubeGeometry` |
| 6. Tagada arm | none | **kitbash from primitives** |
| 7. Lamppost | Kenney Nature Kit (CC0) — or Victorian Street Lamp (Sketchfab CC-BY) | bundle or solo |
| 8. Park bench | Kenney Nature Kit (CC0) | bundle |
| 9. Tree | Kenney Nature Kit (CC0) | bundle |
| 10. Food stand | Stylized Carnival Booth by Keyotine (Sketchfab CC-BY) | download |
| 11. Performance stage | none | kitbash from primitives |
| 12. Fence post | Kenney Nature Kit (CC0) | bundle |
| 13. Welcome arch | CC0 — Neon Sign Open by plaggy (Sketchfab CC0) | download + re-letter |
| 14. Trash bin | City Park Trash Bin by KQ92 (Sketchfab CC-BY) | download |
| 15. Visitor character | Kenney Mini Characters (CC0) | bundle, **strip animations** |

**Tally**: 8 from Sketchfab CC-BY, 5 from Kenney/Quaternius bundles (CC0), 2 kitbashed in-house, 1 procedural in-code. Every license is permissive enough for a university project. The CC0 entries need no attribution; the CC-BY entries are credited in `assets/CREDITS.md`.

## 7. Attribution Template

`assets/CREDITS.md` will look like:

```
# Asset Credits

## Models

### Ferris Wheel
- Source: https://sketchfab.com/3d-models/lunapark-ferris-wheel-afa6057645424f2eb5df1f8ad61c5cb3
- Author: Vetech82
- License: CC-BY 4.0
- Modifications: split into named sub-meshes (hub, ring, arm, gondola) in Blender; re-UV-mapped some pieces

### Carousel
- Source: https://sketchfab.com/3d-models/carousel-892f9fd08d3b4c6ab350dfc9ae658dbe
- Author: Tomas Rubianes (rasamot)
- License: CC-BY 4.0
- Modifications: removed pre-existing animation track; extracted canopy to separate `.glb`

... etc. for every CC-BY asset ...

## Bundles (CC0 — no attribution required, listed for transparency)

- Kenney — Holiday Kit (kenney.nl/assets/holiday-kit, CC0)
- Kenney — Nature Kit (kenney.nl/assets/nature-kit, CC0)
- Kenney — Mini Characters (kenney.nl/assets/mini-characters, CC0)
```

## 8. Pre-Download Checklist (per asset)

Before clicking "Download" on any Sketchfab page:

- [ ] License visible on the asset page is CC0 or CC-BY (not CC-BY-NC, not Sketchfab Standard)
- [ ] Author name recorded
- [ ] License string recorded verbatim
- [ ] Format available: `.glb` preferred, `.gltf` second, `.fbx` third (we'll convert)
- [ ] Triangle count visible and within the [MODEL_LIST](MODEL_LIST.md) budget
- [ ] If the asset is "Animated", note that we must strip animations after import

This checklist plus the auto-audit (zero animation channels at commit) keeps us legally clean.

## 9. Backup Plan if a Source URL Goes Dead

The web is volatile. If any URL above returns 404 the day before submission:
1. Search `<asset name> low poly free` on Sketchfab again and pick a similar CC-BY entry.
2. Fall back to the Kenney Holiday Kit (CC0) — its 100 assets cover most carnival props.
3. Fall back to kitbashing from primitives.

Because we plan ahead (M5 = materials & cycle; we should have all assets in hand by mid-M3 = early June), we have weeks of slack to source replacements.

---

Sources:
- [Kenney — Holiday Kit](https://kenney.nl/assets/holiday-kit)
- [Kenney — Nature Kit](https://kenney.nl/assets/nature-kit)
- [Kenney — Mini Characters](https://kenney.nl/assets/mini-characters)
- [Quaternius — Stylized Nature MegaKit](https://quaternius.itch.io/stylized-nature-megakit)
- [Quaternius — 150+ LowPoly Nature Models](https://quaternius.itch.io/150-lowpoly-nature-models)
- [LunaPark — Ferris wheel (Vetech82)](https://sketchfab.com/3d-models/lunapark-ferris-wheel-afa6057645424f2eb5df1f8ad61c5cb3)
- [Wheel of Brisbane (low-poly)](https://sketchfab.com/3d-models/wheel-of-brisbane-ferris-wheel-low-poly-free-6e6178b07a594385a60452f7c1319493)
- [Carousel by Tomas Rubianes](https://sketchfab.com/3d-models/carousel-892f9fd08d3b4c6ab350dfc9ae658dbe)
- [Carousel Ride by Matt LeMoine](https://sketchfab.com/3d-models/carousel-ride-fba414bc79bf469899859875bdedfd2e)
- [Carousel Horse by Ramón Ruiz](https://sketchfab.com/3d-models/carousel-horse-7872323d00cf4654845c8f39d907e57d)
- [Simple carousel horse by Kaa](https://sketchfab.com/3d-models/simple-carousel-horse-85c8cca7cb8b403192311c110be7fce2)
- [Roller coaster cart by SuperSnazzyBear](https://sketchfab.com/3d-models/roller-coaster-cart-66394f093eec43b3ac210b1d92f534ae)
- [Roller Coaster pack by Cihan](https://sketchfab.com/3d-models/roller-coaster-pack-88e455e875354b2ea1780174dddba2f2)
- [Victorian Street Lamp by i-m-a-kitty-cat](https://sketchfab.com/3d-models/victorian-street-lamp-simplified-1900s-29062e9363d240b49f04346b896692f7)
- [Various Low-Poly Street Lights by KMB3D](https://sketchfab.com/3d-models/various-low-poly-street-lights-1173b0c4d9b0400bbeaafbee0e94ca59)
- [Stylized Carnival Booth by Keyotine](https://sketchfab.com/3d-models/stylized-carnival-booth-d8b4a661d433494184403c621818a424)
- [Wood and Concrete Booth Stall Kiosk by JeffK](https://sketchfab.com/3d-models/wood-and-concrete-booth-stall-kiosk-baked-shadow-13bdd917f7f34901a3d5aca0b2ead8c3)
- [CC0 Neon Sign Open by plaggy](https://sketchfab.com/3d-models/cc0-neon-sign-open-9a924db296cf4a1eb12991702ab48da5)
- [City Park Trash Bin by KQ92](https://sketchfab.com/3d-models/city-park-trash-bin-garbage-can-game-ready-f31efce945584b9791abd1a38afaf575)
- [Amusement Park Assets collection by afelion16](https://sketchfab.com/afelion16/collections/amusement-park-assets-e87730ae9d6840a19d4ba126c193a0c0)
- [Poly Pizza — Ferris wheel by Poly/Google](https://poly.pizza/m/5KiVEnXN5Cw)
- [Poly Pizza — Animated Ferris Wheel by Arif](https://poly.pizza/m/HknNtngih0)
