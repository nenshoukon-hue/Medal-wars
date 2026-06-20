// ═══ CPU AI ═══
// ═══ SMART CPU AI ═══
// Evaluates board state, threat levels, and strategic priorities per deck archetype

// ═══ CPU AI HELPERS ═══════════════════════════════════════

function cpuScore(){
  const pHP=alive(G.p).reduce((s,b)=>s+b.hp,0);
  const cHP=alive(G.c).reduce((s,b)=>s+b.hp,0);
  const pChg=alive(G.p).reduce((s,b)=>s+b.charge,0);
  const cChg=alive(G.c).reduce((s,b)=>s+b.charge,0);
  const pBots=alive(G.p).length,cBots=alive(G.c).length;
  return (cHP-pHP)+(cBots-pBots)*10+(cChg-pChg)*0.6;
}

function cpuThreat(){
  let t=0;
  alive(G.p).forEach(b=>{
    t+=b.charge*2;if(b.charge>=5)t+=8;
    if(b.changed)t+=6;if(b.equip)t+=2;t+=b.atk;
  });
  return t;
}

function cpuBestAttacker(){
  const atkers=alive(G.c).filter(b=>!b.exhst);
  if(!atkers.length)return null;
  // EASY: random attacker 40% of the time
  if(cpuDiff==='easy'&&Math.random()<0.4){
    return atkers[Math.floor(Math.random()*atkers.length)];
  }
  return atkers.sort((a,b)=>{
    const sA=(a.changed?12:0)+a.atk*2+(a.equip?3:0)+(a.charge>=5?4:0);
    const sB=(b.changed?12:0)+b.atk*2+(b.equip?3:0)+(b.charge>=5?4:0);
    return sB-sA;
  })[0];
}

function cpuBestTarget(power){
  const tgts=alive(G.p);if(!tgts.length)return null;
  if(G.tauntActive){const taunt=tgts.find(b=>b.taunting);if(taunt)return taunt;}
  const activeP=getActiveBot('p');
  // EASY: sometimes attack wrong bot or miss best play
  if(cpuDiff==='easy'&&Math.random()<0.3){
    return tgts[Math.floor(Math.random()*tgts.length)];
  }
  if(activeP)return activeP;
  const kills=tgts.filter(b=>b.hp<=power);
  if(kills.length){
    return kills.sort((a,b)=>{
      const ta=a.charge*2+a.atk+(a.changed?8:0)+(a.equip?2:0);
      const tb=b.charge*2+b.atk+(b.changed?8:0)+(b.equip?2:0);
      return tb-ta;
    })[0];
  }
  return tgts.sort((a,b)=>{
    const ta=a.charge*1.8+a.atk*1.5+(a.changed?8:0)+(a.equip?3:0)+(a.fusedMedal?2:0);
    const tb=b.charge*1.8+b.atk*1.5+(b.changed?8:0)+(b.equip?3:0)+(b.fusedMedal?2:0);
    return tb-ta;
  })[0];
}

function cpuScoreTech(t,attacker,target){
  const fx=t.fx;let s=0;
  const handSize=G.c.hand.length;
  if(fx==='deal5_burn'||fx==='deal6_burn') s=target.hp<=9?14:target.hp<=14?9:5;
  if(fx==='deal3_burn_all'){const unburnedEnemies=alive(G.p).filter(b=>!b.burn).length;s=unburnedEnemies>=2?13:unburnedEnemies?7:2;}
  if(fx==='deal2_scorch') s=target.burn?16:3; // massive value on pre-burned target
  if(fx==='deal1_ember') s=attacker.charge<=2?12:attacker.charge<=3?8:4; // best early
  if(fx==='deal4_chain'){const n=alive(G.p).length;s=n>1?12:6;if(target.hp<=4)s+=3;}
  if(fx==='deal3_charge') s=attacker.charge>=3?10:attacker.charge>=1?7:4;
  if(fx==='deal3_drain'||fx==='deal5_drain'){const near=alive(G.p).filter(b=>b.charge>=4);const ign=alive(G.p).filter(b=>b.charge>=5);s=ign.length?16:near.length?12:(fx==='deal5_drain'?5:3);}
  // Reactive: if player has burn on our bots, de-prioritize attacks (prefer healing/drain)
  const playerHasBurn=alive(G.p).some(b=>b.burn);
  const ourBotsBurning=alive(G.c).some(b=>b.burn);
  if(ourBotsBurning&&fx==='deal2_heal')s+=8; // urgently heal burning bots
  if(playerHasBurn&&(fx==='deal3_drain'||fx==='deal5_drain'))s+=5; // disrupt player while they're set up
  if(fx==='deal2_heal') s=attacker.hp<=attacker.maxHp*0.35?11:attacker.hp<=attacker.maxHp*0.6?5:1;
  if(fx==='deal2_draw') s=handSize<=2?12:handSize<=4?6:2;
  const techDmg={deal5_burn:5,deal4_chain:4,deal3_charge:3,deal3_drain:3,deal5_drain:5,deal2_heal:2,deal2_draw:2}[fx]||0;
  const atk=attacker.atk+(attacker.changed?3:0)+(attacker.medal==='blaze'?1:0)+(attacker.equip&&attacker.equip.fx==='eq_blaze_arm'?2:0);
  if(target.hp<=(atk+techDmg))s+=6;
  // ── Royal/Digi techniques ─────────────────────────────
  if(fx==='deal5_dramon') s=target.equip?16:11;
  // ── Shadow Blade technique scoring ────────────────────
  if(fx==='deal3_chain_free') s=target.hp<=6?13:9; // free tech, always good
  if(fx==='deal2_combo') s=alive(G.c).some(b=>b.key==='gokudo')?11:6;
  if(fx==='deal4_exhaust') s=target.hp<=8?13:target.atk>=5?11:7;
  if(fx==='deal3_draw_chain') s=handSize<=3?12:8;
  if(fx==='deal4_combo_boost') s=alive(G.c).some(b=>b.key==='gokudo')?13:7;
  // ── Iron Throne technique scoring ─────────────────────
  if(fx==='deal6_siege') s=target.hp<=10?15:12;
  if(fx==='deal4_drain2') s=target.charge>=3?13:8;
  if(fx==='deal5_siege_p') s=target.hp<=8?15:11;
  if(fx==='deal3_suppress') s=target.atk>=5?12:target.hp<=6?11:7;
  if(fx==='deal3_nova'){const ec=alive(attacker===G.c.bots[G.c.activeBot]?G.p:G.c).length;s=ec>=3?13:ec>=2?10:7;}
  if(fx==='deal2_volley'){const wk=alive(attacker===G.c.bots[G.c.activeBot]?G.p:G.c).filter(b=>b.hp<=6).length;s=wk>=2?12:wk?9:6;}
  if(fx==='deal5_pierce'){const hasTitan=target.medal==='titan'||target.key==='rokusho';s=hasTitan?15:10;}
  return s;
}

function cpuChooseTech(attacker,target){
  const techs=G.c.hand.filter(c=>c.type==='technique');
  if(!techs.length)return null;
  const scored=techs.map(t=>({t,s:cpuScoreTech(t,attacker,target)}));
  scored.sort((a,b)=>b.s-a.s);
  return scored[0].s>=4?scored[0].t:null;
}

function cpuChooseAction(){
  const acts=G.c.hand.filter(c=>c.type==='action'||c.type==='equipment');
  if(!acts.length)return null;
  const score=cpuScore();const threat=cpuThreat();
  const pNearIgn=alive(G.p).filter(b=>b.charge>=4).length;
  const pIgnited=alive(G.p).filter(b=>b.charge>=5).length;
  const cBestChg=alive(G.c).length?Math.max(...alive(G.c).map(b=>b.charge)):0;
  const cAlive=alive(G.c).length; const pAlive=alive(G.p).length;
  const scored=acts.map(a=>{
    let s=0;const fx=a.fx;
    if(fx==='act_charge'){const hasMF=G.c.hand.some(c=>c.type==='medaforce');s=cBestChg>=3&&hasMF?13:cBestChg>=3?9:cBestChg>=1?6:3;}
    if(fx==='act_titan_call'){
      // Titan Call: great when team is damaged, especially with Rokusho active
      const teamDmg=alive(G.c).reduce((s,b)=>s+(b.maxHp-b.hp),0);
      const hasRok=alive(G.c).some(b=>b.key==='rokusho'&&G.c.activeBot===G.c.bots.indexOf(b));
      s=teamDmg>=8?15:teamDmg>=4?10:5;if(hasRok)s+=4;
    }
    if(fx==='act_overload_surge'){
      // Overload Surge: drain all enemy Charge — best when the player is loading up for a Medaforce
      const charged=alive(G.p).filter(b=>(b.charge||0)>=3).length;
      const anyCharge=alive(G.p).some(b=>(b.charge||0)>0);
      s=charged>=2?14:charged===1?10:anyCharge?5:1;
    }
    if(fx==='act_heatwave'){
      const burning=alive(G.p).filter(b=>b.burn).length;
      s=burning>=2?14:burning===1?8:0;
    }
    if(fx==='act_overload'){
      const hasMF=G.c.hand.some(c=>c.type==='medaforce');
      const hasIgn=alive(G.c).some(b=>b.charge>=4);
      s=hasMF&&hasIgn?12:hasMF?7:1;
    }
    if(fx==='act_ikki') s=alive(G.c).some(b=>b.hp<=5)?8:0;
    if(fx==='act_draw2'){const hasBurn=alive(G.p).some(b=>b.burn);s=G.c.hand.length<=2?13:G.c.hand.length<=4?7:hasBurn?6:2;}
    if(fx==='act_drain') s=pIgnited?18:pNearIgn>=2?15:pNearIgn?12:4;
    if(fx==='act_fusion'){const d=G.c.bots.filter(b=>b.def&&!b.fAway);s=d.length&&alive(G.c).length?10:0;}
    if(a.type==='equipment'){
      const bestBot=alive(G.c)[0];
      if(fx==='eq_resonator') s=cBestChg<=2?13:8;
      if(fx==='eq_ghost'){const lb=alive(G.c).sort((a,b)=>a.hp-b.hp)[0];s=lb&&lb.hp<=10?12:6;}
      if(fx==='eq_blaze_arm') s=alive(G.c).some(b=>b.changed)?10:7;
      if(fx==='eq_burn') s=score<0?10:threat>15?8:5;
      if(fx==='eq_hunter'){const w=alive(G.p).filter(b=>b.hp<=b.maxHp/2).length;s=w>=2?12:w?8:2;}
      if(fx==='eq_counter') s=score<-5?8:threat>12?6:3;
      if(fx==='eq_fury'){const ch=alive(G.c).find(b=>b.changed);s=ch?12:6;}
      if(fx==='eq_lens'){const ign=alive(G.c).filter(b=>b.charge>=4);const hMF=G.c.hand.some(c=>c.type==='medaforce');s=ign.length&&hMF?13:ign.length?7:2;}
      if(bestBot&&bestBot.equip&&bestBot.equip.fx===fx)s=0;
      // ── Shadow Blade equipment ──────────────────────────
      if(fx==='eq_ninja_scroll'){
        const nin=alive(G.c).find(b=>b.key==='nin_ninja');s=nin?12:4;
      }
      if(fx==='eq_combo_core'){
        const gok=alive(G.c).find(b=>b.key==='gokudo');s=gok?11:4;
      }
      // ── Royal/Digi equipment ──────────────────────────
      if(fx==='eq_royal_lance'){const hasOmega=alive(G.c).some(b=>b.key==='omegaknight');s=hasOmega?13:6;}
      if(fx==='eq_digibond'){const hasOmega=alive(G.c).some(b=>b.key==='omegaknight'&&!b.def);s=hasOmega?12:7;}
    }
    // ── ROYAL trap scoring ───────────────────────────────
    if(a.type==='trap'){
      if(fx==='trap_negate') s=threat>=5?14:8;
      if(fx==='trap_nullmf') s=pIgnited?16:pNearIgn?10:3;
      if(fx==='trap_reflect') s=threat>=6?13:7;
      if(fx==='trap_block') s=threat>=5?11:6;
      if(fx==='trap_honor'){
        const omega=alive(G.c).find(b=>b.key==='omegaknight');
        s=omega&&omega.hp>=12?13:omega&&omega.hp>=6?8:2;
      }
      if(fx==='trap_digiblock'){
        const wg=alive(G.c).find(b=>b.key==='wargreymon');
        s=threat>=5&&wg?14:threat>=5?11:6;
      }
    }
    // ── ROYAL action scoring ─────────────────────────────
    // ── Shadow Blade action scoring ──────────────────────
    if(fx==='act_combo'){
      const gok=alive(G.c).find(b=>b.key==='gokudo');
      s=G.c.hand.length<=3?14:gok?11:8;
    }
    if(fx==='act_chain_chg'){s=cBestChg<=2?13:9;}
    if(fx==='act_fox_heal'){
      const dmg=alive(G.c).reduce((t,b)=>t+(b.maxHp-b.hp),0);
      s=dmg>=12?15:dmg>=6?11:5;
    }
    if(fx==='act_shadow_step'){
      const nin=alive(G.c).find(b=>b.key==='nin_ninja');s=nin?12:3;
    }
    // Shadow trap
    if(fx==='trap_counterblade'){
      const nin=alive(G.c).find(b=>b.key==='nin_ninja');s=threat>=4&&nin?13:threat>=4?9:5;
    }
    if(fx==='act_royal'){
      s=G.c.hand.length<=3?15:cBestChg<=2?12:9;
    }
    if(fx==='act_sacrifice'){
      const omega=alive(G.c).find(b=>b.key==='omegaknight');
      const weakest=alive(G.c).sort((a,b)=>a.hp-b.hp)[0];
      s=(omega&&weakest&&weakest!==omega&&weakest.hp<=8)?13:omega?7:0;
    }
    if(fx==='act_evolve'){
      const activeBot=alive(G.c)[0];
      const activeIsDigi=activeBot&&(activeBot.key==='wargreymon'||activeBot.key==='metalgurumemon');
      s=activeIsDigi?14:alive(G.c).some(b=>b.key==='wargreymon'||b.key==='metalgurumemon')?10:7;
    }
    if(fx==='act_digiload'){
      const mg=alive(G.c).find(b=>b.key==='metalgurumemon');
      s=mg&&alive(G.p).length?mg.atk>=4?12:9:0;
    }
    return {a,s};
  });
  scored.sort((a,b)=>b.s-a.s);
  // Easy: only play actions if score is very high (often skips good plays)
  const threshold=cpuDiff==='easy'?8:cpuDiff==='hard'?2:3;
  return scored[0].s>=threshold?scored[0].a:null;
}

