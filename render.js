// ═══ RENDER ═══
function renderAll(){
  try{ renderPcPanels(); }catch(e){}renderTeam('c');renderTeam('p');renderHand();renderHeader();renderCenter();}

function renderTeam(sk){
  const el=document.getElementById(sk==='p'?'plr-team':'cpu-team');
  if(!el)return;
  el.innerHTML='';
  const side=G[sk];

  // Assign triangle slots:
  //   active → slot-active
  //   support bots → slot-support-0, slot-support-1 (left then right)
  //   defeated → slot-dead (stacked in corner)
  let supIdx=0;
  const deadBots=[];

  side.bots.forEach((bot,idx)=>{
    const wrapper=document.createElement('div');
    wrapper.className='bot-slot';
    const card=mkBotEl(bot,idx,sk);

    if(bot.def){
      deadBots.push({wrapper,card});
      wrapper.classList.add('slot-dead');
    } else if(idx===side.activeBot){
      wrapper.classList.add('slot-active');
      wrapper.appendChild(card);
      el.appendChild(wrapper);
    } else {
      wrapper.classList.add('slot-support-'+supIdx);
      supIdx++;
      wrapper.appendChild(card);
      el.appendChild(wrapper);
    }
  });

  // Append dead bots last, stacked
  deadBots.forEach(({wrapper,card},i)=>{
    wrapper.style.bottom='4px';
    wrapper.style.left=(4+i*8)+'px';
    wrapper.appendChild(card);
    el.appendChild(wrapper);
  });
}

