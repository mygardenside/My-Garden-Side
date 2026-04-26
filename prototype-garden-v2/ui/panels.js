// =============================================================
//  PANELS — panneau propriétés de l'élément sélectionné
// =============================================================

var Panels = {
  container: null,
  panel:     null,

  init: function() {
    this.container = document.getElementById('prop-panel');
    this.panel     = document.querySelector('.prop-panel');
  },

  update: function(el) {
    var c = this.container;
    if (!c) return;
    Toolbar.updateDeleteBtn(!!el);

    if (!el) {
      c.innerHTML = '<p class="no-sel">' + I18N.t('no_sel') + '</p>';
      if (this.panel) this.panel.classList.remove('has-selection');
      return;
    }

    if (this.panel) this.panel.classList.add('has-selection');

    var html = '<div class="prop-title">' + esc(el.label || el.type) + '</div>';

    // Bouton "Forme libre" (sauf fence, tree et house)
    if (el.type !== 'fence' && el.type !== 'tree' && el.type !== 'house') {
      var vmOn = AppState.vertexMode;
      html += '<div style="margin-bottom:10px">' +
        '<button id="pp-vertex" style="width:100%;padding:6px 4px;border-radius:6px;border:1.5px solid ' +
        (vmOn ? 'var(--primary)' : 'var(--border)') +
        ';background:' + (vmOn ? '#e0f0e8' : 'var(--surface2)') +
        ';color:' + (vmOn ? 'var(--primary)' : 'var(--text)') +
        ';cursor:pointer;font-size:11px;font-weight:600;transition:all .15s">' +
        (vmOn ? '✓ Mode forme' : '⬡ Forme libre') + '</button>';
      if (el.pts && !vmOn) {
        html += '<button id="pp-reset-pts" style="width:100%;margin-top:4px;padding:5px 4px;' +
          'border-radius:6px;border:1px solid var(--border);background:var(--surface2);' +
          'color:var(--text-light);cursor:pointer;font-size:11px">↩ Rétablir rectangle</button>';
      }
      html += '</div>';
    }

    // Label
    html += Panels._field(I18N.t('prop_name'),
      '<input id="pp-label" type="text" value="' + esc(el.label || '') + '">');

    // Dimensions
    if (el.type !== 'fence' && el.type !== 'tree') {
      html += Panels._field(I18N.t('prop_width'),
        '<input id="pp-w" type="number" step="0.1" min="0.1" value="' + px2m(el.dimensions.width) + '">');
      html += Panels._field(I18N.t('prop_height'),
        '<input id="pp-h" type="number" step="0.1" min="0.1" value="' + px2m(el.dimensions.height) + '">');
    }

    // Rotation
    if (el.type !== 'fence') {
      html += Panels._field(I18N.t('prop_rotation'),
        '<input id="pp-rot" type="number" step="1" value="' + (el.rotation || 0) + '">');
    }

    // Sol (bed)
    if (el.type === 'bed') {
      html += Panels._field(I18N.t('prop_soil'),
        '<select id="pp-soil">' +
          ['loam','clay','sandy','rich'].map(function(s) {
            return '<option value="' + s + '"' + (el.soil.type === s ? ' selected' : '') + '>' +
              I18N.t('soil_' + s) + '</option>';
          }).join('') + '</select>');
      html += Panels._field(I18N.t('prop_sun'),
        '<select id="pp-sun">' +
          ['full','partial','shade'].map(function(s) {
            return '<option value="' + s + '"' + (el.microclimate.sunExposure === s ? ' selected' : '') + '>' +
              I18N.t('sun_' + s) + '</option>';
          }).join('') + '</select>');
      html += '<div class="prop-info">' + I18N.t('prop_surface') + ' : <strong>' +
        (el.surface ? el.surface.toFixed(2) : '0') + ' m²</strong></div>';
    }

    // Clôture
    if (el.type === 'fence') {
      html += Panels._field(I18N.t('prop_style'),
        '<select id="pp-fence-style">' +
          ['wood','wire','hedge','stone'].map(function(s) {
            return '<option value="' + s + '"' + (el.fenceStyle === s ? ' selected' : '') + '>' +
              I18N.t('fence_' + s) + '</option>';
          }).join('') + '</select>');
      html += '<label class="prop-row"><span>' + I18N.t('prop_closed') + '</span>' +
        '<input id="pp-fence-closed" type="checkbox"' + (el.closed ? ' checked' : '') + '></label>';
    }

    // Chemin
    if (el.type === 'path') {
      html += Panels._field(I18N.t('prop_style'),
        '<select id="pp-path-style">' +
          ['gravel','stone','wood','grass'].map(function(s) {
            return '<option value="' + s + '"' + (el.pathStyle === s ? ' selected' : '') + '>' +
              I18N.t('path_' + s) + '</option>';
          }).join('') + '</select>');
    }

    // Arbre
    if (el.type === 'tree') {
      html += Panels._field(I18N.t('prop_type'),
        '<select id="pp-tree-type">' +
          ['generic','fruit','shrub','conifer','deciduous'].map(function(s) {
            return '<option value="' + s + '"' + (el.treeType === s ? ' selected' : '') + '>' +
              I18N.t('tree_' + s) + '</option>';
          }).join('') + '</select>');
    }

    // Info vertex
    if (AppState.vertexMode && el.pts) {
      html += '<div class="prop-info" style="margin-top:8px;font-size:10px">' +
        '🔵 Drag = déplacer  •  🟢 Clic = ajouter<br>Double-clic sur 🔵 = supprimer (min 3)<br>Échap = quitter' +
        '</div>';
    }

    c.innerHTML = html;
    Panels._bindEvents(el);
  },

  _field: function(label, input) {
    return '<label class="prop-row"><span>' + label + '</span>' + input + '</label>';
  },

  _bindEvents: function(el) {
    function bind(id, fn) {
      var node = document.getElementById(id);
      if (node) node.addEventListener('change', fn);
    }
    function bindClick(id, fn) {
      var node = document.getElementById(id);
      if (node) node.addEventListener('click', fn);
    }

    bindClick('pp-vertex', function() { Interactions.toggleVertexMode(); });
    bindClick('pp-reset-pts', function() {
      el.pts = null;
      AppState.vertexMode    = false;
      AppState.vertexDragIdx = -1;
      GardenStore.save();
      Panels.update(el);
    });

    bind('pp-label', function(e) { el.label = e.target.value; });
    bind('pp-w',  function(e) { el.dimensions.width  = m2px(parseFloat(e.target.value) || 0.1); GardenStore._computeSurfaces(); Panels.update(el); });
    bind('pp-h',  function(e) { el.dimensions.height = m2px(parseFloat(e.target.value) || 0.1); GardenStore._computeSurfaces(); Panels.update(el); });
    bind('pp-rot',function(e) { el.rotation = parseFloat(e.target.value) || 0; });
    bind('pp-soil', function(e) { if (el.soil) el.soil.type = e.target.value; });
    bind('pp-sun',  function(e) { if (el.microclimate) el.microclimate.sunExposure = e.target.value; });
    bind('pp-fence-style',  function(e) { el.fenceStyle = e.target.value; });
    bind('pp-fence-closed', function(e) { el.closed = e.target.checked; });
    bind('pp-path-style',   function(e) { el.pathStyle = e.target.value; });
    bind('pp-tree-type',    function(e) { el.treeType = e.target.value; });
  },
};

function esc(str) {
  return String(str).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
