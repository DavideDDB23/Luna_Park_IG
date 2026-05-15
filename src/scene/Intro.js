import * as THREE from 'three';
import * as TWEEN from 'tween';
import { AssetLoader } from '../core/AssetLoader.js';

// ── Utilities ─────────────────────────────────────────────────────────────────

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

function tw(from, to, ms, onUpdate, ease = TWEEN.Easing.Quadratic.InOut) {
  return new Promise(r =>
    new TWEEN.Tween(from).to(to, ms).easing(ease).onUpdate(onUpdate).onComplete(r).start(),
  );
}

// ── Name label ────────────────────────────────────────────────────────────────

function makeLabel(text, fontSize = 38) {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 96;
  const ctx = c.getContext('2d');

  ctx.fillStyle = 'rgba(0,0,0,0.58)';
  ctx.beginPath();
  ctx.roundRect(10, 8, 492, 80, 18);
  ctx.fill();

  ctx.fillStyle    = '#ffffff';
  ctx.font         = `bold ${fontSize}px system-ui, sans-serif`;
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor  = 'rgba(0,0,0,0.9)';
  ctx.shadowBlur   = 8;
  ctx.fillText(text, 256, 48);

  const mat = new THREE.SpriteMaterial({
    map:        new THREE.CanvasTexture(c),
    transparent: true,
    depthTest:   false,
    depthWrite:  false,
    opacity:     0,
  });
  const s = new THREE.Sprite(mat);
  s.scale.set(3.0, 0.72, 1);
  s.renderOrder   = 999;
  s.frustumCulled = false;
  return s;
}

// ── Walk-bob animation ────────────────────────────────────────────────────────
// Drives position.y and bone rotations via setInterval — no imported clips.

function startWalk(model, onFrame) {
  // Collect limb bones by name heuristic
  const bone = { aL: null, aR: null, lL: null, lR: null };
  model.traverse(n => {
    if (!n.isBone) return;
    const nm = n.name.toLowerCase();
    const isL = nm.includes('left')  || nm.endsWith('_l') || nm.endsWith('.l');
    const isR = nm.includes('right') || nm.endsWith('_r') || nm.endsWith('.r');
    if (!bone.aL && isL && nm.includes('arm'))                          bone.aL = n;
    if (!bone.aR && isR && nm.includes('arm'))                          bone.aR = n;
    if (!bone.lL && isL && (nm.includes('upleg') || nm.includes('thigh') || nm.includes('upperleg'))) bone.lL = n;
    if (!bone.lR && isR && (nm.includes('upleg') || nm.includes('thigh') || nm.includes('upperleg'))) bone.lR = n;
  });

  let t = 0;
  const id = setInterval(() => {
    t += 0.055;
    const s = Math.sin(t * 3.6);
    // Vertical footstep bob — always visible, even without bones
    model.position.y = Math.abs(s) * 0.10;
    // Gentle side sway
    model.rotation.z = s * 0.022;
    // Bone-driven limb swing (silently skips if bones not found)
    if (bone.aL) bone.aL.rotation.x =  s * 0.50;
    if (bone.aR) bone.aR.rotation.x = -s * 0.50;
    if (bone.lL) bone.lL.rotation.x = -s * 0.38;
    if (bone.lR) bone.lR.rotation.x =  s * 0.38;
    if (onFrame) onFrame();
  }, 16);

  return () => clearInterval(id);
}

// ── Gate ──────────────────────────────────────────────────────────────────────

const GATE_Z = 53;
const DOOR_W = 3.2;
const DOOR_H = 4.0;
const ARCH_Y = DOOR_H + 0.5;