function mkBotEl(bot,idx,sk){
  const div=document.createElement('div');
  const hpPct=bot.maxHp>0?Math.max(0,bot.hp/bot.maxHp*100):0;
  const low=bot.hp<=5&&!bot.def;
  const ign=bot.charge>=5&&!bot.def;
  const isActive=G[sk].activeBot===idx&&!bot.def;
  const isSupport=G[sk].activeBot!==idx&&!bot.def;
  let cls='bc';
  if(bot.def)cls+=' def';
  else if(bot.changed)cls+=' changed';
  if(bot._stance&&!bot.def)cls+=' stance-active';
  else if(bot.equip)cls+=' equipped';
  if(isActive)cls+=' active-bot';
  if(isSupport)cls+=' support-bot';
  if(!bot.def){
    if(sk==='p'){
      if(G.p.selBot===idx)cls+=' sel';
      else if(!atked)cls+=' clickable';
    }
    if(sk==='c'&&G.p.selBot!==null&&!atked&&isActive)cls+=' target';
  }
  div.className=cls;
  if(bot._stance&&!bot.def)div.dataset.stance=bot._stance;
  const isMob=window.innerWidth<600;
  const isAct=G[sk].activeBot===idx&&!bot.def;
  const baseBotW=isMob?96:114; // uniform size — active bot is shown by highlight, not by resizing
  // Art zone matches the portrait art ratio (~1.35x tall) so object-fit:cover
  // fills the whole frame edge-to-edge without leaving letterbox bars.
  const artH=Math.round(baseBotW * 1.35);
  const artKey=bot.changed?bot.mcart:bot.art;
  const mc=bot.mColor;
  const pips=Array(5).fill(0).map((_,i)=>{
    let c='pip';
    if(i<bot.charge)c+=i>=4?' ig':' on';
    const col=i<bot.charge&&i<4?mc:'';
    return`<div class="${c}"${col?` style="background:${col}"`:''} ></div>`;
  }).join('');
  const hpColor=hpPct>50?'#10c090':hpPct>25?'#f0a820':'#f04040';
  const mcBonus=bot.changed?(bot.key==='rokusho'?4:5):0;
  const atkDisplay = bot.atk + mcBonus + (bot.equip&&bot.equip.fx==='eq_blaze_arm'?2:0) + (bot.medal==='blaze'||bot.fusedMedal==='blaze'?2:0) + (bot._supportAtk||0);
  const defBonus = (bot._supportDef||0) + (bot.medal==='titan'?1:0) + (bot.key==='rokusho'?1:0);
  const botArtHtml=renderBotArt(bot,baseBotW,artH);
  if(typeof showPcPreview==='function'){ div.addEventListener('mouseenter',()=>{ if(window.innerWidth>=900&&!bot.def) showPcPreview(botPreviewHtml(bot),bot.color); }); div.addEventListener('mousemove',movePcPreview); div.addEventListener('mouseleave',hidePcPreview); }
  const _eqList=(typeof botEquips==='function')?botEquips(bot):(bot.equip?[bot.equip]:[]);
  const equipBadge=(_eqList.length&&!bot.def)?`<div class="equip-badge" title="${_eqList.map(e=>e.name).join(', ')}">\u{1F527}${_eqList.length>1?'<span style="font-size:8px;font-weight:800;margin-left:1px">'+_eqList.length+'</span>':''}</div>`:'';
  const comboBadge=(bot.key==='gokudo'&&!bot.def&&(bot._comboCount||0)>0)?`<div class="combo-badge" title="Combo Cannon: +${bot._comboCount} DMG on next attack">\u{1F525}${bot._comboCount}${bot.changed?'\u26a1':''}</div>`:'';
  div.innerHTML=`${equipBadge}${comboBadge}${botArtHtml}
<div class="binfo" title="Click 🎨 Art to change bot artwork">
  <div class="btop">
    <span class="bname" style="color:${bot.color}${bot.changed?';text-shadow:0 0 8px '+bot.color:''}">${bot.name}${bot.changed?'⚡':''}</span><span class="bpassive-i" onclick="event.stopPropagation();showBotPassive('${sk}',${idx})" style="margin-left:4px;font-size:10px;color:var(--text3);cursor:pointer;border:1px solid var(--text3);border-radius:50%;width:13px;height:13px;display:inline-flex;align-items:center;justify-content:center;line-height:1">\u24d8</span>
    <div style="display:flex;align-items:baseline;gap:4px">
      <span style="font-family:'Share Tech Mono',monospace;font-size:8px;color:${bot.color};opacity:.85">⚔${atkDisplay}${defBonus>0?' 🛡-'+defBonus:''}</span>
      <span class="bhp" style="color:${hpPct<=25?'#f04040':hpPct<=50?'#f0a820':'#40d898'}">${bot.def?'KO':bot.hp}</span>
    </div>
  </div>
  <div class="hpbar"><div class="hpfill" style="width:${hpPct}%;background:${hpColor}"></div></div>
  <div class="medrow">
    <span class="mednm" style="color:${mc}">${bot.mName}</span>
    ${ign?'<span class="igntag">IGNITED</span>':''}
  </div>
  <div class="pips">${pips}</div>
  ${(bot.medal==='plunder'&&isActive)?`<div class="coin-badge" title="Doubloons">${(typeof coinArtUrl==='function'&&coinArtUrl())?`<img src="${coinArtUrl()}" class="coin-badge-icon">`:'🪙'} ${coins(sk)}</div>`:''}
  <div class="btags">
    ${(bot.burn||bot._burnLinger)&&!bot.def?'<span class="btag tgbn">🔥 BURN'+(bot.burn&&bot.burnAmt>1?' '+bot.burnAmt:'')+'</span>':''}
    ${bot.key==='machairodus'&&(bot._stalkReady||bot._stalwaysOn)&&!bot.def?'<span class="btag" style="background:rgba(176,96,240,.2);color:#c89cff;border:1px solid rgba(176,96,240,.5)">\ud83d\udc41\ufe0f STALK +3</span>':''}
    ${bot._predatorMark&&!bot.def?'<span class="btag" style="background:rgba(144,80,208,.22);color:#c090ff;border:1px solid rgba(144,80,208,.5)">\ud83c\udfaf MARKED</span>':''}
    ${bot.exhst&&!bot.def?'<span class="btag" style="background:rgba(160,120,60,.18);color:#d0a060;border:1px solid rgba(208,160,96,.4)">💤 EXHAUSTED</span>':''}
    ${bot._webbed>0&&!bot.def?'<span class="btag" style="background:rgba(144,80,208,.18);color:#c090ff;border:1px solid rgba(144,80,208,.4)">🕸 WEBBED</span>':''}
    ${bot.charge>=5&&!bot.def?'<span class="btag" style="background:rgba(127,208,255,.18);color:#7fd0ff;border:1px solid rgba(127,208,255,.45)">⚡ IGNITED</span>':''}
    ${bot.taunting&&!bot.def?'<span class="btag" style="background:rgba(42,128,240,.15);color:var(--storm2);border:1px solid rgba(42,128,240,.3)">🛡 TAUNT</span>':''}
    ${G.boostActive===bot.key&&!bot.def?'<span class="btag" style="background:rgba(64,216,152,.15);color:var(--green);border:1px solid rgba(64,216,152,.3)">⚔ BOOST</span>':''}
    ${bot.equip&&!bot.def?`<span class="btag tgeq" title="${bot.equip.name}: ${bot.equip.desc||''}">${bot.equip.name.split(' ')[0]}</span>`:''}
    ${bot.changed?'<span class="btag tgmc">⚡CHANGED</span>':''}
    ${bot._stance&&!bot.def?`<span class="btag" style="background:rgba(200,50,50,.18);color:#e8d0a0;border:1px solid rgba(200,50,50,.4);font-size:9px">⚔ ${bot._stance.toUpperCase()} STANCE</span>`:''}
    ${bot.fusedMedal&&!bot.def?`<span class="btag tgfs">+${MEDAL[bot.fusedMedal].name}</span>`:''}
    ${bot.fusedMedal2&&!bot.def?`<span class="btag tgfs">+${MEDAL[bot.fusedMedal2].name}</span>`:''}${lastStandBadge(bot,sk)}
  </div>
  ${!bot.def&&isActive?`<div class="bot-passive-line" style="color:var(--green)" title="${bot.passive||''}">${bot.passive||''}</div>`:''}
  ${!bot.def&&isSupport?supportPassiveHtml(bot):''}
</div>
${!bot.def&&G.phase==='action'&&!atked?`<div class="dhint">${sk==='c'?'▼ DROP ATTACK':sk==='p'&&actionsLeft>0?'▲ DROP EQUIP':''}</div>`:''}`;
  // Interactions
  if(sk==='p'&&!bot.def&&G.phase==='action'&&!atked){
    div.onclick=()=>selBot(idx);
    div.addEventListener('dragover',e=>{e.preventDefault();div.classList.add('drop-ally');});
    div.addEventListener('dragleave',e=>{if(!div.contains(e.relatedTarget))div.classList.remove('drop-ally');});
    div.addEventListener('drop',e=>{e.preventDefault();div.classList.remove('drop-ally');dropAlly(e,idx);});
  }
  // Ranged: if the player has a ranged attacker/card ready, support bots become valid targets too.
  const _pRanged=(function(){
    try{
      const ab=(G.p.selBot!==null)?G.p.bots[G.p.selBot]:null;
      if(ab&&ab.key==='beetle_gun')return true;
      if(G.p.selCard){ const sc=G.p.hand.find(c=>c.uid===G.p.selCard); if(sc&&(sc.fx==='cm_buster'||sc.fx==='cm_skyvolley'))return true; }
    }catch(e){}
    return false;
  })();
  const _canTarget = (idx===G.c.activeBot) || _pRanged || (G.c&&G.c.bots&&G.c.bots[idx]&&!G.c.bots[idx].def&&G.c.bots.some(b=>b.key==='kensho'&&!b.def));
  if(sk==='c'&&!bot.def&&G.phase==='action'&&!atked&&_canTarget){
    div.addEventListener('dragover',e=>{e.preventDefault();div.classList.add('drop-enemy');});
    div.addEventListener('dragleave',e=>{if(!div.contains(e.relatedTarget))div.classList.remove('drop-enemy');});
    div.addEventListener('drop',e=>{e.preventDefault();div.classList.remove('drop-enemy');dropEnemy(e,idx);});
    if(idx!==G.c.activeBot&&_pRanged){ try{ div.classList.add('snipe-target'); }catch(e){} }
    if(G.p.selBot!==null)div.onclick=()=>atkEnemy(idx);
  }
  return div;
}

