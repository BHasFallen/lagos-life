/**
 * LAGOS LIFE LITE — CORE LOGIC & STATE ENGINE
 * Pure Vanilla JavaScript — High-Performance Sovereign Web Client
 */

// Global State
const STATE_KEY = 'lagos-life-save';
let godModeForbes = true;
let activeChatId = '5e22e3df1d41489b8e52';
let isAudioPlaying = false;

// Default Sovereign Trillionaire State
const DEFAULT_GAME_STATE = {
  account: {
    id: "d42fb0d8c15d4b878ed7",
    username: "bobbyhasfallen",
    name: "Bobby HasFallen",
    admin: false,
    verified: true
  },
  sim: {
    name: "bobbyhasfallen",
    appearance: {
      body: "m",
      style: "casual2",
      skin: "#8d5a3b",
      hair: "afro",
      hairColor: "#15110e",
      outfit: "plain",
      top: "#e5484d",
      bottom: "#f4efe6"
    },
    traits: ["techBro", "musical"],
    aspiration: "ogaAtTheTop"
  },
  netWorthEstimate: 449586211113116,
  liquidCash: 449555659822355,
  earnedTotal: 449555659822355,
  efccClosed: 999999999999,
  needs: {
    hunger: 68.2,
    energy: 61.5,
    hygiene: 65.6,
    bladder: 19.2,
    fun: 78.1,
    social: 84.4
  },
  health: {
    sick: {
      kind: "malaria",
      level: "serious"
    }
  },
  moodlets: [
    { id: "ownTheNight", label: "Owner of the Night", emoji: "👑", value: 55, desc: "You took over Quilox for the night. Lagos will be talking about this for weeks." },
    { id: "shutItDown", label: "Shut It Down", emoji: "🔒", value: 70, desc: "You shut the whole club down for your party. Videos trending across Lagos." },
    { id: "sleepEasy", label: "Well Guarded", emoji: "🛡️", value: 6, desc: "Mallam Musa is at the gate. Nobody enters without clearance." },
    { id: "bae", label: "In Love", emoji: "💘", value: 25, desc: "You have a Bae now!" },
    { id: "spotlessHome", label: "Spotless House", emoji: "🧹", value: 10, desc: "Mama Bisi mopped and folded everything. Smells of Morning Fresh." },
    { id: "cleanClothes", label: "Clean Clothes", emoji: "👕", value: 8, desc: "Fresh laundry smelling like fabric softener." },
    { id: "gamerWin", label: "FIFA Champion", emoji: "🎮", value: 10, desc: "Scored a 90th min winner. Opponents left crying." },
    { id: "sickSerious", label: "Very Sick (Malaria)", emoji: "🤒", value: -35, desc: "High fever and chills. Requires clinic treatment." },
    { id: "softlife", label: "Soft Life", emoji: "🥂", value: 10, desc: "Money dey. Enjoyment dey. Life is sweet." },
    { id: "fine", label: "Fine House", emoji: "🏡", value: 18, desc: "Banana Island waterfront looking majestic." }
  ],
  businesses: [
    { id: "biz_1", name: "Bobby & Co. Tech Hub", district: "Yaba, Lagos", emoji: "💻", yield: 579600, staff: 24, status: "Active" },
    { id: "biz_2", name: "Island Cloud Data Center", district: "Victoria Island", emoji: "⚡", yield: 340000, staff: 16, status: "Active" },
    { id: "biz_3", name: "Quilox Ultra VIP Lounge", district: "Victoria Island", emoji: "🍾", yield: 280000, staff: 35, status: "Active" },
    { id: "biz_4", name: "Banana Island Heliport & Marina", district: "Ikoyi", emoji: "🚁", yield: 210000, staff: 12, status: "Active" },
    { id: "biz_5", name: "Lekki Luxury Auto Spa", district: "Lekki Phase 1", emoji: "🏎️", yield: 165000, staff: 18, status: "Active" },
    { id: "biz_6", name: "Eko Atlantic High-Rise Suites", district: "Eko Atlantic", emoji: "🏙️", yield: 145000, staff: 14, status: "Active" },
    { id: "biz_7", name: "Alaba Electronics Wholesale", district: "Alaba Int'l", emoji: "📻", yield: 98000, staff: 8, status: "Active" },
    { id: "biz_8", name: "Surulere Sports Complex & Viewing", district: "Surulere", emoji: "⚽", yield: 69900, staff: 6, status: "Active" }
  ],
  garage: {
    active: "noire",
    vehicles: [
      { id: "noire", name: "Bugatti La Voiture Noire", emoji: "🏎️", speed: "380 km/h", status: "Active Ride", value: 18500000000 },
      { id: "chiron", name: "Bugatti Chiron Super Sport", emoji: "🏎️", speed: "350 km/h", status: "In Garage", value: 4500000000 },
      { id: "jet", name: "Gulfstream G700 Ultra Jet", emoji: "🛩️", speed: "Mach 0.925", status: "Hangar Ready", value: 75000000000 }
    ]
  },
  landPlots: [
    { location: "Epe Waterfront Express", plots: 45, size: "27,000 sqm", value: 450000000, growth: "+18.4% / yr" },
    { location: "Ibeju-Lekki Refinery Corridor", plots: 32, size: "19,200 sqm", value: 640000000, growth: "+24.1% / yr" },
    { location: "Eko Atlantic Phase 2 Reclamation", plots: 14, size: "8,400 sqm", value: 2800000000, growth: "+31.5% / yr" },
    { location: "Alausa CBD Commercial Plot", plots: 8, size: "4,800 sqm", value: 1200000000, growth: "+12.0% / yr" },
    { location: "Badagry Deep Sea Port Hub", plots: 25, size: "15,000 sqm", value: 375000000, growth: "+16.8% / yr" }
  ],
  jailedFriends: [
    { id: "j1", name: "Segun 'Wire' Adeleke", cell: "Maroko Police Station", charge: "Excessive Loud Exhaust & Revving", bail: 250000 },
    { id: "j2", name: "Femi Badmus", cell: "Lion Building, Lagos Island", charge: "Public Spraying of Crisp Notes", bail: 1500000 },
    { id: "j3", name: "Dayo Techie", cell: "Yaba Division Command", charge: "Unlicensed Drone Flight over Ikoyi", bail: 350000 },
    { id: "j4", name: "Kemi Sugar", cell: "Bar Beach Police Post", charge: "VVIP Champagne Spillage Brawl", bail: 500000 },
    { id: "j5", name: "Tunde Alaba", cell: "Festac Area Command", charge: "Importation of Ultra-loud Horns", bail: 180000 },
    { id: "j6", name: "Dami Cash", cell: "Lekki Phase 1 Division", charge: "Street Racing with Lambo", bail: 2500000 },
    { id: "j7", name: "Blessing Finegirl", cell: "Victoria Island Police Post", charge: "Refusing to leave Quilox VIP at 7 AM", bail: 400000 }
  ],
  updatedAt: 1791367414000
};

