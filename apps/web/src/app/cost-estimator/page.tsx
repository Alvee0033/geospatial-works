'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Calculator, Sparkles, Download, CheckCircle2, PlusCircle, ArrowRight } from 'lucide-react';
import { ExportUtils } from '@/lib/exportUtils';
import { ApiClient } from '@/lib/api';

export default function CostEstimatorPage() {
  const [projectType, setProjectType] = useState('Drone Topographic Survey');
  const [durationMonths, setDurationMonths] = useState(3);
  const [staffCount, setStaffCount] = useState(6);
  const [locationsCount, setLocationsCount] = useState(4);
  const [proposedFee, setProposedFee] = useState(2500000);
  const [clientName, setClientName] = useState('Ministry of Water Resources');
  const [isConverting, setIsConverting] = useState(false);
  const [realProjects, setRealProjects] = useState<any[]>([]);

  useEffect(() => {
    ApiClient.getProjects()
      .then((data) => setRealProjects(data || []))
      .catch(() => {});
  }, []);

  // Estimation Formulas derived from Geospatial Works Operational Logic
  const estEquipment = locationsCount * 120000 + (projectType.includes('Drone') ? 350000 : 180000);
  const estTransportation = durationMonths * staffCount * 18000;
  const estFoodLiving = durationMonths * staffCount * 22000;
  const estAccommodation = durationMonths * staffCount * 15000;
  const estConsultancy = 250000;
  const estDirectCosts = estEquipment + estTransportation + estFoodLiving + estAccommodation + estConsultancy;
  const estOfficeOverhead = estDirectCosts * 0.3; // 30% company retainage
  const totalEstimatedCost = estDirectCosts + estOfficeOverhead;
  const projectedProfit = proposedFee - totalEstimatedCost;
  const profitMargin = proposedFee > 0 ? ((projectedProfit / proposedFee) * 100).toFixed(1) : '0';

  const handleConvertProject = async () => {
    if (!confirm(`Create new live project "${projectType} - ${clientName}" with total budget BDT ${totalEstimatedCost.toLocaleString()}?`)) return;
    setIsConverting(true);
    try {
      const code = `PRJ-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
      await ApiClient.createProject({
        name: `${projectType} (${clientName})`,
        projectId: code,
        description: `Bidding estimate conversion for ${durationMonths} months, ${staffCount} staff, ${locationsCount} sites.`,
        client: clientName,
        clientType: 'government',
        assignmentType: 'direct_consultancy',
        grossProjectValue: proposedFee,
        advanceReceived: Math.round(proposedFee * 0.2),
        budget: totalEstimatedCost,
        categoryBudgets: {
          equipment: estEquipment,
          transportation: estTransportation,
          food: estFoodLiving,
          accommodation: estAccommodation,
          Consultancy: estConsultancy,
          officebenefit: estOfficeOverhead,
        },
        startDate: new Date().toISOString(),
        status: 'ongoing',
      });
      alert('Estimate successfully converted into an active project in the database!');
      window.location.href = '/projects';
    } catch (err: any) {
      alert(`Conversion failed: ${err.message}`);
    } finally {
      setIsConverting(false);
    }
  };

  const handleExport = () => {
    const data = [
      ['Project Discipline', projectType],
      ['Prospective Client', clientName],
      ['Duration (Months)', durationMonths.toString()],
      ['Staff Allocation', staffCount.toString()],
      ['Locations / Bases', locationsCount.toString()],
      ['Proposed Contract Fee (BDT)', proposedFee.toLocaleString()],
      ['Est. Equipment Cost', estEquipment.toLocaleString()],
      ['Est. Transportation', estTransportation.toLocaleString()],
      ['Est. Food & Daily Allowances', estFoodLiving.toLocaleString()],
      ['Est. Accommodation', estAccommodation.toLocaleString()],
      ['Est. Consultancy & Technical', estConsultancy.toLocaleString()],
      ['Company 30% Retainage', estOfficeOverhead.toLocaleString()],
      ['Total Estimated Cost (BDT)', totalEstimatedCost.toLocaleString()],
      ['Projected Net Retained Margin', projectedProfit.toLocaleString()],
      ['Net Profit Margin (%)', `${profitMargin}%`],
    ];
    ExportUtils.exportToDocx(`Bidding_Cost_Estimate_${projectType}`, data, 'GW_Cost_Estimate_Bidding_Proposal');
  };

  return (
    <AdminLayout
      title="Predictive Cost Estimator & Bidding Simulator"
      subtitle="Simulate project parameters, category allocations, and profit margins, then convert into real database projects"
      onExport={handleExport}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Input Parameters Panel */}
        <div className="bg-white border border-[#EAEBEF] rounded-[32px] p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Calculator size={16} className="text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm tracking-tight">Simulation Inputs</h3>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Prospective Client</label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Project Discipline</label>
            <select
              value={projectType}
              onChange={(e) => setProjectType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
            >
              <option>Drone Topographic Survey</option>
              <option>Bathymetric & River Survey</option>
              <option>GIS Cadastral Mapping</option>
              <option>LiDAR Smart City Modeling</option>
              <option>Environmental Feasibility Audit</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Duration: <span className="text-indigo-600 font-bold">{durationMonths} Months</span>
            </label>
            <input
              type="range"
              min="1"
              max="24"
              value={durationMonths}
              onChange={(e) => setDurationMonths(Number(e.target.value))}
              className="w-full accent-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Field Staff Count: <span className="text-indigo-600 font-bold">{staffCount} Engineers</span>
            </label>
            <input
              type="range"
              min="2"
              max="40"
              value={staffCount}
              onChange={(e) => setStaffCount(Number(e.target.value))}
              className="w-full accent-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Field Survey Sites: <span className="text-indigo-600 font-bold">{locationsCount} Sites</span>
            </label>
            <input
              type="range"
              min="1"
              max="30"
              value={locationsCount}
              onChange={(e) => setLocationsCount(Number(e.target.value))}
              className="w-full accent-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Proposed Tender / Bid Fee (BDT)</label>
            <input
              type="number"
              step="50000"
              value={proposedFee}
              onChange={(e) => setProposedFee(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
            />
          </div>

          <button
            onClick={handleConvertProject}
            disabled={isConverting}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#0D1117] hover:bg-slate-800 text-white rounded-full text-xs font-bold transition-all shadow-xs"
          >
            <PlusCircle size={14} />
            <span>{isConverting ? 'Creating Project...' : 'Convert to Active Database Project'}</span>
          </button>
        </div>

        {/* Right Cost Projections & Viability */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-[#EAEBEF] rounded-[28px] p-5 shadow-xs">
              <p className="text-[11px] font-semibold text-slate-400">Total Direct Expenditure</p>
              <p className="text-xl font-bold text-slate-900 mt-1">BDT {estDirectCosts.toLocaleString()}</p>
              <p className="text-[10px] text-slate-400 mt-1">Field personnel, fuel & equipment</p>
            </div>
            <div className="bg-white border border-[#EAEBEF] rounded-[28px] p-5 shadow-xs">
              <p className="text-[11px] font-semibold text-indigo-500">Company Benefit (30%)</p>
              <p className="text-xl font-bold text-indigo-700 mt-1">BDT {estOfficeOverhead.toLocaleString()}</p>
              <p className="text-[10px] text-slate-400 mt-1">Retained corporate revenue</p>
            </div>
            <div className="bg-white border border-[#EAEBEF] rounded-[28px] p-5 shadow-xs">
              <p className="text-[11px] font-semibold text-emerald-600">Net Estimated Profit</p>
              <p className="text-xl font-bold text-emerald-700 mt-1">BDT {projectedProfit.toLocaleString()}</p>
              <p className="text-[10px] text-emerald-600 font-bold mt-1">{profitMargin}% Projected Margin</p>
            </div>
          </div>

          {/* Category Budget Breakdown Table */}
          <div className="bg-white border border-[#EAEBEF] rounded-[32px] p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-sm tracking-tight">Simulated Category Allocations</h3>
              <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                Benchmark Cost Matrix
              </span>
            </div>

            <div className="space-y-3">
              {[
                { name: 'Equipment & Drone / GPS Sensors', cost: estEquipment, pct: Math.round((estEquipment / totalEstimatedCost) * 100) },
                { name: 'Transportation & Field Fuel Log', cost: estTransportation, pct: Math.round((estTransportation / totalEstimatedCost) * 100) },
                { name: 'Daily Food & Subsistence Per Diem', cost: estFoodLiving, pct: Math.round((estFoodLiving / totalEstimatedCost) * 100) },
                { name: 'Accommodation / Site Camp Living', cost: estAccommodation, pct: Math.round((estAccommodation / totalEstimatedCost) * 100) },
                { name: 'Consultancy & Specialized GIS Modeling', cost: estConsultancy, pct: Math.round((estConsultancy / totalEstimatedCost) * 100) },
                { name: 'Geospatial Works 30% Retainage', cost: estOfficeOverhead, pct: Math.round((estOfficeOverhead / totalEstimatedCost) * 100) },
              ].map((cat, idx) => (
                <div key={idx} className="p-3 bg-slate-50/70 border border-slate-100 rounded-2xl flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-slate-900">{cat.name}</p>
                    <p className="text-[10px] text-slate-400">{cat.pct}% of total project outlay</p>
                  </div>
                  <span className="font-bold text-slate-900">BDT {cat.cost.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
