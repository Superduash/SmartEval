import { FolderOpen } from "lucide-react";
import { ComponentType } from "react";
import { LucideProps } from "lucide-react";

export function EmptyState({
  title = "No data available",
  description = "There is currently no data to show here.",
  icon: Icon = FolderOpen,
}: {
  title?: string;
  description?: string;
  icon?: ComponentType<LucideProps>;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-800">
      <Icon className="mb-4 h-12 w-12 text-slate-400 dark:text-slate-600" />
      <h3 className="text-lg font-medium text-slate-900 dark:text-white">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">{description}</p>
    </div>
  );
}
