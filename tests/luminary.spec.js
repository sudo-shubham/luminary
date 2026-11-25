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

    // Switch to interactive Leaflet Scouting Map and verify container renders
    await page.getByRole('button', { name: /^Map$/i }).click();
    await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 5000 });
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
});
