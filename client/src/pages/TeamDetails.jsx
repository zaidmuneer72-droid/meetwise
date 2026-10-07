import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Mail, UserPlus, Users } from "lucide-react";
import { authFetch, getUser } from "../utils/auth";

const TeamDetails = () => {
  const { teamId } = useParams();

  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [inviting, setInviting] = useState(false);
  const [inviteMessage, setInviteMessage] = useState("");
  const [inviteError, setInviteError] = useState("");

  const currentUser = getUser();

  const loadTeam = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await authFetch(`/api/teams/${teamId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load team");
      }

      setTeam(data.team);
    } catch (requestError) {
      setError(requestError.message || "Unable to load team.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const loadInitialTeam = async () => {
      try {
        const response = await authFetch(`/api/teams/${teamId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load team");
        }

        if (!cancelled) {
          setTeam(data.team);
          setError("");
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(requestError.message || "Unable to load team.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadInitialTeam();

    return () => {
      cancelled = true;
    };
  }, [teamId]);

  const currentMember = team?.members?.find(
    (member) =>
      member.user?._id === currentUser?.id || member.user?._id === currentUser?._id
  );

  const canInvite = currentMember?.role === "owner" || currentMember?.role === "admin";

  const handleInvite = async (event) => {
    event.preventDefault();

    if (!email.trim()) {
      setInviteError("Member email is required.");
      return;
    }

    try {
      setInviting(true);
      setInviteMessage("");
      setInviteError("");

      const response = await authFetch(`/api/teams/${teamId}/invite`, {
        method: "POST",
        body: JSON.stringify({
          email: email.trim(),
          role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to invite member");
      }

      setInviteMessage("Invitation sent successfully.");
      setEmail("");
      setRole("member");
    } catch (requestError) {
      setInviteError(requestError.message || "Unable to send invitation.");
    } finally {
      setInviting(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-panel border border-cloud-200/80 bg-white p-8 shadow-panel">
        <div className="h-6 w-1/3 animate-pulse rounded bg-cloud-100" />
        <div className="mt-4 h-4 w-2/3 animate-pulse rounded bg-cloud-100" />
        <div className="mt-8 h-36 animate-pulse rounded bg-cloud-100" />
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="rounded-panel border border-danger-600/20 bg-danger-50 p-6 shadow-panel">
        <h2 className="font-bold text-danger-600">Unable to load team</h2>
        <p className="mt-2 text-sm text-danger-600">{error || "Team not found"}</p>

        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={loadTeam}
            className="inline-flex items-center rounded-lg bg-danger-600 px-4 py-2 text-sm font-bold text-white transition hover:brightness-95"
          >
            Retry
          </button>
          <Link
            to="/teams"
            className="inline-flex items-center gap-2 rounded-lg border border-danger-600/20 px-4 py-2 text-sm font-bold text-danger-600"
          >
            <ArrowLeft size={16} />
            Back to Teams
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Link
        to="/teams"
        className="inline-flex items-center gap-2 text-sm font-extrabold text-ink-500 transition duration-200 hover:text-brand-700"
      >
        <ArrowLeft size={16} />
        Back to Teams
      </Link>

      <div className="rounded-panel border border-cloud-200/80 bg-white p-6 shadow-panel">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-brand-50">
            <Users size={28} className="text-brand-600" />
          </div>

          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-ink-950">{team.name}</h1>
            <p className="mt-1 text-sm text-ink-500">
              {team.members?.length || 0} {team.members?.length === 1 ? "member" : "members"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-panel border border-cloud-200/80 bg-white shadow-panel">
            <div className="border-b border-cloud-100 p-6">
              <h2 className="text-lg font-extrabold text-ink-950">Team Members</h2>
              <p className="mt-1 text-sm text-ink-500">People who have access to this workspace.</p>
            </div>

            <div className="divide-y divide-cloud-100">
              {team.members?.map((member) => (
                <div key={member.user?._id} className="flex items-center justify-between p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cloud-100 font-semibold text-ink-600">
                      {member.user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>

                    <div>
                      <p className="font-bold text-ink-900">{member.user?.name || "Unknown User"}</p>
                      <p className="text-sm text-ink-500">{member.user?.email || ""}</p>
                    </div>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      member.role === "owner"
                        ? "bg-purple-100 text-purple-700"
                        : member.role === "admin"
                          ? "bg-brand-50 text-brand-700"
                          : "bg-cloud-100 text-ink-700"
                    }`}
                  >
                    {member.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          {canInvite ? (
            <div className="rounded-panel border border-cloud-200/80 bg-white p-6 shadow-panel">
              <div className="mb-5">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50">
                  <UserPlus size={20} className="text-brand-600" />
                </div>

                <h2 className="text-lg font-extrabold text-ink-950">Invite Member</h2>
                <p className="mt-1 text-sm text-ink-500">
                  Add an existing Meetwise user to this team.
                </p>
              </div>

              {inviteMessage && (
                <div className="mb-4 rounded-lg border border-success-600/20 bg-success-50 p-3 text-sm text-success-600">
                  {inviteMessage}
                </div>
              )}

              {inviteError && (
                <div className="mb-4 rounded-lg border border-danger-600/20 bg-danger-50 p-3 text-sm text-danger-600">
                  {inviteError}
                </div>
              )}

              <form onSubmit={handleInvite}>
                <label htmlFor="invite-email" className="mb-2 block text-sm font-bold text-ink-700">
                  Email
                </label>

                <div className="relative mb-4">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />

                  <input
                    id="invite-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="member@example.com"
                    required
                    className="w-full rounded-lg border border-cloud-200 bg-white py-2.5 pl-10 pr-3 text-sm font-semibold text-ink-900 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-50"
                  />
                </div>

                <label htmlFor="invite-role" className="mb-2 block text-sm font-bold text-ink-700">
                  Role
                </label>

                <select
                  id="invite-role"
                  value={role}
                  onChange={(event) => setRole(event.target.value)}
                  className="mb-5 w-full rounded-lg border border-cloud-200 bg-white px-3 py-2.5 text-sm font-semibold text-ink-900 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-50"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>

                <button
                  type="submit"
                  disabled={inviting}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-extrabold text-white hover:bg-brand-700 disabled:opacity-50"
                >
                  <UserPlus size={18} />
                  {inviting ? "Sending..." : "Send Invitation"}
                </button>
              </form>
            </div>
          ) : (
            <div className="rounded-panel border border-cloud-200/80 bg-white p-6 shadow-panel">
              <h2 className="font-extrabold text-ink-950">Your Role</h2>
              <p className="mt-2 text-2xl font-extrabold capitalize text-brand-600">
                {currentMember?.role || "Member"}
              </p>
              <p className="mt-2 text-sm text-ink-500">
                Only team owners and admins can invite new members.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamDetails;
