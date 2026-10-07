const express = require("express");
const mongoose = require("mongoose");

const {
  parseAnalysis,
  AnalysisError,
} = require("../services/parseAnalysis");

const {
  analyzeTranscript,
} = require("../services/geminiService");

const {
  createActivity,
} = require("../services/activityService");

const {
  createNotification,
} = require("../services/notificationService");

const Meeting = require("../model/meetingmodel");
const Team = require("../model/teammodel");
const requireAuth = require("../middleware/auth");

const router = express.Router();


router.use("/meetings", requireAuth);

// Dedicated action-item endpoints preserve activity and notification handling.

const EDITABLE_FIELDS = [
  "title",
  "date",
  "description",
  "transcript",
];

function pickEditable(body) {
  const picked = {};

  for (const field of EDITABLE_FIELDS) {
    if (body[field] !== undefined) {
      picked[field] = body[field];
    }
  }

  return picked;
}


function notFound(res) {
  return res.status(404).json({
    message: "Meeting not found",
  });
}

function forbidden(res) {
  return res.status(403).json({
    message:
      "You are not a member of this meeting's team",
  });
}

function getUserId(req) {
  return req.user.userId;
}


async function getUserTeam(teamId, userId) {
  if (!mongoose.isValidObjectId(teamId)) {
    return null;
  }

  return Team.findOne({
    _id: teamId,
    "members.user": userId,
  });
}


async function getAuthorizedMeeting(meetingId, userId) {
  if (!mongoose.isValidObjectId(meetingId)) {
    return null;
  }

  const meeting = await Meeting.findById(meetingId)
    .populate("createdBy", "name email")
    .populate(
      "actionItems.assignedTo",
      "name email"
    )
    .populate({
      path: "team",
      select: "name members",
      populate: {
        path: "members.user",
        select: "name email",
      },
    });

  if (!meeting) {
    return null;
  }

  if (!meeting.team) {
    return null;
  }

  const isMember = await Team.exists({
    _id: meeting.team._id,
    "members.user": userId,
  });

  if (!isMember) {
    return null;
  }

  return meeting;
}


router.post("/meetings", async (req, res) => {
  try {
    const userId = getUserId(req);

    const {
      teamId,
      title,
      date,
      description,
      transcript,
    } = req.body;


    if (!teamId) {
      return res.status(400).json({
        message: "teamId is required",
      });
    }

    if (!mongoose.isValidObjectId(teamId)) {
      return res.status(400).json({
        message: "Invalid team ID",
      });
    }


    const team = await getUserTeam(
      teamId,
      userId
    );

    if (!team) {
      return forbidden(res);
    }


    if (!title || !title.trim()) {
      return res.status(400).json({
        message: "Meeting title is required",
      });
    }

    if (!date) {
      return res.status(400).json({
        message: "Meeting date is required",
      });
    }


    const newMeeting = new Meeting({
      createdBy: userId,
      team: teamId,

      title: title.trim(),
      date,
      description: description || "",
      transcript: transcript || "",

      summary: "",
      decisions: [],
      actionItems: [],
    });

    const savedMeeting = await newMeeting.save();


    await createActivity({
      teamId,
      meetingId: savedMeeting._id,
      actorId: userId,
      type: "MEETING_CREATED",
      description: `Created meeting "${savedMeeting.title}"`,
    });

    res.status(201).json(savedMeeting);
  } catch (error) {
    console.error(
      "Create meeting error:",
      error
    );

    res.status(500).json({
      message: "Failed to create meeting",
    });
  }
});


router.get("/meetings", async (req, res) => {
  try {
    const userId = getUserId(req);


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
      .populate("createdBy", "name email")
      .sort({
        createdAt: -1,
      });

    res.status(200).json(meetings);
  } catch (error) {
    console.error(
      "Get meetings error:",
      error
    );

    res.status(500).json({
      message: "Failed to load meetings",
    });
  }
});


router.get(
  "/meetings/:id",
  async (req, res) => {
    try {
      const userId = getUserId(req);

      if (
        !mongoose.isValidObjectId(
          req.params.id
        )
      ) {
        return notFound(res);
      }

      const meeting =
        await getAuthorizedMeeting(
          req.params.id,
          userId
        );

      if (!meeting) {
        return notFound(res);
      }

      res.status(200).json(meeting);
    } catch (error) {
      console.error(
        "Get meeting error:",
        error
      );

      res.status(500).json({
        message: "Failed to load meeting",
      });
    }
  }
);


