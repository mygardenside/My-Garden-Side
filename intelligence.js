/**
 * Green Vibes — modules/intelligence.js
 * Couche d'intelligence métier isolée.
 *
 * Fonctions exposées :
 *   getCropHealthScore(crop)           — score santé individuel d'une culture
 *   getAllCropHealthScores()           — scores de toutes les cultures actives
 *   getSeasonAdvisor()                 — conseil saisonnier structuré
 *   getYieldOptimizationSuggestions() — suggestions d'optimisation rendement
 *   buildPredictiveRisksBlock(risks)  — rendu HTML (branchable plus tard)
 *   buildOpportunityBlock(opps)        — rendu HTML (branchable plus tard)
 *
 * Dépendances (toutes globales, déjà chargées) :
 *   APP, getCropStage, getCropEstimatedYield, getCropSurface,
 *   getBedOccupation, getBedSurface, getBedAvailableSpace,
 *   getBedFamilies, getRotationScore, getSuggestedPlantings,
 *   getLearningMemory, getPlantingCalendarForVeggie,
 *   getMonthLabel, escH
 *
 * N'importe quel module peut appeler ces fonctions.
 * Ne modifie PAS les modules existants.
 */

// ============================================================
// 1. SCORE SANTÉ PAR CULTURE
// ============================================================

/**
 * Calcule un score de santé (0-100) pour une culture individuelle.
 *
 * Critères :
 *   - Stade de croissance vs calendrier prévu (-20 si retard >14j)
 *   - Densité dans le bac (pénalité si bac >90%)
 *   - Tension météo (gel, chaleur, vent fort depuis APP.weather)
 *   - Proximité récolte (bonus si à 0-3j)
 *   - Retard de récolte (pénalité si dateHarvest dépassée >5j)
 *   - Historique apprentissage (malus si veggie <50% de perf historique)
 *
 * @param {Object} crop - culture depuis APP.crops
 * @returns {{ score:number, level:string, risks:string[], suggestions:string[] }}
 */
