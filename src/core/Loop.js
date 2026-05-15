export class Loop {
  constructor(updateFn) {
    this._update = updateFn;
    this._rafId  = null;
    this._bound  = this._tick.bind(this);
  }

  start() {
    if (this._rafId !== null) return;
    this._rafId = requestAnimationFrame(this._bound);
  }

  stop() {
    if (this._rafId !== null) cancelAnimationFrame(this._rafId);
    this._rafId = null;
  }

  _tick(timestamp) {
    this._rafId = requestAnimationFrame(this._bound);
    this._update(timestamp);
  }
}
