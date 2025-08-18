const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000/api';
let authToken = '';
let testAppointmentId = '';

// Test data
const testUser = {
  email: 'student@test.com',
  password: 'password123'
};

const testAppointment = {
  staffId: '', // Will be set after getting available staff
  date: '2024-10-28',
  startTime: '9:00 AM',
  endTime: '10:00 AM',
  location: 'Room 301',
  purpose: 'office_hours',
  description: 'Test appointment for assignment help'
};

// Helper function to make authenticated requests
const makeRequest = async (method, endpoint, data = null) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`Error in ${method} ${endpoint}:`, error.response?.data || error.message);
    throw error;
  }
};

// Test functions
const testAuthentication = async () => {
  console.log('\n🔐 Testing Authentication...');
  
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, testUser);
    authToken = response.data.data.token;
    console.log('✅ Authentication successful');
    console.log('Token received:', authToken.substring(0, 20) + '...');
    return true;
  } catch (error) {
    console.error('❌ Authentication failed:', error.response?.data || error.message);
    return false;
  }
};

const testGetAvailableStaff = async () => {
  console.log('\n👥 Testing Get Available Staff...');
  
  try {
    const response = await makeRequest('GET', '/appointments/staff');
    console.log('✅ Available staff retrieved successfully');
    console.log('Staff count:', response.count);
    
    if (response.data.staff.length > 0) {
      testAppointment.staffId = response.data.staff[0]._id;
      console.log('Selected staff:', response.data.staff[0].firstName, response.data.staff[0].lastName);
    }
    
    return response.data.staff.length > 0;
  } catch (error) {
    console.error('❌ Failed to get available staff');
    return false;
  }
};

const testCreateAppointment = async () => {
  console.log('\n📅 Testing Create Appointment...');
  
  if (!testAppointment.staffId) {
    console.log('❌ No staff available for appointment creation');
    return false;
  }
  
  try {
    const response = await makeRequest('POST', '/appointments', testAppointment);
    console.log('✅ Appointment created successfully');
    console.log('Appointment ID:', response.data.appointment._id);
    console.log('Status:', response.data.appointment.status);
    
    testAppointmentId = response.data.appointment._id;
    return true;
  } catch (error) {
    console.error('❌ Failed to create appointment');
    return false;
  }
};

const testGetAppointmentsByRole = async () => {
  console.log('\n📋 Testing Get Appointments by Role...');
  
  try {
    const response = await makeRequest('GET', '/appointments/student');
    console.log('✅ Appointments retrieved successfully');
    console.log('Appointment count:', response.count);
    
    if (response.data.appointments.length > 0) {
      const appointment = response.data.appointments[0];
      console.log('First appointment:', {
        staff: `${appointment.staff.firstName} ${appointment.staff.lastName}`,
        date: appointment.formattedDate,
        time: appointment.timeRange,
        status: appointment.status
      });
    }
    
    return true;
  } catch (error) {
    console.error('❌ Failed to get appointments');
    return false;
  }
};

const testGetSingleAppointment = async () => {
  console.log('\n🔍 Testing Get Single Appointment...');
  
  if (!testAppointmentId) {
    console.log('❌ No appointment ID available');
    return false;
  }
  
  try {
    const response = await makeRequest('GET', `/appointments/ticket/${testAppointmentId}`);
    console.log('✅ Single appointment retrieved successfully');
    console.log('Appointment details:', {
      student: `${response.data.appointment.student.firstName} ${response.data.appointment.student.lastName}`,
      staff: `${response.data.appointment.staff.firstName} ${response.data.appointment.staff.lastName}`,
      date: response.data.appointment.formattedDate,
      time: response.data.appointment.timeRange,
      location: response.data.appointment.location,
      purpose: response.data.appointment.purpose,
      status: response.data.appointment.status
    });
    
    return true;
  } catch (error) {
    console.error('❌ Failed to get single appointment');
    return false;
  }
};

