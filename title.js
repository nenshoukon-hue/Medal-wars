// ═══ TITLE ═══
function setDiff(d,el){
  cpuDiff=d;
  // Reset ALL three difficulty buttons to dim/unselected
  const cfg={easy:{c:'64,200,136',v:'var(--green)'},normal:{c:'240,176,48',v:'var(--gold)'},hard:{c:'232,64,64',v:'var(--red)'}};
  ['easy','normal','hard'].forEach(k=>{
    const b=document.getElementById('diff-'+k);
    if(!b)return;
    if(k===d){
      b.style.borderColor='rgba('+cfg[k].c+',.9)';
      b.style.background='rgba('+cfg[k].c+',.22)';
      b.style.color=cfg[k].v;
      b.style.boxShadow='0 0 10px rgba('+cfg[k].c+',.4)';
    } else {
      b.style.borderColor='rgba('+cfg[k].c+',.25)';
      b.style.background='transparent';
      b.style.color='var(--text3)';
      b.style.boxShadow='none';
    }
  });
}

const DECK_DIFFICULTY={
  blaze:{tier:'Beginner',stars:1,note:'Straightforward aggro — play cards, deal burn, attack.'},
  forge:{tier:'Beginner',stars:1,note:'Build equipment onto one bot — simple, powerful.'},
  titan:{tier:'Intermediate',stars:2,note:'Manage charge denial and timing.'},
  cross:{tier:'Intermediate',stars:2,note:'Bank Charge, then unleash Cross Burst at the right moment.'},
  royal:{tier:'Advanced',stars:3,note:'Protect the front and time DigiStrike.'},
  throne:{tier:'Advanced',stars:3,note:'One bot — positioning and resource timing are everything.'},
  shadow:{tier:'Expert',stars:4,note:'Chain techniques precisely to fuel Combo Cannon.'},
  blacktide:{tier:'Intermediate',stars:2,note:'Decide each turn: spend Doubloons now for tempo, or hoard for a Win Medals finish.'},
  senbei:{tier:'Expert',stars:4,note:'Hold Stances to bank Resonance, then end it with the three-beat Zanshin cut.'},
};
DECK_IDENTITY={
  blaze:'Fire & burn aggro — stack burn, cash in with Scorch and Inferno Surge.',
  titan:'Disruption control — drain charge, endure, close with Last Stand.',
  royal:'Vanguard + Digimon collab — protect the front, finish with DigiStrike.',
  shadow:'Chain combo — dual techniques feed Combo Cannon and Chain Strike.',
  throne:'Solo siege fortress — one bot, Cable Network, Imperial Barrage.',
  forge:'Equipment engine — bolt gear onto Grand Beetle, heal with Neutranurse, sacrifice with Blackram, then Overforge.',
  cross:'Charge mastery — hoard Charge with the Zero Medal, scale every attack off it, then unleash Cross Burst for massive damage.',
  blacktide:'Coin economy — earn Doubloons on attack, then choose: drip-spend for tempo or bank toward Powder Keg and Win Medals.',
};

// ── Constrained Deck Editor: swap up to 3 cards for generics ──
const GENERIC_POOL=['gen_field_medic','gen_bulwark','gen_static_field','gen_recharge','gen_salvage','gen_override','gen_power_surge','gen_pile_driver','gen_last_resort','gen_medal_reboot'];
const MAX_SWAPS=3;
function _maxSwapsFor(dk){ return dk==='titan'?2:3; } // Titan capped: too strong with full defensive generics
function _getSwaps(deckKey){ try{ return JSON.parse(localStorage.getItem('mw_swaps_'+deckKey)||'[]'); }catch(e){ return []; } }
function _setSwaps(deckKey, arr){ try{ localStorage.setItem('mw_swaps_'+deckKey, JSON.stringify(arr)); }catch(e){} }

// Apply saved swaps to a freshly-built deck array (called in init)
function applyDeckSwaps(deckKey, deckArr){
  const swaps=_getSwaps(deckKey);
  if(!swaps.length) return deckArr;
  const result=deckArr.slice();
  swaps.forEach(sw=>{
    // remove one copy of sw.out, add sw.in
    const idx=result.findIndex(c=>c.id===sw.out);
    if(idx>=0 && CDEFS[sw.in]){
      result.splice(idx,1);
      result.push({...CDEFS[sw.in], uid:uid()});
    }
  });
  return result;
}

function openDeckEditor(){
  const names={blaze:'Blaze Chain',titan:'Titan Guard',royal:'Royal Court',shadow:'Shadow Blade',throne:'Iron Throne',forge:'Forge Barons',cross:'Cross Messiah'};
  const dk=deck;
  const swaps=_getSwaps(dk);
  // Build the deck's current card list (counts)
  const base=DECKS[dk].deck;
  const counts={};
  base.forEach(c=>{ counts[c.id]=counts[c.id]||{name:c.name,n:0,id:c.id}; counts[c.id].n++; });
  let html='<div style="font-size:10px;color:var(--text2);text-align:center;margin-bottom:8px">Swap up to '+MAX_SWAPS+' cards for generics. <b style="color:var(--gold)">'+swaps.length+'/'+_maxSwapsFor(dk)+'</b> used.</div>';
  // Current swaps
  if(swaps.length){
    html+='<div style="background:rgba(96,180,255,.08);border-radius:8px;padding:7px;margin-bottom:8px">';
    swaps.forEach((sw,i)=>{
      const outN=(CDEFS[sw.out]||{}).name||sw.out, inN=(CDEFS[sw.in]||{}).name||sw.in;
      html+='<div style="font-size:10px;display:flex;justify-content:space-between;align-items:center;margin:2px 0"><span><span style="color:var(--storm2)">'+outN+'</span> \u2192 <span style="color:#60d8a0">'+inN+'</span></span><span onclick="_removeSwap('+i+')" style="color:var(--red);cursor:pointer;padding:0 6px">\u2715</span></div>';
    });
    html+='</div>';
  }
  html+='<div style="max-height:38vh;overflow-y:auto">';
  html+='<div style="font-size:9px;color:var(--gold);font-weight:700;margin-bottom:4px">YOUR DECK \u2014 tap a card to swap it out</div>';
  Object.values(counts).forEach(c=>{
    const swappedOut=swaps.filter(s=>s.out===c.id).length;
    const avail=c.n-swappedOut;
    if(avail<=0) return;
    const disabled=swaps.length>=_maxSwapsFor(dk);
    html+='<div onclick="'+(disabled?'':"_pickSwapOut('"+c.id+"')")+'" style="font-size:11px;padding:6px 8px;border-radius:6px;margin-bottom:3px;background:rgba(0,0,0,.25);border:1px solid var(--border);'+(disabled?'opacity:.4':'cursor:pointer')+'"><span style="color:var(--text2)">'+avail+'\u00d7</span> '+c.name+'</div>';
  });
  html+='</div>';
  openM(names[dk]+' \u2014 Editor', html, [{l:'Reset', cls:'mb', style:'font-size:10px;color:var(--text3)', cb:()=>{ _setSwaps(dk,[]); openDeckEditor(); }},{l:'Done', cls:'mb ok', cb:()=>{ closeM(); renderDeckPreview&&renderDeckPreview(dk); }}]);
}
function _pickSwapOut(outId){
  const dk=deck;
  let html='<div style="font-size:10px;color:var(--text2);text-align:center;margin-bottom:8px">Swap <b style="color:var(--storm2)">'+(CDEFS[outId]||{}).name+'</b> for:</div><div style="max-height:42vh;overflow-y:auto">';
  GENERIC_POOL.forEach(gid=>{
    const c=CDEFS[gid]; if(!c) return;
    html+='<div onclick="_confirmSwap(\''+outId+'\',\''+gid+'\')" style="padding:7px 8px;border-radius:6px;margin-bottom:4px;background:rgba(0,0,0,.25);border:1px solid '+c.color+'44;cursor:pointer">';
    html+='<div style="font-size:11px;font-weight:700;color:'+c.color+'">'+c.name+' <span style="font-size:8px;color:var(--text3)">'+c.type.toUpperCase()+'</span></div>';
    html+='<div style="font-size:9px;color:var(--text2);line-height:1.35">'+c.desc.replace(' Generic.','')+'</div></div>';
  });
  html+='</div>';
  openM('Choose Replacement', html, [{l:'Back', cls:'mb ok', cb:()=>openDeckEditor()}]);
}
function _confirmSwap(outId, inId){
  const dk=deck; const swaps=_getSwaps(dk);
  if(swaps.length>=_maxSwapsFor(dk)){ closeM(); return; }
  swaps.push({out:outId, in:inId}); _setSwaps(dk, swaps);
  openDeckEditor();
}
function _removeSwap(i){
  const dk=deck; const swaps=_getSwaps(dk); swaps.splice(i,1); _setSwaps(dk,swaps); openDeckEditor();
}

function pickDeck(el){
  document.querySelectorAll('.dpk').forEach(d=>d.classList.remove('sel'));
  el.classList.add('sel');deck=el.dataset.deck;
  renderDeckPreview(deck);
}

// Build the full card list for a deck (counts duplicates), grouped by type.
function buildDeckList(dk){
  const D=DECKS[dk];
  if(!D||!D.deck) return '';
  // D.deck is an array of card objects; count by id
  const counts={};
  D.deck.forEach(c=>{ counts[c.id]=counts[c.id]||{c:c,n:0}; counts[c.id].n++; });
  const typeOrder=['medaforce','medachange','technique','action','equipment','trap'];
  const typeLabel={medaforce:'MEDAFORCE',medachange:'MEDACHANGE',technique:'TECHNIQUES',action:'ACTIONS',equipment:'EQUIPMENT',trap:'TRAPS'};
  const byType={};
  Object.values(counts).forEach(({c,n})=>{ (byType[c.type]=byType[c.type]||[]).push({c,n}); });
  let total=0; D.deck.forEach(()=>total++);
  let html='<div style="font-family:Orbitron,monospace;font-size:9px;color:var(--gold);letter-spacing:1px;text-align:center;margin:8px 0 6px;border-top:1px solid var(--border);padding-top:8px">DECKLIST · '+total+' CARDS</div>';
  typeOrder.forEach(t=>{
    if(!byType[t]||!byType[t].length) return;
    html+='<div style="font-size:8px;font-weight:700;color:var(--text3);letter-spacing:.6px;margin:6px 0 3px">'+typeLabel[t]+'</div>';
    byType[t].sort((a,b)=>b.n-a.n).forEach(({c,n})=>{
      html+='<div style="display:flex;justify-content:space-between;align-items:center;gap:6px;padding:2px 0;font-size:10px;line-height:1.3">'+
        '<span style="color:'+(c.color||'var(--text)')+';flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+c.name+
        (c.stat?' <span style=\'color:#ffb870;font-size:8px;font-weight:600\'>'+c.stat+'</span>':'')+'</span>'+
        '<span style="color:#c8a888;font-size:9px;flex-shrink:0;font-weight:600">x'+n+'</span></div>';
    });
  });
  return html;
}
function toggleDeckList(dk){
  const box=document.getElementById('decklist-box');
  if(!box) return;
  if(box.style.display==='none'||!box.style.display){
    box.innerHTML=buildDeckList(dk);
    box.style.display='block';
    const btn=document.getElementById('decklist-btn');
    if(btn) btn.textContent='▲ HIDE DECKLIST';
  } else {
    box.style.display='none';
    const btn=document.getElementById('decklist-btn');
    if(btn) btn.textContent='\u25bc VIEW DECKLIST';
  }
}