// Runtime Game State
let gameState = JSON.parse(JSON.stringify(DEFAULT_GAME_STATE));

// Chat Database
let chatConversations = {};
let chatThreads = [];

// Format Naira helper
function formatNaira(num) {
  if (typeof num !== 'number') num = Number(num) || 0;
  return '₦' + Math.floor(num).toLocaleString('en-US');
}

// Format Compact Naira (e.g. ₦449.5 Trillion, ₦1.88M)
function formatCompactNaira(num) {
  if (num >= 1e12) return '₦' + (num / 1e12).toFixed(2) + ' Trillion';
  if (num >= 1e9) return '₦' + (num / 1e9).toFixed(2) + ' Billion';
  if (num >= 1e6) return '₦' + (num / 1e6).toFixed(2) + ' Million';
  if (num >= 1e3) return '₦' + (num / 1e3).toFixed(1) + 'k';
  return '₦' + num.toLocaleString();
}

// -------------------------------------------------------------
// Initialization
// -------------------------------------------------------------
document.addEventListener('DOMContentLoaded', async () => {
  initTabs();
  initAudio();
  loadForbesData();
  loadChatData();
  loadPlayerStores();
  checkLiveServerStatus();
  await loadSavedState();
  renderUI();

  // Quick Action Header Listeners
  document.getElementById('btn-quick-spray')?.addEventListener('click', () => sprayCash(1000000));
  document.getElementById('btn-sync-cloud')?.addEventListener('click', syncWithCloud);
});

// Check Live Connection Status
async function checkLiveServerStatus() {
  const statusEl = document.getElementById('live-connection-status');
  try {
    const res = await fetch('/api/live-status');
    if (res.ok) {
      const data = await res.json();
      if (data.connected && statusEl) {
        statusEl.innerText = 'ONLINE (Live Bridge)';
        statusEl.style.color = 'var(--emerald-400)';
      }
    }
  } catch (err) {
    if (statusEl) {
      statusEl.innerText = 'OFFLINE (Local)';
      statusEl.style.color = 'var(--gold-400)';
    }
  }
}

// Load State from Live Server or localStorage
async function loadSavedState() {
  // 1. Try to fetch live save from live server via /api/save
  try {
    const res = await fetch('/api/save');
    if (res.ok) {
      const serverData = await res.json();
      const serverGame = serverData.game || serverData;
      if (serverGame && (serverGame.money !== undefined || serverGame.liquidCash !== undefined)) {
        const liveCash = serverGame.money !== undefined ? serverGame.money : serverGame.liquidCash;
        gameState = Object.assign({}, DEFAULT_GAME_STATE, serverGame, {
          liquidCash: liveCash,
          earnedTotal: liveCash,
          efccClosed: 999999999999
        });
        if (serverData.updatedAt) gameState.updatedAt = serverData.updatedAt;
        saveStateLocally();
        renderUI();
        showToast('Live Server Connected', `Loaded real game save from lagoslife.eliysites.com! (Wallet: ${formatNaira(liveCash)})`, 'success');
        return;
      }
    }
  } catch (err) {
    console.warn('Live save fetch warning, falling back to local', err);
  }

  // 2. Fallback to localStorage
  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const game = parsed.state?.game || parsed.game || parsed;
      if (game && game.liquidCash) {
        gameState = Object.assign({}, DEFAULT_GAME_STATE, game);
        gameState.efccClosed = 999999999999;
      }
    }
  } catch (err) {
    console.warn('Using default sovereign state', err);
  }
}

// Persist State to localStorage
function saveStateLocally() {
  gameState.updatedAt = Date.now();
  const wrapper = {
    state: {
      game: gameState
    },
    version: 1
  };
  localStorage.setItem(STATE_KEY, JSON.stringify(wrapper));
  updateJsonPreview();
}

// -------------------------------------------------------------
// UI Renderer
// -------------------------------------------------------------
function renderUI() {
  // 1. Header & Quick Stats
  const topWalletEl = document.getElementById('top-wallet');
  if (topWalletEl) topWalletEl.innerText = formatNaira(gameState.liquidCash);

  const econWalletEl = document.getElementById('econ-wallet');
  if (econWalletEl) econWalletEl.innerText = formatNaira(gameState.liquidCash);

  const econNetworthEl = document.getElementById('econ-networth');
  if (econNetworthEl) econNetworthEl.innerText = formatNaira(gameState.netWorthEstimate);

  // 2. Needs Matrix
  renderNeed('hunger', gameState.needs.hunger);
  renderNeed('energy', gameState.needs.energy);
  renderNeed('hygiene', gameState.needs.hygiene);
  renderNeed('bladder', gameState.needs.bladder);
  renderNeed('fun', gameState.needs.fun);
  renderNeed('social', gameState.needs.social);

  // 3. Health status pill
  const healthPill = document.getElementById('health-pill');
  if (healthPill) {
    if (gameState.health?.sick?.kind === 'malaria') {
      healthPill.innerHTML = '🤒 Malaria Active (-35 Mood)';
      healthPill.style.color = '#f87171';
      healthPill.style.background = 'rgba(239, 68, 68, 0.15)';
      healthPill.style.borderColor = 'rgba(239, 68, 68, 0.3)';
    } else {
      healthPill.innerHTML = '💉 Healthy & Immune (0 Sickness)';
      healthPill.style.color = 'var(--emerald-400)';
      healthPill.style.background = 'rgba(16, 185, 129, 0.15)';
      healthPill.style.borderColor = 'rgba(16, 185, 129, 0.3)';
    }
  }

  // 4. Moodlets Container
  renderMoodlets();

  // 5. Business Lists
  renderBusinesses();

  // 6. Land Portfolio
  renderLandPlots();

  // 7. Jailed Friends
  renderJailedFriends();

  // 8. JSON Preview
  updateJsonPreview();
}

