/**
 * Green Vibes — modules/opportunities.js
 * Moteur d'opportunités et d'optimisation rendement.
 *
 * Fonctions exposées :
 *   getOpportunityEngine()            — liste toutes les opportunités actionnables
 *   getBestNextPlanting()             — meilleure plantation à lancer maintenant
 *   getFreeBedOpportunities()         — espaces libres exploitables
 *   getHighPerformerReplantings()     — légumes fiables à replanter
 *
 * Chaque opportunité :
 *   { id, type, title, text, priority, estimatedYieldGain,
 *     veggieId, bedId, actionType, actionPayload }
 *
 * Dépendances :
 *   APP, getLearningMemory, getSuggestedPlantings, getSuggestedCropSetup,
 *   getBedAvailableSpace, getBedOccupation, getBedSurface,
 *   getCropEstimatedYield, getPlantingCalendarForVeggie,
 *   getRotationScore, escH
 *
 * Ne modifie PAS les modules existants.
 */


// ============================================================
// 1. MOTEUR D'OPPORTUNITÉS PRINCIPAL
// ============================================================

/**
 * Agrège toutes les opportunités disponibles, les score et les trie.
 * @returns {Array<Opportunity>}
 */
function getOpportunityEngine() {
  var opportunities = [];
  var seen          = {};

  // Combiner les 4 sources
  var sources = [
    getFreeBedOpportunities(),
    getHighPerformerReplantings(),
    _getSeasonWindowOpportunities(),
    _getDiversityOpportunities()
  ];

  sources.forEach(function(list) {
    list.forEach(function(opp) {
      if (!seen[opp.id]) {
        seen[opp.id] = true;
        opportunities.push(opp);
      }
    });
  });

  // Tri : high > medium > low, puis par estimatedYieldGain desc
  var prioOrder = { high: 0, medium: 1, low: 2 };
  opportunities.sort(function(a, b) {
    var pd = (prioOrder[a.priority] || 2) - (prioOrder[b.priority] || 2);
    if (pd !== 0) return pd;
    return (b.estimatedYieldGain || 0) - (a.estimatedYieldGain || 0);
  });

  return opportunities.slice(0, 8); // Maximum 8 opportunités affichées
}


// ============================================================
// 2. ESPACES LIBRES DANS LES BACS
// ============================================================

/**
 * Détecte les espaces libres exploitables et suggère la meilleure culture.
 * @returns {Array<Opportunity>}
 */
function getFreeBedOpportunities() {
  var opps    = [];
  var mem     = getLearningMemory();
  var vegP    = mem.vegetableProfiles;
  var today   = new Date();
  var todayM  = today.getMonth() + 1;

  APP.beds.forEach(function(bed) {
    var avail = getBedAvailableSpace(bed, false);
    var surf  = getBedSurface(bed);
    if (surf <= 0 || avail < 0.05) return; // Pas d'espace significatif
    var freePct = Math.round((avail / surf) * 100);
    if (freePct < 20) return; // Moins de 20% libre — pas intéressant

    // Trouver le meilleur légume pour ce bac + ce mois
    var sug = getSuggestedPlantings('1').find(function(s) { return s.bedId === bed.id; });
    if (!sug) return;

    var veg   = APP.vegetables[sug.veggieId];
    var prof  = vegP[sug.veggieId];
    var setup = (typeof getSuggestedCropSetup === 'function')
      ? getSuggestedCropSetup(bed.id, sug.veggieId) : null;

    // Estimer le gain de rendement potentiel
    var yieldGain = 0;
    if (setup && veg) {
      yieldGain = parseFloat(((setup.qty || 1) * (veg.yieldPerM2 || 0) * (veg.spacePerPlant || 0.25) * (prof ? prof.avgRatio : 0.7)).toFixed(2));
    }

    var histLabel = prof && prof.count >= 1
      ? t('opp_hist_pct').replace('{pct}', Math.round(prof.avgRatio * 100))
      : '';

    opps.push({
      id:               'free-bed-' + bed.id + '-' + sug.veggieId,
      type:             'free_space',
      title:            escH(bed.name) + ' — ' + freePct + '% libre (' + avail.toFixed(2) + ' m\u00B2)',
      text:             (veg ? veg.icon + ' ' + escH(veg.name) : '?') +
                        ' ' + t('opp_free_month') + histLabel + '. ' + sug.reason,
      priority:         freePct >= 50 ? 'high' : 'medium',
      estimatedYieldGain: yieldGain,
      veggieId:         sug.veggieId,
      bedId:            bed.id,
      actionType:       'open_modal',
      actionPayload:    { modalType: 'plan_crop', veggieId: sug.veggieId, bedId: bed.id, setup: setup }
    });
  });

  return opps;
}


