const express = require("express");

const Meeting = require("../model/meetingmodel");
const Team = require("../model/teammodel");
const requireAuth = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth);

router.get("/stats", async (req, res) => {
  try {
    const userId = req.user.userId;

    const teams = await Team.find({
      "members.user": userId,
    }).select("_id");

    const teamIds = teams.map(
      (team) => team._id
    );

    const meetings = await Meeting.find({
      team: {
        $in: teamIds,
      },
    })
      .populate("team", "name")
      .sort({
        date: -1,
      });

    let totalActions = 0;
    let completedActions = 0;
    let pendingActions = 0;

    for (const meeting of meetings) {
      const actionItems =
        meeting.actionItems || [];

      totalActions += actionItems.length;

      for (const action of actionItems) {
        if (action.completed) {
          completedActions++;
        } else {
          pendingActions++;
        }
      }
    }

    const recentMeetings =
      meetings.slice(0, 5).map((meeting) => ({
        _id: meeting._id,
        title: meeting.title,
        date: meeting.date,
        team: meeting.team,
        actionCount:
          meeting.actionItems?.length || 0,
        completedCount:
          meeting.actionItems?.filter(
            (item) => item.completed
          ).length || 0,
      }));

    res.status(200).json({
      statistics: {
        totalMeetings: meetings.length,
        totalActions,
        pendingActions,
        completedActions,
      },

      recentMeetings,
    });
  } catch (error) {
    console.error(
      "Dashboard stats error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to load dashboard statistics",
    });
  }
});

module.exports = router;