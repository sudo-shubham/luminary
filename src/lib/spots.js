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

const NON_PHOTO_SPOT_REGEX =
  /\b(metro|subway|railway|train station|rail station|bus stop|bus stand|bus terminal|station|airport|helipad|hospital|clinic|medical|pharmacy|school|college|university|bank|atm|police|post office|mall|supermarket|hypermarket|hotel|hostel|motel|petrol|gas station|fuel|parking|office|apartment|flyover|junction|interchange|roundabout|chowk)\b/i;

const SCENIC_TITLE_REGEX =
  /\b(viewpoint|overlook|lookout|scenic|observatory|mountain|peak|hill|ridge|summit|valley|cliff|pass|mount|waterfall|falls|river|lake|pond|reservoir|dam|lagoon|beach|coast|island|park|garden|forest|sanctuary|reserve|fort|palace|castle|temple|mosque|cathedral|church|monument|memorial|tomb|ruins|gate|tower|bridge|ghat)\b/i;

const GOVT_BUILDING_REGEX =
  /\b(secretariat|ministry|parliament|legislature|assembly|vidhan sabha|lok sabha|rajya sabha|municipal|municipality|corporation|collectorate|court|courthouse|tribunal|embassy|consulate|tehsil|taluka|panchayat|cantonment|revenue|tax office|passport|rto|town hall|city hall|civic center|civic centre|government|govt)\b/i;

const PHOTO_SPOT_EXCEPTION_REGEX =
  /\b(fort|palace|castle|monument|memorial|tomb|ruins|heritage|viewpoint|overlook|lookout|scenic|observatory|garden|park)\b/i;

function extractCityTokens(locationName = '') {
  if (!locationName) return [];
  const lower = locationName.toLowerCase().trim();
  if (lower.startsWith('pinned spot') || lower === 'current gps' || lower === 'unknown') {
    return [];
  }
  const primary = lower.split(',')[0].trim();
  if (!primary || primary.length < 2) return [];
  return [primary];
}

function isCitySelfMatch(name = '', locationName = '') {
  const normalized = name.toLowerCase().trim();
  if (!normalized) return false;
  const cities = extractCityTokens(locationName);
  for (const city of cities) {
    if (
      normalized === city ||
      normalized === `${city} city` ||
      normalized === `city of ${city}` ||
      normalized === `${city} district`
    ) {
      return true;
    }
  }
  return false;
}

function isScenicPhotoSpot(name = '', tags = {}, locationName = '') {
  if (!name || NON_PHOTO_SPOT_REGEX.test(name)) return false;
  if (isCitySelfMatch(name, locationName)) return false;
  if (tags.railway || tags.public_transport || tags.highway || tags.amenity || tags.office || tags.place) {
    return false;
  }
  if (GOVT_BUILDING_REGEX.test(name)) {
    const isScenicException =
      tags.tourism === 'viewpoint' ||
      PHOTO_SPOT_EXCEPTION_REGEX.test(name);
    if (!isScenicException) return false;
  }
  return true;
}

function classifyOsmTags(tags = {}) {
  if (tags.tourism === 'viewpoint') return 'viewpoint';
  if (tags.natural === 'peak' || tags.natural === 'volcano' || tags.natural === 'cliff' || tags.natural === 'ridge' || tags.natural === 'saddle') return 'mountain';
  if (tags.waterway === 'waterfall' || tags.waterway === 'river' || tags.natural === 'water' || tags.natural === 'beach' || tags.water) return 'water';
  return 'landmark';
}

function classifyTitleHeuristic(title = '') {
  const t = title.toLowerCase();
  if (/(viewpoint|overlook|lookout|scenic|observatory)/.test(t)) return 'viewpoint';
  if (/(mountain|peak|hill|ridge|summit|pass|valley|cliff|mount |mt\.)/.test(t)) return 'mountain';
  if (/(river|lake|pond|waterfall|falls|reservoir|dam|lagoon|bay|beach|coast|island|ghat)/.test(t)) return 'water';
  return 'landmark';
}

/**
 * Fetches nearby scenic photography spots using OpenStreetMap Overpass API,
 * falling back to Wikipedia Geosearch if Overpass is unavailable or empty.
 * Strictly excludes transit hubs (metro/bus/train stations), city names,
 * and non-scenic government buildings.
 */
