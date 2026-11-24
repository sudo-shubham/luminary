<script>
  import { appState } from '../lib/state.svelte.js';
  import { Lock, Unlock, RotateCcw } from '@lucide/svelte';

  const subLabels = {
    M: 'Manual',
    A: 'Ap Prio',
    S: 'Sh Prio',
    P: 'Program',
    AUTO: 'Auto'
  };

  const allManual = $derived(
    appState.locked.aperture && appState.locked.shutter && appState.locked.iso
  );

  const activeModeDetails = $derived.by(() => {
    const mId = appState.shootingMode;
    const modeObj = appState.activeModeObj;
    if (mId === 'M') {
      return { title: 'Manual Exposure', desc: 'User controls Aperture, Shutter & ISO' };
    } else if (mId === 'A') {
      return { title: modeObj ? modeObj.fullName : 'Aperture Priority (A)', desc: 'Aperture Manual, Shutter Auto' };
    } else if (mId === 'S') {
      return { title: modeObj ? modeObj.fullName : 'Shutter Priority (S)', desc: 'Shutter Manual, Aperture Auto' };
    } else if (mId === 'P') {
      return { title: modeObj ? modeObj.fullName : 'Program AE (P)', desc: 'Reciprocal pairing, dial shift enabled' };
    } else if (mId === 'AUTO') {
      return { title: modeObj ? modeObj.fullName : 'Auto Mode', desc: 'Camera meters all exposure parameters' };
    }
    return { title: 'Custom Mode', desc: 'Manual exposure configuration' };
  });
</script>

<section class="bg-camera border border-borderline rounded-2xl p-3.5 sm:p-4 shadow-lg space-y-3">
  <!-- Mode Dial Header & Active Mode Description -->
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-borderline/60 pb-2.5">
    <!-- Brand Badge & Physical Dial Mode -->
    <div class="flex items-center gap-2">
      <span class="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">Camera Mode Dial</span>
      <span class="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-dial border border-borderline text-slate-400 shrink-0">
        {appState.activeCamera.brand || appState.brandModes.brandName}
      </span>
      <button
        type="button"
        onclick={() => { appState.triggerHaptic('click'); appState.isCameraDialModalOpen = true; }}
        class="text-[10px] font-mono text-amber-500 dark:text-amber-400 hover:underline flex items-center gap-1 font-semibold">
        <span>Hardware Guide ↗</span>
      </button>
    </div>

    <!-- Active Mode Multiline Title & Description (Won't get cut off on phones) -->
    <div class="text-[11px] font-mono text-amber-700 dark:text-amber-400 font-semibold leading-snug sm:text-right break-words whitespace-normal">
      <span class="block sm:inline font-bold">{activeModeDetails.title}</span>
      <span class="hidden sm:inline opacity-70"> — </span>
      <span class="block sm:inline font-normal sm:font-medium text-[10px] sm:text-[11px] opacity-90">{activeModeDetails.desc}</span>
    </div>
  </div>

  <!-- Physical Camera Dial Buttons (Canon Av/Tv/A+, Sony A/S/AUTO, Nikon, Lumix iA, Fuji, Phone) -->
  <div class="grid grid-cols-5 gap-1 sm:gap-1.5 p-1 bg-dial/80 rounded-xl border border-borderline">
    {#each appState.brandModes.modes as m (m.id)}
      {@const isActive = m.id === appState.shootingMode}
      <button
        type="button"
        onclick={() => appState.setShootingMode(m.id)}
        class={`px-1 sm:px-1.5 py-1.5 sm:py-2 rounded-xl text-center transition flex flex-col items-center justify-center active:scale-95 ${isActive ? 'bg-amber-500 text-slate-950 font-bold shadow-md ring-1 ring-amber-400' : 'text-slate-300 hover:text-white hover:bg-camera/60'}`}
        title={`${m.fullName} — ${m.desc}`}
        aria-pressed={isActive}>
        <span class="text-xs sm:text-sm font-mono font-black tracking-tight leading-none">{m.label}</span>
        <span class="text-[8px] font-mono uppercase tracking-tighter opacity-80 mt-0.5 hidden xs:inline">
          {subLabels[m.id] || m.id}
        </span>
      </button>
    {/each}
  </div>

  <!-- Master Lock / Auto Action Bar -->
  <div class="flex items-center justify-between gap-2 pt-0.5">
    <div class="flex items-center gap-2">
      <!-- Master All Manual / All Auto Toggle -->
      <button
        type="button"
        onclick={() => appState.toggleLockAll()}
        class={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-semibold transition active:scale-95 shadow-sm ${allManual ? 'bg-amber-500/20 border-amber-500/50 text-amber-300' : 'bg-dial hover:bg-slate-700/80 border-borderline text-slate-200'}`}
        title={allManual ? 'Switch all exposure dials to Auto (Program P)' : 'Switch all exposure dials to Manual (Manual M)'}>
        {#if allManual}
          <Lock class="w-3.5 h-3.5 text-amber-300" />
          <span>All Auto</span>
        {:else}
          <Unlock class="w-3.5 h-3.5 text-slate-400" />
          <span>All Manual</span>
        {/if}
      </button>

      <!-- Reset Simulation Overrides -->
      {#if appState.exposure.manualOverride}
        <button
          type="button"
          onclick={() => appState.resetExposureOverrides()}
          class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-xs font-mono text-amber-300 hover:bg-amber-500/25 transition active:scale-95">
          <RotateCcw class="w-3 h-3 text-amber-400" />
          <span>Reset Dials</span>
        </button>
      {/if}
    </div>

    <!-- Active Mode Indicator Badge -->
    <div class="text-[10px] font-mono text-slate-400 text-right">
      Active: <span class="text-amber-400 font-bold">{appState.activeModeObj.label}</span>
    </div>
  </div>
</section>
