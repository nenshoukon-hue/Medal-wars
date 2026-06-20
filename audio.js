// ═══ INTERACTIVE WALKTHROUGH TUTORIAL ═══
let _itutStep=0, _itutActive=false;
const ITUT=[
  {title:'Welcome, Medafighter!', body:'This is a hands-on walkthrough — you\'ll play a real turn as I guide you. Let\'s start a practice battle against an easy CPU.', action:'start', highlight:null},
  {title:'Meet Your Team', body:'Your three Medabots sit at the bottom. The one in the center-front is ACTIVE — it attacks and defends. The other two are protected until it falls. Tap the ⓘ on any bot to see its abilities.', highlight:'#plr-team', action:'next'},
  {title:'The Charge Bar', body:'See the pips under each bot? That\'s CHARGE. Your bots gain charge each turn. At 5 charge, a bot can unleash its powerful MEDAFORCE attack. Charge is your path to big plays.', highlight:'.pips', action:'next'},
  {title:'Your Hand', body:'These cards at the bottom are your hand. TECHNIQUES boost an attack, ACTIONS give effects, EQUIPMENT bolts onto bots, and TRAPS set up defenses. Hover or long-press any card to read it.', highlight:'#m-hand', action:'next'},
  {title:'Customize Your Deck', body:'Before any battle, tap EDIT DECK on the title screen to personalize your deck. You can swap up to 3 cards \u2014 trade ones that don\'t fit your style for cards you prefer. Small tweaks can shape your whole game plan. (You can\'t edit mid-battle, so plan ahead!)', highlight:null, action:'next'},
  {title:'Make Your Move', body:'Now YOUR turn. To attack: tap your active bot, then tap an enemy. To play a card: tap it. Try attacking now — tap your front bot, then an enemy bot!', highlight:null, action:'wait_attack'},
  {title:'Nice Hit!', body:'That\'s the core loop — attack to chip down enemy HP. KO a bot by reducing it to 0. When you\'re out of moves, tap END to pass to the CPU.', highlight:'#btn-end', action:'next'},
  {title:'Switching Bots', body:'Tap SWITCH to bring a support bot to the front — useful to protect a wounded bot or set up a stronger attacker. Each switch uses your turn\'s switch.', highlight:'#btn-switch', action:'next'},
  {title:'Medaforce & Medachange', body:'When a bot hits 5 charge, the MF button lights up for a devastating Medaforce. The MC button triggers a MEDACHANGE — transforming a bot to be bigger and stronger. These win games!', highlight:null, action:'next'},
  {title:'You\'re Ready!', body:'KO all three enemy bots to win. Each deck plays differently — experiment to find your style. You can replay this anytime from the title. Now finish this battle — good luck, Medafighter!', highlight:null, action:'finish'}
];


// ── Title screen music ──
let _titleMusicEl=null;
let _titleMusicArmed=false;

