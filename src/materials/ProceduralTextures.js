import * as THREE from 'three';

// Canvas-based procedural texture generation.
// No image files required — all textures synthesised at boot.

const SRGB = THREE.SRGBColorSpace;
const LIN  = THREE.NoColorSpace;

function _tex(canvas, colorSpace) {
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace  = colorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.minFilter   = THREE.LinearMipmapLinearFilter;
  t.magFilter   = THREE.LinearFilter;
  return t;
}

// Deterministic smooth noise
function _hash(x, y) {
  const v = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return v - Math.floor(v);
}
function _noise(x, y, freq = 1) {
  const sx = x * freq, sy = y * freq;
  const ix = Math.floor(sx), iy = Math.floor(sy);
  const fx = sx - ix, fy = sy - iy;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  const a = _hash(ix, iy), b = _hash(ix + 1, iy);
  const c = _hash(ix, iy + 1), d = _hash(ix + 1, iy + 1);
  return a + (b - a) * ux + (c - a) * uy + (b + c - a - d) * ux * uy;
}

// Build a normal map from a height-field function h(x,y) in [0,1]
function _normalFromHeight(size, hFn, strength = 2.0) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const id  = ctx.createImageData(size, size);
  const px  = id.data;
  const H   = new Float32Array(size * size);
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++)
      H[y * size + x] = hFn(x / size, y / size);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const r = H[y * size + Math.min(x + 1, size - 1)];
      const l = H[y * size + Math.max(x - 1, 0)];
      const u = H[Math.max(y - 1, 0) * size + x];
      const dn = H[Math.min(y + 1, size - 1) * size + x];
      const nx = (l - r) * strength, ny = (u - dn) * strength, nz = 1;
      const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
      const i = (y * size + x) * 4;
      px[i]     = Math.round((nx / len * 0.5 + 0.5) * 255);
      px[i + 1] = Math.round((ny / len * 0.5 + 0.5) * 255);
      px[i + 2] = Math.round((nz / len * 0.5 + 0.5) * 255);
      px[i + 3] = 255;
    }
  }
  ctx.putImageData(id, 0, 0);
  return _tex(c, LIN);
}

// ── Grass ────────────────────────────────────────────────────────────────────

export function grassColor(size = 512) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const id  = ctx.createImageData(size, size);
  const px  = id.data;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const n = _noise(x / size, y / size, 8) * 0.6
              + _noise(x / size, y / size, 24) * 0.4;
      const i = (y * size + x) * 4;
      px[i]     = Math.round((0.15 + n * 0.12) * 255);
      px[i + 1] = Math.round((0.38 + n * 0.22) * 255);
      px[i + 2] = Math.round((0.10 + n * 0.08) * 255);
      px[i + 3] = 255;
    }
  }
  ctx.putImageData(id, 0, 0);
  return _tex(c, SRGB);
}

export function grassNormal(size = 256) {
  return _normalFromHeight(size,
    (x, y) => _noise(x, y, 20) * 0.5 + _noise(x, y, 60) * 0.3,
    3.0,
  );
}

export function grassRoughness(size = 256) {
  // G=roughness, B=metalness
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const id  = ctx.createImageData(size, size);
  const px  = id.data;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const n = _noise(x / size, y / size, 12);
      const i = (y * size + x) * 4;
      px[i]     = 255;
      px[i + 1] = Math.round((0.82 + n * 0.18) * 255); // roughness
      px[i + 2] = 0;
      px[i + 3] = 255;
    }
  }
  ctx.putImageData(id, 0, 0);
  return _tex(c, LIN);
}

// ── Metal ────────────────────────────────────────────────────────────────────

