'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Compass, Cpu, Heart } from 'lucide-react';
import { AboutContent } from '@/types';

interface AboutMeProps {
  data: AboutContent | null;
}

export default function AboutMe({ data }: AboutMeProps) {
  const journey = data?.journeyText || "My passion for software development was ignited back in 2021. Since then, I've spent thousands of hours learning coding concepts, building projects, and solving real-world programming puzzles. This journey has transformed me from a curious beginner into a robust, detail-oriented engineer.";
  const work = data?.workText || "I thrive in the intersection of server architecture and modern clients. I enjoy building high-performance Node.js RESTful APIs, designing secure token auth structures, writing optimized PostgreSQL schemas with Prisma, and coding sleek Next.js React interfaces with clean animations.";
  const hobbies = data?.hobbiesText || "When I am not coding, you will find me reading technology blogs, exploring new places around the city, or spending quality time playing table tennis and tracking the latest advancements in AI and Machine Learning systems.";

  const cards = [
    {
      title: 'Programming Journey',
      icon: Compass,
      text: journey,
      gradient: 'from-brand-cyan/15 to-blue-500/0',
      glow: 'hover:shadow-brand-cyan/5',
      iconColor: 'text-brand-cyan',
    },
    {
      title: 'Work I Enjoy',
      icon: Cpu,
      text: work,
      gradient: 'from-brand-indigo/15 to-purple-500/0',
      glow: 'hover:shadow-brand-indigo/5',
      iconColor: 'text-brand-indigo',
    },
    {
      title: 'Hobbies & Interests',
      icon: Heart,
      text: hobbies,
      gradient: 'from-pink-500/15 to-rose-500/0',
      glow: 'hover:shadow-pink-500/5',
      iconColor: 'text-pink-500',
    },
  ];

  return (
    <section id="about" className="py-20 space-y-12">
      {/* Title */}
      <div className="space-y-2">
        <h2 className="font-heading text-3xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
          About <span className="bg-gradient-to-r from-brand-cyan to-brand-indigo bg-clip-text text-transparent">Me</span>
        </h2>
        <p className="text-slate-650 dark:text-gray-400 text-sm md:text-base max-w-xl">
          Get to know my professional focus, development passion, and interests outside the workspace.
        </p>
      </div>

      {/* 3-card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, delay: idx * 0.12, ease: 'easeOut' }}
              whileHover={{ y: -6, scale: 1.01 }}
              className={`glass-panel p-8 rounded-3xl space-y-6 flex flex-col justify-between border border-white/5 hover:border-white/10 hover:shadow-lg ${card.glow} transition-all duration-300 relative overflow-hidden group`}
            >
              {/* Card Gradient Background Underlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />

              <div className="space-y-4 relative z-10">
                <div className={`p-3 w-fit rounded-2xl bg-white/5 border border-white/5 group-hover:border-white/10 ${card.iconColor} transition-colors`}>
                  <Icon size={24} />
                </div>
                <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white tracking-tight">{card.title}</h3>
                <p className="text-slate-650 dark:text-gray-400 text-sm leading-relaxed">{card.text}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
