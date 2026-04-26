// =============================================================
//  RENDERER — boucle de rendu principale
// =============================================================

// Dimensions par défaut pour le ghost de chaque type
var GHOST_DIMS = {
  bed:   function() { return { w: m2px(1.2), h: m2px(0.8) }; },
  serre: function() { return { w: m2px(3),   h: m2px(1.5) }; },
  house: function() { return { w: m2px(10),  h: m2px(8)   }; },
  path:  function() { return { w: m2px(3),   h: m2px(0.6) }; },
};

var GHOST_COLORS = {
  bed:   function() { return THEME.wood.plank;  },
  serre: function() { return THEME.glass.frame; },
  house: function() { return THEME.house.wall;  },
  path:  function() { return THEME.path.gravel; },
  tree:  function() { return THEME.tree.canopy; },
};

var Renderer = {
  canvas: null,
  ctx:    null,

  fenceDrawMode:  false,
  fencePreviewPt: null,
  fenceDraft:     null,

  init: function(canvasEl) {
    this.canvas = canvasEl;
    this.ctx    = canvasEl.getContext('2d');
  },

  render: function() {
    var ctx = this.ctx;
    var W   = this.canvas.clientWidth;
    var H   = this.canvas.clientHeight;
    var cam = Camera;
    var sel = GardenStore.getSelected();

    ctx.setTransform(_DPR, 0, 0, _DPR, 0, 0);
    ctx.clearRect(0, 0, W, H);

    drawBackground(ctx, W, H);
    drawGrid(ctx, cam);

    cam.apply(ctx);

    // ── Couche sol ───────────────────────────────────────────
    GardenStore.elements.forEach(function(el) {
      if (el.type === 'path') drawPath(ctx, el, el === sel);
    });
    GardenStore.elements.forEach(function(el) {
      if (el.type === 'fence') drawFence(ctx, el, el === sel);
    });

    // ── Ombres arbres ────────────────────────────────────────
    GardenStore.elements.forEach(function(el) {
      if (el.type === 'tree') drawTreeShadow(ctx, el);
    });

    // ── Couche haute (hors sélection) ────────────────────────
    GardenStore.elements.forEach(function(el) {
      if (el === sel) return;
      switch (el.type) {
        case 'bed':   drawBed(ctx, el, false);   break;
        case 'serre': drawSerre(ctx, el, false); break;
        case 'house': drawHouse(ctx, el, false); break;
        case 'tree':  drawTreeTrunk(ctx, el); drawTreeCanopy(ctx, el); break;
      }
    });

    // ── Sélection par-dessus ─────────────────────────────────
    if (sel) {
      switch (sel.type) {
        case 'bed':   drawBed(ctx, sel, true);   break;
        case 'serre': drawSerre(ctx, sel, true); break;
        case 'house': drawHouse(ctx, sel, true); break;
        case 'path':  drawPath(ctx, sel, true);  break;
        case 'fence': drawFence(ctx, sel, true); break;
        case 'tree':
          drawTreeTrunk(ctx, sel); drawTreeCanopy(ctx, sel);
          var tr = sel.canopyRadius || 30;
          ctx.beginPath(); ctx.arc(sel.position.x, sel.position.y, tr + 4, 0, Math.PI * 2);
          strokeSelectionOutline(ctx, 2.5);
          break;
      }
      // Handles de sélection (sauf fence et tree)
      if (sel.type !== 'fence' && sel.type !== 'tree') {
        if (AppState.vertexMode && sel.pts && sel.pts.length >= 3) {
          this._drawVertexHandles(ctx, sel);
        } else {
          this._drawSelectionHandles(ctx, sel);
        }
      }
    }

    // ── Ghost preview (mode création) ───────────────────────
    if (AppState && AppState.mode === 'create' && AppState.ghostPos && AppState.createType !== 'fence') {
      this._drawGhost(ctx, AppState.createType, AppState.ghostPos);
    }

    // ── Aperçu clôture ──────────────────────────────────────
    if (this.fenceDrawMode && this.fenceDraft && this.fenceDraft.pts.length > 0) {
      drawFencePreview(ctx, this.fenceDraft, this.fencePreviewPt);
    }

    // ── HUD ─────────────────────────────────────────────────
    ctx.setTransform(_DPR, 0, 0, _DPR, 0, 0);
    drawCompass(ctx, W, GardenStore.northAngle);
    drawScaleRuler(ctx, cam, H);

    // ── Indicateur de mode création ─────────────────────────
    if (AppState && AppState.mode === 'create') {
      this._drawModeHint(ctx, W, H);
    }
  },

  // ── Ghost preview ──────────────────────────────────────────
  _drawGhost: function(ctx, type, pos) {
    ctx.save();
    ctx.globalAlpha = 0.42;

    var color = GHOST_COLORS[type] ? GHOST_COLORS[type]() : '#888';

    if (type === 'tree') {
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 30, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2 / Camera.zoom;
      ctx.setLineDash([4 / Camera.zoom, 3 / Camera.zoom]);
      ctx.stroke();
      ctx.setLineDash([]);
    } else {
      var d = GHOST_DIMS[type] ? GHOST_DIMS[type]() : { w: m2px(1), h: m2px(1) };
      ctx.beginPath();
      roundRect(ctx, pos.x - d.w / 2, pos.y - d.h / 2, d.w, d.h, 4);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2 / Camera.zoom;
      ctx.setLineDash([5 / Camera.zoom, 3 / Camera.zoom]);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.restore();
  },

  // ── Handles sélection (resize + rotation) ──────────────────
  _drawSelectionHandles: function(ctx, el) {
    var x = el.position.x, y = el.position.y;
    var w = el.dimensions.width, h = el.dimensions.height;
    var zInv = 1 / Camera.zoom;
    var r  = 8.5 * zInv;
    var rm = 6.5 * zInv;

    // Ligne du handle de rotation — vert doux
    var rh = getRotationHandlePos(el);
    ctx.strokeStyle = 'rgba(76,184,112,0.55)';
    ctx.lineWidth = 1.5 * zInv;
    ctx.setLineDash([3 * zInv, 3 * zInv]);
    ctx.beginPath();
    ctx.moveTo(x + w / 2, y);
    ctx.lineTo(rh.x, rh.y);
    ctx.stroke();
    ctx.setLineDash([]);

    // Handle rotation — vert + blanc
    ctx.shadowBlur = 6 * zInv;
    ctx.shadowColor = 'rgba(0,0,0,0.22)';
    ctx.shadowOffsetY = 1.5 * zInv;
    ctx.beginPath();
    ctx.arc(rh.x, rh.y, r, 0, Math.PI * 2);
    ctx.fillStyle = '#4db870';
    ctx.fill();
    ctx.shadowBlur = 0; ctx.shadowColor = 'transparent'; ctx.shadowOffsetY = 0;
    ctx.strokeStyle = 'rgba(255,255,255,0.90)';
    ctx.lineWidth = 2 * zInv;
    ctx.stroke();
    // Icône ↻
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 1.5 * zInv;
    ctx.beginPath();
    ctx.arc(rh.x, rh.y, r * 0.44, -Math.PI * 0.65, Math.PI * 0.65);
    ctx.stroke();

    // Handles coins (resize) — blanc + bord vert
    var corners = [
      { x: x,     y: y },
      { x: x + w, y: y },
      { x: x + w, y: y + h },
      { x: x,     y: y + h },
    ];
    corners.forEach(function(pt) {
      ctx.shadowBlur = 5 * zInv;
      ctx.shadowColor = 'rgba(0,0,0,0.20)';
      ctx.shadowOffsetY = 1.5 * zInv;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, r, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
      ctx.shadowBlur = 0; ctx.shadowColor = 'transparent'; ctx.shadowOffsetY = 0;
      ctx.strokeStyle = '#4db870';
      ctx.lineWidth = 2.5 * zInv;
      ctx.stroke();
    });

    // Handles milieux (resize) — blanc + bord vert
    var mids = [
      { x: x + w / 2, y: y },
      { x: x + w,     y: y + h / 2 },
      { x: x + w / 2, y: y + h },
      { x: x,         y: y + h / 2 },
    ];
    mids.forEach(function(pt) {
      ctx.shadowBlur = 4 * zInv;
      ctx.shadowColor = 'rgba(0,0,0,0.18)';
      ctx.shadowOffsetY = 1 * zInv;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, rm, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
      ctx.shadowBlur = 0; ctx.shadowColor = 'transparent'; ctx.shadowOffsetY = 0;
      ctx.strokeStyle = '#4db870';
      ctx.lineWidth = 2 * zInv;
      ctx.stroke();
    });
  },

  // ── Handles vertex editing ────────────────────────────────
  _drawVertexHandles: function(ctx, el) {
    var handles = getVertexHandles(el);
    var zInv = 1 / Camera.zoom;
    var rv = 7  * zInv;
    var re = 5.5 * zInv;

    handles.forEach(function(h) {
      if (h.type === 'v') {
        ctx.beginPath();
        ctx.arc(h.x, h.y, rv, 0, Math.PI * 2);
        ctx.fillStyle = '#4488ff';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.5 * zInv;
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(h.x, h.y, re, 0, Math.PI * 2);
        ctx.fillStyle = '#44bb44';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.5 * zInv;
        ctx.stroke();
        // Signe +
        var arm = re * 0.6;
        ctx.beginPath();
        ctx.moveTo(h.x - arm, h.y); ctx.lineTo(h.x + arm, h.y);
        ctx.moveTo(h.x, h.y - arm); ctx.lineTo(h.x, h.y + arm);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.5 * zInv;
        ctx.stroke();
      }
    });
  },

  // ── Hint de mode création ──────────────────────────────────
  _drawModeHint: function(ctx, W, H) {
    ctx.save();
    ctx.setTransform(_DPR, 0, 0, _DPR, 0, 0);
    var msg = I18N.t('hint_create_' + AppState.createType) ||
              (I18N.t('hint_create') + ' ' + (AppState.createType || ''));
    ctx.font = 'bold 13px sans-serif';
    var tw = ctx.measureText(msg).width + 24;
    // Sur mobile : hint en haut, légèrement sous le badge de mode
    var isMob = window.innerWidth <= 768;
    var bh = 30;
    var by = isMob ? 50 : (H - 70);
    var bx = (W - tw) / 2;

    ctx.beginPath();
    roundRect(ctx, bx, by, tw, bh, 15);
    ctx.fillStyle = isMob ? 'rgba(10,30,10,0.72)' : 'rgba(46,110,80,0.88)';
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(msg, W / 2, by + bh / 2);
    ctx.restore();
  },

  startLoop: function() {
    var self = this;
    function loop() { self.render(); requestAnimationFrame(loop); }
    requestAnimationFrame(loop);
  },
};
