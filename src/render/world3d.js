import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CITIES, NATIONS, STRUCTURES } from '../data/gameData.js';

const COLS = 24;
const ROWS = 18;
const nationHexColors = Object.fromEntries(NATIONS.map(n => [n.id, n.color]));
const terrainPalette = {
  grass: '#416d63', forest: '#315a52', highland: '#6a7d76', desert: '#9a8059', tundra: '#849aa0',
};
const hexMaterial = (color, roughness = 0.94) => new THREE.MeshStandardMaterial({ color, roughness, metalness: 0.02, flatShading: true });

function ellipseStrength(x, z, cx, cz, rx, rz) {
  const d = Math.sqrt(((x - cx) / rx) ** 2 + ((z - cz) / rz) ** 2);
  return 1.04 - d;
}
function hash2(x, z) {
  const v = Math.sin(x * 127.1 + z * 311.7 + 41.7) * 43758.5453;
  return (v - Math.floor(v)) * 2 - 1;
}
function terrainFor(x, z, height) {
  if (height > 0.72 || z < -6.2) return 'tundra';
  if (x > 3.5 && z < 2.2 && z > -4.3) return 'desert';
  if ((Math.sin(x * 1.21) + Math.cos(z * 1.47)) > 0.85) return 'forest';
  if (height > 0.42) return 'highland';
  return 'grass';
}

function createTileData() {
  const centers = NATIONS.map(n => ({ ...n, x: n.center[0], z: n.center[1] }));
  const tiles = [];
  for (let r = 0; r < ROWS; r += 1) {
    for (let c = 0; c < COLS; c += 1) {
      const x = c - (COLS - 1) / 2 + ((r % 2) ? 0.5 : 0);
      const z = r - (ROWS - 1) / 2;
      const landNoise = hash2(c, r) * 0.12 + Math.sin(x * 0.47 + z * 0.22) * 0.045;
      const landScore = Math.max(
        ellipseStrength(x, z, -6.6, 0, 6.2, 4.45),
        ellipseStrength(x, z, -1.3, -4.0, 4.6, 3.65),
        ellipseStrength(x, z, 6.1, -1.0, 4.8, 3.9),
        ellipseStrength(x, z, 1.2, 5.2, 4.25, 3.3),
      ) + landNoise;
      if (landScore < -0.10) continue;
      const distances = centers.map(n => {
        const normalized = ((x - n.x) / 5.4) ** 2 + ((z - n.z) / 4.5) ** 2;
        return { id: n.id, score: normalized + hash2(c + 21, r + 13) * 0.045 };
      }).sort((a, b) => a.score - b.score);
      const ownerId = distances[0].id;
      const height = Math.max(0.12, Math.min(0.88, 0.3 + landScore * 0.42 + hash2(c + 12, r + 4) * 0.14));
      const terrain = terrainFor(x, z, height);
      tiles.push({ id: `tile-${r}-${c}`, row: r, col: c, x, z, ownerId, height, terrain, landScore, cityId: null });
    }
  }
  // Keep each named city anchored to a land tile close to its authored region.
  const available = new Set(tiles.map(t => t.id));
  for (const city of CITIES) {
    const ownerTiles = tiles.filter(t => t.ownerId === city.nationId && available.has(t.id));
    const candidates = ownerTiles.length ? ownerTiles : tiles.filter(t => available.has(t.id));
    candidates.sort((a, b) => Math.hypot(a.x - city.position[0], a.z - city.position[1]) - Math.hypot(b.x - city.position[0], b.z - city.position[1]));
    const tile = candidates[0];
    if (tile) { tile.cityId = city.id; available.delete(tile.id); }
  }
  return tiles;
}

function makeTextSprite(text, color = '#f4e7c0', scale = 1) {
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 112;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'rgba(7, 15, 27, 0.82)';
  roundRect(ctx, 8, 15, 496, 82, 16); ctx.fill();
  ctx.strokeStyle = 'rgba(226, 201, 139, 0.35)'; ctx.lineWidth = 2; ctx.stroke();
  ctx.font = '600 32px Inter, Segoe UI, sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = color; ctx.fillText(text, 256, 57, 460);
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false, sizeAttenuation: true }));
  sprite.scale.set(2.6 * scale, 0.58 * scale, 1);
  return sprite;
}
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
}

