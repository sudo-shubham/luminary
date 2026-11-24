import { APERTURES, SHUTTERS, ISOS } from './constants.js';

/**
 * Returns the safest minimum shutter index for handheld shooting using the
 * 1 / focalLength reciprocal rule (floor of 1/60s for wide lenses).
 */
export function getHandheldMinShutterIdx(effectiveFocalLengthMm, floorHz = 60) {
  const targetSec = 1 / Math.max(floorHz, effectiveFocalLengthMm || 50);
  for (let i = 0; i < SHUTTERS.length; i++) {
    if (SHUTTERS[i].sec <= targetSec + 1e-6) return i;
  }
  return SHUTTERS.length - 1;
}

/**
 * Returns the longest shutter index that avoids visible star trails using the
 * 500 Rule (maxSec = min(30, 500 / effectiveFocalLengthMm)).
 */
export function getAstro500RuleShutterIdx(effectiveFocalLengthMm) {
  const maxStarSec = Math.min(30, 500 / Math.max(10, effectiveFocalLengthMm || 24));
  for (let i = 0; i < SHUTTERS.length; i++) {
    if (SHUTTERS[i].sec <= maxStarSec + 0.1) return i;
  }
  return SHUTTERS.length - 1;
}

/**
 * Computes the exposure value at ISO 100 for a given aperture, shutter, and ISO.
 */
export function computeSettingsEV100(apertureIdx, shutterIdx, isoIdx) {
  const N = APERTURES[apertureIdx];
  const t = SHUTTERS[shutterIdx].sec;
  const iso = ISOS[isoIdx];
  return Math.log2((N * N) / t) - Math.log2(iso / 100);
}

/**
 * Recommends balanced exposure settings based on scene EV, lens limits, shooting style, support, and manual locks.
 */
