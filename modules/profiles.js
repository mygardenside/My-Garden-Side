/**
 * Green Vibes — modules/profiles.js
 * Couche de profils utilisateur basée sur le MODE D'USAGE.
 *
 * IMPORTANT — Architecture :
 *   APP.userProfile.level       → niveau de compétence jardinage (existant, inchangé)
 *                                  valeurs : debutant / intermediaire / avance / expert
 *   APP.userProfile.usageProfile → mode d'usage (NOUVEAU, géré ici)
 *                                  valeurs : particulier / passionne / maraicher
 *
 * Ces deux axes sont ORTHOGONAUX et complémentaires :
 *   - Un maraicher peut être débutant
 *   - Un passionné peut être expert
 *
 * Fonctions exposées :
 *   getAvailableProfiles()                               — liste les 3 profils
 *   getCurrentUsageProfile()                             — profil actif (objet complet)
 *   getCurrentUsageProfileId()                           — id seul
 *   setCurrentUsageProfile(profileId)                    — changer de profil
 *   getProfileRules(profileId)                           — règles métier du profil
 *   getProfileAdjustedRecommendations(profileId, recs)  — adapter le ton/priorité
 *   getProfileNotificationPolicy(profileId)              — politique de notifications
 *   getProfileOnboardingStep()                           — étape future onboarding
 *   detectSuggestedProfile()                             — suggestion auto depuis données
 *
 * Dépendances : APP, saveData, getLearningMemory (optionnel)
 *
 * Ne modifie AUCUN fichier existant.
 * Branchage ultérieur : appeler setCurrentUsageProfile() depuis settings.js
 * ou l'onboarding étendu.
 *
 * TODO (passe UI à venir) :
 *   Le branchement UI complet (sélecteur de profil visible, persistance,
 *   affichage du profil actif dans les réglages) sera traité dans une
 *   future passe dédiée. En attendant, les fonctions sont disponibles
 *   mais non exposées dans l'interface utilisateur.
 */

// ============================================================
// 1. DÉFINITION DES PROFILS
// ============================================================

/**
 * Catalogue complet des profils d'usage disponibles.
 * Chaque profil décrit un mode d'utilisation de l'application,
 * indépendamment du niveau de compétence jardinage.
 */
var GVP_USAGE_PROFILES = {

  particulier: {
    id:          'particulier',
    icon:        '🏡',
    name:        'Jardinier du week-end',
    shortName:   'Particulier',
    description: 'Jardinage plaisir, quelques bacs, pas de pression. Conseils simples et bien dosés.',
    usageRhythm: 'weekly',        // consultation hebdomadaire
    priorities:  ['plaisir', 'simplicite', 'recolte_facile'],
    recommendationStyle: 'simple',
    notificationFrequency: 'low',

    // Fonctionnalités activées / désactivées pour ce profil
    enabledFeatures: {
      learningMemory:      true,
      advancedAnalysis:    false,  // Analyse simplifiée
      riskEngine:          true,   // Alertes oui mais filtrées
      opportunityEngine:   true,
      rotationWarnings:    false,  // Trop technique pour ce profil
      yieldOptimization:   false,
      seasonAdvisor:       true,
      weeklyDigest:        true,   // Résumé hebdo au lieu de quotidien
      dailyAlerts:         false
    },

    // Nombre max de recommandations à montrer
    maxRecommendations: 2,
    maxNotifications:   3,
    urgencyThreshold:   'high',   // Seulement les urgences vraiment critiques

    // Ton des messages
    tone: {
      style:     'friendly',    // chaleureux, décontracté
      verbosity: 'short',       // textes courts
      emoji:     true,
      technical: false          // pas de jargon
    }
  },

  passionne: {
    id:          'passionne',
    icon:        '🌿',
    name:        'Passionné de jardinage',
    shortName:   'Passionné',
    description: 'Suivi régulier, apprentissage continu, optimisation progressive. L\'app dans toute sa richesse.',
    usageRhythm: 'daily',         // consultation plurihebdomadaire
    priorities:  ['apprentissage', 'optimisation', 'diversite', 'rendement'],
    recommendationStyle: 'balanced',
    notificationFrequency: 'medium',

    enabledFeatures: {
      learningMemory:      true,
      advancedAnalysis:    true,
      riskEngine:          true,
      opportunityEngine:   true,
      rotationWarnings:    true,
      yieldOptimization:   true,
      seasonAdvisor:       true,
      weeklyDigest:        false,
      dailyAlerts:         true
    },

    maxRecommendations: 4,
    maxNotifications:   6,
    urgencyThreshold:   'medium',

    tone: {
      style:     'enthusiastic', // engageant, motivant
      verbosity: 'medium',
      emoji:     true,
      technical: true            // les données et % sont bienvenus
    }
  },

  maraicher: {
    id:          'maraicher',
    icon:        '🚜',
    name:        'Maraîcher / Production',
    shortName:   'Maraîcher',
    description: 'Usage intensif, focus rendement, organisation et alertes opérationnelles au quotidien.',
    usageRhythm: 'daily',         // consultation quotidienne
    priorities:  ['rendement', 'organisation', 'rotation', 'efficacite'],
    recommendationStyle: 'dense',
    notificationFrequency: 'high',

    enabledFeatures: {
      learningMemory:      true,
      advancedAnalysis:    true,
      riskEngine:          true,
      opportunityEngine:   true,
      rotationWarnings:    true,
      yieldOptimization:   true,
      seasonAdvisor:       true,
      weeklyDigest:        false,
      dailyAlerts:         true
    },

    maxRecommendations: 6,
    maxNotifications:   10,
    urgencyThreshold:   'low',    // Toutes les alertes, même mineures

    tone: {
      style:     'operational',  // direct, factuel, chiffres
      verbosity: 'dense',
      emoji:     false,
      technical: true
    }
  }

};

