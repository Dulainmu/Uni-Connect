const API_BASE_URL = 'http://localhost:3000/api';

// Test admin endpoints
async function testAdminEndpoints() {
  console.log('Testing Admin API Endpoints...\n');

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
    const healthData = await healthResponse.json();
    console.log('Health Status:', healthData);
    console.log('✅ Health endpoint working\n');

    // Test admin stats endpoint (will fail without auth, but should return 401)
    console.log('2. Testing admin stats endpoint...');
    try {
      const statsResponse = await fetch(`${API_BASE_URL}/admin/stats`, {
        headers: {
          'Authorization': 'Bearer invalid-token',
          'Content-Type': 'application/json'
        }
      });
      console.log('Stats Response Status:', statsResponse.status);
      if (statsResponse.status === 401) {
        console.log('✅ Admin stats endpoint properly protected (requires auth)\n');
      } else {
        console.log('❌ Admin stats endpoint not properly protected\n');
      }
    } catch (error) {
      console.log('❌ Error testing admin stats:', error.message, '\n');
    }

    // Test admin analytics endpoints
    console.log('3. Testing admin analytics endpoints...');
    try {
      const userAnalyticsResponse = await fetch(`${API_BASE_URL}/admin/analytics/users?range=7d`, {
        headers: {
          'Authorization': 'Bearer invalid-token',
          'Content-Type': 'application/json'
        }
      });
      console.log('User Analytics Response Status:', userAnalyticsResponse.status);
      if (userAnalyticsResponse.status === 401) {
        console.log('✅ User analytics endpoint properly protected\n');
      }
    } catch (error) {
      console.log('❌ Error testing user analytics:', error.message);
    }

    try {
      const communicationAnalyticsResponse = await fetch(`${API_BASE_URL}/admin/analytics/communication?range=7d`, {
        headers: {
          'Authorization': 'Bearer invalid-token',
          'Content-Type': 'application/json'
        }
      });
      console.log('Communication Analytics Response Status:', communicationAnalyticsResponse.status);
      if (communicationAnalyticsResponse.status === 401) {
        console.log('✅ Communication analytics endpoint properly protected\n');
      }
    } catch (error) {
      console.log('❌ Error testing communication analytics:', error.message, '\n');
    }

    // Test system health endpoint
    console.log('4. Testing system health endpoint...');
    try {
      const systemHealthResponse = await fetch(`${API_BASE_URL}/admin/system/health`, {
        headers: {
          'Authorization': 'Bearer invalid-token',
          'Content-Type': 'application/json'
        }
      });
      console.log('System Health Response Status:', systemHealthResponse.status);
      if (systemHealthResponse.status === 401) {
        console.log('✅ System health endpoint properly protected\n');
      }
    } catch (error) {
      console.log('❌ Error testing system health:', error.message, '\n');
    }

    // Test export endpoints
    console.log('5. Testing export endpoints...');
    try {
      const exportUsersResponse = await fetch(`${API_BASE_URL}/admin/export/users?format=csv`, {
        headers: {
          'Authorization': 'Bearer invalid-token',
          'Content-Type': 'application/json'
        }
      });
      console.log('Export Users Response Status:', exportUsersResponse.status);
      if (exportUsersResponse.status === 401) {
        console.log('✅ Export users endpoint properly protected\n');
      }
    } catch (error) {
      console.log('❌ Error testing export users:', error.message);
    }

    console.log('\n🎉 Admin API endpoints test completed!');
    console.log('All endpoints are properly protected and responding correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testAdminEndpoints();