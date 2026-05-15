import * as THREE from 'three';

// Custom sky shader: gradient dome + sun/moon disc + procedural stars
const SKY_VERT = /* glsl */`
  varying vec3 vWorldDir;
  void main() {
    vec4 wp    = modelMatrix * vec4(position, 1.0);
    vWorldDir  = normalize(wp.xyz);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const SKY_FRAG = /* glsl */`
  uniform vec3  uSkyColor;
  uniform vec3  uHorizonColor;
  uniform float uNight;
  uniform vec3  uSunDir;

  varying vec3 vWorldDir;

  // Deterministic star field
  float hash3(vec3 p) {
    p = fract(p * vec3(443.8975, 397.2973, 491.1871));
    p += dot(p, p.yxz + 19.19);
    return fract((p.x + p.y) * p.z);
  }
  float stars(vec3 dir) {
    vec3 cell = floor(dir * 180.0);
    float h   = hash3(cell);
    float size = step(0.984, h);
    return size * smoothstep(0.02, 0.0, dir.y - 0.02);
  }

  void main() {
    vec3 dir = normalize(vWorldDir);
    float y  = dir.y;

    // ── Day sky ─────────────────────────────────────────────────────────────
    vec3 daySky = mix(uHorizonColor, uSkyColor, smoothstep(-0.05, 0.5, y));
    // Dusk/dawn tint near horizon
    float horizAmt = smoothstep(0.25, 0.0, abs(y));
    daySky = mix(daySky, vec3(1.0, 0.65, 0.3), horizAmt * (1.0 - uNight) * 0.5);

    // Sun disc + corona
    vec3  sdir    = normalize(uSunDir);
    float sunDot  = dot(dir, sdir);
    float disc    = smoothstep(0.9993, 0.9998, sunDot);
    float corona  = smoothstep(0.990,  0.9993, sunDot) * 0.25;
    daySky = mix(daySky, vec3(1.0, 0.97, 0.87), disc);
    daySky += vec3(1.0, 0.8, 0.45) * corona * (1.0 - uNight);

    // Below horizon: fade to warm ground haze
    daySky = mix(daySky, vec3(0.6, 0.5, 0.38), max(-y, 0.0) * 0.55);

    // ── Night sky ────────────────────────────────────────────────────────────
    vec3 nightSky = mix(vec3(0.04, 0.045, 0.10), vec3(0.01, 0.012, 0.04), smoothstep(-0.1, 0.6, y));
    nightSky += vec3(stars(dir) * 0.85 * smoothstep(0.3, 0.6, uNight));
    // Milky-way-like faint band
    float band = smoothstep(0.3, 0.0, abs(dot(dir, vec3(0.5, 0.2, 0.84)) - 0.0)) * 0.06;
    nightSky += vec3(0.5, 0.6, 1.0) * band * max(y, 0.0);

    // Moon (opposite sun)
    float moonDot = dot(dir, -sdir);
    nightSky += vec3(0.88, 0.92, 1.0) * smoothstep(0.9993, 0.9998, moonDot) * 0.55;
    nightSky += vec3(0.70, 0.75, 0.90) * smoothstep(0.994,  0.9993, moonDot) * 0.12;

    // ── Blend ────────────────────────────────────────────────────────────────
    vec3 sky = mix(daySky, nightSky, smoothstep(0.0, 1.0, uNight));
    gl_FragColor = vec4(sky, 1.0);
  }
`;

export class Skybox {
  constructor(scene) {
    this._scene = scene;

    this._u = {
      uSkyColor:     { value: new THREE.Color('#bcdfff') },
      uHorizonColor: { value: new THREE.Color('#d4eeff') },
      uNight:        { value: 0.0 },
      uSunDir:       { value: new THREE.Vector3(0, 1, 0) },
    };

    const mat  = new THREE.ShaderMaterial({
      uniforms:       this._u,
      vertexShader:   SKY_VERT,
      fragmentShader: SKY_FRAG,
      side:           THREE.BackSide,
      depthWrite:     false,
      fog:            false,
    });

    const dome = new THREE.Mesh(new THREE.SphereGeometry(490, 32, 16), mat);
    dome.name = 'skyDome';
    dome.renderOrder = -1;
    scene.add(dome);

    scene.background = null;
    scene.fog        = new THREE.Fog(new THREE.Color('#bcdfff'), 60, 220);
  }

  // Called by DayNight each frame
  setNightBlend(blend, skyColor, sunDir) {
    this._u.uNight.value = blend;
    if (sunDir)    this._u.uSunDir.value.copy(sunDir);
    if (skyColor) {
      this._u.uSkyColor.value.copy(skyColor);
      // Horizon lighter / warmer than zenith
      this._u.uHorizonColor.value.setRGB(
        Math.min(skyColor.r * 1.25, 1),
        Math.min(skyColor.g * 1.15, 1),
        Math.min(skyColor.b * 1.08, 1),
      );
      this._scene.fog.color.copy(skyColor);
    }
  }
}
