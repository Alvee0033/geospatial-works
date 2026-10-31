export type UserRole = 'admin' | 'manager' | 'employee' | 'accountant';

export interface User {
  id: string;
  email: string;
  fullName: string;
  employeeId?: string;
  role: UserRole;
  designation?: string;
  department?: string;
  avatarUrl?: string;
  phoneNumber?: string;
  status?: string;
}

export interface Project {
  id: string;
  name: string;
  code?: string;
  client: string;
  clientId?: string;
  budget: number;
  grossProjectValue: number;
  amountReceived: number;
  amountReceivable: number;
  taxRate: number;
  taxStatus: 'included' | 'excluded' | 'exempt';
  officeBenefitRate: number;
  status: 'ongoing' | 'completed' | 'on_hold' | 'archived';
  startDate: string;
  endDate?: string;
  location?: string;
  imageUrl?: string;
  membersCount?: number;
}

export interface Expense {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeAvatar?: string;
  projectId: string;
  projectName: string;
  amount: number; // Total Direct (Base + VAT + Tax)
  baseCost: number;
  vatRate: number;
  vatAmount: number;
  taxRate: number;
  taxAmount: number;
  officeBenefitAmount: number;
  currency: string;
  categoryId: string;
  categoryName: string;
  categoryIcon?: string;
  note: string;
  date: string;
  hasReceipt: boolean;
  receiptPhotoUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  justificationStatus?: 'none' | 'required' | 'submitted' | 'approved' | 'rejected';
  justificationReason?: string;
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  department: string;
  designation: string;
  avatarUrl?: string;
  date: string;
  sessionType: 'morning' | 'afternoon';
  loginTime: string;
  latitude?: number;
  longitude?: number;
  addressText?: string;
  attendanceMode: 'office' | 'field' | 'home';
  fieldSiteName?: string;
  status: 'present' | 'absent' | 'late' | 'leave';
  notes?: string;
}

export interface LeaveRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  leaveType: 'casual' | 'sick' | 'annual' | 'emergency' | 'maternity';
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  attachmentUrl?: string;
  approvedBy?: string;
  rejectionReason?: string;
  createdAt: string;
}

export interface EarlyDeparture {
  id: string;
  userId: string;
  userName: string;
  date: string;
  departureTime: string;
  reason: string;
  status: 'submitted' | 'approved' | 'rejected';
}

export interface SalaryRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  designation: string;
  department: string;
  month: string;
  year: number;
  baseSalary: number;
  allowances: number;
  reimbursements: number;
  deductions: number;
  netPayable: number;
  paymentStatus: 'draft' | 'paid' | 'pending';
}

export interface ClientProfile {
  id: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  totalContracts: number;
  activeProjects: number;
  revenueReceived: number;
  receivables: number;
  profitMargin: number;
}
