// Green Vibes — modules/garden-bridge.js
// Pont de données + mode vue + gestion boucle PWA

var GardenBridge = {
  _syncing:  false,
  _viewMode: false,

  // ── Sync beds + serres canvas → APP.beds ───────────────────
  syncToApp: function() {
    if (this._syncing) return;
    this._syncing = true;

    var appBeds     = (getAppState('beds') || []).slice();
    var appDirty    = false;
    var gardenDirty = false;

    GardenStore.elements
      .filter(function(el) { return el.type === 'bed' || el.type === 'serre'; })
      .forEach(function(gEl) {
        var length = Math.round(px2m(gEl.dimensions.width)  * 10) / 10;
        var width  = Math.round(px2m(gEl.dimensions.height) * 10) / 10;
        var name   = gEl.label || (gEl.type === 'serre' ? 'Serre' : 'Carré');
        var notes  = gEl.type === 'serre'
          ? '🏡 Serre — +' + (gEl.microclimateBonus || 2) + '°C'
          : (gEl.notes || '');

        var gSoil    = (gEl.soil && gEl.soil.type) || null;
        var gSun     = (gEl.microclimate && gEl.microclimate.sunExposure) || null;
        var gMulched = !!gEl.mulched;

        if (gEl.appBedId) {
          var appBed = appBeds.find(function(b) { return b.id === gEl.appBedId; });
          if (appBed) {
            var changed = appBed.name !== name || appBed.length !== length || appBed.width !== width
              || (gSoil && appBed.soil !== gSoil) || (gSun && appBed.sun !== gSun)
              || appBed.mulched !== gMulched;
            if (changed) {
              appBed.name    = name;
              appBed.length  = length;
              appBed.width   = width;
              if (gEl.type === 'serre') appBed.notes = notes;
              if (gSoil) appBed.soil = gSoil;
              if (gSun)  appBed.sun  = gSun;
              appBed.mulched = gMulched;
              appDirty = true;
            }
          } else {
            var rb = GardenBridge._makeAppBed(gEl.id, name, length, width, notes, gSoil, gSun, gMulched);
            appBeds.push(rb);
            gEl.appBedId = rb.id;
            appDirty    = true;
            gardenDirty = true;
          }
        } else {
          var nb = GardenBridge._makeAppBed(gEl.id, name, length, width, notes, gSoil, gSun, gMulched);
          appBeds.push(nb);
          gEl.appBedId = nb.id;
          appDirty    = true;
          gardenDirty = true;
        }
      });

    if (appDirty)    updateAppState('beds', appBeds);
    if (gardenDirty) GardenBridge._saveGardenRaw();

    this._syncing = false;
  },

  _makeAppBed: function(gardenElId, name, length, width, notes, soil, sun, mulched) {
    return {
      id:         genId(),
      name:       name,
      length:     length,
      width:      width,
      notes:      notes || '',
      gardenElId: gardenElId,
      soil:       soil    || null,
      sun:        sun     || null,
      mulched:    !!mulched,
    };
  },

  _saveGardenRaw: function() {
    try {
      localStorage.setItem('garden_v2', JSON.stringify({
        version:     GardenStore.version,
        northAngle:  GardenStore.northAngle,
        elements:    GardenStore.elements,
        location:    GardenStore.location,
        climateZone: GardenStore.climateZone,
      }));
    } catch(e) {}
  },

  // ── Toast ───────────────────────────────────────────────────
  _toast: function(msg) {
    var toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.style.opacity = '1';
    setTimeout(function() { toast.style.opacity = '0'; }, 1800);
  },

  // ── Bouton "Valider" : sauvegarde + ferme le panneau ───────
  appendValidateButton: function(el) {
    var c = document.getElementById('prop-panel');
    if (!c) return;
    var isEn = getAppState('language') === 'en';
    var div  = document.createElement('div');
    div.style.cssText = 'margin-top:10px;padding-top:8px;border-top:1px solid #cdd9c5';
    var btn  = document.createElement('button');
    btn.className   = 'gd-climate-btn';
    btn.textContent = '✓ ' + (isEn ? 'Save & close' : 'Valider');
    btn.addEventListener('click', function() {
      GardenStore.save();
      Panels.update(null);
      GardenBridge._toast(isEn ? 'Saved!' : 'Validé !');
    });
    div.appendChild(btn);
    c.appendChild(div);
  },

  // ── Bloc climatique ─────────────────────────────────────────
  _doyToStr: function(doy) {
    if (!doy) return null;
    var lang = getAppState('language') || 'fr';
    var d = new Date(2001, 0, doy);
    return lang === 'en'
      ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      : d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
  },

  appendClimatePanel: function(el) {
    var c = document.getElementById('prop-panel');
    if (!c) return;
    // Supprimer l'ancien bloc si présent (refresh en direct)
    var old = c.querySelector('.gd-climate-block');
    if (old) old.parentNode.removeChild(old);

    var lang    = getAppState('language') || 'fr';
    var climate = (typeof ClimateModule !== 'undefined') ? ClimateModule.get() : null;
    var isEn    = lang === 'en';
    var isSerre = el.type === 'serre';
    var bonus   = isSerre ? (el.microclimateBonus || 2) : 0;

    var block = document.createElement('div');
    block.className = 'gd-climate-block';

    var title = document.createElement('div');
    title.className   = 'gd-climate-title';
    title.textContent = (isSerre ? '🏡 ' : '🌡️ ')
      + (isEn ? 'Local climate' : 'Climat local');
    block.appendChild(title);

    if (isSerre) {
      var bonusRow = document.createElement('div');
      bonusRow.className = 'gd-climate-row';
      bonusRow.innerHTML = (isEn ? '🌡️ Greenhouse bonus'
        : '🌡️ Bonus serre')
        + ' : <strong>+' + bonus + '°C</strong>';
      block.appendChild(bonusRow);
    }

    if (climate) {
      var doyAdj = Math.round(bonus / 0.6);
      var lastFrostDOY  = climate.lastFrostDOY  ? climate.lastFrostDOY  - doyAdj : null;
      var firstFrostDOY = climate.firstFrostDOY ? climate.firstFrostDOY + doyAdj : null;

      if (!isSerre) {
        if (climate.koppen) {
          var kRow = document.createElement('div');
          kRow.className   = 'gd-climate-row';
          kRow.textContent = '🌍 '
            + climate.koppen + ' — '
            + ClimateModule.koppenLabel(climate.koppen);
          block.appendChild(kRow);
        }
        if (climate.hardinessZone) {
          var uRow = document.createElement('div');
          uRow.className   = 'gd-climate-row';
          uRow.textContent = '🏷️ USDA ' + climate.hardinessZone;
          block.appendChild(uRow);
        }
      }

      var pfx = isSerre ? (isEn ? 'In greenhouse — ' : 'En serre — ') : '';
      var lf  = GardenBridge._doyToStr(lastFrostDOY  || climate.lastFrostDOY);
      var ff  = GardenBridge._doyToStr(firstFrostDOY || climate.firstFrostDOY);

      if (lf) {
        var lfRow = document.createElement('div');
        lfRow.className = 'gd-climate-row';
        lfRow.innerHTML = '❄️ ' + pfx + (isEn ? 'Last frost' : 'Dernière gelée')
          + ' : <strong>' + lf + '</strong>';
        block.appendChild(lfRow);
      }
      if (ff) {
        var ffRow = document.createElement('div');
        ffRow.className = 'gd-climate-row';
        ffRow.innerHTML = '🍂 ' + pfx + (isEn ? '1st frost' : '1ère gelée')
          + ' : <strong>' + ff + '</strong>';
        block.appendChild(ffRow);
      }

      if (climate.growingSeasonDays) {
        var sun     = el.microclimate && el.microclimate.sunExposure;
        var sunAdj  = isSerre ? 0 : (sun === 'shade' ? -21 : sun === 'partial' ? -10 : 0);
        var serAdj  = isSerre ? doyAdj * 2 : 0;
        var effDays = Math.max(0, climate.growingSeasonDays + sunAdj + serAdj);
        var extra   = '';
        if (isSerre && serAdj > 0) {
          extra = ' <span class="gd-climate-ok">(+' + serAdj + ' j)</span>';
        } else if (sunAdj < 0) {
          extra = ' <span class="gd-climate-warn">('
            + (isEn ? 'shade −' : 'ombre −')
            + Math.abs(sunAdj) + ' j)</span>';
        }
        var sRow = document.createElement('div');
        sRow.className = 'gd-climate-row';
        sRow.innerHTML = '🌱 '
          + (isEn ? 'Season' : 'Saison')
          + ' : <strong>' + effDays + ' j</strong>' + extra;
        block.appendChild(sRow);
      }
    } else {
      var noRow = document.createElement('div');
      noRow.className = 'gd-climate-row gd-climate-none';
      noRow.textContent = isEn ? 'No climate profile yet.' : 'Profil climatique absent.';
      block.appendChild(noRow);
      var setupBtn = document.createElement('button');
      setupBtn.className   = 'gd-climate-btn';
      setupBtn.textContent = isEn ? 'Set up →' : 'Configurer →';
      setupBtn.addEventListener('click', function() { navigate('settings'); });
      block.appendChild(setupBtn);
    }

    if (el.appBedId) {
      var linkBtn = document.createElement('button');
      linkBtn.className   = 'gd-climate-btn gd-link-btn';
      linkBtn.textContent = '🌿 '
        + (isEn ? 'Open in app' : "Voir dans l'app") + ' →';
      linkBtn.addEventListener('click', function() { navigate('beds'); });
      block.appendChild(linkBtn);
    }

    c.appendChild(block);
  },

  // Mise à jour du bloc climatique en direct quand sol/soleil change
  _bindLiveClimateUpdate: function(el) {
    var doUpdate = function() { GardenBridge.appendClimatePanel(el); };
    var soilSel = document.getElementById('pp-soil');
    var sunSel  = document.getElementById('pp-sun');
    if (soilSel) soilSel.addEventListener('change', doUpdate);
    if (sunSel)  sunSel.addEventListener('change', doUpdate);
  },

  // ── Mode vue / édition ─────────────────────────────────────
  setViewMode: function(isView) {
    this._viewMode = isView;
    GardenStore.mode = isView ? 'view' : 'edit';

    var page = document.getElementById('pageGarden');
    if (page) page.classList.toggle('gd-viewmode', isView);

    if (isView) {
      GardenStore.selectedId = null;
      Panels.update(null);
    }

    var ind = document.getElementById('mode-indicator');
    if (ind) {
      if (isView) {
        var isEn2 = getAppState('language') === 'en';
        ind.textContent = '👁️ ' + (isEn2 ? 'View mode' : 'Mode vue');
        ind.className   = 'mode-badge mode-view';
      } else {
        Toolbar.updateModeIndicator();
      }
    }
  },

  toggleViewMode: function() { this.setViewMode(!this._viewMode); },

  // ── Partage du jardin via URL ──────────────────────────────
  shareGarden: function() {
    var raw = localStorage.getItem('garden_v2');
    if (!raw) {
      this._toast('Aucune donnée à partager.');
      return;
    }
    try {
      var b64  = btoa(unescape(encodeURIComponent(raw)));
      var url  = location.origin + location.pathname + '#garden=' + b64;
      navigator.clipboard.writeText(url).then(function() {
        GardenBridge._toast('Lien copié ! Ouvrez-le sur votre téléphone.');
      }).catch(function() {
        // Fallback si clipboard refusé
        prompt('Copiez ce lien sur votre téléphone :', url);
      });
    } catch(e) {
      this._toast('Erreur lors du partage.');
    }
  },
};

