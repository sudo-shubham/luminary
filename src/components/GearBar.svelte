<script>
  import { appState } from '../lib/state.svelte.js';
  import { APERTURES, DEFAULT_LENSES, SHUTTERS } from '../lib/constants.js';
  import { Camera, Sliders, Trash2, Save, ChevronDown, ChevronUp } from '@lucide/svelte';

  let customLensNameInput = $state('');

  function handleSaveLens() {
    appState.saveCustomLensToBag(customLensNameInput);
    customLensNameInput = '';
  }

  const isCustomLensActive = $derived(
    appState.gear === 'custom' || String(appState.gear).startsWith('custom_lens_')
  );

  const customSavedLensKeys = $derived(Object.keys(appState.customLenses));
</script>

<section class="bg-camera border border-borderline rounded-2xl p-3.5 sm:p-4 shadow-lg space-y-3">
  <!-- Gear Setup Summary Header -->
  <div class="flex items-center justify-between gap-3">
    <div class="flex items-center gap-2.5 min-w-0">
      <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-dial border border-borderline flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
        <Camera class="w-4 h-4 text-amber-400" />
      </div>
      <div class="min-w-0">
        <div class="text-[9px] font-mono uppercase tracking-wider text-slate-400 font-semibold">Active Camera &amp; Lens Setup</div>
        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="text-xs sm:text-sm font-bold text-white truncate max-w-[140px] xs:max-w-[200px] sm:max-w-none">
            {appState.activeCamera.name}
          </span>
          <span class="text-slate-400 text-xs hidden xs:inline">•</span>
          <span class="text-xs sm:text-sm font-semibold text-slate-300 truncate max-w-[130px] xs:max-w-[180px] sm:max-w-none">
            {appState.activeGearConfig.focalLengthMm}mm • {appState.support === 'tripod' ? 'Tripod' : 'Handheld'}
          </span>
        </div>
      </div>
    </div>

    <!-- Toggle Drawer Button -->
    <button
      type="button"
      onclick={() => { appState.triggerHaptic('click'); appState.isCameraSetupOpen = !appState.isCameraSetupOpen; }}
      class="shrink-0 inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-dial hover:bg-slate-700/80 text-xs font-semibold text-amber-300 border border-borderline transition active:scale-95 shadow-sm"
      title="Tap to expand Camera Body, Lens & Hold options">
      <span>Setup</span>
      {#if appState.isCameraSetupOpen}
        <ChevronUp class="w-3.5 h-3.5 text-slate-400" />
      {:else}
        <ChevronDown class="w-3.5 h-3.5 text-slate-400" />
      {/if}
    </button>
  </div>

  <!-- Collapsible Setup Drawer -->
  {#if appState.isCameraSetupOpen}
    <div class="border-t border-borderline/60 pt-3 space-y-3.5">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <!-- Camera Body Selector -->
        <div>
          <span class="block text-[10px] font-mono text-slate-400 uppercase mb-1 font-semibold">Camera Body</span>
          <div class="bg-obsidian border border-borderline hover:border-amber-500/50 rounded-xl px-2.5 py-1.5 flex items-center justify-between gap-1 shadow-inner">
            <div class="min-w-0 pr-1">
              <div class="text-xs sm:text-sm font-bold text-white truncate">{appState.activeCamera.name}</div>
              <div class="text-[10px] font-mono text-amber-400">{appState.activeCamera.cropFactor}× {appState.activeCamera.sensorType || ''}</div>
            </div>
            <button
              type="button"
              onclick={() => { appState.triggerHaptic('click'); appState.isCameraModalOpen = true; }}
              class="shrink-0 px-2 py-1 rounded-lg bg-dial hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-borderline transition active:scale-95">
              Change
            </button>
          </div>
        </div>

        <!-- Lens Selector -->
        <div>
          <label for="gearSelectInput" class="block text-[10px] font-mono text-slate-400 uppercase mb-1 font-semibold">Lens Selection</label>
          <div class="bg-obsidian border border-borderline focus-within:border-amber-500/50 rounded-xl px-2.5 py-2 shadow-inner">
            <select
              id="gearSelectInput"
              value={appState.gear}
              onchange={(e) => appState.setGear(e.target.value)}
              class="w-full bg-transparent text-xs sm:text-sm font-semibold text-white focus:outline-none cursor-pointer">
              <optgroup label="Preset Prime Lenses" class="bg-obsidian text-slate-400">
                {#each ['prime_24', 'prime_35', 'prime_50', 'prime_85', 'prime_135', 'macro_100', 'astro_14', 'phone'] as id}
                  {#if DEFAULT_LENSES[id]}
                    <option value={id} class="bg-obsidian text-white">{DEFAULT_LENSES[id].label}</option>
                  {/if}
                {/each}
              </optgroup>
              <optgroup label="Preset Zoom Lenses" class="bg-obsidian text-slate-400">
                {#each ['kit', 'zoom_16_35', 'zoom_24_70', 'zoom_70_200', 'zoom_100_400'] as id}
                  {#if DEFAULT_LENSES[id]}
                    <option value={id} class="bg-obsidian text-white">{DEFAULT_LENSES[id].label}</option>
                  {/if}
                {/each}
              </optgroup>
              {#if customSavedLensKeys.length > 0}
                <optgroup label="Custom Saved Lenses" class="bg-obsidian text-amber-400 font-semibold">
                  {#each customSavedLensKeys as id}
                    <option value={id} class="bg-obsidian text-white">★ {appState.customLenses[id].label}</option>
                  {/each}
                </optgroup>
              {/if}
              <option value="custom" class="bg-obsidian text-amber-300 font-semibold">⚙️ Build / Save Custom Lens...</option>
            </select>
          </div>
        </div>

        <!-- Camera Support / Hold Mode -->
        <div>
          <label for="supportSelectInput" class="block text-[10px] font-mono text-slate-400 uppercase mb-1 font-semibold">Support / Hold</label>
          <div class="bg-obsidian border border-borderline focus-within:border-amber-500/50 rounded-xl px-2.5 py-2 shadow-inner">
            <select
              id="supportSelectInput"
              value={appState.support}
              onchange={(e) => appState.setSupport(e.target.value)}
              class="w-full bg-transparent text-xs sm:text-sm font-semibold text-white focus:outline-none cursor-pointer">
              <option value="handheld" class="bg-obsidian text-white">Handheld (Safe Reciprocal Floor)</option>
              <option value="tripod" class="bg-obsidian text-white">Tripod / Solid Surface (Any Shutter)</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Gear Telemetry Pills -->
      <div class="flex flex-wrap items-center justify-between gap-2 text-[10px] sm:text-[11px] font-mono text-slate-400 bg-obsidian/60 border border-borderline rounded-xl px-3 py-2">
        <span class="text-amber-400 font-semibold">
          {appState.activeCamera.name} • {appState.activeCamera.sensorType || appState.activeCamera.cropFactor + '×'}
        </span>
        <span class="text-slate-200">
          {appState.activeGearConfig.focalLengthMm}mm
          {#if appState.activeCamera.cropFactor !== 1.0}
            ({appState.activeGearConfig.effectiveFocalLengthMm}mm eq)
          {/if}
        </span>
        <span>
          Safe Handheld: ≥ {SHUTTERS[appState.activeGearConfig.minApertureIdx ? 11 : 12]?.label || '1/60s'}
        </span>
        <span class="text-sky-300">
          500-Rule: ≤ {Math.min(30, Math.round(500 / Math.max(10, appState.activeGearConfig.effectiveFocalLengthMm)))}s
        </span>
      </div>

      <!-- Custom Lens Builder Drawer -->
      {#if isCustomLensActive}
        <div class="bg-obsidian/90 border border-amber-500/30 rounded-xl p-3.5 space-y-3">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <div class="flex items-center gap-2">
              <Sliders class="w-3.5 h-3.5 text-amber-400" />
              <span class="text-xs font-bold text-white font-mono uppercase">Custom Lens Builder</span>
            </div>
            <!-- Lens Type Pills -->
            <div class="flex items-center bg-camera border border-borderline rounded-lg p-0.5">
              <button
                type="button"
                onclick={() => appState.setCustomLensType('prime')}
                class={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${appState.customLens.type === 'prime' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'}`}>
                Prime
              </button>
              <button
                type="button"
                onclick={() => appState.setCustomLensType('zoom')}
                class={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${appState.customLens.type === 'zoom' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'}`}>
                Zoom
              </button>
            </div>
          </div>

          <!-- Aperture & Focal Length Range Controls -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <!-- Min Aperture (Widest) -->
            <div class="bg-obsidian border border-borderline rounded-xl px-2.5 py-2">
              <label for="customMinFStopSelect" class="block text-[10px] font-mono text-slate-400 uppercase mb-1">Max Aperture</label>
              <select
                id="customMinFStopSelect"
                value={appState.customLens.minApertureIdx}
                onchange={(e) => appState.updateCustomLensConfig('minApertureIdx', e.target.value)}
                class="w-full bg-transparent text-xs font-mono font-semibold text-white focus:outline-none cursor-pointer">
                {#each APERTURES as ap, idx}
                  <option value={idx} class="bg-obsidian">f/{ap}</option>
                {/each}
              </select>
            </div>

            <!-- Max Aperture (Smallest) -->
            <div class="bg-obsidian border border-borderline rounded-xl px-2.5 py-2">
              <label for="customMaxFStopSelect" class="block text-[10px] font-mono text-slate-400 uppercase mb-1">Min Aperture</label>
              <select
                id="customMaxFStopSelect"
                value={appState.customLens.maxApertureIdx}
                onchange={(e) => appState.updateCustomLensConfig('maxApertureIdx', e.target.value)}
                class="w-full bg-transparent text-xs font-mono font-semibold text-white focus:outline-none cursor-pointer">
                {#each APERTURES as ap, idx}
                  <option value={idx} class="bg-obsidian">f/{ap}</option>
                {/each}
              </select>
            </div>

            <!-- Min Focal Length -->
            <div class="bg-obsidian border border-borderline rounded-xl px-2.5 py-2">
              <label for="customMinMmInput" class="block text-[10px] font-mono text-slate-400 uppercase mb-1">
                {appState.customLens.type === 'prime' ? 'Focal (mm)' : 'Min mm'}
              </label>
              <input
                id="customMinMmInput"
                type="number"
                min="8"
                max="1200"
                value={appState.customLens.minMm}
                onchange={(e) => appState.updateCustomLensConfig('minMm', e.target.value)}
                class="w-full bg-transparent text-xs font-mono font-semibold text-white focus:outline-none" />
            </div>

            <!-- Max Focal Length -->
            <div class={`bg-obsidian border border-borderline rounded-xl px-2.5 py-2 ${appState.customLens.type === 'prime' ? 'opacity-40' : ''}`}>
              <label for="customMaxMmInput" class="block text-[10px] font-mono text-slate-400 uppercase mb-1">Max mm</label>
              <input
                id="customMaxMmInput"
                type="number"
                min="8"
                max="1200"
                disabled={appState.customLens.type === 'prime'}
                value={appState.customLens.maxMm}
                onchange={(e) => appState.updateCustomLensConfig('maxMm', e.target.value)}
                class="w-full bg-transparent text-xs font-mono font-semibold text-white focus:outline-none" />
            </div>
          </div>

          <!-- Current Zoom Slider (only for zooms) -->
          {#if appState.customLens.type === 'zoom' && appState.customLens.minMm !== appState.customLens.maxMm}
            <div class="pt-0.5 space-y-1">
              <div class="flex justify-between text-[11px] font-mono">
                <span class="text-slate-400">Current Focal Length:</span>
                <span class="text-amber-400 font-semibold">{appState.customLens.currentMm}mm</span>
              </div>
              <input
                type="range"
                min={appState.customLens.minMm}
                max={appState.customLens.maxMm}
                value={appState.customLens.currentMm}
                oninput={(e) => appState.updateCustomLensConfig('currentMm', e.target.value)}
                class="w-full"
                aria-label="Current Zoom Focal Length" />
            </div>
          {/if}

          <!-- Save Custom Lens to Bag Action -->
          <div class="flex items-center gap-2 pt-1 border-t border-borderline/50">
            <input
              type="text"
              bind:value={customLensNameInput}
              placeholder="Lens Name (e.g. Sigma 18–35mm f/1.8)"
              class="w-full bg-obsidian border border-borderline rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50" />
            <button
              type="button"
              onclick={handleSaveLens}
              class="shrink-0 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition flex items-center gap-1.5 shadow-sm">
              <Save class="w-3.5 h-3.5 text-slate-950" />
              <span>Save</span>
            </button>
            {#if String(appState.gear).startsWith('custom_lens_')}
              <button
                type="button"
                onclick={() => appState.deleteCurrentSavedLens()}
                class="shrink-0 px-2.5 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-semibold transition flex items-center gap-1"
                title="Delete this saved lens from bag">
                <Trash2 class="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            {/if}
          </div>
        </div>
      {/if}
    </div>
  {/if}
</section>
