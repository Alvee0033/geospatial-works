import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, ArrowRight, CheckCircle2, MapPin, Calendar, Building, Layers } from 'lucide-react';
import CorporateShell from '@/components/CorporateShell';
import { CmsApi, ProjectData } from '@/lib/cms-api';
import { ALL_PROJECTS } from '@/lib/projects-data';
import { projects as fallbackProjects } from '@/lib/corporate-data';
import '../../corporate.css';

export const revalidate = 30;

export async function generateStaticParams() {
  const apiProjects = await CmsApi.getProjects().catch(() => []);
  const slugs = new Set<string>();
  apiProjects.forEach((p) => slugs.add(p.slug));
  ALL_PROJECTS.forEach((p) => slugs.add(p.slug));
  fallbackProjects.forEach((p) => slugs.add(p.slug));
  return Array.from(slugs).map((slug) => ({ id: slug }));
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Try API first
  let project: any = await CmsApi.getProject(id);

  // If not found in API, check ALL_PROJECTS (35+ verified projects)
  if (!project) {
    const verified = ALL_PROJECTS.find((p) => p.slug === id);
    if (verified) {
      project = { ...verified };
    }
  }

  // If not found, try fallback data
  if (!project) {
    const fallback = fallbackProjects.find((p) => p.slug === id);
    if (fallback) {
      project = {
        id: fallback.slug,
        slug: fallback.slug,
        title: fallback.title,
        client: 'Government & Enterprise Partner',
        category: fallback.category,
        location: fallback.location,
        description: fallback.summary,
        deliverables: 'Topographic mapping, contour plans, digital terrain models, and CAD deliverables.',
        imageUrl: fallback.image,
      };
    }
  }

  if (!project) notFound();

  // Fetch other projects for related section
  const apiProjects = await CmsApi.getProjects().catch(() => []);
  const pool = apiProjects.length > 0 ? apiProjects : ALL_PROJECTS;
  const relatedProjects = pool.filter((p) => p.slug !== id).slice(0, 3);

  return (
    <CorporateShell>
      <main className="wsp-project-detail bg-white text-[#141212] font-sans antialiased">
        {/* =========================================================================
            WSP BREADCRUMB + HERO HEADER
            ========================================================================= */}
        <section className="bg-white pt-28 pb-10 border-b border-neutral-100">
          <div className="max-w-[1440px] mx-auto px-6 md:px-12">
            {/* WSP Breadcrumb */}
            <nav className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-500 mb-6" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-[#F4382D] transition-colors">
                Home
              </Link>
              <span className="text-neutral-300">/</span>
              <Link href="/projects" className="hover:text-[#F4382D] transition-colors">
                Projects
              </Link>
              <span className="text-neutral-300">/</span>
              <span className="text-[#F4382D] line-clamp-1">{project.title}</span>
            </nav>

            {/* Category Tag & Monumental Headline */}
            <div className="max-w-4xl space-y-4">
              <span className="inline-block text-[12px] font-extrabold uppercase tracking-[0.16em] text-[#F4382D]">
                {project.category || 'INFRASTRUCTURE & GEOSPATIAL'}
              </span>

              <h1 className="text-[34px] sm:text-[46px] lg:text-[54px] font-extrabold text-[#141212] tracking-[-0.03em] leading-[1.12]">
                {project.title}
              </h1>

              <p className="text-[18px] sm:text-[21px] text-neutral-600 font-normal leading-relaxed pt-2">
                {project.description}
              </p>
            </div>
          </div>
        </section>

        {/* =========================================================================
            HERO MEDIA (16:9 FULL-WIDTH PHOTOGRAPHY)
            ========================================================================= */}
        <section className="max-w-[1440px] mx-auto px-6 md:px-12 py-8">
          <div className="aspect-[21/9] sm:aspect-[16/8] overflow-hidden bg-neutral-900 shadow-xl relative">
            <img
              src={project.imageUrl || '/geospatial-river-hero.webp'}
              alt={project.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-6 bg-black/70 backdrop-blur-md px-4 py-2 text-white text-[12px] font-semibold tracking-wide">
              {project.location || 'Bangladesh Corridor'} • Official Survey Documentation
            </div>
          </div>
        </section>

        {/* =========================================================================
            CASE STUDY CONTENT & STICKY FACTSHEET GRID (8:4 SPLIT)
            ========================================================================= */}
        <section className="max-w-[1440px] mx-auto px-6 md:px-12 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            {/* Left 8 Cols: Case Study Narrative */}
            <div className="lg:col-span-8 space-y-12">
              {/* Executive Summary */}
              <div className="space-y-4">
                <span className="text-[12px] font-bold uppercase tracking-[0.14em] text-neutral-500">
                  01 / EXECUTIVE SUMMARY
                </span>
                <h2 className="text-[26px] sm:text-[30px] font-extrabold tracking-[-0.02em] text-[#141212] leading-tight">
                  High-Precision Ground Truth in Challenging Environments
                </h2>
                <p className="text-[16px] text-neutral-700 leading-[1.7]">
                  Bangladesh’s dynamic terrain—ranging from rapid delta sediment shifts and complex riverbanks to densely populated urban utility mazes—demands uncompromising measurement accuracy. Geospatial Works deployed advanced geodetic positioning, sensor fusion, and multi-temporal photogrammetry to provide actionable spatial intelligence for this landmark initiative.
                </p>
              </div>

              {/* The Challenge */}
              <div className="space-y-4 border-l-2 border-[#F4382D] pl-6 py-2 bg-neutral-50/70">
                <span className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#F4382D]">
                  02 / THE CHALLENGE
                </span>
                <h3 className="text-[22px] font-bold text-[#141212]">
                  Complex Terrain, Dense Infrastructure & Strict Tolerances
                </h3>
                <p className="text-[15px] text-neutral-700 leading-relaxed">
                  The client required sub-centimeter horizontal alignment and millimetric vertical datum benchmarking under tight project deadlines. Traditional surveying methodologies were impeded by seasonal water level fluctuations, vegetative canopy interference, and high-traffic arterial obstructions.
                </p>
              </div>

              {/* The Approach & Technical Solution */}
              <div className="space-y-6">
                <span className="text-[12px] font-bold uppercase tracking-[0.14em] text-neutral-500">
                  03 / METHODOLOGY & SENSOR SUITE
                </span>
                <h3 className="text-[24px] font-bold text-[#141212]">
                  How Geospatial Works Delivered
                </h3>
                <p className="text-[15px] text-neutral-700 leading-relaxed">
                  Our survey engineers designed a hybrid observation matrix combining dual-frequency GNSS RTK base/rover setups, airborne UAV photogrammetry, and specialized acoustic or electromagnetic detection instruments:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-5 border border-neutral-200 bg-white shadow-sm space-y-2">
                    <div className="flex items-center gap-2 text-[#F4382D] font-bold text-[14px]">
                      <CheckCircle2 size={18} />
                      <span>Geodetic Ground Control</span>
                    </div>
                    <p className="text-[13px] text-neutral-600 leading-normal">
                      Tied directly to national Survey of Bangladesh (SOB) benchmarks with rigorous closed-loop traverse validation.
                    </p>
                  </div>

                  <div className="p-5 border border-neutral-200 bg-white shadow-sm space-y-2">
                    <div className="flex items-center gap-2 text-[#F4382D] font-bold text-[14px]">
                      <CheckCircle2 size={18} />
                      <span>Sensor Fusion Analytics</span>
                    </div>
                    <p className="text-[13px] text-neutral-600 leading-normal">
                      High-density point clouds classified into ground, vegetation, and structural layers for precise digital terrain generation.
                    </p>
                  </div>

                  <div className="p-5 border border-neutral-200 bg-white shadow-sm space-y-2">
                    <div className="flex items-center gap-2 text-[#F4382D] font-bold text-[14px]">
                      <CheckCircle2 size={18} />
                      <span>Subsurface & Hydro Mapping</span>
                    </div>
                    <p className="text-[13px] text-neutral-600 leading-normal">
                      Non-destructive underground utility detection combined with calibrated bathymetric echo soundings.
                    </p>
                  </div>

                  <div className="p-5 border border-neutral-200 bg-white shadow-sm space-y-2">
                    <div className="flex items-center gap-2 text-[#F4382D] font-bold text-[14px]">
                      <CheckCircle2 size={18} />
                      <span>Enterprise GIS Deliverables</span>
                    </div>
                    <p className="text-[13px] text-neutral-600 leading-normal">
                      Seamless spatial geodatabases compatible with AutoCAD Civil 3D, ArcGIS Pro, and web digital twins.
                    </p>
                  </div>
                </div>
              </div>

              {/* Key Deliverables */}
              {project.deliverables && (
                <div className="space-y-4 pt-4">
                  <span className="text-[12px] font-bold uppercase tracking-[0.14em] text-neutral-500">
                    04 / ENGINEERING DELIVERABLES
                  </span>
                  <div className="bg-[#141212] text-white p-8 space-y-4 shadow-lg">
                    <h4 className="text-[20px] font-bold tracking-tight text-white">
                      Verified Client Deliverables
                    </h4>
                    <p className="text-[14px] text-neutral-300 leading-relaxed">
                      {project.deliverables}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 pt-2 text-[12px] text-neutral-400">
                      <span className="bg-white/10 px-3 py-1 font-mono">AutoCAD .DWG</span>
                      <span className="bg-white/10 px-3 py-1 font-mono">ESRI File Geodatabase</span>
                      <span className="bg-white/10 px-3 py-1 font-mono">GeoTIFF DEM (10cm)</span>
                      <span className="bg-white/10 px-3 py-1 font-mono">Quality Assurance Report</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right 4 Cols: WSP Sticky Project Factsheet */}
            <aside className="lg:col-span-4 space-y-8 sticky top-28">
              <div className="border border-neutral-200 p-8 bg-[#FBFBFB] space-y-6 shadow-sm">
                <div className="border-b border-neutral-200 pb-4">
                  <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-500">
                    PROJECT PROFILE
                  </span>
                  <h3 className="text-[20px] font-extrabold text-[#141212] pt-1">
                    Key Project Facts
                  </h3>
                </div>

                <div className="space-y-4 text-[14px]">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-neutral-500">
                      Client / Authority
                    </span>
                    <p className="font-bold text-[#141212]">{project.client || 'Government Authority'}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-neutral-500">
                      Location
                    </span>
                    <p className="font-bold text-[#141212]">{project.location || 'Bangladesh'}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-neutral-500">
                      Sector / Discipline
                    </span>
                    <p className="font-bold text-[#F4382D]">{project.category}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-neutral-500">
                      Survey Technology
                    </span>
                    <p className="font-medium text-neutral-700">GNSS RTK, Drone Photogrammetry, GIS Geodatabase</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-neutral-500">
                      Compliance Datum
                    </span>
                    <p className="font-medium text-neutral-700">WGS84 / BTM / Survey of Bangladesh PWD Datum</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-200 space-y-3">
                  <Link
                    href="/contact"
                    className="w-full text-center block bg-[#F4382D] hover:bg-[#d62f25] text-white text-[13px] font-bold py-3.5 tracking-wide transition-colors"
                  >
                    Discuss a Similar Project
                  </Link>
                  <Link
                    href="/projects"
                    className="w-full text-center block border border-neutral-300 hover:border-black text-[#141212] text-[13px] font-bold py-3 transition-colors"
                  >
                    ← All Projects
                  </Link>
                </div>
              </div>

              {/* Quick Contact Box */}
              <div className="bg-[#141212] text-white p-7 space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#F4382D]">
                  TECHNICAL INQUIRIES
                </span>
                <h4 className="text-[17px] font-bold">Need detailed survey specifications?</h4>
                <p className="text-[13px] text-neutral-400 leading-normal">
                  Our survey engineering team can provide technical scopes, accuracy tolerance tables, and sample drawings.
                </p>
                <a
                  href="mailto:info@geospatialworks.com.bd"
                  className="inline-flex items-center gap-1.5 text-[13px] font-bold text-white hover:text-[#F4382D] transition-colors pt-1"
                >
                  info@geospatialworks.com.bd <ArrowRight size={14} />
                </a>
              </div>
            </aside>
          </div>
        </section>

        {/* =========================================================================
            RELATED PROJECTS
            ========================================================================= */}
        {relatedProjects.length > 0 && (
          <section className="bg-neutral-50 py-20 border-t border-neutral-200">
            <div className="max-w-[1440px] mx-auto px-6 md:px-12">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-[28px] sm:text-[34px] font-extrabold text-[#141212] tracking-tight">
                  Related Projects
                </h3>
                <Link
                  href="/projects"
                  className="text-[14px] font-bold text-[#F4382D] hover:underline flex items-center gap-1"
                >
                  View all projects <ChevronRight size={16} />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {relatedProjects.map((p) => (
                  <Link
                    key={p.id}
                    href={`/projects/${p.slug}`}
                    className="group block bg-white p-6 border border-neutral-200 hover:border-neutral-400 transition-all shadow-sm space-y-4"
                  >
                    <div className="aspect-[16/9] overflow-hidden bg-neutral-100">
                      <img
                        src={p.imageUrl || '/geospatial-river-hero.webp'}
                        alt={p.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-neutral-500">
                        {p.category}
                      </span>
                      <h4 className="text-[18px] font-bold text-[#141212] group-hover:text-[#F4382D] transition-colors leading-snug mt-1">
                        {p.title}
                      </h4>
                      <p className="text-[13px] text-neutral-600 line-clamp-2 mt-2">
                        {p.description}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* =========================================================================
            WSP KEEP IN TOUCH PRE-FOOTER
            ========================================================================= */}
        <section className="bg-[#141212] text-white py-20 border-t border-white/10">
          <div className="max-w-[1440px] mx-auto px-6 md:px-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="space-y-2">
              <span className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#F4382D]">
                COLLABORATE WITH GEOSPATIAL WORKS
              </span>
              <h2 className="text-[36px] sm:text-[46px] font-extrabold tracking-[-0.03em] leading-none text-white">
                Keep in touch
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-4">
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