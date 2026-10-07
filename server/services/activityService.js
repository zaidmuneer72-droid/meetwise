const Activity = require("../model/activitymodel");

async function createActivity({
  teamId,
  meetingId,
  actorId,
  type,
  description,
}) {
  try {
    return await Activity.create({
      team: teamId,
      meeting: meetingId,
      actor: actorId,
      type,
      description,
    });
  } catch (error) {
    console.error("Activity creation error:", error);

    return null;
  }
}

module.exports = {
  createActivity,
};