// ── Hook 1 : sync après sauvegarde canvas ──────────────────
(function() {
  var _orig = GardenStore.save.bind(GardenStore);
  GardenStore.save = function() {
    var ok = _orig();
    GardenBridge.syncToApp();
    return ok;
  };
}());

// ── Hook 2 : surface des serres ────────────────────────────
(function() {
  var _origCompute = GardenStore._computeSurfaces.bind(GardenStore);
  GardenStore._computeSurfaces = function() {
    _origCompute();
    this.elements
      .filter(function(e) { return e.type === 'serre'; })
      .forEach(function(serre) {
        serre.surface = (serre.pts && serre.pts.length >= 3)
          ? polyAreaNorm(serre.pts) * px2m(serre.dimensions.width) * px2m(serre.dimensions.height)
          : px2m(serre.dimensions.width) * px2m(serre.dimensions.height);
      });
  };
}());

// ── Hook 3 : panneau propriétés — valider + climat ─────────
(function() {
  var _origUpdate = Panels.update.bind(Panels);
  Panels.update = function(el) {
    _origUpdate(el);

    // Mobile : bottom sheet
    if (typeof GardenMobile !== 'undefined' && GardenMobile.isMobile()) {
      if (el) {
        GardenMobile.showSheet(el);
      } else if (GardenMobile._sheetState !== 'closed') {
        GardenMobile.hideSheet();
      }
      return;
    }

    // Desktop : prop-panel latéral
    var panel = document.getElementById('prop-panel');
    if (!panel) return;
    if (el) {
      panel.style.display = 'block';
      GardenBridge.appendValidateButton(el);
      if (el.type === 'bed' || el.type === 'serre') {
        GardenBridge.appendClimatePanel(el);
        GardenBridge._bindLiveClimateUpdate(el);
      }
    } else {
      panel.style.display = 'none';
    }
  };
}());

