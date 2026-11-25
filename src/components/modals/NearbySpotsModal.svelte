<script>
  import { appState } from '../../lib/state.svelte.js';
  import { getLightAlignment, destinationPoint } from '../../lib/spots.js';
  import { X, Compass, Mountain, Waves, Eye, Landmark, ExternalLink, RefreshCw, MapPin, Map as MapIcon, List } from '@lucide/svelte';
  import L from 'leaflet';
  import 'leaflet/dist/leaflet.css';

  const solar = $derived(appState.solarData);

  let viewMode = $state('list'); // 'list' | 'map'
  let mapContainerEl = $state(null);
  let mapInstance = null;
  let markersLayer = null;
  let pinnedCoords = $state(null); // { lat, lon }
  let brokenPhotos = $state({});

  const filteredSpots = $derived.by(() => {
    const f = appState.nearbySpotsFilter;
    if (f === 'all') return appState.nearbySpots;
    return appState.nearbySpots.filter((s) => s.category === f);
  });

  // Reset brokenPhotos when spot list reloads
  $effect(() => {
    const _ = appState.spotPhotos;
    brokenPhotos = {};
  });

  // Reset view & pinned coords when modal closes
  $effect(() => {
    if (!appState.isSpotsModalOpen) {
      pinnedCoords = null;
      if (mapInstance) {
        mapInstance.remove();
        mapInstance = null;
        markersLayer = null;
      }
    }
  });

  function createDotIcon(colorHex, size = 14, ring = false) {
    const ringCss = ring ? `box-shadow: 0 0 0 4px ${colorHex}44;` : '';
    return L.divIcon({
      className: 'luminary-map-pin',
      html: `<div style="width:${size}px;height:${size}px;border-radius:9999px;background:${colorHex};border:2px solid #0b0d10;${ringCss}"></div>`,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2]
    });
  }

  function renderMapLayers() {
    if (!mapInstance || !markersLayer) return;
    markersLayer.clearLayers();

    const originLat = pinnedCoords ? pinnedCoords.lat : appState.location.lat;
    const originLon = pinnedCoords ? pinnedCoords.lon : appState.location.lon;

    // 1. Sunrise & Sunset direction rays (8 km) from active/pinned point
    const srAz = solar.sunriseAzimuth ?? 90;
    const ssAz = solar.sunsetAzimuth ?? 270;
    const srEnd = destinationPoint(originLat, originLon, srAz, 8);
    const ssEnd = destinationPoint(originLat, originLon, ssAz, 8);

    L.polyline([[originLat, originLon], srEnd], {
      color: '#fb923c',
      weight: 2.5,
      dashArray: '6 5',
      opacity: 0.9
    })
      .bindTooltip(`🌅 Sunrise ${srAz}°`, { sticky: true })
      .addTo(markersLayer);

    L.polyline([[originLat, originLon], ssEnd], {
      color: '#f43f5e',
      weight: 2.5,
      dashArray: '6 5',
      opacity: 0.9
    })
      .bindTooltip(`🌇 Sunset ${ssAz}°`, { sticky: true })
      .addTo(markersLayer);

    // 2. Active Location Pin
    L.marker([appState.location.lat, appState.location.lon], {
      icon: createDotIcon('#38bdf8', 16, true)
    })
      .bindTooltip(`Current: ${appState.location.name}`)
      .addTo(markersLayer);

    // 3. Custom Pinned Point (if user tapped map)
    if (pinnedCoords) {
      L.marker([pinnedCoords.lat, pinnedCoords.lon], {
        icon: createDotIcon('#fbbf24', 18, true)
      })
        .bindTooltip(`Pinned: ${pinnedCoords.lat.toFixed(4)}°, ${pinnedCoords.lon.toFixed(4)}°`)
        .addTo(markersLayer);
    }

    // 4. Nearby Scenic Spots Pins
    for (const spot of filteredSpots) {
      const color =
        spot.category === 'viewpoint'
          ? '#f59e0b'
          : spot.category === 'mountain'
          ? '#a78bfa'
          : spot.category === 'water'
          ? '#22d3ee'
          : '#94a3b8';

      const marker = L.marker([spot.lat, spot.lon], {
        icon: createDotIcon(color, 13, false)
      });

      const popupEl = document.createElement('div');
      popupEl.style.fontFamily = 'Inter, sans-serif';
      popupEl.style.fontSize = '12px';
      popupEl.style.minWidth = '150px';

      const titleEl = document.createElement('div');
      titleEl.style.fontWeight = '700';
      titleEl.style.marginBottom = '3px';
      titleEl.textContent = `${getCategoryIcon(spot.category)} ${spot.name}`;

      const metaEl = document.createElement('div');
      metaEl.style.fontSize = '11px';
      metaEl.style.color = '#64748b';
      metaEl.style.marginBottom = '6px';
      metaEl.textContent = `${spot.distanceKm.toFixed(1)} km • ${spot.bearingDeg}° ${spot.cardinal}`;

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = 'Scout Here';
      btn.style.cssText =
        'background:#f59e0b;color:#0f172a;font-weight:700;font-size:11px;padding:4px 10px;border-radius:6px;border:none;cursor:pointer;';
      btn.onclick = () => appState.scoutSpot(spot);

      popupEl.append(titleEl, metaEl, btn);
      marker.bindPopup(popupEl);
      marker.addTo(markersLayer);
    }
  }

  // Initialize / tear down Leaflet map when viewMode === 'map'
  $effect(() => {
    if (appState.isSpotsModalOpen && viewMode === 'map' && mapContainerEl) {
      if (!mapInstance) {
        mapInstance = L.map(mapContainerEl, {
          center: [appState.location.lat, appState.location.lon],
          zoom: 12,
          zoomControl: true
        });
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap',
          maxZoom: 18
        }).addTo(mapInstance);
        markersLayer = L.layerGroup().addTo(mapInstance);

        mapInstance.on('click', (e) => {
          pinnedCoords = { lat: e.latlng.lat, lon: e.latlng.lng };
        });

        setTimeout(() => mapInstance?.invalidateSize(), 80);
      }
      renderMapLayers();
    } else if (viewMode !== 'map' && mapInstance) {
      mapInstance.remove();
      mapInstance = null;
      markersLayer = null;
    }
  });

  function getCategoryIcon(cat) {
    if (cat === 'viewpoint') return '🔭';
    if (cat === 'mountain') return '⛰️';
    if (cat === 'water') return '🌊';
    return '🏛️';
  }

  function handleRadiusChange(km) {
    appState.nearbySpotsRadiusKm = km;
    appState.loadNearbySpots(true);
  }
