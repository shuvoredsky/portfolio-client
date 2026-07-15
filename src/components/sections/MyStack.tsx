'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TechStack, TechCategory } from '@/types';
import { 
  Code2, Database, Terminal, FileCode, Server, 
  PenTool, Layout, Layers, ShieldCheck, Cpu, ArrowRightLeft
} from 'lucide-react';

interface MyStackProps {
  items: TechStack[];
}

const categoryMeta: Record<TechCategory, { title: string; color: string; border: string; bg: string; glow: string }> = {
  FRONTEND: {
    title: 'Front-End Development',
    color: 'text-brand-cyan',
    border: 'border-brand-cyan/20',
    bg: 'bg-brand-cyan/5',
    glow: 'hover:shadow-brand-cyan/10',
  },
  BACKEND: {
    title: 'Back-End & Database',
    color: 'text-brand-indigo',
    border: 'border-brand-indigo/20',
    bg: 'bg-brand-indigo/5',
    glow: 'hover:shadow-brand-indigo/10',
  },
  TOOLS: {
    title: 'Development Tools',
    color: 'text-amber-400',
    border: 'border-amber-400/20',
    bg: 'bg-amber-400/5',
    glow: 'hover:shadow-amber-400/10',
  },
  DESIGN: {
    title: 'UI/UX & Design',
    color: 'text-pink-500',
    border: 'border-pink-500/20',
    bg: 'bg-pink-500/5',
    glow: 'hover:shadow-pink-500/10',
  },
  DEPLOYMENT: {
    title: 'DevOps & Deployment',
    color: 'text-emerald-500',
    border: 'border-emerald-500/20',
    bg: 'bg-emerald-500/5',
    glow: 'hover:shadow-emerald-500/10',
  },
  AI_ML: {
    title: 'AI & Machine Learning',
    color: 'text-purple-500',
    border: 'border-purple-500/20',
    bg: 'bg-purple-500/5',
    glow: 'hover:shadow-purple-500/10',
  },
};

const categoryIcons: Record<TechCategory, any> = {
  FRONTEND: Layout,
  BACKEND: Server,
  TOOLS: Terminal,
  DESIGN: PenTool,
  DEPLOYMENT: Layers,
  AI_ML: Cpu,
};

function getTechIcon(name: string) {
  const n = name.toLowerCase();
  if (n.includes('html') || n.includes('css') || n.includes('javascript') || n.includes('typescript')) return FileCode;
  if (n.includes('react') || n.includes('next') || n.includes('redux') || n.includes('shadcn')) return Layout;
  if (n.includes('node') || n.includes('express') || n.includes('socket')) return Server;
  if (n.includes('postgres') || n.includes('mongo') || n.includes('prisma') || n.includes('db')) return Database;
  if (n.includes('jwt') || n.includes('auth') || n.includes('security')) return ShieldCheck;
  if (n.includes('git') || n.includes('postman') || n.includes('code')) return Terminal;
  if (n.includes('docker') || n.includes('nginx') || n.includes('vercel') || n.includes('netlify') || n.includes('render') || n.includes('vps') || n.includes('cpanel') || n.includes('surge')) return Layers;
  if (n.includes('photoshop') || n.includes('illustrator') || n.includes('figma') || n.includes('design')) return PenTool;
  if (n.includes('rag') || n.includes('langchain') || n.includes('vector') || n.includes('machine') || n.includes('ai')) return Cpu;
  return Code2;
}

