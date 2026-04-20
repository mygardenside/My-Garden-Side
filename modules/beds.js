// Green Vibes — modules/beds.js
// Gestion des zones
// ========== BEDS ==========
var _bedGhostShield = false;

// ========== ZONES — Mes Zones ==========
function renderBeds() {
  var el = document.getElementById('pageBeds');
  document.getElementById('headerTitle').textContent = t('nav_beds');
  document.getElementById('fab').style.display = 'flex';
  if (getAppState('beds').length === 0) {
    el.innerHTML = '<div class="empty-state fade-in">' +
      '<div class="empty-icon">\uD83C\uDF31</div>' +
      '<div class="empty-text">' + t('beds_empty').replace('\n','<br>') + '</div>' +
      '<button class="btn btn-primary" onclick="openBedModal()">' + t('beds_add_btn') + '</button></div>';
    return;
  }

  // Résumé global en haut
  var totalSurf = getAppState('beds').reduce(function(s,b){ return s+getBedSurface(b); }, 0);
  var totalActives = getAppState('crops').filter(function(c){ return c.season===getAppState('currentSeason') && c.status==='active'; }).length;
  var avgOcc = getAppState('beds').length > 0
    ? Math.round(getAppState('beds').reduce(function(s,b){ return s+getBedOccupation(b); }, 0) / getAppState('beds').length)
    : 0;

  var summaryHTML =
    '<div class="prem-beds-summary">' +
      '<div class="prem-beds-stat">' +
        '<div class="prem-beds-stat-icon green">\uD83D\uDCCF</div>' +
        '<div class="prem-beds-stat-val">' + totalSurf.toFixed(1) + '</div>' +
        '<div class="prem-beds-stat-lbl">' + t('beds_m2_total') + '</div>' +
      '</div>' +
      '<div class="prem-beds-stat">' +
        '<div class="prem-beds-stat-icon blue">\uD83E\uDD6C</div>' +
        '<div class="prem-beds-stat-val">' + totalActives + '</div>' +
        '<div class="prem-beds-stat-lbl">' + t('stat_crops') + '</div>' +
      '</div>' +
      '<div class="prem-beds-stat">' +
        '<div class="prem-beds-stat-icon orange">\uD83D\uDCCA</div>' +
        '<div class="prem-beds-stat-val">' + avgOcc + '%</div>' +
        '<div class="prem-beds-stat-lbl">' + t('stat_occupation') + '</div>' +
      '</div>' +
    '</div>';

  var html = '<div class="fade-in">' + summaryHTML;
  for (var i = 0; i < getAppState('beds').length; i++) {
    try {
      html += renderBedCard(getAppState('beds')[i]);
    } catch(e) {
      console.error('renderBedCard error:', e);
      html += '<div class="card" style="color:var(--text-light);padding:12px;">' + t('beds_err_display') + '</div>';
    }
  }
  html += '</div>';
  el.innerHTML = html;
  // Restore FAB after render (guards against ghost-click tap-through on mobile)
  document.getElementById('fab').style.display = 'flex';
}

