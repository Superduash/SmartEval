import Link from "next/link";
import { Sparkles, MessageCircle, Code2, Briefcase } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
        <div className="flex justify-center space-x-6 md:order-2">
          <Link href="#" className="text-slate-400 hover:text-slate-500 transition-colors">
            <span className="sr-only">Twitter</span>
            <MessageCircle className="h-5 w-5" aria-hidden="true" />
          </Link>
          <Link href="#" className="text-slate-400 hover:text-slate-500 transition-colors">
            <span className="sr-only">GitHub</span>
            <Code2 className="h-5 w-5" aria-hidden="true" />
          </Link>
          <Link href="#" className="text-slate-400 hover:text-slate-500 transition-colors">
            <span className="sr-only">LinkedIn</span>
            <Briefcase className="h-5 w-5" aria-hidden="true" />
          </Link>
        </div>
        <div className="mt-8 md:order-1 md:mt-0 flex items-center justify-center md:justify-start gap-2">
          <Sparkles className="h-5 w-5 text-brand-600 dark:text-brand-400" />
          <p className="text-center text-sm leading-5 text-slate-500 dark:text-slate-400">
            &copy; {new Date().getFullYear()} SmartEval, Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
