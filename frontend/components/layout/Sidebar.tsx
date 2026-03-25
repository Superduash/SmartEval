"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn } from "@/lib/cn";

export type NavItem = { label: string; href: string; icon?: React.ReactNode };

interface SidebarProps {
  items: NavItem[];
  open: boolean;
  setOpen: (open: boolean) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({ items, open, setOpen, collapsed, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/auth/login");
  };

  return (
    <>
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex flex-col justify-between overflow-y-auto bg-panel p-4 shadow-2xl transition-all duration-300 md:static md:translate-x-0 md:rounded-2xl md:shadow-sm md:ring-1 md:ring-slate-200/50 dark:md:ring-slate-800",
          collapsed ? "w-20 md:w-24" : "w-72",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div>
          <div className="mb-5 flex items-center justify-between">
            <div
              className={cn(
                "overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 via-brand-500 to-cyan-500 text-white shadow-inner ring-1 ring-white/20 transition-all duration-300",
                collapsed ? "p-3" : "p-5"
              )}
            >
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-100">SE</p>
              {!collapsed && <p className="mt-2 text-lg font-bold leading-tight">Multi-Agent<br/>Portal</p>}
            </div>
            <button
              type="button"
              onClick={onToggleCollapse}
              className="hidden h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 transition hover:bg-slate-100 md:inline-flex dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </button>
          </div>

          <nav className="space-y-1">
            {items.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 sm:py-3.5",
                    collapsed && "justify-center px-2",
                    active
                      ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-200"
                  )}
                >
                  {item.icon && (
                    <span className={cn("transition-transform group-hover:scale-110 group-hover:text-brand-600 dark:group-hover:text-brand-400", active ? "text-brand-600 dark:text-brand-400" : "")}>
                      {item.icon}
                    </span>
                  )}
                  {!collapsed && item.label}
                  {active && (
                    <motion.div layoutId="nav-indicator" className="absolute left-0 h-8 w-1 rounded-r-full bg-brand-500" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-8 shrink-0">
          <button
            onClick={handleLogout}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-900/20",
              collapsed && "justify-center px-2"
            )}
            title={collapsed ? "Sign Out" : undefined}
          >
            <LogOut className="h-5 w-5" />
            {!collapsed && "Sign Out"}
          </button>
        </div>
      </aside>

      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-slate-900/50 backdrop-blur-sm transition-opacity md:hidden dark:bg-slate-900/80"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}
