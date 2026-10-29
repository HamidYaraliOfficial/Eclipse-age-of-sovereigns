import { CITIES, EVENTS, NATIONS, RESOURCE_META, STRUCTURES, TECHNOLOGIES, TEXT } from '../data/gameData.js';
import {
  advanceTurn, battleAction, buildStructure, canAfford, continueAfterBattle, exportSave, getCity,
  getIncomeSummary, getNation, getPlayerCities, getPlayerNation, getStructuresForCity,
  importSave, performDiplomacy, recruitInfantry, startBattle, startResearch,
} from '../game/engine.js';

const fmt = (value, digits = 0) => Number(value ?? 0).toLocaleString(undefined, { maximumFractionDigits: digits, minimumFractionDigits: digits });
const safe = (value) => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);

export class GameApp {
  constructor(state, world) {
    this.state = state;
    this.world = world;
    this.toastTimer = null;
    this.activeToast = null;
    this.root = document.getElementById('app');
    this.left = document.getElementById('left-panel');
    this.right = document.getElementById('right-panel');
    this.resources = document.getElementById('resource-strip');
    this.commandBar = document.getElementById('command-bar');
    this.modalRoot = document.getElementById('modal-root');
    this.fileInput = document.getElementById('save-file-input');
    this.bindEvents();
    this.syncLanguage();
    this.render();
  }

  t(key) { return TEXT[this.state.language]?.[key] ?? TEXT.en[key] ?? key; }
  localized(obj) { return obj?.[this.state.language] ?? obj?.en ?? String(obj ?? ''); }

  bindEvents() {
    this.root.addEventListener('click', event => {
      const button = event.target.closest('[data-action]');
      if (!button || button.disabled) return;
      const action = button.dataset.action;
      this.handleAction(action, button.dataset);
    });
    document.getElementById('language-select').addEventListener('change', e => {
      this.state.language = ['en', 'fa', 'zh'].includes(e.target.value) ? e.target.value : 'en';
      this.syncLanguage(); this.render(); this.world.sync(this.state);
    });
    document.getElementById('save-button').addEventListener('click', () => this.saveLocal());
    document.getElementById('load-button').addEventListener('click', () => this.loadLocal());
    document.getElementById('help-button').addEventListener('click', () => this.showHelp());
    this.fileInput.addEventListener('change', async e => {
      const file = e.target.files?.[0]; if (!file) return;
      try {
        const text = await file.text(); const result = importSave(text);
        if (!result.ok) throw new Error('invalid-save');
        this.replaceState(result.state); this.toast(this.t('importDone'), 'success');
      } catch { this.toast(this.t('importError'), 'error'); }
      finally { this.fileInput.value = ''; }
    });
  }

  syncLanguage() {
    const lang = this.state.language || 'en';
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : lang;
    document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
    document.getElementById('language-select').value = lang;
    document.getElementById('world-era').textContent = `${lang === 'fa' ? 'عصر فرمانروایان' : lang === 'zh' ? '主权时代' : 'THE SOVEREIGN AGE'} · ${this.t('year')} ${String(this.state.year).padStart(2, '0')}`;
    document.querySelector('.language-label').textContent = this.t('language');
    document.getElementById('save-button').title = lang === 'fa' ? 'ذخیره بازی' : lang === 'zh' ? '保存游戏' : 'Save game';
    document.getElementById('load-button').title = lang === 'fa' ? 'بارگذاری بازی' : lang === 'zh' ? '加载游戏' : 'Load game';
    document.getElementById('help-button').title = this.t('helpTitle');
    document.getElementById('stage-eyebrow').textContent = this.state.mode === 'battle' ? this.t('battleMode').toUpperCase() : (lang === 'fa' ? 'فرماندهی جهان' : lang === 'zh' ? '世界指挥' : 'WORLD COMMAND');
    document.getElementById('stage-title').textContent = this.state.mode === 'battle' ? this.t('battleTitle') : this.t('worldMap');
    document.getElementById('stage-caption').textContent = this.state.mode === 'battle' ? this.t('battleTip') : (lang === 'fa' ? 'عصری نامطمئن؛ قدرتی تازه در حال ظهور است.' : lang === 'zh' ? '时代未定，新势力正在崛起。' : 'An uncertain age. A new power rises.');
    document.getElementById('stage-status').textContent = lang === 'fa' ? 'شبیه‌سازی فعال' : lang === 'zh' ? '模拟运行中' : 'SIMULATION LIVE';
    document.getElementById('map-hint').textContent = this.t('helpControls').toUpperCase();
    document.getElementById('legend-neutral').textContent = lang === 'fa' ? 'قلمرو مستقل' : lang === 'zh' ? '独立领土' : 'Independent territory';
    document.getElementById('legend-city').textContent = lang === 'fa' ? 'شهر مهم' : lang === 'zh' ? '主要城市' : 'Major city';
    document.getElementById('legend-player').textContent = this.localized(getPlayerNation(this.state)?.name).toUpperCase();
  }

