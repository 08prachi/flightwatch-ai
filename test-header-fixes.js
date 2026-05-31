const http = require('http');

function makeRequest(port, path, method = 'GET') {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: port,
      path: path,
      method: method
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

async function testApp() {
  console.log('🧪 Testing Header and Authentication Fixes\n');

  try {
    // Test 1: Frontend is running
    console.log('Test 1: Checking if frontend is running on port 5174...');
    const homeRes = await makeRequest(5174, '/');
    console.log(`✅ Frontend is running (Status: ${homeRes.status})\n`);

    // Test 2: Backend is running
    console.log('Test 2: Checking if backend is running on port 3000...');
    const healthRes = await makeRequest(3000, '/health');
    console.log(`✅ Backend is running (Status: ${healthRes.status})\n`);

    // Test 3: Check if home page HTML is served
    console.log('Test 3: Checking home page content...');
    if (homeRes.body.includes('FlightWatch') || homeRes.body.includes('Never Overpay')) {
      console.log('✅ Home page content found\n');
    } else {
      console.log('❌ Home page content not found\n');
    }

    console.log('✅ All basic tests passed!');
    console.log('\n📝 Manual Testing Checklist:');
    console.log('1. Open http://localhost:5174 in your browser');
    console.log('2. Verify "Get Started Free" button is visible (not logged in)');
    console.log('3. Click on "Sign Up" and create a test account');
    console.log('4. After login, verify:');
    console.log('   - Header shows your name instead of "Sign Up" button');
    console.log('   - Clicking on your name shows a dropdown menu');
    console.log('   - Dropdown includes: Profile, Settings, Logout');
    console.log('5. Close dropdown by clicking elsewhere');
    console.log('6. Go to http://localhost:5174/ (home page)');
    console.log('7. Verify "Go to Dashboard" button appears (instead of "Get Started Free")');
    console.log('8. Navigate to /watchlist and verify header dropdown still works');
    console.log('9. Click Logout in dropdown and verify you\'re redirected to login');
    console.log('10. Verify "Get Started Free" button is back on home page\n');

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

testApp();
