const express = require("express");
const mongoose = require("mongoose");

const Notification = require("../model/notificationmodel");
const protect = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.get("/", async (req, res) => {
  try {
    const userId = req.user.userId;

    const notifications = await Notification.find({
      recipient: userId,
    })
      .populate("actor", "name email")
      .populate("meeting", "title")
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json(notifications);
  } catch (error) {
    console.error(
      "Get notifications error:",
      error
    );

    res.status(500).json({
      message: "Failed to load notifications",
    });
  }
});

router.get("/unread-count", async (req, res) => {
  try {
    const userId = req.user.userId;

    const count = await Notification.countDocuments({
      recipient: userId,
      read: false,
    });

    res.status(200).json({
      count,
    });
  } catch (error) {
    console.error(
      "Get unread notification count error:",
      error
    );

    res.status(500).json({
      message: "Failed to load unread count",
    });
  }
});

router.patch("/:id/read", async (req, res) => {
  try {
    const userId = req.user.userId;
    const notificationId = req.params.id;

    if (!mongoose.isValidObjectId(notificationId)) {
      return res.status(400).json({
        message: "Invalid notification ID",
      });
    }

    const notification =
      await Notification.findOneAndUpdate(
        {
          _id: notificationId,
          recipient: userId,
        },
        {
          read: true,
        },
        {
          new: true,
        }
      );

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    res.status(200).json({
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    console.error(
      "Mark notification read error:",
      error
    );

    res.status(500).json({
      message: "Failed to mark notification as read",
    });
  }
});

router.patch("/read-all", async (req, res) => {
  try {
    const userId = req.user.userId;

    await Notification.updateMany(
      {
        recipient: userId,
        read: false,
      },
      {
        $set: {
          read: true,
        },
      }
    );

    res.status(200).json({
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error(
      "Mark all notifications read error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to mark all notifications as read",
    });
  }
});

module.exports = router;