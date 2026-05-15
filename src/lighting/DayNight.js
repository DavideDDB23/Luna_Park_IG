import * as THREE from 'three';
import { EventBus }                                      from '../core/EventBus.js';
import { SUN_RADIUS, DAY_TURN_DURATION, LAMP_ON_THRESHOLD } from '../config.js';

// Sun keyframes: timeOfDay ∈ [0,1], 0.5 = noon, 0 = midnight (per spec)
const SUN_KF = [
  { t: 0.00, color: new THREE.Color('#aab5d0'), i: 0.25 },
  { t: 0.22, color: new THREE.Color('#aab5d0'), i: 0.30 },
  { t: 0.27, color: new THREE.Color('#ffaf6d'), i: 1.50 },
  { t: 0.50, color: new THREE.Color('#fff7e0'), i: 3.00 },
  { t: 0.75, color: new THREE.Color('#ffaf6d'), i: 1.80 },
  { t: 0.82, color: new THREE.Color('#5a4585'), i: 0.50 },
  { t: 1.00, color: new THREE.Color('#aab5d0'), i: 0.25 },
];

// Sky keyframes: sky, ground, hemisphere intensity, nightBlend for skybox
const SKY_KF = [
  { t: 0.00, sky: new THREE.Color('#0a0e22'), gnd: new THREE.Color('#08080a'), hi: 0.35, nb: 1.00 },
  { t: 0.22, sky: new THREE.Color('#1a0f30'), gnd: new THREE.Color('#100808'), hi: 0.37, nb: 0.85 },
  { t: 0.27, sky: new THREE.Color('#ff9a55'), gnd: new THREE.Color('#6a5040'), hi: 0.50, nb: 0.15 },
  { t: 0.50, sky: new THREE.Color('#bcdfff'), gnd: new THREE.Color('#6a5040'), hi: 0.60, nb: 0.00 },
  { t: 0.75, sky: new THREE.Color('#ff9a55'), gnd: new THREE.Color('#6a5040'), hi: 0.50, nb: 0.15 },
  { t: 0.82, sky: new THREE.Color('#5a4585'), gnd: new THREE.Color('#180a18'), hi: 0.37, nb: 0.70 },
  { t: 1.00, sky: new THREE.Color('#0a0e22'), gnd: new THREE.Color('#08080a'), hi: 0.35, nb: 1.00 },
];

const ORBIT_TILT = 12 * Math.PI / 180; // 12° tilt so noon sun is not exactly overhead

export class DayNight {
  constructor(rig, scene, skybox, lampposts, matLib) {
    this._rig     = rig;
    this._scene   = scene;
    this._skybox  = skybox;
    this._lamps   = lampposts;
    this._matLib  = matLib;
    this._t       = 0.5;   // start at noon
    this._auto    = false;

    EventBus.on('daynight:set',      t  => this.setTimeOfDay(t));
    EventBus.on('daynight:auto',     v  => { this._auto = v; });
    EventBus.on('rideNeon:setColor', c  => this._matLib.setNeonColor(c));

    this.setTimeOfDay(this._t);
  }

  setTimeOfDay(t) {
    this._t = ((t % 1) + 1) % 1;
    this._apply(this._t);
  }

  update(dt, elapsed) {
    if (this._auto) this.setTimeOfDay(this._t + dt / DAY_TURN_DURATION);
    this._matLib.updateNeonTime(elapsed);
  }

  get timeOfDay() { return this._t; }

  _apply(t) {
    const sunKF = _lerpKF(SUN_KF, t, ['color', 'i']);
    const skyKF = _lerpKF(SKY_KF, t, ['sky', 'gnd', 'hi', 'nb']);

    // ── Sun position + color ─────────────────────────────────────────────────
    const sun   = this._rig.sun;
    const angle = (t - 0.25) * Math.PI * 2;       // 0 rad at t=0.25 (sunrise)
    const r     = SUN_RADIUS;
    const y     = Math.sin(angle) * r;
    const x     = Math.cos(angle) * r;
    sun.position.set(x, y * Math.cos(ORBIT_TILT), y * Math.sin(ORBIT_TILT));
    sun.color.copy(sunKF.color);
    sun.intensity = sunKF.i;

    // ── Hemisphere sky / ground ───────────────────────────────────────────────
    this._rig.ambient.color.copy(skyKF.sky);
    this._rig.ambient.groundColor.copy(skyKF.gnd);
    this._rig.ambient.intensity = skyKF.hi;

    // ── Fog tracks sky ────────────────────────────────────────────────────────
    this._scene.fog.color.copy(skyKF.sky);

    // ── Skybox ────────────────────────────────────────────────────────────────
    this._skybox.setNightBlend(skyKF.nb, skyKF.sky, sun.position.clone().normalize());

    // ── Lamppost + neon ignition (smooth elevation ramp) ─────────────────────
    const elevFraction = sun.position.y / r;   // -1..1
    const lampT = THREE.MathUtils.clamp(
      1 - (elevFraction + LAMP_ON_THRESHOLD) / (LAMP_ON_THRESHOLD * 2 + 0.05),
      0, 1,
    );
    this._lamps.setNightIntensity(lampT * 2.0);
    this._matLib.setNightAmount(Math.max(lampT, skyKF.nb * 0.6));
  }
}

// ── Keyframe interpolation ────────────────────────────────────────────────────

function _lerpKF(frames, t, props) {
  let lo = frames[0], hi = frames[frames.length - 1];
  for (let k = 0; k < frames.length - 1; k++) {
    if (frames[k].t <= t && frames[k + 1].t > t) { lo = frames[k]; hi = frames[k + 1]; break; }
  }
  const f = lo.t >= hi.t ? 0 : (t - lo.t) / (hi.t - lo.t);
  const out = {};
  for (const p of props) {
    const va = lo[p], vb = hi[p];
    out[p] = va instanceof THREE.Color ? va.clone().lerp(vb, f) : va + (vb - va) * f;
  }
  return out;
}
