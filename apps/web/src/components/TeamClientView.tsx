'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ShieldCheck,
  Award,
  Layers,
  Building,
} from 'lucide-react';
import teamData from '@/data/teamMembers.json';

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
}

export default function TeamClientView() {
  const [activeCategory, setActiveCategory] = useState<string>('All');
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
            <div className="md:col-span-4 lg:col-span-3 aspect-[4/5] max-w-[220px] w-full mx-auto md:mx-0 bg-neutral-900 border border-white/10 overflow-hidden relative shadow-lg group">
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

            {/* Content Details */}
            <div className="md:col-span-8 lg:col-span-9 space-y-2.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/10 text-white font-mono text-[9px] uppercase tracking-wider border border-white/10">
                <ShieldCheck size={11} className="text-[#3B82F6]" />
                <span>Executive Technical Director &amp; Head of Geodetic Engineering</span>
              </div>

              <div>
                <h2 className="text-[22px] sm:text-[26px] font-extrabold text-white tracking-tight">
                  {leader.name}
                </h2>
                <p className="text-[12px] font-semibold text-[#FB1D10] tracking-wide mt-0.5">
                  {leader.role}
                </p>
              </div>

              <p className="text-[11px] font-mono text-neutral-400">
                {leader.credentials}
              </p>
              <p className="text-[12.5px] text-neutral-300 leading-relaxed max-w-[800px]">
                {leader.bio}
              </p>
            </div>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="mb-8 border-b border-neutral-200">
          <div className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-[#141212] text-white shadow-xs'
                    : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
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
                <div className="aspect-[4/5] overflow-hidden bg-neutral-900 relative border-b border-neutral-100 flex items-center justify-center">
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
                  <div className="absolute bottom-0 inset-x-0 h-0.5 bg-[#3B82F6] opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </div>

                {/* Content Details */}
                <div className="p-4 sm:p-5 space-y-2.5">
                  <div>
                    <h3 className="text-[16px] sm:text-[17px] font-bold text-[#141212] leading-snug group-hover:text-[#3B82F6] transition-colors">
                      {member.name}
                    </h3>
                    <p className="text-[12px] font-semibold text-[#FB1D10] mt-0.5 line-clamp-1">
                      {member.role}
                    </p>
                  </div>

                  {/* Credentials badge */}
                  <div className="px-2.5 py-1.5 bg-neutral-50 border border-neutral-200/70 text-[10px] font-mono text-neutral-600 leading-snug break-words">
                    {member.credentials}
                  </div>

                  {/* Bio */}
                  <p className="text-[12px] text-neutral-600 leading-relaxed line-clamp-4">
                    {member.bio}
                  </p>
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
              <h2 className="text-[26px] sm:text-[32px] font-extrabold tracking-tight">
                Specialized Survey Crews &amp; National Consultant Network
              </h2>
              <p className="text-[13.5px] text-neutral-300 leading-relaxed max-w-[850px]">
                In addition to our permanent leadership and core technical team, Geospatial Works maintains active deployment rosters of senior professional consultants, CAAB-certified UAV drone pilots, hydrographic sonar survey teams, and geodetic field chainmen ready to mobilize nationwide across Bangladesh.
              </p>
            </div>

            {/* 3-Column Resource Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-white/10">
              <div className="p-4 bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center gap-2 text-[#3B82F6]">
                  <Award size={16} />
                  <h4 className="text-[13px] font-bold uppercase tracking-wider text-white">Geodetic &amp; Cadastral Crews</h4>
                </div>
                <p className="text-[11.5px] text-neutral-400 leading-relaxed">
                  25+ trained survey technicians and chainmen experienced in RTK GNSS baselines, total station traverses, and mouza boundary adjustments.
                </p>
              </div>

              <div className="p-4 bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center gap-2 text-[#FB1D10]">
                  <Layers size={16} />
                  <h4 className="text-[13px] font-bold uppercase tracking-wider text-white">GIS &amp; Remote Sensing Lab</h4>
                </div>
                <p className="text-[11.5px] text-neutral-400 leading-relaxed">
                  Dedicated geospatial analysts specialized in satellite imagery processing, ArcGIS Pro automation, QGIS spatial modeling, and web GIS portals.
                </p>
              </div>

              <div className="p-4 bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center gap-2 text-[#3B82F6]">
                  <Building size={16} />
                  <h4 className="text-[13px] font-bold uppercase tracking-wider text-white">Civil &amp; CAD Design Studio</h4>
                </div>
                <p className="text-[11.5px] text-neutral-400 leading-relaxed">
                  AutoCAD Civil 3D modelers and structural designers producing corridor alignments, drainage profiles, building blueprints, and structural calculations.
                </p>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FB1D10] hover:bg-[#D91509] text-white text-[12px] font-bold uppercase tracking-wider transition-colors shadow-md"
              >
                <span>Mobilize Technical Team</span>
                <ArrowRight size={14} />
              </Link>
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-white/30 hover:border-white text-white text-[12px] font-bold uppercase tracking-wider transition-colors"
              >
                <span>View verified projects</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