function renderBedCard(bed) {
  var occ        = getBedOccupation(bed);
  var crops      = getBedCrops(bed.id);
  var activeCrops  = crops.filter(function(c) { return c.status === 'active'; });
  var plannedCrops = crops.filter(function(c) { return c.status === 'planned'; });
  var surface    = getBedSurface(bed);
  var rotScore   = getRotationScore(bed);
  var premCls    = occ >= 90 ? 'optimized' : occ > 70 ? 'warn' : 'ok';

  // Score santé du bac (calcul existant)
  var healthScore = 100;
  if (occ < 20 && activeCrops.length === 0) healthScore -= 10;
  if (rotScore.score === 'warning') healthScore -= 15;
  if (rotScore.score === 'bad') healthScore -= 30;
  healthScore = Math.max(0, healthScore);
  var hColor = healthScore >= 80 ? 'var(--green-500)' : healthScore >= 50 ? 'var(--orange)' : 'var(--red)';

  // Blocs visuels
  var visualBlocks = '';
  var displayCrops = activeCrops.concat(plannedCrops);
  if (displayCrops.length > 0) {
    var usedTotal = displayCrops.reduce(function(s,c){ return s+getCropSurface(c); }, 0);
    displayCrops.forEach(function(c) {
      var v   = getAppState('vegetables')[c.veggieId]; if (!v) return;
      var cs  = getCropSurface(c);
      var pct = surface > 0 ? Math.max(15, (cs/surface)*100) : 20;
      var stage = getCropStage(c);
      var extraStyle = c.status === 'planned' ? 'border:2px dashed rgba(255,255,255,.7);opacity:.8;' : '';
      visualBlocks += '<div class="bed-block stage-' + stage + '" style="width:calc('+pct+'% - 4px);'+extraStyle+'">' + vIcon(v, c.veggieId, 18) + ' ' + escH(tVeg(v.name)) + '</div>';
    });
    var emptyPct = Math.max(0, 100 - (usedTotal/surface*100));
    if (emptyPct > 5) visualBlocks += '<div class="bed-block empty" style="width:calc('+emptyPct+'% - 4px);">' + t('beds_legend_free') + '</div>';
  } else {
    visualBlocks = '<div class="bed-block empty" style="width:100%;">' + t('beds_zone_empty') + '</div>';
  }

  // Suggestion IA (meilleur légume à planter)
  var sugs = getSuggestedPlantings('1').filter(function(s){ return s.bedId === bed.id; });

  // Chips cultures pour hero premium
  var heroChips = '';
  activeCrops.slice(0, 5).forEach(function(c) {
    var v = getAppState('vegetables')[c.veggieId]; if (!v) return;
    heroChips += '<span class="prem-bed-chip">' + vIcon(v, c.veggieId, 20) + ' ' + escH(tVeg(v.name)) + '</span>';
  });
  if (!heroChips && plannedCrops.length > 0) {
    plannedCrops.slice(0, 3).forEach(function(c) {
      var v = getAppState('vegetables')[c.veggieId]; if (!v) return;
      heroChips += '<span class="prem-bed-chip" style="opacity:0.65;">' + vIcon(v, c.veggieId, 20) + ' ' + escH(tVeg(v.name)) + '</span>';
    });
  }
  // Variante couleur du hero (rotation sur index)
  var allBeds = getAppState('beds');
  var bedIdx  = allBeds.findIndex(function(b) { return b.id === bed.id; });
  var heroColor = 'c' + (((bedIdx < 0) ? 0 : bedIdx) % 4);

  var bedIllus = (typeof getZoneVisual === 'function') ? getZoneVisual(bed.id) : '';
  return '<div class="prem-bed-card" onclick="showBedDetail(\'' + bed.id + '\')">' +
    '<div class="prem-bed-hero ' + heroColor + '">' +
      (bedIllus ? '<div class="prem-bed-illus" aria-hidden="true">' + bedIllus + '</div><div class="prem-bed-illus-overlay"></div>' : '') +
      '<div class="prem-bed-hero-top" style="position:relative;z-index:2;">' +
        '<div>' +
          '<div class="prem-bed-name">' + escH(bed.name) + '</div>' +
          '<div class="prem-bed-surface">' + bed.length + 'm \u00D7 ' + bed.width + 'm \u2014 ' + surface.toFixed(1) + ' m\u00B2</div>' +
        '</div>' +
        '<div class="prem-bed-occ-badge ' + premCls + '">' + (occ >= 90 ? t('bed_occ_optimized') : occ + '%') + '</div>' +
      '</div>' +
      '<div class="prem-bed-chips" style="position:relative;z-index:2;">' +
        (heroChips || '<span class="prem-bed-chip-empty">' + t('beds_zone_free_chip') + '</span>') +
      '</div>' +
    '</div>' +
    '<div class="prem-bed-body">' +
      '<div class="prem-bed-stat-row">' +
        '<span>' +
          '\uD83E\uDD6C ' + (activeCrops.length > 1 ? t('beds_active_pl') : t('beds_active')).replace('{n}', activeCrops.length) +
          (plannedCrops.length > 0 ? ' \u00B7 \uD83D\uDDD3\uFE0F ' + (plannedCrops.length > 1 ? t('beds_planned_pl') : t('beds_planned')).replace('{n}', plannedCrops.length) : '') +
        '</span>' +
        '<span class="prem-bed-health" style="color:' + hColor + ';">' + healthScore + '/100</span>' +
      '</div>' +
      '<div class="prem-bed-bar-track"><div class="prem-bed-bar-fill ' + premCls + '" style="width:' + occ + '%"></div></div>' +
      (sugs.length > 0 ? '<div class="prem-bed-ai">\uD83E\uDDE0 ' + t('beds_ai_suggest').replace('{icon}', sugs[0].veggie.icon).replace('{name}', escH(tVeg(sugs[0].veggie.name))) + (function(){var mem=getLearningMemory();var vp=mem.vegetableProfiles[sugs[0].veggieId];return vp&&vp.count>=1?t('beds_ai_history').replace('{pct}', Math.round(vp.avgRatio*100)):'';})() + '</div>' : '') +
    '</div>' +
  '</div>';
}
function showBedDetail(bedId) {
  if (_bedGhostShield) return; // ignore ghost clicks right after modal save
  detailView = bedId;
  renderBedDetail(bedId);
  document.getElementById('headerBack').classList.add('visible');
  document.getElementById('fab').style.display = 'none';
  history.pushState({ page: 'beds', detail: bedId }, '', '#beds');
}
function renderBedDetail(bedId) {
  var el = document.getElementById('pageBeds');
  var bed = getAppState('beds').find(function(b) { return b.id === bedId; });
  if (!bed) { detailView = null; renderBeds(); return; }
  var crops = getBedCrops(bed.id);
  var activeCrops = crops.filter(function(c) { return c.status === 'active'; });
  var occ = getBedOccupation(bed);
  var surface = getBedSurface(bed);
  var rotation = getRotationScore(bed);
  var families = getBedFamilies(bed.id);
  document.getElementById('headerTitle').textContent = bed.name;
  var uniquePrevFamilies = [];
  getAppState('seasons').forEach(function(s) {
    if (s === getAppState('currentSeason')) return;
    var pf = getBedFamilies(bed.id, s);
    pf.forEach(function(f) { if (uniquePrevFamilies.indexOf(f) < 0) uniquePrevFamilies.push(f); });
  });
  var healthScore = 100;
  if (occ < 20 && activeCrops.length === 0) healthScore -= 10;
  if (rotation.score === 'warning') healthScore -= 15;
  if (rotation.score === 'bad') healthScore -= 30;
  healthScore = Math.max(0, healthScore);
  var cropsListHTML = '';
  if (crops.length > 0) {
    for (var i = 0; i < crops.length; i++) {
      var c = crops[i];
      var v = APP.vegetables[c.veggieId];
      if (!v) continue;
      var stage = getCropStage(c);
      var stClass = getStageBadgeClass(stage);
      var startTypeLabel = getStartTypeLabel(c.startType);
      var startTypeBadgeClass = c.startType === 'seed' ? 'badge-purple' : 'badge-green';
      var pStyle = c.status === 'planned'
      ? 'padding:12px;border:2px dashed var(--green-300);opacity:0.65;background:#f8fafc;'
      : 'padding:12px;';
      cropsListHTML +=
      '<div class="card" style="' + pStyle + '">' +
        '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap;">' +
    
          '<div style="flex:1;min-width:180px;">' +
            '<div style="display:flex;align-items:center;gap:8px;">' +
              '<span style="line-height:1;">' + vIcon(v, c.veggieId, 24) + '</span>' +
              '<strong>' + escH(tVeg(v.name)) + '</strong>' +
            '</div>' +
    
            '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px;">' +
              '<span class="badge ' + stClass + '">' + getStageName(stage) + '</span>' +
              '<span class="badge ' + startTypeBadgeClass + '">' + startTypeLabel + '</span>' +
            '</div>' +
    
            '<div style="font-size:0.75rem;color:var(--text-light);margin-top:6px;">' +
              (c.mode === 'plant' ? c.qty + ' plants' : c.qty + ' m\u00b2') +
              ' \u00b7 ' + getStartTypeLabel(c.startType) +
              ' \u00b7 ' + escH(t('family_' + v.family)) +
              ' \u00b7 ' + getCropSurface(c).toFixed(2) + ' m\u00b2' +
            '</div>' +
            (c.datePlant || c.dateHarvest ?
            '<div style="font-size:0.75rem;color:var(--text-light);margin-top:3px;">' +
              (c.datePlant ? '\uD83C\uDF31 ' + fmtDate(new Date(c.datePlant)) : '') +
              (c.datePlant && c.dateHarvest ? ' \u00b7 ' : '') +
              (c.dateHarvest && c.status !== 'harvested' ? '\uD83C\uDF81 ' + fmtDate(new Date(c.dateHarvest)) : '') +
            '</div>' : '') +
          '</div>' +
    
          '<div class="btn-group" style="margin-top:0;justify-content:flex-end;">' +
            (c.status === 'harvested'
              ? '<button class="btn btn-sm btn-secondary" onclick="event.stopPropagation();undoHarvest(\'' + c.id + '\')">' + t('crops_btn_undo_harvest') + '</button>'
              : '<button class="btn btn-sm btn-secondary" onclick="event.stopPropagation();openMoveCropModal(\'' + c.id + '\')">' + t('beds_btn_move') + '</button>' +
                '<button class="btn btn-sm btn-secondary" onclick="event.stopPropagation();openCropModal(\'' + c.id + '\')">✏️</button>' +
                (c.status === 'active' ? '<button class="btn btn-sm btn-primary" onclick="event.stopPropagation();harvestCrop(\'' + c.id + '\')">' + t('beds_btn_harvest') + '</button>' : '')) +
            '<button class="btn btn-sm btn-danger" onclick="event.stopPropagation();deleteCrop(\'' + c.id + '\');renderBedDetail(\'' + bed.id + '\')">' + t('beds_btn_delete') + '</button>' +
          '</div>' +
    
        '</div>' +
      '</div>';
    }
  } else {
    cropsListHTML = '<div class="empty-state" style="padding:20px;"><div class="empty-icon">🌾</div><div class="empty-text">' + t('beds_no_crops') + '</div></div>';
  }
  var familyBadges = families.map(function(f) { return '<span class="badge badge-green">' + escH(f) + '</span>'; }).join(' ');
  var prevFamilyBadges = uniquePrevFamilies.length > 0
    ? uniquePrevFamilies.map(function(f) { return '<span class="badge badge-gray">' + escH(f) + '</span>'; }).join(' ')
    : '<span style="color:var(--text-light);font-size:0.85rem;">' + t('beds_no_history') + '</span>';
  var detailIllus = (typeof getZoneVisual === 'function') ? getZoneVisual(bed.id) : '';
  var detailBannerHTML = detailIllus
    ? '<div class="bed-detail-banner">' + detailIllus + '<div class="bed-detail-banner-overlay"></div></div>'
    : '';

  el.innerHTML = '<div class="fade-in">' +
    '<div class="card" style="padding:0;overflow:hidden;">' +
    detailBannerHTML +
    '<div style="padding:14px 16px;display:flex;justify-content:space-between;align-items:flex-start;">' +
    '<div><div style="font-size:1.1rem;font-weight:700;">' + escH(bed.name) + '</div>' +
    '<div style="font-size:0.85rem;color:var(--text-light);">' + bed.length + 'm x ' + bed.width + 'm = ' + surface.toFixed(1) + ' m\u00B2</div></div>' +
    '<div class="btn-group">' +
    '<button class="btn btn-sm btn-secondary" onclick="openBedModal(\'' + bed.id + '\')">✏️</button>' +
    '<button class="btn btn-sm btn-danger" onclick="deleteBed(\'' + bed.id + '\')">🗑️</button>' +
    '</div></div>' +
    (bed.notes ? '<div style="padding:0 16px 12px;font-size:0.85rem;color:var(--text-light);">' + escH(bed.notes) + '</div>' : '') +
    '</div>' +
    '<div class="stats-grid" style="grid-template-columns:repeat(3,1fr);">' +
    '<div class="stat-card"><div class="stat-value">' + occ + '%</div><div class="stat-label">' + t('stat_occupation') + '</div></div>' +
    '<div class="stat-card"><div class="stat-value">' + healthScore + '</div><div class="stat-label">' + t('beds_stat_health') + '</div></div>' +
    '<div class="stat-card"><div class="stat-value">' + activeCrops.length + '</div><div class="stat-label">' + t('stat_crops') + '</div></div></div>' +
    '<div class="card"><div style="font-weight:700;margin-bottom:8px;">' + t('beds_rotation') + '</div>' +
    getRotationBadge(bed) +
    '<div style="margin-top:8px;"><span style="font-size:0.85rem;font-weight:600;">' + t('beds_families_current') + '</span><br>' +
    (familyBadges || '<span style="color:var(--text-light);font-size:0.85rem;">' + t('beds_none') + '</span>') + '</div>' +
    '<div style="margin-top:8px;"><span style="font-size:0.85rem;font-weight:600;">' + t('beds_families_prev') + '</span><br>' +
    prevFamilyBadges + '</div></div>' +
    '<div class="section-title">🥬 ' + t('stat_crops') + '</div>' +
    cropsListHTML +
    '<button class="btn btn-primary btn-block" style="margin-top:12px;" onclick="openCropModal(null,\'' + bed.id + '\')">' + t('beds_add_crop') + '</button>' +
    '</div>';
}
function openBedModal(editId) {
  var bed = editId ? APP.beds.find(function(b) { return b.id === editId; }) : null;
  var title = bed ? t('beds_modal_edit') : t('beds_modal_new');
  openModal(
    '<div class="modal-header"><div class="modal-title">' + title + '</div><button class="modal-close" onclick="closeModal()">&times;</button></div>' +
    '<div id="bedFormError" style="display:none;background:#fee2e2;color:#b91c1c;border-radius:8px;padding:8px 12px;margin-bottom:10px;font-size:0.85rem;"></div>' +
    '<div class="form-group"><label class="form-label">' + t('beds_lbl_name') + '</label><input class="form-input" id="bedName" value="' + (bed ? escH(bed.name) : '') + '" placeholder="' + t('lbl_ex') + ' Potager 1"></div>' +
    '<div class="form-row">' +
    '<div class="form-group"><label class="form-label">' + t('beds_lbl_length') + '</label><input type="number" step="0.1" min="0.1" class="form-input" id="bedLength" value="' + (bed ? bed.length : '') + '" placeholder="2.0"></div>' +
    '<div class="form-group"><label class="form-label">' + t('beds_lbl_width') + '</label><input type="number" step="0.1" min="0.1" class="form-input" id="bedWidth" value="' + (bed ? bed.width : '') + '" placeholder="1.0"></div></div>' +
    '<div class="form-group"><label class="form-label">' + t('beds_lbl_notes') + '</label><textarea class="form-textarea" id="bedNotes" placeholder="' + t('lbl_placeholder_notes') + '">' + (bed ? escH(bed.notes || '') : '') + '</textarea></div>' +
    '<div class="modal-actions">' +
    '<button class="btn btn-secondary" onclick="closeModal()">' + t('btn_cancel') + '</button>' +
    '<button class="btn btn-primary" onclick="saveBed(\'' + (editId || '') + '\')">' + (bed ? t('btn_edit_label') : t('btn_add_label')) + '</button></div>'
  );
}
function _bedFormError(msg) {
  var el = document.getElementById('bedFormError');
  if (el) { el.textContent = msg; el.style.display = 'block'; }
}
function saveBed(editId) {
  var name = document.getElementById('bedName').value.trim();
  var length = parseFloat(document.getElementById('bedLength').value);
  var width = parseFloat(document.getElementById('bedWidth').value);
  var notes = document.getElementById('bedNotes').value.trim();
  if (!name) { _bedFormError(t('beds_err_name')); return; }
  if (!length || length <= 0) { _bedFormError(t('beds_err_length')); return; }
  if (!width || width <= 0) { _bedFormError(t('beds_err_width')); return; }
  if (editId) {
    var bed = APP.beds.find(function(b) { return b.id === editId; });
    if (bed) { bed.name = name; bed.length = length; bed.width = width; bed.notes = notes; }
  } else {
    APP.beds.push({ id: genId(), name: name, length: length, width: width, notes: notes });
  }
  saveData();
  closeModal();
  _bedGhostShield = true;
  setTimeout(function() { _bedGhostShield = false; }, 400);
  if (detailView) renderBedDetail(detailView);
  else renderBeds();
}
function deleteBed(id) {
  if (!confirm(t('beds_confirm_delete'))) return;
  APP.beds = APP.beds.filter(function(b) { return b.id !== id; });
  APP.crops = APP.crops.filter(function(c) { return c.bedId !== id; });
  saveData();
  detailView = null;
  document.getElementById('headerBack').classList.remove('visible');
  _bedGhostShield = true;
  setTimeout(function() { _bedGhostShield = false; }, 400);
  renderBeds();
}
