<script>
  import { appState } from '../../lib/state.svelte.js';
  import { DEFAULT_CAMERAS } from '../../lib/constants.js';
  import { Camera, Trash2, Plus, ChevronDown, ChevronUp, Check, Save } from '@lucide/svelte';
  import BrandBadge from '../BrandBadge.svelte';

  let customCamDrawerOpen = $state(false);
  let customCamName = $state('');
  let customCamSensor = $state('1.0');
  let customCropFactor = $state('1.0');

  const customCameraKeys = $derived(Object.keys(appState.customCameras));

  const cameraGroups = [
    {
      title: 'Full Frame (1.0× Crop)',
      ids: ['sony_a7iv', 'canon_r5', 'nikon_z6', 'panasonic_s5']
    },
    {
      title: 'APS-C (1.5× / 1.6× Crop)',
      ids: ['fuji_xt5', 'sony_a6700', 'nikon_z50', 'canon_r7']
    },
    {
      title: 'Micro Four Thirds (2.0× Crop)',
      ids: ['lumix_gh6']
    },
    {
      title: 'Medium Format (0.79× Crop)',
      ids: ['fuji_gfx']
    },
    {
      title: 'Smartphone (3.6× Crop)',
      ids: ['phone_pro']
    }
  ];

  function handleSelectCamera(id) {
    appState.setCamera(id);
    appState.isCameraModalOpen = false;
  }

  function handleSaveCustomCamera() {
    const crop = customCamSensor === 'custom' ? parseFloat(customCropFactor) : parseFloat(customCamSensor);
    appState.saveCustomCamera(customCamName, customCamSensor === 'custom' ? `Custom (${crop}×)` : undefined, crop);
    customCamName = '';
    customCamDrawerOpen = false;
  }
</script>

