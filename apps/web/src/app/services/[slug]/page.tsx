import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, ArrowRight, CheckCircle2, ShieldCheck, Wrench, Layers } from 'lucide-react';
import CorporateShell from '@/components/CorporateShell';
import { CmsApi } from '@/lib/cms-api';
import '../../corporate.css';

export const revalidate = 10;

interface ServiceDetail {
  slug: string;
  title: string;
  category: string;
  lead: string;
  description: string;
  image: string;
  equipment: string[];
  deliverables: string[];
  standards: string[];
  benefits: string[];
}

const serviceDetails: Record<string, ServiceDetail> = {
  'topographic-survey': {
    slug: 'topographic-survey',
    title: 'Topographic & Engineering Survey',
    category: 'Digital Surveying',
    lead: 'Sub-centimeter geodetic baselines, contour mapping, and digital terrain modeling for civil engineering and infrastructure.',
    description: 'We execute comprehensive land surveys combining dual-frequency GNSS RTK and high-accuracy robotic total stations. Every contour and ground feature is referenced to national Survey of Bangladesh (SOB) benchmarks.',
    image: '/real-media/service-topographic-uav.png',
    equipment: ['Trimble / Leica Dual-Frequency GNSS RTK Receivers', '1-Second Robotic Total Stations', 'Digital Invar Barcode Leveling Instruments'],
    deliverables: ['Topographic Surface Contours (0.25m / 0.5m intervals)', 'Ground Control Point (GCP) Geodetic Network Dossier', 'Civil 3D Digital Terrain Models (.TIN / .DWG)', 'Cross-Sections and Longitudinal Profiles'],
    standards: ['Survey of Bangladesh (SOB) PWD Datum', 'BTM (Bangladesh Transverse Mercator) Coordinate Projection', 'ISO 17123-5 Geodetic Quality Assurance Protocol'],
    benefits: ['Zero vertical alignment errors during highway and bridge piling', 'Eliminate costly earthwork volume recalculations', 'Certified drawings accepted by all government authorities'],
  },
  'uav-mapping': {
    slug: 'uav-mapping',
    title: 'UAV Mapping & Aerial Photogrammetry',
    category: 'Aerial Survey',
    lead: 'High-resolution orthomosaics, 3D point clouds, and multispectral aerial analytics across expansive corridors.',
    description: 'Our certified drone pilots fly multi-rotor and fixed-wing UAVs equipped with RTK/PPK GNSS and calibrated high-resolution RGB/multispectral sensors to capture vast sites with centimeter-level accuracy.',
    image: '/real-media/service-uav-drone-lidar.png',
    equipment: ['DJI Enterprise Matrice 350 RTK / Phantom 4 RTK', 'Zenmuse P1 45MP Full-Frame Photogrammetry Camera', 'Zenmuse L2 Triple-Return Airborne LiDAR'],
    deliverables: ['Sub-5cm Ground Sampling Distance (GSD) Orthomosaics', 'Classified 3D Point Clouds (.LAS / .LAZ)', 'Digital Surface Models (DSM) and Bare-Earth DEMs', 'Progressive Volumetric Cut/Fill Stockpile Computations'],
    standards: ['Civil Aviation Authority of Bangladesh (CAAB) UAV Compliant', 'ASPRS Positional Accuracy Standards for Digital Geospatial Data', 'RTK-GCP Redundant Ground Benchmark Verification'],
    benefits: ['Survey hundreds of hectares in hours instead of weeks', 'Safely map hazardous or inaccessible marshes and riverbanks', 'Provides stunning high-definition visual assets for stakeholders'],
  },
  'gis-solutions': {
    slug: 'gis-solutions',
    title: 'Enterprise GIS & Spatial Digital Twins',
    category: 'GIS Solutions',
    lead: 'Transforming complex spatial infrastructure and field telemetry into real-time decision intelligence platforms.',
    description: 'We build enterprise geodatabases, hydraulic digital twins, and cloud-hosted GIS web portals that bring CAD drawings, drone imagery, and field sensor data together for utilities and smart cities.',
    image: '/real-media/service-gis-remote-sensing.png',
    equipment: ['PostgreSQL 16 + PostGIS Spatial Engine', 'QGIS / ESRI ArcGIS Pro Geoprocessing Workstations', 'Custom WebGL / Leaflet / Mapbox Frontend Frameworks'],
    deliverables: ['Enterprise Geodatabase Architecture & Data Dictionary', 'Interactive Web GIS Dashboard with Multi-Layer Overlays', 'Subsurface Pipeline Hydraulic Network Topologies', 'Automated PDF Map Generation & Reporting Engine'],
    standards: ['OGC (Open Geospatial Consortium) Compliant Standards', 'ISO 19115 Geographic Information Metadata Standard', 'Role-Based Access Control (RBAC) & Secure Data Hosting'],
    benefits: ['Pinpoint valve locations and pipe leaks within minutes', 'Eliminate data silos between field teams and headquarters', 'Seamless integration with existing enterprise ERP and SCADA'],
  },
  'bathymetric-survey': {
    slug: 'bathymetric-survey',
    title: 'Hydrographic & Bathymetric Sounding',
    category: 'Hydrographic Survey',
    lead: 'High-precision riverbed topography, velocity profiling, and scour detection in tidal delta waterways.',
    description: 'We deploy survey vessels equipped with dual-frequency echo sounders, Acoustic Doppler Current Profilers (ADCP), and RTK heave-pitch-roll sensors to map underwater terrain and sediment dynamics.',
    image: '/real-media/project-badc-jhopjhopia-river.jpg',
    equipment: ['Dual-Frequency Survey-Grade Digital Echo Sounders', 'Teledyne / SonTek Acoustic Doppler Current Profilers (ADCP)', 'Real-Time Heave, Pitch, and Roll Motion Sensors'],
    deliverables: ['Riverbed Bathymetry Contours and 3D Underwater Meshes', 'Pre- and Post-Dredging Volumetric Calculation Reports', '3D Flow Velocity Vector Maps across Channel Cross-Sections', 'Submerged Hazard and Obstruction Location Charts'],
    standards: ['IHO (International Hydrographic Organization) Standards S-44', 'BIWTA (Bangladesh Inland Water Transport Authority) Specifications', 'Tidal Gauge Benchmarking to PWD / Chart Datum'],
    benefits: ['Target dredging precisely where sediment shoals obstruct navigation', 'Detect underwater embankment scour holes before surface collapse', 'Accurate cubic meter volume certifications for contractor billing'],
  },
  'boundary-survey': {
    slug: 'boundary-survey',
    title: 'Mouza & Cadastral Land Boundary Survey',
    category: 'Land Records',
    lead: 'Reconciling historical Mouza land sheets with modern satellite imagery and millimeter-level RTK coordinates.',
    description: 'We digitize, rectify, and georeference historical CS, RS, and BS Mouza map sheets to resolve land ownership conflicts, establish project right-of-way (RoW), and ensure legally sound site acquisitions.',
    image: '/real-media/service-road-bridge-engineering.jpg',
    equipment: ['High-Precision Large-Format Calibrated Document Scanners', 'Dual-Frequency RTK GNSS Rovers', 'ArcGIS Advanced Georeferencing & Polygon Topology Engines'],
    deliverables: ['Georeferenced Mouza Map Overlays on Satellite Imagery', 'Right-of-Way (RoW) Demarcation CAD Plans', 'Land Ownership, Plot Schedule, and Discrepancy Audits', 'Boundary Pillar Staking and Physical Monumentation'],
    standards: ['Land Record & Survey Department (DLRS) Frameworks', 'Bangladesh Transverse Mercator (BTM) Projections', 'Legally Defensible Expert Survey Documentation'],
    benefits: ['Prevent costly land ownership litigation prior to construction', 'Clear demarcation for acquisition compensation packages', 'Complete transparency for international development financiers'],
  },
  'subsurface-utility': {
    slug: 'subsurface-utility',
    title: 'Subsurface Utility Engineering (SUE)',
    category: 'Underground Infrastructure',
    lead: 'Multi-frequency Ground Penetrating Radar (GPR) and electromagnetic locating to eliminate underground utility strikes.',
    description: 'We identify and map buried electric cables, fiber optics, water mains, and gas lines prior to urban excavation, piling, and micro-tunneling.',
    image: '/real-media/equipment-rtk-gnss-station.jpg',
    equipment: ['Dual-Frequency Shielded Ground Penetrating Radar (GPR)', 'Electromagnetic Precision Pipe & Cable Locators (EML)', 'Direct-Connection Signal Transmitters (Induction & Clamp)'],
    deliverables: ['3D CAD Utility Trench Collision Models', 'ASCE 38-02 Quality Level A, B, and C Survey Plans', 'Depth-of-Cover and Pipe Diameter Attribute Schedules', 'Conflict Matrix for Piling and Excavation Works'],
    standards: ['ASCE Standard 38-02 Guidelines for SUE', 'Strict No-Strike Safety Clearance Protocols'],
    benefits: ['Zero utility strike incidents during deep excavation', 'Prevent massive municipal fines and emergency repair costs', 'Maintain public safety and traffic flow during construction'],
  },
};

