import * as THREE from 'three';
import Stats from 'stats.js';

import { App }           from './core/App.js';
import { Loop }          from './core/Loop.js';
import { Clock }         from './core/Clock.js';
import { EventBus }      from './core/EventBus.js';

import { SceneRoot }     from './scene/SceneRoot.js';
import { Ground }        from './scene/Ground.js';
import { Skybox }        from './scene/Skybox.js';
import { Lampposts }     from './scene/Lampposts.js';
import { Furniture }     from './scene/Furniture.js';
import { Trees }         from './scene/Trees.js';
import { Visitors }      from './scene/Visitors.js';
import { WelcomeArch }   from './scene/WelcomeArch.js';
import { Stands }        from './scene/Stands.js';
import { Intro }         from './scene/Intro.js';

import { LightingRig, RIDE_SITES } from './lighting/LightingRig.js';
import { DayNight }        from './lighting/DayNight.js';
import { MaterialLibrary } from './materials/MaterialLibrary.js';

import { CameraRig }     from './camera/CameraRig.js';
import { ClickToFly }    from './camera/ClickToFly.js';
import { GondolaCam }    from './camera/GondolaCam.js';
import { InputRouter }   from './interaction/InputRouter.js';
import { Raycaster }     from './interaction/Raycaster.js';
import { HUD }           from './interaction/HUD.js';

import { FerrisWheel }   from './rides/FerrisWheel.js';
import { Carousel }      from './rides/Carousel.js';
import { RollerCoaster } from './rides/RollerCoaster.js';
import { Tagada }        from './rides/Tagada.js';

import { TweenRegistry } from './animation/TweenRegistry.js';
import { Composer }      from './post/Composer.js';

import { addAxesHelper, printSceneGraph } from './utils/debug.js';
import { isDebug, initSite }              from './utils/url.js';
import { matchesBinding }                 from './interaction/KeyMap.js';

// ── Boot ───────────────────────────────────────────────────────────────────

const canvas = document.getElementById('canvas');
const app    = new App(canvas);
const { scene, renderer, camera } = app;
const clock  = new Clock();

// ── Scene graph ─────────────────────────────────────────────────────────────

const root     = new SceneRoot(scene);
const skybox   = new Skybox(scene);
const ground   = new Ground(root.world);
const lighting = new LightingRig(scene, root.lights);

ground.mesh.userData.pickable = true;

// ── Material library (needs renderer for anisotropy caps — init before geometry) ─

const matLib = new MaterialLibrary(renderer);

// ── Lampposts + furniture (pass matLib for InstancedMesh materials) ──────────

const lampposts    = new Lampposts(root.world, root.lights, matLib);
const furniture    = new Furniture(root.world, matLib);
const trees        = new Trees(root.world);
const visitors     = new Visitors(root.world);
const welcomeArch  = new WelcomeArch(root.world);
const stands       = new Stands(root.world);

// ── Rides ────────────────────────────────────────────────────────────────────

const ferrisWheel   = new FerrisWheel(root.rides,   RIDE_SITES.ferrisWheel);
const carousel      = new Carousel(root.rides,      RIDE_SITES.carousel);
const rollerCoaster = new RollerCoaster(root.rides, RIDE_SITES.rollerCoaster);
const tagada        = new Tagada(root.rides,        RIDE_SITES.tagada);
const rides         = [ferrisWheel, carousel, rollerCoaster, tagada];

// ── Apply PBR materials to scene geometry ─────────────────────────────────────

matLib.applyToScene(scene);

// Neon rings — attached to ride roots so they orbit with the ride
(function _addNeonRings() {
  function ring(parent, radius, y, rot = 0) {
    const m = new THREE.Mesh(
      new THREE.TorusGeometry(radius, 0.06, 8, 64),
      matLib.freshNeon(),
    );
    m.name = 'neonRing';
    m.position.y = y;
    m.rotation.x = Math.PI / 2 + rot;
    parent.add(m);
  }
  ring(ferrisWheel.root,    12.2, 13, 0);     // around ferris hub
  ring(carousel._platform,   5.8,  7.3, 0);   // under canopy
  ring(tagada.root,           3.8,  0.5, 0);  // ground ring
})();

