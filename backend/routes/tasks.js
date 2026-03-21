const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Task = require('../models/Tasks');
const User = require('../models/User');

// Helper function to update parent progress
const updateParentProgress = async (parentId) => {
    if (!parentId) return;

    const subtasks = await Task.find({ parentTask: parentId });
    if (subtasks.length === 0) return;

    const totalProgress = subtasks.reduce((sum, task) => sum + (task.progress || 0), 0);
    const averageProgress = Math.round(totalProgress / subtasks.length);

    const parent = await Task.findById(parentId);
    if (parent) {
        parent.progress = averageProgress;
        if (averageProgress === 100) {
            parent.status = 'Completed';
        } else if (averageProgress > 0) {
            parent.status = 'In Progress';
        }
        await parent.save();

        // Recursively update upwards
        if (parent.parentTask) {
            await updateParentProgress(parent.parentTask);
        }
    }
};

// @route   GET api/tasks
// @desc    Get all tasks based on user role
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        let query = {};

        if (user.role === 'admin') {
            // Admin sees everything
            query = {};
        } else if (user.role === 'manager') {
            // Manager sees tasks they created or are assigned to
            query = { $or: [{ user: req.user.id }, { assignedTo: req.user.id }] };
        } else if (user.role === 'tl' || user.role === 'employee') {
            // TL and Employee see tasks assigned to them
            query = { assignedTo: req.user.id };
        }

        const tasks = await Task.find(query)
            .populate('assignedTo', 'name email role')
            .populate('assignedBy', 'name email role')
            .sort({ createdAt: -1 });
        res.json(tasks);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/tasks
// @desc    Create a task
router.post('/', auth, async (req, res) => {
    try {
        const { title, description, assignedTo, parentTask, priority, dueDate, color } = req.body;

        const newTask = new Task({
            title,
            description,
            user: req.user.id,
            assignedBy: req.user.id,
            assignedTo,
            parentTask,
            priority,
            dueDate,
            color
        });

        const task = await newTask.save();

        if (parentTask) {
            await updateParentProgress(parentTask);
        }

        res.json(task);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/tasks/:id
// @desc    Update a task
router.put('/:id', auth, async (req, res) => {
    try {
        const { title, description, status, priority, progress, dueDate, color, assignedTo } = req.body;

        let task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ msg: 'Task not found' });

        // Update fields
        if (title) task.title = title;
        if (description !== undefined) task.description = description;
        if (status) task.status = status;
        if (priority) task.priority = priority;
        if (progress !== undefined) task.progress = progress;
        if (dueDate) task.dueDate = dueDate;
        if (color) task.color = color;
        if (assignedTo) task.assignedTo = assignedTo;

        await task.save();

        if (task.parentTask) {
            await updateParentProgress(task.parentTask);
        }

        res.json(task);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/tasks/:id
// @desc    Delete a task
router.delete('/:id', auth, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ msg: 'Task not found' });

        const parentId = task.parentTask;
        await Task.findByIdAndDelete(req.params.id);

        // Also delete subtasks recursively? For now, just orphan them or delete.
        // Let's delete subtasks for cleanliness.
        await Task.deleteMany({ parentTask: req.params.id });

        if (parentId) {
            await updateParentProgress(parentId);
        }

        res.json({ msg: 'Task removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;    