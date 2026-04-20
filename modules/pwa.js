/**
 * Green Vibes — modules/pwa.js
 * Helpers PWA : enregistrement du service worker, détection installabilité.
 *
 * Fonctions exposées :
 *   registerServiceWorker()  — enregistre le SW si supporté
 *   isPWAInstallable()       — true si le prompt d'installation est disponible
 *   showInstallPrompt()      — déclenche le prompt natif d'installation
 *   getPWAStatus()           — retourne l'état PWA actuel
 *
 * Pas d'UI intégrée — ces fonctions sont appelables depuis les Réglages
 * ou depuis n'importe quel module sans modifier l'existant.
 *
 * Dépend de : rien (autonome)
 */

// Stocke le prompt d'installation capturé par beforeinstallprompt
var _gvpInstallPrompt = null;

// ---- Capture du prompt d'installation ----
window.addEventListener('beforeinstallprompt', function(event) {
  event.preventDefault();
  _gvpInstallPrompt = event;
});

window.addEventListener('appinstalled', function() {
  _gvpInstallPrompt = null;
});

// ============================================================
// registerServiceWorker()
// Enregistre service-worker.js si l'API est disponible.
// Silencieux en cas d'erreur (ne bloque pas l'app).
// ============================================================
function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  // Recharger la page quand un nouveau SW prend le contrôle
  // (skipWaiting dans le SW garantit que ça arrive dès que la mise à jour est détectée)
  var _refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', function() {
    if (!_refreshing) {
      _refreshing = true;
      window.location.reload();
    }
  });

  navigator.serviceWorker.register('service-worker.js', { scope: './' })
    .then(function(registration) {
      // Vérifier les mises à jour au chargement
      registration.update();

      registration.addEventListener('updatefound', function() {
        var newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', function() {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Nouveau SW prêt — le controllerchange va déclencher le rechargement
            }
          });
        }
      });
    })
    .catch(function(error) {
      // Silencieux — l'app fonctionne sans SW
    });
}

// ============================================================
// isPWAInstallable()
// Retourne true si l'app peut être installée en PWA.
// ============================================================
function isPWAInstallable() {
  return _gvpInstallPrompt !== null;
}

// ============================================================
// showInstallPrompt()
// Déclenche le prompt natif d'installation.
// Retourne une Promise resolue avec 'accepted' ou 'dismissed'.
// ============================================================
function showInstallPrompt() {
  if (!_gvpInstallPrompt) {
    alert('Cette application est déjà installée ou votre navigateur ne supporte pas l\'installation.');
    return Promise.resolve('not-available');
  }

  return _gvpInstallPrompt.prompt().then(function() {
    return _gvpInstallPrompt.userChoice;
  }).then(function(choice) {
    _gvpInstallPrompt = null;
    return choice.outcome; // 'accepted' ou 'dismissed'
  });
}

// ============================================================
// getPWAStatus()
// Retourne l'état complet de la PWA pour diagnostic.
// ============================================================
function getPWAStatus() {
  var isStandalone = window.matchMedia('(display-mode: standalone)').matches
    || window.navigator.standalone === true;

  var swSupported = 'serviceWorker' in navigator;

  var swActive = false;
  if (swSupported && navigator.serviceWorker.controller) {
    swActive = true;
  }

  return {
    isInstalled:   isStandalone,
    isInstallable: isPWAInstallable(),
    swSupported:   swSupported,
    swActive:      swActive,
    online:        navigator.onLine
  };
}

// ============================================================
// renderPWAPanel()
// Génère le HTML du panneau PWA pour les Réglages.
// ============================================================
function renderPWAPanel() {
  var status = getPWAStatus();
  var html   = '<div class="section-title">\uD83D\uDCF1 Application & Publication</div>';
  html += '<div class="card" style="padding:14px 16px;">';

  // Statut
  html += '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:12px;">';
  html += _pwaBadge(status.swActive ? '✓ Hors ligne OK' : '○ Cache inactif', status.swActive ? 'var(--green-700)' : 'var(--text-light)');
  html += _pwaBadge(status.isInstalled ? '✓ Installée' : '○ Non installée', status.isInstalled ? 'var(--green-700)' : 'var(--text-light)');
  html += _pwaBadge(status.online ? '✓ En ligne' : '○ Hors ligne', status.online ? 'var(--blue)' : 'var(--orange)');
  html += '</div>';

  // Bouton installer
  if (!status.isInstalled && status.isInstallable) {
    html += '<button class="btn btn-primary btn-block" style="margin-bottom:8px;" onclick="showInstallPrompt()">' +
      '\uD83D\uDCF2 Installer l\'application</button>';
  } else if (status.isInstalled) {
    html += '<div style="font-size:0.82rem;color:var(--green-700);font-weight:600;margin-bottom:8px;">✓ Application installée sur cet appareil</div>';
  } else {
    html += '<div style="font-size:0.78rem;color:var(--text-light);margin-bottom:8px;">Pour installer : utilisez le menu de votre navigateur → "Ajouter à l\'écran d\'accueil"</div>';
  }

  // Export enrichi
  html += '<div style="border-top:1px solid #f3f4f6;padding-top:10px;margin-top:4px;">';
  html += '<div style="font-size:0.72rem;font-weight:700;color:var(--text-light);text-transform:uppercase;letter-spacing:0.07em;margin-bottom:8px;">Exports enrichis</div>';
  html += '<button class="btn btn-secondary btn-block" style="margin-bottom:6px;" onclick="exportAppData()">\uD83D\uDCE4 Export complet JSON</button>';
  html += '<button class="btn btn-secondary btn-block" style="margin-bottom:6px;" onclick="exportHarvestsCSV()">\uD83D\uDCCA Récoltes CSV</button>';
  html += '<button class="btn btn-secondary btn-block" onclick="exportAnalysisCSV()">\uD83D\uDCCA Analyse CSV</button>';
  html += '</div></div>';

  return html;
}

function _pwaBadge(label, color) {
  return '<span style="font-size:0.72rem;font-weight:600;padding:3px 9px;border-radius:10px;background:#f3f4f6;color:' + color + ';">' + label + '</span>';
}

// ============================================================
// INIT AUTOMATIQUE — appelé dès que pwa.js est chargé
// ============================================================
(function() {
  // Enregistrer le SW au chargement de la page
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', registerServiceWorker);
  } else {
    registerServiceWorker();
  }
})();
