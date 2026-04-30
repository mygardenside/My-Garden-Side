/**
 * Green Vibes — ui-menu-plus.js
 * Gestion menu Plus (+) de navigation flottant.
 * ============================================================
 * RESPONSABILITÉ UNIQUE :
 *   - Gérer toggle/show/hide menu Plus
 *   - Dispatcher navigation depuis menu Plus
 *   - Gérer événements menu (overlay click, etc.)
 *
 * N'EST PAS RESPONSABLE :
 *   - Logique navigation centrale (core.js)
 *   - Rendu pages (pages/)
 *   - État global (core.js)
 *
 * Fonctions exposées :
 *   togglePlusMenu()        — activer/désactiver menu
 *   closePlusMenu(e)        — fermer menu si overlay clicked
 *   navigateFromPlus(page)  — dispatcher navigation + fermer menu
 *
 * Dépendances :
 *   navigate() — depuis core.js (appel global)
 *   DOM : #plusOverlay, #navBtnPlus
 *
 * Utilisation (dans index.html ou via core.js) :
 *   - Attacher togglePlusMenu() au bouton Plus
 *   - Attacher closePlusMenu() au overlay click
 *   - navigateFromPlus() appelé depuis items menu
 *
 * Zéro modification d'état global.
 */

// ============================================================
// 1. TOGGLE MENU PLUS
// ============================================================

/**
 * Basculer l'état du menu Plus (ouvert ↔ fermé).
 */
function togglePlusMenu() {
  var overlay = document.getElementById('plusOverlay');
  if (!overlay) return;
  overlay.classList.toggle('open');
  var btn = document.getElementById('navBtnPlus');
  if (btn) btn.classList.toggle('active', overlay.classList.contains('open'));
  if (overlay.classList.contains('open')) updatePlusMenuBeds();
}

// ============================================================
// 5. BACS NON PLACÉS — section dynamique du menu
// ============================================================

/**
 * Rafraîchit la section "Placer dans le jardin" du menu +.
 * Affiche les bacs qui n'ont pas encore de gardenElId.
 */
function updatePlusMenuBeds() {
  var container = document.getElementById('plusBedsList');
  if (!container) {
    // Ancien cache : créer le conteneur dynamiquement dans le dropdown
    var dropdown = document.querySelector('.hbg-dropdown');
    if (!dropdown) return;
    container = document.createElement('div');
    container.id = 'plusBedsList';
    dropdown.appendChild(container);
  }

  var beds = (typeof getAppState === 'function') ? (getAppState('beds') || []) : [];
  var isEn = (typeof getAppState === 'function') && getAppState('language') === 'en';
  var unplaced = beds.filter(function(b) { return !b.gardenElId; });

  if (!unplaced.length) { container.innerHTML = ''; return; }

  var html =
    '<div style="border-top:1px solid rgba(0,0,0,.07);margin:4px 0 0;">' +
    '<div style="font-size:0.68rem;font-weight:700;color:var(--text-light);' +
    'text-transform:uppercase;letter-spacing:.05em;padding:8px 16px 2px;">' +
    (isEn ? 'Place in garden' : 'Placer dans le jardin') + '</div>';

  unplaced.forEach(function(bed) {
    var esc = (typeof escH === 'function') ? escH(bed.name) : bed.name;
    html +=
      '<div class="hbg-menu-item" onclick="addBedToGardenView(\'' + bed.id + '\')">' +
        '<span class="hbg-menu-icon">🌿</span>' +
        '<span class="hbg-menu-label">' + esc + '</span>' +
        '<span class="hbg-menu-arrow" style="font-size:1.1rem;color:var(--primary);">+</span>' +
      '</div>';
  });

  html += '</div>';
  container.innerHTML = html;
}

/**
 * Ajoute un bac existant (APP.beds) à la vue jardin (canvas).
 * Crée l'élément canvas, le lie au bac APP via appBedId/gardenElId,
 * navigue vers la vue jardin et affiche un toast de confirmation.
 * @param {string} bedId - id du bac dans APP.beds
 */
