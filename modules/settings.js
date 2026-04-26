// Green Vibes — modules/settings.js
// Réglages, saisons, végétaux, import/export
// ========== SETTINGS ==========
function renderSettings() {
  var el = document.getElementById('pageSettings');
  document.getElementById('headerTitle').textContent = t('nav_settings');
  document.getElementById('fab').style.display = 'none';
  var prof = getAppState('userProfile') || {};
  var seasonBadges = '';
  var seasons = getAppState('seasons') || [];
  var currentSeason = getAppState('currentSeason');
  for (var i = 0; i < seasons.length; i++) {
    var s = seasons[i];
    seasonBadges += '<span class="badge ' + (s === currentSeason ? 'badge-green' : 'badge-gray') + '" style="margin:2px;cursor:pointer;" onclick="switchSeason(\'' + s + '\')">' + s + '</span>';
  }
  var avatarChar = prof.name ? escH(prof.name[0].toUpperCase()) : '\uD83C\uDF31';
  var onbClick = '_onbStep=1;_onbData={name:\'' + escH(prof.name||'') + '\',level:\'' + (prof.level||'') + '\',spaceType:\'' + (prof.spaceType||'') + '\',goals:[]};renderOnboarding()';

  el.innerHTML = '<div class="fade-in">' +

    // --- Hero profil premium ---
    '<div class="prem-settings-profile">' +
      '<div class="prem-settings-avatar">' + avatarChar + '</div>' +
      '<div class="prem-settings-profile-info">' +
        '<div class="prem-settings-profile-name">' + escH(prof.name || t('settings_my_garden')) + '</div>' +
        '<div class="prem-settings-profile-level">' + (prof.level ? t('level_' + prof.level) : 'D\u00e9butant') + (prof.spaceType ? ' \u00B7 ' + escH(prof.spaceType) : '') + '</div>' +
        (prof.goals && prof.goals.length ? '<div class="prem-settings-profile-goals">' + prof.goals.slice(0, 2).join(' \u00B7 ') + '</div>' : '') +
      '</div>' +
      '<button class="prem-settings-edit" onclick="' + onbClick + '">' + t('settings_edit') + '</button>' +
    '</div>' +

    // --- App ---
    '<div class="section-title">\u2699\uFE0F ' + t('settings_app') + '</div>' +
    '<div class="prem-settings-group">' +
      '<div class="prem-settings-row">' +
        '<div class="prem-settings-row-icon" style="background:#eef4ff;">\uD83C\uDF0D</div>' +
        '<div class="prem-settings-row-label">' + t('settings_language') + '</div>' +
        '<select class="form-select" style="max-width:130px;" onchange="changeLanguage(this.value)">' +
        '<option value="fr"' + (getAppState('language') === 'fr' ? ' selected' : '') + '>\uD83C\uDDEB\uD83C\uDDF7 Fran\u00e7ais</option>' +
        '<option value="en"' + (getAppState('language') === 'en' ? ' selected' : '') + '>\uD83C\uDDEC\uD83C\uDDE7 English</option>' +
        '</select>' +
      '</div>' +
    '</div>' +

    // --- Localisation ---
    '<div class="section-title">\uD83D\uDCCD ' + t('settings_location') + '</div>' +
    '<div class="prem-settings-group">' +
      '<div class="prem-settings-row">' +
        '<div class="prem-settings-row-icon" style="background:var(--brand-100);">\uD83D\uDCCD</div>' +
        '<div class="prem-settings-row-label">' + t('settings_current_city') + '</div>' +
        '<div class="prem-settings-row-value">' + escH((getAppState('location') || {}).name || 'Seysses') + '</div>' +
      '</div>' +
      '<div class="prem-settings-row">' +
        '<div class="prem-settings-row-icon" style="background:var(--brand-50);">\uD83C\uDF10</div>' +
        '<div class="prem-settings-row-label">' + t('settings_coordinates') + '</div>' +
        '<div class="prem-settings-row-value">' + (getAppState('location') || {}).lat + ', ' + (getAppState('location') || {}).lon + '</div>' +
      '</div>' +
    '</div>' +
    '<div class="prem-settings-btn-group">' +
      '<button class="btn btn-secondary" style="touch-action:manipulation;" onclick="openLocationSearch()">' + t('settings_search_city') + '</button>' +
      '<button id="geoBtn" class="btn btn-secondary" style="touch-action:manipulation;" onclick="useGeolocation()">' + t('settings_my_position') + '</button>' +
      '<button class="btn btn-secondary" style="touch-action:manipulation;" onclick="resetLocation()">' + t('settings_reset_location') + '</button>' +
    '</div>' +
    '<div id="geoStatus" style="margin-top:8px;font-size:0.82rem;text-align:center;min-height:20px;"></div>' +

    // --- Profil climatique ---
    '<div class="section-title">🌡️ ' + t('settings_climate') + '</div>' +
    '<div class="prem-settings-group">' +
      ClimateModule.renderCard() +
    '</div>' +
    '<div class="prem-settings-btn-group">' +
      '<button class="btn btn-secondary" style="touch-action:manipulation;" onclick="_refreshClimate()">' + t('settings_climate_refresh') + '</button>' +
    '</div>' +
    '<div id="climateStatus" style="margin-top:4px;margin-bottom:4px;font-size:0.82rem;text-align:center;min-height:18px;"></div>' +

    // --- Saisons ---
    '<div class="section-title">' + t('settings_seasons_title') + '</div>' +
    '<div class="prem-settings-group">' +
      '<div class="prem-settings-row">' +
        '<div class="prem-settings-row-icon" style="background:var(--brand-100);">\uD83C\uDF31</div>' +
        '<div class="prem-settings-row-label">' + t('settings_active_season') + '</div>' +
        '<div class="prem-settings-row-value">' + escH(currentSeason) + '</div>' +
      '</div>' +
      '<div class="prem-settings-row">' +
        '<div class="prem-settings-row-icon" style="background:var(--brand-50);">\uD83D\uDDC2\uFE0F</div>' +
        '<div class="prem-settings-row-label">' + t('settings_all_seasons') + '</div>' +
        '<div style="display:flex;flex-wrap:wrap;gap:4px;">' + seasonBadges + '</div>' +
      '</div>' +
    '</div>' +
    '<button class="btn btn-secondary btn-block" style="margin-top:8px;" onclick="createNewSeason()">' + t('settings_new_season_btn') + '</button>' +

    // --- Données ---
    '<div class="section-title">\uD83D\uDCBE ' + t('settings_data') + '</div>' +
    '<div class="prem-settings-group">' +
      '<div class="prem-settings-row prem-settings-row-action" onclick="exportAppData()">' +
        '<div class="prem-settings-row-icon" style="background:var(--blue-light);">\uD83D\uDCE4</div>' +
        '<div class="prem-settings-row-label">' + t('export_full') + '</div>' +
        '<div class="prem-settings-row-chevron">\u203A</div>' +
      '</div>' +
      '<div class="prem-settings-row prem-settings-row-action" onclick="exportData()">' +
        '<div class="prem-settings-row-icon" style="background:var(--brand-50);">\uD83D\uDCE4</div>' +
        '<div class="prem-settings-row-label">' + t('export_light') + '</div>' +
        '<div class="prem-settings-row-chevron">\u203A</div>' +
      '</div>' +
      '<div class="prem-settings-row prem-settings-row-action" onclick="document.getElementById(\'importFile\').click()">' +
        '<div class="prem-settings-row-icon" style="background:var(--yellow-light);">\uD83D\uDCE5</div>' +
        '<div class="prem-settings-row-label">' + t('import_btn') + '</div>' +
        '<div class="prem-settings-row-chevron">\u203A</div>' +
      '</div>' +
    '</div>' +
    '<input type="file" id="importFile" accept=".json" style="display:none;" onchange="importData(event)">' +
    '<button class="btn btn-danger btn-block" style="margin-top:8px;" onclick="clearAllData()">\uD83D\uDDD1\uFE0F ' + t('reset_btn') + '</button>' +

  '</div>';
}
var _veggieRefFilter = 'all';
var _veggieRefSearch = '';

