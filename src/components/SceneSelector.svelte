<script>
  import { appState } from '../lib/state.svelte.js';
  import {
    User,
    Footprints,
    Mountain,
    Zap,
    Moon,
    Sparkles,
    Waves
  } from '@lucide/svelte';

  const scenes = [
    { id: 'portrait', label: 'Portrait', icon: User, tip: 'Shallow DoF & creamy background blur' },
    { id: 'street', label: 'Street', icon: Footprints, tip: 'Medium DoF & candid motion capture' },
    { id: 'landscape', label: 'Landscape', icon: Mountain, tip: 'Deep DoF from foreground to horizon' },
    { id: 'action', label: 'Action', icon: Zap, tip: 'Fast shutter speed freezing rapid motion' },
    { id: 'night', label: 'Lowlight', icon: Moon, tip: 'Balanced low light exposure with managed noise' },
    { id: 'astro', label: 'Astro', icon: Sparkles, tip: 'Dark sky 500-rule pin-sharp star fields' },
    { id: 'longexp', label: 'Silk', icon: Waves, tip: 'Long exposure silky waterfalls & light trails' }
  ];
</script>

<section class="space-y-1.5">
  <div class="flex items-center justify-between px-1">
    <span class="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">Scene Priority Selector</span>
    <span class="text-[10px] font-mono text-slate-500 hidden sm:inline">Optimizes exposure targets for subject</span>
  </div>

  <div class="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-7 gap-1.5">
    {#each scenes as s (s.id)}
      {@const IconComponent = s.icon}
      {@const isActive = appState.style === s.id}
      <button
        type="button"
        onclick={() => appState.setStyle(s.id)}
        class={`px-2 py-2 rounded-xl border text-xs font-semibold transition flex items-center justify-center gap-1.5 active:scale-95 ${isActive ? 'bg-amber-500/20 border-amber-500 text-amber-500 dark:text-amber-300 shadow-inner' : 'bg-camera border-borderline text-slate-600 dark:text-slate-300 hover:bg-dial'}`}
        title={s.tip}
        aria-pressed={isActive}>
        <IconComponent class="w-3.5 h-3.5 shrink-0" />
        <span class="truncate">{s.label}</span>
      </button>
    {/each}
  </div>
</section>