const testUpdateAppointment = async () => {
  console.log('\n✏️ Testing Update Appointment...');
  
  if (!testAppointmentId) {
    console.log('❌ No appointment ID available');
    return false;
  }
  
  const updateData = {
    location: 'Room 205',
    description: 'Updated test appointment description'
  };
  
  try {
    const response = await makeRequest('PUT', `/appointments/${testAppointmentId}`, updateData);
    console.log('✅ Appointment updated successfully');
    console.log('Updated location:', response.data.appointment.location);
    console.log('Updated description:', response.data.appointment.description);
    
    return true;
  } catch (error) {
    console.error('❌ Failed to update appointment');
    return false;
  }
};

const testGetAppointmentStats = async () => {
  console.log('\n📊 Testing Get Appointment Statistics...');
  
  try {
    const response = await makeRequest('GET', '/appointments/stats/student');
    console.log('✅ Appointment statistics retrieved successfully');
    console.log('Statistics:', {
      total: response.data.total,
      pending: response.data.pending,
      confirmed: response.data.confirmed,
      completed: response.data.completed,
      cancelled: response.data.cancelled
    });
    
    return true;
  } catch (error) {
    console.error('❌ Failed to get appointment statistics');
    return false;
  }
};

const testGetStaffAvailability = async () => {
  console.log('\n⏰ Testing Get Staff Availability...');
  
  if (!testAppointment.staffId) {
    console.log('❌ No staff ID available');
    return false;
  }
  
  try {
    const response = await makeRequest('GET', `/appointments/availability/${testAppointment.staffId}/${testAppointment.date}`);
    console.log('✅ Staff availability retrieved successfully');
    console.log('Staff:', response.data.staff.name);
    console.log('Date:', response.data.date);
    console.log('Available slots:', response.data.availableSlots.length);
    console.log('Existing appointments:', response.data.appointments.length);
    
    return true;
  } catch (error) {
    console.error('❌ Failed to get staff availability');
    return false;
  }
};

const testCancelAppointment = async () => {
  console.log('\n❌ Testing Cancel Appointment...');
  
  if (!testAppointmentId) {
    console.log('❌ No appointment ID available');
    return false;
  }
  
  const cancelData = {
    reason: 'Test cancellation - no longer needed'
  };
  
  try {
    const response = await makeRequest('POST', `/appointments/${testAppointmentId}/cancel`, cancelData);
    console.log('✅ Appointment cancelled successfully');
    console.log('Cancellation reason:', response.data.appointment.cancellationReason);
    console.log('Cancelled by:', response.data.appointment.cancelledBy ? 'User' : 'Unknown');
    
    return true;
  } catch (error) {
    console.error('❌ Failed to cancel appointment');
    return false;
  }
};

// Main test runner
const runTests = async () => {
  console.log('🚀 Starting Appointment System Tests...\n');
  
  const tests = [
    { name: 'Authentication', fn: testAuthentication },
    { name: 'Get Available Staff', fn: testGetAvailableStaff },
    { name: 'Create Appointment', fn: testCreateAppointment },
    { name: 'Get Appointments by Role', fn: testGetAppointmentsByRole },
    { name: 'Get Single Appointment', fn: testGetSingleAppointment },
    { name: 'Update Appointment', fn: testUpdateAppointment },
    { name: 'Get Appointment Statistics', fn: testGetAppointmentStats },
    { name: 'Get Staff Availability', fn: testGetStaffAvailability },
    { name: 'Cancel Appointment', fn: testCancelAppointment }
  ];
  
  let passedTests = 0;
  let totalTests = tests.length;
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        passedTests++;
      }
    } catch (error) {
      console.error(`❌ Test "${test.name}" failed with error:`, error.message);
    }
  }
  
  console.log('\n📋 Test Results Summary:');
  console.log(`✅ Passed: ${passedTests}/${totalTests}`);
  console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 All tests passed! Appointment system is working correctly.');
  } else {
    console.log('\n⚠️ Some tests failed. Please check the errors above.');
  }
};

// Error handling for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run the tests
if (require.main === module) {
  runTests().catch(error => {
    console.error('Test runner failed:', error);
    process.exit(1);
  });
}

module.exports = {
  runTests,
  testAuthentication,
  testCreateAppointment,
  testGetAppointmentsByRole,
  testGetSingleAppointment,
  testUpdateAppointment,
  testCancelAppointment
};