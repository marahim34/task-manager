const express = require('express');
const Task = require('../models/Task');
const auth = require('../middleware/auth');
const authorizeRoles = require('../middleware/roleAuth.js')
const { validateCreateTask, validateUpdateTask } = require('../validators/taskValidator');

const router = express.Router();

// Admin: Get statistics
router.get('/stats/overview', auth, authorizeRoles('admin'), async (req, res) => {
  try {
    const totalTasks = await Task.countDocuments();
    const completedTasks = await Task.countDocuments({ completed: true });
    const pendingTasks = await Task.countDocuments({ completed: false });

    const byPriority = await Task.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    const byCategory = await Task.aggregate([
      { $match: { category: { $exists: true, $ne: null } } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const byUser = await Task.aggregate([
      { $group: { _id: '$owner', count: { $sum: 1 } } },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { _id: 0, userId: '$_id', name: '$user.name', email: '$user.email', count: 1 } }
    ]);

    res.json({
      totalTasks,
      completedTasks,
      pendingTasks,
      byPriority,
      byCategory,
      byUser
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch statistics', message: error.message });
  }
});

// Admin: Bulk delete completed tasks
router.delete('/admin/purge-completed', auth, authorizeRoles('admin'), async (req, res) => {
  try {
    const result = await Task.deleteMany({ completed: true });

    res.json({
      message: 'Completed tasks purged successfully',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to purge tasks', message: error.message });
  }
});

// Get all tasks
router.get('/', auth, async (req, res) => {
  try {
    const { status, priority, category, search, completed, dueBefore, dueAfter, sort = 'createdAt', order = 'desc' } = req.query;

    const filter = {};
    
    if (req.user.role !== 'admin') {
      filter.owner = req.user._id;
    }

    if (status) {
        filter.status = status;
    }

    if (priority) {
        filter.priority = priority;
    }

    if (category) {
        filter.category = category;
    }

    if (completed !== undefined) {
        filter.completed = completed === 'true';
    }
    
   
    if (dueBefore || dueAfter) {
      filter.dueDate = {};

      if (dueBefore) {
        filter.dueDate.$lte = new Date(dueBefore);
      }
      
      if (dueAfter) {
        filter.dueDate.$gte = new Date(dueAfter);
      }

    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const sortObj = { [sort]: sortOrder };

    const tasks = await Task.find(filter)
      .sort(sortObj)
      .populate('owner', 'name email');

    res.json({
      tasks,
      count: tasks.length,
      filters: { status, priority, category, completed, dueBefore, dueAfter, search }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tasks', message: error.message });
  }
});

// Get single task
router.get('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('owner', 'name email');

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }


    if (req.user.role !== 'admin' && task.owner._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ task });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid task ID' });
    }

    res.status(500).json({ error: 'Failed to fetch task', message: error.message });
  }
});

// Create task
// Create task
router.post('/', auth, validateCreateTask, async (req, res) => {
  try {
    console.log('Creating task for user:', req.user); // DEBUG
    
    const task = new Task({
      ...req.body,
      owner: req.user._id
    });

    console.log('Task created, about to save:', task);
    await task.save();
    console.log('Task saved successfully'); 
    
    await task.populate('owner', 'name email');

    res.status(201).json({
      message: 'Task created successfully',
      task
    });
  } catch (error) {
    console.error('Error in POST /tasks:', error); 
    res.status(500).json({ error: 'Failed to create task', message: error.message });
  }
});

// Update task
router.put('/:id', auth, validateUpdateTask, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (req.user.role !== 'admin' && task.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }


    Object.keys(req.body).forEach(key => {
      task[key] = req.body[key];
    });

    await task.save();
    await task.populate('owner', 'name email');

    res.json({
      message: 'Task updated successfully',
      task
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid task ID' });
    }
    res.status(500).json({ error: 'Failed to update task', message: error.message });
  }
});

// Delete task
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (req.user.role !== 'admin' && task.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await Task.findByIdAndDelete(req.params.id);

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid task ID' });
    }
    
    res.status(500).json({ error: 'Failed to delete task', message: error.message });
  }
});

module.exports = router;