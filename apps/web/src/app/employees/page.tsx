'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
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
  UserCheck,
  Clock,
} from 'lucide-react';
import { ExportUtils } from '@/lib/exportUtils';
import { ApiClient } from '@/lib/api';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { filterAssignableProjects, type AssignableProject } from '@/lib/projectAssignment';
import { useAlertModal } from '@/components/ui/AlertModal';

function ProjectAssignmentPicker({
  projects,
  selectedIds,
  onChange,
  label,
}: {
  projects: AssignableProject[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  label: string;
}) {
  const [query, setQuery] = useState('');
  const visibleProjects = useMemo(() => filterAssignableProjects(projects, query), [projects, query]);
  const selectedProjects = projects.filter((project) => selectedIds.includes(project.id));

  const toggleProject = (projectId: string) => {
    onChange(
      selectedIds.includes(projectId)
        ? selectedIds.filter((id) => id !== projectId)
        : [...selectedIds, projectId],
    );
  };

  return (
    <section aria-label={label} className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={`${label.toLowerCase().replaceAll(' ', '-')}-search`} className="text-[10px] font-bold text-slate-500 uppercase">
          {label}
        </label>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
          {selectedIds.length} selected
        </span>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="relative border-b border-slate-100">
          <Search size={14} aria-hidden="true" className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id={`${label.toLowerCase().replaceAll(' ', '-')}-search`}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search projects by name, ID, or client"
            aria-label={`Search ${label.toLowerCase()} by name, ID, or client`}
            className="h-9 w-full bg-white pl-8 pr-3 text-xs text-slate-800 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-[#10241E]/20"
          />
        </div>

        {selectedProjects.length > 0 && (
          <div className="flex flex-wrap gap-1.5 border-b border-slate-100 bg-slate-50/70 p-2" aria-label="Selected projects">
            {selectedProjects.map((project) => (
              <button
                type="button"
                key={project.id}
                onClick={() => toggleProject(project.id)}
                aria-label={`Remove ${project.name || 'project'} from ${label.toLowerCase()}`}
                className="inline-flex max-w-full items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-900 hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
              >
                <span className="max-w-[180px] truncate">{project.name || 'Untitled project'}</span>
                <X size={11} aria-hidden="true" className="shrink-0" />
              </button>
            ))}
          </div>
        )}

        <div role="group" aria-label="Available projects" className="max-h-28 overflow-y-auto p-1.5">
          {visibleProjects.length > 0 ? visibleProjects.map((project) => {
            const isSelected = selectedIds.includes(project.id);
            return (
              <button
                type="button"
                key={project.id}
                aria-pressed={isSelected}
                onClick={() => toggleProject(project.id)}
                className={`flex min-h-8 w-full items-center justify-between gap-3 rounded-md px-2.5 py-1.5 text-left text-[11px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#10241E]/30 ${
                  isSelected ? 'bg-emerald-50 text-emerald-950' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="min-w-0 truncate font-medium">{project.name || 'Untitled project'}</span>
                <span className={`grid h-4 w-4 shrink-0 place-items-center rounded border ${isSelected ? 'border-emerald-700 bg-emerald-700 text-white' : 'border-slate-300 bg-white'}`}>
                  {isSelected && <CheckCircle size={11} aria-hidden="true" />}
                </span>
              </button>
            );
          }) : (
            <p role="status" className="px-2.5 py-3 text-center text-[11px] text-slate-500">
              {projects.length === 0 ? 'No projects available to assign.' : 'No projects match your search.'}
            </p>
          )}
        </div>
      </div>
      <p className="text-[10px] text-slate-400">Select one or more projects. Click a selected project or chip to remove it.</p>
    </section>
  );
}

function EmployeesContent() {
  const searchParams = useSearchParams();
  const urlFilter = searchParams?.get('filter');

  const [users, setUsers] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'project_manager' | 'project_member'>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending'>(urlFilter === 'pending' ? 'pending' : 'all');
  const { showAlert, showConfirm } = useAlertModal();

  // Approval action feedback
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formEmployeeCode, setFormEmployeeCode] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formDepartment, setFormDepartment] = useState('GIS & Survey');
  const [formDesignation, setFormDesignation] = useState('Survey Specialist');
  const [formRole, setFormRole] = useState('project_member');
  const [formAssignedProjects, setFormAssignedProjects] = useState<string[]>([]);

  const fetchUsers = async (silent = false) => {
    if (!silent) setLoading(true);
    const results = await Promise.allSettled([ApiClient.getUsers(), ApiClient.getProjects()]);
    if (results[0].status === 'fulfilled') setUsers(results[0].value || []);
    if (results[1].status === 'fulfilled') setProjects(results[1].value || []);
    const failed = results.flatMap((result, index) => result.status === 'rejected' ? [['employees', 'projects'][index]] : []);
    setLoadError(failed.length ? `Could not refresh ${failed.join(' or ')} from the server. Showing the last records received where available.` : '');
    if (!silent) setLoading(false);
  };

  useEffect(() => {
    void fetchUsers();
    const unsubscribe = ApiClient.subscribeToDataRefresh(() => { void fetchUsers(true); });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (urlFilter === 'pending') {
      setStatusFilter('pending');
    }
  }, [urlFilter]);

  const handleOpenAdd = () => {
    setFormName('');
    setFormEmail('');
    setFormEmployeeCode('');
    setFormPassword('');
    setFormPhone('');
    setFormDepartment('');
    setFormDesignation('');
    setFormRole('project_member');
    setFormAssignedProjects([]);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (u: any) => {
    setUserToEdit(u);
    setFormName(u.name || u.full_name || '');
    setFormEmail(u.email || '');
    setFormEmployeeCode(u.employeeCode || u.employee_code || '');
    setFormPhone(u.phone || '');
    setFormDepartment(u.department || 'General');
    setFormDesignation(u.designation || 'Staff');
    setFormRole(u.role || 'project_member');
    setFormPassword('');
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
        employeeCode: formEmployeeCode.trim(),
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
      await showAlert({
        title: 'Staff Created',
        message: `Employee profile for ${formName} was created successfully.`,
        type: 'success',
      });
    } catch (e: any) {
      await showAlert({
        title: 'Error Creating Staff',
        message: e.message,
        type: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userToEdit) return;
    setSubmitting(true);
    try {
      const payload: any = {
        name: formName,
        email: formEmail,
        employeeCode: formEmployeeCode.trim(),
        phone: formPhone,
        department: formDepartment,
        designation: formDesignation,
        role: formRole,
        assignedProjectIds: formAssignedProjects,
      };
      if (formPassword && formPassword.trim().length > 0) {
        payload.password = formPassword.trim();
      }
      await ApiClient.updateUser(userToEdit.id, payload);
      setIsEditModalOpen(false);
      setFormPassword('');
      await fetchUsers();
      await showAlert({
        title: 'Staff Updated',
        message: `Profile details for ${formName} were updated successfully.`,
        type: 'success',
      });
    } catch (e: any) {
      await showAlert({
        title: 'Update Error',
        message: e.message,
        type: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    const confirmed = await showConfirm(
      `Are you sure you want to deactivate ${name}? They will lose mobile app and dashboard access.`,
      'Deactivate User'
    );
    if (!confirmed) return;
    try {
      await ApiClient.deleteUser(id);
      await fetchUsers();
      await showAlert({
        title: 'User Deactivated',
        message: `${name} has been deactivated.`,
        type: 'success',
      });
    } catch (e: any) {
      await showAlert({
        title: 'Deactivation Error',
        message: e.message,
        type: 'error',
      });
    }
  };

  const handleToggleStatus = async (user: any) => {
    const newStatus = !user.isActive;
    const actionLabel = newStatus ? 'activate' : 'deactivate';
    const confirmed = await showConfirm(
      `Are you sure you want to ${actionLabel} account for ${user.name || user.email}?`,
      `${actionLabel === 'activate' ? 'Activate' : 'Deactivate'} Account`
    );
    if (!confirmed) return;
    try {
      await ApiClient.updateUserStatus(user.id, newStatus);
      await fetchUsers();
      await showAlert({
        title: `Account ${newStatus ? 'Activated' : 'Deactivated'}`,
        message: `Account status updated for ${user.name || user.email}.`,
        type: 'success',
      });
    } catch (e: any) {
      await showAlert({
        title: 'Status Update Error',
        message: e.message,
        type: 'error',
      });
    }
  };

  const handleApproveUser = async (user: any) => {
    setApprovingId(user.id);
    try {
      await ApiClient.updateUserStatus(user.id, true);
      setSuccessToast(`Account approved for ${user.name || user.email}! An approval confirmation email containing the mobile app download link has been dispatched.`);
      setTimeout(() => setSuccessToast(null), 8000);
      await fetchUsers();
      await showAlert({
        title: 'Employee Approved',
        message: `Account approved for ${user.name || user.email}. Approval email with mobile app download instructions was dispatched to ${user.email}.`,
        type: 'success',
      });
    } catch (e: any) {
      await showAlert({
        title: 'Approval Error',
        message: e.message,
        type: 'error',
      });
    } finally {
      setApprovingId(null);
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
      ((u.employeeCode || u.employee_code || '').toLowerCase().includes(q)) ||
        (u.designation && u.designation.toLowerCase().includes(q)) ||
        (u.department && u.department.toLowerCase().includes(q));

      if (!matchSearch) return false;
      if (roleFilter !== 'all' && u.role !== roleFilter) return false;
      if (departmentFilter !== 'all' && u.department !== departmentFilter) return false;
      if (statusFilter === 'active' && u.isActive === false) return false;
      if (statusFilter === 'pending' && u.isActive !== false) return false;

      if (projectFilter !== 'all') {
        const assignedIds: string[] = u.assignedProjectIds || u.assigned_project_ids || [];
        if (projectFilter === 'unassigned') {
          if (assignedIds.length > 0) return false;
        } else {
          if (!assignedIds.includes(projectFilter)) return false;
        }
      }

      return true;
    });
  }, [users, searchQuery, roleFilter, departmentFilter, statusFilter, projectFilter]);

  // Bento Statistics
  const activeCount = users.filter((u) => u.isActive !== false).length;
  const pendingCount = users.filter((u) => u.isActive === false).length;
  const adminCount = users.filter((u) => u.role === 'admin').length;
  const pmCount = users.filter((u) => u.role === 'project_manager').length;
  const fieldStaffCount = users.filter((u) => u.role === 'project_member').length;

  const handleExport = () => {
    const rows = filteredUsers.map((u) => ({
      ID: u.employeeCode || u.employee_code || '',
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
      onRefresh={() => { void fetchUsers(); }}
      onExport={handleExport}
      isRefreshing={loading}
      contentClassName="px-4 lg:px-6 py-4"
    >
      {successToast && (
        <div role="status" className="mb-3.5 flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-900 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span className="font-semibold">{successToast}</span>
          </div>
          <button type="button" onClick={() => setSuccessToast(null)} className="text-emerald-700 hover:text-emerald-900 font-bold text-sm">✕</button>
        </div>
      )}
      {loadError && <div role="alert" className="mb-3 flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900"><span>{loadError}</span><button type="button" onClick={() => { void fetchUsers(); }} className="font-semibold underline">Retry</button></div>}
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

            {/* Status Filter Pills (All / Active / Pending Approval) */}
            <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold transition-all ${
                  statusFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({users.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('active')}
                className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold transition-all ${
                  statusFilter === 'active'
                    ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Active ({activeCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('pending')}
                className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold transition-all flex items-center gap-1.5 ${
                  statusFilter === 'pending'
                    ? 'bg-amber-600 text-white shadow-2xs font-bold'
                    : pendingCount > 0
                    ? 'text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Pending Approval</span>
                {pendingCount > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    statusFilter === 'pending' ? 'bg-white text-amber-900' : 'bg-amber-500 text-white animate-pulse'
                  }`}>
                    {pendingCount}
                  </span>
                )}
              </button>
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

            {/* Project Assignment Dropdown */}
            {projects.length > 0 && (
              <select
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
                className="px-2.5 py-1 bg-slate-50 border border-slate-200/90 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer max-w-[170px] truncate"
              >
                <option value="all">All Projects</option>
                <option value="unassigned">Unassigned Only</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name || p.projectId || 'Untitled Project'}
                  </option>
                ))}
              </select>
            )}

            {/* Clear All Filters */}
            {(searchQuery || roleFilter !== 'all' || departmentFilter !== 'all' || projectFilter !== 'all' || statusFilter !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setRoleFilter('all');
                  setDepartmentFilter('all');
                  setProjectFilter('all');
                  setStatusFilter('all');
                }}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors"
                title="Reset all filters"
              >
                <X size={12} />
                <span>Reset</span>
              </button>
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

        {/* PENDING EMPLOYEE APPROVALS ALERT & ACTION HERO CARD */}
        {pendingCount > 0 && (
          <div className="rounded-xl border-2 border-amber-300 bg-linear-to-r from-amber-50/90 via-orange-50/40 to-amber-50/70 p-4 shadow-sm animate-in fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-amber-200/80">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs shrink-0">
                  <UserCheck size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-amber-950">
                      Pending Employee Registration Approvals
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-amber-500 text-white shadow-2xs">
                      {pendingCount} {pendingCount === 1 ? 'applicant' : 'applicants'}
                    </span>
                  </div>
                  <p className="text-xs text-amber-800/90 mt-0.5">
                    The following personnel registered via the employee registration portal and require administrative verification to access the mobile application and system features.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setStatusFilter(statusFilter === 'pending' ? 'all' : 'pending')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    statusFilter === 'pending'
                      ? 'bg-amber-600 text-white'
                      : 'bg-white text-amber-900 border border-amber-300 hover:bg-amber-100/60'
                  }`}
                >
                  {statusFilter === 'pending' ? 'Show All Directory' : 'Filter Table to Pending'}
                </button>
              </div>
            </div>

            {/* Quick Approval Roster Cards */}
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {users.filter(u => u.isActive === false).map((pendingUser) => (
                <div
                  key={pendingUser.id}
                  className="bg-white/95 rounded-lg border border-amber-200 p-3 shadow-2xs flex flex-col justify-between hover:border-amber-400 transition-all"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center shrink-0 border border-amber-200">
                          {(pendingUser.name || pendingUser.full_name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {pendingUser.name || pendingUser.full_name || 'Pending Employee'}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate">{pendingUser.email}</p>
                        </div>
                      </div>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 shrink-0">
                        Pending
                      </span>
                    </div>

                    <div className="mt-2.5 grid grid-cols-2 gap-1.5 text-[11px] text-slate-600 bg-slate-50 p-2 rounded-md border border-slate-100">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-slate-400 block">Department</span>
                        <span className="font-medium text-slate-800 truncate block">
                          {pendingUser.department || 'General'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase font-bold text-slate-400 block">Designation</span>
                        <span className="font-medium text-slate-800 truncate block">
                          {pendingUser.designation || 'Staff'}
                        </span>
                      </div>
                      {pendingUser.phone && (
                        <div className="col-span-2 mt-0.5">
                          <span className="text-[9px] uppercase font-bold text-slate-400 block">Phone</span>
                          <span className="font-medium text-slate-800 truncate block">{pendingUser.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(pendingUser)}
                        className="px-2 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded text-[11px] font-semibold transition-colors"
                        title="Edit department or designation before approval"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteUser(pendingUser.id, pendingUser.name || 'User')}
                        className="px-2 py-1 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded text-[11px] font-semibold transition-colors"
                        title="Decline registration request"
                      >
                        Decline
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleApproveUser(pendingUser)}
                      disabled={approvingId === pendingUser.id}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-md text-xs font-bold shadow-2xs transition-all disabled:opacity-50"
                    >
                      <CheckCircle2 size={13} />
                      <span>{approvingId === pendingUser.id ? 'Approving…' : 'Approve & Grant Access'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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

          {statusFilter === 'pending' && (
            <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-lg flex items-center justify-between text-xs text-amber-900 animate-in fade-in">
              <div className="flex items-center gap-2">
                <Clock size={15} className="text-amber-700 shrink-0" />
                <span>Showing <strong>{filteredUsers.length}</strong> employee registration(s) awaiting approval. Approving an account immediately enables mobile app login and dispatches confirmation instructions.</span>
              </div>
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className="text-amber-800 underline font-semibold hover:text-amber-950 shrink-0 text-xs"
              >
                Show All
              </button>
            </div>
          )}

          <div className="overflow-x-auto border border-slate-200/90 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3.5">Personnel Name</th>
                  <th className="py-2.5 px-3.5">Employee ID</th>
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
                    <tr
                      key={u.id}
                      className={`transition-colors ${
                        u.isActive === false
                          ? 'bg-amber-50/60 hover:bg-amber-100/60 border-l-4 border-l-amber-500'
                          : 'hover:bg-slate-50/80'
                      }`}
                    >
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
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-3.5 font-mono font-semibold text-slate-700">{u.employeeCode || u.employee_code || '—'}</td>
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
                        {u.isActive === false ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            <Clock size={10} className="text-amber-600" />
                            <span>Pending Approval</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => handleToggleStatus(u)}
                            title="Click to toggle active state"
                            className="cursor-pointer"
                          >
                            <StatusBadge status="active" />
                          </button>
                        )}
                      </td>
                      <td className="py-2.5 px-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {u.isActive === false && (
                            <button
                              onClick={() => handleApproveUser(u)}
                              disabled={approvingId === u.id}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-[11px] font-bold shadow-2xs transition-all disabled:opacity-50 mr-1"
                              title="Approve Employee and dispatch App Access Email"
                            >
                              <UserCheck size={12} />
                              <span>{approvingId === u.id ? 'Approving…' : 'Approve & Grant Access'}</span>
                            </button>
                          )}
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
                    <td colSpan={9} className="py-8 text-center text-slate-400 text-xs">
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

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Employee ID *</label>
                <input
                  type="text"
                  required
                  maxLength={64}
                  placeholder="Enter the staff ID"
                  value={formEmployeeCode}
                  onChange={(e) => setFormEmployeeCode(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#10241E]"
                />
                <p className="mt-1 text-[10px] text-slate-400">Employees can use this ID or their email to sign in.</p>
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
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">System Access Role</label>
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
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Position / Designation</label>
                  <input
                    type="text"
                    list="employee-designation-options"
                    value={formDesignation}
                    onChange={(e) => setFormDesignation(e.target.value)}
                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium"
                  />
                  <datalist id="employee-designation-options">
                    <option value="General Employee" />
                    <option value="Director" />
                    <option value="Administration" />
                    <option value="CEO" />
                    <option value="Others" />
                  </datalist>
                </div>
              </div>

              <ProjectAssignmentPicker
                projects={projects}
                selectedIds={formAssignedProjects}
                onChange={setFormAssignedProjects}
                label="Assign Initial Projects"
              />

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
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Employee ID *</label>
                <input
                  type="text"
                  required
                  maxLength={64}
                  placeholder="Enter the staff ID"
                  value={formEmployeeCode}
                  onChange={(e) => setFormEmployeeCode(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#10241E]"
                />
                <p className="mt-1 text-[10px] text-slate-400">Employees can use this ID or their email to sign in.</p>
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

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">
                    Reset Password (Optional)
                  </label>
                  <span className="text-[10px] text-slate-400">Leave blank to keep existing password</span>
                </div>
                <input
                  type="password"
                  placeholder="Enter new password (min. 6 chars)"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#10241E]"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">System Access Role</label>
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
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Position / Designation</label>
                  <input
                    type="text"
                    list="employee-designation-options"
                    value={formDesignation}
                    onChange={(e) => setFormDesignation(e.target.value)}
                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium"
                  />
                  <datalist id="employee-designation-options">
                    <option value="General Employee" />
                    <option value="Director" />
                    <option value="Administration" />
                    <option value="CEO" />
                    <option value="Others" />
                  </datalist>
                </div>
              </div>

              <ProjectAssignmentPicker
                projects={projects}
                selectedIds={formAssignedProjects}
                onChange={setFormAssignedProjects}
                label="Assigned Projects"
              />

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

export default function EmployeesPage() {
  return (
    <Suspense fallback={
      <AdminLayout title="Team Directory">
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-[#10241E]" />
        </div>
      </AdminLayout>
    }>
      <EmployeesContent />
    </Suspense>
  );
}