function addBedToGardenView(bedId) {
  var overlay = document.getElementById('plusOverlay');
  if (overlay) overlay.classList.remove('open');
  var btn = document.getElementById('navBtnPlus');
  if (btn) btn.classList.remove('active');

  var beds = (typeof getAppState === 'function') ? (getAppState('beds') || []) : [];
  var bed  = beds.find(function(b) { return b.id === bedId; });
  if (!bed) return;

  navigate('garden');

  setTimeout(function() {
    if (typeof GardenStore === 'undefined' || typeof createBed === 'undefined') return;

    // Centre du viewport canvas
    var cx = 0, cy = 0;
    if (typeof Renderer !== 'undefined' && Renderer.canvas &&
        typeof Camera !== 'undefined' && typeof Camera.toWorld === 'function') {
      var w = Camera.toWorld(Renderer.canvas.width / 2, Renderer.canvas.height / 2);
      cx = w.x; cy = w.y;
    }

    // Créer l'élément canvas avec les dimensions réelles du bac
    var el = createBed(cx, cy, { label: bed.name });
    if (typeof m2px === 'function') {
      el.dimensions.width  = m2px(bed.length || 1.2);
      el.dimensions.height = m2px(bed.width  || 0.8);
    }
    el.position.x = cx - el.dimensions.width  / 2;
    el.position.y = cy - el.dimensions.height / 2;
    el.appBedId   = bed.id;

    GardenStore.add(el);

    // Lier le bac APP à l'élément canvas
    bed.gardenElId = el.id;
    if (typeof updateAppState === 'function') updateAppState('beds', beds);

    GardenStore.save(); // sauvegarde + syncToApp
    if (typeof Panels !== 'undefined') Panels.update(el);

    var isEn = (typeof getAppState === 'function') && getAppState('language') === 'en';
    if (typeof GardenBridge !== 'undefined') {
      GardenBridge._toast(bed.name + ' ' + (isEn ? 'added — drag to position it.' : 'ajouté — déplacez-le à la bonne place.'));
    }

    updatePlusMenuBeds();
  }, 350);
}

// ============================================================
// 2. FERMER MENU (OVERLAY CLICK)
// ============================================================

/**
 * Fermer le menu si clic sur overlay (pas sur contenu).
 * @param {Event} e - événement click
 */
function closePlusMenu(e) {
  var overlay = document.getElementById('plusOverlay');
  if (!overlay) return;
  
  // Seulement si clic sur le fond (pas sur contenu menu)
  if (e.target === overlay) {
    overlay.classList.remove('open');
    
    var btn = document.getElementById('navBtnPlus');
    if (btn) btn.classList.remove('active');
  }
}

// ============================================================
// 3. NAVIGUER DEPUIS LE MENU PLUS
// ============================================================

/**
 * Naviguer vers une page depuis le menu Plus.
 * Ferme le menu après navigation.
 * @param {string} page - page destination (dashboard, beds, etc.)
 */
function navigateFromPlus(page) {
  var overlay = document.getElementById('plusOverlay');
  if (overlay) overlay.classList.remove('open');
  var btn = document.getElementById('navBtnPlus');
  if (btn) btn.classList.remove('active');
  navigate(page);
}

// ============================================================
// 4. INIT EVENT LISTENERS (attach au démarrage)
// ============================================================

/**
 * Initialiser les event listeners du menu Plus.
 * À appeler depuis core.js au démarrage.
 */
function initPlusMenuListeners() {
  var plusBtn = document.getElementById('navBtnPlus');
  var overlay = document.getElementById('plusOverlay');
  if (plusBtn) plusBtn.addEventListener('click', togglePlusMenu);
  if (overlay) overlay.addEventListener('click', closePlusMenu);
}

// ============================================================
// AUTO-INIT (when this file loads after core.js)
// ============================================================
if (document.readyState === 'loading') {
  // DOM still loading, wait for it
  document.addEventListener('DOMContentLoaded', initPlusMenuListeners);
} else {
  // DOM already loaded (common after defer/async scripts)
  initPlusMenuListeners();
}
