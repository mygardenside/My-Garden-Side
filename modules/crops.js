// Green Vibes — modules/crops.js
// Gestion des cultures
// ========== CROPS ==========

// ========== VEGGIE PICKER — dropdown custom avec visuels ==========
/**
 * Construit un picker de légumes avec icônes SVG.
 * @param {string} pickId   — id du <select> caché (ex: 'cropVeggie')
 * @param {Array}  items    — [{id, v, badge?}] où badge est du texte optionnel
 * @param {string} selectedId — id du légume pré-sélectionné
 */
function buildVeggiePicker(pickId, items, selectedId) {
  var hiddenOptions = '';
  var listHTML = '';
  var selIcon = '<span style="font-size:1.3rem;">🌱</span>';
  var selName = items.length ? escH(tVeg(items[0].v.name)) : '---';

  if (!selectedId && items.length) selectedId = items[0].id;

  items.forEach(function(item) {
    var v = item.v, id = item.id;
    var isSel = id === selectedId;
    hiddenOptions += '<option value="' + id + '"' + (isSel ? ' selected' : '') + '>' + escH(tVeg(v.name)) + '</option>';
    if (isSel) {
      selIcon = vIcon(v, id, 28);
      selName = escH(tVeg(v.name));
    }
    listHTML +=
      '<div class="vpick-item' + (isSel ? ' vpick-item--selected' : '') + '" ' +
          'data-id="' + id + '" data-name="' + escH(tVeg(v.name)).toLowerCase() + '" ' +
          'onclick="selectVpick(\'' + pickId + '\',\'' + id + '\')">' +
        '<span class="vpick-item-icon">' + vIcon(v, id, 28) + '</span>' +
        '<span class="vpick-item-name">' + escH(tVeg(v.name)) + '</span>' +
        (item.badge ? '<span class="vpick-item-badge">' + item.badge + '</span>' : '') +
      '</div>';
  });

  return (
    '<select id="' + pickId + '" style="display:none;">' + hiddenOptions + '</select>' +
    '<div class="vpick-wrap" id="' + pickId + '_pick">' +
      '<div class="vpick-selected" onclick="toggleVpick(\'' + pickId + '\')">' +
        '<span class="vpick-sel-icon" id="' + pickId + '_selIcon">' + selIcon + '</span>' +
        '<span class="vpick-sel-name" id="' + pickId + '_selName">' + selName + '</span>' +
        '<span class="vpick-chevron">▾</span>' +
      '</div>' +
      '<div class="vpick-dropdown" id="' + pickId + '_drop">' +
        '<input class="vpick-search" type="text" placeholder="🔍 Chercher…" ' +
          'oninput="filterVpick(\'' + pickId + '\',this.value)">' +
        '<div class="vpick-list" id="' + pickId + '_list">' + listHTML + '</div>' +
      '</div>' +
    '</div>'
  );
}

function toggleVpick(pickId) {
  var wrap = document.getElementById(pickId + '_pick');
  if (!wrap) return;
  var isOpen = wrap.classList.toggle('open');
  if (isOpen) {
    var search = wrap.querySelector('.vpick-search');
    if (search) { search.value = ''; filterVpick(pickId, ''); search.focus(); }
  }
}

