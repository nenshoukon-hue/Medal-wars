// ═══ BOT ART — improved cel-shaded anime style ═══
const ART={
metabee:(w,h)=>`<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="mbg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a1a06"/><stop offset="1" stop-color="#1a0602"/></linearGradient></defs>
  <rect width="${w}" height="${h}" fill="url(#mbg)"/>
  <ellipse cx="${w/2}" cy="${h*.9}" rx="${w*.35}" ry="${h*.06}" fill="#000" opacity=".4"/>
  <rect x="${w*.3}" y="${h*.18}" width="${w*.4}" height="${h*.52}" rx="${w*.08}" fill="#c84a18"/>
  <rect x="${w*.34}" y="${h*.22}" width="${w*.32}" height="${h*.44}" rx="${w*.06}" fill="#e0621e"/>
  <rect x="${w*.3}" y="${h*.18}" width="${w*.4}" height="${h*.1}" rx="${w*.06}" fill="#d85520"/>
  <rect x="${w*.36}" y="${h*.14}" width="${w*.28}" height="${h*.09}" rx="${h*.04}" fill="#b83a10"/>
  <rect x="${w*.38}" y="${h*.16}" width="${w*.24}" height="${h*.06}" rx="${h*.03}" fill="#e8621e"/>
  <ellipse cx="${w*.38}" cy="${h*.42}" rx="${w*.1}" ry="${h*.11}" fill="#1a0802"/>
  <ellipse cx="${w*.62}" cy="${h*.42}" rx="${w*.1}" ry="${h*.11}" fill="#1a0802"/>
  <ellipse cx="${w*.38}" cy="${h*.41}" rx="${w*.07}" ry="${h*.08}" fill="#ff7030"/>
  <ellipse cx="${w*.62}" cy="${h*.41}" rx="${w*.07}" ry="${h*.08}" fill="#ff7030"/>
  <ellipse cx="${w*.38}" cy="${h*.41}" rx="${w*.03}" ry="${h*.04}" fill="#fff" opacity=".7"/>
  <ellipse cx="${w*.62}" cy="${h*.41}" rx="${w*.03}" ry="${h*.04}" fill="#fff" opacity=".7"/>
  <rect x="${w*.36}" y="${h*.54}" width="${w*.28}" height="${h*.04}" rx="2" fill="#b83a10"/>
  <rect x="${w*.16}" y="${h*.42}" width="${w*.14}" height="${h*.28}" rx="${w*.04}" fill="#b83a10" transform="rotate(-20 ${w*.16} ${h*.42})"/>
  <rect x="${w*.18}" y="${h*.43}" width="${w*.1}" height="${h*.22}" rx="${w*.03}" fill="#c84a18" transform="rotate(-20 ${w*.18} ${h*.43})"/>
  <rect x="${w*.7}" y="${h*.42}" width="${w*.14}" height="${h*.28}" rx="${w*.04}" fill="#b83a10" transform="rotate(20 ${w*.7} ${h*.42})"/>
  <rect x="${w*.72}" y="${h*.43}" width="${w*.1}" height="${h*.22}" rx="${w*.03}" fill="#c84a18" transform="rotate(20 ${w*.72} ${h*.43})"/>
  <rect x="${w*.38}" y="${h*.7}" width="${w*.1}" height="${h*.18}" rx="${w*.04}" fill="#b83a10"/>
  <rect x="${w*.52}" y="${h*.7}" width="${w*.1}" height="${h*.18}" rx="${w*.04}" fill="#b83a10"/>
  <rect x="${w*.36}" y="${h*.72}" width="${w*.28}" height="${h*.06}" rx="2" fill="#e0621e"/>
  <rect x="0" y="${h*.94}" width="${w}" height="${h*.06}" fill="#e8621e" opacity=".4"/>
</svg>`,
arcbeetle:(w,h)=>`<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="abg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#041630"/><stop offset="1" stop-color="#010810"/></linearGradient></defs>
  <rect width="${w}" height="${h}" fill="url(#abg)"/>
  <ellipse cx="${w/2}" cy="${h*.9}" rx="${w*.35}" ry="${h*.06}" fill="#000" opacity=".4"/>
  <rect x="${w*.32}" y="${h*.54}" width="${w*.36}" height="${h*.08}" rx="3" fill="#1a5a9a"/>
  <rect x="${w*.26}" y="${h*.14}" width="${w*.08}" height="${h*.16}" rx="3" fill="#2a7acc" transform="rotate(-12 ${w*.26} ${h*.14})"/>
  <rect x="${w*.66}" y="${h*.14}" width="${w*.08}" height="${h*.16}" rx="3" fill="#2a7acc" transform="rotate(12 ${w*.66} ${h*.14})"/>
  <rect x="${w*.34}" y="${h*.2}" width="${w*.32}" height="${h*.46}" rx="${w*.06}" fill="#1a3a6a"/>
  <rect x="${w*.36}" y="${h*.22}" width="${w*.28}" height="${h*.4}" rx="${w*.05}" fill="#1e4a80"/>
  <rect x="${w*.34}" y="${h*.2}" width="${w*.32}" height="${h*.1}" rx="${w*.05}" fill="#245590"/>
  <rect x="${w*.42}" y="${h*.14}" width="${w*.16}" height="${h*.08}" rx="3" fill="#1e5080"/>
  <ellipse cx="${w*.38}" cy="${h*.4}" rx="${w*.1}" ry="${h*.11}" fill="#030c18"/>
  <ellipse cx="${w*.62}" cy="${h*.4}" rx="${w*.1}" ry="${h*.11}" fill="#030c18"/>
  <ellipse cx="${w*.38}" cy="${h*.39}" rx="${w*.07}" ry="${h*.08}" fill="#3a8aee"/>
  <ellipse cx="${w*.62}" cy="${h*.39}" rx="${w*.07}" ry="${h*.08}" fill="#3a8aee"/>
  <ellipse cx="${w*.38}" cy="${h*.39}" rx="${w*.03}" ry="${h*.04}" fill="#a0d4ff" opacity=".9"/>
  <ellipse cx="${w*.62}" cy="${h*.39}" rx="${w*.03}" ry="${h*.04}" fill="#a0d4ff" opacity=".9"/>
  <rect x="${w*.18}" y="${h*.44}" width="${w*.14}" height="${h*.26}" rx="${w*.04}" fill="#14386a" transform="rotate(-15 ${w*.18} ${h*.44})"/>
  <rect x="${w*.68}" y="${h*.44}" width="${w*.14}" height="${h*.26}" rx="${w*.04}" fill="#14386a" transform="rotate(15 ${w*.68} ${h*.44})"/>
  <rect x="${w*.36}" y="${h*.7}" width="${w*.12}" height="${h*.18}" rx="3" fill="#14386a"/>
  <rect x="${w*.52}" y="${h*.7}" width="${w*.12}" height="${h*.18}" rx="3" fill="#14386a"/>
  <rect x="0" y="${h*.94}" width="${w}" height="${h*.06}" fill="#3a8aee" opacity=".4"/>
</svg>`,
warbandit:(w,h)=>`<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="wbg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#150a28"/><stop offset="1" stop-color="#060310"/></linearGradient></defs>
  <rect width="${w}" height="${h}" fill="url(#wbg)"/>
  <ellipse cx="${w/2}" cy="${h*.9}" rx="${w*.35}" ry="${h*.06}" fill="#000" opacity=".4"/>
  <polygon points="${w/2},${h*.08} ${w*.58},${h*.2} ${w*.68},${h*.12} ${w*.64},${h*.26} ${w/2},${h*.24} ${w*.36},${h*.26} ${w*.32},${h*.12} ${w*.42},${h*.2}" fill="#3a2870"/>
  <polygon points="${w*.22},${h*.14} ${w*.36},${h*.22} ${w*.3},${h*.36} ${w*.16},${h*.28}" fill="#2e2060"/>
  <polygon points="${w*.78},${h*.14} ${w*.64},${h*.22} ${w*.7},${h*.36} ${w*.84},${h*.28}" fill="#2e2060"/>
  <rect x="${w*.3}" y="${h*.24}" width="${w*.4}" height="${h*.44}" rx="${w*.07}" fill="#2a1850"/>
  <rect x="${w*.33}" y="${h*.27}" width="${w*.34}" height="${h*.38}" rx="${w*.06}" fill="#342068"/>
  <rect x="${w*.3}" y="${h*.24}" width="${w*.4}" height="${h*.1}" rx="${w*.06}" fill="#3a2878"/>
  <ellipse cx="${w*.38}" cy="${h*.42}" rx="${w*.1}" ry="${h*.11}" fill="#0a0616"/>
  <ellipse cx="${w*.62}" cy="${h*.42}" rx="${w*.1}" ry="${h*.11}" fill="#0a0616"/>
  <ellipse cx="${w*.38}" cy="${h*.41}" rx="${w*.07}" ry="${h*.08}" fill="#8870e0"/>
  <ellipse cx="${w*.62}" cy="${h*.41}" rx="${w*.07}" ry="${h*.08}" fill="#8870e0"/>
  <ellipse cx="${w*.38}" cy="${h*.4}" rx="${w*.03}" ry="${h*.04}" fill="#d0c0ff" opacity=".9"/>
  <ellipse cx="${w*.62}" cy="${h*.4}" rx="${w*.03}" ry="${h*.04}" fill="#d0c0ff" opacity=".9"/>
  <rect x="${w*.16}" y="${h*.46}" width="${w*.14}" height="${h*.28}" rx="${w*.04}" fill="#241860" transform="rotate(-10 ${w*.16} ${h*.46})"/>
  <rect x="${w*.7}" y="${h*.46}" width="${w*.14}" height="${h*.28}" rx="${w*.04}" fill="#241860" transform="rotate(10 ${w*.7} ${h*.46})"/>
  <rect x="${w*.37}" y="${h*.7}" width="${w*.1}" height="${h*.18}" rx="3" fill="#241860"/>
  <rect x="${w*.53}" y="${h*.7}" width="${w*.1}" height="${h*.18}" rx="3" fill="#241860"/>
  <rect x="${w*.36}" y="${h*.58}" width="${w*.28}" height="${h*.04}" rx="2" fill="#3a2878"/>
  <rect x="0" y="${h*.94}" width="${w}" height="${h*.06}" fill="#8870e0" opacity=".4"/>
</svg>`,
rokusho:(w,h)=>`<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="rkbg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#181c20"/><stop offset="1" stop-color="#080a0c"/></linearGradient></defs>
  <rect width="${w}" height="${h}" fill="url(#rkbg)"/>
  <ellipse cx="${w/2}" cy="${h*.9}" rx="${w*.38}" ry="${h*.06}" fill="#000" opacity=".5"/>
  <rect x="${w*.22}" y="${h*.32}" width="${w*.56}" height="${h*.52}" rx="${w*.06}" fill="#2a3038"/>
  <rect x="${w*.25}" y="${h*.35}" width="${w*.5}" height="${h*.46}" rx="${w*.05}" fill="#343c46"/>
  <rect x="${w*.22}" y="${h*.18}" width="${w*.56}" height="${h*.18}" rx="${w*.06}" fill="#3a424e"/>
  <rect x="${w*.25}" y="${h*.2}" width="${w*.5}" height="${h*.14}" rx="${w*.05}" fill="#444e5c"/>
  <rect x="${w*.28}" y="${h*.22}" width="${w*.44}" height="${h*.08}" rx="3" fill="#555f70" opacity=".6"/>
  <rect x="${w*.3}" y="${h*.24}" width="${w*.4}" height="${h*.05}" rx="2" fill="#888fa0" opacity=".5"/>
  <ellipse cx="${w*.34}" cy="${h*.28}" rx="${w*.07}" ry="${h*.06}" fill="#888780"/>
  <ellipse cx="${w*.66}" cy="${h*.28}" rx="${w*.07}" ry="${h*.06}" fill="#888780"/>
  <ellipse cx="${w*.34}" cy="${h*.28}" rx="${w*.04}" ry="${h*.04}" fill="#c0c8d0" opacity=".9"/>
  <ellipse cx="${w*.66}" cy="${h*.28}" rx="${w*.04}" ry="${h*.04}" fill="#c0c8d0" opacity=".9"/>
  <rect x="${w*.42}" y="${h*.28}" width="${w*.16}" height="${h*.06}" rx="2" fill="#888fa0" opacity=".5"/>
  <rect x="${w*.14}" y="${h*.38}" width="${w*.2}" height="${h*.4}" rx="${w*.05}" fill="#262e38"/>
  <rect x="${w*.16}" y="${h*.4}" width="${w*.16}" height="${h*.36}" rx="${w*.04}" fill="#2e3840"/>
  <rect x="${w*.66}" y="${h*.38}" width="${w*.2}" height="${h*.4}" rx="${w*.05}" fill="#262e38"/>
  <rect x="${w*.68}" y="${h*.4}" width="${w*.16}" height="${h*.36}" rx="${w*.04}" fill="#2e3840"/>
  <rect x="${w*.16}" y="${h*.66}" width="${w*.16}" height="${h*.08}" rx="2" fill="#888fa0" opacity=".4"/>
  <rect x="${w*.68}" y="${h*.66}" width="${w*.16}" height="${h*.08}" rx="2" fill="#888fa0" opacity=".4"/>
  <rect x="0" y="${h*.94}" width="${w}" height="${h*.06}" fill="#888780" opacity=".4"/>
</svg>`,
sumilidon:(w,h)=>`<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="slbg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#031814"/><stop offset="1" stop-color="#010808"/></linearGradient></defs>
  <rect width="${w}" height="${h}" fill="url(#slbg)"/>
  <ellipse cx="${w/2}" cy="${h*.9}" rx="${w*.35}" ry="${h*.06}" fill="#000" opacity=".4"/>
  <rect x="${w*.14}" y="${h*.28}" width="${w*.1}" height="${h*.28}" rx="4" fill="#0a4030" transform="rotate(-32 ${w*.14} ${h*.28})"/>
  <rect x="${w*.76}" y="${h*.28}" width="${w*.1}" height="${h*.28}" rx="4" fill="#0a4030" transform="rotate(32 ${w*.76} ${h*.28})"/>
  <rect x="${w*.3}" y="${h*.22}" width="${w*.4}" height="${h*.48}" rx="${w*.07}" fill="#0c3828"/>
  <rect x="${w*.33}" y="${h*.25}" width="${w*.34}" height="${h*.42}" rx="${w*.06}" fill="#104830"/>
  <rect x="${w*.3}" y="${h*.22}" width="${w*.4}" height="${h*.1}" rx="${w*.06}" fill="#145840"/>
  <ellipse cx="${w*.38}" cy="${h*.4}" rx="${w*.1}" ry="${h*.12}" fill="#020c08"/>
  <ellipse cx="${w*.62}" cy="${h*.4}" rx="${w*.1}" ry="${h*.12}" fill="#020c08"/>
  <ellipse cx="${w*.38}" cy="${h*.39}" rx="${w*.07}" ry="${h*.09}" fill="#10c090"/>
  <ellipse cx="${w*.62}" cy="${h*.39}" rx="${w*.07}" ry="${h*.09}" fill="#10c090"/>
  <ellipse cx="${w*.38}" cy="${h*.38}" rx="${w*.03}" ry="${h*.04}" fill="#80ffd8" opacity=".9"/>
  <ellipse cx="${w*.62}" cy="${h*.38}" rx="${w*.03}" ry="${h*.04}" fill="#80ffd8" opacity=".9"/>
  <path d="M${w*.34} ${h*.56} Q${w/2} ${h*.64} ${w*.66} ${h*.56}" fill="none" stroke="#0a6040" stroke-width="2.5" stroke-linecap="round"/>
  <rect x="${w*.2}" y="${h*.48}" width="${w*.14}" height="${h*.32}" rx="${w*.04}" fill="#0a3828" transform="rotate(-14 ${w*.2} ${h*.48})"/>
  <rect x="${w*.66}" y="${h*.48}" width="${w*.14}" height="${h*.32}" rx="${w*.04}" fill="#0a3828" transform="rotate(14 ${w*.66} ${h*.48})"/>
  <rect x="${w*.36}" y="${h*.7}" width="${w*.12}" height="${h*.18}" rx="3" fill="#0a3828"/>
  <rect x="${w*.52}" y="${h*.7}" width="${w*.12}" height="${h*.18}" rx="3" fill="#0a3828"/>
  <rect x="0" y="${h*.94}" width="${w}" height="${h*.06}" fill="#10c090" opacity=".4"/>
</svg>`,

robo_emperor:(w,h)=>`<svg width="${w}" height="${h}" viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="re-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#0a0810"/><stop offset="100%" stop-color="#020204"/></linearGradient>
    <linearGradient id="re-green" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#60c030"/><stop offset="100%" stop-color="#308010"/></linearGradient>
    <linearGradient id="re-purp" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#9050c0"/><stop offset="100%" stop-color="#502880"/></linearGradient>
    <linearGradient id="re-steel" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#d0d8e0"/><stop offset="100%" stop-color="#8090a0"/></linearGradient>
    <radialGradient id="re-eye" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#ff2020"/><stop offset="100%" stop-color="#80101000"/></radialGradient>
  </defs>
  <rect width="200" height="200" fill="url(#re-bg)"/>
  <!-- Cable nest at base -->
  <g opacity=".85">
    <path d="M 10,180 Q 50,150 100,175 Q 150,150 190,180" stroke="#181818" stroke-width="9" fill="none"/>
    <path d="M 5,190 Q 60,165 100,185 Q 140,165 195,190" stroke="#202020" stroke-width="8" fill="none"/>
    <path d="M 20,172 Q 70,195 120,170 Q 160,185 185,168" stroke="#161616" stroke-width="7" fill="none"/>
    <path d="M 15,185 Q 80,200 140,182 Q 170,192 190,178" stroke="#1c1c1c" stroke-width="8" fill="none"/>
    <path d="M 30,165 Q 90,188 150,165" stroke="#222" stroke-width="6" fill="none"/>
    <!-- cable bands -->
    <rect x="48" y="170" width="6" height="3" rx="1" fill="#c0392b"/>
    <rect x="92" y="178" width="6" height="3" rx="1" fill="#c0c0c0"/>
    <rect x="138" y="172" width="6" height="3" rx="1" fill="#c0392b"/>
    <rect x="70" y="184" width="6" height="3" rx="1" fill="#c0c0c0"/>
  </g>
  <!-- Lower body — purple core nestled in cables -->
  <ellipse cx="100" cy="150" rx="40" ry="32" fill="url(#re-purp)"/>
  <ellipse cx="100" cy="146" rx="32" ry="25" fill="#6838a0" opacity=".6"/>
  <!-- Green chest plate with red LED display -->
  <rect x="76" y="110" width="48" height="40" rx="8" fill="url(#re-green)"/>
  <rect x="80" y="116" width="40" height="22" rx="4" fill="#101810"/>
  <!-- Red LED dots (3x3 grid) -->
  <g fill="#ff3020">
    <circle cx="88" cy="122" r="2.5"/><circle cx="100" cy="122" r="2.5"/><circle cx="112" cy="122" r="2.5"/>
    <circle cx="88" cy="130" r="2.5"/><circle cx="100" cy="130" r="2.5"/><circle cx="112" cy="130" r="2.5"/>
  </g>
  <!-- Triple barrel cannon on back/shoulder -->
  <g transform="rotate(-28 130 80)">
    <rect x="120" y="40" width="14" height="55" rx="5" fill="url(#re-purp)"/>
    <rect x="118" y="34" width="8" height="14" rx="3" fill="#403050"/>
    <rect x="128" y="34" width="8" height="14" rx="3" fill="#403050"/>
    <ellipse cx="122" cy="36" rx="3" ry="4" fill="#201828"/>
    <ellipse cx="132" cy="36" rx="3" ry="4" fill="#201828"/>
    <!-- barrel bands -->
    <rect x="119" y="60" width="16" height="4" rx="1" fill="#c0392b"/>
    <rect x="119" y="74" width="16" height="4" rx="1" fill="#d0d8e0"/>
  </g>
  <!-- Missile magazine box (left arm) -->
  <g transform="rotate(-12 50 105)">
    <rect x="28" y="92" width="34" height="30" rx="4" fill="url(#re-steel)"/>
    <rect x="30" y="94" width="30" height="26" rx="3" fill="#b0b8c0"/>
    <!-- red/white hazard stripes -->
    <path d="M 32,96 L 40,96 L 32,104 Z" fill="#c0392b"/>
    <path d="M 42,96 L 50,96 L 38,108 L 32,108 Z" fill="#c0392b"/>
    <path d="M 52,96 L 58,96 L 44,110 L 38,110 Z" fill="#c0392b"/>
    <!-- missile tips -->
    <circle cx="35" cy="116" r="2.5" fill="#c0392b"/><circle cx="42" cy="116" r="2.5" fill="#c0392b"/>
    <circle cx="49" cy="116" r="2.5" fill="#c0392b"/><circle cx="56" cy="116" r="2.5" fill="#c0392b"/>
  </g>
  <!-- Right claw arm -->
  <g transform="rotate(20 158 120)">
    <rect x="150" y="108" width="22" height="14" rx="6" fill="url(#re-green)"/>
    <rect x="168" y="104" width="6" height="10" rx="2" fill="url(#re-steel)"/>
    <rect x="168" y="116" width="6" height="10" rx="2" fill="url(#re-steel)"/>
    <ellipse cx="174" cy="110" rx="4" ry="3" fill="#d0d8e0"/>
    <ellipse cx="174" cy="120" rx="4" ry="3" fill="#d0d8e0"/>
  </g>
  <!-- Head — armored skull-like with single red eye -->
  <path d="M 74,72 Q 72,44 100,40 Q 128,44 126,72 Q 126,92 100,94 Q 74,92 74,72Z" fill="url(#re-steel)"/>
  <path d="M 78,70 Q 76,48 100,44 Q 124,48 122,70 Q 122,88 100,90 Q 78,88 78,70Z" fill="#c0c8d0" opacity=".7"/>
  <!-- Head crest / antennae -->
  <rect x="86" y="28" width="3" height="16" fill="#808890"/>
  <rect x="111" y="28" width="3" height="16" fill="#808890"/>
  <circle cx="87" cy="27" r="2" fill="#60c030"/>
  <circle cx="112" cy="27" r="2" fill="#60c030"/>
  <!-- Big single red eye -->
  <ellipse cx="100" cy="66" rx="14" ry="11" fill="#201018"/>
  <ellipse cx="100" cy="66" rx="9" ry="7" fill="url(#re-eye)"/>
  <ellipse cx="100" cy="66" rx="5" ry="4" fill="#ff4030"/>
  <ellipse cx="98" cy="64" rx="2" ry="2" fill="#ffa090"/>
  <!-- Jaw/grille -->
  <rect x="86" y="80" width="28" height="10" rx="3" fill="#303840"/>
  <g stroke="#505860" stroke-width="1">
    <line x1="91" y1="80" x2="91" y2="90"/><line x1="96" y1="80" x2="96" y2="90"/>
    <line x1="101" y1="80" x2="101" y2="90"/><line x1="106" y1="80" x2="106" y2="90"/>
    <line x1="111" y1="80" x2="111" y2="90"/>
  </g>
  <!-- Sensor tentacle with camera eye -->
  <path d="M 130,95 Q 165,80 168,50" stroke="#181818" stroke-width="5" fill="none"/>
  <circle cx="168" cy="46" r="9" fill="url(#re-steel)"/>
  <circle cx="168" cy="46" r="5" fill="#202830"/>
  <circle cx="168" cy="46" r="2.5" fill="#60c0ff"/>
  <!-- Power aura -->
  <ellipse cx="100" cy="120" rx="85" ry="70" fill="url(#re-eye)" opacity=".03"/>
</svg>`,
nin_ninja:(w,h)=>`<svg width="${w}" height="${h}" viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="nn-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#060812"/><stop offset="100%" stop-color="#020308"/></linearGradient>
    <linearGradient id="nn-body" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#2850c0"/><stop offset="100%" stop-color="#102080"/></linearGradient>
    <linearGradient id="nn-gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#f0d040"/><stop offset="100%" stop-color="#c09010"/></linearGradient>
  </defs>
  <rect width="200" height="200" fill="url(#nn-bg)"/>
  <!-- Speed lines -->
  <line x1="0" y1="60" x2="50" y2="75" stroke="#2850c0" stroke-width="1" opacity=".2"/>
  <line x1="0" y1="80" x2="40" y2="90" stroke="#2850c0" stroke-width="1" opacity=".15"/>
  <ellipse cx="100" cy="192" rx="55" ry="7" fill="#000" opacity=".5"/>
  <!-- Right katana raised high -->
  <rect x="148" y="18" width="6" height="80" rx="2" fill="#d0d8e8" transform="rotate(20 151 58)"/>
  <polygon points="148,18 154,18 151,6" fill="#e8eef8" transform="rotate(20 151 58)"/>
  <rect x="144" y="90" width="14" height="8" rx="2" fill="url(#nn-gold)" transform="rotate(20 151 58)"/>
  <!-- Left katana low guard -->
  <rect x="42" y="110" width="6" height="72" rx="2" fill="#c8d0e0" transform="rotate(-15 45 146)"/>
  <polygon points="42,110 48,110 45,98" fill="#d8e0f0" transform="rotate(-15 45 146)"/>
  <rect x="38" y="176" width="14" height="8" rx="2" fill="url(#nn-gold)" transform="rotate(-15 45 146)"/>
  <!-- Legs -->
  <rect x="74" y="152" width="20" height="42" rx="7" fill="url(#nn-body)" transform="rotate(-8 84 173)"/>
  <rect x="108" y="152" width="20" height="42" rx="7" fill="url(#nn-body)" transform="rotate(12 118 173)"/>
  <rect x="68" y="185" width="28" height="10" rx="4" fill="#1a3890"/>
  <rect x="108" y="185" width="28" height="10" rx="4" fill="#1a3890"/>
  <!-- Body -->
  <path d="M 58,100 L 62,155 L 138,155 L 142,100 Q 100,88 58,100Z" fill="url(#nn-body)"/>
  <!-- Chest armor plate gold -->
  <path d="M 70,105 L 72,148 L 128,148 L 130,105 Q 100,97 70,105Z" fill="url(#nn-gold)" opacity=".7"/>
  <!-- Blue overlay -->
  <path d="M 72,107 L 74,146 L 126,146 L 128,107 Q 100,100 72,107Z" fill="#2850c0" opacity=".6"/>
  <!-- Chest emblem -->
  <ellipse cx="100" cy="126" rx="12" ry="10" fill="#f0d040" opacity=".8"/>
  <ellipse cx="100" cy="126" rx="7" ry="6" fill="#2850c0"/>
  <!-- Shoulders -->
  <ellipse cx="58" cy="108" rx="17" ry="14" fill="url(#nn-body)"/>
  <ellipse cx="142" cy="108" rx="17" ry="14" fill="url(#nn-body)"/>
  <!-- Gold shoulder rings -->
  <ellipse cx="58" cy="108" rx="14" ry="11" fill="none" stroke="#f0d040" stroke-width="2" opacity=".7"/>
  <ellipse cx="142" cy="108" rx="14" ry="11" fill="none" stroke="#f0d040" stroke-width="2" opacity=".7"/>
  <!-- Arms -->
  <rect x="40" y="110" width="18" height="32" rx="6" fill="url(#nn-body)"/>
  <rect x="142" y="110" width="18" height="32" rx="6" fill="url(#nn-body)"/>
  <!-- Gloves -->
  <ellipse cx="49" cy="142" rx="10" ry="9" fill="#1a3070"/>
  <ellipse cx="151" cy="142" rx="10" ry="9" fill="#1a3070"/>
  <!-- Neck -->
  <rect x="86" y="88" width="28" height="18" rx="5" fill="#1e3888"/>
  <!-- Head — ninja visor helmet -->
  <path d="M 62,74 Q 62,40 100,36 Q 138,40 138,74 Q 138,92 100,93 Q 62,92 62,74Z" fill="url(#nn-body)"/>
  <path d="M 65,72 Q 65,44 100,40 Q 135,44 135,72 Q 135,89 100,90 Q 65,89 65,72Z" fill="#2048b0" opacity=".8"/>
  <!-- Visor band -->
  <rect x="64" y="64" width="72" height="14" rx="5" fill="#101828"/>
  <rect x="66" y="66" width="68" height="10" rx="4" fill="#1a3060" opacity=".7"/>
  <!-- Visor blue glow -->
  <rect x="68" y="67" width="64" height="8" rx="3" fill="#2060e0" opacity=".3"/>
  <line x1="100" y1="64" x2="100" y2="78" stroke="#4080ff" stroke-width="1.5" opacity=".4"/>
  <!-- Eye slits -->
  <rect x="72" y="68" width="22" height="5" rx="2" fill="#40a0ff" opacity=".7"/>
  <rect x="106" y="68" width="22" height="5" rx="2" fill="#40a0ff" opacity=".7"/>
  <!-- Helmet fin top -->
  <polygon points="94,38 100,20 106,38" fill="url(#nn-gold)"/>
  <polygon points="96,38 100,24 104,38" fill="#f8e060"/>
  <!-- Helmet ear guards -->
  <path d="M 62,60 L 54,54 L 54,76 L 62,72Z" fill="#1a3888"/>
  <path d="M 138,60 L 146,54 L 146,76 L 138,72Z" fill="#1a3888"/>
  <!-- Scarf/collar -->
  <path d="M 70,88 Q 100,96 130,88 L 132,98 Q 100,106 68,98Z" fill="#102060" opacity=".8"/>
</svg>`,

foxuno:(w,h)=>`<svg width="${w}" height="${h}" viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="fx-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#080a10"/><stop offset="100%" stop-color="#020306"/></linearGradient>
    <linearGradient id="fx-body" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#e8eef8"/><stop offset="100%" stop-color="#a0aac0"/></linearGradient>
    <linearGradient id="fx-gold2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#f0c840"/><stop offset="100%" stop-color="#c09010"/></linearGradient>
    <radialGradient id="fx-heal" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#40ff80"/><stop offset="100%" stop-color="#40ff8000"/></radialGradient>
  </defs>
  <rect width="200" height="200" fill="url(#fx-bg)"/>
  <!-- Heal aura -->
  <ellipse cx="100" cy="120" rx="75" ry="65" fill="url(#fx-heal)" opacity=".05"/>
  <ellipse cx="100" cy="192" rx="52" ry="7" fill="#000" opacity=".5"/>
  <!-- Skirt/robe -->
  <path d="M 58,130 Q 55,175 60,192 L 140,192 Q 145,175 142,130Z" fill="#d0d8e8" opacity=".9"/>
  <path d="M 62,132 Q 60,174 64,190 L 136,190 Q 140,174 138,132Z" fill="url(#fx-gold2)" opacity=".25"/>
  <!-- Robe trim red -->
  <rect x="58" y="130" width="84" height="6" rx="2" fill="#c02020" opacity=".7"/>
  <rect x="60" y="188" width="80" height="5" rx="2" fill="#c02020" opacity=".5"/>
  <!-- Body -->
  <path d="M 60,100 L 62,135 L 138,135 L 140,100 Q 100,88 60,100Z" fill="url(#fx-body)"/>
  <!-- Red cross emblem -->
  <rect x="92" y="104" width="16" height="30" rx="3" fill="#c02020" opacity=".9"/>
  <rect x="84" y="112" width="32" height="14" rx="3" fill="#c02020" opacity=".9"/>
  <rect x="93" y="105" width="14" height="28" rx="2" fill="#e02828" opacity=".7"/>
  <rect x="85" y="113" width="30" height="12" rx="2" fill="#e02828" opacity=".7"/>
  <!-- Shoulders -->
  <ellipse cx="60" cy="106" rx="16" ry="13" fill="url(#fx-body)"/>
  <ellipse cx="140" cy="106" rx="16" ry="13" fill="url(#fx-body)"/>
  <!-- Gold shoulder rings -->
  <ellipse cx="60" cy="106" rx="13" ry="10" fill="none" stroke="#f0c840" stroke-width="2" opacity=".8"/>
  <ellipse cx="140" cy="106" rx="13" ry="10" fill="none" stroke="#f0c840" stroke-width="2" opacity=".8"/>
  <!-- Left arm holding syringe blade -->
  <rect x="38" y="106" width="18" height="30" rx="6" fill="url(#fx-body)"/>
  <!-- Syringe blade left -->
  <rect x="28" y="98" width="5" height="44" rx="2" fill="#c8d8e8" transform="rotate(-10 30 120)"/>
  <rect x="26" y="98" width="9" height="8" rx="2" fill="#e0e8f4"/>
  <rect x="27" y="104" width="7" height="14" rx="1" fill="#40ff80" opacity=".6"/>
  <polygon points="28,142 36,142 32,154" fill="#c8d8e8" transform="rotate(-10 30 120)"/>
  <!-- Right arm syringe blade -->
  <rect x="152" y="106" width="18" height="30" rx="6" fill="url(#fx-body)"/>
  <rect x="162" y="98" width="5" height="44" rx="2" fill="#c8d8e8" transform="rotate(10 164 120)"/>
  <rect x="160" y="98" width="9" height="8" rx="2" fill="#e0e8f4"/>
  <rect x="161" y="104" width="7" height="14" rx="1" fill="#40ff80" opacity=".6"/>
  <polygon points="162,142 170,142 166,154" fill="#c8d8e8" transform="rotate(10 164 120)"/>
  <!-- Neck -->
  <rect x="86" y="88" width="28" height="18" rx="5" fill="#c0c8d8"/>
  <!-- Head — fox-eared knight helmet -->
  <path d="M 65,72 Q 65,38 100,34 Q 135,38 135,72 Q 135,90 100,91 Q 65,90 65,72Z" fill="url(#fx-body)"/>
  <path d="M 68,70 Q 68,42 100,38 Q 132,42 132,70 Q 132,88 100,89 Q 68,88 68,70Z" fill="#d8e0f0" opacity=".8"/>
  <!-- Fox ears -->
  <polygon points="72,44 60,18 80,40" fill="url(#fx-body)"/>
  <polygon points="74,42 64,20 79,38" fill="#d8e0f0" opacity=".6"/>
  <polygon points="128,44 140,18 120,40" fill="url(#fx-body)"/>
  <polygon points="126,42 136,20 121,38" fill="#d8e0f0" opacity=".6"/>
  <!-- Ear inner pink -->
  <polygon points="73,42 63,22 78,38" fill="#f08080" opacity=".5"/>
  <polygon points="127,42 137,22 122,38" fill="#f08080" opacity=".5"/>
  <!-- Face plate -->
  <path d="M 74,58 L 126,58 L 126,78 Q 100,84 74,78Z" fill="#b0bcd0"/>
  <!-- Eyes -->
  <ellipse cx="84" cy="66" rx="8" ry="6" fill="#101828"/>
  <ellipse cx="116" cy="66" rx="8" ry="6" fill="#101828"/>
  <ellipse cx="84" cy="66" rx="5" ry="4" fill="#40e080"/>
  <ellipse cx="116" cy="66" rx="5" ry="4" fill="#40e080"/>
  <ellipse cx="83" cy="65" rx="2" ry="2" fill="#a0ffc0"/>
  <ellipse cx="115" cy="65" rx="2" ry="2" fill="#a0ffc0"/>
  <!-- Heal particle effects -->
  <ellipse cx="30" cy="80" rx="4" ry="4" fill="#40ff80" opacity=".4"/>
  <ellipse cx="170" cy="90" rx="3" ry="3" fill="#40ff80" opacity=".3"/>
  <ellipse cx="50" cy="150" rx="3" ry="3" fill="#40ff80" opacity=".25"/>
</svg>`,

gokudo:(w,h)=>`<svg width="${w}" height="${h}" viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gk-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#0a0806"/><stop offset="100%" stop-color="#020200"/></linearGradient>
    <linearGradient id="gk-body" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#d04020"/><stop offset="100%" stop-color="#801008"/></linearGradient>
    <linearGradient id="gk-gold3" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#f0c030"/><stop offset="100%" stop-color="#a07008"/></linearGradient>
    <radialGradient id="gk-cannon" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#40c0ff"/><stop offset="100%" stop-color="#40c0ff00"/></radialGradient>
  </defs>
  <rect width="200" height="200" fill="url(#gk-bg)"/>
  <ellipse cx="100" cy="192" rx="58" ry="7" fill="#000" opacity=".6"/>
  <!-- Legs -->
  <rect x="68" y="150" width="26" height="44" rx="8" fill="url(#gk-body)"/>
  <rect x="106" y="150" width="26" height="44" rx="8" fill="#b03018"/>
  <!-- Foot armors -->
  <rect x="62" y="186" width="36" height="12" rx="5" fill="#606070"/>
  <rect x="100" y="186" width="36" height="12" rx="5" fill="#505060"/>
  <!-- Red stripes on legs -->
  <rect x="66" y="162" width="30" height="5" rx="2" fill="url(#gk-gold3)" opacity=".7"/>
  <rect x="104" y="162" width="30" height="5" rx="2" fill="url(#gk-gold3)" opacity=".7"/>
  <!-- Body -->
  <path d="M 52,96 L 56,155 L 144,155 L 148,96 Q 100,82 52,96Z" fill="url(#gk-body)"/>
  <path d="M 58,100 L 61,150 L 139,150 L 142,100 Q 100,88 58,100Z" fill="#c03820" opacity=".6"/>
  <!-- Chest plate gold -->
  <path d="M 66,104 L 68,146 L 132,146 L 134,104 Q 100,95 66,104Z" fill="url(#gk-gold3)" opacity=".8"/>
  <!-- Visor/emblem on chest -->
  <ellipse cx="100" cy="125" rx="18" ry="14" fill="#101828"/>
  <ellipse cx="100" cy="125" rx="14" ry="11" fill="#40c0ff" opacity=".4"/>
  <rect x="88" y="120" width="24" height="10" rx="3" fill="#00e0ff" opacity=".6"/>
  <!-- Shoulders big -->
  <ellipse cx="52" cy="106" rx="22" ry="18" fill="url(#gk-body)"/>
  <ellipse cx="148" cy="106" rx="22" ry="18" fill="url(#gk-body)"/>
  <!-- Gold rings -->
  <ellipse cx="52" cy="106" rx="18" ry="14" fill="none" stroke="url(#gk-gold3)" stroke-width="3" opacity=".8"/>
  <ellipse cx="148" cy="106" rx="18" ry="14" fill="none" stroke="url(#gk-gold3)" stroke-width="3" opacity=".8"/>
  <!-- LEFT ARM — massive cannon -->
  <rect x="10" y="100" width="42" height="28" rx="10" fill="#606070"/>
  <rect x="12" y="102" width="38" height="24" rx="9" fill="#707080"/>
  <!-- Cannon barrel -->
  <rect x="2" y="107" width="14" height="16" rx="5" fill="#404050"/>
  <rect x="0" y="109" width="6" height="12" rx="3" fill="#303040"/>
  <!-- Cannon glow -->
  <ellipse cx="3" cy="115" rx="4" ry="5" fill="url(#gk-cannon)" opacity=".7"/>
  <!-- Cannon detail rings -->
  <rect x="16" y="103" width="6" height="22" rx="2" fill="#505060" opacity=".6"/>
  <rect x="24" y="104" width="4" height="20" rx="2" fill="#404050" opacity=".5"/>
  <!-- RIGHT ARM — articulated claw hand -->
  <rect x="148" y="106" width="30" height="28" rx="8" fill="url(#gk-body)"/>
  <!-- Claw fingers -->
  <rect x="174" y="104" width="8" height="18" rx="4" fill="#606070" transform="rotate(10 178 113)"/>
  <rect x="178" y="110" width="8" height="18" rx="4" fill="#505060" transform="rotate(25 182 119)"/>
  <rect x="178" y="118" width="8" height="16" rx="4" fill="#606070" transform="rotate(40 182 126)"/>
  <!-- Knuckle joints gold -->
  <ellipse cx="178" cy="110" rx="4" ry="3" fill="url(#gk-gold3)" opacity=".7"/>
  <ellipse cx="180" cy="118" rx="4" ry="3" fill="url(#gk-gold3)" opacity=".7"/>
  <!-- Neck -->
  <rect x="84" y="82" width="32" height="20" rx="6" fill="#b03018"/>
  <!-- Head -->
  <path d="M 60,68 Q 60,34 100,30 Q 140,34 140,68 Q 140,88 100,89 Q 60,88 60,68Z" fill="url(#gk-body)"/>
  <path d="M 63,66 Q 63,38 100,34 Q 137,38 137,66 Q 137,86 100,87 Q 63,86 63,66Z" fill="#c03020" opacity=".7"/>
  <!-- Forehead visor band -->
  <path d="M 66,52 L 134,52 L 136,64 Q 100,70 64,64Z" fill="#101828"/>
  <path d="M 68,54 L 132,54 L 134,64 Q 100,69 66,64Z" fill="#1a2838" opacity=".7"/>
  <!-- Eye glow green -->
  <ellipse cx="83" cy="57" rx="9" ry="6" fill="#00d040" opacity=".8"/>
  <ellipse cx="117" cy="57" rx="9" ry="6" fill="#00d040" opacity=".8"/>
  <ellipse cx="83" cy="57" rx="5" ry="3.5" fill="#40ff80"/>
  <ellipse cx="117" cy="57" rx="5" ry="3.5" fill="#40ff80"/>
  <ellipse cx="82" cy="56" rx="2" ry="2" fill="#fff"/>
  <ellipse cx="116" cy="56" rx="2" ry="2" fill="#fff"/>
  <!-- Chin guard -->
  <path d="M 76,72 Q 100,80 124,72 L 122,82 Q 100,88 78,82Z" fill="#901010"/>
  <!-- Helmet ridges -->
  <rect x="97" y="30" width="6" height="22" rx="2" fill="#e03828" opacity=".5"/>
</svg>`,
wargreymon:(w,h)=>`<svg width="${w}" height="${h}" viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="wg-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#0a0808"/><stop offset="100%" stop-color="#020202"/></linearGradient>
    <linearGradient id="wg-gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#f0c840"/><stop offset="100%" stop-color="#c08010"/></linearGradient>
    <linearGradient id="wg-silver" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#e0e8f0"/><stop offset="100%" stop-color="#9090a0"/></linearGradient>
    <radialGradient id="wg-xglow" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#00ff80"/><stop offset="100%" stop-color="#00ff8000"/></radialGradient>
  </defs>
  <rect width="200" height="200" fill="url(#wg-bg)"/>
  <ellipse cx="100" cy="192" rx="60" ry="7" fill="#000" opacity=".6"/>
  <!-- Legs -->
  <rect x="72" y="148" width="22" height="42" rx="6" fill="url(#wg-gold)"/>
  <rect x="106" y="148" width="22" height="42" rx="6" fill="url(#wg-gold)" opacity=".9"/>
  <!-- Leg armor red stripes -->
  <rect x="70" y="158" width="26" height="6" rx="2" fill="#c02020"/>
  <rect x="104" y="158" width="26" height="6" rx="2" fill="#c02020"/>
  <rect x="70" y="178" width="26" height="6" rx="2" fill="#c02020"/>
  <rect x="104" y="178" width="26" height="6" rx="2" fill="#c02020"/>
  <!-- Feet -->
  <rect x="68" y="184" width="30" height="12" rx="5" fill="url(#wg-silver)"/>
  <rect x="102" y="184" width="30" height="12" rx="5" fill="url(#wg-silver)"/>
  <!-- Body -->
  <path d="M 55,95 L 60,150 L 140,150 L 145,95 Q 100,82 55,95Z" fill="#3040a0"/>
  <path d="M 60,97 L 64,146 L 136,146 L 140,97 Q 100,86 60,97Z" fill="#2838a0" opacity=".7"/>
  <!-- Gold chest plate -->
  <path d="M 62,102 L 66,145 L 134,145 L 138,102 Q 100,92 62,102Z" fill="url(#wg-gold)" opacity=".85"/>
  <!-- X emblem on chest -->
  <line x1="82" y1="108" x2="118" y2="138" stroke="#c02020" stroke-width="5" stroke-linecap="round"/>
  <line x1="118" y1="108" x2="82" y2="138" stroke="#c02020" stroke-width="5" stroke-linecap="round"/>
  <line x1="82" y1="108" x2="118" y2="138" stroke="#ff4040" stroke-width="2.5" stroke-linecap="round"/>
  <line x1="118" y1="108" x2="82" y2="138" stroke="#ff4040" stroke-width="2.5" stroke-linecap="round"/>
  <!-- Shoulders -->
  <ellipse cx="54" cy="106" rx="18" ry="15" fill="url(#wg-gold)"/>
  <ellipse cx="146" cy="106" rx="18" ry="15" fill="url(#wg-gold)"/>
  <!-- Arms -->
  <rect x="36" y="112" width="20" height="38" rx="7" fill="#3040a0"/>
  <rect x="144" y="112" width="20" height="38" rx="7" fill="#3040a0"/>
  <!-- Dramon Destroyers - massive silver claws LEFT -->
  <path d="M 18,100 L 36,118 L 30,122 L 10,108Z" fill="url(#wg-silver)"/>
  <path d="M 14,112 L 34,128 L 28,133 L 8,120Z" fill="url(#wg-silver)"/>
  <path d="M 12,124 L 32,138 L 26,143 L 6,132Z" fill="url(#wg-silver)"/>
  <!-- Dramon Destroyers RIGHT -->
  <path d="M 182,100 L 164,118 L 170,122 L 190,108Z" fill="url(#wg-silver)"/>
  <path d="M 186,112 L 166,128 L 172,133 L 192,120Z" fill="url(#wg-silver)"/>
  <path d="M 188,124 L 168,138 L 174,143 L 194,132Z" fill="url(#wg-silver)"/>
  <!-- Neck -->
  <rect x="84" y="84" width="32" height="18" rx="6" fill="#3040a0"/>
  <!-- Gold neck ring -->
  <rect x="82" y="88" width="36" height="8" rx="4" fill="url(#wg-gold)" opacity=".8"/>
  <!-- Head helmet -->
  <path d="M 62,78 Q 62,36 100,32 Q 138,36 138,78 Q 138,95 100,96 Q 62,95 62,78Z" fill="url(#wg-silver)"/>
  <path d="M 65,76 Q 65,40 100,36 Q 135,40 135,76 Q 135,92 100,93 Q 65,92 65,76Z" fill="#c0c8d8" opacity=".7"/>
  <!-- Green X visor -->
  <line x1="74" y1="62" x2="126" y2="82" stroke="#00ff80" stroke-width="4" stroke-linecap="round" opacity=".9"/>
  <line x1="126" y1="62" x2="74" y2="82" stroke="#00ff80" stroke-width="4" stroke-linecap="round" opacity=".9"/>
  <ellipse cx="100" cy="72" rx="22" ry="14" fill="url(#wg-xglow)" opacity=".4"/>
  <!-- Red mane/hair -->
  <path d="M 78,40 Q 68,18 60,10 Q 72,22 76,38Z" fill="#c02020"/>
  <path d="M 88,36 Q 82,12 78,4 Q 86,18 90,34Z" fill="#d02828"/>
  <path d="M 100,34 Q 98,8 96,0 Q 104,14 104,32Z" fill="#e03030"/>
  <path d="M 112,36 Q 118,12 122,4 Q 114,18 110,34Z" fill="#d02828"/>
  <path d="M 122,40 Q 132,18 140,10 Q 128,22 124,38Z" fill="#c02020"/>
  <!-- Helmet horns -->
  <polygon points="82,38 74,18 86,36" fill="url(#wg-silver)"/>
  <polygon points="118,38 126,18 114,36" fill="url(#wg-silver)"/>
  <polygon points="100,34 96,14 104,14" fill="url(#wg-silver)"/>
  <!-- Aura glow -->
  <ellipse cx="100" cy="120" rx="80" ry="70" fill="url(#wg-xglow)" opacity=".04"/>
</svg>`,

metalgurumemon:(w,h)=>`<svg width="${w}" height="${h}" viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="mg-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#080410"/><stop offset="100%" stop-color="#020106"/></linearGradient>
    <linearGradient id="mg-purp" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#7050c0"/><stop offset="100%" stop-color="#3818a0"/></linearGradient>
    <linearGradient id="mg-gold2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#f0c030"/><stop offset="100%" stop-color="#a07010"/></linearGradient>
    <radialGradient id="mg-visor" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#ff8800"/><stop offset="100%" stop-color="#ff220000"/></radialGradient>
  </defs>
  <rect width="200" height="200" fill="url(#mg-bg)"/>
  <ellipse cx="100" cy="192" rx="55" ry="7" fill="#000" opacity=".6"/>
  <!-- Massive paws/feet with pink claws -->
  <ellipse cx="72" cy="182" rx="28" ry="16" fill="#8060c0"/>
  <ellipse cx="128" cy="182" rx="28" ry="16" fill="#7858b8"/>
  <!-- Pink claws left -->
  <ellipse cx="52" cy="188" rx="7" ry="12" fill="#ff60a0" transform="rotate(-20 52 188)"/>
  <ellipse cx="66" cy="192" rx="7" ry="11" fill="#ff50a0" transform="rotate(-5 66 192)"/>
  <ellipse cx="80" cy="192" rx="7" ry="11" fill="#ff60a0" transform="rotate(10 80 192)"/>
  <!-- Pink claws right -->
  <ellipse cx="120" cy="192" rx="7" ry="11" fill="#ff50a0" transform="rotate(-10 120 192)"/>
  <ellipse cx="134" cy="192" rx="7" ry="11" fill="#ff60a0" transform="rotate(5 134 192)"/>
  <ellipse cx="148" cy="188" rx="7" ry="12" fill="#ff50a0" transform="rotate(20 148 188)"/>
  <!-- Legs -->
  <rect x="58" y="145" width="30" height="40" rx="10" fill="url(#mg-purp)"/>
  <rect x="112" y="145" width="30" height="40" rx="10" fill="url(#mg-purp)" opacity=".9"/>
  <!-- Red accent on legs -->
  <rect x="56" y="158" width="34" height="6" rx="3" fill="#c02030" opacity=".8"/>
  <rect x="110" y="158" width="34" height="6" rx="3" fill="#c02030" opacity=".8"/>
  <!-- White lower legs -->
  <rect x="60" y="170" width="26" height="20" rx="6" fill="#d0d8e8"/>
  <rect x="114" y="170" width="26" height="20" rx="6" fill="#d0d8e8"/>
  <!-- Body - thick and powerful -->
  <ellipse cx="100" cy="132" rx="46" ry="40" fill="url(#mg-purp)"/>
  <ellipse cx="100" cy="126" rx="36" ry="30" fill="#6048b8" opacity=".6"/>
  <!-- Gold belly core -->
  <ellipse cx="100" cy="138" rx="22" ry="18" fill="url(#mg-gold2)" opacity=".9"/>
  <ellipse cx="100" cy="136" rx="14" ry="11" fill="#f0d040" opacity=".7"/>
  <!-- Blue core orb -->
  <ellipse cx="100" cy="135" rx="7" ry="7" fill="#40a0ff"/>
  <ellipse cx="97" cy="132" rx="3" ry="3" fill="#80d0ff"/>
  <!-- Missile pod on right shoulder -->
  <rect x="138" y="88" width="32" height="38" rx="8" fill="url(#mg-gold2)"/>
  <rect x="140" y="90" width="28" height="8" rx="3" fill="#d0a020"/>
  <!-- Missile tubes -->
  <rect x="142" y="90" width="5" height="18" rx="2" fill="#202020"/>
  <rect x="150" y="90" width="5" height="18" rx="2" fill="#202020"/>
  <rect x="158" y="90" width="5" height="18" rx="2" fill="#202020"/>
  <rect x="142" y="110" width="5" height="14" rx="2" fill="#202020"/>
  <rect x="150" y="110" width="5" height="14" rx="2" fill="#202020"/>
  <rect x="158" y="110" width="5" height="14" rx="2" fill="#202020"/>
  <!-- Long gold horn/antenna -->
  <path d="M 152,88 Q 160,50 168,20" stroke="url(#mg-gold2)" stroke-width="8" fill="none" stroke-linecap="round"/>
  <path d="M 168,20 L 176,8" stroke="#f0c030" stroke-width="5" stroke-linecap="round"/>
  <!-- Left arm -->
  <ellipse cx="58" cy="118" rx="22" ry="18" fill="url(#mg-purp)"/>
  <rect x="36" y="118" width="24" height="30" rx="8" fill="#5040a8"/>
  <!-- Head - beast with visor -->
  <path d="M 58,92 Q 55,58 100,50 Q 145,58 142,92 Q 142,115 100,116 Q 58,115 58,92Z" fill="url(#mg-purp)"/>
  <path d="M 62,90 Q 60,62 100,54 Q 140,62 138,90 Q 138,111 100,112 Q 62,111 62,90Z" fill="#6040b8" opacity=".8"/>
  <!-- Red visor/helmet top -->
  <path d="M 68,68 Q 68,54 100,50 Q 132,54 132,68 L 128,74 Q 100,70 72,74Z" fill="#e02020"/>
  <path d="M 72,66 Q 72,56 100,53 Q 128,56 128,66 L 124,70 Q 100,66 76,70Z" fill="#ff3030" opacity=".7"/>
  <!-- Visor glow -->
  <rect x="72" y="72" width="56" height="16" rx="6" fill="#101010"/>
  <rect x="74" y="74" width="52" height="12" rx="5" fill="#ff8800" opacity=".5"/>
  <ellipse cx="100" cy="80" rx="22" ry="5" fill="url(#mg-visor)" opacity=".7"/>
  <!-- Square eye in visor -->
  <rect x="92" y="75" width="16" height="10" rx="2" fill="#ffaa00"/>
  <rect x="96" y="77" width="8" height="6" rx="1" fill="#ffffff" opacity=".6"/>
  <!-- Beast mouth open below visor -->
  <path d="M 70,92 Q 100,100 130,92 Q 130,108 100,112 Q 70,108 70,92Z" fill="#1a0a08"/>
  <!-- Teeth -->
  <polygon points="80,94 84,94 82,102" fill="#e8e8e8"/>
  <polygon points="90,95 94,95 92,104" fill="#e8e8e8"/>
  <polygon points="106,95 110,95 108,104" fill="#e8e8e8"/>
  <polygon points="116,94 120,94 118,102" fill="#e8e8e8"/>
  <!-- Red eyes -->
  <ellipse cx="78" cy="85" rx="7" ry="5" fill="#ff2020"/>
  <ellipse cx="122" cy="85" rx="7" ry="5" fill="#ff2020"/>
  <ellipse cx="78" cy="85" rx="4" ry="3" fill="#ff6040"/>
  <ellipse cx="122" cy="85" rx="4" ry="3" fill="#ff6040"/>
</svg>`,
omegaknight:(w,h)=>`<svg width="${w}" height="${h}" viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="ok-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#080818"/><stop offset="100%" stop-color="#020408"/></linearGradient>
    <linearGradient id="ok-body" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#e8eef8"/><stop offset="100%" stop-color="#a0b0c8"/></linearGradient>
    <radialGradient id="ok-glow" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#f0c040"/><stop offset="100%" stop-color="#f0c04000"/></radialGradient>
  </defs>
  <rect width="200" height="200" fill="url(#ok-bg)"/>
  <ellipse cx="100" cy="188" rx="65" ry="8" fill="#000" opacity=".5"/>
  <!-- Cape -->
  <path d="M 60,90 Q 30,140 40,185 L 80,175 Q 70,140 85,110Z" fill="#c02020" opacity=".9"/>
  <path d="M 140,90 Q 170,140 160,185 L 120,175 Q 130,140 115,110Z" fill="#c02020" opacity=".9"/>
  <!-- Legs -->
  <rect x="72" y="148" width="22" height="40" rx="8" fill="#b0bcd0"/>
  <rect x="106" y="148" width="22" height="40" rx="8" fill="#a8b4c8"/>
  <rect x="70" y="182" width="28" height="10" rx="5" fill="#c8d4e8"/>
  <rect x="102" y="182" width="28" height="10" rx="5" fill="#c0cce0"/>
  <!-- Body -->
  <path d="M 58,100 L 62,150 L 138,150 L 142,100 Q 100,88 58,100Z" fill="url(#ok-body)"/>
  <path d="M 65,102 L 68,145 L 132,145 L 135,102 Q 100,92 65,102Z" fill="#d8e4f4" opacity=".6"/>
  <!-- Chest emblem -->
  <polygon points="100,108 110,120 100,132 90,120" fill="#f0c040" opacity=".9"/>
  <polygon points="100,112 107,120 100,128 93,120" fill="#f8d860"/>
  <!-- Shoulders -->
  <ellipse cx="58" cy="108" rx="18" ry="14" fill="#b0bcd0"/>
  <ellipse cx="142" cy="108" rx="18" ry="14" fill="#a8b4c8"/>
  <rect x="44" y="104" width="14" height="20" rx="5" fill="#c8d4e8"/>
  <rect x="142" y="104" width="14" height="20" rx="5" fill="#c0cce0"/>
  <!-- Arms -->
  <rect x="36" y="118" width="18" height="36" rx="8" fill="#b0bcd0"/>
  <rect x="146" y="118" width="18" height="36" rx="8" fill="#a8b4c8"/>
  <!-- Left hand: lance weapon -->
  <rect x="26" y="148" width="8" height="52" rx="3" fill="#e8c030" transform="rotate(-15 30 148)"/>
  <polygon points="26,148 34,148 30,134" fill="#f8d840" transform="rotate(-15 30 148)"/>
  <!-- Right hand: shield -->
  <path d="M 152,148 L 170,148 L 174,170 L 162,182 L 150,170Z" fill="#c02020"/>
  <path d="M 155,150 L 168,150 L 171,168 L 162,178 L 153,168Z" fill="#d83030"/>
  <polygon points="162,154 166,162 162,170 158,162" fill="#f0c040"/>
  <!-- Neck -->
  <rect x="86" y="86" width="28" height="20" rx="6" fill="#c0ccdc"/>
  <!-- Head - knight helmet -->
  <path d="M 65,82 Q 65,40 100,36 Q 135,40 135,82 Q 135,96 100,97 Q 65,96 65,82Z" fill="#c8d4e4"/>
  <path d="M 68,80 Q 68,43 100,39 Q 132,43 132,80 Q 132,93 100,94 Q 68,93 68,80Z" fill="url(#ok-body)"/>
  <!-- Visor -->
  <path d="M 72,68 L 128,68 L 128,80 Q 100,86 72,80Z" fill="#101828"/>
  <path d="M 74,70 L 126,70 L 126,78 Q 100,83 74,78Z" fill="#1a2840" opacity=".8"/>
  <!-- Visor glow -->
  <ellipse cx="100" cy="74" rx="28" ry="5" fill="#f0c040" opacity=".3"/>
  <line x1="72" y1="74" x2="128" y2="74" stroke="#f0c040" stroke-width="1" opacity=".4"/>
  <!-- Crown/crest -->
  <path d="M 80,42 L 80,28 L 90,36 L 100,20 L 110,36 L 120,28 L 120,42Z" fill="#f0c040"/>
  <path d="M 83,40 L 83,31 L 91,37 L 100,24 L 109,37 L 117,31 L 117,40Z" fill="#f8d860"/>
  <!-- Helmet details -->
  <line x1="100" y1="40" x2="100" y2="68" stroke="#a8b8c8" stroke-width="1.5" opacity=".5"/>
  <ellipse cx="80" cy="58" rx="5" ry="4" fill="#f0c040" opacity=".4"/>
  <ellipse cx="120" cy="58" rx="5" ry="4" fill="#f0c040" opacity=".4"/>
  <!-- Aura glow -->
  <ellipse cx="100" cy="120" rx="70" ry="60" fill="url(#ok-glow)" opacity=".08"/>
</svg>`,

spidarman:(w,h)=>`<svg width="${w}" height="${h}" viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="sp-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#0a0a18"/><stop offset="100%" stop-color="#040408"/></linearGradient>
    <linearGradient id="sp-body" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#3a2070"/><stop offset="100%" stop-color="#1a0840"/></linearGradient>
  </defs>
  <rect width="200" height="200" fill="url(#sp-bg)"/>
  <!-- Web lines in background -->
  <line x1="100" y1="0" x2="0" y2="100" stroke="#6040b0" stroke-width=".5" opacity=".2"/>
  <line x1="100" y1="0" x2="200" y2="100" stroke="#6040b0" stroke-width=".5" opacity=".2"/>
  <line x1="0" y1="80" x2="200" y2="80" stroke="#6040b0" stroke-width=".5" opacity=".15"/>
  <ellipse cx="100" cy="188" rx="50" ry="7" fill="#000" opacity=".5"/>
  <!-- 8 spider legs -->
  <line x1="80" y1="120" x2="20" y2="80" stroke="#5030a0" stroke-width="4" stroke-linecap="round"/>
  <line x1="20" y1="80" x2="10" y2="50" stroke="#5030a0" stroke-width="3" stroke-linecap="round"/>
  <line x1="80" y1="130" x2="15" y2="130" stroke="#5030a0" stroke-width="4" stroke-linecap="round"/>
  <line x1="15" y1="130" x2="5" y2="150" stroke="#5030a0" stroke-width="3" stroke-linecap="round"/>
  <line x1="80" y1="145" x2="25" y2="175" stroke="#5030a0" stroke-width="4" stroke-linecap="round"/>
  <line x1="120" y1="120" x2="180" y2="80" stroke="#4828a0" stroke-width="4" stroke-linecap="round"/>
  <line x1="180" y1="80" x2="190" y2="50" stroke="#4828a0" stroke-width="3" stroke-linecap="round"/>
  <line x1="120" y1="130" x2="185" y2="130" stroke="#4828a0" stroke-width="4" stroke-linecap="round"/>
  <line x1="185" y1="130" x2="195" y2="150" stroke="#4828a0" stroke-width="3" stroke-linecap="round"/>
  <line x1="120" y1="145" x2="175" y2="175" stroke="#4828a0" stroke-width="4" stroke-linecap="round"/>
  <!-- Body -->
  <ellipse cx="100" cy="135" rx="35" ry="45" fill="url(#sp-body)"/>
  <ellipse cx="100" cy="128" rx="28" ry="35" fill="#4a2888" opacity=".7"/>
  <!-- Abdomen pattern -->
  <ellipse cx="100" cy="148" rx="18" ry="22" fill="#2a1458" opacity=".8"/>
  <ellipse cx="100" cy="145" rx="10" ry="12" fill="#6040a0" opacity=".4"/>
  <!-- Head -->
  <ellipse cx="100" cy="88" rx="32" ry="28" fill="url(#sp-body)"/>
  <ellipse cx="100" cy="86" rx="27" ry="23" fill="#4a2888" opacity=".8"/>
  <!-- 8 eyes -->
  <ellipse cx="86" cy="82" rx="7" ry="5" fill="#ff2060"/>
  <ellipse cx="100" cy="80" rx="6" ry="4" fill="#ff2060"/>
  <ellipse cx="114" cy="82" rx="7" ry="5" fill="#ff2060"/>
  <ellipse cx="88" cy="90" rx="4" ry="3" fill="#ff4080" opacity=".7"/>
  <ellipse cx="112" cy="90" rx="4" ry="3" fill="#ff4080" opacity=".7"/>
  <!-- Eye glow -->
  <ellipse cx="86" cy="82" rx="5" ry="3" fill="#ff60a0" opacity=".6"/>
  <ellipse cx="100" cy="80" rx="4" ry="2.5" fill="#ff60a0" opacity=".6"/>
  <ellipse cx="114" cy="82" rx="5" ry="3" fill="#ff60a0" opacity=".6"/>
  <!-- Mandibles -->
  <path d="M 84,96 Q 76,106 72,112" stroke="#7050b0" stroke-width="3" fill="none" stroke-linecap="round"/>
  <path d="M 116,96 Q 124,106 128,112" stroke="#6848a8" stroke-width="3" fill="none" stroke-linecap="round"/>
  <!-- Web shooter on wrist -->
  <circle cx="38" cy="112" r="5" fill="#8060c0" opacity=".8"/>
  <circle cx="162" cy="112" r="5" fill="#7858b8" opacity=".8"/>
</svg>`,

cyandog:(w,h)=>`<svg width="${w}" height="${h}" viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="cd-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#050c18"/><stop offset="100%" stop-color="#020408"/></linearGradient>
    <linearGradient id="cd-body" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#1a6090"/><stop offset="100%" stop-color="#0a2840"/></linearGradient>
    <radialGradient id="cd-eye" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#00e8ff"/><stop offset="100%" stop-color="#00e8ff00"/></radialGradient>
  </defs>
  <rect width="200" height="200" fill="url(#cd-bg)"/>
  <!-- Speed lines -->
  <line x1="0" y1="90" x2="60" y2="100" stroke="#00a0c0" stroke-width="1" opacity=".15"/>
  <line x1="0" y1="110" x2="50" y2="115" stroke="#00a0c0" stroke-width="1" opacity=".1"/>
  <line x1="0" y1="130" x2="55" y2="128" stroke="#00a0c0" stroke-width="1" opacity=".1"/>
  <ellipse cx="105" cy="188" rx="55" ry="7" fill="#000" opacity=".5"/>
  <!-- Tail -->
  <path d="M 145,148 Q 175,130 178,110 Q 180,95 170,88" stroke="#2a80b0" stroke-width="6" fill="none" stroke-linecap="round"/>
  <!-- Hind legs -->
  <rect x="118" y="148" width="18" height="38" rx="7" fill="#1a6090" transform="rotate(8 118 148)"/>
  <rect x="66" y="150" width="18" height="36" rx="7" fill="#156080" transform="rotate(-6 66 150)"/>
  <ellipse cx="132" cy="184" rx="14" ry="6" fill="#2a7aaa"/>
  <ellipse cx="72" cy="184" rx="14" ry="6" fill="#227098"/>
  <!-- Body — lean, fast -->
  <ellipse cx="102" cy="138" rx="44" ry="32" fill="url(#cd-body)"/>
  <ellipse cx="98" cy="132" rx="36" ry="24" fill="#206888" opacity=".6"/>
  <!-- Front legs -->
  <rect x="68" y="140" width="18" height="36" rx="7" fill="#1a6090" transform="rotate(-12 68 140)"/>
  <rect x="116" y="138" width="18" height="36" rx="7" fill="#156080" transform="rotate(10 116 138)"/>
  <ellipse cx="58" cy="174" rx="14" ry="6" fill="#2a7aaa"/>
  <ellipse cx="130" cy="172" rx="14" ry="6" fill="#227098"/>
  <!-- Neck -->
  <rect x="86" y="100" width="26" height="28" rx="8" fill="#206888"/>
  <!-- Head — canine shaped -->
  <path d="M 62,88 Q 60,55 100,50 Q 140,55 138,88 Q 138,106 100,107 Q 62,106 62,88Z" fill="#1a6090"/>
  <path d="M 65,86 Q 63,58 100,53 Q 137,58 135,86 Q 135,103 100,104 Q 65,103 65,86Z" fill="url(#cd-body)" opacity=".8"/>
  <!-- Ears — pointed up -->
  <polygon points="72,60 62,28 82,55" fill="#156080"/>
  <polygon points="74,58 65,30 81,54" fill="#1e7298" opacity=".6"/>
  <polygon points="128,60 138,28 118,55" fill="#156080"/>
  <polygon points="126,58 135,30 119,54" fill="#1e7298" opacity=".6"/>
  <!-- Snout -->
  <ellipse cx="100" cy="96" rx="20" ry="12" fill="#104a70"/>
  <ellipse cx="100" cy="93" rx="14" ry="7" fill="#0c3a58"/>
  <!-- Nose -->
  <ellipse cx="100" cy="90" rx="5" ry="3" fill="#081a28"/>
  <!-- Eyes — cyan glow -->
  <ellipse cx="82" cy="76" rx="10" ry="8" fill="#0a1a28"/>
  <ellipse cx="118" cy="76" rx="10" ry="8" fill="#0a1a28"/>
  <ellipse cx="82" cy="76" rx="8" ry="6" fill="url(#cd-eye)"/>
  <ellipse cx="118" cy="76" rx="8" ry="6" fill="url(#cd-eye)"/>
  <ellipse cx="82" cy="76" rx="5" ry="4" fill="#00e0ff"/>
  <ellipse cx="118" cy="76" rx="5" ry="4" fill="#00e0ff"/>
  <ellipse cx="82" cy="76" rx="2" ry="2" fill="#fff"/>
  <ellipse cx="118" cy="76" rx="2" ry="2" fill="#fff"/>
  <!-- Speed collar -->
  <rect x="82" y="104" width="36" height="8" rx="4" fill="#00a0c0" opacity=".7"/>
  <rect x="88" y="105" width="6" height="6" rx="2" fill="#00e0ff" opacity=".8"/>
</svg>`,
machairodus:(w,h)=>`<svg width="${w}" height="${h}" viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="mch-bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0a1018"/><stop offset="100%" stop-color="#040810"/>
    </linearGradient>
    <linearGradient id="mch-body" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#5a3a8a"/><stop offset="100%" stop-color="#2a1850"/>
    </linearGradient>
    <radialGradient id="mch-eye" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ff4080"/><stop offset="100%" stop-color="#80004080" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="200" height="200" fill="url(#mch-bg)"/>
  <!-- ground shadow -->
  <ellipse cx="100" cy="185" rx="75" ry="10" fill="#000" opacity=".5"/>
  <!-- rear legs -->
  <rect x="38" y="130" width="22" height="45" rx="8" fill="#3a2460" transform="rotate(15 38 130)"/>
  <rect x="135" y="132" width="22" height="45" rx="8" fill="#2e1c50" transform="rotate(-12 135 132)"/>
  <!-- paws rear -->
  <ellipse cx="44" cy="172" rx="16" ry="8" fill="#4a2c70"/>
  <ellipse cx="148" cy="172" rx="16" ry="8" fill="#3c2460"/>
  <!-- body — long low slung predator shape -->
  <ellipse cx="100" cy="128" rx="62" ry="36" fill="#3a2468"/>
  <ellipse cx="100" cy="122" rx="58" ry="30" fill="url(#mch-body)"/>
  <!-- body highlight -->
  <ellipse cx="85" cy="110" rx="35" ry="16" fill="#7a4aaa" opacity=".4"/>
  <!-- armor plates on body -->
  <rect x="55" y="108" width="28" height="16" rx="5" fill="#4a2880" opacity=".8"/>
  <rect x="88" y="106" width="26" height="16" rx="5" fill="#4a2880" opacity=".7"/>
  <rect x="118" y="110" width="22" height="14" rx="4" fill="#3e2070" opacity=".7"/>
  <!-- panel lines -->
  <line x1="56" y1="116" x2="150" y2="116" stroke="#2a1448" stroke-width="1.5"/>
  <line x1="70" y1="108" x2="70" y2="125" stroke="#2a1448" stroke-width="1"/>
  <line x1="100" y1="106" x2="100" y2="124" stroke="#2a1448" stroke-width="1"/>
  <line x1="130" y1="110" x2="130" y2="124" stroke="#2a1448" stroke-width="1"/>
  <!-- front legs — crouched, tensed to spring -->
  <rect x="52" y="138" width="24" height="42" rx="9" fill="#4a2c72" transform="rotate(-8 52 138)"/>
  <rect x="120" y="135" width="24" height="42" rx="9" fill="#3e2468" transform="rotate(5 120 135)"/>
  <!-- front paws — spread wide, claws out -->
  <ellipse cx="48" cy="178" rx="18" ry="9" fill="#5a3480"/>
  <ellipse cx="144" cy="176" rx="18" ry="9" fill="#4a2c70"/>
  <!-- claws -->
  <line x1="36" y1="178" x2="28" y2="188" stroke="#c080ff" stroke-width="2" stroke-linecap="round"/>
  <line x1="42" y1="180" x2="36" y2="191" stroke="#c080ff" stroke-width="2" stroke-linecap="round"/>
  <line x1="50" y1="181" x2="46" y2="192" stroke="#c080ff" stroke-width="2" stroke-linecap="round"/>
  <line x1="134" y1="178" x2="128" y2="188" stroke="#c080ff" stroke-width="2" stroke-linecap="round"/>
  <line x1="142" y1="180" x2="138" y2="191" stroke="#b070f0" stroke-width="2" stroke-linecap="round"/>
  <line x1="150" y1="179" x2="148" y2="190" stroke="#b070f0" stroke-width="2" stroke-linecap="round"/>
  <!-- neck -->
  <rect x="80" y="80" width="40" height="35" rx="10" fill="#4a2c78"/>
  <rect x="82" y="82" width="36" height="30" rx="8" fill="#5a3888" opacity=".8"/>
  <!-- HEAD — angular predator skull -->
  <path d="M 60,75 Q 60,40 100,38 Q 140,40 140,75 Q 140,95 100,96 Q 60,95 60,75Z" fill="#3a2468"/>
  <path d="M 63,73 Q 63,43 100,41 Q 137,43 137,73 Q 137,91 100,92 Q 63,91 63,73Z" fill="url(#mch-body)"/>
  <!-- head highlight -->
  <ellipse cx="88" cy="56" rx="22" ry="14" fill="#7a4aaa" opacity=".35"/>
  <!-- SABER FANGS — the iconic look -->
  <path d="M 82,90 L 78,120 L 86,120 L 88,90Z" fill="#e0d0ff"/>
  <path d="M 82,90 L 78,120 L 82,120 L 84,90Z" fill="#f0e8ff"/>
  <path d="M 112,90 L 108,118 L 116,118 L 118,90Z" fill="#e0d0ff"/>
  <path d="M 112,90 L 108,118 L 112,118 L 114,90Z" fill="#f0e8ff"/>
  <!-- fang glow -->
  <ellipse cx="83" cy="110" rx="5" ry="15" fill="#c080ff" opacity=".2"/>
  <ellipse cx="113" cy="108" rx="5" ry="14" fill="#c080ff" opacity=".2"/>
  <!-- EYE SOCKETS -->
  <ellipse cx="80" cy="65" rx="14" ry="11" fill="#1a0c2e"/>
  <ellipse cx="120" cy="65" rx="14" ry="11" fill="#1a0c2e"/>
  <!-- EYES — predator pink/magenta glow -->
  <ellipse cx="80" cy="65" rx="11" ry="8" fill="url(#mch-eye)" opacity=".9"/>
  <ellipse cx="120" cy="65" rx="11" ry="8" fill="url(#mch-eye)" opacity=".9"/>
  <ellipse cx="80" cy="65" rx="7" ry="5" fill="#ff2060"/>
  <ellipse cx="120" cy="65" rx="7" ry="5" fill="#ff2060"/>
  <ellipse cx="80" cy="65" rx="3" ry="2" fill="#ff80b0"/>
  <ellipse cx="120" cy="65" rx="3" ry="2" fill="#ff80b0"/>
  <!-- slit pupils -->
  <ellipse cx="80" cy="65" rx="1" ry="4" fill="#0a0010"/>
  <ellipse cx="120" cy="65" rx="1" ry="4" fill="#0a0010"/>
  <!-- ear/horn spikes -->
  <polygon points="68,48 58,25 76,44" fill="#5a2888"/>
  <polygon points="68,48 62,28 74,44" fill="#7a3aaa"/>
  <polygon points="132,48 142,25 124,44" fill="#5a2888"/>
  <polygon points="132,48 138,28 126,44" fill="#7a3aaa"/>
  <!-- energy lines on body — charge charging up -->
  <path d="M 55,115 L 65,108 L 70,112 L 80,105" fill="none" stroke="#c080ff" stroke-width="1" opacity=".5"/>
  <path d="M 120,108 L 130,112 L 138,106 L 145,110" fill="none" stroke="#b060f0" stroke-width="1" opacity=".4"/>
  <!-- Stalk indicator — red targeting reticle on chest -->
  <circle cx="100" cy="120" r="8" fill="none" stroke="#ff2060" stroke-width="1" opacity=".6"/>
  <line x1="92" y1="120" x2="96" y2="120" stroke="#ff2060" stroke-width="1" opacity=".5"/>
  <line x1="104" y1="120" x2="108" y2="120" stroke="#ff2060" stroke-width="1" opacity=".5"/>
  <line x1="100" y1="112" x2="100" y2="116" stroke="#ff2060" stroke-width="1" opacity=".5"/>
  <line x1="100" y1="124" x2="100" y2="128" stroke="#ff2060" stroke-width="1" opacity=".5"/>
</svg>`,
// Medachange art
mc_meta:(w,h)=>`<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${w}" height="${h}" fill="#200408"/>
  <circle cx="${w/2}" cy="${h/2}" r="${w*.46}" fill="none" stroke="#f04880" stroke-width=".8" opacity=".25" stroke-dasharray="5 3"/>
  <circle cx="${w/2}" cy="${h/2}" r="${w*.52}" fill="none" stroke="#f04880" stroke-width=".5" opacity=".12" stroke-dasharray="3 6"/>
  <ellipse cx="${w/2}" cy="${h*.52}" rx="${w*.32}" ry="${h*.4}" fill="#2a1004"/>
  <rect x="${w*.34}" y="${h*.12}" width="${w*.32}" height="${h*.08}" rx="3" fill="#e8621e" opacity=".8"/>
  <ellipse cx="${w*.37}" cy="${h*.38}" rx="${w*.09}" ry="${h*.1}" fill="#1a0802"/>
  <ellipse cx="${w*.63}" cy="${h*.38}" rx="${w*.09}" ry="${h*.1}" fill="#1a0802"/>
  <ellipse cx="${w*.37}" cy="${h*.37}" rx="${w*.06}" ry="${h*.07}" fill="#ff7030"/>
  <ellipse cx="${w*.63}" cy="${h*.37}" rx="${w*.06}" ry="${h*.07}" fill="#ff7030"/>
  <rect x="${w*.4}" y="${h*.52}" width="${w*.2}" height="${h*.28}" rx="4" fill="#2a1004" stroke="#e8621e" stroke-width="1"/>
  <rect x="${w*.22}" y="${h*.5}" width="${w*.16}" height="${h*.24}" rx="4" fill="#1a0802" stroke="#e8621e" stroke-width=".8" transform="rotate(-14 ${w*.22} ${h*.5})"/>
  <rect x="${w*.62}" y="${h*.5}" width="${w*.16}" height="${h*.24}" rx="4" fill="#1a0802" stroke="#e8621e" stroke-width=".8" transform="rotate(14 ${w*.62} ${h*.5})"/>
  <rect x="0" y="${h*.94}" width="${w}" height="${h*.06}" fill="#f04880" opacity=".5"/>
</svg>`,
mc_arc:(w,h)=>`<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${w}" height="${h}" fill="#020818"/>
  <circle cx="${w/2}" cy="${h/2}" r="${w*.46}" fill="none" stroke="#f04880" stroke-width=".8" opacity=".25" stroke-dasharray="5 3"/>
  <rect x="${w*.42}" y="${h*.1}" width="${w*.16}" height="${h*.07}" rx="3" fill="#3a8aee"/>
  <rect x="${w*.47}" y="${h*.04}" width="${w*.04}" height="${h*.09}" rx="2" fill="#3a8aee"/>
  <rect x="${w*.52}" y="${h*.05}" width="${w*.04}" height="${h*.08}" rx="2" fill="#3a8aee"/>
  <ellipse cx="${w/2}" cy="${h*.52}" rx="${w*.3}" ry="${h*.36}" fill="#041020" stroke="#3a8aee" stroke-width="1.5"/>
  <ellipse cx="${w*.37}" cy="${h*.44}" rx="${w*.09}" ry="${h*.1}" fill="#030c18"/>
  <ellipse cx="${w*.63}" cy="${h*.44}" rx="${w*.09}" ry="${h*.1}" fill="#030c18"/>
  <ellipse cx="${w*.37}" cy="${h*.43}" rx="${w*.06}" ry="${h*.07}" fill="#3a8aee"/>
  <ellipse cx="${w*.63}" cy="${h*.43}" rx="${w*.06}" ry="${h*.07}" fill="#3a8aee"/>
  <rect x="${w*.38}" y="${h*.58}" width="${w*.24}" height="${h*.26}" rx="4" fill="#041020" stroke="#3a8aee" stroke-width="1"/>
  <rect x="${w*.16}" y="${h*.52}" width="${w*.14}" height="${h*.22}" rx="4" fill="#041020" stroke="#3a8aee" stroke-width=".8" transform="rotate(-12 ${w*.16} ${h*.52})"/>
  <rect x="${w*.7}" y="${h*.52}" width="${w*.14}" height="${h*.22}" rx="4" fill="#041020" stroke="#3a8aee" stroke-width=".8" transform="rotate(12 ${w*.7} ${h*.52})"/>
  <rect x="0" y="${h*.94}" width="${w}" height="${h*.06}" fill="#f04880" opacity=".5"/>
</svg>`,
mc_war:(w,h)=>`<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${w}" height="${h}" fill="#0a0418"/>
  <circle cx="${w/2}" cy="${h/2}" r="${w*.46}" fill="none" stroke="#f04880" stroke-width=".8" opacity=".25" stroke-dasharray="5 3"/>
  <polygon points="${w/2},${h*.06} ${w*.6},${h*.18} ${w*.7},${h*.1} ${w*.66},${h*.26} ${w/2},${h*.24} ${w*.34},${h*.26} ${w*.3},${h*.1} ${w*.4},${h*.18}" fill="#3a2870" stroke="#8870e0" stroke-width="1"/>
  <ellipse cx="${w/2}" cy="${h*.52}" rx="${w*.28}" ry="${h*.34}" fill="#0c0820" stroke="#8870e0" stroke-width="1.5"/>
  <ellipse cx="${w*.38}" cy="${h*.44}" rx="${w*.09}" ry="${h*.1}" fill="#060414"/>
  <ellipse cx="${w*.62}" cy="${h*.44}" rx="${w*.09}" ry="${h*.1}" fill="#060414"/>
  <ellipse cx="${w*.38}" cy="${h*.43}" rx="${w*.06}" ry="${h*.07}" fill="#8870e0"/>
  <ellipse cx="${w*.62}" cy="${h*.43}" rx="${w*.06}" ry="${h*.07}" fill="#8870e0"/>
  <rect x="${w*.38}" y="${h*.58}" width="${w*.24}" height="${h*.26}" rx="4" fill="#0c0820" stroke="#8870e0" stroke-width="1"/>
  <rect x="${w*.18}" y="${h*.54}" width="${w*.14}" height="${h*.22}" rx="4" fill="#0c0820" stroke="#8870e0" stroke-width=".8" transform="rotate(-10 ${w*.18} ${h*.54})"/>
  <rect x="${w*.68}" y="${h*.54}" width="${w*.14}" height="${h*.22}" rx="4" fill="#0c0820" stroke="#8870e0" stroke-width=".8" transform="rotate(10 ${w*.68} ${h*.54})"/>
  <rect x="0" y="${h*.94}" width="${w}" height="${h*.06}" fill="#f04880" opacity=".5"/>
</svg>`,
mc_rok:(w,h)=>`<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${w}" height="${h}" fill="#0a0c0e"/>
  <circle cx="${w/2}" cy="${h/2}" r="${w*.46}" fill="none" stroke="#f04880" stroke-width=".8" opacity=".25" stroke-dasharray="5 3"/>
  <ellipse cx="${w/2}" cy="${h*.5}" rx="${w*.38}" ry="${h*.42}" fill="#0a0c10" stroke="#888780" stroke-width="2"/>
  <rect x="${w*.28}" y="${h*.22}" width="${w*.44}" height="${h*.16}" rx="5" fill="#0a0c10" stroke="#888780" stroke-width="1.2"/>
  <rect x="${w*.32}" y="${h*.25}" width="${w*.36}" height="${h*.08}" rx="3" fill="#888780" opacity=".2"/>
  <rect x="${w*.35}" y="${h*.27}" width="${w*.3}" height="${h*.04}" rx="2" fill="#888fa0" opacity=".7"/>
  <rect x="${w*.13}" y="${h*.46}" width="${w*.2}" height="${h*.36}" rx="5" fill="#0a0c10" stroke="#888780" stroke-width="1.5"/>
  <rect x="${w*.67}" y="${h*.46}" width="${w*.2}" height="${h*.36}" rx="5" fill="#0a0c10" stroke="#888780" stroke-width="1.5"/>
  <rect x="${w*.34}" y="${h*.4}" width="${w*.32}" height="${h*.4}" rx="5" fill="#0a0c10" stroke="#888780" stroke-width="1"/>
  <rect x="0" y="${h*.94}" width="${w}" height="${h*.06}" fill="#f04880" opacity=".5"/>
</svg>`,
// Card arts
fire_art:(w,h)=>`<svg width="${w}" height="${h}" viewBox="0 0 200 143" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="hm-bg" cx="50%" cy="60%" r="70%">
      <stop offset="0%" stop-color="#3a0800"/>
      <stop offset="100%" stop-color="#0e0200"/>
    </radialGradient>
    <radialGradient id="hm-core" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#fff8e0" stop-opacity="1"/>
      <stop offset="30%" stop-color="#ffb030"/>
      <stop offset="100%" stop-color="#ff4000" stop-opacity="0"/>
    </radialGradient>
    <filter id="hm-glow">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <!-- bg -->
  <rect width="200" height="143" fill="url(#hm-bg)"/>
  <!-- heat shimmer lines -->
  <line x1="0" y1="90" x2="200" y2="85" stroke="#ff6020" stroke-width=".5" opacity=".15"/>
  <line x1="0" y1="100" x2="200" y2="95" stroke="#ff6020" stroke-width=".5" opacity=".1"/>
  <!-- missile body -->
  <g transform="translate(100,71.5) rotate(-30)">
    <!-- exhaust plume -->
    <ellipse cx="-48" cy="0" rx="28" ry="10" fill="#ff4000" opacity=".25"/>
    <ellipse cx="-38" cy="0" rx="18" ry="7" fill="#ff7020" opacity=".35"/>
    <ellipse cx="-30" cy="0" rx="10" ry="5" fill="#ffb040" opacity=".5"/>
    <!-- body -->
    <rect x="-28" y="-7" width="52" height="14" rx="7" fill="#c0c8d8"/>
    <rect x="-28" y="-7" width="52" height="7" rx="3" fill="#dde4ee"/>
    <!-- panel lines -->
    <line x1="-10" y1="-7" x2="-10" y2="7" stroke="#8090a8" stroke-width="1"/>
    <line x1="8" y1="-7" x2="8" y2="7" stroke="#8090a8" stroke-width="1"/>
    <!-- warhead cone -->
    <polygon points="24,-7 24,7 44,0" fill="#e04020"/>
    <polygon points="24,-7 24,0 44,0" fill="#f06030"/>
    <!-- fins -->
    <polygon points="-28,-7 -38,-18 -22,-7" fill="#a0a8b8"/>
    <polygon points="-28,7 -38,18 -22,7" fill="#a0a8b8"/>
    <!-- engine ring -->
    <ellipse cx="-28" cy="0" rx="5" ry="7" fill="#404858"/>
    <ellipse cx="-28" cy="0" rx="3" ry="5" fill="#ff8030"/>
    <ellipse cx="-28" cy="0" rx="1.5" ry="3" fill="#fff0c0"/>
  </g>
  <!-- impact explosion ahead -->
  <g transform="translate(152,40)">
    <circle r="22" fill="#ff5000" opacity=".12"/>
    <circle r="14" fill="#ff7020" opacity=".2"/>
    <circle r="7" fill="#ffb040" opacity=".4"/>
    <circle r="3" fill="#fff0c0" opacity=".9"/>
    <!-- shrapnel lines -->
    <line x1="0" y1="0" x2="24" y2="-8" stroke="#ff8030" stroke-width="1.5" opacity=".6"/>
    <line x1="0" y1="0" x2="22" y2="12" stroke="#ff6020" stroke-width="1.5" opacity=".5"/>
    <line x1="0" y1="0" x2="-16" y2="-18" stroke="#ff4000" stroke-width="1" opacity=".4"/>
    <line x1="0" y1="0" x2="10" y2="24" stroke="#ff9040" stroke-width="1" opacity=".4"/>
    <line x1="0" y1="0" x2="-20" y2="10" stroke="#ff6020" stroke-width="1" opacity=".35"/>
  </g>
  <!-- speed lines -->
  <line x1="20" y1="55" x2="120" y2="62" stroke="#ff6020" stroke-width="1" opacity=".3"/>
  <line x1="10" y1="65" x2="110" y2="70" stroke="#ff8040" stroke-width=".8" opacity=".25"/>
  <line x1="15" y1="80" x2="115" y2="83" stroke="#ff6020" stroke-width=".6" opacity=".2"/>
  <!-- color bar -->
  <rect x="0" y="139" width="200" height="4" fill="#f06424" opacity=".7"/>
</svg>`,
storm_art:(w,h)=>`<svg width="${w}" height="${h}" viewBox="0 0 200 143" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="ab-bg" cx="50%" cy="40%" r="70%">
      <stop offset="0%" stop-color="#001830"/>
      <stop offset="100%" stop-color="#000408"/>
    </radialGradient>
    <filter id="ab-glow"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <rect width="200" height="143" fill="url(#ab-bg)"/>
  <!-- storm cloud background suggestion -->
  <ellipse cx="100" cy="30" rx="90" ry="28" fill="#0a1830" opacity=".8"/>
  <ellipse cx="60" cy="25" rx="50" ry="20" fill="#0c1e38" opacity=".5"/>
  <ellipse cx="150" cy="28" rx="55" ry="18" fill="#0a1a30" opacity=".5"/>
  <!-- main lightning bolt — jagged -->
  <polyline points="100,10 88,38 105,45 82,78 100,82 72,125" 
            fill="none" stroke="#2a80f0" stroke-width="6" stroke-linejoin="round" stroke-linecap="round" opacity=".3"/>
  <polyline points="100,10 88,38 105,45 82,78 100,82 72,125" 
            fill="none" stroke="#60b4ff" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round" opacity=".6"/>
  <polyline points="100,10 88,38 105,45 82,78 100,82 72,125" 
            fill="none" stroke="#a0d8ff" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round" opacity=".9"/>
  <polyline points="100,10 88,38 105,45 82,78 100,82 72,125" 
            fill="none" stroke="#ffffff" stroke-width=".8" stroke-linejoin="round" stroke-linecap="round"/>
  <!-- secondary bolt -->
  <polyline points="130,18 122,44 138,50 118,90" 
            fill="none" stroke="#2a80f0" stroke-width="3" stroke-linejoin="round" stroke-linecap="round" opacity=".25"/>
  <polyline points="130,18 122,44 138,50 118,90" 
            fill="none" stroke="#60b4ff" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round" opacity=".5"/>
  <polyline points="130,18 122,44 138,50 118,90" 
            fill="none" stroke="#c0e8ff" stroke-width=".7" stroke-linejoin="round" stroke-linecap="round" opacity=".7"/>
  <!-- glow at strike points -->
  <circle cx="100" cy="10" r="10" fill="#60b4ff" opacity=".2" filter="url(#ab-glow)"/>
  <circle cx="105" cy="45" r="8" fill="#60b4ff" opacity=".3"/>
  <circle cx="82" cy="78" r="6" fill="#a0d8ff" opacity=".4"/>
  <circle cx="72" cy="125" r="14" fill="#2a80f0" opacity=".2"/>
  <circle cx="72" cy="125" r="8" fill="#60b4ff" opacity=".4"/>
  <circle cx="72" cy="125" r="4" fill="#c0e8ff" opacity=".8"/>
  <!-- charge medal pip icon -->
  <rect x="155" y="20" width="8" height="4" rx="2" fill="#60b4ff" opacity=".8"/>
  <text x="165" y="24" font-size="8" fill="#60b4ff" opacity=".8" font-family="monospace">+1</text>
  <!-- impact sparks -->
  <line x1="72" y1="125" x2="90" y2="118" stroke="#60b4ff" stroke-width="1.5" opacity=".7"/>
  <line x1="72" y1="125" x2="58" y2="118" stroke="#a0d8ff" stroke-width="1.5" opacity=".6"/>
  <line x1="72" y1="125" x2="65" y2="138" stroke="#60b4ff" stroke-width="1" opacity=".5"/>
  <line x1="72" y1="125" x2="85" y2="135" stroke="#2a80f0" stroke-width="1" opacity=".4"/>
  <!-- electric aura around bolt -->
  <polyline points="96,10 84,38 101,45 78,78 96,82 68,125" 
            fill="none" stroke="#2a80f0" stroke-width="8" stroke-linejoin="round" opacity=".08"/>
  <rect x="0" y="139" width="200" height="4" fill="#2a80f0" opacity=".7"/>
</svg>`,
fw_art:(w,h)=>`<svg width="${w}" height="${h}" viewBox="0 0 200 143" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="fw-bg" cx="30%" cy="50%" r="80%">
      <stop offset="0%" stop-color="#280a00"/>
      <stop offset="100%" stop-color="#0a0200"/>
    </radialGradient>
    <filter id="fw-glow"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <rect width="200" height="143" fill="url(#fw-bg)"/>
  <!-- whip arc — main flame lash -->
  <path d="M 20,120 C 40,60 80,20 140,30 C 170,35 185,55 180,75 C 175,92 160,95 150,90" 
        fill="none" stroke="#ff4000" stroke-width="8" stroke-linecap="round" opacity=".4"/>
  <path d="M 20,120 C 40,60 80,20 140,30 C 170,35 185,55 180,75 C 175,92 160,95 150,90" 
        fill="none" stroke="#ff7020" stroke-width="5" stroke-linecap="round" opacity=".6"/>
  <path d="M 20,120 C 40,60 80,20 140,30 C 170,35 185,55 180,75 C 175,92 160,95 150,90" 
        fill="none" stroke="#ffb040" stroke-width="2.5" stroke-linecap="round" opacity=".9"/>
  <path d="M 20,120 C 40,60 80,20 140,30 C 170,35 185,55 180,75 C 175,92 160,95 150,90" 
        fill="none" stroke="#fff8e0" stroke-width="1" stroke-linecap="round"/>
  <!-- flame tongues along whip -->
  <ellipse cx="70" cy="58" rx="8" ry="14" fill="#ff6020" opacity=".5" transform="rotate(-40 70 58)"/>
  <ellipse cx="70" cy="58" rx="4" ry="8" fill="#ffb040" opacity=".7" transform="rotate(-40 70 58)"/>
  <ellipse cx="110" cy="38" rx="7" ry="12" fill="#ff5010" opacity=".5" transform="rotate(-20 110 38)"/>
  <ellipse cx="110" cy="38" rx="3.5" ry="7" fill="#ffb040" opacity=".7" transform="rotate(-20 110 38)"/>
  <ellipse cx="155" cy="42" rx="9" ry="16" fill="#ff4000" opacity=".5" transform="rotate(15 155 42)"/>
  <ellipse cx="155" cy="42" rx="5" ry="9" fill="#ffb040" opacity=".7" transform="rotate(15 155 42)"/>
  <!-- whip handle -->
  <rect x="8" y="108" width="24" height="8" rx="4" fill="#604030" transform="rotate(-30 8 108)"/>
  <rect x="8" y="108" width="24" height="4" rx="2" fill="#8a5c40" transform="rotate(-30 8 108)"/>
  <!-- tip spark -->
  <circle cx="152" cy="91" r="6" fill="#fff0c0" opacity=".9" filter="url(#fw-glow)"/>
  <circle cx="152" cy="91" r="3" fill="#ffffff"/>
  <!-- embers -->
  <circle cx="130" cy="50" r="2" fill="#ff8030" opacity=".8"/>
  <circle cx="165" cy="60" r="1.5" fill="#ffb040" opacity=".7"/>
  <circle cx="95" cy="45" r="1.5" fill="#ff6020" opacity=".6"/>
  <circle cx="50" cy="80" r="2" fill="#ff4000" opacity=".5"/>
  <rect x="0" y="139" width="200" height="4" fill="#f06424" opacity=".7"/>
</svg>`,
  sc_art:(w,h)=>`<svg width="${w}" height="${h}" viewBox="0 0 200 143" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="sc-bg" cx="50%" cy="50%" r="60%">
      <stop offset="0%" stop-color="#2a0800"/>
      <stop offset="100%" stop-color="#080200"/>
    </radialGradient>
    <radialGradient id="sc-eye" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#fff8c0"/>
      <stop offset="40%" stop-color="#ff8020"/>
      <stop offset="100%" stop-color="#ff2000" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="200" height="143" fill="url(#sc-bg)"/>
  <!-- burning target silhouette -->
  <!-- ground scorch marks -->
  <ellipse cx="100" cy="115" rx="60" ry="12" fill="#200600" opacity=".8"/>
  <ellipse cx="100" cy="115" rx="40" ry="7" fill="#300a00" opacity=".6"/>
  <!-- burning bot outline -->
  <ellipse cx="100" cy="80" rx="28" ry="30" fill="#1a0400" stroke="#ff4000" stroke-width="1" opacity=".6"/>
  <ellipse cx="100" cy="80" rx="22" ry="24" fill="#100200" opacity=".8"/>
  <!-- eye sockets -->
  <ellipse cx="88" cy="72" rx="7" ry="8" fill="#080100"/>
  <ellipse cx="112" cy="72" rx="7" ry="8" fill="#080100"/>
  <!-- fire filling the eyes — the "scorch" look -->
  <ellipse cx="88" cy="72" rx="6" ry="7" fill="url(#sc-eye)" opacity=".9"/>
  <ellipse cx="112" cy="72" rx="6" ry="7" fill="url(#sc-eye)" opacity=".9"/>
  <!-- crack lines across bot -->
  <path d="M80 55 L85 65 L78 75 L84 88" fill="none" stroke="#ff4000" stroke-width="1.5" opacity=".8"/>
  <path d="M110 58 L115 70 L108 80 L114 92" fill="none" stroke="#ff5010" stroke-width="1.5" opacity=".7"/>
  <path d="M88 95 L100 100 L112 95" fill="none" stroke="#ff3000" stroke-width="1" opacity=".6"/>
  <!-- fire columns erupting -->
  <g opacity=".85">
    <ellipse cx="72" cy="55" rx="6" ry="18" fill="#ff4000" opacity=".4"/>
    <ellipse cx="72" cy="50" rx="4" ry="12" fill="#ff7020" opacity=".6"/>
    <ellipse cx="72" cy="46" rx="2.5" ry="7" fill="#ffb040" opacity=".9"/>
    <ellipse cx="72" cy="42" rx="1.5" ry="4" fill="#fff0c0"/>
  </g>
  <g opacity=".85">
    <ellipse cx="128" cy="52" rx="7" ry="20" fill="#ff4000" opacity=".4"/>
    <ellipse cx="128" cy="46" rx="5" ry="14" fill="#ff7020" opacity=".6"/>
    <ellipse cx="128" cy="40" rx="3" ry="8" fill="#ffb040" opacity=".9"/>
    <ellipse cx="128" cy="36" rx="1.5" ry="5" fill="#fff0c0"/>
  </g>
  <g opacity=".7">
    <ellipse cx="100" cy="45" rx="8" ry="22" fill="#ff4000" opacity=".3"/>
    <ellipse cx="100" cy="38" rx="5" ry="14" fill="#ff7020" opacity=".6"/>
    <ellipse cx="100" cy="30" rx="3" ry="9" fill="#ffb040" opacity=".9"/>
    <ellipse cx="100" cy="23" rx="2" ry="5" fill="#fff0c0"/>
  </g>
  <!-- floating embers -->
  <circle cx="55" cy="40" r="1.5" fill="#ff8030" opacity=".8"/>
  <circle cx="150" cy="35" r="2" fill="#ffb040" opacity=".7"/>
  <circle cx="165" cy="55" r="1.5" fill="#ff6020" opacity=".6"/>
  <circle cx="40" cy="65" r="1" fill="#ff4000" opacity=".5"/>
  <rect x="0" y="139" width="200" height="4" fill="#f06424" opacity=".7"/>
</svg>`,
  eb_art:(w,h)=>`<svg width="${w}" height="${h}" viewBox="0 0 200 143" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="eb-bg" cx="60%" cy="40%" r="70%">
      <stop offset="0%" stop-color="#200600"/>
      <stop offset="100%" stop-color="#060100"/>
    </radialGradient>
    <filter id="eb-glow"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <rect width="200" height="143" fill="url(#eb-bg)"/>
  <!-- charge orb being thrown -->
  <circle cx="42" cy="100" r="18" fill="#ff4000" opacity=".15"/>
  <circle cx="42" cy="100" r="12" fill="#ff6020" opacity=".25"/>
  <circle cx="42" cy="100" r="7" fill="#ff8030" opacity=".5"/>
  <circle cx="42" cy="100" r="3.5" fill="#ffb040" opacity=".9"/>
  <circle cx="42" cy="100" r="1.5" fill="#fff8c0" filter="url(#eb-glow)"/>
  <!-- spiral energy trail -->
  <path d="M42,100 Q60,80 80,72 Q100,64 120,58 Q145,50 165,42" 
        fill="none" stroke="#ff4000" stroke-width="5" stroke-linecap="round" opacity=".2"/>
  <path d="M42,100 Q60,80 80,72 Q100,64 120,58 Q145,50 165,42" 
        fill="none" stroke="#ff7020" stroke-width="3" stroke-linecap="round" opacity=".5"/>
  <path d="M42,100 Q60,80 80,72 Q100,64 120,58 Q145,50 165,42" 
        fill="none" stroke="#ffb040" stroke-width="1.5" stroke-linecap="round" opacity=".8"/>
  <path d="M42,100 Q60,80 80,72 Q100,64 120,58 Q145,50 165,42" 
        fill="none" stroke="#fff8c0" stroke-width=".7" stroke-linecap="round"/>
  <!-- mini flame wisps along trail -->
  <ellipse cx="75" cy="76" rx="4" ry="8" fill="#ff6020" opacity=".5" transform="rotate(-55 75 76)"/>
  <ellipse cx="75" cy="76" rx="2" ry="5" fill="#ffb040" opacity=".7" transform="rotate(-55 75 76)"/>
  <ellipse cx="115" cy="60" rx="4" ry="8" fill="#ff5010" opacity=".5" transform="rotate(-65 115 60)"/>
  <ellipse cx="115" cy="60" rx="2" ry="5" fill="#ffb040" opacity=".7" transform="rotate(-65 115 60)"/>
  <!-- impact target -->
  <circle cx="165" cy="42" r="20" fill="#ff3000" opacity=".08"/>
  <circle cx="165" cy="42" r="12" fill="#ff5010" opacity=".15"/>
  <circle cx="165" cy="42" r="6" fill="#ff8030" opacity=".5"/>
  <circle cx="165" cy="42" r="3" fill="#ffb040" opacity=".9"/>
  <!-- charge lightning sparks around origin -->
  <line x1="42" y1="100" x2="28" y2="88" stroke="#ffb040" stroke-width="1.5" opacity=".6"/>
  <line x1="42" y1="100" x2="30" y2="112" stroke="#ff8030" stroke-width="1.5" opacity=".5"/>
  <line x1="42" y1="100" x2="56" y2="112" stroke="#ff6020" stroke-width="1" opacity=".5"/>
  <line x1="42" y1="100" x2="24" y2="100" stroke="#ffb040" stroke-width="1" opacity=".4"/>
  <!-- charge pip icon (showing +2 charge) -->
  <rect x="14" y="114" width="10" height="4" rx="2" fill="#ff8030" opacity=".8"/>
  <rect x="27" y="114" width="10" height="4" rx="2" fill="#ff8030" opacity=".8"/>
  <rect x="40" y="114" width="10" height="4" rx="2" fill="#604030" opacity=".4"/>
  <rect x="0" y="139" width="200" height="4" fill="#ff9060" opacity=".7"/>
</svg>`,
  psi_art:(w,h)=>`<svg width="${w}" height="${h}" viewBox="0 0 200 143" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="pp-bg" cx="50%" cy="50%" r="60%">
      <stop offset="0%" stop-color="#140820"/>
      <stop offset="100%" stop-color="#040208"/>
    </radialGradient>
    <radialGradient id="pp-eye" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#e0d0ff"/>
      <stop offset="40%" stop-color="#9070f0"/>
      <stop offset="100%" stop-color="#4020a0" stop-opacity="0"/>
    </radialGradient>
    <filter id="pp-glow"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <rect width="200" height="143" fill="url(#pp-bg)"/>
  <!-- psi rings emanating from center -->
  <circle cx="100" cy="71" r="60" fill="none" stroke="#6040c0" stroke-width="1" opacity=".15"/>
  <circle cx="100" cy="71" r="48" fill="none" stroke="#7050d0" stroke-width="1.2" opacity=".2"/>
  <circle cx="100" cy="71" r="36" fill="none" stroke="#8060e0" stroke-width="1.5" opacity=".28"/>
  <circle cx="100" cy="71" r="24" fill="none" stroke="#9070f0" stroke-width="1.8" opacity=".38"/>
  <circle cx="100" cy="71" r="14" fill="none" stroke="#a080f8" stroke-width="2" opacity=".5"/>
  <!-- psi eye / brain symbol center -->
  <ellipse cx="100" cy="71" rx="22" ry="16" fill="#0c0618" stroke="#9070f0" stroke-width="1.5"/>
  <ellipse cx="100" cy="68" rx="14" ry="10" fill="url(#pp-eye)" opacity=".9"/>
  <!-- pupil -->
  <circle cx="100" cy="68" r="5" fill="#1a0830"/>
  <circle cx="100" cy="68" r="3" fill="#9070f0"/>
  <circle cx="98" cy="66" r="1" fill="#e0d0ff" opacity=".9"/>
  <!-- orbital psi particles -->
  <circle cx="100" cy="35" r="4" fill="#9070f0" opacity=".7" filter="url(#pp-glow)"/>
  <circle cx="100" cy="35" r="2" fill="#d0c0ff"/>
  <circle cx="136" cy="53" r="3.5" fill="#8060d8" opacity=".7"/>
  <circle cx="136" cy="53" r="1.5" fill="#c0b0f8"/>
  <circle cx="130" cy="96" r="3" fill="#7050c0" opacity=".6"/>
  <circle cx="130" cy="96" r="1.5" fill="#b0a0f0"/>
  <circle cx="64" cy="96" r="3.5" fill="#8060d8" opacity=".6"/>
  <circle cx="64" cy="96" r="1.5" fill="#c0b0f8"/>
  <circle cx="64" cy="50" r="3" fill="#7050c0" opacity=".7"/>
  <circle cx="64" cy="50" r="1.5" fill="#b0a0f0"/>
  <!-- connecting trails between particles -->
  <path d="M100,35 Q136,53 130,96 Q64,96 64,50 Q80,20 100,35" 
        fill="none" stroke="#7050c0" stroke-width="1" opacity=".3" stroke-dasharray="4 3"/>
  <!-- card draw icon -->
  <rect x="155" y="18" width="22" height="30" rx="3" fill="#1a0830" stroke="#7050c0" stroke-width="1" opacity=".8"/>
  <rect x="158" y="21" width="16" height="4" rx="1" fill="#8060d8" opacity=".5"/>
  <rect x="158" y="28" width="12" height="3" rx="1" fill="#6040b0" opacity=".4"/>
  <rect x="158" y="33" width="14" height="3" rx="1" fill="#6040b0" opacity=".4"/>
  <text x="162" y="44" font-size="7" fill="#9070f0" opacity=".7" font-family="monospace">+1</text>
  <rect x="0" y="139" width="200" height="4" fill="#9070f0" opacity=".7"/>
</svg>`,
earth_art:(w,h)=>`<svg width="${w}" height="${h}" viewBox="0 0 200 143" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="is-bg" cx="50%" cy="60%" r="70%">
      <stop offset="0%" stop-color="#0c1018"/>
      <stop offset="100%" stop-color="#030507"/>
    </radialGradient>
  </defs>
  <rect width="200" height="143" fill="url(#is-bg)"/>
  <!-- massive fist/gauntlet coming down -->
  <!-- arm -->
  <rect x="76" y="0" width="48" height="70" rx="10" fill="#2a3440"/>
  <rect x="78" y="0" width="44" height="68" rx="9" fill="#344050"/>
  <!-- panel lines on arm -->
  <line x1="84" y1="10" x2="84" y2="68" stroke="#1e2830" stroke-width="2"/>
  <line x1="100" y1="8" x2="100" y2="68" stroke="#1e2830" stroke-width="1.5"/>
  <line x1="116" y1="10" x2="116" y2="68" stroke="#1e2830" stroke-width="2"/>
  <line x1="80" y1="30" x2="120" y2="30" stroke="#1e2830" stroke-width="1"/>
  <line x1="80" y1="50" x2="120" y2="50" stroke="#1e2830" stroke-width="1"/>
  <!-- highlight edge -->
  <rect x="78" y="0" width="8" height="68" rx="3" fill="#4a5868" opacity=".4"/>
  <!-- gauntlet fist -->
  <rect x="62" y="60" width="76" height="55" rx="8" fill="#2a3440"/>
  <rect x="65" y="62" width="70" height="51" rx="7" fill="#3a4858"/>
  <!-- knuckle plates -->
  <rect x="68" y="64" width="16" height="20" rx="4" fill="#2a3440" stroke="#4a5868" stroke-width="1"/>
  <rect x="88" y="64" width="16" height="20" rx="4" fill="#2a3440" stroke="#4a5868" stroke-width="1"/>
  <rect x="108" y="64" width="16" height="20" rx="4" fill="#2a3440" stroke="#4a5868" stroke-width="1"/>
  <!-- knuckle highlights -->
  <rect x="69" y="65" width="14" height="6" rx="2" fill="#4a5868" opacity=".6"/>
  <rect x="89" y="65" width="14" height="6" rx="2" fill="#4a5868" opacity=".6"/>
  <rect x="109" y="65" width="14" height="6" rx="2" fill="#4a5868" opacity=".6"/>
  <!-- impact shockwave on ground -->
  <ellipse cx="100" cy="118" rx="65" ry="12" fill="#1e2830" opacity=".6"/>
  <ellipse cx="100" cy="118" rx="48" ry="8" fill="#0a1018" opacity=".8"/>
  <!-- cracks radiating from impact -->
  <path d="M100,118 L60,135" stroke="#4a5868" stroke-width="1.5" opacity=".7"/>
  <path d="M100,118 L140,135" stroke="#4a5868" stroke-width="1.5" opacity=".7"/>
  <path d="M100,118 L45,120" stroke="#4a5868" stroke-width="1" opacity=".6"/>
  <path d="M100,118 L155,122" stroke="#4a5868" stroke-width="1" opacity=".6"/>
  <path d="M100,118 L75,140" stroke="#606e7e" stroke-width="1" opacity=".5"/>
  <path d="M100,118 L125,140" stroke="#606e7e" stroke-width="1" opacity=".5"/>
  <!-- impact flash -->
  <ellipse cx="100" cy="115" rx="50" ry="10" fill="#7090a8" opacity=".08"/>
  <!-- charge drain icon -->
  <text x="155" y="20" font-size="10" fill="#8090a8" opacity=".7" font-family="monospace">−2⚡</text>
  <rect x="0" y="139" width="200" height="4" fill="#8090a0" opacity=".7"/>
</svg>`,
water_art:(w,h)=>`<svg width="${w}" height="${h}" viewBox="0 0 200 143" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="tr-bg" cx="50%" cy="40%" r="70%">
      <stop offset="0%" stop-color="#002018"/>
      <stop offset="100%" stop-color="#000608"/>
    </radialGradient>
    <filter id="tr-glow"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <rect width="200" height="143" fill="url(#tr-bg)"/>
  <!-- wave background -->
  <path d="M-10,95 Q30,75 70,95 Q110,115 150,95 Q175,82 210,95 L210,143 L-10,143Z" 
        fill="#062018" opacity=".6"/>
  <path d="M-10,105 Q30,85 70,105 Q110,125 150,105 Q175,92 210,105 L210,143 L-10,143Z" 
        fill="#041810" opacity=".8"/>
  <!-- main wave crest surging forward -->
  <path d="M-10,70 Q20,45 55,60 Q80,70 100,55 Q125,38 155,55 Q175,65 210,50 L210,90 Q175,78 155,80 Q125,85 100,80 Q80,78 55,88 Q20,95 -10,88Z" 
        fill="#0a3828" opacity=".7"/>
  <path d="M-10,65 Q20,42 55,56 Q80,66 100,50 Q125,34 155,50 Q175,60 210,45 L210,80 Q175,68 155,70 Q125,75 100,70 Q80,68 55,78 Q20,85 -10,78Z" 
        fill="#104830" opacity=".5"/>
  <!-- water surface highlight -->
  <path d="M-10,65 Q20,42 55,56 Q80,66 100,50 Q125,34 155,50 Q175,60 210,45" 
        fill="none" stroke="#20c090" stroke-width="2" opacity=".7"/>
  <path d="M-10,68 Q20,45 55,59 Q80,69 100,53 Q125,37 155,53 Q175,63 210,48" 
        fill="none" stroke="#40e8b8" stroke-width="1" opacity=".5"/>
  <!-- water droplets -->
  <ellipse cx="80" cy="35" rx="3" ry="7" fill="#20c090" opacity=".6" transform="rotate(-20 80 35)"/>
  <ellipse cx="80" cy="35" rx="1.5" ry="4" fill="#40e8b8" opacity=".8" transform="rotate(-20 80 35)"/>
  <ellipse cx="130" cy="28" rx="4" ry="9" fill="#10a070" opacity=".5" transform="rotate(15 130 28)"/>
  <ellipse cx="130" cy="28" rx="2" ry="5" fill="#40e8b8" opacity=".7" transform="rotate(15 130 28)"/>
  <circle cx="50" cy="45" r="3" fill="#20c090" opacity=".6"/>
  <circle cx="160" cy="38" r="2.5" fill="#10c080" opacity=".5"/>
  <circle cx="105" cy="32" r="2" fill="#40e8b8" opacity=".7"/>
  <!-- heal cross glowing in water -->
  <rect x="88" y="22" width="24" height="8" rx="4" fill="#20c090" opacity=".35"/>
  <rect x="96" y="14" width="8" height="24" rx="4" fill="#20c090" opacity=".35"/>
  <rect x="89" y="23" width="22" height="6" rx="3" fill="#40e8b8" opacity=".25"/>
  <rect x="97" y="15" width="6" height="22" rx="3" fill="#40e8b8" opacity=".25"/>
  <!-- glow at heal icon center -->
  <circle cx="100" cy="26" r="5" fill="#40e8b8" opacity=".4" filter="url(#tr-glow)"/>
  <rect x="0" y="139" width="200" height="4" fill="#10c090" opacity=".7"/>
</svg>`,
wind_art:(w,h)=>`<svg width="${w}" height="${h}" viewBox="0 0 200 143" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="cs-bg" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#0a1400"/>
      <stop offset="100%" stop-color="#020400"/>
    </radialGradient>
  </defs>
  <rect width="200" height="143" fill="url(#cs-bg)"/>
  <!-- first target -->
  <circle cx="55" cy="55" r="22" fill="#102000" stroke="#60c020" stroke-width="1" opacity=".6"/>
  <circle cx="55" cy="55" r="14" fill="#0a1800" stroke="#80d030" stroke-width=".5" opacity=".5"/>
  <circle cx="55" cy="55" r="6" fill="#60c020" opacity=".4"/>
  <!-- second target -->
  <circle cx="152" cy="88" r="18" fill="#102000" stroke="#60c020" stroke-width="1" opacity=".5"/>
  <circle cx="152" cy="88" r="11" fill="#0a1800" opacity=".7"/>
  <circle cx="152" cy="88" r="5" fill="#60c020" opacity=".35"/>
  <!-- chain lightning connecting them -->
  <path d="M55,55 Q80,30 110,50 Q135,65 152,88" 
        fill="none" stroke="#40a010" stroke-width="5" stroke-linecap="round" opacity=".2"/>
  <path d="M55,55 Q80,30 110,50 Q135,65 152,88" 
        fill="none" stroke="#70c030" stroke-width="3" stroke-linecap="round" opacity=".5"/>
  <path d="M55,55 Q80,30 110,50 Q135,65 152,88" 
        fill="none" stroke="#90e040" stroke-width="1.5" stroke-linecap="round" opacity=".8"/>
  <path d="M55,55 Q80,30 110,50 Q135,65 152,88" 
        fill="none" stroke="#c0f870" stroke-width=".7" stroke-linecap="round"/>
  <!-- spark origin point -->
  <circle cx="55" cy="55" r="9" fill="#90e040" opacity=".3"/>
  <circle cx="55" cy="55" r="4" fill="#c0f870" opacity=".8"/>
  <circle cx="55" cy="55" r="1.5" fill="#ffffff"/>
  <!-- chain arc nodes -->
  <circle cx="90" cy="38" r="5" fill="#70c030" opacity=".5"/>
  <circle cx="90" cy="38" r="2.5" fill="#c0f870" opacity=".8"/>
  <circle cx="120" cy="54" r="4" fill="#60c020" opacity=".5"/>
  <circle cx="120" cy="54" r="2" fill="#90e040" opacity=".8"/>
  <!-- splash indicator at second target -->
  <path d="M152,88 L168,78 M152,88 L172,95 M152,88 L162,105 M152,88 L140,104 M152,88 L135,82" 
        stroke="#60c020" stroke-width="1.5" stroke-linecap="round" opacity=".6"/>
  <!-- leaf/wind detail at origin — wind element -->
  <ellipse cx="35" cy="80" rx="5" ry="14" fill="#40a010" opacity=".35" transform="rotate(-30 35 80)"/>
  <ellipse cx="35" cy="80" rx="2.5" ry="8" fill="#80d030" opacity=".5" transform="rotate(-30 35 80)"/>
  <ellipse cx="75" cy="35" rx="4" ry="10" fill="#40a010" opacity=".3" transform="rotate(20 75 35)"/>
  <ellipse cx="75" cy="35" rx="2" ry="6" fill="#70c030" opacity=".5" transform="rotate(20 75 35)"/>
  <rect x="0" y="139" width="200" height="4" fill="#60c020" opacity=".7"/>
</svg>`,
mf_art:(w,h)=>`<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg"><rect width="${w}" height="${h}" fill="#1a0202"/><circle cx="${w/2}" cy="${h*.5}" r="${w*.44}" fill="#140102" stroke="#f04040" stroke-width="1"/><circle cx="${w/2}" cy="${h*.5}" r="${w*.3}" fill="#0e0101" stroke="#a02020" stroke-width=".6"/><polygon points="${w/2},${h*.18} ${w*.56},${h*.42} ${w*.82},${h*.42} ${w*.62},${h*.56} ${w*.68},${h*.82} ${w/2},${h*.68} ${w*.32},${h*.82} ${w*.38},${h*.56} ${w*.18},${h*.42} ${w*.44},${h*.42}" fill="#f04040" opacity=".9"/><circle cx="${w/2}" cy="${h*.5}" r="${w*.07}" fill="#0e0101"/><circle cx="${w/2}" cy="${h*.5}" r="${w*.04}" fill="#ff8888"/></svg>`,
act_art:(w,h)=>`<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg"><rect width="${w}" height="${h}" fill="#081206"/><circle cx="${w*.36}" cy="${h*.5}" r="${w*.22}" fill="#081206" stroke="#3a7010" stroke-width="1.5"/><circle cx="${w*.64}" cy="${h*.5}" r="${w*.22}" fill="#081206" stroke="#3a7010" stroke-width="1.5"/><rect x="${w*.36}" y="${h*.43}" width="${w*.28}" height="${h*.14}" rx="${h*.06}" fill="#081206" stroke="#3a7010" stroke-width="1.5"/><circle cx="${w*.36}" cy="${h*.5}" r="${w*.12}" fill="#3a7010" opacity=".8"/><circle cx="${w*.64}" cy="${h*.5}" r="${w*.12}" fill="#3a7010" opacity=".8"/><rect x="${w*.42}" y="${h*.46}" width="${w*.16}" height="${h*.08}" rx="${h*.04}" fill="#3a7010" opacity=".7"/></svg>`,
eq_art:(w,h)=>`<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg"><rect width="${w}" height="${h}" fill="#0e0618"/><polygon points="${w/2},${h*.14} ${w*.62},${h*.28} ${w*.86},${h*.28} ${w*.74},${h*.44} ${w*.86},${h*.72} ${w/2},${h*.58} ${w*.14},${h*.72} ${w*.26},${h*.44} ${w*.14},${h*.28} ${w*.38},${h*.28}" fill="#280e48" stroke="#a060f0" stroke-width=".8"/><circle cx="${w/2}" cy="${h*.44}" r="${w*.14}" fill="#0e0618" stroke="#a060f0" stroke-width="1.5"/><circle cx="${w/2}" cy="${h*.44}" r="${w*.08}" fill="#a060f0" opacity=".8"/><circle cx="${w/2}" cy="${h*.44}" r="${w*.04}" fill="#d0a8ff"/></svg>`,
mc_card_art:(w,h)=>`<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg"><rect width="${w}" height="${h}" fill="#180408"/><circle cx="${w/2}" cy="${h*.5}" r="${w*.44}" fill="#100204" stroke="#f04880" stroke-width="1"/><circle cx="${w/2}" cy="${h*.5}" r="${w*.3}" fill="none" stroke="#f04880" stroke-width=".6" opacity=".5"/><circle cx="${w/2}" cy="${h*.5}" r="${w*.42}" fill="none" stroke="#f04880" stroke-width=".5" opacity=".2" stroke-dasharray="5 3"/><ellipse cx="${w/2}" cy="${h*.4}" rx="${w*.18}" ry="${h*.16}" fill="#1a0408" stroke="#f04880" stroke-width="1.2"/><ellipse cx="${w*.37}" cy="${h*.39}" rx="${w*.06}" ry="${h*.07}" fill="#f04880" opacity=".8"/><ellipse cx="${w*.63}" cy="${h*.39}" rx="${w*.06}" ry="${h*.07}" fill="#f04880" opacity=".8"/><rect x="${w*.38}" y="${h*.56}" width="${w*.24}" height="${h*.28}" rx="4" fill="#140408" stroke="#f04880" stroke-width="1"/></svg>`,
};
function gA(k,w,h){return(ART[k]||ART.act_art)(w,h);}

