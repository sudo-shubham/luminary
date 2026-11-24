<script>
  import { appState } from '../lib/state.svelte.js';
  import { APERTURES, SHUTTERS, ISOS, CAMERA_CONTROL_GUIDE } from '../lib/constants.js';
  import { HelpCircle } from '@lucide/svelte';

  const N = $derived(APERTURES[appState.exposure.apertureIdx] || 8.0);
  const shutterObj = $derived(SHUTTERS[appState.exposure.shutterIdx] || SHUTTERS[12]);
  const isoVal = $derived(ISOS[appState.exposure.isoIdx] || 100);

  const apertureDesc = $derived(
    N <= 2.8 ? 'Soft blurred background' : N <= 5.6 ? 'Balanced sharpness' : 'Sharp front-to-back'
  );

  const shutterDesc = $derived(
    shutterObj.sec >= 0.5
      ? 'Tripod required (blur)'
      : shutterObj.sec > (1 / 60)
      ? 'Hold very steady'
      : shutterObj.sec <= (1 / 500)
      ? 'Freezes fast action'
      : 'Safe for handheld'
  );

  const isoDesc = $derived(
    isoVal <= 400 ? 'Cleanest quality' : isoVal <= 1600 ? 'Slight grain, usable' : 'High grain (low light)'
  );

  const activeHardwareGuide = $derived.by(() => {
    return CAMERA_CONTROL_GUIDE[appState.camera] || {
      modeDial: 'Set camera Mode Dial to A, S, or M',
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
    };
  });
</script>

