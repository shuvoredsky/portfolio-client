'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, School } from 'lucide-react';
import { Education } from '@/types';

interface EducationProps {
  items: Education[];
}

export default function EducationSection({ items }: EducationProps) {
  // Sort or map entries
  const education = [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <section id="education" className="py-20 space-y-12">
      {/* Title */}
      <div className="space-y-2">
        <h2 className="font-heading text-3xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
          <GraduationCap className="text-brand-indigo" size={28} /> Education
        </h2>
        <p className="text-slate-650 dark:text-gray-400 text-sm md:text-base max-w-xl">
          My academic records, qualifications, and department session calendars.
        </p>
      </div>

      {/* Grid of Education Cards */}
      <div className="grid grid-cols-1 gap-6">
        {education.map((edu, idx) => (
          <motion.div
            key={edu.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.12 }}
            whileHover={{ y: -4 }}
            className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/5 hover:border-slate-200 dark:hover:border-white/10 hover:shadow-lg transition-all duration-300 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6"
          >
            <div className="flex gap-4 items-start">
              <div className="p-3.5 rounded-2xl bg-brand-indigo/5 border border-brand-indigo/20 text-brand-indigo flex-shrink-0">
                <School size={24} />
              </div>
              <div className="space-y-1">
                <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white leading-tight">
                  {edu.degree}
                </h3>
                <p className="text-brand-indigo font-semibold text-sm">
                  {edu.institution}
                </p>
                {edu.department && (
                  <p className="text-slate-500 dark:text-slate-400 text-xs">
                    {edu.department}
                  </p>
                )}
              </div>
            </div>

            <div className="flex-shrink-0 sm:text-right bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 px-4 py-1.5 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300">
              Session: {edu.session}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
