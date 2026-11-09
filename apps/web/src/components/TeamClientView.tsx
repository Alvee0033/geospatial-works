'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Mail,
  Phone,
  ArrowRight,
  ShieldCheck,
  X,
  FileText,
  ChevronRight,
  Briefcase,
  GraduationCap,
  Award,
  Layers,
  CheckCircle2,
  Calendar,
  Building,
  UserCheck,
  Plus,
  ChevronDown,
} from 'lucide-react';
import teamData from '@/data/teamMembers.json';

interface StructuredCv {
  summary?: string;
  education?: Array<{ degree: string; institution: string; year?: string }>;
  registrations?: string[];
  software?: string[];
  experience?: Array<{
    role: string;
    company: string;
    period: string;
    highlights: string;
  }>;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  category: string;
  credentials: string;
  bio: string;
  image: string;
  email?: string;
  phone?: string;
  structuredCv?: StructuredCv;
}

export default function TeamClientView() {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  const [members, setMembers] = useState<TeamMember[]>(teamData);

  useEffect(() => {
    // Fetch live updated team directory from API if available
    fetch('/api/team')
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
        if (data && Array.isArray(data) && data.length > 0) {
          setMembers(data);
        }
      })
      .catch(() => {});
  }, []);

  const categories = React.useMemo(() => {
    const set = new Set<string>();
    members.forEach((m) => {
      if (m.category) set.add(m.category);
    });
    return ['All', ...Array.from(set)];
  }, [members]);

  const filteredMembers = members.filter((m) => {
    return activeCategory === 'All' || m.category === activeCategory;
  });

  const leader = members[0]; // Engr. Mohammad Delwar Hossain

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (selectedMember) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedMember]);

  return (
    <div className="wsp-team-page bg-[#FDFDFD] text-[#141212] pt-6 pb-20 font-sans">
      <div className="max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center justify-between mb-5">
          <div className="text-[11px] font-semibold text-neutral-500 flex items-center gap-1.5">
            <Link href="/" className="hover:text-black transition-colors">Home</Link>
            <span className="text-neutral-300">/</span>
            <Link href="/about" className="hover:text-black transition-colors">Who we are</Link>
            <span className="text-neutral-300">/</span>
            <span className="text-[#3B82F6] font-bold">Our Engineers &amp; Leadership</span>
          </div>
        </div>

        {/* Page Title & Narrative Header */}
        <div className="max-w-[900px] space-y-2.5 mb-10">
          <span className="inline-block text-[11px] font-mono uppercase tracking-[0.2em] text-[#FB1D10] font-bold">
            TECHNICAL CONSULTING &amp; FIELD OPERATIONS
          </span>
          <h1 className="text-[32px] sm:text-[40px] md:text-[46px] font-extrabold text-[#141212] tracking-[-0.03em] leading-tight">
            Our Engineers &amp; <span className="text-[#3B82F6]">Innovators</span>
          </h1>
          <p className="text-[14px] sm:text-[15px] font-normal leading-relaxed text-neutral-600">
            Meet the senior civil engineers, licensed architects, CAD infrastructure designers, and geodetic logistics specialists delivering world-class national infrastructure and geospatial precision across Bangladesh.
          </p>
        </div>

        {/* Executive Technical Leadership Spotlight matching WSP */}
        <div className="mb-12 bg-[#141212] text-white p-5 sm:p-7 border-l-4 border-[#3B82F6] shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.2)_0%,_transparent_70%)] pointer-events-none" />
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-center relative z-10">
            {/* Portrait Image Holder */}
            <div
              onClick={() => setSelectedMember(leader)}
              className="md:col-span-4 lg:col-span-3 aspect-[4/5] max-w-[220px] w-full mx-auto md:mx-0 bg-neutral-900 border border-white/10 overflow-hidden relative shadow-lg cursor-pointer group"
            >
              <img
                src={leader.image}
                alt={leader.name}
                className="w-full h-full object-cover object-top filter brightness-105 group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-2">
                <span className="text-[9.5px] font-mono text-[#FB1D10] font-bold uppercase tracking-wider block">
                  BUET 1997 • IEB Fellow F-8790
                </span>
              </div>
            </div>

            <div className="md:col-span-8 lg:col-span-9 space-y-2">
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={15} className="text-[#3B82F6]" />
                <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#3B82F6] font-bold">
                  CHIEF TECHNICAL ADVISOR &amp; STRUCTURAL DIRECTOR
                </span>
              </div>
              <h2
                onClick={() => setSelectedMember(leader)}
                className="text-[22px] sm:text-[26px] font-extrabold text-white tracking-tight leading-tight cursor-pointer hover:text-[#3B82F6] transition-colors"
              >
                {leader.name}
              </h2>
              <p className="text-[13px] font-semibold text-neutral-300">
                {leader.role}
              </p>
              <p className="text-[10.5px] font-mono text-neutral-400 border-l-2 border-[#FB1D10] pl-2.5 py-0.5 bg-white/5">
                {leader.credentials}
              </p>
              <p className="text-[12.5px] text-neutral-300 leading-relaxed max-w-[800px]">
                {leader.bio}
              </p>

              {/* Direct Compact Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedMember(leader)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#3B82F6] hover:bg-[#2563EB] text-white text-[11px] font-bold uppercase tracking-wider transition-colors shadow-sm cursor-pointer"
                >
                  <FileText size={13} />
                  <span>View Verified CV</span>
                </button>
                {leader.email && (
                  <a
                    href={`mailto:${leader.email}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 border border-white/25 hover:border-white text-white text-[11px] font-bold uppercase tracking-wider transition-colors"
                  >
                    <Mail size={13} className="text-[#3B82F6]" />
                    <span>Email</span>
                  </a>
                )}
                {leader.phone && (
                  <a
                    href={`tel:${leader.phone}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 border border-white/25 hover:border-white text-white text-[11px] font-bold uppercase tracking-wider transition-colors"
                  >
                    <Phone size={13} className="text-[#FB1D10]" />
                    <span>Call</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown (No Side Scroll) + Desktop Tabs */}
        <div className="block sm:hidden w-full mb-6">
          <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5 block">
            Filter Practice Group
          </label>
          <div className="relative">
            <select
              value={activeCategory}
              onChange={(e) => setActiveCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-bold text-neutral-900 focus:bg-white focus:outline-none focus:border-red-500 appearance-none cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? `All Professionals (${members.length})` : cat}
                </option>
              ))}
            </select>
            <ChevronDown size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
          </div>
        </div>

        {/* Desktop Category Filter Tabs */}
        <div className="hidden sm:flex flex-wrap items-center gap-1.5 pb-3 border-b border-neutral-200 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 text-[11px] sm:text-[11.5px] font-semibold tracking-wide transition-all whitespace-nowrap cursor-pointer ${
                activeCategory === cat
                  ? 'bg-[#141212] text-white shadow-sm'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              {cat === 'All' ? `All Professionals (${members.length})` : cat}
            </button>
          ))}
        </div>

        {/* Grid of Team Members: 4 cards per row on large desktop (grid-cols-4) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {filteredMembers.map((member) => (
            <div
              key={member.id}
              className="group bg-white border border-neutral-200 hover:border-[#3B82F6] shadow-xs hover:shadow-[0_12px_28px_rgba(59,130,246,0.16)] transition-all duration-200 flex flex-col justify-between overflow-hidden"
            >
              <div>
                {/* Natural Headshot Frame: 4:5 vertical portrait aspect ratio */}
                <div
                  onClick={() => setSelectedMember(member)}
                  className="aspect-[4/5] overflow-hidden bg-neutral-900 relative border-b border-neutral-100 flex items-center justify-center cursor-pointer"
                >
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover object-top group-hover:scale-[1.03] transition-transform duration-500 ease-out filter brightness-105"
                    loading="lazy"
                  />
                  {/* Category Chip */}
                  <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/80 backdrop-blur-sm text-[8.5px] font-mono text-white tracking-wider uppercase border border-white/10">
                    {member.category.split('&')[0].trim()}
                  </div>
                  {/* Hover Quick View Pill */}
                  <div className="absolute bottom-2 inset-x-2 py-1.5 bg-black/85 backdrop-blur-sm text-white text-[10px] font-bold text-center uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-1">
                    <span>View Structured CV</span>
                    <ChevronRight size={12} className="text-[#3B82F6]" />
                  </div>
                  <div className="absolute bottom-0 inset-x-0 h-0.5 bg-[#3B82F6] opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </div>

                {/* Content Details */}
                <div className="p-3.5 sm:p-4 space-y-2">
                  <div>
                    <h3
                      onClick={() => setSelectedMember(member)}
                      className="text-[15px] sm:text-[16px] font-bold text-[#141212] leading-snug group-hover:text-[#3B82F6] transition-colors cursor-pointer"
                    >
                      {member.name}
                    </h3>
                    <p className="text-[11.5px] font-semibold text-[#FB1D10] mt-0.5 line-clamp-1">
                      {member.role}
                    </p>
                  </div>

                  {/* Credentials badge */}
                  <div className="px-2 py-1 bg-neutral-50 border border-neutral-200/70 text-[9.5px] font-mono text-neutral-600 leading-snug break-words">
                    {member.credentials}
                  </div>

                  {/* Bio */}
                  <p className="text-[11.5px] text-neutral-600 leading-relaxed line-clamp-3">
                    {member.bio}
                  </p>
                </div>
              </div>

              {/* Action Buttons Footer: View CV + Clean Icon Buttons */}
              <div className="p-3 pt-2.5 border-t border-neutral-100 bg-neutral-50/90 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedMember(member)}
                  className="flex-1 py-1.5 px-2 bg-neutral-900 hover:bg-[#3B82F6] text-white text-[10.5px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <FileText size={12} />
                  <span>View CV</span>
                </button>

                <div className="flex items-center gap-1.5">
                  {member.email && (
                    <a
                      href={`mailto:${member.email}`}
                      title={member.email}
                      className="w-7 h-7 rounded-none bg-blue-50 hover:bg-[#3B82F6] text-[#3B82F6] hover:text-white border border-[#3B82F6]/30 flex items-center justify-center transition-colors shadow-xs"
                      aria-label="Send Email"
                    >
                      <Mail size={13} />
                    </a>
                  )}

                  {member.phone && (
                    <a
                      href={`tel:${member.phone}`}
                      title={member.phone}
                      className="w-7 h-7 rounded-none bg-red-50 hover:bg-[#FB1D10] text-[#FB1D10] hover:text-white border border-[#FB1D10]/30 flex items-center justify-center transition-colors shadow-xs"
                      aria-label="Call Number"
                    >
                      <Phone size={13} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* =========================================================================
            HUMAN RESOURCES & EXPERT ENGAGEMENT NETWORK (SLIDE 41 FROM PPT)
            ========================================================================= */}
        <div className="mt-16 bg-[#141212] text-white p-8 sm:p-10 border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="max-w-[1200px] space-y-6 relative z-10">
            <div className="space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#3B82F6] font-bold block">
                HUMAN RESOURCES &amp; EXPERT MOBILIZATION
              </span>
              <h2 className="text-[26px] sm:text-[34px] font-extrabold tracking-tight text-white leading-tight">
                Multidisciplinary Expert Engagement Network
              </h2>
              <div className="w-16 h-1 bg-[#FB1D10] rounded-full" />
            </div>

            <p className="text-[13.5px] sm:text-[14.5px] text-neutral-300 leading-relaxed max-w-4xl">
              Geospatial Works combines its core in-house technical capabilities with an extensive network of nationally and internationally experienced engineers, consultants, researchers, and subject-matter specialists. Through project-based and assignment-specific engagement arrangements, we identify and mobilize qualified professionals according to project scope, technical requirements, budget, and availability.
            </p>

            <div className="pt-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 font-bold block mb-3">
                Covered Disciplines &amp; Sectoral Capabilities
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 text-xs">
                {[
                  'Roads & Highways',
                  'Railway Infrastructure',
                  'Bridges & Viaducts',
                  'Buildings & High-Rise',
                  'Resort Developments',
                  'Water Resources',
                  'Drainage & SWM',
                  'Agricultural Systems',
                  'Environmental Mgmt',
                  'Geospatial Engineering',
                  'Quality Surveying',
                  'Quantity & BOQ Estimating',
                ].map((item, idx) => (
                  <div key={idx} className="bg-white/5 border border-white/10 p-2.5 rounded text-neutral-200 flex items-center gap-1.5 font-medium">
                    <CheckCircle2 size={12} className="text-[#3B82F6] shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white">Have a Specific Project Requirement?</h3>
                <p className="text-xs text-neutral-400">
                  Share your Terms of Reference (ToR) or scope of work. We will connect you with suitable experts and propose a tailored technical team.
                </p>
              </div>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#FB1D10] hover:bg-[#d92a20] text-white text-[12px] font-bold uppercase tracking-wider transition-all shadow-md shrink-0"
              >
                <span>Share Scope / Submit ToR</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>

        {/* Keep in Touch Pre-Footer */}
        <div className="mt-16 pt-10 border-t border-neutral-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div>
            <h2 className="text-[26px] sm:text-[32px] font-extrabold tracking-tight leading-none text-[#141212]">
              Work With Our Leadership
            </h2>
            <p className="text-[14px] text-neutral-600 mt-1">
              Collaborate directly with our technical leads and licensed specialists on your next infrastructure assignment.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FB1D10] hover:bg-[#D91B0F] text-white text-[12px] font-bold uppercase tracking-wider transition-all shadow-sm"
            >
              <span>Contact our team</span>
              <ArrowRight size={13} />
            </Link>
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-neutral-300 hover:border-black text-neutral-900 text-[12px] font-bold uppercase tracking-wider transition-all"
            >
              <span>View verified projects</span>
            </Link>
          </div>
        </div>
      </div>

      {/* =========================================================================
          ELEGANT ARCHITECTURAL CV SLIDE-OVER DRAWER
          Formatted with structured sections: Career Profile, Education, Licenses, Software & Projects
          ========================================================================= */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Smooth Backdrop */}
          <div
            onClick={() => setSelectedMember(null)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
          />

          {/* Drawer Container */}
          <div className="relative w-full max-w-[680px] bg-white text-[#141212] h-full shadow-2xl z-10 flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
            {/* Header: Dark Architectural Bar */}
            <div className="p-5 sm:p-6 bg-[#141212] text-white flex items-start justify-between gap-4 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-16 h-20 bg-neutral-900 border border-white/20 overflow-hidden shrink-0 aspect-[4/5] shadow-md">
                  <img
                    src={selectedMember.image}
                    alt={selectedMember.name}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-[#FB1D10] uppercase tracking-widest font-bold block">
                    {selectedMember.category}
                  </span>
                  <h3 className="text-[20px] sm:text-[23px] font-bold text-white tracking-tight leading-tight mt-0.5">
                    {selectedMember.name}
                  </h3>
                  <p className="text-[12.5px] text-neutral-300 font-medium">
                    {selectedMember.role}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedMember(null)}
                className="w-8 h-8 rounded-none border border-white/20 hover:border-white text-white/80 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                aria-label="Close CV panel"
              >
                <X size={18} />
              </button>
            </div>

            {/* Quick Action Contact Strip */}
            <div className="px-4 sm:px-6 py-3 bg-neutral-100 border-b border-neutral-200 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
              <div className="flex flex-wrap items-center gap-2">
                {selectedMember.email && (
                  <a
                    href={`mailto:${selectedMember.email}`}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-[#3B82F6] hover:bg-[#2563EB] text-white text-[10.5px] font-bold uppercase tracking-wider transition-colors shadow-xs max-w-[210px] truncate"
                  >
                    <Mail size={12} className="shrink-0" />
                    <span className="truncate">{selectedMember.email}</span>
                  </a>
                )}
                {selectedMember.phone && (
                  <a
                    href={`tel:${selectedMember.phone}`}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 border border-neutral-300 hover:border-neutral-900 bg-white text-neutral-900 text-[10.5px] font-bold uppercase tracking-wider transition-colors shrink-0"
                  >
                    <Phone size={12} className="text-[#FB1D10] shrink-0" />
                    <span>{selectedMember.phone}</span>
                  </a>
                )}
              </div>
              <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider hidden sm:inline">
                Curriculum Vitae
              </span>
            </div>

            {/* Scrollable Structured Content */}
            <div className="p-6 overflow-y-auto space-y-7 flex-1 font-sans text-neutral-800">
              {/* 1. Professional Profile & Overview */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 border-b border-neutral-200 pb-2">
                  <UserCheck size={16} className="text-[#3B82F6]" />
                  <h4 className="text-[12px] font-mono font-bold uppercase tracking-wider text-neutral-900">
                    Professional Summary
                  </h4>
                </div>
                <p className="text-[13.5px] leading-relaxed text-neutral-700">
                  {selectedMember.structuredCv?.summary || selectedMember.bio}
                </p>
              </div>

              {/* 2. Educational Background */}
              {selectedMember.structuredCv?.education && selectedMember.structuredCv.education.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 border-b border-neutral-200 pb-2">
                    <GraduationCap size={16} className="text-[#FB1D10]" />
                    <h4 className="text-[12px] font-mono font-bold uppercase tracking-wider text-neutral-900">
                      Education &amp; Academic Qualifications
                    </h4>
                  </div>
                  <div className="space-y-2">
                    {selectedMember.structuredCv.education.map((edu, idx) => (
                      <div key={idx} className="p-3 bg-neutral-50 border border-neutral-200/80 flex items-start justify-between gap-3">
                        <div>
                          <span className="font-bold text-[13px] text-[#141212] block">
                            {edu.degree}
                          </span>
                          {edu.institution && (
                            <span className="text-[12px] text-neutral-600 block mt-0.5">
                              {edu.institution}
                            </span>
                          )}
                        </div>
                        {edu.year && (
                          <span className="text-[11px] font-mono text-[#3B82F6] font-bold shrink-0">
                            {edu.year}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Professional Registrations & Licensures */}
              {selectedMember.structuredCv?.registrations && selectedMember.structuredCv.registrations.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 border-b border-neutral-200 pb-2">
                    <Award size={16} className="text-[#3B82F6]" />
                    <h4 className="text-[12px] font-mono font-bold uppercase tracking-wider text-neutral-900">
                      Professional Memberships &amp; Licensures
                    </h4>
                  </div>
                  <ul className="space-y-1.5">
                    {selectedMember.structuredCv.registrations.map((reg, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-[12.5px] text-neutral-700">
                        <CheckCircle2 size={14} className="text-[#3B82F6] shrink-0 mt-0.5" />
                        <span>{reg}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 4. Software & Technical Toolchain */}
              {selectedMember.structuredCv?.software && selectedMember.structuredCv.software.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 border-b border-neutral-200 pb-2">
                    <Layers size={16} className="text-[#FB1D10]" />
                    <h4 className="text-[12px] font-mono font-bold uppercase tracking-wider text-neutral-900">
                      Technical Toolchain &amp; Engineering Software
                    </h4>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedMember.structuredCv.software.map((sw, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-neutral-100 border border-neutral-200 text-neutral-800 text-[11px] font-mono font-medium"
                      >
                        {sw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. Chronological Experience & Projects */}
              {selectedMember.structuredCv?.experience && selectedMember.structuredCv.experience.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 border-b border-neutral-200 pb-2">
                    <Briefcase size={16} className="text-[#3B82F6]" />
                    <h4 className="text-[12px] font-mono font-bold uppercase tracking-wider text-neutral-900">
                      Key Career Experience &amp; National Projects
                    </h4>
                  </div>
                  <div className="space-y-3.5">
                    {selectedMember.structuredCv.experience.map((exp, idx) => (
                      <div key={idx} className="p-3.5 bg-neutral-50/80 border border-neutral-200 space-y-1.5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <span className="font-bold text-[13.5px] text-[#141212]">
                            {exp.role}
                          </span>
                          <span className="text-[11px] font-mono text-[#FB1D10] font-semibold shrink-0">
                            {exp.period}
                          </span>
                        </div>
                        <div className="text-[12px] font-medium text-neutral-600 flex items-center gap-1.5">
                          <Building size={12} className="text-neutral-400" />
                          <span>{exp.company}</span>
                        </div>
                        <p className="text-[12px] text-neutral-700 leading-relaxed pt-1">
                          {exp.highlights}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-[#141212] border-t border-white/10 text-center shrink-0 flex items-center justify-between px-6">
              <span className="text-[11px] font-mono text-neutral-400">
                Geospatial Works Technical Advisory
              </span>
              <button
                type="button"
                onClick={() => setSelectedMember(null)}
                className="text-[11px] font-bold uppercase text-white hover:text-[#FB1D10] transition-colors cursor-pointer"
              >
                Close Panel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