// ═══ DECK GUIDE — concise strategy walkthroughs ═══
const DECK_GUIDES={
  blaze:{name:'Blaze Chain',color:'#f06424',tier:'Beginner',
    plan:'Aggro burn. Stack burn on the enemy front bot, then cash it in for burst damage before they stabilize.',
    plays:['Apply burn early with techniques, then attack — Metabee deals +1 when the target is burning.','Save Scorch/Inferno Surge for when burn is stacked high.','Race: trade aggressively, you win the short game.'],
    win:'End matches fast. If a game drags past mid-game, push for lethal rather than playing safe.'},
  titan:{name:'Titan Guard',color:'#8090a0',tier:'Advanced',
    plan:'Combining archetype. Survive the early game, then fuse your bots into the legendary Masterbeetle for an unstoppable finisher.',
    plays:['Stall and disrupt early \u2014 drain Charge, heal, and protect your bots while you set up.','X Fusion Change: combine Arcbeetle Dash + Machairodus into MASTERBEETLE (combined stats, pierces reduction).','Master Medachange: Rokusho rides on top for the ultimate form \u2014 hits ALL enemies, takes 3 less dmg, heals each turn.'],
    win:'Reach the two-stage fusion. Once Masterbeetle \u039e is online, fire Master Cannon (Prominence Railgun) or X Burst \u2014 they hit far harder while fused.'},
  royal:{name:'Royal Court',color:'#f0c040',tier:'Advanced',
    plan:'Evolution engine. Evolve all three Digimon repeatedly \u2014 every Medachange permanently powers up the whole Court.',
    plays:['Lead with Evolution Call: it refunds the action and pulls a Medachange so you evolve immediately.','Evolve a different bot each turn \u2014 every evolution gives all Royal bots +2 ATK.','Finish with DigiStrike: it hits for 6 +2 per evolution, on all three bots at once.'],
    win:'Snowball evolutions, then unleash a scaling DigiStrike once your board is fully evolved.'},
  shadow:{name:'Shadow Blade',color:'#9050d0',tier:'Expert',
    plan:'Chain combo. Play multiple techniques per turn to build Gokudo\u2019s combo counter, then detonate it.',
    plays:['Shadow Slash is free \u2014 it doesn\u2019t end your attack, so chain it before other techniques.','Build the combo counter with Nin-Ninja dual techniques.','Combo Cannon / Chain Strike scale with your stacked combo count.'],
    win:'Set up a big combo turn, then unload everything for a single overwhelming burst.'},
  throne:{name:'Iron Throne',color:'#30b050',tier:'Advanced',
    plan:'Solo fortress. One massive bot (Robo Emperor) with 60 HP and an always-on Last Stand.',
    plays:['Your single bot is your whole army \u2014 protect its HP and manage Charge carefully.','Cable Network and equipment keep it dominant.','Last Stand is always active (solo deck) \u2014 you\u2019re strongest when it matters.'],
    win:'Outvalue them with one unkillable juggernaut; end with Imperial Barrage.'},
  forge:{name:'Forge Barons',color:'#e0a020',tier:'Beginner',
    plan:'Equipment engine. Bolt gear onto Grand Beetle to build an unstoppable juggernaut.',
    plays:['Stack equipment on Grand Beetle \u2014 it gains +1 ATK per piece attached.','Neutranurse heals; Blackram sacrifices gear for burst.','Overforge doubles your built-up attacker for a finishing blow.'],
    win:'Assemble the juggernaut, then Overforge for the kill. Simple and powerful.'},
  cross:{name:'Cross Messiah',color:'#d8dde8',tier:'Intermediate',
    plan:'Charge mastery. Hoard Charge with the Zero Medal, scale every attack off it, then unleash Cross Burst.',
    plays:['Bank Charge \u2014 Full Charge and Overcharge ramp you fast; attacks deal +1 per 2 Charge held.','Seagaru\u2019s ranged attacks can snipe protected back-row support bots.','At max Charge you IGNITE: attacks gain +4 and Cross Burst hits for 3\u00d7 your Charge.'],
    win:'Reach max Charge, then fire Cross Burst for a massive single-target nuke (15+ damage).'},
  blacktide:{name:'Black Tide',color:'#d4a020',tier:'Intermediate',
    plan:"Pirate coin economy. Earn Doubloons whenever your bots attack, then choose between steady spending for tempo or banking toward a huge finish.",
    plays:["Piraskull's Captain's Cut doubles your coin income on every attack \u2014 keep him active early.",'Pirastar can spend 3 Doubloons before attacking for +5 damage \u2014 a burst option once you have a cushion.',"TentaClam's Hoarder's Eye pays out at end of turn for every other living crewmate, so protecting your team compounds your income.",'Powder Keg spends up to 5 coins to hit ALL enemies at once \u2014 a board-wide answer when you\u2019re flush.'],
    win:'Bank toward Win Medals \u2014 spend every Doubloon you\u2019ve earned for 4 + 2 damage per coin to one enemy, often a one-shot finisher.'},
  senbei:{name:'Senbei',color:'#c83232',tier:'Expert',
    plan:'Stance-control finisher. Hold the three Stances to bank Resonance every turn, reach Zanshin Threshold, then end the game with one inevitable three-target cut.',
    plays:['Kensho is the Reader \u2014 a non-combatant (ATK 3, never attacks). Keep him alive: he holds your Stances free and anchors Zanshin.','Activate Bound, Exposed, and Execution Stances and HOLD them \u2014 each active Stance banks +1 Resonance per turn.','Fire Zanshin at 3+ Resonance with all four alive: it reads three Verdicts onto the enemy. With all Stances up you assign them freely.','The Interval: for one turn every enemy reaction backfires \u2014 attacking, defending, or healing each makes the matching blade hit harder.','Protect your bots through the Interval with Remaining Guard \u2014 if a blade dies before the Cut, its Verdict vanishes.'],
    win:'The Cut falls: Gobanko Binds, Samurai Exposes, Shinsaber Executes \u2014 all at once. If all three Verdicts land on one survivor, it becomes True Zanshin: an instant KO.'}
};

function openDeckGuide(dk){
  // If no deck chosen yet, show the picker
  if(!dk){
    const order=['blaze','titan','royal','shadow','throne','forge','cross','blacktide','senbei'];
    let html='<div style="text-align:left"><div style="font-size:11px;color:var(--text2);text-align:center;margin-bottom:10px">Tap a deck for its strategy guide.</div>';
    order.forEach(k=>{
      const g=DECK_GUIDES[k]; if(!g)return;
      html+='<button onclick="openDeckGuide(\''+k+'\')" style="display:flex;width:100%;align-items:center;gap:8px;padding:9px 10px;margin-bottom:5px;border-radius:9px;border:1px solid var(--border2);background:rgba(255,255,255,.03);cursor:pointer;text-align:left">'+
        '<span style="width:9px;height:9px;border-radius:50%;background:'+g.color+';flex-shrink:0"></span>'+
        '<span style="flex:1;color:'+g.color+';font-weight:700;font-size:13px">'+g.name+'</span>'+
        '<span style="font-size:9px;color:var(--text3)">'+g.tier+'</span>'+
      '</button>';
    });
    html+='</div>';
    openM('\ud83d\udcda Deck Guide', html, [{l:'Close',cls:'mb ok',cb:()=>closeM()}]);
    return;
  }
  const g=DECK_GUIDES[dk];
  if(!g){ openDeckGuide(); return; }
  let html='<div style="text-align:left">';
  html+='<div style="font-family:Orbitron,monospace;font-weight:800;color:'+g.color+';font-size:16px">'+g.name+'</div>';
  html+='<div style="font-size:9px;color:var(--text3);margin-bottom:8px;letter-spacing:.5px">'+g.tier.toUpperCase()+' DECK</div>';
  // Gameplan
  html+='<div style="background:rgba(255,255,255,.04);border-radius:8px;padding:9px;margin-bottom:7px;border-left:3px solid '+g.color+'">';
  html+='<div style="font-size:9px;color:'+g.color+';font-weight:700;margin-bottom:3px">GAMEPLAN</div>';
  html+='<div style="font-size:11px;color:var(--text);line-height:1.45">'+g.plan+'</div></div>';
  // Key plays
  html+='<div style="background:rgba(255,255,255,.04);border-radius:8px;padding:9px;margin-bottom:7px;border-left:3px solid '+g.color+'">';
  html+='<div style="font-size:9px;color:'+g.color+';font-weight:700;margin-bottom:4px">KEY PLAYS</div>';
  g.plays.forEach(p=>{ html+='<div style="font-size:11px;color:var(--text);line-height:1.4;margin-bottom:4px;padding-left:10px;position:relative"><span style="position:absolute;left:0;color:'+g.color+'">\u2022</span>'+p+'</div>'; });
  html+='</div>';
  // Win condition
  html+='<div style="background:rgba(255,255,255,.04);border-radius:8px;padding:9px;border-left:3px solid '+g.color+'">';
  html+='<div style="font-size:9px;color:'+g.color+';font-weight:700;margin-bottom:3px">HOW YOU WIN</div>';
  html+='<div style="font-size:11px;color:var(--text);line-height:1.45">'+g.win+'</div></div>';
  html+='</div>';
  openM('\ud83d\udcda '+g.name, html, [{l:'\u2039 All Decks',cls:'mb',cb:()=>openDeckGuide()},{l:'Close',cls:'mb ok',cb:()=>closeM()}]);
}

