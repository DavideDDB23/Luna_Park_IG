import * as THREE from 'three';

// Placeholder — real loaders (GLTFLoader, RGBELoader) wired in later milestones.
export class AssetLoader {
  constructor() {
    this._texLoader = new THREE.TextureLoader();
  }

  loadTexture(url) {
    return new Promise((res, rej) => this._texLoader.load(url, res, undefined, rej));
  }
}
