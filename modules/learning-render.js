// Green Vibes — modules/learning-render.js
// ============================================================
// RÔLE    : Rendu HTML des blocs d'apprentissage (progression,
//           insights actionnables).
// DÉPEND  : learning-memory.js (getLearningMemory),
//           learning-calculations.js (detectEnhancedPatterns)
// GÈRE    : buildProgressionBlock, buildActionableInsightBlock
// NE GÈRE PAS : persistance, calculs métier, notifications
//
// Schéma progressionHistory attendu (depuis rebuildLearningMemory) :
//   { season, count, totalReal, ratio }
// ============================================================

/** Bloc progression saisonniere. */
function buildProgressionBlock() {
  var mem = getLearningMemory();
  var prog = mem.progressionHistory;
  if (!prog || prog.length < 2) return '<div class="insight-card"><p>' + t('lrn_prog_no_data') + '</p></div>';
  var latest = prog[prog.length - 1];
  var prev = prog[prog.length - 2];
  var diff = (latest.ratio || 0) - (prev.ratio || 0);
  var trendIcon = diff > 0.05 ? '📈' : diff < -0.05 ? '📉' : '➡️';
  var trendText = diff > 0.05 ? t('lrn_prog_up') : diff < -0.05 ? t('lrn_prog_down') : t('lrn_prog_stable');
  return '<div class="insight-card">' +
    '<h4>' + trendIcon + ' ' + t('lrn_prog_title_section') + '</h4>' +
    '<p>' + t('lrn_prog_season_row').replace('{s}', latest.season).replace('{pct}', ((latest.ratio || 0) * 100).toFixed(0)) + '</p>' +
    '<p>' + t('lrn_prog_vs_prev').replace('{trend}', trendText).replace('{prev}', prev.season).replace('{diff}', (diff * 100).toFixed(1)) + '</p>' +
    '<p>' + t('lrn_prog_total_row').replace('{n}', (latest.count || 0)).replace('{kg}', (latest.totalReal || 0).toFixed(1)) + '</p>' +
  '</div>';
}

/** Bloc insights actionnables. */
function buildActionableInsightBlock() {
  var patterns = detectEnhancedPatterns();
  if (patterns.length === 0) return '<div class="insight-card"><p>' + t('lrn_insights_none') + '</p></div>';
  var html = '<div class="insight-card"><h4>' + t('lrn_insights_title') + '</h4><ul>';
  patterns.forEach(function(p) {
    html += '<li>' + (p.title ? p.title + (p.text ? ' — ' + p.text : '') : (p.message || '')) + '</li>';
  });
  html += '</ul></div>';
  return html;
}
