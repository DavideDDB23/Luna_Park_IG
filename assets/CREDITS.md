# Asset Credits

## Third-Party Libraries (vendored under vendor/)

| Library | Version | License | Source |
|---------|---------|---------|--------|
| three.js | 0.160.0 | MIT | https://threejs.org |
| @tweenjs/tween.js | 23.1.3 | MIT | https://github.com/tweenjs/tween.js |
| lil-gui | 0.19.2 | MIT | https://github.com/georgealways/lil-gui |
| stats.js | 0.17.0 | MIT | https://github.com/mrdoob/stats.js |

## 3D Models

No external 3D models are used. All geometry is constructed procedurally via Three.js
primitives (BoxGeometry, CylinderGeometry, SphereGeometry, TorusGeometry, TubeGeometry,
CatmullRomCurve3, etc.). The AssetLoader supports dropping `.glb` files into
`assets/models/` for automatic loading with graceful primitive fallback.

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
