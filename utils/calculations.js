// Green Vibes — utils/calculations.js
// Calculs : surfaces, rendements, rotation, stades, helpers
// Dépend de : APP
// ========== UTILITIES ==========
function getUsedBedSurfaceForSeason(bedId, season, excludeCropId, includePlanned, targetDate) {
  var used = 0;
  var tgt = targetDate ? new Date(targetDate) : null;

  for (var i = 0; i < getAppState('crops').length; i++) {
    var c = getAppState('crops')[i];
    if (!c) continue;
    if (c.bedId !== bedId) continue;
    if (c.season !== season) continue;
    if (excludeCropId && c.id === excludeCropId) continue;

    var allowed =
      c.status === 'active' ||
      (includePlanned && c.status === 'planned');

    if (!allowed) continue;

    // If a target planting date is given, skip crops already harvested by then
    if (tgt && c.dateHarvest && new Date(c.dateHarvest) <= tgt) continue;

    used += getCropSurface(c) || 0;
  }

  return used;
}
function escH(str) {
  var d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}
function getStartTypeLabel(startType) {
  if (startType === 'seed') return t('start_type_seed');
  return t('start_type_plant');
}
function getPreviousSeasonOfCurrent() {
  var idx = getAppState('seasons').indexOf(getAppState('currentSeason'));
  if (idx <= 0) return null;
  return getAppState('seasons')[idx - 1];
}

function getInitialCropStatus(datePlant) {
  if (!datePlant) return 'planned';
  var today = new Date();
  today.setHours(0, 0, 0, 0);
  var plantDate = new Date(datePlant);
  if (isNaN(plantDate.getTime())) return 'planned';
  plantDate.setHours(0, 0, 0, 0);
  return plantDate > today ? 'planned' : 'active';
}
function refreshCropStatuses() {
  var today = new Date();
  today.setHours(0, 0, 0, 0);
  var changed = false;
  getAppState('crops').forEach(function(crop) {
    if (!crop || crop.status === 'harvested') return;
    if (!crop.datePlant) return;
    var plantDate = new Date(crop.datePlant);
    if (isNaN(plantDate.getTime())) return;
    plantDate.setHours(0, 0, 0, 0);
    var newStatus = plantDate > today ? 'planned' : 'active';
    if (crop.status !== newStatus) {
      crop.status = newStatus;
      changed = true;
    }
  });
  if (changed) saveData();
}
function getCropStage(crop) {
  if (!crop) return 'planned';
  if (crop.status === 'planned') return 'planned';
  if (crop.status === 'harvested') return 'harvested';
  if (!crop.datePlant) return 'seedling';
  var veggie = getAppState('vegetables')[crop.veggieId];
  if (!veggie) return 'seedling';
  var plantDate = new Date(crop.datePlant);
  if (isNaN(plantDate.getTime())) return 'seedling';
  var daysSincePlant = Math.floor((Date.now() - plantDate.getTime()) / 86400000);
  var total = Math.max(veggie.daysToHarvest || 1, 1);
  var ratio = daysSincePlant / total;
  if (ratio < 0.2) return 'seedling';
  if (ratio < 0.6) return 'growing';
  if (ratio < 0.9) return 'maturing';
  return 'harvest';
}
function getStageName(stage) {
  return t('stage_' + stage) || stage;
}

/** Helper central de formatage de dates — locale selon la langue active */
function fmtDate(date, options) {
  var lang = (typeof getAppState === 'function') ? getAppState('language') : 'fr';
  var locale = (lang === 'en') ? 'en-GB' : 'fr-FR';
  var d = (date instanceof Date) ? date : new Date(date);
  return d.toLocaleDateString(locale, options || undefined);
}
function getStageColor(stage) {
  var colors = { planned:'#7c3aed', seedling:'#eab308', growing:'#22c55e', maturing:'#3b82f6', harvest:'#f97316', harvested:'#6b7280' };
  return colors[stage] || '#9ca3af';
}
function getStageBadgeClass(stage) {
  var map = { planned:'badge-blue', seedling:'badge-yellow', growing:'badge-green', maturing:'badge-blue', harvest:'badge-orange', harvested:'badge-gray' };
  return map[stage] || 'badge-gray';
}
function getCropSurface(crop) {
  var veggie = getAppState('vegetables')[crop.veggieId];
  if (!veggie) return 0;
  if (crop.mode === 'surface') return crop.qty || 0;
  return (crop.qty || 0) * (crop.spacePer || veggie.spacePerPlant);
}
function getCropEstimatedYield(crop) {
  var veggie = getAppState('vegetables')[crop.veggieId];
  if (!veggie) return 0;
  return getCropSurface(crop) * veggie.yieldPerM2;
}
function getBedSurface(bed) { return (bed.length || 0) * (bed.width || 0); }
function getBedOccupation(bed) {
  var total = getBedSurface(bed);
  if (total <= 0) return 0;
  var used = 0;
  for (var i = 0; i < getAppState('crops').length; i++) {
    var c = getAppState('crops')[i];
    if (c.bedId === bed.id && c.season === getAppState('currentSeason') && c.status === 'active') {
      used += getCropSurface(c);
    }
  }
  return Math.min(100, Math.round((used / total) * 100));
}
function getBedPlannedOccupation(bed) {
  var total = getBedSurface(bed);
  if (total <= 0) return 0;
  var used = 0;
  for (var i = 0; i < getAppState('crops').length; i++) {
    var c = getAppState('crops')[i];
    if (
      c.bedId === bed.id &&
      c.season === getAppState('currentSeason') &&
      (c.status === 'active' || c.status === 'planned')
    ) {
      used += getCropSurface(c);
    }
  }
  return Math.min(100, Math.round((used / total) * 100));
}
function getRemainingBedSurface(bedId, excludeCropId) {
  if (!bedId) return Infinity;

  var bed = getAppState('beds').find(function(b) {
    return b.id === bedId;
  });

  if (!bed) return 0;

  var total = getBedSurface(bed);
  var used = 0;

  getAppState('crops').forEach(function(c) {
    if (excludeCropId && c.id === excludeCropId) return;

    if (
      c.bedId === bedId &&
      c.season === getAppState('currentSeason') &&
      (c.status === 'active' || c.status === 'planned')
    ) {
      used += getCropSurface(c);
    }
  });

  return Math.max(0, total - used);
}

