export const RESOURCE_META = [
  { key: 'credits', icon: '◈', color: '#e6c77a', label: { en: 'Treasury', fa: 'خزانه', zh: '国库' } },
  { key: 'food', icon: '✦', color: '#8ccf8b', label: { en: 'Food', fa: 'غذا', zh: '粮食' } },
  { key: 'energy', icon: 'ϟ', color: '#80ccf4', label: { en: 'Energy', fa: 'انرژی', zh: '能源' } },
  { key: 'science', icon: '⌘', color: '#b6a0ff', label: { en: 'Science', fa: 'پژوهش', zh: '科研' } },
  { key: 'stability', icon: '◉', color: '#ed9d96', label: { en: 'Stability', fa: 'ثبات', zh: '稳定度' } },
  { key: 'influence', icon: '✧', color: '#e9b3dc', label: { en: 'Influence', fa: 'نفوذ', zh: '影响力' } },
];

export const NATIONS = [
  { id: 'aurelia', name: { en: 'Aurelia', fa: 'آورلیا', zh: '奥瑞利亚' }, adjective: { en: 'Aurelian', fa: 'آورلیایی', zh: '奥瑞利亚' }, color: '#d8b56d', center: [-7, 0], government: 'Constitutional Republic', doctrine: 'Balanced Development', leader: 'Chancellor Elian Voss', isPlayer: true },
  { id: 'veyra', name: { en: 'Veyra Compact', fa: 'اتحاد ویرا', zh: '维拉协约国' }, adjective: { en: 'Veyran', fa: 'ویرایی', zh: '维拉' }, color: '#7aa9d9', center: [-1, -4], government: 'Technocratic Council', doctrine: 'Research First', leader: 'Director Maelis Ren', isPlayer: false },
  { id: 'kharad', name: { en: 'Kharad Dominion', fa: 'قلمرو خَراد', zh: '卡拉德领' }, adjective: { en: 'Kharadi', fa: 'خرادی', zh: '卡拉德' }, color: '#d77d75', center: [6, -1], government: 'Crown Dominion', doctrine: 'Armed Neutrality', leader: 'Regent Soren Kael', isPlayer: false },
  { id: 'orinth', name: { en: 'Orinth League', fa: 'اتحادیه اورینث', zh: '奥林斯联盟' }, adjective: { en: 'Orinthian', fa: 'اورینثی', zh: '奥林斯' }, color: '#80b89a', center: [1, 5], government: 'Federal Assembly', doctrine: 'Trade and Prosperity', leader: 'First Speaker Nira Sol', isPlayer: false },
];

export const CITIES = [
  { id: 'aurelia-city', name: { en: 'Aurelia Prime', fa: 'آورلیا پایتخت', zh: '奥瑞利亚首都' }, nationId: 'aurelia', position: [-7, 0], population: 1.35, type: 'capital', level: 2 },
  { id: 'sable-port', name: { en: 'Sable Port', fa: 'بندر سابل', zh: '黑沙港' }, nationId: 'aurelia', position: [-9, 1], population: 0.62, type: 'port', level: 1 },
  { id: 'goldmere', name: { en: 'Goldmere', fa: 'گلدِمیر', zh: '金沼城' }, nationId: 'aurelia', position: [-5, 1], population: 0.81, type: 'industrial', level: 1 },
  { id: 'veyra-city', name: { en: 'Veyra Spire', fa: 'برج ویرا', zh: '维拉尖塔' }, nationId: 'veyra', position: [-1, -4], population: 1.18, type: 'capital', level: 2 },
  { id: 'glasshaven', name: { en: 'Glasshaven', fa: 'گلس‌هیون', zh: '玻璃港' }, nationId: 'veyra', position: [0, -2], population: 0.54, type: 'research', level: 1 },
  { id: 'kharad-city', name: { en: 'Kharad Gate', fa: 'دروازه خراد', zh: '卡拉德之门' }, nationId: 'kharad', position: [6, -1], population: 1.42, type: 'capital', level: 2 },
  { id: 'redmesa', name: { en: 'Redmesa', fa: 'ردمسا', zh: '红台城' }, nationId: 'kharad', position: [7, 1], population: 0.73, type: 'military', level: 1 },
  { id: 'orinth-city', name: { en: 'Orinth', fa: 'اورینث', zh: '奥林斯' }, nationId: 'orinth', position: [1, 5], population: 1.05, type: 'capital', level: 2 },
  { id: 'meadowfall', name: { en: 'Meadowfall', fa: 'میدوفال', zh: '草原城' }, nationId: 'orinth', position: [-1, 6], population: 0.68, type: 'agriculture', level: 1 },
];

