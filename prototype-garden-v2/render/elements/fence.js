// =============================================================
//  RENDER — Clôture (polyline, épaisseur monde fixe 0.3m)
// =============================================================

function drawFenceSegment(ctx, ax, ay, bx, by, style) {
  var dx = bx - ax, dy = by - ay;
  var len = Math.sqrt(dx * dx + dy * dy);
  if (len < 1) return;

  var ux = dx / len, uy = dy / len;
  var half = m2px(0.15);

  if (style === 'wood' || !style) {
    // Face bois principale
    ctx.beginPath();
    ctx.moveTo(ax - uy * half, ay + ux * half);
    ctx.lineTo(bx - uy * half, by + ux * half);
    ctx.lineTo(bx + uy * half, by - ux * half);
    ctx.lineTo(ax + uy * half, ay - ux * half);
    ctx.closePath();
    ctx.fillStyle = THEME.fence.plank;
    ctx.fill();

    // Bord doux (pas de noir dur)
    ctx.strokeStyle = THEME.fence.post;
    ctx.lineWidth = 0.8;
    ctx.globalAlpha = 0.40;
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Dégradé lumière sur le dessus
    var lx = ax - uy * half, ly = ay + ux * half;
    var lgrd = ctx.createLinearGradient(lx, ly, lx + uy * half * 2, ly - ux * half * 2);
    lgrd.addColorStop(0, 'rgba(255,255,255,0.22)');
    lgrd.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.beginPath();
    ctx.moveTo(ax - uy * half, ay + ux * half);
    ctx.lineTo(bx - uy * half, by + ux * half);
    ctx.lineTo(bx + uy * half, by - ux * half);
    ctx.lineTo(ax + uy * half, ay - ux * half);
    ctx.closePath();
    ctx.fillStyle = lgrd;
    ctx.fill();

    // Stries bois légères
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(ax - uy * half, ay + ux * half);
    ctx.lineTo(bx - uy * half, by + ux * half);
    ctx.lineTo(bx + uy * half, by - ux * half);
    ctx.lineTo(ax + uy * half, ay - ux * half);
    ctx.closePath();
    ctx.clip();
    ctx.strokeStyle = THEME.fence.post;
    ctx.lineWidth = 0.7;
    ctx.globalAlpha = 0.15;
    var stepD = 9;
    for (var d = stepD; d < len; d += stepD) {
      var px2 = ax + ux * d, py2 = ay + uy * d;
      ctx.beginPath();
      ctx.moveTo(px2 - uy * half * 1.1, py2 + ux * half * 1.1);
      ctx.lineTo(px2 + uy * half * 1.1, py2 - ux * half * 1.1);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.restore();

  } else if (style === 'wire') {
    // Fil fin avec poteaux sous-entendus
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx, by);
    ctx.strokeStyle = '#a8a090';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);
    // Second fil
    ctx.beginPath();
    ctx.moveTo(ax - uy * half * 0.6, ay + ux * half * 0.6);
    ctx.lineTo(bx - uy * half * 0.6, by + ux * half * 0.6);
    ctx.strokeStyle = '#b0a898';
    ctx.lineWidth = 0.8;
    ctx.setLineDash([3, 6]);
    ctx.stroke();
    ctx.setLineDash([]);

  } else if (style === 'hedge') {
    ctx.beginPath();
    ctx.moveTo(ax - uy * half, ay + ux * half);
    ctx.lineTo(bx - uy * half, by + ux * half);
    ctx.lineTo(bx + uy * half, by - ux * half);
    ctx.lineTo(ax + uy * half, ay - ux * half);
    ctx.closePath();
    ctx.fillStyle = '#5a9e3a';
    ctx.fill();
    // Texture bulle pour la haie
    var hgrd = ctx.createLinearGradient(ax - uy * half, ay + ux * half, ax + uy * half, ay - ux * half);
    hgrd.addColorStop(0, 'rgba(255,255,255,0.15)');
    hgrd.addColorStop(1, 'rgba(0,0,0,0.08)');
    ctx.beginPath();
    ctx.moveTo(ax - uy * half, ay + ux * half);
    ctx.lineTo(bx - uy * half, by + ux * half);
    ctx.lineTo(bx + uy * half, by - ux * half);
    ctx.lineTo(ax + uy * half, ay - ux * half);
    ctx.closePath();
    ctx.fillStyle = hgrd;
    ctx.fill();

  } else if (style === 'stone') {
    ctx.beginPath();
    ctx.moveTo(ax - uy * half, ay + ux * half);
    ctx.lineTo(bx - uy * half, by + ux * half);
    ctx.lineTo(bx + uy * half, by - ux * half);
    ctx.lineTo(ax + uy * half, ay - ux * half);
    ctx.closePath();
    ctx.fillStyle = '#b0a898';
    ctx.fill();
    ctx.strokeStyle = 'rgba(80,70,55,0.25)';
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }
}

