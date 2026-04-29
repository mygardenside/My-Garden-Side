// Green Vibes — modules/planning.js
// Planning, aujourd'hui, actions intelligentes
// FRAGILITÉ : buildSmartSuggestionsHTML() est appelé depuis analysis.js → doit rester
// dans planning.js et être chargé AVANT analysis.js dans index.html.
// ========== CROP FORECASTING / PLANNING ==========
function getPlannedCrops(horizon) {
  var now = new Date();
  var limit = new Date(now);
  if (horizon === 'next-season') {
    limit.setFullYear(limit.getFullYear() + 1);
  } else {
    var months = parseInt(horizon) || 1;
    limit.setMonth(limit.getMonth() + months);
  }
  return APP.crops.filter(function(c) {
    if (c.status !== 'planned') return false;
    if (!c.datePlant) return true;
    var d = new Date(c.datePlant);
    return d >= now && d <= limit;
  });
}
function getRotationRecommendations(bedId) {
  var allFamilies = [];
  var vkeys = Object.keys(APP.vegetables);
  for (var i = 0; i < vkeys.length; i++) {
    var f = APP.vegetables[vkeys[i]].family;
    if (allFamilies.indexOf(f) < 0) allFamilies.push(f);
  }
  var recentFamilies = [];
  var currentFams = getBedFamilies(bedId, APP.currentSeason);
  currentFams.forEach(function(f) { if (recentFamilies.indexOf(f) < 0) recentFamilies.push(f); });
  APP.seasons.forEach(function(s) {
    if (s === APP.currentSeason) return;
    var pf = getBedFamilies(bedId, s);
    pf.forEach(function(f) { if (recentFamilies.indexOf(f) < 0) recentFamilies.push(f); });
  });
  // Also count planned crops
  APP.crops.filter(function(c) { return c.status === 'planned' && c.bedId === bedId; }).forEach(function(c) {
    var v = APP.vegetables[c.veggieId];
    if (v && recentFamilies.indexOf(v.family) < 0) recentFamilies.push(v.family);
  });
  var recommended = allFamilies.filter(function(f) { return recentFamilies.indexOf(f) < 0; });
  var avoid = recentFamilies.slice();
  return { recommended: recommended, avoid: avoid };
}
function getPlantableVegetables(month) {
  var result = [];
  var vkeys = Object.keys(APP.vegetables);
  for (var i = 0; i < vkeys.length; i++) {
    var vid = vkeys[i];
    var veg = APP.vegetables[vid];
    var cal = (typeof GeoCalendar !== 'undefined')
      ? GeoCalendar.getCalendarForVeggie(veg)
      : getPlantingCalendarForVeggie(veg);
    if (cal && cal.plantMonths && cal.plantMonths.indexOf(month) >= 0) {
      result.push(vid);
    }
  }
  return result;
}
function getBedAvailableSpace(bed, excludePlanned) {
  var total = getBedSurface(bed);
  var used = 0;
  for (var i = 0; i < APP.crops.length; i++) {
    var c = APP.crops[i];
    if (c.bedId !== bed.id) continue;
    if (c.season !== APP.currentSeason) continue;
    if (c.status === 'active') used += getCropSurface(c);
    if (!excludePlanned && c.status === 'planned') used += getCropSurface(c);
  }
  return Math.max(0, total - used);
}
function getSuggestedPlantings(horizon) {
  var suggestions = [];
  var now = new Date();
  var targetMonth = now.getMonth() + 1;

  if (horizon === 'next-season') {
    targetMonth = 3;
  } else {
    var months = parseInt(horizon) || 1;
    targetMonth = ((now.getMonth() + months) % 12) + 1;
  }

  var plantable = getPlantableVegetables(targetMonth);
  var seen = {};

  // Extraire les noms des légumes actuellement en culture (pour le scoring compagnon)
  var activeCropNames = [];
  for (var ci = 0; ci < APP.crops.length; ci++) {
    var crop = APP.crops[ci];
    if (crop.season === APP.currentSeason && (crop.status === 'active' || crop.status === 'planned')) {
      var cv = APP.vegetables[crop.veggieId];
      if (cv) activeCropNames.push(normalizeVeggieName(cv.name));
    }
  }

  // Météo actuelle pour le scoring sensibilité
  var weather = (typeof getAppState === 'function') ? getAppState('weather') : null;
  var isHot = weather && weather.temp > 28;
  var isRainy = weather && weather.rain > 5;
  var isCold = weather && weather.temp < 8;

  for (var bi = 0; bi < APP.beds.length; bi++) {
    var bed = APP.beds[bi];
    var available = getBedAvailableSpace(bed, false);
    if (available < 0.02) continue;

    var reco = getRotationRecommendations(bed.id);

    // Noms des cultures actuelles dans ce carré (pour scoring compagnon local)
    var bedCropNames = [];
    for (var bci = 0; bci < APP.crops.length; bci++) {
      var bc = APP.crops[bci];
      if (bc.bedId === bed.id && bc.season === APP.currentSeason && (bc.status === 'active' || bc.status === 'planned')) {
        var bcv = APP.vegetables[bc.veggieId];
        if (bcv) bedCropNames.push(normalizeVeggieName(bcv.name));
      }
    }

    for (var pi = 0; pi < plantable.length; pi++) {
      var vid = plantable[pi];
      var v = APP.vegetables[vid];
      if (!v) continue;
      if (v.spacePerPlant > available) continue;

      // Vérification rotation : famille recommandée OU pas de contrainte (liste vide = pas encore de culture)
      var rotationOk = reco.recommended.length === 0 || reco.recommended.indexOf(v.family) >= 0;
      if (!rotationOk) continue;

      var key = bed.id + '|' + vid;
      if (seen[key]) continue;
      seen[key] = true;

      // --- Calcul du score composite ---
      var score = 0;
      var reasons = [];
      var warns = [];

      // 1. Rotation (0-40 pts)
      if (reco.recommended.length === 0) {
        score += 20;
        reasons.push(t('plan_reason_new_bed'));
      } else if (reco.recommended.indexOf(v.family) >= 0) {
        score += 40;
        reasons.push(t('plan_reason_rotation'));
      }

      // 2. Compagnonnage dans le carré (0-30 pts)
      var enrichiKey = null;
      var enrichiKeys = (typeof VEGGIE_ENRICHI !== 'undefined') ? Object.keys(VEGGIE_ENRICHI) : [];
      for (var ei = 0; ei < enrichiKeys.length; ei++) {
        if (normalizeVeggieName(enrichiKeys[ei]) === normalizeVeggieName(v.name)) {
          enrichiKey = enrichiKeys[ei];
          break;
        }
      }
      if (enrichiKey && VEGGIE_ENRICHI[enrichiKey] && VEGGIE_ENRICHI[enrichiKey].associations) {
        var bons = VEGGIE_ENRICHI[enrichiKey].associations.bons || [];
        var mauvais = VEGGIE_ENRICHI[enrichiKey].associations.mauvais || [];
        var companionBonus = 0;
        var companionMalus = 0;
        for (var gi = 0; gi < bons.length; gi++) {
          if (bedCropNames.indexOf(normalizeVeggieName(bons[gi])) >= 0) {
            companionBonus++;
          }
        }
        for (var mi = 0; mi < mauvais.length; mi++) {
          if (bedCropNames.indexOf(normalizeVeggieName(mauvais[mi])) >= 0) {
            companionMalus++;
          }
        }
        if (companionMalus > 0) {
          score -= 20;
          warns.push(t('plan_reason_bad_companion'));
        } else if (companionBonus > 0) {
          score += 30;
          reasons.push(t('plan_reason_good_companion').replace('{n}', companionBonus));
        }
      }

      // 3. Météo / sensibilité (0 à -20 pts)
      if (v.sensitivity) {
        if (isHot && v.sensitivity.hot >= 8) {
          score -= 15;
          warns.push(t('plan_reason_heat_sens'));
        }
        if (isRainy && v.sensitivity.rain >= 8) {
          score -= 10;
          warns.push(t('plan_reason_rain_sens'));
        }
        if (isCold && v.sensitivity.cold >= 8) {
          score -= 15;
          warns.push(t('plan_reason_cold_sens'));
        }
      }

      // 4. Espace disponible bonus (0-10 pts)
      if (available > 1.0) {
        score += 10;
        reasons.push(t('plan_reason_big_space'));
      } else if (available > 0.3) {
        score += 5;
        reasons.push(t('plan_reason_good_space'));
      } else {
        reasons.push(t('plan_reason_small_space'));
      }

      // Construire la raison affichée
      var reasonStr = reasons.join(' • ');
      if (warns.length > 0) {
        reasonStr += (reasonStr ? ' • ' : '') + '⚠ ' + warns.join(', ');
      }

      suggestions.push({
        veggieId: vid,
        veggie: v,
        bedId: bed.id,
        bedName: bed.name,
        available: available,
        reason: reasonStr,
        score: score
      });
    }
  }

  suggestions.sort(function(a, b) {
    if (b.score !== a.score) return b.score - a.score;
    return a.veggie.name.localeCompare(b.veggie.name, 'fr');
  });

  return suggestions;
}

function getUsedSurfaceInBed(bedId, excludeCropId) {
  var used = 0;
  for (var i = 0; i < APP.crops.length; i++) {
    var c = APP.crops[i];
    if (c.bedId !== bedId) continue;
    if (c.season !== APP.currentSeason) continue;
    if (excludeCropId && c.id === excludeCropId) continue;
    if (c.status === 'active' || c.status === 'planned') {
      used += getCropSurface(c);
    }
  }
  return used;
}

