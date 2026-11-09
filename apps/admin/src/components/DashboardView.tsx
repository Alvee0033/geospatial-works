'use client';

import React from 'react';
import {
  FolderKanban,
  Award,
  Building,
  Layers,
  ArrowRight,
  TrendingUp,
  MapPin,
  CheckCircle2,
  Clock,
  Sparkles,
  Mail,
} from 'lucide-react';
import { ProjectItem } from './ProjectsView';

interface DashboardViewProps {
  projects: ProjectItem[];
  inquiriesCount?: number;
  onNavigateToProjects: () => void;
  onNavigateToInquiries?: () => void;
  onOpenCreateModal: () => void;
}

export function DashboardView({
  projects,
  inquiriesCount = 0,
  onNavigateToProjects,
  onNavigateToInquiries,
  onOpenCreateModal,
}: DashboardViewProps) {
  const milestoneCount = projects.filter((p) => p.isMilestone).length;
  const categoriesCount = new Set(projects.map((p) => p.category)).size;

  return (
    <div className="space-y-6">
      {/* 4 Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1 */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Total Projects
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">{projects.length}</div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-1">
              <TrendingUp size={13} />
              <span>100% SOB Compliant</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <FolderKanban size={22} />
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              National Landmarks
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">{milestoneCount}</div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600 mt-1">
              <Award size={13} />
              <span>Public Carousel</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <Sparkles size={22} />
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Engineering Sectors
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">{categoriesCount}</div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-blue-600 mt-1">
              <CheckCircle2 size={13} />
              <span>8 Divisions Mapped</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <Building size={22} />
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Total Mapped Area
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">1,500+ km²</div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-purple-600 mt-1">
              <Layers size={13} />
              <span>LiDAR & Bathymetry</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
            <Layers size={22} />
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Landmarks & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Landmarks Table (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Recent National Infrastructure Landmarks</h3>
                <p className="text-xs text-slate-400">Latest surveys synchronized from PostgreSQL database</p>
              </div>
              <button
                onClick={onNavigateToProjects}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                View All Projects <ArrowRight size={13} />
              </button>
            </div>

            <div className="divide-y divide-slate-100 mt-2">
              {projects.slice(0, 5).map((p) => (
                <div key={p.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={p.imageUrl || '/inner/bridge-aerial.webp'}
                      alt=""
                      className="w-11 h-9 rounded-lg object-cover bg-slate-100 border border-slate-200 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{p.title}</h4>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        <span className="font-semibold text-slate-600 truncate">{p.client}</span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5">
                          <MapPin size={10} /> {p.location || 'National'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-700">
                      {p.category.split('&')[0].trim()}
                    </span>
                    {p.isMilestone && (
                      <span className="p-1 rounded-lg bg-amber-50 text-amber-600" title="National Landmark">
                        <Award size={14} className="fill-current" />
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              onClick={onNavigateToProjects}
              className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition"
            >
              Manage in All Projects ({projects.length}) →
            </button>
          </div>
        </div>

        {/* Quick Operations & Overview Card (1 Col) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between space-y-6">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 pb-3 border-b border-slate-100">
              Quick Operations
            </h3>

            <div className="space-y-3 mt-4">
              <button
                onClick={onOpenCreateModal}
                className="w-full p-4 rounded-xl border border-indigo-100 bg-indigo-50/50 hover:bg-indigo-50 text-left transition flex items-center justify-between group"
              >
                <div>
                  <h4 className="text-xs font-bold text-indigo-900">Add New Landmark</h4>
                  <p className="text-[11px] text-indigo-600/80 mt-0.5">Publish new geodetic & survey project</p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold shadow-sm group-hover:scale-105 transition">
                  +
                </div>
              </button>

              <button
                onClick={onNavigateToProjects}
                className="w-full p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 text-left transition flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Edit Landmark Roster</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Update client deliverables and photos</p>
                </div>
                <ArrowRight size={15} className="text-slate-400" />
              </button>

              {onNavigateToInquiries && (
                <button
                  onClick={onNavigateToInquiries}
                  className="w-full p-4 rounded-xl border border-emerald-100 bg-emerald-50/50 hover:bg-emerald-50 text-left transition flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-emerald-950">Leads &amp; Enquiries</h4>
                      <span className="text-[10px] font-black bg-emerald-200 text-emerald-900 px-1.5 py-0.2 rounded-full">
                        {inquiriesCount}
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-700/80 mt-0.5">Review client RFQs and quote messages</p>
                  </div>
                  <Mail size={16} className="text-emerald-600" />
                </button>
              )}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500 space-y-1">
            <div className="flex justify-between">
              <span className="font-semibold">Backend Port:</span>
              <span className="font-mono text-slate-700">4000 (NestJS)</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Database Engine:</span>
              <span className="font-mono text-emerald-600 font-bold">PostgreSQL (5433)</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Public Website:</span>
              <span className="font-mono text-slate-700">3001 (Next.js)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