  render() {
    this.syncLanguage();
    this.renderResources();
    this.renderLeftPanel();
    this.renderRightPanel();
    this.renderCommandBar();
    this.world.sync(this.state);
    if (this.activeToast) this.renderToast();
  }

  renderResources() {
    const state = this.state; const t = this.t.bind(this);
    const metas = RESOURCE_META;
    this.resources.innerHTML = metas.map(m => {
      const value = state.resources[m.key] ?? 0;
      const display = m.key === 'stability' ? `${fmt(value)}%` : m.key === 'credits' ? fmt(value) : fmt(value, m.key === 'science' ? 1 : 0);
      const deltaMap = getIncomeSummary(state);
      const delta = deltaMap[m.key];
      return `<div class="resource-card" style="--resource-color:${m.color}"><div class="resource-icon">${m.icon}</div><div class="resource-copy"><div class="resource-label">${safe(this.localized(m.label))}</div><div class="resource-value">${display}</div>${delta !== undefined ? `<div class="resource-delta ${delta >= 0 ? 'positive' : 'negative'}">${delta >= 0 ? '+' : ''}${fmt(delta, 0)} / ${safe(t('turn'))}</div>` : ''}</div></div>`;
    }).join('');
    document.querySelector('.topbar-center').title = `Turn ${state.turn}`;
  }

  renderLeftPanel() {
    const player = getPlayerNation(this.state);
    const tabs = [
      ['overview', '◫'], ['build', '⌂'], ['research', '⌘'], ['diplomacy', '⇄'], ['military', '⬟'], ['events', '◷'],
    ];
    const tabNav = `<nav class="side-nav" aria-label="Game systems">${tabs.map(([id, icon]) => `<button class="nav-item ${this.state.activeTab === id ? 'active' : ''}" data-action="tab" data-tab="${id}"><span class="nav-icon">${icon}</span><span>${safe(this.t(id))}</span><span class="nav-chevron">›</span></button>`).join('')}</nav>`;
    const nationSummary = `<div class="nation-card"><div class="nation-card-top"><span class="mini-sigil">☼</span><span class="eyebrow">${safe(this.t('yourNation'))}</span><span class="online-pill"><i></i> ${safe(this.t('ready'))}</span></div><h2>${safe(this.localized(player.name))}</h2><p>${safe(player.government)} · ${safe(player.doctrine)}</p><div class="stability-row"><span>${safe(this.t('publicApproval'))}</span><strong>${fmt(this.state.resources.stability)}%</strong></div><div class="meter"><span style="width:${Math.max(0, Math.min(100, this.state.resources.stability))}%"></span></div><div class="turn-stamp"><span>${safe(this.t('year'))} ${this.state.year.toString().padStart(2, '0')}</span><b>${safe(this.t('turnLabel'))} ${this.state.turn.toString().padStart(2, '0')}</b></div></div>`;
    const content = this.state.mode === 'battle' ? this.renderBattlePanel() : this.renderTabContent();
    this.left.innerHTML = `${nationSummary}${tabNav}<div class="left-content">${content}</div>`;
  }

