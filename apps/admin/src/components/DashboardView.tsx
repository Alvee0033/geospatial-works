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

export function DashboardView({ projects, inquiriesCount = 0, servicesCount = 0, articlesCount = 0, teamCount = 0, onNavigateToProjects, onNavigateToInquiries, onOpenCreateModal }: DashboardViewProps) {
  const stats = [
    { label: 'Projects', count: projects.length, icon: FolderKanban, action: onNavigateToProjects },
    { label: 'Services', count: servicesCount, icon: BriefcaseBusiness },
    { label: 'Team members', count: teamCount, icon: Users },
    { label: 'News and articles', count: articlesCount, icon: Newspaper },
    { label: 'Enquiries', count: inquiriesCount, icon: Mail, action: onNavigateToInquiries },
  ];
  return (
    <div className="mx-auto max-w-[1440px] space-y-6">
      <section>
        <h2 className="text-xl font-semibold tracking-tight text-slate-950">Your website at a glance</h2>
        <p className="mt-1 text-sm text-slate-500">These numbers come from the content saved in the admin.</p>
      </section>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map(({ label, count, icon: Icon, action }) => <button key={label} type="button" onClick={action} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 text-left transition hover:border-blue-200 hover:shadow-sm">
          <span><span className="block text-sm text-slate-500">{label}</span><span className="mt-1 block text-2xl font-semibold tabular-nums text-slate-950">{count}</span></span>
          <Icon size={20} className="text-blue-700" />
        </button>)}
      </div>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.8fr)]">
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
            <div><h3 className="font-semibold text-slate-950">Recent projects</h3><p className="mt-0.5 text-sm text-slate-500">Latest projects saved in the admin.</p></div>
            <button type="button" onClick={onNavigateToProjects} className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-blue-700 hover:text-blue-900">All projects <ArrowRight size={15} /></button>
          </div>
          {projects.length ? <div className="divide-y divide-slate-100">
            {projects.slice(0, 5).map((project) => <div key={project.id} className="flex min-w-0 items-center gap-3 px-5 py-3.5">
              {project.imageUrl ? <img src={project.imageUrl} alt="" className="h-11 w-14 shrink-0 rounded-md object-cover" /> : <div className="flex h-11 w-14 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-400"><FolderKanban size={17} /></div>}
              <div className="min-w-0"><p className="truncate text-sm font-medium text-slate-900">{project.title}</p><p className="mt-0.5 truncate text-xs text-slate-500">{[project.client, project.location].filter(Boolean).join(' · ') || project.category}</p></div>
            </div>)}
          </div> : <p className="px-5 py-10 text-center text-sm text-slate-500">No projects have been added yet.</p>}
        </section>
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="font-semibold text-slate-950">Quick actions</h3>
          <p className="mt-0.5 text-sm text-slate-500">Common updates for your website.</p>
          <div className="mt-4 space-y-2">
            <button type="button" onClick={onOpenCreateModal} className="flex w-full items-center justify-between rounded-lg border border-slate-200 p-3.5 text-left transition hover:border-blue-200 hover:bg-blue-50/40"><span><span className="block text-sm font-medium text-slate-900">Add a project</span><span className="mt-0.5 block text-xs text-slate-500">Create a project page.</span></span><FolderKanban size={17} className="text-blue-700" /></button>
            {onNavigateToInquiries && <button type="button" onClick={onNavigateToInquiries} className="flex w-full items-center justify-between rounded-lg border border-slate-200 p-3.5 text-left transition hover:border-blue-200 hover:bg-blue-50/40"><span><span className="block text-sm font-medium text-slate-900">View enquiries</span><span className="mt-0.5 block text-xs text-slate-500">{inquiriesCount} messages received through the website.</span></span><Mail size={17} className="text-blue-700" /></button>}
          </div>
        </section>
      </div>
    </div>
  );
}
