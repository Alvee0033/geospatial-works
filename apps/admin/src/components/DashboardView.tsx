'use client';

import React, { useMemo } from 'react';
import {
  ArrowRight,
  Briefcase,
  BriefcaseBusiness,
  FolderKanban,
  Mail,
  MessageSquareText,
  Newspaper,
  Plus,
  Users,
} from 'lucide-react';
import { ProjectItem } from './ProjectsView';
import { ServiceItem } from './ServiceModal';
import { ArticleItem } from './NewsModal';
import { TeamMemberItem } from './TeamMemberDrawer';
import { JobPostItem } from './JobModal';
import { ApplicationItem } from './CareersView';
import { InquiryItem } from './LeadsView';
import { AdminTab } from './Sidebar';
import { Button, Badge, Card, PageHeader } from './ui';

interface DashboardViewProps {
  projects: ProjectItem[];
  services?: ServiceItem[];
  articles?: ArticleItem[];
  teamMembers?: TeamMemberItem[];
  jobs?: JobPostItem[];
  applications?: ApplicationItem[];
  inquiries?: InquiryItem[];
  inquiriesCount?: number;
  servicesCount?: number;
  articlesCount?: number;
  teamCount?: number;
  onNavigateToProjects: () => void;
  onNavigateToInquiries?: () => void;
  onNavigateTab?: (tab: AdminTab) => void;
  onOpenCreateModal: () => void;
}

