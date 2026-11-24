/**
 * NOAA Solar Position Algorithm & Atmospheric Light Phase Classification
 */

export function calculateSolarData(lat, lon, dateObj, forcedSunAlt = null, timezone = null) {
  // Defensive argument handling: if 4th parameter is string and 5th is omitted, caller passed timezone as 4th arg
  if (typeof forcedSunAlt === 'string' && !timezone) {
    timezone = forcedSunAlt;
    forcedSunAlt = null;
  }

  const start = new Date(Date.UTC(dateObj.getUTCFullYear(), 0, 0));
  const dayOfYear = Math.floor((dateObj - start) / (1000 * 60 * 60 * 24));
  const utcHours = dateObj.getUTCHours() + dateObj.getUTCMinutes() / 60 + dateObj.getUTCSeconds() / 3600;
  const gamma = (2 * Math.PI / 365) * (dayOfYear - 1 + (utcHours - 12) / 24);

  const eqTime = 229.18 * (
    0.000075 +
    0.001868 * Math.cos(gamma) -
    0.032077 * Math.sin(gamma) -
    0.014615 * Math.cos(2 * gamma) -
    0.040849 * Math.sin(2 * gamma)
  );

  const decl =
    0.006918 -
    0.399912 * Math.cos(gamma) +
    0.070257 * Math.sin(gamma) -
    0.006758 * Math.cos(2 * gamma) +
    0.000907 * Math.sin(2 * gamma) -
    0.002697 * Math.cos(3 * gamma) +
    0.00148 * Math.sin(3 * gamma);

  const latRad = lat * Math.PI / 180;
  const timeOffset = eqTime + 4 * lon;
  const tst = utcHours * 60 + timeOffset;
  const hourAngleDeg = (tst / 4) - 180;
  const haRad = hourAngleDeg * Math.PI / 180;

  const cosZenith = Math.max(-1, Math.min(1,
    Math.sin(latRad) * Math.sin(decl) + Math.cos(latRad) * Math.cos(decl) * Math.cos(haRad)
  ));
  const zenithRad = Math.acos(cosZenith);
  let altitudeDeg = 90 - (zenithRad * 180 / Math.PI);

  // Solar Azimuth (0° = N, 90° = E, 180° = S, 270° = W)
  const sinZenith = Math.sin(zenithRad) || 0.0001;
  let cosAz = (Math.sin(latRad) * Math.cos(zenithRad) - Math.sin(decl)) / (Math.cos(latRad) * sinZenith);
  cosAz = Math.max(-1, Math.min(1, cosAz));
  let azimuthDeg = Math.acos(cosAz) * 180 / Math.PI;
  azimuthDeg = hourAngleDeg > 0
    ? (180 + azimuthDeg) % 360
    : (180 - azimuthDeg + 360) % 360;

  if (typeof forcedSunAlt === 'number' && !Number.isNaN(forcedSunAlt)) {
    altitudeDeg = forcedSunAlt;
  }

  const safeAlt = typeof altitudeDeg === 'number' && !Number.isNaN(altitudeDeg) ? altitudeDeg : 0;
  const safeAz = typeof azimuthDeg === 'number' && !Number.isNaN(azimuthDeg) ? Math.round(azimuthDeg) : 0;

  const cosH0 = (Math.cos(90.833 * Math.PI / 180) / (Math.cos(latRad) * Math.cos(decl))) - Math.tan(latRad) * Math.tan(decl);
  let sunriseUTC = 6, sunsetUTC = 18;
  if (cosH0 >= -1 && cosH0 <= 1) {
    const H0Deg = Math.acos(cosH0) * 180 / Math.PI;
    sunriseUTC = (720 - 4 * (lon + H0Deg) - eqTime) / 60;
    sunsetUTC = (720 - 4 * (lon - H0Deg) - eqTime) / 60;
  }

  const tzOffsetHours = getTimezoneOffsetHours(dateObj, timezone, lon);
  const localHour = ((utcHours + tzOffsetHours) % 24 + 24) % 24;
  const sunriseLocal = ((sunriseUTC + tzOffsetHours) % 24 + 24) % 24;
  const sunsetLocal = ((sunsetUTC + tzOffsetHours) % 24 + 24) % 24;

  return {
    altitude: safeAlt,
    azimuth: safeAz,
    localHour,
    sunriseLocal,
    sunsetLocal,
    blueAM: (sunriseLocal - 0.45 + 24) % 24,
    bluePM: (sunsetLocal + 0.45) % 24
  };
}

export function getTimezoneOffsetHours(dateObj, timeZoneName, fallbackLon) {
  try {
    if (timeZoneName) {
      const utcStr = dateObj.toLocaleString('en-US', { timeZone: 'UTC' });
      const tzStr = dateObj.toLocaleString('en-US', { timeZone: timeZoneName });
      const diffMs = new Date(tzStr) - new Date(utcStr);
      if (!Number.isNaN(diffMs)) {
        return diffMs / (1000 * 60 * 60);
      }
    }
  } catch (_) {}
  return Math.round((fallbackLon || 0) / 15);
}

