// ═══ STATE ═══
let G={},deck='blaze',cpuDiff='normal',logs=[],turn=1,atked=false;
// ── ZANSHIN sequencer state (null when inactive) ──
// {phase:1|2|3, verdicts:[{type,botKey,targetUid}], side:'p'} ──

let winCount=parseInt(localStorage.getItem('mw_wins')||'0');
let lossCount=parseInt(localStorage.getItem('mw_losses')||'0');
let streakCount=parseInt(localStorage.getItem('mw_streak')||'0');
let actionsLeft=1; // actions remaining this turn (Last Stand can raise this above 1)

function mkBot(k){
  const b=BOTS[k],m=MEDAL[b.medal];
  const _hp=m.hp+(b.hpBonus||0);
  return{key:k,name:b.name,atk:b.atk,art:b.art,mcart:b.mcart,color:b.color,passive:b.passive||'',
    medal:b.medal,mName:m.name,mColor:m.color,mPass:m.passive,mfFx:m.mfFx,
    hp:_hp,maxHp:_hp,charge:0,
    def:false,burn:false,exhst:false,
    equip:null,changed:false,fusedMedal:null,fusedPass:null,
    _dbl:false,_fury:false,
    _stalkReady:false,_stalkedThisTurn:false,_stalwaysOn:false,_machLSAtk:0,_machPierce:false,
    _webbed:0,_sovereignLS:false,_terraForceLS:false,_fullBurstLS:false,_dramonActive:false,
    _shadowCloneLS:false,_foxFireLS:false,_finalShotLS:false,_comboCount:0,_dualTechUsed:false,_dominionLS:false,_throneArmor:0,_seaslugFired:false,_stance:null,_bound:0,_defStrip:0,_verdict:null,_zCommitted:false};
}
function init(){
  const pd=JSON.parse(JSON.stringify(DECKS[deck]));
  if(typeof applyDeckSwaps==='function'){ pd.deck=shuffle(applyDeckSwaps(deck, pd.deck)); }
  // CPU picks a random deck — can mirror the player's choice
  const allDecks=['blaze','titan','royal','shadow','throne','forge','cross','blacktide','senbei'];
  const cpuDeckPick=(typeof G!=='undefined'&&G._forcedCpuDeck)?G._forcedCpuDeck:allDecks[Math.floor(Math.random()*allDecks.length)];
  const cd=JSON.parse(JSON.stringify(DECKS[cpuDeckPick]));
  G={
    p:{bots:pd.bots.map(mkBot),mf:{...MFR[pd.mf]},mfKey:pd.mf,deck:pd.deck,hand:[],
       selBot:null,selCard:null,mcUsed:false,_henryUsed:false,_overloadReady:false,_techsThisTurn:0,
       _resonance:0,_stances:{bound:false,exposed:false,exec:false},
       activeBot:0,switched:false,_doubloons:0},  // activeBot = index of front bot
    c:{bots:cd.bots.map(mkBot),mf:{...MFR[cd.mf]},deck:cd.deck,hand:[],
       mcUsed:false,activeBot:0,switched:false,_doubloons:0},
    phase:'charge',winner:null,reason:'',
    supportUsed:false,  // can use one bot support action per turn
    boostActive:null,   // which ally gets +2 ATK bonus next attack
    tauntActive:false,  // CPU must target the taunting bot
    story:[],  // key moments for end-screen narrative
    maxDmg:0,maxDmgBot:'',maxDmgCard:'',  // biggest hit tracking
    mfFired:0, fusionCount:0,            // event counters
    pTraps:[],                            // player's armed trap cards
    locatorUsed:false,                    // Medal Locator once-per-game
  };
  for(let i=0;i<4;i++)drw(G.p);
  for(let i=0;i<4;i++)drw(G.c);
  // HARD difficulty: give the CPU a skilled-player tempo edge (extra card + starting charge).
  if(cpuDiff==='hard'){
    drw(G.c);
    G.c.bots.forEach(b=>{ if(!b.def) b.charge=Math.min(5,(b.charge||0)+1); });
  }
  turn=1;atked=false;actionsLeft=1;G._lsBannerThisTurn=false;logs=[];G.p._evolveCount=0;G.c._evolveCount=0;
}

