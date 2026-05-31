const playwright = require('playwright');
const path = require('path');
const fs = require('fs');

const screenshotsDir = './verification-screenshots';

// Create screenshots directory
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir);
}

async function runVerification() {
  const browser = await playwright.chromium.launch();
  const context = await browser.createBrowserContext();
  const page = await context.newPage();

  const baseURL = 'http://localhost:5174';
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'Test123!@#';

  let testsPassed = 0;
  let testsFailed = 0;

  async function takeScreenshot(name) {
    const filepath = path.join(screenshotsDir, `${name}.png`);
    await page.screenshot({ path: filepath, fullPage: true });
    console.log(`  📸 Screenshot: ${filepath}`);
    return filepath;
  }

  async function test(name, fn) {
    console.log(`\n✏️  ${name}`);
    try {
      await fn();
      console.log(`  ✅ PASS`);
      testsPassed++;
    } catch (err) {
      console.log(`  ❌ FAIL: ${err.message}`);
      testsFailed++;
    }
  }

  try {
    // Test 1: Home page shows "Get Started Free" when not logged in
    await test('Step 1: Home page shows "Get Started Free" button', async () => {
      await page.goto(`${baseURL}/`);
      await page.waitForTimeout(500);

      const getStartedBtn = await page.$('a[href="/signup"]:has-text("Get Started")');
      if (!getStartedBtn) {
        throw new Error('Get Started Free button not found');
      }
      await takeScreenshot('01-home-not-logged-in');
    });

    // Test 2: Navigation to signup
    await test('Step 2: Click "Get Started Free" button', async () => {
      const getStartedBtn = await page.$('a[href="/signup"]:has-text("Get Started")');
      if (!getStartedBtn) {
        throw new Error('Get Started Free button not found');
      }
      await getStartedBtn.click();
      await page.waitForURL(`${baseURL}/signup`);
      await page.waitForTimeout(500);
      await takeScreenshot('02-signup-page');
    });

    // Test 3: Fill signup form
    await test('Step 3: Fill and submit signup form', async () => {
      const nameInput = await page.$('input[placeholder*="name" i]');
      const emailInput = await page.$('input[type="email"]');
      const passwordInput = await page.$('input[type="password"]');

      if (!nameInput || !emailInput || !passwordInput) {
        throw new Error('Signup form fields not found');
      }

      await nameInput.fill('Test User');
      await emailInput.fill(testEmail);
      await passwordInput.fill(testPassword);

      const submitBtn = await page.$('button[type="submit"]');
      if (submitBtn) {
        await submitBtn.click();
        await page.waitForTimeout(1500);
      }
    });

    // Test 4: Check if logged in or redirected
    await test('Step 4: Verify user is authenticated', async () => {
      // Wait a bit for any redirects
      await page.waitForTimeout(1000);

      // Check if we can see the user menu button (only shown when authenticated)
      const userMenuBtn = await page.$('#user-menu-btn');
      if (!userMenuBtn) {
        throw new Error('User menu button not found - user may not be authenticated');
      }
      await takeScreenshot('03-after-signup');
    });

    // Test 5: Check header shows user name
    await test('Step 5: Header displays username', async () => {
      const userName = await page.$('#user-menu-btn');
      if (!userName) {
        throw new Error('User name element not found in header');
      }

      // Check if the user's initial or name is visible
      const text = await userName.textContent();
      if (!text || text.trim().length === 0) {
        throw new Error('User name is empty in header');
      }
      console.log(`    Username in header: ${text.trim()}`);
    });

    // Test 6: Click username to open dropdown
    await test('Step 6: Click username to open dropdown menu', async () => {
      const userMenuBtn = await page.$('#user-menu-btn');
      await userMenuBtn.click();
      await page.waitForTimeout(300);

      const dropdown = await page.$('#user-dropdown');
      if (!dropdown) {
        throw new Error('Dropdown menu not found');
      }

      const isVisible = await dropdown.isVisible();
      if (!isVisible) {
        throw new Error('Dropdown menu is not visible after clicking username');
      }
      await takeScreenshot('04-dropdown-open');
    });

    // Test 7: Verify dropdown has expected items
    await test('Step 7: Verify dropdown menu items (Profile, Settings, Logout)', async () => {
      const profileLink = await page.$('a[href="/profile"]');
      const settingsLink = await page.$('a[href="/settings"]');
      const logoutBtn = await page.$('#logout-btn');

      if (!profileLink) throw new Error('Profile link not found in dropdown');
      if (!settingsLink) throw new Error('Settings link not found in dropdown');
      if (!logoutBtn) throw new Error('Logout button not found in dropdown');
    });

    // Test 8: Close dropdown by clicking elsewhere
    await test('Step 8: Close dropdown by clicking elsewhere', async () => {
      await page.click('body', { position: { x: 100, y: 100 } });
      await page.waitForTimeout(300);

      const dropdown = await page.$('#user-dropdown');
      const isHidden = await dropdown.evaluate(el => el.classList.contains('hidden'));

      if (!isHidden) {
        throw new Error('Dropdown did not close when clicking outside');
      }
    });

    // Test 9: Navigate to watchlist
    await test('Step 9: Navigate to /watchlist page', async () => {
      await page.goto(`${baseURL}/watchlist`);
      await page.waitForTimeout(500);

      const header = await page.$('header');
      if (!header) {
        throw new Error('Header not found on watchlist page');
      }
      await takeScreenshot('05-watchlist-page');
    });

    // Test 10: Verify dropdown works on watchlist
    await test('Step 10: Verify dropdown works on /watchlist', async () => {
      const userMenuBtn = await page.$('#user-menu-btn');
      if (!userMenuBtn) {
        throw new Error('User menu button not found on watchlist page');
      }

      await userMenuBtn.click();
      await page.waitForTimeout(300);

      const dropdown = await page.$('#user-dropdown');
      const isVisible = await dropdown.isVisible();

      if (!isVisible) {
        throw new Error('Dropdown menu did not open on watchlist page');
      }
      await takeScreenshot('06-watchlist-dropdown');
    });

    // Test 11: Close dropdown
    await test('Step 11: Close dropdown on watchlist', async () => {
      await page.click('body', { position: { x: 100, y: 100 } });
      await page.waitForTimeout(300);
    });

    // Test 12: Navigate to home page and check for "Go to Dashboard" button
    await test('Step 12: Home page shows "Go to Dashboard" when logged in', async () => {
      await page.goto(`${baseURL}/`);
      await page.waitForTimeout(500);

      // Should have "Go to Dashboard" button instead of "Get Started Free"
      const goToDashboardBtn = await page.$('a[href="/dashboard"]:has-text("Go to Dashboard")');
      if (!goToDashboardBtn) {
        throw new Error('Go to Dashboard button not found - home page not updated after login');
      }

      const getStartedBtn = await page.$('a[href="/signup"]:has-text("Get Started")');
      if (getStartedBtn) {
        throw new Error('Get Started Free button still showing - should be hidden when logged in');
      }

      await takeScreenshot('07-home-logged-in');
    });

    // Test 13: Navigate via "Go to Dashboard" button
    await test('Step 13: Click "Go to Dashboard" button', async () => {
      const goToDashboardBtn = await page.$('a[href="/dashboard"]');
      await goToDashboardBtn.click();
      await page.waitForURL(`${baseURL}/dashboard`);
      await page.waitForTimeout(500);
      await takeScreenshot('08-dashboard-page');
    });

    // Test 14: Test dropdown on dashboard
    await test('Step 14: Verify dropdown works on dashboard', async () => {
      const userMenuBtn = await page.$('#user-menu-btn');
      if (!userMenuBtn) {
        throw new Error('User menu button not found on dashboard');
      }

      await userMenuBtn.click();
      await page.waitForTimeout(300);

      const dropdown = await page.$('#user-dropdown');
      const isVisible = await dropdown.isVisible();

      if (!isVisible) {
        throw new Error('Dropdown did not open on dashboard');
      }
    });

    // Test 15: Logout
    await test('Step 15: Click logout button', async () => {
      const logoutBtn = await page.$('#logout-btn');
      if (!logoutBtn) {
        throw new Error('Logout button not found');
      }

      await logoutBtn.click();
      await page.waitForURL(`${baseURL}/login`);
      await page.waitForTimeout(500);
      await takeScreenshot('09-after-logout');
    });

    // Test 16: Verify "Get Started Free" is back after logout
    await test('Step 16: Home page shows "Get Started Free" again after logout', async () => {
      await page.goto(`${baseURL}/`);
      await page.waitForTimeout(500);

      const getStartedBtn = await page.$('a[href="/signup"]:has-text("Get Started")');
      if (!getStartedBtn) {
        throw new Error('Get Started Free button not found after logout');
      }

      const goToDashboardBtn = await page.$('a[href="/dashboard"]');
      if (goToDashboardBtn) {
        throw new Error('Go to Dashboard button still showing after logout');
      }

      await takeScreenshot('10-home-after-logout');
    });

  } catch (err) {
    console.error('❌ Unexpected error:', err);
    testsFailed++;
  } finally {
    await context.close();
    await browser.close();

    console.log('\n' + '='.repeat(50));
    console.log(`\n📊 SUMMARY:\n  ✅ Passed: ${testsPassed}\n  ❌ Failed: ${testsFailed}\n`);

    if (testsFailed === 0) {
      console.log('🎉 All verification tests passed!');
      process.exit(0);
    } else {
      console.log(`⚠️  ${testsFailed} test(s) failed`);
      process.exit(1);
    }
  }
}

runVerification();