function activatePlannedCrop(cropId) {
  var crop = APP.crops.find(function(c) { return c.id === cropId; });
  if (!crop) return;
  crop.status = 'active';
  if (!crop.datePlant) crop.datePlant = new Date().toISOString().split('T')[0];
  saveData();
  renderPlanning();
}
function deletePlannedCrop(cropId) {
  if (!confirm(t('plan_confirm_delete'))) return;
  APP.crops = APP.crops.filter(function(c) { return c.id !== cropId; });
  saveData();
  renderPlanning();
}
function openPlanCropModal(horizon, presetBedId) {
  var months = 1;
  if (horizon === 'next-season') months = 12;
  else months = parseInt(horizon) || 1;
  var futureDate = new Date();
  futureDate.setMonth(futureDate.getMonth() + months);
  var futureDateStr = futureDate.toISOString().split('T')[0];
  var targetMonth = futureDate.getMonth() + 1;
  var plantable = getPlantableVegetables(targetMonth);
  var veggieItems = Object.keys(APP.vegetables).map(function(id) {
    var v = APP.vegetables[id];
    return { id: id, v: v, badge: plantable.indexOf(id) >= 0 ? t('settings_in_season_badge') : '' };
  }).sort(function(a, b) { return tVeg(a.v.name).localeCompare(tVeg(b.v.name), 'fr'); });
  var veggiePickerHTML = buildVeggiePicker('planVeggie', veggieItems, null);
  var bedOptions = '<option value="">' + t('plan_lbl_zone_none') + '</option>';
  for (var j = 0; j < APP.beds.length; j++) {
    var b = APP.beds[j];
    var avail = getBedAvailableSpace(b, false);
    var selected = presetBedId === b.id;
    bedOptions += '<option value="' + b.id + '"' + (selected ? ' selected' : '') + '>' + escH(b.name) + ' (' + avail.toFixed(2) + ' ' + t('plan_available') + ')</option>';
  }
  openModal(
    '<div class="modal-header"><div class="modal-title">' + t('plan_modal_title') + '</div><button class="modal-close" onclick="closeModal()">&times;</button></div>' +
    '<div class="form-group"><label class="form-label">' + t('plan_lbl_veggie') + ' <span style="font-size:0.75rem;color:var(--text-light);">' + t('plan_lbl_in_season') + ' ' + getMonthName(targetMonth) + '</span></label>' + veggiePickerHTML + '</div>' +
    '<div class="form-group"><label class="form-label">' + t('plan_lbl_zone') + '</label><select class="form-select" id="planBed">' + bedOptions + '</select></div>' +
    '<div class="form-group"><label class="form-label">' + t('plan_lbl_mode') + '</label>' +
    '<select class="form-select" id="planMode" onchange="updatePlanModeHint()">' +
    '<option value="plant">' + t('plan_lbl_mode_plants') + '</option>' +
    '<option value="surface">' + t('plan_lbl_mode_surface') + '</option></select></div>' +
    '<div class="form-group"><label class="form-label">' + t('plan_lbl_start_type') + '</label>' +
    '<select class="form-select" id="planStartType">' +
    '<option value="plant">' + t('plan_lbl_young_plant') + '</option>' +
    '<option value="seed">' + t('plan_lbl_seed') + '</option>' +
    '</select></div>' +
    '<div class="form-row">' +
    '<div class="form-group"><label class="form-label" id="planQtyLabel">' + t('plan_lbl_qty_plants') + '</label>' +
    '<input type="number" step="0.1" class="form-input" id="planQty" value=""></div>' +
    '<div class="form-group" id="planSpaceGroup">' +
    '<label class="form-label">' + t('plan_lbl_spacing') + '</label>' +
    '<input type="number" step="0.01" class="form-input" id="planSpace" value=""></div></div>' +
    '<div class="form-row">' +
    '<div class="form-group"><label class="form-label">' + t('plan_lbl_date_plant') + '</label><input type="date" class="form-input" id="planDatePlant" value="' + futureDateStr + '"></div>' +
    '<div class="form-group"><label class="form-label">' + t('plan_lbl_date_harvest') + '</label><input type="date" class="form-input" id="planDateHarvest" value=""></div></div>' +
    '<div class="form-group"><label class="form-label">' + t('plan_lbl_notes') + '</label><textarea class="form-textarea" id="planNotes" placeholder="' + t('lbl_placeholder_notes') + '"></textarea></div>' +
    '<div id="planRotationWarning"></div>' +
    '<div class="modal-actions">' +
    '<button class="btn btn-secondary" onclick="closeModal()">' + t('btn_cancel') + '</button>' +
    '<button class="btn btn-primary" onclick="savePlanCrop()" style="background:#7c3aed;">' + t('plan_btn_plan_action') + '</button></div>'
  );
  // Wire up auto-fill
  document.getElementById('planVeggie').addEventListener('change', function() { updatePlanDefaultSpace(true); updatePlanAutoHarvest(); checkPlanRotation(); });
  document.getElementById('planDatePlant').addEventListener('change', function() { updatePlanAutoHarvest(); checkPlanRotation(); });
  document.getElementById('planBed').addEventListener('change', checkPlanRotation);
  updatePlanDefaultSpace();
  updatePlanAutoHarvest();
  checkPlanRotation();
}
function updatePlanModeHint() {
  var mode = document.getElementById('planMode').value;
  document.getElementById('planQtyLabel').textContent = mode === 'plant' ? t('plan_lbl_qty_plants') : t('plan_lbl_qty_surface');
  document.getElementById('planSpaceGroup').style.display = mode === 'surface' ? 'none' : '';
}
function updatePlanDefaultSpace(force) {
  var vid = document.getElementById('planVeggie').value;
  var v = APP.vegetables[vid];
  if (v) {
    var el = document.getElementById('planSpace');
    if (force || !el.value) el.value = v.spacePerPlant;
  }
}
function updatePlanAutoHarvest() {
  var vid = document.getElementById('planVeggie').value;
  var dp = document.getElementById('planDatePlant').value;
  var v = APP.vegetables[vid];
  if (v && dp) {
    var hd = new Date(dp);
    hd.setDate(hd.getDate() + v.daysToHarvest);
    var dhEl = document.getElementById('planDateHarvest');
    if (!dhEl.value) dhEl.value = hd.toISOString().split('T')[0];
  }
}
function checkPlanRotation() {
  var vid = document.getElementById('planVeggie') ? document.getElementById('planVeggie').value : '';
  var bid = document.getElementById('planBed') ? document.getElementById('planBed').value : '';
  var datePlantEl = document.getElementById('planDatePlant');
  var datePlant = datePlantEl ? datePlantEl.value : '';
  var warn = document.getElementById('planRotationWarning');
  if (!warn) return;
  if (!vid || !bid) { warn.innerHTML = ''; return; }
  var v = APP.vegetables[vid];
  if (!v) { warn.innerHTML = ''; return; }

  // Vérifier le prédécesseur direct : la culture récoltée juste avant la date de plantation
  if (datePlant) {
    var tgt = new Date(datePlant);
    var predecessors = APP.crops.filter(function(c) {
      return c.bedId === bid && c.id !== vid && c.dateHarvest &&
             new Date(c.dateHarvest) <= tgt &&
             (c.status === 'active' || c.status === 'planned' || c.status === 'harvested');
    }).sort(function(a, b) { return new Date(b.dateHarvest) - new Date(a.dateHarvest); });

    if (predecessors.length > 0) {
      var pred = predecessors[0];
      var predV = APP.vegetables[pred.veggieId];
      if (predV && predV.family === v.family) {
        var predName = escH(tVeg(predV.name));
        warn.innerHTML = '<div class="tip-card bad">' +
          t('plan_rotation_pred_warn')
            .replace('{family}', escH(t('family_' + v.family)))
            .replace('{prev}', predName) +
          '</div>';
        return;
      }
    }
  }

  // Vérifier la rotation générale (saisons passées)
  var prevSeasons = APP.seasons.filter(function(s) { return s !== APP.currentSeason; });
  for (var i = 0; i < prevSeasons.length; i++) {
    var pf = getBedFamilies(bid, prevSeasons[i]);
    if (pf.indexOf(v.family) >= 0) {
      warn.innerHTML = '<div class="tip-card bad">' +
        t('plan_rotation_warn').replace('{family}', escH(t('family_' + v.family))) +
        '</div>';
      return;
    }
  }

  warn.innerHTML = '';
}

function renderForecastSection(planningFilter) {
  var sectionSubtitle = '';

  if (planningFilter === 'today') sectionSubtitle = t('plan_filter_today');
  else if (planningFilter === 'week') sectionSubtitle = t('plan_filter_week');
  else if (planningFilter === 'all') sectionSubtitle = t('plan_filter_all');
  else if (planningFilter === '1m') sectionSubtitle = t('plan_filter_1m');
  else if (planningFilter === '2m') sectionSubtitle = t('plan_filter_2m');
  else if (planningFilter === '3m') sectionSubtitle = t('plan_filter_3m');
  else if (planningFilter === 'next') sectionSubtitle = t('plan_filter_next');
  else sectionSubtitle = t('plan_filter_default');

  var html = '<div class="forecast-section">' +
    '<div style="font-size:0.82rem;color:var(--text-light);margin:-2px 0 12px 0;">' + sectionSubtitle + '</div>' +
    '<button class="btn btn-secondary btn-block" style="margin-bottom:12px;" onclick="createNewSeason()">' + t('plan_new_season') + '</button>';

  var horizonForBtn = '1';

  if (planningFilter === '1m') horizonForBtn = '1';
  else if (planningFilter === '2m') horizonForBtn = '2';
  else if (planningFilter === '3m') horizonForBtn = '3';
  else if (planningFilter === 'next') horizonForBtn = 'next-season';
  else horizonForBtn = '1';

  html += '<button class="plan-btn" onclick="openPlanCropModal(\'' + horizonForBtn + '\')">' + t('plan_btn_plan') + '</button>';

  // Section "Cultures planifiées" masquée (doublon avec la frise de saison)
  // Les données, filtres et logique sont intacts — seul le rendu HTML est omis.

  if (APP.beds.length > 0) {
    html += '<div class="section-title">' + t('plan_section_rotation') + '</div>';
    html += '<div class="card card-flush">';
    html += '<div style="padding:10px 14px 6px;font-size:0.8rem;color:var(--text-light);">' + t('plan_rota_subtitle') + '</div>';

    for (var bi = 0; bi < APP.beds.length; bi++) {
      var bed2 = APP.beds[bi];
      var score2 = getRotationScore(bed2);
      var reco2 = getRotationRecommendations(bed2.id);
      var currentFams = getBedFamilies(bed2.id, APP.currentSeason);

      var statusCls, statusLabel;
      if (score2.score === 'good') {
        statusCls = 'rota-status--good';
        statusLabel = '\uD83D\uDFE2 ' + t('plan_rota_status_good');
      } else if (score2.score === 'warning') {
        statusCls = 'rota-status--warn';
        statusLabel = '\uD83D\uDFE0 ' + t('plan_rota_status_warn');
      } else {
        statusCls = 'rota-status--bad';
        statusLabel = '\uD83D\uDD34 ' + t('plan_rota_status_bad');
      }

      var sugNames = [];
      if (reco2.recommended.length > 0) {
        var vkeys2 = Object.keys(APP.vegetables);
        for (var vi2 = 0; vi2 < vkeys2.length && sugNames.length < 2; vi2++) {
          var vsug = APP.vegetables[vkeys2[vi2]];
          if (reco2.recommended.indexOf(vsug.family) >= 0) {
            sugNames.push(vsug.icon + ' ' + escH(tVeg(vsug.name)));
          }
        }
      }

      var famText = currentFams.length > 0
        ? currentFams.map(function(f) { return escH(t('family_' + f)); }).join(', ')
        : t('plan_rota_no_fam');

      html += '<div class="rota-row">' +
        '<div style="flex:1;min-width:0;">' +
          '<div class="rota-row-name">' + escH(bed2.name) + '</div>' +
          '<div style="margin-top:3px;">' +
            '<span class="rota-status ' + statusCls + '">' + statusLabel + '</span>' +
            '&ensp;<span style="font-size:0.73rem;color:var(--text-light);">' + famText + '</span>' +
          '</div>' +
          (sugNames.length > 0
            ? '<div class="rota-sugg">' + t('plan_rota_try') + ' ' + sugNames.join(', ') + '</div>'
            : '') +
        '</div>' +
        '<button class="btn btn-sm btn-secondary" style="flex-shrink:0;white-space:nowrap;" onclick="openRotationDetail(\'' + bed2.id + '\')">' + t('plan_rota_detail') + ' \u2192</button>' +
      '</div>';
    }

    html += '</div>';
  }

  html += '</div>';
  return html;
}