// ── Hook 4 : interactions mouse ────────────────────────────
(function() {
  var _origMouseDown = Interactions.onMouseDown.bind(Interactions);
  Interactions.onMouseDown = function(e) {
    // Mode vue : pan uniquement
    if (GardenBridge._viewMode) {
      var rect0 = Renderer.canvas.getBoundingClientRect();
      AppState.panning   = true;
      AppState.panStartX = e.clientX - rect0.left;
      AppState.panStartY = e.clientY - rect0.top;
      AppState.panCamX   = Camera.x;
      AppState.panCamY   = Camera.y;
      return;
    }
    // Fix clôture : le 1er clic doit initialiser le tracé
    // (le code original exclut fence du chemin addElement)
    if (AppState.mode === 'create'
        && AppState.createType === 'fence'
        && !Renderer.fenceDrawMode) {
      var rect1 = Renderer.canvas.getBoundingClientRect();
      var w1    = Camera.toWorld(e.clientX - rect1.left, e.clientY - rect1.top);
      Interactions.addElement('fence', w1.x, w1.y);
      return;
    }
    _origMouseDown(e);
  };
}());

// ── Hook 5b : retour mode select après ajout (mobile) ────────
(function() {
  var _origAdd = Interactions.addElement.bind(Interactions);
  Interactions.addElement = function(type, wx, wy) {
    _origAdd(type, wx, wy);
    if (type === 'fence') return;
    if (typeof GardenMobile !== 'undefined' && GardenMobile.isMobile()) {
      var isEn = getAppState('language') === 'en';
      GardenBridge._toast(isEn ? 'Element added! Tap to move it.' : 'Élément ajouté ! Appuyez dessus pour le déplacer.');
      setTimeout(function() { Toolbar.exitCreateMode(); }, 80);
    }
  };
}());

