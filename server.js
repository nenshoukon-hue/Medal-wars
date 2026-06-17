// ═══════════════════════════════════════════════════════════
// MEDAL WARS — Multiplayer Relay Server
// Room-code matchmaking + trust-based move relay.
// Node 18+, single dependency: ws
// ═══════════════════════════════════════════════════════════
const http = require('http');
const { WebSocketServer } = require('ws');
const R2 = require('./r2');
const BetaKeys = require('./betakeys');
const Ranked = require('./ranked');
const Store = require('./store');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8080;
const MW_SERVER_BUILD = 'v4.0'; // keep in sync with the client's MW_BUILD so checkDeploySync() is meaningful

// Beta-key gating toggle. Set BETA_GATE=on in Railway to require keys for online play.
const BETA_GATE = process.env.BETA_GATE === 'on';
BetaKeys.init(R2);
Ranked.init(R2);
Store.init(R2);

// Matchmaking queue: array of { ws, playerId, rating, deck, mf, joinedAt }
const rankedQueue = [];

// Serve the game HTML file — loaded once at startup, cached in memory.
// Name it "game.html" and put it alongside server.js in the repo.
let GAME_HTML = null;
const GAME_PATH = path.join(__dirname, 'game.html');
try {
  GAME_HTML = fs.readFileSync(GAME_PATH, 'utf8');
  console.log(`[game] Loaded game.html (${Math.round(GAME_HTML.length/1024)}KB)`);
} catch (e) {
  console.warn('[game] game.html not found — game serving disabled. Add game.html to the repo.');
}

// Read a request body up to a size cap, parse JSON.
function readJsonBody(req, cap, cb) {
  let body = '';
  let tooBig = false;
  req.on('data', (chunk) => {
    body += chunk;
    if (body.length > cap) { tooBig = true; req.destroy(); }
  });
  req.on('end', () => {
    if (tooBig) return cb(new Error('too_large'));
    try { cb(null, JSON.parse(body)); }
    catch (e) { cb(new Error('bad_json')); }
  });
  req.on('error', () => cb(new Error('req_error')));
}

function readRawBody(req, cap, cb) {
  const chunks = []; let size = 0; let tooBig = false;
  req.on('data', (chunk) => { size += chunk.length; if (size > cap) { tooBig = true; req.destroy(); } else chunks.push(chunk); });
  req.on('end', () => { if (tooBig) return cb(new Error('too_large')); cb(null, Buffer.concat(chunks)); });
  req.on('error', () => cb(new Error('req_error')));
}

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

// ── In-memory room store ──────────────────────────────────
// rooms: code -> { players: [ws, ws], deck: {0:?,1:?}, createdAt, hostSeed }
const rooms = new Map();

// 4-char room codes, unambiguous alphabet (no 0/O/1/I)
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function makeCode() {
  let code;
  do {
    code = '';
    for (let i = 0; i < 4; i++) code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  } while (rooms.has(code));
  return code;
}

// ── Matchmaking: pair the two closest-rated waiting players ──
function tryMatch() {
  // Drop dead sockets
  for (let i = rankedQueue.length - 1; i >= 0; i--) {
    const q = rankedQueue[i];
    if (!q.ws || q.ws.readyState !== q.ws.OPEN) rankedQueue.splice(i, 1);
  }
  if (rankedQueue.length < 2) return;
  // Sort by rating, pair adjacent (closest skill). Widen tolerance with wait time.
  rankedQueue.sort((a, b) => a.rating - b.rating);
  for (let i = 0; i < rankedQueue.length - 1; i++) {
    const a = rankedQueue[i], b = rankedQueue[i + 1];
    const gap = Math.abs(a.rating - b.rating);
    const waited = Math.min(Date.now() - a.joinedAt, Date.now() - b.joinedAt);
    const tolerance = 100 + Math.floor(waited / 1000) * 40; // +40 rating/sec waited
    if (gap <= tolerance) {
      // Pair them
      rankedQueue.splice(i, 2);
      const code = makeCode();
      const hostSeed = Math.floor(Math.random() * 2147483647);
      a.ws.roomCode = code; a.ws.seat = 0;
      b.ws.roomCode = code; b.ws.seat = 1;
      rooms.set(code, {
        players: [a.ws, b.ws],
        deck: { 0: a.deck, 1: b.deck },
        mf: { 0: a.mf, 1: b.mf },
        createdAt: Date.now(), hostSeed, started: true,
        ranked: true, playerIds: { 0: a.playerId, 1: b.playerId }
      });
      const pa = Ranked.getProfile(a.playerId), pb = Ranked.getProfile(b.playerId);
      console.log(`[match] ranked: ${a.playerId}(${a.rating}) vs ${b.playerId}(${b.rating}) -> room ${code}`);
      send(a.ws, 'match_found', { code, seat: 0, seed: hostSeed, oppDeck: b.deck, oppMf: b.mf, oppName: pb.name, oppRating: pb.rating, oppTier: pb.tier, ranked: true });
      send(b.ws, 'match_found', { code, seat: 1, seed: hostSeed, oppDeck: a.deck, oppMf: a.mf, oppName: pa.name, oppRating: pa.rating, oppTier: pa.tier, ranked: true });
      // Fair coin flip — server decides who goes first (neither client can rig it)
      const rankedFirst = Math.random() < 0.5 ? 0 : 1;
      rooms.get(code).firstSeat = rankedFirst;
      broadcast(rooms.get(code), 'match_start', { firstSeat: rankedFirst, coinFlip: true });
      return; // one match per tick; next tick handles more
    }
  }
}

