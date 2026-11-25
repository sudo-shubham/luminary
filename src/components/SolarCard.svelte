<script>
  import { appState } from '../lib/state.svelte.js';
  import { formatDecimalHour } from '../lib/solar.js';
  import { CalendarPlus } from '@lucide/svelte';
  import { onMount } from 'svelte';

  let canvasEl = $state(null);

  const solar = $derived(appState.solarData);
  const phase = $derived(appState.lightPhase);
  const quality = $derived(appState.skyQuality);
  const timeline = $derived(appState.hourlyTimeline);

  // Sunset countdown calculation
  const countdownText = $derived.by(() => {
    const hrsToSunset = solar.sunsetLocal - solar.localHour;
    if (hrsToSunset > 0 && hrsToSunset < 12) {
      const h = Math.floor(hrsToSunset);
      const m = Math.round((hrsToSunset - h) * 60);
      return `Sunset in ${h > 0 ? h + 'h ' : ''}${m}m`;
    }
    return `Sunrise at ${formatDecimalHour(solar.sunriseLocal)}`;
  });

  function drawArc() {
    if (!canvasEl) return;
    const canvas = canvasEl;
    const parent = canvas.parentElement;
    const dpr = window.devicePixelRatio || 1;
    const w = (parent && parent.clientWidth) || 300;
    const h = (parent && parent.clientHeight) || 96;

    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    const isDark = appState.theme === 'dark';
    const horizonY = h * 0.68;

    // Ground fill
    ctx.fillStyle = isDark ? 'rgba(15, 23, 42, 0.7)' : 'rgba(226, 232, 240, 0.85)';
    ctx.fillRect(0, horizonY, w, h - horizonY);

    // Horizon Line
    ctx.strokeStyle = isDark ? '#334155' : '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(0, horizonY);
    ctx.lineTo(w, horizonY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Solar Arc Curve
    ctx.beginPath();
    const dayLen = Math.max(1, solar.sunsetLocal - solar.sunriseLocal);
    for (let x = 0; x <= w; x += 2) {
      const hour = (x / w) * 24;
      const norm = Math.sin(((hour - solar.sunriseLocal) / dayLen) * Math.PI);
      const y = horizonY - norm * (h * 0.52);
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = isDark ? 'rgba(245, 158, 11, 0.55)' : 'rgba(217, 119, 6, 0.85)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Current Sun Position
    const sunX = (solar.localHour / 24) * w;
    const clampedAlt = Math.max(-35, Math.min(75, solar.altitude));
    const sunY = horizonY - (clampedAlt / 75) * (h * 0.55);

    // Sun Radial Glow
    const grad = ctx.createRadialGradient(sunX, sunY, 2, sunX, sunY, 14);
    if (solar.altitude >= 0) {
      grad.addColorStop(0, 'rgba(251, 191, 36, 0.95)');
      grad.addColorStop(1, 'rgba(251, 191, 36, 0)');
    } else {
      grad.addColorStop(0, 'rgba(99, 102, 241, 0.85)');
      grad.addColorStop(1, 'rgba(99, 102, 241, 0)');
    }
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 14, 0, Math.PI * 2);
    ctx.fill();

    // Sun Core Disc
    ctx.fillStyle = solar.altitude >= 0 ? '#fbbf24' : '#818cf8';
    ctx.beginPath();
    ctx.arc(sunX, sunY, 4.5, 0, Math.PI * 2);
    ctx.fill();
  }

  $effect(() => {
    // Re-draw when solar data, theme, or canvas element changes
    if (solar && canvasEl) {
      drawArc();
    }
  });

  onMount(() => {
    drawArc();
    window.addEventListener('resize', drawArc);
    return () => {
      window.removeEventListener('resize', drawArc);
    };
  });
</script>

<section id="solar-ephemeris-card" class="bg-camera border border-borderline rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
  <div class="flex items-center justify-between gap-2 flex-wrap">
    <div class="flex items-center gap-2">
      <h2 class="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-amber-400"></span>
        Solar Ephemeris &amp; Sky Telemetry
      </h2>
      <span class="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 font-semibold">
        {appState.formattedDate}
      </span>
    </div>
    <div class="flex items-center gap-2">
      <button
        type="button"
        onclick={() => appState.exportShootToCalendar('golden')}
        class="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-dial hover:bg-slate-700/80 border border-borderline text-[10px] font-mono font-semibold text-slate-300 hover:text-white transition active:scale-95 shadow-sm"
        title="Download Golden Hour / Shoot Plan as Calendar Event (.ics)">
        <CalendarPlus class="w-3 h-3 text-amber-400" />
        <span>Add to Calendar</span>
      </button>
      <span class="text-[10px] font-mono text-slate-500 tabular-nums">
        {appState.location.lat.toFixed(2)}°, {appState.location.lon.toFixed(2)}°
      </span>
    </div>
  </div>

  <!-- Dynamic Phase Banner -->
  <div class={`rounded-xl p-3.5 border transition-all ${phase.bannerClass}`}>
    <div class="flex items-center justify-between gap-2 flex-wrap">
      <div>
        <span class={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold border ${phase.badgeClass}`}>
          {phase.name}
        </span>
        <div class="text-[11px] font-mono text-slate-400 mt-1">
          {formatDecimalHour(solar.localHour)} {appState.timeOffsetHours !== 0 ? '(Shifted)' : 'Local'}
        </div>
      </div>
      <div class="text-right">
        <span class="text-[10px] font-mono uppercase text-slate-400">Scene Light EV</span>
        <div class="text-sm font-mono font-bold text-emerald-400 tabular-nums">
          EV {phase.baseEV.toFixed(1)}
        </div>
      </div>
    </div>

    <!-- Telemetry Stats Grid -->
    <div class="grid grid-cols-4 gap-1.5 pt-2.5 mt-2.5 border-t border-white/10 text-center">
      <div class="bg-obsidian/60 rounded-lg p-1.5 shadow-sm">
        <div class="text-[9px] text-slate-400">Sun Alt/Az</div>
        <div class="text-[11px] font-mono font-semibold text-white tabular-nums">
          {(Number(solar.altitude) || 0) >= 0 ? '+' : ''}{(Number(solar.altitude) || 0).toFixed(0)}° / {solar.azimuth}°
        </div>
      </div>
      <div class="bg-obsidian/60 rounded-lg p-1.5 shadow-sm">
        <div class="text-[9px] text-slate-400">Clouds</div>
        <div class="text-[11px] font-mono font-semibold text-white tabular-nums">
          {appState.weather.cloudCover}%
        </div>
      </div>
      <div class={`rounded-lg p-1.5 shadow-sm ${appState.weather.isRain ? 'bg-rose-500/20 border border-rose-500/40' : 'bg-obsidian/60'}`}>
        <div class="text-[9px] text-slate-400">
          {appState.weather.precipitationProb > 0 ? `Rain ${appState.weather.precipitationProb}%` : 'Weather'}
        </div>
        <div class={`text-[11px] font-mono font-semibold truncate ${appState.weather.isRain ? 'text-rose-300' : 'text-white'}`}>
          {appState.weather.isRain ? `🌧️ ${appState.weather.description}` : appState.weather.description}
        </div>
      </div>
      <div class="bg-obsidian/60 rounded-lg p-1.5 shadow-sm">
        <div class="text-[9px] text-slate-400">Temp / UV</div>
        <div class="text-[11px] font-mono font-semibold text-white tabular-nums">
          {appState.weather.tempC}°C / UV{appState.weather.uvIndex}
        </div>
      </div>
    </div>
  </div>

  <!-- Solar Arc Visualization Box -->
  <div class="bg-dial/70 border border-borderline rounded-xl p-3 shadow-inner">
    <div class="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
      <div class="flex items-center gap-2">
        <span class="font-bold">SOLAR ARC</span>
        <button
          type="button"
          onclick={() => appState.jumpToSolarPhase('golden')}
          class="text-[9px] font-semibold text-amber-300 hover:text-amber-200 underline decoration-amber-400/50"
          title="Snap to Golden Hour">
          ✨ Golden Hour
        </button>
      </div>
      <span class="text-amber-400 font-semibold">{countdownText}</span>
    </div>
    <div class="w-full h-24 relative">
      <canvas bind:this={canvasEl} class="w-full h-full block"></canvas>
    </div>
    <!-- Interactive Solar Phase Snap Buttons -->
    <div class="grid grid-cols-4 gap-1.5 mt-2 text-[10px] font-mono text-center">
      <button
        type="button"
        onclick={() => appState.jumpToSolarPhase('blue_am')}
        class="p-1 rounded-lg bg-obsidian/50 hover:bg-dial border border-borderline/50 hover:border-sky-400/50 transition active:scale-95 cursor-pointer text-slate-400 hover:text-white"
        title="Snap to Dawn Blue Hour">
        <div>Blue AM</div>
        <span class="text-sky-400 font-semibold tabular-nums">{formatDecimalHour(solar.blueAM)}</span>
      </button>
      <button
        type="button"
        onclick={() => appState.jumpToSolarPhase('sunrise')}
        class="p-1 rounded-lg bg-obsidian/50 hover:bg-dial border border-borderline/50 hover:border-amber-400/50 transition active:scale-95 cursor-pointer text-slate-400 hover:text-white"
        title="Snap to Sunrise">
        <div>Sunrise</div>
        <span class="text-amber-300 font-semibold tabular-nums">{formatDecimalHour(solar.sunriseLocal)}</span>
      </button>
      <button
        type="button"
        onclick={() => appState.jumpToSolarPhase('sunset')}
        class="p-1 rounded-lg bg-obsidian/50 hover:bg-dial border border-borderline/50 hover:border-amber-400/50 transition active:scale-95 cursor-pointer text-slate-400 hover:text-white"
        title="Snap to Sunset">
        <div>Sunset</div>
        <span class="text-amber-400 font-semibold tabular-nums">{formatDecimalHour(solar.sunsetLocal)}</span>
      </button>
      <button
        type="button"
        onclick={() => appState.jumpToSolarPhase('blue_pm')}
        class="p-1 rounded-lg bg-obsidian/50 hover:bg-dial border border-borderline/50 hover:border-sky-400/50 transition active:scale-95 cursor-pointer text-slate-400 hover:text-white"
        title="Snap to Dusk Blue Hour">
        <div>Blue PM</div>
        <span class="text-sky-400 font-semibold tabular-nums">{formatDecimalHour(solar.bluePM)}</span>
      </button>
    </div>

    <!-- Afterglow & Light Quality Forecast -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2.5 pt-2.5 border-t border-borderline/60 text-[10px] font-mono">
      <div class="flex items-center justify-between gap-2 bg-obsidian/40 rounded-lg px-2.5 py-1.5" title={quality.sunrise.detail}>
        <span class="text-slate-400">🌅 Sunrise Light</span>
        <span class={`px-1.5 py-0.5 rounded border font-semibold ${quality.sunrise.badgeClass}`}>
          {quality.sunrise.score}% • {quality.sunrise.label}
        </span>
      </div>
      <div class="flex items-center justify-between gap-2 bg-obsidian/40 rounded-lg px-2.5 py-1.5" title={quality.sunset.detail}>
        <span class="text-slate-400">🌇 Sunset Light</span>
        <span class={`px-1.5 py-0.5 rounded border font-semibold ${quality.sunset.badgeClass}`}>
          {quality.sunset.score}% • {quality.sunset.label}
        </span>
      </div>
    </div>

    <!-- 24-Hour Hourly Sky & Rain Timeline -->
    <div class="mt-2.5 pt-2.5 border-t border-borderline/60" aria-label="24-Hour Hourly Sky and Rain Timeline">
      <div class="flex items-center justify-between gap-2 text-[10px] font-mono text-slate-400 mb-1.5 flex-wrap">
        <span class="font-bold text-slate-300">24H SKY &amp; RAIN</span>
        <div class="flex items-center gap-2.5 text-[9px]">
          <span class="inline-flex items-center gap-1"><span class="w-2 h-2 rounded-xs bg-emerald-400/80"></span>Clear</span>
          <span class="inline-flex items-center gap-1"><span class="w-2 h-2 rounded-xs bg-slate-400/70"></span>Cloudy</span>
          <span class="inline-flex items-center gap-1"><span class="w-2 h-2 rounded-xs bg-sky-400"></span>Rain</span>
          <span class="inline-flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>Golden</span>
        </div>
      </div>

      <div class="grid grid-cols-24 gap-0.5 sm:gap-1 items-end h-12 bg-obsidian/45 rounded-lg p-1.5 border border-borderline/50">
        {#each timeline as slot (slot.hour)}
          {@const barHeight = Math.max(14, slot.cloudCover)}
          {@const barColor =
            slot.precipProb >= 35
              ? 'bg-sky-400/85'
              : slot.cloudCover <= 35
              ? 'bg-emerald-400/75'
              : slot.cloudCover <= 65
              ? 'bg-amber-400/75'
              : 'bg-slate-400/75'}
          <button
            type="button"
            onclick={() => appState.jumpToHour(slot.hour)}
            title={`${slot.label} • Clouds ${slot.cloudCover}% • Rain ${slot.precipProb}% (Tap to preview)`}
            aria-label={`${slot.label} Clouds ${slot.cloudCover} percent Rain ${slot.precipProb} percent`}
            class={`group relative h-full flex flex-col justify-end items-center rounded-xs transition cursor-pointer ${slot.isActive ? 'ring-1 ring-amber-400 bg-amber-500/15' : 'hover:bg-white/5'}`}>
            {#if slot.isGoldenOrBlue}
              <span class="absolute -top-0.5 w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            {/if}
            <div
              class={`w-full rounded-xs transition-all ${barColor}`}
              style={`height: ${barHeight}%;`}>
            </div>
            {#if slot.precipProb >= 20}
              <span class="w-full h-0.5 bg-sky-300 mt-0.5 rounded-full"></span>
            {/if}
          </button>
        {/each}
      </div>

      <div class="flex items-center justify-between text-[9px] font-mono text-slate-500 mt-1 px-0.5">
        <span>00h</span>
        <span>06h</span>
        <span>12h</span>
        <span>18h</span>
        <span>23h</span>
      </div>
    </div>
  </div>
</section>