export function recommendExposure(targetEV, gear, style, support, locks, currentExposure) {
  const effectiveMm = gear.effectiveFocalLengthMm || 50;
  const isTripod = support === 'tripod';
  const l = locks || { aperture: false, shutter: false, iso: false };

  // Base style recommendations when not locked
  let desiredApertureIdx = 7; // f/8.0
  if (style === 'portrait') desiredApertureIdx = 1; // f/1.8
  else if (style === 'landscape') desiredApertureIdx = 7; // f/8.0
  else if (style === 'street') desiredApertureIdx = 6; // f/5.6
  else if (style === 'action') desiredApertureIdx = 3; // f/2.8
  else if (style === 'night') desiredApertureIdx = 1; // f/1.8
  else if (style === 'astro') desiredApertureIdx = 0; // f/1.4+
  else if (style === 'longexp' || style === 'silk') desiredApertureIdx = 8; // f/11

  let apertureIdx = (l.aperture && currentExposure.manualOverride)
    ? Math.max(gear.minApertureIdx, Math.min(gear.maxApertureIdx, currentExposure.apertureIdx))
    : Math.max(gear.minApertureIdx, Math.min(gear.maxApertureIdx, desiredApertureIdx));

  const handheldSafeIdx = getHandheldMinShutterIdx(effectiveMm, 60);
  let minShutterIdx = isTripod ? 0 : handheldSafeIdx;
  if (style === 'action') minShutterIdx = Math.max(15, isTripod ? 15 : handheldSafeIdx); // >= 1/1000s
  else if (style === 'street') minShutterIdx = Math.max(13, isTripod ? 13 : handheldSafeIdx); // >= 1/250s
  else if (style === 'portrait') minShutterIdx = Math.max(12, isTripod ? 12 : handheldSafeIdx); // >= 1/125s
  else if (style === 'longexp' || style === 'silk') minShutterIdx = isTripod ? 3 : 8; // 4" tripod, 1/8s handheld
  else if (style === 'night') minShutterIdx = isTripod ? 1 : getHandheldMinShutterIdx(effectiveMm, 30);
  else if (style === 'astro') minShutterIdx = getAstro500RuleShutterIdx(effectiveMm);

  let bestShutterIdx = (l.shutter && currentExposure.manualOverride) ? currentExposure.shutterIdx : minShutterIdx;
  let isoIdx = (l.iso && currentExposure.manualOverride) ? currentExposure.isoIdx : 0;

  // Handle locking combinations:
  if (l.aperture && l.shutter && l.iso && currentExposure.manualOverride) {
    apertureIdx = Math.max(gear.minApertureIdx, Math.min(gear.maxApertureIdx, currentExposure.apertureIdx));
    bestShutterIdx = currentExposure.shutterIdx;
    isoIdx = currentExposure.isoIdx;
  } else if (l.aperture && l.shutter) {
    const N = APERTURES[apertureIdx];
    const t = SHUTTERS[bestShutterIdx].sec;
    const neededIsoEV = Math.log2((N * N) / t) - targetEV;
    isoIdx = Math.max(0, Math.min(ISOS.length - 1, Math.round(neededIsoEV)));
  } else if (l.aperture && l.iso) {
    const N = APERTURES[apertureIdx];
    const iso = ISOS[isoIdx];
    const neededSec = (N * N) / (Math.pow(2, targetEV) * (iso / 100));
    let closestShutter = 0, minDiff = Infinity;
    SHUTTERS.forEach((s, idx) => {
      const d = Math.abs(Math.log2(s.sec) - Math.log2(neededSec));
      if (d < minDiff) { minDiff = d; closestShutter = idx; }
    });
    bestShutterIdx = closestShutter;
  } else if (l.shutter && l.iso) {
    const t = SHUTTERS[bestShutterIdx].sec;
    const iso = ISOS[isoIdx];
    const neededN2 = t * Math.pow(2, targetEV) * (iso / 100);
    const neededN = Math.sqrt(Math.max(0.5, neededN2));
    let closestAp = gear.minApertureIdx, minDiff = Infinity;
    for (let i = gear.minApertureIdx; i <= gear.maxApertureIdx; i++) {
      const d = Math.abs(APERTURES[i] - neededN);
      if (d < minDiff) { minDiff = d; closestAp = i; }
    }
    apertureIdx = closestAp;
  } else if (l.aperture) {
    const N = APERTURES[apertureIdx];
    const neededSec = (N * N) / Math.pow(2, targetEV);
    let closestShutter = 0, minDiff = Infinity;
    SHUTTERS.forEach((s, idx) => {
      const d = Math.abs(Math.log2(s.sec) - Math.log2(neededSec));
      if (d < minDiff) { minDiff = d; closestShutter = idx; }
    });
    if (closestShutter < minShutterIdx) {
      bestShutterIdx = minShutterIdx;
      const deficitStops = Math.log2((N * N) / SHUTTERS[bestShutterIdx].sec) - targetEV;
      isoIdx = Math.max(0, Math.min(ISOS.length - 1, Math.round(deficitStops)));
    } else {
      bestShutterIdx = closestShutter;
      isoIdx = 0;
    }
  } else if (l.shutter) {
    const t = SHUTTERS[bestShutterIdx].sec;
    const neededN2 = t * Math.pow(2, targetEV);
    const neededN = Math.sqrt(Math.max(0.5, neededN2));
    let closestAp = gear.minApertureIdx, minDiff = Infinity;
    for (let i = gear.minApertureIdx; i <= gear.maxApertureIdx; i++) {
      const d = Math.abs(APERTURES[i] - neededN);
      if (d < minDiff) { minDiff = d; closestAp = i; }
    }
    apertureIdx = closestAp;
    const actualEVBase = Math.log2((APERTURES[apertureIdx] ** 2) / t);
    if (actualEVBase > targetEV) {
      const deficit = actualEVBase - targetEV;
      isoIdx = Math.max(0, Math.min(ISOS.length - 1, Math.round(deficit)));
    } else {
      isoIdx = 0;
    }
  } else if (l.iso) {
    const iso = ISOS[isoIdx];
    const N = APERTURES[apertureIdx];
    const neededSec = (N * N) / (Math.pow(2, targetEV) * (iso / 100));
    let closestShutter = 0, minDiff = Infinity;
    SHUTTERS.forEach((s, idx) => {
      const d = Math.abs(Math.log2(s.sec) - Math.log2(neededSec));
      if (d < minDiff) { minDiff = d; closestShutter = idx; }
    });
    bestShutterIdx = closestShutter;
  } else {
    // Fully automatic meter balance
    let closestShutter = minShutterIdx;
    let found = false;
    for (let sIdx = minShutterIdx; sIdx < SHUTTERS.length; sIdx++) {
      const t = SHUTTERS[sIdx].sec;
      const N = APERTURES[apertureIdx];
      const ev = Math.log2((N * N) / t);
      if (Math.abs(ev - targetEV) <= 0.6) {
        closestShutter = sIdx;
        found = true;
        break;
      }
    }
    if (!found) {
      const N = APERTURES[apertureIdx];
      const neededSec = (N * N) / Math.pow(2, targetEV);
      let minDiff = Infinity;
      SHUTTERS.forEach((s, idx) => {
        const d = Math.abs(Math.log2(s.sec) - Math.log2(neededSec));
        if (d < minDiff) { minDiff = d; closestShutter = idx; }
      });
    }

    if (closestShutter < minShutterIdx) {
      bestShutterIdx = minShutterIdx;
      const N = APERTURES[apertureIdx];
      const currentBaseEV = Math.log2((N * N) / SHUTTERS[bestShutterIdx].sec);
      const neededIsoStops = Math.round(currentBaseEV - targetEV);
      isoIdx = Math.max(0, Math.min(ISOS.length - 1, neededIsoStops));
    } else {
      bestShutterIdx = closestShutter;
      isoIdx = 0;
    }
  }

  return { apertureIdx, shutterIdx: bestShutterIdx, isoIdx };
}