function openRotationDetail(bedId) {
  var bed = APP.beds.find(function(b) { return b.id === bedId; });
  if (!bed) return;

  var reco = getRotationRecommendations(bedId);
  var currentFams = getBedFamilies(bedId, APP.currentSeason);
  var prevFams = [];
  APP.seasons.forEach(function(s) {
    if (s === APP.currentSeason) return;
    getBedFamilies(bedId, s).forEach(function(f) {
      if (prevFams.indexOf(f) < 0) prevFams.push(f);
    });
  });

  function badgeRow(label, fams, badgeCls) {
    if (!fams.length) return '';
    var out = '<div style="font-size:0.78rem;font-weight:600;color:var(--text-light);margin:10px 0 4px;">' + label + '</div><div>';
    fams.forEach(function(f) {
      out += '<span class="badge ' + badgeCls + '" style="margin:2px;">' + escH(t('family_' + f)) + '</span>';
    });
    return out + '</div>';
  }

  var sugVeggies = [];
  if (reco.recommended.length > 0) {
    var vkeys = Object.keys(APP.vegetables);
    for (var vi = 0; vi < vkeys.length; vi++) {
      var veg = APP.vegetables[vkeys[vi]];
      if (reco.recommended.indexOf(veg.family) >= 0) sugVeggies.push(veg);
    }
  }

  var sugHTML = '';
  if (sugVeggies.length > 0) {
    sugHTML = '<div style="font-size:0.78rem;font-weight:600;color:var(--text-light);margin:10px 0 4px;">' + t('plan_rota_suggested') + '</div><div>';
    sugVeggies.forEach(function(sv) {
      sugHTML += '<span class="badge badge-green" style="margin:2px;">' + sv.icon + ' ' + escH(tVeg(sv.name)) + '</span>';
    });
    sugHTML += '</div>';
  }

  openModal(
    '<div class="modal-header"><div class="modal-title">\uD83D\uDD04 ' + escH(bed.name) + '</div><button class="modal-close" onclick="closeModal()">\u00D7</button></div>' +
    '<div style="padding:0 2px;">' +
      badgeRow(t('plan_rota_current'), currentFams, 'badge-orange') +
      badgeRow(t('plan_rota_prev'), prevFams, 'badge-orange') +
      badgeRow(t('plan_rota_recommended'), reco.recommended, 'badge-green') +
      badgeRow(t('plan_rota_avoid'), reco.avoid, 'badge-red') +
      sugHTML +
    '</div>' +
    '<div class="modal-actions"><button class="btn btn-secondary" onclick="closeModal()">' + t('btn_cancel') + '</button></div>'
  );
}
// ========== PLANNING INTELLIGENCE ==========
function generateTasks(weather) {
  var tasks = [];
  var seen = {};
  var today = new Date();
  var todayStr = today.toISOString().split('T')[0];

  function addTask(key, text, category, priority, reason) {
    if (seen[key]) return;
    seen[key] = true;
    tasks.push({ key: key, text: text, category: category, priority: priority, reason: reason || '' });
  }

  var activeCrops = APP.crops.filter(function(c) {
    return c.season === APP.currentSeason && c.status === 'active';
  });

  var completedKeys = {};
  if (APP.completedTasks) {
    APP.completedTasks
      .filter(function(t) { return t.date === todayStr; })
      .forEach(function(t) { completedKeys[t.key] = true; });
  }

  // ── Prévision pluie sur les 3 prochains jours ─────────────────
  var rainNext3Days = 0;
  var rainDayLabel = '';
  if (weather && weather.daily && weather.daily.precipitation_sum) {
    var sums = weather.daily.precipitation_sum;
    var times = weather.daily.time || [];
    for (var ri = 1; ri <= 3 && ri < sums.length; ri++) {
      rainNext3Days += sums[ri] || 0;
    }
    // Trouver le premier jour avec pluie significative
    for (var rj = 1; rj <= 3 && rj < sums.length; rj++) {
      if ((sums[rj] || 0) >= 5) {
        rainDayLabel = times[rj] ? getDayName(times[rj]) : '';
        break;
      }
    }
  }

  if (weather && weather.current) {
    var temp = weather.current.temperature_2m;
    var wind = weather.current.wind_speed_10m;
    var precip = weather.current.precipitation;

    for (var i = 0; i < activeCrops.length; i++) {
      var crop = activeCrops[i];
      var v = APP.vegetables[crop.veggieId];
      if (!v) continue;

      var sensitivity = v.sensitivity || {};
      var cold = typeof sensitivity.cold === 'number' ? sensitivity.cold : 5;
      var hot = typeof sensitivity.hot === 'number' ? sensitivity.hot : 5;
      var rain = typeof sensitivity.rain === 'number' ? sensitivity.rain : 5;
      var windSens = typeof sensitivity.wind === 'number' ? sensitivity.wind : 5;

      var stage = getCropStage(crop);
      var seedlingMult = stage === 'seedling' ? 1.5 : 1;
      var harvestMult = stage === 'harvest' ? 1.3 : 1;

      if (temp <= 5 && cold >= 6) {
        var coldEff = cold * seedlingMult;
        if (coldEff > 6) {
          addTask(
            'cold-' + crop.id,
            t('task_cold_protect').replace('{icon}', v.icon).replace('{name}', tVeg(v.name)).replace('{temp}', Math.round(temp)).replace('{seedling}', stage === 'seedling' ? t('task_cold_seedling') : ''),
            'Protection meteo',
            coldEff > 10 ? 'urgent' : 'important',
            t('task_reason_cold').replace('{temp}', Math.round(temp)).replace('{name}', tVeg(v.name)).replace('{cold}', cold)
          );
        }
      }

      if (temp >= 30 && hot >= 6) {
        var heatEff = hot * harvestMult;
        if (heatEff > 6) {
          addTask(
            'heat-' + crop.id,
            t('task_heat_protect').replace('{icon}', v.icon).replace('{name}', tVeg(v.name)).replace('{temp}', Math.round(temp)),
            'Protection meteo',
            heatEff > 10 ? 'urgent' : 'important',
            t('task_reason_heat').replace('{temp}', Math.round(temp)).replace('{name}', tVeg(v.name))
          );
        }
      }

      if (wind >= 30 && windSens >= 5) {
        var windMult = (stage === 'growing' || stage === 'maturing') ? 1.3 : 1;
        var windEff = windSens * windMult;
        if (windEff > 6) {
          addTask(
            'wind-' + crop.id,
            t('task_wind_stake').replace('{icon}', v.icon).replace('{name}', tVeg(v.name)).replace('{speed}', Math.round(wind)),
            'Tuteurage',
            windEff > 10 ? 'urgent' : 'important',
            t('task_reason_wind').replace('{speed}', Math.round(wind)).replace('{name}', tVeg(v.name))
          );
        }
      }

      if (precip > 5 && rain >= 5) {
        var rainMult = stage === 'harvest' ? 1.5 : 1;
        var rainEff = rain * rainMult;
        if (rainEff > 6) {
          addTask(
            'rain-' + crop.id,
            t('task_rain_protect').replace('{icon}', v.icon).replace('{name}', tVeg(v.name)).replace('{mm}', Math.round(precip)).replace('{harvest}', stage === 'harvest' ? t('task_rain_harvest') : ''),
            'Protection meteo',
            rainEff > 10 ? 'urgent' : 'important',
            t('task_reason_rain').replace('{mm}', Math.round(precip)).replace('{name}', tVeg(v.name))
          );
        }
      }
    }

    if (temp <= 2) {
      addTask(
        'frost-general',
        t('task_frost_alert').replace('{temp}', Math.round(temp)),
        'Protection meteo',
        'urgent',
        t('task_reason_frost').replace('{temp}', Math.round(temp))
      );
    }
  }

  // ── Arrosage intelligent par bac (IrrigationModule + pluie prévue) ──
  if (typeof IrrigationModule !== 'undefined') {
    for (var bi = 0; bi < APP.beds.length; bi++) {
      var irrigBed = APP.beds[bi];
      var waterNeed = IrrigationModule.getBedWaterNeed(irrigBed);
      if (!waterNeed || !waterNeed.deficit) continue;

      var liters = waterNeed.litersPerWeek;
      if (rainNext3Days >= 10) {
        // Pluie suffisante prévue → pas besoin d'arroser
        if (!seen['water-rain-ok']) {
          seen['water-rain-ok'] = true;
          addTask(
            'water-rain-' + irrigBed.id,
            t('task_water_rain_ok').replace('{mm}', Math.round(rainNext3Days)).replace('{day}', rainDayLabel),
            'Arrosage',
            'info',
            t('task_reason_water_rain').replace('{et0}', waterNeed.et0Week).replace('{mm}', Math.round(rainNext3Days))
          );
        }
      } else {
        var waterPriority = waterNeed.netMmPerM2 >= 15 ? 'important' : 'info';
        addTask(
          'water-bed-' + irrigBed.id,
          t('task_water_bed').replace('{bed}', escH(irrigBed.name)).replace('{liters}', liters),
          'Arrosage',
          waterPriority,
          t('task_reason_water_bed').replace('{et0}', waterNeed.et0Week).replace('{rain}', waterNeed.rainWeek).replace('{kc}', waterNeed.avgKC)
        );
      }
    }
  }

  for (var j = 0; j < activeCrops.length; j++) {
    var cr = activeCrops[j];
    var vg = APP.vegetables[cr.veggieId];
    if (!vg) continue;

    var st = getCropStage(cr);

    if (st === 'harvest') {
      addTask(
        'harvest-' + cr.id,
        t('task_harvest_ready').replace('{icon}', vg.icon).replace('{name}', tVeg(vg.name)),
        'Recolte',
        'urgent',
        t('task_reason_harvest').replace('{name}', tVeg(vg.name))
      );
    }

    if (cr.dateHarvest) {
      var daysLeft = Math.floor((new Date(cr.dateHarvest) - today) / 86400000);
      if (daysLeft >= 0 && daysLeft <= 7 && st !== 'harvest') {
        addTask(
          'near-harvest-' + cr.id,
          t('task_harvest_soon').replace('{icon}', vg.icon).replace('{name}', tVeg(vg.name)).replace('{n}', daysLeft),
          'Recolte',
          daysLeft <= 3 ? 'important' : 'info',
          t('task_reason_harvest_soon').replace('{name}', tVeg(vg.name)).replace('{n}', daysLeft)
        );
      }
    }
  }

  for (var k = 0; k < APP.beds.length; k++) {
    var rotBed = APP.beds[k];
    var r = getRotationScore(rotBed);
    if (r.score === 'bad') {
      addTask(
        'rotation-' + rotBed.id,
        t('task_rotation_bad').replace('{bed}', rotBed.name).replace('{n}', r.repeated),
        'Rotation',
        'important',
        t('task_reason_rotation').replace('{bed}', rotBed.name)
      );
    }
  }

  if (activeCrops.length > 0) {
    addTask('entretien', t('task_check_garden'), 'Entretien', 'info', t('task_reason_entretien'));
  }

  // ── Successions de semis ─────────────────────────────────────
  // Pour chaque culture récoltée dans les 45 prochains jours,
  // vérifier si une suite de la même culture est déjà planifiée.
  // Sinon, suggérer de ressemer maintenant.
  var allCropsSeason = APP.crops.filter(function(c) {
    return c.season === APP.currentSeason && (c.status === 'active' || c.status === 'planned');
  });
  for (var si = 0; si < activeCrops.length; si++) {
    var sc = activeCrops[si];
    if (!sc.dateHarvest) continue;
    var daysToHarvest = Math.floor((new Date(sc.dateHarvest) - today) / 86400000);
    if (daysToHarvest < 0 || daysToHarvest > 45) continue;
    var sv = APP.vegetables[sc.veggieId];
    if (!sv) continue;
    // Vérifier si une autre culture du même légume continue après
    var hasSuccessor = allCropsSeason.some(function(other) {
      if (other.id === sc.id || other.veggieId !== sc.veggieId) return false;
      if (!other.datePlant) return other.status === 'planned';
      return new Date(other.datePlant) > new Date(sc.dateHarvest);
    });
    if (!hasSuccessor) {
      // Vérifier que la saison de semis est encore ouverte (calendrier géolocalisé)
      var calSuc = typeof GeoCalendar !== 'undefined' ? GeoCalendar.getCalendarForVeggie(sv) : null;
      var curM = today.getMonth() + 1;
      var canSowNow = !calSuc || !calSuc.plantMonths || !calSuc.plantMonths.length ||
        calSuc.plantMonths.indexOf(curM) >= 0 || (calSuc.indoorMonths && calSuc.indoorMonths.indexOf(curM) >= 0);
      if (!canSowNow) continue;
      addTask(
        'succession-' + sc.veggieId,
        t('task_succession').replace('{icon}', sv.icon).replace('{name}', tVeg(sv.name)),
        'Succession',
        daysToHarvest <= 21 ? 'important' : 'info',
        t('task_reason_succession').replace('{name}', tVeg(sv.name)).replace('{days}', daysToHarvest)
      );
    }
  }

  return tasks.filter(function(t) {
    return !completedKeys[t.key];
  });
}
// ========== ECRAN DU JOUR ==========
async function renderToday() {
  var el = document.getElementById('pageToday');
  el.innerHTML =
    '<div class="skel-page" style="padding:0;">' +
      '<div class="skel" style="width:100%;height:94px;border-radius:22px;margin-bottom:10px;' +
        'background:linear-gradient(145deg,rgba(11,93,71,0.12),rgba(11,93,71,0.06));' +
        'background-size:500px 100%;animation:shimmer 1.6s ease-in-out infinite;"></div>' +
      '<div class="skel" style="width:100%;height:5px;border-radius:4px;margin-bottom:16px;"></div>' +
      '<div class="skel" style="width:150px;height:10px;border-radius:5px;margin-bottom:12px;"></div>' +
      '<div class="skel-card" style="height:64px;border-radius:16px;margin-bottom:7px;"></div>' +
      '<div class="skel-card" style="height:64px;border-radius:16px;margin-bottom:7px;"></div>' +
      '<div class="skel-card" style="height:64px;border-radius:16px;margin-bottom:7px;"></div>' +
      '<div class="skel-card" style="height:64px;border-radius:16px;opacity:0.65;"></div>' +
    '</div>';

  var weather = await fetchWeather();
  var toutesLesTaches = generateTasks(weather);
  var today = new Date();
  var todayStr = today.toISOString().split('T')[0];

  var dateLabel = t('day_' + today.getDay()) + ' ' + today.getDate() + ' ' + t('month_' + today.getMonth()) + ' ' + today.getFullYear();

  // Taches deja faites
  var faitesAujourdhui = (APP.completedTasks || []).filter(function(t) { return t.date === todayStr; });
  var total = toutesLesTaches.length + faitesAujourdhui.length;
  var nbFaites = faitesAujourdhui.length;
  var pct = total > 0 ? Math.round((nbFaites / total) * 100) : 100;

  // Pill meteo
  var meteoPill = '';
  if (weather && weather.current) {
    meteoPill = getWeatherEmoji(weather.current.weather_code) + ' ' + Math.round(weather.current.temperature_2m) + '\u00B0C';
    if (weather.current.precipitation > 0) {
      meteoPill += ' \u00B7 ' + weather.current.precipitation + 'mm';
    } else {
      meteoPill += ' \u00B7 ' + t('today_dry');
    }
  }

  // Alertes meteo
  var alertesHTML = '';
  if (weather && weather.current) {
    var temp = weather.current.temperature_2m;
    var wind = weather.current.wind_speed_10m;
    var precip = weather.current.precipitation;
    if (temp <= 2) {
      alertesHTML += '<div class="prem-today-alert danger"><div class="prem-today-alert-emoji">🥶</div><div><div class="prem-today-alert-title">' + t('today_alert_frost').replace('{temp}', Math.round(temp)) + '</div><div class="prem-today-alert-sub">' + t('today_alert_frost_sub') + '</div></div></div>';
    } else if (temp <= 5) {
      alertesHTML += '<div class="prem-today-alert warn"><div class="prem-today-alert-emoji">❄️</div><div><div class="prem-today-alert-title">' + t('today_alert_cold').replace('{temp}', Math.round(temp)) + '</div><div class="prem-today-alert-sub">' + t('today_alert_cold_sub') + '</div></div></div>';
    }
    if (temp >= 35) {
      alertesHTML += '<div class="prem-today-alert danger"><div class="prem-today-alert-emoji">🔥</div><div><div class="prem-today-alert-title">' + t('today_alert_heat').replace('{temp}', Math.round(temp)) + '</div><div class="prem-today-alert-sub">' + t('today_alert_heat_sub') + '</div></div></div>';
    }
    if (precip > 10) {
      alertesHTML += '<div class="prem-today-alert warn"><div class="prem-today-alert-emoji">🌧️</div><div><div class="prem-today-alert-title">' + t('today_alert_rain').replace('{mm}', precip) + '</div><div class="prem-today-alert-sub">' + t('today_alert_rain_sub') + '</div></div></div>';
    }
    if (wind > 40) {
      alertesHTML += '<div class="prem-today-alert warn"><div class="prem-today-alert-emoji">💨</div><div><div class="prem-today-alert-title">' + t('today_alert_wind').replace('{kmh}', Math.round(wind)) + '</div><div class="prem-today-alert-sub">' + t('today_alert_wind_sub') + '</div></div></div>';
    }
  }

  // Trier par priorite
  var urgentes    = toutesLesTaches.filter(function(t) { return t.priority === 'urgent'; });
  var importantes = toutesLesTaches.filter(function(t) { return t.priority === 'important'; });
  var infos       = toutesLesTaches.filter(function(t) { return t.priority === 'info'; });

  // Icones par categorie
  var iconeCategorie = { 'Recolte':'🎉', 'Arrosage':'💧', 'Protection meteo':'🛡️', 'Tuteurage':'🌿', 'Entretien':'🔧', 'Rotation':'🔄', 'Succession':'🔁' };
  var nomCategorie = { 'Recolte': t('plan_cat_harvest'), 'Arrosage': t('plan_cat_water'), 'Protection meteo': t('plan_cat_weather'), 'Tuteurage': t('plan_cat_stake'), 'Entretien': t('plan_cat_maintenance'), 'Rotation': t('plan_cat_rotation'), 'Succession': t('plan_cat_succession') };

  function buildTacheHTML(tache) {
    var icone = iconeCategorie[tache.category] || '📌';
    var priorityCls = tache.priority === 'urgent' ? 'urgent' : tache.priority === 'important' ? 'important' : 'info';
    var isRecolte = tache.key.indexOf('harvest-') === 0;
    var cropId = isRecolte ? tache.key.replace('harvest-', '') : '';
    var btnRecolte = isRecolte ? '<div style="margin-top:8px;"><button class="btn btn-sm btn-primary" onclick="event.stopPropagation();quickHarvestCrop(\'' + cropId + '\')">' + t('today_harvest_btn') + '</button></div>' : '';
    var whyId = 'why-' + tache.key.replace(/[^a-z0-9]/gi, '-');
    var btnWhy = tache.reason
      ? '<button class="prem-today-why-btn" onclick="event.stopPropagation();toggleWhyPanel(\'' + whyId + '\')">' + t('task_why_btn') + '</button>' +
        '<div class="prem-today-why-panel" id="' + whyId + '">' + escH(tache.reason) + '</div>'
      : '';
    return '<div class="prem-today-task ' + priorityCls + '" onclick="validerTache(\'' + tache.key + '\')">' +
      '<div class="prem-today-task-circle"></div>' +
      '<div class="prem-today-task-icon">' + icone + '</div>' +
      '<div style="flex:1;min-width:0;">' +
        '<div class="prem-today-task-text">' + escH(tache.text) + '</div>' +
        '<div class="prem-today-task-sub">' + escH(nomCategorie[tache.category] || tache.category) + '</div>' +
        btnWhy +
        btnRecolte +
      '</div>' +
    '</div>';
  }

  var tachesHTML = '';
  if (urgentes.length > 0) {
    tachesHTML += '<div class="prem-today-group">' + t('today_group_urgent').replace('{n}', urgentes.length) + '</div>';
    for (var i = 0; i < urgentes.length; i++) { tachesHTML += buildTacheHTML(urgentes[i]); }
  }
  if (importantes.length > 0) {
    tachesHTML += '<div class="prem-today-group">' + t('today_group_important').replace('{n}', importantes.length) + '</div>';
    for (var j = 0; j < importantes.length; j++) { tachesHTML += buildTacheHTML(importantes[j]); }
  }
  if (infos.length > 0) {
    tachesHTML += '<div class="prem-today-group">' + t('today_group_todo').replace('{n}', infos.length) + '</div>';
    for (var k = 0; k < infos.length; k++) { tachesHTML += buildTacheHTML(infos[k]); }
  }
  if (toutesLesTaches.length === 0 && faitesAujourdhui.length === 0) {
    tachesHTML = '<div class="today-vide"><div class="today-vide-icon">\uD83C\uDF3F</div><div class="today-vide-texte">' + t('today_empty').replace('\n','<br>') + '</div></div>';
  }

  // Taches terminees
  var termeesHTML = '';
  if (faitesAujourdhui.length > 0) {
    var listeFaites = '';
    for (var f = 0; f < faitesAujourdhui.length; f++) {
      listeFaites += '<div class="prem-today-task done">' +
        '<div class="prem-today-task-circle checked">\u2713</div>' +
        '<div style="flex:1;min-width:0;">' +
          '<div class="prem-today-task-text">' + escH(faitesAujourdhui[f].text) + '</div>' +
          '<div class="prem-today-task-sub">' + t('today_task_done') + '</div>' +
        '</div>' +
      '</div>';
    }
    termeesHTML = '<div class="prem-today-terminees-header" onclick="toggleTerminees(this)">' +
      '<span>' + t('today_done_header').replace('{n}', faitesAujourdhui.length) + '</span><span>\u25BE</span>' +
    '</div>' +
    '<div class="today-terminees-liste">' + listeFaites + '</div>';
  }

  // Titre du compteur
  var compteurLabel;
  if (toutesLesTaches.length === 0) {
    compteurLabel = t('today_all_done');
  } else if (toutesLesTaches.length === 1) {
    compteurLabel = t('today_count_one');
  } else {
    compteurLabel = t('today_count_many').replace('{n}', toutesLesTaches.length);
  }

  var weatherEmoji = '';
  var weatherTemp = '';
  var weatherInfo = '';
  if (weather && weather.current) {
    weatherEmoji = getWeatherEmoji(weather.current.weather_code);
    weatherTemp = Math.round(weather.current.temperature_2m) + '\u00B0C';
    weatherInfo = weather.current.precipitation > 0 ? weather.current.precipitation + 'mm' : t('today_dry');
  }

  // ── Bloc stats récoltes ────────────────────────────────────────
  var harvestStatsHTML = '';
  (function() {
    var seasonCrops = APP.crops.filter(function(c) { return c.season === APP.currentSeason; });
    // Total saison (cultures récoltées + partielles)
    var totalKg = 0;
    var totalEst = 0;
    var recentEntries = []; // { icon, name, kg, date }
    var sevenDaysAgo = new Date(today); sevenDaysAgo.setDate(today.getDate() - 7);

    seasonCrops.forEach(function(c) {
      var vg = APP.vegetables[c.veggieId];
      if (!vg) return;
      var partials = c.partialHarvests || [];
      partials.forEach(function(h) {
        totalKg += h.kg || 0;
        recentEntries.push({ icon: vg.icon, name: tVeg(vg.name), kg: h.kg || 0, date: h.date });
      });
      if (c.status === 'harvested' && c.yieldReal && !partials.length) {
        totalKg += c.yieldReal;
        recentEntries.push({ icon: vg.icon, name: tVeg(vg.name), kg: c.yieldReal, date: c.dateHarvest || todayStr });
      }
      totalEst += getCropEstimatedYield(c);
    });

    if (totalKg <= 0) return; // Rien récolté — ne pas afficher

    // Trier les entrées récentes par date décroissante et prendre les 4 dernières
    recentEntries.sort(function(a, b) { return (b.date || '').localeCompare(a.date || ''); });
    var shown = recentEntries.slice(0, 4);

    var pct = totalEst > 0 ? Math.min(100, Math.round(totalKg / totalEst * 100)) : null;
    var barW = pct !== null ? pct : 100;

    // Construire les entrées récentes
    var entriesHTML = shown.map(function(e) {
      var daysAgo = Math.floor((today - new Date(e.date)) / 86400000);
      var dateStr = daysAgo === 0 ? t('today_harvest_today')
                  : daysAgo === 1 ? t('today_harvest_yesterday')
                  : t('today_harvest_days_ago').replace('{n}', daysAgo);
      return '<div class="today-harvest-entry">' +
        '<span class="today-harvest-entry-icon">' + e.icon + '</span>' +
        '<span class="today-harvest-entry-name">' + escH(e.name) + '</span>' +
        '<span class="today-harvest-entry-kg">' + e.kg.toFixed(1) + ' kg</span>' +
        '<span class="today-harvest-entry-date">' + dateStr + '</span>' +
      '</div>';
    }).join('');

    harvestStatsHTML =
      '<div class="today-harvest-stats">' +
        '<div class="today-harvest-stats-head">' +
          '<span class="today-harvest-stats-title">🏆 ' + t('today_harvest_title') + '</span>' +
          '<span class="today-harvest-stats-total">' + totalKg.toFixed(1) + ' kg</span>' +
        '</div>' +
        (pct !== null ?
          '<div class="today-harvest-bar-wrap">' +
            '<div class="today-harvest-bar"><div class="today-harvest-bar-fill" style="width:' + barW + '%"></div></div>' +
            '<span class="today-harvest-bar-label">' + t('today_harvest_pct').replace('{pct}', pct).replace('{est}', totalEst.toFixed(1)) + '</span>' +
          '</div>'
        : '') +
        (entriesHTML ? '<div class="today-harvest-entries">' + entriesHTML + '</div>' : '') +
      '</div>';
  }());

  // ── Section "Pas maintenant" — cultures planifiées hors fenêtre ──
  var pasMaintenantHTML = '';
  if (typeof GeoCalendar !== 'undefined') {
    var climate = typeof ClimateModule !== 'undefined' ? ClimateModule.get() : null;
    var currentMonth = today.getMonth() + 1; // 1-12
    var plannedCrops = APP.crops.filter(function(c) {
      return c.season === APP.currentSeason && c.status === 'planned';
    });
    var warnings = [];
    plannedCrops.forEach(function(c) {
      var veg = APP.vegetables[c.veggieId];
      if (!veg) return;
      var cal = GeoCalendar.getCalendarForVeggie(veg);
      if (!cal || !cal.plantMonths || !cal.plantMonths.length) return;
      if (cal.plantMonths.indexOf(currentMonth) >= 0) return; // dans la fenêtre
      // Trouver le prochain mois de plantation
      var nextM = null;
      for (var nm = currentMonth + 1; nm <= 12; nm++) {
        if (cal.plantMonths.indexOf(nm) >= 0) { nextM = nm; break; }
      }
      if (!nextM) {
        for (var nm2 = 1; nm2 < currentMonth; nm2++) {
          if (cal.plantMonths.indexOf(nm2) >= 0) { nextM = nm2; break; }
        }
      }
      var monthNames = [t('month_0'),t('month_1'),t('month_2'),t('month_3'),t('month_4'),t('month_5'),t('month_6'),t('month_7'),t('month_8'),t('month_9'),t('month_10'),t('month_11')];
      var nextLabel = nextM ? monthNames[nextM - 1] : '';
      // Vérifier si sol trop froid via phénologie
      var pheno = GeoCalendar.getPhenology(veg);
      var soilReason = '';
      if (pheno && climate && climate.monthly) {
        var soilEst = (climate.monthly[currentMonth > 1 ? currentMonth - 2 : 11].tmean + climate.monthly[currentMonth - 1].tmean) / 2;
        if (soilEst < (pheno.minSoilTemp || 10)) {
          soilReason = t('task_notnow_cold_soil').replace('{soil}', Math.round(soilEst)).replace('{min}', pheno.minSoilTemp);
        }
      }
      warnings.push({
        icon: veg.icon,
        name: tVeg(veg.name),
        reason: soilReason || t('task_notnow_out_of_window'),
        nextM: nextLabel,
      });
    });

    if (warnings.length) {
      pasMaintenantHTML = '<div class="prem-today-group prem-today-group-notnow">' + t('today_group_notnow') + '</div>';
      warnings.forEach(function(w) {
        pasMaintenantHTML +=
          '<div class="prem-today-notnow">' +
            '<div class="prem-today-task-icon">' + w.icon + '</div>' +
            '<div style="flex:1;min-width:0;">' +
              '<div class="prem-today-task-text">' + escH(t('task_notnow_title').replace('{name}', w.name)) + '</div>' +
              '<div class="prem-today-task-sub">' + escH(w.reason) + (w.nextM ? ' · ' + t('task_notnow_wait').replace('{month}', w.nextM) : '') + '</div>' +
            '</div>' +
          '</div>';
      });
    }
  }

  el.innerHTML = '<div class="fade-in">' +
    '<div class="prem-today-hero">' +
      '<div class="prem-today-hero-left">' +
        '<div class="prem-today-hero-date">' + dateLabel + '</div>' +
        '<div class="prem-today-hero-count">' + compteurLabel + '</div>' +
      '</div>' +
      (weatherEmoji ? '<div class="prem-today-hero-weather">' +
        '<div class="prem-today-hero-emoji">' + weatherEmoji + '</div>' +
        '<div class="prem-today-hero-temp">' + weatherTemp + '</div>' +
        '<div class="prem-today-hero-info">' + weatherInfo + '</div>' +
      '</div>' : '') +
    '</div>' +
    (total > 0 ?
      '<div class="prem-today-progress">' +
        '<div class="prem-today-progress-bar"><div class="prem-today-progress-fill" style="width:' + pct + '%"></div></div>' +
        '<span class="prem-today-progress-text">' + t('today_progress_done').replace('{done}', nbFaites).replace('{total}', total) + '</span>' +
      '</div>' : '') +
    alertesHTML +
    tachesHTML +
    pasMaintenantHTML +
    termeesHTML +
    harvestStatsHTML +
  '</div>';
}