let _drag=null,_lastTech=null;

// ── SUPPORT PASSIVES ──────────────────────────────────────
// Applied each turn via doCharge when bot is NOT the active bot
const SUPPORT_PASS={
  metabee:  {desc:'Support: Team ATK +1',    apply:(active,s)=>{if(active)active._supportAtk=(active._supportAtk||0)+1;}},
  arcbeetle:{desc:'Support: Active +1 Charge',apply:(active,s)=>{if(active)addChg(active,1);}},
  warbandit:{desc:'Support: Active draws on attack',apply:(active,s)=>{if(active)active._warbDraw=true;}},
  rokusho:  {desc:'Support: Active -1 DMG taken',apply:(active,s)=>{if(active)active._supportDef=(active._supportDef||0)+1;}},
  sumilidon:{desc:'Support: Active heals 1/turn',apply:(active,s)=>{if(active){active.hp=Math.min(active.maxHp,active.hp+1);}}},
  machairodus:{desc:'Support: Active pierces armor',apply:(active,s)=>{if(active)active._machPierce=true;}},
};

function supportPassiveHtml(bot){
  const sp=SUPPORT_PASS[bot.key];
  if(!sp)return '';
  return '<div class="bot-passive-line" style="color:var(--storm2)" title="'+sp.desc+'">'+sp.desc+'</div>';
}

