const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';
let authToken = '';
let testAnnouncementId = '';

// Test data
const testUser = {
  email: 'lecturer@test.com',
  password: 'password123'
};

const testAnnouncement = {
  title: 'Test Announcement',
  content: 'This is a test announcement for testing purposes.',
  category: 'general',
  priority: 'medium',
  targetAudience: ['student', 'lecturer'],
  isPinned: false
};

// Helper function to make authenticated requests
const makeAuthRequest = async (method, url, data = null) => {
  const config = {
    method,
    url: `${BASE_URL}${url}`,
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    }
  };
  
  if (data) {
    config.data = data;
  }
  
  return axios(config);
};

// Test functions
const testLogin = async () => {
  try {
    console.log('🔐 Testing login...');
    const response = await axios.post(`${BASE_URL}/auth/login`, testUser);
    authToken = response.data.token;
    console.log('✅ Login successful');
    return true;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    return false;
  }
};

const testCreateAnnouncement = async () => {
  try {
    console.log('📝 Testing create announcement...');
    const response = await makeAuthRequest('POST', '/announcements', testAnnouncement);
    testAnnouncementId = response.data.data._id;
    console.log('✅ Announcement created:', response.data.data.title);
    return true;
  } catch (error) {
    console.error('❌ Create announcement failed:', error.response?.data || error.message);
    return false;
  }
};

const testGetAnnouncements = async () => {
  try {
    console.log('📋 Testing get announcements...');
    const response = await makeAuthRequest('GET', '/announcements');
    console.log('✅ Got announcements:', response.data.data.length, 'announcements');
    return true;
  } catch (error) {
    console.error('❌ Get announcements failed:', error.response?.data || error.message);
    return false;
  }
};

const testGetAnnouncement = async () => {
  try {
    console.log('📄 Testing get single announcement...');
    const response = await makeAuthRequest('GET', `/announcements/${testAnnouncementId}`);
    console.log('✅ Got announcement:', response.data.data.title);
    return true;
  } catch (error) {
    console.error('❌ Get announcement failed:', error.response?.data || error.message);
    return false;
  }
};

const testUpdateAnnouncement = async () => {
  try {
    console.log('✏️ Testing update announcement...');
    const updateData = {
      title: 'Updated Test Announcement',
      content: 'This announcement has been updated.',
      priority: 'high'
    };
    const response = await makeAuthRequest('PUT', `/announcements/${testAnnouncementId}`, updateData);
    console.log('✅ Announcement updated:', response.data.data.title);
    return true;
  } catch (error) {
    console.error('❌ Update announcement failed:', error.response?.data || error.message);
    return false;
  }
};

const testMarkAsRead = async () => {
  try {
    console.log('👁️ Testing mark as read...');
    const response = await makeAuthRequest('POST', `/announcements/${testAnnouncementId}/read`);
    console.log('✅ Marked as read:', response.data.message);
    return true;
  } catch (error) {
    console.error('❌ Mark as read failed:', error.response?.data || error.message);
    return false;
  }
};

const testGetPinnedAnnouncements = async () => {
  try {
    console.log('📌 Testing get pinned announcements...');
    const response = await makeAuthRequest('GET', '/announcements/pinned');
    console.log('✅ Got pinned announcements:', response.data.data.length, 'announcements');
    return true;
  } catch (error) {
    console.error('❌ Get pinned announcements failed:', error.response?.data || error.message);
    return false;
  }
};

const testDeleteAnnouncement = async () => {
  try {
    console.log('🗑️ Testing delete announcement...');
    const response = await makeAuthRequest('DELETE', `/announcements/${testAnnouncementId}`);
    console.log('✅ Announcement deleted:', response.data.message);
    return true;
  } catch (error) {
    console.error('❌ Delete announcement failed:', error.response?.data || error.message);
    return false;
  }
};

// Main test runner
const runTests = async () => {
  console.log('🚀 Starting Announcements API Tests...\n');
  
  const tests = [
    { name: 'Login', fn: testLogin },
    { name: 'Create Announcement', fn: testCreateAnnouncement },
    { name: 'Get Announcements', fn: testGetAnnouncements },
    { name: 'Get Single Announcement', fn: testGetAnnouncement },
    { name: 'Update Announcement', fn: testUpdateAnnouncement },
    { name: 'Mark as Read', fn: testMarkAsRead },
    { name: 'Get Pinned Announcements', fn: testGetPinnedAnnouncements },
    { name: 'Delete Announcement', fn: testDeleteAnnouncement }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    console.log(`\n--- ${test.name} ---`);
    const result = await test.fn();
    if (result) {
      passed++;
    } else {
      failed++;
    }
  }
  
  console.log('\n📊 Test Results:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! Announcements API is working correctly.');
  } else {
    console.log('\n⚠️ Some tests failed. Please check the errors above.');
  }
};

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  runTests,
  testLogin,
  testCreateAnnouncement,
  testGetAnnouncements,
  testGetAnnouncement,
  testUpdateAnnouncement,
  testMarkAsRead,
  testGetPinnedAnnouncements,
  testDeleteAnnouncement
};