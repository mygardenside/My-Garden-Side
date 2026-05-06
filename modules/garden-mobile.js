// Green Vibes — modules/garden-mobile.js
// Interface mobile : toolbar flottante, FAB, bottom sheet 3-états

var GardenMobile = {
  _activeEl:    null,
  _sheetState:  'closed',   // 'closed' | 'compact' | 'expanded'
  _fabOpen:     false,

  isMobile: function() {
    return window.innerWidth <= 768;
  },

  // ── Initialisation ──────────────────────────────────────────
  init: function() {
    // Pas de check isMobile() ici : si la page charge en desktop puis bascule mobile
    // (DevTools), les listeners doivent déjà être branchés.
    this._initViewToggle();
    this._initFab();
    this._bindSwipe();
    this._bindOverlay();
  },

  _initViewToggle: function() {
    var btn = document.getElementById('gd-m-view');
    if (btn) btn.addEventListener('click', function() {
      GardenBridge.toggleViewMode();
    });
  },

  // ── FAB + menu d'ajout ─────────────────────────────────────
  _initFab: function() {
    var self = this;
    var fab  = document.getElementById('gd-fab');
    var menu = document.getElementById('gd-add-menu');
    if (!fab || !menu) return;

    fab.addEventListener('click', function(e) {
      e.stopPropagation();
      self._fabOpen = !self._fabOpen;
      menu.classList.toggle('open', self._fabOpen);
      fab.classList.toggle('open', self._fabOpen);
    });

    menu.querySelectorAll('[data-tool]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        self._fabOpen = false;
        menu.classList.remove('open');
        fab.classList.remove('open');
      });
    });

    document.addEventListener('click', function(e) {
      if (self._fabOpen && !menu.contains(e.target) && e.target !== fab) {
        self._fabOpen = false;
        menu.classList.remove('open');
        fab.classList.remove('open');
      }
    });
  },

  // ── États du bottom sheet ──────────────────────────────────
  showSheet: function(el) {
    if (!this.isMobile()) return false;
    this._activeEl = el;
    this._buildSheetContent(el);
    // Si le sheet est déjà ouvert (ex: rebind après toggleVertexMode), ne pas changer l'état
    if (this._sheetState === 'closed') this._setState('compact');
    return true;
  },

  hideSheet: function() {
    this._setState('closed');
    this._activeEl = null;
    if (typeof GardenStore !== 'undefined') GardenStore.selectedId = null;
  },

  _setState: function(state) {
    this._sheetState = state;
    var sheet   = document.getElementById('gd-bottom-sheet');
    var overlay = document.getElementById('gd-sheet-overlay');
    if (!sheet) return;

    sheet.classList.remove('compact', 'expanded');
    if (state === 'compact')  sheet.classList.add('compact');
    if (state === 'expanded') sheet.classList.add('expanded');

    // Overlay seulement en état expanded
    if (overlay) {
      if (state === 'expanded') {
        overlay.classList.add('open');
      } else {
        overlay.classList.remove('open');
      }
    }
  },

  // ── Construction du contenu du sheet ──────────────────────
  _buildSheetContent: function(el) {
    var content = document.getElementById('gd-sheet-content');
    var footer  = document.getElementById('gd-sheet-footer');
    if (!content || !el) return;

    var isEn = getAppState('language') === 'en';
    var typeLabel = {
      bed:   isEn ? 'Growing space'  : 'Espace de culture',
      serre: isEn ? 'Greenhouse'     : 'Serre',
      house: isEn ? 'House'          : 'Maison',
      tree:  isEn ? 'Tree'           : 'Arbre',
      path:  isEn ? 'Path'           : 'Chemin',
      fence: isEn ? 'Fence'          : 'Clôture',
    }[el.type] || el.type;

    var surface = el.surface ? el.surface.toFixed(2) + ' m²' : null;
    // Forme libre disponible pour bed, serre, path (pas fence, tree, house)
    var canVertex = (el.type === 'bed' || el.type === 'serre' || el.type === 'path');

    // ── Header avec actions intégrées (toujours visibles en compact) ──
    var html = '<div class="gd-sheet-header">'
             + '<div class="gd-sheet-head-info">'
             + '<div class="gd-sheet-type">' + esc(typeLabel) + '</div>'
             + (surface ? '<div class="gd-sheet-surface">' + surface + '</div>' : '')
             + '</div>'
             + '<div class="gd-sheet-head-btns">'
             + (canVertex ? '<button class="gd-sh-icon-btn" id="gd-sh-vertex" title="' + (isEn ? 'Free shape' : 'Forme libre') + '">⬡</button>' : '')
             + '<button class="gd-sh-icon-btn gd-sh-icon-del" id="gd-sh-del" title="' + (isEn ? 'Delete' : 'Supprimer') + '">🗑</button>'
             + '</div>'
             + '</div>';

    // ── Champs primaires ──

    html += '<label class="gd-sheet-row">'
          + '<span class="gd-sheet-label">' + (isEn ? 'Name' : 'Nom') + '</span>'
          + '<input class="gd-sheet-input" id="gd-sh-label" type="text" value="' + esc(el.label || '') + '">'
          + '</label>';

    if (el.type !== 'fence' && el.type !== 'tree') {
      html += '<label class="gd-sheet-row">'
            + '<span class="gd-sheet-label">' + (isEn ? 'Width (m)' : 'Largeur (m)') + '</span>'
            + '<input class="gd-sheet-input gd-sh-num" id="gd-sh-w" type="number" inputmode="decimal" step="0.1" min="0.1" value="' + px2m(el.dimensions.width) + '">'
            + '</label>'
            + '<label class="gd-sheet-row">'
            + '<span class="gd-sheet-label">' + (isEn ? 'Height (m)' : 'Hauteur (m)') + '</span>'
            + '<input class="gd-sheet-input gd-sh-num" id="gd-sh-h" type="number" inputmode="decimal" step="0.1" min="0.1" value="' + px2m(el.dimensions.height) + '">'
            + '</label>';
    }

    if (el.soil) {
      html += '<label class="gd-sheet-row"><span class="gd-sheet-label">' + (isEn ? 'Soil' : 'Sol') + '</span>'
            + '<select class="gd-sheet-input" id="gd-sh-soil">';
      ['loam','clay','sandy','rich'].forEach(function(s) {
        html += '<option value="' + s + '"' + (el.soil.type === s ? ' selected' : '') + '>' + I18N.t('soil_' + s) + '</option>';
      });
      html += '</select></label>';
    }

    if (el.microclimate) {
      html += '<label class="gd-sheet-row"><span class="gd-sheet-label">' + (isEn ? 'Sun' : 'Soleil') + '</span>'
            + '<select class="gd-sheet-input" id="gd-sh-sun">';
      ['full','partial','shade'].forEach(function(s) {
        html += '<option value="' + s + '"' + (el.microclimate.sunExposure === s ? ' selected' : '') + '>' + I18N.t('sun_' + s) + '</option>';
      });
      html += '</select></label>';
    }

    if (el.type === 'bed' || el.type === 'serre') {
      html += '<label class="gd-sheet-row" style="cursor:pointer;">'
            + '<span class="gd-sheet-label">🌿 ' + (isEn ? 'Mulched' : 'Paillé') + '</span>'
            + '<input type="checkbox" class="gd-sh-checkbox" id="gd-sh-mulched"' + (el.mulched ? ' checked' : '') + '>'
            + '</label>';
    }

    // ── Section secondaire (accordéon) ──
    var secHtml = '';

    if (el.type === 'serre') {
      secHtml += '<label class="gd-sheet-row"><span class="gd-sheet-label">🌡️ Bonus</span>'
               + '<select class="gd-sheet-input" id="gd-sh-bonus">';
      [1,2,3,4,5].forEach(function(v) {
        secHtml += '<option value="' + v + '"' + ((el.microclimateBonus || 2) === v ? ' selected' : '') + '>+' + v + '°C</option>';
      });
      secHtml += '</select></label>';
    }

    if (el.type === 'tree') {
      secHtml += '<label class="gd-sheet-row"><span class="gd-sheet-label">Type</span>'
               + '<select class="gd-sheet-input" id="gd-sh-tree">';
      ['generic','fruit','shrub','conifer','deciduous'].forEach(function(s) {
        secHtml += '<option value="' + s + '"' + (el.treeType === s ? ' selected' : '') + '>' + I18N.t('tree_' + s) + '</option>';
      });
      secHtml += '</select></label>';
    }

    if (el.type === 'path') {
      secHtml += '<label class="gd-sheet-row"><span class="gd-sheet-label">Style</span>'
               + '<select class="gd-sheet-input" id="gd-sh-path">';
      ['gravel','stone','wood','grass'].forEach(function(s) {
        secHtml += '<option value="' + s + '"' + (el.pathStyle === s ? ' selected' : '') + '>' + I18N.t('path_' + s) + '</option>';
      });
      secHtml += '</select></label>';
    }

    if (el.type === 'fence') {
      secHtml += '<label class="gd-sheet-row"><span class="gd-sheet-label">Style</span>'
               + '<select class="gd-sheet-input" id="gd-sh-fence">';
      ['wood','wire','hedge','stone'].forEach(function(s) {
        secHtml += '<option value="' + s + '"' + (el.fenceStyle === s ? ' selected' : '') + '>' + I18N.t('fence_' + s) + '</option>';
      });
      secHtml += '</select></label>';
      secHtml += '<label class="gd-sheet-row"><span class="gd-sheet-label">' + (isEn ? 'Closed' : 'Fermée') + '</span>'
               + '<input type="checkbox" class="gd-sh-checkbox" id="gd-sh-fence-closed"' + (el.closed ? ' checked' : '') + '></label>';
    }

    if (el.type === 'bed' || el.type === 'serre') {
      secHtml += '<div id="gd-sh-climate"></div>';
    }

    if (secHtml) {
      html += '<button class="gd-sh-more-btn" id="gd-sh-more">'
            + (isEn ? 'Details' : 'Détails')
            + ' <span class="gd-sh-more-arrow">▾</span></button>'
            + '<div class="gd-sh-secondary" id="gd-sh-sec">' + secHtml + '</div>';
    }

    content.innerHTML = html;

    // ── Footer (valider uniquement — supprimer est dans le header) ──
    if (footer) {
      footer.innerHTML = '<div class="gd-sheet-actions">'
        + '<button class="gd-sheet-btn gd-sheet-btn-save" id="gd-sh-save">✓ ' + (isEn ? 'Save' : 'Valider') + '</button>'
        + '</div>';
    }

    this._bindSheetEvents(el);
    if (el.type === 'bed' || el.type === 'serre') {
      this._refreshClimateInSheet(el);
    }
  },

  _refreshClimateInSheet: function(el) {
    var container = document.getElementById('gd-sh-climate');
    if (!container || (el.type !== 'bed' && el.type !== 'serre')) return;

    var isEn    = getAppState('language') === 'en';
    var climate = (typeof ClimateModule !== 'undefined') ? ClimateModule.get() : null;
    var isSerre = el.type === 'serre';
    var bonus   = isSerre ? (el.microclimateBonus || 2) : 0;
    var sun     = el.microclimate && el.microclimate.sunExposure;

    var html = '<div class="gd-climate-block"><div class="gd-climate-title">'
             + (isSerre ? '🏡 ' : '🌡️ ') + (isEn ? 'Local climate' : 'Climat local')
             + '</div>';

    if (climate) {
      var doyAdj = Math.round(bonus / 0.6);
      var lf = GardenBridge._doyToStr(climate.lastFrostDOY  ? climate.lastFrostDOY  - doyAdj : null);
      var ff = GardenBridge._doyToStr(climate.firstFrostDOY ? climate.firstFrostDOY + doyAdj : null);
      if (lf) html += '<div class="gd-climate-row">❄️ ' + (isEn ? 'Last frost' : 'Dernière gelée') + ' : <strong>' + lf + '</strong></div>';
      if (ff) html += '<div class="gd-climate-row">🍂 ' + (isEn ? '1st frost'  : '1ère gelée')     + ' : <strong>' + ff + '</strong></div>';
      if (climate.growingSeasonDays) {
        var sunAdj  = isSerre ? 0 : (sun === 'shade' ? -21 : sun === 'partial' ? -10 : 0);
        var serAdj  = isSerre ? doyAdj * 2 : 0;
        var effDays = Math.max(0, climate.growingSeasonDays + sunAdj + serAdj);
        html += '<div class="gd-climate-row">🌱 ' + (isEn ? 'Season' : 'Saison') + ' : <strong>' + effDays + ' j</strong></div>';
      }
    } else {
      html += '<div class="gd-climate-row gd-climate-none">'
            + (isEn ? 'No climate profile.' : 'Profil climatique absent.') + '</div>';
    }
    html += '</div>';
    container.innerHTML = html;
  },

  _bindSheetEvents: function(el) {
    var self = this;

    function onChange(id, fn) { var n = document.getElementById(id); if (n) n.addEventListener('change', fn); }
    function onInput(id, fn)  { var n = document.getElementById(id); if (n) n.addEventListener('input',  fn); }
    function onClick(id, fn)  { var n = document.getElementById(id); if (n) n.addEventListener('click',  fn); }

    onInput('gd-sh-label',         function(e) { el.label = e.target.value; });
    onChange('gd-sh-w',            function(e) { el.dimensions.width  = m2px(parseFloat(e.target.value) || 0.1); GardenStore._computeSurfaces(); });
    onChange('gd-sh-h',            function(e) { el.dimensions.height = m2px(parseFloat(e.target.value) || 0.1); GardenStore._computeSurfaces(); });
    onChange('gd-sh-soil',         function(e) { if (el.soil)         el.soil.type               = e.target.value; });
    onChange('gd-sh-sun',          function(e) { if (el.microclimate) el.microclimate.sunExposure = e.target.value; self._refreshClimateInSheet(el); });
    onChange('gd-sh-bonus',        function(e) { el.microclimateBonus = parseInt(e.target.value, 10); self._refreshClimateInSheet(el); });
    onChange('gd-sh-tree',         function(e) { el.treeType   = e.target.value; });
    onChange('gd-sh-path',         function(e) { el.pathStyle  = e.target.value; });
    onChange('gd-sh-fence',        function(e) { el.fenceStyle = e.target.value; });
    onChange('gd-sh-fence-closed', function(e) { el.closed     = e.target.checked; });
    onChange('gd-sh-mulched',     function(e) { el.mulched    = e.target.checked; });

    // Bouton Forme libre (vertex mode) — ne change PAS l'état du sheet
    onClick('gd-sh-vertex', function() {
      if (typeof Interactions !== 'undefined') Interactions.toggleVertexMode();
    });

    // Accordéon secondaire
    onClick('gd-sh-more', function() {
      var btn = document.getElementById('gd-sh-more');
      var sec = document.getElementById('gd-sh-sec');
      if (!btn || !sec) return;
      var open = sec.classList.toggle('open');
      btn.classList.toggle('open', open);
      if (open && self._sheetState === 'compact') self._setState('expanded');
    });

    onClick('gd-sh-save', function() {
      GardenStore.save();
      self.hideSheet();
      GardenBridge._toast(getAppState('language') === 'en' ? 'Saved!' : 'Validé !');
    });

    onClick('gd-sh-del', function() {
      var isEn = getAppState('language') === 'en';
      if (!confirm(isEn ? 'Delete this element?' : 'Supprimer cet élément ?')) return;
      GardenStore.remove(el.id);
      GardenStore.save();
      self.hideSheet();
    });
  },

  // ── Swipe 3-états sur le handle ────────────────────────────
  _bindSwipe: function() {
    var self   = this;
    var handle = document.getElementById('gd-sheet-handle');
    var sheet  = document.getElementById('gd-bottom-sheet');
    if (!handle || !sheet) return;

    var startY      = 0;
    var startState  = 'closed';
    var moved       = false;

    handle.addEventListener('touchstart', function(e) {
      startY     = e.touches[0].clientY;
      startState = self._sheetState;
      moved      = false;
      sheet.style.transition = 'none';
    }, { passive: true });

    handle.addEventListener('touchmove', function(e) {
      var dy = e.touches[0].clientY - startY;
      if (Math.abs(dy) > 5) moved = true;
      var baseOffset = startState === 'expanded' ? 0 : window.innerHeight * 0.42;
      var offset = Math.max(0, baseOffset + dy);
      // translateX(-50%) maintenu pour garder le panneau centré pendant le drag
      sheet.style.transform = 'translateX(-50%) translateY(' + offset + 'px)';
    }, { passive: true });

    handle.addEventListener('touchend', function(e) {
      var dy = e.changedTouches[0].clientY - startY;

      if (moved) {
        e.preventDefault(); // bloque le click synthétique

        // Déterminer le nouvel état
        var next = null;
        if (startState === 'expanded') {
          next = dy > 80 ? 'compact' : 'expanded';
        } else if (startState === 'compact') {
          if      (dy > 80)  next = 'closed';
          else if (dy < -50) next = 'expanded';
          else               next = 'compact';
        }

        if (next) {
          // Appliquer l'état AVANT de libérer le style inline :
          // la feuille de style sait déjà vers quelle valeur animer.
          if (next === 'closed') self.hideSheet();
          else                   self._setState(next);
        }
        // Réactiver la transition puis libérer le inline — l'animation part
        // de la position du drag vers la cible CSS.
        sheet.style.transition = '';
        sheet.style.transform  = '';
      } else {
        sheet.style.transition = '';
        sheet.style.transform  = '';
      }
      // si !moved : le click natif gère le tap
    }, { passive: false });

    // Tap sur le handle → bascule compact/expanded
    handle.addEventListener('click', function() {
      if (self._sheetState === 'compact')       self._setState('expanded');
      else if (self._sheetState === 'expanded') self._setState('compact');
    });
  },

  // ── Overlay : clic → repli en compact ─────────────────────
  _bindOverlay: function() {
    var self    = this;
    var overlay = document.getElementById('gd-sheet-overlay');
    if (overlay) overlay.addEventListener('click', function() { self._setState('compact'); });
  },
};
