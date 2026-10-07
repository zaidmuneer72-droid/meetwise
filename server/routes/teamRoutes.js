const express = require("express");
const mongoose = require("mongoose");

const Team = require("../model/teammodel");
const Invitation = require("../model/invitationmodel");
const User = require("../model/usermodel");
const protect = require("../middleware/auth");

const router = express.Router();

function isValidId(id) {
  return mongoose.isValidObjectId(id);
}

function getCurrentMember(team, userId) {
  return team.members.find(
    (member) => member.user.toString() === userId.toString()
  );
}

router.post("/", protect, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Team name is required",
      });
    }

    const team = await Team.create({
      name: name.trim(),
      createdBy: req.user.userId,
      members: [
        {
          user: req.user.userId,
          role: "owner",
        },
      ],
    });

    res.status(201).json({
      message: "Team created successfully",
      team: {
        id: team._id,
        name: team.name,
        createdBy: team.createdBy,
        members: team.members,
      },
    });
  } catch (error) {
    console.error("Create team error:", error);
    res.status(500).json({
      message: "Failed to create team",
    });
  }
});

router.get("/", protect, async (req, res) => {
  try {
    const teams = await Team.find({
      "members.user": req.user.userId,
    })
      .populate("members.user", "name email")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      teams,
    });
  } catch (error) {
    console.error("Get teams error:", error);
    res.status(500).json({
      message: "Failed to get teams",
    });
  }
});

router.get("/:teamId", protect, async (req, res) => {
  try {
    const { teamId } = req.params;

    if (!isValidId(teamId)) {
      return res.status(400).json({
        message: "Invalid team ID",
      });
    }

    const team = await Team.findOne({
      _id: teamId,
      "members.user": req.user.userId,
    })
      .populate("members.user", "name email")
      .populate("createdBy", "name email");

    if (!team) {
      return res.status(404).json({
        message: "Team not found",
      });
    }

    res.status(200).json({
      team,
    });
  } catch (error) {
    console.error("Get team error:", error);
    res.status(500).json({
      message: "Failed to get team",
    });
  }
});

router.post("/:teamId/invite", protect, async (req, res) => {
  try {
    const { teamId } = req.params;
    const { email, role = "member" } = req.body;

    if (!isValidId(teamId)) {
      return res.status(400).json({
        message: "Invalid team ID",
      });
    }

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    if (!["admin", "member"].includes(role)) {
      return res.status(400).json({
        message: "Invalid role",
      });
    }

    const team = await Team.findById(teamId);

    if (!team) {
      return res.status(404).json({
        message: "Team not found",
      });
    }

    const currentMember = getCurrentMember(
      team,
      req.user.userId
    );

    if (!currentMember) {
      return res.status(403).json({
        message: "You are not a member of this team",
      });
    }

    if (
      currentMember.role !== "owner" &&
      currentMember.role !== "admin"
    ) {
      return res.status(403).json({
        message: "Only owners and admins can invite members",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!user) {
      return res.status(404).json({
        message:
          "No user found with this email. They must create an account first.",
      });
    }

    const alreadyMember = team.members.some(
      (member) =>
        member.user.toString() === user._id.toString()
    );

    if (alreadyMember) {
      return res.status(409).json({
        message: "User is already a member of this team",
      });
    }

    const existingInvitation = await Invitation.findOne({
      team: teamId,
      invitedUser: user._id,
      status: "pending",
    });

    if (existingInvitation) {
      return res.status(409).json({
        message: "An invitation is already pending",
      });
    }

    const invitation = await Invitation.create({
      team: teamId,
      invitedBy: req.user.userId,
      invitedUser: user._id,
      email: user.email,
      role,
      status: "pending",
      expiresAt: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      ),
    });

    res.status(201).json({
      message: "Invitation created successfully",
      invitation: {
        id: invitation._id,
        team: invitation.team,
        email: invitation.email,
        role: invitation.role,
        status: invitation.status,
        expiresAt: invitation.expiresAt,
      },
    });
  } catch (error) {
    console.error("Invite member error:", error);
    res.status(500).json({
      message: "Failed to invite member",
    });
  }
});

router.get("/invitations/me", protect, async (req, res) => {
  try {
    const invitations = await Invitation.find({
      invitedUser: req.user.userId,
      status: "pending",
      expiresAt: { $gt: new Date() },
    })
      .populate("team", "name")
      .populate("invitedBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      invitations,
    });
  } catch (error) {
    console.error("Get invitations error:", error);
    res.status(500).json({
      message: "Failed to get invitations",
    });
  }
});

router.post(
  "/invitations/:invitationId/accept",
  protect,
  async (req, res) => {
    try {
      const { invitationId } = req.params;

      if (!isValidId(invitationId)) {
        return res.status(400).json({
          message: "Invalid invitation ID",
        });
      }

      const invitation = await Invitation.findOne({
        _id: invitationId,
        invitedUser: req.user.userId,
        status: "pending",
      });

      if (!invitation) {
        return res.status(404).json({
          message: "Invitation not found",
        });
      }

      if (invitation.expiresAt < new Date()) {
        invitation.status = "rejected";
        await invitation.save();

        return res.status(400).json({
          message: "This invitation has expired",
        });
      }

      const team = await Team.findById(invitation.team);

      if (!team) {
        return res.status(404).json({
          message: "Team no longer exists",
        });
      }

      const alreadyMember = team.members.some(
        (member) =>
          member.user.toString() === req.user.userId.toString()
      );

      if (!alreadyMember) {
        team.members.push({
          user: req.user.userId,
          role: invitation.role,
        });

        await team.save();
      }

      invitation.status = "accepted";
      await invitation.save();

      res.status(200).json({
        message: "Invitation accepted successfully",
      });
    } catch (error) {
      console.error("Accept invitation error:", error);
      res.status(500).json({
        message: "Failed to accept invitation",
      });
    }
  }
);

router.post(
  "/invitations/:invitationId/reject",
  protect,
  async (req, res) => {
    try {
      const { invitationId } = req.params;

      if (!isValidId(invitationId)) {
        return res.status(400).json({
          message: "Invalid invitation ID",
        });
      }

      const invitation = await Invitation.findOne({
        _id: invitationId,
        invitedUser: req.user.userId,
        status: "pending",
      });

      if (!invitation) {
        return res.status(404).json({
          message: "Invitation not found",
        });
      }

      invitation.status = "rejected";
      await invitation.save();

      res.status(200).json({
        message: "Invitation rejected",
      });
    } catch (error) {
      console.error("Reject invitation error:", error);
      res.status(500).json({
        message: "Failed to reject invitation",
      });
    }
  }
);

module.exports = router;