// Show the Medafighter's ability when tapped in the title deck preview.
function showMfInfo(dk){
  const D=(typeof DECKS==='object')?DECKS[dk]:null;
  if(!D){ return; }
  const mf=(typeof MFR==='object')?MFR[D.mf]:null;
  if(!mf){ return; }
  const art=(typeof renderMFArt==='function')?renderMFArt(D.mf,72,72):'';
  let html='<div style="text-align:center">';
  html+='<div style="width:72px;height:72px;margin:0 auto 8px;border-radius:12px;overflow:hidden;border:1px solid var(--border2)">'+art+'</div>';
  html+='<div style="font-family:Orbitron,monospace;font-weight:800;color:var(--gold);font-size:15px;margin-bottom:2px">'+mf.name+'</div>';
  html+='<div style="font-size:9px;color:var(--text3);margin-bottom:8px;letter-spacing:.5px">MEDAFIGHTER</div>';
  html+='<div style="background:rgba(240,176,48,.1);border-radius:8px;padding:10px;border-left:3px solid var(--gold);text-align:left">';
  html+='<div style="font-size:9px;color:var(--gold);font-weight:700;margin-bottom:3px">PASSIVE ABILITY</div>';
  html+='<div style="font-size:12px;color:var(--text);line-height:1.5">'+(mf.pass||'No special ability.')+'</div></div>';
  html+='</div>';
  openM('Medafighter', html, [{l:'Close',cls:'mb ok',cb:()=>{ closeM(); }}]);
}

// Close the title-screen deck preview panel entirely (and deselect the deck card).
function closeDeckPreview(){
  const panel=document.getElementById('deck-preview');
  if(panel){ panel.style.display='none'; panel.innerHTML=''; }
  const gatePanel=document.getElementById('dg-deck-preview');
  if(gatePanel){ gatePanel.style.display='none'; gatePanel.innerHTML=''; }
  const box=document.getElementById('decklist-box');
  if(box){ box.style.display='none'; }
  const btn=document.getElementById('decklist-btn');
  if(btn){ btn.textContent='\u25bc VIEW DECKLIST'; }
  try{ document.querySelectorAll('.dpk').forEach(d=>d.classList.remove('sel')); }catch(e){}
}
function renderDeckPreview(dk){
  const panel=document.getElementById('deck-preview');
  const gatePanel=document.getElementById('dg-deck-preview');
  if(!panel)return;
  const D=DECKS[dk];
  if(!D){panel.style.display='none';return;}
  const botArt=(D.bots||[]).map(bk=>{
    const b=BOTS[bk];
    const art=(typeof renderBotArt==='function'&&b)?renderBotArt({key:bk,changed:false},44,44):'';
    return '<div style="display:flex;flex-direction:column;align-items:center;gap:3px">'+
      '<div style="width:44px;height:44px;border-radius:8px;overflow:hidden;border:1px solid var(--border2);background:#0a0608">'+art+'</div>'+
      '<div style="font-size:8px;color:var(--text2);max-width:54px;text-align:center;line-height:1.1">'+(b?b.name:bk)+'</div></div>';
  }).join('');
  const mf=MFR[D.mf];
  const mfArt=(typeof renderMFArt==='function')?renderMFArt(D.mf,32,32):'';
  let diffHtml='';
  {
    const df=(typeof DECK_DIFFICULTY!=='undefined')?DECK_DIFFICULTY[dk]:null;
    if(df){
      const colors={1:'#40d088',2:'#f0c040',3:'#f0883c',4:'#ff5050'};
      const col=colors[df.stars]||'#aaa';
      const filled='\u2605'.repeat(df.stars), empty='\u2606'.repeat(4-df.stars);
      diffHtml='<div style="display:flex;flex-direction:column;align-items:center;gap:2px;margin-bottom:6px">'+
        '<div style="font-size:11px;letter-spacing:1px"><span style="color:'+col+'">'+filled+'</span><span style="color:#444">'+empty+'</span></div>'+
        '<div style="font-size:9px;font-weight:700;color:'+col+';letter-spacing:.5px">'+df.tier.toUpperCase()+'</div>'+
        '<div style="font-size:8px;color:var(--text3);max-width:300px;text-align:center;line-height:1.3">'+df.note+'</div>'+
      '</div>';
    }
  }
  panel.innerHTML=
    '<div style="display:flex;justify-content:flex-end;margin-bottom:2px"><button onclick="closeDeckPreview()" style="width:26px;height:26px;border-radius:50%;border:1px solid var(--border2);background:rgba(255,80,80,.12);color:#ff8080;font-size:15px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center" title="Close">\u00d7</button></div>'+
    diffHtml+
    '<div style="display:flex;gap:10px;justify-content:center;align-items:flex-start;margin-bottom:6px">'+botArt+'</div>'+
    '<div onclick="showMfInfo(\''+dk+'\')" style="display:flex;gap:6px;justify-content:center;align-items:center;margin-bottom:6px;cursor:pointer;padding:4px 8px;border-radius:8px;background:rgba(240,176,48,.08);border:1px solid rgba(240,176,48,.25)" title="Tap to see Medafighter ability">'+
      '<div style="width:32px;height:32px;border-radius:6px;overflow:hidden;border:1px solid var(--border2)">'+mfArt+'</div>'+
      '<span style="font-size:9px;color:var(--gold);font-family:\'Orbitron\',monospace">'+(mf?mf.name:'')+'</span>'+
      '<span style="font-size:11px;color:var(--gold);margin-left:2px">\u24d8</span>'+
    '</div>'+
    '<div style="font-size:9px;color:var(--text2);text-align:center;line-height:1.4;padding:0 8px">'+(DECK_IDENTITY[dk]||'')+'</div>'+
    '<button id="decklist-btn" onclick="toggleDeckList(\''+dk+'\')" style="display:block;margin:8px auto 0;font-family:Orbitron,monospace;font-size:9px;font-weight:700;padding:6px 14px;border-radius:6px;border:1px solid rgba(240,176,48,.4);background:rgba(240,176,48,.08);color:var(--gold);cursor:pointer">\u25bc VIEW DECKLIST</button>'+
    '<div id="decklist-box" style="display:none;text-align:left;margin-top:4px;max-height:280px;overflow-y:auto;padding:0 4px"></div>';
  panel.style.display='block';
  if(gatePanel){ gatePanel.innerHTML=panel.innerHTML; gatePanel.style.display='block'; }
}
function showRules(){
  openM('⚡ Quick Rules',[
    '<b style="color:var(--gold)">TURN:</b> Charge → Draw 2 → 1 Action → CPU',
    '<b style="color:var(--gold)">ACTION:</b> Attack with active bot, play a card, or switch bots',
    '<b style="color:var(--gold)">CHARGE:</b> Reach 5 to fire MEDAFORCE from hand',
    '<b style="color:var(--gold)">MEDACHANGE:</b> Once per game — massive power boost',
    '<b style="color:var(--gold)">MEDAL FUSION:</b> Defeated bot medal fuses to an ally (+4HP +1Chg)',
    '<b style="color:var(--gold)">LAST STAND:</b> Sole survivor + 1 fused medal = activated',
    '<b style="color:var(--gold)">TRAPS:</b> Set face-down free anytime, fire automatically',
    '<b style="color:var(--gold)">WIN:</b> KO all 3 enemy bots, or most HP at turn 12',
    '<b style="color:var(--green)">BLAZE:</b> Stack burn → cash in with Scorch &amp; Inferno Surge',
    '<b style="color:var(--titan2)">TITAN:</b> Drain charge → survive → Last Stand close',
    '<b style="color:var(--gold)">ROYAL:</b> Vanguard protect → DigiStrike finish',
    '<b style="color:#e060f0">SHADOW:</b> Dual techniques → combo cannon → chain strike',
  ].join('<br><br>'),
  [{l:'Got it',cls:'mb ok',cb:()=>closeM()}]);
}


// ── Change deck before rematch ──
function openDeckSwap(){
  const order=['blaze','titan','royal','shadow','throne','forge','cross','blacktide','senbei'];
  const names={blaze:'Blaze Chain',titan:'Titan Guard',royal:'Royal Court',shadow:'Shadow Blade',throne:'Iron Throne',forge:'Forge Barons',cross:'Cross Messiah',blacktide:'Black Tide',senbei:'Senbei'};
  const cols={blaze:'#f06424',titan:'#8090a0',royal:'#f0b020',shadow:'#9050d0',throne:'#30b050',forge:'#e0a020',cross:'#d8dde8',blacktide:'#d4a020',senbei:'#c83232'};
  const btns=order.map(k=>({l:(deck===k?'\u2713 ':'')+names[k], cls:'mb', style:'color:'+cols[k]+';border-color:'+cols[k]+'55', cb:()=>{
    deck=k; closeM();
    if(G_online){
      // tell opponent my new deck, then rematch
      try{ MWNet.rematch(deck, (DECKS[deck]&&DECKS[deck].mf)||'ikki'); }catch(e){}
    }
    doRematch();
  }}));
  btns.push({l:'Cancel', cls:'mb ok', cb:()=>closeM()});
  openM('Choose Your Deck','<div style="font-size:11px;color:var(--text2);text-align:center;padding:4px 0">Pick a deck for the next match</div>', btns);
}

// Unified rematch entry that both online + offline use
function doRematch(){
  if(G_online){
    G_myTurn=(G_mySeat===0);
    document.getElementById('end').classList.remove('open');
    G={}; logs=[]; turn=1; atked=false; actionsLeft=1;
    const _opp=(MWNet.oppDeck&&MWNet.oppDeck()&&DECKS[MWNet.oppDeck()])?MWNet.oppDeck():null;
    if(_opp){ G._forcedCpuDeck=_opp; }
    init();
    G.c.bots.forEach(b=>{b._opp=true;});
    setTimeout(initTooltipDelegation,100); setTimeout(updateArenaColor,200);
    offerMulligan();
    try{ loadDefaultArt(); }catch(e){}
    if(!G_myTurn) lockForOpponentTurn();
  } else {
    rematch();
  }
}

