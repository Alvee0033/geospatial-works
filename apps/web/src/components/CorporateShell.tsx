'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChevronRight,
  ChevronDown,
  Search,
  X,
  Menu,
  Globe,
  ArrowRight,
  Check,
  Hash,
  MapPin,
  Sparkles,
  CornerDownLeft
} from 'lucide-react';

type MenuKey = 'who-we-are' | 'what-we-do' | 'insights' | 'careers' | 'projects' | 'news' | 'innovators' | null;

interface MegaMenuItem {
  label: string;
  href: string;
  hasArrow?: boolean;
}

interface MegaMenuContent {
  leadHeading: string;
  leadSubtext: string;
  leadLinkText?: string;
  leadLinkHref?: string;
  showViewAll?: boolean;
  categoryTitle: string;
  items: MegaMenuItem[];
  featuredLabel: string;
  featuredTitle: string;
  featuredDesc: string;
  featuredImage: string;
  featuredHref: string;
}

const megaMenuData: Record<string, MegaMenuContent> = {
  'who-we-are': {
    leadHeading: 'We are the home of ambitious, passionate, and innovative geospatial engineering experts and spatial advisors.',
    leadSubtext: 'Geospatial Works exists to bring clarity to complex land, river, and urban infrastructure across Bangladesh.',
    leadLinkText: 'Find out more',
    leadLinkHref: '/about/our-story',
    categoryTitle: 'Who we are',
    items: [
      { label: 'Our Story & Purpose', href: '/about/our-story', hasArrow: true },
      { label: 'Future Ready Geodesy', href: '/about/future-ready', hasArrow: true },
      { label: 'Corporate Responsibility & Safety', href: '/about/corporate-responsibility', hasArrow: true },
      { label: 'Leadership & Senior Surveyors', href: '/team', hasArrow: true },
      { label: 'Our National Impact', href: '/projects', hasArrow: true },
      { label: 'Quality Standards & SOB Compliance', href: '/about/standards', hasArrow: true },
    ],
    featuredLabel: 'Featured content',
    featuredTitle: 'Explore Geospatial Works in numbers',
    featuredDesc: 'Over 1,500+ km² mapped, 35+ national infrastructure landmarks, and full geodetic datum compliance across Bangladesh.',
    featuredImage: '/real-media/hero-corridor-infrastructure.jpg',
    featuredHref: '/about/our-story',
  },
  'what-we-do': {
    leadHeading: 'We work together with clients to plan, design, create and deliver innovative projects that shape Bangladesh.',
    leadSubtext: 'Delivering end-to-end engineering surveys, airborne LiDAR, and GIS digital twins for national infrastructure.',
    showViewAll: true,
    categoryTitle: 'What we do',
    items: [
      { label: 'Overview', href: '/services' },
      { label: 'Topographic & Geodetic Survey', href: '/services/topographic-survey', hasArrow: true },
      { label: 'Airborne UAV (Drone) & LiDAR', href: '/services/uav-mapping', hasArrow: true },
      { label: 'Enterprise GIS & Digital Twins', href: '/services/gis-solutions', hasArrow: true },
      { label: 'Hydrographic & Bathymetric Sounding', href: '/services/bathymetric-survey', hasArrow: true },
      { label: 'Mouza & Boundary Verification', href: '/services/boundary-survey', hasArrow: true },
      { label: 'Subsurface Utility Engineering (SUE)', href: '/services/subsurface-utility', hasArrow: true },
    ],
    featuredLabel: 'Featured capability',
    featuredTitle: 'Supercharge tomorrow with LiDAR analytics',
    featuredDesc: 'High-density aerial point clouds and terrain analytics accelerating national transport corridors and flood resilience.',
    featuredImage: '/geospatial-river-hero.webp',
    featuredHref: '/services',
  },
  'insights': {
    leadHeading: 'Our geospatial specialists offer compelling technical insights that provide new perspectives.',
    leadSubtext: 'Read research papers, field notes, and case studies reframing river delta resilience, geodetic datums, and smart urban digital twins.',
    leadLinkText: 'View all news & insights',
    leadLinkHref: '/insights',
    categoryTitle: 'Insights & Technical Bulletins',
    items: [
      { label: 'Overview', href: '/insights' },
      { label: 'River Delta Resilience & Bathymetry', href: '/insights/river-delta-resilience-bathymetry', hasArrow: true },
      { label: 'Urban Digital Twins & Smart WASA', href: '/insights/dhaka-wasa-smart-utility-digital-twin', hasArrow: true },
      { label: 'Sub-centimeter RTK Geodesy', href: '/insights/rtk-gnss-national-corridor-geodesy', hasArrow: true },
      { label: 'High-Density LiDAR Technical Bulletins', href: '/insights/high-density-uav-lidar-flood-defenses', hasArrow: true },
      { label: 'Ground Penetrating Radar Case Studies', href: '/insights/ground-penetrating-radar-urban-expressway', hasArrow: true },
      { label: 'Coastal Erosion Drone Orthomosaics', href: '/insights/coastal-erosion-drone-orthomosaics', hasArrow: true },
    ],
    featuredLabel: 'Featured Article',
    featuredTitle: 'Surveyor Voices & Field Innovation',
    featuredDesc: 'Where practical field engineering know-how meets modern photogrammetric analytics and cloud GIS infrastructure.',
    featuredImage: '/real-media/service-topographic-uav.png',
    featuredHref: '/insights/river-delta-resilience-bathymetry',
  },
  'careers': {
    leadHeading: 'What if you could do the kind of work Bangladesh truly needs?',
    leadSubtext: 'With us, you can. Make your best impact with Geospatial Works, where the culture, cutting-edge survey equipment, and mission align.',
    leadLinkText: 'Find out more',
    leadLinkHref: '/career',
    categoryTitle: 'Careers',
    items: [
      { label: 'Overview', href: '/career' },
      { label: 'Job opportunities & open roles', href: '/career#open-roles', hasArrow: true },
      { label: 'Early career & graduate surveyors', href: '/career#graduates', hasArrow: true },
      { label: 'Licensed surveyors & GIS modelers', href: '/career#experienced', hasArrow: true },
      { label: 'Life at Geospatial Works', href: '/career#culture', hasArrow: true },
    ],
    featuredLabel: 'Featured content',
    featuredTitle: 'Why join our team?',
    featuredDesc: 'You will find the space, modern drone fleet, and mentorship to think bigger and build a career that’s right for you.',
    featuredImage: '/real-media/project-badc-web-ais-khulna.jpg',
    featuredHref: '/career',
  },
  'projects': {
    leadHeading: 'Pioneering projects delivering measurable impact across all divisions of Bangladesh.',
    leadSubtext: 'Explore our verified portfolio of engineering surveys, river training hydrography, and smart city digital twins.',
    leadLinkText: 'View all projects',
    leadLinkHref: '/projects',
    showViewAll: true,
    categoryTitle: 'Key Sectors & Contracts',
    items: [
      { label: 'All Projects (35+)', href: '/projects' },
      { label: 'Water & River Delta Infrastructure', href: '/projects?sector=Water', hasArrow: true },
      { label: 'Highways & Elevated Corridors', href: '/projects?sector=Transport', hasArrow: true },
      { label: 'Municipal Water Networks & Digital Twins', href: '/projects?sector=GIS', hasArrow: true },
      { label: 'Floodplain Topography & Embankments', href: '/projects?sector=Topographic', hasArrow: true },
      { label: 'Subsurface Utility Corridors', href: '/projects?sector=Utility', hasArrow: true },
    ],
    featuredLabel: 'Featured Project',
    featuredTitle: 'Dhaka WASA Water Supply Network Geodatabase',
    featuredDesc: 'Comprehensive subsurface pipeline mapping and GIS database integration for over 450 km of municipal distribution lines.',
    featuredImage: '/hero-poster.jpg',
    featuredHref: '/projects/badc-web-ais-pilot-project',
  },
  'news': {
    leadHeading: 'Stay updated with Geospatial Works field milestones, contract awards, and engineering press releases.',
    leadSubtext: 'Official releases from our Dhaka headquarters and field teams across Bangladesh.',
    leadLinkText: 'View all news',
    leadLinkHref: '/insights',
    categoryTitle: 'News & Press Releases',
    items: [
      { label: 'Latest News & Field Milestones', href: '/insights?tab=press', hasArrow: true },
      { label: 'Contract Signings & Partnerships', href: '/insights?tab=contracts', hasArrow: true },
      { label: 'Technical Bulletins & Whitepapers', href: '/insights?tab=bulletins', hasArrow: true },
      { label: 'Events, Seminars & Workshops', href: '/insights?tab=events', hasArrow: true },
    ],
    featuredLabel: 'Latest News',
    featuredTitle: 'Transforming Municipal Infrastructure into Digital Twins',
    featuredDesc: 'Geospatial Works delivers full-scale PostGIS database and hydraulic integration for metropolitan authorities.',
    featuredImage: '/delta-hero-v2.webp',
    featuredHref: '/insights/dhaka-wasa-smart-utility-digital-twin',
  },
  'innovators': {
    leadHeading: 'Meet the surveyors, drone pilots, and GIS software architects behind our precision work.',
    leadSubtext: 'Our multidisciplinary team brings deep field experience, certified surveying credentials, and technical passion to every assignment.',
    leadLinkText: 'Meet all innovators',
    leadLinkHref: '/team',
    categoryTitle: 'Our Team & Leadership',
    items: [
      { label: 'Overview & Executive Spotlight', href: '/team' },
      { label: 'Leadership & Executive Management', href: '/team#leadership', hasArrow: true },
      { label: 'Senior Geodetic Surveyors', href: '/team#surveyors', hasArrow: true },
      { label: 'Airborne UAV & LiDAR Flight Operators', href: '/team#uav', hasArrow: true },
      { label: 'GIS & Remote Sensing Analysts', href: '/team#gis', hasArrow: true },
      { label: 'Hydrographic & Bathymetric Specialists', href: '/team#hydro', hasArrow: true },
      { label: 'Subsurface Utility (GPR) Engineers', href: '/team#utility', hasArrow: true },
    ],
    featuredLabel: 'Featured Innovator',
    featuredTitle: 'Field Leadership in Action',
    featuredDesc: 'Guiding cross-functional teams in challenging delta floodplains, dense urban centers, and remote coastal estuaries.',
    featuredImage: '/real-media/career-engineering-team.jpg',
    featuredHref: '/team',
  },
};

