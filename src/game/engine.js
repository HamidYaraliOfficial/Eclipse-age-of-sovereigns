import { CITIES, EVENTS, NATIONS, STRUCTURES, TECHNOLOGIES } from '../data/gameData.js';

export const SAVE_VERSION = 1;
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const clone = (value) => JSON.parse(JSON.stringify(value));

export function createInitialState() {
  const relations = { veyra: 8, kharad: -6, orinth: 18 };
  return {
    version: SAVE_VERSION,
    language: 'en',
    turn: 1,
    year: 1,
    selectedNationId: 'aurelia',
    selectedTileId: null,
    activeTab: 'overview',
    mode: 'strategic',
    showLabels: true,
    resources: { credits: 1550, food: 112, energy: 95, science: 0, stability: 74, influence: 18, industry: 0, defence: 48 },
    population: 4.2,
    military: 245,
    morale: 72,
    cities: clone(CITIES),
    nations: NATIONS.map(n => ({ ...clone(n), relations: n.id === 'aurelia' ? {} : { toPlayer: relations[n.id] ?? 0 }, treasury: n.isPlayer ? 1550 : 900 + (n.id.length * 70), military: n.isPlayer ? 245 : (n.id === 'kharad' ? 285 : n.id === 'veyra' ? 195 : 175), techLevel: n.id === 'veyra' ? 2 : 1, treaties: [], goal: n.id === 'veyra' ? 'science' : n.id === 'kharad' ? 'military' : 'trade' })),
    structures: [
      { id: 'initial-farm', cityId: 'meadowfall', type: 'farm', ownerId: 'orinth', level: 1 },
      { id: 'initial-lab', cityId: 'glasshaven', type: 'lab', ownerId: 'veyra', level: 1 },
    ],
    completedResearch: [],
    currentResearch: null,
    researchProgress: 0,
    relations,
    treaties: [],
    events: [],
    log: [{ turn: 1, text: 'The Sovereign Age begins. Your council awaits its first decree.', kind: 'story' }],
    lastReport: null,
    battle: null,
    battleResult: null,
    worldVersion: 1,
    counters: { structures: 2, events: 0, battles: 0 },
    victory: null,
  };
}

export function getNation(state, nationId) { return state.nations.find(n => n.id === nationId) ?? null; }
export function getCity(state, cityId) { return state.cities.find(c => c.id === cityId) ?? null; }
export function getStructureDefinition(type) { return STRUCTURES[type] ?? null; }
export function getStructuresForCity(state, cityId) { return state.structures.filter(s => s.cityId === cityId); }
export function getPlayerCities(state) { return state.cities.filter(c => c.nationId === 'aurelia'); }
export function getPlayerNation(state) { return getNation(state, 'aurelia'); }
export function canAfford(state, cost = {}) { return Object.entries(cost).every(([key, amount]) => (state.resources[key] ?? 0) >= amount); }
function log(state, text, kind = 'info') { state.log.unshift({ turn: state.turn, text, kind }); state.log = state.log.slice(0, 40); }
function applyEffects(state, effect = {}) {
  for (const [key, value] of Object.entries(effect)) {
    if (key in state.resources) state.resources[key] += value;
    else if (key === 'defence') state.resources.defence += value;
    else if (key === 'industry') state.resources.industry += value;
  }
  state.resources.stability = clamp(state.resources.stability, 0, 100);
  state.resources.influence = clamp(state.resources.influence, 0, 1000);
}
function addEvent(state, event) {
  state.counters.events += 1;
  const item = { ...clone(event), uid: `event-${state.counters.events}`, turn: state.turn, resolved: false };
  state.events.unshift(item);
  state.events = state.events.slice(0, 12);
  return item;
}

export function buildStructure(state, cityId, type) {
  const city = getCity(state, cityId);
  const def = STRUCTURES[type];
  if (!city || city.nationId !== 'aurelia') return { ok: false, reason: 'not-owned' };
  if (!def) return { ok: false, reason: 'unknown-structure' };
  if (state.structures.filter(s => s.cityId === cityId).length >= 5) return { ok: false, reason: 'limit' };
  if (!canAfford(state, def.cost)) return { ok: false, reason: 'resources' };
  for (const [key, amount] of Object.entries(def.cost)) state.resources[key] -= amount;
  const structure = { id: `structure-${++state.counters.structures}`, cityId, type, ownerId: 'aurelia', level: 1 };
  state.structures.push(structure);
  state.worldVersion += 1;
  log(state, `${def.name.en} commissioned in ${city.name.en}.`, 'build');
  return { ok: true, structure };
}

