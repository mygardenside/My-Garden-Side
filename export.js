/**
 * Green Vibes — modules/export.js
 * Fonctions d'export canoniques.
 *
 * Fonctions exposées :
 *   exportAppData()      — JSON complet incluant historique + mémoire IA (CANONICAL)
 *   exportData()         — JSON léger (APP uniquement, défini dans settings.js)
 *   exportHarvestsCSV()  — CSV des récoltes (nom, bac, date, kg réel, kg estimé)
 *   exportAnalysisCSV()  — CSV de la performance par légume et par bac
 *
 * Dépend de : APP, loadHistory(), loadLearningMemory(), loadNotifStore()
 * (toutes définies dans les modules existants)
 */

// ============================================================
// HELPER INTERNE — téléchargement générique
// ============================================================
function _gvpDownload(content, filename, mimeType) {
  var blob = new Blob([content], { type: mimeType });
  var url  = URL.createObjectURL(blob);
  var a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ============================================================
// HELPER INTERNE — construire une ligne CSV propre
// ============================================================
function _csvRow(fields) {
  return fields.map(function(f) {
    var s = String(f === null || f === undefined ? '' : f);
    // Échapper guillemets et encapsuler si nécessaire
    if (s.indexOf(',') >= 0 || s.indexOf('"') >= 0 || s.indexOf('\n') >= 0) {
      s = '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  }).join(',');
}

// ============================================================
// 1. EXPORT JSON COMPLET (fonction canonique)
// Inclut APP + historique récoltes + mémoire IA + notifications
// ============================================================
/**
 * Exporte un snapshot complet de l'application au format JSON.
 * Inclut : APP, gvp_history, gvp_learning_memory, gvp_notif_store.
 * Fichier nommé : my-garden-side-full-YYYY-MM-DD.json
 * Appelée par : settings.js (bouton "Export complet"), pwa.js
 */
function exportAppData() {
  var today = new Date().toISOString().split('T')[0];

  var payload = {
    _meta: {
      version:    '22',
      exportedAt: new Date().toISOString(),
      appName:    'My Garden Side',
      exportType: 'full'
    },
    // État principal de l'application
    app: {
      beds:          APP.beds,
      crops:         APP.crops,
      vegetables:    APP.vegetables,
      seasons:       APP.seasons,
      currentSeason: APP.currentSeason,
      location:      APP.location,
      settings:      APP.settings,
      language:      APP.language,
      userProfile:   APP.userProfile,
      completedTasks: APP.completedTasks
    },
    // Historique persistant des récoltes (gvp_history)
    harvestHistory: (function() {
      try { return typeof loadHistory === 'function' ? loadHistory() : []; }
      catch(e) { return []; }
    })(),
    // Mémoire d'apprentissage IA (gvp_learning_memory)
    learningMemory: (function() {
      try { return typeof loadLearningMemory === 'function' ? loadLearningMemory() : null; }
      catch(e) { return null; }
    })(),
    // Historique notifications (gvp_notif_store)
    notificationsStore: (function() {
      try { return typeof loadNotifStore === 'function' ? loadNotifStore() : null; }
      catch(e) { return null; }
    })()
  };

  var json = JSON.stringify(payload, null, 2);
  _gvpDownload(json, 'my-garden-side-full-' + today + '.json', 'application/json');
}

// ============================================================
// 2. EXPORT RÉCOLTES CSV
// Une ligne par culture récoltée, toutes saisons confondues
// ============================================================
/**
 * Exporte toutes les récoltes en CSV.
 * Colonnes : Saison, Légume, Bac, Planté le, Récolté prévu, Estimé (kg), Réel (kg), Performance (%)
 */
function exportHarvestsCSV() {
  var today   = new Date().toISOString().split('T')[0];
  var headers = ['Saison','Legume','Famille','Bac','Plante le','Recolte prevue','Estime (kg)','Reel (kg)','Performance (%)'];
  var rows    = [_csvRow(headers)];

  // Cultures récoltées dans APP
  var harvested = APP.crops.filter(function(c) { return c.status === 'harvested'; });
  harvested.forEach(function(c) {
    var veg  = APP.vegetables[c.veggieId];
    var bed  = APP.beds.find(function(b) { return b.id === c.bedId; });
    var est  = typeof getCropEstimatedYield === 'function' ? getCropEstimatedYield(c) : 0;
    var real = c.yieldReal || 0;
    var perf = est > 0 ? Math.round((real / est) * 100) : '';
    rows.push(_csvRow([
      c.season || '',
      veg ? veg.name : c.veggieId,
      veg ? (veg.family || '') : '',
      bed ? bed.name : 'Sans espace',
      c.datePlant || '',
      c.dateHarvest || '',
      est.toFixed(2),
      real.toFixed(2),
      perf
    ]));
  });

  // Ajouter aussi l'historique persistant si disponible
  if (typeof loadHistory === 'function') {
    var hist = loadHistory();
    hist.forEach(function(entry) {
      // Éviter les doublons avec les entrées APP déjà ajoutées
      var alreadyIn = harvested.some(function(c) { return c.id === entry.cropId; });
      if (alreadyIn) return;
      var est  = entry.estimatedYield || 0;
      var real = entry.realYield || 0;
      var perf = est > 0 ? Math.round((real / est) * 100) : '';
      rows.push(_csvRow([
        entry.season || '',
        entry.veggieName || '',
        entry.veggieFamily || '',
        entry.bedName || 'Sans espace',
        entry.datePlant || '',
        entry.dateHarvest || '',
        est.toFixed ? est.toFixed(2) : est,
        real.toFixed ? real.toFixed(2) : real,
        perf
      ]));
    });
  }

  _gvpDownload(rows.join('\n'), 'my-garden-side-recoltes-' + today + '.csv', 'text/csv;charset=utf-8;');
}

// ============================================================
// 3. EXPORT ANALYSE CSV
// Performance par légume et par bac, toutes saisons confondues
// ============================================================
/**
 * Exporte deux tableaux de performance en CSV :
 * - Performance par légume (rendement moyen, nb récoltes)
 * - Performance par bac (occupation, récoltes totales)
 */
function exportAnalysisCSV() {
  var today  = new Date().toISOString().split('T')[0];
  var output = '';

  // ---- Tableau 1 : par légume ----
  output += 'PERFORMANCE PAR LEGUME\n';
  output += _csvRow(['Legume','Famille','Nb recoltes','Rendement estime total (kg)','Rendement reel total (kg)','Performance moy. (%)']) + '\n';

  var byVeggie = {};
  APP.crops.filter(function(c) { return c.status === 'harvested'; }).forEach(function(c) {
    var veg = APP.vegetables[c.veggieId]; if (!veg) return;
    if (!byVeggie[c.veggieId]) byVeggie[c.veggieId] = { name: veg.name, family: veg.family || '', estTotal: 0, realTotal: 0, count: 0 };
    var est = typeof getCropEstimatedYield === 'function' ? getCropEstimatedYield(c) : 0;
    byVeggie[c.veggieId].estTotal  += est;
    byVeggie[c.veggieId].realTotal += (c.yieldReal || 0);
    byVeggie[c.veggieId].count++;
  });

  Object.values(byVeggie).sort(function(a, b) { return b.realTotal - a.realTotal; }).forEach(function(v) {
    var perf = v.estTotal > 0 ? Math.round((v.realTotal / v.estTotal) * 100) : '';
    output += _csvRow([v.name, v.family, v.count, v.estTotal.toFixed(2), v.realTotal.toFixed(2), perf]) + '\n';
  });

  output += '\n';

  // ---- Tableau 2 : par bac ----
  output += 'PERFORMANCE PAR BAC\n';
  output += _csvRow(['Bac','Surface (m2)','Nb recoltes','Rendement reel total (kg)','Occupation actuelle (%)']) + '\n';

  APP.beds.forEach(function(bed) {
    var recoltes = APP.crops.filter(function(c) { return c.bedId === bed.id && c.status === 'harvested'; });
    var surf     = typeof getBedSurface === 'function' ? getBedSurface(bed) : (bed.length * bed.width);
    var occ      = typeof getBedOccupation === 'function' ? getBedOccupation(bed) : 0;
    var realKg   = recoltes.reduce(function(s, c) { return s + (c.yieldReal || 0); }, 0);
    output += _csvRow([bed.name, surf.toFixed(2), recoltes.length, realKg.toFixed(2), occ]) + '\n';
  });

  _gvpDownload(output, 'my-garden-side-analyse-' + today + '.csv', 'text/csv;charset=utf-8;');
}
