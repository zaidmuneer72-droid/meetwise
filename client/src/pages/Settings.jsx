import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  Download,
  Trash2,
  ShieldCheck,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Database,
  KeyRound,
} from "lucide-react";

import { authFetch, getUser, logout, saveUser } from "../utils/auth";

const inputClass =
  "mt-2 w-full rounded-xl border border-cloud-200 bg-cloud-50/50 px-4 py-3 text-sm font-semibold text-ink-900 outline-none transition duration-200 placeholder:font-medium placeholder:text-ink-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-50 disabled:cursor-not-allowed disabled:opacity-60";

const primaryButton =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-extrabold text-white shadow-sm transition duration-200 hover:bg-brand-700 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 disabled:cursor-not-allowed disabled:opacity-60";

const secondaryButton =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-cloud-200 bg-white px-5 py-3 text-sm font-extrabold text-ink-700 shadow-sm transition duration-200 hover:border-cloud-300 hover:bg-cloud-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 disabled:cursor-not-allowed disabled:opacity-60";

const dangerButton =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-danger-600 px-5 py-3 text-sm font-extrabold text-white shadow-sm transition duration-200 hover:brightness-95 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger-600 disabled:cursor-not-allowed disabled:opacity-60";

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
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm font-semibold ${
        isSuccess
          ? "border-success-600/20 bg-success-50 text-success-600"
          : "border-danger-600/20 bg-danger-50 text-danger-600"
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

function Field({ id, label, ...inputProps }) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-bold text-ink-900"
      >
        {label}
      </label>

      <input
        id={id}
        className={inputClass}
        {...inputProps}
      />
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  description,
  tone = "brand",
}) {
  const iconStyles = {
    brand: "bg-brand-50 text-brand-600",
    neutral: "bg-cloud-100 text-ink-700",
    danger: "bg-danger-50 text-danger-600",
  };

  return (
    <div className="flex items-start gap-4">
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconStyles[tone]}`}
      >
        <Icon size={21} strokeWidth={2.2} />
      </div>

      <div>
        <h2 className="text-lg font-extrabold tracking-tight text-ink-950">
          {title}
        </h2>

        <p className="mt-1 text-sm leading-6 text-ink-500">
          {description}
        </p>
      </div>
    </div>
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
      setProfileNotice({
        type: "error",
        text: "Enter your name.",
      });

      return;
    }

    try {
      setSavingProfile(true);

      const response = await authFetch("/api/auth/me", {
        method: "PUT",
        body: JSON.stringify({
          name: name.trim(),
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || "Could not save your name."
        );
      }

      saveUser({
        ...getUser(),
        ...data.user,
      });

      setName(data.user.name);

      setProfileNotice({
        type: "success",
        text: "Your profile has been updated.",
      });
    } catch (error) {
      setProfileNotice({
        type: "error",
        text: errorText(error),
      });
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
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || "Could not change your password."
        );
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setPasswordNotice({
        type: "success",
        text: "Your password has been changed successfully.",
      });
    } catch (error) {
      setPasswordNotice({
        type: "error",
        text: errorText(error),
      });
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

        account: {
          name,
          email,
        },

        meetings: meetings.map((meeting) => ({
          title: meeting.title,
          date: meeting.date,
          description: meeting.description,
          transcript: meeting.transcript,
          summary: meeting.summary,
          decisions: meeting.decisions,

          actionItems: (meeting.actionItems || []).map(
            (item) => ({
              task: item.task,
              owner: item.owner,
              deadline: item.deadline,
              completed: item.completed,
            })
          ),

          createdAt: meeting.createdAt,
        })),
      };

      const blob = new Blob(
        [JSON.stringify(backup, null, 2)],
        {
          type: "application/json",
        }
      );

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
      setExportNotice({
        type: "error",
        text: errorText(error),
      });
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
        body: JSON.stringify({
          password: deletePassword,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || "Could not delete your account."
        );
      }

      logout();

      navigate("/", {
        replace: true,
      });
    } catch (error) {
      setDeleteNotice({
        type: "error",
        text: errorText(error),
      });

      setDeleting(false);
    }
  };

  const cancelDelete = () => {
    setConfirmingDelete(false);
    setDeletePassword("");
    setDeleteNotice(null);
  };

  const avatarLetter =
    name?.trim()?.charAt(0)?.toUpperCase() || "U";

  return (
    <div className="mx-auto max-w-6xl pb-10">


      <div className="mb-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-bold text-brand-600">
              <ShieldCheck size={16} />
              Account settings
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-ink-950 sm:text-4xl">
              Settings
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-ink-500 sm:text-base">
              Manage your profile, security, and Meetwise data.
            </p>
          </div>


          <div className="flex items-center gap-3 rounded-2xl border border-cloud-200 bg-white px-4 py-3 shadow-sm">

            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-100 text-base font-extrabold text-brand-700">
              {avatarLetter}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-extrabold text-ink-950">
                {name || "User"}
              </p>

              <p className="max-w-[190px] truncate text-xs text-ink-500">
                {email || "No email"}
              </p>
            </div>

          </div>

        </div>
      </div>


      <div className="grid gap-6 lg:grid-cols-2">


        <section className="rounded-2xl border border-cloud-200 bg-white p-6 shadow-panel sm:p-7">

          <SectionHeader
            icon={User}
            title="Profile"
            description="Update the name associated with your Meetwise account."
          />

          <form
            onSubmit={handleProfileSubmit}
            className="mt-7 space-y-5"
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
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400"
                />

                <input
                  id="email"
                  type="email"
                  value={email}
                  readOnly
                  disabled
                  className={`${inputClass} pl-11`}
                />
              </div>

              <p className="mt-2 text-xs text-ink-500">
                Your email is used to sign in and cannot be changed here.
              </p>
            </div>

            <Notice notice={profileNotice} />

            <button
              type="submit"
              disabled={savingProfile}
              className={primaryButton}
            >
              {savingProfile ? "Saving..." : "Save changes"}

              {!savingProfile && (
                <ChevronRight size={16} />
              )}
            </button>

          </form>
        </section>


        <section className="rounded-2xl border border-cloud-200 bg-white p-6 shadow-panel sm:p-7">

          <SectionHeader
            icon={Lock}
            title="Password & security"
            description="Keep your Meetwise account protected with a strong password."
          />

          <form
            onSubmit={handlePasswordSubmit}
            className="mt-7 space-y-5"
            noValidate
          >

            <Field
              id="currentPassword"
              label="Current password"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) =>
                setCurrentPassword(e.target.value)
              }
              disabled={savingPassword}
              placeholder="Enter current password"
            />

            <Field
              id="newPassword"
              label="New password"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) =>
                setNewPassword(e.target.value)
              }
              disabled={savingPassword}
              placeholder="At least 6 characters"
            />

            <Field
              id="confirmNewPassword"
              label="Confirm new password"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
              disabled={savingPassword}
              placeholder="Repeat new password"
            />

            <Notice notice={passwordNotice} />

            <button
              type="submit"
              disabled={savingPassword}
              className={primaryButton}
            >
              <KeyRound size={17} />

              {savingPassword
                ? "Changing..."
                : "Change password"}
            </button>

          </form>
        </section>


        <section className="rounded-2xl border border-cloud-200 bg-white p-6 shadow-panel sm:p-7">

          <SectionHeader
            icon={Database}
            title="Your data"
            description="Download a backup of the meetings and information stored in your account."
            tone="neutral"
          />

          <div className="mt-7">

            <div className="rounded-xl border border-cloud-200 bg-cloud-50/60 p-5">

              <div className="flex items-start gap-4">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-ink-700 shadow-sm">
                  <Download size={19} />
                </div>

                <div>
                  <h3 className="text-sm font-extrabold text-ink-950">
                    Export your meetings
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-ink-500">
                    Download your meetings, transcripts, summaries,
                    decisions, and action items as a JSON backup.
                  </p>
                </div>

              </div>

            </div>

            <div className="mt-5">
              <Notice notice={exportNotice} />
            </div>

            <button
              type="button"
              onClick={handleExport}
              disabled={exporting}
              className={`${secondaryButton} mt-5`}
            >
              <Download size={17} />

              {exporting
                ? "Preparing backup..."
                : "Export my meetings"}
            </button>

          </div>
        </section>


        <section className="rounded-2xl border border-cloud-200 bg-white p-6 shadow-panel sm:p-7">

          <SectionHeader
            icon={ShieldCheck}
            title="Account"
            description="Information about your current Meetwise account."
            tone="neutral"
          />

          <div className="mt-7 space-y-3">

            <div className="flex items-center justify-between rounded-xl border border-cloud-200 bg-cloud-50/60 px-4 py-4">
              <div className="flex items-center gap-3">
                <User
                  size={18}
                  className="text-ink-500"
                />

                <span className="text-sm font-bold text-ink-700">
                  Account name
                </span>
              </div>

              <span className="max-w-[180px] truncate text-sm font-extrabold text-ink-950">
                {name || "—"}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-cloud-200 bg-cloud-50/60 px-4 py-4">
              <div className="flex items-center gap-3">
                <Mail
                  size={18}
                  className="text-ink-500"
                />

                <span className="text-sm font-bold text-ink-700">
                  Email
                </span>
              </div>

              <span className="max-w-[180px] truncate text-sm font-extrabold text-ink-950">
                {email || "—"}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-success-600/15 bg-success-50 px-4 py-4">
              <div className="flex items-center gap-3">
                <CheckCircle2
                  size={18}
                  className="text-success-600"
                />

                <span className="text-sm font-bold text-success-600">
                  Account status
                </span>
              </div>

              <span className="rounded-full bg-success-600/10 px-3 py-1 text-xs font-extrabold text-success-600">
                Active
              </span>
            </div>

          </div>
        </section>

      </div>


      <section className="mt-6 overflow-hidden rounded-2xl border border-danger-600/20 bg-white shadow-panel">

        <div className="border-b border-danger-600/10 bg-danger-50/60 px-6 py-5 sm:px-7">

          <div className="flex items-start gap-4">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-danger-600/10 text-danger-600">
              <Trash2 size={21} />
            </div>

            <div>
              <h2 className="text-lg font-extrabold tracking-tight text-danger-600">
                Danger zone
              </h2>

              <p className="mt-1 text-sm leading-6 text-danger-600/75">
                Permanently remove your account and all associated meetings.
              </p>
            </div>

          </div>

        </div>

        <div className="p-6 sm:p-7">

          {!confirmingDelete ? (

            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <h3 className="text-sm font-extrabold text-ink-950">
                  Delete your account
                </h3>

                <p className="mt-1 max-w-2xl text-sm leading-6 text-ink-500">
                  This permanently deletes your account and all meetings
                  associated with it. This action cannot be undone.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setConfirmingDelete(true)}
                className={dangerButton}
              >
                <Trash2 size={17} />
                Delete account
              </button>

            </div>

          ) : (

            <form
              onSubmit={handleDelete}
              className="max-w-xl"
              noValidate
            >

              <div className="mb-5 rounded-xl border border-danger-600/20 bg-danger-50 px-4 py-4">

                <div className="flex gap-3">

                  <AlertCircle
                    size={19}
                    className="mt-0.5 shrink-0 text-danger-600"
                  />

                  <div>
                    <p className="text-sm font-extrabold text-danger-600">
                      Are you sure you want to continue?
                    </p>

                    <p className="mt-1 text-sm leading-6 text-danger-600/80">
                      Your account and all of your Meetwise data
                      will be permanently deleted.
                    </p>
                  </div>

                </div>

              </div>

              <Field
                id="deletePassword"
                label="Enter your password to confirm"
                type="password"
                autoComplete="current-password"
                value={deletePassword}
                onChange={(e) =>
                  setDeletePassword(e.target.value)
                }
                disabled={deleting}
                autoFocus
                placeholder="Enter your password"
              />

              <div className="mt-5">
                <Notice notice={deleteNotice} />
              </div>

              <div className="mt-5 flex flex-wrap gap-3">

                <button
                  type="submit"
                  disabled={deleting}
                  className={dangerButton}
                >
                  <Trash2 size={17} />

                  {deleting
                    ? "Deleting..."
                    : "Permanently delete account"}
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

        </div>

      </section>

    </div>
  );
};

export default Settings;