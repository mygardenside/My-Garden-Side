// Green Vibes — modules/analysis.js
// Analyse et statistiques
// ========== ANALYSIS ==========
// ============================================================
// COMPARAISON INTER-SAISONS
// Utilise rebuildLearningMemory -> progressionHistory
// ============================================================
/**
 * Retourne l'evolution entre la saison courante et la precedente.
 * {
 *   hasPrevious, yieldDelta, perfDelta, trend,
 *   message, current, previous
 * }
 */
function getSeasonComparison() {
  var mem  = getLearningMemory();
  var prog = mem.progressionHistory; // [{season, count, totalReal, ratio}]
  if (!prog || prog.length < 2) {
    return { hasPrevious: false, message: t('ana_comp_need_more') };
  }
  var cur  = prog[prog.length - 1];
  var prev = prog[prog.length - 2];

  // Delta rendement total (kg)
  var yieldDelta = cur.totalReal - prev.totalReal;
  var yieldPct   = prev.totalReal > 0 ? Math.round((yieldDelta / prev.totalReal) * 100) : 0;

  // Delta ratio performance
  var perfDelta  = cur.ratio - prev.ratio;
  var perfPct    = Math.round(perfDelta * 100);

  // Tendance globale
  var trend;
  if (perfPct > 8)       trend = 'amelioration';
  else if (perfPct < -8) trend = 'regression';
  else                   trend = 'stagnation';

  // Phrase
  var messages = {
    amelioration: t('ana_comp_up').replace('{p}', '+' + perfPct),
    stagnation:   t('ana_comp_stable'),
    regression:   t('ana_comp_down').replace('{p}', perfPct)
  };

  return {
    hasPrevious: true,
    current:  { season: cur.season,  ratio: cur.ratio,  totalReal: cur.totalReal,  count: cur.count },
    previous: { season: prev.season, ratio: prev.ratio, totalReal: prev.totalReal, count: prev.count },
    yieldDelta: yieldDelta, yieldPct: yieldPct,
    perfDelta: perfDelta,   perfPct: perfPct,
    trend: trend, message: messages[trend]
  };
}

// ============================================================
// RECOMMANDATIONS ACTIONNABLES
// Etend getActionableInsights avec actionLabel + payload
// ============================================================
/**
 * Retourne des recommandations avec bouton d'action integre.
 * Chaque objet : { id, icon, title, text, actionLabel, actionType, payload, priority }
 */
