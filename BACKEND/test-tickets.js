const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

// Test data
const testUser = {
  email: 'test@university.edu',
  password: 'password123'
};

let authToken = '';

// Helper function to make authenticated requests
const makeRequest = async (method, endpoint, data = null) => {
  const config = {
    method,
    url: `${API_BASE_URL}${endpoint}`,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && { Authorization: `Bearer ${authToken}` })
    },
    ...(data && { data })
  };

  try {
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`Error in ${method} ${endpoint}:`, error.response?.data || error.message);
    throw error;
  }
};

// Test the ticketing system
const testTicketingSystem = async () => {
  console.log('🧪 Testing Campus Connect Ticketing System\n');

  try {
    // 1. Login to get auth token
    console.log('1. Testing authentication...');
    const loginResponse = await makeRequest('POST', '/auth/login', testUser);
    authToken = loginResponse.token;
    console.log('✅ Authentication successful\n');

    // 2. Create a new ticket
    console.log('2. Testing ticket creation...');
    const ticketData = {
      title: 'Test Ticket - Login Issues',
      description: 'This is a test ticket for the ticketing system.',
      category: 'technical',
      priority: 'medium'
    };
    
    const createResponse = await makeRequest('POST', '/tickets', ticketData);
    console.log('✅ Ticket created successfully');
    console.log(`   Ticket Number: ${createResponse.data.ticket.ticketNumber}`);
    console.log(`   Status: ${createResponse.data.ticket.status}\n`);

    const ticketId = createResponse.data.ticket._id;

    // 3. Get tickets by role
    console.log('3. Testing get tickets by role...');
    const ticketsResponse = await makeRequest('GET', '/tickets/student');
    console.log(`✅ Retrieved ${ticketsResponse.count} tickets\n`);

    // 4. Get single ticket
    console.log('4. Testing get single ticket...');
    const singleTicketResponse = await makeRequest('GET', `/tickets/ticket/${ticketId}`);
    console.log(`✅ Retrieved ticket: ${singleTicketResponse.data.ticket.title}\n`);

    // 5. Add comment to ticket
    console.log('5. Testing add comment...');
    const commentData = {
      content: 'This is a test comment on the ticket.'
    };
    
    const commentResponse = await makeRequest('POST', `/tickets/${ticketId}/comments`, commentData);
    console.log('✅ Comment added successfully\n');

    // 6. Update ticket status
    console.log('6. Testing update ticket...');
    const updateData = {
      status: 'in_progress',
      comments: 'Working on resolving this test issue.'
    };
    
    const updateResponse = await makeRequest('PUT', `/tickets/${ticketId}`, updateData);
    console.log(`✅ Ticket updated successfully. New status: ${updateResponse.data.ticket.status}\n`);

    // 7. Get ticket statistics
    console.log('7. Testing ticket statistics...');
    const statsResponse = await makeRequest('GET', '/tickets/stats/student');
    console.log('✅ Ticket statistics retrieved:');
    console.log(`   Total: ${statsResponse.data.total}`);
    console.log(`   Open: ${statsResponse.data.open}`);
    console.log(`   In Progress: ${statsResponse.data.inProgress}`);
    console.log(`   Resolved: ${statsResponse.data.resolved}\n`);

    // 8. Get available lecturers
    console.log('8. Testing get available lecturers...');
    const lecturersResponse = await makeRequest('GET', '/tickets/lecturers');
    console.log(`✅ Retrieved ${lecturersResponse.count} available lecturers\n`);

    console.log('🎉 All ticketing system tests passed successfully!');
    console.log('\n📋 Summary:');
    console.log('- Authentication: ✅');
    console.log('- Ticket Creation: ✅');
    console.log('- Ticket Retrieval: ✅');
    console.log('- Comment System: ✅');
    console.log('- Status Updates: ✅');
    console.log('- Statistics: ✅');
    console.log('- Lecturer Management: ✅');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
};

// Run the tests
testTicketingSystem(); 