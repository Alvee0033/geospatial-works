'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { contactAddress, phoneHref } from '@/lib/contact-info';
import { usePublicContactInfo } from '@/hooks/use-public-contact-info';
import {
  Search,
  ChevronDown,
  ArrowRight,
  MapPin,
  Building2,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  X,
  CheckCircle2,
  Award,
  Sparkles,
} from 'lucide-react';

import type { ProjectData } from '@/lib/cms-api';

interface ProjectsClientViewProps {
  initialProjects?: ProjectData[];
  wysiwyg?: {
    heroEyebrow?: string;
    heroTitle?: string;
    heroDescription?: string;
    heroImage?: string;
  };
}

export default function ProjectsClientView({ initialProjects = [], wysiwyg }: ProjectsClientViewProps) {
  const contactInfo = usePublicContactInfo();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'default' | 'alpha'>('default');
  const [featuredIndex, setFeaturedIndex] = useState<number>(0);
  const [showFeatured, setShowFeatured] = useState<boolean>(true);

  const projects = initialProjects;

  const categories = [
    { label: `All (${projects.length})`, value: 'All' },
    ...Array.from(new Set(projects.map((project) => project.category))).map((category) => ({ label: category, value: category })),
  ];

  const filteredProjects = useMemo(() => {
    return projects
      .filter((p) => {
        const matchesCategory =
          selectedCategory === 'All' ||
          p.category.toLowerCase().includes(selectedCategory.toLowerCase()) ||
          p.title.toLowerCase().includes(selectedCategory.toLowerCase());
        const matchesQuery =
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.location && p.location.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesQuery;
      })
      .sort((a, b) => {
        if (sortOrder === 'alpha') {
          return a.title.localeCompare(b.title);
        }
        return 0;
      });
  }, [projects, selectedCategory, searchQuery, sortOrder]);

  const heroEyebrow = wysiwyg?.heroEyebrow || '05 / VERIFIED LANDMARKS & INFRASTRUCTURE';
  const heroTitle = wysiwyg?.heroTitle || 'Our National Impact: Grounded in Ground Truth';
  const heroDescription =
    wysiwyg?.heroDescription ||
    'From the Bangladesh Railway connectivity network to inter-district bus terminals, RCC girder bridges, and high-rise towers, explore our physical engineering milestones.';
  const heroImage = wysiwyg?.heroImage || '/projects-extracted/page_31/img_01.jpg';

  // Featured Landmark Projects List (filtered by milestone or top selected)
  const milestoneProjects = useMemo(() => {
    const ms = projects.filter((p) => p.isMilestone);
    return ms.length > 0 ? ms : projects.slice(0, 5);
  }, [projects]);


  return (
    <div className="bg-white text-[#141212] font-sans antialiased">
      {/* =========================================================================
          CINEMATIC ARCHITECTURAL HERO BANNER
          ========================================================================= */}
      <section className="relative bg-[#141212] text-white pt-36 pb-20 md:pb-28 overflow-hidden border-b border-neutral-800">
        <div className="absolute inset-0 z-0 opacity-25">
          <Image src={heroImage} alt="Projects and National Impact" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-r from-[#141212] via-[#141212]/90 to-transparent" />
        </div>

        <div className="relative z-10 max-w-[1440px] mx-auto px-6 md:px-12 space-y-6">
          <div className="flex items-center gap-2 text-[12px] uppercase tracking-wider text-neutral-400 font-bold">
            <Link href="/" className="hover:text-[#F4382D] transition">Home</Link>
            <ChevronRight size={12} className="text-neutral-500" />
            <span className="text-white">Our National Impact &amp; Projects</span>
          </div>

          <div className="max-w-4xl space-y-4">
            <span className="inline-block text-[12px] font-mono uppercase tracking-[0.2em] text-[#F4382D] font-bold">
              {heroEyebrow}
            </span>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-[-0.03em] text-white leading-[1.05]">
              {heroTitle}
            </h1>
            <p className="text-base sm:text-lg text-neutral-300 leading-relaxed font-normal max-w-3xl">
              {heroDescription}
            </p>
          </div>
        </div>
      </section>



      {/* =========================================================================
          FILTER TOOLBAR & SEARCH
          ========================================================================= */}
      <section className="max-w-[1440px] mx-auto px-6 md:px-12 pt-8 pb-5">
        <div className="border-y border-neutral-200 py-5 md:py-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <label className="relative block w-full sm:max-w-[420px]">
                <span className="sr-only">Search projects by name, client, or place</span>
                <Search size={17} aria-hidden="true" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1B4B9D]" />
                <input
                  type="search"
                  placeholder="Search by name, client or place"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-12 w-full border border-neutral-300 bg-white pl-11 pr-11 text-sm text-[#141212] outline-none transition placeholder:text-neutral-500 focus:border-[#1B4B9D] focus:ring-2 focus:ring-[#1B4B9D]/10"
                />
                {searchQuery && (
                  <button type="button" onClick={() => setSearchQuery('')} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-500 hover:text-[#FB1D10]">
                    <X size={16} />
                  </button>
                )}
              </label>
              <div className="flex items-center gap-2 sm:justify-end">
                <label htmlFor="project-sort" className="shrink-0 text-xs font-medium text-neutral-600">Sort by</label>
                <div className="relative min-w-0 flex-1 sm:flex-none">
                  <select
                    id="project-sort"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as 'default' | 'alpha')}
                    className="h-11 w-full appearance-none border border-neutral-300 bg-white py-2 pl-3 pr-9 text-sm text-[#141212] outline-none transition focus:border-[#1B4B9D] sm:w-[170px]"
                  >
                    <option value="default">Site order</option>
                    <option value="alpha">Name A–Z</option>
                  </select>
                  <ChevronDown size={15} aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-xs font-semibold text-neutral-600">Project type</span>
              <div className="hidden flex-wrap gap-2 sm:flex sm:justify-end" aria-label="Filter by project type">
                {categories.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    aria-pressed={selectedCategory === c.value}
                    onClick={() => setSelectedCategory(c.value)}
                    className={`min-h-9 border px-3 text-xs font-semibold transition-colors ${
                      selectedCategory === c.value
                        ? 'border-[#1B4B9D] bg-[#1B4B9D] text-white'
                        : 'border-neutral-300 bg-white text-neutral-700 hover:border-[#1B4B9D] hover:text-[#1B4B9D]'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
              <div className="relative sm:hidden">
                <label htmlFor="project-category" className="sr-only">Choose a project type</label>
                <select
                  id="project-category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="h-11 w-full appearance-none border border-neutral-300 bg-white px-3 pr-9 text-sm text-[#141212] outline-none focus:border-[#1B4B9D]"
                >
                  {categories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
                <ChevronDown size={15} aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              </div>
              <p className="text-xs text-neutral-500 sm:text-right" aria-live="polite">
                Showing {filteredProjects.length} of {projects.length} projects
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          PROJECT CARDS GRID (WHITE TITLES UP ON IMAGE)
          ========================================================================= */}
      <section className="max-w-[1440px] mx-auto px-6 md:px-12 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((p) => (
            <div
              key={p.id || p.slug}
              className="border border-neutral-200 rounded-2xl bg-white flex flex-col group hover:shadow-2xl hover:border-neutral-300 transition-all duration-300 overflow-hidden"
            >
              {/* IMAGE WITH GRADIENT AND TITLE UP IN WHITE */}
              <div className="relative aspect-[16/10] bg-neutral-900 overflow-hidden">
                {p.imageUrl ? (
                  <Image
                    src={p.imageUrl}
                    alt={p.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-400 text-xs font-mono">
                    Project Image
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent pointer-events-none" />

                {/* Top badges: flex container with wrap & gap so they never collide or overlap */}
                <div className="absolute top-3 left-3 right-3 flex flex-wrap items-center justify-between gap-1.5 pointer-events-none">
                  <div className="bg-black/85 backdrop-blur-md text-[#60A5FA] border border-white/10 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider font-bold rounded shadow-xs max-w-[55%] truncate">
                    {p.category}
                  </div>

                  {p.location && (
                    <div className="bg-black/75 backdrop-blur-md text-white/90 px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 border border-white/5 shadow-xs max-w-[45%]">
                      <MapPin size={10} className="text-[#F4382D] shrink-0" />
                      <span className="truncate">{p.location}</span>
                    </div>
                  )}
                </div>

                {/* TITLE UP IN WHITE ON IMAGE */}
                <div className="absolute bottom-3 left-3.5 right-3.5">
                  <h3 className="text-[15px] sm:text-[17px] font-extrabold text-white leading-snug drop-shadow-md group-hover:text-blue-200 transition-colors line-clamp-2">
                    {p.title}
                  </h3>
                </div>
              </div>

              {/* CARD DETAILS */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-3">
                <div className="space-y-2">
                  <div className="text-xs text-neutral-700 font-medium leading-snug bg-neutral-50 rounded-lg p-2.5 border border-neutral-100">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 block mb-0.5">
                      Client / Authority
                    </span>
                    <span className="font-semibold text-neutral-900 block break-words">
                      {p.client}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600 leading-relaxed line-clamp-3">
                    {p.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                  <span className="font-mono text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                    1ST CLASS CONTRACTOR
                  </span>
                  <Link
                    href={`/projects/${p.slug}`}
                    className="inline-flex items-center gap-1 font-bold text-[#F4382D] hover:underline"
                  >
                    <span>View Project</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-20 text-neutral-500 text-sm">
            No projects match your search. Try another name or place.
          </div>
        )}
      </section>

      {/* PRE-FOOTER CTA */}
      <section className="bg-[#141212] text-white py-20 border-t border-neutral-800">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="space-y-2">
            <span className="text-[12px] font-mono font-bold text-[#F4382D] uppercase tracking-wider">
              START A GEOSPATIAL PROJECT
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Ready to Survey Your Next Infrastructure Corridor?
            </h2>
            <p className="text-sm text-neutral-400">
              {contactInfo && <>{contactAddress(contactInfo)}{contactInfo.phone && <> · <a href={phoneHref(contactInfo.phone)} className="hover:text-white">{contactInfo.phone}</a></>}{contactInfo.email && <> · <a href={`mailto:${contactInfo.email}`} className="hover:text-white">{contactInfo.email}</a></>}</>}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/contact" className="wsp-btn wsp-btn-solid">Contact Our Surveyors</Link>
            <Link href="/services" className="wsp-btn wsp-btn-outline">Browse Disciplines</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
