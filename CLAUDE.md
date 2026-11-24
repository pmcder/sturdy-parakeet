# Cyberpunk Explorer

Lo-fi cyberpunk world-explore game built with Three.js. Zero-build: vanilla ES modules, no npm, no bundler. Deployed to GitHub Pages straight from `main`.

## Run locally
`python3 -m http.server` in the repo root, then open http://localhost:8000 (ES modules need http, not `file://`).

## Git workflow
- Never commit directly to `main`. Before any change, branch off `main`: `feat/<slug>`, `fix/<slug>`, `chore/<slug>` or `docs/<slug>`.
- Make atomic commits: one logical change per commit, each one leaves the game runnable. Don't mix refactors with features or lump unrelated files together.
- Commit as you go; don't batch a feature into one commit.
- Messages: imperative mood, subject about 50 chars, Conventional Commit prefix (`feat:`, `fix:`, `chore:`, `docs:`), body explains why when not obvious.
- Merge to `main` via pull request only. Never force-push `main`.

## Dependency policy
- No npm, no bundler, no CDN script tags, no runtime network requests.
- Three.js and its addons are vendored under `vendor/three/` from one pinned release. Adding or upgrading a vendored file is its own commit and must update the version, source URL and SHA-256 in `vendor/README.md`.

## Code conventions
- Modules live in `src/` (see `docs/architecture.md`). Keep game logic free of DOM access outside `inventory.js` and the HUD.
- Use relative paths everywhere so the site works under a Pages subpath.
- Update `docs/architecture.md` in the same commit as any change that alters module relationships.

## Verify before committing
Serve locally, load the page, and confirm the browser console is clean and there are no external network requests.