export function startResearch(state, techId) {
  const tech = TECHNOLOGIES.find(t => t.id === techId);
  if (!tech) return { ok: false, reason: 'unknown-tech' };
  if (state.completedResearch.includes(techId)) return { ok: false, reason: 'completed' };
  if (state.currentResearch) return { ok: false, reason: 'busy' };
  if (!tech.prerequisites.every(id => state.completedResearch.includes(id))) return { ok: false, reason: 'prerequisite' };
  state.currentResearch = techId;
  state.researchProgress = 0;
  log(state, `Research initiated: ${tech.name.en}.`, 'research');
  return { ok: true, tech };
}

export function performDiplomacy(state, nationId, action) {
  const nation = getNation(state, nationId);
  if (!nation || nation.isPlayer || !['envoy', 'trade', 'alliance'].includes(action)) return { ok: false, reason: 'invalid' };
  const existingTreaty = state.treaties.find(t => t.nationId === nationId && t.type === action);
  if ((action === 'trade' || action === 'alliance') && existingTreaty) return { ok: false, reason: 'exists' };
  const cost = action === 'envoy' ? 50 : action === 'trade' ? 130 : 260;
  if (state.resources.credits < cost) return { ok: false, reason: 'resources' };
  state.resources.credits -= cost;
  const base = state.relations[nationId] ?? 0;
  const change = action === 'envoy' ? 12 : action === 'trade' ? 8 : 5;
  state.relations[nationId] = clamp(base + change, -100, 100);
  nation.relations.toPlayer = state.relations[nationId];
  if (action !== 'envoy') state.treaties.push({ nationId, type: action, signedTurn: state.turn });
  if (action === 'trade') state.resources.influence += 2;
  if (action === 'alliance') state.resources.influence += 5;
  log(state, `${action === 'envoy' ? 'Envoy dispatched to' : action === 'trade' ? 'Trade pact signed with' : 'Alliance formed with'} ${nation.name.en}.`, 'diplomacy');
  return { ok: true, relation: state.relations[nationId] };
}

export function recruitInfantry(state) {
  const cost = { credits: 180, food: 8 };
  if (state.military >= 600) return { ok: false, reason: 'limit' };
  if (!canAfford(state, cost)) return { ok: false, reason: 'resources' };
  for (const [key, amount] of Object.entries(cost)) state.resources[key] -= amount;
  state.military += 35;
  state.morale = clamp(state.morale + 2, 0, 100);
  state.worldVersion += 1;
  log(state, 'A new infantry battalion has joined the Aurelian forces.', 'military');
  return { ok: true };
}

export function startBattle(state, nationId) {
  const nation = getNation(state, nationId);
  if (!nation || nation.isPlayer) return { ok: false, reason: 'invalid' };
  if (state.battle) return { ok: false, reason: 'already-in-battle' };
  if (state.resources.food < 5 || state.resources.energy < 5) return { ok: false, reason: 'resources' };
  state.battle = {
    id: `battle-${++state.counters.battles}`,
    enemyId: nationId,
    round: 1,
    playerStart: state.military,
    enemyStart: Math.max(80, nation.military),
    playerStrength: state.military,
    enemyStrength: Math.max(80, nation.military),
    playerMorale: state.morale,
    enemyMorale: 62,
    terrain: ['Highland Pass', 'River Valley', 'Open Plain', 'Outer District'][state.counters.battles % 4],
    finished: false,
    result: null,
    history: ['Scouts report opposing forces ahead. The first command is yours.'],
  };
  state.mode = 'battle';
  state.resources.food -= 5;
  state.resources.energy -= 5;
  log(state, `A tactical engagement has begun against ${nation.name.en}.`, 'battle');
  return { ok: true };
}

const ACTIONS = {
  advance: { player: 1.16, enemy: 1.06, text: 'Your forces advance across the field.' },
  hold: { player: 0.94, enemy: 0.78, text: 'A disciplined defensive line absorbs the counterattack.' },
  flank: { player: 1.33, enemy: 1.12, text: 'A flanking manoeuvre seeks an opening in the enemy line.' },
  artillery: { player: 0.84, enemy: 0.80, text: 'A coordinated artillery strike disrupts enemy formations.' },
};

