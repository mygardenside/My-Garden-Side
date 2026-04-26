// Green Vibes — modules/garden.js
// Cycle de vie du canvas jardin : init au 1er accès, resize aux suivants.

var GardenModule = {
  _initialized: false,

  // Calcule les dimensions depuis le DOM réel (bypass la chaîne CSS height)
  _resize: function(canvas) {
    var header = document.querySelector('.app-header');
    var nav    = document.querySelector('.bottom-nav');
    var hh = header ? header.offsetHeight : 0;
    var nh = nav    ? nav.offsetHeight    : 0;
    var wrap = canvas.parentElement;
    var w = Math.max(1, wrap.offsetWidth);
    var h = Math.max(1, window.innerHeight - hh - nh);
    canvas.width        = Math.round(w * _DPR);
    canvas.height       = Math.round(h * _DPR);
    canvas.style.width  = w + 'px';
    canvas.style.height = h + 'px';
  },

  show: function() {
    var canvas = document.getElementById('garden-canvas');
    var wrap   = document.getElementById('garden-canvas-wrap');
    if (!canvas || !wrap) return;
    var self = this;

    if (!this._initialized) {
      this._initialized = true;

      requestAnimationFrame(function() {
        self._resize(canvas);

        // Import jardin depuis URL partagée (#garden=<base64>)
        (function() {
          var hash = location.hash;
          if (hash && hash.indexOf('#garden=') === 0) {
            try {
              var b64  = hash.slice('#garden='.length);
              var json = decodeURIComponent(escape(atob(b64)));
              localStorage.setItem('garden_v2', json);
            } catch(e) {}
            history.replaceState(null, '', location.pathname + location.search);
          }
        }());

        Renderer.init(canvas);
        Toolbar.init();
        Panels.init();
        Interactions.bindAll(canvas);
        GardenStore.load();
        Camera.reset(canvas.width, canvas.height);
        Renderer.startLoop();
        Toolbar.updateModeIndicator();

        // Bouton mode vue/édition
        var btnView = document.getElementById('btn-view-toggle');
        if (btnView) {
          btnView.addEventListener('click', function() {
            GardenBridge.toggleViewMode();
          });
        }

        // Bouton partage
        var btnShare = document.getElementById('btn-share');
        if (btnShare) {
          btnShare.addEventListener('click', function() {
            GardenBridge.shareGarden();
          });
        }

        // Pause auto quand on quitte la page jardin (économie batterie)
        GardenBridge._watchVisibility();

        // Interface mobile
        if (typeof GardenMobile !== 'undefined') GardenMobile.init();

        // Resize au changement de taille fenêtre / rotation téléphone
        window.addEventListener('resize', function() {
          requestAnimationFrame(function() { self._resize(canvas); });
        });
      });

    } else {
      // Visites suivantes : recalibrer + reprendre la boucle
      requestAnimationFrame(function() {
        self._resize(canvas);
        Renderer.resumeLoop();
      });
    }
  },
};

function renderGarden() {
  GardenModule.show();
}
