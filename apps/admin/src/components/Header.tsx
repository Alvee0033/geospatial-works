'use client';

import React, { useMemo, useRef, useState, useEffect } from 'react';
import { ArrowUpRight, Plus, RefreshCw, Search, Globe, X } from 'lucide-react';
import { AdminTab } from './Sidebar';
import { Button } from './ui';

export interface QuickSearchSuggestion {
  id: string;
  label: string;
  sublabel?: string;
  tab: AdminTab;
  group: 'Pages' | 'Projects' | 'Team' | 'Services' | 'Articles' | 'Enquiries';
}

interface HeaderProps {
  activeTab: AdminTab;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchSuggestions?: QuickSearchSuggestion[];
  onSelectTab?: (tab: AdminTab) => void;
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

const pageInfo: Record<AdminTab, { title: string; url: string }> = {
  dashboard: { title: 'Dashboard', url: '/' },
  landing: { title: 'Homepage', url: '/' },
  team: { title: 'Team & CVs', url: '/team' },
  projects: { title: 'Projects', url: '/projects' },
  services: { title: 'Services', url: '/services' },
  news: { title: 'News & Articles', url: '/insights' },
  about: { title: 'About Us', url: '/about' },
  careers: { title: 'Careers', url: '/career' },
  inquiries: { title: 'Enquiries', url: '/contact' },
  inbox: { title: 'Messages', url: '/contact' },
  settings: { title: 'Settings', url: '/' },
};

const PAGE_SUGGESTIONS: QuickSearchSuggestion[] = (Object.keys(pageInfo) as AdminTab[]).map((tab) => ({
  id: `page-${tab}`,
  label: pageInfo[tab].title,
  sublabel: `Go to ${pageInfo[tab].title}`,
  tab,
  group: 'Pages',
}));

export function Header({
  activeTab,
  searchQuery,
  setSearchQuery,
  searchSuggestions = [],
  onSelectTab,
  onOpenCreateProjectModal,
  onOpenCreateServiceModal,
  onOpenCreateNewsModal,
  onOpenCreateTeamModal,
  onOpenCreateJobModal,
  onRefreshData,
  loading = false,
  onPurgeCache,
  revalidating,
}: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const matches = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const pool = [...PAGE_SUGGESTIONS, ...searchSuggestions];
    if (!q) return PAGE_SUGGESTIONS.slice(0, 6);
    return pool
      .filter(
        (item) =>
          item.label.toLowerCase().includes(q) ||
          (item.sublabel || '').toLowerCase().includes(q) ||
          item.group.toLowerCase().includes(q)
      )
      .slice(0, 10);
  }, [searchQuery, searchSuggestions]);

  const info = pageInfo[activeTab];
  const createAction = {
    projects: { label: 'Add Project', onClick: onOpenCreateProjectModal },
    services: { label: 'Add Service', onClick: onOpenCreateServiceModal },
    news: { label: 'Add Article', onClick: onOpenCreateNewsModal },
    team: { label: 'Add Member', onClick: onOpenCreateTeamModal },
    careers: { label: 'Add Job', onClick: onOpenCreateJobModal },
  }[activeTab as string];

  const publicBaseUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.NODE_ENV === 'production' ? 'https://geospatialworks.com.bd' : 'http://localhost:3001');

  return (
    <header className="h-16 shrink-0 flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8 relative z-30">
      <div className="min-w-0 flex items-center gap-3">
        <h1 className="truncate text-base font-bold tracking-tight text-slate-900 sm:text-lg">
          {info.title}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        {/* Optimistic Quick Search with Suggested Results */}
        <div ref={containerRef} className="relative hidden md:block">
          <div className="relative">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              aria-label="Quick search"
              placeholder="Quick search..."
              value={searchQuery}
              onFocus={() => setDropdownOpen(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setDropdownOpen(true);
              }}
              className="w-52 lg:w-64 h-8 rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-7 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/15"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                aria-label="Clear search"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {dropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-80 rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden z-50">
              <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <span>{searchQuery.trim() ? 'Suggested Results' : 'Quick Jump'}</span>
                <span>{matches.length} found</span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {matches.length === 0 ? (
                  <div className="px-4 py-6 text-center text-xs text-slate-400">No matching items found.</div>
                ) : (
                  matches.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onSelectTab?.(item.tab);
                        if (item.group === 'Pages') {
                          setSearchQuery('');
                        } else {
                          setSearchQuery(item.label);
                        }
                        setDropdownOpen(false);
                      }}
                      className="w-full px-3.5 py-2.5 text-left hover:bg-indigo-50/70 transition flex items-center justify-between gap-2 cursor-pointer"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-900 truncate">{item.label}</p>
                        {item.sublabel && (
                          <p className="text-[11px] text-slate-500 truncate">{item.sublabel}</p>
                        )}
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold shrink-0">
                        {item.group}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {onRefreshData && (
          <Button
            size="sm"
            variant="secondary"
            onClick={onRefreshData}
            loading={loading}
            icon={<RefreshCw size={13} />}
            title="Reload data from server"
          >
            <span className="hidden lg:inline">Refresh</span>
          </Button>
        )}

        <Button
          size="sm"
          variant="secondary"
          onClick={onPurgeCache}
          loading={revalidating}
          icon={<Globe size={13} />}
          title="Publish & refresh public website cache"
        >
          <span className="hidden lg:inline">Sync Site</span>
        </Button>

        <a
          href={`${publicBaseUrl}${info.url}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center h-8 px-3 text-xs gap-1.5 rounded-lg font-semibold bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-2xs transition"
        >
          <span className="hidden sm:inline">View Site</span>
          <ArrowUpRight size={13} />
        </a>

        {createAction?.onClick && (
          <Button size="sm" onClick={createAction.onClick} icon={<Plus size={14} />}>
            {createAction.label}
          </Button>
        )}
      </div>
    </header>
  );
}
