<script>
  import { appState } from '../lib/state.svelte.js';
  import { formatDecimalHour } from '../lib/solar.js';
  import { MapPin, Search, RotateCcw } from '@lucide/svelte';

  let searchQuery = $state('');
  let isDropdownOpen = $state(false);

  function handleSearchInput(e) {
    searchQuery = e.target.value;
    if (searchQuery.trim().length >= 2) {
      appState.searchCity(searchQuery);
      isDropdownOpen = true;
    } else {
      isDropdownOpen = false;
    }
  }

  function handleSelectCity(city) {
    appState.selectCity(city);
    searchQuery = '';
    isDropdownOpen = false;
  }
</script>

<section class="bg-camera border border-borderline rounded-2xl p-3 sm:p-4 shadow-lg space-y-3">
  <div class="flex flex-col md:flex-row md:items-center justify-between gap-3">
    <!-- Location Search & GPS Controls -->
    <div class="relative w-full md:w-80 md:max-w-sm shrink-0">
      <div class="flex items-center gap-1.5 bg-obsidian border border-borderline focus-within:border-amber-500/60 rounded-xl px-2.5 py-1.5 shadow-inner transition">
        <!-- GPS Button -->
        <button
          type="button"
          onclick={() => appState.useMyLocation()}
          class="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-dial hover:bg-slate-700 text-slate-300 hover:text-white border border-borderline text-xs font-semibold transition active:scale-95"
          title="Detect current location via GPS">
          <MapPin class="w-3.5 h-3.5 text-amber-400" />
          <span class="text-[10px] font-mono hidden xs:inline">GPS</span>
        </button>

        <!-- City Search Input -->
        <input
          type="text"
          value={searchQuery}
          oninput={handleSearchInput}
          onfocus={() => { if (appState.citySearchResults.length > 0) isDropdownOpen = true; }}
          placeholder="Search city (e.g. Kyoto, Paris)..."
          class="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none min-w-0"
          autocomplete="off" />

        <Search class="w-3.5 h-3.5 text-slate-500 shrink-0" />

        <!-- Nearby Scenic Spots Trigger -->
        <button
          type="button"
          onclick={() => appState.openNearbySpots()}
          class="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-semibold transition active:scale-95"
          title="Find nearby viewpoints, mountains, rivers & scenic spots">
          <span>🔭</span>
          <span>Spots</span>
        </button>
      </div>

      <!-- City Search Results Dropdown -->
      {#if isDropdownOpen && appState.citySearchResults.length > 0}
        <div class="absolute left-0 right-0 top-full mt-1.5 bg-dial border border-borderline rounded-xl shadow-2xl overflow-hidden z-50 max-h-60 overflow-y-auto">
          {#each appState.citySearchResults as city (city.id)}
            <button
              type="button"
              onclick={() => handleSelectCity(city)}
              class="w-full text-left px-3.5 py-2.5 hover:bg-camera border-b border-borderline/40 last:border-0 transition flex flex-col">
              <span class="text-xs font-semibold text-white truncate">{city.name}</span>
              <span class="text-[10px] font-mono text-slate-400">{city.lat.toFixed(2)}°, {city.lon.toFixed(2)}° • {city.timezone}</span>
            </button>
          {/each}
        </div>
      {/if}
    </div>

    <!-- Active Location & Solar Telemetry Strip Readouts -->
    <div class="flex items-center justify-between md:justify-end gap-2.5 min-w-0 flex-1">
      <div class="flex items-center gap-2 min-w-0">
        <span class="text-xs sm:text-sm font-bold text-white truncate max-w-[130px] xs:max-w-[170px] sm:max-w-none">
          {appState.location.name}
        </span>
        <span class={`px-1.5 sm:px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-mono font-bold border shrink-0 ${appState.lightPhase.badgeClass}`}>
          {appState.lightPhase.name}
        </span>
        <span class="text-[10px] sm:text-[11px] font-mono font-semibold text-emerald-400 shrink-0 tabular-nums">
          EV {appState.lightPhase.baseEV.toFixed(1)}
        </span>
      </div>

      <!-- Time Shift Simulator -->
      <div class="flex items-center gap-1 bg-obsidian border border-borderline rounded-xl px-1.5 py-1 shrink-0">
        <button
          type="button"
          onclick={() => appState.shiftTime(-1)}
          class="w-6 h-6 rounded-lg bg-dial hover:bg-slate-700 text-slate-300 font-mono text-xs flex items-center justify-center transition active:scale-95"
          title="Shift time back 1 hour">-1h</button>

        <span class="text-xs font-mono font-semibold text-amber-400 min-w-[34px] sm:min-w-[38px] text-center tabular-nums">
          {appState.timeOffsetHours === 0 ? 'LIVE' : `${appState.timeOffsetHours > 0 ? '+' : ''}${appState.timeOffsetHours}h`}
        </span>

        <button
          type="button"
          onclick={() => appState.shiftTime(1)}
          class="w-6 h-6 rounded-lg bg-dial hover:bg-slate-700 text-slate-300 font-mono text-xs flex items-center justify-center transition active:scale-95"
          title="Shift time forward 1 hour">+1h</button>

        {#if appState.timeOffsetHours !== 0 || appState.dayOffset !== 0}
          <button
            type="button"
            onclick={() => appState.resetTime()}
            class="text-[10px] font-mono text-sky-400 hover:underline px-1 flex items-center gap-0.5"
            title="Reset to current live time">
            <RotateCcw class="w-2.5 h-2.5" />
            <span>Reset</span>
          </button>
        {/if}
      </div>
    </div>
  </div>

  <!-- Day Selection & Solar Phase Quick Snap Bar -->
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2 border-t border-borderline/60">
    <!-- Day Selection Segmented Control & Rain Alert Badge -->
    <div class="flex items-center gap-2 flex-wrap">
      <div class="inline-flex p-0.5 bg-obsidian border border-borderline rounded-xl text-xs font-mono shrink-0 shadow-inner">
        <button
          type="button"
          onclick={() => appState.setDayOffset(0)}
          class={`px-3 py-1 rounded-lg font-semibold transition active:scale-95 ${appState.dayOffset === 0 ? 'bg-amber-500 text-slate-950 shadow-sm font-bold' : 'text-slate-400 hover:text-white'}`}>
          Today
        </button>
        <button
          type="button"
          onclick={() => appState.setDayOffset(1)}
          class={`px-3 py-1 rounded-lg font-semibold transition active:scale-95 flex items-center gap-1.5 ${appState.dayOffset === 1 ? 'bg-amber-500 text-slate-950 shadow-sm font-bold' : 'text-slate-400 hover:text-white'}`}>
          <span>Tomorrow</span>
          <span class="text-[9px] px-1 py-0.2 rounded bg-black/20 font-mono font-bold">+1d</span>
        </button>
      </div>

      <!-- Rain Alert Badge if Rain Expected -->
      {#if appState.weather.isRain || appState.weather.precipitationProb >= 35}
        <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-mono font-semibold animate-pulse">
          <span>🌧️</span>
          <span>Rain {appState.weather.precipitationProb}%</span>
          {#if appState.weather.precipitationMm > 0}
            <span class="text-rose-400 text-[10px]">({appState.weather.precipitationMm.toFixed(1)}mm)</span>
          {/if}
        </div>
      {/if}
    </div>

    <!-- Solar Phase Quick Snap Buttons for Current Location -->
    <div class="flex items-center gap-1.5 overflow-x-auto text-[11px] font-mono scrollbar-none flex-1 justify-start sm:justify-end">
      <!-- Sunrise Button -->
      <button
        type="button"
        onclick={() => appState.jumpToSolarPhase('sunrise')}
        class="shrink-0 px-2 sm:px-2.5 py-1 rounded-xl bg-dial hover:bg-slate-700/80 border border-borderline hover:border-amber-400/40 text-slate-300 hover:text-white transition active:scale-95 flex items-center gap-1 shadow-sm"
        title="Snap camera settings to Sunrise">
        <span>🌅</span>
        <span class="font-medium">Sunrise</span>
        <span class="text-[10px] text-amber-300 font-semibold tabular-nums">{formatDecimalHour(appState.solarData.sunriseLocal)}</span>
      </button>

      <!-- Golden Hour Button -->
      <button
        type="button"
        onclick={() => appState.jumpToSolarPhase('golden')}
        class="shrink-0 px-2 sm:px-2.5 py-1 rounded-xl bg-dial hover:bg-slate-700/80 border border-borderline hover:border-amber-400/40 text-slate-300 hover:text-white transition active:scale-95 flex items-center gap-1 shadow-sm"
        title="Snap camera settings to Golden Hour (warm rim light, sun at +4°)">
        <span>✨</span>
        <span class="font-medium">Golden</span>
        <span class="text-[10px] text-amber-300 font-semibold tabular-nums">{formatDecimalHour((appState.solarData.sunsetLocal - 0.75 + 24) % 24)}</span>
      </button>

      <!-- Sunset Button -->
      <button
        type="button"
        onclick={() => appState.jumpToSolarPhase('sunset')}
        class="shrink-0 px-2 sm:px-2.5 py-1 rounded-xl bg-dial hover:bg-slate-700/80 border border-borderline hover:border-amber-400/40 text-slate-300 hover:text-white transition active:scale-95 flex items-center gap-1 shadow-sm"
        title="Snap camera settings to Sunset">
        <span>🌇</span>
        <span class="font-medium">Sunset</span>
        <span class="text-[10px] text-amber-400 font-semibold tabular-nums">{formatDecimalHour(appState.solarData.sunsetLocal)}</span>
      </button>

      <!-- Blue Hour Button -->
      <button
        type="button"
        onclick={() => appState.jumpToSolarPhase('blue')}
        class="shrink-0 px-2 sm:px-2.5 py-1 rounded-xl bg-dial hover:bg-slate-700/80 border border-borderline hover:border-sky-400/40 text-slate-300 hover:text-white transition active:scale-95 flex items-center gap-1 shadow-sm"
        title="Snap camera settings to Blue Hour (deep twilight, sun at -5°)">
        <span>🌌</span>
        <span class="font-medium">Blue</span>
        <span class="text-[10px] text-sky-400 font-semibold tabular-nums">{formatDecimalHour(appState.solarData.bluePM)}</span>
      </button>

      <!-- Solar Arc Button -->
      <button
        type="button"
        onclick={() => appState.jumpToSolarPhase('arc')}
        class="shrink-0 px-2 sm:px-2.5 py-1 rounded-xl bg-dial hover:bg-slate-700/80 border border-borderline hover:border-amber-400/40 text-slate-300 hover:text-white transition active:scale-95 flex items-center gap-1 shadow-sm"
        title="View live Solar Arc curve and ephemeris">
        <span>☀️</span>
        <span class="font-medium">Solar Arc</span>
      </button>
    </div>
  </div>

  <!-- Quick Location Preset Pills -->
  <div class="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-[11px] font-mono scrollbar-none">
    <span class="text-[10px] uppercase text-slate-400 font-semibold shrink-0 pr-1">Presets:</span>
    <button
      type="button"
      onclick={() => appState.applyPresetLocation('tokyo')}
      class="shrink-0 px-2.5 py-1 rounded-lg bg-dial hover:bg-slate-700/80 border border-borderline text-slate-300 hover:text-white transition active:scale-95">
      🌃 Tokyo Night
    </button>
    <button
      type="button"
      onclick={() => appState.applyPresetLocation('iceland')}
      class="shrink-0 px-2.5 py-1 rounded-lg bg-dial hover:bg-slate-700/80 border border-borderline text-slate-300 hover:text-white transition active:scale-95">
      🧊 Vik, Iceland
    </button>
    <button
      type="button"
      onclick={() => appState.applyPresetLocation('sahara')}
      class="shrink-0 px-2.5 py-1 rounded-lg bg-dial hover:bg-slate-700/80 border border-borderline text-slate-300 hover:text-white transition active:scale-95">
      ☀️ Sahara Midday
    </button>
    <button
      type="button"
      onclick={() => appState.applyPresetLocation('london')}
      class="shrink-0 px-2.5 py-1 rounded-lg bg-dial hover:bg-slate-700/80 border border-borderline text-slate-300 hover:text-white transition active:scale-95">
      ☁️ London Overcast
    </button>
  </div>
</section>
