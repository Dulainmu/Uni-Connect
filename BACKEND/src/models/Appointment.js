const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  staff: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: [true, 'Appointment date is required']
  },
  startTime: {
    type: String,
    required: [true, 'Start time is required'],
    validate: {
      validator: function(v) {
        // Validate time format (HH:MM AM/PM)
        return /^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/.test(v);
      },
      message: 'Start time must be in HH:MM AM/PM format'
    }
  },
  endTime: {
    type: String,
    required: [true, 'End time is required'],
    validate: {
      validator: function(v) {
        // Validate time format (HH:MM AM/PM)
        return /^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/.test(v);
      },
      message: 'End time must be in HH:MM AM/PM format'
    }
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
    maxlength: [100, 'Location cannot exceed 100 characters']
  },
  purpose: {
    type: String,
    enum: ['office_hours', 'project_review', 'consultation', 'thesis_meeting', 'academic_advising', 'other'],
    required: [true, 'Appointment purpose is required']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no_show'],
    default: 'pending'
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  cancelledAt: {
    type: Date,
    default: null
  },
  cancellationReason: {
    type: String,
    trim: true,
    maxlength: [200, 'Cancellation reason cannot exceed 200 characters']
  },
  reminderSent: {
    type: Boolean,
    default: false
  },
  reminderSentAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Validate that end time is after start time
appointmentSchema.pre('validate', function(next) {
  if (this.startTime && this.endTime) {
    const startTime = this.convertTo24Hour(this.startTime);
    const endTime = this.convertTo24Hour(this.endTime);
    
    if (startTime >= endTime) {
      this.invalidate('endTime', 'End time must be after start time');
    }
  }
  next();
});

// Validate that appointment date is not in the past
appointmentSchema.pre('validate', function(next) {
  if (this.date) {
    const appointmentDate = new Date(this.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (appointmentDate < today) {
      this.invalidate('date', 'Appointment date cannot be in the past');
    }
  }
  next();
});

// Helper method to convert 12-hour format to 24-hour for comparison
appointmentSchema.methods.convertTo24Hour = function(time12h) {
  const [time, modifier] = time12h.split(' ');
  let [hours, minutes] = time.split(':');
  
  hours = parseInt(hours);
  if (modifier === 'PM' && hours !== 12) {
    hours += 12;
  } else if (modifier === 'AM' && hours === 12) {
    hours = 0;
  }
  
  return hours * 60 + parseInt(minutes); // Return minutes for easy comparison
};

// Index for better query performance
appointmentSchema.index({ student: 1, date: 1 });
appointmentSchema.index({ staff: 1, date: 1 });
appointmentSchema.index({ status: 1, date: 1 });
appointmentSchema.index({ date: 1, startTime: 1 });

// Virtual for formatted date
appointmentSchema.virtual('formattedDate').get(function() {
  if (this.date) {
    return this.date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  return null;
});

// Virtual for time range
appointmentSchema.virtual('timeRange').get(function() {
  if (this.startTime && this.endTime) {
    return `${this.startTime} - ${this.endTime}`;
  }
  return null;
});

// Virtual for student full name
appointmentSchema.virtual('studentFullName').get(function() {
  if (this.student && this.student.firstName && this.student.lastName) {
    return `${this.student.firstName} ${this.student.lastName}`;
  }
  return 'Unknown Student';
});

// Virtual for staff full name
appointmentSchema.virtual('staffFullName').get(function() {
  if (this.staff && this.staff.firstName && this.staff.lastName) {
    return `${this.staff.firstName} ${this.staff.lastName}`;
  }
  return 'Unknown Staff';
});

// Instance method to cancel appointment
appointmentSchema.methods.cancelAppointment = function(userId, reason) {
  this.status = 'cancelled';
  this.cancelledBy = userId;
  this.cancelledAt = new Date();
  this.cancellationReason = reason;
  return this.save();
};

// Instance method to confirm appointment
appointmentSchema.methods.confirmAppointment = function() {
  this.status = 'confirmed';
  return this.save();
};

// Instance method to mark as completed
appointmentSchema.methods.completeAppointment = function() {
  this.status = 'completed';
  return this.save();
};

// Static method to get appointments by role
appointmentSchema.statics.getAppointmentsByRole = function(userId, role) {
  if (role === 'student') {
    return this.find({ student: userId })
      .populate('student', 'firstName lastName email role studentId')
      .populate('staff', 'firstName lastName email role department')
      .sort({ date: 1, startTime: 1 });
  } else if (role === 'lecturer') {
    return this.find({ staff: userId })
      .populate('student', 'firstName lastName email role studentId')
      .populate('staff', 'firstName lastName email role department')
      .sort({ date: 1, startTime: 1 });
  } else if (role === 'admin') {
    return this.find({})
      .populate('student', 'firstName lastName email role studentId')
      .populate('staff', 'firstName lastName email role department')
      .sort({ date: 1, startTime: 1 });
  }
  
  return [];
};

// Static method to check for time conflicts
appointmentSchema.statics.checkTimeConflict = async function(staffId, date, startTime, endTime, excludeId = null) {
  const query = {
    staff: staffId,
    date: date,
    status: { $in: ['pending', 'confirmed'] }
  };
  
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  
  const conflictingAppointments = await this.find(query);
  
  const newStart = this.prototype.convertTo24Hour.call({}, startTime);
  const newEnd = this.prototype.convertTo24Hour.call({}, endTime);
  
  return conflictingAppointments.some(appointment => {
    const existingStart = appointment.convertTo24Hour(appointment.startTime);
    const existingEnd = appointment.convertTo24Hour(appointment.endTime);
    
    // Check for overlap
    return (newStart < existingEnd && newEnd > existingStart);
  });
};

// Configure toJSON to include virtuals
appointmentSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Appointment', appointmentSchema);