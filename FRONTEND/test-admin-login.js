// Test script to verify admin login functionality
const testAdminLogin = async () => {
  const API_BASE_URL = 'http://localhost:3000/api';
  
  console.log('🧪 Testing Admin Login Functionality...\n');
  
  try {
    // Test 1: Admin Login
    console.log('1. Testing admin login...');
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@test.com',
        password: 'password123'
      })
    });
    
    const loginData = await loginResponse.json();
    
    if (loginResponse.ok && loginData.success) {
      console.log('✅ Admin login successful');
      console.log(`   User: ${loginData.data.user.firstName} ${loginData.data.user.lastName}`);
      console.log(`   Role: ${loginData.data.user.role}`);
      console.log(`   Token: ${loginData.token ? 'Present' : 'Missing'}`);
      
      // Test 2: Admin Stats Access
      console.log('\n2. Testing admin stats access...');
      const statsResponse = await fetch(`${API_BASE_URL}/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${loginData.token}`,
          'Content-Type': 'application/json',
        }
      });
      
      const statsData = await statsResponse.json();
      
      if (statsResponse.ok && statsData.success) {
        console.log('✅ Admin stats access successful');
        console.log(`   Total Users: ${statsData.data.users.total}`);
        console.log(`   Active Users: ${statsData.data.users.active}`);
        console.log(`   Total Tickets: ${statsData.data.tickets.total}`);
      } else {
        console.log('❌ Admin stats access failed');
        console.log(`   Status: ${statsResponse.status}`);
        console.log(`   Error: ${statsData.message || 'Unknown error'}`);
      }
      
      // Test 3: Non-admin user trying to access admin routes
      console.log('\n3. Testing non-admin access prevention...');
      const studentLoginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'student@test.com',
          password: 'password123'
        })
      });
      
      const studentLoginData = await studentLoginResponse.json();
      
      if (studentLoginResponse.ok && studentLoginData.success) {
        const studentStatsResponse = await fetch(`${API_BASE_URL}/admin/stats`, {
          headers: {
            'Authorization': `Bearer ${studentLoginData.token}`,
            'Content-Type': 'application/json',
          }
        });
        
        if (studentStatsResponse.status === 403) {
          console.log('✅ Non-admin access correctly blocked');
        } else {
          console.log('❌ Non-admin access not properly blocked');
          console.log(`   Status: ${studentStatsResponse.status}`);
        }
      }
      
    } else {
      console.log('❌ Admin login failed');
      console.log(`   Status: ${loginResponse.status}`);
      console.log(`   Error: ${loginData.message || 'Unknown error'}`);
    }
    
  } catch (error) {
    console.log('❌ Test failed with error:', error.message);
  }
  
  console.log('\n🏁 Admin login test completed');
};

// Run the test
testAdminLogin();
