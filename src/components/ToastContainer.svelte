<script>
  import { appState } from '../lib/state.svelte.js';
</script>

<div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none max-w-xs sm:max-w-sm">
  {#each appState.toasts as toast (toast.id)}
    <div
      class="pointer-events-auto bg-dial/95 border border-amber-500/40 text-slate-100 text-xs font-medium px-4 py-2.5 rounded-xl shadow-2xl backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-2">
      {toast.message}
    </div>
  {/each}
</div>