function getActionableRecommendations() {
  var mem      = getLearningMemory();
  var vegP     = mem.vegetableProfiles;
  var bedP     = mem.bedProfiles;
  var recos    = [];
  var today    = new Date();
  var todayM   = today.getMonth() + 1;

  // 1. Legumes fiables -> planter plus
  Object.keys(vegP).forEach(function(vid) {
    var p = vegP[vid]; if (p.count < 2 || p.avgRatio < 0.82) return;
    var veg = getAppState('vegetables')[vid]; if (!veg) return;
    var cal = typeof GeoCalendar !== 'undefined' ? GeoCalendar.getCalendarForVeggie(veg) : getPlantingCalendarForVeggie(veg);
    var isNow = cal && cal.plantMonths && cal.plantMonths.indexOf(todayM) >= 0;
    // Trouver le meilleur bac disponible
    var bestBed = null;
    getAppState('beds').forEach(function(b) {
      if (getBedAvailableSpace(b, false) >= veg.spacePerPlant) {
        if (!bestBed || getBedAvailableSpace(b, false) > getBedAvailableSpace(bestBed, false)) bestBed = b;
      }
    });
    recos.push({
      id: 'plant-more-' + vid, icon: p.icon, priority: isNow ? 1 : 3,
      title: t('ana_reco_plant_more').replace('{name}', tVeg(p.name)),
      text: (isNow ? t('ana_reco_plant_text_now') : t('ana_reco_plant_text')).replace('{pct}', Math.round(p.avgRatio * 100)),
      actionLabel: isNow ? t('ana_reco_plan') : t('ana_reco_see_planning'),
      actionType: 'plan_crop',
      payload: { veggieId: vid, veggieName: p.name, bedId: bestBed ? bestBed.id : null }
    });
  });

  // (occupation >= 90% = bonne chose — pas d'alerte surcharge)

  // 3. Legumes en difficulte -> revoir strategie
  Object.keys(vegP).forEach(function(vid) {
    var p = vegP[vid]; if (p.count < 2 || p.avgRatio >= 0.55) return;
    recos.push({
      id: 'reduce-density-' + vid, icon: p.icon, priority: 4,
      title: t('ana_reco_reduce').replace('{name}', tVeg(p.name)),
      text: t('ana_reco_reduce_text').replace('{pct}', Math.round(p.avgRatio * 100)),
      actionLabel: t('ana_reco_see_crops'),
      actionType: 'show_analysis',
      payload: { veggieId: vid }
    });
  });

  // 4. Bacs sous-utilises -> exploiter
  getAppState('beds').forEach(function(bed) {
    var occ = getBedOccupation(bed);
    if (occ < 30) {
      var sugs = getSuggestedPlantings('1').filter(function(s){ return s.bedId === bed.id; });
      var sug  = sugs[0];
      recos.push({
        id: 'underused-' + bed.id, icon: '🌱', priority: sug ? 2 : 5,
        title: t('ana_reco_exploit').replace('{name}', escH(bed.name)).replace('{pct}', occ),
        text: sug ? t('ana_reco_suggest_plant').replace('{name}', tVeg(sug.veggie.name)).replace('{reason}', sug.reason) : t('ana_reco_space_available'),
        actionLabel: sug ? t('ana_reco_add') : t('ana_reco_see_zone'),
        actionType: sug ? 'quick_add' : 'open_bed',
        payload: sug ? { veggieId: sug.veggieId, bedId: bed.id } : { bedId: bed.id }
      });
    }
  });

  // 5. Recoltes en retard -> agir
  var overdue = getAppState('crops').filter(function(c) {
    if (c.status !== 'active' || !c.dateHarvest) return false;
    return Math.floor((today - new Date(c.dateHarvest)) / 86400000) > 5;
  });
  if (overdue.length > 0) {
    var v = getAppState('vegetables')[overdue[0].veggieId];
    recos.push({
      id: 'harvest-overdue', icon: '⏰', priority: 1,
      title: t('ana_reco_harvest_late').replace('{name}', v ? tVeg(v.name) : t('lbl_crop')),
      text: t('ana_reco_harvest_late_text').replace('{n}', overdue.length).replace('{s}', overdue.length > 1 ? 's' : ''),
      actionLabel: t('ana_reco_harvest_btn'),
      actionType: 'quick_add',
      payload: { cropId: overdue[0].id, action: 'harvest' }
    });
  }

  recos.sort(function(a, b) { return (a.priority || 9) - (b.priority || 9); });
  return recos.slice(0, 5);
}

// ============================================================
// SYSTEME D'ACTION CENTRAL
// executeSmartAction(action) — selon actionType, fait l'action

// ============================================================
// BADGES / SUCCES
// getUserAchievements() — retourne les badges avec etat
// ============================================================
/**
 * Calcule et retourne tous les badges avec leur etat.
 * { id, icon, title, unlocked, progress, progressText }
 */