function buildGate(parent) {
  const wood = new THREE.MeshStandardMaterial({ color: 0x5a3010, roughness: 0.85, metalness: 0.10 });
  const iron = new THREE.MeshStandardMaterial({ color: 0x1a1a2e, roughness: 0.50, metalness: 0.85 });
  const gold = new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.25, metalness: 0.95, emissive: new THREE.Color(0xd4af37), emissiveIntensity: 0.25 });

  const lPiv = new THREE.Group(); lPiv.position.set(-DOOR_W, 0, GATE_Z);
  const rPiv = new THREE.Group(); rPiv.position.set( DOOR_W, 0, GATE_Z);
  parent.add(lPiv, rPiv);

  for (const [piv, sign] of [[lPiv, -1], [rPiv, 1]]) {
    const panel = new THREE.Mesh(new THREE.BoxGeometry(DOOR_W, DOOR_H, 0.18), wood);
    panel.position.set(sign * DOOR_W / 2, DOOR_H / 2, 0);
    panel.castShadow = true;
    piv.add(panel);
    // Horizontal rails
    for (const ry of [0.28, 0.62, 0.90]) {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(DOOR_W, 0.09, 0.22), iron);
      rail.position.set(sign * DOOR_W / 2, DOOR_H * ry, 0);
      piv.add(rail);
    }
    // Vertical bars
    for (let i = -2; i <= 2; i++) {
      const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.034, DOOR_H * 0.82, 6), iron);
      bar.position.set(sign * DOOR_W / 2 + i * 0.54, DOOR_H * 0.48, 0);
      piv.add(bar);
    }
  }

  // Curved arch
  const arch = new THREE.Mesh(new THREE.TorusGeometry(DOOR_W + 0.14, 0.17, 8, 32, Math.PI), gold);
  arch.rotation.z = Math.PI;
  arch.position.set(0, ARCH_Y, GATE_Z);
  parent.add(arch);

  const lintel = new THREE.Mesh(new THREE.BoxGeometry(DOOR_W * 2 + 0.5, 0.38, 0.18), iron);
  lintel.position.set(0, ARCH_Y, GATE_Z);
  parent.add(lintel);

  for (const sx of [-DOOR_W - 0.22, DOOR_W + 0.22]) {
    const pil = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.26, ARCH_Y + 0.5, 10), iron);
    pil.position.set(sx, (ARCH_Y + 0.5) / 2, GATE_Z);
    pil.castShadow = true;
    parent.add(pil);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.28, 10, 8), gold);
    cap.position.set(sx, ARCH_Y + 0.62, GATE_Z);
    parent.add(cap);
  }

  // LUNA PARK sign
  const sc = document.createElement('canvas');
  sc.width = 512; sc.height = 96;
  const sCtx = sc.getContext('2d');
  sCtx.fillStyle = '#d4af37';
  sCtx.font = 'bold 52px Georgia, serif';
  sCtx.textAlign = 'center'; sCtx.textBaseline = 'middle';
  sCtx.shadowColor = 'rgba(0,0,0,0.7)'; sCtx.shadowBlur = 6;
  sCtx.fillText('✦  LUNA PARK  ✦', 256, 48);
  const sign = new THREE.Mesh(
    new THREE.PlaneGeometry(DOOR_W * 1.85, 0.78),
    new THREE.MeshStandardMaterial({
      map: new THREE.CanvasTexture(sc),
      emissive: new THREE.Color(0xffdd88),
      emissiveIntensity: 0.35,
      transparent: true,
    }),
  );
  sign.position.set(0, ARCH_Y + 0.10, GATE_Z + 0.12);
  parent.add(sign);

  return { lPiv, rPiv };
}

// ── Cinematic letterbox + subtitle ────────────────────────────────────────────

