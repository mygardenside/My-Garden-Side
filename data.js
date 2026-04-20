// Green Vibes — data.js
// Référentiel légumes + calendrier de plantation
// Chargé en premier — pas de dépendances
// ========== DEFAULT VEGETABLES (65 légumes, aromatiques, fruits potagers) ==========
// Champs : name, icon, family, yieldPerM2, daysToHarvest, spacePerPlant,
//          sensitivity{hot,rain,cold,wind}, water(1-10), sun(1-10), difficulty(1-3)
const DEFAULT_VEGETABLES = {
  // --- Solanacées ---
  v1:  { name:'Tomate',          icon:'🍅', family:'Solanacees',      yieldPerM2:4,  daysToHarvest:90,  spacePerPlant:0.5,  sensitivity:{hot:2,rain:7,cold:8,wind:5}, water:7, sun:9, difficulty:2 },
  v6:  { name:'Poivron',         icon:'🫑', family:'Solanacees',      yieldPerM2:3,  daysToHarvest:80,  spacePerPlant:0.25, sensitivity:{hot:2,rain:6,cold:9,wind:5}, water:6, sun:9, difficulty:2 },
  v7:  { name:'Aubergine',       icon:'🍆', family:'Solanacees',      yieldPerM2:3,  daysToHarvest:85,  spacePerPlant:0.5,  sensitivity:{hot:2,rain:6,cold:9,wind:4}, water:6, sun:9, difficulty:2 },
  v15: { name:'Piment',          icon:'🌶️', family:'Solanacees',      yieldPerM2:2,  daysToHarvest:90,  spacePerPlant:0.25, sensitivity:{hot:1,rain:5,cold:9,wind:5}, water:5, sun:9, difficulty:2 },
  v50: { name:'Pomme de terre',  icon:'🥔', family:'Solanacees',      yieldPerM2:4,  daysToHarvest:90,  spacePerPlant:0.25, sensitivity:{hot:5,rain:5,cold:6,wind:3}, water:6, sun:7, difficulty:1 },
  // --- Cucurbitacées ---
  v3:  { name:'Courgette',       icon:'🥒', family:'Cucurbitacees',   yieldPerM2:5,  daysToHarvest:60,  spacePerPlant:1.0,  sensitivity:{hot:3,rain:5,cold:7,wind:4}, water:7, sun:8, difficulty:1 },
  v11: { name:'Concombre',       icon:'🥒', family:'Cucurbitacees',   yieldPerM2:4,  daysToHarvest:55,  spacePerPlant:0.5,  sensitivity:{hot:3,rain:5,cold:8,wind:5}, water:7, sun:8, difficulty:1 },
  v40: { name:'Melon',           icon:'🍈', family:'Cucurbitacees',   yieldPerM2:4,  daysToHarvest:90,  spacePerPlant:1.0,  sensitivity:{hot:2,rain:6,cold:9,wind:5}, water:6, sun:10,difficulty:2 },
  v41: { name:'Potiron',         icon:'🎃', family:'Cucurbitacees',   yieldPerM2:6,  daysToHarvest:120, spacePerPlant:2.0,  sensitivity:{hot:3,rain:5,cold:8,wind:4}, water:6, sun:8, difficulty:1 },
  v42: { name:'Potimarron',      icon:'🟤', family:'Cucurbitacees',   yieldPerM2:5,  daysToHarvest:120, spacePerPlant:2.0,  sensitivity:{hot:3,rain:5,cold:8,wind:4}, water:6, sun:8, difficulty:1 },
  v43: { name:'Pasteque',        icon:'🍉', family:'Cucurbitacees',   yieldPerM2:5,  daysToHarvest:100, spacePerPlant:2.0,  sensitivity:{hot:2,rain:7,cold:9,wind:5}, water:6, sun:10,difficulty:3 },
  v44: { name:'Courge butternut',icon:'🟠', family:'Cucurbitacees',   yieldPerM2:5,  daysToHarvest:110, spacePerPlant:2.0,  sensitivity:{hot:3,rain:5,cold:8,wind:4}, water:6, sun:8, difficulty:1 },
  // --- Astéracées ---
  v2:  { name:'Salade',          icon:'🥬', family:'Asteracees',      yieldPerM2:8,  daysToHarvest:45,  spacePerPlant:0.06, sensitivity:{hot:9,rain:3,cold:5,wind:3}, water:5, sun:5, difficulty:1 },
  v30: { name:'Chicor\u00e9e',        icon:'🥬', family:'Asteracees',      yieldPerM2:4,  daysToHarvest:70,  spacePerPlant:0.06, sensitivity:{hot:7,rain:3,cold:4,wind:2}, water:4, sun:6, difficulty:2 },
  v31: { name:'Endive',          icon:'🥬', family:'Asteracees',      yieldPerM2:3,  daysToHarvest:120, spacePerPlant:0.06, sensitivity:{hot:7,rain:3,cold:3,wind:2}, water:4, sun:5, difficulty:3 },
  v35: { name:'Topinambour',     icon:'🌻', family:'Asteracees',      yieldPerM2:8,  daysToHarvest:180, spacePerPlant:0.25, sensitivity:{hot:4,rain:3,cold:2,wind:3}, water:4, sun:7, difficulty:1 },
  v59: { name:'Estragon',        icon:'🌿', family:'Asteracees',      yieldPerM2:1,  daysToHarvest:90,  spacePerPlant:0.06, sensitivity:{hot:4,rain:4,cold:5,wind:3}, water:3, sun:7, difficulty:2 },
  v62: { name:'Artichaut',       icon:'🌿', family:'Asteracees',      yieldPerM2:4,  daysToHarvest:365, spacePerPlant:0.5,  sensitivity:{hot:4,rain:4,cold:5,wind:5}, water:6, sun:8, difficulty:2 },
  // --- Brassicacées ---
  v8:  { name:'Radis',           icon:'🔴', family:'Brassicacees',    yieldPerM2:10, daysToHarvest:25,  spacePerPlant:0.01, sensitivity:{hot:7,rain:3,cold:3,wind:2}, water:5, sun:6, difficulty:1 },
  v16: { name:'Chou',            icon:'🥦', family:'Brassicacees',    yieldPerM2:4,  daysToHarvest:80,  spacePerPlant:0.25, sensitivity:{hot:6,rain:3,cold:3,wind:4}, water:6, sun:7, difficulty:2 },
  v20: { name:'Navet',           icon:'🤍', family:'Brassicacees',    yieldPerM2:5,  daysToHarvest:50,  spacePerPlant:0.04, sensitivity:{hot:6,rain:3,cold:2,wind:2}, water:5, sun:6, difficulty:1 },
  v26: { name:'Roquette',        icon:'🌿', family:'Brassicacees',    yieldPerM2:4,  daysToHarvest:30,  spacePerPlant:0.02, sensitivity:{hot:8,rain:3,cold:3,wind:2}, water:4, sun:5, difficulty:1 },
  v27: { name:'Cresson',         icon:'🌿', family:'Brassicacees',    yieldPerM2:3,  daysToHarvest:30,  spacePerPlant:0.02, sensitivity:{hot:8,rain:2,cold:3,wind:2}, water:8, sun:4, difficulty:2 },
  v28: { name:'Kale',            icon:'🥬', family:'Brassicacees',    yieldPerM2:4,  daysToHarvest:90,  spacePerPlant:0.25, sensitivity:{hot:6,rain:3,cold:2,wind:3}, water:6, sun:7, difficulty:1 },
  v29: { name:'Pak choi',        icon:'🥬', family:'Brassicacees',    yieldPerM2:5,  daysToHarvest:45,  spacePerPlant:0.1,  sensitivity:{hot:7,rain:3,cold:3,wind:2}, water:6, sun:6, difficulty:1 },
  v34: { name:'Radis noir',      icon:'⚫', family:'Brassicacees',    yieldPerM2:5,  daysToHarvest:60,  spacePerPlant:0.04, sensitivity:{hot:5,rain:3,cold:3,wind:2}, water:5, sun:6, difficulty:1 },
  v36: { name:'Chou-fleur',      icon:'🥦', family:'Brassicacees',    yieldPerM2:3,  daysToHarvest:90,  spacePerPlant:0.25, sensitivity:{hot:6,rain:3,cold:4,wind:4}, water:7, sun:7, difficulty:3 },
  v37: { name:'Brocoli',         icon:'🥦', family:'Brassicacees',    yieldPerM2:3,  daysToHarvest:90,  spacePerPlant:0.25, sensitivity:{hot:6,rain:3,cold:3,wind:3}, water:6, sun:7, difficulty:2 },
  v38: { name:'Chou rouge',      icon:'🔴', family:'Brassicacees',    yieldPerM2:4,  daysToHarvest:90,  spacePerPlant:0.25, sensitivity:{hot:6,rain:3,cold:3,wind:4}, water:6, sun:7, difficulty:2 },
  v39: { name:'Chou de Bruxelles',icon:'🟢',family:'Brassicacees',    yieldPerM2:3,  daysToHarvest:150, spacePerPlant:0.25, sensitivity:{hot:7,rain:3,cold:2,wind:4}, water:6, sun:7, difficulty:3 },
  // --- Apiacées ---
  v4:  { name:'Carotte',         icon:'🥕', family:'Apiacees',        yieldPerM2:6,  daysToHarvest:75,  spacePerPlant:0.02, sensitivity:{hot:4,rain:4,cold:3,wind:2}, water:5, sun:7, difficulty:1 },
  v14: { name:'Persil',          icon:'🌿', family:'Apiacees',        yieldPerM2:3,  daysToHarvest:35,  spacePerPlant:0.03, sensitivity:{hot:5,rain:3,cold:3,wind:3}, water:5, sun:6, difficulty:1 },
  v32: { name:'Celeri-rave',     icon:'⚪', family:'Apiacees',        yieldPerM2:4,  daysToHarvest:150, spacePerPlant:0.09, sensitivity:{hot:5,rain:3,cold:5,wind:3}, water:8, sun:6, difficulty:3 },
  v33: { name:'Panais',          icon:'🤍', family:'Apiacees',        yieldPerM2:4,  daysToHarvest:120, spacePerPlant:0.04, sensitivity:{hot:5,rain:4,cold:2,wind:2}, water:5, sun:7, difficulty:2 },
  v57: { name:'Aneth',           icon:'🌿', family:'Apiacees',        yieldPerM2:2,  daysToHarvest:50,  spacePerPlant:0.04, sensitivity:{hot:5,rain:4,cold:6,wind:4}, water:4, sun:8, difficulty:1 },
  v58: { name:'Coriandre',       icon:'🌿', family:'Apiacees',        yieldPerM2:1,  daysToHarvest:40,  spacePerPlant:0.03, sensitivity:{hot:6,rain:3,cold:7,wind:4}, water:4, sun:7, difficulty:1 },
  v60: { name:'Fenouil',         icon:'🌿', family:'Apiacees',        yieldPerM2:4,  daysToHarvest:90,  spacePerPlant:0.09, sensitivity:{hot:4,rain:4,cold:5,wind:3}, water:5, sun:8, difficulty:2 },
  v61: { name:'Celeri branche',  icon:'🌿', family:'Apiacees',        yieldPerM2:3,  daysToHarvest:120, spacePerPlant:0.09, sensitivity:{hot:5,rain:3,cold:5,wind:3}, water:8, sun:6, difficulty:3 },
  // --- Liliacées ---
  v9:  { name:'Oignon',          icon:'🧅', family:'Liliacees',       yieldPerM2:6,  daysToHarvest:100, spacePerPlant:0.02, sensitivity:{hot:3,rain:5,cold:4,wind:2}, water:5, sun:7, difficulty:1 },
  v17: { name:'Poireau',         icon:'🧅', family:'Liliacees',       yieldPerM2:5,  daysToHarvest:120, spacePerPlant:0.04, sensitivity:{hot:4,rain:3,cold:2,wind:3}, water:6, sun:7, difficulty:2 },
  v21: { name:'Ail',             icon:'🧄', family:'Liliacees',       yieldPerM2:1,  daysToHarvest:240, spacePerPlant:0.04, sensitivity:{hot:3,rain:7,cold:2,wind:2}, water:3, sun:7, difficulty:1 },
  v22: { name:'Echalote',        icon:'🧅', family:'Liliacees',       yieldPerM2:2,  daysToHarvest:120, spacePerPlant:0.04, sensitivity:{hot:3,rain:6,cold:3,wind:2}, water:4, sun:7, difficulty:1 },
  v23: { name:'Ciboulette',      icon:'🌿', family:'Liliacees',       yieldPerM2:2,  daysToHarvest:60,  spacePerPlant:0.03, sensitivity:{hot:5,rain:3,cold:3,wind:2}, water:5, sun:6, difficulty:1 },
  // --- Fabacées ---
  v5:  { name:'Haricot',         icon:'🫘', family:'Fabacees',        yieldPerM2:3,  daysToHarvest:65,  spacePerPlant:0.05, sensitivity:{hot:4,rain:5,cold:7,wind:6}, water:5, sun:8, difficulty:1 },
  v18: { name:'Petit pois',      icon:'🟢', family:'Fabacees',        yieldPerM2:2,  daysToHarvest:70,  spacePerPlant:0.05, sensitivity:{hot:7,rain:4,cold:4,wind:5}, water:5, sun:7, difficulty:1 },
  v45: { name:'Feve',            icon:'🫘', family:'Fabacees',        yieldPerM2:2,  daysToHarvest:150, spacePerPlant:0.05, sensitivity:{hot:8,rain:4,cold:2,wind:5}, water:5, sun:7, difficulty:1 },
  v47: { name:'Haricot vert',    icon:'🫘', family:'Fabacees',        yieldPerM2:3,  daysToHarvest:60,  spacePerPlant:0.05, sensitivity:{hot:4,rain:5,cold:7,wind:5}, water:5, sun:8, difficulty:1 },
  v48: { name:'Pois mange-tout', icon:'🟢', family:'Fabacees',        yieldPerM2:2,  daysToHarvest:70,  spacePerPlant:0.05, sensitivity:{hot:7,rain:4,cold:4,wind:5}, water:5, sun:7, difficulty:1 },
  // --- Chénopodiacées ---
  v12: { name:'Epinard',         icon:'🥬', family:'Chenopodiacees',  yieldPerM2:5,  daysToHarvest:40,  spacePerPlant:0.03, sensitivity:{hot:9,rain:3,cold:2,wind:2}, water:6, sun:5, difficulty:1 },
  v19: { name:'Betterave',       icon:'🟣', family:'Chenopodiacees',  yieldPerM2:5,  daysToHarvest:60,  spacePerPlant:0.04, sensitivity:{hot:5,rain:4,cold:3,wind:2}, water:5, sun:7, difficulty:1 },
  v24: { name:'Blette',          icon:'🥬', family:'Chenopodiacees',  yieldPerM2:6,  daysToHarvest:60,  spacePerPlant:0.06, sensitivity:{hot:5,rain:3,cold:3,wind:2}, water:6, sun:6, difficulty:1 },
  v25: { name:'Mache',           icon:'🥬', family:'Valerianacees',   yieldPerM2:3,  daysToHarvest:70,  spacePerPlant:0.01, sensitivity:{hot:8,rain:2,cold:2,wind:2}, water:4, sun:4, difficulty:1 },
  // --- Lamiacées ---
  v13: { name:'Basilic',         icon:'🌿', family:'Lamiacees',       yieldPerM2:2,  daysToHarvest:30,  spacePerPlant:0.04, sensitivity:{hot:3,rain:4,cold:9,wind:4}, water:6, sun:8, difficulty:1 },
  v52: { name:'Menthe',          icon:'🌿', family:'Lamiacees',       yieldPerM2:2,  daysToHarvest:60,  spacePerPlant:0.04, sensitivity:{hot:5,rain:3,cold:4,wind:3}, water:6, sun:5, difficulty:1 },
  v53: { name:'Thym',            icon:'🌿', family:'Lamiacees',       yieldPerM2:1,  daysToHarvest:90,  spacePerPlant:0.04, sensitivity:{hot:2,rain:7,cold:4,wind:3}, water:2, sun:9, difficulty:1 },
  v54: { name:'Romarin',         icon:'🌿', family:'Lamiacees',       yieldPerM2:1,  daysToHarvest:90,  spacePerPlant:0.1,  sensitivity:{hot:2,rain:7,cold:5,wind:3}, water:2, sun:9, difficulty:1 },
  v55: { name:'Sauge',           icon:'🌿', family:'Lamiacees',       yieldPerM2:1,  daysToHarvest:90,  spacePerPlant:0.06, sensitivity:{hot:2,rain:7,cold:4,wind:3}, water:2, sun:9, difficulty:1 },
  v56: { name:'Origan',          icon:'🌿', family:'Lamiacees',       yieldPerM2:1,  daysToHarvest:90,  spacePerPlant:0.04, sensitivity:{hot:2,rain:7,cold:5,wind:3}, water:2, sun:9, difficulty:1 },
  // --- Rosacées ---
  v10: { name:'Fraise',          icon:'🍓', family:'Rosacees',        yieldPerM2:2,  daysToHarvest:60,  spacePerPlant:0.1,  sensitivity:{hot:5,rain:6,cold:5,wind:3}, water:6, sun:7, difficulty:1 },
  v64: { name:'Framboise',       icon:'🫐', family:'Rosacees',        yieldPerM2:3,  daysToHarvest:365, spacePerPlant:0.5,  sensitivity:{hot:4,rain:4,cold:3,wind:4}, water:5, sun:7, difficulty:2 },
  // --- Poacées ---
  v49: { name:'Mais doux',       icon:'🌽', family:'Poacees',         yieldPerM2:2,  daysToHarvest:90,  spacePerPlant:0.5,  sensitivity:{hot:3,rain:5,cold:8,wind:7}, water:6, sun:9, difficulty:2 },
  // --- Convolvulacées ---
  v51: { name:'Patate douce',    icon:'🍠', family:'Convolvulacees',  yieldPerM2:3,  daysToHarvest:120, spacePerPlant:0.5,  sensitivity:{hot:2,rain:6,cold:9,wind:4}, water:5, sun:9, difficulty:2 },
  // --- Asparagacées ---
  v63: { name:'Asperge',         icon:'🌱', family:'Asparagacees',    yieldPerM2:2,  daysToHarvest:730, spacePerPlant:0.25, sensitivity:{hot:4,rain:4,cold:3,wind:4}, water:5, sun:7, difficulty:3 },
  // --- Grossulariacées ---
  v65: { name:'Groseille',       icon:'🫐', family:'Grossulariacees', yieldPerM2:2,  daysToHarvest:365, spacePerPlant:0.5,  sensitivity:{hot:5,rain:3,cold:3,wind:3}, water:5, sun:6, difficulty:2 }
};
// ========== PLANTING CALENDAR (Southern France / Toulouse zone) ==========
const PLANTING_CALENDAR_BY_NAME = {
  'Tomate':        { plantMonths:[3,4,5],       harvestMonths:[7,8,9,10] },
  'Salade':        { plantMonths:[2,3,4,5,8,9], harvestMonths:[4,5,6,7,10,11] },
  'Courgette':     { plantMonths:[4,5,6],       harvestMonths:[7,8,9] },
  'Carotte':       { plantMonths:[2,3,4,5,6,7], harvestMonths:[5,6,7,8,9,10,11] },
  'Haricot':       { plantMonths:[4,5,6,7],     harvestMonths:[7,8,9,10] },
  'Poivron':       { plantMonths:[3,4,5],       harvestMonths:[7,8,9,10] },
  'Aubergine':     { plantMonths:[3,4,5],       harvestMonths:[7,8,9,10] },
  'Radis':         { plantMonths:[2,3,4,5,8,9], harvestMonths:[3,4,5,6,9,10] },
  'Oignon':        { plantMonths:[2,3,4,9,10],  harvestMonths:[6,7,8,9] },
  'Fraise':        { plantMonths:[3,4,9,10],    harvestMonths:[5,6,7] },
  'Concombre':     { plantMonths:[4,5,6],       harvestMonths:[7,8,9] },
  'Epinard':       { plantMonths:[2,3,4,9,10],  harvestMonths:[4,5,6,11,12] },
  'Basilic':       { plantMonths:[4,5,6],       harvestMonths:[6,7,8,9] },
  'Persil':        { plantMonths:[3,4,5,8,9],   harvestMonths:[5,6,7,8,10,11] },
  'Piment':        { plantMonths:[3,4,5],       harvestMonths:[7,8,9,10] },
  'Chou':          { plantMonths:[3,4,5,7,8],   harvestMonths:[6,7,8,10,11,12] },
  'Poireau':       { plantMonths:[2,3,4,5],     harvestMonths:[9,10,11,12,1,2] },
  'Petit pois':    { plantMonths:[2,3,4,10,11], harvestMonths:[4,5,6,7] },
  'Betterave':     { plantMonths:[3,4,5,6,7],   harvestMonths:[6,7,8,9,10] },
  'Navet':         { plantMonths:[2,3,4,7,8,9], harvestMonths:[4,5,6,10,11] },
  'Ail':           { plantMonths:[10,11,12,1,2],harvestMonths:[6,7] },
  'Échalote':      { plantMonths:[10,11,12,1,2,3], harvestMonths:[6,7] },
  'Echalote':      { plantMonths:[10,11,12,1,2,3], harvestMonths:[6,7] },
  'Ciboulette':    { plantMonths:[3,4,5,9,10],  harvestMonths:[4,5,6,7,8,9,10,11] },
  'Celeri':        { plantMonths:[3,4,5],       harvestMonths:[8,9,10,11] },
  'Céleri':        { plantMonths:[3,4,5],       harvestMonths:[8,9,10,11] },
  'Fenouil':       { plantMonths:[3,4,5,7,8],   harvestMonths:[6,7,8,9,10] },
  'Panais':        { plantMonths:[3,4,5],       harvestMonths:[9,10,11,12] },
  'Chou-fleur':    { plantMonths:[2,3,4,7,8],   harvestMonths:[5,6,7,10,11] },
  'Brocoli':       { plantMonths:[3,4,5,7,8],   harvestMonths:[6,7,8,10,11] },
  'Chou rouge':    { plantMonths:[3,4,5],       harvestMonths:[8,9,10,11] },
  'Roquette':      { plantMonths:[2,3,4,5,8,9,10], harvestMonths:[3,4,5,6,9,10,11] },
  'Radis noir':    { plantMonths:[7,8,9],       harvestMonths:[9,10,11,12] },
  'Feve':          { plantMonths:[10,11,12,2],  harvestMonths:[4,5,6] },
  'Fève':          { plantMonths:[10,11,12,2],  harvestMonths:[4,5,6] },
  'Haricot vert':  { plantMonths:[4,5,6,7],     harvestMonths:[7,8,9,10] },
  'Melon':         { plantMonths:[3,4,5],       harvestMonths:[7,8,9] },
  'Potiron':       { plantMonths:[4,5,6],       harvestMonths:[9,10,11] },
  'Potimarron':    { plantMonths:[4,5,6],       harvestMonths:[9,10,11] },
  'Pasteque':      { plantMonths:[4,5],         harvestMonths:[7,8,9] },
  'Pastèque':      { plantMonths:[4,5],         harvestMonths:[7,8,9] },
  'Menthe':        { plantMonths:[3,4,5,9,10],  harvestMonths:[4,5,6,7,8,9,10] },
  'Thym':          { plantMonths:[3,4,5,9,10],  harvestMonths:[5,6,7,8,9,10] },
  'Romarin':       { plantMonths:[3,4,5,9,10],  harvestMonths:[5,6,7,8,9,10,11] },
  'Sauge':         { plantMonths:[3,4,5,9,10],  harvestMonths:[5,6,7,8,9,10] },
  'Pomme de terre':{ plantMonths:[2,3,4],       harvestMonths:[6,7,8,9] },
  'Patate douce':  { plantMonths:[5,6],         harvestMonths:[9,10,11] },
  'Mais doux':     { plantMonths:[4,5,6],       harvestMonths:[8,9,10] },
  'Maïs doux':     { plantMonths:[4,5,6],       harvestMonths:[8,9,10] },
  'Blette':        { plantMonths:[3,4,5,6,7,8], harvestMonths:[5,6,7,8,9,10,11] },
  'Mache':         { plantMonths:[8,9,10],      harvestMonths:[10,11,12,1,2] },
  'Mâche':         { plantMonths:[8,9,10],      harvestMonths:[10,11,12,1,2] },
  'Artichaut':     { plantMonths:[3,4,9,10],    harvestMonths:[5,6,7,8] },
  // --- Nouvelles entrées ---
  'Cresson':       { plantMonths:[2,3,4,5,9,10], harvestMonths:[3,4,5,6,10,11] },
  'Kale':          { plantMonths:[3,4,5,7,8],    harvestMonths:[9,10,11,12,1,2] },
  'Pak choi':      { plantMonths:[3,4,5,7,8,9],  harvestMonths:[5,6,7,9,10,11] },
  'Chicor\u00e9e':     { plantMonths:[4,5,6,7],       harvestMonths:[8,9,10,11,12] },
  'Endive':        { plantMonths:[5,6],           harvestMonths:[11,12,1,2] },
  'Celeri-rave':   { plantMonths:[3,4,5],         harvestMonths:[9,10,11,12] },
  'Topinambour':   { plantMonths:[2,3,10,11],     harvestMonths:[10,11,12,1,2] },
  'Chou de Bruxelles': { plantMonths:[4,5,6],     harvestMonths:[10,11,12,1] },
  'Courge butternut': { plantMonths:[4,5,6],      harvestMonths:[9,10,11] },
  'Pois mange-tout':{ plantMonths:[2,3,4,10,11],  harvestMonths:[4,5,6,7] },
  'Origan':        { plantMonths:[3,4,5,9,10],    harvestMonths:[5,6,7,8,9,10] },
  'Aneth':         { plantMonths:[3,4,5,6,7],     harvestMonths:[5,6,7,8,9] },
  'Coriandre':     { plantMonths:[3,4,5,8,9],     harvestMonths:[4,5,6,7,9,10] },
  'Estragon':      { plantMonths:[3,4,5],         harvestMonths:[5,6,7,8,9,10] },
  'Celeri branche':{ plantMonths:[3,4,5],         harvestMonths:[8,9,10,11] },
  'Asperge':       { plantMonths:[3,4],           harvestMonths:[4,5,6] },
  'Framboise':     { plantMonths:[3,4,10,11],     harvestMonths:[6,7,8,9] },
  'Groseille':     { plantMonths:[3,4,10,11],     harvestMonths:[6,7,8] }
};
function normalizeVeggieName(name) {
  if (!name) return '';
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}
// Index O(1) — construit une seule fois
const CALENDAR_MAP = new Map(
  Object.keys(PLANTING_CALENDAR_BY_NAME).map(function(k) {
    return [normalizeVeggieName(k), PLANTING_CALENDAR_BY_NAME[k]];
  })
);
function getPlantingCalendarForVeggie(veggie) {
  if (!veggie || !veggie.name) return null;
  return CALENDAR_MAP.get(normalizeVeggieName(veggie.name)) || null;
}
