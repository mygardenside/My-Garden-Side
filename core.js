// Green Vibes — core.js
// ============================================================
// RÔLE    : Socle applicatif — doit être chargé EN DERNIER.
// GÈRE    : état global (_APP + accesseurs), navigation,
//           dispatch de rendu (renderPage), système de modales,
//           séquence d'initialisation (loadData → init → navigate)
// DÉPEND  : tous les modules (chargés avant via index.html)
// NE GÈRE PAS : logique métier, rendu de pages, météo, persistance
// ============================================================
// ========== APP STATE ==========
let _APP = {
  vegetables: {},
  beds: [],
  crops: [],
  seasons: ['2026'],
  currentSeason: '2026',
  location: { lat: 43.4984, lon: 1.3139, name: 'Seysses' },
  weather: null,
  weatherLastFetch: null,
  climate: null,
  completedTasks: [],
  settings: { theme: 'default', languageChosen: false },
  language: 'fr',
  userProfile: { name: '', level: '', spaceType: '', goals: [], onboardingDone: false },
  notificationsRead: [],
  notificationsIgnored: []
};

// ========== APP STATE ACCESSORS ==========
function getAppState(key) {
  return _APP[key];
}

function updateAppState(key, value) {
  _APP[key] = value;
  // Sauvegarde automatique pour clés critiques
  if (['vegetables', 'beds', 'crops', 'seasons', 'currentSeason', 'location', 'settings', 'language', 'userProfile', 'notificationsRead', 'notificationsIgnored', 'climate'].includes(key)) {
    saveData();
  }
}

function getAppStateDeep() {
  return JSON.parse(JSON.stringify(_APP));
}

// Pour compatibilité, exposer APP en lecture seule (mais encourager getAppState)
// FRAGILITÉ : APP.xxx = value écrit directement sur _APP sans passer par updateAppState
// → pas de persistance, pas de dispatch. Toujours utiliser updateAppState() pour écrire.
const APP = new Proxy(_APP, {
  get(target, prop) { return target[prop]; },
  set(target, prop, value) { target[prop] = value; return true; }
});
let currentPage = 'dashboard';
let detailView = null;
var currentPlanningFilter = 'today';
// ========== NAVIGATION ==========
function togglePlusMenu() {
  var overlay = document.getElementById('plusOverlay');
  overlay.classList.toggle('open');
  var hbg = document.getElementById('headerHamburger');
  if (hbg) hbg.classList.toggle('active', overlay.classList.contains('open'));
}
function closePlusMenu(e) {
  if (e.target === document.getElementById('plusOverlay')) {
    document.getElementById('plusOverlay').classList.remove('open');
    var hbg = document.getElementById('headerHamburger');
    if (hbg) hbg.classList.remove('active');
  }
}
function navigateFromPlus(page) {
  document.getElementById('plusOverlay').classList.remove('open');
  var hbg = document.getElementById('headerHamburger');
  if (hbg) hbg.classList.remove('active');
  navigate(page);
}
function navigate(page, push) {
  if (push === undefined) push = true;
  // Fermer le menu hamburger si ouvert
  var overlay = document.getElementById('plusOverlay');
  if (overlay) overlay.classList.remove('open');
  var hbg = document.getElementById('headerHamburger');
  if (hbg) hbg.classList.remove('active');
  // Nettoyer les overlays flottants (onboarding, langue) et le verrou de scroll
  var _ov;
  _ov = document.getElementById('onbOverlay');       if (_ov) _ov.remove();
  _ov = document.getElementById('langPickerOverlay'); if (_ov) _ov.remove();
  document.body.style.overflow = '';
  // Fermer la modale si ouverte (évite le verrou de scroll résiduel)
  // Mais pas si elle vient juste d'être ouverte (ghost click mobile)
  var modalOv = document.getElementById('modalOverlay');
  if (modalOv && (Date.now() - _modalOpenTime > 600)) modalOv.classList.remove('active');
  currentPage = page;
  detailView = null;
  // Mode plein écran jardin sur mobile : masque header + bottom-nav
  document.body.classList.toggle('gd-garden-active', page === 'garden');
  document.querySelectorAll('.page').forEach(function(p) { p.classList.remove('active'); });
  document.querySelectorAll('.nav-item').forEach(function(n) { n.classList.remove('active'); });
  var pageEl = document.getElementById('page' + page.charAt(0).toUpperCase() + page.slice(1));
  if (pageEl) { pageEl.classList.add('active'); pageEl.classList.add('fade-in'); }
  var navEl = document.querySelector('.nav-item[data-page="' + page + '"]');
  if (navEl) navEl.classList.add('active');
  var titles = { dashboard:'My Garden Side', beds:t('nav_beds'), crops:t('nav_crops'), today:t('nav_today'), calendar:t('nav_calendar'), planning:t('nav_planning'), analysis:t('nav_analysis'), settings:t('nav_settings'), notifications:t('nav_notifications'), ai:t('nav_ai'), veggieref:t('nav_veggieref'), garden:t('nav_garden') };
  document.getElementById('headerTitle').textContent = titles[page] || 'My Garden Side';
  document.getElementById('headerBack').classList.remove('visible');
  document.getElementById('headerSeason').textContent = getAppState('currentSeason');
  var fabPages = ['beds','crops'];
  document.getElementById('fab').style.display = fabPages.indexOf(page) >= 0 ? 'flex' : 'none';
  renderPage(page);
  refreshNavLabels();
  if (push) history.pushState({ page: page }, '', '#' + page);
  else history.replaceState({ page: page }, '', '#' + page);
  window.scrollTo(0, 0);
}
function goBack() {
  history.back();
}
window.addEventListener('popstate', function(e) {
  var st = e.state || {};
  if (st.detail) {
    currentPage = st.page || 'beds';
    detailView = st.detail;
    renderPage(currentPage);
    document.getElementById('headerBack').classList.add('visible');
    document.getElementById('fab').style.display = 'none';
  } else if (st.page) {
    navigate(st.page, false);
  } else {
    navigate('dashboard', false);
  }
});
function handleFab() {
  if (currentPage === 'beds') openBedModal();
  else if (currentPage === 'crops') openCropModal();
}
// ========== RENDER DISPATCH ==========
function renderPage(page) {
  refreshCropStatuses();

  switch(page) {
    case 'dashboard': renderDashboard(); break;
    case 'beds': detailView ? renderBedDetail(detailView) : renderBeds(); break;
    case 'crops': renderCrops(); break;
    case 'today': renderToday(); break;
    case 'calendar': renderCalendar(); break;
    case 'planning': renderPlanning(); break;
    case 'analysis': renderAnalysis(); break;
    case 'settings': renderSettings(); break;
    case 'notifications': renderNotifications(); break;
    case 'ai': renderAi(); break;
    case 'veggieref': renderVeggieRef(); break;
    case 'garden': renderGarden(); break;
  }
}