function rematch(){
  // Close end screen
  document.getElementById('end').classList.remove('open');
  try{ pickRotatingBg(); applyBattlefieldArt(); }catch(e){}  // choose battlefield FIRST so music can match it
  try{ startBattleMusic(); }catch(e){}
  // Reset all game state but keep win/loss counters and deck choice
  G = {};
  logs = [];
  turn = 1;
  atked = false;
  actionsLeft = 1;
  // Re-init with same deck
  init();
  log('Rematch! CPU: ' + cpuDiff.toUpperCase() + '. Good luck.', 'info');
  setTimeout(initTooltipDelegation, 100);
  setTimeout(updateArenaColor, 200);
  offerMulligan();
}

// Return cleanly to the title screen from anywhere (mid-match, end screen, or a modal),
// without the heavy-handed full page reload location.reload() used to require.
function goToMainMenu(){
  try{ closeM(); }catch(e){}
  try{ if(_musicEl){ fadeAudio(_musicEl, _musicEl.volume||0.18, 0, 350, ()=>{ try{ stopBattleMusic(); }catch(e){} }); } else { stopBattleMusic(); } }catch(e){}
  try{ if(G_online){ MWNet.leave(); G_online=false; } }catch(e){}
  try{ document.getElementById('end').classList.remove('open'); }catch(e){}
  try{ document.getElementById('arena').innerHTML=''; }catch(e){}
  try{ _rotatingBgSlot=0; _rotatingBgUrl=''; }catch(e){}
  G = {};
  logs = [];
  turn = 1;
  atked = false;
  G_myTurn = true;
  _practiceMode = false;
  document.getElementById('title').classList.remove('gone');
  try{ renderDeckPreview(deck); }catch(e){}
}

function startLastStandTest(){
  deck='blaze';
  document.getElementById('title').classList.add('gone');
  init();
  const arc=G.p.bots.find(b=>b.key==='arcbeetle');
  const others=G.p.bots.filter(b=>b.key!=='arcbeetle');
  G.p.activeBot=G.p.bots.indexOf(arc);
  arc.fusedMedal=others[0].medal;
  arc.fusedMedal2=others[1].medal;
  arc.hp=arc.maxHp;
  others.forEach(b=>{b.def=true;b.hp=0;});
  log('TEST MODE: Arcbeetle Last Stand with 2 medals','chg');
  runPhase();
  setTimeout(initTooltipDelegation,100);
  setTimeout(updateArenaColor,200);
}


// ── PRE-MATCH ART GALLERY ───────────────────────────────────
let _pmTab = 'stages';


// ═══ BULK ART UPLOAD ═══
// Pick many images at once; each file is matched to a card/bot by its FILENAME.
// Name files after the slot key, e.g. bot_metabee.png, mc_grand_beetle.jpg, fb_autoloader.png
function openBulkArtUpload(){
  openM('Bulk Art Upload',
    '<div style="font-size:12px;line-height:1.55;color:var(--text2)">'+
    'Upload many images at once. Each file is matched to a card or bot <b>by its filename</b>.<br><br>'+
    '<b style="color:var(--gold)">Name your files like:</b><br>'+
    '<span style="font-family:monospace;font-size:11px;color:var(--text3)">bot_metabee.png<br>mc_grand_beetle.png<br>bot_masterbeetle.png<br>bgm_arena_1.mp3 (battlefield music)</span><br><br>'+
    'Tap below and select all your renamed images. Anything that doesn\'t match a known slot is skipped.'+
    '</div>',
    [{l:'\ud83d\udcc1 Choose Images',cls:'mb ok',cb:()=>{ const fi=document.getElementById('bulk-art-input'); if(fi){ fi.value=''; fi.click(); } }},
     {l:'Cancel',cls:'mb',cb:()=>closeM()}]);
}

function _knownArtKeys(){
  // Build the set of valid slot keys: bots, medachange forms, medafighters, and all cards.
  const keys=new Set();
  try{
    const botKeys=[...new Set(Object.values(DECKS).flatMap(d=>d.bots))];
    botKeys.forEach(k=>{ keys.add('bot_'+k); keys.add('bot_'+k+'_mc'); });
    if(typeof MFR==='object') Object.keys(MFR).forEach(k=>keys.add('mf_'+k));
    if(typeof CDEFS==='object') Object.keys(CDEFS).forEach(k=>keys.add(k));
    // Rotating battlefield background slots
    keys.add('bg_arena'); keys.add('bg_arena_1'); keys.add('bg_arena_2'); keys.add('bg_arena_3'); keys.add('bg_arena_4'); keys.add('bg_arena_5');
    // Masterbeetle fusion forms (Titan combining archetype)
    keys.add('bot_masterbeetle'); keys.add('bot_masterbeetle_master');
    // Per-battlefield soundtrack slots (optional uploaded music per arena bg)
    keys.add('bgm_arena_1'); keys.add('bgm_arena_2'); keys.add('bgm_arena_3'); keys.add('bgm_arena_4'); keys.add('bgm_arena_5');
  }catch(e){}
  return keys;
}

function _handleBulkArt(files){
  const known=_knownArtKeys();
  const list=Array.from(files||[]);
  if(!list.length){ return; }
  let done=0, matched=0, skipped=[];
  const total=list.length;
  function finish(){
    if(document.getElementById('prematch-art') && document.getElementById('prematch-art').style.display!=='none'){ renderPmGrid(_pmTab); updatePmStorageInfo(); }
    else { if(typeof renderArtPanel==='function')renderArtPanel(); if(typeof updateStorageInfo==='function')updateStorageInfo(); }
    if(typeof renderAll==='function' && typeof G!=='undefined' && G.p)renderAll();
    openM('Bulk Upload Complete',
      '<div style="text-align:center"><div style="font-size:22px;color:var(--gold);font-family:Orbitron,monospace;font-weight:800">'+matched+' / '+total+'</div>'+
      '<div style="font-size:11px;color:var(--text2);margin-top:4px">images matched and saved</div>'+
      (skipped.length?'<div style="font-size:10px;color:var(--text3);margin-top:8px">Skipped (no matching slot): '+skipped.slice(0,8).join(', ')+(skipped.length>8?'\u2026':'')+'</div>':'')+
      '</div>',
      [{l:'Done',cls:'mb ok',cb:()=>closeM()}]);
  }
  list.forEach(file=>{
    // Derive key from filename (strip path + extension, lowercase)
    let base=(file.name||'').replace(/\.[^.]+$/,'').trim();
    const reader=new FileReader();
    reader.onload=ev=>{
      const dataUrl=ev.target.result;
      const isAudioSlot=/^bgm_arena_[1-4]$/.test(base);
      if(isAudioSlot && known.has(base)){
        // Battlefield soundtrack: store the audio data URL directly (no image compression)
        const audioOk=dataUrl && (dataUrl.startsWith('data:audio')||dataUrl.startsWith('data:application')||dataUrl.startsWith('data:'));
        if(audioOk){
          const safeUrl=dataUrl.startsWith('data:audio')?dataUrl:dataUrl.replace(/^data:[^;]*/,'data:audio/mpeg');
          try{ artOverrides[base]=safeUrl; saveArtToStorage(base, safeUrl); matched++; }catch(e){ skipped.push(base); }
        } else { skipped.push(base); }
      } else {
        const ok=dataUrl && (dataUrl.startsWith('data:image')||dataUrl.startsWith('data:application'));
        if(ok && known.has(base)){
          const safeUrl=dataUrl.startsWith('data:image')?dataUrl:dataUrl.replace(/^data:[^;]+/,'data:image/jpeg');
          try{ compressAndSave(base, safeUrl); matched++; }catch(e){ skipped.push(base); }
        } else {
          skipped.push(base||'(unnamed)');
        }
      }
      done++;
      if(done>=total) finish();
    };
    reader.onerror=()=>{ skipped.push(base||'(unreadable)'); done++; if(done>=total) finish(); };
    reader.readAsDataURL(file);
  });
}

function openPreMatchArt(){
  if(typeof promptArtAccess==='function' && !artUnlocked()){
    promptArtAccess(()=>openPreMatchArt());
    return;
  }
  const panel = document.getElementById('prematch-art');
  if(!panel) return;
  panel.style.display = 'flex';
  renderPmGrid(_pmTab);
  updatePmStorageInfo();
}

function closePreMatchArt(){
  const panel = document.getElementById('prematch-art');
  if(panel) panel.style.display = 'none';
}

function switchPmTab(tab){
  _pmTab = tab;
  document.querySelectorAll('.pm-tab').forEach(btn=>{
    const isActive = btn.dataset.tab === tab;
    // For mobile tabs (no background, uses border-bottom)
    if(btn.style.border !== undefined && !btn.style.background.includes('rgba(240,184')){
      btn.style.borderBottom = isActive ? '2px solid var(--gold)' : '2px solid transparent';
      btn.style.color = isActive ? 'var(--gold)' : 'var(--text2)';
    } else {
      btn.style.background = isActive ? 'rgba(240,184,32,.12)' : 'rgba(255,255,255,.04)';
      btn.style.borderColor = isActive ? 'rgba(240,184,32,.35)' : 'var(--border)';
      btn.style.color = isActive ? 'var(--gold)' : 'var(--text2)';
    }
  });
  renderPmGrid(tab);
}