// ── Music crossfade helpers ──
function fadeAudio(el, from, to, ms, onDone){
  if(!el) { if(onDone)onDone(); return; }
  const steps=20, stepMs=ms/steps; let i=0;
  el.volume=Math.max(0,Math.min(1,from));
  const iv=setInterval(()=>{
    i++;
    const v=from+(to-from)*(i/steps);
    try{ el.volume=Math.max(0,Math.min(1,v)); }catch(e){}
    if(i>=steps){ clearInterval(iv); try{ el.volume=Math.max(0,Math.min(1,to)); }catch(e){} if(onDone)onDone(); }
  }, stepMs);
}
function fadeOutTitleMusic(ms){
  if(_titleMusicEl && !_titleMusicEl.paused){
    fadeAudio(_titleMusicEl, _titleMusicEl.volume||0.22, 0, ms||700, ()=>{ try{ _titleMusicEl.pause(); _titleMusicEl.currentTime=0; }catch(e){} });
  }
}
function startBattleMusic(){
  if(localStorage.getItem('mw_music_on')==='false') return; // respect mute
  _battleMusicLocked=false; // a match is starting — release the lock
  // Stop title music first so the two never overlap
  try{ if(_titleMusicEl){ _titleMusicEl.pause(); _titleMusicEl.currentTime=0; } }catch(e){}
  // Always use the real <audio id="mw-bgm"> element (a stale _musicEl from the legacy system would desync).
  _musicEl=document.getElementById('mw-bgm');
  if(!_musicEl) return;
  if(!_defaultBattleSrc){ try{ _defaultBattleSrc=_musicEl.getAttribute('src')||''; }catch(e){} }
  // Per-battlefield soundtrack: if the chosen arena slot has an uploaded track, use it.
  try{
    const bgmKey = _rotatingBgSlot ? ('bgm_arena_'+_rotatingBgSlot) : '';
    const customBgm = bgmKey && (artOverrides[bgmKey] || (typeof _embeddedBgm==='object' && _embeddedBgm[bgmKey]));
    const curBf = _musicEl.getAttribute('data-bf')||'';
    if(customBgm){
      // Always (re)assign when the target differs from what's loaded — forces the correct track.
      if(curBf!==bgmKey){ _musicEl.pause(); _musicEl.src=customBgm; _musicEl.setAttribute('data-bf',bgmKey); _musicEl.load(); }
      try{ console.log('[MW] battlefield music ->', bgmKey, '(slot '+_rotatingBgSlot+')'); }catch(e){}
    } else {
      if(curBf){ _musicEl.pause(); _musicEl.src=_defaultBattleSrc||_musicEl.src; _musicEl.removeAttribute('data-bf'); _musicEl.load(); }
      try{ console.log('[MW] battlefield music -> default (slot '+_rotatingBgSlot+')'); }catch(e){}
    }
  }catch(e){}
  _musicEl.loop=true;
  _musicEl.volume=0.001;
  try{ _musicEl.load(); }catch(e){}
  const p=_musicEl.play();
  const fadeIn=()=>fadeAudio(_musicEl, 0.001, 0.18, 900);
  if(p&&p.then){ p.then(fadeIn).catch(()=>{
    // autoplay blocked — start on next gesture
    const resume=()=>{ if(!_battleMusicLocked){ _musicEl.play().then(fadeIn).catch(()=>{}); } document.removeEventListener('pointerdown',resume); };
    document.addEventListener('pointerdown',resume,{once:true});
  }); }
  else { fadeIn(); }
}


// ═══ INTRO SPLASH SCREEN ═══
// Shows the Medal Wars splash art with a START button. Pressing it plays an SFX,
// kicks off the title BGM (the press satisfies the browser's autoplay gesture),
// and smoothly fades into the title screen.
let _introDone=false;
function startFromIntro(){
  if(_introDone) return; _introDone=true;
  // Visual press feedback on the START button
  try{ const sb=document.getElementById('intro-tap'); if(sb){ sb.style.transform='scale(.92)'; sb.style.opacity='1'; } }catch(e){}
  // CRITICAL: play the BGM audio element DIRECTLY inside this tap gesture.
  // Mobile browsers only allow audio to start from a direct user gesture, so we
  // call .play() synchronously here rather than relying on a deferred path.
  try{
    if(localStorage.getItem('mw_music_on')!=='false'){
      const bgm=document.getElementById('mw-title-bgm');
      if(bgm){
        _titleMusicEl=bgm;
        bgm.volume=0.22; bgm.loop=true;
        // Only start if not already playing (prevents overlap/double playback)
        if(bgm.paused){
          try{ bgm.load(); }catch(e){}
          const p=bgm.play();
          if(p&&p.catch){ p.catch(()=>{}); }
        }
      }
    }
  }catch(e){}
  // Also resume the Web Audio context (for SFX) within the gesture
  try{ if(typeof initUiSounds==='function') initUiSounds(); }catch(e){}
  // Sound effect on press
  try{ if(typeof SFX==='object' && SFX.medaforce) SFX.medaforce(); }catch(e){}
  // Reveal the title screen underneath, then fade the intro away
  const title=document.getElementById('title');
  if(title) title.style.display='';
  const intro=document.getElementById('intro-screen');
  if(intro){
    intro.classList.add('gone');
    setTimeout(()=>{ try{ intro.style.display='none'; }catch(e){} }, 850);
  }
  setTimeout(()=>{ try{ showWhatsNew(false); }catch(e){} }, 1100);
}


