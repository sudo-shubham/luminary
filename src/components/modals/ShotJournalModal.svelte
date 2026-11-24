<script>
  import { appState } from '../../lib/state.svelte.js';
  import {
    BookOpen,
    Search,
    Download,
    Trash2,
    Copy,
    Zap,
    MapPin,
    Camera,
    Plus,
    Edit3
  } from '@lucide/svelte';

  const filterStyles = [
    { id: 'all', label: 'All' },
    { id: 'portrait', label: 'Portrait' },
    { id: 'street', label: 'Street' },
    { id: 'landscape', label: 'Landscape' },
    { id: 'action', label: 'Action' },
    { id: 'night', label: 'Lowlight' },
    { id: 'astro', label: 'Astro' },
    { id: 'longexp', label: 'Silk' }
  ];

  const filteredEntries = $derived.by(() => {
    const list = appState.journal;
    const filter = appState.journalStyleFilter;
    const query = (appState.journalSearchQuery || '').toLowerCase().trim();

    return list.filter((item) => {
      if (filter !== 'all' && item.style !== filter) return false;
      if (!query) return true;
      const blob = `${item.title} ${item.environment.locationName} ${item.camera.name} ${item.lens.label} ${item.notes || ''} ${item.exposure.aperture} ${item.exposure.shutter} ${item.exposure.iso}`.toLowerCase();
      return blob.includes(query);
    });
  });

  function handlePromptEditNote(item) {
    if (typeof window === 'undefined') return;
    const note = window.prompt('Add field note for this shot:', item.notes || '');
    if (note !== null) {
      appState.updateJournalNote(item.id, note);
    }
  }
</script>

