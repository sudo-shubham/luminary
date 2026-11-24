<script>
  import { appState } from '../lib/state.svelte.js';
  import { APERTURES, SHUTTERS, ISOS } from '../lib/constants.js';
  import { Aperture, Clock, Sliders, SunMedium, Sparkles, Eye, Camera } from '@lucide/svelte';

  const N = $derived(APERTURES[appState.exposure.apertureIdx] || 8.0);
  const shutterObj = $derived(SHUTTERS[appState.exposure.shutterIdx] || SHUTTERS[12]);
  const iso = $derived(ISOS[appState.exposure.isoIdx] || 100);
  const gear = $derived(appState.activeGearConfig);
  const solar = $derived(appState.solarData);
  const phase = $derived(appState.lightPhase);
  const maxStarSec = $derived(Math.min(30, Math.round(500 / Math.max(10, gear.focalLengthMm || 24))));

  const coachingCards = $derived.by(() => {
    if (appState.style === 'astro') {
      return [
        {
          icon: Sparkles,
          iconColor: 'text-sky-400',
          title: `500 Rule @ ${gear.focalLengthMm}mm (${shutterObj.label})`,
          body: `500 ÷ ${gear.focalLengthMm}mm ≈ ${maxStarSec}s max before Earth's rotation causes star trailing. Handheld is impossible—sturdy tripod and 2s self-timer required.`
        },
        {
          icon: Aperture,
          iconColor: 'text-amber-400',
          title: `Aperture f/${N} Light Gathering`,
          body: `Opened wide to maximize light gathering on faint stars. If corners exhibit coma on fast glass, stop down 1/3–1 stop (e.g. f/2.0–f/2.8) for crisp pinpoints.`
        },
        {
          icon: Eye,
          iconColor: 'text-emerald-400',
          title: 'Manual Star Focusing',
          body: 'Autofocus fails in dark skies. Disable AF, switch to Manual Focus, zoom 10× in Live View onto the brightest star, and fine-tune until it is a sharp pinpoint.'
        },
        {
          icon: Camera,
          iconColor: 'text-indigo-400',
          title: `ISO ${iso} & RAW Capture`,
          body: `Shoot uncompressed RAW at ISO ${iso} (near your sensor's dual-gain sweet spot) with manual white balance (${appState.exposure.wbKelvin}K) for natural astro tones.`
        }
      ];
    }

    return [
      {
        icon: Aperture,
        iconColor: 'text-amber-400',
        title: `Aperture f/${N} & Depth of Field`,
        body: N <= 2.8
          ? `Wide opening (f/${N}) gives shallow depth of field and creamy background blur (bokeh), isolating your subject cleanly.`
          : N <= 5.6
          ? `Balanced aperture (f/${N}) sits in the optical sweet spot, giving edge-to-edge sharpness and moderate background separation.`
          : `Narrow aperture (f/${N}) delivers deep depth of field from near foreground to distant horizon—ideal for landscapes and architecture.`
      },
      {
        icon: Clock,
        iconColor: 'text-sky-400',
        title: `Shutter ${shutterObj.label} Motion Strategy`,
        body: shutterObj.sec >= 0.5
          ? `Long exposure (${shutterObj.label}) creates silky water and light trails. Camera must be locked onto a tripod or solid surface.`
          : shutterObj.sec > (1 / 60)
          ? `Shutter (${shutterObj.label}) requires steady hands or IBIS/lens stabilization at ${gear.focalLengthMm}mm. Tuck elbows in or use a support.`
          : `Fast shutter (${shutterObj.label}) freezes rapid motion and completely eliminates handheld camera shake for tack-sharp shots.`
      },
      {
        icon: Sliders,
        iconColor: 'text-emerald-400',
        title: `ISO ${iso} Sensor Gain`,
        body: iso <= 400
          ? `Base ISO (${iso}) delivers maximum dynamic range, richest shadow detail, and clean, grain-free images.`
          : `Amplified ISO (${iso}) enables fast shutter speeds in lower light while keeping exposures balanced with manageable noise.`
      },
      {
        icon: SunMedium,
        iconColor: 'text-amber-500',
        title: `Light Angle & Quality (${phase.name})`,
        body: Number(solar.altitude || 0) <= 8 && Number(solar.altitude || 0) >= -4
          ? `Warm golden light (sun at ${(Number(solar.altitude) || 0).toFixed(0)}°). Aim at 45°–90° to the sun for three-dimensional texture and warm rim lighting.`
          : `Sun altitude is ${(Number(solar.altitude) || 0).toFixed(0)}° / azimuth ${solar.azimuth}°. Position your subject at 45° to the light source to avoid harsh top-down shadows.`
      }
    ];
  });
</script>

<section class="bg-camera border border-borderline rounded-2xl p-4 sm:p-5 shadow-lg space-y-3.5">
  <div class="flex items-center justify-between">
    <h2 class="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
      <span class="w-2 h-2 rounded-full bg-amber-400"></span>
      Field Guide &amp; Exposure Notes
    </h2>
    <span class="text-[10px] font-mono text-slate-500 hidden sm:inline">Optical Coaching</span>
  </div>

  <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
    {#each coachingCards as card (card.title)}
      {@const CardIcon = card.icon}
      <div class="bg-obsidian/80 border border-borderline rounded-xl p-3.5 shadow-sm space-y-1.5">
        <div class="flex items-center gap-2 text-xs font-semibold text-white">
          <CardIcon class={`w-4 h-4 shrink-0 ${card.iconColor}`} />
          <span>{card.title}</span>
        </div>
        <p class="text-xs text-slate-400 leading-relaxed">
          {card.body}
        </p>
      </div>
    {/each}
  </div>
</section>