export function DashboardView({
  projects,
  services = [],
  articles = [],
  teamMembers = [],
  jobs = [],
  applications = [],
  inquiries = [],
  inquiriesCount,
  servicesCount,
  articlesCount,
  teamCount,
  onNavigateToProjects,
  onNavigateToInquiries,
  onNavigateTab,
  onOpenCreateModal,
}: DashboardViewProps) {
  const totalServices = servicesCount ?? services.length;
  const totalArticles = articlesCount ?? articles.length;
  const totalTeam = teamCount ?? teamMembers.length;
  const totalInquiries = inquiriesCount ?? inquiries.length;

  const newLeadsCount = inquiries.filter((i) => i.status === 'NEW').length;
  const contactedCount = inquiries.filter((i) => i.status === 'CONTACTED').length;
  const inProgressCount = inquiries.filter((i) => i.status === 'IN_PROGRESS').length;
  const resolvedCount = inquiries.filter((i) => i.status === 'RESOLVED').length;

  const publishedArticles = articles.filter((a) => a.isPublished).length;
  const activeServices = services.filter((s) => s.isActive).length;
  const milestoneProjects = projects.filter((p) => p.isMilestone).length;

  const stats: {
    label: string;
    count: number;
    sub: string;
    icon: React.ComponentType<{ size?: number }>;
    tab: AdminTab;
    highlight?: boolean;
  }[] = [
    {
      label: 'Projects',
      count: projects.length,
      sub: `${milestoneProjects} milestone`,
      icon: FolderKanban,
      tab: 'projects',
    },
    {
      label: 'Services',
      count: totalServices,
      sub: `${activeServices} active`,
      icon: BriefcaseBusiness,
      tab: 'services',
    },
    {
      label: 'Team & CVs',
      count: totalTeam,
      sub: 'With PDF CVs',
      icon: Users,
      tab: 'team',
    },
    {
      label: 'News & Articles',
      count: totalArticles,
      sub: `${publishedArticles} published`,
      icon: Newspaper,
      tab: 'news',
    },
    {
      label: 'Careers',
      count: jobs.length,
      sub: `${applications.length} applications`,
      icon: Briefcase,
      tab: 'careers',
    },
    {
      label: 'Enquiries',
      count: totalInquiries,
      sub: `${newLeadsCount} new leads`,
      icon: Mail,
      tab: 'inquiries',
      highlight: newLeadsCount > 0,
    },
  ];

  const recentProjects = useMemo(
    () => [...projects].sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999)).slice(0, 5),
    [projects]
  );

  const recentInquiries = useMemo(
    () =>
      [...inquiries]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5),
    [inquiries]
  );

  const teamByCategory = useMemo(() => {
    const map = new Map<string, number>();
    teamMembers.forEach((m) => {
      const cat = m.category || 'Other';
      map.set(cat, (map.get(cat) || 0) + 1);
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [teamMembers]);

  const go = (tab: AdminTab) => {
    if (onNavigateTab) return onNavigateTab(tab);
    if (tab === 'projects') onNavigateToProjects();
    if (tab === 'inquiries') onNavigateToInquiries?.();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard Overview"
        description="Live summary of website content, team directory, and client enquiries"
        actions={
          <div className="flex items-center gap-2">
            {onNavigateTab && (
              <Button variant="secondary" onClick={() => go('inbox')} icon={<MessageSquareText size={14} />}>
                Messages
              </Button>
            )}
            <Button onClick={onOpenCreateModal} icon={<Plus size={15} />}>
              Add Project
            </Button>
          </div>
        }
      />

      {/* KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => go(item.tab)}
              className="text-left bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:border-indigo-300 hover:shadow-xs transition cursor-pointer flex flex-col justify-between gap-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-500 truncate">{item.label}</span>
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    item.highlight ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Icon size={14} />
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">{item.count}</p>
                <p className={`text-[11px] mt-0.5 ${item.highlight ? 'text-rose-600 font-semibold' : 'text-slate-400'}`}>
                  {item.sub}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Middle Row: Enquiry Pipeline + Team Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <Card padding="md" className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Enquiry Pipeline</h3>
              <p className="text-xs text-slate-500 mt-0.5">Distribution across CRM stages</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => go('inquiries')}>
              Open Board <ArrowRight size={13} />
            </Button>
          </div>

          <div className="space-y-3">
            {[
              { label: 'New Leads', count: newLeadsCount, bar: 'bg-rose-500', text: 'text-rose-700' },
              { label: 'Contacted', count: contactedCount, bar: 'bg-amber-500', text: 'text-amber-700' },
              { label: 'In Discussion', count: inProgressCount, bar: 'bg-indigo-500', text: 'text-indigo-700' },
              { label: 'Closed / Converted', count: resolvedCount, bar: 'bg-emerald-500', text: 'text-emerald-700' },
            ].map((stage) => {
              const pct = totalInquiries > 0 ? Math.round((stage.count / totalInquiries) * 100) : 0;
              return (
                <div key={stage.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">{stage.label}</span>
                    <span className={`font-mono font-bold ${stage.text}`}>
                      {stage.count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div className={`h-full rounded-full ${stage.bar} transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card padding="md" className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Team by Discipline</h3>
              <p className="text-xs text-slate-500 mt-0.5">{totalTeam} total professionals</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => go('team')}>
              Directory <ArrowRight size={13} />
            </Button>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {teamByCategory.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No team members recorded.</p>
            ) : (
              teamByCategory.map(([cat, count]) => (
                <div
                  key={cat}
                  className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-100 text-xs"
                >
                  <span className="font-medium text-slate-700 truncate">{cat}</span>
                  <Badge variant="brand">{count}</Badge>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Bottom Row: Recent Enquiries + Recent Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card padding="none" className="overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent Enquiries</h3>
              <p className="text-xs text-slate-500 mt-0.5">Latest client submissions</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => go('inquiries')}>
              View all <ArrowRight size={13} />
            </Button>
          </div>
          <div className="divide-y divide-slate-100">
            {recentInquiries.length === 0 ? (
              <div className="px-5 py-10 text-center text-xs text-slate-500">No enquiries yet.</div>
            ) : (
              recentInquiries.map((inq) => (
                <div
                  key={inq.id}
                  onClick={() => go('inquiries')}
                  className="px-5 py-3 flex items-center justify-between gap-3 hover:bg-slate-50/70 transition cursor-pointer"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{inq.fullName}</p>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {inq.serviceType || 'General Consultation'} · {inq.email}
                    </p>
                  </div>
                  <Badge
                    variant={
                      inq.status === 'NEW'
                        ? 'danger'
                        : inq.status === 'CONTACTED'
                        ? 'warning'
                        : inq.status === 'IN_PROGRESS'
                        ? 'brand'
                        : 'success'
                    }
                  >
                    {inq.status.replace('_', ' ')}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card padding="none" className="overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent Projects</h3>
              <p className="text-xs text-slate-500 mt-0.5">Top ordered portfolio projects</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onNavigateToProjects}>
              View all <ArrowRight size={13} />
            </Button>
          </div>
          <div className="divide-y divide-slate-100">
            {recentProjects.length === 0 ? (
              <div className="px-5 py-10 text-center text-xs text-slate-500">No projects recorded yet.</div>
            ) : (
              recentProjects.map((project) => (
                <div
                  key={project.id}
                  onClick={onNavigateToProjects}
                  className="px-5 py-3 flex items-center justify-between gap-3 hover:bg-slate-50/70 transition cursor-pointer"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{project.title}</p>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {project.client}
                      {project.location ? ` · ${project.location}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Badge variant="brand">{project.category}</Badge>
                    {project.isMilestone && <Badge variant="warning">Milestone</Badge>}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