function renderPmGrid(tab){
  const grid = document.getElementById('pm-grid');
  if(!grid) return;
  grid.innerHTML = '';
  if(tab === 'stages'){
    // ── STAGE BACKGROUNDS ──
    const lblBG = document.createElement('div');
    lblBG.style.cssText = 'grid-column:1/-1;font-family:"Orbitron",monospace;font-size:8px;font-weight:700;color:#f0c040;letter-spacing:.8px;padding:4px 0 2px;border-bottom:1px solid var(--border)';
    lblBG.textContent = '\ud83c\udfdf\ufe0f STAGE BACKGROUNDS'; grid.appendChild(lblBG);
    const noteBG = document.createElement('div');
    noteBG.style.cssText = 'grid-column:1/-1;font-size:9px;color:var(--text3);padding:2px 0 6px;line-height:1.4';
    noteBG.textContent = 'Upload an image per stage (bg_arena_1\u20134). Each becomes a selectable battlefield before a match.';
    grid.appendChild(noteBG);
    const songNames={1:(typeof STAGE_SONGS==='object'&&STAGE_SONGS[1])||'Arena 1',2:(typeof STAGE_SONGS==='object'&&STAGE_SONGS[2])||'Arena 2',3:(typeof STAGE_SONGS==='object'&&STAGE_SONGS[3])||'Arena 3',4:(typeof STAGE_SONGS==='object'&&STAGE_SONGS[4])||'Arena 4',5:(typeof STAGE_SONGS==='object'&&STAGE_SONGS[5])||'Arena 5'};
    for(let i=1;i<=5;i++){
      const has=!!artOverrides['bg_arena_'+i];
      grid.appendChild(makePmSlot('bg_arena_'+i, songNames[i]+(has?' \u2713':''), '#f0c040', ''));
    }
    // ── BATTLEFIELD MUSIC ──
    const lblBM = document.createElement('div');
    lblBM.style.cssText = 'grid-column:1/-1;font-family:"Orbitron",monospace;font-size:8px;font-weight:700;color:#5ad0e0;letter-spacing:.8px;padding:4px 0 2px;border-bottom:1px solid var(--border);margin-top:10px';
    lblBM.textContent = '\ud83c\udfb5 BATTLEFIELD MUSIC'; grid.appendChild(lblBM);
    const noteBM = document.createElement('div');
    noteBM.style.cssText = 'grid-column:1/-1;font-size:9px;color:var(--text3);padding:2px 0 6px;line-height:1.4';
    noteBM.textContent = 'Stages 1, 3 & 4 ship with built-in music. Upload bgm_arena_1\u20134.mp3 to override a track.';
    grid.appendChild(noteBM);
    for(let i=1;i<=5;i++){
      const up=!!artOverrides['bgm_arena_'+i];
      const embedded=(typeof _embeddedBgm==='object'&&!!_embeddedBgm['bgm_arena_'+i]);
      const status=up?' \u2713':(embedded?' \u266a':'');
      grid.appendChild(makePmSlot('bgm_arena_'+i, (songNames[i]||('Arena '+i))+status, '#5ad0e0', ''));
    }
    return;
  }
  if(tab === 'bots'){
    // All unique bots from ALL decks
    const botKeys = [...new Set(Object.values(DECKS).flatMap(d=>d.bots))];
    // Normal bots section
    const lbl1 = document.createElement('div');
    lbl1.style.cssText = 'grid-column:1/-1;font-family:"Orbitron",monospace;font-size:8px;font-weight:700;color:var(--text3);letter-spacing:.8px;padding:4px 0 2px;border-bottom:1px solid var(--border)';
    lbl1.textContent = 'BOTS'; grid.appendChild(lbl1);
    botKeys.forEach(key=>{
      const bot = BOTS[key];
      if(!bot) return;
      grid.appendChild(makePmSlot('bot_'+key, bot.name, bot.color, gA(bot.art,80,80)));
    });
    // Medachange forms section
    const lbl2 = document.createElement('div');
    lbl2.style.cssText = 'grid-column:1/-1;font-family:"Orbitron",monospace;font-size:8px;font-weight:700;color:var(--text3);letter-spacing:.8px;padding:4px 0 2px;border-bottom:1px solid var(--border);margin-top:8px';
    lbl2.textContent = 'MEDACHANGE FORMS'; grid.appendChild(lbl2);
    botKeys.forEach(key=>{
      const bot = BOTS[key];
      if(!bot) return;
      grid.appendChild(makePmSlot('bot_'+key+'_mc', bot.name+' (Changed)', '#f04880', gA(bot.mcart||bot.art,80,80)));
    });
    // Fusion forms section (Masterbeetle combining archetype)
    const lblF = document.createElement('div');
    lblF.style.cssText = 'grid-column:1/-1;font-family:"Orbitron",monospace;font-size:8px;font-weight:700;color:#f0c040;letter-spacing:.8px;padding:4px 0 2px;border-bottom:1px solid var(--border);margin-top:8px';
    lblF.textContent = 'FUSION FORMS'; grid.appendChild(lblF);
    grid.appendChild(makePmSlot('bot_masterbeetle', 'Masterbeetle', '#f0c040', gA('machairodus',80,80)));
    grid.appendChild(makePmSlot('bot_masterbeetle_master', 'Masterbeetle \u039e (Master)', '#ffd040', gA('machairodus',80,80)));
    // Medafighters section
    const lbl3 = document.createElement('div');
    lbl3.style.cssText = 'grid-column:1/-1;font-family:"Orbitron",monospace;font-size:8px;font-weight:700;color:var(--text3);letter-spacing:.8px;padding:4px 0 2px;border-bottom:1px solid var(--border);margin-top:8px';
    lbl3.textContent = 'MEDAFIGHTERS'; grid.appendChild(lbl3);
    Object.entries(MFR).forEach(([key,mf])=>{
      grid.appendChild(makePmSlot('mf_'+key, mf.name, '#f0b820', renderMFArt(key,80,80)));
    });
  } else if(tab === 'medals') {
    // All medals
    const lbl = document.createElement('div');
    lbl.style.cssText = 'grid-column:1/-1;font-family:"Orbitron",monospace;font-size:8px;font-weight:700;color:var(--text3);letter-spacing:.8px;padding:4px 0 2px;border-bottom:1px solid var(--border)';
    lbl.textContent = 'MEDALS'; grid.appendChild(lbl);
    Object.entries(MEDAL).forEach(([key,m])=>{
      const svgEl = document.createElement('div');
      svgEl.style.cssText = 'width:80px;height:80px;display:flex;align-items:center;justify-content:center;background:'+m.color+'22;border-radius:50%;font-size:32px;border:2px solid '+m.color+'44';
      svgEl.textContent = '🏅';
      grid.appendChild(makePmSlot('medal_'+key, m.name+' Medal', m.color, svgEl.outerHTML));
    });
  } else {
    // ALL cards from CDEFS — group by type for clarity
    const typeOrder = ['medaforce','medachange','technique','action','equipment','trap'];
    const grouped = {};
    typeOrder.forEach(t => grouped[t] = []);
    Object.entries(CDEFS).forEach(([id,c]) => {
      if(grouped[c.type]) grouped[c.type].push([id,c]);
      else grouped[c.type] = [[id,c]];
    });
    typeOrder.forEach(type => {
      const cards = grouped[type];
      if(!cards || !cards.length) return;
      // Section label
      const lbl = document.createElement('div');
      lbl.style.cssText = 'grid-column:1/-1;font-family:"Orbitron",monospace;font-size:8px;font-weight:700;color:var(--text3);letter-spacing:.8px;text-transform:uppercase;padding:4px 0 2px;border-bottom:1px solid var(--border);margin-top:4px';
      lbl.textContent = type;
      grid.appendChild(lbl);
      cards.forEach(([id,c]) => {
        grid.appendChild(makePmSlot('card_'+id, c.name, c.color, gA(c.art||'act_art',80,54)));
      });
    });
  }
}

function makePmSlot(key, name, color, svgHtml){
  const div = document.createElement('div');
  const hasArt = !!artOverrides[key];
  div.style.cssText = 'background:rgba(255,255,255,.03);border:1.5px solid '+(hasArt?color+'66':'var(--border)')+';border-radius:10px;overflow:hidden;cursor:pointer;transition:border-color .2s';
  div.onclick = ()=>{ _pendingArtKey = key; var _fi=document.getElementById('file-input');if(_fi)_fi.click(); };
  div.onmouseenter = ()=>{ div.style.borderColor = color+'aa'; };
  div.onmouseleave = ()=>{ div.style.borderColor = hasArt ? color+'66' : 'var(--border)'; };

  // Art preview
  const artWrap = document.createElement('div');
  artWrap.style.cssText = 'width:100%;height:100px;overflow:hidden;position:relative;background:var(--panel)';
  if(hasArt){
    artWrap.innerHTML = '<img src="'+artOverrides[key]+'" style="width:100%;height:100%;object-fit:cover;object-position:center top;display:block">';
  } else {
    artWrap.innerHTML = '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center">'+svgHtml+'</div>';
  }

  // Upload overlay on art
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:absolute;inset:0;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .15s';
  overlay.innerHTML = '<span style="font-size:24px">📷</span>';
  artWrap.style.position = 'relative';
  artWrap.appendChild(overlay);
  artWrap.onmouseenter = ()=>{ overlay.style.opacity='1'; };
  artWrap.onmouseleave = ()=>{ overlay.style.opacity='0'; };
  div.appendChild(artWrap);

  // Label row
  const info = document.createElement('div');
  info.style.cssText = 'padding:6px 8px;display:flex;align-items:center;justify-content:space-between;gap:4px';
  const nm = document.createElement('div');
  nm.style.cssText = 'font-family:"Orbitron",monospace;font-size:8px;font-weight:700;color:'+color+';white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1';
  nm.textContent = name;
  info.appendChild(nm);

  if(hasArt){
    const clr = document.createElement('button');
    clr.textContent = '✕';
    clr.style.cssText = 'background:rgba(240,64,64,.12);border:1px solid rgba(240,64,64,.3);color:var(--red);width:20px;height:20px;border-radius:4px;font-size:9px;cursor:pointer;flex-shrink:0';
    clr.onclick = ev=>{ ev.stopPropagation(); clearArt(key); renderPmGrid(_pmTab); updatePmStorageInfo(); };
    info.appendChild(clr);
  } else {
    const hint = document.createElement('div');
    hint.style.cssText = 'font-size:8px;color:var(--text3)';
    hint.textContent = '+ Upload';
    info.appendChild(hint);
  }
  div.appendChild(info);
  return div;
}

function updatePmStorageInfo(){
  const el = document.getElementById('prematch-storage-info');
  if(!el) return;
  const count = Object.keys(artOverrides).length;
  let kb = 0;
  Object.values(artOverrides).forEach(v=>{ kb += v.length/1024; });
  const LIMIT_KB = 4800; // ~5MB iOS limit, leave buffer
  const pct = Math.min(100, Math.round(kb/LIMIT_KB*100));
  const barColor = pct > 85 ? '#f04040' : pct > 65 ? '#f0b820' : '#40d898';
  const remaining = Math.max(0, Math.round((LIMIT_KB-kb)/200)); // ~200KB per image after compression
  if(count > 0){
    el.innerHTML = count+' image'+(count>1?'s':'')+' · ~'+Math.round(kb)+'KB used · '
      +'<span style="color:'+barColor+'">'+pct+'%</span>'
      +(pct<90?' · ~'+remaining+' more slots':' · <span style="color:#f04040">NEARLY FULL — clear some art</span>');
  } else {
    el.innerHTML = 'No custom art yet — tap any slot to upload.';
  }
}

