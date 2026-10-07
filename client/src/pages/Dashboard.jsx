
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import StatCards from "../components/Statcards";
import { authFetch, getDisplayName } from "../utils/auth";

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function formatDate(value) {
  if (!value) {
    return "Date unavailable";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const Dashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalMeetings: 0,
    totalActions: 0,
    pendingActions: 0,
    completedActions: 0,
  });

  const [recentMeetings, setRecentMeetings] =
    useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await authFetch(
          "/api/dashboard/stats"
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to load dashboard"
          );
        }

        if (cancelled) {
          return;
        }

        setStats({
          totalMeetings:
            data.statistics?.totalMeetings || 0,

          totalActions:
            data.statistics?.totalActions || 0,

          pendingActions:
            data.statistics?.pendingActions || 0,

          completedActions:
            data.statistics?.completedActions || 0,
        });

        setRecentMeetings(
          Array.isArray(data.recentMeetings)
            ? data.recentMeetings
            : []
        );
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error(
          "Dashboard error:",
          err
        );

        setError(
          err.message ||
            "Could not load your dashboard. Please try again."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  const firstName =
    getDisplayName().split(" ")[0];

  const today =
    new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="space-y-4 sm:flex sm:items-start sm:justify-between sm:gap-6 sm:space-y-0">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-brand-600">
            {today}
          </p>

          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-ink-950 sm:text-4xl">
            {getGreeting()}
            {firstName ? `, ${firstName}` : ""} 👋
          </h1>

          <p className="mt-2 text-base text-ink-500 sm:text-lg">
            Here's what's happening with your meetings.
          </p>
        </div>

        <button
          onClick={() =>
            navigate("/meetings/new")
          }
          type="button"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-3 text-sm font-extrabold text-white shadow-sm transition duration-200 hover:bg-brand-700 hover:shadow-md active:bg-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
        >
          <Plus className="h-5 w-5" />
          New Meeting
        </button>
      </div>

      <StatCards
        meetings={stats.totalMeetings}
        actionItems={stats.totalActions}
        pending={stats.pendingActions}
        loading={loading}
      />

      {!loading && !error && (
        <div className="flex items-center justify-between rounded-panel border border-cloud-200/80 bg-white px-5 py-4 shadow-panel">
          <div>
            <p className="text-sm font-extrabold text-ink-950">
              Completed Actions
            </p>

            <p className="mt-1 text-xs text-ink-500">
              Actions completed by your teams
            </p>
          </div>

          <div className="rounded-full bg-success-50 px-3 py-1.5 text-sm font-extrabold text-success-700">
            {stats.completedActions}
          </div>
        </div>
      )}

      <section>
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-ink-950">
              Recent Meetings
            </h2>

            <p className="mt-1 text-sm text-ink-500">
              Your latest meeting activity
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate("/meetings")
            }
            className="text-sm font-bold text-brand-600 transition duration-200 hover:text-brand-700"
          >
            View all
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {loading ? (
            <div className="rounded-panel border border-cloud-200/80 bg-white p-8 text-center sm:col-span-3">
              <p className="text-sm text-ink-500">
                Loading your dashboard...
              </p>
            </div>
          ) : error ? (
            <div className="rounded-panel border border-danger-600/20 bg-danger-50 p-8 text-center sm:col-span-3">
              <p className="text-sm font-semibold text-danger-600">
                {error}
              </p>
            </div>
          ) : recentMeetings.length === 0 ? (
            <div className="rounded-panel border border-dashed border-cloud-200 bg-white p-8 text-center sm:col-span-3">
              <p className="text-sm text-ink-500">
                No meetings yet. Create one to get started.
              </p>

              <button
                type="button"
                onClick={() =>
                  navigate("/meetings/new")
                }
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-extrabold text-white transition hover:bg-brand-700"
              >
                <Plus className="h-4 w-4" />
                Create Meeting
              </button>
            </div>
          ) : (
            recentMeetings.map((meeting) => (
              <Link
                key={meeting._id}
                to={`/meetings/${meeting._id}`}
                className="group flex min-h-36 flex-col justify-between gap-5 rounded-panel border border-cloud-200/80 bg-white p-5 shadow-panel transition duration-200 hover:-translate-y-0.5 hover:border-brand-100 hover:shadow-lg"
              >
                <div className="min-w-0">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-xs font-extrabold text-brand-600">
                    {meeting.title
                      ? meeting.title
                          .slice(0, 1)
                          .toUpperCase()
                      : "M"}
                  </div>

                  <p className="mt-5 truncate font-extrabold text-ink-950 transition duration-200 group-hover:text-brand-700">
                    {meeting.title ||
                      "Untitled meeting"}
                  </p>

                  <p className="mt-1 text-xs font-bold text-ink-500">
                    {formatDate(meeting.date)}
                  </p>

                  {meeting.team?.name && (
                    <p className="mt-1 truncate text-xs text-ink-400">
                      {meeting.team.name}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-cloud-100 pt-3">
                  <p className="text-xs font-bold text-ink-500">
                    Action items
                  </p>

                  <div className="flex items-center gap-2">
                    <p className="rounded-full bg-cloud-100 px-2.5 py-1 text-xs font-extrabold text-ink-700">
                      {meeting.actionCount || 0}
                    </p>

                    {meeting.completedCount >
                      0 && (
                      <p className="rounded-full bg-success-50 px-2.5 py-1 text-xs font-extrabold text-success-700">
                        {meeting.completedCount} done
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
