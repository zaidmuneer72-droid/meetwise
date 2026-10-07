const STORAGE_KEY = "meetingflow_meetings";

export function getMeetings() {
  const storedMeetings = localStorage.getItem(STORAGE_KEY);

  if (!storedMeetings) {
    return [];
  }

  return JSON.parse(storedMeetings);
}

export function saveMeeting(meeting) {
  const meetings = getMeetings();

  meetings.push(meeting);

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(meetings)
  );
}