// My Garden Side — modules/dashboard.js
// Home screen premium editorial
// Logique métier conservée — rendu accueil uniquement

async function renderDashboard() {
  var el = document.getElementById('pageDashboard');
  document.getElementById('headerTitle').textContent = 'My Garden Side';
  el.innerHTML =
    '<div class="skel-page" style="padding:0;">' +
      // Hero
      '<div class="skel-hero">' +
        '<div class="skel" style="width:42%;height:13px;margin-bottom:16px;border-radius:6px;"></div>' +
        '<div class="skel" style="width:52%;height:46px;margin-bottom:12px;border-radius:10px;"></div>' +
        '<div class="skel" style="width:65%;height:12px;border-radius:6px;"></div>' +
        '<div style="display:flex;gap:8px;margin-top:20px;">' +
          '<div class="skel" style="flex:1;height:44px;border-radius:12px;"></div>' +
          '<div class="skel" style="flex:1;height:44px;border-radius:12px;"></div>' +
          '<div class="skel" style="flex:1;height:44px;border-radius:12px;"></div>' +
        '</div>' +
      '</div>' +
      // Weather card
      '<div class="skel-card">' +
        '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px;">' +
          '<div>' +
            '<div class="skel" style="width:88px;height:11px;border-radius:5px;margin-bottom:10px;"></div>' +
            '<div class="skel" style="width:64px;height:36px;border-radius:8px;margin-bottom:8px;"></div>' +
            '<div class="skel" style="width:130px;height:11px;border-radius:5px;"></div>' +
          '</div>' +
          '<div class="skel" style="width:46px;height:46px;border-radius:14px;flex-shrink:0;"></div>' +
        '</div>' +
        '<div style="display:flex;gap:6px;">' +
          '<div class="skel" style="flex:1;height:58px;border-radius:14px;"></div>' +
          '<div class="skel" style="flex:1;height:58px;border-radius:14px;"></div>' +
          '<div class="skel" style="flex:1;height:58px;border-radius:14px;"></div>' +
          '<div class="skel" style="flex:1;height:58px;border-radius:14px;"></div>' +
          '<div class="skel" style="flex:1;height:58px;border-radius:14px;"></div>' +
        '</div>' +
      '</div>' +
      // Section label
      '<div class="skel" style="width:110px;height:10px;border-radius:5px;margin:18px 0 12px;"></div>' +
      // Bed rows
      '<div class="skel-card" style="height:70px;border-radius:18px;margin-bottom:7px;"></div>' +
      '<div class="skel-card" style="height:70px;border-radius:18px;margin-bottom:7px;opacity:0.7;"></div>' +
    '</div>';

  try {
    var weather = await fetchWeather();
    if (typeof IrrigationModule !== 'undefined' && weather && weather.daily) {
      var _r7 = (weather.daily.precipitation_sum || []).slice(0, 7).reduce(function(s, v) { return s + (v || 0); }, 0);
      IrrigationModule.setForecastRain(_r7);
    }
    var data = calculateDashboardData(weather);

    var hero     = _homeHero(data, weather);
    var weatherB = _homeWeatherBanner(weather);
    var garden   = _homeGardenSection(data);
    var actions  = _homeActionsSection(data.smartActs, data.tasks);
    var irrigation = _homeIrrigationCard(data.irr);
    var insight  = _homeInsightSection(weather);

    el.innerHTML =
      '<div class="mgs-home fade-in">' +
        hero +
        weatherB +
        irrigation +
        actions +
        garden +
        insight +
      '</div>';

  } catch (err) {
    console.error('Erreur renderDashboard:', err);
    el.innerHTML =
      '<div style="margin:20px;padding:18px;background:#fee2e2;color:#991b1b;border-radius:14px;">' +
      '<strong>' + t('dash_error') + '</strong><br>' + escH(err.message || '') +
      '</div>';
  }
}

