import Constants from 'expo-constants';
import { Platform } from 'react-native';

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  token?: string | null;
  body?: unknown;
};

type ApiError = Error & {
  status?: number;
};

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, '');
}

function resolveApiBaseUrl() {
  const envUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
  if (envUrl) {
    return trimTrailingSlash(envUrl);
  }

  const hostUri = Constants.expoConfig?.hostUri;
  const host = hostUri?.split(':')[0];
  if (host) {
    return `http://${host}:5001/api`;
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5001/api';
  }

  return 'http://127.0.0.1:5001/api';
}

export const API_BASE_URL = resolveApiBaseUrl();

async function parseResponse(response: Response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}) {
  const method = options.method ?? 'GET';
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  const payload = (await parseResponse(response)) as
    | { data?: T; message?: string; errors?: Array<{ message?: string }> }
    | null;

  if (!response.ok) {
    const error = new Error(
      payload?.message || payload?.errors?.[0]?.message || `Request failed (${response.status})`,
    ) as ApiError;
    error.status = response.status;
    throw error;
  }

  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload.data as T) ?? (null as T);
  }

  return payload as T;
}
