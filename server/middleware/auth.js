const jwt = require("jsonwebtoken");
const User = require("../model/usermodel");

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        message: "Not authorized, token missing",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        message: "Not authorized, user not found",
      });
    }

    // Invalidate tokens created before password change
    if (
      user.passwordChangedAt &&
      decoded.iat
    ) {
      const passwordChangedAt =
        Math.floor(
          user.passwordChangedAt.getTime() / 1000
        );

      if (decoded.iat < passwordChangedAt) {
        return res.status(401).json({
          message:
            "Password changed. Please login again.",
        });
      }
    }

    req.user = decoded;

    next();
  } catch (error) {
    console.error(
      "Authentication middleware error:",
      error
    );

    return res.status(401).json({
      message: "Not authorized, invalid token",
    });
  }
};

module.exports = protect;