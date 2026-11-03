'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { ApiClient } from '@/lib/api';
import { notifyAction } from '@/components/feedback/ActionFeedback';
import {
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  User,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  Tag,
  Edit2,
  Trash2,
  MessageSquare,
  List,
  Columns,
  ArrowUpDown,
  MoreHorizontal,
  ChevronDown,
  Check,
} from 'lucide-react';
import { ExportUtils } from '@/lib/exportUtils';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { isAssignedToUser, selectAssignedProjects } from '@/lib/roleAccess';

type KanbanStatus = 'todo' | 'in_progress' | 'completed';

interface TaskItem {
  id: string;
  title: string;
  description?: string;
  projectId?: string;
  project_id?: string;
  projectName?: string;
  assigneeId?: string;
  assignee_id?: string;
  assigneeName?: string;
  assignee_name?: string;
  budgetLine?: string;
  budget_line?: string;
  dueDate?: string;
  due_date?: string;
  status: string;
  priority?: 'important' | 'high' | 'medium' | 'low';
  commentsCount?: number;
  assignees?: { id: string; name: string; avatar?: string }[];
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [canManageTasks, setCanManageTasks] = useState(false);
  const [canUpdateTaskStatus, setCanUpdateTaskStatus] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [roleReady, setRoleReady] = useState(false);
  const [loadError, setLoadError] = useState('');

