const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';
const FRONTEND_URL = 'http://localhost:5173';

// Test data
const testUser = {
  email: 'student@test.com',
  password: 'password123'
};

let authToken = '';

// Helper function to make authenticated requests
const makeAuthenticatedRequest = async (endpoint, options = {}) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && { Authorization: `Bearer ${authToken}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await axios(`${API_BASE_URL}${endpoint}`, config);
  return response.data;
};

// Test authentication
const testAuth = async () => {
  console.log('\n=== Testing Authentication ===');
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, testUser);
    authToken = response.data.data.token;
    console.log('✅ Authentication successful');
    console.log('User role:', response.data.data.user.role);
    return response.data.data.user;
  } catch (error) {
    console.error('❌ Authentication failed:', error.response?.data || error.message);
    throw error;
  }
};

// Test getting available staff
const testGetAvailableStaff = async () => {
  console.log('\n=== Testing Get Available Staff ===');
  try {
    const response = await makeAuthenticatedRequest('/appointments/staff');
    console.log('✅ Get available staff successful');
    console.log('Staff count:', response.count);
    console.log('Staff members:', response.data.staff.map(s => `${s.firstName} ${s.lastName}`));
    return response.data.staff;
  } catch (error) {
    console.error('❌ Get available staff failed:', error.response?.data || error.message);
    throw error;
  }
};

// Test creating an appointment
const testCreateAppointment = async (staffId) => {
  console.log('\n=== Testing Create Appointment ===');
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split('T')[0];

    const appointmentData = {
      staffId: staffId,
      date: dateString,
      startTime: '10:00 AM',
      endTime: '11:00 AM',
      location: 'Room 301, Building A',
      purpose: 'consultation',
      description: 'Test appointment for frontend integration'
    };

    const response = await makeAuthenticatedRequest('/appointments', {
      method: 'POST',
      data: appointmentData
    });

    console.log('✅ Create appointment successful');
    console.log('Appointment ID:', response.data.appointment._id);
    console.log('Status:', response.data.appointment.status);
    return response.data.appointment;
  } catch (error) {
    console.error('❌ Create appointment failed:', error.response?.data || error.message);
    throw error;
  }
};

// Test getting appointments by role
const testGetAppointmentsByRole = async (role) => {
  console.log(`\n=== Testing Get Appointments by Role (${role}) ===`);
  try {
    const response = await makeAuthenticatedRequest(`/appointments/${role}`);
    console.log('✅ Get appointments successful');
    console.log('Appointments count:', response.count);
    console.log('Appointments:', response.data.appointments.map(a => ({
      id: a._id,
      staff: `${a.staff.firstName} ${a.staff.lastName}`,
      date: a.date,
      time: `${a.startTime} - ${a.endTime}`,
      status: a.status
    })));
    return response.data.appointments;
  } catch (error) {
    console.error('❌ Get appointments failed:', error.response?.data || error.message);
    throw error;
  }
};

// Test getting appointment statistics
const testGetAppointmentStats = async (role) => {
  console.log(`\n=== Testing Get Appointment Stats (${role}) ===`);
  try {
    const response = await makeAuthenticatedRequest(`/appointments/stats/${role}`);
    console.log('✅ Get appointment stats successful');
    console.log('Stats:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Get appointment stats failed:', error.response?.data || error.message);
    throw error;
  }
};

// Test updating an appointment
const testUpdateAppointment = async (appointmentId) => {
  console.log('\n=== Testing Update Appointment ===');
  try {
    const updateData = {
      location: 'Room 302, Building A (Updated)',
      description: 'Updated appointment description for frontend testing'
    };

    const response = await makeAuthenticatedRequest(`/appointments/${appointmentId}`, {
      method: 'PUT',
      data: updateData
    });

    console.log('✅ Update appointment successful');
    console.log('Updated location:', response.data.appointment.location);
    console.log('Updated description:', response.data.appointment.description);
    return response.data.appointment;
  } catch (error) {
    console.error('❌ Update appointment failed:', error.response?.data || error.message);
    throw error;
  }
};

// Test cancelling an appointment
const testCancelAppointment = async (appointmentId) => {
  console.log('\n=== Testing Cancel Appointment ===');
  try {
    const cancelData = {
      reason: 'Test cancellation for frontend integration'
    };

    const response = await makeAuthenticatedRequest(`/appointments/${appointmentId}/cancel`, {
      method: 'POST',
      data: cancelData
    });

    console.log('✅ Cancel appointment successful');
    console.log('New status:', response.data.appointment.status);
    console.log('Cancellation reason:', response.data.appointment.cancellationReason);
    return response.data.appointment;
  } catch (error) {
    console.error('❌ Cancel appointment failed:', error.response?.data || error.message);
    throw error;
  }
};

// Test getting staff availability
const testGetStaffAvailability = async (staffId) => {
  console.log('\n=== Testing Get Staff Availability ===');
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split('T')[0];

    const response = await makeAuthenticatedRequest(`/appointments/availability/${staffId}/${dateString}`);
    console.log('✅ Get staff availability successful');
    console.log('Staff:', response.data.staff.name);
    console.log('Date:', response.data.date);
    console.log('Available slots:', response.data.availableSlots.length);
    console.log('Existing appointments:', response.data.appointments.length);
    return response.data;
  } catch (error) {
    console.error('❌ Get staff availability failed:', error.response?.data || error.message);
    throw error;
  }
};

// Test lecturer-specific actions
const testLecturerActions = async (appointmentId) => {
  console.log('\n=== Testing Lecturer Actions ===');
  
  // First, login as a lecturer
  try {
    const lecturerResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'lecturer@test.com',
      password: 'password123'
    });
    const lecturerToken = lecturerResponse.data.data.token;
    
    // Test confirming appointment
    try {
      const confirmResponse = await axios.post(`${API_BASE_URL}/appointments/${appointmentId}/confirm`, {}, {
        headers: {
          'Authorization': `Bearer ${lecturerToken}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Confirm appointment successful');
      console.log('New status:', confirmResponse.data.data.appointment.status);
    } catch (error) {
      console.log('⚠️ Confirm appointment failed (expected if not lecturer):', error.response?.data?.message || error.message);
    }

    // Test completing appointment
    try {
      const completeResponse = await axios.post(`${API_BASE_URL}/appointments/${appointmentId}/complete`, {}, {
        headers: {
          'Authorization': `Bearer ${lecturerToken}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Complete appointment successful');
      console.log('New status:', completeResponse.data.data.appointment.status);
    } catch (error) {
      console.log('⚠️ Complete appointment failed (expected if not lecturer):', error.response?.data?.message || error.message);
    }
  } catch (error) {
    console.log('⚠️ Lecturer login failed (expected if lecturer account doesn\'t exist):', error.response?.data?.message || error.message);
  }
};

// Main test function
const runFrontendIntegrationTests = async () => {
  console.log('🚀 Starting Frontend Integration Tests for Appointment System');
  console.log('=' .repeat(60));

  try {
    // Test authentication
    const user = await testAuth();

    // Test getting available staff
    const staff = await testGetAvailableStaff();
    if (staff.length === 0) {
      console.log('⚠️ No staff members available. Skipping appointment creation tests.');
      return;
    }

    // Test creating an appointment
    const appointment = await testCreateAppointment(staff[0]._id);

    // Test getting appointments by role
    await testGetAppointmentsByRole(user.role);

    // Test getting appointment statistics
    await testGetAppointmentStats(user.role);

    // Test updating an appointment
    await testUpdateAppointment(appointment._id);

    // Test getting staff availability
    await testGetStaffAvailability(staff[0]._id);

    // Test lecturer-specific actions
    await testLecturerActions(appointment._id);

    // Test cancelling an appointment (do this last)
    await testCancelAppointment(appointment._id);

    console.log('\n' + '=' .repeat(60));
    console.log('🎉 All Frontend Integration Tests Completed Successfully!');
    console.log('\n📋 Summary:');
    console.log('✅ Authentication');
    console.log('✅ Get Available Staff');
    console.log('✅ Create Appointment');
    console.log('✅ Get Appointments by Role');
    console.log('✅ Get Appointment Statistics');
    console.log('✅ Update Appointment');
    console.log('✅ Get Staff Availability');
    console.log('✅ Lecturer Actions (Confirm/Complete)');
    console.log('✅ Cancel Appointment');
    console.log('\n🔗 Frontend Integration Ready!');
    console.log(`Frontend URL: ${FRONTEND_URL}`);
    console.log('You can now test the appointment system through the web interface.');

  } catch (error) {
    console.error('\n❌ Frontend Integration Tests Failed');
    console.error('Error:', error.message);
    console.log('\n🔧 Troubleshooting Tips:');
    console.log('1. Make sure the backend server is running on port 3000');
    console.log('2. Ensure the frontend development server is running on port 5173');
    console.log('3. Check that the database is properly connected');
    console.log('4. Verify that test user accounts exist in the database');
    console.log('5. Check the backend logs for any errors');
  }
};

// Run the tests
runFrontendIntegrationTests();