// ═══ MODAL ═══

// ── In-game menu (☰): decklist viewer, surrender, music, rules ──
const DECK_GUIDE = {"blaze": {"name": "BLAZE CHAIN", "color": "#f06424", "mf": "Ikki", "plan": "Burn aggro. Ignite enemies early, then Metabee\u2019s passive adds damage to every burning target. Chain techniques for burst and close with Medachange.", "combo": "Flame Whip (burn ALL) \u2192 Scorch a burning target for 8 free \u2192 Metabee passive fires on each burning bot."}, "titan": {"name": "TITAN GUARD", "color": "#8090a0", "mf": "Henry", "plan": "Defensive bruiser. Soak hits, drain enemy Charge with Iron Strike, and grind value as Sumilidon/Machairodus scale in Last Stand.", "combo": "Iron Strike to strip 2 Charge \u2192 Guard Break their wall \u2192 Machairodus Last Stand bonus swings the race."}, "royal": {"name": "ROYAL COURT", "color": "#f0b020", "mf": "Tai", "plan": "Charge-control midrange. Build Charge across the team, protect Omegaknight\u2019s Vanguard, then convert with a big Medaforce turn.", "combo": "Royal Decree (draw 2, +1 Charge all) \u2192 Medaforce with Medal Lens bonus \u2192 WarGreymon Digi-Core finish."}, "shadow": {"name": "SHADOW BLADE", "color": "#9050d0", "mf": "Karin", "plan": "Tempo combo. Nin-Ninja chains multiple techniques per turn, Foxuno heals to outlast, Gokudo punishes with combo triggers.", "combo": "Nin-Ninja plays 2\u20133 techniques in one turn \u2192 Karin 3-card trigger draws \u2192 Gokudo combo count detonates."}, "throne": {"name": "IRON THRONE", "color": "#30b050", "mf": "Seaslug", "plan": "Solo emperor control. Robo Emperor tanks alone, drawing extra cards as it\u2019s wounded, snowballing Charge into unblockable Medaforce.", "combo": "Take damage \u2192 Seaslug wound-draws fuel the hand \u2192 Emperor Decree (+3 cards) \u2192 unblockable MF for lethal."},"senbei":{"name":"SENBEI","color":"#c83232","mf":"Master Sen","plan":"Stance-control finisher. Hold the three Stances (Bound, Exposed, Execution) to bank Resonance each turn. At Zanshin Threshold (3+ Resonance, all four bladesmen alive), fire Zanshin: assign three Verdicts, survive the Interval, and the Cut lands on all three targets at once.","combo":"Hold all three Stances \u2192 Resonance climbs \u2192 Zanshin reads the Verdicts \u2192 the Interval punishes every enemy reaction \u2192 the Cut falls: Bound, Exposed, Execution simultaneously."},
  "forge":{"name":"FORGE BARONS","color":"#e0a020","mf":"Kasumi Asano","plan":"Equipment engine. Bolt gear onto Grand Beetle (holds 3), trigger start/end-of-turn effects, and cross Forge Counter thresholds (3+ team ATK, 5+ unblockable) to build an unstoppable juggernaut.","combo":"Stack 5+ equipment \u2192 Forge Core makes attacks unblockable \u2192 Overforge doubles ATK for a one-shot finish."}};


// ── Per-deck records + stats profile ──
function _recordDeckResult(deckKey, won){
  try{
    const raw=localStorage.getItem('mw_deckstats')||'{}';
    const stats=JSON.parse(raw);
    if(!stats[deckKey]) stats[deckKey]={w:0,l:0};
    if(won) stats[deckKey].w++; else stats[deckKey].l++;
    localStorage.setItem('mw_deckstats', JSON.stringify(stats));
    // longest streak
    const best=parseInt(localStorage.getItem('mw_beststreak')||'0');
    if(streakCount>best) localStorage.setItem('mw_beststreak', String(streakCount));
  }catch(e){}
  // ── Detailed match log (most recent 100 matches) ──
  try{
    const log=JSON.parse(localStorage.getItem('mw_matchlog')||'[]');
    let oppDeck='CPU';
    try{ if(typeof G==='object' && G.c && G.c.deckName) oppDeck=G.c.deckName; else if(typeof _cpuDeckName==='string') oppDeck=_cpuDeckName; }catch(e){}
    const entry={
      t: Date.now(),
      deck: deckKey,
      opp: oppDeck,
      won: !!won,
      turns: (typeof turn==='number')?turn:0,
      diff: (typeof cpuDiff==='string')?cpuDiff:'?',
      mode: (typeof G_online!=='undefined'&&G_online)?'online':((typeof _practiceMode!=='undefined'&&_practiceMode)?'practice':'cpu')
    };
    log.unshift(entry);
    if(log.length>100) log.length=100;
    localStorage.setItem('mw_matchlog', JSON.stringify(log));
  }catch(e){}
}

