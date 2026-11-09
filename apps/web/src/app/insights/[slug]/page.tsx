import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, ArrowRight, Calendar, User, Clock, Share2, ArrowLeft } from 'lucide-react';
import CorporateShell from '@/components/CorporateShell';
import '../../corporate.css';

interface ArticleDetail {
  slug: string;
  title: string;
  category: string;
  date: string;
  readTime: string;
  author: {
    name: string;
    role: string;
    image: string;
  };
  summary: string;
  imageUrl: string;
  content: Array<{
    heading?: string;
    body: string[];
    quote?: string;
  }>;
}

const fullArticles: Record<string, ArticleDetail> = {
  'river-delta-resilience-bathymetry': {
    slug: 'river-delta-resilience-bathymetry',
    title: 'River Delta Resilience: Advanced Bathymetric Sounding and Riverbed Morphology Modeling',
    category: 'Case Study',
    date: '26.11.04',
    readTime: '6 min read',
    author: {
      name: 'Engr. Mahbubur Rahman',
      role: 'Head of Hydrographic & Bathymetric Engineering',
      image: '/inner/team-01.webp',
    },
    summary: 'How dual-frequency sonar and acoustic Doppler current profilers (ADCP) provide civil engineers with the cross-section hydrography required to stabilize river training structures along the Jamuna basin.',
    imageUrl: '/geospatial-river-hero.webp',
    content: [
      {
        heading: 'The Dynamics of Tidal Floodplain Sedimentation',
        body: [
          'The Bengal Delta represents one of the most morphologically active river systems on earth. Annual monsoon discharges carry over a billion tons of suspended sediment through the Padma, Jamuna, and Meghna braided rivers, resulting in drastic channel shifting, scour hole formation, and embankment destabilization.',
          'Conventional single-beam or manual lead-line soundings cannot capture the volumetric bathymetry necessary to design resilient river defense revetments. By integrating dual-frequency survey-grade echo sounders with RTK-corrected heave, pitch, and roll sensors, Geospatial Works captures 3D underwater terrain with decimeter-level volumetric fidelity.',
        ],
        quote: 'Precision underwater topographic models are no longer a luxury; they are the fundamental baseline required to prevent multi-million dollar embankment failures.',
      },
      {
        heading: 'Sensor Integration and Velocity Profiling',
        body: [
          'During our field missions on the Jamuna corridor, our hydrographic team paired multibeam bathymetric systems with Acoustic Doppler Current Profilers (ADCP). This dual deployment enabled simultaneous mapping of riverbed contours and 3D velocity vectors across the water column.',
          'The resulting datasets allow hydraulic engineers to model localized turbulence near guide bunds and spur dikes, pinpointing areas where high-velocity eddies are carving underwater scour pools before surface bank collapse occurs.',
        ],
      },
      {
        heading: 'Actionable Deliverables for River Basin Authorities',
        body: [
          'Deliverables included calibrated cross-sectional bathymetric profiles every 50 meters, hydrodynamic digital elevation models, and change-detection heatmaps comparing pre- and post-monsoon riverbed elevations.',
          'These insights empowered the Bangladesh Water Development Board (BWDB) and donor agencies to target dredging and geotextile bag revetments precisely where scour risk was highest, saving critical capital expenditure.',
        ],
      },
    ],
  },
  'rtk-gnss-national-corridor-geodesy': {
    slug: 'rtk-gnss-national-corridor-geodesy',
    title: 'Sub-Centimeter Geodesy: Establishing Reliable Vertical Control for National Transport Corridors',
    category: 'Technical Bulletin',
    date: '26.10.29',
    readTime: '5 min read',
    author: {
      name: 'Tanvir Hossain',
      role: 'Lead Geodetic Surveyor & GNSS Specialist',
      image: '/inner/team-02.webp',
    },
    summary: 'A deep dive into high-precision RTK GNSS base-rover networks, geoid undulation corrections, and benchmark tying across tidal delta floodplains.',
    imageUrl: '/field-surveyor-v2.webp',
    content: [
      {
        heading: 'The Challenge of Vertical Control in Delta Soil',
        body: [
          'In major infrastructure projects such as elevated expressways, high-speed rail, and long-span river bridges, vertical precision is paramount. A 2-centimeter elevation error over a 500-meter span can cause catastrophic alignment defects, drainage pooling, and bridge bearing mismatches.',
          'In Bangladesh, establishing rigid vertical benchmarks is complicated by deep alluvial soil settlement, seasonal water table variations, and differing historical datum baselines (PWD vs. MSL vs. SOB).',
        ],
        quote: 'Vertical precision is where good surveys become engineering truth. Without strict geodetic datum transformations, modern design models cannot translate to ground realities.',
      },
      {
        heading: 'Closed-Loop Geodetic Networks & CORS Integration',
        body: [
          'To establish uncompromised control, Geospatial Works deploys multi-constellation GNSS receivers (GPS, GLONASS, Galileo, BeiDou) linked to continuously operating reference stations (CORS) and permanent concrete geodetic pillars.',
          'Every primary monument undergoes static GNSS observation sessions lasting 6 to 12 hours, followed by rigorous least-squares network adjustments and digital leveling using barcode invar staffs to achieve millimeter-level closure.',
        ],
      },
      {
        heading: 'Seamless CAD & BIM Handover',
        body: [
          'The adjusted coordinates and elevations are converted directly into project-specific localized grid coordinates (such as BTM - Bangladesh Transverse Mercator) with documented scale factors, ensuring contractor survey teams experience zero coordinate divergence throughout construction.',
        ],
      },
    ],
  },
  'dhaka-wasa-smart-utility-digital-twin': {
    slug: 'dhaka-wasa-smart-utility-digital-twin',
    title: 'Transforming Municipal Water Distribution into Enterprise GIS Digital Twins',
    category: 'Press Release',
    date: '26.10.15',
    readTime: '4 min read',
    author: {
      name: 'Farhana Akter',
      role: 'Director of GIS & Spatial Enterprise Architecture',
      image: '/inner/team-03.webp',
    },
    summary: 'Geospatial Works successfully completes subsurface pipeline detection and valve geodatabase integration covering 450 km of municipal pipelines in Dhaka.',
    imageUrl: '/delta-hero-v2.webp',
    content: [
      {
        heading: 'Modernizing Dhaka’s Underground Water Arteries',
        body: [
          'Managing water distribution for a metropolis of over 20 million residents requires precise real-time knowledge of buried pipeline networks. Over decades of urban expansion, unmapped pipe segments, buried valve chambers, and undocumented spurs created significant non-revenue water (NRW) loss.',
          'Geospatial Works was commissioned to create a comprehensive digital twin of Dhaka WASA’s municipal supply infrastructure, combining non-destructive subsurface utility engineering with spatial database architecture.',
        ],
        quote: 'Transforming legacy paper records and hidden underground valves into an interactive 3D GIS platform empowers municipal authorities to prevent leaks and respond to pipe bursts in minutes.',
      },
      {
        heading: 'Subsurface Electromagnetic Locating and GIS Modeling',
        body: [
          'Our engineering teams deployed high-frequency electromagnetic pipe locators and dual-frequency ground penetrating radar (GPR) across arterial roadways, mapping pipeline material, depth of cover, and joint configurations without tearing up road surfaces.',
          'Every above-ground valve, flow meter, and fire hydrant was surveyed with sub-centimeter RTK receivers and cataloged with custom mobile GIS collection tablets.',
        ],
      },
      {
        heading: 'Empowering Operation & Maintenance',
        body: [
          'The finalized dataset comprises over 450 kilometers of digitized, topological pipeline networks formatted as an enterprise PostgreSQL/PostGIS spatial database seamlessly integrated with hydraulic modeling software.',
        ],
      },
    ],
  },
  'high-density-uav-lidar-flood-defenses': {
    slug: 'high-density-uav-lidar-flood-defenses',
    title: 'High-Density Airborne UAV LiDAR: Piercing Dense Vegetative Canopy for Flood Modeling',
    category: 'Technical Bulletin',
    date: '26.09.28',
    readTime: '5 min read',
    author: {
      name: 'Tanvir Hossain',
      role: 'Lead Geodetic Surveyor & GNSS Specialist',
      image: '/inner/team-02.webp',
    },
    summary: 'Extracting bare-earth digital elevation models (DEM) through dense mangrove and delta vegetation to assist disaster management boards.',
    imageUrl: '/hero-poster.jpg',
    content: [
      {
        heading: 'Overcoming Canopy Blind Spots',
        body: [
          'Traditional aerial photogrammetry relies on optical sightlines, meaning dense vegetation like bamboo groves, fruit orchards, and mangrove belts appear as solid green canopies, hiding the true ground elevation beneath.',
          'Geospatial Works deployed triple-return airborne LiDAR sensor payloads capable of sending up to 300,000 laser pulses per second. These multiple returns penetrate gaps in leaves and branches to capture reflections directly from the ground floor.',
        ],
      },
      {
        heading: 'Automated Ground Classification and Hydrological Inundation',
        body: [
          'Using advanced point cloud classification algorithms, our spatial analysts filter out vegetation and man-made structures, generating seamless bare-earth digital terrain models (DTM) with 5-centimeter vertical precision.',
          'These high-fidelity DTMs are critical inputs for hydrodynamic 2D flood simulation models, allowing engineers to predict flash-flood overflow pathways and optimize embankment crest elevations.',
        ],
      },
    ],
  },
  'ground-penetrating-radar-urban-expressway': {
    slug: 'ground-penetrating-radar-urban-expressway',
    title: 'Ground Penetrating Radar in Dense Urban Corridors: Mitigating Utility Strikes',
    category: 'Case Study',
    date: '26.09.12',
    readTime: '6 min read',
    author: {
      name: 'Engr. Mahbubur Rahman',
      role: 'Head of Hydrographic & Bathymetric Engineering',
      image: '/inner/team-01.webp',
    },
    summary: 'Best practices for multi-frequency electromagnetic locating and GPR radargrams prior to deep piling for elevated viaducts.',
    imageUrl: '/field-surveyor-v2.webp',
    content: [
      {
        heading: 'Eliminating the Risk of Utility Strikes',
        body: [
          'Deep bored piling in city centers presents severe risks to buried gas lines, fiber optic backbones, and high-voltage transmission cables. A single utility strike can trigger massive blackouts, gas leaks, and multi-week project delays.',
          'Geospatial Works provides comprehensive Subsurface Utility Engineering (SUE) Quality Level B and A services, utilizing shielded ground penetrating radar arrays and electromagnetic induction to produce 3D underground collision maps.',
        ],
      },
    ],
  },
  'coastal-erosion-drone-orthomosaics': {
    slug: 'coastal-erosion-drone-orthomosaics',
    title: 'Multi-Temporal Drone Orthomosaics for Coastal Erosion and Mangrove Monitoring',
    category: 'Case Study',
    date: '26.08.20',
    readTime: '5 min read',
    author: {
      name: 'Farhana Akter',
      role: 'Director of GIS & Spatial Enterprise Architecture',
      image: '/inner/team-03.webp',
    },
    summary: 'Tracking shoreline retreat and afforestation dynamics along the Cox’s Bazar and Kuakata coastal shelf with centimeter-level aerial photogrammetry.',
    imageUrl: '/geospatial-river-hero.webp',
    content: [
      {
        heading: 'Monitoring Bangladesh’s Shifting Coastal Frontier',
        body: [
          'The Bay of Bengal coastline experiences intense tidal currents, monsoon storm surges, and cyclonic wave action. Accurate spatial monitoring of shoreline progression and mangrove canopy density is essential for coastal defense infrastructure.',
          'By flying calibrated RGB and multispectral drone surveys on fixed seasonal schedules, Geospatial Works generates high-resolution orthomosaics and normalized difference vegetation index (NDVI) models to track real shoreline movement over time.',
        ],
      },
    ],
  },
  'dtca-bus-route-rationalization': {
    slug: 'dtca-bus-route-rationalization',
    title: 'Rapid Deployment of DJI Matrice 4E UAV Photogrammetry for DTCA Bus Route Rationalization',
    category: 'Case Study',
    date: '26.09.30',
    readTime: '6 min read',
    author: {
      name: 'Geospatial Engineering Team',
      role: 'Aerial Survey & Traffic Planning',
      image: '/inner/team-02.webp',
    },
    summary: 'Execution of 35.15 sq km UAV drone and traffic OD survey across 150 km of Dhaka arterial transit corridors in 30 days.',
    imageUrl: '/projects-extracted/page_31/img_01.jpg',
    content: [
      {
        heading: 'Rapid Turnaround for Megacity Transit Restructuring',
        body: [
          'Dhaka Transport Coordination Authority (DTCA) commissioned Geospatial Works to execute comprehensive corridor drone photogrammetry and traffic counts to modernize bus route networks across Dhaka.',
          'Deploying RTK-enabled enterprise drone fleets during early dawn windows permitted complete orthomosaic surface capture without disrupting heavy daytime traffic.',
        ],
      },
    ],
  },
  'abdulpur-railway-bypass': {
    slug: 'abdulpur-railway-bypass',
    title: 'Generating 0.20cm Digital Terrain Models & High-Resolution Orthomosaics for Railway Bypasses',
    category: 'Technical Bulletin',
    date: '26.08.15',
    readTime: '5 min read',
    author: {
      name: 'Tanvir Hossain',
      role: 'Lead Geodetic Surveyor & Photogrammetrist',
      image: '/inner/team-02.webp',
    },
    summary: 'Sub-centimeter RTK topographic and UAV photogrammetry survey producing DSM, DTM, and 0.20m interval contours for Bangladesh Railway bypass under RCIPF.',
    imageUrl: '/projects-extracted/page_29/img_02.jpg',
    content: [
      {
        heading: 'Millimeter Geodetic Control for Railway Infrastructure',
        body: [
          'Under the ADB-funded RCIPF subproject 2, our surveyors completed rigorous corridor mapping and bare-earth DTM extraction within 14 days, directly facilitating international alignment engineering.',
        ],
      },
    ],
  },
  'coastal-mangrove-assessment': {
    slug: 'coastal-mangrove-assessment',
    title: 'Coastal Mangrove Accretion Assessment Using RTK-Enabled UAVs for Bangladesh Forest Department',
    category: 'Environmental Research',
    date: '26.07.10',
    readTime: '5 min read',
    author: {
      name: 'Farhana Akter',
      role: 'Director of GIS & Remote Sensing',
      image: '/inner/team-03.webp',
    },
    summary: 'Monitoring newly accreted coastal silt formations and mangrove afforestation canopy health using multi-spectral drone analytics.',
    imageUrl: '/projects-extracted/page_25/img_02.jpg',
    content: [
      {
        heading: 'Coastal Delta Dynamics and Mangrove Ecosystems',
        body: [
          'High-precision multispectral sensor flights allowed rapid NDVI calculation and accretion land-cover mapping across difficult intertidal delta zones.',
        ],
      },
    ],
  },
};