// ========== MODAL SYSTEM ==========
var _modalOpenTime = 0;
function openModal(html) {
  document.getElementById('modalContent').innerHTML = html;
  document.getElementById('modalOverlay').classList.add('active');
  document.body.style.overflow = 'hidden';
  _modalOpenTime = Date.now();
}
function closeModal() {
  document.getElementById('modalOverlay').classList.remove('active');
  document.body.style.overflow = '';
}
function closeModalOverlay(e) {
  if (Date.now() - _modalOpenTime < 900) return;
  if (document.querySelector('#modalContent input, #modalContent textarea, #modalContent select')) return;
  if (e.target === document.getElementById('modalOverlay')) closeModal();
}
// ========== NAV LABELS (i18n) ==========
function refreshNavLabels() {
  document.querySelectorAll('[data-i18n]').forEach(function(el) {
    var key = el.getAttribute('data-i18n');
    if (key) el.textContent = t(key);
  });
  document.querySelectorAll('[data-i18n-title]').forEach(function(el) {
    var key = el.getAttribute('data-i18n-title');
    if (key) el.title = t(key);
  });
}

// ========== LANGUAGE SWITCH ==========
function changeLanguage(lang) {
  updateAppState('language', lang);              // persists via official API, no Proxy
  document.documentElement.lang = lang;          // update <html lang="…">
  refreshNavLabels();                             // update static [data-i18n] elements
  navigate(currentPage || 'settings');            // full re-render of visible page
}

// ========== INIT ==========
loadData();
// Calcul automatique du profil climatique si absent (appel silencieux en arrière-plan)
if (!getAppState('climate') && (getAppState('location') || {}).lat) {
  if (typeof ClimateModule !== 'undefined') ClimateModule.refresh(function() {});
}
cleanOrphanVeggies();
refreshCropStatuses();
pruneOrphanHistory();
rebuildLearningMemory();
document.documentElement.lang = getAppState('language') || 'fr';
refreshNavLabels();
var _settings = getAppState('settings') || {};
if (!_settings.languageChosen) {
  navigate('dashboard', false);
  renderLanguagePicker();
} else if (shouldShowOnboarding()) {
  navigate('dashboard', false);
  renderOnboarding();
} else {
  navigate('dashboard', false);
}
// ---- Masquer le splash screen ----
(function() {
  var sp = document.getElementById('splashScreen');
  if (!sp) return;
  setTimeout(function() {
    sp.classList.add('hiding');
    setTimeout(function() { if (sp.parentNode) sp.parentNode.removeChild(sp); }, 520);
  }, 380);
}());

