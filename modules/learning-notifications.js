// Green Vibes — modules/learning-notifications.js
// ============================================================
// RÔLE    : Notifications déclenchées par les patterns d'apprentissage.
// DÉPEND  : learning-memory.js (getLearningMemory),
//           core.js (getAppState)
// GÈRE    : getPotentialNotifications (rappels récolte basés sur
//           avgDays historique, avertissements rendement faible)
// NE GÈRE PAS : notifications météo ni urgences (→ notifications.js),
//               persistance, calculs, rendu HTML
// ============================================================

/** Notifications potentielles. */
function getPotentialNotifications() {
  var notifications = [];
  var mem = getLearningMemory();
  var today = new Date().toISOString().split('T')[0];

  // Notification 1: Rappel recolte basee sur historique
  getAppState('crops').forEach(function(crop) {
    if (crop.status !== 'active') return;
    var v = getAppState('vegetables')[crop.veggieId];
    if (!v) return;
    var profile = mem.vegetableProfiles[crop.veggieId];
    if (profile && profile.avgDays) {
      var expectedHarvest = new Date(crop.datePlant);
      expectedHarvest.setDate(expectedHarvest.getDate() + profile.avgDays);
      var expectedDate = expectedHarvest.toISOString().split('T')[0];
      if (expectedDate === today) {
        notifications.push({
          id: 'harvest_reminder_' + crop.id,
          type: 'harvest_reminder',
          title: t('learn_notif_ready_title'),
          message: t('learn_notif_ready_msg').replace('{name}', tVeg(v.name)).replace('{bed}', crop.bedId),
          priority: 'medium'
        });
      }
    }
  });

  // Notification 2: Avertissement rendement faible
  Object.keys(mem.vegetableProfiles).forEach(function(vid) {
    var p = mem.vegetableProfiles[vid];
    if (p.avgRatio < 0.7 && p.count >= 2) {
      notifications.push({
        id: 'low_yield_' + vid,
        type: 'yield_warning',
        title: t('learn_notif_yield_title'),
        message: t('learn_notif_yield_msg').replace('{name}', tVeg(p.name)).replace('{pct}', (p.avgRatio * 100).toFixed(0)),
        priority: 'high'
      });
    }
  });

  return notifications;
}