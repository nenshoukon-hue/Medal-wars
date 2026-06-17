// ═══════════════════════════════════════════════════════════
// MEDAL WARS — Cosmetic Store
// One-time cosmetic purchases via Stripe Checkout (test or live).
// Entitlements are keyed by player token and persisted to R2.
// Server-authoritative: the client must ASK what a player owns;
// it never trusts the client's local flags.
// ═══════════════════════════════════════════════════════════
const crypto = require('crypto');

// ── Stripe (optional). If STRIPE_SECRET_KEY is unset, the store runs in
//    "preview" mode: catalog is visible, checkout returns a simulated grant
//    so you can see the whole flow work before wiring real payments. ──
let stripe = null;
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || null;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || null;
const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL || ''; // e.g. https://medal-wars.up.railway.app
try {
  if (STRIPE_SECRET_KEY) {
    stripe = require('stripe')(STRIPE_SECRET_KEY);
    console.log('[store] Stripe enabled (' + (STRIPE_SECRET_KEY.startsWith('sk_test') ? 'TEST mode' : 'LIVE mode') + ').');
  } else {
    console.log('[store] STRIPE_SECRET_KEY not set — store runs in PREVIEW mode (simulated grants).');
  }
} catch (e) {
  console.warn('[store] "stripe" package not installed — store runs in PREVIEW mode. Run: npm i stripe');
}

// ── CATALOG ──────────────────────────────────────────────
// Each pack unlocks a set of cosmetic art/music keys in the client.
// `priceCents` is USD. `items` are the cosmetic keys the client recognizes.
// IMPORTANT: when adding Stripe, set each pack's `stripePriceId` (price_xxx)
// in your Stripe dashboard, OR leave null to use ad-hoc price_data (works in test).
const CATALOG = [
  {
    id: 'pack_neon_arenas',
    name: 'Neon Arenas',
    blurb: 'Three synthwave battlefield backgrounds.',
    priceCents: 299,
    type: 'battlefield',
    stripePriceId: null,
    items: ['cos_bg_neon_1', 'cos_bg_neon_2', 'cos_bg_neon_3']
  },
  {
    id: 'pack_chrome_bots',
    name: 'Chrome Finish',
    blurb: 'Metallic alt art for the starter bots.',
    priceCents: 399,
    type: 'cardart',
    stripePriceId: null,
    items: ['cos_art_chrome_metabee', 'cos_art_chrome_rokusho', 'cos_art_chrome_warbandit']
  },
  {
    id: 'pack_ost_vol1',
    name: 'Soundtrack Vol. 1',
    blurb: 'Three extra battle themes for any stage.',
    priceCents: 299,
    type: 'music',
    stripePriceId: null,
    items: ['cos_bgm_ost_1', 'cos_bgm_ost_2', 'cos_bgm_ost_3']
  },
  {
    id: 'pack_founder',
    name: 'Founder Bundle',
    blurb: 'Everything above + an exclusive Founder badge.',
    priceCents: 799,
    type: 'bundle',
    stripePriceId: null,
    items: [
      'cos_bg_neon_1', 'cos_bg_neon_2', 'cos_bg_neon_3',
      'cos_art_chrome_metabee', 'cos_art_chrome_rokusho', 'cos_art_chrome_warbandit',
      'cos_bgm_ost_1', 'cos_bgm_ost_2', 'cos_bgm_ost_3',
      'cos_badge_founder'
    ]
  }
];
const CATALOG_BY_ID = Object.fromEntries(CATALOG.map(p => [p.id, p]));

// ── Entitlement ledger: token -> { owned:[itemKey], packs:[packId], history:[...] } ──
let LEDGER = {};
// Pending checkouts (sessionId -> {token, packId}) so the webhook can grant on success.
let PENDING = {};
let _R2 = null;
let _dirty = false;
const STORE_FILE = 'store_entitlements.json';

function init(r2) {
  _R2 = r2;
  if (_R2 && _R2.enabled()) {
    _R2.getJson(STORE_FILE).then(data => {
      if (data && data.ledger) {
        LEDGER = data.ledger;
        PENDING = data.pending || {};
        console.log('[store] Loaded entitlements for ' + Object.keys(LEDGER).length + ' players from R2.');
      }
    }).catch(() => console.log('[store] No existing entitlement store; starting fresh.'));
  } else {
    console.log('[store] R2 disabled — entitlements are in-memory only (reset on restart).');
  }
  const iv = setInterval(persist, 20000); if (iv.unref) iv.unref();
}

async function persist() {
  if (!_dirty || !_R2 || !_R2.enabled()) return;
  _dirty = false;
  try { await _R2.putJson(STORE_FILE, { ledger: LEDGER, pending: PENDING, savedAt: Date.now() }); }
  catch (e) { console.warn('[store] persist failed:', e.message); _dirty = true; }
}

function _rec(token) {
  if (!LEDGER[token]) LEDGER[token] = { owned: [], packs: [], history: [] };
  return LEDGER[token];
}

// Grant a pack's items to a token (idempotent — re-granting is harmless).
function grant(token, packId, meta) {
  const pack = CATALOG_BY_ID[packId];
  if (!pack) return { ok: false, error: 'unknown_pack' };
  const rec = _rec(token);
  if (!rec.packs.includes(packId)) rec.packs.push(packId);
  for (const it of pack.items) if (!rec.owned.includes(it)) rec.owned.push(it);
  rec.history.push({ packId, at: Date.now(), via: (meta && meta.via) || 'grant', ref: (meta && meta.ref) || null });
  _dirty = true;
  return { ok: true, owned: rec.owned, packs: rec.packs };
}