function toggleWhyPanel(id) {
  var el = document.getElementById(id);
  if (!el) return;
  el.classList.toggle('open');
  var btn = el.previousElementSibling;
  if (btn) btn.classList.toggle('open');
}

function validerTache(key) {
  var todayStr = new Date().toISOString().split('T')[0];
  var taches = generateTasks(APP.weather);
  var tache = null;
  for (var i = 0; i < taches.length; i++) {
    if (taches[i].key === key) { tache = taches[i]; break; }
  }
  if (!APP.completedTasks) APP.completedTasks = [];
  APP.completedTasks.push({ key: key, date: todayStr, text: tache ? tache.text : key });
  saveData();
  renderToday();
}

function toggleTerminees(header) {
  var liste = header.nextElementSibling;
  liste.classList.toggle('ouverte');
  var fleche = header.querySelector('span');
  if (fleche) fleche.textContent = liste.classList.contains('ouverte') ? '▲' : '▼';
}
// ========== PLANNING ==========
// ============================================================
// PRE-REMPLISSAGE INTELLIGENT
// getSuggestedCropSetup(bedId, veggieId)
// Calcule la configuration optimale pour une plantation.
// ============================================================
/**
 * Retourne un setup pre-calcule pour une plantation.
 * {
 *   bedId, veggieId, qty, mode, spacePer,
 *   datePlant, dateHarvest, suggestedQtyLabel
 * }
 */
