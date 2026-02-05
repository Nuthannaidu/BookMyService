const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema(
  {
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },

    workingHours: [
      {
        dayOfWeek: {
          type: Number,
          required: true,
          min: 0,
          max: 6,
        },
        startTime: {
          type: String,
          required: true,
        },
        endTime: {
          type: String,
          required: true,
        },
      },
    ],

    unavailableDates: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true }
);

scheduleSchema.index({ provider: 1, service: 1 }, { unique: true });

module.exports = mongoose.model('Schedule', scheduleSchema);
