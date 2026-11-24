<script>
  import { appState } from '../lib/state.svelte.js';

  const isRainForecast = $derived(
    Boolean(
      appState.weather.isRain ||
      (appState.weather.precipitationProb && appState.weather.precipitationProb >= 35) ||
      (appState.weather.precipitationMm && appState.weather.precipitationMm > 0.4)
    )
  );

  const baseFilter = $derived(appState.exposure.filter || 'None');
  const baseTip = $derived(
    appState.exposure.filterTip || {
      recommended: false,
      text: 'No optical filter required for this EV/subject combination; keep bare glass for maximum light transmission.'
    }
  );

  const filterName = $derived.by(() => {
    if (isRainForecast && (baseFilter === 'None' || !baseFilter)) {
      return 'Clear UV / Protector';
    }
    return baseFilter;
  });

  const tip = $derived.by(() => {
    const probStr = appState.weather.precipitationProb ? ` (${appState.weather.precipitationProb}% chance)` : '';
    if (isRainForecast) {
      if (!baseTip.recommended || baseFilter === 'None') {
        return {
          recommended: true,
          text: `🌧️ Rain / Moisture Expected${probStr}: Screw on a Clear UV or Protector filter to shield your delicate front coating from raindrops. Keep your lens hood attached to deflect spray.`
        };
      } else {
        return {
          recommended: true,
          text: `${baseTip.text || baseTip.pro || baseTip.beginner} 🌧️ Note: Rain expected${probStr}—keep lens hood on and protect filter threads from grit and water.`
        };
      }
    }
    return baseTip;
  });
</script>

<div class="bg-camera border border-borderline rounded-2xl p-3.5 sm:p-4 shadow-lg flex items-start gap-3">
  <div class="w-7 h-7 rounded-full border-2 border-slate-500 flex items-center justify-center shrink-0 mt-0.5">
    <div class="w-4 h-4 rounded-full border border-dashed border-slate-400"></div>
  </div>

  <div class="space-y-1 flex-1 min-w-0">
    <div class="flex items-center justify-between gap-2 flex-wrap">
      <span class="text-xs font-semibold text-slate-200">
        Lens Filter: <span class={tip.recommended ? 'text-sky-300 font-bold' : 'text-slate-400'}>{filterName}</span>
      </span>
      <span class={`px-2 py-0.5 rounded-md border text-[10px] font-mono uppercase tracking-wider ${tip.recommended ? 'bg-sky-500/15 text-sky-300 border-sky-500/30' : 'bg-slate-700/60 text-slate-300 border-slate-600'}`}>
        Optional Accessory
      </span>
    </div>
    <p class="text-xs text-slate-400 leading-relaxed">
      {tip.text || tip.pro || tip.beginner}
    </p>
  </div>
</div>
