<script>
  import { appState } from '../../lib/state.svelte.js';
  import { CAMERA_CONTROL_GUIDE } from '../../lib/constants.js';
  import { HelpCircle } from '@lucide/svelte';

  const cam = $derived(appState.activeCamera);

  const guide = $derived(
    CAMERA_CONTROL_GUIDE[appState.camera] || {
      modeDial: 'Set camera Mode Dial to A (Aperture Priority), S/Tv (Shutter Priority), or M (Manual)',
      aperture: {
        location: 'Front Dial or Lens Aperture Ring',
        detail: 'Rotate the front command dial under your index finger or turn the physical ring on the lens barrel.'
      },
      shutter: {
        location: 'Rear Main Command Dial',
        detail: 'Rotate the rear control dial on the back or top plate under your thumb.'
      },
      iso: {
        location: 'ISO Button or Quick / Function (Q/Fn) Menu',
        detail: 'Press the physical ISO button near the shutter release and turn the dial, or adjust in the Q/Fn quick menu.'
      }
    }
  );
</script>

{#if appState.isCameraDialModalOpen}
  <div
    class="fixed inset-0 z-50 bg-obsidian/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
    role="dialog"
    aria-modal="true"
    aria-labelledby="dialModalTitle">
    <!-- Backdrop Click to Close -->
    <button
      type="button"
      class="fixed inset-0 w-full h-full cursor-default -z-10 bg-transparent border-0"
      onclick={() => { appState.isCameraDialModalOpen = false; }}
      aria-label="Close modal"></button>

    <div class="bg-camera border border-amber-500/40 rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
      <!-- Modal Header -->
      <div class="p-4 sm:p-5 border-b border-borderline flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <HelpCircle class="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <h3 id="dialModalTitle" class="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              Hardware Control Guide
            </h3>
            <p class="text-xs text-amber-400 font-mono">{cam.name}</p>
          </div>
        </div>
        <button
          type="button"
          onclick={() => { appState.isCameraDialModalOpen = false; }}
          class="text-slate-400 hover:text-white p-1 rounded-lg">✕</button>
      </div>

      <!-- Modal Body -->
      <div class="p-4 sm:p-5 space-y-3.5 overflow-y-auto flex-1 text-xs">
        <div class="bg-obsidian/80 border border-borderline rounded-xl p-3 space-y-1">
          <div class="text-[10px] font-mono text-slate-400 uppercase font-semibold">Recommended Shooting Mode</div>
          <div class="text-white font-medium">{guide.modeDial}</div>
        </div>

        <div class="bg-obsidian/80 border border-amber-500/30 rounded-xl p-3 space-y-1">
          <div class="text-[10px] font-mono text-amber-400 uppercase font-semibold flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-amber-400"></span>
            <span>Aperture (f-stop / DOF)</span>
          </div>
          <div class="text-slate-200 leading-relaxed">
            <strong>{guide.aperture.location}</strong> — {guide.aperture.detail}
          </div>
        </div>

        <div class="bg-obsidian/80 border border-sky-500/30 rounded-xl p-3 space-y-1">
          <div class="text-[10px] font-mono text-sky-400 uppercase font-semibold flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-sky-400"></span>
            <span>Shutter Speed (Motion Blur)</span>
          </div>
          <div class="text-slate-200 leading-relaxed">
            <strong>{guide.shutter.location}</strong> — {guide.shutter.detail}
          </div>
        </div>

        <div class="bg-obsidian/80 border border-emerald-500/30 rounded-xl p-3 space-y-1">
          <div class="text-[10px] font-mono text-emerald-400 uppercase font-semibold flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>ISO (Sensor Sensitivity)</span>
          </div>
          <div class="text-slate-200 leading-relaxed">
            <strong>{guide.iso.location}</strong> — {guide.iso.detail}
          </div>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="p-3.5 sm:p-4 border-t border-borderline bg-obsidian/60 flex items-center justify-between gap-2">
        <button
          type="button"
          onclick={() => { appState.isCameraDialModalOpen = false; appState.isCameraModalOpen = true; }}
          class="text-xs font-semibold text-amber-300 hover:underline">
          Switch Camera Body ▾
        </button>
        <button
          type="button"
          onclick={() => { appState.isCameraDialModalOpen = false; }}
          class="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition active:scale-95 shadow-md">
          Got It
        </button>
      </div>
    </div>
  </div>
{/if}
