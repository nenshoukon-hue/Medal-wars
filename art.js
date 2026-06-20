// ── Default art: published manifest becomes everyone's base skin ──

// Admin secret for publishing shared art (operator-only). Kept in memory only.
let _mwAdminSecret=null;
function getAdminSecret(cb){
  if(_mwAdminSecret){ cb(_mwAdminSecret); return; }
  openM('Operator Access',
    'Publishing shared art is operator-only. Enter your admin secret (the ADMIN_SECRET you set in Railway):<br><br>'+
    '<input id="admin-secret-input" type="password" placeholder="admin secret" style="width:100%;padding:10px;border-radius:8px;border:1px solid var(--border);background:rgba(0,0,0,.3);color:var(--text);font-size:13px">'+
    '<div id="admin-secret-msg" style="font-size:11px;color:var(--text3);margin-top:8px;min-height:14px;text-align:center"></div>',
    [{l:'CONFIRM',cls:'mb ok',cb:async()=>{
        const v=(document.getElementById('admin-secret-input')||{}).value||'';
        const msg=document.getElementById('admin-secret-msg');
        if(!v){ if(msg)msg.textContent='Enter the secret.'; return; }
        if(msg){ msg.style.color='var(--text3)'; msg.textContent='Verifying\u2026'; }
        const base=(typeof ArtCloud!=='undefined'&&ArtCloud.base)?ArtCloud.base():null;
        if(!base){ if(msg){msg.style.color='var(--red)';msg.textContent='Server unavailable.';} return; }
        try{
          const r=await fetch(base+'/admin/check',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({secret:v})});
          const j=await r.json();
          if(j.ok){ _mwAdminSecret=v; closeM(); cb(v); }
          else if(!j.adminConfigured){ if(msg){msg.style.color='var(--red)';msg.textContent='No ADMIN_SECRET is set on the server. Add it in Railway \u2192 Variables, then redeploy.';} }
          else { if(msg){msg.style.color='var(--red)';msg.textContent='That secret doesn\'t match. Check Railway \u2192 Variables.';} }
        }catch(e){ if(msg){msg.style.color='var(--red)';msg.textContent='Could not reach the server.';} }
      }},
     {l:'Cancel',cls:'mb',cb:()=>closeM()}]);
}

async function publishDefaultArt(){
  if(!devGuard())return;
  const base = (typeof ArtCloud!=='undefined'&&ArtCloud.base)?ArtCloud.base():null;
  if(!base){ openM('Set as Default','Could not reach the server. Try again in a few seconds.',[{l:'OK',cls:'mb ok',cb:()=>closeM()}]); return; }
  const keys = Object.keys(artCloudUrls||{}).filter(k=>!k.startsWith('opp_'));
  if(keys.length===0){
    openM('Set as Default','No cloud art found. Tap \u2601 Sync first so your art has cloud URLs, then try again.',[{l:'OK',cls:'mb ok',cb:()=>closeM()}]);
    return;
  }
  const manifest={}; keys.forEach(k=>{ if(artCloudUrls[k]) manifest[k]=artCloudUrls[k]; });
  try{
    const r = await fetch(base+'/art/manifest',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({manifest, secret:(typeof _mwAdminSecret!=='undefined'?_mwAdminSecret:null)})});
    const j = await r.json().catch(()=>({}));
    if(r.ok&&j.ok){
      openM('Default Art Published','<div style="text-align:center"><div style="font-size:28px;margin:8px 0">\u2728</div><b style="color:var(--gold)">'+j.keys+'</b> images are now the default art for every player.<br><br><span style="font-size:10px;color:var(--text2)">Players see your art automatically. Their own uploads still override it on their device.</span></div>',[{l:'Done',cls:'mb ok',cb:()=>closeM()}]);
    }else{
      openM('Set as Default','Publish failed'+(j.error?' ('+j.error+')':'')+'. Try again.',[{l:'OK',cls:'mb ok',cb:()=>closeM()}]);
    }
  }catch(e){
    openM('Set as Default','Could not reach the server: '+e.message,[{l:'OK',cls:'mb ok',cb:()=>closeM()}]);
  }
}

async function loadDefaultArt(){
  try{
    const base = (typeof ArtCloud!=='undefined'&&ArtCloud.base)?ArtCloud.base():null;
    if(!base) return;
    const r = await fetch(base+'/art/manifest',{method:'GET'});
    if(!r.ok) return;
    const manifest = await r.json();
    let applied=0;
    Object.keys(manifest||{}).forEach(k=>{
      if(!artOverrides[k]){ artOverrides[k]=manifest[k]; applied++; } // local uploads win
    });
    if(applied>0){ try{renderAll();}catch(_){} try{renderTitleDecks&&renderTitleDecks();}catch(_){} try{applyBattlefieldArt();}catch(_){} }
  }catch(e){}
}

