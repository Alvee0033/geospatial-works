const { chromium } = require('playwright-core');

async function run() {
  const browser = await chromium.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  // Go to login page
  console.log('Navigating to login...');
  await page.goto('http://localhost:3009/login', { waitUntil: 'networkidle' });

  // Fill superadmin login
  await page.fill('input[type="email"]', 'superadmin@gw.com');
  await page.fill('input[type="password"]', 'GWSuperAdmin@2026');
  await page.click('button[type="submit"]');

  console.log('Waiting for navigation to dashboard/projects...');
  await page.waitForTimeout(3000);

  // Navigate to /projects/new
  console.log('Navigating to /projects/new...');
  await page.goto('http://localhost:3009/projects/new', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Take screenshot
  const screenshotPath = '/home/alvee/.gemini/antigravity/brain/3d7139ca-4048-4cca-a2ef-1017282d2f5d/geofence_ui_screen.png';
  await page.screenshot({ path: screenshotPath, fullPage: false });
  console.log('Screenshot saved to:', screenshotPath);

  // Also navigate to settings
  console.log('Navigating to /settings...');
  await page.goto('http://localhost:3009/settings', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  const settingsScreenshotPath = '/home/alvee/.gemini/antigravity/brain/3d7139ca-4048-4cca-a2ef-1017282d2f5d/geofence_settings_screen.png';
  await page.screenshot({ path: settingsScreenshotPath, fullPage: false });
  console.log('Settings screenshot saved to:', settingsScreenshotPath);

  await browser.close();
}

run().catch(console.error);