function cpuBurnReaction(){
  // Called at start of CPU turn — reactive to burn state
  const ourBurning=alive(G.c).filter(b=>b.burn);
  const playerIgnited=alive(G.p).filter(b=>b.charge>=5).length;
  // If we're burning, log a warning and prioritize finishing fast
  if(ourBurning.length>0){
    log('CPU reacting to burn on '+ourBurning.map(b=>b.name).join(', '),'cpu');
  }
}

function cpuShouldMedaforce(){
  const ign=alive(G.c).filter(b=>b.charge>=5);
  const mfs=G.c.hand.filter(c=>c.type==='medaforce');
  if(!ign.length||!mfs.length)return false;
  const pIgnited=alive(G.p).filter(b=>b.charge>=5).length;
  const score=cpuScore();
  const best=mfs[0];
  const mfPow=best.fx==='mf_blaze'?8:4;
  if(alive(G.p).some(b=>b.hp<=mfPow))return true;
  if(pIgnited>=2)return true;
  if(score<-6)return true;
  if(best.fx==='mf_titan')return alive(G.p).length>=2&&score<3;
  if(best.fx==='mf_lightning')return alive(G.p).length>=2||score<0;
  return score<2;
}

function cpuShouldMedachange(){
  const _cRoyal=G.c.bots.some(b=>['omegaknight','wargreymon','metalgurumemon'].includes(b.key));
  if(G.c.mcUsed && !_cRoyal)return false;
  // Royal can keep evolving as long as it has an un-evolved bot
  if(_cRoyal && !alive(G.c).some(b=>!b.changed))return false;
  const mcs=G.c.hand.filter(c=>c.type==='medachange');
  if(!mcs.length)return false;
  const score=cpuScore();const threat=cpuThreat();
  const pAlive=alive(G.p).length;const cAlive=alive(G.c).length;
  if(threat>=18)return true;
  if(score<-4&&cAlive>=2)return true;
  if(pAlive===1&&score>0&&cAlive>=2)return true;
  if(alive(G.p).filter(b=>b.charge>=5).length>=2)return true;
  return false;
}


// ═══════════════════════════════════════════════════════════
//  PRO AI — Universal Tactical Layer (Hard difficulty)
//  Built on existing primitives: cpuScore, cpuThreat, alive, dmg, etc.
// ═══════════════════════════════════════════════════════════

// Estimate the raw damage a given CPU attacker would deal to a target THIS hit,
// accounting for medals, equipment, changed state, and known reductions.
function aiAttackPower(a, d){
  let p=a.atk;
  if(a.medal==='blaze'||a.fusedMedal==='blaze')p+=1;
  // Zero medal charge-scaling: +1 per 2 charge, +4 at max (mirrors resolveAtk)
  if(a.medal==='zero'||a.fusedMedal==='zero'){ p+=Math.floor((a.charge||0)/2); if((a.charge||0)>=5)p+=4; }
  if(a.key==='cross_messiah'&&a.changed)p+=Math.floor((a.charge||0)/2);
  if(a.key==='beetle_gun'&&(a.charge||0)>=4)p+=2;
  if(a.changed)p+=3;
  if(a.equip&&a.equip.fx==='eq_blaze_arm')p+=2;
  if(a.key==='grand_beetle')p+=(a.equips||[]).length;
  // Power Conduit threshold
  if(typeof forgeCount==='function'&&forgeCount('c')>=3&&G.c.bots.some(b=>!b.def&&(typeof botEquips==='function'?botEquips(b):[]).some(e=>e.fx==='fb_conduit')))p+=1;
  if(a.equip&&a.equip.fx==='eq_hunter'&&d&&d.hp<=d.maxHp/2)p+=3;
  // Estimate target reduction (Titan medal, bulwark) — forge medal/targeting pierces
  let red=0;
  if(d){
    if(d.medal==='titan')red+=(d.changed?2:1);
    if(d.equip&&d.equip.fx==='gen_bulwark')red+=1;
    const pierce=(a.medal==='forge'||a.fusedMedal==='forge')?1:0;
    red=Math.max(0,red-pierce);
  }
  return Math.max(0, p-red);
}

// Best technique damage bonus the CPU could add to an attack (without committing yet)
function aiBestTechBonus(a, d){
  const techs=G.c.hand.filter(c=>c.type==='technique');
  if(!techs.length) return {bonus:0, tech:null};
  let best={bonus:0, tech:null};
  techs.forEach(t=>{
    const b=({deal5_burn:5,deal6_burn:6,deal4_chain:4,deal3_charge:3,deal3_drain:3,deal5_drain:5,deal2_heal:2,deal2_draw:2,deal3_burn_all:3,deal2_scorch:6,deal1_ember:1,iron_strike:4,gen_surge:(a.hp<a.maxHp/2?6:4),gen_pile:3,fb_scrapblast:5,fb_salvagestrike:3,fb_overloadslam:((a.key==='grand_beetle'?(a.equips||[]).length:(a.equip?1:0))*2)}[t.fx]||0);
    if(b>best.bonus) best={bonus:b, tech:t};
  });
  return best;
}

// LETHAL DETECTION: can the CPU kill a specific player bot this turn?
// Considers: best attacker + best technique + (optionally) a ready Medaforce.
function aiCanKill(target){
  if(!target||target.def) return false;
  let dmgPool=0;
  // Each unexhausted attacker contributes its power
  alive(G.c).filter(b=>!b.exhst).forEach(a=>{
    dmgPool+=aiAttackPower(a,target);
  });
  // Plus best technique (applies once)
  const atkers=alive(G.c).filter(b=>!b.exhst);
  if(atkers.length){
    const tb=aiBestTechBonus(atkers[0],target);
    dmgPool+=tb.bonus;
  }
  // Plus ready single-target Medaforce (Blaze ~8)
  const ign=alive(G.c).filter(b=>b.charge>=5);
  const mfs=G.c.hand.filter(c=>c.type==='medaforce');
  if(ign.length&&mfs.some(m=>m.fx==='mf_blaze')) dmgPool+=8;
  return dmgPool>=target.hp;
}

// Richer board evaluation than cpuScore — used to compare candidate lines.
function aiEvalBoard(){
  let s=cpuScore(); // base: HP + board + charge
  // Card advantage
  s+=(G.c.hand.length-G.p.hand.length)*1.5;
  // Reward CPU bots close to Medaforce
  alive(G.c).forEach(b=>{ if(b.charge>=5)s+=5; else if(b.charge>=4)s+=2.5; if(b.changed)s+=4; });
  // Penalize player threats
  s-=cpuThreat()*0.4;
  // Forge: reward equipment in play / threshold proximity
  if(typeof forgeCount==='function'){ const fc=forgeCount('c'); if(fc>=5)s+=8; else if(fc>=3)s+=4; else s+=fc; }
  return s;
}