/* ============================================================
   CALCULS
============================================================ */
function calculateDashboardData(weather) {
  var seasonCrops = getAppState('crops').filter(function(c) {
    return c.season === getAppState('currentSeason');
  });

  var activeCrops = seasonCrops.filter(function(c) {
    return c.status === 'active';
  });

  var totalBeds = getAppState('beds').length;
  var totalCrops = seasonCrops.length;
  var totalSurf = getAppState('beds').reduce(function(s, b) {
    return s + getBedSurface(b);
  }, 0);
  var usedSurf = activeCrops.reduce(function(s, c) {
    return s + getCropSurface(c);
  }, 0);

  var occPct = totalSurf > 0 ? Math.round((usedSurf / totalSurf) * 100) : 0;
  var today = new Date();

  var proche = seasonCrops.filter(function(c) {
    if (!c.dateHarvest || c.status === 'harvested') return false;
    return Math.floor((new Date(c.dateHarvest) - today) / 86400000) <= 7;
  }).length;

  var harvOk = seasonCrops.filter(function(c) {
    return c.status === 'harvested';
  }).length;

  var tasks = (typeof generateTasks === 'function') ? generateTasks(weather).slice(0, 8) : [];
  var smartActs = (typeof getSmartActions === 'function') ? getSmartActions(weather) : [];
  var irr = (typeof IrrigationModule !== 'undefined') ? IrrigationModule.getSummary() : null;

  return {
    totalBeds: totalBeds,
    totalCrops: totalCrops,
    proche: proche,
    harvOk: harvOk,
    occPct: occPct,
    totalSurf: totalSurf,
    tasks: tasks,
    smartActs: smartActs,
    irr: irr,
  };
}

/* ============================================================
   HERO
============================================================ */
function _homeHero(data, weather) {
  var now = new Date();
  var jour = t('day_' + now.getDay());
  var date = now.getDate();
  var moisN = t('month_' + now.getMonth());
  var h = now.getHours();
  var greeting =
    h < 12 ? t('greeting_morning') :
    h < 18 ? t('greeting_afternoon') :
    t('greeting_evening');

  var subtitle = data.totalCrops > 0
    ? data.totalCrops + ' ' + (data.totalCrops > 1 ? t('lbl_crop_s') : t('lbl_crop')) + ' ' + t('lbl_in_progress')
    : t('dash_garden_waiting');

  var dominantVisual = (typeof getGardenDominantVisual === 'function') ? getGardenDominantVisual() : '';
  var season = escH(APP.currentSeason || '');

  return (
    '<section class="mgs-home-hero">' +
      '<div class="mgs-home-hero-media">' +
        (dominantVisual
          ? '<div class="mgs-home-hero-illus" aria-hidden="true">' + dominantVisual + '</div>'
          : '') +
        '<div class="mgs-home-hero-overlay"></div>' +
        '<div class="mgs-home-hero-content">' +
          '<div class="mgs-home-hero-kicker">' + escH(jour + ' ' + date + ' ' + moisN) + (season ? ' · ' + season : '') + '</div>' +
          '<h2 class="mgs-home-hero-title">' + escH(greeting) + '</h2>' +
          '<div class="mgs-home-hero-kpis">' +
            '<div class="mgs-home-hero-kpi"><span class="mgs-home-hero-kpi-val">' + data.totalBeds + '</span><span class="mgs-home-hero-kpi-lbl">' + t('nav_beds') + '</span></div>' +
            '<div class="mgs-home-hero-kpi"><span class="mgs-home-hero-kpi-val">' + data.totalCrops + '</span><span class="mgs-home-hero-kpi-lbl">' + (data.totalCrops > 1 ? t('lbl_crop_s') : t('lbl_crop')) + '</span></div>' +
            '<div class="mgs-home-hero-kpi"><span class="mgs-home-hero-kpi-val">' + data.proche + '</span><span class="mgs-home-hero-kpi-lbl">' + t('stat_ready') + '</span></div>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</section>'
  );
}

function _homeStatCard(value, label) {
  return (
    '<div class="mgs-home-stat">' +
      '<div class="mgs-home-stat-val">' + escH(String(value)) + '</div>' +
      '<div class="mgs-home-stat-lbl">' + escH(label) + '</div>' +
    '</div>'
  );
}