  renderTabContent() {
    const state = this.state; const t = this.t.bind(this); const tab = state.activeTab;
    if (tab === 'overview') {
      const totalCities = getPlayerCities(state).length;
      const activeTech = TECHNOLOGIES.find(x => x.id === state.currentResearch);
      const report = state.lastReport;
      return `<div class="section-heading"><span class="eyebrow">${safe(t('overview'))}</span><h3>${safe(t('overviewTitle'))}</h3><p>${safe(t('overviewBody'))}</p></div>
        <div class="metric-grid"><div class="metric-card"><span>⌂</span><small>${safe(t('cities'))}</small><strong>${totalCities}</strong></div><div class="metric-card"><span>♙</span><small>${safe(t('citizens'))}</small><strong>${fmt(state.population, 2)}M</strong></div><div class="metric-card"><span>⬟</span><small>${safe(t('army'))}</small><strong>${fmt(state.military)}</strong></div><div class="metric-card"><span>✧</span><small>${safe(t('techs'))}</small><strong>${state.completedResearch.length}/${TECHNOLOGIES.length}</strong></div></div>
        <div class="subsection-title">${safe(t('activeResearch'))}</div>${activeTech ? `<div class="research-current"><div class="research-symbol">⌘</div><div class="grow"><b>${safe(this.localized(activeTech.name))}</b><div class="micro-text">${safe(t('progress'))}: ${fmt(state.researchProgress)} / ${activeTech.cost}</div><div class="meter purple"><span style="width:${Math.min(100, state.researchProgress / activeTech.cost * 100)}%"></span></div></div></div>` : `<div class="empty-mini">${safe(t('noResearch'))}<button class="text-action" data-action="tab" data-tab="research">${safe(t('research'))} ↗</button></div>`}
        <div class="subsection-title">${safe(t('lastReport'))}</div>${report ? `<div class="report-grid">${[['credits','◈'],['food','✦'],['energy','ϟ'],['science','⌘']].map(([k,icon]) => `<span>${icon} ${safe(t(k === 'credits' ? 'income' : k))} <b class="${report[k] >= 0 ? 'positive' : 'negative'}">${report[k] >= 0 ? '+' : ''}${fmt(report[k], k === 'science' ? 1 : 0)}</b></span>`).join('')}</div>` : `<p class="micro-text">${safe(t('reportEmpty'))}</p>`}
        <div class="objective-card"><div class="objective-icon">✧</div><div><small>${safe(t('victoryGoal'))}</small><b>${fmt(state.resources.influence)} / 100</b><div class="meter"><span style="width:${Math.min(100, state.resources.influence)}%"></span></div></div></div>`;
    }
    if (tab === 'build') {
      const city = this.getSelectedOwnedCity();
      return `<div class="section-heading"><span class="eyebrow">${safe(t('build'))}</span><h3>${safe(t('buildTitle'))}</h3><p>${safe(t('buildHint'))}</p></div>${city ? `<div class="selected-city-strip"><span class="city-symbol">⌂</span><div><b>${safe(this.localized(city.name))}</b><small>${safe(t('structures'))}: ${getStructuresForCity(state, city.id).length}/5</small></div></div>` : `<div class="empty-callout">${safe(t('noCityOwned'))}</div>`}
        <div class="build-list">${Object.values(STRUCTURES).map(def => `<article class="build-card"><div class="build-icon" style="--build-color:${def.color}">${def.icon}</div><div class="build-copy"><b>${safe(this.localized(def.name))}</b><p>${safe(this.localized(def.desc))}</p><div class="cost-row">${this.costHTML(def.cost)}</div></div><button class="small-action" data-action="build" data-type="${def.id}" ${(!city || !canAfford(state, def.cost) || getStructuresForCity(state, city.id).length >= 5) ? 'disabled' : ''}>${safe(t('build'))}</button></article>`).join('')}</div>`;
    }
    if (tab === 'research') {
      const activeTech = TECHNOLOGIES.find(x => x.id === state.currentResearch);
      const techCards = TECHNOLOGIES.map(tech => {
        const done = state.completedResearch.includes(tech.id); const prereq = tech.prerequisites.every(p => state.completedResearch.includes(p)); const isActive = state.currentResearch === tech.id;
        const locked = !done && !prereq;
        return `<article class="tech-card ${done ? 'done' : ''} ${isActive ? 'in-progress' : ''}"><div class="tech-card-top"><span class="tech-branch">${safe(tech.branch.toUpperCase())}</span><span class="tech-cost">⌘ ${tech.cost}</span></div><b>${safe(this.localized(tech.name))}</b><div class="tech-effect">${safe(this.effectText(tech.effect))}</div>${isActive ? `<div class="meter purple"><span style="width:${Math.min(100, state.researchProgress / tech.cost * 100)}%"></span></div>` : ''}<button class="text-action" data-action="research" data-tech="${tech.id}" ${done || locked || !!state.currentResearch ? 'disabled' : ''}>${done ? safe(t('researched')) : isActive ? safe(t('researching')) : locked ? safe(t('locked')) : safe(t('researchNow'))}</button></article>`;
      }).join('');
      return `<div class="section-heading"><span class="eyebrow">${safe(t('research'))}</span><h3>${safe(t('researchTitle'))}</h3><p>${safe(t('researchHint'))}</p></div>${activeTech ? `<div class="active-research-banner"><span>⌘</span><div class="grow"><b>${safe(this.localized(activeTech.name))}</b><small>${fmt(state.researchProgress)} / ${activeTech.cost} science</small><div class="meter purple"><span style="width:${Math.min(100, state.researchProgress / activeTech.cost * 100)}%"></span></div></div></div>` : `<div class="empty-mini">${safe(t('noResearch'))}</div>`}<div class="tech-list">${techCards}</div>`;
    }
    if (tab === 'diplomacy') {
      const rivals = state.nations.filter(n => !n.isPlayer);
      return `<div class="section-heading"><span class="eyebrow">${safe(t('diplomacy'))}</span><h3>${safe(t('diplomacyTitle'))}</h3><p>${safe(t('diplomacyHint'))}</p></div><div class="diplomacy-list">${rivals.map(n => {
        const rel = state.relations[n.id] ?? 0; const treaty = state.treaties.filter(x => x.nationId === n.id).map(x => x.type);
        return `<article class="nation-row"><div class="nation-row-head"><span class="nation-swatch" style="--nation-color:${n.color}"></span><div class="grow"><b>${safe(this.localized(n.name))}</b><small>${safe(n.government)}</small></div><span class="relation-score ${rel >= 25 ? 'good' : rel < -20 ? 'bad' : ''}">${rel > 0 ? '+' : ''}${rel}</span></div><div class="relation-bar"><span style="width:${(rel + 100) / 2}%;--nation-color:${n.color}"></span></div><div class="treaty-labels">${treaty.length ? treaty.map(x => `<span>${safe(x === 'trade' ? t('proposeTrade') : t('proposeAlliance'))}</span>`).join('') : `<span>${safe(t(rel < -20 ? 'rival' : rel >= 25 ? 'ally' : 'neutral'))}</span>`}</div><div class="diplomacy-actions"><button data-action="diplomacy" data-nation="${n.id}" data-kind="envoy" ${state.resources.credits < 50 ? 'disabled' : ''}>${safe(t('improveRelations'))} · 50 ◈</button><button data-action="diplomacy" data-nation="${n.id}" data-kind="trade" ${state.resources.credits < 130 || treaty.includes('trade') ? 'disabled' : ''}>${safe(t('proposeTrade'))}</button><button data-action="diplomacy" data-nation="${n.id}" data-kind="alliance" ${state.resources.credits < 260 || treaty.includes('alliance') || rel < 5 ? 'disabled' : ''}>${safe(t('proposeAlliance'))}</button></div></article>`;
      }).join('')}</div>`;
    }
    if (tab === 'military') {
      const rivals = state.nations.filter(n => !n.isPlayer);
      return `<div class="section-heading"><span class="eyebrow">${safe(t('military'))}</span><h3>${safe(t('militaryTitle'))}</h3><p>${safe(t('militaryHint'))}</p></div><div class="army-overview"><div class="army-crest">⬟</div><div class="grow"><div class="army-power">${fmt(state.military)} <small>${safe(t('armyStrength'))}</small></div><div class="meter red"><span style="width:${Math.min(100, state.military / 600 * 100)}%"></span></div><div class="micro-text">${safe(t('morale'))} ${state.morale}% · ${safe(t('defence'))} ${state.resources.defence}</div></div></div><button class="primary-action full" data-action="recruit" ${state.resources.credits < 180 || state.resources.food < 8 || state.military >= 600 ? 'disabled' : ''}>＋ ${safe(t('recruit'))} <span>180 ◈ · 8 ✦</span></button><div class="subsection-title">${safe(t('rival'))} ${safe(t('military'))}</div>${rivals.map(n => `<article class="rival-card"><div class="nation-row-head"><span class="nation-swatch" style="--nation-color:${n.color}"></span><div class="grow"><b>${safe(this.localized(n.name))}</b><small>${safe(n.doctrine)}</small></div></div><div class="rival-stats"><span>${safe(t('armyStrength'))}<b>${fmt(n.military)}</b></span><span>${safe(t('relations'))}<b>${state.relations[n.id] ?? 0}</b></span></div><button class="danger-action full" data-action="start-battle" data-nation="${n.id}" ${state.military < 90 || state.battle ? 'disabled' : ''}>${safe(t('launchBattle'))} →</button></article>`).join('')}`;
    }
    if (tab === 'events') {
      const events = state.events;
      const log = state.log;
      return `<div class="section-heading"><span class="eyebrow">${safe(t('events'))}</span><h3>${safe(t('eventsTitle'))}</h3><p>${safe(t('eventsHint'))}</p></div><div class="subsection-title">${safe(t('events'))}</div>${events.length ? events.map(ev => `<article class="event-card"><div class="event-icon">${ev.icon}</div><div><b>${safe(this.localized(ev.title))}</b><p>${safe(this.localized(ev.text))}</p><small>${safe(t('turnLabel'))} ${ev.turn}</small></div></article>`).join('') : `<div class="empty-mini">${safe(t('noEvents'))}</div>`}<div class="subsection-title">${safe(t('lastReport'))}</div><div class="chronicle">${log.slice(0, 12).map(item => `<div class="chronicle-row"><span class="chronicle-dot ${safe(item.kind)}"></span><div><small>${safe(t('turnLabel'))} ${item.turn}</small><p>${safe(item.text)}</p></div></div>`).join('')}</div>`;
    }
    return '';
  }