router.put(
  "/meetings/:id",
  async (req, res) => {
    try {
      const userId = getUserId(req);

      if (
        !mongoose.isValidObjectId(
          req.params.id
        )
      ) {
        return notFound(res);
      }

      const meeting =
        await getAuthorizedMeeting(
          req.params.id,
          userId
        );

      if (!meeting) {
        return notFound(res);
      }


      const team = await Team.findOne({
        _id: meeting.team._id,
        "members.user": userId,
      });

      if (!team) {
        return forbidden(res);
      }

      const member = team.members.find(
        (member) =>
          member.user.toString() ===
          userId.toString()
      );

      if (!member) {
        return forbidden(res);
      }


      const updates = pickEditable(req.body);

      const updatedMeeting =
        await Meeting.findByIdAndUpdate(
          req.params.id,
          updates,
          {
            new: true,
            runValidators: true,
          }
        );

      if (!updatedMeeting) {
        return notFound(res);
      }


      await createActivity({
        teamId: meeting.team._id,
        meetingId: meeting._id,
        actorId: userId,
        type: "MEETING_UPDATED",
        description: `Updated meeting "${meeting.title}"`,
      });

      res.status(200).json(
        updatedMeeting
      );
    } catch (error) {
      console.error(
        "Update meeting error:",
        error
      );

      res.status(500).json({
        message: "Failed to update meeting",
      });
    }
  }
);


router.post(
  "/meetings/:id/analyze",
  async (req, res) => {
    try {
      const userId = getUserId(req);

      if (
        !mongoose.isValidObjectId(
          req.params.id
        )
      ) {
        return notFound(res);
      }

      const { transcript } = req.body;

      if (
        typeof transcript !== "string" ||
        !transcript.trim()
      ) {
        return res.status(400).json({
          message: "Transcript is required",
        });
      }


      const meeting =
        await getAuthorizedMeeting(
          req.params.id,
          userId
        );

      if (!meeting) {
        return notFound(res);
      }


      const result =
        await analyzeTranscript(
          transcript
        );

      const analysis =
        parseAnalysis(result);

      // Preserve assignment and completion state when re-analysis replaces items.

      const existingActionItems =
        meeting.actionItems || [];

      const existingByTask =
        new Map();

      for (
        const existingItem of existingActionItems
      ) {
        const normalizedTask =
          String(existingItem.task || "")
            .trim()
            .toLowerCase();

        if (normalizedTask) {
          existingByTask.set(
            normalizedTask,
            existingItem
          );
        }
      }

      const mergedActionItems =
        analysis.actionItems.map(
          (newItem) => {
            const normalizedTask =
              String(newItem.task || "")
                .trim()
                .toLowerCase();

            const existing =
              existingByTask.get(
                normalizedTask
              );

            if (!existing) {
              return {
                task: newItem.task || "",
                owner: newItem.owner || "",
                deadline:
                  newItem.deadline || "",
                assignedTo: null,
                completed: false,
              };
            }

            return {
              _id: existing._id,

              task:
                newItem.task ||
                existing.task,

              owner:
                newItem.owner ||
                existing.owner ||
                "",

              deadline:
                newItem.deadline ||
                existing.deadline ||
                "",

              assignedTo:
                existing.assignedTo
                  ? existing.assignedTo._id ||
                    existing.assignedTo
                  : null,

              completed:
                existing.completed ||
                false,
            };
          }
        );


      const updatedMeeting =
        await Meeting.findByIdAndUpdate(
          req.params.id,
          {
            transcript,
            summary: analysis.summary,
            actionItems:
              mergedActionItems,
            decisions:
              analysis.decisions,
          },
          {
            new: true,
            runValidators: true,
          }
        );

      if (!updatedMeeting) {
        return notFound(res);
      }


      await createActivity({
        teamId: meeting.team._id,
        meetingId: meeting._id,
        actorId: userId,
        type: "MEETING_ANALYZED",
        description: `Analyzed meeting "${meeting.title}"`,
      });


      await updatedMeeting.populate(
        "createdBy",
        "name email"
      );

      await updatedMeeting.populate(
        "actionItems.assignedTo",
        "name email"
      );

      await updatedMeeting.populate({
        path: "team",
        select: "name members",
        populate: {
          path: "members.user",
          select: "name email",
        },
      });

      res.status(200).json(
        updatedMeeting
      );
    } catch (error) {
      console.error(
        "Gemini analysis error:",
        error
      );


      if (error instanceof AnalysisError) {
        return res.status(502).json({
          message:
            "The AI returned a reply we couldn't read. Please try again.",
        });
      }


      if (
        error.status === 429 ||
        error.status === 503
      ) {
        return res.status(503).json({
          message:
            "The AI service is busy right now. Wait a moment and try again.",
        });
      }

      res.status(500).json({
        message:
          "Failed to analyze transcript",
      });
    }
  }
);


