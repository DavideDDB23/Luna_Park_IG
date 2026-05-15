# TESTING STRATEGY

> Companion to: [DEBUG_WORKFLOW](DEBUG_WORKFLOW.md) · [MILESTONES](../core/MILESTONES.md) · [PERFORMANCE_OPTIMIZATION](../graphics/PERFORMANCE_OPTIMIZATION.md)

## 1. Philosophy

This is an interactive graphics project, not a backend. **Unit tests have low ROI** — the value lives in the visual output and the end-to-end interaction. Our testing strategy is therefore mostly **manual, structured, and reproducible**, with two targeted pieces of automation:

1. asset-audit script (no imported animations, etc.)
2. perf-snapshot script

Everything else is manual checklists + screenshot regression.

## 2. Test Pyramid (project-specific)

```
                ┌──────────────┐
                │  Manual E2E  │   ← the live demo, run per milestone
                │ (1×/milestone)│
                └──────┬───────┘
            ┌──────────┴──────────┐
            │  Visual Regression  │   ← screenshot diffs at known params
            │  (~10 anchor shots) │
            └──────────┬──────────┘
        ┌──────────────┴──────────────┐
        │  Asset audits + perf scripts│   ← automated, deterministic
        │  (run before every PR)      │
        └──────────────┬──────────────┘
   (no unit tests)
```

## 3. Asset Audits (automated)

`tools/audit-all.sh` runs three audits:

1. **GLB animation check**: every `.glb` under `assets/models/` has `animations.length === 0`. **A failure here blocks the commit.**
2. **Triangle count check**: every `.glb` triangle count ≤ its `MODEL_LIST.md` budget +10 %.
3. **Texture format check**: every texture file matches the format declared in `TEXTURE_LIST.md`.

The script is invoked in the PR checklist; we don't run GitHub Actions but the checklist captures it.

## 4. Visual Regression Anchors

Ten "anchor shots" of the scene at predetermined URL params:

| ID | URL | What it confirms |
| --- | --- | --- |
| V1 | `?time=0.5&ride=overview` | day overview lighting + ride positions |
| V2 | `?time=0.27&ride=ferris` | sunrise lighting + ride starting |
| V3 | `?time=0.0&ride=ferris` | midnight + lampposts on + neon glow |
| V4 | `?time=0.5&ride=carousel` | carousel hue + canopy reads |
| V5 | `?time=0.0&ride=coaster` | coaster cart at known `u` on the curve |
| V6 | `?time=0.0&ride=tagada` | tagada arm at known `t` |
| V7 | `?time=0.5&debug=1&wire=1` | wireframe for the report |
| V8 | `?time=0.0&debug=1&gridhelper=1` | grid + axes helpers visible |
| V9 | `?time=0.5&aa=ssaa` | high-res screenshot for marketing |
| V10 | `?time=0.75&demo=1` | mid-demo cinematic shot |

Each anchor is captured at:
- M3 (where applicable)
- M5 (post-materials)
- M7 (final)

The three versions are committed to `screenshots/anchors/V1_m3.png`, `V1_m5.png`, `V1_m7.png`. The team eyeballs the diffs at every milestone gate.

This is **not** automated pixel-diffing — those tend to over-flag and add noise. The eyeball check is sufficient at this scale.

## 5. Performance Snapshots

`tools/perf-snapshot.js`:
- opens the page with `puppeteer` (local dev only) at 1080p
- waits 5 s
- captures `renderer.info` + average frame time over the next 10 s
- writes to `perf/snapshot_<date>_<commit>.json`

The script runs at milestone gates. The committed JSON files form a perf history; the report includes a chart of frame time across milestones.

Manual perf checks (laptop A, laptop B, phone) are recorded in `perf/manual_log.md`.

## 6. Manual QA Matrix

Run before each milestone sign-off:

| Test | M2 | M3 | M4 | M5 | M6 | M7 |
| --- | --- | --- | --- | --- | --- | --- |
| Loads on Chrome desktop | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Loads on Firefox desktop | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Loads on Safari desktop | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Loads on Chrome mobile (Android) | — | — | — | ✓ | ✓ | ✓ |
| Loads on Safari mobile (iOS) | — | — | — | ✓ | ✓ | ✓ |
| 60 fps median, baseline laptop | (no rides) ✓ | (1 ride) ✓ | ✓ | ✓ | ✓ | ✓ |
| 30 fps median, mid Android | — | — | — | ✓ | ✓ | ✓ |
| FPV gondola works | — | — | ✓ | ✓ | ✓ | ✓ |
| Day/night transition smooth | — | — | — | ✓ | ✓ | ✓ |
| No console errors | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| HUD widgets functional | — | — | ✓ | ✓ | ✓ | ✓ |
| Stress-clicking does not break | — | ✓ | ✓ | ✓ | ✓ | ✓ |
| Pages URL matches `main` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

## 7. The Demo Stress Test

At M4 and M6, run a **5-minute stress session**:
- click every panel rapidly for 30 s
- scroll-wheel mash on every ride
- spam time-of-day slider through full range repeatedly
- enter/exit FPV gondola 10 times
- toggle every lamp on/off

Result: no NaN positions, no console errors, fps stays ≥ 30. Recorded as a `videos/stress_m4.mp4` clip.

## 8. Cross-Browser Quirks Log

Maintain `report/log/browsers.md`:

```
- Safari 17.3: PCFSoftShadowMap softer than Chrome
- iOS Safari 16.6: PMREM env map seam visible at midnight
- Firefox 122 mobile: WebGL2 extension X not advertised → fallback path tested
```

## 9. Accessibility Smoke Test

(See [UI_UX_PLAN](../interaction/UI_UX_PLAN.md) §7.)

- keyboard-only navigation through HUD: tab cycles widgets, Enter activates
- screen-reader spot check (VoiceOver on macOS): HUD labels are read
- color-contrast spot check on HUD: AA-passing

## 10. Pre-Submission Final QA (M7)

A one-hour pass:

1. Open the live Pages URL on a fresh browser.
2. Run the [DEMO_SCRIPT](../deliverables/DEMO_SCRIPT.md) end-to-end. Time it: must finish in ≤ 90 s.
3. Open the report PDF. Skim for typos. Confirm every figure renders.
4. Open the slide deck. Confirm builds and animations.
5. Open the demo video. Confirm it plays in browsers and as a download.
6. `git log --oneline | tail -50` — confirm the commit history reads like a story, not a dump.
7. Hit refresh five times in 30 s. Confirm the scene is consistent.
8. Open DevTools network tab. Confirm total page weight ≤ 30 MB.

If all 8 pass, the project is ship-ready.

## 11. Bug-Severity Conventions

| Severity | Definition | Example | Response |
| --- | --- | --- | --- |
| Sev 1 | demo-blocking | scene won't load on Chrome | drop everything, fix |
| Sev 2 | spoils demo's wow | bloom not visible at night | next coding session |
| Sev 3 | annoying but live-able | HUD slider thumb misaligned 2 px | next sprint |
| Sev 4 | cosmetic, low-visibility | tooltip typo | when convenient |

## 12. Test Discipline

- No PR merges into `main` without the relevant row of the manual QA matrix passing for the milestone.
- Anchor shots are captured before each milestone tag.
- Perf snapshots are captured at every M3+, archived under `perf/`.
- The bug diary (DEBUG_WORKFLOW §11) is updated as bugs are fixed.
