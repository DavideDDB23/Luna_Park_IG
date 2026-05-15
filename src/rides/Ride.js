import * as TWEEN from 'tween';
import { EventBus } from '../core/EventBus.js';
import { RAMP_DURATION_MS } from '../config.js';

// ANIM CATEGORY: tweened (speed ramp) + procedural (continuous motion)
export class Ride {
  constructor(rideId, opts = {}) {
    this.rideId          = rideId;
    this.state           = 'idle';     // idle | ramping_up | running | ramping_down
    this.speed           = 0;
    this.targetSpeed     = opts.targetSpeed ?? 1.0;
    this.speedMultiplier = 1.0;
    this.panel           = null;
    this._rampTween      = null;
    this._pendingToggle  = false;      // allow one queued toggle during ramp

    EventBus.on('ride:toggle', ({ rideId }) => {
      if (rideId === this.rideId) this.toggle();
    });
  }

  toggle() {
    if (this.state === 'idle') {
      this._rampTo(this.targetSpeed * this.speedMultiplier, 'running');
    } else if (this.state === 'running') {
      this._rampTo(0, 'idle');
    } else if (this.state === 'ramping_up' || this.state === 'ramping_down') {
      // queue one toggle — resolve when current ramp finishes
      if (!this._pendingToggle) this._pendingToggle = true;
    }
  }

  setSpeedMultiplier(x) {
    this.speedMultiplier = Math.max(0.2, Math.min(3.0, x));
    if (this.state === 'running') {
      this._rampTo(this.targetSpeed * this.speedMultiplier, 'running');
    }
  }

  _rampTo(target, endState) {
    this._rampTween?.stop();
    const obj = { s: this.speed };
    const newState = target > 0 ? 'ramping_up' : 'ramping_down';
    this.state = newState;
    EventBus.emit('ride:state', { rideId: this.rideId, state: this.state });

    this._rampTween = new TWEEN.Tween(obj)
      .to({ s: target }, RAMP_DURATION_MS)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onUpdate(() => { this.speed = obj.s; })
      .onComplete(() => {
        this.speed  = target;
        this.state  = endState;
        this._rampTween = null;
        EventBus.emit('ride:state', { rideId: this.rideId, state: this.state });
        if (this._pendingToggle) {
          this._pendingToggle = false;
          this.toggle();
        }
      })
      .start();
  }

  // Subclasses implement — called each frame while running or ramping
  update(_dt, _elapsed) {}

  dispose() {
    this._rampTween?.stop();
  }
}
