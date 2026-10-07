const express = require("express");
const mongoose = require("mongoose");

const Activity = require("../model/activitymodel");
const Meeting = require("../model/meetingmodel");
const Team = require("../model/teammodel");
const requireAuth = require("../middleware/auth");

const router = express.Router();

router.use("/meetings", requireAuth);

function getUserId(req) {
  return req.user.userId;
}


router.get("/meetings/:meetingId/activity", async (req, res) => {
  try {
    const { meetingId } = req.params;
    const userId = getUserId(req);

    if (!mongoose.isValidObjectId(meetingId)) {
      return res.status(400).json({
        message: "Invalid meeting ID",
      });
    }


    const meeting = await Meeting.findById(meetingId);

    if (!meeting) {
      return res.status(404).json({
        message: "Meeting not found",
      });
    }

    // Team membership is required before returning meeting activity.

    const isMember = await Team.exists({
      _id: meeting.team,
      "members.user": userId,
    });

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this meeting's team",
      });
    }


    const activities = await Activity.find({
      meeting: meetingId,
    })
      .populate("actor", "name email")
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      activities,
    });
  } catch (error) {
    console.error("Get activity error:", error);

    res.status(500).json({
      message: "Failed to load activity",
    });
  }
});

module.exports = router;