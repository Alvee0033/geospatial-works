'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  Users,
  UserPlus,
  Mail,
  Phone,
  ShieldCheck,
  Download,
  Edit2,
  Trash2,
  Lock,
  Building,
  User,
  CheckCircle,
  Search,
  Briefcase,
  Layers,
  Filter,
  X,
  Sparkles,
  CheckCircle2,
  UserCheck
} from 'lucide-react';
import { ExportUtils } from '@/lib/exportUtils';
import { ApiClient } from '@/lib/api';
import { UserAvatar } from '@/components/ui/UserAvatar';

export default function EmployeesPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'project_manager' | 'project_member'>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formDepartment, setFormDepartment] = useState('GIS & Survey');
  const [formDesignation, setFormDesignation] = useState('Survey Specialist');
  const [formRole, setFormRole] = useState('project_member');
  const [formAssignedProjects, setFormAssignedProjects] = useState<string[]>([]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const [userData, projData] = await Promise.all([
        ApiClient.getUsers().catch(() => []),
        ApiClient.getProjects().catch(() => []),
      ]);
      setUsers(userData || []);
      setProjects(projData || []);
    } catch (e) {
      console.error('Failed fetching users:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenAdd = () => {
    setFormName('');
    setFormEmail('');
    setFormPassword('password123');
    setFormPhone('+880 1711-');
    setFormDepartment('GIS & Remote Sensing');
    setFormDesignation('Field Specialist');
    setFormRole('project_member');
    setFormAssignedProjects([]);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (u: any) => {
    setUserToEdit(u);
    setFormName(u.name || u.full_name || '');
    setFormEmail(u.email || '');
    setFormPhone(u.phone || '');
    setFormDepartment(u.department || 'General');
    setFormDesignation(u.designation || 'Staff');
    setFormRole(u.role || 'project_member');
    setFormAssignedProjects(u.assignedProjectIds || u.assigned_project_ids || []);
    setIsEditModalOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        name: formName,
        email: formEmail,
        password: formPassword,
        phone: formPhone,
        department: formDepartment,
        designation: formDesignation,
        role: formRole,
        assignedProjectIds: formAssignedProjects,
      };
      await ApiClient.createUser(payload);
      setIsAddModalOpen(false);
      await fetchUsers();
    } catch (e: any) {
      alert(`Error creating staff: ${e.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userToEdit) return;
    setSubmitting(true);
    try {
      const payload = {
        name: formName,
        email: formEmail,
        phone: formPhone,
        department: formDepartment,
        designation: formDesignation,
        role: formRole,
        assignedProjectIds: formAssignedProjects,
      };
      await ApiClient.updateUser(userToEdit.id, payload);
      setIsEditModalOpen(false);
      await fetchUsers();
    } catch (e: any) {
      alert(`Error updating staff: ${e.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to deactivate ${name}?`)) return;
    try {
      await ApiClient.deleteUser(id);
      await fetchUsers();
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    }
  };

  const handleToggleStatus = async (user: any) => {
    try {
      await ApiClient.updateUserStatus(user.id, !user.isActive);
      await fetchUsers();
    } catch (e: any) {
      alert(`Error changing user status: ${e.message}`);
    }
  };

  // Enriched & Filtered Users
  const departments = useMemo(() => {
    const set = new Set<string>();
    users.forEach((u) => {
      if (u.department) set.add(u.department);
    });
    return Array.from(set);
  }, [users]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !searchQuery ||
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.designation && u.designation.toLowerCase().includes(q)) ||
        (u.department && u.department.toLowerCase().includes(q));

      if (!matchSearch) return false;
      if (roleFilter !== 'all' && u.role !== roleFilter) return false;
      if (departmentFilter !== 'all' && u.department !== departmentFilter) return false;

      return true;
    });
  }, [users, searchQuery, roleFilter, departmentFilter]);

  // Bento Statistics
  const activeCount = users.filter((u) => u.isActive !== false).length;
  const adminCount = users.filter((u) => u.role === 'admin').length;
  const pmCount = users.filter((u) => u.role === 'project_manager').length;
  const fieldStaffCount = users.filter((u) => u.role === 'project_member').length;

  const handleExport = () => {
    const rows = filteredUsers.map((u) => ({
      ID: u.id,
      Name: u.name || u.full_name || '',
      Email: u.email,
      Phone: u.phone || '',
      Department: u.department || 'General',
      Designation: u.designation || 'Staff',
      Role: (u.role || '').replace('_', ' ').toUpperCase(),
      Status: u.isActive !== false ? 'ACTIVE' : 'INACTIVE',
      'Assigned Projects': (u.assignedProjectIds || []).length,
    }));
    ExportUtils.exportToExcel(rows, 'GW_Team_Directory');
  };

  return (
    <AdminLayout
      title="Team Directory & Access"
      subtitle="Corporate directory, roles and permissions, assignment allocation"
      onRefresh={fetchUsers}
      onExport={handleExport}
      isRefreshing={loading}
      contentClassName="px-4 lg:px-6 py-4"
    >
      <div className="w-full space-y-3.5">
        {/* Bento Top Header Bar */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-2.5 flex flex-col md:flex-row md:items-center justify-between gap-2.5 shadow-2xs">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search staff, email, role, department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-7 pr-3 py-1 bg-slate-50 border border-slate-200/90 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none w-56 sm:w-72"
              />
            </div>

            {/* Role Filter Pills */}
            <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-lg text-xs">
              {(
                [
                  { id: 'all', label: `All (${users.length})` },
                  { id: 'admin', label: `Admins (${adminCount})` },
                  { id: 'project_manager', label: `PMs (${pmCount})` },
                  { id: 'project_member', label: `Specialists (${fieldStaffCount})` },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setRoleFilter(tab.id as any)}
                  className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold transition-all ${
                    roleFilter === tab.id
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Department Dropdown */}
            {departments.length > 0 && (
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="px-2.5 py-1 bg-slate-50 border border-slate-200/90 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="all">All Departments</option>
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            )}
          </div>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#10241E] hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-2xs transition-all shrink-0"
          >
            <UserPlus size={13} />
            <span>Add Staff Member</span>
          </button>
        </div>

        {/* Bento Stat Matrix: 4 Responsive Bento Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3 bg-white border border-slate-200/90 rounded-xl shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Directory</span>
              <p className="text-xl font-extrabold text-slate-900 mt-0.5">{users.length}</p>
              <span className="text-[10px] text-slate-400 font-medium">{activeCount} active personnel</span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Users size={16} />
            </div>
          </div>

          <div className="p-3 bg-white border border-slate-200/90 rounded-xl shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Admin Leads</span>
              <p className="text-xl font-extrabold text-slate-900 mt-0.5">{adminCount}</p>
              <span className="text-[10px] text-indigo-600 font-medium">Full access & billing</span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <ShieldCheck size={16} />
            </div>
          </div>

          <div className="p-3 bg-white border border-slate-200/90 rounded-xl shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Project Managers</span>
              <p className="text-xl font-extrabold text-slate-900 mt-0.5">{pmCount}</p>
              <span className="text-[10px] text-slate-400 font-medium">Leading field tracks</span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Briefcase size={16} />
            </div>
          </div>

          <div className="p-3 bg-white border border-slate-200/90 rounded-xl shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Field & GIS Crew</span>
              <p className="text-xl font-extrabold text-slate-900 mt-0.5">{fieldStaffCount}</p>
              <span className="text-[10px] text-sky-600 font-medium">Active deployments</span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center">
              <Layers size={16} />
            </div>
          </div>
        </div>

        {/* Master Bento Personnel Directory Table */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Users size={14} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Organization Roster & Security Controls
                </h3>
                <p className="text-[11px] text-slate-400">Manage user designations, departments, project assignments, and status</p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
              {filteredUsers.length} Members
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-200/90 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3.5">Personnel Name</th>
                  <th className="py-2.5 px-3.5">Email & Phone</th>
                  <th className="py-2.5 px-3.5">Department</th>
                  <th className="py-2.5 px-3.5">Designation</th>
                  <th className="py-2.5 px-3.5">Access Role</th>
                  <th className="py-2.5 px-3.5">Assigned Projects</th>
                  <th className="py-2.5 px-3.5">Status</th>
                  <th className="py-2.5 px-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => {
                  const assignedCount = (u.assignedProjectIds || u.assigned_project_ids || []).length;
                  const initial = (u.name || u.full_name || 'U').charAt(0).toUpperCase();

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3.5">
                        <div className="flex items-center gap-2.5">
                          <UserAvatar
                            src={u.avatarUrl || u.avatar_url || u.profileImageUrl}
                            name={u.name || u.full_name || 'Staff Member'}
                            size="sm"
                            shape="rounded"
                          />
                          <div>
                            <span className="font-bold text-slate-900 block">{u.name || u.full_name || 'Staff Member'}</span>
                            <span className="text-[10px] font-mono text-slate-400">ID: {u.id ? u.id.slice(0, 8) : '—'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-3.5">
                        <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                          <Mail size={12} className="text-slate-400" />
                          <span>{u.email}</span>
                        </div>
                        {u.phone && (
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5 font-mono">
                            <Phone size={11} className="text-slate-400" />
                            <span>{u.phone}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-3.5 font-semibold text-slate-700">
                        {u.department || 'Corporate'}
                      </td>
                      <td className="py-2.5 px-3.5 text-slate-800 font-medium">
                        {u.designation || 'Specialist'}
                      </td>
                      <td className="py-2.5 px-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          u.role === 'admin'
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : u.role === 'project_manager'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {u.role ? u.role.replace('_', ' ') : 'Member'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3.5 font-medium text-slate-600">
                        <span className="font-mono font-bold text-slate-800">{assignedCount}</span> projects
                      </td>
                      <td className="py-2.5 px-3.5">
                        <button
                          onClick={() => handleToggleStatus(u)}
                          title="Click to toggle active state"
                          className="cursor-pointer"
                        >
                          <StatusBadge status={u.isActive !== false ? 'active' : 'inactive'} />
                        </button>
                      </td>
                      <td className="py-2.5 px-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEdit(u)}
                            className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
                            title="Edit Staff"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u.id, u.name || 'User')}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                            title="Deactivate Staff"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                      No team members found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Staff Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-5 space-y-3.5 shadow-xl">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Add Staff Member</h3>
              <button onClick={() => setIsAddModalOpen(false)}>
                <X size={15} className="text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-2.5">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alvee Rahman"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#10241E]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="alvee@gw.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#10241E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Phone</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#10241E]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#10241E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Role</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                  >
                    <option value="project_member">Member</option>
                    <option value="project_manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Department</label>
                  <input
                    type="text"
                    value={formDepartment}
                    onChange={(e) => setFormDepartment(e.target.value)}
                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Designation</label>
                  <input
                    type="text"
                    value={formDesignation}
                    onChange={(e) => setFormDesignation(e.target.value)}
                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium"
                  />
                </div>
              </div>

              {projects.length > 0 && (
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Assign Initial Projects</label>
                  <div className="grid grid-cols-2 gap-1.5 max-h-28 overflow-y-auto border border-slate-200 rounded-lg p-2 bg-slate-50">
                    {projects.map((p) => {
                      const isAssigned = formAssignedProjects.includes(p.id);
                      return (
                        <button
                          type="button"
                          key={p.id}
                          onClick={() => {
                            if (isAssigned) {
                              setFormAssignedProjects(formAssignedProjects.filter((id) => id !== p.id));
                            } else {
                              setFormAssignedProjects([...formAssignedProjects, p.id]);
                            }
                          }}
                          className={`p-1.5 rounded text-left text-[11px] font-medium border flex items-center justify-between ${
                            isAssigned ? 'bg-white border-[#10241E] text-slate-900 shadow-2xs font-bold' : 'border-transparent text-slate-600'
                          }`}
                        >
                          <span className="truncate">{p.name}</span>
                          {isAssigned && <CheckCircle size={11} className="text-[#10241E] shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 bg-[#10241E] text-white rounded-lg text-xs font-semibold hover:bg-slate-800 disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Staff Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-5 space-y-3.5 shadow-xl">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Edit Staff Details</h3>
              <button onClick={() => setIsEditModalOpen(false)}>
                <X size={15} className="text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-2.5">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#10241E]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#10241E]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Phone</label>
                <input
                  type="text"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#10241E]"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Role</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                  >
                    <option value="project_member">Member</option>
                    <option value="project_manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Department</label>
                  <input
                    type="text"
                    value={formDepartment}
                    onChange={(e) => setFormDepartment(e.target.value)}
                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Designation</label>
                  <input
                    type="text"
                    value={formDesignation}
                    onChange={(e) => setFormDesignation(e.target.value)}
                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium"
                  />
                </div>
              </div>

              {projects.length > 0 && (
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Assigned Projects</label>
                  <div className="grid grid-cols-2 gap-1.5 max-h-28 overflow-y-auto border border-slate-200 rounded-lg p-2 bg-slate-50">
                    {projects.map((p) => {
                      const isAssigned = formAssignedProjects.includes(p.id);
                      return (
                        <button
                          type="button"
                          key={p.id}
                          onClick={() => {
                            if (isAssigned) {
                              setFormAssignedProjects(formAssignedProjects.filter((id) => id !== p.id));
                            } else {
                              setFormAssignedProjects([...formAssignedProjects, p.id]);
                            }
                          }}
                          className={`p-1.5 rounded text-left text-[11px] font-medium border flex items-center justify-between ${
                            isAssigned ? 'bg-white border-[#10241E] text-slate-900 shadow-2xs font-bold' : 'border-transparent text-slate-600'
                          }`}
                        >
                          <span className="truncate">{p.name}</span>
                          {isAssigned && <CheckCircle size={11} className="text-[#10241E] shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 bg-[#10241E] text-white rounded-lg text-xs font-semibold hover:bg-slate-800 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Update Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
