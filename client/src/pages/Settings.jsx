import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  Download,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Database,
  KeyRound,
  Loader2,
} from "lucide-react";

import { authFetch, getUser, logout, saveUser } from "../utils/auth";

const inputClass =
  "mt-1.5 w-full rounded-lg border border-cloud-200 bg-white px-3.5 py-2.5 text-sm text-ink-900 outline-none transition placeholder:text-ink-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-50 disabled:cursor-not-allowed disabled:bg-cloud-50 disabled:text-ink-500";

const primaryButton =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 disabled:cursor-not-allowed disabled:opacity-60";

const secondaryButton =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-cloud-200 bg-white px-4 py-2.5 text-sm font-bold text-ink-700 transition hover:bg-cloud-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 disabled:cursor-not-allowed disabled:opacity-60";

const dangerButton =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-danger-600 px-4 py-2.5 text-sm font-bold text-white transition hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger-600 disabled:cursor-not-allowed disabled:opacity-60";

function errorText(error) {
  return error instanceof TypeError
    ? "Can't reach the server. Make sure it is running."
    : error.message || "Something went wrong. Please try again.";
}

function Notice({ notice }) {
  if (!notice) return null;

  const isSuccess = notice.type === "success";

  return (
    <div
      role={isSuccess ? "status" : "alert"}
      className={`flex items-start gap-2.5 rounded-lg px-4 py-3 text-sm font-semibold ${
        isSuccess
          ? "bg-success-50 text-success-600"
          : "bg-danger-50 text-danger-600"
      }`}
    >
      {isSuccess ? (
        <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
      ) : (
        <AlertCircle size={18} className="mt-0.5 shrink-0" />
      )}
      <span>{notice.text}</span>
    </div>
  );
}

function Field({ id, label, hint, ...inputProps }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-bold text-ink-900">
        {label}
      </label>
      <input id={id} className={inputClass} {...inputProps} />
      {hint && <p className="mt-1.5 text-xs text-ink-500">{hint}</p>}
    </div>
  );
}

function Card({ icon: Icon, title, description, danger = false, children }) {
  return (
    <section
      className={`rounded-panel border bg-white shadow-panel ${
        danger ? "border-danger-600/25" : "border-cloud-200"
      }`}
    >
      <header className="flex items-start gap-3 border-b border-cloud-100 px-5 py-5 sm:px-6">
        <Icon
          size={20}
          className={`mt-0.5 shrink-0 ${
            danger ? "text-danger-600" : "text-ink-500"
          }`}
          aria-hidden="true"
        />
        <div>
          <h2
            className={`text-base font-extrabold ${
              danger ? "text-danger-600" : "text-ink-950"
            }`}
          >
            {title}
          </h2>
          <p className="mt-1 text-sm text-ink-500">{description}</p>
        </div>
      </header>
      <div className="px-5 py-6 sm:px-6">{children}</div>
    </section>
  );
}