async function syncAllArtToCloud(){
  if(!devGuard())return;
  if(!ArtCloud.enabled()){
    // Try to initialize — server may have just woken up
    await ArtCloud.check();
  }
  if(!ArtCloud.enabled()){
    openM('Cloud Sync',
      'Could not reach the cloud storage server. Make sure you are online and try again in a few seconds.',
      [{l:'OK', cls:'mb ok', cb:()=>closeM()}]);
    return;
  }
  const keys = Object.keys(artOverrides).filter(k=>!k.startsWith('opp_')&&typeof artOverrides[k]==='string'&&artOverrides[k].startsWith('data:'));
  if(keys.length === 0){
    openM('Cloud Sync','No art to sync — upload some bot art first.',
      [{l:'OK', cls:'mb ok', cb:()=>closeM()}]);
    return;
  }
  // Show progress modal
  const updateProgress = (done, total, failed) => {
    const pct = Math.round(done/total*100);
    const bar = Array(Math.round(pct/5)).fill('█').join('')+Array(20-Math.round(pct/5)).fill('░').join('');
    const el = document.getElementById('sync-progress-body');
    if(el) el.innerHTML =
      '<div style="font-family:Orbitron,monospace;font-size:18px;color:var(--gold);margin:8px 0">'+pct+'%</div>'+
      '<div style="font-family:monospace;font-size:11px;color:var(--text2);letter-spacing:1px;margin-bottom:8px">'+bar+'</div>'+
      done+' / '+total+' images'+(failed>0?' <span style="color:var(--red)">('+failed+' failed)</span>':'');
  };
  openM('Syncing to Cloud',
    '<div id="sync-progress-body" style="text-align:center;padding:8px 0">Starting...</div>',
    [{l:'Running...', cls:'mb', cb:()=>{}}]);
  // Disable the button during sync
  const btn = document.querySelector('[onclick="syncAllArtToCloud()"]');
  if(btn){ btn.disabled=true; btn.textContent='Syncing...'; }
  let done=0, failed=0;
  const total = keys.length;
  for(const key of keys){
    try{
      // Skip if we already have a valid URL for this key
      if(artCloudUrls[key]){done++;updateProgress(done,total,failed);continue;}
      const url = await ArtCloud.upload(artOverrides[key]);
      if(url){ artCloudUrls[key]=url; try{ArtDB.set('url_'+key,url);}catch(_){} }
      else failed++;
    }catch(e){ failed++; }
    done++;
    updateProgress(done, total, failed);
  }
  // Done — show result
  const synced = done - failed;
  closeM();
  openM('Cloud Sync Complete',
    '<div style="text-align:center">'+
    '<div style="font-size:28px;margin:8px 0">'+(failed===0?'✓':'⚠')+'</div>'+
    '<b style="color:var(--gold)">'+synced+' / '+total+'</b> images synced to cloud'+
    (failed>0?'<br><span style="color:var(--red);font-size:11px">'+failed+' failed'+(window._lastArtErr?' ('+window._lastArtErr+')':'')+' — try again</span>':'')+
    '</div>',
    [{l:'Done', cls:'mb ok', cb:()=>closeM()}]);
  if(btn){ btn.disabled=false; btn.textContent='☁ Sync'; }
  if(typeof updatePmStorageInfo==='function') updatePmStorageInfo();
}

async function uploadArtToCloud(key, dataUrl){
  try{
    const url = await ArtCloud.upload(dataUrl);
    if(url){
      artCloudUrls[key] = url;
      try{ ArtDB.set('url_'+key, url); }catch(e){}
    }
  }catch(e){ /* stays local-only */ }
}

// At online match start, build the art-URL manifest for the bots/MF in play.
function buildArtManifest(){
  const manifest = {};
  for(const k in artCloudUrls){ if(artCloudUrls[k]) manifest[k] = artCloudUrls[k]; }
  return manifest;
}

// Apply an opponent's art manifest: fetch each URL and slot it into artOverrides
// under a namespaced key so it only shows on the opponent's side.
async function applyOpponentArt(manifest){
  if(!manifest) return;
  for(const key in manifest){
    const url = manifest[key];
    try{
      const r = await fetch(url);
      const blob = await r.blob();
      const dataUrl = await new Promise((res,rej)=>{ const fr=new FileReader(); fr.onload=()=>res(fr.result); fr.onerror=rej; fr.readAsDataURL(blob); });
      artOverrides['opp_'+key] = dataUrl;
    }catch(e){ /* skip this image */ }
  }
  if(typeof renderAll==='function'){ try{ renderAll(); }catch(_){} }
}


