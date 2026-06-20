// ═══ BETA KEY (client) ═══
const MWBeta = (function(){
  let _gate=null; // null=unknown, true/false once checked
  function token(){ try{ return localStorage.getItem('mw_beta_token')||null; }catch(e){ return null; } }
  function setToken(t){ try{ if(t) localStorage.setItem('mw_beta_token',t); }catch(e){} }
  function base(){ return (typeof ArtCloud!=='undefined'&&ArtCloud.base)?ArtCloud.base():null; }
  async function checkGate(){
    const b=base(); if(!b){ _gate=false; return false; }
    try{ const r=await fetch(b+'/beta/config'); const j=await r.json(); _gate=!!j.gate; }
    catch(e){ _gate=false; }
    return _gate;
  }
  function gateKnown(){ return _gate; }
  async function redeem(code){
    const b=base(); if(!b) return {ok:false,error:'no_server'};
    try{
      const r=await fetch(b+'/redeem',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({code})});
      const j=await r.json();
      if(j.ok&&j.token){ setToken(j.token); }
      return j;
    }catch(e){ return {ok:false,error:'network'}; }
  }
  async function hasValidAccess(){
    if(_gate===false) return true;          // gating off → everyone allowed
    const t=token(); if(!t) return false;
    const b=base(); if(!b) return false;
    try{ const r=await fetch(b+'/beta/validate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token:t})}); const j=await r.json(); return !!j.ok; }
    catch(e){ return false; }
  }
  return { token, setToken, checkGate, gateKnown, redeem, hasValidAccess };
})();

// Show the beta-key entry modal; calls onOk() when access is granted.
function promptBetaKey(onOk){
  openM('Beta Access Required',
    'Online play is in private beta. Enter your beta key to unlock it:<br><br>'+
    '<input id="beta-key-input" placeholder="MW-XXXX-XXXX" style="width:100%;padding:10px;border-radius:8px;border:1px solid var(--border);background:rgba(0,0,0,.3);color:var(--text);font-family:Orbitron,monospace;font-size:13px;text-align:center;text-transform:uppercase">'+
    '<div id="beta-key-msg" style="font-size:11px;color:var(--red);margin-top:8px;min-height:14px;text-align:center"></div>',
    [{l:'REDEEM',cls:'mb ok',cb:async()=>{
        const inp=document.getElementById('beta-key-input');
        const msg=document.getElementById('beta-key-msg');
        const code=(inp&&inp.value||'').trim().toUpperCase();
        if(!code){ if(msg)msg.textContent='Enter a key.'; return; }
        if(msg){ msg.style.color='var(--text3)'; msg.textContent='Checking…'; }
        const res=await MWBeta.redeem(code);
        if(res.ok){ closeM(); if(onOk)onOk(); }
        else {
          const errs={invalid_format:'That key format looks wrong.',not_found:'Key not found.',network:'Could not reach the server.',no_server:'Server unavailable.'};
          if(msg){ msg.style.color='var(--red)'; msg.textContent=errs[res.error]||'Could not redeem that key.'; }
        }
      }},
     {l:'Cancel',cls:'mb',cb:()=>closeM()}]);
}


// ═══════════════════════════════════════════════════════════
//  RANKED MODE (client) — queue, rank display, leaderboard
// ═══════════════════════════════════════════════════════════
let _rankedListenersBound=false;
let _queueTimer=null, _queueSecs=0;

function _httpBaseSafe(){ return (typeof ArtCloud!=='undefined'&&ArtCloud.base)?ArtCloud.base():null; }

// Fetch and cache the player's rank profile
async function fetchMyRank(){
  const base=_httpBaseSafe(); const tok=(typeof MWBeta!=='undefined')?MWBeta.token():null;
  if(!base||!tok) return null;
  try{
    const r=await fetch(base+'/ranked/profile',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token:tok,name:_playerName()})});
    const j=await r.json(); return j.profile||null;
  }catch(e){ return null; }
}
function _playerName(){ try{ return localStorage.getItem('mw_player_name')||'Mr Principal'; }catch(e){ return 'Mr Principal'; } }
function _setPlayerName(n){ try{ localStorage.setItem('mw_player_name', n); }catch(e){} }

// Entry point: RANKED button

// Compare this client's build to the deployed server version (catches stale deploys).
async function checkDeploySync(){
  const base=(typeof ArtCloud!=='undefined'&&ArtCloud.base)?ArtCloud.base():null;
  if(!base){ openM('Server Sync','No server configured.',[{l:'OK',cls:'mb ok',cb:()=>closeM()}]); return; }
  openM('Server Sync','<div style="text-align:center;color:var(--text3);font-size:11px">Checking\u2026</div>',[{l:'Cancel',cls:'mb',cb:()=>closeM()}]);
  try{
    const r=await fetch(base+'/health'); const j=await r.json();
    const sv=j.version||'(old build \u2014 no version)';
    const match=(sv===MW_BUILD);
    openM('Server Sync',
      '<div style="font-size:12px;line-height:1.6">'+
      'This app build: <b style="color:var(--gold)">'+MW_BUILD+'</b><br>'+
      'Server build: <b style="color:'+(match?'#40d088':'#ff6060')+'">'+sv+'</b><br><br>'+
      (match?'\u2705 In sync \u2014 ranked and all features should work.':'\u26a0\ufe0f <b>Out of sync.</b> The server is running an older build. Redeploy on Railway (make sure server.js + ranked.js are pushed and the deploy succeeded), then re-check.')+
      (j.features?('<br><br><span style="font-size:10px;color:var(--text3)">Server features: ranked='+(j.features.ranked?'\u2713':'\u2717')+' queue='+(j.features.queue?'\u2713':'\u2717')+'</span>'):'')+
      '</div>',
      [{l:'OK',cls:'mb ok',cb:()=>closeM()}]);
  }catch(e){
    openM('Server Sync','Could not reach the server to check its version. It may be asleep \u2014 try again in ~20s.',[{l:'OK',cls:'mb ok',cb:()=>closeM()}]);
  }
}

