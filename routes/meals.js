const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const MealSelection = require('../models/MealSelection');
const { check, validationResult } = require('express-validator');

// @route   POST api/meals
// @desc    Create or update meal selection
// @access  Private
router.post('/', [
  auth,
  [
    check('date', 'Date is required').not().isEmpty(),
    check('mealTime', 'Meal time is required').isIn(['breakfast', 'lunch', 'dinner']),
    check('mealType', 'Meal type is required').isIn(['company', 'hostel']),
    check('dietType', 'Diet type is required').isIn(['veg', 'nonveg'])
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { date, mealTime, mealType, dietType } = req.body;

  try {
    // Check if selection already exists
    let selection = await MealSelection.findOne({
      user: req.user.id,
      date,
      mealTime
    });

    if (selection) {
      // Update existing selection
      selection.mealType = mealType;
      selection.dietType = dietType;
      await selection.save();
      return res.json(selection);
    }

    // Create new selection
    selection = new MealSelection({
      user: req.user.id,
      date,
      mealTime,
      mealType,
      dietType
    });

    await selection.save();
    res.json(selection);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/meals
// @desc    Get all meal selections for user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const selections = await MealSelection.find({ user: req.user.id })
      .sort({ date: 1, mealTime: 1 });
    res.json(selections);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/meals/:date
// @desc    Get meal selections for specific date
// @access  Private
router.get('/:date', auth, async (req, res) => {
  try {
    const selections = await MealSelection.find({
      user: req.user.id,
      date: req.params.date
    });
    res.json(selections);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/meals/:id
// @desc    Delete meal selection
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const selection = await MealSelection.findById(req.params.id);

    if (!selection) {
      return res.status(404).json({ msg: 'Selection not found' });
    }

    // Check user owns the selection
    if (selection.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await selection.remove();
    res.json({ msg: 'Selection removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;