// Green Vibes — assets/garden-sprites.js
// Chargement des textures PNG + remplacement des fonctions de dessin canvas

// ── Chargement des images ───────────────────────────────────
var GardenSprites = (function() {
  var BASE = 'assets/textures/';
  var sprites = {};

  var V = '?v=2';
  function load(key, file) {
    var img = new Image();
    img.src = BASE + file + V;
    sprites[key] = img;
  }

  load('herbe',  'herbe.png');
  load('bed',    'carre-en-bois.png');
  load('tree',   'arbre.png');
  load('serre',  'serre.png');
  load('house',  'maison.png');
  load('path',   'chemin.png');
  load('fence',  'cloture.png');

  function ready(key) {
    var img = sprites[key];
    return img && img.complete && img.naturalWidth > 0;
  }

  return {
    get:   function(key) { return sprites[key]; },
    ready: ready,
  };
}());

// ── Utilitaire ombre ────────────────────────────────────────
function _spriteShadow(ctx, blur, ox, oy) {
  ctx.shadowColor   = 'rgba(30,20,5,0.28)';
  ctx.shadowBlur    = blur;
  ctx.shadowOffsetX = ox;
  ctx.shadowOffsetY = oy;
}
function _clearSpriteShadow(ctx) {
  ctx.shadowColor   = 'transparent';
  ctx.shadowBlur    = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
}

// ── 1. Fond herbe ───────────────────────────────────────────
(function() {
  var _orig    = drawBackground;
  var _pattern = null;

  drawBackground = function(ctx, canvasW, canvasH) {
    if (!GardenSprites.ready('herbe')) return _orig(ctx, canvasW, canvasH);

    if (!_pattern) {
      var S   = 400;
      var off = document.createElement('canvas');
      off.width = S; off.height = S;
      off.getContext('2d').drawImage(GardenSprites.get('herbe'), 0, 0, S, S);
      _pattern = ctx.createPattern(off, 'repeat');
    }

    ctx.save();
    ctx.setTransform(_DPR, 0, 0, _DPR, 0, 0);
    ctx.fillStyle = _pattern;
    ctx.fillRect(0, 0, canvasW, canvasH);
    ctx.restore();
  };
}());

// ── 2. Carré potager ────────────────────────────────────────
(function() {
  var _orig = drawBed;

  drawBed = function(ctx, el, selected) {
    if (!GardenSprites.ready('bed')) return _orig(ctx, el, selected);

    var x = el.position.x, y = el.position.y;
    var w = el.dimensions.width,  h = el.dimensions.height;
    var rot = (el.rotation || 0) * Math.PI / 180;

    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);
    ctx.rotate(rot);

    _spriteShadow(ctx, 16, 4, 6);
    ctx.drawImage(GardenSprites.get('bed'), -w / 2, -h / 2, w, h);
    _clearSpriteShadow(ctx);

    // Cultures dessinées par-dessus la texture
    if (el.crops && el.crops.length > 0) {
      var fr = 10;
      el.crops.forEach(function(crop) {
        var cx = -w / 2 + fr + crop.position.x * (w - fr * 2);
        var cy = -h / 2 + fr + crop.position.y * (h - fr * 2);
        renderCropSymbol(ctx, crop.type, cx, cy, 5);
      });
    }

    if (selected) {
      ctx.beginPath();
      roundRect(ctx, -w / 2, -h / 2, w, h, 5);
      strokeSelectionOutline(ctx, 2.5);
    }

    ctx.restore();
    drawLabel(ctx, el.label, x + w / 2, y - 10);
  };
}());

