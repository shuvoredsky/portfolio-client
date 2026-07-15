'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Plus, Edit2, Trash2, Check, X, Loader2, Code, ArrowUpDown
} from 'lucide-react';
import { api } from '@/lib/api';
import { TechStack, TechCategory } from '@/types';
import { toast } from 'sonner';

const techStackSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.enum(['FRONTEND', 'BACKEND', 'TOOLS', 'DESIGN', 'DEPLOYMENT', 'AI_ML']),
  icon: z.string().optional().or(z.literal('')),
  order: z.number().int(),
});

type TechStackFormData = z.infer<typeof techStackSchema>;

const categories: TechCategory[] = ['FRONTEND', 'BACKEND', 'TOOLS', 'DESIGN', 'DEPLOYMENT', 'AI_ML'];

export default function TechStackPanel() {
  const [techStacks, setTechStacks] = useState<TechStack[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingTech, setEditingTech] = useState<TechStack | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete modal states
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingTech, setDeletingTech] = useState<TechStack | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TechStackFormData>({
    resolver: zodResolver(techStackSchema),
    defaultValues: {
      name: '',
      category: 'FRONTEND',
      icon: '',
      order: 0,
    }
  });

  const fetchTechStacks = async () => {
    setIsLoading(true);
    try {
      // Use techstack get endpoint directly
      const response = await fetch('/api/admin/techstacks');
      if (!response.ok) throw new Error('Failed to fetch tech stack');
      const res = await response.json();
      setTechStacks(res.data || []);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load tech stack');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTechStacks();
  }, []);

  const handleOpenCreate = () => {
    setFormMode('create');
    setEditingTech(null);
    reset({
      name: '',
      category: 'FRONTEND',
      icon: '',
      order: 0,
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (tech: TechStack) => {
    setFormMode('edit');
    setEditingTech(tech);
    reset({
      name: tech.name,
      category: tech.category,
      icon: tech.icon || '',
      order: tech.order,
    });
    setIsFormOpen(true);
  };

  const handleOpenDelete = (tech: TechStack) => {
    setDeletingTech(tech);
    setIsDeleteOpen(true);
  };

  const onSubmit = async (values: TechStackFormData) => {
    setIsSubmitting(true);
    try {
      if (formMode === 'create') {
        await api.createTechStack(values);
        toast.success('Tech stack item created!');
      } else if (formMode === 'edit' && editingTech) {
        await api.updateTechStack(editingTech.id, values);
        toast.success('Tech stack item updated!');
      }
      setIsFormOpen(false);
      fetchTechStacks();
    } catch (error: any) {
      toast.error(error.message || 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingTech) return;
    setIsDeleting(true);
    try {
      await api.deleteTechStack(deletingTech.id);
      toast.success('Tech stack item deleted!');
      setIsDeleteOpen(false);
      setDeletingTech(null);
      fetchTechStacks();
    } catch (error: any) {
      toast.error(error.message || 'Deletion failed');
    } finally {
      setIsDeleting(false);
    }
  };

  // Group by category and sort internally by order
  const groupedTechs = categories.reduce((acc, cat) => {
    const items = techStacks
      .filter(t => t.category === cat)
      .sort((a, b) => a.order - b.order);
    if (items.length > 0) {
      acc[cat] = items;
    }
    return acc;
  }, {} as Record<TechCategory, TechStack[]>);

  return (
    <div className="space-y-6">
      
      <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-white/5">
        <div className="space-y-1">
          <h2 className="font-heading text-xl font-bold text-slate-900 dark:text-white">Manage Tech Stack</h2>
          <p className="text-slate-500 dark:text-gray-400 text-xs">Configure your technologies, categories, and icons.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-brand-indigo to-indigo-600 hover:shadow-lg hover:shadow-brand-indigo/10 text-white rounded-xl text-xs font-semibold cursor-pointer transition-all"
        >
          <Plus size={14} /> Add Technology
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin text-brand-indigo" size={32} />
        </div>
      ) : techStacks.length === 0 ? (
        <div className="border border-dashed border-slate-200 dark:border-white/10 rounded-2xl p-12 text-center text-slate-500 dark:text-gray-400 text-sm">
          No technology items found. Add some to display in your portfolio stack section.
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedTechs).map(([category, items]) => (
            <div key={category} className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-brand-cyan px-2">{category}</h3>
              <div className="overflow-x-auto w-full rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-slate-950/20 shadow-inner">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-white/5 text-slate-600 dark:text-gray-400 font-semibold bg-slate-100/50 dark:bg-slate-900/30">
                      <th className="p-4">Name</th>
                      <th className="p-4 text-center">Icon Identifier</th>
                      <th className="p-4 text-center">Sorting Order</th>
                      <th className="p-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                    {items.map((tech) => (
                      <tr key={tech.id} className="hover:bg-slate-100/30 dark:hover:bg-white/5 transition-colors">
                        <td className="p-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <Code size={14} className="text-slate-400" />
                          <span>{tech.name}</span>
                        </td>
                        <td className="p-4 text-center text-slate-500 font-mono text-xs">{tech.icon || '—'}</td>
                        <td className="p-4 text-center">
                          <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-700 dark:text-gray-300 rounded">
                            {tech.order}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-2.5">
                            <button
                              onClick={() => handleOpenEdit(tech)}
                              className="p-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-500 hover:text-brand-cyan transition-colors cursor-pointer"
                              aria-label="Edit item"
                            >
                              <Edit2 size={12} />
                            </button>
                            <button
                              onClick={() => handleOpenDelete(tech)}
                              className="p-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-500 hover:text-red-500 transition-colors cursor-pointer"
                              aria-label="Delete item"
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
            </div>
          ))}
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
                {formMode === 'create' ? 'Add Technology' : 'Edit Technology'}
              </h3>
              <p className="text-slate-500 dark:text-gray-400 text-xs">Enter configuration parameters</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              
              {/* Name */}
              <div className="space-y-1">
                <label className="text-xs text-slate-650 dark:text-gray-400 font-semibold">Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Next.js"
                  {...register('name')}
                  className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-indigo text-slate-900 dark:text-white"
                />
                {errors.name && (
                  <span className="text-[10px] text-red-500 font-semibold">{errors.name.message}</span>
                )}
              </div>

              {/* Category Select */}
              <div className="space-y-1">
                <label className="text-xs text-slate-650 dark:text-gray-400 font-semibold">Category *</label>
                <select
                  {...register('category')}
                  className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-indigo text-slate-900 dark:text-white"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <span className="text-[10px] text-red-500 font-semibold">{errors.category.message}</span>
                )}
              </div>

              {/* Icon */}
              <div className="space-y-1">
                <label className="text-xs text-slate-650 dark:text-gray-400 font-semibold">Icon Identifier <span className="text-[10px] font-normal text-slate-400">(matching React icon map)</span></label>
                <input
                  type="text"
                  placeholder="e.g. nextjs"
                  {...register('icon')}
                  className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-indigo text-slate-900 dark:text-white"
                />
                {errors.icon && (
                  <span className="text-[10px] text-red-500 font-semibold">{errors.icon.message}</span>
                )}
              </div>

              {/* Order */}
              <div className="space-y-1">
                <label className="text-xs text-slate-650 dark:text-gray-400 font-semibold">Sorting Order</label>
                <input
                  type="number"
                  placeholder="0"
                  {...register('order', { valueAsNumber: true })}
                  className="w-28 text-xs bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-indigo text-slate-900 dark:text-white text-center"
                />
                {errors.order && (
                  <span className="text-[10px] text-red-500 font-semibold block">{errors.order.message}</span>
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
      {isDeleteOpen && deletingTech && (
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
              <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white">Delete Technology?</h3>
              <p className="text-slate-500 dark:text-gray-400 text-xs leading-relaxed">
                Are you sure you want to delete <span className="font-semibold text-slate-800 dark:text-white">"{deletingTech.name}"</span>?
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
                className="flex items-center gap-1.5 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    Deleting... <Loader2 size={12} className="animate-spin" />
                  </>
                ) : (
                  'Delete Technology'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
