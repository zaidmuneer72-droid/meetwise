import { Link } from "react-router-dom";
import { Plus, Calendar, Search, ArrowUpRight } from "lucide-react";
import { useState, useEffect } from "react";
import { authFetch } from "../utils/auth";

function formatMeetingDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function Meetings() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await authFetch("/api/meetings");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load meetings");
      }

      setMeetings(Array.isArray(data) ? data : []);
    } catch (requestError) {
      setError(
        requestError.message || "Could not load meetings. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const loadInitialMeetings = async () => {
      try {
        const response = await authFetch("/api/meetings");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load meetings");
        }

        if (!cancelled) {
          setMeetings(Array.isArray(data) ? data : []);
          setError("");
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(
            requestError.message || "Could not load meetings. Please try again."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadInitialMeetings();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredMeetings = meetings.filter((meeting) => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return true;
    }

    return (
      meeting.title?.toLowerCase().includes(normalizedQuery) ||
      meeting.description?.toLowerCase().includes(normalizedQuery)
    );
  });

  return (
    <div className="mx-auto max-w-6xl space-y-8">

      <div className="space-y-4 sm:flex sm:items-start sm:justify-between sm:gap-6 sm:space-y-0">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-brand-600">Workspace library</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-ink-950 sm:text-4xl">
            Meetings
          </h1>

          <p className="mt-2 text-base text-ink-500 sm:text-lg">
            Manage and analyze your meetings in one place.
          </p>
        </div>

        <Link
          to="/meetings/new"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-3 text-sm font-extrabold text-white shadow-sm transition duration-200 hover:bg-brand-700 hover:shadow-md active:bg-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
        >
          <Plus className="h-5 w-5" />
          New Meeting
        </Link>
      </div>

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
        <input
          type="search"
          placeholder="Search meetings"
          aria-label="Search meetings"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="w-full rounded-lg border border-cloud-200 bg-white py-3 pl-10 pr-4 text-sm font-semibold text-ink-900 shadow-sm placeholder:text-ink-500 focus:border-brand-500 focus:ring-4 focus:ring-brand-50"
        />
      </div>

      {loading ? (
        <div className="grid gap-3">
          {[1, 2, 3].map((item) => <div key={item} className="h-32 animate-pulse rounded-panel border border-cloud-200 bg-white p-6"><div className="h-4 w-1/3 rounded bg-cloud-100" /><div className="mt-4 h-3 w-2/3 rounded bg-cloud-100" /><div className="mt-5 h-3 w-1/4 rounded bg-cloud-100" /></div>)}
        </div>
      ) : error ? (
        <div className="rounded-panel border border-danger-600/20 bg-danger-50 p-8 text-center shadow-panel">
          <p className="text-sm font-semibold text-danger-600">{error}</p>
          <button
            type="button"
            onClick={fetchMeetings}
            className="mt-4 inline-flex items-center justify-center rounded-lg bg-danger-600 px-4 py-2 text-sm font-bold text-white transition duration-200 hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger-600"
          >
            Retry
          </button>
        </div>
      ) : filteredMeetings.length === 0 && query.trim() ? (
        <div className="rounded-panel border border-dashed border-cloud-200 bg-white p-12 text-center shadow-panel">
          <h3 className="text-lg font-extrabold text-ink-950">
            No matches found
          </h3>
          <p className="mt-1 text-sm text-ink-500">
            Try another title or description keyword.
          </p>
        </div>
      ) : meetings.length === 0 ? (
        <div className="rounded-panel border border-dashed border-cloud-200 bg-white p-12 text-center shadow-panel">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50"><Calendar className="h-6 w-6 text-brand-600" /></div>
          <h3 className="mt-4 text-lg font-extrabold text-ink-950">
            No meetings yet
          </h3>
          <p className="mt-1 text-sm text-ink-500">
            Create your first meeting to get started with meeting analysis.
          </p>
          <Link
            to="/meetings/new"
            className="mt-5 inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-extrabold text-white transition duration-200 hover:bg-brand-700"
          >
            <Plus className="h-4 w-4" />
            Create Meeting
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {filteredMeetings.map((meeting) => (
            <Link
              key={meeting._id}
              to={`/meetings/${meeting._id}`}
              className="group block rounded-panel border border-cloud-200/80 bg-white p-5 shadow-panel transition duration-200 hover:-translate-y-0.5 hover:border-brand-100 hover:shadow-lg sm:p-6"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <div className="min-w-0">
                  <h3 className="text-base font-extrabold text-ink-950 transition duration-200 group-hover:text-brand-700">
                    {meeting.title}
                  </h3>

                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-ink-500">
                    {meeting.description}
                  </p>

                  <p className="mt-3 text-xs font-bold text-ink-500">
                    {formatMeetingDate(meeting.date)}
                  </p>
                </div>

                <div className="flex shrink-0 items-center justify-between gap-4 sm:gap-6">
                  <div className="text-right">
                    <p className="inline-flex rounded-full bg-brand-50 px-2.5 py-1 text-xs font-extrabold text-brand-700">
                      {meeting.actionItems?.length ?? 0}
                    </p>
                    <p className="mt-1 text-xs font-bold text-ink-500">action items</p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-lg border border-cloud-200 px-3 py-2 text-xs font-extrabold text-ink-700 transition duration-200 group-hover:border-brand-200 group-hover:text-brand-700">View <ArrowUpRight className="h-3.5 w-3.5" /></span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

    </div>
  );
}

export default Meetings;
