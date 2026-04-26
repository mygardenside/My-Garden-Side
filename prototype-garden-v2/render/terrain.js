// =============================================================
//  TERRAIN — fond d'herbe, grille métrique, compas
// =============================================================

var _grassPattern = null;

function buildGrassPattern(ctx) {
  var S = 200;  // tuile plus grande → répétition moins visible
  var off = document.createElement('canvas');
  off.width = S; off.height = S;
  var g = off.getContext('2d');

  g.fillStyle = THEME.grass.base;
  g.fillRect(0, 0, S, S);

  // Quelques grandes taches très douces — pas de brins répétitifs
  var seed = 17;
  for (var i = 0; i < 9; i++) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    var rx = seed % S;
    seed = (seed * 1664525 + 1013904223) >>> 0;
    var ry = seed % S;
    seed = (seed * 1664525 + 1013904223) >>> 0;
    var rs = 14 + seed % 22;  // blobs plus grands, moins répétitifs
    var bright = i % 2 === 0 ? THEME.grass.light : THEME.grass.dark;
    var grd = g.createRadialGradient(rx, ry, 0, rx, ry, rs);
    grd.addColorStop(0,   bright + '38');  // ~22% alpha (était 40%) — plus discret
    grd.addColorStop(1,   bright + '00');
    g.fillStyle = grd;
    g.beginPath();
    g.arc(rx, ry, rs, 0, Math.PI * 2);
    g.fill();
  }

  _grassPattern = ctx.createPattern(off, 'repeat');
}

function drawBackground(ctx, canvasW, canvasH) {
  if (!_grassPattern) buildGrassPattern(ctx);

  ctx.save();
  ctx.setTransform(_DPR, 0, 0, _DPR, 0, 0);
  ctx.fillStyle = _grassPattern;
  ctx.fillRect(0, 0, canvasW, canvasH);
  ctx.restore();
}

function drawGrid(ctx, cam) {
  var cellPx = PX_PER_M * cam.zoom;

  var a1 = Math.min(0.08, Math.max(0, (cellPx - 8)  / 60  * 0.08));
  var a5 = Math.min(0.14, Math.max(0, (cellPx - 3)  / 20  * 0.14));
  if (a1 < 0.005 && a5 < 0.005) return;

  ctx.save();
  cam.apply(ctx);

  // Grille 1 m
  if (a1 > 0.005) {
    ctx.strokeStyle = 'rgba(255,255,255,' + a1.toFixed(3) + ')';
    ctx.lineWidth = 0.8 / cam.zoom;
    var startX = Math.floor(-cam.x / cam.zoom / PX_PER_M) * PX_PER_M;
    var startY = Math.floor(-cam.y / cam.zoom / PX_PER_M) * PX_PER_M;
    var endX   = startX + (window.innerWidth  / cam.zoom) + PX_PER_M * 2;
    var endY   = startY + (window.innerHeight / cam.zoom) + PX_PER_M * 2;
    ctx.beginPath();
    for (var x = startX; x <= endX; x += PX_PER_M) {
      ctx.moveTo(x, startY); ctx.lineTo(x, endY);
    }
    for (var y = startY; y <= endY; y += PX_PER_M) {
      ctx.moveTo(startX, y); ctx.lineTo(endX, y);
    }
    ctx.stroke();
  }

  // Grille 5 m
  if (a5 > 0.005) {
    ctx.strokeStyle = 'rgba(255,255,255,' + a5.toFixed(3) + ')';
    ctx.lineWidth = 1.2 / cam.zoom;
    var step5 = PX_PER_M * 5;
    var sx5 = Math.floor(-cam.x / cam.zoom / step5) * step5;
    var sy5 = Math.floor(-cam.y / cam.zoom / step5) * step5;
    var ex5 = sx5 + (window.innerWidth  / cam.zoom) + step5 * 2;
    var ey5 = sy5 + (window.innerHeight / cam.zoom) + step5 * 2;
    ctx.beginPath();
    for (var x5 = sx5; x5 <= ex5; x5 += step5) {
      ctx.moveTo(x5, sy5); ctx.lineTo(x5, ey5);
    }
    for (var y5 = sy5; y5 <= ey5; y5 += step5) {
      ctx.moveTo(sx5, y5); ctx.lineTo(ex5, y5);
    }
    ctx.stroke();
  }

  ctx.restore();
}