  // Active view: 'kanban' | 'list'
  const [activeView, setActiveView] = useState<'kanban' | 'list'>('kanban');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formProjectId, setFormProjectId] = useState('');
  const [formAssigneeIds, setFormAssigneeIds] = useState<string[]>([]);
  const [assigneeSearch, setAssigneeSearch] = useState('');
  const [isAssigneeMenuOpen, setIsAssigneeMenuOpen] = useState(false);
  const [formPriority, setFormPriority] = useState<'important' | 'high' | 'medium' | 'low'>('important');
  const [formDueDate, setFormDueDate] = useState('');
  const [formStatus, setFormStatus] = useState<KanbanStatus>('todo');

  // Drag and Drop state
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  const fetchTasksData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      let user = currentUser;
      if (!user) { try { user = JSON.parse(localStorage.getItem('gw_user') || 'null'); } catch {} }
      if (user?.role === 'project_member') {
        const results = await Promise.allSettled([ApiClient.getTasks(), ApiClient.getProjects()]);
        const errors = results.flatMap((result, index) => result.status === 'rejected' ? [['tasks', 'projects'][index]] : []);
        const userId = String(user.id ?? user._id ?? '');
        setTasks(results[0].status === 'fulfilled' ? (results[0].value || []).filter((task: any) => isAssignedToUser(task, userId)) : []);
        setProjects(results[1].status === 'fulfilled' ? selectAssignedProjects(results[1].value || [], userId) : []);
        setUsers([]);
        setLoadError(errors.length ? `Could not load your ${errors.join(' and ')} from the server. Please retry.` : '');
        return;
      }
      const results = await Promise.allSettled([ApiClient.getTasks(), ApiClient.getProjects(), ApiClient.getUsers()]);
      const errors = results.flatMap((result, index) => result.status === 'rejected' ? [['tasks', 'projects', 'people'][index]] : []);
      if (results[0].status === 'fulfilled') setTasks(results[0].value || []);
      if (results[1].status === 'fulfilled') setProjects(results[1].value || []);
      if (results[2].status === 'fulfilled') setUsers(results[2].value || []);
      setLoadError(errors.length ? `Could not load ${errors.join(', ')} from the server. Some actions may be unavailable.` : '');
    } catch (e) {
      console.error('Error fetching tasks data:', e);
      setLoadError('Could not load live task data. Please retry.');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem('gw_user') || '{}');
      setCurrentUser(user);
      setCanManageTasks(['main_admin', 'project_manager'].includes(user.role));
      setCanUpdateTaskStatus(['main_admin', 'project_manager', 'project_member'].includes(user.role));
    } catch { setCanManageTasks(false); setCanUpdateTaskStatus(false); }
    setRoleReady(true);
    void fetchTasksData();
    const unsubscribe = ApiClient.subscribeToDataRefresh(() => { void fetchTasksData(true); });
    return unsubscribe;
  }, []);

  // Standardize task status into Kanban categories
  const normalizeStatus = (task: any): KanbanStatus => {
    const s = (task.status || '').toLowerCase();
    if (s.includes('complete') || s === 'done') return 'completed';
    if (s === 'todo' || s === 'not_started') return 'todo';
    return 'in_progress';
  };

  // Normalized tasks with priority and assignees
  const enrichedTasks = useMemo(() => {
    return tasks.map((t) => {
      const normStatus = normalizeStatus(t);
      const pr = t.priority === 'ok' ? 'low' : t.priority || 'medium';
      const pName = projects.find((p) => p.id === (t.projectId || t.project_id))?.name || 'General Operations';
      const aName = t.assigneeName || t.assignee_name || 'Staff Member';
      const aId = t.assigneeId || t.assignee_id || t.assignees?.[0]?.id;
      const matchedUser = users.find((u) => u.id === aId || u.name === aName);
      const aAvatar = t.assigneeAvatar || t.assignee_avatar || t.assignees?.[0]?.avatar || matchedUser?.avatarUrl || matchedUser?.avatar_url;

      return {
        ...t,
        kanbanStatus: normStatus,
        priority: pr,
        projectName: pName,
        assigneeName: aName,
        assigneeAvatar: aAvatar,
      };
    });
  }, [tasks, projects, users]);

  // Filtered Tasks
  const filteredTasks = useMemo(() => {
    return enrichedTasks.filter((task) => {
      // Project filter
      if (selectedProjectId !== 'all') {
        const pId = task.projectId || task.project_id;
        if (pId !== selectedProjectId) return false;
      }

      // Priority filter
      if (selectedPriority !== 'all' && task.priority !== selectedPriority) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = (task.title || '').toLowerCase().includes(q);
        const matchDesc = (task.description || '').toLowerCase().includes(q);
        const matchAssignee = (task.assigneeName || '').toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchAssignee) return false;
      }

      return true;
    });
  }, [enrichedTasks, selectedProjectId, selectedPriority, searchQuery]);

  const assignableUsers = useMemo(() => {
    const query = assigneeSearch.trim().toLowerCase();
    const eligible = users.filter((user) => ['main_admin', 'project_manager', 'project_member'].includes(user.role));
    if (!query) return eligible;
    const matches = eligible.filter((user) =>
      [user.name, user.full_name, user.email, user.department]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
    const selectedUsers = eligible.filter((user) => formAssigneeIds.includes(user.id));
    return [...selectedUsers, ...matches.filter((user) => !formAssigneeIds.includes(user.id))];
  }, [users, assigneeSearch, formAssigneeIds]);

  // Group by Kanban column
  const todoTasks = useMemo(() => filteredTasks.filter((t) => t.kanbanStatus === 'todo'), [filteredTasks]);
  const inProgressTasks = useMemo(() => filteredTasks.filter((t) => t.kanbanStatus === 'in_progress'), [filteredTasks]);
  const completedTasks = useMemo(() => filteredTasks.filter((t) => t.kanbanStatus === 'completed'), [filteredTasks]);

  // Selected project object
  const activeProject = useMemo(() => {
    if (selectedProjectId === 'all') {
      return { id: 'all', name: 'All Active Projects', client: 'Enterprise Works' };
    }
    return projects.find((p) => p.id === selectedProjectId) || { id: selectedProjectId, name: 'Project Deliverables', client: 'Client Operations' };
  }, [selectedProjectId, projects]);

  // Open modal to add new task with predefined column status
  const handleOpenCreate = (targetStatus: KanbanStatus = 'todo') => {
    setEditingTask(null);
    setFormTitle('');
    setFormDesc('');
    setFormProjectId(selectedProjectId !== 'all' ? selectedProjectId : projects[0]?.id || '');
    setFormAssigneeIds([]);
    setAssigneeSearch('');
    setIsAssigneeMenuOpen(false);
    setFormPriority('important');
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 14);
    setFormDueDate(defaultDate.toISOString().split('T')[0]);
    setFormStatus(targetStatus);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (task: any) => {
    setEditingTask(task);
    setFormTitle(task.title || '');
    setFormDesc(task.description || '');
    setFormProjectId(task.projectId || task.project_id || projects[0]?.id || '');
    const assigneeIds = task.assignees?.map((user: any) => user.id) || [task.assigneeId || task.assignee_id || users[0]?.id].filter(Boolean);
    setFormAssigneeIds(assigneeIds);
    setAssigneeSearch('');
    setIsAssigneeMenuOpen(false);
    setFormPriority(task.priority === 'ok' ? 'low' : task.priority || 'important');
    if (task.dueDate || task.due_date) {
      setFormDueDate(new Date(task.dueDate || task.due_date).toISOString().split('T')[0]);
    } else {
      setFormDueDate('');
    }
    setFormStatus(task.kanbanStatus || 'todo');
    setIsModalOpen(true);
  };

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;
    if (!formProjectId) {
      notifyAction('Choose a project before saving this task.', 'error', 'Project required');
      return;
    }
    if (!formAssigneeIds.length) {
      notifyAction('Select at least one assignee before saving this task.', 'error', 'Assignee required');
      return;
    }

    setSubmitting(true);
    try {
      const targetProjId = formProjectId || projects[0]?.id;
      const assigneeIds = [...new Set(formAssigneeIds)];
      const targetUserId = assigneeIds[0];
      const assignee = users.find((u) => u.id === targetUserId);

      const payload = {
        title: formTitle.trim(),
        description: formDesc.trim(),
        project_id: targetProjId,
        projectId: targetProjId,
        assignee_id: targetUserId,
        assigneeId: targetUserId,
        assignee_ids: assigneeIds,
        assigneeIds,
        assignee_name: assignee?.name || 'Staff Member',
        due_date: formDueDate ? new Date(formDueDate).toISOString() : new Date().toISOString(),
        status: formStatus,
        budget_line: editingTask?.budgetLine || editingTask?.budget_line || null,
        budgetLine: editingTask?.budgetLine || editingTask?.budget_line || null,
        priority: formPriority,
      };

      if (editingTask) {
        await ApiClient.updateTask(editingTask.id, payload);
      } else {
        await ApiClient.createTask(payload);
      }
      notifyAction(editingTask ? 'Task changes saved.' : 'Task assigned successfully.');

      setIsModalOpen(false);
      setEditingTask(null);
      await fetchTasksData();
    } catch (err: any) {
      console.error('Failed saving task:', err);
      notifyAction(err.message || 'Task could not be saved.', 'error', 'Task save failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMoveStatus = async (taskId: string, newStatus: KanbanStatus) => {
    if (!canUpdateTaskStatus) return;
    // Optimistic UI update
    const previous = tasks;

    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: newStatus,
              kanbanStatus: newStatus,
            }
          : t
      )
    );

    try {
      const updated = await ApiClient.updateTaskStatus(taskId, newStatus);
      setTasks((prev) => prev.map((task) => task.id === taskId ? { ...task, ...updated, kanbanStatus: newStatus } : task));
      notifyAction('Task status updated.');
    } catch (err) {
      console.error('Failed to update task status:', err);
      setTasks(previous);
      notifyAction(err instanceof Error ? err.message : 'Task status could not be saved. Please try again.', 'error', 'Status update failed');
    }
  };

  const handleDeleteTask = async (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await ApiClient.deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      notifyAction('Task deleted.');
    } catch (err) {
      console.error('Failed to delete task:', err);
      notifyAction(err instanceof Error ? err.message : 'Task could not be deleted.', 'error', 'Delete failed');
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedTaskId(id);
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: KanbanStatus) => {
    if (!canUpdateTaskStatus) return;
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (id) {
      await handleMoveStatus(id, targetStatus);
    }
    setDraggedTaskId(null);
  };

  const handleExport = () => {
    const rows = filteredTasks.map((t) => ({
      ID: t.id,
      Title: t.title,
      Description: t.description || '',
      Project: t.projectName,
      Assignee: t.assigneeName,
      Status: t.kanbanStatus.toUpperCase(),
      Priority: (t.priority || 'NORMAL').toUpperCase(),
      'Due Date': t.dueDate || t.due_date || '',
    }));
    ExportUtils.exportToExcel(rows, `GW_Kanban_Deliverables`);
  };

  // Priority Badge Renderer
  // Priority Badge Renderer
  const renderPriorityBadge = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
      case 'urgent':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-600 border border-rose-100/70">
            High Priority
          </span>
        );
      case 'medium':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-sky-50 text-sky-600 border border-sky-100/70">
            Medium
          </span>
        );
      case 'low':
      case 'ok':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-100/70">
            Standard
          </span>
        );
      case 'important':
      default:
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600 border border-indigo-100/70">
            Important
          </span>
        );
    }
  };

  return (
    <AdminLayout
      title={currentUser?.role === 'project_member' ? 'My tasks' : 'Tasks & Deliverables Kanban'}
      onRefresh={() => { void fetchTasksData(); }}
      onExport={handleExport}
      isRefreshing={loading}
    >
      <div className="w-full max-w-[1440px] mx-auto px-5 py-5 space-y-3">
        {loadError && <div role="alert" className="flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900"><span>{loadError}</span><button type="button" onClick={() => void fetchTasksData()} className="font-semibold underline">Retry</button></div>}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Tasks</h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
              {filteredTasks.length} open items
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="bg-white border border-[#EAEBEF] rounded-2xl px-3.5 py-2 text-xs font-bold text-slate-800 shadow-2xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer pr-8 appearance-none"
              >
                <option value="all">All Projects</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            {canManageTasks && <button
              onClick={() => handleOpenCreate('todo')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors"
            >
              <Plus size={14} />
              <span>New task</span>
            </button>}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
          <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1 text-xs font-bold">
            <button
              onClick={() => setActiveView('list')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-colors ${
                activeView === 'list'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <List size={15} />
              <span>List</span>
            </button>

            <button
              onClick={() => setActiveView('kanban')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-colors ${
                activeView === 'kanban'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Columns size={15} />
              <span>Board</span>
            </button>
          </div>

          {/* Right Search, Filter & Sort Controls */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 bg-white border border-[#EAEBEF] rounded-2xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-2xs w-48"
              />
            </div>

            <div className="relative">
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="bg-white border border-[#EAEBEF] rounded-2xl px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs focus:outline-none cursor-pointer flex items-center gap-1"
              >
                <option value="all">All Priorities</option>
                <option value="important">Important</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium</option>
                <option value="low">Standard</option>
              </select>
            </div>

            <button
              onClick={() => setTasks([...tasks].reverse())}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#EAEBEF] rounded-2xl text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
            >
              <ArrowUpDown size={13} />
              <span>Sort</span>
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* KANBAN BOARD 3-COLUMN LAYOUT (Compact Desktop Fitted)           */}
        {/* ============================================================== */}
        {activeView === 'kanban' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 items-start">
            {/* ---------------- COLUMN 1: TO DO ---------------- */}
            <div
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, 'todo')}
              className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3 flex flex-col min-h-[280px] max-h-[560px] shadow-2xs"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">To Do</h3>
                </div>
                <span className="text-[11px] font-bold text-slate-500 bg-slate-200/60 px-2.5 py-0.5 rounded-full">
                  {todoTasks.length} Total
                </span>
              </div>

              {/* Add New Task Button (Purple matching image) */}
              {canManageTasks && <button
                onClick={() => handleOpenCreate('todo')}
                className="w-full py-2 px-3 bg-[#6366F1] hover:bg-indigo-600 text-white rounded-xl font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 mb-3 shrink-0"
              >
                <Plus size={14} />
                <span>Add New Task</span>
              </button>}

              {/* Cards Stream */}
              <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                {todoTasks.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs">
                    No tasks in To Do.
                  </div>
                ) : (
                  todoTasks.map((task) => (
                    <div
                      key={task.id}
                      draggable={canUpdateTaskStatus}
                      onDragStart={canUpdateTaskStatus ? (e) => handleDragStart(e, task.id) : undefined}
                      onClick={() => { if (canManageTasks) handleOpenEdit(task); }}
                      className={`bg-white rounded-xl p-3 border border-slate-200/90 shadow-2xs hover:shadow-sm hover:border-slate-300 transition-all group relative ${canManageTasks ? 'cursor-pointer' : ''}`}
                    >
                      {/* Priority Tag & Quick Status Shifter */}
                      <div className="flex items-center justify-between mb-2">
                        {renderPriorityBadge(task.priority)}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                          {canUpdateTaskStatus && <button
                            onClick={(e) => { e.stopPropagation(); handleMoveStatus(task.id, 'in_progress'); }}
                            className="text-[10px] font-bold px-2 py-0.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-md transition-colors"
                            title="Move to In Progress"
                          >Start →</button>}
                          {canManageTasks && <button
                            onClick={(e) => handleDeleteTask(task.id, e)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                            title="Delete Task"
                          >
                            <Trash2 size={12} />
                          </button>}
                        </div>
                      </div>

                      {/* Project Tag when viewing all */}
                      {selectedProjectId === 'all' && (
                        <p className="text-[10px] font-bold text-slate-400 mb-1 truncate">
                          {task.projectName}
                        </p>
                      )}

                      {/* Title */}
                      <h4 className="text-xs font-extrabold text-slate-900 leading-snug line-clamp-2">
                        {task.title}
                      </h4>

                      {/* Real Card Footer: Assignee & Due Date */}
                      <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 mt-2.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <UserAvatar
                            src={task.assigneeAvatar}
                            name={task.assigneeName || 'Unassigned'}
                            size="sm"
                            shape="circle"
                          />
                          <span className="text-[11px] font-semibold text-slate-700 truncate max-w-[110px]">
                            {task.assigneeName || 'Unassigned'}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 shrink-0">
                          <Calendar size={11} className="text-slate-400" />
                          <span>
                            {task.dueDate || task.due_date
                              ? new Date(task.dueDate || task.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                              : 'No Due Date'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* ---------------- COLUMN 2: IN PROGRESS ---------------- */}
            <div
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, 'in_progress')}
              className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3 flex flex-col min-h-[280px] max-h-[560px] shadow-2xs"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">In Progress</h3>
                </div>
                <span className="text-[11px] font-bold text-slate-500 bg-slate-200/60 px-2.5 py-0.5 rounded-full">
                  {inProgressTasks.length} Total
                </span>
              </div>

              {/* Add New Task Button (Orange matching image) */}
              {canManageTasks && <button
                onClick={() => handleOpenCreate('in_progress')}
                className="w-full py-2 px-3 bg-[#F59E0B] hover:bg-amber-600 text-white rounded-xl font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 mb-3 shrink-0"
              >
                <Plus size={14} />
                <span>Add New Task</span>
              </button>}

              {/* Cards Stream */}
              <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                {inProgressTasks.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs">
                    No tasks in progress.
                  </div>
                ) : (
                  inProgressTasks.map((task) => (
                    <div
                      key={task.id}
                      draggable={canUpdateTaskStatus}
                      onDragStart={canUpdateTaskStatus ? (e) => handleDragStart(e, task.id) : undefined}
                      onClick={() => { if (canManageTasks) handleOpenEdit(task); }}
                      className={`bg-white rounded-xl p-3 border border-slate-200/90 shadow-2xs hover:shadow-sm hover:border-slate-300 transition-all group relative ${canManageTasks ? 'cursor-pointer' : ''}`}
                    >
                      {/* Priority Tag & Quick Complete Action */}
                      <div className="flex items-center justify-between mb-2">
                        {renderPriorityBadge(task.priority)}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                          {canUpdateTaskStatus && <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveStatus(task.id, 'completed');
                            }}
                            className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-md transition-colors"
                            title="Complete Task"
                          >Done ✓</button>}
                          {canManageTasks && <button
                            onClick={(e) => handleDeleteTask(task.id, e)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                            title="Delete Task"
                          >
                            <Trash2 size={12} />
                          </button>}
                        </div>
                      </div>

                      {/* Project Tag when viewing all */}
                      {selectedProjectId === 'all' && (
                        <p className="text-[10px] font-bold text-slate-400 mb-1 truncate">
                          {task.projectName}
                        </p>
                      )}

                      {/* Title */}
                      <h4 className="text-xs font-extrabold text-slate-900 leading-snug line-clamp-2">
                        {task.title}
                      </h4>

                      {/* Real Card Footer: Assignee & Due Date */}
                      <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 mt-2.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <UserAvatar
                            src={task.assigneeAvatar}
                            name={task.assigneeName || 'Unassigned'}
                            size="sm"
                            shape="circle"
                          />
                          <span className="text-[11px] font-semibold text-slate-700 truncate max-w-[110px]">
                            {task.assigneeName || 'Unassigned'}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 shrink-0">
                          <Calendar size={11} className="text-slate-400" />
                          <span>
                            {task.dueDate || task.due_date
                              ? new Date(task.dueDate || task.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                              : 'No Due Date'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* ---------------- COLUMN 3: COMPLETED ---------------- */}
            <div
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, 'completed')}
              className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3 flex flex-col min-h-[280px] max-h-[560px] shadow-2xs"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">Completed</h3>
                </div>
                <span className="text-[11px] font-bold text-slate-500 bg-slate-200/60 px-2.5 py-0.5 rounded-full">
                  {completedTasks.length} Total
                </span>
              </div>

              {/* Add New Task Button (Green matching image) */}
              {canManageTasks && <button
                onClick={() => handleOpenCreate('completed')}
                className="w-full py-2 px-3 bg-[#10B981] hover:bg-emerald-600 text-white rounded-xl font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 mb-3 shrink-0"
              >
                <Plus size={14} />
                <span>Add New Task</span>
              </button>}

              {/* Cards Stream */}
              <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                {completedTasks.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs">
                    No completed tasks yet.
                  </div>
                ) : (
                  completedTasks.map((task) => (
                    <div
                      key={task.id}
                      draggable={canUpdateTaskStatus}
                      onDragStart={canUpdateTaskStatus ? (e) => handleDragStart(e, task.id) : undefined}
                      onClick={() => { if (canManageTasks) handleOpenEdit(task); }}
                      className={`bg-white rounded-xl p-3 border border-slate-200/90 shadow-2xs hover:shadow-sm hover:border-slate-300 transition-all group relative opacity-95 ${canManageTasks ? 'cursor-pointer' : ''}`}
                    >
                      {/* Priority Tag & Reopen Action */}
                      <div className="flex items-center justify-between mb-2">
                        {renderPriorityBadge(task.priority)}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                          {canUpdateTaskStatus && <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveStatus(task.id, 'todo');
                            }}
                            className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-md transition-colors"
                            title="Reopen Task"
                          >Reopen ↺</button>}
                          {canManageTasks && <button
                            onClick={(e) => handleDeleteTask(task.id, e)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                            title="Delete Task"
                          >
                            <Trash2 size={12} />
                          </button>}
                        </div>
                      </div>

                      {/* Project Tag when viewing all */}
                      {selectedProjectId === 'all' && (
                        <p className="text-[10px] font-bold text-slate-400 mb-1 truncate">
                          {task.projectName}
                        </p>
                      )}

                      {/* Title */}
                      <h4 className="text-xs font-extrabold text-slate-900 leading-snug line-clamp-2">
                        {task.title}
                      </h4>

                      {/* Real Card Footer: Assignee & Due Date */}
                      <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 mt-2.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <UserAvatar
                            src={task.assigneeAvatar}
                            name={task.assigneeName || 'Unassigned'}
                            size="sm"
                            shape="circle"
                          />
                          <span className="text-[11px] font-semibold text-slate-700 truncate max-w-[110px]">
                            {task.assigneeName || 'Unassigned'}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 shrink-0">
                          <Calendar size={11} className="text-slate-400" />
                          <span>
                            {task.dueDate || task.due_date
                              ? new Date(task.dueDate || task.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                              : 'No Due Date'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : (
          /* ============================================================== */
          /* LIST VIEW: Detailed Tabular Register                           */
          /* ============================================================== */
          <div className="bg-white border border-[#EAEBEF] rounded-[28px] p-6 shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                    <th className="py-3 px-4">Task Deliverable</th>
                    <th className="py-3 px-4">Project</th>
                    <th className="py-3 px-4">Assignee</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Due Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTasks.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                        No tasks matching the selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredTasks.map((task) => (
                      <tr
                        key={task.id}
                        onClick={() => { if (canManageTasks) handleOpenEdit(task); }}
                        className={`hover:bg-slate-50/80 transition-colors ${canManageTasks ? 'cursor-pointer' : ''}`}
                      >
                        <td className="py-3.5 px-4 font-extrabold text-slate-900 max-w-xs truncate">
                          {task.title}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-medium">{task.projectName}</td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <UserAvatar
                              src={task.assigneeAvatar}
                              name={task.assigneeName || 'Unassigned'}
                              size="sm"
                              shape="rounded"
                            />
                            <span className="text-slate-800 font-bold">{task.assigneeName}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">{renderPriorityBadge(task.priority)}</td>
                        <td className="py-3.5 px-4 text-slate-500 font-medium">
                          {task.dueDate || task.due_date ? new Date(task.dueDate || task.due_date).toLocaleDateString() : '—'}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold capitalize ${
                              task.kanbanStatus === 'completed'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : task.kanbanStatus === 'in_progress'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            }`}
                          >
                            {task.kanbanStatus.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {canManageTasks && <button
                            onClick={(e) => handleDeleteTask(task.id, e)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Create / Edit Task Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-[32px] p-6 max-w-lg w-full border border-slate-200 shadow-2xl">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                <h3 className="text-base font-extrabold text-slate-900">
                  {editingTask ? 'Edit Work Package' : 'Create New Deliverable'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveTask} className="space-y-4 text-xs font-semibold text-slate-700">
                <div>
                  <label className="block mb-1">Task Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. UI/UX Design in the age of AI"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1">Project *</label>
                    <select
                      value={formProjectId}
                      onChange={(e) => setFormProjectId(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none"
                    >
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="relative">
                    <label className="block mb-1">Assignee Staff *</label>
                    <div className="relative">
                      <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input
                        type="text"
                        role="combobox"
                        aria-expanded={isAssigneeMenuOpen}
                        aria-controls="assignee-suggestions"
                        value={assigneeSearch}
                        onFocus={() => {
                          setIsAssigneeMenuOpen(true);
                          setAssigneeSearch('');
                        }}
                        onChange={(e) => {
                          setAssigneeSearch(e.target.value);
                          setIsAssigneeMenuOpen(true);
                        }}
                        onBlur={() => window.setTimeout(() => setIsAssigneeMenuOpen(false), 150)}
                        placeholder="Search and assign staff..."
                        className="w-full pl-8 pr-2.5 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-400"
                      />
                    </div>
                    {isAssigneeMenuOpen && (
                      <div
                        id="assignee-suggestions"
                        role="listbox"
                        className="absolute z-20 top-full mt-1 w-full max-h-44 overflow-y-auto rounded-lg border border-slate-200 bg-white p-1 shadow-lg"
                      >
                        {assignableUsers.length === 0 ? (
                          <p className="px-2.5 py-2 text-[11px] text-slate-400">No matching staff found.</p>
                        ) : (
                          assignableUsers.map((user) => {
                            const label = user.name || user.full_name || user.email;
                            const secondary = user.department || user.email;
                            const isSelected = formAssigneeIds.includes(user.id);
                            return (
                              <button
                                key={user.id}
                                type="button"
                                role="option"
                                aria-selected={isSelected}
                                onMouseDown={(event) => event.preventDefault()}
                                onClick={() => {
                                  setFormAssigneeIds((current) =>
                                    current.includes(user.id)
                                      ? current.filter((id) => id !== user.id)
                                      : [...current, user.id]
                                  );
                                  setAssigneeSearch('');
                                  setIsAssigneeMenuOpen(true);
                                }}
                                className={`w-full flex items-center gap-2 rounded-md px-2.5 py-2 text-left transition-colors ${
                                  isSelected ? 'bg-indigo-50 text-indigo-800' : 'hover:bg-slate-50 text-slate-700'
                                }`}
                              >
                                <UserAvatar
                                  src={user.avatarUrl || user.avatar_url}
                                  name={label}
                                  size="sm"
                                  shape="circle"
                                />
                                <span className="min-w-0">
                                  <span className="block truncate text-xs font-semibold">{label}</span>
                                  {secondary && <span className="block truncate text-[10px] text-slate-400">{secondary}</span>}
                                </span>
                                {isSelected && <Check size={13} className="ml-auto shrink-0 text-indigo-600" />}
                              </button>
                            );
                          })
                        )}
                      </div>
                    )}
                    {formAssigneeIds.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {users
                          .filter((user) => formAssigneeIds.includes(user.id))
                          .map((user) => {
                            const label = user.name || user.full_name || user.email;
                            return (
                              <button
                                key={user.id}
                                type="button"
                                onClick={() => setFormAssigneeIds((current) => current.filter((id) => id !== user.id))}
                                className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 pl-1 pr-2 py-0.5 text-[10px] font-semibold text-indigo-700 hover:bg-rose-50 hover:text-rose-700"
                                title={`Remove ${label}`}
                              >
                                <UserAvatar
                                  src={user.avatarUrl || user.avatar_url}
                                  name={label}
                                  size="sm"
                                  shape="circle"
                                />
                                {label} <span aria-hidden="true">×</span>
                              </button>
                            );
                          })}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1">Priority Level</label>
                    <select
                      value={formPriority}
                      onChange={(e: any) => setFormPriority(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none"
                    >
                      <option value="important">Important (Indigo)</option>
                      <option value="high">High Priority (Rose)</option>
                      <option value="medium">Medium Priority (Sky)</option>
                      <option value="low">Standard Priority (Emerald)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1">Workflow Status</label>
                    <select
                      value={formStatus}
                      onChange={(e: any) => setFormStatus(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none"
                    >
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block mb-1">Target Due Date</label>
                  <input
                    type="date"
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block mb-1">Scope & Description</label>
                  <textarea
                    rows={3}
                    placeholder="Provide deliverable instructions, specs, or acceptance criteria..."
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-full"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-full shadow-sm"
                  >
                    {submitting ? 'Saving...' : editingTask ? 'Update Task' : 'Create Task'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
