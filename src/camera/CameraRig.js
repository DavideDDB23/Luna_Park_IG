import * as THREE from 'three';
import * as TWEEN from 'tween';
import { FreeOrbit }  from './FreeOrbit.js';
import { EventBus }   from '../core/EventBus.js';
import { matchesBinding } from '../interaction/KeyMap.js';

export class CameraRig {
  constructor(camera, renderer) {
    this.camera   = camera;
    this._canvas  = renderer.domElement;
    this.mode     = 'orbit';   // orbit | gondola

    this._orbit   = new FreeOrbit(camera, this._canvas);
    this._gondola = null;   // set by main.js after FerrisWheel is built

    // Camera reset
    EventBus.on('input:key', ({ code, action }) => {
      if (action !== 'down') return;
      if (matchesBinding('CAMERA_RESET', code)) this._reset();
    });

    EventBus.on('camera:mode', m => { this.mode = m; });
  }

  // Wired after FerrisWheel instantiation in main.js
  setGondolaCam(gondolaCam) {
    this._gondola = gondolaCam;
  }

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
          if (this.mode !== 'gondola') this._orbit.enable();
          EventBus.emit('camera:flyEnd', { position: targetPos, lookAt });
          resolve();
        })
        .start();
    });
  }

  update(dt) {
    if (this.mode === 'gondola' && this._gondola) {
      this._gondola.update(dt);
    } else {
      this._orbit.update(dt);
    }
  }

  _reset() {
    this.flyTo(
      new THREE.Vector3(0, 55, 80),
      new THREE.Vector3(0, 0, 0),
      1200,
      TWEEN.Easing.Quadratic.InOut,
    );
  }

  dispose() {
    this._orbit.dispose();
  }
}
