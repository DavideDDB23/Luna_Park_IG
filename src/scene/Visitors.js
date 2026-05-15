import * as THREE from 'three';
import { AssetLoader } from '../core/AssetLoader.js';

// Static visitor placements around the park (no animation — JS-only constraint)
const PLACEMENTS = [
  { x:   2, z: -25, ry: 0.5,    model: 0 },
  { x:  -2, z: -25, ry: -0.3,   model: 1 },
  { x:   6, z: -10, ry: 1.2,    model: 2 },
  { x:   4, z:   5, ry: -0.8,   model: 3 },
  { x:  -2, z:  20, ry: 0.0,    model: 4 },
  { x:   3, z:  30, ry: 2.5,    model: 5 },
  { x: -20, z:  -5, ry: -1.0,   model: 0 },
  { x: -22, z:   8, ry: 1.6,    model: 1 },
  { x:  10, z: -35, ry: 0.2,    model: 2 },
  { x:   8, z:  42, ry: 3.1,    model: 3 },
  { x:  -5, z: -40, ry: -0.5,   model: 4 },
  { x:  18, z:  10, ry: 0.7,    model: 5 },
];

const URLS = [
  'assets/models/characters/visitor_male_a.glb',
  'assets/models/characters/visitor_female_a.glb',
  'assets/models/characters/visitor_male_b.glb',
  'assets/models/characters/visitor_female_b.glb',
  'assets/models/characters/visitor_male_c.glb',
  'assets/models/characters/visitor_female_c.glb',
];

function makeFallback() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.22, 0.8, 4, 8),
    new THREE.MeshStandardMaterial({ color: 0x4488cc, roughness: 0.8 }),
  );
  body.position.y = 0.9;
  body.castShadow = true;
  g.add(body);
  return g;
}

export class Visitors {
  constructor(worldGroup) {
    this._parent = worldGroup;
    this._placeholders = [];
    for (const p of PLACEMENTS) {
      const fb = makeFallback();
      fb.position.set(p.x, 0, p.z);
      fb.rotation.y = p.ry;
      fb.name = 'visitor_fallback';
      worldGroup.add(fb);
      this._placeholders.push({ fb, p });
    }
  }

  async loadAsync() {
    const loader = new AssetLoader();
    const templates = await Promise.all(
      URLS.map(url => loader.loadModelOrFallback(url, () => null)),
    );
    const ok = templates.filter(Boolean);
    if (ok.length === 0) return;

    for (const { fb, p } of this._placeholders) {
      const tpl = templates[p.model] ?? ok[0];
      if (!tpl) continue;

      const clone = tpl.clone(true);
      clone.position.set(p.x, 0, p.z);
      clone.rotation.y = p.ry;
      clone.scale.setScalar(0.9); // native ~2m bounds (includes bone rig); person ~1.8m
      clone.name = 'visitor';
      clone.traverse(n => { if (n.isMesh) { n.castShadow = true; n.receiveShadow = false; } });
      this._parent.add(clone);
      this._parent.remove(fb);
    }
  }

  update(_dt) {}
}
