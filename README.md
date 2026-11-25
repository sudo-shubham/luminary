# 🌟 Luminary — Photography Assistant

> **Location-aware camera settings calculator, solar ephemeris, 24h sky & rain timeline, compass light radar, and nearby scenic photo spots for photographers.**

- **Live Web App (PWA):** [luminary.shubhampatel.dev](https://luminary.shubhampatel.dev/)
- **Android APK (`v1.5.4`):** [Download Latest Release](https://github.com/sudo-shubham/luminary/releases/latest)

---

## ✨ Highlights

- **Exposure Triangle & EV Meter:** Auto-balancing Aperture, Shutter, and ISO dials with `Av`/`Tv`/`M`/`AE-L` locks and Hyperfocal/DoF scale.
- **Brand + Sensor & Mount Lenses:** Sony, Canon, Nikon, Fujifilm, Lumix, and Smartphone sensor profiles with brand-specific lens lineups.
- **7 Shooting Styles:** Landscape, Portrait, Street, Action, Lowlight, Astro (500-Rule), and Silk (Long Exposure).
- **Solar Ephemeris & 24h Sky/Rain Timeline:** Today & Tomorrow (`+1d`) planning, **Afterglow Forecast**, interactive 24h cloud/rain strip, rain warnings, and `.ics` calendar export.
- **Nearby Scenic Spots & Scouting Map:** Discover viewpoints, peaks, rivers, and historic landmarks with real photos, Google Maps links, and an interactive Leaflet map with custom Sun-Time Rays.
- **Compass Light & Shadow Radar:** Live phone compass / manual dial with Sunrise & Sunset azimuth pins.
- **100% Client-Side & Offline:** Custom Camera/Lens bag and Shot Journal persisted locally in your browser.

---

## 📚 Documentation (GitHub Wiki)

Detailed guides and optical formulas are maintained in the **[Luminary Wiki](https://github.com/sudo-shubham/luminary/wiki)**:

- **[Home](https://github.com/sudo-shubham/luminary/wiki)** — Overview & quick start
- **[Exposure Engine & Shooting Modes](https://github.com/sudo-shubham/luminary/wiki/Exposure-Engine)** — EV meter, locks, 500-Rule, DoF & Hyperfocal math
- **[Solar Ephemeris & Weather](https://github.com/sudo-shubham/luminary/wiki/Solar-Ephemeris-and-Weather)** — +1d planning, Afterglow Forecast, 24h Sky/Rain timeline, rain alerts, `.ics` export
- **[Nearby Scenic Spots](https://github.com/sudo-shubham/luminary/wiki/Nearby-Scenic-Spots)** — Overpass/Wikipedia scenic spots, photos, Leaflet Scouting Map & Sun-Time Rays
- **[Compass Light Radar](https://github.com/sudo-shubham/luminary/wiki/Compass-Radar)** — Sensor sync, lighting angles, Sunrise/Sunset azimuth pins
- **[Gear Bag & Shot Journal](https://github.com/sudo-shubham/luminary/wiki/Gear-and-Shot-Journal)** — Brand + Sensor profiles, mount lenses, EXIF recipe logging, filter advice
- **[Development & Testing](https://github.com/sudo-shubham/luminary/wiki/Development-and-Testing)** — Local setup, PWA validation, Playwright E2E tests

---

## 🚀 Local Development

```bash
npm install
npm run dev       # Start Vite dev server
npm run build     # Build production bundle to dist/
npm run preview   # Preview production build on http://localhost:4173
npm run validate  # Run PWA Builder criteria checks
npm test          # Run Playwright E2E test suite
```
