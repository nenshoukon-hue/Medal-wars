// ═══ PLAYER INPUT ═══
function selBot(idx){
  if(G.phase!=='action'||atked)return;
  const bot=G.p.bots[idx];if(!bot||bot.def)return;
  // Clicking a support bot triggers a quick switch (if not already switched this turn)
  if(G.p.activeBot!==idx){
    if(G.p.switched){
      log('Already switched this turn.','info');return;
    }
    switchActive('p',idx);
    G.p.switched=true;
    renderAll();return;
  }
  G.p.selCard=null;
  G.p.selBot=G.p.selBot===idx?null:idx;
  renderAll();
}

function clickCard(card){
  if(!canPlay(card))return;
  if(G_online&&!G_myTurn){log('Not your turn.','info');return;}
  SFX.cardPlay();
  // Universal play FX (medaforces & techniques have their own dedicated effects).
  if(card.type!=='medaforce'&&card.type!=='technique'){ try{ playCardFx(card); }catch(e){} }
  if(card.type==='trap'){playTrap(card);return;}
  if(card.type==='equipment'){playEquip(card);return;}
  if(card.type==='medachange'){playMC(card);return;}
  if(card.type==='action'){playAct(card);return;}
  if(card.type==='medaforce'){openMFCard(card);return;}
  // Relay ALL card plays to opponent (before branching — catches action/equip/trap/mf)
  if(G_online&&G_myTurn&&card.type!=='technique'){ MWNet.move({type:'card',uid:card.uid,id:card.id||card.uid,ctype:card.type}); _syncNow(); }
  if(card.type==='technique'){
    // Auto-select the active bot so techniques are one-tap usable
    if(G.p.selBot===null){const _ab=getActiveBot('p');if(_ab)G.p.selBot=G.p.bots.indexOf(_ab);}
    const activeB=getActiveBot('p');
    const nin=activeB&&(activeB.key==='nin_ninja'||(activeB.equip&&activeB.equip.fx==='eq_ninja_scroll'));
    if(nin){
      // Nin-Ninja: select technique then pick target (or auto-target active enemy)
      G.p.selCard=card.uid;
      // If enemy target obvious (only one alive), auto-fire
      const enemies=alive(G.c);
      if(enemies.length===1){
        ninjaFireTech(card,enemies[0]);
      } else {
        log('Shadow tech armed — tap an enemy bot!','info');
        renderAll();
      }
    } else {
      G.p.selCard=card.uid;
      renderAll();
    }
  }
}

// ── NIN-NINJA TECHNIQUE FIRE ────────────────────────────────
// Nin-Ninja fires a technique as a standalone action (no attack needed)
function ninjaFireTech(card, target){
  SFX.slash();
  const nin=getActiveBot('p');
  // Nin-Ninja OR any Shadow Blade bot equipped with the Ninja Scroll can dual-strike.
  if(!nin||(nin.key!=='nin_ninja'&&!(nin.equip&&nin.equip.fx==='eq_ninja_scroll')))return;
  // Deduct action only for first technique; 2nd is passive free
  // Shadow Slash is a FREE chain technique: it never costs an action and never uses a technique slot.
  const _isShadowSlash=(card.fx==='deal3_chain_free');
  const techNum=(G.p._techsThisTurn||0)+1;
  const isSecond=techNum===2;
  if(_isShadowSlash){
    log('Shadow Slash: FREE chain technique!','chg');
    banner('SHADOW SLASH!','#4080f0');
  } else if(techNum===1){
    if(actionsLeft<=0){log('No actions left.','info');return;}
    actionsLeft--;
  } else if(isSecond){
    log('Dual Technique: second strike FREE!','chg');
    banner('DUAL TECHNIQUE!','#4080f0');
  } else if(G.p._ninFreeExtra){
    log('Shadow Step: bonus technique!','chg');
    G.p._ninFreeExtra=false;
  } else {
    log('Dual Technique limit reached this turn.','info');
    return;
  }
  dsc(G.p,card.uid);
  if(G_online&&G_myTurn) MWNet.move({type:'card',uid:card.uid,id:card.id||card.uid,ctype:'technique',tgt:G.c.bots.indexOf(target)});
  // Shadow Slash does not consume a technique slot (free chain); everything else does.
  if(!_isShadowSlash) G.p._techsThisTurn=(G.p._techsThisTurn||0)+1;
  // Track combo count for Gokudo
  alive(G.p).forEach(b=>{if(!b.def)b._comboCount=(b._comboCount||0)+1;});
  checkKarinPassive();
  // Fire the technique damage
  const techCard=CDEFS[card.id||card.uid]||card;
  let techDmg=applyTechP(card,nin,target);
  G.p.selCard=null;
  log('Nin-Ninja '+card.name+': technique '+techNum+' fired!','atk');
  renderAll();
}

// ── KARIN PASSIVE TRACKER ─────────────────────────────────
function checkKarinPassive(){
  if(!G.p.mf||!G.p.mf.pass.includes('3+ cards'))return;
  G.p._karincards=(G.p._karincards||0)+1;
  if(G.p._karincards===3){
    drw(G.p,1);
    const gok=G.p.bots.find(b=>b.key==='gokudo'&&!b.def);
    if(gok){addChg(gok,1);}
    log('Karin: 3 cards played! Drew 1, Gokudo +1 Charge!','chg');
    banner('KARIN COMBO!','#e060f0');
  }
}

function playTrap(card){
  SFX.trapSet();
  if(actionsLeft<=0||G.pTraps.length>=3)return;
  dsc(G.p,card.uid);
  const henryFree=G.p.mf.pass.includes('free')&&!G.p._henryUsed;
  if(henryFree){G.p._henryUsed=true;log('Henry: first action free!','chg');}
  else{actionsLeft--;}
  G.pTraps.push({fx:card.fx,name:card.name,isNew:true});
  log('🪤 '+card.name+' set! Triggers on enemy turn.','eq');
  banner('🪤 TRAP SET','#40d898');
  renderAll();
  setTimeout(()=>{G.pTraps.forEach(t=>{t.isNew=false;});},400);
}

// Check & consume a player trap when CPU attacks/casts. Returns true if attack negated.
function checkPlayerTraps(trigger,attacker){
  // trigger: 'attack' or 'medaforce'
  for(let i=0;i<G.pTraps.length;i++){
    const t=G.pTraps[i];
    if(trigger==='attack'&&t.fx==='trap_block'){
      G.pTraps.splice(i,1);
      log('🪤 Iron Wall! Next attack blocked for 4 damage!','eq');
      banner('IRON WALL!','#8090a0');
      return {negate:false,reduce:4}; // not negated, but reduced
    }
    if(trigger==='attack'&&t.fx==='bt_parry'){
      G.pTraps.splice(i,1);
      const got=earnCoins('p',2);
      log('🪤 Cutlass Parry! Damage reduced by 3, +'+got+' Doubloons!','eq');
      banner('CUTLASS PARRY!','#3aa0c0');
      return {negate:false,reduce:3};
    }
    if(trigger==='attack'&&t.fx==='trap_digiblock'){
      G.pTraps.splice(i,1);
      const wg=G.p.bots.find(b=>b.key==='wargreymon'&&!b.def);
      if(wg){addChg(wg,2);log('Digi Shield: Attack negated! WarGreymon +2 Charge!','eq');}
      banner('DIGI SHIELD!','#00ff80');
      return {negate:true};
    }
    if(trigger==='attack'&&t.fx==='trap_curtain'){
      G.pTraps.splice(i,1);
      SFX.trapTrigger();log('🪤 Iron Curtain! Next attack -5 damage!','eq');banner('IRON CURTAIN!','#8090a0');
      return {reduce:5};
    }
    if(trigger==='attack'&&t.fx==='trap_counterblade'){
      G.pTraps.splice(i,1);
      G.p._ninFreeExtra=true; // Nin-Ninja free technique next turn
      log('🪤 Counter Blade! Attack negated! Nin-Ninja gets free technique!','eq');
      banner('COUNTER BLADE!','#4080f0');
      return {negate:true};
    }
    if(trigger==='attack'&&t.fx==='trap_honor'){
      G.pTraps.splice(i,1);
      // Redirect damage to Omegaknight
      const omega=G.p.bots.find(b=>b.key==='omegaknight'&&!b.def);
      if(omega&&attacker){
        log('🪤 Honor Guard! Damage redirected to Omegaknight!','eq');
        banner('HONOR GUARD!','#f0c040');
        return {negate:false,redirect:omega};
      }
    }
    if(trigger==='attack'&&t.fx==='trap_negate'){
      G.pTraps.splice(i,1);
      log('🪤 Guard Break! '+(attacker?attacker.name:'Enemy')+'\'s attack negated!','eq');
      SFX.trapTrigger();banner('GUARD BREAK!','#40d898');
      return {negate:true};
    }
    if(trigger==='attack'&&t.fx==='trap_reflect'){
      G.pTraps.splice(i,1);
      log('🪤 Mirror Plate! Attack reflected — 4 dmg to '+(attacker?attacker.name:'attacker')+'!','eq');
      banner('MIRROR PLATE!','#2a80f0');
      if(attacker)dmg(attacker,4,G.c.bots.includes(attacker)?'c':'p');
      return {negate:true};
    }
    if(trigger==='medaforce'&&t.fx==='trap_nullmf'){
      G.pTraps.splice(i,1);
      log('🪤 Null Field! Enemy Medaforce cancelled!','eq');
      banner('NULL FIELD!','#9070f0');
      return {negate:true};
    }
  }
  return {negate:false};
}

function atkEnemy(idx){
  if(G_online&&!G_myTurn){log('Not your turn.','info');return;}
  const d=G.c.bots[idx];
  if(!d||d.def)return;
  // Determine if this attack is RANGED (can snipe back-row support bots).
  // Ranged = Seagaru (beetle_gun) attacking, OR a ranged technique card is selected.
  const _atkBot = (G.p.selBot!==null)?G.p.bots[G.p.selBot]:getActiveBot('p');
  let _isRanged = false;
  if(_atkBot && _atkBot.key==='beetle_gun') _isRanged=true;
  if(G.p.selCard){
    const _sc=G.p.hand.find(c=>c.uid===G.p.selCard)||G.p.deck.find(c=>c.uid===G.p.selCard);
    if(_sc && (_sc.fx==='cm_buster'||_sc.fx==='cm_skyvolley')) _isRanged=true;
  }
  // You can only attack the enemy's ACTIVE (front) bot — UNLESS the attack is ranged.
  if(idx!==G.c.activeBot && !_isRanged){
    log('You can only attack the active bot \u2014 support bots are protected. (Ranged attacks can snipe the back row.)','info');
    return;
  }
  if(idx!==G.c.activeBot && _isRanged){
    log('\ud83c\udfaf Ranged attack \u2014 sniping '+d.name+' in the back row!','atk');
  }
  // If Nin-Ninja has a technique selected, fire it as standalone
  const activeB=getActiveBot('p');
  if(activeB&&activeB.key==='nin_ninja'&&G.p.selCard){
    const card=G.p.hand.find(c=>c.uid===G.p.selCard)||G.p.deck.find(c=>c.uid===G.p.selCard);
    if(card){ninjaFireTech(card,d);return;}
  }
  if(atked){log('Already attacked this turn.','info');return;}
  if(G.p.selBot===null){log('Select your attacker first.','info');return;}
  const a=G.p.bots[G.p.selBot];
  if(!a||a.def)return;
  if(a.key==='kensho'){log('Kensho is the Reader \u2014 it never attacks. It holds your Stances and anchors Zanshin.','info');return;}
  if(a.exhst){log(a.name+' is exhausted and cannot attack this turn.','info');return;}
  const _atkCard=G.p.selCard; // capture before resolve clears state
  // Ranged snipe at a support bot deals reduced damage (front bot takes full).
  G._snipeTarget = (idx!==G.c.activeBot);
  // Pirastar's Cannonade: may spend 3 Doubloons before attacking for +5 dmg.
  if(a.key==='taraba_craba' && coins('p')>=3 && !G._cannonadeAsked){
    G._cannonadeAsked=true;
    openM('Cannonade',
      'Spend <b style="color:#d4a020">3 Doubloons</b> for <b style="color:#e0603a">+5 damage</b> on this attack? (You have '+coins('p')+'.)',
      [
        {l:'\ud83d\udca5 Spend 3 — +5 DMG',cls:'mb bad',cb:()=>{
          spendCoins('p',3); a._cannonadeBonus=5;
          try{ fxCoinPop(3); }catch(e){}
          log('Cannonade: spent 3 Doubloons for +5 damage!','atk');
          closeM(); _finishAtkEnemy(a,d,idx,_atkCard);
        }},
        {l:'Skip',cls:'mb',cb:()=>{ closeM(); _finishAtkEnemy(a,d,idx,_atkCard); }}
      ]);
    return;
  }
  G._cannonadeAsked=false;
  _finishAtkEnemy(a,d,idx,_atkCard);
}
function _finishAtkEnemy(a,d,idx,_atkCard){
  resolveAtk(a,d,'p',_atkCard);
  G._snipeTarget = false;
  G._cannonadeAsked=false;
  try{ if(typeof itutOnAttack==='function') itutOnAttack(); }catch(e){}
  if(G_online&&G_myTurn){
    // Attacker's result is authoritative — send defender's exact post-attack state
    MWNet.move({type:'attack',target:idx,card:_atkCard||null,after:{hp:d.hp,def:!!d.def,burn:d.burn||0}});
    _syncNow();
  }
  G.p.selBot=null;G.p.selCard=null;
}

