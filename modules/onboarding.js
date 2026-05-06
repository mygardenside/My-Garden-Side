// Green Vibes — modules/onboarding.js
// Onboarding premier lancement
// V20 — ONBOARDING PREMIER LANCEMENT
// ============================================================
var _onbStep = 1;
var _onbData = { name:'', level:'', spaceType:'', goals:[] };

function shouldShowOnboarding() {
  return !APP.userProfile || !APP.userProfile.onboardingDone;
}
function renderOnboarding() {
  var ex = document.getElementById('onbOverlay');
  if (ex) ex.remove();
  var ov = document.createElement('div');
  ov.id = 'onbOverlay'; ov.className = 'onb-overlay';
  ov.innerHTML = _buildOnbStep(_onbStep);
  document.body.appendChild(ov);
}
function _buildOnbStep(step) {
  var dots = '';
  for (var i = 1; i <= 4; i++) dots += '<div class="onb-dot' + (i===step?' active':'') + '"></div>';
  var body = '';
  if (step === 1) {
    body = '<div class="onb-title">' + t('onb_step1_title') + '</div>' +
      '<div class="onb-sub">' + t('onb_step1_sub') + '</div>' +
      '<input type="text" class="form-input" id="onbName" placeholder="' + t('onb_firstname_ph') + '" value="' + escH(_onbData.name) + '" style="margin-bottom:14px;">' +
      '<div class="onb-sub">' + t('onb_skill_label') + '</div>' +
      '<div class="onb-grid">' +
        _onbOpt('level','debutant',     '\uD83C\uDF31', t('level_debutant')) +
        _onbOpt('level','intermediaire','\uD83C\uDF3F', t('level_intermediaire')) +
        _onbOpt('level','avance',       '\uD83C\uDF3B', t('level_avance')) +
        _onbOpt('level','expert',       '\u2B50', t('level_expert')) +
      '</div>';
  } else if (step === 2) {
    body = '<div class="onb-title">' + t('onb_step2_title') + '</div>' +
      '<div class="onb-sub">' + t('onb_step2_sub') + '</div>' +
      '<div class="onb-grid">' +
        _onbOpt('space','bacs',       '\uD83D\uDCE6', t('onb_space_pots')) +
        _onbOpt('space','pleineTerre','\uD83C\uDFE1', t('onb_space_ground')) +
        _onbOpt('space','mixte',      '\uD83C\uDF0D', t('onb_space_mixed')) +
        _onbOpt('space','balcon',     '\uD83C\uDF06', t('onb_space_balcony')) +
      '</div>';
  } else if (step === 3) {
    body = '<div class="onb-title">' + t('onb_step3_title') + '</div>' +
      '<div class="onb-sub">' + t('onb_step3_sub') + '</div>' +
      '<div style="text-align:center;padding:8px 0 14px;">' +
        '<div style="font-size:2rem;margin-bottom:8px;">\uD83D\uDCCD</div>' +
        '<div style="font-size:0.85rem;color:var(--text-light);margin-bottom:12px;">' + t('onb_city_lbl') + ' <strong>' + escH((APP.location || {}).name || 'Paris') + '</strong></div>' +
        '<button class="onb-btn-s" style="width:100%;margin-bottom:8px;" onclick="useGeolocation()">' + t('onb_use_gps') + '</button>' +
        '<button class="onb-btn-s" style="width:100%;" onclick="onbOpenCitySearch()">' + t('onb_search_city_btn') + '</button>' +
      '</div>';
  } else if (step === 4) {
    body = '<div class="onb-title">' + t('onb_step4_title') + '</div>' +
      '<div class="onb-sub">' + t('onb_step4_sub') + '</div>' +
      '<div class="onb-grid">' +
        _onbOpt('goal','rendement',    '\uD83D\uDCCA', t('onb_goal_yield')) +
        _onbOpt('goal','autonomie',    '\uD83E\uDD55', t('onb_goal_autonomy')) +
        _onbOpt('goal','plaisir',      '\uD83D\uDE0A', t('onb_goal_pleasure')) +
        _onbOpt('goal','apprentissage','\uD83D\uDCDA', t('onb_goal_learn')) +
      '</div>';
  }
  var isLast = step === 4;
  return '<div class="onb-wrap"><div class="onb-logo">' +
    '<img src="icon-192.png" alt="My Garden Side" class="onb-logo-img">' +
    '<div class="onb-logo-name">My Garden Side</div>' +
    '<div class="onb-logo-sub">' + t('onb_tagline') + '</div></div>' +
    '<div class="onb-card"><div class="onb-steps">' + dots + '</div>' + body +
    '<div class="onb-btns">' +
      (step > 1 ? '<button class="onb-btn-s" onclick="onbPrev()">\u2190</button>' : '') +
      '<button class="onb-btn-p" onclick="onbNext(' + step + ')">' + (isLast ? t('onb_start') : t('onb_next')) + '</button>' +
    '</div></div></div>';
}
function _onbOpt(group, value, icon, label) {
  var sel = group === 'goal' ? _onbData.goals.indexOf(value) >= 0 : (_onbData[group] === value || _onbData.spaceType === value);
  return '<div class="onb-opt' + (sel?' sel':'') + '" onclick="onbSel(\'' + group + '\',\'' + value + '\')">' +
    '<div class="onb-opt-icon">' + icon + '</div><div class="onb-opt-label">' + label + '</div></div>';
}
function onbSel(group, value) {
  if (group === 'goal') {
    var idx = _onbData.goals.indexOf(value);
    if (idx >= 0) _onbData.goals.splice(idx,1); else _onbData.goals.push(value);
  } else if (group === 'space') { _onbData.spaceType = value; }
  else { _onbData[group] = value; }
  var ov = document.getElementById('onbOverlay');
  if (ov) ov.innerHTML = _buildOnbStep(_onbStep);
}
function onbNext(step) {
  if (step === 1) { var el = document.getElementById('onbName'); if (el) _onbData.name = el.value.trim(); }
  if (step < 4) {
    _onbStep = step + 1;
    var ov = document.getElementById('onbOverlay'); if (ov) ov.innerHTML = _buildOnbStep(_onbStep);
  } else {
    APP.userProfile = { name:_onbData.name, level:_onbData.level||'debutant', spaceType:_onbData.spaceType||'bacs', goals:_onbData.goals, onboardingDone:true };
    saveData();
    var ov = document.getElementById('onbOverlay'); if (ov) ov.remove();
    navigate('dashboard');
  }
}
function onbPrev() {
  if (_onbStep > 1) { _onbStep--; var ov=document.getElementById('onbOverlay'); if(ov) ov.innerHTML=_buildOnbStep(_onbStep); }
}

