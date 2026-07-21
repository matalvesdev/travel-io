const API_BASE_URL = '';
const DEFAULT_TIMEOUT = 30000;

interface RequestOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  timeout?: number;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

class ApiClient {
  private baseUrl: string;
  private accessToken: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setAccessToken(token: string | null) {
    this.accessToken = token;
    if (token) {
      localStorage.setItem('accessToken', token);
    } else {
      localStorage.removeItem('accessToken');
    }
  }

  getAccessToken(): string | null {
    if (!this.accessToken) {
      this.accessToken = typeof window !== 'undefined'
        ? localStorage.getItem('accessToken')
        : null;
    }
    return this.accessToken;
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { method = 'GET', body, headers = {}, timeout = DEFAULT_TIMEOUT } = options;

    const allHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };

    const token = this.getAccessToken();
    if (token) {
      allHeaders['Authorization'] = `Bearer ${token}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method,
        headers: allHeaders,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new ApiError(error.message || `HTTP error! status: ${response.status}`, response.status);
      }

      return response.json();
    } catch (err) {
      if (err instanceof ApiError) throw err;
      if (err instanceof DOMException && err.name === 'AbortError') {
        throw new ApiError('Request timed out', 408);
      }
      throw new ApiError(err instanceof Error ? err.message : 'Network request failed', 0);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async get<T>(endpoint: string, timeout?: number): Promise<T> {
    return this.request<T>(endpoint, { timeout });
  }

  async post<T>(endpoint: string, body?: unknown, timeout?: number): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', body, timeout });
  }

  async put<T>(endpoint: string, body?: unknown, timeout?: number): Promise<T> {
    return this.request<T>(endpoint, { method: 'PUT', body, timeout });
  }

  async delete<T>(endpoint: string, timeout?: number): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', timeout });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

export type { ApiResponse } from '@/types/shared';