<section class="space-y-3">
  <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
    <!-- ==================== APERTURE CARD ==================== -->
    <div
      class={`bg-gradient-to-b from-obsidian to-camera border rounded-2xl p-3.5 sm:p-4 flex flex-col justify-between shadow-inner transition space-y-2.5 ${appState.locked.aperture ? 'border-amber-500/50 ring-1 ring-amber-500/20' : 'border-borderline'}`}>
      <div>
        <!-- Card Header with Hint, Help Button and Dual Auto/Manual Toggle -->
        <div class="flex items-center justify-between gap-1.5 flex-wrap">
          <div class="flex items-center gap-1.5 min-w-0">
            <span class="text-xs font-mono font-bold tracking-wider text-slate-300 uppercase">Aperture</span>
            <span class="text-[9px] font-mono text-amber-500 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded font-semibold truncate" title="Depth of Field">
              {appState.activeGearConfig.fixedAperture ? 'Fixed' : 'DOF'}
            </span>
            <!-- Help Icon Button -->
            <button
              type="button"
              onclick={() => { appState.camGuideVisible.aperture = !appState.camGuideVisible.aperture; }}
              class="w-6 h-6 rounded-lg border border-borderline hover:border-amber-500/50 text-slate-400 hover:text-amber-300 text-xs flex items-center justify-center transition active:scale-95 shrink-0"
              title="Hardware Help: Where to change Aperture on your camera">
              <HelpCircle class="w-3.5 h-3.5" />
            </button>
          </div>

          <!-- Dual Auto/Manual Visible Segmented Pill -->
          <div class="inline-flex p-0.5 rounded-lg bg-dial/90 border border-borderline text-[9px] font-mono select-none shrink-0 items-center shadow-inner" role="group" aria-label="Aperture Mode Toggle">
            <button
              type="button"
              onclick={() => appState.setParamMode('aperture', 'auto')}
              class={`px-1.5 py-0.5 rounded-md transition ${!appState.locked.aperture ? 'font-bold shadow-sm bg-slate-200 text-slate-900 dark:bg-slate-700 dark:text-white' : 'font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'}`}
              title="Auto Aperture: Camera meters f-number"
              aria-pressed={!appState.locked.aperture}>
              Auto
            </button>
            <button
              type="button"
              onclick={() => appState.setParamMode('aperture', 'manual')}
              class={`px-1.5 py-0.5 rounded-md transition ${appState.locked.aperture ? 'font-bold shadow-sm bg-amber-500 text-slate-950' : 'font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'}`}
              title="Manual Aperture: User controls f-number"
              aria-pressed={appState.locked.aperture}>
              Manual
            </button>
          </div>
        </div>

        <!-- Big Readout -->
        <div class="text-3xl sm:text-4xl font-mono font-bold text-white my-2 tracking-tight tabular-nums">
          f/{N}
        </div>

        <!-- Inline Hardware Camera Control Help Drawer -->
        {#if appState.camGuideVisible.aperture}
          <div class="my-2 bg-obsidian border border-amber-500/40 rounded-xl p-2.5 text-[11px] space-y-1">
            <div class="flex items-center justify-between text-amber-300 font-bold">
              <span>{appState.activeCamera.name}: {activeHardwareGuide.aperture.location}</span>
              <button type="button" onclick={() => { appState.camGuideVisible.aperture = false; }} class="text-slate-400 hover:text-white">✕</button>
            </div>
            <p class="text-slate-300 text-[10px] leading-relaxed">
              {activeHardwareGuide.aperture.detail}
            </p>
          </div>
        {/if}

        <!-- Tactile Slider & Stepper Controls -->
        <div class="flex items-center gap-2 pt-1">
          <button
            type="button"
            disabled={appState.activeGearConfig.fixedAperture}
            onclick={() => appState.stepExposure('aperture', -1)}
            class={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-dial hover:bg-slate-700/80 border border-borderline text-sm font-bold text-slate-200 flex items-center justify-center shrink-0 active:scale-95 transition ${appState.activeGearConfig.fixedAperture ? 'opacity-40 cursor-not-allowed' : ''}`}>-</button>

          <input
            type="range"
            min={appState.activeGearConfig.minApertureIdx}
            max={appState.activeGearConfig.maxApertureIdx}
            disabled={appState.activeGearConfig.fixedAperture}
            value={appState.exposure.apertureIdx}
            oninput={(e) => appState.onManualExposureChange('aperture', e.target.value)}
            class="w-full"
            aria-label="Aperture" />

          <button
            type="button"
            disabled={appState.activeGearConfig.fixedAperture}
            onclick={() => appState.stepExposure('aperture', 1)}
            class={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-dial hover:bg-slate-700/80 border border-borderline text-sm font-bold text-slate-200 flex items-center justify-center shrink-0 active:scale-95 transition ${appState.activeGearConfig.fixedAperture ? 'opacity-40 cursor-not-allowed' : ''}`}>+</button>
        </div>
      </div>

      <!-- Explanatory line after the dial (uncropped) -->
      <div class="pt-2 border-t border-borderline/50 text-[11px] sm:text-xs text-slate-400 leading-snug min-h-[24px] flex items-center">
        <span>{apertureDesc}</span>
      </div>
    </div>

    <!-- ==================== SHUTTER CARD ==================== -->
    <div
      class={`bg-gradient-to-b from-obsidian to-camera border rounded-2xl p-3.5 sm:p-4 flex flex-col justify-between shadow-inner transition space-y-2.5 ${appState.locked.shutter ? 'border-sky-500/50 ring-1 ring-sky-500/20' : 'border-borderline'}`}>
      <div>
        <!-- Card Header with Hint, Help Button and Dual Auto/Manual Toggle -->
        <div class="flex items-center justify-between gap-1.5 flex-wrap">
          <div class="flex items-center gap-1.5 min-w-0">
            <span class="text-xs font-mono font-bold tracking-wider text-slate-300 uppercase">Shutter</span>
            <span class="text-[9px] font-mono text-sky-500 dark:text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded font-semibold truncate" title="Motion Blur / Freeze">Motion</span>
            <!-- Help Icon Button -->
            <button
              type="button"
              onclick={() => { appState.camGuideVisible.shutter = !appState.camGuideVisible.shutter; }}
              class="w-6 h-6 rounded-lg border border-borderline hover:border-sky-500/50 text-slate-400 hover:text-sky-300 text-xs flex items-center justify-center transition active:scale-95 shrink-0"
              title="Hardware Help: Where to change Shutter Speed on your camera">
              <HelpCircle class="w-3.5 h-3.5" />
            </button>
          </div>

          <!-- Dual Auto/Manual Visible Segmented Pill -->
          <div class="inline-flex p-0.5 rounded-lg bg-dial/90 border border-borderline text-[9px] font-mono select-none shrink-0 items-center shadow-inner" role="group" aria-label="Shutter Mode Toggle">
            <button
              type="button"
              onclick={() => appState.setParamMode('shutter', 'auto')}
              class={`px-1.5 py-0.5 rounded-md transition ${!appState.locked.shutter ? 'font-bold shadow-sm bg-slate-200 text-slate-900 dark:bg-slate-700 dark:text-white' : 'font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'}`}
              title="Auto Shutter: Camera meters exposure time"
              aria-pressed={!appState.locked.shutter}>
              Auto
            </button>
            <button
              type="button"
              onclick={() => appState.setParamMode('shutter', 'manual')}
              class={`px-1.5 py-0.5 rounded-md transition ${appState.locked.shutter ? 'font-bold shadow-sm bg-sky-500 text-slate-950' : 'font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'}`}
              title="Manual Shutter: User controls exposure time"
              aria-pressed={appState.locked.shutter}>
              Manual
            </button>
          </div>
        </div>

        <!-- Big Readout -->
        <div class="text-3xl sm:text-4xl font-mono font-bold text-white my-2 tracking-tight tabular-nums">
          {shutterObj.label}
        </div>

        <!-- Inline Hardware Camera Control Help Drawer -->
        {#if appState.camGuideVisible.shutter}
          <div class="my-2 bg-obsidian border border-sky-500/40 rounded-xl p-2.5 text-[11px] space-y-1">
            <div class="flex items-center justify-between text-sky-300 font-bold">
              <span>{appState.activeCamera.name}: {activeHardwareGuide.shutter.location}</span>
              <button type="button" onclick={() => { appState.camGuideVisible.shutter = false; }} class="text-slate-400 hover:text-white">✕</button>
            </div>
            <p class="text-slate-300 text-[10px] leading-relaxed">
              {activeHardwareGuide.shutter.detail}
            </p>
          </div>
        {/if}

        <!-- Tactile Slider & Stepper Controls -->
        <div class="flex items-center gap-2 pt-1">
          <button
            type="button"
            onclick={() => appState.stepExposure('shutter', -1)}
            class="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-dial hover:bg-slate-700/80 border border-borderline text-sm font-bold text-slate-200 flex items-center justify-center shrink-0 active:scale-95 transition">-</button>

          <input
            type="range"
            min="0"
            max={SHUTTERS.length - 1}
            value={appState.exposure.shutterIdx}
            oninput={(e) => appState.onManualExposureChange('shutter', e.target.value)}
            class="w-full"
            aria-label="Shutter Speed" />

          <button
            type="button"
            onclick={() => appState.stepExposure('shutter', 1)}
            class="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-dial hover:bg-slate-700/80 border border-borderline text-sm font-bold text-slate-200 flex items-center justify-center shrink-0 active:scale-95 transition">+</button>
        </div>
      </div>

      <!-- Explanatory line after the dial (uncropped) -->
      <div class="pt-2 border-t border-borderline/50 text-[11px] sm:text-xs text-slate-400 leading-snug min-h-[24px] flex items-center">
        <span>{shutterDesc}</span>
      </div>
    </div>

    <!-- ==================== ISO CARD ==================== -->
    <div
      class={`bg-gradient-to-b from-obsidian to-camera border rounded-2xl p-3.5 sm:p-4 flex flex-col justify-between shadow-inner transition space-y-2.5 ${appState.locked.iso ? 'border-emerald-500/50 ring-1 ring-emerald-500/20' : 'border-borderline'}`}>
      <div>
        <!-- Card Header with Hint, Help Button and Dual Auto/Manual Toggle -->
        <div class="flex items-center justify-between gap-1.5 flex-wrap">
          <div class="flex items-center gap-1.5 min-w-0">
            <span class="text-xs font-mono font-bold tracking-wider text-slate-300 uppercase">ISO</span>
            <span class="text-[9px] font-mono text-emerald-500 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded font-semibold truncate" title="Sensor Gain">Gain</span>
            <!-- Help Icon Button -->
            <button
              type="button"
              onclick={() => { appState.camGuideVisible.iso = !appState.camGuideVisible.iso; }}
              class="w-6 h-6 rounded-lg border border-borderline hover:border-emerald-500/50 text-slate-400 hover:text-emerald-300 text-xs flex items-center justify-center transition active:scale-95 shrink-0"
              title="Hardware Help: Where to change ISO on your camera">
              <HelpCircle class="w-3.5 h-3.5" />
            </button>
          </div>

          <!-- Dual Auto/Manual Visible Segmented Pill -->
          <div class="inline-flex p-0.5 rounded-lg bg-dial/90 border border-borderline text-[9px] font-mono select-none shrink-0 items-center shadow-inner" role="group" aria-label="ISO Mode Toggle">
            <button
              type="button"
              onclick={() => appState.setParamMode('iso', 'auto')}
              class={`px-1.5 py-0.5 rounded-md transition ${!appState.locked.iso ? 'font-bold shadow-sm bg-slate-200 text-slate-900 dark:bg-slate-700 dark:text-white' : 'font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'}`}
              title="Auto ISO: Camera meters sensor gain"
              aria-pressed={!appState.locked.iso}>
              Auto
            </button>
            <button
              type="button"
              onclick={() => appState.setParamMode('iso', 'manual')}
              class={`px-1.5 py-0.5 rounded-md transition ${appState.locked.iso ? 'font-bold shadow-sm bg-emerald-500 text-slate-950' : 'font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'}`}
              title="Manual ISO: User fixes sensor sensitivity"
              aria-pressed={appState.locked.iso}>
              Manual
            </button>
          </div>
        </div>

        <!-- Big Readout -->
        <div class="text-3xl sm:text-4xl font-mono font-bold text-white my-2 tracking-tight tabular-nums">
          ISO {isoVal}
        </div>

        <!-- Inline Hardware Camera Control Help Drawer -->
        {#if appState.camGuideVisible.iso}
          <div class="my-2 bg-obsidian border border-emerald-500/40 rounded-xl p-2.5 text-[11px] space-y-1">
            <div class="flex items-center justify-between text-emerald-300 font-bold">
              <span>{appState.activeCamera.name}: {activeHardwareGuide.iso.location}</span>
              <button type="button" onclick={() => { appState.camGuideVisible.iso = false; }} class="text-slate-400 hover:text-white">✕</button>
            </div>
            <p class="text-slate-300 text-[10px] leading-relaxed">
              {activeHardwareGuide.iso.detail}
            </p>
          </div>
        {/if}

        <!-- Tactile Slider & Stepper Controls -->
        <div class="flex items-center gap-2 pt-1">
          <button
            type="button"
            onclick={() => appState.stepExposure('iso', -1)}
            class="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-dial hover:bg-slate-700/80 border border-borderline text-sm font-bold text-slate-200 flex items-center justify-center shrink-0 active:scale-95 transition">-</button>

          <input
            type="range"
            min="0"
            max={ISOS.length - 1}
            value={appState.exposure.isoIdx}
            oninput={(e) => appState.onManualExposureChange('iso', e.target.value)}
            class="w-full"
            aria-label="ISO" />

          <button
            type="button"
            onclick={() => appState.stepExposure('iso', 1)}
            class="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-dial hover:bg-slate-700/80 border border-borderline text-sm font-bold text-slate-200 flex items-center justify-center shrink-0 active:scale-95 transition">+</button>
        </div>
      </div>

      <!-- Explanatory line after the dial (uncropped) -->
      <div class="pt-2 border-t border-borderline/50 text-[11px] sm:text-xs text-slate-400 leading-snug min-h-[24px] flex items-center">
        <span>{isoDesc}</span>
      </div>
    </div>
  </div>
</section>
