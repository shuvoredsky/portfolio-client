'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginSchema = z.infer<typeof loginSchema>;

export default function AdminLogin() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginSchema) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Incorrect credentials');
      }

      // Redirect to protected admin dashboard
      router.push('/admin/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Incorrect email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 z-10 relative">
      {/* Visual background blobs specifically for login container */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-brand-indigo/10 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md p-8 rounded-3xl glass-panel space-y-6 border border-slate-200 dark:border-white/5 shadow-xl relative z-10">
        <div className="space-y-2 text-center">
          <h1 className="font-heading text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Admin Portal</h1>
          <p className="text-slate-500 dark:text-gray-400 text-sm">Sign in to manage your portfolio data</p>
        </div>

        {error && (
          <div className="p-3 text-xs font-semibold bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs text-slate-600 dark:text-gray-400 font-semibold">Email Address</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500">
                <Mail size={16} />
              </span>
              <input
                type="email"
                placeholder="admin@portfolio.com"
                {...register('email')}
                className="w-full text-sm bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-brand-indigo transition-colors text-slate-900 dark:text-white"
              />
            </div>
            {errors.email && (
              <span className="text-[10px] text-red-500 dark:text-red-400 font-semibold">{errors.email.message}</span>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-600 dark:text-gray-400 font-semibold">Password</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500">
                <Lock size={16} />
              </span>
              <input
                type="password"
                placeholder="••••••••"
                {...register('password')}
                className="w-full text-sm bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-brand-indigo transition-colors text-slate-900 dark:text-white"
              />
            </div>
            {errors.password && (
              <span className="text-[10px] text-red-500 dark:text-red-400 font-semibold">{errors.password.message}</span>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 mt-2 rounded-xl font-semibold text-sm bg-gradient-to-r from-brand-indigo to-indigo-600 text-white transition-all duration-300 hover:shadow-lg hover:shadow-brand-indigo/10 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <>
                Signing in... <Loader2 size={16} className="animate-spin" />
              </>
            ) : (
              <>
                Sign In <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
