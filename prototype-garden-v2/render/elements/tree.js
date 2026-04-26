// =============================================================
//  RENDER — Arbre (3 couches : ombre, tronc, feuillage)
// =============================================================

function drawTreeShadow(ctx, el) {
  var cx = el.position.x, cy = el.position.y;
  var r  = el.canopyRadius || 30;
  var ang = ((el.shadowAngle || 225) - 90) * Math.PI / 180;
  var len = r * (el.shadowLength || 1.8);

  var sx = cx + Math.cos(ang) * r * 0.4;
  var sy = cy + Math.sin(ang) * r * 0.4;

  ctx.save();
  ctx.translate(sx, sy);

  // Ombre chaude (pas froide noire)
  var grd = ctx.createRadialGradient(0, 0, 0, 0, 0, len);
  grd.addColorStop(0,   'rgba(40,25,8,0.18)');
  grd.addColorStop(0.5, 'rgba(40,25,8,0.08)');
  grd.addColorStop(1,   'rgba(40,25,8,0)');

  ctx.scale(1, 0.42);
  ctx.beginPath();
  ctx.arc(0, 0, len, 0, Math.PI * 2);
  ctx.fillStyle = grd;
  ctx.fill();
  ctx.restore();
}

function drawTreeTrunk(ctx, el) {
  var cx = el.position.x, cy = el.position.y;
  var tr = 7;

  // Tronc arrondi
  ctx.beginPath();
  roundRect(ctx, cx - tr / 2, cy - tr * 0.2, tr, tr * 1.3, 2);
  ctx.fillStyle = THEME.tree.trunk;
  ctx.fill();

  // Reflet latéral (sans contour dur)
  var tgrd = ctx.createLinearGradient(cx - tr / 2, 0, cx + tr / 2, 0);
  tgrd.addColorStop(0,   'rgba(255,255,255,0.15)');
  tgrd.addColorStop(0.4, 'rgba(255,255,255,0.06)');
  tgrd.addColorStop(1,   'rgba(0,0,0,0.10)');
  ctx.beginPath();
  roundRect(ctx, cx - tr / 2, cy - tr * 0.2, tr, tr * 1.3, 2);
  ctx.fillStyle = tgrd;
  ctx.fill();
}

function drawTreeCanopy(ctx, el) {
  var cx = el.position.x, cy = el.position.y;
  var r  = el.canopyRadius || 30;

  // Couche ombre feuillage (décalée)
  ctx.beginPath();
  ctx.arc(cx + 5, cy + 5, r * 0.90, 0, Math.PI * 2);
  ctx.fillStyle = THEME.tree.shadow;
  ctx.globalAlpha = 0.55;
  ctx.fill();
  ctx.globalAlpha = 1;

  // Base feuillage
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = THEME.tree.canopy;
  ctx.fill();

  // Dégradé lumière haut-gauche
  var grd = ctx.createRadialGradient(cx - r * 0.28, cy - r * 0.28, 0, cx, cy, r);
  grd.addColorStop(0,   'rgba(255,255,255,0.22)');
  grd.addColorStop(0.5, 'rgba(255,255,255,0.04)');
  grd.addColorStop(1,   'rgba(0,0,0,0)');
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = grd;
  ctx.fill();

  // Tache lumière secondaire
  ctx.beginPath();
  ctx.arc(cx - r * 0.28, cy - r * 0.32, r * 0.26, 0, Math.PI * 2);
  ctx.fillStyle = THEME.tree.highlight;
  ctx.globalAlpha = 0.38;
  ctx.fill();
  ctx.globalAlpha = 1;

  // Fruits (pommes) si applicable
  if (el.fruitType === 'apple') {
    var seed = idToSeed(el.id);
    for (var i = 0; i < 6; i++) {
      var fa  = seededRand(seed + i) * Math.PI * 2;
      var fr  = seededRand(seed + i + 100) * r * 0.60;
      var fcx = cx + Math.cos(fa) * fr;
      var fcy = cy + Math.sin(fa) * fr;
      ctx.beginPath();
      ctx.arc(fcx, fcy, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#d86858';
      ctx.fill();
      // Reflet pomme
      ctx.beginPath();
      ctx.arc(fcx - 1, fcy - 1, 1.2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.fill();
    }
  }

  // Contour très doux (pas de noir)
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(40,60,20,0.10)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

function drawTree(ctx, el, selected) {
  drawTreeShadow(ctx, el);
  drawTreeTrunk(ctx, el);
  drawTreeCanopy(ctx, el);

  if (selected) {
    var r = el.canopyRadius || 30;
    ctx.beginPath();
    ctx.arc(el.position.x, el.position.y, r + 4, 0, Math.PI * 2);
    strokeSelectionOutline(ctx, 2.5);
  }

  drawLabel(ctx, el.label, el.position.x, el.position.y - (el.canopyRadius || 30) - 8);
}