// ============================================================
// 3. LÉGUMES FIABLES À REPLANTER
// ============================================================

/**
 * Identifie les légumes ayant un bon historique, en saison, non encore plantés.
 * @returns {Array<Opportunity>}
 */
function getHighPerformerReplantings() {
  var opps   = [];
  var mem    = getLearningMemory();
  var vegP   = mem.vegetableProfiles;
  var today  = new Date();
  var todayM = today.getMonth() + 1;

  Object.keys(vegP).forEach(function(vid) {
    var prof = vegP[vid];
    if (prof.count < 2 || prof.avgRatio < 0.78) return; // Seuil : >78% de rendement

    var veg = APP.vegetables[vid]; if (!veg) return;
    var cal = getPlantingCalendarForVeggie(veg);
    if (!cal || !cal.plantMonths || cal.plantMonths.indexOf(todayM) < 0) return;

    // Déjà planté cette saison ?
    var alreadyPlanted = APP.crops.some(function(c) {
      return c.veggieId === vid && c.season === APP.currentSeason && c.status !== 'harvested';
    });
    if (alreadyPlanted) return;

    // Trouver le meilleur bac disponible
    var bestBed = null;
    APP.beds.forEach(function(b) {
      var avail = getBedAvailableSpace(b, false);
      if (avail >= (veg.spacePerPlant || 0.25)) {
        if (!bestBed || avail > getBedAvailableSpace(bestBed, false)) bestBed = b;
      }
    });
    if (!bestBed) return;

    var setup     = (typeof getSuggestedCropSetup === 'function')
      ? getSuggestedCropSetup(bestBed.id, vid) : null;
    var yieldGain = setup
      ? parseFloat(((setup.qty || 1) * (veg.yieldPerM2 || 0) * (veg.spacePerPlant || 0.25) * prof.avgRatio).toFixed(2))
      : 0;

    opps.push({
      id:               'replant-' + vid,
      type:             'high_performer',
      title:            (veg.icon || '\uD83C\uDF31') + ' ' + escH(veg.name) + ' ' + t('opp_hi_suffix'),
      text:             t('opp_hi_text').replace('{pct}', Math.round(prof.avgRatio * 100)).replace('{n}', prof.count).replace('{bed}', escH(bestBed.name)),
      priority:         prof.avgRatio >= 0.90 ? 'high' : 'medium',
      estimatedYieldGain: yieldGain,
      veggieId:         vid,
      bedId:            bestBed.id,
      actionType:       'open_modal',
      actionPayload:    { modalType: 'plan_crop', veggieId: vid, bedId: bestBed.id, setup: setup }
    });
  });

  // Trier par ratio historique desc
  opps.sort(function(a, b) {
    var rA = vegP[a.veggieId] ? vegP[a.veggieId].avgRatio : 0;
    var rB = vegP[b.veggieId] ? vegP[b.veggieId].avgRatio : 0;
    return rB - rA;
  });

  return opps.slice(0, 4);
}


// ============================================================
// 4. MEILLEURE PROCHAINE PLANTATION
// ============================================================

/**
 * Retourne LA meilleure opportunité de plantation pour maintenant.
 * Combine historique + espace disponible + saison.
 * @returns {Opportunity|null}
 */
function getBestNextPlanting() {
  var all = getOpportunityEngine();
  var plantOpps = all.filter(function(o) {
    return o.type === 'high_performer' || o.type === 'season_window';
  });
  return plantOpps.length > 0 ? plantOpps[0] : (all.length > 0 ? all[0] : null);
}


// ============================================================
// 5. FENÊTRES SAISONNIÈRES (source interne)
// ============================================================

