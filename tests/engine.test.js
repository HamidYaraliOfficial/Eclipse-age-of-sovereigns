import test from 'node:test';
import assert from 'node:assert/strict';
import {
  advanceTurn, battleAction, buildStructure, continueAfterBattle, createInitialState, exportSave, importSave,
  performDiplomacy, recruitInfantry, startBattle, startResearch,
} from '../src/game/engine.js';

function fresh() { return createInitialState(); }

test('initial state contains a player realm, rival nations, cities and resources', () => {
  const state = fresh();
  assert.equal(state.turn, 1);
  assert.equal(state.nations.filter(n => !n.isPlayer).length, 3);
  assert.ok(state.cities.length >= 8);
  assert.ok(state.resources.credits > 0);
  assert.equal(state.mode, 'strategic');
});

test('construction deducts the correct treasury and adds a structure', () => {
  const state = fresh();
  const before = state.resources.credits;
  const result = buildStructure(state, 'aurelia-city', 'farm');
  assert.equal(result.ok, true);
  assert.equal(state.resources.credits, before - 140);
  assert.equal(state.structures.at(-1).type, 'farm');
});

test('construction rejects foreign cities and unaffordable projects', () => {
  const state = fresh();
  assert.equal(buildStructure(state, 'veyra-city', 'farm').reason, 'not-owned');
  state.resources.credits = 0;
  assert.equal(buildStructure(state, 'aurelia-city', 'factory').reason, 'resources');
});

test('one turn advances the simulation and returns an income report', () => {
  const state = fresh();
  const result = advanceTurn(state);
  assert.equal(result.ok, true);
  assert.equal(state.turn, 2);
  assert.ok(result.report);
  assert.equal(typeof result.report.credits, 'number');
  assert.ok(state.log.length >= 1);
});

test('research starts and eventually completes through turn advancement', () => {
  const state = fresh();
  const start = startResearch(state, 'civic-grid');
  assert.equal(start.ok, true);
  assert.equal(startResearch(state, 'precision-agriculture').reason, 'busy');
  for (let i = 0; i < 20 && state.currentResearch; i += 1) advanceTurn(state);
  assert.ok(state.completedResearch.includes('civic-grid'));
  assert.equal(state.currentResearch, null);
});

test('diplomatic actions spend credits and improve relations', () => {
  const state = fresh();
  const before = state.resources.credits;
  const oldRelation = state.relations.veyra;
  const result = performDiplomacy(state, 'veyra', 'envoy');
  assert.equal(result.ok, true);
  assert.equal(state.resources.credits, before - 50);
  assert.equal(state.relations.veyra, oldRelation + 12);
});

test('diplomatic trade pact cannot be signed twice', () => {
  const state = fresh();
  assert.equal(performDiplomacy(state, 'orinth', 'trade').ok, true);
  assert.equal(performDiplomacy(state, 'orinth', 'trade').reason, 'exists');
});

test('recruitment changes army strength and spends resources', () => {
  const state = fresh();
  const beforeCredits = state.resources.credits;
  const beforeArmy = state.military;
  assert.equal(recruitInfantry(state).ok, true);
  assert.equal(state.military, beforeArmy + 35);
  assert.equal(state.resources.credits, beforeCredits - 180);
});

test('battle opens, resolves commands and can be withdrawn from', () => {
  const state = fresh();
  assert.equal(startBattle(state, 'kharad').ok, true);
  assert.equal(state.mode, 'battle');
  const beforeRound = state.battle.round;
  const action = battleAction(state, 'hold');
  assert.equal(action.ok, true);
  assert.equal(state.battle.round, beforeRound + 1);
  const retreat = battleAction(state, 'retreat');
  assert.equal(retreat.ok, true);
  assert.equal(retreat.finished, true);
  assert.equal(state.mode, 'battle');
  assert.equal(continueAfterBattle(state), true);
  assert.equal(state.mode, 'strategic');
});

test('save export/import round-trips a valid state', () => {
  const state = fresh(); state.turn = 9; state.resources.credits = 2044;
  const parsed = importSave(exportSave(state));
  assert.equal(parsed.ok, true);
  assert.equal(parsed.state.turn, 9);
  assert.equal(parsed.state.resources.credits, 2044);
});

test('save importer rejects malformed JSON and incompatible schemas', () => {
  assert.equal(importSave('not-json').ok, false);
  assert.equal(importSave(JSON.stringify({ state: { version: 0 } })).ok, false);
  const broken = fresh(); broken.resources.energy = 'a lot';
  assert.equal(importSave(JSON.stringify({ state: broken })).ok, false);
  const brokenEntities = fresh(); brokenEntities.structures[0].cityId = 'missing-city';
  assert.equal(importSave(JSON.stringify({ state: brokenEntities })).ok, false);
});

test('extended turn simulation keeps all resource and population values finite', () => {
  const state = fresh();
  for (let i = 0; i < 50; i += 1) advanceTurn(state);
  for (const value of Object.values(state.resources)) assert.equal(Number.isFinite(value), true);
  assert.equal(Number.isFinite(state.population), true);
  assert.ok(state.turn >= 51);
});