function getUserAchievements() {
  var mem  = getLearningMemory();
  var gs   = mem.globalStats;
  var vegP = mem.vegetableProfiles;
  var prog = mem.progressionHistory;

  var total     = gs.totalHarvests || 0;
  var avgRatio  = gs.avgRatio || 0;
  var diversity = gs.familyDiversity || 0;
  var nbSeasons = gs.seasonsWithData || 0;

  // Meilleur ratio sur un legume
  var bestRatio = 0;
  Object.keys(vegP).forEach(function(vid) {
    if (vegP[vid].avgRatio > bestRatio) bestRatio = vegP[vid].avgRatio;
  });

  // Nombre de bacs avec recolte
  var bedsUsed = Object.keys(mem.bedProfiles).filter(function(bid){ return (mem.bedProfiles[bid].count||0) >= 1; }).length;

  // Progression positive sur 2 saisons
  var hasProg = prog.length >= 2 && prog[prog.length-1].ratio > prog[prog.length-2].ratio;

  var badges = [
    {
      id: 'first_harvest', icon: '🎉', title: t('badge_first_harvest'),
      unlocked: total >= 1,
      progress: Math.min(1, total), progressText: total + '/1 ' + t('lbl_crop')
    },
    {
      id: 'yield_80', icon: '🏆', title: t('badge_yield_80'),
      unlocked: avgRatio >= 0.80,
      progress: Math.min(1, avgRatio / 0.80), progressText: Math.round(avgRatio*100) + '/80%'
    },
    {
      id: 'three_harvests', icon: '🌿', title: t('badge_three_harvests'),
      unlocked: total >= 3,
      progress: Math.min(1, total / 3), progressText: total + '/3 ' + t('lbl_crop_s')
    },
    {
      id: 'diversity', icon: '🌈', title: t('badge_diversity'),
      unlocked: diversity >= 3,
      progress: Math.min(1, diversity / 3), progressText: diversity + '/3'
    },
    {
      id: 'three_seasons', icon: '📅', title: t('badge_three_seasons'),
      unlocked: nbSeasons >= 3,
      progress: Math.min(1, nbSeasons / 3), progressText: nbSeasons + '/3'
    },
    {
      id: 'multi_beds', icon: '🗂️', title: t('badge_multi_beds'),
      unlocked: bedsUsed >= 2,
      progress: Math.min(1, bedsUsed / 2), progressText: bedsUsed + '/2'
    },
    {
      id: 'progression', icon: '📈', title: t('badge_progression'),
      unlocked: hasProg,
      progress: hasProg ? 1 : (prog.length >= 1 ? 0.5 : 0), progressText: hasProg ? t('badge_unlocked') : t('badge_in_progress')
    },
    {
      id: 'expert_veg', icon: '⭐', title: t('badge_expert_veg'),
      unlocked: bestRatio >= 0.90,
      progress: Math.min(1, bestRatio / 0.90), progressText: Math.round(bestRatio*100) + '/90%'
    },
    {
      id: 'ten_harvests', icon: '🥇', title: t('badge_ten_harvests'),
      unlocked: total >= 10,
      progress: Math.min(1, total / 10), progressText: total + '/10'
    }
  ];

  return badges;
}

// ============================================================
// RENDUS HTML DES 4 NOUVELLES SECTIONS ANALYSE
// ============================================================

/** Section 1 : Progression du jardinier */
function buildAnalysisProgressionSection() {
  var prof = getUserProgressionProfile();
  var levels = {
    debutant:      { icon:'🌱', color:'#6b7280', label:t('level_debutant') },
    apprenti:      { icon:'🌿', color:'#52b788', label:t('level_apprenti') },
    intermediaire: { icon:'🥬', color:'#2d6a4f', label:t('level_intermediaire') },
    avance:        { icon:'🌻', color:'#f97316', label:t('level_avance') },
    expert:        { icon:'⭐', color:'#7c3aed', label:t('level_expert') }
  };
  var lv = levels[prof.level] || levels.debutant;
  var deltaClass = prof.delta > 0 ? 'up' : prof.delta < 0 ? 'down' : 'flat';
  var deltaStr   = prof.delta > 0 ? t('ana_score_up').replace('{d}', prof.delta) : prof.delta < 0 ? t('ana_score_down').replace('{d}', prof.delta) : t('ana_score_stable');

  var tagsHTML = '';
  prof.strengths.slice(0,2).forEach(function(s) {
    tagsHTML += '<span class="ana-prog-tag strength">\u2713 ' + s + '</span>';
  });
  prof.weaknesses.slice(0,1).forEach(function(w) {
    tagsHTML += '<span class="ana-prog-tag weakness">\u26A0 ' + w + '</span>';
  });

  return '<div class="section-title">🎯 ' + t('ana_section_progression') + '</div>' +
    '<div class="ana-prog-card">' +
      '<div class="ana-prog-header">' +
        '<div>' +
          '<div class="ana-prog-level-badge">' + lv.label + '</div>' +
          '<div class="ana-prog-score">' + prof.score + '<span style="font-size:1rem;opacity:0.7;">/100</span></div>' +
          '<div class="ana-prog-delta ' + deltaClass + '">' + deltaStr + '</div>' +
        '</div>' +
        '<div class="ana-prog-icon-wrap">' + lv.icon + '</div>' +
      '</div>' +
      '<div class="ana-prog-bar-track">' +
        '<div class="ana-prog-bar-fill" style="width:' + prof.score + '%"></div>' +
      '</div>' +
      '<div class="ana-prog-tags">' + tagsHTML + '</div>' +
    '</div>';
}