// ═══ BLACK TIDE — Doubloon economy helpers (cap 15) ═══
const DOUBLOON_CAP=15;
function earnCoins(sk,n){
  if(!G||!G[sk])return 0;
  const before=G[sk]._doubloons||0;
  const after=Math.min(DOUBLOON_CAP, before+n);
  G[sk]._doubloons=after;
  const got=after-before;
  if(got>0&&sk==='p'){ try{ fxCoinPop(got); fxCoinGather(got); }catch(e){} }
  return got;
}
function spendCoins(sk,n){
  if(!G||!G[sk])return false;
  if((G[sk]._doubloons||0)<n)return false;
  G[sk]._doubloons-=n;
  return true;
}
function coins(sk){ return (G&&G[sk])?(G[sk]._doubloons||0):0; }

function resolveAtk(a,d,sk,techId){
  let total=a.atk;
  // ── ZERO medal Charge Mastery: +1 dmg per 2 Charge held ──
  if(a&&(a.medal==='zero'||a.fusedMedal==='zero')){
    total+=Math.floor((a.charge||0)/2);
    // At max Charge, attacks deal +4 (Cross Messiah's burst payoff)
    if((a.charge||0)>=5){ total+=4; }
  }
  // Cross Messiah Z (medachanged): Overcharge — even bigger charge scaling
  if(a&&a.key==='cross_messiah'&&a.changed){ total+=Math.floor((a.charge||0)/2); }
  // Beetle Gun (Seagaru) Charge Buster: +2 at 4+ Charge (+4 if medachanged)
  if(a&&a.key==='beetle_gun'&&(a.charge||0)>=4){ total+=(a.changed?4:2); }
  // Grand Beetle Master Frame: +1 ATK per equipment attached
  if(a&&a.key==='grand_beetle'){ total+=(a.equips||[]).length; }
  // Power Conduit threshold: 3+ equipment in play → +1 ATK to all your bots
  if(a&&forgeCount(sk)>=3 && G[sk].bots.some(b=>!b.def&&botEquips(b).some(e=>e.fx==='fb_conduit'))){ total+=1; }
  // Forge medal + Targeting Array: pierce damage reduction
  if(a&&(a.medal==='forge'||a.fusedMedal==='forge')){ a._pierceThisHit=(a._pierceThisHit||0)+1; }
  if(a&&a._pierceNext){ a._pierceThisHit=(a._pierceThisHit||0)+a._pierceNext; a._pierceNext=0; }
  // Forge Core threshold: 5+ equipment → unblockable
  if(a&&forgeCount(sk)>=5 && G[sk].bots.some(b=>!b.def&&botEquips(b).some(e=>e.fx==='fb_forgecore'))){ a._forgeUnblock=true; }
  // Iron Throne: solo Emperor takes -1 from each attack (outnumbered 1v3)
  let _emperorSoak=(d&&d.key==='robo_emperor'&&G.c.bots&&G.c.bots.includes(d)&&G.c.bots.filter(b=>!b.def).length===1)?3:0;
  if(d&&d.equip&&d.equip.fx==='gen_bulwark') _emperorSoak+=1; // Bulwark: -1 dmg
  if(d&&d.key!=='robo_emperor') _emperorSoak=Math.min(_emperorSoak,1); // cap stacked reduction
  if(!_emperorSoak && d&&d.key==='robo_emperor'&&G.p.bots&&G.p.bots.includes(d)&&G.p.bots.filter(b=>!b.def).length===1) _emperorSoak=3;
  // Counter Strike — if attacker was marked, they take burn before hitting
  if(a._counterMarked){
    a._counterMarked=false;
    const burnSide=sk==='p'?'c':'p';
    dmg(a,3,sk);
    log('Counter Strike triggered! '+a.name+' takes 3 burn before attacking!','atk');
    if(a.def)return; // if the counter killed them, stop
  }
  // Last Stand combat bonuses (attacker side)
  const lsA=getLastStand(sk);
  if(lsA&&lsA.bot===a){
    if(a.key==='metabee'){total+=2*lsA.medalCount;log('Metabee BERSERKER: +'+(2*lsA.medalCount)+' ATK!','chg');}
    if(a.key==='machairodus'&&(a._machLSAtk||0)>0){total+=a._machLSAtk;log('APEX Last Stand: +'+a._machLSAtk+' ATK!','chg');}
    if(a.key==='omegaknight'&&a._sovereignLS){total+=2*lsA.medalCount;log('SOVEREIGN: +'+(2*lsA.medalCount)+' ATK & piercing!','chg');}
    if(a.key==='robo_emperor'&&a._dominionLS){total+=3*lsA.medalCount;}
    if(a.key==='nin_ninja'&&a._shadowCloneLS){total+=2*lsA.medalCount;}
    if(a.key==='gokudo'&&a._finalShotLS){/* bonus applied via comboCount */}
    if(a.key==='wargreymon'&&a._terraForceLS){
      total+=3*lsA.medalCount;
      // Terra Force: hit ALL enemies
      alive(sk==='p'?G.c:G.p).filter(b=>b!==d).forEach(b=>{dmg(b,total,'p');});
      log('TERRA FORCE: All enemies hit!','atk');banner('TERRA FORCE!','#f0c040');
    }
    if(a.key==='metalgurumemon'&&a._fullBurstLS){total+=2*lsA.medalCount;}
  }
  // Machairodus Stalk bonus
  if(a.key==='machairodus'&&(a._stalkReady||a._stalwaysOn)){
    total+=3;log('Machairodus STALK: +3 DMG!','chg');banner('STALK!','#9050d0');
    if(!a._stalwaysOn)a._stalkReady=false;
  }
  // Ninja Scroll ATK bonus
  if(a.equip&&a.equip.fx==='eq_ninja_scroll'){total+=2;}
  if(a.equip&&a.equip.fx==='eq_cannon_array'){total+=2;}
  if(a.equip&&a.equip.fx==='bt_coincannon'){total+=1;} // Coin Cannon +1 dmg
  if(a._cannonadeBonus){ total+=a._cannonadeBonus; delete a._cannonadeBonus; } // Pirastar Cannonade
  // Spider Web buff on Spidarman
  if(a.key==='spidarman'&&(a._spiderWebBuff||0)>0){total+=a._spiderWebBuff;}
  // Dramon Destroyer — WarGreymon +3 DMG vs equipped bots
  if(a.key==='wargreymon'&&d.equip){
    const dramonBonus=a._dramonBonus||3;
    total+=dramonBonus;log('Dramon Destroyer: +'+dramonBonus+' vs equipped bot!','chg');banner('DRAMON!','#f0c040');
  }
  // Predator Mark bonus — +4 DMG when Machairodus targets marked bot
  if(a.key==='machairodus'&&d._predatorMark){
    total+=4;d._predatorMark=false;
    log('PREDATOR MARK: +4 DMG!','chg');banner('MARKED!','#9050d0');
  }
  if(G.boostActive===a.key){total+=2;G.boostActive=null;log(a.name+' boosted: +2 ATK!','chg');}
  // Sacrifice Play ATK bonus
  if(a.key==='omegaknight'&&(a._sacrificeBonus||0)>0){total+=a._sacrificeBonus;log('Sacrifice bonus: +'+a._sacrificeBonus+' ATK!','chg');a._sacrificeBonus=0;}
  // Tai passive ATK bonus
  if((a._taiBonus||0)>0){total+=a._taiBonus;}
  // Gokudo Combo Cannon: +1 per technique played this turn
  if(a.key==='gokudo'&&(a._comboCount||0)>0){
    const bonus=a._comboCount*(a._finalShotLS?4:2); // Combo Cannon buffed: +2 per tech (×2 on Final Shot)
    total+=bonus;
    if(a._finalShotLS){G._pierceDmg=true;log('FINAL SHOT: Combo ×2 pierce!','chg');}
  }
  // Royal medal: +1 ATK per ally fallen this turn
  if((a.medal==='royal'||a.fusedMedal==='royal')&&(G._royalFallen||0)>0){
    total+=G._royalFallen;
    log('Royal Medal: +'+(G._royalFallen)+' ATK for fallen allies!','chg');
  }
  // EVOLUTION ENGINE: every Royal bot gains +2 ATK per evolution performed this game.
  {
    const _evoSide = (sk==='p')?G.p:G.c;
    const _isRoyalBot = ['omegaknight','wargreymon','metalgurumemon'].includes(a.key);
    const _evo = _evoSide._evolveCount||0;
    if(_isRoyalBot && _evo>0){
      total += _evo*2;
      log('Evolution Surge: +'+(_evo*2)+' ATK ('+_evo+' evolutions)!','chg');
    }
    // An evolved Royal bot hits even harder (its own evolution rewarded)
    if(_isRoyalBot && a.changed){ total += 2; }
  }
  if(a.medal==='blaze'||a.fusedMedal==='blaze')total+=2;
  if(a.equip&&a.equip.fx==='eq_blaze_arm')total+=2;
  if(a.equip&&a.equip.fx==='eq_hunter'&&d.hp<=d.maxHp/2)total+=3;
  const mcAtkBonus=a.key==='rokusho'?4:5;
  if(a.changed)total+=mcAtkBonus;
  let tech=null;
  if(techId){const _side=G[sk]||G.p;tech=_side.hand.find(c=>c.uid===techId);if(tech){dsc(_side,techId);_lastTech=tech.name;total+=applyTech(tech,a,d,sk);}}else{_lastTech=null;}
  // Metabee passive: burn target = +2 bonus
  // Sumilidon RAVAGER: +1 DMG per 5 HP missing (more wounded = deadlier)
  if(a.key==='sumilidon'){
    const missing=Math.max(0,(a.maxHp||0)-(a.hp||0));
    const mult=a._ravagerDouble?2:1;
    const rav=Math.floor(missing/5)*mult;
    if(rav>0){ total+=rav; log('Sumilidon RAVAGER: +'+rav+' DMG (wounded fury)!','chg'); }
  }
  if(a.key==='metabee'&&d.burn){total+=1;log('Metabee passive: 🔥 burn bonus +1!','chg');
    if(lsA&&lsA.bot===a){total+=1*lsA.medalCount;log('BERSERKER: +'+(1*lsA.medalCount)+' burn dmg!','chg');}
  }
  // Rokusho passive: incoming -1 (applied in dmg fn via bot.key check)
  log(a.name+' → '+d.name+': '+total+' DMG!','atk');
  banner(total+' DMG',a.color||'#f06424');
  if(total>G.maxDmg){G.maxDmg=total;G.maxDmgBot=a.name;G.maxDmgCard=_lastTech||'basic attack';}
  // Warbandit DESPERADO: attacks pierce damage reduction
  if(lsA&&lsA.bot===a&&a.key==='warbandit'){G._pierceDmg=true;}
  // Machairodus support pierce (when in support zone)
  const activeP=getActiveBot(sk);
  if(activeP&&activeP._machPierce){G._pierceDmg=true;activeP._machPierce=false;}
  // Masterbeetle: ignores enemy damage reduction
  if(a&&a._fusionPierce){ G._pierceDmg=true; }
  total=Math.max(0,total-(_emperorSoak||0));
  // Ranged snipe at a back-row support bot: reduced damage (active bot takes full).
  if(G._snipeTarget){
    total=Math.max(1,Math.ceil(total*0.5));
    log('Ranged snipe \u2014 reduced damage past the front line ('+total+').','atk');
  }
  if(a&&a._masterAoE){
    // Master form: Prominence railgun hits the active target for full damage,
    // and SPLASHES other enemies for half (rounded down). Prevents one-shotting whole teams.
    const foes=alive(sk==='p'?G.c:G.p).slice();
    const splash=Math.floor(total/2);
    foes.forEach(f=>{
      const dealt = (f===d) ? total : splash;
      dmg(f,dealt,sk==='p'?'c':'p');
    });
    log('Prominence Railgun: '+total+' to '+d.name+', '+splash+' splash to the rest!','atk');
  } else {
    dmg(d,total,sk==='p'?'c':'p');
  }
  G._pierceDmg=false;
  // Shadow Slash (chain-free): does NOT consume the attack — player may act again
  const _techObj = techId ? (G[sk].hand.find(c=>c.uid===techId)||G[sk].discard&&G[sk].discard.find(c=>c.uid===techId)) : null;
  const _isChainFree = (_lastTech==='Shadow Slash') || (_techObj && _techObj.fx==='deal3_chain_free');
  if(_isChainFree && sk==='p'){
    log('Shadow Slash chained — you may attack again!','chg');
  } else {
    atked=true;
  }
  // Lance Charge: costs 2 charge to attacker
  if(a._lanceCostPending){a._lanceCostPending=false;a.charge=Math.max(0,a.charge-2);log('Lance Charge: '+a.name+' loses 2 Charge!','chg');}
  // Machairodus: flag that we attacked (resets stalk)
  if(a.key==='machairodus')a._stalkedThisTurn=true;

  // Arcbeetle passive: +1 charge after attacking
  if(a._fusionCharge){addChg(a,1);log('Masterbeetle: +1 Charge after attack!','chg');}
  if(a.key==='arcbeetle'&&d&&!d.def){d.charge=Math.max(0,(d.charge||0)-2);log('Arcbeetle Disruptor: '+d.name+' loses 2 Charge!','chg');}
  // Warbandit support draw
  if(a._warbDraw){drw(G.p,1);a._warbDraw=false;log('Warbandit support: drew 1 card!','chg');}
  // Foxuno Battle Remedy: heal lowest-HP ally after attacking
  if(a.key==='foxuno'&&sk==='p'){
    const lowest=alive(G.p).filter(b=>b!==a).sort((a,b)=>a.hp-b.hp)[0];
    if(lowest){lowest.hp=Math.min(lowest.maxHp,lowest.hp+2);log('Battle Remedy: healed '+lowest.name+' +2 HP!','chg');}
  }
  // Gokudo Combo Cannon: +1 DMG per technique played this turn
  if(a.key==='gokudo'&&sk==='p'&&(a._comboCount||0)>0){
    log('Combo Cannon: +'+a._comboCount+' DMG from '+a._comboCount+' techniques this turn!','chg');
    try{ fxComboCannon(); }catch(e){}
  }
  // ── PLUNDER medal: earn Doubloons on attack ──
  if(a&&a.medal==='plunder'){
    let earn=2;
    if(a.key==='piraskull')earn+=1;               // Captain's Cut
    if(a.equip&&a.equip.fx==='bt_coincannon')earn+=1; // Coin Cannon
    const got=earnCoins(sk,earn);
    if(got>0&&sk==='p')log('Plunder: +'+got+' Doubloon'+(got>1?'s':'')+' (now '+coins('p')+').','chg');
  }
  // CPU MetalGurumemon missile barrage
  if(a.key==='metalgurumemon'&&sk==='c'){
    const others=alive(G.p).filter(b=>b!==d);
    if(others.length){const mt=others[Math.floor(Math.random()*others.length)];dmg(mt,1,'p');log('CPU Missile Barrage: 1 DMG to '+mt.name+'!','atk');}
  }
  // CPU WarGreymon dramon destroyer
  if(a.key==='wargreymon'&&d.equip){total+=3;}
  // Cyandog swift: draw 1 after each attack
  if(a.key==='metalgurumemon'&&sk==='p'){
    const missileCount=a._doubleBarrage?2:1;
    for(let _m=0;_m<missileCount;_m++){
      const others=alive(G.c).filter(b=>b!==d);
      if(others.length){
        const mt=others[Math.floor(Math.random()*others.length)];
        dmg(mt,1,'c');log('Missile Barrage: 1 DMG to '+mt.name+'!','atk');
      }
    }
  }
  // Warbandit passive: draw 1 when technique used and hand ≤ 2
  // (checked in applyTech)
  const thr=a.changed&&a.medal==='lightning'?2:4;
  if((a.medal==='lightning'||a.fusedMedal==='lightning')&&total>=thr&&!a._dbl){
    a._dbl=true;
    setTimeout(()=>{
      if(!G.winner&&alive(G.c).length){
        const t=alive(G.c)[0];
        const d2=a.atk+(a.changed?(a.key==='rokusho'?4:5):0)+(a.equip&&a.equip.fx==='eq_blaze_arm'?2:0);
        log('Lightning DOUBLE on '+t.name+'!','atk');banner('DOUBLE ATTACK!','#2a80f0');
        dmg(t,d2,'c');
      }
      a._dbl=false;if(!G.winner)renderAll();
    },650);
  }
  if(a.equip&&a.equip.fx==='eq_fury'&&!a._fury){
    a._fury=true;
    setTimeout(()=>{
      if(!G.winner&&alive(G.c).length){
        const t=alive(G.c).sort((x,y)=>x.hp-y.hp)[0];
        const d2=a.atk+(a.equip&&a.equip.fx==='eq_blaze_arm'?2:0);
        log('Fury Core 2nd strike on '+t.name+'!','atk');
        dmg(t,d2,'c');
      }
      a._fury=false;if(!G.winner)renderAll();
    },750);
  }
  if(!G.winner)renderAll();
}