// Window panels on control-panel pedestals (mat.emissive.window)
scene.traverse(obj => {
  if (obj.name !== 'pedestal') return;
  const win = new THREE.Mesh(
    new THREE.PlaneGeometry(0.28, 0.18),
    matLib.get('emissive.window'),
  );
  win.name = 'windowPanel';
  win.position.set(0, 0.42, 0.202);
  obj.add(win);
});

// ── Day/night cycle ───────────────────────────────────────────────────────────

const dayNight = new DayNight(lighting, scene, skybox, lampposts, matLib);

// ── Camera ──────────────────────────────────────────────────────────────────

const cameraRig  = new CameraRig(camera, renderer);
const gondolaCam = new GondolaCam(cameraRig, ferrisWheel);
cameraRig.setGondolaCam(gondolaCam);

// Walk mode UI
const _walkCross = document.getElementById('walk-crosshair');
const _walkBadge = document.getElementById('walk-mode-badge');
EventBus.on('camera:modeChanged', m => {
  const isWalk = m === 'walk';
  _walkCross.style.display = isWalk ? 'block' : 'none';
  _walkBadge.style.display = isWalk ? 'block' : 'none';
});

camera.position.set(0, 55, 80);
camera.lookAt(0, 0, 0);
cameraRig._orbit.controls.target.set(0, 0, 0);

if (initSite && RIDE_SITES[initSite]) {
  const sp = RIDE_SITES[initSite].clone();
  camera.position.copy(sp).add(new THREE.Vector3(0, 20, 30));
  camera.lookAt(sp);
  cameraRig._orbit.controls.target.copy(sp);
}

// ── Input ───────────────────────────────────────────────────────────────────

const inputRouter = new InputRouter(canvas);
inputRouter.init();

// ── Raycaster ────────────────────────────────────────────────────────────────

const raycaster  = new Raycaster(camera, scene);
const clickToFly = new ClickToFly(cameraRig, ground.mesh);

// Lamppost click handler
EventBus.on('raycast:hit', ({ object }) => {
  if (typeof object.userData.lamppostIndex === 'number') {
    lampposts.toggleLamp(object.userData.lamppostIndex);
  }
});

// ── Scroll-wheel ride speed (T-406) ──────────────────────────────────────────

// Track pointer's last NDC for ride focus detection
let _lastNDC = { x: 0, y: 0 };
EventBus.on('input:drag', ({ ndc }) => { _lastNDC = ndc; });

const _speedRaycaster = new THREE.Raycaster();
EventBus.on('input:wheel', ({ dy, ndc }) => {
  _lastNDC = ndc;
  _speedRaycaster.setFromCamera(ndc, camera);
  const hits = _speedRaycaster.intersectObjects(root.rides.children, true);
  const rideHit = hits.find(h => h.object.userData.rideRef ||
    h.object.parent?.userData?.rideRef || _findRideGroup(h.object));
  if (!rideHit) return;

  const rideId = _resolveRideId(rideHit.object);
  if (!rideId) return;
  const ride = rides.find(r => r.rideId === rideId);
  if (!ride || ride.state === 'idle') return;

  const newMult = Math.max(0.2, Math.min(3.0, ride.speedMultiplier - dy * 0.15));
  ride.setSpeedMultiplier(newMult);
  EventBus.emit('hud:toast', { msg: `${rideId} speed ×${newMult.toFixed(1)}`, dur: 1200 });
  hud.updateRideSpeed(rideId, newMult);
});

function _findRideGroup(obj) {
  let cur = obj;
  while (cur) {
    if (cur.userData?.rideId) return cur;
    cur = cur.parent;
  }
  return null;
}
function _resolveRideId(obj) {
  if (obj.userData.rideRef) return obj.userData.rideRef;
  let cur = obj.parent;
  while (cur) {
    if (cur.name && rides.some(r => r.rideId === cur.name)) return cur.name;
    cur = cur.parent;
  }
  return null;
}