export const STRUCTURES = {
  farm: { id: 'farm', icon: '✦', name: { en: 'Hydroponic Farm', fa: 'مزرعه هیدروپونیک', zh: '水培农场' }, desc: { en: '+14 food each turn', fa: 'هر نوبت ۱۴ واحد غذا', zh: '每回合 +14 粮食' }, cost: { credits: 140, energy: 4 }, effect: { food: 14 }, color: '#8ccf8b' },
  factory: { id: 'factory', icon: '▥', name: { en: 'Smart Factory', fa: 'کارخانه هوشمند', zh: '智能工厂' }, desc: { en: '+110 credits and +3 industrial power each turn', fa: 'هر نوبت ۱۱۰ اعتبار و ۳ ظرفیت صنعتی', zh: '每回合 +110 资金及 +3 工业能力' }, cost: { credits: 260, energy: 8 }, effect: { credits: 110, industry: 3 }, color: '#d5b57a' },
  lab: { id: 'lab', icon: '⌘', name: { en: 'Research Institute', fa: 'مؤسسه پژوهشی', zh: '研究院' }, desc: { en: '+8 science each turn', fa: 'هر نوبت ۸ واحد پژوهش', zh: '每回合 +8 科研' }, cost: { credits: 220, energy: 6 }, effect: { science: 8 }, color: '#b6a0ff' },
  power: { id: 'power', icon: 'ϟ', name: { en: 'Fusion Generator', fa: 'مولد همجوشی', zh: '聚变发电站' }, desc: { en: '+18 energy each turn', fa: 'هر نوبت ۱۸ واحد انرژی', zh: '每回合 +18 能源' }, cost: { credits: 300 }, effect: { energy: 18 }, color: '#80ccf4' },
  civic: { id: 'civic', icon: '⌂', name: { en: 'Civic Centre', fa: 'مرکز خدمات شهری', zh: '市政中心' }, desc: { en: '+4 stability each turn', fa: 'هر نوبت ۴ واحد ثبات', zh: '每回合 +4 稳定度' }, cost: { credits: 210, food: 5 }, effect: { stability: 4 }, color: '#ed9d96' },
  barracks: { id: 'barracks', icon: '⬟', name: { en: 'Defence Academy', fa: 'آکادمی دفاعی', zh: '国防学院' }, desc: { en: '+20 defence strength and +2 influence each turn', fa: '۲۰ قدرت دفاعی و هر نوبت ۲ نفوذ', zh: '防御力 +20，每回合 +2 影响力' }, cost: { credits: 280, energy: 5 }, effect: { defence: 20, influence: 2 }, color: '#d77d75' },
};

