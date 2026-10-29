const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Invitation = require("../models/Invitation");

// Helper function to generate JWT token
const generateToken = (user) => {
  const secret = process.env.JWT_SECRET || "supersecretjwtkey123";
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    secret,
    {
      expiresIn: "1d",
    }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    if (
      (typeof name === "string" && !name.trim()) ||
      (typeof email === "string" && !email.trim()) ||
      (typeof password === "string" && !password.trim())
    ) {
      return res.status(400).json({ message: "Name, email, and password cannot be empty" });
    }

    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

    if (!normalizedEmail) {
      return res.status(400).json({ message: "A valid email is required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ message: "Please provide a valid email address" });
    }

    if (typeof password === "string" && password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Build user object, allowing optional role field for testing
    const userData = {
      name: typeof name === "string" ? name.trim() : name,
      email: normalizedEmail,
      password: hashedPassword,
    };

    if (role !== undefined) {
      if (typeof role === "string" && role.toLowerCase() === "admin") {
        userData.role = "Admin";
      } else if (typeof role === "string" && role.toLowerCase() === "user") {
        userData.role = "User";
      } else {
        userData.role = role;
      }
    } else {
      // If role not specified, check if there is a pending invitation for this email
      const pendingInvite = await Invitation.findOne({
        email: normalizedEmail,
        status: "Pending",
      });
      if (pendingInvite?.role) {
        userData.role = pendingInvite.role;
      }
    }

    const user = new User(userData);
    const savedUser = await user.save();

    // Automatically update any Pending invitation document for this email to 'Accepted'
    try {
      await Invitation.updateMany(
        { email: normalizedEmail, status: "Pending" },
        { status: "Accepted" }
      );
    } catch (inviteErr) {
      console.error("Failed to update pending invitation:", inviteErr);
    }

    // Generate signed JWT token
    const token = generateToken(savedUser);

    res.status(201).json({
      token,
      user: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        role: savedUser.role,
        avatar: savedUser.avatar || "",
      },
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    if (error.code === 11000) {
      return res.status(400).json({ message: "User already exists" });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const trimmedPassword = typeof password === "string" ? password.trim() : "";

    if (!normalizedEmail || !trimmedPassword) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find user by email
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate signed JWT token
    const token = generateToken(user);

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar || "",
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get logged in user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar || "",
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update user profile & credentials
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { name, email, avatar, currentPassword, newPassword, password } = req.body || {};

    // Update name
    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({ message: "Name cannot be empty" });
      }
      user.name = name.trim();
    }

    // Update email
    if (email !== undefined) {
      const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
      if (!normalizedEmail) {
        return res.status(400).json({ message: "Email cannot be empty" });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(normalizedEmail)) {
        return res.status(400).json({ message: "Please provide a valid email address" });
      }

      if (normalizedEmail !== user.email) {
        const existing = await User.findOne({ email: normalizedEmail, _id: { $ne: user._id } });
        if (existing) {
          return res.status(400).json({ message: "Email is already taken by another user" });
        }
        user.email = normalizedEmail;
      }
    }

    // Update avatar
    if (avatar !== undefined) {
      user.avatar = typeof avatar === "string" ? avatar : "";
    }

    // Update password if provided
    const targetPassword = newPassword || password;
    if (targetPassword) {
      if (typeof targetPassword !== "string" || targetPassword.length < 6) {
        return res.status(400).json({ message: "New password must be at least 6 characters long" });
      }

      if (currentPassword) {
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
          return res.status(400).json({ message: "Current password is incorrect" });
        }
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(targetPassword, salt);
    }

    const updatedUser = await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        avatar: updatedUser.avatar || "",
      },
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  registerUser: register,
  loginUser: login,
};