// ── Hook 5 : touches clavier ───────────────────────────────
// Delete/Backspace ne doit pas supprimer si le focus est dans un champ
(function() {
  var _origKeyDown = Interactions.onKeyDown.bind(Interactions);
  Interactions.onKeyDown = function(e) {
    if (e.key === 'Delete' || e.key === 'Backspace') {
      var tag = document.activeElement && document.activeElement.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    }
    _origKeyDown(e);
  };
}());

// ── Hook 6 : clôture mobile — glissé pour définir un segment ───────────
// Sur desktop : tap to add point (comportement inchangé via onMouseDown).
// Sur mobile  : touchstart = début du glissé, touchend = confirme le point.
//   → Le preview s'anime en temps réel pendant le glissé.
//   → Le relâchement ajoute le sommet (pas le toucher initial).
// Cela permet : glisser → relâcher → reglisser depuis le dernier point.
(function() {
  var _origTouchStart = Interactions.onTouchStart;
  var _origTouchEnd   = Interactions.onTouchEnd;

  Interactions.onTouchStart = function(e) {
    // En mode tracé clôture avec 1 doigt : ne pas ajouter de point au toucher.
    // Le segment sera confirmé au relâchement (touchend).
    if (Renderer.fenceDrawMode && Renderer.fenceDraft && e.touches.length === 1) {
      var rect = Renderer.canvas.getBoundingClientRect();
      var w = Camera.toWorld(e.touches[0].clientX - rect.left, e.touches[0].clientY - rect.top);
      Renderer.fencePreviewPt = { x: snapWorld(w.x), y: snapWorld(w.y) };
      return;
    }
    _origTouchStart.call(this, e);
  };

  Interactions.onTouchEnd = function(e) {
    // En mode tracé clôture : confirmer le sommet à la position de relâchement.
    if (Renderer.fenceDrawMode && Renderer.fenceDraft && e.changedTouches.length >= 1) {
      var rect   = Renderer.canvas.getBoundingClientRect();
      var touch  = e.changedTouches[0];
      var w      = Camera.toWorld(touch.clientX - rect.left, touch.clientY - rect.top);
      var snapped = { x: snapWorld(w.x), y: snapWorld(w.y) };
      var pts     = Renderer.fenceDraft.pts;
      var last    = pts[pts.length - 1];

      // Fermeture automatique si relâchement près du 1er point
      if (pts.length >= 3 && Math.hypot(snapped.x - pts[0].x, snapped.y - pts[0].y) < m2px(0.5)) {
        Renderer.fenceDraft.closed = true;
        Renderer.fencePreviewPt   = null;
        Interactions.finishFenceDraw();
        GardenStore.save();
        return;
      }

      // Ajouter le sommet seulement si le doigt a parcouru ≥ 15 cm (évite les taps accidentels)
      if (Math.hypot(snapped.x - last.x, snapped.y - last.y) >= m2px(0.15)) {
        pts.push(snapped);
        Renderer.fencePreviewPt = null;
      }
      return;
    }
    _origTouchEnd.call(this, e);
  };
}());

// ── Étape 6 : boucle d'animation pauseable ─────────────────
(function() {
  var _running = false;
  var _rafId   = null;

  Renderer.startLoop = function() {
    if (_running) return;
    _running = true;
    var self = Renderer;
    function loop() {
      if (!_running) return;
      self.render();
      _rafId = requestAnimationFrame(loop);
    }
    _rafId = requestAnimationFrame(loop);
  };

  Renderer.pauseLoop = function() {
    _running = false;
    if (_rafId) { cancelAnimationFrame(_rafId); _rafId = null; }
  };

  Renderer.resumeLoop = function() {
    if (!_running) Renderer.startLoop();
  };

  GardenBridge._watchVisibility = function() {
    var page = document.getElementById('pageGarden');
    if (!page || !window.MutationObserver) return;
    new MutationObserver(function() {
      if (page.classList.contains('active')) {
        Renderer.resumeLoop();
      } else {
        Renderer.pauseLoop();
      }
    }).observe(page, { attributes: true, attributeFilter: ['class'] });
  };
}());
