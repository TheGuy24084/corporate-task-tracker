const crypto = require("crypto");
const User = require("../models/User");
const Invitation = require("../models/Invitation");
const { sendInviteEmail } = require("../utils/emailService");

/**
 * @desc    Fetch all registered team members and pending invitations
 * @route   GET /api/team
 * @access  Private
 */
const getTeamMembers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    const invitations = await Invitation.find({ status: "Pending" }).populate(
      "invitedBy",
      "name email"
    );

    res.status(200).json({
      users,
      invitations,
      members: users,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch team members",
      error: error.message,
    });
  }
};

/**
 * @desc    Invite a new team member via email
 * @route   POST /api/team/invite
 * @access  Private (Admins or authorized members)
 */
const inviteMember = async (req, res) => {
  try {
    const { email, role } = req.body || {};

    if (!email || typeof email !== "string" || !email.trim()) {
      return res.status(400).json({ message: "Email is required" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ message: "Please provide a valid email address" });
    }

    // Check if user is already registered
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email is already registered" });
    }

    const targetRole = role === "Admin" ? "Admin" : "User";
    const inviterId = req.user?.id || req.user?._id;

    // Resolve inviter display name
    let inviterName = "A team administrator";
    if (inviterId) {
      const inviter = await User.findById(inviterId).select("name email");
      if (inviter?.name) {
        inviterName = inviter.name;
      }
    }

    // Generate unique hex token using crypto
    const token = crypto.randomBytes(32).toString("hex");

    // Save new Invitation document
    const invitation = new Invitation({
      email: normalizedEmail,
      role: targetRole,
      token,
      status: "Pending",
      invitedBy: inviterId,
    });

    await invitation.save();

    // Construct invite link
    const clientBaseUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const inviteLink = `${clientBaseUrl}/register?inviteToken=${token}&email=${encodeURIComponent(
      normalizedEmail
    )}&role=${encodeURIComponent(targetRole)}`;

    // Send email using emailService
    let previewUrl = null;
    try {
      const emailResult = await sendInviteEmail(
        normalizedEmail,
        inviteLink,
        inviterName,
        targetRole
      );
      previewUrl = emailResult?.previewUrl || null;
    } catch (emailError) {
      console.error("Failed to send invitation email:", emailError);
      // Proceed without failing the creation of the invitation
    }

    res.status(201).json({
      message: "Invitation sent successfully",
      invitation,
      inviteLink,
      previewUrl,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to invite team member",
      error: error.message,
    });
  }
};

/**
 * @desc    Accept an invitation using token
 * @route   POST /api/team/accept-invite
 * @access  Public
 */
const acceptInvitation = async (req, res) => {
  try {
    const { token } = req.body || {};

    if (!token || typeof token !== "string" || !token.trim()) {
      return res.status(400).json({ message: "Invitation token is required" });
    }

    const invitation = await Invitation.findOne({ token: token.trim() });
    if (!invitation) {
      return res.status(404).json({ message: "Invitation not found" });
    }

    if (invitation.status === "Accepted") {
      return res.status(400).json({ message: "Invitation has already been accepted" });
    }

    if (invitation.status === "Expired") {
      return res.status(400).json({ message: "Invitation has expired" });
    }

    invitation.status = "Accepted";
    await invitation.save();

    res.status(200).json({
      message: "Invitation accepted successfully",
      invitation,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to accept invitation",
      error: error.message,
    });
  }
};

module.exports = {
  getTeamMembers,
  inviteMember,
  acceptInvitation,
};
