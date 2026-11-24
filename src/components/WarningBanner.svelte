<script>
  import { appState } from '../lib/state.svelte.js';
  import { AlertTriangle } from '@lucide/svelte';
</script>

{#if appState.warnings.length > 0}
  <div class="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-xs text-rose-200 flex items-start gap-2.5 shadow-sm">
    <AlertTriangle class="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
    <span class="leading-relaxed">
      {appState.warnings.join(' ')}
    </span>
  </div>
{/if}