function getActiveBot(sk){
  const side=G[sk];
  const alive_=side.bots.filter(b=>!b.def);
  if(!alive_.length)return null;
  // Find active by index, skip if defeated
  let ab=side.bots[side.activeBot];
  if(!ab||ab.def){
    // Find first alive bot and make it active
    const first=side.bots.findIndex(b=>!b.def);
    if(first>=0){side.activeBot=first;ab=side.bots[first];}
    else return null;
  }
  return ab;
}

function getSupportBots(sk){
  const side=G[sk];
  return side.bots.filter((b,i)=>!b.def&&i!==side.activeBot);
}

function applySupportPassives(sk){
  const active=getActiveBot(sk);
  if(!active)return;
  // Recalculate ATK and DEF bonuses fresh each time (don't stack across calls)
  active._supportAtk=0;
  active._supportDef=0;
  // _warbDraw is one-shot — only set it if not already pending
  getSupportBots(sk).forEach(b=>{
    const sp=SUPPORT_PASS[b.key];
    if(sp)sp.apply(active,sk);
  });
  const supBotNames=getSupportBots(sk).map(b=>b.name).join(', ')||'none';
  if(active._supportAtk>0)log('⚔ '+active.name+' gets +'+active._supportAtk+' ATK (support: '+supBotNames+')','chg');
  if(active._supportDef>0)log('🛡 '+active.name+' gets -'+active._supportDef+' DMG taken (support: '+supBotNames+')','chg');
  if(active._warbDraw)log('📖 '+active.name+' will draw after attacking (Warbandit support)','chg');
}

