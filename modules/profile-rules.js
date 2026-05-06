/**
 * Green Vibes — modules/profile-rules.js
 * Tables de règles et stratégies d'adaptation par profil.
 *
 * Ce fichier sépare les DONNÉES de règles (tables statiques)
 * de la LOGIQUE de profils (profiles.js).
 *
 * Fonctions exposées :
 *   getProfileSmartActionsLimit(profileId)    — nb max d'actions intelligentes
 *   getProfileDashboardBlocks(profileId)      — blocs à afficher sur le dashboard
 *   getProfileAnalysisSections(profileId)     — sections à afficher dans Analyse
 *   getProfileRiskFilter(profileId, risks)    — filtre des risques selon profil
 *   getProfileWeeklyPlan(profileId)           — résumé hebdomadaire adapté
 *   getProfileMetrics(profileId)              — métriques importantes par profil
 *   applyProfileToSmartActions(profileId, actions) — adapter getSmartActions()
 *
 * Dépendances : GVP_USAGE_PROFILES (profiles.js), APP, getLearningMemory
 *
 * Ne modifie AUCUN fichier existant.
 *
 * TODO (passe UI à venir) :
 *   L'intégration UI de ces règles (filtrage effectif des blocs, actions,
 *   métriques selon le profil actif) sera branchée dans une future passe
 *   dédiée. Les règles sont définies et prêtes ; le branchement est volontairement
 *   différé.
 */


// ============================================================
// 1. LIMITES D'ACTIONS PAR PROFIL
// ============================================================

/**
 * Retourne le nombre maximum d'actions intelligentes à afficher
 * dans la section "Actions prioritaires" du planning.
 *
 * @param {string} profileId
 * @returns {{ mainAction: number, secondaryActions: number }}
 */
function getProfileSmartActionsLimit(profileId) {
  var limits = {
    particulier: { mainAction: 1, secondaryActions: 2 },
    passionne:   { mainAction: 1, secondaryActions: 4 },
    maraicher:   { mainAction: 1, secondaryActions: 6 }
  };
  return limits[profileId] || limits['passionne'];
}


// ============================================================
// 2. BLOCS DASHBOARD PAR PROFIL
// ============================================================

/**
 * Retourne la liste ordonnée des blocs à afficher sur le dashboard,
 * avec visibilité par profil.
 *
 * Bloc IDs existants (depuis renderDashboard) :
 *   'weather'         — hero météo
 *   'today_action'    — carte action du jour (buildTodayActionCard)
 *   'progression'     — buildProgressionBlock
 *   'insight'         — buildActionableInsightBlock
 *   'score'           — buildScoreBlockV2
 *   'alerts'          — buildSmartAlertsBlock
 *   'reco'            — buildRecoBlockV2
 *   'stats'           — grille 4 stats jardin
 *   'beds_preview'    — aperçu bac le plus chargé
 *   'cta'             — boutons d'accès rapide
 *
 * @param {string} profileId
 * @returns {Array<{ id, visible, priority }>}
 */
function getProfileDashboardBlocks(profileId) {
  var configs = {

    particulier: [
      { id: 'weather',      visible: true,  priority: 1 },
      { id: 'today_action', visible: true,  priority: 2 },
      { id: 'alerts',       visible: true,  priority: 3 },  // Alertes critiques seulement
      { id: 'stats',        visible: true,  priority: 4 },
      { id: 'beds_preview', visible: true,  priority: 5 },
      { id: 'cta',          visible: true,  priority: 6 },
      // Cachés : trop complexes pour ce profil
      { id: 'progression',  visible: false, priority: 10 },
      { id: 'insight',      visible: false, priority: 10 },
      { id: 'score',        visible: false, priority: 10 },
      { id: 'reco',         visible: false, priority: 10 }
    ],

    passionne: [
      { id: 'weather',      visible: true, priority: 1 },
      { id: 'today_action', visible: true, priority: 2 },
      { id: 'progression',  visible: true, priority: 3 },
      { id: 'insight',      visible: true, priority: 4 },
      { id: 'score',        visible: true, priority: 5 },
      { id: 'alerts',       visible: true, priority: 6 },
      { id: 'reco',         visible: true, priority: 7 },
      { id: 'stats',        visible: true, priority: 8 },
      { id: 'beds_preview', visible: true, priority: 9 },
      { id: 'cta',          visible: true, priority: 10 }
    ],

    maraicher: [
      { id: 'weather',      visible: true, priority: 1 },
      { id: 'today_action', visible: true, priority: 2 },
      { id: 'alerts',       visible: true, priority: 3 },  // Alertes très visibles
      { id: 'stats',        visible: true, priority: 4 },
      { id: 'reco',         visible: true, priority: 5 },
      { id: 'score',        visible: true, priority: 6 },
      { id: 'beds_preview', visible: true, priority: 7 },
      { id: 'cta',          visible: true, priority: 8 },
      // Moins pertinent pour maraîcher
      { id: 'progression',  visible: false, priority: 10 },
      { id: 'insight',      visible: false, priority: 10 }
    ]
  };

  return (configs[profileId] || configs['passionne'])
    .sort(function(a, b) { return a.priority - b.priority; });
}

