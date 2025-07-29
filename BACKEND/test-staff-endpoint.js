const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

// Test the staff endpoint
const testStaffEndpoint = async () => {
  try {
    console.log('🧪 Testing staff endpoint...');
    
    // First, try to get staff without authentication
    console.log('\n1. Testing without authentication...');
    try {
      const response = await axios.get(`${API_BASE_URL}/appointments/staff`);
      console.log('❌ Unexpected success without auth:', response.data);
    } catch (error) {
      console.log('✅ Correctly rejected without auth:', error.response?.status, error.response?.data?.message);
    }

    // Login as a student
    console.log('\n2. Logging in as student...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'student@test.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ Login successful');

    // Test staff endpoint with authentication
    console.log('\n3. Testing staff endpoint with authentication...');
    const staffResponse = await axios.get(`${API_BASE_URL}/appointments/staff`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Staff endpoint working!');
    console.log('📊 Response:', staffResponse.data);
    console.log('👥 Staff count:', staffResponse.data.count);
    console.log('👤 Staff members:', staffResponse.data.data.staff);

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    }
  }
};

// Run the test
testStaffEndpoint();