function openRanked(){
  (async()=>{
    // Ranked requires online + beta access
    if(!MWNet.available()){
      openM('Ranked Mode','Online play isn\'t available yet. The match server may be waking up \u2014 try again shortly.',[{l:'OK',cls:'mb ok',cb:()=>closeM()}]);
      return;
    }
    if(typeof MWBeta!=='undefined'){
      if(MWBeta.gateKnown()===null){ try{ await MWBeta.checkGate(); }catch(e){} }
      if(MWBeta.gateKnown()===true){
        const ok=await MWBeta.hasValidAccess();
        if(!ok){ promptBetaKey(()=>openRanked()); return; }
      }
    }
    const prof=await fetchMyRank();
    _showRankedHome(prof);
  })();
}

function _showRankedHome(prof){
  const r=prof?prof.rating:1000, tier=prof?prof.tier:'Bronze', tc=prof?prof.tierColor:'#cd7f32';
  const w=prof?prof.wins:0, l=prof?prof.losses:0;
  openM('Ranked Mode',
    '<div style="text-align:center">'+
      '<div style="font-family:Orbitron,monospace;font-size:11px;letter-spacing:2px;color:'+tc+';font-weight:800;margin-bottom:2px">'+tier.toUpperCase()+'</div>'+
      '<div style="font-family:Orbitron,monospace;font-size:34px;font-weight:900;color:var(--text);line-height:1">'+r+'</div>'+
      '<div style="font-size:10px;color:var(--text3);margin-bottom:10px">'+w+'W \u00b7 '+l+'L \u00b7 deck: '+(deck||'blaze')+'</div>'+
      '<div style="font-size:11px;color:var(--text2);line-height:1.4;margin-bottom:4px">Queue to face a real opponent near your skill. Win to climb, lose to drop \u2014 ELO-based.</div>'+
    '</div>',
    [{l:'\u2694 FIND MATCH',cls:'mb ok',cb:()=>_startQueue()},
     {l:'\ud83c\udfc6 Leaderboard',cls:'mb',cb:()=>showLeaderboard()},
     {l:'Set Name',cls:'mb',cb:()=>_promptName()},
     {l:'Server Sync',cls:'mb',cb:()=>checkDeploySync()},
     {l:'Back',cls:'mb',cb:()=>closeM()}]);
}

