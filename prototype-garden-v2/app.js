// =============================================================
//  APP — interactions souris + clavier + état global
// =============================================================

var AppState = {
  mode:       'select',   // 'select' | 'create'
  createType: null,

  dragging:  false,
  dragEl:    null,
  dragOffX:  0,
  dragOffY:  0,

  resizing:       false,
  resizeEl:       null,
  resizeHandle:   null,
  resizeOriginX:  0,
  resizeOriginY:  0,
  resizeOriginW:  0,
  resizeOriginH:  0,
  resizeMouseX:   0,
  resizeMouseY:   0,

  rotating:   false,
  rotateEl:   null,
  rotateCX:   0,
  rotateCY:   0,

  panning:   false,
  panStartX: 0,
  panStartY: 0,
  panCamX:   0,
  panCamY:   0,

  snapToGrid: false,

  compassDragging:    false,
  compassCenterX:     0,
  compassCenterY:     0,
  compassAngleStart:  0,
  compassNorthStart:  0,

  ghostPos: null,

  // ── Vertex editing ───────────────────────────────────────
  vertexMode:    false,
  vertexDragIdx: -1,

  lastTouchDist: null,
};

// ── Snap à la grille ─────────────────────────────────────────
function snapWorld(v) {
  if (!AppState.snapToGrid) return v;
  return Math.round(v / PX_PER_M) * PX_PER_M;
}

// ── Hit testing des handles ──────────────────────────────────
function hitResizeHandle(el, wx, wy) {
  if (AppState.vertexMode) return null;
  if (!el.dimensions || el.type === 'fence' || el.type === 'tree') return null;
  var r = handleHitRadius();
  var handles = getResizeHandles(el);
  for (var key in handles) {
    var h = handles[key];
    if (Math.hypot(wx - h.x, wy - h.y) < r) return key;
  }
  return null;
}

function hitRotationHandle(el, wx, wy) {
  if (AppState.vertexMode) return false;
  if (!el.dimensions || el.type === 'fence' || el.type === 'tree') return false;
  var rh = getRotationHandlePos(el);
  return Math.hypot(wx - rh.x, wy - rh.y) < handleHitRadius();
}

function hitCompass(sx, sy, canvasW) {
  return Math.hypot(sx - (canvasW - 50), sy - 60) < 32;
}

// Hit test sur les handles vertex (retourne le handle ou null)
function hitVertexHandleAt(el, wx, wy) {
  if (!AppState.vertexMode || !el.pts) return null;
  var r = handleHitRadius() * 1.4;
  var handles = getVertexHandles(el);
  for (var i = 0; i < handles.length; i++) {
    if (Math.hypot(wx - handles[i].x, wy - handles[i].y) < r) return handles[i];
  }
  return null;
}

// ── Curseur dynamique ────────────────────────────────────────
function updateCursor(canvas, wx, wy) {
  if (AppState.mode === 'create') {
    canvas.style.cursor = 'crosshair';
    return;
  }
  if (AppState.vertexMode && AppState.vertexDragIdx >= 0) {
    canvas.style.cursor = 'grabbing';
    return;
  }
  if (AppState.dragging)  { canvas.style.cursor = 'grabbing'; return; }
  if (AppState.resizing)  { canvas.style.cursor = AppState.resizeCursor || 'se-resize'; return; }
  if (AppState.rotating)  { canvas.style.cursor = 'grabbing'; return; }
  if (AppState.panning)   { canvas.style.cursor = 'grabbing'; return; }

  var sel = GardenStore.getSelected();
  if (sel) {
    if (AppState.vertexMode && sel.pts) {
      var vh = hitVertexHandleAt(sel, wx, wy);
      if (vh) {
        canvas.style.cursor = vh.type === 'v' ? 'grab' : 'copy';
        return;
      }
      canvas.style.cursor = 'default';
      return;
    }
    if (hitRotationHandle(sel, wx, wy)) { canvas.style.cursor = 'grab'; return; }
    var handle = hitResizeHandle(sel, wx, wy);
    if (handle) { canvas.style.cursor = getResizeHandles(sel)[handle].cursor; return; }
  }
  var hit = Interactions.hitTest(wx, wy);
  canvas.style.cursor = hit ? 'grab' : 'default';
}