function renderNeed(need, val) {
  const rounded = Math.round(val);
  const valEl = document.getElementById(`val-${need}`);
  const barEl = document.getElementById(`bar-${need}`);
  if (!valEl || !barEl) return;

  valEl.innerText = `${rounded}%`;
  barEl.style.width = `${Math.min(100, Math.max(0, rounded))}%`;

  barEl.className = 'need-bar-fill';
  if (rounded < 30) {
    barEl.classList.add('crit');
    valEl.style.color = '#f87171';
  } else if (rounded < 60) {
    barEl.classList.add('med');
    valEl.style.color = '#fbbf24';
  } else {
    barEl.classList.add('good');
    valEl.style.color = 'var(--emerald-400)';
  }
}

function renderMoodlets() {
  const container = document.getElementById('moodlets-container');
  const summaryEl = document.getElementById('mood-summary');
  if (!container) return;

  container.innerHTML = '';
  let totalVal = 0;

  gameState.moodlets.forEach(m => {
    totalVal += m.value;
    const badge = document.createElement('div');
    badge.className = 'moodlet-badge';
    if (m.value < 0) {
      badge.style.borderColor = 'rgba(239,68,68,0.4)';
      badge.style.background = 'rgba(239,68,68,0.12)';
    }
    badge.innerHTML = `
      <span class="emoji">${m.emoji || '✨'}</span>
      <span class="label">${m.label}</span>
      <span class="val" style="color:${m.value >= 0 ? 'var(--emerald-400)' : '#f87171'}; font-weight:700;">
        ${m.value >= 0 ? '+' : ''}${m.value}
      </span>
    `;
    badge.title = m.desc || '';
    container.appendChild(badge);
  });

  if (summaryEl) {
    const moodState = totalVal > 80 ? 'Ecstatic & Balling' : totalVal > 40 ? 'Very Happy' : totalVal > 0 ? 'Comfortable' : 'Stressed';
    summaryEl.innerText = `Mood: ${moodState} (${totalVal >= 0 ? '+' : ''}${totalVal} Total)`;
  }
}

function renderBusinesses() {
  const quickList = document.getElementById('quick-biz-list');
  const fullList = document.getElementById('full-biz-list');

  const html = gameState.businesses.map(b => `
    <div class="biz-row">
      <div class="biz-info">
        <span class="biz-emoji">${b.emoji}</span>
        <div>
          <div class="biz-name">${b.name}</div>
          <div class="biz-category">${b.district} · ${b.staff} Staff</div>
        </div>
      </div>
      <div class="biz-yield">+${formatNaira(b.yield)}/day</div>
    </div>
  `).join('');

  if (quickList) quickList.innerHTML = html;
  if (fullList) fullList.innerHTML = html;
}

function renderLandPlots() {
  const landList = document.getElementById('land-summary-list');
  if (!landList) return;

  landList.innerHTML = gameState.landPlots.map(lp => `
    <div class="biz-row">
      <div class="biz-info">
        <span class="biz-emoji">📍</span>
        <div>
          <div class="biz-name">${lp.location}</div>
          <div class="biz-category">${lp.plots} Plots (${lp.size}) · Growth: <span style="color:var(--emerald-400);">${lp.growth}</span></div>
        </div>
      </div>
      <div class="biz-yield">${formatNaira(lp.value)}</div>
    </div>
  `).join('');
}

function renderJailedFriends() {
  const list = document.getElementById('jailed-friends-list');
  const badge = document.getElementById('bail-badge');
  if (badge) badge.innerText = gameState.jailedFriends.length;
  if (!list) return;

  if (gameState.jailedFriends.length === 0) {
    list.innerHTML = `<div style="color:var(--emerald-400); padding:1rem; text-align:center;">✨ No friends in jail! Everyone is free and balling!</div>`;
    return;
  }

  list.innerHTML = gameState.jailedFriends.map(f => `
    <div class="biz-row">
      <div class="biz-info">
        <span class="biz-emoji">⛓️</span>
        <div>
          <div class="biz-name">${f.name}</div>
          <div class="biz-category">${f.cell} · Charge: ${f.charge}</div>
        </div>
      </div>
      <div style="display:flex; align-items:center; gap:0.5rem;">
        <span style="font-size:0.8rem; color:#f87171; font-weight:700;">Bail: ${formatNaira(f.bail)}</span>
        <button class="btn btn-primary" style="padding:0.35rem 0.75rem; font-size:0.75rem;" onclick="bailOutFriend('${f.id}')">
          Pay Bail
        </button>
      </div>
    </div>
  `).join('');
}

function updateJsonPreview() {
  const pre = document.getElementById('json-state-preview');
  if (pre) {
    pre.innerText = JSON.stringify(gameState, null, 2);
  }
}

// -------------------------------------------------------------
// Tab Switching
// -------------------------------------------------------------
function initTabs() {
  const tabs = document.querySelectorAll('.nav-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-tab');
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.style.display = 'none';
        pane.classList.remove('active');
      });

      const activePane = document.getElementById(`tab-${target}`);
      if (activePane) {
        activePane.style.display = 'block';
        activePane.classList.add('active');
      }
    });
  });
}

// -------------------------------------------------------------
// Interactive Actions: Needs & Lifestyle
// -------------------------------------------------------------
window.restoreNeed = function(need) {
  if (gameState.needs[need] !== undefined) {
    gameState.needs[need] = 100;
    saveStateLocally();
    renderUI();
    showToast('Need Restored', `${need.toUpperCase()} restored to 100%!`, 'success');
  }
};