// PRO multi-attack: attack with EVERY able bot, focus-firing for kills.
function aiProAttack(){
  if(G.winner){return;}
  const attackers=alive(G.c).filter(b=>!b.exhst);
  if(!attackers.length||!alive(G.p).length){endCpu();return;}

  // Order attackers weakest-first so techniques/big hits are saved for finishing
  attackers.sort((a,b)=>aiAttackPower(a,null)-aiAttackPower(b,null));

  // Process one attacker, then chain to the next via setTimeout (keeps animations)
  function doNext(idx){
    if(G.winner){return;}
    if(idx>=attackers.length){ endCpu(); return; }
    const a=attackers[idx];
    if(a.def||a.exhst){ doNext(idx+1); return; }
    const tgts=alive(G.p);
    if(!tgts.length){ return; } // win already handled

    // Trap caution (hard AI plays around reflect only when it would be lethal to self)
    const hasMirror=(G.pTraps||[]).some(t=>t.fx==='trap_reflect');

    // Target selection: prefer a bot we can KILL this hit; else highest threat.
    let target=null;
    // 1) Look for a kill with this attacker + best tech
    const tb=aiBestTechBonus(a, tgts[0]);
    let bestKill=null;
    tgts.forEach(t=>{
      const pow=aiAttackPower(a,t)+tb.bonus;
      if(pow>=t.hp){ if(!bestKill||t.charge>bestKill.charge) bestKill=t; }
    });
    if(bestKill) target=bestKill;
    // 2) else focus the lowest-HP bot we can damage most (chip toward future kills)
    if(!target){
      target=tgts.slice().sort((x,y)=>{
        // prioritize: about-to-ignite, then changed, then lowest HP
        const sx=(x.charge>=5?100:x.charge>=4?40:0)+(x.changed?30:0)+(50-x.hp);
        const sy=(y.charge>=5?100:y.charge>=4?40:0)+(y.changed?30:0)+(50-y.hp);
        return sy-sx;
      })[0];
    }
    if(!target){ doNext(idx+1); return; }

    if(hasMirror&&a.hp<=5){ // would die to reflect — skip this attacker
      log('CPU holds '+a.name+' back from a trap.','cpu');
      doNext(idx+1); return;
    }

    // Commit best technique only if it secures a kill or adds real value
    let total=aiAttackPower(a,target);
    let usedTech=null;
    const killTb=aiBestTechBonus(a,target);
    const wouldKillWithTech=(aiAttackPower(a,target)<target.hp)&&(aiAttackPower(a,target)+killTb.bonus>=target.hp);
    const bigValue=killTb.bonus>=5;
    if(killTb.tech&&(wouldKillWithTech||bigValue)){
      dsc(G.c,killTb.tech.uid);
      total+=applyTechC(killTb.tech,a,target);
      usedTech=killTb.tech;
      log('CPU plays '+killTb.tech.name,'cpu');
    }

    log('CPU: '+a.name+' \u2192 '+target.name+' for '+total+'!','cpu');
    // Player traps
    const trapRes=checkPlayerTraps('attack',a);
    if(trapRes.negate){a.exhst=true;if(!G.winner)renderAll();setTimeout(()=>doNext(idx+1),350);return;}
    if(trapRes.reduce){total=Math.max(1,total-trapRes.reduce);}
    let realTarget=target;
    if(trapRes.redirect){realTarget=trapRes.redirect;}
    G._curAtkr=a; dmg(realTarget,total,'p'); G._curAtkr=null;
    // Plunder economy: the pro-AI attack path bypasses resolveAtk, so earn Doubloons here too.
    if(a.medal==='plunder'){
      let earn=2;
      if(a.key==='piraskull')earn+=1;                  // Captain's Cut
      if(a.equip&&a.equip.fx==='bt_coincannon')earn+=1; // Coin Cannon
      earnCoins('c',earn);
    }
    a.exhst=true;
    checkWin();
    // Lightning double-strike
    const thr=a.changed&&a.medal==='lightning'?2:4;
    if((a.medal==='lightning'||a.fusedMedal==='lightning')&&total>=thr&&!a._dbl&&!G.winner){
      a._dbl=true;
      setTimeout(()=>{
        if(!G.winner&&alive(G.p).length){
          const t2=alive(G.p).sort((x,y)=>x.hp-y.hp)[0];
          if(t2){const d2=a.atk+(a.changed?(a.key==='rokusho'?4:5):0);log('Lightning DOUBLE!','atk');G._curAtkr=a;dmg(t2,d2,'p');G._curAtkr=null;checkWin();}
        }
        a._dbl=false;
        setTimeout(()=>doNext(idx+1),300);
      },500);
      return;
    }
    setTimeout(()=>doNext(idx+1), 380);
  }
  doNext(0);
}

// ═══ PER-DECK STRATEGY BRAINS (Hard) ═══
// Each returns true if it took an action that should pause before attacking.
// They decide MEDACHANGE / EQUIP / ACTION / MEDAFORCE priorities by win-condition.

function aiDeckBrain(){
  const d=G.c._deckKey||deck; // CPU's deck identity
  // Identify by the bots present (robust even if _deckKey absent)
  const keys=G.c.bots.map(b=>b.key);
  if(keys.includes('grand_beetle')) return aiBrainForge();
  if(keys.includes('robo_emperor')) return aiBrainThrone();
  if(G.c.bots.some(b=>b.medal==='titan')&&keys.includes('rokusho')) return aiBrainTitan();
  if(keys.includes('metabee')&&G.c.bots.some(b=>b.medal==='blaze')) return aiBrainBlaze();
  if(G.c.bots.some(b=>['omegaknight','wargreymon','metalgurumemon'].includes(b.key))) return aiBrainRoyal();
  if(G.c.bots.some(b=>b.key==='nin_ninja'||b.key==='gokudo')) return aiBrainShadow();
  return aiBrainGeneric();
}

// BLAZE: stack burn, then cash with Scorch/Inferno. Keep igniting.
function aiBrainBlaze(){
  // Priority: charge up a blaze bot to Medaforce, apply burn pressure.
  aiPlayActionsByValue(['act_charge','act_draw2']);
  return false;
}

// TITAN: deny charge, endure, grind. Drain proactively, not just in emergency.
function aiBrainTitan(){
  // ── MASTERBEETLE COMBINING (CPU) ──
  // Priority 1: complete the fusion chain whenever possible.
  const arc=G.c.bots.find(b=>b.key==='arcbeetle'&&!b.def);
  const mach=G.c.bots.find(b=>b.key==='machairodus'&&!b.def);
  const mb=G.c.bots.find(b=>b._masterbeetle&&!b.def);
  const rok=G.c.bots.find(b=>b.key==='rokusho'&&!b.def);
  const hasMC=(fx)=>G.c.hand.some(c=>c.fx===fx);
  // Stage 2: Master Medachange if Masterbeetle + Rokusho + card available
  if(mb && !mb._masterMode && rok && hasMC('mc_bot_rokusho')){ aiDoMedachange(); return false; }
  // Stage 1: X Fusion Change if both beetles + card available
  if(arc && mach && !mach._masterbeetle && hasMC('mc_bot_machairodus')){ aiDoMedachange(); return false; }
  // Otherwise: disrupt + develop while assembling the fusion.
  const drain=G.c.hand.find(c=>c.fx==='medal_dampener');
  const pHigh=alive(G.p).sort((a,b)=>b.charge-a.charge)[0];
  if(drain&&pHigh&&pHigh.charge>=3){
    dsc(G.c,drain.uid); pHigh.charge=Math.max(0,pHigh.charge-2);
    log('CPU drains '+pHigh.name+' (-2 Charge).','cpu');
  }
  // Mark a target so Machairodus hits harder, then play value actions.
  aiPlayActionsByValue(['act_overload_surge','act_titan_call','act_charge']);
  return false;
}

// SHADOW: chain multiple techniques in one turn to fuel Combo Cannon.
function aiBrainShadow(){
  aiPlayActionsByValue(['act_draw2','act_charge']);
  // Shadow wants to hold techniques for the attack step (combo). Handled in attack.
  return false;
}

// THRONE: solo Emperor — turtle, ramp charge, fire Imperial Barrage when ready.
function aiBrainThrone(){
  aiPlayActionsByValue(['act_charge','system_repair','act_draw2']);
  return false;
}

// ROYAL: protect the front line, set up, finish with DigiStrike when 2+ strikers.
function aiBrainRoyal(){
  aiPlayActionsByValue(['act_charge','royal_summons','act_draw2']);
  return false;
}

// FORGE: assemble equipment (done in equip step), cross thresholds, Overforge finish.
function aiBrainForge(){
  // Equipment handled in the universal equip step. Here: decide sacrifice tech / heal.
  // Heal a wounded key bot with Nano-Mend/Field Weld if below half.
  const heal=G.c.hand.find(c=>c.fx==='fb_nanomend'||c.fx==='fb_fieldweld');
  const hurt=alive(G.c).filter(b=>b.hp<b.maxHp/2).sort((a,b)=>a.hp-b.hp)[0];
  if(heal&&hurt){
    dsc(G.c,heal.uid);
    const amt=heal.fx==='fb_nanomend'?(alive(G.c).some(b=>b.key==='neutranurse')?9:6):4;
    hurt.hp=Math.min(hurt.maxHp,hurt.hp+amt);
    if(heal.fx==='fb_fieldweld')addChg(hurt,1);
    log('CPU heals '+hurt.name+' (+'+amt+').','cpu');
  }
  aiPlayActionsByValue(['gen_recharge','gen_salvage']);
  return false;
}

function aiBrainGeneric(){
  aiPlayActionsByValue([]);
  return false;
}

// Play actions whose value clears a threshold, preferring a priority order.
function aiPlayActionsByValue(priorityFx){
  let played=0;
  let guard=0;
  while(guard<3){
    guard++;
    const act=cpuChooseAction();
    if(!act) break;
    // Respect priority: if priorityFx given and this isn't in it but value is marginal, still play strong ones
    dsc(G.c,act.uid);
    log('CPU plays '+act.name+'.','cpu');
    executeCpuAction(act);
    played++;
    if(played>=2) break; // at most 2 actions per turn (action economy)
  }
  return played>0;
}

// ═══ PRO TURN ORCHESTRATOR (Hard difficulty) ═══

// Hybrid: legacy sequencing (preserves combos) + pro lethal awareness.

// Legacy turn = the original heuristic AI (used by Easy/Normal and combo decks on Hard)
function aiLegacyTurn(){
  const _d=cpuDiff;
  cpuDiff='normal'; // run the legacy branch
  try{ cpuTurnLegacy(); } finally { cpuDiff=_d; }
}


// ═══ PRO COMBO AI — Shadow / Royal / Throne specialized piloting ═══

// SHADOW: chain ALL techniques through Gokudo, then attack with Gokudo to cash combo.
function aiProShadow(){
  if(G.winner)return; if(G_online)return;
  G.phase='cpu_turn'; renderHeader(); forgeStartOfTurn('c');
  // Ensure Gokudo is the active attacker (combo cashes on Gokudo's attack)
  const gok=G.c.bots.find(b=>b.key==='gokudo'&&!b.def);
  if(gok&&!G.c.switched&&getActiveBot('c')!==gok){
    G.c.activeBot=G.c.bots.indexOf(gok); G.c.switched=true;
    log('CPU brings Gokudo to front for the combo!','cpu');
  }
  // Play actions first (charge/draw to enable more techniques)
  aiPlayActionsByValue(['act_draw2','act_charge']);
  // Chain every technique we can THIS turn to build Gokudo's combo count.
  const attacker=G.c.bots.find(b=>b.key==='gokudo'&&!b.def)||getActiveBot('c');
  const target=alive(G.p).sort((a,b)=>a.hp-b.hp)[0];
  if(attacker&&target){
    let techs=G.c.hand.filter(c=>c.type==='technique');
    let played=0, guard=0;
    while(techs.length&&guard<6){
      guard++;
      const t=techs[0];
      dsc(G.c,t.uid);
      // applyTechC feeds Gokudo combo + returns bonus; we apply its damage on the final swing
      const bonus=applyTechC(t,attacker,target);
      // techniques that deal immediate damage still apply now
      if(bonus>0&&attacker.key!=='gokudo'){ G._curAtkr=attacker; dmg(target,bonus,'p'); G._curAtkr=null; }
      else if(bonus>0&&attacker.key==='gokudo'){ G._curAtkr=attacker; dmg(target,bonus,'p'); G._curAtkr=null; }
      G.c._techsThisTurn=(G.c._techsThisTurn||0)+1;
      log('CPU chains '+t.name+' (combo building)!','cpu');
      played++;
      checkWin(); if(G.winner)return;
      techs=G.c.hand.filter(c=>c.type==='technique');
    }
    if(played>=3) log('CPU combo: '+played+' techniques chained!','cpu');
  }
  // Medaforce (Karin/Chain Strike scales with techniques played)
  setTimeout(()=>{
    if(G.winner)return;
    aiProMedaforce();
    setTimeout(()=>{ if(!G.winner) aiProAttack(); }, 380);
  }, 340);
}

