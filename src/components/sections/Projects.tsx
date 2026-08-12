'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, FolderGit } from 'lucide-react';
import { Project } from '@/types';
import ScrollStack, { ScrollStackItem } from '../ScrollStack';

function GithubIcon({ size = 12 }: { size?: number }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      width={size} 
      height={size} 
      stroke="currentColor" 
      strokeWidth="2.5" 
      fill="none" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
    </svg>
  );
}

interface ProjectsSectionProps {
  items: Project[];
}

function ProjectPlaceholder({ title }: { title: string }) {
  const firstLetter = title.charAt(0).toUpperCase();
  const gradients = [
    'from-brand-indigo to-brand-cyan',
    'from-pink-500 to-rose-500',
    'from-purple-500 to-indigo-500',
    'from-teal-400 to-emerald-500'
  ];
  const hash = title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const grad = gradients[hash % gradients.length];

  return (
    <div className={`w-full h-40 rounded-2xl bg-gradient-to-tr ${grad} flex items-center justify-center text-white text-5xl font-heading font-black select-none shadow-inner opacity-80`}>
      {firstLetter}
    </div>
  );
}

export default function ProjectsSection({ items }: ProjectsSectionProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'slide'>('slide');
  const projects = [...items].sort((a, b) => a.order - b.order);

  return (
    <section id="projects" className="py-20 space-y-12 scroll-mt-24">
      {/* Header & View Mode Switcher */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <h2 className="font-heading text-3xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <FolderGit className="text-brand-indigo" size={28} /> Projects
          </h2>
          <p className="text-slate-650 dark:text-gray-400 text-sm md:text-base max-w-xl">
            A curation of full-stack ecosystems, database designs, and custom clients.
          </p>
        </div>

        {/* Dynamic Sliding Toggle Buttons */}
        <div className="relative flex p-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-full w-fit">
          <motion.div
            className="absolute top-1 bottom-1 left-1 rounded-full bg-gradient-to-r from-brand-indigo to-indigo-600 shadow-md shadow-brand-indigo/15 z-0"
            layout
            transition={{ type: 'spring', stiffness: 220, damping: 22 }}
            style={{
              width: 'calc(50% - 4px)',
              x: viewMode === 'grid' ? 0 : '100%',
            }}
          />
          <button
            onClick={() => setViewMode('grid')}
            className={`relative px-4 py-1.5 text-xs font-bold rounded-full transition-colors z-10 cursor-pointer ${
              viewMode === 'grid' ? 'text-white' : 'text-slate-500 dark:text-gray-400'
            }`}
          >
            Grid View
          </button>
          <button
            onClick={() => setViewMode('slide')}
            className={`relative px-4 py-1.5 text-xs font-bold rounded-full transition-colors z-10 cursor-pointer ${
              viewMode === 'slide' ? 'text-white' : 'text-slate-500 dark:text-gray-400'
            }`}
          >
            Slide View
          </button>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="border border-dashed border-white/10 rounded-3xl p-16 text-center text-gray-500 text-sm">
          No projects found in database. Create one in the admin dashboard.
        </div>
      ) : (
        /* Render Grid or ScrollStack */
        <AnimatePresence mode="wait">
          {viewMode === 'grid' ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {projects.map((proj, idx) => (
                <motion.div
                  key={proj.id}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  whileHover={{ y: -6 }}
                  className="glass-panel p-6 rounded-3xl space-y-4 flex flex-col justify-between border border-white/5 hover:border-slate-200 dark:hover:border-white/10 hover:shadow-xl hover:shadow-brand-indigo/5 transition-all duration-300 relative group overflow-hidden"
                >
                  <div className="space-y-4">
                    {/* Image or Placeholder */}
                    {proj.image ? (
                      <img
                        src={proj.image}
                        alt={proj.title}
                        className="w-full h-44 object-cover rounded-2xl border border-white/5"
                      />
                    ) : (
                      <ProjectPlaceholder title={proj.title} />
                    )}

                    <div className="space-y-2">
                      <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white flex items-center justify-between">
                        {proj.title}
                        {proj.featured && (
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-brand-cyan/15 text-brand-cyan font-bold uppercase tracking-wider">
                            Featured
                          </span>
                        )}
                      </h3>
                      <p className="text-slate-650 dark:text-gray-400 text-sm leading-relaxed">
                        {proj.description}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-white/5">
                    <div className="flex flex-wrap gap-1.5">
                      {proj.techStack.map((tech) => (
                        <span
                          key={tech}
                          className="text-[10px] font-semibold font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    <div className="flex gap-4">
                      {proj.liveLink && (
                        <a
                          href={proj.liveLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs font-semibold text-brand-indigo hover:text-indigo-500 transition-colors"
                        >
                          Live Link <ExternalLink size={12} />
                        </a>
                      )}
                      {proj.githubLink && (
                        <a
                          href={proj.githubLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                        >
                          GitHub <GithubIcon size={12} />
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            /* Slide View (ScrollStack) */
            <motion.div
              key="slide"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-2xl mx-auto w-full"
            >
              <ScrollStack
                className="h-[550px] w-full border border-slate-200 dark:border-white/5 rounded-3xl bg-slate-50/50 dark:bg-slate-950/20 shadow-inner scrollbar-none"
                itemDistance={90}
                itemScale={0.04}
                itemStackDistance={25}
                stackPosition="20%"
                baseScale={0.88}
                rotationAmount={0}
                blurAmount={1.5}
                useWindowScroll={false}
              >
                {projects.map((proj) => (
                  <ScrollStackItem key={proj.id}>
                    <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-white/10 hover:shadow-xl hover:shadow-brand-indigo/5 transition-all duration-300 relative group overflow-hidden flex flex-col justify-between h-full min-h-[340px]">
                      <div className="space-y-4">
                        {/* Image or Placeholder */}
                        {proj.image ? (
                          <img
                            src={proj.image}
                            alt={proj.title}
                            className="w-full h-40 object-cover rounded-2xl border border-slate-200 dark:border-white/5"
                          />
                        ) : (
                          <ProjectPlaceholder title={proj.title} />
                        )}

                        <div className="space-y-2">
                          <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white flex items-center justify-between">
                            {proj.title}
                            {proj.featured && (
                              <span className="text-[9px] px-2 py-0.5 rounded-full bg-brand-cyan/15 text-brand-cyan font-bold uppercase tracking-wider">
                                Featured
                              </span>
                            )}
                          </h3>
                          <p className="text-slate-650 dark:text-gray-400 text-xs leading-relaxed line-clamp-3">
                            {proj.description}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-white/5 mt-3">
                        <div className="flex flex-wrap gap-1.5">
                          {proj.techStack.map((tech) => (
                            <span
                              key={tech}
                              className="text-[9px] font-semibold font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>

                        <div className="flex gap-4">
                          {proj.liveLink && (
                            <a
                              href={proj.liveLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-xs font-semibold text-brand-indigo hover:text-indigo-500 transition-colors"
                            >
                              Live Link <ExternalLink size={12} />
                            </a>
                          )}
                          {proj.githubLink && (
                            <a
                              href={proj.githubLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                            >
                              GitHub <GithubIcon size={12} />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </ScrollStackItem>
                ))}
              </ScrollStack>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </section>
  );
}
