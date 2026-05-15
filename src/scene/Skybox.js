import * as THREE from 'three';

// Placeholder sky — solid colour + fog. Real cubemap in M5.
export class Skybox {
  constructor(scene) {
    this.scene = scene;
    this._dayColor   = new THREE.Color(0x87ceeb);
    this._nightColor = new THREE.Color(0x060a1a);
    scene.background = this._dayColor.clone();
    scene.fog = new THREE.Fog(this._dayColor.clone(), 60, 220);
  }

  // t in [0,1] where 0.5 = noon; called by DayNight in later milestones
  setNightBlend(blend) {
    const c = this._dayColor.clone().lerp(this._nightColor, blend);
    this.scene.background.copy(c);
    this.scene.fog.color.copy(c);
  }
}
