'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ApiClient } from '@/lib/api';
import {
  Briefcase,
  ArrowLeft,
  Edit,
  DollarSign,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Receipt,
  Plus,
  Trash2,
  TrendingUp,
  Percent,
  Check,
  Building,
  FileText,
  Archive,
  RotateCcw,
  UserPlus,
  CheckSquare,
  MessageSquare,
  ChevronRight,
  Eye,
  Search,
  Filter,
  X,
  ExternalLink,
  ShieldCheck,
  Shield,
  Sliders,
  XCircle,
} from 'lucide-react';
import { UserAvatar } from '@/components/ui/UserAvatar';

const ROLE_PRESETS = [
  {
    name: 'Site Lead',
    role: 'Site Lead',
    perms: {
      canViewBudget: true,
      canRecordRevenue: true,
      canViewExpenses: true,
      canCreateExpenses: true,
      canApproveExpenses: true,
      canManageTasks: true,
      canUpdateProgress: true,
      canManageTeam: true,
      canEditProject: true,
      canViewAttendance: true,
    },
  },
  {
    name: 'Field Auditor',
    role: 'Field Auditor',
    perms: {
      canViewBudget: true,
      canRecordRevenue: false,
      canViewExpenses: true,
      canCreateExpenses: false,
      canApproveExpenses: true,
      canManageTasks: false,
      canUpdateProgress: false,
      canManageTeam: false,
      canEditProject: false,
      canViewAttendance: true,
    },
  },
  {
    name: 'Site Engineer',
    role: 'Site Engineer',
    perms: {
      canViewBudget: false,
      canRecordRevenue: false,
      canViewExpenses: true,
      canCreateExpenses: true,
      canApproveExpenses: false,
      canManageTasks: true,
      canUpdateProgress: true,
      canManageTeam: false,
      canEditProject: false,
      canViewAttendance: true,
    },
  },
  {
    name: 'Field Crew',
    role: 'Field Crew',
    perms: {
      canViewBudget: false,
      canRecordRevenue: false,
      canViewExpenses: true,
      canCreateExpenses: true,
      canApproveExpenses: false,
      canManageTasks: false,
      canUpdateProgress: false,
      canManageTeam: false,
      canEditProject: false,
      canViewAttendance: true,
    },
  },
  {
    name: 'Observer',
    role: 'Observer',
    perms: {
      canViewBudget: true,
      canRecordRevenue: false,
      canViewExpenses: true,
      canCreateExpenses: false,
      canApproveExpenses: false,
      canManageTasks: false,
      canUpdateProgress: false,
      canManageTeam: false,
      canEditProject: false,
      canViewAttendance: true,
    },
  },
];

