const mongoose = require("mongoose");
const Notification = require("../models/Notification");

// @desc    Get all notifications for logged-in user
// @route   GET /api/notifications
// @access  Private (requires token)
const getNotifications = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const notifications = await Notification.find({ recipient: userId })
      .populate("sender", "name")
      .populate("task", "title")
      .sort({ createdAt: -1 });

    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Mark a notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private (requires token)
const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.user?._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: "Notification not found" });
    }

    const notification = await Notification.findOne({
      _id: id,
      recipient: userId,
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    notification.isRead = true;
    await notification.save();

    await notification.populate("sender", "name");
    await notification.populate("task", "title");

    res.status(200).json(notification);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Mark all notifications as read for logged-in user
// @route   PUT /api/notifications/read-all
// @access  Private (requires token)
const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    await Notification.updateMany(
      { recipient: userId, isRead: false },
      { $set: { isRead: true } }
    );

    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};