/** Profil par défaut si rien n'est défini. */
var GVP_DEFAULT_PROFILE_ID = 'passionne';


// ============================================================
// 2. GESTION DU PROFIL ACTIF
// ============================================================

/**
 * Retourne la liste de tous les profils disponibles.
 * @returns {Array<ProfileDefinition>}
 */
function getAvailableProfiles() {
  return Object.values(GVP_USAGE_PROFILES);
}

/**
 * Retourne l'id du profil d'usage actif.
 * Lit APP.userProfile.usageProfile ou déduit depuis les données.
 * @returns {string}
 */
function getCurrentUsageProfileId() {
  var stored = APP.userProfile && APP.userProfile.usageProfile;
  if (stored && GVP_USAGE_PROFILES[stored]) return stored;
  // Pas de profil défini → tenter la détection automatique
  return detectSuggestedProfile() || GVP_DEFAULT_PROFILE_ID;
}

/**
 * Retourne l'objet profil complet actuellement actif.
 * @returns {ProfileDefinition}
 */
function getCurrentUsageProfile() {
  return GVP_USAGE_PROFILES[getCurrentUsageProfileId()] || GVP_USAGE_PROFILES[GVP_DEFAULT_PROFILE_ID];
}

/**
 * Change le profil d'usage actif et sauvegarde dans APP.
 * Compatible avec la structure APP.userProfile existante.
 * @param {string} profileId - 'particulier' | 'passionne' | 'maraicher'
 * @returns {boolean} true si changement effectué
 */
function setCurrentUsageProfile(profileId) {
  if (!GVP_USAGE_PROFILES[profileId]) {
    console.warn('[GVP Profiles] Profil inconnu :', profileId);
    return false;
  }
  if (!APP.userProfile) {
    APP.userProfile = { name:'', level:'', spaceType:'', goals:[], onboardingDone:false };
  }
  APP.userProfile.usageProfile = profileId;
  if (typeof saveData === 'function') saveData();
  return true;
}

/**
 * Vérifie si une fonctionnalité est activée pour le profil actif.
 * @param {string} featureKey - clé de enabledFeatures
 * @returns {boolean}
 */
function isFeatureEnabled(featureKey) {
  var profile = getCurrentUsageProfile();
  return !!(profile.enabledFeatures && profile.enabledFeatures[featureKey]);
}


// ============================================================
// 3. RÈGLES MÉTIER PAR PROFIL
// ============================================================

/**
 * Retourne les règles métier complètes pour un profil donné.
 * Ces règles définissent le comportement de chaque module.
 *
 * @param {string} profileId
 * @returns {ProfileRules}
 */