/**
 * Helper : vérifie si un bloc est visible pour le profil actif.
 * @param {string} blockId
 * @param {string} profileId
 * @returns {boolean}
 */
function isBlockVisible(blockId, profileId) {
  var pid = profileId || (typeof getCurrentUsageProfileId === 'function' ? getCurrentUsageProfileId() : 'passionne');
  var blocks = getProfileDashboardBlocks(pid);
  var block  = blocks.find(function(b) { return b.id === blockId; });
  return block ? block.visible : true; // visible par défaut si non listé
}


// ============================================================
// 3. SECTIONS ANALYSE PAR PROFIL
// ============================================================

/**
 * Retourne les sections de l'écran Analyse à afficher selon le profil.
 *
 * Section IDs existants (depuis renderAnalysis) :
 *   'progression'    — buildAnalysisProgressionSection
 *   'season_compare' — buildAnalysisSeasonComparisonSection
 *   'actions'        — buildAnalysisActionsSection
 *   'badges'         — buildAnalysisBadgesSection
 *   'predictive'     — buildPredictiveSection
 *   'yield_chart'    — yieldChartHTML
 *   'top_flop'       — topFlopHTML
 *   'surface'        — surfaceHTML
 *   'tips'           — tipsHTML
 *   'season_compare_table' — compareHTML
 *   'bed_health'     — healthHTML
 *   'learning'       — buildLearningSection
 *
 * @param {string} profileId
 * @returns {Array<{ id, visible, label }>}
 */
function getProfileAnalysisSections(profileId) {
  var configs = {

    particulier: [
      { id: 'yield_chart',  visible: true,  label: 'Mes récoltes' },
      { id: 'top_flop',     visible: true,  label: 'Meilleur / À améliorer' },
      { id: 'tips',         visible: true,  label: 'Conseils' },
      { id: 'actions',      visible: true,  label: 'Que faire ?' },
      // Masqués pour simplifier
      { id: 'progression',  visible: false },
      { id: 'badges',       visible: false },
      { id: 'season_compare', visible: false },
      { id: 'predictive',   visible: false },
      { id: 'surface',      visible: false },
      { id: 'season_compare_table', visible: false },
      { id: 'bed_health',   visible: false },
      { id: 'learning',     visible: false }
    ],

    passionne: [
      // Tout visible — c'est le profil par défaut de l'app actuelle
      { id: 'progression',  visible: true },
      { id: 'season_compare', visible: true },
      { id: 'actions',      visible: true },
      { id: 'badges',       visible: true },
      { id: 'predictive',   visible: true },
      { id: 'yield_chart',  visible: true },
      { id: 'top_flop',     visible: true },
      { id: 'surface',      visible: true },
      { id: 'tips',         visible: true },
      { id: 'season_compare_table', visible: true },
      { id: 'bed_health',   visible: true },
      { id: 'learning',     visible: true }
    ],

    maraicher: [
      // Focus : chiffres, surface, rendement, rotation
      { id: 'yield_chart',  visible: true,  label: 'Rendements' },
      { id: 'surface',      visible: true,  label: 'Surfaces & occupation' },
      { id: 'bed_health',   visible: true,  label: 'Santé des parcelles' },
      { id: 'top_flop',     visible: true,  label: 'Performances' },
      { id: 'actions',      visible: true,  label: 'Actions correctives' },
      { id: 'season_compare_table', visible: true, label: 'Historique saisons' },
      { id: 'predictive',   visible: true,  label: 'Prévisions' },
      // Moins utile pour maraîcher pro
      { id: 'progression',  visible: false },
      { id: 'badges',       visible: false },
      { id: 'tips',         visible: false },
      { id: 'season_compare', visible: false },
      { id: 'learning',     visible: false }
    ]
  };

  return configs[profileId] || configs['passionne'];
}


