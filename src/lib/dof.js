/**
 * Optical Depth of Field (DoF) & Hyperfocal Distance Engine
 */

export function computeHyperfocal(focalMm, aperture, coc) {
  // H = f^2 / (1000 * N * c) in meters
  return (focalMm * focalMm) / (1000 * aperture * coc);
}

export function computeDof(focalMm, aperture, coc, subjectDistance) {
  const H = computeHyperfocal(focalMm, aperture, coc);
  const s = Math.max(0.3, subjectDistance);

  // Near limit Dn = (s * H) / (H + s)
  const Dn = (s * H) / (H + s);

  // Far limit Df
  let Df = Infinity;
  let totalDof = Infinity;
  const isHyperfocalOrBeyond = s >= H;

  if (!isHyperfocalOrBeyond) {
    Df = (s * H) / (H - s);
    totalDof = Df - Dn;
  }

  return {
    H,
    s,
    Dn,
    Df,
    totalDof,
    isHyperfocalOrBeyond
  };
}

/**
 * Logarithmic mapping matching physical lens distance scales (0.3m -> 40m/Infinity).
 */
export function distanceToBarPercent(d) {
  if (d <= 0.3) return 0;
  if (!isFinite(d) || d >= 40) return 100;
  const p = Math.log10(d / 0.3) / Math.log10(40 / 0.3);
  return Math.min(100, Math.max(0, p * 100));
}
