// Green Vibes — modules/climate.js
// Profil climatique intelligent — Open-Meteo Historical API (gratuit, sans clé)
// Calcule : classification Koppen, zone USDA, gelées, saison de jardinage, GDD, pluie

var ClimateModule = (function () {
  var ARCHIVE_URL = 'https://archive-api.open-meteo.com/v1/archive';
  var YEAR_START  = '2013-01-01';
  var YEAR_END    = '2022-12-31';

  // ── Labels Koppen ───────────────────────────────────────────
  var KOPPEN_LABELS = {
    fr: {
      Af:'Tropical humide', Am:'Tropical de mousson', Aw:'Tropical sec',
      BSh:'Steppe aride chaud', BSk:'Steppe aride froid',
      BWh:'Désert chaud', BWk:'Désert froid',
      Csa:'Méditerranéen chaud', Csb:'Méditerranéen doux',
      Cfa:'Subtropical humide', Cfb:'Tempéré océanique', Cfc:'Océanique subarctique',
      Dsa:'Continental médi. chaud', Dsb:'Continental médi. doux',
      Dfa:'Continental humide chaud', Dfb:'Continental humide doux',
      Dfc:'Subarctique', ET:'Toundra', EF:'Polaire',
    },
    en: {
      Af:'Tropical rainforest', Am:'Tropical monsoon', Aw:'Tropical savanna',
      BSh:'Hot semi-arid', BSk:'Cold semi-arid',
      BWh:'Hot desert', BWk:'Cold desert',
      Csa:'Hot Mediterranean', Csb:'Warm Mediterranean',
      Cfa:'Humid subtropical', Cfb:'Oceanic', Cfc:'Subpolar oceanic',
      Dsa:'Hot continental Mediterranean', Dsb:'Warm continental Mediterranean',
      Dfa:'Hot continental', Dfb:'Warm continental',
      Dfc:'Subarctic', ET:'Tundra', EF:'Ice cap',
    },
  };

  // USDA Hardiness zones — seuils en °C (température minimale annuelle extrême moyenne)
  var HARDINESS = [
    [-51.1,-48.3,'1a'],[-48.3,-45.6,'1b'],[-45.6,-42.8,'2a'],[-42.8,-40.0,'2b'],
    [-40.0,-37.2,'3a'],[-37.2,-34.4,'3b'],[-34.4,-31.7,'4a'],[-31.7,-28.9,'4b'],
    [-28.9,-26.1,'5a'],[-26.1,-23.3,'5b'],[-23.3,-20.6,'6a'],[-20.6,-17.8,'6b'],
    [-17.8,-15.0,'7a'],[-15.0,-12.2,'7b'],[-12.2, -9.4,'8a'],[ -9.4, -6.7,'8b'],
    [ -6.7, -3.9,'9a'],[ -3.9, -1.1,'9b'],[ -1.1,  1.7,'10a'],[  1.7,  4.4,'10b'],
    [  4.4,  7.2,'11a'],[  7.2, 10.0,'11b'],[ 10.0, 12.8,'12a'],[ 12.8,100.0,'12b'],
  ];

  function _hardinessZone(avgMinTemp) {
    for (var i = 0; i < HARDINESS.length; i++) {
      if (avgMinTemp >= HARDINESS[i][0] && avgMinTemp < HARDINESS[i][1]) return HARDINESS[i][2];
    }
    return '?';
  }

  function _dayOfYear(date) {
    var start = new Date(Date.UTC(date.getUTCFullYear(), 0, 0));
    return Math.floor((date - start) / 86400000);
  }

  function _doyToStr(doy, lang) {
    var d = new Date(2001, 0, doy); // année non-bissextile pour cohérence
    return lang === 'en'
      ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      : d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
  }

  function _median(arr) {
    if (!arr.length) return null;
    var s = arr.slice().sort(function(a, b) { return a - b; });
    var m = Math.floor(s.length / 2);
    return s.length % 2 === 0 ? (s[m - 1] + s[m]) / 2 : s[m];
  }

  // Classification Koppen simplifiée (hémisphère nord)
  function _classifyKoppen(monthly) {
    var annualPrecip = 0, annualMean = 0;
    var coldestMean = Infinity, hottestMean = -Infinity;
    for (var i = 0; i < 12; i++) {
      annualPrecip += monthly[i].precip;
      annualMean   += monthly[i].tmean;
      if (monthly[i].tmean < coldestMean) coldestMean = monthly[i].tmean;
      if (monthly[i].tmean > hottestMean) hottestMean = monthly[i].tmean;
    }
    annualMean /= 12;

    // Été = avr–sept (idx 3–8), Hiver = oct–mars (idx 9–11 + 0–2)
    var summerPrecip = 0, winterPrecip = 0;
    var driesestSummer = Infinity, wettestWinter = -Infinity;
    for (var j = 0; j < 12; j++) {
      if (j >= 3 && j <= 8) {
        summerPrecip += monthly[j].precip;
        if (monthly[j].precip < driesestSummer) driesestSummer = monthly[j].precip;
      } else {
        winterPrecip += monthly[j].precip;
        if (monthly[j].precip > wettestWinter) wettestWinter = monthly[j].precip;
      }
    }
    var summerFrac = annualPrecip > 0 ? summerPrecip / annualPrecip : 0.5;

    // Groupe E : Polaire
    if (hottestMean < 10) return hottestMean < 0 ? 'EF' : 'ET';

    // Groupe B : Aride — seuil Pthresh selon la formule Koppen
    var pThresh = annualMean * 20 + (summerFrac > 0.67 ? 280 : summerFrac > 0.33 ? 140 : 0);
    if (annualPrecip < pThresh) {
      return annualPrecip < pThresh / 2
        ? (annualMean >= 18 ? 'BWh' : 'BWk')
        : (annualMean >= 18 ? 'BSh' : 'BSk');
    }

    // Test méditerranéen : été sec
    var isMedi = driesestSummer < 40 && driesestSummer < wettestWinter / 3;

    // Groupe A : Tropical
    if (coldestMean >= 18) return 'Af';

    // Groupe C : Tempéré (mois le plus froid ≥ −3°C et < 18°C)
    if (coldestMean >= -3) {
      if (isMedi) return hottestMean >= 22 ? 'Csa' : 'Csb';
      return hottestMean >= 22 ? 'Cfa' : (hottestMean >= 10 ? 'Cfb' : 'Cfc');
    }

    // Groupe D : Continental (mois le plus froid < −3°C)
    if (isMedi) return hottestMean >= 22 ? 'Dsa' : 'Dsb';
    return hottestMean >= 22 ? 'Dfa' : (hottestMean >= 10 ? 'Dfb' : 'Dfc');
  }

  function _processData(daily) {
    var dates = daily.time;
    var tmax  = daily.temperature_2m_max;
    var tmin  = daily.temperature_2m_min;
    var prec  = daily.precipitation_sum;
    var n     = dates.length;

    var yearsMap = {};
    var gdd10Total = 0;

    for (var i = 0; i < n; i++) {
      if (tmax[i] === null || tmin[i] === null) continue;
      var d   = new Date(dates[i] + 'T12:00:00Z');
      var y   = d.getUTCFullYear();
      var mo  = d.getUTCMonth();
      var doy = _dayOfYear(d);
      var tn  = tmin[i], tx = tmax[i], p = prec[i] || 0;
      var tmMean = (tx + tn) / 2;

      if (!yearsMap[y]) {
        yearsMap[y] = { months: [], lastSpringFrost: 0, firstFallFrost: 366, annualMinTemps: [] };
        for (var mi = 0; mi < 12; mi++) {
          yearsMap[y].months.push({ stx:0, stn:0, sp:0, cnt:0 });
        }
      }
      var yd = yearsMap[y];
      yd.months[mo].stx += tx;
      yd.months[mo].stn += tn;
      yd.months[mo].sp  += p;
      yd.months[mo].cnt += 1;
      yd.annualMinTemps.push(tn);

      // Détection des gelées (Tmin < 0°C)
      if (tn < 0) {
        if (doy <= 181 && doy > yd.lastSpringFrost) yd.lastSpringFrost = doy;
        if (doy > 181  && doy < yd.firstFallFrost)  yd.firstFallFrost  = doy;
      }

      if (tmMean > 10) gdd10Total += (tmMean - 10);
    }

    var years    = Object.keys(yearsMap).map(Number);
    var numYears = years.length || 1;

    // Moyennes mensuelles sur toutes les années
    var monthly = [];
    for (var m2 = 0; m2 < 12; m2++) {
      var stx = 0, stn = 0, sp = 0, cnt = 0;
      for (var yi = 0; yi < years.length; yi++) {
        var mo2 = yearsMap[years[yi]].months[m2];
        if (mo2.cnt > 0) { stx += mo2.stx; stn += mo2.stn; sp += mo2.sp; cnt += mo2.cnt; }
      }
      monthly.push({
        tmean:  cnt > 0 ? Math.round((stx + stn) / cnt / 2 * 10) / 10 : 0,
        tmax:   cnt > 0 ? Math.round(stx / cnt * 10) / 10 : 0,
        tmin:   cnt > 0 ? Math.round(stn / cnt * 10) / 10 : 0,
        precip: Math.round(sp / numYears),
      });
    }

    // Médiane des dates de gelée sur toutes les années
    var lastFrostDOYs = [], firstFrostDOYs = [];
    for (var yi2 = 0; yi2 < years.length; yi2++) {
      var yd2 = yearsMap[years[yi2]];
      if (yd2.lastSpringFrost > 0)  lastFrostDOYs.push(yd2.lastSpringFrost);
      if (yd2.firstFallFrost < 366) firstFrostDOYs.push(yd2.firstFallFrost);
    }
    var lastFrostDOY  = lastFrostDOYs.length  ? Math.round(_median(lastFrostDOYs))  : null;
    var firstFrostDOY = firstFrostDOYs.length ? Math.round(_median(firstFrostDOYs)) : null;
    var growingSeasonDays = lastFrostDOY && firstFrostDOY
      ? Math.max(0, firstFrostDOY - lastFrostDOY)
      : (firstFrostDOY || 365);

    // Température minimale annuelle moyenne (pour USDA)
    var sumAnnualMin = 0;
    for (var yi3 = 0; yi3 < years.length; yi3++) {
      var mins = yearsMap[years[yi3]].annualMinTemps;
      sumAnnualMin += mins.length ? Math.min.apply(null, mins) : 0;
    }
    var avgAnnualMin = Math.round((sumAnnualMin / numYears) * 10) / 10;

    // Totaux annuels
    var annualPrecip = monthly.reduce(function(s, m3) { return s + m3.precip; }, 0);
    var summerDrought = 0;
    for (var mi2 = 4; mi2 <= 8; mi2++) { if (monthly[mi2].precip < 30) summerDrought++; }

    return {
      fetchedAt:           new Date().toISOString(),
      koppen:              _classifyKoppen(monthly),
      hardinessZone:       _hardinessZone(avgAnnualMin),
      lastFrostDOY:        lastFrostDOY,
      firstFrostDOY:       firstFrostDOY,
      growingSeasonDays:   growingSeasonDays,
      gdd10Annual:         Math.round(gdd10Total / numYears),
      avgAnnualRainfall:   annualPrecip,
      summerDroughtMonths: summerDrought,
      avgJulyTemp:         monthly[6].tmean,
      avgJanTemp:          monthly[0].tmean,
      avgAnnualMinTemp:    avgAnnualMin,
      monthly:             monthly,
    };
  }

  // ── API publique ────────────────────────────────────────────
  return {
    koppenLabel: function(code) {
      var lang = typeof getAppState === 'function' ? getAppState('language') : 'fr';
      var map  = KOPPEN_LABELS[lang] || KOPPEN_LABELS.fr;
      return map[code] || code;
    },

    get: function() {
      return typeof getAppState === 'function' ? (getAppState('climate') || null) : null;
    },

    isFresh: function() {
      var c = this.get();
      if (!c || !c.fetchedAt) return false;
      return (Date.now() - new Date(c.fetchedAt).getTime()) < 30 * 24 * 3600 * 1000;
    },

    refresh: function(callback) {
      var loc = typeof getAppState === 'function' ? getAppState('location') : null;
      if (!loc || !loc.lat || !loc.lon) {
        if (callback) callback(null, new Error('no location'));
        return;
      }
      var url = ARCHIVE_URL
        + '?latitude='   + parseFloat(loc.lat).toFixed(4)
        + '&longitude='  + parseFloat(loc.lon).toFixed(4)
        + '&start_date=' + YEAR_START
        + '&end_date='   + YEAR_END
        + '&daily=temperature_2m_max,temperature_2m_min,precipitation_sum'
        + '&timezone=auto';

      fetch(url)
        .then(function(r) {
          if (!r.ok) throw new Error('HTTP ' + r.status);
          return r.json();
        })
        .then(function(data) {
          if (!data.daily || !data.daily.time) throw new Error('bad response');
          var profile = _processData(data.daily);
          // Conserver l'altitude stockée avec la localisation
          var loc2 = typeof getAppState === 'function' ? getAppState('location') : null;
          if (loc2 && loc2.altitude) profile.altitude = loc2.altitude;
          if (typeof updateAppState === 'function') updateAppState('climate', profile);
          if (callback) callback(profile, null);
        })
        .catch(function(err) {
          console.error('ClimateModule.refresh:', err);
          if (callback) callback(null, err);
        });
    },

    renderCard: function() {
      var c   = this.get();
      var lng = typeof getAppState === 'function' ? getAppState('language') : 'fr';
      var self = this;

      if (!c) {
        return '<div style="padding:14px;text-align:center;color:var(--text-light);font-size:0.85rem;">'
          + t('settings_climate_none') + '</div>';
      }

      var rows = '';
      function row(icon, key, value) {
        rows += '<div class="prem-settings-row">'
          + '<div class="prem-settings-row-icon" style="background:var(--brand-50);">' + icon + '</div>'
          + '<div class="prem-settings-row-label">' + t(key) + '</div>'
          + '<div class="prem-settings-row-value" style="font-size:0.8rem;max-width:55%;text-align:right;">' + value + '</div>'
          + '</div>';
      }

      var loc     = typeof getAppState === 'function' ? getAppState('location') : null;
      var altStr  = (c.altitude || (loc && loc.altitude))
        ? Math.round(c.altitude || loc.altitude) + ' m'
        : t('settings_climate_unknown');
      var frostL  = c.lastFrostDOY  ? _doyToStr(c.lastFrostDOY, lng)  : t('settings_climate_none_frost');
      var frostF  = c.firstFrostDOY ? _doyToStr(c.firstFrostDOY, lng) : t('settings_climate_none_frost');
      var season  = c.growingSeasonDays + (lng === 'en' ? ' days' : ' jours');
      var koppenLabel = self.koppenLabel(c.koppen);
      var gddLabel = (function() {
        var g = c.gdd10Annual || 0;
        if (lng === 'en') {
          if (g < 800)  return 'Cool season (' + g + ')';
          if (g < 1500) return 'Moderate (' + g + ')';
          if (g < 2500) return 'Warm season (' + g + ')';
          return 'Hot season (' + g + ')';
        }
        if (g < 800)  return 'Fraîche (' + g + ')';
        if (g < 1500) return 'Modérée (' + g + ')';
        if (g < 2500) return 'Chaude (' + g + ')';
        return 'Très chaude (' + g + ')';
      }());

      row('🏔️', 'settings_climate_altitude',  altStr);
      row('🌡️', 'settings_climate_zone',      koppenLabel);
      row('🛡️', 'settings_climate_hardiness', 'Zone ' + c.hardinessZone);
      row('❄️',       'settings_climate_lastfrost',  frostL);
      row('🍂',       'settings_climate_firstfrost', frostF);
      row('🌱',       'settings_climate_season',     season);
      row('🌧️', 'settings_climate_rain',       c.avgAnnualRainfall + ' mm');
      row('☀️',       'settings_climate_gdd',        gddLabel);

      var updStr = '';
      if (c.fetchedAt) {
        var d = new Date(c.fetchedAt);
        updStr = '<div style="font-size:0.7rem;color:var(--text-light);padding:4px 12px 8px;text-align:right;">'
          + t('settings_climate_updated') + ' '
          + d.toLocaleDateString(lng === 'en' ? 'en-GB' : 'fr-FR')
          + '</div>';
      }

      return rows + updStr;
    },
  };
}());
