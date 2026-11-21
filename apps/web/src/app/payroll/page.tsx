'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { StatCard } from '@/components/ui/StatCard';
import {
  Banknote,
  Download,
  CheckCircle2,
  Calendar,
  Eye,
  Edit2,
  Save,
  AlertTriangle,
  Users,
  Clock3,
  ChevronDown,
} from 'lucide-react';
import { ExportUtils } from '@/lib/exportUtils';
import { ApiClient } from '@/lib/api';
import { UserAvatar } from '@/components/ui/UserAvatar';

export default function PayrollPage() {
  const [report, setReport] = useState<any | null>(null);
  const [month, setMonth] = useState<number>(() => new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(() => new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [inspectEmployee, setInspectEmployee] = useState<any | null>(null);
  const [personFilter, setPersonFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [exportMenuOpen, setExportMenuOpen] = useState(false);

  // Set Salary Modal
  const [isSalaryModalOpen, setIsSalaryModalOpen] = useState(false);
  const [salaryUser, setSalaryUser] = useState<any | null>(null);
  const [editBaseSalary, setEditBaseSalary] = useState<number>(50000);
  const [editWorkingDays, setEditWorkingDays] = useState<number>(22);
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
  const departments = useMemo(() => Array.from(new Set(employees.map((emp) => emp.department).filter(Boolean))).sort(), [employees]);
  const filteredEmployees = useMemo(() => employees.filter((emp) => {
    const personMatch = !personFilter || `${emp.userName || ''} ${emp.userId || ''} ${emp.designation || ''}`.toLowerCase().includes(personFilter.toLowerCase());
    const departmentMatch = !departmentFilter || emp.department === departmentFilter;
    const statusMatch = statusFilter === 'all' || (statusFilter === 'finalized' ? emp.isConfirmed : !emp.isConfirmed);
    return personMatch && departmentMatch && statusMatch;
  }), [employees, personFilter, departmentFilter, statusFilter]);
  const filteredPayable = filteredEmployees.reduce((sum, emp) => sum + Number(emp.finalPayableSalary || 0), 0);
  const filteredBaseSalary = filteredEmployees.reduce((sum, emp) => sum + Number(emp.monthlyBaseSalary || 0), 0);
  const filteredDeductions = filteredEmployees.reduce((sum, emp) => sum + Number(emp.totalAbsenceDeductions || 0) + Number(emp.totalPenalties || 0), 0);
  const presentTotal = filteredEmployees.reduce((sum, emp) => sum + Number(emp.presentDays || 0), 0);
  const leaveTotal = filteredEmployees.reduce((sum, emp) => sum + Number(emp.paidLeaveDays || 0) + Number(emp.unpaidLeaveDays || 0), 0);

  const handleOpenSalaryEdit = (emp: any) => {
    setSalaryUser(emp);
    setEditBaseSalary(emp.monthlyBaseSalary || 50000);
    setEditWorkingDays(emp.configuredPayableWorkingDays || emp.scheduledWorkingDays || 22);
    setIsSalaryModalOpen(true);
  };

  const handleSaveSalary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!salaryUser) return;
    setSavingSalary(true);
    try {
      await ApiClient.setEmployeeSalary(salaryUser.userId, {
        monthlySalary: editBaseSalary,
        standardWorkingDays: editWorkingDays,
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

  const employeeSummaryRows = (list: any[]) => list.map((p) => ({
      'Employee ID': p.userId,
      'Staff Name': p.userName,
      Department: p.department,
      Designation: p.designation,
      'Base Salary (BDT)': p.monthlyBaseSalary,
      'Scheduled Working Days': p.scheduledWorkingDays,
      'Days with attendance': Number(p.attendanceDays ?? (Number(p.presentDays || 0) + Number(p.halfDays || 0))),
      'Full Present Days': p.presentDays,
      'Half Days': p.halfDays,
      'Paid Leave Days': p.paidLeaveDays,
      'Unpaid Leave Days': p.unpaidLeaveDays,
      'Missing Login Days': p.missingLoginDays,
      'Confirmed Absent Days': p.confirmedAbsentDays,
      'Absence Deductions (BDT)': p.totalAbsenceDeductions,
      'Additions (BDT)': p.totalAdditions,
      'Other Penalties (BDT)': p.totalPenalties,
      'Attendance Deductions Enabled': p.attendanceDeductionsEnabled !== false ? 'Yes' : 'No',
      'Net Payable (BDT)': p.finalPayableSalary,
      'Finalized Status': p.isConfirmed ? 'Confirmed' : 'Pending Review',
    }));

  const dailyRows = (list: any[]) => list.flatMap((p) => (p.dailyBreakdown || []).map((day: any) => ({
    'Employee ID': p.userId,
    Employee: p.userName,
    Department: p.department || '',
    Designation: p.designation || '',
    Date: day.date,
    Weekday: day.dayOfWeek,
    Status: String(day.status || '').replaceAll('_', ' '),
    'Leave Type': day.leaveType || '',
    'Paid Leave': day.isPaidLeave ? 'Yes' : 'No',
    'Morning Time': day.morningTime ? new Date(day.morningTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
    'Morning Status': day.morningStatus || '',
    'Morning Work Mode': day.morningWorkMode || '',
    'Afternoon Time': day.afternoonTime ? new Date(day.afternoonTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
    'Afternoon Status': day.afternoonStatus || '',
    'Afternoon Work Mode': day.afternoonWorkMode || '',
    'Morning Location': day.morningLocation?.address || '',
    'Afternoon Location': day.afternoonLocation?.address || '',
    'Deduction Units': day.deductionUnits || 0,
    Notes: day.notes || '',
  })));

  const handleExportWorkbook = () => {
    ExportUtils.exportWorkbook([
      { name: 'Payroll Summary', rows: employeeSummaryRows(employees) },
      { name: 'Full Month Attendance', rows: dailyRows(employees) },
    ], `GW_Full_Payroll_Attendance_${year}_${month}`);
    setExportMenuOpen(false);
  };

  const handleExportAllAttendancePdf = () => {
    const rows = dailyRows(employees).map((r) => [r.Employee, r.Department, r.Date, r.Weekday, r.Status, r['Leave Type'], r['Morning Time'], r['Morning Status'], r['Afternoon Time'], r['Afternoon Status'], r['Morning Location'], r['Afternoon Location'], r.Notes]);
    ExportUtils.exportToPdf(['Employee', 'Department', 'Date', 'Day', 'Status', 'Leave', 'AM Time', 'AM Status', 'PM Time', 'PM Status', 'AM Location', 'PM Location', 'Notes'], rows, `Full Monthly Attendance — ${month}/${year}`, `GW_Full_Attendance_${year}_${month}`, { orientation: 'landscape' });
    setExportMenuOpen(false);
  };

  const handleExportFilteredPdf = () => {
    const rows = employeeSummaryRows(filteredEmployees).map((r) => [r['Employee ID'], r['Staff Name'], r.Department, r.Designation, r['Base Salary (BDT)'], r['Full Present Days'], r['Paid Leave Days'], r['Unpaid Leave Days'], r['Absence Deductions (BDT)'], r['Additions (BDT)'], r['Other Penalties (BDT)'], r['Net Payable (BDT)'], r['Finalized Status']]);
    ExportUtils.exportToPdf(['ID', 'Employee', 'Department', 'Designation', 'Base', 'Present', 'Paid leave', 'Unpaid leave', 'Absence cuts', 'Additions', 'Other cuts', 'Net payable', 'Status'], rows, `Filtered Payroll Register — ${month}/${year}`, `GW_Filtered_Payroll_${year}_${month}`, { orientation: 'landscape' });
    setExportMenuOpen(false);
  };

  const handleExportFilteredExcel = () => {
    ExportUtils.exportWorkbook([{ name: 'Filtered Payroll', rows: employeeSummaryRows(filteredEmployees) }, { name: 'Filtered Attendance', rows: dailyRows(filteredEmployees) }], `GW_Filtered_Payroll_${year}_${month}`);
    setExportMenuOpen(false);
  };

  const handleExportEmployeeBreakdown = (employee: any) => {
    const rows = (employee.dailyBreakdown || []).map((day: any) => ({
      Date: day.date,
      Weekday: day.dayOfWeek,
      Status: String(day.status || '').replaceAll('_', ' '),
      'Leave Type': day.leaveType || '',
      'Paid Leave': day.isPaidLeave ? 'Yes' : 'No',
      'Morning check-in': day.morningTime ? new Date(day.morningTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
      'Morning status': day.morningStatus || '',
      'Morning work mode': day.morningWorkMode || '',
      'Afternoon check-in': day.afternoonTime ? new Date(day.afternoonTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
      'Afternoon status': day.afternoonStatus || '',
      'Afternoon work mode': day.afternoonWorkMode || '',
      'Morning location': day.morningLocation?.address || '',
      'Afternoon location': day.afternoonLocation?.address || '',
      'Deduction units': day.deductionUnits || 0,
      Notes: day.notes || '',
    }));
    const summary = employeeSummaryRows([employee]);
    ExportUtils.exportWorkbook([{ name: 'Payroll Summary', rows: summary }, { name: 'Full Month Attendance', rows }], `GW_Attendance_Payroll_${employee.userName || employee.userId}_${year}_${month}`);
  };

  return (
    <AdminLayout
      title="Cash Flow & Payroll"
      subtitle="Review payroll totals, attendance adjustments, and payment status"
      onRefresh={fetchPayroll}
      onExport={() => setExportMenuOpen((open) => !open)}
      isRefreshing={loading}
    >
      <div className="w-full max-w-[1440px] mx-auto px-5 py-5 space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-2">
        <StatCard
          title="Payroll due"
          value={`BDT ${filteredPayable.toLocaleString()}`}
          subtitle={`${filteredEmployees.length} of ${employees.length} staff · ${month}/${year}`}
          icon={Banknote}
          variant="indigo"
          compact
        />
        <StatCard
          title="Base pay"
          value={`BDT ${filteredBaseSalary.toLocaleString()}`}
          subtitle="Before adjustments"
          icon={CheckCircle2}
          variant="mint"
          compact
        />
        <StatCard
          title="Deductions"
          value={`BDT ${filteredDeductions.toLocaleString()}`}
          subtitle="Attendance and payroll adjustments"
          icon={AlertTriangle}
          variant="rose"
          compact
        />
        <StatCard title="People present" value={presentTotal.toLocaleString()} subtitle="Full present days in view" icon={Users} variant="mint" compact />
        <StatCard title="Leave days" value={leaveTotal.toLocaleString()} subtitle="Paid and unpaid leave" icon={Clock3} variant="indigo" compact />
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
                {new Date(year, m - 1).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
          >
            {Array.from(new Set([2024, 2025, 2026, 2027, 2028, new Date().getFullYear()])).sort((a, b) => a - b).map((availableYear) => (
              <option key={availableYear} value={availableYear}>{availableYear}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input aria-label="Filter people" placeholder="Find person or ID" value={personFilter} onChange={(e) => setPersonFilter(e.target.value)} className="w-40 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs" />
          <select aria-label="Filter department" value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs"><option value="">All departments</option>{departments.map((department) => <option key={department} value={department}>{department}</option>)}</select>
          <select aria-label="Filter payroll status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs"><option value="all">All statuses</option><option value="finalized">Finalized</option><option value="pending">Calculated / pending</option></select>
          <div className="relative">
            <button type="button" aria-expanded={exportMenuOpen} onClick={() => setExportMenuOpen((open) => !open)} className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-800"><Download size={14} /> Export <ChevronDown size={13} /></button>
            {exportMenuOpen && <div className="absolute right-0 z-20 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
              <button onClick={handleExportWorkbook} className="block w-full rounded-lg px-3 py-2 text-left text-xs hover:bg-slate-50">Full month report — all people (Excel)</button>
              <button onClick={handleExportAllAttendancePdf} className="block w-full rounded-lg px-3 py-2 text-left text-xs hover:bg-slate-50">Full attendance log — all people (PDF)</button>
              <button onClick={handleExportFilteredExcel} className="block w-full rounded-lg px-3 py-2 text-left text-xs hover:bg-slate-50">Filtered payroll and attendance (Excel)</button>
              <button onClick={handleExportFilteredPdf} className="block w-full rounded-lg px-3 py-2 text-left text-xs hover:bg-slate-50">Filtered payroll register (PDF)</button>
            </div>}
          </div>
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
            {filteredEmployees.length} people · BDT {filteredPayable.toLocaleString()} net · {month}/{year}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-3">Personnel</th>
                <th className="py-3 px-3">Base Contract</th>
                <th className="py-3 px-3">Working Days</th>
                <th className="py-3 px-3">Days with attendance</th>
                <th className="py-3 px-3">Absence / leave deductions</th>
                <th className="py-3 px-3">Net Disbursable</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-xs">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                    {loading ? 'Executing payroll calculations...' : 'No personnel records found for this period.'}
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
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
                      {Number(emp.attendanceDays ?? (Number(emp.presentDays || 0) + Number(emp.halfDays || 0)))} days {emp.halfDays > 0 ? `(${emp.halfDays} half-day)` : ''}
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-rose-600">
                      - BDT {Number(emp.totalAbsenceDeductions || 0).toLocaleString()}
                      {emp.attendanceDeductionsEnabled === false && <span className="mt-1 block text-[9px] font-medium text-slate-400">Absence deductions off</span>}
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

      {/* Full-month employee attendance drawer */}
      {inspectEmployee && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/45 backdrop-blur-[2px]" onMouseDown={(event) => { if (event.target === event.currentTarget) setInspectEmployee(null); }}>
          <aside role="dialog" aria-modal="true" aria-label={`${inspectEmployee.userName} monthly attendance details`} className="flex h-full w-full max-w-5xl flex-col border-l border-slate-200 bg-white shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-6 py-4">
              <div className="flex items-center gap-3">
                <UserAvatar
                  src={inspectEmployee.avatarUrl}
                  name={inspectEmployee.userName || 'Employee'}
                  size="lg"
                  shape="rounded"
                />
                <div>
                  <h4 className="font-bold text-slate-900 text-base">{inspectEmployee.userName} — {new Date(year, month - 1).toLocaleString('default', { month: 'long' })} {year} attendance</h4>
                  <p className="text-xs text-slate-400">
                    {inspectEmployee.department} • {inspectEmployee.designation} • Monthly base: BDT {Number(inspectEmployee.monthlyBaseSalary).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button type="button" onClick={() => handleExportEmployeeBreakdown(inspectEmployee)} className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-800">
                  <Download size={14} /> Export month
                </button>
                <button type="button" aria-label="Close attendance details" onClick={() => setInspectEmployee(null)} className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200">✕</button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 border-b border-slate-100 bg-slate-50/70 p-4 text-center text-xs sm:grid-cols-3 lg:grid-cols-6">
                <div>
                  <span className="text-[10px] text-slate-400 block">Daily Rate</span>
                  <span className="font-bold text-slate-800">
                    BDT {Math.round(Number(inspectEmployee.dailySalaryRate || 0)).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Days with attendance</span>
                  <span className="font-bold text-emerald-600">{Number(inspectEmployee.attendanceDays ?? (Number(inspectEmployee.presentDays || 0) + Number(inspectEmployee.halfDays || 0)))}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Absence Days</span>
                  <span className="font-bold text-rose-600">{Number(inspectEmployee.missingLoginDays || 0) + Number(inspectEmployee.confirmedAbsentDays || 0)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Half Days</span>
                  <span className="font-bold text-amber-600">{inspectEmployee.halfDays || 0}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Absence / leave deductions</span>
                  <span className="font-bold text-rose-600">BDT {Number(inspectEmployee.totalAbsenceDeductions || 0).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Net Payable</span>
                  <span className="font-bold text-slate-900">
                    BDT {Number(inspectEmployee.finalPayableSalary).toLocaleString()}
                  </span>
                </div>
              </div>

            <div className="min-h-0 flex-1 overflow-auto">
                <table className="w-full min-w-[900px] text-left border-collapse">
                  <thead className="sticky top-0 z-10 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase shadow-sm">
                    <tr>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Day</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Morning log</th>
                      <th className="py-2.5 px-3">Afternoon log</th>
                      <th className="py-2.5 px-3">Location</th>
                      <th className="py-2.5 px-3 text-right">Deduction Units</th>
                      <th className="py-2.5 px-3">Notes</th>
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
                        <td className="py-2 px-3 text-slate-600">
                          {day.morningTime ? <><span className="font-mono">{new Date(day.morningTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span><span className="block capitalize text-[10px] text-slate-400">{day.morningStatus || 'check-in'} · {day.morningWorkMode?.replaceAll('_', ' ') || '—'}</span></> : '—'}
                        </td>
                        <td className="py-2 px-3 text-slate-600">
                          {day.afternoonTime ? <><span className="font-mono">{new Date(day.afternoonTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span><span className="block capitalize text-[10px] text-slate-400">{day.afternoonStatus || 'check-in'} · {day.afternoonWorkMode?.replaceAll('_', ' ') || '—'}</span></> : '—'}
                        </td>
                        <td className="py-2 px-3 text-slate-600">
                          {day.morningLocation?.address || day.afternoonLocation?.address || (day.morningLocation ? `${day.morningLocation.lat}, ${day.morningLocation.lng}` : day.afternoonLocation ? `${day.afternoonLocation.lat}, ${day.afternoonLocation.lng}` : '—')}
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-rose-600">
                          {day.deductionUnits > 0 ? `-${day.deductionUnits} unit` : '0'}
                        </td>
                        <td className="max-w-xs py-2 px-3 text-slate-500">{day.notes || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            </div>
            <div className="border-t border-slate-100 px-6 py-3 text-[11px] text-slate-500">
              Showing all {inspectEmployee.dailyBreakdown?.length || 0} calendar days for {month}/{year}.
              {inspectEmployee.attendanceDeductionsEnabled === false && ' All absence deductions are disabled; manually entered payroll adjustments still apply.'}
            </div>
          </aside>
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
                <label className="block text-slate-700 font-semibold mb-1">Payable working days per month</label>
                <input
                  type="number"
                  min={1}
                  max={31}
                  required
                  value={editWorkingDays}
                  onChange={(e) => setEditWorkingDays(parseInt(e.target.value, 10) || 1)}
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