// View the detailed match log (most recent matches).
function openMatchLog(){
  let log=[];
  try{ log=JSON.parse(localStorage.getItem('mw_matchlog')||'[]'); }catch(e){}
  const names={blaze:'Blaze',titan:'Combining archetype \u2014 survive early, then fuse into the legendary Masterbeetle (X Fusion Change), crowned by Rokusho (Master Medachange) for an AoE juggernaut.',royal:'Evolution engine — evolve all three Digimon repeatedly; every Medachange permanently powers up the whole Court, then finish with a scaling DigiStrike.',shadow:'Shadow',throne:'Throne',forge:'Forge',cross:'Cross'};
  const cols={blaze:'#f06424',titan:'#8090a0',royal:'#f0b020',shadow:'#9050d0',throne:'#30b050',forge:'#e0a020',cross:'#d8dde8'};
  let html='<div style="text-align:left">';
  if(!log.length){
    html+='<div style="text-align:center;color:var(--text3);font-size:12px;padding:20px 0">No matches recorded yet.<br>Play a Robattle and your results will appear here.</div>';
  } else {
    const wins=log.filter(e=>e.won).length;
    html+='<div style="font-size:10px;color:var(--text3);text-align:center;margin-bottom:8px">Last '+log.length+' matches \u00b7 '+wins+'W / '+(log.length-wins)+'L</div>';
    html+='<div style="max-height:300px;overflow-y:auto">';
    log.forEach(e=>{
      const dk=names[e.deck]||e.deck;
      const op=names[e.opp]||e.opp||'CPU';
      const col=cols[e.deck]||'#fff';
      const d=new Date(e.t);
      const date=(d.getMonth()+1)+'/'+d.getDate();
      const resColor=e.won?'#40d088':'#ff6060';
      const resText=e.won?'WIN':'LOSS';
      const modeTag=e.mode==='online'?' \u00b7 ranked':(e.mode==='practice'?' \u00b7 practice':'');
      html+='<div style="display:flex;align-items:center;justify-content:space-between;gap:6px;padding:6px 4px;border-bottom:1px solid rgba(255,255,255,.05);font-size:11px">'+
        '<span style="width:38px;font-weight:800;color:'+resColor+'">'+resText+'</span>'+
        '<span style="flex:1;min-width:0;color:var(--text2)"><b style="color:'+col+'">'+dk+'</b> vs '+op+'</span>'+
        '<span style="color:var(--text3);font-size:9px;text-align:right;flex-shrink:0">T'+e.turns+' \u00b7 '+e.diff+modeTag+'<br>'+date+'</span>'+
      '</div>';
    });
    html+='</div>';
  }
  html+='</div>';
  const buttons=[{l:'Close', cls:'mb ok', cb:()=>closeM()}];
  if(log.length){ buttons.unshift({l:'Clear Log', cls:'mb', style:'color:var(--text3);font-size:10px', cb:()=>{ if(confirm('Clear the match log?')){ localStorage.removeItem('mw_matchlog'); closeM(); } }}); }
  openM('\ud83d\udccb Match Log', html, buttons);
}
function openStatsProfile(){
  const names={blaze:'Blaze Chain',titan:'Titan Guard',royal:'Royal Court',shadow:'Shadow Blade',throne:'Iron Throne',forge:'Forge Barons',cross:'Cross Messiah'};
  const cols={blaze:'#f06424',titan:'#8090a0',royal:'#f0b020',shadow:'#9050d0',throne:'#30b050'};
  let stats={}; try{ stats=JSON.parse(localStorage.getItem('mw_deckstats')||'{}'); }catch(e){}
  const best=parseInt(localStorage.getItem('mw_beststreak')||'0');
  const totalW=winCount, totalL=lossCount, totalG=totalW+totalL;
  const wr=totalG>0?Math.round(totalW/totalG*100):0;
  let html='<div style="text-align:center;margin-bottom:10px">';
  html+='<div style="font-family:Orbitron,monospace;font-size:24px;color:var(--gold)">'+totalW+'\u2013'+totalL+'</div>';
  html+='<div style="font-size:10px;color:var(--text2)">'+wr+'% win rate \u00b7 '+totalG+' games</div>';
  html+='<div style="font-size:10px;color:var(--text2);margin-top:3px">Current streak: <b style="color:var(--gold)">'+streakCount+'</b> \u00b7 Best: <b style="color:#40d898">'+best+'</b></div>';
  html+='</div><div style="border-top:1px solid rgba(255,255,255,.08);padding-top:8px">';
  ['blaze','titan','royal','shadow','throne'].forEach(k=>{
    const s=stats[k]||{w:0,l:0}; const g=s.w+s.l; const r=g>0?Math.round(s.w/g*100):0;
    const barW=g>0?r:0;
    html+='<div style="margin-bottom:7px">';
    html+='<div style="display:flex;justify-content:space-between;font-size:10px;margin-bottom:2px"><span style="color:'+cols[k]+';font-weight:700">'+names[k]+'</span><span style="color:var(--text2)">'+s.w+'\u2013'+s.l+(g>0?' ('+r+'%)':'')+'</span></div>';
    html+='<div style="height:5px;background:rgba(255,255,255,.06);border-radius:3px;overflow:hidden"><div style="height:100%;width:'+barW+'%;background:'+cols[k]+'"></div></div>';
    html+='</div>';
  });
  html+='</div>';
  openM('Your Record', html, [{l:'Reset Stats', cls:'mb', style:'color:var(--text3);font-size:10px', cb:()=>{ if(confirm('Reset all stats?')){ ['mw_wins','mw_losses','mw_streak','mw_beststreak','mw_deckstats'].forEach(k=>localStorage.removeItem(k)); winCount=0;lossCount=0;streakCount=0; closeM(); } }},{l:'\ud83d\udccb Match Log', cls:'mb', cb:()=>{ closeM(); openMatchLog(); }},{l:'Close', cls:'mb ok', cb:()=>closeM()}]);
}

