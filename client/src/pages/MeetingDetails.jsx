import ActivityFeed from "../components/ActivityFeed";
import { Link, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Circle,
  Lightbulb,
  MessageSquare,
  CalendarDays,
  Users,
  Send,
  FileText,
  ChevronDown,
  AlertCircle,
  Loader2,
  UserCircle2,
} from "lucide-react";
import { authFetch, getUser } from "../utils/auth";

/* ---------- helpers ---------- */

const formatDate = (value, options) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-US", options);
};

const getInitial = (name) =>
  name ? name.charAt(0).toUpperCase() : "U";

function Section({ icon: Icon, title, count, hint, children }) {
  return (
    <section className="rounded-panel border border-cloud-200 bg-white shadow-panel">
      <header className="flex flex-wrap items-center gap-3 border-b border-cloud-100 px-5 py-4 sm:px-6">
        <Icon className="h-5 w-5 text-ink-500" aria-hidden="true" />
        <h2 className="text-base font-extrabold text-ink-950">
          {title}
        </h2>
        {count > 0 && (
          <span className="rounded-full bg-cloud-100 px-2.5 py-0.5 text-xs font-bold text-ink-700">
            {count}
          </span>
        )}
        {hint && (
          <span className="ml-auto text-xs font-semibold text-ink-500">
            {hint}
          </span>
        )}
      </header>
      {children}
    </section>
  );
}

