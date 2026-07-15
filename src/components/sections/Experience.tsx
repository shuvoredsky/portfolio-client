'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Briefcase } from 'lucide-react';
import { Experience } from '@/types';

interface ExperienceProps {
  items: Experience[];
}

export default function ExperienceSection({ items }: ExperienceProps) {
  // Sort by order/date details
  const experiences = [...items].sort((a, b) => a.order - b.order);

  return (
    <section id="experience" className="py-20 space-y-12">
      {/* Section Title */}
      <div className="space-y-2">
        <h2 className="font-heading text-3xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
          <Briefcase className="text-brand-indigo" size={28} /> Experience
        </h2>
        <p className="text-slate-650 dark:text-gray-400 text-sm md:text-base max-w-xl">
          My professional milestones, developer internships, and work history.
        </p>
      </div>

      {/* Vertical Timeline container */}
      <div className="relative border-l border-slate-200 dark:border-white/10 ml-4 md:ml-6 space-y-8">
        {experiences.map((exp, idx) => (
          <motion.div
            key={exp.id}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.12 }}
            className="relative pl-8 group"
          >
            {/* Timeline indicator node */}
            <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-slate-900 dark:bg-slate-950 border-2 border-brand-indigo group-hover:border-brand-cyan transition-colors z-10" />

            <div className="glass-panel p-6 rounded-3xl space-y-4 border border-white/5 hover:border-slate-200 dark:hover:border-white/10 hover:shadow-lg transition-all duration-300">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div className="space-y-1">
                  <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white">
                    {exp.title}
                  </h3>
                  <p className="text-brand-indigo font-semibold text-sm flex flex-wrap items-center gap-2">
                    {exp.company}
                    {exp.isInternship && (
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-brand-cyan/15 text-brand-cyan font-bold uppercase tracking-wider">
                        Internship
                      </span>
                    )}
                  </p>
                </div>
                <div className="space-y-1 sm:text-right">
                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    <Calendar size={12} /> {exp.duration}
                  </div>
                  {exp.location && (
                    <div className="flex items-center sm:justify-end gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <MapPin size={12} /> {exp.location}
                    </div>
                  )}
                </div>
              </div>
              <p className="text-slate-650 dark:text-gray-400 text-sm leading-relaxed whitespace-pre-line">
                {exp.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
