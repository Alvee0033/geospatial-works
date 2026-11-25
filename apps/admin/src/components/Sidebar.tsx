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
  MessageSquareText,
  PanelLeftClose,
  PanelLeftOpen,
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
  | 'inbox'
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

interface NavItem {
  id: AdminTab;
  label: string;
  icon: React.ReactNode;
  count?: number;
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
  const groups: { label: string; items: NavItem[] }[] = [
    {
      label: 'Overview',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
      ],
    },
    {
      label: 'Website Content',
      items: [
        { id: 'landing', label: 'Homepage', icon: <MonitorPlay size={16} /> },
        { id: 'projects', label: 'Projects', icon: <FolderKanban size={16} />, count: projectsCount },
        { id: 'services', label: 'Services', icon: <Sliders size={16} />, count: servicesCount },
        { id: 'news', label: 'News & Articles', icon: <Newspaper size={16} />, count: articlesCount },
        { id: 'about', label: 'About Us', icon: <Building2 size={16} /> },
      ],
    },
    {
      label: 'Team & Enquiries',
      items: [
        { id: 'team', label: 'Team & CVs', icon: <Users size={16} />, count: teamCount },
        { id: 'careers', label: 'Careers', icon: <Briefcase size={16} />, count: jobsCount + applicationsCount },
        { id: 'inquiries', label: 'Enquiries', icon: <Mail size={16} />, count: inquiriesCount },
        { id: 'inbox', label: 'Messages', icon: <MessageSquareText size={16} /> },
      ],
    },
    {
      label: 'System',
      items: [
        { id: 'settings', label: 'Settings', icon: <ShieldCheck size={16} /> },
      ],
    },
  ];

  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <aside className={`${collapsed ? 'w-[68px]' : 'w-60'} shrink-0 bg-slate-950 text-slate-300 flex flex-col border-r border-slate-800/80 select-none transition-all duration-200`}>
      {/* Brand + Collapse Toggle */}
      <div className={`h-16 ${collapsed ? 'px-2 justify-center' : 'px-4 justify-between'} flex items-center gap-2 border-b border-slate-800/80 shrink-0`}>
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-white p-1 flex items-center justify-center shrink-0">
            <img src="/logo.png" alt="Geospatial Works" className="h-6 w-6 object-contain" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-xs font-bold text-white tracking-tight truncate">Geospatial Works</p>
              <p className="text-[10px] text-slate-400 font-medium">Admin Console</p>
            </div>
          )}
        </div>
        {!collapsed && (
          <button
            type="button"
            onClick={() => setCollapsed(true)}
            title="Collapse sidebar"
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition cursor-pointer shrink-0"
          >
            <PanelLeftClose size={15} />
          </button>
        )}
      </div>
      {collapsed && (
        <div className="px-2 pt-2 flex justify-center">
          <button
            type="button"
            onClick={() => setCollapsed(false)}
            title="Expand sidebar"
            className="w-full py-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition cursor-pointer flex justify-center"
          >
            <PanelLeftOpen size={15} />
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className={`flex-1 overflow-y-auto ${collapsed ? 'px-2' : 'px-3'} py-4 space-y-5`}>
        {groups.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p className="px-2.5 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    title={collapsed ? item.label : undefined}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center ${collapsed ? 'justify-center px-2' : 'justify-between px-2.5'} gap-2 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
                      isActive
                        ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                        : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-2.5 min-w-0">
                      <span className={isActive ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </span>
                    {!collapsed && typeof item.count === 'number' && item.count > 0 && (
                      <span
                        className={`px-1.5 py-0.5 rounded-md text-[10px] font-semibold tabular-nums ${
                          isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Footer */}
      {currentUser && (
        <div className="p-3 border-t border-slate-800/80 bg-slate-900/50">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{currentUser.name || 'Admin'}</p>
              <p className="text-[10px] text-slate-400 truncate">{currentUser.email}</p>
            </div>
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition cursor-pointer shrink-0"
                title="Sign out"
              >
                <LogOut size={15} />
              </button>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
