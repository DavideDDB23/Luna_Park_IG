import * as THREE from 'three';
import { AssetLoader } from '../core/AssetLoader.js';

// Park entrance — neon "OPEN" sign placed above the south gate (z≈52, x=0)
const ENTRANCE_POS = new THREE.Vector3(0, 3.5, 50);
const ENTRANCE_SCALE = 0.45; // native ~16.65m wide → ~7.5m at 0.45

function makeFallbackArch() {
  const g = new THREE.Group();
  // Two columns
  for (const sx of [-3, 3]) {
    const col = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.22, 5.5, 10),
      new THREE.MeshStandardMaterial({ color: 0x334466, roughness: 0.5, metalness: 0.7 }),
    );
    col.position.set(sx, 2.75, 0);
    col.castShadow = true;
    g.add(col);
  }
  // Lintel
  const lintel = new THREE.Mesh(
    new THREE.BoxGeometry(7.5, 0.4, 0.4),
    new THREE.MeshStandardMaterial({ color: 0x334466, roughness: 0.5, metalness: 0.7 }),
  );
  lintel.position.y = 5.7;
  g.add(lintel);
  // Sign board
  const sign = new THREE.Mesh(
    new THREE.BoxGeometry(5.0, 1.0, 0.1),
    new THREE.MeshStandardMaterial({ color: 0xffaa00, emissive: 0xff7700, emissiveIntensity: 0.8, roughness: 0.3 }),
  );
  sign.position.y = 4.5;
  g.add(sign);
  return g;
}

export class WelcomeArch {
  constructor(worldGroup) {
    this._parent = worldGroup;
    this._placeholder = makeFallbackArch();
    this._placeholder.position.copy(ENTRANCE_POS);
    this._placeholder.name = 'welcomeArch_fallback';
    worldGroup.add(this._placeholder);
  }

  async loadAsync() {
    const loader = new AssetLoader();
    const model = await loader.loadModelOrFallback(
      'assets/models/props/welcome_arch/scene.gltf',
      () => null,
    );
    if (!model) return;

    model.position.copy(ENTRANCE_POS);
    model.scale.setScalar(ENTRANCE_SCALE);
    model.name = 'welcomeArch';
    model.traverse(n => {
      if (n.isMesh) {
        n.castShadow = true;
        n.receiveShadow = false;
      }
    });
    this._parent.add(model);
    this._parent.remove(this._placeholder);
  }
}
