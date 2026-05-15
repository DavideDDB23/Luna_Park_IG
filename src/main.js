import * as THREE from 'three';
import Stats from 'stats.js';

import { App }          from './core/App.js';
import { Loop }         from './core/Loop.js';
import { Clock }        from './core/Clock.js';
import { EventBus }     from './core/EventBus.js';

import { SceneRoot }    from './scene/SceneRoot.js';
import { Ground }       from './scene/Ground.js';
import { Skybox }       from './scene/Skybox.js';

import { LightingRig, RIDE_SITES } from './lighting/LightingRig.js';

import { CameraRig }    from './camera/CameraRig.js';
import { InputRouter }  from './interaction/InputRouter.js';
import { Raycaster }    from './interaction/Raycaster.js';
import { HUD }          from './interaction/HUD.js';

import { TweenRegistry }from './animation/TweenRegistry.js';
import { Composer }     from './post/Composer.js';

import { FerrisWheel }   from './rides/FerrisWheel.js';

import { addAxesHelper, printSceneGraph } from './utils/debug.js';
import { isDebug, initSite }              from './utils/url.js';

// ── Boot ───────────────────────────────────────────────────────────────────

const canvas = document.getElementById('canvas');
const app    = new App(canvas);
const { scene, renderer, camera } = app;
const clock  = new Clock();

// ── Scene graph ─────────────────────────────────────────────────────────────

const root      = new SceneRoot(scene);
const skybox    = new Skybox(scene);
const ground    = new Ground(root.world);
const lighting  = new LightingRig(scene, root.lights);

// ── Rides (M3+) ──────────────────────────────────────────────────────────────

const ferrisWheel = new FerrisWheel(root.rides, RIDE_SITES.ferrisWheel);
const rides = [ferrisWheel];

// ── Ride-site BoxHelper markers (T-107) ───────────────────────────────────

const MARKER_SIZE = 24;
for (const [id, pos] of Object.entries(RIDE_SITES)) {
  const box = new THREE.Box3(
    new THREE.Vector3(-MARKER_SIZE / 2, 0, -MARKER_SIZE / 2),
    new THREE.Vector3( MARKER_SIZE / 2, 8,  MARKER_SIZE / 2),
  ).translate(pos);
  const helper = new THREE.Box3Helper(box, 0xffff00);
  helper.name = `site_${id}`;
  root.world.add(helper);

  // Label (debug): small text via a simple sprite is M5+ — skip for now
}

// ── Camera ──────────────────────────────────────────────────────────────────

const cameraRig = new CameraRig(camera, renderer);

// Default overview position
camera.position.set(0, 55, 80);
camera.lookAt(0, 0, 0);
cameraRig._orbit.controls.target.set(0, 0, 0);

// ?site= jump (T-107)
if (initSite && RIDE_SITES[initSite]) {
  const sitePos = RIDE_SITES[initSite].clone();
  camera.position.copy(sitePos).add(new THREE.Vector3(0, 20, 30));
  camera.lookAt(sitePos);
  cameraRig._orbit.controls.target.copy(sitePos);
}

// ── Input ───────────────────────────────────────────────────────────────────

const inputRouter = new InputRouter(canvas);
inputRouter.init();
const raycaster = new Raycaster(camera, scene);
void raycaster;

// Mark ground as pickable for ClickToFly (M4)
ground.mesh.userData.pickable = true;

// ── HUD ─────────────────────────────────────────────────────────────────────

const hud = new HUD(document.getElementById('hud'));

// ── Post ────────────────────────────────────────────────────────────────────

const composer = new Composer(renderer, scene, camera);

EventBus.on('input:resize', ({ w, h }) => {
  app.onResize();
  composer.setSize(w, h);
});

// ── Debug ───────────────────────────────────────────────────────────────────

let stats = null;
if (isDebug) {
  stats = new Stats();
  stats.showPanel(0);
  stats.dom.style.position = 'fixed';
  stats.dom.style.top  = '0';
  stats.dom.style.left = '0';
  document.getElementById('hud').appendChild(stats.dom);
  addAxesHelper(scene, 10);
}

EventBus.on('input:key', ({ code }) => {
  if (code === 'KeyT' && isDebug) printSceneGraph(scene);
  // Quick toggle for testing via keyboard '1'
  if (code === 'Digit1') EventBus.emit('ride:toggle', { rideId: 'ferrisWheel' });
});

// ── Frame loop (TECHNICAL_ARCHITECTURE §4 order) ──────────────────────────

const loop = new Loop(_tick);

function _tick() {
  // 1. inputs — flushed via DOM event listeners (InputRouter)
  // 2. clock
  const dt = clock.tick();
  // 3. HUD
  hud.update(dt);
  // 4. camera
  cameraRig.update(dt);
  // 5. tweens
  TweenRegistry.update(performance.now());
  // 6. rides
  for (const ride of rides) ride.update(dt, clock.elapsed);
  // 7. lighting — DayNight.update() in M5
  // 8. passive scene — visitors in M4
  // 9. render
  composer.render();
  // 10. debug
  stats?.update();
}

// ── Start ───────────────────────────────────────────────────────────────────

loop.start();

const loadingScreen = document.getElementById('loading-screen');
loadingScreen.classList.add('hidden');
setTimeout(() => loadingScreen.remove(), 600);
