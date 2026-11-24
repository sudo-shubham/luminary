<script>
  import { appState } from '../lib/state.svelte.js';
  import { Maximize2, Zap } from '@lucide/svelte';
  import { APERTURES } from '../lib/constants.js';

  const dof = $derived(appState.dofData);
  const cam = $derived(appState.activeCamera);
  const gear = $derived(appState.activeGearConfig);
  const aperture = $derived(APERTURES[appState.exposure.apertureIdx] || 8.0);
</script>

<div class="bg-obsidian border border-borderline rounded-2xl p-3.5 sm:p-4 space-y-3.5 shadow-inner" id="cardDof">
  <!-- Card Header & Snap Hyperfocal Button -->
  <div class="flex items-center justify-between gap-2 flex-wrap">
    <div class="flex items-center gap-2">
      <Maximize2 class="w-4 h-4 text-amber-400 shrink-0" />
      <div>
        <span class="text-xs font-bold uppercase tracking-wider text-white">Depth of Field &amp; Hyperfocal</span>
        <span class="text-[10px] text-slate-400 block xs:inline xs:ml-1 font-mono">— In-Focus Zone</span>
      </div>
    </div>
    <button
      type="button"
      onclick={() => appState.snapToHyperfocal()}
      class="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-[11px] font-mono font-semibold text-amber-300 transition active:scale-95 shadow-sm"
      title="Snap subject distance to Hyperfocal distance for maximum front-to-infinity sharpness">
      <Zap class="w-3 h-3 text-amber-400" />
      <span>Snap Hyperfocal</span>
    </button>
  </div>

  <!-- Primary Numerical Readouts -->
  <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
    <div class="bg-camera/70 border border-borderline/80 rounded-xl p-2 shadow-sm">
      <div class="text-[9px] font-mono uppercase text-slate-400">Hyperfocal</div>
      <div class="text-sm sm:text-base font-mono font-bold text-amber-400 tabular-nums">
        {dof.H >= 10 ? `${dof.H.toFixed(1)} m` : `${dof.H.toFixed(2)} m`}
      </div>
    </div>
    <div class="bg-camera/70 border border-borderline/80 rounded-xl p-2 shadow-sm">
      <div class="text-[9px] font-mono uppercase text-slate-400">Near Limit</div>
      <div class="text-sm sm:text-base font-mono font-bold text-slate-200 tabular-nums">
        {dof.Dn.toFixed(2)} m
      </div>
    </div>
    <div class="bg-camera/70 border border-borderline/80 rounded-xl p-2 shadow-sm">
      <div class="text-[9px] font-mono uppercase text-slate-400">Far Limit</div>
      <div class="text-sm sm:text-base font-mono font-bold text-slate-200 tabular-nums">
        {dof.isHyperfocalOrBeyond ? '∞ (Infinity)' : (dof.Df >= 10 ? `${dof.Df.toFixed(1)} m` : `${dof.Df.toFixed(2)} m`)}
      </div>
    </div>
    <div class="bg-camera/70 border border-borderline/80 rounded-xl p-2 shadow-sm">
      <div class="text-[9px] font-mono uppercase text-slate-400">Total Depth</div>
      <div class="text-sm sm:text-base font-mono font-bold text-emerald-400 tabular-nums">
        {dof.isHyperfocalOrBeyond ? '∞ (Infinite)' : (dof.totalDof >= 10 ? `${dof.totalDof.toFixed(1)} m` : `${dof.totalDof.toFixed(2)} m`)}
      </div>
    </div>
  </div>

  <!-- Visual In-Focus Depth Bar -->
  <div class="space-y-1.5 pt-1">
    <div class="relative h-6 bg-dial border border-borderline rounded-xl overflow-hidden shadow-inner">
      <!-- In-Focus Sharp Zone Span -->
      <div
        class="absolute top-0 bottom-0 bg-gradient-to-r from-emerald-500/30 via-emerald-400/40 to-emerald-500/30 border-x border-emerald-400 transition-all duration-150"
        style={`left: ${dof.leftPct.toFixed(1)}%; width: ${dof.widthPct.toFixed(1)}%;`}>
        <div class="h-full flex items-center justify-center">
          <span class="text-[9px] font-mono font-bold text-emerald-300 drop-shadow-sm uppercase tracking-wider hidden xs:inline">
            In Focus
          </span>
        </div>
      </div>

      <!-- Subject Focus Plane Pin Marker -->
      <div
        class="absolute top-0 bottom-0 w-1 bg-amber-400 transition-all duration-150 pointer-events-none"
        style={`left: ${Math.min(99, Math.max(1, dof.pinPct)).toFixed(1)}%;`}>
        <div class="w-3 h-3 rounded-full bg-amber-400 -ml-1 -mt-0.5 shadow-md border border-slate-950"></div>
      </div>
    </div>

    <!-- Distance Scale Legend Labels -->
    <div class="flex justify-between text-[9px] font-mono text-slate-500 px-1">
      <span>0.3m</span>
      <span>1m</span>
      <span>3m</span>
      <span>10m</span>
      <span>∞</span>
    </div>
  </div>

  <!-- Subject Distance Adjustment Slider & Stepper Controls -->
  <div class="space-y-2 pt-1 border-t border-borderline/50">
    <div class="flex items-center justify-between text-xs font-mono">
      <span class="text-slate-400">Subject Focus Distance:</span>
      <span class="text-amber-400 font-bold tabular-nums">
        {dof.s.toFixed(1)} m
      </span>
    </div>

    <div class="flex items-center gap-2">
      <button
        type="button"
        onclick={() => appState.stepSubjectDistance(-0.2)}
        class="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-dial hover:bg-slate-700/80 border border-borderline text-sm font-bold text-slate-200 flex items-center justify-center shrink-0 active:scale-95 transition">-</button>

      <input
        type="range"
        min="0.3"
        max="30"
        step="0.1"
        value={dof.s}
        oninput={(e) => appState.setSubjectDistance(e.target.value)}
        class="w-full"
        aria-label="Subject Distance" />

      <button
        type="button"
        onclick={() => appState.stepSubjectDistance(0.2)}
        class="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-dial hover:bg-slate-700/80 border border-borderline text-sm font-bold text-slate-200 flex items-center justify-center shrink-0 active:scale-95 transition">+</button>
    </div>

    <!-- Quick Distance Preset Chips -->
    <div class="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 scrollbar-none">
      <span class="text-[9px] font-mono text-slate-500 uppercase shrink-0">Quick:</span>
      {#each [0.5, 1.5, 3.0, 5.0, 10.0] as dist}
        <button
          type="button"
          onclick={() => appState.setSubjectDistance(dist)}
          class={`px-2 py-0.5 rounded-md border text-[10px] font-mono transition shrink-0 active:scale-95 ${Math.abs(dof.s - dist) < 0.1 ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold' : 'bg-dial border-borderline text-slate-300 hover:text-white'}`}>
          {dist}m
        </button>
      {/each}
      <button
        type="button"
        onclick={() => appState.snapToHyperfocal()}
        class="px-2 py-0.5 rounded-md border border-amber-500/40 bg-amber-500/10 text-amber-300 text-[10px] font-mono font-semibold transition shrink-0 hover:bg-amber-500/20 active:scale-95">
        Hyperfocal ({dof.H.toFixed(1)}m)
      </button>
    </div>
  </div>

  <!-- Optical Coaching Advice Line -->
  <div class="text-[11px] text-slate-400 bg-camera/60 border border-borderline/60 rounded-xl p-2.5 leading-relaxed">
    {#if dof.isHyperfocalOrBeyond}
      <strong class="text-amber-300">Hyperfocal Depth Achieved:</strong> Focusing at <strong>{dof.s.toFixed(1)}m</strong> (≥ Hyperfocal <strong>{dof.H.toFixed(1)}m</strong>) renders everything from <strong>{dof.Dn.toFixed(1)}m</strong> all the way to <strong>Infinity (∞)</strong> tack-sharp. Maximum depth for landscapes.
    {:else}
      At <strong>f/{aperture}</strong> on <strong>{gear.focalLengthMm}mm</strong> ({cam.name}), focusing at <strong>{dof.s.toFixed(1)}m</strong> keeps subjects from <strong>{dof.Dn.toFixed(2)}m</strong> to <strong>{dof.Df.toFixed(2)}m</strong> sharp (Depth: <strong>{dof.totalDof < 1 ? `${Math.round(dof.totalDof * 100)} cm` : `${dof.totalDof.toFixed(2)} m`}</strong>). Tap <em>Snap Hyperfocal</em> to extend depth to infinity.
    {/if}
  </div>
</div>