const TECH_SEEDS = [
  ['civic-grid', 'Civic Data Grid', 'شبکه داده شهری', '城市数据网', 'industry', 80, { credits: 70, stability: 2 }],
  ['precision-agriculture', 'Precision Agriculture', 'کشاورزی دقیق', '精准农业', 'agriculture', 90, { food: 18 }],
  ['modular-reactors', 'Modular Reactors', 'راکتورهای ماژولار', '模块化反应堆', 'energy', 100, { energy: 18 }],
  ['applied-machine-learning', 'Applied Machine Learning', 'یادگیری ماشین کاربردی', '应用机器学习', 'science', 110, { science: 5 }],
  ['composite-armour', 'Composite Armour', 'زره کامپوزیتی', '复合装甲', 'military', 100, { defence: 18 }],
  ['logistics-networks', 'Predictive Logistics', 'لجستیک پیش‌بینانه', '预测物流', 'industry', 90, { credits: 90 }],
  ['public-health', 'Public Health Networks', 'شبکه سلامت عمومی', '公共卫生网络', 'medical', 85, { stability: 5 }],
  ['trade-standards', 'Open Trade Standards', 'استانداردهای تجارت باز', '开放贸易标准', 'economy', 80, { credits: 120, influence: 3 }],
  ['quantum-sensors', 'Quantum Sensor Arrays', 'آرایه حسگر کوانتومی', '量子传感阵列', 'intelligence', 125, { influence: 5 }],
  ['autonomous-drones', 'Autonomous Recon Drones', 'پهپادهای شناسایی خودمختار', '自主侦察无人机', 'military', 140, { defence: 24 }],
  ['orbital-navigation', 'Orbital Navigation', 'ناوبری مداری', '轨道导航', 'space', 160, { influence: 7 }],
  ['advanced-batteries', 'Solid-State Batteries', 'باتری‌های حالت جامد', '固态电池', 'energy', 120, { energy: 25 }],
  ['circular-industry', 'Circular Industry', 'صنعت چرخه‌ای', '循环工业', 'industry', 150, { credits: 130, energy: 5 }],
  ['diplomatic-corps', 'Diplomatic Corps', 'سپاه دیپلماسی', '外交体系', 'diplomacy', 100, { influence: 8 }],
  ['network-security', 'Resilient Cyber Systems', 'سامانه‌های سایبری تاب‌آور', '韧性网络系统', 'security', 130, { stability: 3, influence: 4 }],
  ['hydroponic-expansion', 'Vertical Hydroponics', 'کشت عمودی هیدروپونیک', '垂直水培', 'agriculture', 145, { food: 24 }],
  ['precision-medicine', 'Precision Medicine', 'پزشکی دقیق', '精准医疗', 'medical', 170, { stability: 6 }],
  ['next-gen-materials', 'Next-Generation Materials', 'مواد نسل آینده', '新一代材料', 'science', 180, { credits: 100, defence: 10 }],
  ['strategic-command', 'Integrated Strategic Command', 'فرماندهی راهبردی یکپارچه', '一体化战略指挥', 'military', 190, { defence: 35 }],
  ['fusion-breakthrough', 'Commercial Fusion', 'همجوشی تجاری', '商业聚变', 'energy', 220, { energy: 35, credits: 100 }],
  ['cultural-exchange', 'Cultural Exchange Network', 'شبکه تبادل فرهنگی', '文化交流网络', 'diplomacy', 110, { influence: 10, stability: 2 }],
  ['deep-learning-labs', 'Distributed AI Laboratories', 'آزمایشگاه‌های هوش مصنوعی توزیع‌شده', '分布式人工智能实验室', 'science', 200, { science: 8 }],
  ['coastal-engineering', 'Coastal Engineering', 'مهندسی سواحل', '海岸工程', 'infrastructure', 120, { credits: 90, stability: 2 }],
  ['resilient-crops', 'Climate-Resilient Crops', 'محصولات مقاوم به اقلیم', '气候适应型作物', 'agriculture', 185, { food: 30 }],
];
export const TECHNOLOGIES = TECH_SEEDS.map(([id, name, fa, zh, branch, cost, effect], index) => ({
  id, name: { en: name, fa, zh }, branch, cost, effect,
  prerequisites: index === 0 ? [] : (index % 5 === 0 ? [TECH_SEEDS[index - 1][0]] : []),
}));

export const EVENTS = [
  { id: 'market-rally', icon: '↗', title: { en: 'Market Rally', fa: 'رونق بازار', zh: '市场回暖' }, text: { en: 'Investor confidence rises across the capital markets.', fa: 'اعتماد سرمایه‌گذاران در بازارها افزایش می‌یابد.', zh: '资本市场的投资者信心上升。' }, effect: { credits: 180, stability: 2 } },
  { id: 'dry-season', icon: '☼', title: { en: 'Unusually Dry Season', fa: 'فصل خشک غیرمعمول', zh: '异常干旱季' }, text: { en: 'A dry season pressures farms and water reserves.', fa: 'فصل خشک به مزارع و ذخایر آب فشار وارد می‌کند.', zh: '干旱季节给农田和水资源带来压力。' }, effect: { food: -18, stability: -2 } },
  { id: 'scientific-grant', icon: '✧', title: { en: 'Scientific Grant', fa: 'کمک‌هزینه علمی', zh: '科研资助' }, text: { en: 'A research consortium offers your laboratories new funding.', fa: 'یک کنسرسیوم پژوهشی بودجه تازه‌ای به آزمایشگاه‌ها می‌دهد.', zh: '一个科研联盟为你的实验室提供新资金。' }, effect: { science: 15, credits: 60 } },
  { id: 'port-strike', icon: '⚑', title: { en: 'Port Workers Strike', fa: 'اعتصاب کارگران بندر', zh: '港口工人罢工' }, text: { en: 'Trade slows as port workers demand better conditions.', fa: 'در پی مطالبه شرایط بهتر، تجارت کند می‌شود.', zh: '港口工人要求改善待遇，贸易因此放缓。' }, effect: { credits: -90, stability: -4 } },
  { id: 'rare-earth', icon: '◈', title: { en: 'Rare-Earth Discovery', fa: 'کشف عناصر کمیاب', zh: '发现稀土矿' }, text: { en: 'Survey teams identify a promising new mineral deposit.', fa: 'گروه‌های اکتشاف ذخیره معدنی امیدبخشی پیدا می‌کنند.', zh: '勘探队发现了有潜力的新矿藏。' }, effect: { credits: 120, influence: 3 } },
];