// ── Interactions ─────────────────────────────────────────────
var Interactions = {

  addElement: function(type, wx, wy) {
    wx = snapWorld(wx); wy = snapWorld(wy);
    var el;
    switch (type) {
      case 'bed':   el = createBed(wx, wy);   break;
      case 'serre': el = createSerre(wx, wy); break;
      case 'house': el = createHouse(wx, wy); break;
      case 'tree':  el = createTree(wx, wy);  break;
      case 'path':  el = createPath(wx, wy);  break;
      case 'fence':
        Renderer.fenceDrawMode = true;
        Renderer.fenceDraft = createFence();
        Renderer.fenceDraft.pts = [{ x: wx, y: wy }];
        GardenStore.add(Renderer.fenceDraft);
        AppState.mode = 'create';
        AppState.createType = 'fence';
        return;
      default: return;
    }
    if (el.dimensions) {
      el.position.x -= el.dimensions.width  / 2;
      el.position.y -= el.dimensions.height / 2;
    }
    GardenStore.add(el);
    Panels.update(el);
    Toolbar.exitCreateMode();
  },

  finishFenceDraw: function() {
    Renderer.fenceDrawMode  = false;
    Renderer.fencePreviewPt = null;
    Renderer.fenceDraft     = null;
    Toolbar.exitCreateMode();
  },

  cancelFenceDraw: function() {
    if (Renderer.fenceDraft) GardenStore.remove(Renderer.fenceDraft.id);
    Renderer.fenceDrawMode  = false;
    Renderer.fencePreviewPt = null;
    Renderer.fenceDraft     = null;
    AppState.ghostPos = null;
    Toolbar.exitCreateMode();
  },

  // Active/désactive le mode vertex pour l'élément sélectionné
  toggleVertexMode: function() {
    var sel = GardenStore.getSelected();
    if (!sel || sel.type === 'fence' || sel.type === 'tree' || sel.type === 'house') return;
    AppState.vertexMode = !AppState.vertexMode;
    AppState.vertexDragIdx = -1;
    if (AppState.vertexMode && !sel.pts) {
      // Initialiser avec les coins du rectangle
      sel.pts = [[-0.5, -0.5], [0.5, -0.5], [0.5, 0.5], [-0.5, 0.5]];
    }
    Panels.update(sel);
  },

  // ── Hit testing ─────────────────────────────────────────
  hitTest: function(wx, wy) {
    var els = GardenStore.elements;
    for (var i = els.length - 1; i >= 0; i--) {
      var el = els[i];
      if (el.type === 'fence') {
        if (this._hitFence(el, wx, wy)) return el;
        continue;
      }
      if (el.type === 'tree') {
        if (Math.hypot(wx - el.position.x, wy - el.position.y) < (el.canopyRadius || 30) + 4) return el;
        continue;
      }
      var x = el.position.x, y = el.position.y;
      var w = el.dimensions.width, h = el.dimensions.height;
      // Test polygone custom
      if (el.pts && el.pts.length >= 3) {
        var cx = x + w / 2, cy = y + h / 2;
        var rot = -(el.rotation || 0) * Math.PI / 180;
        var dx = wx - cx, dy = wy - cy;
        var lx = dx * Math.cos(rot) - dy * Math.sin(rot);
        var ly = dx * Math.sin(rot) + dy * Math.cos(rot);
        if (ptInPolyNorm(el.pts, lx / w, ly / h)) return el;
        continue;
      }
      // AABB pour rectangle
      if (wx >= x && wx <= x + w && wy >= y && wy <= y + h) return el;
    }
    return null;
  },

  _hitFence: function(el, wx, wy) {
    if (!el.pts || el.pts.length < 2) return false;
    var thresh = m2px(0.3) + 6 / Camera.zoom;
    var n = el.pts.length;
    for (var i = 0; i < n - 1; i++) {
      if (distToSeg(wx, wy, el.pts[i].x, el.pts[i].y, el.pts[i+1].x, el.pts[i+1].y) < thresh) return true;
    }
    if (el.closed && n >= 3) {
      if (distToSeg(wx, wy, el.pts[n-1].x, el.pts[n-1].y, el.pts[0].x, el.pts[0].y) < thresh) return true;
    }
    return false;
  },

  // ── Mouse ────────────────────────────────────────────────
  onMouseDown: function(e) {
    var rect = Renderer.canvas.getBoundingClientRect();
    var sx = e.clientX - rect.left;
    var sy = e.clientY - rect.top;
    var w  = Camera.toWorld(sx, sy);

    if (e.button === 1 || e.altKey) {
      AppState.panning = true;
      AppState.panStartX = sx; AppState.panStartY = sy;
      AppState.panCamX = Camera.x; AppState.panCamY = Camera.y;
      return;
    }

    // Compass
    if (hitCompass(sx, sy, Renderer.canvas.clientWidth)) {
      AppState.compassDragging  = true;
      AppState.compassCenterX   = Renderer.canvas.clientWidth - 50;
      AppState.compassCenterY   = 60;
      AppState.compassNorthStart = GardenStore.northAngle;
      AppState.compassAngleStart = Math.atan2(sy - 60, sx - (Renderer.canvas.clientWidth - 50)) * 180 / Math.PI;
      return;
    }

    // Mode dessin clôture
    if (Renderer.fenceDrawMode && Renderer.fenceDraft) {
      var pts = Renderer.fenceDraft.pts;
      if (pts.length >= 2 && Math.hypot(w.x - pts[0].x, w.y - pts[0].y) < m2px(0.6)) {
        Renderer.fenceDraft.closed = true;
        Interactions.finishFenceDraw();
        return;
      }
      pts.push({ x: snapWorld(w.x), y: snapWorld(w.y) });
      return;
    }

    // Mode création → placer
    if (AppState.mode === 'create' && AppState.createType && AppState.createType !== 'fence') {
      Interactions.addElement(AppState.createType, w.x, w.y);
      return;
    }

    var sel = GardenStore.getSelected();

    // ── Mode vertex ──────────────────────────────────────────
    if (AppState.vertexMode && sel && sel.pts) {
      var vh = hitVertexHandleAt(sel, w.x, w.y);
      if (vh) {
        if (vh.type === 'v') {
          AppState.vertexDragIdx = vh.idx;
        } else {
          // Insérer un nouveau sommet au milieu de l'arête
          var pi  = vh.idx;
          var pt1 = sel.pts[pi];
          var pt2 = sel.pts[(pi + 1) % sel.pts.length];
          sel.pts.splice(pi + 1, 0, [(pt1[0] + pt2[0]) / 2, (pt1[1] + pt2[1]) / 2]);
          GardenStore.save();
          Panels.update(sel);
        }
        return;
      }
      // Clic hors de l'élément en mode vertex → déselect + exit
      if (!Interactions.hitTest(w.x, w.y)) {
        AppState.vertexMode    = false;
        AppState.vertexDragIdx = -1;
        GardenStore.selectedId = null;
        Panels.update(null);
        AppState.panning   = true;
        AppState.panStartX = sx; AppState.panStartY = sy;
        AppState.panCamX   = Camera.x; AppState.panCamY = Camera.y;
      }
      return;
    }

    // ── Handles resize + rotation ────────────────────────────
    if (sel) {
      if (hitRotationHandle(sel, w.x, w.y)) {
        AppState.rotating  = true;
        AppState.rotateEl  = sel;
        AppState.rotateCX  = sel.position.x + sel.dimensions.width  / 2;
        AppState.rotateCY  = sel.position.y + sel.dimensions.height / 2;
        return;
      }
      var handle = hitResizeHandle(sel, w.x, w.y);
      if (handle) {
        AppState.resizing       = true;
        AppState.resizeEl       = sel;
        AppState.resizeHandle   = handle;
        AppState.resizeCursor   = getResizeHandles(sel)[handle].cursor;
        AppState.resizeOriginX  = sel.position.x;
        AppState.resizeOriginY  = sel.position.y;
        AppState.resizeOriginW  = sel.dimensions.width;
        AppState.resizeOriginH  = sel.dimensions.height;
        AppState.resizeMouseX   = w.x;
        AppState.resizeMouseY   = w.y;
        return;
      }
    }

    // Hit test éléments
    var hit = Interactions.hitTest(w.x, w.y);
    if (hit) {
      if (GardenStore.selectedId !== hit.id) {
        // Changement de sélection → sortir du mode vertex
        AppState.vertexMode    = false;
        AppState.vertexDragIdx = -1;
      }
      GardenStore.selectedId = hit.id;
      GardenStore.bringToFront(hit);
      AppState.dragging = true;
      AppState.dragEl   = hit;
      AppState.dragOffX = w.x - hit.position.x;
      AppState.dragOffY = w.y - hit.position.y;
      Panels.update(hit);
    } else {
      GardenStore.selectedId = null;
      AppState.vertexMode    = false;
      AppState.vertexDragIdx = -1;
      Panels.update(null);
      AppState.panning   = true;
      AppState.panStartX = sx; AppState.panStartY = sy;
      AppState.panCamX   = Camera.x; AppState.panCamY = Camera.y;
    }
  },

  onMouseMove: function(e) {
    var rect = Renderer.canvas.getBoundingClientRect();
    var sx = e.clientX - rect.left;
    var sy = e.clientY - rect.top;
    var w  = Camera.toWorld(sx, sy);

    // Compass
    if (AppState.compassDragging) {
      var curAng = Math.atan2(sy - AppState.compassCenterY, sx - AppState.compassCenterX) * 180 / Math.PI;
      GardenStore.northAngle = ((AppState.compassNorthStart + curAng - AppState.compassAngleStart) % 360 + 360) % 360;
      return;
    }

    if (AppState.panning) {
      Camera.x = AppState.panCamX + (sx - AppState.panStartX);
      Camera.y = AppState.panCamY + (sy - AppState.panStartY);
      return;
    }

    // Preview mode création
    if (AppState.mode === 'create') {
      AppState.ghostPos = { x: w.x, y: w.y };
      if (Renderer.fenceDrawMode) Renderer.fencePreviewPt = { x: snapWorld(w.x), y: snapWorld(w.y) };
      updateCursor(Renderer.canvas, w.x, w.y);
      return;
    }

    // ── Drag vertex ──────────────────────────────────────────
    if (AppState.vertexMode && AppState.vertexDragIdx >= 0) {
      var sel = GardenStore.getSelected();
      if (sel && sel.pts) {
        var elW = sel.dimensions.width, elH = sel.dimensions.height;
        var cx  = sel.position.x + elW / 2;
        var cy  = sel.position.y + elH / 2;
        var rot = -(sel.rotation || 0) * Math.PI / 180;
        var dx  = w.x - cx, dy = w.y - cy;
        var lx  = dx * Math.cos(rot) - dy * Math.sin(rot);
        var ly  = dx * Math.sin(rot) + dy * Math.cos(rot);
        sel.pts[AppState.vertexDragIdx] = [lx / elW, ly / elH];
      }
      updateCursor(Renderer.canvas, w.x, w.y);
      return;
    }

    // Rotation
    if (AppState.rotating && AppState.rotateEl) {
      var ddx = w.x - AppState.rotateCX;
      var ddy = w.y - AppState.rotateCY;
      AppState.rotateEl.rotation = Math.round(Math.atan2(ddy, ddx) * 180 / Math.PI + 90);
      updateCursor(Renderer.canvas, w.x, w.y);
      return;
    }

    // Resize
    if (AppState.resizing && AppState.resizeEl) {
      var el  = AppState.resizeEl;
      var dxr = w.x - AppState.resizeMouseX;
      var dyr = w.y - AppState.resizeMouseY;
      var ox = AppState.resizeOriginX, oy = AppState.resizeOriginY;
      var ow = AppState.resizeOriginW, oh = AppState.resizeOriginH;
      var min = m2px(0.2);

      switch (AppState.resizeHandle) {
        case 'br': el.dimensions.width  = Math.max(min, snapWorld(ow + dxr));
                   el.dimensions.height = Math.max(min, snapWorld(oh + dyr)); break;
        case 'bl': var nwbl = Math.max(min, snapWorld(ow - dxr));
                   el.dimensions.width  = nwbl;
                   el.position.x = snapWorld(ox + ow - nwbl);
                   el.dimensions.height = Math.max(min, snapWorld(oh + dyr)); break;
        case 'tr': el.dimensions.width  = Math.max(min, snapWorld(ow + dxr));
                   var nhtr = Math.max(min, snapWorld(oh - dyr));
                   el.dimensions.height = nhtr;
                   el.position.y = snapWorld(oy + oh - nhtr); break;
        case 'tl': var nwtl = Math.max(min, snapWorld(ow - dxr));
                   var nhtl = Math.max(min, snapWorld(oh - dyr));
                   el.dimensions.width  = nwtl;
                   el.dimensions.height = nhtl;
                   el.position.x = snapWorld(ox + ow - nwtl);
                   el.position.y = snapWorld(oy + oh - nhtl); break;
        case 'r':  el.dimensions.width  = Math.max(min, snapWorld(ow + dxr)); break;
        case 'l':  var nwl = Math.max(min, snapWorld(ow - dxr));
                   el.dimensions.width  = nwl;
                   el.position.x = snapWorld(ox + ow - nwl); break;
        case 'b':  el.dimensions.height = Math.max(min, snapWorld(oh + dyr)); break;
        case 't':  var nht = Math.max(min, snapWorld(oh - dyr));
                   el.dimensions.height = nht;
                   el.position.y = snapWorld(oy + oh - nht); break;
      }
      GardenStore._computeSurfaces();
      Panels.update(el);
      updateCursor(Renderer.canvas, w.x, w.y);
      return;
    }

    // Drag élément
    if (AppState.dragging && AppState.dragEl) {
      AppState.dragEl.position.x = snapWorld(w.x - AppState.dragOffX);
      AppState.dragEl.position.y = snapWorld(w.y - AppState.dragOffY);
      updateCursor(Renderer.canvas, w.x, w.y);
      return;
    }

    updateCursor(Renderer.canvas, w.x, w.y);
  },

  onMouseUp: function() {
    if (AppState.vertexDragIdx >= 0) {
      GardenStore._computeSurfaces();
      GardenStore.save();
      var updSel = GardenStore.getSelected();
      if (updSel) Panels.update(updSel);
      AppState.vertexDragIdx = -1;
    }
    if (AppState.dragging || AppState.resizing || AppState.rotating || AppState.compassDragging) {
      GardenStore.save();
    }
    AppState.dragging        = false;
    AppState.panning         = false;
    AppState.resizing        = false;
    AppState.rotating        = false;
    AppState.compassDragging = false;
    AppState.dragEl          = null;
    AppState.resizeEl        = null;
    AppState.rotateEl        = null;
  },

  // Double-clic → supprimer un sommet (min 3 sommets)
  onDblClick: function(e) {
    if (!AppState.vertexMode) return;
    var sel = GardenStore.getSelected();
    if (!sel || !sel.pts || sel.pts.length <= 3) return;
    var rect = Renderer.canvas.getBoundingClientRect();
    var sx = e.clientX - rect.left, sy = e.clientY - rect.top;
    var wc = Camera.toWorld(sx, sy);
    var r  = handleHitRadius() * 1.8;
    var handles = getVertexHandles(sel);
    for (var i = 0; i < handles.length; i++) {
      if (handles[i].type === 'v' && Math.hypot(wc.x - handles[i].x, wc.y - handles[i].y) < r) {
        sel.pts.splice(handles[i].idx, 1);
        GardenStore.save();
        return;
      }
    }
  },

  onWheel: function(e) {
    e.preventDefault();
    var rect = Renderer.canvas.getBoundingClientRect();
    Camera.zoomAt(e.clientX - rect.left, e.clientY - rect.top, e.deltaY < 0 ? 1.12 : 1 / 1.12);
  },

  onKeyDown: function(e) {
    if (e.key === 'Escape') {
      if (AppState.vertexMode) {
        AppState.vertexMode    = false;
        AppState.vertexDragIdx = -1;
        var selEsc = GardenStore.getSelected();
        if (selEsc) Panels.update(selEsc);
        return;
      }
      if (Renderer.fenceDrawMode) {
        Interactions.cancelFenceDraw();
      } else if (AppState.mode === 'create') {
        AppState.ghostPos = null;
        Toolbar.exitCreateMode();
      } else {
        GardenStore.selectedId = null;
        Panels.update(null);
      }
      return;
    }
    if ((e.key === 'Delete' || e.key === 'Backspace') && GardenStore.selectedId) {
      e.preventDefault();
      Toolbar.deleteSelected();
    }
  },

  onTouchStart: function(e) {
    if (e.touches.length === 2) {
      AppState.lastTouchDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
    } else if (e.touches.length === 1) {
      this.onMouseDown({
        clientX: e.touches[0].clientX,
        clientY: e.touches[0].clientY,
        button: 0,
        altKey: false,
      });
    }
  },

  onTouchMove: function(e) {
    e.preventDefault();
    if (e.touches.length === 2 && AppState.lastTouchDist) {
      var d  = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      var cx = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      var cy = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      var rect = Renderer.canvas.getBoundingClientRect();
      Camera.zoomAt(cx - rect.left, cy - rect.top, d / AppState.lastTouchDist);
      AppState.lastTouchDist = d;
    } else if (e.touches.length === 1) {
      this.onMouseMove({
        clientX: e.touches[0].clientX,
        clientY: e.touches[0].clientY,
      });
    }
  },

  onTouchEnd: function(e) {
    if (e.touches.length < 2) AppState.lastTouchDist = null;
    if (e.touches.length === 0) {
      this.onMouseUp();
    } else if (e.touches.length === 1) {
      // Transition pinch → 1 doigt : l'état pan/drag est périmé (caméra a bougé
      // pendant le pinch). On réancre proprement sur le doigt restant.
      this.onMouseUp();
      this.onMouseDown({
        clientX: e.touches[0].clientX,
        clientY: e.touches[0].clientY,
        button: 0,
        altKey: false,
      });
    }
  },

  bindAll: function(canvas) {
    canvas.addEventListener('mousedown',  this.onMouseDown.bind(this));
    canvas.addEventListener('mousemove',  this.onMouseMove.bind(this));
    canvas.addEventListener('mouseup',    this.onMouseUp.bind(this));
    canvas.addEventListener('dblclick',   this.onDblClick.bind(this));
    canvas.addEventListener('wheel',      this.onWheel.bind(this), { passive: false });
    canvas.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: true });
    canvas.addEventListener('touchmove',  this.onTouchMove.bind(this),  { passive: false });
    canvas.addEventListener('touchend',   this.onTouchEnd.bind(this),   { passive: true });
    window.addEventListener('keydown',    this.onKeyDown.bind(this));
  },
};
