// Green Vibes — assets/garden-visuals.js
// Inline SVG botanical illustrations — premium rendering v2
// Zone card backgrounds keyed by dominant family

var GV_GARDEN_BANNER = `<svg viewBox="0 0 420 165" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
  <defs>
    <linearGradient id="gbs" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#e4f4ed"/>
      <stop offset="35%" stop-color="#c2e8d4"/>
      <stop offset="70%" stop-color="#a4d8bc"/>
      <stop offset="100%" stop-color="#8ccca8"/>
    </linearGradient>
    <radialGradient id="gbsg" cx="12%" cy="8%" r="45%">
      <stop offset="0%" stop-color="#fffde7" stop-opacity="1"/>
      <stop offset="30%" stop-color="#fef9c3" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="#fef08a" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="gbsa" cx="14%" cy="10%" r="65%">
      <stop offset="0%" stop-color="#fbbf24" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="#fbbf24" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="gbtr" cx="32%" cy="22%" r="68%">
      <stop offset="0%" stop-color="#fca5a5"/>
      <stop offset="50%" stop-color="#ef4444"/>
      <stop offset="100%" stop-color="#991b1b"/>
    </radialGradient>
    <radialGradient id="gbto" cx="30%" cy="20%" r="65%">
      <stop offset="0%" stop-color="#fed7aa"/>
      <stop offset="55%" stop-color="#fb923c"/>
      <stop offset="100%" stop-color="#c2410c"/>
    </radialGradient>
    <linearGradient id="gbsl" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#523214"/>
      <stop offset="45%" stop-color="#3e2208"/>
      <stop offset="100%" stop-color="#1e0f04"/>
    </linearGradient>
    <radialGradient id="gbv" cx="50%" cy="55%" r="75%">
      <stop offset="0%" stop-color="rgba(0,0,0,0)"/>
      <stop offset="100%" stop-color="rgba(0,0,0,0.26)"/>
    </radialGradient>
    <filter id="gbf1"><feGaussianBlur stdDeviation="1.8"/></filter>
    <filter id="gbf2"><feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="#000" flood-opacity="0.2"/></filter>
    <filter id="gbf3"><feGaussianBlur stdDeviation="3.5"/></filter>
  </defs>

  <!-- Sky -->
  <rect width="420" height="165" fill="url(#gbs)"/>
  <!-- Sun corona -->
  <circle cx="52" cy="14" r="26" fill="url(#gbsg)"/>
  <!-- Warm ambient -->
  <rect width="420" height="165" fill="url(#gbsa)"/>

  <!-- Raised bed frame -->
  <rect x="18" y="115" width="384" height="46" rx="5" fill="#5c3418"/>
  <rect x="18" y="111" width="384" height="10" rx="3" fill="#7c5030"/>
  <rect x="18" y="111" width="384" height="3"  rx="2" fill="#9e6c46" opacity="0.85"/>
  <line x1="82"  y1="115" x2="82"  y2="161" stroke="#4a2818" stroke-width="1"   opacity="0.5"/>
  <line x1="162" y1="115" x2="162" y2="161" stroke="#4a2818" stroke-width="1"   opacity="0.45"/>
  <line x1="242" y1="115" x2="242" y2="161" stroke="#4a2818" stroke-width="1"   opacity="0.45"/>
  <line x1="322" y1="115" x2="322" y2="161" stroke="#4a2818" stroke-width="1"   opacity="0.5"/>
  <path d="M20,130 Q55,128 82,130 Q120,132 162,130" stroke="#4a2818" stroke-width="0.5" fill="none" opacity="0.28"/>
  <path d="M162,138 Q202,136 242,138 Q282,140 322,138" stroke="#4a2818" stroke-width="0.5" fill="none" opacity="0.28"/>

  <!-- Soil -->
  <rect x="20" y="119" width="380" height="38" rx="2" fill="url(#gbsl)"/>
  <path d="M20,121 Q60,119 100,121 Q140,123 180,121 Q220,119 260,121 Q300,123 340,121 Q370,119 400,121" stroke="#5e3c1a" stroke-width="1" fill="none" opacity="0.55"/>
  <rect x="20" y="119" width="380" height="4" rx="2" fill="#5e3c1a" opacity="0.5"/>

  <!-- Back plant layer (blurred depth) -->
  <g opacity="0.45" filter="url(#gbf1)">
    <line x1="210" y1="119" x2="208" y2="58" stroke="#4e8028" stroke-width="2.5"/>
    <path d="M208,86 C196,74 192,56 202,50 C208,46 211,60 208,86Z" fill="#5a9030"/>
    <path d="M208,80 C220,68 224,50 214,44 C208,40 205,54 208,80Z" fill="#6aa838"/>
    <circle cx="208" cy="51" r="10" fill="#dc2626" opacity="0.75"/>
    <circle cx="222" cy="46" r="8"  fill="#b91c1c" opacity="0.65"/>
  </g>

  <!-- Plant 1: Tomato (left) -->
  <line x1="72" y1="119" x2="70" y2="36" stroke="#4a7c24" stroke-width="3" stroke-linecap="round"/>
  <path d="M70,80 Q50,64 44,46" stroke="#4a7c24" stroke-width="2.2" fill="none" stroke-linecap="round"/>
  <path d="M70,70 Q92,54 97,36" stroke="#4a7c24" stroke-width="2.2" fill="none" stroke-linecap="round"/>
  <path d="M46,52 C34,41 31,26 40,21 C47,18 50,30 46,52Z" fill="#3d6e1e"/>
  <path d="M44,50 C30,43 26,28 35,23 C42,20 45,33 44,50Z" fill="#4e8c28"/>
  <path d="M48,45 C37,35 37,20 46,17 C52,15 54,27 48,45Z" fill="#60a832"/>
  <path d="M95,44 C106,33 109,19 100,15 C94,12 90,25 95,44Z" fill="#3d6e1e"/>
  <path d="M97,41 C109,30 111,16 102,12 C96,9 92,22 97,41Z" fill="#4e8c28"/>
  <path d="M70,68 C56,56 52,40 62,34 C69,30 72,42 70,68Z" fill="#2e5c16"/>
  <path d="M70,60 C84,48 88,32 78,26 C71,22 68,35 70,60Z" fill="#4e8c28"/>
  <path d="M70,50 C60,40 59,24 67,20 C73,18 75,30 70,50Z" fill="#3d7820"/>
  <circle cx="45" cy="44" r="11.5" fill="url(#gbtr)" filter="url(#gbf2)"/>
  <ellipse cx="40" cy="38" rx="3.8" ry="2.8" fill="rgba(255,255,255,0.24)" transform="rotate(-25 40 38)"/>
  <circle cx="40" cy="34"  r="2.2" fill="#1b5e20"/>
  <circle cx="97" cy="37" r="9.5"  fill="url(#gbtr)" filter="url(#gbf2)"/>
  <ellipse cx="93" cy="31" rx="3.2" ry="2.3" fill="rgba(255,255,255,0.22)" transform="rotate(-22 93 31)"/>
  <circle cx="93" cy="28"  r="1.9" fill="#1b5e20"/>
  <circle cx="70" cy="33" r="8"    fill="url(#gbto)" filter="url(#gbf2)"/>
  <ellipse cx="66" cy="27" rx="2.8" ry="2" fill="rgba(255,255,255,0.22)" transform="rotate(-25 66 27)"/>
  <circle cx="58" cy="23" r="5.5" fill="#86efac" opacity="0.9"/>
  <circle cx="82" cy="20" r="5"   fill="#a7f3d0" opacity="0.85"/>

  <!-- Plant 2: Herbs (center-left) -->
  <line x1="160" y1="119" x2="160" y2="64" stroke="#3a6e18" stroke-width="2.5" stroke-linecap="round"/>
  <ellipse cx="160" cy="63" rx="28" ry="22" fill="#2a5e14" filter="url(#gbf1)"/>
  <ellipse cx="155" cy="57" rx="20" ry="15" fill="#367a1c"/>
  <ellipse cx="163" cy="51" rx="16" ry="12" fill="#4496twentyfour"/>
  <ellipse cx="163" cy="51" rx="16" ry="12" fill="#449624"/>
  <ellipse cx="158" cy="46" rx="13" ry="10" fill="#52b02c"/>
  <ellipse cx="162" cy="41" rx="10" ry="8"  fill="#64ca36"/>
  <ellipse cx="159" cy="36" rx="7"  ry="6"  fill="#7ae040"/>
  <path d="M153,60 C140,50 137,35 147,29 C154,26 157,40 153,60Z" fill="#3a8020"/>
  <path d="M167,55 C180,45 183,30 173,24 C166,21 163,35 167,55Z" fill="#4a9828"/>
  <path d="M160,66 C146,57 143,40 154,34 C161,30 164,44 160,66Z" fill="#266010"/>

  <!-- Plant 3: Courgette (center) -->
  <line x1="256" y1="119" x2="253" y2="80" stroke="#4a7c1c" stroke-width="3.5" stroke-linecap="round"/>
  <path d="M253,110 C220,94 208,64 231,54 C246,48 257,72 253,110Z" fill="#527c1a" filter="url(#gbf1)" opacity="0.9"/>
  <path d="M253,110 C220,94 208,64 231,54 C246,48 257,72 253,110Z" fill="#62941e" opacity="0.88"/>
  <path d="M253,100 C285,84 297,54 276,44 C261,38 250,63 253,100Z" fill="#74ac26"/>
  <path d="M253,88 C238,74 234,54 247,46 C255,42 260,60 253,88Z" fill="#88c430"/>
  <path d="M243,70 Q222,78 215,92" stroke="#4e7018" stroke-width="1.2" fill="none" opacity="0.65"/>
  <path d="M243,70 Q226,66 220,72" stroke="#4e7018" stroke-width="0.9" fill="none" opacity="0.55"/>
  <path d="M263,59 Q282,65 288,78" stroke="#4e7018" stroke-width="0.9" fill="none" opacity="0.55"/>
  <g transform="rotate(-26 240 107)">
    <ellipse cx="240" cy="107" rx="21" ry="8.5" fill="#b8dc84"/>
    <ellipse cx="240" cy="107" rx="19" ry="7"   fill="#a0c868"/>
    <line x1="222" y1="107" x2="258" y2="107" stroke="#88ae50" stroke-width="1.4" opacity="0.45"/>
    <ellipse cx="240" cy="107" rx="6" ry="6"   fill="#88ae50" opacity="0.48"/>
    <ellipse cx="258" cy="107" rx="5" ry="5"   fill="#78a040" opacity="0.55"/>
  </g>
  <circle cx="270" cy="53" r="9"  fill="#ffd700" filter="url(#gbf2)" opacity="0.96"/>
  <circle cx="270" cy="53" r="5.5" fill="#ffaa00"/>
  <circle cx="270" cy="53" r="2.8" fill="#ff8800"/>

  <!-- Plant 4: Lettuce (right-center) -->
  <line x1="334" y1="119" x2="333" y2="80" stroke="#2e6e18" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M334,92 C310,77 302,55 318,46 C327,41 335,63 334,92Z" fill="#8cd898"/>
  <path d="M334,90 C358,75 366,53 350,44 C341,39 333,61 334,90Z" fill="#a4e4b0"/>
  <path d="M334,84 C313,70 307,48 322,40 C331,36 337,56 334,84Z" fill="#70c280"/>
  <path d="M334,78 C354,62 362,40 347,33 C338,29 332,50 334,78Z" fill="#8cd498"/>
  <ellipse cx="334" cy="61" rx="16" ry="20" fill="#eaf8ee" opacity="0.5"/>
  <ellipse cx="334" cy="56" rx="11" ry="14" fill="#f2fcf4" opacity="0.6"/>

  <!-- Plant 5: Carrots (right) -->
  <line x1="388" y1="119" x2="387" y2="74" stroke="#3d7220" stroke-width="2" stroke-linecap="round"/>
  <path d="M387,105 C373,89 370,68 380,61 C387,56 390,73 387,105Z" fill="#488c26"/>
  <path d="M387,96 C402,80 406,59 395,52 C388,47 384,64 387,96Z" fill="#58a830"/>
  <path d="M387,88 C374,73 373,53 383,47 C390,43 392,60 387,88Z" fill="#387c1e"/>
  <path d="M387,79 C400,65 404,44 393,38 C386,34 382,52 387,79Z" fill="#64c038"/>
  <path d="M384,122 C381,113 382,107 385,104 C388,101 391,107 390,122Z" fill="#ff9100"/>
  <path d="M391,122 C390,114 389,108 393,106 C396,103 398,109 397,122Z" fill="#ffa000"/>

  <!-- Dewdrops -->
  <ellipse cx="40" cy="39"  rx="3"   ry="2.2" fill="rgba(255,255,255,0.75)" transform="rotate(-22 40 39)"/>
  <ellipse cx="97" cy="31"  rx="2.4" ry="1.8" fill="rgba(255,255,255,0.65)" transform="rotate(10 97 31)"/>
  <ellipse cx="172" cy="49" rx="2.2" ry="1.6" fill="rgba(255,255,255,0.6)"  transform="rotate(-20 172 49)"/>
  <ellipse cx="267" cy="44" rx="2.6" ry="1.9" fill="rgba(255,255,255,0.7)"  transform="rotate(5 267 44)"/>
  <ellipse cx="340" cy="56" rx="2.2" ry="1.6" fill="rgba(255,255,255,0.6)"  transform="rotate(-10 340 56)"/>

  <!-- Butterfly -->
  <path d="M135,34 C130,25 123,23 125,27 C127,32 132,32 135,34Z" fill="#fbbf24" opacity="0.78"/>
  <path d="M135,34 C140,25 147,23 145,27 C143,32 138,32 135,34Z" fill="#f59e0b" opacity="0.78"/>

  <!-- Ground mist -->
  <rect x="18" y="108" width="384" height="10" fill="rgba(255,255,255,0.1)" rx="3"/>

  <!-- Vignette -->
  <rect width="420" height="165" fill="url(#gbv)"/>
</svg>`;