function filterVpick(pickId, query) {
  var list = document.getElementById(pickId + '_list');
  if (!list) return;
  var q = (query || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  list.querySelectorAll('.vpick-item').forEach(function(el) {
    var name = (el.dataset.name || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    el.style.display = (!q || name.indexOf(q) >= 0) ? '' : 'none';
  });
}

function selectVpick(pickId, veggieId) {
  var sel = document.getElementById(pickId);
  if (!sel) return;
  sel.value = veggieId;
  // Déclencher l'événement change pour les listeners existants
  var ev = document.createEvent('Event');
  ev.initEvent('change', true, true);
  sel.dispatchEvent(ev);
  // Mettre à jour l'affichage
  var v = APP.vegetables[veggieId];
  if (v) {
    var iconEl = document.getElementById(pickId + '_selIcon');
    var nameEl = document.getElementById(pickId + '_selName');
    if (iconEl) iconEl.innerHTML = vIcon(v, veggieId, 28);
    if (nameEl) nameEl.textContent = tVeg(v.name);
    // Marquer l'item sélectionné
    var list = document.getElementById(pickId + '_list');
    if (list) {
      list.querySelectorAll('.vpick-item').forEach(function(el) {
        el.classList.toggle('vpick-item--selected', el.dataset.id === veggieId);
      });
    }
  }
  // Fermer le dropdown
  var wrap = document.getElementById(pickId + '_pick');
  if (wrap) wrap.classList.remove('open');
}

// ========== CULTURES — "Gérer mes cultures" ==========
function renderCrops() {
  var el = document.getElementById('pageCrops');
  document.getElementById('headerTitle').textContent = t('crops_header');
  document.getElementById('fab').style.display = 'flex';
  try {
    var seasonCrops = getAppState('crops').filter(function(c) { return c.season === getAppState('currentSeason'); });
    if (seasonCrops.length === 0) {
      el.innerHTML =
        '<div class="empty-state fade-in"><div class="empty-icon">\uD83E\uDD6C</div>' +
        '<div class="empty-text">' + t('crops_empty') + '</div>' +
        '<button class="btn btn-primary" onclick="openCropModal()">' + t('crops_add_btn') + '</button></div>';
      return;
    }

    // Compteurs par stade pour les badges de filtre
    var counts = { all: seasonCrops.length, planned:0, seedling:0, growing:0, maturing:0, harvest:0, harvested:0 };
    seasonCrops.forEach(function(c) {
      var st = getCropStage(c);
      if (counts[st] !== undefined) counts[st]++;
    });

    var stages = ['all','planned','seedling','growing','maturing','harvest','harvested'];
    var stageLabels = { all:t('stage_all'), planned:t('stage_planned'), seedling:t('stage_seedling'), growing:t('stage_growing'), maturing:t('stage_maturing'), harvest:t('stage_harvest'), harvested:t('stage_harvested') };
    var filterHTML = '<div class="filter-bar" id="cropFilters">';
    stages.forEach(function(s) {
      var cnt = counts[s] || 0;
      var badge = (s !== 'all' && cnt > 0) ? ' <span style="background:rgba(0,0,0,0.12);border-radius:8px;padding:0 5px;font-size:0.7em">' + cnt + '</span>' : '';
      filterHTML += '<button class="filter-btn ' + (s === 'all' ? 'active' : '') + '" data-filter="' + s + '" onclick="filterCrops(\'' + s + '\')">' + stageLabels[s] + badge + '</button>';
    });
    filterHTML += '</div>';

    var cropsHTML = '';
    // Trier : prets a recolter en premier, puis actifs, puis planifies, puis recoltes
    var stageOrder = { harvest:0, maturing:1, growing:2, seedling:3, planned:4, harvested:5 };
    var sorted = seasonCrops.slice().sort(function(a,b) {
      return (stageOrder[getCropStage(a)]||9) - (stageOrder[getCropStage(b)]||9);
    });

    sorted.forEach(function(c) {
      var v = getAppState('vegetables')[c.veggieId]; if (!v) return;
      var stage    = getCropStage(c);
      var stClass  = getStageBadgeClass(stage);
      var stColor  = getStageColor(stage);
      var bed      = APP.beds.find(function(b) { return b.id === c.bedId; });
      var surface  = getCropSurface(c);
      var estYield = getCropEstimatedYield(c);
      var isReady  = stage === 'harvest';
      var isPlanned= c.status === 'planned';

      // Barre de progression visuelle du stade
      var stageRatio = { planned:0, seedling:0.15, growing:0.45, maturing:0.75, harvest:1, harvested:1 };
      var pct = Math.round((stageRatio[stage]||0) * 100);

      cropsHTML +=
        '<div class="card crop-card' + (isPlanned ? ' crop-planned' : '') + (isReady ? ' crop-ready' : '') + '" data-stage="' + stage + '">' +
          // En-tete
          '<div class="crop-card-header">' +
            '<div style="display:flex;align-items:center;gap:10px;">' +
              '<div style="width:44px;height:44px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">' + vIcon(v, c.veggieId, 44) + '</div>' +
              '<div>' +
                '<div class="crop-card-name">' + escH(tVeg(v.name)) + '</div>' +
                '<div style="font-size:0.72rem;color:var(--text-light);margin-top:1px;">' + (bed ? '\uD83D\uDCCD ' + escH(bed.name) : t('crops_no_bed')) + '</div>' +
              '</div>' +
            '</div>' +
            '<span class="badge ' + stClass + '">' + getStageName(stage) + '</span>' +
          '</div>' +
          // Barre de progression stade
          (isPlanned ? '' :
            '<div style="height:3px;background:#f3f4f6;border-radius:2px;margin:10px 0 8px;overflow:hidden;">' +
            '<div style="height:100%;width:' + pct + '%;background:' + stColor + ';border-radius:2px;transition:width 0.6s ease;"></div></div>'
          ) +
          // Infos compactes
          '<div style="display:flex;gap:16px;flex-wrap:wrap;font-size:0.78rem;color:var(--text-light);margin-bottom:8px;">' +
            '<span>' + (c.mode === 'plant' ? c.qty + ' plants' : c.qty + ' m\u00B2') + ' \u00B7 ' + surface.toFixed(2) + ' m\u00B2</span>' +
            '<span>~' + estYield.toFixed(1) + t('crops_lbl_est_yield') + (c.partialHarvests && c.partialHarvests.length > 0 ? ' · <strong style="color:var(--brand-700);">' + t('crops_partial_count').replace('{n}', c.partialHarvests.length).replace('{kg}', (c.yieldReal || 0).toFixed(1)) + '</strong>' : (c.yieldReal ? t('crops_lbl_real_yield').replace('{kg}', c.yieldReal) : '')) + '</span>' +
          '</div>' +
          (c.datePlant || c.dateHarvest ?
            '<div style="font-size:0.73rem;color:var(--text-xlight,#9ca3af);">' +
            (c.datePlant ? (isPlanned ? t('crops_lbl_planned_plant') : t('crops_lbl_planted')) + fmtDate(new Date(c.datePlant)) : '') +
            (c.datePlant && c.dateHarvest ? ' \u00B7 ' : '') +
            (c.dateHarvest && c.status !== 'harvested' ? t('crops_lbl_harvest_date') + fmtDate(new Date(c.dateHarvest)) : '') +
            '</div>' : '') +
          // Actions
          '<div class="crop-actions">' +
            (c.status === 'harvested'
              ? '<button class="btn btn-sm btn-secondary" onclick="undoHarvest(\'' + c.id + '\')">' + t('crops_btn_undo_harvest') + '</button>' +
                '<button class="btn btn-sm btn-danger" onclick="deleteCrop(\'' + c.id + '\')">\uD83D\uDDD1\uFE0F</button>'
              : (isReady ? '<button class="btn btn-sm btn-primary" onclick="harvestCrop(\'' + c.id + '\')">' + t('crops_btn_harvest') + '</button>' :
                 c.status === 'active' ? '<button class="btn btn-sm btn-secondary" onclick="harvestCrop(\'' + c.id + '\')">' + t('crops_btn_harvest') + '</button>' : '') +
                '<button class="btn btn-sm btn-secondary" onclick="openCropModal(\'' + c.id + '\')">' + t('crops_btn_edit') + '</button>' +
                '<button class="btn btn-sm btn-secondary" onclick="openMoveCropModal(\'' + c.id + '\')">' + t('crops_btn_move') + '</button>' +
                '<button class="btn btn-sm btn-danger" onclick="deleteCrop(\'' + c.id + '\')">\uD83D\uDDD1\uFE0F</button>') +
          '</div>' +
        '</div>';
    });
    el.innerHTML = '<div class="fade-in">' + filterHTML + cropsHTML + '</div>';
  } catch (e) {
    el.innerHTML = '<div style="padding:20px;background:#b91c1c;color:white;border-radius:12px;"><strong>' + t('crops_err_render') + '</strong><br>' + e.message + '</div>';
    console.error('Erreur renderCrops:', e);
  }
}
function filterCrops(stage) {
  document.querySelectorAll('#cropFilters .filter-btn').forEach(function(b) { b.classList.remove('active'); });
  var activeBtn = document.querySelector('#cropFilters .filter-btn[data-filter="' + stage + '"]');
  if (activeBtn) activeBtn.classList.add('active');
  document.querySelectorAll('.crop-card').forEach(function(card) {
    if (stage === 'all' || card.dataset.stage === stage) card.style.display = '';
    else card.style.display = 'none';
  });
}
function openCropModal(editId, presetBedId, presetVeggieId) {
  var crop = editId ? APP.crops.find(function(c) { return c.id === editId; }) : null;
  var title = crop ? t('crops_modal_edit') : t('crops_modal_new');
  var veggieItems = Object.keys(APP.vegetables).map(function(id) {
    return { id: id, v: APP.vegetables[id] };
  }).sort(function(a, b) { return tVeg(a.v.name).localeCompare(tVeg(b.v.name), 'fr'); });
  var veggiePickerHTML = buildVeggiePicker('cropVeggie', veggieItems, crop ? crop.veggieId : (presetVeggieId || null));
  var bedOptions = '<option value="">' + t('crops_no_bed') + '</option>';
  for (var j = 0; j < APP.beds.length; j++) {
    var b = APP.beds[j];
    var selected = (crop && crop.bedId === b.id) || (!crop && presetBedId === b.id);
    bedOptions += '<option value="' + b.id + '"' + (selected ? ' selected' : '') + '>' + escH(b.name) + '</option>';
  }
  var selectedMode = crop ? crop.mode : 'plant';
  var selectedStartType = crop ? (crop.startType || 'plant') : 'plant';
  var today = new Date().toISOString().split('T')[0];
  openModal(
    '<div class="modal-header"><div class="modal-title">' + title + '</div><button class="modal-close" onclick="closeModal()">&times;</button></div>' +
    '<div class="form-group"><label class="form-label">' + t('crops_lbl_veggie') + '</label>' + veggiePickerHTML + '</div>' +
    '<div class="form-group"><label class="form-label">' + t('crops_lbl_bed') + '</label><select class="form-select" id="cropBed">' + bedOptions + '</select></div>' +
    '<div class="form-group"><label class="form-label">' + t('crops_lbl_start_type') + '</label>' +
    '<select class="form-select" id="cropStartType">' +
    '<option value="plant"' + (selectedStartType === 'plant' ? ' selected' : '') + '>' + t('plan_lbl_young_plant') + '</option>' +
    '<option value="seed"' + (selectedStartType === 'seed' ? ' selected' : '') + '>' + t('plan_lbl_seed') + '</option>' +
    '</select></div>' +
    '<div class="form-group"><label class="form-label">' + t('plan_lbl_mode') + '</label>' +
    '<select class="form-select" id="cropMode" onchange="updateCropModeHint()">' +
    '<option value="plant"' + (selectedMode === 'plant' ? ' selected' : '') + '>' + t('plan_lbl_mode_plants') + '</option>' +
    '<option value="surface"' + (selectedMode === 'surface' ? ' selected' : '') + '>' + t('plan_lbl_mode_surface') + '</option>' +
    '</select></div>' +
    '<div class="form-row">' +
    '<div class="form-group"><label class="form-label" id="cropQtyLabel">' + (selectedMode === 'plant' ? t('plan_lbl_qty_plants') : t('plan_lbl_qty_surface')) + '</label>' +
    '<input type="number" step="0.1" class="form-input" id="cropQty" value="' + (crop ? crop.qty : '') + '"></div>' +
    '<div class="form-group" id="cropSpaceGroup" style="' + (selectedMode === 'surface' ? 'display:none' : '') + '">' +
    '<label class="form-label">' + t('plan_lbl_spacing') + '</label>' +
    '<input type="number" step="0.01" class="form-input" id="cropSpace" value="' + (crop ? (crop.spacePer || '') : '') + '">' +
    '</div></div>' +
    '<div class="form-hint" id="cropCalcHint"></div>' +
    '<div class="form-hint" id="cropSpaceHint"></div>' +
    '<div class="form-row">' +
    '<div class="form-group"><label class="form-label">' + t('crops_lbl_date_plant') + '</label><input type="date" class="form-input" id="cropDatePlant" value="' + (crop ? (crop.datePlant || '') : today) + '"></div>' +
    '<div class="form-group"><label class="form-label">' + t('crops_lbl_date_harvest') + '</label><input type="date" class="form-input" id="cropDateHarvest" value="' + (crop ? (crop.dateHarvest || '') : '') + '"></div>' +
    '</div>' +
    '<div class="form-group"><label class="form-label">' + t('beds_lbl_notes') + '</label><textarea class="form-textarea" id="cropNotes">' + (crop ? escH(crop.notes || '') : '') + '</textarea></div>' +
    '<div id="cropRotationWarning"></div>' +
    '<div id="cropCompanionInfo"></div>' +
    '<div class="modal-actions">' +
    '<button class="btn btn-secondary" onclick="closeModal()">' + t('btn_cancel') + '</button>' +
    '<button class="btn btn-primary" onclick="saveCrop(\'' + (editId || '') + '\')">' + (crop ? t('btn_edit_label') : t('btn_add_label')) + '</button>' +
    '</div>'
  );
  updateCropModeHint();
  updateCropAutoHarvest(false);
  document.getElementById('cropBed').addEventListener('change', updateCropSpaceHint);
  document.getElementById('cropMode').addEventListener('change', updateCropSpaceHint);
  document.getElementById('cropQty').addEventListener('input', updateCropSpaceHint);
  document.getElementById('cropSpace').addEventListener('input', updateCropSpaceHint);
  document.getElementById('cropVeggie').addEventListener('change', updateCropSpaceHint);
  document.getElementById('cropVeggie').addEventListener('change', function() {
    updateCropDefaultSpace(true);
    updateCropAutoHarvest(true);
    updateCropCompanion();
  });
  document.getElementById('cropBed').addEventListener('change', updateCropCompanion);
  document.getElementById('cropDatePlant').addEventListener('change', function() {
    updateCropAutoHarvest(true);
  });
  if (!crop) updateCropDefaultSpace();
  checkCropRotation();
  updateCropCompanion();

  updateCropSpaceHint();
}
function updateCropModeHint() {
  var mode = document.getElementById('cropMode').value;
  document.getElementById('cropQtyLabel').textContent = mode === 'plant' ? t('plan_lbl_qty_plants') : t('plan_lbl_qty_surface');
  document.getElementById('cropSpaceGroup').style.display = mode === 'surface' ? 'none' : '';
}
function updateCropDefaultSpace(force) {
  var vid = document.getElementById('cropVeggie').value;
  var v = APP.vegetables[vid];
  if (v) {
    var spaceEl = document.getElementById('cropSpace');
    if (force || !spaceEl.value) spaceEl.value = v.spacePerPlant;
  }
}
function updateCropAutoHarvest(force) {
  var vid  = document.getElementById('cropVeggie').value;
  var dp   = document.getElementById('cropDatePlant').value;
  var v    = APP.vegetables[vid];
  var dhEl = document.getElementById('cropDateHarvest');

  if (!v || !dp || !dhEl) return;

  // Prédiction GDD si profil climatique disponible
  var gddDate = null;
  if (typeof GeoCalendar !== 'undefined' && typeof ClimateModule !== 'undefined') {
    var _cl = ClimateModule.get();
    if (_cl) gddDate = GeoCalendar.predictHarvestDate(dp, v, _cl);
  }

  var harvestDate = gddDate || (function () {
    var d = new Date(dp);
    d.setDate(d.getDate() + v.daysToHarvest);
    return d;
  }());

  if (force || !dhEl.value) {
    dhEl.value = harvestDate.toISOString().split('T')[0];
  }

  var isEn = typeof getAppState === 'function' && getAppState('language') === 'en';
  var hintEl = document.getElementById('cropCalcHint');
  if (gddDate) {
    var days = Math.round((gddDate - new Date(dp)) / 86400000);
    hintEl.textContent = isEn
      ? tVeg(v.name) + ' · ' + days + ' days (GDD estimate) · ~' + v.yieldPerM2 + ' kg/m²'
      : tVeg(v.name) + ' · ' + days + ' j estimés (GDD) · ~' + v.yieldPerM2 + ' kg/m²';
    hintEl.style.color = 'var(--brand-700, #2d7a3a)';
  } else {
    hintEl.textContent = t('crops_hint_days')
      .replace('{name}', tVeg(v.name))
      .replace('{days}', v.daysToHarvest)
      .replace('{yield}', v.yieldPerM2);
    hintEl.style.color = '';
  }
}
function updateCropSpaceHint() {
  var bedId = document.getElementById('cropBed').value;
  var mode = document.getElementById('cropMode').value;
  var qty = parseFloat(document.getElementById('cropQty').value) || 0;
  var spacePer = parseFloat(document.getElementById('cropSpace').value) || 0;
  var veggieId = document.getElementById('cropVeggie').value;
  var hintEl = document.getElementById('cropSpaceHint');

  if (!hintEl) return;
  if (!bedId) {
    hintEl.textContent = '';
    return;
  }

  var bed = APP.beds.find(function(b) { return b.id === bedId; });
  var veggie = APP.vegetables[veggieId];

  if (!bed || !veggie) {
    hintEl.textContent = '';
    return;
  }

  var cropSurface = mode === 'surface'
    ? qty
    : qty * (spacePer || veggie.spacePerPlant || 0);

  var used = getUsedBedSurfaceForSeason(bedId, APP.currentSeason, null, true);
  var total = getBedSurface(bed);
  var remaining = Math.max(0, total - used);

  hintEl.textContent =
    t('crops_hint_surface').replace('{rem}', remaining.toFixed(2)).replace('{size}', cropSurface.toFixed(2));
}
function updateCropCompanion() {
  var el = document.getElementById('cropCompanionInfo');
  if (!el) return;
  var vid = document.getElementById('cropVeggie') ? document.getElementById('cropVeggie').value : '';
  var bid = document.getElementById('cropBed') ? document.getElementById('cropBed').value : '';
  if (!vid) { el.innerHTML = ''; return; }
  var v = APP.vegetables[vid];
  if (!v) { el.innerHTML = ''; return; }

  // Chercher les données de compagnonnage dans VEGGIE_ENRICHI
  var enrichi = typeof VEGGIE_ENRICHI !== 'undefined' ? VEGGIE_ENRICHI : {};
  var norm = function(s) { return (s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').trim(); };
  var key = Object.keys(enrichi).find(function(k) { return norm(k) === norm(v.name); });
  if (!key || !enrichi[key] || !enrichi[key].associations) { el.innerHTML = ''; return; }

  var bons    = enrichi[key].associations.bons    || [];
  var mauvais = enrichi[key].associations.mauvais || [];

  // Cultures actuellement dans le bac sélectionné
  var bedCropNames = [];
  if (bid) {
    APP.crops.filter(function(c) {
      return c.bedId === bid && c.season === APP.currentSeason && c.status === 'active';
    }).forEach(function(c) {
      var cv = APP.vegetables[c.veggieId];
      if (cv) bedCropNames.push(norm(cv.name));
    });
  }

  var inBedGood = bons.filter(function(n) { return bedCropNames.indexOf(norm(n)) >= 0; });
  var inBedBad  = mauvais.filter(function(n) { return bedCropNames.indexOf(norm(n)) >= 0; });
  var suggest   = bons.filter(function(n) { return bedCropNames.indexOf(norm(n)) < 0; }).slice(0, 4);

  var html = '<div class="crop-companion-panel">';
  if (inBedBad.length) {
    html += '<div class="crop-companion-row bad">⚠️ ' + escH(t('companion_conflict').replace('{names}', inBedBad.join(', '))) + '</div>';
  }
  if (inBedGood.length) {
    html += '<div class="crop-companion-row good">✅ ' + escH(t('companion_present').replace('{names}', inBedGood.join(', '))) + '</div>';
  }
  if (suggest.length) {
    html += '<div class="crop-companion-row suggest">💡 ' + escH(t('companion_suggest').replace('{names}', suggest.join(', '))) + '</div>';
  }
  html += '</div>';
  el.innerHTML = (inBedBad.length || inBedGood.length || suggest.length) ? html : '';
}

function checkCropRotation() {
  var vid = document.getElementById('cropVeggie') ? document.getElementById('cropVeggie').value : '';
  var bid = document.getElementById('cropBed') ? document.getElementById('cropBed').value : '';
  var warn = document.getElementById('cropRotationWarning');
  if (!warn) return;
  if (!vid || !bid) { warn.innerHTML = ''; return; }
  var v = APP.vegetables[vid];
  if (!v) { warn.innerHTML = ''; return; }
  var prevSeasons = APP.seasons.filter(function(s) { return s !== APP.currentSeason; });
  for (var i = 0; i < prevSeasons.length; i++) {
    var pf = getBedFamilies(bid, prevSeasons[i]);
    if (pf.indexOf(v.family) >= 0) {
      warn.innerHTML = '<div class="tip-card bad">' + t('crops_rotation_warn').replace('{family}', escH(t('family_' + v.family))).replace('{season}', prevSeasons[i]) + '</div>';
      return;
    }
  }
  warn.innerHTML = '';
}
function saveCrop(editId) {
  var veggieId = document.getElementById('cropVeggie').value;
  var bedId = document.getElementById('cropBed').value;
  var mode = document.getElementById('cropMode').value;
  var qty = parseFloat(document.getElementById('cropQty').value);
  var spacePer = parseFloat(document.getElementById('cropSpace').value) || 0;
  var datePlant = document.getElementById('cropDatePlant').value;
  var dateHarvest = document.getElementById('cropDateHarvest').value;
  var notes = document.getElementById('cropNotes').value.trim();
  var startType = document.getElementById('cropStartType').value;

  if (!qty || qty <= 0) {
    alert(t('crops_err_qty'));
    return;
  }

  var veggie = APP.vegetables[veggieId];
  if (!veggie) {
    alert(t('crops_err_veggie'));
    return;
  }

  var cropSurface = mode === 'surface'
    ? qty
    : qty * (spacePer || veggie.spacePerPlant);

  if (bedId) {
    var bed = APP.beds.find(function(b) { return b.id === bedId; });

    if (bed) {
      var bedSurface = getBedSurface(bed);
      var usedSurface = getUsedBedSurfaceForSeason(
        bedId,
        APP.currentSeason,
        editId || null,
        true,
        datePlant || null
      );

      if (usedSurface + cropSurface > bedSurface) {
        alert(t('crops_err_surface')
          .replace('{rem}', Math.max(0, bedSurface - usedSurface).toFixed(2))
          .replace('{size}', cropSurface.toFixed(2)));
        return;
      }
    }
  }

  var nextStatus = getInitialCropStatus(datePlant);

  if (editId) {
    var crop = APP.crops.find(function(c) {
      return c.id === editId;
    });

    if (crop) {
      crop.veggieId = veggieId;
      crop.bedId = bedId;
      crop.mode = mode;
      crop.qty = qty;
      crop.spacePer = spacePer;
      crop.datePlant = datePlant;
      crop.dateHarvest = dateHarvest;
      crop.notes = notes;
      crop.startType = startType;

      if (crop.status !== 'harvested') {
        crop.status = nextStatus;
      }
    }
  } else {
    APP.crops.push({
      id: genId(),
      veggieId: veggieId,
      bedId: bedId,
      season: APP.currentSeason,
      mode: mode,
      qty: qty,
      spacePer: spacePer,
      datePlant: datePlant,
      dateHarvest: dateHarvest,
      yieldReal: null,
      notes: notes,
      startType: startType,
      status: nextStatus
    });
  }

  saveData();
  closeModal();

  if (detailView) {
    renderBedDetail(detailView);
  } else {
    renderCrops();
  }
}

function savePlanCrop() {
  var veggieId = document.getElementById('planVeggie').value;
  var bedId = document.getElementById('planBed').value;
  var mode = document.getElementById('planMode').value;
  var qty = parseFloat(document.getElementById('planQty').value);
  var spacePer = parseFloat(document.getElementById('planSpace').value) || 0;
  var datePlant = document.getElementById('planDatePlant').value;
  var dateHarvest = document.getElementById('planDateHarvest').value;
  var notes = document.getElementById('planNotes').value.trim();

  if (!qty || qty <= 0) {
    alert(t('crops_err_qty'));
    return;
  }

  var veggie = APP.vegetables[veggieId];
  if (!veggie) {
    alert(t('crops_err_veggie'));
    return;
  }

  var cropSurface = mode === 'surface'
    ? qty
    : qty * (spacePer || veggie.spacePerPlant);

  if (bedId) {
    var bed = APP.beds.find(function(b) { return b.id === bedId; });

    if (bed) {
      var bedSurface = getBedSurface(bed);
      var usedSurface = getUsedBedSurfaceForSeason(
        bedId,
        APP.currentSeason,
        null,
        true,
        datePlant || null
      );

      if (usedSurface + cropSurface > bedSurface) {
        alert(t('crops_err_surface')
          .replace('{rem}', Math.max(0, bedSurface - usedSurface).toFixed(2))
          .replace('{size}', cropSurface.toFixed(2)));
        return;
      }
    }
  }

  APP.crops.push({
    id: genId(),
    veggieId: veggieId,
    bedId: bedId,
    season: APP.currentSeason,
    mode: mode,
    qty: qty,
    spacePer: spacePer,
    datePlant: datePlant,
    dateHarvest: dateHarvest,
    yieldReal: null,
    notes: notes,
    startType: document.getElementById('planStartType') ? document.getElementById('planStartType').value : 'plant',
    status: 'planned'
  });

  saveData();
  closeModal();
  renderPlanning();
}
function harvestCrop(id) {
  var crop = APP.crops.find(function(c) { return c.id === id; });
  if (!crop) return;
  var v = APP.vegetables[crop.veggieId];
  var est = getCropEstimatedYield(crop);
  var cumul = (crop.partialHarvests || []).reduce(function(s, h) { return s + (h.kg || 0); }, 0);
  var cumulHint = cumul > 0
    ? '<div class="form-hint" style="color:var(--brand-700);">' + t('crops_partial_count').replace('{n}', (crop.partialHarvests || []).length).replace('{kg}', cumul.toFixed(1)) + '</div>'
    : '';
  openModal(
    '<div class="modal-header"><div class="modal-title">' + t('crops_harvest_title').replace('{name}', v ? escH(tVeg(v.name)) : '') + '</div><button class="modal-close" onclick="closeModal()">&times;</button></div>' +
    '<div style="text-align:center;margin:16px 0;">' + (v ? vIcon(v, crop.veggieId, 80) : '<span style="font-size:3rem;">🌱</span>') + '</div>' +
    '<div class="form-group"><label class="form-label">' + t('crops_lbl_real_yield_input') + '</label>' +
    '<input type="number" step="0.1" class="form-input" id="harvestYield" value="' + (cumul > 0 ? '0.0' : est.toFixed(1)) + '" placeholder="' + t('crops_lbl_kg_harvested') + '">' +
    '<div class="form-hint">' + t('crops_lbl_estimate').replace('{kg}', est.toFixed(1)) + '</div>' +
    cumulHint +
    '</div>' +
    '<div id="harvest-confirm-msg" style="display:none;margin:0 0 12px;padding:10px 14px;border-radius:10px;background:var(--surface-2,#f3f4f6);font-size:0.85rem;color:var(--text-main);"></div>' +
    '<div class="modal-actions" style="flex-direction:column;gap:8px;">' +
    '<button class="btn btn-secondary" onclick="closeModal()">' + t('btn_cancel') + '</button>' +
    '<button class="btn btn-secondary" style="border-color:var(--brand-600);color:var(--brand-700);" onclick="previewHarvest(\'' + id + '\',false)">' + t('crops_harvest_partial') + '</button>' +
    '<button class="btn btn-primary" onclick="previewHarvest(\'' + id + '\',true)">' + t('crops_harvest_final') + '</button>' +
    '</div>'
  );
}
// Récolte rapide : modal simplifié sans étape de preview — 2 taps depuis "Aujourd'hui"
function quickHarvestCrop(id) {
  var crop = APP.crops.find(function(c) { return c.id === id; });
  if (!crop) return;
  var v = APP.vegetables[crop.veggieId];
  var est = getCropEstimatedYield(crop);
  var cumul = (crop.partialHarvests || []).reduce(function(s, h) { return s + (h.kg || 0); }, 0);
  var prefill = cumul > 0 ? '0.0' : est.toFixed(1);
  var icon = v ? vIcon(v, crop.veggieId, 56) : '<span style="font-size:2.5rem;">🌱</span>';
  var name = v ? escH(tVeg(v.name)) : '?';
  openModal(
    '<div class="modal-header"><div class="modal-title">' + (v ? v.icon + ' ' : '') + name + '</div>' +
    '<button class="modal-close" onclick="closeModal()">&times;</button></div>' +
    '<div style="text-align:center;margin:12px 0 16px;">' + icon + '</div>' +
    '<div class="form-group">' +
    '<label class="form-label">' + t('crops_lbl_real_yield_input') + '</label>' +
    '<input type="number" step="0.1" class="form-input" id="harvestYield" value="' + prefill + '" style="font-size:1.3rem;text-align:center;">' +
    '<div class="form-hint">' + t('crops_lbl_estimate').replace('{kg}', est.toFixed(1)) + (cumul > 0 ? ' · ' + t('crops_partial_count').replace('{n}', (crop.partialHarvests||[]).length).replace('{kg}', cumul.toFixed(1)) : '') + '</div>' +
    '</div>' +
    '<div class="modal-actions">' +
    '<button class="btn btn-secondary" onclick="confirmPartialHarvest(\'' + id + '\')">' + t('crops_harvest_partial') + '</button>' +
    '<button class="btn btn-primary" onclick="confirmFinalHarvest(\'' + id + '\')">' + t('crops_harvest_final') + '</button>' +
    '</div>'
  );
}

function previewHarvest(id, isFinal) {
  var crop = APP.crops.find(function(c) { return c.id === id; });
  if (!crop) return;
  var v = APP.vegetables[crop.veggieId];
  var kg = parseFloat(document.getElementById('harvestYield').value) || 0;
  var name = v ? tVeg(v.name) : '';
  var msgEl = document.getElementById('harvest-confirm-msg');
  var key = isFinal ? 'crops_harvest_final_confirm' : 'crops_harvest_partial_confirm';
  msgEl.textContent = t(key).replace('{kg}', kg.toFixed(1)).replace('{name}', name);
  msgEl.style.display = 'block';
  // Remplacer les boutons par Annuler + Confirmer
  var actEl = msgEl.nextElementSibling;
  actEl.innerHTML =
    '<button class="btn btn-secondary" onclick="harvestCrop(\'' + id + '\')">\u2190 ' + t('btn_cancel') + '</button>' +
    '<button class="btn btn-primary" onclick="' + (isFinal ? 'confirmFinalHarvest' : 'confirmPartialHarvest') + '(\'' + id + '\')">' + (isFinal ? t('crops_harvest_final') : t('crops_harvest_partial')) + '</button>';
}
function confirmPartialHarvest(id) {
  var crop = APP.crops.find(function(c) { return c.id === id; });
  if (!crop) return;
  var kg = parseFloat(document.getElementById('harvestYield').value) || 0;
  if (!crop.partialHarvests) crop.partialHarvests = [];
  crop.partialHarvests.push({ date: new Date().toISOString().split('T')[0], kg: kg });
  crop.yieldReal = crop.partialHarvests.reduce(function(s, h) { return s + (h.kg || 0); }, 0);
  saveData();
  closeModal();
  if (detailView) renderBedDetail(detailView);
  else renderPage(currentPage);
}
function confirmFinalHarvest(id) {
  var crop = APP.crops.find(function(c) { return c.id === id; });
  if (!crop) return;
  var kg = parseFloat(document.getElementById('harvestYield').value) || 0;
  if (!crop.partialHarvests) crop.partialHarvests = [];
  if (kg > 0) crop.partialHarvests.push({ date: new Date().toISOString().split('T')[0], kg: kg });
  crop.yieldReal = crop.partialHarvests.reduce(function(s, h) { return s + (h.kg || 0); }, 0);
  crop.status = 'harvested';
  crop.dateHarvest = new Date().toISOString().split('T')[0];
  var weatherCtx = APP.weather ? { temp: APP.weather.current && APP.weather.current.temperature_2m, precip: APP.weather.current && APP.weather.current.precipitation, code: APP.weather.current && APP.weather.current.weather_code } : null;
  addHistoryEntry(crop, crop.yieldReal, weatherCtx);
  recordHarvestLearningData(crop);
  saveData();
  closeModal();
  if (detailView) renderBedDetail(detailView);
  else renderPage(currentPage);
}
function confirmHarvest(id) {
  var crop = APP.crops.find(function(c) { return c.id === id; });
  if (!crop) return;
  crop.status = 'harvested';
  crop.yieldReal = parseFloat(document.getElementById('harvestYield').value) || 0;
  crop.dateHarvest = new Date().toISOString().split('T')[0];
  addHistoryEntry(crop, crop.yieldReal, APP.weather ? { temp: APP.weather.current && APP.weather.current.temperature_2m, precip: APP.weather.current && APP.weather.current.precipitation, code: APP.weather.current && APP.weather.current.weather_code } : null);
  recordHarvestLearningData(crop);
  saveData();
  closeModal();
  if (detailView) renderBedDetail(detailView);
  else renderPage(currentPage);
}
function undoHarvest(id) {
  if (!confirm(t('crops_confirm_undo_harvest'))) return;
  var crop = APP.crops.find(function(c) { return c.id === id; });
  if (!crop) return;
  // Supprimer l'entrée d'historique liée à cette culture
  var history = loadHistory();
  saveHistory(history.filter(function(h) { return h.cropId !== id; }));
  // Remettre la culture en actif
  crop.status = 'active';
  crop.yieldReal = null;
  crop.partialHarvests = [];
  rebuildLearningMemory();
  saveData();
  if (detailView) renderBedDetail(detailView);
  else renderPage(currentPage);
}
function deleteCrop(id) {
  if (!confirm(t('crops_confirm_delete'))) return;
  APP.crops = APP.crops.filter(function(c) { return c.id !== id; });
  saveData();
  if (detailView) renderBedDetail(detailView);
  else renderCrops();
}
function openMoveCropModal(cropId) {
  var crop = APP.crops.find(function(c) { return c.id === cropId; });
  if (!crop) return;
  var v = APP.vegetables[crop.veggieId];
  var opts = '';
  for (var i = 0; i < APP.beds.length; i++) {
    var b = APP.beds[i];
    if (b.id === crop.bedId) continue;
    opts += '<button class="btn btn-block btn-secondary" style="margin-bottom:8px;" onclick="moveCrop(\'' + cropId + '\',\'' + b.id + '\')">' +
      escH(b.name) + ' (' + getBedSurface(b).toFixed(1) + ' m\u00B2, ' + getBedOccupation(b) + t('crops_move_occupied') + ')</button>';
  }
  openModal(
    '<div class="modal-header"><div class="modal-title">' + t('crops_move_title').replace('{name}', v ? v.icon + ' ' + escH(tVeg(v.name)) : '') + '</div><button class="modal-close" onclick="closeModal()">&times;</button></div>' +
    '<div style="font-size:0.9rem;color:var(--text-light);margin-bottom:12px;">' + t('crops_move_subtitle') + '</div>' +
    (opts || '<div style="color:var(--text-light);">' + t('crops_move_none') + '</div>')
  );
}
function moveCrop(cropId, newBedId) {
  var crop = APP.crops.find(function(c) { return c.id === cropId; });
  if (crop) { crop.bedId = newBedId; saveData(); }
  closeModal();
  if (detailView) renderBedDetail(detailView);
  else renderCrops();
}
