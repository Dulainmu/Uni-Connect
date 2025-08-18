const mongoose = require('mongoose');
const Announcement = require('./src/models/Announcement');
const User = require('./src/models/User');

// Load environment variables
require('dotenv').config();

// Connect to MongoDB
const connectDB = require('./src/config/db');

const sampleAnnouncements = [
  {
    title: 'Welcome to Campus Connect!',
    content: 'Welcome to the new academic year! Campus Connect is your one-stop platform for all academic activities, appointments, and communications. Please take some time to explore the features and get familiar with the system.',
    category: 'general',
    priority: 'medium',
    targetAudience: ['student', 'lecturer', 'admin'],
    isPinned: true,
    attachments: []
  },
  {
    title: 'Library Maintenance Notice',
    content: 'The main library will be undergoing maintenance from 15th to 20th of this month. During this period, the online library resources will remain accessible. We apologize for any inconvenience caused.',
    category: 'maintenance',
    priority: 'high',
    targetAudience: ['student', 'lecturer'],
    isPinned: false,
    attachments: []
  },
  {
    title: 'Academic Calendar Update',
    content: 'The academic calendar has been updated for the current semester. Please review the new dates for mid-term examinations, holidays, and semester breaks. All changes are reflected in your student portal.',
    category: 'academic',
    priority: 'high',
    targetAudience: ['student', 'lecturer'],
    isPinned: true,
    attachments: []
  },
  {
    title: 'Student Council Elections',
    content: 'Student Council elections will be held next week. All students are encouraged to participate in the democratic process. Nomination forms are available at the student affairs office.',
    category: 'event',
    priority: 'medium',
    targetAudience: ['student'],
    isPinned: false,
    attachments: []
  },
  {
    title: 'Emergency Contact Information',
    content: 'In case of emergencies, please contact the campus security at extension 911 or the main office at extension 100. For medical emergencies, the campus clinic is located in Building A, first floor.',
    category: 'emergency',
    priority: 'urgent',
    targetAudience: ['student', 'lecturer', 'admin'],
    isPinned: true,
    attachments: []
  },
  {
    title: 'Faculty Meeting Reminder',
    content: 'Monthly faculty meeting will be held this Friday at 2 PM in the conference room. All lecturers are required to attend. Agenda items include curriculum updates and upcoming events planning.',
    category: 'academic',
    priority: 'medium',
    targetAudience: ['lecturer'],
    isPinned: false,
    attachments: []
  },
  {
    title: 'Cafeteria Menu Update',
    content: 'The cafeteria has updated its menu for the new semester. New healthy options have been added, and prices remain the same. The updated menu is available at the cafeteria entrance.',
    category: 'general',
    priority: 'low',
    targetAudience: ['student', 'lecturer'],
    isPinned: false,
    attachments: []
  },
  {
    title: 'IT Support Hours',
    content: 'IT support desk hours have been extended. Support is now available from 8 AM to 8 PM on weekdays and 9 AM to 5 PM on weekends. For urgent technical issues, please contact the IT department directly.',
    category: 'maintenance',
    priority: 'medium',
    targetAudience: ['student', 'lecturer', 'admin'],
    isPinned: false,
    attachments: []
  },
  {
    title: 'Sports Complex Opening',
    content: 'The new sports complex will be officially opened next month. Facilities include a swimming pool, gym, basketball courts, and tennis courts. Membership applications are now open for students and staff.',
    category: 'event',
    priority: 'medium',
    targetAudience: ['student', 'lecturer'],
    isPinned: false,
    attachments: []
  },
  {
    title: 'Research Grant Opportunities',
    content: 'Several research grant opportunities are available for faculty members. Deadlines and application requirements vary by grant. Please contact the research office for detailed information and application forms.',
    category: 'academic',
    priority: 'high',
    targetAudience: ['lecturer'],
    isPinned: false,
    attachments: []
  }
];

const seedAnnouncements = async () => {
  try {
    console.log('🌱 Starting announcement seeding...');
    
    // Connect to database
    await connectDB();
    
    // Clear existing announcements
    await Announcement.deleteMany({});
    console.log('🗑️ Cleared existing announcements');
    
    // Get a sample user for author (assuming there's at least one user in the database)
    const sampleUser = await User.findOne({ role: 'lecturer' });
    
    if (!sampleUser) {
      console.log('⚠️ No lecturer found in database. Creating a sample lecturer...');
      const lecturer = await User.create({
        firstName: 'Sample',
        lastName: 'Lecturer',
        email: 'sample.lecturer@campus.edu',
        password: 'password123',
        role: 'lecturer',
        department: 'Computer Science'
      });
      console.log('✅ Created sample lecturer');
    }
    
    const author = sampleUser || await User.findOne({ role: 'lecturer' });
    
    // Create announcements
    const announcements = sampleAnnouncements.map(announcement => ({
      ...announcement,
      author: author._id
    }));
    
    const createdAnnouncements = await Announcement.insertMany(announcements);
    
    console.log(`✅ Successfully seeded ${createdAnnouncements.length} announcements`);
    
    // Display summary
    console.log('\n📊 Seeding Summary:');
    console.log(`- Total announcements created: ${createdAnnouncements.length}`);
    
    const categoryCounts = {};
    const priorityCounts = {};
    
    createdAnnouncements.forEach(announcement => {
      categoryCounts[announcement.category] = (categoryCounts[announcement.category] || 0) + 1;
      priorityCounts[announcement.priority] = (priorityCounts[announcement.priority] || 0) + 1;
    });
    
    console.log('\n📂 By Category:');
    Object.entries(categoryCounts).forEach(([category, count]) => {
      console.log(`  - ${category}: ${count}`);
    });
    
    console.log('\n🎯 By Priority:');
    Object.entries(priorityCounts).forEach(([priority, count]) => {
      console.log(`  - ${priority}: ${count}`);
    });
    
    const pinnedCount = createdAnnouncements.filter(a => a.isPinned).length;
    console.log(`\n📌 Pinned announcements: ${pinnedCount}`);
    
    console.log('\n🎉 Announcement seeding completed successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding announcements:', error);
    process.exit(1);
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedAnnouncements();
}

module.exports = { seedAnnouncements };