function getSuggestedCropSetup(bedId, veggieId) {
  var bed = APP.beds.find(function(b) { return b.id === bedId; });
  var veg = APP.vegetables[veggieId];
  if (!veg) return null;

  var today       = new Date();
  var datePlant   = today.toISOString().split('T')[0];
  var spacePer    = veg.spacePerPlant || 0.25;
  var available   = bed ? getBedAvailableSpace(bed, false) : 1;

  // Quantite suggeree : utiliser 60% de l'espace dispo, minimum 1 plant
  var suggestedSurface = available * 0.60;
  var qty = Math.max(1, Math.floor(suggestedSurface / spacePer));

  // Date de recolte estimee
  var dateHarvest = new Date(today);
  dateHarvest.setDate(dateHarvest.getDate() + (veg.daysToHarvest || 60));
  var dateHarvestStr = dateHarvest.toISOString().split('T')[0];

  var surfaceUsed = qty * spacePer;
  var label = qty + ' plant' + (qty > 1 ? 's' : '') + ' \u2248 ' + surfaceUsed.toFixed(2) + ' m\u00B2';

  return {
    bedId:            bedId,
    veggieId:         veggieId,
    qty:              qty,
    mode:             'plant',
    spacePer:         spacePer,
    datePlant:        datePlant,
    dateHarvest:      dateHarvestStr,
    suggestedQtyLabel: label,
    availableSpace:   available
  };
}

// ============================================================
// SYSTEME D'ACTIONS INTELLIGENTES UNIFIE
// getSmartActions(weather) — analyse toutes les sources
// et retourne une liste d'actions ponderees et triees.
//
// Sources analysees :
//   - generateTasks(weather)        -> taches meteo urgentes
//   - getCropStage()                -> recoltes pretes
//   - getBedOccupation()            -> bacs surcharges
//   - getLearningMemory()           -> legumes performants
//   - getSuggestedPlantings()       -> plantations suggeres
//   - APP.crops actifs              -> cultures en retard
//
// Score = urgence(0-40) + proximite(0-30) + apprentissage(0-20) + gain(0-10)
// ============================================================
/**
 * Genere, score et trie toutes les actions intelligentes.
 * @param {Object} weather - donnees meteo (peut etre null)
 * @returns {Array} actions triees par score desc
 */
