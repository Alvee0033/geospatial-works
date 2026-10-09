"use client";

import React, { useState } from 'react';
import { 
  Search, 
  Send, 
  Paperclip, 
  Phone, 
  Mail, 
  MessageSquare, 
  Bot, 
  User, 
  UserPlus,
  MapPin,
  Check
} from 'lucide-react';

interface MessageItem {
  id: string;
  sender: 'customer' | 'admin' | 'ai';
  senderName: string;
  text: string;
  timestamp: string;
}

interface TicketItem {
  id: string;
  channel: 'whatsapp' | 'email' | 'webchat' | 'aibot';
  name: string;
  contact: string;
  company: string;
  subject: string;
  status: 'open' | 'pending' | 'resolved';
  leadStatus: 'new' | 'contacted' | 'qualified' | 'closed' | 'lost';
  inCrm: boolean;
  timestamp: string;
  unread: boolean;
  messages: MessageItem[];
  location?: string;
}

const initialTickets: TicketItem[] = [
  {
    id: 't-101',
    channel: 'whatsapp',
    name: 'Tanvir Ahmed',
    contact: '+8801711223344',
    company: 'Dhaka Infrastructure Ltd',
    subject: 'UAV Photogrammetry Quote & Survey Timeline',
    status: 'open',
    leadStatus: 'new',
    inCrm: false,
    timestamp: '10 min ago',
    unread: true,
    location: 'Gazipur, Dhaka',
    messages: [
      { id: 'm-1', sender: 'customer', senderName: 'Tanvir Ahmed', text: 'Hello! We need a 1cm/pixel UAV drone survey for a 250-acre highway extension project in Gazipur. What is your pricing and timeline?', timestamp: '10:15 AM' },
      { id: 'm-2', sender: 'ai', senderName: 'GeoWorks AI', text: 'Hello Tanvir! Our UAV drone mapping team delivers sub-centimeter orthomosaics and DEM/DTM models tied to the SOB Geodetic Network.', timestamp: '10:15 AM' },
      { id: 'm-3', sender: 'customer', senderName: 'Tanvir Ahmed', text: 'Great, please connect me with a senior surveyor on phone if possible.', timestamp: '10:18 AM' }
    ]
  },
  {
    id: 't-102',
    channel: 'email',
    name: 'Dr. Rafiqul Islam',
    contact: 'rafiqul@buet.ac.bd',
    company: 'BUET Research Team',
    subject: 'Bathymetric Hydrographic Riverbed Surveying',
    status: 'open',
    leadStatus: 'contacted',
    inCrm: true,
    timestamp: '45 min ago',
    unread: true,
    location: 'Chittagong',
    messages: [
      { id: 'm-4', sender: 'customer', senderName: 'Dr. Rafiqul Islam', text: 'Dear GeoWorks Team,\nWe require dual-frequency hydrographic echo sounder depth profiling for Karnaphuli riverbed channel monitoring. Can you send your technical capability document?', timestamp: '09:40 AM' },
      { id: 'm-5', sender: 'admin', senderName: 'Lead Hydrographer', text: 'Dear Dr. Rafiqul, Thank you for reaching out. Attached is our IHO-standard hydrographic survey capability brochure.', timestamp: '10:02 AM' }
    ]
  },
  {
    id: 't-103',
    channel: 'webchat',
    name: 'Nasrin Sultana',
    contact: 'nasrin@apexproperties.com.bd',
    company: 'Apex Real Estate',
    subject: 'Mouza Map Digitizing & CS/SA/RS Boundary Survey',
    status: 'pending',
    leadStatus: 'qualified',
    inCrm: true,
    timestamp: '2 hours ago',
    unread: false,
    location: 'Pabna',
    messages: [
      { id: 'm-6', sender: 'customer', senderName: 'Nasrin Sultana', text: 'Hi, we have 12 Mouza sheets (CS, SA, RS, BS) that need digital vector conversion and field boundary verification in Pabna.', timestamp: '08:15 AM' }
    ]
  },
  {
    id: 't-104',
    channel: 'aibot',
    name: 'Kazi Mahmud',
    contact: '+8801819000111',
    company: 'Kazi Logistics',
    subject: 'Business Hours & Consultation Booking',
    status: 'resolved',
    leadStatus: 'closed',
    inCrm: true,
    timestamp: 'Yesterday',
    unread: false,
    location: 'Sylhet',
    messages: [
      { id: 'm-7', sender: 'customer', senderName: 'Kazi Mahmud', text: 'What are your office business hours for consultation?', timestamp: 'Yesterday 4:00 PM' },
      { id: 'm-8', sender: 'ai', senderName: 'GeoWorks AI', text: 'Our office business hours are Monday to Friday, 9:00 AM to 6:00 PM (EST). You can also request direct phone consultation at +8801303772216.', timestamp: 'Yesterday 4:00 PM' }
    ]
  }
];