export function battleAction(state, action) {
  const battle = state.battle;
  if (!battle || battle.finished) return { ok: false, reason: 'no-battle' };
  if (!['advance', 'hold', 'flank', 'artillery', 'retreat'].includes(action)) return { ok: false, reason: 'invalid-action' };
  if (action === 'retreat') {
    battle.finished = true; battle.result = 'retreat';
    state.military = Math.max(50, Math.round(state.military * 0.94));
    state.morale = clamp(state.morale - 6, 0, 100);
    battle.history.unshift('Your command orders an orderly withdrawal. The army preserves most of its strength.');
    state.battleResult = 'retreat'; state.mode = 'battle';
    log(state, 'Your army withdrew from the engagement.', 'battle');
    return { ok: true, finished: true, result: 'retreat' };
  }
  if (action === 'artillery') {
    if (state.resources.credits < 85 || state.resources.energy < 8) return { ok: false, reason: 'resources' };
    state.resources.credits -= 85; state.resources.energy -= 8;
  }
  const command = ACTIONS[action];
  const terrainBonus = battle.terrain === 'Highland Pass' && action === 'hold' ? 1.12 : battle.terrain === 'Open Plain' && action === 'flank' ? 1.08 : 1;
  const techBonus = state.completedResearch.includes('composite-armour') ? 1.05 : 1;
  const relation = state.relations[battle.enemyId] ?? 0;
  const enemyAggression = relation < -25 ? 1.13 : 1;
  const playerDamage = Math.round((battle.enemyStrength * (0.075 + Math.random() * 0.035) * command.player * terrainBonus * techBonus) + (state.resources.defence * 0.025));
  const enemyDamage = Math.round((battle.playerStrength * (0.045 + Math.random() * 0.045) * command.enemy * enemyAggression) * (action === 'hold' ? 0.65 : 1));
  battle.enemyStrength = Math.max(0, battle.enemyStrength - playerDamage);
  battle.playerStrength = Math.max(0, battle.playerStrength - enemyDamage);
  battle.round += 1;
  battle.playerMorale = clamp(battle.playerMorale + (action === 'hold' ? 2 : action === 'flank' ? -1 : 0) + (battle.enemyStrength < battle.enemyStart * 0.4 ? 2 : 0), 0, 100);
  battle.enemyMorale = clamp(battle.enemyMorale - (playerDamage > 20 ? 3 : 1), 0, 100);
  battle.history.unshift(`${command.text} Enemy strength −${playerDamage}; friendly strength −${enemyDamage}.`);
  battle.history = battle.history.slice(0, 7);
  state.military = Math.max(40, Math.round(battle.playerStrength));
  state.morale = Math.round(battle.playerMorale);
  if (battle.enemyStrength <= 0 || battle.enemyMorale <= 0) {
    battle.finished = true; battle.result = 'victory';
    state.resources.credits += 230; state.resources.influence = clamp(state.resources.influence + 7, 0, 1000);
    const enemy = getNation(state, battle.enemyId);
    enemy.military = Math.max(40, Math.round(enemy.military * 0.64));
    state.relations[battle.enemyId] = clamp((state.relations[battle.enemyId] ?? 0) - 18, -100, 100);
    enemy.relations.toPlayer = state.relations[battle.enemyId];
    state.battleResult = 'victory'; state.mode = 'battle';
    log(state, `Victory against ${enemy.name.en}. Your forces return with captured supplies.`, 'victory');
    return { ok: true, finished: true, result: 'victory' };
  }
  if (battle.playerStrength <= 0 || battle.playerMorale <= 0 || battle.round >= 10) {
    battle.finished = true; battle.result = battle.playerStrength > battle.enemyStrength ? 'stalemate' : 'defeat';
    state.resources.stability = clamp(state.resources.stability - (battle.result === 'defeat' ? 8 : 3), 0, 100);
    state.morale = clamp(state.morale - 8, 0, 100);
    const enemy = getNation(state, battle.enemyId);
    enemy.military = Math.max(40, Math.round(enemy.military * (battle.result === 'defeat' ? 0.90 : 0.94)));
    state.battleResult = battle.result; state.mode = 'battle';
    log(state, `The engagement ended: ${battle.result}. The realm must regroup.`, 'battle');
    return { ok: true, finished: true, result: battle.result };
  }
  return { ok: true, finished: false };
}

