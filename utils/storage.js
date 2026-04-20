// Green Vibes — utils/storage.js
// Persistance : saveData, loadData, import, export
// Dépend de : APP (global)
// ========== PERSISTENCE ==========
const DATA_VERSION = '1.0';

function saveData() {
  try {
    const data = getAppStateDeep();
    localStorage.setItem('gvp_data', JSON.stringify({ version: DATA_VERSION, data: data }));
  } catch(e) {
    console.error('Erreur sauvegarde:', e);
  }
}

function loadData() {
  try {
    const raw = localStorage.getItem('gvp_data');
    if (raw) {
      const stored = JSON.parse(raw);
      let d = stored.data || stored; // Support anciennes versions sans version

      // Migration si version ancienne
      if (!stored.version || stored.version !== DATA_VERSION) {
        d = migrateData(d, stored.version || '0.0');
      }

      // Fusionner avec valeurs par défaut
      Object.keys(d).forEach(key => updateAppState(key, d[key]));
      if (!getAppState('vegetables') || Object.keys(getAppState('vegetables')).length === 0) {
        updateAppState('vegetables', JSON.parse(JSON.stringify(DEFAULT_VEGETABLES)));
      } else {
        // Ajouter les nouveaux légumes du référentiel aux utilisateurs existants
        var savedVegs = getAppState('vegetables');
        var newAdded = false;
        Object.keys(DEFAULT_VEGETABLES).forEach(function(id) {
          if (!savedVegs[id]) {
            savedVegs[id] = JSON.parse(JSON.stringify(DEFAULT_VEGETABLES[id]));
            newAdded = true;
          }
        });
        if (newAdded) { updateAppState('vegetables', savedVegs); }
      }
      if (!getAppState('location') || !getAppState('location').lat) {
        updateAppState('location', { lat: 43.4984, lon: 1.3139, name: 'Seysses' });
      }
      if (!getAppState('completedTasks')) updateAppState('completedTasks', []);
      if (!getAppState('seasons') || !getAppState('seasons').length) updateAppState('seasons', ['2026']);
      if (!getAppState('currentSeason')) updateAppState('currentSeason', '2026');
      if (!getAppState('beds')) updateAppState('beds', []);
      if (!getAppState('crops')) updateAppState('crops', []);
      if (!getAppState('settings')) updateAppState('settings', { theme: 'default', languageChosen: false });
      // Migration: existing users (with beds or crops) skip the language picker
      var _st = getAppState('settings');
      if (_st && !_st.veggieFavorites) { _st.veggieFavorites = []; updateAppState('settings', _st); }
      if (_st && _st.languageChosen === undefined) {
        var _hasBeds = (getAppState('beds') || []).length > 0;
        var _hasCrops = (getAppState('crops') || []).length > 0;
        _st.languageChosen = _hasBeds || _hasCrops;
        updateAppState('settings', _st);
      }
      if (!getAppState('language')) updateAppState('language', 'fr');
      if (!getAppState('userProfile')) updateAppState('userProfile', { name:'', level:'', spaceType:'', goals:[], onboardingDone:false });
      if (!getAppState('notificationsRead')) updateAppState('notificationsRead', []);
      if (!getAppState('notificationsIgnored')) updateAppState('notificationsIgnored', []);
    } else {
      updateAppState('vegetables', JSON.parse(JSON.stringify(DEFAULT_VEGETABLES)));
      updateAppState('beds', []);
      updateAppState('crops', []);
      updateAppState('seasons', ['2026']);
      updateAppState('currentSeason', '2026');
      updateAppState('location', { lat: 43.4984, lon: 1.3139, name: 'Seysses' });
      updateAppState('completedTasks', []);
      updateAppState('settings', { theme: 'default' });
      updateAppState('language', 'fr');
      updateAppState('userProfile', { name:'', level:'', spaceType:'', goals:[], onboardingDone:false });
      updateAppState('notificationsRead', []);
      updateAppState('notificationsIgnored', []);
    }
    // Correction automatique des statuts planned / active
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let migrated = false;
    getAppState('crops').forEach(function(crop) {
      if (!crop || crop.status === 'harvested') return;
      if (!crop.startType) { crop.startType = 'plant'; migrated = true; }
      if (!crop.datePlant) return;
      const plantDate = new Date(crop.datePlant);
      if (isNaN(plantDate.getTime())) return;
      plantDate.setHours(0, 0, 0, 0);
      const newStatus = plantDate > today ? 'planned' : 'active';
      if (crop.status !== newStatus) { crop.status = newStatus; migrated = true; }
    });
    if (migrated) saveData();
  } catch (e) {
    console.error('Erreur chargement:', e);
    updateAppState('vegetables', JSON.parse(JSON.stringify(DEFAULT_VEGETABLES)));
    updateAppState('beds', []);
    updateAppState('crops', []);
    updateAppState('seasons', ['2026']);
    updateAppState('currentSeason', '2026');
    updateAppState('location', { lat: 43.4984, lon: 1.3139, name: 'Seysses' });
    updateAppState('completedTasks', []);
    updateAppState('settings', { theme: 'default' });
  }
}

// ========== MIGRATION ==========
function migrateData(data, fromVersion) {
  if (parseFloat(fromVersion) < 1.0) {
    // Ajouter champ manquant si nécessaire
    if (!data.notificationsRead) data.notificationsRead = [];
    if (!data.notificationsIgnored) data.notificationsIgnored = [];
  }
  return data;
}

function cleanOrphanVeggies() {
  // Supprimer les cultures qui référencent un légume supprimé (ex: v46 Pois gourmand)
  var crops = getAppState('crops');
  var vegetables = getAppState('vegetables');
  var cleaned = crops.filter(function(c) { return c && vegetables[c.veggieId]; });
  if (cleaned.length !== crops.length) {
    updateAppState('crops', cleaned);
  }
}

function genId() { return 'id_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7); }