function applyTech(c,a,d,sk){
  const fx=c.fx;let b=0;
  // Universal technique FX (player side only — CPU techniques are logged, not flashed).
  if(sk==='p'){ try{ playCardFx(c); }catch(e){} }
  // ── BLACK TIDE techniques ──
  if(fx==='bt_deal3_coin2'){
    const got=earnCoins(sk,2);
    if(sk==='p')log('Plunderstrike: +3 dmg, +'+got+' Doubloons (now '+coins('p')+').','chg');
    return 3;
  }
  if(fx==='bt_powderkeg'){
    const have=coins(sk);
    const spend=Math.min(5,have);
    spendCoins(sk,spend);
    const per=2+2*spend;
    const foes=alive(sk==='p'?G.c:G.p);
    // Primary target gets damage via return; other foes hit directly here.
    foes.forEach(t=>{ if(t!==d) dmg(t,per,sk); });
    if(sk==='p')log('Powder Keg: spent '+spend+' Doubloons — '+per+' dmg to ALL enemies!','atk');
    try{ fxExplodeAoE(); }catch(e){}
    return per; // primary target
  }
  // ── CROSS MESSIAH charge-scaling techniques ──
  if(fx==='cm_blade'){ b=3+Math.floor((a.charge||0)/2); log('Charge Blade: +'+b+' (scaled with Charge)!','atk'); return b; }
  if(fx==='cm_buster'){ b=2+((a.charge||0)>=4?2:0); log('Charge Buster: +'+b+'!','atk'); return b; }
  if(fx==='cm_skyvolley'){ b=((a.charge||0)>=4)?5:3; log('Sky Volley: +'+b+' ranged barrage!','atk'); return b; }
  if(fx==='cm_stagsword'){ b=((a.charge||0)>=4)?4:2; log('Stag Sword: +'+b+'!','atk'); return b; }
  if(fx==='cm_kabutodrive'){ b=5; a.charge=Math.max(0,(a.charge||0)-3); log('Kabuto Drive: +5, spent 3 Charge!','atk'); return b; }
  // ── Shadow / Royal / Combo techniques (also playable as normal attacks) ──
  {
    const mySide=(sk==='p')?G.p:G.c;       // attacker's side
    const drawSide=mySide;
    if(fx==='deal3_chain_free'){ b=3; log('Shadow Slash: +3 to '+d.name+'!','atk'); return b; }
    if(fx==='deal2_combo'){ b=2; const gok=alive(mySide).find(x=>x.key==='gokudo'&&!x.def); if(gok){gok._comboCount=(gok._comboCount||0)+1;log('Blade Dance: Gokudo combo+1!','chg');} return b; }
    if(fx==='deal4_exhaust'){ b=4; if(d){d.exhst=true;} log('Phantom Cut: +4, '+(d?d.name:'')+' exhausted!','atk'); return b; }
    if(fx==='deal3_draw_chain'){ b=3; drw(drawSide,1); log('Fox Fang: +3 + drew 1!','chg'); return b; }
    if(fx==='deal4_combo_boost'){ b=4; const gok=alive(mySide).find(x=>x.key==='gokudo'&&!x.def); if(gok){gok._comboCount=(gok._comboCount||0)+2;log('Cannon Blast: Gokudo +2 combo!','chg');} return b; }
    if(fx==='deal3_exhaust'){ b=3; if(d){d.exhst=true;} log('Royal Decree: +3, '+(d?d.name:'')+' exhausted!','atk'); return b; }
    if(fx==='deal3_nova'){ b=3; alive(sk==='p'?G.c:G.p).forEach(t=>{ if(t!==d) dmg(t,1,sk==='p'?'c':'p'); }); log('Nova Force: +3 and splash 1 to others!','atk'); return b; }
    if(fx==='deal2_volley'){ b=2; alive(sk==='p'?G.c:G.p).forEach(t=>{ if(t!==d) dmg(t,1,sk==='p'?'c':'p'); }); log('Missile Volley: +2 and 1 to others!','atk'); return b; }
    if(fx==='deal2_web'){ b=2; if(d){d._webbed=2;} log('Web Trap: +2 and '+(d?d.name:'')+' webbed!','atk'); return b; }
    if(fx==='deal3_counter'){ b=3; log('Counter Strike: +3!','atk'); return b; }
    if(fx==='deal4_first'){ b=4; log('Swift Strike: +4 first hit!','atk'); return b; }
    if(fx==='deal5_dramon'){ b=5; log('Dramon Strike: +5!','atk'); return b; }
    if(fx==='deal5_pierce'){ b=5; G._pierceDmg=true; log('Lance Charge: +5 pierce!','atk'); return b; }
    if(fx==='deal_sb_cut'){ const inStance=!!a._stance; b=inStance?6:4; log('Crossing Cut: +'+b+(inStance?' (Stance bonus!)':'')+'!','atk'); return b; }
    if(fx==='deal_sb_pierce'){ b=5; G._pierceDmg=true; log('Still Strike: +5, ignores defense!','atk'); return b; }
    if(fx==='deal_sb_bind'){ b=3; if(d){d._bound=2;} log('Binding Edge: +3, '+(d?d.name:'')+' Bound!','atk'); return b; }
  }
  // ── Forge Barons sacrifice techniques: destroy own equipment for effect ──
  if(fx==='fb_scrapblast'){
    if(_destroyOneEquip(a)){ b=5+(a&&a._sacBonus?a._sacBonus:0); log('Scrap Blast: destroyed equipment for +'+b+' DMG!','atk'); }
    else { b=0; log('Scrap Blast: no equipment to destroy (no bonus).','info'); }
    return b;
  }
  if(fx==='fb_salvagestrike'){
    if(_destroyOneEquip(a)){ b=(3+(a&&a._sacBonus?a._sacBonus:0)); drw(G[sk],1); log('Salvage Strike: +3 DMG and drew a card!','atk'); }
    else { b=0; log('Salvage Strike: no equipment to destroy.','info'); }
    return b;
  }
  if(fx==='fb_overloadslam'){
    const n=_destroyAllEquip(a);
    b=n*2; if(n>0) log('Overload Slam: destroyed '+n+' equipment for +'+b+' DMG!','atk'); else log('Overload Slam: no equipment (no bonus).','info');
    return b;
  }
  if(fx==='gen_surge'){ b=(a.hp<a.maxHp/2)?6:4; return b; }
  if(fx==='gen_pile'){ b=3; d._noSwitch=true; return b; }
  if(fx==='deal5_burn'||fx==='deal6_burn'){
    b=fx==='deal6_burn'?6:5;d.burn=true;d.burnAmt=1;
  }else if(fx==='deal3_burn_all'){
    b=2;
    alive(G.c).forEach(t=>{t.burn=true;t.burnAmt=1;});
    log('Flame Whip: ALL enemies burning!','atk');showBurnAll();
  }else if(fx==='deal2_scorch'){
    if(d.burn){b=4;log('Scorch: burn bonus → +4!','atk');banner('SCORCH!','#f06424');}
    else b=2;
  }else if(fx==='deal1_ember'){
    b=1;d.burn=true;d.burnAmt=1;addChg(a,2);log('Ember Bolt: burn+2chg!','chg');
  }else if(fx==='deal4_chain'){
    b=4;const o=alive(G.c).find(x=>x!==d);if(o)dmg(o,2,'c');
  }else if(fx==='deal3_charge'){
    b=3;addChg(a,1);
  }else if(fx==='deal3_drain'){
    b=3;d.charge=Math.max(0,d.charge-2);
  }else if(fx==='deal5_drain'){
    b=5;d.charge=Math.max(0,d.charge-2);
  }else if(fx==='deal2_heal'){
    b=2;a.hp=Math.min(a.maxHp,a.hp+2);flt('+2','heal');
  }else if(fx==='deal2_draw'){
    b=2;drw(G.p,1);
  }
  // Warbandit WILDFIRE: if a Warbandit is in play on the acting side and this technique
  // set a target ablaze, spread 1 burn to another (non-burning) enemy.
  try{
    const myBots = (sk==='c') ? G.c.bots : G.p.bots;
    const foes   = alive((sk==='c') ? G.p : G.c);
    const hasWarbandit = myBots.some(x=>x.key==='warbandit'&&!x.def);
    if(hasWarbandit && d && d.burn){
      const spreadTo = foes.find(t=>t!==d && !t.def && !t.burn);
      if(spreadTo){
        spreadTo.burn=true; spreadTo.burnAmt=Math.max(1, d.burnAmt||1);
        log('Warbandit WILDFIRE: burn spreads to '+spreadTo.name+'!','chg');
        try{ if(typeof flt==='function') flt('\ud83d\udd25','atk'); }catch(e){}
      }
    }
  }catch(e){}
  return b;
}


