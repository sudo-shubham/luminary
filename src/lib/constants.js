/**
 * Photographic constants, physical camera dictionaries, and hardware dial guides.
 */

export const APERTURES = [1.4, 1.8, 2.0, 2.8, 3.5, 4.0, 5.6, 8.0, 11, 16, 22];

export const SHUTTERS = [
  { label: '30"', sec: 30 },
  { label: '15"', sec: 15 },
  { label: '8"', sec: 8 },
  { label: '4"', sec: 4 },
  { label: '2"', sec: 2 },
  { label: '1"', sec: 1 },
  { label: '1/2s', sec: 0.5 },
  { label: '1/4s', sec: 0.25 },
  { label: '1/8s', sec: 0.125 },
  { label: '1/15s', sec: 1 / 15 },
  { label: '1/30s', sec: 1 / 30 },
  { label: '1/60s', sec: 1 / 60 },
  { label: '1/125s', sec: 1 / 125 },
  { label: '1/250s', sec: 1 / 250 },
  { label: '1/500s', sec: 1 / 500 },
  { label: '1/1000s', sec: 1 / 1000 },
  { label: '1/2000s', sec: 1 / 2000 },
  { label: '1/4000s', sec: 1 / 4000 },
  { label: '1/8000s', sec: 1 / 8000 }
];

export const ISOS = [100, 200, 400, 800, 1600, 3200, 6400, 12800, 25600];

export const DEFAULT_CAMERAS = {
  sony_a7iv:    { id: 'sony_a7iv', name: 'Sony Full Frame', brand: 'Sony', sensorType: 'Full Frame (1.0×)', cropFactor: 1.0 },
  canon_r5:     { id: 'canon_r5', name: 'Canon Full Frame', brand: 'Canon', sensorType: 'Full Frame (1.0×)', cropFactor: 1.0 },
  nikon_z6:     { id: 'nikon_z6', name: 'Nikon Full Frame', brand: 'Nikon', sensorType: 'Full Frame (1.0×)', cropFactor: 1.0 },
  panasonic_s5: { id: 'panasonic_s5', name: 'Lumix Full Frame', brand: 'Lumix', sensorType: 'Full Frame (1.0×)', cropFactor: 1.0 },
  fuji_xt5:     { id: 'fuji_xt5', name: 'Fujifilm APS-C', brand: 'Fujifilm', sensorType: 'APS-C (1.5×)', cropFactor: 1.5 },
  sony_a6700:   { id: 'sony_a6700', name: 'Sony APS-C', brand: 'Sony', sensorType: 'APS-C (1.5×)', cropFactor: 1.5 },
  nikon_z50:    { id: 'nikon_z50', name: 'Nikon APS-C', brand: 'Nikon', sensorType: 'APS-C (1.5×)', cropFactor: 1.5 },
  canon_r7:     { id: 'canon_r7', name: 'Canon APS-C', brand: 'Canon', sensorType: 'APS-C (1.6×)', cropFactor: 1.6 },
  lumix_gh6:    { id: 'lumix_gh6', name: 'Lumix Micro 4/3', brand: 'Lumix', sensorType: 'Micro 4/3 (2.0×)', cropFactor: 2.0 },
  fuji_gfx:     { id: 'fuji_gfx', name: 'Fujifilm Medium Format', brand: 'Fujifilm', sensorType: 'Medium Format (0.79×)', cropFactor: 0.79 },
  phone_pro:    { id: 'phone_pro', name: 'Smartphone Main', brand: 'Phone', sensorType: 'Mobile (3.6×)', cropFactor: 3.6 }
};

export const BRAND_LENS_IDS = {
  Sony:     ['sony_24_70_gm', 'sony_35_gm', 'sony_85_gm', 'sony_14_gm', 'sony_24_gm', 'sony_70_200_gm', 'sony_200_600_g'],
  Canon:    ['canon_24_70_l', 'canon_50_18', 'canon_85_12_l', 'canon_15_35_l', 'canon_70_200_l', 'canon_100_500_l'],
  Nikon:    ['nikon_24_70_s', 'nikon_35_18_s', 'nikon_50_18_s', 'nikon_85_12_s', 'nikon_14_24_s', 'nikon_70_200_s'],
  Fujifilm: ['fuji_16_55', 'fuji_23_14', 'fuji_35_14', 'fuji_56_12', 'fuji_gf_32_64'],
  Lumix:    ['lumix_24_70_s', 'lumix_50_18_s', 'lumix_12_60', 'lumix_42_5'],
  Phone:    ['phone', 'phone_13_uw', 'phone_77_tele', 'phone_120_tele']
};

