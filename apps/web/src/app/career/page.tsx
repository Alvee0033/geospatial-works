'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ChevronRight,
  Briefcase,
  MapPin,
  CheckCircle2,
  Send,
  Sparkles,
  Search,
  Filter,
  Clock,
  Layers,
  Calendar,
  Eye,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import CorporateShell from '@/components/CorporateShell';
import { JobApplicationModal } from '@/components/JobApplicationModal';
import '../corporate.css';

interface Role {
  id: string;
  slug?: string;
  title: string;
  department: string;
  location: string;
  type: string;
  summary: string;
  description?: string;
  qualifications: string[];
  responsibilities?: string[];
  experienceLevel?: string;
  salaryRange?: string;
  deadline?: string;
}

const fallbackJobOpenings: Role[] = [
  {
    id: 'lead-geodetic-surveyor',
    title: 'Lead Geodetic Surveyor (RTK & Total Station)',
    department: 'Geodesy & Ground Survey',
    location: 'Dhaka & Field Locations, Bangladesh',
    type: 'Full-time / Permanent',
    summary: 'Lead primary geodetic control networks, SOB benchmark tying, and high-precision topographic surveys for landmark bridge, rail, and expressway alignments.',
    description: 'Geospatial Works is seeking a seasoned Lead Geodetic Surveyor to spearhead millimeter-grade control networks across Bangladesh infrastructure mega-projects. You will coordinate field teams, verify instrument calibrations, and interface directly with chief consultant engineers.',
    qualifications: [
      'B.Sc. or Diploma in Surveying / Geomatics / Civil Engineering',
      '5+ years hands-on experience with Trimble/Leica GNSS RTK and robotic total stations',
      'Proficiency in network least-squares adjustment and Civil 3D surface modeling',
    ],
    responsibilities: [
      'Establish high-order geodetic control stations tied to Survey of Bangladesh benchmarks',
      'Conduct static GNSS campaigns and post-process baseline vectors',
      'Supervise junior surveyors on bridge alignments, expressway corridors, and rail tangents',
      'Prepare statutory survey reports, QA/QC documentation, and coordinate transforms',
    ],
    experienceLevel: '5+ Years',
    salaryRange: 'Negotiable / Attractive Standard',
  },
  {
    id: 'uav-flight-operator',
    title: 'Commercial UAV Flight Operator & Photogrammetrist',
    department: 'Aerial Survey & Drone Fleet',
    location: 'Dhaka & Field Deployments',
    type: 'Full-time',
    summary: 'Command DJI Enterprise drone fleets (M350 RTK, Phantom 4 RTK) for multi-temporal corridor mapping, photogrammetry, and LiDAR data collection.',
    description: 'Join our cutting-edge aerial survey division deploying high-end RTK/LiDAR drones across deltaic corridors and urban megacities. You will be responsible for mission planning, airspace compliance, and photogrammetric surface reconstructions.',
    qualifications: [
      'Certified commercial drone pilot with CAAB flight protocol knowledge',
      '3+ years experience with Pix4Dmapper, DJI Terra, or Agisoft Metashape',
      'Strong safety mindset and ability to manage field ground control points (GCPs)',
    ],
    responsibilities: [
      'Execute automated grid and corridor UAV flight plans with centimeter RTK accuracy',
      'Ensure CAAB safety compliance and battery health management',
      'Process aerial imagery into dense point clouds, DEMs, and orthomosaics',
    ],
    experienceLevel: '3+ Years',
    salaryRange: 'Negotiable',
  },
  {
    id: 'enterprise-gis-analyst',
    title: 'Enterprise GIS & PostGIS Spatial Developer',
    department: 'Spatial Intelligence & Digital Twins',
    location: 'Dhaka Headquarters',
    type: 'Full-time',
    summary: 'Architect PostgreSQL/PostGIS spatial databases, vector tile servers, and interactive web mapping portals for municipal digital twin projects.',
    description: 'We are expanding our Spatial Intelligence lab with an Enterprise GIS Developer passionate about scalable spatial queries, 3D tiles, and cloud-native geospatial stacks.',
    qualifications: [
      'Degree in GIS, Computer Science, Urban Planning, or related discipline',
      'Strong SQL/PostGIS skills and experience with Python (GeoPandas, GDAL/OGR)',
      'Experience building web GIS interfaces using Leaflet, Mapbox, or OpenLayers',
    ],
    responsibilities: [
      'Build automated ETL pipelines for spatial data ingestion and topological cleaning',
      'Design high-throughput PostGIS database schemas for municipal utility networks',
      'Develop responsive web mapping dashboards for client stakeholders',
    ],
    experienceLevel: '2-4 Years',
    salaryRange: 'Competitive',
  },
  {
    id: 'hydrographic-survey-engineer',
    title: 'Hydrographic & Bathymetric Survey Engineer',
    department: 'Marine & Water Resources',
    location: 'River Basin Sites & Dhaka HQ',
    type: 'Full-time',
    summary: 'Conduct riverbed bathymetric echo sounding, ADCP velocity profiling, and scour monitoring in Bangladesh’s major delta river corridors.',
    description: 'Spearhead bathymetric charting and hydraulic discharge assessments across Bangladesh’s dynamic braided river systems using dual-frequency echosounders and ADCPs.',
    qualifications: [
      'Degree in Oceanography, Water Resources Engineering, or Hydrography',
      'Familiarity with digital echo sounders, Hypack software, and RTK motion sensors',
      'Willingness to travel on survey vessels in tidal and riverine environments',
    ],
    responsibilities: [
      'Mobilize single/multibeam sonars and ADCP sensors on survey vessels',
      'Execute transect navigation and sound velocity profiling',
      'Process raw bathymetric sounding data into 3D riverbed models',
    ],
    experienceLevel: '3+ Years',
    salaryRange: 'Competitive + Allowances',
  },
  {
    id: 'subsurface-utility-engineer',
    title: 'Subsurface Utility Engineering (SUE) Specialist',
    department: 'Underground Infrastructure',
    location: 'Dhaka Metropolitan',
    type: 'Full-time',
    summary: 'Operate ground penetrating radar (GPR) and precision electromagnetic cable/pipe locators to detect buried municipal utility corridors.',
    description: 'Protect buried pipelines and power networks by accurately mapping underground infrastructure using advanced dual-frequency GPR and induction locators.',
    qualifications: [
      'Diploma/Degree in Geophysics, Electrical, or Civil Engineering',
      'Experience interpreting GPR radargrams and electromagnetic induction data',
      'Understanding of ASCE 38-02 Subsurface Utility Engineering guidelines',
    ],
    responsibilities: [
      'Scan arterial city roads with multi-channel GPR carts',
      'Mark buried pipes, telecom ducts, and gas mains with precision coordinates',
      'Convert geophysical signatures into AutoCAD and GIS utility models',
    ],
    experienceLevel: '2+ Years',
    salaryRange: 'Competitive',
  },
];