function switchActive(sk,newIdx){
  const side=G[sk];
  if(sk==='p'&&G_online&&G_myTurn){ MWNet.move({type:'switch',idx:newIdx}); _syncNow(); }
  if(side.bots[side.activeBot]&&side.bots[side.activeBot]._noSwitch){ log('Pinned — cannot switch this turn!','info'); return; }
  if(side.bots[newIdx]&&!side.bots[newIdx].def){
    // Check web — only CPU bots get webbed (player can always switch)
    if(sk==='c'&&side.bots[newIdx]._webbed>0){log('Cannot switch — '+side.bots[newIdx].name+' is webbed!','info');return;}
    const old=getActiveBot(sk);
    side.activeBot=newIdx;
    const nw=getActiveBot(sk);
    log((old?old.name:'?')+' → '+nw.name+' moves to front!','chg');
    banner(nw.name.toUpperCase()+' STEPS UP!',nw.color||'#f0b820');
  }
}
function mkCardEl(card,i,total){
  const div=document.createElement('div');
  const play=canPlay(card);
  const sel=G.p.selCard===card.uid;
  div.className='hc'+(play?' play':'')+(sel?' sel':'')+((!play&&G.phase==='action')?' dim':'');
  div.setAttribute('data-t',card.type);
  div.setAttribute('data-uid',card.uid);
  div.style.setProperty('--hc-color',card.color);

  // Fan spread: rotate cards around center, arc down at edges
  const n=total||1;
  const mid=(n-1)/2;
  const rot=n>1?((i-mid)/(mid||1))*7:0;
  const yOff=n>1?(Math.abs(i-mid)*1.5):0;
  // Set rotation/offset as CSS variables so the .hc / .hc.sel rules compose the
  // full transform (incl. scale on select). Setting transform inline here would
  // override those state rules and cause cards to look like they resize on re-render.
  div.style.setProperty('--hc-rot',`rotate(${rot.toFixed(1)}deg)`);
  div.style.setProperty('--hc-y',`${yOff.toFixed(1)}px`);
  div.style.setProperty('--hc-base-rot',`rotate(${rot.toFixed(1)}deg)`);
  div.style.transformOrigin='bottom center';
  div.style.zIndex=String(i+1);
  div.style.animationDelay=(i*.06)+'s';
  const mobFan=window.innerWidth<600;
  if(i>0)div.style.marginLeft=mobFan?'-28px':'-36px';

  if(play){
    div.draggable=true;
    div.addEventListener('dragstart',e=>{
      _drag=card;e.dataTransfer.effectAllowed='move';
      setTimeout(()=>{div.style.opacity='.35';},0);
    });
    div.addEventListener('dragend',()=>{div.style.opacity='';_drag=null;});
    div.onclick=()=>clickCard(card);
  }
  const mob=window.innerWidth<600;
  div.innerHTML=`${renderCardArt(card,mob?72:104,mob?48:69)}<div class="hbody"><div class="htype" style="color:${card.color}">${card.type}</div><div class="hname">${card.name}</div><div class="hstat" style="color:${card.color}">${card.stat||''}</div><div class="hdesc">${card.desc}</div></div>`;
  attachTip(div,card);
  return div;
}

function dropEnemy(e,idx){
  if(!_drag)return;const c=_drag;_drag=null;
  if(c.type==='technique'||c.type==='medaforce'){
    if(c.type==='medaforce'){if(!atked&&alive(G.p).some(b=>b.charge>=5))openMFCard(c);return;}
    if(atked){log('Already attacked.','info');return;}
    if(G.p.selBot===null){const fi=G.p.bots.findIndex(b=>!b.def);if(fi>=0)G.p.selBot=fi;}
    G.p.selCard=c.uid;atkEnemy(idx);
  }else if(c.type==='action'){playAct(c);}
  else if(c.type==='equipment'){playEquip(c);}
}
function dropAlly(e,idx){
  if(!_drag)return;const c=_drag;_drag=null;
  if(c.type==='equipment'){playEquip(c);}
  else if(c.type==='action'&&c.fx==='act_charge'){
    if(actionsLeft<=0)return;dsc(G.p,c.uid);actionsLeft--;
    const b=G.p.bots[idx];if(b&&!b.def)addChg(b,2);renderAll();
  }else if(c.type==='technique'&&c.fx==='deal2_heal'&&!atked){
    dsc(G.p,c.uid);
    const b=G.p.bots[idx];if(b&&!b.def){b.hp=Math.min(b.maxHp,b.hp+4);flt('+4','heal');log(b.name+' healed 4','chg');}
    renderAll();
  }else if(c.type==='medachange'){playMC(c);}
}

