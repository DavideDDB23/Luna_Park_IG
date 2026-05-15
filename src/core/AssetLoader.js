import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class AssetLoader {
  constructor() {
    this._texLoader  = new THREE.TextureLoader();
    this._gltfLoader = new GLTFLoader();
  }

  // Returns Promise<THREE.Group> from a .glb path.
  loadGLTF(url) {
    return new Promise((resolve, reject) => {
      this._gltfLoader.load(url, gltf => resolve(gltf.scene), undefined, reject);
    });
  }

  // Tries to load a GLB; falls back silently to the primitive returned by fallbackFn().
  async loadModelOrFallback(url, fallbackFn) {
    try {
      const model = await this.loadGLTF(url);
      // Ensure no animation tracks slipped through (course hard constraint)
      model.traverse(n => {
        if (n.animations?.length) {
          console.warn(`[AssetLoader] stripped ${n.animations.length} animation track(s) from ${url}`);
          n.animations = [];
        }
      });
      return model;
    } catch {
      console.warn(`[AssetLoader] ${url} not found — using primitive fallback`);
      return fallbackFn();
    }
  }

  loadTexture(url) {
    return new Promise((res, rej) => this._texLoader.load(url, res, undefined, rej));
  }
}
