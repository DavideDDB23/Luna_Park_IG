import * as THREE from 'three';
import { AssetLoader } from '../core/AssetLoader.js';

// Food stand + trash bin placement around the park
const STAND_PLACEMENTS = [
  { x:  8,  z: -30, ry: -Math.PI / 2 },
  { x:  8,  z:  -5, ry: -Math.PI / 2 },
  { x:  8,  z:  20, ry: -Math.PI / 2 },
];

const BIN_PLACEMENTS = [
  { x:  6,  z: -20 },
  { x:  6,  z:   5 },
  { x: -5,  z: -35 },
  { x: 25,  z:   0 },
];

function makeFallbackStand() {
  const g = new THREE.Group();
  const box = new THREE.Mesh(
    new THREE.BoxGeometry(2.0, 2.2, 1.5),
    new THREE.MeshStandardMaterial({ color: 0xcc3344, roughness: 0.7 }),
  );
  box.position.y = 1.1;
  box.castShadow = true;
  g.add(box);
  return g;
}

function makeFallbackBin() {
  const g = new THREE.Group();
  const bin = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2, 0.18, 0.8, 8),
    new THREE.MeshStandardMaterial({ color: 0x2a3a2a, roughness: 0.8 }),
  );
  bin.position.y = 0.4;
  bin.castShadow = true;
  g.add(bin);
  return g;
}

export class Stands {
  constructor(worldGroup) {
    this._parent      = worldGroup;
    this._standPH     = [];
    this._binPH       = [];

    for (const p of STAND_PLACEMENTS) {
      const fb = makeFallbackStand();
      fb.position.set(p.x, 0, p.z);
      fb.rotation.y = p.ry;
      fb.name = 'foodstand_fallback';
      worldGroup.add(fb);
      this._standPH.push({ fb, p });
    }

    for (const p of BIN_PLACEMENTS) {
      const fb = makeFallbackBin();
      fb.position.set(p.x, 0, p.z);
      fb.name = 'trashbin_fallback';
      worldGroup.add(fb);
      this._binPH.push({ fb, p });
    }
  }

  async loadAsync() {
    const loader = new AssetLoader();
    const [standModel, binModel] = await Promise.all([
      loader.loadModelOrFallback('assets/models/props/food_stand/scene.gltf', () => null),
      loader.loadModelOrFallback('assets/models/props/trash_bin/scene.gltf',  () => null),
    ]);

    if (standModel) {
      for (const { fb, p } of this._standPH) {
        const clone = standModel.clone(true);
        clone.position.set(p.x, 0, p.z);
        clone.rotation.y = p.ry;
        clone.scale.setScalar(0.8); // native height ~4.6m → 3.7m at 0.8
        clone.name = 'foodstand';
        clone.traverse(n => { if (n.isMesh) { n.castShadow = true; n.receiveShadow = false; } });
        this._parent.add(clone);
        this._parent.remove(fb);
      }
    }

    if (binModel) {
      for (const { fb, p } of this._binPH) {
        const clone = binModel.clone(true);
        clone.position.set(p.x, 0, p.z);
        clone.scale.setScalar(1.0); // native size ~0.65m × 0.73m — correct as-is
        clone.name = 'trashbin';
        clone.traverse(n => { if (n.isMesh) { n.castShadow = true; n.receiveShadow = false; } });
        this._parent.add(clone);
        this._parent.remove(fb);
      }
    }
  }
}
