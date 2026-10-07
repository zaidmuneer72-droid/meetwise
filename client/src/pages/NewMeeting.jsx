
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { authFetch } from "../utils/auth";

function NewMeeting() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");

  const [teams, setTeams] = useState([]);
  const [teamId, setTeamId] = useState("");

  const [loadingTeams, setLoadingTeams] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadTeams() {
      try {
        setLoadingTeams(true);
        setError(null);

        const response = await authFetch("/api/teams");

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load teams");
        }

        setTeams(data.teams || []);

        if (data.teams?.length > 0) {
          setTeamId(data.teams[0]._id);
        }
      } catch (error) {
        console.error("Error loading teams:", error);
        setError(error.message);
      } finally {
        setLoadingTeams(false);
      }
    }

    loadTeams();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!teamId) {
      setError("Please select a team.");
      return;
    }

    const newMeeting = {
      teamId,
      title,
      date,
      description,
    };

    try {
      setLoading(true);

      const response = await authFetch("/api/meetings", {
        method: "POST",
        body: JSON.stringify(newMeeting),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create meeting");
      }

      console.log("Meeting saved:", data);

      navigate("/meetings");
    } catch (error) {
      console.error("Error creating meeting:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <Link
        to="/meetings"
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Meetings
      </Link>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Create a new meeting
        </h1>

        <p className="text-lg text-gray-600">
          Fill in the details below to create a new meeting.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}

      {loadingTeams ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8">
          <p className="text-sm text-gray-600">Loading your teams...</p>
        </div>
      ) : teams.length === 0 ? (
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-6">
          <p className="font-semibold text-yellow-900">
            You are not a member of any team yet.
          </p>

          <p className="mt-1 text-sm text-yellow-800">
            Create a team or join a team before creating a meeting.
          </p>

          <Link
            to="/teams"
            className="mt-4 inline-flex rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Go to Teams
          </Link>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-xl border border-gray-200 bg-white p-8"
        >
          <div>
            <label
              htmlFor="team"
              className="block text-sm font-semibold text-gray-900"
            >
              Team
            </label>

            <select
              id="team"
              value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
              required
              className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 transition focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="" disabled>
                Select a team
              </option>

              {teams.map((team) => (
                <option key={team._id} value={team._id}>
                  {team.name}
                </option>
              ))}
            </select>

            <p className="mt-1.5 text-xs text-gray-500">
              Team members will be able to access this meeting.
            </p>
          </div>

          <div>
            <label
              htmlFor="title"
              className="block text-sm font-semibold text-gray-900"
            >
              Meeting title
            </label>

            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g., Product Planning Session"
              className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-500 transition focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label
              htmlFor="date"
              className="block text-sm font-semibold text-gray-900"
            >
              Date
            </label>

            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 transition focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-semibold text-gray-900"
            >
              Description
            </label>

            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              placeholder="Provide some context about this meeting..."
              className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-500 transition focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-6">
            <Link
              to="/meetings"
              className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 transition hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-300"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={loading || !teamId}
              className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 active:bg-indigo-800 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              {loading ? "Creating..." : "Create Meeting"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default NewMeeting;
