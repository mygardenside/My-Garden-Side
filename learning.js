// Green Vibes — modules/learning.js
// ============================================================
// RÔLE    : Moteur central de la couche apprentissage.
//           Doit être chargé EN PREMIER parmi les modules learning.
// DÉPEND  : learning-history.js (getMergedHarvestData, loadHistory,
//           saveHistory), learning-calculations.js (entryPerformanceRatio)
// GÈRE    : persistance mémoire (loadLearningMemory, saveLearningMemory,
//           getLearningMemory, rebuildLearningMemory), enregistrement
//           récolte (recordHarvestLearningData), profil utilisateur
//           (getUserProgressionProfile), insights actionnables
//           (getActionableInsights), notifications futures
//           (getPotentialNotifications), recommandations V2, blocs
//           de rendu dashboard (buildLearningSection, buildScoreBlock…)
// NE GÈRE PAS : calendrier, navigation, météo brute (→ utils/weather.js)
//
// Schéma mémoire persistante (gvp_learning_memory) :
// {
//   version: 1,          builtAt: ISO string,
//   harvestHistory: [],  // entrées enrichies
//   vegetableProfiles: { [veggieId]: { count, avgRatio, stddev, trend,
//                         avgDays, confidence, … } },
//   bedProfiles: {       [bedId]:    { count, avgRatio, confidence,
//                         topVeggies, surface, … } },
//   globalStats: { totalHarvests, avgRatio, familyDiversity,
//                  seasonsWithData, bestVeggieId, bestBedId },
//   progressionHistory: [ { season, count, totalReal, ratio } ]
// }
// ============================================================

var LEARNING_MEMORY_KEY = 'gvp_learning_memory';

