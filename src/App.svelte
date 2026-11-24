<script>
  import { onMount } from 'svelte';
  import { appState } from './lib/state.svelte.js';

  // Components
  import Header from './components/Header.svelte';
  import TelemetryStrip from './components/TelemetryStrip.svelte';
  import GearBar from './components/GearBar.svelte';
  import SceneSelector from './components/SceneSelector.svelte';
  import CameraModeDial from './components/CameraModeDial.svelte';
  import WarningBanner from './components/WarningBanner.svelte';
  import ExposureDials from './components/ExposureDials.svelte';
  import ExposureMeter from './components/ExposureMeter.svelte';
  import DepthOfField from './components/DepthOfField.svelte';
  import SecondaryParams from './components/SecondaryParams.svelte';
  import OptionalFilterTip from './components/OptionalFilterTip.svelte';
  import CoachingGuide from './components/CoachingGuide.svelte';
  import SolarCard from './components/SolarCard.svelte';
  import CompassRadar from './components/CompassRadar.svelte';

  // Modals & Notifications
  import CameraModal from './components/modals/CameraModal.svelte';
  import CameraDialModal from './components/modals/CameraDialModal.svelte';
  import ShotJournalModal from './components/modals/ShotJournalModal.svelte';
  import ToastContainer from './components/ToastContainer.svelte';

  let deferredPrompt = $state(null);
  let isInstallable = $derived(!!deferredPrompt);

  async function handlePromptInstall() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        deferredPrompt = null;
      }
    } else {
      appState.showToast('Tap your browser menu (⋮ or Share) and select "Add to Home Screen".');
    }
  }

  onMount(() => {
    // 1. Initialize Theme & Clock
    appState.applyTheme(appState.theme);
    appState.updateLiveClock();
    const clockInterval = setInterval(() => {
      appState.updateLiveClock();
    }, 1000);

    // 2. Initial Weather & Recalculate
    appState.fetchWeatherForCoords(appState.location.lat, appState.location.lon);

    // 3. Support URL Parameters (?style=astro, ?style=portrait, etc.)
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const styleParam = urlParams.get('style');
      if (styleParam) {
        appState.setStyle(styleParam);
      }
    } catch {}

    // 4. PWA Installation Listeners
    const onBeforeInstallPrompt = (e) => {
      e.preventDefault();
      deferredPrompt = e;
    };
    const onAppInstalled = () => {
      deferredPrompt = null;
      appState.showToast('Luminary installed to your device!');
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onAppInstalled);

    // 5. Global Escape Key Listener for Modals
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        appState.isCameraModalOpen = false;
        appState.isCameraDialModalOpen = false;
        appState.isShotJournalModalOpen = false;
      }
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      clearInterval(clockInterval);
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onAppInstalled);
      window.removeEventListener('keydown', onKeyDown);
    };
  });
</script>

<div class="min-h-screen flex flex-col font-sans select-none antialiased">
  <!-- Toast Notification Stack -->
  <ToastContainer />

  <!-- Global Application Header -->
  <Header
    {isInstallable}
    onPromptInstall={handlePromptInstall} />

  <!-- Main Responsive 12-Column Layout -->
  <main class="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6 w-full">
    <!-- Top Telemetry & Location Search Strip -->
    <TelemetryStrip />

    <!-- Active Gear Setup & Lens Telemetry Bar -->
    <GearBar />

    <!-- 12-Column Dual Grid: Controls & Calculations (Left 7) vs Telemetry & Radar (Right 5) -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
      <!-- Left Column: Primary Exposure Controls (lg:col-span-7) -->
      <div class="lg:col-span-7 space-y-4 sm:space-y-6">
        <!-- 7 Scene Priority Buttons -->
        <SceneSelector />

        <!-- Brand Camera Mode Dial (M, Av/A, Tv/S, P, AUTO) -->
        <CameraModeDial />

        <!-- Contextual Caution/Warning Banner -->
        <WarningBanner />

        <!-- 3 Primary Exposure Dials (Aperture, Shutter, ISO) -->
        <ExposureDials />

        <!-- Viewfinder Exposure Meter (Shifted ABOVE DoF per user specification) -->
        <ExposureMeter />

        <!-- Interactive Optical Depth of Field & Hyperfocal Scale -->
        <DepthOfField />

        <!-- Secondary Optical Parameters (WB, Focus, Metering, Copy, Log) -->
        <SecondaryParams />

        <!-- Optional Optical Lens Filter Accessory Tip -->
        <OptionalFilterTip />

        <!-- "Why These Settings?" Dynamic Field Guide -->
        <CoachingGuide />
      </div>

      <!-- Right Column: Solar Ephemeris & Light-Source Radar (lg:col-span-5) -->
      <div class="lg:col-span-5 space-y-4 sm:space-y-6">
        <!-- Solar Ephemeris & Arc Visualization -->
        <SolarCard />

        <!-- Compass & Shadow Radar -->
        <CompassRadar />
      </div>
    </div>
  </main>

  <!-- Global Footer -->
  <footer class="border-t border-borderline py-4 text-center text-[11px] font-mono text-slate-500">
    Luminary • 100% Client-Side Exposure &amp; Solar Ephemeris Calculator • Open-Meteo Telemetry
  </footer>

  <!-- Modals -->
  <CameraModal />
  <CameraDialModal />
  <ShotJournalModal />
</div>