var GV_ZONE_VISUALS = {

Solanacees: `<svg viewBox="0 0 160 80" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
  <defs>
    <linearGradient id="zsb" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1c0808"/>
      <stop offset="42%" stop-color="#4a1212"/>
      <stop offset="100%" stop-color="#6e1c1c"/>
    </linearGradient>
    <radialGradient id="zsg" cx="18%" cy="12%" r="56%">
      <stop offset="0%" stop-color="#fbbf24" stop-opacity="0.28"/>
      <stop offset="100%" stop-color="#fbbf24" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="zst1" cx="32%" cy="22%" r="68%">
      <stop offset="0%" stop-color="#ff9090"/>
      <stop offset="48%" stop-color="#ef4444"/>
      <stop offset="100%" stop-color="#991b1b"/>
    </radialGradient>
    <radialGradient id="zst2" cx="30%" cy="20%" r="65%">
      <stop offset="0%" stop-color="#fed7aa"/>
      <stop offset="52%" stop-color="#fb923c"/>
      <stop offset="100%" stop-color="#c2410c"/>
    </radialGradient>
    <radialGradient id="zsg2" cx="35%" cy="25%" r="65%">
      <stop offset="0%" stop-color="#bbf7d0"/>
      <stop offset="100%" stop-color="#4ade80"/>
    </radialGradient>
    <linearGradient id="zssoil" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#3e1c0a"/>
      <stop offset="100%" stop-color="#1a0a04"/>
    </linearGradient>
    <radialGradient id="zsv" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="rgba(0,0,0,0)"/>
      <stop offset="100%" stop-color="rgba(0,0,0,0.32)"/>
    </radialGradient>
    <filter id="zsf1"><feGaussianBlur stdDeviation="1.6"/></filter>
    <filter id="zsf2"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000" flood-opacity="0.28"/></filter>
  </defs>
  <rect width="160" height="80" fill="url(#zsb)"/>
  <rect width="160" height="80" fill="url(#zsg)"/>
  <rect x="0" y="63" width="160" height="17" fill="url(#zssoil)"/>
  <path d="M0,63 Q20,61 40,63 Q60,65 80,63 Q100,61 120,63 Q140,65 160,63" stroke="#503020" stroke-width="0.9" fill="none" opacity="0.65"/>
  <!-- Depth plant (blurred) -->
  <g opacity="0.32" filter="url(#zsf1)">
    <line x1="100" y1="63" x2="99" y2="26" stroke="#558c2a" stroke-width="2.2"/>
    <path d="M99,44 C90,36 89,23 96,20 C102,18 104,28 99,44Z" fill="#5a9c2e"/>
    <circle cx="99" cy="21" r="8" fill="#dc2626"/>
  </g>
  <!-- Plant 1 (left) -->
  <line x1="36" y1="63" x2="34" y2="12" stroke="#3d7020" stroke-width="2.6" stroke-linecap="round"/>
  <path d="M34,42 Q19,29 15,16" stroke="#3d7020" stroke-width="1.9" fill="none" stroke-linecap="round"/>
  <path d="M34,34 Q49,21 53,8"  stroke="#3d7020" stroke-width="1.9" fill="none" stroke-linecap="round"/>
  <path d="M17,20 C8,11 6,0 13,-3 C19,-5 21,6 17,20Z"  fill="#3d6e1e"/>
  <path d="M15,18 C4,12 0,1 8,-2 C14,-4 16,7 15,18Z"   fill="#4c8a28"/>
  <path d="M19,14 C10,5 10,-6 17,-9 C23,-11 25,-1 19,14Z" fill="#60a432"/>
  <path d="M51,11 C60,2 62,-9 55,-12 C49,-14 46,-3 51,11Z" fill="#3d6e1e"/>
  <path d="M53,8 C62,-1 64,-12 57,-15 C51,-17 48,-6 53,8Z"  fill="#4c8a28"/>
  <path d="M34,37 C22,26 19,11 28,7 C35,4 37,15 34,37Z" fill="#2c5818"/>
  <path d="M34,31 C46,20 48,5 40,2 C34,-1 31,10 34,31Z"  fill="#3d7020"/>
  <path d="M34,23 C25,13 25,0 32,-3 C38,-5 40,6 34,23Z"  fill="#4c8a28"/>
  <circle cx="16" cy="16" r="10"   fill="url(#zst1)" filter="url(#zsf2)"/>
  <ellipse cx="11" cy="10" rx="3.2" ry="2.4" fill="rgba(255,255,255,0.24)" transform="rotate(-26 11 10)"/>
  <circle cx="11" cy="7"   r="2"   fill="#1b5e20"/>
  <circle cx="52" cy="8"  r="8.5"  fill="url(#zst1)" filter="url(#zsf2)"/>
  <ellipse cx="48" cy="3"  rx="2.8" ry="2" fill="rgba(255,255,255,0.22)" transform="rotate(-22 48 3)"/>
  <circle cx="34" cy="10" r="7"    fill="url(#zst2)" filter="url(#zsf2)"/>
  <ellipse cx="30" cy="5"  rx="2.4" ry="1.7" fill="rgba(255,255,255,0.22)" transform="rotate(-22 30 5)"/>
  <circle cx="24" cy="1"  r="4.5" fill="#86efac" opacity="0.9"/>
  <circle cx="43" cy="-1" r="4"   fill="#a7f3d0" opacity="0.85"/>
  <!-- Plant 2 (right) -->
  <line x1="124" y1="63" x2="122" y2="14" stroke="#3d7020" stroke-width="2.3" stroke-linecap="round"/>
  <path d="M122,40 Q107,29 103,16" stroke="#3d7020" stroke-width="1.6" fill="none" stroke-linecap="round"/>
  <path d="M122,32 Q137,21 141,9"  stroke="#3d7020" stroke-width="1.6" fill="none" stroke-linecap="round"/>
  <path d="M105,20 C96,12 94,1 101,-2 C107,-4 110,7 105,20Z" fill="#3d6e1e"/>
  <path d="M103,18 C92,12 89,1 96,-2 C102,-4 105,7 103,18Z"  fill="#4c8a28"/>
  <path d="M139,12 C148,3 150,-8 143,-11 C137,-13 134,-2 139,12Z" fill="#3d6e1e"/>
  <path d="M141,9 C150,0 152,-11 145,-14 C139,-16 136,-5 141,9Z"  fill="#4c8a28"/>
  <path d="M122,36 C110,26 107,13 116,9 C122,7 124,18 122,36Z"  fill="#2c5818"/>
  <path d="M122,30 C134,20 137,7 128,4 C122,2 119,13 122,30Z"   fill="#3d7020"/>
  <circle cx="104" cy="16" r="9.5" fill="url(#zst1)" filter="url(#zsf2)"/>
  <ellipse cx="99" cy="10"  rx="3.2" ry="2.3" fill="rgba(255,255,255,0.22)" transform="rotate(-24 99 10)"/>
  <circle cx="140" cy="9"  r="8"   fill="url(#zst1)" filter="url(#zsf2)"/>
  <ellipse cx="136" cy="4"  rx="2.6" ry="1.9" fill="rgba(255,255,255,0.2)" transform="rotate(-20 136 4)"/>
  <circle cx="122" cy="9"  r="6.5" fill="url(#zst2)" filter="url(#zsf2)"/>
  <!-- Dewdrops -->
  <ellipse cx="11" cy="11"  rx="2.6" ry="1.9" fill="rgba(255,255,255,0.28)" transform="rotate(-26 11 11)"/>
  <ellipse cx="99" cy="11"  rx="2.2" ry="1.6" fill="rgba(255,255,255,0.22)" transform="rotate(-22 99 11)"/>
  <rect width="160" height="80" fill="url(#zsv)"/>
</svg>`,

Brassicacees: `<svg viewBox="0 0 160 80" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
  <defs>
    <linearGradient id="zbb" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#051a18"/>
      <stop offset="42%" stop-color="#083a34"/>
      <stop offset="100%" stop-color="#0d5548"/>
    </linearGradient>
    <radialGradient id="zbg" cx="78%" cy="10%" r="52%">
      <stop offset="0%" stop-color="#a7f3d0" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#a7f3d0" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="zbc1" cx="50%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#4ade80"/>
      <stop offset="50%" stop-color="#16a34a"/>
      <stop offset="100%" stop-color="#064e2a"/>
    </radialGradient>
    <radialGradient id="zbc2" cx="50%" cy="30%" r="65%">
      <stop offset="0%" stop-color="#86efac"/>
      <stop offset="50%" stop-color="#22c55e"/>
      <stop offset="100%" stop-color="#166534"/>
    </radialGradient>
    <radialGradient id="zbc3" cx="50%" cy="30%" r="65%">
      <stop offset="0%" stop-color="#6ee7b7"/>
      <stop offset="50%" stop-color="#10b981"/>
      <stop offset="100%" stop-color="#065f46"/>
    </radialGradient>
    <linearGradient id="zbsoil" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1a3020"/>
      <stop offset="100%" stop-color="#0a1810"/>
    </linearGradient>
    <radialGradient id="zbv" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="rgba(0,0,0,0)"/>
      <stop offset="100%" stop-color="rgba(0,0,0,0.34)"/>
    </radialGradient>
    <filter id="zbf1"><feGaussianBlur stdDeviation="1.6"/></filter>
    <filter id="zbf2"><feDropShadow dx="0" dy="3" stdDeviation="2.5" flood-color="#000" flood-opacity="0.24"/></filter>
  </defs>
  <rect width="160" height="80" fill="url(#zbb)"/>
  <rect width="160" height="80" fill="url(#zbg)"/>
  <rect x="0" y="61" width="160" height="19" fill="url(#zbsoil)"/>
  <path d="M0,61 Q20,59 40,61 Q60,63 80,61 Q100,59 120,61 Q140,63 160,61" stroke="#204030" stroke-width="0.9" fill="none" opacity="0.55"/>
  <!-- Back leaf shadow -->
  <g opacity="0.38" filter="url(#zbf1)">
    <path d="M80,72 C50,57 42,36 58,25 C70,18 81,44 80,72Z" fill="#0d5545"/>
    <path d="M80,72 C110,57 118,36 102,25 C90,18 79,44 80,72Z" fill="#0a4838"/>
  </g>
  <!-- Cabbage 1 (center, main) -->
  <g filter="url(#zbf2)">
    <path d="M80,74 C48,58 40,34 57,23 C68,16 81,44 80,74Z" fill="#0b5e3c" opacity="0.92"/>
    <path d="M80,74 C112,58 120,34 103,23 C92,16 79,44 80,74Z" fill="#0b5e3c" opacity="0.92"/>
    <path d="M80,70 C54,59 46,42 61,34 C70,30 81,50 80,70Z" fill="#0e7a4e" opacity="0.92"/>
    <path d="M80,70 C106,59 114,42 99,34 C90,30 79,50 80,70Z" fill="#0e7a4e" opacity="0.92"/>
    <ellipse cx="80" cy="52" rx="21" ry="23" fill="url(#zbc1)"/>
    <ellipse cx="80" cy="50" rx="17" ry="19" fill="url(#zbc2)"/>
    <ellipse cx="80" cy="48" rx="13" ry="15" fill="url(#zbc3)"/>
    <ellipse cx="80" cy="46" rx="9"  ry="11" fill="#bbf7d0"/>
    <ellipse cx="80" cy="44" rx="5.5" ry="7" fill="#ecfdf5"/>
    <path d="M80,70 L57,53" stroke="rgba(255,255,255,0.18)" stroke-width="1.3" fill="none"/>
    <path d="M80,70 L103,53" stroke="rgba(255,255,255,0.18)" stroke-width="1.3" fill="none"/>
    <path d="M80,60 L63,48" stroke="rgba(255,255,255,0.12)" stroke-width="1"   fill="none"/>
    <path d="M80,60 L97,48" stroke="rgba(255,255,255,0.12)" stroke-width="1"   fill="none"/>
    <ellipse cx="71" cy="41" rx="6.5" ry="4.5" fill="rgba(255,255,255,0.2)" transform="rotate(-22 71 41)"/>
  </g>
  <!-- Cabbage 2 (left) -->
  <g filter="url(#zbf2)">
    <path d="M26,77 C7,65 3,48 14,40 C22,35 28,57 26,77Z" fill="#095038" opacity="0.9"/>
    <path d="M26,77 C45,65 49,48 38,40 C30,35 24,57 26,77Z" fill="#095038" opacity="0.9"/>
    <ellipse cx="26" cy="58" rx="15" ry="17" fill="url(#zbc1)"/>
    <ellipse cx="26" cy="56" rx="12" ry="13" fill="url(#zbc2)"/>
    <ellipse cx="26" cy="54" rx="9"  ry="10" fill="url(#zbc3)"/>
    <ellipse cx="26" cy="52" rx="6"  ry="7"  fill="#bbf7d0"/>
    <path d="M26,74 L11,61"  stroke="rgba(255,255,255,0.15)" stroke-width="1" fill="none"/>
    <path d="M26,74 L41,61"  stroke="rgba(255,255,255,0.15)" stroke-width="1" fill="none"/>
    <ellipse cx="19" cy="50" rx="4.5" ry="3.2" fill="rgba(255,255,255,0.17)" transform="rotate(-22 19 50)"/>
  </g>
  <!-- Cabbage 3 (right) -->
  <g filter="url(#zbf2)">
    <path d="M136,77 C117,65 113,48 124,40 C132,35 138,57 136,77Z" fill="#073c2c" opacity="0.9"/>
    <path d="M136,77 C155,65 159,48 148,40 C140,35 134,57 136,77Z" fill="#073c2c" opacity="0.9"/>
    <ellipse cx="136" cy="58" rx="15" ry="17" fill="url(#zbc1)"/>
    <ellipse cx="136" cy="56" rx="12" ry="13" fill="url(#zbc2)"/>
    <ellipse cx="136" cy="54" rx="9"  ry="10" fill="url(#zbc3)"/>
    <ellipse cx="136" cy="52" rx="6"  ry="7"  fill="#bbf7d0"/>
    <ellipse cx="129" cy="50" rx="4.5" ry="3.2" fill="rgba(255,255,255,0.17)" transform="rotate(-22 129 50)"/>
  </g>
  <!-- Atmospheric top mist -->
  <rect width="160" height="24" fill="rgba(13,80,68,0.14)"/>
  <rect width="160" height="80" fill="url(#zbv)"/>
</svg>`,

Lamiacees: `<svg viewBox="0 0 160 80" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
  <defs>
    <linearGradient id="zlb" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#030a01"/>
      <stop offset="35%" stop-color="#0a1c04"/>
      <stop offset="100%" stop-color="#162e06"/>
    </linearGradient>
    <radialGradient id="zlgp" cx="50%" cy="20%" r="52%">
      <stop offset="0%" stop-color="#a78bfa" stop-opacity="0.14"/>
      <stop offset="100%" stop-color="#a78bfa" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="zlga" cx="24%" cy="14%" r="44%">
      <stop offset="0%" stop-color="#fbbf24" stop-opacity="0.1"/>
      <stop offset="100%" stop-color="#fbbf24" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="zlsoil" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1a2808"/>
      <stop offset="100%" stop-color="#0a1404"/>
    </linearGradient>
    <radialGradient id="zlv" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="rgba(0,0,0,0)"/>
      <stop offset="100%" stop-color="rgba(0,0,0,0.4)"/>
    </radialGradient>
    <filter id="zlf1"><feGaussianBlur stdDeviation="2"/></filter>
    <filter id="zlf2"><feGaussianBlur stdDeviation="0.9"/></filter>
    <filter id="zlf3"><feGaussianBlur stdDeviation="4"/></filter>
  </defs>
  <rect width="160" height="80" fill="url(#zlb)"/>
  <rect width="160" height="80" fill="url(#zlgp)"/>
  <rect width="160" height="80" fill="url(#zlga)"/>
  <rect x="0" y="61" width="160" height="19" fill="url(#zlsoil)"/>
  <path d="M0,61 Q20,59 40,61 Q60,63 80,61 Q100,59 120,61 Q140,63 160,61" stroke="#243810" stroke-width="0.9" fill="none" opacity="0.55"/>
  <!-- Bush 1 (left) -->
  <ellipse cx="26" cy="62" rx="21" ry="25" fill="#1c4806" opacity="0.9" filter="url(#zlf2)"/>
  <ellipse cx="22" cy="54" rx="15" ry="19" fill="#245e0a"/>
  <ellipse cx="26" cy="46" rx="12" ry="15" fill="#2c760e"/>
  <ellipse cx="23" cy="39" rx="10" ry="12" fill="#368e12"/>
  <ellipse cx="27" cy="33" rx="8"  ry="10" fill="#40a816"/>
  <ellipse cx="24" cy="27" rx="6"  ry="8"  fill="#50c41c"/>
  <path d="M21,51 C10,40 8,25 17,19 C23,16 26,28 21,51Z"  fill="#286c0e" opacity="0.92"/>
  <path d="M31,47 C42,36 44,21 35,15 C29,12 26,24 31,47Z"  fill="#2e9012" opacity="0.92"/>
  <path d="M25,55 C12,45 10,28 20,22 C27,18 30,32 25,55Z"  fill="#1c5008" opacity="0.9"/>
  <!-- Bush 2 (center, tallest) -->
  <ellipse cx="80" cy="64" rx="30" ry="32" fill="#183e04" opacity="0.9" filter="url(#zlf2)"/>
  <ellipse cx="76" cy="55" rx="22" ry="26" fill="#1c5006"/>
  <ellipse cx="82" cy="47" rx="18" ry="22" fill="#246c0c"/>
  <ellipse cx="78" cy="40" rx="14" ry="18" fill="#2c8810"/>
  <ellipse cx="82" cy="33" rx="11" ry="14" fill="#34a414"/>
  <ellipse cx="79" cy="26" rx="9"  ry="11" fill="#40c41a"/>
  <ellipse cx="82" cy="20" rx="7"  ry="9"  fill="#50de22"/>
  <ellipse cx="80" cy="14" rx="5"  ry="7"  fill="#64f42c"/>
  <path d="M75,51 C61,40 58,23 69,16 C76,12 79,27 75,51Z"  fill="#226409" opacity="0.92"/>
  <path d="M85,47 C99,36 102,19 91,12 C84,8 81,23 85,47Z"  fill="#2c9c10" opacity="0.92"/>
  <path d="M80,58 C65,47 62,28 74,21 C82,16 85,33 80,58Z"  fill="#163e04" opacity="0.9"/>
  <!-- Bush 3 (right) -->
  <ellipse cx="134" cy="62" rx="23" ry="27" fill="#1c4806" opacity="0.9" filter="url(#zlf2)"/>
  <ellipse cx="130" cy="53" rx="17" ry="21" fill="#245e0a"/>
  <ellipse cx="134" cy="45" rx="13" ry="17" fill="#2c760e"/>
  <ellipse cx="131" cy="38" rx="10" ry="13" fill="#368e12"/>
  <ellipse cx="135" cy="31" rx="8"  ry="11" fill="#40a816"/>
  <path d="M129,49 C118,38 116,23 125,17 C131,14 134,26 129,49Z" fill="#286c0e" opacity="0.9"/>
  <path d="M139,45 C150,34 152,19 143,13 C137,10 134,22 139,45Z" fill="#2e9012" opacity="0.9"/>
  <!-- Flower clusters -->
  <circle cx="22" cy="22" r="4"   fill="#8b5cf6" opacity="0.92"/>
  <circle cx="17" cy="17" r="2.8" fill="#7c3aed" opacity="0.85"/>
  <circle cx="28" cy="19" r="3.2" fill="#9d6ffa" opacity="0.88"/>
  <circle cx="22" cy="14" r="2.2" fill="#c4b5fd" opacity="0.72"/>
  <circle cx="15" cy="24" r="1.8" fill="#ddd6fe" opacity="0.6"/>
  <circle cx="79" cy="10" r="4.5" fill="#8b5cf6" opacity="0.92"/>
  <circle cx="73" cy="6"  r="3.2" fill="#7c3aed" opacity="0.88"/>
  <circle cx="85" cy="8"  r="3.5" fill="#9d6ffa" opacity="0.88"/>
  <circle cx="79" cy="3"  r="2.8" fill="#c4b5fd" opacity="0.72"/>
  <circle cx="69" cy="9"  r="2.2" fill="#ddd6fe" opacity="0.62"/>
  <circle cx="90" cy="6"  r="2.2" fill="#ddd6fe" opacity="0.62"/>
  <circle cx="131" cy="26" r="4"  fill="#8b5cf6" opacity="0.9"/>
  <circle cx="126" cy="21" r="2.8" fill="#7c3aed" opacity="0.82"/>
  <circle cx="137" cy="24" r="3.2" fill="#9d6ffa" opacity="0.85"/>
  <circle cx="131" cy="18" r="2.2" fill="#c4b5fd" opacity="0.7"/>
  <!-- Aromatic glow -->
  <circle cx="79"  cy="12" r="14" fill="#8b5cf6" opacity="0.055" filter="url(#zlf3)"/>
  <circle cx="22"  cy="22" r="10" fill="#8b5cf6" opacity="0.05"  filter="url(#zlf3)"/>
  <circle cx="131" cy="26" r="10" fill="#8b5cf6" opacity="0.048" filter="url(#zlf3)"/>
  <rect width="160" height="80" fill="url(#zlv)"/>
</svg>`,

Cucurbitacees: `<svg viewBox="0 0 160 80" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
  <defs>
    <linearGradient id="zcb" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#142804"/>
      <stop offset="40%" stop-color="#1e4008"/>
      <stop offset="100%" stop-color="#285010"/>
    </linearGradient>
    <radialGradient id="zcg" cx="76%" cy="10%" r="52%">
      <stop offset="0%" stop-color="#fbbf24" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="#fbbf24" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="zcsoil" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1e3408"/>
      <stop offset="100%" stop-color="#0a1804"/>
    </linearGradient>
    <radialGradient id="zcv" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="rgba(0,0,0,0)"/>
      <stop offset="100%" stop-color="rgba(0,0,0,0.32)"/>
    </radialGradient>
    <filter id="zcf1"><feGaussianBlur stdDeviation="1.6"/></filter>
    <filter id="zcf2"><feDropShadow dx="0" dy="2" stdDeviation="2.2" flood-color="#000" flood-opacity="0.22"/></filter>
  </defs>
  <rect width="160" height="80" fill="url(#zcb)"/>
  <rect width="160" height="80" fill="url(#zcg)"/>
  <rect x="0" y="65" width="160" height="15" fill="url(#zcsoil)"/>
  <!-- Trailing vines -->
  <path d="M8,80 Q30,62 56,54 Q82,46 112,52 Q138,58 156,74" stroke="#3e7220" stroke-width="1.6" fill="none" opacity="0.65" stroke-linecap="round"/>
  <path d="M0,72 Q24,56 50,49 Q76,42 102,49" stroke="#4a8428" stroke-width="1.2" fill="none" opacity="0.45" stroke-linecap="round"/>
  <!-- Leaf 1 (left) -->
  <g filter="url(#zcf2)">
    <path d="M0,80 C20,56 13,26 38,14 C55,6 65,36 44,80Z" fill="#3a781c" opacity="0.93"/>
    <path d="M0,80 C24,62 20,35 44,22 C62,12 70,44 46,80Z" fill="#48901e" opacity="0.8"/>
    <path d="M40,28 Q16,44 6,66"  stroke="#2c5c10" stroke-width="1.2" fill="none" opacity="0.65"/>
    <path d="M40,28 Q22,30 14,40" stroke="#2c5c10" stroke-width="0.9" fill="none" opacity="0.55"/>
    <path d="M40,28 Q34,18 26,16" stroke="#2c5c10" stroke-width="0.8" fill="none" opacity="0.48"/>
    <ellipse cx="30" cy="36" rx="8.5" ry="5.5" fill="rgba(255,255,255,0.12)" transform="rotate(-30 30 36)"/>
  </g>
  <!-- Leaf 2 (center) -->
  <g filter="url(#zcf2)">
    <path d="M80,80 C60,57 53,30 76,16 C90,8 101,38 88,80Z" fill="#387018" opacity="0.93"/>
    <path d="M80,80 C64,59 60,33 83,19 C98,10 107,42 90,80Z" fill="#479020" opacity="0.8"/>
    <path d="M82,22 Q67,38 60,62" stroke="#2a5610" stroke-width="1.2" fill="none" opacity="0.65"/>
    <path d="M82,22 Q74,16 66,16" stroke="#2a5610" stroke-width="0.8" fill="none" opacity="0.48"/>
    <ellipse cx="70" cy="36" rx="7.5" ry="4.5" fill="rgba(255,255,255,0.12)" transform="rotate(-28 70 36)"/>
  </g>
  <!-- Leaf 3 (right) -->
  <g filter="url(#zcf2)">
    <path d="M160,80 C140,57 133,28 156,14 C170,6 175,38 164,80Z" fill="#2e6010" opacity="0.9"/>
    <path d="M160,80 C144,61 140,34 163,20 C178,11 181,44 166,80Z" fill="#3a7818" opacity="0.78"/>
    <path d="M158,24 Q145,40 138,64" stroke="#245010" stroke-width="1" fill="none" opacity="0.58"/>
  </g>
  <!-- Courgette fruits -->
  <g transform="rotate(-23 67 74)" filter="url(#zcf2)">
    <ellipse cx="67" cy="74" rx="23" ry="9"   fill="#aad870"/>
    <ellipse cx="67" cy="74" rx="21" ry="7.5" fill="#90c254"/>
    <line x1="46" y1="74" x2="88" y2="74" stroke="#78a83c" stroke-width="1.6" opacity="0.42"/>
    <line x1="48" y1="71" x2="86" y2="77" stroke="#6a9a2e" stroke-width="1"   opacity="0.3"/>
    <ellipse cx="88" cy="74" rx="5.5" ry="5.5" fill="#6a9a2e" opacity="0.6"/>
    <ellipse cx="45" cy="74" rx="3.5" ry="3.5" fill="#5a8a26" opacity="0.5"/>
  </g>
  <g transform="rotate(16 124 72)" filter="url(#zcf2)">
    <ellipse cx="124" cy="72" rx="19" ry="7.5" fill="#c0e890"/>
    <ellipse cx="124" cy="72" rx="17" ry="6.2" fill="#a8d472"/>
    <ellipse cx="141" cy="72" rx="4.5" ry="4.5" fill="#8abc5a" opacity="0.6"/>
  </g>
  <!-- Flowers -->
  <g filter="url(#zcf1)">
    <circle cx="36" cy="20" r="9"   fill="#ffd700" opacity="0.96"/>
    <circle cx="36" cy="20" r="5.5" fill="#ffaa00"/>
    <circle cx="36" cy="20" r="2.8" fill="#ff8800"/>
  </g>
  <g filter="url(#zcf1)">
    <circle cx="150" cy="24" r="7.5" fill="#ffd700" opacity="0.9"/>
    <circle cx="150" cy="24" r="4.5" fill="#ffaa00"/>
    <circle cx="150" cy="24" r="2.2" fill="#ff8800"/>
  </g>
  <!-- Tendrils -->
  <path d="M54,56 Q57,48 62,50 Q66,52 63,59" stroke="#4a8428" stroke-width="1.1" fill="none" stroke-linecap="round"/>
  <path d="M112,53 Q116,45 120,47 Q124,49 121,56" stroke="#4a8428" stroke-width="1.1" fill="none" stroke-linecap="round"/>
  <rect width="160" height="80" fill="url(#zcv)"/>
</svg>`,

Fabacees: `<svg viewBox="0 0 160 80" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
  <defs>
    <linearGradient id="zfb" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#031410"/>
      <stop offset="40%" stop-color="#062e26"/>
      <stop offset="100%" stop-color="#0a4838"/>
    </linearGradient>
    <radialGradient id="zfg" cx="20%" cy="10%" r="52%">
      <stop offset="0%" stop-color="#a7f3d0" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="#a7f3d0" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="zfsoil" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1a3020"/>
      <stop offset="100%" stop-color="#0a1810"/>
    </linearGradient>
    <radialGradient id="zfv" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="rgba(0,0,0,0)"/>
      <stop offset="100%" stop-color="rgba(0,0,0,0.34)"/>
    </radialGradient>
    <filter id="zff1"><feGaussianBlur stdDeviation="1.6"/></filter>
    <filter id="zff2"><feDropShadow dx="0" dy="2" stdDeviation="1.9" flood-color="#000" flood-opacity="0.25"/></filter>
  </defs>
  <rect width="160" height="80" fill="url(#zfb)"/>
  <rect width="160" height="80" fill="url(#zfg)"/>
  <rect x="0" y="65" width="160" height="15" fill="url(#zfsoil)"/>
  <path d="M0,65 Q20,63 40,65 Q60,67 80,65 Q100,63 120,65 Q140,67 160,65" stroke="#1c3c28" stroke-width="0.9" fill="none" opacity="0.65"/>
  <!-- Poles -->
  <line x1="36"  y1="65" x2="36"  y2="3"  stroke="#7c5c38" stroke-width="3"   stroke-linecap="round"/>
  <line x1="80"  y1="65" x2="80"  y2="1"  stroke="#7c5c38" stroke-width="3"   stroke-linecap="round"/>
  <line x1="124" y1="65" x2="124" y2="3"  stroke="#7c5c38" stroke-width="3"   stroke-linecap="round"/>
  <line x1="34"  y1="7"  x2="126" y2="7"  stroke="#7c5c38" stroke-width="1.9" stroke-linecap="round"/>
  <!-- Twine hints -->
  <path d="M36,7 Q58,13 80,9 Q102,5 124,7"  stroke="#9c7c58" stroke-width="0.9" fill="none" opacity="0.45" stroke-dasharray="3,2.5"/>
  <path d="M36,25 Q58,21 80,24 Q102,27 124,25" stroke="#9c7c58" stroke-width="0.7" fill="none" opacity="0.3"  stroke-dasharray="2.5,3"/>
  <!-- Vines -->
  <path d="M36,61 Q23,48 27,34 Q33,20 36,12" stroke="#3a7820" stroke-width="1.9" fill="none" stroke-linecap="round"/>
  <path d="M36,55 Q49,42 45,29 Q40,17 36,12" stroke="#4a9028" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  <path d="M80,61 Q67,48 71,34 Q77,20 80,14" stroke="#3a7820" stroke-width="1.9" fill="none" stroke-linecap="round"/>
  <path d="M80,56 Q93,43 89,30 Q84,18 80,14" stroke="#4a9028" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  <path d="M124,61 Q111,48 115,34 Q121,20 124,14" stroke="#3a7820" stroke-width="1.9" fill="none" stroke-linecap="round"/>
  <path d="M124,53 Q137,40 133,27 Q128,15 124,14" stroke="#4a9028" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  <!-- Trifoil leaves -->
  <path d="M29,42 C19,33 17,20 25,16 C31,13 33,24 29,42Z" fill="#4a8c28"/>
  <path d="M27,40 C15,34 12,21 20,17 C26,14 28,25 27,40Z" fill="#5aaa30"/>
  <path d="M43,36 C53,27 55,14 47,10 C41,7 38,18 43,36Z" fill="#4a8c28"/>
  <path d="M41,34 C51,25 53,12 45,8 C39,5 36,16 41,34Z" fill="#5aaa30"/>
  <path d="M73,42 C63,33 61,20 69,16 C75,13 77,24 73,42Z" fill="#4a8c28"/>
  <path d="M71,40 C59,34 56,21 64,17 C70,14 72,25 71,40Z" fill="#5aaa30"/>
  <path d="M87,36 C97,27 99,14 91,10 C85,7 82,18 87,36Z" fill="#4a8c28"/>
  <path d="M85,34 C95,25 97,12 89,8 C83,5 80,16 85,34Z" fill="#5aaa30"/>
  <path d="M117,42 C107,33 105,20 113,16 C119,13 121,24 117,42Z" fill="#4a8c28"/>
  <path d="M131,36 C141,27 143,14 135,10 C129,7 126,18 131,36Z" fill="#4a8c28"/>
  <!-- Bean pods -->
  <g filter="url(#zff2)">
    <path d="M27,52 C23,43 24,35 28,33 C32,31 35,37 33,52Z" fill="#88cc52" opacity="0.96"/>
    <path d="M27,52 C25,43 26,35 29,33" stroke="#5e9432" stroke-width="0.9" fill="none" opacity="0.55"/>
    <ellipse cx="30" cy="33" rx="2.8" ry="2.2" fill="#72b040"/>
    <ellipse cx="30" cy="39" rx="2.3" ry="2.2" fill="#72b040" opacity="0.7"/>
    <ellipse cx="30" cy="46" rx="2.3" ry="2.2" fill="#72b040" opacity="0.7"/>
  </g>
  <g filter="url(#zff2)">
    <path d="M71,50 C67,41 68,33 72,31 C76,29 79,35 77,50Z" fill="#9cda62" opacity="0.96"/>
    <path d="M71,50 C69,41 70,33 73,31" stroke="#6aaa40" stroke-width="0.9" fill="none" opacity="0.55"/>
    <ellipse cx="74" cy="31" rx="2.8" ry="2.2" fill="#7ec050"/>
    <ellipse cx="74" cy="38" rx="2.3" ry="2.2" fill="#7ec050" opacity="0.7"/>
  </g>
  <g filter="url(#zff2)">
    <path d="M115,52 C111,43 112,35 116,33 C120,31 123,37 121,52Z" fill="#88cc52" opacity="0.92"/>
    <ellipse cx="118" cy="33" rx="2.8" ry="2.2" fill="#72b040"/>
  </g>
  <!-- Flowers -->
  <circle cx="36"  cy="13" r="4.5" fill="white" opacity="0.92" filter="url(#zff1)"/>
  <circle cx="36"  cy="13" r="2.8" fill="#f0fdf4"/>
  <circle cx="80"  cy="11" r="4.5" fill="white" opacity="0.92" filter="url(#zff1)"/>
  <circle cx="80"  cy="11" r="2.8" fill="#f0fdf4"/>
  <circle cx="124" cy="13" r="4.5" fill="white" opacity="0.92" filter="url(#zff1)"/>
  <circle cx="124" cy="13" r="2.8" fill="#f0fdf4"/>
  <circle cx="29"  cy="20" r="2.2" fill="#fce7f3" opacity="0.82"/>
  <circle cx="73"  cy="18" r="2.2" fill="#fce7f3" opacity="0.82"/>
  <circle cx="117" cy="20" r="2.2" fill="#fce7f3" opacity="0.82"/>
  <rect width="160" height="80" fill="url(#zfv)"/>
</svg>`,

  default: `<svg viewBox="0 0 160 80" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
  <defs>
    <linearGradient id="zdb" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0a1c08"/>
      <stop offset="38%" stop-color="#163808"/>
      <stop offset="100%" stop-color="#1e4c10"/>
    </linearGradient>
    <radialGradient id="zdga" cx="20%" cy="11%" r="58%">
      <stop offset="0%" stop-color="#fef9c3" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="#fef9c3" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="zdf1" cx="32%" cy="22%" r="68%">
      <stop offset="0%" stop-color="#bbf7d0"/>
      <stop offset="52%" stop-color="#4ade80"/>
      <stop offset="100%" stop-color="#166534"/>
    </radialGradient>
    <radialGradient id="zdf2" cx="32%" cy="22%" r="68%">
      <stop offset="0%" stop-color="#a7f3d0"/>
      <stop offset="48%" stop-color="#34d399"/>
      <stop offset="100%" stop-color="#065f46"/>
    </radialGradient>
    <linearGradient id="zdsoil" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1e3c10"/>
      <stop offset="100%" stop-color="#0a1c06"/>
    </linearGradient>
    <radialGradient id="zdv" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="rgba(0,0,0,0)"/>
      <stop offset="100%" stop-color="rgba(0,0,0,0.32)"/>
    </radialGradient>
    <filter id="zdf3"><feGaussianBlur stdDeviation="1.6"/></filter>
    <filter id="zdf4"><feDropShadow dx="0" dy="2" stdDeviation="2.2" flood-color="#000" flood-opacity="0.2"/></filter>
  </defs>
  <rect width="160" height="80" fill="url(#zdb)"/>
  <rect width="160" height="80" fill="url(#zdga)"/>
  <rect x="0" y="63" width="160" height="17" fill="url(#zdsoil)"/>
  <path d="M0,63 Q20,61 40,63 Q60,65 80,63 Q100,61 120,63 Q140,65 160,63" stroke="#264010" stroke-width="0.9" fill="none" opacity="0.55"/>
  <!-- Plant 1 -->
  <line x1="28"  y1="63" x2="26"  y2="26" stroke="#3d7820" stroke-width="2.3" stroke-linecap="round"/>
  <path d="M26,50 C14,39 12,24 21,19 C27,16 30,28 26,50Z"  fill="#2e6618"/>
  <path d="M26,44 C38,33 40,18 32,14 C26,11 23,23 26,44Z"  fill="#3d8020"/>
  <path d="M26,36 C17,27 17,12 24,9 C30,7 32,18 26,36Z"    fill="#4c9a28"/>
  <circle cx="25" cy="26" r="8.5" fill="url(#zdf1)" filter="url(#zdf4)"/>
  <ellipse cx="21" cy="20" rx="2.8" ry="2" fill="rgba(255,255,255,0.22)" transform="rotate(-26 21 20)"/>
  <!-- Plant 2 (center) -->
  <line x1="78"  y1="63" x2="77"  y2="18" stroke="#3d7820" stroke-width="2.6" stroke-linecap="round"/>
  <path d="M77,45 C64,33 61,17 71,12 C78,9 81,22 77,45Z"   fill="#2e6618"/>
  <path d="M77,39 C90,27 93,11 84,8 C77,5 74,18 77,39Z"    fill="#3d8020"/>
  <path d="M77,31 C67,21 66,6 74,3 C80,1 82,12 77,31Z"     fill="#4c9a28"/>
  <circle cx="76" cy="19" r="9.5" fill="url(#zdf2)" filter="url(#zdf4)"/>
  <ellipse cx="72" cy="13" rx="3.2" ry="2.3" fill="rgba(255,255,255,0.22)" transform="rotate(-26 72 13)"/>
  <!-- Plant 3 -->
  <line x1="124" y1="63" x2="123" y2="30" stroke="#3d7820" stroke-width="2.1" stroke-linecap="round"/>
  <path d="M123,50 C112,40 109,26 118,22 C124,19 126,30 123,50Z" fill="#2e6618"/>
  <path d="M123,44 C134,34 137,20 129,16 C123,13 120,24 123,44Z" fill="#3d8020"/>
  <circle cx="122" cy="30" r="7.5" fill="url(#zdf1)" filter="url(#zdf4)"/>
  <!-- Plant 4 (small) -->
  <line x1="148" y1="63" x2="147" y2="40" stroke="#3d7820" stroke-width="1.9" stroke-linecap="round"/>
  <path d="M147,55 C138,46 136,34 144,30 C149,28 151,37 147,55Z" fill="#2e6618"/>
  <path d="M147,50 C156,41 158,29 150,26 C145,24 142,33 147,50Z" fill="#3d8020"/>
  <circle cx="146" cy="40" r="6" fill="url(#zdf2)" filter="url(#zdf4)"/>
  <ellipse cx="21" cy="21" rx="2.4" ry="1.7" fill="rgba(255,255,255,0.26)" transform="rotate(-26 21 21)"/>
  <ellipse cx="72" cy="14" rx="2.7" ry="1.9" fill="rgba(255,255,255,0.22)" transform="rotate(-24 72 14)"/>
  <rect width="160" height="80" fill="url(#zdv)"/>
</svg>`,

  empty: `<svg viewBox="0 0 160 80" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
  <defs>
    <linearGradient id="zeb" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#160803"/>
      <stop offset="28%" stop-color="#2e1408"/>
      <stop offset="62%" stop-color="#3e1c0a"/>
      <stop offset="100%" stop-color="#1a0c04"/>
    </linearGradient>
    <linearGradient id="zes1" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#4e3012"/>
      <stop offset="100%" stop-color="#3c2208"/>
    </linearGradient>
    <linearGradient id="zes2" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#3c2008"/>
      <stop offset="100%" stop-color="#2a1406"/>
    </linearGradient>
    <radialGradient id="zeg" cx="30%" cy="18%" r="50%">
      <stop offset="0%" stop-color="#fbbf24" stop-opacity="0.09"/>
      <stop offset="100%" stop-color="#fbbf24" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="zev" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="rgba(0,0,0,0)"/>
      <stop offset="100%" stop-color="rgba(0,0,0,0.22)"/>
    </radialGradient>
    <filter id="zef1"><feGaussianBlur stdDeviation="0.9"/></filter>
  </defs>
  <rect width="160" height="80" fill="url(#zeb)"/>
  <rect width="160" height="80" fill="url(#zeg)"/>
  <!-- Soil strata -->
  <rect x="0" y="17" width="160" height="13" fill="url(#zes1)" opacity="0.62"/>
  <rect x="0" y="30" width="160" height="11" fill="url(#zes2)" opacity="0.48"/>
  <rect x="0" y="41" width="160" height="13" fill="url(#zes1)" opacity="0.52"/>
  <rect x="0" y="54" width="160" height="26" fill="url(#zes2)" opacity="0.68"/>
  <!-- Surface texture waves -->
  <path d="M0,15 Q20,12 40,15 Q60,18 80,15 Q100,12 120,15 Q140,18 160,15" stroke="#5c3c20" stroke-width="1.3" fill="none" opacity="0.48"/>
  <path d="M0,21 Q28,18 55,21 Q82,24 110,21 Q136,18 160,21" stroke="#4a2c18" stroke-width="0.9" fill="none" opacity="0.36"/>
  <path d="M0,34 Q30,31 60,34 Q90,37 120,34 Q145,31 160,34" stroke="#3a2010" stroke-width="0.7" fill="none" opacity="0.28"/>
  <!-- Pebbles & clods -->
  <ellipse cx="22"  cy="13" rx="5.5" ry="3.2" fill="#4e3010" opacity="0.58" filter="url(#zef1)"/>
  <ellipse cx="58"  cy="11" rx="4.5" ry="2.8" fill="#5c3c20" opacity="0.52" filter="url(#zef1)"/>
  <ellipse cx="92"  cy="14" rx="6.5" ry="3.8" fill="#3c2008" opacity="0.58" filter="url(#zef1)"/>
  <ellipse cx="128" cy="12" rx="5"   ry="3"   fill="#4e3010" opacity="0.5"  filter="url(#zef1)"/>
  <ellipse cx="150" cy="15" rx="4"   ry="2.4" fill="#5c3c20" opacity="0.48" filter="url(#zef1)"/>
  <ellipse cx="38"  cy="30" rx="3.5" ry="2"   fill="#2c1806" opacity="0.48"/>
  <ellipse cx="72"  cy="28" rx="3"   ry="1.8" fill="#3c2210" opacity="0.44"/>
  <ellipse cx="112" cy="32" rx="4"   ry="2.3" fill="#2c1806" opacity="0.48"/>
  <ellipse cx="142" cy="27" rx="3"   ry="1.8" fill="#3c2210" opacity="0.4"/>
  <!-- Sprout 1 (center-left) -->
  <line x1="55" y1="15" x2="54" y2="2"  stroke="#3e7222" stroke-width="1.7" stroke-linecap="round"/>
  <path d="M54,10 C46,5 45,-2 50,-4 C54,-5 56,3 54,10Z"  fill="#4e8c2a" opacity="0.88"/>
  <path d="M54,8 C62,3 63,-4 58,-6 C54,-7 52,1 54,8Z"    fill="#5ca432" opacity="0.88"/>
  <ellipse cx="49" cy="-2"  rx="3.2" ry="4.5" fill="#5ca432" opacity="0.72" transform="rotate(-16 49 -2)"/>
  <ellipse cx="59" cy="-4"  rx="2.8" ry="4"   fill="#4e8c2a" opacity="0.72" transform="rotate(20 59 -4)"/>
  <!-- Sprout 2 (right) -->
  <line x1="112" y1="15" x2="112" y2="4"  stroke="#3e7222" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M112,10 C105,5 104,-1 109,-3 C113,-4 114,3 112,10Z" fill="#4e8c2a" opacity="0.82"/>
  <path d="M112,9 C119,4 120,-2 115,-4 C111,-5 110,2 112,9Z"   fill="#5ca432" opacity="0.82"/>
  <!-- Sprout 3 (tiny, left) -->
  <line x1="28" y1="16" x2="28" y2="9"  stroke="#3e7222" stroke-width="1.3" stroke-linecap="round"/>
  <path d="M28,13 C23,10 23,5 27,4 C30,4 31,8 28,13Z"  fill="#4e8c2a" opacity="0.72"/>
  <path d="M28,12 C33,9 33,4 30,3 C27,3 26,7 28,12Z"   fill="#5ca432" opacity="0.72"/>
  <!-- Root suggestions -->
  <path d="M55,15 Q51,22 47,28" stroke="#3c1e0a" stroke-width="0.9" fill="none" opacity="0.32"/>
  <path d="M55,15 Q59,23 61,31" stroke="#3c1e0a" stroke-width="0.9" fill="none" opacity="0.28"/>
  <path d="M112,15 Q108,22 106,30" stroke="#3c1e0a" stroke-width="0.8" fill="none" opacity="0.28"/>
  <rect width="160" height="80" fill="url(#zev)"/>
</svg>`
};

