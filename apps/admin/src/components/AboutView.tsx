'use client';

import React, { useState } from 'react';
import { ArrowUpRight, X } from 'lucide-react';
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
import { ServiceItem } from './ServiceModal';
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
  services: ServiceItem[];
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
  services,
  loading,
  searchQuery,
  onNavigateToProjects,
  onSaveWysiwygSection,
  onOpenMediaPicker,
  triggerFeedback,
}: AboutViewProps) {
  const [subTab, setSubTab] = useState<AboutSubTab>('our-story');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewVersion, setPreviewVersion] = useState(0);

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
      label: 'Instruments & Facilities',
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

        <button type="button" onClick={() => setPreviewOpen(true)} className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-800">
          Preview actual page <ArrowUpRight size={14} />
        </button>
      </div>

      {previewOpen && <div className="fixed inset-0 z-[75] flex items-center justify-center bg-slate-950/60 p-3 sm:p-6">
        <section role="dialog" aria-modal="true" aria-labelledby="about-preview-title" className="flex h-[min(92vh,1050px)] w-full max-w-[1400px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
          <header className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 sm:px-5">
            <div><h2 id="about-preview-title" className="text-sm font-semibold text-slate-950">Actual page preview</h2><p className="mt-0.5 text-xs text-slate-500">Save your edits, then refresh to see the published page.</p></div>
            <div className="flex items-center gap-2"><button type="button" onClick={() => setPreviewVersion((version) => version + 1)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50">Refresh preview</button><button type="button" onClick={() => setPreviewOpen(false)} aria-label="Close preview" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X size={17} /></button></div>
          </header>
          <iframe key={previewVersion} title="Actual public About page" src={`${process.env.NEXT_PUBLIC_SITE_PREVIEW_URL || 'http://localhost:3001'}${subMenus.find((item) => item.id === subTab)?.route || '/about/our-story'}`} className="min-h-0 flex-1 border-0 bg-white" />
        </section>
      </div>}

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
          services={services}
          onSaveSection={onSaveWysiwygSection}
          onOpenMediaPicker={onOpenMediaPicker}
          triggerFeedback={triggerFeedback}
        />
      )}
    </div>
  );
}
