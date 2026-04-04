import api from './api';

export interface TeamMember {
  id: number;
  fullName: string;
  email: string;
  systemRole: string;
  companyRole: { id: number; name: string; baseRole: string } | null;
}

function pickMember(raw: unknown): TeamMember | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const id = typeof o.id === 'number' ? o.id : Number(o.id);
  if (!Number.isInteger(id)) return null;
  const fullName = typeof o.fullName === 'string' ? o.fullName : '';
  const email = typeof o.email === 'string' ? o.email : '';
  const systemRole = typeof o.systemRole === 'string' ? o.systemRole : '';
  let companyRole: TeamMember['companyRole'] = null;
  const cr = o.companyRole;
  if (cr && typeof cr === 'object') {
    const r = cr as Record<string, unknown>;
    const rid = typeof r.id === 'number' ? r.id : Number(r.id);
    const name = typeof r.name === 'string' ? r.name : '';
    const baseRole = typeof r.baseRole === 'string' ? r.baseRole : '';
    if (Number.isInteger(rid)) companyRole = { id: rid, name, baseRole };
  }
  return { id, fullName, email, systemRole, companyRole };
}

export async function listTeamMembers(): Promise<TeamMember[]> {
  const response = await api.get<{ members?: unknown[] }>('/teams/members');
  const list = Array.isArray(response.data.members) ? response.data.members : [];
  return list.map(pickMember).filter((m): m is TeamMember => m != null);
}
