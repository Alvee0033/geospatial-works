'use client';

import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  GraduationCap,
  Briefcase,
  Layers,
  Award,
  Mail,
  Phone,
  Eye,
  CheckCircle2,
  XCircle,
  FileText,
} from 'lucide-react';
import { TeamMemberItem, TEAM_CATEGORIES } from './TeamMemberDrawer';

interface TeamViewProps {
  teamMembers: TeamMemberItem[];
  loading: boolean;
  searchQuery: string;
  onOpenCreateDrawer: () => void;
  onOpenEditDrawer: (m: TeamMemberItem) => void;
  onDeleteMember: (id: string, name: string) => void;
  onToggleActive?: (m: TeamMemberItem) => void;
}

export function TeamView({
  teamMembers,
  loading,
  searchQuery,
  onOpenCreateDrawer,
  onOpenEditDrawer,
  onDeleteMember,
  onToggleActive,
}: TeamViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [previewMember, setPreviewMember] = useState<TeamMemberItem | null>(null);

  // All distinct categories from data + fallback
  const categories = useMemo(() => {
    const cats = new Set<string>();
    teamMembers.forEach((m) => {
      if (m.category) cats.add(m.category);
    });
    TEAM_CATEGORIES.forEach((c) => cats.add(c));
    return ['All', ...Array.from(cats)];
  }, [teamMembers]);

  // Filter members by category + search query
  const filteredMembers = useMemo(() => {
    return teamMembers.filter((m) => {
      const matchCat = selectedCategory === 'All' || m.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        m.name?.toLowerCase().includes(q) ||
        m.role?.toLowerCase().includes(q) ||
        m.credentials?.toLowerCase().includes(q) ||
        m.bio?.toLowerCase().includes(q) ||
        m.structuredCv?.summary?.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }, [teamMembers, selectedCategory, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Statistics Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60 uppercase tracking-wider">
              Leadership &amp; Technical Directory
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {teamMembers.length} Registered Professionals
            </span>
          </div>
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
            Engineers, Architects &amp; Survey Specialists
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 max-w-2xl">
            Manage your firm&apos;s technical staff profiles, verified CV records, academic credentials, software skillsets, and major infrastructure appointments.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <a
            href="https://geospatialworks.com.bd/team"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition shadow-2xs"
          >
            <ExternalLink size={13} />
            <span>View Public /team</span>
          </a>
          <button
            onClick={onOpenCreateDrawer}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-black text-white rounded-lg text-xs font-semibold transition shadow-2xs cursor-pointer"
          >
            <Plus size={14} />
            <span>Add Team Member &amp; CV</span>
          </button>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => {
          const count = cat === 'All' ? teamMembers.length : teamMembers.filter((m) => m.category === cat).length;
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              <span>{cat}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grid of Team Member Cards */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-sm">
          Loading team directory...
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <Users size={36} className="mx-auto text-slate-300 mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No team members match your criteria</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Try adjusting your search terms or add a new team member to this category.
          </p>
          <button
            onClick={onOpenCreateDrawer}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold"
          >
            <Plus size={14} />
            <span>Add Member</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMembers.map((member) => {
            const eduCount = member.structuredCv?.education?.length || 0;
            const expCount = member.structuredCv?.experience?.length || 0;
            const swCount = member.structuredCv?.software?.length || 0;

            return (
              <div
                key={member.id || member.slug}
                className="bg-white rounded-2xl border border-slate-200/80 hover:border-indigo-400 hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  {/* Card Top: Photo & Info */}
                  <div className="p-5 flex items-start gap-4 border-b border-slate-100">
                    <div className="w-16 h-20 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 aspect-[4/5] relative">
                      <img
                        src={member.image || '/team/delwar-hossain.png'}
                        alt={member.name}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[9.5px] font-mono font-bold text-indigo-600 uppercase tracking-wider truncate">
                          {member.category}
                        </span>
                        {member.isActive !== false ? (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                            Live
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-500 shrink-0">
                            Draft
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 leading-snug truncate" title={member.name}>
                        {member.name}
                      </h3>
                      <p className="text-xs font-semibold text-rose-600 mt-0.5 truncate" title={member.role}>
                        {member.role}
                      </p>

                      {member.credentials && (
                        <p className="text-[10px] text-slate-500 font-mono mt-1 truncate" title={member.credentials}>
                          {member.credentials}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* CV Highlights Badges */}
                  <div className="px-5 py-3 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                    <div className="flex items-center gap-1.5" title={`${eduCount} Educational Degrees`}>
                      <GraduationCap size={13} className="text-rose-500" />
                      <span className="font-semibold">{eduCount} Degrees</span>
                    </div>
                    <div className="flex items-center gap-1.5" title={`${expCount} Project Appointments`}>
                      <Briefcase size={13} className="text-indigo-500" />
                      <span className="font-semibold">{expCount} Projects</span>
                    </div>
                    <div className="flex items-center gap-1.5" title={`${swCount} Software Applications`}>
                      <Layers size={13} className="text-amber-500" />
                      <span className="font-semibold">{swCount} Tools</span>
                    </div>
                  </div>

                  {/* Bio Preview */}
                  <div className="p-5 py-3">
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                      {member.structuredCv?.summary || member.bio || 'No bio provided.'}
                    </p>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="p-4 pt-3 border-t border-slate-100 bg-white flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewMember(member)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition"
                  >
                    <Eye size={13} />
                    <span>View CV</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onOpenEditDrawer(member)}
                      className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                      title="Edit member & CV"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteMember(member.id || member.slug || '', member.name)}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                      title="Delete member"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CV Quick Preview Modal */}
      {previewMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setPreviewMember(null)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
          />
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="p-5 bg-slate-900 text-white flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-14 rounded-lg bg-slate-800 overflow-hidden shrink-0 border border-white/20">
                  <img
                    src={previewMember.image || '/team/delwar-hossain.png'}
                    alt={previewMember.name}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-rose-400 uppercase tracking-wider font-bold">
                    {previewMember.category}
                  </span>
                  <h3 className="text-base font-extrabold text-white">{previewMember.name}</h3>
                  <p className="text-xs text-slate-300">{previewMember.role}</p>
                </div>
              </div>
              <button
                onClick={() => setPreviewMember(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
              >
                <XCircle size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700 flex-1">
              <div>
                <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-1">
                  Professional Summary
                </h4>
                <p className="leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                  {previewMember.structuredCv?.summary || previewMember.bio || 'None'}
                </p>
              </div>

              {previewMember.structuredCv?.education && previewMember.structuredCv.education.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-1.5">
                    Education &amp; Degrees
                  </h4>
                  <div className="space-y-1.5">
                    {previewMember.structuredCv.education.map((e, i) => (
                      <div key={i} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex justify-between">
                        <div>
                          <span className="font-bold text-slate-900">{e.degree}</span>
                          <span className="block text-slate-500 text-[11px]">{e.institution}</span>
                        </div>
                        {e.year && <span className="font-mono text-indigo-600 font-bold">{e.year}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {previewMember.structuredCv?.registrations && previewMember.structuredCv.registrations.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-1.5">
                    Professional Registrations
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {previewMember.structuredCv.registrations.map((r, i) => (
                      <span key={i} className="px-2.5 py-1 bg-slate-100 rounded-md text-[11px] font-semibold text-slate-700">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {previewMember.structuredCv?.software && previewMember.structuredCv.software.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-1.5">
                    Software Toolchain
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {previewMember.structuredCv.software.map((s, i) => (
                      <span key={i} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-md text-[11px] font-mono">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {previewMember.structuredCv?.experience && previewMember.structuredCv.experience.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-1.5">
                    Experience &amp; Megaprojects
                  </h4>
                  <div className="space-y-2">
                    {previewMember.structuredCv.experience.map((exp, i) => (
                      <div key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-slate-900">{exp.role}</span>
                          <span className="font-mono text-rose-600 font-bold text-[10.5px]">{exp.period}</span>
                        </div>
                        <span className="text-slate-500 block text-[11px]">{exp.company}</span>
                        <p className="text-[11.5px] text-slate-600 pt-1 leading-relaxed">{exp.highlights}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
              <span className="text-[11px] text-slate-400 font-mono">
                ID: {previewMember.id || previewMember.slug}
              </span>
              <button
                onClick={() => {
                  const m = previewMember;
                  setPreviewMember(null);
                  onOpenEditDrawer(m);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <Edit2 size={13} />
                <span>Edit Full Profile</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

