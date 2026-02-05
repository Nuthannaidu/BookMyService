const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      enum: ['medical', 'saloon', 'car_rental'],
    },

    duration: {
      type: Number,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    // category-specific fields
    details: {
      medical: {
        specialization: String,
        consultationType: {
          type: String,
          enum: ['online', 'offline'],
        },
      },

      saloon: {
        gender: {
          type: String,
          enum: ['male', 'female', 'unisex'],
        },
        serviceType: String,
      },

      carRental: {
        vehicleType: String,
        transmission: {
          type: String,
          enum: ['manual', 'automatic'],
        },
        fuelType: String,
        seats: Number,
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Service', serviceSchema);
