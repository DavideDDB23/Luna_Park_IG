import GUI from 'lil-gui';
import { EventBus } from '../core/EventBus.js';

export class HUD {
  constructor(container) {
    this._gui = new GUI({ container, title: 'Luna Park 3D' });
    this._gui.domElement.style.pointerEvents = 'auto';

    // Placeholder folders — controllers added as milestones progress
    this._rides  = this._gui.addFolder('Rides');
    this._scene  = this._gui.addFolder('Scene');
    this._debug  = this._gui.addFolder('Debug');
    this._debug.close();

    // M2: empty panel visible (checklist item)
    this._state = {
      timeOfDay: 0.5,
      help: false,
    };

    this._scene.add(this._state, 'timeOfDay', 0, 1, 0.01).name('Time of Day')
      .onChange(v => EventBus.emit('daynight:set', v));

    this._rides.close();
    this._scene.close();
  }

  // Called from main loop to keep readouts live
  update(_dt) {}

  get gui() { return this._gui; }
}
