<script>
  import { appState } from '../lib/state.svelte.js';
  import { AlertTriangle, CloudRain } from '@lucide/svelte';
</script>

{#if appState.warnings.length > 0}
  <div class="space-y-2">
    {#each appState.warnings as warn}
      <div class={`p-3 rounded-xl border text-xs flex items-start gap-2.5 shadow-sm leading-relaxed ${warn.includes('Rain') ? 'bg-sky-500/15 border-sky-500/40 text-sky-200' : 'bg-rose-500/15 border-rose-500/40 text-rose-200'}`}>
        {#if warn.includes('Rain')}
          <CloudRain class="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
        {:else}
          <AlertTriangle class="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
        {/if}
        <span>{warn}</span>
      </div>
    {/each}
  </div>
{/if}