/* ============================================================
   WEATHER BANNER
============================================================ */
function _homeWeatherBanner(weather) {
  if (!weather || !weather.current) {
    return (
      '<section class="mgs-home-panel mgs-home-offline">' +
        '<div class="mgs-home-panel-head">' +
          '<div class="mgs-home-panel-title">' + t('dash_section_weather') + '</div>' +
        '</div>' +
        '<div class="mgs-home-empty">' +
          '<div class="mgs-home-empty-main">' + t('wx_offline') + '</div>' +
          '<div class="mgs-home-empty-sub">' + escH(APP.location.name || '') + '</div>' +
        '</div>' +
      '</section>'
    );
  }

  var c = weather.current;
  var desc = getWeatherDesc(c.weather_code);
  var emoji = getWeatherEmoji(c.weather_code);

  var forecastHTML = '';
  if (weather.daily && weather.daily.time) {
    var days = Math.min(5, weather.daily.time.length);
    for (var i = 0; i < days; i++) {
      forecastHTML +=
        '<div class="mgs-home-weather-day">' +
          '<div class="mgs-home-weather-day-name">' + escH(i === 0 ? t('wx_today_short') : getDayName(weather.daily.time[i])) + '</div>' +
          '<div class="mgs-home-weather-day-icon">' + getWeatherEmoji(weather.daily.weather_code[i]) + '</div>' +
          '<div class="mgs-home-weather-day-temp">' + Math.round(weather.daily.temperature_2m_max[i]) + '°</div>' +
        '</div>';
    }
  }

  return (
    '<section class="mgs-home-weather-card">' +
      '<div class="mgs-home-weather-top">' +
        '<div>' +
          '<div class="mgs-home-weather-place">' + escH(APP.location.name || t('wx_location_fallback')) + '</div>' +
          '<div class="mgs-home-weather-temp">' + Math.round(c.temperature_2m) + '°</div>' +
          '<div class="mgs-home-weather-desc">' + escH(desc) + '</div>' +
        '</div>' +
        '<div class="mgs-home-weather-emoji">' + emoji + '</div>' +
      '</div>' +
      '<div class="mgs-home-weather-meta">' +
        '<span>' + t('wx_humidity') + ' ' + (c.relative_humidity_2m || '--') + '%</span>' +
        '<span>' + (c.wind_speed_10m !== undefined ? Math.round(c.wind_speed_10m) : '--') + ' km/h</span>' +
        '<span>' + (c.precipitation !== undefined ? c.precipitation : '--') + ' mm</span>' +
      '</div>' +
      (forecastHTML ? '<div class="mgs-home-weather-forecast">' + forecastHTML + '</div>' : '') +
    '</section>'
  );
}

/* ============================================================
   IRRIGATION CARD (V4.2)
============================================================ */
function _homeIrrigationCard(irr) {
  if (!irr) return ''; // pas de profil climatique

  var isEn   = typeof getAppState === 'function' && getAppState('language') === 'en';
  var noNeed = !irr.totalLiters;

  var color  = noNeed ? '#16a34a' : (irr.deficitBeds > 2 ? '#dc2626' : '#d97706');
  var icon   = noNeed ? '💧' : '🌿';
  var label  = noNeed
    ? (isEn ? 'No watering needed this week' : 'Pas d\'arrosage nécessaire cette semaine')
    : (isEn
        ? '~' + irr.totalLiters + ' L needed this week (' + irr.deficitBeds + ' bed' + (irr.deficitBeds > 1 ? 's' : '') + ')'
        : '~' + irr.totalLiters + ' L à apporter cette semaine (' + irr.deficitBeds + ' carré' + (irr.deficitBeds > 1 ? 's' : '') + ')');

  return (
    '<section style="margin:0 16px 10px;padding:10px 14px;background:#fff;border-radius:14px;' +
    'box-shadow:0 1px 4px rgba(0,0,0,.07);display:flex;align-items:center;gap:10px;">' +
      '<span style="font-size:1.4rem;flex-shrink:0;">' + icon + '</span>' +
      '<div style="flex:1;min-width:0;">' +
        '<div style="font-size:0.72rem;font-weight:600;color:var(--text-light);text-transform:uppercase;letter-spacing:.05em;">' +
          (isEn ? 'Irrigation' : 'Arrosage') +
        '</div>' +
        '<div style="font-size:0.85rem;font-weight:600;color:' + color + ';margin-top:1px;">' +
          label +
        '</div>' +
      '</div>' +
      '<button onclick="navigate(\'beds\')" style="background:none;border:none;color:var(--brand-600);font-size:0.8rem;cursor:pointer;padding:4px 0;flex-shrink:0;">›</button>' +
    '</section>'
  );
}