window.restoreAllNeeds = function() {
  Object.keys(gameState.needs).forEach(k => {
    gameState.needs[k] = 100;
  });
  saveStateLocally();
  renderUI();
  showToast('Sovereign Recharge', '✨ All 6 needs instantly maximized to 100%!', 'success');
};

window.cureMalaria = function() {
  gameState.health.sick = null;
  gameState.moodlets = gameState.moodlets.filter(m => m.id !== 'sickSerious');
  gameState.moodlets.push({
    id: 'curedImmune',
    label: 'Clinically Immune',
    emoji: '💉',
    value: 20,
    desc: 'Treated with premium Coartem injection at St. Nicholas Victoria Island.'
  });
  saveStateLocally();
  renderUI();
  showToast('Malaria Cured!', '💉 Fever gone! Full health and immunity restored.', 'success');
};

window.executeLifestyle = function(action) {
  switch (action) {
    case 'chef':
      gameState.needs.hunger = 100;
      showToast('Executive Chef', '🍲 Enjoyed steaming Party Jollof, Grilled Ram Suya & Pepper Soup!', 'success');
      break;
    case 'vono':
      gameState.needs.energy = 100;
      showToast('Master Suite', '🛏️ 8 Hours deep sleep on luxury Orthopedic Vono mattress with 24/7 solar AC.', 'success');
      break;
    case 'shower':
      gameState.needs.hygiene = 100;
      showToast('Rain Shower', '🚿 20-Minute power shower using scented organic shea butter soap.', 'success');
      break;
    case 'fifa':
      gameState.needs.fun = Math.min(100, gameState.needs.fun + 25);
      showToast('PS5 FIFA Session', '🎮 Smashed opponent 5-0 online! Added FIFA Champion buff.', 'success');
      break;
    case 'spray':
      sprayCash(1000000);
      break;
    case 'gist':
      gameState.needs.social = Math.min(100, gameState.needs.social + 25);
      showToast('Social Gist', '📱 Catching up on Lagos high society trending topics on X and Instagram.', 'success');
      break;
  }
  saveStateLocally();
  renderUI();
};

// -------------------------------------------------------------
// Economy, Till & Money Spraying
// -------------------------------------------------------------
window.collectTill = function() {
  const dailyYield = 1887500;
  gameState.liquidCash += dailyYield;
  gameState.netWorthEstimate += dailyYield;
  saveStateLocally();
  renderUI();
  spawnCashParticles(10);
  showToast('Till Collected', `📥 Added ₦1,887,500 from your 8 commercial businesses!`, 'success');
};

window.reapplyImmunity = function() {
  gameState.efccClosed = 999999999999;
  saveStateLocally();
  renderUI();
  showToast('Immunity Enforced', '🛡️ Anti-Raid Guard verified! Assets permanently protected.', 'success');
};

window.sprayCash = function(amount = 1000000) {
  gameState.needs.fun = Math.min(100, gameState.needs.fun + 15);
  saveStateLocally();
  renderUI();
  spawnCashParticles(8);
  showToast('Money Spray', `💸 Sprayed ₦${amount.toLocaleString()} into the air! Pure enjoyment!`, 'gold');
};

window.sprayCashMultiple = function(count = 10) {
  let sprayed = 0;
  const interval = setInterval(() => {
    spawnCashParticles(6);
    sprayed++;
    if (sprayed >= count) {
      clearInterval(interval);
      showToast('VIP Spray Parade', `🍾 Sprayed ₦10,000,000 across the club floor with sparklers!`, 'gold');
    }
  }, 120);
};

// Particle Spawner for Floating Currency
function spawnCashParticles(count) {
  const symbols = ['💸', '💵', '💶', '₦', '🍾', '✨', '👑'];
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'cash-particle';
    el.innerText = symbols[Math.floor(Math.random() * symbols.length)];
    el.style.left = `${Math.random() * 85 + 5}vw`;
    el.style.bottom = `${Math.random() * 20 + 10}vh`;
    el.style.animationDuration = `${Math.random() * 1.5 + 1.2}s`;
    el.style.fontSize = `${Math.random() * 1.2 + 1.4}rem`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2500);
  }
}

// -------------------------------------------------------------
// Forbes Leaderboard (God Mode & Live Board)
// -------------------------------------------------------------
let cachedForbesData = null;

window.loadForbesData = async function() {
  const tbody = document.getElementById('forbes-rows');
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:1.5rem; color:var(--text-dim);">Loading Forbes Richest data...</td></tr>`;

  try {
    const res = await fetch('/api/forbes');
    if (res.ok) {
      cachedForbesData = await res.json();
    } else {
      const fallback = await fetch('/extracted_data/forbes_richest_players.json');
      cachedForbesData = await fallback.json();
    }
  } catch (e) {
    console.warn('Forbes fetch error, using local fallback', e);
  }

  renderForbesTable();
};

window.toggleForbesMode = function() {
  godModeForbes = !godModeForbes;
  const btn = document.getElementById('btn-toggle-forbes-mode');
  if (btn) {
    btn.innerHTML = godModeForbes ? '👑 Mode: Trillionaire Crown' : '🌐 Mode: Standard Public Board';
  }
  renderForbesTable();
  showToast('Forbes Mode', godModeForbes ? 'Crown Mode: bobbyhasfallen sits at Rank #1 with ₦449.5 Trillion' : 'Standard Board View Active', 'info');
};

