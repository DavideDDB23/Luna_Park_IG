# TEXTURE LIST

> Companion to: [MATERIAL_SYSTEM](../graphics/MATERIAL_SYSTEM.md) · [ASSET_PIPELINE](ASSET_PIPELINE.md)

The course explicitly demands **textures of different kinds (color, normal, specular, ...)** — `Project_Requirements.pdf` page 3. We ship six material families, each with three or more texture channels.

## 1. Texture Channel Glossary

| Channel | Aka | Encoded | Slot in `MeshStandardMaterial` | Slot in `MeshPhongMaterial` |
| --- | --- | --- | --- | --- |
| Base color / albedo | color, diffuse | sRGB | `map` | `map` |
| Normal | tangent-space normal | linear | `normalMap` | `normalMap` |
| Specular | non-PBR specular intensity | linear | n/a (Phong only) | `specularMap` |
| Roughness | surface micro-rough | linear | `roughnessMap` | n/a |
| Metalness | metalness factor | linear | `metalnessMap` | n/a |
| AO | ambient occlusion | linear | `aoMap` | `aoMap` |
| Emissive | self-illumination color | sRGB or linear | `emissiveMap` | `emissiveMap` |
| Alpha | opacity mask | linear single-channel | `alphaMap` | `alphaMap` |

## 2. Master Texture List

Each row = one texture file. Filenames follow `<family>_<channel>.<ext>`.

### 2.1 Ground & paths

| File | Channel | Resolution | Filter | Wrap | Anisotropy | Source | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| grass_basecolor.webp | color | 2048² | Linear-Linear | Repeat | 16 | PolyHaven | tile 40× across the plane |
| grass_normal.png | normal | 2048² | Linear-Linear | Repeat | 16 | PolyHaven | OpenGL Y-up |
| grass_mra.webp | packed (AO,rough,metal) | 2048² | Linear-Linear | Repeat | 16 | PolyHaven + pack tool | R=AO, G=rough, B=metal |
| asphalt_basecolor.webp | color | 2048² | Linear-Linear | Repeat | 16 | AmbientCG | path |
| asphalt_normal.png | normal | 2048² | Linear-Linear | Repeat | 16 | AmbientCG | crack detail |
| asphalt_mra.webp | packed | 2048² | Linear-Linear | Repeat | 16 | AmbientCG | high roughness |

### 2.2 Metal (rides, lamppost poles)

| File | Channel | Res | Source | Notes |
| --- | --- | --- | --- | --- |
| metal_painted_basecolor.webp | color | 2048² | AmbientCG painted-metal-007 | re-tinted to carnival palette |
| metal_painted_normal.png | normal | 2048² | AmbientCG | bolt and seam details |
| metal_painted_mra.webp | packed | 2048² | derived | metalness 1, roughness 0.4 |

### 2.3 Painted wood (carousel, stand counters)

| File | Channel | Res | Source | Notes |
| --- | --- | --- | --- | --- |
| wood_varnished_basecolor.webp | color | 1024² | AmbientCG wood-009 | re-tinted reds and creams |
| wood_varnished_normal.png | normal | 1024² | AmbientCG | grain |
| wood_varnished_roughness.png | roughness | 1024² | AmbientCG | low-mid roughness for varnish |

### 2.4 Horses (Phong-shaded)

| File | Channel | Res | Source | Notes |
| --- | --- | --- | --- | --- |
| horse_basecolor.webp | color | 1024² | painted in Krita | white body, painted mane |
| horse_normal.png | normal | 1024² | derived in Materialize | shallow saddle relief |
| horse_specular.png | specular | 1024² | painted | high on varnish areas (mane), low on saddle |

### 2.5 Fabric (food-stand tarps)

| File | Channel | Res | Source | Notes |
| --- | --- | --- | --- | --- |
| fabric_striped_basecolor.webp | color | 1024² | painted | red-white candy stripes |
| fabric_striped_normal.png | normal | 1024² | derived | gentle weave |
| fabric_striped_alpha.png | alpha mask | 1024² | painted | frangiated edge for the scallops |

### 2.6 Cubemaps (sky)

| File | Channel | Res | Source | Notes |
| --- | --- | --- | --- | --- |
| sky_day_px.hdr ... sky_day_nz.hdr | environment | 1024² × 6 | PolyHaven HDRI | "sunny day" |
| sky_night_px.hdr ... sky_night_nz.hdr | environment | 512² × 6 | PolyHaven HDRI | "starry night" — augmented procedurally |

### 2.7 Decals & emissive

| File | Channel | Res | Source | Notes |
| --- | --- | --- | --- | --- |
| sign_neon_color.webp | color | 1024² | painted | "LUNA PARK" letters |
| sign_neon_emissive.webp | emissive | 1024² | derived | matches color, used at night |
| window_warm_emissive.webp | emissive | 512² | painted | warm yellow blocks for stand windows |
| neon_pattern_strip.png | color, 1D | 256 × 16 | painted | for the chase-light `neon` shader |

