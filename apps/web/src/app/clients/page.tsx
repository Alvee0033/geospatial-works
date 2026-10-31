'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { StatCard } from '@/components/ui/StatCard';
import { LineChart, Briefcase, DollarSign, TrendingUp, Download, Building, FileSpreadsheet } from 'lucide-react';
import { ExportUtils } from '@/lib/exportUtils';
import { ApiClient } from '@/lib/api';

export default function ClientsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClientData = async () => {
    setLoading(true);
    try {
      const [projData, expData] = await Promise.all([
        ApiClient.getProjects().catch(() => []),
        ApiClient.getExpenses().catch(() => []),
      ]);
      setProjects(projData || []);
      setExpenses(expData || []);
    } catch (e) {
      console.error('Failed fetching client analytics:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientData();
  }, []);

  // Aggregate real projects by client
  const clientMap: Record<
    string,
    { name: string; contracts: number; incurred: number; activeProjects: number }
  > = {};

  projects.forEach((p) => {
    const cName = p.client || p.client_name || 'Direct Enterprise Client';
    if (!clientMap[cName]) {
      clientMap[cName] = { name: cName, contracts: 0, incurred: 0, activeProjects: 0 };
    }
    clientMap[cName].contracts += Number(p.grossProjectValue || p.gross_project_value || p.budget) || 0;
    clientMap[cName].activeProjects += 1;

    // Expenses incurred for this project
    const projExpenses = expenses.filter((e) => e.projectId === p.id && (e.status || '').toLowerCase() === 'approved');
    const spent = projExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    clientMap[cName].incurred += spent;
  });

  const clients = Object.values(clientMap).map((c) => {
    const profit = c.contracts - c.incurred;
    const margin = c.contracts > 0 ? ((profit / c.contracts) * 100).toFixed(1) : '0';
    return { ...c, profit, margin };
  });

  const totalContractVal = clients.reduce((acc, c) => acc + c.contracts, 0);
  const totalIncurredVal = clients.reduce((acc, c) => acc + c.incurred, 0);
  const totalProfitVal = totalContractVal - totalIncurredVal;
  const overallMargin = totalContractVal > 0 ? ((totalProfitVal / totalContractVal) * 100).toFixed(1) : '0';

  const handleExport = () => {
    const rows = clients.map((c) => ({
      'Client Partner': c.name,
      'Total Contract Value (BDT)': c.contracts,
      'Direct Incurred Cost': c.incurred,
      'Net Retained Profit': c.profit,
      'Gross Profit Margin (%)': `${c.margin}%`,
      'Active Projects': c.activeProjects,
    }));
    ExportUtils.exportToExcel(rows, 'GW_Client_Profitability_Analysis_Live');
  };

  return (
    <AdminLayout
      title="Client Analytics & Contract Profitability"
      subtitle="Enterprise analysis of client contract values, direct costs incurred, and gross margins (Live Database)"
      onRefresh={fetchClientData}
      onExport={handleExport}
      isRefreshing={loading}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Client Contracts"
          value={`BDT ${totalContractVal.toLocaleString()}`}
          subtitle={`${clients.length} Active Client Accounts`}
          icon={Briefcase}
          variant="indigo"
        />
        <StatCard
          title="Average Profit Margin"
          value={`${overallMargin}%`}
          subtitle="Net balance after project expenses"
          icon={TrendingUp}
          variant="mint"
        />
        <StatCard
          title="Total Net Profit"
          value={`BDT ${totalProfitVal.toLocaleString()}`}
          subtitle="Project revenue minus approved expenses"
          icon={DollarSign}
          variant="rose"
        />
      </div>

      <div className="bg-white border border-[#EAEBEF] rounded-[32px] p-6 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-slate-900 text-sm tracking-tight">Client Breakdown</h3>
            <p className="text-xs text-slate-400">Derived from real projects and approved expenses</p>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-xs font-semibold transition-colors"
          >
            <Download size={13} />
            <span>Export Analysis</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-3">Client Partner</th>
                <th className="py-3 px-3">Active Projects</th>
                <th className="py-3 px-3">Contract Value</th>
                <th className="py-3 px-3">Incurred Cost</th>
                <th className="py-3 px-3">Net Retained Margin</th>
                <th className="py-3 px-3 text-right">Profit Margin (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-xs">
              {clients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                    {loading ? 'Analyzing client contracts...' : 'No client contracts registered in database.'}
                  </td>
                </tr>
              ) : (
                clients.map((c, i) => (
                  <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-3 font-bold text-slate-900 flex items-center gap-2">
                      <Building size={14} className="text-slate-400" />
                      <span>{c.name}</span>
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-slate-600">{c.activeProjects}</td>
                    <td className="py-3.5 px-3 font-bold text-slate-900">BDT {c.contracts.toLocaleString()}</td>
                    <td className="py-3.5 px-3 font-semibold text-indigo-600">BDT {c.incurred.toLocaleString()}</td>
                    <td className="py-3.5 px-3 font-bold text-emerald-600">BDT {c.profit.toLocaleString()}</td>
                    <td className="py-3.5 px-3 text-right">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                        {c.margin}%
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
