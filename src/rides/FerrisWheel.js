import * as THREE from 'three';
import { Ride }          from './Ride.js';
import { ControlPanel }  from './ControlPanel.js';
import { EventBus }      from '../core/EventBus.js';

// ANIM CATEGORY: procedural (ring rotation, counter-rotation, passenger sway)
const N_GONDOLAS     = 8;
const RING_RADIUS    = 11;     // m — arm length
const HUB_Y         = 13;     // m — height of ring centre
const BASE_SPEED     = 0.25;  // rad/s at speed multiplier 1×

export class FerrisWheel extends Ride {
  constructor(ridesGroup, position) {
    super('ferrisWheel', { targetSpeed: BASE_SPEED });

    // ── Root ──────────────────────────────────────────────────────────────
    this.root = new THREE.Group();
    this.root.name = 'ferrisWheel';
    this.root.position.copy(position);
    ridesGroup.add(this.root);

    // ── Base column ───────────────────────────────────────────────────────
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x8899aa, roughness: 0.6, metalness: 0.4 });

    const column = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.5, HUB_Y, 12), baseMat);
    column.name = 'column';
    column.position.y = HUB_Y / 2;
    column.castShadow = true;
    this.root.add(column);

    // Two angled struts
    for (const side of [-1, 1]) {
      const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 16, 8), baseMat);
      strut.name = `support_${side > 0 ? 'r' : 'l'}`;
      strut.position.set(side * 5, 6, 0);
      strut.rotation.z = side * 0.32;  // ≈ 18° lean
      strut.castShadow = true;
      this.root.add(strut);
    }

    // Hub drum
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.8, 16), baseMat);
    hub.name = 'hub';
    hub.position.y = HUB_Y;
    hub.rotation.x = Math.PI / 2;
    this.root.add(hub);

    // ── Ring (rotates) ─────────────────────────────────────────────────────
    this._ring = new THREE.Group();
    this._ring.name = 'ring';
    this._ring.position.y = HUB_Y;
    this.root.add(this._ring);

    // Outer rim — approximated with segments
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xddddee, roughness: 0.5, metalness: 0.5 });
    const RIM_SEGS = 32;
    for (let i = 0; i < RIM_SEGS; i++) {
      const a0 = (i / RIM_SEGS) * Math.PI * 2;
      const a1 = ((i + 1) / RIM_SEGS) * Math.PI * 2;
      const mid = (a0 + a1) / 2;
      const seg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, RING_RADIUS * 2 * Math.sin(Math.PI / RIM_SEGS), 6), rimMat);
      seg.name = `rim_${i}`;
      seg.position.set(Math.cos(mid) * RING_RADIUS, Math.sin(mid) * RING_RADIUS, 0);
      seg.rotation.z = mid + Math.PI / 2;
      seg.matrixAutoUpdate = false;
      seg.updateMatrix();
      this._ring.add(seg);
    }

    // Spokes
    const spokeMat = new THREE.MeshStandardMaterial({ color: 0xaabbcc, roughness: 0.7, metalness: 0.3 });
    for (let i = 0; i < N_GONDOLAS; i++) {
      const angle = (i / N_GONDOLAS) * Math.PI * 2;
      const spoke = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, RING_RADIUS, 6), spokeMat);
      spoke.name = `spoke_${i}`;
      spoke.position.set(
        Math.cos(angle) * RING_RADIUS / 2,
        Math.sin(angle) * RING_RADIUS / 2,
        0,
      );
      spoke.rotation.z = angle + Math.PI / 2;
      spoke.matrixAutoUpdate = false;
      spoke.updateMatrix();
      this._ring.add(spoke);
    }

    // ── Gondolas + passengers ─────────────────────────────────────────────
    const gondolaMat  = new THREE.MeshStandardMaterial({ color: 0xff6633, roughness: 0.5, metalness: 0.1 });
    const passengerMat = new THREE.MeshStandardMaterial({ color: 0xffcc66, roughness: 0.8 });
    const benchMat    = new THREE.MeshStandardMaterial({ color: 0x554433, roughness: 1 });

    this._gondolas   = [];
    this._passengers = []; // [{L, R}]

    for (let i = 0; i < N_GONDOLAS; i++) {
      const angle = (i / N_GONDOLAS) * Math.PI * 2;

      // Arm anchor (child of ring, at radius)
      const arm = new THREE.Group();
      arm.name = `arm_${i}`;
      arm.position.set(Math.cos(angle) * RING_RADIUS, Math.sin(angle) * RING_RADIUS, 0);
      arm.matrixAutoUpdate = false;
      arm.updateMatrix();
      this._ring.add(arm);

      // Gondola group (counter-rotates)
      const gondola = new THREE.Group();
      gondola.name = `gondola_${i}`;
      arm.add(gondola);

      // Shell (cabin box)
      const shell = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.7, 0.55), gondolaMat);
      shell.name = 'shell';
      shell.castShadow = true;
      gondola.add(shell);

      // Seat bench
      const bench = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.07, 0.3), benchMat);
      bench.name = 'seatBench';
      bench.position.y = -0.2;
      gondola.add(bench);

      // Passengers (L and R)
      const pL = new THREE.Group();
      pL.name = 'passengerL';
      pL.position.set(-0.22, 0, 0);
      gondola.add(pL);
      const pR = new THREE.Group();
      pR.name = 'passengerR';
      pR.position.set( 0.22, 0, 0);
      gondola.add(pR);

      for (const [pg, side] of [[pL, 'L'], [pR, 'R']]) {
        const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.25, 4, 8), passengerMat);
        body.name = `body${side}`;
        body.position.y = 0.05;
        pg.add(body);
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), passengerMat);
        head.name = `head${side}`;
        head.position.y = 0.32;
        pg.add(head);
      }

      this._gondolas.push(gondola);
      this._passengers.push({ L: pL, R: pR, phase: i * 0.8 });
    }

    // ── Control panel ─────────────────────────────────────────────────────
    this.panel = new ControlPanel(this.root, 'ferrisWheel', new THREE.Vector3(5, 0, 6));

    // Listen for state changes to sync panel
    EventBus.on('ride:state', ({ rideId, state }) => {
      if (rideId !== 'ferrisWheel') return;
      this.panel.setRunning(state === 'running' || state === 'ramping_up');
    });
  }

  // ── Update (T-203 + T-204) ─────────────────────────────────────────────
  update(dt, elapsed) {
    if (this.state === 'idle' && this.speed === 0) {
      this.panel.update(elapsed);
      return;
    }

    // Procedural rotation — ring is in the XY (vertical) plane, so axis is Z
    // Doc says rotation.y but a vertical Ferris wheel (XY-plane ring) must rotate around Z.
    this._ring.rotation.z += this.speed * dt;

    // Counter-rotation: each gondola cancels ring's Z rotation to stay upright
    for (let i = 0; i < N_GONDOLAS; i++) {
      this._gondolas[i].rotation.z = -this._ring.rotation.z;

      // Passenger sway (sin driver)
      const { L, R, phase } = this._passengers[i];
      L.rotation.z =  Math.sin(elapsed * 2.0 + phase) * 0.05;
      R.rotation.z = -Math.sin(elapsed * 2.0 + phase) * 0.05;
    }

    this.panel.update(elapsed);
  }

  dispose() {
    super.dispose();
    this.root.traverse(n => {
      n.geometry?.dispose();
      if (n.material) {
        const m = Array.isArray(n.material) ? n.material : [n.material];
        m.forEach(mat => mat.dispose());
      }
    });
  }
}