// Cursor affordance for pickable meshes
const _hoverRay = new THREE.Raycaster();
function _updateCursor(ndc) {
  _hoverRay.setFromCamera(ndc, camera);
  const hits = _hoverRay.intersectObjects(scene.children, true)
    .filter(h => h.object.userData.pickable);
  canvas.style.cursor = hits.length ? 'pointer' : 'default';
}
canvas.addEventListener('pointermove', e => {
  _updateCursor({
    x:  (e.clientX / window.innerWidth)  * 2 - 1,
    y: -(e.clientY / window.innerHeight) * 2 + 1,
  });
});

// ── HUD ─────────────────────────────────────────────────────────────────────

const hud = new HUD(document.getElementById('hud'));
hud.addRide('ferrisWheel',   'Ferris Wheel');
hud.addRide('carousel',      'Carousel');
hud.addRide('rollerCoaster', 'Roller Coaster');
hud.addRide('tagada',        'Tagada');

// Keyboard ride quick-fly shortcuts
const RIDE_FLY_TARGETS = [
  RIDE_SITES.ferrisWheel, RIDE_SITES.carousel,
  RIDE_SITES.rollerCoaster, RIDE_SITES.tagada,
];
EventBus.on('input:key', ({ code, action }) => {
  if (action !== 'down') return;
  [1, 2, 3, 4].forEach((n, i) => {
    if (matchesBinding(`FLY_RIDE_${n}`, code)) {
      const p = RIDE_FLY_TARGETS[i].clone().add(new THREE.Vector3(0, 15, 20));
      cameraRig.flyTo(p, RIDE_FLY_TARGETS[i]);
    }
  });
  if (code === 'KeyT' && isDebug) printSceneGraph(scene);
});

// ── Post ────────────────────────────────────────────────────────────────────

const composer = new Composer(renderer, scene, camera);

EventBus.on('input:resize', ({ w, h }) => {
  app.onResize();
  composer.setSize(w, h);
});

// ── Debug overlay ───────────────────────────────────────────────────────────

let stats = null;
if (isDebug) {
  stats = new Stats();
  stats.showPanel(0);
  stats.dom.style.cssText = 'position:fixed;top:0;left:0;';
  document.getElementById('hud').appendChild(stats.dom);
  addAxesHelper(scene, 10);
}

// ── BoxHelper markers ────────────────────────────────────────────────────────

if (isDebug) {
  for (const [id, pos] of Object.entries(RIDE_SITES)) {
    const box = new THREE.Box3(
      new THREE.Vector3(-12, 0, -12), new THREE.Vector3(12, 8, 12),
    ).translate(pos);
    const h = new THREE.Box3Helper(box, 0xffff00);
    h.name = `site_${id}`;
    root.world.add(h);
  }
}

// ── Frame loop (TECHNICAL_ARCHITECTURE §4 order) ──────────────────────────

const loop = new Loop(_tick);

function _tick() {
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
  // 7. lighting / day-night
  lampposts.update(dt);
  dayNight.update(dt, clock.elapsed);
  // 8. passive scene (visitors M4+)
  // 9. render
  composer.render();
  // 10. debug
  stats?.update();
}

// ── Debug helpers (only in ?debug mode) ──────────────────────────────────────
if (isDebug) {
  window.__setTime = t => EventBus.emit('daynight:set', t);
  window.__bus     = EventBus;
}

// ── Start ───────────────────────────────────────────────────────────────────

loop.start();

// ── Intro sequence (runs once on boot, then hands control to user) ────────────
(async () => {
  const intro = new Intro(scene, camera, cameraRig, root.world);
  try {
    await intro.play();
  } catch (e) {
    console.warn('[Intro] skipped:', e);
    cameraRig._orbit.enable();
  }
})();

// Async model loads — run after loop starts so fallback primitives are visible immediately
Promise.all([
  trees.loadAsync(),
  visitors.loadAsync(),
  welcomeArch.loadAsync(),
  stands.loadAsync(),
  lampposts.loadAsync(root.world),
  rollerCoaster.loadAsync(),
]).catch(e => console.warn('[main] async model load error:', e));

document.getElementById('loading-screen')?.classList.add('hidden');
setTimeout(() => document.getElementById('loading-screen')?.remove(), 600);
