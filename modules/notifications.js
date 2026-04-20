// Green Vibes — modules/notifications.js
// Notifications intelligentes
// V20 — NOTIFICATIONS INTELLIGENTES
// ============================================================
var NOTIF_KEY = 'gvp_notif_store';
function loadNotifStore() {
  try { var r = localStorage.getItem(NOTIF_KEY); return r ? JSON.parse(r) : { read:[], ignored:[] }; }
  catch(e) { return { read:[], ignored:[] }; }
}
function saveNotifStore(s) {
  try { localStorage.setItem(NOTIF_KEY, JSON.stringify(s)); } catch(e) {}
}
function markNotificationDone(id) {
  var s = loadNotifStore();
  s.read = s.read.filter(function(x){ return x.id !== id; });
  s.read.push({ id:id, at:new Date().toISOString() });
  saveNotifStore(s);
  renderNotifications();
}
function ignoreNotification(id) {
  var s = loadNotifStore();
  s.ignored = s.ignored.filter(function(x){ return x.id !== id; });
  s.ignored.push({ id:id, at:new Date().toISOString() });
  saveNotifStore(s);
  renderNotifications();
}
function getUnreadNotifCount() {
  var s    = loadNotifStore();
  var read = (s.read||[]).map(function(x){ return x.id; });
  return getSmartNotifications().filter(function(n){ return read.indexOf(n.id) < 0; }).length;
}

/**
 * Genere les notifications intelligentes actives.
 * Exclut les notifications ignorees depuis moins de 7 jours.
 */
function getSmartNotifications() {
  var notes   = [];
  var today   = new Date();
  var todayStr= today.toISOString().split('T')[0];
  var mem     = getLearningMemory();
  var store   = loadNotifStore();
  var todayM  = today.getMonth() + 1;

  function notIgnored(id) {
    return !(store.ignored||[]).some(function(d){
      return d.id === id && Math.floor((today - new Date(d.at)) / 86400000) < 7;
    });
  }

  var seasonCrops = APP.crops.filter(function(c){ return c.season === APP.currentSeason; });
  var activeCrops = seasonCrops.filter(function(c){ return c.status === 'active'; });

  // Recoltes imminentes
  activeCrops.forEach(function(c) {
    var v    = APP.vegetables[c.veggieId]; if (!v) return;
    var id   = 'harvest-soon-' + c.id;
    if (!c.dateHarvest || !notIgnored(id)) return;
    var diff = Math.floor((new Date(c.dateHarvest) - today) / 86400000);
    if (diff >= 0 && diff <= 3) {
      notes.push({ id:id, type:'harvest',
        priority: diff === 0 ? 'urgent' : 'important', icon: v.icon,
        title: diff === 0 ? t('notif_harvest_today_title').replace('{name}', v.name) : t('notif_harvest_soon_title').replace('{name}', v.name).replace('{n}', diff),
        text: t('notif_harvest_quality'),
        action: { actionType:'quick_action', payload:{ action:'harvest', cropId:c.id } },
        dueDate: c.dateHarvest
      });
    }
  });

  // Recoltes en retard
  activeCrops.forEach(function(c) {
    var v  = APP.vegetables[c.veggieId]; if (!v || !c.dateHarvest) return;
    var id = 'harvest-late-' + c.id;
    if (!notIgnored(id)) return;
    var retard = Math.floor((today - new Date(c.dateHarvest)) / 86400000);
    if (retard > 5) {
      notes.push({ id:id, type:'harvest', priority:'urgent', icon:'\u23F0',
        title: t('notif_harvest_late_title').replace('{name}', v.name).replace('{n}', retard),
        text: t('notif_harvest_check'),
        action: { actionType:'quick_action', payload:{ action:'harvest', cropId:c.id } },
        dueDate: todayStr
      });
    }
  });

  // Alertes meteo
  if (APP.weather && APP.weather.current) {
    var temp = APP.weather.current.temperature_2m;
    var prec = APP.weather.current.precipitation;
    if (temp <= 2 && notIgnored('frost')) {
      notes.push({ id:'frost', type:'weather', priority:'urgent', icon:'\uD83E\uDD76',
        title: t('notif_frost_title').replace('{temp}', Math.round(temp)),
        text: t('notif_frost_text'),
        action: { actionType:'navigate', payload:{ target:'today' } }, dueDate:todayStr
      });
    }
    if (temp >= 20 && prec < 1 && activeCrops.length > 0 && notIgnored('water-today')) {
      notes.push({ id:'water-today', type:'watering', priority:'info', icon:'\uD83D\uDCA7',
        title: t('notif_water_title'),
        text: t('notif_water_text').replace('{temp}', Math.round(temp)),
        action: { actionType:'navigate', payload:{ target:'today' } }, dueDate:todayStr
      });
    }
  }

  // (occupation élevée = bonne gestion — pas de notification surcharge)

  // Rotation problematique
  APP.beds.forEach(function(bed) {
    var id = 'rotation-' + bed.id;
    if (!notIgnored(id) && getRotationScore(bed).score === 'bad' && APP.seasons.length >= 2) {
      notes.push({ id:id, type:'rotation', priority:'info', icon:'\uD83D\uDD04',
        title: t('notif_rotation_title').replace('{name}', escH(bed.name)),
        text: t('notif_rotation_text'),
        action: { actionType:'show_analysis', payload:{} }, dueDate:null
      });
    }
  });

  // Legume fiable a replanter maintenant
  Object.keys(mem.vegetableProfiles).forEach(function(vid) {
    var p = mem.vegetableProfiles[vid]; if (p.count < 2 || p.avgRatio < 0.82) return;
    var id = 'replant-' + vid; if (!notIgnored(id)) return;
    var veg = APP.vegetables[vid]; if (!veg) return;
    if (APP.crops.some(function(c){ return c.veggieId===vid && c.season===APP.currentSeason && c.status!=='harvested'; })) return;
    var cal = getPlantingCalendarForVeggie(veg);
    if (!cal || !cal.plantMonths || cal.plantMonths.indexOf(todayM) < 0) return;
    notes.push({ id:id, type:'plant', priority:'info', icon:veg.icon,
      title: t('notif_replant_title').replace('{name}', veg.name),
      text: t('notif_replant_text').replace('{pct}', Math.round(p.avgRatio*100)),
      action: { actionType:'open_modal', payload:{ modalType:'plan_crop', veggieId:vid } }, dueDate:null
    });
  });

  var order = { urgent:0, important:1, info:2 };
  notes.sort(function(a,b){ return (order[a.priority]||2) - (order[b.priority]||2); });
  return notes;
}

