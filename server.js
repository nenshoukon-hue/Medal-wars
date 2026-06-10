// ═══════════════════════════════════════════════════════════
// MEDAL WARS — Multiplayer Relay Server
// Room-code matchmaking + trust-based move relay.
// Node 18+, single dependency: ws
// ═══════════════════════════════════════════════════════════
const http = require('http');
const { WebSocketServer } = require('ws');
const R2 = require('./r2');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8080;

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
    res.end(JSON.stringify({ status: 'ok', rooms: rooms.size, uptime: process.uptime(), r2: R2.enabled() }));
    return;
  }

  // Tells the client whether shared art (R2) is available
  if (req.url === '/art/config' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ enabled: R2.enabled() }));
    return;
  }

  // Upload one art image: POST { dataUrl } → { url }
  if (req.url === '/art/upload' && req.method === 'POST') {
    if (!R2.enabled()) {
      res.writeHead(503, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'r2_disabled' }));
      return;
    }
    readJsonBody(req, 1024 * 1024, async (err, data) => {
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

      // ── JOIN ROOM ─────────────────────────────────────
      case 'join': {
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
        // Kick off the match: host (seat 0) takes first turn by convention
        broadcast(room, 'match_start', { firstSeat: 0 });
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
        break;
      }

      // ── REMATCH request ───────────────────────────────
      case 'rematch': {
        const room = rooms.get(ws.roomCode);
        if (!room) return;
        room.hostSeed = Math.floor(Math.random() * 2147483647);
        broadcast(room, 'rematch', { seed: room.hostSeed }, ws);
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

      default:
        send(ws, 'error', { msg: 'Unknown message type: ' + msg.type });
    }
  });

  ws.on('close', () => {
    const code = ws.roomCode;
    if (!code) return;
    const room = rooms.get(code);
    if (room) {
      broadcast(room, 'opponent_left', {}, ws);
      // free the seat
      if (room.players[ws.seat] === ws) room.players[ws.seat] = null;
      console.log(`[room ${code}] seat ${ws.seat} disconnected`);
      setTimeout(() => cleanupRoom(code), 30000); // grace period for reconnect
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
