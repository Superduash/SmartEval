"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export function LoaderSpinner({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center p-4 ${className}`}>
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
        <Loader2 className="h-8 w-8 text-brand-500 animate-spin" />
      </motion.div>
    </div>
  );
}
