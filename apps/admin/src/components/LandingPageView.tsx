'use client';

import React, { useState, useEffect } from 'react';
import {
  Video,
  Image as ImageIcon,
  Upload,
  Save,
  Check,
  Trash2,
  Plus,
  Sliders,
  FolderKanban,
  Wrench,
  Newspaper,
  HeartHandshake,
  Mail,
  ArrowRight,
  Monitor,
  ShieldCheck,
  Phone,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Database,
  Building2,
  Layers,
  Sparkles,
} from 'lucide-react';

export interface HeroSlideItem {
  id?: string;
  eyebrow?: string;
  heading: string;
  description: string;
  imageUrl: string;
  mediaType?: 'image' | 'video';
  videoUrl?: string;
  primaryActionText?: string;
  primaryActionHref?: string;
  secondaryActionText?: string;
  secondaryActionHref?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface ServiceItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  features?: string[];
  imageUrl?: string;
  isActive: boolean;
  sortOrder: number;
}

export interface ProjectItem {
  id: string;
  slug: string;
  title: string;
  client?: string;
  category: string;
  location?: string;
  description: string;
  imageUrl?: string;
  isMilestone: boolean;
  sortOrder?: number;
}

export interface EquipmentItem {
  id: string;
  category: string;
  name: string;
  manufacturer: string;
  quantity: string;
  specs?: Record<string, any>;
  imageUrl?: string;
  sortOrder?: number;
}

export interface ArticleItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  publishDate?: string;
  summary: string;
  imageUrl?: string;
  isPublished: boolean;
}

export interface WorkstationNode {
  id: string;
  cpu: string;
  ram: string;
  gpu: string;
  isAccent?: boolean;
}

export interface SoftwareTool {
  name: string;
  category: string;
  badge: string;
}

export interface PartnerLogoItem {
  name: string;
  short: string;
  subtext: string;
  logo: string;
}

export const PAGE_OPTIONS: { label: string; value: string }[] = [
  { label: 'Services (/services)', value: '/services' },
  { label: 'Projects (/projects)', value: '/projects' },
  { label: 'Careers & Openings (/career)', value: '/career' },
  { label: 'Contact Us (/contact)', value: '/contact' },
  { label: 'Dhaka HQ Office (/contact#office)', value: '/contact#office' },
  { label: 'About Us (/about)', value: '/about' },
  { label: 'Who We Are (/about#who-we-are)', value: '/about#who-we-are' },
  { label: 'Our Story (/about#our-story)', value: '/about#our-story' },
  { label: 'Insights & News (/insights)', value: '/insights' },
  { label: 'Clients (/clients)', value: '/clients' },
  { label: 'Standards & Quality (/standards)', value: '/standards' },
  { label: 'Cost Estimator (/cost-estimator)', value: '/cost-estimator' },
  { label: 'Custom URL...', value: '__custom__' },
];

