'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Send, X, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { api } from '@/lib/api';
import { ChatMessage } from '@/types';

// Client-side schema for message input
const chatInputSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, 'Message cannot be empty')
    .max(1000, 'Message cannot exceed 1000 characters'),
});

type ChatInputSchema = z.infer<typeof chatInputSchema>;

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showWakingUp, setShowWakingUp] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: "Hi! I'm Shuvo's portfolio assistant. Ask me anything about his skills, projects, work experience, or how to contact and hire him!",
    },
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Pupil and mouse event refs for tracking
  const leftPupilRef = useRef<HTMLDivElement>(null);
  const rightPupilRef = useRef<HTMLDivElement>(null);
  const triggerContainerRef = useRef<HTMLButtonElement>(null);
  const requestRef = useRef<number | null>(null);

  // Mouse move event for googly eyes tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (requestRef.current) return;

      requestRef.current = requestAnimationFrame(() => {
        if (!triggerContainerRef.current || !leftPupilRef.current || !rightPupilRef.current) {
          requestRef.current = null;
          return;
        }

        const { clientX, clientY } = e;

        const trackEye = (eyeSelector: string, pupilRef: HTMLDivElement) => {
          const eyeEl = triggerContainerRef.current?.querySelector(eyeSelector);
          if (!eyeEl) return;

          const rect = eyeEl.getBoundingClientRect();
          const eyeCenterX = rect.left + rect.width / 2;
          const eyeCenterY = rect.top + rect.height / 2;

          const angle = Math.atan2(clientY - eyeCenterY, clientX - eyeCenterX);
          const maxDistance = 4.5; // Bounds within eye boundary

          const x = Math.cos(angle) * maxDistance;
          const y = Math.sin(angle) * maxDistance;

          gsap.to(pupilRef, {
            x,
            y,
            duration: 0.15,
            ease: 'power1.out',
            overwrite: 'auto',
          });
        };

        trackEye('.left-eye', leftPupilRef.current);
        trackEye('.right-eye', rightPupilRef.current);

        requestRef.current = null;
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  // GSAP animations for the Chat Panel container open/close transitions
  useGSAP(
    () => {
      if (!panelRef.current) return;

      if (isOpen) {
        gsap.killTweensOf(panelRef.current);
        
        // Show element and trigger a snappy, bounce entrance transition
        gsap.set(panelRef.current, { display: 'flex', visibility: 'visible', pointerEvents: 'auto' });
        gsap.fromTo(
          panelRef.current,
          { opacity: 0, scale: 0.85, y: 30 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.4,
            ease: 'back.out(1.5)',
          }
        );
      } else {
        gsap.killTweensOf(panelRef.current);

        // Accelerated closing exit transition, hiding upon completion
        gsap.to(panelRef.current, {
          opacity: 0,
          scale: 0.85,
          y: 30,
          duration: 0.25,
          ease: 'power2.in',
          onComplete: () => {
            gsap.set(panelRef.current, { display: 'none', visibility: 'hidden', pointerEvents: 'none' });
          },
        });
      }
    },
    { dependencies: [isOpen], scope: panelRef }
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<ChatInputSchema>({
    resolver: zodResolver(chatInputSchema),
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(scrollToBottom, 100);
      return () => clearTimeout(timer);
    }
  }, [messages, isLoading, isOpen]);

  const onSubmit = async (values: ChatInputSchema) => {
    const userMessage = values.message;
    reset();

    const userTurn: ChatMessage = { role: 'user', content: userMessage };
    setMessages((prev) => [...prev, userTurn]);
    setIsLoading(true);
    setShowWakingUp(false);

    // Warn visitors if Render is waking up from sleep mode
    const wakeUpTimer = setTimeout(() => setShowWakingUp(true), 4500);

    try {
      const history = messages.slice(1);
      
      const response = await api.sendChatMessage({
        message: userMessage,
        history,
      });

      setMessages((prev) => [...prev, { role: 'assistant', content: response.reply }]);
    } catch (error) {
      console.error('Chatbot API error:', error);
      
      // Inline error bubble fallback
      const errorTurn: ChatMessage = {
        role: 'assistant',
        content: "Error: I'm sorry, I'm having trouble connecting to Shuvo's portfolio server. Please try asking again in a moment.",
      };
      
      setMessages((prev) => [...prev, errorTurn]);
      toast.error('Connection issue. Failed to send message.');
    } finally {
      clearTimeout(wakeUpTimer);
      setShowWakingUp(false);
      setIsLoading(false);
    }
  };

  const toggleChat = () => setIsOpen((prev) => !prev);

  return (
    <>
      {/* Merged FAB Trigger (Googly Eyes Face) */}
      <button
        ref={triggerContainerRef}
        onClick={toggleChat}
        aria-label="Toggle chat assistant"
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center gap-1.5 shadow-lg border border-slate-200/50 dark:border-white/10 transition-all duration-300 hover:scale-110 active:scale-95 hover:shadow-brand-indigo/15 dark:hover:shadow-brand-cyan/25 z-50 cursor-pointer bg-slate-950 dark:bg-white group"
      >
        <div className="left-eye w-4 h-4 bg-white dark:bg-slate-200 rounded-full flex items-center justify-center relative border border-slate-300 dark:border-slate-800 pointer-events-none">
          <div ref={leftPupilRef} className="w-1.5 h-1.5 bg-slate-900 dark:bg-slate-950 rounded-full absolute pointer-events-none" />
        </div>
        <div className="right-eye w-4 h-4 bg-white dark:bg-slate-200 rounded-full flex items-center justify-center relative border border-slate-300 dark:border-slate-800 pointer-events-none">
          <div ref={rightPupilRef} className="w-1.5 h-1.5 bg-slate-900 dark:bg-slate-950 rounded-full absolute pointer-events-none" />
        </div>
      </button>

      {/* Expandable Chat Panel (GSAP-controlled container, with increased transparency) */}
      <div
        ref={panelRef}
        style={{ display: 'none', opacity: 0, visibility: 'hidden', pointerEvents: 'none' }}
        className="fixed bottom-24 right-4 sm:right-6 w-[calc(100vw-2rem)] h-[480px] max-h-[calc(100vh-8rem)] sm:w-[360px] sm:h-[500px] z-50 flex flex-col bg-white/40 dark:bg-slate-950/20 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200/50 dark:border-white/10"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200/50 dark:border-white/5 bg-slate-100/50 dark:bg-slate-900/50 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-brand-indigo/10 text-brand-indigo dark:text-brand-cyan">
              <Sparkles size={16} />
            </div>
            <div>
              <h3 className="font-heading text-sm font-bold text-slate-905 dark:text-white leading-tight">
                Shuvo&apos;s Assistant
              </h3>
              <p className="text-[10px] text-gray-550 dark:text-gray-400 font-medium">
                Online • Grounded on Live Data
              </p>
            </div>
          </div>
          <button
            onClick={toggleChat}
            className="text-slate-500 dark:text-gray-400 hover:text-brand-indigo dark:hover:text-brand-cyan transition-colors p-1.5 rounded-lg hover:bg-slate-200/50 dark:hover:bg-white/5 cursor-pointer"
            aria-label="Close chat"
          >
            <X size={16} />
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-grow overflow-y-auto p-4 space-y-4 scrollbar-thin">
          {messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            const isError = msg.content.startsWith('Error:');

            return (
              <div key={index} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`text-sm px-4 py-2.5 rounded-2xl max-w-[85%] leading-relaxed shadow-sm ${
                    isUser
                      ? 'bg-gradient-to-br from-brand-indigo to-indigo-600 text-white rounded-tr-none'
                      : isError
                      ? 'bg-red-500/10 border border-red-500/20 text-red-650 dark:text-red-400 rounded-tl-none flex items-start gap-2'
                      : 'bg-slate-100 dark:bg-slate-900 border border-slate-200/60 dark:border-white/5 text-slate-800 dark:text-slate-200 rounded-tl-none'
                  }`}
                >
                  {isError && <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-500" />}
                  <span>{isError ? msg.content.replace('Error: ', '') : msg.content}</span>
                </div>
              </div>
            );
          })}

          {/* Typing / Loading Indicator */}
          {isLoading && (
            <div className="flex flex-col items-start gap-1">
              <div className="flex gap-1.5 items-center bg-slate-100 dark:bg-slate-900 border border-slate-200/60 dark:border-white/5 rounded-2xl rounded-tl-none px-4 py-3.5 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-gray-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-gray-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-gray-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              {showWakingUp && (
                <span className="text-[10px] text-slate-500 dark:text-gray-400 italic animate-pulse pl-1">
                  Waking up Shuvo&apos;s server (Render free tier)... Please stand by.
                </span>
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form Footer */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="p-3 border-t border-slate-200/50 dark:border-white/5 bg-slate-100/30 dark:bg-slate-900/30 backdrop-blur-md flex gap-2"
        >
          <input
            type="text"
            autoComplete="off"
            placeholder="Ask about Shuvo's projects, skills..."
            disabled={isLoading}
            {...register('message')}
            className="flex-grow bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-white/5 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-indigo text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={isLoading || isSubmitting}
            className="p-2.5 rounded-xl bg-gradient-to-r from-brand-indigo to-indigo-600 text-white hover:opacity-95 disabled:opacity-50 transition-all flex items-center justify-center cursor-pointer hover:shadow-md hover:shadow-brand-indigo/15 shrink-0"
            aria-label="Send message"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={14} />}
          </button>
        </form>
      </div>
    </>
  );
}