// ═══ STAGE SELECT ═══
// Song titles for each battlefield slot (shown under the stage image).
const STAGE_SONGS = {
  1: 'Arcade Revolt',
  2: 'Gutter Victory',
  3: 'Starlight Ascension',
  4: 'Sunlit Steel Drum',
  5: 'Crimson Tide Rebellion'
};
let _stageChosen = null;       // slot number the player picked (or 'random')
let _pendingStartGame = false; // guard so startGame proceeds after stage pick
function _availableStages(){
  // A stage is selectable if it has a background image OR a soundtrack (uploaded or embedded).
  const out=[];
  for(let i=1;i<=5;i++){
    const hasBg = !!artOverrides['bg_arena_'+i];
    const hasMusic = !!artOverrides['bgm_arena_'+i] || (typeof _embeddedBgm==='object' && !!_embeddedBgm['bgm_arena_'+i]);
    if(hasBg || hasMusic) out.push(i);
  }
  return out;
}
function showStageSelect(onChosen){
  const stages=_availableStages();
  // No custom stages → skip straight through.
  if(!stages.length){ _stageChosen='random'; onChosen(); return; }
  _previewSel = stages[0]; // default highlighted = first stage
  const stageColors={1:'#e0703a',2:'#c8a020',3:'#6a78d0',4:'#40b0a0',5:'#b03030'};
  let html='<div style="display:flex;flex-wrap:wrap;gap:10px;justify-content:center;max-height:48vh;overflow-y:auto;padding:4px">';
  stages.forEach(i=>{
    const img=artOverrides['bg_arena_'+i];
    const song=STAGE_SONGS[i]||('Arena '+i);
    const hasMusic = !!(artOverrides['bgm_arena_'+i] || (typeof _embeddedBgm==='object' && _embeddedBgm['bgm_arena_'+i]));
    // Use the art if present, otherwise a colored gradient placeholder so the picker always renders.
    const bgStyle = img ? ('background:url(\''+img+'\') center/cover') : ('background:linear-gradient(135deg,'+(stageColors[i]||'#444')+',#0a0c14)');
    html+='<div class="stage-card" id="stagecard-'+i+'" onclick="_selectStage('+i+')" style="cursor:pointer;width:130px;border:2px solid '+(i===_previewSel?'#f0c040':'rgba(240,176,48,.35)')+';border-radius:12px;overflow:hidden;background:#0a0c14;transition:transform .12s,border-color .12s">'
       +'<div id="stagebg-'+i+'" style="height:78px;'+bgStyle+';position:relative;display:flex;align-items:center;justify-content:center">'
       +(img?'':'<span style="font-family:\'Orbitron\',monospace;font-size:9px;color:rgba(255,255,255,.5)">STAGE '+i+'</span>')
       +'<div id="stageplay-'+i+'" style="position:absolute;bottom:4px;right:4px;font-size:13px;opacity:'+(hasMusic?'.85':'0')+'">\u25b6\ufe0f</div></div>'
       +'<div style="padding:6px 4px;text-align:center;font-family:\'Orbitron\',monospace">'
       +'<div style="font-size:11px;font-weight:800;color:#f0c040;letter-spacing:.5px">'+song+'</div>'
       +'<div style="font-size:8px;color:'+(hasMusic?'#5ad0e0':'#888')+';margin-top:2px">'+(hasMusic?'\u266a tap to preview':'No music')+'</div>'
       +'</div></div>';
  });
  html+='</div><div style="text-align:center;font-size:9px;color:#888;margin-top:6px">Tap a stage to preview its music, then hit Battle.</div>';
  openM('SELECT BATTLEFIELD', html,
    [{l:'\u2694\ufe0f BATTLE',cls:'mb',cb:()=>{ _stopStagePreview(); _pickStage(_previewSel); }},
     {l:'\ud83c\udfb2 Random',cls:'mb',cb:()=>{ _stopStagePreview(); _pickStage('random'); }}]);
  // Live-load any missing stage art from IndexedDB and fill the card backgrounds when ready.
  try{
    if(typeof ArtDB==='object' && ArtDB.get){
      stages.forEach(i=>{
        if(!artOverrides['bg_arena_'+i]){
          ArtDB.get('bg_arena_'+i).then(v=>{
            if(v){ const url=(typeof v==='string'?v:(v.value||v)); artOverrides['bg_arena_'+i]=url;
              const el=document.getElementById('stagebg-'+i);
              if(el){ el.style.background='url(\''+url+'\') center/cover'; el.innerHTML='<div id="stageplay-'+i+'" style="position:absolute;bottom:4px;right:4px;font-size:13px">\u25b6\ufe0f</div>'; }
            }
          }).catch(()=>{});
        }
      });
    }
  }catch(e){}
}

let _previewSel=null;
let _stagePreviewEl=null;
function _stopStagePreview(){
  try{ if(_stagePreviewEl){ _stagePreviewEl.pause(); _stagePreviewEl.currentTime=0; _stagePreviewEl=null; } }catch(e){}
}
function _selectStage(i){
  _previewSel=i;
  // Highlight the chosen card, un-highlight others
  try{
    _availableStages().forEach(s=>{ const el=document.getElementById('stagecard-'+s); if(el) el.style.borderColor=(s===i?'#f0c040':'rgba(240,176,48,.35)'); });
  }catch(e){}
  // Play a short music preview for this stage
  _stopStagePreview();
  try{
    const src = artOverrides['bgm_arena_'+i] || (typeof _embeddedBgm==='object' && _embeddedBgm['bgm_arena_'+i]);
    if(src && localStorage.getItem('mw_music_on')!=='false'){
      // Pause title music during preview so they don't overlap
      try{ if(_titleMusicEl) _titleMusicEl.pause(); }catch(e){}
      const a=new Audio(src); a.volume=0.5; _stagePreviewEl=a;
      a.play().catch(()=>{});
      // Stop the preview after 8 seconds
      setTimeout(()=>{ if(_stagePreviewEl===a){ _stopStagePreview(); } }, 8000);
    }
  }catch(e){}
}
function _pickStage(sel){
  _stopStagePreview();
  if(sel==='random'){
    _stageChosen='random';
    try{ pickRotatingBg(); }catch(e){}
  } else {
    _stageChosen=sel;
    // Force this specific stage
    _rotatingBgUrl=artOverrides['bg_arena_'+sel]||'';
    _rotatingBgSlot=sel;
  }
  closeM();
  if(typeof _afterStageSelect==='function'){ const cb=_afterStageSelect; _afterStageSelect=null; cb(); }
}
let _afterStageSelect=null;

// Intercept: show stage select before the match begins (once per match start).
let _disclaimerShown=false;