function canPlay(c){
  if(G.phase!=='action')return false;
  if(c.type==='trap')return actionsLeft>0&&G.pTraps.length<3;
  if(c.fx==='act_locate')return actionsLeft>0&&!G.locatorUsed&&G.p.deck.some(d=>d.type==='medaforce');
  if(c.type==='action'||c.type==='equipment')return actionsLeft>0;
  if(c.type==='medachange')return actionsLeft>0&&!G.p.mcUsed&&alive(G.p).some(b=>b.key===c.fx.replace('mc_bot_',''));
  if(c.type==='technique'){
    const _ab=getActiveBot('p');
    const nin=_ab&&(_ab.key==='nin_ninja'||(_ab.equip&&_ab.equip.fx==='eq_ninja_scroll'));
    const maxTechs=nin?(G.p._ninFreeExtra?3:2):1;
    const techsUsed=G.p._techsThisTurn||0;
    // Nin-Ninja: can play techniques standalone (no attack needed) up to maxTechs
    // Other bots: technique must bundle with attack (selBot set, not yet attacked)
    if(nin) return G.phase==='action'&&techsUsed<maxTechs&&actionsLeft>0;
    return !!getActiveBot('p')&&!atked&&(G.p._techsThisTurn||0)<1;
  }
  if(c.type==='medaforce'){
    const igThresh=alive(G.p).some(b=>b.medal==='emperor'||b.fusedMedal==='emperor')?4:5;
    return!atked&&alive(G.p).some(b=>b.charge>=igThresh);
  }
  return false;
}


// Hand browser — full-screen grid of your hand, tap a card to play it
function openHandBrowser(){
  if(!G||!G.p||!G.p.hand)return;
  const cards=G.p.hand;
  if(cards.length===0){openM('Your Hand','No cards in hand.',[{l:'Close',cls:'mb ok',cb:()=>closeM()}]);return;}
  const grid=cards.map((c,i)=>{
    const playable=(typeof canPlay==='function')?canPlay(c):false;
    return '<div onclick="_handBrowserPlay('+i+')" style="border:1.5px solid '+(playable?(c.color||'#888'):'rgba(255,255,255,.08)')+';border-radius:10px;padding:8px;background:rgba(0,0,0,.3);opacity:'+(playable?'1':'.45')+';cursor:pointer">'+
      '<div style="font-family:Orbitron,monospace;font-size:10px;font-weight:700;color:'+(c.color||'#fff')+'">'+c.name+'</div>'+
      '<div style="font-size:8px;color:var(--text3);margin:2px 0">'+(c.type||'').toUpperCase()+' · '+(c.stat||'')+'</div>'+
      '<div style="font-size:9px;color:var(--text2);line-height:1.35">'+(c.desc||'')+'</div>'+
      (playable?'':'<div style="font-size:8px;color:var(--red);margin-top:3px">Cannot play now</div>')+
    '</div>';
  }).join('');
  openM('Your Hand ('+cards.length+')',
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;max-height:55vh;overflow-y:auto;padding:2px">'+grid+'</div>',
    [{l:'Close',cls:'mb ok',cb:()=>closeM()}]);
}
function _handBrowserPlay(i){
  const c=G.p.hand[i];
  if(!c)return;
  if(typeof canPlay==='function'&&!canPlay(c)){return;}
  closeM();
  clickCard(c);
}

function renderHand(){
  const el=document.getElementById('m-hscroll');if(!el)return;
  const _scroll=el.scrollLeft; // preserve scroll so screen doesn't jump
  el.innerHTML='';
  const n=G.p.hand.length;
  G.p.hand.forEach((c,i)=>el.appendChild(mkCardEl(c,i,n)));
  el.scrollLeft=_scroll;
  (function(){const e=document.getElementById('hcnt');if(e)e.textContent=G.p.hand.length;})();
  (function(){const e=document.getElementById('hhint');if(e)e.textContent=getHint();})();
  // Center when cards fit; scroll mode when they overflow
  requestAnimationFrame(()=>{
    if(!el)return;
    const fits=el.scrollWidth<=el.clientWidth+4;
    el.classList.toggle('centered',fits);
  });
}

