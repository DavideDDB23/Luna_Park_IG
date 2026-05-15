import * as THREE from 'three';
import * as PT   from './ProceduralTextures.js';

// Neon GLSL — emissive flicker, driven by DayNight
const NEON_VERT = `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
`;
const NEON_FRAG = `
  uniform vec3  uColor;
  uniform float uTime;
  uniform float uIntensity;
  varying vec2 vUv;
  void main() {
    float flicker = 0.85 + 0.15 * sin(uTime * 5.0 + vUv.x * 6.28318);
    gl_FragColor  = vec4(uColor * uIntensity * flicker, 1.0);
  }
`;

export class MaterialLibrary {
  constructor(renderer) {
    this._cache    = new Map();
    this._emNight  = [];     // { mat, maxI } — emissive materials driven by night amount
    this._neonMats = [];     // all neon ShaderMaterial instances
    this._neonColor = new THREE.Color('#ff44ff');

    this._build(renderer);
  }

  _build(renderer) {
    const maxAniso = renderer.capabilities.getMaxAnisotropy();

    // ── mat.ground.grass ─────────────────────────────────────────────────────
    const gC = PT.grassColor(512), gN = PT.grassNormal(256), gR = PT.grassRoughness(256);
    gC.repeat.set(40, 40); gN.repeat.set(40, 40); gR.repeat.set(40, 40);
    gC.anisotropy = maxAniso;
    const grassMat = new THREE.MeshStandardMaterial({
      map: gC, normalMap: gN, roughnessMap: gR, metalness: 0, roughness: 1.0,
    });
    grassMat.name = 'mat.ground.grass';
    this._cache.set('ground.grass', grassMat);

    // ── mat.ground.asphalt ───────────────────────────────────────────────────
    const aC = PT.asphaltColor(512), aN = PT.asphaltNormal(256), aR = PT.asphaltRoughness(256);
    aC.repeat.set(8, 8); aN.repeat.set(8, 8); aR.repeat.set(8, 8);
    const asphaltMat = new THREE.MeshStandardMaterial({
      map: aC, normalMap: aN, roughnessMap: aR, metalness: 0, roughness: 1.0,
    });
    asphaltMat.name = 'mat.ground.asphalt';
    this._cache.set('ground.asphalt', asphaltMat);

    // ── mat.metal.painted ────────────────────────────────────────────────────
    const mC = PT.metalColor(256), mN = PT.metalNormal(256), mMRA = PT.metalMRA(256);
    const metalMat = new THREE.MeshStandardMaterial({
      map: mC, normalMap: mN,
      roughnessMap: mMRA, metalnessMap: mMRA,
      metalness: 1.0, roughness: 1.0, envMapIntensity: 0.6,
    });
    metalMat.name = 'mat.metal.painted';
    this._cache.set('metal.painted', metalMat);

    // ── mat.wood.varnished ────────────────────────────────────────────────────
    const wC = PT.woodColor(512), wN = PT.woodNormal(256), wR = PT.woodRoughness(256);
    const woodMat = new THREE.MeshStandardMaterial({
      map: wC, normalMap: wN, roughnessMap: wR, metalness: 0.0, roughness: 1.0,
    });
    woodMat.name = 'mat.wood.varnished';
    this._cache.set('wood.varnished', woodMat);

    // ── mat.horse.painted (Blinn–Phong) ──────────────────────────────────────
    const hC = PT.horseColor(256), hN = PT.horseNormal(256), hS = PT.horseSpecular(256);
    const horseMat = new THREE.MeshPhongMaterial({
      map: hC, normalMap: hN, specularMap: hS,
      shininess: 80, specular: new THREE.Color(0xaaaaaa), flatShading: false,
    });
    horseMat.name = 'mat.horse.painted';
    this._cache.set('horse.painted', horseMat);

    // ── mat.fabric.striped ────────────────────────────────────────────────────
    const fC = PT.fabricColor(512), fN = PT.fabricNormal(256), fA = PT.fabricAlpha(512);
    const fabricMat = new THREE.MeshStandardMaterial({
      map: fC, normalMap: fN, alphaMap: fA,
      metalness: 0, roughness: 0.85,
      side: THREE.DoubleSide, transparent: false, alphaTest: 0.5,
    });
    fabricMat.name = 'mat.fabric.striped';
    this._cache.set('fabric.striped', fabricMat);

    // ── mat.neon (ShaderMaterial) ─────────────────────────────────────────────
    this._cache.set('neon', this._newNeon());

    // ── mat.emissive.window ───────────────────────────────────────────────────
    const eC = PT.windowColor(128), eE = PT.windowEmissive(128);
    const windowMat = new THREE.MeshStandardMaterial({
      map: eC, emissiveMap: eE, emissive: new THREE.Color(0xffe2a0),
      emissiveIntensity: 0.0, roughness: 0.9, metalness: 0.0,
    });
    windowMat.name = 'mat.emissive.window';
    this._emNight.push({ mat: windowMat, maxI: 2.0 });
    this._cache.set('emissive.window', windowMat);

    // ── mat.signal.red / .green (MeshBasicMaterial — intentionally unlit) ────
    const signalRed   = new THREE.MeshBasicMaterial({ color: 0xff2a2a });
    const signalGreen = new THREE.MeshBasicMaterial({ color: 0x23d36a });
    signalRed.name   = 'mat.signal.red';
    signalGreen.name = 'mat.signal.green';
    this._cache.set('signal.red',   signalRed);
    this._cache.set('signal.green', signalGreen);

    // ── mat.placeholder.magenta ───────────────────────────────────────────────
    const ph = new THREE.MeshStandardMaterial({ color: 0xff00ff });
    ph.name = 'mat.placeholder.magenta';
    this._cache.set('placeholder', ph);
  }

