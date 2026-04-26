// =============================================================
//  RENDER — Zone de culture (bed)
// =============================================================

function renderCropSymbol(ctx, type, cx, cy, r) {
  ctx.save();
  ctx.translate(cx, cy);
  switch (type) {
    case 'tomato':
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fillStyle = '#d86858';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(-r * 0.3, -r * 0.3, r * 0.35, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.28)';
      ctx.fill();
      ctx.fillStyle = '#6aaa48';
      ctx.fillRect(-1, -r - 3, 2, 4);
      break;

    case 'lettuce':
      var lc = '#6ec048';
      for (var a = 0; a < 5; a++) {
        var ang = (a / 5) * Math.PI * 2;
        ctx.beginPath();
        ctx.ellipse(Math.cos(ang) * r * 0.55, Math.sin(ang) * r * 0.55, r * 0.55, r * 0.38, ang, 0, Math.PI * 2);
        ctx.fillStyle = a % 2 === 0 ? lc : '#88d060';
        ctx.fill();
      }
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.28, 0, Math.PI * 2);
      ctx.fillStyle = '#98e070';
      ctx.fill();
      break;

    case 'carrot':
      ctx.beginPath();
      ctx.moveTo(0, -r);
      ctx.quadraticCurveTo(r * 0.55, 0, r * 0.35, r);
      ctx.quadraticCurveTo(0, r * 1.1, -r * 0.35, r);
      ctx.quadraticCurveTo(-r * 0.55, 0, 0, -r);
      ctx.fillStyle = '#e8904a';
      ctx.fill();
      ctx.fillStyle = '#6aaa48';
      ctx.fillRect(-1, -r - 4, 1.5, 5);
      ctx.fillRect(-2.5, -r - 3, 1.5, 4);
      ctx.fillRect(1, -r - 3, 1.5, 4);
      break;

    case 'basil':
      ctx.beginPath();
      ctx.ellipse(-r * 0.3, 0, r * 0.5, r * 0.75, -0.3, 0, Math.PI * 2);
      ctx.fillStyle = '#3ab890';
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(r * 0.3, 0, r * 0.5, r * 0.75, 0.3, 0, Math.PI * 2);
      ctx.fillStyle = '#50c8a0';
      ctx.fill();
      break;

    default:
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fillStyle = '#a8b8a0';
      ctx.fill();
  }
  ctx.restore();
}

function drawBed(ctx, el, selected) {
  var x = el.position.x, y = el.position.y;
  var w = el.dimensions.width, h = el.dimensions.height;
  var hasPoly = !!(el.pts && el.pts.length >= 3);

  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate((el.rotation || 0) * Math.PI / 180);

  var hx = -w / 2, hy = -h / 2;
  var frame = 5;

  // Chemin outer: polygone ou rectangle
  function outer() {
    if (hasPoly) { polyPath(ctx, el); return; }
    ctx.beginPath(); roundRect(ctx, hx, hy, w, h, 5);
  }
  // Outer décalé pour l'ombre
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
    ctx.beginPath(); roundRect(ctx, hx + ox, hy + oy, w, h, 5);
  }

  // Ombre portée — plus visible pour créer la hiérarchie
  setSoftShadow(ctx, 14, 'rgba(40,25,8,0.22)');
  outerShift(3, 4);
  ctx.fillStyle = 'rgba(40,25,8,0.16)';
  ctx.fill();
  clearShadow(ctx);

  // Cadre bois externe
  outer();
  ctx.fillStyle = THEME.wood.plank;
  ctx.fill();

  // Bord bois — plus net
  outer();
  ctx.strokeStyle = THEME.wood.dark;
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = 0.55;
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Zone clippée : stries + dégradé + terre + cultures
  ctx.save();
  outer();
  ctx.clip();

  // Stries bois déterministes
  var seed = idToSeed(el.id);
  ctx.strokeStyle = THEME.wood.dark;
  ctx.lineWidth = 0.8;
  ctx.globalAlpha = 0.18;
  for (var i = 0; i < 4; i++) {
    var rx = hx + frame + seededRand(seed + i) * (w - frame * 2);
    ctx.beginPath();
    ctx.moveTo(rx, hy);
    ctx.lineTo(rx, hy + h);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Dégradé bois 3D (haut plus clair)
  var woodGrd = ctx.createLinearGradient(hx, hy, hx, hy + frame);
  woodGrd.addColorStop(0, 'rgba(255,255,255,0.20)');
  woodGrd.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.beginPath();
  roundRect(ctx, hx, hy, w, frame, [5, 5, 0, 0]);
  ctx.fillStyle = woodGrd;
  ctx.fill();

  // Terre intérieure — polygone rétréci ou rectangle selon le mode
  if (hasPoly) {
    var fscale = Math.max(0, 1 - (frame * 2) / Math.min(w, h));
    ctx.beginPath();
    el.pts.forEach(function(pt, idx) {
      var px = pt[0] * w * fscale, py = pt[1] * h * fscale;
      if (idx === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    });
    ctx.closePath();
  } else {
    ctx.beginPath();
    roundRect(ctx, hx + frame, hy + frame, w - frame * 2, h - frame * 2, 3);
  }
  ctx.fillStyle = THEME.soil.base;
  ctx.fill();

  // Texture terre subtile
  var s2 = seed + 1000;
  for (var j = 0; j < 14; j++) {
    var tx = hx + frame + seededRand(s2 + j * 3)     * (w - frame * 2);
    var ty = hy + frame + seededRand(s2 + j * 3 + 1) * (h - frame * 2);
    var sz = 1 + seededRand(s2 + j * 3 + 2) * 1.8;
    ctx.fillStyle = j % 3 === 0 ? THEME.soil.dark : THEME.soil.light;
    ctx.globalAlpha = 0.55;
    ctx.beginPath();
    ctx.arc(tx, ty, sz, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  ctx.restore(); // fin clip

  // Contour sélection
  if (selected) {
    outer();
    strokeSelectionOutline(ctx, 2.5);
  }

  ctx.restore();

  drawLabel(ctx, el.label, x + w / 2, y - 10);
}
