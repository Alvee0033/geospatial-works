'use client';

import React, { useState } from 'react';
import {
  Compass,
  Sparkles,
  ShieldCheck,
  Award,
  Globe2,
} from 'lucide-react';
import { PageSectionItem } from './AboutSectionDrawer';
import { TeamMemberItem } from './TeamMemberDrawer';
import { ProjectItem } from './ProjectsView';
import { AboutWysiwygEditor, WysiwygPageId } from './AboutWysiwygEditor';

export type AboutSubTab =
  | 'our-story'
  | 'future-ready'
  | 'safety'
  | 'standards'
  | 'impact';

interface AboutViewProps {
  sections: Record<string, PageSectionItem>;
  teamMembers?: TeamMemberItem[];
  projects: ProjectItem[];
  loading: boolean;
  searchQuery: string;
  onOpenEditSectionDrawer?: (section: PageSectionItem) => void;
  onOpenCreateTeamDrawer?: () => void;
  onOpenEditTeamDrawer?: (member: TeamMemberItem) => void;
  onDeleteTeamMember?: (id: string, name: string) => void;
  onNavigateToProjects: () => void;
  onSaveWysiwygSection: (
    pageKey: string,
    sectionKey: string,
    title: string,
    subtitle: string,
    content: Record<string, any>
  ) => Promise<boolean>;
  onOpenMediaPicker: (callback: (url: string) => void) => void;
  triggerFeedback: (msg: string, type?: 'success' | 'error') => void;
}

export function AboutView({
  sections,
  projects,
  loading,
  searchQuery,
  onNavigateToProjects,
  onSaveWysiwygSection,
  onOpenMediaPicker,
  triggerFeedback,
}: AboutViewProps) {
  const [subTab, setSubTab] = useState<AboutSubTab>('our-story');

  // Sub-menu definitions (All 5 topical modules have full visual WYSIWYG matching public pages)
  const subMenus = [
    {
      id: 'our-story' as AboutSubTab,
      label: 'Our Story & Purpose',
      route: '/about/our-story',
      icon: Compass,
      badge: 'Story & Profile',
      pageKey: 'our-story',
      sectionKey: 'full_page_wysiwyg',
      isWysiwyg: true,
    },
    {
      id: 'future-ready' as AboutSubTab,
      label: 'Future Ready Geodesy',
      route: '/about/future-ready',
      icon: Sparkles,
      badge: 'Drone & Workstations',
      pageKey: 'future-ready',
      sectionKey: 'full_page_wysiwyg',
      isWysiwyg: true,
    },
    {
      id: 'safety' as AboutSubTab,
      label: 'Corporate Responsibility & Safety',
      route: '/about/corporate-responsibility',
      icon: ShieldCheck,
      badge: 'Zero-Harm & CAAB',
      pageKey: 'safety',
      sectionKey: 'full_page_wysiwyg',
      isWysiwyg: true,
    },
    {
      id: 'standards' as AboutSubTab,
      label: 'Quality Standards & SOB Compliance',
      route: '/about/standards',
      icon: Award,
      badge: 'SOB/BTM Datum',
      pageKey: 'standards',
      sectionKey: 'full_page_wysiwyg',
      isWysiwyg: true,
    },
    {
      id: 'impact' as AboutSubTab,
      label: 'Our National Impact',
      route: '/projects',
      icon: Globe2,
      badge: 'Selected Projects',
      pageKey: 'impact',
      sectionKey: 'full_page_wysiwyg',
      isWysiwyg: true,
    },
  ];

  return (
    <div className="space-y-4">
      {/* =========================================================================
          COMPACT SUB-NAVIGATION TABS (SLIM & PROPER)
          ========================================================================= */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-1 shadow-2xs flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none flex-1">
          {subMenus.map((item) => {
            const Icon = item.icon;
            const isActive = subTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setSubTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap flex-shrink-0 ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-[#3B82F6]' : 'text-slate-400'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Quick link to live page */}
        <a
          href={`http://localhost:3001${subMenus.find((s) => s.id === subTab)?.route || '/about/our-story'}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-slate-500 hover:text-indigo-600 rounded-md hover:bg-slate-50 transition shrink-0"
        >
          <span>View Live</span>
          <span className="text-[10px]">↗</span>
        </a>
      </div>

      {/* =========================================================================
          IN-PAGE WYSIWYG EDITOR FOR ALL 5 PAGES (MATCHES PUBLIC DESIGN 1:1)
          ========================================================================= */}
      {(subTab === 'our-story' ||
        subTab === 'future-ready' ||
        subTab === 'safety' ||
        subTab === 'standards' ||
        subTab === 'impact') && (
        <AboutWysiwygEditor
          pageId={subTab as WysiwygPageId}
          sections={sections}
          onSaveSection={onSaveWysiwygSection}
          onOpenMediaPicker={onOpenMediaPicker}
          triggerFeedback={triggerFeedback}
        />
      )}
    </div>
  );
}