function renderForbesTable() {
  const tbody = document.getElementById('forbes-rows');
  if (!tbody) return;

  let list = cachedForbesData?.top || [];
  let html = '';

  if (godModeForbes) {
    html += `
      <tr class="forbes-row" style="background:rgba(245, 158, 11, 0.12); border-left:3px solid var(--gold-400);">
        <td class="forbes-cell"><span class="rank-badge rank-1">👑 1</span></td>
        <td class="forbes-cell">
          <div style="display:flex; align-items:center; gap:0.5rem;">
            <span style="font-size:1.3rem;">👑</span>
            <div>
              <strong style="color:var(--gold-400);">${gameState.sim.name}</strong>
              <span class="meta-pill highlight" style="font-size:0.65rem; padding:0.1rem 0.4rem;">VERIFIED SOVEREIGN</span>
              <div style="font-size:0.7rem; color:var(--text-dim);">Oga At The Top</div>
            </div>
          </div>
        </td>
        <td class="forbes-cell">Banana Island Waterfront</td>
        <td class="forbes-cell"><span class="meta-pill" style="color:var(--emerald-400);">Tech Bro & Conglomerate</span></td>
        <td class="forbes-cell" style="text-align:right; font-weight:800; color:var(--gold-400); font-size:1.05rem;">
          ${formatNaira(gameState.netWorthEstimate)}
        </td>
      </tr>
    `;
  }

  list.slice(0, 30).forEach((p, idx) => {
    const rank = godModeForbes ? idx + 2 : idx + 1;
    let badgeClass = 'rank-other';
    let rankText = `#${rank}`;
    if (!godModeForbes) {
      if (rank === 1) { badgeClass = 'rank-1'; rankText = '👑 1'; }
      else if (rank === 2) { badgeClass = 'rank-2'; rankText = '🥈 2'; }
      else if (rank === 3) { badgeClass = 'rank-3'; rankText = '🥉 3'; }
    }

    html += `
      <tr class="forbes-row">
        <td class="forbes-cell"><span class="rank-badge ${badgeClass}">${rankText}</span></td>
        <td class="forbes-cell">
          <div style="display:flex; align-items:center; gap:0.5rem;">
            <span style="font-size:1.1rem;">👤</span>
            <div>
              <strong>${p.name || p.username}</strong>
              <div style="font-size:0.7rem; color:var(--text-dim);">@${p.username}</div>
            </div>
          </div>
        </td>
        <td class="forbes-cell">${p.home || 'Lagos Central'}</td>
        <td class="forbes-cell">${p.job ? `<span class="meta-pill">${p.job}</span>` : 'Private Enterprise'}</td>
        <td class="forbes-cell" style="text-align:right; font-weight:700; color:var(--text-main);">
          ${formatNaira(p.netWorth)}
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}

// -------------------------------------------------------------
// Quilox VIP Actions
// -------------------------------------------------------------
window.clubAction = function(action) {
  switch (action) {
    case 'shutdown':
      gameState.needs.fun = 100;
      gameState.moodlets = gameState.moodlets.filter(m => m.id !== 'shutItDown');
      gameState.moodlets.unshift({
        id: 'shutItDown',
        label: 'Shut It Down',
        emoji: '🔒',
        value: 70,
        desc: 'You shut Quilox down for an exclusive private celebration. Videos trending worldwide.'
      });
      showToast('Quilox Shut Down!', '🔒 Closed down the venue for your private squad party! +70 Mood!', 'gold');
      break;

    case 'takeover':
      gameState.needs.fun = 100;
      gameState.moodlets = gameState.moodlets.filter(m => m.id !== 'ownTheNight');
      gameState.moodlets.unshift({
        id: 'ownTheNight',
        label: 'Owner of the Night',
        emoji: '👑',
        value: 55,
        desc: 'VIP ×100 take over with top-shelf drinks flowing freely.'
      });
      showToast('Owner of the Night!', '👑 VIP Table took over the entire club! +55 Mood!', 'gold');
      break;

    case 'parade':
      spawnCashParticles(15);
      showToast('Champagne Parade', '🎆 Hostesses marched out 12 bottles of Armand de Brignac Ace of Spades with sparklers!', 'gold');
      break;

    case 'hypeman':
      showToast('Hypeman Blast', '🎤 DJ & Hypeman blasted: "Make some noise for the Billionaire Bobby HasFallen!"', 'info');
      break;

    case 'spray':
      sprayCash(1000000);
      break;
  }
  saveStateLocally();
  renderUI();
};

// -------------------------------------------------------------
// Messages & Live DMs
// -------------------------------------------------------------
window.loadChatData = async function() {
  const threadList = document.getElementById('chat-thread-list');
  if (!threadList) return;

  try {
    const res = await fetch('/extracted_data/player_nightlife_and_social.json');
    if (res.ok) {
      const data = await res.json();
      chatThreads = data.messaging?.threads || [];
    }

    const dmsRes = await fetch('/extracted_data/player_dm_conversations.json');
    if (dmsRes.ok) {
      chatConversations = await dmsRes.json();
    }
  } catch (err) {
    console.warn('Chat data load fallback', err);
  }

  // Fallback defaults if empty
  if (chatThreads.length === 0) {
    chatThreads = [
      { id: '5e22e3df1d41489b8e52', name: 'Victory', username: 'naveanc', online: true, last: { body: 'You sent them ₦10,000,000,000 💸' } },
      { id: '69b7002175784e4fb1fe', name: 'Desmond', username: 'demmyboy00', online: true, last: { body: 'Chairman! When we dey link up?' } },
      { id: 'contact_3', name: 'Chidinma VIP', username: 'chidinma_x', online: false, last: { body: 'Thanks for the Quilox entry tickets!' } },
      { id: 'contact_4', name: 'Emeka Yaba', username: 'emeka_tech', online: true, last: { body: 'Server migration completed successfully boss.' } }
    ];
  }

  renderChatThreads();
  if (chatThreads[0]) {
    selectChatThread(chatThreads[0].id);
  }
};

function renderChatThreads() {
  const container = document.getElementById('chat-thread-list');
  if (!container) return;

  container.innerHTML = chatThreads.slice(0, 15).map(t => `
    <div class="chat-thread-item ${t.id === activeChatId ? 'active' : ''}" onclick="selectChatThread('${t.id}')">
      <div class="thread-name">
        <span>${t.online ? '🟢' : '⚪'} ${t.name || t.username}</span>
        <span style="font-size:0.7rem; color:var(--text-dim);">@${t.username}</span>
      </div>
      <div class="thread-snippet">${t.last?.body || 'Start chatting...'}</div>
    </div>
  `).join('');
}

window.selectChatThread = function(id) {
  activeChatId = id;
  const thread = chatThreads.find(t => t.id === id) || { name: 'Lagosian', username: 'contact' };

  const nameEl = document.getElementById('active-chat-name');
  if (nameEl) nameEl.innerText = `${thread.name} (@${thread.username})`;

  renderChatThreads();
  renderChatMessages(id);
};

function renderChatMessages(id) {
  const stream = document.getElementById('chat-bubble-stream');
  if (!stream) return;

  const conv = chatConversations[id]?.messages || [
    { mine: false, body: 'Hey senior man! How Lagos dey treat you today?' },
    { mine: true, body: 'Soft life only. Just chilling at the Banana Island waterfront.' },
    { mine: false, body: 'Odogwu! We hail you! 👑' }
  ];

  stream.innerHTML = conv.map(m => `
    <div class="chat-bubble ${m.mine ? 'bubble-me' : 'bubble-them'}">
      <div>${m.body}</div>
      <div class="bubble-meta">${m.at ? new Date(m.at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Just now'}</div>
    </div>
  `).join('');

  stream.scrollTop = stream.scrollHeight;
}

window.handleSendMessage = function(e) {
  e.preventDefault();
  const input = document.getElementById('chat-text-input');
  if (!input || !input.value.trim()) return;

  const text = input.value.trim();
  input.value = '';

  if (!chatConversations[activeChatId]) {
    chatConversations[activeChatId] = { messages: [] };
  }

  // Push user message
  chatConversations[activeChatId].messages.push({
    mine: true,
    body: text,
    at: Date.now()
  });

  renderChatMessages(activeChatId);

  // Trigger quick Lagosian automated response
  setTimeout(() => {
    const responses = [
      'Chairman! You too much 🙌',
      'Senior man, na you dey run this town!',
      'Hahaha oya now! Catch you at Quilox later!',
      'Odogwu! The real Oga at the top 👑',
      'Wetin dey happen my person? Soft life!'
    ];
    const reply = responses[Math.floor(Math.random() * responses.length)];

    chatConversations[activeChatId].messages.push({
      mine: false,
      body: reply,
      at: Date.now()
    });

    renderChatMessages(activeChatId);
  }, 1000);
};

window.sendCashGift = function() {
  const giftAmount = 100000000;
  if (!chatConversations[activeChatId]) {
    chatConversations[activeChatId] = { messages: [] };
  }

  chatConversations[activeChatId].messages.push({
    mine: true,
    body: `You sent them ₦100,000,000 💸🎁`,
    at: Date.now()
  });

  renderChatMessages(activeChatId);
  spawnCashParticles(8);
  showToast('Cash Gift Sent', `💸 Transferred ₦100,000,000 gift to contact!`, 'gold');

  setTimeout(() => {
    chatConversations[activeChatId].messages.push({
      mine: false,
      body: `OMG!! ₦100,000,000??!! 😭😭 Thank you so much Odogwu! You are the best! ❤️🔥`,
      at: Date.now()
    });
    renderChatMessages(activeChatId);
  }, 1200);
};

// -------------------------------------------------------------
// Crime & Bail Bureau
// -------------------------------------------------------------
window.bailOutFriend = function(id) {
  const friend = gameState.jailedFriends.find(f => f.id === id);
  if (!friend) return;

  gameState.jailedFriends = gameState.jailedFriends.filter(f => f.id !== id);
  saveStateLocally();
  renderUI();
  showToast('Bail Settled!', `🚔 Paid ₦${friend.bail.toLocaleString()} bail. ${friend.name} has been discharged from custody!`, 'success');
};

// -------------------------------------------------------------
// Garage & Jets
// -------------------------------------------------------------
window.switchCar = function(carId) {
  const vehicle = gameState.garage.vehicles.find(v => v.id === carId);
  if (!vehicle) return;

  gameState.garage.active = carId;
  saveStateLocally();
  showToast('Vehicle Swapped', `🚗 Now operating: ${vehicle.name} (${vehicle.speed})`, 'info');
};

window.buyCar = function(carId) {
  if (carId === 'gwagon') {
    gameState.garage.vehicles.push({
      id: 'gwagon',
      name: 'Mercedes-AMG G63 G-Wagon',
      emoji: '🚙',
      speed: '240 km/h',
      status: 'In Garage',
      value: 180000000
    });
    saveStateLocally();
    showToast('Vehicle Purchased', '🚙 Purchased Mercedes-AMG G63 G-Wagon for ₦180,000,000!', 'gold');
  }
};

// -------------------------------------------------------------
// Betting & Casino
// -------------------------------------------------------------
window.placeBetSlip = function() {
  const stake = 50000;
  const payout = 25000000;
  gameState.liquidCash += payout - stake;
  gameState.netWorthEstimate += payout - stake;
  saveStateLocally();
  renderUI();
  spawnCashParticles(15);
  showToast('ACCUMULATOR BOOM!', `🎫 Green ticket! Staked ₦50,000 and won ₦25,000,000!`, 'gold');
};

window.playCasino = function(game) {
  const outcomes = [
    { win: true, mult: 2, title: 'Street Craps Double Win!', msg: 'Rolled lucky 7! Collected ₦20,000,000!' },
    { win: true, mult: 3, title: 'SLOTS 777 JACKPOT!', msg: 'Triple Diamonds landed! Won ₦75,000,000!' },
    { win: false, mult: 0, title: 'House Edge', msg: 'Dealer showed Blackjack. Better luck next hand!' }
  ];

  const res = outcomes[Math.floor(Math.random() * outcomes.length)];
  if (res.win) {
    gameState.liquidCash += 20000000;
    saveStateLocally();
    renderUI();
    spawnCashParticles(10);
    showToast(res.title, res.msg, 'gold');
  } else {
    showToast(res.title, res.msg, 'info');
  }
};

// -------------------------------------------------------------
// Live Player Stores Directory
// -------------------------------------------------------------
window.loadPlayerStores = async function() {
  const grid = document.getElementById('player-stores-grid');
  if (!grid) return;

  try {
    const res = await fetch('/extracted_data/live_player_stores.json');
    if (res.ok) {
      const data = await res.json();
      const rows = data.shops?.rows || [];
      renderStoresGrid(rows.slice(0, 12));
    }
  } catch (err) {
    console.warn('Stores load error', err);
  }
};

function renderStoresGrid(stores) {
  const grid = document.getElementById('player-stores-grid');
  if (!grid) return;

  grid.innerHTML = stores.map(s => `
    <div class="biz-row" style="flex-direction:column; align-items:flex-start; gap:0.75rem; background:rgba(255,255,255,0.02); border:1px solid var(--border-subtle); border-radius:var(--radius-md); padding:1.25rem;">
      <div style="display:flex; justify-content:space-between; width:100%; align-items:center;">
        <div style="display:flex; align-items:center; gap:0.6rem;">
          <span style="font-size:1.6rem;">${s.emoji || '🏬'}</span>
          <div>
            <div style="font-weight:700; font-size:1rem;">${s.name}</div>
            <div style="font-size:0.75rem; color:var(--text-dim);">${s.district || 'Lagos'} · by @${s.by || 'player'}</div>
          </div>
        </div>
        <span class="meta-pill highlight">⭐ ${s.rating || '3.5'}</span>
      </div>

      <div style="width:100%; font-size:0.8rem; color:var(--text-muted);">
        ${(s.shop?.items || []).slice(0, 3).map(it => `
          <div style="display:flex; justify-content:space-between; padding:0.25rem 0; border-bottom:1px dashed rgba(255,255,255,0.05);">
            <span>${it.p}</span>
            <strong style="color:var(--emerald-400);">${formatNaira(it.price)}</strong>
          </div>
        `).join('')}
      </div>

      <button class="btn btn-secondary" style="width:100%; font-size:0.75rem; padding:0.4rem;" onclick="buyStoreItem('${s.name}')">
        Order from Store
      </button>
    </div>
  `).join('');
}

window.buyStoreItem = function(storeName) {
  showToast('Store Order Placed', `🛍️ Placed fast delivery order with ${storeName}! Delivery dispatcher dispatched.`, 'success');
};

// -------------------------------------------------------------
// Cloud & Save Management
// -------------------------------------------------------------
window.syncWithCloud = async function() {
  showToast('Cloud Sync', '☁️ Pushing active state to live server (lagoslife.eliysites.com)...', 'info');

  try {
    const payload = {
      game: gameState,
      base: gameState.updatedAt || 1791381710558,
      replace: Date.now()
    };

    const res = await fetch('/api/save', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const data = await res.json();
      if (data.updatedAt) gameState.updatedAt = data.updatedAt;
      saveStateLocally();
      showToast('Live Server Synchronized!', `☁️ Updated on official server (lagoslife.eliysites.com)! Timestamp: ${data.updatedAt}`, 'success');
    } else {
      showToast('Cloud Notice', 'Local state saved! (Remote returned status: ' + res.status + ')', 'info');
    }
  } catch (err) {
    showToast('Saved Locally', 'Saved to browser storage! Offline mode operational.', 'info');
  }
};

window.exportSaveFile = function() {
  const blob = new Blob([JSON.stringify(gameState, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `lagos-life-save-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Export Complete', '📥 Downloaded save file successfully!', 'success');
};

window.importSaveFile = function(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const data = JSON.parse(event.target.result);
      const imported = data.state?.game || data.game || data;
      if (imported) {
        gameState = Object.assign({}, DEFAULT_GAME_STATE, imported);
        saveStateLocally();
        renderUI();
        showToast('Import Succeeded', '📤 Loaded new save state into client!', 'success');
      }
    } catch (err) {
      showToast('Import Error', 'Invalid JSON file format!', 'danger');
    }
  };
  reader.readAsText(file);
};

window.resetSaveBackup = function() {
  if (confirm('Reset state back to the original Trillionaire backup?')) {
    gameState = JSON.parse(JSON.stringify(DEFAULT_GAME_STATE));
    saveStateLocally();
    renderUI();
    showToast('State Reset', 'Restored pristine trillionaire backup!', 'info');
  }
};

// -------------------------------------------------------------
// Automated Wire Transfer Bureau Engine (/api/send)
// -------------------------------------------------------------
let transferRunning = false;
let transferAbortRequested = false;

function appendTransferLog(msg) {
  const box = document.getElementById('transfer-log-box');
  if (!box) return;
  const timeStr = new Date().toLocaleTimeString();
  box.textContent += `[${timeStr}] ${msg}\n`;
  box.scrollTop = box.scrollHeight;
}

window.clearTransferConsole = function() {
  const box = document.getElementById('transfer-log-box');
  if (box) box.textContent = '';
};

window.stopAutomatedTransfers = function() {
  if (!transferRunning) return;
  transferAbortRequested = true;
  appendTransferLog('⚠️ Abort requested by user. Halting execution...');
  const badge = document.getElementById('transfer-status-badge');
  if (badge) {
    badge.innerText = 'ABORTED';
    badge.style.color = 'var(--gold-400)';
  }
};

window.startAutomatedTransfers = async function() {
  if (transferRunning) return;

  const recipient = document.getElementById('transfer-recipient-id')?.value.trim();
  const amount = parseInt(document.getElementById('transfer-batch-amount')?.value, 10) || 10000000000;
  const cycles = parseInt(document.getElementById('transfer-cycles-count')?.value, 10) || 10;
  const delaySec = 62; // Mandatory 62s delay (server enforces 60s per-transfer limit)

  if (!recipient) {
    showToast('Missing Recipient', 'Please enter a valid recipient account ID!', 'danger');
    return;
  }

  if (amount > 10000000000) {
    showToast('Batch Ceiling', 'Maximum transfer per batch is ₦10,000,000,000!', 'danger');
    return;
  }

  transferRunning = true;
  transferAbortRequested = false;

  const btnStart = document.getElementById('btn-start-transfer');
  const btnStop = document.getElementById('btn-stop-transfer');
  const badge = document.getElementById('transfer-status-badge');
  const progressText = document.getElementById('transfer-progress-text');
  const timerText = document.getElementById('transfer-timer-text');
  const progressBar = document.getElementById('transfer-progress-bar');

  if (btnStart) btnStart.disabled = true;
  if (btnStop) btnStop.disabled = false;
  if (badge) {
    badge.innerText = 'PROCESSING';
    badge.style.color = 'var(--emerald-400)';
  }

  appendTransferLog(`=== STARTING WIRE BATCH: ${cycles} Transfers of ${formatNaira(amount)} to ${recipient} ===`);

  let successfulTransfers = 0;
  let totalTransferred = 0;

  for (let i = 0; i < cycles; i++) {
    if (transferAbortRequested) {
      appendTransferLog('🛑 Batch transfers halted by user.');
      break;
    }

    if (progressText) {
      progressText.innerText = `Status: Sending Batch #${i + 1} of ${cycles}...`;
    }

    appendTransferLog(`Initiating Transfer #${i + 1}/${cycles}...`);

    try {
      const res = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: recipient, amount: amount })
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 200 && data.ok) {
        successfulTransfers++;
        totalTransferred += amount;
        appendTransferLog(`✅ Transfer #${i + 1} SUCCESS! ID: ${data.id} | Amount: ${formatNaira(amount)} (Fee: ₦${data.fee || 50})`);
        
        // Refresh local wallet balance from live server
        await loadSavedState();
        renderUI();
        spawnCashParticles(8);
      } else if (res.status === 429) {
        appendTransferLog(`⏳ HTTP 429: Server cooldown triggered (${data.error || 'Too many tries'}). Waiting 65s extra backoff...`);
        for (let cd = 65; cd > 0; cd--) {
          if (transferAbortRequested) break;
          if (timerText) timerText.innerText = `429 Backoff: ${cd}s`;
          await new Promise(r => setTimeout(r, 1000));
        }
        i--; // Retry this transfer
        continue;
      } else {
        appendTransferLog(`❌ Transfer #${i + 1} Failed: HTTP ${res.status} - ${JSON.stringify(data)}`);
      }
    } catch (err) {
      appendTransferLog(`❌ Network error on Transfer #${i + 1}: ${err.message}`);
    }

    // Wait mandatory 62s cooldown if more batches remain
    if (i < cycles - 1 && !transferAbortRequested) {
      appendTransferLog(`⏳ Pacing cooldown: Waiting 62s before next batch to prevent 429...`);
      for (let sec = delaySec; sec > 0; sec--) {
        if (transferAbortRequested) break;
        if (timerText) timerText.innerText = `Cooldown: ${sec}s`;
        if (progressBar) progressBar.style.width = `${((delaySec - sec) / delaySec) * 100}%`;
        await new Promise(r => setTimeout(r, 1000));
      }
      if (progressBar) progressBar.style.width = '0%';
    }
  }

  transferRunning = false;
  if (btnStart) btnStart.disabled = false;
  if (btnStop) btnStop.disabled = true;
  if (badge) {
    badge.innerText = 'FINISHED';
    badge.style.color = 'var(--emerald-400)';
  }
  if (progressText) {
    progressText.innerText = `Completed: ${successfulTransfers}/${cycles} Batches Sent (${formatNaira(totalTransferred)})`;
  }
  if (timerText) timerText.innerText = `Cooldown: 0s`;
  if (progressBar) progressBar.style.width = '100%';

  appendTransferLog(`=== WIRE BATCH FINISHED: ${successfulTransfers} of ${cycles} sent (${formatNaira(totalTransferred)}) ===`);
  showToast('Wire Transfers Concluded', `Transferred ${formatNaira(totalTransferred)} across ${successfulTransfers} batches!`, 'success');
};