// ROYAL: protect front, build charge, fire DigiStrike when 2+ strikers are alive.
function aiProRoyal(){
  if(G.winner)return; if(G_online)return;
  G.phase='cpu_turn'; renderHeader(); forgeStartOfTurn('c');
  // Switch the strongest striker to front
  const strikers=alive(G.c).filter(b=>['omegaknight','wargreymon','metalgurumemon'].includes(b.key));
  if(strikers.length&&!G.c.switched){
    const best=strikers.sort((a,b)=>aiAttackPower(b,null)-aiAttackPower(a,null))[0];
    if(best&&getActiveBot('c')!==best){ G.c.activeBot=G.c.bots.indexOf(best); G.c.switched=true; log('CPU fronts '+best.name+'.','cpu'); }
  }
  // Medachange to set up a striker if it helps
  if(cpuShouldMedachange()){ aiDoMedachange(); }
  aiPlayActionsByValue(['act_charge','royal_summons','act_draw2']);
  // DigiStrike timing: hold MF until 2+ strikers, unless lethal now
  setTimeout(()=>{
    if(G.winner)return;
    const mfs=G.c.hand.filter(c=>c.type==='medaforce');
    const digi=mfs.find(c=>c.fx==='mf_digistrike');
    const ign=alive(G.c).filter(b=>b.charge>=5);
    const strikersAlive=alive(G.c).filter(b=>['omegaknight','wargreymon','metalgurumemon'].includes(b.key)).length;
    const lethalNow=alive(G.p).some(b=>aiCanKill(b));
    if(digi&&ign.length&&(strikersAlive>=2||lethalNow)){
      // fire digistrike via standard MF path
      aiProMedaforce();
    } else {
      aiProMedaforce(); // other MF or value
    }
    setTimeout(()=>{ if(!G.winner) aiProAttack(); }, 380);
  }, 340);
}

// THRONE: solo Emperor — ramp charge, turtle, fire Imperial Barrage; attack to finish.
function aiProThrone(){
  if(G.winner)return; if(G_online)return;
  G.phase='cpu_turn'; renderHeader(); forgeStartOfTurn('c');
  // Always charge up; heal if available and wounded
  const emperor=G.c.bots.find(b=>b.key==='robo_emperor'&&!b.def);
  const heal=G.c.hand.find(c=>c.fx==='system_repair'||c.fx==='deal2_heal');
  if(heal&&emperor&&emperor.hp<emperor.maxHp*0.6){
    dsc(G.c,heal.uid); emperor.hp=Math.min(emperor.maxHp,emperor.hp+6); log('CPU Emperor repairs (+6 HP).','cpu');
  }
  aiPlayActionsByValue(['act_charge','act_draw2']);
  // Fire Imperial Barrage MF when charged (Emperor fires at 4 charge per its passive)
  setTimeout(()=>{
    if(G.winner)return;
    const mfs=G.c.hand.filter(c=>c.type==='medaforce');
    const readyCharge=emperor&&emperor.charge>=4;
    if(mfs.length&& readyCharge){
      // route through pro MF (handles imperial)
      aiProMedaforce();
    }
    setTimeout(()=>{ if(!G.winner) aiProAttack(); }, 380);
  }, 340);
}

// Shared: perform a medachange on the best bot.
function aiDoMedachange(){
  const mcs=G.c.hand.filter(c=>c.type==='medachange');
  if(!mcs.length)return;
  // ── Masterbeetle fusion (CPU Titan) ──
  const _cArc=G.c.bots.find(b=>b.key==='arcbeetle'&&!b.def);
  const _cMach=G.c.bots.find(b=>b.key==='machairodus'&&!b.def);
  const _cMB=G.c.bots.find(b=>b._masterbeetle&&!b.def);
  const _cRok=G.c.bots.find(b=>b.key==='rokusho'&&!b.def);
  // Stage 2: if Masterbeetle exists and Rokusho alive, do Master Medachange
  if(_cMB && !_cMB._masterMode && _cRok){
    const mc=mcs.find(c=>c.fx==='mc_bot_rokusho');
    if(mc){
      dsc(G.c,mc.uid);
      _cMB._masterMode=true; _cMB.name='Masterbeetle \u039e'; _cMB.atk=19; _cMB.maxHp=42; _cMB.hp=Math.min(_cMB.hp+14,42);
      _cMB._masterReduce=3; _cMB._masterAoE=true; _cMB._masterHeal=3; _cMB.changed=true;
      _cRok.def=true; _cRok._absorbed=true; G.c.activeBot=G.c.bots.indexOf(_cMB);
      log('CPU MASTER MEDACHANGE: Masterbeetle \u039e!','mc');banner('CPU MASTER MEDACHANGE!','#f0c040');try{medaforceFX('#ffd040');}catch(e){}
      renderAll(); return;
    }
  }
  // Stage 1: if both beetles alive, do X Fusion Change
  if(_cArc && _cMach && !_cMach._masterbeetle){
    const mc=mcs.find(c=>c.fx==='mc_bot_machairodus');
    if(mc){
      dsc(G.c,mc.uid);
      _cMach._masterbeetle=true; _cMach.name='Masterbeetle';
      _cMach.atk=16; _cMach.maxHp=36; _cMach.hp=Math.min(36,_cMach.maxHp);
      _cMach._fusionStalk=true; _cMach._stalwaysOn=true; _cMach._fusionCharge=true; _cMach._fusionPierce=true; _cMach.color='#f0c040';
      _cArc.def=true; _cArc._absorbed=true; G.c.activeBot=G.c.bots.indexOf(_cMach);
      log('CPU X FUSION CHANGE: Masterbeetle forms!','mc');banner('CPU MASTERBEETLE!','#f0c040');try{medaforceFX('#f0c040');}catch(e){}
      renderAll(); return;
    }
  }
  const bot=alive(G.c).sort((a,b)=>(b.atk+b.charge)-(a.atk+a.charge))[0];
  const matchingMC=mcs.find(c=>c.fx==='mc_bot_'+(bot&&bot.key))||mcs[0];
  const targetBot=G.c.bots.find(b=>b.key===matchingMC.fx.replace('mc_bot_','')&&!b.def)||bot;
  if(targetBot){
    dsc(G.c,matchingMC.uid);G.c.mcUsed=true;
    targetBot.changed=true;targetBot.maxHp+=8;targetBot.hp=Math.min(targetBot.hp+8,targetBot.maxHp);
    log('CPU MEDACHANGE: '+targetBot.name+'!','mc');banner('CPU MEDACHANGE!','#f04880');
  }
}

function aiHybridTurn(){
  const keys=G.c.bots.map(b=>b.key);
  if(keys.includes('gokudo')||keys.includes('nin_ninja')) return aiProShadow();
  if(keys.some(k=>['omegaknight','wargreymon','metalgurumemon'].includes(k))) return aiProRoyal();
  if(keys.includes('robo_emperor')) return aiLegacyTurn(); // solo Emperor: legacy pilots it better
  return aiLegacyTurn();
}


// ── CROSS MESSIAH pro AI: hoard charge, scale attacks, fire Cross Burst for lethal ──
function aiProCross(){
  if(G.winner)return;
  G.phase='cpu_turn'; renderHeader(); forgeStartOfTurn('c');
  const me=()=>alive(G.c);
  const enemyActive=()=>getActiveBot('p');

  // 1) Switch the highest-charge / strongest attacker to front
  if(!G.c.switched){
    const best=me().slice().sort((a,b)=>{
      const sc=x=>aiAttackPower(x,null)+(x.charge>=5?8:0)+(x.charge>=4?4:0)+(x.key==='cross_messiah'?3:0);
      return sc(b)-sc(a);
    })[0];
    const cur=getActiveBot('c');
    if(best&&best!==cur){ const bi=G.c.bots.indexOf(best); if(bi>=0){ switchActive('c',bi); G.c.switched=true; } }
  }

  let guard=0;
  // 2) Play cards: charge engines & generators first, then evaluate burst
  let played=true;
  while(played && guard++<12){
    played=false;
    const hand=G.c.hand.slice();
    const act=getActiveBot('c');
    if(!act) break;

    // a) Equip charge engines onto the main attacker early
    const engine=hand.find(c=>c.type==='equipment'&&(c.fx==='eq_resonator'));
    if(engine && act && !act.equip){ try{ cpuPlayEquip(engine, act); played=true; continue; }catch(e){} }

    // b) Cross Burst medaforce — fire if it's lethal, or if charge is max and enemy is healthy
    const burst=hand.find(c=>c.fx==='mf_crossburst');
    if(burst && act){
      const dmgAmt=(act.charge||0)*3;
      const ea=enemyActive();
      if(ea && (dmgAmt>=ea.hp || (act.charge>=5 && dmgAmt>=8))){
        try{ cpuFireCrossBurst(burst, act, ea, dmgAmt); played=true; continue; }catch(e){}
      }
    }

    // c) Full Charge — use on the main attacker if it's not near max yet
    const full=hand.find(c=>c.fx==='cm_fullcharge');
    if(full && act && act.charge<=2){ try{ dsc(G.c,full.uid); addChg(act,5-act.charge); log('CPU Full Charge: '+act.name+' maxed!','chg'); played=true; continue; }catch(e){} }

    // d) Overcharge — broad charge gain
    const over=hand.find(c=>c.fx==='cm_overcharge');
    if(over && act && act.charge<5){ try{ dsc(G.c,over.uid); addChg(act,3); me().forEach(b=>{if(b!==act)addChg(b,1);}); log('CPU Overcharge!','chg'); played=true; continue; }catch(e){} }

    // e) Recharge / Lunar Repair for tempo & sustain
    const rech=hand.find(c=>c.fx==='gen_recharge');
    if(rech && act && act.charge<4){ try{ dsc(G.c,rech.uid); addChg(act,2); log('CPU Recharge.','chg'); played=true; continue; }catch(e){} }
    const lunar=hand.find(c=>c.fx==='cm_lunarrepair');
    if(lunar){ const hurt=me().filter(b=>b.hp<b.maxHp).sort((a,b)=>a.hp-b.hp)[0]; if(hurt){ try{ dsc(G.c,lunar.uid); hurt.hp=Math.min(hurt.maxHp,hurt.hp+5); addChg(hurt,2); log('CPU Lunar Repair on '+hurt.name+'.','eq'); played=true; continue; }catch(e){} } }
  }

  // 3) Attack: if we have a charged attacker, strike the enemy active bot with best technique
  const act=getActiveBot('c');
  const ea=enemyActive();
  if(act && ea && !atked){
    // Pick the best charge-scaling technique in hand
    const techs=G.c.hand.filter(c=>c.type==='technique');
    const best=techs.sort((x,y)=>cpuTechValue(y,act)-cpuTechValue(x,act))[0]||null;
    try{ cpuAttackWith(act, ea, best); }catch(e){ try{ resolveAtk(act,ea,'c',best?best.uid:null); if(best)dsc(G.c,best.uid); atked=true; }catch(_){} }
  }

  checkWin();
  renderAll();
  setTimeout(()=>{ if(!G.winner) endCpu(); }, 350);
}

