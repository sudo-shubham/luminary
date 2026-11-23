# 🌟 Luminary — Photography Assistant

> **A location-aware camera settings calculator, real-time solar ephemeris engine, and compass-driven light-source radar for photographers.**

---

## 📖 Executive Summary

**Luminary** is an intelligent, field-ready assistant designed to eliminate exposure guesswork for photographers. By uniting real-time astronomical calculations, live atmospheric weather telemetry, optical lens physics, and device hardware sensors, Luminary auto-calculates the ideal Exposure Triangle (**Aperture**, **Shutter Speed**, and **ISO**) tailored to your exact location, time, camera gear, and creative intent.

Whether capturing deep-sky Milky Way exposures using the 500-Rule, chasing 3D Rembrandt side-light during golden hour, freezing fast action handheld, or smoothing waterfalls into silk, Luminary provides immediate, tactile settings guidance alongside plain-English coaching and real-time solar tracking.

---

## 🎯 Core Features at a Glance

| Feature | Description |
| :--- | :--- |
| **Exposure Triangle Engine** | Dynamic auto-balancing dials for Aperture, Shutter Speed, and ISO with an interactive viewfinder EV meter (-3 to +3 EV). |
| **7 Specialized Photography Modes** | Dedicated algorithmic profiles for Scenic/Landscape, Portrait, Street, Action/Sports, Urban Night, Astrophotography, and Silk/Long Exposure. |
| **Solar Ephemeris Engine** | High-precision astronomical equations calculating sun altitude, azimuth, solar noon, golden hours, blue hours, and astronomical twilight. |
| **Compass Sun & Shadow Radar** | Gyroscope and magnetometer-driven radar tracking the sun's position relative to where your camera is pointing, diagnosing lighting angles and shadow cast vectors. |
| **Custom Lens Builder** | Supports prime and zoom lenses (8mm to 1200mm, f/1.4 to f/22) with automatic 1.5× reciprocal camera-shake protection and aperture limiting. |
| **Live Atmospheric Telemetry** | Real-time cloud cover, temperature, weather conditions, and UV index dynamically adjusting EV ratings and shadow softness. |
| **Dual Experience Modes** | Toggle between **Beginner Mode** (explaining the "why" behind every setting) and **Pro Mode** (dense, high-efficiency dials and raw telemetry). |
| **Interactive Solar Arc** | Canvas-based visualization of the sun's trajectory across the horizon with countdown timers to the next golden or blue hour. |
| **Global City Search & Presets** | Instant GPS location detection, global search for any city, or one-tap lighting presets (Iceland, Tokyo, Sahara, London). |
| **Tactile Field Usability** | Dark-adapted `#0b0d10` UI, one-tap setting recipe copying, manual override sliders, and full offline functionality in the field. |

---

## ⚙️ The Exposure Triangle & Metering Engine

At the heart of Luminary is a physics-based exposure engine that resolves the relationship between scene illumination (Exposure Value / EV), optical depth of field, motion capture, and sensor sensitivity:

### 1. Tactile Dials & Sliders
- **Aperture (f-stop)**: Stepped from **f/1.4** to **f/22** with optical depth indicators (from creamy bokeh to deep front-to-back sharpness).
- **Shutter Speed**: Stepped from **30 seconds** down to **1/4000s**, with color-coded safety warnings when shutter speeds drop below the safe handheld limit.
- **ISO Sensitivity**: Stepped from **ISO 100** up to **ISO 25600**, calibrated to prioritize base ISO for maximum dynamic range and lowest image noise.
- **Step Buttons & Manual Overrides**: Adjust any dial by ±1 stop using tactile `+` / `−` buttons or continuous sliders. When overridden, an **Auto-Reset** button appears to quickly return to recommended values.

### 2. Viewfinder EV Meter (-3 to +3 EV)
Simulating an optical viewfinder's in-camera light meter, Luminary renders a real-time exposure needle:
- **Balanced (0.0 EV)**: The exposure triangle is balanced against current ambient lighting.
- **Underexposed (< 0 EV)**: Highlights scene brightness deficit in blue/cyan, advising wider apertures, slower shutters, or higher ISO.
- **Overexposed (> 0 EV)**: Highlights scene brightness excess in amber/rose, suggesting narrower apertures, faster shutters, or neutral density (ND) filters.