// Hook the file-input change to refresh the pre-match grid too
const _origFileChange = null; // patched in DOMContentLoaded below


// ── MEDACHANGE ANIMATION ──────────────────────────────────
function triggerMCAnimation(bot, cb){
  SFX.medachange();
  // 1. Flash overlay
  const flash = document.getElementById('mc-flash');
  const burst = document.getElementById('mc-burst');
  if(!flash || !burst){ cb(); return; }

  // Set burst color to bot's color
  burst.style.setProperty('--mc-color', bot.color||'#f04880');

  // Trigger animations
  flash.classList.add('active');
  burst.classList.add('active');

  // Run the actual Medachange callback mid-flash (bot changes while screen is white)
  setTimeout(cb, 150);

  // Clean up after animation completes
  setTimeout(()=>{
    flash.classList.remove('active');
    burst.classList.remove('active');
    // Reset animation so it can fire again
    flash.style.animation='none';
    burst.style.animation='none';
    requestAnimationFrame(()=>{
      flash.style.animation='';
      burst.style.animation='';
    });
  }, 900);
}


// ── IMPACT ANIMATION SYSTEM ───────────────────────────────────
function showImpact(botEl, dmgAmt, isCrit){
  // Screen flash
  const fl=document.getElementById('impact-flash');
  if(fl){
    fl.style.background=isCrit?'rgba(255,100,0,.3)':'rgba(255,255,255,.25)';
    fl.style.animation='none';
    requestAnimationFrame(()=>{
      fl.style.animation='impact-flash-anim .25s ease-out forwards';
    });
  }
  // Shake the bot card
  if(botEl){
    botEl.classList.remove('hit');
    requestAnimationFrame(()=>botEl.classList.add('hit'));
    botEl.addEventListener('animationend',()=>botEl.classList.remove('hit'),{once:true});
  }
  // Damage number float
  if(dmgAmt>0&&botEl){
    const rect=botEl.getBoundingClientRect();
    const pop=document.createElement('div');
    pop.className='dmg-popup';
    pop.textContent=(isCrit?'💥':'')+'-'+dmgAmt;
    pop.style.cssText='left:'+(rect.left+rect.width/2-20)+'px;top:'+(rect.top+10)+'px;font-size:'+(dmgAmt>=8?'22px':dmgAmt>=5?'18px':'14px')+';color:'+(isCrit?'#ff6020':'#f04040');
    document.body.appendChild(pop);
    setTimeout(()=>pop.remove(),900);
  }
}

function showDeathBurst(botEl){
  SFX.botDefeated();
  if(!botEl)return;
  botEl.classList.add('dying');
  // Small screen flash tinted to bot color
  const fl=document.getElementById('impact-flash');
  if(fl){
    fl.style.background='rgba(240,72,128,.2)';
    fl.style.animation='none';
    requestAnimationFrame(()=>{fl.style.animation='impact-flash-anim .4s ease-out forwards';});
  }
}

// Find a bot's card DOM element — works on both desktop and mobile
function getBotEl(bot, sk){
  const teamEl=document.getElementById(sk==='p'?'plr-team':'cpu-team');
  if(!teamEl)return null;
  const cards=[...teamEl.querySelectorAll('.bc')];
  // Match by bot name in bname span
  return cards.find(c=>c.querySelector('.bname')&&c.querySelector('.bname').textContent.replace('⚡','').trim()===bot.name.trim())||null;
}


// ── MEDAFIGHTER PORTRAITS ─────────────────────────────────
// SVG placeholder portraits for each Medafighter
// Keys match MFR keys: ikki, henry, roks, tai
const MF_ART = {
  ikki:(w,h)=>`<svg width="${w}" height="${h}" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
    <rect width="80" height="80" fill="#0e1424" rx="8"/>
    <ellipse cx="40" cy="28" rx="16" ry="18" fill="#e8b888"/>
    <rect x="24" y="44" width="32" height="28" rx="6" fill="#2060c0"/>
    <!-- Hair spikes red/brown -->
    <path d="M28,18 Q24,4 22,0 Q28,8 30,16Z" fill="#c05020"/>
    <path d="M36,14 Q34,0 36,-2 Q40,8 40,12Z" fill="#d05828"/>
    <path d="M44,14 Q46,0 44,-2 Q40,8 40,12Z" fill="#c05020"/>
    <path d="M52,18 Q56,4 58,0 Q52,8 50,16Z" fill="#c05020"/>
    <!-- Goggles -->
    <ellipse cx="33" cy="26" rx="8" ry="6" fill="#101828"/>
    <ellipse cx="47" cy="26" rx="8" ry="6" fill="#101828"/>
    <rect x="39" y="24" width="2" height="4" fill="#101828"/>
    <ellipse cx="33" cy="26" rx="5" ry="4" fill="#f06424" opacity=".8"/>
    <ellipse cx="47" cy="26" rx="5" ry="4" fill="#f06424" opacity=".8"/>
    <ellipse cx="32" cy="25" rx="2" ry="2" fill="#ff9060"/>
    <ellipse cx="46" cy="25" rx="2" ry="2" fill="#ff9060"/>
    <!-- Smile -->
    <path d="M34,36 Q40,42 46,36" stroke="#c08060" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    <text x="40" y="74" font-family="Orbitron,monospace" font-size="7" fill="#f06424" text-anchor="middle" font-weight="700">IKKI</text>
  </svg>`,

  henry:(w,h)=>`<svg width="${w}" height="${h}" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
    <rect width="80" height="80" fill="#0e1424" rx="8"/>
    <ellipse cx="40" cy="28" rx="15" ry="18" fill="#d0a070"/>
    <rect x="25" y="44" width="30" height="28" rx="6" fill="#204080"/>
    <!-- Calm hair -->
    <rect x="25" y="12" width="30" height="14" rx="8" fill="#301808"/>
    <ellipse cx="40" cy="13" rx="16" ry="8" fill="#402010"/>
    <!-- Eyes - calm/cool -->
    <ellipse cx="33" cy="26" rx="5" ry="4" fill="#102030"/>
    <ellipse cx="47" cy="26" rx="5" ry="4" fill="#102030"/>
    <ellipse cx="33" cy="26" rx="3" ry="2.5" fill="#2a80f0"/>
    <ellipse cx="47" cy="26" rx="3" ry="2.5" fill="#2a80f0"/>
    <ellipse cx="32" cy="25" rx="1.5" ry="1.5" fill="#80c0ff"/>
    <ellipse cx="46" cy="25" rx="1.5" ry="1.5" fill="#80c0ff"/>
    <!-- Subtle smile -->
    <path d="M35,36 Q40,39 45,36" stroke="#b08060" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    <text x="40" y="74" font-family="Orbitron,monospace" font-size="6" fill="#8090a0" text-anchor="middle" font-weight="700">HENRY</text>
  </svg>`,

  roks:(w,h)=>`<svg width="${w}" height="${h}" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
    <rect width="80" height="80" fill="#0e1424" rx="8"/>
    <!-- Rokusho bot as medafighter partner -->
    <ellipse cx="40" cy="40" rx="28" ry="30" fill="#8090a0"/>
    <ellipse cx="40" cy="36" rx="22" ry="24" fill="#9aa0b0" opacity=".7"/>
    <!-- Head visor -->
    <rect x="24" y="28" width="32" height="12" rx="5" fill="#101828"/>
    <rect x="26" y="30" width="28" height="8" rx="4" fill="#2a80f0" opacity=".5"/>
    <!-- Eyes -->
    <ellipse cx="32" cy="34" rx="5" ry="3.5" fill="#2a80f0"/>
    <ellipse cx="48" cy="34" rx="5" ry="3.5" fill="#2a80f0"/>
    <ellipse cx="32" cy="34" rx="2.5" ry="2" fill="#80c0ff"/>
    <ellipse cx="48" cy="34" rx="2.5" ry="2" fill="#80c0ff"/>
    <!-- Chest emblem -->
    <ellipse cx="40" cy="52" rx="8" ry="6" fill="#f0c040" opacity=".7"/>
    <text x="40" y="74" font-family="Orbitron,monospace" font-size="7" fill="#f0c040" text-anchor="middle" font-weight="700">ROKS</text>
  </svg>`,

  karin:(w,h)=>`<svg width="${w}" height="${h}" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
    <rect width="80" height="80" fill="#0e1424" rx="8"/>
    <ellipse cx="40" cy="28" rx="15" ry="17" fill="#e8b088"/>
    <rect x="25" y="44" width="30" height="28" rx="6" fill="#9040c0"/>
    <!-- Long elegant hair -->
    <rect x="24" y="16" width="32" height="24" rx="12" fill="#201808"/>
    <path d="M24,24 Q18,40 22,56" stroke="#301808" stroke-width="8" fill="none" stroke-linecap="round"/>
    <path d="M56,24 Q62,40 58,56" stroke="#281008" stroke-width="8" fill="none" stroke-linecap="round"/>
    <ellipse cx="40" cy="16" rx="17" ry="9" fill="#301808"/>
    <!-- Eyes elegant -->
    <ellipse cx="32" cy="27" rx="5" ry="4" fill="#080c14"/>
    <ellipse cx="48" cy="27" rx="5" ry="4" fill="#080c14"/>
    <ellipse cx="32" cy="27" rx="3" ry="2.5" fill="#e060f0"/>
    <ellipse cx="48" cy="27" rx="3" ry="2.5" fill="#e060f0"/>
    <ellipse cx="31" cy="26" rx="1.5" ry="1.5" fill="#f0a0ff"/>
    <ellipse cx="47" cy="26" rx="1.5" ry="1.5" fill="#f0a0ff"/>
    <!-- Gentle smile -->
    <path d="M34,36 Q40,41 46,36" stroke="#c08060" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    <text x="40" y="74" font-family="Orbitron,monospace" font-size="7" fill="#e060f0" text-anchor="middle" font-weight="700">KARIN</text>
  </svg>`,

  tai:(w,h)=>`<svg width="${w}" height="${h}" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
    <rect width="80" height="80" fill="#0e1424" rx="8"/>
    <ellipse cx="40" cy="28" rx="16" ry="18" fill="#d0a070"/>
    <rect x="24" y="44" width="32" height="28" rx="6" fill="#60a030"/>
    <!-- Wild spiky hair with goggles on forehead -->
    <path d="M26,18 Q20,2 18,0 Q26,10 28,16Z" fill="#804020"/>
    <path d="M32,14 Q28,-2 30,-4 Q36,8 36,12Z" fill="#904828"/>
    <path d="M40,12 Q38,-4 40,-6 Q44,8 44,10Z" fill="#804020"/>
    <path d="M48,14 Q52,-2 50,-4 Q44,8 44,12Z" fill="#904828"/>
    <path d="M54,18 Q60,2 62,0 Q54,10 52,16Z" fill="#804020"/>
    <!-- Goggles on forehead (pushed up) -->
    <rect x="28" y="14" width="24" height="8" rx="4" fill="#e04020" opacity=".9"/>
    <ellipse cx="33" cy="18" rx="5" ry="3" fill="#ff8060" opacity=".7"/>
    <ellipse cx="47" cy="18" rx="5" ry="3" fill="#ff8060" opacity=".7"/>
    <!-- Eyes - determined -->
    <ellipse cx="33" cy="29" rx="5" ry="4" fill="#101010"/>
    <ellipse cx="47" cy="29" rx="5" ry="4" fill="#101010"/>
    <ellipse cx="33" cy="29" rx="3" ry="2.5" fill="#40a0d0"/>
    <ellipse cx="47" cy="29" rx="3" ry="2.5" fill="#40a0d0"/>
    <ellipse cx="32" cy="28" rx="1.5" ry="1.5" fill="#a0e0ff"/>
    <ellipse cx="46" cy="28" rx="1.5" ry="1.5" fill="#a0e0ff"/>
    <!-- Bold grin -->
    <path d="M33,37 Q40,44 47,37" stroke="#b08060" stroke-width="2" fill="none" stroke-linecap="round"/>
    <text x="40" y="74" font-family="Orbitron,monospace" font-size="8" fill="#60c030" text-anchor="middle" font-weight="700">TAI</text>
  </svg>`,
  redbeard:(w,h)=>`<svg width="${w}" height="${h}" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
    <rect width="80" height="80" fill="#1a1206" rx="8"/>
    <path d="M20 24 Q40 12 60 24 L56 30 Q40 22 24 30 Z" fill="#1a1206" stroke="#d4a020" stroke-width="2"/>
    <circle cx="40" cy="40" r="15" fill="#e8b888"/>
    <rect x="26" y="50" width="28" height="20" rx="5" fill="#a02020"/>
    <circle cx="34" cy="38" r="2" fill="#1a1206"/>
    <circle cx="46" cy="38" r="2" fill="#1a1206"/>
    <path d="M30 46 Q40 50 50 46" stroke="#1a1206" stroke-width="1.5" fill="none"/>
    <path d="M30 28 Q40 18 50 28 L50 22 Q40 14 30 22 Z" fill="#0a0a0a"/>
    <circle cx="40" cy="20" r="3" fill="#d4a020"/>
    <text x="40" y="74" font-family="Orbitron,monospace" font-size="8" fill="#d4a020" text-anchor="middle" font-weight="700">GENE</text>
  </svg>`,
};


