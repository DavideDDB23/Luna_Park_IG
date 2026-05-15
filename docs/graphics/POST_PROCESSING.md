# POST PROCESSING

> Companion to: [RENDERING_PIPELINE](RENDERING_PIPELINE.md) · [LIGHTING_STRATEGY](LIGHTING_STRATEGY.md) · [PERFORMANCE_OPTIMIZATION](PERFORMANCE_OPTIMIZATION.md)

Post-processing in Luna Park 3D is small in count but high in impact: bloom on the neon (the night money-shot), ACES tone mapping to handle the dynamic range of the sun, and optional FXAA. Vignette is added subtly in the OutputPass.

## 1. Composer Chain

```
EffectComposer
   │
   ▼
RenderPass(scene, camera)            // forward render, HDR float target
   │
   ▼
UnrealBloomPass                       // additive bloom on bright pixels
   │
   ▼  (optional, only when MSAA is disabled by composer)
FXAA shader pass                      // edge anti-alias
   │
   ▼
OutputPass                            // ACES tone-map + sRGB encode + vignette
   │
   ▼
gl.canvas
```

## 2. RenderPass

- Renders the entire scene to an HDR target (`RGBA16F`).
- No tonemap inside the pass — the composer expects linear HDR.
- The renderer's own `toneMapping` is set to `NoToneMapping` when the composer is active, because the OutputPass handles it.

## 3. UnrealBloomPass

Configuration:
```
strength  = 0.6      // global bloom strength
radius    = 0.4      // glow spread
threshold = 0.85     // luminance threshold above which a pixel contributes
resolution: half of screen
```

The pass performs:
1. **Bright-pass**: extract pixels with luma > threshold to a bright buffer.
2. **5-level mip pyramid**: downsample the bright buffer 5 times; apply Gaussian blur at each level.
3. **Composite**: additively sum the blurred mips back onto the original color buffer.

Lecture-03 hook: this is **additive blending** in action. The report calls it out: "UnrealBloomPass implements an additive blend (Lecture 03) of a multi-resolution bright-pass against the lit scene."

### 3.1 Day vs night strategy

Bloom is **always on** when the composer runs, but the threshold (0.85) ensures bloom contributes ~zero during the day, when emissive intensities are 0 and no pixels go above 0.85. At night, ride neon, stage spot highlights, and emissive-window pixels glow.

### 3.2 Mobile fallback

On `?fast` / `?mobile`, the composer is bypassed and we render directly with the renderer's own ACES tonemap. Bloom is dropped, saving ~2.5 ms of frame time at the cost of less spectacular night scenes.

## 4. FXAA (optional)

Used only when the HDR pipeline disables MSAA. FXAA edge-pass:
- 1 ms cost
- handles geometric aliasing acceptably for a moving scene
- noticeably worse than MSAA on still images, hence we re-enable MSAA when capturing screenshots via `?aa=ssaa`

## 5. OutputPass

The OutputPass does three things in one fragment shader:
1. **ACES tonemap**: maps HDR linear → display-referred. Exposure = 1.0 baseline; HUD slider can drag exposure ±0.5 (debug only).
2. **sRGB encode**: gamma encoding (Lecture 03).
3. **Vignette**: subtle darkening at corners — `vignette = 1.0 - smoothstep(0.5, 1.0, distance(uv, 0.5))` multiplied at 0.85 strength. Adds cinematic feel; disabled on `?fast`.

## 6. Day/Night Environment Switching

The bloom + tonemap chain interacts with the day/night cycle in two ways:

1. As `nightAmount → 1`, `DayNight` re-binds `scene.environment` to the **night PMREM**. This is a discrete swap (Three.js doesn't natively crossfade PMREMs). To hide the swap, we tie the swap to the moment of lowest sun (`timeOfDay = 0.0`) where the visual contribution of the env map is at its minimum.
2. Bloom thresholds remain constant; the visual difference comes from emissive intensities ramping up and from sun intensity ramping down (so the only bright thing left at night IS the emissive set).

If a Phase-5 visual review reveals a noticeable env-map snap, we will implement a **dual-environment custom shader** in `MeshStandardMaterial.onBeforeCompile` to crossfade two env maps. This is a stretch fix listed in [RISK_ANALYSIS](../workflow/RISK_ANALYSIS.md).

## 7. Color Pipeline Audit

| Stage | Color space | Format |
| --- | --- | --- |
| Texture (albedo) | sRGB on disk → linear on read | sRGB texture |
| Texture (data: normal/roughness/etc.) | data | linear texture |
| Lighting math | linear | RGBA16F |
| Bloom intermediate | linear | RGBA16F |
| OutputPass input | linear | RGBA16F |
| OutputPass output | sRGB encoded | RGBA8 to canvas |

Mismatches in this chain are the #1 cause of "scene looks wrong" bugs — we explicitly audit it during M5 and the final QA.

## 8. Stretch: Other Passes (NOT shipped by default)

- **Depth-of-field**: not used (steals frame time, hurts the demo's at-a-glance clarity).
- **SSAO**: not used (PBR + hemisphere ambient already gives reasonable contact darkening).
- **Color grading LUT**: nice but adds another texture to manage; deferred.
- **Motion blur**: would clash with the at-a-glance feel; not used.

## 9. Lecture Anchors

- **Lecture 03** (alpha blending): "Bloom is additive blend — Lecture 03 named blend modes."
- **Lecture 03** (gamma correction): "OutputPass encodes from linear to sRGB; Lecture 03's gamma=2.2 transfer function lives in this pass."
- **Lecture 14** (sampling/AA): "We rely on browser MSAA when the composer is bypassed; FXAA is the post-pipeline fallback."
- **Lecture 17**: "Bloom is conceptually a low-pass spatial filter; the multi-mip Gaussian approximates the blur — discussed in the report as a non-Monte-Carlo prefilter approach."

## 10. Performance Notes

- Bloom = ~2.5 ms (half-res target).
- ACES + sRGB encode + vignette = 0.3 ms (cheap fullscreen shader).
- FXAA = ~1.0 ms when active.
- **Total post budget**: ~2.5–4 ms, well within the [RENDERING_PIPELINE](RENDERING_PIPELINE.md) §13 budget.
- The budget breaks first on integrated mobile GPUs, hence the `?fast` and `?mobile` fallbacks.
