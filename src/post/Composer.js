// Placeholder — EffectComposer pipeline wired in M6.
export class Composer {
  constructor(_renderer, _scene, _camera) {
    this._renderer = _renderer;
    this._scene    = _scene;
    this._camera   = _camera;
  }

  setSize(w, h) { this._renderer.setSize(w, h); }

  render() {
    this._renderer.render(this._scene, this._camera);
  }
}