{#if appState.isCameraModalOpen}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-obsidian/85 backdrop-blur-md"
    role="dialog"
    aria-modal="true"
    aria-labelledby="cameraModalTitle">
    <!-- Backdrop Click to Close -->
    <button
      type="button"
      class="fixed inset-0 w-full h-full cursor-default -z-10 bg-transparent border-0"
      onclick={() => { appState.isCameraModalOpen = false; }}
      aria-label="Close modal"></button>

    <div class="bg-camera border border-borderline rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
      <!-- Modal Header -->
      <div class="p-4 sm:p-5 border-b border-borderline flex items-center justify-between bg-obsidian/60 shrink-0">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-xl bg-dial border border-borderline flex items-center justify-center text-amber-400 shrink-0">
            <Camera class="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h2 id="cameraModalTitle" class="text-sm sm:text-base font-bold text-white tracking-tight">Camera Gear Bag &amp; Sensor Profiles</h2>
            <p class="text-[11px] text-slate-400 mt-0.5">Select a camera body to recalculate crop factor &amp; handheld safety</p>
          </div>
        </div>
        <button
          type="button"
          onclick={() => { appState.isCameraModalOpen = false; }}
          class="w-8 h-8 rounded-xl bg-dial hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center text-sm transition">
          ✕
        </button>
      </div>

      <!-- Modal Body -->
      <div class="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 text-xs">
        <!-- Custom Camera Bodies (if any) -->
        {#if customCameraKeys.length > 0}
          <div class="space-y-1.5">
            <div class="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-semibold px-1">
              Custom Camera Bodies
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {#each customCameraKeys as id}
                {@const cam = appState.customCameras[id]}
                {@const isActive = appState.camera === id}
                <div
                  role="button"
                  tabindex="0"
                  onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSelectCamera(id); }}
                  onclick={() => handleSelectCamera(id)}
                  class={`cursor-pointer p-3 rounded-xl border transition flex items-center justify-between active:scale-98 ${isActive ? 'bg-amber-500/15 border-amber-500/60 ring-1 ring-amber-500/40 text-white' : 'bg-obsidian/70 hover:bg-slate-800 border-borderline text-slate-200'}`}>
                  <div class="flex items-center gap-2.5 min-w-0 pr-2">
                    <BrandBadge brand={cam.brand || 'Custom'} size="sm" />
                    <div class="min-w-0">
                      <div class="text-xs sm:text-sm font-semibold truncate text-white">{cam.name}</div>
                      <div class="text-[10px] font-mono text-slate-400 truncate">{cam.sensorType || cam.cropFactor + '×'}</div>
                    </div>
                  </div>
                  <div class="flex items-center gap-1.5 shrink-0">
                    <span class={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${isActive ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-dial text-slate-300 border border-borderline'}`}>{cam.cropFactor}×</span>
                    <button
                      type="button"
                      onclick={(e) => { e.stopPropagation(); appState.deleteCustomCamera(id); }}
                      class="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/20 transition flex items-center justify-center"
                      title="Delete custom camera">
                      <Trash2 class="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              {/each}
            </div>
          </div>
        {/if}

        <!-- Preset Camera Groups -->
        {#each cameraGroups as grp}
          <div class="space-y-1.5">
            <div class="text-[10px] font-mono uppercase tracking-wider text-slate-400 px-1 font-semibold">
              {grp.title}
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {#each grp.ids as id}
                {@const cam = DEFAULT_CAMERAS[id]}
                {#if cam}
                  {@const isActive = appState.camera === id}
                  <button
                    type="button"
                    onclick={() => handleSelectCamera(id)}
                    class={`w-full text-left p-3 rounded-xl border transition flex items-center justify-between active:scale-98 ${isActive ? 'bg-amber-500/15 border-amber-500/60 ring-1 ring-amber-500/40 text-white' : 'bg-obsidian/70 hover:bg-slate-800 border-borderline text-slate-200 hover:text-white'}`}>
                    <div class="flex items-center gap-2.5 min-w-0 pr-2">
                      <BrandBadge brand={cam.brand} size="sm" />
                      <div class="min-w-0">
                        <div class="text-xs sm:text-sm font-semibold truncate text-white">{cam.name}</div>
                        <div class="text-[10px] font-mono text-slate-400 truncate">{cam.sensorType || cam.cropFactor + '×'}</div>
                      </div>
                    </div>
                    <div class="flex items-center gap-1.5 shrink-0">
                      <span class={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${isActive ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-dial text-slate-300 border border-borderline'}`}>{cam.cropFactor}×</span>
                      {#if isActive}
                        <Check class="w-3.5 h-3.5 text-amber-400 font-bold" />
                      {/if}
                    </div>
                  </button>
                {/if}
              {/each}
            </div>
          </div>
        {/each}

        <!-- Add Custom Camera Drawer Toggle -->
        <div class="pt-2 border-t border-borderline">
          <button
            type="button"
            onclick={() => { customCamDrawerOpen = !customCamDrawerOpen; }}
            class="w-full flex items-center justify-between p-3 rounded-xl bg-obsidian border border-borderline hover:border-amber-500/50 text-slate-300 hover:text-white transition">
            <div class="flex items-center gap-2 text-xs font-semibold">
              <Plus class="w-4 h-4 text-amber-400" />
              <span>Add Custom Camera Body</span>
            </div>
            {#if customCamDrawerOpen}
              <ChevronUp class="w-4 h-4 text-slate-400" />
            {:else}
              <ChevronDown class="w-4 h-4 text-slate-400" />
            {/if}
          </button>

          {#if customCamDrawerOpen}
            <div class="mt-3 p-3.5 bg-obsidian border border-amber-500/30 rounded-xl space-y-3">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label for="customCamNameInput" class="block text-[10px] font-mono text-slate-400 uppercase mb-1">Camera Name</label>
                  <input
                    id="customCamNameInput"
                    type="text"
                    bind:value={customCamName}
                    placeholder="e.g. Leica M11, Lumix S1H..."
                    class="w-full bg-camera border border-borderline focus:border-amber-500/60 focus:outline-none rounded-xl px-3 py-2 text-xs font-semibold text-white placeholder-slate-500" />
                </div>
                <div>
                  <label for="customCamSensorSelect" class="block text-[10px] font-mono text-slate-400 uppercase mb-1">Sensor Format</label>
                  <select
                    id="customCamSensorSelect"
                    bind:value={customCamSensor}
                    class="w-full bg-camera border border-borderline focus:border-amber-500/60 focus:outline-none rounded-xl px-3 py-2 text-xs font-semibold text-white cursor-pointer">
                    <option value="1.0" class="bg-obsidian">Full Frame (1.0×)</option>
                    <option value="1.5" class="bg-obsidian">APS-C Sony/Fuji/Nikon (1.5×)</option>
                    <option value="1.6" class="bg-obsidian">APS-C Canon (1.6×)</option>
                    <option value="2.0" class="bg-obsidian">Micro Four Thirds (2.0×)</option>
                    <option value="0.79" class="bg-obsidian">Medium Format (0.79×)</option>
                    <option value="2.7" class="bg-obsidian">1-Inch Sensor (2.7×)</option>
                    <option value="3.6" class="bg-obsidian">Smartphone (3.6×)</option>
                    <option value="custom" class="bg-obsidian">Custom Crop Factor</option>
                  </select>
                </div>
              </div>

              {#if customCamSensor === 'custom'}
                <div>
                  <label for="customCropFactorInput" class="block text-[10px] font-mono text-slate-400 uppercase mb-1">Custom Crop Factor (e.g. 1.3 for APS-H)</label>
                  <input
                    id="customCropFactorInput"
                    type="number"
                    step="0.01"
                    min="0.5"
                    max="15"
                    bind:value={customCropFactor}
                    class="w-full bg-camera border border-borderline focus:border-amber-500/60 focus:outline-none rounded-xl px-3 py-2 text-xs font-mono font-semibold text-white" />
                </div>
              {/if}

              <div class="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onclick={handleSaveCustomCamera}
                  class="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition active:scale-95 shadow-md flex items-center gap-1.5">
                  <Save class="w-3.5 h-3.5 text-slate-950" />
                  <span>Save Camera to Bag</span>
                </button>
              </div>
            </div>
          {/if}
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="p-3 sm:p-4 border-t border-borderline bg-obsidian/70 flex items-center justify-between shrink-0">
        <span class="text-[11px] text-slate-400">Settings persist automatically in local storage</span>
        <button
          type="button"
          onclick={() => { appState.isCameraModalOpen = false; }}
          class="px-4 py-2 rounded-xl bg-dial hover:bg-slate-700 text-xs font-semibold text-white border border-borderline transition active:scale-95">
          Close
        </button>
      </div>
    </div>
  </div>
{/if}
