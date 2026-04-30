/**
 * Green Vibes — service-worker.js
 * Version : 2.0.0
 *
 * Corrections v2 vs v1 :
 *   - Chemins RELATIFS (sans / préfixe) — compatibles tout hébergement
 *   - 12 nouveaux fichiers ajoutés (intelligence, risk-engine, opportunities,
 *     profiles, profile-rules, logo.svg, 6 icônes PNG)
 *   - CACHE_NAME incrémenté → invalide proprement le cache v1
 *   - Fallback offline corrigé (chemin relatif)
 *   - Stratégie Network First pour météo (inchangée)
 *
 * Stratégie : Cache First pour tous les assets statiques.
 *             Network Only pour les APIs météo (jamais en cache).
 */

var CACHE_NAME    = 'gv-v67';
var CACHE_VERSION = '54.0.0';

// ---- Assets statiques à mettre en cache (chemins RELATIFS) ----
// Important : pas de / en préfixe — fonctionne quel que soit
// le sous-dossier ou le protocole d'hébergement (file://, http://, etc.)
var STATIC_ASSETS = [
  'index.html',

  // Styles
  'style.css',

  // Scripts core
  'app.js',
  'core.js',
  'data.js',
  'ui-menu-plus.js',

  // Utils
  'utils/storage.js',
  'utils/weather.js',
  'utils/calculations.js',

  // Modules — chargés dans l'ordre de index.html
  'modules/i18n.js',
  'modules/learning.js',
  'modules/learning-memory.js',
  'modules/learning-history.js',
  'modules/learning-calculations.js',
  'modules/learning-render.js',
  'modules/learning-notifications.js',
  'modules/learning-insights.js',
  'modules/notifications.js',
  'modules/onboarding.js',
  'modules/predictive.js',
  'modules/dashboard.js',
  'modules/beds.js',
  'modules/crops.js',
  'modules/planning.js',
  'modules/analysis.js',
  'modules/settings.js',
  'modules/calendar.js',
  'modules/geo-calendar.js',
  'modules/irrigation.js',
  'modules/recommendations.js',

  // Modules intelligence (ajoutés v22)
  'modules/intelligence.js',
  'modules/risk-engine.js',
  'modules/opportunities.js',

  // Modules profils (ajoutés v22)
  'modules/profiles.js',
  'modules/profile-rules.js',

  // Modules utilitaires
  'modules/export.js',
  'modules/backup.js',
  'modules/pwa.js',

  // Assets visuels
  'assets/garden-visuals.js',
  'assets/veggie-visuals.js',

  // Photos dashboard (converties en WebP v31)
  'assets/heros-meteo.webp',
  'assets/carte-mon-jardin.webp',
  'assets/carte-culture.webp',
  'assets/carte-action.webp',

  // Photos multi-pages (converties en WebP v31)
  'assets/vue-potager.webp',
  'assets/lifestyle-lits.webp',
  'assets/recolte-panier.webp',
  'assets/gros-plan-tomate.webp',
  'assets/semis-jeunes.webp',
  'assets/feuille-malade.webp',
  'assets/matin-brumeux.webp',
  'manifest.json',
  'logo.svg',

  // Icônes PWA (ajoutées étape 1)
  'icon-72.png',
  'icon-96.png',
  'icon-128.png',
  'icon-144.png',
  'icon-192.png',
  'icon-512.png'
];

// ---- Domaines réseau uniquement (jamais mis en cache) ----
var NETWORK_ONLY_DOMAINS = [
  'api.open-meteo.com',
  'geocoding-api.open-meteo.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com'
];


// ========== INSTALLATION ==========
// Mise en cache de tous les assets au premier chargement.
// On utilise Promise.allSettled pour ne pas bloquer si un fichier
// est temporairement indisponible — l'app se dégrade gracieusement.
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return Promise.allSettled(
        STATIC_ASSETS.map(function(url) {
          return cache.add(url).catch(function() {});
        })
      );
    })
  );
  self.skipWaiting();
});


// ========== ACTIVATION ==========
// Supprime tous les anciens caches (gvp-v1, etc.) pour libérer de l'espace
// et éviter des conflits de version.
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys
          .filter(function(key) { return key !== CACHE_NAME; })
          .map(function(key) { return caches.delete(key); })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});


// ========== INTERCEPTION DES REQUÊTES ==========
self.addEventListener('fetch', function(event) {
  var url;
  try {
    url = new URL(event.request.url);
  } catch(e) {
    // URL invalide — laisser passer
    return;
  }

  // ---- Domaines réseau uniquement → pas d'interception ----
  var isNetworkOnly = NETWORK_ONLY_DOMAINS.some(function(domain) {
    return url.hostname.includes(domain);
  });
  if (isNetworkOnly) {
    return; // Le browser gère la requête directement
  }

  // ---- Requêtes non-GET → pas d'interception ----
  if (event.request.method !== 'GET') {
    return;
  }

  // ---- Cache First avec fallback réseau ----
  event.respondWith(
    caches.match(event.request).then(function(cached) {

      // Trouvé en cache → servir immédiatement
      if (cached) {
        return cached;
      }

      // Pas en cache → aller chercher sur le réseau
      return fetch(event.request).then(function(response) {

        // Mettre en cache si réponse valide
        if (
          response &&
          response.status === 200 &&
          response.type !== 'opaque' // Ne pas cacher les réponses cross-origin opaques
        ) {
          var responseClone = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, responseClone);
          });
        }

        return response;

      }).catch(function() {
        // Hors ligne + pas en cache
        // Pour les navigations → renvoyer index.html depuis le cache
        if (event.request.mode === 'navigate') {
          return caches.match('index.html').then(function(fallback) {
            if (fallback) {
              return fallback;
            }
            // index.html pas en cache non plus → réponse d'erreur minimale
            return new Response(
              '<!DOCTYPE html><html><head><meta charset="utf-8">' +
              '<meta name="viewport" content="width=device-width">' +
              '<title>My Garden Side</title></head><body>' +
              '<div style="font-family:sans-serif;text-align:center;padding:60px 20px;">' +
              '<div style="font-size:3rem;margin-bottom:16px;">🌱</div>' +
              '<h2 style="color:#0B5D47;margin-bottom:8px;">My Garden Side</h2>' +
              '<p style="color:#6B7A66;margin-bottom:24px;">Connexion requise pour le premier chargement.</p>' +
              '<p style="color:#9aab94;font-size:0.85rem;">Reconnectez-vous pour accéder à votre jardin.</p>' +
              '</div></body></html>',
              {
                status: 503,
                statusText: 'Service Unavailable',
                headers: { 'Content-Type': 'text/html; charset=utf-8' }
              }
            );
          });
        }

        // Pour les autres ressources (JS, CSS, images) → erreur silencieuse
        return new Response('', { status: 503, statusText: 'Offline' });
      });
    })
  );
});
