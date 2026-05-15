import * as THREE from 'three';
import * as TWEEN from 'tween';
import { EventBus } from '../core/EventBus.js';

// ANIM CATEGORY: tweened entry/exit; procedural follow in gondola mode
const ENTER_DIST  = 25;   // must be within this distance of the Ferris wheel to enter
const ENTER_DUR   = 1500;
const EXIT_DUR    = 1200;
const CAM_OFFSET  = new THREE.Vector3(0, 0.6, 0.3);  // inside gondola local frame

export class GondolaCam {
  constructor(rig, ferrisWheel) {
    this._rig   = rig;
    this._fw    = ferrisWheel;
    this._mode  = 'off';   // off | entering | riding | exiting
    this._mount = null;    // the gondola Object3D we follow

    EventBus.on('input:key', ({ code, action }) => {
      if (action !== 'down') return;
      if (code === 'KeyG')   this._toggle();
      if (code === 'Escape') this.detach();
    });
  }

  _toggle() {
    if (this._mode === 'off' || this._mode === 'exiting') {
      this._tryAttach();
    } else {
      this.detach();
    }
  }

  _tryAttach() {
    const cam     = this._rig.camera;
    const fwWorld = new THREE.Vector3();
    this._fw.root.getWorldPosition(fwWorld);

    if (cam.position.distanceTo(fwWorld) > ENTER_DIST) {
      EventBus.emit('hud:toast', { msg: 'Get closer to the Ferris wheel', dur: 2000 });
      return;
    }

    // Pick nearest gondola
    let bestGondola = null, bestDist = Infinity;
    for (const g of this._fw._gondolas) {
      const wp = new THREE.Vector3();
      g.getWorldPosition(wp);
      const d = cam.position.distanceTo(wp);
      if (d < bestDist) { bestDist = d; bestGondola = g; }
    }
    if (!bestGondola) return;

    this._mode  = 'entering';
    this._mount = bestGondola;

    const mountPos = new THREE.Vector3();
    bestGondola.getWorldPosition(mountPos);
    mountPos.y += CAM_OFFSET.y;

    this._rig.flyTo(mountPos, mountPos.clone().add(new THREE.Vector3(0, 0, -3)), ENTER_DUR,
      TWEEN.Easing.Cubic.InOut).then(() => {
      this._mode = 'riding';
      this._rig._orbit.disable();
      EventBus.emit('hud:toast', { msg: 'FPV — Press G or Esc to exit', dur: 3000 });
      EventBus.emit('camera:mode', 'gondola');
    });
  }

  detach() {
    if (this._mode === 'off') return;
    this._mode = 'exiting';

    const fwWorld = new THREE.Vector3();
    this._fw.root.getWorldPosition(fwWorld);
    const exitPos = fwWorld.clone().add(new THREE.Vector3(15, 12, 15));

    this._rig.flyTo(exitPos, fwWorld, EXIT_DUR, TWEEN.Easing.Cubic.InOut).then(() => {
      this._mode  = 'off';
      this._mount = null;
      this._rig._orbit.enable();
      EventBus.emit('camera:mode', 'orbit');
    });
  }

  // Follow gondola each frame while riding (CAMERA_SYSTEM §4.1 — follow, not parent)
  update(_dt) {
    if (this._mode !== 'riding' || !this._mount) return;

    const worldPos = new THREE.Vector3();
    const worldQuat = new THREE.Quaternion();
    this._mount.getWorldPosition(worldPos);
    this._mount.getWorldQuaternion(worldQuat);

    // Apply local offset in gondola frame
    const offsetWorld = CAM_OFFSET.clone().applyQuaternion(worldQuat);
    this._rig.camera.position.copy(worldPos).add(offsetWorld);

    // Look forward in gondola frame
    const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(worldQuat);
    this._rig.camera.lookAt(worldPos.clone().add(fwd));
  }

  get isRiding() { return this._mode === 'riding'; }
}