function getSmartActions(weather) {
  var actions  = [];
  var today    = new Date();
  var todayStr = today.toISOString().split('T')[0];
  var mem      = getLearningMemory();
  var vegP     = mem.vegetableProfiles;
  var seasonCrops = APP.crops.filter(function(c){ return c.season === APP.currentSeason; });

  // ---- SOURCE 1 : Taches meteo urgentes ----
  if (weather) {
    var tasks = generateTasks(weather);
    tasks.forEach(function(t) {
      var urgScore = t.priority === 'urgent' ? 40 : t.priority === 'important' ? 25 : 10;
      actions.push({
        id:          'task-' + t.key,
        type:        'warning',
        icon:        t.priority === 'urgent' ? '🚨' : '⚠️',
        title:       t.text,
        description: t.category,
        priority:    t.priority === 'urgent' ? 'urgent' : t.priority === 'important' ? 'important' : 'suggestion',
        actionType:  'navigate',
        payload:     { target: 'today' },
        _score:      urgScore
      });
    });
  }

  // ---- SOURCE 2 : Recoltes pretes ----
  seasonCrops.filter(function(c){ return c.status === 'active'; }).forEach(function(c) {
    var stage = getCropStage(c);
    var v     = APP.vegetables[c.veggieId];
    if (!v) return;

    if (stage === 'harvest') {
      // Culture prete : score tres eleve
      actions.push({
        id:          'harvest-' + c.id,
        type:        'harvest',
        icon:        v.icon,
        title:       t('plan_action_harvest_title').replace('{name}', tVeg(v.name)),
        description: (function(){ var b = APP.beds.find(function(b){return b.id===c.bedId;}); return b ? t('plan_action_harvest_desc').replace('{bed}', b.name) : t('plan_action_harvest_desc_nobed'); })(),
        priority:    'urgent',
        actionType:  'quick_action',
        payload:     { action: 'harvest', cropId: c.id },
        _score:      38
      });
    }

    // Recoltes en retard (>5 jours apres dateHarvest)
    if (c.dateHarvest) {
      var retard = Math.floor((today - new Date(c.dateHarvest)) / 86400000);
      if (retard > 5 && stage !== 'harvest') {
        actions.push({
          id:          'overdue-' + c.id,
          type:        'harvest',
          icon:        '⏰',
          title:       t('plan_action_overdue_title').replace('{name}', tVeg(v.name)).replace('{n}', retard),
          description: t('plan_action_overdue_desc'),
          priority:    'important',
          actionType:  'quick_action',
          payload:     { action: 'harvest', cropId: c.id },
          _score:      30 + Math.min(10, retard)
        });
      }
    }
  });

  // (occupation élevée = bonne gestion — pas d'action planification)

  // ---- SOURCE 4 : Plantations suggerees (apprentissage) ----
  var suggestions = getSuggestedPlantings('1');
  suggestions.slice(0, 3).forEach(function(sug, idx) {
    var perf = vegP[sug.veggieId];
    var learningBonus = (perf && perf.count >= 2 && perf.avgRatio >= 0.80) ? 15 : 0;
    var setup = getSuggestedCropSetup(sug.bedId, sug.veggieId);
    actions.push({
      id:          'plant-' + sug.veggieId + '-' + sug.bedId,
      type:        'plant',
      icon:        sug.veggie.icon,
      title:       t('plan_action_plant_title').replace('{name}', tVeg(sug.veggie.name)).replace('{bed}', escH(sug.bedName)),
      description: sug.reason + (perf && perf.count >= 1 ? t('plan_action_plant_hist').replace('{pct}', Math.round((perf.avgRatio||0)*100)) : ''),
      priority:    learningBonus > 0 ? 'important' : 'suggestion',
      actionType:  'open_modal',
      payload:     { modalType: 'plan_crop', veggieId: sug.veggieId, bedId: sug.bedId, setup: setup },
      _score:      12 + learningBonus - idx * 2
    });
  });

  // ---- SOURCE 5 : Legumes performants sans culture active ----
  Object.keys(vegP).forEach(function(vid) {
    var p = vegP[vid]; if (p.count < 2 || p.avgRatio < 0.82) return;
    var alreadyActive = seasonCrops.some(function(c){ return c.veggieId === vid && c.status === 'active'; });
    if (alreadyActive) return;
    var veg = APP.vegetables[vid]; if (!veg) return;
    var cal = getPlantingCalendarForVeggie(veg);
    var todayM = today.getMonth() + 1;
    if (!cal || !cal.plantMonths || cal.plantMonths.indexOf(todayM) < 0) return;
    // Trouver le meilleur bac dispo
    var bestBed = null;
    APP.beds.forEach(function(b){ var sp = getBedAvailableSpace(b,false); if(sp >= veg.spacePerPlant && (!bestBed || sp > getBedAvailableSpace(bestBed,false))) bestBed = b; });
    if (!bestBed) return;
    var setup = getSuggestedCropSetup(bestBed.id, vid);
    actions.push({
      id:          'replant-' + vid,
      type:        'plant',
      icon:        veg.icon,
      title:       t('plan_action_replant_title').replace('{name}', tVeg(veg.name)),
      description: t('plan_action_replant_desc').replace('{pct}', Math.round(p.avgRatio*100)).replace('{n}', p.count),
      priority:    'important',
      actionType:  'open_modal',
      payload:     { modalType: 'plan_crop', veggieId: vid, bedId: bestBed.id, setup: setup },
      _score:      18 + Math.round(p.avgRatio * 10)
    });
  });

  // ---- SOURCE 6 : Bacs sous-utilises ----
  APP.beds.forEach(function(bed) {
    var occ = getBedOccupation(bed);
    if (occ >= 30) return;
    var sug = suggestions.find(function(s){ return s.bedId === bed.id; });
    if (!sug) return;
    var setup = getSuggestedCropSetup(bed.id, sug.veggieId);
    actions.push({
      id:          'underused-plant-' + bed.id,
      type:        'optimize',
      icon:        '🌱',
      title:       t('plan_action_exploit_title').replace('{name}', escH(bed.name)).replace('{pct}', occ),
      description: t('plan_action_exploit_desc').replace('{icon}', sug.veggie.icon).replace('{vegname}', tVeg(sug.veggie.name)).replace('{reason}', sug.reason),
      priority:    'suggestion',
      actionType:  'open_modal',
      payload:     { modalType: 'plan_crop', veggieId: sug.veggieId, bedId: bed.id, setup: setup },
      _score:      8
    });
  });

  // ---- DEDUPLICATION + TRI ----
  var seen = {};
  actions = actions.filter(function(a) {
    if (seen[a.id]) return false;
    seen[a.id] = true;
    return true;
  });
  actions.sort(function(a, b) { return (b._score || 0) - (a._score || 0); });

  return actions;
}

// ============================================================
// ============================================================
// REGISTRE D'ACTIONS — évite JSON inline dans les onclick
// ============================================================
var _smartActionRegistry = {};
function registerSmartAction(action) {
  var id = 'sa_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
  _smartActionRegistry[id] = action;
  return id;
}
function executeSmartActionById(id) {
  var action = _smartActionRegistry[id];
  if (!action) return;
  executeSmartAction(action);
}

// EXTENSION DE executeSmartAction
// Gere les nouveaux types : open_modal, quick_action, autofill
// Conserve tous les anciens types intacts.
// ============================================================
/**
 * Execute une action intelligente.
 * Nouveaux types : open_modal, quick_action, autofill
 * Anciens types conserves : plan_crop, quick_add, open_bed, show_analysis, navigate
 */
function executeSmartAction(action) {
  if (!action || !action.actionType) return;
  var p = action.payload || {};

  switch (action.actionType) {

    // ---- NOUVEAU : ouvre le bon modal avec pre-remplissage ----
    case 'open_modal':
      if (p.modalType === 'plan_crop') {
        navigateFromPlus('planning');
        setTimeout(function() {
          // Ouvrir le modal de planification
          openPlanCropModal('1', p.bedId || null);
          // Pre-remplir le legume et la quantite si setup disponible
          setTimeout(function() {
            if (p.veggieId) {
              if (document.getElementById('planVeggie')) selectVpick('planVeggie', p.veggieId);
            }
            if (p.setup) {
              var qtyEl = document.getElementById('planQty');
              if (qtyEl && p.setup.qty) qtyEl.value = p.setup.qty;
              var spEl = document.getElementById('planSpace');
              if (spEl && p.setup.spacePer) spEl.value = p.setup.spacePer;
            }
          }, 80);
        }, 200);
      } else if (p.modalType === 'add_crop') {
        navigateFromPlus('crops');
        setTimeout(function() { openCropModal(null, p.bedId || null); }, 200);
      }
      break;

    // ---- NOUVEAU : action directe (recolte, activation) ----
    case 'quick_action':
      if (p.action === 'harvest' && p.cropId) {
        navigateFromPlus('crops');
        setTimeout(function() { harvestCrop(p.cropId); }, 200);
      } else if (p.action === 'navigate_today') {
        navigate('today');
      }
      break;

    // ---- NOUVEAU : pre-remplissage d'un formulaire ouvert ----
    case 'autofill':
      if (p.fieldMap) {
        Object.keys(p.fieldMap).forEach(function(id) {
          var el = document.getElementById(id);
          if (el) { el.value = p.fieldMap[id]; el.dispatchEvent(new Event('change')); }
        });
      }
      break;

    // ---- Anciens types conserves ----
    case 'plan_crop':
      navigateFromPlus('planning');
      setTimeout(function() { openPlanCropModal('1', p.bedId || null); }, 200);
      break;

    case 'quick_add':
      if (p.action === 'harvest' && p.cropId) {
        navigateFromPlus('crops');
        setTimeout(function() { harvestCrop(p.cropId); }, 200);
      } else {
        navigateFromPlus('crops');
        setTimeout(function() { openCropModal(null, p.bedId || null); }, 200);
      }
      break;

    case 'open_bed':
      navigate('beds');
      if (p.bedId) { setTimeout(function() { showBedDetail(p.bedId); }, 100); }
      break;

    case 'show_analysis':
      navigateFromPlus('analysis');
      break;

    case 'navigate':
      navigateFromPlus(p.target || 'dashboard');
      break;

    default:
      navigateFromPlus('analysis');
  }
}

// ============================================================
// RENDU HTML — SECTION ACTIONS PRIORITAIRES (Planning)
// ============================================================
/**
 * Construit la section "Actions prioritaires" pour renderPlanning.
 * Affiche 1 action principale + jusqu'a 5 secondaires.
 */
function buildSmartActionsSection(weather) {
  var actions = getSmartActions(weather);
  if (actions.length === 0) {
    return '<div class="section-title">\uD83D\uDD25 ' + t('plan_section_prio') + '</div>' +
      '<div class="card" style="text-align:center;color:var(--text-light);padding:16px;font-size:0.85rem;">' + t('plan_prio_empty') + '</div>';
  }

  var html = '<div class="section-title">\uD83D\uDD25 ' + t('plan_section_prio') + '</div>';

  // ---- Action principale (la plus urgente) ----
  var main = actions[0];
  var mainActionId = registerSmartAction({ actionType: main.actionType, payload: main.payload || {} });
  html += '<div class="smart-action-main" onclick="executeSmartActionById(\'' + mainActionId + '\')">' +
    '<div class="smart-action-main-top">' +
      '<div class="smart-action-main-icon">' + main.icon + '</div>' +
      '<div class="smart-action-main-body">' +
        '<div class="smart-action-main-title">' + main.title + '</div>' +
        '<div class="smart-action-main-desc">' + main.description + '</div>' +
      '</div>' +
      '<span class="smart-action-badge ' + (main.priority||'suggestion') + '">' + (main.priority === 'urgent' ? t('plan_badge_urgent') : main.priority === 'important' ? t('plan_badge_important') : t('plan_badge_suggestion')) + '</span>' +
    '</div>' +
    '<button class="smart-action-btn" onclick="event.stopPropagation();executeSmartActionById(\'' + mainActionId + '\')">' + t('plan_btn_do_now') + '</button>' +
  '</div>';

  // ---- Actions secondaires (max 5) ----
  var secondary = actions.slice(1, 6);
  secondary.forEach(function(a) {
    var actionId  = registerSmartAction({ actionType: a.actionType, payload: a.payload || {} });
    var ctaLabel  = a.type === 'harvest' ? t('plan_cta_harvest') : a.type === 'plant' ? t('plan_cta_plant') : a.type === 'fix' ? t('plan_cta_fix') : t('plan_cta_act');
    html += '<div class="smart-action-compact ' + (a.priority||'suggestion') + '" onclick="executeSmartActionById(\'' + actionId + '\')">' +
      '<div class="smart-action-compact-icon">' + a.icon + '</div>' +
      '<div class="smart-action-compact-body">' +
        '<div class="smart-action-compact-title">' + a.title + '</div>' +
        '<div class="smart-action-compact-desc">' + a.description + '</div>' +
      '</div>' +
      '<div class="smart-action-compact-cta">' + ctaLabel + ' \u203A</div>' +
    '</div>';
  });

  return html;
}

/** Echappe une chaine pour l'attribut onclick (guillemets simples) */


// ============================================================
// ========== PLANNING — "Préparer l'avenir" ==========
/**
 * Génère le HTML des suggestions intelligentes (prem-sug-card).
 * Appelé depuis renderPlanning() et renderAi().
 * @param {number} [max=4] — nombre max de suggestions
 */
function buildSmartSuggestionsHTML(max) {
  max = max || 4;
  var sugs = getSuggestedPlantings('1');
  if (sugs.length === 0) return '';
  var mem = getLearningMemory();
  var html = '<div class="section-title">' + t('plan_section_smart_sug') + '</div>';
  sugs.slice(0, max).forEach(function(sug) {
    var vp = mem.vegetableProfiles[sug.veggieId];
    var setup = getSuggestedCropSetup(sug.bedId, sug.veggieId);
    var sugId = registerSmartAction({ actionType:'open_modal', payload:{ modalType:'plan_crop', veggieId:sug.veggieId, bedId:sug.bedId, setup:setup } });
    var sugBedIllus = (typeof getZoneVisual === 'function') ? getZoneVisual(sug.bedId) : '';
    html +=
      '<div class="prem-sug-card" onclick="executeSmartActionById(\'' + sugId + '\')">' +
        (sugBedIllus ? '<div class="prem-sug-illus" aria-hidden="true">' + sugBedIllus + '</div>' : '') +
        '<div class="prem-sug-icon">' + vIcon(sug.veggie, sug.veggieId, 32) + '</div>' +
        '<div style="flex:1;min-width:0;">' +
          '<div class="prem-sug-name">' + t('plan_sug_name').replace('{name}', escH(tVeg(sug.veggie.name))).replace('{bed}', escH(sug.bedName)) + '</div>' +
          '<div class="prem-sug-reason">' + sug.reason + ' \u00B7 ' + sug.available.toFixed(1) + ' ' + t('plan_sug_m2') + '</div>' +
          (vp && vp.count >= 1 ? '<span class="prem-sug-hist">' + t('plan_sug_hist').replace('{pct}', Math.round(vp.avgRatio*100)) + '</span>' : '') +
        '</div>' +
        '<div class="prem-sug-cta">' + t('plan_sug_cta') + '</div>' +
      '</div>';
  });
  return html;
}

