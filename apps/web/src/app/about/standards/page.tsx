import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Award,
  ChevronRight,
  Check,
  Compass,
  FileCheck,
  CheckCircle2,
  Table,
  Scale,
  ShieldCheck,
  Send,
  ArrowRight,
  Layers,
} from 'lucide-react';
import CorporateShell from '@/components/CorporateShell';
import KeepInTouchSection from '@/components/KeepInTouchSection';
import { CmsApi } from '@/lib/cms-api';
import '../../corporate.css';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Quality Standards & SOB Compliance | Geospatial Works Bangladesh',
  description:
    'Survey of Bangladesh (SOB) geodetic datum integration, Everest 1830 (Modified) ellipsoid, BTM projection, and closed-loop digital leveling compliance.',
};

export default async function QualityStandardsPage() {
  const sections = await CmsApi.getSections('standards').catch(() => ({} as Record<string, any>));
  const wysiwyg = (sections as Record<string, any>)['full_page_wysiwyg']?.content;

  const heroKicker = wysiwyg?.heroKicker || '04 / STATUTORY GEODETIC COMPLIANCE & QA';
  const heroTitle = wysiwyg?.heroTitle || 'Survey of Bangladesh (SOB) Datum Integration';
  const heroSubtitle =
    wysiwyg?.heroSubtitle ||
    'All ground surveys, bathymetric soundings, UAV photogrammetry, and civil engineering drawings are calibrated to the National Everest 1830 (Modified) ellipsoid and BGD2000 geodetic datum, guaranteeing zero coordinate drift and 100% legal defensibility.';
  const heroImage = wysiwyg?.heroImage || '/real-media/service-topographic-uav.png';

  // 100% Real geodetic metrics
  const stats: { value: string; label: string }[] = wysiwyg?.stats ?? [
    { value: 'BGD2000', label: 'National Geodetic Datum' },
    { value: 'Everest 1830', label: 'Reference Ellipsoid (Modified)' },
    { value: '< 5mm √K', label: 'Digital Leveling Loop Closure' },
    { value: '100% Stamped', label: 'Certified Statutory Defensibility' },
  ];

  // Statutory SOB Datum Parameters
  const datumParameters: { parameter: string; value: string }[] = wysiwyg?.datumParameters ?? [
    { parameter: 'Reference Ellipsoid', value: 'Everest 1830 (Modified)' },
    { parameter: 'Semi-Major Axis (a)', value: '6,377,276.345 meters' },
    { parameter: 'Semi-Minor Axis (b)', value: '6,356,075.413 meters' },
    { parameter: 'Inverse Flattening (1/f)', value: '300.8017' },
    { parameter: 'Projection System', value: 'Bangladesh Transverse Mercator (BTM)' },
    { parameter: 'Central Meridian', value: '90° 00\' 00" East' },
    { parameter: 'Latitude of Origin', value: '0° 00\' 00" (Equator)' },
    { parameter: 'Scale Factor at Origin', value: '0.9996' },
    { parameter: 'False Easting / Northing', value: '500,000 m Easting / 0 m Northing' },
    { parameter: 'Vertical Datum Reference', value: 'Survey of Bangladesh Mean Sea Level (MSL) / PWD Datum (+0.46m offset)' },
  ];

  // Quality Assurance Framework from Slide 7 of Corporate Profile
  const qaPillars: { title: string; desc: string; points: string[] }[] = wysiwyg?.qaGates?.map((gate: { gate: string; desc: string; bullets: string[] }) => ({ title: gate.gate, desc: gate.desc, points: gate.bullets })) ?? [
    {
      title: 'Survey Accuracy & GCP Verification',
      desc: 'Dual-frequency carrier-phase ambiguity resolution, multi-constellation cycle-slip screening, and mathematical loop closure against Survey of Bangladesh primary GTS pillars.',
      points: [
        'Pre- and post-marking for photogrammetry and aerial drone flights',
        'Ground Control Point (GCP) static and RTK verification grids',
        'Independent check of tribrach calibration and antenna phase center offsets',
      ],
    },
    {
      title: 'Coordinate & Elevation Checks',
      desc: 'Closed-loop digital leveling runs with Sokkia B 20A and Topcon AT B 3 automatic optical levels, holding elevation errors strictly below < 5mm √K.',
      points: [
        'Permanent Benchmark (BM) and Temporary Benchmark (TBM) monumentation',
        'Double-run leveling closure checks across road and bridge alignments',
        'Rigorous geoid model separation and ellipsoidal-to-orthometric height conversion',
      ],
    },
    {
      title: 'Data Validation & Quality Control',
      desc: 'Independent checkpoints (CPs)—never used during UAV aerotriangulation or bundle adjustment—to audit digital surface models (DSM/DTM).',
      points: [
        'Root-Mean-Square Error (RMSE) calculation independently across X, Y, and Z',
        'ASPRS Class 1 accuracy verification (< 2.5cm/pixel ground sample distance)',
        'Point cloud outlier filtering, classified ground surface extraction, and contour sanity checks',
      ],
    },
    {
      title: 'Standards & Specification Compliance',
      desc: 'Full alignment with Bangladesh National Building Code (BNBC), AASHTO highway design manuals, and IHO S-44 hydrographic standards.',
      points: [
        'Hydrological scouring and high-flood level (HFL) calibration for bridges',
        'Hydrographic bathymetric sounding uncertainty < ±0.15m (IHO Special Order)',
        'Statutory building setback and Rajuk / DNCC zoning compliance',
      ],
    },
    {
      title: 'Positional Accuracy Assessment',
      desc: 'Coordinate transformation checks between local grid, BTM, and WGS84 UTM Zone 45N/46N to eliminate boundary overlap and GIS layer displacement.',
      points: [
        'Rigorous Helmert 7-parameter coordinate transformation testing',
        'Cadastral mouza sheet geo-rectification and boundary alignment',
        'Road corridor chainage stationing validation against RHD/LGED databases',
      ],
    },
    {
      title: 'Final Map & Stamped Engineering Sign-Off',
      desc: 'Comprehensive multi-disciplinary review by our Lead Surveyors, QA/QC Engineers, and Chief Structural Engineer prior to official release.',
      points: [
        'Signed and stamped drawings legally admissible for government departments',
        'Deliverables formatted in native DWG, GeoTIFF, LAS/LAZ point cloud, and Shapefiles',
        'Archival of raw RINEX, field notes, and adjustment logs for long-term auditability',
      ],
    },
  ];

  return (
    <CorporateShell>
      <main className="min-h-screen bg-white text-[#141212] font-sans antialiased">
        {/* =========================================================================
            CINEMATIC ARCHITECTURAL HERO BANNER
            ========================================================================= */}
        <section className="relative bg-[#141212] text-white pt-36 pb-20 md:pb-28 overflow-hidden border-b border-neutral-800">
          <div className="absolute inset-0 z-0 opacity-25">
            <Image src={heroImage} alt="Survey of Bangladesh Standards" fill className="object-cover" priority />
            <div className="absolute inset-0 bg-gradient-to-r from-[#141212] via-[#141212]/90 to-transparent" />
          </div>

          <div className="relative z-10 max-w-[1440px] mx-auto px-6 md:px-12 space-y-6">
            <div className="flex items-center gap-2 text-[12px] uppercase tracking-wider text-neutral-400 font-bold">
              <Link href="/" className="hover:text-[#F4382D] transition">Home</Link>
              <ChevronRight size={12} className="text-neutral-500" />
              <span className="text-[#3B82F6]">Who We Are</span>
              <ChevronRight size={12} className="text-neutral-500" />
              <span className="text-white">Quality Standards &amp; SOB Compliance</span>
            </div>

            <div className="max-w-4xl space-y-4">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-block text-[11px] font-mono uppercase tracking-[0.2em] text-[#F4382D] font-bold bg-[#F4382D]/10 px-3 py-1 rounded border border-[#F4382D]/20">
                  {heroKicker}
                </span>
                <span className="inline-block text-[11px] font-mono uppercase tracking-[0.15em] text-[#3B82F6] font-bold bg-[#3B82F6]/10 px-3 py-1 rounded border border-[#3B82F6]/20">
                  NATIONAL GEODETIC DATUMS
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
                  <span>Request Certified Survey Proposal</span>
                  <ArrowRight size={14} />
                </Link>
                <Link
                  href="/projects"
                  className="wsp-btn wsp-btn-outline !text-white !border-white/30 hover:!border-white hover:!bg-white/10 flex items-center gap-2"
                >
                  <FileCheck size={15} />
                  <span>View Verified Deliverables</span>
                </Link>
              </div>
            </div>

            {/* 4 Performance Metric Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6 border-t border-neutral-800/80">
              {stats.map((stat, idx) => (
                <div key={idx} className="bg-white/5 backdrop-blur-md p-4 rounded-xl border border-white/10 space-y-1">
                  <span className="block text-2xl sm:text-3xl font-extrabold text-[#3B82F6] font-mono">{stat.value}</span>
                  <span className="block text-[11px] text-neutral-400 font-medium uppercase tracking-wider leading-tight">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================================
            GEODETIC PARAMETERS TABLE
            ========================================================================= */}
        <section className="py-20 md:py-28 bg-[#FAFAFA] border-b border-neutral-200">
          <div className="max-w-[1440px] mx-auto px-6 md:px-12 space-y-12">
            <div className="max-w-3xl space-y-3">
              <span className="text-[12px] font-mono uppercase tracking-[0.2em] text-[#F4382D] font-bold block">
                MATHEMATICAL RIGOR &amp; GEOMETRIC INTEGRITY
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#141212]">
                Official National Geodetic Baseline Parameters
              </h2>
              <p className="text-neutral-600 text-sm sm:text-base">
                Using uncalibrated localized coordinate systems causes severe spatial clashes during construction. We anchor all linear and vertical infrastructure to statutory Survey of Bangladesh (SOB) transformation parameters.
              </p>
            </div>

            <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-[#141212] text-white font-mono text-[11px] uppercase tracking-wider border-b border-neutral-200">
                  <tr>
                    <th className="py-4 px-6">Geodetic Parameter</th>
                    <th className="py-4 px-6">Survey of Bangladesh (SOB) Reference Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-neutral-800">
                  {datumParameters.map((row, idx) => (
                    <tr key={idx} className="hover:bg-neutral-50 transition">
                      <td className="py-3.5 px-6 font-mono font-bold text-[#F4382D]">{row.parameter}</td>
                      <td className="py-3.5 px-6 font-semibold">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* =========================================================================
            QUALITY ASSURANCE FRAMEWORK (SLIDE 7 & 15 FROM CORPORATE BROCHURE)
            ========================================================================= */}
        <section className="py-20 md:py-28 bg-[#141212] text-white">
          <div className="max-w-[1440px] mx-auto px-6 md:px-12 space-y-12">
            <div className="max-w-3xl space-y-3">
              <span className="text-[12px] font-mono uppercase tracking-[0.2em] text-[#3B82F6] font-bold block">
                CORPORATE QUALITY ASSURANCE FRAMEWORK
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                Six Pillars of Survey Precision &amp; Verification
              </h2>
              <p className="text-neutral-400 text-sm sm:text-base">
                How every field observation, GNSS baseline, and engineering drawing transitions through systematic verification before client sign-off.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {qaPillars.map((pillar, idx) => (
                <div
                  key={idx}
                  className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-7 space-y-4 hover:border-white/20 transition flex flex-col justify-between backdrop-blur-md"
                >
                  <div className="space-y-3">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#F4382D] font-bold block">
                      QA PILLAR 0{idx + 1}
                    </span>
                    <h3 className="text-lg font-bold text-white leading-snug">{pillar.title}</h3>
                    <p className="text-xs text-neutral-400 leading-relaxed">{pillar.desc}</p>
                  </div>

                  <ul className="space-y-2 pt-4 border-t border-white/10">
                    {pillar.points.map((p, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-2 text-xs text-neutral-300">
                        <Check size={14} className="text-[#3B82F6] shrink-0 mt-0.5" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
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