function renderHeader(){
  (function(){const e=document.getElementById('tnum');if(e)e.textContent='T'+turn;})();
  const _mph=document.getElementById('mphase');
  if(_mph){const _ml={charge:'CHARGE',action:'ACTION',cpu_turn:(typeof G_online!=='undefined'&&G_online)?'OPP':'CPU'};const _mc={charge:'charge',action:'action',cpu_turn:'cpu'};_mph.textContent=_ml[G.phase]||G.phase.toUpperCase();_mph.className='m-phase '+(_mc[G.phase]||'charge');}
  ['ph0','ph1','ph2'].forEach(function(id){var e=document.getElementById(id);if(e)e.classList.remove('active');});
  var _phs={charge:'ph0',action:'ph1',cpu_turn:'ph2'};var _pid=_phs[G.phase];if(_pid){var _pe=document.getElementById(_pid);if(_pe)_pe.classList.add('active');}
  (function(){const e=document.getElementById('mfname');if(e)e.textContent=G.p.mf?G.p.mf.name:'';})();
  (function(){
    const pw=document.getElementById('m-mf-portrait')||document.getElementById('mf-portrait-wrap');
    if(pw&&G.p&&G.p.mf&&G.p.mfKey)pw.innerHTML=renderMFArt(G.p.mfKey,38,38);
    const pp=document.getElementById('mf-pass-strip');
    if(pp&&G.p&&G.p.mf)pp.textContent=G.p.mf.pass;
  })();
  (function(){const e=document.getElementById('flag-act');if(e)e.classList.toggle('done',actionsLeft<=0);})();
  (function(){const eb=document.getElementById('btn-end');if(eb){const ready=G.phase==='action'&&(atked||actionsLeft<=0)&&!G.winner;eb.classList.toggle('ready',ready);}})();
  (function(){const e=document.getElementById('flag-atk');if(e)e.classList.toggle('done',atked);})();
}

function renderCenter(){
  (function(){const e=document.getElementById('cdeck');if(e)e.textContent=G.c.deck.length;})();
  (function(){const e=document.getElementById('pdeck');if(e)e.textContent=G.p.deck.length;})();
  // Update zone labels with active bot name
  const cAct=getActiveBot('c');const pAct=getActiveBot('p');
  const clbl=document.getElementById('cpu-zone-lbl');
  const plbl=document.getElementById('plr-zone-lbl');
  if(clbl)clbl.textContent='CPU · '+(cAct?cAct.name:'—');
  if(plbl)plbl.textContent=(pAct?pAct.name+' ▶ FRONT':'YOUR TEAM');
  const endBtn=document.getElementById('btn-end');if(endBtn)endBtn.disabled=G.phase!=='action';
  // Trap zone — render glowing trap cards in player field
  const trapZone=document.getElementById('trap-zone');
  if(trapZone){
    trapZone.innerHTML='';
    const trapIcons={trap_negate:'🛡',trap_nullmf:'🌀',trap_reflect:'💠'};
    (G.pTraps||[]).forEach(t=>{
      const tc=document.createElement('div');
      tc.className='trap-card'+(t.isNew?' trap-new':'');
      tc.title=t.name+' — triggers on enemy attack/Medaforce';
      tc.innerHTML='<div class="trap-icon">'+(trapIcons[t.fx]||'⚡')+'</div><div class="trap-lbl">'+t.name+'</div>';
      trapZone.appendChild(tc);
    });
  }
  // Action counter display
  const acCtr=document.getElementById('action-counter');
  if(acCtr){
    const isLastStand=alive(G.p).length===1&&alive(G.p)[0]&&alive(G.p)[0].key==='arcbeetle';
    if(G.phase==='action'&&actionsLeft>0&&isLastStand){
      acCtr.style.display='inline-flex';
      acCtr.style.alignItems='center';
      acCtr.textContent='⚡ '+actionsLeft+' ACTIONS LEFT';
    } else {
      acCtr.style.display='none';
    }
  }
  const ign=alive(G.p).filter(b=>b.charge>=5);
  const hasMF=G.p.hand.some(c=>c.type==='medaforce')&&ign.length;
  (function(){const e=document.getElementById('btn-mf');if(e)e.disabled=!(G.phase==='action'&&hasMF&&!atked);})();
  const hasMC=!G.p.mcUsed&&G.p.hand.some(c=>c.type==='medachange');
  (function(){const e=document.getElementById('btn-mc');if(e)e.disabled=!(G.phase==='action'&&hasMC&&actionsLeft>0);})();
  const supBtn=document.getElementById('btn-sup');
  if(supBtn){
    const canSup=G.phase==='action'&&!G.supportUsed&&!atked&&G.p.selBot!==null;
    supBtn.disabled=!canSup;
  }
  const swBtn=document.getElementById('btn-switch');
  if(swBtn){
    const canSw=G.phase==='action'&&!G.p.switched&&alive(G.p).length>1;
    swBtn.disabled=!canSw;
  }
}

