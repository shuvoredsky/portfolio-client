'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { Mail, ArrowUpRight, Star } from 'lucide-react';
import { AboutContent } from '@/types';

const roleTitles = [
  "Full Stack Developer",
  "MERN / Next.js Expert",
  "TypeScript Architect",
  "AI Integration Specialist"
];

function Typewriter({ words }: { words: string[] }) {
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [reverse, setReverse] = useState(false);
  const [blink, setBlink] = useState(true);

  useEffect(() => {
    if (subIndex === words[index].length + 1 && !reverse) {
      const timeout = setTimeout(() => setReverse(true), 2200);
      return () => clearTimeout(timeout);
    }

    if (subIndex === 0 && reverse) {
      setReverse(false);
      setIndex((prev) => (prev + 1) % words.length);
      return;
    }

    const timeout = setTimeout(() => {
      setSubIndex((prev) => prev + (reverse ? -1 : 1));
    }, reverse ? 35 : 85);

    return () => clearTimeout(timeout);
  }, [subIndex, index, reverse, words]);

  useEffect(() => {
    const timeout = setTimeout(() => setBlink((prev) => !prev), 500);
    return () => clearTimeout(timeout);
  }, [blink]);

  return (
    <span className="font-mono text-brand-cyan drop-shadow-[0_0_8px_rgba(6,182,212,0.3)]">
      {words[index].substring(0, subIndex)}
      <span className={`inline-block w-[3px] h-[1em] translate-y-[2px] ml-1 bg-brand-cyan ${blink ? 'opacity-100' : 'opacity-0'}`} />
    </span>
  );
}

function MagneticButton({ 
  children, 
  href, 
  primary = false 
}: { 
  children: React.ReactNode; 
  href: string; 
  primary?: boolean; 
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 15, stiffness: 150 };
  const xSpring = useSpring(x, springConfig);
  const ySpring = useSpring(y, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const { clientX, clientY, currentTarget } = e;
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const xForce = (clientX - (left + width / 2)) * 0.35;
    const yForce = (clientY - (top + height / 2)) * 0.35;
    x.set(xForce);
    y.set(yForce);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const buttonClasses = primary
    ? "inline-flex items-center gap-2 px-7 py-3.5 font-heading font-semibold text-sm rounded-full bg-gradient-to-r from-brand-indigo to-indigo-600 text-white shadow-lg shadow-brand-indigo/15 cursor-pointer"
    : "inline-flex items-center gap-2 px-7 py-3.5 font-heading font-semibold text-sm rounded-full border border-slate-200 dark:border-white/10 hover:border-brand-indigo bg-slate-100 dark:bg-white/5 hover:bg-brand-indigo/5 text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white cursor-pointer";

  return (
    <motion.a
      href={href}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: xSpring, y: ySpring }}
      className={buttonClasses}
    >
      {children}
    </motion.a>
  );
}

interface HeroProps {
  data: AboutContent | null;
}

