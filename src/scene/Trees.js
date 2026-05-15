import * as THREE from 'three';
import { AssetLoader } from '../core/AssetLoader.js';

// Tree positions — avoids ride sites (all rides at x≈-15, z∈[-35..45])
const PLACEMENTS = [
  // Right side grove (x=18..45)
  { x:  22, z: -45, s: 1.10, r: 0.0,  type: 0 },
  { x:  30, z: -38, s: 0.90, r: 0.8,  type: 1 },
  { x:  38, z: -28, s: 1.20, r: 1.5,  type: 2 },
  { x:  42, z: -15, s: 0.80, r: 0.3,  type: 3 },
  { x:  40, z:   0, s: 1.05, r: 2.1,  type: 0 },
  { x:  38, z:  15, s: 0.95, r: 0.6,  type: 1 },
  { x:  42, z:  30, s: 1.15, r: 1.2,  type: 2 },
  { x:  32, z:  42, s: 0.85, r: 2.7,  type: 3 },
  { x:  20, z:  46, s: 1.00, r: 0.4,  type: 0 },
  // Left side (x=-35..-48)
  { x: -38, z: -42, s: 1.10, r: 1.0,  type: 1 },
  { x: -44, z: -25, s: 0.90, r: 2.3,  type: 2 },
  { x: -46, z:  -5, s: 1.20, r: 0.7,  type: 3 },
  { x: -44, z:  20, s: 0.85, r: 1.8,  type: 0 },
  { x: -40, z:  42, s: 1.05, r: 0.2,  type: 1 },
  // Back row (z=-48)
  { x:   0, z: -47, s: 1.00, r: 1.4,  type: 2 },
  { x:  10, z: -45, s: 0.90, r: 2.9,  type: 3 },
  { x: -10, z: -45, s: 1.15, r: 0.5,  type: 0 },
  // Near entrance clusters (z=44..50, away from centre)
  { x:  12, z:  47, s: 0.95, r: 1.1,  type: 1 },
  { x: -12, z:  47, s: 1.10, r: 2.5,  type: 2 },
  // Path-side singles (right of centre aisle)
  { x:  14, z: -18, s: 0.80, r: 0.9,  type: 3 },
  { x:  14, z:   2, s: 0.95, r: 3.0,  type: 0 },
  { x:  14, z:  22, s: 1.00, r: 1.6,  type: 1 },
  // Corners
  { x:  48, z: -48, s: 1.20, r: 0.1,  type: 2 },
  { x: -48, z: -48, s: 1.10, r: 2.0,  type: 3 },
  { x:  48, z:  48, s: 0.90, r: 1.3,  type: 0 },
  { x: -48, z:  48, s: 1.05, r: 0.8,  type: 1 },
];

function makeFallbackTree(s) {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.18, 2.2, 7),
    new THREE.MeshStandardMaterial({ color: 0x5a3820, roughness: 0.9, metalness: 0 }),
  );
  trunk.position.y = 1.1;
  trunk.castShadow = true;
  const canopy = new THREE.Mesh(
    new THREE.ConeGeometry(1.6, 3.5, 8),
    new THREE.MeshStandardMaterial({ color: 0x2d6a2a, roughness: 0.85, metalness: 0 }),
  );
  canopy.position.y = 4.0;
  canopy.castShadow = true;
  g.add(trunk, canopy);
  g.scale.setScalar(s);
  return g;
}

export class Trees {
  constructor(worldGroup) {
    this._parent = worldGroup;
    this._roots  = [];
    // Synchronous fallback trees — replaced when models load
    for (const p of PLACEMENTS) {
      const t = makeFallbackTree(p.s);
      t.position.set(p.x, 0, p.z);
      t.rotation.y = p.r;
      t.name = 'tree_fallback';
      worldGroup.add(t);
      this._roots.push({ placeholder: t, p });
    }
  }

  async loadAsync() {
    const loader = new AssetLoader();
    const URLS = [
      'assets/models/trees/tree_default.glb',
      'assets/models/trees/tree_pine.glb',
      'assets/models/trees/tree_oak.glb',
      'assets/models/trees/tree_small.glb',
    ];
    const templates = await Promise.all(
      URLS.map(url => loader.loadModelOrFallback(url, () => null)),
    );
    const ok = templates.filter(Boolean);
    if (ok.length === 0) return; // all failed — keep fallbacks

    for (const { placeholder, p } of this._roots) {
      const tpl = templates[p.type] ?? ok[0];
      if (!tpl) continue;

      const clone = tpl.clone(true);
      clone.position.set(p.x, 0, p.z);
      clone.rotation.y = p.r;
      clone.scale.setScalar(p.s * 3.5); // kenney trees ~1.1–1.7m tall → 3.5–7m at 3.5×
      clone.name = 'tree';
      clone.traverse(n => { if (n.isMesh) { n.castShadow = true; n.receiveShadow = false; } });
      this._parent.add(clone);
      this._parent.remove(placeholder);
    }
  }
}