export const DEFAULT_LENSES = {
  kit:          { minApertureIdx: 4, maxApertureIdx: 10, fixedAperture: false, focalLengthMm: 35, minMm: 18, maxMm: 55, label: 'Kit Lens (18–55mm f/3.5–f/22)' },
  prime_24:     { minApertureIdx: 0, maxApertureIdx: 9,  fixedAperture: false, focalLengthMm: 24, minMm: 24, maxMm: 24, label: 'Wide Prime (24mm f/1.4–f/16)' },
  prime_35:     { minApertureIdx: 0, maxApertureIdx: 9,  fixedAperture: false, focalLengthMm: 35, minMm: 35, maxMm: 35, label: 'Street Prime (35mm f/1.4–f/16)' },
  prime_50:     { minApertureIdx: 1, maxApertureIdx: 9,  fixedAperture: false, focalLengthMm: 50, minMm: 50, maxMm: 50, label: 'Fast Prime (50mm f/1.8–f/16)' },
  prime_85:     { minApertureIdx: 0, maxApertureIdx: 9,  fixedAperture: false, focalLengthMm: 85, minMm: 85, maxMm: 85, label: 'Portrait Prime (85mm f/1.4–f/16)' },
  prime_135:    { minApertureIdx: 1, maxApertureIdx: 9,  fixedAperture: false, focalLengthMm: 135, minMm: 135, maxMm: 135, label: 'Tele Prime (135mm f/1.8–f/16)' },
  zoom_16_35:   { minApertureIdx: 3, maxApertureIdx: 10, fixedAperture: false, focalLengthMm: 24, minMm: 16, maxMm: 35, label: 'Ultra-Wide Zoom (16–35mm f/2.8–f/22)' },
  zoom_24_70:   { minApertureIdx: 3, maxApertureIdx: 10, fixedAperture: false, focalLengthMm: 50, minMm: 24, maxMm: 70, label: 'Pro Zoom (24–70mm f/2.8–f/22)' },
  zoom_70_200:  { minApertureIdx: 3, maxApertureIdx: 10, fixedAperture: false, focalLengthMm: 135, minMm: 70, maxMm: 200, label: 'Telephoto Zoom (70–200mm f/2.8–f/22)' },
  zoom_100_400: { minApertureIdx: 5, maxApertureIdx: 10, fixedAperture: false, focalLengthMm: 200, minMm: 100, maxMm: 400, label: 'Super-Tele (100–400mm f/4.5–5.6)' },
  macro_100:    { minApertureIdx: 3, maxApertureIdx: 10, fixedAperture: false, focalLengthMm: 100, minMm: 100, maxMm: 100, label: 'Macro Lens (100mm f/2.8–f/32)' },
  astro_14:     { minApertureIdx: 1, maxApertureIdx: 9,  fixedAperture: false, focalLengthMm: 14, minMm: 14, maxMm: 14, label: 'Astro Ultra-Wide (14mm f/1.8–f/16)' },
  phone:        { minApertureIdx: 1, maxApertureIdx: 1,  fixedAperture: true,  focalLengthMm: 24, minMm: 24, maxMm: 24, label: 'Main Wide (24mm f/1.8)' },
  // Sony E-Mount
  sony_14_gm:     { brand: 'Sony', minApertureIdx: 1, maxApertureIdx: 9,  fixedAperture: false, focalLengthMm: 14,  minMm: 14,  maxMm: 14,  label: 'Sony FE 14mm f/1.8 GM' },
  sony_24_gm:     { brand: 'Sony', minApertureIdx: 0, maxApertureIdx: 9,  fixedAperture: false, focalLengthMm: 24,  minMm: 24,  maxMm: 24,  label: 'Sony FE 24mm f/1.4 GM' },
  sony_35_gm:     { brand: 'Sony', minApertureIdx: 0, maxApertureIdx: 9,  fixedAperture: false, focalLengthMm: 35,  minMm: 35,  maxMm: 35,  label: 'Sony FE 35mm f/1.4 GM' },
  sony_85_gm:     { brand: 'Sony', minApertureIdx: 0, maxApertureIdx: 9,  fixedAperture: false, focalLengthMm: 85,  minMm: 85,  maxMm: 85,  label: 'Sony FE 85mm f/1.4 GM' },
  sony_24_70_gm:  { brand: 'Sony', minApertureIdx: 3, maxApertureIdx: 10, fixedAperture: false, focalLengthMm: 50,  minMm: 24,  maxMm: 70,  label: 'Sony FE 24–70mm f/2.8 GM II' },
  sony_70_200_gm: { brand: 'Sony', minApertureIdx: 3, maxApertureIdx: 10, fixedAperture: false, focalLengthMm: 135, minMm: 70,  maxMm: 200, label: 'Sony FE 70–200mm f/2.8 GM II' },
  sony_200_600_g: { brand: 'Sony', minApertureIdx: 6, maxApertureIdx: 11, fixedAperture: false, focalLengthMm: 400, minMm: 200, maxMm: 600, label: 'Sony FE 200–600mm f/5.6–6.3 G' },
  // Canon RF-Mount
  canon_15_35_l:   { brand: 'Canon', minApertureIdx: 3, maxApertureIdx: 10, fixedAperture: false, focalLengthMm: 24,  minMm: 15,  maxMm: 35,  label: 'Canon RF 15–35mm f/2.8L IS' },
  canon_24_70_l:   { brand: 'Canon', minApertureIdx: 3, maxApertureIdx: 10, fixedAperture: false, focalLengthMm: 50,  minMm: 24,  maxMm: 70,  label: 'Canon RF 24–70mm f/2.8L IS' },
  canon_50_18:     { brand: 'Canon', minApertureIdx: 1, maxApertureIdx: 10, fixedAperture: false, focalLengthMm: 50,  minMm: 50,  maxMm: 50,  label: 'Canon RF 50mm f/1.8 STM' },
  canon_85_12_l:   { brand: 'Canon', minApertureIdx: 0, maxApertureIdx: 9,  fixedAperture: false, focalLengthMm: 85,  minMm: 85,  maxMm: 85,  label: 'Canon RF 85mm f/1.2L' },
  canon_70_200_l:  { brand: 'Canon', minApertureIdx: 3, maxApertureIdx: 10, fixedAperture: false, focalLengthMm: 135, minMm: 70,  maxMm: 200, label: 'Canon RF 70–200mm f/2.8L IS' },
  canon_100_500_l: { brand: 'Canon', minApertureIdx: 5, maxApertureIdx: 11, fixedAperture: false, focalLengthMm: 300, minMm: 100, maxMm: 500, label: 'Canon RF 100–500mm f/4.5–7.1L' },
  // Nikon Z-Mount
  nikon_14_24_s:  { brand: 'Nikon', minApertureIdx: 3, maxApertureIdx: 10, fixedAperture: false, focalLengthMm: 20,  minMm: 14,  maxMm: 24,  label: 'NIKKOR Z 14–24mm f/2.8 S' },
  nikon_24_70_s:  { brand: 'Nikon', minApertureIdx: 3, maxApertureIdx: 10, fixedAperture: false, focalLengthMm: 50,  minMm: 24,  maxMm: 70,  label: 'NIKKOR Z 24–70mm f/2.8 S' },
  nikon_35_18_s:  { brand: 'Nikon', minApertureIdx: 1, maxApertureIdx: 9,  fixedAperture: false, focalLengthMm: 35,  minMm: 35,  maxMm: 35,  label: 'NIKKOR Z 35mm f/1.8 S' },
  nikon_50_18_s:  { brand: 'Nikon', minApertureIdx: 1, maxApertureIdx: 9,  fixedAperture: false, focalLengthMm: 50,  minMm: 50,  maxMm: 50,  label: 'NIKKOR Z 50mm f/1.8 S' },
  nikon_85_12_s:  { brand: 'Nikon', minApertureIdx: 0, maxApertureIdx: 9,  fixedAperture: false, focalLengthMm: 85,  minMm: 85,  maxMm: 85,  label: 'NIKKOR Z 85mm f/1.2 S' },
  nikon_70_200_s: { brand: 'Nikon', minApertureIdx: 3, maxApertureIdx: 10, fixedAperture: false, focalLengthMm: 135, minMm: 70,  maxMm: 200, label: 'NIKKOR Z 70–200mm f/2.8 VR S' },
  // Fujifilm X & GFX
  fuji_16_55:    { brand: 'Fujifilm', minApertureIdx: 3, maxApertureIdx: 10, fixedAperture: false, focalLengthMm: 35, minMm: 16, maxMm: 55, label: 'Fujinon XF 16–55mm f/2.8' },
  fuji_23_14:    { brand: 'Fujifilm', minApertureIdx: 0, maxApertureIdx: 9,  fixedAperture: false, focalLengthMm: 23, minMm: 23, maxMm: 23, label: 'Fujinon XF 23mm f/1.4' },
  fuji_35_14:    { brand: 'Fujifilm', minApertureIdx: 0, maxApertureIdx: 9,  fixedAperture: false, focalLengthMm: 35, minMm: 35, maxMm: 35, label: 'Fujinon XF 35mm f/1.4' },
  fuji_56_12:    { brand: 'Fujifilm', minApertureIdx: 0, maxApertureIdx: 9,  fixedAperture: false, focalLengthMm: 56, minMm: 56, maxMm: 56, label: 'Fujinon XF 56mm f/1.2' },
  fuji_gf_32_64: { brand: 'Fujifilm', minApertureIdx: 5, maxApertureIdx: 11, fixedAperture: false, focalLengthMm: 45, minMm: 32, maxMm: 64, label: 'Fujinon GF 32–64mm f/4' },
  // Lumix L-Mount & MFT
  lumix_24_70_s: { brand: 'Lumix', minApertureIdx: 3, maxApertureIdx: 10, fixedAperture: false, focalLengthMm: 50, minMm: 24, maxMm: 70, label: 'Lumix S PRO 24–70mm f/2.8' },
  lumix_50_18_s: { brand: 'Lumix', minApertureIdx: 1, maxApertureIdx: 10, fixedAperture: false, focalLengthMm: 50, minMm: 50, maxMm: 50, label: 'Lumix S 50mm f/1.8' },
  lumix_12_60:   { brand: 'Lumix', minApertureIdx: 3, maxApertureIdx: 10, fixedAperture: false, focalLengthMm: 25, minMm: 12, maxMm: 60, label: 'Leica DG 12–60mm f/2.8–4' },
  lumix_42_5:    { brand: 'Lumix', minApertureIdx: 0, maxApertureIdx: 9,  fixedAperture: false, focalLengthMm: 42, minMm: 42, maxMm: 42, label: 'Leica DG 42.5mm f/1.2' },
  // Smartphone Cameras
  phone_13_uw:    { brand: 'Phone', minApertureIdx: 2, maxApertureIdx: 2, fixedAperture: true, focalLengthMm: 13,  minMm: 13,  maxMm: 13,  label: 'Ultrawide (13mm f/2.2)' },
  phone_77_tele:  { brand: 'Phone', minApertureIdx: 3, maxApertureIdx: 3, fixedAperture: true, focalLengthMm: 77,  minMm: 77,  maxMm: 77,  label: 'Telephoto (77mm f/2.8)' },
  phone_120_tele: { brand: 'Phone', minApertureIdx: 3, maxApertureIdx: 3, fixedAperture: true, focalLengthMm: 120, minMm: 120, maxMm: 120, label: 'Periscope Tele (120mm f/2.8)' }
};

