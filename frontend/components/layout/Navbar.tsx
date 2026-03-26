"use client";

import { Menu, Moon, Sun } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMounted } from "@/hooks/useMounted";
import { NotificationBell } from "@/components/ui/NotificationBell";
import { ApiError, deleteStudentNotification, getStudentNotifications, markStudentNotification } from "@/lib/api";
import { NotificationItem, Role } from "@/types";

export function ThemeToggle() {
  const [theme, setTheme] = useState("light");
  const mounted = useMounted();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("theme");
      const isDark = stored === "dark" || document.documentElement.classList.contains("dark");
      if (isDark) {
        document.documentElement.classList.add("dark");
      }
      setTheme(isDark ? "dark" : "light");
    }
  }, []);

  const toggleTheme = () => {
    if (theme === "light") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setTheme("dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setTheme("light");
    }
  };

  if (!mounted) return <div className="h-10 w-10" />;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition-all duration-300 ease-in-out hover:scale-105 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
      aria-label="Toggle Theme"
    >
      {theme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
    </button>
  );
}

export function Navbar({
  title,
  subtitle,
  userName,
  role,
  notifications = 0,
  onMenuClick,
}: {
  title: string;
  subtitle?: string;
  userName?: string;
  role?: Role;
  notifications?: number;
  onMenuClick: () => void;
}) {
  const router = useRouter();
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifError, setNotifError] = useState("");
  const [items, setItems] = useState<NotificationItem[]>([]);

  const unreadCount = useMemo(() => {
    if (items.length === 0) return notifications;
    return items.filter((n) => !n.is_read).length;
  }, [items, notifications]);

  useEffect(() => {
    if (!notifOpen || role !== "student") return;
    let isMounted = true;

    async function load() {
      setNotifLoading(true);
      setNotifError("");
      try {
        const payload = await getStudentNotifications();
        if (!isMounted) return;
        setItems(payload.notifications);
      } catch (err: unknown) {
        if (isMounted) {
          setNotifError(err instanceof ApiError ? err.message : "Failed to load notifications.");
        }
      } finally {
        if (isMounted) setNotifLoading(false);
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, [notifOpen, role]);

  async function onMarkRead(item: NotificationItem) {
    if (!item.id) return;
    const updated = await markStudentNotification(item.id, true);
    setItems((prev) => prev.map((n) => (n.id === updated.id ? { ...n, ...updated } : n)));
  }

  async function onDelete(item: NotificationItem) {
    if (!item.id) return;
    await deleteStudentNotification(item.id);
    setItems((prev) => prev.filter((n) => n.id !== item.id));
  }

  return (
    <header className="sticky top-0 z-20 mb-6 w-full rounded-2xl bg-panel/80 p-4 shadow-sm backdrop-blur-xl ring-1 ring-slate-200/50 dark:ring-slate-800/50">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 transition-all duration-300 ease-in-out hover:scale-105 md:hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            onClick={onMenuClick}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-white">{title}</h1>
            {subtitle && <p className="mt-0.5 text-xs text-slate-500 sm:text-sm dark:text-slate-400">{subtitle}</p>}
          </div>
        </div>

        <div className="relative flex items-center gap-3 sm:gap-4">
          <ThemeToggle />
          <NotificationBell count={unreadCount} onClick={() => setNotifOpen((prev) => !prev)} />
          <div className="hidden shrink-0 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-2 pr-3 sm:flex dark:border-slate-800 dark:bg-slate-900/50">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 font-bold text-white shadow-inner">
              {userName ? userName.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="text-sm">
              <p className="font-semibold leading-tight text-slate-800 dark:text-slate-200">{userName || "User"}</p>
              <button
                type="button"
                onClick={() => router.push(role === "teacher" ? "/teacher/settings" : "/student/settings")}
                className="text-[11px] leading-tight text-slate-500 transition-colors hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400"
              >
                Profile Settings
              </button>
            </div>
          </div>

          {notifOpen && (
            <div className="absolute right-0 top-12 z-40 w-80 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-2 flex items-center justify-between px-1">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Notifications</h3>
                {role === "student" && (
                  <Link href="/student/history" className="text-xs font-medium text-brand-600 hover:text-brand-500">
                    View all
                  </Link>
                )}
              </div>

              {role !== "student" ? (
                <p className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-800/70 dark:text-slate-300">No notifications for this role yet.</p>
              ) : notifLoading ? (
                <p className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-800/70 dark:text-slate-300">Loading notifications...</p>
              ) : notifError ? (
                <p className="rounded-xl bg-rose-50 p-3 text-xs text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">{notifError}</p>
              ) : items.length === 0 ? (
                <p className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-800/70 dark:text-slate-300">You are all caught up.</p>
              ) : (
                <ul className="max-h-80 space-y-2 overflow-auto pr-1">
                  {items.map((item) => (
                    <li key={item.id} className="rounded-xl border border-slate-100 p-3 dark:border-slate-800/70">
                      <p className="text-xs font-semibold text-slate-900 dark:text-white">{item.title}</p>
                      <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{item.message}</p>
                      <div className="mt-2 flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => void onMarkRead(item)}
                          className="text-xs font-medium text-brand-600 hover:text-brand-500"
                        >
                          Mark read
                        </button>
                        <button
                          type="button"
                          onClick={() => void onDelete(item)}
                          className="text-xs font-medium text-rose-600 hover:text-rose-500"
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
