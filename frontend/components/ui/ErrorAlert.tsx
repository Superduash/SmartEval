import { AlertTriangle } from "lucide-react";

export function ErrorAlert({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
      <AlertTriangle className="h-5 w-5" />
      <span className="font-medium">{message}</span>
    </div>
  );
}