export const BRAND_CAMERA_MODES = {
  canon: {
    brandName: 'Canon',
    modes: [
      { id: 'M', label: 'M', fullName: 'Manual (M)', desc: 'Direct physical control over Aperture, Shutter & ISO dials.' },
      { id: 'A', label: 'Av', fullName: 'Aperture Priority (Av)', desc: 'Aperture locked to choice; Shutter & ISO float to scene EV.' },
      { id: 'S', label: 'Tv', fullName: 'Shutter Priority (Tv)', desc: 'Shutter locked to choice; Aperture & ISO float to scene EV.' },
      { id: 'P', label: 'P', fullName: 'Program AE (P)', desc: 'Balanced shutter & aperture paired to focal length.' },
      { id: 'AUTO', label: 'A+', fullName: 'Scene Intelligent Auto (A+)', desc: 'Fully automated exposure triangle for quick capture.' }
    ]
  },
  sony: {
    brandName: 'Sony',
    modes: [
      { id: 'M', label: 'M', fullName: 'Manual (M)', desc: 'Direct physical control over Aperture, Shutter & ISO dials.' },
      { id: 'A', label: 'A', fullName: 'Aperture Priority (A)', desc: 'Aperture locked to choice; Shutter & ISO float to scene EV.' },
      { id: 'S', label: 'S', fullName: 'Shutter Priority (S)', desc: 'Shutter locked to choice; Aperture & ISO float to scene EV.' },
      { id: 'P', label: 'P', fullName: 'Program Auto (P)', desc: 'Balanced shutter & aperture paired to focal length.' },
      { id: 'AUTO', label: 'AUTO', fullName: 'Intelligent Auto', desc: 'Full scene-metered exposure automation.' }
    ]
  },
  nikon: {
    brandName: 'Nikon',
    modes: [
      { id: 'M', label: 'M', fullName: 'Manual (M)', desc: 'Direct physical control over Aperture, Shutter & ISO dials.' },
      { id: 'A', label: 'A', fullName: 'Aperture Priority (A)', desc: 'Aperture locked to choice; Shutter & ISO float to scene EV.' },
      { id: 'S', label: 'S', fullName: 'Shutter Priority (S)', desc: 'Shutter locked to choice; Aperture & ISO float to scene EV.' },
      { id: 'P', label: 'P', fullName: 'Programmed Auto (P)', desc: 'Balanced shutter & aperture paired to focal length.' },
      { id: 'AUTO', label: 'AUTO', fullName: 'Auto Mode', desc: 'Complete automated exposure triangle managed by camera meter.' }
    ]
  },
  lumix: {
    brandName: 'Lumix',
    modes: [
      { id: 'M', label: 'M', fullName: 'Manual (M)', desc: 'Direct physical control over Aperture, Shutter & ISO dials.' },
      { id: 'A', label: 'A', fullName: 'Aperture Priority (A)', desc: 'Aperture locked to choice; Shutter & ISO float to scene EV.' },
      { id: 'S', label: 'S', fullName: 'Shutter Priority (S)', desc: 'Shutter locked to choice; Aperture & ISO float to scene EV.' },
      { id: 'P', label: 'P', fullName: 'Program AE (P)', desc: 'Balanced shutter & aperture paired to focal length.' },
      { id: 'AUTO', label: 'iA', fullName: 'Intelligent Auto (iA)', desc: 'Smart scene recognition & exposure automation.' }
    ]
  },
  fujifilm: {
    brandName: 'Fujifilm',
    modes: [
      { id: 'M', label: 'M', fullName: 'Manual (M)', desc: 'Top Shutter dial & Lens Aperture ring both set off "A".' },
      { id: 'A', label: 'A', fullName: 'Aperture Priority (A)', desc: 'Shutter dial on "A"; turn marked Aperture ring on lens.' },
      { id: 'S', label: 'S', fullName: 'Shutter Priority (S)', desc: 'Lens ring on "A"; turn mechanical Shutter dial.' },
      { id: 'P', label: 'P', fullName: 'Program AE (P)', desc: 'Both top Shutter dial and Lens Aperture ring set to "A".' },
      { id: 'AUTO', label: 'AUTO', fullName: 'Auto Mode', desc: 'Physical Auto lever engaged or all dials on "A".' }
    ]
  },
  phone: {
    brandName: 'Smartphone',
    modes: [
      { id: 'M', label: 'PRO', fullName: 'Pro / Manual', desc: 'Direct manual shutter and ISO sensor control.' },
      { id: 'A', label: 'Av', fullName: 'Aperture / Depth', desc: 'Shallow depth-of-field portrait priority.' },
      { id: 'S', label: 'Tv', fullName: 'Shutter / Action', desc: 'Fast action freeze or silky motion blur priority.' },
      { id: 'P', label: 'P', fullName: 'Program', desc: 'Balanced smart exposure metering.' },
      { id: 'AUTO', label: 'AUTO', fullName: 'Photo / Auto', desc: 'Computational multi-frame HDR automation.' }
    ]
  }
};

