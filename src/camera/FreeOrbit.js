import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class FreeOrbit {
  constructor(camera, domElement) {
    const ctrl = new OrbitControls(camera, domElement);
    ctrl.enableDamping        = true;
    ctrl.dampingFactor        = 0.05;
    ctrl.screenSpacePanning   = false;
    ctrl.minPolarAngle        = 0.2;
    ctrl.maxPolarAngle        = Math.PI / 2 - 0.05;
    ctrl.minDistance          = 4;
    ctrl.maxDistance          = 120;
    ctrl.zoomSpeed            = 2.0;    // ~8 units/s at mid-distance
    ctrl.panSpeed             = 0.8;
    this.controls = ctrl;
  }

  enable()  { this.controls.enabled = true; }
  disable() { this.controls.enabled = false; }

  update(_dt) {
    this.controls.update();
  }

  dispose() {
    this.controls.dispose();
  }
}
