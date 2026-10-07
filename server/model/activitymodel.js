const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
      index: true,
    },

    meeting: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Meeting",
      required: true,
      index: true,
    },

    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: [
        "MEETING_CREATED",
        "MEETING_UPDATED",
        "MEETING_ANALYZED",
        "ACTION_ASSIGNED",
        "ACTION_COMPLETED",
        "ACTION_REOPENED",
      ],
      required: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

activitySchema.index({
  meeting: 1,
  createdAt: -1,
});

const Activity = mongoose.model("Activity", activitySchema);

module.exports = Activity;