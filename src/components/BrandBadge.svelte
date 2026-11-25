<script>
  import { Smartphone } from '@lucide/svelte';

  let { brand = 'Sony', size = 'md' } = $props();

  const brandStyles = {
    Sony:     { code: 'S', bg: 'bg-orange-500/15 border-orange-500/40 text-orange-400' },
    Canon:    { code: 'C', bg: 'bg-red-500/15 border-red-500/40 text-red-400' },
    Nikon:    { code: 'N', bg: 'bg-yellow-500/15 border-yellow-500/40 text-yellow-400' },
    Fujifilm: { code: 'F', bg: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400' },
    Lumix:    { code: 'L', bg: 'bg-sky-500/15 border-sky-500/40 text-sky-400' },
    Phone:    { code: 'P', bg: 'bg-violet-500/15 border-violet-500/40 text-violet-400' }
  };

  const style = $derived(brandStyles[brand] || { code: brand?.slice(0, 1).toUpperCase() || 'C', bg: 'bg-amber-500/15 border-amber-500/40 text-amber-400' });
  const sizeClass = $derived(size === 'sm' ? 'w-6 h-6 text-[11px] rounded-lg' : 'w-7 h-7 sm:w-8 sm:h-8 text-xs rounded-xl');
</script>

<span
  class={`inline-flex items-center justify-center border font-mono font-extrabold tracking-tight shrink-0 shadow-inner ${sizeClass} ${style.bg}`}
  title={`${brand} Camera System`}
  aria-hidden="true">
  {#if brand === 'Phone'}
    <Smartphone class={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
  {:else}
    {style.code}
  {/if}
</span>
