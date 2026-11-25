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
  import NearbySpotsModal from './components/modals/NearbySpotsModal.svelte';
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
        appState.isSpotsModalOpen = false;
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
  <footer class="border-t border-borderline py-4 px-4 text-center text-[11px] font-mono text-slate-500 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
    <span>Luminary • 100% Client-Side Exposure &amp; Solar Ephemeris Calculator</span>
    <span class="hidden sm:inline">•</span>
    <a
      href="https://github.com/sudo-shubham/luminary"
      target="_blank"
      rel="noopener noreferrer"
      class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-dial hover:bg-slate-700/80 border border-borderline text-xs font-semibold text-slate-200 hover:text-amber-300 transition active:scale-95 shadow-sm">
      <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
      </svg>
      <span>GitHub</span>
    </a>
  </footer>

  <!-- Modals -->
  <CameraModal />
  <CameraDialModal />
  <ShotJournalModal />
  <NearbySpotsModal />
</div>