  renderBattlePanel() {
    const battle = this.state.battle; const t = this.t.bind(this);
    if (!battle) return `<div class="section-heading"><h3>${safe(t('noActiveBattle'))}</h3></div>`;
    const enemy = getNation(this.state, battle.enemyId);
    if (battle.finished) {
      const resultLabel = battle.result === 'victory' ? t('victory') : battle.result === 'defeat' ? t('defeat') : battle.result === 'retreat' ? t('retreat') : t('stalemate');
      return `<div class="section-heading"><span class="eyebrow">${safe(t('battleTitle'))}</span><h3>${safe(resultLabel)}</h3><p>${safe(this.localized(enemy?.name))}</p></div><div class="battle-result-symbol ${battle.result}">${battle.result === 'victory' ? '✦' : battle.result === 'retreat' ? '↶' : '⚑'}</div><div class="battle-summary"><div><small>${safe(t('playerForces'))}</small><b>${fmt(battle.playerStrength)}</b></div><div><small>${safe(t('enemyForces'))}</small><b>${fmt(battle.enemyStrength)}</b></div></div><div class="subsection-title">${safe(t('events'))}</div><div class="battle-history">${battle.history.map(line => `<p>${safe(line)}</p>`).join('')}</div><button class="primary-action full" data-action="continue-battle">${safe(t('continueWorld'))} →</button>`;
    }
    return `<div class="section-heading"><span class="eyebrow">${safe(t('battleTitle'))}</span><h3>${safe(this.localized(enemy?.name))}</h3><p>${safe(battle.terrain)} · ${safe(t('battleRound'))} ${battle.round}</p></div><div class="battle-strengths"><div class="force-card friendly"><small>${safe(t('playerForces'))}</small><b>${fmt(battle.playerStrength)}</b><div class="meter"><span style="width:${Math.max(0, battle.playerStrength / battle.playerStart * 100)}%"></span></div></div><div class="force-card enemy"><small>${safe(t('enemyForces'))}</small><b>${fmt(battle.enemyStrength)}</b><div class="meter red"><span style="width:${Math.max(0, battle.enemyStrength / battle.enemyStart * 100)}%"></span></div></div></div><div class="battle-tip">${safe(t('battleTip'))}</div><div class="battle-actions"><button data-action="battle-action" data-kind="advance"><span>➜</span><b>${safe(t('advance'))}</b><small>High pressure</small></button><button data-action="battle-action" data-kind="hold"><span>⬟</span><b>${safe(t('hold'))}</b><small>Lower losses</small></button><button data-action="battle-action" data-kind="flank"><span>↗</span><b>${safe(t('flank'))}</b><small>High risk</small></button><button data-action="battle-action" data-kind="artillery" ${this.state.resources.credits < 85 || this.state.resources.energy < 8 ? 'disabled' : ''}><span>✣</span><b>${safe(t('artillery'))}</b><small>85 ◈ · 8 ϟ</small></button><button class="retreat-button" data-action="battle-action" data-kind="retreat"><span>↶</span><b>${safe(t('retreat'))}</b></button></div><div class="subsection-title">${safe(t('events'))}</div><div class="battle-history">${battle.history.map(line => `<p>${safe(line)}</p>`).join('')}</div>`;
  }

