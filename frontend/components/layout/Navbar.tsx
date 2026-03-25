"use client";

import { Menu, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useMounted } from "@/hooks/useMounted";
import { NotificationBell } from "@/components/ui/NotificationBell";

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
      className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
      aria-label="Toggle Theme"
    >
      {theme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
    </button>
  );
}

export function Navbar({ title, subtitle, userName, notifications = 0, onMenuClick }: { title: string; subtitle?: string; userName?: string; notifications?: number; onMenuClick: () => void }) {
  return (
    <header className="sticky top-0 z-20 mb-6 w-full rounded-2xl bg-panel/80 p-4 shadow-sm backdrop-blur-xl ring-1 ring-slate-200/50 dark:ring-slate-800/50">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 md:hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
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

        <div className="flex items-center gap-3 sm:gap-4">
          <ThemeToggle />
          <NotificationBell count={notifications} />
          <div className="hidden shrink-0 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-2 pr-3 sm:flex dark:border-slate-800 dark:bg-slate-900/50">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 font-bold text-white shadow-inner">
              {userName ? userName.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="text-sm">
              <p className="font-semibold leading-tight text-slate-800 dark:text-slate-200">{userName || "User"}</p>
              <p className="text-[11px] leading-tight text-slate-500 dark:text-slate-400">Profile</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
