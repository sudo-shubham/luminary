import { getCardinal } from './solar.js';

/**
 * Haversine distance between two coordinates in kilometers.
 */
export function haversineDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Initial compass bearing (0-359 deg) from point 1 to point 2.
 */
export function calculateBearingDeg(lat1, lon1, lat2, lon2) {
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const dLam = ((lon2 - lon1) * Math.PI) / 180;
  const y = Math.sin(dLam) * Math.cos(phi2);
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(dLam);
  const brng = (Math.atan2(y, x) * 180) / Math.PI;
  return Math.round((brng + 360) % 360);
}

function angularDiff(a, b) {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

/**
 * Checks whether a spot's compass bearing aligns with Sunrise or Sunset azimuths.
 */
export function getLightAlignment(bearingDeg, sunriseAz, sunsetAz) {
  if (angularDiff(bearingDeg, sunriseAz) <= 28) {
    return {
      label: 'Sunrise Aligned',
      badgeClass: 'bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/30'
    };
  }
  if (angularDiff(bearingDeg, sunsetAz) <= 28) {
    return {
      label: 'Sunset Aligned',
      badgeClass: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30'
    };
  }
  if (angularDiff(bearingDeg, (sunriseAz + 180) % 360) <= 25) {
    return {
      label: 'Front-Lit AM',
      badgeClass: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30'
    };
  }
  if (angularDiff(bearingDeg, (sunsetAz + 180) % 360) <= 25) {
    return {
      label: 'Front-Lit PM',
      badgeClass: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30'
    };
  }
  return null;
}

function classifyOsmTags(tags = {}) {
  if (tags.tourism === 'viewpoint') return 'viewpoint';
  if (tags.natural === 'peak' || tags.natural === 'volcano' || tags.natural === 'cliff' || tags.natural === 'ridge') return 'mountain';
  if (tags.waterway === 'waterfall' || tags.waterway === 'river' || tags.natural === 'water' || tags.water) return 'water';
  return 'landmark';
}

function classifyTitleHeuristic(title = '') {
  const t = title.toLowerCase();
  if (/(viewpoint|overlook|lookout|scenic|observatory)/.test(t)) return 'viewpoint';
  if (/(mountain|peak|hill|ridge|summit|pass|mount |mt\.)/.test(t)) return 'mountain';
  if (/(river|lake|waterfall|falls|reservoir|dam|canal|bay|beach|stream|creek)/.test(t)) return 'water';
  return 'landmark';
}

/**
 * Fetches nearby scenic photography spots using OpenStreetMap Overpass API,
 * falling back to Wikipedia Geosearch if Overpass is unavailable or empty.
 */
export async function fetchNearbyScenicSpots(lat, lon, radiusKm = 20) {
  const radiusM = Math.round(radiusKm * 1000);
  const query = `
    [out:json][timeout:10];
    (
      node["tourism"="viewpoint"]["name"](around:${radiusM},${lat},${lon});
      node["natural"="peak"]["name"](around:${radiusM},${lat},${lon});
      node["waterway"="waterfall"]["name"](around:${radiusM},${lat},${lon});
      way["natural"="water"]["name"](around:${radiusM},${lat},${lon});
      way["waterway"="river"]["name"](around:${radiusM},${lat},${lon});
      node["tourism"="attraction"]["name"](around:${radiusM},${lat},${lon});
      node["historic"~"castle|monument|ruins"]["name"](around:${radiusM},${lat},${lon});
    );
    out center 45;
  `.trim();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9000);
    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
      body: `data=${encodeURIComponent(query)}`,
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const json = await res.json();
      const elements = Array.isArray(json?.elements) ? json.elements : [];
      const seen = new Set();
      const spots = [];

      for (const el of elements) {
        const name = el.tags?.name?.trim();
        const sLat = el.lat ?? el.center?.lat;
        const sLon = el.lon ?? el.center?.lon;
        if (!name || typeof sLat !== 'number' || typeof sLon !== 'number') continue;

        const key = name.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);

        const distanceKm = haversineDistanceKm(lat, lon, sLat, sLon);
        const bearingDeg = calculateBearingDeg(lat, lon, sLat, sLon);
        const category = classifyOsmTags(el.tags);
        const eleRaw = el.tags?.ele ? parseFloat(el.tags.ele) : NaN;

        spots.push({
          id: `${el.type}-${el.id}`,
          name,
          lat: sLat,
          lon: sLon,
          category,
          distanceKm,
          bearingDeg,
          cardinal: getCardinal(bearingDeg),
          elevationM: !Number.isNaN(eleRaw) ? Math.round(eleRaw) : null,
          tagLabel: el.tags?.tourism || el.tags?.natural || el.tags?.waterway || el.tags?.historic || 'spot'
        });
      }

      if (spots.length > 0) {
        spots.sort((a, b) => a.distanceKm - b.distanceKm);
        return { spots: spots.slice(0, 35), source: 'OpenStreetMap' };
      }
    }
  } catch {
    // Fall through to Wikipedia Geosearch
  }

  // Fallback: Wikipedia Geosearch API (CORS-enabled, zero API key)
  const wikiRadius = Math.min(10000, radiusM);
  const wikiUrl = `https://en.wikipedia.org/w/api.php?action=query&list=geosearch&gscoord=${lat.toFixed(5)}|${lon.toFixed(5)}&gsradius=${wikiRadius}&gslimit=25&format=json&origin=*`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);
  const res = await fetch(wikiUrl, { signal: controller.signal });
  clearTimeout(timeoutId);

  if (!res.ok) {
    throw new Error('Could not reach scenic spots services.');
  }

  const data = await res.json();
  const list = data?.query?.geosearch || [];
  const spots = list.map((item) => {
    const distanceKm = item.dist ? item.dist / 1000 : haversineDistanceKm(lat, lon, item.lat, item.lon);
    const bearingDeg = calculateBearingDeg(lat, lon, item.lat, item.lon);
    return {
      id: `wiki-${item.pageid}`,
      name: item.title,
      lat: item.lat,
      lon: item.lon,
      category: classifyTitleHeuristic(item.title),
      distanceKm,
      bearingDeg,
      cardinal: getCardinal(bearingDeg),
      elevationM: null,
      tagLabel: 'landmark'
    };
  });

  spots.sort((a, b) => a.distanceKm - b.distanceKm);
  return { spots, source: 'Wikipedia' };
}
