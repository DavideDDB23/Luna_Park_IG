import * as THREE from 'three';
import * as TWEEN from 'tween';
import { AssetLoader } from '../core/AssetLoader.js';

// ── helpers ──────────────────────────────────────────────────────────────────

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function tween(from, to, ms, onUpdate, ease = TWEEN.Easing.Quadratic.InOut) {
  return new Promise(r => {
    new TWEEN.Tween(from)
      .to(to, ms)
      .easing(ease)
      .onUpdate(onUpdate)
      .onComplete(r)
      .start();
  });
}

function makeLabel(text, fontSize = 36, bgAlpha = 0.0) {
  const canvas = document.createElement('canvas');
  canvas.width  = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (bgAlpha > 0) {
    ctx.fillStyle = `rgba(0,0,0,${bgAlpha})`;
    ctx.roundRect(8, 8, 496, 112, 16);
    ctx.fill();
  }
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${fontSize}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0,0,0,0.8)';
  ctx.shadowBlur = 6;
  ctx.fillText(text, 256, 64);
  const tex = new THREE.CanvasTexture(canvas);
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(4, 1, 1);
  return sprite;
}

// ── Gate ────────────────────────────────────────────────────────────────────

const GATE_Z    = 53;
const DOOR_W    = 3.2;
const DOOR_H    = 4.0;
const DOOR_D    = 0.18;
const ARCH_Y    = DOOR_H + 0.5;

function buildGate(parent) {
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x5a3010, roughness: 0.85, metalness: 0.1 });
  const ironMat = new THREE.MeshStandardMaterial({ color: 0x222233, roughness: 0.5, metalness: 0.8 });

  // Left pivot
  const leftPivot = new THREE.Group();
  leftPivot.position.set(-DOOR_W, 0, GATE_Z);
  parent.add(leftPivot);

  // Right pivot
  const rightPivot = new THREE.Group();
  rightPivot.position.set(DOOR_W, 0, GATE_Z);
  parent.add(rightPivot);

  // Door panels — offset so hinge is at pivot
  for (const [pivot, sign] of [[leftPivot, -1], [rightPivot, 1]]) {
    const panel = new THREE.Mesh(new THREE.BoxGeometry(DOOR_W, DOOR_H, DOOR_D), woodMat);
    panel.position.set(sign * DOOR_W / 2, DOOR_H / 2, 0);
    panel.castShadow = true;
    pivot.add(panel);

    // Horizontal rails
    for (const ry of [0.4, 0.85]) {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(DOOR_W, 0.08, DOOR_D + 0.04), ironMat);
      rail.position.set(sign * DOOR_W / 2, DOOR_H * ry, 0.02);
      pivot.add(rail);
    }
  }

  // Arch lintel
  const lintel = new THREE.Mesh(new THREE.BoxGeometry(DOOR_W * 2 + 0.4, 0.35, DOOR_D), ironMat);
  lintel.position.set(0, ARCH_Y, GATE_Z);
  lintel.castShadow = false;
  parent.add(lintel);

  // Side pillars
  for (const sx of [-DOOR_W - 0.2, DOOR_W + 0.2]) {
    const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.3, ARCH_Y + 0.35, 0.3), ironMat);
    pillar.position.set(sx, (ARCH_Y + 0.35) / 2, GATE_Z);
    pillar.castShadow = true;
    parent.add(pillar);
  }

  return { leftPivot, rightPivot };
}

// ── Intro ────────────────────────────────────────────────────────────────────

const CAMERA_ENTRY    = new THREE.Vector3(0, 2.0, 78);
const CAMERA_INSIDE   = new THREE.Vector3(-4, 4.5, 38);
const CAMERA_OVERVIEW = new THREE.Vector3(0, 55, 80);
const LOOK_GATE       = new THREE.Vector3(0, 2.5, GATE_Z);

export class Intro {
  constructor(scene, camera, cameraRig, worldGroup) {
    this._scene     = scene;
    this._camera    = camera;
    this._rig       = cameraRig;
    this._world     = worldGroup;
    this._group     = new THREE.Group();
    this._group.name = 'intro';
    scene.add(this._group);

    this._gate = buildGate(this._group);
    this._claudio = null;     // loaded async
    this._nameSprite = null;
  }

