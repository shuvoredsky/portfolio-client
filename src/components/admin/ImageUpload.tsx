'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, X, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export default function ImageUpload({ value, onChange, label = 'Upload Image' }: ImageUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only image files (jpg, jpeg, png, webp) are allowed!');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size cannot exceed 5MB!');
      return;
    }

    setIsUploading(true);
    try {
      const result = await api.uploadImage(file);
      onChange(result.url);
      toast.success('Image uploaded successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Image upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  const triggerSelect = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = async () => {
    if (!value) return;
    const toastId = toast.loading('Removing image...');
    try {
      await api.deleteCloudinaryImage({ url: value });
      onChange('');
      toast.success('Image removed successfully!', { id: toastId });
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove image', { id: toastId });
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-xs text-slate-600 dark:text-gray-400 font-semibold">{label}</label>
      
      {value ? (
        <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-white/5 bg-slate-100/50 dark:bg-slate-950/20 group h-44 w-full flex items-center justify-center">
          <img
            src={value}
            alt="Preview"
            className="h-full w-full object-cover transition-transform group-hover:scale-105 duration-300"
          />
          <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={handleRemove}
              className="p-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <X size={14} /> Remove Image
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={triggerSelect}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 h-44 ${
            isDragOver
              ? 'border-brand-indigo bg-brand-indigo/5'
              : 'border-slate-200 dark:border-white/10 hover:border-brand-indigo/40 bg-slate-50/50 dark:bg-slate-950/10'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".jpg,.jpeg,.png,.webp"
            className="hidden"
          />
          
          {isUploading ? (
            <div className="space-y-2 flex flex-col items-center">
              <Loader2 className="animate-spin text-brand-indigo" size={28} />
              <p className="text-xs text-slate-500 dark:text-gray-400 font-medium">Uploading image to Cloudinary...</p>
            </div>
          ) : (
            <div className="space-y-2 flex flex-col items-center">
              <div className="p-3 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-gray-500 border border-slate-200 dark:border-white/5">
                <UploadCloud size={24} className="text-brand-indigo" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-slate-800 dark:text-gray-300">
                  Drag & drop image, or <span className="text-brand-indigo">browse</span>
                </p>
                <p className="text-[10px] text-slate-400">Supports JPG, JPEG, PNG, WEBP (Max 5MB)</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