function getVeggieFavorites() {
  var st = getAppState('settings') || {};
  return st.veggieFavorites || [];
}
function isVeggieFavorite(veggieId) {
  return getVeggieFavorites().indexOf(veggieId) >= 0;
}
function toggleVeggieFavorite(veggieId) {
  var st = getAppState('settings') || {};
  var favs = (st.veggieFavorites || []).slice();
  var idx = favs.indexOf(veggieId);
  if (idx >= 0) { favs.splice(idx, 1); } else { favs.push(veggieId); }
  st.veggieFavorites = favs;
  updateAppState('settings', st);
  // Mettre à jour le bouton étoile dans la liste sans re-rendre tout
  var btn = document.getElementById('fav-btn-' + veggieId);
  if (btn) btn.textContent = favs.indexOf(veggieId) >= 0 ? '\u2B50' : '\u2606';
  // Si on est dans la fiche légume, mettre à jour le bouton étoile dans la fiche
  var ficheBtn = document.getElementById('fav-fiche-btn-' + veggieId);
  if (ficheBtn) ficheBtn.textContent = favs.indexOf(veggieId) >= 0 ? '\u2B50' : '\u2606';
}

function renderVeggieRefSection(totalCount) {
  var currentMonth = new Date().getMonth() + 1;
  // Stats
  var families = {};
  var inSeason = 0;
  var keys = Object.keys(APP.vegetables);
  for (var i = 0; i < keys.length; i++) {
    var v = APP.vegetables[keys[i]];
    families[v.family] = true;
    var cal = getPlantingCalendarForVeggie(v);
    if (cal && cal.plantMonths && cal.plantMonths.indexOf(currentMonth) >= 0) inSeason++;
  }
  var familyCount = Object.keys(families).length;

  var filters = [
    { key: 'all',      label: t('settings_filter_all') },
    { key: 'fav',      label: t('settings_filter_fav') },
    { key: 'easy',     label: t('settings_filter_easy') },
    { key: 'summer',   label: t('settings_filter_summer') },
    { key: 'winter',   label: t('settings_filter_winter') },
    { key: 'low-water',label: t('settings_filter_dry') },
    { key: 'yield',    label: t('settings_filter_yield') }
  ];

  var filterHtml = '<div class="ref-filter-bar">';
  for (var fi = 0; fi < filters.length; fi++) {
    var f = filters[fi];
    var active = _veggieRefFilter === f.key ? ' ref-filter-active' : '';
    filterHtml += '<button class="ref-filter-btn' + active + '" onclick="setVeggieRefFilter(\'' + f.key + '\')">' + f.label + '</button>';
  }
  filterHtml += '</div>';

  var html =
    '<div class="ref-stats-bar">' +
      '<div class="ref-stat"><div class="ref-stat-val">' + totalCount + '</div><div class="ref-stat-lbl">' + t('settings_lbl_vegetables') + '</div></div>' +
      '<div class="ref-stat"><div class="ref-stat-val">' + familyCount + '</div><div class="ref-stat-lbl">' + t('settings_lbl_families') + '</div></div>' +
      '<div class="ref-stat"><div class="ref-stat-val">' + inSeason + '</div><div class="ref-stat-lbl">' + t('settings_lbl_in_season') + '</div></div>' +
    '</div>' +
    '<div class="ref-search-bar">' +
      '<span class="ref-search-icon">\uD83D\uDD0D</span>' +
      '<input class="ref-search-input" type="text" placeholder="' + t('settings_veggie_placeholder') + '" ' +
        'value="' + escH(_veggieRefSearch) + '" ' +
        'oninput="_veggieRefSearch=this.value;document.getElementById(\'veggieRefList\').innerHTML=renderVeggieRefList()">' +
    '</div>' +
    filterHtml +
    '<div class="prem-settings-group" id="veggieRefList" style="padding:4px 0;">' + renderVeggieRefList() + '</div>';
  return html;
}

