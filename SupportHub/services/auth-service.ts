import api from './api';

/** Organization payload returned with login/register (`buildUserResponse` on the API). */
export interface UserCompany {
  uuid: string;
  name: string;
  countryCode: string | null;
  about: string | null;
  website: string | null;
  industry: string | null;
  phone: string | null;
}

/** Team role + permissions from `company_roles`. */
export interface CompanyRoleDetail {
  id: number;
  name: string;
  baseRole: string;
  permissions: Record<string, unknown>;
}

export interface User {
  id: string | number;
  name: string;
  email: string;
  role: string;
  companyId?: string | number;
  companyUuid?: string;
  company?: UserCompany;
  companyRole?: CompanyRoleDetail | null;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/auth/login', { email, password });
  return response.data;
};