// ============================================================
// 4. FILTRE DE RISQUES PAR PROFIL
// ============================================================

/**
 * Filtre et priorise les risques selon le profil utilisateur.
 *
 * @param {string} profileId
 * @param {Array}  risks  — depuis getPredictiveRisks()
 * @returns {Array} risques filtrés et triés
 */
function getProfileRiskFilter(profileId, risks) {
  if (!risks || !risks.length) return [];

  var policy  = typeof getProfileNotificationPolicy === 'function'
    ? getProfileNotificationPolicy(profileId)
    : { urgencyThreshold: 'medium', categories: [], maxActive: 5 };
  var allowed = policy.categories;
  var maxShow = profileId === 'maraicher' ? 8 : profileId === 'particulier' ? 3 : 5;

  var filtered = risks.filter(function(r) {
    // Filtre sévérité
    if (policy.urgencyThreshold === 'high' && r.severity !== 'high') return false;
    if (policy.urgencyThreshold === 'medium' && r.severity === 'low') return false;
    // Filtre catégorie
    if (allowed && allowed.length && r.type && allowed.indexOf(r.type) < 0) return false;
    return true;
  });

  return filtered.slice(0, maxShow);
}


// ============================================================
// 5. PLAN HEBDOMADAIRE ADAPTÉ
// ============================================================

/**
 * Génère un résumé des actions hebdomadaires adapté au profil.
 * Conçu pour un futur widget "Votre semaine" sur le dashboard.
 *
 * @param {string} profileId
 * @returns {{
 *   title: string,
 *   frequency: string,
 *   focusItems: Array<string>,
 *   quickWins: Array<string>
 * }}
 */
function getProfileWeeklyPlan(profileId) {
  var today     = new Date();
  var todayM    = today.getMonth() + 1;
  var hasHarvests = APP.crops.some(function(c) {
    if (!c.dateHarvest || c.status !== 'active') return false;
    var diff = Math.floor((new Date(c.dateHarvest) - today) / 86400000);
    return diff >= 0 && diff <= 7;
  });

  var templates = {

    particulier: {
      title:     'Cette semaine dans votre jardin',
      frequency: 'Vérifiez 2-3 fois cette semaine',
      focusItems: [
        hasHarvests ? '🎉 Des récoltes vous attendent !' : '🌱 Arrosez si temps chaud',
        '👀 Un regard sur chaque espace suffit'
      ],
      quickWins: [
        'Arrosez le soir (5 min)',
        'Récoltez ce qui est prêt',
        'Notez ce que vous observez'
      ]
    },

    passionne: {
      title:     'Votre plan jardin de la semaine',
      frequency: 'Consultez l\'app régulièrement',
      focusItems: [
        hasHarvests ? '⏰ Récoltes imminentes à ne pas manquer' : '📅 Vérifiez le planning de plantation',
        '📊 Analysez les performances de la saison',
        '🔄 Vérifiez la rotation avant toute plantation'
      ],
      quickWins: [
        'Mettez à jour les récoltes réalisées',
        'Planifiez la prochaine culture',
        'Consultez les risques météo 7j'
      ]
    },

    maraicher: {
      title:     'Pilotage parcelles — semaine ' + _getWeekNumber(today),
      frequency: 'Consultation quotidienne recommandée',
      focusItems: [
        'Rendements : ' + _getWeekYieldEstimate() + ' kg estimés à récolter',
        hasHarvests ? '⚡ Récoltes urgentes en attente' : '✅ Planning de récolte à jour',
        'Rotation : vérifiez avant toute nouvelle plantation'
      ],
      quickWins: [
        'Saisir les récoltes du jour',
        'Vérifier l\'occupation de chaque espace de culture',
        'Valider les alertes en cours'
      ]
    }
  };

  return templates[profileId] || templates['passionne'];
}

