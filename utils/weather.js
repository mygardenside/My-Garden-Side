// Green Vibes — utils/weather.js
// Météo : fetchWeather, getWeatherEmoji, getWeatherAlerts, renderWeatherWidget
// Dépend de : APP, escH
// ========== WEATHER ==========
async function fetchWeather() {
  var now = Date.now();
  if (getAppState('weather') && getAppState('weatherLastFetch') && (now - getAppState('weatherLastFetch') < 30 * 60 * 1000)) return getAppState('weather');
  try {
    var lat = getAppState('location').lat;
    var lon = getAppState('location').lon;
    var url = 'https://api.open-meteo.com/v1/forecast?latitude=' + lat + '&longitude=' + lon +
      '&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation,weather_code' +
      '&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code&timezone=auto&forecast_days=7';
    var resp = await fetch(url);
    if (!resp.ok) throw new Error('Weather API error');
    var data = await resp.json();
    updateAppState('weather', data);
    updateAppState('weatherLastFetch', now);
    return data;
  } catch(e) {
    console.error('Erreur meteo:', e);
    // Afficher un message d'erreur visible
    if (document.getElementById('pageDashboard')) {
      var el = document.getElementById('pageDashboard');
      el.innerHTML += '<div style="margin:10px;padding:10px;background:#fee;border-radius:10px;color:#c33;">' + t('wx_error') + '</div>';
    }
    return null;
  }
}
function getWeatherEmoji(code) {
  if (code === 0) return '☀️';
  if (code <= 3) return '⛅';
  if (code <= 48) return '🌫️';
  if (code <= 55) return '🌦️';
  if (code <= 65) return '🌧️';
  if (code <= 67) return '🌧️';
  if (code <= 75) return '❄️';
  if (code <= 77) return '❄️';
  if (code <= 82) return '🌧️';
  if (code <= 86) return '🌨️';
  if (code >= 95) return '⛈️';
  return '🌤️';
}
function getWeatherDesc(code) {
  if (code === 0) return t('wx_clear');
  if (code <= 3) return t('wx_partly_cloudy');
  if (code <= 48) return t('wx_foggy');
  if (code <= 55) return t('wx_drizzle');
  if (code <= 65) return t('wx_rain');
  if (code <= 67) return t('wx_freezing_rain');
  if (code <= 75) return t('wx_snow');
  if (code <= 77) return t('wx_snow_grains');
  if (code <= 82) return t('wx_showers');
  if (code <= 86) return t('wx_snow_showers');
  if (code >= 95) return t('wx_storm');
  return t('wx_variable');
}
function getDayName(dateStr) {
  var d = new Date(dateStr + 'T12:00:00');
  return t('day_s_' + d.getDay());
}
function getWeatherAlerts(weather) {
  if (!weather || !weather.current) return [];
  var alerts = [];
  var temp = weather.current.temperature_2m;
  var w = weather.current.wind_speed_10m;
  var p = weather.current.precipitation;
  if (temp <= 2) alerts.push({ icon: '🥶', text: t('alert_frost') + ' ' + temp + '\u00B0C', type: 'danger' });
  else if (temp <= 5) alerts.push({ icon: '❄️', text: t('alert_cold') + ' ' + temp + '\u00B0C', type: 'warning' });
  if (temp >= 35) alerts.push({ icon: '🔥', text: t('alert_heat') + ' ' + temp + '\u00B0C', type: 'danger' });
  else if (temp >= 30) alerts.push({ icon: '☀️', text: t('alert_warm') + ' ' + temp + '\u00B0C', type: 'warning' });
  if (p > 10) alerts.push({ icon: '🌊', text: t('alert_heavy_rain') + ' ' + p + 'mm', type: 'danger' });
  else if (p > 5) alerts.push({ icon: '🌧️', text: t('alert_rain_lbl') + ' ' + p + 'mm', type: 'warning' });
  if (w > 50) alerts.push({ icon: '💨', text: t('alert_strong_wind') + ' ' + w + 'km/h', type: 'danger' });
  else if (w > 30) alerts.push({ icon: '🌬️', text: t('alert_moderate_wind') + ' ' + w + 'km/h', type: 'warning' });
  return alerts;
}
function renderWeatherWidget(weather) {
  if (!weather || !weather.current) {
    return '<div class="weather-offline">' +
      '<div style="font-size:2rem;margin-bottom:8px;">📡</div>' +
      '<div>' + t('wx_offline_mode') + '</div></div>';
  }
  var c = weather.current;
  var emoji = getWeatherEmoji(c.weather_code);
  var desc = getWeatherDesc(c.weather_code);
  var alerts = getWeatherAlerts(weather);
  var forecastHTML = '';
  if (weather.daily) {
    for (var i = 0; i < Math.min(7, weather.daily.time.length); i++) {
      forecastHTML += '<div class="forecast-day">' +
        '<div>' + (i === 0 ? t('wx_today') : getDayName(weather.daily.time[i])) + '</div>' +
        '<div style="font-size:1.2rem;">' + getWeatherEmoji(weather.daily.weather_code[i]) + '</div>' +
        '<div class="f-temp">' + Math.round(weather.daily.temperature_2m_max[i]) + '\u00B0</div>' +
        '<div style="opacity:0.7">' + Math.round(weather.daily.temperature_2m_min[i]) + '\u00B0</div>' +
        '</div>';
    }
  }
  var alertsHTML = '';
  if (alerts.length > 0) {
    alertsHTML = '<div class="weather-alerts">';
    for (var j = 0; j < alerts.length; j++) {
      alertsHTML += '<div class="weather-alert">' + alerts[j].icon + ' ' + alerts[j].text + '</div>';
    }
    alertsHTML += '</div>';
  }
  return '<div class="weather-widget">' +
    '<div class="weather-location">📍 ' + escH(getAppState('location').name || 'Seysses') + '</div>' +
    '<div class="weather-main">' +
      '<div class="weather-temp">' + Math.round(c.temperature_2m) + '\u00B0C</div>' +
      '<div><div class="weather-icon">' + emoji + '</div>' +
      '<div style="font-size:0.8rem;margin-top:2px;">' + desc + '</div></div>' +
    '</div>' +
    '<div class="weather-details">' +
      '<div class="weather-detail">💧 ' + c.relative_humidity_2m + '%</div>' +
      '<div class="weather-detail">💨 ' + Math.round(c.wind_speed_10m) + ' km/h</div>' +
      '<div class="weather-detail">🌧️ ' + c.precipitation + ' mm</div>' +
    '</div>' +
    '<div class="weather-forecast">' + forecastHTML + '</div>' +
    alertsHTML +
  '</div>';
}
