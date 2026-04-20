// Green Vibes — tests.js
// Tests unitaires pour fonctions critiques
// Exécuter dans console : runTests()

function runTests() {
  console.log('=== TESTS GREEN VIBES ===');
  let passed = 0;
  let total = 0;

  // Test getCropSurface
  total++;
  try {
    // Simuler données
    const mockCrop = { veggieId: 'v1', qty: 10, mode: 'surface' };
    const mockVeggies = { v1: { spacePerPlant: 0.5 } };
    // Temporairement remplacer getAppState
    const originalGetAppState = window.getAppState;
    window.getAppState = (key) => key === 'vegetables' ? mockVeggies : {};
    const result = getCropSurface(mockCrop);
    console.assert(result === 10, 'getCropSurface surface mode failed');
    window.getAppState = originalGetAppState;
    passed++;
  } catch (e) {
    console.error('getCropSurface test failed:', e);
  }

  // Test entryPerformanceRatio
  total++;
  try {
    const entry = { realYield: 8, estimatedYield: 10 };
    const ratio = entryPerformanceRatio(entry);
    console.assert(ratio === 0.8, 'entryPerformanceRatio failed');
    passed++;
  } catch (e) {
    console.error('entryPerformanceRatio test failed:', e);
  }

  // Test getBedOccupation
  total++;
  try {
    const mockBed = { id: 'b1', length: 5, width: 2 };
    const originalGetAppState = window.getAppState;
    window.getAppState = (key) => {
      if (key === 'crops') return [{ bedId: 'b1', season: '2026', status: 'active', veggieId: 'v1', qty: 5 }];
      if (key === 'currentSeason') return '2026';
      return {};
    };
    const occ = getBedOccupation(mockBed);
    console.assert(occ === 50, 'getBedOccupation failed'); // 5m² used / 10m² total = 50%
    window.getAppState = originalGetAppState;
    passed++;
  } catch (e) {
    console.error('getBedOccupation test failed:', e);
  }

  // Test getCropEstimatedYield
  total++;
  try {
    const mockCrop = { veggieId: 'v1', qty: 10, mode: 'count' };
    const mockVeggies = { v1: { yieldPerM2: 4, spacePerPlant: 0.5 } };
    const originalGetAppState = window.getAppState;
    window.getAppState = (key) => key === 'vegetables' ? mockVeggies : {};
    const yieldEst = getCropEstimatedYield(mockCrop);
    console.assert(yieldEst === 20, 'getCropEstimatedYield failed'); // 10 plants * 0.5m² * 4kg/m² = 20kg
    window.getAppState = originalGetAppState;
    passed++;
  } catch (e) {
    console.error('getCropEstimatedYield test failed:', e);
  }

  console.log(`Tests passés: ${passed}/${total} (${Math.round(passed/total*100)}%)`);
  return passed === total;
}

// Fonction pour vérifier ordre scripts (appelée manuellement)
function checkScriptOrder() {
  const required = ['data.js', 'core.js', 'utils/storage.js', 'utils/calculations.js'];
  const scripts = Array.from(document.scripts).map(s => s.src.split('/').pop());
  const missing = required.filter(r => !scripts.includes(r));
  if (missing.length > 0) {
    console.error('Scripts manquants:', missing);
    return false;
  }
  console.log('Ordre scripts OK');
  return true;
}