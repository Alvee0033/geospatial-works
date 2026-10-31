// Run with: node scripts/seed-dashboard-showcase.mjs
// Adds a small, repeatable showcase set to the local admin API.
const base = process.env.DASHBOARD_SEED_API_URL || 'http://localhost:3003/api';
const password = process.env.DASHBOARD_SEED_PASSWORD || 'password123';

if (!/^https?:\/\/localhost(?::\d+)?\/api\/?$/.test(base)) {
  throw new Error('The showcase seed only runs against a localhost API.');
}

async function login(email) {
  const response = await fetch(`${base}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const body = await response.json();
  const token = body.accessToken || body.token || body.data?.accessToken;
  if (!response.ok || !token) throw new Error(`Login failed for ${email}: ${response.status}`);
  return token;
}

async function request(path, token, method = 'GET', body) {
  const response = await fetch(`${base}${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`${method} ${path}: ${response.status} ${JSON.stringify(result).slice(0, 180)}`);
  return result.data ?? result;
}

const localDate = (offset = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Dhaka', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(date);
};
const monthDate = (monthsAgo) => {
  if (monthsAgo === 0) return localDate();
  const date = new Date();
  date.setDate(15);
  date.setMonth(date.getMonth() - monthsAgo);
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Dhaka', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(date);
};

const adminToken = await login('admin@gw.com');
const employeeToken = await login('employee@gw.com');
const [users, projects, expenses, tasks, categories] = await Promise.all([
  request('/users', adminToken),
  request('/projects', adminToken),
  request('/expenses', adminToken),
  request('/tasks', adminToken),
  request('/categories', adminToken),
]);

const admin = users.find((user) => user.email === 'admin@gw.com');
const employee = users.find((user) => user.email === 'employee@gw.com');
if (!admin || !employee || projects.length < 2) {
  throw new Error('Expected the two existing users and two projects before seeding.');
}

const projectImages = [
  'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=320&q=80',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=320&q=80',
];
for (const [index, project] of projects.slice(0, 2).entries()) {
  if (!project.imageUrl && !project.image_url) {
    await request(`/projects/${project.id}`, adminToken, 'PUT', { imageUrl: projectImages[index] });
  }
}

const claims = [
  { project: projects[0], employee: employee, category: 'Transportation', amount: 1250, note: 'Showcase: field travel to project site' },
  { project: projects[1], employee: admin, category: 'Equipment', amount: 3200, note: 'Showcase: survey equipment accessories' },
  { project: projects[0], employee: employee, category: 'Food', amount: 850, note: 'Showcase: team site visit meals' },
];
for (const claim of claims) {
  const category = categories.find((item) => item.name?.toLowerCase() === claim.category.toLowerCase());
  if (!category) throw new Error(`Missing category: ${claim.category}`);
  const existing = expenses.find((expense) => expense.note === claim.note);
  if (existing?.categoryId === category.id) continue;
  if (existing) await request(`/expenses/${existing.id}`, adminToken, 'DELETE', {});
  await request('/expenses', adminToken, 'POST', {
    employeeId: claim.employee.id,
    projectId: claim.project.id,
    categoryId: category.id,
    amount: claim.amount,
    note: claim.note,
    date: localDate(),
    hasReceipt: false,
    justificationReason: 'Showcase sample pending review',
    status: 'pending',
  });
}

const monthlyOutflow = [1100, 1750, 900, 1450, 1900, 2300];
const monthlyInflow = [2500, 3300, 2800, 4200, 3100, 4800];
const equipmentCategory = categories.find((item) => item.name?.toLowerCase() === 'equipment');
if (!equipmentCategory) throw new Error('Missing Equipment category');
for (let monthsAgo = 5; monthsAgo >= 0; monthsAgo--) {
  const project = projects[monthsAgo % 2];
  const outflowNote = `Showcase: monthly project expense ${monthsAgo}`;
  const inflowNote = `Showcase: client payment ${monthsAgo}`;
  const existingOutflow = expenses.find((expense) => expense.note === outflowNote);
  if (!existingOutflow) {
    const created = await request('/expenses', adminToken, 'POST', {
      employeeId: employee.id,
      projectId: project.id,
      categoryId: equipmentCategory.id,
      amount: monthlyOutflow[monthsAgo],
      note: outflowNote,
      date: monthDate(monthsAgo),
      hasReceipt: false,
      justificationReason: 'Showcase sample approved for chart',
      status: 'pending',
    });
    await request(`/expenses/${created.id}/approve`, adminToken, 'POST', { note: 'Showcase sample approved for chart' });
  }
  if (!(project.revenueEntries || []).some((entry) => entry.note === inflowNote)) {
    await request(`/projects/${project.id}/revenue`, adminToken, 'POST', {
      amount: monthlyInflow[monthsAgo],
      date: monthDate(monthsAgo),
      note: inflowNote,
    });
  }
}

const deadlines = [
  { project: projects[0], title: 'Showcase: project progress review', days: 2, assignee: employee },
  { project: projects[1], title: 'Showcase: client deliverable check', days: 5, assignee: admin },
  { project: projects[0], title: 'Showcase: field report submission', days: 9, assignee: employee },
];
for (const deadline of deadlines) {
  if (tasks.some((task) => task.title === deadline.title)) continue;
  await request('/tasks', adminToken, 'POST', {
    projectId: deadline.project.id,
    title: deadline.title,
    description: 'Dashboard showcase sample',
    assigneeId: deadline.assignee.id,
    dueDate: localDate(deadline.days),
    status: 'in_progress',
  });
}

const today = localDate();
const currentAttendance = await request(`/attendance?date=${today}`, adminToken);
for (const [user, token] of [[admin, adminToken], [employee, employeeToken]]) {
  if (currentAttendance.some((record) => record.userId === user.id)) continue;
  await request('/attendance/check-in', token, 'POST', {
    latitude: 23.7808,
    longitude: 90.4075,
    addressText: 'Showcase sample, Dhaka',
    deviceInfo: 'Dashboard showcase seed',
    notes: 'Showcase sample attendance',
    date: today,
    sessionType: 'morning',
  });
}

const [finalExpenses, finalTasks, finalAttendance, finalProjects] = await Promise.all([
  request('/expenses', adminToken),
  request('/tasks', adminToken),
  request(`/attendance?date=${today}`, adminToken),
  request('/projects', adminToken),
]);
console.log(JSON.stringify({
  pendingApprovals: finalExpenses.filter((expense) => expense.status === 'pending').length,
  upcomingTasks: finalTasks.filter((task) => task.status !== 'completed' && task.dueDate >= today).length,
  teamPresent: new Set(finalAttendance.map((record) => record.userId)).size,
  projectImages: finalProjects.filter((project) => project.imageUrl || project.image_url).length,
  uploadedProfilePhotos: users.filter((user) => user.avatarUrl || user.avatar_url).length,
  cashFlowPayments: finalProjects.flatMap((project) => project.revenueEntries || []).filter((entry) => entry.note?.startsWith('Showcase: client payment')).length,
  cashFlowExpenses: finalExpenses.filter((expense) => expense.status === 'approved' && expense.note?.startsWith('Showcase: monthly project expense')).length,
}, null, 2));
