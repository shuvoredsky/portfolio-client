'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Check, Info, FileText } from 'lucide-react';
import { api } from '@/lib/api';
import { AboutContent } from '@/types';
import ImageUpload from './ImageUpload';
import { toast } from 'sonner';

const aboutSchema = z.object({
  journeyText: z.string().min(10, 'Journey text must be at least 10 characters'),
  workText: z.string().min(10, 'Work text must be at least 10 characters'),
  hobbiesText: z.string().min(10, 'Hobbies text must be at least 10 characters'),
  profileImageUrl: z.string().url('Must be a valid URL').optional().nullable().or(z.literal('')),
  heroBackgroundUrl: z.string().url('Must be a valid URL').optional().nullable().or(z.literal('')),
});

type AboutFormData = z.infer<typeof aboutSchema>;

export default function AboutPanel() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<AboutFormData>({
    resolver: zodResolver(aboutSchema),
    defaultValues: {
      journeyText: '',
      workText: '',
      hobbiesText: '',
      profileImageUrl: '',
      heroBackgroundUrl: '',
    }
  });

  const fetchAboutContent = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAboutContent();
      reset({
        journeyText: data.journeyText || '',
        workText: data.workText || '',
        hobbiesText: data.hobbiesText || '',
        profileImageUrl: data.profileImageUrl || '',
        heroBackgroundUrl: data.heroBackgroundUrl || '',
      });
    } catch (error: any) {
      console.error('Error fetching about content:', error);
      toast.error('Failed to load about content. Please ensure database is seeded.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAboutContent();
  }, []);

  const onSubmit = async (values: AboutFormData) => {
    setIsSubmitting(true);
    try {
      await api.updateAboutContent(values);
      toast.success('About content saved successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save changes');
    } finally {
      setIsSubmitting(false);
    }
  };

  const profileImageUrl = watch('profileImageUrl') || '';
  const heroBackgroundUrl = watch('heroBackgroundUrl') || '';

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin text-brand-indigo" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/5">
        <div className="space-y-1">
          <h2 className="font-heading text-xl font-bold text-slate-900 dark:text-white">Manage About Content</h2>
          <p className="text-slate-500 dark:text-gray-400 text-xs">Configure text blocks, profile photo, and landing hero backgrounds.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Images Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Profile Photo */}
          <div className="space-y-2">
            <ImageUpload
              value={profileImageUrl}
              onChange={(url) => setValue('profileImageUrl', url, { shouldValidate: true })}
              label="Profile Photo"
            />
            <p className="text-[10px] text-slate-405 dark:text-gray-400 flex items-center gap-1">
              <Info size={10} /> 1:1 Aspect ratio square recommended (avatar portrait)
            </p>
            {errors.profileImageUrl && (
              <span className="text-[10px] text-red-500 font-semibold">{errors.profileImageUrl.message}</span>
            )}
          </div>

          {/* Hero Background */}
          <div className="space-y-2">
            <ImageUpload
              value={heroBackgroundUrl}
              onChange={(url) => setValue('heroBackgroundUrl', url, { shouldValidate: true })}
              label="Hero Section Background"
            />
            <p className="text-[10px] text-slate-405 dark:text-gray-400 flex items-center gap-1">
              <Info size={10} /> 16:9 Aspect ratio landscape recommended (mesh backdrop overlays)
            </p>
            {errors.heroBackgroundUrl && (
              <span className="text-[10px] text-red-500 font-semibold">{errors.heroBackgroundUrl.message}</span>
            )}
          </div>
        </div>

        {/* Text Areas */}
        <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-white/5">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <FileText size={16} className="text-brand-indigo" /> Text Copy Blocks
          </h3>

          <div className="space-y-1">
            <label className="text-xs text-slate-600 dark:text-gray-400 font-semibold">Journey Text *</label>
            <textarea
              placeholder="Describe your coding journey..."
              rows={4}
              {...register('journeyText')}
              className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-indigo text-slate-900 dark:text-white resize-y"
            />
            {errors.journeyText && (
              <span className="text-[10px] text-red-500 font-semibold">{errors.journeyText.message}</span>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-600 dark:text-gray-400 font-semibold">Work Text *</label>
            <textarea
              placeholder="Describe your professional work experience..."
              rows={4}
              {...register('workText')}
              className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-indigo text-slate-900 dark:text-white resize-y"
            />
            {errors.workText && (
              <span className="text-[10px] text-red-500 font-semibold">{errors.workText.message}</span>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-600 dark:text-gray-400 font-semibold">Hobbies Text *</label>
            <textarea
              placeholder="Describe your personal hobbies & interests..."
              rows={4}
              {...register('hobbiesText')}
              className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-indigo text-slate-900 dark:text-white resize-y"
            />
            {errors.hobbiesText && (
              <span className="text-[10px] text-red-500 font-semibold">{errors.hobbiesText.message}</span>
            )}
          </div>
        </div>

        {/* Form Submit Footer */}
        <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-white/5">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-1.5 px-6 py-3 bg-gradient-to-r from-brand-indigo to-indigo-600 hover:shadow-lg hover:shadow-brand-indigo/10 text-white rounded-xl text-xs font-semibold cursor-pointer transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                Saving Changes... <Loader2 size={12} className="animate-spin" />
              </>
            ) : (
              <>
                Save Content <Check size={12} />
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