/**
 * Returns the SVG visual for a zone card based on the dominant
 * botanical family of its active crops.
 */
function getZoneVisual(bedId) {
  var counts = {};
  for (var i = 0; i < APP.crops.length; i++) {
    var c = APP.crops[i];
    if (c.bedId !== bedId || c.season !== APP.currentSeason) continue;
    if (c.status !== 'active' && c.status !== 'planned') continue;
    var v = APP.vegetables[c.veggieId];
    if (!v) continue;
    counts[v.family] = (counts[v.family] || 0) + 1;
  }
  var dominant = null;
  var max = 0;
  Object.keys(counts).forEach(function(f) {
    if (counts[f] > max) { max = counts[f]; dominant = f; }
  });
  if (!dominant) return GV_ZONE_VISUALS.empty;
  return GV_ZONE_VISUALS[dominant] || GV_ZONE_VISUALS.default;
}

/**
 * Returns the SVG visual for the whole garden based on the dominant
 * botanical family across ALL active crops this season.
 * Falls back to GV_GARDEN_BANNER (full garden panorama) if no crops.
 */
function getGardenDominantVisual() {
  var counts = {};
  for (var i = 0; i < APP.crops.length; i++) {
    var c = APP.crops[i];
    if (c.season !== APP.currentSeason) continue;
    if (c.status !== 'active' && c.status !== 'planned') continue;
    var v = APP.vegetables[c.veggieId];
    if (!v) continue;
    counts[v.family] = (counts[v.family] || 0) + 1;
  }
  var dominant = null, max = 0;
  Object.keys(counts).forEach(function(f) {
    if (counts[f] > max) { max = counts[f]; dominant = f; }
  });
  if (!dominant) return GV_GARDEN_BANNER;
  return GV_ZONE_VISUALS[dominant] || GV_GARDEN_BANNER;
}