function getProfileRules(profileId) {
  var profile = GVP_USAGE_PROFILES[profileId] || GVP_USAGE_PROFILES[GVP_DEFAULT_PROFILE_ID];

  return {
    profileId: profile.id,

    // ---- Recommandations ----
    recommendations: {
      maxItems:          profile.maxRecommendations,
      includeRotation:   profile.enabledFeatures.rotationWarnings,
      includeYieldOpt:   profile.enabledFeatures.yieldOptimization,
      style:             profile.recommendationStyle,  // simple / balanced / dense
      urgencyThreshold:  profile.urgencyThreshold       // low / medium / high
    },

    // ---- Notifications ----
    notifications: {
      frequency:         profile.notificationFrequency, // low / medium / high
      maxActive:         profile.maxNotifications,
      dailyAlerts:       profile.enabledFeatures.dailyAlerts,
      weeklyDigest:      profile.enabledFeatures.weeklyDigest,
      urgencyThreshold:  profile.urgencyThreshold,
      // Catégories autorisées par profil
      allowedCategories: _getAllowedCategories(profile.id)
    },

    // ---- Analyse ----
    analysis: {
      showAdvanced:      profile.enabledFeatures.advancedAnalysis,
      showRiskEngine:    profile.enabledFeatures.riskEngine,
      showOpportunities: profile.enabledFeatures.opportunityEngine
    },

    // ---- Ton / affichage ----
    display: {
      tone:     profile.tone.style,
      verbose:  profile.tone.verbosity !== 'short',
      showEmoji:profile.tone.emoji,
      technical:profile.tone.technical
    }
  };
}

function _getAllowedCategories(profileId) {
  var all = ['harvest', 'weather', 'watering', 'rotation', 'planting', 'optimization'];
  var maps = {
    particulier: ['harvest', 'weather', 'watering', 'planting'],
    passionne:   all,
    maraicher:   all
  };
  return maps[profileId] || all;
}


// ============================================================
// 4. ADAPTATION DES RECOMMANDATIONS
// ============================================================

/**
 * Filtre et adapte le ton des recommandations selon le profil.
 * Prend en entrée n'importe quelle liste de recommandations
 * (format { id, title, text, priority, ... }).
 *
 * @param {string}  profileId
 * @param {Array}   baseRecommendations
 * @returns {Array} recommandations adaptées et filtrées
 */
function getProfileAdjustedRecommendations(profileId, baseRecommendations) {
  if (!baseRecommendations || !baseRecommendations.length) return [];

  var rules   = getProfileRules(profileId);
  var profile = GVP_USAGE_PROFILES[profileId] || GVP_USAGE_PROFILES[GVP_DEFAULT_PROFILE_ID];
  var allowed = rules.notifications.allowedCategories;

  // 1. Filtrer selon urgencyThreshold et catégories autorisées
  var filtered = baseRecommendations.filter(function(r) {
    // Filtre urgence
    if (rules.recommendations.urgencyThreshold === 'high') {
      if (r.priority === 'low' || r.priority === 'suggestion') return false;
    } else if (rules.recommendations.urgencyThreshold === 'medium') {
      if (r.priority === 'low') return false;
    }
    // Filtre catégorie (si le champ existe)
    if (r.type && allowed.indexOf(r.type) < 0) return false;
    // Filtre rotation si désactivée
    if (r.type === 'rotation' && !rules.recommendations.includeRotation) return false;
    return true;
  });

  // 2. Limiter le nombre
  filtered = filtered.slice(0, rules.recommendations.maxItems);

  // 3. Adapter le ton du texte
  return filtered.map(function(r) {
    return _adaptRecommendationTone(r, profile);
  });
}

/**
 * Adapte le texte d'une recommandation selon le ton du profil.
 * @param {Object} reco
 * @param {ProfileDefinition} profile
 * @returns {Object} reco avec text/title potentiellement adaptés
 */
