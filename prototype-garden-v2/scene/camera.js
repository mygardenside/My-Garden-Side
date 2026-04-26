// =============================================================
//  CAMERA — pan / zoom / world↔screen transforms
// =============================================================

var _DPR = window.devicePixelRatio || 1;

var Camera = {
  x:    0,      // décalage monde (px)
  y:    0,
  zoom: 1.0,
  minZoom: 0.3,
  maxZoom: 4.0,

  // Applique la transformation canvas (intègre le DPR pour rendu net sur écrans HD)
  apply: function(ctx) {
    ctx.setTransform(this.zoom * _DPR, 0, 0, this.zoom * _DPR, this.x * _DPR, this.y * _DPR);
  },

  // Coordonnées écran → monde
  toWorld: function(sx, sy) {
    return {
      x: (sx - this.x) / this.zoom,
      y: (sy - this.y) / this.zoom,
    };
  },

  // Coordonnées monde → écran
  toScreen: function(wx, wy) {
    return {
      x: wx * this.zoom + this.x,
      y: wy * this.zoom + this.y,
    };
  },

  // Zoom centré sur un point écran
  zoomAt: function(sx, sy, factor) {
    var newZoom = clamp(this.zoom * factor, this.minZoom, this.maxZoom);
    var ratio   = newZoom / this.zoom;
    this.x = sx + ratio * (this.x - sx);
    this.y = sy + ratio * (this.y - sy);
    this.zoom = newZoom;
  },

  // Centre la vue sur une zone du monde (en px)
  fitRect: function(wx, wy, ww, wh, canvasW, canvasH, padding) {
    padding = padding || 60;
    var zx = (canvasW - padding * 2) / ww;
    var zy = (canvasH - padding * 2) / wh;
    this.zoom = clamp(Math.min(zx, zy), this.minZoom, this.maxZoom);
    this.x = padding + (canvasW - padding * 2 - ww * this.zoom) / 2 - wx * this.zoom;
    this.y = padding + (canvasH - padding * 2 - wh * this.zoom) / 2 - wy * this.zoom;
  },

  // Réinitialise avec une vue adaptée au canvas
  reset: function(canvasW, canvasH) {
    this.zoom = 1.0;
    this.x = 40;
    this.y = 40;
  },
};