export default function CareerPage() {
  const [roles, setRoles] = useState<Role[]>(fallbackJobOpenings);
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [applyingJob, setApplyingJob] = useState<Role | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [expandedRoleIds, setExpandedRoleIds] = useState<Record<string, boolean>>({});

  // Mouse Drag to Scroll for Department Pills
  const pillsRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const hasMovedRef = useRef(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!pillsRef.current) return;
    isDraggingRef.current = true;
    hasMovedRef.current = false;
    startXRef.current = e.pageX - pillsRef.current.offsetLeft;
    scrollLeftRef.current = pillsRef.current.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !pillsRef.current) return;
    e.preventDefault();
    const x = e.pageX - pillsRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.6; // Scroll speed multiplier
    if (Math.abs(walk) > 4) {
      hasMovedRef.current = true;
    }
    pillsRef.current.scrollLeft = scrollLeftRef.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    isDraggingRef.current = false;
  };

  // Fetch dynamic jobs from API
  useEffect(() => {
    fetch('/api/careers/jobs')
      .then((res) => {
        if (!res.ok) throw new Error('API failed');
        return res.json();
      })
      .then((data: Role[]) => {
        if (Array.isArray(data) && data.length > 0) {
          const parsed = data.map((j) => ({
            ...j,
            qualifications: Array.isArray(j.qualifications)
              ? j.qualifications
              : typeof j.qualifications === 'string'
              ? (j.qualifications as string).split(',')
              : [],
            responsibilities: Array.isArray(j.responsibilities)
              ? j.responsibilities
              : typeof j.responsibilities === 'string'
              ? (j.responsibilities as string).split(',')
              : [],
          }));
          setRoles(parsed);
        }
      })
      .catch((err) => {
        console.warn('Using fallback career roles:', err);
      });
  }, []);

  // Compute unique departments dynamically
  const departments = [
    'All',
    ...Array.from(new Set(roles.map((r) => r.department).filter(Boolean))),
  ];

  // Filter roles by search query and department
  const filteredRoles = roles.filter((role) => {
    const matchesDept = selectedDept === 'All' || role.department === selectedDept;
    const matchesSearch =
      role.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.department.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesSearch;
  });

  const toggleExpand = (id: string) => {
    setExpandedRoleIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleApplyClick = (role: Role) => {
    setApplyingJob(role);
    setModalOpen(true);
  };

  const handleGeneralApply = () => {
    setApplyingJob(null);
    setModalOpen(true);
  };

  return (
    <CorporateShell>
      <main className="wsp-career-main bg-white text-[#141212] font-sans antialiased">
        {/* =========================================================================
            HEADER & HERO NARRATIVE
            ========================================================================= */}
        <section className="relative overflow-hidden bg-white border-b border-neutral-200">
          <div className="max-w-[1440px] mx-auto px-6 md:px-12 pt-16 pb-20">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-[12px] font-semibold tracking-wider uppercase text-neutral-400 mb-8">
              <Link href="/" className="hover:text-[#F4382D] transition">
                Home
              </Link>
              <ChevronRight size={12} />
              <span className="text-neutral-700">Careers</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-8 space-y-6">
                <span className="inline-block text-[12px] font-extrabold uppercase tracking-[0.16em] text-[#F4382D]">
                  JOIN GEOSPATIAL WORKS
                </span>
                <h1 className="text-[44px] sm:text-[56px] lg:text-[64px] font-black tracking-[-0.03em] leading-[1.05] text-[#141212]">
                  Shape the nation’s infrastructure from ground to sky.
                </h1>
                <p className="text-[17px] sm:text-[19px] text-neutral-600 font-normal leading-relaxed max-w-2xl">
                  We are looking for forward-thinking surveyors, drone pilots, bathymetric hydrographers, and spatial data engineers eager to lead Bangladesh’s digital spatial transformation.
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-4">
                  <a href="#openings" className="wsp-btn wsp-btn-solid text-[14px]">
                    View Open Positions ({roles.length})
                  </a>
                  <button
                    onClick={handleGeneralApply}
                    className="wsp-btn wsp-btn-outline-dark text-[14px] cursor-pointer"
                  >
                    Submit General Application
                  </button>
                </div>
              </div>

              <div className="lg:col-span-4 bg-neutral-50 p-8 border border-neutral-200/90 rounded-2xl space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F4382D]/10 text-[#F4382D] flex items-center justify-center font-bold">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-bold text-[#141212]">Why Build Your Career Here?</h3>
                    <p className="text-[12px] text-neutral-500">Excellence in delta geomatics</p>
                  </div>
                </div>

                <div className="space-y-3.5 text-[13px] text-neutral-600">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 size={16} className="text-[#F4382D] shrink-0 mt-0.5" />
                    <span>Survey-grade DJI Enterprise &amp; RTK fleets at your fingertips</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 size={16} className="text-[#F4382D] shrink-0 mt-0.5" />
                    <span>Landmark national projects for LGED, BADC, DNCC &amp; Railways</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 size={16} className="text-[#F4382D] shrink-0 mt-0.5" />
                    <span>Competitive compensation, field allowances &amp; professional CPD</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            EXPLORE OPEN POSITIONS & HIGHLY-OPTIMIZED FILTERING BAR
            ========================================================================= */}
        <section id="openings" className="max-w-[1440px] mx-auto px-6 md:px-12 py-16">
          {/* Section Header with live count badge */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div className="space-y-1">
              <span className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#F4382D]">
                VACANCIES &amp; OPPORTUNITIES
              </span>
              <h2 className="text-[32px] sm:text-[40px] font-extrabold tracking-[-0.02em] text-[#141212]">
                Explore Open Positions
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-100 text-neutral-700 text-xs font-bold border border-neutral-200">
                <Briefcase size={13} className="text-[#F4382D]" />
                <span>Showing {filteredRoles.length} of {roles.length} vacancies</span>
              </span>
            </div>
          </div>

          {/* Unified Optimized Search & Filter Bar */}
          <div className="bg-white border border-neutral-200/90 rounded-2xl p-4 sm:p-5 shadow-xs mb-10 space-y-4">
            {/* Search Input Row */}
            <div className="relative">
              <Search size={18} className="absolute left-4 top-3.5 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by role title, location, keywords..."
                className="w-full pl-11 pr-4 py-3 bg-neutral-50 hover:bg-neutral-100/70 focus:bg-white border border-neutral-200 rounded-xl text-[14px] text-neutral-900 outline-none focus:border-[#F4382D] focus:ring-2 focus:ring-red-100 transition placeholder:text-neutral-400 font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-3.5 text-xs text-neutral-400 hover:text-neutral-700 font-bold px-2 py-0.5 rounded-md hover:bg-neutral-200 transition cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Mobile Dropdown + Desktop Flex-Wrap Filter (No horizontal side scroll) */}
            <div>
              {/* Mobile Native Dropdown Selector: Clean, Zero horizontal scroll */}
              <div className="block sm:hidden space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  Select Department
                </label>
                <div className="relative">
                  <select
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-bold text-neutral-900 focus:bg-white focus:outline-none focus:border-red-500 appearance-none cursor-pointer"
                  >
                    {departments.map((dept) => {
                      const count =
                        dept === 'All'
                          ? roles.length
                          : roles.filter((r) => r.department === dept).length;
                      return (
                        <option key={dept} value={dept}>
                          {dept} ({count})
                        </option>
                      );
                    })}
                  </select>
                  <ChevronDown size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                </div>
              </div>

              {/* Desktop Filter Pills (Clean flex-wrap without cutoff or side scroll) */}
              <div className="hidden sm:flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 shrink-0 mr-1">
                  Department:
                </span>
                {departments.map((dept) => {
                  const isSelected = selectedDept === dept;
                  const count =
                    dept === 'All'
                      ? roles.length
                      : roles.filter((r) => r.department === dept).length;

                  return (
                    <button
                      key={dept}
                      onClick={() => setSelectedDept(dept)}
                      className={`px-3.5 py-1.5 rounded-xl text-[12px] font-bold transition flex items-center gap-2 cursor-pointer ${
                        isSelected
                          ? 'bg-[#141212] text-white shadow-sm ring-1 ring-black'
                          : 'bg-neutral-50 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 border border-neutral-200'
                      }`}
                    >
                      <span>{dept}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold leading-none ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : 'bg-neutral-200 text-neutral-600'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Minimal Optimized Roles Listing Cards */}
          <div className="space-y-4">
            {filteredRoles.length === 0 ? (
              <div className="p-16 text-center bg-neutral-50 rounded-2xl border border-dashed border-neutral-300 space-y-3">
                <Briefcase size={36} className="mx-auto text-neutral-300" />
                <h3 className="text-[18px] font-bold text-neutral-700">No positions found</h3>
                <p className="text-[13px] text-neutral-500 max-w-md mx-auto">
                  We don't currently have an opening matching "{searchQuery}". You can submit a general application and our recruitment team will reach out as new projects mobilize.
                </p>
                <div className="pt-2">
                  <button
                    onClick={handleGeneralApply}
                    className="wsp-btn wsp-btn-solid text-[13px] px-6 py-2.5 cursor-pointer"
                  >
                    Submit General Application
                  </button>
                </div>
              </div>
            ) : (
              filteredRoles.map((role) => {
                const isExpanded = !!expandedRoleIds[role.id];

                return (
                  <div
                    key={role.id}
                    className="bg-white border border-neutral-200/90 rounded-2xl p-5 sm:p-7 shadow-xs hover:border-neutral-300 hover:shadow-sm transition space-y-4 group"
                  >
                    {/* Header Row: Department, Title, Quick Meta, & Action Buttons */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#F4382D]">
                            {role.department}
                          </span>
                          {role.salaryRange && (
                            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                              {role.salaryRange}
                            </span>
                          )}
                        </div>

                        <h3 className="text-[20px] sm:text-[22px] font-extrabold text-[#141212] group-hover:text-[#F4382D] transition leading-snug">
                          {role.title}
                        </h3>

                        {/* Location & Meta Badges */}
                        <div className="flex flex-wrap items-center gap-3 text-[12px] text-neutral-500 pt-0.5">
                          <span className="flex items-center gap-1 font-medium text-neutral-700">
                            <MapPin size={13} className="text-[#F4382D]" /> {role.location}
                          </span>
                          <span>•</span>
                          <span className="font-medium">{role.type}</span>
                          {role.experienceLevel && (
                            <>
                              <span>•</span>
                              <span className="font-medium text-neutral-700">
                                Exp: {role.experienceLevel}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Right Action Buttons: View Details & Apply */}
                      <div className="flex items-center gap-2.5 shrink-0 self-start lg:self-center">
                        <button
                          type="button"
                          onClick={() => toggleExpand(role.id)}
                          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-neutral-200 hover:border-neutral-300 bg-white text-neutral-700 font-bold text-xs hover:bg-neutral-50 transition cursor-pointer"
                        >
                          <Eye size={14} className="text-neutral-400" />
                          <span>{isExpanded ? 'Hide Details' : 'View Details'}</span>
                          {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleApplyClick(role)}
                          className="wsp-btn wsp-btn-solid text-center text-[13px] py-2.5 px-5 cursor-pointer shadow-xs"
                        >
                          Apply for Role
                        </button>
                      </div>
                    </div>

                    {/* Concise Summary Hook */}
                    <p className="text-[14px] text-neutral-600 leading-relaxed max-w-4xl">
                      {role.summary}
                    </p>

                    {/* Expandable Details Container */}
                    {isExpanded && (
                      <div className="pt-4 border-t border-neutral-100 space-y-4 animate-in fade-in duration-200">
                        {/* Full Role Description if provided */}
                        {role.description && (
                          <div className="p-4 bg-neutral-50/70 rounded-xl border border-neutral-200/70 text-[13px] text-neutral-700 leading-relaxed space-y-1">
                            <span className="font-extrabold text-[11px] uppercase tracking-wider text-neutral-500 block">
                              Scope of Works &amp; Field Context:
                            </span>
                            <p>{role.description}</p>
                          </div>
                        )}

                        {/* Core Duties */}
                        {role.responsibilities && role.responsibilities.length > 0 && (
                          <div className="space-y-2">
                            <span className="block text-[11px] font-extrabold uppercase tracking-[0.1em] text-neutral-500">
                              Core Duties &amp; Field Deliverables:
                            </span>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {role.responsibilities.map((r, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-[12.5px] text-neutral-600">
                                  <span className="text-[#F4382D] font-bold shrink-0 mt-0.5">•</span>
                                  <span>{r}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Qualifications & Requirements */}
                        {role.qualifications && role.qualifications.length > 0 && (
                          <div className="space-y-2 pt-2 border-t border-neutral-100">
                            <span className="block text-[11px] font-extrabold uppercase tracking-[0.1em] text-neutral-500">
                              Key Qualifications &amp; Technical Requirements:
                            </span>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {role.qualifications.map((q, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-[12.5px] text-neutral-600">
                                  <CheckCircle2 size={14} className="text-[#F4382D] shrink-0 mt-0.5" />
                                  <span>{q}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Inline Apply Action within Details */}
                        <div className="pt-2 flex justify-end">
                          <button
                            type="button"
                            onClick={() => handleApplyClick(role)}
                            className="wsp-btn wsp-btn-solid text-xs py-2 px-5 cursor-pointer"
                          >
                            Apply Now for {role.title}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* =========================================================================
            LIFE AT GEOSPATIAL WORKS (3 PILLARS)
            ========================================================================= */}
        <section className="bg-neutral-50 py-24 border-t border-b border-neutral-200">
          <div className="max-w-[1440px] mx-auto px-6 md:px-12">
            <div className="max-w-3xl mb-16 space-y-3">
              <span className="text-[12px] font-extrabold uppercase tracking-[0.16em] text-[#F4382D]">
                OUR CULTURE
              </span>
              <h2 className="text-[32px] sm:text-[42px] font-extrabold tracking-[-0.02em] text-[#141212]">
                Life at Geospatial Works
              </h2>
              <p className="text-[16px] text-neutral-600 leading-relaxed">
                We believe in rigorous engineering, continuous technical mentorship, and equipping our professionals with the latest cutting-edge surveying sensors.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 border border-neutral-200 shadow-sm space-y-4 rounded-2xl">
                <span className="text-[12px] font-bold uppercase tracking-wider text-[#F4382D]">
                  01 / ADVANCED TECH
                </span>
                <h3 className="text-[20px] font-extrabold text-[#141212]">
                  Work with the Best Sensors
                </h3>
                <p className="text-[14px] text-neutral-600 leading-relaxed">
                  Fly survey-grade enterprise drones, operate triple-return LiDAR, deploy ADCP sonar, and process spatial data with modern compute clusters.
                </p>
              </div>

              <div className="bg-white p-8 border border-neutral-200 shadow-sm space-y-4 rounded-2xl">
                <span className="text-[12px] font-bold uppercase tracking-wider text-[#F4382D]">
                  02 / NATION-BUILDING
                </span>
                <h3 className="text-[20px] font-extrabold text-[#141212]">
                  Impact Real Infrastructure
                </h3>
                <p className="text-[14px] text-neutral-600 leading-relaxed">
                  Your surveys and digital twins directly influence Bangladesh’s expressways, river training defenses, deep sea ports, and city water supplies.
                </p>
              </div>

              <div className="bg-white p-8 border border-neutral-200 shadow-sm space-y-4 rounded-2xl">
                <span className="text-[12px] font-bold uppercase tracking-wider text-[#F4382D]">
                  03 / GROWTH &amp; MENTORSHIP
                </span>
                <h3 className="text-[20px] font-extrabold text-[#141212]">
                  Accelerate Your Expertise
                </h3>
                <p className="text-[14px] text-neutral-600 leading-relaxed">
                  Learn directly from licensed surveyors with decades of field tenure, certified CAAB flight instructors, and PostGIS database architects.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            WSP KEEP IN TOUCH PRE-FOOTER
            ========================================================================= */}
        <section className="bg-[#141212] text-white py-20">
          <div className="max-w-[1440px] mx-auto px-6 md:px-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="space-y-2">
              <span className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#F4382D]">
                JOIN OUR TALENT COMMUNITY
              </span>
              <h2 className="text-[36px] sm:text-[46px] font-extrabold tracking-[-0.03em] leading-none text-white">
                Keep in touch
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={handleGeneralApply}
                className="wsp-btn wsp-btn-solid cursor-pointer"
              >
                Send General Application
              </button>
              <Link href="/contact" className="wsp-btn wsp-btn-outline">
                Contact Recruitment
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Online Application Modal with Direct PDF Upload */}
      <JobApplicationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        job={applyingJob}
      />
    </CorporateShell>
  );
}
