import * as THREE from 'three';
import { isFast, isMobile } from '../utils/url.js';
import { SHADOW_MAP_SIZE } from '../config.js';

// Ride site positions (world-space) — synced with SCENE_STRUCTURE §2
export const RIDE_SITES = {
  ferrisWheel: new THREE.Vector3(-15, 0, -30),
  carousel:    new THREE.Vector3(-15, 0, -10),
  tagada:      new THREE.Vector3(-15, 0,  15),
  rollerCoaster: new THREE.Vector3(-15, 0, 35),
};

export class LightingRig {
  constructor(scene, lightsGroup) {
    this.scene       = scene;
    this._group      = lightsGroup;

    this.sun         = this._makeSun();
    this.ambient     = this._makeAmbient();
    this.stageSpot   = this._makeStageSpot();
    this.samplePoint = this._makeSamplePoint();

    lightsGroup.add(this.sun, this.sun.target, this.ambient, this.stageSpot, this.stageSpot.target, this.samplePoint);
  }

  _makeSun() {
    const sun = new THREE.DirectionalLight(0xfff7e0, 3.0);
    sun.name = 'sun';
    sun.position.set(40, 60, 20);
    sun.target.position.set(0, 0, 0);
    sun.castShadow = !isFast;
    if (sun.castShadow) {
      const sz = isMobile ? 1024 : SHADOW_MAP_SIZE;
      sun.shadow.mapSize.set(sz, sz);
      sun.shadow.camera.left   = -55;
      sun.shadow.camera.right  =  55;
      sun.shadow.camera.top    =  55;
      sun.shadow.camera.bottom = -55;
      sun.shadow.camera.near   = 10;
      sun.shadow.camera.far    = 200;
      sun.shadow.bias          = -0.0005;
      sun.shadow.normalBias    =  0.05;
      sun.shadow.radius        =  4;
    }
    return sun;
  }

  _makeAmbient() {
    const h = new THREE.HemisphereLight(0xbcdfff, 0x6a5040, 0.6);
    h.name = 'ambientSky';
    return h;
  }

  _makeStageSpot() {
    const spot = new THREE.SpotLight(0xffe7a0, 8, 30, Math.PI / 6, 0.5);
    spot.name = 'stageSpot';
    spot.position.set(0, 12, 5);
    spot.target.position.set(0, 0, 5);
    spot.castShadow = !isFast;
    if (spot.castShadow) {
      spot.shadow.mapSize.set(1024, 1024);
    }
    return spot;
  }

  _makeSamplePoint() {
    // One sample PointLight near the Ferris wheel site for M2 checklist
    const pt = new THREE.PointLight(0xffcc88, 2, 14, 1.6);
    pt.name = 'samplePoint';
    pt.position.copy(RIDE_SITES.ferrisWheel).setY(5);
    return pt;
  }
}