function buildUI() {
  const barCSS = 'position:fixed;left:0;right:0;background:#000;z-index:200;pointer-events:none;transition:opacity 0.8s;';
  const top = document.createElement('div');
  top.style.cssText = barCSS + 'top:0;height:11vh;';
  const bot = document.createElement('div');
  bot.style.cssText = barCSS + 'bottom:0;height:11vh;';

  const sub = document.createElement('div');
  sub.style.cssText = `
    position:fixed;bottom:13.5vh;left:50%;transform:translateX(-50%);
    color:#fff;font:italic bold 20px Georgia,serif;text-align:center;
    text-shadow:0 2px 14px rgba(0,0,0,1),0 0 5px rgba(0,0,0,1);
    letter-spacing:0.06em;pointer-events:none;
    opacity:0;transition:opacity 0.7s;z-index:201;max-width:84vw;
  `;

  const fade = document.createElement('div');
  fade.style.cssText = 'position:fixed;inset:0;background:#000;z-index:210;pointer-events:none;opacity:1;transition:opacity 1s;';

  document.body.append(top, bot, sub, fade);

  return {
    showSub(txt)  { sub.textContent = txt; sub.style.opacity = '1'; },
    hideSub()     { sub.style.opacity = '0'; },
    fadeIn(ms = 1000)  {
      fade.style.opacity = '0';
      return delay(ms);
    },
    fadeOut(ms = 700) {
      fade.style.opacity = '1';
      return delay(ms);
    },
    remove() { [top, bot, sub, fade].forEach(e => e.remove()); },
  };
}

// ── Camera waypoints ──────────────────────────────────────────────────────────

const CAM_ENTRY    = new THREE.Vector3(0, 1.8, 80);
const CAM_INSIDE   = new THREE.Vector3(0, 4.0, 34);
const CAM_OVERVIEW = new THREE.Vector3(0, 55, 80);
const LOOK_GATE    = new THREE.Vector3(0, 2.8, GATE_Z);
const LOOK_INSIDE  = new THREE.Vector3(0, 2.0, 8);

// ── Intro class ───────────────────────────────────────────────────────────────

export class Intro {
  constructor(scene, camera, cameraRig, worldGroup) {
    this._scene   = scene;
    this._camera  = camera;
    this._rig     = cameraRig;
    this._world   = worldGroup;

    this._group = new THREE.Group();
    this._group.name = 'intro';
    scene.add(this._group);

    this._gate = buildGate(this._group);

    this._claudio    = null;
    this._nameSprite = null;
    this._headH      = 2.0;   // world-space character height, refined after load
    this._stopBob    = null;
    this._ui         = null;
  }

  // ── Load Claudio character ──────────────────────────────────────────────────

  async _loadClaudio() {
    const loader = new AssetLoader();
    const model  = await loader.loadModelOrFallback(
      'assets/models/characters/visitor_male_b.glb',
      () => {
        const g = new THREE.Group();
        const body = new THREE.Mesh(
          new THREE.CapsuleGeometry(0.27, 0.90, 6, 12),
          new THREE.MeshStandardMaterial({ color: 0x3366cc }),
        );
        body.position.y = 0.9;
        g.add(body);
        return g;
      },
    );

    model.scale.setScalar(0.9);
    model.position.set(0, 0, 67);
    model.rotation.y = Math.PI;
    model.name = 'claudio';
    model.traverse(n => {
      if (n.isMesh) {
        n.castShadow    = true;
        n.frustumCulled = false;
      }
    });
    this._group.add(model);
    this._claudio = model;

    // Compute actual head height so label sits directly above the model
    const bbox  = new THREE.Box3().setFromObject(model);
    this._headH = bbox.max.y - model.position.y; // height above feet in world space

    // Name sprite — added to _group at world position (not parented to model
    // so its world-space scale stays constant regardless of model.scale)
    const label = makeLabel('Claudio');
    this._updateLabelPos();
    this._group.add(label);
    this._nameSprite = label;
  }

  _updateLabelPos() {
    if (!this._nameSprite || !this._claudio) return;
    // Track character position + head height + small gap
    this._nameSprite.position.set(
      this._claudio.position.x,
      this._claudio.position.y + this._headH + 0.40,
      this._claudio.position.z,
    );
  }

  // ── Main sequence ───────────────────────────────────────────────────────────

