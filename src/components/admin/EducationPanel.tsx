'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Plus, Edit2, Trash2, Check, X, Loader2, GraduationCap, Calendar
} from 'lucide-react';
import { api } from '@/lib/api';
import { Education } from '@/types';
import { toast } from 'sonner';

const educationSchema = z.object({
  institution: z.string().min(1, 'Institution is required'),
  degree: z.string().min(1, 'Degree is required'),
  department: z.string().optional().or(z.literal('')),
  session: z.string().min(1, 'Session is required'),
});

type EducationFormData = z.infer<typeof educationSchema>;

export default function EducationPanel() {
  const [educationList, setEducationList] = useState<Education[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingEducation, setEditingEducation] = useState<Education | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete modal states
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingEducation, setDeletingEducation] = useState<Education | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EducationFormData>({
    resolver: zodResolver(educationSchema),
    defaultValues: {
      institution: '',
      degree: '',
      department: '',
      session: '',
    }
  });

  const fetchEducation = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/education');
      if (!response.ok) throw new Error('Failed to fetch education list');
      const res = await response.json();
      setEducationList(res.data || []);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load education');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEducation();
  }, []);

  const handleOpenCreate = () => {
    setFormMode('create');
    setEditingEducation(null);
    reset({
      institution: '',
      degree: '',
      department: '',
      session: '',
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (edu: Education) => {
    setFormMode('edit');
    setEditingEducation(edu);
    reset({
      institution: edu.institution,
      degree: edu.degree,
      department: edu.department || '',
      session: edu.session,
    });
    setIsFormOpen(true);
  };

  const handleOpenDelete = (edu: Education) => {
    setDeletingEducation(edu);
    setIsDeleteOpen(true);
  };

  const onSubmit = async (values: EducationFormData) => {
    setIsSubmitting(true);
    try {
      if (formMode === 'create') {
        await api.createEducation(values);
        toast.success('Education listing created successfully!');
      } else if (formMode === 'edit' && editingEducation) {
        await api.updateEducation(editingEducation.id, values);
        toast.success('Education listing updated successfully!');
      }
      setIsFormOpen(false);
      fetchEducation();
    } catch (error: any) {
      toast.error(error.message || 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingEducation) return;
    setIsDeleting(true);
    try {
      await api.deleteEducation(deletingEducation.id);
      toast.success('Education listing deleted successfully!');
      setIsDeleteOpen(false);
      setDeletingEducation(null);
      fetchEducation();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete education');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-white/5">
        <div className="space-y-1">
          <h2 className="font-heading text-xl font-bold text-slate-900 dark:text-white">Manage Education</h2>
          <p className="text-slate-500 dark:text-gray-400 text-xs">Configure academic background sessions, degrees, and institutions.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-brand-indigo to-indigo-600 hover:shadow-lg hover:shadow-brand-indigo/10 text-white rounded-xl text-xs font-semibold cursor-pointer transition-all"
        >
          <Plus size={14} /> Add Education
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin text-brand-indigo" size={32} />
        </div>
      ) : educationList.length === 0 ? (
        <div className="border border-dashed border-slate-200 dark:border-white/10 rounded-2xl p-12 text-center text-slate-500 dark:text-gray-400 text-sm">
          No education entries found. Add some to display on your landing page.
        </div>
      ) : (
        <div className="overflow-x-auto w-full rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-slate-950/20 shadow-inner">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/5 text-slate-600 dark:text-gray-400 font-semibold bg-slate-100/50 dark:bg-slate-900/30">
                <th className="p-4">Institution & Department</th>
                <th className="p-4">Degree</th>
                <th className="p-4 text-center">Session</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/5">
              {educationList.map((edu) => (
                <tr key={edu.id} className="hover:bg-slate-100/30 dark:hover:bg-white/5 transition-colors">
                  <td className="p-4 space-y-1">
                    <p className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <GraduationCap size={16} className="text-slate-400" />
                      <span>{edu.institution}</span>
                    </p>
                    {edu.department && (
                      <p className="text-xs text-slate-500 dark:text-gray-400">{edu.department}</p>
                    )}
                  </td>
                  
                  <td className="p-4 text-slate-700 dark:text-gray-300 font-semibold">{edu.degree}</td>

                  <td className="p-4 text-center text-slate-500 dark:text-gray-400 flex items-center justify-center gap-1.5 h-full pt-6">
                    <Calendar size={12} className="text-slate-400" />
                    <span>{edu.session}</span>
                  </td>

                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2.5">
                      <button
                        onClick={() => handleOpenEdit(edu)}
                        className="p-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-500 hover:text-brand-cyan transition-colors cursor-pointer"
                        aria-label="Edit education record"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        onClick={() => handleOpenDelete(edu)}
                        className="p-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-500 hover:text-red-500 transition-colors cursor-pointer"
                        aria-label="Delete education record"
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
            className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-2xl p-6 space-y-6 relative animate-in fade-in zoom-in duration-200"
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
                {formMode === 'create' ? 'Add Education' : 'Edit Education'}
              </h3>
              <p className="text-slate-500 dark:text-gray-400 text-xs">Enter academic parameters</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              
              {/* Institution */}
              <div className="space-y-1">
                <label className="text-xs text-slate-655 dark:text-gray-400 font-semibold">Institution Name *</label>
                <input
                  type="text"
                  placeholder="e.g. University of Dhaka"
                  {...register('institution')}
                  className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-indigo text-slate-900 dark:text-white"
                />
                {errors.institution && (
                  <span className="text-[10px] text-red-500 font-semibold">{errors.institution.message}</span>
                )}
              </div>

              {/* Degree */}
              <div className="space-y-1">
                <label className="text-xs text-slate-655 dark:text-gray-400 font-semibold">Degree *</label>
                <input
                  type="text"
                  placeholder="e.g. B.Sc. in Computer Science"
                  {...register('degree')}
                  className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-indigo text-slate-900 dark:text-white"
                />
                {errors.degree && (
                  <span className="text-[10px] text-red-500 font-semibold">{errors.degree.message}</span>
                )}
              </div>

              {/* Department */}
              <div className="space-y-1">
                <label className="text-xs text-slate-655 dark:text-gray-400 font-semibold">Department / Major</label>
                <input
                  type="text"
                  placeholder="e.g. Computer Science & Engineering"
                  {...register('department')}
                  className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-indigo text-slate-900 dark:text-white"
                />
                {errors.department && (
                  <span className="text-[10px] text-red-500 font-semibold">{errors.department.message}</span>
                )}
              </div>

              {/* Session */}
              <div className="space-y-1">
                <label className="text-xs text-slate-655 dark:text-gray-400 font-semibold">Session / Duration *</label>
                <input
                  type="text"
                  placeholder="e.g. 2020 - 2024"
                  {...register('session')}
                  className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-indigo text-slate-900 dark:text-white"
                />
                {errors.session && (
                  <span className="text-[10px] text-red-500 font-semibold">{errors.session.message}</span>
                )}
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
      {isDeleteOpen && deletingEducation && (
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
              <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white">Delete Education?</h3>
              <p className="text-slate-500 dark:text-gray-400 text-xs leading-relaxed">
                Are you sure you want to delete <span className="font-semibold text-slate-800 dark:text-white">"{deletingEducation.degree}"</span> from <span className="font-semibold">{deletingEducation.institution}</span>?
              </p>
            </div>

            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsDeleteOpen(false)}
                disabled={isDeleting}
                className="px-5 py-2.5 border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-slate-650 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer hover:text-slate-950 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    Deleting... <Loader2 size={12} className="animate-spin" />
                  </>
                ) : (
                  'Delete Education'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
