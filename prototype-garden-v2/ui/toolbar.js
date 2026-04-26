// =============================================================
//  TOOLBAR — barre d'outils latérale
// =============================================================

var Toolbar = {
  activeTool: 'select',

  init: function() {
    var self = this;

    document.querySelectorAll('[data-tool]').forEach(function(btn) {
      btn.addEventListener('click', function() { self.setTool(btn.dataset.tool); });
    });

    var btnUndo   = document.getElementById('btn-undo');
    var btnDelete = document.getElementById('btn-delete');
    var btnSave   = document.getElementById('btn-save');
    var btnReset  = document.getElementById('btn-reset');
    var btnSnap   = document.getElementById('btn-snap');
    var btnFenceDone   = document.getElementById('btn-fence-done');
    var btnFenceCancel = document.getElementById('btn-fence-cancel');

    if (btnUndo)   btnUndo.addEventListener('click',   function() { self.undo(); });
    if (btnDelete) btnDelete.addEventListener('click', function() { self.deleteSelected(); });
    if (btnSave)   btnSave.addEventListener('click',   function() { GardenStore.save(); self._flash(I18N.t('saved')); });
    if (btnReset)  btnReset.addEventListener('click',  function() {
      GardenStore.elements = [];
      GardenStore.selectedId = null;
      Panels.update(null);
      self._flash('Terrain effacé');
    });
    if (btnSnap)   btnSnap.addEventListener('click',   function() {
      AppState.snapToGrid = !AppState.snapToGrid;
      btnSnap.classList.toggle('active', AppState.snapToGrid);
    });
    if (btnFenceDone)   btnFenceDone.addEventListener('click',   function() { Interactions.finishFenceDraw(); });
    if (btnFenceCancel) btnFenceCancel.addEventListener('click', function() { Interactions.cancelFenceDraw(); });
  },

  setTool: function(tool) {
    this.activeTool = tool;

    // Mise à jour mode
    if (tool === 'select') {
      AppState.mode = 'select';
      AppState.createType = null;
      AppState.ghostPos   = null;
    } else {
      AppState.mode = 'create';
      AppState.createType = tool;
      AppState.ghostPos   = null;
      // Démarrage dessin clôture : attendre le clic sur canvas
    }

    // Visuel boutons
    document.querySelectorAll('[data-tool]').forEach(function(btn) {
      btn.classList.toggle('active', btn.dataset.tool === tool);
    });

    // Panneau clôture
    var fp = document.getElementById('fence-panel');
    if (fp) fp.style.display = (tool === 'fence') ? 'flex' : 'none';

    // Si on quitte la clôture, annuler le dessin en cours
    if (tool !== 'fence' && Renderer && Renderer.fenceDrawMode) {
      Interactions.cancelFenceDraw();
    }

    this.updateModeIndicator();
  },

  // Quitte le mode création → revient à select
  exitCreateMode: function() {
    AppState.mode = 'select';
    AppState.createType = null;
    AppState.ghostPos   = null;

    this.activeTool = 'select';
    document.querySelectorAll('[data-tool]').forEach(function(btn) {
      btn.classList.toggle('active', btn.dataset.tool === 'select');
    });

    var fp = document.getElementById('fence-panel');
    if (fp) fp.style.display = 'none';

    this.updateModeIndicator();
  },

  updateModeIndicator: function() {
    var ind = document.getElementById('mode-indicator');
    if (!ind) return;
    if (AppState.mode === 'create') {
      ind.textContent = '✏️ ' + I18N.t('mode_create');
      ind.className = 'mode-badge mode-create';
    } else {
      ind.textContent = '🖱️ ' + I18N.t('mode_select');
      ind.className = 'mode-badge mode-select';
    }
  },

  deleteSelected: function() {
    var sel = GardenStore.getSelected();
    if (!sel) return;
    AppState.vertexMode    = false;
    AppState.vertexDragIdx = -1;
    GardenStore.remove(sel.id);
    Panels.update(null);
    GardenStore.save();
  },

  undo: function() {
    // v3+ : GardenStore.history
    console.log('Undo: not yet implemented');
  },

  updateDeleteBtn: function(hasSelection) {
    var btn = document.getElementById('btn-delete');
    if (btn) btn.disabled = !hasSelection;
  },

  _flash: function(msg) {
    var toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.style.opacity = '1';
    setTimeout(function() { toast.style.opacity = '0'; }, 1800);
  },
};
