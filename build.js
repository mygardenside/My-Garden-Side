// build.js — concatène tous les scripts dans l'ordre de chargement
// Usage : node build.js
// Output : bundle.js (source) + bundle.min.js (production)

const fs   = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const BASE = __dirname;

const FILES = [
  // 0. Assets visuels
  'assets/garden-visuals.js',
  'assets/veggie-visuals.js',
  // 1. Données statiques
  'data.js',
  // 2. Internationalisation
  'modules/i18n.js',
  // 3. Persistance
  'utils/storage.js',
  // 4. Météo
  'utils/weather.js',
  // 5. Calculs métier
  'utils/calculations.js',
  // 6. Apprentissage
  'modules/learning.js',
  'modules/learning-memory.js',
  'modules/learning-history.js',
  'modules/learning-calculations.js',
  'modules/learning-render.js',
  'modules/learning-notifications.js',
  'modules/learning-insights.js',
  // 7. Modules secondaires
  'modules/notifications.js',
  'modules/onboarding.js',
  'modules/predictive.js',
  // 8. Pages
  'modules/dashboard.js',
  'modules/beds.js',
  'modules/crops.js',
  'modules/planning.js',
  'modules/analysis.js',
  'modules/climate.js',
  'modules/geo-calendar.js',
  'modules/irrigation.js',
  'modules/recommendations.js',
  'modules/settings.js',
  'modules/calendar.js',
  // 8b. Intelligence métier
  'modules/intelligence.js',
  'modules/risk-engine.js',
  'modules/opportunities.js',
  // 8c. Profils
  'modules/profiles.js',
  'modules/profile-rules.js',
  // 9. Core
  'core.js',
  // 10. Publication
  'modules/export.js',
  'modules/backup.js',
  'modules/pwa.js',
  // 11. Bootstrap
  'app.js',
  // 12. Vue jardin
  'prototype-garden-v2/data/gardenStore.js',
  'prototype-garden-v2/scene/camera.js',
  'prototype-garden-v2/render/utils.js',
  'prototype-garden-v2/render/terrain.js',
  'prototype-garden-v2/render/elements/path.js',
  'prototype-garden-v2/render/elements/fence.js',
  'prototype-garden-v2/render/elements/bed.js',
  'prototype-garden-v2/render/elements/serre.js',
  'prototype-garden-v2/render/elements/house.js',
  'prototype-garden-v2/render/elements/tree.js',
  'prototype-garden-v2/render/renderer.js',
  'prototype-garden-v2/ui/toolbar.js',
  'prototype-garden-v2/ui/panels.js',
  'prototype-garden-v2/app.js',
  'assets/garden-sprites.js',
  'modules/garden-mobile.js',
  'modules/garden-bridge.js',
  'modules/garden.js',
];

// Concaténation
var bundle = '';
FILES.forEach(function(f) {
  var content = fs.readFileSync(path.join(BASE, f), 'utf8');
  bundle += content + ';\n';
});

fs.writeFileSync(path.join(BASE, 'bundle.js'), bundle);
var bundleKB = (fs.statSync(path.join(BASE, 'bundle.js')).size / 1024).toFixed(1);
console.log('bundle.js : ' + bundleKB + ' KB');

// Minification via terser
console.log('Minification en cours...');
execSync('npx --yes terser bundle.js -o bundle.min.js -c -m', { cwd: BASE, stdio: 'inherit' });
var minKB = (fs.statSync(path.join(BASE, 'bundle.min.js')).size / 1024).toFixed(1);
console.log('bundle.min.js : ' + minKB + ' KB');
console.log('Economie : ' + (bundleKB - minKB).toFixed(1) + ' KB');
