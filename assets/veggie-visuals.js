// My Garden Side — assets/veggie-visuals.js
// Photo-realistic SVG vegetable illustrations — v1.0
// 65 vegetables, 100×100 viewBox, radial gradients + highlights

var GV_VEGGIE_VISUALS = {

// ---- v1 Tomate ----
v1: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<defs>
  <radialGradient id="t1g" cx="35%" cy="30%" r="65%">
    <stop offset="0%" stop-color="#ff8a80"/>
    <stop offset="40%" stop-color="#e53935"/>
    <stop offset="100%" stop-color="#8b0000"/>
  </radialGradient>
  <radialGradient id="t1h" cx="30%" cy="25%" r="30%">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.5"/>
    <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
  </radialGradient>
</defs>
<circle cx="50" cy="55" r="35" fill="url(#t1g)"/>
<circle cx="50" cy="55" r="35" fill="url(#t1h)"/>
<ellipse cx="50" cy="56" rx="34" ry="33" fill="none" stroke="#7b1010" stroke-width="0.5" opacity="0.3"/>
<line x1="50" y1="22" x2="50" y2="20" stroke="#2e7d32" stroke-width="2.5" stroke-linecap="round"/>
<path d="M50 22 C46 18 40 17 38 20 C41 20 44 22 46 24" fill="#388e3c"/>
<path d="M50 22 C54 18 60 17 62 20 C59 20 56 22 54 24" fill="#2e7d32"/>
<path d="M50 22 C48 15 44 12 42 14 C45 15 48 19 50 22" fill="#43a047"/>
<path d="M50 22 C52 15 56 12 58 14 C55 15 52 19 50 22" fill="#388e3c"/>
</svg>`,

// ---- v2 Salade ----
v2: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<defs>
  <radialGradient id="t2g" cx="50%" cy="50%" r="55%">
    <stop offset="0%" stop-color="#f1f8e9"/>
    <stop offset="50%" stop-color="#aed581"/>
    <stop offset="100%" stop-color="#558b2f"/>
  </radialGradient>
</defs>
<ellipse cx="50" cy="58" rx="38" ry="28" fill="#7cb342" opacity="0.7"/>
<path d="M50 65 C30 55 18 40 25 30 C32 20 44 28 50 35 C56 28 68 20 75 30 C82 40 70 55 50 65Z" fill="url(#t2g)"/>
<path d="M50 62 C35 54 26 43 31 34 C36 27 46 33 50 40" fill="none" stroke="#8bc34a" stroke-width="1.2" opacity="0.6"/>
<path d="M50 62 C65 54 74 43 69 34 C64 27 54 33 50 40" fill="none" stroke="#8bc34a" stroke-width="1.2" opacity="0.6"/>
<ellipse cx="50" cy="62" rx="15" ry="10" fill="#c5e1a5" opacity="0.7"/>
<ellipse cx="50" cy="63" rx="8" ry="6" fill="#f1f8e9" opacity="0.8"/>
</svg>`,

// ---- v3 Courgette ----
v3: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<defs>
  <linearGradient id="t3g" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0%" stop-color="#388e3c"/>
    <stop offset="30%" stop-color="#66bb6a"/>
    <stop offset="60%" stop-color="#43a047"/>
    <stop offset="100%" stop-color="#1b5e20"/>
  </linearGradient>
</defs>
<ellipse cx="50" cy="55" rx="38" ry="18" fill="url(#t3g)" transform="rotate(-15,50,55)"/>
<ellipse cx="50" cy="55" rx="36" ry="5" fill="#a5d6a7" opacity="0.25" transform="rotate(-15,50,55)"/>
<ellipse cx="32" cy="46" rx="5" ry="3" fill="#c8e6c9" opacity="0.4" transform="rotate(-15,32,46)"/>
<ellipse cx="50" cy="52" rx="5" ry="3" fill="#c8e6c9" opacity="0.35" transform="rotate(-15,50,52)"/>
<ellipse cx="68" cy="58" rx="5" ry="3" fill="#c8e6c9" opacity="0.4" transform="rotate(-15,68,58)"/>
<path d="M78 43 C82 40 86 38 85 36 C83 35 80 37 78 40Z" fill="#2e7d32"/>
<path d="M78 43 C75 38 76 34 78 33 C80 33 81 36 80 40Z" fill="#388e3c"/>
</svg>`,

// ---- v4 Carotte ----
v4: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<defs>
  <linearGradient id="t4g" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#ff8f00"/>
    <stop offset="50%" stop-color="#f57c00"/>
    <stop offset="100%" stop-color="#e65100"/>
  </linearGradient>
  <radialGradient id="t4h" cx="30%" cy="30%" r="50%">
    <stop offset="0%" stop-color="#ffcc80" stop-opacity="0.6"/>
    <stop offset="100%" stop-color="#ffcc80" stop-opacity="0"/>
  </radialGradient>
</defs>
<path d="M45 25 C42 35 40 50 42 65 C44 75 56 75 58 65 C60 50 58 35 55 25Z" fill="url(#t4g)"/>
<path d="M45 25 C42 35 40 50 42 65 C44 75 56 75 58 65 C60 50 58 35 55 25Z" fill="url(#t4h)"/>
<line x1="47" y1="38" x2="44" y2="43" stroke="#e64a19" stroke-width="0.8" opacity="0.5"/>
<line x1="50" y1="45" x2="47" y2="50" stroke="#e64a19" stroke-width="0.8" opacity="0.5"/>
<line x1="52" y1="55" x2="49" y2="60" stroke="#e64a19" stroke-width="0.8" opacity="0.5"/>
<path d="M50 26 C45 18 40 14 38 16 C40 19 44 22 48 26" fill="#43a047"/>
<path d="M50 26 C55 18 60 14 62 16 C60 19 56 22 52 26" fill="#388e3c"/>
<path d="M50 25 C48 15 50 10 50 10 C50 10 52 15 50 25" fill="#4caf50"/>
</svg>`,

// ---- v5 Haricot ----
v5: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<defs>
  <linearGradient id="t5g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#81c784"/>
    <stop offset="100%" stop-color="#2e7d32"/>
  </linearGradient>
</defs>
<path d="M20 70 C25 45 40 30 55 28 C70 26 78 38 75 55 C72 70 58 78 45 76 C32 74 18 80 20 70Z" fill="url(#t5g)"/>
<path d="M20 70 C25 45 40 30 55 28" fill="none" stroke="#c8e6c9" stroke-width="1.5" opacity="0.6"/>
<ellipse cx="38" cy="56" rx="5" ry="6" fill="#388e3c" opacity="0.5"/>
<ellipse cx="52" cy="50" rx="5" ry="6" fill="#388e3c" opacity="0.5"/>
<ellipse cx="64" cy="48" rx="5" ry="6" fill="#388e3c" opacity="0.5"/>
</svg>`,

// ---- v6 Poivron ----
v6: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<defs>
  <radialGradient id="t6g" cx="35%" cy="25%" r="70%">
    <stop offset="0%" stop-color="#ff8a65"/>
    <stop offset="45%" stop-color="#e53935"/>
    <stop offset="100%" stop-color="#880e0e"/>
  </radialGradient>
  <radialGradient id="t6h" cx="30%" cy="25%" r="25%">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.45"/>
    <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
  </radialGradient>
</defs>
<path d="M50 28 C34 28 22 40 22 56 C22 72 34 82 50 82 C66 82 78 72 78 56 C78 40 66 28 50 28Z" fill="url(#t6g)"/>
<path d="M50 28 C34 28 22 40 22 56 C22 72 34 82 50 82 C66 82 78 72 78 56 C78 40 66 28 50 28Z" fill="url(#t6h)"/>
<path d="M36 40 C30 48 30 60 36 68" fill="none" stroke="#c62828" stroke-width="1.2" opacity="0.5"/>
<path d="M64 40 C70 48 70 60 64 68" fill="none" stroke="#c62828" stroke-width="1.2" opacity="0.5"/>
<rect x="47" y="18" width="6" height="12" rx="3" fill="#33691e"/>
<path d="M50 22 C46 16 42 14 40 16 C43 17 47 20 50 24" fill="#558b2f"/>
<path d="M50 22 C54 16 58 14 60 16 C57 17 53 20 50 24" fill="#33691e"/>
</svg>`,

// ---- v7 Aubergine ----
v7: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<defs>
  <radialGradient id="t7g" cx="35%" cy="30%" r="70%">
    <stop offset="0%" stop-color="#ce93d8"/>
    <stop offset="40%" stop-color="#7b1fa2"/>
    <stop offset="100%" stop-color="#38006b"/>
  </radialGradient>
  <radialGradient id="t7h" cx="28%" cy="28%" r="22%">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.4"/>
    <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
  </radialGradient>
</defs>
<path d="M50 30 C36 30 24 43 24 60 C24 76 36 85 50 85 C64 85 76 76 76 60 C76 43 64 30 50 30Z" fill="url(#t7g)"/>
<path d="M50 30 C36 30 24 43 24 60 C24 76 36 85 50 85 C64 85 76 76 76 60 C76 43 64 30 50 30Z" fill="url(#t7h)"/>
<rect x="47" y="18" width="6" height="14" rx="3" fill="#2e7d32"/>
<path d="M50 22 C44 14 36 13 34 16 C38 17 44 20 50 26" fill="#388e3c"/>
<path d="M50 22 C56 16 62 14 64 16 C60 18 55 21 50 26" fill="#2e7d32"/>
</svg>`,

// ---- v8 Radis ----
v8: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<defs>
  <radialGradient id="t8g" cx="35%" cy="30%" r="65%">
    <stop offset="0%" stop-color="#ff8a80"/>
    <stop offset="50%" stop-color="#e53935"/>
    <stop offset="100%" stop-color="#880e4f"/>
  </radialGradient>
</defs>
<path d="M42 22 C38 18 34 16 33 18 C36 20 40 24 43 28" fill="#43a047"/>
<path d="M50 22 C50 16 50 13 50 12 C50 12 50 15 50 22" fill="#388e3c"/>
<path d="M58 22 C62 18 66 16 67 18 C64 20 60 24 57 28" fill="#388e3c"/>
<ellipse cx="50" cy="55" rx="28" ry="30" fill="url(#t8g)"/>
<ellipse cx="50" cy="55" rx="20" ry="10" fill="#ffffff" fill-opacity="0.15"/>
<ellipse cx="38" cy="45" rx="6" ry="4" fill="#ffffff" opacity="0.25"/>
<line x1="50" y1="83" x2="50" y2="92" stroke="#e53935" stroke-width="1.5" stroke-linecap="round"/>
</svg>`,

// ---- v9 Oignon ----
v9: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<defs>
  <radialGradient id="t9g" cx="35%" cy="30%" r="70%">
    <stop offset="0%" stop-color="#fff9c4"/>
    <stop offset="40%" stop-color="#f9a825"/>
    <stop offset="100%" stop-color="#e65100"/>
  </radialGradient>
</defs>
<path d="M50 28 C50 20 50 16 50 14" stroke="#81c784" stroke-width="3" stroke-linecap="round" fill="none"/>
<path d="M50 30 C42 26 40 22 42 20 C44 22 46 26 50 30" fill="#66bb6a"/>
<ellipse cx="50" cy="60" rx="32" ry="30" fill="url(#t9g)"/>
<path d="M25 52 C27 44 34 38 42 36" fill="none" stroke="#fffde7" stroke-width="1.5" opacity="0.7"/>
<path d="M28 64 C26 58 27 50 30 44" fill="none" stroke="#fffde7" stroke-width="1" opacity="0.4"/>
<ellipse cx="40" cy="45" rx="5" ry="3" fill="#ffffff" opacity="0.25"/>
<path d="M50 30 C30 34 18 46 18 62 C18 76 32 88 50 88 C68 88 82 76 82 62 C82 46 70 34 50 30Z" fill="none" stroke="#bf360c" stroke-width="1" opacity="0.4"/>
</svg>`,

// ---- v10 Fraise ----
v10: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<defs>
  <radialGradient id="t10g" cx="38%" cy="30%" r="70%">
    <stop offset="0%" stop-color="#ff8a80"/>
    <stop offset="45%" stop-color="#e53935"/>
    <stop offset="100%" stop-color="#880e4f"/>
  </radialGradient>
</defs>
<path d="M50 24 C42 22 36 24 34 26 C38 24 44 26 50 30" fill="#43a047"/>
<path d="M50 24 C58 22 64 24 66 26 C62 24 56 26 50 30" fill="#388e3c"/>
<path d="M50 24 C50 18 50 14 50 14 C50 14 50 18 50 24" fill="#4caf50"/>
<path d="M50 30 C34 30 20 42 20 58 C20 72 34 88 50 88 C66 88 80 72 80 58 C80 42 66 30 50 30Z" fill="url(#t10g)"/>
<ellipse cx="38" cy="45" rx="2" ry="2.5" fill="#ffd54f" opacity="0.8"/>
<ellipse cx="50" cy="42" rx="2" ry="2.5" fill="#ffd54f" opacity="0.8"/>
<ellipse cx="62" cy="46" rx="2" ry="2.5" fill="#ffd54f" opacity="0.8"/>
<ellipse cx="34" cy="57" rx="2" ry="2.5" fill="#ffd54f" opacity="0.8"/>
<ellipse cx="46" cy="56" rx="2" ry="2.5" fill="#ffd54f" opacity="0.8"/>
<ellipse cx="58" cy="55" rx="2" ry="2.5" fill="#ffd54f" opacity="0.8"/>
<ellipse cx="66" cy="58" rx="2" ry="2.5" fill="#ffd54f" opacity="0.8"/>
<ellipse cx="40" cy="68" rx="2" ry="2.5" fill="#ffd54f" opacity="0.8"/>
<ellipse cx="55" cy="70" rx="2" ry="2.5" fill="#ffd54f" opacity="0.8"/>
<ellipse cx="50" cy="80" rx="2" ry="2.5" fill="#ffd54f" opacity="0.8"/>
<ellipse cx="36" cy="44" rx="5" ry="4" fill="#ffffff" opacity="0.2"/>
</svg>`,

// ---- v11 Concombre ----
v11: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<defs>
  <linearGradient id="t11g" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0%" stop-color="#2e7d32"/>
    <stop offset="30%" stop-color="#66bb6a"/>
    <stop offset="70%" stop-color="#43a047"/>
    <stop offset="100%" stop-color="#1b5e20"/>
  </linearGradient>
</defs>
<ellipse cx="50" cy="54" rx="40" ry="20" fill="url(#t11g)" transform="rotate(-10,50,54)"/>
<ellipse cx="28" cy="48" rx="4" ry="2.5" fill="#a5d6a7" opacity="0.45" transform="rotate(-10,28,48)"/>
<ellipse cx="42" cy="48" rx="4" ry="2.5" fill="#a5d6a7" opacity="0.35" transform="rotate(-10,42,48)"/>
<ellipse cx="56" cy="52" rx="4" ry="2.5" fill="#a5d6a7" opacity="0.4" transform="rotate(-10,56,52)"/>
<ellipse cx="70" cy="56" rx="4" ry="2.5" fill="#a5d6a7" opacity="0.35" transform="rotate(-10,70,56)"/>
<circle cx="22" cy="44" r="3" fill="#388e3c"/>
<path d="M84 62 C88 58 90 56 89 54 C87 53 84 56 82 60Z" fill="#33691e"/>
</svg>`,

// ---- v12 Epinard ----
v12: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<defs>
  <radialGradient id="t12g" cx="40%" cy="35%" r="60%">
    <stop offset="0%" stop-color="#81c784"/>
    <stop offset="100%" stop-color="#1b5e20"/>
  </radialGradient>
</defs>
<path d="M50 80 C50 80 20 62 18 44 C16 28 30 20 40 26 C44 28 48 34 50 38" fill="url(#t12g)"/>
<path d="M50 80 C50 80 80 62 82 44 C84 28 70 20 60 26 C56 28 52 34 50 38" fill="#2e7d32"/>
<line x1="50" y1="80" x2="50" y2="38" stroke="#a5d6a7" stroke-width="1.5" opacity="0.6"/>
<line x1="34" y1="48" x2="50" y2="54" stroke="#a5d6a7" stroke-width="1" opacity="0.5"/>
<line x1="38" y1="36" x2="50" y2="44" stroke="#a5d6a7" stroke-width="1" opacity="0.5"/>
<line x1="66" y1="48" x2="50" y2="54" stroke="#81c784" stroke-width="1" opacity="0.5"/>
<line x1="62" y1="36" x2="50" y2="44" stroke="#81c784" stroke-width="1" opacity="0.5"/>
</svg>`,

// ---- v13 Basilic ----
v13: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<defs>
  <radialGradient id="t13g" cx="40%" cy="35%" r="65%">
    <stop offset="0%" stop-color="#aed581"/>
    <stop offset="100%" stop-color="#33691e"/>
  </radialGradient>
</defs>
<path d="M50 78 L50 50" stroke="#5d4037" stroke-width="2.5" stroke-linecap="round"/>
<path d="M50 58 C44 50 36 46 32 48 C34 54 42 58 50 60" fill="url(#t13g)"/>
<path d="M50 58 C56 50 64 46 68 48 C66 54 58 58 50 60" fill="#388e3c"/>
<path d="M50 46 C44 38 36 34 32 36 C34 42 42 46 50 48" fill="#7cb342"/>
<path d="M50 46 C56 38 64 34 68 36 C66 42 58 46 50 48" fill="#558b2f"/>
<path d="M50 35 C46 28 40 25 38 27 C40 32 46 35 50 37" fill="#8bc34a"/>
<path d="M50 35 C54 28 60 25 62 27 C60 32 54 35 50 37" fill="#689f38"/>
<ellipse cx="50" cy="26" rx="8" ry="6" fill="#aed581"/>
</svg>`,

// ---- v14 Persil ----
v14: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<path d="M50 78 L50 52" stroke="#6d4c41" stroke-width="2" stroke-linecap="round"/>
<path d="M50 78 L38 62" stroke="#6d4c41" stroke-width="1.5" stroke-linecap="round"/>
<path d="M50 78 L62 62" stroke="#6d4c41" stroke-width="1.5" stroke-linecap="round"/>
<path d="M38 62 C32 55 24 52 22 54 C24 60 34 63 40 64" fill="#43a047"/>
<path d="M38 62 C38 54 34 47 31 47 C30 52 33 60 38 64" fill="#388e3c"/>
<path d="M62 62 C68 55 76 52 78 54 C76 60 66 63 60 64" fill="#4caf50"/>
<path d="M62 62 C62 54 66 47 69 47 C70 52 67 60 62 64" fill="#388e3c"/>
<path d="M50 52 C44 44 36 41 33 43 C35 49 44 52 50 54" fill="#66bb6a"/>
<path d="M50 52 C56 44 64 41 67 43 C65 49 56 52 50 54" fill="#43a047"/>
<ellipse cx="50" cy="36" rx="12" ry="10" fill="#7cb342" opacity="0.7"/>
<ellipse cx="35" cy="42" rx="9" ry="7" fill="#8bc34a" opacity="0.7"/>
<ellipse cx="65" cy="42" rx="9" ry="7" fill="#558b2f" opacity="0.7"/>
</svg>`,

// ---- v15 Piment ----
v15: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<defs>
  <linearGradient id="t15g" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#ff8f00"/>
    <stop offset="30%" stop-color="#e53935"/>
    <stop offset="100%" stop-color="#880e0e"/>
  </linearGradient>
  <radialGradient id="t15h" cx="30%" cy="25%" r="35%">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.4"/>
    <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
  </radialGradient>
</defs>
<path d="M52 25 C56 28 64 38 68 52 C72 64 70 76 64 82 C60 86 55 84 52 78 C48 72 46 60 46 48 C46 36 48 26 52 25Z" fill="url(#t15g)"/>
<path d="M52 25 C56 28 64 38 68 52 C72 64 70 76 64 82 C60 86 55 84 52 78 C48 72 46 60 46 48 C46 36 48 26 52 25Z" fill="url(#t15h)"/>
<rect x="48" y="16" width="5" height="11" rx="2.5" fill="#388e3c"/>
<path d="M50 20 C46 14 42 12 40 14 C43 15 47 18 50 22" fill="#43a047"/>
</svg>`,

// ---- v16 Chou ----
v16: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<defs>
  <radialGradient id="t16g" cx="40%" cy="35%" r="65%">
    <stop offset="0%" stop-color="#f1f8e9"/>
    <stop offset="50%" stop-color="#aed581"/>
    <stop offset="100%" stop-color="#558b2f"/>
  </radialGradient>
</defs>
<ellipse cx="50" cy="62" rx="36" ry="22" fill="#7cb342" opacity="0.6"/>
<ellipse cx="50" cy="58" rx="30" ry="26" fill="url(#t16g)"/>
<path d="M28 52 C32 44 40 40 50 40 C60 40 68 44 72 52" fill="none" stroke="#c5e1a5" stroke-width="2" opacity="0.7"/>
<path d="M32 60 C34 52 41 46 50 46 C59 46 66 52 68 60" fill="none" stroke="#c5e1a5" stroke-width="1.5" opacity="0.6"/>
<path d="M36 68 C38 60 43 55 50 55 C57 55 62 60 64 68" fill="none" stroke="#dcedc8" stroke-width="1" opacity="0.6"/>
<ellipse cx="40" cy="47" rx="7" ry="4" fill="#ffffff" opacity="0.2"/>
</svg>`,

// ---- v17 Poireau ----
v17: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<defs>
  <linearGradient id="t17w" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#e8f5e9"/>
    <stop offset="100%" stop-color="#f1f8e9"/>
  </linearGradient>
  <linearGradient id="t17g" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#1b5e20"/>
    <stop offset="100%" stop-color="#43a047"/>
  </linearGradient>
</defs>
<rect x="43" y="50" width="14" height="40" rx="7" fill="url(#t17w)"/>
<line x1="47" y1="50" x2="47" y2="90" stroke="#c8e6c9" stroke-width="0.8"/>
<line x1="53" y1="50" x2="53" y2="90" stroke="#c8e6c9" stroke-width="0.8"/>
<path d="M40 50 C34 38 30 22 32 12" stroke="url(#t17g)" stroke-width="8" fill="none" stroke-linecap="round"/>
<path d="M50 50 C50 38 50 22 50 12" stroke="#388e3c" stroke-width="7" fill="none" stroke-linecap="round"/>
<path d="M60 50 C66 38 70 22 68 12" stroke="#2e7d32" stroke-width="7" fill="none" stroke-linecap="round"/>
</svg>`,

// ---- v18 Petit pois ----
v18: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<defs>
  <linearGradient id="t18g" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#a5d6a7"/>
    <stop offset="100%" stop-color="#2e7d32"/>
  </linearGradient>
</defs>
<path d="M18 50 C20 38 28 30 38 30 C48 30 52 38 54 44 C56 38 62 30 72 30 C82 30 86 38 82 50 C78 62 70 72 54 72 C52 74 52 76 50 78 C48 76 48 74 46 72 C30 72 22 62 18 50Z" fill="url(#t18g)"/>
<path d="M20 50 C22 40 28 34 36 34" fill="none" stroke="#c8e6c9" stroke-width="1.5" opacity="0.7"/>
<circle cx="32" cy="52" r="7" fill="#43a047"/>
<circle cx="44" cy="48" r="7" fill="#388e3c"/>
<circle cx="56" cy="48" r="7" fill="#43a047"/>
<circle cx="68" cy="52" r="7" fill="#2e7d32"/>
<circle cx="32" cy="52" r="4" fill="#66bb6a" opacity="0.5"/>
<circle cx="56" cy="48" r="4" fill="#66bb6a" opacity="0.5"/>
</svg>`,

// ---- v19 Betterave ----
v19: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<defs>
  <radialGradient id="t19g" cx="35%" cy="30%" r="70%">
    <stop offset="0%" stop-color="#ef9a9a"/>
    <stop offset="45%" stop-color="#880e4f"/>
    <stop offset="100%" stop-color="#4a0032"/>
  </radialGradient>
</defs>
<path d="M38 30 C34 24 30 20 28 22 C30 26 36 30 42 34" fill="#e53935"/>
<path d="M50 28 C50 20 50 16 50 14" stroke="#c62828" stroke-width="2.5" stroke-linecap="round" fill="none"/>
<path d="M62 30 C66 24 70 20 72 22 C70 26 64 30 58 34" fill="#b71c1c"/>
<ellipse cx="50" cy="62" rx="30" ry="28" fill="url(#t19g)"/>
<path d="M28 56 C30 46 36 40 44 38" fill="none" stroke="#f48fb1" stroke-width="1.5" opacity="0.5"/>
<line x1="50" y1="88" x2="50" y2="96" stroke="#880e4f" stroke-width="1.5" stroke-linecap="round"/>
</svg>`,

// ---- v20 Navet ----
v20: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<defs>
  <radialGradient id="t20g" cx="38%" cy="30%" r="70%">
    <stop offset="0%" stop-color="#ffffff"/>
    <stop offset="40%" stop-color="#f3e5f5"/>
    <stop offset="70%" stop-color="#ce93d8"/>
    <stop offset="100%" stop-color="#7b1fa2"/>
  </radialGradient>
</defs>
<path d="M38 30 C36 24 34 20 32 22 C34 26 38 30 42 34" fill="#66bb6a"/>
<path d="M50 28 C50 20 50 15 50 14" stroke="#43a047" stroke-width="2.5" stroke-linecap="round" fill="none"/>
<path d="M62 30 C64 24 66 20 68 22 C66 26 62 30 58 34" fill="#388e3c"/>
<ellipse cx="50" cy="63" rx="32" ry="26" fill="url(#t20g)"/>
<line x1="50" y1="88" x2="50" y2="96" stroke="#9c27b0" stroke-width="1.5" stroke-linecap="round"/>
</svg>`,

// ---- v21 Ail ----
v21: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<defs>
  <radialGradient id="t21g" cx="38%" cy="30%" r="70%">
    <stop offset="0%" stop-color="#ffffff"/>
    <stop offset="50%" stop-color="#f5f5f5"/>
    <stop offset="100%" stop-color="#bdbdbd"/>
  </radialGradient>
  <radialGradient id="t21c" cx="38%" cy="30%" r="65%">
    <stop offset="0%" stop-color="#ffffff"/>
    <stop offset="100%" stop-color="#e0e0e0"/>
  </radialGradient>
</defs>
<path d="M50 25 C50 18 50 14 50 14" stroke="#81c784" stroke-width="3" stroke-linecap="round" fill="none"/>
<path d="M50 28 C46 22 42 20 40 22 C42 24 46 27 50 30" fill="#a5d6a7"/>
<path d="M50 28 C54 22 58 20 60 22 C58 24 54 27 50 30" fill="#81c784"/>
<ellipse cx="50" cy="62" rx="28" ry="30" fill="url(#t21g)"/>
<path d="M36 46 C32 54 32 66 38 74 C42 80 50 82 50 82" fill="none" stroke="#e0e0e0" stroke-width="1.5" opacity="0.8"/>
<path d="M36 46 C40 42 46 40 50 40 C54 40 60 42 64 46" fill="none" stroke="#e0e0e0" stroke-width="1.5" opacity="0.8"/>
<path d="M50 40 C46 44 44 50 44 56 C44 64 46 72 50 76" fill="none" stroke="#f5f5f5" stroke-width="1" opacity="0.9"/>
<path d="M50 40 C44 44 40 50 40 58 C40 66 44 74 50 76" fill="none" stroke="#eeeeee" stroke-width="1" opacity="0.6"/>
<path d="M50 40 C56 44 60 50 60 58 C60 66 56 74 50 76" fill="none" stroke="#eeeeee" stroke-width="1" opacity="0.6"/>
</svg>`,

// ---- v22 Echalote ----
v22: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<defs>
  <radialGradient id="t22g" cx="35%" cy="28%" r="70%">
    <stop offset="0%" stop-color="#ffccbc"/>
    <stop offset="40%" stop-color="#c8824a"/>
    <stop offset="100%" stop-color="#7b3f1a"/>
  </radialGradient>
</defs>
<path d="M50 22 C50 15 50 12 50 12" stroke="#81c784" stroke-width="2.5" stroke-linecap="round" fill="none"/>
<path d="M50 25 C46 19 42 17 40 19 C42 21 46 24 50 27" fill="#a5d6a7"/>
<path d="M50 25 C54 19 58 17 60 19 C58 21 54 24 50 27" fill="#81c784"/>
<path d="M42 28 C36 32 32 42 34 54 C36 64 42 72 50 74 C58 72 64 64 66 54 C68 42 64 32 58 28Z" fill="url(#t22g)"/>
<path d="M36 44 C37 38 40 34 44 32" fill="none" stroke="#ffb74d" stroke-width="1.2" opacity="0.5"/>
<path d="M38 56 C37 50 37 44 39 38" fill="none" stroke="#ffb74d" stroke-width="1" opacity="0.4"/>
<line x1="50" y1="74" x2="50" y2="82" stroke="#8b4513" stroke-width="1.5" stroke-linecap="round"/>
</svg>`,

// ---- v23 Ciboulette ----
v23: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<path d="M35 88 C35 70 34 50 36 30 C36 24 35 20 35 16" stroke="#43a047" stroke-width="3" fill="none" stroke-linecap="round"/>
<path d="M45 88 C45 72 44 52 46 32 C46 25 45 20 45 15" stroke="#388e3c" stroke-width="3" fill="none" stroke-linecap="round"/>
<path d="M55 88 C55 70 54 50 56 30 C56 24 55 20 55 16" stroke="#4caf50" stroke-width="3" fill="none" stroke-linecap="round"/>
<path d="M65 88 C65 72 64 52 66 32 C66 25 65 20 65 15" stroke="#2e7d32" stroke-width="3" fill="none" stroke-linecap="round"/>
<circle cx="35" cy="14" r="5" fill="#ab47bc"/>
<circle cx="45" cy="13" r="5" fill="#9c27b0"/>
<circle cx="55" cy="14" r="5" fill="#ab47bc"/>
<circle cx="65" cy="13" r="5" fill="#7b1fa2"/>
</svg>`,

// ---- v24 Blette ----
v24: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<defs>
  <linearGradient id="t24g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#e53935"/>
    <stop offset="100%" stop-color="#b71c1c"/>
  </linearGradient>
</defs>
<path d="M50 82 C50 60 45 42 38 28 C34 22 28 20 26 22 C28 28 34 34 38 42 C42 52 44 66 50 82" fill="#2e7d32"/>
<path d="M50 82 C50 60 55 42 62 28 C66 22 72 20 74 22 C72 28 66 34 62 42 C58 52 56 66 50 82" fill="#1b5e20"/>
<path d="M50 82 L50 28" stroke="url(#t24g)" stroke-width="4" stroke-linecap="round" fill="none"/>
<path d="M50 55 C44 52 38 48 36 44" stroke="#ef9a9a" stroke-width="1.5" fill="none" opacity="0.7"/>
<path d="M50 45 C44 42 38 38 36 34" stroke="#ef9a9a" stroke-width="1.5" fill="none" opacity="0.7"/>
<path d="M50 55 C56 52 62 48 64 44" stroke="#ef9a9a" stroke-width="1.5" fill="none" opacity="0.6"/>
</svg>`,

// ---- v25 Mâche ----
v25: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<ellipse cx="50" cy="60" rx="6" ry="4" fill="#4e6b40"/>
<path d="M50 58 C40 50 30 48 26 52 C28 58 40 60 50 60" fill="#558b2f"/>
<path d="M50 58 C60 50 70 48 74 52 C72 58 60 60 50 60" fill="#33691e"/>
<path d="M50 58 C42 48 40 36 44 30 C48 28 52 34 50 44" fill="#689f38"/>
<path d="M50 58 C58 48 60 36 56 30 C52 28 48 34 50 44" fill="#558b2f"/>
<path d="M50 60 C38 64 28 68 26 74 C30 78 42 72 50 66" fill="#7cb342"/>
<path d="M50 60 C62 64 72 68 74 74 C70 78 58 72 50 66" fill="#4caf50"/>
</svg>`,

// ---- v26 Roquette ----
v26: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<path d="M50 82 L50 52" stroke="#6d4c41" stroke-width="2" stroke-linecap="round"/>
<path d="M50 52 C40 44 28 42 24 46 C26 52 38 54 50 54" fill="#558b2f"/>
<path d="M24 46 C22 40 26 34 30 36 C28 40 26 44 28 48Z" fill="#689f38"/>
<path d="M50 52 C60 44 72 42 76 46 C74 52 62 54 50 54" fill="#33691e"/>
<path d="M76 46 C78 40 74 34 70 36 C72 40 74 44 72 48Z" fill="#558b2f"/>
<path d="M50 66 C40 58 28 56 24 60 C26 66 38 68 50 68" fill="#7cb342"/>
<path d="M24 60 C22 54 26 48 30 50 C28 54 26 58 28 62Z" fill="#8bc34a"/>
<path d="M50 66 C60 58 72 56 76 60 C74 66 62 68 50 68" fill="#43a047"/>
</svg>`,

// ---- v27 Cresson ----
v27: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<path d="M50 82 C46 70 42 58 38 48" stroke="#5d4037" stroke-width="2" fill="none" stroke-linecap="round"/>
<path d="M50 82 C54 70 58 58 62 48" stroke="#5d4037" stroke-width="2" fill="none" stroke-linecap="round"/>
<path d="M50 82 L50 48" stroke="#6d4c41" stroke-width="2" fill="none" stroke-linecap="round"/>
<circle cx="38" cy="44" r="9" fill="#4caf50"/>
<circle cx="50" cy="40" r="10" fill="#43a047"/>
<circle cx="62" cy="44" r="9" fill="#388e3c"/>
<circle cx="30" cy="52" r="8" fill="#66bb6a"/>
<circle cx="70" cy="52" r="8" fill="#2e7d32"/>
<circle cx="38" cy="44" r="4" fill="#a5d6a7" opacity="0.4"/>
<circle cx="50" cy="40" r="4" fill="#a5d6a7" opacity="0.4"/>
</svg>`,

// ---- v28 Kale ----
v28: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<defs>
  <radialGradient id="t28g" cx="40%" cy="35%" r="65%">
    <stop offset="0%" stop-color="#66bb6a"/>
    <stop offset="100%" stop-color="#1a3d1a"/>
  </radialGradient>
</defs>
<path d="M50 80 L50 50" stroke="#5d4037" stroke-width="2.5" stroke-linecap="round" fill="none"/>
<path d="M50 50 C36 42 22 36 18 38 C18 46 32 52 50 56" fill="url(#t28g)"/>
<path d="M18 38 C14 32 18 24 22 26 C20 30 20 36 22 40Z" fill="#2e7d32"/>
<path d="M50 50 C64 42 78 36 82 38 C82 46 68 52 50 56" fill="#2e5c2e"/>
<path d="M82 38 C86 32 82 24 78 26 C80 30 80 36 78 40Z" fill="#1b5e20"/>
<path d="M50 64 C36 56 22 50 18 52 C18 60 32 66 50 70" fill="#388e3c"/>
<path d="M50 64 C64 56 78 50 82 52 C82 60 68 66 50 70" fill="#1b5e20"/>
</svg>`,

// ---- v29 Pak choi ----
v29: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<path d="M50 80 L50 58" stroke="#c8e6c9" stroke-width="5" stroke-linecap="round" fill="none"/>
<path d="M40 80 C36 70 34 60 36 50" stroke="#dcedc8" stroke-width="4" fill="none" stroke-linecap="round"/>
<path d="M60 80 C64 70 66 60 64 50" stroke="#dcedc8" stroke-width="4" fill="none" stroke-linecap="round"/>
<path d="M36 50 C28 42 18 36 16 38 C18 46 30 52 44 54" fill="#2e7d32"/>
<path d="M16 38 C14 32 18 26 22 28 C20 32 18 38 20 42Z" fill="#1b5e20"/>
<path d="M64 50 C72 42 82 36 84 38 C82 46 70 52 56 54" fill="#388e3c"/>
<path d="M84 38 C86 32 82 26 78 28 C80 32 82 38 80 42Z" fill="#2e7d32"/>
<path d="M50 58 C38 50 24 44 20 46 C22 54 36 60 52 62" fill="#43a047"/>
<path d="M50 58 C62 50 76 44 80 46 C78 54 64 60 48 62" fill="#33691e"/>
</svg>`,

// ---- v30 Chicorée ----
v30: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<defs>
  <radialGradient id="t30g" cx="40%" cy="35%" r="65%">
    <stop offset="0%" stop-color="#f9fbe7"/>
    <stop offset="60%" stop-color="#c5e1a5"/>
    <stop offset="100%" stop-color="#558b2f"/>
  </radialGradient>
</defs>
<ellipse cx="50" cy="60" rx="32" ry="28" fill="url(#t30g)"/>
<path d="M26 56 C30 46 38 40 50 40 C62 40 70 46 74 56" fill="none" stroke="#dcedc8" stroke-width="1.8" opacity="0.8"/>
<path d="M30 64 C34 54 41 48 50 48 C59 48 66 54 70 64" fill="none" stroke="#dcedc8" stroke-width="1.5" opacity="0.7"/>
<path d="M34 72 C38 62 43 57 50 57 C57 57 62 62 66 72" fill="none" stroke="#dcedc8" stroke-width="1.2" opacity="0.6"/>
<ellipse cx="40" cy="46" rx="6" ry="4" fill="#ffffff" opacity="0.25"/>
</svg>`,

// ---- v31 Endive ----
v31: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<defs>
  <radialGradient id="t31g" cx="38%" cy="30%" r="65%">
    <stop offset="0%" stop-color="#fffde7"/>
    <stop offset="60%" stop-color="#fff9c4"/>
    <stop offset="100%" stop-color="#f9a825"/>
  </radialGradient>
</defs>
<path d="M50 84 C42 84 35 70 34 54 C33 38 38 24 50 22 C62 24 67 38 66 54 C65 70 58 84 50 84Z" fill="url(#t31g)"/>
<path d="M38 40 C40 34 44 28 50 26" fill="none" stroke="#fffde7" stroke-width="2" opacity="0.8"/>
<path d="M36 52 C38 44 42 36 46 32" fill="none" stroke="#fffde7" stroke-width="1.5" opacity="0.6"/>
<path d="M37 64 C38 56 40 48 44 42" fill="none" stroke="#fffde7" stroke-width="1.2" opacity="0.5"/>
<ellipse cx="42" cy="34" rx="6" ry="4" fill="#ffffff" opacity="0.3"/>
</svg>`,

// ---- v32 Céleri-rave ----
v32: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<defs>
  <radialGradient id="t32g" cx="38%" cy="30%" r="70%">
    <stop offset="0%" stop-color="#d7ccc8"/>
    <stop offset="50%" stop-color="#8d6e63"/>
    <stop offset="100%" stop-color="#4e342e"/>
  </radialGradient>
</defs>
<circle cx="50" cy="60" r="30" fill="url(#t32g)"/>
<path d="M26 54 C28 46 34 40 42 38" fill="none" stroke="#bcaaa4" stroke-width="1.5" opacity="0.6"/>
<path d="M24 62 C26 54 30 46 36 42" fill="none" stroke="#bcaaa4" stroke-width="1" opacity="0.4"/>
<path d="M42 32 C38 26 36 22 36 20" stroke="#4caf50" stroke-width="2.5" fill="none" stroke-linecap="round"/>
<path d="M50 30 C50 22 50 18 50 16" stroke="#388e3c" stroke-width="2.5" fill="none" stroke-linecap="round"/>
<path d="M58 32 C62 26 64 22 64 20" stroke="#43a047" stroke-width="2.5" fill="none" stroke-linecap="round"/>
</svg>`,

// ---- v33 Panais ----
v33: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<defs>
  <linearGradient id="t33g" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#fffde7"/>
    <stop offset="40%" stop-color="#fff9c4"/>
    <stop offset="100%" stop-color="#f9a825"/>
  </linearGradient>
</defs>
<path d="M44 22 C40 35 38 52 40 68 C42 78 46 88 50 90 C54 88 58 78 60 68 C62 52 60 35 56 22Z" fill="url(#t33g)"/>
<path d="M44 35 C42 40 41 46 42 52" fill="none" stroke="#fffde7" stroke-width="1.2" opacity="0.7"/>
<path d="M40 18 C40 14 40 12 40 12" stroke="#66bb6a" stroke-width="2" stroke-linecap="round" fill="none"/>
<path d="M50 20 C50 14 50 11 50 11" stroke="#4caf50" stroke-width="2.5" stroke-linecap="round" fill="none"/>
<path d="M60 18 C60 14 60 12 60 12" stroke="#43a047" stroke-width="2" stroke-linecap="round" fill="none"/>
</svg>`,

// ---- v34 Radis noir ----
v34: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<defs>
  <radialGradient id="t34g" cx="35%" cy="30%" r="65%">
    <stop offset="0%" stop-color="#616161"/>
    <stop offset="50%" stop-color="#212121"/>
    <stop offset="100%" stop-color="#000000"/>
  </radialGradient>
</defs>
<path d="M38 28 C36 22 32 18 30 20 C32 24 36 28 40 32" fill="#66bb6a"/>
<path d="M50 26 C50 18 50 14 50 12" stroke="#4caf50" stroke-width="2.5" stroke-linecap="round" fill="none"/>
<path d="M62 28 C64 22 68 18 70 20 C68 24 64 28 60 32" fill="#388e3c"/>
<ellipse cx="50" cy="60" rx="28" ry="26" fill="url(#t34g)"/>
<ellipse cx="38" cy="48" rx="6" ry="4" fill="#757575" opacity="0.4"/>
<line x1="50" y1="86" x2="50" y2="94" stroke="#424242" stroke-width="1.5" stroke-linecap="round"/>
</svg>`,

// ---- v35 Topinambour ----
v35: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<defs>
  <radialGradient id="t35g" cx="38%" cy="30%" r="70%">
    <stop offset="0%" stop-color="#d7ccc8"/>
    <stop offset="45%" stop-color="#a1887f"/>
    <stop offset="100%" stop-color="#4e342e"/>
  </radialGradient>
</defs>
<ellipse cx="50" cy="58" rx="26" ry="22" fill="url(#t35g)"/>
<ellipse cx="32" cy="50" rx="12" ry="10" fill="#a1887f"/>
<ellipse cx="68" cy="52" rx="11" ry="9" fill="#8d6e63"/>
<ellipse cx="44" cy="72" rx="10" ry="8" fill="#795548"/>
<ellipse cx="62" cy="70" rx="10" ry="8" fill="#6d4c41"/>
<path d="M28 44 C26 38 28 32 30 34 C28 38 28 42 30 46Z" fill="#bcaaa4"/>
</svg>`,

// ---- v36 Chou-fleur ----
v36: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<defs>
  <radialGradient id="t36g" cx="40%" cy="35%" r="60%">
    <stop offset="0%" stop-color="#ffffff"/>
    <stop offset="60%" stop-color="#f5f5f5"/>
    <stop offset="100%" stop-color="#e0e0e0"/>
  </radialGradient>
</defs>
<path d="M24 74 C28 66 34 62 42 62 L58 62 C66 62 72 66 76 74Z" fill="#388e3c"/>
<path d="M30 68 C30 58 34 52 40 50" fill="none" stroke="#a5d6a7" stroke-width="1.5" opacity="0.6"/>
<path d="M70 68 C70 58 66 52 60 50" fill="none" stroke="#a5d6a7" stroke-width="1.5" opacity="0.6"/>
<circle cx="36" cy="46" r="14" fill="url(#t36g)"/>
<circle cx="50" cy="40" r="16" fill="url(#t36g)"/>
<circle cx="64" cy="46" r="14" fill="url(#t36g)"/>
<circle cx="42" cy="56" r="12" fill="url(#t36g)"/>
<circle cx="58" cy="56" r="12" fill="url(#t36g)"/>
<circle cx="50" cy="52" r="10" fill="#fafafa"/>
</svg>`,

// ---- v37 Brocoli ----
v37: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<defs>
  <radialGradient id="t37g" cx="40%" cy="35%" r="60%">
    <stop offset="0%" stop-color="#66bb6a"/>
    <stop offset="60%" stop-color="#2e7d32"/>
    <stop offset="100%" stop-color="#1b5e20"/>
  </radialGradient>
</defs>
<rect x="46" y="60" width="8" height="26" rx="4" fill="#33691e"/>
<path d="M46 64 C36 60 28 54 26 48 C28 42 34 40 40 42" fill="#2e7d32" opacity="0.5"/>
<path d="M54 64 C64 60 72 54 74 48 C72 42 66 40 60 42" fill="#2e7d32" opacity="0.5"/>
<circle cx="34" cy="44" r="14" fill="url(#t37g)"/>
<circle cx="50" cy="38" r="16" fill="url(#t37g)"/>
<circle cx="66" cy="44" r="14" fill="url(#t37g)"/>
<circle cx="40" cy="54" r="12" fill="#388e3c"/>
<circle cx="60" cy="54" r="12" fill="#2e7d32"/>
<circle cx="34" cy="44" r="6" fill="#81c784" opacity="0.4"/>
<circle cx="50" cy="38" r="7" fill="#81c784" opacity="0.4"/>
</svg>`,

// ---- v38 Chou rouge ----
v38: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<defs>
  <radialGradient id="t38g" cx="40%" cy="35%" r="65%">
    <stop offset="0%" stop-color="#e1bee7"/>
    <stop offset="50%" stop-color="#7b1fa2"/>
    <stop offset="100%" stop-color="#4a148c"/>
  </radialGradient>
</defs>
<ellipse cx="50" cy="60" rx="30" ry="26" fill="url(#t38g)"/>
<path d="M26 54 C30 44 38 38 50 38 C62 38 70 44 74 54" fill="none" stroke="#ce93d8" stroke-width="2" opacity="0.7"/>
<path d="M30 62 C34 52 41 46 50 46 C59 46 66 52 70 62" fill="none" stroke="#ce93d8" stroke-width="1.5" opacity="0.6"/>
<path d="M34 70 C38 60 43 55 50 55 C57 55 62 60 66 70" fill="none" stroke="#ce93d8" stroke-width="1.2" opacity="0.5"/>
<ellipse cx="38" cy="44" rx="7" ry="4" fill="#ffffff" opacity="0.18"/>
</svg>`,

// ---- v39 Chou de Bruxelles ----
v39: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<defs>
  <radialGradient id="t39g" cx="38%" cy="32%" r="60%">
    <stop offset="0%" stop-color="#c5e1a5"/>
    <stop offset="60%" stop-color="#558b2f"/>
    <stop offset="100%" stop-color="#33691e"/>
  </radialGradient>
</defs>
<rect x="48" y="30" width="4" height="55" rx="2" fill="#5d4037"/>
<circle cx="50" cy="35" r="10" fill="url(#t39g)"/>
<circle cx="34" cy="48" r="9" fill="#4caf50"/>
<circle cx="66" cy="52" r="9" fill="#43a047"/>
<circle cx="40" cy="65" r="9" fill="#388e3c"/>
<circle cx="62" cy="68" r="9" fill="#2e7d32"/>
<circle cx="50" cy="78" r="9" fill="#33691e"/>
<circle cx="34" cy="48" r="4" fill="#a5d6a7" opacity="0.4"/>
<circle cx="50" cy="35" r="4" fill="#a5d6a7" opacity="0.4"/>
</svg>`,

// ---- v40 Melon ----
v40: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<defs>
  <radialGradient id="t40g" cx="38%" cy="30%" r="70%">
    <stop offset="0%" stop-color="#fff9c4"/>
    <stop offset="50%" stop-color="#f9a825"/>
    <stop offset="100%" stop-color="#e65100"/>
  </radialGradient>
</defs>
<ellipse cx="50" cy="55" rx="34" ry="32" fill="url(#t40g)"/>
<path d="M28 40 C34 32 42 28 50 28 C58 28 66 32 72 40" fill="none" stroke="#a5d6a7" stroke-width="1.5" opacity="0.6"/>
<path d="M20 55 C22 42 30 34 38 30" fill="none" stroke="#c8e6c9" stroke-width="1.2" opacity="0.5"/>
<path d="M80 55 C78 42 70 34 62 30" fill="none" stroke="#c8e6c9" stroke-width="1.2" opacity="0.5"/>
<path d="M22 62 C24 50 30 42 38 38" fill="none" stroke="#c8e6c9" stroke-width="1" opacity="0.4"/>
<path d="M50 28 C52 22 52 18 52 16" stroke="#388e3c" stroke-width="2.5" stroke-linecap="round" fill="none"/>
<ellipse cx="38" cy="38" rx="6" ry="4" fill="#ffffff" opacity="0.25"/>
</svg>`,

// ---- v41 Potiron ----
v41: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<defs>
  <radialGradient id="t41g" cx="38%" cy="30%" r="68%">
    <stop offset="0%" stop-color="#ffcc80"/>
    <stop offset="40%" stop-color="#f57c00"/>
    <stop offset="100%" stop-color="#bf360c"/>
  </radialGradient>
</defs>
<path d="M20 56 C20 38 28 28 36 28 C40 28 44 32 46 38 C48 32 52 28 56 28 C64 28 72 38 76 52 C80 66 74 80 64 82 C58 82 54 76 50 70 C46 76 42 82 36 82 C26 80 20 72 20 56Z" fill="url(#t41g)"/>
<path d="M22 52 C24 42 30 36 36 34" fill="none" stroke="#ffe0b2" stroke-width="1.5" opacity="0.6"/>
<path d="M78 52 C76 42 70 36 64 34" fill="none" stroke="#ffe0b2" stroke-width="1.5" opacity="0.6"/>
<path d="M40 28 C42 22 44 18 44 16" stroke="#5d4037" stroke-width="3" stroke-linecap="round" fill="none"/>
<path d="M44 20 C40 14 38 12 36 14 C38 16 42 18 44 22" fill="#388e3c"/>
</svg>`,

// ---- v42 Potimarron ----
v42: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<defs>
  <radialGradient id="t42g" cx="35%" cy="28%" r="70%">
    <stop offset="0%" stop-color="#ffab76"/>
    <stop offset="45%" stop-color="#e64a19"/>
    <stop offset="100%" stop-color="#880e00"/>
  </radialGradient>
</defs>
<path d="M50 24 C40 24 28 36 24 52 C20 68 28 86 42 88 C48 88 52 82 50 74 C48 82 44 86 50 86 C58 86 68 76 72 64 C76 50 72 34 62 26 C58 24 54 22 50 24Z" fill="url(#t42g)"/>
<path d="M26 50 C28 40 34 34 42 30" fill="none" stroke="#ffcc80" stroke-width="1.5" opacity="0.5"/>
<path d="M24 62 C26 52 30 44 36 38" fill="none" stroke="#ffcc80" stroke-width="1" opacity="0.4"/>
<path d="M50 24 C52 16 52 12 52 12" stroke="#5d4037" stroke-width="3" stroke-linecap="round" fill="none"/>
<ellipse cx="36" cy="36" rx="6" ry="4" fill="#ffffff" opacity="0.2"/>
</svg>`,

// ---- v43 Pastèque ----
v43: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<defs>
  <radialGradient id="t43g" cx="38%" cy="30%" r="70%">
    <stop offset="0%" stop-color="#ef9a9a"/>
    <stop offset="40%" stop-color="#e53935"/>
    <stop offset="100%" stop-color="#880e0e"/>
  </radialGradient>
</defs>
<ellipse cx="50" cy="58" rx="36" ry="30" fill="#1b5e20"/>
<ellipse cx="50" cy="58" rx="30" ry="24" fill="#388e3c"/>
<path d="M24 58 C26 46 32 40 40 38" fill="none" stroke="#66bb6a" stroke-width="4" opacity="0.5"/>
<path d="M32 74 C28 66 26 56 28 46" fill="none" stroke="#66bb6a" stroke-width="4" opacity="0.5"/>
<path d="M50 52 C40 42 28 42 24 50 C24 60 34 68 50 70 C66 68 76 60 76 50 C72 42 60 42 50 52Z" fill="url(#t43g)"/>
<circle cx="38" cy="56" r="3" fill="#1b5e20"/>
<circle cx="52" cy="52" r="3" fill="#1b5e20"/>
<circle cx="44" cy="64" r="3" fill="#1b5e20"/>
<circle cx="62" cy="60" r="3" fill="#1b5e20"/>
</svg>`,

// ---- v44 Courge butternut ----
v44: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<defs>
  <linearGradient id="t44g" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#ffe082"/>
    <stop offset="50%" stop-color="#ffb300"/>
    <stop offset="100%" stop-color="#e65100"/>
  </linearGradient>
</defs>
<path d="M50 18 C46 18 42 24 42 34 C42 40 44 46 46 50 C40 52 34 58 34 68 C34 78 42 88 50 88 C58 88 66 78 66 68 C66 58 60 52 54 50 C56 46 58 40 58 34 C58 24 54 18 50 18Z" fill="url(#t44g)"/>
<path d="M44 30 C44 24 46 20 50 20" fill="none" stroke="#fff8e1" stroke-width="1.5" opacity="0.6"/>
<path d="M36 66 C38 58 42 54 46 52" fill="none" stroke="#fff8e1" stroke-width="1.5" opacity="0.5"/>
<path d="M50 18 C52 12 52 10 52 10" stroke="#5d4037" stroke-width="2.5" stroke-linecap="round" fill="none"/>
</svg>`,

// ---- v45 Fève ----
v45: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<defs>
  <linearGradient id="t45g" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#a5d6a7"/>
    <stop offset="100%" stop-color="#2e7d32"/>
  </linearGradient>
</defs>
<path d="M30 76 C30 52 34 32 42 20 C46 14 54 14 58 20 C66 32 70 52 70 76 C66 82 58 86 50 86 C42 86 34 82 30 76Z" fill="url(#t45g)"/>
<path d="M32 68 C34 54 36 40 40 28" fill="none" stroke="#c8e6c9" stroke-width="1.5" opacity="0.7"/>
<ellipse cx="50" cy="44" rx="10" ry="12" fill="#388e3c" opacity="0.5"/>
<ellipse cx="50" cy="66" rx="10" ry="12" fill="#2e7d32" opacity="0.5"/>
</svg>`,

// ---- v47 Haricot vert ----
v47: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<defs>
  <linearGradient id="t47g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#81c784"/>
    <stop offset="100%" stop-color="#1b5e20"/>
  </linearGradient>
</defs>
<path d="M20 72 C22 56 28 40 38 28 C44 22 56 20 62 26 C68 32 66 44 62 54 C58 64 50 74 42 80 C34 82 22 80 20 72Z" fill="url(#t47g)" transform="rotate(-20,50,50)"/>
<path d="M22 68 C24 56 28 44 34 34" fill="none" stroke="#c8e6c9" stroke-width="1.5" opacity="0.6" transform="rotate(-20,50,50)"/>
<circle cx="20" cy="72" r="3" fill="#2e7d32" transform="rotate(-20,50,50)"/>
<circle cx="62" cy="26" r="2.5" fill="#33691e" transform="rotate(-20,50,50)"/>
</svg>`,

// ---- v48 Pois mange-tout ----
v48: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<defs>
  <linearGradient id="t48g" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0%" stop-color="#a5d6a7"/>
    <stop offset="50%" stop-color="#66bb6a"/>
    <stop offset="100%" stop-color="#2e7d32"/>
  </linearGradient>
</defs>
<path d="M14 58 C16 44 26 34 40 30 C54 26 70 32 80 44 C84 50 82 60 76 64 C66 70 52 68 40 66 C28 64 14 68 14 58Z" fill="url(#t48g)"/>
<path d="M16 56 C18 46 24 38 32 34" fill="none" stroke="#dcedc8" stroke-width="1.5" opacity="0.7"/>
<circle cx="34" cy="50" r="7" fill="#388e3c" opacity="0.5"/>
<circle cx="50" cy="48" r="7" fill="#2e7d32" opacity="0.5"/>
<circle cx="66" cy="50" r="7" fill="#43a047" opacity="0.5"/>
</svg>`,

// ---- v49 Maïs doux ----
v49: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<defs>
  <linearGradient id="t49g" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#fff9c4"/>
    <stop offset="50%" stop-color="#f9a825"/>
    <stop offset="100%" stop-color="#f57f17"/>
  </linearGradient>
</defs>
<path d="M38 18 C36 28 34 40 36 54 C38 66 44 76 50 80 C56 76 62 66 64 54 C66 40 64 28 62 18Z" fill="#a5d6a7"/>
<path d="M38 30 C34 38 30 50 32 62" fill="none" stroke="#66bb6a" stroke-width="1.5" opacity="0.7"/>
<path d="M62 30 C66 38 70 50 68 62" fill="none" stroke="#43a047" stroke-width="1.5" opacity="0.7"/>
<path d="M40 22 C40 26 40 36 42 48 C44 60 48 70 50 76 C52 70 56 60 58 48 C60 36 60 26 60 22Z" fill="url(#t49g)"/>
<line x1="44" y1="22" x2="44" y2="76" stroke="#f57f17" stroke-width="1" opacity="0.4"/>
<line x1="50" y1="22" x2="50" y2="76" stroke="#f57f17" stroke-width="1" opacity="0.4"/>
<line x1="56" y1="22" x2="56" y2="76" stroke="#f57f17" stroke-width="1" opacity="0.4"/>
<path d="M42 30 C44 34 44 40 44 46" fill="none" stroke="#fff9c4" stroke-width="1" opacity="0.6"/>
<path d="M38 14 C34 8 32 4 32 4" stroke="#a5d6a7" stroke-width="2" fill="none" stroke-linecap="round"/>
<path d="M62 14 C66 8 68 4 68 4" stroke="#81c784" stroke-width="2" fill="none" stroke-linecap="round"/>
</svg>`,

// ---- v50 Pomme de terre ----
v50: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<defs>
  <radialGradient id="t50g" cx="38%" cy="30%" r="70%">
    <stop offset="0%" stop-color="#d7ccc8"/>
    <stop offset="50%" stop-color="#a1887f"/>
    <stop offset="100%" stop-color="#5d4037"/>
  </radialGradient>
</defs>
<path d="M18 56 C18 38 28 24 44 22 C58 20 72 28 78 44 C84 58 78 76 66 82 C52 88 32 84 22 72 C18 66 18 62 18 56Z" fill="url(#t50g)"/>
<path d="M22 50 C24 40 30 34 38 30" fill="none" stroke="#d7ccc8" stroke-width="1.5" opacity="0.5"/>
<circle cx="46" cy="30" r="3" fill="#8d6e63" opacity="0.6"/>
<circle cx="62" cy="38" r="3" fill="#795548" opacity="0.6"/>
<circle cx="68" cy="56" r="3" fill="#8d6e63" opacity="0.6"/>
<circle cx="36" cy="68" r="3" fill="#795548" opacity="0.6"/>
</svg>`,

// ---- v51 Patate douce ----
v51: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<defs>
  <radialGradient id="t51g" cx="38%" cy="30%" r="70%">
    <stop offset="0%" stop-color="#ffab91"/>
    <stop offset="45%" stop-color="#e64a19"/>
    <stop offset="100%" stop-color="#7b1100"/>
  </radialGradient>
</defs>
<path d="M16 54 C16 38 24 24 38 18 C52 12 68 18 78 34 C88 50 82 72 68 80 C54 88 30 84 20 70 C16 64 16 60 16 54Z" fill="url(#t51g)"/>
<path d="M20 48 C22 38 28 32 36 26" fill="none" stroke="#ffccbc" stroke-width="1.5" opacity="0.5"/>
<path d="M18 60 C20 50 24 42 30 36" fill="none" stroke="#ffccbc" stroke-width="1" opacity="0.4"/>
</svg>`,

// ---- v52 Menthe ----
v52: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<path d="M50 82 L50 50" stroke="#5d4037" stroke-width="2.5" stroke-linecap="round"/>
<path d="M50 50 L38 35" stroke="#5d4037" stroke-width="2" fill="none" stroke-linecap="round"/>
<path d="M50 50 L62 35" stroke="#5d4037" stroke-width="2" fill="none" stroke-linecap="round"/>
<path d="M50 66 L36 52" stroke="#5d4037" stroke-width="1.5" fill="none" stroke-linecap="round"/>
<path d="M50 66 L64 52" stroke="#5d4037" stroke-width="1.5" fill="none" stroke-linecap="round"/>
<ellipse cx="35" cy="30" rx="14" ry="10" fill="#a5d6a7" transform="rotate(-30,35,30)"/>
<line x1="35" y1="22" x2="35" y2="38" stroke="#66bb6a" stroke-width="1" opacity="0.7" transform="rotate(-30,35,30)"/>
<line x1="28" y1="30" x2="42" y2="30" stroke="#66bb6a" stroke-width="0.8" opacity="0.5" transform="rotate(-30,35,30)"/>
<ellipse cx="65" cy="30" rx="14" ry="10" fill="#81c784" transform="rotate(30,65,30)"/>
<line x1="65" y1="22" x2="65" y2="38" stroke="#4caf50" stroke-width="1" opacity="0.7" transform="rotate(30,65,30)"/>
<ellipse cx="33" cy="46" rx="13" ry="9" fill="#c8e6c9" transform="rotate(-25,33,46)"/>
<ellipse cx="67" cy="46" rx="13" ry="9" fill="#a5d6a7" transform="rotate(25,67,46)"/>
</svg>`,

// ---- v53 Thym ----
v53: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<path d="M50 82 C50 70 46 56 42 44 C38 34 32 26 30 22" stroke="#8d6e63" stroke-width="2" fill="none" stroke-linecap="round"/>
<path d="M50 82 C50 70 54 56 58 44 C62 34 68 26 70 22" stroke="#795548" stroke-width="2" fill="none" stroke-linecap="round"/>
<path d="M50 82 L50 22" stroke="#6d4c41" stroke-width="2" fill="none" stroke-linecap="round"/>
<ellipse cx="30" cy="20" rx="7" ry="4" fill="#90a4ae" transform="rotate(-30,30,20)"/>
<ellipse cx="38" cy="32" rx="6" ry="3.5" fill="#a5d6a7" transform="rotate(-20,38,32)"/>
<ellipse cx="42" cy="44" rx="6" ry="3.5" fill="#80cbc4" transform="rotate(-15,42,44)"/>
<ellipse cx="70" cy="20" rx="7" ry="4" fill="#80cbc4" transform="rotate(30,70,20)"/>
<ellipse cx="62" cy="32" rx="6" ry="3.5" fill="#a5d6a7" transform="rotate(20,62,32)"/>
<ellipse cx="58" cy="44" rx="6" ry="3.5" fill="#90a4ae" transform="rotate(15,58,44)"/>
<ellipse cx="50" cy="28" rx="6" ry="3.5" fill="#a5d6a7"/>
<ellipse cx="50" cy="42" rx="6" ry="3.5" fill="#80cbc4"/>
<ellipse cx="50" cy="56" rx="6" ry="3.5" fill="#a5d6a7"/>
</svg>`,

// ---- v54 Romarin ----
v54: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<path d="M50 85 L50 20" stroke="#6d4c41" stroke-width="3" fill="none" stroke-linecap="round"/>
<path d="M50 40 L34 28" stroke="#795548" stroke-width="1.5" fill="none" stroke-linecap="round"/>
<path d="M50 52 L30 42" stroke="#6d4c41" stroke-width="1.5" fill="none" stroke-linecap="round"/>
<path d="M50 64 L32 56" stroke="#795548" stroke-width="1.5" fill="none" stroke-linecap="round"/>
<path d="M50 40 L66 28" stroke="#5d4037" stroke-width="1.5" fill="none" stroke-linecap="round"/>
<path d="M50 52 L70 42" stroke="#6d4c41" stroke-width="1.5" fill="none" stroke-linecap="round"/>
<path d="M50 64 L68 56" stroke="#795548" stroke-width="1.5" fill="none" stroke-linecap="round"/>
<path d="M34 28 C28 24 22 22 20 24 C22 26 28 28 34 30Z" fill="#80cbc4"/>
<path d="M30 42 C24 38 18 36 16 38 C18 40 24 42 30 44Z" fill="#a5d6a7"/>
<path d="M32 56 C26 52 20 50 18 52 C20 54 26 56 32 58Z" fill="#80cbc4"/>
<path d="M66 28 C72 24 78 22 80 24 C78 26 72 28 66 30Z" fill="#a5d6a7"/>
<path d="M70 42 C76 38 82 36 84 38 C82 40 76 42 70 44Z" fill="#80cbc4"/>
<path d="M68 56 C74 52 80 50 82 52 C80 54 74 56 68 58Z" fill="#a5d6a7"/>
</svg>`,

// ---- v55 Sauge ----
v55: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<path d="M50 82 L50 50" stroke="#8d6e63" stroke-width="2.5" stroke-linecap="round" fill="none"/>
<path d="M50 50 L36 36" stroke="#6d4c41" stroke-width="2" fill="none" stroke-linecap="round"/>
<path d="M50 50 L64 36" stroke="#6d4c41" stroke-width="2" fill="none" stroke-linecap="round"/>
<path d="M50 66 L34 54" stroke="#5d4037" stroke-width="1.5" fill="none" stroke-linecap="round"/>
<path d="M50 66 L66 54" stroke="#5d4037" stroke-width="1.5" fill="none" stroke-linecap="round"/>
<ellipse cx="32" cy="30" rx="16" ry="10" fill="#b0bec5" transform="rotate(-30,32,30)"/>
<ellipse cx="32" cy="30" rx="14" ry="8" fill="#90a4ae" opacity="0.5" transform="rotate(-30,32,30)"/>
<ellipse cx="68" cy="30" rx="16" ry="10" fill="#cfd8dc" transform="rotate(30,68,30)"/>
<ellipse cx="68" cy="30" rx="14" ry="8" fill="#90a4ae" opacity="0.5" transform="rotate(30,68,30)"/>
<ellipse cx="30" cy="48" rx="15" ry="9" fill="#b0bec5" transform="rotate(-25,30,48)"/>
<ellipse cx="70" cy="48" rx="15" ry="9" fill="#cfd8dc" transform="rotate(25,70,48)"/>
</svg>`,

// ---- v56 Origan ----
v56: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<path d="M50 82 L50 48" stroke="#6d4c41" stroke-width="2.5" stroke-linecap="round" fill="none"/>
<path d="M50 56 L38 44" stroke="#5d4037" stroke-width="1.5" fill="none"/>
<path d="M50 56 L62 44" stroke="#5d4037" stroke-width="1.5" fill="none"/>
<path d="M50 68 L36 56" stroke="#6d4c41" stroke-width="1.5" fill="none"/>
<path d="M50 68 L64 56" stroke="#6d4c41" stroke-width="1.5" fill="none"/>
<ellipse cx="34" cy="38" rx="11" ry="8" fill="#66bb6a" transform="rotate(-30,34,38)"/>
<ellipse cx="66" cy="38" rx="11" ry="8" fill="#43a047" transform="rotate(30,66,38)"/>
<ellipse cx="32" cy="50" rx="10" ry="7" fill="#4caf50" transform="rotate(-25,32,50)"/>
<ellipse cx="68" cy="50" rx="10" ry="7" fill="#388e3c" transform="rotate(25,68,50)"/>
<ellipse cx="50" cy="42" rx="10" ry="7" fill="#66bb6a"/>
<ellipse cx="50" cy="32" rx="8" ry="6" fill="#81c784"/>
</svg>`,

// ---- v57 Aneth ----
v57: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<path d="M50 85 L50 40" stroke="#8d6e63" stroke-width="2" fill="none" stroke-linecap="round"/>
<path d="M50 55 L34 42" stroke="#795548" stroke-width="1.5" fill="none"/>
<path d="M50 55 L66 42" stroke="#795548" stroke-width="1.5" fill="none"/>
<path d="M50 68 L32 56" stroke="#8d6e63" stroke-width="1.5" fill="none"/>
<path d="M50 68 L68 56" stroke="#8d6e63" stroke-width="1.5" fill="none"/>
<path d="M34 42 C26 36 18 32 16 34 C18 38 26 40 34 44Z" fill="#c5e1a5"/>
<path d="M66 42 C74 36 82 32 84 34 C82 38 74 40 66 44Z" fill="#aed581"/>
<path d="M32 56 C24 50 16 46 14 48 C16 52 24 54 32 58Z" fill="#c5e1a5"/>
<path d="M68 56 C76 50 84 46 86 48 C84 52 76 54 68 58Z" fill="#aed581"/>
<path d="M50 40 C44 32 36 28 34 30 C36 36 44 40 50 42Z" fill="#dcedc8"/>
<path d="M50 40 C56 32 64 28 66 30 C64 36 56 40 50 42Z" fill="#c5e1a5"/>
<circle cx="50" cy="22" r="12" fill="#fdd835" opacity="0.9"/>
<circle cx="38" cy="26" r="8" fill="#ffee58" opacity="0.8"/>
<circle cx="62" cy="26" r="8" fill="#fdd835" opacity="0.8"/>
</svg>`,

// ---- v58 Coriandre ----
v58: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<path d="M50 82 L50 50" stroke="#6d4c41" stroke-width="2" stroke-linecap="round" fill="none"/>
<path d="M50 50 L38 38" stroke="#5d4037" stroke-width="1.5" fill="none" stroke-linecap="round"/>
<path d="M50 50 L62 38" stroke="#5d4037" stroke-width="1.5" fill="none" stroke-linecap="round"/>
<path d="M50 65 L36 54" stroke="#6d4c41" stroke-width="1.5" fill="none" stroke-linecap="round"/>
<path d="M50 65 L64 54" stroke="#6d4c41" stroke-width="1.5" fill="none" stroke-linecap="round"/>
<path d="M36 36 C28 30 20 28 18 30 C20 36 28 38 36 40Z" fill="#a5d6a7"/>
<path d="M30 34 C26 26 26 18 28 18 C32 18 32 28 30 36Z" fill="#81c784"/>
<path d="M64 36 C72 30 80 28 82 30 C80 36 72 38 64 40Z" fill="#c8e6c9"/>
<path d="M70 34 C74 26 74 18 72 18 C68 18 68 28 70 36Z" fill="#a5d6a7"/>
<path d="M50 48 C42 40 36 36 34 38 C36 44 44 48 50 50Z" fill="#b2dfdb"/>
<path d="M50 48 C58 40 64 36 66 38 C64 44 56 48 50 50Z" fill="#a5d6a7"/>
</svg>`,

// ---- v59 Estragon ----
v59: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<path d="M50 85 C46 72 42 56 40 40 C38 28 38 18 40 14" stroke="#8d6e63" stroke-width="2" fill="none" stroke-linecap="round"/>
<path d="M50 85 C54 72 58 56 60 40 C62 28 62 18 60 14" stroke="#6d4c41" stroke-width="2" fill="none" stroke-linecap="round"/>
<path d="M50 85 L50 14" stroke="#795548" stroke-width="2" fill="none" stroke-linecap="round"/>
<path d="M42 30 C36 26 30 24 28 26" stroke="#66bb6a" stroke-width="3" fill="none" stroke-linecap="round"/>
<path d="M44 44 C38 40 32 38 30 40" stroke="#4caf50" stroke-width="3" fill="none" stroke-linecap="round"/>
<path d="M44 58 C38 54 32 52 30 54" stroke="#388e3c" stroke-width="3" fill="none" stroke-linecap="round"/>
<path d="M58 30 C64 26 70 24 72 26" stroke="#66bb6a" stroke-width="3" fill="none" stroke-linecap="round"/>
<path d="M56 44 C62 40 68 38 70 40" stroke="#4caf50" stroke-width="3" fill="none" stroke-linecap="round"/>
<path d="M56 58 C62 54 68 52 70 54" stroke="#388e3c" stroke-width="3" fill="none" stroke-linecap="round"/>
</svg>`,

// ---- v60 Fenouil ----
v60: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<defs>
  <radialGradient id="t60g" cx="38%" cy="30%" r="65%">
    <stop offset="0%" stop-color="#e8f5e9"/>
    <stop offset="50%" stop-color="#a5d6a7"/>
    <stop offset="100%" stop-color="#388e3c"/>
  </radialGradient>
</defs>
<path d="M50 55 C42 46 28 38 22 40 C20 48 30 56 50 58" fill="url(#t60g)"/>
<path d="M50 55 C58 46 72 38 78 40 C80 48 70 56 50 58" fill="#43a047"/>
<path d="M50 42 C44 32 34 22 30 22 C28 28 36 38 50 44" fill="#66bb6a" opacity="0.7"/>
<path d="M50 42 C56 32 66 22 70 22 C72 28 64 38 50 44" fill="#4caf50" opacity="0.7"/>
<path d="M42 28 C40 20 38 14 36 12 C36 16 38 22 42 30" fill="#a5d6a7"/>
<path d="M58 28 C60 20 62 14 64 12 C64 16 62 22 58 30" fill="#81c784"/>
<ellipse cx="50" cy="68" rx="22" ry="16" fill="#c8e6c9" opacity="0.6"/>
<ellipse cx="50" cy="72" rx="16" ry="12" fill="#e8f5e9"/>
<path d="M36 68 C38 62 42 58 50 58 C58 58 62 62 64 68" fill="none" stroke="#a5d6a7" stroke-width="1.5"/>
</svg>`,

// ---- v61 Céleri branche ----
v61: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<defs>
  <linearGradient id="t61g" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#c8e6c9"/>
    <stop offset="100%" stop-color="#e8f5e9"/>
  </linearGradient>
</defs>
<path d="M30 88 C28 72 26 54 28 36 C28 28 30 22 32 18" stroke="#a5d6a7" stroke-width="7" fill="none" stroke-linecap="round"/>
<path d="M42 88 C40 72 38 54 40 36 C40 28 42 22 44 18" stroke="#c8e6c9" stroke-width="6" fill="none" stroke-linecap="round"/>
<path d="M54 88 C52 72 50 54 52 36 C52 28 54 22 56 18" stroke="#a5d6a7" stroke-width="6" fill="none" stroke-linecap="round"/>
<path d="M66 88 C64 72 62 54 64 36 C64 28 66 22 68 18" stroke="#81c784" stroke-width="6" fill="none" stroke-linecap="round"/>
<path d="M32 18 C26 10 22 6 20 8" stroke="#388e3c" stroke-width="2.5" fill="none" stroke-linecap="round"/>
<path d="M44 18 C42 10 40 6 40 4" stroke="#2e7d32" stroke-width="2.5" fill="none" stroke-linecap="round"/>
<path d="M56 18 C58 10 60 6 60 4" stroke="#388e3c" stroke-width="2.5" fill="none" stroke-linecap="round"/>
<path d="M68 18 C74 10 78 6 80 8" stroke="#2e7d32" stroke-width="2.5" fill="none" stroke-linecap="round"/>
</svg>`,

// ---- v62 Artichaut ----
v62: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<defs>
  <radialGradient id="t62g" cx="40%" cy="30%" r="65%">
    <stop offset="0%" stop-color="#aed581"/>
    <stop offset="55%" stop-color="#558b2f"/>
    <stop offset="100%" stop-color="#33691e"/>
  </radialGradient>
</defs>
<rect x="46" y="72" width="8" height="16" rx="4" fill="#4e342e"/>
<ellipse cx="50" cy="60" rx="28" ry="32" fill="url(#t62g)"/>
<path d="M34 56 C32 48 34 40 38 36 C40 44 38 52 34 56Z" fill="#33691e"/>
<path d="M66 56 C68 48 66 40 62 36 C60 44 62 52 66 56Z" fill="#2e7d32"/>
<path d="M42 42 C40 34 42 26 46 22 C48 30 46 38 42 42Z" fill="#558b2f"/>
<path d="M58 42 C60 34 58 26 54 22 C52 30 54 38 58 42Z" fill="#33691e"/>
<path d="M50 36 C48 26 50 18 50 16 C52 18 52 26 50 36Z" fill="#7cb342"/>
<ellipse cx="42" cy="34" rx="5" ry="3" fill="#8bc34a" opacity="0.4"/>
</svg>`,

// ---- v63 Asperge ----
v63: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<defs>
  <linearGradient id="t63g" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#66bb6a"/>
    <stop offset="60%" stop-color="#a5d6a7"/>
    <stop offset="100%" stop-color="#e8f5e9"/>
  </linearGradient>
</defs>
<path d="M36 88 C34 70 34 50 36 30 C36 24 38 16 40 12 C42 10 44 10 44 12 C44 16 44 22 44 28 C44 22 46 16 48 14 C50 12 52 14 52 18 C52 22 50 28 50 36 C52 28 54 20 56 18 C58 16 60 18 60 22 C60 28 58 36 58 44" stroke="#c8e6c9" stroke-width="1.5" fill="none" opacity="0.5"/>
<rect x="33" y="28" width="8" height="60" rx="4" fill="url(#t63g)"/>
<rect x="45" y="22" width="7" height="66" rx="3.5" fill="#81c784"/>
<rect x="56" y="26" width="7" height="62" rx="3.5" fill="#a5d6a7"/>
<path d="M37 28 C34 22 36 16 38 14 C40 16 40 22 37 28Z" fill="#2e7d32"/>
<path d="M48.5 22 C46 16 47 10 49 8 C51 10 51 16 48.5 22Z" fill="#388e3c"/>
<path d="M59.5 26 C57 20 58 14 60 12 C62 14 62 20 59.5 26Z" fill="#2e7d32"/>
</svg>`,

// ---- v64 Framboise ----
v64: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<defs>
  <radialGradient id="t64g" cx="38%" cy="30%" r="65%">
    <stop offset="0%" stop-color="#f48fb1"/>
    <stop offset="50%" stop-color="#e91e63"/>
    <stop offset="100%" stop-color="#880e4f"/>
  </radialGradient>
</defs>
<path d="M50 25 C46 20 44 18 42 20 C44 22 46 24 50 28" fill="#43a047"/>
<path d="M50 25 C54 20 56 18 58 20 C56 22 54 24 50 28" fill="#388e3c"/>
<path d="M50 25 C50 18 50 14 50 14" stroke="#2e7d32" stroke-width="2" fill="none" stroke-linecap="round"/>
<circle cx="38" cy="52" r="9" fill="url(#t64g)"/>
<circle cx="50" cy="46" r="9" fill="#e91e63"/>
<circle cx="62" cy="52" r="9" fill="#c2185b"/>
<circle cx="34" cy="64" r="9" fill="#ad1457"/>
<circle cx="50" cy="62" r="10" fill="url(#t64g)"/>
<circle cx="66" cy="64" r="9" fill="#e91e63"/>
<circle cx="42" cy="74" r="8" fill="#c2185b"/>
<circle cx="58" cy="74" r="8" fill="#ad1457"/>
<circle cx="38" cy="52" r="4" fill="#f8bbd0" opacity="0.4"/>
<circle cx="50" cy="46" r="4" fill="#f8bbd0" opacity="0.4"/>
<circle cx="50" cy="62" r="4" fill="#f8bbd0" opacity="0.4"/>
</svg>`,

// ---- v65 Groseille ----
v65: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<defs>
  <radialGradient id="t65g" cx="35%" cy="30%" r="60%">
    <stop offset="0%" stop-color="#ff8a80"/>
    <stop offset="50%" stop-color="#e53935"/>
    <stop offset="100%" stop-color="#880e0e"/>
  </radialGradient>
</defs>
<path d="M30 22 C26 18 22 16 20 18 C22 22 28 24 32 28" fill="#43a047"/>
<path d="M50 20 C50 14 50 12 50 12" stroke="#388e3c" stroke-width="2" fill="none" stroke-linecap="round"/>
<path d="M70 22 C74 18 78 16 80 18 C78 22 72 24 68 28" fill="#2e7d32"/>
<line x1="30" y1="22" x2="50" y2="35" stroke="#5d4037" stroke-width="1.5"/>
<line x1="50" y1="20" x2="50" y2="35" stroke="#6d4c41" stroke-width="1.5"/>
<line x1="70" y1="22" x2="50" y2="35" stroke="#5d4037" stroke-width="1.5"/>
<circle cx="24" cy="50" r="9" fill="url(#t65g)"/>
<circle cx="38" cy="44" r="9" fill="#e53935"/>
<circle cx="50" cy="52" r="10" fill="url(#t65g)"/>
<circle cx="62" cy="44" r="9" fill="#c62828"/>
<circle cx="76" cy="50" r="9" fill="#e53935"/>
<circle cx="30" cy="64" r="9" fill="#c62828"/>
<circle cx="50" cy="68" r="9" fill="url(#t65g)"/>
<circle cx="70" cy="64" r="9" fill="#e53935"/>
<circle cx="24" cy="50" r="4" fill="#ff8a80" opacity="0.4"/>
<circle cx="50" cy="52" r="4" fill="#ff8a80" opacity="0.4"/>
</svg>`

};

/**
 * Retourne le SVG data-URI pour un légume donné.
 * @param {string} id — identifiant légume (ex: 'v1')
 * @returns {string} data URI SVG ou chaîne vide
 */
function getVeggieVisual(id) {
  var svg = GV_VEGGIE_VISUALS[id];
  if (!svg) return '';
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

/**
 * Retourne un <img> SVG si le visuel existe, sinon l'emoji v.icon.
 * @param {object} v      — objet légume (avec v.icon)
 * @param {string} veggieId — clé légume ex: 'v1'
 * @param {number} size   — taille px
 * @returns {string} HTML
 */
function vIcon(v, veggieId, size) {
  if (!v) return '';
  var uri = getVeggieVisual(veggieId);
  if (uri) {
    return '<img src="' + uri + '" width="' + size + '" height="' + size + '" style="object-fit:contain;vertical-align:middle;flex-shrink:0;" alt="">';
  }
  return v.icon;
}
