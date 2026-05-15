import * as THREE from 'three';
import { Ride }         from './Ride.js';
import { ControlPanel } from './ControlPanel.js';
import { EventBus }     from '../core/EventBus.js';

// ANIM CATEGORY: procedural (layered sinusoids) + physics-flavored (damped spring stop)
const N_SEATS    = 8;
const BASE_SPEED = 1.0;

export class Tagada extends Ride {
  constructor(ridesGroup, position) {
    super('tagada', { targetSpeed: BASE_SPEED });

    this.root = new THREE.Group();
    this.root.name = 'tagada';
    this.root.position.copy(position);
    ridesGroup.add(this.root);

    const metalMat  = new THREE.MeshStandardMaterial({ color: 0x224488, roughness: 0.5, metalness: 0.6 });
    const seatMat   = new THREE.MeshStandardMaterial({ color: 0xff6600, roughness: 0.8 });
    const riderMat  = new THREE.MeshStandardMaterial({ color: 0xffcc44, roughness: 0.8 });

    // Static outer ring / base disc
    const baseDisk = new THREE.Mesh(new THREE.CylinderGeometry(4.5, 4.5, 0.3, 16), metalMat);
    baseDisk.name = 'baseDisk';
    baseDisk.position.y = 0.15;
    baseDisk.receiveShadow = true;
    baseDisk.matrixAutoUpdate = false;
    baseDisk.updateMatrix();
    this.root.add(baseDisk);

    // base (rotates Y, slow)
    this._base = new THREE.Group();
    this._base.name = 'base';
    this._base.position.y = 0.3;
    this.root.add(this._base);

    const baseHub = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 1.2, 12), metalMat);
    baseHub.name = 'baseHub';
    baseHub.position.y = 0.6;
    this._base.add(baseHub);

    // arm1 (rotates X — tilts forward/back)
    this._arm1 = new THREE.Group();
    this._arm1.name = 'arm1';
    this._arm1.position.y = 1.5;
    this._base.add(this._arm1);

    const arm1Mesh = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 3.5), metalMat);
    arm1Mesh.name = 'arm1Mesh';
    arm1Mesh.position.z = 1.75;
    arm1Mesh.castShadow = true;
    this._arm1.add(arm1Mesh);

    // arm2 (rotates Z — tilts left/right)
    this._arm2 = new THREE.Group();
    this._arm2.name = 'arm2';
    this._arm2.position.z = 3.5;
    this._arm1.add(this._arm2);

    const arm2Mesh = new THREE.Mesh(new THREE.BoxGeometry(0.3, 3.0, 0.3), metalMat);
    arm2Mesh.name = 'arm2Mesh';
    arm2Mesh.position.y = 1.5;
    arm2Mesh.castShadow = true;
    this._arm2.add(arm2Mesh);

    // seatPlatform (rotates Y fast)
    this._seatPlatform = new THREE.Group();
    this._seatPlatform.name = 'seatPlatform';
    this._seatPlatform.position.y = 3.5;
    this._arm2.add(this._seatPlatform);

    const platDisk = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 2.8, 0.25, 16), metalMat);
    platDisk.name = 'platDisk';
    platDisk.castShadow = true;
    this._seatPlatform.add(platDisk);

    // Seats + riders around platform rim
    for (let i = 0; i < N_SEATS; i++) {
      const angle = (i / N_SEATS) * Math.PI * 2;
      const r     = 2.2;

      const seat = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.35, 0.45), seatMat);
      seat.name = `seat_${i}`;
      seat.position.set(Math.cos(angle) * r, 0.3, Math.sin(angle) * r);
      seat.matrixAutoUpdate = false;
      seat.updateMatrix();
      this._seatPlatform.add(seat);

      const rider = new THREE.Group();
      rider.name = `rider_${i}`;
      rider.position.set(Math.cos(angle) * r, 0.6, Math.sin(angle) * r);
      rider.matrixAutoUpdate = false;
      rider.updateMatrix();
      this._seatPlatform.add(rider);
      const rBody = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.28, 4, 8), riderMat);
      rBody.name = 'body';
      rBody.position.y = 0.08;
      rider.add(rBody);
      const rHead = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), riderMat);
      rHead.name = 'head';
      rHead.position.y = 0.36;
      rider.add(rHead);
    }

    // Physics-flavored damped spring stop state (ANIM CATEGORY: physics-flavored)
    // Per ANIMATION_SYSTEM §5.1 — semi-implicit Euler with critical damping
    this._spring = {
      x1: { x: 0, v: 0 },  // arm1.rotation.x
      z2: { x: 0, v: 0 },  // arm2.rotation.z
    };
    this._K  = 50;
    this._C  = 2 * Math.sqrt(50);  // critical damping ≈ 14.14
    this._stopping = false;

    // Control panel
    this.panel = new ControlPanel(this.root, 'tagada', new THREE.Vector3(5.5, 0, 0));
    EventBus.on('ride:state', ({ rideId, state }) => {
      if (rideId !== 'tagada') return;
      this._stopping = (state === 'ramping_down' || state === 'idle');
      this.panel.setRunning(state === 'running' || state === 'ramping_up');
    });
  }

  // ANIM CATEGORY: procedural + physics-flavored
  update(dt, elapsed) {
    if (this.state === 'idle' && this.speed === 0) { this.panel.update(elapsed); return; }

    const sp = this.speed;

    if (!this._stopping) {
      // Drive with layered sinusoids (ANIMATION_SYSTEM §3.4)
      this._base.rotation.y      += 0.5 * sp * dt;
      this._arm1.rotation.x       = Math.sin(elapsed * 1.0) * 0.5 * sp;
      this._arm2.rotation.z       = Math.sin(elapsed * 1.7) * 0.4 * sp;
      this._seatPlatform.rotation.y += 4.0 * sp * dt;

      this._spring.x1.x = this._arm1.rotation.x;
      this._spring.z2.x = this._arm2.rotation.z;
    } else {
      // Semi-implicit Euler spring stop (ANIMATION_SYSTEM §5.1)
      for (const s of Object.values(this._spring)) {
        const F = -this._K * s.x - this._C * s.v;
        s.v += F * dt;
        s.x += s.v * dt;
      }
      this._arm1.rotation.x = this._spring.x1.x;
      this._arm2.rotation.z = this._spring.z2.x;
      this._base.rotation.y       += 0.5 * sp * dt;
      this._seatPlatform.rotation.y += 4.0 * sp * dt;
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
