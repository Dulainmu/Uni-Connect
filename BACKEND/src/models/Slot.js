const mongoose = require('mongoose');
const { convertToMinutes } = require('../utils/timeUtils');

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
      validator: function (v) {
        return /^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/.test(v);
      },
      message: 'Start time must be in HH:MM AM/PM format'
    }
  },
  endTime: {
    type: String,
    required: [true, 'End time is required'],
    validate: {
      validator: function (v) {
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



// Validate end after start
slotSchema.pre('validate', function (next) {
  if (this.startTime && this.endTime) {
    const start = convertToMinutes(this.startTime);
    const end = convertToMinutes(this.endTime);
    if (start >= end) {
      this.invalidate('endTime', 'End time must be after start time');
    }
  }
  next();
});

slotSchema.index({ staff: 1, date: 1, startTime: 1 });

module.exports = mongoose.model('Slot', slotSchema);


