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
