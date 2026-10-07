import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Check, Mail, Users, X } from "lucide-react";
import { authFetch } from "../utils/auth";

const Invitations = () => {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState(null);

  const loadInvitations = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await authFetch("/api/teams/invitations/me");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load invitations");
      }

      setInvitations(data.invitations || []);
    } catch (requestError) {
      setError(requestError.message || "Unable to load invitations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const loadInitialInvitations = async () => {
      try {
        const response = await authFetch("/api/teams/invitations/me");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load invitations");
        }

        if (!cancelled) {
          setInvitations(data.invitations || []);
          setError("");
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(requestError.message || "Unable to load invitations.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadInitialInvitations();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleInvitation = async (invitationId, action) => {
    try {
      setProcessingId(invitationId);
      setError("");

      const response = await authFetch(
        `/api/teams/invitations/${invitationId}/${action}`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Failed to ${action} invitation`);
      }

      setInvitations((previous) =>
        previous.filter((invitation) => invitation._id !== invitationId)
      );
    } catch (requestError) {
      setError(requestError.message || `Unable to ${action} invitation.`);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-4">
        {[1, 2].map((item) => (
          <div
            key={item}
            className="h-32 animate-pulse rounded-panel border border-cloud-200/80 bg-white p-6 shadow-panel"
          >
            <div className="h-5 w-1/3 rounded bg-cloud-100" />
            <div className="mt-3 h-4 w-2/3 rounded bg-cloud-100" />
            <div className="mt-5 h-4 w-1/2 rounded bg-cloud-100" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-ink-950 sm:text-4xl">
          Invitations
        </h1>
        <p className="mt-2 text-base text-ink-500 sm:text-lg">
          Manage invitations to join Meetwise teams.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-danger-600/20 bg-danger-50 p-4 text-sm text-danger-600"
        >
          <p>{error}</p>
          <button
            type="button"
            onClick={loadInvitations}
            className="mt-3 inline-flex rounded-lg bg-danger-600 px-3 py-1.5 text-xs font-bold text-white transition hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger-600"
          >
            Retry
          </button>
        </div>
      )}

      {invitations.length === 0 ? (
        <div className="rounded-panel border border-cloud-200 bg-white p-12 text-center shadow-panel">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-cloud-100">
            <Mail size={28} className="text-ink-500" />
          </div>

          <h2 className="text-xl font-extrabold text-ink-950">
            No pending invitations
          </h2>
          <p className="mt-2 text-ink-500">You're all caught up.</p>

          <Link
            to="/teams"
            className="mt-5 inline-flex rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-extrabold text-white transition hover:bg-brand-700"
          >
            View Teams
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {invitations.map((invitation) => (
            <div
              key={invitation._id}
              className="rounded-panel border border-cloud-200/80 bg-white p-6 shadow-panel"
            >
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-brand-50">
                    <Users size={22} className="text-brand-600" />
                  </div>

                  <div>
                    <h2 className="text-lg font-extrabold text-ink-950">
                      {invitation.team?.name || "Unknown Team"}
                    </h2>

                    <p className="mt-1 text-sm text-ink-500">
                      Invited by{" "}
                      <span className="font-bold text-ink-700">
                        {invitation.invitedBy?.name || "Unknown User"}
                      </span>
                    </p>

                    <p className="mt-1 text-sm text-ink-500">
                      Role:{" "}
                      <span className="font-bold capitalize text-ink-700">
                        {invitation.role}
                      </span>
                    </p>

                    <p className="mt-1 text-xs text-ink-500">
                      Invitation expires{" "}
                      {new Date(invitation.expiresAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => handleInvitation(invitation._id, "accept")}
                    disabled={processingId === invitation._id}
                    className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-extrabold text-white transition hover:bg-brand-700 disabled:opacity-50"
                  >
                    <Check size={17} />
                    Accept
                  </button>

                  <button
                    type="button"
                    onClick={() => handleInvitation(invitation._id, "reject")}
                    disabled={processingId === invitation._id}
                    className="flex items-center gap-2 rounded-lg border border-cloud-200 px-4 py-2.5 text-sm font-extrabold text-ink-700 transition hover:bg-cloud-50 disabled:opacity-50"
                  >
                    <X size={17} />
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Invitations;
