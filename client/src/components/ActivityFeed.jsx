import { useEffect, useState } from "react";
import {
  Activity,
  CheckCircle2,
  ClipboardCheck,
  FileEdit,
  Plus,
  RefreshCcw,
  Sparkles,
  UserPlus,
} from "lucide-react";

import { authFetch } from "../utils/auth";

function getActivityIcon(type) {
  switch (type) {
    case "MEETING_CREATED":
      return <Plus size={16} />;

    case "MEETING_UPDATED":
      return <FileEdit size={16} />;

    case "MEETING_ANALYZED":
      return <Sparkles size={16} />;

    case "ACTION_ASSIGNED":
      return <UserPlus size={16} />;

    case "ACTION_COMPLETED":
      return <CheckCircle2 size={16} />;

    case "ACTION_REOPENED":
      return <RefreshCcw size={16} />;

    default:
      return <Activity size={16} />;
  }
}

function getActivityLabel(type) {
  switch (type) {
    case "MEETING_CREATED":
      return "Meeting created";

    case "MEETING_UPDATED":
      return "Meeting updated";

    case "MEETING_ANALYZED":
      return "AI analysis";

    case "ACTION_ASSIGNED":
      return "Action assigned";

    case "ACTION_COMPLETED":
      return "Action completed";

    case "ACTION_REOPENED":
      return "Action reopened";

    default:
      return "Activity";
  }
}

function formatTime(date) {
  const activityDate = new Date(date);

  if (Number.isNaN(activityDate.getTime())) {
    return "";
  }

  return activityDate.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function ActivityFeed({ meetingId }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!meetingId) {
      return;
    }

    let cancelled = false;

    async function loadActivity() {
      try {
        setLoading(true);
        setError("");

        const response = await authFetch(
          `/api/meetings/${meetingId}/activity`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to load activity"
          );
        }

        if (!cancelled) {
          setActivities(
            data.activities || []
          );
        }
      } catch (error) {
        if (!cancelled) {
          setError(
            error.message ||
              "Failed to load activity"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadActivity();

    return () => {
      cancelled = true;
    };
  }, [meetingId]);

  return (
    <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
          <Activity
            size={20}
            className="text-slate-700"
          />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Activity
          </h2>

          <p className="text-sm text-slate-500">
            Recent activity on this meeting
          </p>
        </div>
      </div>

      {loading && (
        <div className="py-8 text-center text-sm text-slate-500">
          Loading activity...
        </div>
      )}

      {!loading && error && (
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {!loading &&
        !error &&
        activities.length === 0 && (
          <div className="rounded-xl bg-slate-50 p-6 text-center">
            <ClipboardCheck
              size={28}
              className="mx-auto mb-2 text-slate-400"
            />

            <p className="text-sm text-slate-500">
              No activity yet.
            </p>
          </div>
        )}

      {!loading &&
        !error &&
        activities.length > 0 && (
          <div className="space-y-5">
            {activities.map((item) => (
              <div
                key={item._id}
                className="flex gap-4"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                  {getActivityIcon(
                    item.type
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-slate-900">
                      {item.actor?.name ||
                        "Someone"}
                    </p>

                    <span className="text-xs text-slate-400">
                      {getActivityLabel(
                        item.type
                      )}
                    </span>
                  </div>

                  <p className="mt-1 text-sm text-slate-600">
                    {item.description}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {formatTime(
                      item.createdAt
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
    </section>
  );
}

export default ActivityFeed;