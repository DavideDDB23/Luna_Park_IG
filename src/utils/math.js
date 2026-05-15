export const clamp      = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
export const lerp       = (a, b, t)   => a + (b - a) * t;
export const smoothstep = (lo, hi, t) => { const x = clamp((t - lo) / (hi - lo), 0, 1); return x * x * (3 - 2 * x); };
export const easeInOutQuad = t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
export const mod2pi     = v => ((v % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
export const degToRad   = d => d * (Math.PI / 180);
