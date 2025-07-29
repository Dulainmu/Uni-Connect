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

// Create lecturer user
const createLecturer = async () => {
  try {
    // Check if lecturer already exists
    const existingLecturer = await User.findOne({ email: 'lecturer@test.com' });
    
    if (existingLecturer) {
      console.log('✅ Lecturer user already exists:', existingLecturer.email);
      return existingLecturer;
    }

    // Create new lecturer
    const lecturer = await User.create({
      firstName: 'Dr. John',
      lastName: 'Smith',
      email: 'lecturer@test.com',
      password: 'password123',
      role: 'lecturer',
      department: 'Computer Science',
      isActive: true
    });

    console.log('✅ Lecturer user created successfully:', lecturer.email);
    return lecturer;
  } catch (error) {
    console.error('❌ Error creating lecturer:', error);
    throw error;
  }
};

// Main function
const seedLecturer = async () => {
  try {
    await connectDB();
    await createLecturer();
    console.log('✅ Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

// Run the seed function
seedLecturer();