// Refund a targeted action card if the player cancels at its prompt.
function _cancelAction(){
  try{
    const r=G._actRestore;
    if(r){
      if(r.card){ G.p.hand.push(r.card); }
      actionsLeft=r.actions;
      G.p._henryUsed=r.henryUsed;
    }
  }catch(e){}
  G._actRestore=null;
  G.p.selCard=null;
  closeM();
  log('Action cancelled — card and action refunded.','info');
  renderAll();
}
function playAct(card){
  if(actionsLeft<=0)return;
  // Snapshot for cancel-refund (targeted actions that the player may back out of)
  const _henryWasUsed=G.p._henryUsed;
  G._actRestore={ card:JSON.parse(JSON.stringify(card)), actions:actionsLeft, henryUsed:_henryWasUsed };
  dsc(G.p,card.uid);
  // Henry passive: first action each turn costs nothing
  const henryFree = G.p.mf.pass.includes('free') && !G.p._henryUsed;
  if(henryFree){G.p._henryUsed=true;log('Henry: first action is free!','chg');}
  else{actionsLeft--;log(actionsLeft>0?'Action used — '+actionsLeft+' remaining.':'Action used.','info');}
  const fx=card.fx;

  // ── SENBEI: Stances, Resonance, card flow ──
  if(fx==='act_sb_bound'||fx==='act_sb_exposed'||fx==='act_sb_exec'){
    const key=fx==='act_sb_bound'?'bound':(fx==='act_sb_exposed'?'exposed':'exec');
    const botKey=key==='bound'?'gobanko':(key==='exposed'?'samurai':'shinsaber');
    const b=alive(G.p).find(x=>x.key===botKey);
    if(!b){ log('That bot has fallen \u2014 cannot hold its Stance.','info'); _cancelAction(); return; }
    G.p._stances[key]=true; b._stance=key;
    const nm=key==='bound'?'Bound':(key==='exposed'?'Exposed':'Execution');
    log(b.name+' enters the '+nm+' Stance.','chg');
    if(typeof banner==='function')banner(nm.toUpperCase()+' STANCE','#c83232');
    try{ playCardFx(card); }catch(e){}
    renderAll();if(G_online&&G_myTurn)_syncNow();return;
  }
  if(fx==='act_sb_focus'){
    G.p._resonance=(G.p._resonance||0)+1; drw(G.p,1);
    log('Focus: +1 Resonance (now '+G.p._resonance+') and drew 1.','chg');
    try{ playCardFx(card); }catch(e){}
    renderAll();if(G_online&&G_myTurn)_syncNow();return;
  }
  if(fx==='act_sb_read'){
    const all3=G.p._stances.bound&&G.p._stances.exposed&&G.p._stances.exec;
    drw(G.p,all3?3:2);
    log('Read the Blade: drew '+(all3?3:2)+(all3?' (all Stances active!)':'')+'.','chg');
    try{ playCardFx(card); }catch(e){}
    renderAll();if(G_online&&G_myTurn)_syncNow();return;
  }
  if(fx==='act_sb_guard'){
    G.p._sbGuard=true;
    alive(G.p).forEach(b=>{ b._sbGuard=true; });
    log('Remaining Guard: your bots take 2 less damage until your next turn.','eq');
    if(typeof banner==='function')banner('REMAINING GUARD','#e8d0a0');
    try{ playCardFx(card); }catch(e){}
    renderAll();if(G_online&&G_myTurn)_syncNow();return;
  }
  // ── BLACK TIDE actions ──
  if(fx==='bt_bank4'){
    const got=earnCoins('p',4);
    log('Buried Treasure: +'+got+' Doubloons (now '+coins('p')+').','chg');
    if(typeof banner==='function')banner('+'+got+' DOUBLOONS','#d4a020');
    try{ playCardFx(card); }catch(e){}
    renderAll();if(G_online&&G_myTurn)_syncNow();return;
  }
  if(fx==='bt_raid'){
    if(coins('p')<4){ log('Raid the Hold needs 4 Doubloons.','info'); _cancelAction(); return; }
    spendCoins('p',4);
    drw(G.p,2);
    const ab=getActiveBot('p'); if(ab&&!ab.def){ addChg(ab,1); }
    log('Raid the Hold: drew 2 + 1 charge (Doubloons now '+coins('p')+').','chg');
    try{ playCardFx(card); }catch(e){}
    renderAll();if(G_online&&G_myTurn)_syncNow();return;
  }
  if(fx==='cm_fullcharge'){
    const targets=alive(G.p).filter(b=>!b.def);
    openM('Full Charge','Fill which bot to MAX Charge?', targets.map(b=>({l:b.name+' ('+b.charge+'/5)',cls:'mb ok',cb:()=>{
      addChg(b,5-b.charge); log('Full Charge: '+b.name+' charged to MAX!','chg'); if(typeof banner==='function')banner('FULL CHARGE!','#d8dde8');
      closeM();renderAll();if(G_online&&G_myTurn)_syncNow();
    }})).concat([{l:'Cancel',cls:'mb',cb:()=>{_cancelAction();}}]));
    return;
  }
  if(fx==='cm_overcharge'){
    const act=getActiveBot('p');
    if(act){ addChg(act,3); }
    alive(G.p).forEach(b=>{ if(b!==act) addChg(b,1); });
    log('Overcharge: +3 active, +1 to all allies!','chg');
    if(typeof banner==='function')banner('OVERCHARGE!','#7fc0ff');
    renderAll(); if(G_online&&G_myTurn)_syncNow();
    return;
  }
  if(fx==='cm_lunarrepair'){
    const wounded=alive(G.p).filter(b=>!b.def);
    openM('Lunar Repair','Heal which ally? (+5 HP, +2 Charge)', wounded.map(b=>({l:b.name+' ('+b.hp+'/'+b.maxHp+', '+b.charge+'/5)',cls:'mb ok',cb:()=>{
      b.hp=Math.min(b.maxHp,b.hp+5); addChg(b,2);
      log('Lunar Repair: '+b.name+' +5 HP, +2 Charge!','eq');
      if(typeof banner==='function')banner('LUNAR REPAIR','#7fc0ff');
      closeM();renderAll();if(G_online&&G_myTurn)_syncNow();
    }})).concat([{l:'Cancel',cls:'mb',cb:()=>{_cancelAction();}}]));
    return;
  }
  if(fx==='fb_nanomend'){
    const wounded=alive(G.p).filter(b=>!b.def);
    const heal=alive(G.p).some(b=>b.key==='neutranurse')?9:6;
    openM('Nano-Mend','Heal which bot? (+'+heal+' HP)', wounded.map(b=>({l:b.name+' ('+b.hp+'/'+b.maxHp+')',cls:'mb',cb:()=>{b.hp=Math.min(b.maxHp,b.hp+heal);log('Nano-Mend: +'+heal+' HP to '+b.name+'.','eq');closeM();renderAll();if(G_online&&G_myTurn)_syncNow();}})).concat([{l:'Cancel',cls:'mb ok',cb:()=>{_cancelAction();}}]));
    return;
  }
  if(fx==='fb_fieldweld'){
    const wounded=alive(G.p).filter(b=>!b.def);
    openM('Field Weld','Heal 4 + give +1 Charge to:', wounded.map(b=>({l:b.name+' ('+b.hp+'/'+b.maxHp+')',cls:'mb',cb:()=>{b.hp=Math.min(b.maxHp,b.hp+4);addChg(b,1);log('Field Weld: '+b.name+' +4 HP, +1 Charge.','eq');closeM();renderAll();if(G_online&&G_myTurn)_syncNow();}})).concat([{l:'Cancel',cls:'mb ok',cb:()=>{_cancelAction();}}]));
    return;
  }
  if(fx==='gen_heal'){
    const wounded=alive(G.p).filter(b=>!b.def);
    openM('Field Medic','Heal which bot?', wounded.map(b=>({l:b.name+' ('+b.hp+'/'+b.maxHp+')',cls:'mb',cb:()=>{try{fxHeal();}catch(e){}const amt=(b.hp<b.maxHp/2)?8:5;b.hp=Math.min(b.maxHp,b.hp+amt);log('Field Medic: +'+amt+' HP to '+b.name+'.','eq');closeM();renderAll();if(G_online&&G_myTurn)_syncNow();}})).concat([{l:'Cancel',cls:'mb ok',cb:()=>{_cancelAction();}}]));
    return;
  }
  if(fx==='gen_recharge'){
    const ab=getActiveBot('p');
    if(ab){ if(ab.charge>=10){ drw(G.p,1); log('Recharge: already max — drew a card.','chg'); } else { ab.charge=Math.min(10,ab.charge+2); log('Recharge: +2 Charge.','chg'); } }
    renderAll(); if(G_online&&G_myTurn)_syncNow(); return;
  }
  if(fx==='gen_salvage'){
    drw(G.p,2);
    openM('Scrap Salvage','Discard one card:', G.p.hand.map((c,i)=>({l:c.name,cls:'mb',cb:()=>{dsc(G.p,c.uid);log('Salvage: discarded '+c.name+'.','info');closeM();renderAll();}})).concat([{l:'Skip',cls:'mb ok',cb:()=>closeM()}]));
    return;
  }
  if(fx==='gen_override'){
    G.p._override=true; log('Override armed — next enemy technique/action is cancelled.','chg');
    renderAll(); if(G_online&&G_myTurn)_syncNow(); return;
  }
  if(fx==='gen_lastresort'){
    if(G.p.hand.length>2){ log('Last Resort needs 2 or fewer cards in hand.','info'); return; }
    const tgt=getActiveBot('c'); if(tgt){ dmg(tgt,6,'p'); log('Last Resort: 6 unblockable to '+tgt.name+'!','atk'); }
    checkWin(); renderAll(); if(G_online&&G_myTurn)_syncNow(); return;
  }
  if(fx==='gen_reboot'){
    if(G.p._rebootUsed){ log('Medal Reboot already used this game.','info'); return; }
    const dead=G.p.bots.filter(b=>b.def);
    if(!dead.length){ log('No defeated bots to revive.','info'); return; }
    openM('Medal Reboot','Revive which bot at 6 HP?', dead.map(b=>({l:b.name,cls:'mb',cb:()=>{b.def=false;b.hp=6;G.p._rebootUsed=true;log('Medal Reboot: '+b.name+' returns with 6 HP!','mc');banner('MEDAL REBOOT!','#f0b820');closeM();renderAll();if(G_online&&G_myTurn)_syncNow();}})).concat([{l:'Cancel',cls:'mb ok',cb:()=>{_cancelAction();}}]));
    return;
  }
  if(fx==='act_charge'){
    openM('Press Forward','Choose a bot to give +2 Charge:',
      alive(G.p).map(b=>({l:b.name+'  '+b.charge+'/5',cls:'mb ok',cb:()=>{addChg(b,2);closeM();renderAll();}})));
    return;
  }
  if(fx==='act_drain'){const t=alive(G.c).sort((a,b)=>b.charge-a.charge)[0];if(t){t.charge=Math.max(0,t.charge-2);log(t.name+' -2 Charge','chg');}}
  if(fx==='act_draw2'){drw(G.p,2);log('Drew 2 cards.','info');}
  if(fx==='act_heatwave'){
    let ticks=0;
    alive(G.c).forEach(t=>{if(t.burn){dmg(t,2,'c');ticks++;}});
    log('Heat Wave: '+ticks+' burning enemies took 2 extra damage!','atk');
    banner('HEAT WAVE!','#f06424');
    renderAll();return;
  }
  if(fx==='act_overload'){
    G.p._overloadReady=true;
    log('Overload: next Medaforce deals DOUBLE damage!','chg');
    banner('OVERLOAD READY!','#f06424');
    renderAll();return;
  }
  if(fx==='act_royal'){
    drw(G.p,2);alive(G.p).forEach(b=>addChg(b,1));
    log('Royal Summons: drew 2, all bots +1 Charge!','chg');banner('ROYAL SUMMONS!','#f0c040');
    renderAll();return;
  }
  if(fx==='act_sacrifice'){
    const weakest=alive(G.p).sort((a,b)=>a.hp-b.hp)[0];
    const omega=G.p.bots.find(b=>b.key==='omegaknight'&&!b.def);
    if(!weakest||!omega){log('Needs Omegaknight alive.','info');renderAll();return;}
    dmg(weakest,4,'p');
    addChg(omega,3);omega._sacrificeBonus=(omega._sacrificeBonus||0)+2;
    log('Sacrifice Play: '+weakest.name+' sacrificed! Omegaknight +3 Charge +2 ATK!','chg');
    banner('SACRIFICE!','#f0c040');renderAll();return;
  }
  if(fx==='act_titan_call'){
    const rok=alive(G.p).find(b=>b.key==='rokusho');
    const mult=rok&&G.p.activeBot===G.p.bots.indexOf(rok)?2:1;
    let healed=0;
    alive(G.p).forEach(b=>{const h=2*mult;b.hp=Math.min(b.maxHp,b.hp+h);healed+=h;});
    log('Titan Call: team healed '+(2*mult)+' HP each'+(mult===2?' (Rokusho bonus!)':'')+'!','chg');
    banner('TITAN CALL!','#8090a0');
    renderAll();return;
  }
  if(fx==='act_digiload'){
    const mg=G.p.bots.find(b=>b.key==='metalgurumemon'&&!b.def);
    if(!mg){log('MetalGurumemon not available.','info');renderAll();return;}
    const t=alive(G.c).sort((a,b)=>b.hp-a.hp)[0];
    if(t){dmg(t,mg.atk,'c');log('Digi Overload: MetalGurumemon deals '+mg.atk+' bonus DMG!','atk');banner('DIGI OVERLOAD!','#9050d0');}
    renderAll();return;
  }
  if(fx==='act_evolve'){
    drw(G.p,2);
    // Engine accelerator: refund this action AND pull a Medachange to hand, so you can evolve right now.
    actionsLeft++;
    const mcInDeck=G.p.deck.find(c=>c.type==='medachange');
    if(mcInDeck){ G.p.deck=G.p.deck.filter(c=>c.uid!==mcInDeck.uid); G.p.hand.push(mcInDeck); log('Evolution Call: drew 2, refunded action, and found '+mcInDeck.name+'!','chg'); }
    else { log('Evolution Call: drew 2 and refunded your action!','chg'); }
    banner('EVOLUTION CALL!','#00ff80');
    const digi=G.p.bots.find(b=>(b.key==='wargreymon'||b.key==='metalgurumemon')&&!b.def&&G.p.activeBot===G.p.bots.indexOf(b));
    if(digi){addChg(digi,2);digi.atk+=1;log('Evolution Call: '+digi.name+' surges! +2 Charge +1 ATK permanently!','chg');banner('DIGIVOLUTION!','#00ff80');}
    else{log('Evolution Call: Drew 2 cards.','chg');}
    renderAll();return;
  }
  if(fx==='act_throne_armor'){
    const emp=G.p.bots.find(b=>b.key==='robo_emperor'&&!b.def);
    if(emp){emp._throneArmor=(emp._throneArmor||0)+2;log('Throne Armor: +2 permanent reduction (now '+emp._throneArmor+')!','eq');banner('THRONE ARMOR!','#8090a0');}
    renderAll();return;
  }
  if(fx==='act_sys_repair'){
    const emp=G.p.bots.find(b=>b.key==='robo_emperor'&&!b.def);
    if(emp){emp.hp=Math.min(emp.maxHp,emp.hp+6);log('System Repair: Emperor +6 HP!','chg');flt('+6','heal');}
    renderAll();return;
  }
  if(fx==='act_overcharge'){
    const emp=G.p.bots.find(b=>b.key==='robo_emperor'&&!b.def);
    if(emp){addChg(emp,3);log('Overcharge: +3 Charge!','chg');}
    renderAll();return;
  }
  if(fx==='act_emp_decree'){drw(G.p,3);log('Emperor Decree: drew 3 cards!','chg');banner('DECREE!','#60c030');renderAll();return;}
  if(fx==='act_cable_exp'){
    for(let i=0;i<2;i++){
      const targets=alive(G.c).sort((a,b)=>b.charge-a.charge);
      if(targets.length){dmg(targets[0],2,'c');targets[0].charge=Math.max(0,targets[0].charge-1);}
    }
    log('Cable Expand: 2 cable strikes fired!','atk');banner('CABLE STRIKE!','#60c030');renderAll();return;
  }
  if(fx==='act_combo'){
    drw(G.p,2);
    const gok=G.p.bots.find(b=>b.key==='gokudo'&&!b.def);
    if(gok){gok._comboKeep=true;log('Combo Chain: drew 2, Gokudo combo persists!','chg');}
    renderAll();return;
  }
  if(fx==='act_chain_chg'){
    alive(G.p).forEach(b=>addChg(b,2));
    G.p._karincards=(G.p._karincards||0)+2; // counts as 2 cards for Karin
    checkKarinPassive();checkKarinPassive();
    log('Chain Boost: all bots +2 Charge!','chg');banner('CHAIN BOOST!','#e060f0');
    renderAll();return;
  }
  if(fx==='act_fox_heal'){
    try{fxHeal();}catch(e){}
    const fox=G.p.bots.find(b=>b.key==='foxuno'&&!b.def);
    alive(G.p).forEach(b=>{b.hp=Math.min(b.maxHp,b.hp+3);});
    if(fox)addChg(fox,1);
    log('Fox Medicine: all bots +3 HP!'+(fox?' Foxuno +1 Charge':''),'chg');
    banner('FOX MEDICINE!','#40d898');renderAll();return;
  }
  if(fx==='act_shadow_step'){
    G.p._ninFreeExtra=true;
    log('Shadow Step: Nin-Ninja gets a free extra technique this turn!','chg');
    banner('SHADOW STEP!','#4080f0');renderAll();return;
  }
  if(fx==='act_overload_surge'){
    let hit=0;
    alive(G.c).forEach(t=>{ if((t.charge||0)>0){ t.charge=Math.max(0,t.charge-2); hit++; } });
    log('Overload Surge: every enemy bot loses 2 Charge!','chg');
    banner('OVERLOAD SURGE!','#2a80f0');
    renderAll();
    return;
  }
  if(fx==='act_locate'){
    if(G.locatorUsed){ log('Medal Locator already used this game.','info'); return; }
    G.locatorUsed=true;
    { const _ab=getActiveBot('p'); if(_ab&&_ab.charge>0){ _ab.charge=Math.max(0,_ab.charge-1); log('Locator: -1 Charge.','chg'); } }
    const mfCards=G.p.deck.filter(d=>d.type==='medaforce');
    if(mfCards.length){
      openM('🔍 Medal Locator','Search your deck for a Medaforce to add to hand:',
        [...mfCards.map(mf=>({l:mf.name+' — '+mf.stat,cls:'mb ok',cb:()=>{
          const idx=G.p.deck.findIndex(d=>d.uid===mf.uid);
          if(idx>=0){const found=G.p.deck.splice(idx,1)[0];G.p.hand.push(found);
            log('🔍 Located '+found.name+' → added to hand!','chg');banner('MEDAFORCE FOUND','#f0b820');}
          shuffle(G.p.deck);
          closeM();renderAll();
        }})),
        {l:'Cancel (no search)',cls:'mb',cb:()=>{shuffle(G.p.deck);closeM();renderAll();}}]
      );
    } else { log('No Medaforce in deck.','info'); }
    return;
  }
  if(fx==='act_fusion'){
    // Medal Fusion card now: draw 2 AND boost next auto-fusion to +8 HP
    drw(G.p,2);
    G.p._fusionBoosted=true;
    log('Medal Fusion: Drew 2. Next fusion grants +8 HP instead of +4!','eq');
    banner('FUSION BOOST!','#9070f0');
    renderAll();return;
  }
  if(fx==='act_ikki'){alive(G.p).forEach(b=>{if(b.hp<=5)addChg(b,1);});log('Ikki\'s Call applied!','chg');}
  if(fx==='act_wall'){
    const rok=G.p.bots.find(b=>b.key==='rokusho'&&!b.def);
    if(rok){rok.wallStacks=2;log('Wall Stance: Rokusho absorbs next 2 hits for the team!','eq');banner('WALL STANCE!','#8090a0');}
    else{log('Rokusho not available for Wall Stance.','info');}
  }
  if(fx==='act_ignite'){
    openM('Ignite','Choose an enemy Medabot to ignite:',
      alive(G.c).map(t=>({l:'🔥 '+t.name+(t.burn?' (already burning!)':''),cls:'mb bad',cb:()=>{
        t.burn=true;t.burnAmt=1;log('Ignite: '+t.name+' will burn!','atk');
        closeM();renderAll();
      }})));
    return; // modal handles close
  }
  renderAll();
}




