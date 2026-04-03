import React, { useCallback, useEffect, useMemo, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import teamService from '../../services/teamService';
import { UsersRound, Plus, Pencil, Trash2, ShieldCheck, Settings2 } from 'lucide-react';
import { SkeletonBlock } from '../../components/feedback/Skeleton';

const TeamsSkeleton = () => (
  <div className="space-y-8">
    <section className="space-y-3">
      <SkeletonBlock className="h-7 w-48" />
      <SkeletonBlock className="h-4 w-full max-w-2xl" />
      <SkeletonBlock className="h-12 w-72 rounded-2xl" />
    </section>

    <section className="space-y-3">
      <SkeletonBlock className="h-6 w-40" />
      <SkeletonBlock className="h-4 w-96 max-w-full" />
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex justify-end border-b border-slate-100 px-4 py-3">
          <SkeletonBlock className="h-9 w-28 rounded-lg" />
        </div>
        <div className="space-y-0">
          {Array.from({ length: 4 }).map((_, rowIndex) => (
            <div key={rowIndex} className="grid grid-cols-[1.1fr_90px_150px_1.9fr_96px] gap-4 border-b border-slate-100 px-4 py-4">
              <SkeletonBlock className="h-5 w-24" />
              <SkeletonBlock className="h-5 w-12" />
              <SkeletonBlock className="h-5 w-24" />
              <SkeletonBlock className="h-5 w-full" />
              <div className="flex gap-2 justify-end">
                <SkeletonBlock className="h-9 w-9 rounded-md" />
                <SkeletonBlock className="h-9 w-9 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {Array.from({ length: 2 }).map((_, sectionIndex) => (
      <section key={sectionIndex} className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-2">
            <SkeletonBlock className="h-6 w-36" />
            <SkeletonBlock className="h-4 w-44" />
          </div>
          <SkeletonBlock className="h-9 w-32 rounded-lg" />
        </div>
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {Array.from({ length: 3 }).map((_, rowIndex) => (
            <div key={rowIndex} className="grid grid-cols-[1.1fr_1.3fr_1fr_96px] gap-4 border-b border-slate-100 px-4 py-4">
              <SkeletonBlock className="h-5 w-28" />
              <SkeletonBlock className="h-5 w-full" />
              <SkeletonBlock className="h-5 w-24" />
              <div className="flex gap-2 justify-end">
                <SkeletonBlock className="h-9 w-9 rounded-md" />
                <SkeletonBlock className="h-9 w-9 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </section>
    ))}
  </div>
);

const Teams = () => {
  const [roles, setRoles] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [roleModal, setRoleModal] = useState(null);
  const [memberModal, setMemberModal] = useState(false);
  const [editMember, setEditMember] = useState(null);

  const [roleForm, setRoleForm] = useState({
    name: '',
    description: '',
  });

  const [memberForm, setMemberForm] = useState({
    fullName: '',
    email: '',
    passcode: '',
    companyRoleId: '',
  });

  const [editForm, setEditForm] = useState({ companyRoleId: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [r, m] = await Promise.all([
        teamService.listRoles(),
        teamService.listMembers(),
      ]);
      setRoles(r);
      setMembers(m);
    } catch (e) {
      const status = e.response?.status;
      const base = e.message || 'Failed to load teams data.';
      toast.error(
        status
          ? `${base}${status === 503 ? ' (server could not update the database schema.)' : ''}`
          : base,
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const adminMembers = useMemo(
    () => members.filter((m) => m.systemRole === 'admin'),
    [members],
  );

  const membersByRoleId = useMemo(() => {
    const map = new Map();
    roles.forEach((role) => map.set(role.id, []));
    members.forEach((m) => {
      if (m.systemRole === 'admin') return;
      const rid = m.companyRole?.id;
      if (rid != null && map.has(rid)) {
        map.get(rid).push(m);
      }
    });
    return map;
  }, [roles, members]);

  const roleIds = useMemo(() => new Set(roles.map((r) => r.id)), [roles]);

  const unassignedMembers = useMemo(
    () =>
      members.filter(
        (m) => m.systemRole !== 'admin' && (!m.companyRole || !roleIds.has(m.companyRole.id)),
      ),
    [members, roleIds],
  );

  const rolesOrdered = useMemo(() => {
    return [...roles].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
  }, [roles]);

  const openCreateRole = () => {
    setRoleForm({
      name: '',
      description: '',
    });
    setRoleModal('create');
  };

  const openEditRole = (role) => {
    setRoleForm({
      name: role.name,
      description: role.description ?? '',
    });
    setRoleModal({ mode: 'edit', id: role.id });
  };

  const submitRole = async (e) => {
    e.preventDefault();
    if (!roleForm.name.trim()) {
      toast.error('Role name is required.');
      return;
    }
    try {
      if (roleModal === 'create') {
        await teamService.createRole({
          name: roleForm.name.trim(),
          description: roleForm.description.trim() || undefined,
        });
        toast.success('Role created.');
      } else if (roleModal?.mode === 'edit') {
        await teamService.updateRole(roleModal.id, {
          name: roleForm.name.trim(),
          description: roleForm.description.trim() || undefined,
        });
        toast.success('Role updated.');
      }
      setRoleModal(null);
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Could not save role.');
    }
  };

  const removeRole = async (role) => {
    if (!window.confirm(`Delete role “${role.name}”?`)) return;
    try {
      await teamService.deleteRole(role.id);
      toast.success('Role removed.');
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Could not delete role.');
    }
  };

  const openCreateMemberForRole = (role) => {
    setMemberForm({
      fullName: '',
      email: '',
      passcode: '',
      companyRoleId: String(role.id),
    });
    setMemberModal(true);
  };

  const submitMember = async (e) => {
    e.preventDefault();
    if (memberForm.passcode.length < 6) {
      toast.error('Passcode must be at least 6 characters.');
      return;
    }
    try {
      await teamService.createMember({
        fullName: memberForm.fullName.trim(),
        email: memberForm.email.trim(),
        password: memberForm.passcode,
        companyRoleId: Number(memberForm.companyRoleId),
      });
      toast.success('Team member added. They sign in with this email and passcode.');
      setMemberModal(false);
      await load();
    } catch (err) {
      toast.error(err.message || 'Could not add member.');
    }
  };

  const openEditMember = (m) => {
    if (m.systemRole === 'admin') {
      toast.error('Organization admins are managed separately.');
      return;
    }
    setEditForm({
      companyRoleId: m.companyRole?.id ?? '',
    });
    setEditMember(m);
  };

  const submitEditMember = async (e) => {
    e.preventDefault();
    if (!editForm.companyRoleId) {
      toast.error('Select a team role.');
      return;
    }
    try {
      const payload = {
        companyRoleId: Number(editForm.companyRoleId),
      };
      await teamService.updateMember(editMember.id, payload);
      toast.success('Member updated.');
      setEditMember(null);
      await load();
    } catch (err) {
      toast.error(err.message || 'Could not update member.');
    }
  };

  const removeMember = async (m) => {
    if (m.systemRole === 'admin') {
      toast.error('Cannot remove admins from this screen.');
      return;
    }
    if (!window.confirm(`Remove ${m.fullName} from the workspace?`)) return;
    try {
      await teamService.deleteMember(m.id);
      toast.success('Member removed.');
      await load();
    } catch (err) {
      toast.error(err.message || 'Could not remove member.');
    }
  };

  const MemberRow = ({ m }) => (
    <tr key={m.id} className="hover:bg-slate-50/80">
      <td className="px-4 py-3 font-medium text-slate-900">{m.fullName}</td>
      <td className="px-4 py-3 text-slate-600">{m.email}</td>
      <td className="px-4 py-3">
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => openEditMember(m)}
            className="p-1.5 text-slate-500 hover:text-primary rounded-md hover:bg-slate-100"
            title="Edit"
          >
            <Pencil size={16} />
          </button>
          <button
            type="button"
            onClick={() => removeMember(m)}
            className="p-1.5 text-slate-500 hover:text-red-600 rounded-md hover:bg-red-50"
            title="Remove"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );

  if (loading && members.length === 0 && roles.length === 0) {
    return <TeamsSkeleton />;
  }

  return (
    <div className="space-y-10">
      <Toaster position="top-right" />
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <UsersRound className="text-primary" size={28} />
          Teams
        </h1>
        <p className="text-slate-600 mt-1 text-sm max-w-2xl">
          Configure roles and rosters. New members use email + passcode at login.
        </p>
      </div>

      <>
          {/* —— Role definitions: its own block (not mixed with member rows) —— */}
          <section className="space-y-3" aria-labelledby="role-definitions-heading">
            <div className="flex items-center gap-2 text-slate-800">
              <Settings2 size={20} className="text-slate-500" />
              <h2 id="role-definitions-heading" className="text-lg font-semibold">
                Role definitions
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              Role name and description. This table is only for grouping employees—not for listing people.
            </p>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={openCreateRole}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary-dark"
                >
                  <Plus size={18} />
                  New role
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="px-4 py-3 font-medium">Role name</th>
                      <th className="px-4 py-3 font-medium">Description</th>
                      <th className="px-4 py-3 font-medium w-28">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rolesOrdered.map((role) => (
                      <tr key={role.id} className="hover:bg-slate-50/80">
                        <td className="px-4 py-3 font-medium text-slate-900">{role.name}</td>
                        <td className="px-4 py-3 text-slate-500 text-xs">{role.description || '—'}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => openEditRole(role)}
                              className="p-1.5 text-slate-500 hover:text-primary rounded-md hover:bg-slate-100"
                              title="Edit role"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeRole(role)}
                              className="p-1.5 text-slate-500 hover:text-red-600 rounded-md hover:bg-red-50"
                              title="Delete role"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* —— Administrators: separate table —— */}
          <section className="space-y-3" aria-labelledby="admins-heading">
            <h2 id="admins-heading" className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <ShieldCheck size={20} className="text-purple-600" />
              Administrators
            </h2>
            <p className="text-xs text-slate-500">Company admins (created at registration). Not editable here.</p>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="px-4 py-3 font-medium">Name</th>
                      <th className="px-4 py-3 font-medium">Email</th>
                      <th className="px-4 py-3 font-medium w-24">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {adminMembers.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-4 py-8 text-center text-slate-400 text-sm">
                          No administrators listed.
                        </td>
                      </tr>
                    ) : (
                      adminMembers.map((m) => (
                        <tr key={m.id} className="hover:bg-slate-50/80">
                          <td className="px-4 py-3 font-medium text-slate-900">{m.fullName}</td>
                          <td className="px-4 py-3 text-slate-600">{m.email}</td>
                          <td className="px-4 py-3 text-xs text-slate-400">—</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* —— One member table per role, stacked —— */}
          {rolesOrdered.map((role) => {
            const rows = membersByRoleId.get(role.id) ?? [];
            return (
              <section key={role.id} className="space-y-3" aria-labelledby={`role-members-${role.id}`}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h2
                      id={`role-members-${role.id}`}
                      className="text-lg font-semibold text-slate-800"
                    >
                      {role.name}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5 capitalize">
                      {rows.length} member{rows.length === 1 ? '' : 's'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => openCreateMemberForRole(role)}
                    className="inline-flex items-center justify-center gap-2 px-3 py-1.5 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary-dark shrink-0"
                  >
                    <Plus size={18} />
                    Add to this role
                  </button>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 text-slate-600">
                        <tr>
                          <th className="px-4 py-3 font-medium">Name</th>
                          <th className="px-4 py-3 font-medium">Email</th>
                          <th className="px-4 py-3 font-medium w-28">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {rows.length === 0 ? (
                          <tr>
                            <td
                              colSpan={3}
                              className="px-4 py-8 text-center text-slate-400 text-sm"
                            >
                              No members in this role yet.
                            </td>
                          </tr>
                        ) : (
                          rows.map((m) => (
                            <MemberRow key={m.id} m={m} />
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            );
          })}

          {unassignedMembers.length > 0 && (
            <section className="space-y-3" aria-labelledby="unassigned-heading">
              <h2 id="unassigned-heading" className="text-lg font-semibold text-amber-800">
                Without a team role
              </h2>
              <p className="text-xs text-slate-500">
                These users are not admins and have no company role assigned. Assign a role via Edit.
              </p>
              <div className="bg-amber-50/50 rounded-xl border border-amber-200/80 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-amber-100/60 text-amber-900">
                      <tr>
                        <th className="px-4 py-3 font-medium">Name</th>
                        <th className="px-4 py-3 font-medium">Email</th>
                        <th className="px-4 py-3 font-medium">System</th>
                        <th className="px-4 py-3 font-medium w-28">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-amber-100 bg-white">
                      {unassignedMembers.map((m) => (
                        <tr key={m.id} className="hover:bg-amber-50/40">
                          <td className="px-4 py-3 font-medium text-slate-900">{m.fullName}</td>
                          <td className="px-4 py-3 text-slate-600">{m.email}</td>
                          <td className="px-4 py-3 capitalize text-slate-600">{m.systemRole}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              <button
                                type="button"
                                onClick={() => openEditMember(m)}
                                className="p-1.5 text-slate-500 hover:text-primary rounded-md hover:bg-slate-100"
                              >
                                <Pencil size={16} />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeMember(m)}
                                className="p-1.5 text-slate-500 hover:text-red-600 rounded-md hover:bg-red-50"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}
        </>

      {roleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              {roleModal === 'create' ? 'Create role' : 'Edit role'}
            </h3>
            <form onSubmit={submitRole} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role name</label>
                <input
                  value={roleForm.name}
                  onChange={(e) => setRoleForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={roleForm.description}
                  onChange={(e) => setRoleForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Optional: what does this employee group handle?"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none resize-y"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRoleModal(null)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary-dark"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {memberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-1">Add team member</h3>
            <form onSubmit={submitMember} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full name</label>
                <input
                  value={memberForm.fullName}
                  onChange={(e) => setMemberForm((p) => ({ ...p, fullName: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email (login)</label>
                <input
                  type="email"
                  value={memberForm.email}
                  onChange={(e) => setMemberForm((p) => ({ ...p, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Passcode (login)
                </label>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={memberForm.passcode}
                  onChange={(e) => setMemberForm((p) => ({ ...p, passcode: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  required
                  minLength={6}
                  placeholder="Used with email on the login page"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Same credential they enter as password on sign-in—minimum 6 characters.
                </p>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMemberModal(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary-dark"
                >
                  Add member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-1">Edit member</h3>
            <p className="text-sm text-slate-500 mb-4">{editMember.fullName}</p>
            <form onSubmit={submitEditMember} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Team role</label>
                <select
                  value={editForm.companyRoleId}
                  onChange={(e) => setEditForm((p) => ({ ...p, companyRoleId: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  required
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditMember(null)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary-dark"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teams;
