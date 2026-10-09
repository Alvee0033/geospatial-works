"use client";

import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Download, 
  Phone, 
  Mail, 
  MapPin, 
  Building, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  User, 
  X,
  FileText,
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface LeadItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  district: string;
  source: 'Website Contact' | 'AI Chatbot' | 'WhatsApp' | 'Direct Call' | 'Consultation Popup';
  status: 'new' | 'contacted' | 'qualified' | 'closed' | 'lost';
  createdDate: string;
  serviceRequested: string;
  notes?: string[];
}

const initialLeads: LeadItem[] = [
  {
    id: 'lead-001',
    name: 'Kamrul Hasan',
    email: 'kamrul@deshbuilders.com',
    phone: '+8801711998877',
    company: 'Desh Builders & Engineering',
    district: 'Gazipur',
    source: 'AI Chatbot',
    status: 'new',
    createdDate: 'Today, 11:30 AM',
    serviceRequested: 'UAV Photogrammetry & 3D Contour Mapping',
    notes: ['Inquired about 250-acre highway mapping in Gazipur. Requested phone consultation.']
  },
  {
    id: 'lead-002',
    name: 'Shamim Chowdhury',
    email: 'shamim@chittagongport.gov.bd',
    phone: '+8801819223344',
    company: 'Chittagong Port Infrastructure',
    district: 'Chittagong',
    source: 'WhatsApp',
    status: 'contacted',
    createdDate: 'Yesterday, 3:15 PM',
    serviceRequested: 'Bathymetric Hydrographic Channel Survey',
    notes: ['Met with senior hydrographer. Sent brochure.']
  },
  {
    id: 'lead-003',
    name: 'Farhana Yeasmin',
    email: 'farhana@apexland.com.bd',
    phone: '+8801912345678',
    company: 'Apex Land Developments',
    district: 'Pabna',
    source: 'Website Contact',
    status: 'qualified',
    createdDate: 'Aug 03, 2026',
    serviceRequested: 'Mouza Map Digitizing & Boundary Verification',
    notes: ['12 Mouza sheets digitizing. Proposal submitted ($4,500).']
  },
  {
    id: 'lead-004',
    name: 'Tariqul Islam',
    email: 'tariq@sylhetpower.com',
    phone: '+8801611002233',
    company: 'Sylhet Energy Projects',
    district: 'Sylhet',
    source: 'Consultation Popup',
    status: 'closed',
    createdDate: 'Jul 28, 2026',
    serviceRequested: 'Construction Site Layout & Column Staking',
    notes: ['Contract signed. Site team deployed.']
  }
];

