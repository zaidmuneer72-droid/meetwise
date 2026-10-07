const express = require("express");
const mongoose = require("mongoose");

const Comment = require("../model/commentmodel");
const Meeting = require("../model/meetingmodel");
const Team = require("../model/teammodel");
const requireAuth = require("../middleware/auth");

const router = express.Router();

router.use("/meetings", requireAuth);

function notFound(res) {
  return res.status(404).json({
    message: "Meeting not found",
  });
}

async function getAuthorizedMeeting(meetingId, userId) {
  if (!mongoose.isValidObjectId(meetingId)) {
    return null;
  }

  const meeting = await Meeting.findById(meetingId);

  if (!meeting) {
    return null;
  }

  const team = await Team.findOne({
    _id: meeting.team,
    "members.user": userId,
  });

  if (!team) {
    return null;
  }

  return meeting;
}

router.get("/meetings/:meetingId/comments", async (req, res) => {
  try {
    const meeting = await getAuthorizedMeeting(
      req.params.meetingId,
      req.user.userId
    );

    if (!meeting) {
      return notFound(res);
    }

    const comments = await Comment.find({
      meeting: meeting._id,
    })
      .populate("author", "name email")
      .sort({ createdAt: 1 });

    res.status(200).json({
      comments,
    });
  } catch (error) {
    console.error("Get comments error:", error);

    res.status(500).json({
      message: "Failed to load comments",
    });
  }
});

router.post("/meetings/:meetingId/comments", async (req, res) => {
  try {
    const meeting = await getAuthorizedMeeting(
      req.params.meetingId,
      req.user.userId
    );

    if (!meeting) {
      return notFound(res);
    }

    const { text } = req.body;

    if (typeof text !== "string" || !text.trim()) {
      return res.status(400).json({
        message: "Comment text is required",
      });
    }

    if (text.trim().length > 2000) {
      return res.status(400).json({
        message: "Comment cannot exceed 2000 characters",
      });
    }

    const comment = await Comment.create({
      meeting: meeting._id,
      author: req.user.userId,
      text: text.trim(),
    });

    const populatedComment = await Comment.findById(comment._id).populate(
      "author",
      "name email"
    );

    res.status(201).json({
      message: "Comment added successfully",
      comment: populatedComment,
    });
  } catch (error) {
    console.error("Create comment error:", error);

    res.status(500).json({
      message: "Failed to add comment",
    });
  }
});

module.exports = router;