/** Charger la memoire depuis localStorage. */
function loadLearningMemory() {
  try {
    var raw = localStorage.getItem(LEARNING_MEMORY_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error('loadLearningMemory:', e);
    return null;
  }
}

/** Persister la memoire en localStorage. */
function saveLearningMemory(mem) {
  try {
    localStorage.setItem(LEARNING_MEMORY_KEY, JSON.stringify(mem));
  } catch (e) {
    console.error('saveLearningMemory:', e);
  }
}

/**
 * Construire (ou reconstruire) la memoire depuis zero.
 * Appele au demarrage et apres chaque recolte.
 * Utilise getMergedHarvestData() + fonctions existantes.
 */
function rebuildLearningMemory() {
  var data = getMergedHarvestData(); // fusionne gvp_history + APP.crops

  // ---- Profils par legume ----
  var vegProfiles = {};
  var vegMap = {};
  data.forEach(function(e) {
    if (!e.vegetableId) return;
    if (!vegMap[e.vegetableId]) vegMap[e.vegetableId] = [];
    vegMap[e.vegetableId].push(e);
  });
  Object.keys(vegMap).forEach(function(vid) {
    var entries = vegMap[vid];
    var v = APP.vegetables[vid];
    var ratios = entries.map(entryPerformanceRatio).filter(function(r){ return r !== null; });
    var totalReal = entries.reduce(function(s,e){ return s + (e.realYield||0); }, 0);
    var totalEst  = entries.reduce(function(s,e){ return s + (e.estimatedYield||0); }, 0);
    var avgRatio  = ratios.length > 0 ? ratios.reduce(function(s,r){ return s+r; },0)/ratios.length : 0;
    // Ecart-type = regularite
    var stddev = 0;
    if (ratios.length >= 2) {
      var sq = ratios.reduce(function(s,r){ return s+Math.pow(r-avgRatio,2); },0);
      stddev = Math.sqrt(sq/ratios.length);
    }
    // Tendance : comparaison premiere moitie vs seconde moitie
    var trend = 'stable';
    if (ratios.length >= 4) {
      var half = Math.floor(ratios.length/2);
      var first  = ratios.slice(0,half).reduce(function(s,r){ return s+r; },0)/half;
      var second = ratios.slice(half).reduce(function(s,r){ return s+r; },0)/(ratios.length-half);
      if (second - first > 0.12)      trend = 'hausse';
      else if (first - second > 0.12) trend = 'baisse';
    } else if (ratios.length >= 2) {
      var diff = ratios[ratios.length-1] - ratios[0];
      if (diff > 0.18)       trend = 'hausse';
      else if (diff < -0.18) trend = 'baisse';
    }
    // Durees moyennes
    var durs = entries.filter(function(e){ return e.durationDays > 0; }).map(function(e){ return e.durationDays; });
    var avgDays = durs.length > 0 ? Math.round(durs.reduce(function(s,d){ return s+d; },0)/durs.length) : null;
    vegProfiles[vid] = {
      vegetableId: vid,
      name:    v ? v.name  : vid,
      icon:    v ? v.icon  : '🌱',
      family:  v ? v.family : '',
      count:   entries.length,
      totalReal:  parseFloat(totalReal.toFixed(2)),
      totalEst:   parseFloat(totalEst.toFixed(2)),
      avgRatio:   parseFloat(avgRatio.toFixed(3)),
      stddev:     parseFloat(stddev.toFixed(3)),
      trend:      trend,
      avgDays:    avgDays,
      confidence: getConfidenceLabel(entries.length),
      lastHarvest: entries.reduce(function(last,e){ return (!last||e.harvestedAt>last)?e.harvestedAt:last; }, null)
    };
  });

  // ---- Profils par bac ----
  var bedProfiles = {};
  APP.beds.forEach(function(bed) {
    var entries = data.filter(function(e){ return e.bedId === bed.id; });
    var ratios  = entries.map(entryPerformanceRatio).filter(function(r){ return r !== null; });
    var avgRatio= ratios.length > 0 ? ratios.reduce(function(s,r){ return s+r; },0)/ratios.length : 0;
    var totalReal = entries.reduce(function(s,e){ return s+(e.realYield||0); },0);
    // Top legumes dans ce bac
    var vegInBed = {};
    entries.forEach(function(e){
      if (!vegInBed[e.vegetableId]) vegInBed[e.vegetableId] = {count:0,totalR:0,totalE:0};
      vegInBed[e.vegetableId].count++;
      vegInBed[e.vegetableId].totalR += e.realYield||0;
      vegInBed[e.vegetableId].totalE += e.estimatedYield||0;
    });
    var vegList = Object.keys(vegInBed).map(function(vid){
      var p = vegInBed[vid]; var v = APP.vegetables[vid];
      return { vegetableId:vid, name:v?v.name:vid, icon:v?v.icon:'🌱', count:p.count, ratio: p.totalE>0?p.totalR/p.totalE:0 };
    }).sort(function(a,b){ return b.ratio-a.ratio; });
    bedProfiles[bed.id] = {
      bedId: bed.id, name: bed.name,
      count: entries.length,
      totalReal: parseFloat(totalReal.toFixed(2)),
      avgRatio:  parseFloat(avgRatio.toFixed(3)),
      confidence: getConfidenceLabel(entries.length),
      topVeggies: vegList.slice(0,3),
      surface: getBedSurface(bed)
    };
  });

  // ---- Stats globales ----
  var allRatios = data.map(entryPerformanceRatio).filter(function(r){ return r !== null; });
  var globalAvg = allRatios.length > 0 ? allRatios.reduce(function(s,r){ return s+r; },0)/allRatios.length : 0;
  var families  = [];
  data.forEach(function(e){ var v=APP.vegetables[e.vegetableId]; if(v&&families.indexOf(v.family)<0) families.push(v.family); });
  var bySeason  = {};
  data.forEach(function(e){ if(!e.season) return; if(!bySeason[e.season]) bySeason[e.season]={count:0,totalR:0,totalE:0}; bySeason[e.season].count++; bySeason[e.season].totalR+=(e.realYield||0); bySeason[e.season].totalE+=(e.estimatedYield||0); });
  var seasonStats = Object.keys(bySeason).sort().map(function(s){ var d=bySeason[s]; return { season:s, count:d.count, totalReal:parseFloat(d.totalR.toFixed(2)), ratio: d.totalE>0?parseFloat((d.totalR/d.totalE).toFixed(3)):0 }; });

  var globalStats = {
    totalHarvests:    data.length,
    avgRatio:         parseFloat(globalAvg.toFixed(3)),
    familyDiversity:  families.length,
    seasonsWithData:  seasonStats.length,
    bestVeggieId:     Object.keys(vegProfiles).sort(function(a,b){ return vegProfiles[b].avgRatio - vegProfiles[a].avgRatio; })[0] || null,
    bestBedId:        Object.keys(bedProfiles).sort(function(a,b){ return bedProfiles[b].avgRatio - bedProfiles[a].avgRatio; })[0] || null
  };

  var mem = {
    version: 1,
    builtAt: new Date().toISOString(),
    harvestHistory:     data,
    vegetableProfiles:  vegProfiles,
    bedProfiles:        bedProfiles,
    globalStats:        globalStats,
    progressionHistory: seasonStats
  };
  saveLearningMemory(mem);
  return mem;
}

/**
 * Obtenir la memoire : depuis le cache si recente (< 5 min),
 * sinon reconstruire. Permet d'eviter les recalculs inutiles.
 */
function getLearningMemory() {
  var cached = loadLearningMemory();
  if (cached && cached.builtAt) {
    var age = Date.now() - new Date(cached.builtAt).getTime();
    if (age < 5 * 60 * 1000) return cached; // < 5 minutes : cache valide
  }
  return rebuildLearningMemory();
}

// ============================================================
// ENREGISTREMENT EXPLICITE D'UNE RECOLTE
// recordHarvestLearningData(crop) — appele apres confirmHarvest
// Ajoute dans gvp_history avec toutes les donnees utiles,
// evite les doublons par (veggieId + bedId + harvestedAt).
// Puis invalide le cache memoire pour le prochain acces.
// ============================================================
function recordHarvestLearningData(crop) {
  var v   = APP.vegetables[crop.veggieId];
  var bed = APP.beds.find(function(b){ return b.id === crop.bedId; });
  var est = getCropEstimatedYield(crop);
  var dur = (crop.datePlant && crop.dateHarvest)
    ? Math.floor((new Date(crop.dateHarvest) - new Date(crop.datePlant)) / 86400000)
    : null;
  var harvestedAt = crop.dateHarvest || new Date().toISOString().split('T')[0];

  // Verifier doublon
  var entries = loadHistory();
  var exists  = entries.some(function(e) {
    return e.vegetableId === crop.veggieId &&
           e.bedId       === (crop.bedId||'') &&
           e.harvestedAt === harvestedAt;
  });
  if (exists) return; // deja enregistre

  var entry = {
    id:             'r_' + Date.now() + '_' + Math.random().toString(36).slice(2,6),
    vegetableId:    crop.veggieId,
    vegetableName:  v ? v.name   : '',
    bedId:          crop.bedId   || '',
    bedName:        bed ? bed.name : '',
    season:         crop.season  || APP.currentSeason,
    family:         v ? v.family : '',
    plantedAt:      crop.datePlant   || null,
    harvestedAt:    harvestedAt,
    estimatedYield: parseFloat(est.toFixed(2)),
    realYield:      parseFloat((crop.yieldReal||0).toFixed(2)),
    ratio:          est > 0 ? parseFloat(((crop.yieldReal||0)/est).toFixed(3)) : null,
    harvestDurationDays: dur,
    surfaceUsed:    parseFloat(getCropSurface(crop).toFixed(3)),
    density:        (crop.mode === 'plant' && crop.qty && getCropSurface(crop) > 0)
                      ? parseFloat((crop.qty / getCropSurface(crop)).toFixed(2))
                      : null,
    weatherContext: APP.weather && APP.weather.current ? {
      temp:   APP.weather.current.temperature_2m,
      precip: APP.weather.current.precipitation,
      code:   APP.weather.current.weather_code
    } : null,
    notes: crop.notes || ''
  };
  entries.push(entry);
  saveHistory(entries);
  // Invalider le cache memoire pour forcer reconstruction au prochain acces
  localStorage.removeItem(LEARNING_MEMORY_KEY);
}

// ============================================================
// PROGRESSION UTILISATEUR
// getUserProgressionProfile() — utilise la memoire persistante
// ============================================================
function getUserProgressionProfile() {
  var mem = getLearningMemory();
  var gs  = mem.globalStats;
  var prog = mem.progressionHistory;

  // Score de base : taux de reussite moyen (0-50 pts)
  var scoreYield = Math.round(Math.min(50, gs.avgRatio * 50));

  // Diversite (0-20 pts) : 1 famille = 5pts, plafond a 20
  var scoreDiversity = Math.min(20, gs.familyDiversity * 5);

  // Volume de recoltes (0-15 pts)
  var scoreVolume = Math.min(15, gs.totalHarvests * 3);

  // Progression inter-saisons (0-15 pts)
  var scoreProgress = 0;
  if (prog.length >= 2) {
    var last = prog[prog.length-1].ratio, prev = prog[prog.length-2].ratio;
    if (last > prev + 0.05) scoreProgress = 15;
    else if (last >= prev)  scoreProgress = 8;
    else                    scoreProgress = 3;
  } else if (prog.length === 1) {
    scoreProgress = 5;
  }

  var total = scoreYield + scoreDiversity + scoreVolume + scoreProgress;
  total = Math.min(100, Math.max(0, total));

  // Niveau
  var level;
  if      (total >= 85) level = 'expert';
  else if (total >= 65) level = 'avance';
  else if (total >= 45) level = 'intermediaire';
  else if (total >= 25) level = 'apprenti';
  else                  level = 'debutant';

  // Delta vs saison precedente
  var delta = 0;
  if (prog.length >= 2) {
    delta = Math.round((prog[prog.length-1].ratio - prog[prog.length-2].ratio) * 100);
  }

  // Points forts
  var strengths = [];
  if (gs.avgRatio >= 0.80) strengths.push(t('learn_str_good_yields'));
  if (gs.familyDiversity >= 4) strengths.push(t('learn_str_diversity'));
  if (gs.totalHarvests >= 6) strengths.push(t('learn_str_experience').replace('{n}', gs.totalHarvests));
  if (prog.length >= 2 && prog[prog.length-1].ratio > prog[prog.length-2].ratio) strengths.push(t('learn_str_progress'));
  // Meilleur legume
  if (gs.bestVeggieId && mem.vegetableProfiles[gs.bestVeggieId]) {
    var bv = mem.vegetableProfiles[gs.bestVeggieId];
    if (bv.avgRatio >= 0.75) strengths.push(t('learn_str_reliable').replace('{icon}', bv.icon).replace('{name}', tVeg(bv.name)));
  }

  // Points faibles
  var weaknesses = [];
  if (gs.avgRatio < 0.60 && gs.totalHarvests >= 2) weaknesses.push(t('learn_weak_low_yields'));
  if (gs.familyDiversity <= 1 && gs.totalHarvests >= 3) weaknesses.push(t('learn_weak_diversity'));
  if (prog.length >= 2 && prog[prog.length-1].ratio < prog[prog.length-2].ratio - 0.1) weaknesses.push(t('learn_weak_decline'));
  // Legumes en difficulte
  Object.keys(mem.vegetableProfiles).forEach(function(vid) {
    var p = mem.vegetableProfiles[vid];
    if (p.count >= 2 && p.avgRatio < 0.55) weaknesses.push(t('learn_weak_difficult').replace('{icon}', p.icon).replace('{name}', tVeg(p.name)));
  });

  // Prochaines etapes
  var nextMilestones = [];
  if (gs.totalHarvests < 3)    nextMilestones.push(t('learn_mile_harvests').replace('{n}', 3 - gs.totalHarvests));
  if (gs.familyDiversity < 3)  nextMilestones.push(t('learn_mile_diversity').replace('{n}', 3 - gs.familyDiversity));
  if (total < 65)               nextMilestones.push(t('learn_mile_ratio'));
  if (prog.length < 2)          nextMilestones.push(t('learn_mile_season'));
  if (nextMilestones.length === 0) nextMilestones.push(t('learn_mile_perfect'));

  return {
    level:          level,
    score:          total,
    delta:          delta,
    strengths:      strengths.slice(0,3),
    weaknesses:     weaknesses.slice(0,3),
    nextMilestones: nextMilestones.slice(0,2),
    breakdown:      { yield: scoreYield, diversity: scoreDiversity, volume: scoreVolume, progress: scoreProgress }
  };
}

// ============================================================
// INSIGHTS ACTIONNABLES
// getActionableInsights() — transforme les patterns en actions
// Utilise la memoire + detectLearningPatterns + detectEnhancedPatterns
// ============================================================
function getActionableInsights() {
  var mem     = getLearningMemory();
  var vegP    = mem.vegetableProfiles;
  var bedP    = mem.bedProfiles;
  var insights = [];
  var today   = new Date();
  var todayM  = today.getMonth() + 1;

  // ---- Actions basees sur les profils legumes ----
  Object.keys(vegP).forEach(function(vid) {
    var p = vegP[vid]; if (p.count < 2) return;
    var veg = APP.vegetables[vid];

    // Legume tres fiable -> replanter
    if (p.avgRatio >= 0.82 && p.confidence !== 'faible') {
      // Verifier si ce legume est plantable maintenant
      var cal = veg ? getPlantingCalendarForVeggie(veg) : null;
      var plantable = cal && cal.plantMonths && cal.plantMonths.indexOf(todayM) >= 0;
      insights.push({
        id: 'reliable-' + vid, icon: p.icon, type: 'success', priority: 2,
        title: t(plantable ? 'learn_ins_replant_now' : 'learn_ins_replant_soon').replace('{name}', tVeg(p.name)),
        text: t(plantable ? 'learn_ins_replant_text_now' : 'learn_ins_replant_text').replace('{pct}', Math.round(p.avgRatio*100)).replace('{n}', p.count),
        actionType: 'navigate', actionTarget: 'planning',
        confidence: p.confidence
      });
    }

    // Legume en difficulte -> revoir la strategie
    if (p.avgRatio < 0.55 && p.confidence !== 'faible') {
      insights.push({
        id: 'weak-' + vid, icon: p.icon, type: 'warning', priority: 3,
        title: t('learn_ins_density_title').replace('{name}', tVeg(p.name)),
        text: t('learn_ins_density_text').replace('{pct}', Math.round(p.avgRatio*100)),
        actionType: 'navigate', actionTarget: 'crops',
        confidence: p.confidence
      });
    }

    // Tendance en hausse -> encourager
    if (p.trend === 'hausse' && p.count >= 3) {
      insights.push({
        id: 'improving-' + vid, icon: p.icon, type: 'success', priority: 4,
        title: t('learn_ins_improving_title').replace('{name}', tVeg(p.name)),
        text: t('learn_ins_improving_text').replace('{n}', p.count),
        actionType: 'info', actionTarget: 'analysis',
        confidence: p.confidence
      });
    }
  });

  // ---- Actions basees sur les profils bacs ----
  var bedIds = Object.keys(bedP).filter(function(bid){ return bedP[bid].count >= 2; });
  if (bedIds.length >= 2) {
    bedIds.sort(function(a,b){ return bedP[b].avgRatio - bedP[a].avgRatio; });
    var best  = bedP[bedIds[0]];
    var worst = bedP[bedIds[bedIds.length-1]];
    if (best.avgRatio - worst.avgRatio > 0.20) {
      insights.push({
        id: 'best-bed', icon: '🌱', type: 'success', priority: 2,
        title: t('learn_ins_best_bed_title').replace('{name}', escH(best.name)),
        text: t('learn_ins_best_bed_text').replace('{pct1}', Math.round(best.avgRatio*100)).replace('{pct2}', Math.round(worst.avgRatio*100)).replace('{worst}', escH(worst.name)),
        actionType: 'navigate', actionTarget: 'beds',
        confidence: best.confidence
      });
    }
  }

  // ---- Actions basees sur la rotation ----
  APP.beds.forEach(function(bed) {
    var r = getRotationScore(bed);
    if (r.score === 'bad') {
      var fams = getBedFamilies(bed.id);
      insights.push({
        id: 'rotation-' + bed.id, icon: '🔄', type: 'warning', priority: 3,
        title: t('learn_ins_rotation_title').replace('{fams}', fams[0] ? t('family_' + fams[0]) : t('learn_ins_rotation_same_fam')).replace('{bed}', escH(bed.name)),
        text: t('learn_ins_rotation_text'),
        actionType: 'navigate', actionTarget: 'planning',
        confidence: 'fort'
      });
    }
  });

  // ---- Suggestion de plantation intelligente ----
  var sugs = getSuggestedPlantings('1');
  if (sugs.length > 0) {
    var s = sugs[0]; var vp = vegP[s.veggieId];
    var hasGoodHistory = vp && vp.count >= 1 && vp.avgRatio >= 0.70;
    insights.push({
      id: 'plant-now', icon: s.veggie.icon, type: 'info', priority: hasGoodHistory ? 1 : 5,
      title: t('learn_ins_plant_title').replace('{name}', tVeg(s.veggie.name)).replace('{bed}', escH(s.bedName)),
      text: s.reason + (hasGoodHistory ? t('learn_ins_plant_good_hist').replace('{pct}', Math.round(vp.avgRatio*100)) : '.'),
      actionType: 'navigate', actionTarget: 'planning',
      confidence: hasGoodHistory ? vp.confidence : 'faible'
    });
  }

  // Trier par priorite
  insights.sort(function(a,b){ return (a.priority||9)-(b.priority||9); });
  return insights.slice(0,5);
}

// ============================================================
// NOTIFICATIONS FUTURES
// getPotentialNotifications() — retourne les notifications
// qui pourraient etre envoyees (sans les envoyer).
// Base technique pour future integration push/native.
// ============================================================
function getPotentialNotifications() {
  var mem      = getLearningMemory();
  var notes    = [];
  var today    = new Date();
  var todayStr = today.toISOString().split('T')[0];

  // Recoltes optimales aujourd'hui
  APP.crops.filter(function(c){ return c.season === APP.currentSeason && c.status === 'active'; }).forEach(function(c) {
    var stage = getCropStage(c);
    if (stage === 'harvest') {
      var v = APP.vegetables[c.veggieId];
      var vName = v ? tVeg(v.name) : t('lbl_crop');
      notes.push({
        id: 'harvest-ready-' + c.id,
        type: 'harvest',
        title: t('learn_notif_harvest_title').replace('{icon}', v ? v.icon : '\uD83C\uDF89').replace('{name}', vName),
        text: t('learn_notif_harvest_text').replace('{name}', vName),
        priority: 1,
        triggerContext: { cropId: c.id, stage: stage, date: todayStr }
      });
    }
  });

  // Avertissement rendement faible recurrent
  Object.keys(mem.vegetableProfiles).forEach(function(vid) {
    var p = mem.vegetableProfiles[vid];
    if (p.count >= 2 && p.avgRatio < 0.55) {
      notes.push({
        id: 'low-yield-' + vid,
        type: 'warning',
        title: t('learn_notif_lowyield_title').replace('{icon}', p.icon).replace('{name}', tVeg(p.name)),
        text: t('learn_notif_lowyield_text').replace('{pct}', Math.round(p.avgRatio*100)),
        priority: 2,
        triggerContext: { vegetableId: vid, avgRatio: p.avgRatio, count: p.count }
      });
    }
  });

  // Ce legume marche bien : replantez
  Object.keys(mem.vegetableProfiles).forEach(function(vid) {
    var p = mem.vegetableProfiles[vid];
    if (p.count >= 2 && p.avgRatio >= 0.85) {
      var veg = APP.vegetables[vid];
      var cal = veg ? getPlantingCalendarForVeggie(veg) : null;
      var todayM = today.getMonth()+1;
      if (cal && cal.plantMonths && cal.plantMonths.indexOf(todayM) >= 0) {
        notes.push({
          id: 'replant-' + vid,
          type: 'opportunity',
          title: t('learn_notif_replant_title').replace('{icon}', p.icon).replace('{name}', tVeg(p.name)),
          text: t('learn_notif_replant_text').replace('{pct}', Math.round(p.avgRatio*100)),
          priority: 2,
          triggerContext: { vegetableId: vid, month: todayM, avgRatio: p.avgRatio }
        });
      }
    }
  });

  // Rotation a corriger
  APP.beds.forEach(function(bed) {
    var r = getRotationScore(bed);
    if (r.score === 'bad') {
      notes.push({
        id: 'rotation-' + bed.id,
        type: 'rotation',
        title: t('learn_notif_rotation_title').replace('{bed}', escH(bed.name)),
        text: t('learn_notif_rotation_text'),
        priority: 3,
        triggerContext: { bedId: bed.id, repeated: r.repeated }
      });
    }
  });

  notes.sort(function(a,b){ return (a.priority||9)-(b.priority||9); });
  return notes;
}

// ============================================================
// RENDU HTML — BLOCS DASHBOARD APPRENANT
// ============================================================

/** Bloc "Progression utilisateur" pour le dashboard. */
function buildProgressionBlock() {
  var mem = getLearningMemory();
  if (mem.globalStats.totalHarvests < 1) return ''; // pas encore de donnees

  var prof   = getUserProgressionProfile();
  var levels = {
    debutant:      { icon:'🌱', color:'#6b7280', label:t('level_debutant') },
    apprenti:      { icon:'🌿', color:'#52b788', label:t('level_apprenti') },
    intermediaire: { icon:'🥬', color:'#2d6a4f', label:t('level_intermediaire') },
    avance:        { icon:'🌻', color:'#f97316', label:t('level_avance') },
    expert:        { icon:'⭐', color:'#7c3aed', label:t('level_expert') }
  };
  var lv   = levels[prof.level] || levels['debutant'];
  var pct  = prof.score;
  var deltaClass = prof.delta > 0 ? 'up' : prof.delta < 0 ? 'down' : 'flat';
  var deltaText  = prof.delta > 0 ? '+' + prof.delta + ' pts' : prof.delta < 0 ? prof.delta + ' pts' : '= stable';

  var strengthHTML = '';
  if (prof.strengths.length > 0) {
    strengthHTML = '<div style="font-size:0.7rem;color:var(--green-700);margin-top:4px;">' +
      prof.strengths.slice(0,2).map(function(s){ return '\u2022 ' + s; }).join(' ') + '</div>';
  }

  return '<div class="dash-prog-card">' +
    '<div class="dash-prog-badge" style="background:' + lv.color + '20;">' + lv.icon + '</div>' +
    '<div class="dash-prog-info">' +
      '<div class="dash-prog-level" style="color:' + lv.color + '">' + lv.label + '</div>' +
      '<div>' +
        '<span class="dash-prog-score">' + prof.score + '/100</span>' +
        '<span class="dash-prog-delta ' + deltaClass + '">' + deltaText + '</span>' +
      '</div>' +
      strengthHTML +
      '<div class="dash-prog-bar-track">' +
        '<div class="dash-prog-bar-fill" style="width:' + pct + '%;background:' + lv.color + '"></div>' +
      '</div>' +
    '</div>' +
  '</div>';
}

/** Insight actionnable principal pour le dashboard. */
function buildActionableInsightBlock() {
  var insights = getActionableInsights();
  if (insights.length === 0) return '';
  var ins = insights[0]; // le plus prioritaire
  return '<div class="dash-insight-card ' + (ins.type||'info') + '" onclick="navigateFromPlus(\'' + ins.actionTarget + '\')">' +
    '<div class="dash-insight-icon">' + ins.icon + '</div>' +
    '<div class="dash-insight-body">' +
      '<div class="dash-insight-title">' + ins.title + '</div>' +
      '<div class="dash-insight-text">' + ins.text + '</div>' +
    '</div>' +
    '<div style="font-size:0.75rem;color:var(--text-light);flex-shrink:0;align-self:center;">\u203A</div>' +
  '</div>';
}

// ============================================================
// HISTORIQUE PERSISTANT (gvp_history)
// Stocke chaque recolte dans localStorage independamment
// de APP.crops, ce qui permet de conserver l'historique
// meme apres clearAllData ou reimport.
//
// Structure d'une entree :
// {
//   id          : string  — identifiant unique
//   vegetableId : string  — APP.vegetables key
//   bedId       : string
//   season      : string
//   plantedAt   : string  (ISO date)
//   harvestedAt : string  (ISO date)
//   estimatedYield : number (kg)
//   realYield      : number (kg)
//   durationDays   : number (harvestedAt - plantedAt)
//   weatherContext : { temp, precip, code } | null
//   notes          : string
// }
// ============================================================

// HISTORY_KEY, loadHistory(), saveHistory() — définis dans learning-history.js (source canonique)

// Ajouter une entree lors d'une recolte
// Appele automatiquement dans confirmHarvest()
function addHistoryEntry(crop, realYield, weatherContext) {
  var entries = loadHistory();
  var est = getCropEstimatedYield(crop);
  var duration = (crop.datePlant && crop.dateHarvest)
    ? Math.floor((new Date(crop.dateHarvest) - new Date(crop.datePlant)) / 86400000)
    : null;
  entries.push({
    id:            'h_' + Date.now() + '_' + Math.random().toString(36).slice(2,6),
    vegetableId:   crop.veggieId,
    bedId:         crop.bedId || '',
    season:        crop.season || APP.currentSeason,
    plantedAt:     crop.datePlant || null,
    harvestedAt:   crop.dateHarvest || new Date().toISOString().split('T')[0],
    estimatedYield: est,
    realYield:     realYield,
    durationDays:  duration,
    weatherContext: weatherContext || null,
    notes:         crop.notes || ''
  });
  saveHistory(entries);
}

// Supprimer les entrees orphelines (cultures supprimees)
// Appele au demarrage pour maintenir la coherence
function pruneOrphanHistory() {
  var entries = loadHistory();
  var vegIds  = Object.keys(APP.vegetables);
  var cleaned = entries.filter(function(e) {
    return e.vegetableId && vegIds.indexOf(e.vegetableId) >= 0;
  });
  if (cleaned.length !== entries.length) saveHistory(cleaned);
  return cleaned;
}

// Fusionner l'historique persistant avec les recoltes de APP.crops
// pour que les calculs aient la vue la plus complete possible
function getMergedHarvestData() {
  var history = loadHistory();
  var histIds = {};
  history.forEach(function(e) { histIds[e.id] = true; });

  // Ajouter les recoltes de APP.crops qui ne sont pas dans l'historique
  APP.crops.forEach(function(c) {
    if (c.status !== 'harvested' || c.yieldReal == null) return;
    // Cle de deduplication : veggieId + bedId + harvestedAt
    var dupKey = c.veggieId + '_' + (c.bedId || '') + '_' + (c.dateHarvest || '');
    var exists = history.some(function(e) {
      return e.vegetableId === c.veggieId &&
             e.bedId       === (c.bedId || '') &&
             e.harvestedAt === (c.dateHarvest || '');
    });
    if (!exists) {
      var est = getCropEstimatedYield(c);
      var dur = (c.datePlant && c.dateHarvest)
        ? Math.floor((new Date(c.dateHarvest) - new Date(c.datePlant)) / 86400000)
        : null;
      history.push({
        id:             'legacy_' + c.id,
        vegetableId:    c.veggieId,
        bedId:          c.bedId || '',
        season:         c.season || APP.currentSeason,
        plantedAt:      c.datePlant || null,
        harvestedAt:    c.dateHarvest || null,
        estimatedYield: est,
        realYield:      c.yieldReal,
        durationDays:   dur,
        weatherContext: null,
        notes:          c.notes || ''
      });
    }
  });

  return history;
}

// ============================================================
// CALCULS INTELLIGENTS AMELIORES
// Utilisent getMergedHarvestData() pour une vision complete.
// ============================================================

// Ratio performance pour une entree : realYield / estimatedYield
function entryPerformanceRatio(entry) {
  if (!entry.estimatedYield || entry.estimatedYield <= 0) return null;
  return entry.realYield / entry.estimatedYield;
}

// Moyenne de performance par legume (toutes saisons, historique complet)
function avgPerformanceByVegetable(vegetableId) {
  var data = getMergedHarvestData();
  var entries = data.filter(function(e) {
    return e.vegetableId === vegetableId && e.realYield != null;
  });
  if (entries.length === 0) return null;
  var ratios = entries.map(entryPerformanceRatio).filter(function(r) { return r !== null; });
  if (ratios.length === 0) return null;
  return {
    count:  entries.length,
    avg:    ratios.reduce(function(s, r) { return s + r; }, 0) / ratios.length,
    min:    Math.min.apply(null, ratios),
    max:    Math.max.apply(null, ratios),
    // Ecart-type : mesure de regularite (faible = regulier)
    stddev: (function() {
      var mean = ratios.reduce(function(s, r){ return s+r; }, 0) / ratios.length;
      var sq   = ratios.reduce(function(s, r){ return s + Math.pow(r-mean,2); }, 0);
      return Math.sqrt(sq / ratios.length);
    })(),
    confidence: getConfidenceLabel(entries.length),
    ratios: ratios
  };
}

// Moyenne de performance par bac (toutes saisons, historique complet)
function avgPerformanceByBed(bedId) {
  var data = getMergedHarvestData();
  var entries = data.filter(function(e) {
    return e.bedId === bedId && e.realYield != null;
  });
  if (entries.length === 0) return null;
  var ratios = entries.map(entryPerformanceRatio).filter(function(r) { return r !== null; });
  if (ratios.length === 0) return null;
  // Legumes dans ce bac
  var byVeg = {};
  entries.forEach(function(e) {
    if (!byVeg[e.vegetableId]) byVeg[e.vegetableId] = [];
    var r = entryPerformanceRatio(e);
    if (r !== null) byVeg[e.vegetableId].push(r);
  });
  var vegStats = Object.keys(byVeg).map(function(vid) {
    var rs = byVeg[vid];
    var v  = APP.vegetables[vid];
    return {
      vegetableId: vid,
      name:  v ? v.name : vid,
      icon:  v ? v.icon : '🌱',
      count: rs.length,
      avg:   rs.reduce(function(s,r){ return s+r; },0) / rs.length
    };
  }).sort(function(a,b){ return b.avg - a.avg; });

  return {
    bedId: bedId,
    count: entries.length,
    avg:   ratios.reduce(function(s,r){ return s+r; },0) / ratios.length,
    confidence: getConfidenceLabel(entries.length),
    topVegetables:    vegStats.slice(0,2),
    bottomVegetables: vegStats.filter(function(v){ return v.avg < 0.65; }).slice(-2)
  };
}

// Score global du jardin ameliore : inclut la regularite et la progression
function computeEnhancedGardenScore(weather) {
  // Score de base (fonctions existantes)
  var base = getGardenHealthScore(weather);
  var bonus = 0;
  var bonusReasons = [];

  var data = getMergedHarvestData();
  if (data.length >= 4) {
    // Bonus regularite : moyenne des ecarts-types inverses
    var vegIds  = {};
    data.forEach(function(e){ vegIds[e.vegetableId] = true; });
    var regularities = [];
    Object.keys(vegIds).forEach(function(vid) {
      var perf = avgPerformanceByVegetable(vid);
      if (perf && perf.count >= 2) {
        regularities.push(1 - Math.min(1, perf.stddev));
      }
    });
    if (regularities.length > 0) {
      var avgReg = regularities.reduce(function(s,r){ return s+r; },0) / regularities.length;
      if (avgReg > 0.8) { bonus += 5; bonusReasons.push('Jardinage tres regulier'); }
    }

    // Bonus progression : les 3 dernieres saisons s'ameliorent
    var bySeason = {};
    data.forEach(function(e) {
      if (!e.season) return;
      if (!bySeason[e.season]) bySeason[e.season] = { totalR:0, totalE:0, count:0 };
      bySeason[e.season].totalR += e.realYield || 0;
      bySeason[e.season].totalE += e.estimatedYield || 0;
      bySeason[e.season].count++;
    });
    var seasons = Object.keys(bySeason).sort();
    if (seasons.length >= 3) {
      var last3 = seasons.slice(-3).map(function(s) {
        var d = bySeason[s];
        return d.totalE > 0 ? d.totalR / d.totalE : 0;
      });
      if (last3[2] > last3[1] && last3[1] > last3[0]) {
        bonus += 8;
        bonusReasons.push('Progression sur 3 saisons');
      }
    }
  }

  var finalScore = Math.min(100, base.score + bonus);
  var level, color;
  if (finalScore >= 80)      { level = 'Excellent'; color = '#2d6a4f'; }
  else if (finalScore >= 60) { level = 'Bon';       color = '#52b788'; }
  else if (finalScore >= 40) { level = 'Moyen';     color = '#e76f51'; }
  else                       { level = 'A ameliorer'; color = '#e63946'; }

  return {
    score:   finalScore,
    level:   level,
    color:   color,
    reasons: base.reasons.concat(bonusReasons).slice(0, 3)
  };
}

// Detection de patterns enrichie (complement aux patterns existants)
function detectEnhancedPatterns() {
  var extra   = [];
  var data    = getMergedHarvestData();
  if (data.length < 2) return extra;

  // Pattern : densite trop elevee probable
  // Si rendement reel < 50% estme ET duree plus longue que prevue
  var vegIds = {};
  data.forEach(function(e){ vegIds[e.vegetableId] = true; });
  Object.keys(vegIds).forEach(function(vid) {
    var veg     = APP.vegetables[vid]; if (!veg) return;
    var entries = data.filter(function(e){ return e.vegetableId === vid && e.realYield != null; });
    if (entries.length < 2) return;
    var lowYield = entries.filter(function(e){ return entryPerformanceRatio(e) !== null && entryPerformanceRatio(e) < 0.5; });
    var longDur  = entries.filter(function(e){ return e.durationDays && e.durationDays > veg.daysToHarvest * 1.3; });
    if (lowYield.length >= 2 && longDur.length >= 1) {
      extra.push({ id:'density-' + vid, type:'warning', severity:2,
        icon: veg.icon,
        title: t('pat_density_title').replace('{name}', tVeg(veg.name)),
        text: t('pat_density_text'),
        confidence: getConfidenceLabel(entries.length) });
    }
  });

  // Pattern : surcharge recurrente d'un bac (plusieurs saisons)
  APP.beds.forEach(function(bed) {
    var surcharge = data.filter(function(e) {
      // Proxy : plusieurs cultures simultanees dans ce bac la meme saison
      var sameSeason = data.filter(function(e2){
        return e2.bedId === bed.id && e2.season === e.season && e2.id !== e.id;
      });
      return e.bedId === bed.id && sameSeason.length >= 3;
    });
    var saisons = {};
    surcharge.forEach(function(e){ saisons[e.season] = true; });
    if (Object.keys(saisons).length >= 2) {
      extra.push({ id:'recur-full-' + bed.id, type:'warning', severity:3,
        icon: '📦',
        title: t('pat_bed_full_title').replace('{name}', escH(bed.name)),
        text: t('pat_bed_full_text').replace('{n}', Object.keys(saisons).length),
        confidence: 'fort' });
    }
  });

  // Pattern : un legume produit 2x plus dans un bac que dans un autre
  var checkedVeg = {};
  data.forEach(function(e) {
    if (checkedVeg[e.vegetableId] || !e.bedId) return;
    var v = APP.vegetables[e.vegetableId]; if (!v) return;
    var byBed = {};
    data.filter(function(e2){ return e2.vegetableId === e.vegetableId && e2.bedId; }).forEach(function(e2) {
      if (!byBed[e2.bedId]) byBed[e2.bedId] = [];
      var r = entryPerformanceRatio(e2);
      if (r !== null) byBed[e2.bedId].push(r);
    });
    var beds = Object.keys(byBed).filter(function(bid){ return byBed[bid].length >= 1; });
    if (beds.length < 2) return;
    var avgs = beds.map(function(bid){
      var rs = byBed[bid];
      return { bedId: bid, avg: rs.reduce(function(s,r){ return s+r; },0)/rs.length, count: rs.length };
    }).sort(function(a,b){ return b.avg - a.avg; });
    if (avgs[0].avg / Math.max(0.01, avgs[avgs.length-1].avg) >= 1.5 && avgs[0].count >= 1) {
      var bestBed = APP.beds.find(function(b){ return b.id === avgs[0].bedId; });
      if (bestBed) {
        checkedVeg[e.vegetableId] = true;
        extra.push({ id:'bac-pref-' + e.vegetableId, type:'info', severity:3,
          icon: v.icon,
          title: t('pat_bac_pref_title').replace('{name}', tVeg(v.name)).replace('{bed}', escH(bestBed.name)),
          text: t('pat_bac_pref_text').replace('{pct}', Math.round(avgs[0].avg * 100)).replace('{pct2}', Math.round(avgs[avgs.length-1].avg * 100)),
          confidence: getConfidenceLabel(avgs[0].count) });
      }
    }
  });

  return extra;
}

// Calcul de la progression sur les saisons
function getSeasonProgressionData() {
  var data    = getMergedHarvestData();
  var bySeason = {};
  data.forEach(function(e) {
    if (!e.season) return;
    if (!bySeason[e.season]) bySeason[e.season] = { season: e.season, totalReal: 0, totalEst: 0, count: 0 };
    bySeason[e.season].totalReal += e.realYield || 0;
    bySeason[e.season].totalEst  += e.estimatedYield || 0;
    bySeason[e.season].count++;
  });
  return Object.values(bySeason).sort(function(a,b){ return a.season.localeCompare(b.season); }).map(function(s){
    return {
      season: s.season,
      count:  s.count,
      totalReal: s.totalReal,
      ratio: s.totalEst > 0 ? s.totalReal / s.totalEst : 0
    };
  });
}

// getLearningInsights ameliore : fusionne anciens + nouveaux patterns
function getLearningInsightsV2() {
  var base     = getLearningInsights();   // fonction existante
  var enhanced = detectEnhancedPatterns();
  // Fusionner les patterns sans doublons (meme id)
  var allIds = {};
  base.patterns.forEach(function(p){ allIds[p.id] = true; });
  enhanced.forEach(function(p){ if (!allIds[p.id]) base.patterns.push(p); });
  base.patterns.sort(function(a,b){
    var order = { danger:0, warning:1, info:2, success:3 };
    return ((order[a.type]||2) - (order[b.type]||2)) || ((a.severity||9) - (b.severity||9));
  });
  base.progression = getSeasonProgressionData();
  base.enhancedScore = computeEnhancedGardenScore(APP.weather);
  return base;
}

// getSmartRecommendations ameliore : utilise l'historique complet
function getSmartRecommendationsV2(weather) {
  var base = getSmartRecommendations(weather);  // fonction existante
  var data = getMergedHarvestData();
  if (data.length < 2) return base;

  // Injecter : meilleur bac pour une culture en cours de planification
  var suggestions = getSuggestedPlantings('1');
  suggestions.slice(0,3).forEach(function(sug) {
    var perf = avgPerformanceByVegetable(sug.veggieId);
    if (perf && perf.count >= 2 && perf.avg >= 0.80) {
      var already = base.some(function(r){ return r.id === 'plant'; });
      if (!already) {
        base.push({ id:'proven-plant', icon: sug.veggie.icon, priority:3,
          title: t('learn_proven_title').replace('{name}', tVeg(sug.veggie.name)),
          text: t('learn_proven_text').replace('{pct}', Math.round(perf.avg * 100)).replace('{count}', perf.count) + ' ' + sug.reason + '.',
          actionType:'navigate', actionTarget:'planning', priority:3 });
        return false; // stop apres le premier
      }
    }
  });

  base.sort(function(a,b){ return (a.priority||9)-(b.priority||9); });
  return base.slice(0,3);
}

// ============================================================
// MOTEUR D'APPRENTISSAGE
// Analyse l'historique TOUTES saisons confondues.
// Donnees utilisees : APP.crops (status=harvested), APP.beds,
//   APP.vegetables, APP.seasons, yieldReal, yieldEstimated,
//   datePlant, dateHarvest, bedId, veggieId.
// Fonctions existantes reutilisees : getCropEstimatedYield,
//   getBedSurface, getBedOccupation, getBedFamilies,
//   getRotationScore, getBedCrops, escH.
// ============================================================

// ---- Helpers ----

function getConfidenceLabel(count) {
  if (count >= 4) return 'fort';
  if (count >= 2) return 'moyen';
  return 'faible';
}
function getConfidenceText(count) {
  if (count <= 1) return t('lbl_one_harvest');
  return t('lbl_n_harvests').replace('{n}', count);
}

// ---- Apprentissage par legume (toutes saisons) ----
function getVegetableLearning() {
  var byVeg = {};
  // Parcours TOUTES les cultures recoltees avec rendement reel
  APP.crops.forEach(function(c) {
    if (c.status !== 'harvested' || c.yieldReal == null) return;
    var v = APP.vegetables[c.veggieId];
    if (!v) return;
    var est = getCropEstimatedYield(c);
    if (!byVeg[c.veggieId]) {
      byVeg[c.veggieId] = {
        id: c.veggieId, name: v.name, icon: v.icon,
        count: 0, totalReal: 0, totalEst: 0,
        ratios: [], harvestDays: []
      };
    }
    var entry = byVeg[c.veggieId];
    entry.count++;
    entry.totalReal += c.yieldReal;
    entry.totalEst  += est;
    if (est > 0) entry.ratios.push(c.yieldReal / est);
    // Duree reelle en jours si dates presentes
    if (c.datePlant && c.dateHarvest) {
      var days = Math.floor((new Date(c.dateHarvest) - new Date(c.datePlant)) / 86400000);
      if (days > 0) entry.harvestDays.push(days);
    }
  });

  // Calcul des indicateurs par legume
  Object.keys(byVeg).forEach(function(vid) {
    var e = byVeg[vid];
    e.avgReal = e.totalReal / e.count;
    e.avgEst  = e.totalEst  / e.count;
    e.performanceRatio = e.avgEst > 0 ? e.avgReal / e.avgEst : 0;
    e.confidence = getConfidenceLabel(e.count);
    e.confidenceText = getConfidenceText(e.count);
    // Tendance sur les 3 dernieres recoltes si confiance suffisante
    e.trend = 'stable';
    if (e.ratios.length >= 3) {
      var last = e.ratios.slice(-3);
      var diff = last[2] - last[0];
      if (diff > 0.15)       e.trend = 'hausse';
      else if (diff < -0.15) e.trend = 'baisse';
    }
    // Duree moyenne de recolte
    e.avgDays = e.harvestDays.length > 0
      ? Math.round(e.harvestDays.reduce(function(s, d){ return s + d; }, 0) / e.harvestDays.length)
      : null;
  });

  return byVeg;
}

// ---- Apprentissage par bac ----
function getBedLearningProfile(bedId) {
  var bed = APP.beds.find(function(b) { return b.id === bedId; });
  if (!bed) return null;

  // Toutes les cultures recoltees dans ce bac
  var harvested = APP.crops.filter(function(c) {
    return c.bedId === bedId && c.status === 'harvested' && c.yieldReal != null;
  });

  if (harvested.length === 0) return { bedId: bedId, name: bed.name, count: 0, confidence: 'faible' };

  var totalReal = harvested.reduce(function(s, c){ return s + c.yieldReal; }, 0);
  var totalEst  = harvested.reduce(function(s, c){ return s + getCropEstimatedYield(c); }, 0);
  var ratio = totalEst > 0 ? totalReal / totalEst : 0;

  // Legumes qui marchent bien / mal dans ce bac
  var vegPerf = {};
  harvested.forEach(function(c) {
    var v = APP.vegetables[c.veggieId]; if (!v) return;
    var est = getCropEstimatedYield(c);
    if (!vegPerf[c.veggieId]) vegPerf[c.veggieId] = { name: v.name, icon: v.icon, count: 0, totalR: 0, totalE: 0 };
    vegPerf[c.veggieId].count++;
    vegPerf[c.veggieId].totalR += c.yieldReal;
    vegPerf[c.veggieId].totalE += est;
  });
  var vegList = Object.keys(vegPerf).map(function(vid) {
    var p = vegPerf[vid];
    var r = p.totalE > 0 ? p.totalR / p.totalE : 0;
    return { id: vid, name: p.name, icon: p.icon, count: p.count, ratio: r };
  }).sort(function(a, b) { return b.ratio - a.ratio; });

  return {
    bedId: bedId, name: bed.name,
    count: harvested.length,
    totalReal: totalReal,
    performanceRatio: ratio,
    confidence: getConfidenceLabel(harvested.length),
    confidenceText: getConfidenceText(harvested.length),
    topVeggies: vegList.slice(0, 2),
    bottomVeggies: vegList.slice(-2).filter(function(v){ return v.ratio < 0.7; })
  };
}

// ---- Detection de patterns ----
function detectLearningPatterns(vegLearning, bedProfiles) {
  var patterns = [];

  // Pattern : legume performant (ratio >= 0.85, confiance >= moyen)
  Object.keys(vegLearning).forEach(function(vid) {
    var e = vegLearning[vid];
    if (e.count < 2) return;
    if (e.performanceRatio >= 0.85) {
      patterns.push({ id:'top-veg-' + vid, type:'success', severity:1,
        icon: e.icon,
        title: t('pat_top_veg_title').replace('{name}', tVeg(e.name)),
        text: t('pat_top_veg_text').replace('{pct}', Math.round(e.performanceRatio * 100)).replace('{conf}', e.confidenceText),
        confidence: e.confidence });
    }
  });

  // Pattern : legume peu performant (ratio < 0.55, confiance >= moyen)
  Object.keys(vegLearning).forEach(function(vid) {
    var e = vegLearning[vid];
    if (e.count < 2) return;
    if (e.performanceRatio < 0.55) {
      patterns.push({ id:'low-veg-' + vid, type:'warning', severity:2,
        icon: e.icon,
        title: t('pat_low_veg_title').replace('{name}', tVeg(e.name)),
        text: t('pat_low_veg_text').replace('{pct}', Math.round(e.performanceRatio * 100)).replace('{conf}', e.confidenceText),
        confidence: e.confidence });
    }
  });

  // Pattern : tendance en baisse sur un legume
  Object.keys(vegLearning).forEach(function(vid) {
    var e = vegLearning[vid];
    if (e.trend === 'baisse' && e.count >= 3) {
      patterns.push({ id:'decline-' + vid, type:'warning', severity:2,
        icon: e.icon,
        title: t('pat_decline_title').replace('{name}', tVeg(e.name)),
        text: t('pat_decline_text').replace('{n}', e.count),
        confidence: e.confidence });
    }
  });

  // Pattern : tendance en hausse
  Object.keys(vegLearning).forEach(function(vid) {
    var e = vegLearning[vid];
    if (e.trend === 'hausse' && e.count >= 3) {
      patterns.push({ id:'improve-' + vid, type:'info', severity:3,
        icon: e.icon,
        title: t('pat_improve_title').replace('{name}', tVeg(e.name)),
        text: t('pat_improve_text').replace('{n}', e.count),
        confidence: e.confidence });
    }
  });

  // Pattern : bac tres performant
  bedProfiles.forEach(function(p) {
    if (!p || p.count < 2) return;
    if (p.performanceRatio >= 0.85) {
      patterns.push({ id:'top-bed-' + p.bedId, type:'success', severity:1,
        icon: '🌱',
        title: t('pat_top_bed_title').replace('{name}', escH(p.name)),
        text: t('pat_top_bed_text').replace('{pct}', Math.round(p.performanceRatio * 100)),
        confidence: p.confidence });
    }
  });

  // Pattern : bac sous-performant
  bedProfiles.forEach(function(p) {
    if (!p || p.count < 2) return;
    if (p.performanceRatio < 0.55) {
      patterns.push({ id:'low-bed-' + p.bedId, type:'warning', severity:2,
        icon: '📦',
        title: t('pat_low_bed_title').replace('{name}', escH(p.name)),
        text: t('pat_low_bed_text').replace('{pct}', Math.round(p.performanceRatio * 100)).replace('{conf}', p.confidenceText),
        confidence: p.confidence });
    }
  });

  // Pattern : rotation repetitive detectee
  APP.beds.forEach(function(bed) {
    var r = getRotationScore(bed);
    if (r.score === 'bad' && APP.seasons.length >= 2) {
      var fams = getBedFamilies(bed.id).map(function(f){ return t('family_' + f); }).join(', ');
      patterns.push({ id:'rot-' + bed.id, type:'warning', severity:2,
        icon: '🔄',
        title: t('pat_rotation_title').replace('{name}', escH(bed.name)),
        text: t('pat_rotation_text').replace('{n}', r.repeated).replace('{fams}', fams),
        confidence: 'fort' });
    }
  });

  // Pattern : recolte souvent tardive sur un legume
  Object.keys(vegLearning).forEach(function(vid) {
    var e = vegLearning[vid];
    var veg = APP.vegetables[vid];
    if (!veg || e.count < 2 || !e.avgDays) return;
    if (e.avgDays > veg.daysToHarvest * 1.2) {
      patterns.push({ id:'late-' + vid, type:'info', severity:4,
        icon: e.icon,
        title: t('pat_late_title').replace('{name}', tVeg(e.name)),
        text: t('pat_late_text').replace('{avg}', e.avgDays + t('lbl_days_abbr')).replace('{est}', veg.daysToHarvest + t('lbl_days_abbr')),
        confidence: e.confidence });
    }
  });

  // Trier : warning d'abord, puis success, severity croissante
  patterns.sort(function(a, b) {
    var order = { danger:0, warning:1, info:2, success:3 };
    var oa = order[a.type] || 2, ob = order[b.type] || 2;
    if (oa !== ob) return oa - ob;
    return (a.severity || 9) - (b.severity || 9);
  });

  return patterns;
}

// ---- Recommandations apprenantes ----
function getLearningRecommendations(vegLearning, bedProfiles) {
  var recos = [];

  // Recommander les legumes fiables (ratio >= 0.8)
  var fiables = Object.keys(vegLearning)
    .map(function(vid){ return vegLearning[vid]; })
    .filter(function(e){ return e.count >= 2 && e.performanceRatio >= 0.80; })
    .sort(function(a, b){ return b.performanceRatio - a.performanceRatio; });
  if (fiables.length > 0) {
    var nomsF = fiables.slice(0,2).map(function(e){ return e.icon + ' ' + e.name; }).join(', ');
    recos.push({ id:'reliable', icon:'⭐', priority:1,
      title: nomsF + (fiables.length > 2 ? ' (et d\'autres)' : '') + ' marchent bien chez vous',
      text: 'Prioritisez ces legumes cette saison.',
      confidence: fiables[0].confidence });
  }

  // Signaler les legumes peu performants
  var faibles = Object.keys(vegLearning)
    .map(function(vid){ return vegLearning[vid]; })
    .filter(function(e){ return e.count >= 2 && e.performanceRatio < 0.55; })
    .sort(function(a, b){ return a.performanceRatio - b.performanceRatio; });
  if (faibles.length > 0) {
    recos.push({ id:'underperf', icon:'⚠️', priority:2,
      title: faibles[0].icon + ' ' + faibles[0].name + ' : revoyez la strategie',
      text: 'Rendements recurrents trop faibles. Essayez un autre espace de culture ou une densite differente.',
      confidence: faibles[0].confidence });
  }

  // Meilleur bac vs pire bac
  var profiles = bedProfiles.filter(function(p){ return p && p.count >= 2; });
  if (profiles.length >= 2) {
    var sorted = profiles.slice().sort(function(a, b){ return b.performanceRatio - a.performanceRatio; });
    var best = sorted[0], worst = sorted[sorted.length - 1];
    if (best.performanceRatio - worst.performanceRatio > 0.25) {
      recos.push({ id:'bestbed', icon:'🌱', priority:3,
        title: 'Privilegiez ' + escH(best.name) + ' pour vos cultures cles',
        text: Math.round(best.performanceRatio * 100) + '% de rendement vs ' + Math.round(worst.performanceRatio * 100) + '% pour ' + escH(worst.name) + '.',
        confidence: best.confidence });
    }
  }

  // Legume meilleur dans un bac precis
  var vegIdsChecked = {};
  APP.crops.forEach(function(c) {
    if (c.status !== 'harvested' || c.yieldReal == null || vegIdsChecked[c.veggieId]) return;
    var v = APP.vegetables[c.veggieId]; if (!v) return;
    // Comparer les ratios par bac pour ce legume
    var byBed = {};
    APP.crops.filter(function(c2){
      return c2.veggieId === c.veggieId && c2.status === 'harvested' && c2.yieldReal != null && c2.bedId;
    }).forEach(function(c2) {
      if (!byBed[c2.bedId]) byBed[c2.bedId] = { count:0, totalR:0, totalE:0 };
      byBed[c2.bedId].count++;
      byBed[c2.bedId].totalR += c2.yieldReal;
      byBed[c2.bedId].totalE += getCropEstimatedYield(c2);
    });
    var bedKeys = Object.keys(byBed).filter(function(bid){ return byBed[bid].count >= 1; });
    if (bedKeys.length >= 2) {
      var bedRatios = bedKeys.map(function(bid) {
        var p = byBed[bid];
        return { bedId: bid, ratio: p.totalE > 0 ? p.totalR / p.totalE : 0, count: p.count };
      }).sort(function(a, b){ return b.ratio - a.ratio; });
      if (bedRatios[0].ratio - bedRatios[bedRatios.length-1].ratio > 0.3) {
        var bestBed = APP.beds.find(function(b){ return b.id === bedRatios[0].bedId; });
        if (bestBed) {
          vegIdsChecked[c.veggieId] = true;
          recos.push({ id:'best-veg-bed-' + c.veggieId, icon: v.icon, priority:4,
            title: v.name + ' reussit mieux dans ' + escH(bestBed.name),
            text: Math.round(bedRatios[0].ratio * 100) + '% de rendement dans cet espace. A privilegier.',
            confidence: getConfidenceLabel(bedRatios[0].count) });
        }
      }
    }
  });

  // Conseil rotation si peu de donnees mais repetition detectee
  APP.beds.forEach(function(bed) {
    var r = getRotationScore(bed);
    if (r.score === 'bad') {
      recos.push({ id:'rot-reco-' + bed.id, icon:'🔄', priority:5,
        title: 'Changez les familles dans ' + escH(bed.name),
        text: 'Meme famille plusieurs saisons de suite. La rotation ameliore les rendements a long terme.',
        confidence: 'fort' });
    }
  });

  recos.sort(function(a, b){ return (a.priority||9) - (b.priority||9); });
  return recos.slice(0, 5);
}

// ---- Fonction principale ----
function getLearningInsights() {
  var vegLearning   = getVegetableLearning();
  var bedProfiles   = APP.beds.map(function(b){ return getBedLearningProfile(b.id); });
  var patterns      = detectLearningPatterns(vegLearning, bedProfiles);
  var recommendations = getLearningRecommendations(vegLearning, bedProfiles);

  // Nombre total de recoltes avec donnees
  var totalHarvested = APP.crops.filter(function(c){
    return c.status === 'harvested' && c.yieldReal != null;
  }).length;

  return {
    totalHarvested: totalHarvested,
    byVegetable:    vegLearning,
    byBed:          bedProfiles,
    patterns:       patterns,
    recommendations: recommendations
  };
}

// ---- Rendu HTML de la section apprentissage ----
function buildLearningSection(insights) {
  var html = '';

  // Pas assez de donnees
  if (insights.totalHarvested < 2) {
    html += '<div class="learn-card"><div class="learn-empty">' + t('learn_empty_state') + '</div></div>';
    return html;
  }

  // --- PATTERNS ---
  if (insights.patterns.length > 0) {
    html += '<div class="learn-card" style="padding:12px 16px;">';
    var shown = insights.patterns.slice(0, 4);
    shown.forEach(function(p) {
      html += '<div class="learn-pattern ' + p.type + '">' +
        '<div class="learn-pattern-icon">' + p.icon + '</div>' +
        '<div class="learn-pattern-body">' +
          '<div class="learn-pattern-title">' + p.title +
            '<span class="learn-confidence ' + p.confidence + '">' + (p.confidence === 'fort' ? t('learn_conf_fort') : p.confidence === 'moyen' ? t('learn_conf_moyen') : t('learn_conf_low')) + '</span>' +
          '</div>' +
          '<div class="learn-pattern-text">' + p.text + '</div>' +
        '</div>' +
      '</div>';
    });
    html += '</div>';
  }

  // --- LEGUMES FIABLES ---
  var vegList = Object.keys(insights.byVegetable)
    .map(function(vid){ return insights.byVegetable[vid]; })
    .filter(function(e){ return e.count >= 2; })
    .sort(function(a, b){ return b.performanceRatio - a.performanceRatio; });

  if (vegList.length > 0) {
    html += '<div class="dash-section-label" style="margin-top:16px;"><div>' + t('learn_section_veggie') + '</div></div>';
    html += '<div class="learn-card" style="padding:10px 16px;">';
    vegList.slice(0, 6).forEach(function(e) {
      var ratioClass = e.performanceRatio >= 0.80 ? 'bon' : e.performanceRatio >= 0.55 ? 'moy' : 'bas';
      var trendIcon  = e.trend === 'hausse' ? '↗' : e.trend === 'baisse' ? '↘' : '→';
      html += '<div class="learn-veggie-row">' +
        '<div class="learn-veggie-icon">' + e.icon + '</div>' +
        '<div class="learn-veggie-info">' +
          '<div class="learn-veggie-name">' + escH(tVeg(e.name)) + '</div>' +
          '<div class="learn-veggie-stats">' + e.confidenceText + (e.avgDays ? ' \u00B7 ~' + e.avgDays + t('lbl_days_abbr') : '') + '</div>' +
        '</div>' +
        '<div class="learn-veggie-ratio">' +
          '<div class="learn-veggie-pct ' + ratioClass + '">' + Math.round(e.performanceRatio * 100) + '%</div>' +
          '<div class="learn-veggie-trend">' + trendIcon + ' ' + (e.trend === 'hausse' ? t('learn_trend_hausse') : e.trend === 'baisse' ? t('learn_trend_baisse') : t('learn_trend_stable')) + '</div>' +
        '</div>' +
      '</div>';
    });
    html += '</div>';
  }

  // --- BACS ---
  var bedProfiles = insights.byBed.filter(function(p){ return p && p.count >= 1; });
  if (bedProfiles.length > 0) {
    html += '<div class="dash-section-label" style="margin-top:16px;"><div>' + t('learn_section_bed') + '</div></div>';
    html += '<div class="learn-card" style="padding:10px 16px;">';
    bedProfiles.forEach(function(p) {
      if (!p) return;
      var score = p.count >= 1 ? Math.round(p.performanceRatio * 100) : null;
      var scoreColor = score === null ? 'var(--text-light)' : score >= 80 ? 'var(--green-700)' : score >= 55 ? 'var(--orange)' : 'var(--red)';
      var topV = p.topVeggies && p.topVeggies.length > 0
        ? p.topVeggies.map(function(v){ return v.icon; }).join('') + ' '
        : '';
      html += '<div class="learn-bed-row">' +
        '<div class="learn-bed-icon">🌱</div>' +
        '<div class="learn-bed-info">' +
          '<div class="learn-bed-name">' + escH(p.name) + '</div>' +
          '<div class="learn-bed-stats">' + p.confidenceText + (topV ? ' \u00B7 ' + topV : '') + '</div>' +
        '</div>' +
        '<div class="learn-bed-score" style="color:' + scoreColor + '">' +
          (score !== null ? score + '%' : 'N/A') +
        '</div>' +
      '</div>';
    });
    html += '</div>';
  }

  // --- RECOMMANDATIONS ---
  if (insights.recommendations.length > 0) {
    html += '<div class="dash-section-label" style="margin-top:16px;"><div>' + t('learn_section_reco') + '</div></div>';
    html += '<div class="learn-card" style="padding:10px 16px;">';
    insights.recommendations.forEach(function(r) {
      html += '<div class="learn-reco">' +
        '<div class="learn-reco-icon">' + r.icon + '</div>' +
        '<div class="learn-reco-body">' +
          '<div class="learn-reco-title">' + r.title +
            '<span class="learn-confidence ' + r.confidence + '">' + (r.confidence === 'fort' ? t('learn_conf_fort') : r.confidence === 'moyen' ? t('learn_conf_moyen') : t('learn_conf_low')) + '</span>' +
          '</div>' +
          '<div class="learn-reco-text">' + r.text + '</div>' +
        '</div>' +
      '</div>';
    });
    html += '</div>';
  }

  // --- PROGRESSION PAR SAISON ---
  if (insights.progression && insights.progression.length >= 2) {
    html += '<div class="dash-section-label" style="margin-top:16px;"><div>📈 Progression par saison</div></div>';
    html += '<div class="learn-card" style="padding:12px 16px;">';
    var maxR = Math.max.apply(null, insights.progression.map(function(s){ return s.ratio; })) || 1;
    insights.progression.forEach(function(s) {
      var pct   = Math.min(100, Math.round((s.ratio / maxR) * 100));
      var col   = s.ratio >= 0.8 ? 'var(--green-500)' : s.ratio >= 0.55 ? 'var(--orange)' : 'var(--red)';
      html += '<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">' +
        '<div style="width:44px;font-size:0.75rem;font-weight:600;color:var(--text-light);flex-shrink:0;">' + s.season + '</div>' +
        '<div style="flex:1;height:10px;background:#f3f4f6;border-radius:5px;overflow:hidden;">' +
          '<div style="height:100%;width:' + pct + '%;background:' + col + ';border-radius:5px;"></div>' +
        '</div>' +
        '<div style="width:36px;text-align:right;font-size:0.72rem;font-weight:700;color:' + col + ';">' + Math.round(s.ratio*100) + '%</div>' +
        '<div style="width:28px;text-align:right;font-size:0.68rem;color:var(--text-light);">' + s.count + '</div>' +
      '</div>';
    });
    html += '<div style="display:flex;justify-content:space-between;font-size:0.65rem;color:var(--text-light);margin-top:2px;">' +
      '<span>Saison</span><span style="flex:1;text-align:center;">Rendement moyen</span><span>Nb</span></div>';
    html += '</div>';
  }

  return html;
}

// ============================================================
// INTELLIGENCE AVANCEE
// Fonctions existantes reutilisees :
//   getBedOccupation, getBedSurface, getBedFamilies,
//   getRotationScore, getCropStage, getCropEstimatedYield,
//   getWeatherAlerts, generateTasks, getSuggestedPlantings,
//   getPlantingCalendarForVeggie, getBedAvailableSpace
// ============================================================

// ---- 1. SCORE GLOBAL DU POTAGER ----
function getGardenHealthScore(weather) {
  var score = 100;
  var reasons = [];
  var today = new Date();
  var seasonCrops = APP.crops.filter(function(c) { return c.season === APP.currentSeason; });
  var activeCrops  = seasonCrops.filter(function(c) { return c.status === 'active'; });

  // --- Occupation des bacs ---
  var surcharges = 0;
  var vides = 0;
  APP.beds.forEach(function(bed) {
    var occ = getBedOccupation(bed);
    if (occ < 15 && getBedCrops(bed.id).filter(function(c){ return c.status === 'active'; }).length === 0) {
      score -= 5; vides++;
    }
  });
  if (vides > 0) reasons.push(vides + ' espace' + (vides > 1 ? 's' : '') + ' sous-exploité' + (vides > 1 ? 's' : ''));

  // --- Diversite des familles ---
  var allFamilies = [];
  activeCrops.forEach(function(c) {
    var v = APP.vegetables[c.veggieId];
    if (v && allFamilies.indexOf(v.family) < 0) allFamilies.push(v.family);
  });
  if (allFamilies.length === 0) {
    score -= 10;
  } else if (allFamilies.length >= 3) {
    score += 5;
    reasons.push('Bonne diversite (' + allFamilies.length + ' familles)');
  } else {
    reasons.push('Diversite faible (' + allFamilies.length + ' famille' + (allFamilies.length > 1 ? 's' : '') + ')');
  }

  // --- Rotation des cultures ---
  var rotationProblemes = 0;
  APP.beds.forEach(function(bed) {
    var r = getRotationScore(bed);
    if (r.score === 'bad')     { score -= 10; rotationProblemes++; }
    else if (r.score === 'warning') { score -= 4; }
  });
  if (rotationProblemes > 0)  reasons.push('Rotation problematique sur ' + rotationProblemes + ' espace' + (rotationProblemes > 1 ? 's' : ''));

  // --- Recoltes en attente ---
  var prets = activeCrops.filter(function(c) { return getCropStage(c) === 'harvest'; }).length;
  if (prets > 0) { score -= Math.min(8, prets * 3); reasons.push(prets + ' culture' + (prets > 1 ? 's' : '') + ' prete' + (prets > 1 ? 's' : '') + ' a recolter'); }

  // --- Recoltes en retard ---
  var retard = 0;
  activeCrops.forEach(function(c) {
    if (!c.dateHarvest) return;
    var diff = Math.floor((today - new Date(c.dateHarvest)) / 86400000);
    if (diff > 7) retard++;
  });
  if (retard > 0) { score -= retard * 4; reasons.push(retard + ' culture' + (retard > 1 ? 's' : '') + ' en retard de recolte'); }

  // --- Alertes meteo ---
  var alerts = weather ? getWeatherAlerts(weather) : [];
  var dangerAlerts = alerts.filter(function(a) { return a.type === 'danger'; }).length;
  if (dangerAlerts > 0) { score -= dangerAlerts * 6; reasons.push('Alerte meteo active'); }

  // --- Rendement reel vs estime ---
  var harvestedCrops = seasonCrops.filter(function(c) { return c.status === 'harvested' && c.yieldReal != null; });
  if (harvestedCrops.length >= 2) {
    var totalEst  = harvestedCrops.reduce(function(s, c) { return s + getCropEstimatedYield(c); }, 0);
    var totalReal = harvestedCrops.reduce(function(s, c) { return s + (c.yieldReal || 0); }, 0);
    if (totalEst > 0) {
      var ratio = totalReal / totalEst;
      if (ratio >= 0.9)      { score += 5; reasons.push('Bons rendements cette saison'); }
      else if (ratio < 0.5)  { score -= 8; reasons.push('Rendements inferieurs aux previsions'); }
    }
  }

  // --- Aucune culture ---
  if (activeCrops.length === 0 && APP.beds.length > 0) {
    score -= 15; reasons.push('Aucune culture active en ce moment');
  }

  // Clamp
  score = Math.max(0, Math.min(100, score));

  // Niveau
  var level, color;
  if (score >= 80)      { level = 'Excellent'; color = '#2d6a4f'; }
  else if (score >= 60) { level = 'Bon';       color = '#52b788'; }
  else if (score >= 40) { level = 'Moyen';     color = '#e76f51'; }
  else                  { level = 'A ameliorer'; color = '#e63946'; }

  // Garder les 3 raisons les plus pertinentes
  if (reasons.length === 0) reasons.push('Tout semble en ordre');
  reasons = reasons.slice(0, 3);

  return { score: score, level: level, color: color, reasons: reasons };
}

// ---- 2. ALERTES INTELLIGENTES AVANCEES ----
function getSmartAlerts(weather) {
  var alerts = [];
  var today   = new Date();
  var todayM  = today.getMonth() + 1;
  var seasonCrops = APP.crops.filter(function(c) { return c.season === APP.currentSeason; });
  var activeCrops = seasonCrops.filter(function(c) { return c.status === 'active'; });

  // --- Meteo + sensibilites cultures ---
  if (weather && weather.current) {
    var temp   = weather.current.temperature_2m;
    var wind   = weather.current.wind_speed_10m;
    var precip = weather.current.precipitation;

    // Gel
    if (temp <= 2) {
      alerts.push({ id:'frost', type:'danger', icon:'🥶', priority:1,
        title:'Risque de gel (' + Math.round(temp) + '\u00B0C)',
        text:'Protegez les semis et cultures sensibles ce soir.',
        source:'weather' });
    }

    // Cultures sensibles + vent
    if (wind > 35) {
      var sensWind = activeCrops.filter(function(c) {
        var v = APP.vegetables[c.veggieId];
        return v && v.sensitivity && v.sensitivity.wind >= 7;
      });
      if (sensWind.length > 0) {
        var noms = sensWind.slice(0,2).map(function(c){ return APP.vegetables[c.veggieId].name; }).join(', ');
        alerts.push({ id:'wind', type:'warning', icon:'💨', priority:2,
          title:'Vent fort \u2014 cultures fragiles',
          text:noms + ' sont sensibles. Verifiez les tuteurs.',
          source:'weather' });
      }
    }

    // Chaleur + cultures sensibles
    if (temp >= 32) {
      var sensHeat = activeCrops.filter(function(c) {
        var v = APP.vegetables[c.veggieId];
        return v && v.sensitivity && v.sensitivity.hot >= 7;
      });
      if (sensHeat.length > 0) {
        var nomsH = sensHeat.slice(0,2).map(function(c){ return APP.vegetables[c.veggieId].name; }).join(', ');
        alerts.push({ id:'heat', type:'warning', icon:'🔥', priority:2,
          title:'Forte chaleur (' + Math.round(temp) + '\u00B0C)',
          text:nomsH + ' souffrent de la chaleur. Arrosez tot le matin.',
          source:'weather' });
      }
    }

    // Pluie + recoltes proches
    if (precip > 5) {
      var prochesRecolte = activeCrops.filter(function(c) {
        if (!c.dateHarvest) return false;
        return Math.floor((new Date(c.dateHarvest) - today) / 86400000) <= 3;
      });
      if (prochesRecolte.length > 0) {
        var nomsP = prochesRecolte.slice(0,2).map(function(c){ return APP.vegetables[c.veggieId] ? APP.vegetables[c.veggieId].name : ''; }).filter(Boolean).join(', ');
        alerts.push({ id:'rain-harvest', type:'warning', icon:'🌧️', priority:2,
          title:'Pluie \u2014 recoltez avant qu\'il soit trop tard',
          text:nomsP + ' arrivent a maturite. Recoltez avant les pluies si possible.',
          source:'weather' });
      }
    }
  }

  // --- Recoltes en retard ---
  var enRetard = activeCrops.filter(function(c) {
    if (!c.dateHarvest) return false;
    return Math.floor((today - new Date(c.dateHarvest)) / 86400000) > 5;
  });
  if (enRetard.length > 0) {
    var nomsR = enRetard.slice(0,2).map(function(c){ return APP.vegetables[c.veggieId] ? APP.vegetables[c.veggieId].icon + ' ' + APP.vegetables[c.veggieId].name : ''; }).filter(Boolean).join(', ');
    alerts.push({ id:'overdue', type:'danger', icon:'⏰', priority:1,
      title:enRetard.length + ' recolte' + (enRetard.length > 1 ? 's' : '') + ' en retard',
      text:nomsR + ' auraient du etre recoltees. Verifiez leur etat.',
      source:'planning' });
  }

  // (occupation élevée = bonne gestion — pas d'alerte surcharge)

  // --- Rotation mauvaise ---
  APP.beds.forEach(function(bed) {
    var r = getRotationScore(bed);
    if (r.score === 'bad') {
      alerts.push({ id:'rot-' + bed.id, type:'warning', icon:'🔄', priority:3,
        title:'Rotation problematique \u2014 ' + escH(bed.name),
        text:r.repeated + ' familles repetees depuis la saison precedente.',
        source:'rotation' });
    }
  });

  // --- Culture active sans bac ---
  var sansBac = activeCrops.filter(function(c) { return !c.bedId; });
  if (sansBac.length > 0) {
    alerts.push({ id:'nobeds', type:'info', icon:'📍', priority:4,
      title:sansBac.length + ' culture' + (sansBac.length > 1 ? 's' : '') + ' sans espace de culture',
      text:'Assignez un espace de culture pour un meilleur suivi de l\'occupation.',
      source:'occupancy' });
  }

  // --- Suggestion positive si tout va bien ---
  if (alerts.length === 0) {
    alerts.push({ id:'ok', type:'success', icon:'✅', priority:10,
      title:'Jardin en bonne santé',
      text:'Aucune alerte en cours. Continuez comme ca !',
      source:'global' });
  }

  // Trier par priorite et garder les 3 premieres
  alerts.sort(function(a, b) { return (a.priority || 9) - (b.priority || 9); });
  return alerts.slice(0, 3);
}

// ---- 3. RECOMMANDATIONS ACTIONNABLES ----
function getSmartRecommendations(weather) {
  var recos = [];
  var today  = new Date();
  var todayM = today.getMonth() + 1;
  var seasonCrops  = APP.crops.filter(function(c) { return c.season === APP.currentSeason; });
  var activeCrops  = seasonCrops.filter(function(c) { return c.status === 'active'; });

  // 1. Recolte urgente
  var prets = activeCrops.filter(function(c) { return getCropStage(c) === 'harvest'; });
  if (prets.length > 0) {
    var v = APP.vegetables[prets[0].veggieId];
    recos.push({ id:'harvest', icon: v ? v.icon : '🎉', priority:1,
      title:'Recolter ' + (v ? v.name : 'culture') + (prets.length > 1 ? ' (+ ' + (prets.length-1) + ' autre' + (prets.length > 2 ? 's' : '') + ')' : ''),
      text:'Pret' + (prets.length > 1 ? 's' : '') + ' a recolter. Agissez avant que la qualite baisse.',
      actionType:'navigate', actionTarget:'crops', priority:1 });
  }

  // 2. Recolte dans les 48h
  var imminent = activeCrops.filter(function(c) {
    if (!c.dateHarvest || getCropStage(c) === 'harvest') return false;
    var diff = Math.floor((new Date(c.dateHarvest) - today) / 86400000);
    return diff >= 0 && diff <= 2;
  });
  if (imminent.length > 0 && recos.length < 3) {
    var vi = APP.vegetables[imminent[0].veggieId];
    recos.push({ id:'imminent', icon: vi ? vi.icon : '⏰', priority:2,
      title:'Recolte imminente \u2014 ' + (vi ? vi.name : 'culture'),
      text:'Dans moins de 2 jours. Verifiez la maturite.',
      actionType:'navigate', actionTarget:'crops', priority:2 });
  }

  // 3. Arrosage recommande (chaud + sec)
  if (weather && weather.current) {
    var temp = weather.current.temperature_2m, precip = weather.current.precipitation;
    if (temp >= 22 && precip < 1 && activeCrops.length > 0) {
      var cibles = activeCrops.slice(0,2).map(function(c){
        var v = APP.vegetables[c.veggieId]; return v ? v.icon + ' ' + v.name : '';
      }).filter(Boolean).join(', ');
      recos.push({ id:'water', icon:'💧', priority:3,
        title:'Arroser ' + (cibles || 'vos cultures'),
        text:Math.round(temp) + '\u00B0C, pas de pluie. Arrosage recommande ' + (temp >= 28 ? 'maintenant' : 'ce soir') + '.',
        actionType:'navigate', actionTarget:'today', priority:3 });
    }
  }

  // 4. Planter quelque chose (suggestion intelligente)
  var suggestions = getSuggestedPlantings('1');
  if (suggestions.length > 0 && recos.length < 3) {
    var sug = suggestions[0];
    recos.push({ id:'plant', icon: sug.veggie.icon, priority:4,
      title:'Planter ' + sug.veggie.name + ' dans ' + escH(sug.bedName),
      text:sug.reason + ' \u2014 ' + sug.available.toFixed(1) + ' m\u00B2 disponible.',
      actionType:'navigate', actionTarget:'planning', priority:4 });
  }

  // 5. Bac sous-exploite avec place
  if (recos.length < 3) {
    for (var bi = 0; bi < APP.beds.length; bi++) {
      var bed = APP.beds[bi];
      var occ = getBedOccupation(bed);
      if (occ < 30) {
        recos.push({ id:'underused-' + bed.id, icon:'🌱', priority:5,
          title:'Exploiter ' + escH(bed.name),
          text:'Seulement ' + occ + '% occupe. Ajoutez des cultures cette saison.',
          actionType:'navigate', actionTarget:'beds', priority:5 });
        break;
      }
    }
  }

  // Trier et retourner
  recos.sort(function(a, b) { return (a.priority || 9) - (b.priority || 9); });
  return recos.slice(0, 3);
}

// ---- RENDUS HTML des briques intelligentes ----

function buildScoreBlock(weather) {
  var result = getGardenHealthScore(weather);
  var score  = result.score;
  var color  = result.color;
  // SVG anneau : rayon 26, circonference ~163
  var r = 26, circ = 2 * Math.PI * r;
  var dash = (score / 100) * circ;
  var reasonsHTML = result.reasons.map(function(r) {
    return '<div class="dash-score-reason"><span>•</span><span>' + r + '</span></div>';
  }).join('');
  return '<div class="dash-score-card">' +
    '<div class="dash-score-ring">' +
      '<svg viewBox="0 0 64 64">' +
        '<circle cx="32" cy="32" r="' + r + '" fill="none" stroke="#f3f4f6" stroke-width="6"/>' +
        '<circle cx="32" cy="32" r="' + r + '" fill="none" stroke="' + color + '" stroke-width="6"' +
          ' stroke-dasharray="' + dash.toFixed(1) + ' ' + circ.toFixed(1) + '"' +
          ' stroke-linecap="round" transform="rotate(-90 32 32)"/>' +
      '</svg>' +
      '<div class="dash-score-ring-num">' +
        '<span class="dash-score-ring-val" style="color:' + color + '">' + score + '</span>' +
        '<span class="dash-score-ring-max">/100</span>' +
      '</div>' +
    '</div>' +
    '<div class="dash-score-right">' +
      '<div class="dash-score-title">Sante du jardin</div>' +
      '<div class="dash-score-level" style="color:' + color + '">' + result.level + '</div>' +
      '<div class="dash-score-reasons">' + reasonsHTML + '</div>' +
    '</div>' +
  '</div>';
}

function buildSmartAlertsBlock(weather) {
  var alerts = getSmartAlerts(weather);
  return alerts.map(function(a) {
    return '<div class="dash-alert ' + a.type + '">' +
      '<div class="dash-alert-icon">' + a.icon + '</div>' +
      '<div class="dash-alert-body">' +
        '<div class="dash-alert-title">' + a.title + '</div>' +
        '<div class="dash-alert-text">' + a.text + '</div>' +
      '</div>' +
    '</div>';
  }).join('');
}

function buildRecoBlock(weather) {
  var recos = getSmartRecommendations(weather);
  if (recos.length === 0) return '';

  var main = recos[0];
  var actionFn = main.actionType === 'navigate'
    ? 'navigateFromPlus(\'' + main.actionTarget + '\')'
    : 'navigate(\'' + main.actionTarget + '\')';

  var secondaryHTML = '';
  if (recos.length > 1) {
    secondaryHTML = '<div class="dash-reco-secondary">';
    for (var i = 1; i < Math.min(recos.length, 3); i++) {
      var sec = recos[i];
      var secFn = sec.actionType === 'navigate'
        ? 'navigateFromPlus(\'' + sec.actionTarget + '\')'
        : 'navigate(\'' + sec.actionTarget + '\')';
      secondaryHTML +=
        '<div class="dash-reco-sec" onclick="' + secFn + '">' +
          '<div class="dash-reco-sec-icon">' + sec.icon + '</div>' +
          '<div class="dash-reco-sec-title">' + sec.title + '</div>' +
          '<div class="dash-reco-sec-text">' + sec.text + '</div>' +
        '</div>';
    }
    secondaryHTML += '</div>';
  }

  return '<div class="dash-reco">' +
    '<div class="dash-reco-label">Que faire maintenant ?</div>' +
    '<div class="dash-reco-title">' + main.icon + ' ' + main.title + '</div>' +
    '<div class="dash-reco-text">' + main.text + '</div>' +
    '<button class="dash-reco-btn" onclick="' + actionFn + '">Agir maintenant →</button>' +
  '</div>' + secondaryHTML;
}

// buildScoreBlock reste inchange (utilise getGardenHealthScore)
// buildScoreBlockV2 utilise computeEnhancedGardenScore si historique disponible
function buildScoreBlockV2(weather) {
  var data   = getMergedHarvestData();
  var result = data.length >= 4 ? computeEnhancedGardenScore(weather) : getGardenHealthScore(weather);
  var score  = result.score;
  var color  = result.color;
  var r = 26, circ = 2 * Math.PI * r;
  var dash = (score / 100) * circ;
  var reasonsHTML = result.reasons.map(function(txt) {
    return '<div class="dash-score-reason"><span>\u2022</span><span>' + txt + '</span></div>';
  }).join('');
  return '<div class="dash-score-card">' +
    '<div class="dash-score-ring">' +
      '<svg viewBox="0 0 64 64">' +
        '<circle cx="32" cy="32" r="' + r + '" fill="none" stroke="#f3f4f6" stroke-width="6"/>' +
        '<circle cx="32" cy="32" r="' + r + '" fill="none" stroke="' + color + '" stroke-width="6"' +
          ' stroke-dasharray="' + dash.toFixed(1) + ' ' + circ.toFixed(1) + '"' +
          ' stroke-linecap="round" transform="rotate(-90 32 32)"/>' +
      '</svg>' +
      '<div class="dash-score-ring-num">' +
        '<span class="dash-score-ring-val" style="color:' + color + '">' + score + '</span>' +
        '<span class="dash-score-ring-max">/100</span>' +
      '</div>' +
    '</div>' +
    '<div class="dash-score-right">' +
      '<div class="dash-score-title">Sante du jardin</div>' +
      '<div class="dash-score-level" style="color:' + color + '">' + result.level + '</div>' +
      '<div class="dash-score-reasons">' + reasonsHTML + '</div>' +
    '</div>' +
  '</div>';
}

// buildRecoBlockV2 : utilise getSmartRecommendationsV2 si historique dispo
function buildRecoBlockV2(weather) {
  var data  = getMergedHarvestData();
  var recos = data.length >= 2 ? getSmartRecommendationsV2(weather) : getSmartRecommendations(weather);
  if (recos.length === 0) return '';

  var main = recos[0];
  var actionFn = main.actionType === 'navigate'
    ? 'navigateFromPlus(\'' + main.actionTarget + '\')'
    : 'navigate(\'' + main.actionTarget + '\')';

  var secondaryHTML = '';
  if (recos.length > 1) {
    secondaryHTML = '<div class="dash-reco-secondary">';
    for (var i = 1; i < Math.min(recos.length, 3); i++) {
      var sec   = recos[i];
      var secFn = sec.actionType === 'navigate'
        ? 'navigateFromPlus(\'' + sec.actionTarget + '\')'
        : 'navigate(\'' + sec.actionTarget + '\')';
      secondaryHTML +=
        '<div class="dash-reco-sec" onclick="' + secFn + '">' +
          '<div class="dash-reco-sec-icon">' + sec.icon + '</div>' +
          '<div class="dash-reco-sec-title">' + sec.title + '</div>' +
          '<div class="dash-reco-sec-text">' + sec.text + '</div>' +
        '</div>';
    }
    secondaryHTML += '</div>';
  }

  return '<div class="dash-reco">' +
    '<div class="dash-reco-label">Que faire maintenant ?</div>' +
    '<div class="dash-reco-title">' + main.icon + ' ' + main.title + '</div>' +
    '<div class="dash-reco-text">' + main.text + '</div>' +
    '<button class="dash-reco-btn" onclick="' + actionFn + '">Agir maintenant \u2192</button>' +
  '</div>' + secondaryHTML;
}

// ============================================================
// DASHBOARD ==========
function getDashPhrase(weather) {
  if (!weather || !weather.current) return t('dash_phrase_welcome');
  var temp = weather.current.temperature_2m;
  var p = weather.current.precipitation;
  var w = weather.current.wind_speed_10m;
  var code = weather.current.weather_code;
  if (temp <= 2) return t('dash_phrase_frost');
  if (temp <= 8) return t('dash_phrase_cold');
  if (p > 8) return t('dash_phrase_heavy_rain');
  if (p > 2) return t('dash_phrase_rain');
  if (w > 40) return t('dash_phrase_wind');
  if (temp >= 34) return t('dash_phrase_heat');
  if (temp >= 26 && p < 1) return t('dash_phrase_warm');
  if (code === 0 && temp >= 16) return t('dash_phrase_ideal');
  if (code <= 3 && temp >= 14) return t('dash_phrase_plant');
  return t('dash_phrase_default');
}

function buildDashHero(weather) {
  if (!weather || !weather.current) {
    return '<div class="dash-hero" style="padding:20px;text-align:center;">' +
      '<div style="font-size:2rem;margin-bottom:6px;">📡</div>' +
      '<div style="opacity:0.8;font-size:0.9rem;">' + t('dash_no_weather') + '</div>' +
      '<div style="font-size:0.75rem;opacity:0.6;margin-top:4px;">' + escH(APP.location.name || 'Seysses') + '</div>' +
    '</div>';
  }

  var c = weather.current;
  var emoji = getWeatherEmoji(c.weather_code);
  var desc = getWeatherDesc(c.weather_code);
  var phrase = getDashPhrase(weather);
  var alerts = getWeatherAlerts(weather);

  // Previsions 5 jours
  var forecastHTML = '';
  if (weather.daily) {
    for (var i = 1; i < Math.min(6, weather.daily.time.length); i++) {
      forecastHTML +=
        '<div class="dash-hero-fday">' +
          '<div class="dash-hero-fday-name">' + getDayName(weather.daily.time[i]) + '</div>' +
          '<div class="dash-hero-fday-icon">' + getWeatherEmoji(weather.daily.weather_code[i]) + '</div>' +
          '<div class="dash-hero-fday-max">' + Math.round(weather.daily.temperature_2m_max[i]) + '\u00B0</div>' +
          '<div class="dash-hero-fday-min">' + Math.round(weather.daily.temperature_2m_min[i]) + '\u00B0</div>' +
        '</div>';
    }
  }

  // Alertes dans le hero
  var alertsHTML = '';
  for (var ai = 0; ai < Math.min(alerts.length, 2); ai++) {
    var a = alerts[ai];
    alertsHTML += '<div class="dash-hero-alert' + (a.type === 'danger' ? ' danger' : '') + '">' +
      a.icon + ' ' + escH(a.text) +
    '</div>';
  }

  return '<div class="dash-hero">' +
    '<div class="dash-hero-top">' +
      '<div class="dash-hero-left">' +
        '<div class="dash-hero-loc">\uD83D\uDCCD ' + escH(APP.location.name || 'Seysses') + '</div>' +
        '<div class="dash-hero-temp">' + Math.round(c.temperature_2m) + '\u00B0</div>' +
        '<div class="dash-hero-desc">' + desc + '</div>' +
        '<div class="dash-hero-phrase">' + phrase + '</div>' +
      '</div>' +
      '<div class="dash-hero-right">' +
        '<div class="dash-hero-emoji">' + emoji + '</div>' +
      '</div>' +
    '</div>' +
    '<div class="dash-hero-details">' +
      '<div class="dash-hero-detail">💧 ' + c.relative_humidity_2m + '%</div>' +
      '<div class="dash-hero-detail">💨 ' + Math.round(c.wind_speed_10m) + ' km/h</div>' +
      '<div class="dash-hero-detail">🌧️ ' + c.precipitation + ' mm</div>' +
    '</div>' +
    alertsHTML +
    (forecastHTML ? '<div class="dash-hero-forecast">' + forecastHTML + '</div>' : '') +
  '</div>';
}

