'use client';

import React from 'react';
import Image from 'next/image';
import {
  LayoutDashboard,
  FolderKanban,
  Sliders,
  Newspaper,
  Building2,
  Users,
  Briefcase,
  MonitorPlay,
  ShieldCheck,
  LogOut,
  Mail,
} from 'lucide-react';

export type AdminTab =
  | 'dashboard'
  | 'landing'
  | 'projects'
  | 'services'
  | 'news'
  | 'about'
  | 'team'
  | 'careers'
  | 'inquiries'
  | 'settings';

interface SidebarProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  projectsCount: number;
  servicesCount: number;
  articlesCount: number;
  teamCount?: number;
  jobsCount?: number;
  applicationsCount?: number;
  inquiriesCount?: number;
  currentUser?: { id: string; email: string; name: string; role: string } | null;
  onLogout?: () => void;
}

export function Sidebar({
  activeTab,
  setActiveTab,
  projectsCount,
  servicesCount,
  articlesCount,
  teamCount = 0,
  jobsCount = 0,
  applicationsCount = 0,
  inquiriesCount = 0,
  currentUser,
  onLogout,
}: SidebarProps) {
  return (
    <aside className="w-64 flex-shrink-0 bg-white border-r border-slate-200/80 flex flex-col justify-between select-none shadow-[2px_0_12px_rgba(0,0,0,0.02)] z-20">
      <div className="p-5">
        {/* Logo & Brand Header */}
        <div className="flex items-center gap-3 mb-8 px-2">
          <Image
            src="/gw-logo-pure-original.png"
            alt="Geospatial Works"
            width={44}
            height={44}
            priority
            className="h-10 w-10 shrink-0 object-contain"
          />
          <div>
            <h2 className="text-sm font-bold text-slate-900 leading-tight">Geospatial Works</h2>
            <p className="text-[11px] text-slate-400 font-medium">Admin Portal</p>
          </div>
        </div>

        {/* Clean Navigation Links */}
        <nav className="space-y-1.5">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">Main Menu</div>

          {/* Dashboard Item */}
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-indigo-50 text-indigo-600 border-l-4 border-indigo-600 shadow-xs'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <LayoutDashboard size={16} />
              <span>Dashboard</span>
            </div>
          </button>

          {/* Landing Page Item (Right under Dashboard) */}
          <button
            onClick={() => setActiveTab('landing')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === 'landing'
                ? 'bg-indigo-50 text-indigo-600 border-l-4 border-indigo-600 shadow-xs'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <MonitorPlay size={16} />
              <span>Homepage</span>
            </div>
            <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
              CMS
            </span>
          </button>

          {/* Team & Leadership Item */}
          <button
            onClick={() => setActiveTab('team')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === 'team'
                ? 'bg-indigo-50 text-indigo-600 border-l-4 border-indigo-600 shadow-xs'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Users size={16} />
              <span>Team</span>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-bold border border-indigo-200/60">
              {teamCount}
            </span>
          </button>

          {/* Projects Item */}
          <button
            onClick={() => setActiveTab('projects')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === 'projects'
                ? 'bg-indigo-50 text-indigo-600 border-l-4 border-indigo-600 shadow-xs'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <FolderKanban size={16} />
              <span>Projects</span>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold border border-slate-200/60">
              {projectsCount}
            </span>
          </button>

          {/* Services Item */}
          <button
            onClick={() => setActiveTab('services')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === 'services'
                ? 'bg-indigo-50 text-indigo-600 border-l-4 border-indigo-600 shadow-xs'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Sliders size={16} />
              <span>Services</span>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold border border-slate-200/60">
              {servicesCount}
            </span>
          </button>

          {/* News & Bulletins Item */}
          <button
            onClick={() => setActiveTab('news')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === 'news'
                ? 'bg-indigo-50 text-indigo-600 border-l-4 border-indigo-600 shadow-xs'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Newspaper size={16} />
              <span>News</span>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold border border-slate-200/60">
              {articlesCount}
            </span>
          </button>

          {/* About / Who We Are Item */}
          <button
            onClick={() => setActiveTab('about')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === 'about'
                ? 'bg-indigo-50 text-indigo-600 border-l-4 border-indigo-600 shadow-xs'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Building2 size={16} />
              <span>About</span>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold border border-slate-200/60">
              5
            </span>
          </button>

          {/* Careers & Applications Item */}
          <button
            onClick={() => setActiveTab('careers')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === 'careers'
                ? 'bg-[#F4382D]/10 text-[#F4382D] border-l-4 border-[#F4382D] shadow-xs'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Briefcase size={16} />
              <span>Jobs</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-red-100 text-[#F4382D] font-bold">
                {jobsCount}
              </span>
              {applicationsCount > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-indigo-100 text-indigo-700 font-bold" title="Applicants">
                  {applicationsCount}
                </span>
              )}
            </div>
          </button>

          {/* Client Inquiries & Contact Leads Item */}
          <button
            onClick={() => setActiveTab('inquiries')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === 'inquiries'
                ? 'bg-indigo-50 text-indigo-600 border-l-4 border-indigo-600 shadow-xs'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Mail size={16} />
              <span>Enquiries</span>
            </div>
            {inquiriesCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-bold border border-indigo-200/60">
                {inquiriesCount}
              </span>
            )}
          </button>

          <div className="pt-2">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">System</div>
            {/* Settings & User Management Item */}
            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-indigo-50 text-indigo-600 border-l-4 border-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck size={16} className={activeTab === 'settings' ? 'text-indigo-600' : 'text-slate-500'} />
                <span>Settings &amp; Access</span>
              </div>
              <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 font-bold">
                RBAC
              </span>
            </button>
          </div>
        </nav>
      </div>

      {/* Sidebar Footer with Active User Session & Logout */}
      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-xs">
              {currentUser?.name
                ? currentUser.name
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase()
                : 'GW'}
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-slate-800 truncate">
                {currentUser?.name || 'System Admin'}
              </h4>
              <p className="text-[10px] text-slate-400 truncate">
                {currentUser?.email || 'admin@geospatialworks.com.bd'}
              </p>
              <div className="mt-0.5 flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-[9px] font-bold uppercase text-indigo-600 tracking-wider">
                  {currentUser?.role || 'ADMIN'}
                </span>
              </div>
            </div>
          </div>
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
              title="Sign Out Session"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