function getCropHealthScore(crop) {
  if (!crop) return { score: 0, level: 'danger', risks: [t('health_not_found')], suggestions: [] };

  var score       = 100;
  var risks       = [];
  var suggestions = [];
  var today       = new Date();
  var weather     = APP.weather || null;
  var veg         = APP.vegetables[crop.veggieId];
  var bed         = APP.beds.find(function(b) { return b.id === crop.bedId; });
  var stage       = getCropStage(crop);

  // ---- Culture récoltée ou planifiée — hors scope ----
  if (crop.status === 'harvested') {
    return { score: 100, level: 'good', risks: [], suggestions: [t('health_harvested_sug')] };
  }
  if (crop.status === 'planned') {
    return { score: 85, level: 'good', risks: [], suggestions: [t('health_planned_sug')] };
  }

  // ---- 1. Retard de récolte ----
  if (crop.dateHarvest) {
    var daysLate = Math.floor((today - new Date(crop.dateHarvest)) / 86400000);
    if (daysLate > 14) {
      score -= 30;
      risks.push(t('health_late_crit_risk').replace('{n}', daysLate));
      suggestions.push(t('health_late_crit_sug'));
    } else if (daysLate > 5) {
      score -= 15;
      risks.push(t('health_late_risk').replace('{n}', daysLate));
      suggestions.push(t('health_late_sug'));
    } else if (daysLate >= 0 && daysLate <= 3) {
      // Bonus proximité récolte — bon signe
      score += 5;
      suggestions.push(t('health_ready_sug'));
    }
  }

  // (occupation élevée = bonne gestion, pas de risque)

  // ---- 3. Tension météo (sur APP.weather.current) ----
  if (weather && weather.current) {
    var temp = weather.current.temperature_2m;
    var wind = weather.current.wind_speed_10m;
    var prec = weather.current.precipitation;

    // Gel
    if (temp <= 2) {
      var coldSens = (veg && veg.sensitivity && veg.sensitivity.cold) || 5;
      var malus    = Math.round(coldSens * 3);
      score -= malus;
      risks.push(t('health_frost_risk').replace('{temp}', Math.round(temp)).replace('{sens}', coldSens));
      suggestions.push(t('health_frost_sug'));
    } else if (temp <= 5) {
      score -= 5;
      risks.push(t('health_cold_risk').replace('{temp}', Math.round(temp)));
    }

    // Canicule
    if (temp >= 35) {
      var hotSens = (veg && veg.sensitivity && veg.sensitivity.hot) || 5;
      score -= Math.round(hotSens * 2);
      risks.push(t('health_heat_risk').replace('{temp}', Math.round(temp)).replace('{sens}', hotSens));
      suggestions.push(t('health_heat_sug'));
    } else if (temp >= 30) {
      score -= 5;
      suggestions.push(t('health_heat_mild_sug'));
    }

    // Vent fort
    if (wind > 50) {
      var windSens = (veg && veg.sensitivity && veg.sensitivity.wind) || 5;
      score -= Math.round(windSens * 2);
      risks.push(t('health_wind_risk').replace('{speed}', Math.round(wind)));
      suggestions.push(t('health_wind_sug'));
    }

    // Excès de pluie
    if (prec > 15) {
      var rainSens = (veg && veg.sensitivity && veg.sensitivity.rain) || 5;
      if (rainSens >= 7) {
        score -= 10;
        risks.push(t('health_rain_risk').replace('{mm}', prec));
        suggestions.push(t('health_rain_sug'));
      }
    }

    // Sécheresse
    if (temp >= 20 && prec < 1) {
      score -= 5;
      risks.push(t('health_dry_risk'));
      suggestions.push(t('health_dry_sug'));
    }
  }

  // ---- 4. Stade inattendu (retard de croissance) ----
  if (crop.datePlant && veg) {
    var daysPlanted = Math.floor((today - new Date(crop.datePlant)) / 86400000);
    var expected    = veg.daysToHarvest || 60;
    var ratio       = daysPlanted / expected;
    // Si 90% du temps écoulé mais pas encore en maturation
    if (ratio > 0.9 && stage === 'growing') {
      score -= 10;
      risks.push(t('health_slow_risk').replace('{pct}', Math.round(ratio * 100)));
      suggestions.push(t('health_slow_sug'));
    }
  }

  // ---- 5. Historique apprentissage ----
  if (veg) {
    var mem  = getLearningMemory();
    var prof = mem.vegetableProfiles[crop.veggieId];
    if (prof && prof.count >= 2) {
      if (prof.avgRatio < 0.5) {
        score -= 10;
        risks.push(t('health_poor_hist_risk').replace('{name}', escH(veg.name)).replace('{pct}', Math.round(prof.avgRatio * 100)));
        suggestions.push(t('health_poor_hist_sug'));
      } else if (prof.avgRatio >= 0.85) {
        score += 5; // Bonus culture fiable
      }
    }
  }

  // ---- Clamper entre 0 et 100 ----
  score = Math.max(0, Math.min(100, score));

  // ---- Niveau ----
  var level = score >= 75 ? 'good' : score >= 50 ? 'warning' : 'danger';

  // Suggestion par défaut si tout va bien
  if (risks.length === 0) {
    suggestions.push(t('health_ok_sug'));
  }

  return { score: score, level: level, risks: risks, suggestions: suggestions };
}

/**
 * Retourne les scores santé de toutes les cultures actives de la saison.
 * @returns {Array<{ crop, score, level, risks, suggestions }>}
 */
function getAllCropHealthScores() {
  return APP.crops
    .filter(function(c) { return c.season === APP.currentSeason && c.status === 'active'; })
    .map(function(c) {
      var result = getCropHealthScore(c);
      return Object.assign({ crop: c }, result);
    })
    .sort(function(a, b) { return a.score - b.score }); // Plus mauvais en premier
}


// ============================================================
// 2. CONSEILLER SAISONNIER
// ============================================================

/**
 * Analyse le mois courant + les données historiques pour produire
 * un conseil saisonnier structuré.
 *
 * @returns {{
 *   month: number,
 *   monthName: string,
 *   toLaunchSoon: Array,
 *   toAvoid: Array,
 *   bedsToPrep: Array,
 *   rotationAdvice: Array,
 *   monthOpportunities: Array
 * }}
 */
