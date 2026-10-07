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
  User,
  Users,
  Send,
} from "lucide-react";
import { authFetch, getUser } from "../utils/auth";

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
  const [postingComment, setPostingComment] = useState(false);
  const [savingAssignment, setSavingAssignment] = useState(null);

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
      member.user?._id?.toString() ===
      currentUser?.id?.toString()
  );

  const canManageTasks =
    currentMember?.role === "owner" ||
    currentMember?.role === "admin";


  const handleAnalyze = async () => {
    if (!transcript.trim()) {
      alert("Please enter a transcript first.");
      return;
    }

    try {
      setAnalyzing(true);

      const response = await authFetch(
        `/api/meetings/${id}/analyze`,
        {
          method: "POST",
          body: JSON.stringify({
            transcript,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to analyze meeting"
        );
      }

      setMeeting(data);
      setTranscript("");

      console.log("Meeting analyzed:", data);
    } catch (error) {
      console.error("Error analyzing meeting:", error);

      alert(
        error instanceof TypeError
          ? "Can't reach the server. Make sure it is running."
          : error.message || "Failed to analyze meeting."
      );
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

    const action = actionItem.completed
      ? "reopen"
      : "complete";

    const response = await authFetch(
      `/api/meetings/${id}/action-items/${actionItem._id}/${action}`,
      {
        method: "PATCH",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to update action item"
      );
    }

    setMeeting((current) => ({
      ...current,
      actionItems: current.actionItems.map(
        (item) =>
          item._id === actionItem._id
            ? data.actionItem
            : item
      ),
    }));
  } catch (error) {
    console.error(
      "Error updating action item:",
      error
    );

    alert(
      error.message ||
        "Failed to update action item."
    );
  }
};


  const handleAssignActionItem = async (
    index,
    userId
  ) => {
    if (!canManageTasks) {
      alert(
        "Only team owners and admins can assign tasks."
      );
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
          body: JSON.stringify({
            userId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to assign action item"
        );
      }

      setMeeting((previousMeeting) => ({
        ...previousMeeting,
        actionItems:
          previousMeeting.actionItems.map(
            (item, itemIndex) =>
              itemIndex === index
                ? {
                    ...item,
                    assignedTo:
                      data.actionItem.assignedTo,
                    completed: false,
                  }
                : item
          ),
      }));
    } catch (error) {
      console.error(
        "Error assigning action item:",
        error
      );

      alert(
        error.message ||
          "Failed to assign action item"
      );
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

      const response = await authFetch(
        `/api/meetings/${id}/comments`,
        {
          method: "POST",
          body: JSON.stringify({
            text: commentText,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to add comment"
        );
      }

      setComments((previousComments) => [
        ...previousComments,
        data.comment,
      ]);

      setCommentText("");
    } catch (error) {
      console.error(
        "Error adding comment:",
        error
      );

      setCommentsError(
        error.message ||
          "Failed to add comment"
      );
    } finally {
      setPostingComment(false);
    }
  };


  if (loading) {
    return (
      <div className="mx-auto max-w-4xl py-8">
        <div className="text-center">
          <div className="mx-auto max-w-xl rounded-panel border border-cloud-200 bg-white p-8 text-left shadow-panel">
            <div className="h-7 w-2/3 animate-pulse rounded bg-cloud-100" />

            <div className="mt-4 h-4 w-1/3 animate-pulse rounded bg-cloud-100" />

            <div className="mt-8 h-28 animate-pulse rounded-lg bg-cloud-100" />
          </div>

          <p className="mt-4 text-sm font-bold text-ink-500">
            Loading meeting details...
          </p>
        </div>
      </div>
    );
  }


  if (error || !meeting) {
    return (
      <div className="mx-auto max-w-4xl">
        <Link
          to="/meetings"
          className="inline-flex items-center gap-2 text-sm font-extrabold text-ink-500 transition duration-200 hover:text-brand-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Meetings
        </Link>

        <div className="mt-8 rounded-panel border border-danger-50 bg-white p-10 text-center shadow-panel">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-danger-50 text-danger-600">
            <CalendarDays className="h-5 w-5" />
          </div>

          <h1 className="mt-4 text-lg font-extrabold text-ink-950">
            Meeting Not Found
          </h1>

          <p className="mt-2 text-sm text-ink-500">
            The meeting you're looking for doesn't
            exist or has been deleted.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">

      <div>
        <Link
          to="/meetings"
          className="inline-flex items-center gap-2 text-sm font-extrabold text-ink-500 transition duration-200 hover:text-brand-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Meetings
        </Link>

        <div className="mt-6 space-y-3">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-ink-950 sm:text-4xl">
                {meeting.title}
              </h1>

              <div className="mt-3 flex flex-col gap-2 text-sm font-bold text-ink-500 sm:flex-row sm:gap-4">
                <span>
                  {new Date(
                    meeting.date
                  ).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>

                {meeting.description && (
                  <span>
                    {meeting.description}
                  </span>
                )}
              </div>
            </div>

            {meeting.team && (
              <div className="inline-flex items-center gap-2 self-start rounded-full bg-brand-50 px-3 py-2 text-sm font-bold text-brand-700">
                <Users className="h-4 w-4" />

                {meeting.team.name}
              </div>
            )}
          </div>
        </div>
      </div>


      {meeting.team &&
        teamMembers.length > 0 && (
          <div className="overflow-hidden rounded-panel border border-cloud-200/80 bg-white shadow-panel">
            <div className="border-b border-cloud-100 bg-cloud-50/70 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-brand-50 p-2">
                  <Users className="h-5 w-5 text-brand-600" />
                </div>

                <h2 className="text-base font-extrabold text-ink-950">
                  Team Members
                </h2>

                <span className="ml-auto inline-flex items-center rounded-full bg-brand-50 px-3 py-1 text-xs font-extrabold text-brand-700">
                  {teamMembers.length}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 p-6">
              {teamMembers.map((member) => {
                const user = member.user;

                if (!user) return null;

                return (
                  <div
                    key={user._id}
                    className="flex items-center gap-3 rounded-lg border border-cloud-200 bg-white px-3 py-2"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                      <User className="h-4 w-4" />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-ink-950">
                        {user.name}
                      </p>

                      <p className="text-xs text-ink-500">
                        {member.role}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}


      {meeting.summary && (
        <div className="rounded-panel border border-brand-100 bg-brand-50/60 p-6 shadow-panel">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-white p-2 shadow-sm">
              <Sparkles className="h-5 w-5 text-brand-600" />
            </div>

            <div className="flex-1">
              <h2 className="text-xs font-extrabold uppercase tracking-[0.16em] text-brand-700">
                AI Summary
              </h2>

              <p className="mt-3 text-base leading-relaxed text-ink-900">
                {meeting.summary}
              </p>
            </div>
          </div>
        </div>
      )}


      <div className="overflow-hidden rounded-panel border border-cloud-200/80 bg-white shadow-panel">
        <div className="border-b border-cloud-100 bg-cloud-50/70 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-success-50 p-2">
              <CheckCircle2 className="h-5 w-5 text-success-600" />
            </div>

            <h2 className="text-base font-extrabold text-ink-950">
              Action Items
            </h2>

            {meeting.actionItems.length > 0 && (
              <span className="ml-auto inline-flex items-center rounded-full bg-success-50 px-3 py-1 text-xs font-extrabold text-success-600">
                {meeting.actionItems.length}
              </span>
            )}
          </div>
        </div>

        <div className="divide-y divide-cloud-100">
          {meeting.actionItems.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <p className="text-sm text-ink-500">
                No action items yet. Analyze the
                transcript below to generate them.
              </p>
            </div>
          ) : (
            meeting.actionItems.map((item, index) => {
              const assignedUserId =
                item.assignedTo?._id ||
                item.assignedTo ||
                "";

              const isAssignedToCurrentUser =
                assignedUserId?.toString() ===
                currentUser?.id?.toString();

              return (
                <div
                  key={item._id || index}
                  className={`px-6 py-5 transition duration-200 hover:bg-cloud-50 ${
                    item.completed
                      ? "bg-cloud-50"
                      : ""
                  }`}
                >
                  <div className="flex items-start gap-4">

                    <button
                      type="button"
                      onClick={() =>
                        handleToggleActionItem(index)
                      }
                      disabled={
                        !item.assignedTo ||
                        !isAssignedToCurrentUser
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
                      className={`mt-0.5 flex-shrink-0 rounded-md transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 ${
                        !item.assignedTo ||
                        !isAssignedToCurrentUser
                          ? "cursor-not-allowed opacity-40"
                          : "cursor-pointer"
                      }`}
                    >
                      {item.completed ? (
                        <CheckCircle2 className="h-6 w-6 text-success-600" />
                      ) : (
                        <Circle className="h-6 w-6 text-cloud-300 hover:text-ink-500" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1">

                      <p
                        className={`text-base font-medium ${
                          item.completed
                            ? "text-ink-500 line-through"
                            : "text-ink-950"
                        }`}
                      >
                        {item.task}
                      </p>


                      {item.owner && (
                        <div className="mt-2 flex items-center gap-2 text-sm text-ink-500">
                          <User className="h-4 w-4" />

                          <span>
                            <span className="font-semibold">
                              AI Owner:
                            </span>{" "}
                            {item.owner}
                          </span>
                        </div>
                      )}


                      <div className="mt-4">
                        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-ink-500">
                          Assign to employee
                        </label>

                        <select
                          value={assignedUserId}
                          onChange={(e) =>
                            handleAssignActionItem(
                              index,
                              e.target.value
                            )
                          }
                          disabled={
                            !canManageTasks ||
                            savingAssignment === index
                          }
                          className="w-full max-w-sm rounded-lg border border-cloud-200 bg-white px-3 py-2 text-sm font-medium text-ink-900 transition focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <option value="">
                            Unassigned
                          </option>

                          {teamMembers.map(
                            (member) => {
                              const user =
                                member.user;

                              if (!user) {
                                return null;
                              }

                              return (
                                <option
                                  key={user._id}
                                  value={user._id}
                                >
                                  {user.name} (
                                  {member.role})
                                </option>
                              );
                            }
                          )}
                        </select>

                        {!canManageTasks && (
                          <p className="mt-1.5 text-xs font-semibold text-ink-500">
                            Only team owners and admins
                            can assign tasks.
                          </p>
                        )}

                        {savingAssignment ===
                          index && (
                          <p className="mt-1.5 text-xs font-semibold text-brand-600">
                            Saving assignment...
                          </p>
                        )}
                      </div>


                      {item.assignedTo && (
                        <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-success-50 px-3 py-2 text-xs font-bold text-success-700">
                          <CheckCircle2 className="h-4 w-4" />

                          {isAssignedToCurrentUser
                            ? "Assigned to you"
                            : `Assigned to ${
                                item.assignedTo
                                  ?.name ||
                                "team member"
                              }`}
                        </div>
                      )}

                      {!item.assignedTo && (
                        <p className="mt-2 text-xs font-semibold text-ink-500">
                          Waiting for a team owner or
                          admin to assign this task.
                        </p>
                      )}


                      {item.deadline && (
                        <div className="mt-2 text-sm text-ink-500">
                          <span className="font-semibold">
                            Deadline:
                          </span>{" "}
                          {new Date(
                            item.deadline
                          ).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>


      {meeting.decisions &&
        meeting.decisions.length > 0 && (
          <div className="overflow-hidden rounded-panel border border-cloud-200/80 bg-white shadow-panel">
            <div className="border-b border-cloud-100 bg-cloud-50/70 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-brand-50 p-2">
                  <Lightbulb className="h-5 w-5 text-brand-600" />
                </div>

                <h2 className="text-base font-extrabold text-ink-950">
                  Decisions
                </h2>

                <span className="ml-auto inline-flex items-center rounded-full bg-brand-50 px-3 py-1 text-xs font-extrabold text-brand-700">
                  {meeting.decisions.length}
                </span>
              </div>
            </div>

            <div className="divide-y divide-cloud-100">
              {meeting.decisions.map(
                (decision, index) => (
                  <div
                    key={index}
                    className="px-6 py-4 transition duration-200 hover:bg-cloud-50"
                  >
                    <p className="text-sm text-ink-700">
                      {decision}
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        )}


      <div className="overflow-hidden rounded-panel border border-cloud-200/80 bg-white shadow-panel">
        <div className="border-b border-cloud-100 bg-cloud-50/70 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-brand-50 p-2">
              <MessageSquare className="h-5 w-5 text-brand-600" />
            </div>

            <h2 className="text-base font-extrabold text-ink-950">
              Discussion
            </h2>

            {comments.length > 0 && (
              <span className="ml-auto inline-flex items-center rounded-full bg-brand-50 px-3 py-1 text-xs font-extrabold text-brand-700">
                {comments.length}
              </span>
            )}
          </div>
        </div>

        <div className="p-6">

          {commentsLoading ? (
            <div className="space-y-4">
              <div className="animate-pulse">
                <div className="h-4 w-32 rounded bg-cloud-100" />

                <div className="mt-2 h-12 rounded-lg bg-cloud-100" />
              </div>

              <div className="animate-pulse">
                <div className="h-4 w-40 rounded bg-cloud-100" />

                <div className="mt-2 h-12 rounded-lg bg-cloud-100" />
              </div>
            </div>
          ) : comments.length === 0 ? (
            <div className="rounded-lg border border-dashed border-cloud-200 bg-cloud-50/50 p-6 text-center">
              <MessageSquare className="mx-auto h-8 w-8 text-cloud-300" />

              <p className="mt-3 text-sm font-semibold text-ink-500">
                No discussion yet.
              </p>

              <p className="mt-1 text-xs text-ink-500">
                Start the conversation about this
                meeting.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {comments.map((comment) => {
                const isCurrentUser =
                  comment.author?._id?.toString() ===
                  currentUser?.id?.toString();

                return (
                  <div
                    key={comment._id}
                    className="flex gap-3"
                  >
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                      <User className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-extrabold text-ink-950">
                          {comment.author?.name ||
                            "Team Member"}
                        </p>

                        {isCurrentUser && (
                          <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-700">
                            You
                          </span>
                        )}

                        <span className="text-xs text-ink-500">
                          {new Date(
                            comment.createdAt
                          ).toLocaleString(
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

                      <div className="mt-1 rounded-lg bg-cloud-50 px-4 py-3">
                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink-700">
                          {comment.text}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}


          {commentsError && (
            <div className="mt-4 rounded-lg border border-danger-50 bg-danger-50 p-3">
              <p className="text-sm font-semibold text-danger-600">
                {commentsError}
              </p>
            </div>
          )}


          <form
            onSubmit={handleAddComment}
            className="mt-6 border-t border-cloud-100 pt-5"
          >
            <div className="flex gap-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-extrabold text-white">
                {currentUser?.name
                  ? currentUser.name
                      .charAt(0)
                      .toUpperCase()
                  : "U"}
              </div>

              <div className="min-w-0 flex-1">
                <textarea
                  value={commentText}
                  onChange={(e) =>
                    setCommentText(e.target.value)
                  }
                  maxLength={2000}
                  rows={3}
                  placeholder="Write a comment..."
                  className="w-full resize-none rounded-lg border border-cloud-200 bg-white px-4 py-3 text-sm text-ink-900 placeholder:text-ink-500 transition duration-200 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-50"
                />

                <div className="mt-2 flex items-center justify-between gap-3">
                  <span className="text-xs text-ink-500">
                    {commentText.length}/2000
                  </span>

                  <button
                    type="submit"
                    disabled={
                      postingComment ||
                      !commentText.trim()
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-extrabold text-white transition duration-200 hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />

                    {postingComment
                      ? "Posting..."
                      : "Comment"}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>


      <div className="overflow-hidden rounded-panel border border-cloud-200/80 bg-white shadow-panel">
        <div className="border-b border-cloud-100 bg-cloud-50/70 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-brand-50 p-2">
              <MessageSquare className="h-5 w-5 text-brand-600" />
            </div>

            <h2 className="text-base font-extrabold text-ink-950">
              Transcript
            </h2>
          </div>
        </div>

        <div className="space-y-4 p-6">
          <textarea
            value={transcript}
            onChange={(e) =>
              setTranscript(e.target.value)
            }
            placeholder="Paste meeting transcript here to analyze..."
            className="w-full resize-none rounded-lg border border-cloud-200 bg-white px-4 py-3 text-sm text-ink-900 placeholder:text-ink-500 transition duration-200 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-50"
            rows={8}
          />

          <button
            type="button"
            onClick={handleAnalyze}
            disabled={
              analyzing || !transcript.trim()
            }
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-5 py-3 text-sm font-extrabold text-white transition duration-200 hover:bg-brand-700 active:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
          >
            <Sparkles className="h-5 w-5" />

            {analyzing
              ? "Analyzing..."
              : "Analyze Meeting"}
          </button>

          {analyzing && (
            <div className="rounded-lg border border-brand-100 bg-brand-50 p-4">
              <p className="text-sm font-semibold text-brand-700">
                AI is analyzing your meeting. This may take a moment...
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8">
        <ActivityFeed meetingId={meeting?._id} />
      </div>
    </div>
  );
}

export default MeetingDetails;