/* ============================================================
   GARDEN SECTION
============================================================ */
function _homeGardenSection(data) {
  var beds = APP.beds.slice();

  var header =
    '<div class="mgs-home-section-head">' +
      '<div class="mgs-home-section-title-wrap">' +
        '<span class="mgs-home-section-icon">🌿</span>' +
        '<h3 class="mgs-home-section-title">' + t('nav_beds') + '</h3>' +
      '</div>' +
      '<button class="mgs-home-section-link" onclick="navigate(\'beds\')">' + t('dash_see_all') + '</button>' +
    '</div>';

  if (!beds.length) {
    return (
      '<section class="mgs-home-panel">' +
        header +
        '<div class="mgs-home-empty">' +
          '<div class="mgs-home-empty-main">' + t('dash_garden_empty') + '</div>' +
        '</div>' +
      '</section>'
    );
  }

  beds.sort(function(a, b) {
    return getBedOccupation(b) - getBedOccupation(a);
  });

  var cards = beds.slice(0, 5).map(function(bed) {
    return _homeBedCard(bed);
  }).join('');

  return (
    '<section class="mgs-home-panel">' +
      header +
      '<div class="mgs-home-bed-scroll">' + cards + '</div>' +
    '</section>'
  );
}

function _homeBedCard(bed) {
  var occ = getBedOccupation(bed);
  var surf = getBedSurface(bed);
  var cls = occ >= 90 ? 'optimized' : occ > 70 ? 'warn' : 'ok';

  var bCrops = APP.crops.filter(function(c) {
    return c.bedId === bed.id && c.season === APP.currentSeason && c.status === 'active';
  });

  var firstVeg = '';
  if (bCrops.length > 0) {
    var fv = APP.vegetables[bCrops[0].veggieId];
    if (fv) firstVeg = fv.icon + ' ' + tVeg(fv.name);
  }

  var zoneVisual = (typeof getZoneVisual === 'function') ? getZoneVisual(bed.id) : '';

  var irrNeed = typeof IrrigationModule !== 'undefined' ? IrrigationModule.getBedWaterNeed(bed) : null;
  var irrBadge = (irrNeed && irrNeed.deficit)
    ? '<span style="font-size:0.7rem;font-weight:600;color:#d97706;margin-left:4px;">💧 ' + irrNeed.litersPerWeek + ' L</span>'
    : '';

  return (
    '<article class="mgs-home-bed-card" onclick="navigate(\'beds\');setTimeout(function(){showBedDetail(\'' + bed.id + '\')},50)">' +
      '<div class="mgs-home-bed-media">' +
        (zoneVisual ? '<div class="mgs-home-bed-illus" aria-hidden="true">' + zoneVisual + '</div>' : '') +
        '<div class="mgs-home-bed-overlay"></div>' +
      '</div>' +
      '<div class="mgs-home-bed-body">' +
        '<div class="mgs-home-bed-name">' + escH(bed.name) + irrBadge + '</div>' +
        '<div class="mgs-home-bed-sub">' +
          (firstVeg ? escH(firstVeg) : t('dash_zone_free')) +
        '</div>' +
        '<div class="mgs-home-bed-bottom">' +
          '<div class="mgs-home-bed-progress"><div class="mgs-home-bed-progress-fill ' + cls + '" style="width:' + occ + '%;"></div></div>' +
          '<div class="mgs-home-bed-meta">' + occ + '% · ' + formatSurface(surf) + '</div>' +
        '</div>' +
      '</div>' +
    '</article>'
  );
}

/* ============================================================
   ACTIONS SECTION
============================================================ */
function _homeActionsSection(smartActs, tasks) {
  var header =
    '<div class="mgs-home-section-head">' +
      '<div class="mgs-home-section-title-wrap">' +
        '<span class="mgs-home-section-icon">☀️</span>' +
        '<h3 class="mgs-home-section-title">' + t('dash_section_actions') + '</h3>' +
      '</div>' +
      '<button class="mgs-home-section-link" onclick="navigate(\'today\')">' + t('dash_see_today') + '</button>' +
    '</div>';

  var rows = '';
  var allActs = [];

  if (smartActs && smartActs.length) {
    smartActs.slice(0, 3).forEach(function(a) {
      var id = registerSmartAction({ actionType: a.actionType, payload: a.payload || {} });
      allActs.push({
        id: id,
        nav: false,
        icon: a.icon || '🌱',
        title: a.title || '',
        sub: a.description || ''
      });
    });
  }

  if (tasks && tasks.length) {
    tasks.filter(function(tk) {
      return tk.priority === 'urgent' || tk.priority === 'important';
    }).slice(0, 2).forEach(function(tk) {
      allActs.push({
        id: null,
        nav: true,
        icon: '📌',
        title: tk.text || '',
        sub: tk.category || ''
      });
    });
  }

  if (!allActs.length) {
    rows =
      '<div class="mgs-home-list-card" onclick="navigate(\'today\')">' +
        '<div class="mgs-home-list-icon">🌿</div>' +
        '<div class="mgs-home-list-body">' +
          '<div class="mgs-home-list-title">' + t('act_all_good_title') + '</div>' +
          '<div class="mgs-home-list-sub">' + t('act_all_good_sub') + '</div>' +
        '</div>' +
      '</div>';
  } else {
    rows = allActs.map(function(a) {
      var onClick = a.nav ? 'navigate(\'today\')' : ('executeSmartActionById(\'' + a.id + '\')');
      return (
        '<div class="mgs-home-list-card" onclick="' + onClick + '">' +
          '<div class="mgs-home-list-icon">' + a.icon + '</div>' +
          '<div class="mgs-home-list-body">' +
            '<div class="mgs-home-list-title">' + escH(a.title) + '</div>' +
            '<div class="mgs-home-list-sub">' + escH(a.sub) + '</div>' +
          '</div>' +
          '<div class="mgs-home-list-arrow">›</div>' +
        '</div>'
      );
    }).join('');
  }

  return (
    '<section class="mgs-home-panel">' +
      header +
      '<div class="mgs-home-list">' + rows + '</div>' +
    '</section>'
  );
}

