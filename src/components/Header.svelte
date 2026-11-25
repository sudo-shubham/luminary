<script>
  import { appState } from '../lib/state.svelte.js';
  import { Sun, Moon, BookOpen, Download } from '@lucide/svelte';

  let { onPromptInstall, isInstallable } = $props();
</script>

<header class="frosted-header sticky top-0 z-40 transition-colors">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
    <!-- Brand Title & Logo -->
    <div class="flex items-center gap-2.5 min-w-0">
      <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0">
        <svg class="w-4 h-4 text-slate-950" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9"></circle>
          <path d="M14.31 8l5.74 9.94M9.69 8h11.48M7.38 12l5.74-9.94M9.69 16L3.95 6.06M14.31 16H2.83M16.62 12l-5.74 9.94"></path>
        </svg>
      </div>
      <div class="min-w-0">
        <div class="flex items-center gap-1.5">
          <span class="font-bold tracking-tight text-white text-base sm:text-lg leading-none">Luminary</span>
          <span class="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold">v1.5.3</span>
        </div>
        <div class="text-[9px] sm:text-[10px] font-mono tracking-widest text-slate-400 uppercase truncate">
          Photography Assistant &amp; Solar Ephemeris
        </div>
      </div>
    </div>

    <!-- Live Wall Clock & Header Utility Actions -->
    <div class="flex items-center gap-2 sm:gap-3 shrink-0">
      <!-- Live Wall Clock -->
      <div class="bg-obsidian/80 border border-borderline rounded-xl px-2.5 sm:px-3 py-1 text-right shadow-inner flex flex-col justify-center">
        <div class="text-[11px] sm:text-xs font-mono font-bold text-white tracking-tight tabular-nums">
          {appState.liveWallClock}
        </div>
        <div class="text-[8px] font-mono text-slate-400 uppercase hidden md:block">
          Local Time
        </div>
      </div>

      <!-- Theme Switcher (Daylight / Cockpit Dark Mode) -->
      <button
        type="button"
        onclick={() => appState.toggleTheme()}
        class="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-dial hover:bg-slate-700/80 border border-borderline flex items-center justify-center transition active:scale-95 shadow-sm text-slate-400 hover:text-amber-300"
        title={appState.theme === 'dark' ? 'Switch to Daylight Mode (High Contrast)' : 'Switch to Dark Mode (Cockpit Obsidian)'}
        aria-label="Toggle visual theme">
        {#if appState.theme === 'dark'}
          <Sun class="w-4 h-4 text-amber-400" />
        {:else}
          <Moon class="w-4 h-4 text-slate-700" />
        {/if}
      </button>

      <!-- Shot Journal Modal Trigger -->
      <button
        type="button"
        onclick={() => { appState.triggerHaptic('click'); appState.isShotJournalModalOpen = true; }}
        class="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-dial hover:bg-slate-700/80 border border-borderline text-xs font-semibold text-slate-200 transition active:scale-95 shadow-sm"
        title="Open Shot Journal & EXIF Recipes">
        <BookOpen class="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span class="hidden sm:inline">Journal</span>
        <span class="bg-amber-500 text-slate-950 text-[10px] font-bold px-1.5 py-0.2 rounded-full font-mono">
          {appState.journal.length}
        </span>
      </button>

      <!-- PWA Install Prompt Button (conditionally visible) -->
      {#if isInstallable}
        <button
          type="button"
          onclick={onPromptInstall}
          class="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-xs font-semibold text-amber-300 transition active:scale-95 shadow-sm"
          title="Install Luminary as native PWA App">
          <Download class="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span class="hidden sm:inline">Install App</span>
        </button>
      {/if}
    </div>
  </div>
</header>
