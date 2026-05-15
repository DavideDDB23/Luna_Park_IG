# Asset Credits

## Third-Party Libraries (vendored under vendor/)

| Library | Version | License | Source |
|---------|---------|---------|--------|
| three.js | 0.160.0 | MIT | https://threejs.org |
| @tweenjs/tween.js | 23.1.3 | MIT | https://github.com/tweenjs/tween.js |
| lil-gui | 0.19.2 | MIT | https://github.com/georgealways/lil-gui |
| stats.js | 0.17.0 | MIT | https://github.com/mrdoob/stats.js |

## 3D Models

All models live under `assets/models/`. The engine loads each via `AssetLoader.loadModelOrFallback`
and falls back to procedural primitives if the file is missing. Animation tracks are stripped
from every file (course hard constraint: JS-only animations).

### Rides

| File | Title | Author | License |
|------|-------|--------|---------|
| `rides/ferris_wheel/` | Wheel Of Brisbane Ferris Wheel (Low-Poly) | Jotrain Models | Sketchfab Standard |
| `rides/carousel/` | Carousel | Tomas Rubianes | CC-BY-4.0 |
| `rides/coaster_cart/` | Roller coaster cart | SuperSnazzyBear | CC-BY-4.0 |

### Props

| File | Title | Author | License |
|------|-------|--------|---------|
| `props/lamppost/` | Victorian Street Lamp Simplified 1900s | i-m-a-kitty-cat | CC-BY-4.0 |
| `props/welcome_arch/` | CC0 — Neon Sign Open | plaggy | CC-BY-4.0 |
| `props/food_stand/` | Stylized Carnival Booth | Keyotine | CC-BY-4.0 |
| `props/trash_bin/` | City Park Trash Bin Garbage Can Game Ready | KQ92 | CC-BY-4.0 |
| `props/bench.glb` | Kenney Holiday Kit — bench | Kenney | CC0 |
| `props/fence.glb` | Kenney Nature Kit — fence_simple | Kenney | CC0 |

### Trees

| File | Source | License |
|------|--------|---------|
| `trees/tree_default.glb`, `tree_pine.glb`, `tree_oak.glb`, `tree_small.glb` | Kenney Nature Kit | CC0 |

### Characters (Visitors)

| Files | Source | License |
|-------|--------|---------|
| `characters/visitor_male_*.glb`, `visitor_female_*.glb` | Kenney Mini Characters | CC0 |

## Textures

All textures are **procedurally generated** at runtime via the HTML Canvas API
(`src/materials/ProceduralTextures.js`). No external image files are used.

| Texture set | Generation method | Channels |
|-------------|------------------|----------|
| Grass (ground) | Smooth-noise + blade strokes, CanvasTexture | color, normal, roughness |
| Asphalt (paths) | Noise + speckle, CanvasTexture | color, normal, roughness |
| Metal painted | Horizontal-scratch noise, CanvasTexture | color, normal, ORM packed |
| Wood varnished | Ring-grain sinusoid + noise, CanvasTexture | color, normal, roughness |
| Horse painted | Warm-cream noise base, CanvasTexture | color, normal, specular |
| Fabric striped | Alternating color stripes + noise, CanvasTexture | color, normal, alpha |
| Emissive window | Radial gradient glow, CanvasTexture | color, emissive |

All normal maps are computed from height fields via finite-difference gradient.
All textures use `THREE.RepeatWrapping` and `LinearMipmapLinearFilter`.
Grass color texture uses maximum anisotropic filtering.

## Fonts

No external fonts. All UI uses system fonts via lil-gui defaults and CSS
`font-family: system-ui, sans-serif`.

## Audio

No audio assets. (Out of scope for this course project.)

## Course License Note

This project is submitted for the Interactive Graphics course, Sapienza University
of Rome (Prof. Marco Schaerf, A.Y. 2025/26). All code is original student work.
Third-party libraries are used under their respective open-source licenses (MIT).
