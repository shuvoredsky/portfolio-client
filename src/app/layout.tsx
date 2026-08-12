import type { Metadata } from 'next';
import { Inter, Sora } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '../components/ThemeProvider';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ChatWidget from '../components/ChatWidget';
import { Toaster } from 'sonner';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const sora = Sora({
  variable: '--font-sora',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Shuvo Chakrabrati | High-End Creative Developer',
  description: 'Production-grade animated portfolio showcasing projects, experience, and tech stack.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${sora.variable}`} suppressHydrationWarning>
      <body className="antialiased min-h-screen flex flex-col justify-between overflow-x-hidden">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {/* Subtle noise grain filter overlay */}
          <div className="noise-overlay" />

          {/* Background Decorative Layer (Constrained to prevent viewport overflow) */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {/* Animated decorative glow blobs in the background */}
            <div className="absolute top-[10%] left-[5%] w-72 h-72 rounded-full bg-brand-indigo/5 dark:bg-brand-indigo/10 blur-3xl animate-blob pointer-events-none" />
            <div className="absolute top-[40%] right-[5%] w-96 h-96 rounded-full bg-brand-cyan/5 blur-3xl animate-blob pointer-events-none" style={{ animationDelay: '2s' }} />
            <div className="absolute bottom-[20%] left-[10%] w-80 h-80 rounded-full bg-brand-indigo/5 blur-3xl animate-blob pointer-events-none" style={{ animationDelay: '4s' }} />
          </div>

          <Navbar />
          
          <main className="flex-grow pt-24 pb-12 z-10 relative">
            {children}
          </main>
          
          <Footer />
          <ChatWidget />
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
