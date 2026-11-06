'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { ApiClient } from '@/lib/api';
import { DateField } from '@/components/forms/DateField';
import { LocationPickerMap } from '@/components/maps/LocationPickerMap';
import {
  Briefcase,
  ArrowLeft,
  Save,
  Calendar,
  Building,
  DollarSign,
  Percent,
  Users,
  Plus,
  Trash2,
  Check,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  Shield,
  Sliders,
  X,
  CheckCircle2,
} from 'lucide-react';

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

export default function NewProjectPage() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [client, setClient] = useState('');
  const [clientType, setClientType] = useState('government');
  const [assignmentType, setAssignmentType] = useState('direct_consultancy');
  const [status, setStatus] = useState('ongoing');
  const [taxStatus, setTaxStatus] = useState<'included' | 'excluded' | 'not_applicable'>('included');
  const [taxRate, setTaxRate] = useState<number>(0.10); // 10% VAT
  const [incomeTaxRate, setIncomeTaxRate] = useState<number>(0.05); // 5% Income Tax (IT)
  const [officeBenefitRate, setOfficeBenefitRate] = useState<number>(0.30); // 30%

  const [grossProjectValue, setGrossProjectValue] = useState<number>(0);
  const [advanceReceived, setAdvanceReceived] = useState<number>(0);
  const [amountReceived, setAmountReceived] = useState<number>(0);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [siteLatitude, setSiteLatitude] = useState<number | null>(null);
  const [siteLongitude, setSiteLongitude] = useState<number | null>(null);
  const [siteLocationEnabled, setSiteLocationEnabled] = useState(false);
  const [siteRadiusMeters, setSiteRadiusMeters] = useState(200);

  // Category Budgets
  const [budgetEquipment, setBudgetEquipment] = useState<number>(0);
  const [budgetTransportation, setBudgetTransportation] = useState<number>(0);
  const [budgetFood, setBudgetFood] = useState<number>(0);
  const [budgetAccommodation, setBudgetAccommodation] = useState<number>(0);
  const [budgetOfficeCost, setBudgetOfficeCost] = useState<number>(0);
  const [customCategories, setCustomCategories] = useState<{ name: string; amount: number }[]>([]);
  const [newCatName, setNewCatName] = useState('');
  const [newCatAmount, setNewCatAmount] = useState<number>(0);

  // Team Selection
  const [selectedTeamMemberIds, setSelectedTeamMemberIds] = useState<string[]>([]);
  const [teamSearch, setTeamSearch] = useState('');

  useEffect(() => {
    // Initial dates
    const today = new Date();
    setStartDate(today.toISOString().split('T')[0]);
    const sixMonthsLater = new Date(today);
    sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);
    setEndDate(sixMonthsLater.toISOString().split('T')[0]);

    // Fetch live users & clients
    const loadData = async () => {
      setLoading(true);
      try {
        const [uData, cData, attendanceSettings] = await Promise.all([
          ApiClient.getUsers().catch(() => []),
          ApiClient.getClients().catch(() => []),
          ApiClient.getAttendanceSettings().catch(() => null),
        ]);
        setUsers(uData || []);
        setClients(cData || []);
        const configuredRadius = Number(attendanceSettings?.geofenceRadiusMeters ?? attendanceSettings?.geofence_radius_meters);
        if (Number.isFinite(configuredRadius) && configuredRadius > 0) setSiteRadiusMeters(configuredRadius);
      } catch (e: any) {
        console.error('Error loading initial data:', e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Calculated values
  const totalTaxDeductionRate =
    taxStatus === 'included'
      ? taxRate + incomeTaxRate
      : 0;

  const expectedNetRevenue =
    taxStatus === 'included'
      ? grossProjectValue * Math.max(0, 1 - totalTaxDeductionRate)
      : grossProjectValue;
  const directExpensesBudget =
    budgetEquipment +
    budgetTransportation +
    budgetFood +
    budgetAccommodation +
    budgetOfficeCost +
    customCategories.reduce((acc, c) => acc + (Number(c.amount) || 0), 0);

  const calculatedOfficeBenefit = directExpensesBudget * officeBenefitRate;
  const expectedRevenue = expectedNetRevenue - (directExpensesBudget + calculatedOfficeBenefit);
  const calculatedTotalBudget = directExpensesBudget + calculatedOfficeBenefit;
  const amountReceivable = Math.max(0, grossProjectValue - amountReceived);

  const handleAddCustomCategory = () => {
    if (!newCatName.trim()) return;
    setCustomCategories([
      ...customCategories,
      { name: newCatName.trim().toLowerCase(), amount: Number(newCatAmount) || 0 },
    ]);
    setNewCatName('');
    setNewCatAmount(5000);
  };

  const handleRemoveCustomCategory = (index: number) => {
    setCustomCategories(customCategories.filter((_, i) => i !== index));
  };

  // Member Roles & Permissions state
  const [memberConfigs, setMemberConfigs] = useState<
    Record<
      string,
      {
        roleInProject: string;
        permissions: {
          canViewBudget: boolean;
          canRecordRevenue: boolean;
          canViewExpenses: boolean;
          canCreateExpenses: boolean;
          canApproveExpenses: boolean;
          canManageTasks: boolean;
          canUpdateProgress: boolean;
          canManageTeam: boolean;
          canEditProject: boolean;
          canViewAttendance: boolean;
        };
      }
    >
  >({});
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [modalRoleTitle, setModalRoleTitle] = useState('Site Engineer');
  const [modalPerms, setModalPerms] = useState({
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
  });

  const openMemberConfigModal = (userId: string) => {
    const existing = memberConfigs[userId];
    if (existing) {
      setModalRoleTitle(existing.roleInProject || 'Site Engineer');
      setModalPerms({ ...existing.permissions });
    } else {
      setModalRoleTitle('Site Engineer');
      setModalPerms({
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
      });
    }
    setEditingUserId(userId);
    setIsMemberModalOpen(true);
  };

  const saveMemberConfig = () => {
    if (!editingUserId) return;
    setMemberConfigs((prev) => ({
      ...prev,
      [editingUserId]: {
        roleInProject: modalRoleTitle.trim() || 'Site Engineer',
        permissions: { ...modalPerms },
      },
    }));
    setIsMemberModalOpen(false);
  };

  const toggleTeamMember = (id: string) => {
    if (selectedTeamMemberIds.includes(id)) {
      setSelectedTeamMemberIds(selectedTeamMemberIds.filter((m) => m !== id));
    } else {
      setSelectedTeamMemberIds([...selectedTeamMemberIds, id]);
      if (!memberConfigs[id]) {
        setMemberConfigs((prev) => ({
          ...prev,
          [id]: {
            roleInProject: 'Site Engineer',
            permissions: {
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
        }));
      }
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Project title is required.');
      return;
    }
    if (!client.trim()) {
      setError('Client name is required.');
      return;
    }
    if (selectedTeamMemberIds.length === 0) {
      setError('Please select at least one assigned team member.');
      return;
    }

    setSaving(true);
    try {
      const categoryBudgets: Record<string, number> = {
        equipment: budgetEquipment,
        transportation: budgetTransportation,
        food: budgetFood,
        accommodation: budgetAccommodation,
        officecost: budgetOfficeCost,
        officebenefit: calculatedOfficeBenefit,
        _meta_income_tax_rate: incomeTaxRate,
      };

      customCategories.forEach((c) => {
        categoryBudgets[c.name] = c.amount;
      });

      const membersPayload = selectedTeamMemberIds.map((userId) => {
        const config = memberConfigs[userId] || {
          roleInProject: 'Site Engineer',
          permissions: {
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
        };
        return {
          userId,
          roleInProject: config.roleInProject,
          permissions: config.permissions,
        };
      });

      const payload = {
        name: name.trim(),
        description: description.trim(),
        client: client.trim(),
        client_name: client.trim(),
        client_type: clientType,
        assignment_type: assignmentType,
        gross_project_value: grossProjectValue,
        tax_status: taxStatus,
        tax_rate: taxRate,
        income_tax_rate: incomeTaxRate,
        expected_net_revenue: expectedNetRevenue,
        advance_received: advanceReceived,
        amount_received: amountReceived,
        amount_receivable: amountReceivable,
        budget: calculatedTotalBudget,
        category_budgets: categoryBudgets,
        estimated_remaining_cost: calculatedTotalBudget * 0.4,
        office_benefit_rate: officeBenefitRate,
        start_date: startDate ? new Date(startDate).toISOString() : new Date().toISOString(),
        end_date: endDate ? new Date(endDate).toISOString() : new Date().toISOString(),
        team_member_ids: selectedTeamMemberIds,
        members: membersPayload,
        status: status,
        site_latitude: siteLatitude,
        site_longitude: siteLongitude,
      };

      const res = await ApiClient.createProject(payload);
      const createdId = res?.id || res?.data?.id;
      if (createdId) {
        router.push(`/projects/${createdId}`);
      } else {
        router.push('/projects');
      }
    } catch (err: any) {
      console.error('Failed to create project:', err);
      setError(err?.message || 'Failed to create project. Please verify backend connection.');
    } finally {
      setSaving(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (!teamSearch.trim()) return true;
    const q = teamSearch.toLowerCase();
    return (
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.department && u.department.toLowerCase().includes(q))
    );
  });

  return (
    <AdminLayout
      title="Create New Project"
      subtitle="Set up project contract, tax rate, direct cost lines, and staff roster"
    >
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        {/* Header Breadcrumbs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 bg-white border border-[#EAEBEF] rounded-xl hover:bg-slate-50 transition-colors text-slate-600 shadow-sm"
              title="Go Back"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                  Projects & Budget
                </span>
                <span className="text-slate-300">/</span>
                <span className="text-xs font-semibold text-slate-500">New Project</span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Create New Project</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push('/projects')}
              className="px-5 py-2.5 rounded-full border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="new-project-form"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#0D1117] text-white text-xs font-bold shadow-md hover:bg-slate-800 transition-all disabled:opacity-50"
            >
              <Save size={16} />
              {saving ? 'Creating Project...' : 'Save & Launch Project'}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-700 text-sm">
            <AlertCircle size={18} className="shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <form id="new-project-form" onSubmit={handleCreateProject} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Cols: Main Details & Budgets */}
            <div className="lg:col-span-2 space-y-8">
              {/* Basic Information Card */}
              <div className="bg-white border border-[#EAEBEF] rounded-3xl p-6 shadow-sm space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    <Briefcase size={18} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Project Overview</h2>
                    <p className="text-xs text-slate-400">Core parameters, client entity, and assignment scope</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Project Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., Meghna River Hydrographic Baseline Survey 2026"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Scope & Objectives Description
                    </label>
                    <textarea
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Specify project deliverables, key milestones, geographic bounds, and special client stipulations..."
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-bold text-slate-800">Field site</h3>
                        <p className="mt-0.5 text-xs text-slate-500">Optional location for on-site attendance.</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-slate-600">{siteLocationEnabled ? 'Enabled' : 'Not set'}</span>
                        <button
                          type="button"
                          role="switch"
                          aria-label="Set field site location"
                          aria-checked={siteLocationEnabled}
                          onClick={() => {
                            const enabled = !siteLocationEnabled;
                            setSiteLocationEnabled(enabled);
                            if (!enabled) { setSiteLatitude(null); setSiteLongitude(null); }
                          }}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${siteLocationEnabled ? 'bg-emerald-600' : 'bg-slate-300'}`}
                        >
                          <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${siteLocationEnabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
                        </button>
                        {siteLocationEnabled && siteLatitude !== null && <button type="button" onClick={() => { setSiteLatitude(null); setSiteLongitude(null); }} className="text-xs font-semibold text-rose-600 hover:text-rose-700">Clear pin</button>}
                      </div>
                    </div>
                    {siteLocationEnabled ? <div className="mt-3">
                      <LocationPickerMap
                        latitude={siteLatitude ?? 23.8103}
                        longitude={siteLongitude ?? 90.4125}
                        radiusMeters={siteRadiusMeters}
                        pinLabel="Project site"
                        onChange={(point) => { setSiteLatitude(point.latitude); setSiteLongitude(point.longitude); }}
                      />
                      <p className="mt-2 text-[11px] text-slate-500">{siteLatitude === null ? 'Search an address or place the pin to set this project site.' : `Pinned at ${siteLatitude.toFixed(6)}, ${siteLongitude?.toFixed(6)}`}</p>
                    </div> : null}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Client Entity *
                      </label>
                      <input
                        type="text"
                        required
                        value={client}
                        onChange={(e) => setClient(e.target.value)}
                        placeholder="e.g., Bangladesh Water Development Board"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Client Category
                      </label>
                      <select
                        value={clientType}
                        onChange={(e) => setClientType(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="government">Government Agency</option>
                        <option value="private">Private Enterprise</option>
                        <option value="ngo">NGO / International Development</option>
                        <option value="autonomous">Autonomous Body</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Assignment Mechanism
                      </label>
                      <select
                        value={assignmentType}
                        onChange={(e) => setAssignmentType(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="direct_consultancy">Direct Consultancy</option>
                        <option value="sub_consultancy">Sub-Consultancy Joint Venture</option>
                        <option value="government">Government Tender / RFP</option>
                        <option value="private">Private Contract</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Lifecycle Status
                      </label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="ongoing">Ongoing (Active Operations)</option>
                        <option value="completed">Completed (Awaiting Final Audit)</option>
                        <option value="closed">Closed & Archived</option>
                        <option value="on_hold">On Hold</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <DateField label="Start Date" value={startDate} onChange={setStartDate} />
                    <DateField label="Target Completion Date" value={endDate} onChange={setEndDate} />
                  </div>
                </div>
              </div>

              {/* Category Budgets Card */}
              <div className="bg-white border border-[#EAEBEF] rounded-3xl p-6 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                      <DollarSign size={18} />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-900">Expense Category Budgets</h2>
                      <p className="text-xs text-slate-400">Allocate baseline cost caps for direct field operational lines</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Direct Allocations</span>
                    <p className="text-base font-black text-slate-900">৳{directExpensesBudget.toLocaleString()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Equipment & Instruments (৳)
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={budgetEquipment || ''}
                      onChange={(e) => setBudgetEquipment(e.target.value === '' ? 0 : Number(e.target.value))}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Transportation & Fuel (৳)
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={budgetTransportation || ''}
                      onChange={(e) => setBudgetTransportation(e.target.value === '' ? 0 : Number(e.target.value))}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Food & Subsistence (৳)
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={budgetFood || ''}
                      onChange={(e) => setBudgetFood(e.target.value === '' ? 0 : Number(e.target.value))}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Accommodation & Stays (৳)
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={budgetAccommodation || ''}
                      onChange={(e) => setBudgetAccommodation(e.target.value === '' ? 0 : Number(e.target.value))}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Office and Administration (৳)
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={budgetOfficeCost || ''}
                      onChange={(e) => setBudgetOfficeCost(e.target.value === '' ? 0 : Number(e.target.value))}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Office and Administration includes its custom cost lines. */}
                <div className="ml-2 space-y-3 border-l-2 border-emerald-100 pl-4">
                {customCategories.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Additional Office and Administration Lines</h3>
                    <div className="space-y-2">
                      {customCategories.map((cat, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between px-4 py-2.5 bg-slate-50 rounded-2xl border border-slate-200 text-sm"
                        >
                          <span className="font-bold text-slate-800 capitalize">{cat.name}</span>
                          <div className="flex items-center gap-3">
                            <span className="font-mono font-bold text-slate-900">৳{cat.amount.toLocaleString()}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveCustomCategory(idx)}
                              className="text-slate-400 hover:text-rose-600 transition-colors"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add Custom Category Inline */}
                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                  <input
                    type="text"
                    placeholder="Custom category name (e.g., Drone License)"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-500"
                  />
                  <input
                    type="number"
                    placeholder="Amount (৳)"
                    value={newCatAmount}
                    onChange={(e) => setNewCatAmount(Number(e.target.value) || 0)}
                    className="w-32 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomCategory}
                    className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Plus size={14} /> Add Line
                  </button>
                </div>
                </div>
              </div>
            </div>

            {/* Right 1 Col: Financial Summary & Team */}
            <div className="space-y-8">
              {/* Financial & Contract Calculations (Light Themed Card) */}
              <div className="bg-white border border-[#EAEBEF] text-slate-900 rounded-3xl p-6 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold border border-emerald-200/80">
                      <Percent size={16} />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900 tracking-tight">Contract Financials</h2>
                      <p className="text-[11px] text-slate-500">VAT, Income Tax (IT) & Project Economics</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Live Calculation
                  </span>
                </div>

                <div className="space-y-4">
                  {/* Gross Contract Value */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Gross Contract Value (৳)
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={grossProjectValue || ''}
                      onChange={(e) => setGrossProjectValue(e.target.value === '' ? 0 : Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-1 focus:ring-emerald-500 transition-all"
                    />
                  </div>

                  {/* IT-VAT Policy Mode */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      IT & VAT Policy
                    </label>
                    <select
                      value={taxStatus}
                      onChange={(e) => setTaxStatus(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-1 focus:ring-emerald-500 transition-all"
                    >
                      <option value="included">Taxes Included in Contract Value</option>
                      <option value="excluded">Taxes Excluded (Charged Separately)</option>
                      <option value="not_applicable">Not Applicable / Tax Exempt</option>
                    </select>
                  </div>

                  {/* Separate VAT & Income Tax Fields */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        VAT Rate (%)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="1"
                          placeholder="0"
                          value={taxRate || ''}
                          onChange={(e) => setTaxRate(e.target.value === '' ? 0 : Number(e.target.value))}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-1 focus:ring-emerald-500 transition-all"
                        />
                        <span className="absolute right-3 top-2 text-[10px] font-bold text-slate-400 pointer-events-none">
                          {Math.round(taxRate * 100)}%
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Income Tax / IT Rate (%)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="1"
                          placeholder="0"
                          value={incomeTaxRate || ''}
                          onChange={(e) => setIncomeTaxRate(e.target.value === '' ? 0 : Number(e.target.value))}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-1 focus:ring-emerald-500 transition-all"
                        />
                        <span className="absolute right-3 top-2 text-[10px] font-bold text-slate-400 pointer-events-none">
                          {Math.round(incomeTaxRate * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Advance Received & Office Benefit */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Advance Received (৳)
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={advanceReceived || ''}
                        onChange={(e) => setAdvanceReceived(e.target.value === '' ? 0 : Number(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-1 focus:ring-emerald-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Office Benefit (%)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="1"
                          placeholder="0"
                          value={officeBenefitRate || ''}
                          onChange={(e) => setOfficeBenefitRate(e.target.value === '' ? 0 : Number(e.target.value))}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-1 focus:ring-emerald-500 transition-all"
                        />
                        <span className="absolute right-3 top-2 text-[10px] font-bold text-slate-400 pointer-events-none">
                          {Math.round(officeBenefitRate * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Summary Breakdown Box in Light Palette */}
                  <div className="p-4 bg-emerald-50/50 border border-emerald-200/70 rounded-2xl space-y-2 text-xs">
                    <div className={`flex justify-between items-center py-1 px-2 rounded-xl transition-all ${
                      taxStatus !== 'included' 
                        ? 'bg-rose-50 border border-rose-200 text-rose-700 font-bold' 
                        : 'text-slate-600'
                    }`}>
                      <span>VAT Deduction ({Math.round(taxRate * 100)}%):</span>
                      <span className={`font-mono ${taxStatus !== 'included' ? 'text-rose-700 font-bold' : 'font-semibold text-slate-800'}`}>
                        ৳{Math.round(grossProjectValue * taxRate).toLocaleString()}
                      </span>
                    </div>
                    <div className={`flex justify-between items-center py-1 px-2 rounded-xl transition-all ${
                      taxStatus !== 'included' 
                        ? 'bg-rose-50 border border-rose-200 text-rose-700 font-bold' 
                        : 'text-slate-600'
                    }`}>
                      <span>IT Deduction ({Math.round(incomeTaxRate * 100)}%):</span>
                      <span className={`font-mono ${taxStatus !== 'included' ? 'text-rose-700 font-bold' : 'font-semibold text-slate-800'}`}>
                        ৳{Math.round(grossProjectValue * incomeTaxRate).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600 pt-1 border-t border-emerald-200/50">
                      <span className="font-bold text-slate-800">Project Value Excl. IT-VAT:</span>
                      <span className="font-mono font-bold text-emerald-800">৳{Math.round(expectedNetRevenue).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Direct Operational Budget:</span>
                      <span className="font-mono font-semibold text-slate-800">৳{directExpensesBudget.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Office Benefit ({Math.round(officeBenefitRate * 100)}%):</span>
                      <span className="font-mono font-semibold text-slate-800">৳{Math.round(calculatedOfficeBenefit).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-t border-emerald-200/50 pt-2 text-slate-700">
                      <span className="font-bold">Expected Revenue:</span>
                      <span className={`font-mono font-bold ${expectedRevenue < 0 ? 'text-rose-700' : 'text-emerald-800'}`}>৳{Math.round(expectedRevenue).toLocaleString()}</span>
                    </div>
                    <div className="border-t border-emerald-300/80 pt-2 flex justify-between text-sm font-bold">
                      <span className="text-emerald-950 font-extrabold">Total Project Budget:</span>
                      <span className="font-mono text-emerald-800 font-extrabold">৳{Math.round(calculatedTotalBudget).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Team Assignment Card */}
              <div className="bg-white border border-[#EAEBEF] rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center font-bold">
                      <Users size={16} />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">Project Team</h2>
                      <p className="text-[11px] text-slate-400">{selectedTeamMemberIds.length} members assigned</p>
                    </div>
                  </div>
                </div>

                <input
                  type="text"
                  placeholder="Filter employees..."
                  value={teamSearch}
                  onChange={(e) => setTeamSearch(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-violet-500"
                />

                <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                  {filteredUsers.map((user) => {
                    const isSelected = selectedTeamMemberIds.includes(user.id);
                    const cfg = memberConfigs[user.id];
                    const roleTitle = cfg?.roleInProject || 'Site Engineer';
                    const canApprove = cfg?.permissions?.canApproveExpenses || false;

                    return (
                      <div
                        key={user.id}
                        onClick={() => toggleTeamMember(user.id)}
                        className={`p-2.5 rounded-2xl cursor-pointer transition-all border ${
                          isSelected
                            ? 'bg-violet-50/80 border-violet-200 text-violet-900 shadow-xs'
                            : 'bg-white border-slate-100 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                                isSelected ? 'bg-violet-600 text-white' : 'bg-slate-200 text-slate-600'
                              }`}
                            >
                              {(user.name || 'U').substring(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold truncate text-slate-900">{user.name}</p>
                              <p className="text-[10px] text-slate-400 truncate">{user.department || user.email}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {isSelected && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openMemberConfigModal(user.id);
                                }}
                                className="px-2 py-1 rounded-lg bg-violet-100 hover:bg-violet-200 text-violet-800 text-[10px] font-bold flex items-center gap-1 transition-all"
                                title="Configure Project Role & Permissions"
                              >
                                <Sliders size={11} />
                                <span>Access</span>
                              </button>
                            )}

                            <div
                              className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-colors ${
                                isSelected
                                  ? 'bg-violet-600 border-violet-600 text-white'
                                  : 'border-slate-300 bg-white'
                              }`}
                            >
                              {isSelected && <Check size={12} strokeWidth={3} />}
                            </div>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="mt-2 pt-2 border-t border-violet-100/80 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="px-2 py-0.5 rounded-md bg-white border border-violet-200 text-violet-700 font-bold text-[10px]">
                                {roleTitle}
                              </span>
                              {canApprove && (
                                <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                                  <ShieldCheck size={10} />
                                  <span>Approver</span>
                                </span>
                              )}
                            </div>
                            <span className="text-[9px] text-slate-400 font-medium">Click Access to customize</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Member Role & Permissions Modal */}
        {isMemberModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Configure Role & Permissions</h3>
                  <p className="text-xs text-slate-400">
                    Assign custom title and 10 granular checkbox permissions for this project
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMemberModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Editing User Banner */}
              {editingUserId && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-violet-600 text-white flex items-center justify-center font-bold text-xs">
                    {(users.find((u) => u.id === editingUserId)?.name || 'U').substring(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900">
                      {users.find((u) => u.id === editingUserId)?.name}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate">
                      {users.find((u) => u.id === editingUserId)?.email}
                    </p>
                  </div>
                </div>
              )}

              {/* Role Title Input & Presets */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Project Role Title (Free Text) *
                </label>
                <input
                  type="text"
                  required
                  value={modalRoleTitle}
                  onChange={(e) => setModalRoleTitle(e.target.value)}
                  placeholder="e.g., Site Lead, Field Auditor, Quality Inspector, Senior Surveyor..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-violet-500 focus:bg-white"
                />

                {/* Preset Pills */}
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Quick Role Presets:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {ROLE_PRESETS.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => {
                          setModalRoleTitle(preset.role);
                          setModalPerms({ ...preset.perms });
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                          modalRoleTitle.toLowerCase() === preset.role.toLowerCase()
                            ? 'bg-violet-50 border-violet-300 text-violet-700'
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
              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-900 uppercase tracking-wider">
                    Permissions Matrix (10 Checkboxes)
                  </label>
                  <span className="text-[10px] text-slate-400">Custom capabilities</span>
                </div>

                {/* 1. Crucial: Expense Approval Permission */}
                <div
                  onClick={() =>
                    setModalPerms({
                      ...modalPerms,
                      canApproveExpenses: !modalPerms.canApproveExpenses,
                    })
                  }
                  className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                    modalPerms.canApproveExpenses
                      ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 shadow-xs'
                      : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100/60 text-slate-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-lg flex items-center justify-center border mt-0.5 shrink-0 ${
                      modalPerms.canApproveExpenses
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {modalPerms.canApproveExpenses && <Check size={12} strokeWidth={3} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900">Approve Expenses</span>
                      <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[9px] font-bold rounded-sm">
                        Authority
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500">
                      User receives approval notifications and can review & approve/reject project expense claims.
                    </p>
                  </div>
                </div>

                {/* Remaining 9 Permissions in 2-column grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    {
                      key: 'canViewBudget',
                      label: 'View Budget',
                      desc: 'Access total budget, expenses, & financial health',
                    },
                    {
                      key: 'canRecordRevenue',
                      label: 'Record Revenue',
                      desc: 'Record milestone payments and project revenue',
                    },
                    {
                      key: 'canViewExpenses',
                      label: 'View Expenses',
                      desc: 'See all submitted project expenses',
                    },
                    {
                      key: 'canCreateExpenses',
                      label: 'Create Expenses',
                      desc: 'Submit new project expense claims for reimbursement',
                    },
                    {
                      key: 'canManageTasks',
                      label: 'Manage Tasks',
                      desc: 'Create, assign, edit, and close project tasks',
                    },
                    {
                      key: 'canUpdateProgress',
                      label: 'Update Progress',
                      desc: 'Update project completion percentage and site logs',
                    },
                    {
                      key: 'canManageTeam',
                      label: 'Manage Team',
                      desc: 'Assign members and adjust project member roles',
                    },
                    {
                      key: 'canEditProject',
                      label: 'Edit Project',
                      desc: 'Update project settings, dates, and site location',
                    },
                    {
                      key: 'canViewAttendance',
                      label: 'View Attendance',
                      desc: 'Monitor team attendance logs and geofence check-ins',
                    },
                  ].map((perm) => {
                    const isChecked = (modalPerms as any)[perm.key];
                    return (
                      <div
                        key={perm.key}
                        onClick={() =>
                          setModalPerms({
                            ...modalPerms,
                            [perm.key]: !isChecked,
                          })
                        }
                        className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                          isChecked
                            ? 'bg-violet-50/60 border-violet-200 text-violet-950'
                            : 'bg-slate-50/40 border-slate-200 hover:bg-slate-100/50 text-slate-600'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-md flex items-center justify-center border mt-0.5 shrink-0 ${
                            isChecked
                              ? 'bg-violet-600 border-violet-600 text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isChecked && <Check size={10} strokeWidth={3} />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-[11px] text-slate-900 leading-tight">{perm.label}</p>
                          <p className="text-[9px] text-slate-400 leading-tight mt-0.5">{perm.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsMemberModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveMemberConfig}
                  className="px-4 py-2 rounded-xl bg-violet-600 text-white text-xs font-bold hover:bg-violet-700 shadow-sm flex items-center gap-1.5"
                >
                  <Check size={14} />
                  <span>Apply Access</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
