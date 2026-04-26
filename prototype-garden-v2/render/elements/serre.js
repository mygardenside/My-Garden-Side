// =============================================================
//  RENDER — Serre
// =============================================================

function drawSerre(ctx, el, selected) {
  var x = el.position.x, y = el.position.y;
  var w = el.dimensions.width, h = el.dimensions.height;
  var hasPoly = !!(el.pts && el.pts.length >= 3);

  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate((el.rotation || 0) * Math.PI / 180);

  var hx = -w / 2, hy = -h / 2;
  var frame = el.frameColor || THEME.glass.frame;

  function outer() {
    if (hasPoly) { polyPath(ctx, el); return; }
    ctx.beginPath(); roundRect(ctx, hx, hy, w, h, 7);
  }
  function outerShift(ox, oy) {
    if (hasPoly) {
      ctx.beginPath();
      el.pts.forEach(function(pt, i) {
        if (i === 0) ctx.moveTo(pt[0] * w + ox, pt[1] * h + oy);
        else          ctx.lineTo(pt[0] * w + ox, pt[1] * h + oy);
      });
      ctx.closePath();
      return;
    }
    ctx.beginPath(); roundRect(ctx, hx + ox, hy + oy, w, h, 7);
  }

  // Ombre chaude renforcée
  setSoftShadow(ctx, 14, 'rgba(40,25,8,0.22)');
  outerShift(3, 4);
  ctx.fillStyle = 'rgba(40,25,8,0.13)';
  ctx.fill();
  clearShadow(ctx);

  // Remplissage verre — dégradé chaud/frais
  var grd = ctx.createLinearGradient(hx, hy, hx + w, hy + h);
  grd.addColorStop(0,   'rgba(210,245,225,0.72)');
  grd.addColorStop(0.5, 'rgba(225,250,235,0.52)');
  grd.addColorStop(1,   'rgba(190,235,215,0.68)');
  outer();
  ctx.fillStyle = grd;
  ctx.fill();

  // Clip pour reflet + armature
  ctx.save();
  outer();
  ctx.clip();

  // Reflet diagonal
  var ref = ctx.createLinearGradient(hx, hy, hx + w * 0.45, hy + h * 0.45);
  ref.addColorStop(0,   'rgba(255,255,255,0.28)');
  ref.addColorStop(0.6, 'rgba(255,255,255,0.06)');
  ref.addColorStop(1,   'rgba(255,255,255,0)');
  ctx.fillStyle = ref;
  ctx.fillRect(hx, hy, w, h);

  // Armature : montants verticaux
  ctx.strokeStyle = frame;
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = 0.65;
  var stepX = 55;
  for (var ix = stepX; ix < w; ix += stepX) {
    ctx.beginPath();
    ctx.moveTo(hx + ix, hy);
    ctx.lineTo(hx + ix, hy + h);
    ctx.stroke();
  }
  // Faîtière centrale
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(hx, hy + h / 2);
  ctx.lineTo(hx + w, hy + h / 2);
  ctx.stroke();
  ctx.globalAlpha = 1;

  ctx.restore(); // fin clip

  // Cadre extérieur (couleur frame, pas noir)
  outer();
  ctx.strokeStyle = frame;
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.75;
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Sélection
  if (selected) {
    outer();
    strokeSelectionOutline(ctx, 2.5);
  }

  ctx.restore();

  drawLabel(ctx, el.label, x + w / 2, y - 10);
}
