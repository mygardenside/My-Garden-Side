// Green Vibes — modules/learning-calculations.js
// ============================================================
// RÔLE    : Calculs purs sur les données d'apprentissage.
// DÉPEND  : learning-memory.js (getLearningMemory),
//           learning-history.js (getMergedHarvestData)
// GÈRE    : ratios performance, moyennes, patterns, score jardin,
//           progression saisonnière
// NE GÈRE PAS : persistance, rendu HTML, notifications, profil user
// ============================================================

/** Ratio performance d'une entree. */
function entryPerformanceRatio(entry) {
  if (!entry || entry.estimatedYield <= 0) return null;
  return entry.realYield / entry.estimatedYield;
}

/** Moyenne performance par legume. */
function avgPerformanceByVegetable(vegetableId) {
  var data = getMergedHarvestData();
  var entries = data.filter(function(e){ return e.vegetableId === vegetableId; });
  var ratios = entries.map(entryPerformanceRatio).filter(function(r){ return r !== null; });
  return ratios.length > 0 ? ratios.reduce(function(s,r){ return s+r; },0)/ratios.length : 0;
}

/** Moyenne performance par bac. */
function avgPerformanceByBed(bedId) {
  var data = getMergedHarvestData();
  var entries = data.filter(function(e){ return e.bedId === bedId; });
  var ratios = entries.map(entryPerformanceRatio).filter(function(r){ return r !== null; });
  return ratios.length > 0 ? ratios.reduce(function(s,r){ return s+r; },0)/ratios.length : 0;
}

/** Score jardin ameliore avec meteo. */
function computeEnhancedGardenScore(weather) {
  var mem = getLearningMemory();
  var baseScore = (mem.globalStats.avgRatio || 0) * 100;
  var weatherBonus = 0;
  if (weather && weather.current) {
    var temp = weather.current.temperature_2m;
    var rain = weather.current.precipitation;
    if (temp >= 15 && temp <= 25) weatherBonus += 10;
    if (rain < 5) weatherBonus += 5;
  }
  return Math.min(100, baseScore + weatherBonus);
}

/** Detecter patterns ameliores. */
function detectEnhancedPatterns() {
  var mem = getLearningMemory();
  var patterns = [];
  // Pattern 1: Legumes en hausse
  Object.keys(mem.vegetableProfiles).forEach(function(vid) {
    var p = mem.vegetableProfiles[vid];
    if (p.trend === 'hausse' && p.count >= 3) {
      patterns.push({
        type: 'vegetable_improvement',
        vegetableId: vid,
        message: t('pat_improve_title').replace('{name}', tVeg(p.name)) + ' (' + (p.avgRatio * 100).toFixed(0) + '%)',
      });
    }
  });
  // Pattern 2: Bacs sous-performants
  Object.keys(mem.bedProfiles).forEach(function(bid) {
    var p = mem.bedProfiles[bid];
    if (p.avgRatio < 0.8 && p.count >= 2) {
      patterns.push({
        type: 'bed_underperformance',
        bedId: bid,
        message: t('pat_low_bed_title').replace('{name}', p.name) + ' (' + (p.avgRatio * 100).toFixed(0) + '%)'
      });
    }
  });
  return patterns;
}

/** Donnees progression saisonniere. */
function getSeasonProgressionData() {
  var mem = getLearningMemory();
  return mem.progressionHistory;
}