export function metalColor(size = 256) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const id  = ctx.createImageData(size, size);
  const px  = id.data;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const scratch = _noise(x / size * 0.05, y / size, 120) * 0.18;
      const base    = _noise(x / size, y / size, 6) * 0.25;
      const v = 0.42 + base + scratch;
      const i = (y * size + x) * 4;
      px[i]     = Math.round(v * 255);
      px[i + 1] = Math.round(v * 1.05 * 255);
      px[i + 2] = Math.round(v * 1.12 * 255);
      px[i + 3] = 255;
    }
  }
  ctx.putImageData(id, 0, 0);
  return _tex(c, SRGB);
}

export function metalNormal(size = 256) {
  return _normalFromHeight(size,
    (x, y) => _noise(x * 0.04, y, 100) * 0.35 + _noise(x, y, 30) * 0.12,
    2.5,
  );
}

// Packed ORM: R=AO, G=roughness, B=metalness
export function metalMRA(size = 256) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const id  = ctx.createImageData(size, size);
  const px  = id.data;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const n = _noise(x / size, y / size, 16);
      const i = (y * size + x) * 4;
      px[i]     = Math.round((0.72 + n * 0.28) * 255); // AO
      px[i + 1] = Math.round((0.32 + n * 0.22) * 255); // roughness
      px[i + 2] = Math.round((0.85 + n * 0.15) * 255); // metalness
      px[i + 3] = 255;
    }
  }
  ctx.putImageData(id, 0, 0);
  return _tex(c, LIN);
}

// ── Wood ─────────────────────────────────────────────────────────────────────

export function woodColor(size = 512) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const id  = ctx.createImageData(size, size);
  const px  = id.data;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const grain = (Math.sin(x * 0.18 + _noise(x / size, y / size, 5) * 14) * 0.5 + 0.5);
      const noise = _noise(x / size, y / size, 28) * 0.25;
      const v = grain * 0.55 + noise;
      const i = (y * size + x) * 4;
      px[i]     = Math.round((0.40 + v * 0.38) * 255);
      px[i + 1] = Math.round((0.22 + v * 0.22) * 255);
      px[i + 2] = Math.round((0.08 + v * 0.10) * 255);
      px[i + 3] = 255;
    }
  }
  ctx.putImageData(id, 0, 0);
  return _tex(c, SRGB);
}

export function woodNormal(size = 256) {
  return _normalFromHeight(size,
    (x, y) => {
      const grain = (Math.sin(x * 256 * 0.18 + _noise(x, y, 4) * 14) * 0.5 + 0.5);
      return grain;
    },
    1.5,
  );
}

export function woodRoughness(size = 256) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const id  = ctx.createImageData(size, size);
  const px  = id.data;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const n = _noise(x / size, y / size, 18);
      const i = (y * size + x) * 4;
      const rough = Math.round((0.52 + n * 0.28) * 255);
      px[i] = 255; px[i + 1] = rough; px[i + 2] = 0; px[i + 3] = 255;
    }
  }
  ctx.putImageData(id, 0, 0);
  return _tex(c, LIN);
}

// ── Horse (MeshPhongMaterial) ─────────────────────────────────────────────────

export function horseColor(size = 256) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const id  = ctx.createImageData(size, size);
  const px  = id.data;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const n = _noise(x / size, y / size, 10) * 0.12;
      const i = (y * size + x) * 4;
      px[i]     = Math.round(Math.min(1, 0.93 + n) * 255);
      px[i + 1] = Math.round(Math.min(1, 0.88 + n) * 255);
      px[i + 2] = Math.round(Math.min(1, 0.79 + n) * 255);
      px[i + 3] = 255;
    }
  }
  ctx.putImageData(id, 0, 0);
  return _tex(c, SRGB);
}

export function horseNormal(size = 256) {
  return _normalFromHeight(size,
    (x, y) => _noise(x, y, 14) * 0.5 + _noise(x, y, 36) * 0.3,
    1.0,
  );
}

export function horseSpecular(size = 256) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const id  = ctx.createImageData(size, size);
  const px  = id.data;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const n = _noise(x / size, y / size, 8);
      const s = Math.round((0.40 + n * 0.40) * 255);
      const i = (y * size + x) * 4;
      px[i] = s; px[i + 1] = s; px[i + 2] = s; px[i + 3] = 255;
    }
  }
  ctx.putImageData(id, 0, 0);
  return _tex(c, LIN);
}