function renderPlanning() {
  var el = document.getElementById('pagePlanning');
  document.getElementById('headerTitle').textContent = t('nav_planning');
  document.getElementById('fab').style.display = 'none';
  el.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-light);">\u23F3 ' + t('plan_loading') + '</div>';

  fetchWeather().then(function(weather) {
    // Section 1 : Actions prioritaires
    var actionsHTML = buildSmartActionsSection(weather);

    // Section 2 : Frise saison
    var friseHTML = '<div class="section-title">' + t('plan_section_frise') + '</div>' + renderFrisePlanning();

    // Section 4 : Calendrier et prévisions (existants)
    var forecastHTML = '<div class="section-title">' + t('plan_section_preparation') + '</div>' + renderForecastSection('1m');

    el.innerHTML = '<div class="fade-in">' + actionsHTML + friseHTML + forecastHTML + '</div>';

  }).catch(function(err) {
    console.error('Erreur planning:', err);
    el.innerHTML = '<div class="card" style="background:#fee2e2;color:#991b1b;"><strong>' + t('plan_load_err') + '</strong></div>';
  });
}

function renderFrisePlanning() {
  var today = new Date();
  var _locale = (getAppState('language') || 'fr') === 'en' ? 'en-US' : 'fr-FR';
  var moisNoms = [];
  for (var _mi = 0; _mi < 12; _mi++) {
    moisNoms.push(new Date(2000, _mi, 1).toLocaleString(_locale, { month: 'short' }).replace('.', ''));
  }
  var moisActuel = today.getMonth(); // 0-11

  // Couleurs par statut
  var couleurs = {
    planned:   '#7c3aed',
    active:    '#2d6a4f',
    seedling:  '#eab308',
    growing:   '#22c55e',
    maturing:  '#3b82f6',
    harvest:   '#f97316',
    harvested: '#6b7280'
  };

  // Cultures de la saison actuelle
  var cultures = APP.crops.filter(function(c) { return c.season === APP.currentSeason; });

  if (cultures.length === 0) {
    return '<div class="frise-vide">' + t('plan_frise_empty') + '</div>';
  }
  var html = '';

  // Onglets de vue
  html += '<div class="frise-tabs">' +
    '<button class="frise-tab active" id="frise-tab-saison" onclick="switchFrise(\'saison\')">' + t('plan_frise_tab_full') + '</button>' +
    '<button class="frise-tab" id="frise-tab-6m" onclick="switchFrise(\'6m\')">' + t('plan_frise_tab_6m') + '</button>' +
    '<button class="frise-tab" id="frise-tab-3m" onclick="switchFrise(\'3m\')">' + t('plan_frise_tab_3m') + '</button>' +
  '</div>';

  // Legende
  html += '<div class="frise-legende">' +
    '<div class="frise-legende-item"><div class="frise-dot" style="background:#2d6a4f"></div>' + t('plan_frise_leg_active') + '</div>' +
    '<div class="frise-legende-item"><div class="frise-dot" style="background:#22c55e"></div>' + t('plan_frise_leg_growing') + '</div>' +
    '<div class="frise-legende-item"><div class="frise-dot" style="background:#f97316"></div>' + t('plan_frise_leg_ready') + '</div>' +
    '<div class="frise-legende-item"><div class="frise-dot" style="background:#7c3aed;opacity:0.7"></div>' + t('plan_frise_leg_planned') + '</div>' +
    '<div class="frise-legende-item"><div class="frise-dot" style="background:#6b7280"></div>' + t('plan_frise_leg_harvested') + '</div>' +
  '</div>';

  // Construction frise saison (12 mois)
  html += '<div id="frise-saison">';
  html += buildFriseGrid(cultures, moisNoms, moisActuel, 0, 12, couleurs);
  html += '</div>';

  // Frise 6 mois (cachee par defaut)
  html += '<div id="frise-6m" style="display:none;">';
  html += buildFriseGrid(cultures, moisNoms, moisActuel, 0, 6, couleurs);
  html += '</div>';

  // Frise 3 mois (cachee par defaut)
  html += '<div id="frise-3m" style="display:none;">';
  html += buildFriseGrid(cultures, moisNoms, moisActuel, 0, 3, couleurs);
  html += '</div>';

  return html;
}

function buildFriseGrid(cultures, moisNoms, moisActuel, offsetDebut, nbMois, couleurs, moisNomsFull) {
  var html = '';

  html += '<div class="frise-wrapper">';

  // Header mois
  html += '<div class="frise-mois-header">';
  html += '<div class="frise-mois-spacer"></div>';
  html += '<div class="frise-mois-labels" style="grid-template-columns:repeat(' + nbMois + ',1fr);">';
  for (var m = 0; m < nbMois; m++) {
    var idx = (moisActuel + offsetDebut + m) % 12;
    var isActuel = m === 0 && offsetDebut === 0;
    html += '<div class="frise-mois-label' + (isActuel ? ' actuel' : '') + '">' + moisNoms[idx] + '</div>';
  }
  html += '</div></div>';

  // Lignes par culture
  // Trier : actives d'abord, puis planifiees, puis recoltees
  var sorted = cultures.slice().sort(function(a, b) {
    var ordre = { active:0, planned:1, harvested:2 };
    return (ordre[a.status] || 1) - (ordre[b.status] || 1);
  });

  for (var ci = 0; ci < sorted.length; ci++) {
    var crop = sorted[ci];
    var veg = APP.vegetables[crop.veggieId];
    if (!veg) continue;
    var bed = APP.beds.find(function(b) { return b.id === crop.bedId; });

    // Calculer position et largeur de la barre
    var today = new Date();
    var dateDebut = crop.datePlant ? new Date(crop.datePlant) : null;
    var dateFin   = crop.dateHarvest ? new Date(crop.dateHarvest) : null;

    // Si pas de dates, on ne peut pas tracer
    if (!dateDebut && !dateFin) continue;

    // Fenetre de la frise
    var friseDebut = new Date(today.getFullYear(), today.getMonth() + offsetDebut, 1);
    var friseFin   = new Date(today.getFullYear(), today.getMonth() + offsetDebut + nbMois, 0);
    var friseDuree = friseFin - friseDebut;

    var barreDebut = dateDebut ? Math.max(dateDebut, friseDebut) : friseDebut;
    var barreFin   = dateFin   ? Math.min(dateFin, friseFin)     : friseFin;

    if (barreDebut >= friseFin || barreFin <= friseDebut) continue;

    var pctGauche = Math.max(0, Math.min(100, ((barreDebut - friseDebut) / friseDuree) * 100));
    var pctLargeur = Math.max(2, Math.min(100 - pctGauche, ((barreFin - barreDebut) / friseDuree) * 100));

    var stage = getCropStage(crop);
    var couleur = couleurs[stage] || couleurs[crop.status] || '#9ca3af';
    var opacity = crop.status === 'planned' ? '0.75' : '1';

    var label = vIcon(veg, crop.veggieId, 18) + ' ' + escH(tVeg(veg.name));

    html += '<div class="frise-ligne">' +
      '<div class="frise-nom">' +
        '<span>' + vIcon(veg, crop.veggieId, 18) + ' ' + escH(tVeg(veg.name)) + '</span>' +
        (bed ? '<span class="frise-bac-label">' + escH(bed.name) + '</span>' : '') +
      '</div>' +
      '<div class="frise-track">' +
        '<div class="frise-barre" ' +
          'style="left:' + pctGauche.toFixed(1) + '%;width:' + pctLargeur.toFixed(1) + '%;background:' + couleur + ';opacity:' + opacity + ';" ' +
          'onclick="navigate(\'crops\')" title="' + escH(tVeg(veg.name)) + '">' +
          label +
        '</div>' +
      '</div>' +
    '</div>';
  }

  html += '</div>'; // close frise-wrapper

  // Marqueur "aujourd'hui"
  html += '<div class="frise-today-marker">' + t('plan_frise_today') + ' ' + fmtDate(new Date(), {day:'numeric', month:'long'}) + '</div>';

  return html;
}

function switchFrise(vue) {
  var ids = ['saison', '6m', '3m'];
  for (var i = 0; i < ids.length; i++) {
    var el = document.getElementById('frise-' + ids[i]);
    var tab = document.getElementById('frise-tab-' + ids[i]);
    if (el) el.style.display = ids[i] === vue ? '' : 'none';
    if (tab) { tab.classList.remove('active'); if (ids[i] === vue) tab.classList.add('active'); }
  }
}

function renderBlocTaches(taches, todayStr) {
  if (taches.length === 0) {
    return '<div class="section-title">' + t('plan_section_tasks') + '</div>' +
      '<div class="card" style="text-align:center;color:var(--text-light);padding:20px;">' + t('plan_tasks_empty') + '</div>';
  }

  var catIcons = { 'Recolte':'🎉','Arrosage':'💧','Protection meteo':'🛡️','Tuteurage':'🌿','Entretien':'🔧','Rotation':'🔄' };
  var catNames = { 'Recolte': t('plan_cat_harvest'), 'Arrosage': t('plan_cat_water'), 'Protection meteo': t('plan_cat_weather'), 'Tuteurage': t('plan_cat_stake'), 'Entretien': t('plan_cat_maintenance'), 'Rotation': t('plan_cat_rotation') };
  var cats = {};
  for (var i = 0; i < taches.length; i++) {
    var tch = taches[i];
    if (!cats[tch.category]) cats[tch.category] = [];
    cats[tch.category].push(tch);
  }

  var html = '<div class="section-title">' + t('plan_section_tasks') + ' (' + taches.length + ')</div>';
  var catKeys = Object.keys(cats);
  for (var c = 0; c < catKeys.length; c++) {
    var cat = catKeys[c];
    var liste = cats[cat];
    html += '<div class="tasks-group-title">' + (catIcons[cat] || '📌') + ' ' + (catNames[cat] || cat) + ' (' + liste.length + ')</div>';
    for (var ti = 0; ti < liste.length; ti++) {
      var task = liste[ti];
      var pClass = task.priority === 'urgent' ? 'priority-urgent' : task.priority === 'important' ? 'priority-important' : 'priority-info';
      var pBadge = task.priority === 'urgent' ? '<span class="badge badge-red">' + t('plan_badge_urgent') + '</span>' : task.priority === 'important' ? '<span class="badge badge-orange">' + t('plan_badge_important') + '</span>' : '<span class="badge badge-green">' + t('plan_badge_info') + '</span>';
      var isRecolte = task.key.indexOf('harvest-') === 0 && task.category === 'Recolte';
      var cropId = isRecolte ? task.key.replace('harvest-', '') : null;
      html += '<div class="card task-card ' + pClass + '">' +
        '<div class="task-card-header"><div class="task-text">' + escH(task.text) + '</div>' + pBadge + '</div>' +
        '<div class="task-actions">' +
          '<button class="btn btn-sm btn-primary" onclick="validerTachePlanning(\'' + task.key + '\')">✅ Fait</button>' +
          (isRecolte && cropId ? '<button class="btn btn-sm btn-secondary" onclick="harvestCrop(\'' + cropId + '\')">🎉 Recolter</button>' : '') +
        '</div>' +
      '</div>';
    }
  }

  // Taches terminees aujourd'hui
  var faites = (APP.completedTasks || []).filter(function(t) { return t.date === todayStr; });
  if (faites.length > 0) {
    html += '<div class="collapsible-header" onclick="toggleCollapsible(this)">\u2705 ' + t('plan_tasks_done').replace('{n}', faites.length) + ' <span class="arrow">\u25BC</span></div>';
    html += '<div class="collapsible-body">';
    for (var f = 0; f < faites.length; f++) {
      html += '<div class="card" style="padding:10px 14px;opacity:0.6;"><s>' + escH(faites[f].text) + '</s></div>';
    }
    html += '</div>';
  }

  return html;
}

