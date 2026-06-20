// MWStore — client side of the cosmetic store.
// Talks to the server's /store/* routes. Server-authoritative:
// owned cosmetics come from the server, never trusted from localStorage.
// localStorage only caches a player token + a copy of entitlements for
// offline rendering; the server copy always wins on next load.
// ═══════════════════════════════════════════════════════════
const MWStore = (function(){
  let _catalog = null;
  let _owned = [];      // owned cosmetic item keys (from server)
  let _packs = [];      // owned pack ids
  let _preview = false; // server in preview (no real payments)
  let _loaded = false;

  function base(){ return (typeof ArtCloud!=='undefined' && ArtCloud.base) ? ArtCloud.base() : null; }

  // Player token: prefer the beta token (so purchases follow the same identity),
  // otherwise use/issue a dedicated play-token stored locally.
  function token(){
    try{
      const beta = localStorage.getItem('mw_beta_token');
      if(beta) return beta;
      return localStorage.getItem('mw_store_token') || null;
    }catch(e){ return null; }
  }
  async function ensureToken(){
    let t = token();
    if(t) return t;
    const b = base();
    if(!b) return null;
    try{
      const r = await fetch(b+'/store/token', {method:'POST'});
      const j = await r.json();
      if(j && j.token){ try{ localStorage.setItem('mw_store_token', j.token); }catch(e){} return j.token; }
    }catch(e){}
    return null;
  }

  async function loadCatalog(){
    const b = base(); if(!b) return null;
    try{
      const r = await fetch(b+'/store/catalog');
      const j = await r.json();
      if(j && j.ok){ _catalog = j.catalog; _preview = !!j.preview; return _catalog; }
    }catch(e){}
    return null;
  }

  async function refreshEntitlements(){
    const b = base(); const t = await ensureToken();
    if(!b || !t) return;
    try{
      const r = await fetch(b+'/store/entitlements', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token:t})});
      const j = await r.json();
      if(j && j.ok){
        _owned = j.owned||[]; _packs = j.packs||[]; _loaded = true;
        try{ localStorage.setItem('mw_store_owned', JSON.stringify({owned:_owned,packs:_packs})); }catch(e){}
      }
    }catch(e){
      // Offline fallback: use cached copy (server still wins next time online).
      try{ const c=JSON.parse(localStorage.getItem('mw_store_owned')||'null'); if(c){ _owned=c.owned||[]; _packs=c.packs||[]; } }catch(e){}
    }
  }

  // Server-authoritative ownership check for a cosmetic key.
  function owns(itemKey){ return _owned.indexOf(itemKey) >= 0; }
  function ownsPack(packId){ return _packs.indexOf(packId) >= 0; }
  function owned(){ return _owned.slice(); }
  function catalog(){ return _catalog; }
  function isPreview(){ return _preview; }

  // Begin a purchase. In preview mode the server grants instantly; in live mode
  // we redirect to Stripe Checkout and confirm on return.
  async function buy(packId){
    const b = base(); const t = await ensureToken();
    if(!b || !t) return {ok:false,error:'no_server'};
    try{
      const r = await fetch(b+'/store/checkout',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token:t,packId})});
      const j = await r.json();
      if(!j.ok) return j;
      if(j.alreadyOwned){ await refreshEntitlements(); return {ok:true,alreadyOwned:true}; }
      if(j.preview){
        // Preview mode: already granted server-side. Just refresh.
        await refreshEntitlements();
        return {ok:true,preview:true};
      }
      // Live Stripe: go to the hosted checkout page.
      if(j.url){ window.location.href = j.url; return {ok:true,redirecting:true}; }
      return {ok:false,error:'no_url'};
    }catch(e){ return {ok:false,error:'network'}; }
  }

  // Called on page load: if we returned from Stripe with a session id, confirm it.
  async function handleReturn(){
    try{
      const p = new URLSearchParams(location.search);
      const sid = p.get('sid');
      const status = p.get('store');
      if(status==='success' && sid){
        const b=base(); const t=await ensureToken();
        if(b && t){ try{ await fetch(b+'/store/confirm',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token:t,sessionId:sid})}); }catch(e){} }
      }
      if(status){
        // Clean the URL so a refresh doesn't re-trigger.
        try{ history.replaceState({}, '', location.pathname); }catch(e){}
      }
    }catch(e){}
  }

  async function init(){
    await loadCatalog();
    await refreshEntitlements();
    await handleReturn();
    if(location.search.indexOf('store=')>=0){ await refreshEntitlements(); }
  }

  return { init, loadCatalog, refreshEntitlements, owns, ownsPack, owned, catalog, isPreview, buy, handleReturn, token, ensureToken };
})();