function _getSeasonWindowOpportunities() {
  var opps   = [];
  var mem    = getLearningMemory();
  var vegP   = mem.vegetableProfiles;
  var today  = new Date();
  var todayM = today.getMonth() + 1;
  var nextM  = (todayM % 12) + 1;

  // Légumes en saison sans données historiques (découverte)
  Object.keys(APP.vegetables).forEach(function(vid) {
    var veg  = APP.vegetables[vid];
    var cal  = getPlantingCalendarForVeggie(veg);
    if (!cal || !cal.plantMonths) return;

    var inNow  = cal.plantMonths.indexOf(todayM) >= 0;
    var inNext = cal.plantMonths.indexOf(nextM) >= 0;
    if (!inNow && !inNext) return;

    // Déjà dans high performer (ne pas dupliquer)
    if (vegP[vid] && vegP[vid].count >= 2 && vegP[vid].avgRatio >= 0.78) return;

    // Déjà planté cette saison ?
    var alreadyPlanted = APP.crops.some(function(c) {
      return c.veggieId === vid && c.season === APP.currentSeason && c.status !== 'harvested';
    });
    if (alreadyPlanted) return;

    // Bac disponible ?
    var bestBed = null;
    APP.beds.forEach(function(b) {
      var avail = getBedAvailableSpace(b, false);
      if (avail >= (veg.spacePerPlant || 0.25)) {
        if (!bestBed || avail > getBedAvailableSpace(bestBed, false)) bestBed = b;
      }
    });
    if (!bestBed) return;

    var yieldEst = parseFloat(((veg.yieldPerM2 || 0) * (veg.spacePerPlant || 0.25) * 3 * 0.70).toFixed(2));

    opps.push({
      id:               'season-' + vid,
      type:             'season_window',
      title:            (veg.icon || '\uD83C\uDF31') + ' ' + escH(veg.name) + ' ' + (inNow ? t('opp_sw_suffix_now') : t('opp_sw_suffix_prep')),
      text:             inNow
        ? t('opp_sw_text_now').replace('{name}', escH(veg.name)).replace('{kg}', yieldEst)
        : t('opp_sw_text_next').replace('{name}', escH(veg.name)),
      priority:         inNow ? 'medium' : 'low',
      estimatedYieldGain: inNow ? yieldEst : 0,
      veggieId:         vid,
      bedId:            bestBed.id,
      actionType:       'open_modal',
      actionPayload:    { modalType: 'plan_crop', veggieId: vid, bedId: bestBed.id }
    });
  });

  return opps.slice(0, 3);
}


// ============================================================
// 6. DIVERSITÉ (source interne)
// ============================================================

function _getDiversityOpportunities() {
  var opps  = [];
  var today = new Date();
  var todayM= today.getMonth() + 1;

  // Compter les familles présentes cette saison
  var families = {};
  APP.crops.filter(function(c) { return c.season === APP.currentSeason; }).forEach(function(c) {
    var veg = APP.vegetables[c.veggieId];
    if (veg && veg.family) families[veg.family] = (families[veg.family] || 0) + 1;
  });

  if (Object.keys(families).length >= 4) return opps; // Déjà diversifié

  // Chercher une famille absente mais plantable
  var allFamilies = {};
  Object.keys(APP.vegetables).forEach(function(vid) {
    var veg = APP.vegetables[vid];
    if (veg && veg.family) allFamilies[veg.family] = allFamilies[veg.family] || vid;
  });

  Object.keys(allFamilies).forEach(function(fam) {
    if (families[fam]) return; // Déjà présente
    var vid = allFamilies[fam];
    var veg = APP.vegetables[vid]; if (!veg) return;
    var cal = getPlantingCalendarForVeggie(veg);
    if (!cal || !cal.plantMonths || cal.plantMonths.indexOf(todayM) < 0) return;

    var bestBed = null;
    APP.beds.forEach(function(b) {
      if (getBedAvailableSpace(b, false) >= (veg.spacePerPlant || 0.25)) {
        if (!bestBed || getBedAvailableSpace(b, false) > getBedAvailableSpace(bestBed, false)) bestBed = b;
      }
    });
    if (!bestBed) return;

    opps.push({
      id:               'diversity-' + fam.replace(/\s/g, '-'),
      type:             'diversity',
      title:            t('opp_div_title').replace('{fam}', escH(fam)),
      text:             t('opp_div_text').replace('{name}', escH(veg.name)),
      priority:         'low',
      estimatedYieldGain: 0,
      veggieId:         vid,
      bedId:            bestBed.id,
      actionType:       'open_modal',
      actionPayload:    { modalType: 'plan_crop', veggieId: vid, bedId: bestBed.id }
    });
  });

  return opps.slice(0, 1); // Une seule suggestion de diversité
}
