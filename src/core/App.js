import * as THREE from 'three';
import { isDebug, isFast, isMobile } from '../utils/url.js';
import { SHADOW_MAP_SIZE } from '../config.js';

export class App {
  constructor(canvas) {
    this.canvas   = canvas;
    this.scene    = new THREE.Scene();
    this.renderer = this._buildRenderer(canvas);
    this.camera   = this._buildCamera();
    this._paused  = false;
  }

  _buildRenderer(canvas) {
    const r = new THREE.WebGLRenderer({ canvas, antialias: !isMobile });
    r.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
    r.setSize(window.innerWidth, window.innerHeight);
    r.outputColorSpace  = THREE.SRGBColorSpace;
    r.toneMapping       = THREE.ACESFilmicToneMapping;
    r.toneMappingExposure = 1.0;
    r.shadowMap.enabled = !isFast;
    r.shadowMap.type    = THREE.PCFSoftShadowMap;
    return r;
  }

  _buildCamera() {
    const cam = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    cam.position.set(0, 12, 28);
    cam.lookAt(0, 0, 0);
    return cam;
  }

  onResize() {
    const w = window.innerWidth, h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  pause()  { this._paused = true; }
  resume() { this._paused = false; }

  dispose() {
    this.renderer.dispose();
  }
}