function drawCompass(ctx, canvasW, northAngle) {
  var cx = canvasW - 50, cy = 60, r = 22;

  ctx.save();
  ctx.setTransform(_DPR, 0, 0, _DPR, 0, 0);

  // Fond cercle avec ombre douce
  ctx.beginPath();
  ctx.arc(cx, cy, r + 6, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  ctx.shadowBlur = 8;
  ctx.shadowColor = 'rgba(40,25,8,0.15)';
  ctx.fill();
  ctx.shadowBlur = 0;

  // Bord subtil
  ctx.beginPath();
  ctx.arc(cx, cy, r + 6, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(180,160,120,0.25)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Flèche
  var ang = (northAngle - 90) * Math.PI / 180;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(ang);

  // Nord (rouge doux)
  ctx.beginPath();
  ctx.moveTo(0, -r + 2);
  ctx.lineTo(5, 5);
  ctx.lineTo(0, 1);
  ctx.lineTo(-5, 5);
  ctx.closePath();
  ctx.fillStyle = '#c85040';
  ctx.fill();

  // Sud (gris chaud)
  ctx.beginPath();
  ctx.moveTo(0, r - 2);
  ctx.lineTo(5, -5);
  ctx.lineTo(0, -1);
  ctx.lineTo(-5, -5);
  ctx.closePath();
  ctx.fillStyle = '#d8cfc0';
  ctx.fill();

  ctx.restore();

  // Label N
  ctx.font = 'bold 10px sans-serif';
  ctx.fillStyle = '#c85040';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  var nx = cx + (r - 4) * Math.cos(ang - Math.PI / 2);
  var ny = cy + (r - 4) * Math.sin(ang - Math.PI / 2);
  ctx.fillText('N', nx, ny);

  ctx.restore();
}

function drawScaleRuler(ctx, cam, canvasH) {
  var targetPx = 80;
  var mPerTarget = targetPx / (PX_PER_M * cam.zoom);
  var nice = [0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100];
  var snap = nice.reduce(function(prev, cur) {
    return Math.abs(cur - mPerTarget) < Math.abs(prev - mPerTarget) ? cur : prev;
  });
  var rulePx = snap * PX_PER_M * cam.zoom;

  var rx = 20, ry = canvasH - 32, rh = 5;

  ctx.save();
  ctx.setTransform(_DPR, 0, 0, _DPR, 0, 0);

  // Fond pilule
  ctx.beginPath();
  roundRect(ctx, rx - 6, ry - 12, rulePx + 12, rh + 22, 6);
  ctx.fillStyle = 'rgba(255,255,255,0.88)';
  ctx.shadowBlur = 6;
  ctx.shadowColor = 'rgba(40,25,8,0.12)';
  ctx.fill();
  ctx.shadowBlur = 0;

  // Barre alternée chaleureuse
  var step = rulePx / 4;
  for (var i = 0; i < 4; i++) {
    ctx.fillStyle = i % 2 === 0 ? '#7a5c3a' : '#d4c8b0';
    ctx.fillRect(rx + i * step, ry, step, rh);
  }

  // Bords de la barre
  ctx.strokeStyle = 'rgba(100,75,45,0.30)';
  ctx.lineWidth = 0.8;
  ctx.strokeRect(rx, ry, rulePx, rh);

  // Label
  ctx.fillStyle = '#5a4030';
  ctx.font = '10px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  var label = snap >= 1 ? snap + ' m' : (snap * 100) + ' cm';
  ctx.fillText(label, rx + rulePx / 2, ry - 2);

  ctx.restore();
}