/** Section 2 : Comparaison saisons */
function buildAnalysisSeasonComparisonSection() {
  var comp = getSeasonComparison();
  if (!comp.hasPrevious) {
    return '<div class="section-title">📅 ' + t('ana_section_seasons') + '</div>' +
      '<div class="card" style="color:var(--text-light);font-size:0.85rem;text-align:center;padding:20px;">' +
      comp.message + '</div>';
  }

  var mem  = getLearningMemory();
  var prog = mem.progressionHistory;
  var maxR = Math.max.apply(null, prog.map(function(s){ return s.totalReal; })) || 1;

  var barsHTML = '';
  prog.forEach(function(s) {
    var pct   = Math.min(100, Math.round((s.totalReal / maxR) * 100));
    var color = s.ratio >= 0.8 ? 'var(--green-500)' : s.ratio >= 0.55 ? 'var(--orange)' : 'var(--red)';
    barsHTML += '<div class="ana-season-row">' +
      '<div class="ana-season-label">' + s.season + '</div>' +
      '<div class="ana-season-bar"><div class="ana-season-fill" style="width:' + pct + '%;background:' + color + '"></div></div>' +
      '<div class="ana-season-val" style="color:' + color + '">' + s.totalReal.toFixed(1) + 'kg</div>' +
    '</div>';
  });

  var deltaClass = comp.trend === 'amelioration' ? '' : comp.trend === 'regression' ? 'warning' : 'neutral';
  var deltaIcon  = comp.trend === 'amelioration' ? '↗' : comp.trend === 'regression' ? '↘' : '→';

  return '<div class="section-title">📅 ' + t('ana_section_seasons') + '</div>' +
    '<div class="ana-season-card">' +
      barsHTML +
      '<div class="ana-season-delta ' + deltaClass + '">' +
        '<span>' + deltaIcon + '</span>' +
        '<span>' + comp.message + '</span>' +
      '</div>' +
    '</div>';
}

/** Section 3 : Actions recommandees avec boutons */
function buildAnalysisActionsSection() {
  var recos = getActionableRecommendations();
  if (recos.length === 0) {
    return '<div class="section-title">⚡ ' + t('ana_section_actions') + '</div>' +
      '<div class="card" style="color:var(--text-light);text-align:center;padding:16px;font-size:0.85rem;">' + t('ana_garden_perfect') + '</div>';
  }
  var html = '<div class="section-title">⚡ ' + t('ana_section_actions') + '</div>';
  recos.forEach(function(r) {
    var btnClass = r.priority <= 2 ? '' : r.priority === 3 ? 'secondary' : 'warning';
    var recoId = registerSmartAction({ actionType: r.actionType, payload: r.payload || {} });
    html += '<div class="ana-reco-card">' +
      '<div class="ana-reco-icon">' + r.icon + '</div>' +
      '<div class="ana-reco-body">' +
        '<div class="ana-reco-title">' + r.title + '</div>' +
        '<div class="ana-reco-text">' + r.text + '</div>' +
      '</div>' +
      '<button class="ana-reco-btn ' + btnClass + '" ' +
        'onclick="executeSmartActionById(\'' + recoId + '\')">' +
        r.actionLabel +
      '</button>' +
    '</div>';
  });
  return html;
}

/** Section 4 : Badges / Succes */
function buildAnalysisBadgesSection() {
  var badges = getUserAchievements();
  var html   = '<div class="section-title">🏅 ' + t('ana_section_badges') + '</div>' +
    '<div class="ana-badges-grid">';
  badges.forEach(function(b) {
    var pctBar = Math.round(b.progress * 100);
    html += '<div class="ana-badge' + (b.unlocked ? '' : ' locked') + '">' +
      (b.unlocked ? '<div class="ana-badge-check">\u2713</div>' : '') +
      '<div class="ana-badge-icon">' + b.icon + '</div>' +
      '<div class="ana-badge-title">' + b.title + '</div>' +
      '<div class="ana-badge-prog">' + (b.unlocked ? t('badge_unlocked') : b.progressText) + '</div>' +
    '</div>';
  });
  html += '</div>';
  return html;
}

