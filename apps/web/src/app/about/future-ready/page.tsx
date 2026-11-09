import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Cpu,
  ChevronRight,
  Check,
  Server,
  Radio,
  HardDrive,
  Layers,
  Zap,
  CheckCircle2,
  Compass,
  ArrowRight,
  Send,
  ShieldCheck,
  Waves,
  Building2,
  Table,
} from 'lucide-react';
import CorporateShell from '@/components/CorporateShell';
import KeepInTouchSection from '@/components/KeepInTouchSection';
import { CmsApi } from '@/lib/cms-api';
import '../../corporate.css';

export const revalidate = 10;

export const metadata = {
  title: 'Future Ready Geodesy | Physical Resources & Computing | Geospatial Works',
  description:
    '1,408-channel CHCNAV i83 RTK GNSS receivers, DJI Enterprise UAV fleet, Topcon & Sokkia optical levels, CHCNAV D270 echo sounder, and Intel Core i9/Ultra 7 DDR5 workstations with 40TB NAS.',
};

export default async function FutureReadyPage() {
  const sections = await CmsApi.getSections('future-ready').catch(() => ({} as Record<string, any>));
  const wysiwyg = (sections as Record<string, any>)['full_page_wysiwyg']?.content;

  const heroKicker = wysiwyg?.heroKicker || '02 / PHYSICAL RESOURCES & COMPUTATIONAL INFRASTRUCTURE';
  const heroTitle = wysiwyg?.heroTitle || 'Future-Ready Geodesy: Survey-Grade Hardware & Computing Power';
  const heroSubtitle =
    wysiwyg?.heroSubtitle ||
    'Deploying 1,408-channel RTK GNSS receivers, DJI Enterprise multispectral UAV fleets, hydrographic echo sounders, and 14th Gen Intel Core i9 / Core Ultra 7 DDR5 workstation clusters backed by 40TB NAS central storage.';
  const heroImage = wysiwyg?.heroImage || '/real-media/equipment-dji-drones.jpg';

  // 100% Real metrics from Slide 42, 43, 44
  const stats = [
    { value: '8 Units', label: 'CHCNAV i83 RTK GNSS (1,408 Channels)' },
    { value: '3 Fleets', label: 'DJI Enterprise Drones (7 Batteries Each)' },
    { value: '< 3 cm / px', label: 'UAV Ground Sample Distance (GSD)' },
    { value: '40 TB NAS', label: 'Centralized Spatial Storage Cluster' },
  ];

  // Verified Hardware Fleet from Slide 42 & 43
  const fleet = [
    {
      name: 'CHCNAV i83 RTK GNSS Receiver Fleet (8 Units)',
      discipline: 'Geodetic Baseline & Real-Time Kinematic Positioning',
      specs: '1,408 channels multi-constellation satellite tracking with static GNSS and GSM-based RTK operation up to 30 km range. Manufacturer: CHCNAV, China.',
      bullets: [
        'Full tracking of GPS, GLONASS, Galileo, BeiDou, and QZSS constellations',
        'Centimetre-level accuracy for topographic mapping and boundary demarcation',
        'Static GNSS observation mode for primary geodetic control point establishment',
        'GSM network RTK pairing for seamless long-range corridor surveys up to 30 km',
      ],
      image: '/real-media/equipment-rtk-gnss-station.jpg',
      badge: '8 Active Units',
    },
    {
      name: 'DJI Enterprise UAV Drone Fleet (7 Batteries per Platform)',
      discipline: 'Airborne Photogrammetry & Remote Sensing',
      specs: 'DJI Mavic 3 Enterprise, DJI Mavic 3 Multispectral, and DJI Matrice 4 Enterprise with 7 high-capacity flight batteries per aircraft for continuous field operations.',
      bullets: [
        'Mechanical shutter RGB sensors delivering ground sample distance < 3cm/px',
        'Multispectral sensor array for agricultural NDVI and vegetation health estimation',
        'Centimeter RTK positioning module paired directly with ground base stations',
        'Large-area and inaccessible site surveying across delta floodplains and corridors',
      ],
      image: '/real-media/equipment-dji-drones.jpg',
      badge: '7 Batteries / Drone',
    },
    {
      name: 'Precision Total Stations (Topcon, Sokkia, CHCNAV, Kolida)',
      discipline: 'Engineering Alignment & Cadastral Demarcation',
      specs: 'Multi-brand total stations delivering 1-second to 2-second angular accuracy and precision reflectorless distance measurements.',
      bullets: [
        'Angle and distance measurements for precise construction layout and setting out',
        'Cadastral boundary surveys and land parcel demarcation for legal registration',
        'Monitoring structural alignment, bridge piers, abutments, and high-rise verticality',
        'Integration with digital field books for automated CAD coordinate exports',
      ],
      image: '/real-media/equipment-total-stations.jpg',
      badge: 'Multi-Brand Fleet',
    },
    {
      name: 'Precision Optical Levels & Hydrographic Echo Sounder',
      discipline: 'Vertical Control & Hydrographic Bathymetry',
      specs: 'Sokkia B 20A (Japan), Topcon AT B 3 (Japan), and CHCNAV D270 Digital Echo Sounder (China) with GNSS positioning integration.',
      bullets: [
        'Closed-loop digital leveling ensuring vertical closure tolerances tighter than < 5mm √K',
        'Transfer and establishment of Survey of Bangladesh (SOB) MSL and PWD bench marks',
        'Echo Sounder D270 for georeferenced underwater riverbed and canal profiling',
        'Bathymetric cross-sections for bridges, water-level gauges, and irrigation canals',
      ],
      image: '/real-media/equipment-level-machines.jpg',
      badge: 'Japan & China Certified',
    },
  ];

  // Exact Workstations from Slide 44 & Draft 2 Slide 31
  const workstations = [
    {
      node: 'Workstation 1',
      processor: 'Intel Core i9, 14th Gen K-Series',
      ram: '64 GB DDR5 High-Speed Memory',
      gpu: 'NVIDIA RTX 4060 Ti',
      workload: 'High-density UAV photogrammetric point cloud reconstruction, bundle adjustment & orthomosaic generation',
    },
    {
      node: 'Workstation 2',
      processor: 'Intel Core i9, 14th Gen K-Series',
      ram: '64 GB DDR5 High-Speed Memory',
      gpu: 'NVIDIA RTX 4060 Ti',
      workload: '3D mesh modeling, digital surface model (DSM/DTM) extraction, and volumetric cut-and-fill analysis',
    },
    {
      node: 'Workstation 3',
      processor: 'Intel Core Ultra 7 K-Series',
      ram: '64 GB DDR5 High-Speed Memory',
      gpu: 'NVIDIA RTX 5060 Ti',
      workload: 'Deep learning spatial segmentation, multi-spectral NDVI classification, and large-scale GIS spatial databases',
    },
    {
      node: 'Workstation 4',
      processor: 'Intel Core i7, 14th Gen K-Series',
      ram: '32 GB DDR5 High-Speed Memory',
      gpu: 'Dedicated Graphics Engine',
      workload: 'AutoCAD Civil 3D alignment drafting, structural detailing, BOQ preparation, and SOB coordinate conversion',
    },
  ];

  // Equipment Inventory Table from Slide 43
  const equipmentInventory = [
    { name: 'CHCNAV i83 RTK GNSS Receiver', qty: '8 Units', maker: 'CHCNAV, China', application: 'Static & RTK Positioning, Control Networks' },
    { name: 'DJI Mavic 3 Enterprise (7 Batteries)', qty: '1 Fleet Unit', maker: 'DJI', application: 'High-Resolution Aerial Photogrammetry (< 3cm GSD)' },
    { name: 'DJI Mavic 3 Multispectral (7 Batteries)', qty: '1 Fleet Unit', maker: 'DJI', application: 'NDVI Vegetation Health & Agricultural Remote Sensing' },
    { name: 'DJI Matrice 4 Enterprise (7 Batteries)', qty: '1 Fleet Unit', maker: 'DJI', application: 'Heavy-Duty Enterprise Corridor Mapping' },
    { name: 'Echo Sounder D270', qty: '1 Unit', maker: 'CHCNAV, China', application: 'Hydrographic & Bathymetric Sounding, Riverbeds' },
    { name: 'Level Machine Sokkia B 20A', qty: '1 Unit', maker: 'Sokkia, Japan', application: 'Precise Vertical Levelling, Benchmark Transfer' },
    { name: 'Level Machine Topcon AT B 3', qty: '1 Unit', maker: 'Topcon, Japan', application: 'Site Levelling, Road & Drainage Slope Control' },
    { name: 'Total Stations (Topcon, Sokkia, CHCNAV, Kolida)', qty: 'Multiple', maker: 'Japan & China', application: 'Angle & Distance Measurement, Setting Out, Boundary' },
  ];

  // Software Facilities from Slide 44 & Draft 2 Slide 31
  const softwareSuite = [
    { name: 'Agisoft Metashape Pro', category: 'Photogrammetry & Point Cloud', desc: 'Dense point clouds, georeferenced orthomosaics, and 3D textured mesh generation from drone flights.' },
    { name: 'DJI Terra', category: 'UAV Mission Planning & LiDAR', desc: 'Real-time 2D/3D mapping, LiDAR point cloud reconstruction, and mission route optimization.' },
    { name: 'AutoCAD Civil 3D', category: 'Civil & Infrastructure BIM', desc: 'Corridor modeling, road geometry, cross-sections, pipe networks, and earthwork cut/fill computation.' },
    { name: 'ArcGIS Pro & QGIS 3.x LTR', category: 'GIS & Spatial Intelligence', desc: 'Enterprise spatial geodatabase design, vectorization, thematic mapping, and spatial decision support.' },
    { name: 'MIDAS-Civil & ETABS', category: 'Structural Engineering', desc: 'Finite element structural analysis for high-rise towers, multi-span RCC girder bridges, and viaducts.' },
    { name: 'STAAD-Pro CONNECT & SAFE', category: 'Civil Structures & Foundations', desc: 'Foundation mat/raft engineering, deep pile capacity, retained earth palisading, and culvert designs.' },
  ];

  return (
    <CorporateShell>
      <main className="min-h-screen bg-white text-[#141212] font-sans antialiased">
        {/* =========================================================================
            CINEMATIC ARCHITECTURAL HERO BANNER
            ========================================================================= */}
        <section className="relative bg-[#141212] text-white pt-36 pb-20 md:pb-28 overflow-hidden border-b border-neutral-800">
          <div className="absolute inset-0 z-0 opacity-25">
            <Image src={heroImage} alt="Future Ready Geodesy" fill className="object-cover" priority />
            <div className="absolute inset-0 bg-gradient-to-r from-[#141212] via-[#141212]/90 to-transparent" />
          </div>

          <div className="relative z-10 max-w-[1440px] mx-auto px-6 md:px-12 space-y-6">
            <div className="flex items-center gap-2 text-[12px] uppercase tracking-wider text-neutral-400 font-bold">
              <Link href="/" className="hover:text-[#F4382D] transition">Home</Link>
              <ChevronRight size={12} className="text-neutral-500" />
              <span className="text-[#3B82F6]">Who We Are</span>
              <ChevronRight size={12} className="text-neutral-500" />
              <span className="text-white">Future Ready Geodesy</span>
            </div>

            <div className="max-w-4xl space-y-4">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-block text-[11px] font-mono uppercase tracking-[0.2em] text-[#F4382D] font-bold bg-[#F4382D]/10 px-3 py-1 rounded border border-[#F4382D]/20">
                  {heroKicker}
                </span>
                <span className="inline-block text-[11px] font-mono uppercase tracking-[0.15em] text-[#3B82F6] font-bold bg-[#3B82F6]/10 px-3 py-1 rounded border border-[#3B82F6]/20">
                  SURVEY INSTRUMENTS &amp; COMPUTATION
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
                  <span>Request Equipment &amp; Crew Deployment</span>
                  <ArrowRight size={14} />
                </Link>
                <Link
                  href="/about/standards"
                  className="wsp-btn wsp-btn-outline !text-white !border-white/30 hover:!border-white hover:!bg-white/10 flex items-center gap-2"
                >
                  <Compass size={15} />
                  <span>SOB Datum Integration</span>
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
            SURVEY FLEET SPECIFICATIONS (100% REAL FROM SLIDES 42 & 43)
            ========================================================================= */}
        <section className="py-20 md:py-28 bg-[#FAFAFA] border-b border-neutral-200">
          <div className="max-w-[1440px] mx-auto px-6 md:px-12 space-y-12">
            <div className="max-w-3xl space-y-3">
              <span className="text-[12px] font-mono uppercase tracking-[0.2em] text-[#F4382D] font-bold block">
                PHYSICAL RESOURCES: FIELD SENSORS
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#141212]">
                Survey-Grade Field Equipment &amp; Aerial Fleets
              </h2>
              <p className="text-neutral-600 text-sm sm:text-base">
                Geospatial Works operates a fully owned, certified inventory of multi-constellation RTK GNSS receivers, commercial UAV drone platforms, Japanese optical levels, and digital hydrographic echo sounders.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {fleet.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-neutral-300 transition-all duration-300 flex flex-col"
                >
                  <div className="relative h-64 w-full bg-neutral-900 overflow-hidden">
                    <Image src={item.image} alt={item.name} fill className="object-cover hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md px-3 py-1 rounded text-[#3B82F6] font-mono text-xs font-bold uppercase tracking-wider">
                      {item.badge}
                    </div>
                  </div>

                  <div className="p-6 md:p-8 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold block">
                        {item.discipline}
                      </span>
                      <h3 className="text-xl font-bold text-[#141212] leading-snug">{item.name}</h3>
                      <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">{item.specs}</p>
                    </div>

                    <ul className="space-y-2 pt-4 border-t border-neutral-100">
                      {item.bullets.map((b, bIdx) => (
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
            EQUIPMENT INVENTORY TABLE (SLIDE 43 FROM PPT)
            ========================================================================= */}
        <section className="py-20 md:py-24 bg-white border-b border-neutral-200">
          <div className="max-w-[1440px] mx-auto px-6 md:px-12 space-y-10">
            <div className="max-w-3xl space-y-3">
              <span className="text-[12px] font-mono uppercase tracking-[0.2em] text-[#3B82F6] font-bold block">
                VERIFIED INSTRUMENT INVENTORY
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#141212]">
                Physical Field Equipment Registry
              </h2>
              <p className="text-neutral-600 text-sm sm:text-base">
                Official instrument register as documented in our corporate profile submitted for statutory and public works tenders in Bangladesh.
              </p>
            </div>

            <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-[#141212] text-white font-mono text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="py-4 px-6">Name of Equipment</th>
                    <th className="py-4 px-6">Quantity</th>
                    <th className="py-4 px-6">Manufacturer &amp; Origin</th>
                    <th className="py-4 px-6">Primary Operational Scope</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-neutral-800">
                  {equipmentInventory.map((row, idx) => (
                    <tr key={idx} className="hover:bg-neutral-50 transition">
                      <td className="py-3.5 px-6 font-bold text-[#141212]">{row.name}</td>
                      <td className="py-3.5 px-6 font-mono text-[#F4382D] font-bold">{row.qty}</td>
                      <td className="py-3.5 px-6 font-medium text-neutral-600">{row.maker}</td>
                      <td className="py-3.5 px-6 text-neutral-700 text-xs">{row.application}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* =========================================================================
            WORKSTATION PROCESSING LAB (EXACT TABLE FROM SLIDE 44)
            ========================================================================= */}
        <section className="py-20 md:py-28 bg-[#141212] text-white">
          <div className="max-w-[1440px] mx-auto px-6 md:px-12 space-y-12">
            <div className="max-w-3xl space-y-3">
              <span className="text-[12px] font-mono uppercase tracking-[0.2em] text-[#3B82F6] font-bold block">
                COMPUTATIONAL LAB &amp; 40TB NAS INFRASTRUCTURE
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                High-Performance Photogrammetry &amp; CAD Workstations
              </h2>
              <p className="text-neutral-400 text-sm sm:text-base">
                Geospatial Works operates dedicated high-performance desktop workstations equipped with Intel Core i7, Core i9, and Core Ultra 7 processors, high-speed DDR5 memory, and NVIDIA RTX graphics, backed by a 40TB centralized NAS storage cluster.
              </p>
            </div>

            {/* Workstation Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {workstations.map((ws, idx) => (
                <div
                  key={idx}
                  className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 hover:border-white/20 transition backdrop-blur-sm flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-[#3B82F6] uppercase tracking-wider">{ws.node}</span>
                      <Cpu size={18} className="text-[#F4382D]" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white leading-snug">{ws.processor}</h4>
                      <span className="text-xs font-mono text-neutral-400 block pt-1">{ws.ram}</span>
                    </div>
                    <div className="p-2.5 rounded bg-white/5 border border-white/10 text-xs font-mono text-[#F4382D] font-bold">
                      {ws.gpu}
                    </div>
                    <p className="text-xs text-neutral-400 leading-relaxed pt-2 border-t border-white/10">
                      {ws.workload}
                    </p>
                  </div>
                  <div className="pt-3 text-[11px] font-mono text-neutral-500 uppercase flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-emerald-400" />
                    <span>Active Processing Node</span>
                  </div>
                </div>
              ))}
            </div>

            {/* 40TB NAS Highlight Banner */}
            <div className="p-8 rounded-2xl bg-gradient-to-r from-blue-950/40 via-neutral-900 to-neutral-900 border border-blue-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2 text-[#3B82F6] font-mono text-xs font-bold uppercase tracking-wider">
                  <Server size={18} />
                  <span>40TB Centralized NAS Data Support</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white">Enterprise Scalability for Massive Spatial Datasets</h3>
                <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                  Our 40TB local NAS support houses raw high-resolution UAV point clouds, multi-temporal orthomosaics, satellite imagery tiles, and geodatabases with local RAID redundancy and complete data sovereignty.
                </p>
              </div>
              <div className="shrink-0 flex items-center gap-3">
                <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-center">
                  <span className="block text-3xl font-extrabold text-[#F4382D] font-mono">40 TB</span>
                  <span className="text-[10px] font-mono uppercase text-neutral-400">RAID Archival</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SOFTWARE FACILITIES (SLIDE 44 FROM PPT)
            ========================================================================= */}
        <section className="py-20 md:py-24 bg-[#FAFAFA] border-b border-neutral-200">
          <div className="max-w-[1440px] mx-auto px-6 md:px-12 space-y-12">
            <div className="max-w-3xl space-y-3">
              <span className="text-[12px] font-mono uppercase tracking-[0.2em] text-[#F4382D] font-bold block">
                SOFTWARE FACILITIES
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#141212]">
                Specialized Engineering &amp; Geospatial Software Suite
              </h2>
              <p className="text-neutral-600 text-sm sm:text-base">
                Geospatial Works is equipped with a range of specialized software solutions to support field data processing, technical drawings, digital terrain models, hydrographic surveys, and 3D visualization.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {softwareSuite.map((sw, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-neutral-200 rounded-xl p-6 space-y-3 shadow-sm hover:border-neutral-300 hover:shadow-md transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#3B82F6] font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                      {sw.category}
                    </span>
                    <Layers size={16} className="text-neutral-400" />
                  </div>
                  <h3 className="text-base font-bold text-[#141212]">{sw.name}</h3>
                  <p className="text-xs text-neutral-600 leading-relaxed">{sw.desc}</p>
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
