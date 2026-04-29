// My Garden Side — modules/recommendations.js
// V4.3 — Recommandations IA contextualisées
// Moteur de règles agronomiques : climat × jardin × météo × GDD
// Dépend de : ClimateModule, GeoCalendar, IrrigationModule, getAppState, tVeg, t

var RecommendationsModule = (function () {

  function _en() {
    return typeof getAppState === 'function' && getAppState('language') === 'en';
  }

  function _vegName(v) {
    return v ? (typeof tVeg === 'function' ? tVeg(v.name) : v.name) : '?';
  }

  // ── Règle 1 : Alerte gel imminent (météo temps réel) ──────────
  function _ruleFrost(weather, crops, vegs, season) {
    if (!weather || !weather.daily || !weather.daily.temperature_2m_min) return null;
    var mins = weather.daily.temperature_2m_min;
    var times = weather.daily.time || [];
    for (var di = 0; di < Math.min(3, mins.length); di++) {
      if (mins[di] > 0) continue;
      var frostKillCrops = [];
      crops.forEach(function (c) {
        if (c.status !== 'active' || c.season !== season) return;
        var v  = vegs[c.veggieId];
        var ph = v && typeof GeoCalendar !== 'undefined' ? GeoCalendar.getPhenology(v) : null;
        if (ph && ph.frostKill) {
          var name = _vegName(v);
          if (frostKillCrops.indexOf(name) < 0) frostKillCrops.push(name);
        }
      });
      if (!frostKillCrops.length) break;
      var en   = _en();
      var when = di === 0
        ? (en ? 'tonight' : 'cette nuit')
        : di === 1 ? (en ? 'tomorrow night' : 'demain soir')
        : (en ? 'in 2 days' : 'dans 2 jours');
      return {
        priority: 0,
        icon: '❄️',
        title: en ? 'Frost alert — protect your crops' : 'Alerte gel — protégez vos cultures',
        body: (en ? 'Frost forecast ' + when + ' (' + Math.round(mins[di]) + '°C). Sensitive: '
                  : 'Gel prévu ' + when + ' (' + Math.round(mins[di]) + '°C). Sensibles : ') +
              frostKillCrops.slice(0, 3).join(', ') + '.',
        action: 'beds',
      };
    }
    return null;
  }

  // ── Règle 2 : Récolte prête ou imminente ──────────────────────
  function _ruleHarvest(crops, vegs, season) {
    var today = new Date();
    // Priorité au stage ratio (cohérent avec Actions du jour)
    var readyNow = crops.filter(function (c) {
      if (c.status === 'harvested' || c.season !== season) return false;
      return typeof getCropStage === 'function' && getCropStage(c) === 'harvest';
    });
    if (readyNow.length) {
      var en = _en();
      var names = readyNow.map(function (c) { return _vegName(vegs[c.veggieId]); }).slice(0, 3);
      return {
        priority: 1,
        icon: '🛒',
        title: en ? 'Ready to harvest' : 'Prêt à récolter',
        body: names.join(', ') + ' — ' + (en ? 'harvest now for best quality.' : 'récoltez maintenant pour la meilleure qualité.'),
        action: 'beds',
      };
    }
    // Fallback : dateHarvest dans ≤ 7 jours, pas encore au stade harvest
    var imminent = crops.filter(function (c) {
      if (!c.dateHarvest || c.status === 'harvested' || c.season !== season) return false;
      if (typeof getCropStage === 'function' && getCropStage(c) === 'harvest') return false;
      var d = Math.floor((new Date(c.dateHarvest) - today) / 86400000);
      return d >= 0 && d <= 7;
    });
    if (!imminent.length) return null;
    var en = _en();
    var names = imminent.map(function (c) { return _vegName(vegs[c.veggieId]); }).slice(0, 3);
    var days  = Math.floor((new Date(imminent[0].dateHarvest) - today) / 86400000);
    return {
      priority: 1,
      icon: '🛒',
      title: en ? 'Harvest ready soon' : 'Récolte imminente',
      body: names.join(', ') + (en
        ? ' — ready in ' + days + ' day' + (days !== 1 ? 's' : '') + '.'
        : ' — dans ' + days + ' jour' + (days !== 1 ? 's' : '') + '.'),
      action: 'beds',
    };
  }

  // ── Règle 3 : Déficit hydrique ────────────────────────────────
  function _ruleIrrigation() {
    if (typeof IrrigationModule === 'undefined') return null;
    var irr = IrrigationModule.getSummary();
    if (!irr.totalLiters) return null;
    var en = _en();
    return {
      priority: irr.deficitBeds > 1 ? 1 : 2,
      icon: '💧',
      title: en ? 'Water deficit this week' : 'Déficit hydrique cette semaine',
      body: (en
        ? irr.deficitBeds + ' bed' + (irr.deficitBeds > 1 ? 's' : '') + ' need ~' + irr.totalLiters + ' L this week.'
        : irr.deficitBeds + ' carré' + (irr.deficitBeds > 1 ? 's' : '') + ' nécessite' + (irr.deficitBeds > 1 ? 'nt' : '') + ' ~' + irr.totalLiters + ' L cette semaine.'),
      action: 'beds',
    };
  }

  // ── Règle 4 : Fenêtre de plantation ouverte maintenant ────────
  function _rulePlantNow(crops, vegs, season) {
    if (typeof GeoCalendar === 'undefined') return null;
    var climate = typeof ClimateModule !== 'undefined' ? ClimateModule.get() : null;
    if (!climate) return null;
    var currentMonth = new Date().getMonth() + 1; // 1-12
    var goodNow = [];
    Object.keys(vegs).forEach(function (vid) {
      var v = vegs[vid];
      var alreadyActive = crops.some(function (c) {
        return c.veggieId === vid && c.season === season && c.status !== 'harvested';
      });
      if (alreadyActive) return;
      var cal = GeoCalendar.getCalendarForVeggie(v);
      if (cal && cal.plantMonths && cal.plantMonths.indexOf(currentMonth) >= 0) {
        goodNow.push(_vegName(v));
      }
    });
    if (!goodNow.length) return null;
    var en = _en();
    var sample = goodNow.slice(0, 4).join(', ');
    return {
      priority: 2,
      icon: '🌱',
      title: en ? 'Good time to plant now' : 'Bon moment pour semer maintenant',
      body: (en ? 'In your climate: ' : 'Dans votre zone : ') + sample +
            (goodNow.length > 4 ? (en ? ' and ' + (goodNow.length - 4) + ' more.' : ' et ' + (goodNow.length - 4) + ' autres.') : '.'),
      action: 'planning',
    };
  }

  // ── Règle 5 : Saison GDD insuffisante pour des cultures actives
  function _ruleShortSeason(crops, vegs, season) {
    if (typeof GeoCalendar === 'undefined') return null;
    var climate = typeof ClimateModule !== 'undefined' ? ClimateModule.get() : null;
    if (!climate) return null;
    var struggling = [];
    crops.forEach(function (c) {
      if (c.status !== 'active' || c.season !== season) return;
      var v = vegs[c.veggieId];
      if (!v) return;
      var suf = GeoCalendar.isSeasonSufficient(v, climate);
      if (!suf.ok && suf.ratio < 0.8) {
        var name = _vegName(v);
        if (struggling.indexOf(name) < 0) struggling.push(name);
      }
    });
    if (!struggling.length) return null;
    var en = _en();
    return {
      priority: 2,
      icon: '⏱️',
      title: en ? 'Season too short for some crops' : 'Saison trop courte pour certaines cultures',
      body: (en ? 'May not get warm enough long enough to mature: ' : 'Risque de ne pas mûrir avant les gelées : ') +
            struggling.slice(0, 3).join(', ') +
            (en ? '. Prefer short-season varieties.' : '. Préférez des variétés hâtives.'),
      action: 'crops',
    };
  }

  // ── Règle 6 : Bacs vides cette saison ────────────────────────
  function _ruleEmptyBeds(beds, crops, season) {
    var empty = beds.filter(function (bed) {
      return !crops.some(function (c) {
        return c.bedId === bed.id && c.season === season && c.status !== 'harvested';
      });
    });
    if (!empty.length) return null;
    var en    = _en();
    var names = empty.map(function (b) { return b.name; }).slice(0, 2).join(', ');
    return {
      priority: 3,
      icon: '🟤',
      title: en ? 'Unused beds this season' : 'Bacs inoccupés cette saison',
      body: (en ? 'No crops planned in: ' : 'Aucune culture prévue dans : ') + names +
            (empty.length > 2 ? (en ? ' and ' + (empty.length - 2) + ' more.' : ' et ' + (empty.length - 2) + ' autres.') : '.'),
      action: 'planning',
    };
  }

  // ── Moteur principal ──────────────────────────────────────────
  function _generate(weather) {
    var tips   = [];
    var crops  = typeof getAppState === 'function' ? getAppState('crops') : [];
    var vegs   = typeof getAppState === 'function' ? getAppState('vegetables') : {};
    var beds   = typeof getAppState === 'function' ? getAppState('beds') : [];
    var season = typeof getAppState === 'function' ? getAppState('currentSeason') : null;

    var rules = [
      _ruleFrost(weather, crops, vegs, season),
      _ruleHarvest(crops, vegs, season),
      _ruleIrrigation(),
      _rulePlantNow(crops, vegs, season),
      _ruleShortSeason(crops, vegs, season),
      _ruleEmptyBeds(beds, crops, season),
    ];

    rules.forEach(function (r) { if (r) tips.push(r); });
    tips.sort(function (a, b) { return a.priority - b.priority; });
    return tips.slice(0, 5);
  }

  // ── API publique ──────────────────────────────────────────────
  return {
    generate: function (weather) {
      try { return _generate(weather); } catch (e) { return []; }
    },
  };

}());
