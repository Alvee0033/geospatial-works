'use client';

import React from 'react';
import { ArrowRight, BriefcaseBusiness, FolderKanban, Mail, Newspaper, Users } from 'lucide-react';
import { ProjectItem } from './ProjectsView';

interface DashboardViewProps {
  projects: ProjectItem[];
  inquiriesCount?: number;
  servicesCount?: number;
  articlesCount?: number;
  teamCount?: number;
  onNavigateToProjects: () => void;
  onNavigateToInquiries?: () => void;
  onOpenCreateModal: () => void;
}

export function DashboardView({
  projects,
  inquiriesCount = 0,
  servicesCount = 0,
  articlesCount = 0,
  teamCount = 0,
  onNavigateToProjects,
  onNavigateToInquiries,
  onOpenCreateModal,
}: DashboardViewProps) {
  const stats = [
    { label: 'Projects', count: projects.length, icon: FolderKanban, action: onNavigateToProjects, badge: 'Live' },
    { label: 'Services', count: servicesCount, icon: BriefcaseBusiness, badge: 'Catalog' },
    { label: 'Team Specialists', count: teamCount, icon: Users, badge: 'Staff' },
    { label: 'Articles & News', count: articlesCount, icon: Newspaper, badge: 'Insights' },
    { label: 'Client Inquiries', count: inquiriesCount, icon: Mail, action: onNavigateToInquiries, badge: inquiriesCount > 0 ? 'Action Req.' : 'Inbox' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map(({ label, count, icon: Icon, action, badge }) => (
          <button
            key={label}
            type="button"
            onClick={action}
            className={`flex flex-col justify-between p-4 rounded-xl border border-slate-200/90 bg-white text-left transition shadow-2xs ${
              action ? 'hover:border-slate-400 hover:shadow-xs cursor-pointer' : 'cursor-default'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-500">{label}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-medium">
                {badge}
              </span>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono tracking-tight text-slate-900">{count}</span>
              <Icon size={18} className="text-slate-400" />
            </div>
          </button>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-12">
        <section className="lg:col-span-8 overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-2xs">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-3.5">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent Projects</h3>
              <p className="text-xs text-slate-500">Recently catalogued surveying and GIS undertakings.</p>
            </div>
            <button
              type="button"
              onClick={onNavigateToProjects}
              className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-slate-700 hover:text-black cursor-pointer"
            >
              All projects <ArrowRight size={13} />
            </button>
          </div>
          {projects.length ? (
            <div className="divide-y divide-slate-100">
              {projects.slice(0, 5).map((project) => (
                <div key={project.id} className="flex min-w-0 items-center justify-between gap-3 px-5 py-3 hover:bg-slate-50/60 transition">
                  <div className="flex min-w-0 items-center gap-3">
                    {project.imageUrl ? (
                      <img src={project.imageUrl} alt="" className="h-10 w-14 shrink-0 rounded object-cover border border-slate-200/60" />
                    ) : (
                      <div className="flex h-10 w-14 shrink-0 items-center justify-center rounded bg-slate-100 text-slate-400">
                        <FolderKanban size={15} />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-slate-900">{project.title}</p>
                      <p className="mt-0.5 truncate text-[11px] text-slate-500 font-mono">
                        {[project.client, project.location].filter(Boolean).join(' · ') || project.category}
                      </p>
                    </div>
                  </div>
                  {project.isMilestone && (
                    <span className="shrink-0 text-[10px] font-semibold font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      Milestone
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="px-5 py-10 text-center text-xs text-slate-500">No projects recorded.</p>
          )}
        </section>

        <section className="lg:col-span-4 rounded-xl border border-slate-200/90 bg-white p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Direct Actions</h3>
            <p className="mt-0.5 text-xs text-slate-500">Quick shortcuts to content authoring.</p>
            <div className="mt-4 space-y-2">
              <button
                type="button"
                onClick={onOpenCreateModal}
                className="flex w-full items-center justify-between rounded-lg border border-slate-200 p-3 text-left transition hover:border-slate-400 hover:bg-slate-50 cursor-pointer"
              >
                <span>
                  <span className="block text-xs font-semibold text-slate-900">Publish New Project</span>
                  <span className="mt-0.5 block text-[11px] text-slate-500">Add deliverables, coordinates &amp; case study</span>
                </span>
                <FolderKanban size={16} className="text-slate-400 shrink-0 ml-2" />
              </button>

              {onNavigateToInquiries && (
                <button
                  type="button"
                  onClick={onNavigateToInquiries}
                  className="flex w-full items-center justify-between rounded-lg border border-slate-200 p-3 text-left transition hover:border-slate-400 hover:bg-slate-50 cursor-pointer"
                >
                  <span>
                    <span className="block text-xs font-semibold text-slate-900">Review Inbound Leads</span>
                    <span className="mt-0.5 block text-[11px] text-slate-500">{inquiriesCount} pending messages in Kanban/CRM</span>
                  </span>
                  <Mail size={16} className="text-slate-400 shrink-0 ml-2" />
                </button>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-400 font-mono">
            Platform: Geospatial Works CMS v2.4
          </div>
        </section>
      </div>
    </div>
  );
}
