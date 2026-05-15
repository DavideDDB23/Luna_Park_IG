import * as THREE from 'three';
import * as TWEEN from 'tween';
import { FreeOrbit }  from './FreeOrbit.js';
import { EventBus }   from '../core/EventBus.js';
import { matchesBinding } from '../interaction/KeyMap.js';

// First-person walk speed (m/s)
const WALK_SPEED  = 8;
const LOOK_SENS   = 0.002;

export class CameraRig {
  constructor(camera, renderer) {
    this.camera   = camera;
    this._canvas  = renderer.domElement;
    this.mode     = 'orbit';   // orbit | gondola | walk

    this._orbit   = new FreeOrbit(camera, this._canvas);
    this._gondola = null;

    // Walk state
    this._walkKeys = { w: false, a: false, s: false, d: false };
    this._walkYaw   = 0;
    this._walkPitch = 0;
    this._walkActive = false;

    // Camera reset
    EventBus.on('input:key', ({ code, action }) => {
      if (action === 'down' && matchesBinding('CAMERA_RESET', code)) this._reset();
      // Walk mode toggle: Tab key
      if (action === 'down' && code === 'Tab') this._toggleWalk();
    });

    EventBus.on('camera:mode', m => {
      if (m !== this.mode) this._setMode(m);
    });

    // Walk key tracking
    document.addEventListener('keydown', e => {
      if (!this._walkActive) return;
      const k = e.code.toLowerCase().replace('key', '');
      if (k in this._walkKeys) { this._walkKeys[k] = true; e.preventDefault(); }
    });
    document.addEventListener('keyup', e => {
      const k = e.code.toLowerCase().replace('key', '');
      if (k in this._walkKeys) this._walkKeys[k] = false;
    });

    // Pointer-lock for walk look
    document.addEventListener('pointerlockchange', () => {
      this._walkActive = document.pointerLockElement === this._canvas;
      if (!this._walkActive && this.mode === 'walk') this._setMode('orbit');
    });
    document.addEventListener('mousemove', e => {
      if (!this._walkActive) return;
      this._walkYaw   -= e.movementX * LOOK_SENS;
      this._walkPitch -= e.movementY * LOOK_SENS;
      this._walkPitch  = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, this._walkPitch));
    });
  }

  setGondolaCam(gondolaCam) { this._gondola = gondolaCam; }

  _setMode(m) {
    this.mode = m;
    if (m === 'walk') {
      this._orbit.disable();
      const dir = new THREE.Vector3();
      this.camera.getWorldDirection(dir);
      this._walkYaw   = Math.atan2(-dir.x, -dir.z);
      this._walkPitch = Math.asin(dir.y);
      this._walkActive = false;
      this._canvas.requestPointerLock();
    } else {
      if (document.pointerLockElement) document.exitPointerLock();
      this._walkActive = false;
      if (m !== 'gondola') this._orbit.enable();
    }
    EventBus.emit('camera:modeChanged', m);
  }

  _toggleWalk() {
    if (this.mode === 'walk') {
      this._setMode('orbit');
    } else {
      this._setMode('walk');
    }
  }

  flyTo(targetPos, lookAt, dur = 1200, easing = TWEEN.Easing.Quadratic.InOut) {
    if (this.mode === 'walk') this._setMode('orbit');
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
    } else if (this.mode === 'walk' && this._walkActive) {
      this._updateWalk(dt);
    } else {
      this._orbit.update(dt);
    }
  }

  _updateWalk(dt) {
    const cam = this.camera;
    // Apply yaw+pitch to camera
    const q = new THREE.Quaternion()
      .setFromEuler(new THREE.Euler(this._walkPitch, this._walkYaw, 0, 'YXZ'));
    cam.quaternion.copy(q);

    // Move in camera's XZ plane
    const forward = new THREE.Vector3(-Math.sin(this._walkYaw), 0, -Math.cos(this._walkYaw));
    const right   = new THREE.Vector3( Math.cos(this._walkYaw), 0, -Math.sin(this._walkYaw));
    const move    = new THREE.Vector3();
    const { w, a, s, d } = this._walkKeys;
    if (w) move.addScaledVector(forward,  WALK_SPEED * dt);
    if (s) move.addScaledVector(forward, -WALK_SPEED * dt);
    if (a) move.addScaledVector(right,   -WALK_SPEED * dt);
    if (d) move.addScaledVector(right,    WALK_SPEED * dt);

    cam.position.add(move);
    // Clamp to ground + park bounds
    cam.position.y = Math.max(1.7, cam.position.y);
    cam.position.x = Math.max(-60, Math.min(60, cam.position.x));
    cam.position.z = Math.max(-60, Math.min(90, cam.position.z));
  }

  _reset() {
    if (this.mode === 'walk') this._setMode('orbit');
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