// ═══════════════════════════════════════════════════════════
// STORE SCREEN UI
// ═══════════════════════════════════════════════════════════
function openStore(){
  // Build/refresh then render. Uses the modal system (openM).
  openM('ACCESSORIES', '<div style="text-align:center;padding:20px;color:var(--text3)">Loading accessories…</div>', [{l:'Close',cls:'mb',cb:()=>closeM()}]);
  (async()=>{
    try{
      if(!MWStore.catalog()) await MWStore.loadCatalog();
      await MWStore.refreshEntitlements();
    }catch(e){}
    renderStore();
  })();
}

function renderStore(){
  const cat = MWStore.catalog();
  if(!cat){
    openM('ACCESSORIES',
      '<div style="text-align:center;padding:16px;color:var(--text3);line-height:1.5">Accessories are unavailable right now.<br>They need a server connection.</div>',
      [{l:'Close',cls:'mb',cb:()=>closeM()}]);
    return;
  }
  const typeIcon={battlefield:'\ud83c\udfdf\ufe0f',cardart:'\ud83c\udfa8',music:'\ud83c\udfb5',bundle:'\u2728'};
  let html='';
  if(MWStore.isPreview()){
    html+='<div style="background:rgba(90,208,224,.12);border:1px solid rgba(90,208,224,.4);border-radius:8px;padding:8px 10px;margin-bottom:10px;font-size:10px;color:#5ad0e0;line-height:1.4">\ud83e\uddea PREVIEW MODE — purchases are simulated (no real payment). Wire Stripe keys to go live.</div>';
  }
  html+='<div style="display:flex;flex-direction:column;gap:10px;max-height:54vh;overflow-y:auto;padding:2px">';
  cat.forEach(p=>{
    const ownedPack = MWStore.ownsPack(p.id);
    html+='<div style="border:1px solid '+(ownedPack?'rgba(90,224,140,.5)':'var(--border)')+';border-radius:12px;padding:10px 12px;background:#0c1018">'
      +'<div style="display:flex;align-items:center;gap:8px">'
        +'<div style="font-size:20px">'+(typeIcon[p.type]||'\ud83d\udecd\ufe0f')+'</div>'
        +'<div style="flex:1;min-width:0">'
          +'<div style="font-family:\'Orbitron\',monospace;font-size:12px;font-weight:800;color:var(--gold)">'+p.name+'</div>'
          +'<div style="font-size:10px;color:var(--text3);line-height:1.3;margin-top:1px">'+p.blurb+'</div>'
        +'</div>'
        +'<div style="text-align:right">'
          + (ownedPack
              ? '<div style="font-size:11px;font-weight:800;color:#5ae08c">\u2713 UNLOCKED</div>'
              : '<button class="mb" style="padding:7px 12px;font-size:11px;white-space:nowrap" onclick="storeBuy(\''+p.id+'\')">Unlock</button>')
        +'</div>'
      +'</div>'
    +'</div>';
  });
  html+='</div>';
  openM('ACCESSORIES', html, [{l:'Close',cls:'mb',cb:()=>closeM()}]);
}

async function storeBuy(packId){
  // Disable double-taps by re-rendering a brief state.
  const r = await MWStore.buy(packId);
  if(r.redirecting) return; // leaving to Stripe
  if(r.ok){
    if(r.alreadyOwned){ banner&&banner('ALREADY UNLOCKED','#5ad0e0'); }
    else { banner&&banner('UNLOCKED!','#5ae08c'); try{ SFX&&SFX.victory&&SFX.victory(); }catch(e){} }
    // Apply any newly-unlocked cosmetics immediately, then re-render the store.
    try{ applyOwnedCosmetics(); }catch(e){}
    renderStore();
  } else {
    const msg = r.error==='no_server' ? 'Store needs a server connection.' : 'Purchase could not be completed.';
    openM('ACCESSORIES', '<div style="padding:14px;text-align:center;color:#ff8080;line-height:1.5">'+msg+'</div>', [{l:'Back',cls:'mb',cb:()=>renderStore()},{l:'Close',cls:'mb',cb:()=>closeM()}]);
  }
}

// Make owned cosmetics usable in-game. Cosmetic keys map to art/music overrides
// only if the player owns them (server-authoritative via MWStore.owns()).
// This keeps purchases from being faked by editing localStorage.
function applyOwnedCosmetics(){
  try{
    if(typeof artOverrides!=='object') return;
    // Example mapping: a cosmetic battlefield key can fill an arena slot if owned.
    // (Art data for cosmetics is delivered the same way as other art — via uploads/R2;
    //  here we just gate availability. Unowned cosmetics are never applied.)
    MWStore.owned().forEach(key=>{
      // Cosmetics are only honored when owned; nothing to force here unless art is present.
      // Hook point for future: if(key==='cos_bg_neon_1' && cosmeticArt[key]) artOverrides['bg_arena_1']=cosmeticArt[key];
    });
  }catch(e){}
}

// Map of artKey -> R2 URL for art we've uploaded (mirrors artOverrides).
// Persisted in IndexedDB alongside the raw images so we can share URLs online.
const artCloudUrls = {};

// When saving art: keep the local copy (instant display) AND upload to R2 in the
// background so it can be shared with opponents online.