export default function LeadsAdmin() {
  const [leads, setLeads] = useState<LeadItem[]>(initialLeads);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedLead, setSelectedLead] = useState<LeadItem | null>(null);
  const [newNoteText, setNewNoteText] = useState('');
  const [addLeadOpen, setAddLeadOpen] = useState(false);

  // New Lead Form State
  const [newLeadForm, setNewLeadForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    district: 'Dhaka',
    serviceRequested: 'Topographical Survey'
  });

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          lead.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          lead.district.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadForm.name || !newLeadForm.phone) return;

    const created: LeadItem = {
      id: `lead-${Date.now()}`,
      name: newLeadForm.name,
      email: newLeadForm.email || 'n/a',
      phone: newLeadForm.phone,
      company: newLeadForm.company || 'Individual Client',
      district: newLeadForm.district,
      source: 'Direct Call',
      status: 'new',
      createdDate: 'Just now',
      serviceRequested: newLeadForm.serviceRequested,
      notes: ['Lead manually added by Admin']
    };

    setLeads([created, ...leads]);
    setAddLeadOpen(false);
    setNewLeadForm({ name: '', email: '', phone: '', company: '', district: 'Dhaka', serviceRequested: 'Topographical Survey' });
  };

  const handleAddNote = () => {
    if (!newNoteText.trim() || !selectedLead) return;

    setLeads(prev => prev.map(l => {
      if (l.id === selectedLead.id) {
        const updatedNotes = [...(l.notes || []), `${newNoteText.trim()} (by Admin)`];
        setSelectedLead({ ...l, notes: updatedNotes });
        return { ...l, notes: updatedNotes };
      }
      return l;
    }));

    setNewNoteText('');
  };

  const handleUpdateStatus = (leadId: string, newStatus: LeadItem['status']) => {
    setLeads(prev => prev.map(l => {
      if (l.id === leadId) {
        const updated = { ...l, status: newStatus };
        if (selectedLead?.id === leadId) setSelectedLead(updated);
        return updated;
      }
      return l;
    }));
  };

  const handleExportCSV = () => {
    const headers = ['ID,Name,Company,District,Phone,Email,Source,Status,Service\n'];
    const rows = leads.map(l => `${l.id},"${l.name}","${l.company}",${l.district},${l.phone},${l.email},${l.source},${l.status},"${l.serviceRequested}"\n`);
    const blob = new Blob([...headers, ...rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GeoWorks_Leads_${Date.now()}.csv`;
    a.click();
  };

  const getStatusBadge = (status: LeadItem['status']) => {
    switch (status) {
      case 'new':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">New</span>;
      case 'contacted':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200">Contacted</span>;
      case 'qualified':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-50 text-purple-700 border border-purple-200">Qualified</span>;
      case 'closed':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200">Closed (Won)</span>;
      case 'lost':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-500 border border-slate-200">Lost</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Customer Leads CRM</h1>
            <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-full uppercase tracking-wider">{leads.length} Total Leads</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Track client inquiries from AI Chatbot, WhatsApp, and Web Forms across Bangladesh.</p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button 
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors border border-slate-200 cursor-pointer"
          >
            <Download size={15} />
            <span>Export CSV</span>
          </button>
          <button 
            onClick={() => setAddLeadOpen(true)}
            className="flex items-center space-x-1.5 px-4.5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer active:scale-98"
          >
            <Plus size={15} />
            <span>Add New Lead</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 flex flex-col md:flex-row gap-3 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search lead name, company, email..." 
            className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-600 outline-none text-xs w-full font-medium"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto no-scrollbar">
          {['all', 'new', 'contacted', 'qualified', 'closed'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all capitalize cursor-pointer whitespace-nowrap ${statusFilter === status ? 'bg-[#122417] text-white shadow-xs' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="py-3.5 px-5">Lead Contact</th>
                <th className="py-3.5 px-4">Company & District</th>
                <th className="py-3.5 px-4">Requested Service</th>
                <th className="py-3.5 px-4">Source</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="py-3.5 px-5">
                    <div className="font-bold text-slate-900 text-sm">{lead.name}</div>
                    <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">{lead.phone}</div>
                    <div className="text-[11px] text-slate-400">{lead.email}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-800">{lead.company}</div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin size={11} className="text-emerald-600" />
                      {lead.district}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-700 max-w-xs">
                    {lead.serviceRequested}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-600">
                    <span className="inline-block px-2.5 py-1 bg-slate-100 rounded-lg text-[11px] border border-slate-200/60">
                      {lead.source}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    {getStatusBadge(lead.status)}
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <button
                      onClick={() => setSelectedLead(lead)}
                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 transition-colors inline-flex items-center space-x-1 cursor-pointer"
                    >
                      <span>View & Notes</span>
                      <ChevronRight size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lead Inspection Drawer / Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-5">
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase text-emerald-700 tracking-wider">Lead Profile Inspector</span>
                <h3 className="text-xl font-black text-slate-900">{selectedLead.name}</h3>
                <p className="text-xs text-slate-500">{selectedLead.company} • {selectedLead.district}</p>
              </div>
              <button onClick={() => setSelectedLead(null)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"><X size={18}/></button>
            </div>

            {/* Change Status Buttons */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Lead Pipeline Status</label>
              <div className="flex flex-wrap gap-1.5">
                {(['new', 'contacted', 'qualified', 'closed', 'lost'] as LeadItem['status'][]).map((st) => (
                  <button
                    key={st}
                    onClick={() => handleUpdateStatus(selectedLead.id, st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${selectedLead.status === st ? 'bg-emerald-700 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Contact Actions */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <a 
                href={`tel:${selectedLead.phone}`} 
                className="flex items-center justify-center space-x-2 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 transition-colors"
              >
                <Phone size={14} />
                <span>Call {selectedLead.phone}</span>
              </a>
              <a 
                href={`mailto:${selectedLead.email}`} 
                className="flex items-center justify-center space-x-2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl border border-slate-200 transition-colors"
              >
                <Mail size={14} />
                <span>Email {selectedLead.email}</span>
              </a>
            </div>

            {/* Internal Team Notes */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Internal Notes ({selectedLead.notes?.length || 0})</h4>
              
              <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                {selectedLead.notes?.map((n, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-700 font-medium">
                    {n}
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder="Add internal note..."
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-600"
                />
                <button
                  onClick={handleAddNote}
                  className="px-4 py-2 bg-emerald-700 text-white text-xs font-bold rounded-xl hover:bg-emerald-800 transition-colors"
                >
                  Add Note
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add New Lead Modal */}
      {addLeadOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleAddLead} className="bg-white w-full max-w-lg rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Add New Customer Lead</h3>
              <button type="button" onClick={() => setAddLeadOpen(false)} className="p-1 text-slate-400 hover:text-slate-600"><X size={18}/></button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newLeadForm.name}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, name: e.target.value })}
                  placeholder="e.g. Mahfuzur Rahman"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Phone / WhatsApp</label>
                  <input
                    type="text"
                    required
                    value={newLeadForm.phone}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, phone: e.target.value })}
                    placeholder="+88017..."
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">District</label>
                  <input
                    type="text"
                    value={newLeadForm.district}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, district: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Company Name</label>
                <input
                  type="text"
                  value={newLeadForm.company}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, company: e.target.value })}
                  placeholder="e.g. Acme Infra Ltd"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Requested Service</label>
                <input
                  type="text"
                  value={newLeadForm.serviceRequested}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, serviceRequested: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
              <button type="button" onClick={() => setAddLeadOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-emerald-700 text-white text-xs font-bold rounded-xl">Save Lead</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
