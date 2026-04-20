/**
 * Green Vibes — modules/risk-engine.js
 * Moteur de risques prédictifs sur 7 jours.
 *
 * Fonctions exposées :
 *   getPredictiveRisks()         — risques météo + cultures sur 7 jours
 *   getRiskSummary()             — résumé chiffré (nb high/medium/low)
 *   getMostUrgentRisk()          — risque le plus critique (ou null)
 *
 * Utilise APP.weather.daily (forecast 7j fourni par open-meteo).
 * Fonctionne aussi avec APP.weather.current si daily absent.
 *
 * Dépendances :
 *   APP, getCropStage, getBedOccupation, getRotationScore,
 *   getBedFamilies, getLearningMemory, escH
 *
 * Ne modifie PAS les modules existants.
 */

// ============================================================
// CONSTANTES DE SEUIL
// ============================================================
var RISK_THRESHOLDS = {
  FROST:         2,    // °C — risque de gel
  COLD:          5,    // °C — froid significatif
  HEAT_WARNING: 32,    // °C — chaleur préoccupante
  HEAT_CRITICAL: 37,   // °C — chaleur critique
  WIND_STRONG:  45,    // km/h — vent fort
  WIND_STORM:   65,    // km/h — vent tempétueux
  RAIN_EXCESS:  20,    // mm/j — précipitations excessives
  RAIN_FLOOD:   40,    // mm/j — risque d'inondation
  DRY_DAYS:     3,     // jours sans pluie avec T>20 = stress hydrique
  LATE_HARVEST:  5,    // jours de retard = risque récolte compromise
  BED_OVERLOAD: 101    // occupation capped at 100 — ce seuil ne se déclenche jamais
};


// ============================================================
// 1. MOTEUR DE RISQUES PRÉDICTIFS
// ============================================================

/**
 * Analyse toutes les sources de risque et retourne une liste priorisée.
 *
 * @returns {Array<{
 *   id, type, severity, icon, title, text,
 *   cropId, bedId, dayIndex, forecastDate
 * }>}
 */