// Show the player's Medafighter passive (tap the portrait).
function showMfPassive(){
  if(!G.p||!G.p.mf){ return; }
  const mf=G.p.mf, key=G.p.mfKey;
  const art=(typeof renderMFArt==='function')?renderMFArt(key,90,90):'';
  openM(mf.name,
    '<div style="text-align:center">'+
      '<div style="width:90px;height:90px;margin:0 auto 10px;border-radius:10px;overflow:hidden;border:1px solid rgba(240,184,32,.4)">'+art+'</div>'+
      '<div style="font-size:8px;font-weight:800;letter-spacing:1px;color:var(--gold);margin-bottom:4px">MEDAFIGHTER ABILITY</div>'+
      '<div style="font-size:13px;color:var(--text);line-height:1.5">'+mf.pass+'</div>'+
    '</div>',
    [{l:'Got it',cls:'mb ok',cb:()=>closeM()},
     {l:'\ud83c\udfa8 Customize Art',cls:'mb',cb:()=>{ closeM(); if(typeof openPreMatchArt==='function')openPreMatchArt(); }}]);
}

function renderMFArt(mfKey, w, h){
  const key = 'mf_' + mfKey;
  if(artOverrides[key]){
    return '<img src="'+artOverrides[key]+'" width="'+w+'" height="'+h+'" onerror="this.style.display=\'none\'" style="width:'+w+'px;height:'+h+'px;object-fit:cover;object-position:center top;border-radius:6px;display:block">';
  }
  const fn = MF_ART[mfKey];
  return fn ? fn(w,h) : '<svg width="'+w+'" height="'+h+'" xmlns="http://www.w3.org/2000/svg"><rect width="'+w+'" height="'+h+'" fill="#0e1424" rx="6"/><text x="'+(w/2)+'" y="'+(h/2+4)+'" text-anchor="middle" fill="#8090a0" font-size="9">MF</text></svg>';
}


