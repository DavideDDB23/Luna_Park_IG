import * as THREE from 'three';
import { MAX_DT } from '../config.js';

export class Clock {
  constructor() {
    this._clock = new THREE.Clock();
    this.elapsed = 0;
    this.dt      = 0;
  }

  tick() {
    const raw  = this._clock.getDelta();
    this.dt    = Math.min(raw, MAX_DT);
    this.elapsed += this.dt;
    return this.dt;
  }

  get time() { return this.elapsed; }
}
