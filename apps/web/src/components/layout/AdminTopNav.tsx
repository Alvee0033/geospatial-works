'use client';

import React, { useState, useEffect } from 'react';
import { Search, Bell, Settings, Plus, RefreshCw, Download } from 'lucide-react';
import Link from 'next/link';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { NotificationPanel } from './NotificationPanel';
import { ProfileDropdown } from './ProfileDropdown';

interface TopNavProps {
  title?: string;
  subtitle?: string;
  onRefresh?: () => void;
  onExport?: () => void;
  isRefreshing?: boolean;
}

export const AdminTopNav: React.FC<TopNavProps> = ({
  title,
  subtitle,
  onRefresh,
  onExport,
  isRefreshing = false,
}) => {
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('gw_user');
      if (stored) {
        setCurrentUser(JSON.parse(stored));
      }
    } catch {}
  }, []);

  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-2.5">
      <div className="flex min-w-0 items-center gap-4">
        <div className="hidden items-center gap-2 border-r border-slate-200 pr-4 lg:flex">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-xs font-bold text-slate-700">Workspace</span>
          <span className="text-slate-300">/</span>
          <span className="text-xs font-medium text-slate-400">{title}</span>
        </div>
        <div className="relative flex items-center">
          <Search size={14} className="pointer-events-none absolute left-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search"
            aria-label="Search workspace"
            className="w-44 rounded-md border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs font-medium text-slate-800 placeholder-slate-400 transition-all focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/10 sm:w-56"
          />
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        {onRefresh && (
          <button
            onClick={onRefresh}
            title="Refresh Live DB Data"
            className="rounded-md p-2 text-emerald-700 transition-colors hover:bg-emerald-50"
          >
            <RefreshCw size={15} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
        )}

        {onExport && currentUser && currentUser.role !== 'project_member' && (
          <button
            onClick={onExport}
            title="Export Report"
            className="hidden rounded-md p-2 text-sky-700 transition-colors hover:bg-sky-50 sm:block"
          >
            <Download size={15} />
          </button>
        )}

        {/* Notifications Bell & Panel */}
        <NotificationPanel />

        {/* Settings Gear */}
        {currentUser && currentUser.role !== 'project_member' && <Link
          href="/settings"
          className="hidden rounded-md p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 sm:block"
          title="System Settings"
        >
          <Settings size={15} />
        </Link>}

        {/* Profile Pill with Settings & Edit Modal */}
        <ProfileDropdown
          currentUser={currentUser}
          onUserUpdate={(updated) => setCurrentUser(updated)}
        />


        {/* Add Widget Button */}
        {currentUser && currentUser.role !== 'project_member' && <Link
          href="/projects/new"
          className="ml-1 flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white transition-all hover:bg-emerald-700"
        >
          <Plus size={14} />
          <span className="hidden sm:inline">New project</span>
        </Link>}
      </div>
    </header>
  );
};
