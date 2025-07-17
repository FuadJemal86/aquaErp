const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../prisma/prisma");

// Centralized cookie configuration
const setCookieConfig = (token) => {
  const isProduction = process.env.NODE_ENV === "production";
  const cookieConfig = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  };

  return { token, cookieConfig };
};

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token =
    req.cookies.token || req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    );
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token." });
  }
};

const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Validate required fields
    if (!email || !password || !role) {
      return res.status(400).json({
        message: "Email, password, and role are required",
      });
    }

    // Validate role
    if (!["ADMIN", "CASHIER"].includes(role)) {
      return res.status(400).json({
        message: "Invalid role. Must be ADMIN or CASHIER",
      });
    }

    // Find user by email and role
    const user = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
        role: role,
        isActive: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials or role",
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" }
    );

    // Set cookie using centralized config
    const { cookieConfig } = setCookieConfig(token);
    res.cookie("token", token, cookieConfig);

    // Return success without sensitive data
    const userResponse = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    res.status(200).json({
      message: "Login successful",
      user: userResponse,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

// Get current user data
const getMe = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        image: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Get me error:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

// Logout endpoint
const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    res.status(200).json({
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

// Update user profile
const updateUser = async (req, res) => {
  try {
    // Get token from cookies
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        status: false,
        message: "Access denied. No token provided.",
      });
    }

    // Decode the token to get user ID
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
    } catch (error) {
      return res.status(401).json({
        status: false,
        message: "Invalid token.",
      });
    }

    const userId = decoded.userId;
    const { name, phone, currentPassword, newPassword } = req.body;

    // Find the user
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
        isActive: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    // Prepare update data
    const updateData = {};

    // Update name if provided
    if (name && name.trim() !== "") {
      updateData.name = name.trim();
    }

    // Update phone if provided
    if (phone !== undefined) {
      updateData.phone = phone;
    }

    // Handle password change if provided
    if (currentPassword && newPassword) {
      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password
      );

      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          status: false,
          message: "Current password is incorrect",
        });
      }

      // Validate new password
      if (newPassword.length < 6) {
        return res.status(400).json({
          status: false,
          message: "New password must be at least 6 characters long",
        });
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      updateData.password = hashedNewPassword;
    }

    // Update the user
    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        image: true,
        createdAt: true,
      },
    });

    res.status(200).json({
      status: true,
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};

module.exports = { login, getMe, logout, updateUser, verifyToken };
