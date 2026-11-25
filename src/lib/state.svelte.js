import {
  APERTURES,
  SHUTTERS,
  ISOS,
  DEFAULT_CAMERAS,
  DEFAULT_LENSES,
  BRAND_LENS_IDS,
  BRAND_CAMERA_MODES,
  CAMERA_CONTROL_GUIDE,
  PRESET_LOCATIONS,
  getCameraBrandKey
} from './constants.js';
import {
  calculateSolarData,
  getLightPhase,
  classifyLightDirection,
  decodeWMOWeather,
  getTimezoneOffsetHours,
  formatDecimalHour
} from './solar.js';
import { calculateLunarData } from './moon.js';
import {
  getHandheldMinShutterIdx,
  getAstro500RuleShutterIdx,
  computeSettingsEV100,
  recommendExposure
} from './exposure.js';
import {
  computeHyperfocal,
  computeDof,
  distanceToBarPercent
} from './dof.js';
import { fetchNearbyScenicSpots, fetchSpotPhoto } from './spots.js';

// Local storage helpers
function getSaved(key, fallback) {
  try {
    const val = localStorage.getItem(key);
    return val !== null ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
}

function saveLocal(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {}
}

function getRawSaved(key, fallback) {
  try {
    return localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
}

function saveRawLocal(key, val) {
  try {
    localStorage.setItem(key, val);
  } catch {}
}

class AppState {
  // Theme & Toasts
  theme = $state(getRawSaved('luminary_theme', 'dark'));
  toasts = $state([]);

  // Location & Time
  location = $state({
    name: 'New Delhi, India',
    lat: 28.6139,
    lon: 77.2090,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata'
  });
  timeOffsetHours = $state(0);
  dayOffset = $state(0);
  forcedSunAlt = $state(null);
  liveWallClock = $state('--:--:--');

  // Weather & Rain Telemetry
  rawWeatherData = $state(null);
  weather = $state({
    cloudCover: 18,
    tempC: 24,
    uvIndex: 2,
    description: 'Mostly Clear',
    precipitationMm: 0,
    precipitationProb: 0,
    isRain: false,
    isFallback: false
  });

  // Device Sensors & Radar
  orientation = $state({
    sensorActive: false,
    heading: 0,
    pitch: 0
  });

  // Scene & Gear
  style = $state('landscape');
  camera = $state(getRawSaved('luminary_active_camera', 'sony_a7iv'));
  gear = $state(getRawSaved('luminary_active_lens', 'kit'));
  support = $state('handheld');
  dofSubjectDistance = $state(3.0);

  // Custom Gear
  customCameras = $state(getSaved('luminary_custom_cameras', {}));
  customLenses = $state(getSaved('luminary_custom_lenses', {}));
  customLens = $state({
    type: 'zoom',
    minApertureIdx: 3,
    maxApertureIdx: 10,
    minMm: 24,
    maxMm: 70,
    currentMm: 50
  });

  // Shooting Mode & Locks
  shootingMode = $state(getRawSaved('luminary_shooting_mode', 'A'));
  locked = $state((() => {
    const m = getRawSaved('luminary_shooting_mode', 'A');
    if (m === 'M') return { aperture: true, shutter: true, iso: true };
    if (m === 'A') return { aperture: true, shutter: false, iso: false };
    if (m === 'S') return { aperture: false, shutter: true, iso: false };
    return { aperture: false, shutter: false, iso: false };
  })());

  // Exposure Parameters
  exposure = $state({
    apertureIdx: 7,
    shutterIdx: 12,
    isoIdx: 0,
    wbKelvin: 5600,
    wbLabel: 'Daylight',
    focusMode: 'AF-S / Single',
    metering: '0.0 EV • Matrix',
    filter: 'None',
    filterTip: {
      recommended: false,
      text: 'No optical filter required for this EV/subject combination; keep bare glass for maximum light transmission.'
    },
    targetEV: 12.0,
    manualOverride: false
  });

  // Journal
  journal = $state(getSaved('luminary_shot_journal', []));
  journalStyleFilter = $state('all');
  journalSearchQuery = $state('');

  // Modals & Drawers
  isCameraModalOpen = $state(false);
  isCameraDialModalOpen = $state(false);
  isShotJournalModalOpen = $state(false);
  isCameraSetupOpen = $state(false);
  camGuideVisible = $state({
    aperture: false,
    shutter: false,
    iso: false
  });

  // City Search
  citySearchResults = $state([]);
  isCitySearching = $state(false);

  // Nearby Scenic Spots Finder
  isSpotsModalOpen = $state(false);
  nearbySpots = $state([]);
  nearbySpotsLoading = $state(false);
  nearbySpotsError = $state('');
  nearbySpotsSource = $state('');
  nearbySpotsRadiusKm = $state(20);
  nearbySpotsFilter = $state('all');
  topSpotPhoto = $state(null);
  topSpotPhotoLoading = $state(false);
  spotPhotos = $state({});
  lastSpotsKey = '';

  // Derived: Active Camera Object
  activeCamera = $derived.by(() => {
    if (this.customCameras && this.customCameras[this.camera]) {
      return this.customCameras[this.camera];
    }
    return DEFAULT_CAMERAS[this.camera] || DEFAULT_CAMERAS.sony_a7iv;
  });

  // Derived: Camera Brand Key
  brandKey = $derived.by(() => {
    return getCameraBrandKey(this.activeCamera);
  });

  // Derived: Brand Modes
  brandModes = $derived.by(() => {
    return BRAND_CAMERA_MODES[this.brandKey] || BRAND_CAMERA_MODES.sony;
  });

  // Derived: Active Mode Object
  activeModeObj = $derived.by(() => {
    return (
      this.brandModes.modes.find((m) => m.id === this.shootingMode) ||
      this.brandModes.modes[1]
    );
  });

  // Derived: Active Gear Config
  activeGearConfig = $derived.by(() => {
    const cam = this.activeCamera;
    const cropFactor = cam.cropFactor || 1.0;

    if (this.gear === 'custom' || String(this.gear).startsWith('custom_lens_')) {
      const c = this.customLenses[this.gear] || this.customLens;
      const focalMm = c.type === 'prime' ? c.minMm : (c.currentMm || c.minMm);
      const minF = APERTURES[c.minApertureIdx];
      const maxF = APERTURES[c.maxApertureIdx];
      const apStr = minF === maxF ? `f/${minF}` : `f/${minF}–f/${maxF}`;
      const rangeStr = c.type === 'prime' ? `${c.minMm}mm` : `${c.minMm}–${c.maxMm}mm`;
      const label = c.label || `Custom ${c.type === 'prime' ? 'Prime' : 'Zoom'} (${rangeStr} ${apStr})`;

      return {
        minApertureIdx: c.minApertureIdx,
        maxApertureIdx: c.maxApertureIdx,
        fixedAperture: c.minApertureIdx === c.maxApertureIdx,
        focalLengthMm: focalMm,
        cropFactor,
        effectiveFocalLengthMm: Math.round(focalMm * cropFactor),
        label,
        cameraName: cam.name
      };
    }

    const lens = this.customLenses[this.gear] || DEFAULT_LENSES[this.gear] || DEFAULT_LENSES.kit;
    return {
      minApertureIdx: lens.minApertureIdx,
      maxApertureIdx: lens.maxApertureIdx,
      fixedAperture: !!lens.fixedAperture,
      focalLengthMm: lens.focalLengthMm,
      cropFactor,
      effectiveFocalLengthMm: Math.round(lens.focalLengthMm * cropFactor),
      label: lens.label,
      cameraName: cam.name
    };
  });

  // Derived: Effective Date & Solar Data
  effectiveDate = $derived.by(() => {
    const d = new Date();
    if (this.dayOffset) {
      d.setDate(d.getDate() + this.dayOffset);
    }
    d.setMinutes(d.getMinutes() + Math.round(this.timeOffsetHours * 60));
    return d;
  });

  isTomorrow = $derived(this.dayOffset === 1);

  formattedDate = $derived.by(() => {
    const d = this.effectiveDate;
    const dateStr = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    if (this.dayOffset === 0) return `Today • ${dateStr}`;
    if (this.dayOffset === 1) return `Tomorrow (+1d) • ${dateStr}`;
    return dateStr;
  });

  solarData = $derived.by(() => {
    return calculateSolarData(
      this.location.lat,
      this.location.lon,
      this.effectiveDate,
      this.forcedSunAlt,
      this.location.timezone
    );
  });

  // Derived: Light Phase
  lightPhase = $derived.by(() => {
    return getLightPhase(this.solarData.altitude, this.weather.cloudCover);
  });

  // Derived: Golden Hour & Sunrise/Sunset Quality Score ("Afterglow Forecast")
  skyQuality = $derived.by(() => {
    const scoreWindow = (cTotal, cLow, cMid, cHigh, pProb) => {
      if (pProb >= 45) {
        return {
          score: Math.max(15, 42 - Math.round(pProb * 0.3)),
          label: 'Rainy / Muted',
          badgeClass: 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30',
          detail: 'Rain & thick clouds likely mute horizon light.'
        };
      }
      if (cLow > 70 || cTotal > 85) {
        return {
          score: 32,
          label: 'Flat Overcast',
          badgeClass: 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30',
          detail: 'Dense low clouds may block direct horizon glow.'
        };
      }
      if (cTotal < 15) {
        return {
          score: 72,
          label: 'Clean Clear',
          badgeClass: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
          detail: 'Crisp warm gradient with minimal cloud texture.'
        };
      }
      const midHigh = Math.min(100, cMid * 0.65 + cHigh * 0.75);
      if (midHigh >= 25 && midHigh <= 75 && cLow < 45) {
        return {
          score: Math.min(96, Math.round(78 + (midHigh / 100) * 18)),
          label: 'Vivid Afterglow',
          badgeClass: 'bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-500/40',
          detail: 'Ideal mid/high clouds to catch deep red & gold.'
        };
      }
      return {
        score: Math.max(40, Math.round(64 - cLow * 0.2)),
        label: 'Moderate Light',
        badgeClass: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
        detail: 'Balanced sky with mixed cloud cover.'
      };
    };

    const hourly = this.rawWeatherData?.hourly;
    const solar = this.solarData;
    const dayBase = this.dayOffset * 24;

    if (hourly?.cloud_cover?.length >= dayBase + 24) {
      const srIdx = Math.min(hourly.cloud_cover.length - 1, Math.max(0, dayBase + Math.round(solar.sunriseLocal)));
      const ssIdx = Math.min(hourly.cloud_cover.length - 1, Math.max(0, dayBase + Math.round(solar.sunsetLocal)));
      return {
        sunrise: scoreWindow(
          hourly.cloud_cover[srIdx] ?? this.weather.cloudCover,
          hourly.cloud_cover_low?.[srIdx] ?? 20,
          hourly.cloud_cover_mid?.[srIdx] ?? 20,
          hourly.cloud_cover_high?.[srIdx] ?? 20,
          hourly.precipitation_probability?.[srIdx] ?? this.weather.precipitationProb ?? 0
        ),
        sunset: scoreWindow(
          hourly.cloud_cover[ssIdx] ?? this.weather.cloudCover,
          hourly.cloud_cover_low?.[ssIdx] ?? 20,
          hourly.cloud_cover_mid?.[ssIdx] ?? 20,
          hourly.cloud_cover_high?.[ssIdx] ?? 20,
          hourly.precipitation_probability?.[ssIdx] ?? this.weather.precipitationProb ?? 0
        )
      };
    }

    const fallback = scoreWindow(
      this.weather.cloudCover,
      Math.round(this.weather.cloudCover * 0.5),
      Math.round(this.weather.cloudCover * 0.35),
      Math.round(this.weather.cloudCover * 0.25),
      this.weather.precipitationProb ?? (this.weather.isRain ? 70 : 0)
    );
    return { sunrise: fallback, sunset: fallback };
  });

  // Derived: 24-Hour Hourly Sky & Rain Timeline for the selected day
  hourlyTimeline = $derived.by(() => {
    const hourly = this.rawWeatherData?.hourly;
    const solar = this.solarData;
    const dayBase = this.dayOffset * 24;
    const hasHourly = hourly?.cloud_cover?.length >= dayBase + 24;
    const activeHour = Math.floor((solar.localHour + 24) % 24);

    const hours = [];
    for (let h = 0; h < 24; h++) {
      const idx = dayBase + h;
      const cloudCover = hasHourly
        ? Math.round(hourly.cloud_cover[idx] ?? this.weather.cloudCover)
        : Math.round(this.weather.cloudCover);
      const precipProb = hasHourly
        ? Math.round(hourly.precipitation_probability?.[idx] ?? this.weather.precipitationProb ?? 0)
        : Math.round(this.weather.precipitationProb ?? (this.weather.isRain ? 70 : 0));

      const nearSunrise = Math.abs(h - solar.sunriseLocal) <= 1.0;
      const nearSunset = Math.abs(h - solar.sunsetLocal) <= 1.0;

      hours.push({
        hour: h,
        shortLabel: String(h).padStart(2, '0'),
        label: `${String(h).padStart(2, '0')}:00`,
        cloudCover,
        precipProb,
        isGoldenOrBlue: nearSunrise || nearSunset,
        isActive: activeHour === h,
        isOfflineFallback: !hasHourly
      });
    }
    return hours;
  });

  // Derived: Lunar Phase, Moonrise/Moonset & Milky Way Dark-Sky Window
  lunarData = $derived.by(() => {
    return calculateLunarData(
      this.location.lat,
      this.location.lon,
      this.effectiveDate,
      this.location.timezone,
      this.solarData
    );
  });

  // Derived: Light Diagnosis
  lightDiagnosis = $derived.by(() => {
    return classifyLightDirection(
      this.orientation.heading,
      this.solarData.azimuth,
      this.solarData.altitude,
      this.orientation.pitch
    );
  });

  // Derived: Optical Depth of Field (DoF)
  dofData = $derived.by(() => {
    const cam = this.activeCamera;
    const crop = cam.cropFactor || 1.0;
    const coc = 0.029 / crop;
    const focalMm = this.activeGearConfig.focalLengthMm || 50;
    const aperture = APERTURES[this.exposure.apertureIdx] || 8.0;
    const s = Math.max(0.3, this.dofSubjectDistance || 3.0);

    const dof = computeDof(focalMm, aperture, coc, s);

    const leftPct = distanceToBarPercent(dof.Dn);
    const rightPct = dof.isHyperfocalOrBeyond ? 100 : distanceToBarPercent(dof.Df);
    const pinPct = distanceToBarPercent(s);
    const widthPct = Math.max(2, Math.min(100 - leftPct, rightPct - leftPct));

    return {
      ...dof,
      leftPct,
      rightPct,
      pinPct,
      widthPct
    };
  });

  // Derived: Exposure Meter
  exposureMeter = $derived.by(() => {
    const actualEV = computeSettingsEV100(
      this.exposure.apertureIdx,
      this.exposure.shutterIdx,
      this.exposure.isoIdx
    );
    const evDiff = this.exposure.targetEV - actualEV;
    const clampedDiff = Math.max(-3, Math.min(3, evDiff));
    const pct = 50 + (clampedDiff / 3) * 46;

    let status = 'balanced';
    let statusText = `Balanced (${evDiff >= 0 ? '+' : ''}${evDiff.toFixed(1)} EV)`;
    if (Math.abs(evDiff) > 0.45) {
      if (evDiff > 0.45) {
        status = 'over';
        statusText = `Overexposed (+${evDiff.toFixed(1)} EV)`;
      } else {
        status = 'under';
        statusText = `Underexposed (${evDiff.toFixed(1)} EV)`;
      }
    }

    return {
      actualEV,
      evDiff,
      clampedDiff,
      pct,
      status,
      statusText
    };
  });

  // Derived: Contextual Warnings
  warnings = $derived.by(() => {
    const list = [];
    const gear = this.activeGearConfig;
    const shutterObj = SHUTTERS[this.exposure.shutterIdx];
    const safeHandheldSec = 1 / Math.max(55, gear.effectiveFocalLengthMm || 50);

    if (this.style === 'astro') {
      if (this.solarData.altitude >= -12) {
        list.push(
          `Sun is at ${(Number(this.solarData.altitude) || 0).toFixed(0)}° (${this.lightPhase.name}). Stars require Astronomical Night (sun below -12°) — tap +1h Time Shift or Tokyo Night to preview astro settings.`
        );
      }
      if (this.support === 'handheld') {
        list.push('Astrophotography requires a sturdy Tripod (plus a 2s self-timer) to keep stars sharp.');
      }
      if (this.weather.cloudCover > 40) {
        list.push(`Cloud cover is ${this.weather.cloudCover}% — clear skies (<20%) are best for stars.`);
      }
    } else if (this.support === 'handheld' && shutterObj.sec > safeHandheldSec) {
      const cropNote = gear.cropFactor !== 1.0 ? ` (${gear.effectiveFocalLengthMm}mm eq on ${gear.cameraName})` : '';
      list.push(
        `Shutter (${shutterObj.label}) is slow for handheld at ${gear.focalLengthMm}mm${cropNote}—brace your elbows, switch Hold to Tripod, or raise ISO.`
      );
    }

    if (this.exposureMeter.evDiff > 1.2) {
      list.push(`Too bright (+${this.exposureMeter.evDiff.toFixed(1)} EV). Attach an ND filter, use a faster shutter, or increase f-number.`);
    }
    if (this.exposureMeter.evDiff < -1.2) {
      list.push(`Too dark (${this.exposureMeter.evDiff.toFixed(1)} EV). Lower f-number, use a slower shutter on a tripod, or raise ISO.`);
    }

    // Rain & Weather-Sealing Alert
    if (this.weather.isRain || (this.weather.precipitationProb && this.weather.precipitationProb >= 35) || (this.weather.precipitationMm && this.weather.precipitationMm > 0.4)) {
      const probStr = this.weather.precipitationProb ? ` (${this.weather.precipitationProb}% rain probability${this.weather.precipitationMm ? ', ~' + this.weather.precipitationMm.toFixed(1) + 'mm' : ''})` : '';
      const dayPrefix = this.dayOffset === 1 ? 'Tomorrow: ' : '';
      list.push(
        `🌧️ ${dayPrefix}Rain / Precipitation Expected${probStr}. Ensure camera & lens have environmental weather-sealing gaskets or use a protective rain cover. Equip a clear/UV filter to shield front lens glass from moisture. Shutter tips: use ≥1/500s to freeze raindrops, or 1/60s–1/125s for soft streaks.`
      );
    }

    return list;
  });

  // =========================================================================
  // ACTIONS / METHODS
  // =========================================================================

  applyTheme(theme) {
    this.theme = theme;
    saveRawLocal('luminary_theme', theme);
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', theme === 'dark');
      const metaTheme = document.querySelector('meta[name="theme-color"]');
      if (metaTheme) {
        metaTheme.setAttribute('content', theme === 'dark' ? '#111622' : '#ffffff');
      }
    }
  }

  toggleTheme() {
    this.triggerHaptic('click');
    const next = this.theme === 'dark' ? 'light' : 'dark';
    this.applyTheme(next);
    this.showToast(next === 'dark' ? 'Dark Mode active' : 'Daylight Mode active');
  }

  triggerHaptic(type = 'click') {
    if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return;
    try {
      if (type === 'click') navigator.vibrate(12);
      else if (type === 'tick') navigator.vibrate(8);
      else if (type === 'lock') navigator.vibrate([15, 30, 15]);
      else if (type === 'unlock') navigator.vibrate(20);
      else if (type === 'snap') navigator.vibrate([12, 25, 20]);
    } catch {}
  }

  showToast(message) {
    const id = Date.now() + Math.random();
    this.toasts = [...this.toasts, { id, message }];
    setTimeout(() => {
      this.toasts = this.toasts.filter((t) => t.id !== id);
    }, 3000);
  }

  recalculate() {
    const solar = this.solarData;
    const phase = this.lightPhase;

    // Dark-sky astrophotography sits far darker (~EV -5) than urban night (~EV 2)
    const effectiveEV = (this.style === 'astro' && solar.altitude < -12) ? -5.0 : phase.baseEV;
    this.exposure.targetEV = effectiveEV;
    this.exposure.wbKelvin = (this.style === 'astro' && solar.altitude < -12) ? 4000 : phase.wbKelvin;
    this.exposure.wbLabel = (this.style === 'astro' && solar.altitude < -12) ? 'Astro Neutral' : phase.wbLabel;

    const anyLocked = this.locked.aperture || this.locked.shutter || this.locked.iso;
    if (!this.exposure.manualOverride || anyLocked) {
      const rec = recommendExposure(
        effectiveEV,
        this.activeGearConfig,
        this.style,
        this.support,
        this.locked,
        this.exposure
      );
      this.exposure.apertureIdx = rec.apertureIdx;
      this.exposure.shutterIdx = rec.shutterIdx;
      this.exposure.isoIdx = rec.isoIdx;

      // Update focus mode & optional filter recommendation for the active scene/EV
      if (this.style === 'action' || this.style === 'street') {
        this.exposure.focusMode = 'AF-C / Continuous';
      } else if (this.style === 'portrait') {
        this.exposure.focusMode = 'AF-S / Eye-AF';
      } else if (this.style === 'astro') {
        this.exposure.focusMode = 'MF (Infinity)';
      } else if (this.style === 'longexp' || this.style === 'landscape') {
        this.exposure.focusMode = 'AF-S / Hyperfocal';
      } else {
        this.exposure.focusMode = 'AF-S / Single';
      }

      if (this.style === 'longexp' && effectiveEV >= 9) {
        this.exposure.filter = 'ND64 / ND1000';
        this.exposure.filterTip = {
          recommended: true,
          text: 'Use a 6-stop to 10-stop ND filter in daylight to achieve smooth, silky water or cloud motion.'
        };
      } else if (this.style === 'landscape' && effectiveEV >= 11) {
        this.exposure.filter = 'CPL (Polarizer)';
        this.exposure.filterTip = {
          recommended: true,
          text: 'A Circular Polarizer cuts glare on water and foliage while deepening sky contrast.'
        };
      } else if (this.style === 'portrait' && effectiveEV >= 13) {
        this.exposure.filter = 'ND8 (3-Stop)';
        this.exposure.filterTip = {
          recommended: true,
          text: 'Bright sun: a 3-stop ND filter lets you shoot wide open without hitting max shutter limits.'
        };
      } else {
        this.exposure.filter = 'None';
        this.exposure.filterTip = {
          recommended: false,
          text: 'No optical filter required for this EV/subject combination; keep bare glass for maximum light transmission.'
        };
      }
    }

    // Update metering string based on diagnosis
    const diagnosis = this.lightDiagnosis;
    const evCompStr = diagnosis.evComp === 0 ? '0.0 EV' : `${diagnosis.evComp > 0 ? '+' : ''}${diagnosis.evComp.toFixed(1)} EV`;
    const meterMode = (this.style === 'portrait' && diagnosis.evComp > 0) ? 'Spot' : 'Matrix';
    this.exposure.metering = `${evCompStr} • ${meterMode}`;
  }

  setStyle(style) {
    this.triggerHaptic('click');
    this.style = style;
    this.exposure.manualOverride = false;

    const styleTitles = {
      landscape: 'Scenic / Landscape',
      portrait: 'Portrait / Shallow Focus',
      street: 'Street / Documentary',
      action: 'Action / Fast Shutter',
      night: 'Night / Low Light',
      astro: 'Astro / Star Field',
      longexp: 'Silk / Long Exposure'
    };
    this.showToast(`Scene: ${styleTitles[style] || style}`);
    this.recalculate();
  }

  setShootingMode(modeId, skipToast = false) {
    this.triggerHaptic('click');
    this.shootingMode = modeId;
    saveRawLocal('luminary_shooting_mode', modeId);

    const modeObj = this.brandModes.modes.find((m) => m.id === modeId) || this.brandModes.modes[1];

    if (modeId === 'M') {
      this.locked = { aperture: true, shutter: true, iso: true };
      this.exposure.manualOverride = true;
      if (!skipToast) this.showToast(`Mode: Manual (${modeObj.label}) — Full manual control`);
    } else if (modeId === 'A') {
      this.locked = { aperture: true, shutter: false, iso: false };
      if (!skipToast) this.showToast(`Mode: ${modeObj.fullName} — Aperture Manual, Shutter Auto`);
    } else if (modeId === 'S') {
      this.locked = { aperture: false, shutter: true, iso: false };
      if (!skipToast) this.showToast(`Mode: ${modeObj.fullName} — Shutter Manual, Aperture Auto`);
    } else if (modeId === 'P') {
      this.locked = { aperture: false, shutter: false, iso: false };
      if (!skipToast) this.showToast(`Mode: ${modeObj.fullName} — Smart reciprocal pairing`);
    } else if (modeId === 'AUTO') {
      this.locked = { aperture: false, shutter: false, iso: false };
      this.exposure.manualOverride = false;
      if (!skipToast) this.showToast(`Mode: ${modeObj.fullName} — Full auto-exposure`);
    }

    this.recalculate();
  }

  syncShootingModeFromLocks() {
    const l = this.locked;
    if (l.aperture && l.shutter) {
      this.shootingMode = 'M';
    } else if (l.aperture && !l.shutter) {
      this.shootingMode = 'A';
    } else if (!l.aperture && l.shutter) {
      this.shootingMode = 'S';
    } else {
      if (this.shootingMode !== 'AUTO') {
        this.shootingMode = 'P';
      }
    }
    saveRawLocal('luminary_shooting_mode', this.shootingMode);
  }

  setParamMode(param, mode) {
    const wantsManual = mode === 'manual';
    const isCurrentlyManual = !!this.locked[param];
    if (wantsManual === isCurrentlyManual) return;
    this.toggleParamMode(param);
  }

  toggleParamMode(param) {
    const wasManual = !!this.locked[param];
    const nowManual = !wasManual;
    this.locked[param] = nowManual;
    this.triggerHaptic(nowManual ? 'lock' : 'unlock');

    const isCanon = this.brandKey === 'canon';
    const labels = {
      aperture: isCanon ? 'Aperture (Av)' : 'Aperture (A)',
      shutter: isCanon ? 'Shutter (Tv)' : 'Shutter (S)',
      iso: 'ISO'
    };
    this.showToast(`${labels[param] || param}: set to ${nowManual ? 'MANUAL' : 'AUTO'}`);

    if (nowManual) {
      this.exposure.manualOverride = true;
    }
    this.syncShootingModeFromLocks();
    this.recalculate();
  }

  toggleLockAll() {
    const allManual = this.locked.aperture && this.locked.shutter && this.locked.iso;
    const newManual = !allManual;
    this.locked.aperture = newManual;
    this.locked.shutter = newManual;
    this.locked.iso = newManual;
    this.triggerHaptic(newManual ? 'lock' : 'unlock');

    if (newManual) {
      this.exposure.manualOverride = true;
      this.shootingMode = 'M';
      this.showToast('All dials switched to MANUAL (Manual M)');
    } else {
      this.shootingMode = 'P';
      this.showToast('All dials switched to AUTO (Program P)');
    }
    saveRawLocal('luminary_shooting_mode', this.shootingMode);
    this.syncShootingModeFromLocks();
    this.recalculate();
  }

  stepExposure(param, delta) {
    this.triggerHaptic('click');
    const gear = this.activeGearConfig;
    if (param === 'aperture') {
      if (gear.fixedAperture) return;
      const next = Math.max(gear.minApertureIdx, Math.min(gear.maxApertureIdx, this.exposure.apertureIdx + delta));
      this.onManualExposureChange('aperture', next);
    } else if (param === 'shutter') {
      const next = Math.max(0, Math.min(SHUTTERS.length - 1, this.exposure.shutterIdx + delta));
      this.onManualExposureChange('shutter', next);
    } else if (param === 'iso') {
      const next = Math.max(0, Math.min(ISOS.length - 1, this.exposure.isoIdx + delta));
      this.onManualExposureChange('iso', next);
    }
  }

  onManualExposureChange(changedParam, rawVal) {
    this.triggerHaptic('tick');
    const val = parseInt(rawVal, 10);
    const gear = this.activeGearConfig;
    this.exposure.manualOverride = true;

    // Intelligent Mode Shift on manual dial adjustments
    if (this.shootingMode === 'AUTO') {
      const targetMode = changedParam === 'aperture' ? 'A' : (changedParam === 'shutter' ? 'S' : 'M');
      const modeObj = this.brandModes.modes.find((m) => m.id === targetMode);
      this.shootingMode = targetMode;
      if (targetMode === 'A') this.locked = { aperture: true, shutter: false, iso: false };
      else if (targetMode === 'S') this.locked = { aperture: false, shutter: true, iso: false };
      else if (targetMode === 'M') this.locked = { aperture: true, shutter: true, iso: true };
      this.showToast(`Auto shifted: ${modeObj ? modeObj.fullName : targetMode}`);
    } else if (this.shootingMode === 'P') {
      const targetMode = changedParam === 'shutter' ? 'S' : (changedParam === 'iso' ? 'M' : 'A');
      const modeObj = this.brandModes.modes.find((m) => m.id === targetMode);
      this.shootingMode = targetMode;
      if (targetMode === 'A') this.locked = { aperture: true, shutter: false, iso: false };
      else if (targetMode === 'S') this.locked = { aperture: false, shutter: true, iso: false };
      else if (targetMode === 'M') this.locked = { aperture: true, shutter: true, iso: true };
      this.showToast(`Program Shift: ${modeObj ? modeObj.fullName : targetMode}`);
    } else if (this.shootingMode === 'A' && changedParam === 'shutter') {
      const sMode = this.brandModes.modes.find((m) => m.id === 'S');
      this.shootingMode = 'S';
      this.locked = { aperture: false, shutter: true, iso: false };
      this.showToast(`Shifted to ${sMode ? sMode.fullName : 'Shutter Priority'}`);
    } else if (this.shootingMode === 'S' && changedParam === 'aperture') {
      const aMode = this.brandModes.modes.find((m) => m.id === 'A');
      this.shootingMode = 'A';
      this.locked = { aperture: true, shutter: false, iso: false };
      this.showToast(`Shifted to ${aMode ? aMode.fullName : 'Aperture Priority'}`);
    } else if (changedParam === 'iso' && !this.locked.iso) {
      this.locked.iso = true;
    }

    const locks = this.locked;

    if (changedParam === 'aperture') {
      this.exposure.apertureIdx = Math.max(gear.minApertureIdx, Math.min(gear.maxApertureIdx, val));
      const N = APERTURES[this.exposure.apertureIdx];
      if (!locks.shutter) {
        const iso = ISOS[this.exposure.isoIdx];
        const neededSec = (N * N) / (Math.pow(2, this.exposure.targetEV) * (iso / 100));
        let bestS = 0, minDiff = Infinity;
        SHUTTERS.forEach((s, idx) => {
          const d = Math.abs(Math.log2(s.sec) - Math.log2(neededSec));
          if (d < minDiff) { minDiff = d; bestS = idx; }
        });
        this.exposure.shutterIdx = bestS;
      } else if (!locks.iso) {
        const t = SHUTTERS[this.exposure.shutterIdx].sec;
        const neededIsoStops = Math.log2((N * N) / t) - this.exposure.targetEV;
        this.exposure.isoIdx = Math.max(0, Math.min(ISOS.length - 1, Math.round(neededIsoStops)));
      }
    } else if (changedParam === 'shutter') {
      this.exposure.shutterIdx = val;
      const N = APERTURES[this.exposure.apertureIdx];
      const t = SHUTTERS[this.exposure.shutterIdx].sec;
      if (!locks.iso) {
        const neededIsoStops = Math.log2((N * N) / t) - this.exposure.targetEV;
        this.exposure.isoIdx = Math.max(0, Math.min(ISOS.length - 1, Math.round(neededIsoStops)));
      } else if (!locks.aperture) {
        const iso = ISOS[this.exposure.isoIdx];
        const neededN2 = t * Math.pow(2, this.exposure.targetEV) * (iso / 100);
        const neededN = Math.sqrt(Math.max(0.5, neededN2));
        let closestAp = gear.minApertureIdx, minDiff = Infinity;
        for (let i = gear.minApertureIdx; i <= gear.maxApertureIdx; i++) {
          const d = Math.abs(APERTURES[i] - neededN);
          if (d < minDiff) { minDiff = d; closestAp = i; }
        }
        this.exposure.apertureIdx = closestAp;
      }
    } else if (changedParam === 'iso') {
      this.exposure.isoIdx = val;
      const N = APERTURES[this.exposure.apertureIdx];
      const iso = ISOS[this.exposure.isoIdx];
      if (!locks.shutter) {
        const neededSec = (N * N) / (Math.pow(2, this.exposure.targetEV) * (iso / 100));
        let bestS = 0, minDiff = Infinity;
        SHUTTERS.forEach((s, idx) => {
          const d = Math.abs(Math.log2(s.sec) - Math.log2(neededSec));
          if (d < minDiff) { minDiff = d; bestS = idx; }
        });
        this.exposure.shutterIdx = bestS;
      } else if (!locks.aperture) {
        const t = SHUTTERS[this.exposure.shutterIdx].sec;
        const neededN2 = t * Math.pow(2, this.exposure.targetEV) * (iso / 100);
        const neededN = Math.sqrt(Math.max(0.5, neededN2));
        let closestAp = gear.minApertureIdx, minDiff = Infinity;
        for (let i = gear.minApertureIdx; i <= gear.maxApertureIdx; i++) {
          const d = Math.abs(APERTURES[i] - neededN);
          if (d < minDiff) { minDiff = d; closestAp = i; }
        }
        this.exposure.apertureIdx = closestAp;
      }
    }

    saveRawLocal('luminary_shooting_mode', this.shootingMode);
    this.recalculate();
  }

  resetExposureOverrides() {
    this.triggerHaptic('click');
    this.exposure.manualOverride = false;
    this.setShootingMode('A', true);
    this.showToast('Exposure reset to Aperture Priority auto-balance.');
  }

  setCamera(val) {
    this.camera = val;
    saveRawLocal('luminary_active_camera', val);

    // If active lens is brand-specific to a different brand, switch to the new brand's primary lens
    const activeLensObj = DEFAULT_LENSES[this.gear];
    const nextBrand = this.activeCamera?.brand;
    if (activeLensObj?.brand && nextBrand && activeLensObj.brand !== nextBrand) {
      const nextBrandLenses = BRAND_LENS_IDS[nextBrand];
      if (nextBrandLenses?.length > 0) {
        this.gear = nextBrandLenses[0];
        saveRawLocal('luminary_active_lens', this.gear);
      }
    }

    this.recalculate();
    this.showToast(`Selected: ${this.activeCamera.name}`);
  }

  setGear(val) {
    this.triggerHaptic('click');
    this.gear = val;
    if (val !== 'custom') {
      saveRawLocal('luminary_active_lens', val);
    }
    this.exposure.manualOverride = false;
    this.recalculate();
  }

  setSupport(val) {
    this.support = val;
    this.exposure.manualOverride = false;
    this.recalculate();
  }

  setSubjectDistance(dist) {
    this.dofSubjectDistance = Math.max(0.3, Math.min(30, parseFloat(dist) || 3.0));
    this.triggerHaptic('tick');
  }

  stepSubjectDistance(delta) {
    const current = this.dofSubjectDistance || 3.0;
    const next = Math.max(0.3, Math.min(30, Math.round((current + delta) * 10) / 10));
    this.setSubjectDistance(next);
    this.triggerHaptic('click');
  }

  snapToHyperfocal() {
    const H = this.dofData.H;
    this.dofSubjectDistance = Math.max(0.3, Math.min(30, Math.round(H * 10) / 10));
    this.triggerHaptic('snap');
    this.showToast(`Snapped to Hyperfocal distance: ${H.toFixed(1)}m`);
  }

  shiftTime(hours) {
    this.triggerHaptic('click');
    this.forcedSunAlt = null;
    this.timeOffsetHours = Math.max(-12, Math.min(12, this.timeOffsetHours + hours));
    this.exposure.manualOverride = false;
    this.recalculate();
  }

  resetTime() {
    this.triggerHaptic('click');
    this.forcedSunAlt = null;
    this.timeOffsetHours = 0;
    this.dayOffset = 0;
    this.applyWeatherForDayOffset();
    this.exposure.manualOverride = false;
    this.recalculate();
  }

  setDayOffset(days) {
    this.triggerHaptic('click');
    this.dayOffset = days;
    this.applyWeatherForDayOffset();
    this.recalculate();
    this.showToast(days === 1 ? '📅 Switched to Tomorrow (+1 Day Planning)' : '📅 Switched to Today');
  }

  toggleDayOffset() {
    this.setDayOffset(this.dayOffset === 0 ? 1 : 0);
  }

  getCurrentLocalHour() {
    const now = new Date();
    const tzOffset = getTimezoneOffsetHours(now, this.location.timezone, this.location.lon);
    return ((now.getUTCHours() + now.getUTCMinutes() / 60 + now.getUTCSeconds() / 3600 + tzOffset) % 24 + 24) % 24;
  }

  jumpToSolarPhase(phase) {
    this.triggerHaptic('click');
    const curHour = this.getCurrentLocalHour();
    const solar = this.solarData;
    let targetHour = 12;
    let label = 'Midday';

    switch (phase) {
      case 'sunrise':
        targetHour = solar.sunriseLocal;
        label = `Sunrise (${formatDecimalHour(solar.sunriseLocal)})`;
        break;
      case 'sunset':
        targetHour = solar.sunsetLocal;
        label = `Sunset (${formatDecimalHour(solar.sunsetLocal)})`;
        break;
      case 'golden':
      case 'golden_pm':
        targetHour = (solar.sunsetLocal - 0.75 + 24) % 24;
        label = `Golden Hour (${formatDecimalHour(targetHour)})`;
        break;
      case 'golden_am':
        targetHour = (solar.sunriseLocal + 0.35) % 24;
        label = `Dawn Golden Hour (${formatDecimalHour(targetHour)})`;
        break;
      case 'blue':
      case 'blue_pm':
        targetHour = solar.bluePM;
        label = `Blue Hour (${formatDecimalHour(solar.bluePM)})`;
        break;
      case 'blue_am':
        targetHour = solar.blueAM;
        label = `Dawn Blue Hour (${formatDecimalHour(solar.blueAM)})`;
        break;
      case 'arc':
      case 'now':
        this.resetTime();
        this.showToast('☀️ Realigned with Live Solar Arc & Clock');
        const arcEl = document.getElementById('solar-ephemeris-card');
        if (arcEl) arcEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        return;
      default:
        targetHour = 12;
        label = 'Noon';
    }

    const diff = targetHour - curHour;
    this.timeOffsetHours = Math.round(diff * 100) / 100;
    this.forcedSunAlt = null;
    this.exposure.manualOverride = false;
    this.recalculate();
    const dayLabel = this.dayOffset === 1 ? 'Tomorrow ' : '';
    this.showToast(`✨ Snapped to ${dayLabel}${label}`);
  }

  jumpToHour(targetHour) {
    this.triggerHaptic('click');
    const curHour = this.getCurrentLocalHour();
    const diff = targetHour - curHour;
    this.timeOffsetHours = Math.round(diff * 100) / 100;
    this.forcedSunAlt = null;
    this.exposure.manualOverride = false;
    this.recalculate();
    const dayLabel = this.dayOffset === 1 ? 'Tomorrow ' : '';
    this.showToast(`🕒 Previewing ${dayLabel}${String(targetHour).padStart(2, '0')}:00`);
  }

  setManualHeading(val) {
    this.orientation.heading = parseInt(val, 10) || 0;
  }

  setManualPitch(val) {
    this.orientation.pitch = parseInt(val, 10) || 0;
  }

  async enablePhoneOrientation() {
    if (typeof window === 'undefined' || typeof window.DeviceOrientationEvent === 'undefined') {
      this.showToast('Compass sensors not found. Use the manual aim slider below.');
      return;
    }

    if (typeof window.DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const response = await window.DeviceOrientationEvent.requestPermission();
        if (response === 'granted') {
          this.startOrientationListeners();
          this.showToast('Phone compass & tilt sensors linked!');
        } else {
          this.showToast('Compass permission denied. Use the manual slider.');
        }
      } catch {
        this.showToast('Sensor permission blocked. Use the manual slider.');
      }
    } else {
      this.startOrientationListeners();
      this.showToast('Listening to device compass & tilt sensors...');
    }
  }

  startOrientationListeners() {
    if (this.orientation.sensorActive) return;
    this.orientation.sensorActive = true;

    const handleEvent = (event) => {
      let heading = null;
      if (typeof event.webkitCompassHeading === 'number') {
        heading = event.webkitCompassHeading;
      } else if (typeof event.alpha === 'number') {
        heading = (360 - event.alpha) % 360;
      }
      if (heading !== null && !Number.isNaN(heading)) {
        this.orientation.heading = Math.round(heading);
      }
      if (typeof event.beta === 'number' && !Number.isNaN(event.beta)) {
        this.orientation.pitch = Math.max(-60, Math.min(75, Math.round(event.beta - 90)));
      }
    };

    window.addEventListener('deviceorientationabsolute', handleEvent, true);
    window.addEventListener('deviceorientation', handleEvent, true);
  }

  async fetchWeatherForCoords(lat, lon) {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}&current=temperature_2m,cloud_cover,weather_code,precipitation,rain&hourly=cloud_cover,cloud_cover_low,cloud_cover_mid,cloud_cover_high,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,uv_index_max&forecast_days=2&timezone=auto`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4500);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) throw new Error('Weather API error');
      const data = await res.json();

      if (data.timezone) {
        this.location.timezone = data.timezone;
      }

      this.rawWeatherData = data;
      this.applyWeatherForDayOffset();
    } catch {
      this.rawWeatherData = null;
      this.weather = {
        cloudCover: 22,
        tempC: 21,
        uvIndex: 3,
        description: 'Simulated',
        precipitationMm: 0,
        precipitationProb: 0,
        isRain: false,
        isFallback: true
      };
    }
    this.recalculate();
  }

  applyWeatherForDayOffset() {
    if (!this.rawWeatherData) return;
    const data = this.rawWeatherData;

    if (this.dayOffset === 1 && data.daily) {
      // Tomorrow's forecast (+1 Day Planning)
      const wCode = data.daily.weather_code?.[1] ?? 1;
      const precipMm = Number(data.daily.precipitation_sum?.[1] ?? 0);
      const precipProb = Number(data.daily.precipitation_probability_max?.[1] ?? 0);
      const isRain = precipMm > 0.1 || precipProb >= 35 || (wCode >= 51 && wCode <= 67) || (wCode >= 80 && wCode <= 99);

      let estClouds = 25;
      if (wCode === 0) estClouds = 5;
      else if (wCode <= 2) estClouds = 35;
      else if (wCode === 3) estClouds = 75;
      else if (wCode >= 51) estClouds = 85;

      this.weather = {
        cloudCover: estClouds,
        tempC: Math.round(data.daily.temperature_2m_max?.[1] ?? 22),
        uvIndex: Math.round(data.daily.uv_index_max?.[1] ?? 3),
        description: decodeWMOWeather(wCode),
        precipitationMm: precipMm,
        precipitationProb: precipProb,
        isRain,
        isFallback: false
      };
    } else {
      // Today's forecast (Current / Day 0)
      const cur = data.current;
      const d0 = data.daily;
      const wCode = cur?.weather_code ?? d0?.weather_code?.[0] ?? 1;
      const precipMm = Number(cur?.precipitation ?? cur?.rain ?? d0?.precipitation_sum?.[0] ?? 0);
      const precipProb = Number(d0?.precipitation_probability_max?.[0] ?? (precipMm > 0 ? 80 : 0));
      const isRain = precipMm > 0.1 || precipProb >= 35 || (wCode >= 51 && wCode <= 67) || (wCode >= 80 && wCode <= 99);

      this.weather = {
        cloudCover: cur?.cloud_cover ?? 20,
        tempC: Math.round(cur?.temperature_2m ?? d0?.temperature_2m_max?.[0] ?? 22),
        uvIndex: Math.round(d0?.uv_index_max?.[0] ?? 3),
        description: decodeWMOWeather(wCode),
        precipitationMm: precipMm,
        precipitationProb: precipProb,
        isRain,
        isFallback: false
      };
    }
  }

  async reverseGeocode(lat, lon) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}&localityLanguage=en`;
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const city = data.city || data.locality || data.principalSubdivision || '';
        const country = data.countryName || '';
        if (city && country && city !== country) return `${city}, ${country}`;
        if (city || country) return city || country;
      }
    } catch {}

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat.toFixed(4)}&lon=${lon.toFixed(4)}&zoom=10`;
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const addr = data.address || {};
        const city = addr.city || addr.town || addr.village || addr.county || '';
        const country = addr.country || '';
        if (city && country) return `${city}, ${country}`;
        if (data.display_name) return data.display_name.split(',').slice(0, 2).join(',').trim();
      }
    } catch {}

    return `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`;
  }

  useMyLocation() {
    this.triggerHaptic('click');
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      this.showToast('Geolocation is not supported by your browser.');
      return;
    }

    this.showToast('Acquiring precision GPS coordinates...');
    const onSuccess = async (pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      this.location.lat = lat;
      this.location.lon = lon;
      this.timeOffsetHours = 0;

      const resolvedName = await this.reverseGeocode(lat, lon);
      this.location.name = resolvedName;
      this.showToast(`Location set: ${resolvedName}`);
      this.fetchWeatherForCoords(lat, lon);
    };

    const onFinalError = (err) => {
      let msg = 'Could not acquire GPS position.';
      if (err.code === 1) {
        msg = 'Location blocked. Enable Location in Android App Info → Permissions (or Chrome Site Settings).';
      } else if (err.code === 2) {
        msg = 'GPS signal unavailable. Try again.';
      } else if (err.code === 3) {
        msg = 'GPS request timed out.';
      }
      this.showToast(msg);
    };

    navigator.geolocation.getCurrentPosition(
      onSuccess,
      (err) => {
        if (err.code === 2 || err.code === 3) {
          // Fallback to coarse network/Wi-Fi location when high-accuracy GPS times out indoors
          navigator.geolocation.getCurrentPosition(onSuccess, onFinalError, {
            timeout: 10000,
            enableHighAccuracy: false,
            maximumAge: 300000
          });
        } else {
          onFinalError(err);
        }
      },
      { timeout: 8000, enableHighAccuracy: true, maximumAge: 60000 }
    );
  }

  applyPresetLocation(key) {
    this.triggerHaptic('click');
    const p = PRESET_LOCATIONS[key];
    if (!p) return;

    this.location = {
      name: p.name,
      lat: p.lat,
      lon: p.lon,
      timezone: p.timezone
    };
    this.timeOffsetHours = 0;
    this.forcedSunAlt = typeof p.forceSunAlt === 'number' ? p.forceSunAlt : null;
    this.weather = {
      cloudCover: p.clouds,
      tempC: p.temp,
      uvIndex: p.uv,
      description: p.weather,
      isFallback: false
    };
    this.showToast(`Loaded ${p.name}`);
    this.recalculate();
  }

  async searchCity(query) {
    const q = (query || '').trim();
    if (q.length < 2) {
      this.citySearchResults = [];
      return;
    }
    this.isCitySearching = true;
    try {
      const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=5&language=en&format=json`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();
      this.citySearchResults = (data.results || []).map((r) => ({
        id: r.id,
        name: `${r.name}${r.admin1 ? ', ' + r.admin1 : ''}, ${r.country || ''}`,
        lat: r.latitude,
        lon: r.longitude,
        timezone: r.timezone || 'UTC'
      }));
    } catch {
      this.citySearchResults = [];
    } finally {
      this.isCitySearching = false;
    }
  }

  selectCity(city) {
    this.location = {
      name: city.name,
      lat: city.lat,
      lon: city.lon,
      timezone: city.timezone
    };
    this.timeOffsetHours = 0;
    this.citySearchResults = [];
    this.showToast(`Location set: ${city.name}`);
    this.fetchWeatherForCoords(city.lat, city.lon);
  }

  // Custom Camera Management
  saveCustomCamera(name, sensorType, cropFactor) {
    const n = (name || '').trim();
    const crop = parseFloat(cropFactor);
    if (!n) {
      this.showToast('Please enter a camera body name.');
      return;
    }
    if (Number.isNaN(crop) || crop <= 0) {
      this.showToast('Please enter a valid positive crop factor.');
      return;
    }

    const id = 'custom_cam_' + Date.now();
    this.customCameras[id] = {
      id,
      name: n,
      brand: 'Custom',
      sensorType: sensorType || `Custom (${crop.toFixed(2)}×)`,
      cropFactor: crop,
      isCustom: true
    };
    saveLocal('luminary_custom_cameras', this.customCameras);
    this.camera = id;
    saveRawLocal('luminary_active_camera', id);
    this.isCameraModalOpen = false;
    this.recalculate();
    this.showToast(`Camera "${n}" saved to your gear bag!`);
  }

  deleteCustomCamera(id) {
    if (!this.customCameras[id]) return;
    const name = this.customCameras[id].name;
    delete this.customCameras[id];
    saveLocal('luminary_custom_cameras', this.customCameras);
    if (this.camera === id) {
      this.camera = 'sony_a7iv';
      saveRawLocal('luminary_active_camera', 'sony_a7iv');
    }
    this.recalculate();
    this.showToast(`Deleted "${name}" from gear bag.`);
  }

  // Custom Lens Management
  saveCustomLensToBag(rawName) {
    const c = this.customLens;
    const minF = APERTURES[c.minApertureIdx];
    const maxF = APERTURES[c.maxApertureIdx];
    const apStr = minF === maxF ? `f/${minF}` : `f/${minF}–f/${maxF}`;
    const rangeStr = c.type === 'prime' ? `${c.minMm}mm` : `${c.minMm}–${c.maxMm}mm`;
    const name = (rawName || '').trim() || `Custom ${c.type === 'prime' ? 'Prime' : 'Zoom'} (${rangeStr} ${apStr})`;

    const id = 'custom_lens_' + Date.now();
    this.customLenses[id] = {
      id,
      minApertureIdx: c.minApertureIdx,
      maxApertureIdx: c.maxApertureIdx,
      fixedAperture: c.minApertureIdx === c.maxApertureIdx,
      focalLengthMm: c.type === 'prime' ? c.minMm : c.currentMm,
      minMm: c.minMm,
      maxMm: c.maxMm,
      label: name,
      isCustom: true
    };
    saveLocal('luminary_custom_lenses', this.customLenses);
    this.gear = id;
    saveRawLocal('luminary_active_lens', id);
    this.recalculate();
    this.showToast(`Lens "${name}" saved to your gear bag!`);
  }

  deleteCurrentSavedLens() {
    const activeId = this.gear;
    if (!this.customLenses[activeId]) return;
    const name = this.customLenses[activeId].label;
    delete this.customLenses[activeId];
    saveLocal('luminary_custom_lenses', this.customLenses);
    this.gear = 'kit';
    saveRawLocal('luminary_active_lens', 'kit');
    this.recalculate();
    this.showToast(`Deleted "${name}" from gear bag.`);
  }

  updateCustomLensConfig(field, rawVal) {
    const c = this.customLens;
    const num = parseInt(rawVal, 10);
    if (Number.isNaN(num)) return;

    if (field === 'minApertureIdx') {
      c.minApertureIdx = Math.max(0, Math.min(APERTURES.length - 1, num));
      if (c.minApertureIdx > c.maxApertureIdx) c.maxApertureIdx = c.minApertureIdx;
    } else if (field === 'maxApertureIdx') {
      c.maxApertureIdx = Math.max(0, Math.min(APERTURES.length - 1, num));
      if (c.maxApertureIdx < c.minApertureIdx) c.minApertureIdx = c.maxApertureIdx;
    } else if (field === 'minMm') {
      c.minMm = Math.max(8, Math.min(1200, num));
      if (c.type === 'prime') {
        c.maxMm = c.minMm;
        c.currentMm = c.minMm;
      } else {
        if (c.minMm > c.maxMm) c.maxMm = c.minMm;
        c.currentMm = Math.max(c.minMm, Math.min(c.maxMm, c.currentMm));
      }
    } else if (field === 'maxMm') {
      c.maxMm = Math.max(8, Math.min(1200, num));
      if (c.maxMm < c.minMm) c.minMm = c.maxMm;
      c.currentMm = Math.max(c.minMm, Math.min(c.maxMm, c.currentMm));
    } else if (field === 'currentMm') {
      c.currentMm = Math.max(c.minMm, Math.min(c.maxMm, num));
    }

    this.exposure.manualOverride = false;
    this.recalculate();
  }

  setCustomLensType(type) {
    this.customLens.type = type === 'prime' ? 'prime' : 'zoom';
    if (this.customLens.type === 'prime') {
      this.customLens.maxMm = this.customLens.minMm;
      this.customLens.currentMm = this.customLens.minMm;
    } else {
      if (this.customLens.maxMm <= this.customLens.minMm) {
        this.customLens.maxMm = Math.min(1200, this.customLens.minMm + 46);
      }
      this.customLens.currentMm = Math.max(
        this.customLens.minMm,
        Math.min(this.customLens.maxMm, this.customLens.currentMm)
      );
    }
    this.exposure.manualOverride = false;
    this.recalculate();
  }

  // Shot Journal Logging
  logCurrentShot() {
    this.triggerHaptic('click');
    const exp = this.exposure;
    const gear = this.activeGearConfig;
    const cam = this.activeCamera;
    const solar = this.solarData;
    const diagnosis = this.lightDiagnosis;

    const entry = {
      id: 'shot_' + Date.now(),
      timestamp: new Date().toISOString(),
      formattedDate: new Date().toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      }),
      title: `${this.style.charAt(0).toUpperCase() + this.style.slice(1)} @ ${this.location.name.split(',')[0]}`,
      style: this.style,
      camera: {
        id: this.camera,
        name: cam.name,
        cropFactor: cam.cropFactor,
        sensorType: cam.sensorType || (cam.cropFactor + '×')
      },
      lens: {
        id: this.gear,
        label: gear.label,
        focalLengthMm: gear.focalLengthMm,
        effectiveFocalLengthMm: gear.effectiveFocalLengthMm
      },
      support: this.support,
      exposure: {
        aperture: `f/${APERTURES[exp.apertureIdx]}`,
        shutter: SHUTTERS[exp.shutterIdx].label,
        iso: `ISO ${ISOS[exp.isoIdx]}`,
        ev: `${exp.targetEV.toFixed(1)} EV`,
        wb: `${exp.wbKelvin}K (${exp.wbLabel})`,
        focusMode: exp.focusMode,
        metering: exp.metering,
        filter: exp.filter || 'None'
      },
      environment: {
        locationName: this.location.name,
        lat: this.location.lat,
        lon: this.location.lon,
        weather: this.weather.description,
        tempC: this.weather.tempC,
        cloudCover: this.weather.cloudCover,
        sunAltitude: Math.round(solar.altitude),
        sunAzimuth: Math.round(solar.azimuth),
        lightingBadge: diagnosis.badge,
        lightingSummary: diagnosis.summary
      },
      notes: ''
    };

    this.journal.unshift(entry);
    saveLocal('luminary_shot_journal', this.journal);
    this.showToast(`Shot logged to Journal (${this.journal.length} saved)`);
  }

  loadJournalRecipe(id) {
    const item = this.journal.find((x) => x.id === id);
    if (!item) return;

    if (item.camera && item.camera.id) {
      this.camera = item.camera.id;
      saveRawLocal('luminary_active_camera', item.camera.id);
    }
    if (item.lens && item.lens.id) {
      this.gear = item.lens.id;
      saveRawLocal('luminary_active_lens', item.lens.id);
    }
    if (item.style) {
      this.style = item.style;
    }
    if (item.support) {
      this.support = item.support;
    }

    const apVal = parseFloat(item.exposure.aperture.replace('f/', ''));
    const apIdx = APERTURES.indexOf(apVal);
    if (apIdx >= 0) this.exposure.apertureIdx = apIdx;

    const shIdx = SHUTTERS.findIndex((s) => s.label === item.exposure.shutter);
    if (shIdx >= 0) this.exposure.shutterIdx = shIdx;

    const isoVal = parseInt(item.exposure.iso.replace('ISO ', ''), 10);
    const isoIdx = ISOS.indexOf(isoVal);
    if (isoIdx >= 0) this.exposure.isoIdx = isoIdx;

    this.exposure.manualOverride = true;
    this.isShotJournalModalOpen = false;
    this.recalculate();
    this.showToast(`Loaded "${item.title}" into camera dials`);
  }

  copyJournalRecipe(id) {
    const item = this.journal.find((x) => x.id === id);
    if (!item) return;

    const text = [
      `${item.title} (${item.formattedDate})`,
      `Style: ${item.style.toUpperCase()} | Support: ${item.support}`,
      `Gear: ${item.camera.name} + ${item.lens.label}`,
      `Settings: ${item.exposure.aperture} | ${item.exposure.shutter} | ${item.exposure.iso} | ${item.exposure.ev}`,
      `Light: ${item.environment.lightingBadge} | WB: ${item.exposure.wb} | Weather: ${item.environment.weather}`,
      item.notes ? `Notes: ${item.notes}` : ''
    ].filter(Boolean).join('\n');

    this.copyTextToClipboard(text, 'Shot recipe copied to clipboard!');
  }

  deleteJournalRecipe(id) {
    this.journal = this.journal.filter((x) => x.id !== id);
    saveLocal('luminary_shot_journal', this.journal);
    this.showToast('Recipe deleted from Journal.');
  }

  clearShotJournal() {
    if (typeof window !== 'undefined' && !window.confirm('Are you sure you want to clear all saved shot recipes?')) return;
    this.journal = [];
    saveLocal('luminary_shot_journal', this.journal);
    this.showToast('Shot Journal cleared.');
  }

  exportJournalJSON() {
    if (this.journal.length === 0) {
      this.showToast('No recipes to export.');
      return;
    }
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(this.journal, null, 2));
    const a = document.createElement('a');
    a.setAttribute('href', dataStr);
    a.setAttribute('download', `luminary-journal-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(a);
    a.click();
    a.remove();
    this.showToast('Exported Shot Journal to JSON file!');
  }

  exportFullBackup() {
    const payload = {
      app: 'Luminary',
      backupVersion: 1,
      exportedAt: new Date().toISOString(),
      saved: {
        theme: this.theme,
        camera: this.camera,
        gear: this.gear,
        shootingMode: this.shootingMode,
        customCameras: this.customCameras,
        customLenses: this.customLenses,
        journal: this.journal
      },
      currentState: {
        location: this.location,
        style: this.style,
        support: this.support,
        dayOffset: this.dayOffset,
        timeOffsetHours: this.timeOffsetHours,
        dofSubjectDistance: this.dofSubjectDistance,
        customLens: this.customLens,
        locked: this.locked,
        exposure: this.exposure,
        nearbySpotsRadiusKm: this.nearbySpotsRadiusKm
      }
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `luminary-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    this.showToast('💾 Full backup exported (saved data + current state)!');
  }

  importFullBackup(jsonText) {
    try {
      const data = JSON.parse(jsonText);

      // Also allow restoring a plain Shot Journal array exported via "Export JSON"
      if (Array.isArray(data)) {
        this.journal = data;
        saveLocal('luminary_shot_journal', this.journal);
        this.showToast(`✅ Restored ${this.journal.length} journal recipes!`);
        return true;
      }

      if (!data || typeof data !== 'object' || data.app !== 'Luminary' || !data.saved) {
        this.showToast('Invalid Luminary backup file.');
        return false;
      }

      const s = data.saved;
      if (s.theme === 'dark' || s.theme === 'light') {
        this.applyTheme(s.theme);
      }
      if (s.customCameras && typeof s.customCameras === 'object' && !Array.isArray(s.customCameras)) {
        this.customCameras = s.customCameras;
        saveLocal('luminary_custom_cameras', this.customCameras);
      }
      if (s.customLenses && typeof s.customLenses === 'object' && !Array.isArray(s.customLenses)) {
        this.customLenses = s.customLenses;
        saveLocal('luminary_custom_lenses', this.customLenses);
      }
      if (Array.isArray(s.journal)) {
        this.journal = s.journal;
        saveLocal('luminary_shot_journal', this.journal);
      }
      if (typeof s.camera === 'string' && s.camera) {
        this.camera = s.camera;
        saveRawLocal('luminary_active_camera', s.camera);
      }
      if (typeof s.gear === 'string' && s.gear) {
        this.gear = s.gear;
        if (s.gear !== 'custom') saveRawLocal('luminary_active_lens', s.gear);
      }
      if (typeof s.shootingMode === 'string' && ['M', 'A', 'S', 'P', 'AUTO'].includes(s.shootingMode)) {
        this.shootingMode = s.shootingMode;
        saveRawLocal('luminary_shooting_mode', s.shootingMode);
      }

      const cs = data.currentState;
      if (cs && typeof cs === 'object') {
        if (cs.location && typeof cs.location.lat === 'number' && typeof cs.location.lon === 'number') {
          this.location = {
            name: String(cs.location.name || 'Restored Location'),
            lat: cs.location.lat,
            lon: cs.location.lon,
            timezone: String(cs.location.timezone || this.location.timezone)
          };
        }
        if (typeof cs.style === 'string') this.style = cs.style;
        if (cs.support === 'handheld' || cs.support === 'tripod') this.support = cs.support;
        if (cs.dayOffset === 0 || cs.dayOffset === 1) this.dayOffset = cs.dayOffset;
        if (typeof cs.timeOffsetHours === 'number') this.timeOffsetHours = cs.timeOffsetHours;
        if (typeof cs.dofSubjectDistance === 'number') this.dofSubjectDistance = cs.dofSubjectDistance;
        if (cs.customLens && typeof cs.customLens === 'object') this.customLens = { ...this.customLens, ...cs.customLens };
        if (cs.locked && typeof cs.locked === 'object') this.locked = { ...this.locked, ...cs.locked };
        if (cs.exposure && typeof cs.exposure === 'object') this.exposure = { ...this.exposure, ...cs.exposure };
        if (typeof cs.nearbySpotsRadiusKm === 'number') this.nearbySpotsRadiusKm = cs.nearbySpotsRadiusKm;
      }

      this.recalculate();
      this.fetchWeatherForCoords(this.location.lat, this.location.lon);
      this.isShotJournalModalOpen = false;
      this.showToast(`✅ Restored backup (${this.journal.length} shots)!`);
      return true;
    } catch {
      this.showToast('Could not read backup JSON file.');
      return false;
    }
  }

  updateJournalNote(id, note) {
    const item = this.journal.find((x) => x.id === id);
    if (!item) return;
    item.notes = (note || '').trim();
    saveLocal('luminary_shot_journal', this.journal);
    this.showToast('Note updated!');
  }

  copyRecipeToClipboard() {
    const exp = this.exposure;
    const gear = this.activeGearConfig;
    const cam = this.activeCamera;
    const filterLine = exp.filter && exp.filter !== 'None' ? ` | Optional Filter: ${exp.filter}` : '';
    const text = [
      `Luminary Shot Recipe — ${this.location.name}`,
      `Camera: ${cam.name} (${cam.sensorType || cam.cropFactor + '×'}) | Lens: ${gear.label} (${this.support})`,
      `Settings: f/${APERTURES[exp.apertureIdx]} | ${SHUTTERS[exp.shutterIdx].label} | ISO ${ISOS[exp.isoIdx]}`,
      `WB: ${exp.wbKelvin}K (${exp.wbLabel}) | Focus: ${exp.focusMode} | Meter: ${exp.metering}${filterLine}`
    ].join('\n');

    this.copyTextToClipboard(text, 'Camera settings copied to clipboard!');
  }

  copyTextToClipboard(text, successMsg) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
          this.showToast(successMsg);
        }).catch(() => {
          this.fallbackCopy(text, successMsg);
        });
      } else {
        this.fallbackCopy(text, successMsg);
      }
    } catch {
      this.fallbackCopy(text, successMsg);
    }
  }

  fallbackCopy(text, successMsg) {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      this.showToast(successMsg);
    } catch {
      this.showToast('Could not copy automatically.');
    }
  }

  exportShootToCalendar(phase = 'active') {
    const solar = this.solarData;
    const exp = this.exposure;
    const cam = this.activeCamera;
    const gear = this.activeGearConfig;
    const quality = this.skyQuality;

    let startDate = new Date(this.effectiveDate.getTime());
    let titlePhase = this.lightPhase.name;
    let targetAz = solar.azimuth;
    let qualityLine = '';

    if (phase === 'sunrise' || phase === 'golden' || phase === 'sunset' || phase === 'blue') {
      const curLocal = this.getCurrentLocalHour();
      let targetHour = solar.sunsetLocal;
      if (phase === 'sunrise') {
        targetHour = solar.sunriseLocal;
        titlePhase = 'Sunrise';
        targetAz = solar.sunriseAzimuth ?? solar.azimuth;
        qualityLine = `Afterglow Forecast: ${quality.sunrise.label} (${quality.sunrise.score}%)`;
      } else if (phase === 'golden') {
        targetHour = (solar.sunsetLocal - 0.75 + 24) % 24;
        titlePhase = 'Golden Hour';
        targetAz = solar.sunsetAzimuth ?? solar.azimuth;
        qualityLine = `Afterglow Forecast: ${quality.sunset.label} (${quality.sunset.score}%)`;
      } else if (phase === 'sunset') {
        targetHour = solar.sunsetLocal;
        titlePhase = 'Sunset';
        targetAz = solar.sunsetAzimuth ?? solar.azimuth;
        qualityLine = `Afterglow Forecast: ${quality.sunset.label} (${quality.sunset.score}%)`;
      } else if (phase === 'blue') {
        targetHour = solar.bluePM;
        titlePhase = 'Blue Hour';
        targetAz = solar.sunsetAzimuth ?? solar.azimuth;
      }
      const base = new Date();
      base.setDate(base.getDate() + this.dayOffset);
      base.setMinutes(base.getMinutes() + Math.round((targetHour - curLocal) * 60));
      startDate = base;
    } else {
      qualityLine = `Sunrise: ${quality.sunrise.label} (${quality.sunrise.score}%) | Sunset: ${quality.sunset.label} (${quality.sunset.score}%)`;
    }

    const endDate = new Date(startDate.getTime() + 45 * 60 * 1000);
    const toICSDate = (d) =>
      d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');

    const esc = (str) =>
      String(str || '')
        .replace(/\\/g, '\\\\')
        .replace(/;/g, '\\;')
        .replace(/,/g, '\\,')
        .replace(/\n/g, '\\n');

    const rainNote = this.weather.isRain
      ? `Rain Alert: ${this.weather.precipitationProb}% (${this.weather.precipitationMm.toFixed(1)}mm) - Pack weather sealing & UV protector`
      : `Weather: ${this.weather.description}, Clouds ${this.weather.cloudCover}%, ${this.weather.tempC}C`;

    const descLines = [
      `Luminary Shoot Plan - ${this.location.name}`,
      `Sun Azimuth: ${targetAz} deg | Alt: ${Number(solar.altitude || 0).toFixed(1)} deg`,
      qualityLine,
      rainNote,
      `Gear: ${cam.name} + ${gear.label} (${this.support})`,
      `Recommended Settings: f/${APERTURES[exp.apertureIdx]} | ${SHUTTERS[exp.shutterIdx].label} | ISO ${ISOS[exp.isoIdx]} | WB ${exp.wbKelvin}K`
    ].filter(Boolean);

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Luminary//Photography Assistant//EN',
      'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      `UID:luminary-${Date.now()}@luminary.app`,
      `DTSTAMP:${toICSDate(new Date())}`,
      `DTSTART:${toICSDate(startDate)}`,
      `DTEND:${toICSDate(endDate)}`,
      `SUMMARY:${esc(`📸 Luminary: ${titlePhase} — ${this.location.name}`)}`,
      `LOCATION:${esc(`${this.location.name} (${this.location.lat.toFixed(4)}, ${this.location.lon.toFixed(4)})`)}`,
      `GEO:${this.location.lat.toFixed(5)};${this.location.lon.toFixed(5)}`,
      `DESCRIPTION:${esc(descLines.join('\n'))}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    try {
      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateSlug = startDate.toISOString().slice(0, 10);
      a.href = url;
      a.download = `luminary-${phase}-${dateSlug}.ics`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      this.showToast(`📅 Calendar shoot (.ics) exported for ${titlePhase}!`);
    } catch {
      this.showToast('Could not generate calendar file.');
    }
  }

  openNearbySpots() {
    this.triggerHaptic('click');
    this.isSpotsModalOpen = true;
    this.loadNearbySpots(false);
  }

  async loadNearbySpots(forceRefresh = false) {
    const key = `${this.location.lat.toFixed(3)},${this.location.lon.toFixed(3)},${this.nearbySpotsRadiusKm}`;
    if (!forceRefresh && key === this.lastSpotsKey && this.nearbySpots.length > 0) {
      return;
    }

    this.nearbySpotsLoading = true;
    this.nearbySpotsError = '';
    try {
      const result = await fetchNearbyScenicSpots(
        this.location.lat,
        this.location.lon,
        this.nearbySpotsRadiusKm,
        this.location.name
      );
      this.nearbySpots = result.spots;
      this.nearbySpotsSource = result.source;
      this.lastSpotsKey = key;

      // Fetch photos for every spot card asynchronously (concurrency-limited)
      this.topSpotPhoto = null;
      this.spotPhotos = {};
      if (result.spots.length > 0) {
        this.topSpotPhotoLoading = true;
        this.loadSpotPhotosBatch(result.spots.slice(0, 20), key);
      }
    } catch {
      this.nearbySpotsError = 'Could not load nearby scenic spots. Check connection and try again.';
    } finally {
      this.nearbySpotsLoading = false;
    }
  }

  async loadSpotPhotosBatch(spots, expectedKey) {
    const queue = [...spots];
    const concurrency = 4;

    const worker = async () => {
      while (queue.length > 0) {
        if (this.lastSpotsKey !== expectedKey) return;
        const spot = queue.shift();
        if (!spot) continue;
        try {
          const photoUrl = await fetchSpotPhoto(spot);
          if (this.lastSpotsKey !== expectedKey) return;
          if (photoUrl) {
            this.spotPhotos = { ...this.spotPhotos, [spot.id]: photoUrl };
            if (spot.id === spots[0]?.id) {
              this.topSpotPhoto = photoUrl;
            }
          }
        } catch {} finally {
          if (spot.id === spots[0]?.id) {
            this.topSpotPhotoLoading = false;
          }
        }
      }
    };

    await Promise.all(Array.from({ length: Math.min(concurrency, queue.length) }, () => worker()));
    this.topSpotPhotoLoading = false;
  }

  scoutCoordinates(lat, lon, customLabel = null) {
    this.triggerHaptic('snap');
    const name = customLabel || `Pinned Spot (${lat.toFixed(3)}°, ${lon.toFixed(3)}°)`;
    this.location = {
      ...this.location,
      name,
      lat,
      lon
    };
    this.isSpotsModalOpen = false;
    this.fetchWeatherForCoords(lat, lon);
    this.recalculate();
    this.showToast(`📍 Scouting ${name} — Solar & weather updated!`);
  }

  scoutSpot(spot) {
    this.triggerHaptic('snap');
    this.location = {
      ...this.location,
      name: spot.name,
      lat: spot.lat,
      lon: spot.lon
    };
    this.isSpotsModalOpen = false;
    this.fetchWeatherForCoords(spot.lat, spot.lon);
    this.recalculate();
    this.showToast(`🔭 Scouting ${spot.name} — Solar & weather updated!`);
  }

  updateLiveClock() {
    try {
      const now = new Date();
      this.liveWallClock = now.toLocaleTimeString('en-US', {
        timeZone: this.location.timezone,
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      const d = new Date();
      this.liveWallClock = d.toTimeString().split(' ')[0];
    }
  }
}

export const appState = new AppState();