// Helper: rough value of a technique given attacker's charge
function cpuTechValue(c,a){
  const ch=a.charge||0;
  switch(c.fx){
    case 'cm_blade': return 3+Math.floor(ch/2);
    case 'cm_buster': return 2+(ch>=4?2:0);
    case 'cm_skyvolley': return ch>=4?5:3;
    case 'cm_stagsword': return ch>=4?4:2;
    case 'cm_kabutodrive': return 5; // but spends charge
    default: return 2;
  }
}
// Helper: CPU fires Cross Burst directly (no modal)
function cpuFireCrossBurst(card, caster, tgt, dmgAmt){
  dsc(G.c,card.uid);
  if(tgt&&!tgt.def){ G._curAtkr=caster; dmg(tgt,dmgAmt,'p'); }
  caster.charge=0;
  log('CPU Cross Burst: '+dmgAmt+' damage!','atk');
  atked=true;
}
// Helper: CPU equips (reuses existing equip logic if present)
function cpuPlayEquip(card, bot){
  dsc(G.c,card.uid);
  bot.equip={...card};
  log('CPU equipped '+card.name+' on '+bot.name+'.','eq');
}
// Helper: CPU attacks with an optional technique
function cpuAttackWith(a, d, tech){
  resolveAtk(a, d, 'c', tech?tech.uid:null);
  if(tech) dsc(G.c, tech.uid);
  atked=true;
}

function aiProTurn(){
  if(G.winner)return;
  if(G_online)return;
  // Combo/timing decks need their specialized legacy sequencing — the pro
  // multi-attack would break their setups. Route them to the proven logic,
  // but with pro-level lethal awareness layered on top.
  const keys=G.c.bots.map(b=>b.key);
  const isComboDeck = keys.some(k=>['nin_ninja','gokudo','omegaknight','wargreymon','metalgurumemon','robo_emperor'].includes(k));
  if(isComboDeck){ return aiHybridTurn(); }
  // Cross Messiah: specialized charge-hoarding brain
  if(keys.includes('cross_messiah')){ return aiProCross(); }
  G.phase='cpu_turn';
  renderHeader();
  forgeStartOfTurn('c');

  // 1) OPTIMAL SWITCH: bring the best attacker/threat to the front.
  if(!G.c.switched){
    const cur=getActiveBot('c');
    const best=alive(G.c).slice().sort((a,b)=>{
      const score=x=>aiAttackPower(x,null)+(x.changed?5:0)+(x.charge>=5?6:0)+(x.charge>=4?3:0)+(x.key==='grand_beetle'?(x.equips||[]).length:0);
      return score(b)-score(a);
    })[0];
    if(best&&cur&&best.key!==cur.key){
      // Only switch if meaningfully better (avoid pointless swaps)
      const cs=aiAttackPower(cur,null), bs=aiAttackPower(best,null)+(best.charge>=5?6:0);
      if(bs>cs+1){ G.c.activeBot=G.c.bots.indexOf(best); G.c.switched=true; log('CPU switches '+best.name+' to front!','cpu'); }
    }
  }

  // 2) MEDACHANGE if it materially helps (use existing heuristic, improved threshold).
  // Titan is a fusion deck — its medachange/fusion is handled by aiDeckBrain (aiBrainTitan -> aiDoMedachange).
  const _isTitanFusion = G.c.bots.some(b=>b.key==='rokusho') && G.c.bots.some(b=>b.medal==='titan');
  if(!_isTitanFusion && cpuShouldMedachange()){
    const mcs=G.c.hand.filter(c=>c.type==='medachange');
    if(mcs.length){
      const bot=alive(G.c).sort((a,b)=>(b.atk+b.charge)-(a.atk+a.charge))[0];
      const matchingMC=mcs.find(c=>c.fx==='mc_bot_'+ (bot&&bot.key))||mcs[0];
      const targetBot=G.c.bots.find(b=>b.key===matchingMC.fx.replace('mc_bot_','')&&!b.def)||bot;
      if(targetBot){
        dsc(G.c,matchingMC.uid);
        const _cRoyalEvo=G.c.bots.some(b=>['omegaknight','wargreymon','metalgurumemon'].includes(b.key));
        if(_cRoyalEvo){ G.c._evolveCount=(G.c._evolveCount||0)+1; } else { G.c.mcUsed=true; }
        targetBot.changed=true;targetBot.maxHp+=8;targetBot.hp=Math.min(targetBot.hp+8,targetBot.maxHp);
        log('CPU MEDACHANGE: '+targetBot.name+'!','mc');banner('CPU MEDACHANGE!','#f04880');try{ medaforceFX('#f04880'); }catch(e){}
      }
    }
  }

  // 3) EQUIPMENT: bolt gear (Forge prioritizes Grand Beetle to hit thresholds).
  aiProEquip();

  // 4) DECK BRAIN: deck-specific actions (drain, heal, charge, draw, etc.)
  aiDeckBrain();

  // 5) MEDAFORCE: fire if lethal, or high value. Pro picks the optimal MF + target.
  setTimeout(()=>{
    if(G.winner)return;
    aiProMedaforce();
    setTimeout(()=>{
      if(G.winner)return;
      // 6) ATTACK with every able bot, focus-firing kills.
      aiProAttack();
    }, 420);
  }, 360);
}

function aiProEquip(){
  let eqs=G.c.hand.filter(c=>c.type==='equipment');
  let guard=0;
  while(eqs.length&&guard<5){
    guard++;
    const eq=eqs[0];
    const gb=G.c.bots.find(b=>b.key==='grand_beetle'&&!b.def&&(b.equips||[]).length<3);
    let target=gb||alive(G.c).filter(b=>b.key!=='grand_beetle'&&!b.equip).sort((a,b)=>aiAttackPower(b,null)-aiAttackPower(a,null))[0];
    if(!target)break;
    dsc(G.c,eq.uid);
    if(typeof attachEquip==='function')attachEquip(target,eq); else target.equip={...eq};
    if(alive(G.c).some(b=>b.key==='neutranurse'))drw(G.c,1);
    if(G.c.mf&&G.c.mf.pass&&G.c.mf.pass.includes('+1 Charge'))addChg(target,1);
    if(eq.fx==='fb_masterforge'){drw(G.c,1);if(typeof forgeCount==='function'&&forgeCount('c')>=5)target.atk+=2;}
    log('CPU equips '+eq.name+' \u2192 '+target.name+'.','cpu');
    eqs=G.c.hand.filter(c=>c.type==='equipment');
  }
}

function aiProMedaforce(){
  const ign=alive(G.c).filter(b=>b.charge>=5||(b.key==='robo_emperor'&&b.charge>=4));
  const mfs=G.c.hand.filter(c=>c.type==='medaforce');
  if(!ign.length||!mfs.length)return;
  // Fire if: lethal available, OR strong tempo (player has 2+ bots for AoE, or we're behind)
  const score=aiEvalBoard();
  const anyKill=alive(G.p).some(b=>aiCanKill(b));
  const pMulti=alive(G.p).length>=2;
  const best=mfs[0];
  let shouldFire=anyKill||pMulti||score<2||alive(G.p).some(b=>b.hp<=8);
  // Win Medals (Black Tide) scales with banked Doubloons — don't waste it on a near-empty vault.
  // Hold unless it's lethal right now or we've banked a worthwhile pile (≥4 coins).
  const onlyBroadside=mfs.every(c=>c.fx==='mf_broadside');
  if(onlyBroadside){
    const have=coins('c');
    const broadsideLethal=alive(G.p).some(b=>b.hp<=(4+2*have));
    shouldFire = broadsideLethal || have>=4;
  }
  if(!shouldFire)return;

  const caster=ign.sort((a,b)=>(b.changed?10:0)+b.charge-(a.changed?10:0)-a.charge)[0];
  // Overforge special handling
  const overforge=mfs.find(c=>c.fx==='mf_overforge');
  if(overforge&&caster.key==='grand_beetle'&&(caster.equips||[]).length>=2){
    dsc(G.c,overforge.uid);caster.charge=0;
    caster._overforged=caster.atk;caster.atk=caster.atk*2;
    log('CPU OVERFORGE! '+caster.name+' ATK doubled!','cpu');banner('CPU OVERFORGE!','#f0c040');
    return;
  }
  // Choose MF by board: AoE (lightning) vs multi, single (blaze) vs one
  const pAlive=alive(G.p).length;
  const pref=pAlive>1?mfs.find(c=>c.fx==='mf_lightning'):mfs.find(c=>c.fx==='mf_blaze');
  const mf=pref||mfs[0];
  dsc(G.c,mf.uid);caster.charge=0;
  log('CPU MEDAFORCE: '+caster.name+' — '+mf.name+'!','cpu');banner('CPU MEDAFORCE!','#f04040');
  let bonus=0;
  if(caster.equip&&caster.equip.fx==='eq_lens'){bonus=3;caster.equip=null;}
  if(caster.medal==='psycho'||caster.fusedMedal==='psycho')drw(G.c,1);
  const fx=mf.fx;
  if(fx==='mf_blaze'){const t=alive(G.p).sort((a,b)=>(b.charge*2+b.atk)-(a.charge*2+a.atk))[0];if(t){G._curAtkr=caster;dmg(t,8+bonus,'p');G._curAtkr=null;}}
  else if(fx==='mf_lightning')alive(G.p).forEach(b=>{G._curAtkr=caster;dmg(b,4+bonus,'p');G._curAtkr=null;});
  else if(fx==='mf_psycho'){const t=alive(G.p)[0];if(t)alive(G.p).filter(x=>x!==t).forEach(x=>dmg(x,t.atk,'p'));}
  else if(fx==='mf_titan')alive(G.p).forEach(b=>b.exhst=true);
  else if(fx==='mf_aqua')alive(G.c).forEach(b=>{b.hp=Math.min(b.maxHp,b.hp+4+bonus);});
  else if(fx==='mf_nature')alive(G.c).forEach(b=>addChg(b,2));
  else if(fx==='mf_imperial')alive(G.p).forEach(b=>{G._curAtkr=caster;dmg(b,6+bonus,'p');G._curAtkr=null;});
  else if(fx==='mf_broadside'){
    // Win Medals: spend ALL Doubloons, deal 4 + 2 per coin to one enemy.
    const have=coins('c');
    const dmgAmt=(4+2*have)+bonus;
    spendCoins('c',have);
    // Aim at a bot we can kill if possible, else the biggest threat.
    const killable=alive(G.p).filter(b=>b.hp<=dmgAmt);
    const t=(killable.sort((a,b)=>(b.charge*2+b.atk)-(a.charge*2+a.atk))[0])
          || alive(G.p).sort((a,b)=>(b.charge*2+b.atk)-(a.charge*2+a.atk))[0];
    if(t){G._curAtkr=caster;dmg(t,dmgAmt,'p');G._curAtkr=null;log('CPU Win Medals: spent '+have+' Doubloons — '+t.name+' hit for '+dmgAmt+'!','cpu');}
  }
  checkWin();
}