// What a player owns (server-authoritative). Always returns owned item keys.
function entitlements(token) {
  const rec = LEDGER[token];
  return {
    owned: rec ? rec.owned.slice() : [],
    packs: rec ? rec.packs.slice() : []
  };
}

function catalogPublic() {
  // Never leak stripePriceId or item lists beyond what the client needs to render.
  return CATALOG.map(p => ({
    id: p.id, name: p.name, blurb: p.blurb, priceCents: p.priceCents,
    type: p.type, items: p.items
  }));
}

function previewMode() { return !stripe; }

// Create a checkout session. In preview mode, returns a simulated success URL
// AND immediately marks the pack as granted (so you can test the unlock path).
async function createCheckout(token, packId, origin) {
  const pack = CATALOG_BY_ID[packId];
  if (!pack) return { ok: false, error: 'unknown_pack' };
  if (!token) return { ok: false, error: 'no_token' };

  // Already owned? Short-circuit.
  const ent = entitlements(token);
  if (ent.packs.includes(packId)) return { ok: true, alreadyOwned: true };

  const base = PUBLIC_BASE_URL || origin || '';

  // ACCESSORIES ARE FREE — always grant directly, never route through Stripe.
  // (The client shows no price; charging money here would be a dangerous mismatch.)
  grant(token, packId, { via: 'free_unlock' });
  return {
    ok: true,
    preview: true,
    message: 'Accessory unlocked — no payment required.',
    url: (base ? base : '') + '/?store=unlock_success&pack=' + encodeURIComponent(packId)
  };

  // LIVE/TEST STRIPE: create a hosted Checkout session.
  try {
    const lineItem = pack.stripePriceId
      ? { price: pack.stripePriceId, quantity: 1 }
      : {
          quantity: 1,
          price_data: {
            currency: 'usd',
            unit_amount: pack.priceCents,
            product_data: { name: 'Medal Wars — ' + pack.name, description: pack.blurb }
          }
        };
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [lineItem],
      // Tie the purchase back to this player + pack so the webhook can grant.
      client_reference_id: token,
      metadata: { token, packId },
      success_url: (base || '') + '/?store=success&pack=' + encodeURIComponent(packId) + '&sid={CHECKOUT_SESSION_ID}',
      cancel_url: (base || '') + '/?store=cancel'
    });
    PENDING[session.id] = { token, packId, at: Date.now() };
    _dirty = true;
    return { ok: true, url: session.url, sessionId: session.id };
  } catch (e) {
    console.warn('[store] checkout create failed:', e.message);
    return { ok: false, error: 'checkout_failed' };
  }
}

// Stripe webhook: verify signature, grant on completed checkout.
// Returns { status, body } for the HTTP layer to send.
function handleWebhook(rawBody, sigHeader) {
  if (!stripe) return { status: 200, body: '{"ok":true,"preview":true}' };
  let event;
  try {
    if (STRIPE_WEBHOOK_SECRET) {
      event = stripe.webhooks.constructEvent(rawBody, sigHeader, STRIPE_WEBHOOK_SECRET);
    } else {
      // No webhook secret configured — parse without verification (NOT for production).
      event = JSON.parse(rawBody.toString('utf8'));
      console.warn('[store] webhook signature NOT verified (set STRIPE_WEBHOOK_SECRET).');
    }
  } catch (e) {
    console.warn('[store] webhook verify failed:', e.message);
    return { status: 400, body: 'bad_signature' };
  }

  if (event.type === 'checkout.session.completed') {
    const s = event.data.object;
    const token = (s.metadata && s.metadata.token) || s.client_reference_id;
    const packId = s.metadata && s.metadata.packId;
    if (token && packId) {
      grant(token, packId, { via: 'stripe', ref: s.id });
      delete PENDING[s.id];
      _dirty = true;
      console.log('[store] granted ' + packId + ' to ' + token.slice(0, 8) + '… via Stripe.');
    }
  }
  return { status: 200, body: '{"received":true}' };
}

// Fallback verification: client returns from Checkout with a session id.
// Confirm with Stripe that it's paid, then grant (covers webhook-miss cases).
async function confirmSession(token, sessionId) {
  if (!stripe) return { ok: true, preview: true };
  try {
    const s = await stripe.checkout.sessions.retrieve(sessionId);
    if (s && s.payment_status === 'paid') {
      const pid = (s.metadata && s.metadata.packId);
      const tok = (s.metadata && s.metadata.token) || token;
      if (pid && tok) { grant(tok, pid, { via: 'confirm', ref: s.id }); return { ok: true, granted: pid }; }
    }
    return { ok: false, error: 'not_paid' };
  } catch (e) {
    return { ok: false, error: 'confirm_failed' };
  }
}

// Issue a stable play-token for users who don't have a beta token.
function issueToken() { return 'pt_' + crypto.randomBytes(20).toString('hex'); }

module.exports = {
  init, persist, catalogPublic, entitlements, grant,
  createCheckout, handleWebhook, confirmSession, previewMode, issueToken
};