export default function SupportAdmin() {
  const [tickets, setTickets] = useState<TicketItem[]>(initialTickets);
  const [activeTicketId, setActiveTicketId] = useState<string>('t-101');
  const [channelFilter, setChannelFilter] = useState<'all' | 'whatsapp' | 'email' | 'webchat' | 'aibot'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'pending' | 'resolved'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [replyText, setReplyText] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activeTicket = tickets.find(t => t.id === activeTicketId) || tickets[0];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredTickets = tickets.filter(t => {
    const matchesChannel = channelFilter === 'all' || t.channel === channelFilter;
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.subject.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesChannel && matchesStatus && matchesSearch;
  });

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeTicket) return;

    const newMessage: MessageItem = {
      id: `m-${Date.now()}`,
      sender: 'admin',
      senderName: 'Admin Team',
      text: replyText.trim(),
      timestamp: 'Just now'
    };

    setTickets(prev => prev.map(t => {
      if (t.id === activeTicket.id) {
        return {
          ...t,
          unread: false,
          messages: [...t.messages, newMessage]
        };
      }
      return t;
    }));

    setReplyText('');
  };

  const handleToggleStatus = (newStatus: 'open' | 'pending' | 'resolved') => {
    setTickets(prev => prev.map(t => {
      if (t.id === activeTicket.id) {
        return { ...t, status: newStatus };
      }
      return t;
    }));
    showToast(`Status updated to ${newStatus.toUpperCase()}`);
  };

  const handleLeadStatusChange = (newLeadStatus: TicketItem['leadStatus']) => {
    setTickets(prev => prev.map(t => {
      if (t.id === activeTicket.id) {
        return { ...t, leadStatus: newLeadStatus, inCrm: true };
      }
      return t;
    }));
    showToast(`Lead Status set to ${newLeadStatus.toUpperCase()}`);
  };

  const handleAddToCrm = () => {
    setTickets(prev => prev.map(t => {
      if (t.id === activeTicket.id) {
        return { ...t, inCrm: true };
      }
      return t;
    }));
    showToast(`${activeTicket.name} added to Leads CRM!`);
  };

  const getChannelBadge = (channel: string) => {
    switch (channel) {
      case 'whatsapp':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#20bc2e]/10 text-[#127a1b] border border-[#20bc2e]/20">
            <Phone size={10} /> WhatsApp
          </span>
        );
      case 'email':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Mail size={10} /> Email
          </span>
        );
      case 'webchat':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <MessageSquare size={10} /> Web Chat
          </span>
        );
      case 'aibot':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Bot size={10} /> AI Transcripts
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-[calc(100vh-57px)] w-full flex flex-col bg-white overflow-hidden">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-6 z-50 bg-gray-900 text-white px-4 py-2.5 rounded-xl shadow-lg text-xs font-bold flex items-center space-x-2 animate-in fade-in duration-200">
          <Check size={14} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Full-Width Header Bar */}
      <div className="px-6 py-3.5 bg-white border-b border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-lg font-bold text-gray-900 tracking-tight">Support Inbox & Inquiries</h1>
          <p className="text-xs text-gray-500">Manage incoming WhatsApp, Email, Web Chat, and AI interactions in real-time.</p>
        </div>

        {/* Channel Filter Pills */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl border border-gray-200 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setChannelFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${channelFilter === 'all' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'}`}
          >
            All ({tickets.length})
          </button>
          <button
            onClick={() => setChannelFilter('whatsapp')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${channelFilter === 'whatsapp' ? 'bg-emerald-700 text-white shadow-xs' : 'text-gray-600 hover:text-emerald-700'}`}
          >
            <Phone size={12} /> WhatsApp
          </button>
          <button
            onClick={() => setChannelFilter('email')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${channelFilter === 'email' ? 'bg-blue-600 text-white shadow-xs' : 'text-gray-600 hover:text-blue-600'}`}
          >
            <Mail size={12} /> Email
          </button>
          <button
            onClick={() => setChannelFilter('webchat')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${channelFilter === 'webchat' ? 'bg-purple-600 text-white shadow-xs' : 'text-gray-600 hover:text-purple-600'}`}
          >
            <MessageSquare size={12} /> Web Chat
          </button>
          <button
            onClick={() => setChannelFilter('aibot')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${channelFilter === 'aibot' ? 'bg-gray-800 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'}`}
          >
            <Bot size={12} /> AI Logs
          </button>
        </div>
      </div>

      {/* Main Edge-to-Edge Split Pane */}
      <div className="flex flex-1 overflow-hidden w-full">
        
        {/* Left List Pane */}
        <div className="w-full md:w-80 lg:w-96 border-r border-gray-200 bg-white overflow-y-auto shrink-0 flex flex-col">
          
          {/* Search Bar & Status Filter */}
          <div className="p-3 border-b border-gray-100 space-y-2 bg-gray-50/50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ticket name, company..." 
                className="pl-8 pr-3 py-1.5 bg-white border border-gray-200 rounded-xl focus:border-emerald-600 outline-none text-xs w-full font-medium"
              />
            </div>
            
            <div className="flex gap-1">
              {['all', 'open', 'pending', 'resolved'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st as any)}
                  className={`flex-1 py-1 rounded-lg text-[11px] font-bold capitalize transition-colors ${statusFilter === st ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Ticket List Items */}
          <div className="divide-y divide-gray-100 flex-1 overflow-y-auto">
            {filteredTickets.map((ticket) => (
              <button 
                key={ticket.id}
                onClick={() => {
                  setActiveTicketId(ticket.id);
                  setTickets(prev => prev.map(t => t.id === ticket.id ? { ...t, unread: false } : t));
                }}
                className={`w-full text-left p-3.5 hover:bg-gray-50 transition-all relative border-l-4 cursor-pointer
                  ${activeTicketId === ticket.id ? 'bg-emerald-50/50 border-emerald-700' : 'border-transparent'}
                `}
              >
                <div className="flex items-center justify-between mb-1">
                  {getChannelBadge(ticket.channel)}
                  <span className="text-[10px] text-gray-400 font-medium">{ticket.timestamp}</span>
                </div>

                <div className="flex justify-between items-baseline mb-0.5">
                  <span className="text-xs font-bold text-gray-900">{ticket.name}</span>
                  {ticket.unread && <span className="w-2 h-2 rounded-full bg-emerald-600"></span>}
                </div>

                <div className="text-[11px] text-emerald-700 font-semibold mb-1">{ticket.company}</div>
                
                <div className="text-xs text-gray-600 line-clamp-1 mb-2">
                  {ticket.subject}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
                    <MapPin size={10} className="text-gray-400" />
                    {ticket.location}
                  </span>
                  <span className="text-[10px] font-bold text-gray-700 uppercase bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">
                    Lead: {ticket.leadStatus}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Middle Chat Stream */}
        <div className="flex-1 bg-white flex flex-col h-full overflow-hidden border-r border-gray-200">
          
          {/* Detail Header with Lead Status Dropdown & Add to CRM Action */}
          <div className="p-4 bg-white border-b border-gray-200 flex flex-col lg:flex-row lg:items-center justify-between gap-3 shrink-0">
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-gray-900">{activeTicket.subject}</h2>
                {getChannelBadge(activeTicket.channel)}
              </div>
              <div className="flex items-center space-x-2 mt-0.5 text-xs text-gray-500">
                <span className="font-semibold text-gray-800">{activeTicket.name}</span>
                <span>•</span>
                <span>{activeTicket.company}</span>
                <span>•</span>
                <span className="text-emerald-700 font-medium">{activeTicket.contact}</span>
              </div>
            </div>

            {/* Lead Status Dropdown & Actions Header */}
            <div className="flex flex-wrap items-center gap-2">
              
              {/* Lead Status Dropdown Selector */}
              <div className="flex items-center space-x-1.5 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200">
                <span className="text-xs font-bold text-gray-600">Lead Status:</span>
                <select
                  value={activeTicket.leadStatus}
                  onChange={(e) => handleLeadStatusChange(e.target.value as any)}
                  className="bg-transparent text-xs font-bold text-emerald-800 outline-none cursor-pointer"
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="closed">Closed (Won)</option>
                  <option value="lost">Lost</option>
                </select>
              </div>

              {/* Add to CRM Button */}
              {!activeTicket.inCrm ? (
                <button
                  onClick={handleAddToCrm}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl transition-colors shadow-2xs cursor-pointer"
                >
                  <UserPlus size={13} />
                  <span>Add to Leads CRM</span>
                </button>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200">
                  <Check size={13} />
                  <span>In Leads CRM</span>
                </span>
              )}

              {/* Ticket Status Toggles */}
              <div className="flex items-center gap-1 border-l border-gray-200 pl-2">
                {(['open', 'pending', 'resolved'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => handleToggleStatus(st)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${activeTicket.status === st ? 'bg-gray-900 text-white shadow-xs' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-gray-50/50">
            {activeTicket.messages.map((m) => (
              <div 
                key={m.id} 
                className={`flex gap-3 max-w-2xl ${m.sender === 'admin' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                  m.sender === 'admin' 
                    ? 'bg-gray-900 text-white' 
                    : m.sender === 'ai' 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                    : 'bg-white text-gray-800 border border-gray-200'
                }`}>
                  {m.sender === 'admin' ? 'GW' : m.sender === 'ai' ? <Bot size={15} /> : <User size={15} />}
                </div>

                <div className="space-y-1">
                  <div className={`flex items-baseline space-x-2 text-[11px] ${m.sender === 'admin' ? 'justify-end' : ''}`}>
                    <span className="font-bold text-gray-900">{m.senderName}</span>
                    <span className="text-gray-400">{m.timestamp}</span>
                  </div>
                  <div className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    m.sender === 'admin'
                      ? 'bg-emerald-700 text-white rounded-tr-xs shadow-2xs'
                      : m.sender === 'ai'
                      ? 'bg-emerald-50 text-emerald-950 border border-emerald-200 rounded-tl-xs shadow-2xs'
                      : 'bg-white text-gray-800 border border-gray-200 rounded-tl-xs shadow-2xs'
                  }`}>
                    {m.text}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Reply Box */}
          <form onSubmit={handleSendReply} className="p-3 bg-white border-t border-gray-200 shrink-0">
            <div className="relative flex items-center">
              <input 
                type="text" 
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Reply to ${activeTicket.name}...`}
                className="w-full pl-4 pr-24 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-600 outline-none text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 transition-all font-medium"
              />
              <div className="absolute right-2 flex items-center space-x-1">
                <button type="button" className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                  <Paperclip size={16} />
                </button>
                <button 
                  type="submit" 
                  disabled={!replyText.trim()}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white text-xs font-semibold rounded-lg transition-colors flex items-center space-x-1.5 shadow-2xs"
                >
                  <span>Send</span>
                  <Send size={13} />
                </button>
              </div>
            </div>
          </form>

        </div>

        {/* Customer & Lead Inspector Pane (Right Pane) */}
        <div className="hidden lg:block w-72 bg-white p-5 overflow-y-auto shrink-0 space-y-6">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-3">Customer Inspector</span>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gray-900 text-white font-bold flex items-center justify-center text-sm">
                {activeTicket.name.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h4 className="font-bold text-sm text-gray-900">{activeTicket.name}</h4>
                <p className="text-xs text-gray-500">{activeTicket.company}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-gray-100 text-xs">
            <div>
              <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block">Channel Source</span>
              <span className="font-semibold text-gray-800 capitalize mt-0.5 block">{activeTicket.channel}</span>
            </div>
            <div>
              <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block">Lead Status</span>
              <select
                value={activeTicket.leadStatus}
                onChange={(e) => handleLeadStatusChange(e.target.value as any)}
                className="w-full mt-1 p-2 bg-gray-50 border border-gray-200 rounded-xl font-bold text-emerald-800 text-xs outline-none focus:border-emerald-600"
              >
                <option value="new">New Lead</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="closed">Closed (Won)</option>
                <option value="lost">Lost</option>
              </select>
            </div>
            <div>
              <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block">Contact Information</span>
              <span className="font-semibold text-emerald-700 mt-0.5 block">{activeTicket.contact}</span>
            </div>
            <div>
              <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block">District Location</span>
              <span className="font-semibold text-gray-800 mt-0.5 block">{activeTicket.location || 'Bangladesh'}</span>
            </div>
          </div>

          {/* Quick Direct Actions */}
          <div className="space-y-2 pt-4 border-t border-gray-100">
            <a
              href={`tel:${activeTicket.contact}`}
              className="w-full flex items-center justify-center space-x-2 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs rounded-xl border border-emerald-200 transition-colors"
            >
              <Phone size={13} />
              <span>Call Customer</span>
            </a>
            <a
              href={`mailto:${activeTicket.contact}`}
              className="w-full flex items-center justify-center space-x-2 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-xs rounded-xl border border-gray-200 transition-colors"
            >
              <Mail size={13} />
              <span>Send Direct Email</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
