const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  staff: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: [true, 'Slot date is required']
  },
  startTime: {
    type: String,
    required: [true, 'Start time is required'],
    validate: {
      validator: function(v) {
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
        return /^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/.test(v);
      },
      message: 'End time must be in HH:MM AM/PM format'
    }
  },
  location: {
    type: String,
    trim: true,
    maxlength: [100, 'Location cannot exceed 100 characters']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Helper to convert 12h to minutes since midnight
slotSchema.methods.convertTo24Hour = function(time12h) {
  const [time, modifier] = time12h.split(' ');
  let [hours, minutes] = time.split(':');
  hours = parseInt(hours);
  if (modifier === 'PM' && hours !== 12) {
    hours += 12;
  } else if (modifier === 'AM' && hours === 12) {
    hours = 0;
  }
  return hours * 60 + parseInt(minutes);
};

// Validate end after start
slotSchema.pre('validate', function(next) {
  if (this.startTime && this.endTime) {
    const start = this.convertTo24Hour(this.startTime);
    const end = this.convertTo24Hour(this.endTime);
    if (start >= end) {
      this.invalidate('endTime', 'End time must be after start time');
    }
  }
  next();
});

slotSchema.index({ staff: 1, date: 1, startTime: 1 });

module.exports = mongoose.model('Slot', slotSchema);