export const CAMERA_CONTROL_GUIDE = {
  sony_a7iv: {
    modeDial: 'Set top Mode Dial to A (Aperture Priority), S (Shutter Priority), or M (Manual)',
    aperture: {
      location: 'Front Control Dial',
      detail: 'Rotate the front dial located directly beneath your right index finger on the grip.'
    },
    shutter: {
      location: 'Rear Control Dial',
      detail: 'Rotate the upper-rear dial located under your right thumb on the top plate.'
    },
    iso: {
      location: 'Rear Control Wheel (or C1 / Fn)',
      detail: 'Rotate the circular control wheel on the back, or press the right edge of the wheel (marked ISO).'
    }
  },
  canon_r5: {
    modeDial: 'Press Mode button in the center of the rear dial, rotate to Av, Tv, or M',
    aperture: {
      location: 'Top Main Dial (or Lens Control Ring)',
      detail: 'Rotate the main electronic dial on the grip just behind the shutter button, or the customizable control ring on RF lenses.'
    },
    shutter: {
      location: 'Quick Control Dial 1 (Back Wheel)',
      detail: 'Rotate the large circular Quick Control dial on the back panel with your thumb.'
    },
    iso: {
      location: 'M-Fn Button (or Top Dial 2)',
      detail: 'Tap the M-Fn button next to the shutter button and turn the main dial, or rotate the top-plate Quick Control Dial 2.'
    }
  },
  nikon_z6: {
    modeDial: 'Hold Mode button on top left and rotate main command dial to A, S, or M',
    aperture: {
      location: 'Sub-Command Dial (Front)',
      detail: 'Rotate the front sub-command dial on the grip under your right index finger.'
    },
    shutter: {
      location: 'Main Command Dial (Rear)',
      detail: 'Rotate the rear main command dial on the back corner under your right thumb.'
    },
    iso: {
      location: 'Dedicated ISO Button + Rear Dial',
      detail: 'Hold down the physical ISO button located behind the shutter release, and rotate the rear command dial.'
    }
  },
  panasonic_s5: {
    modeDial: 'Turn the top-left Mode Dial to A, S, or M',
    aperture: {
      location: 'Front Command Dial',
      detail: 'Rotate the front dial circling the shutter button on the grip.'
    },
    shutter: {
      location: 'Rear Command Dial',
      detail: 'Rotate the rear thumb dial located on the top-right back edge.'
    },
    iso: {
      location: 'Dedicated ISO Button',
      detail: 'Press the middle tactile button on top (between WB and Exposure Comp) with your index finger, then rotate the rear dial.'
    }
  },
  fuji_xt5: {
    modeDial: 'Turn physical dials: set Aperture ring & Shutter dial to desired values (or "A" for auto)',
    aperture: {
      location: 'Lens Physical Aperture Ring',
      detail: 'Rotate the marked aperture ring on your Fujinon lens barrel (or front command dial if lens has no ring).'
    },
    shutter: {
      location: 'Top Shutter Speed Dial',
      detail: 'Rotate the dedicated mechanical shutter dial on the top plate (e.g. 250, 1000, or "T" for sub-second precision).'
    },
    iso: {
      location: 'Top-Left ISO Dial',
      detail: 'Lift the outer ring of the top-left mechanical dial and rotate to select your target ISO value.'
    }
  },
  sony_a6700: {
    modeDial: 'Set top Mode Dial to A, S, or M',
    aperture: {
      location: 'Front Grip Dial',
      detail: 'Rotate the front control dial under your index finger on the grip.'
    },
    shutter: {
      location: 'Rear Top Dial',
      detail: 'Rotate the rear top dial under your right thumb.'
    },
    iso: {
      location: 'Control Wheel (Right edge)',
      detail: 'Press the right side of the directional wheel on the back (labeled ISO) and rotate the wheel.'
    }
  },
  nikon_z50: {
    modeDial: 'Turn Mode Dial to A, S, or M (or top mechanical dials on Z fc)',
    aperture: {
      location: 'Sub-Command Dial (Front)',
      detail: 'Rotate the front sub-command dial on the grip under your index finger.'
    },
    shutter: {
      location: 'Main Command Dial (Rear)',
      detail: 'Rotate the rear command dial under your thumb (or top mechanical dial on Z fc).'
    },
    iso: {
      location: 'ISO Button + Rear Command Dial',
      detail: 'Press the physical ISO button on top and turn the rear command dial (or dedicated ISO dial on Z fc).'
    }
  },
  canon_r7: {
    modeDial: 'Rotate top Mode Dial to Av, Tv, or M',
    aperture: {
      location: 'Main Dial (Grip)',
      detail: 'Rotate the main dial on top of the grip directly behind the shutter button.'
    },
    shutter: {
      location: 'Quick Control Dial (Thumb Wheel)',
      detail: 'Rotate the control wheel circling the multi-controller joystick on the back.'
    },
    iso: {
      location: 'M-Fn Button',
      detail: 'Tap the M-Fn button near the shutter release and scroll to ISO with the main dial.'
    }
  },
  lumix_gh6: {
    modeDial: 'Turn top Mode Dial to A, S, or M',
    aperture: {
      location: 'Front Dial (Grip)',
      detail: 'Rotate the front dial around the shutter button with your index finger.'
    },
    shutter: {
      location: 'Rear Dial (Thumb)',
      detail: 'Rotate the rear control dial on the top back edge with your thumb.'
    },
    iso: {
      location: 'Dedicated ISO Button',
      detail: 'Press the raised ISO button on top (next to WB) and adjust with the front or rear dial.'
    }
  },
  fuji_gfx: {
    modeDial: 'Set top Mode Dial to A, S, or M',
    aperture: {
      location: 'Front Command Dial / Lens Ring',
      detail: 'Rotate the lens aperture ring or click the front command dial on the grip.'
    },
    shutter: {
      location: 'Rear Command Dial',
      detail: 'Rotate the rear command dial under your right thumb.'
    },
    iso: {
      location: 'Dedicated ISO Button (or Q Menu)',
      detail: 'Press the ISO button on the top plate or tap Q menu on the touchscreen.'
    }
  },
  phone_pro: {
    modeDial: 'Open Pro / Manual mode in your camera app (or Halide / Blackmagic Cam / Expert RAW)',
    aperture: {
      location: 'Fixed Physical Aperture (Portrait Mode for Depth)',
      detail: 'Smartphones have fixed lenses (typically f/1.8). Use "Portrait Mode" to adjust simulated depth-of-field in software.'
    },
    shutter: {
      location: 'Pro Mode "S / Speed" Slider',
      detail: 'Switch to Pro / Manual mode and drag the Shutter Speed slider on screen.'
    },
    iso: {
      location: 'Pro Mode "ISO" Slider',
      detail: 'Drag the ISO slider in Pro mode to adjust sensor gain.'
    }
  }
};

