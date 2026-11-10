import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  ChevronRight,
  Layers,
  Compass,
  Crosshair,
  Map,
  Waves,
  Cpu,
  CheckCircle2,
  Check,
  Sparkles,
  Building2,
  Navigation,
  Anchor,
  Globe2,
} from 'lucide-react';
import CorporateShell from '@/components/CorporateShell';
import { CmsApi } from '@/lib/cms-api';
import '../corporate.css';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'What We Do | Geospatial Works Bangladesh',
  description:
    'Precision engineering surveying, drone LiDAR photogrammetry, hydrography, and enterprise GIS spatial solutions across Bangladesh.',
};

const capabilityIcons: Record<string, typeof Compass> = {
  'topographic-survey': Compass,
  'uav-mapping': Crosshair,
  'building-engineering': Building2,
  'gis-solutions': Globe2,
  'road-bridge-infrastructure': Navigation,
  'hydrographic-survey': Waves,
  'bathymetric-survey': Waves,
};

const pillars = [
  {
    num: '01',
    title: 'Understand & Plan',
    desc: 'Analyze project objectives, client tolerances, statutory SOB benchmarks, and site accessibility to tailor an uncompromised methodology.',
  },
  {
    num: '02',
    title: 'Acquire & Benchmark',
    desc: 'Deploy certified surveyor teams with RTK GNSS, airborne LiDAR, and hydrographic sensors with redundant ground check points.',
  },
  {
    num: '03',
    title: 'Process & Validate',
    desc: 'Raw observations undergo least-squares adjustments, point cloud filtering, and cross-discipline peer validation against ground truth.',
  },
  {
    num: '04',
    title: 'Deliver & Integrate',
    desc: 'Clean, topologically sound CAD/GIS packages ready for immediate engineering design, construction staking, or judicial submission.',
  },
];

