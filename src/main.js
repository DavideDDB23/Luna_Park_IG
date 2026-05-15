import * as THREE from 'three';
import * as TWEEN from 'tween';
import Stats from 'stats.js';
import { App } from './core/App.js';
import { Loop } from './core/Loop.js';
import { Clock } from './core/Clock.js';
import { isDebug } from './utils/url.js';
import { addAxesHelper } from './utils/debug.js';

// ── Bootstrap ──────────────────────────────────────────────────────────────

const canvas  = document.getElementById('canvas');
const app     = new App(canvas);
const { scene, renderer, camera } = app;
const clock   = new Clock();

// ── Placeholder cube (M1 only — swapped out in M2+) ───────────────────────

const cube = new THREE.Mesh(
  new THREE.BoxGeometry(2, 2, 2),
  new THREE.MeshStandardMaterial({ color: 0x22ff88 })
);
scene.add(cube);

// Basic light so the cube isn't black
const ambient = new THREE.AmbientLight(0xffffff, 0.6);
const sun     = new THREE.DirectionalLight(0xffffff, 1.4);
sun.position.set(10, 20, 10);
scene.add(ambient, sun);

// ── Debug overlay ──────────────────────────────────────────────────────────

let stats = null;
if (isDebug) {
  stats = new Stats();
  stats.showPanel(0);                          // 0 = fps
  stats.dom.style.position = 'fixed';
  stats.dom.style.top = '0';
  stats.dom.style.left = '0';
  document.getElementById('hud').appendChild(stats.dom);
  addAxesHelper(scene, 8);
}

// ── Frame loop (TECHNICAL_ARCHITECTURE §4) ─────────────────────────────────

const loop = new Loop(_tick);

function _tick() {
  const dt = clock.tick();

  // 1. inputs — none yet (InputRouter wired in M2)
  // 2. clock already ticked above
  // 3. HUD state — none yet
  // 4. camera — none yet
  // 5. tweens
  TWEEN.update(performance.now());
  // 6. rides — none yet
  // 7. lighting — none yet
  // 8. passive scene
  cube.rotation.y += dt * 0.8;
  cube.rotation.x += dt * 0.3;
  // 9. render
  renderer.render(scene, camera);
  // 10. debug
  stats?.update();
}

// ── Resize ─────────────────────────────────────────────────────────────────

window.addEventListener('resize', () => app.onResize());

// ── Start ──────────────────────────────────────────────────────────────────

loop.start();

const loadingScreen = document.getElementById('loading-screen');
loadingScreen.classList.add('hidden');
setTimeout(() => loadingScreen.remove(), 600);
