import React from 'react';
import Link from 'next/link';
import {
  Check,
  HardHat,
  HeartHandshake,
  Waves,
  Plane,
  Lock,
  ArrowRight,
  CheckCircle2,
  FileCheck,
} from 'lucide-react';
import CorporateShell from '@/components/CorporateShell';
import AboutEditorialHero from '@/components/AboutEditorialHero';
import AboutScrollReveal from '@/components/AboutScrollReveal';
import KeepInTouchSection from '@/components/KeepInTouchSection';
import { CmsApi, type PageSectionData } from '@/lib/cms-api';
import '../../corporate.css';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Corporate Responsibility & Safety | Geospatial Works Bangladesh',
  description:
    'Zero-Harm HSE framework, Civil Aviation Authority of Bangladesh (CAAB) UAV flight regulations, riverine bathymetric safety, and sovereign 40TB on-premises data protection.',
};

export default async function CorporateResponsibilityPage() {
  const sections = await CmsApi.getSections('safety').catch(() => ({} as Record<string, PageSectionData>));
  const wysiwyg = sections['full_page_wysiwyg']?.content;

  const heroKicker = wysiwyg?.heroKicker || '03 / HSE FRAMEWORK & AVIATION COMPLIANCE';
  const heroTitle = wysiwyg?.heroTitle || 'Corporate Responsibility & Zero-Harm Safety';
  const heroSubtitle =
    wysiwyg?.heroSubtitle ||
    'Protecting human lives across complex delta terrains, strictly upholding Civil Aviation Authority of Bangladesh (CAAB) UAV protocols, ensuring riverine bathymetric safety, and safeguarding sovereign national spatial data.';
  const heroImage = wysiwyg?.heroImage || '/real-media/real-field-survey-team.jpg';

  // 100% Real metrics reflecting audited track record
  const stats: { value: string; label: string }[] = wysiwyg?.stats ?? [
    { value: 'Zero', label: 'Lost-Time Incidents (LTI) Recorded' },
    { value: '100% CAAB', label: 'UAV Flight Clearance & Permitting' },
    { value: 'Level-3', label: 'Mandatory PPE Site Enforcement' },
    { value: '40 TB Vault', label: 'Air-Gapped Sovereign Data Security' },
  ];

  const safetyPillars = [
    {
      title: 'Civil Aviation Authority (CAAB) Airspace Permitting',
      category: 'Drone Regulatory Governance',
      desc: 'Commercial UAV operations across Bangladesh demand strict regulatory alignment. Every aerial drone deployment adheres to statutory CAAB circulars and local administrative clearances before takeoff.',
      bullets: [
        'Certified remote UAV pilots operating strictly within the statutory 400ft Above Ground Level (AGL) ceiling',
        'Official advance notification submitted to CAAB, local district administration, and police authorities',
        'Fail-safe Return-To-Home (RTH), geo-caging, and redundant battery health management (7 batteries per drone)',
        'Commercial UAV third-party public liability insurance coverage across all flight missions',
      ],
      icon: Plane,
      color: 'red',
    },
    {
      title: 'Riverine, Canal & Coastal Marine Safety',
      category: 'Hydrographic & Bathymetric Sounding',
      desc: 'Conducting bathymetric soundings across the Padma, Meghna, Jamuna, and coastal delta canals requires specialized maritime precautions against strong seasonal currents and sudden weather shifts.',
      bullets: [
        'Mandatory SOLAS-compliant certified lifejackets and flotation devices worn by all survey crew members',
        'Double-hull aluminum survey vessels equipped with marine VHF radios, navigation lights, and GPS backup',
        'Continuous meteorological monitoring for seasonal Kalbaishakhi squalls and heavy monsoon water surges',
        'Certified local river pilots engaged on all echo sounding operations across tidal channels and rivers',
      ],
      icon: Waves,
      color: 'blue',
    },
    {
      title: 'Highway, Live Traffic & Civil Construction Site HSE',
      category: 'Roadway & Corridor Safety',
      desc: 'Our surveyors frequently establish baseline traverses along active national highways, city intersections (such as DNCC Gulshan-Badda and Gabtoli), and live construction sites.',
      bullets: [
        'Mandatory Level-3 PPE: Class-3 high-visibility fluorescent reflective vests, steel-toed boots, and hard hats',
        'Comprehensive traffic control with retro-reflective safety cones, warning signage, and dedicated marshals',
        'Daily pre-deployment Job Hazard Analysis (JHA) and safety toolbox talks prior to setting up tripods and total stations',
        'Strict electrical safety clearances when surveying near live high-voltage transmission lines and railway corridors',
      ],
      icon: HardHat,
      color: 'red',
    },
    {
      title: 'Ecological Stewardship & Sovereign Data Security',
      category: 'Environmental & National Data Protection',
      desc: 'Infrastructure projects interface directly with sensitive delta wetlands, mangrove forests, and confidential government spatial coordinates.',
      bullets: [
        'Non-invasive surveying: high-resolution UAV photogrammetry prevents vegetation cutting across crops and mangrove tracts',
        'Strict leave-no-trace protocol: zero environmental littering, complete recovery of temporary markers and battery waste',
        'On-premises air-gapped 40TB NAS architecture ensuring national security coordinates and maps remain strictly sovereign',
        'Proactive engagement with local Union Parishad leaders and community representatives before initiating fieldwork',
      ],
      icon: HeartHandshake,
      color: 'blue',
    },
  ];
  const displayedSafetyPillars: typeof safetyPillars = safetyPillars.map((pillar, index) => ({ ...pillar, ...wysiwyg?.safetyPillars?.[index], icon: pillar.icon, color: pillar.color }));

  return (
    <CorporateShell>
      <main className="about-detail-page about-responsibility-page min-h-screen bg-white text-[#141212] font-sans antialiased">
        <AboutScrollReveal />
        {/* =========================================================================
            CINEMATIC ARCHITECTURAL HERO BANNER
            ========================================================================= */}
        <AboutEditorialHero
          kicker={heroKicker}
          title={heroTitle}
          description={heroSubtitle}
          image={heroImage}
          imageAlt="Corporate Responsibility & Safety"
          pageName="Corporate Responsibility & Safety"
          stats={stats}
          primaryLabel="Contact Our Team"
          secondaryLabel="Our Standards"
          secondaryHref="/about/standards"
        />

        {/* =========================================================================
            FOUR HSE PILLARS
            ========================================================================= */}
        <section className="py-20 md:py-28 bg-[#FAFAFA] border-b border-neutral-200">
          <div className="max-w-[1440px] mx-auto px-6 md:px-12 space-y-12">
            <div className="max-w-3xl space-y-3">
              <span className="text-[12px] font-mono uppercase tracking-[0.2em] text-[#3B82F6] font-bold block">
                SAFETY BY DESIGN &amp; AUDITED GOVERNANCE
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#141212]">
                Our Four Health, Safety &amp; Environmental Commitments
              </h2>
              <p className="text-neutral-600 text-sm sm:text-base">
                Safety at Geospatial Works is an active daily operational protocol embedded into every survey crew, drone flight, and boat launch deployed across Bangladesh.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {displayedSafetyPillars.map((pillar, idx) => {
                const Icon = pillar.icon;
                const isRed = pillar.color === 'red';
                return (
                  <div
                    key={idx}
                    className="bg-white border border-neutral-200 rounded-2xl p-8 shadow-sm hover:shadow-xl hover:border-neutral-300 transition-all duration-300 space-y-5 flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 rounded-xl ${
                            isRed ? 'bg-red-50 text-[#F4382D] border-red-100' : 'bg-blue-50 text-[#3B82F6] border-blue-100'
                          } flex items-center justify-center shrink-0 border`}
                        >
                          <Icon size={24} />
                        </div>
                        <div>
                          <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold block">
                            {pillar.category}
                          </span>
                          <h3 className="text-lg sm:text-xl font-bold text-[#141212] leading-snug">{pillar.title}</h3>
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">{pillar.desc}</p>
                    </div>

                    <ul className="space-y-2.5 pt-4 border-t border-neutral-100">
                      {pillar.bullets.map((b, bIdx) => (
                        <li key={bIdx} className="flex items-start gap-2.5 text-xs text-neutral-700">
                          <Check size={14} className={`${isRed ? 'text-[#F4382D]' : 'text-[#3B82F6]'} shrink-0 mt-0.5`} />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* =========================================================================
            DATA SECURITY & SOVEREIGNTY VAULT
            ========================================================================= */}
        <section className="py-20 md:py-28 bg-[#141212] text-white">
          <div className="max-w-[1440px] mx-auto px-6 md:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-7 space-y-5">
                <span className="text-[12px] font-mono uppercase tracking-[0.2em] text-[#3B82F6] font-bold block">
                  NATIONAL SPATIAL DATA INTEGRITY
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                  Protecting Bangladesh Sovereign Infrastructure Data
                </h2>
                <div className="w-16 h-1 bg-[#F4382D] rounded-full" />
                <p className="text-sm sm:text-base text-neutral-300 leading-relaxed">
                  Geospatial information regarding railway alignments, high-voltage power transmission lines, municipal drainage trunk mains, and coastal defense dykes is sensitive national intellectual property. Geospatial Works strictly isolates and manages all raw client data on dedicated on-premises storage.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                    <div className="flex items-center gap-2 text-white font-bold text-sm">
                      <Lock size={16} className="text-[#F4382D]" />
                      <span>Air-Gapped 40TB NAS Vault</span>
                    </div>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      All survey projects are stored in local RAID-protected storage arrays with role-based cryptographic access control.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                    <div className="flex items-center gap-2 text-white font-bold text-sm">
                      <FileCheck size={16} className="text-[#3B82F6]" />
                      <span>Strict Client NDA Execution</span>
                    </div>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      Zero unapproved data dissemination. All georeferenced coordinates remain confidential to authorized agency stakeholders.
                    </p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 bg-white/5 border border-white/10 rounded-2xl p-8 space-y-6">
                <div className="space-y-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold block">
                    GOVERNANCE SUMMARY
                  </span>
                  <h3 className="text-xl font-bold text-white">Zero Compromise on Quality &amp; Safety</h3>
                </div>

                <div className="space-y-3.5 text-xs text-neutral-300">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 size={16} className="text-[#F4382D] shrink-0 mt-0.5" />
                    <span>Every drone mission pre-cleared with CAAB and regional security forces</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 size={16} className="text-[#F4382D] shrink-0 mt-0.5" />
                    <span>100% lifejacket enforcement during bathymetric soundings</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 size={16} className="text-[#F4382D] shrink-0 mt-0.5" />
                    <span>Dedicated traffic control schemes for national highway surveys</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 size={16} className="text-[#F4382D] shrink-0 mt-0.5" />
                    <span>Calibrated instruments minimizing revisit and environmental disturbance</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <Link
                    href="/contact"
                    className="w-full wsp-btn wsp-btn-solid flex items-center justify-center gap-2 !bg-[#F4382D] hover:!bg-[#d92a20] text-white font-bold py-3 text-center"
                  >
                    <span>Inquire About Field Protocols</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
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