  async play() {
    this._ui = buildUI();
    this._rig._orbit.disable();

    // Place camera at entry point
    this._camera.position.copy(CAM_ENTRY);
    this._camera.lookAt(LOOK_GATE);
    this._rig._orbit.controls.target.copy(LOOK_GATE);

    // Load Claudio while fading in from black
    await Promise.all([
      this._loadClaudio(),
      this._ui.fadeIn(1100),
    ]);

    // ── Phase 1: Claudio walks in place, name label fades in ─────────────────
    this._stopBob = startWalk(this._claudio, () => this._updateLabelPos());

    // Fade in name label
    await tw({ o: 0 }, { o: 1 }, 900,
      d => { if (this._nameSprite) this._nameSprite.material.opacity = d.o; },
      TWEEN.Easing.Sinusoidal.In,
    );

    // Settle a moment, then Claudio greets
    await delay(600);
    this._ui.showSub('"Benvenuti nel mio parco divertimenti!"');
    await delay(3000);
    this._ui.hideSub();
    await delay(500);

    // ── Phase 2: Gate opens with a dramatic Back easing ───────────────────────
    const { lPiv, rPiv } = this._gate;
    const lo = { y: 0 }, ro = { y: 0 };
    await Promise.all([
      tw(lo, { y: -Math.PI * 0.44 }, 1900, () => { lPiv.rotation.y = lo.y; }, TWEEN.Easing.Quadratic.InOut),
      tw(ro, { y:  Math.PI * 0.44 }, 1900, () => { rPiv.rotation.y = ro.y; }, TWEEN.Easing.Quadratic.InOut),
    ]);

    await delay(300);

    // ── Phase 3: Claudio steps aside; camera enters ───────────────────────────
    // Stop bob, reset model to neutral pose
    if (this._stopBob) { this._stopBob(); this._stopBob = null; }
    if (this._claudio) { this._claudio.position.y = 0; this._claudio.rotation.z = 0; }

    // Fade out name label while stepping aside
    const cSide = { x: 0 };
    const sideDur = 800;
    tw(cSide, { x: 5.5 }, sideDur, () => {
      if (!this._claudio) return;
      this._claudio.position.x = cSide.x;
      this._updateLabelPos();
    }, TWEEN.Easing.Quadratic.InOut);
    tw({ o: 1 }, { o: 0 }, sideDur - 100,
      d => { if (this._nameSprite) this._nameSprite.material.opacity = d.o; },
      TWEEN.Easing.Sinusoidal.In,
    );

    // Camera flies through gate — starts simultaneously
    const camFly = { t: 0 };
    const camStart = this._camera.position.clone();
    await tw(camFly, { t: 1 }, 3000, () => {
      this._camera.position.lerpVectors(camStart, CAM_INSIDE, camFly.t);
      const look = LOOK_GATE.clone().lerp(LOOK_INSIDE, camFly.t);
      this._rig._orbit.controls.target.copy(look);
      this._camera.lookAt(look);
    }, TWEEN.Easing.Quadratic.InOut);

    // ── Phase 4: Gate closes behind us ───────────────────────────────────────
    const lc = { y: lo.y }, rc = { y: ro.y };
    await Promise.all([
      tw(lc, { y: 0 }, 1100, () => { lPiv.rotation.y = lc.y; }, TWEEN.Easing.Quadratic.In),
      tw(rc, { y: 0 }, 1100, () => { rPiv.rotation.y = rc.y; }, TWEEN.Easing.Quadratic.In),
    ]);

    // ── Phase 5: Rise to overview ─────────────────────────────────────────────
    const rise = { t: 0 };
    const rMid   = this._camera.position.clone();
    const tMid   = this._rig._orbit.controls.target.clone();
    await tw(rise, { t: 1 }, 2400, () => {
      this._camera.position.lerpVectors(rMid, CAM_OVERVIEW, rise.t);
      this._rig._orbit.controls.target.lerpVectors(tMid, new THREE.Vector3(0, 0, 0), rise.t);
    }, TWEEN.Easing.Sinusoidal.InOut);

    // ── Cleanup ───────────────────────────────────────────────────────────────
    await this._ui.fadeOut(700);
    this._ui.remove();
    this._rig._orbit.controls.target.set(0, 0, 0);
    this._rig._orbit.enable();
    await delay(700);
    this._scene.remove(this._group);
  }
}
