import * as THREE from 'three';
import { EffectComposer }  from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass }      from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass }      from 'three/addons/postprocessing/OutputPass.js';
import { isFast, isMobile } from '../utils/url.js';

// Composer chain (per POST_PROCESSING §1):
//   RenderPass → UnrealBloomPass → OutputPass
// On ?fast / ?mobile: direct render with renderer's own ACES tonemap (no bloom).

export class Composer {
  constructor(renderer, scene, camera) {
    this._renderer = renderer;
    this._scene    = scene;
    this._camera   = camera;
    this._fast     = isFast || isMobile;

    if (this._fast) {
      // Lightweight path: let renderer handle tone mapping
      renderer.toneMapping         = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.0;
      return;
    }

    // HDR composer pipeline — renderer must NOT apply its own tonemap
    renderer.toneMapping = THREE.NoToneMapping;

    const w = renderer.domElement.clientWidth  || window.innerWidth;
    const h = renderer.domElement.clientHeight || window.innerHeight;

    this._composer = new EffectComposer(renderer);
    this._composer.addPass(new RenderPass(scene, camera));

    const bloom = new UnrealBloomPass(
      new THREE.Vector2(w, h),
      0.6,   // strength
      0.4,   // radius
      0.85,  // luminance threshold — bloom fires only at night (emissive surfaces)
    );
    this._composer.addPass(bloom);

    const output = new OutputPass();
    // OutputPass applies ACES tonemap + sRGB encode (per spec §5)
    output.toneMappingExposure = 1.0;
    this._composer.addPass(output);

    this._bloom  = bloom;
    this._output = output;
  }

  setSize(w, h) {
    this._renderer.setSize(w, h);
    this._composer?.setSize(w, h);
  }

  render() {
    if (this._fast) {
      this._renderer.render(this._scene, this._camera);
    } else {
      this._composer.render();
    }
  }
}
