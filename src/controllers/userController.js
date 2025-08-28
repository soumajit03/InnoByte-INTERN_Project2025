const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// @desc Register user
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all fields' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password, // raw password, hashing happens in pre-save hook
    });

    res.status(201).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
// @desc Login user

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  console.log("Login attempt:", { email, password });

  const user = await User.findOne({ email });
  if (!user) {
    console.log("❌ User not found in DB");
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  console.log("✅ Found user:", user.email);
  console.log("Stored hash:", user.password);

  const isMatch = await bcrypt.compare(password, user.password);
  console.log("Password provided:", password);
  console.log("Password match result:", isMatch);

  if (!isMatch) {
    console.log("❌ Password did not match");
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({
    success: true,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
    token
  });
};


// @desc Get logged-in user
exports.getMe = async (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
};

// @desc Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin only' });
    }

    const users = await User.find().select('-password');
    res.json({ success: true, count: users.length, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
