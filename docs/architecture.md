# Architecture

```mermaid
flowchart TD
  index[index.html + import map] --> main
  vendor[(vendor/three + addons)] --> renderer
  vendor --> previewScene

  main[main.js<br/>loop + state machine] -->|play| world
  main --> player
  main --> input
  main --> renderer
  main -->|inventory open| inventory

  input -->|keys / mouse| player
  input -->|I / Tab / Esc| main
  world[world.js<br/>city, colliders, pickups] -->|colliders| player
  player[player.js<br/>avatar + slots] -->|E near pickup| items
  items[items.js<br/>defs + mesh builders] --> inventory
  inventory[inventory.js<br/>state + DOM UI] -->|selected item| previewScene
  inventory -->|equip / unequip| player
  previewScene[previewScene.js<br/>avatar clone + pedestal] --> renderer
  renderer[renderer.js<br/>low-res + post FX] --> canvas((canvas))
```

Modules not yet implemented are marked in the milestone history; the diagram shows the target design.

## Security model
- Static site: no backend, no accounts, no user-supplied content, no runtime network requests.
- The only third-party code is the vendored, pinned three.js in `vendor/`, with SHA-256 hashes in `vendor/README.md`.
- No npm, bundler or CI workflow, so there is no install-time or build-time code execution.
