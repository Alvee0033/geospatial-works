'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Building2, BriefcaseBusiness, CircleDollarSign, Download, Mail, Phone, RefreshCw, Search, Users } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { ApiClient } from '@/lib/api';
import { ExportUtils } from '@/lib/exportUtils';

type ClientRow = {
  id: string;
  name: string;
  clientType?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  projects: number;
  activeProjects: number;
  contractValue: number;
  approvedSpend: number;
};

const money = (value: number) => `৳${new Intl.NumberFormat('en-BD', { maximumFractionDigits: 0 }).format(value || 0)}`;
type DataRecord = Record<string, unknown>;

const text = (value: unknown) => typeof value === 'string' || typeof value === 'number' ? String(value) : '';
const amount = (...values: unknown[]) => {
  const value = values.find((item) => item !== null && item !== undefined && item !== '');
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export default function ClientsPage() {
  const [registeredClients, setRegisteredClients] = useState<DataRecord[]>([]);
  const [projects, setProjects] = useState<DataRecord[]>([]);
  const [expenses, setExpenses] = useState<DataRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const fetchClientData = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    const results = await Promise.allSettled([
      ApiClient.getClients(),
      ApiClient.getProjects(),
      ApiClient.getExpenses(),
    ]);
    const labels = ['clients', 'projects', 'approved costs'];
    const errors: string[] = [];
    if (results[0].status === 'fulfilled') setRegisteredClients(results[0].value || []);
    else errors.push(labels[0]);
    if (results[1].status === 'fulfilled') setProjects(results[1].value || []);
    else errors.push(labels[1]);
    if (results[2].status === 'fulfilled') setExpenses(results[2].value || []);
    else errors.push(labels[2]);
    setLoadError(errors.length ? `Could not refresh ${errors.join(', ')}. Showing available saved data.` : '');
    setLoading(false);
  }, []);

  useEffect(() => {
    const startup = window.setTimeout(() => { void fetchClientData(false); }, 0);
    return () => window.clearTimeout(startup);
  }, [fetchClientData]);

  const clients = useMemo<ClientRow[]>(() => {
    const byId = new Map<string, ClientRow>();
    const byName = new Map<string, ClientRow>();
    const addClient = (client: DataRecord | null, id: string, name: string) => {
      const row: ClientRow = {
        id,
        name,
        clientType: text(client?.clientType || client?.client_type),
        contactPerson: text(client?.contactPerson || client?.contact_person),
        email: text(client?.email),
        phone: text(client?.phone),
        projects: 0,
        activeProjects: 0,
        contractValue: 0,
        approvedSpend: 0,
      };
      byId.set(id, row);
      byName.set(name.trim().toLocaleLowerCase(), row);
      return row;
    };

    registeredClients.forEach((client) => {
      const name = text(client.name).trim();
      const id = text(client.id || client._id || name);
      if (name) addClient(client, id, name);
    });

    const approvedByProject = new Map<string, number>();
    expenses.forEach((expense) => {
      if (text(expense.status).toLowerCase() !== 'approved') return;
      const projectId = expense.projectId || expense.project_id;
      if (!projectId) return;
      const key = String(projectId);
      approvedByProject.set(key, (approvedByProject.get(key) || 0) + amount(expense.amount));
    });

    projects.forEach((project) => {
      const rawName = text(project.client || project.clientName || project.client_name).trim();
      const rawId = project.clientId || project.client_id;
      let client = rawId ? byId.get(String(rawId)) : undefined;
      if (!client && rawName) client = byName.get(rawName.toLocaleLowerCase());
      if (!client && rawName) client = addClient(null, `project-client:${rawName.toLocaleLowerCase()}`, rawName);
      if (!client) return;

      const status = text(project.status).toLowerCase();
      const projectId = text(project.id || project._id);
      client.projects += 1;
      if (!['completed', 'complete', 'closed', 'cancelled', 'canceled', 'archived'].includes(status)) client.activeProjects += 1;
      client.contractValue += amount(project.grossProjectValue, project.gross_project_value, project.contractValue, project.contract_value, project.budget);
      client.approvedSpend += approvedByProject.get(projectId) || 0;
    });

    return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [registeredClients, projects, expenses]);

  const types = useMemo(() => [...new Set(clients.map((client) => client.clientType).filter((type): type is string => Boolean(type)))].sort(), [clients]);
  const filteredClients = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return clients.filter((client) => {
      const matchesQuery = !query || [client.name, client.contactPerson, client.email, client.phone]
        .some((value) => String(value || '').toLocaleLowerCase().includes(query));
      return matchesQuery && (typeFilter === 'all' || client.clientType === typeFilter);
    });
  }, [clients, search, typeFilter]);

  const totals = useMemo(() => clients.reduce((total, client) => ({
    contracts: total.contracts + client.contractValue,
    spend: total.spend + client.approvedSpend,
    projects: total.projects + client.projects,
  }), { contracts: 0, spend: 0, projects: 0 }), [clients]);
  const retained = totals.contracts - totals.spend;
  const margin = totals.contracts > 0 ? retained / totals.contracts * 100 : 0;

  const exportClients = () => {
    const rows = clients.map((client) => ({
      Client: client.name,
      Type: client.clientType || '',
      Contact: client.contactPerson || '',
      Email: client.email || '',
      Phone: client.phone || '',
      Projects: client.projects,
      'Active projects': client.activeProjects,
      'Contract value (BDT)': client.contractValue,
      'Approved spend (BDT)': client.approvedSpend,
      'Contract less approved spend (BDT)': client.contractValue - client.approvedSpend,
    }));
    ExportUtils.exportToExcel(rows, 'GW_Client_Portfolio');
  };

  const cards = [
    { label: 'Client accounts', value: String(clients.length), detail: `${totals.projects} linked projects`, icon: Users, tone: 'emerald' },
    { label: 'Contract value', value: money(totals.contracts), detail: 'Across linked projects', icon: BriefcaseBusiness, tone: 'blue' },
    { label: 'Approved spend', value: money(totals.spend), detail: 'Approved project expenses', icon: CircleDollarSign, tone: 'amber' },
    { label: 'Contract less spend', value: money(retained), detail: `${margin.toFixed(1)}% of contract value`, icon: Building2, tone: retained < 0 ? 'rose' : 'violet' },
  ];

  return (
    <AdminLayout
      title="Clients"
      subtitle="Client relationships and project performance"
      onRefresh={() => void fetchClientData()}
      onExport={exportClients}
      isRefreshing={loading}
    >
      <div className="mx-auto max-w-[1440px] space-y-4 pb-8">
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {cards.map(({ label, value, detail, icon: Icon, tone }) => (
            <article key={label} className="rounded-2xl border border-slate-200/80 bg-white px-4 py-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-shadow hover:shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-slate-500">{label}</p>
                  <p className="mt-1 truncate text-lg font-semibold tracking-tight text-slate-900">{value}</p>
                </div>
                <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl ${tone === 'emerald' ? 'bg-emerald-50 text-emerald-700' : tone === 'blue' ? 'bg-blue-50 text-blue-700' : tone === 'amber' ? 'bg-amber-50 text-amber-700' : tone === 'rose' ? 'bg-rose-50 text-rose-700' : 'bg-violet-50 text-violet-700'}`}>
                  <Icon size={16} />
                </span>
              </div>
              <p className="mt-1 truncate text-[10px] text-slate-400">{detail}</p>
            </article>
          ))}
        </div>

        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
          <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-slate-900">Client portfolio</h2>
              <p className="mt-0.5 text-[11px] text-slate-500">Live directory and linked project costs</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label className="relative min-w-[180px] flex-1 sm:w-56 sm:flex-none">
                <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find a client" aria-label="Search clients" className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-8 pr-3 text-xs text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10" />
              </label>
              <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} aria-label="Filter by client type" className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-600 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10">
                <option value="all">All types</option>
                {types.map((type) => <option key={type} value={type}>{type.replaceAll('_', ' ')}</option>)}
              </select>
              <span className="px-1 text-[11px] tabular-nums text-slate-400">{filteredClients.length} clients</span>
              <button type="button" onClick={exportClients} disabled={!clients.length} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"><Download size={14} />Export</button>
            </div>
          </div>

          {loadError && <div role="alert" className="border-b border-amber-100 bg-amber-50 px-4 py-2 text-xs text-amber-800">{loadError}</div>}

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[780px] text-left">
              <thead className="bg-slate-50/70 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-5 py-3">Client</th>
                  <th className="px-3 py-3">Contact</th>
                  <th className="px-3 py-3">Projects</th>
                  <th className="px-3 py-3 text-right">Contract value</th>
                  <th className="px-3 py-3 text-right">Approved spend</th>
                  <th className="px-5 py-3 text-right">Remaining</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredClients.map((client) => {
                  const remaining = client.contractValue - client.approvedSpend;
                  const spendRatio = client.contractValue > 0 ? Math.min(100, Math.max(0, client.approvedSpend / client.contractValue * 100)) : 0;
                  return (
                    <tr key={client.id} className="group transition-colors hover:bg-slate-50/70">
                      <td className="px-5 py-3.5">
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-700"><Building2 size={16} /></span>
                          <div className="min-w-0">
                            <p className="truncate text-xs font-semibold text-slate-800">{client.name}</p>
                            <p className="mt-0.5 text-[10px] capitalize text-slate-400">{client.clientType?.replaceAll('_', ' ') || 'Client'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3.5">
                        <p className="max-w-[190px] truncate text-xs font-medium text-slate-700">{client.contactPerson || '—'}</p>
                        <p className="mt-0.5 max-w-[190px] truncate text-[10px] text-slate-400">{client.email || client.phone || 'Contact details not added'}</p>
                      </td>
                      <td className="px-3 py-3.5">
                        <span className="text-xs font-semibold tabular-nums text-slate-700">{client.projects}</span>
                        <span className="ml-1.5 text-[10px] text-slate-400">{client.activeProjects} active</span>
                      </td>
                      <td className="px-3 py-3.5 text-right text-xs font-semibold tabular-nums text-slate-800">{money(client.contractValue)}</td>
                      <td className="px-3 py-3.5 text-right">
                        <p className="text-xs font-semibold tabular-nums text-slate-700">{money(client.approvedSpend)}</p>
                        <div className="ml-auto mt-1.5 h-1 w-24 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-500 transition-[width] duration-300" style={{ width: `${spendRatio}%` }} /></div>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <p className={`text-xs font-semibold tabular-nums ${remaining < 0 ? 'text-rose-600' : 'text-emerald-700'}`}>{money(remaining)}</p>
                        <p className="mt-0.5 text-[10px] text-slate-400">{client.contractValue > 0 ? `${(remaining / client.contractValue * 100).toFixed(0)}% remaining` : 'No contract value'}</p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredClients.length === 0 && <div className="px-6 py-16 text-center">
              {loading ? <RefreshCw size={18} className="mx-auto animate-spin text-emerald-600" /> : <Building2 size={20} className="mx-auto text-slate-300" />}
              <p className="mt-2 text-xs font-medium text-slate-600">{loading ? 'Loading client records…' : search || typeFilter !== 'all' ? 'No clients match these filters' : 'No client records yet'}</p>
            </div>}
          </div>

          <div className="grid gap-2.5 p-3 md:hidden">
            {filteredClients.map((client) => {
              const remaining = client.contractValue - client.approvedSpend;
              return <article key={client.id} className="rounded-xl border border-slate-100 bg-white p-3">
                <div className="flex items-start gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700"><Building2 size={16} /></span>
                  <div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold text-slate-800">{client.name}</p><p className="mt-0.5 truncate text-[10px] text-slate-500">{client.contactPerson || client.email || 'Client contact not added'}</p></div>
                  <span className="rounded-full bg-slate-50 px-2 py-1 text-[10px] text-slate-500">{client.projects} projects</span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 border-t border-slate-100 pt-2.5">
                  <div><p className="text-[10px] text-slate-400">Contract value</p><p className="mt-0.5 text-xs font-semibold text-slate-700">{money(client.contractValue)}</p></div>
                  <div className="text-right"><p className="text-[10px] text-slate-400">Remaining</p><p className={`mt-0.5 text-xs font-semibold ${remaining < 0 ? 'text-rose-600' : 'text-emerald-700'}`}>{money(remaining)}</p></div>
                </div>
                <div className="mt-2 flex gap-3 text-[10px]">
                  {client.email && <a className="inline-flex items-center gap-1 text-slate-500 hover:text-emerald-700" href={`mailto:${client.email}`}><Mail size={11} />Email</a>}
                  {client.phone && <a className="inline-flex items-center gap-1 text-slate-500 hover:text-emerald-700" href={`tel:${client.phone}`}><Phone size={11} />Call</a>}
                </div>
              </article>;
            })}
            {filteredClients.length === 0 && <div className="px-4 py-12 text-center text-xs text-slate-500">{loading ? 'Loading client records…' : 'No clients to show'}</div>}
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}
