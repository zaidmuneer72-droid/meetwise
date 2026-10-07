
const Recentmeetings = () => {
    const RecentMeetings = [
  { id: 1, title: "Website Redesign", date: "Aug 20" },
  { id: 2, title: "Product Planning", date: "Aug 19" },
  { id: 3, title: "Team Standup", date: "Aug 18" },
];
  return (
    <div className="mt-6 rounded-lg border border-gray-200 bg-white divide-y divide-gray-100">
      {RecentMeetings.map((meeting) => (
        <div key={meeting.id} className="flex items-center justify-between p-4">
          <h3 className="font-medium text-gray-900">{meeting.title}</h3>
          <p className="text-sm text-gray-500">{meeting.date}</p>
        </div>
      ))}
    </div>
  );
};

export default Recentmeetings;