  renderRightPanel() {
    const t = this.t.bind(this);
    if (this.state.mode === 'battle' && this.state.battle) {
      const battle = this.state.battle; const enemy = getNation(this.state, battle.enemyId);
      this.right.innerHTML = `<div class="inspector-header"><span class="eyebrow">${safe(t('battleMode'))}</span><h2>${safe(battle.terrain)}</h2><p>${safe(this.localized(enemy?.name))}</p></div><div class="inspector-section"><div class="subsection-title">${safe(t('battleRound'))}</div><div class="big-number">${battle.round.toString().padStart(2,'0')}</div><div class="micro-text">${safe(t('morale'))}: ${battle.playerMorale}% vs ${battle.enemyMorale}%</div></div><div class="inspector-section"><div class="subsection-title">${safe(t('lastReport'))}</div>${battle.history.slice(0, 4).map((line, i) => `<p class="inspector-note">${safe(line)}</p>`).join('')}</div><div class="inspector-footer">${safe(t('battleTip'))}</div>`;
      return;
    }
    const tile = this.getSelectedTile();
    if (!tile) {
      this.right.innerHTML = `<div class="inspector-empty"><div class="empty-orbit">⌖</div><span class="eyebrow">${safe(t('selected'))}</span><h2>${safe(t('noSelection'))}</h2><p>${safe(t('helpControls'))}</p></div><div class="inspector-section"><div class="subsection-title">${safe(t('actions'))}</div><button class="utility-action full" data-action="tab" data-tab="build">⌂ ${safe(t('build'))}</button><button class="utility-action full" data-action="tab" data-tab="research">⌘ ${safe(t('research'))}</button></div><div class="inspector-footer">${safe(t('helpText'))}</div>`;
      return;
    }
    const owner = getNation(this.state, tile.ownerId);
    const city = tile.cityId ? getCity(this.state, tile.cityId) : null;
    const structures = city ? getStructuresForCity(this.state, city.id) : [];
    const own = tile.ownerId === 'aurelia';
    const terrainNames = { grass: { en: 'Temperate plain', fa: 'دشت معتدل', zh: '温带平原' }, forest: { en: 'Dense forest', fa: 'جنگل انبوه', zh: '茂密森林' }, highland: { en: 'Highland', fa: 'ارتفاعات', zh: '高地' }, desert: { en: 'Arid basin', fa: 'حوضه خشک', zh: '干旱盆地' }, tundra: { en: 'Cold upland', fa: 'ارتفاعات سرد', zh: '寒冷高地' } };
    this.right.innerHTML = `<div class="inspector-header"><span class="eyebrow">${safe(t('selected'))}</span><h2>${safe(city ? this.localized(city.name) : `${safe(this.localized(owner?.name))} · ${tile.row + 1}.${tile.col + 1}`)}</h2><p><span class="nation-swatch inline" style="--nation-color:${owner?.color || '#b9c9d4'}"></span>${safe(this.localized(owner?.name))}</p></div><div class="inspector-section"><div class="detail-pair"><span>${safe(t('terrain'))}</span><b>${safe(this.localized(terrainNames[tile.terrain]))}</b></div><div class="detail-pair"><span>${safe(t('owner'))}</span><b>${safe(this.localized(owner?.name))}</b></div>${city ? `<div class="detail-pair"><span>${safe(t('population'))}</span><b>${fmt(city.population,2)}M</b></div><div class="detail-pair"><span>${safe(t('cityLevel'))}</span><b>LVL ${city.level}</b></div><div class="detail-pair"><span>${safe(t('specialism'))}</span><b>${safe(city.type.toUpperCase())}</b></div>` : `<div class="detail-pair"><span>${safe(t('city'))}</span><b>${safe(t('noCity'))}</b></div>`}</div><div class="inspector-section"><div class="subsection-title">${safe(t('structures'))}<span class="count-chip">${structures.length}${city ? '/5' : ''}</span></div>${structures.length ? structures.map(s => { const def = STRUCTURES[s.type]; return `<div class="structure-line"><span style="color:${def?.color || '#d8b56d'}">${def?.icon || '⌂'}</span><div><b>${safe(this.localized(def?.name))}</b><small>${safe(this.localized(def?.desc))}</small></div></div>`; }).join('') : `<p class="micro-text">—</p>`}</div><div class="inspector-section"><div class="subsection-title">${safe(t('actions'))}</div>${own && city ? `<button class="primary-action full" data-action="tab" data-tab="build">⌂ ${safe(t('build'))} <span>↗</span></button>` : `<button class="utility-action full" data-action="tab" data-tab="diplomacy">⇄ ${safe(t('diplomacy'))}</button>`}${own ? `<button class="utility-action full" data-action="tab" data-tab="military">⬟ ${safe(t('military'))}</button>` : `<button class="danger-action full" data-action="start-battle" data-nation="${owner?.id}" ${this.state.military < 90 ? 'disabled' : ''}>⚑ ${safe(t('launchBattle'))}</button>`}</div><div class="inspector-footer">${safe(own ? t('helpText') : t('diplomacyHint'))}</div>`;
  }