function openDeckGate(){
  var g=document.getElementById('deck-gate');
  if(g){ g.classList.add('open'); g.scrollTop=0; }
}
function closeDeckGate(){
  var g=document.getElementById('deck-gate');
  if(g) g.classList.remove('open');
}
function startGameGate(){
  if(_disclaimerShown){ startGame(); return; }
  openM(
    '⚠️ Fan Project Disclaimer',
    '<div style="text-align:left;font-size:12px;line-height:1.6;color:var(--text2)">'+
      'Medal Wars is an unofficial, non-commercial fan game created by a fan, for fans.<br><br>'+
      'It is <b style="color:var(--gold)">not affiliated with, endorsed by, or sponsored by</b> the official Medabots brand, its creators, publishers, or rights holders.<br><br>'+
      'All trademarks, character names, and original IP referenced or inspired by Medabots remain the property of their respective owners. No copyright or trademark infringement is intended.<br><br>'+
      'This project exists purely as a tribute and will be taken down upon request from the rights holders.'+
    '</div>',
    [{l:'I Understand — Continue',cls:'mb ok',cb:()=>{ _disclaimerShown=true; closeM(); startGame(); }}]
  );
}
function startGame(){
  // Ensure battlefield art is loaded from storage BEFORE deciding whether to show the stage picker.
  // (Art loads async from IndexedDB, so on a fresh open artOverrides may not be populated yet.)
  if(!_stageChosen){
    _ensureStageArt(()=>{
      if(_availableStages().length){
        _afterStageSelect=()=>{ _startGameNow(); };
        showStageSelect(()=>{});
      } else {
        _startGameNow();
      }
    });
    return;
  }
  _startGameNow();
}
// Pull bg_arena_1..4 from IndexedDB into artOverrides if not already present, then continue.
function _ensureStageArt(done){
  try{
    // If any arena bg is already in memory, we're good.
    let haveAny=false; for(let i=1;i<=5;i++){ if(artOverrides['bg_arena_'+i]){ haveAny=true; break; } }
    if(haveAny || typeof ArtDB!=='object' || !ArtDB.get){ done(); return; }
    let pending=4, finished=false;
    const finish=()=>{ if(!finished){ finished=true; done(); } };
    for(let i=1;i<=5;i++){
      ArtDB.get('bg_arena_'+i).then(v=>{
        if(v){ artOverrides['bg_arena_'+i]=(typeof v==='string'?v:(v.value||v)); }
      }).catch(()=>{}).finally(()=>{ if(--pending<=0) finish(); });
    }
    // Safety: don't hang if storage is slow
    setTimeout(finish, 1200);
  }catch(e){ done(); }
}
function _startGameNow(){
  // Honor an explicit stage pick; only randomize if the player chose Random (or no pick).
  const _explicitStage = (_stageChosen && _stageChosen!=='random') ? _stageChosen : null;
  _stageChosen=null; // reset for next match
  fadeOutTitleMusic(700);
  try{
    if(_explicitStage){
      _rotatingBgSlot=_explicitStage; _rotatingBgUrl=artOverrides['bg_arena_'+_explicitStage]||'';
    } else {
      _rotatingBgSlot=0; _rotatingBgUrl=''; // clear so pickRotatingBg chooses fresh
      pickRotatingBg();
    }
    applyBattlefieldArt();
  }catch(e){}
  startBattleMusic();           // battle music starts immediately, fading in (uses chosen battlefield's track)
  document.getElementById('title').classList.add('gone');
  init();log('Robattle begins! CPU: '+cpuDiff.toUpperCase()+'. Good luck.','info');
  setTimeout(initTooltipDelegation,100);
  setTimeout(updateArenaColor,200);
  offerMulligan();
  maybeShowTutorial();
}

function offerMulligan(){
  renderAll();
  const handNames=G.p.hand.map(c=>c.name).join(', ');
  openM('Opening Hand',
    'Your starting hand:<br><b style="color:var(--gold)">'+handNames+'</b><br><br>'+
    '<span style="color:var(--text2);font-size:12px">Keep this hand, or shuffle it back and redraw once? You can only mulligan one time.</span>',
    [
      {l:'✓ Keep this hand',cls:'mb ok',cb:()=>{closeM();runPhase();}},
      {l:'↻ Mulligan (redraw once)',cls:'mb',cb:()=>{
        const n=G.p.hand.length;
        G.p.deck.push(...G.p.hand);
        G.p.hand=[];
        shuffle(G.p.deck);
        for(let i=0;i<n;i++)drw(G.p);
        log('Mulligan — redrew '+n+' cards.','info');
        closeM();runPhase();
      }}
    ]
  );
}

// ESC clears selection
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){G.p.selBot=null;G.p.selCard=null;_drag=null;renderAll();}
});

// ═══ ART UPLOAD SYSTEM ════════════════════════════════════
// ── ART STORAGE SYSTEM ─────────────────────────────────────────
// Backed by localStorage — art persists across sessions automatically.
const ART_STORAGE_PREFIX = 'medalwars_art_';

