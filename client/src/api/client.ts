import { ApiResponse } from '../types';

export class ApiError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: Array<{ field: string; message: string }>;

  constructor(
    message: string,
    statusCode: number,
    code = 'API_ERROR',
    details?: Array<{ field: string; message: string }>
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

const getBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
    // Trim trailing slash
    return envUrl.trim().replace(/\/+$/, '');
  }
  // Default to relative /api (proxied in Vite dev server)
  return '/api';
};

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = getBaseUrl();
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    let response: Response;
    try {
      response = await fetch(url, {
        ...options,
        headers,
      });
    } catch (networkErr) {
      throw new ApiError(
        'Unable to connect to the ATS API server. Please check your network connection.',
        0,
        'NETWORK_ERROR'
      );
    }

    let json: ApiResponse<T>;
    try {
      json = await response.json();
    } catch {
      throw new ApiError(
        `Server returned non-JSON response (HTTP ${response.status})`,
        response.status,
        'INVALID_RESPONSE'
      );
    }

    if (!response.ok || !json.success) {
      const errorMessage =
        json.error?.message || `Request failed with status code ${response.status}`;
      const errorCode = json.error?.code || `HTTP_${response.status}`;
      throw new ApiError(errorMessage, response.status, errorCode, json.error?.details);
    }

    return json.data as T;
  }

  public async get<T>(
    endpoint: string,
    params?: Record<string, string | number | undefined | null>
  ): Promise<ApiResponse<T>> {
    let url = endpoint;
    if (params) {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          query.append(key, String(val));
        }
      });
      const queryString = query.toString();
      if (queryString) {
        url += (url.includes('?') ? '&' : '?') + queryString;
      }
    }

    const fullUrl = `${this.baseUrl}${url.startsWith('/') ? url : `/${url}`}`;

    let response: Response;
    try {
      response = await fetch(fullUrl, {
        headers: { Accept: 'application/json' },
      });
    } catch {
      throw new ApiError(
        'Unable to connect to the ATS API server. Please check your network connection.',
        0,
        'NETWORK_ERROR'
      );
    }

    let json: ApiResponse<T>;
    try {
      json = await response.json();
    } catch {
      throw new ApiError(
        `Server returned non-JSON response (HTTP ${response.status})`,
        response.status,
        'INVALID_RESPONSE'
      );
    }

    if (!response.ok || !json.success) {
      const errorMessage =
        json.error?.message || `Request failed with status code ${response.status}`;
      const errorCode = json.error?.code || `HTTP_${response.status}`;
      throw new ApiError(errorMessage, response.status, errorCode, json.error?.details);
    }

    return json;
  }

  public async post<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public async patch<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient();
