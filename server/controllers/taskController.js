const mongoose = require("mongoose");
const Task = require("../models/Task");
const Notification = require("../models/Notification");
const User = require("../models/User");
const { sendMentionEmail } = require("../utils/emailService");

// @desc    Fetch all tasks
// @route   GET /api/tasks
// @access  Private (requires token)
const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate("createdBy", "name email role avatar")
      .populate("assignedTo", "name email role avatar")
      .populate("comments.author", "name email role avatar")
      .populate("comments.mentions", "name email")
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
    const {
      title,
      description,
      status,
      priority,
      createdBy,
      assignedTo,
      sprint,
      storyPoints,
      milestone,
      startDate,
      dueDate,
    } = req.body || {};

    if (!title || (typeof title === "string" && !title.trim())) {
      return res.status(400).json({ message: "Title is required" });
    }

    const taskData = {
      title: typeof title === "string" ? title.trim() : title,
      description: typeof description === "string" ? description.trim() : description,
      status: status || "To-Do",
      priority: priority || "Medium",
      createdBy,
    };

    if (assignedTo !== undefined) {
      taskData.assignedTo =
        assignedTo === "" || (typeof assignedTo === "string" && !assignedTo.trim())
          ? null
          : assignedTo;
    }
    if (sprint !== undefined && sprint !== "") {
      taskData.sprint = typeof sprint === "string" ? sprint.trim() : sprint;
    }
    if (storyPoints !== undefined && storyPoints !== "") {
      taskData.storyPoints = storyPoints;
    }
    if (milestone !== undefined && milestone !== "") {
      taskData.milestone = typeof milestone === "string" ? milestone.trim() : milestone;
    }
    if (startDate !== undefined) {
      taskData.startDate = startDate === "" ? null : startDate;
    }
    if (dueDate !== undefined) {
      taskData.dueDate = dueDate === "" ? null : dueDate;
    }

    const task = new Task(taskData);

    const savedTask = await task.save();
    await savedTask.populate("createdBy", "name email role avatar");
    await savedTask.populate("assignedTo", "name email role avatar");
    await savedTask.populate("comments.author", "name email role avatar");
    await savedTask.populate("comments.mentions", "name email");

    res.status(201).json(savedTask);
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update a task's status, title, description, priority, or management fields
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
    if (typeof updates.sprint === "string") {
      updates.sprint = updates.sprint.trim();
    }
    if (typeof updates.milestone === "string") {
      updates.milestone = updates.milestone.trim();
    }
    if (updates.startDate === "") {
      updates.startDate = null;
    }
    if (updates.dueDate === "") {
      updates.dueDate = null;
    }
    if (
      updates.assignedTo === "" ||
      (typeof updates.assignedTo === "string" && !updates.assignedTo.trim())
    ) {
      updates.assignedTo = null;
    }

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    )
      .populate("createdBy", "name email role avatar")
      .populate("assignedTo", "name email role avatar")
      .populate("comments.author", "name email role avatar")
      .populate("comments.mentions", "name email");

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

// @desc    Add a comment to a task with optional @mentions
// @route   POST /api/tasks/:id/comments
// @access  Private (requires token)
const addTaskComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text, mentions } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (!text || (typeof text === "string" && !text.trim())) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const authorId = req.user?.id || req.user?._id;
    if (!authorId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Filter and sanitize mentions array of User IDs
    const rawMentions = Array.isArray(mentions) ? mentions : [];
    const validMentions = rawMentions.filter((mId) =>
      mongoose.Types.ObjectId.isValid(mId)
    );

    const commentData = {
      text: typeof text === "string" ? text.trim() : text,
      author: authorId,
      mentions: validMentions,
      createdAt: new Date(),
    };

    task.comments.push(commentData);
    await task.save();

    // Resolve author name for notifications & emails
    const authorUser = await User.findById(authorId).select("name email role");
    const senderName = authorUser?.name || "A team member";

    // Create Notification and trigger email for each unique mentioned user
    if (validMentions.length > 0) {
      const uniqueMentions = Array.from(new Set(validMentions.map(String)));
      for (const recipientId of uniqueMentions) {
        // Do not notify self
        if (String(recipientId) === String(authorId)) continue;

        try {
          // In-app Notification
          await Notification.create({
            recipient: recipientId,
            sender: authorId,
            task: task._id,
            message: `${senderName} mentioned you in a comment on "${task.title}"`,
            isRead: false,
          });

          // Send Email
          const recipientUser = await User.findById(recipientId).select("name email");
          if (recipientUser?.email) {
            await sendMentionEmail(
              recipientUser.email,
              senderName,
              task.title,
              commentData.text
            );
          }
        } catch (notifError) {
          console.error("Failed to process mention notification/email:", notifError);
        }
      }
    }

    await task.populate("createdBy", "name email role avatar");
    await task.populate("assignedTo", "name email role avatar");
    await task.populate("comments.author", "name email role avatar");
    await task.populate("comments.mentions", "name email");

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete a comment from a task
// @route   DELETE /api/tasks/:id/comments/:commentId
// @access  Private (Author or Admin)
const deleteTaskComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(404).json({ message: "Task or comment not found" });
    }

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const comment = task.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const currentUserId = req.user?.id || req.user?._id;
    const isAuthor = String(comment.author) === String(currentUserId);
    const isAdmin =
      req.user?.role === "Admin" ||
      (typeof req.user?.role === "string" && req.user.role.toLowerCase() === "admin");

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({
        message: "Access denied: You can only delete your own comments unless you are an Admin",
      });
    }

    task.comments.pull(commentId);
    await task.save();

    await task.populate("createdBy", "name email role avatar");
    await task.populate("assignedTo", "name email role avatar");
    await task.populate("comments.author", "name email role avatar");
    await task.populate("comments.mentions", "name email");

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getTasks,
  getAllTasks: getTasks,
  createTask,
  updateTask,
  deleteTask,
  addTaskComment,
  deleteTaskComment,
};
