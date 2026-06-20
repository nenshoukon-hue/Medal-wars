// ═══ HELPERS ═══
// ── LAST STAND SYSTEM ──────────────────────────────────────
// Each bot has a unique Last Stand effect that triggers when it is
// the player's SOLE surviving bot AND has fused medals.
// medalCount = number of fused medals (0-2), stacks the effect.
const LAST_STAND={
  metabee:  {name:'BERSERKER',color:'#f06424',desc:'+2 ATK & +1 burn dmg per Medal'},
  arcbeetle:{name:'OVERCLOCK',color:'#2a80f0',desc:'+1 action per Medal'},
  warbandit:{name:'DESPERADO',color:'#9070f0',desc:'Draw +1 & pierce Girded per Medal'},
  rokusho:  {name:'IRON WILL',color:'#8090a8',desc:'-2 dmg taken & heal 2 per Medal'},
  sumilidon:{name:'FRENZY',color:'#10c090',desc:'+2 Charge & heal 1 per Medal'},
  machairodus:{name:'APEX',color:'#9050d0',desc:'+3 ATK & Stalk always active per Medal'},
  omegaknight:{name:'SOVEREIGN',color:'#f0c040',desc:'+2 ATK & attacks pierce all reduction per Medal'},
  wargreymon:    {name:'TERRA FORCE',color:'#f0c040',desc:'Attacks hit ALL enemies simultaneously, +3 ATK per Medal'},
  metalgurumemon:{name:'FULL BURST',color:'#9050d0',desc:'Fire 2 missiles at turn start per Medal, +2 ATK per Medal'},
  nin_ninja:  {name:'SHADOW CLONE',color:'#4080f0',desc:'2nd technique costs 0 actions & +2 ATK per Medal'},
  foxuno:     {name:'FOX FIRE',    color:'#40d898',desc:'Heal 3 HP per turn & +1 free action per Medal'},
  gokudo:     {name:'FINAL SHOT',  color:'#f04020',desc:'Combo Cannon bonus doubled & pierce per Medal'},
  robo_emperor:{name:'TOTAL DOMINION',color:'#60c030',desc:'+3 ATK & +1 cable strike per turn per Medal'},
};

function getLastStand(sk){
  // Returns {bot, medalCount, def} if a Last Stand is active for side sk, else null
  const side=G[sk]||{bots:[]};
  const aliveB=alive(side);
  if(aliveB.length!==1)return null;
  const bot=aliveB[0];
  const def=LAST_STAND[bot.key];
  if(!def)return null;
  // A deck that STARTED solo (e.g. Iron Throne) counts the bot's own medal so its Last Stand works.
  // Multi-bot decks scale Last Stand by medals absorbed from fallen allies (the intended design).
  const startedSolo=(side.bots&&side.bots.length===1);
  const medalCount=(startedSolo?1:0)+(bot.fusedMedal?1:0)+(bot.fusedMedal2?1:0);
  if(medalCount<=0)return null;
  return {bot,medalCount,def};
}

function lastStandBadge(bot,sk){
  if(bot.def)return '';
  const side=sk||(G.p.bots.includes(bot)?'p':'c');
  const ls=getLastStand(side);
  if(!ls||ls.bot!==bot)return '';
  return '<span class="btag" style="background:'+ls.def.color+'33;color:'+ls.def.color+';border:1px solid '+ls.def.color+'66;font-size:6px;font-weight:700">⚡'+ls.def.name+'</span>';
}

function calcActionsLeft(){
  let actions=1;
  // Chain Medal: 3rd action is free — grant extra action if chain medal equipped
  const chainBots=alive(G.p).filter(b=>(b.medal==='chain'||b.fusedMedal==='chain'||b.fusedMedal2==='chain'));
  if(chainBots.length>=2&&actionsLeft<=1) actions=Math.max(actions,2); // two chain bots = bonus action
  // Foxuno Medal: your 2nd action each turn is FREE (grants an extra action while Foxuno is in play).
  if(alive(G.p).some(b=>b.key==='foxuno'&&!b.def)) actions=Math.max(actions,2);
  const ls=getLastStand('p');
  if(ls){
    // Arcbeetle's Last Stand grants extra actions; others grant their own effect
    if(ls.bot.key==='arcbeetle')actions+=ls.medalCount;
    // Fire banner once per turn for ANY last stand
    if(!G._lsBannerThisTurn){
      G._lsBannerThisTurn=true;
      const lvl=['','I','II'][ls.medalCount]||'';
      setTimeout(()=>{
        banner('\u26a1 '+ls.def.name+' LAST STAND '+lvl,ls.def.color);
        log(ls.bot.name+' Last Stand ['+ls.def.name+']: '+ls.def.desc+' ×'+ls.medalCount+'!','chg');
      },300);
    }
  }
  return actions;
}

// Apply per-turn Last Stand effects (charge, heal) — called in doCharge
function applyLastStandTurn(sk){
  const ls=getLastStand(sk);
  if(!ls)return;
  const b=ls.bot, n=ls.medalCount;
  if(b.key==='machairodus'){b._stalwaysOn=true;const atkBonus=3*n;b._machLSAtk=(b._machLSAtk||0)+atkBonus;log(b.name+' APEX: +'+atkBonus+' ATK & Stalk always active!','chg');}
  else if(b.key==='omegaknight'){b._sovereignLS=true;const atkB=2*n;log(b.name+' SOVEREIGN: +'+(atkB)+' ATK & pierce all reduction!','chg');}
  else if(b.key==='metalgurumemon'&&b._fullBurstLS){
    const missiles=n*2;
    for(let i=0;i<missiles;i++){
      const targets=alive(sk==='p'?G.c:G.p);
      if(targets.length){const t=targets[Math.floor(Math.random()*targets.length)];dmg(t,2,sk==='p'?'p':'c');}
    }
    log(b.name+' FULL BURST: Fired '+missiles+' missiles!','atk');
  }
  else if(b.key==='robo_emperor'){b._dominionLS=true;const atkB=3*n;log(b.name+' TOTAL DOMINION: +'+atkB+' ATK & '+n+' extra cable strikes!','chg');}
  else if(b.key==='nin_ninja'){b._shadowCloneLS=true;log(b.name+' SHADOW CLONE: 2nd technique free & +'+(2*n)+' ATK!','chg');}
  else if(b.key==='foxuno'){b._foxFireLS=true;log(b.name+' FOX FIRE: Heal 3HP/turn & +1 free action!','chg');}
  else if(b.key==='gokudo'){b._finalShotLS=true;log(b.name+' FINAL SHOT: Combo Cannon ×2 & pierce!','chg');}
  else if(b.key==='wargreymon'){b._terraForceLS=true;log(b.name+' TERRA FORCE: Attacks hit ALL enemies + +'+(3*n)+' ATK!','chg');}
  else if(b.key==='metalgurumemon'){b._fullBurstLS=true;log(b.name+' FULL BURST: Missiles fire at turn start! +'+(2*n)+' ATK!','chg');}
  else if(b.key==='sumilidon'){addChg(b,2*n);const h=2*n;b.hp=Math.min(b.maxHp,b.hp+h);log(b.name+' FRENZY: +'+(2*n)+' Charge, +'+h+' HP!','chg');}
  else if(b.key==='rokusho'){const h=2*n;b.hp=Math.min(b.maxHp,b.hp+h);log(b.name+' IRON WILL: +'+h+' HP!','chg');}
  else if(b.key==='warbandit'){drw(G[sk],n);log(b.name+' DESPERADO: drew '+n+' card'+(n>1?'s':'')+'!','chg');}
}