  renderCommandBar() {
    const t = this.t.bind(this);
    const victory = this.state.victory;
    const context = this.state.mode === 'battle' ? `${safe(t('battleMode'))} · ${safe(this.localized(getNation(this.state, this.state.battle?.enemyId)?.name))}` : `${safe(t('worldMap'))} · ${safe(this.localized(getPlayerNation(this.state).name))}`;
    this.commandBar.innerHTML = `<div class="command-context"><span class="command-indicator"></span><div><small>${safe(t('turnLabel'))} ${this.state.turn.toString().padStart(2,'0')} · ${safe(t('year'))} ${this.state.year.toString().padStart(2,'0')}</small><b>${context}</b>${victory ? `<em>${safe(t('victory'))}</em>` : ''}</div></div><div class="command-actions"><button class="subtle-button" data-action="new-game">${safe(t('newGame'))}</button><button class="subtle-button" data-action="export-save">⇩ ${safe(t('saveFile'))}</button><button class="subtle-button" data-action="import-save">⇧ ${safe(t('importSave'))}</button>${this.state.mode === 'strategic' ? `<button class="primary-action end-turn" data-action="end-turn">${safe(t('endTurn'))} <span>→</span></button>` : `<span class="battle-running">● ${safe(t('battleMode'))}</span>`}</div>`;
  }

