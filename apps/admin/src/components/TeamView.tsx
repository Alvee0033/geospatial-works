'use client';

import React, { useState, useMemo } from 'react';
import { getPublicSiteUrl } from '../lib/publicSiteUrl';
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
import { Button, Badge, PageHeader, SearchFilterBar, EmptyState } from './ui';

interface TeamViewProps {
  teamMembers: TeamMemberItem[];
  loading: boolean;
  searchQuery: string;
  onOpenCreateDrawer: () => void;
  onOpenEditDrawer: (m: TeamMemberItem) => void;
  onDeleteMember: (id: string, name: string) => void;
  onToggleActive?: (m: TeamMemberItem) => void;
  onReorderMembers?: (reordered: TeamMemberItem[]) => Promise<void>;
}

function FormattedCvDocument({ member }: { member: TeamMemberItem }) {
  const text = member.fullCvText || member.bio || 'No detailed CV text recorded.';
  const lines = text.split('\n').map((l) => l.trimEnd());
  const scv = member.structuredCv;

  const isSectionHeading = (line: string) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.length > 70) return false;
    if (/^(CURRICULUM VITAE|KEY QUALIFICATIONS|EDUCATION|ACADEMIC|EMPLOYMENT|WORK EXPERIENCE|EXPERIENCE|PROJECT|PROJECTS|MEMBERSHIP|CERTIFICATION|TRAINING|SKILLS|SOFTWARE|LANGUAGE|PERSONAL|DECLARATION|REFERENCES)/i.test(trimmed)) {
      return true;
    }
    const letters = trimmed.replace(/[^a-zA-Z]/g, '');
    return letters.length >= 4 && letters === letters.toUpperCase() && !trimmed.includes(':');
  };

  return (
    <div className="bg-white border border-slate-300 shadow-sm max-w-[820px] mx-auto p-8 md:p-12 text-slate-900 font-sans">
      {/* Formal Academic / Executive CV Header */}
      <div className="flex flex-col-reverse sm:flex-row justify-between items-start gap-6 pb-6 border-b-2 border-slate-900">
        <div className="space-y-1.5 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
            Curriculum Vitae
          </p>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-950 font-serif">
            {member.name}
          </h2>
          <p className="text-sm font-semibold text-slate-700">{member.role}</p>
          <p className="text-xs text-slate-600">{member.category}{member.credentials ? ` · ${member.credentials}` : ''}</p>
          {(member.email || member.phone) && (
            <div className="flex flex-wrap gap-x-5 gap-y-1 pt-1.5 text-xs text-slate-600">
              {member.email && <span>Email: {member.email}</span>}
              {member.phone && <span>Phone: {member.phone}</span>}
            </div>
          )}
        </div>
        <div className="w-28 h-32 border border-slate-300 bg-slate-100 shrink-0 overflow-hidden flex items-center justify-center">
          {member.image ? (
            <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-xl font-serif font-bold text-slate-400">
              {member.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-6 pt-6">
        {/* Executive Summary */}
        {(scv?.summary || member.bio) && (
          <section>
            <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-slate-900 border-b border-slate-300 pb-1 mb-2.5">
              Professional Profile
            </h3>
            <p className="text-[13px] leading-relaxed text-slate-700 text-justify">
              {scv?.summary || member.bio}
            </p>
          </section>
        )}

        {/* Education & Academic Qualifications */}
        {scv?.education && scv.education.length > 0 && (
          <section>
            <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-slate-900 border-b border-slate-300 pb-1 mb-3">
              Education &amp; Academic Qualifications
            </h3>
            <div className="space-y-2.5">
              {scv.education.map((edu, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1 text-[13px]">
                  <div>
                    <span className="font-bold text-slate-900">{edu.degree}</span>
                    {edu.institution && <span className="text-slate-600"> — {edu.institution}</span>}
                  </div>
                  {edu.year && <span className="text-xs font-mono text-slate-500 shrink-0">{edu.year}</span>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Professional Registrations */}
        {scv?.registrations && scv.registrations.length > 0 && (
          <section>
            <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-slate-900 border-b border-slate-300 pb-1 mb-2.5">
              Professional Registrations &amp; Memberships
            </h3>
            <ul className="list-disc list-inside space-y-1 text-[13px] text-slate-700">
              {scv.registrations.map((reg, i) => (
                <li key={i}>{reg}</li>
              ))}
            </ul>
          </section>
        )}

        {/* Key Projects & Experience */}
        {scv?.experience && scv.experience.length > 0 && (
          <section>
            <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-slate-900 border-b border-slate-300 pb-1 mb-3">
              Key Projects &amp; Professional Experience
            </h3>
            <div className="space-y-3.5">
              {scv.experience.map((exp, i) => (
                <div key={i} className="text-[13px]">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1">
                    <span className="font-bold text-slate-900">{exp.role}</span>
                    {exp.period && <span className="text-xs font-mono text-slate-500 shrink-0">{exp.period}</span>}
                  </div>
                  {exp.company && <div className="text-xs font-semibold text-slate-600 mt-0.5">{exp.company}</div>}
                  {exp.highlights && <p className="text-xs text-slate-700 mt-1 leading-relaxed">{exp.highlights}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Technical Proficiencies & Software */}
        {scv?.software && scv.software.length > 0 && (
          <section>
            <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-slate-900 border-b border-slate-300 pb-1 mb-2.5">
              Technical Proficiencies &amp; Software
            </h3>
            <p className="text-[13px] text-slate-700 leading-relaxed">
              {scv.software.join('  ·  ')}
            </p>
          </section>
        )}

        {/* Detailed Curriculum Vitae Record */}
        <section>
          <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-slate-900 border-b border-slate-300 pb-1 mb-3">
            Additional Curriculum Vitae Details
          </h3>
          <div className="space-y-1.5 text-[12.5px] leading-relaxed text-slate-800">
            {lines.map((rawLine, idx) => {
              const line = rawLine.trim();
              if (!line) return null;

              // Skip boilerplate certification & redundant CV title lines
              if (
                /^CURRICULUM VITAE\s*(\(CV\))?/i.test(line) ||
                /^I, the undersigned, certify/i.test(line) ||
                /willful misstatement described herein/i.test(line) ||
                /and my experience\. I understand that/i.test(line) ||
                /^dismissal, if engaged\.?$/i.test(line)
              ) {
                return null;
              }

              if (isSectionHeading(line)) {
                return (
                  <h4 key={idx} className="pt-4 pb-1 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-900 border-b border-slate-200">
                    {line}
                  </h4>
                );
              }

              // Pipe-delimited table/key-value row from docx/pdf extraction
              if (line.includes('|')) {
                const cells = line
                  .split('|')
                  .map((c) => c.trim())
                  .filter((c) => c.length > 0);
                // Skip empty label-only rows like "| PROPOSE POSITION:"
                if (cells.length === 0) return null;
                if (cells.length === 1) {
                  if (cells[0].endsWith(':')) return null;
                  return (
                    <div key={idx} className="py-1 text-xs text-slate-700">
                      {cells[0]}
                    </div>
                  );
                }
                if (cells.length === 2) {
                  return (
                    <div key={idx} className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-1 sm:gap-4 py-1.5 border-b border-slate-100">
                      <span className="font-semibold text-slate-600 text-xs">{cells[0].replace(/:$/, '')}</span>
                      <span className="text-slate-900 text-xs">{cells[1]}</span>
                    </div>
                  );
                }
                return (
                  <div
                    key={idx}
                    className="grid gap-3 py-1.5 px-3 border-b border-slate-200 bg-slate-50/70 text-xs rounded-sm"
                    style={{ gridTemplateColumns: `repeat(${Math.min(cells.length, 4)}, minmax(0, 1fr))` }}
                  >
                    {cells.slice(0, 4).map((cell, ci) => (
                      <span key={ci} className={ci % 2 === 0 ? 'font-semibold text-slate-600' : 'text-slate-900'}>
                        {cell.replace(/:$/, '')}
                      </span>
                    ))}
                  </div>
                );
              }

              const kvMatch = line.match(/^([A-Za-z0-9\s/&().'-]{2,35}):\s+(.+)$/);
              if (kvMatch) {
                return (
                  <div key={idx} className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-1 sm:gap-4 py-1 border-b border-slate-100">
                    <span className="font-semibold text-slate-600 text-xs">{kvMatch[1]}</span>
                    <span className="text-slate-900 text-xs">{kvMatch[2]}</span>
                  </div>
                );
              }

              if (/^([•\-\*]|\d+[.)])\s+/.test(line)) {
                const clean = line.replace(/^([•\-\*]|\d+[.)])\s+/, '');
                return (
                  <div key={idx} className="flex items-start gap-2 pl-2 py-0.5 text-xs">
                    <span className="text-slate-400 select-none">•</span>
                    <span className="text-slate-700">{clean}</span>
                  </div>
                );
              }

              return (
                <p key={idx} className="text-xs text-slate-700 leading-relaxed">
                  {line}
                </p>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

export function TeamView({
  teamMembers,
  loading,
  searchQuery,
  onOpenCreateDrawer,
  onOpenEditDrawer,
  onDeleteMember,
  onToggleActive,
  onReorderMembers,
}: TeamViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [previewMember, setPreviewMember] = useState<TeamMemberItem | null>(null);
  const [activeCvTab, setActiveCvTab] = useState<'full' | 'structured'>('full');
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  // All distinct categories from data + fallback
  const categories = useMemo(() => {
    const cats = new Set<string>();
    teamMembers.forEach((m) => {
      if (m.category) cats.add(m.category);
    });
    TEAM_CATEGORIES.forEach((c) => cats.add(c));
    return ['All', ...Array.from(cats)];
  }, [teamMembers]);

  const [localSearch, setLocalSearch] = useState('');

  // Filter members by category + search query
  const filteredMembers = useMemo(() => {
    return teamMembers.filter((m) => {
      const matchCat = selectedCategory === 'All' || m.category === selectedCategory;
      const q = (localSearch || searchQuery).toLowerCase().trim();
      const matchQuery =
        !q ||
        m.name?.toLowerCase().includes(q) ||
        m.role?.toLowerCase().includes(q) ||
        m.credentials?.toLowerCase().includes(q) ||
        m.bio?.toLowerCase().includes(q) ||
        m.structuredCv?.summary?.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }, [teamMembers, selectedCategory, searchQuery, localSearch]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team Directory & CVs"
        description={`${teamMembers.length} registered engineers, architects & specialists`}
        actions={
          <>
            <a
              href={`${getPublicSiteUrl()}/team`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center h-9 px-4 text-xs gap-2 rounded-lg font-semibold bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-2xs transition"
            >
              <ExternalLink size={14} />
              <span>View /team</span>
            </a>
            <Button onClick={onOpenCreateDrawer} icon={<Plus size={15} />}>
              Add Team Member
            </Button>
          </>
        }
      />

      <SearchFilterBar
        search={localSearch}
        onSearchChange={setLocalSearch}
        searchPlaceholder="Search team by name, role, discipline, or credentials..."
        filters={categories.map((cat) => ({
          label: cat,
          value: cat,
          count: cat === 'All' ? teamMembers.length : teamMembers.filter((m) => m.category === cat).length,
        }))}
        activeFilter={selectedCategory}
        onFilterChange={setSelectedCategory}
      />

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
            const memberKey = member.id || member.slug || member.name;
            const eduCount = member.structuredCv?.education?.length || 0;
            const expCount = member.structuredCv?.experience?.length || 0;
            const swCount = member.structuredCv?.software?.length || 0;
            const isDragging = draggedId === memberKey;
            const isDragOver = dragOverId === memberKey && draggedId !== memberKey;

            return (
              <div
                key={memberKey}
                draggable={Boolean(onReorderMembers)}
                onDragStart={(e) => {
                  setDraggedId(memberKey);
                  e.dataTransfer.effectAllowed = 'move';
                }}
                onDragOver={(e) => {
                  if (!onReorderMembers || !draggedId) return;
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                  if (dragOverId !== memberKey) setDragOverId(memberKey);
                }}
                onDrop={async (e) => {
                  e.preventDefault();
                  if (!onReorderMembers || !draggedId || draggedId === memberKey) {
                    setDraggedId(null);
                    setDragOverId(null);
                    return;
                  }
                  const fromIdx = teamMembers.findIndex((m) => (m.id || m.slug || m.name) === draggedId);
                  const toIdx = teamMembers.findIndex((m) => (m.id || m.slug || m.name) === memberKey);
                  setDraggedId(null);
                  setDragOverId(null);
                  if (fromIdx < 0 || toIdx < 0) return;
                  const next = [...teamMembers];
                  const [moved] = next.splice(fromIdx, 1);
                  next.splice(toIdx, 0, moved);
                  await onReorderMembers(next);
                }}
                onDragEnd={() => {
                  setDraggedId(null);
                  setDragOverId(null);
                }}
                className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between group ${
                  isDragging
                    ? 'opacity-50 border-indigo-400 scale-[0.98]'
                    : isDragOver
                      ? 'border-indigo-500 ring-2 ring-indigo-500/30 shadow-lg'
                      : 'border-slate-200/80 hover:border-indigo-400 hover:shadow-lg'
                } ${onReorderMembers ? 'cursor-grab active:cursor-grabbing' : ''}`}
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
          <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden z-10 max-h-[92vh] flex flex-col">
            {/* Header */}
            <div className="p-5 bg-slate-900 text-white flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-16 rounded-lg bg-slate-800 overflow-hidden shrink-0 border border-white/20">
                  <img
                    src={previewMember.image || '/team-photos/mak_khan.jpeg'}
                    alt={previewMember.name}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-rose-400 uppercase tracking-wider font-bold">
                    {previewMember.category}
                  </span>
                  <h3 className="text-lg font-extrabold text-white">{previewMember.name}</h3>
                  <p className="text-xs text-slate-300">{previewMember.role}</p>
                  {previewMember.credentials && (
                    <p className="text-[11px] font-mono text-slate-400 mt-0.5">{previewMember.credentials}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-slate-800 p-0.5 rounded-lg border border-slate-700 flex text-xs">
                  <button
                    type="button"
                    onClick={() => setActiveCvTab('full')}
                    className={`px-3 py-1 rounded-md font-bold transition ${
                      activeCvTab === 'full' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Full Original CV
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveCvTab('structured')}
                    className={`px-3 py-1 rounded-md font-bold transition ${
                      activeCvTab === 'structured' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Structured Summary
                  </button>
                </div>
                <button
                  onClick={() => setPreviewMember(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
                >
                  <XCircle size={22} />
                </button>
              </div>
            </div>

            {/* Content View */}
            {activeCvTab === 'full' ? (
              <div className="p-4 md:p-6 overflow-y-auto flex-1 bg-slate-100 flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3 pb-2 border-b border-slate-200 shrink-0">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <FileText size={14} className="text-indigo-600" />
                    Uploaded Original CV Document
                  </span>
                  {(previewMember.structuredCv?.cvUrl || previewMember.slug) && (
                    <a
                      href={previewMember.structuredCv?.cvUrl || `/cv/${previewMember.slug}.pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-2xs"
                    >
                      Open / Download PDF
                    </a>
                  )}
                </div>
                {previewMember.structuredCv?.cvUrl || previewMember.slug ? (
                  <iframe
                    src={`${previewMember.structuredCv?.cvUrl || `/cv/${previewMember.slug}.pdf`}#toolbar=1&navpanes=0`}
                    title={`${previewMember.name} CV`}
                    className="w-full flex-1 min-h-[65vh] rounded-xl border border-slate-300 bg-white shadow-sm"
                  />
                ) : (
                  <FormattedCvDocument member={previewMember} />
                )}
              </div>
            ) : (
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
            )}

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
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
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