### 3. Exposure Compensation & Secondary Readouts
- **White Balance (Kelvin & Preset)**: Contextually shifts across daylight (5600K), cloudy (6500K), shade (8000K), tungsten (3200K), blue hour (8000K), and astrophotography neutral (4000K).
- **Autofocus Recommendation**: Dynamic guidance recommending AF-S (Single), AF-C (Continuous), Eye-AF, or Manual Star Live View depending on subject matter and light levels.
- **Metering Mode**: Recommends Matrix/Evaluative, Spot, or Center-Weighted metering based on scene contrast and backlight conditions.

---

## 🎨 7 Specialized Photography Shooting Styles

Each shooting mode configures a distinct algorithmic balance between shutter speed, depth of field, and ISO tolerance:

```
[ Scenic / Landscape ] ──► Deep Depth of Field (f/8 - f/11), Native Base ISO 100, Tripod Support
[ Portrait ]           ──► Shallow Depth (f/1.8 - f/2.8), Eye-AF, Soft Bokeh Backgrounds
[ Street ]             ──► Zone Focus (f/5.6 - f/8), Snappy Shutter (1/250s+), Candid Depth
[ Action / Sports ]    ──► Motion Freeze (1/1000s - 1/2000s), Continuous AF-C Tracking, Auto ISO
[ Night / Urban ]      ──► Wide Aperture (f/1.8 - f/2.8), Low-Light ISO Balancing, Tungsten WB
[ Astrophotography ]   ──► Widest Aperture (f/1.4+), 500-Rule Shutter Timer, Tripod Mandatory
[ Silk / Long Exp ]    ──► Slower Shutter (1s - 30s), Small Aperture (f/11 - f/16), ND Filter Advice
```

### Detailed Mode Breakdown:

1. **🏔️ Scenic / Landscape**
   - Targets the lens's optical sweet spot (**f/8 to f/11**) to maximize edge-to-edge sharpness and hyperfocal depth.
   - Enforces base ISO 100 to preserve shadow detail and dynamic range.
   - Adapts shutter speeds according to whether the photographer is shooting handheld or on a tripod.

2. **🧑 Portrait**
   - Prioritizes wide-open apertures (**f/1.8 to f/2.8**) to create subject-isolating background blur (bokeh).
   - Recommends Eye-AF / Face Tracking and monitors safe shutter speeds to avoid micro-motion blur from natural human movement.

3. **🚶 Street Photography**
   - Implements classic zone-focusing geometry (**f/5.6 to f/8**) with a safe baseline shutter speed (**1/250s**) to ensure passing subjects remain razor-sharp without needing slow autofocus hunting.

4. **⚡ Action & Sports**
   - Enforces high-speed shutter thresholds (**1/1000s to 1/2000s**) to freeze athletes, wildlife, vehicles, and fast action.
   - Allows ISO to rise intelligently while keeping shutter speeds rigidly above motion-blur limits.

5. **✨ Night & Cityscape**
   - Balances urban lighting contrasts (EV 2 to 6) with wide apertures and elevated ISO (up to ISO 3200).
   - Corrects white balance for artificial tungsten and sodium-vapor lighting.

