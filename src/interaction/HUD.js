import GUI from 'lil-gui';
import { EventBus } from '../core/EventBus.js';

export class HUD {
  constructor(container) {
    this._gui = new GUI({ container, title: 'Luna Park 3D' });
    this._gui.domElement.style.pointerEvents = 'auto';
    this._gui.domElement.style.userSelect    = 'none';

    this._state = {
      timeOfDay:     0.5,
      neonColor:     '#ff44ff',
      help:          false,
      autoTime:      false,
    };

    this._rideReadouts = {};   // rideId → { speed, folder }
    this._toastEl = null;

    // ── Rides folder ──────────────────────────────────────────────────────
    this._ridesFolder = this._gui.addFolder('Rides');

    // ── Scene folder ──────────────────────────────────────────────────────
    this._sceneFolder = this._gui.addFolder('Scene');
    this._sceneFolder.add(this._state, 'timeOfDay', 0, 1, 0.01).name('Time of Day')
      .onChange(v => EventBus.emit('daynight:set', v));
    this._sceneFolder.add(this._state, 'autoTime').name('Auto cycle')
      .onChange(v => EventBus.emit('daynight:auto', v));
    this._sceneFolder.addColor(this._state, 'neonColor').name('Neon colour')
      .onChange(v => EventBus.emit('rideNeon:setColor', v));

    // ── Debug folder ──────────────────────────────────────────────────────
    this._debugFolder = this._gui.addFolder('Debug');
    this._debugFolder.close();

    this._sceneFolder.close();
    this._ridesFolder.open();

    // ── Help overlay ──────────────────────────────────────────────────────
    this._helpEl = this._buildHelp(container);

    EventBus.on('input:key', ({ code, action }) => {
      if (action !== 'down') return;
      if (code === 'KeyH') this._toggleHelp();
    });

    // ── Toast ─────────────────────────────────────────────────────────────
    this._toastEl = this._buildToast(container);
    EventBus.on('hud:toast', ({ msg, dur = 2500 }) => this._showToast(msg, dur));

    // ── Ride state readouts ───────────────────────────────────────────────
    EventBus.on('ride:state', ({ rideId, state }) => {
      const r = this._rideReadouts[rideId];
      if (r) r.stateCtrl.setValue(state);
    });
  }

  addRide(rideId, rideLabel) {
    const folder = this._ridesFolder.addFolder(rideLabel);
    const obj    = { state: 'idle', speed: '1.0×' };
    const stateCtrl = folder.add(obj, 'state').name('State').disable();
    folder.add(obj, 'speed').name('Speed').disable();
    this._rideReadouts[rideId] = { folder, obj, stateCtrl };
  }

  updateRideSpeed(rideId, multiplier) {
    const r = this._rideReadouts[rideId];
    if (r) r.obj.speed = `${multiplier.toFixed(1)}×`;
  }

  update(_dt) {
    // Refresh speed readouts each frame (controllers observe obj directly)
    for (const r of Object.values(this._rideReadouts)) {
      r.folder.controllers.forEach(c => c.updateDisplay());
    }
  }

  _toggleHelp() {
    this._state.help = !this._state.help;
    this._helpEl.style.display = this._state.help ? 'block' : 'none';
  }

  _buildHelp(container) {
    const el = document.createElement('div');
    el.style.cssText = `
      position:fixed; top:50%; left:50%; transform:translate(-50%,-50%);
      background:rgba(0,0,0,0.82); color:#fff; padding:24px 32px;
      border-radius:12px; font-size:14px; line-height:1.9;
      display:none; pointer-events:none; z-index:50;
      font-family:monospace; min-width:280px;
    `;
    el.innerHTML = `
      <b>LUNA PARK 3D — Controls</b><br>
      <b>Click ground</b> — fly to point<br>
      <b>Click panel</b> — start / stop ride<br>
      <b>Click lamppost</b> — toggle light<br>
      <b>Scroll over ride</b> — change speed<br>
      <b>G</b> — enter gondola FPV<br>
      <b>Esc / G</b> — exit gondola<br>
      <b>[  ]</b> — scrub time of day<br>
      <b>P</b> — pause day cycle<br>
      <b>R</b> — reset camera<br>
      <b>H</b> — toggle this help<br>
      <b>1–4</b> — fly to ride 1–4<br>
    `;
    container.appendChild(el);
    return el;
  }

  _buildToast(container) {
    const el = document.createElement('div');
    el.style.cssText = `
      position:fixed; bottom:32px; left:50%; transform:translateX(-50%);
      background:rgba(0,0,0,0.75); color:#fff; padding:8px 20px;
      border-radius:8px; font-size:13px; pointer-events:none;
      opacity:0; transition:opacity 0.3s; z-index:60;
      font-family:system-ui,sans-serif;
    `;
    container.appendChild(el);
    return el;
  }

  _showToast(msg, dur) {
    this._toastEl.textContent = msg;
    this._toastEl.style.opacity = '1';
    clearTimeout(this._toastTimeout);
    this._toastTimeout = setTimeout(() => {
      this._toastEl.style.opacity = '0';
    }, dur);
  }

  get gui() { return this._gui; }
}
