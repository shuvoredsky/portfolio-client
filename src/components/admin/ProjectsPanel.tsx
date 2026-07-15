'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Plus, Edit2, Trash2, Globe, ArrowUpRight, 
  Check, X, Loader2, Tag, Calendar
} from 'lucide-react';
import { api } from '@/lib/api';
import { Project } from '@/types';
import { toast } from 'sonner';
import ImageUpload from './ImageUpload';

const projectSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  techStack: z.array(z.string()).min(1, 'At least one technology tag is required'),
  liveLink: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  githubLink: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  image: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  featured: z.boolean(),
  order: z.number().int(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

export default function ProjectsPanel() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete modal states
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Custom tech tag state
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: '',
      description: '',
      techStack: [],
      liveLink: '',
      githubLink: '',
      image: '',
      featured: false,
      order: 0,
    }
  });

  const imageUrl = watch('image') || '';

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAdminProjects();
      setProjects(data.sort((a, b) => a.order - b.order));
    } catch (error: any) {
      toast.error(error.message || 'Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Update react-hook-form value when tags change
  useEffect(() => {
    setValue('techStack', tags);
  }, [tags, setValue]);

  const handleOpenCreate = () => {
    setFormMode('create');
    setEditingProject(null);
    setTags([]);
    reset({
      title: '',
      description: '',
      techStack: [],
      liveLink: '',
      githubLink: '',
      image: '',
      featured: false,
      order: 0,
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (proj: Project) => {
    setFormMode('edit');
    setEditingProject(proj);
    setTags(proj.techStack);
    reset({
      title: proj.title,
      description: proj.description,
      techStack: proj.techStack,
      liveLink: proj.liveLink || '',
      githubLink: proj.githubLink || '',
      image: proj.image || '',
      featured: proj.featured,
      order: proj.order,
    });
    setIsFormOpen(true);
  };

  const handleOpenDelete = (proj: Project) => {
    setDeletingProject(proj);
    setIsDeleteOpen(true);
  };

  // Tag Input Handler
  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = tagInput.trim().replace(/,$/, '');
      if (val && !tags.includes(val)) {
        setTags([...tags, val]);
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const onSubmit = async (values: ProjectFormData) => {
    setIsSubmitting(true);
    try {
      if (formMode === 'create') {
        await api.createProject(values);
        toast.success('Project created successfully!');
      } else if (formMode === 'edit' && editingProject) {
        await api.updateProject(editingProject.id, values);
        toast.success('Project updated successfully!');
      }
      setIsFormOpen(false);
      fetchProjects();
    } catch (error: any) {
      toast.error(error.message || 'An error occurred during submission');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingProject) return;
    setIsDeleting(true);
    try {
      await api.deleteProject(deletingProject.id);
      toast.success('Project deleted successfully!');
      setIsDeleteOpen(false);
      setDeletingProject(null);
      fetchProjects();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete project');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title & Add CTA */}
      <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-white/5">
        <div className="space-y-1">
          <h2 className="font-heading text-xl font-bold text-slate-900 dark:text-white">Manage Projects</h2>
          <p className="text-slate-500 dark:text-gray-400 text-xs">Create, edit, or delete items showing in your portfolio list.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-brand-indigo to-indigo-600 hover:shadow-lg hover:shadow-brand-indigo/10 text-white rounded-xl text-xs font-semibold cursor-pointer transition-all"
        >
          <Plus size={14} /> Add Project
        </button>
      </div>

      {/* Projects List Grid / Table */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin text-brand-indigo" size={32} />
        </div>
      ) : projects.length === 0 ? (
        <div className="border border-dashed border-slate-200 dark:border-white/10 rounded-2xl p-16 text-center text-slate-500 dark:text-gray-400 text-sm">
          No projects found in database. Create one to display on the main page.
        </div>
      ) : (
        <div className="overflow-x-auto w-full rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-slate-950/20 shadow-inner">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/5 text-slate-600 dark:text-gray-400 font-semibold bg-slate-100/50 dark:bg-slate-900/30">
                <th className="p-4">Project Details</th>
                <th className="p-4 hidden sm:table-cell">Technologies</th>
                <th className="p-4 text-center">Status & Order</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/5">
              {projects.map((proj) => (
                <tr key={proj.id} className="hover:bg-slate-100/30 dark:hover:bg-white/5 transition-colors">
                  <td className="p-4 space-y-1">
                    <p className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      {proj.title}
                      {proj.featured && (
                        <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-brand-cyan/15 text-brand-cyan font-extrabold uppercase">
                          Featured
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-gray-400 line-clamp-1 max-w-xs">{proj.description}</p>
                    <div className="flex gap-2 text-[10px] text-slate-400">
                      {proj.liveLink && (
                        <span className="flex items-center gap-0.5 text-brand-indigo">
                          <Globe size={10} /> Live
                        </span>
                      )}
                      <span className="flex items-center gap-0.5">
                        <Calendar size={10} /> {new Date(proj.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  
                  <td className="p-4 hidden sm:table-cell">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {proj.techStack.map((tech) => (
                        <span 
                          key={tech} 
                          className="text-[9px] font-mono font-semibold px-2 py-0.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-700 dark:text-gray-300 rounded"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="p-4 text-center">
                    <div className="space-y-1">
                      <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-700 dark:text-gray-300 rounded-md">
                        Order: {proj.order}
                      </span>
                    </div>
                  </td>

                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2.5">
                      <button
                        onClick={() => handleOpenEdit(proj)}
                        className="p-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-500 hover:text-brand-cyan transition-colors cursor-pointer"
                        aria-label="Edit project"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        onClick={() => handleOpenDelete(proj)}
                        className="p-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-500 hover:text-red-500 transition-colors cursor-pointer"
                        aria-label="Delete project"
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
                {formMode === 'create' ? 'Create Project' : 'Edit Project'}
              </h3>
              <p className="text-slate-500 dark:text-gray-400 text-xs">Fill in parameters to update target item</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              
              {/* Title */}
              <div className="space-y-1">
                <label className="text-xs text-slate-600 dark:text-gray-400 font-semibold">Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Next.js Commerce"
                  {...register('title')}
                  className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-indigo text-slate-900 dark:text-white"
                />
                {errors.title && (
                  <span className="text-[10px] text-red-500 font-semibold">{errors.title.message}</span>
                )}
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs text-slate-600 dark:text-gray-400 font-semibold">Description *</label>
                <textarea
                  placeholder="Describe your ecosystem features..."
                  rows={4}
                  {...register('description')}
                  className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-indigo text-slate-900 dark:text-white resize-y"
                />
                {errors.description && (
                  <span className="text-[10px] text-red-500 font-semibold">{errors.description.message}</span>
                )}
              </div>

              {/* Tech Stack Multi Input */}
              <div className="space-y-2">
                <label className="text-xs text-slate-600 dark:text-gray-400 font-semibold flex items-center gap-1">
                  <Tag size={12} /> Tech Stack * <span className="text-[10px] font-normal text-slate-400">(Type tag and hit Enter or comma)</span>
                </label>
                <input
                  type="text"
                  placeholder="Add technology..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-indigo text-slate-900 dark:text-white"
                />
                {errors.techStack && (
                  <p className="text-[10px] text-red-500 font-semibold">{errors.techStack.message}</p>
                )}

                {/* Selected Tags Render */}
                <div className="flex flex-wrap gap-1.5 pt-1.5">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 text-[10px] font-semibold font-mono px-2 py-0.5 rounded bg-brand-indigo/10 border border-brand-indigo/25 text-brand-indigo dark:text-white"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-slate-400 hover:text-red-500 focus:outline-none cursor-pointer"
                        aria-label={`Remove tag ${tag}`}
                      >
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Links Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-600 dark:text-gray-400 font-semibold">Live URL Link</label>
                  <input
                    type="text"
                    placeholder="https://my-app.vercel.app"
                    {...register('liveLink')}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-indigo text-slate-900 dark:text-white"
                  />
                  {errors.liveLink && (
                    <span className="text-[10px] text-red-500 font-semibold">{errors.liveLink.message}</span>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-600 dark:text-gray-400 font-semibold">GitHub Repo Link</label>
                  <input
                    type="text"
                    placeholder="https://github.com/profile/repo"
                    {...register('githubLink')}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-indigo text-slate-900 dark:text-white"
                  />
                  {errors.githubLink && (
                    <span className="text-[10px] text-red-500 font-semibold">{errors.githubLink.message}</span>
                  )}
                </div>
              </div>

              {/* Image Input & Preview */}
              <div className="space-y-1">
                <ImageUpload
                  value={imageUrl}
                  onChange={(url) => setValue('image', url, { shouldValidate: true })}
                  label="Project Cover Image"
                />
                {errors.image && (
                  <span className="text-[10px] text-red-500 font-semibold">{errors.image.message}</span>
                )}
              </div>

              {/* Featured & Order Row */}
              <div className="flex items-center justify-between gap-6 pt-2">
                <div className="space-y-1">
                  <label className="text-xs text-slate-600 dark:text-gray-400 font-semibold">Listing Order</label>
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
                    id="featured"
                    {...register('featured')}
                    className="w-4 h-4 rounded border-slate-200 dark:border-white/5 accent-brand-indigo focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="featured" className="text-xs text-slate-700 dark:text-gray-300 font-bold select-none cursor-pointer">
                    Feature on Hero Stack
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
      {isDeleteOpen && deletingProject && (
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
              <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white">Delete Project?</h3>
              <p className="text-slate-500 dark:text-gray-400 text-xs leading-relaxed">
                Are you sure you want to delete <span className="font-semibold text-slate-800 dark:text-white">"{deletingProject.title}"</span>? This action is permanent.
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
                  'Delete Project'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
