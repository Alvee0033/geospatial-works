'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { StatCard } from '@/components/ui/StatCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  Banknote,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  FileText,
  Calendar,
  Eye,
  Edit2,
  Save,
  Clock,
  AlertTriangle,
  MapPin,
} from 'lucide-react';
import { ExportUtils } from '@/lib/exportUtils';
import { ApiClient } from '@/lib/api';
import { UserAvatar } from '@/components/ui/UserAvatar';

export default function PayrollPage() {
  const [report, setReport] = useState<any | null>(null);
  const [month, setMonth] = useState<number>(10);
  const [year, setYear] = useState<number>(2026);
  const [loading, setLoading] = useState(true);
  const [inspectEmployee, setInspectEmployee] = useState<any | null>(null);

  // Set Salary Modal
  const [isSalaryModalOpen, setIsSalaryModalOpen] = useState(false);
  const [salaryUser, setSalaryUser] = useState<any | null>(null);
  const [editBaseSalary, setEditBaseSalary] = useState<number>(50000);
  const [editAllowances, setEditAllowances] = useState<number>(5000);
  const [editDeductions, setEditDeductions] = useState<number>(0);
  const [savingSalary, setSavingSalary] = useState(false);

  const fetchPayroll = async () => {
    setLoading(true);
    try {
      const data = await ApiClient.getSalaryReport(month, year);
      setReport(data);
    } catch (e) {
      console.error('Failed fetching salary report:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayroll();
  }, [month, year]);

  const employees: any[] = report?.employees || [];
  const totalPayable = report?.totalPayable || 0;
  const totalBaseSalary = report?.totalBaseSalary || 0;
  const totalDeductions = report?.totalDeductions || 0;

  const handleOpenSalaryEdit = (emp: any) => {
    setSalaryUser(emp);
    setEditBaseSalary(emp.monthlyBaseSalary || 50000);
    setEditAllowances(emp.totalAdditions || 0);
    setEditDeductions(emp.totalPenalties || 0);
    setIsSalaryModalOpen(true);
  };

  const handleSaveSalary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!salaryUser) return;
    setSavingSalary(true);
    try {
      await ApiClient.setEmployeeSalary(salaryUser.userId, {
        baseSalary: editBaseSalary,
        allowances: editAllowances,
        deductions: editDeductions,
      });
      setIsSalaryModalOpen(false);
      setSalaryUser(null);
      await fetchPayroll();
      alert('Salary structure updated successfully on server');
    } catch (err: any) {
      alert(`Failed to save salary: ${err.message}`);
    } finally {
      setSavingSalary(false);
    }
  };

  const handleSaveCalculation = async (emp: any) => {
    try {
      await ApiClient.saveSalaryCalculation({
        userId: emp.userId,
        month,
        year,
        notes: `Finalized for ${month}/${year}`,
      });
      alert(`Payroll calculation finalized for ${emp.userName}`);
      await fetchPayroll();
    } catch (err: any) {
      alert(`Failed to finalize calculation: ${err.message}`);
    }
  };

  const handleExport = () => {
    const rows = employees.map((p) => ({
      'Employee ID': p.userId,
      'Staff Name': p.userName,
      Department: p.department,
      Designation: p.designation,
      'Base Salary (BDT)': p.monthlyBaseSalary,
      'Scheduled Working Days': p.scheduledWorkingDays,
      'Present Days': p.presentDays,
      'Half Days': p.halfDays,
      'Absence Deductions (BDT)': p.totalAbsenceDeductions,
      'Additions (BDT)': p.totalAdditions,
      'Net Payable (BDT)': p.finalPayableSalary,
      'Finalized Status': p.isConfirmed ? 'Confirmed' : 'Pending Review',
    }));
    ExportUtils.exportToExcel(rows, `GW_Monthly_Payroll_Real_${year}_${month}`);
  };

  return (
    <AdminLayout
      title="Cash Flow & Payroll"
      subtitle="Review payroll totals, attendance adjustments, and payment status"
      onRefresh={fetchPayroll}
      onExport={handleExport}
      isRefreshing={loading}
    >
      <div className="w-full max-w-[1440px] mx-auto px-5 py-5 space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <StatCard
          title="Payroll due"
          value={`BDT ${totalPayable.toLocaleString()}`}
          subtitle={`${employees.length} staff · ${month}/${year}`}
          icon={Banknote}
          variant="indigo"
          compact
        />
        <StatCard
          title="Base pay"
          value={`BDT ${totalBaseSalary.toLocaleString()}`}
          subtitle="Before adjustments"
          icon={CheckCircle2}
          variant="mint"
          compact
        />
        <StatCard
          title="Deductions"
          value={`BDT ${totalDeductions.toLocaleString()}`}
          subtitle="Attendance based"
          icon={AlertTriangle}
          variant="rose"
          compact
        />
      </div>

      {/* Month / Year Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-[#EAEBEF] rounded-xl p-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <Calendar size={15} className="text-indigo-600" />
            <span>Payroll Period:</span>
          </div>
          <select
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value))}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                {new Date(2026, m - 1).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
          >
            <option value={2025}>2025</option>
            <option value={2026}>2026</option>
            <option value={2027}>2027</option>
          </select>
        </div>

      </div>

      {/* Live Payroll Master Table */}
      <div className="bg-white border border-[#EAEBEF] rounded-xl p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm tracking-tight">Payroll register</h3>
            <p className="text-xs text-slate-400">Calculated from attendance and approved adjustments</p>
          </div>
          <div className="text-xs font-semibold text-slate-500">
            Batch: {month}/{year}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-3">Personnel</th>
                <th className="py-3 px-3">Base Contract</th>
                <th className="py-3 px-3">Working Days</th>
                <th className="py-3 px-3">Present Days</th>
                <th className="py-3 px-3">Absence Deductions</th>
                <th className="py-3 px-3">Net Disbursable</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-xs">
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                    {loading ? 'Executing payroll calculations...' : 'No personnel records found for this period.'}
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp.userId} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <UserAvatar
                          src={emp.avatarUrl}
                          name={emp.userName || 'Employee'}
                          size="sm"
                          shape="rounded"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{emp.userName}</p>
                          <p className="text-[10px] text-slate-400">{emp.department} • {emp.designation}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-slate-800">
                      BDT {Number(emp.monthlyBaseSalary || 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3 font-medium text-slate-600">
                      {emp.scheduledWorkingDays} days
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-emerald-600">
                      {emp.presentDays} days {emp.halfDays > 0 ? `(${emp.halfDays} half)` : ''}
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-rose-600">
                      - BDT {Number(emp.totalAbsenceDeductions || 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3 font-bold text-slate-900 text-sm">
                      BDT {Number(emp.finalPayableSalary || 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          emp.isConfirmed
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {emp.isConfirmed ? 'Finalized' : 'Calculated'}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setInspectEmployee(emp)}
                          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
                          title="Inspect Daily Attendance Breakdown"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => handleOpenSalaryEdit(emp)}
                          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-900 transition-colors"
                          title="Set Salary Structure"
                        >
                          <Edit2 size={13} />
                        </button>
                        {!emp.isConfirmed && (
                          <button
                            onClick={() => handleSaveCalculation(emp)}
                            className="p-1.5 hover:bg-emerald-50 rounded-lg text-emerald-600 transition-colors"
                            title="Confirm & Save Calculation"
                          >
                            <Save size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Daily Breakdown Modal */}
      {inspectEmployee && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[32px] p-6 max-w-2xl w-full border border-slate-200 shadow-xl max-h-[90vh] overflow-y-auto animate-in fade-in duration-200">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <UserAvatar
                  src={inspectEmployee.avatarUrl}
                  name={inspectEmployee.userName || 'Employee'}
                  size="lg"
                  shape="rounded"
                />
                <div>
                  <h4 className="font-bold text-slate-900 text-base">{inspectEmployee.userName} — Attendance Breakdown</h4>
                  <p className="text-xs text-slate-400">
                    {inspectEmployee.department} • Monthly Rate: BDT {Number(inspectEmployee.monthlyBaseSalary).toLocaleString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectEmployee(null)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-4 gap-2 text-center p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-400 block">Daily Rate</span>
                  <span className="font-bold text-slate-800">
                    BDT {Math.round(Number(inspectEmployee.dailySalaryRate || 0)).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Present Days</span>
                  <span className="font-bold text-emerald-600">{inspectEmployee.presentDays}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Absence Days</span>
                  <span className="font-bold text-rose-600">{inspectEmployee.missingLoginDays || inspectEmployee.confirmedAbsentDays || 0}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Net Payable</span>
                  <span className="font-bold text-slate-900">
                    BDT {Number(inspectEmployee.finalPayableSalary).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto border border-slate-100 rounded-2xl">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 sticky top-0 text-[10px] font-bold text-slate-400 uppercase">
                    <tr>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Day</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">GPS Location</th>
                      <th className="py-2.5 px-3 text-right">Deduction Units</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[11px]">
                    {(inspectEmployee.dailyBreakdown || []).map((day: any) => (
                      <tr key={day.date} className="hover:bg-slate-50/50">
                        <td className="py-2 px-3 font-mono font-medium text-slate-700">{day.date}</td>
                        <td className="py-2 px-3 text-slate-500">{day.dayOfWeek}</td>
                        <td className="py-2 px-3 font-semibold capitalize">
                          <span
                            className={
                              day.status === 'present'
                                ? 'text-emerald-600'
                                : day.status === 'weekend'
                                ? 'text-slate-400'
                                : day.status === 'upcoming'
                                ? 'text-slate-400'
                                : 'text-rose-500'
                            }
                          >
                            {day.status?.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-slate-600 truncate max-w-xs">
                          {day.morningLocation?.address || (day.morningLocation ? `${day.morningLocation.lat}, ${day.morningLocation.lng}` : '—')}
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-rose-600">
                          {day.deductionUnits > 0 ? `-${day.deductionUnits} unit` : '0'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setInspectEmployee(null)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-full text-xs"
              >
                Close Breakdown
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Set Salary Structure Modal */}
      {isSalaryModalOpen && salaryUser && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[32px] p-6 max-w-md w-full border border-slate-200 shadow-xl animate-in fade-in duration-200">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h4 className="font-bold text-slate-900 text-base">Configure Salary: {salaryUser.userName}</h4>
              <button
                onClick={() => setIsSalaryModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSalary} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Monthly Base Salary (BDT)</label>
                <input
                  type="number"
                  required
                  value={editBaseSalary}
                  onChange={(e) => setEditBaseSalary(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-base text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Monthly Allowances (BDT)</label>
                <input
                  type="number"
                  value={editAllowances}
                  onChange={(e) => setEditAllowances(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Fixed Deductions (BDT)</label>
                <input
                  type="number"
                  value={editDeductions}
                  onChange={(e) => setEditDeductions(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSalaryModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-full"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingSalary}
                  className="px-5 py-2 bg-[#0D1117] hover:bg-slate-800 text-white font-bold rounded-full shadow-xs"
                >
                  {savingSalary ? 'Saving...' : 'Save Structure'}
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
