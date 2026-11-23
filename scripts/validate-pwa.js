#!/usr/bin/env node
/**
 * Luminary PWA Validation Script
 * Verifies all criteria required by PWABuilder, Lighthouse, and Google Play Store TWA packaging.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
let errorCount = 0;
let warnCount = 0;

function pass(msg) {
  console.log(`\x1b[32m✔ PASS:\x1b[0m ${msg}`);
}

function warn(msg) {
  warnCount++;
  console.log(`\x1b[33m▲ WARN:\x1b[0m ${msg}`);
}

function fail(msg) {
  errorCount++;
  console.log(`\x1b[31m✖ FAIL:\x1b[0m ${msg}`);
}

console.log('\n========================================');
console.log('🌟 Luminary PWABuilder Validation Check');
console.log('========================================\n');

// 1. Check Web App Manifest
const manifestPath = path.join(ROOT_DIR, 'manifest.json');
if (!fs.existsSync(manifestPath)) {
  fail('manifest.json does not exist!');
} else {
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    pass('manifest.json is valid JSON');

    // Check required fields
    if (manifest.name) pass(`Name: "${manifest.name}"`);
    else fail('Missing "name" in manifest.json');

    if (manifest.short_name) {
      if (manifest.short_name.length <= 12) {
        pass(`Short Name: "${manifest.short_name}" (${manifest.short_name.length} chars)`);
      } else {
        warn(`Short Name "${manifest.short_name}" exceeds recommended 12 characters`);
      }
    } else {
      fail('Missing "short_name" in manifest.json');
    }

    if (manifest.start_url) pass(`Start URL: "${manifest.start_url}"`);
    else fail('Missing "start_url" in manifest.json');

    if (manifest.scope) pass(`Scope: "${manifest.scope}"`);
    else fail('Missing "scope" in manifest.json');

    if (manifest.display === 'standalone' || manifest.display === 'fullscreen') {
      pass(`Display mode: "${manifest.display}"`);
    } else {
      warn(`Display mode is "${manifest.display}", "standalone" is recommended`);
    }

    if (manifest.theme_color && manifest.background_color) {
      pass(`Colors: Theme=${manifest.theme_color}, Background=${manifest.background_color}`);
    } else {
      fail('Missing theme_color or background_color in manifest.json');
    }

    // Check Icons
    if (Array.isArray(manifest.icons) && manifest.icons.length > 0) {
      pass(`Found ${manifest.icons.length} icon definitions`);
      let has192 = false;
      let has512 = false;
      let hasMaskable = false;

      manifest.icons.forEach((icon, i) => {
        const iconFile = path.join(ROOT_DIR, icon.src.replace(/^\.\//, ''));
        if (fs.existsSync(iconFile)) {
          pass(`Icon exists: ${icon.src} (${icon.sizes}, ${icon.purpose || 'any'})`);
        } else {
          fail(`Icon file missing on disk: ${icon.src}`);
        }
        if (icon.sizes === '192x192') has192 = true;
        if (icon.sizes === '512x512') has512 = true;
        if (icon.purpose && icon.purpose.includes('maskable')) hasMaskable = true;
      });

      if (has192) pass('192x192 icon present');
      else fail('Missing 192x192 icon');

      if (has512) pass('512x512 icon present');
      else fail('Missing 512x512 icon');

      if (hasMaskable) pass('Maskable adaptive icon present');
      else fail('Missing maskable icon for Android adaptive launchers');
    } else {
      fail('No icons found in manifest.json');
    }

    // Check Screenshots
    if (Array.isArray(manifest.screenshots) && manifest.screenshots.length > 0) {
      pass(`Found ${manifest.screenshots.length} screenshots defined`);
      manifest.screenshots.forEach((sc) => {
        const scFile = path.join(ROOT_DIR, sc.src.replace(/^\.\//, ''));
        if (fs.existsSync(scFile)) {
          pass(`Screenshot exists: ${sc.src} (${sc.form_factor || 'narrow'})`);
        } else {
          fail(`Screenshot missing on disk: ${sc.src}`);
        }
      });
    } else {
      warn('No screenshots defined in manifest.json (recommended for rich installation dialogs)');
    }
  } catch (e) {
    fail(`Failed to parse manifest.json: ${e.message}`);
  }
}

// 2. Check Service Worker
const swPath = path.join(ROOT_DIR, 'sw.js');
if (!fs.existsSync(swPath)) {
  fail('sw.js does not exist!');
} else {
  const swContent = fs.readFileSync(swPath, 'utf8');
  if (swContent.includes("addEventListener('fetch'") || swContent.includes('addEventListener("fetch"')) {
    pass('sw.js contains fetch event handler for offline support');
  } else {
    fail('sw.js is missing a fetch event listener');
  }

  if (swContent.includes("addEventListener('install'") || swContent.includes('addEventListener("install"')) {
    pass('sw.js contains install event listener for pre-caching');
  } else {
    fail('sw.js is missing an install event listener');
  }
}

// 3. Check HTML Service Worker Registration
const indexPath = path.join(ROOT_DIR, 'index.html');
if (!fs.existsSync(indexPath)) {
  fail('index.html does not exist!');
} else {
  const indexContent = fs.readFileSync(indexPath, 'utf8');
  if (indexContent.includes('navigator.serviceWorker.register')) {
    pass('index.html registers the service worker');
  } else {
    fail('index.html does not register the service worker');
  }

  if (indexContent.includes('rel="manifest"') || indexContent.includes("rel='manifest'")) {
    pass('index.html links to the web app manifest');
  } else {
    fail('index.html is missing <link rel="manifest">');
  }

  if (indexContent.includes('<meta name="viewport"')) {
    pass('index.html specifies a mobile viewport');
  } else {
    fail('index.html missing viewport meta tag');
  }
}

// 4. Check GitHub Pages & TWA Asset Links
const nojekyllPath = path.join(ROOT_DIR, '.nojekyll');
if (fs.existsSync(nojekyllPath)) {
  pass('.nojekyll file exists (ensures GitHub Pages serves .well-known)');
} else {
  warn('.nojekyll file missing (GitHub Pages might not serve .well-known directory)');
}

const assetlinksPath = path.join(ROOT_DIR, '.well-known', 'assetlinks.json');
if (fs.existsSync(assetlinksPath)) {
  pass('.well-known/assetlinks.json exists for Digital Asset Links');
} else {
  warn('.well-known/assetlinks.json missing (required to remove Android URL address bar)');
}

// 5. Check Feature Graphic
const featureGraphicPath = path.join(ROOT_DIR, 'feature-graphic-1024x500.png');
if (fs.existsSync(featureGraphicPath)) {
  pass('feature-graphic-1024x500.png exists for Google Play Console');
} else {
  warn('feature-graphic-1024x500.png missing (required by Google Play Store)');
}

console.log('\n----------------------------------------');
if (errorCount === 0) {
  console.log(`\x1b[32m✨ All PWA Builder checks passed! (${warnCount} warnings)\x1b[0m\n`);
  process.exit(0);
} else {
  console.log(`\x1b[31m💥 Validation completed with ${errorCount} errors and ${warnCount} warnings.\x1b[0m\n`);
  process.exit(1);
}