// ═══ WHAT'S NEW (shown once per build) ═══════════════════════════
function showWhatsNew(force){
  try{
    if(!force && localStorage.getItem('mw_seen_update')===MW_BUILD) return;
  }catch(e){}
  const body=
    '<div style="text-align:left;font-size:12px;line-height:1.55;color:var(--text)">'+
      '<div style="font-family:Orbitron,monospace;font-weight:800;color:#c83232;font-size:15px;margin-bottom:2px">\u2694 SENBEI: THE REMAINING CUT</div>'+
      '<div style="font-size:9px;color:var(--text3);letter-spacing:.6px;margin-bottom:10px">NEW DECK \u00b7 BUILD '+MW_BUILD+'</div>'+
      '<div style="background:rgba(200,50,50,.08);border-left:3px solid #c83232;border-radius:8px;padding:9px;margin-bottom:9px">'+
        'A ninth deck joins the arena \u2014 an <b style="color:#c83232">Expert</b> stance-control archetype that ends games with a single, inevitable cut.'+
      '</div>'+
      '<div style="font-weight:700;color:#c83232;font-size:10px;margin-bottom:4px">THE BLADESMEN</div>'+
      '<div style="margin-bottom:9px">'+
        '\u2022 <b>Kensho</b> \u2014 the Reader. A non-combatant who holds your Stances and anchors the finisher.<br>'+
        '\u2022 <b>Gobanko</b> \u2014 Bound Stance.<br>'+
        '\u2022 <b>Samurai</b> \u2014 Exposed Stance.<br>'+
        '\u2022 <b>Shinsaber</b> \u2014 Execution Stance.'+
      '</div>'+
      '<div style="font-weight:700;color:#c83232;font-size:10px;margin-bottom:4px">ZANSHIN \u2014 THE MEDAFORCE</div>'+
      '<div style="margin-bottom:9px">Bank Resonance, reach the Threshold, then read three Verdicts onto the enemy. Survive the Interval \u2014 and the Cut falls on all three targets at once.</div>'+
      '<div style="font-size:10px;color:var(--text3)">Also this build: Mr Principal is the new default name, and the main menu now fits the Accessories tab on screen.</div>'+
    '</div>';
  openM("What\u2019s New", body, [
    {l:'\u2694 View Deck Guide',cls:'mb',cb:()=>{ try{localStorage.setItem('mw_seen_update',MW_BUILD);}catch(e){} closeM(); if(typeof openDeckGuide==='function')openDeckGuide('senbei'); }},
    {l:'Let\u2019s Battle',cls:'mb ok',cb:()=>{ try{localStorage.setItem('mw_seen_update',MW_BUILD);}catch(e){} closeM(); }}
  ]);
}

// Hard stop for battle music — fully kills playback so it can never bleed onto the title.
let _battleMusicLocked=false;
function stopBattleMusic(){
  try{
    _battleMusicLocked=true;
    _musicEl=document.getElementById('mw-bgm');
    if(_musicEl){ _musicEl.pause(); try{_musicEl.currentTime=0;}catch(e){} }
  }catch(e){}
}
function startTitleMusic(){
  stopBattleMusic(); // hard lock: ensure battle music is dead before title music starts
  if(!_titleMusicEl) _titleMusicEl=document.getElementById('mw-title-bgm');
  if(!_titleMusicEl) return;
  if(localStorage.getItem('mw_music_on')==='false') return; // respect mute
  // Stop battle music first so the two never overlap
  try{ if(_musicEl){ _musicEl.pause(); _musicEl.currentTime=0; } }catch(e){}
  _titleMusicEl.volume=0.22;
  // Already playing? Don't start a second overlapping playback.
  if(!_titleMusicEl.paused){ return; }
  const tryPlay=()=>{
    if(localStorage.getItem('mw_music_on')==='false') return;
    if(!_titleMusicEl.paused) return;
    try{ _titleMusicEl.load(); }catch(e){}
    const p=_titleMusicEl.play();
    if(p&&p.then){ p.then(()=>{ _titleMusicArmed=false; }).catch(()=>{ armGesture(); }); }
  };
  const armGesture=()=>{
    if(_titleMusicArmed) return; _titleMusicArmed=true;
    const resume=()=>{
      if(_titleMusicEl.paused){ _titleMusicEl.play().catch(()=>{}); }
      document.removeEventListener('pointerdown',resume);
      document.removeEventListener('touchstart',resume);
      document.removeEventListener('keydown',resume);
    };
    document.addEventListener('pointerdown',resume,{once:true});
    document.addEventListener('touchstart',resume,{once:true});
    document.addEventListener('keydown',resume,{once:true});
  };
  // Try immediately, and ALSO always arm a gesture fallback (autoplay is usually blocked)
  tryPlay();
  armGesture();
}
function stopTitleMusic(){ if(_titleMusicEl){ try{ _titleMusicEl.pause(); _titleMusicEl.currentTime=0; }catch(e){} } }


