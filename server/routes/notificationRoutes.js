const express = require("express");
const router = express.Router();
const {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} = require("../controllers/notificationController");
const { verifyToken } = require("../middleware/authMiddleware");

// All routes require authentication
router.use(verifyToken);

// GET /api/notifications - Fetch user notifications
router.get("/", getNotifications);

// PUT /api/notifications/read-all - Mark all user notifications as read
router.put("/read-all", markAllNotificationsAsRead);

// PUT /api/notifications/:id/read - Mark single notification as read
router.put("/:id/read", markNotificationAsRead);

module.exports = router;