export const PRESET_LOCATIONS = {
  tokyo:   { name: 'Shinjuku, Tokyo', lat: 35.6938, lon: 139.7034, timezone: 'Asia/Tokyo', forceSunAlt: -18.0, clouds: 25, temp: 16, uv: 0, weather: 'Clear Night' },
  iceland: { name: 'Vik, Iceland', lat: 63.4186, lon: -19.0060, timezone: 'Atlantic/Reykjavik', forceSunAlt: 4.5, clouds: 30, temp: 4, uv: 1, weather: 'Partly Cloudy' },
  sahara:  { name: 'Merzouga, Sahara', lat: 31.0802, lon: -4.0134, timezone: 'Africa/Casablanca', forceSunAlt: 58.0, clouds: 2, temp: 38, uv: 10, weather: 'Harsh Sun' },
  london:  { name: 'London, UK', lat: 51.5074, lon: -0.1278, timezone: 'Europe/London', forceSunAlt: 26.0, clouds: 88, temp: 12, uv: 2, weather: 'Overcast' }
};

export function getCameraBrandKey(camera) {
  const brand = ((camera && camera.brand) || '').toLowerCase();
  if (brand.includes('canon')) return 'canon';
  if (brand.includes('sony')) return 'sony';
  if (brand.includes('nikon')) return 'nikon';
  if (brand.includes('lumix') || brand.includes('panasonic')) return 'lumix';
  if (brand.includes('fuji')) return 'fujifilm';
  if (brand.includes('phone') || brand.includes('apple') || brand.includes('samsung') || brand.includes('google') || brand.includes('pixel')) return 'phone';
  return 'sony';
}
