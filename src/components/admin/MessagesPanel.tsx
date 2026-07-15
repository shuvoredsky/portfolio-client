'use client';

import React, { useState, useEffect } from 'react';
import { 
  Trash2, Mail, Calendar, Eye, X, Loader2, CheckCheck, Clock
} from 'lucide-react';
import { api } from '@/lib/api';
import { ContactMessage } from '@/types';
import { toast } from 'sonner';

interface MessagesPanelProps {
  onRefreshStats?: () => void;
}

export default function MessagesPanel({ onRefreshStats }: MessagesPanelProps) {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Detail Modal states
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Delete modal states
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingMessage, setDeletingMessage] = useState<ContactMessage | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const data = await api.getContactMessages();
      setMessages(data || []);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch messages');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleOpenDetail = async (msg: ContactMessage) => {
    setSelectedMessage(msg);
    setIsDetailOpen(true);

    // If message is unread, mark it as read on the backend
    if (!msg.isRead) {
      try {
        await api.markContactMessageRead(msg.id);
        // Update local status
        setMessages((prev) =>
          prev.map((m) => (m.id === msg.id ? { ...m, isRead: true } : m))
        );
        // Refresh sidebar stats badge
        if (onRefreshStats) {
          onRefreshStats();
        }
      } catch (error) {
        console.error('Failed to mark message as read:', error);
      }
    }
  };

  const handleOpenDelete = (msg: ContactMessage) => {
    setDeletingMessage(msg);
    setIsDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingMessage) return;
    setIsDeleting(true);
    try {
      await api.deleteContactMessage(deletingMessage.id);
      toast.success('Message deleted successfully!');
      setIsDeleteOpen(false);
      
      // If deleting the currently viewed message, close details
      if (selectedMessage?.id === deletingMessage.id) {
        setIsDetailOpen(false);
        setSelectedMessage(null);
      }
      
      setDeletingMessage(null);
      fetchMessages();
      if (onRefreshStats) {
        onRefreshStats();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete message');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      
      <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-white/5">
        <div className="space-y-1">
          <h2 className="font-heading text-xl font-bold text-slate-900 dark:text-white">Contact Messages</h2>
          <p className="text-slate-500 dark:text-gray-400 text-xs">View and respond to inquiries submitted through the public contact form.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin text-brand-indigo" size={32} />
        </div>
      ) : messages.length === 0 ? (
        <div className="border border-dashed border-slate-200 dark:border-white/10 rounded-2xl p-12 text-center text-slate-500 dark:text-gray-400 text-sm">
          No messages received yet. When users fill out your site contact form, they will appear here.
        </div>
      ) : (
        <div className="overflow-x-auto w-full rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-slate-950/20 shadow-inner">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/5 text-slate-600 dark:text-gray-400 font-semibold bg-slate-100/50 dark:bg-slate-900/30">
                <th className="p-4">Sender info</th>
                <th className="p-4">Message Summary</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-center">Received Date</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/5">
              {messages.map((msg) => {
                const preview = msg.message.length > 55 ? msg.message.substring(0, 55) + '...' : msg.message;
                return (
                  <tr 
                    key={msg.id} 
                    className={`transition-colors hover:bg-slate-100/30 dark:hover:bg-white/5 cursor-pointer ${
                      !msg.isRead ? 'bg-brand-indigo/[0.02] font-semibold' : ''
                    }`}
                    onClick={() => handleOpenDetail(msg)}
                  >
                    <td className="p-4 space-y-0.5">
                      <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Mail size={12} className={msg.isRead ? 'text-slate-400' : 'text-brand-cyan'} />
                        <span>{msg.name}</span>
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono">{msg.email}</p>
                    </td>
                    
                    <td className="p-4 text-slate-700 dark:text-gray-300 text-xs max-w-xs truncate">
                      {preview}
                    </td>

                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        msg.isRead 
                          ? 'bg-emerald-500/10 text-emerald-500' 
                          : 'bg-brand-cyan/15 text-brand-cyan animate-pulse'
                      }`}>
                        {msg.isRead ? (
                          <>
                            <CheckCheck size={10} /> Read
                          </>
                        ) : (
                          <>
                            <Clock size={10} /> Unread
                          </>
                        )}
                      </span>
                    </td>

                    <td className="p-4 text-center text-xs text-slate-500 dark:text-gray-400 font-medium">
                      <div className="flex items-center justify-center gap-1.5">
                        <Calendar size={12} className="text-slate-400" />
                        <span>{formatDate(msg.createdAt).split(',')[0]}</span>
                      </div>
                    </td>

                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-2.5">
                        <button
                          onClick={() => handleOpenDetail(msg)}
                          className="p-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-500 hover:text-brand-cyan transition-colors cursor-pointer"
                          aria-label="View message"
                        >
                          <Eye size={12} />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(msg)}
                          className="p-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-500 hover:text-red-500 transition-colors cursor-pointer"
                          aria-label="Delete message"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* DETAIL MODAL */}
      {isDetailOpen && selectedMessage && (
        <div className="fixed inset-0 bg-slate-950/40 dark:bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div 
            className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-2xl p-6 sm:p-8 space-y-6 relative animate-in fade-in zoom-in duration-200"
            role="dialog"
            aria-modal="true"
          >
            <button
              onClick={() => setIsDetailOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              aria-label="Close dialog"
            >
              <X size={16} />
            </button>

            <div className="space-y-1">
              <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Mail className="text-brand-indigo" size={20} /> Message Details
              </h3>
              <p className="text-slate-500 dark:text-gray-400 text-xs">Received {formatDate(selectedMessage.createdAt)}</p>
            </div>

            {/* Sender details panel */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 space-y-2">
              <div className="flex flex-col sm:flex-row sm:justify-between text-xs gap-1 sm:gap-4">
                <p className="text-slate-500">Sender Name:</p>
                <p className="font-semibold text-slate-800 dark:text-gray-200">{selectedMessage.name}</p>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between text-xs gap-1 sm:gap-4 border-t border-slate-200/50 dark:border-white/5 pt-2">
                <p className="text-slate-500">Sender Email:</p>
                <a 
                  href={`mailto:${selectedMessage.email}`}
                  className="font-mono text-brand-indigo hover:text-brand-cyan hover:underline transition-colors break-all"
                >
                  {selectedMessage.email}
                </a>
              </div>
            </div>

            {/* Message Body */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-500 dark:text-gray-400 font-semibold block">Message Content:</label>
              <div className="w-full text-xs sm:text-sm bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 rounded-2xl px-4 py-4 text-slate-950 dark:text-slate-100 max-h-56 overflow-y-auto whitespace-pre-wrap leading-relaxed shadow-inner">
                {selectedMessage.message}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-white/5">
              <button
                type="button"
                onClick={() => handleOpenDelete(selectedMessage)}
                className="flex items-center gap-1.5 px-4 py-2 border border-red-500/20 hover:border-red-500 bg-red-500/5 text-red-500 hover:text-white rounded-xl text-xs font-semibold cursor-pointer transition-all"
              >
                <Trash2 size={12} /> Delete Message
              </button>

              <button
                type="button"
                onClick={() => setIsDetailOpen(false)}
                className="px-5 py-2.5 bg-gradient-to-r from-brand-indigo to-indigo-600 text-white rounded-xl text-xs font-semibold cursor-pointer hover:shadow-lg transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteOpen && deletingMessage && (
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
              <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white">Delete Message?</h3>
              <p className="text-slate-500 dark:text-gray-400 text-xs leading-relaxed">
                Are you sure you want to delete the message from <span className="font-semibold text-slate-800 dark:text-white">"{deletingMessage.name}"</span>? This action cannot be undone.
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
                className="flex items-center gap-1.5 px-5 py-2.5 bg-red-650 hover:bg-red-700 text-white rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    Deleting... <Loader2 size={12} className="animate-spin" />
                  </>
                ) : (
                  'Delete Message'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