function openGameMenu(){
  const inMatch = (typeof G==='object'&&G&&G.p&&!G.winner);
  const btns=[
    {l:'\ud83d\udcd6 Decklists', cls:'mb', cb:()=>{ closeM(); openDeckViewer(); }},
    {l:'\ud83c\udfc6 Your Record', cls:'mb', cb:()=>{ closeM(); openStatsProfile(); }},
    {l:'\ud83d\udcdc Battle Log', cls:'mb', cb:()=>{ closeM(); toggleLog(); }},
    {l:(_musicOn?'\ud83d\udd07 Music: ON':'\ud83c\udfb5 Music: OFF'), cls:'mb', cb:()=>{ toggleMusic(); closeM(); openGameMenu(); }},
    {l:'\u2753 How to Play', cls:'mb', cb:()=>{ closeM(); showRules(); }},
  ];
  if(inMatch){
    btns.push({l:'\ud83c\udff3\ufe0f Surrender', cls:'mb', style:'color:var(--red);border-color:rgba(240,72,72,.4)', cb:()=>{ closeM(); confirmSurrender(); }});
  } else {
    btns.push({l:'\u21a9 Main Menu', cls:'mb', cb:()=>{ closeM(); goToMainMenu(); }});
  }
  btns.push({l:'Close', cls:'mb ok', cb:()=>closeM()});
  openM('Menu','<div style="font-size:11px;color:var(--text2);text-align:center;padding:4px 0">Medal Wars Beta</div>', btns);
}

function confirmSurrender(){
  openM('Surrender?',
    '<div style="text-align:center;padding:6px 0">Concede this match? This counts as a loss.</div>',
    [
      {l:'Yes, Surrender', cls:'mb', style:'color:var(--red);border-color:rgba(240,72,72,.4)', cb:()=>{
        closeM();
        if(G_online){ try{ MWNet.gameOver(1-G_mySeat); }catch(e){} }
        G.winner='c'; G.reason='You surrendered.';
        showEnd();
      }},
      {l:'Keep Fighting', cls:'mb ok', cb:()=>closeM()}
    ]);
}

