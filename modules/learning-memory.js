// Green Vibes — modules/learning-memory.js
// ============================================================
// RÔLE    : Couche de persistance de la mémoire d'apprentissage.
// DÉPEND  : (aucune — primitives pures localStorage)
// GÈRE    : (fonctions consolidées dans learning.js)
// NE GÈRE PAS : calculs, profils, insights, rendu HTML
//
// HISTORIQUE :
// Ce fichier contenait des redéfinitions de loadLearningMemory,
// saveLearningMemory, getLearningMemory et rebuildLearningMemory
// avec un schéma globalStats incompatible (avgPerformance au lieu
// de avgRatio, sans familyDiversity ni seasonsWithData).
// Ces fonctions ont été retirées car elles écrasaient les
// implémentations canoniques de learning.js (chargé en premier)
// et cassaient getUserProgressionProfile + getUserAchievements.
//
// Les primitives storage/rebuild sont gérées par learning.js :
//   loadLearningMemory()    — lecture localStorage brute
//   saveLearningMemory(mem) — écriture localStorage brute
//   getLearningMemory()     — lecture avec cache 5 min
//   rebuildLearningMemory() — reconstruction complète depuis zéro
// ============================================================