function PageSelect({
  value,
  onChange,
  className = '',
}: {
  value: string;
  onChange: (val: string) => void;
  className?: string;
}) {
  const isKnown = PAGE_OPTIONS.some((opt) => opt.value === value);
  const [isCustom, setIsCustom] = useState(!isKnown && !!value);

  // If value matches known option, keep in dropdown mode
  useEffect(() => {
    if (PAGE_OPTIONS.some((opt) => opt.value === value && opt.value !== '__custom__')) {
      setIsCustom(false);
    }
  }, [value]);

  return (
    <div className={`space-y-1.5 ${className}`}>
      <select
        value={isCustom ? '__custom__' : value || '/services'}
        onChange={(e) => {
          if (e.target.value === '__custom__') {
            setIsCustom(true);
          } else {
            setIsCustom(false);
            onChange(e.target.value);
          }
        }}
        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:border-red-500 cursor-pointer"
      >
        {PAGE_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {isCustom && (
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="e.g. /custom-page or https://..."
            className="w-full px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:border-red-500"
          />
          <button
            type="button"
            onClick={() => {
              setIsCustom(false);
              onChange('/services');
            }}
            className="text-[10px] text-slate-500 hover:text-slate-700 whitespace-nowrap underline px-1"
          >
            Presets
          </button>
        </div>
      )}
    </div>
  );
}

interface LandingPageViewProps {
  heroSlides: HeroSlideItem[];
  services: ServiceItem[];
  projects: ProjectItem[];
  equipment: EquipmentItem[];
  articles: ArticleItem[];
  sections: Record<string, any>;
  onSaveHeroSlide: (slide: Partial<HeroSlideItem>) => Promise<void>;
  onDeleteHeroSlide: (id: string) => Promise<void>;
  onUpdateSection: (pageKey: string, sectionKey: string, data: { title?: string; subtitle?: string; content: any }) => Promise<void>;
  onToggleServiceActive: (id: string, active: boolean) => Promise<void>;
  onToggleProjectMilestone: (id: string, isMilestone: boolean) => Promise<void>;
  onRefresh: () => void;
  triggerFeedback: (msg: string, type?: 'success' | 'error') => void;
}

export function LandingPageView({
  heroSlides,
  services,
  projects,
  equipment,
  articles,
  sections,
  onSaveHeroSlide,
  onDeleteHeroSlide,
  onUpdateSection,
  onToggleServiceActive,
  onToggleProjectMilestone,
  triggerFeedback,
}: LandingPageViewProps) {
  const [activeSubSection, setActiveSubSection] = useState<
    'hero' | 'manifesto' | 'services' | 'projects' | 'equipment' | 'news' | 'leadgrow'
  >('hero');

  // ==========================================
  // SECTION 1: HERO SLIDES STATE
  // ==========================================
  const [selectedSlideIndex, setSelectedSlideIndex] = useState(0);
  const activeSlide: HeroSlideItem = heroSlides[selectedSlideIndex] || {
    id: 'temp',
    heading: 'WHERE ENGINEERING MEETS PRECISION',
    eyebrow: 'GEOSPATIAL WORKS BANGLADESH',
    description: 'Integrated engineering, geospatial, and precision surveying consultancy delivering technical solutions for national infrastructure, spatial planning, and delta resource management.',
    imageUrl: '/real-media/hero-corridor-infrastructure.jpg',
    mediaType: 'image',
    videoUrl: '',
    primaryActionText: 'Explore our services',
    primaryActionHref: '/services',
  };

  const [slideEyebrow, setSlideEyebrow] = useState(activeSlide.eyebrow || '');
  const [slideHeading, setSlideHeading] = useState(activeSlide.heading || '');
  const [slideDesc, setSlideDesc] = useState(activeSlide.description || '');
  const [slideImageUrl, setSlideImageUrl] = useState(activeSlide.imageUrl || '');
  const [slideMediaType, setSlideMediaType] = useState<'image' | 'video'>(activeSlide.mediaType || 'image');
  const [slideVideoUrl, setSlideVideoUrl] = useState(activeSlide.videoUrl || '');
  const [slideBtnText, setSlideBtnText] = useState(activeSlide.primaryActionText || 'Explore our services');
  const [slideBtnHref, setSlideBtnHref] = useState(activeSlide.primaryActionHref || '/services');

  useEffect(() => {
    if (activeSlide) {
      setSlideEyebrow(activeSlide.eyebrow || '');
      setSlideHeading(activeSlide.heading || '');
      setSlideDesc(activeSlide.description || '');
      setSlideImageUrl(activeSlide.imageUrl || '');
      setSlideMediaType(activeSlide.mediaType || 'image');
      setSlideVideoUrl(activeSlide.videoUrl || '');
      setSlideBtnText(activeSlide.primaryActionText || 'Explore our services');
      setSlideBtnHref(activeSlide.primaryActionHref || '/services');
    }
  }, [selectedSlideIndex, heroSlides]);

  // ==========================================
  // SECTION 2: MANIFESTO & KEY FACTS STATE
  // ==========================================
  const manifestoSec = sections['home:manifesto'] || sections['home:manifesto_summary'] || sections['home:about_summary'] || {};
  const [manEyebrowBlue, setManEyebrowBlue] = useState(manifestoSec?.content?.eyebrowBlue || 'GEOSPATIAL PRECISION');
  const [manEyebrowRed, setManEyebrowRed] = useState(manifestoSec?.content?.eyebrowRed || 'ENGINEERING EXCELLENCE');
  const [manStatement, setManStatement] = useState(
    manifestoSec?.title ||
      'Geospatial Works is an engineering, geospatial, and precision surveying consultancy delivering integrated technical solutions for infrastructure development, spatial planning, and sustainable resource management across Bangladesh.'
  );
  const [manSubtext, setManSubtext] = useState(
    manifestoSec?.content?.subtext ||
      'Combining engineering expertise with advanced geospatial technologies, modern surveying instruments, and digital design capabilities, we support projects from field data acquisition and spatial analysis to engineering design and 3D visualization.'
  );
  const [manBtnText, setManBtnText] = useState(manifestoSec?.content?.btnText || 'Who we are');
  const [manBtnHref, setManBtnHref] = useState(manifestoSec?.content?.btnHref || '/about');
  const [manMetric1Val, setManMetric1Val] = useState(manifestoSec?.content?.metric1Val || '1,500+');
  const [manMetric1Unit, setManMetric1Unit] = useState(manifestoSec?.content?.metric1Unit || 'km²');
  const [manMetric1Label, setManMetric1Label] = useState(manifestoSec?.content?.metric1Label || 'Area Surveyed & Mapped');
  const [manMetric1Sub, setManMetric1Sub] = useState(manifestoSec?.content?.metric1Sub || 'Corridors & Agricultural Basins Surveyed');
  const [manMetric2Val, setManMetric2Val] = useState(manifestoSec?.content?.metric2Val || '35+');
  const [manMetric2Label, setManMetric2Label] = useState(manifestoSec?.content?.metric2Label || 'National Infrastructure Projects');
  const [manMetric2Sub, setManMetric2Sub] = useState(manifestoSec?.content?.metric2Sub || 'Completed National Infrastructure Commissions');

  // Trusted Institutional Partners List State
  const defaultPartnersList: PartnerLogoItem[] = [
    { name: 'Dhaka North City Corporation', short: 'DNCC', subtext: 'City Corporation', logo: '/partners/partner_2.webp' },
    { name: 'Bangladesh Railway', short: 'Bangladesh Railway', subtext: 'Rail Authority', logo: '/partners/bangladesh_railway.svg' },
    { name: 'BADC (Agriculture)', short: 'BADC', subtext: 'Agri Development', logo: '/partners/badc_logo_clean.png' },
    { name: 'LGED (Local Govt)', short: 'LGED', subtext: 'Engineering Dept', logo: '/partners/partner_4.png' },
    { name: 'DTCA (Dhaka Transit)', short: 'DTCA', subtext: 'Transit Coordination', logo: '/partners/bangladesh_govt_seal.svg' },
    { name: 'Asian Development Bank', short: 'ADB', subtext: 'Development Bank', logo: '/partners/asian_development_bank.svg' },
  ];
  const [partnersList, setPartnersList] = useState<PartnerLogoItem[]>(
    manifestoSec?.content?.partners || defaultPartnersList
  );

  const handleAddPartner = () => {
    setPartnersList((prev) => [
      ...prev,
      {
        name: 'New Institutional Partner',
        short: 'PARTNER',
        subtext: 'Authority / Department',
        logo: '/partners/bangladesh_govt_seal.svg',
      },
    ]);
  };

  const handleUpdatePartner = (idx: number, field: keyof PartnerLogoItem, val: string) => {
    setPartnersList((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: val };
      return copy;
    });
  };

  const handleRemovePartner = (idx: number) => {
    setPartnersList((prev) => prev.filter((_, i) => i !== idx));
  };

  // ==========================================
  // SECTION 3: SERVICES SHOWCASE STATE
  // ==========================================
  const shapingSec = sections['home:shaping_future'] || sections['home:services_summary'] || sections['home:services_intro'] || {};
  const [shapingSubtitle, setShapingSubtitle] = useState((shapingSec?.subtitle || 'WHAT WE DO').replace(/^\/\s*/, ''));
  const [shapingKicker, setShapingKicker] = useState(shapingSec?.content?.kicker || 'INNOVATION • RESILIENCE • IMPACT');
  const [shapingTitle, setShapingTitle] = useState(shapingSec?.title || 'Shaping the Future with Precision Geomatics');
  const [shapingDesc, setShapingDesc] = useState(
    shapingSec?.content?.description ||
      'From sub-centimeter geodetic networks and automated drone photogrammetry to digital twins and bathymetric river surveys, we provide the spatial backbone for Bangladesh’s transformation.'
  );
  const [shapingManifesto, setShapingManifesto] = useState(
    shapingSec?.content?.manifestoQuote ||
      'We combine future-focused thinking and technical know-how to power local impact. Our teams develop deep understanding and a partnership of trust with our clients across over 100 sectors and services.'
  );
  const [shapingBtnText, setShapingBtnText] = useState(shapingSec?.content?.btnText || 'What we do');
  const [shapingBtnHref, setShapingBtnHref] = useState(shapingSec?.content?.btnHref || '/services');

  // ==========================================
  // SECTION 4: PROJECTS SHOWCASE STATE
  // ==========================================
  const projSec = sections['home:projects_summary'] || sections['home:projects_intro'] || {};
  const [projSubtitle, setProjSubtitle] = useState((projSec?.subtitle || 'REAL-WORLD IMPACT').replace(/^\/\s*/, ''));
  const [projKicker, setProjKicker] = useState(projSec?.content?.kicker || '35+ NATIONAL CONTRACTS ACROSS 8 DIVISIONS');
  const [projTitle, setProjTitle] = useState(projSec?.title || 'Pioneering projects delivering measurable impact.');
  const [projDesc, setProjDesc] = useState(
    projSec?.content?.description ||
      'Across Bangladesh, we work with clients to dream big, challenge conventions and transform our world for the better.'
  );
  const [projBtnText, setProjBtnText] = useState(projSec?.content?.btnText || 'View all projects');
  const [projBtnHref, setProjBtnHref] = useState(projSec?.content?.btnHref || '/projects');
  const [projSearchQuery, setProjSearchQuery] = useState('');
  const [projCategoryFilter, setProjCategoryFilter] = useState('all');

  // ==========================================
  // SECTION 5: EQUIPMENT & LABS STATE
  // ==========================================
  const equipSec = sections['home:equipment_summary'] || {};
  const [equipSubtitle, setEquipSubtitle] = useState((equipSec?.subtitle || 'PHYSICAL & TECHNICAL RESOURCES').replace(/^\/\s*/, ''));
  const [equipTitle, setEquipTitle] = useState(equipSec?.title || 'Instruments & facilities');
  const [equipDesc, setEquipDesc] = useState(
    equipSec?.content?.description ||
      'Geospatial Works maintains an extensive inventory of geodetic GNSS receivers, enterprise UAV systems, optical instruments, and dedicated high-performance workstations.'
  );
  const [equipLabTitle, setEquipLabTitle] = useState(equipSec?.content?.labTitle || 'High-Throughput Spatial Compute & Modeling Stack');
  const [equipNasText, setEquipNasText] = useState(equipSec?.content?.nasText || 'UAV Point Clouds • Orthomosaics • LiDAR & Geodatabases');

  // 1. Workstations (Add, Remove, Edit)
  const defaultWorkstations: WorkstationNode[] = [
    { id: 'NODE 01', cpu: 'Intel Core i9', ram: '64GB DDR5', gpu: 'RTX 4060 Ti', isAccent: false },
    { id: 'NODE 02', cpu: 'Intel Core i9', ram: '64GB DDR5', gpu: 'RTX 4060 Ti', isAccent: false },
    { id: 'NODE 03', cpu: 'Intel Ultra 7', ram: '64GB DDR5', gpu: 'RTX 5060 Ti', isAccent: true },
    { id: 'NODE 04', cpu: 'Intel Core i7', ram: '32GB DDR5', gpu: 'Processing Node', isAccent: false },
  ];
  const [workstations, setWorkstations] = useState<WorkstationNode[]>(
    equipSec?.content?.workstations && equipSec.content.workstations.length > 0
      ? equipSec.content.workstations
      : defaultWorkstations
  );

  // 2. Physical Equipment Showcased (Toggled)
  const [selectedEquipIds, setSelectedEquipIds] = useState<string[]>(
    equipSec?.content?.selectedEquipmentIds || []
  );

  // 3. Software Logos / Suite (Add, Remove, Edit)
  const defaultSoftware: SoftwareTool[] = [
    { name: 'ArcGIS Pro & Enterprise', category: 'Geospatial GIS', badge: 'ESRI Suite' },
    { name: 'QGIS 3.x LTR', category: 'Spatial Modeling', badge: 'OSGeo OpenSource' },
    { name: 'Agisoft Metashape Pro', category: 'UAV Photogrammetry', badge: '3D Point Cloud' },
    { name: 'AutoCAD Civil 3D', category: 'Infrastructure BIM', badge: 'Autodesk' },
    { name: 'Leica Geo Office', category: 'Geodetic Baseline', badge: 'RTK Adjustments' },
    { name: 'Global Mapper Pro', category: 'LiDAR & Point Cloud', badge: 'Terrain Modeling' },
  ];
  const [softwareList, setSoftwareList] = useState<SoftwareTool[]>(
    equipSec?.content?.softwareList && equipSec.content.softwareList.length > 0
      ? equipSec.content.softwareList
      : defaultSoftware
  );

  // Workstation Actions
  const handleAddWorkstation = () => {
    const nextIdx = workstations.length + 1;
    const padded = nextIdx < 10 ? `0${nextIdx}` : `${nextIdx}`;
    setWorkstations([
      ...workstations,
      { id: `NODE ${padded}`, cpu: 'Intel Core i9', ram: '64GB DDR5', gpu: 'RTX 4060 Ti', isAccent: false },
    ]);
  };

  const handleUpdateWorkstation = (idx: number, field: keyof WorkstationNode, val: any) => {
    setWorkstations((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: val };
      return copy;
    });
  };

  const handleRemoveWorkstation = (idx: number) => {
    setWorkstations((prev) => prev.filter((_, i) => i !== idx));
  };

  // Software Actions
  const handleAddSoftware = () => {
    setSoftwareList([
      ...softwareList,
      { name: 'New Engineering Software', category: 'Specialized Suite', badge: 'Professional' },
    ]);
  };

  const handleUpdateSoftware = (idx: number, field: keyof SoftwareTool, val: string) => {
    setSoftwareList((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: val };
      return copy;
    });
  };

  const handleRemoveSoftware = (idx: number) => {
    setSoftwareList((prev) => prev.filter((_, i) => i !== idx));
  };

  // Equipment Toggle
  const handleToggleEquipmentSelect = (id: string) => {
    setSelectedEquipIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // ==========================================
  // SECTION 6: NEWS & BULLETINS STATE
  // ==========================================
  const newsSec = sections['home:news_summary'] || {};
  const [newsSubtitle, setNewsSubtitle] = useState((newsSec?.subtitle || 'RESEARCH & APPLIED GEODESY').replace(/^\/\s*/, ''));
  const [newsTitle, setNewsTitle] = useState(newsSec?.title || 'Innovative thinking');
  const [newsroomTitle, setNewsroomTitle] = useState(newsSec?.content?.newsroomTitle || 'Latest news');
  const [newsMode, setNewsMode] = useState<'latest' | 'manual'>(newsSec?.content?.mode || 'latest');
  const [selectedArticleIds, setSelectedArticleIds] = useState<string[]>(newsSec?.content?.selectedArticleIds || []);

  // ==========================================
  // SECTION 7: LEAD & GROW (CAREERS) STATE
  // ==========================================
  const cultureSec = sections['home:culture_summary'] || {};
  const [cultureSubtitle, setCultureSubtitle] = useState((cultureSec?.subtitle || 'NATIONAL TALENT & ENGINEERING CAREERS').replace(/^\/\s*/, ''));
  const [cultureTitle, setCultureTitle] = useState(cultureSec?.title || 'Lead and grow');
  const [cultureDesc, setCultureDesc] = useState(
    cultureSec?.content?.description ||
      'What if you could build a career that’s as unique as you? With us you can. We empower spatial analysts, surveyors, and civil engineers to work on nation-critical mega projects.'
  );
  const [cultureBtn1Text, setCultureBtn1Text] = useState(cultureSec?.content?.btn1Text || 'Search and apply');
  const [cultureBtn1Href, setCultureBtn1Href] = useState(cultureSec?.content?.btn1Href || '/career');
  const [cultureBtn2Text, setCultureBtn2Text] = useState(cultureSec?.content?.btn2Text || 'Life at Geospatial Works');
  const [cultureBtn2Href, setCultureBtn2Href] = useState(cultureSec?.content?.btn2Href || '/career');
  const [cultureImageUrl, setCultureImageUrl] = useState(cultureSec?.content?.imageUrl || '/real-media/career-engineering-team.jpg');


  // Global Saving & Uploading States
  const [savingSection, setSavingSection] = useState(false);
  const [uploadingHeroMedia, setUploadingHeroMedia] = useState(false);

  // Upload Handler
  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetField: 'hero' | 'culture') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingHeroMedia(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('http://localhost:4000/api/v1/media/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();

      if (targetField === 'hero') {
        if (file.type.startsWith('video/')) {
          setSlideMediaType('video');
          setSlideVideoUrl(data.url);
          // If other slides exist when uploading a video, inform user that video is single-slide
          triggerFeedback('Hero video uploaded! Video mode automatically operates as a single cinematic showcase slide.');
        } else {
          setSlideMediaType('image');
          setSlideImageUrl(data.url);
          triggerFeedback('Hero image uploaded successfully!');
        }
      } else {
        setCultureImageUrl(data.url);
        triggerFeedback('Media uploaded successfully!');
      }
    } catch (err: any) {
      triggerFeedback(err.message || 'Media upload failed', 'error');
    } finally {
      setUploadingHeroMedia(false);
    }
  };

  // Section Save Handlers
  const handleSaveActiveSlide = async () => {
    setSavingSection(true);
    try {
      const payload: Partial<HeroSlideItem> = {
        eyebrow: slideEyebrow,
        heading: slideHeading,
        description: slideDesc,
        imageUrl: slideImageUrl,
        mediaType: slideMediaType,
        videoUrl: slideVideoUrl,
        primaryActionText: slideBtnText,
        primaryActionHref: slideBtnHref,
        isActive: true,
      };

      if (activeSlide.id && activeSlide.id !== 'temp') {
        payload.id = activeSlide.id;
      }

      await onSaveHeroSlide(payload);
      triggerFeedback('Hero slide updated & saved!');
    } catch (err: any) {
      triggerFeedback(err.message || 'Failed to save hero slide', 'error');
    } finally {
      setSavingSection(false);
    }
  };

  const handleCreateNewSlide = () => {
    onSaveHeroSlide({
      eyebrow: 'GEOSPATIAL WORKS BANGLADESH',
      heading: 'NEW BANGLADESH INFRASTRUCTURE HORIZON',
      description: 'Precision geomatics, civil infrastructure engineering, and hydrographic survey across all 64 districts.',
      imageUrl: '/real-media/hero-geospatial-landscape.jpg',
      mediaType: 'image',
      videoUrl: '',
      primaryActionText: 'Explore our services',
      primaryActionHref: '/services',
    });
    setSelectedSlideIndex(heroSlides.length);
  };

  const handleSaveManifesto = async () => {
    setSavingSection(true);
    try {
      await onUpdateSection('home', 'manifesto', {
        title: manStatement,
        subtitle: `${manEyebrowBlue} • ${manEyebrowRed}`,
        content: {
          eyebrowBlue: manEyebrowBlue,
          eyebrowRed: manEyebrowRed,
          subtext: manSubtext,
          btnText: manBtnText,
          btnHref: manBtnHref,
          metric1Val: manMetric1Val,
          metric1Unit: manMetric1Unit,
          metric1Label: manMetric1Label,
          metric1Sub: manMetric1Sub,
          metric2Val: manMetric2Val,
          metric2Label: manMetric2Label,
          metric2Sub: manMetric2Sub,
          partners: partnersList,
        },
      });
      triggerFeedback('Manifesto & Key Metrics saved!');
    } finally {
      setSavingSection(false);
    }
  };

  const handleSaveShaping = async () => {
    setSavingSection(true);
    try {
      await onUpdateSection('home', 'shaping_future', {
        title: shapingTitle,
        subtitle: shapingSubtitle,
        content: {
          kicker: shapingKicker,
          description: shapingDesc,
          manifestoQuote: shapingManifesto,
          btnText: shapingBtnText,
          btnHref: shapingBtnHref,
        },
      });
      triggerFeedback('Services showcase saved!');
    } finally {
      setSavingSection(false);
    }
  };

  const handleSaveProjects = async () => {
    setSavingSection(true);
    try {
      await onUpdateSection('home', 'projects_summary', {
        title: projTitle,
        subtitle: projSubtitle,
        content: {
          kicker: projKicker,
          description: projDesc,
          btnText: projBtnText,
          btnHref: projBtnHref,
        },
      });
      triggerFeedback('Pioneering projects saved!');
    } finally {
      setSavingSection(false);
    }
  };

  const handleSaveEquipment = async () => {
    setSavingSection(true);
    try {
      await onUpdateSection('home', 'equipment_summary', {
        title: equipTitle,
        subtitle: equipSubtitle,
        content: {
          description: equipDesc,
          labTitle: equipLabTitle,
          nasText: equipNasText,
          workstations: workstations,
          selectedEquipmentIds: selectedEquipIds,
          softwareList: softwareList,
        },
      });
      triggerFeedback('Instrumentation, Workstations & Software saved!');
    } finally {
      setSavingSection(false);
    }
  };

  const handleSaveNews = async () => {
    setSavingSection(true);
    try {
      await onUpdateSection('home', 'news_summary', {
        title: newsTitle,
        subtitle: newsSubtitle,
        content: {
          mode: newsMode,
          selectedArticleIds,
          newsroomTitle,
        },
      });
      triggerFeedback('News & Bulletins saved!');
    } finally {
      setSavingSection(false);
    }
  };

  const handleSaveCulture = async () => {
    setSavingSection(true);
    try {
      await onUpdateSection('home', 'culture_summary', {
        title: cultureTitle,
        subtitle: cultureSubtitle,
        content: {
          description: cultureDesc,
          btn1Text: cultureBtn1Text,
          btn1Href: cultureBtn1Href,
          btn2Text: cultureBtn2Text,
          btn2Href: cultureBtn2Href,
          imageUrl: cultureImageUrl,
        },
      });
      triggerFeedback('Lead & Grow careers saved!');
    } finally {
      setSavingSection(false);
    }
  };

  const activeProjectsCount = projects.filter((p) => p.isMilestone).length;
  const activeServicesCount = services.filter((s) => s.isActive).length;

  // Rendered Equipment Preview Items (custom selected or first 3)
  const displayedEquip =
    selectedEquipIds.length > 0
      ? equipment.filter((e) => selectedEquipIds.includes(e.id))
      : equipment.slice(0, 3);

  return (
    <div className="space-y-4 pb-20 max-w-[1720px] mx-auto select-none font-sans">
      {/* =========================================================================
          TOP NAVIGATION TABS (8 SECTIONS CORRESPONDING TO HOMEPAGE FLOW)
          ========================================================================= */}
      <div className="flex items-center gap-1.5 overflow-x-auto p-1.5 bg-white rounded-2xl border border-slate-200/90 shadow-xs">
        {[
          { key: 'hero', label: '1. Hero Cinema', icon: Video },
          { key: 'manifesto', label: '2. Manifesto & Metrics', icon: Building2 },
          { key: 'services', label: '3. Services Track', icon: Sliders },
          { key: 'projects', label: '4. Landmark Projects', icon: FolderKanban },
          { key: 'equipment', label: '5. Hardware & Labs', icon: Wrench },
          { key: 'news', label: '6. News & Bulletins', icon: Newspaper },
          { key: 'leadgrow', label: '7. Lead & Grow', icon: HeartHandshake },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeSubSection === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveSubSection(tab.key as any)}
              className={`whitespace-nowrap flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon size={14} className={isSelected ? 'text-white' : 'text-slate-400'} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          1. HERO CINEMA: (FORM LEFT, 16:9 LIVE PREVIEW RIGHT)
          ========================================================================= */}
      {activeSubSection === 'hero' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* LEFT 5 COLS: DATA FORM */}
          <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Hero Carousel Settings</h3>
                <p className="text-[11px] text-slate-400">Configure slides, video/image media, and clean CTA button.</p>
              </div>
              <button
                onClick={handleSaveActiveSlide}
                disabled={savingSection}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition cursor-pointer shadow-xs disabled:opacity-50"
              >
                <Save size={13} />
                <span>{savingSection ? 'Saving...' : 'Save Slide'}</span>
              </button>
            </div>

            {/* Slide Selector Pills */}
            {slideMediaType === 'video' ? (
              <div className="flex items-center justify-between p-2.5 bg-indigo-50/70 rounded-xl border border-indigo-200">
                <div className="flex items-center gap-2">
                  <Video size={14} className="text-indigo-600" />
                  <span className="text-xs font-bold text-indigo-900">Cinematic Video Mode (Dedicated Single Slide)</span>
                </div>
                <span className="text-[10px] font-semibold text-indigo-600 bg-white px-2 py-0.5 rounded-full border border-indigo-200">
                  Carousel Paused
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
                <div className="flex items-center gap-1.5 overflow-x-auto">
                  {heroSlides.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedSlideIndex(idx)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        selectedSlideIndex === idx
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                      }`}
                    >
                      Slide {idx + 1}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    type="button"
                    onClick={handleCreateNewSlide}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition"
                    title="Add new slide"
                  >
                    <Plus size={13} />
                    <span>Add</span>
                  </button>
                  {heroSlides.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        if (activeSlide.id && activeSlide.id !== 'temp') {
                          onDeleteHeroSlide(activeSlide.id);
                          setSelectedSlideIndex(0);
                        }
                      }}
                      className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                      title="Delete current slide"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Fields */}
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Eyebrow Badge</label>
                <input
                  type="text"
                  value={slideEyebrow}
                  onChange={(e) => setSlideEyebrow(e.target.value)}
                  placeholder="GEOSPATIAL WORKS BANGLADESH"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-red-600 focus:bg-white focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Heading</label>
                <input
                  type="text"
                  value={slideHeading}
                  onChange={(e) => setSlideHeading(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-indigo-500 uppercase tracking-tight"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Description Paragraph</label>
                <textarea
                  rows={3}
                  value={slideDesc}
                  onChange={(e) => setSlideDesc(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 leading-relaxed focus:bg-white focus:border-indigo-500"
                />
              </div>

              {/* Media Type & Upload */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Slide Media Asset</span>
                  <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200 text-xs">
                    <button
                      type="button"
                      onClick={() => setSlideMediaType('image')}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-bold transition cursor-pointer ${
                        slideMediaType === 'image' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <ImageIcon size={12} />
                      <span>Image</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSlideMediaType('video')}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-bold transition cursor-pointer ${
                        slideMediaType === 'video' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Video size={12} />
                      <span>Video</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={slideMediaType === 'video' ? slideVideoUrl : slideImageUrl}
                    onChange={(e) =>
                      slideMediaType === 'video' ? setSlideVideoUrl(e.target.value) : setSlideImageUrl(e.target.value)
                    }
                    placeholder={slideMediaType === 'video' ? 'https://.../video.mp4' : '/real-media/...'}
                    className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-800"
                  />
                  <label className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer flex-shrink-0">
                    <Upload size={13} />
                    <span>{uploadingHeroMedia ? '...' : 'Upload'}</span>
                    <input
                      type="file"
                      accept={slideMediaType === 'video' ? 'video/*' : 'image/*'}
                      onChange={(e) => handleMediaUpload(e, 'hero')}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Action Button Details */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">CTA Button Text</label>
                  <input
                    type="text"
                    value={slideBtnText}
                    onChange={(e) => setSlideBtnText(e.target.value)}
                    placeholder="Explore our services"
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">CTA Destination Link (Select Page)</label>
                  <PageSelect value={slideBtnHref} onChange={setSlideBtnHref} />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT 7 COLS: 16:9 LIVE CINEMATIC DESKTOP PREVIEW */}
          <div className="lg:col-span-7 sticky top-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 px-1">
              <div className="flex items-center gap-1.5">
                <Monitor size={15} className="text-indigo-600" />
                <span>Live 16:9 Cinema Viewport Mirror</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  REAL-TIME PREVIEW
                </span>
              </div>
            </div>

            {/* 16:9 Boxed Cinema Viewport */}
            <div className="w-full aspect-[16/9] min-h-[420px] rounded-2xl overflow-hidden relative shadow-2xl bg-black border border-slate-800">
              {slideMediaType === 'video' && slideVideoUrl ? (
                <video
                  key={slideVideoUrl}
                  src={slideVideoUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <img
                  src={slideImageUrl || '/real-media/hero-corridor-infrastructure.jpg'}
                  alt="Preview"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}

              {/* Cinematic Vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/30 pointer-events-none" />

              {/* Live Overlay Content */}
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center p-6 space-y-2.5">
                {slideEyebrow && (
                  <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-[0.2em] text-[#F4382D]">
                    {slideEyebrow}
                  </span>
                )}
                <h2 className="text-white font-black text-base sm:text-2xl md:text-3xl uppercase tracking-tight leading-tight max-w-xl drop-shadow-lg">
                  {slideHeading || 'ENTER HEADLINE'}
                </h2>
                <p className="text-slate-200 text-[10px] sm:text-xs line-clamp-3 max-w-lg leading-relaxed drop-shadow">
                  {slideDesc || 'Supporting narrative appears here in real time.'}
                </p>

                {/* Clean, Non-skewed Solid Red CTA Button */}
                <div className="pt-2">
                  <span className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#F4382D] hover:bg-[#d82419] text-white font-bold text-xs shadow-xl rounded-none transition-all cursor-pointer">
                    <span>{slideBtnText || 'Explore our services'}</span>
                    <ArrowRight size={14} />
                  </span>
                </div>
              </div>

              {/* Bottom Indicators - only shown for multi-slide images, hidden for video */}
              {slideMediaType !== 'video' && heroSlides.length > 1 && (
                <div className="absolute bottom-3 left-4 z-20 flex items-center gap-1.5">
                  {heroSlides.map((_, i) => (
                    <div
                      key={i}
                      className={`h-[3px] rounded-full transition-all ${
                        i === selectedSlideIndex ? 'w-6 bg-[#F4382D]' : 'w-2 bg-white/40'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          2. MANIFESTO & KEY FACTS: (FORM LEFT, LIVE PREVIEW RIGHT)
          ========================================================================= */}
      {activeSubSection === 'manifesto' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* LEFT 5 COLS: DATA FORM */}
          <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Manifesto, Metrics &amp; Partners</h3>
                <p className="text-[11px] text-slate-400">Section 2: High-impact company statement and authority logos.</p>
              </div>
              <button
                onClick={handleSaveManifesto}
                disabled={savingSection}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition cursor-pointer shadow-xs disabled:opacity-50"
              >
                <Save size={13} />
                <span>{savingSection ? 'Saving...' : 'Save Section'}</span>
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-blue-600 mb-1">Eyebrow Left (Blue)</label>
                  <input
                    type="text"
                    value={manEyebrowBlue}
                    onChange={(e) => setManEyebrowBlue(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-red-600 mb-1">Eyebrow Right (Red)</label>
                  <input
                    type="text"
                    value={manEyebrowRed}
                    onChange={(e) => setManEyebrowRed(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-red-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Bold Statement (H2 / Leading)</label>
                <textarea
                  rows={3}
                  value={manStatement}
                  onChange={(e) => setManStatement(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Supporting Narrative Subtext</label>
                <textarea
                  rows={3}
                  value={manSubtext}
                  onChange={(e) => setManSubtext(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Button Text</label>
                  <input
                    type="text"
                    value={manBtnText}
                    onChange={(e) => setManBtnText(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Button Link (Select Page)</label>
                  <PageSelect value={manBtnHref} onChange={setManBtnHref} />
                </div>
              </div>

              {/* Metric 1 & Metric 2 Inputs */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                <span className="text-xs font-bold text-slate-800 block">Key Metrics (Dual Color Display)</span>
                
                {/* Metric 1 */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1">
                    <label className="block text-[10px] font-bold text-blue-600 mb-0.5">Metric 1 Number</label>
                    <input
                      type="text"
                      value={manMetric1Val}
                      onChange={(e) => setManMetric1Val(e.target.value)}
                      className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-extrabold text-blue-600"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Unit (e.g. km²)</label>
                    <input
                      type="text"
                      value={manMetric1Unit}
                      onChange={(e) => setManMetric1Unit(e.target.value)}
                      className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Title Label</label>
                    <input
                      type="text"
                      value={manMetric1Label}
                      onChange={(e) => setManMetric1Label(e.target.value)}
                      className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs text-slate-700"
                    />
                  </div>
                </div>

                {/* Metric 2 */}
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200">
                  <div>
                    <label className="block text-[10px] font-bold text-red-600 mb-0.5">Metric 2 Number</label>
                    <input
                      type="text"
                      value={manMetric2Val}
                      onChange={(e) => setManMetric2Val(e.target.value)}
                      className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-extrabold text-red-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Title Label</label>
                    <input
                      type="text"
                      value={manMetric2Label}
                      onChange={(e) => setManMetric2Label(e.target.value)}
                      className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs text-slate-700"
                    />
                  </div>
                </div>
              </div>

              {/* Trusted Institutional Partners Manager */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Trusted Partners &amp; Authorities</span>
                    <span className="text-[10px] text-slate-500">Edit logo path, department name &amp; acronym</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddPartner}
                    className="flex items-center gap-1 px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-[11px] font-bold transition cursor-pointer"
                  >
                    <Plus size={12} />
                    <span>Add Partner</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {partnersList.map((partner, idx) => (
                    <div key={idx} className="p-2.5 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-700">Partner #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => handleRemovePartner(idx)}
                          className="text-slate-400 hover:text-red-600 p-0.5"
                          title="Remove Partner"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        <input
                          type="text"
                          value={partner.name}
                          onChange={(e) => handleUpdatePartner(idx, 'name', e.target.value)}
                          placeholder="Full Authority Name"
                          className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-[11px] font-semibold text-slate-800"
                        />
                        <input
                          type="text"
                          value={partner.short}
                          onChange={(e) => handleUpdatePartner(idx, 'short', e.target.value)}
                          placeholder="Short Code (e.g. DNCC)"
                          className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-[11px] font-bold text-indigo-700"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        <input
                          type="text"
                          value={partner.subtext}
                          onChange={(e) => handleUpdatePartner(idx, 'subtext', e.target.value)}
                          placeholder="Subtext (e.g. Rail Authority)"
                          className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-[10px] text-slate-600"
                        />
                        <input
                          type="text"
                          value={partner.logo}
                          onChange={(e) => handleUpdatePartner(idx, 'logo', e.target.value)}
                          placeholder="Logo / SVG Path"
                          className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-[10px] font-mono text-slate-600"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT 7 COLS: LIVE MANIFESTO PREVIEW */}
          <div className="lg:col-span-7 sticky top-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 px-1">
              <div className="flex items-center gap-1.5">
                <Monitor size={15} className="text-indigo-600" />
                <span>Live Manifesto &amp; Metrics Preview</span>
              </div>
              <span className="text-[11px] text-slate-400">Desktop Viewport</span>
            </div>

            <div className="bg-[#0B0D12] text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-2xl space-y-8">
              {/* Top Row: Statement & Numbers */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                <div className="md:col-span-7 space-y-3.5">
                  <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest uppercase font-semibold">
                    <span className="text-[#3B82F6]">{manEyebrowBlue}</span>
                    <span className="text-neutral-500">•</span>
                    <span className="text-[#FB1D10]">{manEyebrowRed}</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-normal leading-snug text-white">
                    {manStatement}
                  </h3>
                  <p className="text-xs text-neutral-400 font-light leading-relaxed">
                    {manSubtext}
                  </p>
                  <div className="pt-1">
                    <span className="inline-block px-5 py-2 border border-[#3B82F6] text-white text-xs font-bold hover:bg-[#3B82F6] transition cursor-pointer">
                      {manBtnText}
                    </span>
                  </div>
                </div>

                {/* Right Column: Numbers */}
                <div className="md:col-span-5 space-y-6 md:pl-4 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0">
                  <div>
                    <span className="text-[10px] font-semibold tracking-wider text-neutral-400 uppercase block">
                      {manMetric1Label}
                    </span>
                    <div className="text-4xl sm:text-5xl font-extrabold text-[#3B82F6] leading-none mt-1">
                      {manMetric1Val} <span className="text-xl text-white/80">{manMetric1Unit}</span>
                    </div>
                    <span className="text-[10px] font-mono text-neutral-400 mt-1 block">
                      {manMetric1Sub}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-semibold tracking-wider text-neutral-400 uppercase block">
                      {manMetric2Label}
                    </span>
                    <div className="text-4xl sm:text-5xl font-extrabold text-[#FB1D10] leading-none mt-1">
                      {manMetric2Val}
                    </div>
                    <span className="text-[10px] font-mono text-neutral-400 mt-1 block">
                      {manMetric2Sub}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Authority Logos Strip */}
              <div className="pt-6 border-t border-white/10 space-y-3">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#3B82F6] font-semibold block">
                  TRUSTED INSTITUTIONAL PARTNERS &amp; AUTHORITIES
                </span>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 items-center justify-items-center opacity-90">
                  {partnersList.map((auth, idx) => (
                    <div key={idx} className="flex flex-col items-center justify-center p-2 text-center">
                      <img src={auth.logo} alt={auth.short || auth.name} className="h-9 max-w-[55px] object-contain filter brightness-95" />
                      <span className="text-[9px] font-mono font-bold text-neutral-300 mt-1">{auth.short || auth.name}</span>
                      <span className="text-[8px] font-mono text-neutral-500">{auth.subtext}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          3. SERVICES SHOWCASE: (FORM LEFT, LIVE PREVIEW RIGHT)
          ========================================================================= */}
      {activeSubSection === 'services' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* LEFT 5 COLS: DATA FORM */}
          <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Services Track Narrative</h3>
                <p className="text-[11px] text-slate-400">Configure horizontal service cards, header, and active items.</p>
              </div>
              <button
                onClick={handleSaveShaping}
                disabled={savingSection}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition cursor-pointer shadow-xs disabled:opacity-50"
              >
                <Save size={13} />
                <span>{savingSection ? 'Saving...' : 'Save Track'}</span>
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-red-600 mb-1">Subtitle Tag</label>
                  <input
                    type="text"
                    value={shapingSubtitle}
                    onChange={(e) => setShapingSubtitle(e.target.value)}
                    placeholder="WHAT WE DO"
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-red-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Eyebrow Kicker</label>
                  <input
                    type="text"
                    value={shapingKicker}
                    onChange={(e) => setShapingKicker(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Main Heading</label>
                <input
                  type="text"
                  value={shapingTitle}
                  onChange={(e) => setShapingTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Description Paragraph</label>
                <textarea
                  rows={2}
                  value={shapingDesc}
                  onChange={(e) => setShapingDesc(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Bottom Manifesto Quote</label>
                <textarea
                  rows={2}
                  value={shapingManifesto}
                  onChange={(e) => setShapingManifesto(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Button Text</label>
                  <input
                    type="text"
                    value={shapingBtnText}
                    onChange={(e) => setShapingBtnText(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Button Link (Select Page)</label>
                  <PageSelect value={shapingBtnHref} onChange={setShapingBtnHref} />
                </div>
              </div>
            </div>

            {/* Service Toggle Selector */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800">
                  Visible On Homepage ({activeServicesCount}/{services.length})
                </span>
                <div className="flex gap-1.5 text-[10px] font-bold">
                  <button
                    type="button"
                    onClick={() => services.forEach((s) => onToggleServiceActive(s.id, true))}
                    className="text-indigo-600 hover:underline cursor-pointer"
                  >
                    Select All
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => services.forEach((s) => onToggleServiceActive(s.id, false))}
                    className="text-slate-400 hover:underline cursor-pointer"
                  >
                    Deselect
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {services.map((svc) => (
                  <div
                    key={svc.id}
                    onClick={() => onToggleServiceActive(svc.id, !svc.isActive)}
                    className={`flex items-center justify-between p-2 rounded-xl border transition cursor-pointer text-xs ${
                      svc.isActive
                        ? 'bg-indigo-50/60 border-indigo-200 text-indigo-900 font-semibold'
                        : 'bg-slate-50 border-slate-200 text-slate-500 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-200 flex-shrink-0">
                        <img
                          src={svc.imageUrl || '/real-media/service-topographic-uav.png'}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-xs font-bold">{svc.title}</div>
                        <div className="text-[10px] text-slate-400 truncate">{svc.category}</div>
                      </div>
                    </div>
                    <span
                      className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        svc.isActive ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-400'
                      }`}
                    >
                      {svc.isActive ? <Check size={13} /> : null}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT 7 COLS: LIVE SERVICES TRACK PREVIEW */}
          <div className="lg:col-span-7 sticky top-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 px-1">
              <div className="flex items-center gap-1.5">
                <Monitor size={15} className="text-indigo-600" />
                <span>Live Services Track Preview</span>
              </div>
              <span className="text-[11px] text-slate-400">Desktop Viewport</span>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xl space-y-6">
              {/* Header with Navigation Chevrons */}
              <div className="flex items-end justify-between border-b border-slate-100 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest uppercase font-bold">
                    <span className="text-[#FB1D10]">{shapingSubtitle}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-500">{shapingKicker}</span>
                  </div>
                  <h3 className="text-xl font-extrabold text-[#141212] tracking-tight">{shapingTitle}</h3>
                  <p className="text-xs text-slate-600 max-w-lg leading-relaxed">{shapingDesc}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-8 h-8 rounded border border-slate-200 flex items-center justify-center text-slate-500">
                    <ChevronLeft size={16} />
                  </span>
                  <span className="w-8 h-8 rounded border border-slate-200 flex items-center justify-center text-slate-500">
                    <ChevronRight size={16} />
                  </span>
                </div>
              </div>

              {/* Horizontal Cards Preview */}
              <div>
                <div className="grid grid-cols-3 gap-3">
                  {services
                    .filter((s) => s.isActive)
                    .slice(0, 3)
                    .map((svc) => (
                      <div key={svc.id} className="group border border-slate-200 rounded-xl overflow-hidden hover:border-[#3B82F6] transition shadow-xs">
                        <div className="aspect-[16/10] relative bg-slate-100 overflow-hidden">
                          <img
                            src={svc.imageUrl || '/real-media/service-topographic-uav.png'}
                            alt={svc.title}
                            className="w-full h-full object-cover"
                          />
                          {/* Corner Blue Accent */}
                          <div className="absolute top-0 right-0 w-4 h-4 pointer-events-none">
                            <span className="absolute top-0 right-0 w-full h-[2px] bg-[#3B82F6]" />
                            <span className="absolute top-0 right-0 h-full w-[2px] bg-[#3B82F6]" />
                          </div>
                        </div>
                        <div className="p-2.5 space-y-1 bg-white">
                          <h4 className="text-xs font-bold text-[#141212] line-clamp-1">{svc.title}</h4>
                          <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">{svc.description}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Bottom Quote & Button */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <p className="text-[11px] text-slate-600 max-w-md leading-relaxed">{shapingManifesto}</p>
                <span className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-300 text-slate-900 font-bold rounded text-xs">
                  <span>{shapingBtnText}</span>
                  <ArrowRight size={12} />
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          4. PIONEERING LANDMARK PROJECTS: (FORM LEFT, LIVE PREVIEW RIGHT)
          ========================================================================= */}
      {activeSubSection === 'projects' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* LEFT 5 COLS: DATA FORM */}
          <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Landmarks Showcase Setup</h3>
                <p className="text-[11px] text-slate-400">Featured carousel with luminous corner glow blooms.</p>
              </div>
              <button
                onClick={handleSaveProjects}
                disabled={savingSection}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition cursor-pointer shadow-xs disabled:opacity-50"
              >
                <Save size={13} />
                <span>{savingSection ? 'Saving...' : 'Save Showcase'}</span>
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-red-600 mb-1">Subtitle Tag</label>
                  <input
                    type="text"
                    value={projSubtitle}
                    onChange={(e) => setProjSubtitle(e.target.value)}
                    placeholder="REAL-WORLD IMPACT"
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-red-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Eyebrow Kicker</label>
                  <input
                    type="text"
                    value={projKicker}
                    onChange={(e) => setProjKicker(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Main Heading</label>
                <input
                  type="text"
                  value={projTitle}
                  onChange={(e) => setProjTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Description Paragraph</label>
                <textarea
                  rows={2}
                  value={projDesc}
                  onChange={(e) => setProjDesc(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Button Text</label>
                  <input
                    type="text"
                    value={projBtnText}
                    onChange={(e) => setProjBtnText(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Button Link (Select Page)</label>
                  <PageSelect value={projBtnHref} onChange={setProjBtnHref} />
                </div>
              </div>
            </div>

            {/* Landmark Project Selector with Search & Filter */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  Featured On Carousel ({activeProjectsCount}/{projects.length})
                </span>
                <div className="flex gap-1.5 text-[10px] font-bold">
                  <button
                    type="button"
                    onClick={() => projects.forEach((p) => onToggleProjectMilestone(p.id, true))}
                    className="text-indigo-600 hover:underline cursor-pointer"
                  >
                    Select All
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => projects.forEach((p) => onToggleProjectMilestone(p.id, false))}
                    className="text-slate-400 hover:underline cursor-pointer"
                  >
                    Deselect
                  </button>
                </div>
              </div>

              {/* Search & Filter Bar */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={projSearchQuery}
                  onChange={(e) => setProjSearchQuery(e.target.value)}
                  placeholder="Filter by title, client, or location..."
                  className="flex-1 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white"
                />
                <select
                  value={projCategoryFilter}
                  onChange={(e) => setProjCategoryFilter(e.target.value)}
                  className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="milestones">Featured Only</option>
                  <option value="unselected">Unfeatured</option>
                </select>
              </div>

              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {projects
                  .filter((proj) => {
                    if (projCategoryFilter === 'milestones' && !proj.isMilestone) return false;
                    if (projCategoryFilter === 'unselected' && proj.isMilestone) return false;
                    if (!projSearchQuery.trim()) return true;
                    const q = projSearchQuery.toLowerCase();
                    return (
                      proj.title.toLowerCase().includes(q) ||
                      (proj.client && proj.client.toLowerCase().includes(q)) ||
                      (proj.location && proj.location.toLowerCase().includes(q))
                    );
                  })
                  .map((proj) => (
                    <div
                      key={proj.id}
                      onClick={() => onToggleProjectMilestone(proj.id, !proj.isMilestone)}
                      className={`flex items-center justify-between p-2 rounded-xl border transition cursor-pointer text-xs ${
                        proj.isMilestone
                          ? 'bg-indigo-50/60 border-indigo-200 text-indigo-900 font-semibold'
                          : 'bg-slate-50 border-slate-200 text-slate-500 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-200 flex-shrink-0">
                          <img
                            src={proj.imageUrl || '/inner/bridge-aerial.webp'}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="truncate text-xs font-bold">{proj.title}</div>
                          <div className="text-[10px] text-slate-400 truncate">{proj.client || proj.location}</div>
                        </div>
                      </div>
                      <span
                        className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                          proj.isMilestone ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-400'
                        }`}
                      >
                        {proj.isMilestone ? <Check size={13} /> : null}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* RIGHT 7 COLS: LIVE PROJECTS SHOWCASE PREVIEW */}
          <div className="lg:col-span-7 sticky top-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 px-1">
              <div className="flex items-center gap-1.5">
                <Monitor size={15} className="text-indigo-600" />
                <span>Live Pioneering Projects Preview</span>
              </div>
              <span className="text-[11px] text-slate-400">Desktop Viewport</span>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xl space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Left: Featured Project Card with Luminous Radiant Bloom & Blue Border */}
                <div className="md:col-span-7 space-y-2.5">
                  {projects.filter((p) => p.isMilestone)[0] && (
                    <div>
                      <div className="aspect-[16/10] overflow-hidden bg-neutral-900 relative rounded-none shadow-md border-2 border-[#3B82F6]">
                        <img
                          src={projects.filter((p) => p.isMilestone)[0].imageUrl || '/real-media/slide_03_img_005.jpg'}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                        {/* Radiant Corner Blooms */}
                        <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-[#3B82F6]/40 blur-xl pointer-events-none" />
                        <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-[#FB1D10]/30 blur-xl pointer-events-none" />
                        
                        {/* Corner Accents */}
                        <div className="absolute top-0 right-0 w-6 h-6 pointer-events-none">
                          <span className="absolute top-0 right-0 w-full h-[2px] bg-[#3B82F6]" />
                          <span className="absolute top-0 right-0 h-full w-[2px] bg-[#3B82F6]" />
                        </div>
                        <div className="absolute bottom-0 left-0 w-6 h-6 pointer-events-none">
                          <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#FB1D10]" />
                          <span className="absolute bottom-0 left-0 h-full w-[2px] bg-[#FB1D10]" />
                        </div>
                      </div>

                      <div className="mt-2.5 space-y-0.5">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 block">
                          {projects.filter((p) => p.isMilestone)[0].location || 'DHAKA, BANGLADESH'}
                        </span>
                        <h4 className="text-sm font-bold text-[#141212] line-clamp-1">
                          {projects.filter((p) => p.isMilestone)[0].title}
                        </h4>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right: Title, Narrative & Pager */}
                <div className="md:col-span-5 space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono tracking-widest text-[#FB1D10] font-bold uppercase">
                      {projSubtitle}
                    </span>
                    <h3 className="text-2xl font-black text-[#141212] tracking-tight leading-tight">
                      Pioneering<br />projects
                    </h3>
                    <p className="text-xs text-neutral-600 leading-relaxed">{projDesc}</p>
                  </div>

                  <div>
                    <span className="inline-block px-4 py-2 border border-[#141212] text-xs font-bold uppercase tracking-wider text-[#141212]">
                      {projBtnText}
                    </span>
                  </div>

                  {/* Pager */}
                  <div className="flex items-center gap-3 pt-2">
                    <div className="flex items-center gap-1 text-slate-600">
                      <span className="w-7 h-7 rounded border border-slate-300 flex items-center justify-center">
                        <ChevronLeft size={14} />
                      </span>
                      <span className="w-7 h-7 rounded border border-slate-300 flex items-center justify-center">
                        <ChevronRight size={14} />
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-800">1 — {activeProjectsCount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          5. SURVEY INSTRUMENTATION FLEET, WORKSTATIONS & SOFTWARE
          (EXACTLY EDITABLE: WORKSTATIONS ADD/REMOVE/EDIT + HARDWARE SELECTION + SOFTWARE SUITE)
          ========================================================================= */}
      {activeSubSection === 'equipment' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* LEFT 5 COLS: DATA FORM */}
          <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Hardware Fleet, Nodes &amp; Software</h3>
                <p className="text-[11px] text-slate-400">Edit physical sensors, computational nodes &amp; software suite.</p>
              </div>
              <button
                onClick={handleSaveEquipment}
                disabled={savingSection}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition cursor-pointer shadow-xs disabled:opacity-50"
              >
                <Save size={13} />
                <span>{savingSection ? 'Saving...' : 'Save All'}</span>
              </button>
            </div>

            {/* General Section Narrative */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-red-600 mb-1">Subtitle Tag</label>
                  <input
                    type="text"
                    value={equipSubtitle}
                    onChange={(e) => setEquipSubtitle(e.target.value)}
                    placeholder="PHYSICAL & TECHNICAL RESOURCES"
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-red-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Compute Lab Title</label>
                  <input
                    type="text"
                    value={equipLabTitle}
                    onChange={(e) => setEquipLabTitle(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Main Heading</label>
                <input
                  type="text"
                  value={equipTitle}
                  onChange={(e) => setEquipTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Description Paragraph</label>
                <textarea
                  rows={2}
                  value={equipDesc}
                  onChange={(e) => setEquipDesc(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Centralized NAS Storage Detail</label>
                <input
                  type="text"
                  value={equipNasText}
                  onChange={(e) => setEquipNasText(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>
            </div>

            {/* 1. WORKSTATION NODES: ADD / REMOVE / EDIT */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Cpu size={14} className="text-indigo-600" />
                    <span>Processing Workstation Nodes ({workstations.length})</span>
                  </span>
                  <span className="text-[10px] text-slate-400">Add, edit specs, or remove nodes live</span>
                </div>
                <button
                  type="button"
                  onClick={handleAddWorkstation}
                  className="flex items-center gap-1 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold rounded-lg transition cursor-pointer"
                >
                  <Plus size={12} />
                  <span>Add Node</span>
                </button>
              </div>

              <div className="space-y-2">
                {workstations.map((ws, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-xl border bg-white space-y-2 transition ${
                      ws.isAccent ? 'border-red-300 ring-1 ring-red-100' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        value={ws.id}
                        onChange={(e) => handleUpdateWorkstation(idx, 'id', e.target.value)}
                        placeholder="NODE 01"
                        className="w-24 px-2 py-0.5 bg-slate-100 rounded text-[11px] font-mono font-bold text-slate-800"
                      />
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-1 text-[10px] font-bold text-slate-600 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={ws.isAccent || false}
                            onChange={(e) => handleUpdateWorkstation(idx, 'isAccent', e.target.checked)}
                            className="rounded text-red-600"
                          />
                          <span>Highlight Red</span>
                        </label>
                        {workstations.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveWorkstation(idx)}
                            className="text-slate-400 hover:text-red-600 transition p-1"
                            title="Remove workstation"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5">
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 mb-0.5">CPU Processor</label>
                        <input
                          type="text"
                          value={ws.cpu}
                          onChange={(e) => handleUpdateWorkstation(idx, 'cpu', e.target.value)}
                          placeholder="Intel Core i9"
                          className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-800 font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 mb-0.5">RAM Memory</label>
                        <input
                          type="text"
                          value={ws.ram}
                          onChange={(e) => handleUpdateWorkstation(idx, 'ram', e.target.value)}
                          placeholder="64GB DDR5"
                          className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-800 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 mb-0.5">GPU Graphics</label>
                        <input
                          type="text"
                          value={ws.gpu}
                          onChange={(e) => handleUpdateWorkstation(idx, 'gpu', e.target.value)}
                          placeholder="RTX 4060 Ti"
                          className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-800 font-semibold"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. PHYSICAL HARDWARE FLEET: SELECT TO SHOWCASE */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Wrench size={14} className="text-indigo-600" />
                    <span>Select Physical Hardware to Showcase ({selectedEquipIds.length} Selected)</span>
                  </span>
                  <span className="text-[10px] text-slate-400">Toggle which equipment units are displayed in the main 3-card showcase</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold">
                  <button
                    type="button"
                    onClick={() => setSelectedEquipIds(equipment.map((e) => e.id))}
                    className="text-indigo-600 hover:underline cursor-pointer"
                  >
                    All
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => setSelectedEquipIds([])}
                    className="text-slate-400 hover:underline cursor-pointer"
                  >
                    Reset
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {equipment.map((eq) => {
                  const isChecked = selectedEquipIds.includes(eq.id);
                  return (
                    <div
                      key={eq.id}
                      onClick={() => handleToggleEquipmentSelect(eq.id)}
                      className={`flex items-center justify-between p-2 rounded-xl border transition cursor-pointer text-xs ${
                        isChecked
                          ? 'bg-indigo-50/70 border-indigo-200 text-indigo-900 font-semibold'
                          : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-200 flex-shrink-0">
                          <img
                            src={eq.imageUrl || '/real-media/slide_42_img_193.jpg'}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="truncate text-xs font-bold">{eq.name}</div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {eq.category} • {eq.quantity}
                          </div>
                        </div>
                      </div>
                      <span
                        className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                          isChecked ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-300'
                        }`}
                      >
                        {isChecked ? <Check size={13} /> : null}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. SOFTWARE LOGOS & SUITE: ADD / REMOVE / EDIT */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Layers size={14} className="text-indigo-600" />
                    <span>Core Software Suite ({softwareList.length})</span>
                  </span>
                  <span className="text-[10px] text-slate-400">Directly add, edit &amp; remove software applications</span>
                </div>
                <button
                  type="button"
                  onClick={handleAddSoftware}
                  className="flex items-center gap-1 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold rounded-lg transition cursor-pointer"
                >
                  <Plus size={12} />
                  <span>Add Software</span>
                </button>
              </div>

              <div className="space-y-2">
                {softwareList.map((sw, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl border border-slate-200 bg-white space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        value={sw.name}
                        onChange={(e) => handleUpdateSoftware(idx, 'name', e.target.value)}
                        placeholder="Software Name"
                        className="flex-1 px-2 py-0.5 bg-slate-50 border border-slate-200 rounded text-xs font-bold text-slate-900"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveSoftware(idx)}
                        className="text-slate-400 hover:text-red-600 transition p-1"
                        title="Remove software"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 mb-0.5">Category</label>
                        <input
                          type="text"
                          value={sw.category}
                          onChange={(e) => handleUpdateSoftware(idx, 'category', e.target.value)}
                          placeholder="e.g. Geospatial GIS"
                          className="w-full px-2 py-0.5 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-700"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 mb-0.5">Badge / Suite</label>
                        <input
                          type="text"
                          value={sw.badge}
                          onChange={(e) => handleUpdateSoftware(idx, 'badge', e.target.value)}
                          placeholder="e.g. ESRI Enterprise"
                          className="w-full px-2 py-0.5 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-700"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT 7 COLS: LIVE EQUIPMENT, NODES & SOFTWARE PREVIEW */}
          <div className="lg:col-span-7 sticky top-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 px-1">
              <div className="flex items-center gap-1.5">
                <Monitor size={15} className="text-indigo-600" />
                <span>Live Instruments, Nodes &amp; Software Preview</span>
              </div>
              <span className="text-[11px] text-slate-400">Desktop Viewport</span>
            </div>

            <div className="bg-[#0B0D12] text-white rounded-2xl p-6 sm:p-7 border border-slate-800 shadow-2xl space-y-6">
              {/* Header */}
              <div className="space-y-1.5 border-b border-white/10 pb-4">
                <span className="text-[10px] font-mono tracking-widest text-[#FB1D10] font-bold uppercase block">
                  {equipSubtitle}
                </span>
                <h3 className="text-2xl font-extrabold tracking-tight text-white">
                  Instruments &amp; <span className="text-[#3B82F6]">facilities</span>
                </h3>
                <p className="text-xs text-neutral-400 max-w-lg leading-relaxed">{equipDesc}</p>
              </div>

              {/* Physical Instrument Cards (Selected or Default) */}
              <div className="grid grid-cols-3 gap-3">
                {displayedEquip.map((eq, idx) => (
                  <div key={eq.id || idx} className="bg-neutral-950 p-3 rounded-lg border border-white/10 space-y-2">
                    <div className="aspect-[4/3] rounded overflow-hidden bg-neutral-900">
                      <img
                        src={eq.imageUrl || '/real-media/slide_42_img_193.jpg'}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <span className={`text-[9px] font-mono font-bold uppercase ${idx % 2 === 0 ? 'text-[#3B82F6]' : 'text-[#FB1D10]'}`}>
                        {eq.category} • {eq.quantity}
                      </span>
                      <h5 className="text-xs font-bold text-white truncate">{eq.name}</h5>
                      <p className="text-[10px] text-neutral-400 truncate">{eq.manufacturer}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Dynamic Workstations Spec Nodes Grid */}
              <div className="p-3.5 bg-neutral-950 rounded-xl border border-white/10 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-[#3B82F6] uppercase font-bold tracking-wider">
                    {equipLabTitle}
                  </span>
                  <span className="text-[10px] font-mono text-neutral-400">
                    {workstations.length} Active Nodes
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono">
                  {workstations.map((ws, i) => (
                    <div
                      key={i}
                      className={`p-2.5 rounded border transition ${
                        ws.isAccent
                          ? 'bg-red-950/20 border-red-500/40 text-red-200'
                          : 'bg-black/60 border-white/5 text-neutral-300'
                      }`}
                    >
                      <span className={`font-bold block text-[9px] tracking-wider ${ws.isAccent ? 'text-[#FB1D10]' : 'text-[#3B82F6]'}`}>
                        {ws.id}
                      </span>
                      <span className="text-white font-bold block truncate">{ws.cpu}</span>
                      <div className="mt-1 flex items-center justify-between text-[9px]">
                        <span className="text-neutral-400">{ws.ram}</span>
                        <span className={`font-semibold ${ws.isAccent ? 'text-[#FB1D10]' : 'text-[#3B82F6]'}`}>
                          {ws.gpu}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-[10px] font-mono text-neutral-400 flex items-center justify-between pt-1 border-t border-white/5">
                  <span>NAS: {equipNasText}</span>
                  <span className="text-[#3B82F6] font-bold">24/7 REDUNDANT</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          6. NEWS & BULLETINS: (FORM LEFT, LIVE PREVIEW RIGHT)
          ========================================================================= */}
      {activeSubSection === 'news' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* LEFT 5 COLS: DATA FORM */}
          <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">News &amp; Bulletins Setup</h3>
                <p className="text-[11px] text-slate-400">Configure visual article cards and interactive news list.</p>
              </div>
              <button
                onClick={handleSaveNews}
                disabled={savingSection}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition cursor-pointer shadow-xs disabled:opacity-50"
              >
                <Save size={13} />
                <span>{savingSection ? 'Saving...' : 'Save News'}</span>
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-blue-600 mb-1">Subtitle Tag</label>
                <input
                  type="text"
                  value={newsSubtitle}
                  onChange={(e) => setNewsSubtitle(e.target.value)}
                  placeholder="RESEARCH & APPLIED GEODESY"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-blue-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Top Heading (Articles)</label>
                <input
                  type="text"
                  value={newsTitle}
                  onChange={(e) => setNewsTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Bottom Heading (Newsroom)</label>
                <input
                  type="text"
                  value={newsroomTitle}
                  onChange={(e) => setNewsroomTitle(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Feed Mode</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setNewsMode('latest')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      newsMode === 'latest'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    ⚡ Auto Latest
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewsMode('manual')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      newsMode === 'manual'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    📌 Manual Pick
                  </button>
                </div>
              </div>
            </div>

            {/* Manual Article Selector */}
            {newsMode === 'manual' && (
              <div className="pt-2 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-800 block mb-2">
                  Select Articles to Feature ({selectedArticleIds.length} Selected)
                </span>
                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {articles.map((art) => {
                    const isSelected = selectedArticleIds.includes(art.id);
                    return (
                      <div
                        key={art.id}
                        onClick={() =>
                          setSelectedArticleIds((prev) =>
                            prev.includes(art.id) ? prev.filter((id) => id !== art.id) : [...prev, art.id]
                          )
                        }
                        className={`flex items-center justify-between p-2 rounded-xl border transition cursor-pointer text-xs ${
                          isSelected
                            ? 'bg-indigo-50/60 border-indigo-200 text-indigo-900 font-semibold'
                            : 'bg-slate-50 border-slate-200 text-slate-500 opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-200 flex-shrink-0">
                            <img
                              src={art.imageUrl || '/real-media/insight-drone-dtca-survey.jpg'}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="truncate text-xs font-bold">{art.title}</div>
                            <div className="text-[10px] text-slate-400">{art.category}</div>
                          </div>
                        </div>
                        <span
                          className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                            isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-400'
                          }`}
                        >
                          {isSelected ? <Check size={13} /> : null}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT 7 COLS: LIVE NEWS & BULLETINS PREVIEW */}
          <div className="lg:col-span-7 sticky top-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 px-1">
              <div className="flex items-center gap-1.5">
                <Monitor size={15} className="text-indigo-600" />
                <span>Live News &amp; Bulletins Preview</span>
              </div>
              <span className="text-[11px] text-slate-400">Desktop Viewport</span>
            </div>

            <div className="bg-[#0B0D12] text-white rounded-2xl p-6 sm:p-7 border border-slate-800 shadow-2xl space-y-6">
              {/* Top: Innovative Thinking */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <span className="text-[10px] font-mono tracking-widest text-[#3B82F6] font-bold uppercase block">
                      {newsSubtitle}
                    </span>
                    <h3 className="text-xl font-extrabold text-white">{newsTitle}</h3>
                  </div>
                  <span className="px-3 py-1.5 border border-[#3B82F6] text-white text-[11px] font-bold rounded">
                    Read all insights
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    {
                      title: 'Rapid Deployment of DJI Matrice 4E UAV for DTCA Route Survey',
                      tag: 'UAV PHOTOGRAMMETRY',
                      isBlue: true,
                      img: '/real-media/insight-drone-dtca-survey.jpg',
                    },
                    {
                      title: 'Generating 0.20cm DTM & Orthomosaics for Railway Bypasses',
                      tag: 'TERRAIN MODELING',
                      isBlue: false,
                      img: '/real-media/insight-dsm-corridor-mapping.jpg',
                    },
                    {
                      title: 'Coastal Mangrove Accretion Assessment Using RTK-Enabled UAVs',
                      tag: 'REMOTE SENSING',
                      isBlue: true,
                      img: '/real-media/insight-coastal-mangrove-uav.jpg',
                    },
                  ].map((art, idx) => (
                    <div key={idx} className="group border border-white/10 rounded-lg overflow-hidden bg-neutral-950">
                      <div className="aspect-[16/10] relative bg-neutral-900">
                        <img src={art.img} alt="" className="w-full h-full object-cover" />
                        <span className={`absolute top-2 left-2 text-[8px] font-mono font-bold uppercase px-1.5 py-0.5 text-white ${art.isBlue ? 'bg-[#3B82F6]' : 'bg-[#FB1D10]'}`}>
                          {art.tag}
                        </span>
                      </div>
                      <div className="p-2.5">
                        <h5 className="text-[11px] font-bold text-white line-clamp-2 leading-snug">{art.title}</h5>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom: Latest News List */}
              <div className="pt-4 border-t border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-extrabold text-white">{newsroomTitle}</h4>
                  <span className="text-[11px] text-[#3B82F6] font-bold hover:underline cursor-pointer">
                    Go to newsroom &rarr;
                  </span>
                </div>

                <div className="divide-y divide-white/10 text-xs">
                  {[
                    { date: '26.09.30', tag: 'PROJECT COMPLETION', title: '35.15 sq km UAV drone and traffic OD survey across 150 km of Dhaka city for DTCA.', isBlue: true },
                    { date: '26.07.15', tag: 'RESEARCH & INNOVATION', title: 'River water-level gauge readers and RTK adjustments across Jhopjhopia River for BADC.', isBlue: false },
                  ].map((item, idx) => (
                    <div key={idx} className="py-2.5 flex items-baseline justify-between gap-3">
                      <div className="flex items-baseline gap-3">
                        <span className={`font-mono text-[11px] font-bold ${item.isBlue ? 'text-[#3B82F6]' : 'text-[#FB1D10]'}`}>{item.date}</span>
                        <div>
                          <span className="text-[9px] font-bold text-neutral-400 uppercase block">{item.tag}</span>
                          <span className="text-neutral-200 text-[11px] line-clamp-1">{item.title}</span>
                        </div>
                      </div>
                      <ArrowRight size={14} className="text-neutral-500 shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          7. LEAD & GROW (CAREERS): (FORM LEFT, LIVE PREVIEW RIGHT)
          ========================================================================= */}
      {activeSubSection === 'leadgrow' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* LEFT 5 COLS: DATA FORM */}
          <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Lead &amp; Grow (Careers) Setup</h3>
                <p className="text-[11px] text-slate-400">Configure portrait, culture narrative, and career action buttons.</p>
              </div>
              <button
                onClick={handleSaveCulture}
                disabled={savingSection}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition cursor-pointer shadow-xs disabled:opacity-50"
              >
                <Save size={13} />
                <span>{savingSection ? 'Saving...' : 'Save Culture'}</span>
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-blue-600 mb-1">Subtitle Tag</label>
                <input
                  type="text"
                  value={cultureSubtitle}
                  onChange={(e) => setCultureSubtitle(e.target.value)}
                  placeholder="NATIONAL TALENT & ENGINEERING CAREERS"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-blue-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Main Heading</label>
                <input
                  type="text"
                  value={cultureTitle}
                  onChange={(e) => setCultureTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Description Paragraph</label>
                <textarea
                  rows={3}
                  value={cultureDesc}
                  onChange={(e) => setCultureDesc(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 leading-relaxed"
                />
              </div>

              {/* Photo Input */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Engineer Portrait Image</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={cultureImageUrl}
                    onChange={(e) => setCultureImageUrl(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800"
                  />
                  <label className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer flex-shrink-0">
                    <Upload size={13} />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleMediaUpload(e, 'culture')}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Button 1 & 2 */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Primary CTA Button</label>
                  <input
                    type="text"
                    value={cultureBtn1Text}
                    onChange={(e) => setCultureBtn1Text(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Primary Link (Select Page)</label>
                  <PageSelect value={cultureBtn1Href} onChange={setCultureBtn1Href} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Secondary Button</label>
                  <input
                    type="text"
                    value={cultureBtn2Text}
                    onChange={(e) => setCultureBtn2Text(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Secondary Link (Select Page)</label>
                  <PageSelect value={cultureBtn2Href} onChange={setCultureBtn2Href} />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT 7 COLS: LIVE LEAD & GROW PREVIEW */}
          <div className="lg:col-span-7 sticky top-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 px-1">
              <div className="flex items-center gap-1.5">
                <Monitor size={15} className="text-indigo-600" />
                <span>Live Lead &amp; Grow Preview</span>
              </div>
              <span className="text-[11px] text-slate-400">Desktop Viewport</span>
            </div>

            <div className="bg-[#141212] text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-2xl space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Left: Professional Portrait with Dual Blue/Red Glow */}
                <div className="md:col-span-5 relative">
                  <div className="absolute -left-4 -top-4 w-28 h-28 bg-[#3B82F6]/30 rounded-full blur-xl pointer-events-none" />
                  <div className="absolute -right-4 -bottom-4 w-28 h-28 bg-[#FB1D10]/25 rounded-full blur-xl pointer-events-none" />
                  <div className="relative aspect-[4/3] rounded overflow-hidden bg-neutral-900 border-l-4 border-[#3B82F6] shadow-xl">
                    <img
                      src={cultureImageUrl || '/real-media/career-engineering-team.jpg'}
                      alt="Engineer Portrait"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Right: Narrative & Buttons */}
                <div className="md:col-span-7 space-y-4">
                  <span className="text-[10px] font-mono tracking-widest text-[#3B82F6] font-bold uppercase block">
                    {cultureSubtitle}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                    Lead and <span className="text-[#FB1D10]">grow</span>
                  </h3>
                  <p className="text-xs text-neutral-300 leading-relaxed max-w-md">
                    {cultureDesc}
                  </p>
                  <div className="flex items-center gap-3 pt-2">
                    <span className="px-5 py-2.5 bg-[#FB1D10] text-white font-bold text-xs inline-flex items-center gap-2 shadow-lg">
                      <span>{cultureBtn1Text}</span>
                      <ArrowRight size={13} />
                    </span>
                    <span className="px-4 py-2.5 border border-[#3B82F6] text-white font-bold text-xs inline-flex items-center gap-2 hover:bg-[#3B82F6]/20 transition">
                      <span>{cultureBtn2Text}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