function setVeggieRefFilter(f) {
  _veggieRefFilter = f;
  var el = document.getElementById('veggieRefList');
  if (el) el.innerHTML = renderVeggieRefList();
  // Mettre a jour l'apparence des boutons
  var btns = document.querySelectorAll('.ref-filter-btn');
  var filters = ['all','fav','easy','summer','winter','low-water','yield'];
  for (var i = 0; i < btns.length; i++) {
    if (filters[i] === f) {
      btns[i].classList.add('ref-filter-active');
    } else {
      btns[i].classList.remove('ref-filter-active');
    }
  }
}

function renderVeggieRefList() {
  var html = '';
  var search = (_veggieRefSearch || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim();
  var currentMonth = new Date().getMonth() + 1;
  var keys = Object.keys(APP.vegetables);
  var filtered = [];

  for (var i = 0; i < keys.length; i++) {
    var id = keys[i], v = APP.vegetables[id];
    if (!v) continue;

    // Filtre recherche
    if (search) {
      var vNorm = normalizeVeggieName(v.name);
      var fNorm = (v.family || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
      if (vNorm.indexOf(search) < 0 && fNorm.indexOf(search) < 0) continue;
    }

    // Filtre catégorie
    if (_veggieRefFilter === 'fav' && !isVeggieFavorite(id)) continue;
    if (_veggieRefFilter === 'easy' && v.difficulty !== 1) continue;
    if (_veggieRefFilter === 'low-water' && (!v.water || v.water > 3)) continue;
    if (_veggieRefFilter === 'yield' && (v.yieldPerM2 || 0) < 5) continue;
    if (_veggieRefFilter === 'summer') {
      var calS = getPlantingCalendarForVeggie(v);
      if (!calS || !calS.plantMonths) continue;
      var hasSummer = calS.plantMonths.indexOf(5) >= 0 || calS.plantMonths.indexOf(6) >= 0 || calS.plantMonths.indexOf(7) >= 0;
      if (!hasSummer) continue;
    }
    if (_veggieRefFilter === 'winter') {
      var calW = getPlantingCalendarForVeggie(v);
      if (!calW || !calW.plantMonths) continue;
      var hasWinter = calW.plantMonths.indexOf(10) >= 0 || calW.plantMonths.indexOf(11) >= 0 || calW.plantMonths.indexOf(12) >= 0;
      if (!hasWinter) continue;
    }

    filtered.push({ id: id, v: v });
  }

  // Trier alphabétiquement
  filtered.sort(function(a, b) { return a.v.name.localeCompare(b.v.name, 'fr'); });

  if (filtered.length === 0) {
    var emptyMsg = _veggieRefFilter === 'fav' ? t('ref_no_fav') : t('settings_veggie_none');
    return '<div style="padding:16px;text-align:center;color:var(--text-light);font-size:0.85rem;">' + emptyMsg + '</div>';
  }

  for (var j = 0; j < filtered.length; j++) {
    var item = filtered[j];
    var v2 = item.v;
    var isFav = isVeggieFavorite(item.id);
    var diffStars = v2.difficulty === 1 ? '\u2605\u2606\u2606' : v2.difficulty === 2 ? '\u2605\u2605\u2606' : v2.difficulty === 3 ? '\u2605\u2605\u2605' : '';
    var cal2 = getPlantingCalendarForVeggie(v2);
    var inSeason2 = cal2 && cal2.plantMonths && cal2.plantMonths.indexOf(currentMonth) >= 0;
    var seasonBadge = inSeason2 ? '<span class="ref-season-badge">' + t('settings_in_season_badge') + '</span>' : '';
    html += '<div class="prem-settings-row prem-settings-row-action" onclick="ouvrirFicheVeggie(\'' + item.id + '\')">' +
      '<div class="prem-settings-row-icon" style="background:var(--brand-50);font-size:1.2rem;">' + vIcon(v2, item.id, 32) + '</div>' +
      '<div style="flex:1;min-width:0;">' +
        '<div class="veggie-ref-name">' + escH(tVeg(v2.name)) + ' ' + seasonBadge + '</div>' +
        '<div class="veggie-ref-details">' + escH(t('family_' + v2.family)) + ' \u00B7 ' + v2.yieldPerM2 + 'kg/m\u00B2 \u00B7 ' + diffStars + '</div>' +
      '</div>' +
      '<div class="btn-group" onclick="event.stopPropagation()" style="gap:5px;">' +
        '<button id="fav-btn-' + item.id + '" class="btn btn-sm btn-secondary" onclick="toggleVeggieFavorite(\'' + item.id + '\')" title="' + t('settings_filter_fav') + '" style="font-size:1rem;padding:2px 7px;">' + (isFav ? '\u2B50' : '\u2606') + '</button>' +
        '<button class="btn btn-sm btn-secondary" onclick="openVeggieModal(\'' + item.id + '\')">\u270F\uFE0F</button>' +
        '<button class="btn btn-sm btn-danger" onclick="deleteVeggie(\'' + item.id + '\')">\uD83D\uDDD1\uFE0F</button>' +
      '</div>' +
    '</div>';
  }
  return html;
}
// ========== LOCATION ==========
// Stocke les villes trouvées pour éviter l'injection dans les onclick
var _citySearchResults = [];

function openLocationSearch() {
  openModal(
    '<div class="modal-header"><div class="modal-title">' + t('settings_search_city_title') + '</div><button class="modal-close" onclick="closeModal()">&times;</button></div>' +
    '<div class="search-box"><span>🔍</span><input type="text" id="citySearch" placeholder="' + t('settings_search_city_input') + '" oninput="searchCity()" autocomplete="off"></div>' +
    '<div class="search-results" id="cityResults"></div>'
  );
}

var searchTimeout = null;
function searchCity() {
  var el = document.getElementById('citySearch');
  var resultsEl = document.getElementById('cityResults');
  if (!el || !resultsEl) return;
  var query = el.value.trim();
  if (query.length < 2) { resultsEl.innerHTML = ''; return; }
  if (searchTimeout) clearTimeout(searchTimeout);
  resultsEl.innerHTML = '<div style="padding:12px;color:var(--text-light);text-align:center;">🔍 Recherche...</div>';
  searchTimeout = setTimeout(function() {
    fetch('https://geocoding-api.open-meteo.com/v1/search?name=' + encodeURIComponent(query) + '&count=5&language=fr')
      .then(function(resp) {
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        return resp.json();
      })
      .then(function(data) {
        var results = data.results || [];
        _citySearchResults = results;
        if (!document.getElementById('cityResults')) return;
        if (results.length === 0) {
          document.getElementById('cityResults').innerHTML = '<div style="padding:12px;color:var(--text-light);">' + t('settings_no_result') + '</div>';
          return;
        }
        var html = '';
        for (var i = 0; i < results.length; i++) {
          var r = results[i];
          html += '<div class="search-result-item" onclick="selectCity(' + i + ')">' +
            '📍 ' + escH(r.name) + (r.admin1 ? ', ' + escH(r.admin1) : '') + ' (' + escH(r.country || '') + ')</div>';
        }
        document.getElementById('cityResults').innerHTML = html;
      })
      .catch(function() {
        if (document.getElementById('cityResults')) {
          document.getElementById('cityResults').innerHTML = '<div style="padding:12px;color:var(--red);">' + t('settings_search_err') + '</div>';
        }
      });
  }, 400);
}

function selectCity(index) {
  var r = _citySearchResults[index];
  if (!r) return;
  APP.location = { lat: r.latitude, lon: r.longitude, name: r.name, altitude: r.elevation || null };
  APP.weather = null;
  APP.weatherLastFetch = null;
  saveData();
  closeModal();
  renderSettings();
  _geoSetStatus(t('settings_climate_calculating'), 'var(--text-light)');
  ClimateModule.refresh(function(profile, err) {
    if (err) { _geoSetStatus(t('settings_climate_error'), 'var(--red)'); }
    else      { renderSettings(); }
  });
}

function _geoSetStatus(msg, color) {
  var el = document.getElementById('geoStatus');
  if (el) { el.textContent = msg; el.style.color = color || 'var(--text-light)'; }
}

function useGeolocation() {
  var btn = document.getElementById('geoBtn');

  if (!navigator.geolocation) {
    _geoSetStatus('Géolocalisation non supportée sur cet appareil.', 'var(--red)');
    return;
  }

  if (btn) { btn.textContent = '⏳ Localisation...'; btn.disabled = true; }
  _geoSetStatus('Recherche de votre position...', 'var(--text-light)');

  navigator.geolocation.getCurrentPosition(
    function(pos) {
      var lat = parseFloat(pos.coords.latitude.toFixed(4));
      var lon = parseFloat(pos.coords.longitude.toFixed(4));
      var alt = pos.coords.altitude ? Math.round(pos.coords.altitude) : null;
      APP.location = { lat: lat, lon: lon, name: t('settings_my_location'), altitude: alt };
      APP.weather = null;
      APP.weatherLastFetch = null;
      saveData();
      renderSettings();
      _geoSetStatus(t('settings_climate_calculating'), 'var(--text-light)');
      ClimateModule.refresh(function(profile, err) {
        if (err) { _geoSetStatus(t('settings_climate_error'), 'var(--red)'); }
        else      { renderSettings(); }
      });
    },
    function(err) {
      if (btn) { btn.textContent = t('settings_my_position'); btn.disabled = false; }
      if (err.code === 1) {
        _geoSetStatus('Permission refusée. Autorisez la localisation dans les paramètres du navigateur.', 'var(--red)');
      } else if (err.code === 2) {
        _geoSetStatus('Position indisponible. Vérifiez que le GPS est activé.', 'var(--red)');
      } else {
        _geoSetStatus('Délai dépassé. Utilisez la recherche manuelle.', 'var(--red)');
      }
    },
    { timeout: 12000, maximumAge: 60000, enableHighAccuracy: false }
  );
}
function resetLocation() {
  APP.location = { lat: 43.4984, lon: 1.3139, name: 'Seysses' };
  APP.weather = null;
  APP.weatherLastFetch = null;
  saveData();
  renderSettings();
}
function _setClimateStatus(msg, color) {
  var el = document.getElementById('climateStatus');
  if (el) { el.textContent = msg; el.style.color = color || 'var(--text-light)'; }
}
function _refreshClimate() {
  _setClimateStatus(t('settings_climate_calculating'));
  ClimateModule.refresh(function(profile, err) {
    if (err) { _setClimateStatus(t('settings_climate_error'), 'var(--red)'); }
    else      { renderSettings(); }
  });
}
// ========== VEGGIE MANAGEMENT ==========
function openVeggieModal(editId) {
  var v = editId ? APP.vegetables[editId] : null;
  var title = v ? t('settings_veggie_modal_edit') : t('settings_veggie_modal_new');
  var families = ['Solanacees','Cucurbitacees','Fabacees','Brassicacees','Apiacees','Asteracees','Liliacees','Rosacees','Lamiacees','Chenopodiacees','Autre'];
  var famOptions = '';
  for (var i = 0; i < families.length; i++) {
    famOptions += '<option' + (v && v.family === families[i] ? ' selected' : '') + '>' + families[i] + '</option>';
  }
  openModal(
    '<div class="modal-header"><div class="modal-title">' + title + '</div><button class="modal-close" onclick="closeModal()">&times;</button></div>' +
    '<div class="form-row">' +
    '<div class="form-group"><label class="form-label">' + t('settings_veggie_lbl_name') + '</label><input class="form-input" id="vegName" value="' + (v ? escH(v.name) : '') + '"></div>' +
    '<div class="form-group"><label class="form-label">' + t('settings_veggie_lbl_icon') + '</label><input class="form-input" id="vegIcon" value="' + (v ? v.icon : '🌱') + '" style="width:60px;text-align:center;font-size:1.3rem;"></div></div>' +
    '<div class="form-group"><label class="form-label">' + t('settings_veggie_lbl_family') + '</label><select class="form-select" id="vegFamily">' + famOptions + '</select></div>' +
    '<div class="form-row">' +
    '<div class="form-group"><label class="form-label">' + t('settings_veggie_lbl_yield') + '</label><input type="number" step="0.1" class="form-input" id="vegYield" value="' + (v ? v.yieldPerM2 : '') + '"></div>' +
    '<div class="form-group"><label class="form-label">' + t('settings_veggie_lbl_days') + '</label><input type="number" class="form-input" id="vegDays" value="' + (v ? v.daysToHarvest : '') + '"></div></div>' +
    '<div class="form-group"><label class="form-label">' + t('settings_veggie_lbl_space') + '</label><input type="number" step="0.01" class="form-input" id="vegSpace" value="' + (v ? v.spacePerPlant : '') + '"></div>' +
    '<div class="form-group"><label class="form-label">' + t('settings_veggie_lbl_sensitivity') + '</label></div>' +
    '<div class="form-row">' +
    '<div class="form-group"><label class="form-label">' + t('settings_veggie_lbl_heat') + '</label><input type="number" min="1" max="10" class="form-input" id="vegSenHot" value="' + (v ? v.sensitivity.hot : 5) + '"></div>' +
    '<div class="form-group"><label class="form-label">' + t('settings_veggie_lbl_rain') + '</label><input type="number" min="1" max="10" class="form-input" id="vegSenRain" value="' + (v ? v.sensitivity.rain : 5) + '"></div></div>' +
    '<div class="form-row">' +
    '<div class="form-group"><label class="form-label">' + t('settings_veggie_lbl_cold') + '</label><input type="number" min="1" max="10" class="form-input" id="vegSenCold" value="' + (v ? v.sensitivity.cold : 5) + '"></div>' +
    '<div class="form-group"><label class="form-label">' + t('settings_veggie_lbl_wind') + '</label><input type="number" min="1" max="10" class="form-input" id="vegSenWind" value="' + (v ? v.sensitivity.wind : 5) + '"></div></div>' +
    '<div class="modal-actions">' +
    '<button class="btn btn-secondary" onclick="closeModal()">' + t('btn_cancel') + '</button>' +
    '<button class="btn btn-primary" onclick="saveVeggie(\'' + (editId || '') + '\')">' + (v ? t('btn_edit_label') : t('btn_add_label')) + '</button></div>'
  );
}
function saveVeggie(editId) {
  var name = document.getElementById('vegName').value.trim();
  var icon = document.getElementById('vegIcon').value.trim() || '🌱';
  var family = document.getElementById('vegFamily').value;
  var yieldPerM2 = parseFloat(document.getElementById('vegYield').value) || 0;
  var daysToHarvest = parseInt(document.getElementById('vegDays').value) || 60;
  var spacePerPlant = parseFloat(document.getElementById('vegSpace').value) || 0.1;
  var sensitivity = {
    hot: parseInt(document.getElementById('vegSenHot').value) || 5,
    rain: parseInt(document.getElementById('vegSenRain').value) || 5,
    cold: parseInt(document.getElementById('vegSenCold').value) || 5,
    wind: parseInt(document.getElementById('vegSenWind').value) || 5
  };
  if (!name) { alert(t('settings_veggie_err_name')); return; }
  var id = editId || genId();
  APP.vegetables[id] = { name: name, icon: icon, family: family, yieldPerM2: yieldPerM2, daysToHarvest: daysToHarvest, spacePerPlant: spacePerPlant, sensitivity: sensitivity };
  saveData();
  closeModal();
  renderPage(currentPage);
}
function deleteVeggie(id) {
  var v = APP.vegetables[id];
  if (!v) return;

  var used = APP.crops.some(function(c) {
    return c.veggieId === id;
  });

  if (used) {
    alert(t('settings_veggie_err_used'));
    return;
  }

  if (!confirm(t('settings_veggie_confirm_delete').replace('{name}', v.name))) return;

  delete APP.vegetables[id];
  saveData();
  renderPage(currentPage);
}
// ========== SEASONS ==========
function createNewSeason() {
  var nextYear = (parseInt(getAppState('currentSeason')) + 1).toString();
  var year = prompt(t('settings_new_season_prompt').replace('{year}', nextYear), nextYear);
  if (!year) return;
  year = year.trim();
  if (getAppState('seasons').indexOf(year) >= 0) { alert(t('settings_new_season_exists')); return; }
  APP.seasons.push(year);
  APP.currentSeason = year;
  saveData();
  renderSettings();
  document.getElementById('headerSeason').textContent = year;
}
function switchSeason(season) {
  APP.currentSeason = season;
  saveData();
  document.getElementById('headerSeason').textContent = season;
  renderSettings();
}
// ========== IMPORT/EXPORT ==========
function exportData() {
  var json = JSON.stringify(APP, null, 2);
  var blob = new Blob([json], { type: 'application/json' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'my-garden-side-' + APP.currentSeason + '-' + new Date().toISOString().split('T')[0] + '.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
function normalizeImportedData(data) {
  var safe = {
    vegetables: {},
    beds: [],
    crops: [],
    seasons: Array.isArray(data.seasons) && data.seasons.length ? data.seasons : ['2026'],
    currentSeason: data.currentSeason || '2026',
    location: data.location && typeof data.location.lat === 'number' && typeof data.location.lon === 'number'
      ? data.location
      : { lat: 43.4984, lon: 1.3139, name: 'Seysses' },
    weather: null,
    weatherLastFetch: null,
    climate: data.climate || null,
    completedTasks: Array.isArray(data.completedTasks) ? data.completedTasks : [],
    settings: data.settings || { theme: 'default' }
  };

  var vegKeys = Object.keys(data.vegetables || {});
  for (var i = 0; i < vegKeys.length; i++) {
    var id = vegKeys[i];
    var v = data.vegetables[id];
    if (!v || !v.name) continue;

    safe.vegetables[id] = {
      name: v.name,
      icon: v.icon || '🌱',
      family: v.family || 'Autre',
      yieldPerM2: typeof v.yieldPerM2 === 'number' ? v.yieldPerM2 : 0,
      daysToHarvest: typeof v.daysToHarvest === 'number' ? v.daysToHarvest : 60,
      spacePerPlant: typeof v.spacePerPlant === 'number' ? v.spacePerPlant : 0.1,
      sensitivity: {
        hot: v.sensitivity && typeof v.sensitivity.hot === 'number' ? v.sensitivity.hot : 5,
        rain: v.sensitivity && typeof v.sensitivity.rain === 'number' ? v.sensitivity.rain : 5,
        cold: v.sensitivity && typeof v.sensitivity.cold === 'number' ? v.sensitivity.cold : 5,
        wind: v.sensitivity && typeof v.sensitivity.wind === 'number' ? v.sensitivity.wind : 5
      }
    };
  }

  safe.beds = (data.beds || []).filter(function(b) {
    return b && b.id && b.name && typeof b.length === 'number' && typeof b.width === 'number';
  });

  safe.crops = (data.crops || []).filter(function(c) {
    return c && c.id && c.veggieId && safe.vegetables[c.veggieId];
  }).map(function(c) {
    return {
      id: c.id,
      veggieId: c.veggieId,
      bedId: c.bedId || '',
      season: c.season || safe.currentSeason,
      mode: c.mode === 'surface' ? 'surface' : 'plant',
      qty: typeof c.qty === 'number' ? c.qty : 1,
      spacePer: typeof c.spacePer === 'number' ? c.spacePer : 0,
      datePlant: c.datePlant || '',
      dateHarvest: c.dateHarvest || '',
      yieldReal: typeof c.yieldReal === 'number' ? c.yieldReal : null,
      notes: c.notes || '',
      startType: c.startType === 'seed' ? 'seed' : 'plant',
      status: c.status || 'planned'
    };
  });

  if (safe.seasons.indexOf(safe.currentSeason) < 0) {
    safe.currentSeason = safe.seasons[0];
  }

  return safe;
}

function importData(event) {
  var file = event.target.files[0];
  if (!file) return;

  var reader = new FileReader();

  reader.onload = function(e) {
    try {
      var data = JSON.parse(e.target.result);

      if (
        data &&
        typeof data === 'object' &&
        data.vegetables && typeof data.vegetables === 'object' &&
        Array.isArray(data.beds) &&
        Array.isArray(data.crops)
      ) {
        APP = normalizeImportedData(data);

        refreshCropStatuses();
        saveData();
        alert(t('settings_import_ok'));
        navigate('settings');
      } else {
        alert('Fichier invalide. Structure incorrecte.');
      }
    } catch (err) {
      alert('Erreur de lecture du fichier.');
    }
  };

  reader.readAsText(file);
  event.target.value = '';
}
function clearAllData() {
  if (!confirm(t('settings_clear_confirm1'))) return;
  if (!confirm(t('settings_clear_confirm2'))) return;
  localStorage.removeItem('gvp_data');
  APP = {
    vegetables: JSON.parse(JSON.stringify(DEFAULT_VEGETABLES)),
    beds: [], crops: [], seasons: ['2026'], currentSeason: '2026',
    location: { lat: 43.4984, lon: 1.3139, name: 'Seysses' },
    weather: null, weatherLastFetch: null, climate: null, completedTasks: [],
    settings: { theme: 'default' }
  };
  saveData();
  navigate('dashboard');
}
// ========== VÉGGIE RÉFÉRENTIEL PAGE ==========
function renderVeggieRef() {
  var el = document.getElementById('pageVeggieref');
  document.getElementById('headerTitle').textContent = t('nav_veggieref');
  document.getElementById('fab').style.display = 'none';
  var veggieCount = Object.keys(getAppState('vegetables')).length;
  el.innerHTML = '<div class="fade-in">' +
    '<button class="btn btn-primary btn-block" style="margin-bottom:12px;" onclick="openVeggieModal()">' + t('settings_add_veggie') + '</button>' +
    renderVeggieRefSection(veggieCount) +
  '</div>';
}
// Variables calendrier — déclarées dans calendar.js (source canonique)