function drawFencePost(ctx, px, py, style) {
  var r = 4.5;
  // Ombre douce sous le poteau
  ctx.beginPath();
  ctx.arc(px + 1, py + 1.5, r, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(40,25,8,0.15)';
  ctx.fill();

  ctx.beginPath();
  ctx.arc(px, py, r, 0, Math.PI * 2);
  ctx.fillStyle = style === 'stone' ? '#a09888' : THEME.fence.post;
  ctx.fill();

  // Reflet haut-gauche (sans contour dur)
  var pgrd = ctx.createRadialGradient(px - 1.5, py - 1.5, 0, px, py, r);
  pgrd.addColorStop(0, 'rgba(255,255,255,0.25)');
  pgrd.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.beginPath();
  ctx.arc(px, py, r, 0, Math.PI * 2);
  ctx.fillStyle = pgrd;
  ctx.fill();
}

function drawFence(ctx, el, selected) {
  if (!el.pts || el.pts.length < 2) return;

  var style = el.fenceStyle || 'wood';
  var n = el.pts.length;

  for (var i = 0; i < n - 1; i++) {
    drawFenceSegment(ctx, el.pts[i].x, el.pts[i].y, el.pts[i+1].x, el.pts[i+1].y, style);
  }
  if (el.closed && n >= 3) {
    drawFenceSegment(ctx, el.pts[n-1].x, el.pts[n-1].y, el.pts[0].x, el.pts[0].y, style);
  }

  el.pts.forEach(function(pt) {
    drawFencePost(ctx, pt.x, pt.y, style);
  });

  if (selected) {
    ctx.save();
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    // Halo sombre
    ctx.strokeStyle = 'rgba(0,0,0,0.20)';
    ctx.lineWidth = m2px(0.3) + 10;
    ctx.globalAlpha = 0.18;
    ctx.beginPath();
    ctx.moveTo(el.pts[0].x, el.pts[0].y);
    for (var j = 1; j < n; j++) ctx.lineTo(el.pts[j].x, el.pts[j].y);
    if (el.closed) ctx.closePath();
    ctx.stroke();
    // Halo or
    ctx.strokeStyle = '#f6ca20';
    ctx.lineWidth = m2px(0.3) + 5;
    ctx.globalAlpha = 0.38;
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Points de vertex
    el.pts.forEach(function(pt) {
      // Ombre du point
      ctx.beginPath();
      ctx.arc(pt.x + 1, pt.y + 1.5, 7.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,0.22)';
      ctx.fill();
      // Point or
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 7, 0, Math.PI * 2);
      ctx.fillStyle = '#f6ca20';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
    });
    ctx.restore();
  }
}

function drawFencePreview(ctx, el, previewPt) {
  if (!el || !el.pts) return;
  var n = el.pts.length;

  ctx.save();
  ctx.strokeStyle = THEME.fence.plank;
  ctx.lineWidth = m2px(0.3);
  ctx.globalAlpha = 0.45;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.setLineDash([8, 5]);
  ctx.beginPath();
  ctx.moveTo(el.pts[0].x, el.pts[0].y);
  for (var i = 1; i < n; i++) ctx.lineTo(el.pts[i].x, el.pts[i].y);
  if (previewPt) ctx.lineTo(previewPt.x, previewPt.y);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.globalAlpha = 1;
  ctx.restore();
}