export function continueAfterBattle(state) {
  if (!state.battle?.finished) return false;
  state.battle = null;
  state.mode = 'strategic';
  state.worldVersion += 1;
  return true;
}

export function advanceTurn(state) {
  if (state.battle && !state.battle.finished) return { ok: false, reason: 'battle-active' };
  const before = { ...state.resources };
  const counts = { farm: 0, factory: 0, lab: 0, power: 0, civic: 0, barracks: 0 };
  for (const s of state.structures.filter(s => s.ownerId === 'aurelia')) counts[s.type] = (counts[s.type] ?? 0) + 1;
  const tradeIncome = state.treaties.filter(t => t.type === 'trade').length * 35;
  const income = 90 + counts.factory * 110 + tradeIncome;
  const foodProduction = 20 + counts.farm * 14;
  const energyProduction = 15 + counts.power * 18;
  const scienceProduction = 6 + counts.lab * 8 + state.completedResearch.filter(id => id === 'applied-machine-learning' || id === 'deep-learning-labs').length * 3;
  const foodConsumption = 15 + Math.floor(state.population * 2);
  const energyConsumption = 9 + counts.factory * 2 + counts.lab * 2;
  state.resources.credits += income;
  state.resources.food += foodProduction - foodConsumption;
  state.resources.energy += energyProduction - energyConsumption;
  state.resources.science += scienceProduction;
  state.resources.credits -= 45;
  state.resources.stability += counts.civic * 4 + (state.resources.food < 12 ? -7 : 0) + (state.resources.energy < 10 ? -4 : 0) + (state.resources.credits < 0 ? -4 : 0);
  state.resources.influence += counts.barracks * 2 + (state.treaties.filter(t => t.type === 'alliance').length * 1);
  state.resources.stability = clamp(state.resources.stability, 0, 100);
  state.resources.influence = clamp(state.resources.influence, 0, 1000);
  if (state.resources.food < 0) { state.resources.stability = clamp(state.resources.stability - 6, 0, 100); state.population = Math.max(1, state.population - 0.05); }
  else if (state.resources.food > 35 && state.resources.stability > 55) state.population = Math.min(20, +(state.population + 0.025).toFixed(3));
  if (state.currentResearch) {
    const tech = TECHNOLOGIES.find(t => t.id === state.currentResearch);
    if (tech) {
      state.researchProgress += scienceProduction;
      if (state.researchProgress >= tech.cost) {
        state.completedResearch.push(tech.id);
        applyEffects(state, tech.effect);
        state.currentResearch = null;
        state.researchProgress = 0;
        log(state, `Research completed: ${tech.name.en}.`, 'research');
      }
    } else { state.currentResearch = null; state.researchProgress = 0; }
  }
  // AI nations make bounded, deterministic strategic adjustments every turn.
  for (const nation of state.nations.filter(n => !n.isPlayer)) {
    nation.treasury += nation.goal === 'trade' ? 95 : 60;
    if (nation.goal === 'military' && state.turn % 3 === 0) nation.military = Math.min(650, nation.military + 9);
    if (nation.goal === 'science' && state.turn % 2 === 0) nation.techLevel = Math.min(10, nation.techLevel + 1);
    const relation = state.relations[nation.id] ?? 0;
    if (relation < -40 && state.turn % 4 === 0) nation.military = Math.min(700, nation.military + 5);
  }
  state.turn += 1;
  state.year = Math.floor((state.turn - 1) / 12) + 1;
  state.worldVersion += 1;
  const report = {
    credits: state.resources.credits - before.credits,
    food: state.resources.food - before.food,
    energy: state.resources.energy - before.energy,
    science: state.resources.science - before.science,
    stability: state.resources.stability - before.stability,
    income,
    expenses: 45,
  };
  state.lastReport = report;
  if (state.turn % 3 === 0 || state.resources.food < 20 || state.resources.stability < 35) {
    const candidates = EVENTS.filter(e => !state.events.some(existing => existing.id === e.id && state.turn - existing.turn < 4));
    if (candidates.length) {
      const index = (state.turn * 7 + state.counters.events * 3) % candidates.length;
      const event = addEvent(state, candidates[index]);
      applyEffects(state, event.effect);
      log(state, `Event: ${event.title.en}.`, 'event');
    }
  }
  if (!state.victory && state.resources.influence >= 100) {
    state.victory = { type: 'influence', turn: state.turn };
    log(state, 'Aurelia has become a power of global influence. A diplomatic victory is within reach.', 'victory');
  }
  if (state.resources.stability < 20 && state.turn % 3 === 0) log(state, 'Public confidence is faltering. Consider civic investment or diplomacy.', 'warning');
  return { ok: true, report };
}

