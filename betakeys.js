// ═══════════════════════════════════════════════════════════
// MEDAL WARS — Beta Key System
// Server-side key allowlist + redemption. Keys gate ONLINE play.
// Persisted to R2 when available, else in-memory (resets on restart).
// ═══════════════════════════════════════════════════════════
const crypto = require('crypto');

// In-memory store: code -> { claimed:bool, token:string|null, claimedAt:number|null, note:string }
let KEYS = {};
let TOKENS = {}; // token -> code (reverse lookup for validation)
let _R2 = null;
let _dirty = false;
const KEYS_FILE = 'beta_keys.json';

// Admin secret — set ADMIN_SECRET in Railway env. Without it, admin endpoints are disabled.
const ADMIN_SECRET = process.env.ADMIN_SECRET || null;

function init(r2) {
  _R2 = r2;
  if (_R2 && _R2.enabled()) {
    _R2.getJson(KEYS_FILE).then(data => {
      if (data && data.keys) {
        KEYS = data.keys;
        // Rebuild token index
        TOKENS = {};
        for (const [code, rec] of Object.entries(KEYS)) {
          if (rec.token) TOKENS[rec.token] = code;
        }
        console.log(`[betakeys] Loaded ${Object.keys(KEYS).length} keys from R2.`);
      }
    }).catch(() => console.log('[betakeys] No existing key store; starting fresh.'));
  } else {
    console.log('[betakeys] R2 disabled — keys are in-memory only (reset on restart).');
  }
  // Periodic persist
  const _iv=setInterval(persist, 30000); if(_iv.unref)_iv.unref();
}

async function persist() {
  if (!_dirty || !_R2 || !_R2.enabled()) return;
  _dirty = false;
  try { await _R2.putJson(KEYS_FILE, { keys: KEYS, savedAt: Date.now() }); }
  catch (e) { console.warn('[betakeys] persist failed:', e.message); _dirty = true; }
}

// Generate a readable key like MW-7F3A-9K2D (unambiguous alphabet)
const ALPHA = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function genCode() {
  const seg = () => Array.from({ length: 4 }, () =>
    ALPHA[crypto.randomInt(ALPHA.length)]).join('');
  return `MW-${seg()}-${seg()}`;
}

// Create N new keys. Returns array of codes.
function generate(n, note) {
  const made = [];
  for (let i = 0; i < n; i++) {
    let code;
    do { code = genCode(); } while (KEYS[code]);
    KEYS[code] = { claimed: false, token: null, claimedAt: null, note: note || '' };
    made.push(code);
  }
  _dirty = true;
  return made;
}

// Redeem a key. Returns { ok, token } or { ok:false, error }.
// Idempotent: redeeming an already-claimed key with no token issue returns its token
// only if the same key is re-entered (lets a player recover their session).
function redeem(rawCode) {
  const code = (rawCode || '').toUpperCase().trim();
  if (!code || !/^MW-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(code)) {
    return { ok: false, error: 'invalid_format' };
  }
  const rec = KEYS[code];
  if (!rec) return { ok: false, error: 'not_found' };
  if (rec.claimed && rec.token) {
    // Allow the same key to return its token again (recovery), keeps it single-seat.
    return { ok: true, token: rec.token, recovered: true };
  }
  // First claim
  const token = crypto.randomBytes(24).toString('hex');
  rec.claimed = true;
  rec.token = token;
  rec.claimedAt = Date.now();
  TOKENS[token] = code;
  _dirty = true;
  return { ok: true, token };
}

// Validate a session token (used to gate online play).
function validToken(token) {
  return !!(token && TOKENS[token]);
}

// Admin: list keys (claimed status). Requires secret.
function list() {
  return Object.entries(KEYS).map(([code, r]) => ({
    code, claimed: r.claimed, claimedAt: r.claimedAt, note: r.note
  }));
}

// Admin: revoke a key (e.g. abuse). Frees the code and kills its token.
function revoke(rawCode) {
  const code = (rawCode || '').toUpperCase().trim();
  const rec = KEYS[code];
  if (!rec) return { ok: false, error: 'not_found' };
  if (rec.token) delete TOKENS[rec.token];
  delete KEYS[code];
  _dirty = true;
  return { ok: true };
}

function checkAdmin(secret) {
  return ADMIN_SECRET && secret === ADMIN_SECRET;
}

function adminEnabled() { return !!ADMIN_SECRET; }

function stats() {
  const all = Object.values(KEYS);
  return { total: all.length, claimed: all.filter(k => k.claimed).length };
}

module.exports = {
  init, generate, redeem, validToken, list, revoke,
  checkAdmin, adminEnabled, stats, persist
};
