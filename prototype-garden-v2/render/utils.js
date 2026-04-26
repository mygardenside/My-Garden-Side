// =============================================================
//  RENDER UTILS — helpers géométriques et visuels partagés
// =============================================================

// Arrondi de rectangle (fallback roundRect)
function roundRect(ctx, x, y, w, h, r) {
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, w, h, r);
    return;
  }
  r = Math.min(r, w / 2, h / 2);
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

// Dessine un label pilule centré sur (cx, cy)
function drawLabel(ctx, text, cx, cy, opts) {
  if (!text) return;
  opts = opts || {};
  var fsize = opts.fontSize || 11;
  var pad   = opts.padding  || 8;
  ctx.save();
  ctx.font = 'bold ' + fsize + 'px sans-serif';
  var tw = ctx.measureText(text).width;
  var bw = tw + pad * 2;
  var bh = fsize + pad * 1.6;
  var bx = cx - bw / 2, by = cy - bh / 2;

  // Ombre légère
  ctx.shadowColor   = 'rgba(0,0,0,0.14)';
  ctx.shadowBlur    = 5;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 2;

  ctx.beginPath();
  roundRect(ctx, bx, by, bw, bh, bh / 2);
  ctx.fillStyle = opts.bg || 'rgba(236,248,234,0.96)';
  ctx.fill();

  ctx.shadowColor = 'transparent';

  ctx.strokeStyle = opts.border || 'rgba(40,110,55,0.22)';
  ctx.lineWidth = 0.8;
  ctx.stroke();

  ctx.fillStyle = opts.color || '#1a5c36';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, cx, cy + 0.5);
  ctx.restore();
}

// Applique une ombre douce au contexte
function setSoftShadow(ctx, blur, color) {
  ctx.shadowBlur   = blur  || 8;
  ctx.shadowColor  = color || 'rgba(0,0,0,0.2)';
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 2;
}

function clearShadow(ctx) {
  ctx.shadowBlur = 0;
  ctx.shadowColor = 'transparent';
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
}

// Distance point-à-segment (hit testing clôture)
function distToSeg(px, py, ax, ay, bx, by) {
  var dx = bx - ax, dy = by - ay;
  var lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(px - ax, py - ay);
  var t = clamp(((px - ax) * dx + (py - ay) * dy) / lenSq, 0, 1);
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

// Bounding box d'un élément rectangle (en coordonnées monde)
function elBounds(el) {
  return {
    x: el.position.x,
    y: el.position.y,
    w: el.dimensions.width,
    h: el.dimensions.height,
  };
}

// Retourne un entier pseudo-aléatoire déterministe à partir d'une seed
function seededRand(seed) {
  seed = (seed ^ 0xdeadbeef) >>> 0;
  seed = Math.imul(seed ^ (seed >>> 15), seed | 1);
  seed ^= seed + Math.imul(seed ^ (seed >>> 7), seed | 61);
  return ((seed ^ (seed >>> 14)) >>> 0) / 4294967296;
}

// Génère une seed numérique depuis l'id string d'un élément
function idToSeed(id) {
  var s = 0;
  for (var i = 0; i < id.length; i++) s = (s * 31 + id.charCodeAt(i)) | 0;
  return s;
}

// ── Handles de sélection (partagés entre renderer et app) ────

// Retourne les 8 handles de resize d'un élément rectangulaire
function getResizeHandles(el) {
  var x = el.position.x, y = el.position.y;
  var w = el.dimensions.width, h = el.dimensions.height;
  return {
    tl: { x: x,       y: y,       cursor: 'nwse-resize' },
    tr: { x: x + w,   y: y,       cursor: 'nesw-resize' },
    bl: { x: x,       y: y + h,   cursor: 'nesw-resize' },
    br: { x: x + w,   y: y + h,   cursor: 'nwse-resize' },
    t:  { x: x + w/2, y: y,       cursor: 'ns-resize'   },
    r:  { x: x + w,   y: y + h/2, cursor: 'ew-resize'   },
    b:  { x: x + w/2, y: y + h,   cursor: 'ns-resize'   },
    l:  { x: x,       y: y + h/2, cursor: 'ew-resize'   },
  };
}

// Position du handle de rotation (au-dessus du centre)
function getRotationHandlePos(el) {
  var cx = el.position.x + el.dimensions.width / 2;
  var offset = 28 / Camera.zoom;
  return { x: cx, y: el.position.y - offset };
}

// Rayon de hit des handles en coordonnées monde
function handleHitRadius() {
  return 10 / Camera.zoom;
}

// Contour de sélection premium — halo blanc + tirets vert clair
function strokeSelectionOutline(ctx, lineW) {
  lineW = lineW || 2.5;
  // Halo blanc extérieur
  ctx.shadowColor   = 'rgba(255,255,255,0.55)';
  ctx.shadowBlur    = 10;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.setLineDash([]);
  ctx.strokeStyle = 'rgba(255,255,255,0.88)';
  ctx.lineWidth   = lineW + 2.5;
  ctx.stroke();
  // Contour vert clair par-dessus
  ctx.shadowBlur  = 0;
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = '#55c87a';
  ctx.lineWidth   = lineW;
  ctx.setLineDash([6, 4]);
  ctx.stroke();
  ctx.setLineDash([]);
}

// ── Vertex editing helpers ────────────────────────────────────

// Construit un chemin polygone en espace local (centré à 0,0, pivoté)
function polyPath(ctx, el) {
  var w = el.dimensions.width, h = el.dimensions.height;
  ctx.beginPath();
  el.pts.forEach(function(pt, i) {
    if (i === 0) ctx.moveTo(pt[0] * w, pt[1] * h);
    else          ctx.lineTo(pt[0] * w, pt[1] * h);
  });
  ctx.closePath();
}

// Test point-dans-polygone en coordonnées normalisées [-0.5, 0.5]
function ptInPolyNorm(pts, nx, ny) {
  var inside = false, n = pts.length;
  for (var i = 0, j = n - 1; i < n; j = i++) {
    var xi = pts[i][0], yi = pts[i][1];
    var xj = pts[j][0], yj = pts[j][1];
    if (((yi > ny) !== (yj > ny)) &&
        nx < (xj - xi) * (ny - yi) / (yj - yi) + xi)
      inside = !inside;
  }
  return inside;
}

// Retourne les handles vertex (v) et milieux d'arêtes (e) en coordonnées monde
// Tient compte de la rotation de l'élément
function getVertexHandles(el) {
  if (!el.pts || el.pts.length < 3) return [];
  var cx   = el.position.x + el.dimensions.width  / 2;
  var cy   = el.position.y + el.dimensions.height / 2;
  var w    = el.dimensions.width, h = el.dimensions.height;
  var rot  = (el.rotation || 0) * Math.PI / 180;
  var cosA = Math.cos(rot), sinA = Math.sin(rot);
  var n = el.pts.length, result = [];
  for (var i = 0; i < n; i++) {
    var lx  = el.pts[i][0] * w,  ly  = el.pts[i][1] * h;
    result.push({ type: 'v', idx: i,
      x: cx + lx * cosA - ly * sinA,
      y: cy + lx * sinA + ly * cosA });
    var pt2 = el.pts[(i + 1) % n];
    var mlx = (el.pts[i][0] + pt2[0]) / 2 * w;
    var mly = (el.pts[i][1] + pt2[1]) / 2 * h;
    result.push({ type: 'e', idx: i,
      x: cx + mlx * cosA - mly * sinA,
      y: cy + mlx * sinA + mly * cosA });
  }
  return result;
}