export function exportSave(state) {
  return JSON.stringify({ game: 'ECLIPSE: AGE OF SOVEREIGNS', version: SAVE_VERSION, savedAt: new Date().toISOString(), state }, null, 2);
}

export function importSave(jsonText) {
  let parsed;
  try { parsed = JSON.parse(jsonText); } catch { return { ok: false, reason: 'parse' }; }
  const state = parsed?.state;
  if (!state || state.version !== SAVE_VERSION || !Array.isArray(state.nations) || !Array.isArray(state.cities) || !state.resources || !Number.isInteger(state.turn) || state.turn < 1) return { ok: false, reason: 'schema' };
  // Structural validation prevents malformed files from breaking the renderer/game loop.
  const requiredResources = ['credits', 'food', 'energy', 'science', 'stability', 'influence', 'industry', 'defence'];
  if (!requiredResources.every(key => Number.isFinite(state.resources[key]))) return { ok: false, reason: 'resources' };
  const requiredArrays = ['structures', 'completedResearch', 'events', 'log', 'treaties'];
  if (!requiredArrays.every(key => Array.isArray(state[key]))) return { ok: false, reason: 'schema' };
  if (!state.nations.every(n => n && typeof n.id === 'string') || !state.nations.some(n => n.id === 'aurelia') || !state.cities.every(c => c && typeof c.id === 'string' && typeof c.nationId === 'string')) return { ok: false, reason: 'entities' };
  const nationIds = new Set(state.nations.map(n => n.id));
  const cityIds = new Set(state.cities.map(c => c.id));
  if (state.cities.some(c => !nationIds.has(c.nationId))) return { ok: false, reason: 'entities' };
  if (state.structures.some(s => !s || !cityIds.has(s.cityId) || !STRUCTURES[s.type] || !nationIds.has(s.ownerId))) return { ok: false, reason: 'entities' };
  if (!Number.isFinite(state.population) || state.population < 0 || !Number.isFinite(state.military) || state.military < 0 || !Number.isFinite(state.morale)) return { ok: false, reason: 'stats' };
  if (state.mode !== 'strategic' && state.mode !== 'battle') return { ok: false, reason: 'mode' };
  if (state.mode === 'battle' && (!state.battle || typeof state.battle.enemyId !== 'string' || !Number.isFinite(state.battle.playerStrength) || !Number.isFinite(state.battle.enemyStrength))) return { ok: false, reason: 'battle' };
  if (!state.relations || typeof state.relations !== 'object' || !state.counters || !['structures', 'events', 'battles'].every(key => Number.isFinite(state.counters[key])) || !Number.isFinite(state.worldVersion)) return { ok: false, reason: 'schema' };
  if (state.battle && !nationIds.has(state.battle.enemyId)) return { ok: false, reason: 'battle' };
  if ((state.mode === 'battle' && !state.battle) || (state.mode === 'strategic' && state.battle)) return { ok: false, reason: 'mode' };
  if (!['en', 'fa', 'zh'].includes(state.language)) state.language = 'en';
  return { ok: true, state };
}

export function getIncomeSummary(state) {
  const own = state.structures.filter(s => s.ownerId === 'aurelia');
  return {
    credits: 90 + own.filter(s => s.type === 'factory').length * 110 + state.treaties.filter(t => t.type === 'trade').length * 35 - 45,
    food: 20 + own.filter(s => s.type === 'farm').length * 14 - (15 + Math.floor(state.population * 2)),
    energy: 15 + own.filter(s => s.type === 'power').length * 18 - 9 - own.filter(s => s.type === 'factory' || s.type === 'lab').length * 2,
    science: 6 + own.filter(s => s.type === 'lab').length * 8,
  };
}

export function selectNextResearch(state, currentId) {
  const index = TECHNOLOGIES.findIndex(t => t.id === currentId);
  return TECHNOLOGIES[(index + 1) % TECHNOLOGIES.length];
}