const Settings = () => {
  const navigate = useNavigate();
  const storedUser = getUser();

  const [name, setName] = useState(storedUser?.name || "");
  const [email, setEmail] = useState(storedUser?.email || "");
  const [profileNotice, setProfileNotice] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordNotice, setPasswordNotice] = useState(null);
  const [savingPassword, setSavingPassword] = useState(false);

  const [exportNotice, setExportNotice] = useState(null);
  const [exporting, setExporting] = useState(false);

  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteNotice, setDeleteNotice] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await authFetch("/api/auth/me");
        if (!response.ok) return;
        const data = await response.json();
        setName(data.user.name || "");
        setEmail(data.user.email || "");
      } catch {
        // Keep browser values if server is unavailable
      }
    };

    loadProfile();
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileNotice(null);

    if (!name.trim()) {
      setProfileNotice({ type: "error", text: "Enter your name." });
      return;
    }

    try {
      setSavingProfile(true);

      const response = await authFetch("/api/auth/me", {
        method: "PUT",
        body: JSON.stringify({ name: name.trim() }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Could not save your name.");
      }

      saveUser({ ...getUser(), ...data.user });
      setName(data.user.name);

      setProfileNotice({
        type: "success",
        text: "Your profile has been updated.",
      });
    } catch (error) {
      setProfileNotice({ type: "error", text: errorText(error) });
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordNotice(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordNotice({
        type: "error",
        text: "Fill in all three password fields.",
      });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordNotice({
        type: "error",
        text: "Use a new password with at least 6 characters.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordNotice({
        type: "error",
        text: "The new passwords don't match.",
      });
      return;
    }

    try {
      setSavingPassword(true);

      const response = await authFetch("/api/auth/password", {
        method: "PUT",
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Could not change your password.");
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setPasswordNotice({
        type: "success",
        text: "Your password has been changed successfully.",
      });
    } catch (error) {
      setPasswordNotice({ type: "error", text: errorText(error) });
    } finally {
      setSavingPassword(false);
    }
  };

  const handleExport = async () => {
    setExportNotice(null);

    try {
      setExporting(true);

      const response = await authFetch("/api/meetings");

      if (!response.ok) {
        throw new Error("Could not load your meetings.");
      }

      const meetings = await response.json();

      const backup = {
        exportedAt: new Date().toISOString(),
        account: { name, email },
        meetings: meetings.map((meeting) => ({
          title: meeting.title,
          date: meeting.date,
          description: meeting.description,
          transcript: meeting.transcript,
          summary: meeting.summary,
          decisions: meeting.decisions,
          actionItems: (meeting.actionItems || []).map((item) => ({
            task: item.task,
            owner: item.owner,
            deadline: item.deadline,
            completed: item.completed,
          })),
          createdAt: meeting.createdAt,
        })),
      };

      const blob = new Blob([JSON.stringify(backup, null, 2)], {
        type: "application/json",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `meetingflow-export-${new Date()
        .toISOString()
        .slice(0, 10)}.json`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(url);

      setExportNotice({
        type: "success",
        text:
          meetings.length === 1
            ? "Downloaded 1 meeting."
            : `Downloaded ${meetings.length} meetings.`,
      });
    } catch (error) {
      setExportNotice({ type: "error", text: errorText(error) });
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    setDeleteNotice(null);

    if (!deletePassword) {
      setDeleteNotice({
        type: "error",
        text: "Enter your password to confirm.",
      });
      return;
    }

    try {
      setDeleting(true);

      const response = await authFetch("/api/auth/me", {
        method: "DELETE",
        body: JSON.stringify({ password: deletePassword }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Could not delete your account.");
      }

      logout();
      navigate("/", { replace: true });
    } catch (error) {
      setDeleteNotice({ type: "error", text: errorText(error) });
      setDeleting(false);
    }
  };

  const cancelDelete = () => {
    setConfirmingDelete(false);
    setDeletePassword("");
    setDeleteNotice(null);
  };

  const avatarLetter = name?.trim()?.charAt(0)?.toUpperCase() || "U";

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-16">
      {/* ---------- Header ---------- */}
      <header className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink-950 sm:text-3xl">
            Settings
          </h1>
          <p className="mt-1.5 text-sm text-ink-500">
            Manage your profile, security, and Meetwise data.
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-cloud-200 bg-white px-4 py-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-extrabold text-brand-700">
            {avatarLetter}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-ink-950">
              {name || "User"}
            </p>
            <p className="truncate text-xs text-ink-500">
              {email || "No email"}
            </p>
          </div>
          <span className="ml-2 rounded-full bg-success-50 px-2.5 py-0.5 text-xs font-bold text-success-600">
            Active
          </span>
        </div>
      </header>

      {/* ---------- Profile ---------- */}
      <Card
        icon={User}
        title="Profile"
        description="Update the name associated with your Meetwise account."
      >
        <form
          onSubmit={handleProfileSubmit}
          className="max-w-md space-y-5"
          noValidate
        >
          <Field
            id="name"
            label="Full name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={savingProfile}
            placeholder="Your name"
          />

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-bold text-ink-900"
            >
              Email address
            </label>
            <div className="relative">
              <Mail
                size={16}
                className="absolute left-3.5 top-1/2 mt-0.5 -translate-y-1/2 text-ink-400"
                aria-hidden="true"
              />
              <input
                id="email"
                type="email"
                value={email}
                readOnly
                disabled
                className={`${inputClass} pl-10`}
              />
            </div>
            <p className="mt-1.5 text-xs text-ink-500">
              Your email is used to sign in and cannot be changed here.
            </p>
          </div>

          <Notice notice={profileNotice} />

          <button
            type="submit"
            disabled={savingProfile}
            className={primaryButton}
          >
            {savingProfile && <Loader2 size={16} className="animate-spin" />}
            {savingProfile ? "Saving..." : "Save changes"}
          </button>
        </form>
      </Card>

      {/* ---------- Password ---------- */}
      <Card
        icon={Lock}
        title="Password & security"
        description="Keep your account protected with a strong password."
      >
        <form
          onSubmit={handlePasswordSubmit}
          className="max-w-md space-y-5"
          noValidate
        >
          <Field
            id="currentPassword"
            label="Current password"
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            disabled={savingPassword}
            placeholder="Enter current password"
          />

          <Field
            id="newPassword"
            label="New password"
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={savingPassword}
            placeholder="At least 6 characters"
          />

          <Field
            id="confirmNewPassword"
            label="Confirm new password"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={savingPassword}
            placeholder="Repeat new password"
          />

          <Notice notice={passwordNotice} />

          <button
            type="submit"
            disabled={savingPassword}
            className={primaryButton}
          >
            {savingPassword ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <KeyRound size={16} aria-hidden="true" />
            )}
            {savingPassword ? "Changing..." : "Change password"}
          </button>
        </form>
      </Card>

      {/* ---------- Data ---------- */}
      <Card
        icon={Database}
        title="Your data"
        description="Download a backup of the meetings stored in your account."
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-bold text-ink-950">
              Export your meetings
            </h3>
            <p className="mt-1 max-w-md text-sm text-ink-500">
              Includes transcripts, summaries, decisions, and action items as
              a JSON file.
            </p>
          </div>

          <button
            type="button"
            onClick={handleExport}
            disabled={exporting}
            className={`${secondaryButton} shrink-0`}
          >
            {exporting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Download size={16} aria-hidden="true" />
            )}
            {exporting ? "Preparing..." : "Export meetings"}
          </button>
        </div>

        {exportNotice && (
          <div className="mt-5">
            <Notice notice={exportNotice} />
          </div>
        )}
      </Card>

      {/* ---------- Danger zone ---------- */}
      <Card
        icon={Trash2}
        title="Danger zone"
        description="Permanently remove your account and all associated meetings."
        danger
      >
        {!confirmingDelete ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-bold text-ink-950">
                Delete your account
              </h3>
              <p className="mt-1 max-w-md text-sm text-ink-500">
                This permanently deletes your account and all meetings
                associated with it. This action cannot be undone.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              className={`${dangerButton} shrink-0`}
            >
              <Trash2 size={16} aria-hidden="true" />
              Delete account
            </button>
          </div>
        ) : (
          <form onSubmit={handleDelete} className="max-w-md" noValidate>
            <div className="mb-5 flex gap-3 rounded-lg bg-danger-50 px-4 py-3">
              <AlertCircle
                size={18}
                className="mt-0.5 shrink-0 text-danger-600"
              />
              <div>
                <p className="text-sm font-bold text-danger-600">
                  Are you sure you want to continue?
                </p>
                <p className="mt-1 text-sm text-danger-600/80">
                  Your account and all of your Meetwise data will be
                  permanently deleted.
                </p>
              </div>
            </div>

            <Field
              id="deletePassword"
              label="Enter your password to confirm"
              type="password"
              autoComplete="current-password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              disabled={deleting}
              autoFocus
              placeholder="Enter your password"
            />

            {deleteNotice && (
              <div className="mt-5">
                <Notice notice={deleteNotice} />
              </div>
            )}

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={deleting}
                className={dangerButton}
              >
                {deleting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Trash2 size={16} aria-hidden="true" />
                )}
                {deleting ? "Deleting..." : "Permanently delete account"}
              </button>

              <button
                type="button"
                onClick={cancelDelete}
                disabled={deleting}
                className={secondaryButton}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
};

export default Settings;