  getSelectedTile() { return this.world.tileById.get(this.state.selectedTileId) ?? null; }
  getSelectedCity() { const tile = this.getSelectedTile(); return tile?.cityId ? getCity(this.state, tile.cityId) : null; }
  getSelectedOwnedCity() { const city = this.getSelectedCity(); return city?.nationId === 'aurelia' ? city : null; }

  costHTML(cost) {
    const symbols = { credits: '◈', food: '✦', energy: 'ϟ', science: '⌘', stability: '◉' };
    return Object.entries(cost).map(([k, v]) => `<span class="cost-token ${this.state.resources[k] < v ? 'unaffordable' : ''}">${symbols[k] || k} ${v}</span>`).join('');
  }

  effectText(effect) {
    const names = { credits: 'Treasury', food: 'Food', energy: 'Energy', science: 'Science', stability: 'Stability', influence: 'Influence', defence: 'Defence', industry: 'Industry' };
    return Object.entries(effect).map(([key, value]) => `${value > 0 ? '+' : ''}${value} ${names[key] || key}`).join(' · ');
  }

  handleAction(action, data = {}) {
    const t = this.t.bind(this);
    switch (action) {
      case 'tab': this.state.activeTab = data.tab; break;
      case 'zoom-in': this.world.zoom('in'); break;
      case 'zoom-out': this.world.zoom('out'); break;
      case 'reset-camera': this.world.resetCamera(); break;
      case 'toggle-labels': this.state.showLabels = !this.state.showLabels; this.state.worldVersion += 1; break;
      case 'build': {
        const city = this.getSelectedOwnedCity();
        if (!city) { this.toast(t('noCityOwned'), 'error'); return; }
        const result = buildStructure(this.state, city.id, data.type);
        if (!result.ok) { this.toast(result.reason === 'resources' ? t('insufficient') : result.reason === 'limit' ? t('buildLimit') : t('noCityOwned'), 'error'); return; }
        this.toast(t('built'), 'success'); break;
      }
      case 'research': {
        const result = startResearch(this.state, data.tech);
        if (!result.ok) { this.toast(result.reason === 'resources' ? t('insufficient') : t('researchHint'), 'error'); return; }
        this.toast(t('researchStarted'), 'success'); break;
      }
      case 'diplomacy': {
        const result = performDiplomacy(this.state, data.nation, data.kind);
        if (!result.ok) { this.toast(result.reason === 'resources' ? t('insufficient') : t('diplomacyHint'), 'error'); return; }
        this.toast(data.kind === 'envoy' ? t('diplomacyBoost') : data.kind === 'trade' ? t('tradeStarted') : t('allianceStarted'), 'success'); break;
      }
      case 'recruit': {
        const result = recruitInfantry(this.state);
        if (!result.ok) { this.toast(result.reason === 'resources' ? t('insufficient') : t('unitLimit'), 'error'); return; }
        this.toast(t('recruitDone'), 'success'); break;
      }
      case 'start-battle': {
        const nationId = data.nation || this.getSelectedTile()?.ownerId;
        if (!nationId || nationId === 'aurelia') { this.toast(t('selectRival'), 'error'); return; }
        const result = startBattle(this.state, nationId);
        if (!result.ok) { this.toast(result.reason === 'resources' ? t('insufficient') : t('selectRival'), 'error'); return; }
        this.state.activeTab = 'military'; this.world.resetCamera(); break;
      }
      case 'battle-action': {
        const result = battleAction(this.state, data.kind);
        if (!result.ok) { this.toast(result.reason === 'resources' ? t('insufficient') : t('noActiveBattle'), 'error'); return; }
        if (result.finished) this.toast(result.result === 'victory' ? t('battleWon') : result.result === 'defeat' ? t('battleLost') : t('stalemate'), result.result === 'victory' ? 'success' : 'info');
        this.world.resetCamera(); break;
      }
      case 'continue-battle': continueAfterBattle(this.state); this.state.activeTab = 'military'; this.world.resetCamera(); break;
      case 'end-turn': {
        const result = advanceTurn(this.state);
        if (!result.ok) { this.toast(t('noActiveBattle'), 'error'); return; }
        this.toast(t('turnAdvanced'), 'success'); break;
      }
      case 'export-save': this.downloadSave(); return;
      case 'import-save': this.fileInput.click(); return;
      case 'new-game': this.showConfirmNewGame(); return;
      case 'dismiss-modal': this.modalRoot.innerHTML = ''; return;
      case 'confirm-new-game': this.resetGame(); return;
      default: return;
    }
    this.render();
  }

