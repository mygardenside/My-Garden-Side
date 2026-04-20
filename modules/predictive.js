// Green Vibes — modules/predictive.js
// Insights prédictifs et carte action du jour
// V20 — INSIGHTS PREDICTIFS
// ============================================================
/**
 * getPredictiveInsights() — anticipe les evenements des 60 prochains jours.
 * { nextHarvests, riskZones, bestNextPlantings, projectedYield }
 */
function getPredictiveInsights() {
  var today       = new Date();
  var seasonCrops = APP.crops.filter(function(c){ return c.season === APP.currentSeason; });
  var mem         = getLearningMemory();

  var nextHarvests = seasonCrops
    .filter(function(c){ return c.status==='active' && c.dateHarvest; })
    .map(function(c) {
      var v    = APP.vegetables[c.veggieId];
      var diff = Math.floor((new Date(c.dateHarvest) - today) / 86400000);
      return { cropId:c.id, name:v?tVeg(v.name):'?', icon:v?v.icon:'\uD83C\uDF31',
        bedName:(APP.beds.find(function(b){return b.id===c.bedId;})||{}).name||'',
        daysLeft:diff, dateHarvest:c.dateHarvest, estYield:getCropEstimatedYield(c) };
    })
    .filter(function(h){ return h.daysLeft >= 0 && h.daysLeft <= 60; })
    .sort(function(a,b){ return a.daysLeft - b.daysLeft; });

  var riskZones = APP.beds.map(function(bed) {
    var occ = getBedOccupation(bed);
    return { bedId:bed.id, name:bed.name, occ:occ, risk:occ>85?'high':occ>70?'medium':'low' };
  }).filter(function(z){ return z.risk !== 'low'; });

  var sugs = getSuggestedPlantings('1').concat(getSuggestedPlantings('2'));
  var seenSug = {};
  var bestNextPlantings = sugs.filter(function(s) {
    var key = s.veggieId+'-'+s.bedId; if (seenSug[key]) return false; seenSug[key]=true; return true;
  }).map(function(s) {
    var p = mem.vegetableProfiles[s.veggieId];
    return Object.assign({}, s, { histRatio: p&&p.count>=1?p.avgRatio:null });
  }).sort(function(a,b){ return (b.histRatio||0)-(a.histRatio||0); }).slice(0,4);

  var harv = seasonCrops.filter(function(c){ return c.status==='harvested'; })
    .reduce(function(s,c){ return s+(c.yieldReal||0); },0);
  var proj = seasonCrops.filter(function(c){ return c.status==='active'; })
    .reduce(function(s,c) {
      var p = mem.vegetableProfiles[c.veggieId];
      return s + getCropEstimatedYield(c) * (p&&p.count>=2?p.avgRatio:0.75);
    },0);

  return { nextHarvests:nextHarvests, riskZones:riskZones,
    bestNextPlantings:bestNextPlantings,
    projectedYield:{ harvested:parseFloat(harv.toFixed(2)), projected:parseFloat(proj.toFixed(2)), total:parseFloat((harv+proj).toFixed(2)) } };
}

/** Section predictive pour l'ecran Analyse */
function buildPredictiveSection() {
  var pred = getPredictiveInsights();
  var html = '<div class="section-title">\uD83D\uDD2E ' + t('pred_next_harvests') + '</div>';
  if (pred.nextHarvests.length === 0) {
    html += '<div class="card" style="color:var(--text-light);text-align:center;padding:14px;font-size:0.85rem;">' + t('pred_no_harvest') + '</div>';
  } else {
    html += '<div class="card" style="padding:10px 16px;">';
    pred.nextHarvests.slice(0,5).forEach(function(h) {
      var cls   = h.daysLeft <= 3 ? 'soon' : h.daysLeft <= 14 ? 'medium' : 'future';
      var label = h.daysLeft === 0 ? t('pred_today') : h.daysLeft === 1 ? t('pred_tomorrow') : t('pred_in_days').replace('{n}', h.daysLeft);
      html += '<div class="pred-row"><div class="pred-icon">' + h.icon + '</div>' +
        '<div class="pred-info"><div class="pred-name">' + escH(h.name) + (h.bedName?' \u2014 '+escH(h.bedName):'') + '</div>' +
        '<div class="pred-date">~' + h.estYield.toFixed(1) + ' ' + t('pred_kg_est') + '</div></div>' +
        '<div class="pred-tag ' + cls + '">' + label + '</div></div>';
    });
    html += '</div>';
  }
  var py = pred.projectedYield;
  if (py.total > 0) {
    html += '<div class="dash-section-label" style="margin-top:14px;"><div>\uD83D\uDCCA ' + t('pred_section_yield') + '</div></div>' +
      '<div class="card" style="padding:12px 16px;"><div style="display:flex;gap:8px;">' +
      '<div style="flex:1;text-align:center;"><div style="font-size:1.2rem;font-weight:700;color:var(--green-700);">' + py.harvested + ' kg</div><div style="font-size:0.7rem;color:var(--text-light);">' + t('pred_lbl_harvested') + '</div></div>' +
      '<div style="flex:1;text-align:center;"><div style="font-size:1.2rem;font-weight:700;color:var(--orange);">' + py.projected + ' kg</div><div style="font-size:0.7rem;color:var(--text-light);">' + t('pred_lbl_projected') + '</div></div>' +
      '<div style="flex:1;text-align:center;"><div style="font-size:1.2rem;font-weight:700;">' + py.total + ' kg</div><div style="font-size:0.7rem;color:var(--text-light);">' + t('pred_lbl_total') + '</div></div>' +
      '</div></div>';
  }
  return html;
}

// ============================================================
// V20 — CARTE "CE QUE TU DOIS FAIRE" (Dashboard)
// ============================================================
function buildTodayActionCard(weather) {
  var actions = getSmartActions(weather);
  if (actions.length === 0) return '';
  var a = actions[0];
  var todayId = registerSmartAction({ actionType:a.actionType, payload:a.payload||{} });
  return '<div class="dash-today-card" onclick="executeSmartActionById(\'' + todayId + '\')">' +
    '<div class="dash-today-label">' + t('dash_today_label') + '</div>' +
    '<div class="dash-today-title">' + a.icon + ' ' + a.title + '</div>' +
    '<div class="dash-today-desc">' + a.description + '</div>' +
    '<button class="dash-today-cta" onclick="event.stopPropagation();executeSmartActionById(\'' + todayId + '\')">' +
      t('action_now') + ' \u2192</button>' +
  '</div>';
}

// exportAppData() — déplacé dans modules/export.js (fonction canonique)

