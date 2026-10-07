import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  CheckCheck,
  Circle,
  Loader2,
} from "lucide-react";
import { authFetch } from "../utils/auth";

function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const dropdownRef = useRef(null);

  const fetchUnreadCount = async () => {
    const response = await authFetch(
      "/api/notifications/unread-count"
    );

    if (!response.ok) {
      throw new Error(
        "Failed to load notification count"
      );
    }

    const data = await response.json();

    return data.count || 0;
  };

  const fetchNotifications = async () => {
    const response = await authFetch(
      "/api/notifications"
    );

    if (!response.ok) {
      throw new Error(
        "Failed to load notifications"
      );
    }

    return await response.json();
  };

  useEffect(() => {
    let cancelled = false;

    fetchUnreadCount()
      .then((count) => {
        if (!cancelled) {
          setUnreadCount(count);
        }
      })
      .catch((error) => {
        console.error(
          "Failed to load notification count:",
          error
        );
      });

    const interval = setInterval(() => {
      fetchUnreadCount()
        .then((count) => {
          if (!cancelled) {
            setUnreadCount(count);
          }
        })
        .catch((error) => {
          console.error(
            "Failed to refresh notification count:",
            error
          );
        });
    }, 30000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;

    fetchNotifications()
      .then((data) => {
        if (cancelled) {
          return;
        }

        setNotifications(data);

        const unread = data.filter(
          (notification) => !notification.read
        ).length;

        setUnreadCount(unread);
      })
      .catch((error) => {
        console.error(
          "Failed to load notifications:",
          error
        );
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  const handleToggle = () => {
    if (!open) {
      setLoading(true);
    }

    setOpen(!open);
  };

  const markAsRead = async (notificationId) => {
    try {
      const response = await authFetch(
        `/api/notifications/${notificationId}/read`,
        {
          method: "PATCH",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to mark notification as read"
        );
      }

      setNotifications((current) =>
        current.map((notification) =>
          notification._id === notificationId
            ? {
                ...notification,
                read: true,
              }
            : notification
        )
      );

      setUnreadCount((count) =>
        Math.max(0, count - 1)
      );
    } catch (error) {
      console.error(
        "Failed to mark notification as read:",
        error
      );
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await authFetch(
        "/api/notifications/read-all",
        {
          method: "PATCH",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to mark all notifications as read"
        );
      }

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          read: true,
        }))
      );

      setUnreadCount(0);
    } catch (error) {
      console.error(
        "Failed to mark all notifications as read:",
        error
      );
    }
  };

  const formatDate = (date) => {
    if (!date) {
      return "";
    }

    return new Date(date).toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div
      ref={dropdownRef}
      className="relative"
    >
      <button
        type="button"
        onClick={handleToggle}
        className="relative flex h-10 w-10 items-center justify-center rounded-lg text-ink-600 transition hover:bg-cloud-100 hover:text-ink-950"
        aria-label="Notifications"
        aria-expanded={open}
      >
        <Bell className="h-5 w-5" />

        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-danger-600 px-1 text-[10px] font-extrabold text-white ring-2 ring-white">
            {unreadCount > 99
              ? "99+"
              : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-[360px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-cloud-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-cloud-100 px-4 py-3">
            <div>
              <h3 className="text-sm font-extrabold text-ink-950">
                Notifications
              </h3>

              <p className="mt-0.5 text-xs text-ink-500">
                {unreadCount > 0
                  ? `${unreadCount} unread`
                  : "You're all caught up"}
              </p>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold text-brand-600 transition hover:bg-brand-50"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center gap-2 px-4 py-10 text-sm font-semibold text-ink-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-cloud-100">
                  <Bell className="h-5 w-5 text-ink-500" />
                </div>

                <p className="mt-4 text-sm font-extrabold text-ink-900">
                  No notifications
                </p>

                <p className="mt-1 text-xs text-ink-500">
                  You're all caught up.
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`border-b border-cloud-100 transition last:border-b-0 ${
                    notification.read
                      ? "bg-white"
                      : "bg-brand-50/50"
                  }`}
                >
                  <Link
                    to={
                      notification.link ||
                      "/dashboard"
                    }
                    onClick={() => {
                      if (!notification.read) {
                        markAsRead(
                          notification._id
                        );
                      }

                      setOpen(false);
                    }}
                    className="block px-4 py-3 hover:bg-cloud-50"
                  >
                    <div className="flex gap-3">
                      <div className="mt-1 shrink-0">
                        {!notification.read ? (
                          <Circle className="h-2.5 w-2.5 fill-brand-600 text-brand-600" />
                        ) : (
                          <Circle className="h-2.5 w-2.5 text-cloud-300" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-extrabold text-ink-900">
                          {notification.title}
                        </p>

                        <p className="mt-1 text-xs leading-5 text-ink-600">
                          {notification.message}
                        </p>

                        <div className="mt-1.5 flex items-center justify-between gap-2">
                          <p className="truncate text-[11px] text-ink-400">
                            {notification.actor?.name
                              ? `By ${notification.actor.name}`
                              : ""}
                          </p>

                          <p className="shrink-0 text-[11px] text-ink-400">
                            {formatDate(
                              notification.createdAt
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>

                  {!notification.read && (
                    <div className="px-4 pb-3 pl-10">
                      <button
                        type="button"
                        onClick={() =>
                          markAsRead(
                            notification._id
                          )
                        }
                        className="text-[11px] font-bold text-brand-600 hover:underline"
                      >
                        Mark as read
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationDropdown;