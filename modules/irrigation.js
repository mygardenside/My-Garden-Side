// My Garden Side — modules/irrigation.js
// V4.2 — Arrosage intelligent : ET0 Hargreaves-Samani + KC FAO-56
// Calcule le besoin en eau hebdomadaire par bac selon le profil climatique local.
// Dépend de : ClimateModule, getAppState, getCropStage, getCropSurface, getBedSurface

var IrrigationModule = (function () {

  // Coefficients culturaux KC par stade de croissance (source : FAO-56 simplifié)
  // Trois stades : initial (jeune plant), mid (pleine croissance), late (maturation)
  var KC = {
    'Tomate':           { initial: 0.60, mid: 1.15, late: 0.80 },
    'Poivron':          { initial: 0.60, mid: 1.05, late: 0.90 },
    'Aubergine':        { initial: 0.60, mid: 1.05, late: 0.90 },
    'Piment':           { initial: 0.60, mid: 1.05, late: 0.90 },
    'Courgette':        { initial: 0.50, mid: 1.00, late: 0.80 },
    'Concombre':        { initial: 0.60, mid: 1.00, late: 0.75 },
    'Melon':            { initial: 0.50, mid: 1.05, late: 0.75 },
    'Potiron':          { initial: 0.50, mid: 1.00, late: 0.80 },
    'Potimarron':       { initial: 0.50, mid: 1.00, late: 0.80 },
    'Pasteque':         { initial: 0.40, mid: 1.00, late: 0.75 },
    'Pastèque':         { initial: 0.40, mid: 1.00, late: 0.75 },
    'Courge butternut': { initial: 0.50, mid: 1.00, late: 0.80 },
    'Haricot':          { initial: 0.40, mid: 1.10, late: 0.90 },
    'Haricot vert':     { initial: 0.40, mid: 1.10, late: 0.90 },
    'Mais doux':        { initial: 0.30, mid: 1.20, late: 1.05 },
    'Maïs doux':        { initial: 0.30, mid: 1.20, late: 1.05 },
    'Pomme de terre':   { initial: 0.50, mid: 1.15, late: 0.75 },
    'Patate douce':     { initial: 0.50, mid: 1.15, late: 0.65 },
    'Salade':           { initial: 0.70, mid: 1.00, late: 0.95 },
    'Epinard':          { initial: 0.70, mid: 1.00, late: 0.95 },
    'Roquette':         { initial: 0.70, mid: 0.95, late: 0.90 },
    'Carotte':          { initial: 0.70, mid: 1.05, late: 0.95 },
    'Betterave':        { initial: 0.50, mid: 1.05, late: 0.95 },
    'Navet':            { initial: 0.50, mid: 1.10, late: 0.95 },
    'Radis':            { initial: 0.70, mid: 0.90, late: 0.85 },
    'Oignon':           { initial: 0.70, mid: 1.05, late: 0.75 },
    'Ail':              { initial: 0.70, mid: 1.00, late: 0.70 },
    'Poireau':          { initial: 0.70, mid: 1.10, late: 1.00 },
    'Chou':             { initial: 0.70, mid: 1.05, late: 0.95 },
    'Brocoli':          { initial: 0.70, mid: 1.05, late: 0.95 },
    'Chou-fleur':       { initial: 0.70, mid: 1.05, late: 0.95 },
    'Chou de Bruxelles':{ initial: 0.70, mid: 1.05, late: 0.95 },
    'Celeri':           { initial: 0.70, mid: 1.05, late: 1.00 },
    'Céleri':           { initial: 0.70, mid: 1.05, late: 1.00 },
    'Basilic':          { initial: 0.60, mid: 1.00, late: 0.90 },
    'Persil':           { initial: 0.60, mid: 1.05, late: 1.00 },
    'Fraise':           { initial: 0.40, mid: 0.85, late: 0.75 },
    'Framboise':        { initial: 0.40, mid: 1.05, late: 0.90 },
    '_default':         { initial: 0.50, mid: 0.90, late: 0.80 },
  };

  // Normalise un nom de légume (sans accents, minuscules) pour lookup KC
  var _norm = function (s) {
    return (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
  };

  // Cherche le KC d'un légume par correspondance normalisée
  function _findKC(name) {
    var n = _norm(name);
    var keys = Object.keys(KC);
    for (var i = 0; i < keys.length; i++) {
      if (_norm(keys[i]) === n) return KC[keys[i]];
    }
    return KC['_default'];
  }

  // Rayonnement extraterrestre Ra (MJ/m²/jour) — formule FAO-56 Eq. 21
  function _Ra(lat_deg, doy) {
    var phi   = lat_deg * Math.PI / 180;
    var dr    = 1 + 0.033 * Math.cos(2 * Math.PI * doy / 365);
    var delta = 0.409 * Math.sin(2 * Math.PI * doy / 365 - 1.39);
    var x     = -Math.tan(phi) * Math.tan(delta);
    var ws    = x < -1 ? Math.PI : x > 1 ? 0 : Math.acos(x);
    var Ra    = (24 * 60 / Math.PI) * 0.0820 * dr *
      (ws * Math.sin(phi) * Math.sin(delta) + Math.cos(phi) * Math.cos(delta) * Math.sin(ws));
    return Math.max(0, Ra);
  }

  // ET0 mensuelle (mm/mois) via Hargreaves-Samani
  // ET0_j (mm/j) = 0.0023 × Ra_mm × (Tmean + 17.8) × √(Tmax − Tmin)
  // Ra_mm = Ra (MJ/m²/j) ÷ 2.45 (chaleur latente de vaporisation)
  // Le constant 0.0023 est calibré pour Ra en mm/j équivalent — pas MJ/m²/j.
  var DAYS_PER_MONTH = [31,28,31,30,31,30,31,31,30,31,30,31];
  function _monthET0(mt, lat, monthIdx) {
    var doy   = Math.round(monthIdx * 30.44 + 15);
    var RaMJ  = _Ra(lat, doy);
    var Ra    = RaMJ / 2.45; // MJ/m²/j → mm/j équivalent (λ = 2.45 MJ/kg)
    var Tdiff = Math.max(0, mt.tmax - mt.tmin);
    var et0d  = 0.0023 * Ra * (mt.tmean + 17.8) * Math.sqrt(Tdiff);
    return Math.max(0, et0d) * (DAYS_PER_MONTH[monthIdx] || 30); // mm/mois
  }

  // KC d'une culture selon son stade de croissance
  function _kc(crop, veggie) {
    var table = veggie ? _findKC(veggie.name) : KC['_default'];
    var stage = typeof getCropStage === 'function' ? getCropStage(crop) : 'growing';
    if (stage === 'planned' || stage === 'harvested') return 0;
    if (stage === 'seedling') return table.initial;
    if (stage === 'maturing' || stage === 'harvest') return table.late;
    return table.mid;
  }

  // Pluie réelle prévue (mm/semaine) — null = utiliser la moyenne historique
  var _forecastRainWeekMm = null;
  // Températures prévues 7j (°C) — null = utiliser les moyennes climatiques mensuelles
  var _forecastTmax = null;
  var _forecastTmin = null;

  // ── API publique ───────────────────────────────────────────────
  return {

    // Stocker la pluie prévue sur 7 jours (mm) depuis la météo en temps réel
    setForecastRain: function (weeklyMm) {
      _forecastRainWeekMm = (typeof weeklyMm === 'number' && !isNaN(weeklyMm)) ? weeklyMm : null;
    },

    // Stocker les températures prévues (moyenne 7j) pour un ET0 basé sur la vraie semaine
    // Hargreaves-Samani utilise Tdiff = tmax-tmin comme proxy de l'ensoleillement :
    // une semaine nuageuse a un Tdiff réduit → ET0 automatiquement plus faible.
    setForecastTemp: function (tmax, tmin) {
      _forecastTmax = (typeof tmax === 'number' && !isNaN(tmax)) ? tmax : null;
      _forecastTmin = (typeof tmin === 'number' && !isNaN(tmin)) ? tmin : null;
    },

    // Besoin en eau d'un bac pour la semaine en cours (null si pas de données/cultures)
    getBedWaterNeed: function (bed) {
      var climate = typeof ClimateModule !== 'undefined' ? ClimateModule.get() : null;
      if (!climate || !climate.monthly) return null;

      var loc  = typeof getAppState === 'function' ? getAppState('location') : null;
      var lat  = loc ? (parseFloat(loc.lat) || 45) : 45;
      var mi   = new Date().getMonth(); // 0-11
      var mt   = climate.monthly[mi];

      // Si températures réelles disponibles, on les utilise à la place des moyennes historiques.
      // Tdiff (tmax-tmin) est naturellement plus faible les semaines nuageuses → ET0 réduit.
      var mtEff = (_forecastTmax !== null && _forecastTmin !== null) ? {
        tmean:  (_forecastTmax + _forecastTmin) / 2,
        tmax:   _forecastTmax,
        tmin:   _forecastTmin,
        precip: mt.precip
      } : mt;

      var et0m = _monthET0(mtEff, lat, mi); // mm/mois
      // Calibration H-S : la formule Hargreaves-Samani surestime l'ET0 de 10-15%
      // en France tempérée (climatologie continentale/océanique humide vs semi-aride original).
      // Coefficient 0.90 conservateur, bien documenté pour l'Europe de l'Ouest.
      var et0w = et0m / 4.33 * 0.90;       // mm/semaine (calibré France)

      var season = typeof getAppState === 'function' ? getAppState('currentSeason') : null;
      var crops  = typeof getAppState === 'function'
        ? getAppState('crops').filter(function (c) {
            return c.bedId === bed.id && c.season === season && c.status === 'active';
          })
        : [];

      if (!crops.length) return null;

      // KC moyen pondéré par surface occupée
      var totalSurf = 0, weightedKC = 0;
      crops.forEach(function (c) {
        var _vegs = typeof getAppState === 'function' ? (getAppState('vegetables') || {}) : {};
        var v    = _vegs[c.veggieId] || null;
        var kc   = _kc(c, v);
        var surf = typeof getCropSurface === 'function' ? getCropSurface(c) : 1;
        totalSurf  += surf;
        weightedKC += kc * surf;
      });
      var avgKC = totalSurf > 0 ? weightedKC / totalSurf : 0.9;

      var shadingCoeff = { shade: 0.75, partial: 0.88, full: 1.0 }[bed.sun] || 1.0;
      var mulchCoeff   = bed.mulched ? 0.65 : 1.0;
      var etcW    = et0w * avgKC * shadingCoeff * mulchCoeff; // besoin culture (mm/sem.)
      // Efficacité pluie : bac paillé = 0.85 (paillage retient l'eau, limite ruissellement)
      //                   bac nu    = 0.80 (pluies tempérées bien distribuées)
      var rainEff = bed.mulched ? 0.85 : 0.80;
      var rainW   = _forecastRainWeekMm !== null
        ? _forecastRainWeekMm * rainEff            // pluie réelle 7 j (pluie distribuée tempérée)
        : (mt.precip || 0) * 0.70 / 4.33;         // pluie historique mensuelle ÷ 4.33 (conservative)
      var netMm   = Math.max(0, etcW - rainW);       // déficit net (mm/sem.)
      // On utilise la surface réellement cultivée (totalSurf) et non la surface totale du bac :
      // les zones vides ne nécessitent pas d'irrigation complémentaire.
      var irrigSurf = Math.min(totalSurf, typeof getBedSurface === 'function' ? getBedSurface(bed) : totalSurf);
      var soilCoeff = { sandy:1.3, loam:1.0, clay:0.75, peat:0.85, rich:0.80 }[bed.soil] || 1.0;

      return {
        et0Week:       Math.round(et0w  * 10) / 10,
        etcWeek:       Math.round(etcW  * 10) / 10,
        rainWeek:      Math.round(rainW * 10) / 10,
        netMmPerM2:    Math.round(netMm * 10) / 10,
        litersPerWeek: Math.round((isNaN(netMm) ? 0 : netMm) * irrigSurf * soilCoeff),
        avgKC:         Math.round(avgKC * 100) / 100,
        deficit:       netMm >= 2, // seuil de déficit significatif
      };
    },

    // Résumé d'irrigation pour l'ensemble du jardin
    getSummary: function () {
      var beds  = typeof getAppState === 'function' ? getAppState('beds') : [];
      var total = 0, defBeds = 0;
      beds.forEach(function (bed) {
        var n = this.getBedWaterNeed(bed);
        if (!n || !n.deficit) return;
        total += n.litersPerWeek;
        defBeds++;
      }, this);
      return { totalLiters: Math.round(total), deficitBeds: defBeds };
    },
  };

}());
