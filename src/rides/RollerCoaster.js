import * as THREE from 'three';
import { Ride }         from './Ride.js';
import { ControlPanel } from './ControlPanel.js';
import { EventBus }     from '../core/EventBus.js';

// ANIM CATEGORY: procedural (Catmull-Rom curve + Frenet frame)
const BASE_SPEED = 0.06;   // curve-fraction per second at speed×1

export class RollerCoaster extends Ride {
  constructor(ridesGroup, position) {
    super('rollerCoaster', { targetSpeed: BASE_SPEED });

    this.root = new THREE.Group();
    this.root.name = 'rollerCoaster';
    this.root.position.copy(position);
    ridesGroup.add(this.root);

    const railMat  = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.4, metalness: 0.7 });
    const tieMat   = new THREE.MeshStandardMaterial({ color: 0x5a3a1a, roughness: 0.9 });
    const cartMat  = new THREE.MeshStandardMaterial({ color: 0xff2244, roughness: 0.5, metalness: 0.2 });
    const riderMat = new THREE.MeshStandardMaterial({ color: 0xffcc44, roughness: 0.8 });

    // Control points (local to ride root) — closed loop with elevation variation
    const pts = [
      [ 0,  1,  0],
      [12,  2,  5],
      [20,  5, 15],
      [15,  8, 28],
      [ 4,  6, 35],
      [-8,  3, 30],
      [-20, 4, 20],
      [-20, 2, 10],
      [-10, 1,  2],
    ].map(([x, y, z]) => new THREE.Vector3(x, y, z));

    this._curve = new THREE.CatmullRomCurve3(pts, true, 'catmullrom', 0.5);

    const FRENET_SEGS = 300;
    this._frenet = this._curve.computeFrenetFrames(FRENET_SEGS, true);
    this._curveLen = this._curve.getLength();
    this._u = 0;  // parametric position [0,1]

    // Build rails (left and right TubeGeometry)
    const RAIL_SEGS = 200;
    const RAIL_R = 0.09;
    const GAUGE  = 0.75;  // half-track-width

    for (const side of [-1, 1]) {
      // Offset curve by ±GAUGE in binormal direction at each segment
      const pts2 = [];
      for (let i = 0; i <= RAIL_SEGS; i++) {
        const u = i / RAIL_SEGS;
        const idx = Math.min(Math.floor(u * FRENET_SEGS), FRENET_SEGS - 1);
        pts2.push(
          this._curve.getPointAt(u)
            .clone()
            .addScaledVector(this._frenet.binormals[idx], side * GAUGE),
        );
      }
      const railCurve = new THREE.CatmullRomCurve3(pts2, true);
      const railGeo   = new THREE.TubeGeometry(railCurve, RAIL_SEGS, RAIL_R, 5, true);
      const rail      = new THREE.Mesh(railGeo, railMat);
      rail.name       = side > 0 ? 'railRight' : 'railLeft';
      rail.castShadow = true;
      this.root.add(rail);
    }

    // Cross-ties (instanced mesh)
    const TIE_COUNT = 80;
    const tieGeo = new THREE.BoxGeometry(GAUGE * 2 + 0.3, 0.1, 0.2);
    const ties   = new THREE.InstancedMesh(tieGeo, tieMat, TIE_COUNT);
    ties.name    = 'ties';
    const dummy  = new THREE.Object3D();
    for (let i = 0; i < TIE_COUNT; i++) {
      const u   = i / TIE_COUNT;
      const idx = Math.min(Math.floor(u * FRENET_SEGS), FRENET_SEGS - 1);
      const p   = this._curve.getPointAt(u);
      const N   = this._frenet.normals[idx];
      const B   = this._frenet.binormals[idx];
      const T   = this._curve.getTangentAt(u);
      dummy.matrix.makeBasis(B, N, T.clone().negate()).setPosition(p);
      dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale);
      ties.setMatrixAt(i, dummy.matrix);
    }
    ties.instanceMatrix.needsUpdate = true;
    this.root.add(ties);

    // Support posts
    const POST_COUNT = 40;
    const postGeo    = new THREE.CylinderGeometry(0.1, 0.12, 1, 6);
    const posts      = new THREE.InstancedMesh(postGeo, railMat, POST_COUNT);
    posts.name       = 'supportPosts';
    for (let i = 0; i < POST_COUNT; i++) {
      const u = i / POST_COUNT;
      const p = this._curve.getPointAt(u).clone();
      dummy.position.set(p.x, p.y / 2, p.z);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(1, p.y, 1);
      dummy.updateMatrix();
      posts.setMatrixAt(i, dummy.matrix);
    }
    posts.instanceMatrix.needsUpdate = true;
    this.root.add(posts);

    // Cart group — transform set each frame via Frenet frame
    this._cart = new THREE.Group();
    this._cart.name = 'cart';
    this._cart.matrixAutoUpdate = false;
    this.root.add(this._cart);

    const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.5, 2.2), cartMat);
    chassis.name = 'chassis';
    chassis.castShadow = true;
    this._cart.add(chassis);

    // Four seats + passengers
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 2; col++) {
        const seat = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.2, 0.5), cartMat);
        seat.name = `seat_${row}_${col}`;
        seat.position.set((col - 0.5) * 0.52, 0.3, (row - 0.5) * 0.8);
        seat.matrixAutoUpdate = false;
        seat.updateMatrix();
        this._cart.add(seat);

        const rider = new THREE.Group();
        rider.name = `rider_${row}_${col}`;
        rider.position.set((col - 0.5) * 0.52, 0.55, (row - 0.5) * 0.8);
        this._cart.add(rider);
        const rBody = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.25, 4, 8), riderMat);
        rBody.position.y = 0.08;
        rider.add(rBody);
        const rHead = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), riderMat);
        rHead.position.y = 0.34;
        rider.add(rHead);
        this._riders = this._riders ?? [];
        this._riders.push(rider);
      }
    }

    this.panel = new ControlPanel(this.root, 'rollerCoaster', new THREE.Vector3(3, 0, -5));
    EventBus.on('ride:state', ({ rideId, state }) => {
      if (rideId !== 'rollerCoaster') return;
      this.panel.setRunning(state === 'running' || state === 'ramping_up');
    });
  }

  // ANIM CATEGORY: procedural — Frenet frame cart positioning (ANIMATION_SYSTEM §3.3)
  update(dt, elapsed) {
    void elapsed;
    if (this.state === 'idle' && this.speed === 0) { this.panel.update(elapsed); return; }

    // Speed varies with track gradient (slows uphill, speeds downhill)
    const tangent  = this._curve.getTangentAt(this._u);
    const adjSpeed = this.speed * (1 - 0.4 * tangent.y);
    this._u = ((this._u + adjSpeed * dt) % 1 + 1) % 1;

    const idx = Math.min(Math.floor(this._u * 300), 299);
    const P   = this._curve.getPointAt(this._u);
    const T   = this._curve.getTangentAt(this._u);
    const N   = this._frenet.normals[idx];
    const B   = this._frenet.binormals[idx];

    // Build cart's local frame: right=B, up=N, forward=-T
    this._cart.matrix.makeBasis(B, N, T.clone().negate()).setPosition(P);
    this._cart.matrixWorldNeedsUpdate = true;

    // Passenger tilt proportional to curvature
    const kappa = N.length();  // approximation
    if (this._riders) {
      for (const r of this._riders) r.rotation.z = kappa * 0.3;
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
