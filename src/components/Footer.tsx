import React from 'react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-slate-200 dark:border-white/5 bg-slate-100/30 dark:bg-slate-950/30 py-8 z-10 relative">
      <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="font-heading text-sm text-slate-500 dark:text-gray-400">
          © {currentYear} <span className="text-slate-900 dark:text-white font-medium">Portfolio.</span> All rights reserved.
        </div>
        
        <div className="flex gap-6 text-sm text-slate-500 dark:text-gray-400">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-slate-950 dark:hover:text-white transition-colors duration-250"
          >
            GitHub
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-slate-950 dark:hover:text-white transition-colors duration-250"
          >
            LinkedIn
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-slate-950 dark:hover:text-white transition-colors duration-250"
          >
            Twitter
          </a>
        </div>
      </div>
    </footer>
  );
}
