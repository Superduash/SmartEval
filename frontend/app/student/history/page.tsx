"use client";

import { useEffect, useState } from "react";
import { Calendar, ArrowRight, Bell } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ApiError, getStudentNotifications } from "@/lib/api";
import { EmptyState, ErrorAlert, LoaderSpinner } from "@/components/ui";

type TimelineItem = {
  id: number;
  title: string;
  date: string;
  type: "grade" | "system";
};

export default function StudentHistoryPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function loadHistory() {
      setLoading(true);
      setError("");

      try {
        const payload = await getStudentNotifications();
        if (!isMounted) return;

        const mapped: TimelineItem[] = payload.notifications.map((item, index) => ({
          id: index + 1,
          title: item.title,
          date: new Date().toLocaleDateString(),
          type: item.title.toLowerCase().includes("result") ? "grade" : "system",
        }));

        setTimeline(mapped);
      } catch (err: unknown) {
        if (isMounted) {
          setError(err instanceof ApiError ? err.message : "Unable to load history.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadHistory();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <DashboardLayout role="student">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Activity History</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Log of all your submissions, grades, and account events.</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <LoaderSpinner />
            </div>
          ) : error ? (
            <ErrorAlert message={error} />
          ) : timeline.length === 0 ? (
            <EmptyState title="No history events" description="Your activity feed will appear after your first evaluated submission." icon={Bell} />
          ) : (
            <div className="relative pl-6">
              <div className="absolute bottom-0 left-[23px] top-4 w-px bg-slate-200 dark:bg-slate-800" />

              <div className="space-y-8">
                {timeline.map((item) => (
                  <div key={item.id} className="relative">
                    <div className="absolute -left-8 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-slate-100 ring-4 ring-white dark:bg-slate-800 dark:ring-slate-900">
                      <div className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between">
                      <div>
                        <h4 className="font-medium text-slate-900 dark:text-white">{item.title}</h4>
                        <div className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                          <Calendar className="h-3.5 w-3.5" />
                          {item.date}
                        </div>
                      </div>
                      {item.type === "grade" && (
                        <button className="mt-2 flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-500 sm:mt-0">
                          View Details <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
