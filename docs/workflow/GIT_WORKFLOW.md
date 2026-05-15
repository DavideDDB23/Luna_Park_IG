# GIT WORKFLOW

> Companion to: [DEVELOPMENT_ROADMAP](../core/DEVELOPMENT_ROADMAP.md) · [MILESTONES](../core/MILESTONES.md) · [TESTING_STRATEGY](TESTING_STRATEGY.md)

## 1. Hosting

- Repo: **GitHub Classroom** template from `https://classroom.github.com/a/FF_gLfB-` (per `Project_Requirements.pdf` page 7). All team members are added as collaborators when the team joins.
- Deployment: **GitHub Pages** from the `main` branch root (no Actions required for a static site with vendored libraries).
- Issue tracker: GitHub Issues, lightweight; the canonical task list lives in [TASK_TRACKER](../core/TASK_TRACKER.md).

## 2. Repository Hygiene

- `vendor/` is committed (the requirements page 7 says "ALL the source code including the used libraries").
- `assets/` is committed.
- `node_modules/` is gitignored (we don't even install).
- `report/build/` is gitignored if we use a LaTeX build step.
- `.nojekyll` is present (without it, files starting with `_` are skipped by Pages).
- `.gitignore` includes `*.DS_Store`, `*.log`, `*.tmp`, `*.swp`, `Thumbs.db`.

## 3. Branching Strategy

Lightweight Git-flow variant:

```
main
 ├── milestone/m1
 ├── milestone/m2
 ├── feature/ferris-counter-rotation
 ├── feature/day-night-cycle
 ├── feature/coaster-frenet
 ├── fix/shadow-acne
 └── docs/update-rendering-pipeline
```

- `main` is **always deployable**. Pages serves `main`.
- `milestone/m*` branches are short-lived integration branches. They merge into `main` when the milestone passes its acceptance checklist.
- `feature/*` branches branch from the current `milestone/*`, merge back into it.
- `fix/*` branches branch from where the bug is and merge wherever appropriate.
- `docs/*` branches are doc-only changes — merged directly into `main`.

Branch names use `kebab-case`.

## 4. Commit Conventions

Conventional-commits, with a tighter scope set:

```
<type>(<scope>): <imperative subject ≤ 60 chars>

<optional body explaining why, wrapped at 72>

[Refs: T-NNN, M-N]
```

Types: `feat`, `fix`, `refactor`, `perf`, `style`, `docs`, `test`, `chore`, `build`.
Scopes: `core`, `scene`, `rides`, `lighting`, `material`, `shader`, `camera`, `input`, `hud`, `assets`, `post`, `docs`, `perf`, `ci`.

Examples:
- `feat(rides): add carousel phase-offset bob driver`
- `fix(lighting): tune shadow bias to -0.0005 to remove acne`
- `perf(scene): instance lampposts into single InstancedMesh`
- `docs(rendering): add bloom budget table`

## 5. Pull-Request Template

`.github/PULL_REQUEST_TEMPLATE.md`:

```
## Summary
A 1-2 sentence description of what this PR does.

## Linked tasks
- T-NNN
- M-N if applicable

## Screenshots / video
(Drop in before/after if visual.)

## Checklist
- [ ] No imported animation tracks added (verified via tools/audit-glb.js)
- [ ] No console.log left in src/ outside debug/
- [ ] Internal doc links checked
- [ ] Perf impact: same / better / worse (explain)
- [ ] Tested on Chrome, Firefox, Safari (note any differences)
```

## 6. Commit Cadence

- **Atomic** — one logical change per commit. Reviewable in 60 s.
- **Small** — < 200 lines diff is the soft target.
- **Frequent** — push at least daily; never go a week without a push.
- **Annotated** — every commit message tells the next developer why the change exists. The "what" is in the diff.

## 7. Tag Strategy

- Each milestone gets a `m1`..`m7` lightweight tag at sign-off.
- Final release: `v1.0.0` annotated tag with release notes including the demo video URL.
- Tagging is the **only** way the demo URL becomes "official". GitHub Pages auto-serves from `main`, but the team writes "tagged at v1.0.0" in the report and the submission email.

## 8. GitHub Pages Setup

Settings → Pages:
- **Source**: Deploy from a branch
- **Branch**: `main` / `(root)`
- **Custom domain**: none
- **Enforce HTTPS**: ON

URL pattern: `https://<student>.github.io/<repo-name>/` — added to the README top banner once it works.

Pages serves static files only; the project is configured to require zero build (ES module imports via import map). This satisfies the requirement that the project is "executable on GitHub" (page 7 of the requirements deck).

## 9. CI-Equivalent Manual Steps

We don't run GitHub Actions (overhead not justified for a static site), but every merge to `main` is gated by a **5-minute manual check**:

1. open the Pages URL in a clean Chrome window
2. confirm the scene loads in ≤ 5 s
3. confirm no console errors
4. confirm the marquee interaction for that milestone works
5. take a screenshot, commit to `screenshots/` if it documents the milestone

A `scripts/check-links.sh` script verifies that every `.md` internal link resolves. Run before merging doc-only PRs.

## 10. The "No Imported Animations" Audit

This is the single most important rule of the project (`Project_Requirements.pdf` page 3). The `tools/audit-glb.js` script:

```
For each .glb under assets/models/:
  parse with parser-glb library (or three.js GLTFLoader)
  assert glb.animations.length === 0
  log green; or red + exit code 1
```

Run before every commit that touches `assets/models/`. A failed audit blocks the commit (it's a one-line shell wrapper). The audit is **the** safeguard against an accidental Mixamo import.

## 11. Release Checklist (for `v1.0.0`)

Following the [MILESTONES](../core/MILESTONES.md) M7 checklist:

- [ ] all TODO comments resolved or migrated to GitHub issues
- [ ] all internal doc links verified
- [ ] `CREDITS.md` complete and accurate
- [ ] final report PDF in `report/report.pdf`
- [ ] slide deck in `report/slides.pdf` and `.pptx`
- [ ] demo video in `report/demo.mp4`
- [ ] README banner image + GIF in `assets/banner/`
- [ ] Pages URL pinned in README
- [ ] git tag `v1.0.0` applied to the commit Pages serves
- [ ] submission email to `marco.schaerf@uniroma1.it` confirmed
- [ ] Infostud registration confirmed

## 12. Team Roles (if > 1 person)

| Role | Owns |
| --- | --- |
| **Tech lead** | Architecture, integration, perf budget |
| **Rendering eng** | Materials, shaders, lighting, post |
| **Gameplay / interaction eng** | Rides, input, camera modes, HUD |
| **Art / pipeline eng** | Asset acquisition, Blender authoring, texture packing |

For a one-person team, all roles are the same person and the parallelization is in time-of-day blocks (rendering in the morning when fresh; assets in the afternoon).

## 13. Backup

A **mirror push** to a private personal repo runs nightly via a single `git push backup main --force-with-lease` command. The team will not lose more than 24 hours of work if GitHub goes down.

## 14. Pre-Submission Email Template

(Drafted in [PRESENTATION_STRATEGY](../evaluation/PRESENTATION_STRATEGY.md) §10.)