// ═══════════════════════════════════════════════════════
// SFX — Web Audio synthesis. Zero external files.
// ═══════════════════════════════════════════════════════
const SFX = (function(){
  let _ctx = null;
  let _muted = false;

  function ctx(){
    if(!_ctx){
      try { _ctx = new (window.AudioContext||window.webkitAudioContext)(); }
      catch(e){ return null; }
    }
    if(_ctx.state === 'suspended') _ctx.resume();
    return _ctx;
  }

  function osc(freq, type, start, dur, gainPeak, c){
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, start);
    g.gain.setValueAtTime(0.001, start);
    g.gain.linearRampToValueAtTime(gainPeak, start + dur * 0.1);
    g.gain.exponentialRampToValueAtTime(0.001, start + dur);
    o.connect(g); g.connect(c.destination);
    o.start(start); o.stop(start + dur);
    return {o, g};
  }

  function noise(dur, gainPeak, filterFreq, c){
    const buf = c.createBuffer(1, c.sampleRate * dur, c.sampleRate);
    const data = buf.getChannelData(0);
    for(let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource();
    src.buffer = buf;
    const filt = c.createBiquadFilter();
    filt.type = 'bandpass';
    filt.frequency.value = filterFreq || 800;
    filt.Q.value = 0.5;
    const g = c.createGain();
    g.gain.setValueAtTime(gainPeak, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
    src.connect(filt); filt.connect(g); g.connect(c.destination);
    src.start(); src.stop(c.currentTime + dur);
  }

  const SFX = {
    muted(){ return _muted; },
    toggleMute(){ _muted = !_muted; return _muted; },

    // ── UI HOVER — soft high blip ──
    hover(){
      if(_muted) return;
      const c = ctx(); if(!c) return;
      const t = c.currentTime;
      const o = c.createOscillator(); const g = c.createGain();
      o.type='sine'; o.frequency.setValueAtTime(880, t); o.frequency.exponentialRampToValueAtTime(1320, t+0.05);
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.04, t+0.01); g.gain.exponentialRampToValueAtTime(0.0001, t+0.08);
      o.connect(g); g.connect(c.destination); o.start(t); o.stop(t+0.09);
    },

    // ── UI SELECT — confident two-note confirm ──
    select(){
      if(_muted) return;
      const c = ctx(); if(!c) return;
      const t = c.currentTime;
      [[660,0],[990,0.06]].forEach(([f,d])=>{
        const o=c.createOscillator(); const g=c.createGain();
        o.type='triangle'; o.frequency.setValueAtTime(f, t+d);
        g.gain.setValueAtTime(0.0001, t+d); g.gain.linearRampToValueAtTime(0.10, t+d+0.012); g.gain.exponentialRampToValueAtTime(0.0001, t+d+0.13);
        o.connect(g); g.connect(c.destination); o.start(t+d); o.stop(t+d+0.14);
      });
    },

    // ── HAND SKIM — quick light tick as a card slides into view ──
    handSkim(){
      if(_muted) return;
      const c = ctx(); if(!c) return;
      const t = c.currentTime;
      const o=c.createOscillator(); const g=c.createGain();
      o.type='square'; o.frequency.setValueAtTime(1500, t); o.frequency.exponentialRampToValueAtTime(900, t+0.03);
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.025, t+0.005); g.gain.exponentialRampToValueAtTime(0.0001, t+0.05);
      o.connect(g); g.connect(c.destination); o.start(t); o.stop(t+0.06);
    },

    // ── HIT — metallic impact, scales with damage ──────
    hit(dmg){
      if(_muted) return;
      const c = ctx(); if(!c) return;
      const t = c.currentTime;
      const heavy = (dmg || 4) >= 7;
      const freq = heavy ? 260 : 180;
      // Impact thud
      const o1 = c.createOscillator();
      const g1 = c.createGain();
      o1.type = 'sawtooth';
      o1.frequency.setValueAtTime(freq, t);
      o1.frequency.exponentialRampToValueAtTime(40, t + 0.12);
      g1.gain.setValueAtTime(heavy ? 0.5 : 0.35, t);
      g1.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
      o1.connect(g1); g1.connect(c.destination);
      o1.start(t); o1.stop(t + 0.14);
      // Metallic crunch noise
      if(heavy) noise(0.08, 0.3, 1200, c);
      else noise(0.06, 0.15, 800, c);
    },
    // Generic attack swing — quick whoosh + light impact
    attack(){
      if(_muted) return;
      const c = ctx(); if(!c) return;
      const t = c.currentTime;
      const o = c.createOscillator(); const g = c.createGain();
      o.type='sawtooth';
      o.frequency.setValueAtTime(420, t);
      o.frequency.exponentialRampToValueAtTime(120, t+0.12);
      g.gain.setValueAtTime(0.3, t);
      g.gain.exponentialRampToValueAtTime(0.001, t+0.14);
      o.connect(g); g.connect(c.destination);
      o.start(t); o.stop(t+0.14);
      noise(0.05, 0.18, 900, c);
    },
    // Combo flourish — rising triple blip for chained hits
    combo(){
      if(_muted) return;
      const c = ctx(); if(!c) return;
      const t = c.currentTime;
      const steps=[523,659,880];
      steps.forEach((f,i)=>{
        const o=c.createOscillator(); const g=c.createGain();
        o.type='triangle';
        o.frequency.setValueAtTime(f, t+i*0.07);
        g.gain.setValueAtTime(0.0001, t+i*0.07);
        g.gain.linearRampToValueAtTime(0.28, t+i*0.07+0.01);
        g.gain.exponentialRampToValueAtTime(0.001, t+i*0.07+0.12);
        o.connect(g); g.connect(c.destination);
        o.start(t+i*0.07); o.stop(t+i*0.07+0.13);
      });
    },


    // ── CARD PLAY — soft whoosh ────────────────────────
    cardPlay(){
      if(_muted) return;
      const c = ctx(); if(!c) return;
      const t = c.currentTime;
      const o1 = c.createOscillator();
      const g1 = c.createGain();
      o1.type = 'sine';
      o1.frequency.setValueAtTime(600, t);
      o1.frequency.exponentialRampToValueAtTime(300, t + 0.1);
      g1.gain.setValueAtTime(0.12, t);
      g1.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
      o1.connect(g1); g1.connect(c.destination);
      o1.start(t); o1.stop(t + 0.1);
    },

    // ── BOT DEFEATED — descending clank ───────────────
    botDefeated(){
      if(_muted) return;
      const c = ctx(); if(!c) return;
      const t = c.currentTime;
      [220, 180, 140, 100].forEach((f, i) => {
        const o = c.createOscillator();
        const g = c.createGain();
        o.type = 'sawtooth';
        o.frequency.setValueAtTime(f, t + i * 0.07);
        g.gain.setValueAtTime(0.3, t + i * 0.07);
        g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.07 + 0.2);
        o.connect(g); g.connect(c.destination);
        o.start(t + i * 0.07); o.stop(t + i * 0.07 + 0.2);
      });
      noise(0.3, 0.4, 300, c);
    },

    // ── MEDAFORCE — charge buildup + explosion ─────────
    zap(){
      if(_muted) return;
      const c = ctx(); if(!c) return;
      const t = c.currentTime;
      // Electric crackle: fast noisy high-frequency bursts + a zap sweep
      for(let i=0;i<5;i++){
        const o=c.createOscillator(); const g=c.createGain();
        o.type='square';
        const f=1800+Math.random()*2600;
        o.frequency.setValueAtTime(f, t+i*0.03);
        o.frequency.exponentialRampToValueAtTime(f*0.5, t+i*0.03+0.025);
        g.gain.setValueAtTime(0.0001, t+i*0.03);
        g.gain.linearRampToValueAtTime(0.12, t+i*0.03+0.004);
        g.gain.exponentialRampToValueAtTime(0.0001, t+i*0.03+0.03);
        o.connect(g); g.connect(c.destination); o.start(t+i*0.03); o.stop(t+i*0.03+0.035);
      }
      // Descending zap tail
      const z=c.createOscillator(); const zg=c.createGain();
      z.type='sawtooth';
      z.frequency.setValueAtTime(2400, t+0.05);
      z.frequency.exponentialRampToValueAtTime(220, t+0.3);
      zg.gain.setValueAtTime(0.0001, t+0.05);
      zg.gain.linearRampToValueAtTime(0.18, t+0.08);
      zg.gain.exponentialRampToValueAtTime(0.0001, t+0.32);
      z.connect(zg); zg.connect(c.destination); z.start(t+0.05); z.stop(t+0.34);
    },
    medaforce(){
      if(_muted) return;
      const c = ctx(); if(!c) return;
      const t = c.currentTime;
      // Rising charge sweep
      const sweep = c.createOscillator();
      const sg = c.createGain();
      sweep.type = 'sine';
      sweep.frequency.setValueAtTime(80, t);
      sweep.frequency.exponentialRampToValueAtTime(800, t + 0.6);
      sg.gain.setValueAtTime(0.001, t);
      sg.gain.linearRampToValueAtTime(0.4, t + 0.55);
      sg.gain.exponentialRampToValueAtTime(0.001, t + 0.65);
      sweep.connect(sg); sg.connect(c.destination);
      sweep.start(t); sweep.stop(t + 0.65);
      // Explosion at peak
      setTimeout(()=>{
        const c2 = ctx(); if(!c2) return;
        const t2 = c2.currentTime;
        [180, 120, 80].forEach((f, i) => {
          const o = c2.createOscillator();
          const g = c2.createGain();
          o.type = 'sawtooth';
          o.frequency.setValueAtTime(f, t2 + i*0.02);
          g.gain.setValueAtTime(0.5 - i*0.12, t2 + i*0.02);
          g.gain.exponentialRampToValueAtTime(0.001, t2 + 0.4 + i*0.1);
          o.connect(g); g.connect(c2.destination);
          o.start(t2 + i*0.02); o.stop(t2 + 0.5);
        });
        noise(0.4, 0.6, 500, c2);
      }, 550);
    },

    // ── MEDACHANGE — ascending transformation sting ────
    medachange(){
      if(_muted) return;
      const c = ctx(); if(!c) return;
      const t = c.currentTime;
      const notes = [261, 329, 392, 523, 659, 880];
      notes.forEach((f, i) => {
        const o = c.createOscillator();
        const g = c.createGain();
        o.type = i < 3 ? 'square' : 'sine';
        o.frequency.setValueAtTime(f, t + i * 0.08);
        g.gain.setValueAtTime(0.2, t + i * 0.08);
        g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.08 + 0.15);
        o.connect(g); g.connect(c.destination);
        o.start(t + i * 0.08); o.stop(t + i * 0.08 + 0.15);
      });
    },

    // ── TRAP SET — quiet mechanical click ─────────────
    trapSet(){
      if(_muted) return;
      const c = ctx(); if(!c) return;
      const t = c.currentTime;
      noise(0.04, 0.1, 2000, c);
      osc(440, 'square', t, 0.05, 0.08, c);
    },

    // ── TRAP TRIGGER — alert chime ─────────────────────
    trapTrigger(){
      if(_muted) return;
      const c = ctx(); if(!c) return;
      const t = c.currentTime;
      [880, 660, 880].forEach((f, i) => {
        osc(f, 'sine', t + i*0.06, 0.1, 0.25, c);
      });
    },

    // ── MEDAL FUSION — ascending shimmer ──────────────
    medalFusion(){
      if(_muted) return;
      const c = ctx(); if(!c) return;
      const t = c.currentTime;
      [300, 400, 500, 700, 900].forEach((f, i) => {
        osc(f, 'sine', t + i*0.05, 0.12, 0.18, c);
      });
    },

    // ── CHARGE UP — rising tone ────────────────────────
    charge(){
      if(_muted) return;
      const c = ctx(); if(!c) return;
      const t = c.currentTime;
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(200, t);
      o.frequency.linearRampToValueAtTime(500, t + 0.15);
      g.gain.setValueAtTime(0.12, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      o.connect(g); g.connect(c.destination);
      o.start(t); o.stop(t + 0.18);
    },

    // ── BLADE SLASH — sharp swipe ──────────────────────
    slash(){
      if(_muted) return;
      const c = ctx(); if(!c) return;
      noise(0.08, 0.35, 3000, c);
      osc(1200, 'sawtooth', c.currentTime, 0.06, 0.15, c);
    },

    // ── VICTORY ────────────────────────────────────────
    victory(){
      if(_muted) return;
      const c = ctx(); if(!c) return;
      const t = c.currentTime;
      const melody = [[523,0],[659,0.12],[784,0.24],[1047,0.36],[784,0.52],[1047,0.64]];
      melody.forEach(([f, dt]) => {
        osc(f, 'square', t+dt, 0.18, 0.22, c);
        osc(f*0.5, 'sine', t+dt, 0.18, 0.1, c);
      });
    },

    // ── DEFEAT ─────────────────────────────────────────
    defeat(){
      if(_muted) return;
      const c = ctx(); if(!c) return;
      const t = c.currentTime;
      [400, 300, 200, 140].forEach((f, i) => {
        osc(f, 'sawtooth', t + i*0.18, 0.25, 0.28, c);
      });
      noise(0.6, 0.2, 200, c);
    },
  };

  // Init AudioContext on first user touch (iOS requirement)
  document.addEventListener('touchstart', function initAudio(){
    ctx();
    document.removeEventListener('touchstart', initAudio);
  }, {once: true, passive: true});
  document.addEventListener('click', function initAudioClick(){
    ctx();
    document.removeEventListener('click', initAudioClick);
  }, {once: true});

  return SFX;
})();

// Mute toggle button helper
function toggleSFX(){
  const muted = SFX.toggleMute();
  const btn = document.getElementById('sfx-btn');
  if(btn) btn.textContent = muted ? '🔇' : '🔊';
}


// ═══════════════════════════════════════════════════════
// TUTORIAL — coach-mark overlay, fires on first launch
// ═══════════════════════════════════════════════════════
const TUT_STEPS = [
  {t:'Welcome to Medal Wars', b:'A turn-based robot card battle. KO all 3 enemy bots to win (or have the most HP at turn 12). This quick walkthrough covers the basics — tap NEXT to continue, or SKIP anytime.'},
  {t:'Your Bots', b:'Your three Medabots sit at the bottom. The one in front is ACTIVE — it attacks and defends. The two behind are protected until the active bot falls. Each bot has ATK (damage) and HP (health).'},
  {t:'Charge Phase', b:'Every turn starts by charging. Your active bot gains Charge automatically. When a bot reaches 5 Charge it IGNITES — unlocking its Medaforce, the deck\'s ultimate attack.'},
  {t:'Your Hand', b:'You draw cards each turn. Techniques boost an attack, Actions give effects, Equipment attaches buffs, Traps set face-down, and Medachange transforms a bot once per game. Tap a card to play it.'},
  {t:'Taking Your Turn', b:'You get 1 Action per turn. Play a card OR attack — then tap an enemy bot to strike. Some cards are free. When you\'re done, end your turn and the CPU takes theirs.'},
  {t:'Medal Fusion', b:'When one of your bots is defeated, its Medal fuses into a surviving ally — granting bonus HP, Charge, and its passive. Losing a bot makes your others stronger.'},
  {t:'Last Stand', b:'When you\'re down to your final bot, it can enter LAST STAND — a massive power boost that scales with the Medals it carries (absorbed from fallen allies). Solo decks like Iron Throne always have their Last Stand active. Tap the \u24d8 on any bot to see its Last Stand. Comebacks happen here!'},
  {t:'You\'re Ready!', b:'That\'s the core loop: charge, play cards, attack, adapt. Tap the ? button anytime to review the rules. Good luck in the arena, Medafighter!'},
];
let _tutStep = 0;