function validerTachePlanning(key) {
  var todayStr = new Date().toISOString().split('T')[0];
  var taches = generateTasks(APP.weather);
  var tache = null;
  for (var i = 0; i < taches.length; i++) { if (taches[i].key === key) { tache = taches[i]; break; } }
  if (!APP.completedTasks) APP.completedTasks = [];
  APP.completedTasks.push({ key: key, date: todayStr, text: tache ? tache.text : key });
  saveData();
  renderPlanning();
}

function renderPlanningForecastBlock(filter) {
  return (
    '<div id="planningForecastBlock">' +
      '<div class="section-title">\uD83D\uDDD3\uFE0F Pr\u00e9paration de la saison</div>' +
      renderForecastSection(filter) +
      renderSimplePlantingCalendar() +
      renderVisualCalendar() +
    '</div>'
  );
}
function renderPlanning_OBSOLETE_SUPPRIME() {
  // Cette fonction a ete remplacee par la nouvelle renderPlanning plus haut
  var el = document.getElementById('pagePlanning');
  document.getElementById('headerTitle').textContent = t('nav_planning');
  document.getElementById('fab').style.display = 'none';

  el.innerHTML =
    '<div class="skel-page" style="padding:0;">' +
      '<div class="skel" style="width:100%;height:44px;border-radius:14px;margin-bottom:12px;"></div>' +
      '<div class="skel" style="width:140px;height:10px;border-radius:5px;margin-bottom:12px;"></div>' +
      '<div class="skel-card" style="height:64px;border-radius:16px;margin-bottom:7px;"></div>' +
      '<div class="skel-card" style="height:64px;border-radius:16px;margin-bottom:7px;"></div>' +
      '<div class="skel-card" style="height:64px;border-radius:16px;margin-bottom:7px;"></div>' +
    '</div>';

  fetchWeather().then(function(weather) {
    var allTasks = generateTasks(weather);
    var todayStr = new Date().toISOString().split('T')[0];
    var currentFilter = currentPlanningFilter || 'today';

    var filterHTML = '';

    var categories = {};
    for (var i = 0; i < allTasks.length; i++) {
      var tk = allTasks[i];
      if (!categories[tk.category]) categories[tk.category] = [];
      categories[tk.category].push(tk);
    }

    var categoryIcons = {
      'Recolte': '🎉',
      'Arrosage': '💧',
      'Protection meteo': '🛡️',
      'Tuteurage': '🌿',
      'Entretien': '🔧',
      'Rotation': '🔄'
    };
    var categoryNames2 = { 'Recolte': t('plan_cat_harvest'), 'Arrosage': t('plan_cat_water'), 'Protection meteo': t('plan_cat_weather'), 'Tuteurage': t('plan_cat_stake'), 'Entretien': t('plan_cat_maintenance'), 'Rotation': t('plan_cat_rotation') };

    var tasksHTML = '';

    if (allTasks.length === 0) {
      tasksHTML =
        '<div class="empty-state">' +
          '<div class="empty-icon">\u2705</div>' +
          '<div class="empty-text">' + t('plan_tasks_empty2') + '</div>' +
        '</div>';
    } else {
      var catKeys = Object.keys(categories);

      for (var c = 0; c < catKeys.length; c++) {
        var cat = catKeys[c];
        var catTasks = categories[cat];

        catTasks.sort(function(a, b) {
          var p = { urgent: 0, important: 1, info: 2 };
          return (p[a.priority] || 2) - (p[b.priority] || 2);
        });

        tasksHTML += '<div class="tasks-group-title">' + (categoryIcons[cat] || '📌') + ' ' + (categoryNames2[cat] || cat) + ' (' + catTasks.length + ')</div>';

        for (var ti = 0; ti < catTasks.length; ti++) {
          var task = catTasks[ti];
          var pClass = task.priority === 'urgent'
            ? 'priority-urgent'
            : task.priority === 'important'
              ? 'priority-important'
              : 'priority-info';

          var pBadge = task.priority === 'urgent'
            ? '<span class="badge badge-red">' + t('plan_badge_urgent') + '</span>'
            : task.priority === 'important'
              ? '<span class="badge badge-orange">' + t('plan_badge_important') + '</span>'
              : '<span class="badge badge-green">' + t('plan_badge_info') + '</span>';

          var isHarvest = task.key.indexOf('harvest-') === 0 && task.category === 'Recolte';
          var cropId = isHarvest ? task.key.replace('harvest-', '') : null;

          tasksHTML +=
            '<div class="card task-card ' + pClass + '">' +
              '<div class="task-card-header">' +
                '<div class="task-text">' + escH(task.text) + '</div>' +
                pBadge +
              '</div>' +
              '<div class="task-actions">' +
                '<button class="btn btn-sm btn-primary" onclick="completeTask(\'' + task.key + '\')">✅ Fait</button>' +
                (isHarvest && cropId
                  ? '<button class="btn btn-sm btn-secondary" onclick="harvestCrop(\'' + cropId + '\')">🎉 Recolter</button>'
                  : '') +
              '</div>' +
            '</div>';
        }
      }
    }

    var todayCompleted = (APP.completedTasks || []).filter(function(t) {
      return t.date === todayStr;
    });

    var completedHTML = '';
    if (todayCompleted.length > 0) {
      completedHTML =
        '<div class="collapsible-header" onclick="toggleCollapsible(this)">' +
          '\u2705 ' + t('plan_tasks_done').replace('{n}', todayCompleted.length) + ' <span class="arrow">\u25BC</span>' +
        '</div>' +
        '<div class="collapsible-body">';

      for (var ct = 0; ct < todayCompleted.length; ct++) {
        completedHTML += '<div class="card" style="padding:10px 14px;opacity:0.6;"><s>' + escH(todayCompleted[ct].text) + '</s></div>';
      }

      completedHTML += '</div>';
    }

    el.innerHTML =
      '<div class="fade-in">' +
        filterHTML +
        '<div id="planningTasksBlock">' + tasksHTML + completedHTML + '</div>' +
        renderPlanningForecastBlock(currentFilter) +
      '</div>';
  }).catch(function(err) {
    console.error('Erreur renderPlanning:', err);
    el.innerHTML =
      '<div class="card" style="background:#fee2e2;color:#991b1b;">' +
        '<strong>Erreur de chargement du planning.</strong>' +
      '</div>';
  });
}

function renderPlanningTasks(tasks) {
  var todayStr = new Date().toISOString().split('T')[0];

  var categories = {};
  for (var i = 0; i < tasks.length; i++) {
    var tk2 = tasks[i];
    if (!categories[tk2.category]) categories[tk2.category] = [];
    categories[tk2.category].push(tk2);
  }

  var categoryIcons = {
    'Recolte': '🎉',
    'Arrosage': '💧',
    'Protection meteo': '🛡️',
    'Tuteurage': '🌿',
    'Entretien': '🔧',
    'Rotation': '🔄'
  };
  var categoryNames = { 'Recolte': t('plan_cat_harvest'), 'Arrosage': t('plan_cat_water'), 'Protection meteo': t('plan_cat_weather'), 'Tuteurage': t('plan_cat_stake'), 'Entretien': t('plan_cat_maintenance'), 'Rotation': t('plan_cat_rotation') };

  var tasksHTML = '';
  if (tasks.length === 0) {
    tasksHTML = '<div class="empty-state"><div class="empty-icon">\u2705</div><div class="empty-text">' + t('plan_tasks_empty2') + '</div></div>';
  } else {
    var catKeys = Object.keys(categories);
    for (var c = 0; c < catKeys.length; c++) {
      var cat = catKeys[c];
      var catTasks = categories[cat];

      tasksHTML += '<div class="tasks-group-title">' + (categoryIcons[cat] || '📌') + ' ' + (categoryNames[cat] || cat) + ' (' + catTasks.length + ')</div>';

      catTasks.sort(function(a, b) {
        var p = { urgent: 0, important: 1, info: 2 };
        return (p[a.priority] || 2) - (p[b.priority] || 2);
      });

      for (var ti = 0; ti < catTasks.length; ti++) {
        var task = catTasks[ti];
        var pClass = task.priority === 'urgent' ? 'priority-urgent' : task.priority === 'important' ? 'priority-important' : 'priority-info';
        var pBadge = task.priority === 'urgent'
          ? '<span class="badge badge-red">' + t('plan_badge_urgent') + '</span>'
          : task.priority === 'important'
            ? '<span class="badge badge-orange">' + t('plan_badge_important') + '</span>'
            : '<span class="badge badge-green">' + t('plan_badge_info') + '</span>';

        var isHarvest = task.key.indexOf('harvest-') === 0 && task.category === 'Recolte';
        var cropId = isHarvest ? task.key.replace('harvest-', '') : null;

        tasksHTML += '<div class="card task-card ' + pClass + '">' +
          '<div class="task-card-header"><div class="task-text">' + escH(task.text) + '</div>' + pBadge + '</div>' +
          '<div class="task-actions">' +
          '<button class="btn btn-sm btn-primary" onclick="completeTask(\'' + task.key + '\')">✅ Fait</button>' +
          (isHarvest && cropId ? '<button class="btn btn-sm btn-secondary" onclick="harvestCrop(\'' + cropId + '\')">🎉 Recolter</button>' : '') +
          '</div></div>';
      }
    }
  }

  var todayCompleted = (APP.completedTasks || []).filter(function(t) {
    return t.date === todayStr;
  });

  var completedHTML = '';
  if (todayCompleted.length > 0) {
    completedHTML = '<div class="collapsible-header" onclick="toggleCollapsible(this)">' +
      '\u2705 ' + t('plan_tasks_done').replace('{n}', todayCompleted.length) + ' <span class="arrow">\u25BC</span></div>' +
      '<div class="collapsible-body">';
    for (var ct = 0; ct < todayCompleted.length; ct++) {
      completedHTML += '<div class="card" style="padding:10px 14px;opacity:0.6;"><s>' + escH(todayCompleted[ct].text) + '</s></div>';
    }
    completedHTML += '</div>';
  }

  return tasksHTML + completedHTML;
}

function filterTasksByPlanningMode(tasks, filter) {
  if (filter === 'all' || filter === 'today' || filter === 'week') {
    return tasks;
  }

  if (filter === '1m' || filter === '2m' || filter === '3m' || filter === 'next') {
    return [];
  }

  return tasks;
}

function filterPlanning(filter) {
  currentPlanningFilter = filter;

  document.querySelectorAll('#planningFilters .filter-btn').forEach(function(b) {
    b.classList.remove('active');
  });

  var btn = document.querySelector('#planningFilters .filter-btn[data-pfilter="' + filter + '"]');
  if (btn) btn.classList.add('active');

  var tasksBlock = document.getElementById('planningTasksBlock');
  if (tasksBlock) {
    var showTasks =
      filter === 'today' ||
      filter === 'week' ||
      filter === 'all';

    tasksBlock.style.display = showTasks ? '' : 'none';
  }

  var forecastBlock = document.getElementById('planningForecastBlock');
  if (forecastBlock) {
    forecastBlock.outerHTML = renderPlanningForecastBlock(filter);
  }
}

function completeTask(key) {
  var todayStr = new Date().toISOString().split('T')[0];
  var tasks = generateTasks(APP.weather);
  var task = tasks.find(function(t) { return t.key === key; });
  if (!APP.completedTasks) APP.completedTasks = [];
  APP.completedTasks.push({ key: key, date: todayStr, text: task ? task.text : key });
  saveData();
  renderPlanning();
}
function toggleCollapsible(header) {
  header.classList.toggle('open');
  var body = header.nextElementSibling;
  if (body) body.classList.toggle('open');
}
