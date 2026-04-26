// =============================================================
//  GARDEN STORE — modèle de données central
//  Prêt pour v2 → v3 → v4 → v5
// =============================================================

// ── Échelle ──────────────────────────────────────────────────
var PX_PER_M = 20; // 1 m = 20 px au zoom standard
function m2px(m)  { return m * PX_PER_M; }
function px2m(px) { return Math.round(px / PX_PER_M * 10) / 10; }
function uid()    { return 'el_' + Date.now() + '_' + Math.floor(Math.random()*99999); }
function clamp(v,mn,mx) { return Math.max(mn, Math.min(mx, v)); }

// Aire d'un polygone normalisé par la formule du lacet (shoelace)
function polyAreaNorm(pts) {
  var n = pts.length, area = 0;
  for (var i = 0; i < n; i++) {
    var j = (i + 1) % n;
    area += pts[i][0] * pts[j][1];
    area -= pts[j][0] * pts[i][1];
  }
  return Math.abs(area) / 2;
}

// ── Thème visuel (hook pour le designer) ─────────────────────
// Remplacer ces valeurs pour changer l'ambiance globale
var THEME = {
  grass:  { base:'#7eb04e', dark:'#5c9230', light:'#92c258' },
  soil:   { base:'#8c6238', dark:'#6a4828', light:'#a87e50' },  // sol bien plus sombre → contraste avec le cadre bois
  wood:   { plank:'#c49060', dark:'#9a6c38', light:'#d8a870', post:'#7a5228' },
  glass:  { fill:'rgba(210,245,228,0.62)', frame:'#6a9878' },
  house:  { wall:'#f2e8d4', roof:'#c8703a' },
  tree:   { canopy:'#5eae38', highlight:'#7ec050', shadow:'#3a8a1e', trunk:'#8a5c30' },
  path:   { gravel:'#cec0a8', edge:'rgba(148,128,92,0.35)' },
  fence:  { plank:'#c49060', post:'#7a5228' },
  ui:     { primary:'#2e6e50', accent:'#f0c030', text:'#2c2820', bg:'rgba(255,255,255,0.92)' },
  grid:   { minor:'rgba(255,255,255,0.05)', major:'rgba(255,255,255,0.09)' },
  shadow: { soft:'rgba(40,25,8,0.13)', medium:'rgba(40,25,8,0.22)' },
};

// Palettes de couleurs pour les zones de culture
var BED_COLORS = ['#7a5230','#8b6914','#6b4c2a','#9b7920','#5c3d18','#a08232'];
var _bedCount = 0;

// =============================================================
//  FACTORIES — créent des éléments avec tous les hooks futurs
// =============================================================

function createBed(x, y, opts) {
  opts = opts || {};
  return {
    id: uid(), type: 'bed',
    position: { x: x, y: y },
    dimensions: { width: m2px(1.2), height: m2px(0.8) },
    rotation: 0,
    pts: null,            // null = rectangle ; array[[x,y]] = polygone custom
    label: opts.label || (I18N.t('label_bed') + ' ' + (++_bedCount)),
    color: opts.color || BED_COLORS[(_bedCount - 1) % BED_COLORS.length],

    // ── v3 : cultures ─────────────────────────────────────────
    crops: [],            // createCrop() items
    surface: 0,           // m², calculé automatiquement

    soil: {
      type: 'loam',       // 'clay'|'sandy'|'loam'|'rich'
      ph: 7.0,
      drainage: 'good',
      mulched: false,
    },
    microclimate: {
      sunExposure: 'full',   // 'full'|'partial'|'shade'
      windExposure: 'medium',
      frostRisk: 'low',
    },

    // ── v4 ────────────────────────────────────────────────────
    yieldHistory: [],
    aiRecommendations: [],
    irrigationSchedule: null,

    // ── v5 ────────────────────────────────────────────────────
    communityStats: null,
  };
}

function createCrop(type, posX, posY) {
  // Structure complète dès maintenant pour v3
  return {
    id: uid(),
    type: type,              // 'tomato'|'lettuce'|'carrot'|'basil'|...
    position: { x: posX || 0, y: posY || 0 }, // dans la zone (normalisé 0-1)
    growthStage: 0,          // 0 → 1 (semis → récolte)
    plantedAt: null,         // ISO date string
    harvestedAt: null,
    health: 1.0,             // 0 → 1

    // ── v4 ──────────────────────────────────────────────────
    predictedYield: null,    // grammes
    predictedHarvestDate: null,
    aiNotes: [],

    // ── v5 ──────────────────────────────────────────────────
    communityBenchmark: null,
  };
}

