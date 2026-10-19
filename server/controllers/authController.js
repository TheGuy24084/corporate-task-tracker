const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

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

    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : email;

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
    }

    const user = new User(userData);
    const savedUser = await user.save();

    // Generate signed JWT token
    const token = generateToken(savedUser);

    res.status(201).json({
      token,
      user: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        role: savedUser.role,
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

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : email;

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
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  register,
  login,
  registerUser: register,
  loginUser: login,
};