// ── Equipment destruction helpers (Blackram sacrifice techs) ──
function _destroyOneEquip(bot){
  if(!bot)return false;
  if(bot.key==='grand_beetle'&&bot.equips&&bot.equips.length){ bot.equips.pop(); return true; }
  if(bot.equip){ bot.equip=null; return true; }
  return false;
}
function _destroyAllEquip(bot){
  if(!bot)return 0;
  let n=0;
  if(bot.key==='grand_beetle'&&bot.equips){ n=bot.equips.length; bot.equips=[]; }
  if(bot.equip){ n++; bot.equip=null; }
  return n;
}

// ── Forge equipment triggers ──
function forgeStartOfTurn(sk){
  // Neutranurse Forge medachange: heal all allies each turn
  try{ const side=(arguments[0]==='c')?G.c:G.p; (side.bots||[]).filter(b=>!b.def&&b._healAura).forEach(nn=>{ (side.bots||[]).filter(b=>!b.def).forEach(b=>{ b.hp=Math.min(b.maxHp,b.hp+nn._healAura); }); }); }catch(e){}
  const cnt=forgeCount(sk);
  G[sk].bots.forEach(bot=>{
    if(bot.def)return;
    botEquips(bot).forEach(eq=>{
      if(eq.fx==='fb_swarm'){ const t=getActiveBot(sk==='p'?'c':'p'); if(t){ dmg(t,2,sk==='p'?'c':'p'); flt('-2','dmg'); log('Swarm Bay drone: 2 DMG!','atk'); } }
      if(eq.fx==='fb_autoload'){ addChg(bot,1); }
      if(eq.fx==='fb_bellows' && cnt>=2){ drw(G[sk],1); log('Forge Bellows: drew a card.','chg'); }
      if(eq.fx==='fb_targeting'){ bot._pierceNext=2; }
    });
  });
}
function forgeEndOfTurn(sk){
  G[sk].bots.forEach(bot=>{
    if(bot.def)return;
    botEquips(bot).forEach(eq=>{
      if(eq.fx==='fb_sentry'){ const t=getActiveBot(sk==='p'?'c':'p'); if(t){ dmg(t,1,sk==='p'?'c':'p'); flt('-1','dmg'); } }
      if(eq.fx==='fb_repair'){ bot.hp=Math.min(bot.maxHp,bot.hp+2); flt('+2','heal'); }
      if(eq.fx==='fb_overclock'){ if((bot._overclockStacks||0)<4){ bot.atk++; bot._overclockStacks=(bot._overclockStacks||0)+1; log('Overclock Coil: '+bot.name+' +1 ATK.','chg'); } }
      if(eq.fx==='fb_heatvents' && (bot._tookDmgThisTurn||0)>0){ const t=getActiveBot(sk==='p'?'c':'p'); if(t){ const d=bot._tookDmgThisTurn; dmg(t,d,sk==='p'?'c':'p'); flt('-'+d,'dmg'); log('Heat Vents retaliate: '+d+' DMG!','atk'); } }
    });
    bot._tookDmgThisTurn=0;
  });
}

// ── Forge Barons engine: multi-equip + Forge Counter ──
function botEquips(bot){
  // Grand Beetle holds an array; others use the single .equip slot.
  if(bot.key==='grand_beetle'){ if(!bot.equips) bot.equips=[]; return bot.equips; }
  return bot.equip?[bot.equip]:[];
}
function forgeCount(sk){
  let n=0;
  G[sk].bots.forEach(b=>{ if(b.def)return; if(b.key==='grand_beetle'){ n+=(b.equips||[]).length; } else if(b.equip){ n++; } });
  return n;
}
function attachEquip(bot, card){
  if(bot.key==='grand_beetle'){
    if(!bot.equips) bot.equips=[];
    const cap=bot._maxEquip||3;
    if(bot.equips.length>=cap){ log('Grand Beetle already holds '+cap+' equipment.','info'); return false; }
    bot.equips.push({...card});
  } else {
    if(bot.equip) log('Replaced '+bot.equip.name+' on '+bot.name,'eq');
    bot.equip={...card};
  }
  return true;
}
function hasEquipFx(bot, fx){
  return botEquips(bot).some(e=>e.fx===fx);
}