function getMonthLabel(month) {
  var names = {
    1:'Janvier',
    2:'Fevrier',
    3:'Mars',
    4:'Avril',
    5:'Mai',
    6:'Juin',
    7:'Juillet',
    8:'Aout',
    9:'Septembre',
    10:'Octobre',
    11:'Novembre',
    12:'Decembre'
  };
  return names[month] || '';
}
function getBedCrops(bedId, season) {
  var s = season || getAppState('currentSeason');
  return getAppState('crops').filter(function(c) { return c.bedId === bedId && c.season === s; });
}
function getBedFamilies(bedId, season) {
  var crops = getBedCrops(bedId, season);
  var families = [];
  crops.forEach(function(c) {
    var v = getAppState('vegetables')[c.veggieId];
    if (v && families.indexOf(v.family) < 0) families.push(v.family);
  });
  return families;
}
function getRotationScore(bed) {
  if (getAppState('seasons').length < 2) return { score: 'good', repeated: 0 };

  var currentFamilies = getBedFamilies(bed.id, getAppState('currentSeason'));
  var prevSeason = getPreviousSeasonOfCurrent();
  if (!prevSeason) return { score: 'good', repeated: 0 };

  var prevFamilies = getBedFamilies(bed.id, prevSeason);

  var repeated = 0;
  for (var i = 0; i < currentFamilies.length; i++) {
    if (prevFamilies.indexOf(currentFamilies[i]) >= 0) repeated++;
  }

  if (repeated === 0) return { score: 'good', repeated: repeated };
  if (repeated === 1) return { score: 'warning', repeated: repeated };
  return { score: 'bad', repeated: repeated };
}
function getRotationBadge(bed) {
  var r   = getRotationScore(bed);
  var lng = typeof getAppState === 'function' ? (getAppState('language') || 'fr') : 'fr';
  var isEn = lng === 'en';

  var badge;
  if (r.score === 'good')    badge = '<span class="badge badge-green">🟢 ' + (isEn ? 'Rotation OK' : 'Rotation OK') + '</span>';
  else if (r.score === 'warning') badge = '<span class="badge badge-orange">🟠 ' + (isEn ? 'Rotation warning' : 'Attention rotation') + '</span>';
  else                       badge = '<span class="badge badge-red">🔴 '   + (isEn ? 'Poor rotation' : 'Rotation mauvaise') + '</span>';

  // Alertes climatiques (V3.4)
  if (typeof GeoCalendar === 'undefined') return badge;
  var alerts = GeoCalendar.getRotationAlert(bed);
  if (!alerts || !alerts.length) return badge;

  var alertHtml = '<div style="margin-top:10px;">';
  alerts.forEach(function (a) {
    var color  = a.humidRisk ? '#b05000' : '#8a6000';
    var icon   = a.humidRisk ? '💧🔴' : '🔴';
    var title  = isEn
      ? icon + ' <strong>' + a.consecutive + ' consecutive seasons</strong> of ' + a.family
      : icon + ' <strong>' + a.consecutive + ' saisons consécutives</strong> de ' + a.family;
    var body;
    if (a.humidRisk) {
      body = isEn
        ? 'Your climate (' + a.koppen + ') increases residual disease risk: ' + a.disease + '. Recommended rest: <strong>' + a.restYears + ' years</strong>.'
        : 'Votre climat (' + a.koppen + ') aggrave le risque résiduel : ' + a.disease + '. Repos recommandé : <strong>' + a.restYears + ' ans</strong>.';
    } else {
      body = isEn
        ? 'Risk of ' + a.disease + '. Recommended rest: <strong>' + a.restYears + ' years</strong>.'
        : 'Risque de ' + a.disease + '. Repos recommandé : <strong>' + a.restYears + ' ans</strong>.';
    }
    alertHtml +=
      '<div style="margin-top:8px;padding:8px 10px;background:#fff8e6;border-left:3px solid ' + color + ';border-radius:4px;font-size:0.8rem;color:' + color + ';">' +
        '<div>' + title + '</div>' +
        '<div style="margin-top:2px;color:#555;">' + body + '</div>' +
      '</div>';
  });
  alertHtml += '</div>';

  return badge + alertHtml;
}

/** Échappe une chaîne pour attribut HTML onclick (guillemets simples). */
function escAttr(str) {
  return "'" + str.replace(/'/g, "\\'") + "'";
}

/** Retourne le nom du mois (1-12). */
function getMonthName(m) {
  return ['Janvier','Février','Mars','Avril','Mai','Juin',
          'Juillet','Août','Septembre','Octobre','Novembre','Décembre'][m - 1] || '';
}