// ── 3. Serre ────────────────────────────────────────────────
(function() {
  var _orig = drawSerre;

  drawSerre = function(ctx, el, selected) {
    if (!GardenSprites.ready('serre')) return _orig(ctx, el, selected);

    var x = el.position.x, y = el.position.y;
    var w = el.dimensions.width,  h = el.dimensions.height;

    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);
    ctx.rotate((el.rotation || 0) * Math.PI / 180);

    _spriteShadow(ctx, 16, 4, 6);
    ctx.drawImage(GardenSprites.get('serre'), -w / 2, -h / 2, w, h);
    _clearSpriteShadow(ctx);

    if (selected) {
      ctx.beginPath();
      roundRect(ctx, -w / 2, -h / 2, w, h, 7);
      strokeSelectionOutline(ctx, 2.5);
    }

    ctx.restore();
    drawLabel(ctx, el.label, x + w / 2, y - 10);
  };
}());

// ── 4. Maison ───────────────────────────────────────────────
(function() {
  var _orig = drawHouse;

  drawHouse = function(ctx, el, selected) {
    if (!GardenSprites.ready('house')) return _orig(ctx, el, selected);

    var x = el.position.x, y = el.position.y;
    var w = el.dimensions.width,  h = el.dimensions.height;

    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);
    ctx.rotate((el.rotation || 0) * Math.PI / 180);

    _spriteShadow(ctx, 16, 4, 6);
    ctx.drawImage(GardenSprites.get('house'), -w / 2, -h / 2, w, h);
    _clearSpriteShadow(ctx);

    if (selected) {
      ctx.beginPath();
      roundRect(ctx, -w / 2, -h / 2, w, h, 8);
      strokeSelectionOutline(ctx, 2.5);
    }

    ctx.restore();
    drawLabel(ctx, el.label, x + w / 2, y - 10);
  };
}());

// ── 5. Arbre ────────────────────────────────────────────────
// Le renderer appelle drawTreeCanopy (pas drawTree) → patch la bonne fonction
(function() {
  var _origCanopy = drawTreeCanopy;

  drawTreeCanopy = function(ctx, el) {
    if (!GardenSprites.ready('tree')) return _origCanopy(ctx, el);

    var cx = el.position.x, cy = el.position.y;
    var r  = el.canopyRadius || 30;

    ctx.save();
    ctx.drawImage(GardenSprites.get('tree'), cx - r, cy - r, r * 2, r * 2);
    ctx.restore();
  };
}());

// ── 6. Chemin ───────────────────────────────────────────────
// Sprite étiré à la forme du chemin avec clip
(function() {
  var _orig = drawPath;

  drawPath = function(ctx, el, selected) {
    if (!GardenSprites.ready('path')) return _orig(ctx, el, selected);

    var x = el.position.x, y = el.position.y;
    var w = el.dimensions.width, h = el.dimensions.height;
    var hasPoly = !!(el.pts && el.pts.length >= 3);

    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);
    ctx.rotate((el.rotation || 0) * Math.PI / 180);

    function outer() {
      if (hasPoly) {
        ctx.beginPath();
        el.pts.forEach(function(pt, i) {
          if (i === 0) ctx.moveTo(pt[0] * w - w / 2, pt[1] * h - h / 2);
          else          ctx.lineTo(pt[0] * w - w / 2, pt[1] * h - h / 2);
        });
        ctx.closePath();
      } else {
        ctx.beginPath();
        roundRect(ctx, -w / 2, -h / 2, w, h, 3);
      }
    }

    // Ombre portée douce
    ctx.save();
    ctx.shadowColor   = 'rgba(30,20,5,0.20)';
    ctx.shadowBlur    = 16;
    ctx.shadowOffsetX = 4;
    ctx.shadowOffsetY = 6;
    outer();
    ctx.fillStyle = 'rgba(30,20,5,0.10)';
    ctx.fill();
    ctx.restore();

    // Clip à la forme puis dessin de l'image
    ctx.save();
    outer();
    ctx.clip();
    ctx.drawImage(GardenSprites.get('path'), -w / 2, -h / 2, w, h);
    ctx.restore();

    if (selected) {
      outer();
      strokeSelectionOutline(ctx, 2);
    }

    ctx.restore();
    drawLabel(ctx, el.label, x + w / 2, y - 6);
  };
}());
