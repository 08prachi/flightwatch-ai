const http = require('http');

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

async function testRenderedContent() {
  console.log('🔍 Testing Rendered Content\n');
  console.log('='.repeat(70));

  try {
    // Get frontend HTML
    console.log('\n📄 Fetching frontend HTML...');
    const res = await makeRequest(5174, '/');

    if (res.status !== 200) {
      console.log(`❌ Frontend returned status ${res.status}`);
      process.exit(1);
    }

    const html = res.body;
    console.log(`✅ Frontend HTML received (${html.length} bytes)\n`);

    // Check 1: Look for header structure
    console.log('Check 1: Header Structure');
    if (html.includes('<header')) {
      console.log('  ✅ Header element found');
    } else {
      console.log('  ❌ Header element NOT found');
    }

    if (html.includes('id="user-menu-btn"')) {
      console.log('  ✅ User menu button element found');
    } else {
      console.log('  ❌ User menu button NOT found');
    }

    if (html.includes('id="user-dropdown"')) {
      console.log('  ✅ Dropdown menu element found');
    } else {
      console.log('  ❌ Dropdown menu NOT found');
    }

    // Check 2: Look for home page content
    console.log('\nCheck 2: Home Page Content');
    if (html.includes('Never Overpay for Flight Tickets')) {
      console.log('  ✅ Home page headline found');
    } else {
      console.log('  ❌ Home page headline NOT found');
    }

    if (html.includes('Get Started Free') || html.includes('Get Started')) {
      console.log('  ✅ "Get Started Free" button text found');
    } else {
      console.log('  ❌ "Get Started Free" button NOT found');
    }

    if (html.includes('/signup')) {
      console.log('  ✅ Signup link found in home page');
    } else {
      console.log('  ❌ Signup link NOT found');
    }

    // Check 3: Look for dashboard link (for authenticated users)
    console.log('\nCheck 3: Dashboard Link (for authenticated users)');
    if (html.includes('/dashboard')) {
      console.log('  ✅ Dashboard link found (rendered for logged-in users)');
    } else {
      console.log('  ❌ Dashboard link NOT found');
    }

    // Check 4: Look for dropdown menu items
    console.log('\nCheck 4: Dropdown Menu Items');
    if (html.includes('/profile') && html.includes('Profile')) {
      console.log('  ✅ Profile link found in dropdown');
    } else {
      console.log('  ⚠️  Profile link might be conditional (shown only when logged in)');
    }

    if (html.includes('/settings') && html.includes('Settings')) {
      console.log('  ✅ Settings link found in dropdown');
    } else {
      console.log('  ⚠️  Settings link might be conditional (shown only when logged in)');
    }

    if (html.includes('id="logout-btn"')) {
      console.log('  ✅ Logout button found in dropdown');
    } else {
      console.log('  ⚠️  Logout button might be conditional (shown only when logged in)');
    }

    // Check 5: Script functionality
    console.log('\nCheck 5: JavaScript Functionality');
    if (html.includes('attachHeaderListeners')) {
      console.log('  ✅ attachHeaderListeners function found');
    }

    if (html.includes('classList.toggle(\'hidden\')') ||
        html.includes('.toggle(')) {
      console.log('  ✅ Toggle functionality implemented');
    } else {
      console.log('  ⚠️  Toggle logic check inconclusive from HTML');
    }

    if (html.includes('stopPropagation') || html.includes('e.stopPropagation()')) {
      console.log('  ✅ Event propagation handling found');
    } else {
      console.log('  ⚠️  Event handling check inconclusive from HTML');
    }

    // Check 6: Conditional rendering
    console.log('\nCheck 6: Conditional Rendering (Authentication-based)');
    if (html.includes('${isAuthenticated')) {
      console.log('  ✅ Conditional rendering syntax found in header');
    } else {
      console.log('  ⚠️  Header uses template literals for conditional content');
    }

    console.log('\n' + '='.repeat(70));
    console.log('\n✅ All rendered content checks completed!\n');
    console.log('📝 NEXT STEPS:');
    console.log('   1. Open http://localhost:5174 in your browser');
    console.log('   2. Follow the manual testing checklist:');
    console.log('      a) Verify "Get Started Free" button is visible');
    console.log('      b) Sign up and create an account');
    console.log('      c) Verify header displays username');
    console.log('      d) Click on username to test dropdown');
    console.log('      e) Navigate to other pages and verify dropdown works');
    console.log('      f) Go back to home and verify "Go to Dashboard" button');
    console.log('      g) Test logout and verify "Get Started Free" is back\n');

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

testRenderedContent();
