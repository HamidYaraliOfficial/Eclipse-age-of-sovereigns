# ECLIPSE — Gameplay Architecture and Roadmap

## Design pillars

1. **Legible strategy:** the player should understand why a choice changes the state of the realm.
2. **Connected systems:** economy, stability, research, diplomacy and combat should influence one another.
3. **Readable 3D map:** territory, cities, units and selections must remain easy to read at strategy scale.
4. **Emergent stories:** event chains should arise from the evolving state instead of unrelated random popups.
5. **Save-safe development:** game state stays serializable and new save formats should be versioned.

## Current playable loop

Select a territory → inspect its controller and city → construct a building or initiate diplomacy/research → end turn → react to events → recruit troops → open a tactical battle → return to the strategic map.

## System status

| System | Current status | Notes |
| --- | --- | --- |
| 3D strategic map | Implemented | Procedurally laid out hex tiles, four nations, nine cities, camera orbit and zoom |
| Economy | Implemented foundation | Treasury, food, energy, science, stability, influence, upkeep and structure production |
| Construction | Implemented foundation | Six buildings, affordability and per-city limit |
| Research | Implemented foundation | Starter catalogue with costs, prerequisites and effect application |
| Diplomacy | Implemented foundation | Envoy, trade pact, alliance and relation score |
| Military recruitment | Implemented foundation | Infantry strength, morale and costs |
| Tactical battle | Implemented foundation | 3D scene plus command-based combat outcome simulation |
| Events and chronicle | Implemented foundation | Event cooldowns, resource effects and turn history |
| Save/load | Implemented | Browser storage, JSON import/export and schema checks |
| Localization | Implemented | English, Persian and Simplified Chinese; Persian RTL |
| Campaign narrative | Roadmap | Mission scripting and branching story events |
| Expanded world | Roadmap | Target: 40+ nations and 150+ cities |
| Expanded technologies | Roadmap | Target: 200 curated nodes across research branches |
| Detailed logistics/politics/espionage | Roadmap | Deeper supply networks, factions, counterintelligence and consequences |
| Multiplayer | Roadmap | Authority model, replication, networking and synchronized saves |
| Native packaged build | Roadmap | The current deliverable is a browser game, not a desktop installer |

## Suggested development sequence

### Milestone 1 — Stabilize the playable foundation

- Run `npm test` and `npm run build` in CI.
- Playtest resource balance over at least 30 turns.
- Add browser smoke tests for language switching, construction, import/export and tactical battle completion.
- Add a proper game-over/restart flow for all victory conditions.

### Milestone 2 — Strategic world depth

- Expand to provinces, 40+ nations and 150+ named city sites.
- Add trade route visualization, border overlays and territory acquisition.
- Add structured nation AI with personality, goals, threat evaluation and decision logs.

### Milestone 3 — Simulation depth

- Add prices and quantities for more resources, import/export limits and inflation.
- Build a 200-node technology graph with visible prerequisites and cross-branch choices.
- Add population groups, government factions, policy sliders and stability events.
- Add logistics routes, supply depots, fuel/ammunition and terrain/weather modifiers.

### Milestone 4 — Tactical depth

- Give battle units independent positions, movement rules, line-of-sight, formation and terrain cover.
- Replace command-only casualty estimates with unit-to-unit simulation.
- Add commanders, veterancy, battlefield objectives and post-battle territorial consequences.

### Milestone 5 — Content and polish

- Add authored campaigns, mission objectives, sound, music, accessibility settings and localization review.
- Profile on representative computers; optimize draw calls and rebuild cadence.
- Package a stable release and verify save migrations.

## Architecture principles

- `game/engine.js` is the source of truth for game-state transitions.
- `render/world3d.js` visualizes the state and sends selections back to the UI.
- `ui/app.js` dispatches player actions and renders localized interface state.
- `data/gameData.js` stores content and translations separately from simulation code.
- Tests should focus on deterministic state transitions; random combat should be made seedable before building replay functionality.