function cpuTurn(){
  if(G.winner)return;
  if(G_online)return; // online matches: remote moves drive the opponent side
  // HARD difficulty uses the pro AI engine
  if(cpuDiff==='hard'){ try{ return aiProTurn(); }catch(e){ console.log('proAI error',e); /* fall through to legacy */ } }
  G.phase='cpu_turn';
  renderHeader();
  forgeStartOfTurn('c');
  cpuBurnReaction();
  // CPU: consider switching active bot
  if(!G.c.switched){
    const curActive=getActiveBot('c');
    const bestBot=alive(G.c).sort((a,b)=>{
      const sa=a.atk+(a.changed?5:0)+(a.equip?2:0)+(a.charge>=5?4:0)+(a.medal==='blaze'?2:0);
      const sb=b.atk+(b.changed?5:0)+(b.equip?2:0)+(b.charge>=5?4:0)+(b.medal==='blaze'?2:0);
      return sb-sa;
    })[0];
    if(bestBot&&curActive&&bestBot.key!==curActive.key){
      const newIdx=G.c.bots.indexOf(bestBot);
      if(newIdx>=0){G.c.activeBot=newIdx;G.c.switched=true;log('CPU switches '+bestBot.name+' to front!','cpu');}
    }
  }

  // Step 1: Medachange (strategic — not random)
  if(cpuShouldMedachange()){
    const mcs=G.c.hand.filter(c=>c.type==='medachange');
    if(mcs.length){
      const mc=mcs[0];const bk=mc.fx.replace('mc_bot_','');
      // Pick best bot to change: highest ATK alive
      const bot=alive(G.c).sort((a,b)=>(b.atk+b.charge)-(a.atk+a.charge))[0];
      if(bot&&G.c.bots.find(b=>b.key===bk&&!b.def)){
        // Use the matching mc card if bot matches, otherwise use any mc on best bot
        const matchingMC=mcs.find(c=>c.fx==='mc_bot_'+bot.key)||mcs[0];
        const targetBot=G.c.bots.find(b=>b.key===matchingMC.fx.replace('mc_bot_','')&&!b.def)||bot;
        if(targetBot){
          dsc(G.c,matchingMC.uid);G.c.mcUsed=true;
          targetBot.changed=true;targetBot.maxHp+=8;targetBot.hp=Math.min(targetBot.hp+8,targetBot.maxHp);
          log('CPU MEDACHANGE: '+targetBot.name+'!','mc');banner('CPU MEDACHANGE!','#f04880');
        }
      }
    }
  }


  // Step 1.4: Equipment (Forge Barons + any equip cards) — bolt gear onto best bot
  {
    let equipCards=G.c.hand.filter(c=>c.type==='equipment');
    let guard=0;
    while(equipCards.length && guard<4){
      guard++;
      const eq=equipCards[0];
      // Prefer Grand Beetle (holds 3), else highest-ATK alive bot with an open slot
      const gb=G.c.bots.find(b=>b.key==='grand_beetle'&&!b.def&&(b.equips||[]).length<3);
      let target=gb || alive(G.c).filter(b=>b.key!=='grand_beetle'&&!b.equip).sort((a,b)=>b.atk-a.atk)[0];
      if(!target) break;
      dsc(G.c,eq.uid);
      if(typeof attachEquip==='function'){ attachEquip(target,eq); } else { target.equip={...eq}; }
      // Neutranurse: draw on equip
      if(alive(G.c).some(b=>b.key==='neutranurse')){ drw(G.c,1); }
      // Kasumi: +1 charge to equipped bot
      if(G.c.mf&&G.c.mf.pass&&G.c.mf.pass.includes('+1 Charge')){ addChg(target,1); }
      if(eq.fx==='fb_masterforge'){ drw(G.c,1); if(typeof forgeCount==='function'&&forgeCount('c')>=5) target.atk+=2; }
      log('CPU equips '+eq.name+' \u2192 '+target.name+'.','cpu');
      equipCards=G.c.hand.filter(c=>c.type==='equipment');
    }
  }

  // Step 2: TITAN special — emergency drain if player about to ignite
  const emergDrain = G.c.hand.find(c=>c.fx==='act_drain'||c.fx==='medal_dampener');
  const pIgnNow = alive(G.p).filter(b=>b.charge>=5).length;
  const pNearNow = alive(G.p).filter(b=>b.charge>=4).length;
  if(emergDrain&&(pIgnNow>=1||pNearNow>=2)){
    dsc(G.c,emergDrain.uid);
    log('CPU — Emergency Medal Dampener!','cpu');
    const tgt=alive(G.p).sort((a,b)=>b.charge-a.charge)[0];
    if(tgt){tgt.charge=Math.max(0,tgt.charge-2);log(tgt.name+' −2 Charge (disrupted)','chg');}
    // Then also play a second action if we have one (Titan often wants double disruption)
    const act2=cpuChooseAction();
    if(act2&&act2.uid!==emergDrain.uid){
      dsc(G.c,act2.uid);log('CPU plays '+act2.name,'cpu');
      executeCpuAction(act2);
    }
    setTimeout(()=>{if(G.winner)return;if(cpuShouldMedaforce()){const ign=alive(G.c).filter(b=>b.charge>=5);const mfs=G.c.hand.filter(c=>c.type==='medaforce');if(ign.length&&mfs.length){const pA=alive(G.p).length;// Royal: prefer digistrike when multiple strikers alive
      const hasDigiStrike=mfs.find(c=>c.fx==='mf_digistrike');
      const digiStrikers=alive(G.c).filter(b=>['omegaknight','wargreymon','metalgurumemon'].includes(b.key)).length;
      const pref=hasDigiStrike&&digiStrikers>=2?hasDigiStrike:
        pA>1?mfs.find(c=>c.fx==='mf_lightning'):mfs.find(c=>c.fx==='mf_blaze');const mf=pref||mfs[0];dsc(G.c,mf.uid);ign[0].charge=0;log('CPU MF: '+mf.name+'!','cpu');banner('CPU MEDAFORCE!','#f04040');const _mfTrap=checkPlayerTraps('medaforce',ign[0]);if(_mfTrap.negate){setTimeout(cpuAtk,1300);return;}let bonus=0;if(ign[0].equip&&ign[0].equip.fx==='eq_lens'){bonus=3;ign[0].equip=null;}if(mf.fx==='mf_blaze'){const t=alive(G.p).sort((a,b)=>(b.charge*2+b.atk)-(a.charge*2+a.atk))[0];if(t)dmg(t,7+bonus,'p');}else if(mf.fx==='mf_lightning')alive(G.p).forEach(b=>dmg(b,4+bonus,'p'));else if(mf.fx==='mf_titan')alive(G.p).forEach(b=>b.exhst=true);setTimeout(cpuAtk,1300);return;}}cpuAtk();},500);
    return;
  }

  // Step 2: Play best Action or Equipment
  const act = cpuChooseAction();
  if(act){
    dsc(G.c,act.uid);log('CPU plays '+act.name+'.','cpu');
    executeCpuAction(act);
  }

  setTimeout(()=>{
    if(G.winner)return;
    // Step 3: Medaforce (strategic — not random)
    if(cpuShouldMedaforce()){
      const ign=alive(G.c).filter(b=>b.charge>=5);
      const mfs=G.c.hand.filter(c=>c.type==='medaforce');
      if(ign.length&&mfs.length){
        // Pick best caster (prefer changed, then highest charge)
        const caster=ign.sort((a,b)=>(b.changed?10:0)+b.charge-(a.changed?10:0)-a.charge)[0];
        // Pick best MF card — if player has multiple bots use lightning, else blaze
        const pAlive=alive(G.p).length;
        const preferred=pAlive>1?mfs.find(c=>c.fx==='mf_lightning'):mfs.find(c=>c.fx==='mf_blaze');
        const mf=preferred||mfs[0];
        dsc(G.c,mf.uid);caster.charge=0;
        log('CPU MEDAFORCE: '+caster.name+' — '+mf.name+'!','cpu');
        banner('CPU MEDAFORCE!','#f04040');
        let bonus=0;
        if(caster.equip&&caster.equip.fx==='eq_lens'){bonus=3;caster.equip=null;log('Medal Lens: +3!','eq');}
        if(caster.medal==='psycho'||caster.fusedMedal==='psycho')drw(G.c,1);
        const fx=mf.fx;
        if(fx==='mf_blaze'){
          // Target highest-threat player bot (not just lowest HP)
          const t=alive(G.p).sort((a,b)=>(b.charge*2+b.atk)-(a.charge*2+a.atk))[0];
          if(t)dmg(t,8+bonus,'p');
        }
        else if(fx==='mf_lightning') alive(G.p).forEach(b=>dmg(b,4+bonus,'p'));
        else if(fx==='mf_xburst'){ const hasMB=G.c.bots.some(b=>b._masterbeetle&&!b.def); const t=getActiveBot('p'); if(t){ if(hasMB)G._pierceDmg=true; dmg(t,(hasMB?12:7)+bonus,'p'); G._pierceDmg=false; } }
        else if(fx==='mf_mastercannon'){ const hasMaster=G.c.bots.some(b=>b._masterMode&&!b.def); alive(G.p).forEach(b=>dmg(b,(hasMaster?11:6)+bonus,'p')); }
        else if(fx==='mf_psycho'){const t=alive(G.p)[0];if(t)alive(G.p).filter(x=>x!==t).forEach(x=>dmg(x,t.atk,'p'));}
        else if(fx==='mf_titan') alive(G.p).forEach(b=>b.exhst=true);
        else if(fx==='mf_aqua') alive(G.c).forEach(b=>{b.hp=Math.min(b.maxHp,b.hp+4+bonus);});
        else if(fx==='mf_nature') alive(G.c).forEach(b=>addChg(b,2));
        setTimeout(cpuAtk,1300);return;
      }
    }
    cpuAtk();
  },500);
}
function cpuTurnLegacy(){
  if(G.winner)return;
  if(G_online)return; // online matches: remote moves drive the opponent side
  G.phase='cpu_turn';
  renderHeader();
  forgeStartOfTurn('c');
  cpuBurnReaction();
  // CPU: consider switching active bot
  if(!G.c.switched){
    const curActive=getActiveBot('c');
    const bestBot=alive(G.c).sort((a,b)=>{
      const sa=a.atk+(a.changed?5:0)+(a.equip?2:0)+(a.charge>=5?4:0)+(a.medal==='blaze'?2:0);
      const sb=b.atk+(b.changed?5:0)+(b.equip?2:0)+(b.charge>=5?4:0)+(b.medal==='blaze'?2:0);
      return sb-sa;
    })[0];
    if(bestBot&&curActive&&bestBot.key!==curActive.key){
      const newIdx=G.c.bots.indexOf(bestBot);
      if(newIdx>=0){G.c.activeBot=newIdx;G.c.switched=true;log('CPU switches '+bestBot.name+' to front!','cpu');}
    }
  }

  // Step 1: Medachange (strategic — not random)
  if(cpuShouldMedachange()){
    const mcs=G.c.hand.filter(c=>c.type==='medachange');
    if(mcs.length){
      const mc=mcs[0];const bk=mc.fx.replace('mc_bot_','');
      // Pick best bot to change: highest ATK alive
      const bot=alive(G.c).sort((a,b)=>(b.atk+b.charge)-(a.atk+a.charge))[0];
      if(bot&&G.c.bots.find(b=>b.key===bk&&!b.def)){
        // Use the matching mc card if bot matches, otherwise use any mc on best bot
        const matchingMC=mcs.find(c=>c.fx==='mc_bot_'+bot.key)||mcs[0];
        const targetBot=G.c.bots.find(b=>b.key===matchingMC.fx.replace('mc_bot_','')&&!b.def)||bot;
        if(targetBot){
          dsc(G.c,matchingMC.uid);G.c.mcUsed=true;
          targetBot.changed=true;targetBot.maxHp+=8;targetBot.hp=Math.min(targetBot.hp+8,targetBot.maxHp);
          log('CPU MEDACHANGE: '+targetBot.name+'!','mc');banner('CPU MEDACHANGE!','#f04880');
        }
      }
    }
  }


  // Step 1.4: Equipment (Forge Barons + any equip cards) — bolt gear onto best bot
  {
    let equipCards=G.c.hand.filter(c=>c.type==='equipment');
    let guard=0;
    while(equipCards.length && guard<4){
      guard++;
      const eq=equipCards[0];
      // Prefer Grand Beetle (holds 3), else highest-ATK alive bot with an open slot
      const gb=G.c.bots.find(b=>b.key==='grand_beetle'&&!b.def&&(b.equips||[]).length<3);
      let target=gb || alive(G.c).filter(b=>b.key!=='grand_beetle'&&!b.equip).sort((a,b)=>b.atk-a.atk)[0];
      if(!target) break;
      dsc(G.c,eq.uid);
      if(typeof attachEquip==='function'){ attachEquip(target,eq); } else { target.equip={...eq}; }
      // Neutranurse: draw on equip
      if(alive(G.c).some(b=>b.key==='neutranurse')){ drw(G.c,1); }
      // Kasumi: +1 charge to equipped bot
      if(G.c.mf&&G.c.mf.pass&&G.c.mf.pass.includes('+1 Charge')){ addChg(target,1); }
      if(eq.fx==='fb_masterforge'){ drw(G.c,1); if(typeof forgeCount==='function'&&forgeCount('c')>=5) target.atk+=2; }
      log('CPU equips '+eq.name+' \u2192 '+target.name+'.','cpu');
      equipCards=G.c.hand.filter(c=>c.type==='equipment');
    }
  }

  // Step 2: TITAN special — emergency drain if player about to ignite
  const emergDrain = G.c.hand.find(c=>c.fx==='act_drain'||c.fx==='medal_dampener');
  const pIgnNow = alive(G.p).filter(b=>b.charge>=5).length;
  const pNearNow = alive(G.p).filter(b=>b.charge>=4).length;
  if(emergDrain&&(pIgnNow>=1||pNearNow>=2)){
    dsc(G.c,emergDrain.uid);
    log('CPU — Emergency Medal Dampener!','cpu');
    const tgt=alive(G.p).sort((a,b)=>b.charge-a.charge)[0];
    if(tgt){tgt.charge=Math.max(0,tgt.charge-2);log(tgt.name+' −2 Charge (disrupted)','chg');}
    // Then also play a second action if we have one (Titan often wants double disruption)
    const act2=cpuChooseAction();
    if(act2&&act2.uid!==emergDrain.uid){
      dsc(G.c,act2.uid);log('CPU plays '+act2.name,'cpu');
      executeCpuAction(act2);
    }
    setTimeout(()=>{if(G.winner)return;if(cpuShouldMedaforce()){const ign=alive(G.c).filter(b=>b.charge>=5);const mfs=G.c.hand.filter(c=>c.type==='medaforce');if(ign.length&&mfs.length){const pA=alive(G.p).length;// Royal: prefer digistrike when multiple strikers alive
      const hasDigiStrike=mfs.find(c=>c.fx==='mf_digistrike');
      const digiStrikers=alive(G.c).filter(b=>['omegaknight','wargreymon','metalgurumemon'].includes(b.key)).length;
      const pref=hasDigiStrike&&digiStrikers>=2?hasDigiStrike:
        pA>1?mfs.find(c=>c.fx==='mf_lightning'):mfs.find(c=>c.fx==='mf_blaze');const mf=pref||mfs[0];dsc(G.c,mf.uid);ign[0].charge=0;log('CPU MF: '+mf.name+'!','cpu');banner('CPU MEDAFORCE!','#f04040');const _mfTrap=checkPlayerTraps('medaforce',ign[0]);if(_mfTrap.negate){setTimeout(cpuAtk,1300);return;}let bonus=0;if(ign[0].equip&&ign[0].equip.fx==='eq_lens'){bonus=3;ign[0].equip=null;}if(mf.fx==='mf_blaze'){const t=alive(G.p).sort((a,b)=>(b.charge*2+b.atk)-(a.charge*2+a.atk))[0];if(t)dmg(t,7+bonus,'p');}else if(mf.fx==='mf_lightning')alive(G.p).forEach(b=>dmg(b,4+bonus,'p'));else if(mf.fx==='mf_titan')alive(G.p).forEach(b=>b.exhst=true);setTimeout(cpuAtk,1300);return;}}cpuAtk();},500);
    return;
  }

  // Step 2: Play best Action or Equipment
  const act = cpuChooseAction();
  if(act){
    dsc(G.c,act.uid);log('CPU plays '+act.name+'.','cpu');
    executeCpuAction(act);
  }

  setTimeout(()=>{
    if(G.winner)return;
    // Step 3: Medaforce (strategic — not random)
    if(cpuShouldMedaforce()){
      const ign=alive(G.c).filter(b=>b.charge>=5);
      const mfs=G.c.hand.filter(c=>c.type==='medaforce');
      if(ign.length&&mfs.length){
        // Pick best caster (prefer changed, then highest charge)
        const caster=ign.sort((a,b)=>(b.changed?10:0)+b.charge-(a.changed?10:0)-a.charge)[0];
        // Pick best MF card — if player has multiple bots use lightning, else blaze
        const pAlive=alive(G.p).length;
        const preferred=pAlive>1?mfs.find(c=>c.fx==='mf_lightning'):mfs.find(c=>c.fx==='mf_blaze');
        const mf=preferred||mfs[0];
        dsc(G.c,mf.uid);caster.charge=0;
        log('CPU MEDAFORCE: '+caster.name+' — '+mf.name+'!','cpu');
        banner('CPU MEDAFORCE!','#f04040');
        let bonus=0;
        if(caster.equip&&caster.equip.fx==='eq_lens'){bonus=3;caster.equip=null;log('Medal Lens: +3!','eq');}
        if(caster.medal==='psycho'||caster.fusedMedal==='psycho')drw(G.c,1);
        const fx=mf.fx;
        if(fx==='mf_blaze'){
          // Target highest-threat player bot (not just lowest HP)
          const t=alive(G.p).sort((a,b)=>(b.charge*2+b.atk)-(a.charge*2+a.atk))[0];
          if(t)dmg(t,8+bonus,'p');
        }
        else if(fx==='mf_lightning') alive(G.p).forEach(b=>dmg(b,4+bonus,'p'));
        else if(fx==='mf_xburst'){ const hasMB=G.c.bots.some(b=>b._masterbeetle&&!b.def); const t=getActiveBot('p'); if(t){ if(hasMB)G._pierceDmg=true; dmg(t,(hasMB?12:7)+bonus,'p'); G._pierceDmg=false; } }
        else if(fx==='mf_mastercannon'){ const hasMaster=G.c.bots.some(b=>b._masterMode&&!b.def); alive(G.p).forEach(b=>dmg(b,(hasMaster?11:6)+bonus,'p')); }
        else if(fx==='mf_psycho'){const t=alive(G.p)[0];if(t)alive(G.p).filter(x=>x!==t).forEach(x=>dmg(x,t.atk,'p'));}
        else if(fx==='mf_titan') alive(G.p).forEach(b=>b.exhst=true);
        else if(fx==='mf_aqua') alive(G.c).forEach(b=>{b.hp=Math.min(b.maxHp,b.hp+4+bonus);});
        else if(fx==='mf_nature') alive(G.c).forEach(b=>addChg(b,2));
        setTimeout(cpuAtk,1300);return;
      }
    }
    cpuAtk();
  },500);
}

