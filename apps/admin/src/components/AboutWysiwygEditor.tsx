'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Camera,
  Check,
  RefreshCw,
  CheckCircle2,
  Plus,
  Trash2,
  ArrowUpRight,
  Compass,
  Layers,
  MapPin,
  Cpu,
  ShieldCheck,
  Award,
  ChevronRight,
  Server,
  Plane,
  HardHat,
  Waves,
  HeartHandshake,
  Mail,
  Phone,
  Send,
} from 'lucide-react';
import { PageSectionItem } from './AboutSectionDrawer';

export type WysiwygPageId = 'our-story' | 'future-ready' | 'safety' | 'standards' | 'impact';

interface AboutWysiwygEditorProps {
  pageId: WysiwygPageId;
  sections: Record<string, PageSectionItem>;
  onSaveSection: (
    pageKey: string,
    sectionKey: string,
    title: string,
    subtitle: string,
    content: Record<string, any>
  ) => Promise<boolean>;
  onOpenMediaPicker: (callback: (url: string) => void) => void;
  triggerFeedback: (msg: string, type?: 'success' | 'error') => void;
}

// =========================================================================
// INLINE EDITABLE TEXT FIELD (MATCHES SITE FONT & STYLING 100%)
// =========================================================================
function EditableText({
  value,
  onChange,
  className = '',
  placeholder = 'Click to edit...',
  multiline = false,
  rows = 2,
}: {
  value: string;
  onChange: (val: string) => void;
  className?: string;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
}) {
  const common = `transition-all outline-none rounded px-1.5 py-0.5 -mx-1 border border-dashed border-white/20 hover:border-indigo-400/80 hover:bg-indigo-500/10 focus:border-indigo-500 focus:bg-indigo-500/15 focus:ring-1 focus:ring-indigo-500/50 cursor-text ${className}`;

  if (multiline) {
    return (
      <textarea
        rows={rows}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${common} w-full resize-y block`}
      />
    );
  }

  return (
    <input
      type="text"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`${common} w-full`}
    />
  );
}

// =========================================================================
// INLINE EDITABLE PHOTO COMPONENT (ELEGANT HOVER CAMERA PILL)
// =========================================================================
function EditablePhoto({
  src,
  alt = '',
  onPick,
  className = '',
}: {
  src: string;
  alt?: string;
  onPick: () => void;
  className?: string;
}) {
  return (
    <div className={`relative group overflow-hidden ${className}`}>
      <img src={src} alt={alt} className="w-full h-full object-cover block" />
      <button
        type="button"
        onClick={onPick}
        className="absolute top-3 right-3 z-30 px-3 py-1.5 rounded-full bg-slate-900/85 hover:bg-indigo-600 text-white text-[11px] font-bold backdrop-blur-md flex items-center gap-1.5 shadow-xl border border-white/25 cursor-pointer opacity-90 group-hover:opacity-100 transition-all"
        title="Change photo"
      >
        <Camera size={13} />
        <span>Change Photo</span>
      </button>
    </div>
  );
}

// =========================================================================
// INLINE EDITABLE BULLET LIST COMPONENT (SEAMLESS IN DESIGN)
// =========================================================================
function EditableBulletList({
  bullets,
  onChange,
  color = 'red',
}: {
  bullets: string[];
  onChange: (items: string[]) => void;
  color?: 'red' | 'blue';
}) {
  const handleItemChange = (idx: number, text: string) => {
    const next = [...bullets];
    next[idx] = text;
    onChange(next);
  };

  const handleAdd = () => {
    onChange([...bullets, 'New bullet point item']);
  };

  const handleDelete = (idx: number) => {
    if (bullets.length <= 1) return;
    onChange(bullets.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-1.5 my-2">
      <ul className="space-y-1.5">
        {bullets.map((item, idx) => (
          <li key={idx} className="group/item flex items-start gap-2 text-xs">
            <Check
              size={14}
              className={`${color === 'red' ? 'text-[#F4382D]' : 'text-[#3B82F6]'} shrink-0 mt-0.5`}
            />
            <div className="flex-1 flex items-center gap-2">
              <input
                type="text"
                value={item}
                onChange={(e) => handleItemChange(idx, e.target.value)}
                className="w-full text-inherit bg-transparent hover:ring-1 hover:ring-indigo-400 focus:ring-2 focus:ring-indigo-500 rounded px-1 -mx-1 outline-none transition"
              />
              <button
                type="button"
                onClick={() => handleDelete(idx)}
                className="opacity-0 group-hover/item:opacity-100 text-slate-400 hover:text-rose-600 transition p-0.5 rounded cursor-pointer"
                title="Remove bullet"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={handleAdd}
        className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 py-1 px-2 rounded-md hover:bg-indigo-50 transition cursor-pointer"
      >
        <Plus size={12} />
        <span>Add Bullet Point</span>
      </button>
    </div>
  );
}

// =========================================================================
// REAL DEFAULT DATA SETS (100% REAL BANGLADESH DATA & PHOTOGRAPHY)
// =========================================================================
const defaultStoryData = {
  heroKicker: '01 / IDENTITY & CORPORATE PROFILE',
  heroTitle: 'Where Engineering Meets Precision',
  heroSubtitle:
    'Geospatial Works is an engineering, geospatial, and precision surveying consultancy delivering integrated technical solutions for infrastructure development, spatial planning, and sustainable resource management across Bangladesh.',
  heroImage: '/real-media/hero-corridor-infrastructure.jpg',

  stats: [
    { value: 'Class 1', label: 'Government Contractor Status' },
    { value: '35+ Landmarks', label: 'National Projects Executed' },
    { value: '10,000+ GCPs', label: 'Survey of Bangladesh Calibrated' },
    { value: '64 Districts', label: 'Nationwide Field Survey Reach' },
  ],

  storyHeadline: 'Built on Precision. Driven by Possibility.',
  storyBody1:
    'Geospatial Works is an engineering, geospatial, and precision surveying consultancy delivering integrated technical solutions for infrastructure development, spatial planning, and sustainable resource management. Combining engineering expertise with advanced geospatial technologies, modern surveying instruments, and digital design capabilities, we support projects from field data acquisition and spatial analysis to engineering design and 3D visualization.',
  storyBody2:
    'Our multidisciplinary approach emphasizes technical precision, innovative solutions, efficient workflows, and timely delivery—helping clients make informed decisions and achieve reliable project outcomes. As a licensed 1st Class Contractor and Supplier, we bridge the gap between rigorous field measurement and constructible civil realization across Bangladesh.',

  disciplines: [
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
  ],

  milestones: [
    {
      year: '2026',
      title: 'National Agricultural GIS & Urban Transit Modernization',
      desc: 'Executing BADC WEB-AIS Pilot Research Project covering 208.37 km² across 23 unions and 260 mouzas; completed full architectural and drainage modernization surveys for DNCC Gabtoli and Mohakhali Inter-District Bus Terminals; Gulshan–Badda Link Road improvement.',
    },
    {
      year: '2025',
      title: '800 km Climate-Smart Road Survey & Geodetic TBM Network',
      desc: 'Executed 800 km road alignment survey and temporary benchmark (TBM) setup using RTK under the Sustainable & Integrated Rural Transport Improvement Project (SIRTP/CSmaRT) for LGED in collaboration with PRC-IMAGE; Pourashava surveys across Meherpur & Gangni.',
    },
    {
      year: '2024',
      title: '100,000 Power Poles & 10,000 National Land Zoning GCPs',
      desc: 'Collected RTK positions for approx. 100,000 (1 LAC) LT & HT power poles for Bangladesh Power Development Board (BPDB) with CEGIS; established 10,000 ground control points across 64 districts for Ministry of Land Digital Land Zoning; DNCC Tejgaon Truck Terminal with BETS.',
    },
    {
      year: '2023',
      title: 'Strategic Urban Development & Substation Control Grids',
      desc: 'GCP data collection across 4 Upazilas in Pirojpur for Urban Development Directorate (UDD) with PlanTED; high-precision static GNSS control establishment across BREB electrical substations in Dhaka Zone; BSMRMU Maritime University geodetic benchmark verification.',
    },
    {
      year: '2022',
      title: 'National Digital Land Zoning Phase 1 & Coastal Flood Protection',
      desc: 'Pioneered nationwide GCP collection across all 64 districts for Ministry of Land Digital Land Zoning Phase 1; geodetic TBM establishment for BWDB coastal flood embankment monitoring in Char Kolatoli and Char Jahiruddin, Bhola.',
    },
  ],
};

const defaultFutureReadyData = {
  heroKicker: '02 / PHYSICAL RESOURCES & COMPUTATIONAL INFRASTRUCTURE',
  heroTitle: 'Future-Ready Geodesy: Survey-Grade Hardware & Computing Power',
  heroSubtitle:
    'Deploying 1,408-channel RTK GNSS receivers, DJI Enterprise multispectral UAV fleets, hydrographic echo sounders, and 14th Gen Intel Core i9 / Core Ultra 7 DDR5 workstation clusters backed by 40TB NAS central storage.',
  heroImage: '/real-media/equipment-dji-drones.jpg',

  stats: [
    { value: '8 Units', label: 'CHCNAV i83 RTK GNSS (1,408 Channels)' },
    { value: '3 Fleets', label: 'DJI Enterprise Drones (7 Batteries Each)' },
    { value: '< 3 cm / px', label: 'UAV Ground Sample Distance (GSD)' },
    { value: '40 TB NAS', label: 'Centralized Spatial Storage Cluster' },
  ],

  fleet: [
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
    },
  ],

  workstationSpecs: [
    { component: 'Workstation 1', spec: 'Intel Core i9, 14th Gen K-Series | 64 GB DDR5 | NVIDIA RTX 4060 Ti' },
    { component: 'Workstation 2', spec: 'Intel Core i9, 14th Gen K-Series | 64 GB DDR5 | NVIDIA RTX 4060 Ti' },
    { component: 'Workstation 3', spec: 'Intel Core Ultra 7 K-Series | 64 GB DDR5 | NVIDIA RTX 5060 Ti' },
    { component: 'Workstation 4', spec: 'Intel Core i7, 14th Gen K-Series | 32 GB DDR5 | High-Speed CAD' },
    { component: 'Centralized NAS', spec: '40TB RAID Support for UAV Point Clouds, Orthomosaics & GIS Databases' },
    { component: 'Software Engine', spec: 'Agisoft Metashape, DJI Terra, AutoCAD Civil 3D, ArcGIS Pro, MIDAS-Civil, ETABS' },
  ],
};

const defaultSafetyData = {
  heroKicker: '03 / HSE FRAMEWORK & AVIATION COMPLIANCE',
  heroTitle: 'Corporate Responsibility & Zero-Harm Safety',
  heroSubtitle:
    'Protecting human lives, upholding statutory Civil Aviation Authority of Bangladesh (CAAB) flight protocols, and preserving fragile delta ecosystems.',
  heroImage: '/real-media/real-field-survey-team.jpg',

  stats: [
    { value: 'Zero', label: 'Lost-Time Incidents (LTI)' },
    { value: '100%', label: 'CAAB Drone Flight Permitting' },
    { value: 'Level-3', label: 'Mandatory PPE Site Enforcement' },
    { value: '15+ Years', label: 'Audited Safety Track Record' },
  ],

  safetyPillars: [
    {
      title: 'Civil Aviation Authority (CAAB) Airspace Permitting',
      category: 'Drone Regulatory Governance',
      desc: 'Commercial UAV operations in Bangladesh require comprehensive airspace awareness. We secure statutory flight clearances before taking off.',
      bullets: [
        'Certified remote pilots operating within statutory 400ft AGL ceilings',
        'Official notification to CAAB and law enforcement for sensitive corridors',
        'Autonomous return-to-home (RTH) fail-safe geofencing programmed on every UAV',
        'Commercial drone third-party public liability insurance protection',
      ],
    },
    {
      title: 'Riverine & Delta Marine Safety Protocols',
      category: 'Hydrographic & Bathymetric Sounding',
      desc: 'Conducting bathymetry across the Meghna, Jamuna, and coastal delta estuaries involves heavy tidal currents and seasonal squalls.',
      bullets: [
        'Mandatory certified SOLAS-compliant lifejackets on all survey vessels',
        'Double-hull aluminum survey boats equipped with VHF marine radios and GPS',
        'Continuous weather radar monitoring for sudden seasonal Kalbaishakhi storms',
        'Certified local river pilots accompanying all acoustic sounding missions',
      ],
    },
    {
      title: 'Zero-Harm Highway & Civil Site PPE',
      category: 'Construction & Roadway Safety',
      desc: 'Our surveyors frequently operate alongside live vehicular traffic on major national highways and active construction sites.',
      bullets: [
        'Class-3 high-visibility fluorescent apparel, safety boots, and hard hats',
        'Traffic safety cones, directional flaggers, and strobe beacons on highway traverses',
        'Job Hazard Analysis (JHA) conducted before unpacking total stations',
        'Lockout-tagout awareness near live railway tracks and high-voltage corridors',
      ],
    },
    {
      title: 'Ecological & Community Stewardship',
      category: 'Environmental Sustainability',
      desc: 'Infrastructure surveys inevitably touch agricultural wetlands, fishing villages, and ecologically fragile mangrove biomes.',
      bullets: [
        'Zero vegetation clearing policy: non-invasive drone photogrammetry over crops',
        'Community consultation with local union parishad and landowners prior to work',
        'Strict zero-litter policy for battery disposal, plastic markers, and field waste',
        'Support for local hiring of field survey assistants and logistical boats',
      ],
    },
  ],
};

const defaultStandardsData = {
  heroKicker: '04 / STATUTORY GEODETIC COMPLIANCE',
  heroTitle: 'Survey of Bangladesh (SOB) Datum Integration',
  heroSubtitle:
    'All ground surveys, bathymetric soundings, and civil alignments calibrated to National Everest 1830 ellipsoid and BGD2000 geodetic datum to guarantee legal defensibility and zero coordinate drift.',
  heroImage: '/real-media/service-topographic-uav.png',

  stats: [
    { value: 'BGD2000', label: 'National Geodetic Datum' },
    { value: 'Everest 1830', label: 'Reference Ellipsoid' },
    { value: '< 5mm √K', label: 'Digital Leveling Loop Closure' },
    { value: '100% Stamped', label: 'Certified Defensibility' },
  ],

  datumParameters: [
    { parameter: 'Reference Ellipsoid', value: 'Everest 1830 (Modified)' },
    { parameter: 'Semi-Major Axis (a)', value: '6,377,276.345 meters' },
    { parameter: 'Inverse Flattening (1/f)', value: '300.8017' },
    { parameter: 'Projection System', value: 'Bangladesh Transverse Mercator (BTM)' },
    { parameter: 'Central Meridian', value: '90° 00\' 00" East' },
    { parameter: 'Latitude of Origin', value: '0° 00\' 00" (Equator)' },
    { parameter: 'Scale Factor at Origin', value: '0.9996' },
    { parameter: 'False Easting / Northing', value: '500,000 m Easting / 0 m Northing' },
    { parameter: 'Vertical Datum Reference', value: 'Survey of Bangladesh Mean Sea Level (MSL) / PWD Datum (+0.46m)' },
  ],

  qaGates: [
    {
      gate: 'Gate 01: Raw Observation & RINEX Audit',
      desc: 'Before leaving the field, all raw GNSS RINEX files and total station raw coordinates undergo internal mathematical loop-closure verification.',
      bullets: [
        'Multi-frequency cycle-slip and multipath noise detection',
        'Direct baseline vector comparison against nearest SOB GTS benchmark',
        'Verification of instrument tribrach leveling and antenna height offsets',
      ],
    },
    {
      gate: 'Gate 02: Independent Control Checkpoints (CPs)',
      desc: 'For UAV photogrammetry and aerial LiDAR, an independent network of ground checkpoints (CPs)—never used during bundle adjustment—verifies spatial integrity.',
      bullets: [
        'Root-Mean-Square Error (RMSE) calculated independently across X, Y, and Z',
        'Maximum permissible vertical deviation: < 3.5cm across hard surfaces',
        'Automated discrepancy reporting included in official survey deliverables',
      ],
    },
    {
      gate: 'Gate 03: Senior Geodesist Certification & Stamping',
      desc: 'All engineering survey drawings, digital elevation models, and coordinate tables are reviewed and stamped by licensed senior surveyors.',
      bullets: [
        'Legally admissible for PWD, LGED, RHD, and judicial land acquisition',
        'CAD and GIS deliverable validation to prevent layer or coordinate drift',
        'Permanent archival of baseline control stations for future contractor tie-ins',
      ],
    },
  ],
};

const defaultImpactData = {
  heroEyebrow: '05 / VERIFIED LANDMARKS & INFRASTRUCTURE',
  heroTitle: 'Our National Impact: Grounded in Ground Truth',
  heroDescription:
    'From the Bangladesh Railway connectivity network to inter-district bus terminals, RCC girder bridges, and high-rise towers, explore our physical engineering milestones.',
  heroImage: '/real-media/hero-corridor-infrastructure.jpg',

  projects: [
    {
      id: 'surv-1',
      title: 'Gabtoli Inter-District Bus Terminal Modernization',
      client: 'Dhaka North City Corporation (DNCC)',
      category: 'Survey & Municipal Engineering',
      location: 'Gabtoli, Dhaka',
      description: 'Construction of ticket counters, modernization of passenger waiting rooms, standard toilet facilities, drainage improvement, and passageways development.',
      imageUrl: '/real-media/project-dncc-gabtoli-real.jpg',
    },
    {
      id: 'surv-2',
      title: 'Gulshan–Badda Link Road & Drainage Improvement',
      client: 'Dhaka North City Corporation (DNCC)',
      category: 'Road & Highway Survey',
      location: 'Gulshan-1 to Progati Sarani, Dhaka',
      description: 'Construction of RCC median, drain, footpath, passenger shed, grill fencing, and installation of traffic signs from Gulshan-1 to Progati Sarani, plus Road 130 & 134.',
      imageUrl: '/real-media/project-dncc-gulshan-link-real.jpg',
    },
    {
      id: 'surv-4',
      title: 'Dhaka–Chattogram High-Speed Railway Alignment',
      client: 'Bangladesh Railway / BADC / EPC',
      category: 'Geodetic Baseline Survey',
      location: 'Dhaka, Cumilla, Chattogram Corridor',
      description: 'Topographic contouring, geodetic baseline triangulation, and bridge crossing surveys for the planned high-speed rail corridor connecting capital with primary port.',
      imageUrl: '/real-media/project-railway-real-site.jpg',
    },
    {
      id: 'brg-1',
      title: '42m Span RCC Girder Bridge at Shadhapur',
      client: 'Local Government Engineering Department (LGED)',
      category: 'Bridge & Structural Engineering',
      location: 'Shadhapur, Bangladesh',
      description: 'Complete structural design, deep pile foundation analysis, hydrological scouring model, and approach road alignment for a 42-meter RCC girder bridge.',
      imageUrl: '/real-media/project-shadhapur-bridge.jpg',
    },
    {
      id: 'bldg-1',
      title: 'G+15 Residential Landmark in Mymensingh',
      client: 'Private Urban Developer',
      category: 'Architectural & High-Rise Building',
      location: 'Mymensingh, Bangladesh',
      description: 'High-rise residential tower featuring repeating balconies, articulated massing, entrance lobby, structural shear wall design, and modern facade composition.',
      imageUrl: '/real-media/hero-corridor-infrastructure.jpg',
    },
    {
      id: 'bldg-2',
      title: 'Astha Nir — G+8 Nine-Storey Residential Building',
      client: 'Capt. Mirza Mamun-Ur-Rashid',
      category: 'Architectural & High-Rise Building',
      location: 'Plot 038, Road 404, Sector 11, Jalshiri Abason',
      description: 'Nine-storey (G+8) residential building with secure ground floor parking, caretaker units, mezzanine lounge, lift lobby, and bioclimatic ventilation.',
      imageUrl: '/real-media/project-astha-nir.jpg',
    },
  ],
};

export function AboutWysiwygEditor({
  pageId,
  sections,
  onSaveSection,
  onOpenMediaPicker,
  triggerFeedback,
}: AboutWysiwygEditorProps) {
  const activePage = pageId;

  const [storyData, setStoryData] = useState<any>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('gw_wysiwyg_our-story') : null;
    return saved ? { ...defaultStoryData, ...JSON.parse(saved) } : defaultStoryData;
  });

  const [futureReadyData, setFutureReadyData] = useState<any>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('gw_wysiwyg_future-ready') : null;
    return saved ? { ...defaultFutureReadyData, ...JSON.parse(saved) } : defaultFutureReadyData;
  });

  const [safetyData, setSafetyData] = useState<any>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('gw_wysiwyg_safety') : null;
    return saved ? { ...defaultSafetyData, ...JSON.parse(saved) } : defaultSafetyData;
  });

  const [standardsData, setStandardsData] = useState<any>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('gw_wysiwyg_standards') : null;
    return saved ? { ...defaultStandardsData, ...JSON.parse(saved) } : defaultStandardsData;
  });

  const [impactData, setImpactData] = useState<any>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('gw_wysiwyg_impact') : null;
    return saved ? { ...defaultImpactData, ...JSON.parse(saved) } : defaultImpactData;
  });

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Sync from props if present in database
  useEffect(() => {
    if (sections['our-story:full_page_wysiwyg']?.content) {
      setStoryData((prev: any) => ({ ...prev, ...sections['our-story:full_page_wysiwyg'].content }));
    }
    if (sections['future-ready:full_page_wysiwyg']?.content) {
      setFutureReadyData((prev: any) => ({ ...prev, ...sections['future-ready:full_page_wysiwyg'].content }));
    }
    if (sections['safety:full_page_wysiwyg']?.content) {
      setSafetyData((prev: any) => ({ ...prev, ...sections['safety:full_page_wysiwyg'].content }));
    }
    if (sections['standards:full_page_wysiwyg']?.content) {
      setStandardsData((prev: any) => ({ ...prev, ...sections['standards:full_page_wysiwyg'].content }));
    }
    if (sections['impact:full_page_wysiwyg']?.content) {
      setImpactData((prev: any) => ({ ...prev, ...sections['impact:full_page_wysiwyg'].content }));
    }
  }, [sections]);

  const handleDataChange = (page: WysiwygPageId, field: string, value: any) => {
    setHasUnsavedChanges(true);
    if (page === 'our-story') {
      setStoryData((prev: any) => {
        const next = { ...prev, [field]: value };
        if (typeof window !== 'undefined') localStorage.setItem('gw_wysiwyg_our-story', JSON.stringify(next));
        return next;
      });
    } else if (page === 'future-ready') {
      setFutureReadyData((prev: any) => {
        const next = { ...prev, [field]: value };
        if (typeof window !== 'undefined') localStorage.setItem('gw_wysiwyg_future-ready', JSON.stringify(next));
        return next;
      });
    } else if (page === 'safety') {
      setSafetyData((prev: any) => {
        const next = { ...prev, [field]: value };
        if (typeof window !== 'undefined') localStorage.setItem('gw_wysiwyg_safety', JSON.stringify(next));
        return next;
      });
    } else if (page === 'standards') {
      setStandardsData((prev: any) => {
        const next = { ...prev, [field]: value };
        if (typeof window !== 'undefined') localStorage.setItem('gw_wysiwyg_standards', JSON.stringify(next));
        return next;
      });
    } else if (page === 'impact') {
      setImpactData((prev: any) => {
        const next = { ...prev, [field]: value };
        if (typeof window !== 'undefined') localStorage.setItem('gw_wysiwyg_impact', JSON.stringify(next));
        return next;
      });
    }
  };

  const handleSaveToDatabase = async () => {
    setIsSaving(true);
    let ok = false;
    try {
      if (activePage === 'our-story') {
        ok = await onSaveSection(
          'our-story',
          'full_page_wysiwyg',
          storyData.heroTitle,
          storyData.heroKicker,
          storyData
        );
      } else if (activePage === 'future-ready') {
        ok = await onSaveSection(
          'future-ready',
          'full_page_wysiwyg',
          futureReadyData.heroTitle,
          futureReadyData.heroKicker,
          futureReadyData
        );
      } else if (activePage === 'safety') {
        ok = await onSaveSection(
          'safety',
          'full_page_wysiwyg',
          safetyData.heroTitle,
          safetyData.heroKicker,
          safetyData
        );
      } else if (activePage === 'standards') {
        ok = await onSaveSection(
          'standards',
          'full_page_wysiwyg',
          standardsData.heroTitle,
          standardsData.heroKicker,
          standardsData
        );
      } else if (activePage === 'impact') {
        ok = await onSaveSection(
          'impact',
          'full_page_wysiwyg',
          impactData.heroTitle,
          impactData.heroEyebrow,
          impactData
        );
      }

      if (ok) {
        setHasUnsavedChanges(false);
        triggerFeedback('Page saved to live database and revalidated!', 'success');
      } else {
        triggerFeedback('Failed to save to database. Please check connection.', 'error');
      }
    } catch (e: any) {
      triggerFeedback(`Save error: ${e.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="relative">
      {/* =========================================================================
          FLOATING STICKY SAVE BUTTON
          ========================================================================= */}
      <div className="fixed bottom-6 right-8 z-50 flex items-center gap-2.5 pointer-events-auto">
        {hasUnsavedChanges && (
          <div className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-slate-900/90 text-white text-[11px] font-semibold shadow-xl backdrop-blur-md border border-white/10 animate-in fade-in">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>Unsaved Changes</span>
          </div>
        )}

        <button
          onClick={handleSaveToDatabase}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-3 rounded-full text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition-all shadow-xl hover:shadow-2xl hover:shadow-indigo-500/30 disabled:opacity-50 group border border-indigo-400/30 cursor-pointer"
        >
          {isSaving ? (
            <RefreshCw size={15} className="animate-spin" />
          ) : (
            <CheckCircle2 size={15} className="text-white group-hover:scale-110 transition-transform" />
          )}
          <span>{isSaving ? 'Publishing...' : hasUnsavedChanges ? 'Publish Changes *' : 'Save to Live Database'}</span>
        </button>
      </div>

      {/* =========================================================================
          LIVE EDITORIAL WYSIWYG CANVAS (100% IDENTICAL STYLING TO PUBLIC PAGES)
          ========================================================================= */}
      <div className="bg-slate-200/60 p-2 sm:p-4 rounded-2xl border border-slate-300/80 shadow-inner overflow-hidden">
        <div className="w-full bg-white text-[#141212] rounded-xl shadow-2xl border border-slate-300 overflow-hidden font-sans">
          {/* =========================================================================
              PAGE 1: OUR STORY & PURPOSE
              ========================================================================= */}
          {activePage === 'our-story' && (
            <div>
              {/* HERO */}
              <section className="relative bg-[#141212] text-white pt-24 pb-16 px-6 md:px-12 overflow-hidden border-b border-neutral-800">
                <div className="absolute inset-0 z-0 opacity-25">
                  <img src={storyData.heroImage} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#141212] via-[#141212]/90 to-transparent" />
                </div>

                <div className="relative z-10 max-w-4xl space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-mono uppercase tracking-[0.2em] text-[#F4382D] font-bold block">
                      <EditableText
                        value={storyData.heroKicker}
                        onChange={(v) => handleDataChange('our-story', 'heroKicker', v)}
                      />
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        onOpenMediaPicker((url) => handleDataChange('our-story', 'heroImage', url))
                      }
                      className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Camera size={13} /> Change Hero Photo
                    </button>
                  </div>

                  <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                    <EditableText
                      value={storyData.heroTitle}
                      onChange={(v) => handleDataChange('our-story', 'heroTitle', v)}
                      multiline
                      rows={2}
                    />
                  </h1>

                  <p className="text-base text-neutral-300 leading-relaxed font-normal">
                    <EditableText
                      value={storyData.heroSubtitle}
                      onChange={(v) => handleDataChange('our-story', 'heroSubtitle', v)}
                      multiline
                      rows={3}
                    />
                  </p>

                  {/* DYNAMIC STATS */}
                  <div className="pt-6 border-t border-neutral-800/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">Hero Metrics</span>
                      <button
                        type="button"
                        onClick={() => {
                          const next = [...storyData.stats, { value: 'New Metric', label: 'Description' }];
                          handleDataChange('our-story', 'stats', next);
                        }}
                        className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-[11px] font-mono font-bold flex items-center gap-1 transition"
                      >
                        <Plus size={12} /> Add Metric
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {storyData.stats.map((s: any, idx: number) => (
                        <div key={idx} className="relative group/stat bg-white/5 p-3 rounded-xl border border-white/10 space-y-1">
                          <button
                            type="button"
                            onClick={() => {
                              if (storyData.stats.length <= 1) return;
                              const next = storyData.stats.filter((_: any, i: number) => i !== idx);
                              handleDataChange('our-story', 'stats', next);
                            }}
                            className="absolute top-1.5 right-1.5 opacity-0 group-hover/stat:opacity-100 text-neutral-400 hover:text-rose-400 p-1 transition"
                            title="Remove metric"
                          >
                            <Trash2 size={12} />
                          </button>
                          <span className="block text-2xl font-extrabold text-white font-mono">
                            <EditableText
                              value={s.value}
                              onChange={(val) => {
                                const next = [...storyData.stats];
                                next[idx].value = val;
                                handleDataChange('our-story', 'stats', next);
                              }}
                            />
                          </span>
                          <span className="block text-[10px] text-neutral-400 font-medium uppercase tracking-wider">
                            <EditableText
                              value={s.label}
                              onChange={(val) => {
                                const next = [...storyData.stats];
                                next[idx].label = val;
                                handleDataChange('our-story', 'stats', next);
                              }}
                            />
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* FOUNDATION STORY */}
              <section className="py-16 px-6 md:px-12 bg-[#FAFAFA] border-b border-neutral-200">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  <div className="lg:col-span-5 space-y-3">
                    <span className="text-[12px] font-mono uppercase tracking-[0.2em] text-[#3B82F6] font-bold block">
                      ORIGINS &amp; ETHOS
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#141212]">
                      <EditableText
                        value={storyData.storyHeadline}
                        onChange={(v) => handleDataChange('our-story', 'storyHeadline', v)}
                        multiline
                        rows={2}
                      />
                    </h2>
                    <div className="w-16 h-1 bg-[#F4382D] rounded-full" />
                  </div>

                  <div className="lg:col-span-7 space-y-4 text-sm text-neutral-700 leading-relaxed">
                    <EditableText
                      value={storyData.storyBody1}
                      onChange={(v) => handleDataChange('our-story', 'storyBody1', v)}
                      multiline
                      rows={4}
                    />
                    <EditableText
                      value={storyData.storyBody2}
                      onChange={(v) => handleDataChange('our-story', 'storyBody2', v)}
                      multiline
                      rows={4}
                    />
                  </div>
                </div>
              </section>

              {/* DISCIPLINES */}
              <section className="py-16 px-6 md:px-12 bg-white border-b border-neutral-200 space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div className="max-w-3xl space-y-2">
                    <span className="text-[12px] font-mono uppercase tracking-[0.2em] text-[#F4382D] font-bold block">
                      CORE DISCIPLINES
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#141212]">
                      An Integrated Engineering Ecosystem
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = [
                        ...storyData.disciplines,
                        {
                          number: `0${storyData.disciplines.length + 1}`,
                          title: 'New Engineering Discipline',
                          desc: 'Description of the engineering capability, methodologies, and deliverables.',
                          bullets: ['Core deliverable point one', 'Standard compliance point two'],
                          image: '/real-media/service-topographic-uav.png',
                        },
                      ];
                      handleDataChange('our-story', 'disciplines', next);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-[#F4382D] text-white text-xs font-bold font-mono flex items-center gap-1.5 transition shrink-0 shadow"
                  >
                    <Plus size={14} /> Add Discipline Card
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {storyData.disciplines.map((d: any, idx: number) => (
                    <div key={idx} className="relative group/disc bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm flex flex-col">
                      <button
                        type="button"
                        onClick={() => {
                          if (storyData.disciplines.length <= 1) return;
                          const next = storyData.disciplines.filter((_: any, i: number) => i !== idx);
                          handleDataChange('our-story', 'disciplines', next);
                        }}
                        className="absolute top-3 left-3 z-30 opacity-0 group-hover/disc:opacity-100 bg-rose-600 hover:bg-rose-700 text-white p-1.5 rounded-full shadow-lg transition"
                        title="Delete discipline card"
                      >
                        <Trash2 size={13} />
                      </button>

                      <div className="relative h-48 w-full bg-neutral-900 overflow-hidden">
                        <EditablePhoto
                          src={d.image}
                          alt={d.title}
                          onPick={() =>
                            onOpenMediaPicker((url) => {
                              const next = [...storyData.disciplines];
                              next[idx].image = url;
                              handleDataChange('our-story', 'disciplines', next);
                            })
                          }
                          className="w-full h-full"
                        />
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                        <div className="space-y-1.5">
                          <h3 className="text-base font-bold text-[#141212]">
                            <EditableText
                              value={d.title}
                              onChange={(val) => {
                                const next = [...storyData.disciplines];
                                next[idx].title = val;
                                handleDataChange('our-story', 'disciplines', next);
                              }}
                            />
                          </h3>
                          <p className="text-xs text-neutral-600 leading-relaxed">
                            <EditableText
                              value={d.desc}
                              onChange={(val) => {
                                const next = [...storyData.disciplines];
                                next[idx].desc = val;
                                handleDataChange('our-story', 'disciplines', next);
                              }}
                              multiline
                              rows={3}
                            />
                          </p>
                        </div>

                        <EditableBulletList
                          bullets={d.bullets || []}
                          onChange={(items) => {
                            const next = [...storyData.disciplines];
                            next[idx].bullets = items;
                            handleDataChange('our-story', 'disciplines', next);
                          }}
                          color="red"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* TIMELINE */}
              <section className="py-16 px-6 md:px-12 bg-[#141212] text-white space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div className="max-w-3xl space-y-2">
                    <span className="text-[12px] font-mono uppercase tracking-[0.2em] text-[#3B82F6] font-bold block">
                      NATIONAL TRACK RECORD
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                      Key Milestones &amp; Project Evolution
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = [
                        ...storyData.milestones,
                        {
                          year: '2025–Future',
                          title: 'Next Evolution Milestone',
                          desc: 'Description of the major milestone achievement and nationwide impact.',
                        },
                      ];
                      handleDataChange('our-story', 'milestones', next);
                    }}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-[#3B82F6] text-white text-xs font-bold font-mono flex items-center gap-1.5 transition shrink-0 shadow"
                  >
                    <Plus size={14} /> Add Milestone Card
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {storyData.milestones.map((m: any, idx: number) => (
                    <div key={idx} className="relative group/mile bg-white/5 border border-white/10 rounded-2xl p-5 space-y-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (storyData.milestones.length <= 1) return;
                          const next = storyData.milestones.filter((_: any, i: number) => i !== idx);
                          handleDataChange('our-story', 'milestones', next);
                        }}
                        className="absolute top-2.5 right-2.5 opacity-0 group-hover/mile:opacity-100 text-neutral-400 hover:text-rose-400 p-1 transition"
                        title="Delete milestone"
                      >
                        <Trash2 size={13} />
                      </button>
                      <span className="block text-lg font-extrabold text-[#F4382D] font-mono">
                        <EditableText
                          value={m.year}
                          onChange={(val) => {
                            const next = [...storyData.milestones];
                            next[idx].year = val;
                            handleDataChange('our-story', 'milestones', next);
                          }}
                        />
                      </span>
                      <h4 className="text-sm font-bold text-white">
                        <EditableText
                          value={m.title}
                          onChange={(val) => {
                            const next = [...storyData.milestones];
                            next[idx].title = val;
                            handleDataChange('our-story', 'milestones', next);
                          }}
                        />
                      </h4>
                      <p className="text-xs text-neutral-400 leading-relaxed">
                        <EditableText
                          value={m.desc}
                          onChange={(val) => {
                            const next = [...storyData.milestones];
                            next[idx].desc = val;
                            handleDataChange('our-story', 'milestones', next);
                          }}
                          multiline
                          rows={3}
                        />
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* =========================================================================
              PAGE 2: FUTURE READY GEODESY
              ========================================================================= */}
          {activePage === 'future-ready' && (
            <div>
              {/* HERO */}
              <section className="relative bg-[#141212] text-white pt-24 pb-16 px-6 md:px-12 overflow-hidden border-b border-neutral-800">
                <div className="absolute inset-0 z-0 opacity-25">
                  <img src={futureReadyData.heroImage} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#141212] via-[#141212]/90 to-transparent" />
                </div>

                <div className="relative z-10 max-w-4xl space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-mono uppercase tracking-[0.2em] text-[#F4382D] font-bold block">
                      <EditableText
                        value={futureReadyData.heroKicker}
                        onChange={(v) => handleDataChange('future-ready', 'heroKicker', v)}
                      />
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        onOpenMediaPicker((url) => handleDataChange('future-ready', 'heroImage', url))
                      }
                      className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Camera size={13} /> Change Hero Photo
                    </button>
                  </div>

                  <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                    <EditableText
                      value={futureReadyData.heroTitle}
                      onChange={(v) => handleDataChange('future-ready', 'heroTitle', v)}
                      multiline
                      rows={2}
                    />
                  </h1>

                  <p className="text-base text-neutral-300 leading-relaxed font-normal">
                    <EditableText
                      value={futureReadyData.heroSubtitle}
                      onChange={(v) => handleDataChange('future-ready', 'heroSubtitle', v)}
                      multiline
                      rows={3}
                    />
                  </p>

                  {/* DYNAMIC SENSOR METRICS */}
                  <div className="pt-6 border-t border-neutral-800/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">Sensor Metrics</span>
                      <button
                        type="button"
                        onClick={() => {
                          const next = [...futureReadyData.stats, { value: 'New Spec', label: 'Metric Description' }];
                          handleDataChange('future-ready', 'stats', next);
                        }}
                        className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-[11px] font-mono font-bold flex items-center gap-1 transition"
                      >
                        <Plus size={12} /> Add Metric
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {futureReadyData.stats.map((s: any, idx: number) => (
                        <div key={idx} className="relative group/stat bg-white/5 p-3 rounded-xl border border-white/10 space-y-1">
                          <button
                            type="button"
                            onClick={() => {
                              if (futureReadyData.stats.length <= 1) return;
                              const next = futureReadyData.stats.filter((_: any, i: number) => i !== idx);
                              handleDataChange('future-ready', 'stats', next);
                            }}
                            className="absolute top-1.5 right-1.5 opacity-0 group-hover/stat:opacity-100 text-neutral-400 hover:text-rose-400 p-1 transition"
                            title="Remove metric"
                          >
                            <Trash2 size={12} />
                          </button>
                          <span className="block text-2xl font-extrabold text-[#3B82F6] font-mono">
                            <EditableText
                              value={s.value}
                              onChange={(val) => {
                                const next = [...futureReadyData.stats];
                                next[idx].value = val;
                                handleDataChange('future-ready', 'stats', next);
                              }}
                            />
                          </span>
                          <span className="block text-[10px] text-neutral-400 font-medium uppercase tracking-wider">
                            <EditableText
                              value={s.label}
                              onChange={(val) => {
                                const next = [...futureReadyData.stats];
                                next[idx].label = val;
                                handleDataChange('future-ready', 'stats', next);
                              }}
                            />
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* FLEET */}
              <section className="py-16 px-6 md:px-12 bg-[#FAFAFA] border-b border-neutral-200 space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div className="max-w-3xl space-y-2">
                    <span className="text-[12px] font-mono uppercase tracking-[0.2em] text-[#F4382D] font-bold block">
                      SURVEY-GRADE HARDWARE FLEET
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#141212]">
                      Precision Sensors for Bangladesh Ground &amp; Waters
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = [
                        ...futureReadyData.fleet,
                        {
                          name: 'New Survey Sensor System',
                          discipline: 'Geospatial Equipment Subsystem',
                          specs: 'Sensor technical specifications, pulse frequencies, accuracy thresholds, and operational limits.',
                          bullets: ['Statutory calibration and verification', 'Direct coordinate integration'],
                          image: '/real-media/equipment-rtk-gnss-station.jpg',
                        },
                      ];
                      handleDataChange('future-ready', 'fleet', next);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-[#F4382D] text-white text-xs font-bold font-mono flex items-center gap-1.5 transition shrink-0 shadow"
                  >
                    <Plus size={14} /> Add Equipment Card
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {futureReadyData.fleet.map((item: any, idx: number) => (
                    <div key={idx} className="relative group/fleet bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm flex flex-col">
                      <button
                        type="button"
                        onClick={() => {
                          if (futureReadyData.fleet.length <= 1) return;
                          const next = futureReadyData.fleet.filter((_: any, i: number) => i !== idx);
                          handleDataChange('future-ready', 'fleet', next);
                        }}
                        className="absolute top-3 left-3 z-30 opacity-0 group-hover/fleet:opacity-100 bg-rose-600 hover:bg-rose-700 text-white p-1.5 rounded-full shadow-lg transition"
                        title="Delete equipment"
                      >
                        <Trash2 size={13} />
                      </button>

                      <div className="relative h-56 w-full bg-neutral-900 overflow-hidden">
                        <EditablePhoto
                          src={item.image}
                          alt={item.name}
                          onPick={() =>
                            onOpenMediaPicker((url) => {
                              const next = [...futureReadyData.fleet];
                              next[idx].image = url;
                              handleDataChange('future-ready', 'fleet', next);
                            })
                          }
                          className="w-full h-full"
                        />
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-[#3B82F6] font-bold block">
                            <EditableText
                              value={item.discipline}
                              onChange={(val) => {
                                const next = [...futureReadyData.fleet];
                                next[idx].discipline = val;
                                handleDataChange('future-ready', 'fleet', next);
                              }}
                            />
                          </span>
                          <h3 className="text-base font-bold text-[#141212]">
                            <EditableText
                              value={item.name}
                              onChange={(val) => {
                                const next = [...futureReadyData.fleet];
                                next[idx].name = val;
                                handleDataChange('future-ready', 'fleet', next);
                              }}
                            />
                          </h3>
                          <p className="text-xs text-neutral-600 leading-relaxed">
                            <EditableText
                              value={item.specs}
                              onChange={(val) => {
                                const next = [...futureReadyData.fleet];
                                next[idx].specs = val;
                                handleDataChange('future-ready', 'fleet', next);
                              }}
                              multiline
                              rows={2}
                            />
                          </p>
                        </div>

                        <EditableBulletList
                          bullets={item.bullets || []}
                          onChange={(items) => {
                            const next = [...futureReadyData.fleet];
                            next[idx].bullets = items;
                            handleDataChange('future-ready', 'fleet', next);
                          }}
                          color="red"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* COMPUTING LAB TABLE */}
              <section className="py-16 px-6 md:px-12 bg-[#141212] text-white space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div className="max-w-3xl space-y-2">
                    <span className="text-[12px] font-mono uppercase tracking-[0.2em] text-[#3B82F6] font-bold block">
                      COMPUTATIONAL LAB ARCHITECTURE
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                      Dual Xeon 64-Core Photogrammetry Engine
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = [
                        ...futureReadyData.workstationSpecs,
                        { component: 'New Hardware Subsystem', spec: 'Technical Specification' },
                      ];
                      handleDataChange('future-ready', 'workstationSpecs', next);
                    }}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-[#3B82F6] text-white text-xs font-bold font-mono flex items-center gap-1.5 transition shrink-0 shadow"
                  >
                    <Plus size={14} /> Add Row
                  </button>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-white/10 text-neutral-300 font-mono text-[10px] uppercase tracking-wider border-b border-white/10">
                      <tr>
                        <th className="py-3 px-5">Hardware Subsystem</th>
                        <th className="py-3 px-5">Laboratory Specification</th>
                        <th className="py-3 px-5 text-right w-16">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10 text-neutral-300">
                      {futureReadyData.workstationSpecs.map((row: any, idx: number) => (
                        <tr key={idx} className="group/row">
                          <td className="py-3 px-5 font-mono font-bold text-[#F4382D]">
                            <EditableText
                              value={row.component}
                              onChange={(val) => {
                                const next = [...futureReadyData.workstationSpecs];
                                next[idx].component = val;
                                handleDataChange('future-ready', 'workstationSpecs', next);
                              }}
                            />
                          </td>
                          <td className="py-3 px-5 text-white">
                            <EditableText
                              value={row.spec}
                              onChange={(val) => {
                                const next = [...futureReadyData.workstationSpecs];
                                next[idx].spec = val;
                                handleDataChange('future-ready', 'workstationSpecs', next);
                              }}
                            />
                          </td>
                          <td className="py-3 px-5 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                if (futureReadyData.workstationSpecs.length <= 1) return;
                                const next = futureReadyData.workstationSpecs.filter((_: any, i: number) => i !== idx);
                                handleDataChange('future-ready', 'workstationSpecs', next);
                              }}
                              className="opacity-0 group-hover/row:opacity-100 text-neutral-400 hover:text-rose-400 p-1 transition"
                              title="Delete row"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}

          {/* =========================================================================
              PAGE 3: CORPORATE RESPONSIBILITY & SAFETY
              ========================================================================= */}
          {activePage === 'safety' && (
            <div>
              {/* HERO */}
              <section className="relative bg-[#141212] text-white pt-24 pb-16 px-6 md:px-12 overflow-hidden border-b border-neutral-800">
                <div className="absolute inset-0 z-0 opacity-25">
                  <img src={safetyData.heroImage} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#141212] via-[#141212]/90 to-transparent" />
                </div>

                <div className="relative z-10 max-w-4xl space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-mono uppercase tracking-[0.2em] text-[#F4382D] font-bold block">
                      <EditableText
                        value={safetyData.heroKicker}
                        onChange={(v) => handleDataChange('safety', 'heroKicker', v)}
                      />
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        onOpenMediaPicker((url) => handleDataChange('safety', 'heroImage', url))
                      }
                      className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Camera size={13} /> Change Hero Photo
                    </button>
                  </div>

                  <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                    <EditableText
                      value={safetyData.heroTitle}
                      onChange={(v) => handleDataChange('safety', 'heroTitle', v)}
                      multiline
                      rows={2}
                    />
                  </h1>

                  <p className="text-base text-neutral-300 leading-relaxed font-normal">
                    <EditableText
                      value={safetyData.heroSubtitle}
                      onChange={(v) => handleDataChange('safety', 'heroSubtitle', v)}
                      multiline
                      rows={3}
                    />
                  </p>

                  {/* DYNAMIC SAFETY METRICS */}
                  <div className="pt-6 border-t border-neutral-800/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">Safety Metrics</span>
                      <button
                        type="button"
                        onClick={() => {
                          const next = [...safetyData.stats, { value: 'New Metric', label: 'Safety Metric Label' }];
                          handleDataChange('safety', 'stats', next);
                        }}
                        className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-[11px] font-mono font-bold flex items-center gap-1 transition"
                      >
                        <Plus size={12} /> Add Metric
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {safetyData.stats.map((s: any, idx: number) => (
                        <div key={idx} className="relative group/stat bg-white/5 p-3 rounded-xl border border-white/10 space-y-1">
                          <button
                            type="button"
                            onClick={() => {
                              if (safetyData.stats.length <= 1) return;
                              const next = safetyData.stats.filter((_: any, i: number) => i !== idx);
                              handleDataChange('safety', 'stats', next);
                            }}
                            className="absolute top-1.5 right-1.5 opacity-0 group-hover/stat:opacity-100 text-neutral-400 hover:text-rose-400 p-1 transition"
                            title="Remove metric"
                          >
                            <Trash2 size={12} />
                          </button>
                          <span className="block text-2xl font-extrabold text-[#F4382D] font-mono">
                            <EditableText
                              value={s.value}
                              onChange={(val) => {
                                const next = [...safetyData.stats];
                                next[idx].value = val;
                                handleDataChange('safety', 'stats', next);
                              }}
                            />
                          </span>
                          <span className="block text-[10px] text-neutral-400 font-medium uppercase tracking-wider">
                            <EditableText
                              value={s.label}
                              onChange={(val) => {
                                const next = [...safetyData.stats];
                                next[idx].label = val;
                                handleDataChange('safety', 'stats', next);
                              }}
                            />
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* PILLARS */}
              <section className="py-16 px-6 md:px-12 bg-[#FAFAFA] border-b border-neutral-200 space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div className="max-w-3xl space-y-2">
                    <span className="text-[12px] font-mono uppercase tracking-[0.2em] text-[#3B82F6] font-bold block">
                      SAFETY BY DESIGN
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#141212]">
                      Health, Safety &amp; Environment Pillars
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = [
                        ...safetyData.safetyPillars,
                        {
                          title: 'New HSE Safety Protocol',
                          category: 'Operational Risk Governance',
                          desc: 'Description of protocol standards, field execution safety gates, and statutory adherence.',
                          bullets: ['Mandatory compliance checklist item', 'Continuous risk monitoring protocol'],
                        },
                      ];
                      handleDataChange('safety', 'safetyPillars', next);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-[#F4382D] text-white text-xs font-bold font-mono flex items-center gap-1.5 transition shrink-0 shadow"
                  >
                    <Plus size={14} /> Add Safety Pillar
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {safetyData.safetyPillars.map((p: any, idx: number) => (
                    <div key={idx} className="relative group/pillar bg-white border border-neutral-200 rounded-2xl p-6 space-y-4 shadow-sm">
                      <button
                        type="button"
                        onClick={() => {
                          if (safetyData.safetyPillars.length <= 1) return;
                          const next = safetyData.safetyPillars.filter((_: any, i: number) => i !== idx);
                          handleDataChange('safety', 'safetyPillars', next);
                        }}
                        className="absolute top-4 right-4 opacity-0 group-hover/pillar:opacity-100 text-neutral-400 hover:text-rose-500 p-1.5 transition"
                        title="Delete safety pillar"
                      >
                        <Trash2 size={14} />
                      </button>

                      <div className="space-y-1">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold block">
                          <EditableText
                            value={p.category}
                            onChange={(val) => {
                              const next = [...safetyData.safetyPillars];
                              next[idx].category = val;
                              handleDataChange('safety', 'safetyPillars', next);
                            }}
                          />
                        </span>
                        <h3 className="text-lg font-bold text-[#141212]">
                          <EditableText
                            value={p.title}
                            onChange={(val) => {
                              const next = [...safetyData.safetyPillars];
                              next[idx].title = val;
                              handleDataChange('safety', 'safetyPillars', next);
                            }}
                          />
                        </h3>
                      </div>

                      <p className="text-xs text-neutral-600 leading-relaxed">
                        <EditableText
                          value={p.desc}
                          onChange={(val) => {
                            const next = [...safetyData.safetyPillars];
                            next[idx].desc = val;
                            handleDataChange('safety', 'safetyPillars', next);
                          }}
                          multiline
                          rows={3}
                        />
                      </p>

                      <EditableBulletList
                        bullets={p.bullets || []}
                        onChange={(items) => {
                          const next = [...safetyData.safetyPillars];
                          next[idx].bullets = items;
                          handleDataChange('safety', 'safetyPillars', next);
                        }}
                        color="red"
                      />
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* =========================================================================
              PAGE 4: QUALITY STANDARDS & SOB COMPLIANCE
              ========================================================================= */}
          {activePage === 'standards' && (
            <div>
              {/* HERO */}
              <section className="relative bg-[#141212] text-white pt-24 pb-16 px-6 md:px-12 overflow-hidden border-b border-neutral-800">
                <div className="absolute inset-0 z-0 opacity-25">
                  <img src={standardsData.heroImage} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#141212] via-[#141212]/90 to-transparent" />
                </div>

                <div className="relative z-10 max-w-4xl space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-mono uppercase tracking-[0.2em] text-[#F4382D] font-bold block">
                      <EditableText
                        value={standardsData.heroKicker}
                        onChange={(v) => handleDataChange('standards', 'heroKicker', v)}
                      />
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        onOpenMediaPicker((url) => handleDataChange('standards', 'heroImage', url))
                      }
                      className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Camera size={13} /> Change Hero Photo
                    </button>
                  </div>

                  <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                    <EditableText
                      value={standardsData.heroTitle}
                      onChange={(v) => handleDataChange('standards', 'heroTitle', v)}
                      multiline
                      rows={2}
                    />
                  </h1>

                  <p className="text-base text-neutral-300 leading-relaxed font-normal">
                    <EditableText
                      value={standardsData.heroSubtitle}
                      onChange={(v) => handleDataChange('standards', 'heroSubtitle', v)}
                      multiline
                      rows={3}
                    />
                  </p>

                  {/* DYNAMIC STANDARDS METRICS */}
                  <div className="pt-6 border-t border-neutral-800/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">Geodetic Standards Metrics</span>
                      <button
                        type="button"
                        onClick={() => {
                          const next = [...standardsData.stats, { value: 'New Standard', label: 'Compliance Level' }];
                          handleDataChange('standards', 'stats', next);
                        }}
                        className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-[11px] font-mono font-bold flex items-center gap-1 transition"
                      >
                        <Plus size={12} /> Add Metric
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {standardsData.stats.map((s: any, idx: number) => (
                        <div key={idx} className="relative group/stat bg-white/5 p-3 rounded-xl border border-white/10 space-y-1">
                          <button
                            type="button"
                            onClick={() => {
                              if (standardsData.stats.length <= 1) return;
                              const next = standardsData.stats.filter((_: any, i: number) => i !== idx);
                              handleDataChange('standards', 'stats', next);
                            }}
                            className="absolute top-1.5 right-1.5 opacity-0 group-hover/stat:opacity-100 text-neutral-400 hover:text-rose-400 p-1 transition"
                            title="Remove metric"
                          >
                            <Trash2 size={12} />
                          </button>
                          <span className="block text-2xl font-extrabold text-[#3B82F6] font-mono">
                            <EditableText
                              value={s.value}
                              onChange={(val) => {
                                const next = [...standardsData.stats];
                                next[idx].value = val;
                                handleDataChange('standards', 'stats', next);
                              }}
                            />
                          </span>
                          <span className="block text-[10px] text-neutral-400 font-medium uppercase tracking-wider">
                            <EditableText
                              value={s.label}
                              onChange={(val) => {
                                const next = [...standardsData.stats];
                                next[idx].label = val;
                                handleDataChange('standards', 'stats', next);
                              }}
                            />
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* SOB DATUM TABLE */}
              <section className="py-16 px-6 md:px-12 bg-[#FAFAFA] border-b border-neutral-200 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div className="max-w-3xl space-y-2">
                    <span className="text-[12px] font-mono uppercase tracking-[0.2em] text-[#F4382D] font-bold block">
                      MATHEMATICAL RIGOR
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#141212]">
                      Official National Geodetic Baseline Parameters
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = [
                        ...standardsData.datumParameters,
                        { parameter: 'New Parameter', value: 'Reference Datum Value' },
                      ];
                      handleDataChange('standards', 'datumParameters', next);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-[#F4382D] text-white text-xs font-bold font-mono flex items-center gap-1.5 transition shrink-0 shadow"
                  >
                    <Plus size={14} /> Add Datum Parameter
                  </button>
                </div>

                <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-neutral-100 text-neutral-700 font-mono text-[10px] uppercase tracking-wider border-b border-neutral-200">
                      <tr>
                        <th className="py-3 px-5">Geodetic Parameter</th>
                        <th className="py-3 px-5">Survey of Bangladesh Reference Value</th>
                        <th className="py-3 px-5 text-right w-16">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 text-neutral-800">
                      {standardsData.datumParameters.map((row: any, idx: number) => (
                        <tr key={idx} className="group/row">
                          <td className="py-3 px-5 font-mono font-bold text-[#F4382D]">
                            <EditableText
                              value={row.parameter}
                              onChange={(val) => {
                                const next = [...standardsData.datumParameters];
                                next[idx].parameter = val;
                                handleDataChange('standards', 'datumParameters', next);
                              }}
                            />
                          </td>
                          <td className="py-3 px-5 font-medium">
                            <EditableText
                              value={row.value}
                              onChange={(val) => {
                                const next = [...standardsData.datumParameters];
                                next[idx].value = val;
                                handleDataChange('standards', 'datumParameters', next);
                              }}
                            />
                          </td>
                          <td className="py-3 px-5 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                if (standardsData.datumParameters.length <= 1) return;
                                const next = standardsData.datumParameters.filter((_: any, i: number) => i !== idx);
                                handleDataChange('standards', 'datumParameters', next);
                              }}
                              className="opacity-0 group-hover/row:opacity-100 text-neutral-400 hover:text-rose-500 p-1 transition"
                              title="Delete parameter"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* QA GATES */}
              <section className="py-16 px-6 md:px-12 bg-[#141212] text-white space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div className="max-w-3xl space-y-2">
                    <span className="text-[12px] font-mono uppercase tracking-[0.2em] text-[#3B82F6] font-bold block">
                      QUALITY ASSURANCE ARCHITECTURE
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                      Verification Gates Protocol
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = [
                        ...standardsData.qaGates,
                        {
                          gate: `Gate 0${standardsData.qaGates.length + 1}: Technical Peer Verification`,
                          desc: 'Description of the verification gate, cross-examination tolerance checks, and deliverables verification.',
                          bullets: ['Statutory validation checklist', 'Signed engineering sign-off stamp'],
                        },
                      ];
                      handleDataChange('standards', 'qaGates', next);
                    }}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-[#3B82F6] text-white text-xs font-bold font-mono flex items-center gap-1.5 transition shrink-0 shadow"
                  >
                    <Plus size={14} /> Add QA Gate
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {standardsData.qaGates.map((g: any, idx: number) => (
                    <div key={idx} className="relative group/gate bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3 flex flex-col justify-between">
                      <button
                        type="button"
                        onClick={() => {
                          if (standardsData.qaGates.length <= 1) return;
                          const next = standardsData.qaGates.filter((_: any, i: number) => i !== idx);
                          handleDataChange('standards', 'qaGates', next);
                        }}
                        className="absolute top-3 right-3 opacity-0 group-hover/gate:opacity-100 text-neutral-400 hover:text-rose-400 p-1.5 transition"
                        title="Delete QA Gate"
                      >
                        <Trash2 size={13} />
                      </button>

                      <div className="space-y-2">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[#F4382D] font-bold block">
                          STAGE 0{idx + 1}
                        </span>
                        <h3 className="text-base font-bold text-white">
                          <EditableText
                            value={g.gate}
                            onChange={(val) => {
                              const next = [...standardsData.qaGates];
                              next[idx].gate = val;
                              handleDataChange('standards', 'qaGates', next);
                            }}
                          />
                        </h3>
                        <p className="text-xs text-neutral-400 leading-relaxed">
                          <EditableText
                            value={g.desc}
                            onChange={(val) => {
                              const next = [...standardsData.qaGates];
                              next[idx].desc = val;
                              handleDataChange('standards', 'qaGates', next);
                            }}
                            multiline
                            rows={3}
                          />
                        </p>
                      </div>

                      <EditableBulletList
                        bullets={g.bullets || []}
                        onChange={(items) => {
                          const next = [...standardsData.qaGates];
                          next[idx].bullets = items;
                          handleDataChange('standards', 'qaGates', next);
                        }}
                        color="blue"
                      />
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* =========================================================================
              PAGE 5: OUR NATIONAL IMPACT (MATCHES /projects 1:1)
              ========================================================================= */}
          {activePage === 'impact' && (
            <div>
              {/* HERO */}
              <section className="relative bg-[#141212] text-white pt-24 pb-16 px-6 md:px-12 overflow-hidden border-b border-neutral-800">
                <div className="absolute inset-0 z-0 opacity-25">
                  <img src={impactData.heroImage} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#141212] via-[#141212]/90 to-transparent" />
                </div>

                <div className="relative z-10 max-w-4xl space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-mono uppercase tracking-[0.2em] text-[#F4382D] font-bold block">
                      <EditableText
                        value={impactData.heroEyebrow}
                        onChange={(v) => handleDataChange('impact', 'heroEyebrow', v)}
                      />
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        onOpenMediaPicker((url) => handleDataChange('impact', 'heroImage', url))
                      }
                      className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Camera size={13} /> Change Hero Photo
                    </button>
                  </div>

                  <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                    <EditableText
                      value={impactData.heroTitle}
                      onChange={(v) => handleDataChange('impact', 'heroTitle', v)}
                      multiline
                      rows={2}
                    />
                  </h1>

                  <p className="text-base text-neutral-300 leading-relaxed font-normal">
                    <EditableText
                      value={impactData.heroDescription}
                      onChange={(v) => handleDataChange('impact', 'heroDescription', v)}
                      multiline
                      rows={3}
                    />
                  </p>
                </div>
              </section>

              {/* PROJECT CARDS (420PX, WHITE TITLES ON PHOTO) */}
              <section className="py-16 px-6 md:px-12 bg-[#FAFAFA] space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div>
                    <span className="text-[12px] font-mono uppercase tracking-[0.2em] text-[#3B82F6] font-bold block">
                      FEATURED SHOWCASE
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#141212]">
                      Landmark Infrastructure Projects
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = [
                        ...impactData.projects,
                        {
                          id: `proj-${Date.now()}`,
                          title: 'New Infrastructure Landmark Project',
                          client: 'Government / Private Authority',
                          category: 'Topographic & Engineering Survey',
                          location: 'Dhaka, Bangladesh',
                          description: 'Comprehensive geodetic baseline survey, UAV drone mapping, and construction-grade engineering deliverables.',
                          imageUrl: '/real-media/hero-corridor-infrastructure.jpg',
                        },
                      ];
                      handleDataChange('impact', 'projects', next);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-[#3B82F6] text-white text-xs font-bold font-mono flex items-center gap-1.5 transition shrink-0 shadow"
                  >
                    <Plus size={14} /> Add Project Card
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {impactData.projects.map((p: any, idx: number) => (
                    <div
                      key={idx}
                      className="relative group/proj border border-neutral-200 rounded-2xl bg-white flex flex-col overflow-hidden shadow-sm"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          if (impactData.projects.length <= 1) return;
                          const next = impactData.projects.filter((_: any, i: number) => i !== idx);
                          handleDataChange('impact', 'projects', next);
                        }}
                        className="absolute top-3 right-3 z-30 opacity-0 group-hover/proj:opacity-100 bg-rose-600 hover:bg-rose-700 text-white p-1.5 rounded-full shadow-lg transition"
                        title="Delete project card"
                      >
                        <Trash2 size={13} />
                      </button>
                      <div className="relative aspect-[16/10] bg-neutral-900 overflow-hidden">
                        <EditablePhoto
                          src={p.imageUrl || '/real-media/hero-corridor-infrastructure.jpg'}
                          alt={p.title}
                          onPick={() =>
                            onOpenMediaPicker((url) => {
                              const next = [...impactData.projects];
                              next[idx].imageUrl = url;
                              handleDataChange('impact', 'projects', next);
                            })
                          }
                          className="w-full h-full"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent pointer-events-none" />

                        <div className="absolute top-3 left-3 bg-black/80 text-[#3B82F6] px-2 py-0.5 text-[9px] font-mono uppercase font-bold rounded">
                          <EditableText
                            value={p.category}
                            onChange={(val) => {
                              const next = [...impactData.projects];
                              next[idx].category = val;
                              handleDataChange('impact', 'projects', next);
                            }}
                          />
                        </div>

                        {p.location && (
                          <div className="absolute top-3 right-3 bg-black/70 text-white/90 px-2 py-0.5 rounded text-[9px] font-semibold flex items-center gap-1">
                            <MapPin size={9} className="text-[#F4382D]" />
                            <EditableText
                              value={p.location}
                              onChange={(val) => {
                                const next = [...impactData.projects];
                                next[idx].location = val;
                                handleDataChange('impact', 'projects', next);
                              }}
                            />
                          </div>
                        )}

                        <div className="absolute bottom-3 left-3 right-3">
                          <h3 className="text-sm font-extrabold text-white leading-snug drop-shadow-md">
                            <EditableText
                              value={p.title}
                              onChange={(val) => {
                                const next = [...impactData.projects];
                                next[idx].title = val;
                                handleDataChange('impact', 'projects', next);
                              }}
                              multiline
                              rows={2}
                            />
                          </h3>
                        </div>
                      </div>

                      <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                        <div className="space-y-1">
                          <p className="text-xs text-neutral-600 font-semibold">
                            <strong className="text-neutral-900">Client:</strong>{' '}
                            <EditableText
                              value={p.client}
                              onChange={(val) => {
                                const next = [...impactData.projects];
                                next[idx].client = val;
                                handleDataChange('impact', 'projects', next);
                              }}
                            />
                          </p>
                          <p className="text-xs text-neutral-600 leading-relaxed line-clamp-3">
                            <EditableText
                              value={p.description}
                              onChange={(val) => {
                                const next = [...impactData.projects];
                                next[idx].description = val;
                                handleDataChange('impact', 'projects', next);
                              }}
                              multiline
                              rows={2}
                            />
                          </p>
                        </div>
                        <div className="pt-2 border-t border-neutral-100 text-[10px] font-mono text-neutral-400 font-bold uppercase">
                          1ST CLASS CONTRACTOR
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* =========================================================================
              WIRED KEEP IN TOUCH SECTION (LIVE WITH MAPBOX & INQUIRY FORM)
              ========================================================================= */}
          <section className="bg-white border-t-2 border-[#3B82F6] py-12 px-6 md:px-12 text-[#141212]">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-neutral-200">
              <div className="space-y-1">
                <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#3B82F6] font-bold block">
                  START A CONVERSATION · DHAKA HQ
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#141212] tracking-tight">
                  Keep in <span className="text-[#FB1D10]">touch</span>
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600">
                  Wired with Mapbox geodetic coordinates, direct inquiry desk, and 24/7 hotline dispatch across Bangladesh.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <a
                  href="/contactt"
                  target="_blank"
                  className="px-4 py-2 bg-[#FB1D10] text-white text-xs font-bold rounded-lg shadow-sm hover:bg-[#d92a20] transition inline-flex items-center gap-1.5"
                >
                  <Send size={13} />
                  <span>Open Contactt Page</span>
                  <ArrowUpRight size={13} />
                </a>
                <a
                  href="tel:+8801303772216"
                  className="px-3.5 py-2 border border-neutral-300 text-neutral-800 text-xs font-bold rounded-lg hover:border-neutral-900 transition flex items-center gap-1.5"
                >
                  <Phone size={13} className="text-[#FB1D10]" />
                  <span>Hotline: +88 01303 772216</span>
                </a>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 text-xs">
              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-1.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1">
                  <MapPin size={13} className="text-[#FB1D10]" />
                  <span>Dhaka Headquarters</span>
                </div>
                <div className="font-semibold text-neutral-800 leading-relaxed text-xs">
                  64/1 (D1), Lake Circus, Kalabagan, Dhaka 1205
                </div>
                <div className="text-[10px] font-mono text-neutral-400">23.7505° N, 90.3807° E · Mapbox</div>
              </div>

              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-1.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1">
                  <Phone size={13} className="text-[#FB1D10]" />
                  <span>Direct Hotline</span>
                </div>
                <div className="font-mono text-neutral-800 font-bold text-xs">
                  +88 01303 772216 / +88 01713 907779
                </div>
                <div className="text-[10px] text-emerald-600 font-bold">24/7 Field Rapid Deployment</div>
              </div>

              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-1.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1">
                  <Mail size={13} className="text-[#FB1D10]" />
                  <span>Inquiry &amp; Bids</span>
                </div>
                <div className="font-mono text-neutral-800 font-semibold text-xs truncate">
                  info@geospatialworks.com.bd
                </div>
                <div className="text-[10px] text-neutral-500">SOB 1st Class Certified Contractor</div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
