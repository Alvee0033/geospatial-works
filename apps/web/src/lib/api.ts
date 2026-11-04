import { clearApiCache, readApiCache, writeApiCache } from '@/lib/pageCache';

const DEFAULT_BACKEND_URL = 'https://mtoam6j7bojzuo6lhsakwfp8.203.96.190.78.sslip.io/api';
const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_BACKEND_URL;
// The same-origin gateway is mounted at /api/[...path]. Include the backend
// prefix here so an unset public URL still reaches Nest's /api/v1 routes.
const API_BASE = typeof window !== 'undefined' ? (process.env.NEXT_PUBLIC_API_URL || '/api/v1') : BACKEND_URL;

let serverSideToken: string | null = null;
const inFlightGetRequests = new Map<string, Promise<unknown>>();
const API_REVALIDATE_MS = 15_000;

export class ApiClient {
  public static clearCachePattern(pattern?: string) {
    clearApiCache();
  }

  public static subscribeToDataRefresh(callback: (endpoint: string) => void): () => void {
    if (typeof window === 'undefined') return () => undefined;
    const listener = (event: Event) => callback((event as CustomEvent<{ endpoint: string }>).detail.endpoint);
    window.addEventListener('gw-api-data-refreshed', listener);
    return () => window.removeEventListener('gw-api-data-refreshed', listener);
  }


  public static getToken(): string | null {
    if (typeof window === 'undefined') return serverSideToken;
    const token = localStorage.getItem('gw_auth_token');
    if (token && token.startsWith('mock_')) {
      localStorage.removeItem('gw_auth_token');
      return null;
    }
    return token;
  }

