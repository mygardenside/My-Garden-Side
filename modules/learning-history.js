// Green Vibes — modules/learning-history.js
// ============================================================
// RÔLE    : Persistance de l'historique des récoltes (gvp_history).
// DÉPEND  : learning-memory.js (rebuildLearningMemory),
//           utils/calculations.js (getCropEstimatedYield),
//           core.js (getAppState, genId)
// GÈRE    : loadHistory, saveHistory, addHistoryEntry,
//           pruneOrphanHistory, getMergedHarvestData
// NE GÈRE PAS : mémoire d'apprentissage, calculs stats, rendu HTML
//
// Format localStorage : { version: '1.0', data: entries[] }
// Migration automatique si version différente.
// ============================================================

var HISTORY_KEY = 'gvp_history';
const HISTORY_VERSION = '1.0';

/** Charger l'historique depuis localStorage. */
function loadHistory() {
  try {
    var raw = localStorage.getItem(HISTORY_KEY);
    if (raw) {
      var stored = JSON.parse(raw);
      if (!stored.version || stored.version !== HISTORY_VERSION) {
        stored.data = migrateHistoryData(stored.data || stored, stored.version || '0.0');
        stored.version = HISTORY_VERSION;
        saveHistory(stored.data);
      }
      return stored.data;
    }
    return [];
  } catch (e) {
    console.error('loadHistory:', e);
    return [];
  }
}

/** Sauvegarder l'historique en localStorage. */
function saveHistory(entries) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify({ version: HISTORY_VERSION, data: entries }));
  } catch (e) {
    console.error('saveHistory:', e);
  }
}

/** Migration pour historique. */
function migrateHistoryData(data, fromVersion) {
  if (fromVersion < '1.0') {
    data.forEach(function(entry) {
      if (!entry.weather) entry.weather = null;
    });
  }
  return data;
}

/** Ajouter une entree d'historique. */
function addHistoryEntry(crop, realYield, weatherContext) {
  var history = loadHistory();
  var entry = {
    id: genId(),
    cropId: crop.id,
    vegetableId: crop.veggieId,
    bedId: crop.bedId,
    season: crop.season,
    date: new Date().toISOString().split('T')[0],
    realYield: realYield,
    estimatedYield: getCropEstimatedYield(crop),
    durationDays: crop.datePlant ? Math.floor((new Date() - new Date(crop.datePlant)) / 86400000) : null,
    weather: weatherContext,
    notes: crop.notes || ''
  };
  history.push(entry);
  saveHistory(history);
  // Reconstruire la memoire d'apprentissage
  rebuildLearningMemory();
}

/** Supprimer les entrees orphelines (crops supprimes). */
function pruneOrphanHistory() {
  var history = loadHistory();
  var cropIds = getAppState('crops').map(function(c){ return c.id; });
  var pruned = history.filter(function(h){ return cropIds.includes(h.cropId); });
  if (pruned.length !== history.length) {
    saveHistory(pruned);
  }
}

/** Fusionner historique + crops actifs pour analyse. */
function getMergedHarvestData() {
  var history = loadHistory();
  var active = getAppState('crops').filter(function(c){ return c.status === 'harvested'; }).map(function(c){
    return {
      id: c.id,
      cropId: c.id,
      vegetableId: c.veggieId,
      bedId: c.bedId,
      season: c.season,
      date: c.dateHarvest || new Date().toISOString().split('T')[0],
      realYield: c.realYield || 0,
      estimatedYield: getCropEstimatedYield(c),
      durationDays: c.datePlant ? Math.floor((new Date(c.dateHarvest || new Date()) - new Date(c.datePlant)) / 86400000) : null,
      weather: null, // pas dispo pour actifs
      notes: c.notes || ''
    };
  });
  return history.concat(active);
}