function getPredictiveRisks() {
  var risks   = [];
  var weather = APP.weather || null;
  var today   = new Date();
  var seasonCrops = APP.crops.filter(function(c) {
    return c.season === APP.currentSeason && c.status === 'active';
  });

  // ---- SOURCE 1 : Prévisions météo 7 jours ----
  if (weather && weather.daily && weather.daily.time) {
    var daily = weather.daily;
    var dryStreak = 0;

    for (var i = 0; i < Math.min(7, daily.time.length); i++) {
      var tMax  = daily.temperature_2m_max  ? daily.temperature_2m_max[i]  : null;
      var tMin  = daily.temperature_2m_min  ? daily.temperature_2m_min[i]  : null;
      var rain  = daily.precipitation_sum   ? daily.precipitation_sum[i]   : null;
      var date  = daily.time[i];
      var label = i === 0 ? t('lbl_today') : i === 1 ? t('lbl_tomorrow') : _dayLabel(date);

      // Gel prévu
      if (tMin !== null && tMin <= RISK_THRESHOLDS.FROST) {
        var sev = tMin <= -2 ? 'high' : 'medium';
        risks.push({
          id: 'frost-day' + i, type: 'frost',
          severity: sev, icon: '🥶',
          title: t('risk_frost_title').replace('{label}', label).replace('{temp}', Math.round(tMin)),
          text: _frostText(tMin, seasonCrops),
          cropId: null, bedId: null,
          dayIndex: i, forecastDate: date
        });
      }
      // Froid significatif
      else if (tMin !== null && tMin <= RISK_THRESHOLDS.COLD) {
        risks.push({
          id: 'cold-day' + i, type: 'cold',
          severity: 'low', icon: '❄️',
          title: t('risk_cold_title').replace('{label}', label).replace('{temp}', Math.round(tMin)),
          text: t('risk_cold_text'),
          cropId: null, bedId: null,
          dayIndex: i, forecastDate: date
        });
      }

      // Chaleur critique
      if (tMax !== null && tMax >= RISK_THRESHOLDS.HEAT_CRITICAL) {
        risks.push({
          id: 'heat-crit-day' + i, type: 'heat',
          severity: 'high', icon: '🔥',
          title: t('risk_heat_crit_title').replace('{label}', label).replace('{temp}', Math.round(tMax)),
          text: t('risk_heat_crit_text'),
          cropId: null, bedId: null,
          dayIndex: i, forecastDate: date
        });
      } else if (tMax !== null && tMax >= RISK_THRESHOLDS.HEAT_WARNING) {
        risks.push({
          id: 'heat-warn-day' + i, type: 'heat',
          severity: 'medium', icon: '☀️',
          title: t('risk_heat_warn_title').replace('{label}', label).replace('{temp}', Math.round(tMax)),
          text: t('risk_heat_warn_text'),
          cropId: null, bedId: null,
          dayIndex: i, forecastDate: date
        });
      }

      // Précipitations excessives
      if (rain !== null && rain >= RISK_THRESHOLDS.RAIN_FLOOD) {
        risks.push({
          id: 'flood-day' + i, type: 'excess_rain',
          severity: 'high', icon: '🌊',
          title: t('risk_flood_title').replace('{label}', label).replace('{mm}', Math.round(rain)),
          text: t('risk_flood_text'),
          cropId: null, bedId: null,
          dayIndex: i, forecastDate: date
        });
      } else if (rain !== null && rain >= RISK_THRESHOLDS.RAIN_EXCESS) {
        risks.push({
          id: 'rain-exc-day' + i, type: 'excess_rain',
          severity: 'medium', icon: '🌧️',
          title: t('risk_rain_title').replace('{label}', label).replace('{mm}', Math.round(rain)),
          text: t('risk_rain_text'),
          cropId: null, bedId: null,
          dayIndex: i, forecastDate: date
        });
      }

      // Accumulation stress hydrique (jours secs avec chaleur)
      if (rain !== null && rain < 2 && tMax !== null && tMax > 20) {
        dryStreak++;
        if (dryStreak >= RISK_THRESHOLDS.DRY_DAYS) {
          risks.push({
            id: 'drought-day' + i, type: 'drought',
            severity: dryStreak >= 5 ? 'high' : 'medium', icon: '🏜️',
            title: t('risk_drought_title').replace('{n}', dryStreak),
            text: t('risk_drought_text'),
            cropId: null, bedId: null,
            dayIndex: i, forecastDate: date
          });
        }
      } else if (rain !== null && rain >= 2) {
        dryStreak = 0;
      }
    }
  } else if (weather && weather.current) {
    // Pas de forecast — analyse actuelle seulement
    var cur = weather.current;
    if (cur.temperature_2m <= RISK_THRESHOLDS.FROST) {
      risks.push({
        id: 'frost-now', type: 'frost', severity: 'high', icon: '🥶',
        title: t('risk_frost_now_title').replace('{temp}', Math.round(cur.temperature_2m)),
        text: t('risk_frost_now_text'),
        cropId: null, bedId: null, dayIndex: 0, forecastDate: null
      });
    }
  }

  // ---- SOURCE 2 : Risques par culture ----
  seasonCrops.forEach(function(c) {
    var veg = APP.vegetables[c.veggieId]; if (!veg) return;

    // Récolte compromise (retard important)
    if (c.dateHarvest) {
      var daysLate = Math.floor((today - new Date(c.dateHarvest)) / 86400000);
      if (daysLate > RISK_THRESHOLDS.LATE_HARVEST) {
        risks.push({
          id:       'harvest-late-' + c.id,
          type:     'harvest_compromised',
          severity: daysLate > 14 ? 'high' : 'medium',
          icon:     '⏰',
          title:    t('risk_harvest_late_title').replace('{name}', escH(veg.name)).replace('{n}', daysLate),
          text:     t('risk_harvest_late_text'),
          cropId:   c.id, bedId: c.bedId,
          dayIndex: null, forecastDate: null
        });
      }
    }

    // Gel croisé avec sensibilité de la culture
    if (weather && weather.daily && weather.daily.temperature_2m_min) {
      var minForecast = Math.min.apply(null, weather.daily.temperature_2m_min.slice(0, 4));
      var coldSens = (veg.sensitivity && veg.sensitivity.cold) || 5;
      if (minForecast <= 5 && coldSens >= 7) {
        risks.push({
          id:       'cold-sensitive-' + c.id,
          type:     'cold_sensitive',
          severity: minForecast <= 2 ? 'high' : 'medium',
          icon:     veg.icon,
          title:    t('risk_cold_sensitive_title').replace('{name}', escH(veg.name)).replace('{temp}', Math.round(minForecast)),
          text:     t('risk_cold_sensitive_text').replace('{sens}', coldSens),
          cropId:   c.id, bedId: c.bedId,
          dayIndex: null, forecastDate: null
        });
      }
    }
  });

  // ---- SOURCE 3 : Risques structurels (bacs) ----
  APP.beds.forEach(function(bed) {
    var occ = getBedOccupation(bed);

    // Surcharge critique
    if (occ >= RISK_THRESHOLDS.BED_OVERLOAD) {
      risks.push({
        id:       'overload-' + bed.id,
        type:     'overload',
        severity: occ >= 100 ? 'high' : 'medium',
        icon:     '📦',
        title:    t('risk_overload_title').replace('{name}', escH(bed.name)).replace('{pct}', occ),
        text:     t('risk_overload_text'),
        cropId:   null, bedId: bed.id,
        dayIndex: null, forecastDate: null
      });
    }

    // Rotation critique
    var rot = getRotationScore(bed);
    if (rot.score === 'bad') {
      var fams = getBedFamilies(bed.id);
      risks.push({
        id:       'rotation-' + bed.id,
        type:     'rotation',
        severity: 'medium',
        icon:     '🔄',
        title:    t('risk_rotation_title').replace('{name}', escH(bed.name)),
        text:     t('risk_rotation_text').replace('{fams}', fams.map(function(f){ return t('family_' + f); }).join(', ')),
        cropId:   null, bedId: bed.id,
        dayIndex: null, forecastDate: null
      });
    }
  });

  // ---- Déduplication + tri par sévérité puis par dayIndex ----
  var seen = {};
  risks = risks.filter(function(r) {
    if (seen[r.id]) return false;
    seen[r.id] = true;
    return true;
  });

  var sevOrder = { high: 0, medium: 1, low: 2 };
  risks.sort(function(a, b) {
    var sd = (sevOrder[a.severity] || 2) - (sevOrder[b.severity] || 2);
    if (sd !== 0) return sd;
    var da = a.dayIndex !== null ? a.dayIndex : 99;
    var db = b.dayIndex !== null ? b.dayIndex : 99;
    return da - db;
  });

  return risks;
}


