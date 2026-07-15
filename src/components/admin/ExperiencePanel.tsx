'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Plus, Edit2, Trash2, Check, X, Loader2, Briefcase, Calendar, MapPin
} from 'lucide-react';
import { api } from '@/lib/api';
import { Experience } from '@/types';
import { toast } from 'sonner';

const experienceSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  company: z.string().min(1, 'Company is required'),
  location: z.string().optional().or(z.literal('')),
  duration: z.string().min(1, 'Duration is required'),
  description: z.string().min(1, 'Description is required'),
  isInternship: z.boolean(),
  order: z.number().int(),
});

type ExperienceFormData = z.infer<typeof experienceSchema>;

export default function ExperiencePanel() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete modal states
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingExperience, setDeletingExperience] = useState<Experience | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ExperienceFormData>({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      title: '',
      company: '',
      location: '',
      duration: '',
      description: '',
      isInternship: false,
      order: 0,
    }
  });

  const fetchExperiences = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/experiences');
      if (!response.ok) throw new Error('Failed to fetch experiences');
      const res = await response.json();
      setExperiences((res.data || []).sort((a: any, b: any) => a.order - b.order));
    } catch (error: any) {
      toast.error(error.message || 'Failed to load experiences');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExperiences();
  }, []);

  const handleOpenCreate = () => {
    setFormMode('create');
    setEditingExperience(null);
    reset({
      title: '',
      company: '',
      location: '',
      duration: '',
      description: '',
      isInternship: false,
      order: 0,
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (exp: Experience) => {
    setFormMode('edit');
    setEditingExperience(exp);
    reset({
      title: exp.title,
      company: exp.company,
      location: exp.location || '',
      duration: exp.duration,
      description: exp.description,
      isInternship: exp.isInternship,
      order: exp.order,
    });
    setIsFormOpen(true);
  };

  const handleOpenDelete = (exp: Experience) => {
    setDeletingExperience(exp);
    setIsDeleteOpen(true);
  };

  const onSubmit = async (values: ExperienceFormData) => {
    setIsSubmitting(true);
    try {
      if (formMode === 'create') {
        await api.createExperience(values);
        toast.success('Experience record created successfully!');
      } else if (formMode === 'edit' && editingExperience) {
        await api.updateExperience(editingExperience.id, values);
        toast.success('Experience record updated successfully!');
      }
      setIsFormOpen(false);
      fetchExperiences();
    } catch (error: any) {
      toast.error(error.message || 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingExperience) return;
    setIsDeleting(true);
    try {
      await api.deleteExperience(deletingExperience.id);
      toast.success('Experience record deleted successfully!');
      setIsDeleteOpen(false);
      setDeletingExperience(null);
      fetchExperiences();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete record');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-white/5">
        <div className="space-y-1">
          <h2 className="font-heading text-xl font-bold text-slate-900 dark:text-white">Manage Experience</h2>
          <p className="text-slate-500 dark:text-gray-400 text-xs">Configure professional workspace records, internship statuses, and descriptions.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-brand-indigo to-indigo-600 hover:shadow-lg hover:shadow-brand-indigo/10 text-white rounded-xl text-xs font-semibold cursor-pointer transition-all"
        >
          <Plus size={14} /> Add Experience
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin text-brand-indigo" size={32} />
        </div>
      ) : experiences.length === 0 ? (
        <div className="border border-dashed border-slate-200 dark:border-white/10 rounded-2xl p-12 text-center text-slate-500 dark:text-gray-400 text-sm">
          No experience records found. Add some to display on the timeline.
        </div>
      ) : (
        <div className="overflow-x-auto w-full rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-slate-950/20 shadow-inner">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/5 text-slate-600 dark:text-gray-400 font-semibold bg-slate-100/50 dark:bg-slate-900/30">
                <th className="p-4">Role & Company</th>
                <th className="p-4 hidden sm:table-cell">Duration & Location</th>
                <th className="p-4 text-center">Order</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/5">
              {experiences.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-100/30 dark:hover:bg-white/5 transition-colors">
                  <td className="p-4 space-y-1">
                    <p className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      {exp.title}
                      {exp.isInternship && (
                        <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-brand-cyan/15 text-brand-cyan font-extrabold uppercase">
                          Internship
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-slate-700 dark:text-gray-300 font-semibold">{exp.company}</p>
                    <p className="text-[10px] text-slate-500 dark:text-gray-400 line-clamp-1 max-w-xs">{exp.description}</p>
                  </td>
                  
                  <td className="p-4 hidden sm:table-cell space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-slate-650 dark:text-gray-300">
                      <Calendar size={12} className="text-slate-400" />
                      <span>{exp.duration}</span>
                    </div>
                    {exp.location && (
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                        <MapPin size={10} className="text-slate-400" />
                        <span>{exp.location}</span>
                      </div>
                    )}
                  </td>

                  <td className="p-4 text-center">
                    <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-700 dark:text-gray-300 rounded">
                      {exp.order}
                    </span>
                  </td>

                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2.5">
                      <button
                        onClick={() => handleOpenEdit(exp)}
                        className="p-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-500 hover:text-brand-cyan transition-colors cursor-pointer"
                        aria-label="Edit record"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        onClick={() => handleOpenDelete(exp)}
                        className="p-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-500 hover:text-red-500 transition-colors cursor-pointer"
                        aria-label="Delete record"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE & EDIT FORM MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-950/40 dark:bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div 
            className="w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto relative animate-in fade-in zoom-in duration-200"
            role="dialog"
            aria-modal="true"
          >
            <button
              onClick={() => setIsFormOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              aria-label="Close dialog"
            >
              <X size={16} />
            </button>

            <div className="space-y-1">
              <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white">
                {formMode === 'create' ? 'Add Experience' : 'Edit Experience'}
              </h3>
              <p className="text-slate-500 dark:text-gray-400 text-xs">Enter role and workspace parameters</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              
              {/* Title & Company */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-650 dark:text-gray-400 font-semibold">Title/Role *</label>
                  <input
                    type="text"
                    placeholder="e.g. Software Engineer"
                    {...register('title')}
                    className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-indigo text-slate-900 dark:text-white"
                  />
                  {errors.title && (
                    <span className="text-[10px] text-red-500 font-semibold">{errors.title.message}</span>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-650 dark:text-gray-400 font-semibold">Company *</label>
                  <input
                    type="text"
                    placeholder="e.g. Google"
                    {...register('company')}
                    className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-indigo text-slate-900 dark:text-white"
                  />
                  {errors.company && (
                    <span className="text-[10px] text-red-500 font-semibold">{errors.company.message}</span>
                  )}
                </div>
              </div>

              {/* Duration & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-650 dark:text-gray-400 font-semibold">Duration *</label>
                  <input
                    type="text"
                    placeholder="e.g. June 2024 - Present"
                    {...register('duration')}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-indigo text-slate-900 dark:text-white"
                  />
                  {errors.duration && (
                    <span className="text-[10px] text-red-500 font-semibold">{errors.duration.message}</span>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-650 dark:text-gray-400 font-semibold">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Mirpur, Dhaka, Bangladesh"
                    {...register('location')}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-indigo text-slate-900 dark:text-white"
                  />
                  {errors.location && (
                    <span className="text-[10px] text-red-500 font-semibold">{errors.location.message}</span>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs text-slate-650 dark:text-gray-400 font-semibold">Description *</label>
                <textarea
                  placeholder="Summarize key tasks, tech stacks used, and outcomes..."
                  rows={4}
                  {...register('description')}
                  className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-indigo text-slate-900 dark:text-white resize-y"
                />
                {errors.description && (
                  <span className="text-[10px] text-red-500 font-semibold">{errors.description.message}</span>
                )}
              </div>

              {/* Internship & Order */}
              <div className="flex items-center justify-between gap-6 pt-2">
                <div className="space-y-1">
                  <label className="text-xs text-slate-650 dark:text-gray-400 font-semibold">Listing Order</label>
                  <input
                    type="number"
                    placeholder="0"
                    {...register('order', { valueAsNumber: true })}
                    className="w-24 text-xs bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-indigo text-slate-900 dark:text-white text-center"
                  />
                  {errors.order && (
                    <span className="text-[10px] text-red-500 font-semibold block">{errors.order.message}</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isInternship"
                    {...register('isInternship')}
                    className="w-4 h-4 rounded border-slate-200 dark:border-white/5 accent-brand-indigo focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="isInternship" className="text-xs text-slate-700 dark:text-gray-300 font-bold select-none cursor-pointer">
                    Internship Position
                  </label>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex justify-end gap-3 pt-6 border-t border-slate-200 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-5 py-2.5 border border-slate-200 dark:border-white/10 hover:border-slate-300 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-brand-indigo to-indigo-600 text-white rounded-xl text-xs font-semibold cursor-pointer hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      Saving... <Loader2 size={12} className="animate-spin" />
                    </>
                  ) : (
                    <>
                      Save Changes <Check size={12} />
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteOpen && deletingExperience && (
        <div className="fixed inset-0 bg-slate-950/40 dark:bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div 
            className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-2xl p-6 space-y-6 text-center animate-in fade-in zoom-in duration-150"
            role="dialog"
            aria-modal="true"
          >
            <div className="p-3 bg-red-500/10 text-red-500 rounded-full w-fit mx-auto border border-red-500/20">
              <Trash2 size={24} />
            </div>

            <div className="space-y-2">
              <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white">Delete Experience?</h3>
              <p className="text-slate-500 dark:text-gray-400 text-xs leading-relaxed">
                Are you sure you want to delete <span className="font-semibold text-slate-800 dark:text-white">"{deletingExperience.title}"</span> at <span className="font-semibold">{deletingExperience.company}</span>?
              </p>
            </div>

            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsDeleteOpen(false)}
                disabled={isDeleting}
                className="px-5 py-2.5 border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer hover:text-slate-950 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-red-650 hover:bg-red-700 text-white rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    Deleting... <Loader2 size={12} className="animate-spin" />
                  </>
                ) : (
                  'Delete Experience'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
