import * as THREE from 'three';
import { Ride }         from './Ride.js';
import { ControlPanel } from './ControlPanel.js';
import { EventBus }     from '../core/EventBus.js';

// ANIM CATEGORY: procedural (platform rotation, horse bob)
const N_HORSES  = 8;
const BASE_SPEED = 0.5; // rad/s
const BOB_AMP   = 0.5;  // m
const BOB_FREQ  = 0.4;  // Hz

export class Carousel extends Ride {
  constructor(ridesGroup, position) {
    super('carousel', { targetSpeed: BASE_SPEED });

    this.root = new THREE.Group();
    this.root.name = 'carousel';
    this.root.position.copy(position);
    ridesGroup.add(this.root);

    const metalMat  = new THREE.MeshStandardMaterial({ color: 0xcc4422, roughness: 0.5, metalness: 0.4 });
    const woodMat   = new THREE.MeshStandardMaterial({ color: 0xa07040, roughness: 0.9 });
    const horseMat  = new THREE.MeshStandardMaterial({ color: 0xf0e8d8, roughness: 0.7 });
    const jockeyMat = new THREE.MeshStandardMaterial({ color: 0x4488cc, roughness: 0.8 });
    const canopyMat = new THREE.MeshStandardMaterial({ color: 0xff3333, roughness: 0.8, side: THREE.DoubleSide });

    // Static octagonal base
    const base = new THREE.Mesh(new THREE.CylinderGeometry(5.5, 5.5, 0.3, 8), woodMat);
    base.name = 'base';
    base.position.y = 0.15;
    base.receiveShadow = true;
    base.matrixAutoUpdate = false;
    base.updateMatrix();
    this.root.add(base);

    // Rotating platform group
    this._platform = new THREE.Group();
    this._platform.name = 'platform';
    this._platform.position.y = 0.3;
    this.root.add(this._platform);

    // Centre pole
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 7, 8), metalMat);
    pole.name = 'centrePole';
    pole.position.y = 3.5;
    pole.castShadow = true;
    this._platform.add(pole);

    // Canopy
    const canopy = new THREE.Mesh(new THREE.ConeGeometry(5.8, 2.2, 8), canopyMat);
    canopy.name = 'canopy';
    canopy.position.y = 7.5;
    canopy.castShadow = true;
    this._platform.add(canopy);

    // Top cap
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 6), metalMat);
    cap.name = 'cap';
    cap.position.y = 8.7;
    this._platform.add(cap);

    // Vertical poles + horses
    this._horses    = [];
    this._jockeys   = [];
    this._baseHorseY = [];

    for (let i = 0; i < N_HORSES; i++) {
      const angle = (i / N_HORSES) * Math.PI * 2;
      const r     = 4.2;

      // Vertical pole
      const vPole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 3.5, 6), metalMat);
      vPole.name  = `vPole_${i}`;
      vPole.position.set(Math.cos(angle) * r, 3.5, Math.sin(angle) * r);
      vPole.matrixAutoUpdate = false;
      vPole.updateMatrix();
      this._platform.add(vPole);

      // Horse (box placeholder — GLB swaps in at M5)
      const horse = new THREE.Group();
      horse.name = `horse_${i}`;
      const baseY = 2.2;
      horse.position.set(Math.cos(angle) * r, baseY, Math.sin(angle) * r);
      this._platform.add(horse);
      this._baseHorseY.push(baseY);

      const body = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.85, 1.1), horseMat);
      body.name = 'body';
      body.userData.matKey = 'horse.painted';
      body.position.y = 0.1;
      body.castShadow = true;
      horse.add(body);

      const head = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.45, 0.35), horseMat);
      head.name = 'head';
      head.userData.matKey = 'horse.painted';
      head.position.set(0, 0.5, 0.55);
      head.rotation.x = -0.3;
      horse.add(head);

      // Jockey (inherits horse transform = no extra code needed for riding)
      const jockey = new THREE.Group();
      jockey.name = `jockey_${i}`;
      jockey.position.y = 0.72;
      horse.add(jockey);
      const jBody = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.3, 4, 8), jockeyMat);
      jBody.name = 'body';
      jBody.userData.matKey = 'horse.painted';
      jBody.position.y = 0.1;
      jockey.add(jBody);
      const jHead = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), jockeyMat);
      jHead.name = 'head';
      jHead.userData.matKey = 'horse.painted';
      jHead.position.y = 0.38;
      jockey.add(jHead);

      this._horses.push(horse);
    }

    // Control panel
    this.panel = new ControlPanel(this.root, 'carousel', new THREE.Vector3(6.5, 0, 0));
    EventBus.on('ride:state', ({ rideId, state }) => {
      if (rideId !== 'carousel') return;
      this.panel.setRunning(state === 'running' || state === 'ramping_up');
    });
  }

  // ANIM CATEGORY: procedural
  update(dt, elapsed) {
    if (this.state === 'idle' && this.speed === 0) { this.panel.update(elapsed); return; }

    this._platform.rotation.y += this.speed * dt;

    for (let i = 0; i < N_HORSES; i++) {
      const phase = (i / N_HORSES) * Math.PI * 2;
      this._horses[i].position.y = this._baseHorseY[i] +
        Math.sin(elapsed * Math.PI * 2 * BOB_FREQ + phase) * BOB_AMP;
      this._horses[i].rotation.z =
        Math.cos(elapsed * Math.PI * 2 * BOB_FREQ + phase) * 0.05;
    }

    this.panel.update(elapsed);
  }

  dispose() {
    super.dispose();
    this.root.traverse(n => {
      n.geometry?.dispose();
      const mats = Array.isArray(n.material) ? n.material : [n.material];
      mats.forEach(m => m?.dispose());
    });
  }
}
