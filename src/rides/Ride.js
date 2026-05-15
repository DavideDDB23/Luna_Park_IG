// Abstract base — state machine, common API. Concrete rides extend this.
export class Ride {
  constructor(root, opts = {}) {
    this.root            = root;
    this.state           = 'idle';               // idle | ramping_up | running | ramping_down
    this.speed           = 0;
    this.targetSpeed     = opts.targetSpeed ?? 1;
    this.speedMultiplier = 1;
    this.panel           = null;
  }

  // Called once per frame. Subclasses must call super.update() or handle state themselves.
  update(_dt, _elapsed) {}

  toggle() {
    if (this.state === 'idle' || this.state === 'ramping_down') {
      this.state = 'ramping_up';
    } else if (this.state === 'running' || this.state === 'ramping_up') {
      this.state = 'ramping_down';
    }
  }

  setSpeedMultiplier(x) {
    this.speedMultiplier = Math.max(0.1, Math.min(4, x));
  }

  dispose() {}
}