// ============================================================
// LANGUAGE PICKER — affiché avant l'onboarding si aucune langue n'a été choisie
// Texte volontairement bilingue FR/EN car la langue est encore inconnue.
// ============================================================
function renderLanguagePicker() {
  var ex = document.getElementById('langPickerOverlay');
  if (ex) ex.remove();
  var ov = document.createElement('div');
  ov.id = 'langPickerOverlay';
  ov.className = 'onb-overlay';
  ov.innerHTML =
    '<div class="onb-wrap">' +
      '<div class="onb-logo">' +
        '<img src="icon-192.png" alt="My Garden Side" class="onb-logo-img">' +
        '<div class="onb-logo-name">My Garden Side</div>' +
        '<div class="onb-logo-sub">Your garden, your language</div>' +
      '</div>' +
      '<div class="onb-card">' +
        '<div class="onb-title" style="font-size:1.25rem;text-align:center;">' +
          'Choisissez votre langue<br>' +
          '<span style="font-size:0.9rem;font-weight:400;opacity:0.7;">Choose your language</span>' +
        '</div>' +
        '<div style="display:flex;flex-direction:column;gap:14px;margin-top:20px;">' +
          '<button class="onb-btn-p" onclick="pickLanguage(\'fr\')" style="font-size:1.1rem;padding:16px;">' +
            '\uD83C\uDDEB\uD83C\uDDF7 Fran\u00e7ais' +
          '</button>' +
          '<button class="onb-btn-p" onclick="pickLanguage(\'en\')" style="font-size:1.1rem;padding:16px;background:var(--brand-800,#1a3a2a);">' +
            '\uD83C\uDDEC\uD83C\uDDE7 English' +
          '</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  document.body.appendChild(ov);
}