function _promptName(){
  openM('Display Name',
    'Set the name other players see on the ladder:<br><br>'+
    '<input id="pname-input" maxlength="16" value="'+_playerName().replace(/"/g,'')+'" style="width:100%;padding:10px;border-radius:8px;border:1px solid var(--border);background:rgba(0,0,0,.3);color:var(--text);font-size:13px;text-align:center">',
    [{l:'Save',cls:'mb ok',cb:()=>{ const v=(document.getElementById('pname-input')||{}).value||''; if(v.trim()) _setPlayerName(v.trim().slice(0,16)); openRanked(); }},
     {l:'Cancel',cls:'mb',cb:()=>openRanked()}]);
}

function _startQueue(){
  _bindRankedListeners();
  _queueSecs=0;
  const mfName=(DECKS[deck] && DECKS[deck].mf) || 'ikki';
  _showQueueScreen();
  MWNet.onWakeStatus((status)=>{ if(status==='waking') _setQueueStatus('Waking up the match server\u2026 this can take up to 20s on first connect.'); });
  MWNet.queue(deck, mfName, _playerName()).catch((err)=>{
    _stopQueueTimer();
    const url=(window.MW_SERVER_URL||'(none)');
    let why;
    if(err&&err.message==='timeout'){ why='The server didn\'t respond within 25s. Free hosting sleeps when idle \u2014 the first connect wakes it. Tap Retry once or twice.'; }
    else if(err&&err.message==='no_server'){ why='No server URL is configured.'; }
    else if(err&&err.message&&err.message.indexOf('ws_closed')===0){ why='The connection was refused/closed by the server (code '+err.message.replace('ws_closed_','')+'). This usually means the server is starting up or the WebSocket route isn\'t live yet. Tap Retry in ~15s.'; }
    else { why='Could not open a connection to the match server. (WebSocket failed to open.)'; }
    openM('Ranked', why+'<br><br><span style="font-size:10px;color:var(--text3)">Server: '+url+'</span>',
      [{l:'Retry',cls:'mb ok',cb:()=>{ closeM(); _startQueue(); }},
       {l:'Test Connection',cls:'mb',cb:()=>_testConnection()},
       {l:'Back',cls:'mb',cb:()=>closeM()}]);
  });
}

function _showQueueScreen(){
  openM('Finding Match\u2026',
    '<div style="text-align:center;padding:6px 0">'+
      '<div class="queue-spinner" style="margin:0 auto 14px;width:42px;height:42px;border:3px solid rgba(255,255,255,.15);border-top-color:var(--gold);border-radius:50%;animation:queueSpin .9s linear infinite"></div>'+
      '<div id="queue-status" style="font-size:12px;color:var(--text2)">Searching for an opponent near your rank\u2026</div>'+
      '<div id="queue-timer" style="font-family:Orbitron,monospace;font-size:11px;color:var(--text3);margin-top:6px">0:00</div>'+
      '<div id="queue-practice-hint" style="font-size:10px;color:var(--text3);margin-top:10px;opacity:0;transition:opacity .4s">No opponents yet \u2014 you can practice vs CPU instead.</div>'+
    '</div>',
    [{l:'Practice vs CPU',cls:'mb',cb:()=>_startPracticeMatch()},
     {l:'Cancel',cls:'mb',cb:()=>{ MWNet.leaveQueue(); _stopQueueTimer(); closeM(); }}]);
  _stopQueueTimer();
  _queueTimer=setInterval(()=>{
    _queueSecs++;
    const el=document.getElementById('queue-timer');
    if(el){ const m=Math.floor(_queueSecs/60), s=_queueSecs%60; el.textContent=m+':'+(s<10?'0':'')+s; }
    if(_queueSecs>=15){ const hint=document.getElementById('queue-practice-hint'); if(hint) hint.style.opacity='1'; }
  },1000);
}
function _setQueueStatus(text){
  const el=document.getElementById('queue-status');
  if(el) el.textContent=text;
}
function _stopQueueTimer(){ if(_queueTimer){ clearInterval(_queueTimer); _queueTimer=null; } }

function _bindRankedListeners(){
  if(_rankedListenersBound) return; _rankedListenersBound=true;
  MWNet.on('queued',(m)=>{ /* in queue; UI already shown */ });
  MWNet.on('match_found',(m)=>{
    _stopQueueTimer();
    G_oppDeck = m.oppDeck || null;
    _rankedMatch = true;
    banner&&banner('MATCH FOUND!','#40d088');
    openM('Match Found!',
      '<div style="text-align:center"><div style="font-size:13px;color:var(--text)">Opponent: <b style="color:'+(m.oppTier? '#ffd700':'var(--gold)')+'">'+(m.oppName||'Rival')+'</b></div>'+
      '<div style="font-size:11px;color:var(--text3);margin-top:3px">'+(m.oppTier||'')+' \u00b7 '+(m.oppRating||'?')+'</div></div>',
      [{l:'BATTLE!',cls:'mb ok',cb:()=>closeM()}]);
    setTimeout(()=>{ closeM(); }, 1400);
  });
  MWNet.on('match_start',(m)=>{ closeM(); if(m.coinFlip){ G_mySeat=MWNet.seat(); showCoinFlip(m.firstSeat, ()=>startOnlineMatch(m.firstSeat)); } else { startOnlineMatch(m.firstSeat); } });
  MWNet.on('rank_update',(m)=>{ _showRankUpdate(m); });
  MWNet.on('error',(m)=>{ _stopQueueTimer(); openM('Ranked',(m&&m.msg)||'Connection problem. The server may be waking up \u2014 try again in a few seconds.',[{l:'OK',cls:'mb ok',cb:()=>closeM()}]); });
}

function _showRankUpdate(m){
  const you=m.you||{}; const delta=you.delta||0;
  const sign=delta>=0?'+':'';
  const col=delta>=0?'#40d088':'#ff6060';
  setTimeout(()=>{
    openM(m.won?'Victory! \ud83c\udfc6':'Defeat',
      '<div style="text-align:center">'+
        '<div style="font-family:Orbitron,monospace;font-size:11px;letter-spacing:2px;color:'+(you.tierColor||'#ccc')+';font-weight:800">'+(you.tier||'').toUpperCase()+'</div>'+
        '<div style="font-family:Orbitron,monospace;font-size:34px;font-weight:900;color:var(--text);line-height:1.1">'+(you.rating||'?')+'</div>'+
        '<div style="font-family:Orbitron,monospace;font-size:18px;font-weight:800;color:'+col+'">'+sign+delta+'</div>'+
        '<div style="font-size:10px;color:var(--text3);margin-top:4px">'+(you.wins||0)+'W \u00b7 '+(you.losses||0)+'L</div>'+
      '</div>',
      [{l:'Queue Again',cls:'mb ok',cb:()=>{ closeM(); openRanked(); }},
       {l:'Title',cls:'mb',cb:()=>{ closeM(); location.reload(); }}]);
  }, 600);
}


// Diagnostic: ping the server's HTTP health endpoint and report the result.
async function _testConnection(){
  const base=(typeof ArtCloud!=='undefined'&&ArtCloud.base)?ArtCloud.base():null;
  if(!base){ openM('Connection Test','No server URL configured.',[{l:'Back',cls:'mb ok',cb:()=>openRanked()}]); return; }
  openM('Connection Test','<div style="text-align:center;color:var(--text3);font-size:11px">Pinging '+base+'/health\u2026<br>(waking the server can take ~20s)</div>',[{l:'Cancel',cls:'mb',cb:()=>openRanked()}]);
  const started=Date.now();
  try{
    const ctrl=new AbortController(); const to=setTimeout(()=>ctrl.abort(),28000);
    const r=await fetch(base+'/health',{signal:ctrl.signal});
    clearTimeout(to);
    const secs=((Date.now()-started)/1000).toFixed(1);
    const txt=await r.text().catch(()=>'');
    openM('Connection Test',
      '<div style="font-size:12px;line-height:1.5">'+
      'Status: <b style="color:'+(r.ok?'#40d088':'#ff6060')+'">'+r.status+(r.ok?' OK':' (problem)')+'</b><br>'+
      'Time: '+secs+'s<br>'+
      'Reply: '+(txt?txt.slice(0,60):'(empty)')+'<br><br>'+
      (r.ok?'HTTP works. Now testing WebSocket\u2026':'Server responded but with an error. It may still be starting up.')+
      '</div>',
      [{l:'Back to Ranked',cls:'mb',cb:()=>openRanked()}]);
    if(r.ok){ _testWebSocket(); }
  }catch(e){
    const secs=((Date.now()-started)/1000).toFixed(1);
    openM('Connection Test',
      '<div style="font-size:12px;line-height:1.5">'+
      '<b style="color:#ff6060">Could not reach the server</b> (after '+secs+'s).<br><br>'+
      'Likely causes:<br>'+
      '\u2022 The server is still waking up \u2014 wait 20s and retry.<br>'+
      '\u2022 The latest server code isn\'t deployed on Railway yet.<br>'+
      '\u2022 The server crashed \u2014 check Railway logs.'+
      '</div>',
      [{l:'Retry Test',cls:'mb ok',cb:()=>_testConnection()},{l:'Back',cls:'mb',cb:()=>openRanked()}]);
  }
}


// Directly test the WebSocket upgrade — this is what ranked/online actually needs.
function _testWebSocket(){
  const url=(window.MW_SERVER_URL||null);
  if(!url){ return; }
  let settled=false;
  const started=Date.now();
  let testWs=null;
  const finish=(html)=>{ if(settled)return; settled=true; try{if(testWs)testWs.close();}catch(_){}
    openM('WebSocket Test', html, [{l:'Retry',cls:'mb ok',cb:()=>{ closeM(); _testWebSocket(); }},{l:'Back to Ranked',cls:'mb',cb:()=>openRanked()}]); };
  try{
    testWs=new WebSocket(url);
    const timer=setTimeout(()=>{ finish('<div style="font-size:12px;line-height:1.6"><b style="color:#ff6060">WebSocket timed out</b> after 20s.<br><br>HTTP works but the WebSocket upgrade never completed. This is almost always one of:<br>\u2022 <b>Your network/carrier blocks WebSockets</b> (common on some mobile data / public WiFi). Try a different network \u2014 e.g. switch between WiFi and cellular.<br>\u2022 Railway edge isn\'t passing the upgrade (rare).</div>'); }, 20000);
    testWs.onopen=()=>{ clearTimeout(timer); const secs=((Date.now()-started)/1000).toFixed(1);
      finish('<div style="font-size:12px;line-height:1.6"><b style="color:#40d088">WebSocket connected!</b> ('+secs+'s)<br><br>Online play should work. If Find Match still fails, tap it again \u2014 the server may have been waking up.</div>'); };
    testWs.onerror=()=>{ clearTimeout(timer);
      finish('<div style="font-size:12px;line-height:1.6"><b style="color:#ff6060">WebSocket failed to open.</b><br><br>HTTP works but the WebSocket connection errored immediately. Most likely your current network is blocking WebSocket traffic.<br><br><b>Try this:</b> switch networks \u2014 if you\'re on cellular, try WiFi (or vice-versa). Many carriers and captive WiFi portals block WebSockets while allowing normal web traffic.</div>'); };
    testWs.onclose=(ev)=>{ if(settled)return; clearTimeout(timer);
      finish('<div style="font-size:12px;line-height:1.6"><b style="color:#ff6060">WebSocket closed</b> (code '+((ev&&ev.code)||'?')+').<br><br>The connection opened then closed. Code 1006 usually means the network dropped it (carrier/proxy). Try a different network.</div>'); };
  }catch(e){ finish('<div style="font-size:12px;color:#ff6060">Could not create WebSocket: '+(e&&e.message||e)+'</div>'); }
}

// Practice ranked match vs CPU (for solo testing / warm-up). Not rated.
function _startPracticeMatch(){
  try{ MWNet.leaveQueue(); }catch(e){}
  _stopQueueTimer();
  closeM();
  _practiceMode=true;
  // Force Hard AI for a real challenge, then start a normal local game.
  cpuDiff='hard';
  if(typeof setDiff==='function'){ try{ setDiff('hard', document.getElementById('diff-hard')); }catch(e){} }
  banner&&banner('PRACTICE MATCH','#60c8ff');
  startGame();
  setTimeout(()=>{ try{ log('Practice match vs CPU (Hard) \u2014 not rated. Warm up your ladder strategy!','info'); }catch(e){} }, 300);
}
let _practiceMode=false;

async function showLeaderboard(){
  const base=_httpBaseSafe();
  if(!base){ openM('Leaderboard','Server unavailable.',[{l:'OK',cls:'mb ok',cb:()=>closeM()}]); return; }
  openM('Leaderboard','<div style="text-align:center;color:var(--text3);font-size:11px">Loading\u2026</div>',[{l:'Back',cls:'mb',cb:()=>openRanked()}]);
  try{
    const r=await fetch(base+'/ranked/leaderboard'); const j=await r.json();
    const board=j.board||[];
    let html='<div style="max-height:320px;overflow-y:auto">';
    if(!board.length) html+='<div style="text-align:center;color:var(--text3);font-size:11px;padding:12px">No ranked players yet. Be the first!</div>';
    board.forEach((p,i)=>{
      const medal=i===0?'\ud83e\udd47':i===1?'\ud83e\udd48':i===2?'\ud83e\udd49':(i+1)+'.';
      html+='<div style="display:flex;align-items:center;gap:8px;padding:5px 6px;border-bottom:1px solid var(--border);font-size:12px">'+
        '<span style="width:24px;text-align:center;font-weight:700">'+medal+'</span>'+
        '<span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--text)">'+(p.name||'Mr Principal')+'</span>'+
        '<span style="font-size:9px;color:'+(p.tierColor||'#ccc')+';font-weight:700">'+(p.tier||'')+'</span>'+
        '<span style="font-family:Orbitron,monospace;font-weight:800;color:var(--gold);width:42px;text-align:right">'+p.rating+'</span>'+
      '</div>';
    });
    html+='</div>';
    openM('\ud83c\udfc6 Leaderboard',html,[{l:'Back',cls:'mb',cb:()=>openRanked()}]);
  }catch(e){ openM('Leaderboard','Could not load the leaderboard.',[{l:'OK',cls:'mb ok',cb:()=>openRanked()}]); }
}
let _rankedMatch=false;

function openOnlineLobby(){
  // Beta gate: if the server requires keys and we don't have access, prompt first.
  (async()=>{
    if(MWBeta.gateKnown()===null){ try{ await MWBeta.checkGate(); }catch(e){} }
    if(MWBeta.gateKnown()===true){
      const ok=await MWBeta.hasValidAccess();
      if(!ok){ promptBetaKey(()=>openOnlineLobby()); return; }
    }
    _openOnlineLobbyInner();
  })();
}
function _openOnlineLobbyInner(){
  if(!MWNet.available()){
    openM('Online Play',
      'Online multiplayer is almost ready! The match server needs to be deployed first. Once it is live, you will be able to create a room, share a 4-letter code with a friend, and battle in real time.<br><br>For now, enjoy solo play against the CPU.',
      [{l:'Got it', cls:'mb ok', cb:()=>closeM()}]);
    return;
  }
  openM('Online Multiplayer',
    'Battle a friend in real time. Create a room and share the code, or join with a code they give you.<br><br>Your selected deck: <b style="color:var(--gold)">'+(DECKS[deck]?deck.toUpperCase():'BLAZE')+'</b>',
    [
      {l:'CREATE ROOM', cls:'mb ok', cb:()=>onlineCreate()},
      {l:'JOIN WITH CODE', cls:'mb', cb:()=>onlineJoinPrompt()},
      {l:'Cancel', cls:'mb', cb:()=>closeM()}
    ]);
}
function onlineCreate(){
  const mfName = (DECKS[deck] && DECKS[deck].mf) || 'ikki';
  MWNet.on('created', (m)=>{
    openM('Room Created',
      'Share this code with your opponent:<br><br><div style="font-family:Orbitron,monospace;font-size:32px;font-weight:800;color:var(--gold);letter-spacing:6px;text-align:center;margin:10px 0">'+m.code+'</div>Waiting for opponent to join...',
      [{l:'Cancel', cls:'mb', cb:()=>{ MWNet.leave(); closeM(); }}]);
  });
  MWNet.on('opponent_joined', (m)=>{ G_oppDeck = m.oppDeck || null; });
  MWNet.on('match_start', (m)=>{ closeM(); if(m.coinFlip){ G_mySeat=MWNet.seat(); showCoinFlip(m.firstSeat, ()=>startOnlineMatch(m.firstSeat)); } else { startOnlineMatch(m.firstSeat); } });
  MWNet.create(deck, mfName).catch((err)=>{
    const why = err && err.message==='timeout' ? 'The server did not respond in time. It may be waking up (free hosting sleeps when idle) - try again in a few seconds.' : 'Could not reach the match server. Check your connection and try again.';
    openM('Connection Failed', why, [{l:'Retry', cls:'mb ok', cb:()=>{ closeM(); onlineCreate(); }},{l:'Cancel', cls:'mb', cb:()=>closeM()}]);
  });
}
function onlineJoinPrompt(){
  openM('Join Room',
    'Enter the 4-letter room code from your opponent:<br><br><input id="join-code-input" maxlength="4" style="width:140px;font-family:Orbitron,monospace;font-size:24px;text-align:center;letter-spacing:6px;text-transform:uppercase;padding:8px;border-radius:8px;border:1.5px solid var(--border2);background:rgba(0,0,0,.3);color:var(--gold)" />',
    [
      {l:'JOIN', cls:'mb ok', cb:()=>{
        const el=document.getElementById('join-code-input');
        const code=(el&&el.value||'').toUpperCase().trim();
        if(code.length!==4){ return; }
        onlineJoin(code);
      }},
      {l:'Cancel', cls:'mb', cb:()=>closeM()}
    ]);
}
function onlineJoin(code){
  const mfName = (DECKS[deck] && DECKS[deck].mf) || 'ikki';
  MWNet.on('join_failed', (m)=>{ openM('Join Failed', m.msg||'Could not join.', [{l:'OK', cls:'mb', cb:()=>closeM()}]); });
  MWNet.on('joined', (m)=>{ G_oppDeck = m.oppDeck || null; });
  MWNet.on('match_start', (m)=>{ closeM(); if(m.coinFlip){ G_mySeat=MWNet.seat(); showCoinFlip(m.firstSeat, ()=>startOnlineMatch(m.firstSeat)); } else { startOnlineMatch(m.firstSeat); } });
  MWNet.join(code, deck, mfName).catch((err)=>{
    const why = err && err.message==='timeout' ? 'The server did not respond in time. It may be waking up - try again in a few seconds.' : 'Could not reach the match server. Check your connection and try again.';
    openM('Connection Failed', why, [{l:'Retry', cls:'mb ok', cb:()=>{ closeM(); onlineJoinPrompt(); }},{l:'Cancel', cls:'mb', cb:()=>closeM()}]);
  });
}

// ═══════════════════════════════════════════════════════════
// ONLINE TURN SYNC — binds the live match to MWNet relay
// ═══════════════════════════════════════════════════════════
let G_online = false;   // true when in an online match
let G_oppDeck = null;   // opponent's chosen deck (from server handshake)
let G_mySeat = null;    // 0 = host (goes first), 1 = guest
let G_myTurn = false;   // true when it's this client's action phase

// Called when both players are in and match_start fires

// ── Reconnect handling: pause overlay + auto-rejoin ──
let _oppPaused=false;
function showPauseOverlay(msg){
  let el=document.getElementById('pause-overlay');
  if(!el){
    el=document.createElement('div'); el.id='pause-overlay';
    el.style.cssText='position:fixed;inset:0;z-index:600;background:rgba(4,6,12,.86);backdrop-filter:blur(6px);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:24px';
    document.body.appendChild(el);
  }
  el.innerHTML='<div style="font-family:Orbitron,monospace;font-size:18px;color:var(--gold);margin-bottom:10px">\u23f8 '+(msg||'Connection interrupted')+'</div>'+
    '<div style="font-size:12px;color:var(--text2);max-width:300px;line-height:1.5" id="pause-sub">Waiting to reconnect\u2026</div>'+
    '<div style="margin-top:14px"><div class="spinner" style="width:28px;height:28px;border:3px solid rgba(255,255,255,.15);border-top-color:var(--gold);border-radius:50%;animation:spin 1s linear infinite;margin:0 auto"></div></div>';
  el.style.display='flex';
}
function hidePauseOverlay(){ const el=document.getElementById('pause-overlay'); if(el) el.style.display='none'; }

// Opponent dropped — show paused state, don't end the game
function onOpponentDisconnected(m){
  if(!G_online) return;
  _oppPaused=true;
  showPauseOverlay('Opponent disconnected');
  const sub=document.getElementById('pause-sub');
  if(sub) sub.textContent='Waiting for them to reconnect (up to 45s)\u2026';
}
// Opponent came back — push them our authoritative state so they resync
function onOpponentReconnected(m){
  if(!G_online) return;
  _oppPaused=false;
  hidePauseOverlay();
  banner('OPPONENT RECONNECTED','#40d898');
  try{ MWNet.syncState(buildMySideState()); }catch(e){}
}
// I reconnected — restore my view and ask for fresh state
function onSelfReconnected(m){
  hidePauseOverlay();
  banner('RECONNECTED','#40d898');
  // opponent will push their state; we keep our own side as-is
}

// Try to auto-reconnect when our own socket drops mid-match
function attemptReconnect(){
  if(!G_online || G.winner) return;
  if(!MWNet.hasSession || !MWNet.hasSession()) return;
  showPauseOverlay('Reconnecting\u2026');
  let tries=0;
  const tryOnce=()=>{
    tries++;
    if(tries>8 || !MWNet.hasSession()){ 
      const sub=document.getElementById('pause-sub');
      if(sub) sub.innerHTML='Could not reconnect. <span style="color:var(--storm2);text-decoration:underline" onclick="location.reload()">Return to title</span>';
      return; 
    }
    MWNet.reconnect();
    setTimeout(()=>{ if(_selfReconnected){ return; } tryOnce(); }, 3000);
  };
  tryOnce();
}
let _selfReconnected=false;


// Show who won the opening coin flip (server-decided, fair).
function showCoinFlip(firstSeat, then){
  const iWon = (typeof G_mySeat!=='undefined' && G_mySeat===firstSeat);
  const msg = iWon ? 'You win the toss \u2014 you go first!' : 'Opponent wins the toss \u2014 they go first.';
  const col = iWon ? '#40d088' : '#ffb020';
  openM('Coin Flip',
    '<div style="text-align:center;padding:4px 0">'+
      '<img src="'+MW_COIN_IMG+'" style="width:72px;height:auto;margin-bottom:8px;animation:coinSpin .7s ease-out;filter:drop-shadow(0 0 12px rgba(120,180,255,.6))">'+
      '<div style="font-size:14px;font-weight:700;color:'+col+';line-height:1.4">'+msg+'</div>'+
      '<div style="font-size:10px;color:var(--text3);margin-top:6px">The server flips a fair coin \u2014 no host advantage.</div>'+
    '</div>',
    [{l:'Start Battle',cls:'mb ok',cb:()=>{ closeM(); if(typeof then==='function') then(); }}]);
  setTimeout(()=>{ if(document.getElementById('modal') && document.getElementById('modal').classList.contains('open')){ closeM(); if(typeof then==='function') then(); } }, 2600);
}

function startOnlineMatch(firstSeat){
  G_online = true;
  G_mySeat = MWNet.seat();
  G_myTurn = (G_mySeat === firstSeat);
  // Hide title, init game with player's chosen deck vs opponent's actual deck
  document.getElementById('title').classList.add('gone');
  G = (typeof G==='object'&&G) ? G : {};
  // Opponent's deck: prefer handler-captured value, fall back to MWNet's internal capture
  const _opp = (G_oppDeck && DECKS[G_oppDeck]) ? G_oppDeck
             : (MWNet.oppDeck && MWNet.oppDeck() && DECKS[MWNet.oppDeck()]) ? MWNet.oppDeck()
             : null;
  if(_opp){ G._forcedCpuDeck = _opp; log('Opponent deck: '+_opp.toUpperCase(),'info'); }
  else { log('Warning: opponent deck unknown, using random.','info'); }
  init();
  // Mark enemy bots as the remote opponent (enables their custom art display)
  G.c.bots.forEach(b=>{ b._opp = true; });
  // Send my art manifest (R2 URLs) so opponent can show my custom art
  try{
    const _manifest = buildArtManifest();
    if(Object.keys(_manifest).length) MWNet.move({ type:'art', manifest:_manifest });
  }catch(e){}
  log('Online match! You are '+(G_mySeat===0?'HOST':'GUEST')+'. '+(G_myTurn?'You go first!':'Opponent goes first.'), 'info');
  setTimeout(initTooltipDelegation, 100);
  setTimeout(updateArenaColor, 200);
  offerMulligan();
  banner('OPPONENT FOUND!', '#40d898');
  try{ loadDefaultArt(); }catch(e){}
  // Wire up incoming move handler
  MWNet.on('move', applyRemoteMove);
  MWNet.on('sync', (m)=>applyOppSideState(m.state));
  MWNet.on('end_turn', applyRemoteEndTurn);
  MWNet.on('game_over', applyRemoteGameOver);
  MWNet.on('rematch', applyRemoteRematch);
  MWNet.on('opponent_disconnected', onOpponentDisconnected);
  MWNet.on('opponent_reconnected', onOpponentReconnected);
  MWNet.on('reconnected', (m)=>{ _selfReconnected=true; onSelfReconnected(m); });
  MWNet.on('reconnect_failed', (m)=>{ const sub=document.getElementById('pause-sub'); if(sub) sub.innerHTML='Match ended. <span style="color:var(--storm2);text-decoration:underline" onclick="location.reload()">Return to title</span>'; });
  MWNet.on('opponent_left', ()=>{
    if(!G.winner){
      G.winner='p'; G.reason='Opponent disconnected.';
      showEnd();
    }
  });
  // If we go second, suppress our action phase until opponent ends their turn
  if(!G_myTurn){ turn=0; lockForOpponentTurn(); }
}

// Prevent local player from acting when it's not their turn
function lockForOpponentTurn(){
  G_myTurn = false;
  G.phase = 'cpu_turn'; // visually shows "CPU" pill — reuse existing locked state
  renderHeader();
  log('Waiting for opponent...','info');
}

function unlockForMyTurn(){
  G_myTurn = true;
  // Full turn-start housekeeping (turn++, resets, trap expiry, draw 2, charge phase)
  endCpu();
}

// ── Sending local moves to opponent ────────────────────────

// Online guard helpers — injected into existing functions via G_online checks
function _onlineGuardEndTurn(){
  if(!G_online) return false; // let normal endTurn run
  if(!G_myTurn){ log('Not your turn.','info'); return true; } // block
  MWNet.endTurn();
  lockForOpponentTurn();
  return false; // let endTurn run normally too (state update needed)
}
function _onlineRelayAttack(idx){
  if(G_online && G_myTurn) MWNet.move({ type:'attack', target: idx });
}
function _onlineRelayCard(card){
  if(G_online && G_myTurn) MWNet.move({ type:'card', uid: card.uid, id: card.id||card.uid });
}
function _onlineBlockIfNotMyTurn(){
  if(G_online && !G_myTurn){ log('Not your turn.','info'); return true; }
  return false;
}

// ── Applying remote moves from opponent ─────────────────────


// ── Authoritative side-state sync: my real state overwrites their mirror ──

let _syncQueued=false;
function _syncNow(){
  if(!G_online||_syncQueued) return;
  _syncQueued=true;
  setTimeout(()=>{ _syncQueued=false; try{ MWNet.syncState(buildMySideState()); }catch(e){} }, 250);
}

function buildMySideState(){
  return {
    active: G.p.activeBot,
    hand: G.p.hand.length,
    mcUsed: !!G.p.mcUsed,
    bots: G.p.bots.map(b=>({
      hp:b.hp, maxHp:b.maxHp, atk:b.atk, charge:b.charge,
      changed:!!b.changed, def:!!b.def, burn:b.burn||0, exhst:!!b.exhst,
      fusedMedal:b.fusedMedal||null, fusedMedal2:b.fusedMedal2||null,
      // passive/combo accumulators that drift mid-turn (Gokudo/Karin/Foxuno/etc.)
      _comboCount:b._comboCount||0, _webbed:b._webbed||0, wallStacks:b.wallStacks||0,
      _counterMarked:!!b._counterMarked, equipFx:(b.equip&&b.equip.fx)||null, equipName:(b.equip&&b.equip.name)||null
    }))
  };
}
function applyOppSideState(st){
  if(!st || !st.bots) return;
  st.bots.forEach((s,i)=>{
    const b=G.c.bots[i]; if(!b) return;
    b.hp=s.hp; b.maxHp=s.maxHp; b.atk=s.atk; b.charge=s.charge;
    b.changed=s.changed; b.def=s.def; b.burn=s.burn; b.exhst=s.exhst;
    b.fusedMedal=s.fusedMedal; b.fusedMedal2=s.fusedMedal2;
    if(s._comboCount!==undefined) b._comboCount=s._comboCount;
    if(s._webbed!==undefined) b._webbed=s._webbed;
    if(s.wallStacks!==undefined) b.wallStacks=s.wallStacks;
    if(s._counterMarked!==undefined) b._counterMarked=s._counterMarked;
    // mirror equip presence (visual) without re-running its effect
    if(s.equipFx && (!b.equip || b.equip.fx!==s.equipFx)) b.equip={fx:s.equipFx, name:s.equipName||'Equipment'};
    else if(!s.equipFx && b.equip) b.equip=null;
  });
  if(typeof st.active==='number') G.c.activeBot=st.active;
  if(typeof st.mcUsed==='boolean') G.c.mcUsed=st.mcUsed;
  // trim/pad mirrored hand to the true count (identity unknown, count matters)
  if(typeof st.hand==='number'){
    while(G.c.hand.length>st.hand) G.c.hand.pop();
    while(G.c.hand.length<st.hand && G.c.deck.length) G.c.hand.push(G.c.deck.pop());
  }
  checkWin();
  renderAll();
}

function applyRemoteMove(msg){
  const move = msg.move;
  if(!move || !G_online) return;
  if(move.type === 'switch'){
    if(typeof move.idx==='number' && G.c.bots[move.idx] && !G.c.bots[move.idx].def){
      G.c.activeBot=move.idx;
      log('Opponent switches '+G.c.bots[move.idx].name+' to the front!','cpu');
      renderAll();
    }
    return;
  }
  if(move.type === 'art'){
    applyOpponentArt(move.manifest); // async fetch from R2, renders when done
    return;
  }
  if(move.type === 'attack'){
    // Opponent attacked one of our bots (their target idx maps to our G.p)
    const myBots = G.p.bots;
    const target = myBots[move.target];
    if(!target || target.def) return;
    // Find the opponent's active bot (their G.p = our G.c)
    const theirActive = getActiveBot('c');
    if(!theirActive) return;
    resolveAtk(theirActive, target, 'c', move.card||null);
    // Attacker is authoritative: snap defender to their exact result (kills can't un-happen)
    if(move.after){
      target.hp=move.after.hp; target.burn=move.after.burn||0;
      if(move.after.def&&!target.def){ target.def=true; target.hp=Math.min(target.hp,0); log(target.name+' is defeated!','atk'); }
      else if(!move.after.def){ target.def=false; }
      checkWin();
    }
    renderAll();
  } else if(move.type === 'card'){
    // Opponent played a card — find it in their hand by id and apply CPU-side
    const card = G.c.hand.find(c=> c.uid===move.uid || c.id===move.id || c.uid===move.id);
    if(!card){ log('Sync: card not found '+move.id,'info'); return; }
    // Apply as CPU action
    try{
      if(card.type==='technique'){
        let t = (typeof move.tgt==='number'&&move.tgt>=0) ? G.p.bots[move.tgt] : null;
        if(!t||t.def) t = cpuBestTarget(G.c.bots.find(b=>!b.def)?.atk||4);
        if(t) applyTechC(card, getActiveBot('c'), t);
        dsc(G.c, card.uid);
      } else if(card.type==='action'||card.type==='equipment'||card.type==='trap'){
        cpuPlayCard(card);
      } else if(card.type==='medaforce'){
        // Opponent fired MF — use CPU MF resolution
        const mfFx = card.fx;
        if(mfFx) resolveMF(mfFx, 1); // 1 = cpu side
      } else if(card.type==='medachange'){
        const bot = G.c.bots.find(b=>b.key===card.fx?.replace('mc_bot_',''));
        if(bot){
          bot.changed=true; bot.maxHp+=8; bot.hp=Math.min(bot.hp+8,bot.maxHp); G.c.mcUsed=true;
          log('Opponent MEDACHANGE: '+bot.name+'!','mc'); banner('OPPONENT MEDACHANGE!','#f04880');
          try{ triggerMCAnimation(bot, ()=>{renderAll();}); }catch(e){ renderAll(); }
        }
      }
    }catch(e){ log('Sync card error: '+e.message,'info'); }
    _syncNow();
    renderAll();
  }
}

function applyRemoteEndTurn(msg){
  if(!G_online) return;
  if(G_myTurn) return; // already my turn — ignore duplicate
  log('Opponent ended their turn.','info');
  unlockForMyTurn();
}

function applyRemoteGameOver(msg){
  if(!G_online) return;
  // Opponent declared winner — apply to local state
  if(msg.winnerSeat === G_mySeat){ G.winner='p'; G.reason='You win!'; }
  else { G.winner='c'; G.reason='Opponent wins.'; }
  showEnd();
}

function applyRemoteRematch(msg){
  if(!G_online) return;
  if(msg && msg.deck && DECKS[msg.deck]){ /* opponent changed deck; captured in MWNet pump */ }
  closeM&&closeM();
  doRematch();
}

// checkWin signals opponent when online — injected directly into checkWin above



// ArtCloud - uploads custom art to R2 via the relay server, stores URLs.
// Falls back silently to local-only (IndexedDB) if R2 is not configured.
const ArtCloud = (function(){
  let _enabled = null; // null = unknown, true/false once checked
  // Derive the HTTP base from the WS server URL: wss://host -> https://host
  function _anonId(){ try{ let a=localStorage.getItem('mw_anon_id'); if(!a){ a='anon'+Math.random().toString(36).slice(2,12); localStorage.setItem('mw_anon_id',a); } return a; }catch(e){ return 'anon'+Math.random().toString(36).slice(2,12); } }
  function httpBase(){
    const u = window.MW_SERVER_URL;
    if(!u) return null;
    return u.replace(/^wss:/,'https:').replace(/^ws:/,'http:');
  }
  async function check(){
    if(_enabled === true) return true; // only cache success — failures retry next time
    const base = httpBase();
    if(!base){ return false; }
    try{
      const r = await fetch(base + '/art/config', {method:'GET'});
      const j = await r.json();
      _enabled = j.enabled ? true : null; // null = unknown, retry later
    }catch(e){ _enabled = null; }
    return _enabled === true;
  }
  // Upload one data URL, return its public R2 URL (or null on failure/disabled).
  async function upload(dataUrl){
    if(!(await check())) return null;
    const base = httpBase();
    try{
      const r = await fetch(base + '/art/upload', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ dataUrl, secret:(typeof _mwAdminSecret!=='undefined'?_mwAdminSecret:null) })
      });
      const j = await r.json().catch(()=>({}));
      if(!r.ok){ window._lastArtErr = j.error || ('http_'+r.status); return null; }
      return j.url || null;
    }catch(e){ window._lastArtErr = e.message || 'network'; return null; }
  }
  return { check, upload, enabled(){ return _enabled===true; }, base(){ return httpBase(); } };
})();

// ═══════════════════════════════════════════════════════════