### 2.8 HUD icons

| File | Channel | Res | Source | Notes |
| --- | --- | --- | --- | --- |
| help.svg, fps.svg, palette.svg, etc. | vector | 64² | Kenney UI Pack | reused for HUD |

## 3. Packing Convention (MRA)

To minimize texture units / fetches:

```
mra.png
  R channel → AO
  G channel → Roughness
  B channel → Metalness
```

Pack script: `tools/pack-mra.js` (offline only, output committed).

In Three.js loading:
```
material.aoMap        = mra
material.roughnessMap = mra
material.metalnessMap = mra
material.aoMapIntensity = 1.0
```

All three slots use the same texture object — Three.js automatically picks the corresponding channel via the shader's swizzle.

## 4. Format Choices

| Channel kind | Format | Why |
| --- | --- | --- |
| Color (visible to humans) | WebP lossless | small, supported, no banding |
| Normal | PNG lossless | normals must NOT be lossy (banding becomes visible artifacts on lit surfaces) |
| Roughness / metalness / AO / alpha | WebP lossless or PNG | 1-2 % size savings; both fine |
| HDR cubemaps | .hdr (Radiance) | dynamic range; loaded via RGBELoader |
| HUD icons | SVG | resolution-independent |

**KTX2 / Basis Universal** is a stretch optimization. It would cut texture memory ~6× but requires the KTX2Loader and Three.js wiring. Not on the critical path.

## 5. Color Space Settings (loader-side)

Every texture is loaded with a deliberate `colorSpace`:

| Channel | colorSpace |
| --- | --- |
| `map` (albedo) | `THREE.SRGBColorSpace` |
| `emissiveMap` (visible emission) | `THREE.SRGBColorSpace` |
| `normalMap` | `THREE.NoColorSpace` |
| `roughnessMap` / `metalnessMap` / `aoMap` / packed MRA | `THREE.NoColorSpace` |
| `alphaMap` | `THREE.NoColorSpace` |
| HDR cubemap | `THREE.LinearSRGBColorSpace` |

This is centralized in `AssetLoader.loadColor(...)`, `AssetLoader.loadData(...)`, `AssetLoader.loadHDR(...)`. Never set inline at the call site.

## 6. Filtering & Mipmaps

```
texture.minFilter    = THREE.LinearMipmapLinearFilter   // trilinear
texture.magFilter    = THREE.LinearFilter
texture.generateMipmaps = true

texture.anisotropy = renderer.capabilities.getMaxAnisotropy()
```

`anisotropy` is set per-texture; we only do it for the ground/asphalt where it gives the strongest visible improvement (Lecture 09 talking point).

Special cases:
- HUD icon textures: `NearestFilter` to keep them crisp.
- Procedural neon strip: `RepeatWrapping` on the strip's `u` axis so the chase pattern can scroll smoothly.

## 7. Wrapping

Default: `RepeatWrapping`. Exceptions:
- decals on a building face (no tile expected): `ClampToEdgeWrapping`
- sign textures: `ClampToEdgeWrapping`
- some painted assets where the UV unwrap is `[0, 1]`-bounded: `ClampToEdgeWrapping`

## 8. Sanity Checklist Per Texture

- [ ] Exact resolution match the table
- [ ] Correct file format
- [ ] Correct color space loaded
- [ ] Correct filter and wrap
- [ ] Mipmaps generated (file size on GPU is 1.33× the original; budgeted)
- [ ] Memory footprint estimated and added to running total

## 9. Memory Budget (recap)

(See [PERFORMANCE_OPTIMIZATION](../graphics/PERFORMANCE_OPTIMIZATION.md) §8 for the full accounting.)

Target ≤ 200 MB. The cubemaps are the heaviest cost (~96 MB combined). All other textures share ≈ 90 MB. Budget holds with margin.

## 10. Replacement & Hot-Swap Workflow

Replacing a texture requires only:
1. drop the new file in the same location with the same name
2. clear browser cache (or version-bump filename in the loader call)
3. visually verify

There is **no shader recompile** unless a new map slot is added (e.g. introducing emissive on a material that didn't have one). In that case the relevant `MaterialLibrary` entry is updated and the affected material is rebuilt at boot.

## 11. Pedagogical Talking Points

- "Every surface in the project carries at least three texture channels (color + normal + specular or roughness/metalness). The requirements ask for textures of different kinds — we ship them everywhere."
- "Normal maps are loaded as `NoColorSpace`; albedo as `SRGBColorSpace`. The mismatch is the #1 cause of black albedo or washed out colors — Lecture 03 on gamma and color spaces."
- "Mipmaps are generated automatically. We use trilinear + anisotropic on the ground specifically because the grazing-angle aliasing without it is severe — Lecture 09."
