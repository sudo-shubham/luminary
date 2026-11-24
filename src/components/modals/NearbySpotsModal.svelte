<script>
  import { appState } from '../../lib/state.svelte.js';
  import { getLightAlignment } from '../../lib/spots.js';
  import { X, Compass, Mountain, Waves, Eye, Landmark, ExternalLink, RefreshCw, MapPin } from '@lucide/svelte';

  const solar = $derived(appState.solarData);

  const filteredSpots = $derived.by(() => {
    const f = appState.nearbySpotsFilter;
    if (f === 'all') return appState.nearbySpots;
    return appState.nearbySpots.filter((s) => s.category === f);
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
    <div class="bg-camera border border-borderline rounded-t-2xl sm:rounded-2xl w-full max-w-2xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden">
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
          {#each filteredSpots as spot (spot.id)}
            {@const align = getLightAlignment(spot.bearingDeg, solar.sunriseAzimuth ?? 90, solar.sunsetAzimuth ?? 270)}
            <div class="p-3 rounded-xl bg-dial/60 border border-borderline hover:border-amber-500/40 transition flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
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

              <div class="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onclick={() => appState.scoutSpot(spot)}
                  class="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-bold transition active:scale-95 shadow-sm">
                  Scout Here
                </button>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${spot.lat},${spot.lon}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-obsidian/80 hover:bg-slate-700/80 border border-borderline text-[11px] font-mono text-slate-300 hover:text-white transition">
                  <span>Maps</span>
                  <ExternalLink class="w-3 h-3" />
                </a>
              </div>
            </div>
          {/each}
        {/if}
      </div>
    </div>
  </div>
{/if}