  public static setToken(token: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('gw_auth_token', token);
    } else {
      serverSideToken = token;
    }
  }

  public static clearToken() {
    clearApiCache();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('gw_auth_token');
      localStorage.removeItem('gw_user');
    } else {
      serverSideToken = null;
    }
  }

  public static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const method = (options.method || 'GET').toUpperCase();
    const cacheKey = `${method}:${cleanEndpoint}`;
    const isCacheableGet = method === 'GET' && typeof window !== 'undefined';
    const cached = isCacheableGet ? readApiCache<T>(cacheKey) : null;

    const executeRequest = async (): Promise<T> => {
      let token = this.getToken();
      const url = `${API_BASE}${cleanEndpoint}`;
      const executeFetch = (authToken: string | null) => {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(options.headers as Record<string, string> || {}),
        };
        if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
        return fetch(url, { ...options, ...(method === 'GET' ? { cache: 'no-store' as RequestCache } : {}), headers });
      };

      const res = await executeFetch(token);
      if (res.status === 401) {
        ApiClient.clearToken();
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') window.location.assign('/login');
        throw new Error('Your session has expired. Sign in again to continue.');
      }
      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        throw new Error(errorBody.message || `API Error: ${res.statusText} (${res.status})`);
      }
      const json = await res.json();
      return (json.data !== undefined ? json.data : json) as T;
    };

    if (cached) {
      if (Date.now() - cached.checkedAt >= API_REVALIDATE_MS && !inFlightGetRequests.has(cacheKey)) {
        writeApiCache(cacheKey, cached.value, Date.now());
        const refresh = executeRequest().then((value) => {
          writeApiCache(cacheKey, value);
          window.dispatchEvent(new CustomEvent('gw-api-data-refreshed', { detail: { endpoint: cleanEndpoint } }));
          return value;
        }).catch(() => undefined).finally(() => inFlightGetRequests.delete(cacheKey));
        inFlightGetRequests.set(cacheKey, refresh);
      }
      return cached.value;
    }

    if (isCacheableGet) {
      const existing = inFlightGetRequests.get(cacheKey) as Promise<T> | undefined;
      if (existing) return existing;
      const request = executeRequest().then((value) => {
        writeApiCache(cacheKey, value);
        return value;
      }).finally(() => inFlightGetRequests.delete(cacheKey));
      inFlightGetRequests.set(cacheKey, request);
      return request;
    }

    const result = await executeRequest();
    if (method !== 'GET') clearApiCache();
    return result;
  }

  // Auth
  static async login(credentials: { email: string; password: string }) {
    const endpoint = `${API_BASE.replace(/\/+$/, '')}/auth/login`;
    const request = (url: string, timeoutMs = 15_000) => {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
      return fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email: credentials.email.trim(), password: credentials.password }),
        signal: controller.signal,
      }).finally(() => window.clearTimeout(timeout));
    };

    let res: Response;
    try {
      res = await request(endpoint);
    } catch (error) {
      // If a configured cross-origin API is temporarily unreachable (or CORS
      // blocks it), retry once through the same-origin gateway.
      if (endpoint.startsWith('/')) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          throw new Error('Sign in timed out. Check your connection and try again.');
        }
        throw new Error('Unable to reach the sign-in service. Check your connection and try again.');
      }
      try {
        res = await request('/api/v1/auth/login');
      } catch (fallbackError) {
        if (fallbackError instanceof DOMException && fallbackError.name === 'AbortError') {
          throw new Error('Sign in timed out. Check your connection and try again.');
        }
        throw new Error('Unable to reach the sign-in service. Check your connection and try again.');
      }
    }

    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      const message = payload?.message || payload?.error;
      throw new Error(Array.isArray(message) ? message.join(', ') : message || `Sign in failed (${res.status}).`);
    }
    const data = payload?.data ?? payload;
    const token = data.accessToken || data.token;
    if (!token) throw new Error('The sign-in service returned no session token. Please try again.');
    if (token) {
      clearApiCache();
      this.setToken(token);
      if (data.user) {
        localStorage.setItem('gw_user', JSON.stringify(data.user));
      }
      this.warmWorkspaceData();
    }
    return data;
  }

  static async register(data: {
    name: string;
    email: string;
    password: string;
    department?: string;
    designation?: string;
    phone?: string;
  }) {
    const endpoint = `${API_BASE.replace(/\/+$/, '')}/auth/register`;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(data),
    });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      const message = payload?.message || payload?.error;
      throw new Error(Array.isArray(message) ? message.join(', ') : message || `Registration failed (${res.status}).`);
    }
    return payload?.data ?? payload;
  }

  static async getLatestAppRelease() {
    return this.request<any>('/app-releases/latest');
  }

  static async getAppReleases() {
    return this.request<any[]>('/app-releases');
  }

  static async createAppRelease(data: {
    versionName: string;
    buildNumber: number;
    releaseNotes?: string;
    downloadUrl?: string;
    fileSizeBytes?: number;
    isLatest?: boolean;
    apkBase64?: string;
    apkFileName?: string;
  }) {
    return this.request<any>('/app-releases', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async deleteAppRelease(id: string) {
    return this.request<{ success: boolean }>(`/app-releases/${id}`, {
      method: 'DELETE',
    });
  }

  /** Warm frequently used live workspace data after sign-in without delaying navigation. */
  static warmWorkspaceData(): void {
    let role: string | undefined;
    try {
      role = JSON.parse(localStorage.getItem('gw_user') || 'null')?.role;
    } catch {
      role = undefined;
    }
    if (role === 'project_member' || role === 'viewer') {
      void Promise.allSettled([this.getProjects(), this.getExpenses()]);
      return;
    }
    void Promise.allSettled([
      this.getProjects(), this.getExpenses(), this.getTasks(), this.getLeaves(),
      this.getAttendance(), this.getUsers(), this.getHolidays(),
    ]);
  }

  // Projects API
  static async getProjects() {
    return this.request<any[]>('/projects');
  }

  static async getProjectById(id: string) {
    return this.request<any>(`/projects/${id}`);
  }

  static async createProject(data: any) {
    return this.request<any>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async updateProject(id: string, data: any) {
    return this.request<any>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  static async deleteProject(id: string) {
    return this.request<any>(`/projects/${id}`, {
      method: 'DELETE',
    });
  }

  static async addProjectRevenue(id: string, data: { amount: number; date?: string; note?: string; milestone?: string }) {
    return this.request<any>(`/projects/${id}/revenue`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async closeProject(id: string, data: { closingSummary?: string }) {
    return this.request<any>(`/projects/${id}/close`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async reopenProject(id: string) {
    return this.request<any>(`/projects/${id}/reopen`, {
      method: 'POST',
    });
  }

  // Expenses API
  static async getExpenses(params: Record<string, string> = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.request<any[]>(`/expenses${qs ? `?${qs}` : ''}`);
  }

  static async getExpenseById(id: string) {
    return this.request<any>(`/expenses/${id}`);
  }

  static async createExpense(data: any) {
    return this.request<any>('/expenses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async updateExpense(id: string, data: any) {
    return this.request<any>(`/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  static async deleteExpense(id: string) {
    return this.request<any>(`/expenses/${id}`, {
      method: 'DELETE',
    });
  }

  static async approveExpense(id: string, note: string = 'Approved by administrator') {
    return this.request<any>(`/expenses/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ note }),
    });
  }

  static async rejectExpense(id: string, reason: string = 'Rejected by administrator') {
    return this.request<any>(`/expenses/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  static async addExpenseComment(id: string, comment: string) {
    return this.request<any>(`/expenses/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify({ comment }),
    });
  }

  static async reviewExpenseJustification(id: string, data: { justificationStatus: 'approved' | 'rejected'; justificationReviewComment?: string }) {
    return this.request<any>(`/expenses/${id}/justification/review`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Attendance & GPS API
  static async getAttendance(params: Record<string, string> = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.request<any[]>(`/attendance${qs ? `?${qs}` : ''}`);
  }

  static async getAttendanceOverview(date?: string) {
    const qs = date ? `?date=${encodeURIComponent(date)}` : '';
    return this.request<any>(`/attendance/overview${qs}`);
  }

  static async getAttendanceSummary(userId?: string) {
    const qs = userId ? `?userId=${encodeURIComponent(userId)}` : '';
    return this.request<any>(`/attendance/summary${qs}`);
  }

  static async getAttendanceSettings() {
    return this.request<any>('/attendance/settings');
  }

  static async updateAttendanceSettings(settings: any) {
    return this.request<any>('/attendance/settings', {
      method: 'POST',
      body: JSON.stringify(settings),
    });
  }

  static async recordCheckIn(data: {
    userId?: string;
    latitude: number;
    longitude: number;
    addressText?: string;
    sessionType?: 'morning' | 'afternoon';
    notes?: string;
    deviceInfo?: string;
    date?: string;
  }) {
    return this.request<any>('/attendance/check-in', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Users & Staff API
  static async getUsers(query?: string) {
    const qs = query ? `?q=${encodeURIComponent(query)}` : '';
    return this.request<any[]>(`/users${qs}`);
  }

  static async getUserById(id: string) {
    return this.request<any>(`/users/${id}`);
  }

  static async createUser(data: any) {
    return this.request<any>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async updateUser(id: string, data: any) {
    return this.request<any>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  static async updateUserRole(id: string, role: string) {
    return this.request<any>(`/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  }

  static async updateUserStatus(id: string, isActive: boolean) {
    return this.request<any>(`/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    });
  }

  static async deleteUser(id: string) {
    return this.request<any>(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Salary & Payroll API
  static async getEmployeeSalary(userId: string) {
    return this.request<any>(`/salary/employee/${userId}`);
  }

  static async setEmployeeSalary(userId: string, data: { baseSalary: number; allowances?: number; deductions?: number }) {
    return this.request<any>(`/salary/employee/${userId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async calculateSalary(userId: string, month: number, year: number) {
    return this.request<any>(`/salary/calculate/${userId}?month=${month}&year=${year}`);
  }

  static async saveSalaryCalculation(data: { userId: string; month: number; year: number; notes?: string }) {
    return this.request<any>('/salary/save-calculation', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async getSalaryReport(month: number, year: number) {
    return this.request<any>(`/salary/report?month=${month}&year=${year}`);
  }

  // Leaves & Holidays
  static async getLeaves(params: Record<string, string> = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.request<any[]>(`/salary/leaves${qs ? `?${qs}` : ''}`);
  }

  static async createLeave(data: { userId: string; leaveType: string; startDate: string; endDate: string; reason?: string }) {
    return this.request<any>('/salary/leaves', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async deleteLeave(id: string) {
    return this.request<any>(`/salary/leaves/${id}`, {
      method: 'DELETE',
    });
  }

  static async approveLeave(id: string) {
    return this.request<any>(`/salary/leaves/${id}/approve`, {
      method: 'POST',
    });
  }

  static async rejectLeave(id: string, reason?: string) {
    return this.request<any>(`/salary/leaves/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  static async getHolidays(year?: number) {
    const qs = year ? `?year=${year}` : '';
    return this.request<any[]>(`/salary/holidays${qs}`);
  }

  static async createHoliday(data: { name: string; date: string; isRecurring?: boolean }) {
    return this.request<any>('/salary/holidays', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async deleteHoliday(id: string) {
    return this.request<any>(`/salary/holidays/${id}`, {
      method: 'DELETE',
    });
  }

  // Metadata & Tools
  static async getCategories() {
    return this.request<any[]>('/categories');
  }

  static async getAuditLogs() {
    return this.request<any[]>('/audit-logs');
  }

  static async getHistoricalEstimator() {
    return this.request<any>('/admin/cost-estimator/historical');
  }

  static async getClients() {
    return this.request<any[]>('/clients');
  }

  // Tasks API
  static async getTasks(projectId?: string) {
    const qs = projectId ? `?projectId=${encodeURIComponent(projectId)}` : '';
    return this.request<any[]>(`/tasks${qs}`);
  }

  static async createTask(data: any) {
    return this.request<any>('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async updateTask(id: string, data: any) {
    return this.request<any>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  static async updateTaskStatus(id: string, status: 'todo' | 'in_progress' | 'completed') {
    return this.request<any>(`/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  static async deleteTask(id: string) {
    return this.request<any>(`/tasks/${id}`, {
      method: 'DELETE',
    });
  }

  // Categories API
  static async createCategory(data: any) {
    return this.request<any>('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async updateCategory(id: string, data: any) {
    return this.request<any>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  static async deleteCategory(id: string) {
    return this.request<any>(`/categories/${id}`, {
      method: 'DELETE',
    });
  }

  // Chat API
  static async getChatChannels() {
    return this.request<any[]>('/chat/channels');
  }

  static async getChannelMessages(channelId: string, limit: number = 50) {
    return this.request<any[]>(`/chat/channels/${channelId}/messages?limit=${limit}`);
  }

  static async sendChatMessage(channelId: string, data: { content?: string; imageUrl?: string; projectId?: string }) {
    return this.request<any>(`/chat/channels/${channelId}/messages`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async createProjectChannel(projectId: string) {
    return this.request<any>('/chat/channels/project', {
      method: 'POST',
      body: JSON.stringify({ projectId }),
    });
  }

  static async createDirectChannel(recipientId: string) {
    return this.request<any>('/chat/channels/direct', {
      method: 'POST',
      body: JSON.stringify({ recipientId }),
    });
  }

  // Upload API
  static async uploadFile(fileDataUri: string, category: 'receipts' | 'avatars' | 'projects' = 'projects') {
    return this.request<{ url: string; filename?: string; sizeBytes?: number }>('/uploads', {
      method: 'POST',
      body: JSON.stringify({
        file: fileDataUri,
        category,
      }),
    });
  }

  // Notifications API
  static async getNotifications() {
    return this.request<any[]>('/notifications');
  }

  static async markNotificationRead(id: string) {
    return this.request<any>(`/notifications/${id}/read`, {
      method: 'PATCH',
    });
  }

  static async markAllNotificationsRead(ids: string[]) {
    return Promise.allSettled(ids.map((id) => this.markNotificationRead(id)));
  }
}

