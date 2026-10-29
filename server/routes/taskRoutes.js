const express = require("express");
const router = express.Router();
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  addTaskComment,
  deleteTaskComment,
} = require("../controllers/taskController");
const { verifyToken, authorizeAdmin } = require("../middleware/authMiddleware");

// GET /api/tasks - Verify token
router.get("/", verifyToken, getTasks);

// POST /api/tasks - Verify token and set createdBy: req.user.id
router.post(
  "/",
  verifyToken,
  (req, res, next) => {
    if (req.user && req.user.id) {
      req.body = { ...req.body, createdBy: req.user.id };
    }
    next();
  },
  createTask
);

// PUT /api/tasks/:id - Verify token
router.put("/:id", verifyToken, updateTask);

// DELETE /api/tasks/:id - Verify token and authorize Admin
router.delete("/:id", verifyToken, authorizeAdmin, deleteTask);

// POST /api/tasks/:id/comments - Add comment and trigger mention notifications
router.post("/:id/comments", verifyToken, addTaskComment);

// DELETE /api/tasks/:id/comments/:commentId - Delete comment (Author or Admin)
router.delete("/:id/comments/:commentId", verifyToken, deleteTaskComment);

module.exports = router;

