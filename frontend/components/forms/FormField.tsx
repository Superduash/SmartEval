import { InputHTMLAttributes } from "react";

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function FormField({ label, id, className, ...props }: FormFieldProps) {
  return (
    <label htmlFor={id} className="block space-y-2 text-sm font-medium text-slate-700 dark:text-slate-200">
      <span>{label}</span>
      <input
        id={id}
        className={`w-full rounded-xl border border-slate-300 bg-transparent p-3 text-sm outline-none ring-brand-500 transition focus:ring-2 dark:border-slate-700 ${className || ""}`}
        {...props}
      />
    </label>
  );
}
