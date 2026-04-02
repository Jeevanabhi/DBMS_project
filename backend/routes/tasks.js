const express = require('express');
const Task = require('../models/Task');
const router = express.Router();

// @route   POST /tasks
// @desc    Create a new task
router.post('/', async (req, res) => {
  try {
    const { title, status, dynamicFields, comments } = req.body;
    const newTask = new Task({ title, status, dynamicFields, comments });
    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// @route   GET /tasks
// @desc    Get all tasks
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   PUT /tasks/:id
// @desc    Update a task
router.put('/:id', async (req, res) => {
  try {
    // For Mixed types, since Mongoose doesn't detect deep changes easily during findByIdAndUpdate, 
    // it's fine here because we are passing the whole object.
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!updatedTask) return res.status(404).json({ error: 'Task not found' });
    res.json(updatedTask);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// @route   DELETE /tasks/:id
// @desc    Delete a task
router.delete('/:id', async (req, res) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id);
    if (!deletedTask) return res.status(404).json({ error: 'Task not found' });
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   POST /tasks/:id/comments
// @desc    Add a comment to a task
router.post('/:id/comments', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    task.comments.push(req.body);
    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// @route   DELETE /tasks/:id/comments/:commentId
// @desc    Delete a comment from a task
router.delete('/:id/comments/:commentId', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    task.comments = task.comments.filter(
      (c) => c._id.toString() !== req.params.commentId
    );
    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
