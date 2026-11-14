'use client';

import React, { useState, useEffect } from 'react';
import { MediaAssetField } from './MediaAssetField';
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
  Eye,
  EyeOff,
  PanelLeftClose,
  PanelRightClose,
  Search,
  X,
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
  description: string;
  logo: string;
}

export interface PartnerLogoItem {
  name: string;
  short: string;
  subtext: string;
  logo: string;
}

const EMPTY_SECTION: Record<string, any> = Object.freeze({});

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

type SelectionOption = {
  id: string;
  title: string;
  detail?: string;
  image?: string;
  selected: boolean;
};

function SelectionLauncher({
  label,
  selected,
  summary,
  onClick,
}: {
  label: string;
  selected: number;
  summary: string;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-left transition hover:border-blue-400 hover:bg-blue-50/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-slate-900">{label}</span>
        <span className="mt-0.5 block truncate text-xs text-slate-600">{summary}</span>
      </span>
      <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-800">{selected} selected</span>
    </button>
  );
}

function SelectionPicker({
  title,
  description,
  options,
  onToggle,
  onClear,
  onClose,
  maxSelected,
}: {
  title: string;
  description: string;
  options: SelectionOption[];
  onToggle: (id: string) => void;
  onClear: () => void;
  onClose: () => void;
  maxSelected?: number;
}) {
  const [query, setQuery] = useState('');
  const selectedCount = options.filter((option) => option.selected).length;
  const filtered = options.filter((option) => `${option.title} ${option.detail || ''}`.toLowerCase().includes(query.trim().toLowerCase()));

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/45 p-3 sm:p-6" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="selection-picker-title" className="flex max-h-[min(82vh,760px)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <div><h2 id="selection-picker-title" className="text-base font-semibold text-slate-950">{title}</h2><p className="mt-1 text-sm text-slate-600">{description}</p></div>
          <button type="button" onClick={onClose} aria-label="Close selector" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"><X size={18} /></button>
        </header>
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-3">
          <label className="relative min-w-0 flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name" aria-label="Search items" className="w-full rounded-lg border border-slate-300 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-500" /></label>
          <span className="shrink-0 text-xs font-semibold text-slate-700">{selectedCount}{maxSelected ? ` / ${maxSelected}` : ''} selected</span>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">
          {filtered.length ? <div className="grid gap-2 sm:grid-cols-2">{filtered.map((option) => {
            const disabled = !option.selected && !!maxSelected && selectedCount >= maxSelected;
            return <label key={option.id} className={`flex min-w-0 cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${option.selected ? 'border-blue-300 bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'} ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}>
              <input type="checkbox" checked={option.selected} disabled={disabled} onChange={() => onToggle(option.id)} className="h-4 w-4 shrink-0 accent-blue-700" />
              {option.image ? <img src={option.image} alt="" className="h-11 w-11 shrink-0 rounded-lg border border-slate-200 bg-white object-contain" /> : null}
              <span className="min-w-0"><span className="block truncate text-sm font-semibold text-slate-900">{option.title}</span>{option.detail ? <span className="mt-0.5 block truncate text-xs text-slate-600">{option.detail}</span> : null}</span>
            </label>;
          })}</div> : <p className="rounded-xl border border-dashed border-slate-300 px-4 py-10 text-center text-sm text-slate-600">No matches. Try a different search.</p>}
        </div>
        <footer className="flex items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-5 py-3">
          <button type="button" onClick={onClear} disabled={!selectedCount} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-white hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40">Clear selection</button>
          <button type="button" onClick={onClose} className="rounded-lg bg-[#1D5EC8] px-5 py-2 text-sm font-semibold text-white hover:bg-[#164EA8]">Done</button>
        </footer>
      </section>
    </div>
  );
}

interface LandingPageViewProps {
  heroSlides: HeroSlideItem[];
  services: ServiceItem[];
  projects: ProjectItem[];
  equipment: EquipmentItem[];
  articles: ArticleItem[];
  teamMembers: { id?: string; slug?: string; name: string; role: string; category?: string; image?: string; isActive?: boolean }[];
  sections: Record<string, any>;
  onSaveHeroSlide: (slide: Partial<HeroSlideItem>) => Promise<boolean>;
  onDeleteHeroSlide: (id: string) => Promise<void>;
  onUpdateSection: (pageKey: string, sectionKey: string, data: { title?: string; subtitle?: string; content: any }) => Promise<boolean>;
  onToggleServiceActive: (id: string, active: boolean) => Promise<void>;
  onToggleProjectMilestone: (id: string, isMilestone: boolean) => Promise<void>;
  onRefresh: () => void;
  triggerFeedback: (msg: string, type?: 'success' | 'error') => void;
  getAuthHeaders: () => Record<string, string>;
  onOpenMediaPicker: (callback: (url: string) => void) => void;
}

export function LandingPageView({
  heroSlides,
  services,
  projects,
  equipment,
  articles,
  teamMembers,
  sections,
  onSaveHeroSlide,
  onDeleteHeroSlide,
  onUpdateSection,
  onToggleServiceActive,
  onToggleProjectMilestone,
  triggerFeedback,
  getAuthHeaders,
  onOpenMediaPicker,
}: LandingPageViewProps) {
  const [activeSubSection, setActiveSubSection] = useState<
    'hero' | 'manifesto' | 'services' | 'projects' | 'equipment' | 'team' | 'news' | 'leadgrow'
  >('hero');
  const [livePreviewOpen, setLivePreviewOpen] = useState(false);
  const [previewVersion, setPreviewVersion] = useState(0);
  const [panels, setPanels] = useState({ editor: true, preview: true });

  // ==========================================
  // SECTION 1: HERO SLIDES STATE
  // ==========================================
  const [selectedSlideIndex, setSelectedSlideIndex] = useState(0);
  const activeSlide: HeroSlideItem = heroSlides[selectedSlideIndex] || {
    id: 'temp',
    heading: '',
    eyebrow: '',
    description: '',
    imageUrl: '',
    mediaType: 'image',
    videoUrl: '',
    primaryActionText: '',
    primaryActionHref: '',
  };

  const [slideEyebrow, setSlideEyebrow] = useState(activeSlide.eyebrow || '');
  const [slideHeading, setSlideHeading] = useState(activeSlide.heading || '');
  const [slideDesc, setSlideDesc] = useState(activeSlide.description || '');
  const [slideImageUrl, setSlideImageUrl] = useState(activeSlide.imageUrl || '');
  const [slideMediaType, setSlideMediaType] = useState<'image' | 'video'>(activeSlide.mediaType || 'image');
  const [slideVideoUrl, setSlideVideoUrl] = useState(activeSlide.videoUrl || '');
  const [slideBtnText, setSlideBtnText] = useState(activeSlide.primaryActionText || 'Explore our services');
  const [slideBtnHref, setSlideBtnHref] = useState(activeSlide.primaryActionHref || '/services');
  const [slideSecondaryText, setSlideSecondaryText] = useState(activeSlide.secondaryActionText || '');
  const [slideSecondaryHref, setSlideSecondaryHref] = useState(activeSlide.secondaryActionHref || '');
  const [slideIsActive, setSlideIsActive] = useState(activeSlide.isActive !== false);

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
      setSlideSecondaryText(activeSlide.secondaryActionText || '');
      setSlideSecondaryHref(activeSlide.secondaryActionHref || '');
      setSlideIsActive(activeSlide.isActive !== false);
    }
  }, [selectedSlideIndex, heroSlides]);

  // ==========================================
  // SECTION 2: MANIFESTO & KEY FACTS STATE
  // ==========================================
  const manifestoSec = sections['home:manifesto'] || sections['home:manifesto_summary'] || sections['home:about_summary'] || EMPTY_SECTION;
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
        name: '',
        short: '',
        subtext: '',
        logo: '',
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
  const shapingSec = sections['home:shaping_future'] || sections['home:services_summary'] || sections['home:services_intro'] || EMPTY_SECTION;
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
  const projSec = sections['home:projects_summary'] || sections['home:projects_intro'] || EMPTY_SECTION;
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
  const equipSec = sections['home:equipment_summary'] || EMPTY_SECTION;
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
    { name: 'ArcGIS Pro', category: 'Mapping and GIS', badge: 'Esri', description: 'A geographic information system for creating maps, analyzing data, and managing spatial information.', logo: '/software-logos/arcgis-pro-dark-tight.png' },
    { name: 'QGIS', category: 'Mapping and GIS', badge: 'Open source', description: 'An open-source mapping tool for viewing, editing, analyzing, and sharing geographic data.', logo: '/software-logos/qgis-dark-tight.png' },
    { name: 'Agisoft Metashape', category: 'Drone mapping', badge: 'Photogrammetry', description: 'Photogrammetry software that turns photographs into 3D spatial data, models, and orthomosaics.', logo: '/software-logos/agisoft-metashape-dark-tight.png' },
    { name: 'AutoCAD Civil 3D', category: 'Civil design', badge: 'Autodesk', description: 'Civil engineering design software for planning, documenting, and delivering infrastructure projects.', logo: '/software-logos/autocad-civil-3d-dark-tight.png' },
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
      { name: '', category: '', badge: '', description: '', logo: '' },
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
  const newsSec = sections['home:news_summary'] || EMPTY_SECTION;
  const [newsSubtitle, setNewsSubtitle] = useState((newsSec?.subtitle || 'RESEARCH & APPLIED GEODESY').replace(/^\/\s*/, ''));
  const [newsTitle, setNewsTitle] = useState(newsSec?.title || 'Innovative thinking');
  const [newsroomTitle, setNewsroomTitle] = useState(newsSec?.content?.newsroomTitle || 'Latest news');
  const [newsMode, setNewsMode] = useState<'latest' | 'manual'>(newsSec?.content?.mode || 'latest');
  const [selectedArticleIds, setSelectedArticleIds] = useState<string[]>(newsSec?.content?.selectedArticleIds || []);
  const [selectionDialogType, setSelectionDialogType] = useState<'services' | 'projects' | 'equipment' | 'team' | 'articles' | null>(null);

  // ==========================================
  // SECTION 7: LEAD & GROW (CAREERS) STATE
  // ==========================================
  const cultureSec = sections['home:culture_summary'] || EMPTY_SECTION;
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

  // Homepage team section copy and featured people. Profiles themselves are edited in Team.
  const teamSec = sections['home:team_summary'] || EMPTY_SECTION;
  const [teamEyebrow, setTeamEyebrow] = useState(teamSec?.subtitle || 'PEOPLE MAKE THE DIFFERENCE');
  const [teamTitle, setTeamTitle] = useState(teamSec?.title || 'Meet the people behind the work.');
  const [teamDescription, setTeamDescription] = useState(teamSec?.content?.description || 'Good projects begin with people who care about the details. Meet a few of the team members helping build a clearer picture of Bangladesh.');
  const [featuredTeamIds, setFeaturedTeamIds] = useState<string[]>(teamSec?.content?.featuredMemberIds || []);
  const activeMembers = teamMembers.filter((member) => member.isActive !== false && (member.id || member.slug));

  // Reload editor values when the authenticated API data arrives or this section
  // is saved. Keep unsaved edits intact when a different section changes.
  useEffect(() => {
    setManEyebrowBlue(manifestoSec.content?.eyebrowBlue || 'GEOSPATIAL PRECISION');
    setManEyebrowRed(manifestoSec.content?.eyebrowRed || 'ENGINEERING EXCELLENCE');
    setManStatement(manifestoSec.title || 'Geospatial Works is an engineering, geospatial, and precision surveying consultancy delivering integrated technical solutions for infrastructure development, spatial planning, and sustainable resource management across Bangladesh.');
    setManSubtext(manifestoSec.content?.subtext || 'Combining engineering expertise with advanced geospatial technologies, modern surveying instruments, and digital design capabilities, we support projects from field data acquisition and spatial analysis to engineering design and 3D visualization.');
    setManBtnText(manifestoSec.content?.btnText || 'Who we are');
    setManBtnHref(manifestoSec.content?.btnHref || '/about');
    setManMetric1Val(manifestoSec.content?.metric1Val || '1,500+');
    setManMetric1Unit(manifestoSec.content?.metric1Unit || 'km²');
    setManMetric1Label(manifestoSec.content?.metric1Label || 'Area Surveyed & Mapped');
    setManMetric1Sub(manifestoSec.content?.metric1Sub || 'Corridors & Agricultural Basins Surveyed');
    setManMetric2Val(manifestoSec.content?.metric2Val || '35+');
    setManMetric2Label(manifestoSec.content?.metric2Label || 'National Infrastructure Projects');
    setManMetric2Sub(manifestoSec.content?.metric2Sub || 'Completed National Infrastructure Commissions');
    setPartnersList(manifestoSec.content?.partners || defaultPartnersList);
  }, [manifestoSec]);

  useEffect(() => {
    setShapingSubtitle((shapingSec.subtitle || 'WHAT WE DO').replace(/^\/\s*/, ''));
    setShapingKicker(shapingSec.content?.kicker || 'INNOVATION • RESILIENCE • IMPACT');
    setShapingTitle(shapingSec.title || 'Shaping the Future with Precision Geomatics');
    setShapingDesc(shapingSec.content?.description || 'From sub-centimeter geodetic networks and automated drone photogrammetry to digital twins and bathymetric river surveys, we provide the spatial backbone for Bangladesh’s transformation.');
    setShapingManifesto(shapingSec.content?.manifestoQuote || 'We combine future-focused thinking and technical know-how to power local impact. Our teams develop deep understanding and a partnership of trust with our clients across over 100 sectors and services.');
    setShapingBtnText(shapingSec.content?.btnText || 'What we do');
    setShapingBtnHref(shapingSec.content?.btnHref || '/services');
  }, [shapingSec]);

  useEffect(() => {
    setProjSubtitle((projSec.subtitle || 'REAL-WORLD IMPACT').replace(/^\/\s*/, ''));
    setProjKicker(projSec.content?.kicker || '35+ NATIONAL CONTRACTS ACROSS 8 DIVISIONS');
    setProjTitle(projSec.title || 'Pioneering projects delivering measurable impact.');
    setProjDesc(projSec.content?.description || 'Across Bangladesh, we work with clients to dream big, challenge conventions and transform our world for the better.');
    setProjBtnText(projSec.content?.btnText || 'View all projects');
    setProjBtnHref(projSec.content?.btnHref || '/projects');
  }, [projSec]);

  useEffect(() => {
    setEquipSubtitle((equipSec.subtitle || 'PHYSICAL & TECHNICAL RESOURCES').replace(/^\/\s*/, ''));
    setEquipTitle(equipSec.title || 'Instruments & facilities');
    setEquipDesc(equipSec.content?.description || 'Geospatial Works maintains an extensive inventory of geodetic GNSS receivers, enterprise UAV systems, optical instruments, and dedicated high-performance workstations.');
    setEquipLabTitle(equipSec.content?.labTitle || 'High-Throughput Spatial Compute & Modeling Stack');
    setEquipNasText(equipSec.content?.nasText || 'UAV Point Clouds • Orthomosaics • LiDAR & Geodatabases');
    setWorkstations(equipSec.content?.workstations?.length ? equipSec.content.workstations : defaultWorkstations);
    setSelectedEquipIds(equipSec.content?.selectedEquipmentIds || []);
    setSoftwareList(equipSec.content?.softwareList?.length ? equipSec.content.softwareList : defaultSoftware);
  }, [equipSec]);

  useEffect(() => {
    setNewsSubtitle((newsSec.subtitle || 'RESEARCH & APPLIED GEODESY').replace(/^\/\s*/, ''));
    setNewsTitle(newsSec.title || 'Innovative thinking');
    setNewsroomTitle(newsSec.content?.newsroomTitle || 'Latest news');
    setNewsMode(newsSec.content?.mode || 'latest');
    setSelectedArticleIds(newsSec.content?.selectedArticleIds || []);
  }, [newsSec]);

  useEffect(() => {
    setCultureSubtitle((cultureSec.subtitle || 'NATIONAL TALENT & ENGINEERING CAREERS').replace(/^\/\s*/, ''));
    setCultureTitle(cultureSec.title || 'Lead and grow');
    setCultureDesc(cultureSec.content?.description || 'What if you could build a career that’s as unique as you? With us you can. We empower spatial analysts, surveyors, and civil engineers to work on nation-critical mega projects.');
    setCultureBtn1Text(cultureSec.content?.btn1Text || 'Search and apply');
    setCultureBtn1Href(cultureSec.content?.btn1Href || '/career');
    setCultureBtn2Text(cultureSec.content?.btn2Text || 'Life at Geospatial Works');
    setCultureBtn2Href(cultureSec.content?.btn2Href || '/career');
    setCultureImageUrl(cultureSec.content?.imageUrl || '/real-media/career-engineering-team.jpg');
  }, [cultureSec]);

  useEffect(() => {
    setTeamEyebrow(teamSec.subtitle || 'PEOPLE MAKE THE DIFFERENCE');
    setTeamTitle(teamSec.title || 'Meet the people behind the work.');
    setTeamDescription(teamSec.content?.description || 'Good projects begin with people who care about the details. Meet a few of the team members helping build a clearer picture of Bangladesh.');
    setFeaturedTeamIds(Array.isArray(teamSec.content?.featuredMemberIds) ? teamSec.content.featuredMemberIds : activeMembers.slice(0, 4).map((member) => member.id || member.slug!).filter(Boolean));
  }, [teamSec, teamMembers]);


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

      const res = await fetch('/api/media/upload', {
        method: 'POST',
        headers: { Authorization: getAuthHeaders().Authorization || '' },
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
    if (!slideHeading.trim() || !slideDesc.trim()) {
      triggerFeedback('Add a heading and description before saving the slide.', 'error');
      return;
    }
    if (slideMediaType === 'image' && !slideImageUrl.trim()) {
      triggerFeedback('Choose an image before saving this slide.', 'error');
      return;
    }
    if (slideMediaType === 'video' && !slideVideoUrl.trim()) {
      triggerFeedback('Upload a video before saving this slide.', 'error');
      return;
    }
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
        secondaryActionText: slideSecondaryText,
        secondaryActionHref: slideSecondaryHref,
        isActive: slideIsActive,
      };

      if (activeSlide.id && activeSlide.id !== 'temp') {
        payload.id = activeSlide.id;
      }

      const saved = await onSaveHeroSlide(payload);
      if (!saved) throw new Error('The hero slide could not be saved.');
      triggerFeedback(activeSlide.id === 'temp' ? 'Hero slide added.' : 'Hero slide saved.');
    } catch (err: any) {
      triggerFeedback(err.message || 'Failed to save hero slide', 'error');
    } finally {
      setSavingSection(false);
    }
  };

  const handleCreateNewSlide = () => {
    setSelectedSlideIndex(heroSlides.length);
    setSlideEyebrow('');
    setSlideHeading('');
    setSlideDesc('');
    setSlideImageUrl('');
    setSlideMediaType('image');
    setSlideVideoUrl('');
    setSlideBtnText('');
    setSlideBtnHref('');
    setSlideSecondaryText('');
    setSlideSecondaryHref('');
    setSlideIsActive(true);
    triggerFeedback('New slide draft opened. Add its content and save when ready.');
  };

  const handleSaveManifesto = async () => {
    setSavingSection(true);
    try {
      const saved = await onUpdateSection('home', 'manifesto', {
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
      triggerFeedback(saved ? 'Homepage introduction and partner logos saved.' : 'Could not save this homepage section.', saved ? 'success' : 'error');
    } finally {
      setSavingSection(false);
    }
  };

  const handleSaveShaping = async () => {
    setSavingSection(true);
    try {
      const saved = await onUpdateSection('home', 'shaping_future', {
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
      triggerFeedback(saved ? 'Homepage services section saved.' : 'Could not save this homepage section.', saved ? 'success' : 'error');
    } finally {
      setSavingSection(false);
    }
  };

  const handleSaveProjects = async () => {
    setSavingSection(true);
    try {
      const saved = await onUpdateSection('home', 'projects_summary', {
        title: projTitle,
        subtitle: projSubtitle,
        content: {
          kicker: projKicker,
          description: projDesc,
          btnText: projBtnText,
          btnHref: projBtnHref,
        },
      });
      triggerFeedback(saved ? 'Homepage projects section saved.' : 'Could not save this homepage section.', saved ? 'success' : 'error');
    } finally {
      setSavingSection(false);
    }
  };

  const handleSaveEquipment = async () => {
    setSavingSection(true);
    try {
      const saved = await onUpdateSection('home', 'equipment_summary', {
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
      triggerFeedback(saved ? 'Instruments and software section saved.' : 'Could not save this homepage section.', saved ? 'success' : 'error');
    } finally {
      setSavingSection(false);
    }
  };

  const handleSaveNews = async () => {
    setSavingSection(true);
    try {
      const saved = await onUpdateSection('home', 'news_summary', {
        title: newsTitle,
        subtitle: newsSubtitle,
        content: {
          mode: newsMode,
          selectedArticleIds,
          newsroomTitle,
        },
      });
      triggerFeedback(saved ? 'Homepage news section saved.' : 'Could not save this homepage section.', saved ? 'success' : 'error');
    } finally {
      setSavingSection(false);
    }
  };

  const handleSaveCulture = async () => {
    setSavingSection(true);
    try {
      const saved = await onUpdateSection('home', 'culture_summary', {
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
      triggerFeedback(saved ? 'Homepage careers section saved.' : 'Could not save this homepage section.', saved ? 'success' : 'error');
    } finally {
      setSavingSection(false);
    }
  };

  const handleSaveTeam = async () => {
    setSavingSection(true);
    try {
      const saved = await onUpdateSection('home', 'team_summary', {
        title: teamTitle,
        subtitle: teamEyebrow,
        content: { description: teamDescription, featuredMemberIds: featuredTeamIds.slice(0, 4) },
      });
      triggerFeedback(saved ? 'Homepage team section saved.' : 'Could not save the team section.', saved ? 'success' : 'error');
    } finally { setSavingSection(false); }
  };

  const activeProjectsCount = projects.filter((p) => p.isMilestone).length;
  const activeServicesCount = services.filter((s) => s.isActive).length;

  // Rendered Equipment Preview Items (custom selected or first 3)
  const displayedEquip =
    selectedEquipIds.length > 0
      ? equipment.filter((e) => selectedEquipIds.includes(e.id))
      : equipment.slice(0, 3);
  const sectionNames: Record<string, string> = {
    hero: 'Hero', manifesto: 'About', services: 'Services', projects: 'Projects',
    equipment: 'Equipment', team: 'Team', news: 'News', leadgrow: 'Careers',
  };
  const selectionDefinitions = {
    services: {
      title: 'Choose homepage services', description: 'Select the services shown in the homepage service section.',
      options: services.map((item) => ({ id: item.id, title: item.title, detail: item.category, image: item.imageUrl, selected: item.isActive })),
      toggle: (id: string) => { const item = services.find((entry) => entry.id === id); if (item) void onToggleServiceActive(id, !item.isActive); },
      clear: () => services.filter((item) => item.isActive).forEach((item) => void onToggleServiceActive(item.id, false)),
      maxSelected: undefined as number | undefined,
    },
    projects: {
      title: 'Choose homepage projects', description: 'Select the projects featured in the homepage project section.',
      options: projects.map((item) => ({ id: item.id, title: item.title, detail: [item.client, item.location].filter(Boolean).join(' · '), image: item.imageUrl, selected: item.isMilestone })),
      toggle: (id: string) => { const item = projects.find((entry) => entry.id === id); if (item) void onToggleProjectMilestone(id, !item.isMilestone); },
      clear: () => projects.filter((item) => item.isMilestone).forEach((item) => void onToggleProjectMilestone(item.id, false)),
      maxSelected: undefined as number | undefined,
    },
    equipment: {
      title: 'Choose equipment to feature', description: 'Pick the equipment cards displayed on the homepage.',
      options: equipment.map((item) => ({ id: item.id, title: item.name, detail: [item.category, item.quantity].filter(Boolean).join(' · '), image: item.imageUrl, selected: selectedEquipIds.includes(item.id) })),
      toggle: handleToggleEquipmentSelect,
      clear: () => setSelectedEquipIds([]),
      maxSelected: undefined as number | undefined,
    },
    team: {
      title: 'Choose featured team members', description: 'Select up to four active profiles for the homepage.',
      options: activeMembers.map((item) => ({ id: item.id || item.slug!, title: item.name, detail: item.role, image: item.image, selected: featuredTeamIds.includes(item.id || item.slug!) })),
      toggle: (id: string) => setFeaturedTeamIds((current) => current.includes(id) ? current.filter((value) => value !== id) : current.length < 4 ? [...current, id] : current),
      clear: () => setFeaturedTeamIds([]), maxSelected: 4,
    },
    articles: {
      title: 'Choose homepage articles', description: 'Select published articles for the homepage news list.',
      options: articles.filter((item) => item.isPublished).map((item) => ({ id: item.id, title: item.title, detail: item.category, image: item.imageUrl, selected: selectedArticleIds.includes(item.id) })),
      toggle: (id: string) => setSelectedArticleIds((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]),
      clear: () => setSelectedArticleIds([]),
      maxSelected: undefined as number | undefined,
    },
  };
  const activeSelection = selectionDialogType ? selectionDefinitions[selectionDialogType] : null;

  return (
    <div className={`gw-home-editor mx-auto max-w-[1720px] space-y-5 pb-12 font-sans ${panels.editor ? '' : 'editor-hidden'} ${panels.preview ? '' : 'preview-hidden'}`}>
      {activeSelection && selectionDialogType && <SelectionPicker
        title={activeSelection.title}
        description={activeSelection.description}
        options={activeSelection.options}
        onToggle={activeSelection.toggle}
        onClear={activeSelection.clear}
        onClose={() => setSelectionDialogType(null)}
        maxSelected={activeSelection.maxSelected}
      />}
      {/* =========================================================================
          TOP NAVIGATION TABS (8 SECTIONS CORRESPONDING TO HOMEPAGE FLOW)
          ========================================================================= */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="min-w-0"><p className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500">Editing homepage <span className="mx-1 text-slate-300">/</span> <span className="font-semibold text-blue-800">{sectionNames[activeSubSection]}</span></p><p className="mt-0.5 text-xs text-slate-500">Save changes in the section form below.</p></div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => setPanels((current) => current.editor && !current.preview ? current : { ...current, editor: !current.editor })} aria-expanded={panels.editor} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50">
            <PanelLeftClose size={14} />{panels.editor ? 'Hide editor' : 'Show editor'}
          </button>
          <button type="button" onClick={() => setPanels((current) => current.preview && !current.editor ? current : { ...current, preview: !current.preview })} aria-expanded={panels.preview} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50">
            {panels.preview ? <EyeOff size={14} /> : <Eye size={14} />}{panels.preview ? 'Hide preview' : 'Show preview'}
          </button>
          <button type="button" onClick={() => setLivePreviewOpen(true)} className="inline-flex items-center gap-2 rounded-lg bg-[#F4382D] px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-red-700">View full homepage <ArrowRight size={14} /></button>
        </div>
      </div>

      <nav aria-label="Homepage sections" role="tablist" className="gw-home-tabs flex items-center gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm">
        {[
          { key: 'hero', label: 'Hero', icon: Video },
          { key: 'manifesto', label: 'About', icon: Building2 },
          { key: 'services', label: 'Services', icon: Sliders },
          { key: 'projects', label: 'Projects', icon: FolderKanban },
          { key: 'equipment', label: 'Equipment', icon: Wrench },
          { key: 'team', label: 'Team', icon: Building2 },
          { key: 'news', label: 'News', icon: Newspaper },
          { key: 'leadgrow', label: 'Careers', icon: HeartHandshake },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeSubSection === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveSubSection(tab.key as any)}
              type="button"
              role="tab"
              aria-selected={isSelected}
              tabIndex={isSelected ? 0 : -1}
              aria-controls="homepage-section-editor"
              onKeyDown={(event) => {
                const tabs = Array.from(event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]') ?? []);
                const currentIndex = tabs.indexOf(event.currentTarget);
                const nextIndex = event.key === 'ArrowRight' ? (currentIndex + 1) % tabs.length
                  : event.key === 'ArrowLeft' ? (currentIndex - 1 + tabs.length) % tabs.length
                  : event.key === 'Home' ? 0
                  : event.key === 'End' ? tabs.length - 1
                  : -1;
                if (nextIndex >= 0) {
                  event.preventDefault();
                  tabs[nextIndex]?.focus();
                  tabs[nextIndex]?.click();
                }
              }}
              className={`flex min-h-[42px] shrink-0 items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition sm:flex-1 ${
                isSelected
                  ? 'bg-[#102A43] text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
              }`}
            >
              <Icon size={14} className={isSelected ? 'text-[#7FB3FF]' : 'text-slate-400'} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {livePreviewOpen && <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/70 p-3 sm:p-6">
        <div className="flex h-[min(92vh,1000px)] w-full max-w-[1500px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 sm:px-5">
            <div><h2 className="text-sm font-semibold text-slate-900">Homepage preview</h2><p className="text-xs text-slate-500">This is the actual public page. Save your edits, then refresh to see them here.</p></div>
            <div className="flex gap-2"><button type="button" onClick={() => setPreviewVersion((value) => value + 1)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">Refresh preview</button><button type="button" onClick={() => setLivePreviewOpen(false)} className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800">Close</button></div>
          </div>
          <iframe key={previewVersion} title="Actual public homepage preview" src={`${process.env.NEXT_PUBLIC_SITE_PREVIEW_URL || 'http://localhost:3001'}/#${({ hero: 'homepage-hero', manifesto: 'homepage-about', services: 'homepage-services', projects: 'homepage-projects', equipment: 'homepage-equipment', team: 'homepage-team', news: 'homepage-news', leadgrow: 'homepage-careers' } as Record<string, string>)[activeSubSection]}`} className="min-h-0 flex-1 border-0 bg-white" />
        </div>
      </div>}

      {/* =========================================================================
          1. HERO CINEMA: (FORM LEFT, 16:9 LIVE PREVIEW RIGHT)
          ========================================================================= */}
      {activeSubSection === 'hero' && (
        <div id="homepage-section-editor" className="gw-section-grid grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* LEFT 5 COLS: DATA FORM */}
          <div className="gw-editor-panel lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Hero slides</h3>
                <p className="text-[11px] text-slate-500">Edit the main image, heading, and buttons.</p>
              </div>
              <button
                onClick={handleSaveActiveSlide}
                disabled={savingSection}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1D5EC8] hover:bg-[#164EA8] text-white text-xs font-bold transition cursor-pointer shadow-xs disabled:opacity-50"
              >
                <Save size={13} />
                <span>{savingSection ? 'Saving...' : 'Save Slide'}</span>
              </button>
            </div>

            {/* Slide Selector Pills */}
            {slideMediaType === 'video' ? (
              <div className="flex items-center justify-between p-2.5 bg-blue-50/70 rounded-xl border border-blue-200">
                <div className="flex items-center gap-2">
                  <Video size={14} className="text-[#1D5EC8]" />
                  <span className="text-xs font-semibold text-blue-900">Video slide</span>
                </div>
                  <span className="text-[10px] font-medium text-slate-600 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                  One video slide at a time
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
                          ? 'bg-[#1D5EC8] text-white shadow-xs'
                          : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                      }`}
                    >
                      Slide {idx + 1}
                    </button>
                  ))}
                  {selectedSlideIndex >= heroSlides.length && (
                    <span className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">New draft</span>
                  )}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    type="button"
                    onClick={handleCreateNewSlide}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#1D5EC8] hover:bg-[#164EA8] text-white text-xs font-bold transition"
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
                          if (window.confirm('Delete this hero slide? This cannot be undone.')) {
                            onDeleteHeroSlide(activeSlide.id);
                          }
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
              <label className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700">
                <span>Show this slide on the website</span>
                <input type="checkbox" checked={slideIsActive} onChange={(e) => setSlideIsActive(e.target.checked)} className="h-4 w-4 accent-blue-600" />
              </label>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Small heading</label>
                <input
                  type="text"
                  value={slideEyebrow}
                  onChange={(e) => setSlideEyebrow(e.target.value)}
                  placeholder="GEOSPATIAL WORKS BANGLADESH"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-red-600 focus:bg-white focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Heading</label>
                <input
                  type="text"
                  value={slideHeading}
                  onChange={(e) => setSlideHeading(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-500 uppercase tracking-tight"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={slideDesc}
                  onChange={(e) => setSlideDesc(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 leading-relaxed focus:bg-white focus:border-blue-500"
                />
              </div>

              {/* Media Type & Upload */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">Slide image or video</span>
                  <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200 text-xs">
                    <button
                      type="button"
                      onClick={() => setSlideMediaType('image')}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-bold transition cursor-pointer ${
                        slideMediaType === 'image' ? 'bg-[#1D5EC8] text-white' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <ImageIcon size={12} />
                      <span>Image</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSlideMediaType('video')}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-bold transition cursor-pointer ${
                        slideMediaType === 'video' ? 'bg-[#1D5EC8] text-white' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Video size={12} />
                      <span>Video</span>
                    </button>
                  </div>
                </div>

                {slideMediaType === 'image' ? (
                  <MediaAssetField label="Hero image" value={slideImageUrl} onChoose={() => onOpenMediaPicker(setSlideImageUrl)} onRemove={() => setSlideImageUrl('')} />
                ) : (
                  <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 sm:flex-row sm:items-center">
                    <div className="grid aspect-video w-full place-items-center overflow-hidden rounded-lg bg-slate-950 text-slate-300 sm:w-40">
                      {slideVideoUrl ? <video src={slideVideoUrl} muted playsInline className="h-full w-full object-cover" /> : <Video size={22} />}
                    </div>
                    <div className="flex-1"><p className="text-sm font-medium text-slate-800">{slideVideoUrl ? 'Video selected' : 'No video selected'}</p><p className="mt-1 text-xs text-slate-500">Upload an MP4 or WebM file for this hero slide.</p><label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#1D5EC8] px-3 py-2 text-xs font-semibold text-white hover:bg-[#164ea8]">{uploadingHeroMedia ? 'Uploading…' : slideVideoUrl ? 'Replace video' : 'Choose video'}<input type="file" accept="video/mp4,video/webm,video/quicktime" onChange={(e) => handleMediaUpload(e, 'hero')} className="sr-only" disabled={uploadingHeroMedia} /></label></div>
                  </div>
                )}
              </div>

              {/* Action Button Details */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Main button text</label>
                  <input
                    type="text"
                    value={slideBtnText}
                    onChange={(e) => setSlideBtnText(e.target.value)}
                    placeholder="Explore our services"
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Main button page</label>
                  <PageSelect value={slideBtnHref} onChange={setSlideBtnHref} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Second Button Text</label>
                  <input type="text" value={slideSecondaryText} onChange={(e) => setSlideSecondaryText(e.target.value)} placeholder="Optional" className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Second Button Link</label>
                  <PageSelect value={slideSecondaryHref} onChange={setSlideSecondaryHref} />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT 7 COLS: 16:9 LIVE CINEMATIC DESKTOP PREVIEW */}
          <div className="gw-preview-panel lg:col-span-7 sticky top-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 px-1">
              <div className="flex items-center gap-1.5">
                <Monitor size={15} className="text-[#1D5EC8]" />
                <span>Hero preview</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Updates as you edit
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
        <div id="homepage-section-editor" className="gw-section-grid grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* LEFT 5 COLS: DATA FORM */}
          <div className="gw-editor-panel lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-semibold text-slate-950">About and partners</h3>
                <p className="text-xs text-slate-500">Edit the introduction, key numbers, and partner logos.</p>
              </div>
              <button
                onClick={handleSaveManifesto}
                disabled={savingSection}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1D5EC8] hover:bg-[#164EA8] text-white text-xs font-bold transition cursor-pointer shadow-xs disabled:opacity-50"
              >
                <Save size={13} />
                <span>{savingSection ? 'Saving...' : 'Save Section'}</span>
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-blue-800 mb-1">Small heading (blue)</label>
                  <input
                    type="text"
                    value={manEyebrowBlue}
                    onChange={(e) => setManEyebrowBlue(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-xl text-sm font-semibold text-slate-950"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-red-700 mb-1">Small heading (red)</label>
                  <input
                    type="text"
                    value={manEyebrowRed}
                    onChange={(e) => setManEyebrowRed(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-xl text-sm font-semibold text-slate-950"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Main heading</label>
                <textarea
                  rows={3}
                  value={manStatement}
                  onChange={(e) => setManStatement(e.target.value)}
                  className="w-full p-3 bg-slate-100 border border-slate-300 rounded-xl text-sm font-semibold text-slate-950 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Introduction text</label>
                <textarea
                  rows={3}
                  value={manSubtext}
                  onChange={(e) => setManSubtext(e.target.value)}
                  className="w-full p-3 bg-slate-100 border border-slate-300 rounded-xl text-sm text-slate-950 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Button label</label>
                  <input
                    type="text"
                    value={manBtnText}
                    onChange={(e) => setManBtnText(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-xl text-sm font-semibold text-slate-950"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Button destination</label>
                  <PageSelect value={manBtnHref} onChange={setManBtnHref} />
                </div>
              </div>

              {/* Metric 1 & Metric 2 Inputs */}
              <details className="gw-edit-group">
                <summary><span>Homepage figures</span><span className="gw-edit-group-hint">Area surveyed · projects completed</span></summary>
                <div className="mt-3 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="rounded-lg border border-slate-200 bg-white p-3">
                  <h4 className="mb-2 text-xs font-semibold text-slate-900">Area surveyed</h4>
                  <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Value</label>
                    <input
                      type="text"
                      value={manMetric1Val}
                      onChange={(e) => setManMetric1Val(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-sm font-bold text-slate-950"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Unit</label>
                    <input
                      type="text"
                      value={manMetric1Unit}
                      onChange={(e) => setManMetric1Unit(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-sm font-medium text-slate-950"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Heading</label>
                    <input
                      type="text"
                      value={manMetric1Label}
                      onChange={(e) => setManMetric1Label(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-sm text-slate-950"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Supporting line</label>
                    <input type="text" value={manMetric1Sub} onChange={(e) => setManMetric1Sub(e.target.value)} className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-sm text-slate-950" />
                  </div>
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-3">
                  <h4 className="mb-2 text-xs font-semibold text-slate-900">Projects completed</h4>
                  <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Value</label>
                    <input
                      type="text"
                      value={manMetric2Val}
                      onChange={(e) => setManMetric2Val(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-sm font-bold text-slate-950"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Heading</label>
                    <input
                      type="text"
                      value={manMetric2Label}
                      onChange={(e) => setManMetric2Label(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-sm text-slate-950"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-slate-700 mb-1">Supporting line</label>
                    <input type="text" value={manMetric2Sub} onChange={(e) => setManMetric2Sub(e.target.value)} className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-sm text-slate-950" />
                  </div>
                  </div>
                </div>
                </div>
              </details>

              {/* Trusted Institutional Partners Manager */}
              <details className="gw-edit-group">
                <summary><span>Partner logos</span><span className="gw-edit-group-hint">{partnersList.length} partners</span></summary>
                <div className="mt-3 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs text-slate-500">Names, short labels, and logos shown on the homepage.</p>
                  <button
                    type="button"
                    onClick={handleAddPartner}
                    className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-[11px] font-bold transition cursor-pointer"
                  >
                    <Plus size={12} />
                    <span>Add Partner</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {partnersList.map((partner, idx) => (
                    <details key={idx} className="gw-edit-group p-2.5">
                      <summary><span className="truncate">{partner.name || `New partner ${idx + 1}`}</span><span className="gw-edit-group-hint">{partner.logo ? 'Logo added' : 'Logo needed'}</span></summary>
                      <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-end">
                        <button
                          type="button"
                          onClick={() => handleRemovePartner(idx)}
                          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-slate-600 hover:bg-red-50 hover:text-red-700"
                        >
                          <Trash2 size={13} /> Remove partner
                        </button>
                      </div>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <label className="block text-xs font-semibold text-slate-700">Organization name
                        <input
                          type="text"
                          value={partner.name}
                          onChange={(e) => handleUpdatePartner(idx, 'name', e.target.value)}
                          placeholder="For example: Dhaka North City Corporation"
                          className="mt-1 w-full rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-sm font-medium text-slate-950"
                        />
                        </label>
                        <label className="block text-xs font-semibold text-slate-700">Short name
                        <input
                          type="text"
                          value={partner.short}
                          onChange={(e) => handleUpdatePartner(idx, 'short', e.target.value)}
                          placeholder="For example: DNCC"
                          className="mt-1 w-full rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-sm font-medium text-slate-950"
                        />
                        </label>
                      </div>
                      <label className="block text-xs font-semibold text-slate-700">Small line under the name
                        <input
                          type="text"
                          value={partner.subtext}
                          onChange={(e) => handleUpdatePartner(idx, 'subtext', e.target.value)}
                          placeholder="For example: City Corporation"
                          className="mt-1 w-full rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-sm text-slate-950"
                        />
                      </label>
                      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                        <div className="flex h-12 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-slate-300 bg-white p-2">
                          {partner.logo ? <img src={partner.logo} alt={`${partner.name || 'Partner'} logo preview`} className="h-full w-full object-contain" /> : <span className="text-center text-[10px] font-medium text-slate-500">No logo selected</span>}
                        </div>
                        <button
                          type="button"
                          onClick={() => onOpenMediaPicker((url) => handleUpdatePartner(idx, 'logo', url))}
                          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 hover:border-blue-400 hover:text-blue-800"
                        >
                          {partner.logo ? 'Change logo' : 'Choose from library'}
                        </button>
                      </div>
                      </div>
                    </details>
                  ))}
                </div>
                </div>
              </details>
            </div>
          </div>

          {/* RIGHT 7 COLS: LIVE MANIFESTO PREVIEW */}
          <div className="gw-preview-panel lg:col-span-7 sticky top-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 px-1">
              <div className="flex items-center gap-1.5">
                <Monitor size={15} className="text-[#1D5EC8]" />
                <span>About preview</span>
              </div>
              <span className="text-[11px] text-slate-400">Desktop preview</span>
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
        <div id="homepage-section-editor" className="gw-section-grid grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* LEFT 5 COLS: DATA FORM */}
          <div className="gw-editor-panel lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Services Track Narrative</h3>
                <p className="text-[11px] text-slate-400">Configure horizontal service cards, header, and active items.</p>
              </div>
              <button
                onClick={handleSaveShaping}
                disabled={savingSection}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1D5EC8] hover:bg-[#164EA8] text-white text-xs font-bold transition cursor-pointer shadow-xs disabled:opacity-50"
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

            <div className="border-t border-slate-200 pt-4">
              <SelectionLauncher
                label="Services shown on homepage"
                selected={activeServicesCount}
                summary={services.filter((item) => item.isActive).slice(0, 3).map((item) => item.title).join(' · ') || 'No services selected'}
                onClick={() => setSelectionDialogType('services')}
              />
            </div>
          </div>

          {/* RIGHT 7 COLS: LIVE SERVICES TRACK PREVIEW */}
          <div className="gw-preview-panel lg:col-span-7 sticky top-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 px-1">
              <div className="flex items-center gap-1.5">
                <Monitor size={15} className="text-[#1D5EC8]" />
                <span>Services preview</span>
              </div>
              <span className="text-[11px] text-slate-400">Desktop preview</span>
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
        <div id="homepage-section-editor" className="gw-section-grid grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* LEFT 5 COLS: DATA FORM */}
          <div className="gw-editor-panel lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Landmarks Showcase Setup</h3>
                <p className="text-[11px] text-slate-400">Featured carousel with luminous corner glow blooms.</p>
              </div>
              <button
                onClick={handleSaveProjects}
                disabled={savingSection}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1D5EC8] hover:bg-[#164EA8] text-white text-xs font-bold transition cursor-pointer shadow-xs disabled:opacity-50"
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

            <div className="border-t border-slate-200 pt-4">
              <SelectionLauncher
                label="Projects shown on homepage"
                selected={activeProjectsCount}
                summary={projects.filter((item) => item.isMilestone).slice(0, 3).map((item) => item.title).join(' · ') || 'No projects selected'}
                onClick={() => setSelectionDialogType('projects')}
              />
            </div>
          </div>

          {/* RIGHT 7 COLS: LIVE PROJECTS SHOWCASE PREVIEW */}
          <div className="gw-preview-panel lg:col-span-7 sticky top-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 px-1">
              <div className="flex items-center gap-1.5">
                <Monitor size={15} className="text-[#1D5EC8]" />
                <span>Projects preview</span>
              </div>
              <span className="text-[11px] text-slate-400">Desktop preview</span>
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
        <div id="homepage-section-editor" className="gw-section-grid grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* LEFT 5 COLS: DATA FORM */}
          <div className="gw-editor-panel lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Hardware Fleet, Nodes &amp; Software</h3>
                <p className="text-[11px] text-slate-400">Edit physical sensors, computational nodes &amp; software suite.</p>
              </div>
              <button
                onClick={handleSaveEquipment}
                disabled={savingSection}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1D5EC8] hover:bg-[#164EA8] text-white text-xs font-bold transition cursor-pointer shadow-xs disabled:opacity-50"
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
                    <Cpu size={14} className="text-[#1D5EC8]" />
                    <span>Processing Workstation Nodes ({workstations.length})</span>
                  </span>
                  <span className="text-[10px] text-slate-400">Add, edit specs, or remove nodes live</span>
                </div>
                <button
                  type="button"
                  onClick={handleAddWorkstation}
                  className="flex items-center gap-1 px-2.5 py-1 bg-[#1D5EC8] hover:bg-[#164EA8] text-white text-[11px] font-bold rounded-lg transition cursor-pointer"
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

            {/* Choose equipment in a searchable dialog so the editor stays compact. */}
            <div className="rounded-xl border border-slate-200 bg-white p-3.5">
              <SelectionLauncher
                label="Equipment shown on homepage"
                selected={selectedEquipIds.length}
                summary={equipment.filter((item) => selectedEquipIds.includes(item.id)).slice(0, 3).map((item) => item.name).join(' · ') || 'Choose equipment cards to feature'}
                onClick={() => setSelectionDialogType('equipment')}
              />
            </div>

            {/* 3. SOFTWARE LOGOS & SUITE: ADD / REMOVE / EDIT */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Layers size={14} className="text-[#1D5EC8]" />
                    <span>Software logos &amp; details ({softwareList.length})</span>
                  </span>
                  <span className="text-[11px] text-slate-600">Manage the tools shown on the homepage and equipment page.</span>
                </div>
                <button
                  type="button"
                  onClick={handleAddSoftware}
                  className="flex items-center gap-1 px-2.5 py-1 bg-[#1D5EC8] hover:bg-[#164EA8] text-white text-[11px] font-bold rounded-lg transition cursor-pointer"
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
                        placeholder="Software name"
                        aria-label="Software name"
                        className="flex-1 px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-sm font-semibold text-slate-950"
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
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                        <input
                          type="text"
                          value={sw.category}
                          onChange={(e) => handleUpdateSoftware(idx, 'category', e.target.value)}
                          placeholder="For example: Mapping"
                          className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-sm text-slate-950"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Publisher or edition</label>
                        <input
                          type="text"
                          value={sw.badge}
                          onChange={(e) => handleUpdateSoftware(idx, 'badge', e.target.value)}
                          placeholder="For example: Esri"
                          className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-sm text-slate-950"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">What the team uses it for</label>
                      <textarea
                        rows={2}
                        value={sw.description || ''}
                        onChange={(e) => handleUpdateSoftware(idx, 'description', e.target.value)}
                        placeholder="Explain in plain language how this tool is used."
                        className="w-full resize-y px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-sm text-slate-950"
                      />
                    </div>
                    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <div className="flex h-14 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md border border-slate-300 bg-white p-2">
                        {sw.logo ? <img src={sw.logo} alt={`${sw.name || 'Software'} logo preview`} className="h-full w-full object-contain" /> : <span className="text-center text-[10px] font-medium text-slate-500">No logo selected</span>}
                      </div>
                      <div className="min-w-0 flex-1"><span className="block text-xs font-semibold text-slate-800">Software logo</span><span className="mt-0.5 block text-xs text-slate-600">Choose a logo from the media library. The preview appears here.</span></div>
                      <button
                        type="button"
                        onClick={() => onOpenMediaPicker((url) => handleUpdateSoftware(idx, 'logo', url))}
                        className="shrink-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 hover:border-blue-400 hover:text-blue-800"
                      >
                        {sw.logo ? 'Change logo' : 'Choose from library'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT 7 COLS: LIVE EQUIPMENT, NODES & SOFTWARE PREVIEW */}
          <div className="gw-preview-panel lg:col-span-7 sticky top-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 px-1">
              <div className="flex items-center gap-1.5">
                <Monitor size={15} className="text-[#1D5EC8]" />
                <span>Equipment preview</span>
              </div>
              <span className="text-[11px] text-slate-400">Desktop preview</span>
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

      {activeSubSection === 'team' && (
        <div id="homepage-section-editor" className="gw-section-grid grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(360px,1.1fr)]">
          <section className="gw-editor-panel rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">Homepage team section</p>
                <h2 className="mt-1 text-lg font-semibold text-slate-950">Choose the people visitors see</h2>
                <p className="mt-1 text-sm text-slate-500">Profiles and photos are managed in Team.</p>
              </div>
              <button type="button" onClick={handleSaveTeam} disabled={savingSection} className="shrink-0 rounded-lg bg-[#F4382D] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60">{savingSection ? 'Saving…' : 'Save section'}</button>
            </div>
            <div className="mt-5 space-y-4">
              <label className="block text-sm font-medium text-slate-700">Small heading<input value={teamEyebrow} onChange={(event) => setTeamEyebrow(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></label>
              <label className="block text-sm font-medium text-slate-700">Main heading<input value={teamTitle} onChange={(event) => setTeamTitle(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></label>
              <label className="block text-sm font-medium text-slate-700">Short description<textarea rows={3} value={teamDescription} onChange={(event) => setTeamDescription(event.target.value)} className="mt-1.5 w-full resize-y rounded-lg border border-slate-200 px-3 py-2.5 text-sm leading-6 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></label>
              <div>
                <SelectionLauncher
                  label="Featured team members (up to 4)"
                  selected={featuredTeamIds.length}
                  summary={activeMembers.filter((member) => featuredTeamIds.includes(member.id || member.slug || '')).map((member) => member.name).join(' · ') || 'Choose active profiles to feature'}
                  onClick={() => setSelectionDialogType('team')}
                />
              </div>
            </div>
          </section>
          <section className="gw-preview-panel rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Preview</p>
            <h3 className="mt-1 text-lg font-semibold text-slate-950">{teamTitle}</h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{teamDescription}</p>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {activeMembers.filter((member) => featuredTeamIds.includes(member.id || member.slug || '')).map((member) => <div key={member.id || member.slug} className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                {member.image ? <img src={member.image} alt={member.name} className="aspect-[4/5] w-full object-cover object-top" /> : <div className="flex aspect-[4/5] items-center justify-center text-xl font-semibold text-blue-700">{member.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('')}</div>}
                <div className="p-2.5"><p className="truncate text-xs font-semibold text-slate-900">{member.name}</p><p className="mt-0.5 truncate text-[11px] text-slate-500">{member.role}</p></div>
              </div>)}
            </div>
          </section>
        </div>
      )}

      {/* =========================================================================
          6. NEWS & BULLETINS: (FORM LEFT, LIVE PREVIEW RIGHT)
          ========================================================================= */}
      {activeSubSection === 'news' && (
        <div id="homepage-section-editor" className="gw-section-grid grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* LEFT 5 COLS: DATA FORM */}
          <div className="gw-editor-panel lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">News &amp; Bulletins Setup</h3>
                <p className="text-[11px] text-slate-400">Configure visual article cards and interactive news list.</p>
              </div>
              <button
                onClick={handleSaveNews}
                disabled={savingSection}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1D5EC8] hover:bg-[#164EA8] text-white text-xs font-bold transition cursor-pointer shadow-xs disabled:opacity-50"
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
                        ? 'bg-[#1D5EC8] text-white shadow-xs'
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
                        ? 'bg-[#1D5EC8] text-white shadow-xs'
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
              <div className="border-t border-slate-200 pt-4">
                <SelectionLauncher
                  label="Articles shown on homepage"
                  selected={selectedArticleIds.length}
                  summary={articles.filter((item) => selectedArticleIds.includes(item.id)).slice(0, 3).map((item) => item.title).join(' · ') || 'Choose published articles'}
                  onClick={() => setSelectionDialogType('articles')}
                />
              </div>
            )}
          </div>

          {/* RIGHT 7 COLS: LIVE NEWS & BULLETINS PREVIEW */}
          <div className="gw-preview-panel lg:col-span-7 sticky top-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 px-1">
              <div className="flex items-center gap-1.5">
                <Monitor size={15} className="text-[#1D5EC8]" />
                <span>News preview</span>
              </div>
              <span className="text-[11px] text-slate-400">Desktop preview</span>
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
                  {(newsMode === 'manual' ? articles.filter((art) => selectedArticleIds.includes(art.id)) : articles.filter((art) => art.isPublished)).slice(0, 3).map((art, idx) => (
                    <div key={idx} className="group border border-white/10 rounded-lg overflow-hidden bg-neutral-950">
                      <div className="aspect-[16/10] relative bg-neutral-900">
                        {art.imageUrl ? <img src={art.imageUrl} alt="" className="w-full h-full object-cover" /> : <span className="flex h-full items-center justify-center p-2 text-center text-xs text-white">{art.title}</span>}
                        <span className={`absolute top-2 left-2 text-[8px] font-mono font-bold uppercase px-1.5 py-0.5 text-white ${idx % 2 === 0 ? 'bg-[#3B82F6]' : 'bg-[#FB1D10]'}`}>
                          {art.category}
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
                  {articles.filter((art) => art.isPublished).slice(3, 5).map((item, idx) => (
                    <div key={idx} className="py-2.5 flex items-baseline justify-between gap-3">
                      <div className="flex items-baseline gap-3">
                        <span className={`font-mono text-[11px] font-bold ${idx % 2 === 0 ? 'text-[#3B82F6]' : 'text-[#FB1D10]'}`}>{item.publishDate}</span>
                        <div>
                          <span className="text-[9px] font-bold text-neutral-400 uppercase block">{item.category}</span>
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
        <div id="homepage-section-editor" className="gw-section-grid grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* LEFT 5 COLS: DATA FORM */}
          <div className="gw-editor-panel lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Lead &amp; Grow (Careers) Setup</h3>
                <p className="text-[11px] text-slate-400">Configure portrait, culture narrative, and career action buttons.</p>
              </div>
              <button
                onClick={handleSaveCulture}
                disabled={savingSection}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1D5EC8] hover:bg-[#164EA8] text-white text-xs font-bold transition cursor-pointer shadow-xs disabled:opacity-50"
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

              <MediaAssetField label="Careers section image" value={cultureImageUrl} onChoose={() => onOpenMediaPicker(setCultureImageUrl)} onRemove={() => setCultureImageUrl('')} />

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
          <div className="gw-preview-panel lg:col-span-7 sticky top-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 px-1">
              <div className="flex items-center gap-1.5">
                <Monitor size={15} className="text-[#1D5EC8]" />
                <span>Careers preview</span>
              </div>
              <span className="text-[11px] text-slate-400">Desktop preview</span>
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