export default function Hero({ data }: HeroProps) {
  const greeting = "Hello, I'm".split(" ");
  const name = "Kumar".split("");
  const profileImageUrl = data?.profileImageUrl;
  const heroBackgroundUrl = data?.heroBackgroundUrl;

  return (
    <section 
      id="hero" 
      className="min-h-[85vh] flex flex-col justify-center items-start relative select-none scroll-mt-24"
    >
      {/* Background image layer with reduced opacity and scrim gradient */}
      {heroBackgroundUrl && (
        <div className="absolute inset-0 -mx-6 md:-mx-20 z-0 pointer-events-none overflow-hidden select-none">
          <Image
            src={heroBackgroundUrl}
            alt="Hero Background Scrim"
            fill
            className="object-cover opacity-[0.14] dark:opacity-[0.18] transition-opacity duration-500"
            priority
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-50/50 dark:via-slate-950/60 to-slate-50 dark:to-slate-950" />
        </div>
      )}

      {/* Background radial glow specifically for Hero section */}
      <div className="absolute -top-12 left-10 w-80 h-80 rounded-full bg-brand-indigo/10 blur-3xl animate-pulse-slow pointer-events-none -z-10" />

      {/* Responsive Split Columns Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-center w-full z-10 pt-8">
        
        {/* Text Content Column */}
        <div className="md:col-span-2 space-y-6 order-2 md:order-1">
          {/* Available Badge */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-indigo/25 bg-brand-indigo/5 text-xs text-brand-cyan font-semibold uppercase tracking-wider"
          >
            <Star size={12} className="animate-spin text-brand-cyan" style={{ animationDuration: '6s' }} /> Available for Work
          </motion.div>

          {/* Staggered Name Reveal */}
          <div className="space-y-2">
            <motion.div 
              className="flex flex-wrap gap-x-2 font-heading text-lg md:text-xl font-medium text-slate-500 dark:text-gray-400"
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
              }}
              initial="hidden"
              animate="visible"
            >
              {greeting.map((word, idx) => (
                <motion.span 
                  key={idx}
                  variants={{
                    hidden: { opacity: 0, y: 15 },
                    visible: { opacity: 1, y: 0 }
                  }}
                >
                  {word}
                </motion.span>
              ))}
            </motion.div>

            <motion.h1 
              className="font-heading text-5xl sm:text-6xl md:text-8xl font-extrabold tracking-tight leading-[0.95] text-slate-900 dark:text-white"
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.25 } }
              }}
              initial="hidden"
              animate="visible"
            >
              {name.map((char, idx) => (
                <motion.span 
                  key={idx}
                  className="inline-block"
                  variants={{
                    hidden: { opacity: 0, y: 40 },
                    visible: { opacity: 1, y: 0, transition: { type: "spring", damping: 10 } }
                  }}
                >
                  {char}
                </motion.span>
              ))}
              <span className="text-brand-indigo font-black">.</span>
            </motion.h1>
          </div>

          {/* Dynamic Typewriter Role */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="font-heading text-xl sm:text-2xl md:text-4xl font-bold tracking-tight text-slate-800 dark:text-gray-200"
          >
            I am a <Typewriter words={roleTitles} />
          </motion.div>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="text-slate-650 dark:text-gray-400 text-sm sm:text-base md:text-lg max-w-2xl leading-relaxed"
          >
            Specializing in developing robust Node.js backends and premium Next.js clients. I build interactive layouts, deploy server solutions, and optimize schema indices.
          </motion.p>

          {/* CTAs */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.5 }}
            className="flex flex-wrap gap-4 pt-4"
          >
            <MagneticButton href="#projects" primary>
              View Projects <ArrowUpRight size={16} />
            </MagneticButton>
            <MagneticButton href="#contact">
              Contact Me <Mail size={16} />
            </MagneticButton>
          </motion.div>
        </div>

        {/* Profile Image Frame Column */}
        <div className="md:col-span-1 flex justify-center md:justify-end order-1 md:order-2">
          <motion.div
            initial={{ opacity: 0, scale: 0.75 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 100, delay: 0.4 }}
            className="relative group w-40 h-40 sm:w-48 sm:h-48 md:w-60 md:h-60 rounded-full p-1 bg-gradient-to-tr from-brand-indigo to-brand-cyan shadow-xl dark:shadow-2xl shadow-brand-indigo/10 dark:shadow-brand-indigo/5 hover:shadow-brand-indigo/20 transition-all duration-500"
          >
            <div className="relative w-full h-full rounded-full overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 flex items-center justify-center shadow-inner">
              {profileImageUrl ? (
                <Image
                  src={profileImageUrl}
                  alt="Kumar Avatar Profile"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  priority
                  unoptimized
                />
              ) : (
                <div className="text-5xl md:text-6xl font-heading font-black text-transparent bg-clip-text bg-gradient-to-tr from-brand-indigo to-brand-cyan select-none">
                  K
                </div>
              )}
            </div>
            {/* Dynamic glowing ring overlay */}
            <div className="absolute -inset-1.5 rounded-full bg-gradient-to-tr from-brand-indigo to-brand-cyan blur opacity-20 group-hover:opacity-35 transition-opacity duration-500 pointer-events-none -z-10" />
          </motion.div>
        </div>

      </div>

      {/* Bouncing scroll down indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 1.6, duration: 0.8 }}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2 cursor-pointer"
        onClick={() => {
          document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
        }}
      >
        <span className="text-xs font-semibold tracking-widest uppercase text-slate-500 hover:text-slate-900 dark:text-gray-500 dark:hover:text-white transition-colors">Scroll</span>
        <motion.div 
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          className="w-5 h-8 border-2 border-slate-450 dark:border-gray-600 rounded-full flex justify-center p-1"
        >
          <div className="w-1.5 h-1.5 bg-brand-cyan rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}
