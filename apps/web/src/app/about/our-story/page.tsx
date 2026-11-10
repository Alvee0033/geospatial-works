import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Compass,
  ArrowRight,
  ShieldCheck,
  Award,
  ChevronRight,
  CheckCircle2,
  Calendar,
  Layers,
  MapPin,
  TrendingUp,
  Building2,
  Navigation,
  Check,
  CheckSquare,
  Mail,
  Send,
  Cpu,
  Globe2,
  Briefcase,
  Users,
} from 'lucide-react';
import CorporateShell from '@/components/CorporateShell';
import KeepInTouchSection from '@/components/KeepInTouchSection';
import { CmsApi } from '@/lib/cms-api';
import '../../corporate.css';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Our Story & Purpose | Geospatial Works Bangladesh',
  description:
    'Licensed 1st Class Contractor and Geodetic Engineering Consultancy in Bangladesh. Discover our 15+ year journey, national milestones, and multidisciplinary practice.',
};

export default async function OurStoryPage() {
  const sections = await CmsApi.getSections('our-story').catch(() => ({} as Record<string, any>));
  const wysiwyg = (sections as Record<string, any>)['full_page_wysiwyg']?.content;

  const heroKicker = wysiwyg?.heroKicker || '01 / IDENTITY & CORPORATE PROFILE';
  const heroTitle = wysiwyg?.heroTitle || 'Where Engineering Meets Precision';
  const heroSubtitle =
    wysiwyg?.heroSubtitle ||
    'Geospatial Works is an engineering, geospatial, and precision surveying consultancy delivering integrated technical solutions for infrastructure development, spatial planning, and sustainable resource management across Bangladesh.';
  const heroImage = wysiwyg?.heroImage || '/real-media/hero-corridor-infrastructure.jpg';

  // 100% Real metrics from PPT Profile & Milestones
  const stats: { value: string; label: string }[] = wysiwyg?.stats ?? [
    { value: 'Class 1', label: 'Government Contractor & Supplier Status' },
    { value: '35+ Landmarks', label: 'National Infrastructure Projects Completed' },
    { value: '10,000+ GCPs', label: 'Survey of Bangladesh (SOB) Calibrated' },
    { value: '64 Districts', label: 'Nationwide Field Survey Reach' },
  ];

  const storyHeadline = wysiwyg?.storyHeadline ?? 'Built on Precision. Driven by Possibility.';
  const storyBody1 = wysiwyg?.storyBody1 ??
    'Geospatial Works is an engineering, geospatial, and precision surveying consultancy delivering integrated technical solutions for infrastructure development, spatial planning, and sustainable resource management. Combining engineering expertise with advanced geospatial technologies, modern surveying instruments, and digital design capabilities, we support projects from field data acquisition and spatial analysis to engineering design and 3D visualization.';
  const storyBody2 = wysiwyg?.storyBody2 ??
    'Our multidisciplinary approach emphasizes technical precision, innovative solutions, efficient workflows, and timely delivery—helping clients make informed decisions and achieve reliable project outcomes. As a licensed 1st Class Contractor and Supplier, we bridge the gap between rigorous field measurement and constructible civil realization across Bangladesh.';

  const coreValues = [
    {
      title: 'Precision & Technical Excellence',
      desc: 'Sub-centimeter horizontal and vertical accuracy anchored to official Survey of Bangladesh (SOB) geodetic pillars and the BGD2000 datum.',
      badge: 'Geodetic Rigor',
    },
    {
      title: 'Multidisciplinary Integration',
      desc: 'Fusing field geodesy, UAV drone photogrammetry, civil and structural engineering, and architectural BIM modeling under a single unified roof.',
      badge: 'Full Lifecycle',
    },
    {
      title: 'Innovative Technology Adoption',
      desc: 'Deploying multi-constellation 1,408-channel RTK GNSS receivers, DJI Enterprise multispectral drones, hydrographic sonars, and GPU workstation clusters.',
      badge: 'Advanced Hardware',
    },
    {
      title: 'Rapid & Accountable Delivery',
      desc: 'Meeting compressed schedules through automated digital workflows, strict three-tier QA checks, and stamped, legally defensible deliverables.',
      badge: 'On-Time Execution',
    },
    {
      title: 'Sustainable Delta Solutions',
      desc: 'Supporting climate-resilient infrastructure, coastal mangrove protection, and agricultural irrigation networks across the rivers and floodplains of Bangladesh.',
      badge: 'Eco-Resilience',
    },
  ];

  const disciplines: { number: string; title: string; desc: string; bullets: string[]; image: string }[] = wysiwyg?.disciplines ?? [
    {
      number: '01',
      title: 'Feasibility, Design & Engineering',
      desc: 'Comprehensive feasibility studies, structural analysis, and technical drawings in strict compliance with BNBC and AASHTO standards.',
      bullets: [
        'Architectural planning, building massing, space optimization, and 3D visualization',
        'Structural engineering for high-rises (up to 40 stories), RCC bridges, and transit terminals',
        'Detailed Bills of Quantities (BOQ), Materials Take-off (MTO), and technical specifications',
        'Full civil engineering drawings, drainage networks, and retained earth palisading',
      ],
      image: '/real-media/project-shadhapur-bridge.jpg',
    },
    {
      number: '02',
      title: 'Geospatial Services & GIS Consultancy',
      desc: 'Integrated spatial intelligence and GIS decision-support platforms empowering government ministries and development partners.',
      bullets: [
        'UAV photogrammetry, high-density point clouds, and 3D terrain elevation models (DEM/DSM)',
        'Satellite imagery classification, multi-temporal change detection, and NDVI vegetation health',
        'Enterprise GIS database creation, vectorization, and spatial data infrastructure management',
        'Custom Web-GIS development (e.g. BADC WEB-AIS agricultural information system)',
      ],
      image: '/real-media/service-gis-remote-sensing.png',
    },
    {
      number: '03',
      title: 'Digital Precision Surveying Division',
      desc: 'Centimeter- and millimeter-accurate field geomatics utilizing survey-grade instruments calibrated to SOB national baselines.',
      bullets: [
        '8x CHCNAV i83 RTK GNSS receivers (1,408 channels) with GSM-based positioning up to 30km',
        'DJI Enterprise drone fleet (Mavic 3E, Mavic 3M, Matrice 4E) delivering < 3cm GSD pixel resolution',
        'CHCNAV D270 digital echo sounding for river, canal, and coastal bathymetric profiling',
        'Closed-loop digital leveling with Sokkia and Topcon Japanese optical instruments (< 5mm √K)',
      ],
      image: '/real-media/service-topographic-uav.png',
    },
  ];

  // Exact 100% verified milestones from PPT Slides 33, 34, 35
  const milestones: { year: string; title: string; desc: string; client?: string }[] = wysiwyg?.milestones ?? [
    {
      year: '2026',
      title: 'National Agricultural GIS & Urban Transit Modernization',
      desc: 'Executing BADC WEB-AIS Pilot Research Project covering 208.37 km² across 23 unions and 260 mouzas; completed full architectural and drainage modernization surveys for DNCC Gabtoli and Mohakhali Inter-District Bus Terminals; Gulshan–Badda Link Road improvement.',
      client: 'BADC & DNCC',
    },
    {
      year: '2025',
      title: '800 km Climate-Smart Road Survey & Geodetic TBM Network',
      desc: 'Executed 800 km road alignment survey and temporary benchmark (TBM) setup using RTK under the Sustainable & Integrated Rural Transport Improvement Project (SIRTP/CSmaRT) for LGED in collaboration with PRC-IMAGE; Pourashava surveys across Meherpur & Gangni.',
      client: 'LGED / PRC-IMAGE',
    },
    {
      year: '2024',
      title: '100,000 Power Poles & 10,000 National Land Zoning GCPs',
      desc: 'Collected RTK positions for approx. 100,000 (1 LAC) LT & HT power poles for Bangladesh Power Development Board (BPDB) with CEGIS; established 10,000 ground control points across 64 districts for Ministry of Land Digital Land Zoning; DNCC Tejgaon Truck Terminal with BETS.',
      client: 'BPDB, Ministry of Land, CEGIS, DNCC',
    },
    {
      year: '2023',
      title: 'Strategic Urban Development & Substation Control Grids',
      desc: 'GCP data collection across 4 Upazilas in Pirojpur for Urban Development Directorate (UDD) with PlanTED; high-precision static GNSS control establishment across BREB electrical substations in Dhaka Zone; BSMRMU Maritime University geodetic benchmark verification.',
      client: 'UDD, BREB, BSMRMU',
    },
    {
      year: '2022',
      title: 'National Digital Land Zoning Phase 1 & Coastal Flood Protection',
      desc: 'Pioneered nationwide GCP collection across all 64 districts for Ministry of Land Digital Land Zoning Phase 1; geodetic TBM establishment for BWDB coastal flood embankment monitoring in Char Kolatoli and Char Jahiruddin, Bhola.',
      client: 'Ministry of Land & BWDB',
    },
  ];

  return (
    <CorporateShell>
      <main className="min-h-screen bg-white text-[#141212] font-sans antialiased">
        {/* =========================================================================
            CINEMATIC ARCHITECTURAL HERO BANNER
            ========================================================================= */}
        <section className="relative bg-[#141212] text-white pt-36 pb-20 md:pb-28 overflow-hidden border-b border-neutral-800">
          <div className="absolute inset-0 z-0 opacity-30">
            <Image src={heroImage} alt="Geospatial Works Project" fill className="object-cover" priority />
            <div className="absolute inset-0 bg-gradient-to-r from-[#141212] via-[#141212]/90 to-transparent" />
          </div>

          <div className="relative z-10 max-w-[1440px] mx-auto px-6 md:px-12 space-y-6">
            <div className="flex items-center gap-2 text-[12px] uppercase tracking-wider text-neutral-400 font-bold">
              <Link href="/" className="hover:text-[#F4382D] transition">
                Home
              </Link>
              <ChevronRight size={12} className="text-neutral-500" />
              <span className="text-[#3B82F6]">Who We Are</span>
              <ChevronRight size={12} className="text-neutral-500" />
              <span className="text-white">Our Story &amp; Purpose</span>
            </div>

            <div className="max-w-4xl space-y-4">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-block text-[11px] font-mono uppercase tracking-[0.2em] text-[#F4382D] font-bold bg-[#F4382D]/10 px-3 py-1 rounded border border-[#F4382D]/20">
                  {heroKicker}
                </span>
                <span className="inline-block text-[11px] font-mono uppercase tracking-[0.15em] text-[#3B82F6] font-bold bg-[#3B82F6]/10 px-3 py-1 rounded border border-[#3B82F6]/20">
                  CONSULTANCY • IT • SURVEY
                </span>
              </div>
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-[-0.03em] text-white leading-[1.05]">
                {heroTitle}
              </h1>
              <p className="text-base sm:text-lg text-neutral-300 leading-relaxed font-normal max-w-3xl">
                {heroSubtitle}
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-3.5">
                <Link
                  href="/contact"
                  className="wsp-btn wsp-btn-solid flex items-center gap-2 !bg-[#F4382D] hover:!bg-[#d92a20] text-white font-bold px-6 py-3.5 shadow-lg shadow-red-500/20"
                >
                  <Send size={15} />
                  <span>Send Project Enquiry</span>
                  <ArrowRight size={14} />
                </Link>
                <Link
                  href="/projects"
                  className="wsp-btn wsp-btn-outline !text-white !border-white/30 hover:!border-white hover:!bg-white/10 flex items-center gap-2"
                >
                  <Building2 size={15} />
                  <span>View Verified Projects</span>
                </Link>
              </div>
            </div>

            {/* 4 Performance Metric Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6 border-t border-neutral-800/80">
              {stats.map((stat, idx) => (
                <div key={idx} className="bg-white/5 backdrop-blur-md p-4 rounded-xl border border-white/10 space-y-1">
                  <span className="block text-2xl sm:text-3xl font-extrabold text-white font-mono">{stat.value}</span>
                  <span className="block text-[11px] text-neutral-400 font-medium uppercase tracking-wider leading-tight">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================================
            FOUNDATION & PURPOSE NARRATIVE (ABOUT US, VISION & MISSION)
            ========================================================================= */}
        <section className="py-20 md:py-28 bg-[#FAFAFA] border-b border-neutral-200">
          <div className="max-w-[1440px] mx-auto px-6 md:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              <div className="lg:col-span-5 space-y-4">
                <span className="text-[12px] font-mono uppercase tracking-[0.2em] text-[#3B82F6] font-bold block">
                  WHO WE ARE &amp; ABOUT US
                </span>
                <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#141212] leading-tight">
                  {storyHeadline}
                </h2>
                <div className="w-16 h-1 bg-[#F4382D] rounded-full" />

                <div className="pt-4 p-5 bg-white border border-neutral-200 rounded-xl space-y-3 shadow-sm">
                  <div className="flex items-center gap-2 text-[#F4382D] font-bold text-xs uppercase tracking-wider font-mono">
                    <ShieldCheck size={16} />
                    <span>Statutory Enlistment</span>
                  </div>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    Geospatial Works holds certified <strong>1st Class Contractor and Supplier</strong> standing, operating under statutory compliance with the Survey of Bangladesh (SOB), Local Government Engineering Department (LGED), and Dhaka North City Corporation (DNCC).
                  </p>
                </div>
              </div>

              <div className="lg:col-span-7 space-y-6 text-sm sm:text-base text-neutral-700 leading-relaxed">
                <p>{storyBody1}</p>
                <p>{storyBody2}</p>

                {/* Vision & Mission Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4">
                  <div className="p-6 bg-white border-l-4 border-[#3B82F6] rounded-xl shadow-sm space-y-2.5">
                    <div className="flex items-center gap-2">
                      <Compass size={18} className="text-[#3B82F6]" />
                      <h3 className="text-sm font-mono uppercase tracking-wider font-bold text-[#141212]">Our Vision</h3>
                    </div>
                    <p className="text-xs text-neutral-600 leading-relaxed">
                      To be marked as global excellency in engineering and geospatial consultancy services, recognized for technical brilliance, innovative solutions, and sustainable infrastructure development.
                    </p>
                  </div>

                  <div className="p-6 bg-white border-l-4 border-[#F4382D] rounded-xl shadow-sm space-y-2.5">
                    <div className="flex items-center gap-2">
                      <Award size={18} className="text-[#F4382D]" />
                      <h3 className="text-sm font-mono uppercase tracking-wider font-bold text-[#141212]">Our Mission</h3>
                    </div>
                    <p className="text-xs text-neutral-600 leading-relaxed">
                      Helping our clients make informed decisions and achieve sustainable project outcomes by providing sustainable engineering solutions, precise, efficient, and research oriented geospatial, and surveying results through technical expertise, advanced technology, and a commitment to quality and timely data delivery.
                    </p>
                  </div>
                </div>

                <div className="pt-4 flex flex-wrap gap-4">
                  <Link
                    href="/contact"
                    className="wsp-btn wsp-btn-solid flex items-center gap-2 !bg-[#F4382D] hover:!bg-[#d92a20] text-white font-bold px-6 py-3 shadow-md"
                  >
                    <Send size={15} />
                    <span>Engage Our Engineering Squad</span>
                  </Link>
                  <Link
                    href="/about/standards"
                    className="wsp-btn !border !border-neutral-800 !text-neutral-900 hover:!bg-neutral-900 hover:!text-white font-bold px-6 py-3 transition"
                  >
                    SOB Geodetic Standards
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            OUR CORE VALUES (SLIDE 4 FROM PPT)
            ========================================================================= */}
        <section className="py-20 md:py-24 bg-white border-b border-neutral-200">
          <div className="max-w-[1440px] mx-auto px-6 md:px-12 space-y-12">
            <div className="max-w-3xl space-y-3">
              <span className="text-[12px] font-mono uppercase tracking-[0.2em] text-[#F4382D] font-bold block">
                OUR OPERATIONAL ETHOS
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#141212]">
                Our Five Core Values
              </h2>
              <p className="text-neutral-600 text-sm sm:text-base">
                The foundational principles guiding every ground survey traverse, architectural elevation, and structural computation we produce.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coreValues.map((val, idx) => (
                <div
                  key={idx}
                  className="bg-[#FAFAFA] border border-neutral-200 rounded-xl p-6 space-y-3 hover:border-neutral-400 hover:shadow-md transition duration-300 flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono font-bold text-[#F4382D] uppercase tracking-wider">
                        0{idx + 1}
                      </span>
                      <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-neutral-200 text-neutral-700 font-semibold">
                        {val.badge}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-[#141212] leading-snug">{val.title}</h3>
                    <p className="text-xs text-neutral-600 leading-relaxed">{val.desc}</p>
                  </div>
                  <div className="pt-3 border-t border-neutral-200/60 flex items-center gap-1.5 text-xs text-[#3B82F6] font-semibold">
                    <CheckCircle2 size={13} />
                    <span>Verified Field Protocol</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================================
            MULTIDISCIPLINARY PRACTICE PILLARS (SLIDES 6-15 FROM PPT)
            ========================================================================= */}
        <section className="py-20 md:py-28 bg-[#FAFAFA] border-b border-neutral-200">
          <div className="max-w-[1440px] mx-auto px-6 md:px-12 space-y-12">
            <div className="max-w-3xl space-y-3">
              <span className="text-[12px] font-mono uppercase tracking-[0.2em] text-[#3B82F6] font-bold block">
                THREE INTEGRATED DIVISIONS
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#141212]">
                Our Integrated Engineering &amp; Geospatial Ecosystem
              </h2>
              <p className="text-neutral-600 text-sm sm:text-base">
                Rather than treating survey data as an isolated deliverable, we weave spatial intelligence directly into architectural forms, structural designs, and sustainable civil infrastructure.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {disciplines.map((d, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-neutral-300 transition-all duration-300 flex flex-col"
                >
                  <div className="relative h-56 w-full bg-neutral-900 overflow-hidden">
                    <Image src={d.image} alt={d.title} fill className="object-cover hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md px-3 py-1 rounded text-white font-mono text-xs font-bold">
                      DIVISION {d.number}
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-lg font-bold text-[#141212] leading-snug">{d.title}</h3>
                      <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">{d.desc}</p>
                    </div>

                    <ul className="space-y-2.5 pt-3 border-t border-neutral-100">
                      {d.bullets.map((b, bIdx) => (
                        <li key={bIdx} className="flex items-start gap-2 text-xs text-neutral-700">
                          <Check size={14} className="text-[#F4382D] shrink-0 mt-0.5" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================================
            MILESTONE TIMELINE (100% REAL FROM SLIDES 33-35)
            ========================================================================= */}
        <section className="py-20 md:py-28 bg-[#141212] text-white">
          <div className="max-w-[1440px] mx-auto px-6 md:px-12 space-y-12">
            <div className="max-w-3xl space-y-3">
              <span className="text-[12px] font-mono uppercase tracking-[0.2em] text-[#3B82F6] font-bold block">
                VERIFIED TRACK RECORD
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                Our Milestone Projects (2022–2026)
              </h2>
              <p className="text-neutral-400 text-sm sm:text-base">
                A verified chronicle of public and private sector projects executed across Bangladesh with major ministries, city corporations, and international consulting partners.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
              {milestones.map((m, idx) => (
                <div
                  key={idx}
                  className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3 hover:border-white/20 transition backdrop-blur-sm flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="block text-2xl font-extrabold text-[#F4382D] font-mono">{m.year}</span>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/10 text-neutral-300">
                        {m.client}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white leading-snug">{m.title}</h4>
                    <p className="text-xs text-neutral-400 leading-relaxed">{m.desc}</p>
                  </div>
                  <div className="pt-3 border-t border-white/10 text-[11px] text-[#3B82F6] font-semibold flex items-center gap-1">
                    <CheckCircle2 size={13} />
                    <span>Officially Delivered</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================================
            KEEP IN TOUCH (WITH DIRECT INQUIRY & MAPBOX)
            ========================================================================= */}
        <KeepInTouchSection />
      </main>
    </CorporateShell>
  );
}
