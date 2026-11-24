<script>
  import { appState } from '../lib/state.svelte.js';
  import { Copy, PlusCircle } from '@lucide/svelte';
</script>

<section class="bg-camera border border-borderline rounded-2xl p-3.5 sm:p-4 shadow-lg space-y-3">
  <!-- Secondary Optical Parameter Cards -->
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
    <!-- White Balance -->
    <div class="bg-obsidian border border-borderline rounded-xl p-3 flex flex-col justify-between shadow-inner">
      <span class="text-[10px] font-mono uppercase text-slate-400 font-semibold">White Balance</span>
      <div class="text-xs sm:text-sm font-mono font-bold text-white mt-1 tabular-nums">
        {appState.exposure.wbKelvin}K
      </div>
      <span class="text-[10px] text-amber-400 font-medium truncate mt-0.5">
        {appState.exposure.wbLabel}
      </span>
    </div>

    <!-- Focus Mode -->
    <div class="bg-obsidian border border-borderline rounded-xl p-3 flex flex-col justify-between shadow-inner">
      <span class="text-[10px] font-mono uppercase text-slate-400 font-semibold">Focus Strategy</span>
      <div class="text-xs sm:text-sm font-mono font-bold text-white mt-1 truncate">
        {appState.exposure.focusMode}
      </div>
      <span class="text-[10px] text-slate-400 truncate mt-0.5">
        Recommended for {appState.style}
      </span>
    </div>

    <!-- Metering / Exposure Compensation -->
    <div class="bg-obsidian border border-borderline rounded-xl p-3 flex flex-col justify-between shadow-inner">
      <span class="text-[10px] font-mono uppercase text-slate-400 font-semibold">Metering / EV Comp</span>
      <div class="text-xs sm:text-sm font-mono font-bold text-white mt-1 truncate tabular-nums">
        {appState.exposure.metering}
      </div>
      <span class="text-[10px] text-slate-400 truncate mt-0.5">
        Compensates light angle
      </span>
    </div>
  </div>

  <!-- Shot Recipe Action Buttons -->
  <div class="flex items-center justify-between gap-2 pt-1 border-t border-borderline/50">
    <!-- Copy Recipe to Clipboard -->
    <button
      type="button"
      onclick={() => appState.copyRecipeToClipboard()}
      class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-dial hover:bg-slate-700/80 border border-borderline text-xs font-semibold text-slate-200 transition active:scale-95 shadow-sm"
      title="Copy exposure settings and shot recipe as plain text">
      <Copy class="w-3.5 h-3.5 text-slate-400" />
      <span>Copy Recipe</span>
    </button>

    <!-- Log Shot to Journal -->
    <button
      type="button"
      onclick={() => appState.logCurrentShot()}
      class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition active:scale-95 shadow-md"
      title="Save current exposure dials and telemetry into your personal Shot Journal">
      <PlusCircle class="w-3.5 h-3.5 text-slate-950" />
      <span>Log Shot</span>
    </button>
  </div>
</section>
