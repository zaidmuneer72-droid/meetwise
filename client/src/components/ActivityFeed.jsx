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
  AlertCircle,
} from "lucide-react";

import { authFetch } from "../utils/auth";

const VISIBLE_COUNT = 5;

function getActivityIcon(type) {
  const props = { size: 15, "aria-hidden": true };

  switch (type) {
    case "MEETING_CREATED":
      return <Plus {...props} />;
    case "MEETING_UPDATED":
      return <FileEdit {...props} />;
    case "MEETING_ANALYZED":
      return <Sparkles {...props} />;
    case "ACTION_ASSIGNED":
      return <UserPlus {...props} />;
    case "ACTION_COMPLETED":
      return <CheckCircle2 {...props} />;
    case "ACTION_REOPENED":
      return <RefreshCcw {...props} />;
    default:
      return <Activity {...props} />;
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
  const [showAll, setShowAll] = useState(false);

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
          throw new Error(data.message || "Failed to load activity");
        }

        if (!cancelled) {
          setActivities(data.activities || []);
        }
      } catch (error) {
        if (!cancelled) {
          setError(error.message || "Failed to load activity");
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

  const visibleActivities = showAll
    ? activities
    : activities.slice(0, VISIBLE_COUNT);

  return (
    <section className="rounded-panel border border-cloud-200 bg-white shadow-panel">
      <header className="flex flex-wrap items-center gap-3 border-b border-cloud-100 px-5 py-4 sm:px-6">
        <Activity size={20} className="text-ink-500" aria-hidden="true" />
        <h2 className="text-base font-extrabold text-ink-950">Activity</h2>

        {activities.length > 0 && (
          <span className="rounded-full bg-cloud-100 px-2.5 py-0.5 text-xs font-bold text-ink-700">
            {activities.length}
          </span>
        )}
      </header>

      <div className="px-5 py-5 sm:px-6">
        {loading && (
          <div className="space-y-4">
            <div className="h-10 animate-pulse rounded-lg bg-cloud-100" />
            <div className="h-10 animate-pulse rounded-lg bg-cloud-100" />
            <div className="h-10 animate-pulse rounded-lg bg-cloud-100" />
          </div>
        )}

        {!loading && error && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-lg bg-danger-50 px-4 py-3 text-sm font-semibold text-danger-600"
          >
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        {!loading && !error && activities.length === 0 && (
          <div className="rounded-lg border border-dashed border-cloud-200 px-6 py-8 text-center">
            <ClipboardCheck
              size={26}
              className="mx-auto text-cloud-300"
              aria-hidden="true"
            />
            <p className="mt-3 text-sm font-semibold text-ink-700">
              No activity yet
            </p>
          </div>
        )}

        {!loading && !error && activities.length > 0 && (
          <>
            <ul>
              {visibleActivities.map((item, index) => {
                const isLast = index === visibleActivities.length - 1;

                return (
                  <li key={item._id} className="relative flex gap-4 pb-6">
                    {!isLast && (
                      <span
                        className="absolute left-4 top-9 -ml-px h-[calc(100%-2rem)] w-px bg-cloud-200"
                        aria-hidden="true"
                      />
                    )}

                    <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-cloud-200 bg-white text-ink-500">
                      {getActivityIcon(item.type)}
                    </span>

                    <div className="min-w-0 flex-1 pt-0.5">
                      <p className="text-sm leading-6 text-ink-900">
                        <span className="font-bold">
                          {item.actor?.name || "Someone"}
                        </span>{" "}
                        <span className="text-ink-500">
                          · {getActivityLabel(item.type)}
                        </span>
                      </p>

                      <p className="mt-0.5 break-words text-sm leading-6 text-ink-700">
                        {item.description}
                      </p>

                      <p className="mt-1 text-xs text-ink-500">
                        {formatTime(item.createdAt)}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>

            {activities.length > VISIBLE_COUNT && (
              <button
                type="button"
                onClick={() => setShowAll((value) => !value)}
                className="rounded text-sm font-bold text-brand-700 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-600"
              >
                {showAll
                  ? "Show less"
                  : `Show all ${activities.length} activities`}
              </button>
            )}
          </>
        )}
      </div>
    </section>
  );
}

export default ActivityFeed;