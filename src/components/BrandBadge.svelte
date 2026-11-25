<script>
  import { Smartphone, Camera } from '@lucide/svelte';

  let { brand = 'Sony', size = 'md' } = $props();

  const sizeClass = $derived(
    size === 'sm'
      ? 'h-6 px-1.5 rounded-lg'
      : 'h-7 sm:h-8 px-2 rounded-xl'
  );

  const svgWidthClass = $derived(size === 'sm' ? 'h-3 w-auto' : 'h-3.5 w-auto');
</script>

{#if brand === 'Sony'}
  <span
    class={`inline-flex items-center justify-center bg-orange-500/15 border border-orange-500/40 text-orange-300 shrink-0 shadow-inner ${sizeClass}`}
    title="Sony"
    aria-hidden="true">
    <svg viewBox="0 0 56 16" class={svgWidthClass} fill="currentColor">
      <text x="28" y="12.5" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-weight="700" font-size="13" letter-spacing="1.4">SONY</text>
    </svg>
  </span>
{:else if brand === 'Canon'}
  <span
    class={`inline-flex items-center justify-center bg-red-500/15 border border-red-500/40 text-red-400 shrink-0 shadow-inner ${sizeClass}`}
    title="Canon"
    aria-hidden="true">
    <svg viewBox="0 0 60 16" class={svgWidthClass} fill="currentColor">
      <text x="30" y="12.5" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-weight="700" font-size="13" letter-spacing="0.4">Canon</text>
    </svg>
  </span>
{:else if brand === 'Nikon'}
  <span
    class={`inline-flex items-center justify-center bg-yellow-400/20 border border-yellow-400/50 text-yellow-300 shrink-0 shadow-inner relative overflow-hidden ${sizeClass}`}
    title="Nikon"
    aria-hidden="true">
    <svg viewBox="0 0 58 16" class={svgWidthClass} fill="currentColor">
      <path d="M2 14 L8 2 L11 2 L5 14 Z" opacity="0.45" />
      <text x="32" y="12.5" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-style="italic" font-weight="800" font-size="12.5" letter-spacing="0.3">Nikon</text>
    </svg>
  </span>
{:else if brand === 'Fujifilm'}
  <span
    class={`inline-flex items-center justify-center bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 shrink-0 shadow-inner ${sizeClass}`}
    title="Fujifilm"
    aria-hidden="true">
    <svg viewBox="0 0 46 16" class={svgWidthClass} fill="currentColor">
      <rect x="1" y="2" width="4" height="12" rx="1" fill="#ef4444" />
      <text x="26" y="12.5" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-weight="800" font-size="11.5" letter-spacing="0.8">FUJI</text>
    </svg>
  </span>
{:else if brand === 'Lumix'}
  <span
    class={`inline-flex items-center justify-center bg-sky-500/15 border border-sky-500/40 text-sky-300 shrink-0 shadow-inner ${sizeClass}`}
    title="Lumix"
    aria-hidden="true">
    <svg viewBox="0 0 60 16" class={svgWidthClass} fill="currentColor">
      <circle cx="6" cy="8" r="2.5" fill="#38bdf8" />
      <text x="34" y="12.2" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-weight="800" font-size="11" letter-spacing="1">LUMIX</text>
    </svg>
  </span>
{:else if brand === 'Phone'}
  <span
    class={`inline-flex items-center justify-center gap-1 bg-violet-500/15 border border-violet-500/40 text-violet-300 shrink-0 shadow-inner ${sizeClass}`}
    title="Smartphone"
    aria-hidden="true">
    <Smartphone class={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
  </span>
{:else}
  <span
    class={`inline-flex items-center justify-center bg-amber-500/15 border border-amber-500/40 text-amber-300 shrink-0 shadow-inner ${sizeClass}`}
    title={brand || 'Custom Camera'}
    aria-hidden="true">
    <Camera class={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
  </span>
{/if}