function MeetingDetails() {
  const { id } = useParams();

  const [meeting, setMeeting] = useState(null);
  const [comments, setComments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(true);

  const [error, setError] = useState(null);
  const [commentsError, setCommentsError] = useState(null);

  const [transcript, setTranscript] = useState("");
  const [commentText, setCommentText] = useState("");

  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeStatus, setAnalyzeStatus] = useState(null);
  const [postingComment, setPostingComment] = useState(false);
  const [savingAssignment, setSavingAssignment] = useState(null);

  const [descriptionOpen, setDescriptionOpen] = useState(false);
  const [transcriptOpen, setTranscriptOpen] = useState(null);

  const currentUser = getUser();

  useEffect(() => {
    const fetchMeeting = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await authFetch(`/api/meetings/${id}`);

        if (!response.ok) {
          throw new Error("Meeting not found");
        }

        const data = await response.json();

        setMeeting(data);
        setTranscript(data.transcript || "");

        try {
          setCommentsLoading(true);
          setCommentsError(null);

          const commentsResponse = await authFetch(
            `/api/meetings/${id}/comments`
          );

          const commentsData = await commentsResponse.json();

          if (!commentsResponse.ok) {
            throw new Error(
              commentsData.message || "Failed to load comments"
            );
          }

          setComments(commentsData.comments || []);
        } catch (commentError) {
          console.error("Error loading comments:", commentError);
          setCommentsError(commentError.message);
        } finally {
          setCommentsLoading(false);
        }
      } catch (err) {
        console.error("Error loading meeting:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMeeting();
  }, [id]);

  const teamMembers = meeting?.team?.members || [];

  const currentMember = teamMembers.find(
    (member) =>
      member.user?._id?.toString() === currentUser?.id?.toString()
  );

  const canManageTasks =
    currentMember?.role === "owner" ||
    currentMember?.role === "admin";

  const handleAnalyze = async () => {
    if (!transcript.trim()) {
      setAnalyzeStatus({
        type: "error",
        text: "Please enter a transcript first.",
      });
      return;
    }

    try {
      setAnalyzing(true);
      setAnalyzeStatus(null);

      const response = await authFetch(`/api/meetings/${id}/analyze`, {
        method: "POST",
        body: JSON.stringify({ transcript }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to analyze meeting");
      }

      setMeeting(data);
      setTranscript("");
      setAnalyzeStatus({
        type: "success",
        text: "Analysis complete. Summary, decisions and action items are updated.",
      });

      console.log("Meeting analyzed:", data);
    } catch (error) {
      console.error("Error analyzing meeting:", error);

      setAnalyzeStatus({
        type: "error",
        text:
          error instanceof TypeError
            ? "Can't reach the server. Make sure it is running."
            : error.message || "Failed to analyze meeting.",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleToggleActionItem = async (index) => {
    try {
      const actionItem = meeting.actionItems[index];

      if (!actionItem?._id) {
        throw new Error("Action item ID is missing.");
      }

      const action = actionItem.completed ? "reopen" : "complete";

      const response = await authFetch(
        `/api/meetings/${id}/action-items/${actionItem._id}/${action}`,
        { method: "PATCH" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update action item");
      }

      setMeeting((current) => ({
        ...current,
        actionItems: current.actionItems.map((item) =>
          item._id === actionItem._id ? data.actionItem : item
        ),
      }));
    } catch (error) {
      console.error("Error updating action item:", error);
      alert(error.message || "Failed to update action item.");
    }
  };

  const handleAssignActionItem = async (index, userId) => {
    if (!canManageTasks) {
      alert("Only team owners and admins can assign tasks.");
      return;
    }

    if (!userId) {
      return;
    }

    try {
      setSavingAssignment(index);

      const actionItem = meeting.actionItems[index];

      const response = await authFetch(
        `/api/meetings/${id}/action-items/${actionItem._id}/assign`,
        {
          method: "PATCH",
          body: JSON.stringify({ userId }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to assign action item");
      }

      setMeeting((previousMeeting) => ({
        ...previousMeeting,
        actionItems: previousMeeting.actionItems.map((item, itemIndex) =>
          itemIndex === index
            ? {
                ...item,
                assignedTo: data.actionItem.assignedTo,
                completed: false,
              }
            : item
        ),
      }));
    } catch (error) {
      console.error("Error assigning action item:", error);
      alert(error.message || "Failed to assign action item");
    } finally {
      setSavingAssignment(null);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();

    if (!commentText.trim()) {
      return;
    }

    try {
      setPostingComment(true);
      setCommentsError(null);

      const response = await authFetch(`/api/meetings/${id}/comments`, {
        method: "POST",
        body: JSON.stringify({ text: commentText }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add comment");
      }

      setComments((previousComments) => [
        ...previousComments,
        data.comment,
      ]);

      setCommentText("");
    } catch (error) {
      console.error("Error adding comment:", error);
      setCommentsError(error.message || "Failed to add comment");
    } finally {
      setPostingComment(false);
    }
  };

  /* ---------- loading ---------- */

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl py-8">
        <div className="rounded-panel border border-cloud-200 bg-white p-8 shadow-panel">
          <div className="h-8 w-2/3 animate-pulse rounded bg-cloud-100" />
          <div className="mt-4 h-4 w-1/3 animate-pulse rounded bg-cloud-100" />
          <div className="mt-8 h-28 animate-pulse rounded-lg bg-cloud-100" />
        </div>
        <p className="mt-4 text-center text-sm font-bold text-ink-500">
          Loading meeting details...
        </p>
      </div>
    );
  }

  /* ---------- error ---------- */

  if (error || !meeting) {
    return (
      <div className="mx-auto max-w-5xl">
        <Link
          to="/meetings"
          className="inline-flex items-center gap-2 text-sm font-bold text-ink-500 transition hover:text-brand-700"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Meetings
        </Link>

        <div className="mt-8 rounded-panel border border-cloud-200 bg-white p-10 text-center shadow-panel">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-danger-50 text-danger-600">
            <CalendarDays className="h-5 w-5" aria-hidden="true" />
          </div>
          <h1 className="mt-4 text-lg font-extrabold text-ink-950">
            Meeting Not Found
          </h1>
          <p className="mt-2 text-sm text-ink-500">
            The meeting you're looking for doesn't exist or has been
            deleted.
          </p>
        </div>
      </div>
    );
  }

  const actionItems = meeting.actionItems || [];
  const completedCount = actionItems.filter((i) => i.completed).length;
  const decisions = meeting.decisions || [];

  const meetingDate = formatDate(meeting.date, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const isTranscriptOpen =
    transcriptOpen === null ? !meeting.summary : transcriptOpen;

  const longDescription =
    meeting.description && meeting.description.length > 220;

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-16">
      {/* ---------- Header ---------- */}
      <header>
        <Link
          to="/meetings"
          className="inline-flex items-center gap-2 text-sm font-bold text-ink-500 transition hover:text-brand-700"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Meetings
        </Link>

        <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-ink-950 sm:text-3xl">
          {meeting.title}
        </h1>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-ink-500">
          {meetingDate && (
            <span className="inline-flex items-center gap-1.5 font-semibold">
              <CalendarDays className="h-4 w-4" aria-hidden="true" />
              {meetingDate}
            </span>
          )}

          {meeting.team && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 font-bold text-brand-700">
              <Users className="h-4 w-4" aria-hidden="true" />
              {meeting.team.name}
            </span>
          )}

          {actionItems.length > 0 && (
            <span className="inline-flex items-center gap-1.5 font-semibold">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              {completedCount} of {actionItems.length} tasks done
            </span>
          )}
        </div>

        {meeting.description && (
          <div className="mt-4 max-w-3xl">
            <p
              className={`text-sm leading-relaxed text-ink-700 ${
                descriptionOpen ? "" : "line-clamp-3"
              }`}
            >
              {meeting.description}
            </p>

            {longDescription && (
              <button
                type="button"
                onClick={() => setDescriptionOpen((open) => !open)}
                className="mt-1 text-xs font-bold text-brand-700 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-600"
              >
                {descriptionOpen ? "Show less" : "Show more"}
              </button>
            )}
          </div>
        )}
      </header>

      {/* ---------- AI Summary ---------- */}
      {meeting.summary && (
        <section className="rounded-panel border border-brand-100 bg-brand-50/60 p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <Sparkles
              className="h-4 w-4 text-brand-600"
              aria-hidden="true"
            />
            <h2 className="text-xs font-extrabold uppercase tracking-[0.16em] text-brand-700">
              AI Summary
            </h2>
          </div>

          <p className="mt-3 max-w-3xl text-base leading-7 text-ink-900">
            {meeting.summary}
          </p>
        </section>
      )}

      {/* ---------- Decisions ---------- */}
      {decisions.length > 0 && (
        <Section icon={Lightbulb} title="Decisions" count={decisions.length}>
          <ul className="divide-y divide-cloud-100">
            {decisions.map((decision, index) => (
              <li
                key={index}
                className="flex gap-4 px-5 py-4 sm:px-6"
              >
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-cloud-100 text-xs font-bold text-ink-700">
                  {index + 1}
                </span>
                <p className="text-sm leading-6 text-ink-900">
                  {decision}
                </p>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* ---------- Action Items ---------- */}
      <Section
        icon={CheckCircle2}
        title="Action Items"
        count={actionItems.length}
        hint={
          actionItems.length > 0 && !canManageTasks
            ? "Only owners and admins can assign tasks"
            : undefined
        }
      >
        {actionItems.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <p className="text-sm text-ink-500">
              No action items yet. Analyze the transcript below to
              generate them.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-cloud-100">
            {actionItems.map((item, index) => {
              const assignedUserId =
                item.assignedTo?._id || item.assignedTo || "";

              const isAssignedToCurrentUser =
                assignedUserId?.toString() ===
                currentUser?.id?.toString();

              const canToggle =
                Boolean(item.assignedTo) && isAssignedToCurrentUser;

              const deadline = formatDate(item.deadline, {
                year: "numeric",
                month: "short",
                day: "numeric",
              });

              return (
                <li
                  key={item._id || index}
                  className="px-5 py-5 sm:px-6"
                >
                  <div className="flex items-start gap-4">
                    <button
                      type="button"
                      onClick={() => handleToggleActionItem(index)}
                      disabled={!canToggle}
                      aria-label={
                        item.completed
                          ? "Reopen task"
                          : "Mark task as complete"
                      }
                      title={
                        !item.assignedTo
                          ? "This task is not assigned yet"
                          : !isAssignedToCurrentUser
                          ? "Only the assigned employee can complete this task"
                          : item.completed
                          ? "Reopen task"
                          : "Mark task as complete"
                      }
                      className={`mt-0.5 flex-shrink-0 rounded-full transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 ${
                        canToggle
                          ? "cursor-pointer"
                          : "cursor-not-allowed opacity-40"
                      }`}
                    >
                      {item.completed ? (
                        <CheckCircle2 className="h-6 w-6 text-success-600" />
                      ) : (
                        <Circle className="h-6 w-6 text-cloud-300 hover:text-ink-500" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                          <p
                            className={`text-sm font-semibold leading-6 sm:text-base ${
                              item.completed
                                ? "text-ink-500 line-through"
                                : "text-ink-950"
                            }`}
                          >
                            {item.task}
                          </p>

                          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-ink-500">
                            {item.owner && (
                              <span className="inline-flex items-center gap-1.5">
                                <UserCircle2
                                  className="h-4 w-4"
                                  aria-hidden="true"
                                />
                                AI suggested: {item.owner}
                              </span>
                            )}

                            {deadline && (
                              <span className="inline-flex items-center gap-1.5">
                                <CalendarDays
                                  className="h-4 w-4"
                                  aria-hidden="true"
                                />
                                Due {deadline}
                              </span>
                            )}

                            {item.assignedTo ? (
                              <span className="inline-flex items-center rounded-full bg-success-50 px-2.5 py-0.5 font-bold text-success-700">
                                {isAssignedToCurrentUser
                                  ? "Assigned to you"
                                  : `Assigned to ${
                                      item.assignedTo?.name ||
                                      "team member"
                                    }`}
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-full bg-cloud-100 px-2.5 py-0.5 font-bold text-ink-700">
                                Unassigned
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="w-full flex-shrink-0 lg:w-60">
                          <label
                            htmlFor={`assign-${index}`}
                            className="mb-1 block text-xs font-bold text-ink-500"
                          >
                            Assignee
                          </label>

                          <select
                            id={`assign-${index}`}
                            value={assignedUserId}
                            onChange={(e) =>
                              handleAssignActionItem(index, e.target.value)
                            }
                            disabled={
                              !canManageTasks ||
                              savingAssignment === index
                            }
                            className="w-full rounded-lg border border-cloud-200 bg-white px-3 py-2 text-sm font-medium text-ink-900 transition focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-50 disabled:cursor-not-allowed disabled:bg-cloud-50 disabled:opacity-70"
                          >
                            <option value="">Unassigned</option>

                            {teamMembers.map((member) => {
                              const user = member.user;
                              if (!user) return null;

                              return (
                                <option key={user._id} value={user._id}>
                                  {user.name} ({member.role})
                                </option>
                              );
                            })}
                          </select>

                          {savingAssignment === index && (
                            <p className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600">
                              <Loader2 className="h-3 w-3 animate-spin" />
                              Saving...
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Section>

      {/* ---------- Team ---------- */}
      {meeting.team && teamMembers.length > 0 && (
        <Section
          icon={Users}
          title="Team Members"
          count={teamMembers.length}
        >
          <ul className="flex flex-wrap gap-3 px-5 py-5 sm:px-6">
            {teamMembers.map((member) => {
              const user = member.user;
              if (!user) return null;

              return (
                <li
                  key={user._id}
                  className="flex items-center gap-3 rounded-full border border-cloud-200 bg-white py-1.5 pl-1.5 pr-4"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-sm font-extrabold text-brand-700">
                    {getInitial(user.name)}
                  </span>
                  <span className="text-sm font-bold text-ink-950">
                    {user.name}
                  </span>
                  <span className="text-xs capitalize text-ink-500">
                    {member.role}
                  </span>
                </li>
              );
            })}
          </ul>
        </Section>
      )}

      {/* ---------- Discussion ---------- */}
      <Section
        icon={MessageSquare}
        title="Discussion"
        count={comments.length}
      >
        <div className="px-5 py-5 sm:px-6">
          {commentsLoading ? (
            <div className="space-y-4">
              <div className="h-14 animate-pulse rounded-lg bg-cloud-100" />
              <div className="h-14 animate-pulse rounded-lg bg-cloud-100" />
            </div>
          ) : comments.length === 0 ? (
            <div className="rounded-lg border border-dashed border-cloud-200 px-6 py-8 text-center">
              <MessageSquare
                className="mx-auto h-7 w-7 text-cloud-300"
                aria-hidden="true"
              />
              <p className="mt-3 text-sm font-semibold text-ink-700">
                No discussion yet
              </p>
              <p className="mt-1 text-xs text-ink-500">
                Start the conversation about this meeting.
              </p>
            </div>
          ) : (
            <ul className="max-h-96 space-y-5 overflow-y-auto pr-1">
              {comments.map((comment) => {
                const isCurrentUser =
                  comment.author?._id?.toString() ===
                  currentUser?.id?.toString();

                return (
                  <li key={comment._id} className="flex gap-3">
                    <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-extrabold text-brand-700">
                      {getInitial(comment.author?.name)}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                        <span className="text-sm font-extrabold text-ink-950">
                          {comment.author?.name || "Team Member"}
                        </span>

                        {isCurrentUser && (
                          <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-700">
                            You
                          </span>
                        )}

                        <span className="text-xs text-ink-500">
                          {new Date(comment.createdAt).toLocaleString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                            }
                          )}
                        </span>
                      </div>

                      <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-ink-700">
                        {comment.text}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {commentsError && (
            <div
              role="alert"
              className="mt-4 flex items-start gap-2 rounded-lg border border-danger-50 bg-danger-50 px-4 py-3 text-sm font-semibold text-danger-600"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              {commentsError}
            </div>
          )}

          <form
            onSubmit={handleAddComment}
            className="mt-6 flex gap-3 border-t border-cloud-100 pt-6"
          >
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-extrabold text-white">
              {getInitial(currentUser?.name)}
            </span>

            <div className="min-w-0 flex-1">
              <label htmlFor="comment-text" className="sr-only">
                Write a comment
              </label>

              <textarea
                id="comment-text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                maxLength={2000}
                rows={3}
                placeholder="Write a comment..."
                className="w-full resize-none rounded-lg border border-cloud-200 bg-white px-4 py-3 text-sm text-ink-900 placeholder:text-ink-500 transition focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-50"
              />

              <div className="mt-3 flex items-center justify-between gap-3">
                <span className="text-xs text-ink-500">
                  {commentText.length}/2000
                </span>

                <button
                  type="submit"
                  disabled={postingComment || !commentText.trim()}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Send className="h-4 w-4" aria-hidden="true" />
                  {postingComment ? "Posting..." : "Comment"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </Section>

      {/* ---------- Transcript ---------- */}
      <section className="rounded-panel border border-cloud-200 bg-white shadow-panel">
        <button
          type="button"
          onClick={() => setTranscriptOpen(!isTranscriptOpen)}
          aria-expanded={isTranscriptOpen}
          aria-controls="transcript-panel"
          className="flex w-full items-center gap-3 px-5 py-4 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-600 sm:px-6"
        >
          <FileText
            className="h-5 w-5 text-ink-500"
            aria-hidden="true"
          />
          <span className="text-base font-extrabold text-ink-950">
            Transcript
          </span>
          <span className="ml-auto text-xs font-semibold text-ink-500">
            {isTranscriptOpen ? "Hide" : "Show"}
          </span>
          <ChevronDown
            className={`h-4 w-4 text-ink-500 transition-transform ${
              isTranscriptOpen ? "rotate-180" : ""
            }`}
            aria-hidden="true"
          />
        </button>

        {isTranscriptOpen && (
          <div
            id="transcript-panel"
            className="space-y-4 border-t border-cloud-100 px-5 py-5 sm:px-6"
          >
            <label htmlFor="transcript-text" className="sr-only">
              Meeting transcript
            </label>

            <textarea
              id="transcript-text"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Paste meeting transcript here to analyze..."
              rows={8}
              className="max-h-80 w-full resize-y rounded-lg border border-cloud-200 bg-white px-4 py-3 font-mono text-xs leading-6 text-ink-900 placeholder:text-ink-500 transition focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-50"
            />

            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={analyzing || !transcript.trim()}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {analyzing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                )}
                {analyzing ? "Analyzing..." : "Analyze Meeting"}
              </button>

              {analyzing && (
                <p className="text-sm font-semibold text-brand-700">
                  AI is analyzing your meeting. This may take a moment...
                </p>
              )}
            </div>

            {analyzeStatus && (
              <div
                role={analyzeStatus.type === "error" ? "alert" : "status"}
                className={`flex items-start gap-2 rounded-lg px-4 py-3 text-sm font-semibold ${
                  analyzeStatus.type === "error"
                    ? "bg-danger-50 text-danger-600"
                    : "bg-success-50 text-success-700"
                }`}
              >
                {analyzeStatus.type === "error" ? (
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                ) : (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
                )}
                {analyzeStatus.text}
              </div>
            )}
          </div>
        )}
      </section>

      {/* ---------- Activity ---------- */}
      <ActivityFeed meetingId={meeting?._id} />
    </div>
  );
}

export default MeetingDetails;