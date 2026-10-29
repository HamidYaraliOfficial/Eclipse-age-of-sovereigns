import './styles.css';
import { createInitialState } from './game/engine.js';
import { World3D } from './render/world3d.js';
import { GameApp } from './ui/app.js';

const canvas = document.getElementById('game-canvas');
let state = createInitialState();
let app = null;
const world = new World3D(canvas, {
  onTileSelected: tile => app?.onTileSelected(tile),
  onZoom: direction => { /* wheel zoom is handled natively by OrbitControls */ },
});
state.selectedTileId = world.getTileForCity('aurelia-city')?.id ?? null;
app = new GameApp(state, world);
window.addEventListener('beforeunload', () => world.destroy(), { once: true });