export async function generateStaticParams() {
  return Object.keys(serviceDetails).map((slug) => ({ slug }));
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  // Try fetching service data from Admin CMS backend first
  const cmsServices = await CmsApi.getServices().catch(() => []);
  const dbService = cmsServices.find((s: any) => s.slug === slug || s.id === slug);

  const baseService = serviceDetails[slug] || (dbService ? {
    slug: dbService.slug,
    title: dbService.title,
    category: dbService.category || 'Engineering Services',
    lead: dbService.description || '',
    description: dbService.description || '',
    image: dbService.imageUrl || '/real-media/service-topographic-uav.png',
    equipment: ['Trimble / Leica Dual-Frequency GNSS RTK Receivers', 'Robotic Total Stations', 'Digital Leveling Instruments'],
    deliverables: dbService.features && dbService.features.length > 0 ? dbService.features : ['CAD Topographic Plans', '3D Surface Models', 'Engineering Survey Dossier'],
    standards: ['Survey of Bangladesh (SOB) PWD Datum', 'BTM (Bangladesh Transverse Mercator) Projection'],
    benefits: ['Sub-centimeter spatial accuracy', 'Certified legal defensibility', 'Eliminate redesign & earthwork volume errors'],
  } : null);

  if (!baseService) notFound();

  // Merge live admin CMS fields if available
  const service: ServiceDetail = {
    ...baseService,
    title: dbService?.title || baseService.title,
    category: dbService?.category || baseService.category,
    description: dbService?.description || baseService.description,
    image: dbService?.imageUrl || baseService.image,
    deliverables: (dbService?.features && dbService.features.length > 0) ? dbService.features : baseService.deliverables,
  };

  // Related capabilities
  const related = Object.values(serviceDetails)
    .filter((s) => s.slug !== slug)
    .slice(0, 2);

  return (
    <CorporateShell>
      <main className="wsp-service-detail bg-white text-[#141212] font-sans antialiased">
        {/* =========================================================================
            BREADCRUMBS & HERO
            ========================================================================= */}
        <section className="bg-white pt-28 pb-10 border-b border-neutral-100">
          <div className="max-w-[1440px] mx-auto px-6 md:px-12">
            <nav className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-500 mb-6" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-[#F4382D] transition-colors">
                Home
              </Link>
              <span className="text-neutral-300">/</span>
              <Link href="/services" className="hover:text-[#F4382D] transition-colors">
                What We Do
              </Link>
              <span className="text-neutral-300">/</span>
              <span className="text-[#F4382D] line-clamp-1">{service.title}</span>
            </nav>

            <div className="max-w-4xl space-y-4">
              <span className="inline-block text-[12px] font-extrabold uppercase tracking-[0.16em] text-[#F4382D]">
                {service.category}
              </span>
              <h1 className="text-[34px] sm:text-[46px] lg:text-[54px] font-extrabold text-[#141212] tracking-[-0.03em] leading-[1.1]">
                {service.title}
              </h1>
              <p className="text-[18px] sm:text-[21px] text-neutral-600 font-normal leading-relaxed pt-1">
                {service.lead}
              </p>
            </div>
          </div>
        </section>

        {/* =========================================================================
            FEATURED HERO PHOTOGRAPHY
            ========================================================================= */}
        <section className="max-w-[1440px] mx-auto px-6 md:px-12 py-8">
          <div className="aspect-[21/9] sm:aspect-[16/8] overflow-hidden bg-neutral-900 shadow-xl relative">
            <img
              src={service.image}
              alt={service.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-6 bg-black/70 backdrop-blur-md px-4 py-2 text-white text-[12px] font-semibold tracking-wide">
              {service.title} • Field Equipment & In-Situ Standards
            </div>
          </div>
        </section>

        {/* =========================================================================
            TECHNICAL SPECIFICATIONS GRID (8:4 SPLIT)
            ========================================================================= */}
        <section className="max-w-[1440px] mx-auto px-6 md:px-12 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            {/* Left 8 Cols: Overview, Equipment & Deliverables */}
            <div className="lg:col-span-8 space-y-12">
              <div className="space-y-4">
                <span className="text-[12px] font-bold uppercase tracking-[0.14em] text-neutral-500">
                  01 / CAPABILITY OVERVIEW
                </span>
                <h2 className="text-[26px] sm:text-[30px] font-extrabold tracking-[-0.02em] text-[#141212] leading-tight">
                  Uncompromising Standards for Critical Infrastructure
                </h2>
                <p className="text-[16px] text-neutral-700 leading-[1.8]">
                  {service.description}
                </p>
              </div>

              {/* Key Deliverables */}
              <div className="space-y-4 border-l-2 border-[#F4382D] pl-6 py-2 bg-neutral-50/70">
                <span className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#F4382D]">
                  02 / TYPICAL DELIVERABLES
                </span>
                <h3 className="text-[22px] font-bold text-[#141212]">
                  What You Receive
                </h3>
                <ul className="space-y-2 pt-2">
                  {service.deliverables.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-[15px] text-neutral-800">
                      <CheckCircle2 size={18} className="text-[#F4382D] shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Deployed Equipment Suite */}
              <div className="space-y-6">
                <span className="text-[12px] font-bold uppercase tracking-[0.14em] text-neutral-500">
                  03 / EQUIPMENT SUITE
                </span>
                <h3 className="text-[24px] font-bold text-[#141212]">
                  Survey-Grade Instrumentation
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                  {service.equipment.map((eq, idx) => (
                    <div key={idx} className="p-5 border border-neutral-200 bg-white shadow-sm space-y-2">
                      <Wrench size={20} className="text-[#F4382D]" />
                      <p className="text-[14px] font-bold text-[#141212] leading-snug">{eq}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Why Work With GW */}
              <div className="space-y-4">
                <span className="text-[12px] font-bold uppercase tracking-[0.14em] text-neutral-500">
                  04 / PROJECT ADVANTAGES
                </span>
                <h3 className="text-[24px] font-bold text-[#141212]">
                  Why Engineering Leaders Choose Geospatial Works
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  {service.benefits.map((b, idx) => (
                    <div key={idx} className="p-5 bg-neutral-50 border border-neutral-200 space-y-1">
                      <span className="text-[12px] font-bold text-[#F4382D]">0{idx + 1}</span>
                      <p className="text-[14px] font-semibold text-neutral-800">{b}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right 4 Cols: Factsheet & Direct Inquiry */}
            <aside className="lg:col-span-4 space-y-8 sticky top-28">
              <div className="border border-neutral-200 p-8 bg-[#FBFBFB] space-y-6 shadow-sm">
                <div className="border-b border-neutral-200 pb-4">
                  <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-500">
                    COMPLIANCE & STANDARDS
                  </span>
                  <h3 className="text-[20px] font-extrabold text-[#141212] pt-1">
                    Quality Benchmarks
                  </h3>
                </div>

                <div className="space-y-3">
                  {service.standards.map((st, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-[13px] text-neutral-700">
                      <ShieldCheck size={16} className="text-[#F4382D] shrink-0 mt-0.5" />
                      <span>{st}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-neutral-200 space-y-3">
                  <Link
                    href="/contact"
                    className="w-full text-center block bg-[#F4382D] hover:bg-[#d62f25] text-white text-[13px] font-bold py-3.5 tracking-wide transition-colors"
                  >
                    Request a Service Proposal
                  </Link>
                  <Link
                    href="/services"
                    className="w-full text-center block border border-neutral-300 hover:border-black text-[#141212] text-[13px] font-bold py-3 transition-colors"
                  >
                    ← All Capabilities
                  </Link>
                </div>
              </div>

              {/* Direct Support Card */}
              <div className="bg-[#141212] text-white p-7 space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#F4382D]">
                  CONSULTATION
                </span>
                <h4 className="text-[17px] font-bold">Have unique site requirements?</h4>
                <p className="text-[13px] text-neutral-400 leading-normal">
                  Our survey engineers will review your site plans and propose the optimal mix of ground, aerial, and subsurface instruments.
                </p>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-1.5 text-[13px] font-bold text-white hover:text-[#F4382D] transition-colors pt-1"
                >
                  Speak with our Chief Surveyor <ArrowRight size={14} />
                </Link>
              </div>
            </aside>
          </div>
        </section>

        {/* =========================================================================
            RELATED CAPABILITIES
            ========================================================================= */}
        {related.length > 0 && (
          <section className="bg-neutral-50 py-20 border-t border-neutral-200">
            <div className="max-w-[1440px] mx-auto px-6 md:px-12">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-[28px] sm:text-[34px] font-extrabold text-[#141212] tracking-tight">
                  Complementary Capabilities
                </h3>
                <Link
                  href="/services"
                  className="text-[14px] font-bold text-[#F4382D] hover:underline flex items-center gap-1"
                >
                  View all capabilities <ChevronRight size={16} />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {related.map((rel) => (
                  <Link
                    key={rel.slug}
                    href={`/services/${rel.slug}`}
                    className="group block bg-white p-6 border border-neutral-200 hover:border-neutral-400 transition-all shadow-sm space-y-4"
                  >
                    <div className="aspect-[16/9] overflow-hidden bg-neutral-100">
                      <img
                        src={rel.image}
                        alt={rel.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-neutral-500">
                        {rel.category}
                      </span>
                      <h4 className="text-[18px] font-bold text-[#141212] group-hover:text-[#F4382D] transition-colors leading-snug mt-1">
                        {rel.title}
                      </h4>
                      <p className="text-[13px] text-neutral-600 line-clamp-2 mt-2">
                        {rel.lead}
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
                START A CONVERSATION
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