function pickLanguage(lang) {
  var st = getAppState('settings') || {};
  st.languageChosen = true;
  updateAppState('settings', st);
  updateAppState('language', lang);
  document.documentElement.lang = lang;
  var ov = document.getElementById('langPickerOverlay');
  if (ov) ov.remove();
  if (shouldShowOnboarding()) {
    renderOnboarding();
  } else {
    navigate('dashboard', false);
  }
}
// ============================================================
// Recherche de ville depuis l'onboarding
var _onbCityResults = [];

function onbOpenCitySearch() {
  var ov = document.getElementById('onbOverlay');
  if (ov) ov.style.display = 'none';
  openModal(
    '<div class="modal-header"><div class="modal-title">' + t('settings_search_city_title') + '</div>' +
    '<button class="modal-close" onclick="onbCloseCitySearch()">&times;</button></div>' +
    '<div class="search-box"><span>🔍</span><input type="text" id="onbCitySearch" placeholder="' + t('settings_search_city_input') + '" oninput="onbSearchCity()" autocomplete="off"></div>' +
    '<div class="search-results" id="onbCityResults"></div>'
  );
}

function onbCloseCitySearch() {
  closeModal();
  var ov = document.getElementById('onbOverlay');
  if (ov) ov.style.display = 'flex';
}

var _onbSearchTimeout = null;
function onbSearchCity() {
  var el = document.getElementById('onbCitySearch');
  var resultsEl = document.getElementById('onbCityResults');
  if (!el || !resultsEl) return;
  var query = el.value.trim();
  if (query.length < 2) { resultsEl.innerHTML = ''; return; }
  if (_onbSearchTimeout) clearTimeout(_onbSearchTimeout);
  resultsEl.innerHTML = '<div style="padding:12px;color:var(--text-light);text-align:center;">🔍 Recherche...</div>';
  _onbSearchTimeout = setTimeout(function() {
    fetch('https://geocoding-api.open-meteo.com/v1/search?name=' + encodeURIComponent(query) + '&count=5&language=fr')
      .then(function(r) { return r.json(); })
      .then(function(data) {
        _onbCityResults = data.results || [];
        var el2 = document.getElementById('onbCityResults');
        if (!el2) return;
        if (_onbCityResults.length === 0) {
          el2.innerHTML = '<div style="padding:12px;color:var(--text-light);">' + t('settings_no_result') + '</div>';
          return;
        }
        var html = '';
        for (var i = 0; i < _onbCityResults.length; i++) {
          var r = _onbCityResults[i];
          html += '<div class="search-result-item" onclick="onbSelectCity(' + i + ')">' +
            '📍 ' + escH(r.name) + (r.admin1 ? ', ' + escH(r.admin1) : '') + ' (' + escH(r.country || '') + ')</div>';
        }
        el2.innerHTML = html;
      })
      .catch(function() {
        var el3 = document.getElementById('onbCityResults');
        if (el3) el3.innerHTML = '<div style="padding:12px;color:var(--red);">' + t('settings_search_err') + '</div>';
      });
  }, 400);
}

function onbSelectCity(index) {
  var r = _onbCityResults[index];
  if (!r) return;
  APP.location = { lat: r.latitude, lon: r.longitude, name: r.name };
  APP.weather = null;
  APP.weatherLastFetch = null;
  saveData();
  closeModal();
  _onbStep = 3;
  renderOnboarding();
}
