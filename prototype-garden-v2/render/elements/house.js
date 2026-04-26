// =============================================================
//  RENDER — Maison
// =============================================================

function drawHouse(ctx, el, selected) {
  var x = el.position.x, y = el.position.y;
  var w = el.dimensions.width, h = el.dimensions.height;
  var hasPoly = !!(el.pts && el.pts.length >= 3);

  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate((el.rotation || 0) * Math.PI / 180);

  // En mode polygone : dessiner simplement le footprint sans toit
  if (hasPoly) {
    var wallColor = el.wallColor || THEME.house.wall;
    setSoftShadow(ctx, 16, 'rgba(40,25,8,0.20)');
    ctx.save();
    ctx.translate(3, 5);
    polyPath(ctx, el);
    ctx.fillStyle = 'rgba(40,25,8,0.08)';
    ctx.fill();
    ctx.restore();
    clearShadow(ctx);

    polyPath(ctx, el);
    ctx.fillStyle = wallColor;
    ctx.fill();
    ctx.save();
    polyPath(ctx, el);
    ctx.clip();
    var wgrd = ctx.createLinearGradient(0, -h/2, 0, h/2);
    wgrd.addColorStop(0, 'rgba(255,255,255,0.08)');
    wgrd.addColorStop(1, 'rgba(0,0,0,0.06)');
    ctx.fillStyle = wgrd;
    ctx.fillRect(-w/2, -h/2, w, h);
    ctx.restore();

    polyPath(ctx, el);
    ctx.strokeStyle = 'rgba(120,90,55,0.18)';
    ctx.lineWidth = 1;
    ctx.stroke();

    if (selected) {
      polyPath(ctx, el);
      ctx.strokeStyle = '#f0c030';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([6, 3]);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.restore();
    drawLabel(ctx, el.label, x + w / 2, y - 10);
    return;
  }

  var hx = -w / 2, hy = -h / 2;
  var roofH = h * 0.30;

  // Ombre chaude portée
  setSoftShadow(ctx, 16, 'rgba(40,25,8,0.20)');
  ctx.beginPath();
  ctx.rect(hx + 3, hy + roofH + 5, w, h - roofH);
  ctx.fillStyle = 'rgba(40,25,8,0.08)';
  ctx.fill();
  clearShadow(ctx);

  // Mur — couleur chaude crème
  var wall = el.wallColor || THEME.house.wall;
  ctx.fillStyle = wall;
  ctx.beginPath();
  ctx.rect(hx, hy + roofH, w, h - roofH);
  ctx.fill();

  // Dégradé mur (léger bas plus sombre)
  var wgrd = ctx.createLinearGradient(0, hy + roofH, 0, hy + h);
  wgrd.addColorStop(0, 'rgba(255,255,255,0.06)');
  wgrd.addColorStop(1, 'rgba(0,0,0,0.06)');
  ctx.beginPath();
  ctx.rect(hx, hy + roofH, w, h - roofH);
  ctx.fillStyle = wgrd;
  ctx.fill();

  // Liseré mur très doux (pas de noir)
  ctx.strokeStyle = 'rgba(120,90,55,0.18)';
  ctx.lineWidth = 1;
  ctx.strokeRect(hx, hy + roofH, w, h - roofH);

  // Toit triangulaire
  var roofColor = el.roofColor || THEME.house.roof;
  ctx.beginPath();
  ctx.moveTo(hx - 8, hy + roofH + 3);
  ctx.lineTo(0, hy - 5);
  ctx.lineTo(hx + w + 8, hy + roofH + 3);
  ctx.closePath();
  ctx.fillStyle = roofColor;
  ctx.fill();

  // Dégradé toit
  var rgrd = ctx.createLinearGradient(0, hy - 5, 0, hy + roofH + 3);
  rgrd.addColorStop(0, 'rgba(255,255,255,0.14)');
  rgrd.addColorStop(1, 'rgba(0,0,0,0.12)');
  ctx.beginPath();
  ctx.moveTo(hx - 8, hy + roofH + 3);
  ctx.lineTo(0, hy - 5);
  ctx.lineTo(hx + w + 8, hy + roofH + 3);
  ctx.closePath();
  ctx.fillStyle = rgrd;
  ctx.fill();

  // Faîtage (couleur roof foncée, pas de noir)
  var darkRoof = 'rgba(80,40,10,0.30)';
  ctx.beginPath();
  ctx.moveTo(hx - 8, hy + roofH + 3);
  ctx.lineTo(0, hy - 5);
  ctx.lineTo(hx + w + 8, hy + roofH + 3);
  ctx.strokeStyle = darkRoof;
  ctx.lineWidth = 2;
  ctx.lineJoin = 'round';
  ctx.stroke();

  // Fenêtres
  var winW = w * 0.14, winH = h * 0.16;
  var winY = hy + roofH + (h - roofH) * 0.26;
  [hx + w * 0.18, hx + w * 0.65].forEach(function(wx) {
    // Verre
    var wglass = ctx.createLinearGradient(wx, winY, wx + winW, winY + winH);
    wglass.addColorStop(0, 'rgba(180,220,240,0.80)');
    wglass.addColorStop(1, 'rgba(140,190,220,0.55)');
    ctx.fillStyle = wglass;
    ctx.fillRect(wx, winY, winW, winH);
    // Reflet
    ctx.fillStyle = 'rgba(255,255,255,0.30)';
    ctx.fillRect(wx + 1, winY + 1, winW * 0.4, winH * 0.4);
    // Cadre en bois chaud
    ctx.strokeStyle = THEME.wood.plank;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.7;
    ctx.strokeRect(wx, winY, winW, winH);
    ctx.globalAlpha = 1;
    // Croisillon
    ctx.strokeStyle = THEME.wood.plank;
    ctx.lineWidth = 0.8;
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.moveTo(wx + winW / 2, winY);
    ctx.lineTo(wx + winW / 2, winY + winH);
    ctx.moveTo(wx, winY + winH / 2);
    ctx.lineTo(wx + winW, winY + winH / 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  });

  // Porte
  var doorW = w * 0.14, doorH = h * 0.27;
  var doorX = hx + w / 2 - doorW / 2;
  var doorY = hy + h - doorH;
  // Corps porte
  ctx.fillStyle = THEME.wood.post;
  ctx.fillRect(doorX, doorY, doorW, doorH);
  // Arc haut
  ctx.beginPath();
  ctx.arc(doorX + doorW / 2, doorY, doorW / 2, Math.PI, 0);
  ctx.fillStyle = THEME.wood.post;
  ctx.fill();
  // Dégradé porte
  var dgrd = ctx.createLinearGradient(doorX, 0, doorX + doorW, 0);
  dgrd.addColorStop(0, 'rgba(255,255,255,0.12)');
  dgrd.addColorStop(1, 'rgba(0,0,0,0.10)');
  ctx.fillStyle = dgrd;
  ctx.fillRect(doorX, doorY, doorW, doorH);
  // Bord porte doux
  ctx.strokeStyle = 'rgba(80,40,10,0.20)';
  ctx.lineWidth = 1;
  ctx.strokeRect(doorX, doorY, doorW, doorH);
  // Poignée dorée douce
  ctx.beginPath();
  ctx.arc(doorX + doorW * 0.72, doorY + doorH * 0.54, 2.5, 0, Math.PI * 2);
  ctx.fillStyle = '#d4a830';
  ctx.fill();

  // Sélection
  if (selected) {
    ctx.beginPath();
    ctx.rect(hx - 2, hy - 6, w + 4, h + 8);
    strokeSelectionOutline(ctx, 2.5);
  }

  ctx.restore();

  drawLabel(ctx, el.label, x + w / 2, y - 10);
}