// ============================================================
// SAISON PRÉCÉDENTE
// ============================================================
function buildPreviousSeasonSection() {
  var seasons = APP.seasons.slice().sort();
  var prevSeason = null;
  for (var i = seasons.length - 1; i >= 0; i--) {
    if (seasons[i] !== APP.currentSeason) { prevSeason = seasons[i]; break; }
  }
  if (!prevSeason) return '';

  // Cultures de la saison précédente dans APP.crops
  var prevCrops = APP.crops.filter(function(c) { return c.season === prevSeason; });

  // Compléter avec les entrées d'historique orphelines (cultures supprimées)
  var history = typeof loadHistory === 'function' ? loadHistory() : [];
  var cropIds = prevCrops.map(function(c) { return c.id; });
  history.forEach(function(h) {
    if (h.season === prevSeason && cropIds.indexOf(h.cropId) < 0) {
      prevCrops.push({
        id: h.cropId, veggieId: h.vegetableId, bedId: h.bedId,
        season: h.season, status: 'harvested',
        datePlant: null, dateHarvest: h.date,
        yieldReal: h.realYield, _fromHistory: true
      });
      cropIds.push(h.cropId);
    }
  });

  if (prevCrops.length === 0) return '';

  var totalKg = prevCrops.reduce(function(s, c) { return s + (c.status === 'harvested' ? (c.yieldReal || 0) : 0); }, 0);
  var harvestedCount = prevCrops.filter(function(c) { return c.status === 'harvested'; }).length;

  var MONTHS_SHORT = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];

  var html = '<div class="section-title">' + t('ana_prev_season_title').replace('{year}', prevSeason) + '</div>';
  html += '<div class="card" style="padding:0;overflow:hidden;">';

  // Résumé
  html += '<div style="padding:10px 14px;border-bottom:1px solid var(--border);font-size:0.82rem;color:var(--text-light);">' +
    t('ana_prev_season_summary').replace('{n}', prevCrops.length).replace('{h}', harvestedCount).replace('{kg}', totalKg.toFixed(1)) +
    '</div>';

  // Frise chronologique
  html += '<div style="overflow-x:auto;">';

  // En-tête mois
  html += '<div class="frise-mois-header">' +
    '<div class="frise-mois-spacer"></div>' +
    '<div class="frise-mois-labels">';
  for (var mi = 0; mi < 12; mi++) {
    html += '<div class="frise-mois-label">' + MONTHS_SHORT[mi] + '</div>';
  }
  html += '</div></div>';

  // Trier par date de plantation
  var sorted = prevCrops.slice().sort(function(a, b) {
    return (a.datePlant || a.dateHarvest || '').localeCompare(b.datePlant || b.dateHarvest || '');
  });

  var yearStart = new Date(prevSeason + '-01-01').getTime();
  var yearEnd   = new Date(prevSeason + '-12-31').getTime();
  var yearSpan  = yearEnd - yearStart;

  for (var ci = 0; ci < sorted.length; ci++) {
    var c = sorted[ci];
    var v = APP.vegetables[c.veggieId];
    var bed = APP.beds.find(function(b) { return b.id === c.bedId; });
    if (!v) continue;

    var s = c.datePlant  ? new Date(c.datePlant).getTime()  : yearStart;
    var e = c.dateHarvest ? new Date(c.dateHarvest).getTime() : yearEnd;
    s = Math.max(yearStart, Math.min(yearEnd, s));
    e = Math.max(s, Math.min(yearEnd, e));

    var leftPct  = ((s - yearStart) / yearSpan * 100).toFixed(1);
    var widthPct = Math.max(1, ((e - s) / yearSpan * 100)).toFixed(1);
    var barColor = c.status === 'harvested' ? 'var(--brand-500)' : 'var(--orange)';
    var tooltip  = (c.datePlant || '?') + ' \u2192 ' + (c.dateHarvest || '?') +
      (c.status === 'harvested' && c.yieldReal ? ' \u00b7 ' + parseFloat(c.yieldReal).toFixed(1) + '\u00a0kg' : '');

    html += '<div class="frise-ligne">' +
      '<div class="frise-nom">' +
        '<span>' + vIcon(v, c.veggieId, 16) + '</span>' +
        '<span>' + escH(tVeg(v.name)) + '</span>' +
        (bed ? '<span class="frise-bac-label">' + escH(bed.name) + '</span>' : '') +
      '</div>' +
      '<div class="frise-track">' +
        '<div class="frise-barre" style="left:' + leftPct + '%;width:' + widthPct + '%;background:' + barColor + ';cursor:default;" title="' + escH(tooltip) + '"></div>' +
      '</div>' +
    '</div>';
  }

  // Légende
  html += '<div class="frise-legende" style="padding:8px 14px;">' +
    '<div class="frise-legende-item"><div class="frise-dot" style="background:var(--brand-500);"></div>' + t('plan_frise_leg_harvested') + '</div>' +
    '<div class="frise-legende-item"><div class="frise-dot" style="background:var(--orange);"></div>' + t('ana_prev_season_no_harvest') + '</div>' +
    '</div>';

  html += '</div></div>';
  return html;
}