function getSeasonAdvisor() {
  var today    = new Date();
  var month    = today.getMonth() + 1;  // 1-12
  var nextM    = (month % 12) + 1;
  var mem      = getLearningMemory();
  var profiles = mem.vegetableProfiles;

  // ---- Cultures à lancer ce mois-ci ----
  var toLaunchSoon = [];
  Object.keys(APP.vegetables).forEach(function(vid) {
    var veg = APP.vegetables[vid];
    var cal = getPlantingCalendarForVeggie(veg);
    if (!cal || !cal.plantMonths) return;

    var inThisMonth = cal.plantMonths.indexOf(month) >= 0;
    var inNextMonth = cal.plantMonths.indexOf(nextM) >= 0;
    if (!inThisMonth && !inNextMonth) return;

    // Déjà planté cette saison ?
    var alreadyActive = APP.crops.some(function(c) {
      return c.veggieId === vid && c.season === APP.currentSeason && c.status !== 'harvested';
    });

    var prof      = profiles[vid];
    var histRatio = prof && prof.count >= 1 ? prof.avgRatio : null;

    toLaunchSoon.push({
      veggieId:    vid,
      name:        veg.name,
      icon:        veg.icon,
      timing:      inThisMonth ? t('intel_adv_timing_now') : t('intel_adv_timing_next'),
      alreadyDone: alreadyActive,
      histRatio:   histRatio,
      confidence:  prof ? prof.confidence : '',
      reason:      inThisMonth
        ? t('intel_adv_reason_now').replace('{name}', veg.name)
        : t('intel_adv_reason_next').replace('{name}', veg.name)
    });
  });
  // Trier : non planté + bon historique en premier
  toLaunchSoon.sort(function(a, b) {
    if (a.alreadyDone !== b.alreadyDone) return a.alreadyDone ? 1 : -1;
    return (b.histRatio || 0) - (a.histRatio || 0);
  });

  // ---- Cultures à éviter (faibles performances historiques EN saison) ----
  var toAvoid = [];
  Object.keys(profiles).forEach(function(vid) {
    var prof = profiles[vid]; if (prof.count < 2 || prof.avgRatio >= 0.55) return;
    var veg  = APP.vegetables[vid]; if (!veg) return;
    var cal  = getPlantingCalendarForVeggie(veg);
    var inSeason = cal && cal.plantMonths && cal.plantMonths.indexOf(month) >= 0;
    if (!inSeason) return;
    toAvoid.push({
      veggieId:  vid,
      name:      veg.name,
      icon:      veg.icon,
      histRatio: prof.avgRatio,
      reason:    t('intel_adv_toavoid').replace('{pct}', Math.round(prof.avgRatio * 100)).replace('{n}', prof.count)
    });
  });

  // ---- Bacs à préparer (rotation nécessaire ou sous-utilisés) ----
  var bedsToPrep = [];
  APP.beds.forEach(function(bed) {
    var rot = getRotationScore(bed);
    var occ = getBedOccupation(bed);
    if (rot.score === 'bad') {
      bedsToPrep.push({
        bedId:  bed.id,
        name:   bed.name,
        reason: t('intel_adv_prep_rotation'),
        action: t('intel_adv_prep_rotation_act')
      });
    } else if (occ < 20) {
      bedsToPrep.push({
        bedId:  bed.id,
        name:   bed.name,
        reason: t('intel_adv_prep_low').replace('{pct}', occ),
        action: t('intel_adv_prep_low_act')
      });
    }
  });

  // ---- Conseils de rotation par bac ----
  var rotationAdvice = [];
  APP.beds.forEach(function(bed) {
    var fams    = getBedFamilies(bed.id);
    var rot     = getRotationScore(bed);
    if (rot.score !== 'good' && fams.length > 0) {
      rotationAdvice.push({
        bedId:      bed.id,
        name:       bed.name,
        families:   fams,
        scoreLabel: rot.score === 'bad' ? t('intel_adv_rot_crit') : t('intel_adv_rot_warn'),
        tip:        t('intel_adv_rot_tip').replace('{fams}', fams.map(function(f){ return t('family_' + f); }).join(', ')).replace('{bed}', bed.name)
      });
    }
  });

  // ---- Opportunités du mois ----
  var monthOpportunities = toLaunchSoon
    .filter(function(l) { return !l.alreadyDone && l.timing === 'maintenant'; })
    .slice(0, 4)
    .map(function(l) {
      return {
        veggieId: l.veggieId,
        title:    l.icon + ' ' + l.name,
        text:     l.reason + (l.histRatio !== null ? t('intel_adv_opp_hist').replace('{pct}', Math.round(l.histRatio * 100)) : ''),
        priority: l.histRatio !== null && l.histRatio >= 0.80 ? 'high' : 'medium'
      };
    });

  return {
    month:              month,
    monthName:          getMonthLabel(month),
    toLaunchSoon:       toLaunchSoon.slice(0, 6),
    toAvoid:            toAvoid.slice(0, 4),
    bedsToPrep:         bedsToPrep,
    rotationAdvice:     rotationAdvice,
    monthOpportunities: monthOpportunities
  };
}


