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
        <nav className="space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">Main Menu</div>

          {/* Dashboard Item */}
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <LayoutDashboard size={15} />
              <span>Overview</span>
            </div>
          </button>

          {/* Landing Page Item */}
          <button
            onClick={() => setActiveTab('landing')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === 'landing'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <MonitorPlay size={15} />
              <span>Homepage</span>
            </div>
          </button>

          {/* Team & Leadership Item */}
          <button
            onClick={() => setActiveTab('team')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === 'team'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Users size={15} />
              <span>Team &amp; Personnel</span>
            </div>
            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${activeTab === 'team' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
              {teamCount}
            </span>
          </button>

          {/* Projects Item */}
          <button
            onClick={() => setActiveTab('projects')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === 'projects'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <FolderKanban size={15} />
              <span>Projects</span>
            </div>
            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${activeTab === 'projects' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
              {projectsCount}
            </span>
          </button>

          {/* Services Item */}
          <button
            onClick={() => setActiveTab('services')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === 'services'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Sliders size={15} />
              <span>Services</span>
            </div>
            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${activeTab === 'services' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
              {servicesCount}
            </span>
          </button>

          {/* News & Articles Item */}
          <button
            onClick={() => setActiveTab('news')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === 'news'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Newspaper size={15} />
              <span>Articles &amp; News</span>
            </div>
            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${activeTab === 'news' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
              {articlesCount}
            </span>
          </button>

          {/* About / Pages Item */}
          <button
            onClick={() => setActiveTab('about')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === 'about'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Building2 size={15} />
              <span>About Pages</span>
            </div>
            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${activeTab === 'about' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
              5
            </span>
          </button>

          {/* Careers & Applications Item */}
          <button
            onClick={() => setActiveTab('careers')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === 'careers'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Briefcase size={15} />
              <span>Careers &amp; Jobs</span>
            </div>
            <div className="flex items-center gap-1">
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${activeTab === 'careers' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {jobsCount}
              </span>
              {applicationsCount > 0 && (
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${activeTab === 'careers' ? 'bg-white/30 text-white' : 'bg-blue-100 text-blue-700 font-semibold'}`} title="Applications received">
                  {applicationsCount}
                </span>
              )}
            </div>
          </button>

          {/* Client Inquiries & Contact Leads Item */}
          <button
            onClick={() => setActiveTab('inquiries')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === 'inquiries'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Mail size={15} />
              <span>Enquiries</span>
            </div>
            {inquiriesCount > 0 && (
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${activeTab === 'inquiries' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800 font-semibold'}`}>
                {inquiriesCount}
              </span>
            )}
          </button>

          <div className="pt-3">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">System</div>
            {/* Settings & User Management Item */}
            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck size={15} />
                <span>Settings &amp; Access</span>
              </div>
            </button>
          </div>
        </nav>
      </div>

      {/* Sidebar Footer with Active User Session & Logout */}
      <div className="p-3 border-t border-slate-100">
        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200/70">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-md bg-slate-900 text-white flex items-center justify-center font-bold text-[11px] flex-shrink-0">
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
              <h4 className="text-xs font-semibold text-slate-900 truncate">
                {currentUser?.name || 'Administrator'}
              </h4>
              <p className="text-[10px] text-slate-500 truncate">
                {currentUser?.email || 'admin@geospatialworks.com.bd'}
              </p>
            </div>
          </div>
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 transition cursor-pointer"
              title="Sign Out"
            >
              <LogOut size={14} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
