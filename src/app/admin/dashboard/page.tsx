'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, LogOut, Code, FolderGit, Briefcase, 
  GraduationCap, MessageSquare, Menu, X, ExternalLink, BarChart3, Info, Loader2
} from 'lucide-react';
import { api } from '@/lib/api';
import ProjectsPanel from '@/components/admin/ProjectsPanel';
import AboutPanel from '@/components/admin/AboutPanel';
import TechStackPanel from '@/components/admin/TechStackPanel';
import ExperiencePanel from '@/components/admin/ExperiencePanel';
import EducationPanel from '@/components/admin/EducationPanel';
import MessagesPanel from '@/components/admin/MessagesPanel';

const tabs = [
  { id: 'overview', name: 'Overview', icon: BarChart3 },
  { id: 'projects', name: 'Projects', icon: FolderGit },
  { id: 'techstack', name: 'Tech Stack', icon: Code },
  { id: 'experience', name: 'Experience', icon: Briefcase },
  { id: 'education', name: 'Education', icon: GraduationCap },
  { id: 'about', name: 'About Content', icon: Info },
  { id: 'contacts', name: 'Messages', icon: MessageSquare },
];

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [stats, setStats] = useState<{ projectsCount: number; techStacksCount: number; unreadMessagesCount: number } | null>(null);
  const [isStatsLoading, setIsStatsLoading] = useState(false);

  const fetchStats = async () => {
    try {
      const data = await api.getAdminStats();
      setStats(data);
    } catch (err) {
      console.error('Error fetching admin stats:', err);
    }
  };

  useEffect(() => {
    setIsStatsLoading(true);
    fetchStats().finally(() => setIsStatsLoading(false));
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const currentTabName = tabs.find(t => t.id === activeTab)?.name || 'Dashboard';

  return (
    <div className="max-w-6xl mx-auto px-6 space-y-8 z-10 relative py-8">
      
      {/* TOP HEADER BAR */}
      <div className="flex justify-between items-center border-b border-slate-200 dark:border-white/5 pb-6">
        <div className="space-y-1">
          <h1 className="font-heading text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <LayoutDashboard className="text-brand-cyan" size={24} /> 
            <span>{currentTabName}</span>
          </h1>
          <p className="text-slate-500 dark:text-gray-400 text-xs md:text-sm">Manage your portfolio data modules</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 dark:border-white/10 hover:border-brand-cyan/40 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl text-xs font-semibold transition-all"
          >
            View Live Site <ExternalLink size={12} />
          </Link>

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center gap-2 px-4 py-2 border border-red-500/30 hover:border-red-500 bg-red-500/5 text-red-500 dark:text-red-400 hover:text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isLoggingOut ? <Loader2 size={12} className="animate-spin" /> : <LogOut size={12} />}
            <span>{isLoggingOut ? 'Logging out...' : 'Sign Out'}</span>
          </button>
        </div>
      </div>

      {/* DASHBOARD CONTAINER GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* RESPONSIVE SIDEBAR NAVIGATION */}
        <div className="md:col-span-1 space-y-4">
          {/* Mobile navigation toggle */}
          <div className="flex md:hidden items-center justify-between p-3 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5">
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Navigation Menu</span>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-200 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:text-brand-cyan"
              aria-label="Toggle Navigation"
            >
              {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>

          <nav className={`md:flex flex-col gap-2 ${isMobileMenuOpen ? 'flex' : 'hidden md:flex'}`}>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl text-left transition-all border cursor-pointer ${
                    isActive
                      ? 'bg-brand-indigo/10 border-brand-indigo/35 text-brand-indigo dark:text-white'
                      : 'text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 border-transparent'
                  }`}
                >
                  <Icon size={16} className={isActive ? 'text-brand-cyan' : 'text-slate-400'} />
                  <span>{tab.name}</span>
                  {tab.id === 'contacts' && stats && stats.unreadMessagesCount > 0 && (
                    <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-brand-cyan text-[10px] font-black text-slate-950 animate-pulse">
                      {stats.unreadMessagesCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* WORKSPACE DATA PANEL */}
        <div className="md:col-span-3 p-6 sm:p-8 rounded-3xl glass-panel min-h-[500px] border border-slate-200 dark:border-white/5 shadow-md">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h2 className="font-heading text-xl font-bold text-slate-900 dark:text-white">Workspace Overview</h2>
                <p className="text-slate-500 dark:text-gray-400 text-xs">Summary statistics from your databases</p>
              </div>

              {isStatsLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="animate-spin text-brand-indigo" size={32} />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {/* Projects Stat Card */}
                  <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-white/5 space-y-2 relative overflow-hidden">
                    <div className="absolute top-4 right-4 text-brand-indigo opacity-30">
                      <FolderGit size={28} />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-gray-400 font-semibold uppercase">Total Projects</p>
                    <p className="text-3xl font-heading font-black text-slate-900 dark:text-white">
                      {stats ? stats.projectsCount : 0}
                    </p>
                  </div>

                  {/* TechStack Stat Card */}
                  <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-white/5 space-y-2 relative overflow-hidden">
                    <div className="absolute top-4 right-4 text-brand-cyan opacity-30">
                      <Code size={28} />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-gray-400 font-semibold uppercase">Technologies</p>
                    <p className="text-3xl font-heading font-black text-slate-900 dark:text-white">
                      {stats ? stats.techStacksCount : 0}
                    </p>
                  </div>

                  {/* Unread Messages Card */}
                  <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-white/5 space-y-2 relative overflow-hidden">
                    <div className="absolute top-4 right-4 text-brand-indigo opacity-30">
                      <MessageSquare size={28} />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-gray-400 font-semibold uppercase">Unread Messages</p>
                    <p className="text-3xl font-heading font-black text-slate-900 dark:text-white">
                      {stats ? stats.unreadMessagesCount : 0}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'projects' && (
            <ProjectsPanel />
          )}

          {activeTab === 'techstack' && (
            <TechStackPanel />
          )}

          {activeTab === 'experience' && (
            <ExperiencePanel />
          )}

          {activeTab === 'education' && (
            <EducationPanel />
          )}

          {activeTab === 'about' && (
            <AboutPanel />
          )}

          {activeTab === 'contacts' && (
            <MessagesPanel onRefreshStats={fetchStats} />
          )}
        </div>

      </div>
    </div>
  );
}