function playEquip(card){
  if(actionsLeft<=0)return;
  dsc(G.p,card.uid);
  const henryFree = G.p.mf.pass.includes('free') && !G.p._henryUsed;
  if(henryFree){G.p._henryUsed=true;log('Henry: first action is free!','chg');}
  else{actionsLeft--;log(actionsLeft>0?'Action used — '+actionsLeft+' remaining.':'Action used.','info');}
  const slotLabel=(b)=>{ if(b.key==='grand_beetle'){ const n=(b.equips||[]).length; return b.name+' ['+n+'/3]'+(n>=3?' FULL':''); } return b.name+(b.equip?' (replaces '+b.equip.name+')':''); };
  const _equipState={spent:!henryFree, wasHenry:henryFree};
  openM('Equip: '+card.name,'Choose a bot to equip this to:',
    alive(G.p).map(b=>({l:slotLabel(b),cls:'mb ok',cb:()=>{
      if(!attachEquip(b,card)){ return; } // full slots — abort
      if(card.fx==='eq_resonator')addChg(b,2);
      // Neutranurse passive: drawing a card when ANY equipment is played
      if(alive(G.p).some(x=>x.key==='neutranurse')){ drw(G.p,1); log('Hot Forge: drew a card!','chg'); }
      // Kasumi MF: equipped bot +1 Charge
      if(G.p.mf&&G.p.mf.pass&&G.p.mf.pass.includes('+1 Charge')){ addChg(b,1); }
      // Master Forge on-equip: draw, and +2 ATK if 5+ equipment
      if(card.fx==='fb_masterforge'){ drw(G.p,1); log('Master Forge: drew a card!','chg'); if(forgeCount('p')>=5){ b.atk+=2; log('Master Forge: '+b.name+' +2 ATK (5+ gear)!','chg'); } }
      log(card.name+' \u2192 '+b.name,'eq');
      closeM();renderAll();
      if(G_online&&G_myTurn){ MWNet.move({type:'card',uid:card.uid,id:card.id,ctype:'equipment'}); _syncNow(); }
    }})).concat([{l:'\u2715 Cancel',cls:'mb',cb:()=>{
      // Refund: return the card to hand and give back the action
      G.p.hand.push({...card}); 
      if(_equipState.wasHenry){ G.p._henryUsed=false; } else { actionsLeft++; }
      log('Equip cancelled.','info');
      closeM();renderAll();
    }}]));
}

// ═══ MASTERBEETLE FUSION (Titan combining archetype) ═══
// Stage 1: X Fusion Change — Arcbeetle + Machairodus combine into Masterbeetle.
function playFusionX(card, sk){
  const side=G[sk];
  if(actionsLeft<=0){ return; }
  const arc=side.bots.find(b=>b.key==='arcbeetle'&&!b.def);
  const mach=side.bots.find(b=>b.key==='machairodus'&&!b.def);
  if(!arc||!mach){ log('X Fusion Change needs both Arcbeetle and Machairodus in play.','info'); return; }
  if(mach._masterbeetle){ log('Already fused into Masterbeetle.','info'); return; }
  openM('\u26a1 X FUSION CHANGE',
    '<b style="color:#e04030">Arcbeetle Dash</b> locks onto <b style="color:#3060d0">Machairodus</b> to form <b style="color:#f0c040">MASTERBEETLE</b>!<br><br>'+
    '\u2022 Combined ATK of both bots, +3<br>'+
    '\u2022 HP pooled together +10<br>'+
    '\u2022 Gains Arcbeetle\u2019s Charge passive + Machairodus\u2019 Stalk<br>'+
    '\u2022 Ranged: ignores enemy damage reduction',
    [{l:'\u26a1 COMBINE!',cls:'mb mc',cb:()=>{
      closeM();
      triggerMCAnimation(mach, ()=>{
        dsc(side,card.uid);
        if(!(G.p.mf&&G.p.mf.pass&&G.p.mf.pass.includes('Fusion Engineer'))) actionsLeft--;
        else log('Fusion Engineer: fusion costs no action!','chg');
        // Absorb Arcbeetle into Machairodus -> Masterbeetle
        const combinedAtk=16; // fixed (nerfed from snowbally combined value)
        const pooledHp=36; // fixed HP (nerf)
        mach._masterbeetle=true;
        mach.name='Masterbeetle';
        mach.key='machairodus'; // keep key for art validity; render swaps art via _masterbeetle
        mach.atk=combinedAtk;
        mach.maxHp=36; // fixed max HP (nerf)
        mach.hp=Math.min(pooledHp,mach.maxHp);
        mach._fusionStalk=true; mach._stalwaysOn=true;     // Machairodus Stalk always available
        mach._fusionCharge=true;    // Arcbeetle charge-on-attack
        mach._fusionPierce=true;    // ignores reduction
        mach.color='#f0c040';
        // Absorb Arcbeetle (removed from play, not counted as a loss)
        arc.def=true; arc._absorbed=true;
        // Keep activeBot pointing at Masterbeetle
        side.activeBot=side.bots.indexOf(mach);
        log('\u26a1 X FUSION CHANGE! Masterbeetle forms \u2014 ATK '+mach.atk+', HP '+mach.hp+'/'+mach.maxHp+'!','mc');
        banner('MASTERBEETLE!','#f0c040');
        try{ medaforceFX('#f0c040'); }catch(e){}
        renderAll(); checkWin();
      });
    }},
    {l:'Cancel',cls:'mb',cb:()=>{ closeM(); G.p.selCard=null; renderAll(); }}]);
}

// Stage 2: Master Medachange — Rokusho rides on top of Masterbeetle for the ultimate form.
function playFusionMaster(card, sk){
  const side=G[sk];
  if(actionsLeft<=0){ return; }
  const mb=side.bots.find(b=>b._masterbeetle&&!b.def);
  const rok=side.bots.find(b=>b.key==='rokusho'&&!b.def);
  if(!mb){ log('Master Medachange needs Masterbeetle in play (use X Fusion Change first).','info'); return; }
  if(!rok){ log('Master Medachange needs Rokusho in play.','info'); return; }
  if(mb._masterMode){ log('Already at Master form.','info'); return; }
  openM('\ud83d\udc51 MASTER MEDACHANGE',
    '<b style="color:#8090a0">Rokusho</b> rides atop <b style="color:#f0c040">Masterbeetle</b> \u2014 the ultimate fusion!<br><br>'+
    '\u2022 +6 ATK and +14 max HP<br>'+
    '\u2022 Takes 3 less damage from all sources<br>'+
    '\u2022 Attacks hit ALL enemies (Prominence railgun)<br>'+
    '\u2022 Heals 3 HP each turn',
    [{l:'\ud83d\udc51 ASCEND!',cls:'mb mc',cb:()=>{
      closeM();
      triggerMCAnimation(mb, ()=>{
        dsc(side,card.uid);
        if(!(G.p.mf&&G.p.mf.pass&&G.p.mf.pass.includes('Fusion Engineer'))) actionsLeft--;
        else log('Fusion Engineer: fusion costs no action!','chg');
        mb._masterMode=true;
        mb.name='Masterbeetle \u039e';
        mb.atk=19; // fixed (nerf from snowbally +increments)
        mb.maxHp=42; mb.hp=Math.min(mb.hp+14,42); // fixed max HP (nerf)
        mb._masterReduce=3;   // -3 damage taken
        mb._masterAoE=true;   // attacks hit all enemies
        mb._masterHeal=3;     // heal 3/turn
        mb.changed=true;      // mark as fully changed (for last-stand/visuals)
        rok.def=true; rok._absorbed=true;
        side.activeBot=side.bots.indexOf(mb);
        log('\ud83d\udc51 MASTER MEDACHANGE! Masterbeetle \u039e ascends \u2014 ATK '+mb.atk+', HP '+mb.hp+'/'+mb.maxHp+'!','mc');
        banner('MASTER MEDACHANGE!','#f0c040');
        try{ medaforceFX('#ffd040'); }catch(e){}
        renderAll(); checkWin();
      });
    }},
    {l:'Cancel',cls:'mb',cb:()=>{ closeM(); G.p.selCard=null; renderAll(); }}]);
}
function playMC(card){
  // ═══ MASTERBEETLE COMBINING ARCHETYPE (Titan) ═══
  // Two-stage fusion: X Fusion Change (Arcbeetle + Machairodus -> Masterbeetle),
  // then Master Medachange (Rokusho rides on top for the ultimate form).
  // X Fusion Change: fuse only when BOTH beetles are alive. Otherwise medachange whichever is alive.
  if(card.fx==='mc_bot_machairodus'){
    const arcAlive=G.p.bots.some(b=>b.key==='arcbeetle'&&!b.def);
    const machAlive=G.p.bots.some(b=>b.key==='machairodus'&&!b.def);
    if(arcAlive && machAlive){ return playFusionX(card,'p'); }
    // Only one beetle alive → normal medachange on whichever survives (retarget the card if needed).
    if(!machAlive && arcAlive){ card={...card, fx:'mc_bot_arcbeetle'}; }
    // fall through to normal medachange below
  }
  // Master Medachange: ride on top only if Masterbeetle exists; otherwise medachange Roks normally.
  if(card.fx==='mc_bot_rokusho' && G.p.bots.some(b=>b._masterbeetle&&!b.def)){
    return playFusionMaster(card,'p');
  }
  // EVOLUTION ENGINE (Royal): bots may evolve repeatedly; other decks keep the once-per-game cap.
  const _royalSide = G.p.bots.some(b=>['omegaknight','wargreymon','metalgurumemon'].includes(b.key));
  if(actionsLeft<=0) return;
  if(G.p.mcUsed && !_royalSide) return;
  const bk=card.fx.replace('mc_bot_','');
  const bot=G.p.bots.find(b=>b.key===bk&&!b.def);
  if(!bot){log('Target bot not available.','info');dsc(G.p,card.uid);actionsLeft--;renderAll();return;}
  if(bot.changed){log(bot.name+' has already evolved.','info');return;}
  openM('MEDACHANGE — '+card.name,
    '<b style="color:'+bot.color+'">'+bot.name+'</b> fuses with your Medafighter.<br><br>'+
    '• +5 ATK permanently (+4 for Rokusho)<br>• +12 max HP (current HP also rises)<br>'+
    (card.fx==='mc_bot_arcbeetle'?'• Lightning double-atk threshold: 5 → 2<br>':'')+
    (card.fx==='mc_bot_warbandit'?'• Medaforce draws 2 + drains all enemies −2 Charge<br>':'')+
    (card.fx==='mc_bot_rokusho'?'• Titan reduction −1 → −4 · heal 2 HP/turn<br>':'')+
    (card.fx==='mc_bot_grand_beetle'?'• Equipment slots 3 → 4<br>':'')+
    (card.fx==='mc_bot_neutranurse'?'• Heals all allies +2 HP each turn<br>':'')+
    (card.fx==='mc_bot_blackram'?'• Sacrifice techniques deal +2 bonus<br>':'')+
    '<br><span style="color:var(--red)">⚠ If this bot is defeated while changed, you lose immediately.</span>',
    [{l:'CONFIRM MEDACHANGE',cls:'mb mc',cb:()=>{
      closeM();
      triggerMCAnimation(bot, ()=>{
        dsc(G.p,card.uid);
        // Royal evolves freely; track the evolution count for scaling payoffs.
        if(_royalSide){ G.p._evolveCount=(G.p._evolveCount||0)+1; log('EVOLUTION '+G.p._evolveCount+'! The Royal Court grows stronger.','mc'); }
        else { if(!(G.p.mf&&G.p.mf.pass&&G.p.mf.pass.includes('Fusion Engineer'))) actionsLeft--; G.p.mcUsed=true; }
        const mcHPBoost=12;
        bot.changed=true;bot.maxHp+=mcHPBoost;bot.hp=Math.min(bot.hp+mcHPBoost,bot.maxHp);
        if(card.fx==='mc_bot_warbandit')bot.mcDraw2=true;
        if(card.fx==='mc_bot_sumilidon'){bot._ravagerDouble=true;bot.maxHp+=2;bot.hp=Math.min(bot.hp+2,bot.maxHp);bot.atk+=1;log('Sumilidon Medachange: Ravager fury doubled!','mc');}
      if(card.fx==='mc_bot_wargreymon'){bot._dramonBonus=3;log('WarGreymon Medachange: Dramon bonus +6!','mc');}
      if(card.fx==='mc_bot_metalgurumemon'){bot._doubleBarrage=true;log('MetalGurumemon Medachange: Double Missile Barrage!','mc');}
        if(card.fx==='mc_bot_grand_beetle'){bot._maxEquip=4;log('Grand Beetle Forge: 4 equipment slots!','mc');}
        if(card.fx==='mc_bot_neutranurse'){bot._healAura=2;log('Neutranurse Forge: heals allies +2/turn!','mc');}
        if(card.fx==='mc_bot_blackram'){bot._sacBonus=2;log('Blackram Forge: sacrifice techniques +2!','mc');}
        log('⚡ MEDACHANGE! '+bot.name+' transforms!','mc');
        banner('MEDACHANGE!','#f04880');
        renderAll();
      });
    }},{l:'Cancel',cls:'mb',cb:closeM}]);
}