export class World3D {
  constructor(canvas, callbacks = {}) {
    this.canvas = canvas;
    this.callbacks = callbacks;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#081321');
    this.scene.fog = new THREE.Fog('#081321', 24, 72);
    this.camera = new THREE.PerspectiveCamera(44, 1, 0.1, 140);
    this.camera.position.set(0, 19, 21);
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.12;
    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.075;
    this.controls.minDistance = 7.8;
    this.controls.maxDistance = 42;
    this.controls.maxPolarAngle = Math.PI * 0.47;
    this.controls.target.set(0, 0, 0);
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.mapTiles = createTileData();
    this.tileMeshes = new Map();
    this.tileById = new Map(this.mapTiles.map(t => [t.id, t]));
    this.worldGroup = new THREE.Group();
    this.scene.add(this.worldGroup);
    this.mode = 'strategic';
    this.lastRenderKey = '';
    this.showLabels = true;
    this.selectedId = null;
    this.selectionMesh = null;
    this.cityAnchorById = new Map();
    this.battleGroup = null;
    this.battleUnitMeshes = [];
    this.visible = true;
    this._onPointerDown = this._onPointerDown.bind(this);
    this._onPointerUp = this._onPointerUp.bind(this);
    this._onWheel = this._onWheel.bind(this);
    this.canvas.addEventListener('pointerdown', this._onPointerDown);
    this.canvas.addEventListener('pointerup', this._onPointerUp);
    this.canvas.addEventListener('wheel', this._onWheel, { passive: true });
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.canvas.parentElement || this.canvas);
    this.resize();
    this._animate = this._animate.bind(this);
    this._frame = requestAnimationFrame(this._animate);
    this.resetCamera();
  }

  addLighting() {
    const ambient = new THREE.HemisphereLight('#c6d9ea', '#1b2932', 2.15);
    this.worldGroup.add(ambient);
    const key = new THREE.DirectionalLight('#ffedc5', 3.3); key.position.set(-9, 18, 11); this.worldGroup.add(key);
    const rim = new THREE.DirectionalLight('#79a8e9', 1.2); rim.position.set(10, 10, -14); this.worldGroup.add(rim);
  }

  sync(state) {
    const key = `${state.mode}|${state.worldVersion}|${state.showLabels}|${state.language || 'en'}|${state.battle?.round ?? 0}|${state.battle?.finished ?? false}`;
    this.showLabels = state.showLabels;
    if (key !== this.lastRenderKey) {
      const previousMode = this.mode;
      this.lastRenderKey = key;
      this.mode = state.mode;
      this.clearWorld();
      this.addLighting();
      if (state.mode === 'battle' && state.battle) this.buildBattle(state);
      else this.buildStrategic(state);
      if (previousMode !== state.mode) this.resetCamera();
    }
    this.selectTile(state.selectedTileId);
  }

  clearWorld() {
    while (this.worldGroup.children.length) {
      const obj = this.worldGroup.children[this.worldGroup.children.length - 1];
      this.worldGroup.remove(obj);
      obj.traverse?.(child => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          const mats = Array.isArray(child.material) ? child.material : [child.material];
          for (const mat of mats) { mat.map?.dispose(); mat.dispose(); }
        }
      });
    }
    this.tileMeshes.clear(); this.cityAnchorById.clear(); this.selectionMesh = null; this.selectedId = null; this.battleUnitMeshes = [];
  }

  buildStrategic(state) {
    this.mode = 'strategic';
    const sea = new THREE.Mesh(new THREE.PlaneGeometry(34, 26), hexMaterial('#0d293b', 0.68));
    sea.rotation.x = -Math.PI / 2; sea.position.y = -0.43; this.worldGroup.add(sea);
    const grid = new THREE.GridHelper(34, 34, '#24495a', '#193345'); grid.position.y = -0.40; grid.material.transparent = true; grid.material.opacity = 0.28; this.worldGroup.add(grid);
    for (const tile of this.mapTiles) {
      const ownerColor = nationHexColors[tile.ownerId] || '#8ba39c';
      const base = new THREE.Color(terrainPalette[tile.terrain] || terrainPalette.grass);
      const tint = new THREE.Color(ownerColor);
      base.lerp(tint, 0.22);
      const topMat = hexMaterial(base, 0.98);
      const sideMat = hexMaterial(new THREE.Color(base).multiplyScalar(0.57), 1);
      const bottomMat = hexMaterial('#172a32', 1);
      const geo = new THREE.CylinderGeometry(0.57, 0.60, tile.height, 6, 1, false);
      const mesh = new THREE.Mesh(geo, [sideMat, topMat, bottomMat]);
      mesh.rotation.y = Math.PI / 6;
      mesh.position.set(tile.x, -0.32 + tile.height / 2, tile.z);
      mesh.userData = { tileId: tile.id, land: true };
      this.worldGroup.add(mesh); this.tileMeshes.set(tile.id, mesh);
      const edge = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.CylinderGeometry(0.574, 0.604, tile.height + 0.012, 6, 1, false)), new THREE.LineBasicMaterial({ color: ownerColor, transparent: true, opacity: 0.48 }));
      edge.rotation.y = Math.PI / 6; edge.position.copy(mesh.position); this.worldGroup.add(edge);
    }
    this.buildCities(state);
    this.buildStrategicArmy(state);
    this.addAtmosphere();
  }

  buildCities(state) {
    for (const city of state.cities) {
      const tile = this.mapTiles.find(t => t.cityId === city.id);
      if (!tile) continue;
      const y = -0.32 + tile.height;
      this.cityAnchorById.set(city.id, { x: tile.x, y, z: tile.z, tileId: tile.id });
      const owner = NATIONS.find(n => n.id === city.nationId);
      const cityGroup = new THREE.Group(); cityGroup.position.set(tile.x, y, tile.z); this.worldGroup.add(cityGroup);
      const scale = city.type === 'capital' ? 1.12 : 0.82;
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.31 * scale, 0.36 * scale, 0.11, 8), hexMaterial('#172b34', 0.85));
      base.position.y = 0.06; cityGroup.add(base);
      const buildings = getVisualBuildings(state, city.id);
      if (!buildings.length) buildings.push({ type: city.type === 'capital' ? 'capital' : 'civic', level: city.level });
      buildings.slice(0, 5).forEach((b, index) => {
        const pos = buildingOffset(index);
        const h = 0.20 + ((index * 7 + city.level * 3) % 5) * 0.075 + (b.level - 1) * 0.05;
        const color = b.type === 'lab' || b.type === 'research' ? '#a9b5f6' : b.type === 'factory' || b.type === 'industrial' ? '#d6b67c' : b.type === 'farm' || b.type === 'agriculture' ? '#95c38e' : b.type === 'barracks' || b.type === 'military' ? '#d78b7d' : b.type === 'power' ? '#73c9e4' : '#b7c8d0';
        const building = new THREE.Mesh(new THREE.BoxGeometry(index === 0 ? 0.19 : 0.13, h, 0.14), hexMaterial(color, 0.6));
        building.position.set(pos.x, 0.11 + h / 2, pos.z); cityGroup.add(building);
        const roof = new THREE.Mesh(new THREE.BoxGeometry(index === 0 ? 0.205 : 0.145, 0.035, 0.155), hexMaterial(owner?.color || '#d8b56d', 0.54));
        roof.position.set(pos.x, 0.11 + h + 0.017, pos.z); cityGroup.add(roof);
      });
      if (city.type === 'capital') {
        const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.55, 5), hexMaterial(owner?.color || '#d8b56d', 0.4));
        mast.position.set(0, 0.58, 0); cityGroup.add(mast);
        const flag = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.10, 0.015), new THREE.MeshBasicMaterial({ color: owner?.color || '#d8b56d' }));
        flag.position.set(0.095, 0.77, 0); cityGroup.add(flag);
      }
      if (this.showLabels) {
        const lang = state.language || 'en';
        const label = makeTextSprite(city.name[lang] || city.name.en, owner?.color || '#f0d9a2', city.type === 'capital' ? 1 : 0.88);
        label.position.set(tile.x, y + 1.02, tile.z); this.worldGroup.add(label);
      }
    }
  }

  buildStrategicArmy(state) {
    const anchor = this.cityAnchorById.get('aurelia-city');
    if (!anchor) return;
    const groups = Math.max(2, Math.min(8, Math.ceil(state.military / 55)));
    for (let i = 0; i < groups; i += 1) {
      const unit = new THREE.Group();
      const x = anchor.x + 0.72 + (i % 3) * 0.19;
      const z = anchor.z + 0.18 + Math.floor(i / 3) * 0.25;
      unit.position.set(x, anchor.y + 0.10, z); this.worldGroup.add(unit);
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.13, 0.28, 6), hexMaterial('#d8b56d', 0.65)); body.rotation.z = 0.13; body.position.y = 0.14; unit.add(body);
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 6), hexMaterial('#e8d6af', 0.76)); head.position.y = 0.31; unit.add(head);
      const banner = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.17, 0.015), new THREE.MeshBasicMaterial({ color: '#f1d18a' })); banner.position.set(0.11, 0.30, 0); unit.add(banner);
    }
  }

  addAtmosphere() {
    const starMaterial = new THREE.PointsMaterial({ color: '#9fb6cc', size: 0.045, transparent: true, opacity: 0.8 });
    const starGeometry = new THREE.BufferGeometry(); const points = [];
    for (let i = 0; i < 260; i += 1) points.push((hash2(i, 3) * 0.5) * 48, 7 + Math.abs(hash2(i, 7)) * 19, (hash2(i, 11) * 0.5) * 36);
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
    const stars = new THREE.Points(starGeometry, starMaterial); this.worldGroup.add(stars);
  }

  buildBattle(state) {
    this.mode = 'battle';
    const battle = state.battle;
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(22, 16), hexMaterial('#334f4a', 1));
    floor.rotation.x = -Math.PI / 2; floor.position.y = -0.12; this.worldGroup.add(floor);
    const grid = new THREE.GridHelper(22, 22, '#789087', '#506d63'); grid.position.y = -0.105; grid.material.transparent = true; grid.material.opacity = 0.20; this.worldGroup.add(grid);
    const horizon = new THREE.Mesh(new THREE.PlaneGeometry(22, 2.4), hexMaterial(battle.terrain === 'Highland Pass' ? '#5a6c6a' : battle.terrain === 'River Valley' ? '#174b68' : '#74694e', 0.8));
    horizon.rotation.x = -Math.PI / 2; horizon.position.set(0, -0.02, -4.7); this.worldGroup.add(horizon);
    for (let i = 0; i < 9; i += 1) {
      const hill = new THREE.Mesh(new THREE.SphereGeometry(0.75 + (i % 3) * 0.25, 8, 5), hexMaterial(i % 2 ? '#536b5f' : '#63796b', 1));
      hill.scale.y = 0.23; hill.position.set(-10 + i * 2.5, 0.08, -6.0 - (i % 3) * 0.4); this.worldGroup.add(hill);
    }
    const line = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.02, 12), new THREE.MeshBasicMaterial({ color: '#d8c68e', transparent: true, opacity: 0.62 })); line.position.set(0, -0.02, 0.4); this.worldGroup.add(line);
    this.addBattleFormations(battle);
    const terrainLabel = makeTextSprite(battle.terrain.toUpperCase(), '#f0d59a', 0.9); terrainLabel.position.set(0, 2.3, -5.2); this.worldGroup.add(terrainLabel);
    if (battle.finished) {
      const result = makeTextSprite((battle.result || 'ENGAGEMENT ENDED').toUpperCase(), battle.result === 'victory' ? '#8ed3a2' : '#ef9a90', 1.15);
      result.position.set(0, 3.3, 0); this.worldGroup.add(result);
    }
    this.camera.position.set(0, 13.2, 16.8); this.controls.target.set(0, 0, -0.2); this.controls.maxDistance = 29; this.controls.minDistance = 8;
  }

  addBattleFormations(battle) {
    const makeSoldier = (x, z, side, index) => {
      const color = side === 'player' ? '#e4c57c' : '#cb827c';
      const group = new THREE.Group(); group.position.set(x, 0, z); this.worldGroup.add(group);
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.13, 0.34, 6), hexMaterial(color, 0.7)); body.position.y = 0.19; group.add(body);
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.085, 8, 6), hexMaterial('#d8c9ac', 0.8)); head.position.y = 0.42; group.add(head);
      const pack = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.15, 0.12), hexMaterial(side === 'player' ? '#81734f' : '#704b4a', 1)); pack.position.set(0, 0.20, -0.09); group.add(pack);
      if (index % 3 === 0) {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.013, 0.66, 5), hexMaterial(color, 0.5)); pole.position.set(0.10, 0.49, 0); group.add(pole);
        const flag = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.12, 0.018), new THREE.MeshBasicMaterial({ color })); flag.position.set(0.20, 0.70, 0); group.add(flag);
      }
      return group;
    };
    const playerCount = Math.max(4, Math.min(12, Math.round(battle.playerStrength / 24)));
    const enemyCount = Math.max(4, Math.min(12, Math.round(battle.enemyStrength / 24)));
    for (let i = 0; i < playerCount; i += 1) {
      const row = Math.floor(i / 4), col = i % 4;
      this.battleUnitMeshes.push({ side: 'player', mesh: makeSoldier(-6.8 + col * 0.62, 2.2 + row * 0.8, 'player', i) });
    }
    for (let i = 0; i < enemyCount; i += 1) {
      const row = Math.floor(i / 4), col = i % 4;
      this.battleUnitMeshes.push({ side: 'enemy', mesh: makeSoldier(4.9 + col * 0.62, -2.2 - row * 0.8, 'enemy', i) });
    }
  }

  getTileForCity(cityId) { return this.mapTiles.find(t => t.cityId === cityId) ?? null; }

  selectTile(tileId) {
    if (tileId === this.selectedId) return;
    this.selectedId = tileId;
    if (this.selectionMesh) { this.worldGroup.remove(this.selectionMesh); this.selectionMesh.geometry.dispose(); this.selectionMesh.material.dispose(); this.selectionMesh = null; }
    if (!tileId || this.mode !== 'strategic') return;
    const tile = this.tileById.get(tileId);
    if (!tile) return;
    this.selectionMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.64, 0.64, 0.045, 6, 1, false), new THREE.MeshBasicMaterial({ color: '#f6d995', transparent: true, opacity: 0.95, wireframe: true }));
    this.selectionMesh.rotation.y = Math.PI / 6;
    this.selectionMesh.position.set(tile.x, -0.32 + tile.height + 0.04, tile.z);
    this.worldGroup.add(this.selectionMesh);
  }

  _onPointerDown(event) {
    if (this.mode !== 'strategic' || event.button !== 0 || event.target !== this.canvas) return;
    this.pointerStart = { x: event.clientX, y: event.clientY, button: event.button };
  }

  _onPointerUp(event) {
    if (!this.pointerStart || this.mode !== 'strategic' || event.button !== 0 || event.target !== this.canvas) {
      this.pointerStart = null; return;
    }
    const moved = Math.hypot(event.clientX - this.pointerStart.x, event.clientY - this.pointerStart.y);
    this.pointerStart = null;
    if (moved > 5) return;
    this.pointer.x = (event.offsetX / this.canvas.clientWidth) * 2 - 1;
    this.pointer.y = -(event.offsetY / this.canvas.clientHeight) * 2 + 1;
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const objects = [...this.tileMeshes.values()];
    const hit = this.raycaster.intersectObjects(objects, false)[0];
    if (!hit) return;
    const tile = this.tileById.get(hit.object.userData.tileId);
    if (tile) this.callbacks.onTileSelected?.(tile);
  }

  _onWheel(event) {
    if (event.deltaY < 0) this.callbacks.onZoom?.('in');
    else this.callbacks.onZoom?.('out');
  }

  zoom(direction) {
    const offset = this.camera.position.clone().sub(this.controls.target);
    const factor = direction === 'in' ? 0.84 : 1.18;
    const next = Math.min(this.controls.maxDistance, Math.max(this.controls.minDistance, offset.length() * factor));
    offset.setLength(next); this.camera.position.copy(this.controls.target.clone().add(offset));
    this.controls.update();
  }

  resetCamera() {
    if (this.mode === 'battle') {
      this.camera.position.set(0, 13.2, 16.8); this.controls.target.set(0, 0, -0.2);
    } else {
      this.camera.position.set(0, 19, 21); this.controls.target.set(0, 0, 0);
    }
    this.controls.update();
  }

  resize() {
    const width = Math.max(1, this.canvas.clientWidth || 960);
    const height = Math.max(1, this.canvas.clientHeight || 640);
    this.camera.aspect = width / height; this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  _animate() {
    this._frame = requestAnimationFrame(this._animate);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    cancelAnimationFrame(this._frame);
    this.resizeObserver.disconnect();
    this.canvas.removeEventListener('pointerdown', this._onPointerDown);
    this.canvas.removeEventListener('pointerup', this._onPointerUp);
    this.canvas.removeEventListener('wheel', this._onWheel);
    this.controls.dispose(); this.renderer.dispose();
  }
}

function buildingOffset(index) {
  const values = [{ x: 0, z: 0 }, { x: -0.16, z: 0.11 }, { x: 0.15, z: 0.11 }, { x: -0.15, z: -0.13 }, { x: 0.15, z: -0.13 }];
  return values[index % values.length];
}
function getVisualBuildings(state, cityId) {
  return state.structures.filter(s => s.cityId === cityId).map(s => ({ type: s.type, level: s.level }));
}