  onTileSelected(tile) {
    this.state.selectedTileId = tile.id;
    const city = tile.cityId ? getCity(this.state, tile.cityId) : null;
    if (city?.nationId === 'aurelia') this.state.activeTab = 'overview';
    this.render();
  }

  saveLocal() {
    try { localStorage.setItem('eclipse-age-of-sovereigns-save-v1', exportSave(this.state)); this.toast(this.t('saved'), 'success'); }
    catch { this.toast(this.t('importError'), 'error'); }
  }

  loadLocal() {
    try {
      const text = localStorage.getItem('eclipse-age-of-sovereigns-save-v1');
      if (!text) { this.toast(this.t('noSave'), 'info'); return; }
      const result = importSave(text); if (!result.ok) throw new Error('invalid-save');
      this.replaceState(result.state); this.toast(this.t('loaded'), 'success');
    } catch { this.toast(this.t('importError'), 'error'); }
  }

  downloadSave() {
    const blob = new Blob([exportSave(this.state)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob); const link = document.createElement('a');
    link.href = url; link.download = `eclipse-save-turn-${this.state.turn}.json`; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000); this.toast(this.t('gameSaved'), 'success');
  }

  replaceState(newState) {
    this.state = newState;
    if (!this.state.language) this.state.language = 'en';
    this.syncLanguage(); this.render();
  }

  resetGame() {
    this.modalRoot.innerHTML = '';
    // Reloading the page starts a clean state without leaving stale Three.js objects around.
    localStorage.removeItem('eclipse-age-of-sovereigns-save-v1');
    window.location.reload();
  }

  showConfirmNewGame() {
    this.modalRoot.innerHTML = `<div class="modal-backdrop"><section class="modal-card"><div class="modal-symbol">☼</div><span class="eyebrow">ECLIPSE</span><h2>${safe(this.t('newGame'))}</h2><p>${safe(this.t('confirmNewGame'))}</p><div class="modal-actions"><button class="subtle-button" data-action="dismiss-modal">${safe(this.t('cancel'))}</button><button class="primary-action" data-action="confirm-new-game">${safe(this.t('yes'))}</button></div></section></div>`;
  }

  showHelp() {
    this.modalRoot.innerHTML = `<div class="modal-backdrop"><section class="modal-card help-modal"><button class="modal-close" data-action="dismiss-modal">×</button><div class="modal-symbol">⌖</div><span class="eyebrow">ECLIPSE · ${safe(this.t('helpTitle'))}</span><h2>${safe(this.t('helpTitle'))}</h2><p>${safe(this.t('helpText'))}</p><div class="help-steps"><div><b>01</b><span>${safe(this.t('build'))} / ${safe(this.state.language === 'fa' ? 'اقتصاد' : this.state.language === 'zh' ? '经济' : 'Economy')}</span></div><div><b>02</b><span>${safe(this.t('research'))}</span></div><div><b>03</b><span>${safe(this.t('diplomacy'))}</span></div><div><b>04</b><span>${safe(this.t('military'))} · ${safe(this.t('launchBattle'))}</span></div></div><p class="copyright-note">${safe(this.t('creatorCredit'))}</p><div class="modal-actions"><button class="primary-action" data-action="dismiss-modal">${safe(this.t('close'))}</button></div></section></div>`;
  }

  toast(message, type = 'info') {
    this.activeToast = { message, type };
    this.renderToast();
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => { this.activeToast = null; const region = document.getElementById('toast-region'); if (region) region.innerHTML = ''; }, 2800);
  }

  renderToast() {
    const region = document.getElementById('toast-region'); if (!region || !this.activeToast) return;
    region.innerHTML = `<div class="toast ${this.activeToast.type}"><span>${this.activeToast.type === 'success' ? '✓' : this.activeToast.type === 'error' ? '!' : '✧'}</span><b>${safe(this.activeToast.message)}</b></div>`;
  }
}