export function formatDecimalHour(decHour) {
  const totalMins = Math.round(decHour * 60) % (24 * 60);
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function getLightPhase(altitude, cloudCover) {
  let name, badgeClass, bannerClass, baseEV, wbKelvin, wbLabel;
  const safeAlt = Number(altitude) || 0;
  const safeClouds = Number(cloudCover) || 0;
  const cloudPenalty = (safeClouds / 100) * 2.2;

  if (safeAlt < -12) {
    name = 'NIGHT';
    badgeClass = 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';
    bannerClass = 'border-indigo-500/30 bg-gradient-to-br from-indigo-500/15 via-camera to-obsidian';
    baseEV = 2.0;
    wbKelvin = 3600;
    wbLabel = 'Tungsten';
  } else if (safeAlt < -4) {
    name = 'BLUE HOUR';
    badgeClass = 'bg-sky-500/20 text-sky-300 border-sky-500/40';
    bannerClass = 'border-sky-500/30 bg-gradient-to-br from-sky-500/15 via-camera to-obsidian';
    baseEV = 5.5 - cloudPenalty * 0.4;
    wbKelvin = 4200;
    wbLabel = 'Twilight';
  } else if (safeAlt <= 8) {
    name = 'GOLDEN HOUR';
    badgeClass = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    bannerClass = 'border-amber-500/30 bg-gradient-to-br from-amber-500/15 via-camera to-obsidian';
    baseEV = 11.2 - cloudPenalty * 0.7;
    wbKelvin = 6200;
    wbLabel = 'Warm Shade';
  } else if (safeAlt <= 38) {
    name = safeClouds > 70 ? 'OVERCAST' : 'SOFT DAYLIGHT';
    badgeClass = safeClouds > 70
      ? 'bg-slate-500/20 text-slate-200 border-slate-500/40'
      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    bannerClass = 'border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-camera to-obsidian';
    baseEV = 14.0 - cloudPenalty;
    wbKelvin = safeClouds > 70 ? 6500 : 5500;
    wbLabel = safeClouds > 70 ? 'Cloudy' : 'Daylight';
  } else {
    name = safeClouds > 70 ? 'BRIGHT OVERCAST' : 'HARSH MIDDAY';
    badgeClass = 'bg-amber-500/15 dark:bg-yellow-500/20 text-amber-800 dark:text-yellow-300 border-amber-500/40 dark:border-yellow-500/40';
    bannerClass = 'border-amber-500/30 dark:border-yellow-500/30 bg-gradient-to-br from-amber-500/15 via-camera to-obsidian';
    baseEV = 15.2 - cloudPenalty;
    wbKelvin = cloudCover > 70 ? 6400 : 5200;
    wbLabel = cloudCover > 70 ? 'Cloudy' : 'Direct Sun';
  }

  return { name, badgeClass, bannerClass, baseEV: Math.max(0.5, baseEV), wbKelvin, wbLabel };
}

export function getCardinal(deg) {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(deg / 45) % 8];
}

export function classifyLightDirection(camHeading, sunAzimuth, sunAlt, camPitch) {
  const safeAlt = Number(sunAlt) || 0;
  let diff = Math.abs((Number(camHeading) || 0) - (Number(sunAzimuth) || 0)) % 360;
  if (diff > 180) diff = 360 - diff;

  const signedAngle = (((Number(sunAzimuth) || 0) - (Number(camHeading) || 0) + 540) % 360) - 180;
  const sunSide = signedAngle > 15 ? 'camera-right' : signedAngle < -15 ? 'camera-left' : 'dead-center';
  const shadowSide = signedAngle > 15 ? 'to camera-left' : signedAngle < -15 ? 'to camera-right' : 'straight back';

  if (safeAlt < -6) {
    return {
      badge: 'NIGHT / AMBIENT LIGHT',
      badgeClass: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
      summary: `Sun is below horizon (${safeAlt.toFixed(0)}°). Position subjects facing storefronts or streetlamps at 45°.`,
      action: 'EV Comp: 0.0 EV • Watch for streetlamp flare',
      evComp: 0
    };
  }
  if (safeAlt > 60) {
    return {
      badge: 'HARSH OVERHEAD SUN',
      badgeClass: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
      summary: `Sun is nearly overhead (${safeAlt.toFixed(0)}°), casting deep shadows under eyes and noses.`,
      action: 'Move subject to shade • EV Comp: -0.3 EV',
      evComp: -0.3
    };
  }
  if (diff <= 42) {
    const pitchWarn = camPitch > 15 ? ' Tilted up—watch for lens flare!' : '';
    return {
      badge: 'BACKLIT / RIM LIGHT',
      badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      summary: `Aiming toward sun (${diff.toFixed(0)}° off-axis). Creates glowing edges, but darkens faces.${pitchWarn}`,
      action: 'Portraits: +1.3 EV • Silhouettes: -1.3 EV',
      evComp: 1.3
    };
  }
  if (diff >= 135) {
    return {
      badge: 'FRONT LIGHT (EVEN)',
      badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      summary: `Sun is behind you (${diff.toFixed(0)}° away). Bright, evenly lit subjects with vivid colors.`,
      action: 'EV Comp: 0.0 EV • Easiest angle for beginners',
      evComp: 0
    };
  }
  return {
    badge: '45° SIDE / REMBRANDT',
    badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    summary: `Sun is ${diff.toFixed(0)}° off-axis on ${sunSide}. Sculpted highlights with shadows falling ${shadowSide}.`,
    action: 'EV Comp: 0.0 EV • Ideal 3D depth & texture',
    evComp: 0
  };
}

export function decodeWMOWeather(code) {
  if (code === 0) return 'Clear';
  if (code <= 3) return 'Partly Cloudy';
  if (code <= 48) return 'Fog / Haze';
  if (code <= 67) return 'Rain';
  if (code <= 77) return 'Snow';
  if (code <= 82) return 'Showers';
  return 'Stormy';
}