router.patch(
  "/meetings/:meetingId/action-items/:actionItemId/assign",
  async (req, res) => {
    try {
      const {
        meetingId,
        actionItemId,
      } = req.params;

      const { userId } = req.body;


      if (
        !mongoose.isValidObjectId(
          meetingId
        ) ||
        !mongoose.isValidObjectId(
          actionItemId
        ) ||
        !mongoose.isValidObjectId(userId)
      ) {
        return res.status(400).json({
          message: "Invalid ID",
        });
      }


      const meeting =
        await Meeting.findById(
          meetingId
        );

      if (!meeting) {
        return notFound(res);
      }


      const team = await Team.findOne({
        _id: meeting.team,
        "members.user":
          req.user.userId,
      });

      if (!team) {
        return forbidden(res);
      }


      const currentMember =
        team.members.find(
          (member) =>
            member.user.toString() ===
            req.user.userId.toString()
        );


      if (
        !currentMember ||
        !["owner", "admin"].includes(
          currentMember.role
        )
      ) {
        return res.status(403).json({
          message:
            "Only team owners and admins can assign tasks",
        });
      }


      const assignedMember =
        team.members.find(
          (member) =>
            member.user.toString() ===
            userId.toString()
        );

      if (!assignedMember) {
        return res.status(403).json({
          message:
            "Employee is not a member of this team",
        });
      }


      const actionItem =
        meeting.actionItems.id(
          actionItemId
        );

      if (!actionItem) {
        return res.status(404).json({
          message:
            "Action item not found",
        });
      }


      actionItem.assignedTo = userId;

      actionItem.completed = false;

      await meeting.save();


      await meeting.populate({
        path: "actionItems.assignedTo",
        select: "name email",
      });

      const populatedActionItem =
        meeting.actionItems.id(
          actionItemId
        );


      await createActivity({
        teamId: meeting.team,
        meetingId: meeting._id,
        actorId: req.user.userId,
        type: "ACTION_ASSIGNED",
        description: `Assigned "${actionItem.task}" to ${
          populatedActionItem?.assignedTo
            ?.name || "a team member"
        }`,
      });


      await createNotification({
        recipientId: userId,
        actorId: req.user.userId,
        teamId: meeting.team,
        meetingId: meeting._id,
        type: "ACTION_ASSIGNED",
        title:
          "New action item assigned",
        message: `You were assigned: "${actionItem.task}"`,
        link: `/meetings/${meeting._id}`,
      });

      res.status(200).json({
        message:
          "Action item assigned successfully",
        actionItem:
          populatedActionItem,
      });
    } catch (error) {
      console.error(
        "Assign action item error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to assign action item",
      });
    }
  }
);


router.patch(
  "/meetings/:meetingId/action-items/:actionItemId/:action",
  async (req, res) => {
    try {
      const {
        meetingId,
        actionItemId,
        action,
      } = req.params;

      const userId = req.user.userId;


      if (
        !mongoose.isValidObjectId(
          meetingId
        ) ||
        !mongoose.isValidObjectId(
          actionItemId
        )
      ) {
        return res.status(400).json({
          message: "Invalid ID",
        });
      }


      if (
        !["complete", "reopen"].includes(
          action
        )
      ) {
        return res.status(400).json({
          message:
            "Action must be complete or reopen",
        });
      }


      const meeting =
        await getAuthorizedMeeting(
          meetingId,
          userId
        );

      if (!meeting) {
        return notFound(res);
      }


      const actionItem =
        meeting.actionItems.id(
          actionItemId
        );

      if (!actionItem) {
        return res.status(404).json({
          message:
            "Action item not found",
        });
      }


      if (
        !actionItem.assignedTo
      ) {
        return res.status(403).json({
          message:
            "This action item is not assigned to anyone",
        });
      }

      const assignedUserId =
        actionItem.assignedTo._id
          ? actionItem.assignedTo._id.toString()
          : actionItem.assignedTo.toString();

      if (
        assignedUserId !==
        userId.toString()
      ) {
        return res.status(403).json({
          message:
            "Only the assigned employee can update this action item",
        });
      }


      const completed =
        action === "complete";

      actionItem.completed =
        completed;

      await meeting.save();


      await createActivity({
        teamId: meeting.team._id
          ? meeting.team._id
          : meeting.team,
        meetingId: meeting._id,
        actorId: userId,
        type: completed
          ? "ACTION_COMPLETED"
          : "ACTION_REOPENED",
        description: completed
          ? `Completed "${actionItem.task}"`
          : `Reopened "${actionItem.task}"`,
      });


      const teamMembers =
        meeting.team.members || [];

      const notificationType =
        completed
          ? "ACTION_COMPLETED"
          : "ACTION_REOPENED";

      const notificationTitle =
        completed
          ? "Action item completed"
          : "Action item reopened";

      const notificationMessage =
        completed
          ? `"${actionItem.task}" was marked as completed.`
          : `"${actionItem.task}" was reopened.`;

      await Promise.all(
        teamMembers.map((member) => {
          const memberId =
            member.user?._id
              ? member.user._id
              : member.user;

          return createNotification({
            recipientId: memberId,
            actorId: userId,
            teamId: meeting.team._id
              ? meeting.team._id
              : meeting.team,
            meetingId: meeting._id,
            type: notificationType,
            title: notificationTitle,
            message:
              notificationMessage,
            link: `/meetings/${meeting._id}`,
          });
        })
      );


      await meeting.populate({
        path: "actionItems.assignedTo",
        select: "name email",
      });

      const updatedActionItem =
        meeting.actionItems.id(
          actionItemId
        );

      res.status(200).json({
        message: completed
          ? "Action item completed"
          : "Action item reopened",

        actionItem:
          updatedActionItem,
      });
    } catch (error) {
      console.error(
        "Complete/reopen action item error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to update action item",
      });
    }
  }
);

module.exports = router;