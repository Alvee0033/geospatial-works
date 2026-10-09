"use client";

import React from 'react';
import Link from 'next/link';
import { 
  Users, 
  MessageSquare, 
  PenTool, 
  FileText, 
  ArrowUpRight, 
  Bot,
  Plus
} from 'lucide-react';

export default function AdminDashboard() {
  const stats = [
    { title: 'Total Leads', value: '1,248', change: '+14.2%', icon: Users },
    { title: 'Open Tickets', value: '18', change: '2 pending', icon: MessageSquare },
    { title: 'AI Conversations', value: '452', change: '89.4% auto-resolved', icon: Bot },
    { title: 'Published Articles', value: '24', change: 'Updated recently', icon: FileText },
  ];

  const recentLeads = [
    { id: '1', name: 'Tanvir Ahmed', company: 'Dhaka Infrastructure Ltd', service: 'UAV Drone Photogrammetry', status: 'New', time: '10 min ago' },
    { id: '2', name: 'Dr. Rafiqul Islam', company: 'BUET Research Team', service: 'Bathymetric Hydro Survey', status: 'New', time: '45 min ago' },
    { id: '3', name: 'Nasrin Sultana', company: 'Apex Real Estate', service: 'Mouza Map Digitizing', status: 'Contacted', time: '2h ago' },
    { id: '4', name: 'Kazi Mahmud', company: 'Kazi Logistics', service: 'Construction Site Layout', status: 'Closed', time: 'Yesterday' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Overview</h1>
          <p className="text-xs text-gray-500 mt-1">Manage website content, customer inquiries, support messages, and AI settings.</p>
        </div>

        <div className="flex items-center space-x-2">
          <Link 
            href="/admin/pages"
            className="flex items-center space-x-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            <PenTool size={14} />
            <span>Edit Page Content</span>
          </Link>
          <Link 
            href="/admin/support"
            className="flex items-center space-x-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            <MessageSquare size={14} />
            <span>Open Support Inbox</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-gray-500">{stat.title}</span>
                <div className="p-2 rounded-lg bg-gray-50 text-gray-700 border border-gray-100">
                  <Icon size={16} />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-[11px] text-gray-500 font-medium">{stat.change}</div>
            </div>
          );
        })}
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Recent Inquiries */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6 shadow-2xs space-y-4">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <h3 className="font-bold text-gray-900 text-sm">Recent Customer Inquiries</h3>
            <Link href="/admin/leads" className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1">
              <span>View All Leads</span>
              <ArrowUpRight size={13} />
            </Link>
          </div>

          <div className="divide-y divide-gray-100 text-xs">
            {recentLeads.map((lead) => (
              <div key={lead.id} className="py-3 flex items-center justify-between hover:bg-gray-50 p-2 rounded-xl transition-colors">
                <div>
                  <div className="font-bold text-gray-900 text-sm">{lead.name}</div>
                  <div className="text-[11px] text-gray-500">{lead.company} • <span className="text-emerald-700 font-medium">{lead.service}</span></div>
                </div>

                <div className="text-right space-y-1">
                  <span className="text-[11px] text-gray-400 block">{lead.time}</span>
                  <span className="inline-block px-2.5 py-0.5 bg-emerald-50 text-emerald-800 font-semibold rounded-full text-[10px] border border-emerald-200">
                    {lead.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Quick Admin Shortcuts */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-2xs space-y-4">
            <h3 className="font-bold text-gray-900 text-sm border-b border-gray-100 pb-3">Quick Actions</h3>
            
            <div className="space-y-2">
              <Link 
                href="/admin/leads"
                className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 text-gray-800 font-semibold text-xs rounded-xl border border-gray-200 transition-colors"
              >
                <div className="flex items-center space-x-2.5">
                  <Users size={16} className="text-gray-600" />
                  <span>Customer Leads & CRM</span>
                </div>
                <ArrowUpRight size={14} className="text-gray-400" />
              </Link>

              <Link 
                href="/admin/pages"
                className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 text-gray-800 font-semibold text-xs rounded-xl border border-gray-200 transition-colors"
              >
                <div className="flex items-center space-x-2.5">
                  <PenTool size={16} className="text-gray-600" />
                  <span>Website Content Editor</span>
                </div>
                <ArrowUpRight size={14} className="text-gray-400" />
              </Link>

              <Link 
                href="/admin/ai-settings"
                className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 text-gray-800 font-semibold text-xs rounded-xl border border-gray-200 transition-colors"
              >
                <div className="flex items-center space-x-2.5">
                  <Bot size={16} className="text-gray-600" />
                  <span>AI Assistant Settings</span>
                </div>
                <ArrowUpRight size={14} className="text-gray-400" />
              </Link>

              <Link 
                href="/admin/blog"
                className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 text-gray-800 font-semibold text-xs rounded-xl border border-gray-200 transition-colors"
              >
                <div className="flex items-center space-x-2.5">
                  <FileText size={16} className="text-gray-600" />
                  <span>Blog & Articles</span>
                </div>
                <ArrowUpRight size={14} className="text-gray-400" />
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
