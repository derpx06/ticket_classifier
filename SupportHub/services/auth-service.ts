import api from './api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  companyId?: string;
  companyUuid?: string;
  company?: any;
  companyRole?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/auth/login', { email, password });
  return response.data;
};
