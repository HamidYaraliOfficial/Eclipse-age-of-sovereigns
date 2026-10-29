# Development notes

This repository currently uses a small modular architecture:

- `src/data/gameData.js`: localization, scenario content, resources, buildings, technologies and events.
- `src/game/engine.js`: pure game-state operations and save validation.
- `src/render/world3d.js`: Three.js world map, city props and tactical battle scene.
- `src/ui/app.js`: user interface and input orchestration.
- `src/main.js`: application bootstrap.

Before submitting changes, run `npm test` and `npm run build`. Keep the game state serializable, validate imported data, localize visible user-facing text in English/Persian/Chinese, and avoid adding UI controls that do not trigger real behavior.

The proprietary license remains in effect. Opening a pull request or contributing code does not by itself grant permission to use or redistribute this project outside the license terms.