// ============================================================
// 3. OPTIMISATION RENDEMENT
// ============================================================

/**
 * Génère des suggestions concrètes pour améliorer le rendement global.
 *
 * Analyse :
 *   - Densité optimale par culture (spacePer vs espace disponible)
 *   - Meilleur bac pour chaque type de légume (selon historique)
 *   - Surcharges corrigeables
 *   - Mauvais placements détectables
 *
 * @returns {Array<{ id, type, title, text, impact, bedId, veggieId }>}
 */
function getYieldOptimizationSuggestions() {
  var suggestions = [];
  var mem         = getLearningMemory();
  var bedProfiles = mem.bedProfiles;
  var vegProfiles = mem.vegetableProfiles;
  var today       = new Date();
  var todayM      = today.getMonth() + 1;
  var seasonCrops = APP.crops.filter(function(c) { return c.season === APP.currentSeason; });

  // ---- 1. Densité : cultures trop denses vs surface disponible ----
  seasonCrops.filter(function(c) { return c.status === 'active'; }).forEach(function(c) {
    var veg  = APP.vegetables[c.veggieId]; if (!veg) return;
    var bed  = APP.beds.find(function(b) { return b.id === c.bedId; }); if (!bed) return;
    var surf = getCropSurface(c);
    var bsurf= getBedSurface(bed);
    if (bsurf > 0 && surf / bsurf > 0.75) {
      suggestions.push({
        id:       'density-' + c.id,
        type:     'density',
        title:    t('intel_opt_density_title').replace('{name}', escH(veg.name)).replace('{pct}', Math.round(surf / bsurf * 100)).replace('{bed}', escH(bed.name)),
        text:     t('intel_opt_density_text'),
        impact:   'medium',
        bedId:    bed.id,
        veggieId: c.veggieId
      });
    }
  });

  // ---- 2. Meilleur bac par légume (selon historique) ----
  Object.keys(vegProfiles).forEach(function(vid) {
    var vp = vegProfiles[vid]; if (vp.count < 2) return;
    var bestBedId = null, bestRatio = 0;
    Object.keys(bedProfiles).forEach(function(bid) {
      var bp = bedProfiles[bid];
      if (bp.yieldHistory && bp.yieldHistory[vid]) {
        var r = bp.yieldHistory[vid].avgRatio;
        if (r > bestRatio) { bestRatio = r; bestBedId = bid; }
      }
    });
    if (!bestBedId) return;

    // Est-ce que cette culture est actuellement dans son meilleur bac ?
    var activeCropsOfType = seasonCrops.filter(function(c) {
      return c.veggieId === vid && c.status === 'active';
    });
    activeCropsOfType.forEach(function(c) {
      if (c.bedId !== bestBedId) {
        var veg     = APP.vegetables[vid];
        var bestBed = APP.beds.find(function(b) { return b.id === bestBedId; });
        if (!veg || !bestBed) return;
        suggestions.push({
          id:       'best-bed-' + vid + '-' + c.id,
          type:     'placement',
          title:    t('intel_opt_placement_title').replace('{name}', escH(veg.name)).replace('{bed}', escH(bestBed.name)),
          text:     t('intel_opt_placement_text').replace('{pct}', Math.round(bestRatio * 100)).replace('{bed}', escH(bestBed.name)),
          impact:   'high',
          bedId:    bestBedId,
          veggieId: vid
        });
      }
    });
  });

  // ---- 3. Meilleure période manquée ----
  Object.keys(vegProfiles).forEach(function(vid) {
    var vp = vegProfiles[vid]; if (vp.count < 2 || vp.avgRatio < 0.80) return;
    var veg = APP.vegetables[vid]; if (!veg) return;
    var cal = getPlantingCalendarForVeggie(veg);
    if (!cal || !cal.plantMonths) return;
    var isPeriod = cal.plantMonths.indexOf(todayM) >= 0;
    var alreadyPlanted = seasonCrops.some(function(c) {
      return c.veggieId === vid && c.status !== 'harvested';
    });
    if (isPeriod && !alreadyPlanted) {
      suggestions.push({
        id:       'missed-window-' + vid,
        type:     'timing',
        title:    t('intel_opt_timing_title').replace('{name}', escH(veg.name)),
        text:     t('intel_opt_timing_text').replace('{pct}', Math.round(vp.avgRatio * 100)),
        impact:   'high',
        bedId:    null,
        veggieId: vid
      });
    }
  });

  // Déduplication et tri par impact
  var seen = {};
  suggestions = suggestions.filter(function(s) {
    if (seen[s.id]) return false;
    seen[s.id] = true;
    return true;
  });
  var impactOrder = { high: 0, medium: 1, low: 2 };
  suggestions.sort(function(a, b) {
    return (impactOrder[a.impact] || 1) - (impactOrder[b.impact] || 1);
  });

  return suggestions;
}


