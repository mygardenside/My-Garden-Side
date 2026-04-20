/**
 * Green Vibes — app.js
 * Marqueur de version et manifeste de documentation.
 *
 * Ce fichier ne contient AUCUNE logique et n'exécute rien.
 * Il sert de référence lisible sur l'architecture du projet.
 *
 * L'initialisation réelle de l'application est dans core.js
 * (loadData → refreshCropStatuses → rebuildLearningMemory → navigate).
 *
 * Ordre de chargement : voir index.html (commentaires numérotés 1–12).
 *
 * Architecture par couche :
 *
 *   1. Données statiques
 *        data.js                    — référentiel légumes + calendrier
 *
 *   2. Internationalisation
 *        modules/i18n.js            — dictionnaires FR/EN + t()
 *
 *   3. Persistance
 *        utils/storage.js           — localStorage (gvp_data)
 *
 *   4. Services externes
 *        utils/weather.js           — Open-Meteo API
 *
 *   5. Calculs métier
 *        utils/calculations.js      — surfaces, rendements, rotation
 *
 *   6. Moteur d'apprentissage
 *        modules/learning.js        — mémoire, profil, insights (moteur)
 *        modules/learning-memory.js — (documentaire, consolidé dans learning.js)
 *        modules/learning-history.js    — persistance historique récoltes
 *        modules/learning-calculations.js — calculs purs apprentissage
 *        modules/learning-render.js     — blocs HTML apprentissage
 *        modules/learning-notifications.js — notifs learning
 *        modules/learning-insights.js   — (documentaire, consolidé dans learning.js)
 *
 *   7. Modules secondaires
 *        modules/notifications.js   — notifications intelligentes
 *        modules/onboarding.js      — premier lancement
 *        modules/predictive.js      — prévisions
 *
 *   8. Pages
 *        modules/dashboard.js       — accueil Mon Jardin
 *        modules/beds.js            — Mes Zones
 *        modules/crops.js           — cultures
 *        modules/planning.js        — planning + actions
 *        modules/analysis.js        — analyse + badges
 *        modules/settings.js        — réglages
 *        modules/calendar.js        — calendrier + fiches légumes
 *
 *   8b. Intelligence métier
 *        modules/intelligence.js
 *        modules/risk-engine.js
 *        modules/opportunities.js
 *
 *   8c. Profils utilisateur
 *        modules/profiles.js
 *        modules/profile-rules.js
 *
 *   9. Socle (en dernier)
 *        core.js                    — APP state, navigation, init
 *
 *   10. Publication
 *        modules/export.js
 *        modules/backup.js
 *        modules/pwa.js
 *
 * Version : 1.0.0
 * Build   : 30 — cache gv-v34
 * Date    : 2026-04-14
 * Release : V1 — Store Readiness / Publication
 */

// Constante de version accessible depuis l'app (settings, about, debug)
var APP_VERSION = '1.0.0';
var APP_BUILD   = 30;