function _getWeekNumber(date) {
  var d   = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  var yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function _getWeekYieldEstimate() {
  var total = 0;
  var today = new Date();
  APP.crops.filter(function(c) {
    if (!c.dateHarvest || c.status !== 'active') return false;
    var diff = Math.floor((new Date(c.dateHarvest) - today) / 86400000);
    return diff >= 0 && diff <= 7;
  }).forEach(function(c) {
    total += (typeof getCropEstimatedYield === 'function') ? getCropEstimatedYield(c) : 0;
  });
  return total.toFixed(1);
}


// ============================================================
// 6. MÉTRIQUES IMPORTANTES PAR PROFIL
// ============================================================

/**
 * Retourne les métriques prioritaires à afficher pour ce profil.
 * Conçu pour personnaliser les 4 stats du dashboard.
 *
 * @param {string} profileId
 * @returns {Array<{ id, label, getValue: function }>}
 */
function getProfileMetrics(profileId) {
  var today    = new Date();
  var seasonC  = APP.crops.filter(function(c) { return c.season === APP.currentSeason; });
  var active   = seasonC.filter(function(c) { return c.status === 'active'; });
  var harvested= seasonC.filter(function(c) { return c.status === 'harvested'; });

  var proche = active.filter(function(c) {
    if (!c.dateHarvest) return false;
    return Math.floor((new Date(c.dateHarvest) - today) / 86400000) <= 7;
  }).length;

  var realKg = harvested.reduce(function(s, c) { return s + (c.yieldReal || 0); }, 0);

  var totalSurf = APP.beds.reduce(function(s, b) { return s + (b.length || 0) * (b.width || 0); }, 0);
  var usedSurf  = active.reduce(function(s, c) {
    return s + (typeof getCropSurface === 'function' ? getCropSurface(c) : 0);
  }, 0);
  var occPct = totalSurf > 0 ? Math.round(usedSurf / totalSurf * 100) : 0;

  var allMetrics = {
    crops_active:  { id: 'crops_active',  label: 'Cultures',          value: active.length },
    proche:        { id: 'proche',         label: 'Récoltes proches',   value: proche },
    occupation:    { id: 'occupation',     label: 'Occupation',         value: occPct + '%' },
    surface:       { id: 'surface',        label: 'Surface m²',         value: totalSurf.toFixed(1) },
    real_yield:    { id: 'real_yield',     label: 'Récoltés (kg)',       value: realKg.toFixed(1) },
    beds_count:    { id: 'beds_count',     label: 'Espaces',            value: APP.beds.length }
  };

  var configs = {
    particulier: ['proche', 'crops_active', 'surface', 'real_yield'],
    passionne:   ['crops_active', 'proche', 'occupation', 'surface'],
    maraicher:   ['occupation', 'real_yield', 'crops_active', 'beds_count']
  };

  return (configs[profileId] || configs['passionne']).map(function(id) {
    return allMetrics[id] || { id: id, label: id, value: '?' };
  });
}


// ============================================================
// 7. ADAPTER getSmartActions() AU PROFIL
// ============================================================

/**
 * Filtre et adapte la liste d'actions intelligentes selon le profil.
 * À appeler après getSmartActions(weather) pour personnaliser l'affichage.
 *
 * @param {string} profileId
 * @param {Array}  actions  — depuis getSmartActions(weather)
 * @returns {Array}
 */
function applyProfileToSmartActions(profileId, actions) {
  if (!actions || !actions.length) return [];

  var limits  = getProfileSmartActionsLimit(profileId);
  var policy  = typeof getProfileNotificationPolicy === 'function'
    ? getProfileNotificationPolicy(profileId)
    : { urgencyThreshold: 'medium', categories: [] };
  var allowed = policy.categories;
  var total   = limits.mainAction + limits.secondaryActions;

  // Filtrer par catégorie et urgence
  var filtered = actions.filter(function(a) {
    if (policy.urgencyThreshold === 'high' && a.priority !== 'urgent') return false;
    if (policy.urgencyThreshold === 'medium' && a.priority === 'suggestion' && profileId === 'particulier') return false;
    if (allowed && allowed.length && a.type && allowed.indexOf(a.type) < 0) return false;
    return true;
  });

  // Maraîcher : conserver les actions d'optimisation en plus
  if (profileId === 'maraicher') {
    var optActions = actions.filter(function(a) {
      return a.type === 'optimize' || a.type === 'fix';
    });
    filtered = filtered.concat(optActions.filter(function(a) {
      return !filtered.some(function(f) { return f.id === a.id; });
    }));
  }

  return filtered.slice(0, total);
}
