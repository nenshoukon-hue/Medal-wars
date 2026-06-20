// ═══ GAME DATA ═══
const MEDAL={
  blaze:    {name:'Blaze',    hp:20,color:'#f06424',passive:'+1 DMG on attacks',mfFx:'mf_blaze'},
  plunder:  {name:'Plunder',  hp:18,color:'#d4a020',passive:'Attacks earn 2 Doubloons. Turn start: 6+ coins, draw.',mfFx:'mf_broadside'},
  lightning:{name:'Lightning',hp:16,color:'#2a80f0',passive:'Double atk if dmg ≥4',mfFx:'mf_lightning'},
  psycho:   {name:'Psycho',   hp:16,color:'#9070f0',passive:'Draw 1 on Medaforce',mfFx:'mf_psycho'},
  titan:    {name:'Titan',    hp:22,color:'#8090a0',passive:'-1 DMG taken',mfFx:'mf_titan'},
  aqua:     {name:'Aqua',     hp:16,color:'#10c090',passive:'Heal 1 HP per turn',mfFx:'mf_aqua'},
  nature:   {name:'Nature',   hp:17,color:'#60c020',passive:'+2 Charge per turn',mfFx:'mf_nature'},
  royal:    {name:'Royal',     hp:20,color:'#f0c040',passive:'+1 ATK per fallen ally. Royal bots gain +2 ATK per evolution this game.',mfFx:'mf_royal'},
  digicore: {name:'Digi-Core', hp:17,color:'#00ff80',passive:'Gain 1 Charge when taking 4+ damage',mfFx:'mf_digistrike'},
  chain:    {name:'Chain',    hp:18,color:'#e060f0',passive:'3rd action each turn is free',mfFx:'mf_chain_strike'},
  emperor:  {name:'Emperor',  hp:60,color:'#60c030',passive:'Charge 2/turn. Medaforce fires at 4 Charge',mfFx:'mf_imperial'},
  zero:     {name:'Zero',     hp:26,color:'#d8dde8',passive:'Charge Mastery: gains +1 extra Charge each turn. Attacks deal +1 damage per 2 Charge held.',mfFx:'mf_crossburst'},
  forge:    {name:'Forge',    hp:21,color:'#e0a020',passive:'Attacks ignore 1 damage reduction.',mfFx:'mf_overforge'},
  senbei:   {name:'Senbei',   hp:19,color:'#c83232',passive:'Stance Mastery: gains +1 Resonance each turn a Stance is active.',mfFx:'mf_zanshin'},
};
const BOTS={
  metabee:  {name:'Metabee',  atk:5,medal:'blaze',   art:'metabee',  mcart:'mc_meta',color:'#f06424',passive:'On attack: if target has burn, deal +1 extra dmg.'},
  arcbeetle:{name:'Arcbeetle-',atk:4,medal:'lightning',hpBonus:4,art:'arcbeetle',mcart:'mc_arc', color:'#2a80f0',passive:'Disruptor: after attacking, the enemy bot loses 2 Charge.'},
  warbandit:{name:'Warbandit',atk:4,medal:'psycho',   art:'warbandit',mcart:'mc_war', color:'#9070f0',passive:'Wildfire: when your Technique burns an enemy, spread 1 burn to another enemy.'},
  rokusho:  {name:'Roks',  atk:4,medal:'titan',    art:'rokusho',  mcart:'mc_rok', color:'#8090a0',passive:'Takes 1 less damage (stacks with Titan Medal).'},
  sumilidon:{name:'Sumilidon',atk:5,medal:'blaze',    art:'sumilidon',mcart:'mc_sumi',color:'#f06424',passive:'Ravager: +1 DMG for every 5 HP missing (the more wounded, the deadlier).'},
  machairodus:{name:'Machairodus',atk:5,medal:'titan',art:'machairodus',mcart:'mc_mach',color:'#9050d0',passive:'Stalk: if did NOT attack last turn, next attack +2 DMG.'},
  omegaknight:{name:'Omegaknight',atk:6,medal:'royal',art:'omegaknight',mcart:'mc_omega',color:'#f0c040',passive:'Vanguard: attacks on support bots redirect to Omegaknight.'},
  robo_emperor:{name:'Robo Emperor',atk:8,medal:'emperor',art:'robo_emperor',mcart:'mc_robo',color:'#60c030',passive:'Cable Network: start of turn, deal 2 DMG to highest-charge enemy and drain 1 Charge.'},
  grand_beetle:{name:'Grand Beetle',atk:6,medal:'forge',art:'grand_beetle',mcart:'mc_grand_beetle',color:'#e0a020',passive:'Master Frame: holds up to 3 equipment. +1 ATK per equipment attached.'},
  cross_messiah:{name:'Cross Messiah',atk:5,medal:'zero',art:'cross_messiah',mcart:'mc_cross_messiah',color:'#d8dde8',passive:'Kabuto+Kuwagata: Charge Blade & Buster scale with Charge. At max Charge, attacks deal +4. Medachange to Cross Messiah Z.'},
  charge_corne:{name:'Moon Dragon',atk:3,medal:'zero',art:'charge_corne',mcart:'mc_charge_corne',color:'#7fc0ff',passive:'Lunar Support: each turn, gives +1 Charge to your lowest-charge ally.'},
  beetle_gun:{name:'Seagaru',atk:6,medal:'zero',art:'beetle_gun',mcart:'mc_beetle_gun',color:'#b0b8c8',passive:'Sky Buster: ranged attacks deal +2 when this bot is at 4+ Charge.'},
  neutranurse:{name:'Neutranurse',atk:3,medal:'forge',art:'neutranurse',mcart:'mc_neutranurse',color:'#40c0a0',passive:'Hot Forge: when you play an equipment card, draw a card.'},
  blackram:{name:'Blackram',atk:4,medal:'forge',art:'blackram',mcart:'mc_blackram',color:'#a08060',passive:'Scrap & Rebuild: when an equipped bot is defeated, return one of its equipment to your hand.'},
  nin_ninja:  {name:'Nin-Ninja', atk:6,medal:'chain',hpBonus:4,art:'nin_ninja', mcart:'mc_nin',  color:'#4080f0',passive:'Dual Technique: 2nd Technique each turn is FREE.'},
  foxuno:     {name:'Foxuno',    atk:5,medal:'chain',hpBonus:4,art:'foxuno',    mcart:'mc_foxuno',color:'#40d898',passive:'Battle Remedy: 2nd action each turn is FREE; on attack, heal lowest-HP ally 2 HP.'},
  gokudo:     {name:'Gokudo',    atk:8,medal:'chain',hpBonus:4,art:'gokudo',    mcart:'mc_gokudo',color:'#f04020',passive:'Combo Cannon: +2 DMG per technique played this turn before attacking.'},
  wargreymon:    {name:'WarGreymon',    atk:5,medal:'digicore',art:'wargreymon',    mcart:'mc_warg',  color:'#f0c040',passive:'Dramon Destroyer: deals +3 DMG to equipped bots.'},
  metalgurumemon:{name:'MetalGurumemon',atk:4,medal:'digicore',art:'metalgurumemon',mcart:'mc_metal', color:'#9050d0',passive:'Missile Barrage: after attacking, deal 1 DMG to another enemy.'},
  piraskull:       {name:'Piraskull',      atk:6,medal:'plunder',hpBonus:3,art:'bot_piraskull',      mcart:'bot_piraskull_mc',      color:'#d4a020',passive:"Captain's Cut: your attacks earn +1 extra Doubloon."},
  taraba_craba:    {name:'Pirastar',        atk:5,medal:'plunder',hpBonus:1,art:'bot_taraba_craba',   mcart:'bot_taraba_craba_mc',   color:'#e0603a',passive:'Cannonade: before attacking, may spend 3 Doubloons to deal +5 dmg.'},
  tentaclam:       {name:'TentaClam',      atk:4,medal:'plunder',hpBonus:2,art:'bot_tentaclam',      mcart:'bot_tentaclam_mc',      color:'#3aa0c0',passive:"Hoarder's Eye: end of turn, +1 Doubloon per other living crewmate (max +2)."},
  kensho:    {name:'Kensho',    atk:3,hpBonus:-16,medal:'senbei',art:'bot_kensho',   mcart:'bot_kensho_mc',   color:'#e8d0a0',passive:'The Reader: a non-combatant. ATK is fixed at 3 and Kensho never attacks \u2014 it only reads the field, holds your Stances free, and anchors Zanshin.'},
  gobanko:   {name:'Gobanko',   atk:5,medal:'senbei',art:'bot_gobanko',  mcart:'bot_gobanko_mc',  color:'#3a78c0',passive:'Bound Stance: when active, attacks apply Bound (target cannot defend next turn).'},
  samurai:   {name:'Samurai',   atk:5,medal:'senbei',art:'bot_samurai',  mcart:'bot_samurai_mc',  color:'#c0c0c0',passive:'Exposed Stance: when active, attacks strip 1 defense tier from the target.'},
  shinsaber: {name:'Shinsaber', atk:6,medal:'senbei',art:'bot_shinsaber',mcart:'bot_shinsaber_mc',color:'#c83232',passive:'Execution Stance: when active, attacks on the lowest-HP enemy are Unblockable.'},
};
const MFR={
  ikki:{name:'Ikki Tenryou',pass:'Bot ≤5 HP → +1 Charge.'},
  redbeard:{name:'Captain Gene',pass:'Plunder: your bots earn 2 Doubloons whenever they attack. Bank coins, then spend them on pirate cards and Win Medals.'},
  henry:{name:'Henry',pass:'Fusion Engineer: your Medachange & Fusion plays cost no action.'},
  roks:{name:'Rokusho (Partner)',pass:'When Omegaknight defeats a bot, gain 2 Charge instantly.'},
  tai:{name:'Tai Kamiya',pass:'When any bot defeats an enemy, all your bots gain +1 ATK this turn.'},
  karin:{name:'Karin Junko',pass:'When you play 3+ cards in one turn, draw 1 and Gokudo gains +1 Charge.'},
  seaslug:{name:'Seaslug',pass:'When Robo Emperor drops below 20 HP, gain 3 Charge and draw 1 card.'},
  kasumi:{name:'Kasumi Asano',pass:'When you play an equipment card, that bot gains +1 Charge.'},
  nova_pilot:{name:'Arase Oosumi',pass:'When a bot reaches max Charge, draw a card and that bot gains +1 ATK.'},
  master_sen:{name:'Master Sen',pass:'Zanshin: at 3+ Resonance with all three Stances active, you may freely assign the three Verdicts.'},
};
let _uid=0;
function uid(){return 'c'+(++_uid);}
function C(id,type,name,art,stat,fx,color,desc){
  return{id,type,name,art,stat,fx,color,desc,uid:uid()};
}
const CDEFS={
  hyper_missile: C('hyper_missile','technique','Hyper Missile','fire_art','+6 DMG','deal6_burn','#f06424','Deal +6 dmg. Target burns 2 next turn.'),
  chain_spark:   C('chain_spark','technique','Chain Spark','wind_art','+4 DMG','deal4_chain','#60c020','Deal +4 dmg. Splash 2 to another enemy.'),
  arc_bolt:      C('arc_bolt','technique','Arc Bolt','storm_art','+3 +1Chg','deal3_charge','#2a80f0','Deal +3 dmg. +1 Charge to your attacker.'),
  iron_strike:   C('iron_strike','technique','Iron Strike','earth_art','+5 −2Chg','deal5_drain','#8090a0','Deal +5 dmg. Enemy loses 2 Charge.'),
  tidal_rush:    C('tidal_rush','technique','Tidal Rush','water_art','+2 +2Heal','deal2_heal','#10c090','Deal +2 dmg. Heal your attacker 2 HP.'),
  psycho_pulse:  C('psycho_pulse','technique','Psycho Pulse','psi_art','+2 Draw1','deal2_draw','#9070f0','Deal +2 dmg. Draw 1 card.'),
  inferno_surge: C('inferno_surge','medaforce','Inferno Surge','mf_art','8 Direct','mf_blaze','#f06424','Deal 8 unblockable dmg to one bot.'),
  thunder_barrage:C('thunder_barrage','medaforce','Thunder Barrage','mf_art','4 to All','mf_lightning','#2a80f0','Hit ALL enemy bots for 4 dmg.'),
  x_burst:       C('x_burst','medaforce','X Burst','mf_x_art','Fusion','mf_xburst','#e04030','Deal 7 to the active enemy. If Masterbeetle is in play, deal 12 and ignore all reduction.'),
  master_cannon: C('master_cannon','medaforce','Master Cannon','mf_master_art','Railgun','mf_mastercannon','#f0c040','Deal 6 to ALL enemies. If Masterbeetle \u039e (Master form) is in play, deal 11 to all \u2014 the full Prominence Railgun.'),
  mind_seize:    C('mind_seize','medaforce','Mind Seize','mf_art','Steal Bot','mf_psycho','#9070f0','Enemy bot attacks its own team.'),
  earth_prison:  C('earth_prison','medaforce','Earth Prison','mf_art','Exhaust All','mf_titan','#8090a0','All enemies skip their next attack.'),
  press_forward: C('press_forward','action','Press Forward','act_art','+2 Charge','act_charge','#60c020','+2 Charge to one of your bots.'),
  medal_dampener:C('medal_dampener','action','Medal Dampener','act_art','−2 Opp Chg','act_drain','#60c020','Enemy bot loses 2 Charge.'),
  recharge:      C('recharge','action','Recharge','act_art','Draw 2','act_draw2','#60c020','Draw 2 cards from your deck.'),
  wall_stance:   C('wall_stance','action','Wall Stance','eq_art','Redirect attacks','act_wall','#8090a0','Rokusho absorbs the next 2 attacks aimed at allies. Lasts until end of CPU turn.'),
    medal_fusion:  C('medal_fusion','action','Medal Fusion','act_art','Draw 2 + Boost','act_fusion','#9070f0','Draw 2 cards. Your next Medal Fusion grants +8 HP instead of +4.'),
  ikkis_call:    C('ikkis_call','action','Ikki\'s Call','act_art','MF Passive','act_ikki','#60c020','Apply Medafighter passive to all bots now.'),
  blaze_arm:     C('blaze_arm','equipment','Blaze Arm','eq_art','+2 ATK','eq_blaze_arm','#a060f0','Equipped bot deals +2 DMG on all attacks.'),
  counter_claw:  C('counter_claw','equipment','Counter Claw','eq_art','Retaliate 2','eq_counter','#a060f0','When hit, deal 2 back to attacker.'),
  resonator:     C('resonator','equipment','Resonator','eq_art','+2Chg / +1','eq_resonator','#a060f0','Equip: +2 Charge now. +1 extra Charge each turn.'),
  hunter_module: C('hunter_module','equipment','Hunter Module','eq_art','+3 vs Low','eq_hunter','#a060f0','Deal +3 extra DMG to bots below half HP.'),
  ghost_shell:   C('ghost_shell','equipment','Ghost Shell','eq_art','Revive 1×','eq_ghost','#a060f0','On defeat: revive once at 5 HP. Destroys itself.'),
  fury_core:     C('fury_core','equipment','Fury Core','eq_art','2× Atk/Risk','eq_fury','#a060f0','Attack twice per turn. Take +2 DMG from attacks.'),
  medal_lens:    C('medal_lens','equipment','Medal Lens','eq_art','MF +3 DMG','eq_lens','#a060f0','Next Medaforce deals +3 extra DMG. Then destroyed.'),
  burn_coat:     C('burn_coat','equipment','Burn Coat','eq_art','Burn Attacker','eq_burn','#a060f0','Attackers take 1 burn next turn after hitting this bot.'),
  mc_metabee:    C('mc_metabee','medachange','Metabee Change','mc_card_art','+5ATK +12HP','mc_bot_metabee','#f04880','Fuse with Metabee: +5 ATK, +12 max HP. Blaze damage cap removed. Losing = instant loss.'),
  mc_arcbeetle:  C('mc_arcbeetle','medachange','Sumilidon Change','mc_card_art','+5ATK +14HP','mc_bot_sumilidon','#f06424','Fuse with Sumilidon: +5 ATK, +14 HP, and its Ravager bonus doubles (+2 DMG per 5 HP missing). A burning berserker. Losing = instant loss.'),
  mc_warbandit:  C('mc_warbandit','medachange','Warbandit Change','mc_card_art','+5ATK +12HP','mc_bot_warbandit','#f04880','Fuse with Warbandit: +5 ATK, +12 HP. MF draws 2 + all enemy charge −2. Losing = instant loss.'),
  mc_grand_beetle: C('mc_grand_beetle','medachange','Grand Beetle Forge','mc_card_art','+5ATK +12HP','mc_bot_grand_beetle','#e0a020','Fuse with Grand Beetle: +5 ATK, +12 max HP. Equipment slots 3→4. Losing = instant loss.'),
  mc_neutranurse: C('mc_neutranurse','medachange','Neutranurse Forge','mc_card_art','+4ATK +14HP','mc_bot_neutranurse','#40c0a0','Fuse with Neutranurse: +4 ATK, +14 max HP. Heals all allies +2 each turn. Losing = instant loss.'),
  mc_blackram: C('mc_blackram','medachange','Blackram Forge','mc_card_art','+6ATK +10HP','mc_bot_blackram','#a08060','Fuse with Blackram: +6 ATK, +10 max HP. Sacrifice techniques deal +2 bonus. Losing = instant loss.'),
  // Burn-specific techniques for Blaze Chain
  flame_whip:    C('flame_whip','technique','Flame Whip','fw_art','+2 Spread Burn','deal3_burn_all','#f06424','Deal +2 dmg. ALL enemies take burn damage next turn.'),
  scorch:        C('scorch','technique','Scorch','sc_art','+2 / +6 Burn','deal2_scorch','#f06424','Deal +2 dmg. If target is already burning, deal +5 instead.'),
  ember_bolt:    C('ember_bolt','technique','Ember Bolt','eb_art','+1 Burn+Chg','deal1_ember','#ff9060','Deal +1 dmg. Apply burn AND gain +2 Charge on attacker.'),
  ignite_card:   C('ignite_card','action','Ignite','fire_art','Burn 1 enemy','act_ignite','#f06424','Apply burn to one enemy Medabot. No damage. Free setup.'),
    mc_rokusho:    C('mc_rokusho','medachange','Master Medachange','mc_card_art','ULTIMATE','mc_bot_rokusho','#f0c040','Roks rides atop Masterbeetle for the ultimate form: +3 ATK, +14 HP, takes 3 less damage, heals 3/turn, and attacks hit ALL enemies (full to target, half splash). If no Masterbeetle is available, Medachanges Roks as normal.'),
  mc_machairodus:C('mc_machairodus','medachange','X Fusion Change','mc_card_art','FUSION','mc_bot_machairodus','#e04030','Arcbeetle- + Machairodus combine into MASTERBEETLE: combined ATK +3, pooled HP +10, gains Charge-on-attack, Stalk, and ignores enemy damage reduction. If only one of the two is in play, Medachanges that bot as normal instead.'),
  // ── TRAP / COUNTER CARDS — set face-down, auto-trigger on CPU turn ──
  guard_break:   C('guard_break','trap','Guard Break','eq_art','Negate Attack','trap_negate','#40d898','TRAP: Set face-down. Negates the next enemy attack against you.'),
  null_field:    C('null_field','trap','Null Field','psi_art','Negate Medaforce','trap_nullmf','#9070f0','TRAP: Set face-down. Cancels the next enemy Medaforce.'),
  mirror_plate:  C('mirror_plate','trap','Mirror Plate','eq_art','Reflect 4','trap_reflect','#2a80f0','TRAP: Set face-down. Reflects the next enemy attack — deal 4 to attacker, take none.'),
  // ── MEDAL LOCATOR — tutor a Medaforce ──
  medal_locator: C('medal_locator','action','Medal Locator','act_art','Find Medaforce','act_locate','#f0b820','Search your deck for a Medaforce, reveal it, add to hand, shuffle. Once per game.'),
  // ═══ GENERIC NEUTRAL POOL (swap-in, up to 3 per deck) ═══
  gen_field_medic:  C('gen_field_medic','action','Field Medic','act_art','Heal 5/8','gen_heal','#40d898','Heal a bot 5 HP (8 if below half). Generic.'),
  gen_bulwark:      C('gen_bulwark','equipment','Bulwark','eq_art','-1 DMG taken','gen_bulwark','#8090a0','Equipped bot takes -1 from attacks this turn and next. Generic.'),
  gen_static_field: C('gen_static_field','trap','Static Field','trap_art','Trap: negate','trap_negate','#2a80f0','TRAP: negate the next enemy attack entirely. Generic.'),
  gen_recharge:     C('gen_recharge','action','Recharge','act_art','+2 Charge','gen_recharge','#f0b820','Active bot +2 Charge. Draw a card if already at max. Generic.'),
  gen_salvage:      C('gen_salvage','action','Scrap Salvage','act_art','Draw 2 disc 1','gen_salvage','#60c020','Draw 2 cards, then discard 1. Generic.'),
  gen_override:     C('gen_override','action','Override','act_art','Cancel next','gen_override','#c060f0','Cancel the next technique or action your opponent plays this turn. Generic.'),
  gen_power_surge:  C('gen_power_surge','technique','Power Surge','wind_art','+4/+6 DMG','gen_surge','#f06424','+4 DMG (+6 if your bot below half HP). Generic.'),
  gen_pile_driver:  C('gen_pile_driver','technique','Pile Driver','earth_art','+3 no-switch','gen_pile','#8090a0','+3 DMG. Target cannot switch next turn. Generic.'),
  gen_last_resort:  C('gen_last_resort','action','Last Resort','act_art','6 unblockable','gen_lastresort','#f04040','Only if you have 2 or fewer cards in hand: deal 6 unblockable damage. Generic.'),
  gen_medal_reboot: C('gen_medal_reboot','action','Medal Reboot','act_art','Revive 6HP','gen_reboot','#f0b820','Once per game: return a defeated friendly bot with 6 HP. Generic.'),
  // ═══ FORGE BARONS EQUIPMENT ENGINE ═══
  fb_sentry_drone:  C('fb_sentry_drone','equipment','Sentry Drone','eq_art','EOT: 1 dmg','fb_sentry','#e0a020','End of turn: deal 1 DMG to enemy active bot.'),
  fb_swarm_bay:     C('fb_swarm_bay','equipment','Swarm Bay','eq_art','SOT: 2 dmg','fb_swarm','#e0a020','Start of your turn: launch a drone dealing 2 DMG to enemy active.'),
  fb_corrosion:     C('fb_corrosion','equipment','Corrosion Plating','eq_art','Thorns 2','fb_corrosion','#c08040','When this bot is attacked, attacker takes 2 DMG.'),
  fb_autoloader:    C('fb_autoloader','equipment','Auto-Loader','eq_art','SOT: +1 Chg','fb_autoload','#e0a020','Start of your turn: this bot gains +1 Charge.'),
  fb_bellows:       C('fb_bellows','equipment','Forge Bellows','eq_art','SOT: draw','fb_bellows','#e0a020','Start of turn: if you have 2+ equipment in play, draw a card.'),
  fb_targeting:     C('fb_targeting','equipment','Targeting Array','eq_art','Pierce 2','fb_targeting','#e0a020','Start of turn: your next attack ignores 2 damage reduction.'),
  fb_repair_bay:    C('fb_repair_bay','equipment','Repair Bay','eq_art','EOT: heal 2','fb_repair','#40c0a0','End of your turn: heal this bot 2 HP.'),
  fb_overclock:     C('fb_overclock','equipment','Overclock Coil','eq_art','EOT: +1 ATK','fb_overclock','#e0a020','End of your turn: this bot gains +1 ATK permanently (max +4).'),
  fb_heat_vents:    C('fb_heat_vents','equipment','Heat Vents','eq_art','Retaliate','fb_heatvents','#f06424','End of turn: if this bot took damage, deal that much to one enemy.'),
  fb_conduit:       C('fb_conduit','equipment','Power Conduit','eq_art','3+: team ATK','fb_conduit','#e0a020','While you have 3+ equipment in play, all your bots +1 ATK.'),
  fb_forge_core:    C('fb_forge_core','equipment','Forge Core','eq_art','5+: pierce','fb_forgecore','#f0c040','While you have 5+ equipment in play, your attacks are unblockable.'),
  fb_master_forge:  C('fb_master_forge','equipment','Master Forge','eq_art','Scaling','fb_masterforge','#f0c040','On equip: draw a card. If 5+ equipment in play, equipped bot +2 ATK.'),
  fb_overforge_mf:  C('fb_overforge_mf','medaforce','Overforge','mf_art','2x ATK','mf_overforge','#f0c040','MEDAFORCE: double active bot ATK this turn. It loses all equipment after.'),

  // ── CROSS MESSIAH (Zero) cards ──
  cm_full_charge:   C('cm_full_charge','action','Full Charge','act_art','Max Charge','cm_fullcharge','#d8dde8','Instantly fill one of your bots to max Charge.'),
  cm_overcharge:    C('cm_overcharge','action','Overcharge','act_art','+3 Charge all','cm_overcharge','#7fc0ff','Give +3 Charge to your active bot and +1 to all allies.'),
  cm_charge_blade:  C('cm_charge_blade','technique','Charge Blade','earth_art','Charge melee','cm_blade','#d8dde8','Melee: deal +3, plus +1 per 2 Charge the attacker holds.'),
  cm_charge_buster: C('cm_charge_buster','technique','Charge Buster','fire_art','Charge shot','cm_buster','#b0b8c8','Ranged: deal +2, plus +2 if attacker is at 4+ Charge.'),
  cm_stag_sword:    C('cm_stag_sword','technique','Stag Sword','earth_art','+4 if 4+Chg','cm_stagsword','#a0c0ff','Deal +4 if the attacker is at 4+ Charge, otherwise +2.'),
  cm_kabuto_drive:  C('cm_kabuto_drive','technique','Kabuto Drive','fire_art','+5 spend Chg','cm_kabutodrive','#f0c040','Deal +5, then the attacker loses 3 Charge.'),
  cm_x_biped:       C('cm_x_biped','equipment','X-Biped','eq_art','+2 Charge cap feel','eq_resonator','#8090a0','Equip: this bot gains +1 extra Charge each turn.'),
  cm_zero_core:     C('cm_zero_core','equipment','Zero Core','eq_art','Charge engine','eq_resonator','#d8dde8','Equip: this bot gains +1 extra Charge each turn.'),
  cm_recharge:      C('cm_recharge','action','Recharge','act_art','+2 Charge draw','gen_recharge','#f0b820','Active bot +2 Charge. Draw a card if it ignites.'),
  cm_salvage:       C('cm_salvage','action','Scrap Salvage','act_art','Draw 2 disc 1','gen_salvage','#60c020','Draw 2 cards, then discard 1.'),
  cm_crossburst_mf: C('cm_crossburst_mf','medaforce','Cross Burst','mf_art','Charge nuke','mf_crossburst','#d8dde8','MEDAFORCE: deal damage equal to 3x the active bot Charge, then reset its Charge to 0.'),
  mc_cross_messiah: C('mc_cross_messiah','medachange','Cross Messiah Z','mc_card_art','+5ATK +12HP Overcharge','mc_bot_cross_messiah','#d8dde8','Fuse with Cross Messiah \u2014 tank mode. Doubles its Charge-scaling damage (Overcharge).'),

  mc_beetle_gun:    C('mc_beetle_gun','medachange','Seagaru Custom','mc_card_art','+5ATK +12HP','mc_bot_beetle_gun','#b0b8c8','Fuse with Seagaru \u2014 heavy gunner mode. Ranged Charge Buster scaling intensifies.'),
  mc_charge_corne:  C('mc_charge_corne','medachange','Moon Dragon Z','mc_card_art','+5ATK +12HP','mc_bot_charge_corne','#7fc0ff','Fuse with Moon Dragon \u2014 lunar ascension. Charge-support aura doubles.'),  cm_sky_volley:    C('cm_sky_volley','technique','Sky Volley','fire_art','Ranged +3/+5','cm_skyvolley','#b0b8c8','Seagaru ranged barrage: deal +3, or +5 if the attacker is at 4+ Charge.'),
  cm_lunar_repair:  C('cm_lunar_repair','action','Lunar Repair','act_art','Heal 5 +2 Chg','cm_lunarrepair','#7fc0ff','Moon Dragon support: heal one ally 5 HP and give it +2 Charge.'),
  fb_nano_mend:   C('fb_nano_mend','action','Nano-Mend','act_art','Heal 6','fb_nanomend','#40c0a0','Heal a bot 6 HP. If Neutranurse is in play, heal 9 instead.'),
  fb_field_weld:  C('fb_field_weld','action','Field Weld','act_art','Heal+Charge','fb_fieldweld','#40c0a0','Heal a bot 4 HP and give it +1 Charge.'),
  fb_scrap_blast: C('fb_scrap_blast','technique','Scrap Blast','wind_art','Sac: +5 DMG','fb_scrapblast','#a08060','Destroy one of your equipment: deal +5 DMG this attack.'),
  fb_salvage_strike: C('fb_salvage_strike','technique','Salvage Strike','earth_art','Sac: +3 draw','fb_salvagestrike','#a08060','Destroy one of your equipment: deal +3 DMG and draw a card.'),
  fb_overload_slam: C('fb_overload_slam','technique','Overload Slam','fire_art','Sac all: big hit','fb_overloadslam','#f06424','Destroy ALL your equipment: deal +2 DMG per equipment destroyed.'),



  // ── BLAZE EXCLUSIVE ──────────────────────────────────────────
  counter_strike:C('counter_strike','technique','Counter Strike','fire_art','+3 +Burn Back','deal3_counter','#f06424','Deal +3 dmg. If target attacks next turn, they take 3 burn damage first.'),
  heat_wave:     C('heat_wave','action','Heat Wave','fire_art','All Burn Tick','act_heatwave','#f06424','All burning enemies take 2 extra damage this turn. Free burn engine.'),
  overload:      C('overload','action','Overload','act_art','Next MF ×2','act_overload','#f06424','Your next Medaforce deals double damage. Lasts until fired.'),
  // ── TITAN EXCLUSIVE ──────────────────────────────────────────
  titan_call:    C('titan_call','action','Titan Call','act_art','Heal Team 2','act_titan_call','#8090a0','Heal ALL your bots for 2 HP. Doubled if Rokusho is active.'),
  predator_mark: C('predator_mark','action','Overload Surge','act_art','−2 All Chg','act_overload_surge','#2a80f0','Disrupt: every enemy bot loses 2 Charge.'),
  iron_wall:     C('iron_wall','trap','Iron Wall','eq_art','Block 4 DMG','trap_block','#8090a0','TRAP: Set face-down. The next attack against you deals 4 less damage (minimum 1).'),
  // ── DIGIMON COLLAB EXCLUSIVE CARDS ──────────────────────
  // WarGreymon exclusives
  dramon_strike: C('dramon_strike','technique','Dramon Strike','fire_art','+5 Claw','deal5_dramon','#f0c040','Deal +5 dmg. If target has equipment, deal +4 extra. Ignores all reduction.'),
  nova_force:    C('nova_force','technique','Nova Force','fire_art','+3 Fire All','deal3_nova','#f06424','Deal +3 dmg to target. All other enemies take 2 fire damage.'),
  // MetalGurumemon exclusives
  missile_volley:C('missile_volley','technique','Missile Volley','eq_art','+2 ×3 Hits','deal2_volley','#9050d0','Fire 3 missiles: deal 2 DMG to 3 random enemies (can hit same target).'),
  digi_overload: C('digi_overload','action','Digi Overload','act_art','Charge Burst','act_digiload','#9050d0','MetalGurumemon deals his full ATK to one enemy as bonus damage immediately.'),
  // Shared Digimon cards
  evolution_call:C('evolution_call','action','Evolution Call','act_art','Digi-Evolve','act_evolve','#00ff80','Draw 2, refund this action, and pull a Medachange from your deck to hand \u2014 evolve right now. Active Digimon also gains +2 Charge & +1 ATK.'),
  digi_shield:   C('digi_shield','trap','Digi Shield','eq_art','Negate+Counter','trap_digiblock','#00ff80','TRAP: Negate next attack. WarGreymon gains +2 Charge from the blocked strike.'),
  digi_bond:     C('digi_bond','equipment','Digi Bond','eq_art','+2 ATK shared','eq_digibond','#00ff80','Equipped bot gets +2 ATK. When this bot attacks, Omegaknight also gains +1 Charge.'),
  digistrike_mf: C('digistrike_mf','medaforce','DigiStrike','mf_art','Scaling','mf_digistrike','#00ff80','All three Digimon strike simultaneously for 6 unblockable dmg each, +2 per evolution performed this game.'),
  mc_wargreymon:     C('mc_wargreymon',    'medachange','WarGreymon Change',    'mc_card_art','+5ATK +12HP','mc_bot_wargreymon',    '#f04880','Fuse with WarGreymon: +5 ATK, +12 HP. Dramon Destroyer bonus +3→+6. Terra Force Last Stand activates immediately.'),
  mc_metalgurumemon: C('mc_metalgurumemon','medachange','MetalGuru Change',   'mc_card_art','+4ATK +12HP','mc_bot_metalgurumemon','#9050d0','Fuse with MetalGurumemon: +4 ATK, +12 HP. Missile Barrage fires 2 missiles per attack. Full Burst Last Stand activates immediately.'),
  // ── SHADOW BLADE — Chain/Combo deck ─────────────────────
  // Nin-Ninja techniques (dual-playable)
  shadow_slash:  C('shadow_slash', 'technique','Shadow Slash', 'wind_art', '+3 Chain',   'deal3_chain_free','#4080f0','Deal +3 dmg. This technique does NOT consume your technique play — Nin-Ninja can still use his second technique this turn.'),
  blade_dance:   C('blade_dance',  'technique','Blade Dance',  'wind_art', '+2 +2 Combo','deal2_combo',     '#4080f0','Deal +2 dmg. Gokudo gains +1 Combo counter this turn (+1 DMG on his next attack).'),
  phantom_cut:   C('phantom_cut',  'technique','Phantom Cut',  'wind_art', '+4 Exhaust', 'deal4_exhaust',   '#4080f0','Deal +4 dmg. Target cannot attack next turn.'),
  twin_strike:   C('twin_strike',  'technique','Twin Strike',  'wind_art', '+3 +Drain',  'deal3_drain',     '#4080f0','Deal +3 dmg. Target loses 2 Charge.'),
  // Foxuno techniques
  remedy_blade:  C('remedy_blade', 'technique','Remedy Blade', 'earth_art','+2 +Heal 2', 'deal2_heal',      '#40d898','Deal +2 dmg. Heal your lowest-HP ally for 2 HP.'),
  fox_fang:      C('fox_fang',     'technique','Fox Fang',     'earth_art','+3 +Draw',   'deal3_draw_chain','#40d898','Deal +3 dmg. Draw 1 card immediately.'),
  // Gokudo techniques
  cannon_blast:  C('cannon_blast', 'technique','Cannon Blast', 'fire_art', '+4 Combo',   'deal4_combo_boost','#f04020','Deal +4 dmg. Grants Gokudo an extra +2 Combo counter this turn.'),
  // Chain actions
  combo_chain:   C('combo_chain',  'action',   'Combo Chain',  'act_art',  'Draw+Combo', 'act_combo',       '#e060f0','Draw 2 cards. All Combo counters on Gokudo are preserved for next turn too.'),
  chain_boost:   C('chain_boost',  'action',   'Chain Boost',  'act_art',  '+2 Charge all','act_chain_chg', '#e060f0','All your bots gain +2 Charge. Karin passive counts this as 2 cards played.'),
  fox_medicine:  C('fox_medicine', 'action',   'Fox Medicine',  'act_art', 'Heal team 3','act_fox_heal',    '#40d898','Foxuno heals all allies for 3 HP. Foxuno gains +1 Charge.'),
  shadow_step:   C('shadow_step',  'action',   'Shadow Step',  'act_art',  'Free Combo', 'act_shadow_step', '#4080f0','Nin-Ninja may play one additional technique this turn for free. Resets the dual-technique counter.'),
  // Chain traps
  counter_blade: C('counter_blade','trap',     'Counter Blade','eq_art',   'Counter+Combo','trap_counterblade','#e060f0','TRAP: Negate next attack. Nin-Ninja gains a free technique play next turn.'),
  // Equipment
  ninja_scroll:  C('ninja_scroll', 'equipment','Ninja Scroll', 'eq_art',   '+2 ATK +Tech','eq_ninja_scroll','#4080f0','Equipped Shadow Blade bot: +2 ATK and may play a second technique each turn (the 2nd is free).'),
  combo_core:    C('combo_core',   'equipment','Combo Core',   'eq_art',   '+1 Combo/turn','eq_combo_core', '#e060f0','Gokudo equipped: gains +1 Combo counter automatically at start of each turn.'),
  // Chain Medaforce
  chain_strike:  C('chain_strike', 'medaforce','Chain Strike',  'mf_art',  '4+2/Tech',   'mf_chain_strike', '#e060f0','Deal 4 damage + 2 per technique played this match turn. Scales with chain length.'),
  // Medachange
  mc_nin_ninja:  C('mc_nin_ninja', 'medachange','Nin-Ninja Change','mc_card_art','+5ATK Shadow Clone','mc_bot_nin_ninja','#f04880','Fuse with Nin-Ninja: +5 ATK. Shadow Clone Last Stand activates. Second technique costs 0 always.'),
  mc_foxuno:     C('mc_foxuno',    'medachange','Foxuno Change', 'mc_card_art','+4ATK Fox Fire',   'mc_bot_foxuno',   '#f04880','Fuse with Foxuno: +4 ATK. Fox Fire Last Stand activates. Battle Remedy heals 4 HP.'),
  mc_gokudo:     C('mc_gokudo',    'medachange','Gokudo Change', 'mc_card_art','+5ATK Final Shot', 'mc_bot_gokudo',   '#f04880','Fuse with Gokudo: +5 ATK. Final Shot Last Stand activates. Combo Cannon doubled + pierce.'),
  // ── IRON THRONE — Robo Emperor solo deck ────────────────
  heavy_barrage: C('heavy_barrage','technique','Heavy Barrage','fire_art', '+6 Siege',  'deal6_siege',     '#60c030','Deal +6 dmg. Cannot be reduced below 3.'),
  cable_whip:    C('cable_whip',   'technique','Cable Whip',   'eq_art',   '+4 Drain2', 'deal4_drain2',    '#60c030','Deal +4 dmg and drain 2 Charge from the target.'),
  siege_shot:    C('siege_shot',   'technique','Siege Shot',   'fire_art', '+5 Pierce', 'deal5_siege_p',   '#60c030','Deal +5 dmg. Ignores all damage reduction.'),
  suppression:   C('suppression',  'technique','Suppression',  'eq_art',   '+3 Exhaust','deal3_suppress',  '#60c030','Deal +3 dmg. Target is exhausted next turn.'),
  throne_armor:  C('throne_armor', 'action',   'Throne Armor', 'act_art',  '+2 Reduce', 'act_throne_armor','#8090a0','Robo Emperor gains permanent +2 damage reduction this match (stacks).'),
  system_repair: C('system_repair','action',   'System Repair','act_art',  'Heal 6',    'act_sys_repair',  '#40d898','Robo Emperor heals 6 HP.'),
  overcharge:    C('overcharge',   'action',   'Overcharge',   'act_art',  '+3 Charge', 'act_overcharge',  '#f0b820','Robo Emperor gains +3 Charge immediately.'),
  emperor_decree:C('emperor_decree','action',  'Emperor Decree','act_art', 'Draw 3',    'act_emp_decree',  '#60c030','Draw 3 cards. The Emperor commands.'),
  cable_expand:  C('cable_expand', 'action',   'Cable Expand', 'act_art',  '2 Cable Hits','act_cable_exp', '#60c030','Immediately fire 2 cable strikes (2 DMG each to highest-charge enemies).'),
  iron_curtain:  C('iron_curtain', 'trap',     'Iron Curtain', 'eq_art',   'Block 5',   'trap_curtain',    '#8090a0','TRAP: The next attack against Robo Emperor deals 5 less damage (minimum 1).'),
  cannon_array:  C('cannon_array', 'equipment','Cannon Array', 'eq_art',   '+2 ATK Cable','eq_cannon_array','#60c030','Robo Emperor: +2 ATK and cable strikes deal 3 instead of 2.'),
  emperor_shield:C('emperor_shield','equipment','Emperor Shield','eq_art', '+3 Reduce', 'eq_emp_shield',   '#8090a0','Robo Emperor: takes 3 less damage from all attacks.'),
  imperial_barrage:C('imperial_barrage','medaforce','Imperial Barrage','mf_art','10 to All','mf_imperial','#60c030','Deal 10 damage split across all enemies, then fire 2 cable strikes.'),
  mc_robo_emperor:C('mc_robo_emperor','medachange','Emperor Ascension','mc_card_art','+8ATK +20HP','mc_bot_robo_emperor','#f04880','Fuse: +8 ATK, +20 HP. Cable Network fires 2 strikes per turn. Total Dominion activates.'),
  // ── ROYAL COURT — Omegaknight deck exclusives ───────────────
  // Techniques
  lance_charge:  C('lance_charge','technique','Lance Charge','fire_art','+5 Pierce','deal5_pierce','#f0c040','Deal +5 dmg. Ignores all damage reduction. Costs 2 Charge after use.'),
  royal_decree:  C('royal_decree','technique','Royal Decree','earth_art','+3 +Exhaust','deal3_exhaust','#f0c040','Deal +3 dmg. Target enemy cannot attack next turn.'),
  web_trap:      C('web_trap','technique','Web Trap','psi_art','+2 +Web','deal2_web','#9050d0','Deal +2 dmg. Target cannot switch for 3 turns.'),
  swift_strike:  C('swift_strike','technique','Swift Strike','wind_art','+4 First','deal4_first','#00c0e0','Deal +4 dmg. If target has more Charge than you, deal +2 extra.'),
  // Actions
  royal_summons: C('royal_summons','action','Royal Summons','act_art','Draw+Charge','act_royal','#f0c040','Draw 2 cards. All your bots gain +1 Charge.'),
  sacrifice_play:C('sacrifice_play','action','Sacrifice Play','act_art','Boost Omega','act_sacrifice','#f0c040','Your weakest bot takes 4 damage. Omegaknight gains +3 Charge and +2 ATK this turn.'),
  honor_guard:   C('honor_guard','trap','Honor Guard','eq_art','Redirect Hit','trap_honor','#f0c040','TRAP: When any ally takes damage, redirect it to Omegaknight instead.'),
  // Equipment
  royal_lance:   C('royal_lance','equipment','Royal Lance','eq_art','+3 ATK Pierce','eq_royal_lance','#f0c040','Equipped bot deals +3 DMG and pierces Titan reduction on all attacks.'),
  spider_web:    C('spider_web','equipment','Spider Web','eq_art','Web All','eq_spider_web','#9050d0','On equip: all CPU bots are webbed for 1 turn. Spidarman gains +1 ATK.'),
  // Medaforce
  royal_judgment:C('royal_judgment','medaforce','Royal Judgment','mf_art','8+Fallen','mf_royal','#f0c040','Deal 8 dmg + 3 per ally already defeated this match. Unblockable.'),
  // Medachange
  mc_omegaknight:C('mc_omegaknight','medachange','Omega Change','mc_card_art','+6ATK +12HP','mc_bot_omegaknight','#f04880','Fuse with Omegaknight: +6 ATK (highest). Vanguard redirects all hits. Sovereign always active. Losing = instant loss.'),
  // ═══ BLACK TIDE (pirate coin economy) ═══
  bt_plunderstrike: C('bt_plunderstrike','technique','Plunderstrike','fire_art','+3 DMG','bt_deal3_coin2','#d4a020','Deal 3 dmg and earn 2 Doubloons.'),
  bt_powder_keg:    C('bt_powder_keg','technique','Powder Keg','fire_art','AoE','bt_powderkeg','#e0603a','Spend up to 5 Doubloons. Deal 2 + 2 per coin spent to ALL enemies.'),
  bt_buried:        C('bt_buried','action','Buried Treasure','eq_art','+4 Coin','bt_bank4','#d4a020','Bank 4 Doubloons immediately.'),
  bt_raid:          C('bt_raid','action','Raid the Hold','eq_art','Draw 2','bt_raid','#c8a020','Spend 4 Doubloons: draw 2 cards and +1 charge on your active bot.'),
  bt_parry:         C('bt_parry','trap','Cutlass Parry','trap_art','Guard','bt_parry','#3aa0c0','When attacked: earn 2 Doubloons and reduce the damage by 3.'),
  bt_coin_cannon:   C('bt_coin_cannon','equipment','Coin Cannon','eq_art','+1 DMG','bt_coincannon','#d4a020','Equipped bot earns +1 Doubloon and deals +1 dmg on attack.'),
  bt_mc_piraskull:  C('bt_mc_piraskull','medachange','Piraskull Ω','mc_x','Transform','mc_bot_piraskull','#d4a020','Medachange Piraskull.'),
  bt_mc_taraba:     C('bt_mc_taraba','medachange','Pirastar Ω','mc_x','Transform','mc_bot_taraba_craba','#e0603a','Medachange Pirastar.'),
  bt_mc_tentaclam:  C('bt_mc_tentaclam','medachange','TentaClam Ω','mc_x','Transform','mc_bot_tentaclam','#3aa0c0','Medachange TentaClam.'),
  bt_broadside:     C('bt_broadside','medaforce','Win Medals','mf_art','Finisher','mf_broadside','#d4a020','Spend ALL Doubloons. Deal 4 + 2 per coin to one enemy.'),
  // ── SENBEI — The Remaining Cut (Stance / Resonance / Zanshin) ──
  sb_bound_stance:   C('sb_bound_stance','action','Bound Stance','act_art','Stance','act_sb_bound','#3a78c0','Activate Gobanko\u2019s Bound Stance. While active, +1 Resonance per turn.'),
  sb_exposed_stance: C('sb_exposed_stance','action','Exposed Stance','act_art','Stance','act_sb_exposed','#c0c0c0','Activate Samurai\u2019s Exposed Stance. While active, +1 Resonance per turn.'),
  sb_exec_stance:    C('sb_exec_stance','action','Execution Stance','act_art','Stance','act_sb_exec','#c83232','Activate Shinsaber\u2019s Execution Stance. While active, +1 Resonance per turn.'),
  sb_focus:          C('sb_focus','action','Focus','act_art','+1 Reson · Draw','act_sb_focus','#e8d0a0','Gain +1 Resonance and draw 1 card.'),
  sb_read:           C('sb_read','action','Read the Blade','act_art','Draw 2','act_sb_read','#e8d0a0','Draw 2 cards. If all three Stances are active, draw 3.'),
  sb_cut:            C('sb_cut','technique','Crossing Cut','wind_art','+4 / +6','deal_sb_cut','#c83232','Deal +4 dmg, or +6 if the attacker is in a Stance.'),
  sb_pierce:         C('sb_pierce','technique','Still Strike','earth_art','+5 ignore def','deal_sb_pierce','#c0c0c0','Deal +5 dmg, ignoring defense.'),
  sb_bind:           C('sb_bind','technique','Binding Edge','water_art','+3 Bound','deal_sb_bind','#3a78c0','Deal +3 dmg. Target is Bound (cannot defend next turn).'),
  sb_guard:          C('sb_guard','action','Remaining Guard','eq_art','Brace','act_sb_guard','#e8d0a0','Your bots take 2 less damage until your next turn. Protects the Zanshin sequence.'),
  sb_medal_locator:  C('sb_medal_locator','action','Sen\u2019s Insight','act_art','Find Zanshin','act_locate','#c83232','Search your deck for a Medaforce, reveal it, add to hand, shuffle. Once per game.'),
  zanshin_mf:        C('zanshin_mf','medaforce','Zanshin','mf_art','The Remaining Cut','mf_zanshin','#c83232','MEDAFORCE: Assign three Verdicts. Over the next two turns the cut resolves \u2014 Bound, Exposed, Execution \u2014 all at once. Requires Zanshin Threshold (3+ Resonance, all three alive).'),
  // Medachanges (one per Senbei bot)
  mc_kensho:    C('mc_kensho','medachange','Kensho Awakened','mc_card_art','Anchor+','mc_bot_kensho','#e8d0a0','Fuse: +2 ATK, +8 HP. Stances cost nothing and Verdicts may always be freely assigned.'),
  mc_gobanko:   C('mc_gobanko','medachange','Gobanko Unchained','mc_card_art','+4ATK','mc_bot_gobanko','#3a78c0','Fuse: +4 ATK, +6 HP. Bound also drains 2 Charge.'),
  mc_samurai:   C('mc_samurai','medachange','Samurai Unsheathed','mc_card_art','+4ATK','mc_bot_samurai','#c0c0c0','Fuse: +4 ATK, +6 HP. Exposed strips 2 defense tiers.'),
  mc_shinsaber: C('mc_shinsaber','medachange','Shinsaber True','mc_card_art','+5ATK','mc_bot_shinsaber','#c83232','Fuse: +5 ATK, +6 HP. Execution hits ignore healing done that turn.'),
};
function mkDeck(list){
  const d=[];
  list.forEach(([id,n])=>{const c=CDEFS[id];if(!c)return;for(let i=0;i<n;i++)d.push({...c,uid:uid()});});
  return shuffle(d);
}
const DECKS={
  // BLAZE CHAIN — 20 cards. Combo aggro. Chain techniques for massive burst damage.
  // Win condition: ignite fast, chain techniques, combo Medaforce + Medachange finish.
  // ── BLAZE CHAIN — 20 cards ─────────────────────────────
  // Identity: BURN COMBO AGGRO.
  // Core loop: Ignite → stack burn → Metabee passive bonus → Chain Spark chain
  // Win paths:
  //  A) Flame Whip spreads burn to all → Metabee passive fires on every bot
  //  B) Scorch on pre-burned target = 8 free damage → follow with Inferno 11
  //  C) Ember Bolt × 2 = ignite turn 3 → Medachange Arcbeetle → double attacks
  blaze:{bots:['metabee','sumilidon','warbandit'],mf:'ikki',
    deck:mkDeck([
      // Burn engine — the identity (8)
      ['hyper_missile',2],  // 6 dmg + 2 burn (heavy burn setter)
      ['flame_whip',2],     // 3 dmg + burn ALL enemies (spread setup)
      ['scorch',2],         // 2→8 dmg on burned target (payoff)
      ['ember_bolt',2],     // 1 dmg + burn + 2 charge (speed + setup)
      // Amplifiers (4)
      ['counter_strike',1], // EXCLUSIVE: punish then burn-trap
      ['heat_wave',1],      // EXCLUSIVE: burn tick turn acceleration
      ['overload',1],       // EXCLUSIVE: double Medaforce payoff
      ['medal_locator',1],  // tutor a Medaforce (once per game)
      ['guard_break',1],    // counter: negate an enemy attack
      // Medaforce payoffs (3)
      ['inferno_surge',2],  // 8 direct — ideal after burn softening
      ['thunder_barrage',1],// board clear on spread-burn setup
      // Equipment (2)
      ['medal_lens',1],     // MF +3 = Inferno 11
      ['fury_core',1],      // double attacks on Medachanged bot
      // Medachange closers (2)
      ['mc_metabee',1],     // +5ATK + burn passive = huge burst
      ['mc_arcbeetle',1],['mc_warbandit',1],   // double-atk threshold 2 — endless strikes
    ])},
  // TITAN GUARD — 20 cards. True control. Disrupt, suppress, grind to victory.
  // Win condition: drain opponent charge, heal through damage, lock with Earth Prison.
  titan:{bots:['rokusho','arcbeetle','machairodus'],mf:'henry',
    deck:mkDeck([
      // Disruption — the control engine (7 cards)
      ['medal_dampener',2], // drain enemy charge repeatedly
      ['iron_strike',2],    // attack + drain combo
      ['earth_prison',2],   // exhaust all — full lockdown
      // Sustain — staying alive (4 cards)
      ['tidal_rush',2],     // heal + damage
      ['ghost_shell',1],    // revive equipment
      ['resonator',1],      // charge engine
      // Medaforce — control payoffs (2 cards)
      ['x_burst',1],        // fusion Medaforce: empowered by Masterbeetle
      ['master_cannon',1],  // fusion Medaforce: Prominence Railgun (Master form)
      // Medachange (2 cards)
      ['mc_rokusho',1],
      ['mc_machairodus',1],
      // Utility (3 cards)
      ['medal_locator',1],  // tutor a Medaforce (once per game)
      ['null_field',1],     // counter: cancel enemy Medaforce
      ['mirror_plate',1],   // counter: reflect an attack
      ['titan_call',1],     // EXCLUSIVE: heal whole team
      ['predator_mark',1],  // EXCLUSIVE: Machairodus +4 DMG setup
      ['iron_wall',1],      // EXCLUSIVE: damage reduction trap
    ])},
  // ── SHADOW BLADE ─────────────────────────────────────────
  shadow:{bots:['nin_ninja','foxuno','gokudo'],mf:'karin',
    deck:mkDeck([
      // Nin-Ninja techniques — dual-playable (8)
      ['shadow_slash',2],  // free technique — preserves dual-tech
      ['blade_dance',2],   // +2 + Gokudo combo feed
      ['phantom_cut',2],   // +4 exhaust control
      ['twin_strike',1],   // +3 drain (balance: -1)
      ['medal_locator',1], // MF consistency tutor
      // Foxuno techniques (2)
      ['remedy_blade',1],  // +2 + heal
      // Gokudo technique (1)
      // Chain actions (4)
      ['combo_chain',1],   // draw 2 + combo persist
      ['chain_boost',1],   // all +2 charge
      ['fox_medicine',1],  // heal team 3
      ['shadow_step',1],   // Nin-Ninja free extra tech
      // Trap (1)
      ['counter_blade',1], // negate + free tech
      // Equipment (2)
      ['ninja_scroll',1],  // Nin-Ninja +2 ATK + free 2nd tech
      ['combo_core',1],    // Gokudo +1 combo/turn
      // Medaforce (1)
      ['chain_strike',1],  // scales with chain length
      // Medachange (3)
      ['mc_nin_ninja',1],
      ['mc_foxuno',1],
      ['mc_gokudo',1],
    ])},
  // ── IRON THRONE (Robo Emperor solo) ─────────────────────
  throne:{bots:['robo_emperor'],mf:'seaslug',
    deck:mkDeck([
      // Techniques (8)
      ['heavy_barrage',2],   // +6 siege
      ['cable_whip',2],      // +4 drain
      ['siege_shot',2],      // +5 pierce
      ['suppression',2],     // +3 exhaust
      // Actions (7)
      ['throne_armor',2],    // permanent reduction
      ['system_repair',1],   // heal 6 (balance: -1)
      ['medal_locator',1],   // MF consistency tutor
      ['overcharge',1],      // +3 charge
      ['emperor_decree',1],  // draw 3
      ['cable_expand',1],    // 2 cable strikes
      // Traps (1)
      ['iron_curtain',1],    // -5 next attack
      // Equipment (2)
      ['cannon_array',1],    // +2 ATK + cable boost
      ['emperor_shield',1],  // -3 all damage
      // Medaforce (1)
      ['imperial_barrage',1],// 10 split + cables
      // Medachange (1)
      ['mc_robo_emperor',1], // ascension
    ])},
  // ── ROYAL COURT ─────────────────────────────────────────
  royal:{bots:['omegaknight','wargreymon','metalgurumemon'],mf:'tai',
    deck:mkDeck([
      // Core techniques (8)
      ['lance_charge',2],    // Omegaknight pierce identity
      ['dramon_strike',2],   // WarGreymon signature — +5/+9 vs equipped
      ['nova_force',1],      // WarGreymon AoE fire splash
      ['missile_volley',1],  // MetalGurumemon scatter missiles
      // Actions (5)
      ['royal_summons',1],   // draw 2 + all +1 charge (balance: -1)
      ['medal_locator',1],   // MF consistency tutor
      ['evolution_call',2],  // Digi-Evolve: draw 2 + perm buff
      ['digi_overload',1],   // MetalGurumemon burst bonus damage
      // Traps (2)
      ['honor_guard',1],     // redirect damage to Omegaknight
      ['digi_shield',1],     // EXCLUSIVE: negate + WarGreymon +2 charge
      // Equipment (2)
      ['digi_bond',1],       // EXCLUSIVE: +2 ATK + Omegaknight charges
      ['royal_lance',1],     // Omegaknight pierce lance
      // Medaforce (2)
      ['digistrike_mf',2],      // EXCLUSIVE: all 3 strike for 6 each
      // Medachange (3 — one per bot)
      ['mc_omegaknight',1],     // Omegaknight — Sovereign always active
      ['mc_wargreymon',1],      // WarGreymon — Dramon bonus doubles
      ['mc_metalgurumemon',1],  // MetalGurumemon — double missile barrage
    ])},
  forge:{bots:['grand_beetle','neutranurse','blackram'],mf:'kasumi',
    deck:mkDeck([
      // Equipment engine (6 — trimmed for medachange)
      ['fb_sentry_drone',1],['fb_autoloader',1],['fb_overclock',1],
      ['fb_conduit',1],['fb_forge_core',1],['fb_targeting',1],
      // Medachange — fuse with a Forge bot (3)
      ['mc_grand_beetle',1],['mc_neutranurse',1],['mc_blackram',1],
      // Healing for Neutranurse (2)
      ['fb_nano_mend',1],['fb_field_weld',1],
      // Blackram sacrifice techniques (3)
      ['fb_scrap_blast',1],['fb_salvage_strike',1],['fb_overload_slam',1],
      // Generic techniques (1)
      ['iron_strike',1],
      // Actions (3)
      ['gen_salvage',1],['medal_locator',1],['gen_recharge',1],
      // Medaforce (2)
      ['fb_overforge_mf',1],['inferno_surge',1],
    ])},
  cross:{bots:['cross_messiah','charge_corne','beetle_gun'],mf:'nova_pilot',
    deck:mkDeck([
      // Charge generation (5)
      ['cm_full_charge',1],['cm_overcharge',1],['cm_recharge',1],['cm_x_biped',1],['cm_zero_core',1],
      // Charge-scaling attacks (6)
      ['cm_charge_blade',1],['cm_charge_buster',1],['cm_stag_sword',1],['cm_sky_volley',1],['cm_kabuto_drive',1],['cm_stag_sword',1],
      // Medachange (3)
      ['mc_cross_messiah',1],['mc_beetle_gun',1],['mc_charge_corne',1],
      // Support / utility (2)
      ['cm_lunar_repair',1],['cm_salvage',1],
      // Medaforce (4)
      ['cm_crossburst_mf',1],['cm_crossburst_mf',1],['thunder_barrage',1],['cm_crossburst_mf',1],
    ])},
  // ── SENBEI: THE REMAINING CUT (Kensho · Gobanko · Samurai · Shinsaber) ──
  // Identity: STANCE CONTROL → ZANSHIN FINISHER.
  // Loop: hold Stances → bank Resonance → reach Threshold → fire Zanshin →
  //       survive the Interval → the Cut lands on three targets at once.
  senbei:{bots:['gobanko','kensho','samurai','shinsaber'],mf:'master_sen',
    deck:mkDeck([
      // Stances (the engine — 1 each, Kensho keeps them free to hold)
      ['sb_bound_stance',1],['sb_exposed_stance',1],['sb_exec_stance',1],
      // Resonance / card flow (5)
      ['sb_focus',2],['sb_read',2],['sb_medal_locator',1],
      // Techniques (6)
      ['sb_cut',2],['sb_pierce',2],['sb_bind',2],
      // Protection for the sequence (2)
      ['sb_guard',2],
      // Medachange (4 — one per bot)
      ['mc_kensho',1],['mc_gobanko',1],['mc_samurai',1],['mc_shinsaber',1],
      // Medaforce — the payoff (1)
      ['zanshin_mf',1],
    ])},
  blacktide:{bots:['piraskull','taraba_craba','tentaclam'],mf:'redbeard',
    deck:mkDeck([
      // Coin economy + offense (techniques)
      ['bt_plunderstrike',3],['bt_powder_keg',2],
      // Actions
      ['bt_buried',2],['bt_raid',2],
      // Trap + equipment
      ['bt_parry',2],['bt_coin_cannon',2],
      // Medachanges (one per bot)
      ['bt_mc_piraskull',1],['bt_mc_taraba',1],['bt_mc_tentaclam',1],
      // Medaforce
      ['bt_broadside',1],['bt_broadside',1],['bt_broadside',1],
    ])},
};