  _newNeon() {
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uColor:     { value: this._neonColor.clone() },
        uTime:      { value: 0 },
        uIntensity: { value: 0 },
      },
      vertexShader:   NEON_VERT,
      fragmentShader: NEON_FRAG,
      side: THREE.FrontSide,
    });
    mat.name = 'mat.neon';
    this._neonMats.push(mat);
    return mat;
  }

  // Return a fresh neon material instance (same uniforms, separate object)
  freshNeon() {
    return this._newNeon();
  }

  get(key) {
    return this._cache.get(key) ?? this._cache.get('placeholder');
  }

  // Traverse scene and replace materials by mesh name / userData conventions
  applyToScene(scene) {
    scene.traverse(obj => {
      if (!(obj instanceof THREE.Mesh)) return;
      // Explicit key wins
      if (obj.userData.matKey) {
        const m = this._cache.get(obj.userData.matKey);
        if (m) { obj.material = m; return; }
      }

      const n = obj.name.toLowerCase();

      if (n === 'ground') {
        obj.material = this._cache.get('ground.grass');
      } else if (n === 'path_h' || n === 'path_v') {
        obj.material = this._cache.get('ground.asphalt');
      } else if (n === 'canopy') {
        obj.material = this._cache.get('fabric.striped');
      } else if (
        n.startsWith('lamparm') || n.startsWith('lamppole') ||
        n.startsWith('column')  || n.startsWith('strut')    ||
        n.startsWith('spoke')   || n.startsWith('rim_')     ||
        n.startsWith('vpole')   || n === 'hub'              ||
        n.startsWith('tie_')    || n === 'centrepole'       ||
        n.startsWith('rail')    || n.startsWith('support')  ||
        n === 'lever'           || n === 'pedestal'         ||
        n === 'cap'
      ) {
        obj.material = this._cache.get('metal.painted');
      } else if (n === 'base' || n.startsWith('deck') || n.startsWith('floor')) {
        obj.material = this._cache.get('wood.varnished');
      } else if (n.startsWith('horse') || n.startsWith('jockey')) {
        // Group-level, handled via userData on child meshes
      } else if (n.startsWith('neon') || n.startsWith('neonring')) {
        obj.material = this._cache.get('neon');
      }
    });
  }

  // Night amount [0,1] driven by DayNight each frame
  setNightAmount(t) {
    for (const { mat, maxI } of this._emNight) {
      mat.emissiveIntensity = t * maxI;
    }
    for (const mat of this._neonMats) {
      mat.uniforms.uIntensity.value = t * 1.5;
    }
  }

  updateNeonTime(elapsed) {
    for (const mat of this._neonMats) {
      mat.uniforms.uTime.value = elapsed;
    }
  }

  setNeonColor(hex) {
    this._neonColor.set(hex);
    for (const mat of this._neonMats) {
      mat.uniforms.uColor.value.copy(this._neonColor);
    }
  }

  dispose() {
    for (const mat of this._cache.values()) mat.dispose();
  }
}