// ── Fabric / Stripes ──────────────────────────────────────────────────────────

export function fabricColor(size = 512) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const strW = size / 8;
  const colors = ['#cc2222', '#eeeeee', '#cc2222', '#eeeeee', '#2222cc', '#eeeeee', '#2222cc', '#eeeeee'];
  for (let i = 0; i < 8; i++) {
    ctx.fillStyle = colors[i];
    ctx.fillRect(i * strW, 0, strW, size);
  }
  // Slight noise for cloth texture
  const id = ctx.getImageData(0, 0, size, size);
  const px = id.data;
  for (let j = 0; j < size * size; j++) {
    const n = (_hash(j * 0.007, j * 0.013) - 0.5) * 18;
    px[j * 4]     = Math.max(0, Math.min(255, px[j * 4]     + n));
    px[j * 4 + 1] = Math.max(0, Math.min(255, px[j * 4 + 1] + n));
    px[j * 4 + 2] = Math.max(0, Math.min(255, px[j * 4 + 2] + n));
  }
  ctx.putImageData(id, 0, 0);
  return _tex(c, SRGB);
}

export function fabricNormal(size = 256) {
  return _normalFromHeight(size, (x, y) => {
    const wx = Math.sin(x * 256 * 0.4) * 0.35;
    const wy = Math.sin(y * 256 * 0.4) * 0.35;
    return (wx + wy) * 0.5 + 0.5;
  }, 0.9);
}

export function fabricAlpha(size = 512) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);
  // Fringe at bottom
  ctx.fillStyle = '#000000';
  for (let x = 0; x < size; x += 4) {
    const fh = 12 + Math.floor(_hash(x * 0.08, 0.5) * 28);
    ctx.fillRect(x, size - fh, 4, fh);
  }
  return _tex(c, LIN);
}

// ── Asphalt ───────────────────────────────────────────────────────────────────

export function asphaltColor(size = 512) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const id  = ctx.createImageData(size, size);
  const px  = id.data;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const n     = _noise(x / size, y / size, 20) * 0.18;
      const speck = _hash(x * 0.27, y * 0.31) > 0.94 ? 0.12 : 0;
      const v     = Math.round((0.20 + n + speck) * 255);
      const i = (y * size + x) * 4;
      px[i] = v; px[i + 1] = v; px[i + 2] = Math.round(v * 1.06); px[i + 3] = 255;
    }
  }
  ctx.putImageData(id, 0, 0);
  return _tex(c, SRGB);
}

export function asphaltNormal(size = 256) {
  return _normalFromHeight(size,
    (x, y) => _noise(x, y, 40) * 0.65 + _noise(x, y, 12) * 0.3,
    1.8,
  );
}

export function asphaltRoughness(size = 256) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const id  = ctx.createImageData(size, size);
  const px  = id.data;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const n = _noise(x / size, y / size, 22);
      const i = (y * size + x) * 4;
      px[i] = 255; px[i + 1] = Math.round((0.72 + n * 0.24) * 255); px[i + 2] = 0; px[i + 3] = 255;
    }
  }
  ctx.putImageData(id, 0, 0);
  return _tex(c, LIN);
}

// ── Emissive window ───────────────────────────────────────────────────────────

export function windowColor(size = 128) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#111111';
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = '#2a2a2a';
  ctx.fillRect(size / 2 - 2, 0, 4, size);
  ctx.fillRect(0, size / 2 - 2, size, 4);
  return _tex(c, SRGB);
}

export function windowEmissive(size = 128) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, '#ffe8b0');
  g.addColorStop(1, '#bb6820');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = '#000000';
  ctx.fillRect(size / 2 - 2, 0, 4, size);
  ctx.fillRect(0, size / 2 - 2, size, 4);
  return _tex(c, SRGB);
}
