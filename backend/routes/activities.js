const express = require('express');
const auth = require('../middleware/auth');
const Activity = require('../models/Activity');

const router = express.Router();

router.post('/', auth, async (req, res) => {
  try {
    const activity = new Activity({
      ...req.body,
      performedBy: req.user ? req.user.id : null
    });
    await activity.save();
    res.json(activity);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
