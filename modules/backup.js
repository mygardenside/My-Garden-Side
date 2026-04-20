/**
 * Green Vibes — modules/backup.js
 * Système de sauvegardes locales automatiques dans localStorage.
 *
 * Fonctions exposées :
 *   createLocalBackup(label)  — crée une sauvegarde nommée (max 5 gardées)
 *   restoreLatestBackup()     — restaure la sauvegarde la plus récente
 *   restoreBackup(index)      — restaure une sauvegarde spécifique (0 = plus récente)
 *   listBackups()             — retourne [{index, label, date, size}]
 *   deleteBackup(index)       — supprime une sauvegarde
 *
 * Stockage : localStorage clé 'gvp_backups'
 *   Format : tableau d'objets { id, label, date, snapshot }
 *   Maximum 5 sauvegardes — la plus ancienne est supprimée automatiquement.
 *
 * Dépend de : APP, saveData() (dans storage.js), navigate()
 */

var GVP_BACKUP_KEY  = 'gvp_backups';
var GVP_BACKUP_MAX  = 5;

// ---- Lecture / écriture du store de backups ----
function _loadBackupStore() {
  try {
    var raw = localStorage.getItem(GVP_BACKUP_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch(e) {
    return [];
  }
}

function _saveBackupStore(store) {
  try {
    localStorage.setItem(GVP_BACKUP_KEY, JSON.stringify(store));
    return true;
  } catch(e) {
    console.error('GVP Backup — erreur localStorage:', e);
    return false;
  }
}

// ---- Snapshot complet de l'état courant ----
function _buildSnapshot() {
  return {
    app: JSON.parse(JSON.stringify(APP)),  // deep clone de l'état APP
    harvestHistory: (function() {
      try { return typeof loadHistory === 'function' ? loadHistory() : []; }
      catch(e) { return []; }
    })(),
    learningMemory: (function() {
      try { return typeof loadLearningMemory === 'function' ? loadLearningMemory() : null; }
      catch(e) { return null; }
    })(),
    notificationsStore: (function() {
      try { return typeof loadNotifStore === 'function' ? loadNotifStore() : null; }
      catch(e) { return null; }
    })()
  };
}

// ============================================================
// createLocalBackup(label)
// Crée une nouvelle sauvegarde. Supprime la plus ancienne si > MAX.
// label : chaîne libre (ex: "avant saison 2026", "sauvegarde manuelle")
// ============================================================
function createLocalBackup(label) {
  var store    = _loadBackupStore();
  var snapshot = _buildSnapshot();
  var now      = new Date();

  var appData = snapshot.app || snapshot.data || {};
  var entry = {
    id:       'bkp_' + now.getTime(),
    label:    label || 'Sauvegarde du ' + fmtDate(now),
    date:     now.toISOString(),
    dateStr:  fmtDate(now) + ' ' + now.toLocaleTimeString((typeof getAppState === 'function' && getAppState('language') === 'en') ? 'en-GB' : 'fr-FR', { hour: '2-digit', minute: '2-digit' }),
    beds:     (appData.beds || []).length,
    crops:    (appData.crops || []).length,
    season:   appData.currentSeason || '?',
    snapshot: snapshot
  };

  // Ajouter en tête (la plus récente en premier)
  store.unshift(entry);

  // Garder max GVP_BACKUP_MAX sauvegardes
  if (store.length > GVP_BACKUP_MAX) {
    store = store.slice(0, GVP_BACKUP_MAX);
  }

  var ok = _saveBackupStore(store);
  if (ok) {
    alert('✅ Sauvegarde créée : ' + entry.label);
  } else {
    alert('❌ Erreur lors de la sauvegarde. localStorage peut être plein.');
  }
  return ok;
}

// ============================================================
// listBackups()
// Retourne la liste des sauvegardes sans les snapshots (léger).
// ============================================================
function listBackups() {
  var store = _loadBackupStore();
  return store.map(function(entry, idx) {
    return {
      index:   idx,
      id:      entry.id,
      label:   entry.label,
      dateStr: entry.dateStr || entry.date,
      date:    entry.date,
      beds:    entry.beds || 0,
      crops:   entry.crops || 0,
      season:  entry.season || '?'
    };
  });
}

// ============================================================
// restoreBackup(index)
// Restaure la sauvegarde à l'index donné (0 = la plus récente).
// ============================================================
function restoreBackup(index) {
  var store = _loadBackupStore();
  if (!store[index]) {
    alert('❌ Aucune sauvegarde trouvée à l\'index ' + index);
    return false;
  }

  var entry    = store[index];
  var snapshot = entry.snapshot;
  if (!snapshot || !snapshot.app) {
    alert('❌ Sauvegarde corrompue.');
    return false;
  }

  if (!confirm('Restaurer "' + entry.label + '" du ' + entry.dateStr + ' ?\n\nL\'état actuel sera remplacé.')) {
    return false;
  }

  try {
    // Restaurer APP
    var appData = snapshot.app;
    Object.keys(appData).forEach(function(key) {
      APP[key] = appData[key];
    });
    saveData();

    // Restaurer l'historique si disponible
    if (snapshot.harvestHistory && typeof saveHistory === 'function') {
      saveHistory(snapshot.harvestHistory);
    }

    // Restaurer la mémoire IA si disponible
    if (snapshot.learningMemory && typeof saveLearningMemory === 'function') {
      saveLearningMemory(snapshot.learningMemory);
    }

    // Restaurer les notifications si disponible
    if (snapshot.notificationsStore && typeof saveNotifStore === 'function') {
      saveNotifStore(snapshot.notificationsStore);
    }

    // Recharger l'application proprement
    if (typeof navigate === 'function') {
      navigate('dashboard');
    } else {
      window.location.reload();
    }

    alert('✅ Restauration réussie : ' + entry.label);
    return true;
  } catch(e) {
    console.error('GVP Backup — erreur restauration:', e);
    alert('❌ Erreur lors de la restauration : ' + e.message);
    return false;
  }
}

// ============================================================
// restoreLatestBackup()
// Raccourci — restaure la sauvegarde la plus récente (index 0).
// ============================================================
function restoreLatestBackup() {
  return restoreBackup(0);
}

// ============================================================
// deleteBackup(index)
// Supprime la sauvegarde à l'index donné.
// ============================================================
function deleteBackup(index) {
  var store = _loadBackupStore();
  if (!store[index]) return false;
  var label = store[index].label;
  if (!confirm('Supprimer la sauvegarde "' + label + '" ?')) return false;
  store.splice(index, 1);
  _saveBackupStore(store);
  return true;
}

// ============================================================
// renderBackupPanel()
// Génère le HTML du panneau de sauvegardes pour les Réglages.
// Appelable depuis settings.js sans modifier ce fichier.
// ============================================================
function renderBackupPanel() {
  var backups = listBackups();
  var html = '<div class="section-title">\uD83D\uDCBE Sauvegardes locales</div>';

  html += '<div class="card" style="padding:14px 16px;">';

  // Bouton créer
  html += '<button class="btn btn-secondary btn-block" style="margin-bottom:10px;" ' +
    'onclick="createLocalBackup(\'\')">' +
    '\uD83D\uDCBE Créer une sauvegarde maintenant</button>';

  if (backups.length === 0) {
    html += '<div style="text-align:center;color:var(--text-light);font-size:0.82rem;padding:10px 0;">Aucune sauvegarde</div>';
  } else {
    html += '<div style="font-size:0.72rem;color:var(--text-light);margin-bottom:8px;">' +
      backups.length + '/' + GVP_BACKUP_MAX + ' sauvegarde' + (backups.length > 1 ? 's' : '') +
      ' — la plus ancienne est supprimée automatiquement</div>';

    backups.forEach(function(b) {
      html +=
        '<div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid #f3f4f6;">' +
          '<div style="flex:1;min-width:0;">' +
            '<div style="font-size:0.82rem;font-weight:600;color:var(--text);">' + escH(b.label) + '</div>' +
            '<div style="font-size:0.7rem;color:var(--text-light);">' +
              b.dateStr + ' \u00B7 ' + b.beds + ' espace' + (b.beds !== 1 ? 's' : '') +
              ' \u00B7 ' + b.crops + ' culture' + (b.crops !== 1 ? 's' : '') +
              ' \u00B7 Saison ' + b.season +
            '</div>' +
          '</div>' +
          '<button class="btn btn-sm btn-secondary" onclick="restoreBackup(' + b.index + ')">Restaurer</button>' +
          '<button class="btn btn-sm btn-danger" onclick="deleteBackup(' + b.index + ');renderSettings()">🗑</button>' +
        '</div>';
    });
  }

  html += '</div>';
  return html;
}