function shuffle(a){for(let i=a.length-1;i>0;i--){const j=0|Math.random()*(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;}
function drw(s,n=1){for(let i=0;i<n;i++)if(s.deck.length)s.hand.push(s.deck.shift());}
function dsc(s,id){const i=s.hand.findIndex(c=>c.uid===id);if(i>=0)s.hand.splice(i,1);}
function alive(s){return s.bots.filter(b=>!b.def);}
const LOG_NOISE=['Combo Cannon:','Cable Network:','Combo Core:','Missile Barrage:','+1 Combo','from the heat','Dramon Destroyer:'];
let _tickerQ=[], _tickerTimer=null;
function _setTicker(m){
  const el=document.getElementById('m-ticker')||document.getElementById('lticker');
  if(el)el.textContent=m;
}
function _queueTicker(m){
  _tickerQ.push(m);
  if(_tickerTimer)return;
  _tickerTimer=setInterval(()=>{
    if(_tickerQ.length===0){clearInterval(_tickerTimer);_tickerTimer=null;return;}
    _setTicker(_tickerQ.shift());
  },750);
}
function log(m,t='info'){
  // Filter repetitive low-value messages from the persistent log, but still ticker them
  const isNoise=LOG_NOISE.some(n=>m.indexOf(n)>=0);
  if(typeof G==='object'&&G&&G.phase==='cpu_turn'&&(typeof G_online==='undefined'||!G_online)){_queueTicker(m);}
  else{_setTicker(m);}
  if(!isNoise){logs.push({m,t});renderLog();}
  else{ // noise still shows in ticker but only batched into log occasionally
    logs.push({m,t,noise:true});
    if(logs.filter(e=>e.noise).length%3===0)renderLog();
  }
}

function addChg(bot,n){
  if(bot.def)return;
  const old=bot.charge;
  bot.charge=Math.min(5,bot.charge+n);
  if(old<5&&bot.charge>=5){
    log(bot.name+' IGNITED!','chg');banner('IGNITED!',bot.mColor||'#f0b820');
    // ── Zero medal: electric overcharge FX when fully charged ──
    if(bot.medal==='zero'||bot.fusedMedal==='zero'){
      try{ if(typeof SFX!=='undefined'&&SFX.zap) SFX.zap(); }catch(e){}
      try{ if(typeof banner==='function') setTimeout(()=>banner('\u26a1 OVERCHARGE \u26a1','#7fd0ff'),120); }catch(e){}
      try{ if(typeof electricFlash==='function') electricFlash(bot); }catch(e){}
    }
    // ── Arase Oosumi Medafighter: on reaching max Charge, draw + that bot gains +1 ATK ──
    const side=G.p&&G.p.bots&&G.p.bots.includes(bot)?'p':(G.c&&G.c.bots&&G.c.bots.includes(bot)?'c':null);
    if(side){
      const mf=G[side].mf;
      if(mf&&/max Charge/i.test(mf.pass||'')&&(bot._araseAtk||0)<3){
        bot.atk+=1; bot._araseAtk=(bot._araseAtk||0)+1;
        drw(G[side],1);
        log((side==='p'?'':'CPU ')+'Arase Oosumi: '+bot.name+' +1 ATK and drew a card!','chg');
      }
    }
  }
  else if(n>0)log(bot.name+' +'+n+' chg ('+bot.charge+'/5)','chg');
}

function dmg(bot,raw,sk){
  if(bot.def)return;
  let d=raw;
  bot._tookDmgThisTurn=(bot._tookDmgThisTurn||0)+raw;
  if(bot._sbGuard){ d=Math.max(0,d-2); }
  if(sk==='p' && G._zanshin && G._zanshin.phase===2 && d>0){ G._zanshin.punish.attacked=true; }
  if(bot._bound>0 && bot._defStrip>0){ d+=bot._defStrip; bot._defStrip=0; } // Exposed strip realized as bonus damage
  try{ if(typeof SFX!=='undefined'&&SFX.hit) SFX.hit(raw); }catch(e){}

  // Corrosion Plating thorns: attacker takes 2
  if(typeof botEquips==='function' && botEquips(bot).some(e=>e.fx==='fb_corrosion') && G._curAtkr && G._curAtkr!==bot){
    const atkr=G._curAtkr; setTimeout(()=>{ if(atkr&&!atkr.def){ const oside=G.p.bots.includes(atkr)?'p':'c'; dmg(atkr,2,oside); flt('-2','dmg'); log('Corrosion Plating: attacker takes 2!','atk'); } },10);
  }
  // Wall Stance: if targeting a player bot that isn't Rokusho, redirect to Rokusho
  if(sk==='p'&&bot.key!=='rokusho'){
    const rok=G.p.bots.find(b=>b.key==='rokusho'&&!b.def&&(b.wallStacks||0)>0);
    if(rok){
      rok.wallStacks--;
      log('Wall Stance: '+rok.name+' takes the hit for '+bot.name+'! ('+rok.wallStacks+' left)','eq');
      dmg(rok,raw,'p'); // redirect to Rokusho
      return;
    }
  }
  // Vanguard: Omegaknight absorbs hits on non-active support bots
  if(sk==='p'&&bot.key!=='omegaknight'){
    const omega=G.p.bots.find(b=>b.key==='omegaknight'&&!b.def);
    const isSupport=omega&&G.p.activeBot!==G.p.bots.indexOf(bot)&&G.p.bots.indexOf(bot)!==G.p.activeBot;
    if(omega&&isSupport&&G.p.activeBot!==G.p.bots.indexOf(omega)){
      log('Vanguard! '+omega.name+' intercepts!','chg');
      banner('VANGUARD!','#f0c040');
      dmg(omega,raw,'p');return;
    }
  }
  // Sovereign Last Stand: pierce ALL reduction
  const _sovereign = getLastStand(sk==='p'?'p':'p'); // attacker side
  const _pierceAll = sk==='p' && alive(G.p).length===1 && alive(G.p)[0] && alive(G.p)[0].key==='omegaknight' && alive(G.p)[0]._sovereignLS;
  // Forge pierce: attacker ignores N points of reduction this hit
  let _forgePierce=0;
  if(G._curAtkr&&(G._curAtkr._pierceThisHit||0)>0){ _forgePierce=G._curAtkr._pierceThisHit; G._curAtkr._pierceThisHit=0; }
  const _unblock=(G._curAtkr&&G._curAtkr._forgeUnblock);
  if(!G._pierceDmg && !_pierceAll && !_unblock){
    if(bot.medal==='titan'){let r=bot.changed?2:1; r=Math.max(0,r-_forgePierce); d=Math.max(0,d-r);}
    // Masterbeetle Master form: heavy damage reduction
    if(bot._masterReduce){ d=Math.max(0, d-Math.max(0, bot._masterReduce-_forgePierce)); }

    // (Rokusho extra -1 removed in balance pass — Titan medal already grants -1)
    // Robo Emperor: Throne Armor (permanent) + Emperor Shield (equip)
    if(bot.key==='robo_emperor'){
      const ta=bot._throneArmor||0;
      const es=(bot.equip&&bot.equip.fx==='eq_emp_shield')?3:0;
      if(ta+es>0&&d>0){const before=d;d=Math.max(1,d-ta-es);if(d<before)log('Emperor armor: -'+(before-d)+' damage!','eq');}
    }
  }
  // Support DEF passive — Rokusho in support shields the active bot
  if((bot._supportDef||0)>0&&d>0){
    const blocked=Math.min(d,bot._supportDef);
    d=Math.max(0,d-bot._supportDef);
    if(blocked>0)log('🛡 Rokusho support: -'+blocked+' DMG for '+bot.name,'chg');
  }
  if(bot.fusedMedal==='titan')d=Math.max(0,d-1);
  // Rokusho IRON WILL Last Stand: -2 dmg per medal
  if(!G._pierceDmg&&bot.key==='rokusho'&&d>0){
    const lsR=getLastStand(G.p.bots.includes(bot)?'p':'c');
    if(lsR&&lsR.bot===bot){const red=2*lsR.medalCount;d=Math.max(0,d-red);if(red>0)log('IRON WILL: -'+red+' dmg!','chg');}
  }
  if(bot.equip&&bot.equip.fx==='eq_fury')d+=2;
  bot.hp=Math.max(0,bot.hp-d);
  log(bot.name+' takes '+d+' → '+bot.hp+'/'+bot.maxHp+' HP','dmg');
  // Seaslug passive: Robo Emperor drops below 20 HP → +3 charge, draw 1 (once)
  if(bot.key==='robo_emperor'&&G.p.bots.includes(bot)&&bot.hp>0&&G.p.mf&&G.p.mf.pass.includes('below 20 HP')){
    const band=Math.floor(bot.hp/14); // re-arms each 14-HP band crossed
    if(bot._seaslugBand===undefined) bot._seaslugBand=Math.floor(bot.maxHp/14);
    if(band<bot._seaslugBand){
      bot._seaslugBand=band;
      bot.charge=Math.min(10,bot.charge+3);
      drw(G.p,1);
      log('Seaslug: Emperor wounded! +3 Charge, drew 1 card!','chg');
      banner('SEASLUG!','#60c030');
    }
  }
  if(false&&bot.key==='robo_emperor'&&bot.hp<20&&!bot._seaslugFired){
    bot._seaslugFired=true;
    bot.charge=Math.min(10,bot.charge+3);
    drw(G.p,1);
    log('Seaslug: Emperor wounded! +3 Charge, drew 1 card!','chg');
    banner('SEASLUG!','#60c030');
  }
  flt('-'+d,'dmg');
  if(bot.equip&&bot.equip.fx==='eq_counter'&&d>0){
    // sk = side being damaged, so attacker is the OPPOSITE side
    const atk=alive(sk==='c'?G.p:G.c)[0];
    if(atk){log('Counter Claw → '+atk.name+' -2!','eq');atk.hp=Math.max(0,atk.hp-2);}
  }
  if(bot.equip&&bot.equip.fx==='eq_burn'&&d>0){
    // burn the attacker (opposite side from sk)
    const atk=alive(sk==='c'?G.p:G.c)[0];
    if(atk){atk.burn=true;atk.burnAmt=1;log('Burn Coat: '+atk.name+' will burn next turn!','eq');}
  }
  if(bot.hp<=0)defeat(bot,sk);
}

function defeat(bot,sk){
  if(bot.equip&&bot.equip.fx==='eq_ghost'&&!bot._gUsed){
    bot._gUsed=true;bot.hp=5;bot.equip=null;
    log(bot.name+' revives via Ghost Shell! (5 HP)','eq');
    banner('GHOST SHELL!','#2a80f0');return;
  }
  // Blackram Scrap & Rebuild: return one equipment to hand
  { const _eqs=(typeof botEquips==='function')?botEquips(bot):[]; const _side=G.p.bots.includes(bot)?G.p:(G.c.bots.includes(bot)?G.c:null);
    if(_eqs.length&&_side&&_side.bots.some(b=>b.key==='blackram'&&!b.def)){ const _sal=_eqs[0]; if(CDEFS[_sal.id]){ _side.hand.push({...CDEFS[_sal.id],uid:uid()}); log('Scrap & Rebuild: recovered '+_sal.name+'!','eq'); } } }
  bot.def=true;bot.hp=0;bot.equip=null;bot.equips=[];
  // Trigger death burst animation
  setTimeout(()=>{ const _e=getBotEl(bot,sk)||document.querySelector('.bc.dying'); if(_e)showDeathBurst(_e); },10);
  log(bot.name+' DEFEATED!','dmg');
  // Royal medal: track fallen allies for ATK bonus
  if(G.p&&G.p.bots.includes(bot)){G._royalFallen=(G._royalFallen||0)+1;}
  // Roks passive: Omegaknight defeat = +2 charge
  if(sk==='c'&&G.p&&G.p.mf&&G.p.mf.pass.includes('Omegaknight defeats')){
    const omega=G.p.bots.find(b=>b.key==='omegaknight'&&!b.def);
    if(omega){addChg(omega,2);log('Roks: Omegaknight +2 Charge!','chg');}
  }
  // Tai passive: any defeat = all bots +1 ATK this turn
  if(sk==='c'&&G.p&&G.p.mf&&G.p.mf.pass.includes('all your bots gain +1 ATK')){
    alive(G.p).forEach(b=>{b._taiBonus=(b._taiBonus||0)+1;});
    log('Tai: Victory! All bots +1 ATK!','chg');banner('TAI BONUS!','#60c030');
  }
  const side=G.p.bots.includes(bot)?'Your':'Enemy';
  G.story.push(side+' '+bot.name+' fell on turn '+turn);
  // Auto-advance active bot if the active one was defeated
  ['p','c'].forEach(sk=>{
    const si=G[sk];
    if(si.bots.includes(bot)&&si.activeBot===si.bots.indexOf(bot)){
      const nextAlive=si.bots.findIndex((b,i)=>!b.def&&i!==si.bots.indexOf(bot));
      if(nextAlive>=0){si.activeBot=nextAlive;log(si.bots[nextAlive].name+' steps up to front!','chg');}
    }
  });
  if(bot.changed){
    const isP=G.p.bots.includes(bot);
    G.winner=isP?'c':'p';
    G.reason=isP?'Your Medachanged bot fell — Medafighter KO!':'CPU Medachanged bot fell!';
    showEnd();return;
  }
  // Two-bot comeback bump: when player drops to exactly 2 bots, one-time boost
  if(G.p.bots.includes(bot)&&alive(G.p).length===2&&!G.p._twoBotBonus){
    G.p._twoBotBonus=true;
    drw(G.p,1);
    const act=getActiveBot('p');
    if(act)addChg(act,1);
    log('⚙ Down a bot — emergency reserves: drew 1 card, +1 Charge!','chg');
    setTimeout(()=>banner('EMERGENCY RESERVES','#f0b820'),200);
  }
  // AUTO Medal Fusion — defer with setTimeout so attack chain finishes first
  if(G.p.bots.includes(bot)&&alive(G.p).length>0){
    G.fusionCount++;
    const deadBot=bot; // capture reference
    setTimeout(()=>{
      if(G.winner)return; // game already ended
      checkWin();         // check if game over first
      if(G.winner)return; // if it ended, skip fusion UI
      const fuseTargets=alive(G.p);
      if(!fuseTargets.length)return;
      const healAmt=G.p._fusionBoosted?8:4;
      if(G.p._fusionBoosted)G.p._fusionBoosted=false;
      renderAll(); // refresh board to show defeat
      SFX.medalFusion();banner('MEDAL FUSION!','#9070f0');
      openM('⚡ MEDAL FUSION — '+deadBot.mName+' Medal',
        '<b style="color:#f0b820">'+deadBot.mName+' Medal</b> detaches from '+deadBot.name+'.<br><br>'+
        'Fuse it to a surviving ally:<br>'+
        '<span style="color:var(--text2);font-size:12px">• +'+healAmt+' HP restored<br>• +1 Charge<br>• Gains '+deadBot.mName+' Medal passive</span>',
        [
          ...fuseTargets.map(b=>({
            l:b.name+' — '+b.hp+'/'+b.maxHp+' HP · ⚡'+b.charge+'/5',
            cls:'mb ok',
            cb:()=>{
              // Stack medals: fusedMedal2 for the second fusion
              if(!b.fusedMedal){b.fusedMedal=deadBot.medal;}
              else{b.fusedMedal2=deadBot.medal;}
              // Black Tide bots share one medal but each has a unique identity — fuse THEIR passive, not the generic medal text.
              b.fusedPass=(deadBot.medal==='plunder'&&deadBot.passive)?deadBot.passive:MEDAL[deadBot.medal].passive;
              b.hp=Math.min(b.maxHp,b.hp+healAmt);
              addChg(b,1);
              // If Arcbeetle is last bot and just got a medal, recalculate actions
              if(b.key==='arcbeetle'&&alive(G.p).length===1){
                actionsLeft=calcActionsLeft();
              }
              log('Medal Fusion: '+deadBot.mName+' → '+b.name+'! +'+healAmt+' HP, +1 Charge','eq');
              G.story.push(deadBot.mName+' Medal fused to '+b.name+' (turn '+turn+')');
              closeM();renderAll();
            }
          })),
          // Always provide a skip option so game can never hang
          {l:'Skip fusion',cls:'mb',cb:()=>{
            log(deadBot.mName+' Medal lost — no fusion.','info');
            closeM();renderAll();
          }}
        ]
      );
    },400); // defer after current attack chain resolves
    return; // don't call checkWin here — it's in the setTimeout
  }
  // CPU fusion — auto. Prefer fusing toward a Last Stand-capable bot,
  // especially if it will become the sole survivor.
  if(G.c.bots.includes(bot)&&alive(G.c).length>0){
    const cAlive=alive(G.c);
    // Prefer sole-survivor scenario: if only 1 alive after this, fuse to them
    const willBeSole=cAlive.length===1;
    const fuseTarget=cAlive.sort((a,b)=>{
      const lsA=LAST_STAND[a.key]?4:0, lsB=LAST_STAND[b.key]?4:0;
      const slotA=(!a.fusedMedal||!a.fusedMedal2)?2:0, slotB=(!b.fusedMedal||!b.fusedMedal2)?2:0;
      const hpA=a.hp, hpB=b.hp;
      // Prefer highest-impact Last Stand bot with open medal slot
      return (lsB+slotB+b.atk+hpB*.2)-(lsA+slotA+a.atk+hpA*.2);
    })[0];
    if(!fuseTarget.fusedMedal)fuseTarget.fusedMedal=bot.medal;
    else fuseTarget.fusedMedal2=bot.medal;
    fuseTarget.fusedPass=(bot.medal==='plunder'&&bot.passive)?bot.passive:MEDAL[bot.medal].passive;
    fuseTarget.hp=Math.min(fuseTarget.maxHp,fuseTarget.hp+4);
    addChg(fuseTarget,1);
    log('CPU Medal Fusion: '+bot.mName+' → '+fuseTarget.name,'cpu');
  }
  checkWin();
}

function checkWin(){
  const _winBefore = G.winner;
  // (body unchanged — G.winner gets set below, then we signal opponent)
  if(!alive(G.p).length){G.winner='c';G.reason='All your Medabots defeated.';showEnd();}
  else if(!alive(G.c).length){G.winner='p';G.reason='All enemy Medabots defeated!';showEnd();}
}

function flt(txt,type='dmg'){
  const el=document.createElement('div');
  el.className='flt'+(type==='heal'?' heal':type==='chg'?' chg':'');
  el.textContent=txt;
  el.style.left=(30+Math.random()*40)+'%';
  el.style.top=(32+Math.random()*20)+'%';
  document.body.appendChild(el);
  setTimeout(()=>el.remove(),1200);
}
function showBurnAll(){
  // Show a quick "BURN ALL" overlay
  const el=document.createElement('div');
  el.style.cssText='position:fixed;top:50%;left:50%;transform:translate(-50%,-60%);font-family:Orbitron,monospace;font-size:16px;font-weight:900;color:#ff6020;pointer-events:none;z-index:201;text-shadow:0 0 20px #ff6020,0 0 40px #ff4000;animation:bnr 1.2s ease-out forwards;white-space:nowrap;letter-spacing:2px';
  el.textContent='🔥 BURN ALL 🔥';
  document.body.appendChild(el);setTimeout(()=>el.remove(),1300);
}

// ── Gokudo Combo Cannon visual ──
let _comboFxBusy=false;

// ── Robo Emperor Cable Network visual ──
function triggerCableAnim(){
  const wrap=document.createElement('div'); wrap.className='cable-fx';
  for(let i=0;i<4;i++){
    const bolt=document.createElement('div'); bolt.className='cable-bolt';
    bolt.style.left=(20+Math.random()*60)+'%';
    bolt.style.top='15%'; bolt.style.height=(30+Math.random()*30)+'%';
    bolt.style.transform='rotate('+(Math.random()*30-15)+'deg)';
    bolt.style.animationDelay=(i*0.06)+'s';
    wrap.appendChild(bolt);
  }
  const node=document.createElement('div'); node.className='cable-node';
  node.style.left='48%'; node.style.top='30%';
  wrap.appendChild(node);
  document.body.appendChild(wrap);
  setTimeout(()=>wrap.remove(), 700);
}

function triggerComboAnim(count){
  if(_comboFxBusy)return; _comboFxBusy=true;
  try{ if(typeof SFX==='object'){ (SFX.combo?SFX.combo():(SFX.attack&&SFX.attack())); } }catch(e){}
  const wrap=document.createElement('div'); wrap.className='combo-fx';
  // three staggered slashes
  for(let i=0;i<3;i++){
    const s=document.createElement('div'); s.className='combo-slash';
    s.style.animationDelay=(i*0.09)+'s';
    s.style.top=(i*8-8)+'%';
    wrap.appendChild(s);
  }
  const burst=document.createElement('div'); burst.className='combo-burst';
  burst.innerHTML='COMBO &times;'+count+'<small>COMBO CANNON</small>';
  burst.style.animationDelay='.18s';
  wrap.appendChild(burst);
  document.body.appendChild(wrap);
  setTimeout(()=>{ wrap.remove(); _comboFxBusy=false; }, 800);
}


// ── Bot passive viewer: tap the \u24d8 badge on a bot ──
function showBotPassive(sk, idx){
  const side=G[sk]; if(!side)return;
  const bot=side.bots[idx]; if(!bot)return;
  const medalName=(bot.mName||bot.medal||'').toString();
  const botPassive=bot.passive||'No unique passive.';
  const medalInfo=(typeof MEDAL==='object'&&MEDAL[bot.medal])?MEDAL[bot.medal]:null;
  const medalPassive=medalInfo?medalInfo.passive:'';
  let html='<div style="text-align:left">';
  html+='<div style="font-family:Orbitron,monospace;font-weight:800;color:'+(bot.color||'#fff')+';font-size:15px;margin-bottom:2px">'+bot.name+(bot.changed?' \u26a1':'')+'</div>';
  html+='<div style="font-size:9px;color:var(--text3);margin-bottom:8px">'+medalName+' Medal \u00b7 '+(bot.def?'DEFEATED':bot.hp+'/'+bot.maxHp+' HP \u00b7 \u2694'+bot.atk)+'</div>';
  html+='<div style="background:rgba(0,0,0,.3);border-radius:8px;padding:9px;margin-bottom:6px;border-left:3px solid '+(bot.color||'#888')+'">';
  html+='<div style="font-size:9px;color:var(--gold);font-weight:700;margin-bottom:3px">BOT PASSIVE</div>';
  html+='<div style="font-size:11px;color:var(--text);line-height:1.4">'+botPassive+'</div></div>';
  if(medalPassive){
    html+='<div style="background:rgba(0,0,0,.3);border-radius:8px;padding:9px;border-left:3px solid var(--storm2)">';
    html+='<div style="font-size:9px;color:var(--storm2);font-weight:700;margin-bottom:3px">'+medalName.toUpperCase()+' MEDAL</div>';
    html+='<div style="font-size:11px;color:var(--text);line-height:1.4">'+medalPassive+'</div></div>';
  }
  // ── Inherited (fused) Medal passives from fallen allies ──
  const _fused=[bot.fusedMedal, bot.fusedMedal2].filter(Boolean);
  if(_fused.length){
    _fused.forEach(fm=>{
      const fi=(typeof MEDAL==='object'&&MEDAL[fm])?MEDAL[fm]:null;
      if(fi){
        html+='<div style="background:rgba(160,90,220,.12);border-radius:8px;padding:9px;margin-bottom:6px;border-left:3px solid '+(fi.color||'#a050dc')+'">';
        html+='<div style="font-size:9px;color:'+(fi.color||'#c090ff')+';font-weight:800;margin-bottom:3px;letter-spacing:.5px">\ud83d\udd17 FUSED \u2014 '+fi.name+' Medal</div>';
        html+='<div style="font-size:11px;color:var(--text);line-height:1.4">'+(fi.passive||'')+'</div></div>';
      }
    });
  }
  if(bot.equip){
    html+='<div style="background:rgba(0,0,0,.3);border-radius:8px;padding:9px;margin-top:6px;border-left:3px solid #78c88c">';
    html+='<div style="font-size:9px;color:#78c88c;font-weight:700;margin-bottom:3px">EQUIPPED</div>';
    html+='<div style="font-size:11px;color:var(--text);line-height:1.4">'+bot.equip.name+' \u2014 '+(bot.equip.desc||'')+'</div></div>';
  }
  // ── Last Stand info (if this bot has one) ──
  if(typeof LAST_STAND==='object' && LAST_STAND[bot.key]){
    const ls=LAST_STAND[bot.key];
    html+='<div style="background:rgba(240,90,40,.12);border-radius:8px;padding:9px;margin-bottom:6px;border-left:3px solid '+(ls.color||'#f06424')+'">';
    html+='<div style="font-size:9px;color:'+(ls.color||'#f06424')+';font-weight:800;margin-bottom:3px;letter-spacing:.5px">\u2620 LAST STAND \u2014 '+ls.name+'</div>';
    html+='<div style="font-size:11px;color:var(--text);line-height:1.4">'+ls.desc+'</div>';
    html+='<div style="font-size:9px;color:var(--text3);margin-top:4px;font-style:italic">Activates when this is your only Medabot left'+((G&&G[G.p&&G.p.bots&&G.p.bots.includes(bot)?'p':'c']&&G[G.p.bots.includes(bot)?'p':'c'].bots.length===1)?' \u2014 solo deck: always active!':' (scales with absorbed Medals).')+'</div>';
    html+='</div>';
  }
  html+='</div>';
  openM('Bot Info', html, [{l:'Close', cls:'mb ok', cb:()=>closeM()}]);
}


// Brief electric arc flash over a bot when it overcharges (Zero medal).
function electricFlash(bot){
  try{
    let el=null;
    // Try to locate the bot's rendered slot for positioning
    const allSlots=document.querySelectorAll('.botcard,.slot,[data-botkey]');
    let rect=null;
    allSlots.forEach(s=>{ if(s.dataset&&s.dataset.botkey===bot.key) rect=s.getBoundingClientRect(); });
    const f=document.createElement('div');
    f.className='elec-flash';
    f.innerHTML='<svg viewBox="0 0 100 100"><polyline points="50,5 42,38 58,42 38,72 54,68 46,95" fill="none" stroke="#bfeaff" stroke-width="4" stroke-linejoin="round"/><polyline points="50,5 42,38 58,42 38,72 54,68 46,95" fill="none" stroke="#7fd0ff" stroke-width="8" stroke-linejoin="round" opacity="0.5"/></svg>';
    if(rect){ f.style.left=(rect.left+rect.width/2-60)+'px'; f.style.top=(rect.top+rect.height/2-60)+'px'; }
    else { f.style.left='calc(50% - 60px)'; f.style.top='40%'; }
    document.body.appendChild(f);
    setTimeout(()=>f.remove(),600);
  }catch(e){}
}


// Dramatic Medaforce activation FX: colored screen flash + brief shake.
function medaforceFX(color){
  try{
    const f=document.createElement('div');
    f.className='mf-flash';
    f.style.background='radial-gradient(circle at 50% 45%, '+(color||'#f0b820')+'cc 0%, '+(color||'#f0b820')+'33 40%, transparent 75%)';
    document.body.appendChild(f);
    setTimeout(()=>f.remove(),620);
    const arena=document.getElementById('arena')||document.body;
    if(arena){ arena.classList.remove('mf-shaking'); void arena.offsetWidth; arena.classList.add('mf-shaking'); setTimeout(()=>arena.classList.remove('mf-shaking'),520); }
  }catch(e){}
}

// ── Dedicated Medaforce visual FX ──
function _fxLayer(life){
  const l=document.createElement('div'); l.className='fx-layer';
  document.body.appendChild(l);
  setTimeout(()=>{ try{ l.remove(); }catch(e){} }, life||1200);
  return l;
}
function _fxShake(){
  const arena=document.getElementById('arena')||document.body;
  if(arena){ arena.classList.remove('mf-shaking'); void arena.offsetWidth; arena.classList.add('mf-shaking'); setTimeout(()=>arena.classList.remove('mf-shaking'),520); }
}
// Inferno Surge — a flame slams down on the target
function fxFlame(){
  try{
    const l=_fxLayer(1000);
    const burst=document.createElement('div'); burst.className='fx-flame-burst'; l.appendChild(burst);
    const fl=document.createElement('div'); fl.className='fx-flame'; fl.textContent='\uD83D\uDD25'; l.appendChild(fl);
    try{ if(typeof SFX==='object'&&SFX.medaforce) SFX.medaforce(); }catch(e){}
    _fxShake();
  }catch(e){}
}
// X Burst (Titan first MF) — an energy X strikes with sparks
function fxEnergyX(){
  try{
    const l=_fxLayer(1000);
    const x=document.createElement('div'); x.className='fx-xbolt'; x.textContent='\u2715'; l.appendChild(x);
    // radial sparks
    for(let i=0;i<14;i++){
      const sp=document.createElement('div'); sp.className='fx-spark';
      const ang=(Math.PI*2/14)*i, dist=120+Math.random()*120;
      sp.style.left='50%'; sp.style.top='50%';
      sp.style.setProperty('--dx',(Math.cos(ang)*dist)+'px');
      sp.style.setProperty('--dy',(Math.sin(ang)*dist)+'px');
      l.appendChild(sp);
    }
    try{ if(typeof SFX==='object'&&SFX.zap) SFX.zap(); }catch(e){}
    _fxShake();
  }catch(e){}
}
// Master Cannon — full-power Prominence beam sweeps the field
function fxBeam(){
  try{
    const l=_fxLayer(1200);
    const beam=document.createElement('div'); beam.className='fx-beam'; l.appendChild(beam);
    const core=document.createElement('div'); core.className='fx-beam-core'; l.appendChild(core);
    try{ if(typeof SFX==='object'&&SFX.medaforce) SFX.medaforce(); }catch(e){}
    setTimeout(()=>{ try{ if(typeof SFX==='object'&&SFX.zap) SFX.zap(); }catch(e){} },180);
    _fxShake();
  }catch(e){}
}
// Healing — green/teal restorative glow with rising plus signs
function fxHeal(){
  try{
    const l=_fxLayer(1300);
    const g=document.createElement('div'); g.className='fx-heal'; l.appendChild(g);
    for(let i=0;i<6;i++){
      const p=document.createElement('div'); p.className='fx-heal-plus'; p.textContent='+';
      p.style.left=(30+Math.random()*40)+'%'; p.style.top=(45+Math.random()*20)+'%';
      p.style.animationDelay=(i*0.08)+'s';
      l.appendChild(p);
    }
    try{ if(typeof SFX==='object'&&SFX.select) SFX.select(); }catch(e){}
  }catch(e){}
}


// ── Shadow Blade medaforce: crossing purple slashes + shadow veil ──
function fxShadowSlash(){
  try{
    const l=_fxLayer(900);
    const veil=document.createElement('div'); veil.className='fx-shadowveil'; l.appendChild(veil);
    ['s1','s2','s3'].forEach(c=>{ const sl=document.createElement('div'); sl.className='fx-slash '+c; l.appendChild(sl); });
    try{ if(typeof SFX==='object'&&SFX.slash){ SFX.slash(); setTimeout(()=>{try{SFX.slash();}catch(e){}},120); setTimeout(()=>{try{SFX.slash();}catch(e){}},240); } }catch(e){}
    _fxShake();
  }catch(e){}
}
// ── Combo Cannon: a red orb launches and bursts ──
function fxComboCannon(){
  try{
    const l=_fxLayer(1000);
    const aura=document.createElement('div'); aura.className='fx-orb-aura'; l.appendChild(aura);
    const orb=document.createElement('div'); orb.className='fx-orb'; l.appendChild(orb);
    try{ if(typeof SFX==='object'){ if(SFX.zap)SFX.zap(); if(SFX.medaforce)setTimeout(()=>{try{SFX.medaforce();}catch(e){}},450); } }catch(e){}
    _fxShake();
  }catch(e){}
}
// ── Titan X Burst: a giant blue FIRE X drops onto the enemy ──
function fxBlueX(){
  try{
    const l=_fxLayer(1000);
    const fire=document.createElement('div'); fire.className='fx-bluefire'; l.appendChild(fire);
    const x=document.createElement('div'); x.className='fx-bluex'; x.textContent='\u2715'; l.appendChild(x);
    // a few cold sparks
    for(let i=0;i<10;i++){
      const sp=document.createElement('div'); sp.className='fx-spark';
      const ang=(Math.PI*2/10)*i, dist=110+Math.random()*100;
      sp.style.left='50%'; sp.style.top='50%';
      sp.style.setProperty('--dx',(Math.cos(ang)*dist)+'px');
      sp.style.setProperty('--dy',(Math.sin(ang)*dist)+'px');
      l.appendChild(sp);
    }
    try{ if(typeof SFX==='object'){ if(SFX.medaforce)SFX.medaforce(); if(SFX.zap)setTimeout(()=>{try{SFX.zap();}catch(e){}},300); } }catch(e){}
    _fxShake();
  }catch(e){}
}

// ═══════════════════════════════════════════════════════════
// UNIVERSAL CARD FX — every card gets a visual when played.
// Picks an effect-family visual from the card's fx string; if no
// family matches, falls back to a per-type visual. Lightweight DOM
// overlays via _fxLayer; never throws.
// ═══════════════════════════════════════════════════════════
function _cfxBase(cls, opts){
  try{
    const l=_fxLayer((opts&&opts.life)||900);
    const el=document.createElement('div'); el.className=cls;
    if(opts&&opts.color) el.style.setProperty('--cfx', opts.color);
    if(opts&&opts.text!=null) el.textContent=opts.text;
    l.appendChild(el);
    return l;
  }catch(e){ return null; }
}
function _cfxSparks(l, color, n){
  try{
    for(let i=0;i<(n||8);i++){
      const sp=document.createElement('div'); sp.className='cfx-spark2';
      if(color) sp.style.setProperty('--cfx', color);
      const ang=(Math.PI*2/(n||8))*i, dist=90+Math.random()*90;
      sp.style.left='50%'; sp.style.top='52%';
      sp.style.setProperty('--dx',(Math.cos(ang)*dist)+'px');
      sp.style.setProperty('--dy',(Math.sin(ang)*dist)+'px');
      l.appendChild(sp);
    }
  }catch(e){}
}
function _sfx(name){ try{ if(typeof SFX==='object'&&SFX[name]) SFX[name](); }catch(e){} }

// Classify a card's fx string into an effect family. Returns a family key.
function _cardFxFamily(fx, type){
  const f=(fx||'').toLowerCase();
  if(/burn|ember|flame|scorch|inferno|heat|fire|blaze/.test(f)) return 'burn';
  if(/heal|remedy|medic|mend|restore/.test(f)) return 'heal';
  if(/pierce|siege|cannon|barrage|burst|railgun/.test(f)) return 'pierce';
  if(/drain|exhaust|suppress|weaken|sap/.test(f)) return 'drain';
  if(/charge|recharge|overcharge|overload|energ/.test(f)) return 'charge';
  if(/draw|search|locate|scout|tutor/.test(f)) return 'draw';
  if(/chain|combo|slash|strike|cut|blade|deal\d/.test(f)) return 'slash';
  if(/guard|block|shield|barrier|negate|reflect|counter|honor/.test(f)) return 'guard';
  if(/evolve|fusion|medachange|ascend/.test(f)) return 'evolve';
  if(type==='trap') return 'trap';
  if(type==='equipment') return 'equip';
  if(type==='medaforce') return 'pierce';
  return 'generic';
}

// Per-family visual. color/icon chosen to read at a glance.
function _playFamilyFx(fam, card){
  const color=(card&&card.color)||'#9ce0ff';
  switch(fam){
    case 'burn': { const l=_cfxBase('cfx-emberlet',{text:'\uD83D\uDD25',life:800}); if(l)_cfxSparks(l,'#ff7a2e',8); _sfx('medaforce'); break; }
    case 'heal': { _cfxBase('cfx-glow',{color:'#40e090',life:800}); const l=_cfxBase('cfx-icon',{text:'\u271A',color:'#5ae08c',life:800}); _sfx('select'); break; }
    case 'pierce': { const l=_cfxBase('cfx-slash',{color:'#ffd060',life:600}); if(l)_cfxSparks(l,'#ffd040',10); _sfx('attack'); break; }
    case 'drain': { _cfxBase('cfx-glow',{color:'#a060f0',life:800}); _cfxBase('cfx-icon',{text:'\uD83C\uDF00',color:'#b080ff',life:800}); _sfx('zap'); break; }
    case 'charge': { const l=_cfxBase('cfx-ring',{color:'#40c0ff',life:700}); if(l)_cfxSparks(l,'#7cd0ff',10); _sfx('zap'); break; }
    case 'draw': { _cfxBase('cfx-card',{life:700}); _cfxBase('cfx-card',{life:760}); _sfx('handSkim'); break; }
    case 'slash': { _cfxBase('cfx-slash',{color:color,life:550}); _sfx('slash'); break; }
    case 'guard': { _cfxBase('cfx-ring',{color:'#7cc0ff',life:650}); _cfxBase('cfx-icon',{text:'\uD83D\uDEE1\uFE0F',color:'#9cc8ff',life:700}); _sfx('select'); break; }
    case 'evolve': { _cfxBase('cfx-glow',{color:'#f0c040',life:800}); const l=_cfxBase('cfx-icon',{text:'\u2728',color:'#ffd040',life:800}); if(l)_cfxSparks(l,'#ffd040',12); _sfx('medachange'); break; }
    case 'trap': { _cfxBase('cfx-trapsnap',{color:'#f0a040',life:550}); _sfx('trapTrigger'); break; }
    case 'equip': { _cfxBase('cfx-ring',{color:color,life:650}); _cfxBase('cfx-icon',{text:'\u2699\uFE0F',color:color,life:700}); _sfx('select'); break; }
    default: { _cfxBase('cfx-glow',{color:color,life:650}); _sfx('cardPlay'); }
  }
}

// Public entry: call when any card is played.
function playCardFx(card){
  try{
    if(!card) return;
    const fam=_cardFxFamily(card.fx, card.type);
    _playFamilyFx(fam, card);
  }catch(e){}
}

// ── Black Tide: coin earn pop-up (uses the medal coin artwork) ──
function coinArtUrl(){
  try{ return (typeof artOverrides==='object'&&artOverrides['coin_doubloon']) || (typeof window!=='undefined'&&window._embeddedCoinArt) || null; }
  catch(e){ return null; }
}
function fxCoinPop(amount){
  try{
    const l=_fxLayer(900);
    const url=coinArtUrl();
    if(url){
      const img=document.createElement('img'); img.className='cfx-coin-pop'; img.src=url;
      l.appendChild(img);
    }
    if(amount!=null){
      const txt=document.createElement('div'); txt.className='cfx-coin-text'; txt.textContent='+'+amount+' Doubloon'+(amount>1?'s':'');
      l.appendChild(txt);
    }
    _sfx('select');
  }catch(e){}
}
// Win Medals finisher: coin pop-ups scattered all over the screen (not just centered).
function fxCoinPopBurst(amount, count){
  try{
    const url=coinArtUrl();
    const n=Math.max(6, Math.min(16, count|| (amount?Math.min(16,6+Math.floor(amount/2)):8)));
    const vw=(typeof window!=='undefined'&&window.innerWidth)||400;
    const vh=(typeof window!=='undefined'&&window.innerHeight)||800;
    for(let i=0;i<n;i++){
      const delay=Math.random()*0.5;
      setTimeout(()=>{
        try{
          const l=_fxLayer(1000);
          if(url){
            const img=document.createElement('img'); img.className='cfx-coin-pop-scatter'; img.src=url;
            // Keep coins within a comfortable central-ish band so they read clearly on small screens.
            const left=12+Math.random()*76; // 12%..88%
            const top=14+Math.random()*60;  // 14%..74%
            img.style.left=left+'%'; img.style.top=top+'%';
            img.style.setProperty('--rot0',(Math.random()*40-20)+'deg');
            img.style.setProperty('--rot1',(Math.random()*30-15)+'deg');
            img.style.setProperty('--rot2',(Math.random()*16-8)+'deg');
            const sizeJitter=44+Math.random()*22;
            img.style.width=sizeJitter+'px'; img.style.height=sizeJitter+'px';
            l.appendChild(img);
          }
        }catch(e){}
      }, delay*1000);
    }
    if(amount!=null){
      try{ fxCoinPop(amount); }catch(e){} // one centered "+N Doubloons" label so the total is still readable
    }
    _sfx('select');
    try{ if(typeof SFX==='object'&&SFX.medaforce) SFX.medaforce(); }catch(e){}
  }catch(e){}
}
// Small coin icons flying from the action toward the active bot's coin badge.
function fxCoinGather(n){
  try{
    const l=_fxLayer(700);
    const url=coinArtUrl();
    const count=Math.max(1,Math.min(6,n||1));
    for(let i=0;i<count;i++){
      const c=document.createElement('div'); c.className='cfx-coin-gather';
      if(url) c.style.backgroundImage="url('"+url+"')";
      const ang=(Math.PI*2/count)*i + Math.random()*0.4;
      const dist=70+Math.random()*40;
      c.style.left='50%'; c.style.top='55%';
      c.style.setProperty('--gx',(Math.cos(ang)*dist*0.3)+'px');
      c.style.setProperty('--gy',(-90-Math.random()*30)+'px');
      c.style.animationDelay=(i*0.05)+'s';
      l.appendChild(c);
    }
    _sfx('zap');
  }catch(e){}
}
// Powder Keg — explosive AoE burst (ring + core flash + flying debris chunks)
function fxExplodeAoE(){
  try{
    const l=_fxLayer(900);
    // Two rings for a fuller blast wave
    const ring=document.createElement('div'); ring.className='cfx-explode-ring'; l.appendChild(ring);
    const ring2=document.createElement('div'); ring2.className='cfx-explode-ring'; ring2.style.animationDelay='.08s'; ring2.style.borderColor='#ffd060'; l.appendChild(ring2);
    const core=document.createElement('div'); core.className='cfx-explode-core'; l.appendChild(core);
    for(let i=0;i<20;i++){
      const ch=document.createElement('div'); ch.className='cfx-explode-chunk';
      const ang=(Math.PI*2/20)*i, dist=140+Math.random()*120;
      ch.style.left='50%'; ch.style.top='50%';
      ch.style.setProperty('--dx',(Math.cos(ang)*dist)+'px');
      ch.style.setProperty('--dy',(Math.sin(ang)*dist)+'px');
      l.appendChild(ch);
    }
    try{ if(typeof SFX==='object'){ if(SFX.zap)SFX.zap(); if(SFX.combo)setTimeout(()=>{try{SFX.combo();}catch(e){}},80); if(SFX.medaforce)setTimeout(()=>{try{SFX.medaforce();}catch(e){}},40); } }catch(e){}
    _fxShake(); setTimeout(()=>{try{_fxShake();}catch(e){}},90);
  }catch(e){}
}

function banner(txt,color='#f0b820'){
  // Remove any existing banners so they never stack/overlap
  try{ document.querySelectorAll('.bnr').forEach(b=>b.remove()); }catch(e){}
  const el=document.createElement('div');
  el.className='bnr';el.textContent=txt;el.style.color=color;
  document.body.appendChild(el);setTimeout(()=>{ try{el.remove();}catch(e){} },1500);
}

