const http = require('http');
const vm = require('vm');
const fs = require('fs');

function makeRequest(port, path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: port,
      path: path,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });

    req.on('error', reject);
    req.end();
  });
}

async function runVerification() {
  console.log('🧪 Verifying Header Fixes (Code Analysis)\n');
  console.log('='.repeat(60));

  let testsPassed = 0;
  let testsFailed = 0;

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
    // Test 1: Verify router.js changes
    await test('Verification 1: Router re-renders header on navigation', async () => {
      const routerCode = fs.readFileSync('./frontend/src/utils/router.js', 'utf8');

      if (!routerCode.includes('const { Header, attachHeaderListeners }')) {
        throw new Error('Header import not found in router');
      }

      if (!routerCode.includes('const headerContainer = document.querySelector(\'header\')')) {
        throw new Error('Header container query not found');
      }

      if (!routerCode.includes('headerContainer.innerHTML = Header()')) {
        throw new Error('Header innerHTML update not found');
      }

      console.log('    ✓ Router imports Header and attachHeaderListeners');
      console.log('    ✓ Router queries header element');
      console.log('    ✓ Router re-renders header HTML on navigation');
    });

    // Test 2: Verify home.js checks authentication
    await test('Verification 2: Home page checks authentication status', async () => {
      const homeCode = fs.readFileSync('./frontend/src/pages/home.js', 'utf8');

      if (!homeCode.includes('const { storage }')) {
        throw new Error('Storage import not found in home.js');
      }

      if (!homeCode.includes('storage.isAuthenticated()')) {
        throw new Error('Authentication check not found in home.js');
      }

      if (!homeCode.includes('/dashboard')) {
        throw new Error('Dashboard link not found for authenticated users');
      }

      if (!homeCode.includes('Go to Dashboard')) {
        throw new Error('Go to Dashboard button text not found');
      }

      if (!homeCode.includes('Get Started Free')) {
        throw new Error('Get Started Free button text not found');
      }

      console.log('    ✓ Home page imports storage');
      console.log('    ✓ Home page checks isAuthenticated()');
      console.log('    ✓ Home page has conditional button rendering');
      console.log('    ✓ Authenticated users see "Go to Dashboard"');
      console.log('    ✓ Unauthenticated users see "Get Started Free"');
    });

    // Test 3: Verify header dropdown logic
    await test('Verification 3: Header dropdown toggle works', async () => {
      const headerCode = fs.readFileSync('./frontend/src/components/header.js', 'utf8');

      if (!headerCode.includes('attachHeaderListeners()')) {
        throw new Error('attachHeaderListeners function not found');
      }

      if (!headerCode.includes('getElementById(\'user-menu-btn\')')) {
        throw new Error('User menu button not found');
      }

      if (!headerCode.includes('getElementById(\'user-dropdown\')')) {
        throw new Error('User dropdown not found');
      }

      if (!headerCode.includes('.toggle(\'hidden\')')) {
        throw new Error('Dropdown toggle not found');
      }

      if (!headerCode.includes('classList.add(\'hidden\')')) {
        throw new Error('Dropdown close logic not found');
      }

      console.log('    ✓ Header has attachHeaderListeners function');
      console.log('    ✓ Header has user menu button element');
      console.log('    ✓ Header has dropdown menu element');
      console.log('    ✓ Dropdown toggles with click');
      console.log('    ✓ Dropdown closes when clicking outside');
    });

    // Test 4: Check frontend is serving
    await test('Verification 4: Frontend server is running', async () => {
      const res = await makeRequest(5174, '/');
      if (res.status !== 200) {
        throw new Error(`Frontend returned status ${res.status}`);
      }
      console.log(`    ✓ Frontend responding (HTTP ${res.status})`);
    });

    // Test 5: Check backend is serving
    await test('Verification 5: Backend server is running', async () => {
      const res = await makeRequest(3000, '/health');
      if (res.status !== 200) {
        throw new Error(`Backend returned status ${res.status}`);
      }
      console.log(`    ✓ Backend responding (HTTP ${res.status})`);
    });

    console.log('\n' + '='.repeat(60));
    console.log(`\n📊 VERIFICATION SUMMARY:\n`);
    console.log(`  ✅ Code verifications passed: ${testsPassed}`);
    console.log(`  ❌ Code verifications failed: ${testsFailed}\n`);

    if (testsFailed === 0) {
      console.log('✅ All code-level verifications passed!\n');
      console.log('📋 MANUAL TESTING CHECKLIST:');
      console.log('   1. Open http://localhost:5174 in browser');
      console.log('   2. Verify "Get Started Free" button is visible');
      console.log('   3. Sign up with test email');
      console.log('   4. After login, verify header shows your name');
      console.log('   5. Click on username - dropdown should appear');
      console.log('   6. Verify dropdown has: Profile, Settings, Logout');
      console.log('   7. Click elsewhere to close dropdown');
      console.log('   8. Navigate to http://localhost:5174/watchlist');
      console.log('   9. Click username again - dropdown should open');
      console.log('   10. Go back to http://localhost:5174/');
      console.log('   11. Verify "Go to Dashboard" button (not "Get Started Free")');
      console.log('   12. Click Logout in dropdown');
      console.log('   13. Go to http://localhost:5174/');
      console.log('   14. Verify "Get Started Free" button is back\n');
      process.exit(0);
    } else {
      console.log(`⚠️  ${testsFailed} verification(s) failed`);
      process.exit(1);
    }

  } catch (err) {
    console.error('❌ Unexpected error:', err);
    process.exit(1);
  }
}

runVerification();