function _adaptRecommendationTone(reco, profile) {
  var adapted = Object.assign({}, reco); // clone shallow

  switch (profile.tone.style) {

    case 'friendly':
      // Particulier — ajouter un emoji de contexte si absent, simplifier
      if (profile.tone.emoji && adapted.title && !adapted.title.match(/^\p{Emoji}/u)) {
        var emoji = _getContextEmoji(reco.type);
        if (emoji) adapted.title = emoji + ' ' + adapted.title;
      }
      // Tronquer les textes trop longs pour ce profil
      if (adapted.text && adapted.text.length > 90) {
        adapted.text = adapted.text.substring(0, 87) + '…';
      }
      break;

    case 'enthusiastic':
      // Passionné — garder intégral, ajouter la mention du gain potentiel
      if (adapted.estimatedYieldGain && adapted.estimatedYieldGain > 0) {
        adapted.text = (adapted.text || '') +
          ' Gain potentiel estimé : +' + adapted.estimatedYieldGain.toFixed(1) + ' kg.';
      }
      break;

    case 'operational':
      // Maraîcher — format opérationnel, retirer les emojis, ajouter les chiffres
      adapted.title = (adapted.title || '').replace(/[\u{1F300}-\u{1FFFF}]/gu, '').trim();
      if (adapted.impact) {
        adapted.text = '[Impact: ' + adapted.impact.toUpperCase() + '] ' + (adapted.text || '');
      }
      break;
  }

  return adapted;
}

function _getContextEmoji(type) {
  var map = {
    harvest:      '🎉',
    weather:      '🌤️',
    watering:     '💧',
    rotation:     '🔄',
    planting:     '🌱',
    optimization: '📊',
    frost:        '🥶',
    heat:         '☀️',
    free_space:   '📦',
    high_performer:'⭐'
  };
  return map[type] || '';
}


// ============================================================
// 5. POLITIQUE DE NOTIFICATIONS PAR PROFIL
// ============================================================

/**
 * Retourne la politique de notifications pour un profil.
 * Ce retour peut être utilisé par getSmartNotifications() et
 * renderNotifications() pour filtrer/prioriser.
 *
 * @param {string} profileId
 * @returns {{
 *   frequency:        string,
 *   maxActive:        number,
 *   quietMode:        boolean,
 *   urgencyThreshold: string,
 *   categories:       string[],
 *   snoozeDefault:    number,
 *   dailyAlerts:      boolean,
 *   weeklyDigest:     boolean
 * }}
 */
function getProfileNotificationPolicy(profileId) {
  var rules   = getProfileRules(profileId);
  var profile = GVP_USAGE_PROFILES[profileId] || GVP_USAGE_PROFILES[GVP_DEFAULT_PROFILE_ID];

  return {
    frequency:        rules.notifications.frequency,
    maxActive:        rules.notifications.maxActive,
    quietMode:        profile.usageRhythm === 'weekly', // particulier → mode silencieux
    urgencyThreshold: rules.notifications.urgencyThreshold,
    categories:       rules.notifications.allowedCategories,
    // Délai de snooze par défaut (en jours) selon profil
    snoozeDefault:    profile.id === 'particulier' ? 14 : profile.id === 'maraicher' ? 3 : 7,
    dailyAlerts:      rules.notifications.dailyAlerts,
    weeklyDigest:     rules.notifications.weeklyDigest
  };
}


// ============================================================
// 6. DÉTECTION AUTOMATIQUE DU PROFIL SUGGÉRÉ
// ============================================================

/**
 * Analyse les données de l'utilisateur pour suggérer le profil le plus adapté.
 * Utilisé comme fallback si aucun profil n'est défini.
 *
 * Heuristiques :
 *   - Nb de bacs > 5 → maraicher
 *   - Goals incluent 'rendement' + 'autonomie' → maraicher
 *   - Goals incluent 'apprentissage' + level avance/expert → passionne
 *   - Goals incluent 'plaisir' seul → particulier
 *   - Surface totale > 20m² → maraicher
 *   - Par défaut → passionne
 *
 * @returns {string} profileId suggéré
 */