{#if appState.isShotJournalModalOpen}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-obsidian/85 backdrop-blur-md animate-in fade-in"
    role="dialog"
    aria-modal="true"
    aria-labelledby="journalModalTitle">
    <!-- Backdrop Click to Close -->
    <button
      type="button"
      class="fixed inset-0 w-full h-full cursor-default -z-10 bg-transparent border-0"
      onclick={() => { appState.isShotJournalModalOpen = false; }}
      aria-label="Close modal"></button>

    <div class="bg-camera border border-borderline rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95">
      <!-- Modal Header -->
      <div class="p-4 sm:p-5 border-b border-borderline flex items-center justify-between bg-obsidian/70 shrink-0">
        <div class="flex items-center gap-2.5">
          <BookOpen class="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <div class="flex items-center gap-2">
              <h2 id="journalModalTitle" class="text-sm sm:text-base font-bold text-white tracking-tight">Shot Journal &amp; EXIF Recipes</h2>
              <span class="bg-amber-500 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                {appState.journal.length} saved
              </span>
            </div>
            <p class="text-[11px] text-slate-400 mt-0.5">Persisted in browser storage • 1-click load back into camera dials</p>
          </div>
        </div>
        <button
          type="button"
          onclick={() => { appState.isShotJournalModalOpen = false; }}
          class="w-8 h-8 rounded-xl bg-dial hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center text-sm transition">
          ✕
        </button>
      </div>

      <!-- Action & Filter Bar -->
      <div class="p-3 sm:px-5 bg-obsidian/40 border-b border-borderline/60 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
        <!-- Search Input -->
        <div class="relative flex-1 min-w-[180px]">
          <input
            type="text"
            bind:value={appState.journalSearchQuery}
            placeholder="Search by location, style, lens, notes..."
            class="w-full bg-dial border border-borderline rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50" />
          <Search class="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
        </div>

        <!-- JSON Export & Clear All Buttons -->
        <div class="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onclick={() => appState.exportJournalJSON()}
            class="px-2.5 py-1.5 rounded-xl bg-dial hover:bg-slate-700 border border-borderline text-[11px] font-mono text-slate-200 transition flex items-center gap-1 active:scale-95 shadow-sm"
            title="Download your full Shot Journal as a JSON file">
            <Download class="w-3.5 h-3.5 text-amber-400" />
            <span>Export JSON</span>
          </button>
          {#if appState.journal.length > 0}
            <button
              type="button"
              onclick={() => appState.clearShotJournal()}
              class="px-2.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-[11px] font-mono text-rose-300 transition flex items-center gap-1 active:scale-95"
              title="Delete all saved recipes">
              <Trash2 class="w-3.5 h-3.5 text-rose-400" />
              <span>Clear</span>
            </button>
          {/if}
        </div>
      </div>

      <!-- Category Filter Tabs -->
      <div class="px-4 py-2 border-b border-borderline/40 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0 bg-camera">
        {#each filterStyles as s}
          {@const isMatch = appState.journalStyleFilter === s.id}
          <button
            type="button"
            onclick={() => { appState.journalStyleFilter = s.id; }}
            class={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition shrink-0 ${isMatch ? 'bg-amber-500 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-white bg-dial'}`}>
            {s.label}
          </button>
        {/each}
      </div>

      <!-- Cards List -->
      <div class="p-4 sm:p-5 space-y-3 overflow-y-auto flex-1">
        {#if filteredEntries.length === 0}
          <div class="py-12 text-center text-slate-500 space-y-2">
            <div class="flex items-center justify-center">
              <div class="w-12 h-12 rounded-2xl bg-camera border border-borderline flex items-center justify-center text-slate-400 shadow-inner">
                <Camera class="w-6 h-6" />
              </div>
            </div>
            <div class="text-xs font-mono font-semibold text-slate-400">No shot recipes found</div>
            <p class="text-[11px] text-slate-500 max-w-sm mx-auto">
              {appState.journal.length === 0
                ? "You haven't logged any shot recipes yet. Tap 'Log Shot' on the camera controls to capture your settings!"
                : "No recipes match your search/filter criteria."}
            </p>
          </div>
        {:else}
          {#each filteredEntries as item (item.id)}
            <div class="bg-gradient-to-b from-obsidian to-camera border border-borderline hover:border-slate-600 rounded-xl p-3.5 space-y-2.5 transition shadow-sm">
              <!-- Card Header -->
              <div class="flex flex-wrap items-center justify-between gap-1.5">
                <div class="flex items-center gap-2">
                  <span class="text-xs font-bold text-white tracking-tight">{item.title}</span>
                  <span class="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 font-semibold">{item.style}</span>
                </div>
                <span class="text-[10px] font-mono text-slate-500">{item.formattedDate}</span>
              </div>

              <!-- Big Exposure Dials Badges -->
              <div class="flex flex-wrap items-center gap-2 text-xs font-mono font-bold">
                <span class="bg-dial border border-borderline px-2.5 py-1 rounded-lg text-white tabular-nums">{item.exposure.aperture}</span>
                <span class="bg-dial border border-borderline px-2.5 py-1 rounded-lg text-sky-400 tabular-nums">{item.exposure.shutter}</span>
                <span class="bg-dial border border-borderline px-2.5 py-1 rounded-lg text-emerald-400 tabular-nums">{item.exposure.iso}</span>
                <span class="bg-dial border border-borderline px-2.5 py-1 rounded-lg text-amber-300 tabular-nums">
                  {item.lens.focalLengthMm}mm {item.lens.effectiveFocalLengthMm !== item.lens.focalLengthMm ? '(' + item.lens.effectiveFocalLengthMm + 'mm eq)' : ''}
                </span>
                <span class="text-[10px] text-slate-400 font-normal self-center ml-auto">
                  {item.exposure.ev} • {item.support}
                </span>
              </div>

              <!-- Gear & Environmental Telemetry -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[10px] font-mono text-slate-400 pt-0.5">
                <div>
                  <span class="text-slate-500">Gear:</span> {item.camera.name} • {item.lens.label}
                </div>
                <div>
                  <span class="text-slate-500">Light:</span> {item.environment.lightingBadge} (Sun {item.environment.sunAltitude}°) • {item.environment.weather}
                </div>
              </div>

              <!-- Field Notes -->
              {#if item.notes}
                <button
                  type="button"
                  onclick={() => handlePromptEditNote(item)}
                  class="w-full text-left text-[11px] text-amber-200/90 bg-obsidian/70 border border-borderline rounded-lg px-2.5 py-1.5 mt-2 font-mono flex items-start gap-1.5 cursor-pointer hover:border-amber-500/50">
                  <Edit3 class="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>{item.notes}</span>
                </button>
              {:else}
                <button
                  type="button"
                  onclick={() => handlePromptEditNote(item)}
                  class="mt-2 flex items-center gap-1.5 text-[10px] font-mono text-slate-500 hover:text-slate-300">
                  <Plus class="w-3 h-3 text-slate-400" />
                  <span>Add note...</span>
                </button>
              {/if}

              <!-- Card Actions -->
              <div class="flex items-center justify-between pt-1 border-t border-borderline/50">
                <span class="text-[9px] font-mono text-slate-500 flex items-center gap-1">
                  <MapPin class="w-2.5 h-2.5 text-slate-400 shrink-0" />
                  <span>{item.environment.locationName.split(',')[0]}</span>
                </span>
                <div class="flex items-center gap-1.5">
                  <button
                    type="button"
                    onclick={() => appState.loadJournalRecipe(item.id)}
                    class="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] font-mono transition flex items-center gap-1 shadow-sm active:scale-95"
                    title="Load these settings directly into camera dials">
                    <Zap class="w-3 h-3 text-slate-950" />
                    <span>Load Dials</span>
                  </button>
                  <button
                    type="button"
                    onclick={() => appState.copyJournalRecipe(item.id)}
                    class="px-2 py-1 rounded-lg bg-dial hover:bg-slate-700 text-slate-300 text-[10px] font-mono transition flex items-center gap-1 active:scale-95 shadow-sm"
                    title="Copy markdown recipe">
                    <Copy class="w-3 h-3 text-slate-400" />
                    <span>Copy</span>
                  </button>
                  <button
                    type="button"
                    onclick={() => appState.deleteJournalRecipe(item.id)}
                    class="px-2 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-[10px] font-mono transition flex items-center justify-center active:scale-95"
                    title="Delete recipe">
                    <Trash2 class="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          {/each}
        {/if}
      </div>
    </div>
  </div>
{/if}
