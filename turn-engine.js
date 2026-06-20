// ═══ TURN ENGINE ═══
function runPhase(){
  if(G.winner)return;
  renderAll();
  if(G.phase==='charge'){
    doCharge('p');
    forgeStartOfTurn('p');
    applySupportPassives('p'); // re-apply so buffs show during action phase
    G._lsBannerThisTurn=false; // fresh turn — allow banner
    actionsLeft=calcActionsLeft();
    G.phase='action';renderAll();
  }else if(G.phase==='action'){
    renderAll();
  }else if(G.phase==='cpu_turn'){
    if(G_online){renderAll();return;} // online: waiting for opponent, no CPU
    setTimeout(cpuTurn,600);
  }
}

function doCharge(sk){
  if(sk==='p'){ G._cannonadeAsked=false; } // safety reset — never leave Cannonade's prompt-flag stuck across turns
  G[sk].bots.forEach(bot=>{
    if(sk==='p'){bot.taunting=false;} // taunt resets each player turn start
    if(bot.def)return;
    bot._burnLinger=false; // clear last turn's lingering burn marker
    if(bot.burn){const bAmt=bot.burnAmt||1;dmg(bot,bAmt,sk);bot.burn=false;bot.burnAmt=0;bot._burnLinger=true;if(bot.def)return;}
    // Rokusho Medachange passive: heal 2 per turn
    if(bot.changed&&bot.key==='rokusho'){bot.hp=Math.min(bot.maxHp,bot.hp+2);flt('+2','heal');}
    if(bot._masterHeal&&!bot.def){bot.hp=Math.min(bot.maxHp,bot.hp+bot._masterHeal);flt('+'+bot._masterHeal,'heal');}
    if(bot.medal==='aqua'||bot.fusedMedal==='aqua'){
      bot.hp=Math.min(bot.maxHp,bot.hp+1);flt('+1','heal');
      if(bot.key==='sumilidon'){addChg(bot,1);log('Sumilidon passive: +1 Charge from heal!','chg');}
    }
    // Machairodus stalk tracking — if didn't attack last turn, flag for +3 bonus
    if(bot.key==='machairodus'&&!bot._stalkedThisTurn){bot._stalkReady=true;}
    bot._stalkedThisTurn=false; // reset each charge phase
    const base=(bot.medal==='nature'||bot.fusedMedal==='nature'||bot.medal==='emperor'||bot.fusedMedal==='emperor')?2:1;
    // Zero medal Charge Mastery: +1 extra charge per turn
    const zeroBonus=(bot.medal==='zero'||bot.fusedMedal==='zero')?1:0;
    const ext=bot.equip&&bot.equip.fx==='eq_resonator'?1:0;
    addChg(bot,base+ext+(typeof zeroBonus!=='undefined'?zeroBonus:0));
    if(sk==='p'&&G.p.mf.pass.includes('≤5')&&bot.hp<=5){
      addChg(bot,1);
      log('Ikki passive: '+bot.name+' at '+bot.hp+' HP → +1 Charge!','chg');
      banner('IKKI PASSIVE!','#60c020');
    }
  });
  // Apply support passives after all charge processing
  applySupportPassives(sk);
  applyLastStandTurn(sk);
  // Cable Network: Robo Emperor auto-strikes at turn start
  if(sk==='p'){
    const emperor=G.p.bots.find(b=>b.key==='robo_emperor'&&!b.def);
    if(emperor){
      try{ if(typeof triggerCableAnim==='function') triggerCableAnim(); }catch(e){}
      const strikes=emperor._dominionLS?(1+( (emperor.fusedMedal?1:0)+(emperor.fusedMedal2?1:0) )):1;
      for(let i=0;i<strikes;i++){
        const targets=alive(G.c).sort((a,b)=>b.charge-a.charge);
        if(targets.length){
          const t=targets[0];
          dmg(t,1,'c');
          t.charge=Math.max(0,t.charge-1);
          log('⚡ Cable Network: 1 DMG to '+t.name+' & drained 1 Charge!','atk');
        }
      }
    }
  }
  // Combo Core equipment: +1 combo counter per turn for Gokudo
  if(sk==='p'){
    const gokEq=G.p.bots.find(b=>b.key==='gokudo'&&!b.def&&b.equip&&b.equip.fx==='eq_combo_core');
    if(gokEq){gokEq._comboCount=(gokEq._comboCount||0)+1;log('Combo Core: Gokudo +1 Combo!','chg');}
  }
  // Charge Corne: gives +1 Charge to the lowest-charge ally each turn
  {
    const corne=G[sk].bots.find(b=>b.key==='charge_corne'&&!b.def);
    if(corne){
      const allies=alive(G[sk]).filter(b=>b!==corne&&b.charge<5);
      if(allies.length){
        allies.sort((x,y)=>x.charge-y.charge);
        addChg(allies[0],1);
        log('Moon Dragon: +1 Charge to '+allies[0].name+'!','chg');
      }
    }
  }
  // Reduce web counters on enemy bots each turn
  if(sk==='p'){G.c.bots.forEach(b=>{if(b._webbed>0){b._webbed--;if(b._webbed===0)log(b.name+' breaks free from the web!','info');}});}

  // ── SENBEI upkeep: Resonance gain + Zanshin sequencer advance (player side) ──
  if(sk==='p'){
    // Clear Remaining Guard at the start of your own turn (it lasted "until your next turn").
    G.p.bots.forEach(b=>{ b._sbGuard=false; }); G.p._sbGuard=false;
    // Resonance: +1 per active Stance whose bot still lives; Stance Mastery already implied.
    if(alive(G.p).some(b=>b.medal==='senbei')){
      let gain=0;
      if(G.p._stances.bound && alive(G.p).some(b=>b.key==='gobanko')) gain++;
      if(G.p._stances.exposed && alive(G.p).some(b=>b.key==='samurai')) gain++;
      if(G.p._stances.exec && alive(G.p).some(b=>b.key==='shinsaber')) gain++;
      if(gain>0){ G.p._resonance=(G.p._resonance||0)+gain; log('Resonance +'+gain+' (now '+G.p._resonance+').','chg'); }
    }
    zanshinAdvance();
  }
  // Tick down Bound counters on the side that just started its turn (it blocks THEIR defense).
  G[sk].bots.forEach(b=>{ if(b._bound>0){ b._bound--; } });

  // Plunder medal: 6+ Doubloons at turn start → draw a card (applies to whichever side is charging)
  if(alive(G[sk]).some(b=>b.medal==='plunder') && coins(sk)>=6){
    drw(G[sk],1); if(sk==='p')log('Plunder: 6+ Doubloons — drew a card!','chg');
  }
}

