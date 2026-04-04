import api from './api';

export interface CompanyRoleRef {
  id: number;
  name: string;
  baseRole: string;
}

export interface User {
  id: string | number;
  name: string;
  email: string;
  role: string;
  companyId?: string | number;
  companyUuid?: string;
  company?: unknown;
  companyRole?: CompanyRoleRef | null;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/auth/login', { email, password });
  return response.data;
};