// ============================================================
// 4. RENDUS HTML LÉGERS (branchables ultérieurement)
// ============================================================

/**
 * Construit un bloc HTML pour les scores santé des cultures.
 * Branchable dans renderAnalysis() ou renderCrops() sans modifier l'existant.
 */
function buildCropHealthBlock() {
  var scores = getAllCropHealthScores();
  if (scores.length === 0) {
    return '<div class="section-title">\uD83C\uDF31 ' + t('intel_health_section') + '</div>' +
      '<div class="card" style="color:var(--text-light);text-align:center;padding:14px;font-size:0.85rem;">' + t('intel_health_empty') + '</div>';
  }

  var html = '<div class="section-title">\uD83C\uDF31 ' + t('intel_health_section') + '</div>';
  var colors = { good: 'var(--green-500)', warning: 'var(--orange)', danger: 'var(--red)' };
  var icons  = { good: '✓', warning: '⚠', danger: '✗' };

  scores.forEach(function(item) {
    var veg  = APP.vegetables[item.crop.veggieId];
    var bed  = APP.beds.find(function(b) { return b.id === item.crop.bedId; });
    var col  = colors[item.level] || 'var(--text-light)';

    html += '<div class="card" style="padding:12px 14px;margin-bottom:6px;">' +
      '<div style="display:flex;align-items:center;gap:10px;">' +
        '<div style="line-height:1;">' + (veg ? vIcon(veg, item.crop.veggieId, 28) : '🌱') + '</div>' +
        '<div style="flex:1;">' +
          '<div style="font-size:0.85rem;font-weight:600;">' + (veg ? escH(veg.name) : '?') +
            (bed ? ' <span style="font-size:0.72rem;color:var(--text-light);">· ' + escH(bed.name) + '</span>' : '') +
          '</div>' +
          (item.risks.length > 0
            ? '<div style="font-size:0.72rem;color:' + col + ';margin-top:2px;">' + escH(item.risks[0]) + '</div>'
            : '') +
        '</div>' +
        '<div style="text-align:right;">' +
          '<div style="font-size:1.1rem;font-weight:700;color:' + col + ';">' + item.score + '</div>' +
          '<div style="font-size:0.65rem;color:var(--text-light);">/ 100</div>' +
        '</div>' +
      '</div>' +
      (item.suggestions.length > 0
        ? '<div style="font-size:0.73rem;color:var(--text-light);margin-top:6px;padding-top:6px;border-top:1px solid #f3f4f6;">' +
          '💡 ' + escH(item.suggestions[0]) + '</div>'
        : '') +
    '</div>';
  });

  return html;
}

