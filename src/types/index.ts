export type TechCategory = 'FRONTEND' | 'BACKEND' | 'TOOLS' | 'DESIGN' | 'DEPLOYMENT' | 'AI_ML';

export interface Admin {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  liveLink?: string | null;
  githubLink?: string | null;
  image?: string | null;
  order: number;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TechStack {
  id: string;
  name: string;
  icon?: string | null;
  category: TechCategory;
  order: number;
}

export interface Experience {
  id: string;
  title: string;
  company: string;
  location?: string | null;
  duration: string;
  description: string;
  isInternship: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  department?: string | null;
  session: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface AboutContent {
  id: string;
  journeyText: string;
  workText: string;
  hobbiesText: string;
  profileImageUrl?: string | null;
  heroBackgroundUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