/* ============================================================
   INSIGHTS SECTION — V4.3 Recommandations IA contextualisées
============================================================ */
function _homeInsightSection(weather) {
  var header =
    '<div class="mgs-home-section-head">' +
      '<div class="mgs-home-section-title-wrap">' +
        '<span class="mgs-home-section-icon">🧠</span>' +
        '<h3 class="mgs-home-section-title">' + t('dash_section_conseil') + '</h3>' +
      '</div>' +
      '<button class="mgs-home-section-link" onclick="navigateFromPlus(\'analysis\')">' + t('dash_see_analysis') + '</button>' +
    '</div>';

  // V4.3 : RecommendationsModule en priorité
  var tips = [];
  if (typeof RecommendationsModule !== 'undefined') {
    tips = RecommendationsModule.generate(weather);
  }

  // Fallback : anciens systèmes de conseil
  if (!tips.length) {
    var fallbackText = '', fallbackIcon = '🌿';
    try {
      var actionable = getActionableInsights();
      if (actionable && actionable.length) {
        fallbackText = actionable[0].text || actionable[0].title || '';
        fallbackIcon = actionable[0].icon || '💡';
      }
    } catch (e) {}
    if (!fallbackText) {
      try {
        var recs = getSmartRecommendationsV2(weather);
        if (recs && recs.length) {
          fallbackText = recs[0].text || recs[0].title || '';
          fallbackIcon = recs[0].icon || '🌱';
        }
      } catch (e) {}
    }
    if (!fallbackText) fallbackText = t('conseil_empty');
    return (
      '<section class="mgs-home-panel">' +
        header +
        _homeInsightCard(t('dash_section_conseil'), fallbackText, fallbackIcon) +
      '</section>'
    );
  }

  // Afficher jusqu'à 3 recommandations sous forme de cartes liste
  var rows = tips.slice(0, 3).map(function (tip) {
    var nav = tip.action || 'beds';
    var onClick = 'navigate(\'' + nav + '\')';
    return (
      '<div class="mgs-home-list-card" onclick="' + onClick + '">' +
        '<div class="mgs-home-list-icon">' + (tip.icon || '🌿') + '</div>' +
        '<div class="mgs-home-list-body">' +
          '<div class="mgs-home-list-title">' + escH(tip.title) + '</div>' +
          '<div class="mgs-home-list-sub">' + escH(tip.body) + '</div>' +
        '</div>' +
        '<div class="mgs-home-list-arrow">›</div>' +
      '</div>'
    );
  }).join('');

  return (
    '<section class="mgs-home-panel">' +
      header +
      '<div class="mgs-home-list">' + rows + '</div>' +
    '</section>'
  );
}

function _homeInsightCard(label, text, icon) {
  var visual = (typeof getGardenDominantVisual === 'function') ? getGardenDominantVisual() : '';

  return (
    '<article class="mgs-home-insight-card">' +
      '<div class="mgs-home-insight-content">' +
        '<div class="mgs-home-insight-label">' + escH(label) + '</div>' +
        '<div class="mgs-home-insight-text">' + escH(text) + '</div>' +
      '</div>' +
      '<div class="mgs-home-insight-visual" aria-hidden="true">' + (visual || '') + '</div>' +
    '</article>'
  );
}

/* ============================================================
   HELPERS
============================================================ */
function formatSurface(v) {
  var n = Number(v || 0);
  return n.toFixed(1) + ' m²';
}
