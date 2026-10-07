const Notification = require("../model/notificationmodel");

async function createNotification({
  recipientId,
  actorId = null,
  teamId,
  meetingId = null,
  type,
  title,
  message,
  link = "",
}) {
  try {
    if (!recipientId || !teamId || !type || !title || !message) {
      console.error(
        "Notification creation skipped: missing required data"
      );

      return null;
    }

    // Don't notify a user about their own action.
    if (
      actorId &&
      recipientId.toString() === actorId.toString()
    ) {
      return null;
    }

    return await Notification.create({
      recipient: recipientId,
      actor: actorId,
      team: teamId,
      meeting: meetingId,
      type,
      title,
      message,
      link,
    });
  } catch (error) {

    console.error("Notification creation error:", error);

    return null;
  }
}

module.exports = {
  createNotification,
};