// ── Wire UI sound effects (title hover/select + hand skim) ──
function initUiSounds(){
  // Title screen: hover + select on deck cards and action buttons
  const titleEl=document.getElementById('title');
  if(titleEl && !titleEl._sfxWired){
    titleEl._sfxWired=true;
    const hoverSel='.dpk, .sbtn, .diff-btn-r';
    titleEl.addEventListener('mouseover', e=>{
      const el=e.target.closest(hoverSel);
      if(el && el!==titleEl._lastHover){ titleEl._lastHover=el; try{ SFX.hover(); }catch(_){} }
    });
    titleEl.addEventListener('mouseout', e=>{ if(e.target.closest(hoverSel)) titleEl._lastHover=null; });
    titleEl.addEventListener('click', e=>{
      if(e.target.closest(hoverSel)){ try{ SFX.select(); }catch(_){} }
    }, true);
  }
  // Hand: skim tick while scrolling through cards
  const hand=document.getElementById('m-hand');
  if(hand && !hand._sfxWired){
    hand._sfxWired=true;
    let _lastSkim=0;
    hand.addEventListener('scroll', ()=>{
      const now=Date.now();
      if(now-_lastSkim>90){ _lastSkim=now; try{ SFX.handSkim(); }catch(_){} }
    }, {passive:true});
    // Hovering across cards on PC also ticks
    hand.addEventListener('mouseover', e=>{
      const card=e.target.closest('.hcard, [data-uid]');
      if(card && card!==hand._lastCard){ hand._lastCard=card; const now=Date.now(); if(now-_lastSkim>60){ _lastSkim=now; try{ SFX.handSkim(); }catch(_){} } }
    });
  }
}

function startInteractiveTutorial(){
  _itutActive=true; _itutStep=0;
  // Force an easy practice match
  deck = deck||'blaze';
  cpuDiff='easy';
  showItutStep();
}

function showItutStep(){
  const step=ITUT[_itutStep];
  if(!step){ endInteractiveTutorial(); return; }

  // Handle the 'start' action — launch the match behind the coach box
  if(step.action==='start' && document.getElementById('title') && !document.getElementById('title').classList.contains('gone')){
    document.getElementById('title').classList.add('gone');
    fadeOutTitleMusic(700); startBattleMusic();
    init();
    try{ closeM(); }catch(e){}            // skip mulligan prompt in the tutorial
    try{ G.phase='charge'; runPhase(); }catch(e){}  // advance into ACTION phase so attacks work
    try{ initTooltipDelegation(); updateArenaColor(); }catch(e){}
  }

  // Clear any previous highlight
  document.querySelectorAll('.itut-glow').forEach(el=>el.classList.remove('itut-glow'));
  // Apply highlight to the target element
  if(step.highlight){
    const tgt=document.querySelector(step.highlight);
    if(tgt) tgt.classList.add('itut-glow');
  }

  // Build/refresh the coach box (small, bottom, non-blocking)
  let box=document.getElementById('itut-box');
  if(!box){
    box=document.createElement('div'); box.id='itut-box';
    document.body.appendChild(box);
  }
  const isLast=_itutStep===ITUT.length-1;
  const waitMode=step.action==='wait_attack';
  box.innerHTML=
    '<div style="font-family:Orbitron,monospace;font-size:13px;font-weight:800;color:var(--gold);margin-bottom:5px">'+step.title+'</div>'+
    '<div style="font-size:12px;line-height:1.5;color:var(--text);margin-bottom:10px">'+step.body+'</div>'+
    '<div style="display:flex;gap:8px;align-items:center;justify-content:space-between">'+
      '<span style="font-size:9px;color:var(--text3)">'+(_itutStep+1)+' / '+ITUT.length+'</span>'+
      '<div style="display:flex;gap:6px">'+
        (waitMode?'':'<button onclick="itutNext()" style="font-family:Orbitron,monospace;font-size:11px;font-weight:700;padding:6px 16px;border-radius:6px;border:1px solid var(--gold);background:rgba(240,176,48,.18);color:var(--gold);cursor:pointer">'+(isLast?'PLAY':'NEXT')+'</button>')+
        (isLast?'':'<button onclick="endInteractiveTutorial()" style="font-size:10px;padding:6px 10px;border-radius:6px;border:1px solid var(--border);background:transparent;color:var(--text3);cursor:pointer">Skip</button>')+
      '</div>'+
    '</div>'+
    (waitMode?'<div style="font-size:10px;color:var(--storm2);margin-top:6px;text-align:center;pointer-events:auto">\u261d Tap your bot, then an enemy &nbsp;\u00b7&nbsp; <span onclick="itutForceNext()" style="color:var(--text3);text-decoration:underline;cursor:pointer">skip step</span></div>':'');
  box.style.display='block';
  // During the interactive attack step: move box to top + click-through so the
  // player can actually reach the bots and hand it's pointing at.
  if(waitMode){
    box.style.top='10px'; box.style.bottom='auto'; box.style.pointerEvents='none';
    // Guarantee the game is in the action phase so taps register
    try{ if(G && G.phase==='charge'){ runPhase(); } if(G){ atked=false; } }catch(e){}
  }
  else { box.style.top='auto'; box.style.bottom='14px'; box.style.pointerEvents='auto'; }
}

