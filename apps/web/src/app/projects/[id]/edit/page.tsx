'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { ApiClient } from '@/lib/api';
import { DateField } from '@/components/forms/DateField';
import { LocationPickerMap } from '@/components/maps/LocationPickerMap';
import {
  Briefcase,
  ArrowLeft,
  Save,
  Calendar,
  DollarSign,
  Percent,
  Users,
  Plus,
  Trash2,
  Check,
  AlertCircle,
  HelpCircle,
  Building,
} from 'lucide-react';

function EditProjectContent() {
  const router = useRouter();
  const routeParams = useParams();
  const projectId = (routeParams?.id as string) || '';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [users, setUsers] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);

  // Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [client, setClient] = useState('');
  const [clientType, setClientType] = useState('government');
  const [assignmentType, setAssignmentType] = useState('direct_consultancy');
  const [status, setStatus] = useState('ongoing');
  const [taxStatus, setTaxStatus] = useState<'included' | 'excluded' | 'not_applicable'>('included');
  const [taxRate, setTaxRate] = useState<number>(0.10);
  const [incomeTaxRate, setIncomeTaxRate] = useState<number>(0);
  const [officeBenefitRate, setOfficeBenefitRate] = useState<number>(0.30);

  const [grossProjectValue, setGrossProjectValue] = useState<number>(100000);
  const [advanceReceived, setAdvanceReceived] = useState<number>(25000);
  const [amountReceived, setAmountReceived] = useState<number>(25000);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [siteLatitude, setSiteLatitude] = useState<number | null>(null);
  const [siteLongitude, setSiteLongitude] = useState<number | null>(null);
  const [siteLocationEnabled, setSiteLocationEnabled] = useState(false);
  const [siteRadiusMeters, setSiteRadiusMeters] = useState(200);

  // Category Budgets
  const [budgetEquipment, setBudgetEquipment] = useState<number>(15000);
  const [budgetTransportation, setBudgetTransportation] = useState<number>(15000);
  const [budgetFood, setBudgetFood] = useState<number>(10000);
  const [budgetAccommodation, setBudgetAccommodation] = useState<number>(10000);
  const [budgetOfficeCost, setBudgetOfficeCost] = useState<number>(10000);
  const [customCategories, setCustomCategories] = useState<{ name: string; amount: number }[]>([]);
  const [newCatName, setNewCatName] = useState('');
  const [newCatAmount, setNewCatAmount] = useState<number>(5000);

  // Team Selection
  const [selectedTeamMemberIds, setSelectedTeamMemberIds] = useState<string[]>([]);
  const [teamSearch, setTeamSearch] = useState('');

  // Meta preserved fields
  const [rawMetaProgress, setRawMetaProgress] = useState<number>(0);
  const [rawNotes, setRawNotes] = useState<any[]>([]);
  const [rawRevenues, setRawRevenues] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [proj, uData, cData, attendanceSettings] = await Promise.all([
          ApiClient.getProjectById(projectId),
          ApiClient.getUsers().catch(() => []),
          ApiClient.getClients().catch(() => []),
          ApiClient.getAttendanceSettings().catch(() => null),
        ]);
        const configuredRadius = Number(attendanceSettings?.geofenceRadiusMeters ?? attendanceSettings?.geofence_radius_meters);
        if (Number.isFinite(configuredRadius) && configuredRadius > 0) setSiteRadiusMeters(configuredRadius);

        if (proj) {
          setName(proj.name || '');
          const latitude = proj.siteLatitude == null && proj.site_latitude == null ? null : Number(proj.siteLatitude ?? proj.site_latitude);
          const longitude = proj.siteLongitude == null && proj.site_longitude == null ? null : Number(proj.siteLongitude ?? proj.site_longitude);
          setSiteLatitude(latitude);
          setSiteLongitude(longitude);
          setSiteLocationEnabled(latitude !== null && longitude !== null);
          setDescription(proj.description || '');
          setClient(proj.client || proj.client_name || '');
          setClientType(proj.clientType || proj.client_type || 'government');
          setAssignmentType(proj.assignmentType || proj.assignment_type || 'direct_consultancy');
          setStatus(proj.status || 'ongoing');
          setTaxStatus(proj.taxStatus || proj.tax_status || 'included');
          setTaxRate(Number(proj.taxRate || proj.tax_rate) || 0.10);
          setIncomeTaxRate(Number((proj.categoryBudgets || proj.category_budgets || {})._meta_income_tax_rate) || 0);
          setOfficeBenefitRate(Number(proj.officeBenefitRate || proj.office_benefit_rate) || 0.30);
          setGrossProjectValue(Number(proj.grossProjectValue || proj.gross_project_value) || 0);
          setAdvanceReceived(Number(proj.advanceReceived || proj.advance_received) || 0);
          setAmountReceived(Number(proj.amountReceived || proj.amount_received) || 0);

          if (proj.startDate || proj.start_date) {
            setStartDate(new Date(proj.startDate || proj.start_date).toISOString().split('T')[0]);
          }
          if (proj.endDate || proj.end_date) {
            setEndDate(new Date(proj.endDate || proj.end_date).toISOString().split('T')[0]);
          }

          setSelectedTeamMemberIds(proj.teamMemberIds || proj.team_member_ids || []);
          setRawMetaProgress(Number(proj.progressPercentage || proj.progress_percentage) || 0);
          setRawNotes(proj.progressNotes || proj.progress_notes || []);
          setRawRevenues(proj.revenueEntries || proj.revenue_entries || []);

          // Parse Category budgets
          const catMap: Record<string, any> = proj.categoryBudgets || proj.category_budgets || {};
          setBudgetEquipment(Number(catMap.equipment) || 0);
          setBudgetTransportation(Number(catMap.transportation) || 0);
          setBudgetFood(Number(catMap.food) || 0);
          setBudgetAccommodation(Number(catMap.accommodation) || 0);
          setBudgetOfficeCost(Number(catMap.officecost) || 0);

          const standardKeys = ['equipment', 'transportation', 'food', 'accommodation', 'officecost', 'officebenefit'];
          const customList: { name: string; amount: number }[] = [];
          Object.entries(catMap).forEach(([k, v]) => {
            if (!standardKeys.includes(k.toLowerCase()) && !k.startsWith('_meta_')) {
              customList.push({ name: k, amount: Number(v) || 0 });
            }
          });
          setCustomCategories(customList);
        }

        setUsers(uData || []);
        setClients(cData || []);
      } catch (err: any) {
        console.error('Failed to load project for edit:', err);
        setError('Failed to load project. Please verify backend connection.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [projectId]);

  // Calculations
  const vatProvision = taxStatus === 'included' ? grossProjectValue * taxRate : 0;
  const incomeTaxProvision = taxStatus === 'included' ? grossProjectValue * incomeTaxRate : 0;
  const expectedNetRevenue = Math.max(0, grossProjectValue - vatProvision - incomeTaxProvision);

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

  const toggleTeamMember = (id: string) => {
    if (selectedTeamMemberIds.includes(id)) {
      setSelectedTeamMemberIds(selectedTeamMemberIds.filter((m) => m !== id));
    } else {
      setSelectedTeamMemberIds([...selectedTeamMemberIds, id]);
    }
  };

  const handleUpdateProject = async (e: React.FormEvent) => {
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

    setSaving(true);
    try {
      const categoryBudgets: Record<string, number> = {
        equipment: budgetEquipment,
        transportation: budgetTransportation,
        food: budgetFood,
        accommodation: budgetAccommodation,
        officecost: budgetOfficeCost,
        officebenefit: calculatedOfficeBenefit,
      };

      customCategories.forEach((c) => {
        categoryBudgets[c.name] = c.amount;
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
        category_budgets: {
          ...categoryBudgets,
          _meta_progress: rawMetaProgress,
          _meta_team_members: selectedTeamMemberIds,
          _meta_income_tax_rate: incomeTaxRate,
        },
        office_benefit_rate: officeBenefitRate,
        start_date: startDate ? new Date(startDate).toISOString() : new Date().toISOString(),
        end_date: endDate ? new Date(endDate).toISOString() : new Date().toISOString(),
        team_member_ids: selectedTeamMemberIds,
        teamMemberIds: selectedTeamMemberIds,
        status: status,
        site_latitude: siteLatitude,
        site_longitude: siteLongitude,
      };

      await ApiClient.updateProject(projectId, payload);
      router.push(`/projects/${projectId}`);
    } catch (err: any) {
      console.error('Failed to update project:', err);
      setError(err?.message || 'Failed to update project.');
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

  if (loading) {
    return (
      <AdminLayout title="Edit Project Configuration" subtitle="Loading current project settings...">
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
          <p className="text-sm font-bold text-slate-500">Loading project configuration...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title={`Edit Project: ${name || 'Project'}`}
      subtitle="Modify contract gross values, tax status, category budgets, and staff assignments"
    >
      <div className="w-full max-w-[1440px] mx-auto px-5 py-5 space-y-4">
        {/* Header Breadcrumbs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push(`/projects/${projectId}`)}
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
                <span className="text-xs font-semibold text-slate-500">Edit Settings</span>
              </div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">Edit Project: {name}</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push(`/projects/${projectId}`)}
              className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="edit-project-form"
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0D1117] text-white text-xs font-bold shadow-md hover:bg-slate-800 transition-all disabled:opacity-50"
            >
              <Save size={16} />
              {saving ? 'Saving Changes...' : 'Save Configuration'}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-700 text-sm">
            <AlertCircle size={18} className="shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <form id="edit-project-form" onSubmit={handleUpdateProject} className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left 2 Cols: Main Details & Budgets */}
            <div className="lg:col-span-2 space-y-4">
              {/* Basic Information Card */}
              <div className="bg-white border border-[#EAEBEF] rounded-xl p-4 shadow-sm space-y-4">
                <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    <Briefcase size={18} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Project Overview</h2>
                    <p className="text-xs text-slate-400">Core parameters, client entity, and assignment scope</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Project Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Scope & Objectives Description
                    </label>
                    <textarea
                      rows={2}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Client Entity *
                      </label>
                      <input
                        type="text"
                        required
                        value={client}
                        onChange={(e) => setClient(e.target.value)}
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    <DateField label="Start Date" value={startDate} onChange={setStartDate} />
                    <DateField label="Target Completion Date" value={endDate} onChange={setEndDate} />
                  </div>
                </div>
              </div>

              {/* Category Budgets Card */}
              <div className="bg-white border border-[#EAEBEF] rounded-xl p-4 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
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
                    <p className="text-base font-black text-slate-900 font-mono">৳{directExpensesBudget.toLocaleString()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Equipment & Instruments (৳)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={budgetEquipment}
                      onChange={(e) => setBudgetEquipment(Number(e.target.value) || 0)}
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
                      value={budgetTransportation}
                      onChange={(e) => setBudgetTransportation(Number(e.target.value) || 0)}
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
                      value={budgetFood}
                      onChange={(e) => setBudgetFood(Number(e.target.value) || 0)}
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
                      value={budgetAccommodation}
                      onChange={(e) => setBudgetAccommodation(Number(e.target.value) || 0)}
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
                      value={budgetOfficeCost}
                      onChange={(e) => setBudgetOfficeCost(Number(e.target.value) || 0)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="ml-2 space-y-3 border-l-2 border-emerald-100 pl-4">
                {/* Custom Categories are sub-lines of Office and Administration. */}
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
            <div className="space-y-4">
              {/* Financial & Contract Calculations */}
              <div className="bg-indigo-50/70 border border-indigo-100 text-slate-900 rounded-xl p-4 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-indigo-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center font-bold text-indigo-600 border border-indigo-100">
                      <Percent size={16} />
                    </div>
                    <h2 className="text-sm font-bold tracking-tight">Contract Financials</h2>
                  </div>
                  <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full uppercase">
                    Live Calculation
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Gross Contract Value (৳)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={grossProjectValue}
                      onChange={(e) => setGrossProjectValue(Number(e.target.value) || 0)}
                      className="w-full px-3.5 py-2.5 bg-white border border-indigo-100 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-indigo-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        VAT Treatment
                      </label>
                      <select
                        value={taxStatus}
                        onChange={(e) => setTaxStatus(e.target.value as any)}
                        className="w-full px-3 py-2 bg-white border border-indigo-100 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-400"
                      >
                        <option value="included">Included</option>
                        <option value="excluded">Excluded</option>
                        <option value="not_applicable">N/A</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        VAT Rate (%)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="1"
                        value={taxRate}
                        onChange={(e) => setTaxRate(Number(e.target.value) || 0)}
                        className="w-full px-3 py-2 bg-white border border-indigo-100 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Advance Received (৳)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={advanceReceived}
                        onChange={(e) => setAdvanceReceived(Number(e.target.value) || 0)}
                        className="w-full px-3 py-2 bg-white border border-indigo-100 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-400"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Income Tax (%)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="1"
                        value={incomeTaxRate}
                        onChange={(e) => setIncomeTaxRate(Number(e.target.value) || 0)}
                        className="w-full px-3 py-2 bg-white border border-indigo-100 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-400"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Office Benefit (%)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="1"
                        value={officeBenefitRate}
                        onChange={(e) => setOfficeBenefitRate(Number(e.target.value) || 0)}
                        className="w-full px-3 py-2 bg-white border border-indigo-100 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-400"
                      />
                    </div>
                  </div>

                  {/* Summary Breakdown Box */}
                  <div className="p-3 bg-white/80 border border-indigo-100 rounded-xl space-y-2 text-xs">
                    <div className="flex justify-between text-slate-500">
                      <span>Project Value Excl. IT-VAT:</span>
                      <span className="font-mono font-bold text-slate-900">৳{expectedNetRevenue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>VAT Provision:</span>
                      <span className="font-mono font-bold text-slate-900">৳{vatProvision.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Income Tax Provision:</span>
                      <span className="font-mono font-bold text-slate-900">৳{incomeTaxProvision.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Direct Operational Budget:</span>
                      <span className="font-mono font-bold text-slate-900">৳{directExpensesBudget.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Office Benefit ({Math.round(officeBenefitRate * 100)}%):</span>
                      <span className="font-mono font-bold text-slate-900">৳{Math.round(calculatedOfficeBenefit).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-t border-indigo-100 pt-2 text-slate-700">
                      <span className="font-bold">Expected Revenue:</span>
                      <span className={`font-mono font-bold ${expectedRevenue < 0 ? 'text-rose-700' : 'text-emerald-700'}`}>৳{Math.round(expectedRevenue).toLocaleString()}</span>
                    </div>
                    <div className="border-t border-indigo-100 pt-2 flex justify-between text-sm font-bold">
                      <span className="text-indigo-700">Total Agreed Budget:</span>
                      <span className="font-mono text-indigo-700">৳{Math.round(calculatedTotalBudget).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Team Assignment Card */}
              <div className="bg-white border border-[#EAEBEF] rounded-xl p-4 shadow-sm space-y-3">
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

                <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
                  {filteredUsers.map((user) => {
                    const isSelected = selectedTeamMemberIds.includes(user.id);
                    return (
                      <div
                        key={user.id}
                        onClick={() => toggleTeamMember(user.id)}
                        className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all border ${
                          isSelected
                            ? 'bg-violet-50/80 border-violet-200 text-violet-900'
                            : 'bg-white border-slate-100 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                              isSelected ? 'bg-violet-600 text-white' : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {(user.name || 'U').substring(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold truncate">{user.name}</p>
                            <p className="text-[10px] text-slate-400 truncate">{user.department || user.email}</p>
                          </div>
                        </div>

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
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}

export default function EditProjectPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <EditProjectContent />
    </React.Suspense>
  );
}
