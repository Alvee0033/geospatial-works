'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { StatCard } from '@/components/ui/StatCard';
import { Briefcase, DollarSign, TrendingUp, Download, Building, MessageCircle, MessageSquareText, Pencil, X, Save } from 'lucide-react';
import { ExportUtils } from '@/lib/exportUtils';
import { ApiClient } from '@/lib/api';

interface ClientContact {
  id: string;
  clientName: string;
  normalizedName: string;
  whatsappPhone: string | null;
  messengerUrl: string | null;
}

const normalizeClientName = (value: string) => value.normalize('NFKC').trim().replace(/\s+/g, ' ').toLocaleLowerCase('en');

function whatsappHref(phone: string | null | undefined, clientName: string) {
  if (!phone) return null;
  let digits = phone.replace(/\D/g, '');
  if (digits.startsWith('00')) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith('01')) digits = `880${digits.slice(1)}`;
  if (digits.length < 7 || digits.length > 15) return null;
  const message = `Hello ${clientName}, this is Geospatial Works following up on your project.`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export default function ClientsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [clientContacts, setClientContacts] = useState<ClientContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingClient, setEditingClient] = useState<string | null>(null);
  const [contactDraft, setContactDraft] = useState({ whatsappPhone: '', messengerUrl: '' });
  const [contactSaving, setContactSaving] = useState(false);
  const [contactError, setContactError] = useState('');

  const fetchClientData = async () => {
    setLoading(true);
    try {
      const [projData, expData, contactData] = await Promise.all([
        ApiClient.getProjects().catch(() => []),
        ApiClient.getExpenses().catch(() => []),
        ApiClient.getClients().catch(() => []),
      ]);
      setProjects(projData || []);
      setExpenses(expData || []);
      setClientContacts(contactData || []);
    } catch (e) {
      console.error('Failed fetching client analytics:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientData();
  }, []);

  const openContactEditor = (clientName: string) => {
    const current = clientContacts.find((item) => item.normalizedName === normalizeClientName(clientName));
    setEditingClient(clientName);
    setContactDraft({ whatsappPhone: current?.whatsappPhone || '', messengerUrl: current?.messengerUrl || '' });
    setContactError('');
  };

  const saveClientContact = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingClient) return;
    setContactSaving(true);
    setContactError('');
    const existing = clientContacts.find((item) => item.normalizedName === normalizeClientName(editingClient));
    try {
      const saved = existing
        ? await ApiClient.updateClientContact(existing.id, { clientName: editingClient, ...contactDraft })
        : await ApiClient.createClientContact({ clientName: editingClient, ...contactDraft });
      setClientContacts((current) => [saved, ...current.filter((item) => item.id !== saved.id && item.normalizedName !== saved.normalizedName)]);
      setEditingClient(null);
    } catch (error) {
      setContactError(error instanceof Error ? error.message : 'Could not save client contact details.');
    } finally {
      setContactSaving(false);
    }
  };

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
                <th className="py-3 px-3 text-right">Message client</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-xs">
              {clients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                    {loading ? 'Analyzing client contracts...' : 'No client contracts registered in database.'}
                  </td>
                </tr>
              ) : (
                clients.map((c) => {
                  const contact = clientContacts.find((item) => item.normalizedName === normalizeClientName(c.name));
                  const whatsapp = whatsappHref(contact?.whatsappPhone, c.name);
                  const messenger = contact?.messengerUrl;
                  return (
                  <tr key={c.name} className="hover:bg-slate-50/70 transition-colors">
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
                    <td className="py-3 px-3">
                      <div className="flex items-center justify-end gap-1.5">
                        {whatsapp ? (
                          <a href={whatsapp} target="_blank" rel="noopener noreferrer" aria-label={`Message ${c.name} on WhatsApp`} title="Open WhatsApp with a prepared message" className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 transition hover:bg-emerald-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700">
                            <MessageCircle size={15} aria-hidden="true" />
                          </a>
                        ) : (
                          <button type="button" disabled aria-label={`Add WhatsApp contact for ${c.name}`} title="Add this client's WhatsApp number first" className="inline-flex h-8 w-8 cursor-not-allowed items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-300">
                            <MessageCircle size={15} aria-hidden="true" />
                          </button>
                        )}
                        {messenger ? (
                          <a href={messenger} target="_blank" rel="noopener noreferrer" aria-label={`Open Messenger chat for ${c.name}`} title="Open this client's Messenger link" className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-700 transition hover:bg-blue-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700">
                            <MessageSquareText size={15} aria-hidden="true" />
                          </a>
                        ) : (
                          <button type="button" disabled aria-label={`Add Messenger link for ${c.name}`} title="Add this client's m.me link first" className="inline-flex h-8 w-8 cursor-not-allowed items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-300">
                            <MessageSquareText size={15} aria-hidden="true" />
                          </button>
                        )}
                        <button type="button" onClick={() => openContactEditor(c.name)} aria-label={`Edit contact details for ${c.name}`} title="Add or edit messaging details" className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700">
                          <Pencil size={14} aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editingClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !contactSaving) setEditingClient(null); }}>
          <form onSubmit={saveClientContact} className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl" aria-labelledby="client-contact-title">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 id="client-contact-title" className="text-lg font-bold text-slate-900">Client messaging</h2>
                <p className="mt-1 text-sm text-slate-500">Save verified contact links for {editingClient}.</p>
              </div>
              <button type="button" onClick={() => setEditingClient(null)} disabled={contactSaving} aria-label="Close contact editor" className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-50"><X size={18} /></button>
            </div>
            <label className="mt-5 block text-sm font-semibold text-slate-700">
              WhatsApp number
              <input type="tel" autoComplete="tel" value={contactDraft.whatsappPhone} onChange={(event) => setContactDraft({ ...contactDraft, whatsappPhone: event.target.value })} placeholder="+880 1XXX-XXXXXX" className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" />
              <span className="mt-1 block text-xs font-normal text-slate-500">Use a full international number. Bangladeshi numbers beginning with 01 are converted automatically.</span>
            </label>
            <label className="mt-4 block text-sm font-semibold text-slate-700">
              Facebook Messenger link
              <input type="url" inputMode="url" value={contactDraft.messengerUrl} onChange={(event) => setContactDraft({ ...contactDraft, messengerUrl: event.target.value })} placeholder="https://m.me/username" pattern="https://m\\.me/.+" className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100" />
              <span className="mt-1 block text-xs font-normal text-slate-500">Add the client’s direct m.me link. Facebook cannot find a person from a phone number or email alone.</span>
            </label>
            <p className="mt-4 rounded-xl bg-slate-50 px-3 py-2.5 text-xs leading-5 text-slate-600">These buttons open WhatsApp or Messenger. They do not send automatically; review and send the message in the app.</p>
            {contactError && <p role="alert" className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{contactError}</p>}
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setEditingClient(null)} disabled={contactSaving} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">Cancel</button>
              <button type="submit" disabled={contactSaving || (!contactDraft.whatsappPhone.trim() && !contactDraft.messengerUrl.trim())} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"><Save size={15} />{contactSaving ? 'Saving…' : 'Save links'}</button>
            </div>
          </form>
        </div>
      )}
    </AdminLayout>
  );
}
