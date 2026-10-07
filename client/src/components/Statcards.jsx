import { Calendar, CheckSquare, Clock } from "lucide-react";

const StatCards = ({
  meetings = 0,
  actionItems = 0,
  pending = 0,
  loading = false,
}) => {
  const show = (value) => (loading ? "–" : value);

  const stats = [
    {
      title: "Meetings",
      value: show(meetings),
      icon: Calendar,
      color: "indigo",
    },
    {
      title: "Action Items",
      value: show(actionItems),
      icon: CheckSquare,
      color: "emerald",
    },
    {
      title: "Pending",
      value: show(pending),
      icon: Clock,
      color: "amber",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {stats.map((stat) => {
        const Icon = stat.icon;
        const colorMap = {
          indigo: "bg-indigo-50 text-indigo-600",
          emerald: "bg-emerald-50 text-emerald-600",
          amber: "bg-amber-50 text-amber-600",
        };

        return (
          <div
            key={stat.title}
            className="group rounded-panel border border-cloud-200/80 bg-white p-5 shadow-panel transition duration-200 hover:-translate-y-0.5 hover:shadow-lg sm:p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-ink-500">
                  {stat.title}
                </p>
                <p className="mt-2 text-3xl font-extrabold tracking-tight text-ink-950">
                  {stat.value}
                </p>
              </div>
              <div className={`rounded-xl p-3 transition duration-200 group-hover:scale-105 ${colorMap[stat.color]}`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatCards;