import * as THREE from 'three';
import * as TWEEN from 'tween';
import { FreeOrbit } from './FreeOrbit.js';
import { EventBus } from '../core/EventBus.js';

export class CameraRig {
  constructor(camera, renderer) {
    this.camera   = camera;
    this._canvas  = renderer.domElement;
    this.mode     = 'orbit';

    this._orbit   = new FreeOrbit(camera, this._canvas);
    // ClickToFly and GondolaCam wired in M4
  }

  // Smooth camera flight — used by ClickToFly and mode transitions
  flyTo(targetPos, lookAt, dur = 1200, easing = TWEEN.Easing.Quadratic.InOut) {
    this._orbit.disable();
    const camStart    = this.camera.position.clone();
    const targetStart = this._orbit.controls.target.clone();
    const obj = { t: 0 };

    return new Promise(resolve => {
      new TWEEN.Tween(obj)
        .to({ t: 1 }, dur)
        .easing(easing)
        .onUpdate(() => {
          this.camera.position.lerpVectors(camStart, targetPos, obj.t);
          this._orbit.controls.target.lerpVectors(targetStart, lookAt, obj.t);
        })
        .onComplete(() => {
          this._orbit.enable();
          EventBus.emit('camera:flyEnd', { position: targetPos, lookAt });
          resolve();
        })
        .start();
    });
  }

  update(dt) {
    if (this.mode === 'orbit') this._orbit.update(dt);
  }

  dispose() {
    this._orbit.dispose();
  }
}
