import { apiRequest } from '@/services/api';

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  companyId: number;
  companyUuid: string;
  companyRole?: {
    id: number;
    name: string;
    baseRole: string;
  } | null;
};

type LoginResponse = {
  token: string;
  user: AuthUser;
};

export async function loginRequest(email: string, password: string) {
  return apiRequest<LoginResponse>('/auth/login', {
    method: 'POST',
    body: { email, password },
  });
}
