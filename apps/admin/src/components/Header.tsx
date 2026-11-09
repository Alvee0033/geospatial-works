'use client';

import React from 'react';
import { Search, Globe, ArrowUpRight, Zap, Plus, Users } from 'lucide-react';
import { AdminTab } from './Sidebar';

interface HeaderProps {
  activeTab: AdminTab;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenCreateProjectModal: () => void;
  onOpenCreateServiceModal: () => void;
  onOpenCreateNewsModal: () => void;
  onOpenCreateTeamModal?: () => void;
  onPurgeCache: () => void;
  revalidating: boolean;
}

export function Header({
  activeTab,
  searchQuery,
  setSearchQuery,
  onOpenCreateProjectModal,
  onOpenCreateServiceModal,
  onOpenCreateNewsModal,
  onOpenCreateTeamModal,
  onPurgeCache,
  revalidating,
}: HeaderProps) {
  const titles: Record<AdminTab, string> = {
    dashboard: 'Operations Dashboard',
    landing: 'Landing Page Customizer',
    team: 'Engineers, Architects & Leadership',
    projects: 'Projects & Landmarks',
    services: 'Services & Disciplines',
    news: 'News & Technical Bulletins',
    about: 'Who We Are · About Management',
    careers: 'Careers, Job Openings & Applications',
    inquiries: 'Leads & Client Enquiries',
    settings: 'Security, User Management & Access Control',
  };

  const subtitles: Record<AdminTab, string> = {
    dashboard: 'Executive summary of national projects, survey fleet, and active geodetic contracts',
    landing: 'Hero video/image banner, showcased services, landmark projects, instruments & homepage sections',
    team: 'Add, remove, and manage staff profiles, verified CV entries, degrees, and project credentials',
    projects: 'Add, edit, remove, and publish infrastructure projects across Bangladesh',
    services: 'Manage survey disciplines, geodata capabilities, and public service offerings',
    news: 'Publish case studies, field research updates, and press releases for public insights',
    about: 'Manage Story & Purpose, Future Ready Geodesy, Safety, National Impact, and SOB Standards',
    careers: 'Add, edit, and remove job posts, and filter candidate applications per job or name',
    inquiries: 'Review, triage, and follow up on client RFQs, survey quotes, and inbound messages',
    settings: 'Provision user accounts, configure role permissions (RBAC), and manage workstation credentials',
  };

  const badges: Record<AdminTab, string> = {
    dashboard: 'Overview',
    landing: 'Homepage CMS',
    team: 'Personnel & CVs',
    projects: 'CMS Directory',
    services: 'Engineering Services',
    news: 'Press & Bulletins',
    about: 'Corporate Identity',
    careers: 'Talent Acquisition',
    inquiries: 'Dispatch Desk',
    settings: 'Security & IAM',
  };

  const liveHref: Record<AdminTab, string> = {
    dashboard: 'https://geospatialworks.com.bd',
    landing: 'https://geospatialworks.com.bd',
    team: 'https://geospatialworks.com.bd/team',
    projects: 'https://geospatialworks.com.bd/projects',
    services: 'https://geospatialworks.com.bd/services',
    news: 'https://geospatialworks.com.bd/insights',
    about: 'https://geospatialworks.com.bd/about',
    careers: 'https://geospatialworks.com.bd/career',
    inquiries: 'https://geospatialworks.com.bd/contact',
    settings: 'https://geospatialworks.com.bd',
  };

  return (
    <header className="h-20 bg-white border-b border-slate-200/70 px-8 flex items-center justify-between flex-shrink-0 shadow-[0_2px_10px_rgba(0,0,0,0.01)]">
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">{titles[activeTab]}</h1>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
            {badges[activeTab]}
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">{subtitles[activeTab]}</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Search Input */}
        <div className="relative">
          <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search... (⌘K)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-60 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:bg-white transition shadow-2xs"
          />
        </div>

        {/* Purge Cache Button */}
        <button
          onClick={onPurgeCache}
          disabled={revalidating}
          className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition shadow-2xs cursor-pointer"
          title="Purge Next.js static cache and revalidate live public pages"
        >
          <Zap size={13} className={revalidating ? 'animate-spin text-amber-500' : 'text-amber-500'} />
          <span>{revalidating ? 'Purging...' : 'Purge Cache'}</span>
        </button>

        {/* Live Website Link */}
        <a
          href={liveHref[activeTab]}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition shadow-2xs"
        >
          <Globe size={14} className="text-slate-500" />
          <span>Live Site</span>
          <ArrowUpRight size={13} className="text-slate-400" />
        </a>

        {/* Action Button */}
        {activeTab === 'team' ? (
          <button
            onClick={onOpenCreateTeamModal}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-indigo-200 hover:shadow-indigo-300 cursor-pointer"
          >
            <Plus size={15} />
            <span>+ Add Member</span>
          </button>
        ) : activeTab === 'services' ? (
          <button
            onClick={onOpenCreateServiceModal}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-indigo-200 hover:shadow-indigo-300 cursor-pointer"
          >
            <Plus size={15} />
            <span>+ New Service</span>
          </button>
        ) : activeTab === 'news' ? (
          <button
            onClick={onOpenCreateNewsModal}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-indigo-200 hover:shadow-indigo-300 cursor-pointer"
          >
            <Plus size={15} />
            <span>+ New Article</span>
          </button>
        ) : activeTab === 'settings' ? null : (
          <button
            onClick={onOpenCreateProjectModal}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-indigo-200 hover:shadow-indigo-300 cursor-pointer"
          >
            <Plus size={15} />
            <span>+ New Project</span>
          </button>
        )}
      </div>
    </header>
  );
}
