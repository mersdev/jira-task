import { Task, Subtask, User } from '../types';
import { DEMO_USER } from '../mockData';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || error.errors?.join(', ') || 'Request failed');
  }
  return response.json();
};

export const api = {
  getTasks: async (): Promise<Task[]> => {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      headers: getAuthHeaders()
    });
    return handleResponse<Task[]>(response);
  },

  createTask: async (task: Omit<Task, 'id'>): Promise<Task> => {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        task: {
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority
        }
      })
    });
    return handleResponse<Task>(response);
  },

  updateTask: async (task: Task): Promise<Task> => {
    const response = await fetch(`${API_BASE_URL}/tasks/${task.id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        task: {
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority
        }
      })
    });
    return handleResponse<Task>(response);
  },

  deleteTask: async (taskId: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok && response.status !== 204) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || error.errors?.join(', ') || 'Request failed');
    }
  },

  subtasks: {
    create: async (taskId: string, title: string): Promise<Subtask> => {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/create_subtask`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          subtask: { title, completed: false }
        })
      });
      return handleResponse<Subtask>(response);
    },

    update: async (taskId: string, subtaskId: string, updates: Partial<Subtask>): Promise<Subtask> => {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/update_subtask/${subtaskId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          subtask: updates
        })
      });
      return handleResponse<Subtask>(response);
    },

    delete: async (taskId: string, subtaskId: string): Promise<void> => {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/destroy_subtask/${subtaskId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (!response.ok && response.status !== 204) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || error.errors?.join(', ') || 'Request failed');
      }
    }
  },

  auth: {
    login: async (email: string, password: string): Promise<User> => {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const data = await response.json();
      localStorage.setItem('auth_token', data.token);
      return data.user;
    },

    register: async (name: string, email: string, password: string): Promise<User> => {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Registration failed' }));
        throw new Error(error.error || error.errors?.join(', ') || 'Registration failed');
      }

      const data = await response.json();
      localStorage.setItem('auth_token', data.token);
      return data.user;
    },

    logout: async (): Promise<void> => {
      localStorage.removeItem('auth_token');
    },

    getCurrentUser: async (): Promise<User | null> => {
      const token = localStorage.getItem('auth_token');
      if (!token) return null;

      try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: getAuthHeaders()
        });

        if (!response.ok) {
          localStorage.removeItem('auth_token');
          return null;
        }

        const data = await response.json();
        return data.user;
      } catch {
        localStorage.removeItem('auth_token');
        return null;
      }
    },

    updateAvatar: async (avatarIndex: number): Promise<User> => {
      const response = await fetch(`${API_BASE_URL}/auth/avatar`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ avatarIndex })
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to update avatar' }));
        throw new Error(error.error || 'Failed to update avatar');
      }

      const data = await response.json();
      return data.user;
    }
  }
};
