import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Users, ArrowRight } from "lucide-react";
import { authFetch } from "../utils/auth";

const Teams = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [creating, setCreating] = useState(false);

  const loadTeams = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await authFetch("/api/teams");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load teams");
      }

      setTeams(data.teams || []);
    } catch (requestError) {
      setError(requestError.message || "Unable to load teams right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const loadInitialTeams = async () => {
      try {
        const response = await authFetch("/api/teams");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load teams");
        }

        if (!cancelled) {
          setTeams(data.teams || []);
          setError("");
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(requestError.message || "Unable to load teams right now.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadInitialTeams();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleCreateTeam = async (event) => {
    event.preventDefault();

    if (!teamName.trim()) {
      setError("Team name is required.");
      return;
    }

    try {
      setCreating(true);
      setError("");

      const response = await authFetch("/api/teams", {
        method: "POST",
        body: JSON.stringify({ name: teamName.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create team");
      }

      setTeams((previousTeams) => [data.team, ...previousTeams]);
      setTeamName("");
      setShowCreateForm(false);
    } catch (requestError) {
      setError(requestError.message || "Unable to create team right now.");
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-44 animate-pulse rounded-panel border border-cloud-200/80 bg-white p-6 shadow-panel"
          >
            <div className="h-5 w-1/2 rounded bg-cloud-100" />
            <div className="mt-3 h-4 w-2/3 rounded bg-cloud-100" />
            <div className="mt-10 h-9 rounded bg-cloud-100" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-ink-950 sm:text-4xl">
            Teams
          </h1>
          <p className="mt-2 text-base text-ink-500 sm:text-lg">
            Manage your Meetwise workspaces and team members.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateForm((previous) => !previous)}
          className="flex w-fit items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 font-extrabold text-white transition hover:bg-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
        >
          <Plus size={18} />
          Create Team
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-danger-600/20 bg-danger-50 p-4 text-sm text-danger-600"
        >
          <p>{error}</p>
          <button
            type="button"
            onClick={loadTeams}
            className="mt-3 inline-flex rounded-lg bg-danger-600 px-3 py-1.5 text-xs font-bold text-white transition hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger-600"
          >
            Retry
          </button>
        </div>
      )}

      {showCreateForm && (
        <form
          onSubmit={handleCreateTeam}
          className="rounded-panel border border-cloud-200/80 bg-white p-6 shadow-panel"
        >
          <h2 className="mb-1 text-xl font-extrabold tracking-tight text-ink-950">
            Create a new team
          </h2>
          <p className="mb-5 text-sm text-ink-500">
            Create a workspace for your team members.
          </p>

          <label
            htmlFor="team-name"
            className="mb-2 block text-sm font-bold text-ink-900"
          >
            Team name
          </label>
          <input
            id="team-name"
            type="text"
            value={teamName}
            onChange={(event) => setTeamName(event.target.value)}
            placeholder="e.g. Website Redesign Team"
            maxLength={100}
            required
            className="mb-4 w-full rounded-lg border border-cloud-200 bg-white px-4 py-3 text-sm font-semibold text-ink-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-50"
          />

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={creating}
              className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-extrabold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {creating ? "Creating..." : "Create Team"}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowCreateForm(false);
                setTeamName("");
                setError("");
              }}
              className="rounded-lg border border-cloud-200 bg-white px-5 py-2.5 text-sm font-extrabold text-ink-700 transition hover:bg-cloud-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {teams.length === 0 ? (
        <div className="rounded-panel border border-cloud-200 bg-white p-12 text-center shadow-panel">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-50">
            <Users size={30} className="text-brand-600" />
          </div>

          <h2 className="text-xl font-extrabold text-ink-950">No teams yet</h2>
          <p className="mx-auto mt-2 max-w-md text-ink-500">
            Create your first team to start collaborating with your members.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {teams.map((team) => (
            <div
              key={team._id}
              className="rounded-panel border border-cloud-200/80 bg-white p-6 shadow-panel transition duration-200 hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="mb-5 flex items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-50">
                  <Users size={23} className="text-brand-600" />
                </div>

                <div>
                  <h2 className="font-extrabold text-ink-950">{team.name}</h2>
                  <p className="mt-1 text-sm text-ink-500">
                    {team.members?.length || 0}{" "}
                    {team.members?.length === 1 ? "member" : "members"}
                  </p>
                </div>
              </div>

              <div className="mb-5 border-t border-cloud-100 pt-4">
                <p className="text-xs font-bold uppercase tracking-wide text-ink-500">
                  Created by
                </p>
                <p className="mt-1 text-sm font-bold text-ink-900">
                  {team.createdBy?.name || "Unknown"}
                </p>
              </div>

              <Link
                to={`/teams/${team._id}`}
                className="flex items-center justify-center gap-2 rounded-lg bg-ink-900 px-4 py-2.5 text-sm font-extrabold text-white transition hover:bg-ink-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-900"
              >
                View Team
                <ArrowRight size={16} />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Teams;
