// ═══════════════════════════════════════════════════════════
// MEDAL WARS — Ranked System (ELO + tiers + persistence)
// Player identity is keyed off the beta token (anonymous).
// ═══════════════════════════════════════════════════════════

let _R2 = null;
let _dirty = false;
const RANK_FILE = 'rankings.json';

// playerId -> { rating, wins, losses, games, name, updatedAt }
let PLAYERS = {};

const START_RATING = 1000;
const K = 32; // ELO K-factor (higher = faster movement; good for a small beta)

// Rank tiers by rating
const TIERS = [
  { name: 'Bronze',   min: 0,    color: '#cd7f32' },
  { name: 'Silver',   min: 1100, color: '#c0c0c0' },
  { name: 'Gold',     min: 1250, color: '#ffd700' },
  { name: 'Platinum', min: 1400, color: '#5fd0d0' },
  { name: 'Diamond',  min: 1550, color: '#7fb0ff' },
  { name: 'Master',   min: 1700, color: '#c060ff' },
  { name: 'Grandmaster', min: 1850, color: '#ff5050' },
];

function init(r2) {
  _R2 = r2;
  if (_R2 && _R2.enabled()) {
    _R2.getJson(RANK_FILE).then(data => {
      if (data && data.players) {
        PLAYERS = data.players;
        console.log(`[ranked] Loaded ${Object.keys(PLAYERS).length} player ratings.`);
      }
    }).catch(() => console.log('[ranked] No existing rankings; starting fresh.'));
  } else {
    console.log('[ranked] R2 disabled — ratings in-memory only.');
  }
  const iv = setInterval(persist, 30000);
  if (iv.unref) iv.unref();
}

async function persist() {
  if (!_dirty || !_R2 || !_R2.enabled()) return;
  _dirty = false;
  try { await _R2.putJson(RANK_FILE, { players: PLAYERS, savedAt: Date.now() }); }
  catch (e) { console.warn('[ranked] persist failed:', e.message); _dirty = true; }
}

function tierFor(rating) {
  let tier = TIERS[0];
  for (const t of TIERS) if (rating >= t.min) tier = t;
  return tier;
}

function ensure(playerId, name) {
  if (!PLAYERS[playerId]) {
    PLAYERS[playerId] = { rating: START_RATING, wins: 0, losses: 0, games: 0, name: name || 'Medafighter', updatedAt: Date.now() };
    _dirty = true;
  } else if (name && PLAYERS[playerId].name !== name) {
    PLAYERS[playerId].name = name; _dirty = true;
  }
  return PLAYERS[playerId];
}

function getProfile(playerId) {
  const p = PLAYERS[playerId];
  if (!p) return null;
  const tier = tierFor(p.rating);
  return { rating: p.rating, wins: p.wins, losses: p.losses, games: p.games,
           name: p.name, tier: tier.name, tierColor: tier.color };
}

// Expected score for A vs B (standard ELO)
function expected(ra, rb) { return 1 / (1 + Math.pow(10, (rb - ra) / 400)); }

// Apply a result. winnerId beat loserId. Returns { winner, loser } new profiles + deltas.
function applyResult(winnerId, loserId, winnerName, loserName) {
  const w = ensure(winnerId, winnerName);
  const l = ensure(loserId, loserName);
  const ew = expected(w.rating, l.rating);
  const el = expected(l.rating, w.rating);
  const wDelta = Math.round(K * (1 - ew));
  const lDelta = Math.round(K * (0 - el));
  w.rating += wDelta; w.wins++; w.games++; w.updatedAt = Date.now();
  l.rating = Math.max(0, l.rating + lDelta); l.losses++; l.games++; l.updatedAt = Date.now();
  _dirty = true;
  persist();
  return {
    winner: { ...getProfile(winnerId), delta: wDelta },
    loser:  { ...getProfile(loserId),  delta: lDelta },
  };
}

// Leaderboard: top N by rating
function leaderboard(n) {
  return Object.entries(PLAYERS)
    .map(([id, p]) => ({ name: p.name, rating: p.rating, wins: p.wins, losses: p.losses, tier: tierFor(p.rating).name, tierColor: tierFor(p.rating).color }))
    .sort((a, b) => b.rating - a.rating)
    .slice(0, n || 20);
}

module.exports = { init, ensure, getProfile, applyResult, leaderboard, tierFor, persist, TIERS, START_RATING };
