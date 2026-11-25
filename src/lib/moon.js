import { getCardinal, calculateSolarData, getTimezoneOffsetHours } from './solar.js';

const RAD = Math.PI / 180;
const DAY_MS = 86400000;
const J1970 = 2440588;
const J2000 = 2451545;
const OBLIQUITY = RAD * 23.4397;

function toDays(date) {
  return date.valueOf() / DAY_MS - 0.5 + J1970 - J2000;
}

function rightAscension(l, b) {
  return Math.atan2(Math.sin(l) * Math.cos(OBLIQUITY) - Math.tan(b) * Math.sin(OBLIQUITY), Math.cos(l));
}

function declination(l, b) {
  return Math.asin(Math.sin(b) * Math.cos(OBLIQUITY) + Math.cos(b) * Math.sin(OBLIQUITY) * Math.sin(l));
}

function siderealTime(d, lw) {
  return RAD * (280.16 + 360.9856235 * d) - lw;
}

function getMoonCoords(d) {
  const L = RAD * (218.316 + 13.176396 * d);
  const M = RAD * (134.963 + 13.064993 * d);
  const F = RAD * (93.272 + 13.22935 * d);

  const l = L + RAD * 6.289 * Math.sin(M);
  const b = RAD * 5.128 * Math.sin(F);
  const dt = 385001 - 20905 * Math.cos(M);

  return {
    ra: rightAscension(l, b),
    dec: declination(l, b),
    dist: dt
  };
}

function getSunCoords(d) {
  const M = RAD * (357.5291 + 0.98560028 * d);
  const C = RAD * (1.9148 * Math.sin(M) + 0.02 * Math.sin(2 * M) + 0.0003 * Math.sin(3 * M));
  const P = RAD * 102.9372;
  const L = M + C + P + Math.PI;
  return {
    ra: rightAscension(L, 0),
    dec: declination(L, 0)
  };
}

/**
 * Returns moon altitude (deg) and compass azimuth (deg, 0=N, 90=E) for date & coordinates.
 */
export function getMoonPosition(date, lat, lon) {
  const lw = RAD * -lon;
  const phi = RAD * lat;
  const d = toDays(date);
  const c = getMoonCoords(d);
  const H = siderealTime(d, lw) - c.ra;

  let h = Math.asin(Math.sin(phi) * Math.sin(c.dec) + Math.cos(phi) * Math.cos(c.dec) * Math.cos(H));
  // Altitude refraction correction
  h = h + RAD * 0.017 / Math.tan(h + RAD * (10.26 / (h / RAD + 5.1)));

  const azRad = Math.atan2(Math.sin(H), Math.cos(H) * Math.sin(phi) - Math.tan(c.dec) * Math.cos(phi));
  const azimuth = Math.round(((azRad / RAD) + 180 + 360) % 360);

  return {
    altitude: Number((h / RAD).toFixed(1)),
    azimuth,
    cardinal: getCardinal(azimuth)
  };
}

/**
 * Returns moon illumination percentage (0-100), phase name, emoji, and lunar age in days.
 */
export function getMoonIllumination(date) {
  const d = toDays(date);
  const s = getSunCoords(d);
  const m = getMoonCoords(d);
  const sdist = 149598000;

  const phi = Math.acos(
    Math.sin(s.dec) * Math.sin(m.dec) +
    Math.cos(s.dec) * Math.cos(m.dec) * Math.cos(s.ra - m.ra)
  );
  const inc = Math.atan2(sdist * Math.sin(phi), m.dist - sdist * Math.cos(phi));
  const angle = Math.atan2(
    Math.cos(s.dec) * Math.sin(s.ra - m.ra),
    Math.sin(s.dec) * Math.cos(m.dec) - Math.cos(s.dec) * Math.sin(m.dec) * Math.cos(s.ra - m.ra)
  );

  const fraction = (1 + Math.cos(inc)) / 2;
  const phase = 0.5 + (0.5 * inc * (angle < 0 ? -1 : 1)) / Math.PI;
  const illumination = Math.round(fraction * 100);
  const ageDays = Number((phase * 29.530588).toFixed(1));

  let phaseName = 'New Moon';
  let phaseEmoji = '🌑';
  if (phase < 0.03 || phase > 0.97) {
    phaseName = 'New Moon';
    phaseEmoji = '🌑';
  } else if (phase < 0.22) {
    phaseName = 'Waxing Crescent';
    phaseEmoji = '🌒';
  } else if (phase < 0.28) {
    phaseName = 'First Quarter';
    phaseEmoji = '🌓';
  } else if (phase < 0.47) {
    phaseName = 'Waxing Gibbous';
    phaseEmoji = '🌔';
  } else if (phase < 0.53) {
    phaseName = 'Full Moon';
    phaseEmoji = '🌕';
  } else if (phase < 0.72) {
    phaseName = 'Waning Gibbous';
    phaseEmoji = '🌖';
  } else if (phase < 0.78) {
    phaseName = 'Last Quarter';
    phaseEmoji = '🌗';
  } else {
    phaseName = 'Waning Crescent';
    phaseEmoji = '🌘';
  }

  return { illumination, phase, ageDays, phaseName, phaseEmoji };
}