export default function CorporateShell({ children }: { children: React.ReactNode }) {
  const [activeMenu, setActiveMenu] = useState<MenuKey>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [langOpen, setLangOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState<'EN' | 'FR' | 'BN'>('EN');
  const [articles, setArticles] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  // Fetch actual live news & articles and projects from API
  useEffect(() => {
    fetch('http://localhost:4000/api/v1/articles')
      .then((res) => {
        if (!res.ok) throw new Error('API failed');
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setArticles(data);
        }
      })
      .catch((err) => {
        console.warn('Using default news articles:', err);
      });

    fetch('http://localhost:4000/api/v1/projects')
      .then((res) => {
        if (!res.ok) throw new Error('API failed');
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setProjects(data);
        }
      })
      .catch((err) => {
        console.warn('Using default projects:', err);
      });
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setActiveMenu(null);
    setMobileMenuOpen(false);
    setSearchOpen(false);
    setLangOpen(false);
  }, [pathname]);

  // Handle scroll state
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        activeMenu &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        const target = event.target as HTMLElement;
        if (!target.closest('.wsp-nav-btn')) {
          setActiveMenu(null);
        }
      }
      if (
        langOpen &&
        langRef.current &&
        !langRef.current.contains(event.target as Node)
      ) {
        setLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeMenu, langOpen]);

  // Escape key closes dropdown
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveMenu(null);
        setSearchOpen(false);
        setLangOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleMenu = (key: MenuKey) => {
    setActiveMenu((prev) => (prev === key ? null : key));
    setSearchOpen(false);
    setLangOpen(false);
  };

  // Primary Left Nav (Who we are | What we do | Team | Insights | Careers)
  const leftNavItems: Array<{ key: MenuKey; label: string; isLink?: boolean; href?: string }> = [
    { key: 'who-we-are', label: 'Who we are' },
    { key: 'what-we-do', label: 'What we do' },
    { key: null, label: 'Team', isLink: true, href: '/team' },
    { key: 'insights', label: 'Insights' },
    { key: null, label: 'Careers', isLink: true, href: '/career' },
  ];

  // Secondary Right Nav (Exact WSP 3 items + Globe + Lang)
  const rightNavItems: Array<{ key: MenuKey; label: string; isLink?: boolean; href?: string }> = [
    { key: 'projects', label: 'Projects' },
    { key: 'news', label: 'News' },
    { key: null, label: 'Contact us', isLink: true, href: '/contact' },
  ];

  const currentMegaData = activeMenu ? megaMenuData[activeMenu] : null;

  return (
    <div className="wsp-site min-h-screen bg-[#141212] text-white font-sans antialiased selection:bg-[#F4382D] selection:text-white">
      {/* =========================================================================
          WSP EXACT GLOBAL HEADER (ANIMATED COMPACT ON SCROLL)
          ========================================================================= */}
      <header
        className={`wsp-header fixed top-0 left-0 w-full z-50 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          scrolled || activeMenu
            ? 'bg-[#141212]/95 backdrop-blur-md shadow-2xl border-b border-white/10 h-[56px] sm:h-[62px] lg:h-[66px]'
            : 'bg-[#141212] border-b border-white/10 h-[68px] sm:h-[76px] lg:h-[85px]'
        }`}
      >
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 flex items-center justify-between h-full transition-all duration-300">
          {/* =====================================================================
              LEFT SIDE: WSP RED LOGO + PRIMARY MAIN NAV (4 LINKS)
              ===================================================================== */}
          <div className="flex items-center gap-3.5 sm:gap-6 lg:gap-8 xl:gap-10 h-full transition-all duration-300">
            {/* GW Big Sized Logo Mark */}
            <Link
              href="/"
              onClick={() => setActiveMenu(null)}
              className="wsp-logo flex items-center gap-2 sm:gap-2.5 md:gap-3 group select-none shrink-0 py-0.5"
              aria-label="Geospatial Works Home"
            >
              <img
                src="/gw-logo-vibrant-smooth.png"
                alt="Geospatial Works Logo"
                className={`w-auto object-contain transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  scrolled
                    ? 'h-[36px] sm:h-[42px] md:h-[50px]'
                    : 'h-[46px] sm:h-[54px] md:h-[68px]'
                } group-hover:scale-105`}
              />
              <div className="flex items-baseline gap-1 sm:gap-1.5 transition-all duration-300">
                <span
                  className={`font-black tracking-[-0.03em] text-[#3B82F6] leading-none uppercase font-sans transition-all duration-300 ${
                    scrolled
                      ? 'text-[15px] sm:text-[18px] xl:text-[21px]'
                      : 'text-[17px] sm:text-[21px] xl:text-[25px]'
                  }`}
                >
                  GEOSPATIAL
                </span>
                <span
                  className={`font-black tracking-[-0.03em] text-[#FB1D10] leading-none uppercase font-sans transition-all duration-300 ${
                    scrolled
                      ? 'text-[15px] sm:text-[18px] xl:text-[21px]'
                      : 'text-[17px] sm:text-[21px] xl:text-[25px]'
                  }`}
                >
                  WORKS
                </span>
              </div>
            </Link>

            {/* Main Primary Nav (Who we are | What we do | Team | Insights | Careers) */}
            <nav className="hidden lg:flex items-center h-full gap-0.5 xl:gap-1" aria-label="Primary navigation">
              {leftNavItems.map((item) => {
                if (item.isLink) {
                  return (
                    <Link
                      key={item.label}
                      href={item.href || '#'}
                      onClick={() => setActiveMenu(null)}
                      className={`wsp-nav-btn relative h-full px-3 xl:px-3.5 flex items-center font-normal text-white/90 hover:text-white transition-all duration-300 group ${
                        scrolled ? 'text-[14px] xl:text-[15px]' : 'text-[15px] xl:text-[16px]'
                      }`}
                    >
                      <span>{item.label}</span>
                      {/* Animated hover line under button */}
                      <span className="wsp-nav-hover-line" />
                    </Link>
                  );
                }

                const isOpen = activeMenu === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => toggleMenu(item.key)}
                    className={`wsp-nav-btn relative h-full px-3 xl:px-3.5 flex items-center font-normal tracking-normal transition-all duration-300 cursor-pointer group ${
                      isOpen ? 'text-white font-medium' : 'text-white/90 hover:text-white'
                    } ${scrolled ? 'text-[14px] xl:text-[15px]' : 'text-[15px] xl:text-[16px]'}`}
                    aria-expanded={isOpen}
                    aria-haspopup="true"
                  >
                    <span>{item.label}</span>

                    {/* Animated hover line under button */}
                    {!isOpen && <span className="wsp-nav-hover-line" />}

                    {/* Active Mega Menu Tab Indicator */}
                    {isOpen && (
                      <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-white transition-all shadow-sm" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* =====================================================================
              RIGHT SIDE: SEARCH ICON + VERTICAL DIVIDER + SECONDARY NAV + GLOBE + FR/BD
              ===================================================================== */}
          <div className="hidden lg:flex items-center h-full transition-all duration-300">
            {/* WSP Search Magnifying Glass Icon (Positioned before vertical divider) */}
            <button
              type="button"
              onClick={() => {
                setSearchOpen(!searchOpen);
                setActiveMenu(null);
                setLangOpen(false);
              }}
              className="text-white/90 hover:text-[#F4382D] transition-colors p-2 cursor-pointer flex items-center justify-center mr-1"
              aria-label="Click to open search"
              title="Click to open search"
            >
              <Search size={scrolled ? 16 : 18} strokeWidth={2} className="transition-all duration-300" />
            </button>

            {/* Exact WSP Vertical Dividing Line */}
            <div className={`w-[1px] bg-white/20 mx-2.5 xl:mx-3 transition-all duration-300 ${scrolled ? 'h-6' : 'h-8'}`} />

            {/* Secondary Nav Links (Projects | News | Contact us) */}
            <nav className="flex items-center h-full gap-0.5 xl:gap-1" aria-label="Secondary navigation">
              {rightNavItems.map((item) => {
                if (item.isLink) {
                  return (
                    <Link
                      key={item.label}
                      href={item.href || '#'}
                      onClick={() => setActiveMenu(null)}
                      className={`wsp-nav-btn relative h-full px-2.5 xl:px-3 flex items-center font-normal text-white/90 hover:text-white transition-all duration-300 group ${
                        scrolled ? 'text-[14px] xl:text-[15px]' : 'text-[15px] xl:text-[16px]'
                      }`}
                    >
                      <span>{item.label}</span>
                      <span className="wsp-nav-hover-line" />
                    </Link>
                  );
                }

                const isOpen = activeMenu === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => toggleMenu(item.key)}
                    className={`wsp-nav-btn relative h-full px-2.5 xl:px-3 flex items-center font-normal transition-all duration-300 cursor-pointer group ${
                      isOpen ? 'text-white font-medium' : 'text-white/90 hover:text-white'
                    } ${scrolled ? 'text-[14px] xl:text-[15px]' : 'text-[15px] xl:text-[16px]'}`}
                    aria-expanded={isOpen}
                    aria-haspopup="true"
                  >
                    <span>{item.label}</span>

                    {!isOpen && <span className="wsp-nav-hover-line" />}

                    {/* Exact WSP Tab Indicator */}
                    {isOpen && (
                      <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-white transition-all shadow-sm" />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Globe Icon Button */}
            <div className="relative ml-2" ref={langRef}>
              <button
                type="button"
                onClick={() => setLangOpen(!langOpen)}
                className="text-white/90 hover:text-white transition-colors p-2 cursor-pointer flex items-center"
                aria-label="Select location and language"
                title="Select location and language"
              >
                <Globe size={18} strokeWidth={1.8} />
              </button>

              {langOpen && (
                <div className="absolute right-0 top-full mt-3 w-56 bg-white text-[#141212] shadow-2xl border border-neutral-200 p-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <span className="block px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400 border-b border-neutral-100">
                    Select Region & Language
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentLang('EN');
                      setLangOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-[13px] font-semibold flex items-center justify-between hover:bg-neutral-50 ${
                      currentLang === 'EN' ? 'text-[#F4382D]' : 'text-neutral-800'
                    }`}
                  >
                    <span>🇧🇩 Bangladesh - English</span>
                    {currentLang === 'EN' && <Check size={14} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentLang('BN');
                      setLangOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-[13px] font-semibold flex items-center justify-between hover:bg-neutral-50 ${
                      currentLang === 'BN' ? 'text-[#F4382D]' : 'text-neutral-800'
                    }`}
                  >
                    <span>বাংলা (Bangla)</span>
                    {currentLang === 'BN' && <Check size={14} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentLang('FR');
                      setLangOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-[13px] font-semibold flex items-center justify-between hover:bg-neutral-50 ${
                      currentLang === 'FR' ? 'text-[#F4382D]' : 'text-neutral-800'
                    }`}
                  >
                    <span>Français (Global)</span>
                    {currentLang === 'FR' && <Check size={14} />}
                  </button>
                </div>
              )}
            </div>

            {/* Language Text Button (FR / BD / EN) */}
            <button
              type="button"
              onClick={() => {
                setCurrentLang((prev) => (prev === 'EN' ? 'BN' : 'EN'));
              }}
              className="text-[12px] font-semibold tracking-wider text-white/80 hover:text-white transition-colors cursor-pointer ml-1 pl-1"
              aria-label="Toggle language"
            >
              {currentLang === 'EN' ? 'BD' : 'EN'}
            </button>
          </div>

          {/* =====================================================================
              MOBILE: SEARCH + HAMBURGER
              ===================================================================== */}
          <div className="flex items-center gap-4 lg:hidden">
            <button
              type="button"
              onClick={() => setSearchOpen(!searchOpen)}
              className="text-white p-1"
              aria-label="Search"
            >
              <Search size={22} />
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white p-1"
              aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
            >
              {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* =========================================================================
            WSP EXACT MEGA-DROPDOWN MENU (WHITE BACKGROUND, 3 COLUMNS, CLOSE BUTTON)
            ========================================================================= */}
        {activeMenu && currentMegaData && (
          <div
            ref={dropdownRef}
            className="wsp-megamenu-panel absolute top-full left-0 w-full bg-[#FFFFFF] text-[#141212] shadow-2xl border-t border-neutral-100 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
          >
            <div className="w-full max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-12 py-12 lg:py-14">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
                {/* Column 1: Lead Headline, Subtext & Action (Span 4) */}
                <div className="lg:col-span-4 space-y-6 pr-4 border-b lg:border-b-0 lg:border-r border-neutral-200 pb-8 lg:pb-0">
                  <h3 className="text-[25px] sm:text-[27px] font-extrabold text-[#141212] leading-[1.22] tracking-[-0.02em]">
                    {currentMegaData.leadHeading}
                  </h3>

                  <p className="text-[14px] sm:text-[15px] text-neutral-600 leading-[1.6]">
                    {currentMegaData.leadSubtext}
                  </p>

                  {currentMegaData.leadLinkText && currentMegaData.leadLinkHref && (
                    <div className="pt-2">
                      <Link
                        href={currentMegaData.leadLinkHref}
                        onClick={() => setActiveMenu(null)}
                        className="inline-flex items-center gap-1.5 text-[14px] font-bold text-[#141212] hover:text-[#F4382D] transition-colors group"
                      >
                        <span>{currentMegaData.leadLinkText}</span>
                        <ChevronRight size={16} className="text-[#F4382D] group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  )}

                  {currentMegaData.showViewAll && (
                    <div className="pt-5 border-t border-neutral-200">
                      <span className="block text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-400 mb-3">
                        VIEW ALL
                      </span>
                      <div className="flex items-center gap-6 text-[14px] font-bold text-[#141212]">
                        <Link
                          href="/services"
                          onClick={() => setActiveMenu(null)}
                          className="hover:text-[#F4382D] transition-colors"
                        >
                          Sectors
                        </Link>
                        <Link
                          href="/services"
                          onClick={() => setActiveMenu(null)}
                          className="hover:text-[#F4382D] transition-colors"
                        >
                          Services
                        </Link>
                        <Link
                          href="/projects"
                          onClick={() => setActiveMenu(null)}
                          className="hover:text-[#F4382D] transition-colors"
                        >
                          Projects
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* Column 2: Nav Items List with Chevrons (Span 4) */}
                <div className="lg:col-span-4 space-y-4 border-b lg:border-b-0 lg:border-r border-neutral-200 pb-8 lg:pb-0 pr-4">
                  <h4 className="text-[17px] font-extrabold text-[#141212] tracking-[-0.01em] pb-2 border-b border-neutral-200">
                    {activeMenu === 'news'
                      ? 'Latest Published News & Bulletins'
                      : activeMenu === 'insights'
                      ? 'Insights & Technical Bulletins'
                      : currentMegaData.categoryTitle}
                  </h4>

                  <ul className="space-y-1 pt-1">
                    {(activeMenu === 'news' || activeMenu === 'insights') && articles.length > 0 ? (
                      articles.slice(0, 5).map((art) => (
                        <li key={art.id}>
                          <Link
                            href={`/insights/${art.slug}`}
                            onClick={() => setActiveMenu(null)}
                            className="flex items-center justify-between py-2 text-[14px] font-medium text-neutral-800 hover:text-[#F4382D] group transition-colors"
                          >
                            <div className="min-w-0 pr-2">
                              <span className="block truncate font-semibold">{art.title}</span>
                              <span className="text-[11px] text-neutral-400">
                                {art.category || 'Article'} • {art.publishDate || 'Recent'}
                              </span>
                            </div>
                            <ChevronRight
                              size={16}
                              className="text-neutral-400 group-hover:text-[#F4382D] group-hover:translate-x-1 transition-all shrink-0"
                            />
                          </Link>
                        </li>
                      ))
                    ) : (
                      currentMegaData.items.map((item, idx) => (
                        <li key={idx}>
                          <Link
                            href={item.href}
                            onClick={() => setActiveMenu(null)}
                            className="flex items-center justify-between py-2 text-[15px] font-medium text-neutral-800 hover:text-[#F4382D] group transition-colors"
                          >
                            <span>{item.label}</span>
                            {item.hasArrow && (
                              <ChevronRight
                                size={16}
                                className="text-neutral-400 group-hover:text-[#F4382D] group-hover:translate-x-1 transition-all"
                              />
                            )}
                          </Link>
                        </li>
                      ))
                    )}
                  </ul>
                </div>

                {/* Column 3: Featured Content Card & Top-Right Close Button (Span 4) */}
                <div className="lg:col-span-4 space-y-5">
                  {/* Top Bar: "Featured content" label on Left, "Close X" on Right */}
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
                    <span className="text-[12px] font-extrabold text-neutral-500 uppercase tracking-widest">
                      {(activeMenu === 'news' || activeMenu === 'insights') && articles[0]
                        ? 'Top Bulletin'
                        : currentMegaData.featuredLabel}
                    </span>

                    {/* Exact WSP Close Button */}
                    <button
                      type="button"
                      onClick={() => setActiveMenu(null)}
                      className="inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider text-neutral-600 hover:text-[#141212] transition-colors p-1 cursor-pointer group"
                      aria-label="Close menu"
                    >
                      <span>Close</span>
                      <X size={16} className="text-neutral-700 group-hover:text-black group-hover:scale-110 transition-transform" />
                    </button>
                  </div>

                  {/* Featured Card */}
                  {(() => {
                    const topArt = (activeMenu === 'news' || activeMenu === 'insights') && articles.length > 0 ? articles[0] : null;
                    const topProj = activeMenu === 'projects' && projects.length > 0 ? (projects.find((p: any) => p.isMilestone) || projects[0]) : null;

                    const featuredHref = topArt
                      ? `/insights/${topArt.slug}`
                      : topProj
                      ? `/projects/${topProj.slug}`
                      : currentMegaData.featuredHref;

                    const featuredImg = topArt?.imageUrl || topProj?.imageUrl || currentMegaData.featuredImage;
                    const featuredTitle = topArt?.title || topProj?.title || currentMegaData.featuredTitle;
                    const featuredDesc = topArt?.summary || topProj?.description || currentMegaData.featuredDesc;

                    return (
                      <Link
                        href={featuredHref}
                        onClick={() => setActiveMenu(null)}
                        className="group block space-y-3"
                      >
                        <div className="aspect-[16/9] overflow-hidden bg-neutral-100 relative shadow-sm rounded-lg">
                          <img
                            src={featuredImg}
                            alt={featuredTitle}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                          />
                        </div>

                        <h5 className="text-[17px] font-bold text-[#141212] leading-snug group-hover:text-[#F4382D] transition-colors line-clamp-2">
                          {featuredTitle}
                        </h5>

                        <p className="text-[13px] text-neutral-600 leading-relaxed line-clamp-2">
                          {featuredDesc}
                        </p>
                      </Link>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            WSP FULL-WIDTH SEARCH BAR SLIDE-DOWN
            ========================================================================= */}
        {/* =========================================================================
            MODERN COMMAND-CENTER SEARCH MODAL OVERLAY
            Spacious, high-legibility, quick category tags and direct project/service suggestions
            ========================================================================= */}
        {searchOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 sm:px-6">
            {/* Backdrop with rich blur */}
            <div
              className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
              onClick={() => setSearchOpen(false)}
            />

            {/* Modal Dialog Card */}
            <div className="relative w-full max-w-3xl bg-[#12141A] border border-white/15 shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200 text-white">
              {/* Header / Input Field */}
              <div className="p-4 sm:p-6 border-b border-white/10 flex items-center gap-3 sm:gap-4 bg-white/[0.02]">
                <Search size={24} className="text-[#3B82F6] shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchQuery.trim()) {
                      window.location.href = `/projects?search=${encodeURIComponent(searchQuery.trim())}`;
                    }
                  }}
                  placeholder="Search projects, services, LiDAR mapping, or client tenders..."
                  className="w-full bg-transparent text-white placeholder-neutral-500 text-lg sm:text-xl outline-none font-medium"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="p-2 text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                  aria-label="Close search"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Quick Keyword / Category Filter Tags */}
              <div className="px-5 py-3.5 bg-black/40 border-b border-white/5 flex items-center gap-2 overflow-x-auto scrollbar-none">
                <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 shrink-0 flex items-center gap-1">
                  <Sparkles size={12} className="text-[#FB1D10]" />
                  <span>Popular:</span>
                </span>
                {[
                  'Topographic Survey',
                  'Drone LiDAR',
                  'BADC WEB-AIS',
                  'DNCC Terminals',
                  'Railway Bypass',
                  'Bathymetry',
                ].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      setSearchQuery(tag);
                      window.location.href = `/projects?search=${encodeURIComponent(tag)}`;
                    }}
                    className="px-2.5 py-1 bg-white/5 hover:bg-white/15 border border-white/10 text-neutral-300 hover:text-white text-[11px] font-mono tracking-wide whitespace-nowrap transition-colors cursor-pointer"
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {/* Search Modal Body */}
              <div className="p-5 sm:p-6 max-h-[60vh] overflow-y-auto space-y-6">
                {/* Quick Section: Primary Destinations */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 font-bold block">
                    Fast Navigation
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <Link
                      href="/projects"
                      onClick={() => setSearchOpen(false)}
                      className="p-3 bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-[#3B82F6]/50 flex items-center justify-between group transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#3B82F6]/10 text-[#3B82F6] flex items-center justify-center border border-[#3B82F6]/30">
                          <MapPin size={16} />
                        </div>
                        <div>
                          <p className="text-[13px] font-bold text-white group-hover:text-[#3B82F6] transition-colors">
                            Explore Verified Projects
                          </p>
                          <p className="text-[11px] text-neutral-400">
                            35+ national infrastructure benchmarks
                          </p>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-neutral-500 group-hover:text-white transition-colors" />
                    </Link>

                    <Link
                      href="/services"
                      onClick={() => setSearchOpen(false)}
                      className="p-3 bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-[#FB1D10]/50 flex items-center justify-between group transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#FB1D10]/10 text-[#FB1D10] flex items-center justify-center border border-[#FB1D10]/30">
                          <Hash size={16} />
                        </div>
                        <div>
                          <p className="text-[13px] font-bold text-white group-hover:text-[#FB1D10] transition-colors">
                            Engineering Capabilities
                          </p>
                          <p className="text-[11px] text-neutral-400">
                            RTK Geodesy, UAV LiDAR &amp; Bathymetry
                          </p>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-neutral-500 group-hover:text-white transition-colors" />
                    </Link>
                  </div>
                </div>

                {/* Live Filtered Project Matches */}
                {searchQuery.trim().length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-white/10">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#3B82F6] font-bold block">
                      Search Query Results
                    </span>
                    <div className="space-y-2">
                      <Link
                        href={`/projects?search=${encodeURIComponent(searchQuery.trim())}`}
                        onClick={() => setSearchOpen(false)}
                        className="w-full p-3.5 bg-[#3B82F6]/15 hover:bg-[#3B82F6]/25 border border-[#3B82F6]/40 flex items-center justify-between group transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <Search size={18} className="text-[#3B82F6]" />
                          <span className="text-[13px] font-semibold text-white">
                            View all results for &ldquo;{searchQuery}&rdquo; in Projects Database
                          </span>
                        </div>
                        <CornerDownLeft size={16} className="text-[#3B82F6]" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer Bar */}
              <div className="px-5 py-3 bg-black/60 border-t border-white/10 flex items-center justify-between text-[11px] text-neutral-400 font-mono">
                <div className="flex items-center gap-3">
                  <span>Press <kbd className="px-1.5 py-0.5 bg-white/10 border border-white/20 text-white rounded-xs">ENTER</kbd> to search</span>
                  <span>•</span>
                  <span><kbd className="px-1.5 py-0.5 bg-white/10 border border-white/20 text-white rounded-xs">ESC</kbd> to dismiss</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (searchQuery.trim()) {
                      window.location.href = `/projects?search=${encodeURIComponent(searchQuery.trim())}`;
                    } else {
                      window.location.href = '/projects';
                    }
                  }}
                  className="text-[#3B82F6] hover:text-white font-bold transition-colors cursor-pointer"
                >
                  View All Projects &rarr;
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            MOBILE SLIDE-DOWN DRAWER
            ========================================================================= */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#141212] border-t border-white/10 px-4 sm:px-6 py-6 space-y-5 animate-in slide-in-from-top-4 duration-200 max-h-[calc(100vh-68px)] overflow-y-auto">
            {/* Direct quick links */}
            <div className="grid grid-cols-3 gap-2 pb-4 border-b border-white/10">
              <Link
                href="/team"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs uppercase tracking-wider text-center flex items-center justify-center gap-1 transition-colors"
              >
                <span>Team</span>
              </Link>
              <Link
                href="/projects"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs uppercase tracking-wider text-center flex items-center justify-center gap-1 transition-colors"
              >
                <span>Projects</span>
              </Link>
              <Link
                href="/career"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs uppercase tracking-wider text-center flex items-center justify-center gap-1 transition-colors"
              >
                <span>Careers</span>
              </Link>
            </div>

            {[...leftNavItems, ...rightNavItems.filter((i) => !i.isLink)].map((item) => {
              if (item.isLink) return null;
              const data = megaMenuData[item.key as string];
              return (
                <div key={item.key} className="border-b border-white/5 pb-3">
                  <div className="text-sm font-bold text-white mb-2 flex items-center justify-between">
                    <span>{item.label}</span>
                    <span className="text-[10px] font-mono text-[#3B82F6] uppercase">Section</span>
                  </div>
                  <div className="pl-3 space-y-1.5 border-l border-white/10">
                    {data?.items.map((sub, idx) => (
                      <Link
                        key={idx}
                        href={sub.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="block text-xs font-medium text-neutral-300 hover:text-[#3B82F6] py-1 transition-colors"
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
            <div className="pt-2 pb-6 space-y-2.5">
              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="wsp-btn wsp-btn-solid w-full text-center py-3 block text-xs font-bold uppercase tracking-wider"
              >
                Contact us
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Dimmed Backdrop when Mega Menu is Open */}
      {activeMenu && (
        <div
          onClick={() => setActiveMenu(null)}
          className="fixed inset-0 top-[85px] bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-200"
        />
      )}

      {/* Main Content Spacer for Fixed Responsive Header */}
      <div className="pt-[68px] sm:pt-[76px] lg:pt-[85px]">{children}</div>

      {/* =========================================================================
          WSP EXACT GLOBAL FOOTER
          ========================================================================= */}
      <footer className="wsp-footer bg-[#141212] border-t border-white/10 text-white pt-20 pb-12">
        <div className="wsp-container max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-12">
          {/* Top Multi-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 lg:gap-8 pb-16 border-b border-white/10">
            {/* Column 1: Brand & Socials */}
            <div className="lg:col-span-1 space-y-6">
              <Link href="/" className="inline-block" aria-label="Geospatial Works">
                <div className="flex items-center gap-3">
                  <img
                    src="/gw-logo-vibrant-smooth.png"
                    alt="Geospatial Works Logo"
                    className="h-12 w-auto object-contain"
                  />
                  <div className="flex items-baseline gap-1">
                    <span className="font-black text-[16px] tracking-tight text-[#3B82F6] uppercase leading-none">
                      GEOSPATIAL
                    </span>
                    <span className="font-black text-[16px] tracking-tight text-[#FB1D10] uppercase leading-none">
                      WORKS
                    </span>
                  </div>
                </div>
              </Link>

              {/* Social Icons matching WSP style */}
              <div className="flex items-center gap-4 text-neutral-400">
                <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors" aria-label="LinkedIn">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </a>
                <a href="https://youtube.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors" aria-label="YouTube">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
                <a href="https://x.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors" aria-label="X (formerly Twitter)">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors" aria-label="Facebook">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Column 2: Who we are */}
            <div className="space-y-3">
              <h4 className="text-[14px] font-bold tracking-tight text-white uppercase">Who we are</h4>
              <ul className="space-y-2 text-[13px] text-neutral-400">
                <li><Link href="/about/our-story" className="hover:text-white transition-colors">Our Story &amp; Purpose</Link></li>
                <li><Link href="/about/future-ready" className="hover:text-white transition-colors">Future Ready Geodesy</Link></li>
                <li><Link href="/about/corporate-responsibility" className="hover:text-white transition-colors">Corporate Responsibility</Link></li>
                <li><Link href="/team" className="hover:text-white transition-colors">Leadership &amp; Innovators</Link></li>
                <li><Link href="/about/standards" className="hover:text-white transition-colors">Quality Benchmarks &amp; SOB</Link></li>
              </ul>
            </div>

            {/* Column 3: What we do */}
            <div className="space-y-3">
              <h4 className="text-[14px] font-bold tracking-tight text-white uppercase">What we do</h4>
              <ul className="space-y-2 text-[13px] text-neutral-400">
                <li><Link href="/services/topographic-survey" className="hover:text-white transition-colors">Topographic Survey</Link></li>
                <li><Link href="/services/uav-mapping" className="hover:text-white transition-colors">Drone & LiDAR Mapping</Link></li>
                <li><Link href="/services/gis-solutions" className="hover:text-white transition-colors">GIS & Digital Twins</Link></li>
                <li><Link href="/services/bathymetric-survey" className="hover:text-white transition-colors">Hydrographic Bathymetry</Link></li>
                <li><Link href="/services/subsurface-utility" className="hover:text-white transition-colors">Subsurface Utility (GPR)</Link></li>
              </ul>
            </div>

            {/* Column 4: Projects */}
            <div className="space-y-3">
              <h4 className="text-[14px] font-bold tracking-tight text-white uppercase">Projects</h4>
              <ul className="space-y-2 text-[13px] text-neutral-400">
                <li><Link href="/projects?sector=Water" className="hover:text-white transition-colors">Water & River Delta</Link></li>
                <li><Link href="/projects?sector=Transport" className="hover:text-white transition-colors">Highways & Expressways</Link></li>
                <li><Link href="/projects?sector=GIS" className="hover:text-white transition-colors">Municipal Water GIS</Link></li>
                <li><Link href="/projects?sector=Topographic" className="hover:text-white transition-colors">Floodplain Modeling</Link></li>
              </ul>
            </div>

            {/* Column 5: News & Careers */}
            <div className="space-y-3">
              <h4 className="text-[14px] font-bold tracking-tight text-white uppercase">News & Careers</h4>
              <ul className="space-y-2 text-[13px] text-neutral-400">
                <li><Link href="/insights" className="hover:text-white transition-colors">Latest Press Releases</Link></li>
                <li><Link href="/insights" className="hover:text-white transition-colors">Technical Bulletins</Link></li>
                <li><Link href="/career" className="hover:text-white transition-colors">Search & Apply</Link></li>
                <li><Link href="/career#culture" className="hover:text-white transition-colors">Life at Geospatial Works</Link></li>
              </ul>
            </div>

            {/* Column 6: Contact & Location */}
            <div className="space-y-3">
              <h4 className="text-[14px] font-bold tracking-tight text-white uppercase">Dhaka Headquarters</h4>
              <p className="text-[12px] text-neutral-400 leading-relaxed">
                64/1 (D1), Lake Circus, Kalabagan, Dhaka 1205, Bangladesh
              </p>
              <div className="pt-2">
                <Link
                  href="/contact"
                  className="wsp-btn wsp-btn-solid text-[12px] py-2 px-4 inline-block"
                >
                  Contact us
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom Legal Notice */}
          <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-[11px] text-neutral-500 gap-4">
            <p>© {new Date().getFullYear()} Geospatial Works Ltd. All rights reserved. Engineering Ground Truth.</p>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy Notice</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              <Link href="/sitemap" className="hover:text-white transition-colors">Sitemap</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}