export async function fetchNearbyScenicSpots(lat, lon, radiusKm = 20, locationName = '') {
  const radiusM = Math.round(radiusKm * 1000);
  const query = `
    [out:json][timeout:10];
    (
      node["tourism"="viewpoint"]["name"](around:${radiusM},${lat},${lon});
      node["natural"~"peak|volcano|cliff|saddle|beach"]["name"](around:${radiusM},${lat},${lon});
      node["waterway"="waterfall"]["name"](around:${radiusM},${lat},${lon});
      way["natural"="water"]["water"~"lake|pond|reservoir|lagoon"]["name"](around:${radiusM},${lat},${lon});
      way["waterway"="river"]["name"](around:${radiusM},${lat},${lon});
      node["historic"~"castle|monument|ruins|fort|palace|memorial"]["name"](around:${radiusM},${lat},${lon});
      way["historic"~"castle|monument|ruins|fort|palace|memorial"]["name"](around:${radiusM},${lat},${lon});
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
        if (!isScenicPhotoSpot(name, el.tags, locationName)) continue;

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

  // Fallback: Wikipedia Geosearch API (CORS-enabled, zero API key), strictly filtered to scenic photo spots
  const wikiRadius = Math.min(10000, radiusM);
  const wikiUrl = `https://en.wikipedia.org/w/api.php?action=query&list=geosearch&gscoord=${lat.toFixed(5)}|${lon.toFixed(5)}&gsradius=${wikiRadius}&gslimit=40&format=json&origin=*`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);
  const res = await fetch(wikiUrl, { signal: controller.signal });
  clearTimeout(timeoutId);

  if (!res.ok) {
    throw new Error('Could not reach scenic spots services.');
  }

  const data = await res.json();
  const list = data?.query?.geosearch || [];
  const spots = list
    .filter(
      (item) =>
        item?.title &&
        isScenicPhotoSpot(item.title, {}, locationName) &&
        SCENIC_TITLE_REGEX.test(item.title)
    )
    .map((item) => {
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
        tagLabel: 'scenic'
      };
    });

  spots.sort((a, b) => a.distanceKm - b.distanceKm);
  return { spots, source: 'Wikipedia' };
}

/**
 * Computes destination (lat, lon) given start point, bearing (deg), and distance (km).
 * Used to draw Sunrise/Sunset azimuth rays on the interactive scouting map.
 */
export function destinationPoint(lat, lon, bearingDeg, distanceKm = 8) {
  const R = 6371;
  const brng = (bearingDeg * Math.PI) / 180;
  const dR = distanceKm / R;
  const lat1 = (lat * Math.PI) / 180;
  const lon1 = (lon * Math.PI) / 180;

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(dR) + Math.cos(lat1) * Math.sin(dR) * Math.cos(brng)
  );
  const lon2 =
    lon1 +
    Math.atan2(
      Math.sin(brng) * Math.sin(dR) * Math.cos(lat1),
      Math.cos(dR) - Math.sin(lat1) * Math.sin(lat2)
    );

  return [
    (lat2 * 180) / Math.PI,
    (((lon2 * 180) / Math.PI + 540) % 360) - 180
  ];
}

/**
 * Fetches a real photo thumbnail for a scenic spot using Wikipedia PageImages
 * and falls back to Wikimedia Commons Geosearch (zero API keys, CORS-enabled).
 */
export async function fetchSpotPhoto(spot) {
  if (!spot) return null;

  // 1. Try Wikipedia PageImages by title
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);
    const wpUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&pithumbsize=640&redirects=1&titles=${encodeURIComponent(spot.name)}&format=json&origin=*`;
    const res = await fetch(wpUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const pages = Object.values(data?.query?.pages || {});
      const thumb = pages.find((p) => p?.thumbnail?.source)?.thumbnail?.source;
      if (thumb) return thumb;
    }
  } catch {}

  // 2. Fallback: Wikimedia Commons Geosearch around spot coordinates
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const cmUrl = `https://commons.wikimedia.org/w/api.php?action=query&generator=geosearch&ggscoord=${spot.lat.toFixed(5)}|${spot.lon.toFixed(5)}&ggsradius=1500&ggsnamespace=6&ggslimit=5&prop=imageinfo&iiprop=url&iiurlwidth=640&format=json&origin=*`;
    const res = await fetch(cmUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const pages = Object.values(data?.query?.pages || {});
      for (const p of pages) {
        const info = p?.imageinfo?.[0];
        const url = info?.thumburl || info?.url;
        if (url && /\.(jpe?g|png|webp)(\?|$)/i.test(url)) {
          return url;
        }
      }
    }
  } catch {}

  return null;
}
