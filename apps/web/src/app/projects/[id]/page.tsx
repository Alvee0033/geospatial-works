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
} from 'lucide-react';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { isAssignedToUser, selectAssignedProjects, selectOwnProjectRecords, selectOwnRecords } from '@/lib/roleAccess';

function ProjectDetailContent() {
  const router = useRouter();
  const routeParams = useParams();
  const projectId = (routeParams?.id as string) || '';

  const [project, setProject] = useState<any | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [roleResolved, setRoleResolved] = useState(false);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'budget' | 'team' | 'expenses' | 'revenue' | 'tasks'>('overview');

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
      let user = currentUser;
      if (!user) { try { user = JSON.parse(localStorage.getItem('gw_user') || 'null'); } catch {} }
      if (user?.role === 'project_member') {
        const [proj, allExp, pTasks] = await Promise.all([
          ApiClient.getProjectById(projectId).catch(() => null),
          ApiClient.getExpenses().catch(() => []),
          ApiClient.getTasks(projectId).catch(() => []),
        ]);
        const userId = String(user.id ?? user._id ?? '');
        const memberProject = proj && selectAssignedProjects([proj], userId)[0];
        setProject(memberProject || null);
        setExpenses(memberProject ? selectOwnProjectRecords(allExp || [], userId, memberProject) : []);
        setTasks((pTasks || []).filter((task: any) => isAssignedToUser(task, userId)));
        setAllUsers([]);
        return;
      }
      const [proj, allExp, pTasks, users] = await Promise.all([
        ApiClient.getProjectById(projectId).catch(() => null),
        ApiClient.getExpenses({ projectId }).catch(() => []),
        ApiClient.getTasks(projectId).catch(() => []),
        ApiClient.getUsers().catch(() => []),
      ]);

      if (proj) {
        setProject(proj);
        setProgressVal(proj.progressPercentage || proj.progress_percentage || 0);
        setSelectedMemberIds(proj.teamMemberIds || proj.team_member_ids || []);
      }
      setExpenses(allExp || []);
      setTasks(pTasks || []);
      setAllUsers(users || []);
    } catch (e) {
      console.error('Failed to load project details:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    try { setCurrentUser(JSON.parse(localStorage.getItem('gw_user') || 'null')); } catch {}
    setRoleResolved(true);
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

  if (!roleResolved) return <div className="min-h-screen bg-[#F7F8F6]" aria-label="Loading project access" />;

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

  if (currentUser?.role === 'project_member') {
    const projectTasks = tasks;
    const projectExpenses = expenses;
    const statusLabel = String(project.status || 'In progress').replace(/_/g, ' ');
    return (
      <AdminLayout title={project.name} subtitle="Project overview">
        <div className="mx-auto max-w-5xl space-y-5 px-5 py-6">
          <div className="flex items-center justify-between gap-3">
            <Link href="/projects" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"><ArrowLeft size={16} /> My projects</Link>
            <StatusBadge status={statusLabel} />
          </div>
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {project.imageUrl || project.image_url ? <img src={project.imageUrl || project.image_url} alt="" className="h-44 w-full object-cover" /> : null}
            <div className="space-y-4 p-5 sm:p-7">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">{project.projectId || project.project_code || 'Assigned project'}</p>
                <h1 className="mt-1 text-2xl font-bold text-slate-900">{project.name}</h1>
                <p className="mt-1 text-sm text-slate-500">{project.client || project.client_name || 'Project'}{project.endDate || project.end_date ? ` · Due ${new Date(project.endDate || project.end_date).toLocaleDateString()}` : ''}</p>
              </div>
              {project.description && <p className="max-w-3xl text-sm leading-6 text-slate-600">{project.description}</p>}
              <div className="grid gap-3 sm:grid-cols-2">
                <Link href="/tasks" className="rounded-xl border border-slate-200 p-4 transition hover:border-indigo-300 hover:bg-indigo-50/40">
                  <span className="text-xs font-medium text-slate-500">Your assigned tasks</span><p className="mt-1 text-2xl font-semibold text-slate-900">{projectTasks.length}</p><span className="text-sm font-medium text-indigo-700">Open my tasks →</span>
                </Link>
                <Link href="/expenses" className="rounded-xl border border-slate-200 p-4 transition hover:border-emerald-300 hover:bg-emerald-50/40">
                  <span className="text-xs font-medium text-slate-500">Your submitted claims</span><p className="mt-1 text-2xl font-semibold text-slate-900">{projectExpenses.length}</p><span className="text-sm font-medium text-emerald-700">View or submit a claim →</span>
                </Link>
              </div>
              <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                <Link href="/attendance" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">My attendance</Link>
                <Link href="/expenses" className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Submit a claim</Link>
              </div>
            </div>
          </section>
        </div>
      </AdminLayout>
    );
  }

  // Financial calculations
  const grossValue = Number(project.grossProjectValue || project.gross_project_value || 0);
  const agreedBudget = Number(project.budget || 0);
  const advanceReceived = Number(project.advanceReceived || project.advance_received || 0);
  const amountReceived = Number(project.amountReceived || project.amount_received || advanceReceived);
  const receivable = Math.max(0, grossValue - amountReceived);

  // Expense calculations
  const projectExpenses = expenses.filter(
    (e) => e.projectId === project.id || e.project_id === project.id || e.projectId === project.projectId
  );
  const totalSpent = projectExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const approvedSpent = projectExpenses
    .filter((e) => e.status === 'approved' || e.status === 'paid')
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  const remainingBudget = Math.max(0, agreedBudget - totalSpent);
  const budgetUtilization = agreedBudget > 0 ? (totalSpent / agreedBudget) * 100 : 0;
  const completionPercentage = Number(project.progressPercentage || project.progress_percentage || 0);

  // Category Budgets vs Actual
  const rawCatBudgets: Record<string, number> = project.categoryBudgets || project.category_budgets || {};
  const standardCategoryKeys = ['equipment', 'transportation', 'food', 'accommodation', 'officecost', 'officebenefit'];
  
  // Clean meta keys
  const categoryBudgets: Record<string, number> = {};
  Object.entries(rawCatBudgets).forEach(([k, v]) => {
    if (!k.startsWith('_meta_')) {
      categoryBudgets[k] = Number(v) || 0;
    }
  });

  const getSpentByCategory = (catName: string) => {
    const norm = catName.toLowerCase().replace(/[^a-z]/g, '');
    return projectExpenses
      .filter((e) => {
        const c = (e.category || '').toLowerCase().replace(/[^a-z]/g, '');
        return c === norm || (norm === 'officecost' && c === 'office');
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

  // Team members
  const memberIds: string[] = project.teamMemberIds || project.team_member_ids || [];
  const assignedUsers = allUsers.filter((u) => memberIds.includes(u.id));

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

  // Handler: Assign Team Members
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
            { id: 'team', label: `Team Members (${assignedUsers.length})`, icon: Users },
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
                  const burnPct = allocated > 0 ? (spent / allocated) * 100 : 0;
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
                        <span className={`text-[8px] font-bold px-1 py-0.5 rounded-full ${
                          burnPct > 100 ? 'bg-rose-100 text-rose-700' : 'bg-white/80 text-slate-700'
                        }`}>
                          {burnPct.toFixed(0)}%
                        </span>
                      </div>

                      <div className="flex items-baseline justify-between gap-2 text-[9px] whitespace-nowrap">
                        <span className="text-slate-500">
                          Spent <span className="font-black text-slate-900 font-mono">৳{spent.toLocaleString()}</span>
                        </span>
                        <span className="text-slate-400">
                          Cap <span className="font-bold text-slate-700 font-mono">৳{allocated.toLocaleString()}</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <div className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              burnPct > 100 ? 'bg-rose-600' : colors.bar
                            }`}
                            style={{ width: `${Math.min(100, burnPct)}%` }}
                          />
                        </div>
                        <span className="shrink-0 text-[8px] font-medium text-slate-400">Rem ৳{remaining.toLocaleString()}</span>
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
                <h3 className="text-base font-bold text-slate-900">Project Staff & Key Personnel</h3>
                <p className="text-xs text-slate-400">Engineers and surveyors authorized to log GPS attendance and expenses</p>
              </div>
              <button
                onClick={() => setIsAssignModalOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#0D1117] text-white text-xs font-bold rounded-full hover:bg-slate-800 transition-all shadow-sm"
              >
                <UserPlus size={15} />
                Manage Personnel Assignments
              </button>
            </div>

            {assignedUsers.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                No team members assigned to this project yet. Click "Manage Personnel Assignments" to add team members.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {assignedUsers.map((user) => (
                  <div
                    key={user.id}
                    className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl flex items-center justify-between gap-3 hover:border-slate-300 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <UserAvatar
                        src={user.avatarUrl || user.avatar_url}
                        name={user.name || 'Staff'}
                        size="md"
                        shape="rounded"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{user.designation || user.role}</p>
                        <p className="text-[10px] text-indigo-600 truncate">{user.email}</p>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Active
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: Project Claims & Expenses */}
        {activeTab === 'expenses' && (
          <div className="bg-white border border-[#EAEBEF] rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Project Field Expenditures</h3>
                <p className="text-xs text-slate-400">Verified voucher claims attributed directly to this cost code</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Claims Count</span>
                <p className="text-sm font-bold text-slate-900">{projectExpenses.length} Records</p>
              </div>
            </div>

            {projectExpenses.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                No expense claims logged under this project code yet.
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
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {projectExpenses.map((exp) => (
                      <tr key={exp.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-slate-600">
                          {exp.date ? new Date(exp.date).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {exp.employeeName || exp.employee_name || 'Staff'}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-[11px] capitalize">
                            {exp.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                          {exp.description}
                        </td>
                        <td className="py-3.5 px-4 text-right font-black font-mono text-slate-900">
                          ৳{(Number(exp.amount) || 0).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {exp.receiptUrl || exp.receipt_url ? (
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

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