function cpuAtk(){
  if(G.winner)return;
  const a=cpuBestAttacker();
  const tgts=alive(G.p);
  if(!a||!tgts.length){endCpu();return;}
  // Trap awareness
  const hasMirror=(G.pTraps||[]).some(t=>t.fx==='trap_reflect');
  if(hasMirror&&a.hp<=5&&cpuDiff!=='hard'){log('CPU senses danger — holding back!','cpu');setTimeout(endCpu,400);return;}

  // Calculate base power before choosing target
  let basePow=a.atk;
  if(a.medal==='blaze'||a.fusedMedal==='blaze')basePow+=1;
  if(a.equip&&a.equip.fx==='eq_blaze_arm')basePow+=2;
  if(a.changed)basePow+=3;

  // Choose best technique first to factor into target choice
  const tech=cpuChooseTech(a, tgts[0]);
  const techBonus=tech?({deal5_burn:5,deal6_burn:6,deal4_chain:4,deal3_charge:3,deal3_drain:3,deal5_drain:5,deal2_heal:2,deal2_draw:2,deal3_burn_all:3,deal2_scorch:6,deal1_ember:1}[tech.fx]||0):0;
  const totalPow=basePow+techBonus;

  // Now choose best target with full power known
  let d=cpuBestTarget(totalPow);
  if(!d){endCpu();return;}

  // Recalc with target-specific bonuses
  let total=basePow;
  if(a.equip&&a.equip.fx==='eq_hunter'&&d.hp<=d.maxHp/2)total+=3;

  if(tech){
    dsc(G.c,tech.uid);
    total+=applyTechC(tech,a,d);
    log('CPU plays '+tech.name,'cpu');
  }

  log('CPU: '+a.name+' → '+d.name+' for '+total+'!','cpu');
  banner('CPU '+total,'#f04040');
  // Player traps may negate/reflect this attack
  const trapRes=checkPlayerTraps('attack',a);
  if(trapRes.negate){a.exhst=true;if(!G.winner)renderAll();setTimeout(endCpu,500);return;}
  if(trapRes.reduce){total=Math.max(1,total-trapRes.reduce);log('Iron Wall: attack reduced by '+trapRes.reduce+'!','eq');}
  if(trapRes.redirect){d=trapRes.redirect;log('Honor Guard redirected to '+d.name+'!','eq');}
  dmg(d,total,'p');a.exhst=true;

  const thr=a.changed&&a.medal==='lightning'?2:4;
  if((a.medal==='lightning'||a.fusedMedal==='lightning')&&total>=thr&&!a._dbl){
    a._dbl=true;
    setTimeout(()=>{
      if(!G.winner&&alive(G.p).length){
        const t2=cpuBestTarget(a.atk+(a.changed?3:0));
        if(t2){
          const d2=a.atk+(a.changed?(a.key==='rokusho'?4:5):0)+(a.equip&&a.equip.fx==='eq_blaze_arm'?2:0);
          log('Lightning DOUBLE on '+t2.name+'!','atk');banner('DOUBLE!','#2a80f0');
          dmg(t2,d2,'p');
        }
      }
      a._dbl=false;if(!G.winner)endCpu();
    },650);return;
  }
  if(a.equip&&a.equip.fx==='eq_fury'&&!a._fury){
    a._fury=true;
    setTimeout(()=>{
      if(!G.winner&&alive(G.p).length){
        const t3=cpuBestTarget(a.atk);
        if(t3){log('Fury Core 2nd strike!','atk');dmg(t3,a.atk,'p');}
      }
      a._fury=false;if(!G.winner)endCpu();
    },750);return;
  }
  if(!G.winner)endCpu();
}