// ---- Page Notifications ----
function renderNotifications() {
  var el = document.getElementById('pageNotifications');
  if (!el) return;
  document.getElementById('headerTitle').textContent = t('notif_title');
  document.getElementById('fab').style.display = 'none';

  var store  = loadNotifStore();
  var readIds= (store.read||[]).map(function(d){ return d.id; });
  var all    = getSmartNotifications();
  var active = all.filter(function(n){ return readIds.indexOf(n.id) < 0; });
  var done   = all.filter(function(n){ return readIds.indexOf(n.id) >= 0; });

  var html = '<div class="fade-in">';
  if (active.length === 0 && done.length === 0) {
    html += '<div style="text-align:center;padding:50px 20px;color:var(--text-light);">' +
      '<div style="font-size:2.5rem;margin-bottom:10px;">✅</div>' +
      '<div style="font-size:0.9rem;">' + t('notif_none') + '</div></div>';
  } else {
    if (active.length > 0) {
      html += '<div class="dash-section-label" style="margin:4px 0 8px;"><div>\u26A1 Actives (' + active.length + ')</div></div>';
      active.forEach(function(n) {
        var notifActionId = n.action ? registerSmartAction(n.action) : null;
        html += '<div class="notif-item ' + (n.priority||'info') + '">' +
          '<div class="notif-icon">' + n.icon + '</div>' +
          '<div class="notif-body">' +
            '<div class="notif-title">' + n.title + '</div>' +
            '<div class="notif-text">' + n.text + '</div>' +
            (n.dueDate ? '<div class="notif-due">\uD83D\uDDD3 ' + fmtDate(new Date(n.dueDate)) + '</div>' : '') +
            '<div class="notif-btns">' +
              '<button class="notif-btn done"   onclick="markNotificationDone(\'' + n.id + '\')">' + t('notif_done') + '</button>' +
              '<button class="notif-btn ignore" onclick="ignoreNotification(\'' + n.id + '\')">' + t('notif_ignore') + '</button>' +
              (notifActionId ? '<button class="notif-btn done" onclick="executeSmartActionById(\'' + notifActionId + '\')">Agir \u203A</button>' : '') +
            '</div>' +
          '</div></div>';
      });
    }
    if (done.length > 0) {
      html += '<div class="dash-section-label" style="margin:14px 0 8px;"><div>\u2705 Termin\u00e9es (' + done.length + ')</div></div>';
      done.forEach(function(n) {
        html += '<div class="notif-item info done"><div class="notif-icon">' + n.icon + '</div>' +
          '<div class="notif-body"><div class="notif-title">' + n.title + '</div></div></div>';
      });
    }
  }
  el.innerHTML = html + '</div>';
}

// ============================================================