function getHint(){
  if(G.phase!=='action')return'Waiting for turn...';
  if(G.p.selCard)return'Technique selected → click enemy bot or drag to target';
  if(G.p.selBot!==null){
    const b=G.p.bots[G.p.selBot];
    return(b?b.name:'')+' selected → attack enemy · or use SUPPORT action instead';
  }
  return'Select your bot to attack · or play a card from hand';
}


// ── PC side panels (desktop only) ──
function renderPcPanels(){
  if(window.innerWidth<1100) return;
  // Log panel — mirror recent log lines
  const lc=document.getElementById('pc-log-content');
  if(lc&&typeof logs!=='undefined'){
    const recent=logs.slice(-30);
    lc.innerHTML=recent.map(e=>`<div class="pc-log-line ${e.t||''}">${e.m}</div>`).join('');
    lc.scrollTop=lc.scrollHeight;
    const p=document.getElementById('pc-log-panel'); if(p)p.scrollTop=p.scrollHeight;
  }
  // Status panel — turn, phase, forge counter, active buffs
  const sc=document.getElementById('pc-status-content');
  if(sc&&typeof G==='object'&&G&&G.p){
    let html='';
    html+=`<div class="pc-stat-row"><span>Turn</span><span>${typeof turn!=='undefined'?turn:1}</span></div>`;
    html+=`<div class="pc-stat-row"><span>Phase</span><span>${G.phase||'-'}</span></div>`;
    html+=`<div class="pc-stat-row"><span>Your deck</span><span>${G.p.deck?G.p.deck.length:0} left</span></div>`;
    html+=`<div class="pc-stat-row"><span>Hand</span><span>${G.p.hand?G.p.hand.length:0}</span></div>`;
    // Forge Counter (only if playing forge)
    if(deck==='forge'&&typeof forgeCount==='function'){
      const fc=forgeCount('p');
      html+=`<div class="pc-stat-row" style="border:none"><span>Forge Counter</span><span style="color:#f0c040">${fc}</span></div>`;
      html+=`<div class="pc-forge-meter"><div class="pc-forge-fill" style="width:${Math.min(100,fc/5*100)}%"></div></div>`;
      html+=`<div style="font-size:9px;color:var(--text3);margin-top:4px">${fc>=5?'⚡ Unblockable active!':fc>=3?'✓ Team +1 ATK (3+)':'Build to 3 for team buff'}</div>`;
    }
    // Active bot summary
    const ab=getActiveBot('p');
    if(ab){
      html+=`<div style="margin-top:10px;font-size:10px;color:var(--gold);font-weight:700">ACTIVE: ${ab.name}</div>`;
      html+=`<div style="font-size:10px;color:var(--text2);margin-top:2px">HP ${ab.hp}/${ab.maxHp} · ⚔${ab.atk} · ${ab.charge||0} chg</div>`;
    }
    sc.innerHTML=html;
  }
}

function renderLog(){
  try{ renderPcPanels(); }catch(e){}
  const el=document.getElementById('lentries');
  if(!el)return;
  el.innerHTML=logs.slice(-60).map(e=>`<div class="le le-${e.t}">${e.m}</div>`).join('');
  el.scrollTop=el.scrollHeight;
}

