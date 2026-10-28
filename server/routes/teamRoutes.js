const express = require("express");
const router = express.Router();
const {
  getTeamMembers,
  inviteMember,
  acceptInvitation,
} = require("../controllers/teamController");
const { verifyToken } = require("../middleware/authMiddleware");

// GET /api/team/members - Fetch all registered users and pending invitations
router.get("/members", verifyToken, getTeamMembers);
router.get("/", verifyToken, getTeamMembers);

// POST /api/team/invite - Invite a new team member via email
router.post("/invite", verifyToken, inviteMember);

// POST /api/team/accept-invite - Accept an invitation
router.post("/accept-invite", acceptInvitation);

module.exports = router;