function openMedaforce(){
  const ign=alive(G.p).filter(b=>b.charge>=5);
  const mfs=G.p.hand.filter(c=>c.type==='medaforce');
  if(!ign.length||!mfs.length)return;
  if(mfs.length===1){openMFCard(mfs[0]);return;}
  openM('Medaforce','Select a Medaforce card:',
    mfs.map(c=>({l:c.name+' — '+c.desc,cls:'mb bad',cb:()=>{openMFCard(c);closeM();}})));
}

function openMFCard(card){
  // Step 1: pick the caster (ignited bot)
  const ign=alive(G.p).filter(b=>b.charge>=5);
  if(!ign.length)return;

  // If multiple ignited bots, ask which one fires
  if(ign.length>1){
    openM('Choose Caster','Which Medabot fires '+card.name+'?',
      ign.map(b=>({l:b.name+' — '+b.mName+' Medal',cls:'mb bad',cb:()=>{
        closeM();fireMF(card,b);
      }})).concat([{l:'Cancel',cls:'mb',cb:()=>{ closeM(); G.p.selCard=null; renderAll(); }}]));
    return;
  }
  fireMF(card,ign[0]);
}

function fireMF(card,caster){
  // Overforge: double active bot ATK this turn, then it sheds all equipment
  if(card.fx==='mf_overforge'){
    dsc(G.p,card.uid); caster.charge=0;
    const base=caster.atk; caster.atk=caster.atk*2; caster._overforged=base;
    log('OVERFORGE! '+caster.name+' ATK doubled to '+caster.atk+'!','atk');
    banner('OVERFORGE!','#f0c040');
    if(typeof triggerComboAnim==='function'){} // reuse FX if desired
    renderAll();
    return;
  }
  // Snapshot for cancel-refund: if the player backs out of a targeting prompt,
  // we restore the card to hand, the caster's charge, and the attack state.
  G._mfRestore={ card:JSON.parse(JSON.stringify(card)), casterKey:caster.key, charge:caster.charge||0, atked:atked };
  // Consume resources
  G._mfChargeAtFire=caster.charge||0; // capture for charge-based MF (e.g. Cross Burst)
  G._mfCaster=caster;
  dsc(G.p,card.uid);
  caster.charge=0;
  atked=true;
  log('MEDAFORCE: '+caster.name+' fires '+card.name+'!','atk');
  banner('MEDAFORCE!','#f04040');
  try{ medaforceFX(card.color||'#f04040'); }catch(e){}
  G.mfFired++;
  G.story.push(caster.name+' fired '+card.name+' on turn '+turn);

  // Passive draws (Psycho)
  const draws=caster.mcDraw2?2:(caster.medal==='psycho'||caster.fusedMedal==='psycho'?1:0);
  if(draws){drw(G.p,draws);log('Drew '+draws+' (Psycho passive)','info');}
  // Warbandit Medachange bonus: Medaforce also drains all enemy charge by 2
  if(caster.changed&&caster.key==='warbandit'){
    alive(G.c).forEach(b=>{b.charge=Math.max(0,b.charge-2);});
    log('Warbandit Change: all enemies −2 Charge!','chg');
  }
  // Rokusho Medachange: heal 2 each turn (handled in doCharge)

  // Medal Lens bonus
  let bonus=0;
  if(caster.equip&&caster.equip.fx==='eq_lens'){bonus=3;caster.equip=null;log('Medal Lens: +3 MF dmg!','eq');}

  // Route to correct resolver — ones that need target get a modal,
  // ones that don't need target resolve immediately
  resolveMF(card.fx,bonus);
}


