// ═══ ZANSHIN SEQUENCER ═══════════════════════════════════════════
// Beat 1 was fired in resolveMF (Verdicts assigned, blades committed).
// This runs at the start of each of YOUR charge phases:
//   • first call after firing  -> we are entering the Interval (Beat 2)
//   • second call              -> the Cut lands (Beat 3)
function zanshinValid(){
  if(!G._zanshin) return false;
  // A Verdict vanishes if its blade was KO'd. Drop dead blades.
  G._zanshin.verdicts = G._zanshin.verdicts.filter(v=>{
    const b=alive(G.p).find(x=>x.key===v.botKey);
    if(!b){ log('\u2620 '+v.botKey.toUpperCase()+' has fallen \u2014 its Verdict vanishes.','info'); return false; }
    return true;
  });
  return G._zanshin.verdicts.length>0;
}
function zanshinAdvance(){
  if(!G._zanshin) return;
  if(!zanshinValid()){ if(G._zanshin && !G._zanshin.verdicts.length){ log('Zanshin collapses \u2014 no blade remains to finish the cut.','info'); } G._zanshin=null; return; }
  const z=G._zanshin;
  if(z.phase===1){
    // Enter the Interval. Snapshot enemy HP for Execution "ignore heal" check.
    z.phase=2;
    z.snapshot={};
    G.c.bots.forEach(b=>{ z.snapshot[b.uid]={hp:b.hp}; });
    z.punish={attacked:false,defended:false,healed:false};
    log('\u2694 ZANSHIN: The Interval. Every defense the enemy makes now backfires when the cut lands.','info');
    if(typeof banner==='function')banner('THE INTERVAL','#c83232');
    return;
  }
  if(z.phase===2){
    // The Cut. Resolve all surviving Verdicts in Stance order.
    zanshinResolveCut();
    G._zanshin=null;
  }
}
function zanshinResolveCut(){
  const z=G._zanshin; if(!z) return;
  log('\u2694\u2694\u2694 ZANSHIN: THE CUT FALLS.','atk');
  if(typeof banner==='function')banner('THE REMAINING CUT','#c83232');
  try{ fxBlueX&&fxBlueX(); _fxShake&&_fxShake(); }catch(e){}
  const order=['bound','exposed','exec'];
  const survivors=[];
  order.forEach(type=>{
    const v=z.verdicts.find(x=>x.type===type); if(!v) return;
    const blade=alive(G.p).find(b=>b.key===v.botKey); if(!blade) return; // vanished
    let t=G.c.bots.find(b=>b.uid===v.targetUid);
    if(!t||t.def){ // original target gone — redirect to a living foe of same profile
      const foes=alive(G.c); if(!foes.length) return;
      t=type==='exec'?[...foes].sort((a,b)=>a.hp-b.hp)[0]:[...foes].sort((a,b)=>b.hp-a.hp)[0];
    }
    if(!t||t.def) return;
    survivors.push(t.uid);
    if(type==='bound'){
      let d=blade.atk; if(z.punish.attacked) d*=2; // punish: attacked during Interval
      t._bound=2; // can't defend next turn
      if(blade.changed) t.charge=Math.max(0,(t.charge||0)-2);
      dmg(t,d,'c');
      log('\u2693 Gobanko Binds '+t.name+' for '+d+(z.punish.attacked?' (PUNISH x2)':'')+'!','atk');
    } else if(type==='exposed'){
      const tiers=(blade.changed?2:1)+(z.punish.defended?1:0); // punish: defended during Interval
      t._defStrip=(t._defStrip||0)+tiers;
      G._pierceDmg=true; dmg(t,blade.atk,'c'); G._pierceDmg=false;
      log('\u2702 Samurai Exposes '+t.name+' \u2014 strips '+tiers+' defense tier(s)'+(z.punish.defended?' (PUNISH)':'')+'!','atk');
    } else if(type==='exec'){
      if(z.snapshot){ G.c.bots.forEach(b=>{ if(z.snapshot[b.uid]&&b.hp>z.snapshot[b.uid].hp) z.punish.healed=true; }); }
      // Execution: unblockable. Punish (healed) -> hit pre-heal HP. True Zanshin if all three landed same bot.
      const allSame = survivors.filter(u=>u===t.uid).length>=1 && z.verdicts.every(v2=>{
        const tv=G.c.bots.find(b=>b.uid===v2.targetUid); return tv&&tv.uid===t.uid;
      });
      if(allSame){
        log('\u2620 TRUE ZANSHIN \u2014 the blade already fell. '+t.name+' is executed.','atk');
        if(typeof banner==='function')banner('TRUE ZANSHIN','#ff2020');
        dmg(t,9999,'c');
      } else {
        let preHeal=null;
        if(z.punish.healed && z.snapshot[t.uid]) preHeal=z.snapshot[t.uid].hp;
        G._pierceDmg=true;
        let d=blade.atk;
        if(preHeal!=null && t.hp>preHeal){ const ignore=t.hp-preHeal; d+=ignore; log('Execution ignores the heal ('+ignore+' HP)!','atk'); }
        dmg(t,d,'c'); G._pierceDmg=false;
        log('\u2620 Shinsaber Executes '+t.name+' for '+d+' (Unblockable)!','atk');
      }
    }
  });
  // Release the committed blades.
  ['gobanko','samurai','shinsaber'].forEach(k=>{ const b=G.p.bots.find(x=>x.key===k); if(b)b._zCommitted=false; });
  if(!G.winner) renderAll();
}

function endTurn(){
  if(G.phase!=='action')return;
  if(G_online&&!G_myTurn){log('Not your turn.','info');return;}
  // TentaClam — Hoarder's Eye: end of turn, +1 Doubloon per other living crewmate (max +2)
  const _tenta=alive(G.p).find(b=>b.key==='tentaclam');
  if(_tenta){
    const others=Math.min(2, alive(G.p).filter(b=>b!==_tenta).length);
    if(others>0){ const got=earnCoins('p',others); if(got>0)log("Hoarder's Eye: +"+got+' Doubloons (now '+coins('p')+').','chg'); }
  }
  G.p.selBot=null;G.p.selCard=null;
  G.phase='cpu_turn';atked=false;actionsLeft=0; // locked during CPU turn
  if(G_online&&G_myTurn){ MWNet.syncState(buildMySideState()); MWNet.endTurn(); lockForOpponentTurn(); }
  // Clear support buff accumulators — recalculated next turn in applySupportPassives
  const pAct=getActiveBot('p');
  if(pAct){pAct._supportAtk=0;pAct._supportDef=0;pAct._warbDraw=false;}
  // Overforge cleanup: shed equipment, restore base ATK
  G.p.bots.forEach(b=>{ if(b._overforged!==undefined){ b.atk=b._overforged; delete b._overforged; if(b.key==='grand_beetle'){b.equips=[];} else {b.equip=null;} log(b.name+' sheds all equipment after Overforge.','eq'); } });
  forgeEndOfTurn('p');
  log('Turn ends.','info');
  doCharge('c');drw(G.c,2); // mirrors opponent charge+draw online too
  if(!G_online) setTimeout(cpuTurn,900); // online: opponent plays, not CPU
}

