<script>
  import { appState } from '../lib/state.svelte.js';
  import { getCardinal } from '../lib/solar.js';
  import { Compass } from '@lucide/svelte';

  const solar = $derived(appState.solarData);
  const diag = $derived(appState.lightDiagnosis);
  const heading = $derived(appState.orientation.heading);
  const pitch = $derived(appState.orientation.pitch);

  const shadowAzimuth = $derived((solar.azimuth + 180) % 360);
  const cardinal = $derived(getCardinal(heading));
  const pitchDesc = $derived(pitch > 12 ? 'Up (Sky)' : pitch < -12 ? 'Down' : 'Level');
</script>

<section class="bg-camera border border-borderline rounded-2xl p-4 sm:p-5 shadow-xl space-y-3.5">
  <div class="flex items-center justify-between gap-2">
    <h2 class="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
      <span class="w-2 h-2 rounded-full bg-amber-400"></span>
      Light-Source &amp; Shadow Radar
    </h2>
    <!-- Phone Compass Sensor Trigger -->
    <button
      type="button"
      onclick={() => appState.enablePhoneOrientation()}
      class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 text-sky-400 dark:text-sky-300 border border-sky-500/30 text-xs font-medium transition active:scale-95">
      {#if appState.orientation.sensorActive}
        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span>Compass Live</span>
      {:else}
        <Compass class="w-3.5 h-3.5 text-sky-400" />
        <span>Phone Compass</span>
      {/if}
    </button>
  </div>

  <div class="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-center bg-dial/60 border border-borderline rounded-xl p-3 shadow-inner">
    <!-- Interactive SVG Compass Radar -->
    <div class="sm:col-span-5 flex flex-col items-center">
      <svg viewBox="0 0 200 200" class="w-36 h-36 sm:w-40 sm:h-40 select-none touch-none">
        <defs>
          <radialGradient id="radarBg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#191e27" />
            <stop offset="100%" stop-color="#0b0d10" />
          </radialGradient>
          <linearGradient id="fovConeGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stop-color="rgba(56, 189, 248, 0.35)" />
            <stop offset="100%" stop-color="rgba(56, 189, 248, 0.02)" />
          </linearGradient>
        </defs>

        <circle cx="100" cy="100" r="88" class="radar-bg-circle" fill="url(#radarBg)" stroke="#262d3a" stroke-width="2" />
        <circle cx="100" cy="100" r="58" class="radar-ring" fill="none" stroke="#262d3a" stroke-width="1" stroke-dasharray="3 3" />
        <circle cx="100" cy="100" r="28" class="radar-ring" fill="none" stroke="#262d3a" stroke-width="1" />

        <text x="100" y="23" text-anchor="middle" fill="#f59e0b" font-size="10" font-family="JetBrains Mono" font-weight="bold">N</text>
        <text x="178" y="103" text-anchor="middle" fill="#64748b" font-size="9" font-family="JetBrains Mono">E</text>
        <text x="100" y="184" text-anchor="middle" fill="#64748b" font-size="9" font-family="JetBrains Mono">S</text>
        <text x="22" y="103" text-anchor="middle" fill="#64748b" font-size="9" font-family="JetBrains Mono">W</text>

        <!-- Shadow Direction Vector -->
        <g transform={`rotate(${shadowAzimuth} 100 100)`}>
          <line x1="100" y1="100" x2="100" y2="168" stroke="#94a3b8" stroke-width="2" stroke-dasharray="4 3" opacity="0.75" />
          <polygon points="100,174 96,165 104,165" fill="#94a3b8" opacity="0.75" />
        </g>

        <!-- Camera FOV Cone & Body -->
        <g transform={`rotate(${heading} 100 100)`}>
          <path d="M 100 100 L 66 22 A 84 84 0 0 1 134 22 Z" fill="url(#fovConeGrad)" />
          <line x1="100" y1="100" x2="100" y2="18" stroke="#38bdf8" stroke-width="2" />
          <rect x="92" y="88" width="16" height="24" rx="3" fill="#0b0d10" stroke="#38bdf8" stroke-width="2" />
          <circle cx="100" cy="92" r="1.5" fill="#38bdf8" />
        </g>

        <!-- Sun Azimuth Marker -->
        <g transform={`rotate(${solar.azimuth} 100 100)`}>
          <line x1="100" y1="100" x2="100" y2="20" stroke="#f59e0b" stroke-width="1.5" opacity="0.5" />
          <circle cx="100" cy="18" r="11" fill="rgba(245, 158, 11, 0.25)" />
          <circle cx="100" cy="18" r="6" fill="#fbbf24" stroke="#0b0d10" stroke-width="1.5" />
        </g>
      </svg>

      <div class="flex items-center gap-3 text-[10px] font-mono text-slate-400 mt-1">
        <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-amber-400"></span>Sun</span>
        <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-sky-400"></span>Camera</span>
        <span class="flex items-center gap-1"><span class="w-2 h-0.5 bg-slate-400"></span>Shadow</span>
      </div>
    </div>

    <!-- Lighting Angle Diagnosis & Sliders -->
    <div class="sm:col-span-7 space-y-2">
      <div class="flex items-center justify-between gap-2 flex-wrap">
        <span class={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold border ${diag.badgeClass}`}>
          {diag.badge}
        </span>
        <span class="text-[10px] font-mono font-semibold text-slate-400">
          {appState.orientation.sensorActive ? 'Live Sensor' : 'Manual Dial'}
        </span>
      </div>

      <p class="text-xs text-slate-200 leading-relaxed">
        {diag.summary}
      </p>

      <div class="text-[11px] font-mono text-sky-300 bg-obsidian/70 border border-borderline rounded-lg px-2.5 py-1.5 shadow-inner">
        {diag.action}
      </div>

      <div class="pt-1 space-y-2">
        <div>
          <div class="flex justify-between text-[10px] font-mono text-slate-400">
            <span>Camera Aim</span>
            <span class="text-sky-400 font-semibold tabular-nums">{heading}° {cardinal} (Sun {solar.azimuth}°)</span>
          </div>
          <input
            type="range"
            min="0"
            max="359"
            value={heading}
            oninput={(e) => appState.setManualHeading(e.target.value)}
            class="w-full"
            aria-label="Camera Aim Heading" />
        </div>
        <div>
          <div class="flex justify-between text-[10px] font-mono text-slate-400">
            <span>Phone Tilt</span>
            <span class="text-emerald-400 font-semibold tabular-nums">{pitch >= 0 ? '+' : ''}{pitch}° {pitchDesc}</span>
          </div>
          <input
            type="range"
            min="-60"
            max="75"
            value={pitch}
            oninput={(e) => appState.setManualPitch(e.target.value)}
            class="w-full"
            aria-label="Phone Tilt Pitch" />
        </div>
      </div>
    </div>
  </div>
</section>