</script>

{#if appState.isSpotsModalOpen}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
    onclick={(e) => { if (e.target === e.currentTarget) appState.isSpotsModalOpen = false; }}>
    <div class="bg-camera border border-borderline rounded-t-2xl sm:rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
      <!-- Header -->
      <div class="px-4 py-3.5 border-b border-borderline flex items-center justify-between gap-2 bg-dial/50">
        <div class="min-w-0">
          <h3 class="text-sm font-bold text-white flex items-center gap-2">
            <span>🔭</span>
            <span>Nearby Scenic Spots</span>
            {#if appState.nearbySpotsSource}
              <span class="text-[9px] font-mono px-1.5 py-0.5 rounded bg-obsidian/70 text-slate-400 border border-borderline">
                {appState.nearbySpotsSource}
              </span>
            {/if}
          </h3>
          <p class="text-[11px] text-slate-400 truncate mt-0.5">
            Around {appState.location.name} ({appState.location.lat.toFixed(3)}°, {appState.location.lon.toFixed(3)}°)
          </p>
        </div>

        <div class="flex items-center gap-1.5 shrink-0">
          <!-- View Mode Switcher (List / Scouting Map) -->
          <div class="inline-flex items-center bg-obsidian/80 border border-borderline rounded-lg p-0.5 text-[10px] font-mono">
            <button
              type="button"
              onclick={() => { viewMode = 'list'; }}
              class={`inline-flex items-center gap-1 px-2 py-1 rounded-md transition ${viewMode === 'list' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'}`}>
              <List class="w-3 h-3" />
              <span>List</span>
            </button>
            <button
              type="button"
              onclick={() => { viewMode = 'map'; }}
              class={`inline-flex items-center gap-1 px-2 py-1 rounded-md transition ${viewMode === 'map' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'}`}>
              <MapIcon class="w-3 h-3" />
              <span>Map</span>
            </button>
          </div>

          <button
            type="button"
            onclick={() => appState.loadNearbySpots(true)}
            class="p-1.5 rounded-lg bg-dial hover:bg-slate-700/80 border border-borderline text-slate-300 hover:text-white transition active:scale-95"
            title="Refresh nearby spots">
            <RefreshCw class={`w-4 h-4 ${appState.nearbySpotsLoading ? 'animate-spin text-amber-400' : ''}`} />
          </button>
          <button
            type="button"
            onclick={() => { appState.isSpotsModalOpen = false; }}
            class="p-1.5 rounded-lg bg-dial hover:bg-slate-700/80 border border-borderline text-slate-400 hover:text-white transition"
            aria-label="Close nearby spots">
            <X class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Controls: Radius & Category Filters -->
      <div class="px-4 py-2.5 border-b border-borderline/70 space-y-2 bg-obsidian/40">
        <div class="flex items-center justify-between gap-2 flex-wrap">
          <div class="flex items-center gap-1 text-[10px] font-mono">
            <span class="text-slate-400 mr-1">Radius:</span>
            {#each [10, 20, 35] as r}
              <button
                type="button"
                onclick={() => handleRadiusChange(r)}
                class={`px-2 py-0.5 rounded-md border transition ${appState.nearbySpotsRadiusKm === r ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold' : 'bg-dial text-slate-300 border-borderline hover:text-white'}`}>
                {r}km
              </button>
            {/each}
          </div>
          <span class="text-[10px] font-mono text-slate-400">
            Sunrise {solar.sunriseAzimuth ?? 90}° • Sunset {solar.sunsetAzimuth ?? 270}°
          </span>
        </div>

        <div class="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-[11px]">
          <button
            type="button"
            onclick={() => { appState.nearbySpotsFilter = 'all'; }}
            class={`shrink-0 px-2.5 py-1 rounded-lg border font-medium transition ${appState.nearbySpotsFilter === 'all' ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold' : 'bg-dial border-borderline text-slate-300 hover:text-white'}`}>
            All ({appState.nearbySpots.length})
          </button>
          <button
            type="button"
            onclick={() => { appState.nearbySpotsFilter = 'viewpoint'; }}
            class={`shrink-0 px-2.5 py-1 rounded-lg border font-medium transition flex items-center gap-1 ${appState.nearbySpotsFilter === 'viewpoint' ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold' : 'bg-dial border-borderline text-slate-300 hover:text-white'}`}>
            <Eye class="w-3 h-3" /> Viewpoints
          </button>
          <button
            type="button"
            onclick={() => { appState.nearbySpotsFilter = 'mountain'; }}
            class={`shrink-0 px-2.5 py-1 rounded-lg border font-medium transition flex items-center gap-1 ${appState.nearbySpotsFilter === 'mountain' ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold' : 'bg-dial border-borderline text-slate-300 hover:text-white'}`}>
            <Mountain class="w-3 h-3" /> Mountains
          </button>
          <button
            type="button"
            onclick={() => { appState.nearbySpotsFilter = 'water'; }}
            class={`shrink-0 px-2.5 py-1 rounded-lg border font-medium transition flex items-center gap-1 ${appState.nearbySpotsFilter === 'water' ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold' : 'bg-dial border-borderline text-slate-300 hover:text-white'}`}>
            <Waves class="w-3 h-3" /> Water &amp; Rivers
          </button>
          <button
            type="button"
            onclick={() => { appState.nearbySpotsFilter = 'landmark'; }}
            class={`shrink-0 px-2.5 py-1 rounded-lg border font-medium transition flex items-center gap-1 ${appState.nearbySpotsFilter === 'landmark' ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold' : 'bg-dial border-borderline text-slate-300 hover:text-white'}`}>
            <Landmark class="w-3 h-3" /> Landmarks
          </button>
        </div>
      </div>

      <!-- Body -->
      {#if viewMode === 'map'}
        <div class="flex-1 flex flex-col min-h-[340px]">
          <div bind:this={mapContainerEl} class="w-full h-[340px] sm:h-[400px] z-10 bg-obsidian"></div>
          <div class="px-4 py-2.5 border-t border-borderline bg-dial/40 flex items-center justify-between gap-2 flex-wrap text-[11px] font-mono">
            {#if pinnedCoords}
              <span class="text-amber-300 font-semibold">
                📍 Exact Pin: {pinnedCoords.lat.toFixed(4)}°, {pinnedCoords.lon.toFixed(4)}°
              </span>
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  onclick={() => appState.scoutCoordinates(pinnedCoords.lat, pinnedCoords.lon)}
                  class="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition active:scale-95">
                  Scout This Exact Point
                </button>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${pinnedCoords.lat},${pinnedCoords.lon}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-obsidian border border-borderline text-slate-300 hover:text-white">
                  <span>Maps</span>
                  <ExternalLink class="w-3 h-3" />
                </a>
              </div>
            {:else}
              <span class="text-slate-400">
                Tap anywhere on the map to drop an exact pin • Orange = Sunrise • Rose = Sunset
              </span>
            {/if}
          </div>
        </div>
      {:else}
        <div class="flex-1 overflow-y-auto p-4 space-y-2.5">
          {#if appState.nearbySpotsLoading}
            <div class="py-12 text-center space-y-2">
              <RefreshCw class="w-6 h-6 text-amber-400 animate-spin mx-auto" />
              <p class="text-xs font-mono text-slate-400">Scanning nearby viewpoints, peaks &amp; rivers...</p>
            </div>
          {:else if appState.nearbySpotsError}
            <div class="p-4 rounded-xl bg-rose-500/15 border border-rose-500/40 text-xs text-rose-900 dark:text-rose-200 text-center space-y-2">
              <p>{appState.nearbySpotsError}</p>
              <button
                type="button"
                onclick={() => appState.loadNearbySpots(true)}
                class="px-3 py-1 rounded-lg bg-dial border border-borderline text-slate-200 font-semibold">
                Retry
              </button>
            </div>
          {:else if filteredSpots.length === 0}
            <div class="py-10 text-center text-xs text-slate-400 space-y-2">
              <p>No spots found for this filter within {appState.nearbySpotsRadiusKm} km.</p>
              {#if appState.nearbySpotsRadiusKm < 35}
                <button
                  type="button"
                  onclick={() => handleRadiusChange(35)}
                  class="px-3 py-1.5 rounded-lg bg-dial border border-borderline text-amber-300 font-semibold">
                  Expand Radius to 35 km
                </button>
              {/if}
            </div>
          {:else}
            {#each filteredSpots as spot, idx (spot.id)}
              {@const align = getLightAlignment(spot.bearingDeg, solar.sunriseAzimuth ?? 90, solar.sunsetAzimuth ?? 270)}
              {@const spotPhoto = appState.spotPhotos[spot.id] || (idx === 0 && appState.nearbySpots[0]?.id === spot.id ? appState.topSpotPhoto : null)}
              {@const hasPhoto = Boolean(spotPhoto && !brokenPhotos[spot.id])}
              {@const isTopFeatured = idx === 0 && appState.nearbySpots[0]?.id === spot.id && hasPhoto}
              <div class="rounded-xl bg-dial/60 border border-borderline hover:border-amber-500/40 transition overflow-hidden">
                {#if isTopFeatured}
                  <div class="relative h-36 sm:h-44 w-full bg-obsidian overflow-hidden">
                    <img
                      src={spotPhoto}
                      alt={spot.name}
                      onerror={() => { brokenPhotos = { ...brokenPhotos, [spot.id]: true }; }}
                      class="w-full h-full object-cover" />
                    <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                    <span class="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/65 backdrop-blur-sm text-[10px] font-mono text-amber-300 border border-amber-500/30 font-semibold">
                      📸 Nearest Featured Spot
                    </span>
                  </div>
                {/if}
                <div class="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div class="flex items-center gap-3 min-w-0">
                    {#if !isTopFeatured && hasPhoto}
                      <img
                        src={spotPhoto}
                        alt={spot.name}
                        loading="lazy"
                        onerror={() => { brokenPhotos = { ...brokenPhotos, [spot.id]: true }; }}
                        class="w-14 h-14 sm:w-16 sm:h-16 rounded-lg object-cover border border-borderline/70 shrink-0 bg-obsidian" />
                    {/if}
                    <div class="space-y-1 min-w-0">
                    <div class="flex items-center gap-1.5 flex-wrap">
                      <span class="text-sm">{getCategoryIcon(spot.category)}</span>
                      <span class="text-xs font-bold text-white truncate">{spot.name}</span>
                      {#if spot.elevationM}
                        <span class="text-[10px] font-mono px-1.5 py-0.2 rounded bg-obsidian/70 text-slate-300 border border-borderline">
                          {spot.elevationM}m
                        </span>
                      {/if}
                      {#if align}
                        <span class={`text-[9px] font-mono px-1.5 py-0.2 rounded border font-semibold ${align.badgeClass}`}>
                          {align.label}
                        </span>
                      {/if}
                    </div>
                    <div class="flex items-center gap-3 text-[10px] font-mono text-slate-400">
                      <span class="flex items-center gap-1">
                        <MapPin class="w-3 h-3 text-amber-400" />
                        {spot.distanceKm.toFixed(1)} km away
                      </span>
                      <span class="flex items-center gap-1">
                        <Compass class="w-3 h-3 text-sky-400" />
                        {spot.bearingDeg}° {spot.cardinal}
                      </span>
                      <span class="capitalize text-slate-500">{spot.tagLabel}</span>
                    </div>
                  </div>
                  </div>

                  <div class="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onclick={() => appState.scoutSpot(spot)}
                      class="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-bold transition active:scale-95 shadow-sm">
                      Scout Here
                    </button>
                    <a
                      href={`https://www.google.com/maps/search/${encodeURIComponent(spot.name)}/@${spot.lat},${spot.lon},15z`}
                      target="_blank"
                      rel="noopener noreferrer"
                      class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-obsidian/80 hover:bg-slate-700/80 border border-borderline text-[11px] font-mono text-slate-300 hover:text-white transition">
                      <span>Maps</span>
                      <ExternalLink class="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            {/each}
          {/if}
        </div>
      {/if}
    </div>
  </div>
{/if}
