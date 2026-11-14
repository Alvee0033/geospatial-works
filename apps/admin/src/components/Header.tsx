'use client';

import React from 'react';
import { ArrowUpRight, Globe, Plus, RefreshCw, Search } from 'lucide-react';
import { AdminTab } from './Sidebar';

interface HeaderProps {
  activeTab: AdminTab;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenCreateProjectModal: () => void;
  onOpenCreateServiceModal: () => void;
  onOpenCreateNewsModal: () => void;
  onOpenCreateTeamModal?: () => void;
  onOpenCreateJobModal?: () => void;
  onRefreshData?: () => void;
  loading?: boolean;
  onPurgeCache: () => void;
  revalidating: boolean;
}

const pageInfo: Record<AdminTab, { title: string; description: string; url: string }> = {
  dashboard: { title: 'Overview', description: 'A quick look at your website content.', url: '/' },
  landing: { title: 'Homepage', description: 'Update the sections visitors see first.', url: '/' },
  team: { title: 'Team', description: 'Manage people and their profiles.', url: '/team' },
  projects: { title: 'Projects', description: 'Manage the projects shown on the website.', url: '/projects' },
  services: { title: 'Services', description: 'Manage the services your team provides.', url: '/services' },
  news: { title: 'News and articles', description: 'Publish updates and project stories.', url: '/insights' },
  about: { title: 'About', description: 'Update information about the company.', url: '/about' },
  careers: { title: 'Jobs and applications', description: 'Manage open roles and applications.', url: '/career' },
  inquiries: { title: 'Enquiries', description: 'Read and respond to messages sent through the website.', url: '/contact' },
  settings: { title: 'Settings', description: 'Manage access to the admin panel.', url: '/' },
};

export function Header({ activeTab, searchQuery, setSearchQuery, onOpenCreateProjectModal, onOpenCreateServiceModal, onOpenCreateNewsModal, onOpenCreateTeamModal, onOpenCreateJobModal, onRefreshData, loading = false, onPurgeCache, revalidating }: HeaderProps) {
  const info = pageInfo[activeTab];
  const createAction = {
    projects: { label: 'Add project', onClick: onOpenCreateProjectModal },
    services: { label: 'Add service', onClick: onOpenCreateServiceModal },
    news: { label: 'Add article', onClick: onOpenCreateNewsModal },
    team: { label: 'Add person', onClick: onOpenCreateTeamModal },
    careers: { label: 'Add job', onClick: onOpenCreateJobModal },
  }[activeTab];

  return (
    <header className="flex min-h-[76px] shrink-0 flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:px-6 lg:px-8">
      <div className="min-w-0">
        <h1 className="truncate text-lg font-semibold tracking-tight text-slate-950 sm:text-xl">{info.title}</h1>
        <p className="mt-0.5 hidden text-sm text-slate-500 sm:block">{info.description}</p>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <label className="relative hidden md:block">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="search" aria-label="Search this section" placeholder="Search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} className="w-44 rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 lg:w-56" />
        </label>
        <button type="button" onClick={onRefreshData} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60" title="Reload admin data from API">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /><span className="hidden lg:inline">{loading ? 'Reloading…' : 'Reload data'}</span>
        </button>
        <button type="button" onClick={onPurgeCache} disabled={revalidating} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60" title="Purge public cache">
          <Globe size={14} className={revalidating ? 'animate-spin' : ''} /><span className="hidden lg:inline">{revalidating ? 'Purging…' : 'Purge cache'}</span>
        </button>
        <a href={`${process.env.NEXT_PUBLIC_SITE_PREVIEW_URL || 'https://geospatialworks.com.bd'}${info.url}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
          <ArrowUpRight size={14} /><span className="hidden sm:inline">View live</span>
        </a>
        {createAction && <button type="button" onClick={createAction.onClick} className="inline-flex items-center gap-2 rounded-lg bg-[#F4382D] px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-red-700">
          <Plus size={15} /><span className="hidden sm:inline">{createAction.label}</span>
        </button>}
      </div>
    </header>
  );
}
