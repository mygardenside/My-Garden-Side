// =============================================================
//  RENDER — Chemin
// =============================================================

function drawPath(ctx, el, selected) {
  var x = el.position.x, y = el.position.y;
  var w = el.dimensions.width, h = el.dimensions.height;
  var hasPoly = !!(el.pts && el.pts.length >= 3);

  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate((el.rotation || 0) * Math.PI / 180);

  var hx = -w / 2, hy = -h / 2;
  var style = el.pathStyle || 'gravel';

  function outer() {
    if (hasPoly) { polyPath(ctx, el); return; }
    ctx.beginPath(); roundRect(ctx, hx, hy, w, h, 3);
  }

  if (style === 'gravel') {
    outer();
    ctx.fillStyle = THEME.path.gravel;
    ctx.fill();

    // Texture déterministe clippée
    ctx.save();
    outer();
    ctx.clip();
    var seed = idToSeed(el.id);
    for (var i = 0; i < 40; i++) {
      var gx = hx + seededRand(seed + i * 2)     * w;
      var gy = hy + seededRand(seed + i * 2 + 1) * h;
      var gs = 1 + seededRand(seed + i * 2 + 2) * 2.5;
      ctx.beginPath();
      ctx.arc(gx, gy, gs, 0, Math.PI * 2);
      ctx.fillStyle = i % 3 === 0 ? '#b0a090' : '#d8ccbc';
      ctx.fill();
    }
    ctx.restore();

    outer();
    ctx.strokeStyle = THEME.path.edge;
    ctx.lineWidth = 2;
    ctx.stroke();

  } else if (style === 'stone') {
    outer();
    ctx.fillStyle = '#9e9e8e';
    ctx.fill();
    outer();
    ctx.strokeStyle = '#7a7a6a';
    ctx.lineWidth = 2;
    ctx.stroke();

  } else if (style === 'grass') {
    outer();
    ctx.fillStyle = THEME.grass.light;
    ctx.fill();
    outer();
    ctx.strokeStyle = THEME.grass.dark;
    ctx.lineWidth = 1.5;
    ctx.stroke();

  } else if (style === 'wood') {
    outer();
    ctx.fillStyle = THEME.wood.plank;
    ctx.fill();
    outer();
    ctx.strokeStyle = THEME.wood.dark;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // Sélection
  if (selected) {
    outer();
    strokeSelectionOutline(ctx, 2.5);
  }

  ctx.restore();
}