// ============================================================
// FIN DES NOUVELLES FONCTIONS V18
// ============================================================
function renderAnalysis() {
  var el = document.getElementById('pageAnalysis');
  document.getElementById('headerTitle').textContent = t('nav_analysis');
  document.getElementById('fab').style.display = 'none';
  var seasonCrops = APP.crops.filter(function(c) { return c.season === APP.currentSeason; });
  var harvestedCrops = seasonCrops.filter(function(c) { return c.status === 'harvested'; });
  if (seasonCrops.length === 0) {
    el.innerHTML = '<div class="empty-state fade-in"><div class="empty-icon">📊</div><div class="empty-text">' + t('ana_empty').replace('\n','<br>') + '</div></div>';
    return;
  }
  // Yield by veggie
  var yieldByVeggie = {};
  for (var i = 0; i < seasonCrops.length; i++) {
    var c = seasonCrops[i];
    var v = APP.vegetables[c.veggieId];
    if (!v) continue;
    if (!yieldByVeggie[c.veggieId]) yieldByVeggie[c.veggieId] = { name: tVeg(v.name), icon: v.icon, estimated: 0, real: 0 };
    yieldByVeggie[c.veggieId].estimated += getCropEstimatedYield(c);
    if (c.status === 'harvested') yieldByVeggie[c.veggieId].real += (c.yieldReal || 0);
  }
  var maxYield = 1;
  var yKeys = Object.keys(yieldByVeggie);
  for (var yi = 0; yi < yKeys.length; yi++) {
    var yv = yieldByVeggie[yKeys[yi]];
    maxYield = Math.max(maxYield, yv.estimated, yv.real);
  }
  var yieldChartHTML = '<div class="card"><div class="chart-container">';
  var sortedVeggies = yKeys.map(function(k) { return yieldByVeggie[k]; }).sort(function(a, b) { return b.estimated - a.estimated; });
  for (var sv = 0; sv < sortedVeggies.length; sv++) {
    var vg = sortedVeggies[sv];
    var estPct = (vg.estimated / maxYield * 100).toFixed(0);
    var realPct = (vg.real / maxYield * 100).toFixed(0);
    yieldChartHTML += '<div class="bar-row"><div class="bar-label">' + vg.icon + ' ' + escH(vg.name) + '</div>' +
      '<div style="flex:1;"><div class="bar-track"><div class="bar-fill estimated" style="width:' + estPct + '%">' + vg.estimated.toFixed(1) + '</div></div>' +
      (vg.real > 0 ? '<div class="bar-track" style="margin-top:3px;"><div class="bar-fill real" style="width:' + realPct + '%">' + vg.real.toFixed(1) + '</div></div>' : '') +
      '</div></div>';
  }
  yieldChartHTML += '</div><div class="legend"><div class="legend-item"><div class="legend-dot" style="background:var(--green-300);"></div>' + t('ana_estimated') + '</div>' +
    '<div class="legend-item"><div class="legend-dot" style="background:var(--green-700);"></div>' + t('ana_real') + '</div></div></div>';
  // Top/Flop
  var topFlopHTML = '';
  if (harvestedCrops.length >= 2) {
    var perf = harvestedCrops.map(function(c) {
      var vp = APP.vegetables[c.veggieId];
      var est = getCropEstimatedYield(c);
      var ratio = est > 0 ? (c.yieldReal || 0) / est : 0;
      return { name: vp ? vp.icon + ' ' + tVeg(vp.name) : '?', ratio: ratio, real: c.yieldReal || 0 };
    }).sort(function(a, b) { return b.ratio - a.ratio; });
    var top = perf[0];
    var flop = perf[perf.length - 1];
    topFlopHTML = '<div class="section-title">🏆 ' + t('ana_section_top_flop') + '</div>' +
      '<div style="display:flex;gap:10px;">' +
      '<div class="card" style="flex:1;text-align:center;border-top:3px solid var(--green-500);">' +
      '<div style="font-size:0.75rem;color:var(--text-light);">' + t('ana_best') + '</div>' +
      '<div style="font-size:1.1rem;font-weight:700;margin:4px 0;">' + top.name + '</div>' +
      '<div style="font-size:0.85rem;color:var(--green-700);">' + (top.ratio * 100).toFixed(0) + '% ' + t('ana_pct_yield') + '</div></div>' +
      '<div class="card" style="flex:1;text-align:center;border-top:3px solid var(--red);">' +
      '<div style="font-size:0.75rem;color:var(--text-light);">' + t('ana_to_improve') + '</div>' +
      '<div style="font-size:1.1rem;font-weight:700;margin:4px 0;">' + flop.name + '</div>' +
      '<div style="font-size:0.85rem;color:var(--red);">' + (flop.ratio * 100).toFixed(0) + '% ' + t('ana_pct_yield') + '</div></div></div>';
  }
  // Surface analysis
  var surfaceHTML = '<div class="section-title">📐 ' + t('ana_section_surfaces') + '</div>';
  for (var bi = 0; bi < APP.beds.length; bi++) {
    var bed = APP.beds[bi];
    var bocc = getBedOccupation(bed);
    var bsurf = getBedSurface(bed);
    var bcls = bocc > 70 ? 'warn' : '';
    surfaceHTML += '<div class="card" style="padding:12px;">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;">' +
      '<span style="font-weight:600;">' + escH(bed.name) + '</span>' +
      '<span style="font-size:0.85rem;">' + bocc + '% (' + bsurf.toFixed(1) + ' m\u00B2)</span></div>' +
      '<div class="progress-bar" style="margin-top:6px;"><div class="progress-fill ' + bcls + '" style="width:' + bocc + '%"></div></div></div>';
  }
  // Smart tips
  var tipsHTML = '<div class="section-title">💡 ' + t('ana_section_tips') + '</div>';
  var tips = [];
  for (var tb = 0; tb < APP.beds.length; tb++) {
    var tbed = APP.beds[tb];
    var tocc = getBedOccupation(tbed);
    if (tocc < 30) tips.push({ text: t('tip_underused').replace('{name}', tbed.name).replace('{pct}', tocc), type: '' });
    var tr = getRotationScore(tbed);
    if (tr.score !== 'good') {
      var tfams = getBedFamilies(tbed.id).map(function(f){ return t('family_' + f); }).join(', ');
      tips.push({ text: t('tip_rotation').replace('{name}', tbed.name).replace('{fams}', tfams), type: 'bad' });
    }
  }
  // Low performers across seasons
  if (APP.seasons.length > 1) {
    var vkeys = Object.keys(APP.vegetables);
    for (var vk = 0; vk < vkeys.length; vk++) {
      var vid = vkeys[vk];
      var vinfo = APP.vegetables[vid];
      var allCr = APP.crops.filter(function(c) { return c.veggieId === vid && c.status === 'harvested'; });
      if (allCr.length >= 2) {
        var avgRatio = allCr.reduce(function(s, c) {
          var est = getCropEstimatedYield(c);
          return s + (est > 0 ? (c.yieldReal || 0) / est : 0);
        }, 0) / allCr.length;
        if (avgRatio < 0.5) tips.push({ text: t('tip_low_perf').replace('{icon}', vinfo.icon).replace('{name}', tVeg(vinfo.name)).replace('{n}', allCr.length).replace('{pct}', (avgRatio * 100).toFixed(0)), type: 'bad' });
      }
    }
  }
  // Space-greedy crops
  var activeC = seasonCrops.filter(function(c) { return c.status === 'active'; });
  for (var ac = 0; ac < activeC.length; ac++) {
    var acrop = activeC[ac];
    var av = APP.vegetables[acrop.veggieId];
    var abed = APP.beds.find(function(b) { return b.id === acrop.bedId; });
    if (av && abed) {
      var cSurf = getCropSurface(acrop);
      var bSurf = getBedSurface(abed);
      if (bSurf > 0 && cSurf / bSurf > 0.7) {
        tips.push({ text: t('tip_space_greedy').replace('{icon}', av.icon).replace('{name}', tVeg(av.name)).replace('{pct}', Math.round(cSurf / bSurf * 100)).replace('{bed}', abed.name), type: '' });
      }
    }
  }
  if (tips.length === 0) tips.push({ text: t('ana_all_good'), type: 'good' });
  for (var tp = 0; tp < tips.length; tp++) {
    tipsHTML += '<div class="tip-card ' + tips[tp].type + '">' + escH(tips[tp].text) + '</div>';
  }
  // Season comparison
  var compareHTML = '';
  if (APP.seasons.length > 1) {
    compareHTML = '<div class="section-title">📅 ' + t('ana_section_seasons') + '</div><div class="card">';
    for (var si = 0; si < APP.seasons.length; si++) {
      var seas = APP.seasons[si];
      var sc = APP.crops.filter(function(c) { return c.season === seas; });
      var harv = sc.filter(function(c) { return c.status === 'harvested'; });
      var totalY = harv.reduce(function(sum, c) { return sum + (c.yieldReal || 0); }, 0);
      compareHTML += '<div class="compare-row"><div class="compare-label">' + seas + '</div>' +
        '<div class="compare-val">' + sc.length + ' ' + t('ana_cultures') + '</div>' +
        '<div class="compare-val">' + totalY.toFixed(1) + ' kg</div></div>';
    }
    compareHTML += '</div>';
  }
  // Bed health scores
  var healthHTML = '';
  if (APP.beds.length > 0) {
    healthHTML = '<div class="section-title">❤️ ' + t('ana_section_health') + '</div>';
    for (var hi = 0; hi < APP.beds.length; hi++) {
      var hbed = APP.beds[hi];
      var hocc = getBedOccupation(hbed);
      var hrot = getRotationScore(hbed);
      var hscore = 100;
      if (hocc < 20 && getBedCrops(hbed.id).filter(function(c) { return c.status === 'active'; }).length === 0) hscore -= 10;
      if (hrot.score === 'warning') hscore -= 15;
      if (hrot.score === 'bad') hscore -= 30;
      hscore = Math.max(0, hscore);
      var hcolor = hscore >= 80 ? 'var(--green-500)' : hscore >= 50 ? 'var(--orange)' : 'var(--red)';
      healthHTML += '<div class="card" style="padding:12px;display:flex;justify-content:space-between;align-items:center;">' +
        '<span style="font-weight:600;">' + escH(hbed.name) + '</span>' +
        '<span style="font-size:1.2rem;font-weight:700;color:' + hcolor + ';">' + hscore + '/100</span></div>';
    }
  }
  // ---- ASSEMBLAGE hiérarchique : 5 sections ----

  el.innerHTML = '<div class="fade-in">' +

    // 1. Comparaison saisons
    buildAnalysisSeasonComparisonSection() +

    // 2. Prévisions
    buildPredictiveSection() +

    // 3. Performance légumes + bacs
    '<div class="section-title">\uD83D\uDCCA ' + t('ana_section_yield') + '</div>' +
    yieldChartHTML + topFlopHTML +
    surfaceHTML + healthHTML +

    // 4. Actions recommandées
    buildAnalysisActionsSection() +

    // Conseils et comparaisons (existants, en bas)
    tipsHTML + compareHTML +

    // 5. Saison précédente — frise chronologique
    buildPreviousSeasonSection() +

  '</div>';
}

// ========== PAGE AI DÉDIÉE ==========
function renderAi() {
  var el = document.getElementById('pageAi');
  document.getElementById('headerTitle').textContent = t('nav_ai');
  document.getElementById('fab').style.display = 'none';

  el.innerHTML = '<div class="fade-in">' +
    '<div class="section-title">\uD83E\uDDE0 ' + t('ana_section_ai') + '</div>' +
    buildLearningSection(getLearningInsightsV2()) +
    buildSmartSuggestionsHTML() +
  '</div>';
}
