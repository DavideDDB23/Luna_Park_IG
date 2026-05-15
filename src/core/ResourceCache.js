// Deduplicates textures / materials / geometries by key.
export class ResourceCache {
  constructor() { this._store = new Map(); }

  get(key)        { return this._store.get(key) ?? null; }
  set(key, value) { this._store.set(key, value); return value; }
  has(key)        { return this._store.has(key); }

  getOrCreate(key, factory) {
    if (!this._store.has(key)) this._store.set(key, factory());
    return this._store.get(key);
  }

  dispose() {
    this._store.forEach(v => v?.dispose?.());
    this._store.clear();
  }
}