function detectSuggestedProfile() {
  var prof   = APP.userProfile || {};
  var goals  = prof.goals || [];
  var level  = prof.level || 'debutant';
  var nbBeds = APP.beds ? APP.beds.length : 0;

  // Surface totale des bacs
  var totalSurf = (APP.beds || []).reduce(function(s, b) {
    return s + ((b.length || 0) * (b.width || 0));
  }, 0);

  // Maraîcher : surface importante ou beaucoup de bacs ou focus rendement+autonomie
  if (totalSurf > 20 || nbBeds > 5) return 'maraicher';
  if (goals.indexOf('rendement') >= 0 && goals.indexOf('autonomie') >= 0) return 'maraicher';

  // Particulier : focus plaisir sans rendement ni apprentissage
  if (goals.indexOf('plaisir') >= 0 &&
      goals.indexOf('rendement') < 0 &&
      goals.indexOf('apprentissage') < 0) return 'particulier';

  // Passionné : apprentissage ou niveau avancé
  if (goals.indexOf('apprentissage') >= 0) return 'passionne';
  if (level === 'avance' || level === 'expert') return 'passionne';

  // Particulier par défaut si débutant sans objectif précis
  if (level === 'debutant' && goals.length <= 1) return 'particulier';

  return GVP_DEFAULT_PROFILE_ID;
}


// ============================================================
// 7. PRÉPARATION ONBOARDING FUTUR
// ============================================================

/**
 * Retourne la configuration de l'étape "choix du profil d'usage"
 * à intégrer dans l'onboarding futur.
 *
 * Cette fonction est préparatoire — elle peut être branchée dans
 * _buildOnbStep() (onboarding.js) sans modifier l'existant.
 * Il suffira d'ajouter une étape supplémentaire et d'appeler
 * getProfileOnboardingStep() pour obtenir les options à afficher.
 *
 * @returns {{
 *   title: string,
 *   subtitle: string,
 *   options: Array<{value, icon, label, description}>,
 *   fieldKey: string,
 *   onSelect: string   -- nom de la fonction à appeler
 * }}
 */
function getProfileOnboardingStep() {
  return {
    title:    'Comment utilisez-vous votre jardin\u00a0?',
    subtitle: 'Cela personnalisera vos conseils et alertes.',
    fieldKey: 'usageProfile',
    onSelect: 'setCurrentUsageProfile',
    options:  getAvailableProfiles().map(function(p) {
      return {
        value:       p.id,
        icon:        p.icon,
        label:       p.shortName,
        description: p.description,
        isDefault:   p.id === detectSuggestedProfile()
      };
    })
  };
}


// ============================================================
// 8. RENDUS HTML (légers, branchables)
// ============================================================

/**
 * Génère le sélecteur de profil HTML pour les Réglages.
 * Branchable dans settings.js avec : renderProfileSection()
 * sans modifier renderSettings().
 */
function renderProfileSection() {
  var currentId = getCurrentUsageProfileId();
  var profiles  = getAvailableProfiles();

  var html = '<div class="section-title">\uD83C\uDF31 Mode d\'utilisation</div>' +
    '<div class="card" style="padding:4px 0;">';

  profiles.forEach(function(p) {
    var isActive = p.id === currentId;
    var borderColor = isActive ? 'var(--green-700)' : 'transparent';
    html +=
      '<div style="display:flex;align-items:center;gap:12px;padding:12px 14px;' +
        'border-left:3px solid ' + borderColor + ';' +
        'cursor:pointer;transition:background var(--transition);" ' +
        'onclick="setCurrentUsageProfile(\'' + p.id + '\');' +
        (typeof renderSettings === 'function' ? 'renderSettings()' : '') + '">' +
        '<div style="font-size:1.4rem;">' + p.icon + '</div>' +
        '<div style="flex:1;">' +
          '<div style="font-size:0.85rem;font-weight:' + (isActive ? '700' : '600') + ';' +
            'color:' + (isActive ? 'var(--green-900)' : 'var(--text)') + ';">' +
            p.shortName +
            (isActive ? ' <span style="font-size:0.68rem;background:var(--green-100);color:var(--green-700);padding:1px 6px;border-radius:8px;font-weight:700;">Actif</span>' : '') +
          '</div>' +
          '<div style="font-size:0.73rem;color:var(--text-light);margin-top:2px;">' +
            p.description +
          '</div>' +
        '</div>' +
      '</div>';
  });

  html += '</div>';
  return html;
}

/**
 * Génère une ligne de badge profil compact (pour dashboard, etc.)
 */
function buildProfileBadge() {
  var p = getCurrentUsageProfile();
  return '<span style="font-size:0.7rem;font-weight:600;padding:2px 8px;' +
    'background:var(--green-100);color:var(--green-900);border-radius:8px;">' +
    p.icon + ' ' + p.shortName +
    '</span>';
}
