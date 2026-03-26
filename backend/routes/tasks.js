const express = require('express');
const auth = require('../middleware/auth');
const Task = require('../models/Task');

const router = express.Router();

// Get all tasks
router.get('/', auth, async (req, res) => {
  try {
    const { status, priority, assignedTo, relatedTo } = req.query;
    let query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assignedTo) query.assignedTo = assignedTo;
    
    // Check overdue logic locally on frontend or parse date

    const tasks = await Task.find(query).populate('assignedTo', 'name').sort({ dueDate: 1 });
    res.json(tasks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get today's tasks
router.get('/today', auth, async (req, res) => {
  try {
    const start = new Date();
    start.setHours(0,0,0,0);
    const end = new Date();
    end.setHours(23,59,59,999);

    const tasks = await Task.find({
      dueDate: { $gte: start, $lte: end }
    }).populate('assignedTo', 'name').sort({ dueTime: 1 });
    res.json(tasks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get overdue tasks
router.get('/overdue', auth, async (req, res) => {
  try {
    const now = new Date();
    const tasks = await Task.find({
      dueDate: { $lt: now },
      status: { $nin: ['completed', 'cancelled'] }
    }).populate('assignedTo', 'name').sort({ dueDate: 1 });
    res.json(tasks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Create task
router.post('/', auth, async (req, res) => {
  try {
    const task = new Task(req.body);
    await task.save();
    res.json(task);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Update task
router.put('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, { ...req.body, updatedAt: Date.now() }, { new: true });
    if (!task) return res.status(404).json({ msg: 'Task not found' });
    res.json(task);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Complete task
router.put('/:id/complete', auth, async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, { status: 'completed', completedAt: Date.now() }, { new: true });
    if (!task) return res.status(404).json({ msg: 'Task not found' });
    res.json(task);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Delete task
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ msg: 'Task not found' });
    res.json({ msg: 'Task deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;