function openDeckViewer(){
  const order=['blaze','titan','royal','shadow','throne'];
  let html='<div style="max-height:60vh;overflow-y:auto">';
  order.forEach(k=>{
    const g=DECK_GUIDE[k]; if(!g)return;
    const d=DECKS[k]; if(!d)return;
    // tally cards by name from the deck definition
    const counts={};
    (d.deck||[]).forEach(c=>{ counts[c.name]=(counts[c.name]||0)+1; });
    const cardLines=Object.keys(counts).sort().map(n=>'<span style="color:var(--text2)">'+counts[n]+'\u00d7</span> '+n).join(' \u00b7 ');
    const bots=(d.bots||[]).map(b=>b.charAt(0).toUpperCase()+b.slice(1)).join(', ');
    html+='<div style="border:1px solid '+g.color+'55;border-radius:10px;padding:10px;margin-bottom:10px;background:rgba(0,0,0,.25)">'+
      '<div style="font-family:Orbitron,monospace;font-weight:800;color:'+g.color+';font-size:13px">'+g.name+'</div>'+
      '<div style="font-size:9px;color:var(--text3);margin:2px 0 6px">Medafighter: '+g.mf+' \u00b7 Bots: '+bots+'</div>'+
      '<div style="font-size:10px;color:var(--text);margin-bottom:5px"><b style="color:var(--gold)">Plan:</b> '+g.plan+'</div>'+
      '<div style="font-size:10px;color:var(--text);margin-bottom:6px"><b style="color:#60d8a0">Combo:</b> '+g.combo+'</div>'+
      '<div style="font-size:9px;color:var(--text2);line-height:1.5;border-top:1px solid rgba(255,255,255,.08);padding-top:5px">'+cardLines+'</div>'+
    '</div>';
  });
  html+='</div>';
  openM('Decklists', html, [{l:'Back', cls:'mb', cb:()=>{ closeM(); openGameMenu(); }},{l:'Close', cls:'mb ok', cb:()=>closeM()}]);
}

// ── Background music (hosted MP3, streamed; toggle persists) ──
let _musicOn=false, _musicEl=null;
const MUSIC_URL_KEY='mw_music_url';
function _getMusicUrl(){ try{ return localStorage.getItem(MUSIC_URL_KEY)||window.MW_MUSIC_URL||''; }catch(e){ return window.MW_MUSIC_URL||''; } }
function toggleMusic(){
  _musicOn=!_musicOn;
  try{ localStorage.setItem('mw_music_on', _musicOn?'1':'0'); }catch(e){}
  if(_musicOn){
    // Turn on the RIGHT track for the current screen (never both).
    const inMatch = (typeof G==='object' && G && G.p && !G.winner && document.getElementById('title') && document.getElementById('title').style.display==='none');
    if(inMatch){ try{ startBattleMusic(); }catch(e){} }
    else { try{ startTitleMusic(); }catch(e){} }
  } else {
    // Stop everything.
    try{ stopBattleMusic(); }catch(e){}
    try{ if(_titleMusicEl){ _titleMusicEl.pause(); _titleMusicEl.currentTime=0; } }catch(e){}
    try{ stopMusic(); }catch(e){}
  }
}
function startMusic(){
  if(!_musicEl){
    const embedded=document.getElementById('mw-bgm');
    if(embedded){ _musicEl=embedded; }
    else { const url=_getMusicUrl(); if(!url){ _musicOn=false; return; } _musicEl=new Audio(url); }
    _musicEl.loop=true; _musicEl.volume=0.18;
  }
  // preload="none" means the source isn't buffered yet — trigger a load, then play
  try{ _musicEl.load(); }catch(e){}
  const p=_musicEl.play();
  if(p&&p.catch){ p.catch(err=>{
    // Autoplay can be blocked until a user gesture; retry once on next tap
    log('Music needs a tap to start — tap anywhere.','info');
    const resume=()=>{ _musicEl.play().catch(()=>{}); document.removeEventListener('touchend',resume); document.removeEventListener('click',resume); };
    document.addEventListener('touchend',resume,{once:true});
    document.addEventListener('click',resume,{once:true});
  }); }
}
function stopMusic(){ if(_musicEl){ try{_musicEl.pause();}catch(e){} } }
// restore preference
/* legacy auto-music removed — title/battle music handled by startTitleMusic/startBattleMusic to prevent double playback */ try{ if(localStorage.getItem('mw_music_on')==='1'){ _musicOn=true; } }catch(e){}

