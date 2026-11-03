'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  Briefcase,
  Plus,
  FileSpreadsheet,
  FileText,
  Download,
  Users,
  Edit2,
  Trash2,
  CheckCircle,
  RotateCcw,
  DollarSign,
  Calendar,
  Building,
  TrendingUp,
  ArrowRight,
  Image as ImageIcon,
} from 'lucide-react';
import { ExportUtils } from '@/lib/exportUtils';
import { ApiClient } from '@/lib/api';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { LocationPickerMap } from '@/components/maps/LocationPickerMap';
import { selectAssignedProjects, selectOwnRecords } from '@/lib/roleAccess';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [filter, setFilter] = useState<'all' | 'ongoing' | 'completed' | 'closed'>('all');
  const [selectedProject, setSelectedProject] = useState<any | null>(null);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRevenueModalOpen, setIsRevenueModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [uploadingProjectImage, setUploadingProjectImage] = useState(false);
  const [projectImageError, setProjectImageError] = useState('');
  const [formSiteEnabled, setFormSiteEnabled] = useState(false);
  const [formSiteLatitude, setFormSiteLatitude] = useState<number | null>(null);
  const [formSiteLongitude, setFormSiteLongitude] = useState<number | null>(null);
  const [attendanceRadiusMeters, setAttendanceRadiusMeters] = useState(200);
  const [formClient, setFormClient] = useState('');
  const [formClientType, setFormClientType] = useState('government');
  const [formAssignmentType, setFormAssignmentType] = useState('direct_consultancy');
  const [formGrossValue, setFormGrossValue] = useState<number>(25000);
  const [formAdvanceReceived, setFormAdvanceReceived] = useState<number>(0);
  const [formTaxRate, setFormTaxRate] = useState<number>(0.25);
  const [formOfficeBenefitRate, setFormOfficeBenefitRate] = useState<number>(0.3);
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [formStatus, setFormStatus] = useState('ongoing');
  const [formTeamMembers, setFormTeamMembers] = useState<string[]>([]);
  
  // Category Budgets
  const [budgetFood, setBudgetFood] = useState<number>(3400);
  const [budgetEquipment, setBudgetEquipment] = useState<number>(3400);
  const [budgetTransportation, setBudgetTransportation] = useState<number>(3400);
  const [budgetAccommodation, setBudgetAccommodation] = useState<number>(3400);
  const [budgetOfficeCost, setBudgetOfficeCost] = useState<number>(3400);
  const [budgetConsultancy, setBudgetConsultancy] = useState<number>(3400);
  const [budgetOfficeBenefit, setBudgetOfficeBenefit] = useState<number>(6120);

  // Revenue Form
  const [revAmount, setRevAmount] = useState<number>(5000);
  const [revNote, setRevNote] = useState('Milestone advance payment');
  const [revMilestone, setRevMilestone] = useState('Phase 1 Delivery');

  const fetchRealProjects = async (userOverride?: any) => {
    setLoading(true);
    try {
      const user = userOverride ?? currentUser;
      if (user?.role === 'project_member') {
        const [projData, expData] = await Promise.all([ApiClient.getProjects(), ApiClient.getExpenses()]);
        const userId = String(user.id ?? user._id ?? '');
        const assignedProjects = selectAssignedProjects(projData || [], userId);
        setProjects(assignedProjects);
        setExpenses(selectOwnRecords(expData || [], userId));
        setUsers([]);
      } else {
        const [projData, expData, userData, attendanceSettings] = await Promise.all([
          ApiClient.getProjects().catch(() => []),
          ApiClient.getExpenses().catch(() => []),
          ApiClient.getUsers().catch(() => []),
          ApiClient.getAttendanceSettings().catch(() => null),
        ]);
        setProjects(projData || []);
        setExpenses(expData || []);
        setUsers(userData || []);
        const radius = Number(attendanceSettings?.geofenceRadiusMeters ?? attendanceSettings?.geofence_radius_meters);
        if (Number.isFinite(radius) && radius > 0) setAttendanceRadiusMeters(radius);
      }
    } catch (e) {
      console.error('Error fetching real projects:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let user: any = null;
    try { user = JSON.parse(localStorage.getItem('gw_user') || 'null'); } catch {}
    setCurrentUser(user);
    void fetchRealProjects(user);
  }, []);

  const resetForm = () => {
    setFormName('');
    setFormCode(`PRJ-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
    setFormDescription('');
    setFormImageUrl('');
    setProjectImageError('');
    setFormSiteEnabled(false);
    setFormSiteLatitude(null);
    setFormSiteLongitude(null);
    setFormClient('');
    setFormClientType('government');
    setFormAssignmentType('direct_consultancy');
    setFormGrossValue(50000);
    setFormAdvanceReceived(10000);
    setFormTaxRate(0.25);
    setFormOfficeBenefitRate(0.3);
    setFormStartDate(new Date().toISOString().split('T')[0]);
    setFormEndDate('');
    setFormStatus('ongoing');
    setFormTeamMembers([]);
    setBudgetFood(5000);
    setBudgetEquipment(5000);
    setBudgetTransportation(5000);
    setBudgetAccommodation(5000);
    setBudgetOfficeCost(5000);
    setBudgetConsultancy(5000);
    setBudgetOfficeBenefit(9000);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (p: any) => {
    setProjectToEdit(p);
    setFormName(p.name || '');
    setFormCode(p.projectId || p.projectCode || p.project_code || '');
    setFormDescription(p.description || '');
    setFormImageUrl(p.imageUrl || p.image_url || '');
    setProjectImageError('');
    const siteLat = p.siteLatitude ?? p.site_latitude;
    const siteLng = p.siteLongitude ?? p.site_longitude;
    setFormSiteLatitude(siteLat == null ? null : Number(siteLat));
    setFormSiteLongitude(siteLng == null ? null : Number(siteLng));
    setFormSiteEnabled(siteLat != null && siteLng != null);
    setFormClient(p.client || p.client_name || '');
    setFormClientType(p.clientType || p.client_type || 'government');
    setFormAssignmentType(p.assignmentType || p.assignment_type || 'direct_consultancy');
    setFormGrossValue(Number(p.grossProjectValue || p.gross_project_value || p.budget) || 0);
    setFormAdvanceReceived(Number(p.advanceReceived || p.advance_received || p.amountReceived) || 0);
    setFormTaxRate(Number(p.taxRate || p.tax_rate) || 0.25);
    setFormOfficeBenefitRate(Number(p.officeBenefitRate || p.office_benefit_rate) || 0.3);
    setFormStartDate(p.startDate ? p.startDate.split('T')[0] : '');
    setFormEndDate(p.endDate ? p.endDate.split('T')[0] : '');
    setFormStatus(p.status || 'ongoing');
    setFormTeamMembers(p.teamMemberIds || p.team_member_ids || []);

    const cb = p.categoryBudgets || p.category_budgets || {};
    setBudgetFood(Number(cb.food) || 0);
    setBudgetEquipment(Number(cb.equipment) || 0);
    setBudgetTransportation(Number(cb.transportation) || 0);
    setBudgetAccommodation(Number(cb.accommodation) || 0);
    setBudgetOfficeCost(Number(cb.officecost || cb.officeCost) || 0);
    setBudgetConsultancy(Number(cb.Consultancy || cb.consultancy) || 0);
    setBudgetOfficeBenefit(Number(cb.officebenefit || cb.officeBenefit) || 0);

    setIsEditModalOpen(true);
  };

  const handleProjectImageSelect = async (file?: File) => {
    if (!file) return;
    setProjectImageError('');
    if (!file.type.startsWith('image/')) {
      setProjectImageError('Choose an image file (JPG, PNG, WebP, or GIF).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setProjectImageError('Image must be 5 MB or smaller.');
      return;
    }

    setUploadingProjectImage(true);
    try {
      const dataUri = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Could not read image file.'));
        reader.onerror = () => reject(new Error('Could not read image file.'));
        reader.readAsDataURL(file);
      });
      const uploaded = await ApiClient.uploadFile(dataUri, 'projects');
      if (!uploaded?.url) throw new Error('The upload did not return an image URL.');
      setFormImageUrl(uploaded.url);
    } catch (error: any) {
      setProjectImageError(error?.message || 'Image upload failed. Please try again.');
    } finally {
      setUploadingProjectImage(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadingProjectImage) return;
    if (formSiteEnabled && (formSiteLatitude === null || formSiteLongitude === null)) {
      alert('Choose a site location on the map or turn off the field site option.');
      return;
    }
    setSubmitting(true);
    try {
      const categoryBudgets: Record<string, any> = {
        food: budgetFood,
        equipment: budgetEquipment,
        transportation: budgetTransportation,
        accommodation: budgetAccommodation,
        officecost: budgetOfficeCost,
        Consultancy: budgetConsultancy,
        officebenefit: budgetOfficeBenefit,
        _meta_team_members: formTeamMembers,
      };

      const calculatedBudget =
        budgetFood +
        budgetEquipment +
        budgetTransportation +
        budgetAccommodation +
        budgetOfficeCost +
        budgetConsultancy +
        budgetOfficeBenefit;

      const payload = {
        name: formName,
        projectId: formCode,
        description: formDescription,
        imageUrl: formImageUrl,
        site_latitude: formSiteEnabled ? formSiteLatitude : null,
        site_longitude: formSiteEnabled ? formSiteLongitude : null,
        client: formClient,
        clientType: formClientType,
        assignmentType: formAssignmentType,
        grossProjectValue: formGrossValue,
        advanceReceived: formAdvanceReceived,
        amountReceived: formAdvanceReceived,
        amountReceivable: formGrossValue - formAdvanceReceived,
        taxRate: formTaxRate,
        officeBenefitRate: formOfficeBenefitRate,
        budget: calculatedBudget || formGrossValue,
        categoryBudgets,
        startDate: formStartDate ? new Date(formStartDate).toISOString() : new Date().toISOString(),
        endDate: formEndDate ? new Date(formEndDate).toISOString() : null,
        status: formStatus,
        teamMemberIds: formTeamMembers,
      };

      await ApiClient.createProject(payload);
      setIsCreateModalOpen(false);
      await fetchRealProjects();
      alert('Project created successfully in the live database');
    } catch (err: any) {
      alert(`Project creation failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectToEdit) return;
    if (uploadingProjectImage) return;
    if (formSiteEnabled && (formSiteLatitude === null || formSiteLongitude === null)) {
      alert('Choose a site location on the map or turn off the field site option.');
      return;
    }
    setSubmitting(true);
    try {
      const categoryBudgets: Record<string, any> = {
        food: budgetFood,
        equipment: budgetEquipment,
        transportation: budgetTransportation,
        accommodation: budgetAccommodation,
        officecost: budgetOfficeCost,
        Consultancy: budgetConsultancy,
        officebenefit: budgetOfficeBenefit,
        _meta_team_members: formTeamMembers,
      };

      const calculatedBudget =
        budgetFood +
        budgetEquipment +
        budgetTransportation +
        budgetAccommodation +
        budgetOfficeCost +
        budgetConsultancy +
        budgetOfficeBenefit;

      const payload = {
        name: formName,
        projectId: formCode,
        description: formDescription,
        imageUrl: formImageUrl,
        site_latitude: formSiteEnabled ? formSiteLatitude : null,
        site_longitude: formSiteEnabled ? formSiteLongitude : null,
        client: formClient,
        clientType: formClientType,
        assignmentType: formAssignmentType,
        grossProjectValue: formGrossValue,
        advanceReceived: formAdvanceReceived,
        amountReceived: formAdvanceReceived,
        amountReceivable: formGrossValue - formAdvanceReceived,
        taxRate: formTaxRate,
        officeBenefitRate: formOfficeBenefitRate,
        budget: calculatedBudget || formGrossValue,
        categoryBudgets,
        startDate: formStartDate ? new Date(formStartDate).toISOString() : null,
        endDate: formEndDate ? new Date(formEndDate).toISOString() : null,
        status: formStatus,
        teamMemberIds: formTeamMembers,
      };

      await ApiClient.updateProject(projectToEdit.id, payload);
      setIsEditModalOpen(false);
      setProjectToEdit(null);
      await fetchRealProjects();
      alert('Project updated successfully');
    } catch (err: any) {
      alert(`Project update failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProject = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete project "${name}" from the database?`)) return;
    try {
      await ApiClient.deleteProject(id);
      await fetchRealProjects();
      if (selectedProject?.id === id) setSelectedProject(null);
      alert('Project deleted successfully');
    } catch (err: any) {
      alert(`Deletion failed: ${err.message}`);
    }
  };

  const handleCloseProject = async (id: string) => {
    const summary = prompt('Enter project closing summary:');
    if (summary === null) return;
    try {
      await ApiClient.closeProject(id, { closingSummary: summary });
      await fetchRealProjects();
      alert('Project successfully marked closed');
    } catch (err: any) {
      alert(`Failed to close project: ${err.message}`);
    }
  };

  const handleReopenProject = async (id: string) => {
    if (!confirm('Reopen this closed project?')) return;
    try {
      await ApiClient.reopenProject(id);
      await fetchRealProjects();
      alert('Project reopened');
    } catch (err: any) {
      alert(`Failed to reopen project: ${err.message}`);
    }
  };

  const handleAddRevenueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectToEdit) return;
    setSubmitting(true);
    try {
      await ApiClient.addProjectRevenue(projectToEdit.id, {
        amount: revAmount,
        note: revNote,
        milestone: revMilestone,
        date: new Date().toISOString(),
      });
      setIsRevenueModalOpen(false);
      await fetchRealProjects();
      alert('Revenue payment recorded in database');
    } catch (err: any) {
      alert(`Failed adding revenue: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProjects = projects.filter((p) => {
    if (filter === 'all') return true;
    const st = (p.status || '').toLowerCase();
    if (filter === 'closed') return p.isClosed || st === 'closed';
    return st === filter;
  });

  const handleExport = () => {
    const rows = projects.map((p) => ({
      'Project ID': p.id,
      'Project Code': p.projectId || p.projectCode || p.id,
      'Project Title': p.name,
      Client: p.client || 'N/A',
      'Gross Value (BDT)': p.grossProjectValue || p.budget,
      'Budget (BDT)': p.budget,
      'Amount Received': p.amountReceived || p.advanceReceived || 0,
      'Outstanding Receivable': p.amountReceivable || 0,
      Status: p.status,
    }));
    ExportUtils.exportToExcel(rows, 'GW_Live_Projects_Portfolio');
  };

  return (
    <AdminLayout
      title={currentUser?.role === 'project_member' ? 'My projects' : 'Project Portfolio & Invoicing'}
      subtitle={currentUser?.role === 'project_member' ? 'Projects assigned to you' : 'Complete project control, category budget allocations, team roster, and client invoicing (Live Server)'}
      onRefresh={fetchRealProjects}
      onExport={currentUser ? currentUser.role === 'project_member' ? undefined : handleExport : undefined}
      isRefreshing={loading}
      contentClassName="w-full max-w-[1440px] mx-auto px-5 py-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className={`flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 text-xs font-semibold ${!currentUser || currentUser.role === 'project_member' ? 'hidden' : ''}`}>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-1.5 rounded-full transition-all ${
              filter === 'all' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            All Projects ({projects.length})
          </button>
          <button
            onClick={() => setFilter('ongoing')}
            className={`px-4 py-1.5 rounded-full transition-all ${
              filter === 'ongoing' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Ongoing ({projects.filter((p) => (p.status || '').toLowerCase() === 'ongoing' && !p.isClosed).length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-1.5 rounded-full transition-all ${
              filter === 'completed' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Completed ({projects.filter((p) => (p.status || '').toLowerCase() === 'completed').length})
          </button>
          <button
            onClick={() => setFilter('closed')}
            className={`px-4 py-1.5 rounded-full transition-all ${
              filter === 'closed' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Closed ({projects.filter((p) => p.isClosed || (p.status || '').toLowerCase() === 'closed').length})
          </button>
        </div>

        {currentUser && currentUser.role !== 'project_member' && <div className="flex items-center gap-2">
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-800 rounded-md text-xs font-bold hover:bg-slate-200 transition-all"
          >
            <Plus size={14} />
            <span>Quick Add</span>
          </button>
          <Link
            href="/projects/new"
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white rounded-md text-xs font-bold hover:bg-emerald-700 transition-all"
          >
            <Plus size={14} />
            <span>New project</span>
          </Link>
        </div>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {filteredProjects.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400 font-medium bg-white rounded-lg border border-slate-200">
            {loading ? 'Fetching project records...' : 'No projects matching filter in database.'}
          </div>
        ) : (
          filteredProjects.map((p) => {
            if (currentUser?.role === 'project_member') {
              const siteLat = p.siteLatitude ?? p.site_latitude;
              const siteLng = p.siteLongitude ?? p.site_longitude;
              return (
                <article key={p.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                  <div className="relative h-28 bg-slate-100">
                    {(p.imageUrl || p.image_url) && <img src={p.imageUrl || p.image_url} alt="" className="h-full w-full object-cover" />}
                    <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-slate-700">{p.status || 'Active'}</span>
                  </div>
                  <div className="space-y-3 p-4">
                    <div><h2 className="truncate text-sm font-semibold text-slate-900">{p.name}</h2><p className="mt-1 truncate text-xs text-slate-500">{p.client || p.client_name || 'Assigned project'}</p></div>
                    <p className="text-xs text-slate-600">{siteLat != null && siteLng != null ? 'Site location set' : 'No site location set'}</p>
                    <Link href={`/projects/${p.id}`} className="inline-flex h-8 items-center rounded-lg bg-indigo-600 px-3 text-xs font-semibold text-white hover:bg-indigo-700">Open project</Link>
                  </div>
                </article>
              );
            }
            const projExpenses = expenses.filter(
              (e) => (e.projectId || e.project_id) === p.id && (e.status || '').toLowerCase() === 'approved'
            );
            const directSpent = projExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
            const totalBudget = Number(p.budget || p.grossProjectValue || p.gross_project_value) || 1;
            const remaining = totalBudget - directSpent;
            const completionRate = Math.min(100, Math.round((directSpent / totalBudget) * 100));
            const coverImage = p.imageUrl || p.image_url || 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=900&q=80';

            return (
              <div
                key={p.id}
                className="bg-white border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition-colors flex flex-col justify-between group"
              >
                <div>
                  <div className="relative mb-3 h-20 overflow-hidden rounded-md bg-slate-900">
                    <img src={coverImage} alt="" className="h-full w-full object-cover opacity-70 transition-transform duration-300 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-950/70 to-transparent" />
                    <span className="absolute left-2.5 top-2 rounded bg-black/35 px-1.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">{p.projectId || p.projectCode || p.id.slice(0, 8)}</span>
                  </div>
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link href={`/projects/${p.id}`} className="block transition-colors hover:text-emerald-700">
                      <h3 className="line-clamp-1 text-sm font-extrabold tracking-tight text-slate-900">
                        {p.name}
                      </h3>
                      </Link>
                      <p className="mt-1 flex items-center gap-1 truncate text-[11px] font-medium text-slate-500"><Building size={12} />{p.client || 'Direct client'}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <StatusBadge status={p.isClosed ? 'closed' : p.status || 'ongoing'} />
                      <p className="mt-1 text-[10px] font-semibold text-slate-400">{p.projectId || p.projectCode || p.id.slice(0, 8)}</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="mb-1.5 flex items-center justify-between text-[11px] font-bold">
                      <span className="text-slate-500">Budget used</span>
                      <span className="text-slate-900">{completionRate}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          completionRate > 90 ? 'bg-rose-500' : completionRate > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${completionRate}%` }}
                      />
                    </div>
                  </div>

                  <div className="mb-3 grid grid-cols-3 gap-2 rounded-md border border-slate-100 bg-slate-50 px-2 py-2 text-center">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Budget</p>
                      <p className="text-xs font-black text-slate-900 mt-0.5">৳ {totalBudget.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Spent</p>
                      <p className="text-xs font-black text-amber-600 mt-0.5">৳ {directSpent.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Remaining</p>
                      <p className={`text-xs font-black mt-0.5 ${remaining >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        ৳ {remaining.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
                  <Link
                    href={`/projects/${p.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 group/btn"
                  >
                    <span>Open</span>
                    <ArrowRight size={13} className="group-hover/btn:translate-x-0.5 transition-transform" />
                  </Link>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => {
                        setProjectToEdit(p);
                        setIsRevenueModalOpen(true);
                      }}
                      className="p-1.5 text-emerald-700 rounded-md hover:bg-emerald-50 transition-all"
                      title="Record Client Revenue or Advance"
                    >
                      <Plus size={13} />
                    </button>

                    <button
                      onClick={() => handleOpenEdit(p)}
                      className="rounded-md p-1.5 text-slate-600 transition-all hover:bg-slate-100"
                      title="Edit Project Configuration"
                    >
                      <Edit2 size={13} />
                    </button>

                    {p.isClosed ? (
                      <button
                        onClick={() => handleReopenProject(p.id)}
                        className="rounded-md p-1.5 text-sky-700 transition-all hover:bg-sky-50"
                        title="Reopen Project"
                      >
                        <RotateCcw size={14} />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleCloseProject(p.id)}
                        className="rounded-md p-1.5 text-slate-500 transition-all hover:bg-slate-100"
                        title="Mark Project Closed"
                      >
                        <CheckCircle size={14} />
                      </button>
                    )}

                    <button
                      onClick={() => {
                        const cols = ['Metric', 'Amount (BDT)'];
                        const rows = [
                          ['Project Name', p.name],
                          ['Client', p.client || 'N/A'],
                          ['Project Budget', totalBudget.toLocaleString()],
                          ['Total Incurred Spent', directSpent.toLocaleString()],
                          ['Remaining Budget', remaining.toLocaleString()],
                          ['Advance Received', Number(p.advanceReceived || 0).toLocaleString()],
                        ];
                        ExportUtils.exportToPdf(cols, rows, `Project Financial Statement: ${p.name}`, `${p.name}_Financials`);
                      }}
                      className="rounded-md p-1.5 text-slate-500 transition-all hover:bg-slate-100"
                      title="Export PDF Statement"
                    >
                      <Download size={14} />
                    </button>

                    <button
                      onClick={() => handleDeleteProject(p.id, p.name)}
                      className="rounded-md p-1.5 text-rose-600 transition-all hover:bg-rose-50"
                      title="Delete Project"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Comprehensive Project Detail Drawer / Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[32px] p-6 max-w-3xl w-full border border-slate-200 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div>
                <h4 className="font-bold text-slate-900 text-base">{selectedProject.name}</h4>
                <p className="text-xs text-slate-400">
                  Client: {selectedProject.client} • Code: {selectedProject.projectId || selectedProject.id}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    handleOpenEdit(selectedProject);
                    setSelectedProject(null);
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-full text-xs flex items-center gap-1"
                >
                  <Edit2 size={12} /> Edit
                </button>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="space-y-6 text-xs">
              {/* Top Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-slate-50/70 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-slate-400 block mb-0.5">Gross Value</span>
                  <span className="font-bold text-slate-900 text-sm">
                    BDT {Number(selectedProject.grossProjectValue || selectedProject.budget).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Advance Received</span>
                  <span className="font-bold text-emerald-600 text-sm">
                    BDT {Number(selectedProject.advanceReceived || 0).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Receivable Balance</span>
                  <span className="font-bold text-indigo-600 text-sm">
                    BDT {Number(selectedProject.amountReceivable || 0).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Company Benefit (30%)</span>
                  <span className="font-bold text-slate-800 text-sm">
                    BDT {Math.round(Number(selectedProject.grossProjectValue || selectedProject.budget) * 0.3).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Category Budgets Breakdown */}
              <div>
                <h5 className="font-bold text-slate-900 text-sm mb-3">Allocated Category Budgets</h5>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Object.entries(selectedProject.categoryBudgets || selectedProject.category_budgets || {})
                    .filter(([key]) => !key.startsWith('_'))
                    .map(([cat, val]) => (
                      <div key={cat} className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
                        <p className="text-[10px] text-slate-400 capitalize font-medium">{cat}</p>
                        <p className="font-bold text-slate-800 text-xs mt-0.5">BDT {Number(val).toLocaleString()}</p>
                      </div>
                    ))}
                </div>
              </div>

              {/* Claims filed under this project */}
              <div>
                <h5 className="font-bold text-slate-900 text-sm mb-3">
                  Expense Claims Logged ({selectedProject.projExpenses?.length || 0})
                </h5>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {(!selectedProject.projExpenses || selectedProject.projExpenses.length === 0) ? (
                    <p className="text-slate-400 py-3 text-center">No expense claims recorded under this project yet.</p>
                  ) : (
                    selectedProject.projExpenses.map((exp: any) => {
                      const matchedUser = users.find((u) => u.id === (exp.userId || exp.user_id) || u.name === exp.employeeName);
                      return (
                        <div key={exp.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                          <div className="flex items-center gap-2 min-w-0 pr-2">
                            <UserAvatar
                              src={exp.employeeAvatar || exp.userAvatar || matchedUser?.avatarUrl || matchedUser?.avatar_url}
                              name={exp.employeeName || 'Staff'}
                              size="sm"
                              shape="rounded"
                            />
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 truncate">{exp.employeeName || 'Staff'}</p>
                              <p className="text-[10px] text-slate-400 truncate">{exp.categoryName} • {exp.note || 'No note'}</p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="font-bold text-slate-900">BDT {Number(exp.amount).toLocaleString()}</p>
                            <StatusBadge status={exp.status} />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedProject(null)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-full text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Project Modal */}
      {(isCreateModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[32px] p-6 max-w-2xl w-full border border-slate-200 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h4 className="font-bold text-slate-900 text-base">
                {isCreateModalOpen ? 'Create New Project' : `Edit Project: ${projectToEdit?.name}`}
              </h4>
              <button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setIsEditModalOpen(false);
                  setProjectToEdit(null);
                }}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={isCreateModalOpen ? handleCreateSubmit : handleEditSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Project Title</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Padma Geodetic Survey"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Project Code</label>
                  <input
                    type="text"
                    required
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    placeholder="e.g. PRJ-2026-003"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  <span className="inline-flex items-center gap-1.5">
                    <ImageIcon size={13} className="text-slate-500" />
                    <span>Project image <span className="font-normal text-slate-400">(optional)</span></span>
                  </span>
                </label>
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-2.5">
                  {formImageUrl ? (
                    <img src={formImageUrl} alt="Project image preview" className="h-14 w-20 shrink-0 rounded-lg border border-slate-200 bg-white object-cover" />
                  ) : (
                    <div className="flex h-14 w-20 shrink-0 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white text-slate-400">
                      <ImageIcon size={19} aria-hidden="true" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-slate-700">{uploadingProjectImage ? 'Uploading image…' : formImageUrl ? 'Image ready' : 'Add a project cover'}</p>
                    <p className="mt-0.5 text-[11px] text-slate-500">JPG, PNG, WebP or GIF · up to 5 MB</p>
                    <div className="mt-1.5 flex items-center gap-3">
                      <label className={`cursor-pointer text-xs font-semibold text-indigo-600 hover:text-indigo-700 ${uploadingProjectImage ? 'pointer-events-none opacity-50' : ''}`}>
                        {formImageUrl ? 'Replace image' : 'Upload image'}
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          className="sr-only"
                          disabled={uploadingProjectImage}
                          onChange={(event) => {
                            void handleProjectImageSelect(event.target.files?.[0]);
                            event.currentTarget.value = '';
                          }}
                        />
                      </label>
                      {formImageUrl && <button type="button" onClick={() => { setFormImageUrl(''); setProjectImageError(''); }} className="text-xs font-medium text-slate-500 hover:text-rose-600">Remove</button>}
                    </div>
                  </div>
                  {uploadingProjectImage && <span className="mr-1 h-4 w-4 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" aria-label="Uploading" />}
                </div>
                {projectImageError && <p role="alert" className="mt-1 text-[11px] font-medium text-rose-600">{projectImageError}</p>}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Client Name</label>
                  <input
                    type="text"
                    required
                    value={formClient}
                    onChange={(e) => setFormClient(e.target.value)}
                    placeholder="e.g. Ministry of Land"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Client Type</label>
                  <select
                    value={formClientType}
                    onChange={(e) => setFormClientType(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="government">Government</option>
                    <option value="semi_government">Semi-Government</option>
                    <option value="private">Private Enterprise</option>
                    <option value="development_partner">Development Partner</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Assignment Type</label>
                  <select
                    value={formAssignmentType}
                    onChange={(e) => setFormAssignmentType(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="direct_consultancy">Direct Consultancy</option>
                    <option value="sub_consultancy">Sub-Consultancy</option>
                    <option value="tender">Tender</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Gross Project Value (BDT)</label>
                  <input
                    type="number"
                    required
                    value={formGrossValue}
                    onChange={(e) => setFormGrossValue(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Advance Received (BDT)</label>
                  <input
                    type="number"
                    value={formAdvanceReceived}
                    onChange={(e) => setFormAdvanceReceived(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">End Date</label>
                  <input
                    type="date"
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  >
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="on_hold">On Hold</option>
                  </select>
                </div>
              </div>

              {/* Category Budgets Grid */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <p className="font-bold text-slate-800 text-xs">Allocated Category Budgets (BDT):</p>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-500 font-medium">Food</span>
                    <input
                      type="number"
                      value={budgetFood}
                      onChange={(e) => setBudgetFood(parseFloat(e.target.value) || 0)}
                      className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-medium">Equipment</span>
                    <input
                      type="number"
                      value={budgetEquipment}
                      onChange={(e) => setBudgetEquipment(parseFloat(e.target.value) || 0)}
                      className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-medium">Transportation</span>
                    <input
                      type="number"
                      value={budgetTransportation}
                      onChange={(e) => setBudgetTransportation(parseFloat(e.target.value) || 0)}
                      className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-medium">Accommodation</span>
                    <input
                      type="number"
                      value={budgetAccommodation}
                      onChange={(e) => setBudgetAccommodation(parseFloat(e.target.value) || 0)}
                      className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-medium">Office Cost</span>
                    <input
                      type="number"
                      value={budgetOfficeCost}
                      onChange={(e) => setBudgetOfficeCost(parseFloat(e.target.value) || 0)}
                      className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-medium">Consultancy</span>
                    <input
                      type="number"
                      value={budgetConsultancy}
                      onChange={(e) => setBudgetConsultancy(parseFloat(e.target.value) || 0)}
                      className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Assign Team Members */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Assign Team Personnel</label>
                <div className="flex flex-wrap gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                  {users.map((u) => {
                    const isAssigned = formTeamMembers.includes(u.id);
                    return (
                      <button
                        type="button"
                        key={u.id}
                        onClick={() => {
                          if (isAssigned) {
                            setFormTeamMembers(formTeamMembers.filter((id) => id !== u.id));
                          } else {
                            setFormTeamMembers([...formTeamMembers, u.id]);
                          }
                        }}
                        className={`inline-flex items-center gap-1.5 pl-1.5 pr-3 py-1 rounded-full text-xs font-semibold transition-all ${
                          isAssigned
                            ? 'bg-[#0D1117] text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-400'
                        }`}
                      >
                        <UserAvatar
                          src={u.avatarUrl || u.avatar_url}
                          name={u.name || u.email}
                          size="sm"
                          shape="circle"
                        />
                        <span>{u.name || u.email}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Project Description</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Scope of work, deliverables, and field objectives..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <section className="rounded-xl border border-slate-200 bg-slate-50/80 p-3" aria-labelledby="project-field-site-title">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h5 id="project-field-site-title" className="text-xs font-bold text-slate-800">Field site for attendance</h5>
                    <p className="mt-0.5 text-[11px] text-slate-500">Choose a pinned project site. Field check-ins use this location and the configured {attendanceRadiusMeters} m geofence.</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-label="Enable field attendance site"
                    aria-checked={formSiteEnabled}
                    onClick={() => {
                      const nextEnabled = !formSiteEnabled;
                      setFormSiteEnabled(nextEnabled);
                      if (!nextEnabled) { setFormSiteLatitude(null); setFormSiteLongitude(null); }
                    }}
                    className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${formSiteEnabled ? 'bg-emerald-600' : 'bg-slate-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${formSiteEnabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
                  </button>
                </div>
                {formSiteEnabled && <div className="mt-3">
                  <LocationPickerMap
                    latitude={formSiteLatitude ?? 23.8103}
                    longitude={formSiteLongitude ?? 90.4125}
                    radiusMeters={attendanceRadiusMeters}
                    pinLabel="Project site"
                    onChange={(point) => { setFormSiteLatitude(point.latitude); setFormSiteLongitude(point.longitude); }}
                  />
                  <p className="mt-2 text-[11px] text-slate-500">{formSiteLatitude === null || formSiteLongitude === null ? 'Search an address or click the map to set the field site.' : `Saved site pin: ${formSiteLatitude.toFixed(6)}, ${formSiteLongitude.toFixed(6)}`}</p>
                </div>}
              </section>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setIsEditModalOpen(false);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-full"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || uploadingProjectImage}
                  className="px-6 py-2 bg-[#0D1117] hover:bg-slate-800 text-white font-bold rounded-full shadow-xs"
                >
                  {uploadingProjectImage ? 'Uploading image...' : submitting ? 'Saving Project...' : isCreateModalOpen ? 'Create Project' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Revenue Modal */}
      {isRevenueModalOpen && projectToEdit && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[32px] p-6 max-w-md w-full border border-slate-200 shadow-xl animate-in fade-in duration-200">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h4 className="font-bold text-slate-900 text-base">Record Revenue / Milestone Payment</h4>
              <button
                onClick={() => setIsRevenueModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddRevenueSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Project</label>
                <input
                  type="text"
                  disabled
                  value={projectToEdit.name}
                  className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Amount Received (BDT)</label>
                <input
                  type="number"
                  required
                  value={revAmount}
                  onChange={(e) => setRevAmount(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-base text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Milestone Description</label>
                <input
                  type="text"
                  required
                  value={revMilestone}
                  onChange={(e) => setRevMilestone(e.target.value)}
                  placeholder="e.g. Initial Advance or Final Report Deliverable"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Invoice / Payment Note</label>
                <textarea
                  rows={2}
                  value={revNote}
                  onChange={(e) => setRevNote(e.target.value)}
                  placeholder="Bank cheque / transfer details"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRevenueModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-full"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-full shadow-xs"
                >
                  {submitting ? 'Recording...' : 'Record Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
