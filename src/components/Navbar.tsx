'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Menu, X, Sun, Moon, Download } from 'lucide-react';
import { useTheme } from 'next-themes';

const navItems = [
  { name: 'About', href: '#about' },
  { name: 'Stack', href: '#stack' },
  { name: 'Experience', href: '#experience' },
  { name: 'Projects', href: '#projects' },
  { name: 'Contact', href: '#contact' },
];

export default function Navbar() {
  const [activeSection, setActiveSection] = useState('hero');
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);

      // Identify which section is currently centered/in-view
      const scrollPosition = window.scrollY + window.innerHeight / 2.5;

      const currentActive = navItems.reduce((acc, item) => {
        const element = document.getElementById(item.href.substring(1));
        if (element) {
          const offsetTop = element.offsetTop;
          if (scrollPosition >= offsetTop) {
            return item.href.substring(1);
          }
        }
        return acc;
      }, 'hero');

      setActiveSection(currentActive);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // initial trigger
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header
      className={`fixed top-4 left-1/2 -translate-x-1/2 w-[92%] max-w-5xl z-50 transition-all duration-300 rounded-full ${
        scrolled
          ? 'glass-panel py-3 shadow-lg shadow-black/5 dark:shadow-black/25'
          : 'bg-transparent py-5 border-b border-transparent'
      }`}
    >
      <div className="px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="#hero" className="font-heading font-bold text-xl tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <span className="bg-gradient-to-r from-brand-indigo to-brand-cyan bg-clip-text text-transparent">ShuvoRedSky</span>
        </Link>

        {/* Desktop Nav Items */}
        <nav className="hidden md:flex items-center gap-7">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`text-sm font-medium tracking-wide transition-colors duration-250 hover:text-slate-950 dark:hover:text-white ${
                activeSection === item.href.substring(1) 
                  ? 'text-brand-cyan font-semibold' 
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* CTA Admin Portal link + Theme Toggle */}
        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-full border border-slate-200 dark:border-white/10 hover:border-brand-indigo/50 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors duration-300 cursor-pointer"
            aria-label="Toggle Theme"
          >
            {mounted && theme === 'dark' ? <Sun size={14} className="text-brand-cyan" /> : <Moon size={14} className="text-brand-indigo" />}
          </button>

          <a
            href="/Shuvo_Chakrabrati_CV.pdf"
            download="Shuvo_Chakrabrati_CV.pdf"
            className="text-xs font-semibold px-4 py-2 flex items-center gap-1.5 border border-brand-cyan/30 hover:border-brand-cyan bg-brand-cyan/10 text-brand-cyan hover:text-white rounded-full transition-all duration-300 hover:shadow-md hover:shadow-brand-cyan/20 cursor-pointer"
          >
            <Download size={13} /> Resume
          </a>

          <Link
            href="/admin/login"
            className="text-xs font-semibold px-4 py-2 border border-brand-indigo/30 hover:border-brand-indigo bg-brand-indigo/10 text-brand-indigo hover:text-white rounded-full transition-all duration-300 hover:shadow-md hover:shadow-brand-indigo/20"
          >
            Admin
          </Link>
        </div>

        {/* Mobile menu toggle & Theme toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full border border-slate-200 dark:border-white/10 hover:border-brand-indigo/50 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
            aria-label="Toggle Theme"
          >
            {mounted && theme === 'dark' ? <Sun size={14} className="text-brand-cyan" /> : <Moon size={14} className="text-brand-indigo" />}
          </button>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white p-2 transition-colors duration-200 cursor-pointer"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile nav items */}
      {isOpen && (
        <div className="md:hidden mt-4 mx-2 p-6 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-lg rounded-3xl flex flex-col gap-4 border border-slate-200 dark:border-white/10 shadow-xl dark:shadow-black/40 animate-in fade-in slide-in-from-top-5 duration-200">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`text-base font-semibold transition-colors duration-200 ${
                activeSection === item.href.substring(1) 
                  ? 'text-brand-cyan font-bold' 
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
              }`}
            >
              {item.name}
            </Link>
          ))}
          <div className="h-px bg-slate-200 dark:bg-white/5 my-2" />
          <a
            href="/Shuvo_Chakrabrati_CV.pdf"
            download="Shuvo_Chakrabrati_CV.pdf"
            onClick={() => setIsOpen(false)}
            className="text-center text-sm font-semibold py-3 flex items-center justify-center gap-2 border border-brand-cyan/30 hover:border-brand-cyan bg-brand-cyan/10 text-brand-cyan hover:text-white rounded-xl transition-all cursor-pointer"
          >
            <Download size={15} /> Resume
          </a>
          <Link
            href="/admin/login"
            onClick={() => setIsOpen(false)}
            className="text-center text-sm font-semibold py-3 border border-brand-indigo/30 hover:border-brand-indigo bg-brand-indigo/10 text-brand-indigo hover:text-white rounded-xl transition-all"
          >
            Admin
          </Link>
        </div>
      )}
    </header>
  );
}
