'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Mail, Phone, MapPin, Send, Loader2, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type ContactSchema = z.infer<typeof contactSchema>;

export default function ContactSection() {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactSchema>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (values: ContactSchema) => {
    setIsLoading(true);
    try {
      await api.submitContactMessage(values);
      toast.success('Your message has been sent successfully!');
      reset();
    } catch (error) {
      console.error('Contact error:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="contact" className="py-20 space-y-12 scroll-mt-24">
      {/* Title */}
      <div className="space-y-2">
        <h2 className="font-heading text-3xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
          <MessageSquare className="text-brand-indigo" size={28} /> Get In Touch
        </h2>
        <p className="text-slate-650 dark:text-gray-400 text-sm md:text-base max-w-xl">
          Have a question or want to work together? Drop a message below and I will get back to you.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-stretch">
        {/* Contact Info Column */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="md:col-span-2 glass-panel p-8 rounded-3xl border border-white/5 flex flex-col justify-between space-y-8"
        >
          <div className="space-y-6">
            <h3 className="font-heading text-xl font-bold text-slate-900 dark:text-white">Contact Information</h3>
            <p className="text-slate-600 dark:text-gray-400 text-sm leading-relaxed">
              Feel free to reach out via email or phone. I will do my best to respond within 24 hours.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4 group">
              <div className="p-3 rounded-2xl bg-brand-indigo/5 border border-brand-indigo/25 text-brand-indigo group-hover:scale-105 transition-transform">
                <Mail size={18} />
              </div>
              <div>
                <p className="text-[10px] text-gray-500 font-semibold uppercase">Email</p>
                <a href="mailto:kumarshuvo265@gmail.com" className="text-sm font-semibold text-slate-750 dark:text-slate-300 hover:text-brand-cyan transition-colors">
                  kumarshuvo265@gmail.com
                </a>
              </div>
            </div>

            <div className="flex items-center gap-4 group">
              <div className="p-3 rounded-2xl bg-brand-indigo/5 border border-brand-indigo/25 text-brand-indigo group-hover:scale-105 transition-transform">
                <Phone size={18} />
              </div>
              <div>
                <p className="text-[10px] text-gray-500 font-semibold uppercase">Phone</p>
                <a href="tel:+8801732629543" className="text-sm font-semibold text-slate-755 dark:text-slate-300 hover:text-brand-cyan transition-colors">
                  +880 1732-629543
                </a>
              </div>
            </div>

            <div className="flex items-center gap-4 group">
              <div className="p-3 rounded-2xl bg-brand-indigo/5 border border-brand-indigo/25 text-brand-indigo group-hover:scale-105 transition-transform">
                <MapPin size={18} />
              </div>
              <div>
                <p className="text-[10px] text-gray-500 font-semibold uppercase">Location</p>
                <span className="text-sm font-semibold text-slate-750 dark:text-slate-300">
                  Dhaka, Bangladesh
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Contact Form Column */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="md:col-span-3 glass-panel p-8 rounded-3xl border border-white/5"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-500 dark:text-gray-400 font-semibold">Your Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  {...register('name')}
                  className="w-full text-sm bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-indigo transition-colors text-slate-900 dark:text-white"
                />
                {errors.name && (
                  <span className="text-[10px] text-red-400 font-semibold">{errors.name.message}</span>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-500 dark:text-gray-400 font-semibold">Your Email</label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  {...register('email')}
                  className="w-full text-sm bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-indigo transition-colors text-slate-900 dark:text-white"
                />
                {errors.email && (
                  <span className="text-[10px] text-red-400 font-semibold">{errors.email.message}</span>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-500 dark:text-gray-400 font-semibold">Message</label>
              <textarea
                rows={4}
                placeholder="Enter project details here..."
                {...register('message')}
                className="w-full text-sm bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl p-4 focus:outline-none focus:border-brand-indigo transition-colors text-slate-900 dark:text-white resize-none"
              />
              {errors.message && (
                <span className="text-[10px] text-red-400 font-semibold">{errors.message.message}</span>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-brand-indigo to-indigo-600 text-white transition-all duration-300 hover:shadow-lg hover:shadow-brand-indigo/15 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  Sending... <Loader2 size={16} className="animate-spin" />
                </>
              ) : (
                <>
                  Send Message <Send size={14} />
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