function StackCard({ 
  category, 
  items, 
  meta, 
  isTouchDevice 
}: { 
  category: TechCategory; 
  items: TechStack[]; 
  meta: any; 
  isTouchDevice: boolean; 
}) {
  const [isFlipped, setIsFlipped] = useState(false);
  const CategoryIcon = categoryIcons[category] || Code2;

  const handleToggleFlip = () => {
    if (isTouchDevice) {
      setIsFlipped(!isFlipped);
    }
  };

  const handleMouseEnter = () => {
    if (!isTouchDevice) {
      setIsFlipped(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isTouchDevice) {
      setIsFlipped(false);
    }
  };

  return (
    <div 
      className="w-full h-[330px] cursor-pointer select-none"
      style={{ perspective: '1000px' }}
      onClick={handleToggleFlip}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        className="relative w-full h-full"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 14 }}
      >
        {/* FRONT SIDE */}
        <div 
          className="absolute inset-0 w-full h-full rounded-3xl glass-panel p-8 flex flex-col justify-between border border-white/5 hover:border-white/10 transition-all duration-300 overflow-hidden"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Background Highlight Blur */}
          <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${meta.bg} blur-2xl opacity-60 pointer-events-none`} />

          <div className="space-y-4">
            <div className={`p-4 w-fit rounded-2xl ${meta.bg} ${meta.color} border border-white/5`}>
              <CategoryIcon size={26} />
            </div>
            <h3 className="font-heading text-xl font-bold text-slate-900 dark:text-white tracking-tight">{meta.title}</h3>
            <p className="text-slate-650 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider bg-slate-200/50 dark:bg-white/5 w-fit px-3 py-1 rounded-full border border-slate-200 dark:border-white/5">
              {items.length} Technologies
            </p>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500 group-hover:text-brand-cyan transition-colors mt-4">
            <span className="font-semibold tracking-wide">
              {isTouchDevice ? 'Tap to explore' : 'Hover to explore'}
            </span>
            <ArrowRightLeft size={14} className="animate-pulse" />
          </div>
        </div>

        {/* BACK SIDE */}
        <div 
          className="absolute inset-0 w-full h-full rounded-3xl glass-panel p-6 flex flex-col border border-white/10 overflow-hidden"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
            <span className={`text-xs font-bold uppercase tracking-widest ${meta.color}`}>
              {meta.title}
            </span>
            <span className="text-[10px] text-gray-500 font-medium bg-white/5 px-2 py-0.5 rounded-full">
              {items.length} items
            </span>
          </div>

          {/* Grid of Items */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-2 scrollbar-thin">
            <div className="grid grid-cols-2 gap-2">
              {items.map((tech, idx) => {
                const Icon = getTechIcon(tech.name);
                return (
                  <motion.div
                    key={tech.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={isFlipped ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3, delay: isFlipped ? idx * 0.045 : 0 }}
                    className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className={`p-1.5 rounded-lg ${meta.bg} ${meta.color}`}>
                      <Icon size={12} />
                    </div>
                    <span className="text-slate-750 dark:text-gray-300 text-[10px] font-semibold truncate">
                      {tech.name}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function MyStack({ items }: MyStackProps) {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsTouchDevice(window.matchMedia('(hover: none)').matches);
    }
  }, []);

  // Group tech items by category
  const grouped = items.reduce<Record<TechCategory, TechStack[]>>((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<TechCategory, TechStack[]>);

  // Filter categories that have items
  const activeCategories = (Object.keys(categoryMeta) as TechCategory[]).filter(
    (cat) => grouped[cat] && grouped[cat].length > 0
  );

  return (
    <section id="stack" className="py-20 space-y-12">
      {/* Title */}
      <div className="space-y-2">
        <h2 className="font-heading text-3xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
          My <span className="bg-gradient-to-r from-brand-cyan to-brand-indigo bg-clip-text text-transparent">Stack</span>
        </h2>
        <p className="text-slate-650 dark:text-gray-400 text-sm md:text-base max-w-xl">
          The programming languages, frameworks, developer environments, and cloud architectures I utilize.
        </p>
      </div>

      {/* Grid Layout of Flip Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeCategories.map((cat) => {
          const meta = categoryMeta[cat];
          const techItems = grouped[cat].sort((a, b) => a.order - b.order);

          return (
            <StackCard
              key={cat}
              category={cat}
              items={techItems}
              meta={meta}
              isTouchDevice={isTouchDevice}
            />
          );
        })}
      </div>
    </section>
  );
}