function itutForceNext(){ _itutStep++; showItutStep(); }
function itutNext(){
  const step=ITUT[_itutStep];
  if(step.action==='finish'){ endInteractiveTutorial(); return; }
  _itutStep++;
  showItutStep();
}

// Called by the attack handler when the player attacks during the tutorial
function itutOnAttack(){
  if(!_itutActive) return;
  const step=ITUT[_itutStep];
  if(step && step.action==='wait_attack'){
    setTimeout(()=>{ _itutStep++; showItutStep(); }, 900);
  }
}

function endInteractiveTutorial(){
  _itutActive=false;
  document.querySelectorAll('.itut-glow').forEach(el=>el.classList.remove('itut-glow'));
  const box=document.getElementById('itut-box'); if(box) box.style.display='none';
  log('Tutorial complete — battle on!','info');
}

function startTutorial(){
  _tutStep = 0;
  showTutStep();
}

function showTutStep(){
  const step = TUT_STEPS[_tutStep];
  if(!step){ endTutorial(); return; }
  const isLast = _tutStep === TUT_STEPS.length - 1;
  const isFirst = _tutStep === 0;
  const ov = document.getElementById('tut-overlay');
  if(!ov){ endTutorial(); return; }
  ov.style.display = 'flex';
  const prog = TUT_STEPS.map((s,i)=>'<span style="display:inline-block;width:7px;height:7px;border-radius:50%;margin:0 3px;background:'+(i===_tutStep?'var(--gold)':'rgba(255,220,180,.2)')+'"></span>').join('');
  ov.innerHTML =
    '<div style="background:linear-gradient(160deg,rgba(32,20,26,.98),rgba(18,12,16,.98));border:1.5px solid rgba(240,176,48,.35);border-radius:16px;padding:22px;max-width:330px;box-shadow:0 12px 48px rgba(0,0,0,.6)">'+
      '<div style="font-family:\'Orbitron\',monospace;font-size:15px;font-weight:800;color:var(--gold);margin-bottom:10px;letter-spacing:.5px">'+step.t+'</div>'+
      '<div style="font-size:13px;line-height:1.55;color:var(--text);margin-bottom:16px">'+step.b+'</div>'+
      '<div style="text-align:center;margin-bottom:14px">'+prog+'</div>'+
      '<div style="display:flex;gap:8px;justify-content:space-between;align-items:center">'+
        '<button onclick="skipTutorial()" style="background:none;border:none;color:var(--text3);font-size:11px;font-family:\'Orbitron\',monospace;cursor:pointer;padding:6px 10px">'+(isLast?'':'SKIP')+'</button>'+
        '<div style="display:flex;gap:6px">'+
          (isFirst?'':'<button onclick="tutPrev()" style="background:rgba(255,220,180,.06);border:1px solid var(--border2);color:var(--text2);border-radius:7px;font-size:11px;font-family:\'Orbitron\',monospace;font-weight:700;cursor:pointer;padding:8px 14px">BACK</button>')+
          '<button onclick="tutNext()" style="background:linear-gradient(135deg,var(--gold),var(--amber));border:none;color:#1a1008;border-radius:7px;font-size:11px;font-family:\'Orbitron\',monospace;font-weight:800;cursor:pointer;padding:8px 18px;letter-spacing:.5px">'+(isLast?'START PLAYING':'NEXT')+'</button>'+
        '</div>'+
      '</div>'+
    '</div>';
}

