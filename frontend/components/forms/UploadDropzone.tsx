"use client";

import { UploadCloud } from "lucide-react";
import { useCallback, useState } from "react";
import { cn } from "@/lib/cn";

interface UploadDropzoneProps {
  onFileSelect?: (file: File) => void;
  onFilesAdded?: (files: File[]) => void;
  accept?: string | Record<string, string[]>;
  maxFiles?: number;
  multiple?: boolean;
  label?: string;
}

function normalizeAccept(accept: string | Record<string, string[]>): string {
  if (typeof accept === "string") return accept;

  return Object.entries(accept)
    .flatMap(([mime, exts]) => [mime, ...exts])
    .join(",");
}

export function UploadDropzone({
  onFileSelect,
  onFilesAdded,
  accept = "application/pdf,image/*",
  maxFiles = 10,
  multiple,
  label = "Click or drag file to this area to upload",
}: UploadDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileNames, setFileNames] = useState<string[]>([]);

  const allowMultiple = multiple ?? Boolean(onFilesAdded);

  const notifyFiles = useCallback(
    (incomingFiles: File[]) => {
      const nextFiles = allowMultiple ? incomingFiles.slice(0, maxFiles) : incomingFiles.slice(0, 1);
      if (nextFiles.length === 0) return;

      setFileNames(nextFiles.map((f) => f.name));

      if (onFilesAdded) {
        onFilesAdded(nextFiles);
      }

      if (onFileSelect) {
        onFileSelect(nextFiles[0]);
      }
    },
    [allowMultiple, maxFiles, onFileSelect, onFilesAdded]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      notifyFiles(Array.from(e.dataTransfer.files));
    },
    [notifyFiles]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      notifyFiles(Array.from(e.target.files ?? []));
    },
    [notifyFiles]
  );

  const acceptValue = normalizeAccept(accept);

  return (
    <label
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "group mt-2 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 transition-colors",
        isDragOver
          ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10"
          : "border-slate-300 bg-slate-50 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:bg-slate-800"
      )}
    >
      <div className="rounded-full bg-brand-100 p-3 text-brand-600 transition-transform group-hover:scale-110 dark:bg-brand-500/20 dark:text-brand-400">
        <UploadCloud className="h-6 w-6" />
      </div>
      <p className="mt-4 text-sm font-medium text-slate-700 dark:text-slate-300">
        {fileNames.length > 0 ? (
          <span className="text-brand-600 dark:text-brand-400">{fileNames.join(", ")}</span>
        ) : (
          label
        )}
      </p>
      <input
        type="file"
        className="hidden"
        accept={acceptValue}
        onChange={handleChange}
        multiple={allowMultiple}
      />
    </label>
  );
}
