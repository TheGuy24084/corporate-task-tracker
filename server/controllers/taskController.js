const mongoose = require("mongoose");
const Task = require("../models/Task");

// @desc    Fetch all tasks
// @route   GET /api/tasks
// @access  Private (requires token)
const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private (requires token)
const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, createdBy } = req.body || {};

    if (!title || (typeof title === "string" && !title.trim())) {
      return res.status(400).json({ message: "Title is required" });
    }

    const task = new Task({
      title: typeof title === "string" ? title.trim() : title,
      description: typeof description === "string" ? description.trim() : description,
      status: status || "To-Do",
      priority: priority || "Medium",
      createdBy,
    });

    const savedTask = await task.save();
    await savedTask.populate("createdBy", "name email role");

    res.status(201).json(savedTask);
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update a task's status, title, description, or priority
// @route   PUT /api/tasks/:id
// @access  Private (requires token)
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Sanitize update payload to prevent changing immutable or protected fields
    const updates = { ...(req.body || {}) };
    delete updates._id;
    delete updates.createdAt;
    delete updates.updatedAt;

    if (
      updates.title !== undefined &&
      (!updates.title || (typeof updates.title === "string" && !updates.title.trim()))
    ) {
      return res.status(400).json({ message: "Task title cannot be empty" });
    }

    if (typeof updates.title === "string") {
      updates.title = updates.title.trim();
    }
    if (typeof updates.description === "string") {
      updates.description = updates.description.trim();
    }

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).populate("createdBy", "name email role");

    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json(updatedTask);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(404).json({ message: "Task not found" });
    }
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private (Admin only)
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: "Task not found" });
    }

    const deletedTask = await Task.findByIdAndDelete(id);

    if (!deletedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(404).json({ message: "Task not found" });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getTasks,
  getAllTasks: getTasks,
  createTask,
  updateTask,
  deleteTask,
};