export const TEXT = {
  en: {
    creatorCredit: 'Created by Hamid Yareli · Copyright © 2026. All rights reserved.',
    overview: 'Overview', build: 'Construction', research: 'Research', diplomacy: 'Diplomacy', military: 'Military', events: 'Chronicle',
    yourNation: 'YOUR NATION', publicApproval: 'Public approval', turn: 'TURN', endTurn: 'Advance Turn', income: 'TURN INCOME', expenses: 'UPKEEP',
    overviewTitle: 'Aurelia at a glance', overviewBody: 'Every turn is a choice. Invest in resilience, secure your borders, and earn the trust of your neighbours.',
    citizens: 'Citizens', cities: 'Cities', army: 'Army strength', techs: 'Technologies', owned: 'Owned territories',
    selected: 'SELECTED TERRITORY', noSelection: 'Select a land tile on the 3D map', terrain: 'Terrain', owner: 'Controller', city: 'City', noCity: 'No major city', population: 'Population', structures: 'Structures', actions: 'AVAILABLE ACTIONS',
    buildTitle: 'Develop the realm', buildHint: 'Select one of your cities on the map, then invest in a structure.',
    researchTitle: 'A future worth building', researchHint: 'Select an available technology to begin research. Progress advances each turn.',
    diplomacyTitle: 'The balance of powers', diplomacyHint: 'Trust is built slowly and lost quickly. Treaties change your strategic options.',
    militaryTitle: 'Strength is more than numbers', militaryHint: 'Recruit units to defend your territory or open a tactical engagement with a rival.',
    eventsTitle: 'Chronicle of the sovereign age', eventsHint: 'Events respond to the changing condition of your realm.',
    build: 'Build', researchNow: 'Research', researched: 'Completed', researching: 'In progress', cost: 'Cost', turns: 'turns', available: 'Available', locked: 'Locked', noResearch: 'No active research', progress: 'Progress',
    proposeTrade: 'Trade pact', proposeAlliance: 'Propose alliance', improveRelations: 'Send envoy', relations: 'Relations', armyStrength: 'Army strength', rival: 'Rival', ally: 'Ally', neutral: 'Neutral', hostile: 'Hostile',
    recruit: 'Recruit infantry', launchBattle: 'Open tactical battle', units: 'Units', morale: 'Morale', defence: 'Defence', battleTitle: 'THEATER OF OPERATIONS', playerForces: 'Aurelian forces', enemyForces: 'Opposing forces', battleRound: 'Engagement round', advance: 'Advance', hold: 'Hold position', flank: 'Flanking manoeuvre', artillery: 'Artillery strike', retreat: 'Withdraw', battleTip: 'Terrain, morale and command choices shape each engagement.', victory: 'Victory', defeat: 'Defeat', stalemate: 'Engagement ended', continueWorld: 'Return to world map', selectRival: 'Select a rival first', insufficient: 'Insufficient resources', noCityOwned: 'Select a city under your control.', built: 'Structure constructed', researchStarted: 'Research started', researchDone: 'Research completed', turnAdvanced: 'A new turn begins', saved: 'Game saved on this device', loaded: 'Save loaded', noSave: 'No save found on this device', saveFile: 'Export save', importSave: 'Import save', newGame: 'New game', yes: 'Confirm', cancel: 'Cancel', helpTitle: 'How to play', helpText: 'Select friendly cities to build. Research technologies to strengthen your realm. Use diplomacy to improve relations and recruit troops before opening a battle. End Turn advances the economy, research and AI nations.', helpControls: 'Drag to rotate · Scroll to zoom · Click a hex to inspect it', language: 'Language', year: 'YEAR', turnLabel: 'TURN', stability: 'Stability', diplomacyBoost: 'Relations improved', tradeStarted: 'Trade pact signed', allianceStarted: 'Alliance formed', recruitDone: 'Infantry recruited', battleWon: 'Battle won', battleLost: 'Battle lost', ready: 'Ready', gameSaved: 'Save file downloaded', importDone: 'Save imported', importError: 'Could not read that save file', confirmNewGame: 'Start a new campaign? Current unsaved progress will be lost.', noEvents: 'No major events. The realm is quiet for now.', victoryGoal: 'Influence goal', close: 'Close', worldMap: 'World map', battleMode: 'Battle mode', cityLevel: 'Development level', specialism: 'Specialism', lastReport: 'LAST TURN REPORT', reportEmpty: 'Your advisers report a steady turn.', diplomacyEffect: 'Diplomatic action', buildLimit: 'The city has reached its structure limit for this prototype.', unitLimit: 'The army is already at the current recruitment cap.', tooltipZoom: 'Zoom', gamePaused: 'Paused', resume: 'Resume', activeResearch: 'Active research', noActiveBattle: 'No active engagement',
  },
  fa: {
    creatorCredit: 'سازنده: حمید یارعلی · حق نشر © ۲۰۲۶. تمامی حقوق محفوظ است.',
    overview: 'نمای کلی', build: 'ساخت‌وساز', research: 'پژوهش', diplomacy: 'دیپلماسی', military: 'ارتش', events: 'وقایع‌نامه',
    yourNation: 'کشور شما', publicApproval: 'رضایت عمومی', turn: 'نوبت', endTurn: 'پایان نوبت', income: 'درآمد نوبت', expenses: 'هزینه نگهداری',
    overviewTitle: 'نگاهی به آورلیا', overviewBody: 'هر نوبت یک انتخاب است. در پایداری سرمایه‌گذاری کن، مرزها را امن نگه دار و اعتماد همسایگان را به دست آور.',
    citizens: 'جمعیت', cities: 'شهرها', army: 'قدرت ارتش', techs: 'فناوری‌ها', owned: 'قلمروهای تحت کنترل',
    selected: 'قلمرو انتخاب‌شده', noSelection: 'یک خانه خشکی را روی نقشه سه‌بعدی انتخاب کن', terrain: 'زمین', owner: 'کنترل‌کننده', city: 'شهر', noCity: 'شهر مهمی ندارد', population: 'جمعیت', structures: 'ساختمان‌ها', actions: 'اقدامات موجود',
    buildTitle: 'توسعه سرزمین', buildHint: 'یکی از شهرهای خود را روی نقشه انتخاب کن و در یک ساختمان سرمایه‌گذاری کن.',
    researchTitle: 'آینده‌ای که می‌سازیم', researchHint: 'برای آغاز پژوهش یک فناوری را انتخاب کن. پیشرفت در هر نوبت افزایش می‌یابد.',
    diplomacyTitle: 'توازن قدرت‌ها', diplomacyHint: 'اعتماد به‌آرامی ساخته و به‌سرعت از دست می‌رود. پیمان‌ها گزینه‌های راهبردی تو را تغییر می‌دهند.',
    militaryTitle: 'قدرت فقط به تعداد نیرو نیست', militaryHint: 'برای دفاع از قلمرو نیرو جذب کن یا نبردی تاکتیکی با رقیب آغاز کن.',
    eventsTitle: 'وقایع‌نامه عصر فرمانروایان', eventsHint: 'رویدادها به وضعیت در حال تغییر سرزمین تو واکنش نشان می‌دهند.',
    build: 'ساخت', researchNow: 'پژوهش', researched: 'تکمیل‌شده', researching: 'در حال انجام', cost: 'هزینه', turns: 'نوبت', available: 'در دسترس', locked: 'قفل', noResearch: 'پژوهش فعالی وجود ندارد', progress: 'پیشرفت',
    proposeTrade: 'پیمان تجاری', proposeAlliance: 'پیشنهاد اتحاد', improveRelations: 'اعزام فرستاده', relations: 'روابط', armyStrength: 'قدرت ارتش', rival: 'رقیب', ally: 'متحد', neutral: 'بی‌طرف', hostile: 'دشمن',
    recruit: 'جذب نیروی پیاده', launchBattle: 'ورود به نبرد تاکتیکی', units: 'نیروها', morale: 'روحیه', defence: 'دفاع', battleTitle: 'صحنه عملیات', playerForces: 'نیروهای آورلیا', enemyForces: 'نیروهای رقیب', battleRound: 'دور نبرد', advance: 'پیشروی', hold: 'حفظ موضع', flank: 'حمله جناحی', artillery: 'ضربه توپخانه', retreat: 'عقب‌نشینی', battleTip: 'زمین، روحیه و تصمیم فرماندهی مسیر هر نبرد را شکل می‌دهند.', victory: 'پیروزی', defeat: 'شکست', stalemate: 'پایان درگیری', continueWorld: 'بازگشت به نقشه جهان', selectRival: 'ابتدا یک رقیب انتخاب کن', insufficient: 'منابع کافی نیست', noCityOwned: 'شهری تحت کنترل خودت انتخاب کن.', built: 'ساختمان ساخته شد', researchStarted: 'پژوهش آغاز شد', researchDone: 'پژوهش تکمیل شد', turnAdvanced: 'نوبت تازه آغاز شد', saved: 'بازی در این دستگاه ذخیره شد', loaded: 'ذخیره بارگذاری شد', noSave: 'ذخیره‌ای در این دستگاه پیدا نشد', saveFile: 'خروجی ذخیره', importSave: 'ورود ذخیره', newGame: 'بازی جدید', yes: 'تأیید', cancel: 'انصراف', helpTitle: 'راهنمای بازی', helpText: 'برای ساخت‌وساز شهرهای خود را انتخاب کن. فناوری‌ها را پژوهش کن. روابط را از طریق دیپلماسی بهبود بده و پیش از ورود به نبرد نیرو جذب کن. پایان نوبت اقتصاد، پژوهش و کشورهای هوش مصنوعی را پیش می‌برد.', helpControls: 'برای چرخش بکش · برای زوم اسکرول کن · برای بررسی، خانه‌ای را انتخاب کن', language: 'زبان', year: 'سال', turnLabel: 'نوبت', stability: 'ثبات', diplomacyBoost: 'روابط بهتر شد', tradeStarted: 'پیمان تجاری امضا شد', allianceStarted: 'اتحاد شکل گرفت', recruitDone: 'نیروی پیاده جذب شد', battleWon: 'نبرد پیروز شد', battleLost: 'نبرد شکست خورد', ready: 'آماده', gameSaved: 'فایل ذخیره دانلود شد', importDone: 'ذخیره وارد شد', importError: 'خواندن فایل ذخیره ممکن نشد', confirmNewGame: 'کارزار جدید آغاز شود؟ پیشرفت ذخیره‌نشده از دست می‌رود.', noEvents: 'رویداد مهمی نیست. فعلاً سرزمین آرام است.', victoryGoal: 'هدف نفوذ', close: 'بستن', worldMap: 'نقشه جهان', battleMode: 'حالت نبرد', cityLevel: 'سطح توسعه', specialism: 'تخصص', lastReport: 'گزارش نوبت پیش', reportEmpty: 'مشاوران از یک نوبت باثبات خبر می‌دهند.', diplomacyEffect: 'اقدام دیپلماتیک', buildLimit: 'این شهر در نسخه فعلی به سقف ساختمان رسیده است.', unitLimit: 'ارتش به سقف جذب نیرو در این نسخه رسیده است.', tooltipZoom: 'بزرگ‌نمایی', gamePaused: 'متوقف', resume: 'ادامه', activeResearch: 'پژوهش فعال', noActiveBattle: 'درگیری فعالی وجود ندارد',
  },
  zh: {
    creatorCredit: '创作者：Hamid Yareli · 版权所有 © 2026。保留所有权利。',
    overview: '总览', build: '建设', research: '科研', diplomacy: '外交', military: '军队', events: '纪事',
    yourNation: '你的国家', publicApproval: '公众支持度', turn: '回合', endTurn: '结束回合', income: '本回合收入', expenses: '维护费用',
    overviewTitle: '奥瑞利亚概况', overviewBody: '每一回合都是选择。投资韧性、守护边境，并赢得邻国的信任。',
    citizens: '人口', cities: '城市', army: '军力', techs: '科技', owned: '控制领土',
    selected: '已选领土', noSelection: '请在 3D 地图上选择一块陆地', terrain: '地形', owner: '控制方', city: '城市', noCity: '没有主要城市', population: '人口', structures: '建筑', actions: '可用行动',
    buildTitle: '发展领土', buildHint: '在地图上选择己方城市，然后投资建设。',
    researchTitle: '创造值得建设的未来', researchHint: '选择可用科技开始研究。研究进度会在每回合推进。',
    diplomacyTitle: '列国力量平衡', diplomacyHint: '信任建立缓慢，失去却很快。条约将改变你的战略选择。',
    militaryTitle: '力量不止于数量', militaryHint: '招募部队保卫领土，或与对手展开战术交战。',
    eventsTitle: '主权时代纪事', eventsHint: '事件会随国家状况变化而出现。',
    build: '建造', researchNow: '研究', researched: '已完成', researching: '研究中', cost: '花费', turns: '回合', available: '可用', locked: '锁定', noResearch: '没有正在进行的研究', progress: '进度',
    proposeTrade: '贸易协定', proposeAlliance: '提议结盟', improveRelations: '派遣使节', relations: '关系', armyStrength: '军力', rival: '对手', ally: '盟友', neutral: '中立', hostile: '敌对',
    recruit: '招募步兵', launchBattle: '进入战术战斗', units: '部队', morale: '士气', defence: '防御', battleTitle: '作战区域', playerForces: '奥瑞利亚军队', enemyForces: '敌方军队', battleRound: '交战回合', advance: '推进', hold: '坚守阵地', flank: '侧翼机动', artillery: '炮火打击', retreat: '撤退', battleTip: '地形、士气与指挥决策共同影响战斗。', victory: '胜利', defeat: '失败', stalemate: '交战结束', continueWorld: '返回世界地图', selectRival: '请先选择一个对手', insufficient: '资源不足', noCityOwned: '请选择你控制的城市。', built: '建筑已建成', researchStarted: '研究已开始', researchDone: '研究完成', turnAdvanced: '新回合开始', saved: '游戏已保存在此设备', loaded: '存档已加载', noSave: '此设备没有找到存档', saveFile: '导出存档', importSave: '导入存档', newGame: '新游戏', yes: '确认', cancel: '取消', helpTitle: '玩法说明', helpText: '选择己方城市进行建设。研究科技增强国家实力。通过外交改善关系，并在开战前招募士兵。结束回合会推进经济、科研与 AI 国家行动。', helpControls: '拖动旋转 · 滚轮缩放 · 点击六边形查看详情', language: '语言', year: '年份', turnLabel: '回合', stability: '稳定度', diplomacyBoost: '关系已改善', tradeStarted: '贸易协定已签署', allianceStarted: '联盟已建立', recruitDone: '步兵已招募', battleWon: '战斗胜利', battleLost: '战斗失败', ready: '就绪', gameSaved: '存档文件已下载', importDone: '存档已导入', importError: '无法读取存档文件', confirmNewGame: '开始新战役？未保存的进度将丢失。', noEvents: '暂无重大事件，国家暂时平静。', victoryGoal: '影响力目标', close: '关闭', worldMap: '世界地图', battleMode: '战斗模式', cityLevel: '发展等级', specialism: '专长', lastReport: '上回合报告', reportEmpty: '顾问报告称，上一回合局势稳定。', diplomacyEffect: '外交行动', buildLimit: '该城市已达到此原型版本的建筑上限。', unitLimit: '军队已达到当前版本的招募上限。', tooltipZoom: '缩放', gamePaused: '已暂停', resume: '继续', activeResearch: '当前研究', noActiveBattle: '没有正在进行的交战',
  },
};