// ═══════════════════════════════════════════════════════
// IndexedDB Art Store — large capacity, persistent.
// Falls back to localStorage if IDB unavailable.
// ═══════════════════════════════════════════════════════
const ArtDB = (function(){
  const DB_NAME = 'medalwars_art_db';
  const STORE = 'art';
  let _db = null;
  let _ready = null;

  function open(){
    if(_ready) return _ready;
    _ready = new Promise((resolve)=>{
      if(!window.indexedDB){ resolve(null); return; }
      try{
        const req = indexedDB.open(DB_NAME, 1);
        req.onupgradeneeded = (e)=>{
          const db = e.target.result;
          if(!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
        };
        req.onsuccess = (e)=>{ _db = e.target.result; resolve(_db); };
        req.onerror = ()=>{ console.warn('IDB open failed'); resolve(null); };
      }catch(e){ resolve(null); }
    });
    return _ready;
  }

  return {
    async set(key, val){
      const db = await open();
      if(!db){ try{ localStorage.setItem(ART_STORAGE_PREFIX+key, val); return true; }catch(e){ return false; } }
      return new Promise((resolve)=>{
        try{
          const tx = db.transaction(STORE,'readwrite');
          tx.objectStore(STORE).put(val, key);
          tx.oncomplete = ()=>resolve(true);
          tx.onerror = ()=>{ try{ localStorage.setItem(ART_STORAGE_PREFIX+key,val); }catch(e){} resolve(false); };
        }catch(e){ resolve(false); }
      });
    },
    async get(key){
      const db = await open();
      if(!db){ try{ return localStorage.getItem(ART_STORAGE_PREFIX+key); }catch(e){ return null; } }
      return new Promise((resolve)=>{
        try{
          const tx = db.transaction(STORE,'readonly');
          const r = tx.objectStore(STORE).get(key);
          r.onsuccess = ()=>resolve(r.result || null);
          r.onerror = ()=>resolve(null);
        }catch(e){ resolve(null); }
      });
    },
    async all(){
      const db = await open();
      if(!db){
        const out = {};
        try{ for(let i=0;i<localStorage.length;i++){ const k=localStorage.key(i); if(k&&k.startsWith(ART_STORAGE_PREFIX)) out[k.slice(ART_STORAGE_PREFIX.length)]=localStorage.getItem(k); } }catch(e){}
        return out;
      }
      return new Promise((resolve)=>{
        try{
          const tx = db.transaction(STORE,'readonly');
          const store = tx.objectStore(STORE);
          const out = {};
          const cur = store.openCursor();
          cur.onsuccess = (e)=>{ const c=e.target.result; if(c){ out[c.key]=c.value; c.continue(); } else resolve(out); };
          cur.onerror = ()=>resolve(out);
        }catch(e){ resolve({}); }
      });
    },
    async del(key){
      const db = await open();
      if(!db){ try{ localStorage.removeItem(ART_STORAGE_PREFIX+key); }catch(e){} return; }
      return new Promise((resolve)=>{
        try{ const tx=db.transaction(STORE,'readwrite'); tx.objectStore(STORE).delete(key); tx.oncomplete=()=>resolve(); tx.onerror=()=>resolve(); }
        catch(e){ resolve(); }
      });
    },
    // One-time migration of any legacy localStorage art into IDB
    async migrate(){
      try{
        const keys=[];
        for(let i=0;i<localStorage.length;i++){ const k=localStorage.key(i); if(k&&k.startsWith(ART_STORAGE_PREFIX)) keys.push(k); }
        for(const k of keys){
          const val=localStorage.getItem(k);
          if(val){ await this.set(k.slice(ART_STORAGE_PREFIX.length), val); }
        }
        if(keys.length) console.log('Migrated '+keys.length+' art images to IndexedDB.');
      }catch(e){ console.warn('Art migration skipped:', e); }
    },
    // Request persistent storage (stops iOS/browser eviction)
    async requestPersist(){
      try{
        if(navigator.storage && navigator.storage.persist){
          const already = await navigator.storage.persisted();
          if(!already){ const granted = await navigator.storage.persist(); return granted; }
          return true;
        }
      }catch(e){}
      return false;
    }
  };
})();

const artOverrides = {};
// ── BAKED ART — embedded directly in this file ───────────────
// This section is auto-populated when you tap "Bake into File"
// Art baked here travels with the file and needs no localStorage
(function(){
  const baked = {}; /* BAKED_ART_PLACEHOLDER */
  Object.assign(artOverrides, baked);
})();

function loadArtFromStorage() {
  const li=document.getElementById('art-loading');
  if(li)li.style.display='block';
  // Async load from IndexedDB (with localStorage migration + fallback)
  (async ()=>{
    try{
      await ArtDB.migrate();
      try{ const _bg=await ArtDB.get('bg_arena'); if(_bg){ artOverrides['bg_arena']=(typeof _bg==='string'?_bg:(_bg.value||_bg)); } }catch(_){}              // pull any legacy localStorage art into IDB once
      const all = await ArtDB.all();       // { key: dataUrl }
      let count = 0;
      for(const k in all){ artOverrides[k] = all[k]; count++; }
      if(count>0) console.log('Loaded '+count+' art images from IndexedDB.');
      if(typeof renderAll==='function' && typeof G==='object' && G.p) { try{ renderAll(); }catch(_){} }
      // Art may have loaded after a match started — re-evaluate the rotating battlefield now.
      try{ if(typeof G==='object' && G.p && !G.winner){ pickRotatingBg(); applyBattlefieldArt(); } }catch(_){}
    }catch(e){ console.warn('IDB art load failed, trying localStorage:', e);
      try{ for(let i=0;i<localStorage.length;i++){ const k=localStorage.key(i); if(k&&k.startsWith(ART_STORAGE_PREFIX)) artOverrides[k.slice(ART_STORAGE_PREFIX.length)]=localStorage.getItem(k); } }catch(_){}
    }finally{ if(li)li.style.display='none';
      try{ applyBattlefieldArt(); }catch(_){} }
  })();
}

function saveArtToStorage(key, dataUrl) {
  // Primary: IndexedDB (large, persistent). Fire-and-forget with fallback inside ArtDB.
  try { ArtDB.set(key, dataUrl); ArtDB.requestPersist(); return true; }
  catch(eIDB) { /* fall through to legacy localStorage below */ }
  try {
    const kb = Math.round(dataUrl.length / 1024);
    if(kb > 800) console.warn('Large image: ' + kb + 'KB.');
    localStorage.setItem(ART_STORAGE_PREFIX + key, dataUrl);
    return true;
  } catch(e) {
    // Storage full — try to clear this key first, then retry with compression hint
    try {
      const msg = 'Storage full (' + Math.round(dataUrl.length/1024) + 'KB image). Resize image to under 400KB and try again, or clear art first.';
      try{ log(msg, 'info'); }catch(_){}
      console.warn('localStorage full:', e.message);
    // Try clearing OLDEST entry to make room
    try{
      let oldest=null;
      for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.startsWith(ART_STORAGE_PREFIX)&&(!oldest||k<oldest))oldest=k;}
      if(oldest){localStorage.removeItem(oldest);localStorage.setItem(ART_STORAGE_PREFIX + key, dataUrl);return true;}
    }catch(_){}
    } catch(_) {}
    return false;
  }
}

