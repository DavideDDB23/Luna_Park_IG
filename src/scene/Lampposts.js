import * as THREE from 'three';
import * as TWEEN from 'tween';

const N_LAMPS    = 12;
const LAMP_COLOR = 0xffcc88;
const LAMP_DIST  = 14;
const LAMP_DECAY = 1.6;

// Lamppost positions — spaced along the path cross
function makeLampPositions() {
  const pts = [];
  const spacing = 12;
  // N-S path (Z axis)
  for (let i = -2; i <= 2; i++) {
    if (i === 0) continue;
    pts.push(new THREE.Vector3( 4, 0, i * spacing));
    pts.push(new THREE.Vector3(-4, 0, i * spacing));
  }
  // E-W path (X axis)
  for (const x of [-30, 30]) {
    pts.push(new THREE.Vector3(x, 0, 3));
  }
  return pts.slice(0, N_LAMPS);
}

export class Lampposts {
  constructor(worldGroup, lightsGroup) {
    this._lights       = [];
    this._intensities  = [];  // target intensity per lamp (0 or 2.0)
    this._overrides    = [];  // null | true | false per lamp
    this._positions    = makeLampPositions();

    const poleMat = new THREE.MeshStandardMaterial({ color: 0x445566, roughness: 0.6, metalness: 0.5 });
    const bulbMat = new THREE.MeshStandardMaterial({ color: 0xffffee, emissive: 0xffffee, emissiveIntensity: 0, roughness: 0.3 });

    for (let i = 0; i < this._positions.length; i++) {
      const pos = this._positions[i];

      // Pole
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 5, 8), poleMat);
      pole.name = `lampPole_${i}`;
      pole.position.copy(pos).setY(2.5);
      pole.castShadow = true;
      pole.matrixAutoUpdate = false;
      pole.updateMatrix();
      worldGroup.add(pole);

      // Arm
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.2, 6), poleMat);
      arm.name = `lampArm_${i}`;
      arm.rotation.z = Math.PI / 2;
      arm.position.copy(pos).setY(5).add(new THREE.Vector3(0.6, 0, 0));
      arm.matrixAutoUpdate = false;
      arm.updateMatrix();
      worldGroup.add(arm);

      // Bulb sphere (pickable)
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 6), bulbMat.clone());
      bulb.name = `lampBulb_${i}`;
      bulb.position.copy(pos).setY(5).add(new THREE.Vector3(1.2, 0, 0));
      bulb.userData.pickable        = true;
      bulb.userData.lamppostIndex   = i;
      bulb.matrixAutoUpdate = false;
      bulb.updateMatrix();
      worldGroup.add(bulb);
      this._bulbs = this._bulbs ?? [];
      this._bulbs.push(bulb);

      // PointLight
      const pt = new THREE.PointLight(LAMP_COLOR, 0, LAMP_DIST, LAMP_DECAY);
      pt.name = `lampPoint_${i}`;
      pt.position.copy(pos).setY(5.2).add(new THREE.Vector3(1.2, 0, 0));
      pt.userData.lamppostInstance = i;
      lightsGroup.add(pt);

      this._lights.push(pt);
      this._intensities.push(0);
      this._overrides.push(null);
    }
  }

  // Called by DayNight in M5; for M4 just expose toggle
  setNightIntensity(target) {
    for (let i = 0; i < this._lights.length; i++) {
      if (this._overrides[i] !== null) continue;
      this._intensities[i] = target;
    }
  }

  toggleLamp(index) {
    if (index < 0 || index >= this._lights.length) return;
    const on = this._lights[index].intensity < 0.1;
    this._overrides[index] = on;
    const from = { v: this._lights[index].intensity };
    const to   = { v: on ? 2.0 : 0 };
    new TWEEN.Tween(from)
      .to(to, 600)
      .easing(TWEEN.Easing.Quadratic.InOut)
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