function applyTechP(tech,a,d){
  // Standalone technique fire for Nin-Ninja dual tech
  if(!tech||!d)return 0;
  try{ playCardFx(tech); }catch(e){}
  const fx=tech.fx;
  let b=0;
  if(fx==='deal3_chain_free'){b=3;log('Shadow Slash: +3 to '+d.name+'!','atk');}
  else if(fx==='deal2_combo'){
    b=2;
    const gok=alive(G.p).find(b2=>b2.key==='gokudo'&&!b2.def);
    if(gok){gok._comboCount=(gok._comboCount||0)+1;log('Blade Dance: Gokudo combo+1!','chg');}
  }
  else if(fx==='deal4_exhaust'){b=4;d.exhst=true;log('Phantom Cut: +4, '+d.name+' exhausted!','atk');}
  else if(fx==='deal3_drain'){b=3;d.charge=Math.max(0,d.charge-2);log('Twin Strike: +3, -2 charge!','atk');}
  else if(fx==='deal5_drain'){b=5;d.charge=Math.max(0,d.charge-2);log('Iron Strike: +5, -2 charge!','atk');}
  else if(fx==='deal2_heal'){
    b=2;
    const lowest=alive(G.p).sort((a2,b2)=>a2.hp-b2.hp)[0];
    if(lowest){lowest.hp=Math.min(lowest.maxHp,lowest.hp+2);log('Remedy Blade: healed '+lowest.name+'!','chg');}
  }
  else if(fx==='deal3_draw_chain'){b=3;drw(G.p,1);log('Fox Fang: +3 + drew 1!','chg');}
  else if(fx==='deal4_combo_boost'){
    b=4;
    const gok2=alive(G.p).find(b2=>b2.key==='gokudo'&&!b2.def);
    if(gok2){gok2._comboCount=(gok2._comboCount||0)+2;log('Cannon Blast: Gokudo +2 combo!','chg');}
  }
  else if(fx==='deal6_siege'){b=6;G._minDmg=3;log('Heavy Barrage: +6 siege!','atk');}
  else if(fx==='deal4_drain2'){b=4;d.charge=Math.max(0,d.charge-2);log('Cable Whip: +4 & drained 2 Charge!','atk');}
  else if(fx==='deal5_siege_p'){b=5;G._pierceDmg=true;log('Siege Shot: +5 pierce!','atk');}
  else if(fx==='deal3_suppress'){b=3;d.exhst=true;log('Suppression: +3, '+d.name+' exhausted!','atk');}
  else{b=({deal5_burn:5,deal6_burn:6,deal4_chain:4,deal3_charge:3,deal3_drain2:3,deal2_draw:2}[fx]||0);}
  if(b>0)dmg(d,b,'c');
  renderAll();
  return b;
}

function applyTechC(c,a,d){
  const fx=c.fx;let b=0;
  if(fx==='deal5_burn'||fx==='deal6_burn'){
    b=fx==='deal6_burn'?6:5;d.burn=true;d.burnAmt=1;
  }else if(fx==='deal3_burn_all'){
    b=2;alive(G.p).forEach(t=>{t.burn=true;t.burnAmt=1;});log('CPU Flame Whip: ALL enemies burning!','cpu');
  }else if(fx==='deal2_scorch'){
    if(d.burn){b=4;log('CPU Scorch: burn bonus +4!','cpu');}else b=2;
  }else if(fx==='deal1_ember'){
    b=1;d.burn=true;d.burnAmt=1;addChg(a,2);
  }else if(fx==='deal4_chain'){
    b=4;const o=alive(G.p).find(x=>x!==d);if(o)dmg(o,2,'p');
  }else if(fx==='deal3_charge'){
    b=3;addChg(a,1);
  }else if(fx==='deal3_drain'){
    b=3;const p=alive(G.p)[0];if(p)p.charge=Math.max(0,p.charge-2);
  }else if(fx==='deal5_drain'){
    b=5;const p=alive(G.p)[0];if(p)p.charge=Math.max(0,p.charge-2);
  }else if(fx==='deal2_heal'){
    b=2;a.hp=Math.min(a.maxHp,a.hp+2);
  }else if(fx==='deal2_draw'){
    b=2;drw(G.c,1);
  }else if(fx==='deal3_counter'){
    b=3;d._counterMarked=true;log('CPU Counter Strike: '+d.name+' marked!','cpu');
  }else if(fx==='deal5_dramon'){
    // Dramon Strike: +5, +4 more vs equipped, ignore reduction
    b=5;G._pierceDmg=true;
    if(d.equip){b+=4;log('Dramon Strike: +4 vs equipped!','atk');banner('DRAMON STRIKE!','#f0c040');}
  }else if(fx==='deal3_nova'){
    b=3;
    alive(G.c).filter(x=>x!==d).forEach(t=>{dmg(t,2,'c');});
    log('Nova Force: 2 fire DMG to all other enemies!','atk');
  }else if(fx==='deal2_volley'){
    b=0; // no main target damage — all handled as missiles
    for(let i=0;i<3;i++){
      const tgts=alive(G.c);
      if(tgts.length){const t=tgts[Math.floor(Math.random()*tgts.length)];dmg(t,2,'c');}
    }
    log('Missile Volley: 3 missiles fired!','atk');banner('VOLLEY!','#9050d0');
  }else if(fx==='deal5_dramon'){
    b=5;G._pierceDmg=true;if(d.equip)b+=4;
  }else if(fx==='deal3_nova'){
    b=3;alive(G.p).filter(x=>x!==d).forEach(t=>{dmg(t,2,'p');});
  }else if(fx==='deal2_volley'){
    b=0;for(let i=0;i<3;i++){const tgts=alive(G.p);if(tgts.length){const t=tgts[Math.floor(Math.random()*tgts.length)];dmg(t,2,'p');}}
  }else if(fx==='deal5_pierce'){
    b=5;G._pierceDmg=true;a._lanceCostPending=true;
  }else if(fx==='deal3_exhaust'){
    b=3;d.exhst=true;
  }else if(fx==='deal2_web'){
    b=2;d._webbed=3;log('CPU Web Trap: '+d.name+' webbed!','cpu');
  }else if(fx==='deal4_first'){
    const bonus=d.charge>=(a.charge||0)?2:0;b=4+bonus;
  }else if(fx==='deal3_chain_free'){
    b=3;
  }else if(fx==='deal2_combo'){
    b=2;const gok=alive(G.c).find(x=>x.key==='gokudo'&&!x.def);if(gok)gok._comboCount=(gok._comboCount||0)+1;
  }else if(fx==='deal4_exhaust'){
    b=4;d.exhst=true;
  }else if(fx==='deal3_draw_chain'){
    b=3;drw(G.c,1);
  }else if(fx==='deal4_combo_boost'){
    b=4;const gok2=alive(G.c).find(x=>x.key==='gokudo'&&!x.def);if(gok2)gok2._comboCount=(gok2._comboCount||0)+2;
  }else if(fx==='deal6_siege'){
    b=6;
  }else if(fx==='deal4_drain2'){
    b=4;d.charge=Math.max(0,d.charge-2);
  }else if(fx==='deal5_siege_p'){
    b=5;G._pierceDmg=true;
  }else if(fx==='deal3_suppress'){
    b=3;d.exhst=true;
  }
  return b;
}

function executeCpuAction(act){
  const fx=act.fx;
  if(fx==='act_charge'){const b=alive(G.c).sort((x,y)=>y.charge-x.charge)[0];if(b)addChg(b,2);}
  if(fx==='act_drain'){const b=alive(G.p).sort((x,y)=>y.charge-x.charge)[0];if(b){b.charge=Math.max(0,b.charge-2);log(b.name+' −2 Charge','chg');}}
  if(fx==='act_overload_surge'){alive(G.p).forEach(t=>{if((t.charge||0)>0)t.charge=Math.max(0,t.charge-2);});log('Overload Surge: every enemy bot loses 2 Charge!','chg');}
  if(fx==='act_draw2')drw(G.c,2);
  if(fx==='act_fusion'){const d=G.c.bots.filter(b=>b.def&&!b.fAway);const t=alive(G.c);if(d.length&&t.length){t[0].fusedMedal=d[0].medal;t[0].fusedPass=MEDAL[d[0].medal].passive;d[0].fAway=true;}}
  if(fx==='act_ikki')alive(G.c).forEach(b=>{if(b.hp<=5)addChg(b,1);});
  if(act.type==='equipment'){const b=alive(G.c).sort((x,y)=>{const xs=(x.changed?10:0)+x.atk+x.charge;const ys=(y.changed?10:0)+y.atk+y.charge;return ys-xs;})[0];if(b){if(b.equip)log('CPU replaced '+b.equip.name,'eq');b.equip={...act};if(fx==='eq_resonator')addChg(b,2);if(fx==='eq_ghost')b._gUsed=false;log(act.name+' → '+b.name,'eq');}}
}

function endCpu(){
  if(G.winner)return;
  forgeEndOfTurn('c');
  // TentaClam — Hoarder's Eye: end of turn, +1 Doubloon per other living crewmate (max +2). CPU side.
  const _cTenta=alive(G.c).find(b=>b.key==='tentaclam');
  if(_cTenta){
    const others=Math.min(2, alive(G.c).filter(b=>b!==_cTenta).length);
    if(others>0)earnCoins('c',others);
  }
  G.c.bots.forEach(b=>{b.exhst=false;b._dbl=false;b._fury=false;});
  G.p.bots.forEach(b=>{b._dbl=false;b._fury=false;b.wallStacks=0;b.exhst=false;});
  turn++;G.phase='charge';atked=false;G.supportUsed=false;G.boostActive=null;G.tauntActive=false;G.p.switched=false;if(G.p._henryUsed)G.p._henryUsed=false;
  G._lsBannerThisTurn=false; // allow banner to fire again next turn
  G._royalFallen=0; // reset Royal medal fallen ally counter each turn
  alive(G.p).forEach(b=>{b._taiBonus=0;b._comboCount=0;b._dualTechUsed=false;});
  G.p._techsThisTurn=0;G.p._karincards=0; // reset turn-based passives
  if(G.pTraps&&G.pTraps.length){log(G.pTraps.length+' unused trap(s) expired.','info');G.pTraps=[];}
  actionsLeft=calcActionsLeft(); // recalculate (medals may have changed)
  log('— Turn '+turn+' —','info');
  // Turn limit: turn 12 → HP tally decides winner
  if(turn>12){
    const pHP=alive(G.p).reduce((s,b)=>s+b.hp,0);
    const cHP=alive(G.c).reduce((s,b)=>s+b.hp,0);
    G.winner=pHP>=cHP?'p':'c';
    G.reason='Turn limit reached! '+
      (pHP>=cHP?'You win on HP ('+pHP+' vs '+cHP+')':'CPU wins on HP ('+cHP+' vs '+pHP+')');
    G.story.push('Time limit hit — HP tally: You '+pHP+' vs CPU '+cHP);
    showEnd();return;
  }
  drw(G.p,2);
  setTimeout(runPhase,350);
}

