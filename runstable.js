// MEDAL WARS — STABLE cross-deck balance sim.
// Runs the full tournament under several fixed RNG seeds and reports
// mean win-rate plus the spread (min/max) per deck, so real balance
// signal is separated from run-to-run noise.
// Usage: node runstable.js [matchesPerMatchupPerSeed] [numSeeds]
const fs=require('fs');
const h=fs.readFileSync('mw_mobile.html','utf8')
  .replace(/<audio [^>]*src="data:[^>]*>/g,'<audio></audio>')
  .replace(/background-image:url\('data:image\/jpeg[^']*'\)/g,'');
const js=[...h.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]).join('\n');
const ids=new Set([...h.matchAll(/id="([^"]+)"/g)].map(m=>m[1]));

function E(){return{classList:{add(){},remove(){},toggle(){},contains:()=>false},style:{cssText:'',setProperty(){},display:''},textContent:'',innerHTML:'',value:'',appendChild:()=>E(),addEventListener(){},setAttribute(){},getAttribute:()=>null,removeAttribute(){},querySelector:()=>null,querySelectorAll:()=>[],dataset:{},remove(){},getBoundingClientRect:()=>({top:0,left:0,width:1,height:1}),offsetWidth:1};}
function AC(){return{createOscillator:()=>({frequency:{setValueAtTime(){},exponentialRampToValueAtTime(){},linearRampToValueAtTime(){}},connect(){},start(){},stop(){},type:''}),createGain:()=>({gain:{setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){}}),createBiquadFilter:()=>({frequency:{},Q:{},connect(){}}),createBuffer:()=>({getChannelData:()=>new Float32Array(10),sampleRate:44100}),createBufferSource:()=>({connect(){},start(){},stop(){}}),sampleRate:44100,destination:{},currentTime:0,state:'running',resume(){}};}
global.Audio=class{play(){return Promise.resolve();}pause(){}load(){}};
global.fetch=async()=>({ok:true});
global.location={hostname:'x',protocol:'https:',host:'x',reload(){},search:'',pathname:'/'};
global.history={replaceState(){}};
global.URLSearchParams=class{constructor(){}get(){return null;}};
global.window={AudioContext:AC,webkitAudioContext:AC,innerWidth:400,innerHeight:800,addEventListener(){},location:global.location,WebSocket:class{}};
global.WebSocket=class{};
global.document={getElementById:(id)=>(ids.has(id)||['title','end','arena','pm-grid'].includes(id))?E():null,createElement:()=>E(),querySelector:()=>E(),addEventListener(){},body:{appendChild:()=>E()},querySelectorAll:()=>[],readyState:'complete'};
global.localStorage={_d:{},getItem(k){return this._d[k]||null;},setItem(k,v){this._d[k]=v;},removeItem(k){delete this._d[k];},length:0,key:()=>null};
global.navigator={storage:{}};
global.setTimeout=(f)=>{try{f();}catch(e){}return 0;};
global.setInterval=()=>9;global.clearInterval=()=>{};global.clearTimeout=()=>{};global.requestAnimationFrame=()=>0;
global.FileReader=class{};global.Blob=class{};global.URL={createObjectURL:()=>''};global.XMLHttpRequest=class{open(){}send(){}};global.Image=class{};global.indexedDB=null;global.confirm=()=>true;

// ── Seeded PRNG (mulberry32). We overwrite Math.random so all in-game
//    randomness (mulligan, AI tie-breaks, stage pick) becomes reproducible. ──
let _rngState = 12345;
function _setSeed(s){ _rngState = (s>>>0) || 1; }
Math.random = function(){
  _rngState |= 0; _rngState = (_rngState + 0x6D2B79F5) | 0;
  let t = Math.imul(_rngState ^ (_rngState >>> 15), 1 | _rngState);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const decks=['blaze','titan','royal','shadow','throne','forge','cross','blacktide'];
const N=parseInt(process.argv[2]||'30',10);
const SEEDS=parseInt(process.argv[3]||'5',10);

const api=new Function(js+`
  return { get G(){return G;}, set G(v){G=v;},
    init, offerMulligan, closeM, runPhase, cpuTurn, endCpu, endTurn,
    aiProTurn, aiHybridTurn, get deck(){return deck;}, set deck(v){deck=v;},
    get turn(){return turn;}, set turn(v){turn=v;},
    get actionsLeft(){return actionsLeft;}, set actionsLeft(v){actionsLeft=v;},
    alive, getActiveBot, calcActionsLeft, doCharge
  };
`)();

function cpuSide(){ try{ api.aiProTurn(); }catch(e){} }

function playMatch(deckP, deckC){
  api.deck=deckP;
  api.G = undefined;
  globalThis._opp=deckC;
  api.init();
  try{ api.G._forcedCpuDeck=deckC; }catch(e){}
  api.init();
  try{ api.G._forcedCpuDeck=deckC; }catch(e){}
  api.offerMulligan(); api.closeM();
  let guard=0;
  const G=api.G;
  while(!G.winner && guard<40){
    guard++;
    api.G.phase='charge';
    const tp=G.p, tc=G.c; G.p=tc; G.c=tp;
    try{ api.doCharge('c'); }catch(e){}
    cpuSide();
    const a=G.p, b=G.c; G.p=b; G.c=a;
    if(G.winner) break;
    try{ api.doCharge('c'); }catch(e){}
    cpuSide();
    try{ api.endCpu(); }catch(e){}
  }
  if(!G.winner){
    const pHP=api.alive(G.p).reduce((s,b)=>s+b.hp,0);
    const cHP=api.alive(G.c).reduce((s,b)=>s+b.hp,0);
    G.winner = pHP>=cHP?'p':'c';
  }
  return G.winner;
}

// Run one full tournament, return per-deck win rates
function tournament(){
  const wins={}, games={};
  decks.forEach(d=>{wins[d]=0;games[d]=0;});
  for(const a of decks){
    for(const b of decks){
      if(a===b) continue;
      for(let i=0;i<N;i++){
        let w=playMatch(a,b);
        games[a]++; games[b]++;
        if(w==='p') wins[a]++; else wins[b]++;
      }
    }
  }
  const r={}; decks.forEach(d=>r[d]=games[d]?wins[d]/games[d]:0);
  return r;
}

// Run across multiple seeds
const perSeed={}; decks.forEach(d=>perSeed[d]=[]);
process.stderr.write('Running '+SEEDS+' seeds x '+N+' matches/matchup');
for(let s=0;s<SEEDS;s++){
  _setSeed(1000+s*7919);
  const r=tournament();
  decks.forEach(d=>perSeed[d].push(r[d]));
  process.stderr.write('.');
}
process.stderr.write('\n');

function stats(arr){
  const mean=arr.reduce((a,b)=>a+b,0)/arr.length;
  const min=Math.min(...arr), max=Math.max(...arr);
  return {mean,min,max};
}

console.log('\nSTABLE BALANCE — '+N+' matches/matchup x '+SEEDS+' seeds (both sides HARD pro AI)');
console.log('mean win-rate [min–max spread across seeds]:\n');
decks.map(d=>({d,...stats(perSeed[d])}))
  .sort((x,y)=>y.mean-x.mean)
  .forEach(({d,mean,min,max})=>{
    const pct=Math.round(mean*100);
    const lo=Math.round(min*100), hi=Math.round(max*100);
    console.log('  '+d.padEnd(9)+String(pct).padStart(3)+'%  ['+String(lo).padStart(2)+'–'+String(hi).padStart(2)+']  '+'█'.repeat(Math.round(pct/5)));
  });
