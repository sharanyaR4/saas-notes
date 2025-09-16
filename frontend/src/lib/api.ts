import { LoginRequest, Token } from '@/types/auth';
import { Note, NoteCreate, NoteUpdate } from '@/types/note';
import { UpgradeResponse } from '@/types/tenant';
import { getToken } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class ApiError extends Error {
  status: number;
  
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      errorData.detail || `HTTP error! status: ${response.status}`,
      response.status
    );
  }

  return response.json();
}

export const authApi = {
  login: (data: LoginRequest): Promise<Token> =>
    apiRequest<Token>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

export const notesApi = {
  getAll: (): Promise<Note[]> =>
    apiRequest<Note[]>('/notes'),

  getById: (id: number): Promise<Note> =>
    apiRequest<Note>(`/notes/${id}`),

  create: (data: NoteCreate): Promise<Note> =>
    apiRequest<Note>('/notes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: NoteUpdate): Promise<Note> =>
    apiRequest<Note>(`/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: number): Promise<{ message: string }> =>
    apiRequest<{ message: string }>(`/notes/${id}`, {
      method: 'DELETE',
    }),
};

export const tenantApi = {
  upgrade: (slug: string): Promise<UpgradeResponse> =>
    apiRequest<UpgradeResponse>(`/tenants/${slug}/upgrade`, {
      method: 'POST',
    }),
};

export const healthApi = {
  check: (): Promise<{ status: string }> =>
    apiRequest<{ status: string }>('/health'),
};

export { ApiError };