6. **🌌 Astrophotography (Milky Way & Night Sky)**
   - Computes the astronomical **500-Rule** based on the mounted lens's focal length:
     $$\text{Max Shutter Seconds} = \frac{500}{\text{Focal Length (mm)}}$$
     *(e.g., $500 / 24\text{mm} = 20\text{s}$, preventing pinpoint stars from trailing into streaks due to Earth's rotation).*
   - Sets wide-open aperture (f/1.4 to f/2.8), ISO 3200–6400, 4000K astro-neutral white balance, and manual star magnification live-view focusing.

7. **🌊 Silk / Long Exposure**
   - Designed for smoothing water, clouds, and light trails into ethereal textures.
   - Calculates extended shutter speeds (1s to 30s) and alerts the photographer when ambient light requires ND filters (ND8, ND64, ND1000) to prevent blown-out highlights.

---

## 🧭 Phone Compass Light-Source & Shadow Radar

Luminary's interactive radar unites hardware sensors with solar geometry to analyze the physical direction of light hitting your subject:

```
                           [ Sun: Azimuth 245° ]
                                     ☀️
                                    /
                                   /  Sunlight
                                  /
                                 ▼
   [ Subject / Scene ] <───────── ( 45° Side Light / Rembrandt )
          │                      ▲
          │ Shadow               │
          ▼                      │ Camera Viewfinder
    ░░░░░░░░░░░░░░        [ Camera Aim: 0° North ]
```

### Radar Mechanics:
- **Phone Compass Synchronization**: Tap **"Phone Compass"** to link the radar directly to your device's internal magnetometer and gyroscope. Pointing your phone in any direction mirrors your camera's optical heading in real-time.
- **Manual Aim Wheel**: Alternatively, drag the 360° heading slider to preview lighting angles for any shot direction without moving.
- **Sun Vector Marker**: Pinpoints the exact solar azimuth angle with a glowing golden sun marker.
- **Shadow Vector Arrow**: Automatically plots the opposite angle indicating where shadows will fall on the ground and behind your subject.
- **Camera Field of View (FOV) Cone**: Displays your camera lens's coverage angle centered around your line of sight.

### Real-Time Lighting Angle Diagnosis:
As you turn, Luminary diagnoses the photographic quality of the light:
- **Direct Front Light (0°–20°)**: Sunlight directly over your shoulder. Provides even illumination but flattens facial contours and textures.
- **45° Side Light / Rembrandt (30°–60°)**: The classic photographic portrait angle. Creates natural three-dimensional depth, modeling shadows, and rich textures.
- **90° Hard Cross Light (75°–105°)**: Dramatic split lighting emphasizing rugged landscapes, rock formations, and architectural relief.
- **Backlight / Rim Light / Silhouette (150°–180°)**: Shooting directly toward the sun. Recommends exposure compensation (+1.0 to +2.0 EV) to prevent dark silhouettes or advises shooting rim-lit golden outlines.

---

## ☀️ Solar Ephemeris & Atmospheric Telemetry Engine

Luminary continuously calculates the precise astronomical position of the sun based on latitude, longitude, and date:

### 1. Solar Phases & Ephemeris Milestones
- **Astronomical Night (Sun < -18°)**: True dark-sky conditions required for deep-space astrophotography and Milky Way core visibility.
- **Nautical Twilight (-18° to -12°)**: Horizon silhouette visible; brightest navigational stars emerge.
- **Civil Twilight / Blue Hour (-6° to -0.833°)**: Sky turns deep indigo; ambient skylight balances with warm incandescent city lights (EV ~3–5, WB 8000K).
- **Golden Hour (-0.833° to +6°)**: Sun skims the horizon, scattering light through a thick atmosphere. Produces soft, warm, diffused amber illumination and long dramatic shadows (EV ~10–12, WB 5600K).
- **Low Sun (+6° to +20°)**: Crisp directional morning or late afternoon light with high contrast.
- **High / Midday Sun (> 45°)**: Intense vertical sunlight (EV 14–15) creating harsh overhead "raccoon-eye" shadows and blown highlights.

### 2. Interactive Solar Arc Canvas
A 24-hour visual arc renders the sun's trajectory across the day:
- **Live Sun Indicator**: Visualizes current solar altitude relative to the horizon line.
- **Milestone Timestamps**: Displays exact local times for Morning Blue Hour, Sunrise, Solar Noon, Sunset, and Evening Blue Hour.
- **Live Countdown**: Shows hours and minutes remaining until the next Golden Hour or Blue Hour window opens.

### 3. Atmospheric Weather Integration
Luminary factors live atmospheric conditions into its exposure calculations:
- **Cloud Cover %**: Dynamically scales scene brightness. Heavy overcast diffuses harsh midday shadows and reduces ambient light by 2 to 3 EV stops.
- **Weather Condition**: Real-time reports (Clear, Overcast, Mist, Rain, Snow) inform contrast adjustments.
- **Temperature & Max UV Index**: Assists photographers in preparing field gear, battery protection in freezing temperatures, and lens fogging precautions.

---

## 📷 Optical Lens & Gear Management

Camera settings must match the physical limits of the glass attached to your camera body. Luminary provides flexible gear profiling:

### Preset Gear Profiles
- **Kit Lens (18–55mm f/3.5–f/22)**: Standard variable-aperture starter glass with realistic f/3.5 wide limits.
- **Fast Prime (50mm f/1.8–f/16)**: Classic prime lens enabling shallow depth of field and superior low-light gathering.
- **Pro Zoom (24–70mm f/2.8–f/22)**: Professional constant-aperture standard zoom lens.
- **Phone Pro (24mm Fixed f/1.8)**: Simulates modern computational smartphone optics.

### Custom Lens Builder
Photographers can build their exact lens profile with custom parameters:
- **Prime or Zoom Selection**: Toggle between fixed single focal lengths and versatile zoom ranges.
- **Widest f-stop**: Configurable from ultra-fast **f/1.4** to **f/5.6**.
- **Narrowest f-stop**: Configurable up to **f/22**.
- **Focal Length Range**: Define minimum and maximum focal lengths from ultra-wide **8mm** to super-telephoto **1200mm**.
- **Active Zoom Slider**: Adjust the active focal length in real-time, automatically recalculating reciprocal handheld shutter limits.

### Camera Support & Handheld Limits
- **Handheld Mode**: Enforces the $1 / (1.5 \times \text{Focal Length})$ optical safety rule to protect shots against camera shake.
- **Tripod Mode**: Unlocks slow shutter speeds (up to 30 seconds) without triggering camera-shake warnings.

---

## 🎓 Coaching, Field Guide & Experience Modes

Luminary is built to empower both learning beginners and seasoned pros:

### Beginner vs. Pro Mode Toggle
- **Beginner Mode**:
  - Unrolls dedicated **"Why These Settings?"** coaching cards explaining the cause-and-effect of the recommended aperture, shutter speed, and ISO.
  - Highlights real-world rules of thumb (e.g., *"Why f/8? Lenses are sharpest in their mid-range"* or *"Why 1/500s? Children and pets move unpredictably"*).
  - Displays visual cues and warnings when settings reach risky thresholds.
- **Pro Mode**:
  - Collapses verbose explanations into a high-density, tactile instrument panel focused strictly on dials, stops, EV values, and azimuth coordinates.

### Lens Filter Advice Engine
Based on active lighting and style selections, Luminary recommends physical lens filters:
- **Circular Polarizer (CPL)**: Advised in bright landscape conditions to cut atmospheric haze, suppress water reflections, and deepen blue skies.
- **Neutral Density (ND8 / ND64 / ND1000)**: Recommends specific stop reductions when shooting long exposures or wide apertures in bright sunlight.
- **UV / Clear Protector**: General lens protection advice during sandy or harsh conditions.

---

## 🌍 Global Locations & Quick Lighting Presets

Whether scouting from home or shooting on location:
- **One-Tap GPS**: Uses device geolocation to instantly pinpoint your exact latitude, longitude, and local time zone.
- **Global City Search**: Live search database covering thousands of cities worldwide (e.g., *Tokyo, Reykjavik, New York, Cairo, Mumbai*).
- **Iconic Lighting Presets**: Instantly simulate world-renowned lighting conditions with a single tap:
  - 🌅 **Iceland Golden**: Low-angle arctic golden hour with warm, grazing light.
  - 🌃 **Tokyo Night**: Vibrant neon-lit urban nightscape with deep contrasts.
  - ☀️ **Sahara Noon**: Blazing desert midday sun with maximum EV brightness.
  - ☁️ **London Overcast**: Soft, highly diffused light with balanced, shadowless contrast.

---

## 📋 One-Click Recipe Copying

Found the perfect setting combination? Tap the **Copy** button to place a clean, formatted recipe directly onto your clipboard, ready to paste into field notes, Lightroom metadata, or photography journals:

```text
📷 Luminary Camera Recipe
Mode: Scenic (Landscape)
• Aperture: f/8.0
• Shutter: 1/125s
• ISO: 100
• WB: 5600K (Daylight)
• Focus: AF-S / Single
• Light: Golden Hour (EV 11.5)
• Aim: 0° N • 45° Side Light
• Location: New Delhi, India
```

---

## 🎨 Visual Identity & Field Ergonomics

- **Obsidian Dark Palette (`#0b0d10`)**: Deep black background engineered to preserve the photographer's natural night-adapted vision during dusk, blue hour, and astrophotography sessions.
- **Amber & Sky Accents**: High-contrast, tactile color-coding for effortless readability under direct, glaring sunlight.
- **Zero-Scroll Architecture**: Primary exposure dials, subject selectors, and live meters fit comfortably on mobile viewports for quick one-handed operation.
- **100% Offline Capability**: Runs entirely within the browser client with zero server dependencies, ensuring uninterrupted operation in remote mountain passes, deserts, and coastal shorelines.

---

*Luminary — Precision light, calculated exposure, effortless mastery.*
