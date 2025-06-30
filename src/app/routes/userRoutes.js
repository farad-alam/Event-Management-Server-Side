const express = require("express");
const User = require("../models/User");
const router = express.Router();

// 123456.aA

// Create a new user

router.post("/", async (req, res) => {
  try {
    const { name, email, password, photoURL } = req.body;
    console.log(req.body);

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        error: "User already exists with this email",
      });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      photoURL,
    });

    await user.save();

    res.status(201).json({
      message: "User created successfully",
      user: user.toJSON(),
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        error: "Validation Error",
        messages,
      });
    }

    res.status(500).json({
      error: "Server Error",
      message: error.message,
    });
  }
});

// Login User:
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found with this email" });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ error: "Password doesn't match" });
    }

    res.json({
      success: true,
      message: `User with ${email} login successful!`,
      user,
    });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// Get user by ID

router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    res.json({
      message: "User retrieved successfully",
      user: user.toJSON(),
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        error: "Invalid user ID format",
      });
    }

    res.status(500).json({
      error: "Server Error",
      message: error.message,
    });
  }
});

//Get all users (for development/testing)

router.get("/", async (req, res) => {
  try {
    const users = await User.find({}).select("-password");

    res.json({
      message: "Users retrieved successfully",
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({
      error: "Server Error",
      message: error.message,
    });
  }
});

module.exports = router;