function ProjectDetailContent() {
  const router = useRouter();
  const routeParams = useParams();
  const projectId = (routeParams?.id as string) || '';

  const [project, setProject] = useState<any | null>(null);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'budget' | 'team' | 'expenses' | 'revenue' | 'tasks'>('overview');

  // Project Members & Permissions State
  const [projectMembers, setProjectMembers] = useState<any[]>([]);
  const [myPermissions, setMyPermissions] = useState<any>(null);
  const [isMemberAccessModalOpen, setIsMemberAccessModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<any | null>(null);
  const [targetUserId, setTargetUserId] = useState('');
  const [customRoleTitle, setCustomRoleTitle] = useState('Site Lead');
  const [memberPerms, setMemberPerms] = useState({
    canViewBudget: true,
    canRecordRevenue: false,
    canViewExpenses: true,
    canCreateExpenses: true,
    canApproveExpenses: false,
    canManageTasks: false,
    canUpdateProgress: false,
    canManageTeam: false,
    canEditProject: false,
    canViewAttendance: true,
  });

  // Expense filters & inspect modal
  const [expenseSearch, setExpenseSearch] = useState('');
  const [expenseCategoryFilter, setExpenseCategoryFilter] = useState('all');
  const [expenseStatusFilter, setExpenseStatusFilter] = useState('all');
  const [inspectExpense, setInspectExpense] = useState<any | null>(null);

  // Modals
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isRevenueModalOpen, setIsRevenueModalOpen] = useState(false);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);

  // Revenue Form
  const [revAmount, setRevAmount] = useState<number>(10000);
  const [revMilestone, setRevMilestone] = useState('Deliverable Milestone');
  const [revNote, setRevNote] = useState('');

  // Progress Form
  const [progressVal, setProgressVal] = useState<number>(0);
  const [progressNoteText, setProgressNoteText] = useState('');

  // Task Form
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskAssigneeId, setTaskAssigneeId] = useState('');
  const [taskBudgetLine, setTaskBudgetLine] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');

  // Team assign search
  const [memberSearch, setMemberSearch] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const loadProjectData = async () => {
    setLoading(true);
    try {
      let allExp: any[] = [];
      try {
        allExp = await ApiClient.getExpenses({ projectId });
      } catch (e) {
        console.warn('Direct expense fetch by projectId failed, falling back:', e);
      }
      if (!allExp || allExp.length === 0) {
        try {
          allExp = await ApiClient.getExpenses();
        } catch (e) {
          console.warn('Fallback expense fetch failed:', e);
        }
      }

      const [proj, pTasks, users, pMembers, myPerms] = await Promise.all([
        ApiClient.getProjectById(projectId).catch(() => null),
        ApiClient.getTasks(projectId).catch(() => []),
        ApiClient.getUsers().catch(() => []),
        ApiClient.getProjectMembers(projectId).catch(() => []),
        ApiClient.getMyProjectPermissions(projectId).catch(() => null),
      ]);

      if (proj) {
        setProject(proj);
        setProgressVal(proj.progressPercentage || proj.progress_percentage || 0);
        setSelectedMemberIds(proj.teamMemberIds || proj.team_member_ids || []);
      }
      setExpenses(allExp || []);
      setTasks(pTasks || []);
      setAllUsers(users || []);
      setProjectMembers(pMembers || (proj?.members || []));
      setMyPermissions(myPerms);
    } catch (e) {
      console.error('Failed to load project details:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjectData();
  }, [projectId]);

  if (loading) {
    return (
      <AdminLayout title="Project Details" subtitle="Loading project parameters...">
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
          <p className="text-sm font-bold text-slate-500">Loading project data...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!project) {
    return (
      <AdminLayout title="Project Details" subtitle="Project lookup failed">
        <div className="p-8 max-w-4xl mx-auto text-center space-y-4">
          <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-3xl mx-auto flex items-center justify-center">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Project Not Found</h2>
          <p className="text-sm text-slate-500">Could not retrieve project with ID: {projectId}</p>
          <button
            onClick={() => router.push('/projects')}
            className="px-6 py-2.5 bg-[#0D1117] text-white text-xs font-bold rounded-full shadow hover:bg-slate-800"
          >
            Back to Projects List
          </button>
        </div>
      </AdminLayout>
    );
  }

  // Financial calculations
  const grossValue = Number(project.grossProjectValue || project.gross_project_value || 0);
  const agreedBudget = Number(project.budget || 0);
  const advanceReceived = Number(
    project.advanceReceived ?? project.advance_received ?? project.amountReceived ?? project.amount_received ?? 0
  );
  
  // Calculate total revenue received: sum of all recorded revenue entries, or fallback to advance received
  const revenueEntries: any[] = project.revenueEntries || project.revenue_entries || [];
  const totalRevenuesRecorded = revenueEntries.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
  const amountReceived = totalRevenuesRecorded > 0 ? totalRevenuesRecorded : advanceReceived;
  const receivable = Math.max(0, grossValue - amountReceived);

  // Expense calculations
  const projectExpenses = expenses.filter((e) => {
    const pId = String(project.id || '').toLowerCase();
    const pCode = String(project.projectId || project.project_code || project.projectCode || '').toLowerCase();
    const pName = String(project.name || '').toLowerCase();

    const eProjId = String(e.projectId || e.project_id || '').toLowerCase();
    const eProjCode = String(e.projectCode || e.project_code || '').toLowerCase();
    const eProjName = String(e.projectName || e.project_name || '').toLowerCase();

    return (
      (pId && (eProjId === pId || eProjCode === pId)) ||
      (pCode && (eProjId === pCode || eProjCode === pCode)) ||
      (pName && eProjName === pName)
    );
  });
  const totalSpent = projectExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const approvedSpent = projectExpenses
    .filter((e) => e.status === 'approved' || e.status === 'paid')
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  const remainingBudget = Math.max(0, agreedBudget - totalSpent);
  const budgetUtilization = agreedBudget > 0 ? (totalSpent / agreedBudget) * 100 : 0;
  const completionPercentage = Number(project.progressPercentage || project.progress_percentage || 0);

  // Category Budgets vs Actual (Direct Field Expenditure lines)
  const rawCatBudgets: Record<string, number> = project.categoryBudgets || project.category_budgets || {};
  
  // Clean meta keys and internal officebenefit (which is an internal overhead provision, not a field expense line)
  const categoryBudgets: Record<string, number> = {};
  Object.entries(rawCatBudgets).forEach(([k, v]) => {
    const norm = k.toLowerCase().trim();
    if (!norm.startsWith('_meta_') && norm !== 'officebenefit' && norm !== 'office_benefit') {
      categoryBudgets[k] = Number(v) || 0;
    }
  });

  // Also include any active category present in projectExpenses that might not have a cap set
  projectExpenses.forEach((e) => {
    const cat = (e.categoryName || e.category_name || e.category || '').toLowerCase().trim();
    if (cat && cat !== 'officebenefit' && cat !== 'office_benefit' && categoryBudgets[cat] === undefined) {
      categoryBudgets[cat] = 0;
    }
  });

  const getSpentByCategory = (catName: string) => {
    const norm = catName.toLowerCase().replace(/[^a-z]/g, '');
    return projectExpenses
      .filter((e) => {
        const c = (e.categoryName || e.category_name || e.category || '').toLowerCase().replace(/[^a-z]/g, '');
        return c === norm || (norm === 'officecost' && (c === 'office' || c === 'officecost')) || (norm === 'officebenefit' && c === 'officebenefit');
      })
      .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  };

  // Color mapping per category
  const getCategoryColor = (cat: string) => {
    const c = cat.toLowerCase();
    if (c.includes('equip')) return { border: 'border-cyan-200', bg: 'bg-cyan-50/50', bar: 'bg-cyan-500', text: 'text-cyan-700' };
    if (c.includes('trans')) return { border: 'border-amber-200', bg: 'bg-amber-50/50', bar: 'bg-amber-500', text: 'text-amber-700' };
    if (c.includes('food')) return { border: 'border-emerald-200', bg: 'bg-emerald-50/50', bar: 'bg-emerald-500', text: 'text-emerald-700' };
    if (c.includes('accomm')) return { border: 'border-purple-200', bg: 'bg-purple-50/50', bar: 'bg-purple-500', text: 'text-purple-700' };
    if (c.includes('officecost')) return { border: 'border-blue-200', bg: 'bg-blue-50/50', bar: 'bg-blue-500', text: 'text-blue-700' };
    if (c.includes('benefit')) return { border: 'border-indigo-200', bg: 'bg-indigo-50/50', bar: 'bg-indigo-500', text: 'text-indigo-700' };
    return { border: 'border-rose-200', bg: 'bg-rose-50/50', bar: 'bg-rose-500', text: 'text-rose-700' };
  };

  // Team members calculation & permissions
  const memberIds: string[] = project.teamMemberIds || project.team_member_ids || [];
  const assignedUsers = allUsers.filter((u) => memberIds.includes(u.id));

  // Merged project members list
  const displayMembers = (projectMembers && projectMembers.length > 0)
    ? projectMembers.map((m: any) => {
        const u = m.user || allUsers.find((user) => user.id === (m.userId || m.user_id)) || {};
        return {
          id: m.id || m.userId || m.user_id,
          userId: m.userId || m.user_id,
          name: u.name || m.fullName || m.full_name || 'Staff Member',
          email: u.email || m.email || '',
          avatarUrl: u.avatarUrl || u.avatar_url || m.avatarUrl || m.avatar_url,
          roleInProject: m.roleInProject || m.role_in_project || 'Member',
          department: u.department || u.designation || 'Project Personnel',
          permissions: m.permissions || {
            canViewBudget: Boolean(m.canViewBudget ?? m.can_view_budget ?? true),
            canRecordRevenue: Boolean(m.canRecordRevenue ?? m.can_record_revenue ?? false),
            canViewExpenses: Boolean(m.canViewExpenses ?? m.can_view_expenses ?? true),
            canCreateExpenses: Boolean(m.canCreateExpenses ?? m.can_create_expenses ?? true),
            canApproveExpenses: Boolean(m.canApproveExpenses ?? m.can_approve_expenses ?? false),
            canManageTasks: Boolean(m.canManageTasks ?? m.can_manage_tasks ?? false),
            canUpdateProgress: Boolean(m.canUpdateProgress ?? m.can_update_progress ?? false),
            canManageTeam: Boolean(m.canManageTeam ?? m.can_manage_team ?? false),
            canEditProject: Boolean(m.canEditProject ?? m.can_edit_project ?? false),
            canViewAttendance: Boolean(m.canViewAttendance ?? m.can_view_attendance ?? true),
          },
        };
      })
    : assignedUsers.map((u) => ({
        id: u.id,
        userId: u.id,
        name: u.name || 'Staff Member',
        email: u.email || '',
        avatarUrl: u.avatarUrl || u.avatar_url,
        roleInProject: 'Member',
        department: u.department || u.designation || 'Project Personnel',
        permissions: {
          canViewBudget: true,
          canRecordRevenue: false,
          canViewExpenses: true,
          canCreateExpenses: true,
          canApproveExpenses: false,
          canManageTasks: false,
          canUpdateProgress: false,
          canManageTeam: false,
          canEditProject: false,
          canViewAttendance: true,
        },
      }));

  // Authorizations
  const canManageTeam = Boolean(
    myPermissions?.isSystemAdmin ||
    myPermissions?.isCreator ||
    myPermissions?.permissions?.canManageTeam
  );

  const canApproveClaims = Boolean(
    myPermissions?.isSystemAdmin ||
    myPermissions?.isCreator ||
    myPermissions?.permissions?.canApproveExpenses
  );

  const openAddMemberModal = () => {
    setEditingMember(null);
    const available = allUsers.find((u) => !displayMembers.some((m: any) => m.userId === u.id)) || allUsers[0];
    setTargetUserId(available?.id || '');
    setCustomRoleTitle('Site Lead');
    setMemberPerms({
      canViewBudget: true,
      canRecordRevenue: false,
      canViewExpenses: true,
      canCreateExpenses: true,
      canApproveExpenses: false,
      canManageTasks: false,
      canUpdateProgress: false,
      canManageTeam: false,
      canEditProject: false,
      canViewAttendance: true,
    });
    setIsMemberAccessModalOpen(true);
  };

  const openEditMemberModal = (member: any) => {
    setEditingMember(member);
    setTargetUserId(member.userId);
    setCustomRoleTitle(member.roleInProject || 'Member');
    setMemberPerms({
      canViewBudget: Boolean(member.permissions?.canViewBudget),
      canRecordRevenue: Boolean(member.permissions?.canRecordRevenue),
      canViewExpenses: Boolean(member.permissions?.canViewExpenses),
      canCreateExpenses: Boolean(member.permissions?.canCreateExpenses),
      canApproveExpenses: Boolean(member.permissions?.canApproveExpenses),
      canManageTasks: Boolean(member.permissions?.canManageTasks),
      canUpdateProgress: Boolean(member.permissions?.canUpdateProgress),
      canManageTeam: Boolean(member.permissions?.canManageTeam),
      canEditProject: Boolean(member.permissions?.canEditProject),
      canViewAttendance: Boolean(member.permissions?.canViewAttendance),
    });
    setIsMemberAccessModalOpen(true);
  };

  const handleSaveMemberAccess = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!targetUserId) {
      alert('Please select an employee.');
      return;
    }
    setSubmitting(true);
    try {
      await ApiClient.addOrUpdateProjectMember(project.id, {
        userId: targetUserId,
        roleInProject: customRoleTitle.trim() || 'Member',
        permissions: memberPerms,
      });
      setIsMemberAccessModalOpen(false);
      setEditingMember(null);
      await loadProjectData();
    } catch (err: any) {
      console.error('Failed to update member access:', err);
      alert(err.message || 'Failed to save member permissions.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveMember = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to remove ${userName} from this project?`)) return;
    setSubmitting(true);
    try {
      await ApiClient.removeProjectMember(project.id, userId);
      await loadProjectData();
    } catch (err: any) {
      console.error('Failed to remove member:', err);
      alert(err.message || 'Failed to remove member.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproveExpense = async (expenseId: string, note = 'Approved by authorized project personnel') => {
    setSubmitting(true);
    try {
      await ApiClient.approveExpense(expenseId, note);
      if (inspectExpense && inspectExpense.id === expenseId) {
        setInspectExpense({ ...inspectExpense, status: 'approved' });
      }
      await loadProjectData();
    } catch (err: any) {
      console.error('Failed to approve expense:', err);
      alert(err.message || 'Failed to approve claim.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectExpense = async (expenseId: string, defaultReason = 'Rejected by authorized project personnel') => {
    const reason = prompt('Enter rejection reason for this voucher claim:', defaultReason);
    if (!reason) return;
    setSubmitting(true);
    try {
      await ApiClient.rejectExpense(expenseId, reason);
      if (inspectExpense && inspectExpense.id === expenseId) {
        setInspectExpense({ ...inspectExpense, status: 'rejected' });
      }
      await loadProjectData();
    } catch (err: any) {
      console.error('Failed to reject expense:', err);
      alert(err.message || 'Failed to reject claim.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handler: Add Revenue
  const handleAddRevenue = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await ApiClient.addProjectRevenue(project.id, {
        amount: Number(revAmount),
        milestone: revMilestone,
        note: revNote,
        date: new Date().toISOString(),
      });
      setIsRevenueModalOpen(false);
      setRevNote('');
      await loadProjectData();
    } catch (err) {
      console.error('Failed to add revenue:', err);
      alert('Failed to record revenue milestone.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handler: Update Progress
  const handleUpdateProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const existingNotes = project.progressNotes || project.progress_notes || [];
      const newNote = {
        percentage: Number(progressVal),
        note: progressNoteText.trim() || `Progress adjusted to ${progressVal}%`,
        updated_at: new Date().toISOString(),
        updated_by: 'Administrator',
      };

      await ApiClient.updateProject(project.id, {
        progress_percentage: Number(progressVal),
        progressPercentage: Number(progressVal),
        progress_notes: [...existingNotes, newNote],
        category_budgets: {
          ...rawCatBudgets,
          _meta_progress: Number(progressVal),
          _meta_progress_updated_at: new Date().toISOString(),
        },
      });

      setIsProgressModalOpen(false);
      setProgressNoteText('');
      await loadProjectData();
    } catch (err) {
      console.error('Failed to update progress:', err);
      alert('Failed to update progress.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handler: Assign Team Members (Legacy bulk)
  const handleSaveTeamMembers = async () => {
    setSubmitting(true);
    try {
      await ApiClient.updateProject(project.id, {
        team_member_ids: selectedMemberIds,
        teamMemberIds: selectedMemberIds,
        category_budgets: {
          ...rawCatBudgets,
          _meta_team_members: selectedMemberIds,
        },
      });
      setIsAssignModalOpen(false);
      await loadProjectData();
    } catch (err) {
      console.error('Failed to update team:', err);
      alert('Failed to update assigned members.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handler: Create Task
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || !taskAssigneeId) return;
    setSubmitting(true);
    try {
      const assignee = allUsers.find((u) => u.id === taskAssigneeId);
      await ApiClient.createTask({
        project_id: project.id,
        projectId: project.id,
        title: taskTitle.trim(),
        description: taskDesc.trim(),
        assignee_id: taskAssigneeId,
        assignee_name: assignee?.name || 'Assignee',
        budget_line: taskBudgetLine.trim() || null,
        due_date: taskDueDate ? new Date(taskDueDate).toISOString() : new Date().toISOString(),
        status: 'in_progress',
      });
      setIsTaskModalOpen(false);
      setTaskTitle('');
      setTaskDesc('');
      await loadProjectData();
    } catch (err) {
      console.error('Failed to create task:', err);
      alert('Failed to create task.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handler: Toggle Task Status
  const handleToggleTaskStatus = async (task: any) => {
    const newStatus = task.status === 'completed' ? 'in_progress' : 'completed';
    try {
      await ApiClient.updateTask(task.id, { status: newStatus });
      setTasks(tasks.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t)));
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  // Handler: Close / Reopen Project
  const handleToggleCloseProject = async () => {
    setSubmitting(true);
    try {
      if (project.isClosed || project.is_closed) {
        await ApiClient.reopenProject(project.id);
      } else {
        await ApiClient.closeProject(project.id, {
          closingSummary: `Project finalized on ${new Date().toLocaleDateString()} with ৳${totalSpent.toLocaleString()} incurred expenses.`,
        });
      }
      setIsCloseModalOpen(false);
      await loadProjectData();
    } catch (err) {
      console.error('Failed to toggle project status:', err);
      alert('Failed to modify project closure status.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout
      title={`Project Workspace: ${project.name}`}
      subtitle={`Code: ${project.projectId || project.project_code || 'PRJ'} • Client: ${project.client || 'N/A'}`}
      onRefresh={loadProjectData}
      isRefreshing={loading}
    >
      <div className="w-full max-w-[1440px] mx-auto px-5 py-5 space-y-4">
        {/* Top Breadcrumb & Actions Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/projects')}
              className="rounded-md border border-slate-200 bg-white p-2 hover:bg-slate-50 transition-colors text-slate-600"
              title="Back to Projects"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-emerald-700 tracking-wider uppercase font-mono">
                  {project.projectId || project.project_code || 'PRJ'}
                </span>
                <span className="text-slate-300">/</span>
                <span className="text-xs font-semibold text-slate-500">{project.client}</span>
                <StatusBadge status={project.status || 'ongoing'} />
              </div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight mt-0.5">{project.name}</h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setIsProgressModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-md text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all"
            >
              <TrendingUp size={14} className="text-indigo-600" />
              Update Progress ({completionPercentage}%)
            </button>

            <button
              onClick={() => setIsRevenueModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-md text-xs font-bold hover:bg-emerald-100/70 transition-all"
            >
              <DollarSign size={14} />
              Record Revenue
            </button>

            <Link
              href={`/projects/${project.id}/edit`}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 border border-slate-200 text-slate-700 rounded-md text-xs font-bold hover:bg-slate-200 transition-all"
            >
              <Edit size={14} />
              Edit Setup
            </Link>

            <button
              onClick={() => setIsCloseModalOpen(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold border transition-all ${
                project.isClosed || project.is_closed
                  ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Archive size={14} />
              {project.isClosed || project.is_closed ? 'Reopen Project' : 'Close Project'}
            </button>
          </div>
        </div>

        {/* Project Picture Cover Banner */}
        <div className="relative h-28 sm:h-32 w-full rounded-lg overflow-hidden bg-slate-900 border border-slate-200">
          <img
            src={project.imageUrl || 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1200&q=80'}
            alt={project.name}
            className="w-full h-full object-cover brightness-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20 pointer-events-none" />
          <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between text-white">
            <div>
              <p className="text-xs font-semibold text-slate-300">
                {project.client} • {project.assignmentType ? project.assignmentType.replace(/_/g, ' ') : 'Direct Consultancy'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold rounded-md border border-white/20">
                {project.projectId || project.project_code || 'PRJ'}
              </span>
              <StatusBadge status={project.isClosed ? 'closed' : project.status || 'ongoing'} />
            </div>
          </div>
        </div>

        {/* Executive Metric Cards (Desktop Color-Coded) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5">
          {/* Card 1: Contract Value & Tax */}
          <div className="bg-white text-slate-900 min-h-[88px] p-2 rounded-md border border-slate-200 border-l-2 border-l-slate-400 space-y-1">
            <div className="flex items-center justify-between text-slate-500 text-[8px] font-bold uppercase tracking-wider">
              <span>Contract Value</span>
              <span className="p-0.5 bg-slate-100 rounded text-slate-600">
                <Building size={12} />
              </span>
            </div>
            <p className="text-[17px] leading-none font-extrabold tracking-tight">৳{grossValue.toLocaleString()}</p>
            <p className="text-[9px] leading-4 text-slate-500 truncate">
              Net <span className="font-bold text-slate-700">৳{(project.expectedNetRevenue || project.expected_net_revenue || grossValue).toLocaleString()}</span>
              <span className="mx-1 text-slate-300">·</span>
              Tax <span className="font-semibold text-slate-700">{project.taxStatus || 'Included'} ({((project.taxRate || 0.10) * 100).toFixed(0)}%)</span>
            </p>
          </div>

          {/* Card 2: Project Budget & Money Spent */}
          <div className="bg-white min-h-[88px] p-2 rounded-md border border-slate-200 border-l-2 border-l-emerald-500 space-y-1">
            <div className="flex items-center justify-between text-slate-500 text-[8px] font-bold uppercase tracking-wider">
              <span>Project Budget</span>
              <span className="p-0.5 bg-emerald-50 text-emerald-600 rounded">
                <DollarSign size={12} />
              </span>
            </div>
            <p className="text-[17px] leading-none font-extrabold text-slate-900 tracking-tight">৳{agreedBudget.toLocaleString()}</p>
            <div className="space-y-1">
              <p className="text-[9px] leading-3 text-slate-500">
                Spent <span className="font-bold text-slate-700">৳{totalSpent.toLocaleString()}</span>
                <span className={`ml-1 font-bold ${budgetUtilization > 100 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {budgetUtilization.toFixed(0)}% used
                </span>
              </p>
              <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    budgetUtilization > 90 ? 'bg-rose-500' : budgetUtilization > 75 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, budgetUtilization)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Card 3: Budget Left */}
          <div className="bg-white min-h-[88px] p-2 rounded-md border border-slate-200 border-l-2 border-l-cyan-500 space-y-1">
            <div className="flex items-center justify-between text-slate-500 text-[8px] font-bold uppercase tracking-wider">
              <span>Budget Left</span>
              <span className="p-0.5 bg-cyan-50 text-cyan-600 rounded">
                <TrendingUp size={12} />
              </span>
            </div>
            <p className="text-[17px] leading-none font-extrabold text-slate-900 tracking-tight">৳{remainingBudget.toLocaleString()}</p>
            <p className="text-[9px] leading-4 text-slate-500">
              Approved <span className="font-bold text-slate-700">৳{approvedSpent.toLocaleString()}</span>
              <span className="mx-1 text-slate-300">·</span>
              <span className={`font-bold ${remainingBudget >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {remainingBudget >= 0 ? 'Within Budget' : 'Over Budget'}
              </span>
            </p>
          </div>

          {/* Card 4: Unpaid Balance & Progress */}
          <div className="bg-white min-h-[88px] p-2 rounded-md border border-slate-200 border-l-2 border-l-violet-500 space-y-1">
            <div className="flex items-center justify-between text-slate-500 text-[8px] font-bold uppercase tracking-wider">
              <span>Unpaid by Client</span>
              <span className="p-0.5 bg-violet-50 text-violet-600 rounded">
                <Receipt size={12} />
              </span>
            </div>
            <p className="text-[17px] leading-none font-extrabold text-slate-900 tracking-tight">৳{receivable.toLocaleString()}</p>
            <p className="text-[9px] leading-4 text-slate-500">
              Paid <span className="font-bold text-slate-700">৳{amountReceived.toLocaleString()}</span>
              <span className="mx-1 text-slate-300">·</span>
              <span className="font-bold text-violet-600">{completionPercentage}% complete</span>
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white border border-slate-200 rounded-lg p-1 flex flex-wrap gap-1">
          {[
            { id: 'overview', label: 'Overview', icon: Briefcase },
            { id: 'budget', label: `Budget by Category (${Object.keys(categoryBudgets).length})`, icon: DollarSign },
            { id: 'team', label: `Team & Roles (${displayMembers.length})`, icon: Users },
            { id: 'expenses', label: `Expenses (${projectExpenses.length})`, icon: Receipt },
            { id: 'revenue', label: `Invoices & Payments (${(project.revenueEntries || []).length})`, icon: TrendingUp },
            { id: 'tasks', label: `Tasks (${tasks.length})`, icon: CheckSquare },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-bold transition-all ${
                  isActive
                    ? 'bg-[#0D1117] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-white' : 'text-slate-400'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: Overview */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <div className="lg:col-span-2 space-y-3">
              {/* Scope & Contract Parameters */}
              <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <FileText size={16} className="text-indigo-600" />
                  Project Scope & Description
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-md border border-slate-100">
                  {project.description || 'No detailed scope of work description recorded for this assignment.'}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  <div className="p-3 bg-slate-50/80 rounded-md border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Client
                    </span>
                    <p className="text-xs font-bold text-slate-800">{project.client}</p>
                    <span className="text-[10px] text-slate-400 capitalize">{project.clientType || 'Government'}</span>
                  </div>

                  <div className="p-3 bg-slate-50/80 rounded-md border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Project Type
                    </span>
                    <p className="text-xs font-bold text-slate-800 capitalize">
                      {(project.assignmentType || 'direct_consultancy').replace(/_/g, ' ')}
                    </p>
                    <span className="text-[10px] text-slate-400">Consultancy</span>
                  </div>

                  <div className="p-3 bg-slate-50/80 rounded-md border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Timeline
                    </span>
                    <p className="text-xs font-bold text-slate-800">
                      {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A'} -{' '}
                      {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'N/A'}
                    </p>
                    <span className="text-[10px] text-slate-400">Duration</span>
                  </div>
                </div>
              </div>

              {/* Progress Milestones & Updates Log */}
              <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <TrendingUp size={16} className="text-indigo-600" />
                    Project Updates & Notes
                  </h3>
                  <button
                    onClick={() => setIsProgressModalOpen(true)}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                  >
                    + Add Update
                  </button>
                </div>

                {(!project.progressNotes || project.progressNotes.length === 0) ? (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    No progress updates added yet. Click &quot;Update Progress&quot; to add a note.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {project.progressNotes.map((note: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs"
                      >
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-[11px] shrink-0">
                          {note.percentage}%
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-slate-800">{note.note}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            Logged by {note.updated_by || 'Admin'} •{' '}
                            {note.updated_at ? new Date(note.updated_at).toLocaleString() : 'Recent'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Financial Structure Breakdown */}
            <div className="space-y-3">
              <div className="bg-indigo-50/70 border border-indigo-100 rounded-lg p-4 shadow-none space-y-3">
                <div className="border-b border-indigo-100 pb-3 flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Financial Summary</h3>
                  <span className="text-[10px] font-bold bg-indigo-100 px-2.5 py-0.5 rounded-full text-indigo-700">
                    Active
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Gross Contract Value:</span>
                    <span className="font-bold text-slate-900 font-mono">৳{grossValue.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between text-slate-500">
                    <span>Tax Withholding ({((project.taxRate || 0.10) * 100).toFixed(0)}%):</span>
                    <span className="font-bold text-rose-600 font-mono">
                      -৳{Math.round(grossValue * (project.taxRate || 0.10)).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-500">
                    <span>Net Project Revenue:</span>
                    <span className="font-bold text-emerald-600 font-mono">
                      ৳{(project.expectedNetRevenue || grossValue * 0.9).toLocaleString()}
                    </span>
                  </div>

                  <div className="border-t border-indigo-100 pt-3 flex justify-between text-slate-500">
                    <span>Direct Operational Budget:</span>
                    <span className="font-bold text-slate-900 font-mono">
                      ৳{agreedBudget.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-500">
                    <span>Office Overhead Benefit ({((project.officeBenefitRate || 0.30) * 100).toFixed(0)}%):</span>
                    <span className="font-bold text-indigo-600 font-mono">
                      +৳{Math.round(agreedBudget * (project.officeBenefitRate || 0.30)).toLocaleString()}
                    </span>
                  </div>

                  <div className="border-t border-indigo-100 pt-3 flex justify-between text-sm font-bold">
                    <span className="text-indigo-700">Estimated Project Profit:</span>
                    <span className="font-mono text-emerald-600">
                      ৳{Math.max(0, (project.expectedNetRevenue || grossValue * 0.9) - totalSpent).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Fast Actions Box */}
              <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-none space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Quick Team & Chat</h4>
                <div className="space-y-2">
                  <Link
                    href="/chat"
                    className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-100 text-xs font-bold text-slate-700 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <MessageSquare size={14} className="text-indigo-600" />
                      Open Project Chat Channel
                    </span>
                    <ChevronRight size={14} className="text-slate-400" />
                  </Link>
                  <button
                    onClick={() => setIsAssignModalOpen(true)}
                    className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-100 text-xs font-bold text-slate-700 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <UserPlus size={14} className="text-violet-600" />
                      Manage Assigned Staff
                    </span>
                    <ChevronRight size={14} className="text-slate-400" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Budget vs Actual */}
        {activeTab === 'budget' && (
          <div>
            <div className="bg-white border border-[#EAEBEF] rounded-xl p-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Line-Item Budget Breakdown</h3>
                  <p className="text-xs text-slate-400">Compare allocated capital caps against live verified claim receipts</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Allocated</span>
                    <p className="text-sm font-black text-slate-900 font-mono">৳{agreedBudget.toLocaleString()}</p>
                  </div>
                  <div className="h-8 w-px bg-slate-200" />
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Claimed</span>
                    <p className="text-sm font-black text-emerald-600 font-mono">৳{totalSpent.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 mt-3">
                {Object.entries(categoryBudgets).map(([category, allocated]) => {
                  const spent = getSpentByCategory(category);
                  const remaining = Math.max(0, allocated - spent);
                  const hasCap = allocated > 0;
                  const isOverCap = hasCap ? spent > allocated : spent > 0;
                  const burnPct = hasCap ? (spent / allocated) * 100 : (spent > 0 ? 100 : 0);
                  const colors = getCategoryColor(category);

                  return (
                    <div
                      key={category}
                      className={`min-h-[64px] p-2 rounded-lg border ${colors.border} ${colors.bg} flex flex-col justify-between transition-shadow hover:shadow-sm`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[9px] font-black uppercase tracking-wider capitalize ${colors.text}`}>
                          {category}
                        </span>
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${
                          isOverCap
                            ? 'bg-rose-100 text-rose-700 font-extrabold'
                            : burnPct >= 90
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-white/80 text-slate-700'
                        }`}>
                          {!hasCap && spent > 0 ? 'No Cap (Active)' : `${burnPct.toFixed(0)}%`}
                        </span>
                      </div>

                      <div className="flex items-baseline justify-between gap-2 text-[9px] whitespace-nowrap">
                        <span className="text-slate-500">
                          Spent <span className="font-black text-slate-900 font-mono">৳{spent.toLocaleString()}</span>
                        </span>
                        <span className="text-slate-400">
                          Cap <span className="font-bold text-slate-700 font-mono">{hasCap ? `৳${allocated.toLocaleString()}` : 'None'}</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <div className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isOverCap ? 'bg-rose-500' : colors.bar
                            }`}
                            style={{ width: `${Math.min(100, Math.max(spent > 0 ? 8 : 0, burnPct))}%` }}
                          />
                        </div>
                        <span className="shrink-0 text-[8px] font-medium text-slate-400">
                          {hasCap ? `Rem ৳${remaining.toLocaleString()}` : (spent > 0 ? `৳${spent.toLocaleString()} spent` : 'Rem ৳0')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Team Members */}
        {activeTab === 'team' && (
          <div className="bg-white border border-[#EAEBEF] rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Project Personnel & Role Assignments</h3>
                <p className="text-xs text-slate-400">Custom project-level roles and granular authority matrix (Expense approval, budget access, progress)</p>
              </div>
              <div className="flex items-center gap-2">
                {canManageTeam && (
                  <button
                    onClick={openAddMemberModal}
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-full transition-all shadow-sm"
                  >
                    <UserPlus size={15} />
                    Assign Member & Permissions
                  </button>
                )}
                <button
                  onClick={() => setIsAssignModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-full transition-all"
                >
                  <Users size={15} />
                  Bulk Select
                </button>
              </div>
            </div>

            {displayMembers.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                No team members assigned to this project yet. Click "Assign Member & Permissions" to add personnel.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayMembers.map((member: any) => {
                  const p = member.permissions || {};
                  return (
                    <div
                      key={member.userId}
                      className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl flex flex-col justify-between gap-3 hover:border-slate-300 transition-all shadow-2xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3 min-w-0">
                          <UserAvatar
                            src={member.avatarUrl}
                            name={member.name || 'Staff'}
                            size="md"
                            shape="rounded"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">{member.name}</p>
                            <p className="text-[10px] text-slate-400 truncate">{member.department || 'Project Staff'}</p>
                            <p className="text-[10px] text-indigo-600 truncate">{member.email}</p>
                          </div>
                        </div>

                        <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-violet-100 text-violet-800 border border-violet-200 shrink-0">
                          {member.roleInProject || 'Member'}
                        </span>
                      </div>

                      {/* Permissions Tags */}
                      <div className="flex flex-wrap gap-1 pt-1 border-t border-slate-200/60">
                        {p.canApproveExpenses && (
                          <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300 inline-flex items-center gap-1 shadow-2xs">
                            <ShieldCheck size={11} className="text-emerald-700" />
                            Claims Approver
                          </span>
                        )}
                        {p.canViewBudget && (
                          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-slate-200/70 text-slate-700">
                            Budget
                          </span>
                        )}
                        {p.canRecordRevenue && (
                          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                            Revenue
                          </span>
                        )}
                        {p.canCreateExpenses && (
                          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                            Submit Claims
                          </span>
                        )}
                        {p.canManageTasks && (
                          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-purple-100 text-purple-700">
                            Tasks
                          </span>
                        )}
                        {p.canUpdateProgress && (
                          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-cyan-100 text-cyan-800">
                            Progress %
                          </span>
                        )}
                        {p.canManageTeam && (
                          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-fuchsia-100 text-fuchsia-800">
                            Team Admin
                          </span>
                        )}
                        {p.canEditProject && (
                          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800">
                            Edit Proj
                          </span>
                        )}
                        {p.canViewAttendance && (
                          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-teal-100 text-teal-800">
                            Attendance
                          </span>
                        )}
                      </div>

                      {/* Action buttons */}
                      {canManageTeam && (
                        <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-slate-100">
                          <button
                            onClick={() => openEditMemberModal(member)}
                            className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 rounded-lg text-[10px] font-bold text-slate-700 transition-colors inline-flex items-center gap-1 shadow-2xs"
                          >
                            <Sliders size={12} />
                            Edit Permissions
                          </button>
                          <button
                            onClick={() => handleRemoveMember(member.userId, member.name)}
                            className="p-1 bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors shadow-2xs"
                            title="Remove Member from Project"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: Project Claims & Expenses */}
        {activeTab === 'expenses' && (() => {
          // Available categories for filter dropdown
          const availableCategories = Array.from(
            new Set(projectExpenses.map((e) => e.categoryName || e.category_name || e.category || 'General'))
          );

          // Apply filters
          const filteredExpenses = projectExpenses.filter((e) => {
            const matchesSearch =
              !expenseSearch.trim() ||
              (e.employeeName || e.employee_name || '').toLowerCase().includes(expenseSearch.toLowerCase()) ||
              (e.note || e.description || '').toLowerCase().includes(expenseSearch.toLowerCase()) ||
              String(e.amount || '').includes(expenseSearch);

            const cat = (e.categoryName || e.category_name || e.category || 'General').toLowerCase();
            const matchesCategory =
              expenseCategoryFilter === 'all' || cat === expenseCategoryFilter.toLowerCase();

            const status = (e.status || 'pending').toLowerCase();
            const matchesStatus =
              expenseStatusFilter === 'all' || status === expenseStatusFilter.toLowerCase();

            return matchesSearch && matchesCategory && matchesStatus;
          });

          return (
            <div className="bg-white border border-[#EAEBEF] rounded-3xl p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Project Field Expenditures</h3>
                  <p className="text-xs text-slate-400">Verified voucher claims attributed directly to this cost code</p>
                </div>
                <div className="flex items-center gap-4 text-right">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Filtered Sum</span>
                    <p className="text-sm font-black text-emerald-600 font-mono">
                      ৳{filteredExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="h-8 w-px bg-slate-200" />
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Claims Count</span>
                    <p className="text-sm font-bold text-slate-900">{filteredExpenses.length} / {projectExpenses.length}</p>
                  </div>
                </div>
              </div>

              {/* Filters & Search Toolbar */}
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="relative flex-1 min-w-[200px]">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={expenseSearch}
                    onChange={(e) => setExpenseSearch(e.target.value)}
                    placeholder="Search claimant, description, amount..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400"
                  />
                  {expenseSearch && (
                    <button
                      onClick={() => setExpenseSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Filter size={14} className="text-slate-400" />
                  <select
                    value={expenseCategoryFilter}
                    onChange={(e) => setExpenseCategoryFilter(e.target.value)}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 capitalize focus:outline-none focus:border-indigo-400"
                  >
                    <option value="all">All Categories</option>
                    {availableCategories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>

                  <select
                    value={expenseStatusFilter}
                    onChange={(e) => setExpenseStatusFilter(e.target.value)}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 capitalize focus:outline-none focus:border-indigo-400"
                  >
                    <option value="all">All Statuses</option>
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
              </div>

              {filteredExpenses.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  {projectExpenses.length === 0
                    ? 'No expense claims logged under this project code yet.'
                    : 'No expenses match the selected filters.'}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-400 uppercase tracking-wider font-semibold">
                      <tr>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Claimant</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Description</th>
                        <th className="py-3 px-4 text-right">Amount (৳)</th>
                        <th className="py-3 px-4 text-center">Receipt</th>
                        <th className="py-3 px-4 text-center">Status</th>
                        <th className="py-3 px-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredExpenses.map((exp) => (
                        <tr key={exp.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5 px-4 font-mono text-slate-600">
                            {exp.date ? new Date(exp.date).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-900">
                            {exp.employeeName || exp.employee_name || 'Staff'}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-[11px] capitalize">
                              {exp.categoryName || exp.category_name || exp.category || 'Expense'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                            {exp.note || exp.description || '—'}
                          </td>
                          <td className="py-3.5 px-4 text-right font-black font-mono text-slate-900">
                            ৳{(Number(exp.amount) || 0).toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {exp.receiptPhotoUrl || exp.receipt_photo_url || exp.receiptUrl || exp.receipt_url ? (
                              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                Attached
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                                Missing
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <StatusBadge status={exp.status} />
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => setInspectExpense(exp)}
                                title="View Expense Details & Voucher"
                                className="p-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg text-slate-600 transition-colors inline-flex items-center justify-center gap-1 font-bold text-[11px]"
                              >
                                <Eye size={14} />
                                <span className="hidden sm:inline">Details</span>
                              </button>
                              {canApproveClaims && exp.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleApproveExpense(exp.id)}
                                    disabled={submitting}
                                    title="Approve Claim"
                                    className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-colors inline-flex items-center justify-center disabled:opacity-50"
                                  >
                                    <CheckCircle2 size={14} />
                                  </button>
                                  <button
                                    onClick={() => handleRejectExpense(exp.id)}
                                    disabled={submitting}
                                    title="Reject Claim"
                                    className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg transition-colors inline-flex items-center justify-center disabled:opacity-50"
                                  >
                                    <XCircle size={14} />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })()}

        {/* TAB 5: Revenue & Milestones */}
        {activeTab === 'revenue' && (
          <div className="bg-white border border-[#EAEBEF] rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Revenue Entries & Client Invoicing</h3>
                <p className="text-xs text-slate-400">Direct cash advances, milestone receipts, and pending invoices</p>
              </div>
              <button
                onClick={() => setIsRevenueModalOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-full hover:bg-emerald-700 transition-all shadow-sm"
              >
                <Plus size={15} />
                Record Milestone Revenue
              </button>
            </div>

            {(!project.revenueEntries || project.revenueEntries.length === 0) ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                No milestone revenue entries recorded yet. Click "Record Milestone Revenue" to add invoice payments.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-400 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Milestone</th>
                      <th className="py-3 px-4">Notes</th>
                      <th className="py-3 px-4 text-right">Amount Received (৳)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {project.revenueEntries.map((rev: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-slate-600">
                          {rev.date ? new Date(rev.date).toLocaleDateString() : 'Recent'}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {rev.milestone || 'Project Payment'}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">
                          {rev.note || 'Recorded in system'}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-black text-emerald-600">
                          +৳{(Number(rev.amount) || 0).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 6: Deliverable Tasks */}
        {activeTab === 'tasks' && (
          <div className="bg-white border border-[#EAEBEF] rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Deliverable Task Items</h3>
                <p className="text-xs text-slate-400">Technical tasks mapped to team personnel and budget cost lines</p>
              </div>
              <button
                onClick={() => setIsTaskModalOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#0D1117] text-white text-xs font-bold rounded-full hover:bg-slate-800 transition-all shadow-sm"
              >
                <Plus size={15} />
                Create New Task
              </button>
            </div>

            {tasks.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                No tasks created for this project yet. Click "Create New Task" to assign work packages.
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => {
                  const isDone = task.status === 'completed';
                  return (
                    <div
                      key={task.id}
                      className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                        isDone
                          ? 'bg-slate-50/80 border-slate-200 text-slate-500'
                          : 'bg-white border-slate-200 shadow-sm hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start gap-3.5 min-w-0">
                        <button
                          onClick={() => handleToggleTaskStatus(task)}
                          className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-colors shrink-0 ${
                            isDone
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'border-slate-300 bg-white hover:border-emerald-500'
                          }`}
                        >
                          {isDone && <Check size={12} strokeWidth={3} />}
                        </button>
                        <div>
                          <p className={`text-xs font-bold ${isDone ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                            {task.title}
                          </p>
                          {task.description && (
                            <p className="text-[11px] text-slate-500 mt-0.5">{task.description}</p>
                          )}
                          <div className="flex flex-wrap items-center gap-3 mt-2 text-[10px] text-slate-400 font-medium">
                            <span className="font-semibold text-slate-700">Assignee: {task.assigneeName || task.assignee_name || 'Staff'}</span>
                            {task.budgetLine && (
                              <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
                                Line: {task.budgetLine}
                              </span>
                            )}
                            {task.dueDate && (
                              <span className="flex items-center gap-1">
                                <Clock size={11} /> Due: {new Date(task.dueDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase shrink-0 ${
                        isDone ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {isDone ? 'Completed' : 'In Progress'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* MODAL: Record Revenue */}
        {isRevenueModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">Record Revenue Milestone</h3>
                <button onClick={() => setIsRevenueModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>

              <form onSubmit={handleAddRevenue} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Amount Received (৳) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={revAmount}
                    onChange={(e) => setRevAmount(Number(e.target.value) || 0)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Milestone Name *</label>
                  <input
                    type="text"
                    required
                    value={revMilestone}
                    onChange={(e) => setRevMilestone(e.target.value)}
                    placeholder="e.g., Inception Report Approval"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Notes / Invoice Ref</label>
                  <input
                    type="text"
                    value={revNote}
                    onChange={(e) => setRevNote(e.target.value)}
                    placeholder="e.g., Check #9921 / Wire Received"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsRevenueModalOpen(false)}
                    className="px-4 py-2 border rounded-full text-slate-600 hover:bg-slate-50 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-emerald-600 text-white rounded-full font-bold hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {submitting ? 'Recording...' : 'Save Milestone'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: Update Progress */}
        {isProgressModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">Update Project Progress</h3>
                <button onClick={() => setIsProgressModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>

              <form onSubmit={handleUpdateProgress} className="space-y-4 text-xs">
                <div>
                  <div className="flex justify-between font-bold text-slate-700 uppercase mb-2">
                    <span>Progress Completion</span>
                    <span className="text-indigo-600 font-mono text-sm">{progressVal}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={progressVal}
                    onChange={(e) => setProgressVal(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Status Note / Summary</label>
                  <textarea
                    rows={3}
                    value={progressNoteText}
                    onChange={(e) => setProgressNoteText(e.target.value)}
                    placeholder="e.g., Completed Phase 2 bathymetry sounding runs; entering data processing."
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsProgressModalOpen(false)}
                    className="px-4 py-2 border rounded-full text-slate-600 hover:bg-slate-50 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-[#0D1117] text-white rounded-full font-bold hover:bg-slate-800 disabled:opacity-50"
                  >
                    {submitting ? 'Saving...' : 'Update Progress'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: Project Member Role & Permissions */}
        {isMemberAccessModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingMember ? 'Edit Project Role & Permissions' : 'Assign Project Member & Permissions'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Define custom title and granular checkbox permissions for this project
                  </p>
                </div>
                <button
                  onClick={() => setIsMemberAccessModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveMemberAccess} className="space-y-4 text-xs">
                {/* User Selection */}
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Select Team Member *
                  </label>
                  {editingMember ? (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
                      <UserAvatar
                        src={editingMember.avatarUrl}
                        name={editingMember.name || 'Staff'}
                        size="sm"
                        shape="circle"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-900">{editingMember.name}</p>
                        <p className="text-[10px] text-slate-500">{editingMember.email}</p>
                      </div>
                    </div>
                  ) : (
                    <select
                      value={targetUserId}
                      onChange={(e) => setTargetUserId(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="">-- Choose employee --</option>
                      {allUsers.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.email}) - {u.designation || u.department || 'Staff'}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Custom Role Input & Presets */}
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Project Role Title (Free Text) *
                  </label>
                  <input
                    type="text"
                    required
                    value={customRoleTitle}
                    onChange={(e) => setCustomRoleTitle(e.target.value)}
                    placeholder="e.g., Site Lead, Field Auditor, Quality Inspector, Senior Surveyor..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                  
                  {/* Preset Pills */}
                  <div className="mt-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Quick Role Presets:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {ROLE_PRESETS.map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => {
                            setCustomRoleTitle(preset.role);
                            setMemberPerms(preset.perms as any);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                            customRoleTitle.toLowerCase() === preset.role.toLowerCase()
                              ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                              : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-600'
                          }`}
                        >
                          {preset.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 10 Granular Checkboxes */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <label className="block font-bold text-slate-900 uppercase">
                      Operational Permissions Matrix (10 Checkboxes)
                    </label>
                    <span className="text-[10px] text-slate-400">Granular project access</span>
                  </div>

                  {/* Crucial: Expense Approval Permission */}
                  <div
                    onClick={() =>
                      setMemberPerms({
                        ...memberPerms,
                        canApproveExpenses: !memberPerms.canApproveExpenses,
                      })
                    }
                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                      memberPerms.canApproveExpenses
                        ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 shadow-xs'
                        : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100/60 text-slate-700'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-lg flex items-center justify-center border mt-0.5 shrink-0 ${
                        memberPerms.canApproveExpenses
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {memberPerms.canApproveExpenses && <Check size={12} strokeWidth={3} />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck
                          size={14}
                          className={memberPerms.canApproveExpenses ? 'text-emerald-700' : 'text-slate-400'}
                        />
                        <span className="font-black text-xs">
                          can_approve_expenses: Approve & Reject Project Expenses
                        </span>
                      </div>
                      <p className="text-[11px] opacity-80 mt-0.5 leading-snug">
                        Authorizes this person to receive instant expense alerts, review voucher photos, and approve or reject field claims for this project.
                      </p>
                    </div>
                  </div>

                  {/* Remaining 9 Checkboxes in 2-Column Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {[
                      {
                        key: 'canViewBudget',
                        label: 'can_view_budget',
                        desc: 'View project budget caps & allocations',
                      },
                      {
                        key: 'canRecordRevenue',
                        label: 'can_record_revenue',
                        desc: 'Log received invoices & milestones',
                      },
                      {
                        key: 'canViewExpenses',
                        label: 'can_view_expenses',
                        desc: 'View project expenditures ledger',
                      },
                      {
                        key: 'canCreateExpenses',
                        label: 'can_create_expenses',
                        desc: 'Submit field expense claims',
                      },
                      {
                        key: 'canManageTasks',
                        label: 'can_manage_tasks',
                        desc: 'Create, assign & edit tasks',
                      },
                      {
                        key: 'canUpdateProgress',
                        label: 'can_update_progress',
                        desc: 'Adjust project completion percentage',
                      },
                      {
                        key: 'canManageTeam',
                        label: 'can_manage_team',
                        desc: 'Assign members & edit project roles',
                      },
                      {
                        key: 'canEditProject',
                        label: 'can_edit_project',
                        desc: 'Edit project details & site coordinates',
                      },
                      {
                        key: 'canViewAttendance',
                        label: 'can_view_attendance',
                        desc: 'View team attendance & GPS logs',
                      },
                    ].map((item) => {
                      const isChecked = Boolean((memberPerms as any)[item.key]);
                      return (
                        <div
                          key={item.key}
                          onClick={() =>
                            setMemberPerms({
                              ...memberPerms,
                              [item.key]: !isChecked,
                            })
                          }
                          className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                            isChecked
                              ? 'bg-indigo-50/70 border-indigo-200 text-indigo-950'
                              : 'bg-slate-50/50 border-slate-150 hover:bg-slate-100/60 text-slate-700'
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded-md flex items-center justify-center border mt-0.5 shrink-0 ${
                              isChecked
                                ? 'bg-indigo-600 border-indigo-600 text-white'
                                : 'border-slate-300 bg-white'
                            }`}
                          >
                            {isChecked && <Check size={10} strokeWidth={3} />}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-[11px] block truncate">{item.label}</span>
                            <span className="text-[10px] text-slate-400 block leading-tight">{item.desc}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsMemberAccessModalOpen(false)}
                    className="px-4 py-2 border rounded-full text-slate-600 hover:bg-slate-50 text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-indigo-600 text-white rounded-full text-xs font-bold hover:bg-indigo-700 disabled:opacity-50 shadow-sm"
                  >
                    {submitting ? 'Saving...' : 'Save Member Permissions'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: Assign Team Members */}
        {isAssignModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">Assign Project Team Personnel</h3>
                <button onClick={() => setIsAssignModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>

              <input
                type="text"
                placeholder="Search staff by name or department..."
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
              />

              <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                {allUsers
                  .filter((u) => {
                    if (!memberSearch) return true;
                    const q = memberSearch.toLowerCase();
                    return (
                      (u.name && u.name.toLowerCase().includes(q)) ||
                      (u.department && u.department.toLowerCase().includes(q)) ||
                      (u.email && u.email.toLowerCase().includes(q))
                    );
                  })
                  .map((user) => {
                    const isSelected = selectedMemberIds.includes(user.id);
                    return (
                      <div
                        key={user.id}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedMemberIds(selectedMemberIds.filter((id) => id !== user.id));
                          } else {
                            setSelectedMemberIds([...selectedMemberIds, user.id]);
                          }
                        }}
                        className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer border transition-all ${
                          isSelected
                            ? 'bg-violet-50 border-violet-200 text-violet-900'
                            : 'bg-slate-50/60 border-slate-100 hover:bg-slate-100/60 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <UserAvatar
                            src={user.avatarUrl || user.avatar_url}
                            name={user.name || 'Staff'}
                            size="sm"
                            shape="circle"
                          />
                          <div>
                            <p className="text-xs font-bold">{user.name}</p>
                            <p className="text-[10px] text-slate-400">{user.designation || user.department}</p>
                          </div>
                        </div>

                        <div className={`w-5 h-5 rounded-lg flex items-center justify-center border ${
                          isSelected ? 'bg-violet-600 border-violet-600 text-white' : 'border-slate-300 bg-white'
                        }`}>
                          {isSelected && <Check size={12} strokeWidth={3} />}
                        </div>
                      </div>
                    );
                  })}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-2 border rounded-full text-slate-600 hover:bg-slate-50 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveTeamMembers}
                  disabled={submitting}
                  className="px-5 py-2 bg-[#0D1117] text-white rounded-full text-xs font-bold hover:bg-slate-800 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : `Save Assignments (${selectedMemberIds.length})`}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: Create Task */}
        {isTaskModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">Create Deliverable Task</h3>
                <button onClick={() => setIsTaskModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>

              <form onSubmit={handleCreateTask} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Task Title *</label>
                  <input
                    type="text"
                    required
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder="e.g., Deliver bathymetric contour shapefiles"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={taskDesc}
                    onChange={(e) => setTaskDesc(e.target.value)}
                    placeholder="Deliverable specifications and expectations..."
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Assignee Staff *</label>
                  <select
                    required
                    value={taskAssigneeId}
                    onChange={(e) => setTaskAssigneeId(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">-- Choose Assigned Personnel --</option>
                    {allUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.designation || u.department || 'Staff'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Budget Line</label>
                    <input
                      type="text"
                      placeholder="e.g., Equipment"
                      value={taskBudgetLine}
                      onChange={(e) => setTaskBudgetLine(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Due Date</label>
                    <input
                      type="date"
                      value={taskDueDate}
                      onChange={(e) => setTaskDueDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsTaskModalOpen(false)}
                    className="px-4 py-2 border rounded-full text-slate-600 hover:bg-slate-50 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-[#0D1117] text-white rounded-full font-bold hover:bg-slate-800 disabled:opacity-50"
                  >
                    {submitting ? 'Creating...' : 'Create Task'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: Close / Reopen Project */}
        {isCloseModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <Archive size={24} />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-base font-bold text-slate-900">
                  {project.isClosed || project.is_closed ? 'Reopen Project?' : 'Archive & Close Project?'}
                </h3>
                <p className="text-xs text-slate-500">
                  {project.isClosed || project.is_closed
                    ? 'This will restore the project to Ongoing state and allow new claims and tasks.'
                    : 'This marks all milestone objectives as finalized and locks operational expenditures.'}
                </p>
              </div>

              <div className="flex justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCloseModalOpen(false)}
                  className="px-5 py-2 border rounded-full text-slate-600 hover:bg-slate-50 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleToggleCloseProject}
                  disabled={submitting}
                  className="px-6 py-2 bg-[#0D1117] text-white rounded-full text-xs font-bold hover:bg-slate-800 disabled:opacity-50"
                >
                  {submitting ? 'Updating...' : project.isClosed || project.is_closed ? 'Reopen Project' : 'Confirm Close'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Expense Claim Inspection Details Modal */}
        {inspectExpense && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-slate-200 shadow-xl max-h-[90vh] overflow-y-auto space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                    <Receipt size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Voucher Claim Inspection</h4>
                    <p className="text-[11px] text-slate-400 font-mono">
                      Ref #{String(inspectExpense.id || '').slice(0, 8)} •{' '}
                      {inspectExpense.date ? new Date(inspectExpense.date).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setInspectExpense(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2.5 p-3 bg-slate-50/80 rounded-2xl border border-slate-100 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                    Claimant Personnel
                  </span>
                  <span className="font-bold text-slate-900">
                    {inspectExpense.employeeName || inspectExpense.employee_name || 'Staff Member'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                    Category Cap Tag
                  </span>
                  <span className="font-semibold text-slate-800 capitalize">
                    {inspectExpense.categoryName || inspectExpense.category_name || inspectExpense.category || 'General'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                    Claim Status
                  </span>
                  <StatusBadge status={inspectExpense.status} />
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                    Total Voucher Amount
                  </span>
                  <span className="font-mono font-black text-emerald-600 text-sm">
                    ৳{(Number(inspectExpense.amount) || 0).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Justification Note */}
              <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-100 text-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Claim Justification / Description
                </span>
                <p className="text-slate-700 leading-relaxed font-medium">
                  {inspectExpense.note || inspectExpense.description || 'No detailed note was provided with this voucher claim.'}
                </p>
              </div>

              {/* Attached Receipt Photo */}
              {(inspectExpense.receiptPhotoUrl || inspectExpense.receipt_photo_url || inspectExpense.receiptUrl || inspectExpense.receipt_url) ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-1.5">
                      <Receipt size={14} className="text-indigo-600" />
                      Commercial Voucher Photo
                    </span>
                    <a
                      href={inspectExpense.receiptPhotoUrl || inspectExpense.receipt_photo_url || inspectExpense.receiptUrl || inspectExpense.receipt_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 text-[11px]"
                    >
                      <ExternalLink size={12} /> Open Full Size
                    </a>
                  </div>
                  <div className="p-2 bg-slate-100/70 rounded-2xl border border-slate-200 flex justify-center overflow-hidden">
                    <img
                      src={inspectExpense.receiptPhotoUrl || inspectExpense.receipt_photo_url || inspectExpense.receiptUrl || inspectExpense.receipt_url}
                      alt="Expense voucher"
                      className="max-h-72 w-auto object-contain rounded-xl shadow-xs"
                    />
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/60 text-center text-amber-800 text-xs">
                  <AlertTriangle size={16} className="mx-auto text-amber-500 mb-1" />
                  No physical or digital receipt photo was attached to this claim.
                </div>
              )}

              {/* Audit Comments Thread */}
              {inspectExpense.comments && inspectExpense.comments.length > 0 && (
                <div className="space-y-2 text-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Audit Remarks ({inspectExpense.comments.length})
                  </span>
                  <div className="space-y-2 max-h-36 overflow-y-auto">
                    {inspectExpense.comments.map((c: any, idx: number) => (
                      <div key={idx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2">
                        <UserAvatar
                          src={c.avatarUrl || c.userAvatarUrl}
                          name={c.userName || 'Administrator'}
                          size="sm"
                          shape="rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="font-bold text-slate-900 text-xs">{c.userName || 'Admin'}</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {c.createdAt ? new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                            </span>
                          </div>
                          <p className="text-slate-700 text-xs">{c.comment || c.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-slate-100">
                {canApproveClaims && inspectExpense.status === 'pending' && (
                  <>
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => handleRejectExpense(inspectExpense.id)}
                      className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-full text-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <XCircle size={14} />
                      Reject Claim
                    </button>
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => handleApproveExpense(inspectExpense.id)}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-full text-xs transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                    >
                      <CheckCircle2 size={14} />
                      Approve Claim
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => setInspectExpense(null)}
                  className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-full text-xs transition-colors"
                >
                  Close Inspection
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default function ProjectDetailPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ProjectDetailContent />
    </React.Suspense>
  );
}