// ============================================================
// 2. RÉSUMÉ DES RISQUES
// ============================================================

/**
 * Retourne un résumé chiffré des risques.
 * @returns {{ total, high, medium, low, hasUrgent }}
 */
function getRiskSummary() {
  var risks  = getPredictiveRisks();
  var counts = { total: risks.length, high: 0, medium: 0, low: 0 };
  risks.forEach(function(r) { counts[r.severity] = (counts[r.severity] || 0) + 1; });
  counts.hasUrgent = counts.high > 0;
  return counts;
}


// ============================================================
// 3. RISQUE LE PLUS URGENT
// ============================================================

/**
 * Retourne le risque le plus critique, ou null si aucun.
 * @returns {Object|null}
 */
function getMostUrgentRisk() {
  var risks = getPredictiveRisks();
  return risks.length > 0 ? risks[0] : null;
}


// ============================================================
// HELPERS INTERNES
// ============================================================

function _dayLabel(dateStr) {
  try {
    var d = new Date(dateStr);
    return fmtDate(d, { weekday: 'short', day: 'numeric', month: 'short' });
  } catch(e) {
    return dateStr;
  }
}

function _frostText(tMin, seasonCrops) {
  var sensitiveCrops = seasonCrops.filter(function(c) {
    var veg = APP.vegetables[c.veggieId];
    return veg && veg.sensitivity && veg.sensitivity.cold >= 7;
  });
  var base = t('risk_frost_base');
  if (sensitiveCrops.length > 0) {
    var names = sensitiveCrops.slice(0, 3).map(function(c) {
      var veg = APP.vegetables[c.veggieId];
      return veg ? veg.name : '';
    }).filter(Boolean).join(', ');
    base = t('risk_frost_specific').replace('{names}', names);
  }
  return base;
}