export async function generateStaticParams() {
  return Object.keys(fullArticles).map((slug) => ({ slug }));
}

export default async function InsightDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = fullArticles[slug];

  if (!article) notFound();

  // Find related articles (excluding current)
  const related = Object.values(fullArticles)
    .filter((a) => a.slug !== slug)
    .slice(0, 3);

  return (
    <CorporateShell>
      <main className="wsp-insight-detail bg-white text-[#141212] font-sans antialiased">
        {/* =========================================================================
            BREADCRUMB & ARTICLE HEADER
            ========================================================================= */}
        <section className="bg-white pt-28 pb-10 border-b border-neutral-100">
          <div className="max-w-[1440px] mx-auto px-6 md:px-12">
            {/* WSP Breadcrumb */}
            <nav className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-500 mb-6" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-[#F4382D] transition-colors">
                Home
              </Link>
              <span className="text-neutral-300">/</span>
              <Link href="/insights" className="hover:text-[#F4382D] transition-colors">
                News & Insights
              </Link>
              <span className="text-neutral-300">/</span>
              <span className="text-[#F4382D] line-clamp-1">{article.title}</span>
            </nav>

            {/* Category Pill & Red Date */}
            <div className="flex items-center gap-4 text-[12px] font-bold uppercase tracking-wider mb-4">
              <span className="bg-[#141212] text-white px-3 py-1 font-extrabold text-[11px]">
                {article.category}
              </span>
              <span className="text-[#F4382D] font-mono font-bold">
                {article.date}
              </span>
              <span className="text-neutral-400">•</span>
              <span className="text-neutral-500 flex items-center gap-1 font-medium">
                <Clock size={13} /> {article.readTime}
              </span>
            </div>

            {/* Monumental Headline */}
            <div className="max-w-4xl space-y-6">
              <h1 className="text-[32px] sm:text-[44px] lg:text-[50px] font-extrabold text-[#141212] tracking-[-0.03em] leading-[1.14]">
                {article.title}
              </h1>

              <p className="text-[18px] sm:text-[21px] text-neutral-600 font-normal leading-relaxed">
                {article.summary}
              </p>

              {/* Author Strip */}
              <div className="pt-4 border-t border-neutral-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full overflow-hidden bg-neutral-200 border border-neutral-300">
                    <img
                      src={article.author.image}
                      alt={article.author.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-[14px] font-bold text-[#141212] leading-tight">
                      {article.author.name}
                    </h4>
                    <p className="text-[12px] text-neutral-500">
                      {article.author.role}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-neutral-400">
                  <span className="text-[12px] font-semibold uppercase tracking-wider">Geospatial Works</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            FEATURED HERO PHOTOGRAPHY
            ========================================================================= */}
        <section className="max-w-[1440px] mx-auto px-6 md:px-12 py-8">
          <div className="aspect-[21/9] sm:aspect-[16/8] overflow-hidden bg-neutral-900 shadow-xl relative">
            <img
              src={article.imageUrl}
              alt={article.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-6 bg-black/70 backdrop-blur-md px-4 py-2 text-white text-[12px] font-semibold tracking-wide">
              Field Documentation • Geospatial Works Technical Archive
            </div>
          </div>
        </section>

        {/* =========================================================================
            ARTICLE BODY (8:4 SPLIT)
            ========================================================================= */}
        <section className="max-w-[1440px] mx-auto px-6 md:px-12 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            {/* Left 8 Cols: Article Narrative */}
            <div className="lg:col-span-8 space-y-10">
              {article.content.map((section, idx) => (
                <div key={idx} className="space-y-4">
                  {section.heading && (
                    <h2 className="text-[24px] sm:text-[28px] font-extrabold text-[#141212] tracking-[-0.02em] pt-4">
                      {section.heading}
                    </h2>
                  )}

                  {section.body.map((p, pIdx) => (
                    <p key={pIdx} className="text-[16px] text-neutral-700 leading-[1.8] font-normal">
                      {p}
                    </p>
                  ))}

                  {section.quote && (
                    <blockquote className="my-8 p-6 sm:p-8 border-l-4 border-[#F4382D] bg-neutral-50 space-y-2">
                      <p className="text-[18px] sm:text-[20px] font-extrabold text-[#141212] italic leading-snug">
                        “{section.quote}”
                      </p>
                      <cite className="block text-[12px] font-bold uppercase tracking-wider text-[#F4382D] not-italic">
                        — {article.author.name}, Geospatial Works
                      </cite>
                    </blockquote>
                  )}
                </div>
              ))}

              {/* Share / Back Bar */}
              <div className="pt-8 border-t border-neutral-200 flex items-center justify-between">
                <Link
                  href="/insights"
                  className="inline-flex items-center gap-2 text-[14px] font-bold text-[#141212] hover:text-[#F4382D] transition-colors"
                >
                  <ArrowLeft size={16} /> Back to all insights
                </Link>

                <div className="flex items-center gap-2 text-[13px] font-bold text-neutral-500">
                  <Share2 size={16} /> Share Technical Insight
                </div>
              </div>
            </div>

            {/* Right 4 Cols: Author & Technical Factsheet */}
            <aside className="lg:col-span-4 space-y-8 sticky top-28">
              {/* Author Profile Card */}
              <div className="border border-neutral-200 p-8 bg-[#FBFBFB] space-y-5 shadow-sm">
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-500">
                  WRITTEN BY
                </span>

                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-neutral-300">
                    <img
                      src={article.author.image}
                      alt={article.author.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-[16px] font-extrabold text-[#141212]">
                      {article.author.name}
                    </h3>
                    <p className="text-[12px] text-neutral-600">
                      {article.author.role}
                    </p>
                  </div>
                </div>

                <p className="text-[13px] text-neutral-600 leading-normal pt-2">
                  Specializing in advanced spatial data processing, engineering geodesy, and high-fidelity mapping across South Asia’s complex terrain.
                </p>

                <div className="pt-4 border-t border-neutral-200">
                  <Link
                    href="/team"
                    className="text-[13px] font-bold text-[#F4382D] hover:underline flex items-center gap-1"
                  >
                    View Innovator Profile <ChevronRight size={15} />
                  </Link>
                </div>
              </div>

              {/* Subscribe / Technical Inquiry */}
              <div className="bg-[#141212] text-white p-7 space-y-4">
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#F4382D]">
                  TECHNICAL PUBLICATIONS
                </span>
                <h4 className="text-[18px] font-bold leading-snug">
                  Need custom survey consultation or research collaboration?
                </h4>
                <p className="text-[13px] text-neutral-400 leading-relaxed">
                  Our survey engineers regularly partner with academic institutions, consulting firms, and engineering authorities.
                </p>
                <Link
                  href="/contact"
                  className="wsp-btn wsp-btn-solid text-center block w-full py-3 text-[13px]"
                >
                  Contact Our Technical Team
                </Link>
              </div>
            </aside>
          </div>
        </section>

        {/* =========================================================================
            RELATED INSIGHTS (3 CARDS MATCHING WSP)
            ========================================================================= */}
        {related.length > 0 && (
          <section className="bg-neutral-50 py-20 border-t border-neutral-200">
            <div className="max-w-[1440px] mx-auto px-6 md:px-12">
              <div className="flex items-center justify-between mb-12">
                <h3 className="text-[28px] sm:text-[34px] font-extrabold text-[#141212] tracking-tight">
                  Related Insights
                </h3>
                <Link
                  href="/insights"
                  className="text-[14px] font-bold text-[#F4382D] hover:underline flex items-center gap-1"
                >
                  View all news & insights <ChevronRight size={16} />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {related.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/insights/${item.slug}`}
                    className="group block bg-white border border-neutral-200 hover:border-neutral-400 transition-all shadow-sm space-y-4 p-6"
                  >
                    <div className="aspect-[16/10] overflow-hidden bg-neutral-100">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-wider">
                        <span className="text-[#F4382D] font-mono">{item.date}</span>
                        <span className="text-neutral-400">•</span>
                        <span className="text-neutral-500">{item.category}</span>
                      </div>
                      <h4 className="text-[17px] font-bold text-[#141212] group-hover:text-[#F4382D] transition-colors leading-snug">
                        {item.title}
                      </h4>
                      <p className="text-[13px] text-neutral-600 line-clamp-2">
                        {item.summary}
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
                STAY CONNECTED WITH GEOSPATIAL WORKS
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