function removeArtFromStorage(key) {
  try { localStorage.removeItem(ART_STORAGE_PREFIX + key); } catch(e) {}
}

function exportArt() {
  const blob = new Blob([JSON.stringify(artOverrides,null,2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'medalwars_art.json'; a.click();
  URL.revokeObjectURL(url);
  log('Art JSON exported!', 'eq');
}

function bakeArtIntoFile() {
  const count = Object.keys(artOverrides).length;
  if(count === 0){
    log('No art to bake — upload some images first.', 'info');
    return;
  }
  log('Baking ' + count + ' images...', 'eq');
  const MARKER = '/* BAKED_ART_PLACEHOLDER */';
  const artJson = JSON.stringify(artOverrides);
  const newBlock = 'const baked = ' + artJson + '; ' + MARKER;

  function doDownload(src){
    const markerIdx = src.indexOf(MARKER);
    if(markerIdx === -1){
      // Marker not found — try injecting into script tag directly
      log('Rebuilding from page source...','info');
      const scripts = document.querySelectorAll('script');
      let found = false;
      scripts.forEach(s => {
        if(s.textContent && s.textContent.includes('BAKED_ART_PLACEHOLDER')){
          // Build a full HTML string manually
          const html = document.documentElement.outerHTML;
          // Replace in the outer HTML which should have the script text
          const mi2 = html.indexOf(MARKER);
          if(mi2 >= 0){
            const ls2 = html.lastIndexOf('\n', mi2)+1;
            const result = html.slice(0,ls2) + newBlock + html.slice(mi2+MARKER.length);
            const blob2 = new Blob(['<!DOCTYPE html>\n'+result],{type:'text/html'});
            const url2 = URL.createObjectURL(blob2);
            const a2 = document.createElement('a');
            a2.href=url2; a2.download='MedalWars_art.html'; a2.click();
            URL.revokeObjectURL(url2);
            log('✓ Baked '+count+' images! Open MedalWars_art.html','eq');
            banner('ART BAKED ✓','#40d898');
            found=true;
          }
        }
      });
      if(!found) log('Bake failed — try using the Export button to save a JSON backup instead.','info');
      return;
    }
    const lineStart = src.lastIndexOf('\n', markerIdx) + 1;
    const lineEnd = markerIdx + MARKER.length;
    const newSrc = src.slice(0, lineStart) + newBlock + src.slice(lineEnd);
    const blob = new Blob([newSrc], {type:'text/html'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const base = (window.location.pathname.split('/').pop()||'MedalWars.html').replace(/(_art)?\.html$/,'');
    a.download = base + '_art.html';
    a.click();
    URL.revokeObjectURL(url);
    log('✓ Downloaded '+count+' images baked in! Always open the _art.html file.', 'eq');
    banner('ART BAKED ✓', '#40d898');
  }

  // Try XHR first (works when served from a server)
  const req = new XMLHttpRequest();
  req.open('GET', window.location.href, true);
  req.responseType = 'text';
  req.onload = function(){
    if(req.status === 200 || req.status === 0){
      doDownload(req.responseText);
    } else { req.onerror(); }
  };
  req.onerror = function(){
    // Safari local file fallback — try outerHTML path
    try {
      const src = '<!DOCTYPE html>\n' + document.documentElement.outerHTML;
      doDownload(src);
    } catch(e) {
      log('Bake error: ' + e.message + ' — use Export JSON instead.', 'info');
    }
  };
  try { req.send(); } catch(e) { req.onerror(); }
}

// Export art as JSON backup (import on any device)
function exportArtJSON(){
  const count = Object.keys(artOverrides).length;
  if(count === 0){log('No art to export.','info');return;}
  const blob = new Blob([JSON.stringify(artOverrides,null,0)],{type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href=url; a.download='medalwars_art_backup.json'; a.click();
  URL.revokeObjectURL(url);
  log('✓ Exported '+count+' images as JSON backup.','eq');
}

function importArt(e) {
  const file = e.target.files[0]; if(!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const data = JSON.parse(ev.target.result);
      let count = 0;
      Object.entries(data).forEach(([key,url]) => {
        if (typeof url === 'string' && url.startsWith('data:')) {
          artOverrides[key] = url; saveArtToStorage(key,url); count++;
        }
      });
      log('Imported ' + count + ' art image' + (count>1?'s':'') + '!', 'eq');
      renderArtPanel(); renderAll();
    } catch(err) { log('Import failed: invalid file.', 'info'); }
  };
  reader.readAsText(file);
}

// Load saved art once the DOM and all consts are ready
if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',()=>{try{loadArtFromStorage();if(typeof ArtDB!=='undefined')ArtDB.requestPersist();/* boot */}catch(e){console.warn(e);}
    try{ if(typeof MWStore!=='undefined') MWStore.init(); }catch(e){}});
}else{
  try{loadArtFromStorage();}catch(e){console.warn(e);}
  try{ if(typeof MWStore!=='undefined') MWStore.init(); }catch(e){}
}


// Compress image to JPEG at max 600px wide, quality 0.75
// This keeps each image under ~150KB — safe for localStorage
function compressImage(dataUrl, maxPx, quality) {
  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.onload = function() {
        let w = img.width, h = img.height;
        if(w > h) { if(w > maxPx){h=Math.round(h*maxPx/w);w=maxPx;} }
        else { if(h > maxPx){w=Math.round(w*maxPx/h);h=maxPx;} }
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle='#000'; ctx.fillRect(0,0,w,h); // black bg for transparency
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = ()=>resolve(dataUrl);
      img.src = dataUrl;
    } catch(e) { resolve(dataUrl); }
  });
}

function compressAndSave(key, dataUrl) {
  const origKB = Math.round(dataUrl.length/1024);
  // Two-pass compression: aim for under 200KB
  // Pass 1: 480px, quality 0.65
  compressImage(dataUrl, 480, 0.65).then(pass1 => {
    const p1KB = Math.round(pass1.length/1024);
    // Pass 2: if still >250KB, compress harder
    const needsPass2 = p1KB > 250;
    const finalPromise = needsPass2 ? compressImage(pass1, 320, 0.55) : Promise.resolve(pass1);
    finalPromise.then(finalUrl => {
      const finalKB = Math.round(finalUrl.length/1024);
      artOverrides[key] = finalUrl;
      const saved = saveArtToStorage(key, finalUrl);
      const msg = 'Art saved! ' + origKB + 'KB → ' + finalKB + 'KB' + (needsPass2?' (2-pass)':'') + (saved?' ✓':' (session only — try clearing old art)');
      try{ log(msg, 'eq'); }catch(_){}
      // Refresh gallery
      if(document.getElementById('prematch-art') && document.getElementById('prematch-art').style.display!=='none'){
        renderPmGrid(_pmTab||'bots'); updatePmStorageInfo();
      } else {
        try{ renderArtPanel(); updateStorageInfo(); }catch(_){}
      }
      if(typeof renderAll==='function' && typeof G!=='undefined' && G.p) renderAll();
      _pendingArtKey = null;
    });
  });
}

let _pendingArtKey = null;

function renderCardArt(card, w, h) {
  const key = 'card_' + card.id;
  if (artOverrides[key]) {
    return '<img class="hart" src="' + artOverrides[key] + '" width="' + w + '" height="' + h + '" onerror="this.style.display=\'none\'" style="width:' + w + 'px;height:' + h + 'px;object-fit:cover;display:block;flex-shrink:0">';
  }
  return gA(card.art || 'act_art', w, h);
}

function renderBotArt(bot, w, h) {
  let key = 'bot_' + bot.key + (bot.changed ? '_mc' : '');
  // Masterbeetle fusion art (Titan combining archetype)
  if(bot._masterMode) key='bot_masterbeetle_master';
  else if(bot._masterbeetle) key='bot_masterbeetle';
  if (bot._opp && artOverrides['opp_' + key]) key = 'opp_' + key;
  if (artOverrides[key]) {
    return '<img src="' + artOverrides[key] + '" width="' + w + '" height="' + h + '" onerror="this.style.display=\'none\'" style="width:' + w + 'px;height:' + h + 'px;object-fit:cover;object-position:center top;display:block;border-bottom:1px solid var(--border)">';
  }
  return gA(bot.changed ? bot.mcart : bot.art, w, h);
}

function openArtManager(){ openPreMatchArt(); }
function closeArtPanel(){ const p=document.getElementById('art-panel');if(p)p.classList.remove('open'); }

function clearAllArt() {
  openM('Clear All Art', 'Remove all custom art and revert to SVG defaults? This cannot be undone.', [
    {l:'Clear All', cls:'mb bad', cb:()=>{
      Object.keys(artOverrides).forEach(k=>{ delete artOverrides[k]; removeArtFromStorage(k); });
      log('All custom art cleared.','info'); closeM(); renderArtPanel(); renderAll();
    }},
    {l:'Cancel', cls:'mb', cb:closeM}
  ]);
}

function updateStorageInfo() {
  const el = document.getElementById('art-storage-info');
  if (!el) return;
  const count = Object.keys(artOverrides).length;
  let totalKB = 0;
  try {
    Object.values(artOverrides).forEach(v => totalKB += v.length/1024);
  } catch(e) {}
  el.innerHTML = count > 0
    ? count + ' image' + (count>1?'s':'') + ' saved · ~' + Math.round(totalKB) + 'KB used · <span style="color:var(--green)">✓ Persistent</span>'
    : 'No custom art saved yet. Upload images below to get started.';
}

function renderArtPanel() {
  // Bot slots
  const botsEl = document.getElementById('ap-bots');
  if(!botsEl)return;
  botsEl.innerHTML = '';
  const allBots = [...G.p.bots, ...G.c.bots];
  const seenKeys = new Set();
  allBots.forEach(bot => {
    if (seenKeys.has(bot.key)) return;
    seenKeys.add(bot.key);
    botsEl.appendChild(makeArtSlot('bot_' + bot.key, bot.name, bot.color, 'Bot', gA(bot.art, 36, 51)));
    botsEl.appendChild(makeArtSlot('bot_' + bot.key + '_mc', bot.name + ' (Changed)', '#f04880', 'Medachange', gA(bot.mcart, 36, 48)));
  });
  // Also add every bot in the full registry, even if not part of the bots currently in this match —
  // so a deck's art can be uploaded any time, not only while actively playing that deck.
  Object.keys(BOTS).forEach(key => {
    if (seenKeys.has(key)) return;
    seenKeys.add(key);
    const b = BOTS[key];
    botsEl.appendChild(makeArtSlot('bot_' + key, b.name, b.color, 'Bot', gA(b.art, 36, 51)));
    botsEl.appendChild(makeArtSlot('bot_' + key + '_mc', b.name + ' (Changed)', '#f04880', 'Medachange', gA(b.mcart, 36, 48)));
  });

  // Card slots — unique card types
  const cardsEl = document.getElementById('ap-cards');
  if(!cardsEl)return;
  cardsEl.innerHTML = '';
  const seen = new Set();
  [...G.p.hand, ...G.p.deck, ...G.c.hand, ...G.c.deck].forEach(card => {
    if (seen.has(card.id)) return;
    seen.add(card.id);
    cardsEl.appendChild(makeArtSlot('card_' + card.id, card.name, card.color, card.type, gA(card.art || 'act_art', 36, 50)));
  });
  // Also add defs not in decks
  Object.keys(CDEFS).forEach(id => {
    if (seen.has(id)) return;
    seen.add(id);
    const c = CDEFS[id];
    cardsEl.appendChild(makeArtSlot('card_' + id, c.name, c.color, c.type, gA(c.art || 'act_art', 36, 48)));
  });
}

function makeArtSlot(key, name, color, type, svgHtml) {
  const div = document.createElement('div');
  div.className = 'art-slot';
  const hasCustom = !!artOverrides[key];
  const thumbHtml = hasCustom
    ? `<img class="art-slot-thumb" src="${artOverrides[key]}">`
    : `<div class="art-slot-thumb svg-thumb">${svgHtml}</div>`;
  div.innerHTML = `
    ${thumbHtml}
    <div class="art-slot-info">
      <div class="art-slot-name" style="color:${color}">${name}</div>
      <div class="art-slot-type">${type}</div>
    </div>
    <div style="display:flex;flex-direction:column;gap:3px">
      <button class="art-upload-btn" onclick="triggerUpload('${key}')">Upload</button>
      ${hasCustom ? `<button class="art-clear-btn" onclick="clearArt('${key}')">Clear</button>` : ''}
    </div>`;
  return div;
}

function triggerUpload(key) {
  _pendingArtKey = key;
  const fi = document.getElementById('file-input');
  fi.value = '';
  fi.click();
}

function clearArt(key) {
  delete artOverrides[key];
  removeArtFromStorage(key);
  renderArtPanel();
  renderAll();
  log('Art cleared: ' + key.replace('card_','').replace('bot_',''), 'info');
}

document.addEventListener('DOMContentLoaded', () => {
  (document.getElementById('bulk-art-input')||{addEventListener:()=>{}}).addEventListener('change', function(e){ _handleBulkArt(e.target.files); });
  (document.getElementById('file-input')||{addEventListener:()=>{}}).addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file || !_pendingArtKey) return;
    // Accept any file — iOS saves images without extension so MIME check would fail
    const reader = new FileReader();
    reader.onload = ev => {
      const dataUrl = ev.target.result;
      // Validate it looks like image data (handles files with no extension)
      if (!dataUrl || (!dataUrl.startsWith('data:image') && !dataUrl.startsWith('data:application'))) {
        log('Could not read image — try a JPG or PNG file.', 'info'); return;
      }
      // Force image MIME type if missing (iOS UUID files come as octet-stream)
      const safeUrl = dataUrl.startsWith('data:image') ? dataUrl
        : dataUrl.replace(/^data:[^;]+/, 'data:image/jpeg');
      // Compress before saving to stay within localStorage limits
      compressAndSave(_pendingArtKey, safeUrl);
      // Refresh whichever panel is open
      if(document.getElementById('prematch-art') && document.getElementById('prematch-art').style.display!=='none'){
        renderPmGrid(_pmTab); updatePmStorageInfo();
      } else {
        renderArtPanel(); updateStorageInfo();
      }
      if(typeof renderAll === 'function' && typeof G !== 'undefined' && G.p) renderAll();
      _pendingArtKey = null;
    };
    reader.readAsDataURL(file);
  });
});

// Also allow clicking bot art on battlefield to quick-upload
function quickUploadBotArt(botKey) {
  _pendingArtKey = 'bot_' + botKey;
  const fi = document.getElementById('file-input');
  fi.value = '';
  fi.click();
}


