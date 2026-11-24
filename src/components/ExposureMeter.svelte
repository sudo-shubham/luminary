<script>
  import { appState } from '../lib/state.svelte.js';

  const m = $derived(appState.exposureMeter);

  const needleColorClass = $derived.by(() => {
    if (m.status === 'balanced') return 'bg-emerald-400';
    if (m.status === 'over') return 'bg-amber-400';
    return 'bg-rose-400';
  });

  const statusTextColorClass = $derived.by(() => {
    if (m.status === 'balanced') return 'text-emerald-400';
    if (m.status === 'over') return 'text-amber-400';
    return 'text-rose-400';
  });
</script>

<div class="bg-obsidian border border-borderline rounded-2xl p-3.5 sm:p-4 shadow-inner" id="boxExposureMeter">
  <!-- Meter Header with Auto-Balancing Readout -->
  <div class="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2">
    <span class="font-bold tracking-wider text-slate-300">EXPOSURE METER (AUTO-BALANCING)</span>
    <span class={`font-semibold tabular-nums ${statusTextColorClass}`}>
      {m.statusText}
    </span>
  </div>

  <!-- Physical Light Needle Track -->
  <div class="relative h-3 bg-dial rounded-full overflow-hidden flex items-center shadow-inner">
    <div class="w-1/2 h-full border-r border-slate-500/60"></div>
    <div
      class={`absolute top-0 bottom-0 w-3 rounded-full shadow-lg transition-all duration-200 ${needleColorClass}`}
      style={`left: calc(${m.pct}% - 6px);`}></div>
  </div>

  <!-- Exposure Stops Scale Labels -->
  <div class="flex justify-between text-[10px] font-mono text-slate-500 mt-1.5 px-0.5">
    <span>-3 EV (Too Dark)</span>
    <span>-1</span>
    <span class="text-slate-300 font-bold">0 (Ideal)</span>
    <span>+1</span>
    <span>+3 EV (Too Bright)</span>
  </div>
</div>
