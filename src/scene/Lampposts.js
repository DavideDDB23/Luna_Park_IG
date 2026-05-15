import * as THREE from 'three';
import * as TWEEN from 'tween';

// M6: poles and arms use InstancedMesh (12 instances each) to reduce draw calls.
// Bulb spheres stay as individual Mesh — they need per-instance material for toggle.

const N_LAMPS    = 12;
const LAMP_COLOR = 0xffcc88;
const LAMP_DIST  = 14;
const LAMP_DECAY = 1.6;

function makeLampPositions() {
  const pts = [];
  const spacing = 12;
  for (let i = -2; i <= 2; i++) {
    if (i === 0) continue;
    pts.push(new THREE.Vector3( 4, 0, i * spacing));
    pts.push(new THREE.Vector3(-4, 0, i * spacing));
  }
  for (const x of [-30, 30]) pts.push(new THREE.Vector3(x, 0, 3));
  return pts.slice(0, N_LAMPS);
}

export class Lampposts {
  constructor(worldGroup, lightsGroup, matLib = null) {
    this._lights      = [];
    this._intensities = [];
    this._overrides   = [];
    this._bulbs       = [];
    this._positions   = makeLampPositions();

    const poleMat = matLib
      ? matLib.get('metal.painted')
      : new THREE.MeshStandardMaterial({ color: 0x445566, roughness: 0.6, metalness: 0.5 });

    // ── Instanced poles (12 × CylinderGeometry) ──────────────────────────────
    const poleGeo  = new THREE.CylinderGeometry(0.08, 0.10, 5, 8);
    const poleInst = new THREE.InstancedMesh(poleGeo, poleMat, N_LAMPS);
    poleInst.name = 'lampPoleInstanced';
    poleInst.castShadow = true;
    poleInst.receiveShadow = false;

    // ── Instanced arms ────────────────────────────────────────────────────────
    const armGeo  = new THREE.CylinderGeometry(0.05, 0.05, 1.2, 6);
    const armInst = new THREE.InstancedMesh(armGeo, poleMat, N_LAMPS);
    armInst.name = 'lampArmInstanced';
    armInst.castShadow = false;

    const mx     = new THREE.Matrix4();
    const armRot = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, Math.PI / 2));

    for (let i = 0; i < this._positions.length; i++) {
      const pos = this._positions[i];

      // Pole matrix (centred at y=2.5)
      mx.makeTranslation(pos.x, 2.5, pos.z);
      poleInst.setMatrixAt(i, mx);

      // Arm matrix (rotated 90° on Z, offset from pole top)
      mx.compose(
        new THREE.Vector3(pos.x + 0.6, 5, pos.z),
        armRot,
        new THREE.Vector3(1, 1, 1),
      );
      armInst.setMatrixAt(i, mx);

      // Bulb — individual Mesh (per-instance emissive toggle)
      const bulbMat = new THREE.MeshStandardMaterial({
        color: 0xffffee, emissive: 0xffffee, emissiveIntensity: 0, roughness: 0.3,
      });
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 6), bulbMat);
      bulb.name = `lampBulb_${i}`;
      bulb.position.set(pos.x + 1.2, 5, pos.z);
      bulb.userData.pickable      = true;
      bulb.userData.lamppostIndex = i;
      bulb.matrixAutoUpdate = false;
      bulb.updateMatrix();
      worldGroup.add(bulb);
      this._bulbs.push(bulb);

      // PointLight
      const pt = new THREE.PointLight(LAMP_COLOR, 0, LAMP_DIST, LAMP_DECAY);
      pt.name = `lampPoint_${i}`;
      pt.position.set(pos.x + 1.2, 5.2, pos.z);
      pt.userData.lamppostInstance = i;
      lightsGroup.add(pt);

      this._lights.push(pt);
      this._intensities.push(0);
      this._overrides.push(null);
    }

    poleInst.instanceMatrix.needsUpdate = true;
    armInst.instanceMatrix.needsUpdate  = true;
    worldGroup.add(poleInst, armInst);
  }

  // Called by DayNight every frame with a smooth [0,2] intensity value
  setNightIntensity(target) {
    for (let i = 0; i < this._lights.length; i++) {
      if (this._overrides[i] !== null) continue;
      this._intensities[i] = target;
      this._lights[i].intensity = target;
      this._lights[i].visible   = target > 0.02;
      this._bulbs[i].material.emissiveIntensity = target / 2.0;
    }
  }

  toggleLamp(index) {
    if (index < 0 || index >= this._lights.length) return;
    const on   = this._lights[index].intensity < 0.1;
    this._overrides[index] = on;
    const from = { v: this._lights[index].intensity };
    const to   = { v: on ? 2.0 : 0 };
    new TWEEN.Tween(from)
      .to(to, 600).easing(TWEEN.Easing.Quadratic.InOut)
      .onUpdate(() => { this._lights[index].intensity = from.v; })
      .onComplete(() => {
        if (!on) this._lights[index].visible = false;
        this._bulbs[index].material.emissiveIntensity = on ? 1.0 : 0;
      })
      .start();
    if (on) this._lights[index].visible = true;
  }

  update(_dt) {}
}
