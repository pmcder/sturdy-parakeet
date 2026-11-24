# Cyberpunk Explorer

A tiny lo-fi cyberpunk world to wander around, built with [Three.js](https://threejs.org). Walk a rain-soaked neon plaza, pick up gear, and try it on your avatar in the inventory screen.

**Play:** _add the GitHub Pages URL here once enabled_

<!-- Add a screenshot or GIF here: docs/screenshot.png -->

## Controls
| Key | Action |
| --- | --- |
| `W` `A` `S` `D` | Move |
| Mouse (click the game to capture) / `←` `→` | Look |
| `E` | Pick up nearby item |
| `I` or `Tab` | Toggle inventory |
| `Esc` | Close inventory |

In the inventory, click an item to see your avatar try it on (a sword appears in its hand), then press **Equip** to wear it in the world.

## Run locally
There is no build step and no npm. From the repo root:

```sh
python3 -m http.server
```

Then open http://localhost:8000. (ES modules need http, not `file://`.)

## Deploy to GitHub Pages
Settings → Pages → Build and deployment → "Deploy from a branch" → `main` / `/ (root)`. All paths are relative, so it works under the `/<repo>/` subpath.

## Project layout
See [docs/architecture.md](docs/architecture.md) for the module diagram and security model. Source is in `src/`; the pinned three.js copy is in `vendor/`.

## Credits and licenses
- [three.js](https://github.com/mrdoob/three.js) r187 (MIT), vendored unmodified in `vendor/three/` with its license and file hashes in [vendor/README.md](vendor/README.md).
- Project license: see [LICENSE](LICENSE).

## Contributing
Open an issue first for anything sizeable. Changes go through pull requests from a feature branch with small, atomic commits; see [CLAUDE.md](CLAUDE.md) for the workflow and dependency policy (no npm, no CDN, vendored deps only).