export default async function ServicesPage() {
  const services = await CmsApi.getServices();
  const capabilities = services.map((service, index) => ({
    num: String(index + 1).padStart(2, '0'),
    slug: service.slug,
    title: service.title,
    category: service.category,
    icon: capabilityIcons[service.slug] || Layers,
    accentColor: index % 2 === 0 ? '#F4382D' : '#3B82F6',
    description: service.description,
    image: service.imageUrl || '',
    deliverables: service.features || [],
  }));
  return (
    <CorporateShell>
      <main className="wsp-services-main bg-white text-[#141212] font-sans antialiased">
        {/* =========================================================================
            HEADER & HERO NARRATIVE (COMPACT & POLISHED ARCHITECTURAL STYLE)
            ========================================================================= */}
        <section className="bg-[#141212] text-white pt-24 pb-14 border-b border-neutral-800">
          <div className="max-w-[1440px] mx-auto px-6 md:px-12">
            <nav
              className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-neutral-400 mb-4 font-mono"
              aria-label="Breadcrumb"
            >
              <Link href="/" className="hover:text-[#F4382D] transition-colors">
                Home
              </Link>
              <span className="text-neutral-600">/</span>
              <span className="text-[#F4382D]">What We Do</span>
            </nav>

            <div className="max-w-4xl space-y-3">
              <span className="text-[12px] font-mono uppercase tracking-[0.2em] text-[#F4382D] font-bold block">
                ENGINEERING CONSULTANCY &amp; GEODESY
              </span>
              <h1 className="text-[34px] sm:text-[46px] lg:text-[52px] font-extrabold text-white tracking-[-0.03em] leading-[1.1]">
                Capabilities &amp; Core Disciplines
              </h1>
              <p className="text-[16px] sm:text-[18px] text-neutral-300 font-normal leading-relaxed max-w-3xl pt-1">
                Precision engineering surveying, drone photogrammetry, hydrographic acoustics, and spatial intelligence engineered for Bangladesh’s complex urban and riverine terrain.
              </p>
            </div>
          </div>
        </section>

        {/* =========================================================================
            CAPABILITIES GRID (REFINED 3-COLUMN COMPACT CARDS WITH CRISP BORDERS)
            ========================================================================= */}
        <section className="max-w-[1440px] mx-auto px-6 md:px-12 py-14">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-6 mb-10 border-b border-neutral-200 gap-4">
            <div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-[#F4382D]">
                OUR CAPABILITIES
              </span>
              <h2 className="text-[26px] sm:text-[32px] font-extrabold text-[#141212] tracking-tight mt-1">
                Engineering Solutions for Every Sector
              </h2>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-neutral-500 bg-neutral-100 px-3 py-1.5 rounded-full border border-neutral-200">
              <span className="w-2 h-2 rounded-full bg-[#3B82F6]" />
              <span>{capabilities.length} Verified Disciplines</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {capabilities.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.slug}
                  className="group relative bg-white border border-neutral-200/90 hover:border-neutral-400/90 rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  {/* Top Image Section (Compact 16:9 with subtle badge) */}
                  <div className="relative aspect-[16/9] overflow-hidden bg-neutral-900">
                    {item.image && <Image src={item.image} alt={item.title} fill sizes="(max-width: 768px) 100vw, 33vw" quality={72} className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out" />}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                    {/* Discipline Number */}
                    <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-md text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded border border-white/15">
                      {item.num}
                    </div>

                    {/* Category Pill */}
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-[#141212] font-mono text-[9px] font-extrabold uppercase px-2 py-0.5 rounded shadow-sm">
                      {item.category}
                    </div>

                    {/* Bottom Title on Image */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm"
                        style={{ backgroundColor: item.accentColor }}
                      >
                        <Icon size={14} />
                      </div>
                      <h3 className="text-[15px] font-bold text-white leading-snug line-clamp-1 drop-shadow-sm">
                        {item.title}
                      </h3>
                    </div>
                  </div>

                  {/* Body Content (Compact typography & clean bullet points) */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <p className="text-[13px] text-neutral-600 leading-relaxed font-normal line-clamp-3">
                        {item.description}
                      </p>

                      {/* Deliverables Checklist (Compact) */}
                      <div className="pt-2 border-t border-neutral-100 space-y-2">
                        <span className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold">
                          Key Deliverables:
                        </span>
                        <ul className="space-y-1.5">
                          {item.deliverables.map((d, dIdx) => (
                            <li key={dIdx} className="flex items-start gap-2 text-[12px] text-neutral-700">
                              <Check
                                size={13}
                                className={`shrink-0 mt-0.5 ${
                                  item.accentColor === '#F4382D' ? 'text-[#F4382D]' : 'text-[#3B82F6]'
                                }`}
                              />
                              <span className="leading-tight">{d}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Link Footer */}
                    <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
                      <Link
                        href={`/services/${item.slug}`}
                        className="inline-flex items-center gap-1.5 text-[12px] font-bold text-[#141212] group-hover:text-[#F4382D] transition-colors"
                      >
                        <span>Explore details</span>
                        <ArrowRight size={13} className="text-[#F4382D] group-hover:translate-x-1 transition-transform" />
                      </Link>
                      <span className="text-[10px] font-mono uppercase text-neutral-400">
                        1st Class
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* =========================================================================
            HOW WE WORK (COMPACT METHODOLOGY CARDS)
            ========================================================================= */}
        <section className="bg-neutral-50 py-16 border-t border-b border-neutral-200">
          <div className="max-w-[1440px] mx-auto px-6 md:px-12">
            <div className="max-w-3xl mb-12 space-y-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-[#F4382D]">
                OUR METHODOLOGY
              </span>
              <h2 className="text-[26px] sm:text-[34px] font-extrabold tracking-[-0.02em] text-[#141212]">
                From Field Observations to Ground Truth
              </h2>
              <p className="text-[14px] text-neutral-600 leading-relaxed">
                Every measurement follows a systematic quality-assurance protocol, ensuring coordinate systems, vertical datums, and boundary lines are legally defensible and engineering-grade.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {pillars.map((p) => (
                <div key={p.num} className="bg-white p-6 rounded-2xl border border-neutral-200/90 shadow-2xs space-y-3">
                  <span className="block text-[28px] font-extrabold text-[#F4382D] font-mono leading-none">
                    {p.num}
                  </span>
                  <h3 className="text-[16px] font-bold text-[#141212]">
                    {p.title}
                  </h3>
                  <p className="text-[13px] text-neutral-600 leading-relaxed">
                    {p.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================================
            WSP KEEP IN TOUCH PRE-FOOTER
            ========================================================================= */}
        <section className="bg-[#141212] text-white py-16">
          <div className="max-w-[1440px] mx-auto px-6 md:px-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="space-y-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-[#F4382D]">
                START A GEOSPATIAL PROJECT
              </span>
              <h2 className="text-[30px] sm:text-[40px] font-extrabold tracking-[-0.03em] leading-none text-white">
                Keep in touch
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link href="/contact" className="wsp-btn wsp-btn-solid">
                Contact us
              </Link>
              <Link href="/contact#office" className="wsp-btn wsp-btn-outline">
                Our Dhaka HQ
              </Link>
            </div>
          </div>
        </section>
      </main>
    </CorporateShell>
  );
}