function tutNext(){
  _tutStep++;
  if(_tutStep >= TUT_STEPS.length) endTutorial();
  else showTutStep();
}
function tutPrev(){ if(_tutStep>0){_tutStep--;showTutStep();} }
function skipTutorial(){ endTutorial(); }
function endTutorial(){
  const ov = document.getElementById('tut-overlay');
  if(ov) ov.style.display = 'none';
  try{ localStorage.setItem('mw_tutorial_seen','1'); }catch(e){}
}
function maybeShowTutorial(){
  let seen = false;
  try{ seen = localStorage.getItem('mw_tutorial_seen')==='1'; }catch(e){}
  if(!seen){ setTimeout(startTutorial, 600); }
}


// MWNet - online multiplayer client (room-code relay)
const MWNet = (function(){
  const SERVER_URL = (window.MW_SERVER_URL || null);
  function _anonId(){ try{ let a=localStorage.getItem('mw_anon_id'); if(!a){ a='anon'+Math.random().toString(36).slice(2,12); localStorage.setItem('mw_anon_id',a); } return a; }catch(e){ return 'anon'+Math.random().toString(36).slice(2,12); } }
  function _httpBase(){ if(!SERVER_URL) return null; return SERVER_URL.replace(/^wss:/,'https:').replace(/^ws:/,'http:'); }
  let _wokenOnce = false; // once we've seen a real HTTP 200, don't re-wake every connect() in this session
  // Free-tier hosts (Railway, etc.) sleep when idle. Racing a cold start with the WS
  // upgrade often fails outright. Hit plain HTTP /health first — which already has
  // good retry semantics — and only attempt the WebSocket once the server answers.
  function _wakeServer(onStatus){
    return new Promise((resolve)=>{
      const base = _httpBase();
      if(!base || _wokenOnce){ resolve(true); return; } // nothing to wake, or already confirmed awake
      if(onStatus) onStatus('waking');
      const ctrl = (typeof AbortController!=='undefined') ? new AbortController() : null;
      const to = setTimeout(()=>{ try{ if(ctrl) ctrl.abort(); }catch(e){} }, 28000);
      fetch(base+'/health', ctrl?{signal:ctrl.signal}:{})
        .then((r)=>{ clearTimeout(to); _wokenOnce = !!(r && r.ok); resolve(_wokenOnce); })
        .catch(()=>{ clearTimeout(to); resolve(false); });
    });
  }
  function _saveReconnect(){ try{ if(_code&&_seat!==null) localStorage.setItem('mw_reconnect', JSON.stringify({code:_code, seat:_seat, t:Date.now()})); }catch(e){} }
  function _loadReconnect(){ try{ const r=JSON.parse(localStorage.getItem('mw_reconnect')||'null'); if(r&&Date.now()-r.t<120000) return r; }catch(e){} return null; }
  let ws = null, _seat = null, _code = null, _seed = null, _connected = false, _oppDeck = null, _oppMf = null;
  const handlers = {};
  function on(type, fn){ handlers[type] = fn; }
  function fire(type, data){ if(handlers[type]) handlers[type](data); }
  let _wakeStatusFn = null;
  function connect(){
    return new Promise((resolve, reject)=>{
      if(!SERVER_URL){ reject(new Error('no_server')); return; }
      // If already connected, resolve immediately
      if(ws && ws.readyState===WebSocket.OPEN){ resolve(); return; }
      _wakeServer(_wakeStatusFn).then(()=>{ _openSocket(resolve, reject); });
    });
  }
  function _openSocket(resolve, reject){
      let settled = false;
      const done = (fn,arg)=>{ if(!settled){ settled=true; fn(arg); } };
      // 10s connection timeout so we never hang silently
      const timer = setTimeout(()=>{ done(reject, new Error('timeout')); try{ if(ws) ws.close(); }catch(_){} }, 25000);
      try{
        ws = new WebSocket(SERVER_URL);
        ws.onopen = ()=>{ _connected = true; };
        ws.onclose = (ev)=>{ _connected = false; window._lastWsClose = (ev&&ev.code)||'?'; if(!settled){ clearTimeout(timer); done(reject, new Error('ws_closed_'+((ev&&ev.code)||'?'))); } fire('disconnected'); try{ if(typeof attemptReconnect==='function') attemptReconnect(); }catch(e){} };
        ws.onerror = (ev)=>{ window._lastWsError = 'error'; clearTimeout(timer); done(reject, new Error('connect_failed')); };
        ws.onmessage = (e)=>{
          let m; try{ m = JSON.parse(e.data); }catch(_){ return; }
          if(m.type==='connected'){ clearTimeout(timer); done(resolve); return; }
          if(m.type==='created'){ _code=m.code; _seat=m.seat; _seed=m.seed; _saveReconnect(); }
          if(m.type==='reconnected'){ _code=m.code; _seat=m.seat; if(m.oppDeck)_oppDeck=m.oppDeck; if(m.oppMf)_oppMf=m.oppMf; }
          if(m.type==='joined'){ _code=m.code; _seat=m.seat; _seed=m.seed; if(m.oppDeck)_oppDeck=m.oppDeck; if(m.oppMf)_oppMf=m.oppMf; _saveReconnect(); }
          if(m.type==='opponent_joined'){ if(m.oppDeck)_oppDeck=m.oppDeck; if(m.oppMf)_oppMf=m.oppMf; }
          if(m.type==='match_found'){ _code=m.code; _seat=m.seat; _seed=m.seed; if(m.oppDeck)_oppDeck=m.oppDeck; if(m.oppMf)_oppMf=m.oppMf; _saveReconnect(); }
          if(m.type==='rematch'){ _seed=m.seed; if(m.oppDeck)_oppDeck=m.oppDeck; if(m.deck)_oppDeck=m.deck; }
          fire(m.type, m);
        };
      }catch(e){ reject(e); }
  }
  function sendRaw(obj){ if(ws && ws.readyState===WebSocket.OPEN) ws.send(JSON.stringify(obj)); }
  return {
    available(){ return !!SERVER_URL; },
    connected(){ return _connected; },
    onWakeStatus(fn){ _wakeStatusFn = fn; },
    seat(){ return _seat; }, code(){ return _code; }, seed(){ return _seed; }, oppDeck(){ return _oppDeck; }, oppMf(){ return _oppMf; },
    reconnect(){ const info=_loadReconnect(); if(!info) return false; connect().then(()=>{ sendRaw({type:'reconnect', code:info.code, seat:info.seat}); }).catch(()=>{}); return true; },
    hasSession(){ return !!_loadReconnect(); },
    clearSession(){ try{ localStorage.removeItem('mw_reconnect'); }catch(e){} },
    on,
    async create(deckName, mfName){ await connect(); sendRaw({type:'create',token:(typeof MWBeta!=='undefined'?MWBeta.token():null), deck:deckName, mf:mfName}); },
    async queue(deckName, mfName, name){ await connect(); sendRaw({type:'queue',token:(typeof MWBeta!=='undefined'?MWBeta.token():null), anonId:_anonId(), deck:deckName, mf:mfName, name:name||null}); },
    leaveQueue(){ sendRaw({type:'queue_leave'}); },
    async join(code, deckName, mfName){ await connect(); sendRaw({type:'join',token:(typeof MWBeta!=='undefined'?MWBeta.token():null), code:code, deck:deckName, mf:mfName}); },
    move(moveObj){ sendRaw({type:'move', move:moveObj}); },
    syncState(state){ sendRaw({type:'sync', state:state}); },
    endTurn(){ sendRaw({type:'end_turn'}); },
    gameOver(winnerSeat){ sendRaw({type:'game_over', winnerSeat:winnerSeat}); },
    rematch(deck, mf){ if(deck)_oppDeck=_oppDeck; sendRaw({type:'rematch', deck:deck, mf:mf}); },
    chat(text){ sendRaw({type:'chat', text:text}); },
    leave(){ sendRaw({type:'leave'}); if(ws) ws.close(); }
  };
})();