function getLocalMidnightUtcMs(dateObj, tzOffsetHours) {
  const localShifted = new Date(dateObj.getTime() + tzOffsetHours * 3600000);
  const y = localShifted.getUTCFullYear();
  const m = localShifted.getUTCMonth();
  const d = localShifted.getUTCDate();
  return Date.UTC(y, m, d, 0, 0, 0) - tzOffsetHours * 3600000;
}

/**
 * Computes moonrise and moonset local decimal hours (0-24) for the given date.
 */
export function getMoonTimes(dateObj, lat, lon, timezone) {
  const tzOffsetHours = getTimezoneOffsetHours(dateObj, timezone, lon);
  const midnightMs = getLocalMidnightUtcMs(dateObj, tzOffsetHours);

  let moonriseLocal = null;
  let moonsetLocal = null;
  const stepHours = 0.3333; // 20 minutes
  let prevAlt = getMoonPosition(new Date(midnightMs), lat, lon).altitude - 0.13;

  for (let h = stepHours; h <= 24.01; h += stepHours) {
    const t = new Date(midnightMs + h * 3600000);
    const curAlt = getMoonPosition(t, lat, lon).altitude - 0.13;

    if (prevAlt < 0 && curAlt >= 0 && moonriseLocal === null) {
      const frac = -prevAlt / (curAlt - prevAlt || 1);
      moonriseLocal = Number(((h - stepHours) + frac * stepHours).toFixed(2));
    } else if (prevAlt >= 0 && curAlt < 0 && moonsetLocal === null) {
      const frac = prevAlt / (prevAlt - curAlt || 1);
      moonsetLocal = Number(((h - stepHours) + frac * stepHours).toFixed(2));
    }
    prevAlt = curAlt;
  }

  return { moonriseLocal, moonsetLocal, midnightMs };
}

function formatHourShort(decHour) {
  if (decHour === null || decHour === undefined) return '--:--';
  const norm = ((decHour % 24) + 24) % 24;
  const h = Math.floor(norm);
  const m = Math.round((norm - h) * 60);
  return `${String(m === 60 ? (h + 1) % 24 : h).padStart(2, '0')}:${String(m === 60 ? 0 : m).padStart(2, '0')}`;
}

/**
 * Computes full lunar telemetry and tonight's Milky Way / Astro Dark-Sky Window.
 */
export function calculateLunarData(lat, lon, dateObj, timezone, solarData = null) {
  const pos = getMoonPosition(dateObj, lat, lon);
  const illum = getMoonIllumination(dateObj);
  const { moonriseLocal, moonsetLocal, midnightMs } = getMoonTimes(dateObj, lat, lon, timezone);

  // Compute tonight's true astronomical dark-sky window (18:00 today -> 06:00 tomorrow)
  let darkStart = null;
  let darkEnd = null;
  let bestRunStart = null;
  let bestRunEnd = null;
  let curRunStart = null;

  for (let h = 18; h <= 30; h += 0.5) {
    const sampleDate = new Date(midnightMs + h * 3600000);
    const sunAlt = calculateSolarData(lat, lon, sampleDate, null, timezone).altitude;
    const moonPos = getMoonPosition(sampleDate, lat, lon);
    const moonIl = getMoonIllumination(sampleDate).illumination;

    const isAstroDark = sunAlt <= -12 && (moonPos.altitude < 0 || moonIl <= 20);
    if (isAstroDark) {
      if (curRunStart === null) curRunStart = h;
      if (!bestRunStart || (h - curRunStart) > (bestRunEnd - bestRunStart)) {
        bestRunStart = curRunStart;
        bestRunEnd = h;
      }
    } else {
      curRunStart = null;
    }
  }

  let darkSkyWindow;
  if (bestRunStart !== null && bestRunEnd !== null && bestRunEnd - bestRunStart >= 1.0) {
    darkStart = formatHourShort(bestRunStart);
    darkEnd = formatHourShort(bestRunEnd);
    darkSkyWindow = {
      hasDarkWindow: true,
      label: `${darkStart}–${darkEnd}`,
      badgeClass: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30',
      detail: `True dark sky (Sun ≤ -12° and Moon down/dim) from ${darkStart} to ${darkEnd} — ideal for Milky Way & Astro.`
    };
  } else {
    darkSkyWindow = {
      hasDarkWindow: false,
      label: `${illum.illumination}% Moonlit`,
      badgeClass: 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30',
      detail: 'Moon remains bright above horizon during astronomical night.'
    };
  }

  return {
    ...pos,
    ...illum,
    moonriseLocal,
    moonsetLocal,
    moonriseLabel: formatHourShort(moonriseLocal),
    moonsetLabel: formatHourShort(moonsetLocal),
    darkSkyWindow
  };
}
