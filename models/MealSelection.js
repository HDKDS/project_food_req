const mongoose = require('mongoose');

const MealSelectionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  mealTime: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner'],
    required: true
  },
  mealType: {
    type: String,
    enum: ['company', 'hostel'],
    required: true
  },
  dietType: {
    type: String,
    enum: ['veg', 'nonveg'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending'
  },
  selectedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Ensure one selection per user per meal per day
MealSelectionSchema.index({ user: 1, date: 1, mealTime: 1 }, { unique: true });

module.exports = mongoose.model('MealSelection', MealSelectionSchema);