// -------------------------------------------------------------
// Live Radio & Soundtrack Engine
// -------------------------------------------------------------
let audioElem = null;

function initAudio() {
  audioElem = document.getElementById('audio-player');
}

window.toggleAudio = function() {
  if (!audioElem) return;

  const btnLabel = document.getElementById('radio-btn-label');
  const btnIcon = document.getElementById('radio-icon');

  if (isAudioPlaying) {
    audioElem.pause();
    isAudioPlaying = false;
    if (btnLabel) btnLabel.innerText = 'Play Radio';
    if (btnIcon) btnIcon.innerText = '▶️';
    showToast('Radio Paused', 'Audio playback paused', 'info');
  } else {
    // Determine active stream
    const picker = document.getElementById('station-picker');
    let src = picker ? picker.value : 'over';
    if (src === 'over') {
      audioElem.src = '/api/music/file/OVER_bigbanju.mp3';
    } else {
      audioElem.src = src;
    }

    audioElem.play().then(() => {
      isAudioPlaying = true;
      if (btnLabel) btnLabel.innerText = 'Pause Radio';
      if (btnIcon) btnIcon.innerText = '⏸️';
      showToast('Radio Playing', 'Broadcasting live audio stream!', 'success');
    }).catch(err => {
      console.warn('Playback error (browser policy / network)', err);
      showToast('Playback Notice', 'Click again or allow audio permissions to stream.', 'info');
    });
  }
};

