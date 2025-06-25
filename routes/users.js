const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const MealSelection = require('../models/MealSelection');

// @route   GET api/users
// @desc    Get all users (admin only)
// @access  Private/Admin
router.get('/', auth.admin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/users/meal-stats
// @desc    Get meal statistics (admin only)
// @access  Private/Admin
router.get('/meal-stats', auth.admin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const match = {};
    if (startDate && endDate) {
      match.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const stats = await MealSelection.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            date: '$date',
            mealTime: '$mealTime',
            mealType: '$mealType',
            dietType: '$dietType'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: {
            date: '$_id.date',
            mealTime: '$_id.mealTime'
          },
          types: {
            $push: {
              mealType: '$_id.mealType',
              dietType: '$_id.dietType',
              count: '$count'
            }
          },
          total: { $sum: '$count' }
        }
      },
      { $sort: { '_id.date': 1, '_id.mealTime': 1 } }
    ]);
    
    res.json(stats);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;