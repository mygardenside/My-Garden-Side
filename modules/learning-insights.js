// Green Vibes — modules/learning-insights.js
// ============================================================
// RÔLE    : Insights utilisateur et profil de progression.
// DÉPEND  : learning-memory.js (getLearningMemory)
// GÈRE    : (fonctions consolidées dans learning.js)
// NE GÈRE PAS : persistance, calculs bruts, rendu HTML
//
// HISTORIQUE :
// Ce fichier contenait trois redéfinitions qui écrasaient les
// implémentations riches de learning.js :
//
// 1. getUserProgressionProfile() — retournait { level, totalHarvests,
//    avgPerformance, insights } au lieu du shape attendu par analysis.js
//    et dashboard.js : { level, score, delta, strengths, weaknesses,
//    nextMilestones, breakdown }. Provoquait des undefined sur
//    prof.score, prof.delta, prof.strengths dans tout le rendu.
//
// 2. getActionableInsights() — retournait { type, title, content }
//    sans icon, category, text, confidence. Version appauvrie.
//
// 3. recordHarvestLearningData(crop) — ne faisait QUE appeler
//    rebuildLearningMemory() sans sauvegarder l'entrée dans
//    gvp_history. Entraînait une perte silencieuse des données
//    de récolte à chaque validation.
//
// Ces trois fonctions sont gérées par learning.js (implémentations
// complètes et cohérentes avec le schéma globalStats).
// ============================================================
