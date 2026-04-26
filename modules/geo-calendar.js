// Green Vibes — modules/geo-calendar.js
// V3 — Calendrier de semis adaptatif par profil climatique local
// Approche phénologique (seuils de température + GDD) — 100 % internationale
// Hémisphères nord et sud, zones tropicales, alpines, méditerranéennes.
//
// API publique :
//   GeoCalendar.getCalendarForVeggie(veggie)
//     → { plantMonths, harvestMonths, adjusted, warnings }
//   GeoCalendar.getCalendar(veggie, climate, location)
//     → idem, avec données explicites
//   GeoCalendar.predictHarvestDate(plantDateStr, veggie, climate)
//     → Date | null
//   GeoCalendar.isSeasonSufficient(veggie, climate)
//     → { ok, ratio, gddAccumulated, gddRequired }
//   GeoCalendar.getPhenology(veggie)
//     → objet phénologique ou null

var GeoCalendar = (function () {

  // ── Table phénologique ──────────────────────────────────────
  // frostKill   : la plante est tuée par le gel (Tmin < 0°C)
  // minSoilTemp : T° sol minimum pour planter en plein air (°C)
  // maxAirTemp  : si présent → culture de saison fraîche, monte-en-graine au-dessus
  // indoorWeeks : semis en intérieur X semaines avant la dernière gelée
  // autumnPlant : plantation principale en automne (ail, fève, échalote…)
  // gddBase     : température de base pour le calcul GDD (°C)
  // gddRequired : GDD cumulés nécessaires pour atteindre la récolte
  var PHENOLOGY = {
    // ── Solanacées ──
    'Tomate':            { frostKill:true,  minSoilTemp:15, indoorWeeks:6,  gddBase:10, gddRequired:1000 },
    'Poivron':           { frostKill:true,  minSoilTemp:18, indoorWeeks:8,  gddBase:10, gddRequired:1200 },
    'Aubergine':         { frostKill:true,  minSoilTemp:18, indoorWeeks:8,  gddBase:10, gddRequired:1200 },
    'Piment':            { frostKill:true,  minSoilTemp:18, indoorWeeks:8,  gddBase:10, gddRequired:1200 },
    'Pomme de terre':    { frostKill:false, minSoilTemp:8,  indoorWeeks:0,  gddBase:7,  gddRequired:800  },
    // ── Cucurbitacées ──
    'Courgette':         { frostKill:true,  minSoilTemp:15, indoorWeeks:3,  gddBase:10, gddRequired:600  },
    'Concombre':         { frostKill:true,  minSoilTemp:15, indoorWeeks:3,  gddBase:10, gddRequired:700  },
    'Melon':             { frostKill:true,  minSoilTemp:18, indoorWeeks:4,  gddBase:10, gddRequired:900  },
    'Potiron':           { frostKill:true,  minSoilTemp:15, indoorWeeks:3,  gddBase:10, gddRequired:1000 },
    'Potimarron':        { frostKill:true,  minSoilTemp:15, indoorWeeks:3,  gddBase:10, gddRequired:1000 },
    'Pasteque':          { frostKill:true,  minSoilTemp:20, indoorWeeks:4,  gddBase:10, gddRequired:1200 },
    'Pastèque':          { frostKill:true,  minSoilTemp:20, indoorWeeks:4,  gddBase:10, gddRequired:1200 },
    'Courge butternut':  { frostKill:true,  minSoilTemp:15, indoorWeeks:3,  gddBase:10, gddRequired:1000 },
    // ── Saison fraîche (monte-en-graine à la chaleur) ──
    'Salade':            { frostKill:false, minSoilTemp:5,  maxAirTemp:24,  gddBase:4,  gddRequired:450  },
    'Epinard':           { frostKill:false, minSoilTemp:4,  maxAirTemp:22,  gddBase:4,  gddRequired:300  },
    'Roquette':          { frostKill:false, minSoilTemp:5,  maxAirTemp:22,  gddBase:4,  gddRequired:250  },
    'Radis':             { frostKill:false, minSoilTemp:5,  maxAirTemp:22,  gddBase:4,  gddRequired:200  },
    'Navet':             { frostKill:false, minSoilTemp:5,  maxAirTemp:26,  gddBase:4,  gddRequired:400  },
    'Chou-fleur':        { frostKill:false, minSoilTemp:5,  maxAirTemp:24,  gddBase:4,  gddRequired:1000 },
    'Petit pois':        { frostKill:false, minSoilTemp:5,  maxAirTemp:22,  gddBase:4,  gddRequired:700  },
    'Pois mange-tout':   { frostKill:false, minSoilTemp:5,  maxAirTemp:22,  gddBase:4,  gddRequired:700  },
    'Mache':             { frostKill:false, minSoilTemp:4,  maxAirTemp:20,  gddBase:4,  gddRequired:300  },
    'Mâche':             { frostKill:false, minSoilTemp:4,  maxAirTemp:20,  gddBase:4,  gddRequired:300  },
    'Carotte':           { frostKill:false, minSoilTemp:5,  maxAirTemp:28,  gddBase:4,  gddRequired:800  },
    'Betterave':         { frostKill:false, minSoilTemp:8,  maxAirTemp:28,  gddBase:4,  gddRequired:600  },
    'Radis noir':        { frostKill:false, minSoilTemp:5,  maxAirTemp:24,  gddBase:4,  gddRequired:500  },
    'Pak choi':          { frostKill:false, minSoilTemp:5,  maxAirTemp:24,  gddBase:4,  gddRequired:400  },
    'Coriandre':         { frostKill:false, minSoilTemp:5,  maxAirTemp:24,  gddBase:4,  gddRequired:400  },
    'Fenouil':           { frostKill:false, minSoilTemp:8,  maxAirTemp:26,  gddBase:4,  gddRequired:800  },
    'Chicorée':          { frostKill:false, minSoilTemp:8,  maxAirTemp:26,  gddBase:4,  gddRequired:700  },
    'Cresson':           { frostKill:false, minSoilTemp:4,  maxAirTemp:20,  gddBase:4,  gddRequired:300  },
    'Aneth':             { frostKill:false, minSoilTemp:8,  maxAirTemp:30,  gddBase:4,  gddRequired:500  },
    // ── Brassicacées résistantes (pas maxAirTemp strict, semis intérieur possible) ──
    'Chou':              { frostKill:false, minSoilTemp:5,  indoorWeeks:4,  gddBase:4,  gddRequired:1000 },
    'Brocoli':           { frostKill:false, minSoilTemp:5,  indoorWeeks:4,  gddBase:4,  gddRequired:1000 },
    'Chou rouge':        { frostKill:false, minSoilTemp:5,  indoorWeeks:4,  gddBase:4,  gddRequired:1000 },
    'Kale':              { frostKill:false, minSoilTemp:5,  indoorWeeks:4,  gddBase:4,  gddRequired:800  },
    'Chou de Bruxelles': { frostKill:false, minSoilTemp:5,  indoorWeeks:4,  gddBase:4,  gddRequired:1500 },
    // ── Légumineuses ──
    'Haricot':           { frostKill:true,  minSoilTemp:12, indoorWeeks:0,  gddBase:10, gddRequired:600  },
    'Haricot vert':      { frostKill:true,  minSoilTemp:12, indoorWeeks:0,  gddBase:10, gddRequired:600  },
    'Mais doux':         { frostKill:true,  minSoilTemp:12, indoorWeeks:0,  gddBase:10, gddRequired:1200 },
    'Maïs doux':         { frostKill:true,  minSoilTemp:12, indoorWeeks:0,  gddBase:10, gddRequired:1200 },
    // ── Plantation automnale ──
    'Ail':               { frostKill:false, minSoilTemp:4,  indoorWeeks:0,  gddBase:4,  gddRequired:1500, autumnPlant:true },
    'Echalote':          { frostKill:false, minSoilTemp:4,  indoorWeeks:0,  gddBase:4,  gddRequired:1200, autumnPlant:true },
    'Échalote':          { frostKill:false, minSoilTemp:4,  indoorWeeks:0,  gddBase:4,  gddRequired:1200, autumnPlant:true },
    'Feve':              { frostKill:false, minSoilTemp:5,  maxAirTemp:22,  gddBase:4,  gddRequired:900,  autumnPlant:true },
    'Fève':              { frostKill:false, minSoilTemp:5,  maxAirTemp:22,  gddBase:4,  gddRequired:900,  autumnPlant:true },
    // ── Légumes-bulbes (semis intérieur tôt) ──
    'Oignon':            { frostKill:false, minSoilTemp:5,  indoorWeeks:10, gddBase:4,  gddRequired:1200 },
    'Poireau':           { frostKill:false, minSoilTemp:5,  indoorWeeks:10, gddBase:4,  gddRequired:1500 },
    'Ciboulette':        { frostKill:false, minSoilTemp:5,  indoorWeeks:0,  gddBase:4,  gddRequired:500  },
    // ── Apiacées ──
    'Persil':            { frostKill:false, minSoilTemp:5,  indoorWeeks:0,  gddBase:4,  gddRequired:600  },
    'Panais':            { frostKill:false, minSoilTemp:5,  indoorWeeks:0,  gddBase:4,  gddRequired:1200 },
    'Celeri':            { frostKill:false, minSoilTemp:8,  indoorWeeks:10, gddBase:4,  gddRequired:1500 },
    'Céleri':            { frostKill:false, minSoilTemp:8,  indoorWeeks:10, gddBase:4,  gddRequired:1500 },
    'Celeri-rave':       { frostKill:false, minSoilTemp:8,  indoorWeeks:10, gddBase:4,  gddRequired:1500 },
    'Celeri branche':    { frostKill:false, minSoilTemp:8,  indoorWeeks:10, gddBase:4,  gddRequired:1500 },
    // ── Aromatiques ──
    'Basilic':           { frostKill:true,  minSoilTemp:18, indoorWeeks:4,  gddBase:10, gddRequired:400  },
    'Menthe':            { frostKill:false, minSoilTemp:5,  indoorWeeks:0,  gddBase:4,  gddRequired:400  },
    'Thym':              { frostKill:false, minSoilTemp:8,  indoorWeeks:0,  gddBase:4,  gddRequired:600  },
    'Romarin':           { frostKill:false, minSoilTemp:8,  indoorWeeks:0,  gddBase:4,  gddRequired:600  },
    'Sauge':             { frostKill:false, minSoilTemp:8,  indoorWeeks:0,  gddBase:4,  gddRequired:600  },
    'Origan':            { frostKill:false, minSoilTemp:8,  indoorWeeks:0,  gddBase:4,  gddRequired:500  },
    'Estragon':          { frostKill:false, minSoilTemp:8,  indoorWeeks:0,  gddBase:4,  gddRequired:600  },
    // ── Divers ──
    'Blette':            { frostKill:false, minSoilTemp:8,  indoorWeeks:0,  gddBase:4,  gddRequired:600  },
    'Patate douce':      { frostKill:true,  minSoilTemp:20, indoorWeeks:0,  gddBase:10, gddRequired:1200 },
    'Fraise':            { frostKill:false, minSoilTemp:8,  indoorWeeks:0,  gddBase:4,  gddRequired:800  },
    'Framboise':         { frostKill:false, minSoilTemp:8,  indoorWeeks:0,  gddBase:4,  gddRequired:800  },
    'Artichaut':         { frostKill:false, minSoilTemp:8,  indoorWeeks:0,  gddBase:4,  gddRequired:1200 },
    'Topinambour':       { frostKill:false, minSoilTemp:5,  indoorWeeks:0,  gddBase:4,  gddRequired:1500 },
    'Asperge':           { frostKill:false, minSoilTemp:8,  indoorWeeks:0,  gddBase:4,  gddRequired:800  },
    'Groseille':         { frostKill:false, minSoilTemp:5,  indoorWeeks:0,  gddBase:4,  gddRequired:800  },
    'Endive':            { frostKill:false, minSoilTemp:8,  indoorWeeks:0,  gddBase:4,  gddRequired:900  },
    'Pomme de terre':    { frostKill:false, minSoilTemp:8,  indoorWeeks:0,  gddBase:7,  gddRequired:800  },
  };

  // Index normalisé (insensible aux accents et à la casse)
  var _phenoMap = (function () {
    var map = {};
    Object.keys(PHENOLOGY).forEach(function (k) {
      map[_norm(k)] = PHENOLOGY[k];
    });
    return map;
  }());

  function _norm(s) {
    return (s || '').toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
  }

  function _getPhenology(veggie) {
    return _phenoMap[_norm(veggie.name)] || null;
  }

  // Jour de l'année → mois (1-12), sur une année non-bissextile
  function _doyToMonth(doy) {
    var d = new Date(2001, 0, Math.max(1, Math.min(365, Math.round(doy))));
    return d.getMonth() + 1;
  }

  // Milieu du mois en jour de l'année (approximatif)
  function _monthMidDoy(m) {
    return Math.round((m - 1) * 30.44 + 15);
  }

  // Addition de mois avec rebouclage (1-12)
  function _addM(m, n) {
    return ((m - 1 + n + 120) % 12) + 1;
  }

  // Déduplique et trie un tableau de mois (1-12)
  function _uniq(months) {
    var seen = {}, out = [];
    months.forEach(function (m) {
      var mc = ((m - 1 + 12) % 12) + 1;
      if (!seen[mc]) { seen[mc] = true; out.push(mc); }
    });
    return out.sort(function (a, b) { return a - b; });
  }

  // GDD mensuel (approximation : 30 jours × max(0, tmoy - base))
  function _monthGDD(mt, base) {
    var avg = (mt.tmax + mt.tmin) / 2;
    return Math.max(0, avg - base) * 30;
  }

  // ── Cultures de saison chaude (frostKill = true) ────────────
  function _warmSeason(pheno, climate) {
    var monthly       = climate.monthly;
    var lastFrostDOY  = climate.lastFrostDOY;
    var firstFrostDOY = climate.firstFrostDOY;
    var plantMonths   = [];
    var harvestMonths = [];
    var warnings      = [];

    if (!lastFrostDOY) {
      // Zone tropicale / pas de gelée → planter quand le sol est assez chaud
      for (var m = 1; m <= 12; m++) {
        var mt = monthly[m - 1];
        // Sol ≈ 60 % Tmax + 40 % Tmin (estimé)
        var soilEst = mt.tmin * 0.4 + mt.tmax * 0.6;
        if (soilEst >= pheno.minSoilTemp) plantMonths.push(m);
      }
      if (plantMonths.length === 0)
        warnings.push({ type: 'unsuitable_climate' });
      // Récolte : nbMois après plantation selon GDD
      var avgGddPerDay = 0;
      plantMonths.forEach(function (pm) {
        var mmt = monthly[pm - 1];
        avgGddPerDay += Math.max(0, (mmt.tmax + mmt.tmin) / 2 - pheno.gddBase);
      });
      avgGddPerDay = plantMonths.length ? avgGddPerDay / plantMonths.length : 8;
      var daysH = Math.ceil(pheno.gddRequired / Math.max(1, avgGddPerDay));
      plantMonths.forEach(function (pm) {
        harvestMonths.push(_addM(pm, Math.round(daysH / 30)));
      });
    } else {
      var lastFrostMonth  = _doyToMonth(lastFrostDOY);
      var firstFrostMonth = firstFrostDOY ? _doyToMonth(firstFrostDOY) : 12;

      // Semis intérieur
      if (pheno.indoorWeeks > 0) {
        var indoorDOY = Math.max(1, lastFrostDOY - pheno.indoorWeeks * 7);
        plantMonths.push(_doyToMonth(indoorDOY));
      }

      // Plantation extérieure : dès lastFrostMonth, si sol assez chaud
      for (var pm2 = lastFrostMonth; pm2 <= lastFrostMonth + 2; pm2++) {
        var mo = _addM(pm2, 0);
        var soilEst2 = monthly[mo - 1].tmin * 0.4 + monthly[mo - 1].tmax * 0.6;
        if (soilEst2 >= pheno.minSoilTemp) plantMonths.push(mo);
      }

      // Vérification GDD disponibles entre lastFrost et firstFrost
      var gddAcc = 0;
      var gStart = lastFrostMonth;
      var gEnd   = firstFrostDOY ? firstFrostMonth - 1 : 12;
      if (gEnd < gStart) gEnd = 12;
      for (var gm = gStart; gm <= gEnd; gm++) {
        gddAcc += _monthGDD(monthly[_addM(gm, 0) - 1], pheno.gddBase);
      }
      var ratio = gddAcc / pheno.gddRequired;
      if (ratio < 0.8) warnings.push({ type: 'short_season', ratio: ratio });

      // Date de récolte estimée (GDD mensuels cumulés depuis plantation)
      var totalMonthlyGdd = 0, cntGm = 0;
      for (var hm = lastFrostMonth; hm <= lastFrostMonth + 5; hm++) {
        totalMonthlyGdd += _monthGDD(monthly[_addM(hm, 0) - 1], pheno.gddBase);
        cntGm++;
      }
      var avgMonthlyGdd     = cntGm ? totalMonthlyGdd / cntGm : 150;
      var monthsToHarvest   = avgMonthlyGdd > 0 ? Math.round(pheno.gddRequired / avgMonthlyGdd) : 3;
      var harvestStartMonth = _addM(lastFrostMonth + 1, monthsToHarvest);
      for (var hhm = 0; hhm < 3; hhm++) {
        var hmo = _addM(harvestStartMonth, hhm);
        if (firstFrostDOY && hmo >= firstFrostMonth) break;
        harvestMonths.push(hmo);
      }
    }

    return { plantMonths: _uniq(plantMonths), harvestMonths: _uniq(harvestMonths), warnings: warnings };
  }

  // ── Cultures de saison fraîche (maxAirTemp = seuil de montée-en-graine) ──
  function _coolSeason(pheno, climate) {
    var monthly     = climate.monthly;
    var maxAirTemp  = pheno.maxAirTemp || 30;
    var plantMonths = [], harvestMonths = [];

    for (var m = 1; m <= 12; m++) {
      var mt      = monthly[m - 1];
      var soilEst = mt.tmin * 0.4 + mt.tmax * 0.6;
      var tmean   = mt.tmean;
      if (soilEst >= pheno.minSoilTemp && tmean <= maxAirTemp) {
        plantMonths.push(m);
        // Récolte : daysToHarvest ≈ gddRequired / GDD_jour
        var dailyGdd = Math.max(0.5, (mt.tmax + mt.tmin) / 2 - pheno.gddBase);
        var days     = Math.ceil(pheno.gddRequired / dailyGdd);
        var hm       = _doyToMonth(_monthMidDoy(m) + days);
        harvestMonths.push(hm);
      }
    }

    return { plantMonths: _uniq(plantMonths), harvestMonths: _uniq(harvestMonths), warnings: [] };
  }

  // ── Cultures tolérantes au froid, semis intérieur possible ──
  function _generalCrop(pheno, climate) {
    var monthly     = climate.monthly;
    var plantMonths = [], harvestMonths = [];
    var indoorWeeks = pheno.indoorWeeks || 0;
    var lastFrostDOY  = climate.lastFrostDOY;
    var firstFrostDOY = climate.firstFrostDOY;

    if (indoorWeeks > 0 && lastFrostDOY) {
      var indoorDOY = Math.max(1, lastFrostDOY - indoorWeeks * 7);
      plantMonths.push(_doyToMonth(indoorDOY));
    }

    for (var m = 1; m <= 12; m++) {
      var mt2     = monthly[m - 1];
      var soilEst2 = mt2.tmin * 0.4 + mt2.tmax * 0.6;
      if (soilEst2 >= pheno.minSoilTemp) {
        var mo = m;
        if (firstFrostDOY) {
          var ffm = _doyToMonth(firstFrostDOY);
          if (mo > ffm) continue;
        }
        plantMonths.push(mo);
        var dailyGdd = Math.max(0.5, (mt2.tmax + mt2.tmin) / 2 - pheno.gddBase);
        var days     = Math.ceil(pheno.gddRequired / dailyGdd);
        harvestMonths.push(_doyToMonth(_monthMidDoy(m) + days));
      }
    }

    return { plantMonths: _uniq(plantMonths), harvestMonths: _uniq(harvestMonths), warnings: [] };
  }

  // ── Cultures à plantation automnale (ail, fève, échalote…) ──
  function _autumnCrop(pheno, climate) {
    var monthly     = climate.monthly;
    var plantMonths = [], harvestMonths = [];

    // Chercher le mois le plus chaud (pic estival)
    var peakMonth = 1, peakTemp = -Infinity;
    for (var m = 1; m <= 12; m++) {
      if (monthly[m - 1].tmean > peakTemp) {
        peakTemp = monthly[m - 1].tmean;
        peakMonth = m;
      }
    }

    // Planter après le pic, quand la T° descend entre 4 et 16 °C
    for (var am = peakMonth + 1; am <= peakMonth + 7; am++) {
      var mo = _addM(am, 0);
      var t  = monthly[mo - 1].tmean;
      if (t >= 4 && t <= 16) plantMonths.push(mo);
    }

    // Zone tropicale sans vrai hiver : prendre les 2-3 mois les plus frais
    if (plantMonths.length === 0) {
      var minTemp = Infinity, coolest = 1;
      for (var m2 = 1; m2 <= 12; m2++) {
        if (monthly[m2 - 1].tmean < minTemp) {
          minTemp = monthly[m2 - 1].tmean; coolest = m2;
        }
      }
      for (var k = -1; k <= 1; k++) plantMonths.push(_addM(coolest + k, 0));
    }

    // Récolte : ~8 mois après (ail) ou ~6 mois (fève)
    var harvestOffset = pheno.gddRequired >= 1400 ? 8 : 6;
    plantMonths.forEach(function (pm) {
      harvestMonths.push(_addM(pm, harvestOffset));
      harvestMonths.push(_addM(pm, harvestOffset + 1));
    });

    return { plantMonths: _uniq(plantMonths), harvestMonths: _uniq(harvestMonths), warnings: [] };
  }

  // ── Risques de rotation par famille botanique ───────────────
  // restYears      : repos minimum recommandé en zone standard
  // humidExtra     : années supplémentaires si zone humide
  // humidKoppen    : codes Koppen considérés comme "humides"
  // disease.fr/en  : nom des maladies dans chaque langue
  var ROTATION_RISKS = {
    'Solanacees': {
      restYears: 3, humidExtra: 1,
      humidKoppen: ['Cfb','Cfa','Cfc','Dfb','Dfa','Dfc','Am','Af'],
      disease: { fr: 'fusariose et mildiou résiduel', en: 'fusarium wilt and late blight' },
    },
    'Brassicacees': {
      restYears: 4, humidExtra: 1,
      humidKoppen: ['Cfb','Cfa','Dfb','Dfa','Am'],
      disease: { fr: 'hernie du chou (spores viables 7 ans)', en: 'clubroot (spores viable 7 years)' },
    },
    'Cucurbitacees': {
      restYears: 3, humidExtra: 1,
      humidKoppen: ['Cfb','Cfa','Cfc','Am','Af'],
      disease: { fr: 'fusarium et pythium (pourritures racinaires)', en: 'fusarium and pythium root rot' },
    },
    'Fabacees': {
      restYears: 3, humidExtra: 1,
      humidKoppen: ['Cfb','Cfa','Am','Af','Dfb'],
      disease: { fr: 'sclérotinia et anthracnose', en: 'sclerotinia and anthracnose' },
    },
    'Liliacees': {
      restYears: 4, humidExtra: 2,
      humidKoppen: ['Cfb','Cfa','Cfc','Dfb','Dfa'],
      disease: { fr: 'pourriture blanche (Sclerotium cepivorum — survit 20 ans)', en: 'white rot (Sclerotium cepivorum — survives 20 years)' },
    },
    'Apiacees': {
      restYears: 3, humidExtra: 0,
      humidKoppen: [],
      disease: { fr: 'alternaria et mouche de la carotte', en: 'alternaria blight and carrot fly' },
    },
    'Chenopodiacees': {
      restYears: 3, humidExtra: 0,
      humidKoppen: [],
      disease: { fr: 'cercosporiose', en: 'cercospora leaf spot' },
    },
    'Asteracees': {
      restYears: 2, humidExtra: 0,
      humidKoppen: [],
      disease: { fr: 'sclérotinia', en: 'sclerotinia' },
    },
  };

  // Compte le nombre de saisons consécutives (en remontant depuis la saison courante)
  // où la famille est présente dans le bac
  function _countConsecutive(bedId, family, seasons, currentSeason) {
    var idx = seasons.indexOf(currentSeason);
    if (idx < 0) return 0;
    var count = 0;
    for (var i = idx; i >= 0; i--) {
      var fams = typeof getBedFamilies === 'function'
        ? getBedFamilies(bedId, seasons[i]) : [];
      if (fams.indexOf(family) >= 0) count++;
      else break;
    }
    return count;
  }

  // ── API publique ────────────────────────────────────────────
  return {

    getPhenology: function (veggie) { return _getPhenology(veggie); },

    getCalendar: function (veggie, climate, location) {
      if (!climate || !climate.monthly || !climate.monthly.length) {
        return typeof getPlantingCalendarForVeggie === 'function'
          ? getPlantingCalendarForVeggie(veggie) : null;
      }

      var pheno = _getPhenology(veggie);
      if (!pheno) {
        return typeof getPlantingCalendarForVeggie === 'function'
          ? getPlantingCalendarForVeggie(veggie) : null;
      }

      var result;
      if (pheno.autumnPlant)                          result = _autumnCrop(pheno, climate);
      else if (pheno.frostKill)                       result = _warmSeason(pheno, climate);
      else if (pheno.maxAirTemp !== undefined)        result = _coolSeason(pheno, climate);
      else                                            result = _generalCrop(pheno, climate);

      result.adjusted = true;
      return result;
    },

    // Raccourci : lit le climat depuis ClimateModule automatiquement
    getCalendarForVeggie: function (veggie) {
      var climate  = typeof ClimateModule  !== 'undefined' ? ClimateModule.get() : null;
      var location = typeof getAppState    === 'function'  ? getAppState('location') : null;
      if (climate && climate.monthly && climate.monthly.length) {
        return this.getCalendar(veggie, climate, location);
      }
      return typeof getPlantingCalendarForVeggie === 'function'
        ? getPlantingCalendarForVeggie(veggie) : null;
    },

    // Prédit la date de récolte à partir d'une date de plantation, en simulant les GDD jour par jour
    predictHarvestDate: function (plantDateStr, veggie, climate) {
      var pheno = _getPhenology(veggie);
      if (!pheno || !climate || !climate.monthly) return null;
      var date    = new Date(plantDateStr);
      var gddAcc  = 0;
      var maxDays = 400;
      while (gddAcc < pheno.gddRequired && maxDays-- > 0) {
        var mo   = date.getMonth(); // 0-11
        var mt   = climate.monthly[mo];
        gddAcc  += Math.max(0, (mt.tmax + mt.tmin) / 2 - pheno.gddBase);
        date.setDate(date.getDate() + 1);
      }
      return maxDays > 0 ? date : null;
    },

    // Vérifie si la saison est suffisamment longue pour récolter
    isSeasonSufficient: function (veggie, climate) {
      var pheno = _getPhenology(veggie);
      if (!pheno || !climate || !climate.monthly)
        return { ok: true, ratio: 1, gddAccumulated: 0, gddRequired: 0 };

      if (!climate.lastFrostDOY)
        return { ok: true, ratio: 2, gddAccumulated: pheno.gddRequired * 2, gddRequired: pheno.gddRequired };

      var start  = _doyToMonth(climate.lastFrostDOY);
      var end    = climate.firstFrostDOY ? _doyToMonth(climate.firstFrostDOY) - 1 : 12;
      if (end < start) end = 12;
      var gddAcc = 0;
      for (var m = start; m <= end; m++) {
        var mo = _addM(m, 0);
        gddAcc += _monthGDD(climate.monthly[mo - 1], pheno.gddBase);
      }
      var ratio = gddAcc / pheno.gddRequired;
      return { ok: ratio >= 0.85, ratio: ratio,
               gddAccumulated: Math.round(gddAcc), gddRequired: pheno.gddRequired };
    },

    // Analyse climatique de la rotation pour un bac donné.
    // Retourne un tableau d'alertes pour les familles à risque.
    // Chaque alerte : { family, consecutive, restYears, disease, humidRisk, koppen }
    getRotationAlert: function (bed) {
      var climate       = typeof ClimateModule !== 'undefined' ? ClimateModule.get() : null;
      var seasons       = typeof getAppState   === 'function'  ? (getAppState('seasons') || []) : [];
      var currentSeason = typeof getAppState   === 'function'  ? getAppState('currentSeason') : null;
      var lang          = typeof getAppState   === 'function'  ? (getAppState('language') || 'fr') : 'fr';
      var koppen        = climate ? (climate.koppen || '') : '';

      var currentFamilies = typeof getBedFamilies === 'function'
        ? getBedFamilies(bed.id, currentSeason) : [];

      var alerts = [];

      currentFamilies.forEach(function (family) {
        var risk = ROTATION_RISKS[family];
        if (!risk) return;

        var consec = _countConsecutive(bed.id, family, seasons, currentSeason);
        if (consec < 2) return; // 1 saison = normal, pas d'alerte

        var isHumid   = risk.humidKoppen.indexOf(koppen) >= 0;
        var restYears = risk.restYears + (isHumid ? risk.humidExtra : 0);

        alerts.push({
          family:      family,
          consecutive: consec,
          restYears:   restYears,
          disease:     risk.disease[lang] || risk.disease.fr,
          humidRisk:   isHumid,
          koppen:      koppen,
        });
      });

      return alerts;
    },
  };

}());