/**
 * Construit un bloc HTML pour les risques prédictifs.
 * @param {Array} risks - depuis getPredictiveRisks()
 */
function buildPredictiveRisksBlock(risks) {
  if (!risks || risks.length === 0) {
    return '<div class="section-title">\uD83D\uDEA8 ' + t('intel_risks_section') + '</div>' +
      '<div class="card" style="color:var(--text-light);text-align:center;padding:14px;font-size:0.85rem;">' + t('intel_risks_empty') + '</div>';
  }

  var html    = '<div class="section-title">\uD83D\uDEA8 ' + t('intel_risks_section') + '</div>';
  var sevCols = { high: 'var(--red)', medium: 'var(--orange)', low: 'var(--blue)' };

  risks.forEach(function(r) {
    var col = sevCols[r.severity] || 'var(--text-light)';
    html += '<div class="card" style="padding:12px 14px;margin-bottom:6px;border-left:3px solid ' + col + ';">' +
      '<div style="display:flex;gap:8px;align-items:flex-start;">' +
        '<div style="font-size:1.1rem;">' + r.icon + '</div>' +
        '<div style="flex:1;">' +
          '<div style="font-size:0.83rem;font-weight:600;color:var(--text);">' + r.title + '</div>' +
          '<div style="font-size:0.73rem;color:var(--text-light);margin-top:2px;">' + r.text + '</div>' +
        '</div>' +
        '<span style="font-size:0.62rem;font-weight:700;padding:2px 7px;border-radius:8px;background:#f3f4f6;color:' + col + ';">' +
          (r.severity === 'high' ? t('intel_sev_high') : r.severity === 'medium' ? t('intel_sev_medium') : t('intel_sev_low')) +
        '</span>' +
      '</div>' +
    '</div>';
  });

  return html;
}

/**
 * Construit un bloc HTML pour les opportunités.
 * @param {Array} opportunities - depuis getOpportunityEngine()
 */
function buildOpportunityBlock(opportunities) {
  if (!opportunities || opportunities.length === 0) {
    return '<div class="section-title">\uD83C\uDF1F ' + t('intel_opp_section') + '</div>' +
      '<div class="card" style="color:var(--text-light);text-align:center;padding:14px;font-size:0.85rem;">' + t('intel_opp_empty') + '</div>';
  }

  var html = '<div class="section-title">\uD83C\uDF1F ' + t('intel_opp_section') + '</div>';
  opportunities.slice(0, 5).forEach(function(opp) {
    var prioColor = opp.priority === 'high' ? 'var(--green-700)' :
                    opp.priority === 'medium' ? 'var(--orange)' : 'var(--text-light)';
    html += '<div class="card" style="padding:12px 14px;margin-bottom:6px;">' +
      '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;">' +
        '<div style="flex:1;">' +
          '<div style="font-size:0.85rem;font-weight:600;color:var(--text);">' + opp.title + '</div>' +
          '<div style="font-size:0.73rem;color:var(--text-light);margin-top:3px;">' + opp.text + '</div>' +
          (opp.estimatedYieldGain > 0
            ? '<div style="font-size:0.72rem;color:var(--green-700);font-weight:600;margin-top:4px;">' + t('intel_opp_yield').replace('{kg}', opp.estimatedYieldGain.toFixed(1)) + '</div>'
            : '') +
        '</div>' +
        '<span style="font-size:0.65rem;font-weight:700;padding:2px 8px;border-radius:8px;background:var(--green-100);color:' + prioColor + ';white-space:nowrap;">' +
          (opp.priority === 'high' ? t('intel_opp_prio_high') : opp.priority === 'medium' ? t('intel_opp_prio_medium') : t('intel_opp_prio_low')) +
        '</span>' +
      '</div>' +
    '</div>';
  });

  return html;
}