function openM(title,body,btns){
  (function(){const e=document.getElementById('mtitle');if(e)e.textContent=title;})();
  (function(){const e=document.getElementById('mbody');if(e)e.innerHTML=body;})();
  const bc=document.getElementById('mbtns');if(!bc)return;bc.innerHTML='';
  btns.forEach(b=>{const el=document.createElement('button');el.className=b.cls;el.innerHTML=b.l;el.onclick=b.cb;if(b.style)el.setAttribute('style',b.style);bc.appendChild(el);});
  (function(){const e=document.getElementById('modal');if(e)e.classList.add('open');})();
}
function closeM(){document.getElementById('modal').classList.remove('open');}
function toggleLog(){document.getElementById('logp').classList.toggle('open');renderLog();}

// ═══ END ═══

let _pendingRankedNudge=false;
function maybeShowRankedNudge(){
  if(!_pendingRankedNudge) return false;
  _pendingRankedNudge=false;
  try{ localStorage.setItem('mw_ranked_nudged','1'); }catch(e){}
  openM('Ready for Real Opponents?',
    '<div style="text-align:center">'+
      '<div style="font-size:30px;margin-bottom:6px">\ud83c\udfc6</div>'+
      '<div style="font-size:13px;color:var(--text);line-height:1.5">You\'re on a roll! You\'ve won '+winCount+' battles.<br><br>Think you can climb the ranks against real players? Ranked mode pairs you with opponents near your skill and tracks your ELO.</div>'+
    '</div>',
    [{l:'\ud83c\udfc6 Try Ranked',cls:'mb ok',cb:()=>{ closeM(); if(typeof openRanked==='function')openRanked(); }},
     {l:'Maybe Later',cls:'mb',cb:()=>closeM()}]);
  return true;
}

function showEnd(){
  try{ _rotatingBgSlot=0; _rotatingBgUrl=''; }catch(e){}  // clear stage so next match re-selects
  try{ if(G_online && MWNet.clearSession) MWNet.clearSession(); }catch(e){}
  setTimeout(()=>{
    const win=G.winner==='p';
    // Stop battle music when the match ends so it doesn't bleed into the end screen / rematch
    try{ if(_musicEl){ fadeAudio(_musicEl, _musicEl.volume||0.18, 0, 600, ()=>{ try{ stopBattleMusic(); }catch(e){} }); } }catch(e){}
    setTimeout(()=>win ? SFX.victory() : SFX.defeat(), 400);
    if(win){winCount++;streakCount++;localStorage.setItem('mw_wins',winCount);localStorage.setItem('mw_streak',streakCount);
      // Onboarding nudge: after 3 wins, invite the player to try ranked (once).
      if(!G_online && !_practiceMode && winCount>=3 && localStorage.getItem('mw_ranked_nudged')!=='1'){ _pendingRankedNudge=true; }
    }
    else{lossCount++;streakCount=0;localStorage.setItem('mw_losses',lossCount);localStorage.setItem('mw_streak','0');}
    _recordDeckResult(deck,win);
    document.getElementById('ettl').textContent=win?'VICTORY':'DEFEAT';
    document.getElementById('ettl').style.color=win?'#f0b820':'#f04040';
    document.getElementById('esub').textContent=G.reason;

    // Stats row
    const totalAtks=logs.filter(e=>e.t==='atk').length;
    const stats=[
      {v:turn,l:'Turns'},
      {v:alive(G.p).length+'/3',l:'Bots alive'},
      {v:totalAtks,l:'Attacks'},
      {v:G.maxDmg||0,l:'Biggest hit'},
      {v:G.mfFired||0,l:'Medaforces'},
      {v:G.fusionCount||0,l:'Fusions'},
    ];
    document.getElementById('estats').innerHTML=
      stats.map(s=>`<div class="estat"><div class="ev">${s.v}</div><div class="el">${s.l}</div></div>`).join('');

    // Battle story
    const storyEl=document.getElementById('end-story');
    if(storyEl&&G.story.length){
      storyEl.innerHTML='<div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.8px;margin-bottom:8px">Battle Highlights</div>'+
        G.story.slice(-6).map(s=>`<div style="font-size:11px;color:var(--text2);padding:4px 0;border-bottom:1px solid var(--border);line-height:1.5">→ ${s}</div>`).join('');
    }
    // Biggest hit callout
    if(G.maxDmg>=8){
      const callout=document.getElementById('end-callout');
      if(callout){
        callout.textContent=G.maxDmgBot+' landed a '+G.maxDmg+'-damage hit'+(G.maxDmgCard?' with '+G.maxDmgCard:'')+'!';
        callout.style.display='block';
      }
    }
    document.getElementById('end').classList.add('open');
    setTimeout(()=>{ try{ maybeShowRankedNudge(); }catch(e){} }, 1200);
  },900);
}

