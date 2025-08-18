const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Ticket title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Ticket description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  category: {
    type: String,
    enum: ['technical', 'academic', 'administrative', 'financial', 'other'],
    required: [true, 'Ticket category is required']
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved', 'closed'],
    default: 'open'
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  department: {
    type: String,
    required: false
  },
  attachments: [{
    filename: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  resolvedAt: {
    type: Date,
    default: null
  },
  closedAt: {
    type: Date,
    default: null
  },
  ticketNumber: {
    type: String,
    unique: true,
    required: false // Will be set in pre-save hook
  }
}, {
  timestamps: true
});

// Generate ticket number before saving
ticketSchema.pre('save', async function(next) {
  try {
    console.log('Pre-save hook triggered for ticket:', this.title);
    console.log('Is new document:', this.isNew);
    console.log('Current ticketNumber:', this.ticketNumber);
    
    // Always generate ticket number for new documents or if missing
    if (this.isNew || !this.ticketNumber) {
      console.log('Generating ticket number...');
      try {
        const count = await this.constructor.countDocuments();
        this.ticketNumber = `TK${String(count + 1).padStart(6, '0')}`;
        console.log('Generated ticket number:', this.ticketNumber);
      } catch (countError) {
        console.error('Error counting documents:', countError);
        // Fallback to timestamp-based ticket number
        this.ticketNumber = `TK${Date.now()}`;
        console.log('Using fallback ticket number:', this.ticketNumber);
      }
    }
    
    // Ensure ticketNumber is always set
    if (!this.ticketNumber) {
      this.ticketNumber = `TK${Date.now()}`;
      console.log('Final fallback ticket number:', this.ticketNumber);
    }
    
    next();
  } catch (error) {
    console.error('Error in pre-save hook:', error);
    next(error);
  }
});

// Validate ticket number is present before saving
ticketSchema.pre('validate', function(next) {
  console.log('Validation hook - ticketNumber:', this.ticketNumber);
  if (!this.ticketNumber) {
    console.log('No ticketNumber found, generating one...');
    this.ticketNumber = `TK${Date.now()}`;
  }
  next();
});

// Index for better query performance
ticketSchema.index({ submittedBy: 1, createdAt: -1 });
ticketSchema.index({ assignedTo: 1, status: 1 });
ticketSchema.index({ category: 1, status: 1 });
ticketSchema.index({ ticketNumber: 1 });

// Virtual for full name of submitted user
ticketSchema.virtual('submittedByFullName').get(function() {
  if (this.submittedBy && this.submittedBy.firstName && this.submittedBy.lastName) {
    return `${this.submittedBy.firstName} ${this.submittedBy.lastName}`;
  }
  return 'Unknown User';
});

// Virtual for full name of assigned user
ticketSchema.virtual('assignedToFullName').get(function() {
  if (this.assignedTo && this.assignedTo.firstName && this.assignedTo.lastName) {
    return `${this.assignedTo.firstName} ${this.assignedTo.lastName}`;
  }
  return null;
});

// Instance method to add comment
ticketSchema.methods.addComment = function(userId, content) {
  this.comments.push({
    user: userId,
    content: content
  });
  return this.save();
};

// Instance method to update status
ticketSchema.methods.updateStatus = function(newStatus) {
  this.status = newStatus;
  
  if (newStatus === 'resolved') {
    this.resolvedAt = new Date();
  } else if (newStatus === 'closed') {
    this.closedAt = new Date();
  }
  
  return this.save();
};

// Static method to get tickets by role
ticketSchema.statics.getTicketsByRole = function(userId, role) {
  if (role === 'student') {
    return this.find({ submittedBy: userId })
      .populate('submittedBy', 'firstName lastName email role')
      .populate('assignedTo', 'firstName lastName email role')
      .sort({ createdAt: -1 });
  } else if (role === 'lecturer') {
    return this.find({ 
      $or: [
        { assignedTo: userId },
        { category: 'academic', status: { $in: ['open', 'in_progress'] } }
      ]
    })
      .populate('submittedBy', 'firstName lastName email role studentId')
      .populate('assignedTo', 'firstName lastName email role')
      .sort({ createdAt: -1 });
  } else if (role === 'admin') {
    return this.find({})
      .populate('submittedBy', 'firstName lastName email role studentId')
      .populate('assignedTo', 'firstName lastName email role')
      .sort({ createdAt: -1 });
  }
  
  return [];
};

// Configure toJSON to include virtuals
ticketSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Ticket', ticketSchema); 