function send(ws, type, payload) {
  if (ws && ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify({ type, ...payload }));
  }
}

function broadcast(room, type, payload, exceptWs) {
  for (const p of room.players) {
    if (p && p !== exceptWs) send(p, type, payload);
  }
}

function cleanupRoom(code) {
  const room = rooms.get(code);
  if (!room) return;
  if (room.players.every(p => !p || p.readyState !== p.OPEN)) {
    rooms.delete(code);
    console.log(`[room ${code}] closed (empty)`);
  }
}

// ── HTTP server (game serving + health + art upload + Railway listener) ──
const server = http.createServer((req, res) => {
  cors(res);

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  // Serve the game at / and /game
  if ((req.url === '/' || req.url === '/game') && req.method === 'GET') {
    if (GAME_HTML) {
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache' // always fresh — art bakes into file
      });
      res.end(GAME_HTML);
    } else {
      res.writeHead(503, { 'Content-Type': 'text/plain' });
      res.end('Game file not found. Add game.html to the server repo and redeploy.');
    }
    return;
  }

  // Health check (moved to /health)
  if (req.url === '/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', version: MW_SERVER_BUILD, features: { ranked: true, queue: true, betakeys: true }, rooms: rooms.size, queue: rankedQueue.length, uptime: process.uptime(), r2: R2.enabled() }));
    return;
  }

  // Tells the client whether shared art (R2) is available
  if (req.url === '/art/config' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ enabled: R2.enabled() }));
    return;
  }

  // Default art manifest: the published "default skin" for all players
  if (req.url === '/art/manifest' && req.method === 'GET') {
    if (!R2.enabled()) { res.writeHead(200, {'Content-Type':'application/json'}); res.end('{}'); return; }
    R2.getJson('default_manifest.json').then(m => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(m || {}));
    }).catch(() => { res.writeHead(200, {'Content-Type':'application/json'}); res.end('{}'); });
    return;
  }
  if (req.url === '/art/manifest' && req.method === 'POST') {
    if (!R2.enabled()) { res.writeHead(503, {'Content-Type':'application/json'}); res.end('{"error":"r2_disabled"}'); return; }
    readJsonBody(req, 1024 * 1024, async (err, data) => {
      if (err || !data || typeof data.manifest !== 'object') {
        res.writeHead(400, {'Content-Type':'application/json'}); res.end('{"error":"bad_manifest"}'); return;
      }
      try {
        await R2.putJson('default_manifest.json', data.manifest);
        res.writeHead(200, {'Content-Type':'application/json'});
        res.end(JSON.stringify({ ok: true, keys: Object.keys(data.manifest).length }));
      } catch (e) {
        res.writeHead(500, {'Content-Type':'application/json'}); res.end(JSON.stringify({error: e.message}));
      }
    });
    return;
  }

  // Upload one art image: POST { dataUrl, secret } → { url }
  // ADMIN-ONLY: shared art that other players can see must be approved by the
  // operator. This prevents arbitrary users from publishing inappropriate
  // content to a shared store. Per-player custom art stays LOCAL on the client
  // and is never sent here.
  if (req.url === '/art/upload' && req.method === 'POST') {
    if (!R2.enabled()) {
      res.writeHead(503, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'r2_disabled' }));
      return;
    }
    readJsonBody(req, 8 * 1024 * 1024, async (err, data) => {
      if (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
        return;
      }
      try {
        const url = await R2.uploadDataUrl(data.dataUrl);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ url }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message || 'upload_failed' }));
      }
    });
    return;
  }

  // ── BETA KEY: redeem a key, get a session token ──
  if (req.url === '/redeem' && req.method === 'POST') {
    readJsonBody(req, 4096, (err, data) => {
      if (err || !data || !data.code) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: 'bad_request' })); return;
      }
      const result = BetaKeys.redeem(data.code);
      res.writeHead(result.ok ? 200 : 400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
    });
    return;
  }

  // ── BETA KEY: check whether gating is even on (client asks at startup) ──
  if (req.url === '/beta/config' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ gate: BETA_GATE }));
    return;
  }

  // ── BETA KEY: validate an existing token ──
  if (req.url === '/beta/validate' && req.method === 'POST') {
    readJsonBody(req, 4096, (err, data) => {
      const ok = !err && data && BetaKeys.validToken(data.token);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: !!ok }));
    });
    return;
  }

  // ── ADMIN: verify secret (so client can validate before bulk operations) ──
  if (req.url === '/admin/check' && req.method === 'POST') {
    readJsonBody(req, 4096, (err, data) => {
      const ok = !err && data && BetaKeys.checkAdmin(data.secret);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: !!ok, adminConfigured: BetaKeys.adminEnabled() }));
    });
    return;
  }

  // ── ADMIN: generate keys. Requires ADMIN_SECRET. POST { secret, count, note } ──
  if (req.url === '/admin/keys/generate' && req.method === 'POST') {
    readJsonBody(req, 4096, (err, data) => {
      if (err || !data || !BetaKeys.checkAdmin(data.secret)) {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'forbidden' })); return;
      }
      const n = Math.min(Math.max(parseInt(data.count) || 1, 1), 500);
      const codes = BetaKeys.generate(n, data.note);
      BetaKeys.persist();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, codes }));
    });
    return;
  }

  // ── ADMIN: list keys. POST { secret } ──
  if (req.url === '/admin/keys/list' && req.method === 'POST') {
    readJsonBody(req, 4096, (err, data) => {
      if (err || !data || !BetaKeys.checkAdmin(data.secret)) {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'forbidden' })); return;
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, keys: BetaKeys.list(), stats: BetaKeys.stats() }));
    });
    return;
  }

  // ── ADMIN: revoke a key. POST { secret, code } ──
  if (req.url === '/admin/keys/revoke' && req.method === 'POST') {
    readJsonBody(req, 4096, (err, data) => {
      if (err || !data || !BetaKeys.checkAdmin(data.secret)) {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'forbidden' })); return;
      }
      const r = BetaKeys.revoke(data.code);
      BetaKeys.persist();
      res.writeHead(r.ok ? 200 : 404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(r));
    });
    return;
  }

  // ── RANKED: get a player's profile by token ──
  if (req.url === '/ranked/profile' && req.method === 'POST') {
    readJsonBody(req, 4096, (err, data) => {
      if (err || !data || !data.token) { res.writeHead(400,{'Content-Type':'application/json'}); res.end('{"error":"bad_request"}'); return; }
      const pid = 'p_' + data.token.slice(0, 16);
      const prof = Ranked.getProfile(pid) || Ranked.getProfile(Ranked.ensure(pid, data.name) && pid);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, profile: prof }));
    });
    return;
  }

  // ── RANKED: leaderboard ──
  if (req.url === '/ranked/leaderboard' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, board: Ranked.leaderboard(25) }));
    return;
  }

  // ═══ STORE ROUTES ═══════════════════════════════════════
  // Catalog (public). Client renders packs from this.
  if (req.url === '/store/catalog' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, preview: Store.previewMode(), catalog: Store.catalogPublic() }));
    return;
  }

  // Issue a play-token for users without a beta token (so anonymous players can own purchases).
  if (req.url === '/store/token' && req.method === 'POST') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, token: Store.issueToken() }));
    return;
  }

  // What does this player own? Server-authoritative — client must call this, not trust local flags.
  if (req.url === '/store/entitlements' && req.method === 'POST') {
    readJsonBody(req, 4096, (err, data) => {
      if (err || !data || !data.token) { res.writeHead(400,{'Content-Type':'application/json'}); res.end('{"ok":false,"error":"bad_request"}'); return; }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, ...Store.entitlements(data.token) }));
    });
    return;
  }

  // Begin a purchase. Returns a Stripe Checkout URL (or a simulated grant in preview mode).
  if (req.url === '/store/checkout' && req.method === 'POST') {
    readJsonBody(req, 4096, (err, data) => {
      if (err || !data || !data.token || !data.packId) { res.writeHead(400,{'Content-Type':'application/json'}); res.end('{"ok":false,"error":"bad_request"}'); return; }
      const origin = (req.headers.origin) || ('https://' + (req.headers.host || ''));
      Store.createCheckout(data.token, data.packId, origin).then(r => {
        res.writeHead(r.ok ? 200 : 400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(r));
      }).catch(() => { res.writeHead(500,{'Content-Type':'application/json'}); res.end('{"ok":false,"error":"server"}'); });
    });
    return;
  }

  // Confirm a returned Checkout session (fallback if the webhook is delayed/missed).
  if (req.url === '/store/confirm' && req.method === 'POST') {
    readJsonBody(req, 4096, (err, data) => {
      if (err || !data || !data.token || !data.sessionId) { res.writeHead(400,{'Content-Type':'application/json'}); res.end('{"ok":false,"error":"bad_request"}'); return; }
      Store.confirmSession(data.token, data.sessionId).then(r => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(r));
      }).catch(() => { res.writeHead(500,{'Content-Type':'application/json'}); res.end('{"ok":false}'); });
    });
    return;
  }

  // Stripe webhook — needs the RAW body for signature verification.
  if (req.url === '/store/webhook' && req.method === 'POST') {
    readRawBody(req, 1024 * 256, (err, raw) => {
      if (err) { res.writeHead(400); res.end('bad_body'); return; }
      const result = Store.handleWebhook(raw, req.headers['stripe-signature']);
      res.writeHead(result.status, { 'Content-Type': 'application/json' });
      res.end(result.body);
    });
    return;
  }

  res.writeHead(404);
  res.end();
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  ws.roomCode = null;
  ws.seat = null; // 0 = host, 1 = guest
  ws.isAlive = true;
  ws.on('pong', () => { ws.isAlive = true; });

  send(ws, 'connected', { msg: 'Welcome to Medal Wars online.' });

  ws.on('message', (data) => {
    let msg;
    try { msg = JSON.parse(data.toString()); }
    catch (e) { return send(ws, 'error', { msg: 'Bad message format.' }); }

    switch (msg.type) {

      // ── CREATE ROOM ───────────────────────────────────
      case 'create': {
        if (BETA_GATE && !BetaKeys.validToken(msg.token)) {
          return send(ws, 'error', { msg: 'A valid beta key is required for online play.', code: 'beta_required' });
        }
        const code = makeCode();
        // host seed: shared RNG seed so both clients deal identical mulligan if desired
        const hostSeed = Math.floor(Math.random() * 2147483647);
        rooms.set(code, {
          players: [ws, null],
          deck: { 0: msg.deck || null, 1: null },
          mf: { 0: msg.mf || null, 1: null },
          createdAt: Date.now(),
          hostSeed,
          started: false
        });
        ws.roomCode = code;
        ws.seat = 0;
        console.log(`[room ${code}] created by host (deck=${msg.deck})`);
        send(ws, 'created', { code, seat: 0, seed: hostSeed });
        break;
      }

      // ── RANKED QUEUE: join matchmaking ────────────────
      case 'queue': {
        if (BETA_GATE && !BetaKeys.validToken(msg.token)) {
          return send(ws, 'error', { msg: 'A valid beta key is required for ranked play.', code: 'beta_required' });
        }
        // Identity: prefer beta token; else a stable anonymous id the client sends; else socket id.
        let idSrc = msg.token || msg.anonId || ('anon_' + Math.random().toString(36).slice(2, 14));
        const playerId = 'p_' + String(idSrc).slice(0, 16);
        ws._wantName = msg.name;
        Ranked.ensure(playerId, msg.name);
        const prof = Ranked.getProfile(playerId);
        // Already queued? ignore duplicates
        if (rankedQueue.find(q => q.ws === ws)) return;
        // Remove any stale entries for this player id
        for (let i = rankedQueue.length - 1; i >= 0; i--) {
          if (rankedQueue[i].playerId === playerId) rankedQueue.splice(i, 1);
        }
        ws.playerId = playerId;
        rankedQueue.push({ ws, playerId, rating: prof.rating, deck: msg.deck || null, mf: msg.mf || null, joinedAt: Date.now() });
        send(ws, 'queued', { rating: prof.rating, tier: prof.tier, position: rankedQueue.length });
        console.log(`[queue] ${playerId} joined (rating ${prof.rating}); queue size ${rankedQueue.length}`);
        tryMatch();
        break;
      }

      // ── RANKED QUEUE: leave matchmaking ───────────────
      case 'queue_leave': {
        const idx = rankedQueue.findIndex(q => q.ws === ws);
        if (idx >= 0) { rankedQueue.splice(idx, 1); send(ws, 'queue_left', {}); }
        break;
      }


      // ── JOIN ROOM ─────────────────────────────────────
      case 'join': {
        if (BETA_GATE && !BetaKeys.validToken(msg.token)) {
          return send(ws, 'join_failed', { msg: 'A valid beta key is required for online play.', code: 'beta_required' });
        }
        const code = (msg.code || '').toUpperCase().trim();
        const room = rooms.get(code);
        if (!room) return send(ws, 'join_failed', { msg: 'Room not found. Check the code.' });
        if (room.players[1] && room.players[1].readyState === room.players[1].OPEN)
          return send(ws, 'join_failed', { msg: 'Room is full.' });
        room.players[1] = ws;
        room.deck[1] = msg.deck || null;
        room.mf[1] = msg.mf || null;
        ws.roomCode = code;
        ws.seat = 1;
        console.log(`[room ${code}] guest joined (deck=${msg.deck})`);
        // Tell guest they're in
        send(ws, 'joined', { code, seat: 1, seed: room.hostSeed, oppDeck: room.deck[0], oppMf: room.mf[0] });
        // Tell host the guest arrived — now both have full info
        send(room.players[0], 'opponent_joined', { oppDeck: room.deck[1], oppMf: room.mf[1] });
        room.started = true;
        // Fair coin flip — server decides who goes first (no host advantage)
        const firstSeat = Math.random() < 0.5 ? 0 : 1;
        room.firstSeat = firstSeat;
        broadcast(room, 'match_start', { firstSeat, coinFlip: true });
        break;
      }

      // ── RELAY A MOVE ──────────────────────────────────
      // Trust-based: server passes the move object straight to the opponent.
      case 'move': {
        const room = rooms.get(ws.roomCode);
        if (!room) return;
        broadcast(room, 'move', { move: msg.move, fromSeat: ws.seat }, ws);
        break;
      }

      // ── FULL STATE SYNC (optional reconciliation) ─────
      case 'sync': {
        const room = rooms.get(ws.roomCode);
        if (!room) return;
        broadcast(room, 'sync', { state: msg.state, fromSeat: ws.seat }, ws);
        break;
      }

      // ── END TURN signal ───────────────────────────────
      case 'end_turn': {
        const room = rooms.get(ws.roomCode);
        if (!room) return;
        broadcast(room, 'end_turn', { fromSeat: ws.seat }, ws);
        break;
      }

      // ── GAME OVER ─────────────────────────────────────
      case 'game_over': {
        const room = rooms.get(ws.roomCode);
        if (!room) return;
        broadcast(room, 'game_over', { winnerSeat: msg.winnerSeat, fromSeat: ws.seat }, ws);
        // Ranked: apply ELO once per match (guard against both clients reporting)
        if (room.ranked && !room.rankedApplied && (msg.winnerSeat === 0 || msg.winnerSeat === 1)) {
          room.rankedApplied = true;
          const wSeat = msg.winnerSeat, lSeat = wSeat === 0 ? 1 : 0;
          const winnerId = room.playerIds[wSeat], loserId = room.playerIds[lSeat];
          if (winnerId && loserId) {
            const result = Ranked.applyResult(winnerId, loserId);
            send(room.players[wSeat], 'rank_update', { you: result.winner, opponent: result.loser, won: true });
            send(room.players[lSeat], 'rank_update', { you: result.loser, opponent: result.winner, won: false });
            console.log(`[ranked] ${winnerId} +${result.winner.delta} (${result.winner.rating}) beat ${loserId} ${result.loser.delta} (${result.loser.rating})`);
          }
        }
        break;
      }

      // ── REMATCH request ───────────────────────────────
      case 'rematch': {
        const room = rooms.get(ws.roomCode);
        if (!room) return;
        room.hostSeed = Math.floor(Math.random() * 2147483647);
        // carry the sender's (possibly new) deck choice to the opponent
        broadcast(room, 'rematch', { seed: room.hostSeed, deck: msg.deck || null, mf: msg.mf || null }, ws);
        break;
      }

      // ── CHAT (optional) ───────────────────────────────
      case 'chat': {
        const room = rooms.get(ws.roomCode);
        if (!room) return;
        broadcast(room, 'chat', { text: String(msg.text || '').slice(0, 200), fromSeat: ws.seat }, ws);
        break;
      }

      // ── LEAVE ─────────────────────────────────────────
      case 'leave': {
        const room = rooms.get(ws.roomCode);
        if (room) { broadcast(room, 'opponent_left', {}, ws); }
        ws.roomCode = null;
        break;
      }

      // ── RECONNECT: rejoin a room+seat after a drop ──────
      case 'reconnect': {
        const code = (msg.code || '').toUpperCase().trim();
        const seat = (msg.seat === 0 || msg.seat === 1) ? msg.seat : null;
        const room = rooms.get(code);
        if (!room || seat === null) { return send(ws, 'reconnect_failed', { msg: 'Match no longer available.' }); }
        if (room.players[seat] && room.players[seat].readyState === room.players[seat].OPEN) {
          return send(ws, 'reconnect_failed', { msg: 'Seat already taken.' });
        }
        // Restore the seat
        room.players[seat] = ws;
        ws.roomCode = code;
        ws.seat = seat;
        if (room.disconnected) delete room.disconnected[seat];
        send(ws, 'reconnected', { code, seat, oppDeck: room.deck[1 - seat], oppMf: room.mf[1 - seat] });
        // Ask the still-connected opponent to push a fresh authoritative state
        broadcast(room, 'opponent_reconnected', { seat }, ws);
        console.log(`[room ${code}] seat ${seat} reconnected`);
        break;
      }

      default:
        send(ws, 'error', { msg: 'Unknown message type: ' + msg.type });
    }
  });

  ws.on('close', () => {
    // Remove from ranked queue if waiting
    { const qi = rankedQueue.findIndex(q => q.ws === ws); if (qi >= 0) rankedQueue.splice(qi, 1); }

    const code = ws.roomCode;
    if (!code) return;
    const room = rooms.get(code);
    if (room) {
      const seat = ws.seat;
      // Mark seat as disconnected but KEEP it reserved for reconnect
      if (room.players[seat] === ws) room.players[seat] = null;
      room.disconnected = room.disconnected || {};
      room.disconnected[seat] = Date.now();
      // Tell opponent it's a temporary pause, not a forfeit (yet)
      broadcast(room, 'opponent_disconnected', { seat, graceMs: 45000 }, ws);
      console.log(`[room ${code}] seat ${seat} disconnected — 45s grace`);
      // After grace: if still gone, declare forfeit + cleanup
      setTimeout(() => {
        const r = rooms.get(code);
        if (!r) return;
        if (!r.players[seat] && r.disconnected && r.disconnected[seat]) {
          // Ranked forfeit: the player who STAYED wins; apply ELO once.
          if (r.ranked && !r.rankedApplied) {
            r.rankedApplied = true;
            const stayerSeat = seat === 0 ? 1 : 0;
            const winnerId = r.playerIds[stayerSeat], loserId = r.playerIds[seat];
            if (winnerId && loserId) {
              const result = Ranked.applyResult(winnerId, loserId);
              if (r.players[stayerSeat]) {
                send(r.players[stayerSeat], 'rank_update', { you: result.winner, opponent: result.loser, won: true, byForfeit: true });
              }
              console.log(`[room ${code}] ranked forfeit: ${winnerId} +${result.winner.delta} (opponent abandoned)`);
            }
          }
          broadcast(r, 'opponent_left', {}, null);
          console.log(`[room ${code}] seat ${seat} did not return — forfeit`);
          cleanupRoom(code);
        }
      }, 45000);
    }
  });
});

// ── Heartbeat: drop dead connections every 30s ────────────
const interval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) return ws.terminate();
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);
wss.on('close', () => clearInterval(interval));

// ── Periodic stale-room sweep (rooms older than 2h) ───────
setInterval(() => {
  const now = Date.now();
  for (const [code, room] of rooms) {
    if (now - room.createdAt > 2 * 60 * 60 * 1000) {
      rooms.delete(code);
      console.log(`[room ${code}] expired`);
    }
  }
}, 10 * 60 * 1000);

server.listen(PORT, () => {
  console.log(`Medal Wars relay server listening on :${PORT}`);
});
