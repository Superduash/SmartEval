"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "./Navbar";
import { Sidebar, NavItem } from "./Sidebar";
import { motion } from "framer-motion";
import {
  BookOpen,
  Brain,
  ChartColumnBig,
  ClipboardCheck,
  House,
  History,
  LineChart,
  Upload,
  Users,
} from "lucide-react";
import { Role } from "@/types";
import { LoaderSpinner } from "@/components/ui";
import { clearApiCache, getStudentNotifications, me } from "@/lib/api";

const AUTH_PROFILE_CACHE_KEY = "se_auth_profile_cache";
const AUTH_PROFILE_CACHE_TTL_MS = 5 * 60 * 1000;

type CachedProfile = {
  role: Role;
  name?: string;
  cachedAt: number;
};

function readCachedProfile(): CachedProfile | null {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(AUTH_PROFILE_CACHE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as CachedProfile;
    if (!parsed.role || !parsed.cachedAt) return null;
    if (Date.now() - parsed.cachedAt > AUTH_PROFILE_CACHE_TTL_MS) {
      window.sessionStorage.removeItem(AUTH_PROFILE_CACHE_KEY);
      return null;
    }
    return parsed;
  } catch {
    window.sessionStorage.removeItem(AUTH_PROFILE_CACHE_KEY);
    return null;
  }
}

function writeCachedProfile(profile: { role: Role; name?: string }): void {
  if (typeof window === "undefined") return;
  const nextValue: CachedProfile = {
    role: profile.role,
    name: profile.name,
    cachedAt: Date.now(),
  };
  window.sessionStorage.setItem(AUTH_PROFILE_CACHE_KEY, JSON.stringify(nextValue));
}

interface DashboardLayoutProps {
  role?: Role;
  title?: string;
  subtitle?: string;
  userName?: string;
  notifications?: number;
  items?: NavItem[];
  children: React.ReactNode;
}

const ROLE_DEFAULTS: Record<Role, { title: string; subtitle: string; items: NavItem[] }> = {
  teacher: {
    title: "Teacher Workspace",
    subtitle: "Evaluate papers, track outcomes, and export insights.",
    items: [
      { label: "Dashboard", href: "/teacher", icon: <House className="h-5 w-5" /> },
      { label: "Upload", href: "/teacher/upload", icon: <Upload className="h-5 w-5" /> },
      { label: "Results", href: "/teacher/results", icon: <ClipboardCheck className="h-5 w-5" /> },
      { label: "Analytics", href: "/teacher/analytics", icon: <ChartColumnBig className="h-5 w-5" /> },
    ],
  },
  student: {
    title: "Student Workspace",
    subtitle: "Track progress, train weak areas, and stay consistent.",
    items: [
      { label: "Dashboard", href: "/student", icon: <House className="h-5 w-5" /> },
      { label: "Upload", href: "/student/upload", icon: <Upload className="h-5 w-5" /> },
      { label: "Marks", href: "/student/marks", icon: <ClipboardCheck className="h-5 w-5" /> },
      { label: "Analytics", href: "/student/analytics", icon: <LineChart className="h-5 w-5" /> },
      { label: "Trainer", href: "/student/trainer", icon: <Brain className="h-5 w-5" /> },
      { label: "Parent", href: "/student/parent", icon: <Users className="h-5 w-5" /> },
      { label: "History", href: "/student/history", icon: <History className="h-5 w-5" /> },
      { label: "Results", href: "/student/results", icon: <BookOpen className="h-5 w-5" /> },
    ],
  },
};

export function DashboardLayout({ role, title, subtitle, userName, notifications, items, children }: DashboardLayoutProps) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [resolvedUserName, setResolvedUserName] = useState(userName || "");
  const [resolvedNotifications, setResolvedNotifications] = useState(notifications ?? 0);
  const [authReady, setAuthReady] = useState(role ? false : true);

  const roleDefaults = role ? ROLE_DEFAULTS[role] : undefined;
  const resolvedItems = useMemo(() => items || roleDefaults?.items || [], [items, roleDefaults]);
  const resolvedTitle = title || roleDefaults?.title || "Dashboard";
  const resolvedSubtitle = subtitle || roleDefaults?.subtitle;

  useEffect(() => {
    let isMounted = true;
    const cachedProfile = readCachedProfile();

    async function hydrateUserContext() {
      if (!role) {
        if (isMounted) setAuthReady(true);
        return;
      }

      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        clearApiCache();
        router.replace("/auth/login");
        return;
      }

      if (cachedProfile?.role === role) {
        if (!userName && cachedProfile.name) {
          setResolvedUserName(cachedProfile.name);
        }
        if (isMounted) {
          setAuthReady(true);
        }
      }

      try {
        const profile = await me();
        if (!isMounted) return;

        if (profile.role !== role) {
          router.replace(profile.role === "teacher" ? "/teacher" : "/student");
          return;
        }

        writeCachedProfile({ role: profile.role, name: profile.name });

        if (!userName) {
          setResolvedUserName(profile.name || "User");
        }

        const pending: Promise<void>[] = [];

        if (role === "student" && notifications === undefined) {
          pending.push(
            getStudentNotifications().then((payload) => {
              if (isMounted) {
                setResolvedNotifications(payload.notifications.length);
              }
            })
          );
        }

        if (pending.length > 0) {
          await Promise.all(pending);
        }

        if (isMounted) {
          setAuthReady(true);
        }
      } catch {
        if (cachedProfile?.role === role) {
          if (isMounted) {
            setAuthReady(true);
          }
          return;
        }

        localStorage.removeItem("token");
        clearApiCache();
        router.replace("/auth/login");
      }
    }

    hydrateUserContext();

    return () => {
      isMounted = false;
    };
  }, [notifications, role, router, userName]);

  if (!authReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-app text-app-text">
        <LoaderSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app text-app-text selection:bg-brand-200 dark:selection:bg-brand-900">
      <div className="mx-auto flex w-full max-w-[1600px] gap-6 p-4 sm:p-6 lg:p-8">
        <Sidebar
          items={resolvedItems}
          open={sidebarOpen}
          setOpen={setSidebarOpen}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
        />

        <main className="flex min-w-0 flex-1 flex-col">
          <Navbar
            title={resolvedTitle}
            subtitle={resolvedSubtitle}
            userName={resolvedUserName || userName || "User"}
            notifications={resolvedNotifications}
            onMenuClick={() => setSidebarOpen(true)}
          />

          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.14, ease: "easeOut" }}
            className="flex-1 space-y-6 pb-12"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
