import { test, expect } from '@playwright/test';

test.describe('Luminary Photography Assistant', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  });

  test('should display app title and header controls', async ({ page }) => {
    await expect(page).toHaveTitle(/Luminary/i);
    const heading = page.locator('header');
    await expect(heading).toBeVisible();
    await expect(page.locator('text=LUMINARY').first()).toBeVisible();
  });

  test('should display date switcher with Today and Tomorrow (+1d)', async ({ page }) => {
    const todayBtn = page.locator('button:has-text("Today")').first();
    const tomorrowBtn = page.locator('button:has-text("Tomorrow")').first();
    await expect(todayBtn).toBeVisible();
    await expect(tomorrowBtn).toBeVisible();

    // Toggle Tomorrow
    await tomorrowBtn.click();
    await expect(tomorrowBtn).toHaveClass(/bg-amber-500/);

    // Toggle back to Today
    await todayBtn.click();
    await expect(todayBtn).toHaveClass(/bg-amber-500/);
  });

  test('should display quick jump solar buttons', async ({ page }) => {
    await expect(page.locator('button:has-text("Sunrise")').first()).toBeVisible();
    await expect(page.locator('button:has-text("Golden")').first()).toBeVisible();
    await expect(page.locator('button:has-text("Sunset")').first()).toBeVisible();
    await expect(page.locator('button:has-text("Blue")').first()).toBeVisible();
    await expect(page.locator('button:has-text("Solar Arc")').first()).toBeVisible();
  });

  test('should click Golden Hour button and update Solar Ephemeris card', async ({ page }) => {
    const goldenBtn = page.getByRole('button', { name: /golden/i }).first();
    await goldenBtn.click();
    const solarCard = page.locator('#solar-ephemeris-card');
    await expect(solarCard).toContainText('(Shifted)');
  });

  test('should display Solar Ephemeris & Sky Telemetry card', async ({ page }) => {
    const solarCard = page.locator('#solar-ephemeris-card');
    await expect(solarCard).toBeVisible();
    await expect(solarCard.locator('text=Solar Ephemeris & Sky Telemetry')).toBeVisible();
  });

  test('should have readable warning text in light mode', async ({ page }) => {
    // Switch to light mode if currently in dark mode
    const isDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    if (isDark) {
      await page.getByRole('button', { name: /Toggle visual theme/i }).click();
    }
    await expect(page.evaluate(() => document.documentElement.classList.contains('dark'))).resolves.toBe(false);

    // Trigger a Too dark warning by switching to All Manual and clicking Tokyo Night preset
    await page.getByRole('button', { name: /All Manual/i }).click();
    await page.getByRole('button', { name: /Tokyo Night/i }).click();
    const warning = page.locator('text=/Too dark/i').first();
    await expect(warning).toBeVisible({ timeout: 5000 });

    const color = await warning.evaluate((el) => getComputedStyle(el).color);
    // In light mode, text-rose-900 (oklch(0.41 ...)) should be applied for high contrast
    expect(color).toMatch(/oklch\(0\.41|rgb\(136|rgb\(190/);
  });

  test('should display Afterglow Forecast and Sunrise/Sunset azimuth pins', async ({ page }) => {
    const solarCard = page.locator('#solar-ephemeris-card');
    await expect(solarCard.locator('text=Sunrise Light')).toBeVisible();
    await expect(solarCard.locator('text=Sunset Light')).toBeVisible();

    const srPinBtn = page.getByRole('button', { name: /SR \d+°/ });
    const ssPinBtn = page.getByRole('button', { name: /SS \d+°/ });
    await expect(srPinBtn).toBeVisible();
    await expect(ssPinBtn).toBeVisible();
  });

  test('should export shoot plan as .ics calendar file', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /Add to Calendar/i }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/^luminary-golden-\d{4}-\d{2}-\d{2}\.ics$/);
  });

  test('should compute valid Hyperfocal and Depth of Field without NaN', async ({ page }) => {
    const dofSection = page.locator('div:has-text("Depth of Field & Hyperfocal")').filter({ hasText: 'Near Limit' }).last();
    const dofText = await dofSection.innerText();
    expect(dofText).not.toContain('NaN');
    expect(dofText).toMatch(/\d+(\.\d+)?\s*m/);
  });

  test('should open Nearby Scenic Spots modal and display category filters', async ({ page }) => {
    await page.route('https://overpass-api.de/api/interpreter', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          elements: [
            {
              type: 'node',
              id: 101,
              lat: 28.65,
              lon: 77.25,
              tags: { name: 'Ridge Sunset Overlook', tourism: 'viewpoint', ele: '245' }
            },
            {
              type: 'way',
              id: 102,
              center: { lat: 28.63, lon: 77.26 },
              tags: { name: 'Yamuna Riverfront', waterway: 'river' }
            },
            {
              type: 'node',
              id: 103,
              lat: 28.62,
              lon: 77.22,
              tags: { name: 'Rajiv Chowk Metro Station', railway: 'station' }
            },
            {
              type: 'node',
              id: 104,
              lat: 28.6139,
              lon: 77.209,
              tags: { name: 'New Delhi', historic: 'monument' }
            },
            {
              type: 'node',
              id: 105,
              lat: 28.615,
              lon: 77.21,
              tags: { name: 'North Block Secretariat', office: 'government' }
            },
            {
              type: 'node',
              id: 106,
              lat: 28.616,
              lon: 77.211,
              tags: { name: 'Municipal Corporation Building' }
            },
            {
              type: 'node',
              id: 107,
              lat: 28.656,
              lon: 77.241,
              tags: { name: 'Parliament Heritage Palace', historic: 'palace' }
            }
          ]
        })
      });
    });

    await page.route('https://en.wikipedia.org/w/api.php*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          query: {
            pages: {
              '999': {
                thumbnail: {
                  source: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
                }
              }
            }
          }
        })
      });
    });

    await page.getByRole('button', { name: /Spots/i }).click();
    await expect(page.locator('h3:has-text("Nearby Scenic Spots")')).toBeVisible();
    await expect(page.locator('text=Ridge Sunset Overlook')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Yamuna Riverfront')).toBeVisible();
    await expect(page.locator('text=Parliament Heritage Palace')).toBeVisible();
    await expect(page.locator('text=Rajiv Chowk Metro Station')).toHaveCount(0);
    await expect(page.locator('text=North Block Secretariat')).toHaveCount(0);
    await expect(page.locator('text=Municipal Corporation Building')).toHaveCount(0);
    // City name itself should not appear in the spots list
    await expect(page.locator('h4', { hasText: /^New Delhi$/ })).toHaveCount(0);
    await expect(page.locator('text=Nearest Featured Spot')).toBeVisible({ timeout: 5000 });
    // Photos appear on every spot card (featured banner + card thumbnails)
    await expect(page.locator('img[alt="Yamuna Riverfront"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('img[alt="Ridge Sunset Overlook"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('img[alt="Parliament Heritage Palace"]')).toBeVisible({ timeout: 5000 });

    // Switch to interactive Leaflet Scouting Map and verify container + Sun-Time Ray slider render
    await page.getByRole('button', { name: /^Map$/i }).click();
    await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 5000 });
    await expect(page.getByLabel('Sun-Time Ray Hour')).toBeVisible();
    await page.getByRole('button', { name: /^Noon$/i }).click();
    await expect(page.locator('text=Sun-Time Ray: 12:00')).toBeVisible();
    await page.getByRole('button', { name: /^List$/i }).click();

    // Verify Maps link searches by actual place name centered at coordinates
    const mapsHref = await page.getByRole('link', { name: /Maps/i }).first().getAttribute('href');
    expect(mapsHref).toContain('google.com/maps/search/Yamuna%20Riverfront/@28.63,77.26,15z');

    // Filter to Water & Rivers
    await page.getByRole('button', { name: /Water & Rivers/i }).click();
    await expect(page.locator('text=Yamuna Riverfront')).toBeVisible();
    await expect(page.locator('text=Ridge Sunset Overlook')).toBeHidden();

    // Scout Here updates active location
    await page.getByRole('button', { name: /Scout Here/i }).first().click();
    await expect(page.locator('h3:has-text("Nearby Scenic Spots")')).toBeHidden();
    await expect(page.locator('text=Yamuna Riverfront').first()).toBeVisible();
  });

  test('should strictly filter Wikipedia fallback to only scenic photo spots', async ({ page }) => {
    await page.route('https://overpass-api.de/api/interpreter', async (route) => {
      await route.fulfill({ status: 504, body: 'Gateway Timeout' });
    });

    await page.route('https://en.wikipedia.org/w/api.php*', async (route) => {
      const url = route.request().url();
      if (url.includes('list=geosearch')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            query: {
              geosearch: [
                { pageid: 1, title: '2025 Nagpur violence', lat: 21.14, lon: 79.08, dist: 500 },
                { pageid: 2, title: 'Ganesh Peth', lat: 21.141, lon: 79.09, dist: 600 },
                { pageid: 3, title: 'Nagpur Metro Station', lat: 21.142, lon: 79.085, dist: 700 },
                { pageid: 4, title: 'Dhantoli', lat: 21.135, lon: 79.082, dist: 800 },
                { pageid: 5, title: 'Central Provinces', lat: 21.145, lon: 79.088, dist: 900 },
                { pageid: 6, title: 'Kingdom of Nagpur', lat: 21.146, lon: 79.089, dist: 1000 },
                { pageid: 7, title: 'Ambazari Lake', lat: 21.128, lon: 79.043, dist: 4500 },
                { pageid: 8, title: 'Sitabuldi Fort', lat: 21.147, lon: 79.083, dist: 1200 }
              ]
            }
          })
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ query: { pages: {} } })
        });
      }
    });

    await page.getByRole('button', { name: /Spots/i }).click();
    await expect(page.locator('h3:has-text("Nearby Scenic Spots")')).toBeVisible();
    await expect(page.locator('text=Sitabuldi Fort')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Ambazari Lake')).toBeVisible();
    await expect(page.locator('text=2025 Nagpur violence')).toHaveCount(0);
    await expect(page.locator('text=Ganesh Peth')).toHaveCount(0);
    await expect(page.locator('text=Nagpur Metro Station')).toHaveCount(0);
    await expect(page.locator('text=Dhantoli')).toHaveCount(0);
    await expect(page.locator('text=Central Provinces')).toHaveCount(0);
    await expect(page.locator('text=Kingdom of Nagpur')).toHaveCount(0);
  });

  test('should display 24-Hour Hourly Sky & Rain Timeline and preview clicked hour', async ({ page }) => {
    const timeline = page.getByLabel('24-Hour Hourly Sky and Rain Timeline');
    await expect(timeline).toBeVisible();
    await expect(timeline.locator('text=24H SKY & RAIN')).toBeVisible();
    const hourButtons = timeline.locator('button');
    await expect(hourButtons).toHaveCount(24);

    // Click 06:00 bar to preview that hour
    await hourButtons.nth(6).click();
    await expect(page.locator('#solar-ephemeris-card')).toContainText(/05:59|06:00/);
  });

  test('should update exposure and focus settings when changing Scene Priority', async ({ page }) => {
    // Default Landscape starts at f/8
    await expect(page.locator('text=f/8').first()).toBeVisible();

    // Switch to Portrait -> opens up aperture to lens widest (f/3.5) and sets Eye-AF
    await page.getByRole('button', { name: /Portrait/i }).click();
    await expect(page.locator('text=f/3.5').first()).toBeVisible();
    await expect(page.locator('text=AF-S / Eye-AF').first()).toBeVisible();

    // Switch to Silk -> stops down to f/11
    await page.getByRole('button', { name: /Silk/i }).click();
    await expect(page.locator('text=f/11').first()).toBeVisible();
    await expect(page.locator('text=AF-S / Hyperfocal').first()).toBeVisible();
  });

  test('should display Brand + Sensor profiles and brand-specific lenses', async ({ page }) => {
    await expect(page.locator('text=Sony Full Frame').first()).toBeVisible();
    await page.getByRole('button', { name: /Setup/i }).click();
    await page.getByRole('button', { name: 'Change', exact: true }).click();
    await expect(page.locator('#cameraModalTitle')).toBeVisible();

    await page.getByRole('button', { name: /Canon Full Frame/i }).click();
    await expect(page.locator('text=Canon Full Frame').first()).toBeVisible();
    await expect(page.locator('#gearSelectInput optgroup[label="Canon Mount Lenses"]')).toBeAttached();
  });

  test('should display Moon phase, rise/set and Milky Way Dark-Sky Window', async ({ page }) => {
    const solarCard = page.locator('#solar-ephemeris-card');
    await expect(solarCard.locator('text=Milky Way Window')).toBeVisible();
    await expect(solarCard).toContainText(/%\)/);
  });

  test('should export full backup and restore saved data and current state', async ({ page }) => {
    await page.getByRole('button', { name: /Journal/i }).click();
    await expect(page.locator('h2:has-text("Shot Journal")')).toBeVisible();

    // 1. Export Full Backup
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /^Backup$/i }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/^luminary-backup-\d{4}-\d{2}-\d{2}\.json$/);

    // 2. Restore a custom backup JSON
    const backupPayload = JSON.stringify({
      app: 'Luminary',
      backupVersion: 1,
      saved: {
        theme: 'dark',
        camera: 'fuji_xt5',
        gear: 'fuji_23_14',
        shootingMode: 'M',
        customCameras: {},
        customLenses: {},
        journal: []
      },
      currentState: {
        location: { name: 'Spiti Valley', lat: 32.246, lon: 78.034, timezone: 'Asia/Kolkata' },
        style: 'astro',
        support: 'tripod'
      }
    });

    await page.getByLabel('Import Luminary Backup JSON').setInputFiles({
      name: 'luminary-backup-test.json',
      mimeType: 'application/json',
      buffer: Buffer.from(backupPayload, 'utf-8')
    });

    await expect(page.locator('text=Spiti Valley').first()).toBeVisible({ timeout: 3000 });
    await expect(page.locator('text=Fujifilm APS-C').first()).toBeVisible();
  });
});