function createSerre(x, y) {
  return {
    id: uid(), type: 'serre',
    position: { x: x, y: y },
    dimensions: { width: m2px(3), height: m2px(1.5) },
    rotation: 0, pts: null,
    label: I18N.t('label_serre'),
    frameColor: THEME.glass.frame,

    // ── v3 ────────────────────────────────────────────────────
    heatingType: null,     // 'passive'|'active'|'geothermal'
    ventilation: null,     // 'manual'|'auto'
    microclimateBonus: 2,  // °C bonus vs extérieur
    crops: [],

    // ── v4 ────────────────────────────────────────────────────
    temperatureLog: [],
    humidityLog: [],
  };
}

function createHouse(x, y) {
  return {
    id: uid(), type: 'house',
    position: { x: x, y: y },
    dimensions: { width: m2px(10), height: m2px(8) },
    rotation: 0, pts: null,
    label: I18N.t('label_house'),
    wallColor: THEME.house.wall,
    roofColor: THEME.house.roof,

    // ── v3 ────────────────────────────────────────────────────
    floors: 1,
    openings: [],          // positions portes/fenêtres
    shadowCast: true,      // projette une ombre sur le jardin
  };
}

function createTree(x, y) {
  return {
    id: uid(), type: 'tree',
    position: { x: x, y: y },
    dimensions: { width: 60, height: 60 },
    rotation: 0,
    label: I18N.t('label_tree'),

    // ── v3 ────────────────────────────────────────────────────
    treeType: 'generic',   // 'fruit'|'shrub'|'conifer'|'deciduous'
    fruitType: null,
    plantingYear: null,
    height3d: 6,           // m (pour calcul ombre v3)
    canopyRadius: 30,      // px
    shadowAngle: 225,      // degrés
    shadowLength: 1.8,     // facteur

    // ── v4 ────────────────────────────────────────────────────
    yieldHistory: [],
  };
}

function createPath(x, y) {
  return {
    id: uid(), type: 'path',
    position: { x: x, y: y },
    dimensions: { width: m2px(3), height: m2px(0.6) },
    rotation: 0, pts: null,
    label: I18N.t('label_path'),
    pathStyle: 'gravel',   // v3: 'gravel'|'stone'|'wood'|'grass'
  };
}

function createFence() {
  return {
    id: uid(), type: 'fence',
    pts: [],               // [{x,y}] coordonnées monde
    closed: false,
    thickness: m2px(0.3), // 0.3 m fixe
    label: I18N.t('label_fence'),
    fenceStyle: 'wood',   // v3: 'wood'|'stone'|'wire'|'hedge'
    // champs de compatibilité
    position: { x: 0, y: 0 },
    dimensions: { width: 0, height: 0 },
    rotation: 0,
  };
}

// =============================================================
//  GARDEN STORE — état global de l'application
// =============================================================
var GardenStore = {
  version: 2,
  mode: 'edit',         // 'edit' | 'view'
  selectedId: null,

  northAngle: 0,        // degrés, 0 = nord vers le haut
  elements: [],

  // ── v4 / v5 hooks ─────────────────────────────────────────
  location: null,       // { lat, lng, altitude, timezone }
  climateZone: null,    // classification Koppen
  history: [],          // journal des modifications
  communityData: null,  // v5 : données collectives anonymisées

  // ── Méthodes ──────────────────────────────────────────────
  add: function(el) {
    this.elements.push(el);
    this.selectedId = el.id;
    this._computeSurfaces();
    return el;
  },

  remove: function(id) {
    this.elements = this.elements.filter(function(e) { return e.id !== id; });
    if (this.selectedId === id) this.selectedId = null;
  },

  getSelected: function() {
    var sid = this.selectedId;
    return this.elements.find(function(e) { return e.id === sid; }) || null;
  },

  bringToFront: function(el) {
    var idx = this.elements.indexOf(el);
    if (idx >= 0) { this.elements.splice(idx, 1); this.elements.push(el); }
  },

  _computeSurfaces: function() {
    this.elements.filter(function(e) { return e.type === 'bed'; }).forEach(function(bed) {
      if (bed.pts && bed.pts.length >= 3) {
        // Formule du lacet sur les coordonnées normalisées × dimensions réelles
        bed.surface = polyAreaNorm(bed.pts) * px2m(bed.dimensions.width) * px2m(bed.dimensions.height);
      } else {
        bed.surface = px2m(bed.dimensions.width) * px2m(bed.dimensions.height);
      }
    });
  },

  save: function() {
    try {
      localStorage.setItem('garden_v2', JSON.stringify({
        version: this.version, northAngle: this.northAngle,
        elements: this.elements, location: this.location,
        climateZone: this.climateZone,
      }));
      return true;
    } catch(e) { return false; }
  },

  load: function() {
    try {
      var d = JSON.parse(localStorage.getItem('garden_v2') || 'null');
      if (!d) return false;
      this.northAngle = d.northAngle || 0;
      this.elements   = d.elements   || [];
      this.location   = d.location   || null;
      this.climateZone = d.climateZone || null;
      _bedCount = this.elements.filter(function(e) { return e.type === 'bed'; }).length;
      this._computeSurfaces();
      return true;
    } catch(e) { return false; }
  },
};