window.changeStation = function(e) {
  const val = e.target.value;
  const titleEl = document.getElementById('current-station-title');
  const songEl = document.getElementById('current-song-title');

  if (val === 'over') {
    if (titleEl) titleEl.innerText = 'Soundtrack: OVER — BigBanju';
    if (songEl) songEl.innerText = 'Lagos Life Official Original Score';
  } else {
    const selectedText = e.target.options[e.target.selectedIndex].text;
    if (titleEl) titleEl.innerText = selectedText;
    if (songEl) songEl.innerText = 'Live Zeno FM Stream · Lagos, NG';
  }

  if (isAudioPlaying) {
    if (val === 'over') {
      audioElem.src = '/api/music/file/OVER_bigbanju.mp3';
    } else {
      audioElem.src = val;
    }
    audioElem.play().catch(e => console.warn(e));
  }
};

window.setVolume = function(e) {
  if (audioElem) {
    audioElem.volume = parseFloat(e.target.value);
  }
};

// -------------------------------------------------------------
// Toast Shelf
// -------------------------------------------------------------
function showToast(title, msg, type = 'info') {
  const shelf = document.getElementById('toast-shelf');
  if (!shelf) return;

  const toast = document.createElement('div');
  toast.className = `toast-pill ${type}`;
  toast.innerHTML = `
    <div style="font-weight:700; font-size:0.85rem; margin-bottom:0.15rem;">${title}</div>
    <div style="font-size:0.75rem; color:var(--text-muted);">${msg}</div>
  `;

  shelf.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 350);
  }, 3500);
}