  async _loadClaudio() {
    const loader = new AssetLoader();
    const model  = await loader.loadModelOrFallback(
      'assets/models/characters/visitor_male_b.glb',
      () => {
        const g = new THREE.Group();
        const body = new THREE.Mesh(
          new THREE.CapsuleGeometry(0.28, 0.9, 6, 12),
          new THREE.MeshStandardMaterial({ color: 0x3366cc }),
        );
        body.position.y = 0.9;
        g.add(body);
        return g;
      },
    );
    model.scale.setScalar(0.9);
    model.position.set(0, 0, 67);
    model.rotation.y = Math.PI; // face camera
    model.name = 'claudio';
    model.traverse(n => { if (n.isMesh) n.castShadow = true; });
    this._group.add(model);
    this._claudio = model;

    // Name label
    const label = makeLabel('Claudio', 40);
    label.position.set(0, 2.6, 67);
    this._group.add(label);
    this._nameSprite = label;
  }

  async play() {
    // ── Setup ────────────────────────────────────────────────────────────────
    this._rig._orbit.disable();
    this._camera.position.copy(CAMERA_ENTRY);
    this._camera.lookAt(LOOK_GATE);
    this._rig._orbit.controls.target.copy(LOOK_GATE);

    await this._loadClaudio();

    // Show greeting overlay
    const overlay = document.createElement('div');
    overlay.id = 'intro-overlay';
    overlay.style.cssText = `
      position:fixed; bottom:20%; left:50%; transform:translateX(-50%);
      background:rgba(0,0,0,0.65); color:#fff;
      padding:16px 32px; border-radius:12px;
      font:bold 22px system-ui,sans-serif; text-align:center;
      opacity:0; transition:opacity 0.6s; pointer-events:none;
      max-width:600px; line-height:1.4;
    `;
    overlay.innerHTML = '🎡 Benvenuti nel mio parco divertimenti!';
    document.body.appendChild(overlay);

    // ── Phase 1 (0.5s): camera settle ───────────────────────────────────────
    await delay(500);

    // ── Phase 2 (2s): gate opens ─────────────────────────────────────────────
    const lp = this._gate.leftPivot,  rp = this._gate.rightPivot;
    const lObj = { y: 0 }, rObj = { y: 0 };
    await Promise.all([
      tween(lObj, { y: -Math.PI * 0.42 }, 1600, () => { lp.rotation.y = lObj.y; }, TWEEN.Easing.Quadratic.InOut),
      tween(rObj, { y:  Math.PI * 0.42 }, 1600, () => { rp.rotation.y = rObj.y; }, TWEEN.Easing.Quadratic.InOut),
    ]);

    // ── Phase 3 (1s): greeting text ──────────────────────────────────────────
    await delay(200);
    overlay.style.opacity = '1';
    await delay(2200);
    overlay.style.opacity = '0';
    await delay(700);

    // ── Phase 4 (2.5s): camera flies through gate ────────────────────────────
    // Claudio steps aside
    if (this._claudio) {
      const cObj = { x: 0 };
      tween(cObj, { x: 4 }, 600, () => { this._claudio.position.x = cObj.x; });
      if (this._nameSprite) tween({ o: 1 }, { o: 0 }, 600, d => { this._nameSprite.material.opacity = d.o; });
    }

    const camObj = { t: 0 };
    const camStart = CAMERA_ENTRY.clone();
    await tween(camObj, { t: 1 }, 2400, () => {
      this._camera.position.lerpVectors(camStart, CAMERA_INSIDE, camObj.t);
      const look = LOOK_GATE.clone().lerp(new THREE.Vector3(-4, 3, 10), camObj.t);
      this._rig._orbit.controls.target.copy(look);
      this._camera.lookAt(look);
    }, TWEEN.Easing.Quadratic.InOut);

    // ── Phase 5 (1s): gate closes ────────────────────────────────────────────
    const lc = { y: lObj.y }, rc = { y: rObj.y };
    await Promise.all([
      tween(lc, { y: 0 }, 1000, () => { lp.rotation.y = lc.y; }),
      tween(rc, { y: 0 }, 1000, () => { rp.rotation.y = rc.y; }),
    ]);

    // ── Phase 6 (1.8s): rise to overview ─────────────────────────────────────
    const rObj2 = { t: 0 };
    const camMid  = this._camera.position.clone();
    const lookMid = this._rig._orbit.controls.target.clone();
    await tween(rObj2, { t: 1 }, 1800, () => {
      this._camera.position.lerpVectors(camMid, CAMERA_OVERVIEW, rObj2.t);
      this._rig._orbit.controls.target.lerpVectors(lookMid, new THREE.Vector3(0, 0, 0), rObj2.t);
    }, TWEEN.Easing.Quadratic.InOut);

    // ── Cleanup ──────────────────────────────────────────────────────────────
    overlay.remove();
    this._rig._orbit.controls.target.set(0, 0, 0);
    this._rig._orbit.enable();

    // Remove Claudio + name label after some time
    await delay(1000);
    this._scene.remove(this._group);
  }
}
