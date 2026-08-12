import { Project, TechStack, Experience, Education, ContactMessage, AboutContent, ChatMessage } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

// Public API helper
async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(options?.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch (_) {
      // Ignore JSON parsing issues on raw errors
    }
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return {} as T;
  }

  const result = await response.json();
  return result.data as T;
}

// Protected Admin API helper (proxies through Next.js API route to attach secure cookies)
async function fetchAdminJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `/api/admin${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(options?.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch (_) {
      // Ignore
    }
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return {} as T;
  }

  const result = await response.json();
  return result.data as T;
}

export const api = {
  // Public Landing Fetch Operations
  getProjects: async (): Promise<Project[]> => {
    return fetchJson<Project[]>('/projects', { next: { revalidate: 60 } });
  },
  
  getTechStacks: async (): Promise<TechStack[]> => {
    return fetchJson<TechStack[]>('/techstacks', { next: { revalidate: 300 } });
  },

  getExperiences: async (): Promise<Experience[]> => {
    return fetchJson<Experience[]>('/experiences', { next: { revalidate: 300 } });
  },

  getEducation: async (): Promise<Education[]> => {
    return fetchJson<Education[]>('/education', { next: { revalidate: 300 } });
  },

  submitContactMessage: async (data: { name: string; email: string; message: string }): Promise<ContactMessage> => {
    return fetchJson<ContactMessage>('/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  sendChatMessage: async (data: {
    message: string;
    history: ChatMessage[];
  }): Promise<{ reply: string }> => {
    return fetchJson<{ reply: string }>('/chat', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getAboutContent: async (): Promise<AboutContent> => {
    return fetchJson<AboutContent>('/about', { next: { revalidate: 300 } });
  },

  // Protected Admin Portal Operations
  getAdminStats: async (): Promise<{ projectsCount: number; techStacksCount: number; unreadMessagesCount: number }> => {
    return fetchAdminJson<{ projectsCount: number; techStacksCount: number; unreadMessagesCount: number }>('/admin/stats');
  },

  getAdminProjects: async (): Promise<Project[]> => {
    return fetchAdminJson<Project[]>('/projects');
  },

  // Projects CRUD
  createProject: async (data: Partial<Project>): Promise<Project> => {
    return fetchAdminJson<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  updateProject: async (id: string, data: Partial<Project>): Promise<Project> => {
    return fetchAdminJson<Project>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  deleteProject: async (id: string): Promise<void> => {
    return fetchAdminJson<void>(`/projects/${id}`, {
      method: 'DELETE',
    });
  },

  // TechStacks CRUD
  createTechStack: async (data: Partial<TechStack>): Promise<TechStack> => {
    return fetchAdminJson<TechStack>('/techstacks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  updateTechStack: async (id: string, data: Partial<TechStack>): Promise<TechStack> => {
    return fetchAdminJson<TechStack>(`/techstacks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  deleteTechStack: async (id: string): Promise<void> => {
    return fetchAdminJson<void>(`/techstacks/${id}`, {
      method: 'DELETE',
    });
  },

  // Experiences CRUD
  createExperience: async (data: Partial<Experience>): Promise<Experience> => {
    return fetchAdminJson<Experience>('/experiences', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  updateExperience: async (id: string, data: Partial<Experience>): Promise<Experience> => {
    return fetchAdminJson<Experience>(`/experiences/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  deleteExperience: async (id: string): Promise<void> => {
    return fetchAdminJson<void>(`/experiences/${id}`, {
      method: 'DELETE',
    });
  },

  // Education CRUD
  createEducation: async (data: Partial<Education>): Promise<Education> => {
    return fetchAdminJson<Education>('/education', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  updateEducation: async (id: string, data: Partial<Education>): Promise<Education> => {
    return fetchAdminJson<Education>(`/education/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  deleteEducation: async (id: string): Promise<void> => {
    return fetchAdminJson<void>(`/education/${id}`, {
      method: 'DELETE',
    });
  },

  // About Content update
  updateAboutContent: async (data: Partial<AboutContent>): Promise<AboutContent> => {
    return fetchAdminJson<AboutContent>('/about', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Contacts messages admin view & deletion
  getContactMessages: async (): Promise<ContactMessage[]> => {
    return fetchAdminJson<ContactMessage[]>('/contact');
  },
  deleteContactMessage: async (id: string): Promise<void> => {
    return fetchAdminJson<void>(`/contact/${id}`, {
      method: 'DELETE',
    });
  },

  // Upload operations
  uploadImage: async (file: File): Promise<{ url: string; publicId: string }> => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch('/api/admin/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      let errorMessage = `Upload failed with status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (_) {}
      throw new Error(errorMessage);
    }

    const result = await response.json();
    return result.data as { url: string; publicId: string };
  },

  deleteCloudinaryImage: async (data: { publicId?: string; url?: string }): Promise<void> => {
    const response = await fetch('/api/admin/upload', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      let errorMessage = `Deletion failed with status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (_) {}
      throw new Error(errorMessage);
    }
  },

  markContactMessageRead: async (id: string): Promise<ContactMessage> => {
    return fetchAdminJson<ContactMessage>(`/contact/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ isRead: true }),
    });
  },
};