// Refund a Medaforce if the player cancels at a targeting prompt:
// restore the card to hand, the caster's charge, and clear the attack flag.
function _cancelMedaforce(){
  try{
    const r=G._mfRestore;
    if(r){
      if(r.card){ G.p.hand.push(r.card); }
      const c=G.p.bots.find(b=>b.key===r.casterKey);
      if(c){ c.charge=r.charge; }
      atked=r.atked;
      G.mfFired=Math.max(0,(G.mfFired||1)-1);
    }
  }catch(e){}
  G._mfRestore=null;
  G.p.selCard=null;
  closeM();
  log('Medaforce cancelled — resources refunded.','info');
  renderAll();
}
function resolveMF(fx,bonus=0){
  const enemies=alive(G.c);
  if(fx==='mf_zanshin'){
    // ── ZANSHIN, Beat 1: The Announcement ──
    const me=G.p;
    const allAlive=['kensho','gobanko','samurai','shinsaber'].every(k=>alive(me).some(b=>b.key===k));
    const reson=me._resonance||0;
    const all3=me._stances.bound&&me._stances.exposed&&me._stances.exec;
    if(!allAlive||reson<3){
      openM('Zanshin \u2014 Not Yet','The cut is not ready. Zanshin needs <b>3+ Resonance</b> (have '+reson+') and all three bladesmen alive.',
        [{l:'Understood',cls:'mb',cb:()=>{_cancelMedaforce();}}]);
      return;
    }
    const foes=alive(G.c);
    if(!foes.length){ closeM&&closeM(); renderAll(); return; }
    // Auto-assign Verdicts by the rule; Master Sen / Kensho-changed allows free reassign.
    const byHpHigh=[...foes].sort((a,b)=>b.hp-a.hp)[0];
    const byDefHigh=[...foes].sort((a,b)=>(b.def?1:0)-(a.def?1:0)||b.hp-a.hp)[0];
    const byHpLow=[...foes].sort((a,b)=>a.hp-b.hp)[0];
    const auto=[
      {type:'bound',   botKey:'gobanko',  targetUid:byHpHigh.uid,  label:'Bound \u2192 highest HP ('+byHpHigh.name+')'},
      {type:'exposed', botKey:'samurai',  targetUid:byDefHigh.uid, label:'Exposed \u2192 toughest ('+byDefHigh.name+')'},
      {type:'exec',    botKey:'shinsaber',targetUid:byHpLow.uid,   label:'Execution \u2192 lowest HP ('+byHpLow.name+')'},
    ];
    const kenshoAwake=alive(me).some(b=>b.key==='kensho'&&b.changed);
    const freeAssign=all3 && (kenshoAwake || me.mf.pass.includes('freely'));
    const begin=(verdicts)=>{
      G._zanshin={phase:1, verdicts, side:'p', startedTurn:turn};
      // Commit the three blades: locked through Beat 2.
      ['gobanko','samurai','shinsaber'].forEach(k=>{ const bb=alive(me).find(x=>x.key===k); if(bb)bb._zCommitted=true; });
      log('\u2694 ZANSHIN BEGINS. The Verdicts are read. The cut falls in two turns.','atk');
      verdicts.forEach(v=>{ const t=G.c.bots.find(x=>x.uid===v.targetUid); log('   \u2022 '+v.label,'info'); });
      if(typeof banner==='function')banner('ZANSHIN \u2014 THE VERDICTS','#c83232');
      try{ fxBlueX&&fxBlueX(); }catch(e){}
      closeM();renderAll();if(G_online&&G_myTurn)_syncNow();
    };
    if(freeAssign){
      // Let the pilot reassign which target gets which Verdict.
      openM('Zanshin \u2014 Free Assignment',
        'Mastery achieved. Assign the <b style="color:#c83232">Execution</b> Verdict (the kill mark) to any enemy. Bound and Exposed fall on the rest.',
        foes.map(t=>({l:'\u2620 Execute '+t.name+'  ('+t.hp+' HP)',cls:'mb bad',cb:()=>{
          const others=foes.filter(x=>x!==t);
          const bnd=others[0]||t, exp=others[1]||others[0]||t;
          begin([
            {type:'exec',   botKey:'shinsaber',targetUid:t.uid,  label:'Execution \u2192 '+t.name},
            {type:'bound',  botKey:'gobanko',  targetUid:bnd.uid,label:'Bound \u2192 '+bnd.name},
            {type:'exposed',botKey:'samurai',  targetUid:exp.uid,label:'Exposed \u2192 '+exp.name},
          ]);
        }})).concat([{l:'Auto-assign',cls:'mb',cb:()=>begin(auto)}]));
      return;
    }
    begin(auto);
    return;
  }

  // Overload: double Medaforce damage
  SFX.medaforce();
  const mfMult=G.p._overloadReady?2:1;
  const mfCap=G.p._overloadReady?12:99; // Overload caps at 12 total damage
  if(G.p._overloadReady){
    G.p._overloadReady=false;
    log('💥 OVERLOAD! Medaforce damage doubled (max 12)!','chg');
    banner('OVERLOAD!','#f06424');
  }

  // ── Cards that need a TARGET SELECTION ──────────────────
  if(fx==='mf_broadside'){
    // Win Medals: spend ALL Doubloons, deal 4 + 2 per coin to one enemy
    const have=coins('p');
    const dmgAmt=(4+2*have)*mfMult;
    openM(
      'Win Medals — Empty the Vault',
      'Spend all <b style="color:#d4a020">'+have+' Doubloons</b> to deal <b style="color:#d4a020">'+dmgAmt+' damage</b> to one enemy.',
      enemies.map(t=>({
        l:'⚔ '+t.name+'  —  '+t.hp+' HP',
        cls:'mb bad',
        cb:()=>{
          spendCoins('p',have);
          try{ fxCoinPopBurst(have, Math.min(16,8+have)); _fxShake(); }catch(e){}
          dmg(t,dmgAmt,'c');
          log('Win Medals: spent '+have+' Doubloons — '+t.name+' hit for '+dmgAmt+'!','atk');
          closeM();renderAll();if(G_online&&G_myTurn)_syncNow();
        }
      })).concat([{l:'Cancel',cls:'mb',cb:()=>{_cancelMedaforce();}}])
    );
    return;
  }
  if(fx==='mf_blaze'){
    // Inferno Surge: pick one enemy, deal 8 direct
    openM(
      'Inferno Surge — Choose Target',
      'Deal <b style="color:var(--blaze2)">'+(8+bonus)+' unblockable damage</b> to one enemy and set it ablaze. <b>+3 dmg if already burning.</b>',
      enemies.map(t=>({
        l:'⚔ '+t.name+'  —  '+t.hp+' HP',
        cls:'mb bad',
        cb:()=>{
          try{ fxFlame(); }catch(e){}
          // Burn benefit: +3 bonus damage if the target is already burning, then (re)apply burn.
          const wasBurning=!!t.burn;
          let dmgAmt=(8+bonus)*mfMult + (wasBurning?3:0);
          dmg(t,dmgAmt,'c');
          t.burn=true; t.burnAmt=Math.max(t.burnAmt||0,2); // leaves a strong burn
          log('Inferno Surge: '+t.name+' hit for '+dmgAmt+(wasBurning?' (burning bonus!)':'')+' and set ablaze!','atk');
          // Wildfire synergy: if a Warbandit is in play, spread the burn.
          try{ const wf=alive(G.p).find(x=>x.key==='warbandit'&&!x.def); if(wf){ const o2=alive(G.c).find(e=>e!==t&&!e.def&&!e.burn); if(o2){o2.burn=true;o2.burnAmt=2;log('Wildfire: burn spreads to '+o2.name+'!','chg');} } }catch(e){}
          closeM();renderAll();
        }
      })).concat([{l:'Cancel',cls:'mb',cb:()=>{_cancelMedaforce();}}])
    );
    return; // modal handles everything from here
  }

  if(fx==='mf_psycho'){
    // Mind Seize: pick one enemy — it attacks its OWN team
    openM(
      'Mind Seize — Choose Target',
      'Force one enemy Medabot to attack its own team.',
      enemies.map(t=>({
        l:'🔮 '+t.name+'  (ATK '+t.atk+')',
        cls:'mb bad',
        cb:()=>{
          const ownTeam=alive(G.c).filter(x=>x!==t);
          if(ownTeam.length){
            const victim=ownTeam.sort((a,b)=>a.hp-b.hp)[0];
            dmg(victim,t.atk+bonus,'c');
            log('Mind Seize: '+t.name+' attacks '+victim.name+' for '+(t.atk+bonus)+'!','atk');
          } else {
            // Only one bot — hit it with its own ATK
            dmg(t,t.atk+bonus,'c');
            log('Mind Seize: '+t.name+' hits itself for '+(t.atk+bonus)+'!','atk');
          }
          closeM();renderAll();
        }
      })).concat([{l:'Cancel',cls:'mb',cb:()=>{_cancelMedaforce();}}])
    );
    return;
  }

  // ── Cards that hit ALL enemies (no target needed) ────────
  if(fx==='mf_xburst'){
    // X Burst: 7 single-target, 12 + pierce if Masterbeetle is out
    const hasMB=G.p.bots.some(b=>b._masterbeetle&&!b.def);
    const dmgAmt=(hasMB?12:7)+bonus;
    const tgt=enemies[0];
    if(!tgt){ closeM&&closeM(); renderAll(); return; }
    openM('X Burst',
      'Deal <b style="color:#e04030">'+(dmgAmt*mfMult)+' damage</b> to '+tgt.name+(hasMB?' \u2014 Masterbeetle empowered, ignores reduction!':'.'),
      [{l:'\u26a1 FIRE X BURST',cls:'mb bad',cb:()=>{
        try{ fxBlueX(); }catch(e){}
        if(hasMB) G._pierceDmg=true;
        dmg(tgt,dmgAmt*mfMult,'c');
        G._pierceDmg=false;
        log('X Burst: '+tgt.name+' hit for '+(dmgAmt*mfMult)+'!','atk');
        closeM();renderAll();
      }},{l:'Cancel',cls:'mb',cb:()=>{_cancelMedaforce();}}]
    );
    return;
  }
  if(fx==='mf_mastercannon'){
    // Master Cannon: 6 to all, 11 to all if Master form is out
    const hasMaster=G.p.bots.some(b=>b._masterMode&&!b.def);
    const dmgAmt=(hasMaster?11:6)+bonus;
    const targets=enemies.slice();
    if(!targets.length){ closeM&&closeM(); renderAll(); return; }
    openM('Master Cannon',
      'Deal <b style="color:#f0c040">'+(dmgAmt*mfMult)+' damage</b> to ALL enemies'+(hasMaster?' \u2014 full Prominence Railgun!':'.')+' ('+targets.length+' targets)',
      [{l:'\ud83d\udd2b FIRE RAILGUN',cls:'mb bad',cb:()=>{
        try{ fxBeam(); }catch(e){}
        targets.forEach(t=>dmg(t,dmgAmt*mfMult,'c'));
        log('Master Cannon: all enemies hit for '+(dmgAmt*mfMult)+'!','atk');
        closeM();renderAll();
      }},{l:'Cancel',cls:'mb',cb:()=>{_cancelMedaforce();}}]
    );
    return;
  }
  if(fx==='mf_lightning'){
    // Thunder Barrage: hit all for 4
    const targets=enemies.slice();
    openM(
      'Thunder Barrage',
      'Deal <b style="color:var(--storm2)">'+(4+bonus)+' damage</b> to ALL enemy Medabots ('+(targets.length)+' targets = '+(targets.length*(4+bonus))+' total).',
      [{l:'FIRE — Hit all '+targets.length+' bots',cls:'mb bad',cb:()=>{
        targets.forEach(t=>dmg(t,(4+bonus)*mfMult,'c'));
        log('Thunder Barrage: hit all for '+((4+bonus)*mfMult)+' each!','atk');
        closeM();renderAll();
      }},{l:'Cancel',cls:'mb',cb:()=>{_cancelMedaforce();}}]
    );
    return;
  }

  if(fx==='mf_crossburst'){
    // Cross Burst: deal 3x the caster's Charge (captured before reset) to enemy active bot.
    // Card already discarded and charge already consumed by fireMF; we use captured values.
    const chg=(typeof G._mfChargeAtFire==='number')?G._mfChargeAtFire:0;
    const isCpu=(bonus===1); // cpu side path passes bonus=1
    const atkSide=isCpu?'c':'p';
    const defSide=isCpu?'p':'c';
    const fired=G._mfCaster||getActiveBot(atkSide);
    const dmgAmt=chg*3+(isCpu?0:bonus); // (bonus reused as cpu flag, so ignore for player)
    const tgt=getActiveBot(defSide);
    if(tgt&&!tgt.def){
      G._curAtkr=fired;
      dmg(tgt,chg*3,defSide);
      flt('-'+(chg*3),'dmg');
    }
    log('Cross Burst: '+(chg*3)+' damage unleashed!','atk');
    if(typeof banner==='function')banner('CROSS BURST!','#d8dde8');
    checkWin();renderAll();
    return;
  }

  if(fx==='mf_titan'){
    // Earth Prison: exhaust all enemies
    openM(
      'Earth Prison',
      'All '+enemies.length+' enemy Medabots are <b style="color:var(--titan2)">exhausted</b> — they cannot attack this turn.',
      [{l:'ACTIVATE Earth Prison',cls:'mb bad',cb:()=>{
        enemies.forEach(b=>b.exhst=true);
        log('Earth Prison: all enemies exhausted!','atk');
        closeM();renderAll();
      }},{l:'Cancel',cls:'mb',cb:()=>{_cancelMedaforce();}}]
    );
    return;
  }

  // ── Friendly effects (no modal needed) ──────────────────
  if(fx==='mf_imperial'){
    const enemies=alive(G.c);
    if(!enemies.length){closeM&&closeM();renderAll();return;}
    const _ib=8;const per=Math.floor((_ib*mfMult)/enemies.length);
    const rem=(_ib*mfMult)%enemies.length;
    enemies.forEach((t,i)=>{dmg(t,per+(i<rem?1:0),'c');});
    log('Imperial Barrage: 10 damage split across all enemies!','atk');
    // Then 2 cable strikes
    for(let i=0;i<2;i++){
      const tg=alive(G.c).sort((a,b)=>b.charge-a.charge);
      if(tg.length){dmg(tg[0],2,'c');tg[0].charge=Math.max(0,tg[0].charge-1);}
    }
    banner('IMPERIAL BARRAGE!','#60c030');closeM&&closeM();renderAll();return;
  }
  if(fx==='mf_chain_strike'){
    // Chain Strike: 4 + 2 per technique played this match turn
    const techCount=alive(G.p).reduce((s,b)=>s+(b._comboCount||0),0);
    const chainDmg=(4+techCount*2)*mfMult;
    openM('Chain Strike','<b style="color:#e060f0">'+chainDmg+'</b> damage ('+'4 base + '+techCount+' techs × 2) to one enemy!',
      alive(G.c).map(t=>({l:'⚔ '+t.name+' — '+t.hp+' HP',cls:'mb bad',cb:()=>{
        try{ fxShadowSlash(); }catch(e){}
        dmg(t,chainDmg,'c');
        log('Chain Strike: '+t.name+' hit for '+chainDmg+'!','atk');
        closeM();renderAll();
      }})).concat([{l:'Cancel',cls:'mb',cb:()=>{_cancelMedaforce();}}]));
    return;
  }
  if(fx==='mf_digistrike'){
    // All three Digimon Collab bots strike simultaneously
    const strikers=[
      G.p.bots.find(b=>b.key==='omegaknight'&&!b.def),
      G.p.bots.find(b=>b.key==='wargreymon'&&!b.def),
      G.p.bots.find(b=>b.key==='metalgurumemon'&&!b.def),
    ].filter(Boolean);
    const target=alive(G.c).sort((a,b)=>b.hp-a.hp)[0];
    if(!target){closeM&&closeM();renderAll();return;}
    openM('DigiStrike','<b style="color:#00ff80">'+strikers.length+' Digimon</b> strike simultaneously for <b style="color:#f04040">'+(6+((G.p._evolveCount||0)*2))+' each</b> unblockable!',
      [{l:'⚡ UNLEASH DIGISTRIKE!',cls:'mb bad',cb:()=>{
        const _evoBonus=(G.p._evolveCount||0)*2; const _strikeDmg=(6+_evoBonus)*mfMult; strikers.forEach(b=>{dmg(alive(G.c)[0]||target,_strikeDmg,'c');});
        log('DigiStrike: '+strikers.map(b=>b.name).join(', ')+' struck for '+_strikeDmg+' each!','atk');
        closeM();renderAll();
      }}]);
    return;
  }
  if(fx==='mf_royal'){
    // Royal Judgment: 8 + 3 per ally already defeated
    const fallen=G.story.filter(s=>s.startsWith('Your')).length;
    const totalDmg=(8+bonus+(fallen*3))*mfMult;
    openM('Royal Judgment','Deal <b style="color:#f0c040">'+totalDmg+' unblockable dmg</b> (8 base + '+fallen+' fallen × 3) to one enemy.',
      alive(G.c).map(t=>({l:'⚔ '+t.name+' — '+t.hp+' HP',cls:'mb bad',cb:()=>{
        dmg(t,totalDmg,'c');
        log('Royal Judgment: '+t.name+' hit for '+totalDmg+'!','atk');
        closeM();renderAll();
      }})).concat([{l:'Cancel',cls:'mb',cb:()=>{_cancelMedaforce();}}]));
    return;
  }
  if(fx==='mf_aqua'){
    fxHeal();
    alive(G.p).forEach(b=>{b.hp=Math.min(b.maxHp,b.hp+4+bonus);});
    flt('+'+(4+bonus),'heal');
    log('Tidal Wave: team healed '+(4+bonus)+' HP!','chg');
  }
  if(fx==='mf_nature'){
    alive(G.p).forEach(b=>addChg(b,2));
    log('Gale Force: all bots +2 Charge!','chg');
  }
  renderAll();
}

function openSwitch(){
  if(G.phase!=='action'||G.p.switched||alive(G.p).length<=1)return;
  const cur=getActiveBot('p');
  const others=G.p.bots.map((b,i)=>({b,i})).filter(({b,i})=>!b.def&&i!==G.p.activeBot);
  openM('Switch Active Medabot',
    'Move a bot from the support zone to the front.<br>'+
    '<span style="color:var(--text2);font-size:12px">Once per turn. Support bots keep their passives active.<br>'+
    'Current front: <b style="color:'+cur.color+'">'+cur.name+'</b></span>',
    [
      ...others.map(({b,i})=>{
        const sp=SUPPORT_PASS[b.key];
        return {
          l:'→ '+b.name+' ('+b.hp+'/'+b.maxHp+' HP)'+(sp?' · '+sp.desc:''),
          cls:'mb ok',
          cb:()=>{
            switchActive('p',i);
            G.p.switched=true;
            closeM();renderAll();
          }
        };
      }),
      {l:'Cancel',cls:'mb',cb:closeM}
    ]
  );
}

function openSupport(){
  if(G.phase!=='action'||G.supportUsed||atked||G.p.selBot===null)return;
  const bot=G.p.bots[G.p.selBot];
  if(!bot||bot.def)return;
  openM('Support Action — '+bot.name,
    'Use <b>'+bot.name+'</b> to support the team instead of attacking.<br>'+
    '<span style="color:var(--text2);font-size:12px">Cannot attack this turn if you use a support action.</span>',
    [
      {
        l:'⚡ Charge Up — '+bot.name+' gains +3 Charge',
        cls:'mb ok',
        cb:()=>{
          addChg(bot,3);G.supportUsed=true;atked=true;
          log(bot.name+' uses Charge Up: +3 Charge!','chg');
          G.p.selBot=null;closeM();renderAll();
        }
      },
      {
        l:'⚔ Boost — Next ally attack deals +2 damage',
        cls:'mb ok',
        cb:()=>{
          // Boost next ally bot (not this one) attack
          const ally=alive(G.p).find(b=>b.key!==bot.key);
          if(ally){G.boostActive=ally.key;log(bot.name+' boosts '+ally.name+': +2 ATK next attack!','chg');}
          else{G.boostActive=bot.key;log(bot.name+' self-boosts: +2 ATK next attack!','chg');}
          G.supportUsed=true;atked=true;
          G.p.selBot=null;closeM();renderAll();
        }
      },
      {
        l:'🛡 Taunt — Force CPU to target '+bot.name+' next turn',
        cls:'mb ok',
        cb:()=>{
          G.p.bots.forEach(b=>b.taunting=false);
          bot.taunting=true;G.tauntActive=true;
          G.supportUsed=true;atked=true;
          log(bot.name+' taunts — CPU must target it next!','chg');
          banner('TAUNT!','#2a80f0');
          G.p.selBot=null;closeM();renderAll();
        }
      },
      {l:'Cancel',cls:'mb',cb:closeM}
    ]
  );
}

function openMedachange(){
  const mcs=G.p.hand.filter(c=>c.type==='medachange');
  if(!mcs.length)return;
  if(mcs.length===1){playMC(mcs[0]);return;}
  openM('Medachange','Choose a Medachange card:',
    mcs.map(c=>({l:c.name,cls:'mb mc',cb:()=>{playMC(c);closeM();}})));
}

