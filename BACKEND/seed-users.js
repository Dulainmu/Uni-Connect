const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/campus-connect');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

// Create test users
const createTestUsers = async () => {
  try {
    const users = [
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'student@test.com',
        password: 'password123',
        role: 'student',
        studentId: 'STU001',
        isActive: true
      },
      {
        firstName: 'Dr. John',
        lastName: 'Smith',
        email: 'lecturer@test.com',
        password: 'password123',
        role: 'lecturer',
        department: 'Computer Science',
        isActive: true
      },
      {
        firstName: 'Dr. Sarah',
        lastName: 'Johnson',
        email: 'lecturer2@test.com',
        password: 'password123',
        role: 'lecturer',
        department: 'Mathematics',
        isActive: true
      },
      {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@test.com',
        password: 'password123',
        role: 'admin',
        isActive: true
      }
    ];

    for (const userData of users) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      
      if (existingUser) {
        console.log(`✅ User already exists: ${userData.email} (${userData.role})`);
      } else {
        // Create new user
        const user = await User.create(userData);
        console.log(`✅ User created successfully: ${user.email} (${user.role})`);
      }
    }

    console.log('\n📋 Test Users Summary:');
    console.log('- Student: student@test.com / password123');
    console.log('- Lecturer: lecturer@test.com / password123');
    console.log('- Lecturer 2: lecturer2@test.com / password123');
    console.log('- Admin: admin@test.com / password123');

  } catch (error) {
    console.error('❌ Error creating users:', error);
    throw error;
  }
};

// Main function
const seedUsers = async () => {
  try {
    await connectDB();
    await createTestUsers();
    console.log('\n✅ Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

// Run the seed function
seedUsers();