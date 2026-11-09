'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  ArrowUpRight,
  ExternalLink,
  Cpu,
  HardDrive,
  Database,
  Layers,
  Server,
  Zap,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Send,
} from 'lucide-react';
import KeepInTouchSection from './KeepInTouchSection';

interface WspLandingViewProps {
  heroSlides?: any[];
  services?: any[];
  projects?: any[];
  sections?: any;
}

export default function WspLandingView({
  heroSlides = [],
  services = [],
  projects = [],
  sections = {},
}: WspLandingViewProps) {
  // Hero Carousel State
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Dynamic Page Scroll Progress
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Default slides extracted directly from Company Profile PPT
  const defaultSlides = [
    {
      id: '1',
      heading: 'WHERE ENGINEERING MEETS PRECISION',
      eyebrow: 'GEOSPATIAL WORKS BANGLADESH',
      description: 'Integrated engineering, geospatial, and precision surveying consultancy delivering technical solutions for national infrastructure, spatial planning, and delta resource management.',
      imageUrl: '/projects-extracted/page_31/img_01.jpg',
      primaryActionText: 'Explore our services',
      primaryActionHref: '/services',
    },
    {
      id: '2',
      heading: 'CONNECTING SPATIAL DATA TO ENGINEERING DESIGN',
      eyebrow: 'PRECISION • INNOVATION • SUSTAINABILITY',
      description: 'From high-density UAV photogrammetry and RTK GNSS observations to civil structural engineering and GIS digital twins across national landmarks.',
      imageUrl: '/projects-extracted/page_16/img_02.jpg',
      primaryActionText: 'View verified projects',
      primaryActionHref: '/projects',
    },
    {
      id: '3',
      heading: 'FROM FIELD DATA ACQUISITION TO 3D VISUALIZATION',
      eyebrow: 'SOB BENCHMARK COMPLIANCE',
      description: 'Supporting national highways, railway bypasses, inter-district bus terminals, sanitary landfills, and agricultural irrigation networks across all divisions of Bangladesh.',
      imageUrl: '/projects-extracted/page_18/img_02.jpg',
      primaryActionText: 'Connect with our team',
      primaryActionHref: '/contact',
    },
    {
      id: '4',
      heading: 'SUB-CENTIMETER GEODETIC CONTROL & DRONE PHOTOGRAMMETRY',
      eyebrow: 'RAILWAY & HIGHWAY INFRASTRUCTURE',
      description: 'Rigorous ground control networks and bare-earth digital terrain modeling powering major rail bypasses and urban transport corridors.',
      imageUrl: '/projects-extracted/page_29/img_02.jpg',
      primaryActionText: 'Discover projects',
      primaryActionHref: '/projects',
    },
  ];

  // Strictly use defaultSlides if heroSlides from DB still reference old demo images like delta-hero or geospatial-river-hero
  const slides = heroSlides && heroSlides.length > 0 && !heroSlides.some(s => s.imageUrl?.includes('delta-hero') || s.imageUrl?.includes('geospatial-river-hero'))
    ? heroSlides
    : defaultSlides;
  const currentSlide = slides[activeSlide] || slides[0];

  // If active slide is video or any slide is video mode, hero shows dedicated single cinematic slide without auto-rotating carousel
  const hasVideo = currentSlide?.mediaType === 'video' || !!currentSlide?.videoUrl;

  // Auto-advance hero slides (Only when not in video mode)
  useEffect(() => {
    if (!isPlaying || slides.length <= 1 || hasVideo) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [isPlaying, slides.length, hasVideo]);

  // Dynamic Section Data from CMS
  const manSec = sections['home:manifesto'] || sections['manifesto'] || sections['home:manifesto_summary'] || sections['manifesto_summary'] || sections['home:about_summary'] || sections['about_summary'] || {};
  const shapingSec = sections['home:shaping_future'] || sections['shaping_future'] || sections['home:services_summary'] || sections['services_summary'] || sections['home:services_intro'] || sections['services_intro'] || {};
  const projSec = sections['home:projects_summary'] || sections['projects_summary'] || sections['home:projects_intro'] || sections['projects_intro'] || {};
  const equipSec = sections['home:equipment_summary'] || sections['equipment_summary'] || {};
  const newsSec = sections['home:news_summary'] || sections['news_summary'] || {};
  const cultureSec = sections['home:culture_summary'] || sections['culture_summary'] || {};
  const touchSec = sections['home:keep_in_touch'] || sections['keep_in_touch'] || {};

  // Exactly the 8 Core Projects from Company Profile PPT
  const defaultProjects = [
    {
      id: 'p1',
      location: 'DHAKA NORTH CITY CORPORATION (DNCC)',
      title: 'Gabtoli Inter-District Bus Terminal Modernization',
      category: 'Transit & Municipal Facility',
      description: 'Digital surveying, 3D structural modeling, and comprehensive improvement planning of Gabtoli Bus Terminal.',
      imageUrl: '/projects-extracted/page_16/img_02.jpg',
      slug: 'page-16-passenger-facilities-modernization-at-gabtoli',
    },
    {
      id: 'p2',
      location: 'GULSHAN-BADDA LINK ROAD • DNCC',
      title: 'Gulshan-1 Intersection to Progati Sarani Highway & Drain Improvement',
      category: 'Road & Highway Survey',
      description: 'Construction of RCC median, subsurface drain, pedestrian footpath, passenger sheds, grill fencing, and traffic signs along Road 130 and 134.',
      imageUrl: '/projects-extracted/page_18/img_02.jpg',
      slug: 'page-18-gulshan-1-intersection-to-progati-sarani-high',
    },
    {
      id: 'p3',
      location: 'DHAKA NORTH CITY CORPORATION (DNCC)',
      title: 'Mohakhali Inter-District Bus Terminal Modernization',
      category: 'Transit & Municipal Facility',
      description: 'Comprehensive civil modernization: waiting areas, ticket counters, sanitation blocks, boundary walls, and passenger traffic flow optimization.',
      imageUrl: '/projects-extracted/page_20/img_02.jpg',
      slug: 'page-20-passenger-facilities-modernization-at-mohakha',
    },
    {
      id: 'p4',
      location: 'MOHESHKHALI SWM • LGED / OSMO',
      title: 'LTP of Sanitary Landfill at Moheshkhali Solid Waste Management',
      category: 'Environmental & Civil Design',
      description: 'Structural engineering design and reinforcement details for Leachate Treatment Plant (LTP) safeguarding coastal groundwater.',
      imageUrl: '/projects-extracted/page_24/img_02.png',
      slug: 'page-23-ltp-of-sanitary-landfill-at-moheshkhali-solid',
    },
    {
      id: 'p5',
      location: 'BANGLADESH AGRICULTURAL DEVELOPMENT CORPORATION (BADC)',
      title: 'Pilot Research Project for Irrigation Water Management (WEB-AIS)',
      category: 'Agricultural Water Management & GIS',
      description: 'Canal distribution mapping, TBM network setup, and multi-spectral NDVI remote sensing under WEB-AIS pilot research.',
      imageUrl: '/projects-extracted/page_25/img_02.jpg',
      slug: 'page-25-web-ais-pilot-research-project-on-irrigation',
    },
    {
      id: 'p6',
      location: 'GANGARAMPUR • BADC',
      title: 'Installation of Water-Level Gauge Readers & Topographic Survey',
      category: 'Hydrology & River Survey',
      description: 'Installation and calibration of river water level gauge readers at three locations in Gangarampur with topographic cross-sections.',
      imageUrl: '/projects-extracted/page_27/img_02.jpg',
      slug: 'page-27-installation-of-water-level-gauge-readers---t',
    },
    {
      id: 'p7',
      location: 'BANGLADESH RAILWAY • RCIPF / OCG',
      title: 'Abdulpur Railway Bypass Topographic & UAV Survey',
      category: 'Railway & Drone Photogrammetry',
      description: 'Sub-centimeter RTK topographic and UAV photogrammetry survey producing DSM, DTM, and 0.25m interval contours for railway bypass.',
      imageUrl: '/projects-extracted/page_29/img_02.jpg',
      slug: 'page-29-abdulpur-railway-bypass-topographic---uav-pho',
    },
    {
      id: 'p8',
      location: 'DHAKA TRANSPORT COORDINATION AUTHORITY (DTCA)',
      title: 'Bus Route Rationalization & Arterial Corridor Concept Design',
      category: 'Urban Transport Planning & GIS',
      description: 'Drone corridor photogrammetry, classified traffic count surveys, and corridor restructuring concept designs.',
      imageUrl: '/projects-extracted/page_31/img_01.jpg',
      slug: 'page-31-bus-route-rationalization---corridor-concept',
    },
  ];

  // Pioneering Projects Carousel State with Freeform Continuous Swipe & Momentum
  const [activeProjectIdx, setActiveProjectIdx] = useState(0);
  const scrollProjectsRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const hasDraggedRef = useRef(false);
  const lastXRef = useRef(0);
  const velocityRef = useRef(0);
  const animFrameIdRef = useRef<number | null>(null);

  // Core Capabilities ("Shaping the Future") Horizontal Drag & Scroll State
  const servicesScrollRef = useRef<HTMLDivElement>(null);
  const isServicesDraggingRef = useRef(false);
  const servicesStartXRef = useRef(0);
  const servicesScrollLeftRef = useRef(0);
  const servicesHasDraggedRef = useRef(false);
  const servicesLastXRef = useRef(0);
  const servicesVelocityRef = useRef(0);
  const servicesAnimFrameIdRef = useRef<number | null>(null);

  const handleServicesMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0 || !servicesScrollRef.current) return;
    if (servicesAnimFrameIdRef.current) cancelAnimationFrame(servicesAnimFrameIdRef.current);

    isServicesDraggingRef.current = true;
    servicesHasDraggedRef.current = false;
    servicesStartXRef.current = e.pageX;
    servicesLastXRef.current = e.pageX;
    servicesScrollLeftRef.current = servicesScrollRef.current.scrollLeft;
    servicesVelocityRef.current = 0;

    const el = servicesScrollRef.current;

    const onGlobalMouseMove = (moveEvent: MouseEvent) => {
      if (!isServicesDraggingRef.current || !el) return;
      const currentX = moveEvent.pageX;
      const stepDelta = currentX - servicesLastXRef.current;
      servicesVelocityRef.current = stepDelta;
      servicesLastXRef.current = currentX;

      const totalMoved = currentX - servicesStartXRef.current;
      if (Math.abs(totalMoved) > 5) {
        servicesHasDraggedRef.current = true;
      }
      el.scrollLeft -= stepDelta * 1.4;
    };

    const onGlobalMouseUp = () => {
      isServicesDraggingRef.current = false;
      window.removeEventListener('mousemove', onGlobalMouseMove);
      window.removeEventListener('mouseup', onGlobalMouseUp);

      if (Math.abs(servicesVelocityRef.current) > 1.5 && el) {
        let v = -servicesVelocityRef.current * 2;
        const glide = () => {
          if (!el || Math.abs(v) < 0.4) return;
          el.scrollLeft += v;
          v *= 0.92;
          servicesAnimFrameIdRef.current = requestAnimationFrame(glide);
        };
        servicesAnimFrameIdRef.current = requestAnimationFrame(glide);
      }
    };

    window.addEventListener('mousemove', onGlobalMouseMove);
    window.addEventListener('mouseup', onGlobalMouseUp);
  };

  const scrollServices = (direction: 'left' | 'right') => {
    if (servicesScrollRef.current) {
      if (servicesAnimFrameIdRef.current) cancelAnimationFrame(servicesAnimFrameIdRef.current);
      const el = servicesScrollRef.current;
      const card = el.querySelector(':scope > div') as HTMLElement | null;
      const step = card ? card.offsetWidth + 28 : 360;
      el.scrollBy({
        left: direction === 'left' ? -step : step,
        behavior: 'smooth',
      });
    }
  };

  // Always ensure all 8 verified slide projects are active for 1 — 8 showcase
  const projectList = defaultProjects;

  // Extended project array with wrap-around clone prefix so previous slide is visible on the left edge just like WSP
  const extendedProjects = [
    { ...projectList[projectList.length - 1], id: 'clone-prev', isClone: true, originalIdx: projectList.length - 1 },
    ...projectList.map((p, idx) => ({ ...p, isClone: false, originalIdx: idx })),
    ...projectList.map((p, idx) => ({ ...p, id: `loop-${idx}`, isClone: false, originalIdx: idx })),
  ];

  const getCardStep = () => {
    if (!scrollProjectsRef.current) return 744;
    const firstCard = scrollProjectsRef.current.firstElementChild as HTMLElement;
    if (!firstCard) return 744;
    const style = window.getComputedStyle(scrollProjectsRef.current);
    const gap = parseFloat(style.columnGap || style.gap || '24') || 24;
    return firstCard.offsetWidth + gap;
  };

  useEffect(() => {
    const initScroll = () => {
      if (scrollProjectsRef.current) {
        const step = getCardStep();
        const peek = Math.min(220, window.innerWidth * 0.18);
        scrollProjectsRef.current.scrollLeft = step - peek;
        setActiveProjectIdx(0);
      }
    };
    const timer = setTimeout(initScroll, 80);
    return () => clearTimeout(timer);
  }, []);

  const scrollProjects = (direction: 'left' | 'right') => {
    if (scrollProjectsRef.current) {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      const step = getCardStep();
      const currentScroll = scrollProjectsRef.current.scrollLeft;
      const targetScroll = direction === 'left' ? currentScroll - step : currentScroll + step;
      scrollProjectsRef.current.scrollTo({
        left: Math.max(0, targetScroll),
        behavior: 'smooth',
      });
    }
  };

  const handleProjectsScroll = () => {
    if (scrollProjectsRef.current) {
      const { scrollLeft } = scrollProjectsRef.current;
      const step = getCardStep();
      const peek = Math.min(220, window.innerWidth * 0.18);
      const rawIdx = Math.round((scrollLeft - (step - peek)) / step);
      const normalizedIdx = ((rawIdx % projectList.length) + projectList.length) % projectList.length;
      setActiveProjectIdx(normalizedIdx);
    }
  };

  // High-performance continuous left-click drag with inertia / swipe glide
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only left-click initiates dragging
    if (e.button !== 0 || !scrollProjectsRef.current) return;
    if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);

    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    startXRef.current = e.pageX;
    lastXRef.current = e.pageX;
    scrollLeftRef.current = scrollProjectsRef.current.scrollLeft;
    velocityRef.current = 0;

    const el = scrollProjectsRef.current;

    const onGlobalMouseMove = (moveEvent: MouseEvent) => {
      if (!isDraggingRef.current || !el) return;
      const currentX = moveEvent.pageX;
      const stepDelta = currentX - lastXRef.current;
      velocityRef.current = stepDelta;
      lastXRef.current = currentX;

      const totalMoved = currentX - startXRef.current;
      if (Math.abs(totalMoved) > 5) {
        hasDraggedRef.current = true;
      }

      // Continuous direct delta swipe - allows sweeping across unlimited slides
      el.scrollLeft -= stepDelta * 1.5;
    };

    const onGlobalMouseUp = () => {
      isDraggingRef.current = false;
      window.removeEventListener('mousemove', onGlobalMouseMove);
      window.removeEventListener('mouseup', onGlobalMouseUp);

      // Kinetic momentum glide when swiping
      if (Math.abs(velocityRef.current) > 1.5 && el) {
        let v = -velocityRef.current * 2.2;
        const glide = () => {
          if (!el || Math.abs(v) < 0.4) return;
          el.scrollLeft += v;
          v *= 0.92; // friction deceleration
          animFrameIdRef.current = requestAnimationFrame(glide);
        };
        animFrameIdRef.current = requestAnimationFrame(glide);
      }
    };

    window.addEventListener('mousemove', onGlobalMouseMove);
    window.addEventListener('mouseup', onGlobalMouseUp);
  };

  // 100% Real Core Service Capabilities from Presentation Sections
  const defaultServices = [
    {
      title: 'Topographic, Land & Engineering Survey',
      slug: 'topographic-survey',
      imageUrl: '/real-media/service-topographic-uav.png',
      desc: 'Precision geodetic control networks, RTK GNSS observations, total station boundary surveys, and digital leveling loops.',
    },
    {
      title: 'Airborne UAV (Drone) & LiDAR Mapping',
      slug: 'uav-mapping',
      imageUrl: '/real-media/service-uav-drone-lidar.png',
      desc: 'High-density drone LiDAR, aerial photogrammetry, and CAAB-certified flight operations across transport corridors.',
    },
    {
      title: 'Architectural, Civil & Structural Design',
      slug: 'building-engineering',
      imageUrl: '/real-media/service-building-design-01.jpg',
      desc: 'Architectural drawings, structural engineering models, environmental drainage systems, and construction supervision.',
    },
    {
      title: 'Enterprise GIS & Remote Sensing Consultancy',
      slug: 'gis-solutions',
      imageUrl: '/real-media/service-gis-remote-sensing.png',
      desc: 'Satellite imagery analysis, land cover classification, Web-AIS applications, and municipal geodatabases.',
    },
    {
      title: 'Road, Bridge & Highway Alignment',
      slug: 'road-bridge-infrastructure',
      imageUrl: '/real-media/service-road-bridge-engineering.jpg',
      desc: 'Highway geometry design, bridge hydraulic bathymetry, median drains, and inter-district bus terminal modernization.',
    },
    {
      title: 'Hydrographic Sonar & River Bathymetry',
      slug: 'bathymetric-survey',
      imageUrl: '/real-media/project-badc-jhopjhopia-river.jpg',
      desc: 'Echo sounder cross-section sounding, tidal gauge calibration, and riverbank training surveys.',
    },
  ];

  const serviceList = services && services.length > 0 ? services : defaultServices;

  // News and Articles
  const newsList = [
    {
      date: '26.09.30',
      tag: 'PROJECT COMPLETION',
      title: 'Completion of 35.15 sq km UAV drone and traffic OD survey across 150 km of Dhaka city for DTCA in 30 days.',
      href: '/insights',
    },
    {
      date: '26.07.15',
      tag: 'RESEARCH & INNOVATION',
      title: 'Deployment of river water-level gauge readers and RTK Reduced Level adjustments across Jhopjhopia River for BADC WEB-AIS.',
      href: '/insights',
    },
    {
      date: '26.04.10',
      tag: 'ENGINEERING & INFRASTRUCTURE',
      title: 'Finalization of architectural and drainage masterplan drawings for Gabtoli and Mohakhali Inter-District Bus Terminals.',
      href: '/insights',
    },
  ];

  return (
    <div className="wsp-landing-content relative">
      {/* Precision Brand Scroll Progress Bar */}
      <motion.div
        style={{ scaleX }}
        className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#3B82F6] via-[#FB1D10] to-[#FB1D10] origin-left z-50 pointer-events-none"
      />
      {/* =========================================================================
          SECTION 1: HERO (BOXED SQUARE 16:9 CINEMATIC CONTAINER)
          Super-smooth Framer Motion photo cross-fade & Ken Burns scale animation,
          fluent staggered text-up entrance, slide indicator bars, and '||' pause toggle.
          ========================================================================= */}
      {/* =========================================================================
          SECTION 1: HERO (WIDE FULL SCREEN PROPER)
          True edge-to-edge full width and full viewport height cinematic display,
          super-smooth Framer Motion photo cross-fade & Ken Burns scale animation,
          fluent staggered text-up entrance, slide indicator bars, and '||' pause toggle.
          ========================================================================= */}
      <section className="wsp-hero-wrapper w-full h-[calc(100svh-68px)] sm:h-[calc(100vh-76px)] lg:h-[calc(100vh-85px)] min-h-[560px] sm:min-h-[660px] lg:min-h-[740px] relative overflow-hidden bg-black flex items-end sm:items-center justify-center border-b border-white/[0.08]">
        {/* Framer Motion Photo / Video Transition */}
        <div className="absolute inset-0 overflow-hidden">
          <AnimatePresence initial={false}>
            {currentSlide.mediaType === 'video' || currentSlide.videoUrl ? (
              <motion.div
                key={`video-${currentSlide.id || activeSlide}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ opacity: { duration: 0.5 } }}
                className="absolute inset-0 w-full h-full"
              >
                <video
                  src={currentSlide.videoUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover object-[center_35%] sm:object-center"
                />
              </motion.div>
            ) : (
              <motion.img
                key={currentSlide.id || activeSlide}
                src={currentSlide.imageUrl || '/projects-extracted/page_31/img_01.jpg'}
                alt={currentSlide.heading || 'Geospatial Works Landscape'}
                loading="eager"
                decoding="async"
                {...({ fetchPriority: 'high' } as Record<string, string>)}
                initial={activeSlide === 0 ? { opacity: 1, scale: 1 } : { opacity: 0.2, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{
                  opacity: { duration: 0.4, ease: 'easeOut' },
                  scale: { duration: 6, ease: 'easeOut' },
                }}
                className="absolute inset-0 w-full h-full object-cover object-[center_30%] sm:object-center will-change-transform"
              />
            )}
          </AnimatePresence>
        </div>

        {/* Cinematic Gradient Scrim: crystal clear full view of banner on mobile, subtle smooth contrast at bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 via-35% to-transparent sm:from-black/90 sm:via-black/40 sm:to-black/30 pointer-events-none z-1" />

        {/* Mobile-Optimized Text & CTA Layout: Minimal, sleek, small texts with refined compact buttons */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 xs:px-5 sm:px-10 lg:px-16 flex flex-col items-start sm:items-center justify-end sm:justify-center text-left sm:text-center pointer-events-none pb-12 sm:pb-12 pt-16 sm:py-12 h-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide.id || activeSlide}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-start sm:items-center justify-end sm:justify-center pointer-events-auto max-w-xl sm:max-w-none"
            >
              {currentSlide.eyebrow && (
                <motion.span
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
                  className="inline-flex items-center gap-1.5 text-[10px] sm:text-[13px] md:text-[14px] font-semibold sm:font-extrabold uppercase tracking-[0.18em] sm:tracking-[0.25em] text-[#FB1D10] mb-1.5 sm:mb-4 select-none drop-shadow"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FB1D10] animate-pulse" />
                  {currentSlide.eyebrow}
                </motion.span>
              )}

              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="text-white font-extrabold sm:font-black text-[19px] xs:text-[22px] sm:text-[48px] md:text-[68px] lg:text-[84px] xl:text-[96px] leading-[1.2] sm:leading-[0.96] tracking-normal sm:tracking-[-0.03em] uppercase drop-shadow-lg font-sans max-w-md sm:max-w-[1240px]"
              >
                {currentSlide.heading || 'KNOW THE GROUND. SHAPE THE FUTURE.'}
              </motion.h1>

              {(currentSlide.subheading || currentSlide.description) && (
                <motion.p
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  className="mt-1.5 sm:mt-5 text-white/75 sm:text-white/85 text-[11px] xs:text-[12px] sm:text-base md:text-lg max-w-md sm:max-w-2xl font-normal sm:font-medium leading-relaxed tracking-normal sm:tracking-wide drop-shadow line-clamp-2 sm:line-clamp-none"
                >
                  {currentSlide.subheading || currentSlide.description}
                </motion.p>
              )}

              {/* Refined Minimal Buttons on Mobile, Classic WSP on Desktop */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="mt-3.5 sm:mt-10 flex flex-row items-center justify-start sm:justify-center gap-2 sm:gap-5 w-auto"
              >
                <Link
                  href={currentSlide.primaryActionHref || '/services'}
                  className="px-3.5 py-2 sm:px-11 sm:py-4 rounded-full sm:rounded-none bg-[#FB1D10] hover:bg-[#e0190c] text-white text-[11px] xs:text-[12px] sm:text-[15px] font-semibold sm:font-bold shadow-lg inline-flex items-center justify-center gap-1.5 sm:gap-2.5 transition-all hover:scale-105"
                >
                  <span>{currentSlide.primaryActionText || 'Explore our services'}</span>
                  <ArrowRight size={13} className="sm:w-[17px] sm:h-[17px]" />
                </Link>
                <Link
                  href="/contact"
                  className="px-3.5 py-2 sm:px-9 sm:py-4 rounded-full sm:rounded-none bg-white/10 hover:bg-white/20 sm:bg-transparent border border-white/20 sm:border-white/60 text-white hover:text-white sm:hover:bg-white sm:hover:text-[#141212] text-[11px] xs:text-[12px] sm:text-[15px] font-medium sm:font-bold backdrop-blur-md sm:backdrop-blur-none shadow-lg inline-flex items-center justify-center gap-1.5 sm:gap-2 transition-all hover:scale-105"
                >
                  <Send size={12} className="sm:w-[15px] sm:h-[15px]" />
                  <span>Send Enquiry</span>
                </Link>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Slide Indicator Bars on Bottom Left - Adjusted for mobile clearance */}
        {!hasVideo && slides.length > 1 && (
          <div className="absolute bottom-3 left-4 sm:bottom-8 sm:left-10 lg:left-14 z-20 flex items-center gap-1.5 sm:gap-2.5">
            {slides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveSlide(idx)}
                className={`h-[2.5px] sm:h-[3px] transition-all duration-300 cursor-pointer ${
                  idx === activeSlide ? 'w-6 sm:w-10 bg-[#F4382D]' : 'w-3.5 sm:w-5 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}

        {/* Bottom Right Pause / Play Control Icon ('||') - Adjusted for mobile */}
        {!hasVideo && slides.length > 1 && (
          <div className="absolute bottom-2.5 right-4 sm:bottom-8 sm:right-10 lg:right-14 z-20">
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="text-white/80 hover:text-white p-1.5 sm:p-2.5 cursor-pointer transition-colors flex items-center justify-center bg-black/40 hover:bg-black/60 rounded-full backdrop-blur-sm"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <span className="font-mono text-[12px] sm:text-[17px] font-black tracking-[-0.15em] leading-none select-none px-0.5">
                  ||
                </span>
              ) : (
                <Play size={12} className="sm:w-4 sm:h-4" fill="currentColor" />
              )}
            </button>
          </div>
        )}
      </section>

      {/* =========================================================================
          SECTION 2: MANIFESTO & KEY FACTS (85,000 / 200,000 WSP METRICS)
          Exact WSP Layout: Dark pitch background (#141212), Left has large statement paragraph
          and red outline button, Right has huge red numbers and labels.
          ========================================================================= */}
      <section className="wsp-manifesto bg-[#0B0D12] text-white py-20 md:py-28 border-b border-white/[0.08]">
        <motion.div
          initial={{ opacity: 0, y: 45, filter: 'blur(4px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true, amount: 0.12 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-[1440px] mx-auto px-6 md:px-12"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            {/* Left Column: Bold Impact Statement & Outline Button */}
            <div className="lg:col-span-7 space-y-6">
              <span className="inline-flex items-center gap-2 text-[12px] font-mono uppercase tracking-[0.2em] font-semibold">
                <span className="text-[#3B82F6]">{manSec.content?.eyebrowBlue || 'GEOSPATIAL PRECISION'}</span>
                <span className="text-neutral-500">•</span>
                <span className="text-[#FB1D10]">{manSec.content?.eyebrowRed || 'ENGINEERING EXCELLENCE'}</span>
              </span>
              <p className="text-[23px] sm:text-[27px] md:text-[32px] font-normal leading-[1.35] tracking-[-0.015em] text-white">
                {manSec.title || 'Geospatial Works is an engineering, geospatial, and precision surveying consultancy delivering integrated technical solutions for infrastructure development, spatial planning, and sustainable resource management across Bangladesh.'}
              </p>
              <p className="text-base sm:text-lg text-neutral-400 font-light leading-relaxed">
                {manSec.content?.subtext || 'Combining engineering expertise with advanced geospatial technologies, modern surveying instruments, and digital design capabilities, we support projects from field data acquisition and spatial analysis to engineering design and 3D visualization.'}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link href={manSec.content?.btnHref || '/about'} className="wsp-btn wsp-btn-outline-blue btn-slice">
                  {manSec.content?.btnText || 'Who we are'}
                </Link>
                <Link href="/contact" className="wsp-btn wsp-btn-solid text-xs !bg-[#F4382D] hover:!bg-[#d92a20] text-white inline-flex items-center gap-1.5 font-bold">
                  <Send size={13} />
                  <span>Send Enquiry</span>
                </Link>
              </div>
            </div>

            {/* Right Column: Key Global/National Metrics (Dual Brand Blue & Red Numbers) */}
            <div className="lg:col-span-5 space-y-12 lg:pl-10">
              <div className="border-t border-white/10 pt-6 lg:border-t-0 lg:pt-0">
                <span className="block text-[13px] font-semibold tracking-wider text-neutral-400 uppercase">
                  {manSec.content?.metric1Label || 'Area Surveyed & Mapped'}
                </span>
                <div className="text-[64px] sm:text-[80px] md:text-[96px] font-extrabold text-[#3B82F6] leading-[0.95] tracking-[-0.04em] mt-1">
                  {manSec.content?.metric1Val || '1,500+'} <span className="text-[36px] font-bold text-white/80">{manSec.content?.metric1Unit || 'km²'}</span>
                </div>
                <span className="block text-[11px] font-mono text-neutral-400 mt-2">
                  {manSec.content?.metric1Sub || 'Corridors & Agricultural Basins Surveyed'}
                </span>
              </div>

              <div>
                <span className="block text-[13px] font-semibold tracking-wider text-neutral-400 uppercase">
                  {manSec.content?.metric2Label || 'National Infrastructure Projects'}
                </span>
                <div className="text-[64px] sm:text-[80px] md:text-[96px] font-extrabold text-[#FB1D10] leading-[0.95] tracking-[-0.04em] mt-1">
                  {manSec.content?.metric2Val || '35+'}
                </div>
                <span className="block text-[11px] font-mono text-neutral-400 mt-2">
                  {manSec.content?.metric2Sub || 'Completed National Infrastructure Commissions'}
                </span>
              </div>
            </div>
          </div>

          {/* Institutional Clients & Authority Engagements */}
          <div className="mt-20 pt-16 border-t border-white/10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
              <div>
                <span className="block text-[11px] font-mono uppercase tracking-[0.25em] text-[#3B82F6] font-semibold mb-2">
                  INSTITUTIONAL PARTNERS & AUTHORITIES
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  Trusted by Bangladesh’s Infrastructure Authorities
                </h3>
              </div>
              <span className="text-xs font-mono text-neutral-400">
                Government Departments & Development Partners
              </span>
            </div>

            {/* Seamless Floating Logo Design — Dynamic from CMS or verified default */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8 sm:gap-10 items-center justify-items-center">
              {((manSec.content?.partners && manSec.content.partners.length > 0)
                ? manSec.content.partners
                : [
                    {
                      name: 'Dhaka North City Corporation',
                      short: 'DNCC',
                      subtext: 'City Corporation',
                      logo: '/partners/partner_2.webp',
                    },
                    {
                      name: 'Bangladesh Railway',
                      short: 'Bangladesh Railway',
                      subtext: 'Rail Authority',
                      logo: '/partners/bangladesh_railway.svg',
                    },
                    {
                      name: 'BADC (Agriculture)',
                      short: 'BADC',
                      subtext: 'Agri Development',
                      logo: '/partners/badc_logo_clean.png',
                    },
                    {
                      name: 'LGED (Local Govt)',
                      short: 'LGED',
                      subtext: 'Engineering Dept',
                      logo: '/partners/partner_4.png',
                    },
                    {
                      name: 'DTCA (Dhaka Transit)',
                      short: 'DTCA',
                      subtext: 'Transit Coordination',
                      logo: '/partners/bangladesh_govt_seal.svg',
                    },
                    {
                      name: 'Asian Development Bank',
                      short: 'ADB',
                      subtext: 'Development Bank',
                      logo: '/partners/asian_development_bank.svg',
                    },
                  ]
              ).map((auth: any, idx: number) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  className="group relative flex flex-col items-center justify-center text-center w-full py-6 px-3 cursor-pointer"
                >
                  {/* Glowing dynamic background aura */}
                  <div className="logo-ambient-glow" />

                  {/* Pure Floating Logo with Spring Lift & Hover Tilt */}
                  <div className="relative h-18 sm:h-22 w-full flex items-center justify-center logo-interactive z-10">
                    <img
                      src={auth.logo}
                      alt={auth.name}
                      className="max-h-16 sm:max-h-20 max-w-[125px] object-contain filter brightness-95 contrast-105 group-hover:brightness-110 drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)] transition-all duration-300"
                      loading="lazy"
                    />
                  </div>

                  {/* Clean Minimalist Typography with animated underline */}
                  <div className="mt-5 space-y-1 z-10 w-full">
                    <span className="font-bold text-xs sm:text-sm tracking-wider text-neutral-300 group-hover:text-white transition-colors uppercase block">
                      {auth.short || auth.name}
                    </span>
                    <div className="logo-underline-expand" />
                    <span className="text-[10px] font-mono text-neutral-500 group-hover:text-[#FB1D10] transition-colors block uppercase tracking-wider pt-1">
                      {auth.subtext}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* =========================================================================
          SECTION 3: "CORE CAPABILITIES & SPECIALIZATIONS" ("Shaping the Future")
          WSP Side-Bleed Momentum Drag Layout matching uploaded reference:
          - Top row: Big bold title "Shaping the future" / "CORE CAPABILITIES" with < > arrows on far right
          - Horizontal swipe track bleeding seamlessly past screen edges with continuous momentum drag
          - Below track: Manifesto paragraph and styled action button
          ========================================================================= */}
      <section className="wsp-shaping bg-[#FFFFFF] text-[#141212] pt-14 pb-16 md:pt-18 md:pb-20 overflow-hidden select-none">
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full"
        >
          {/* Top Header Row with Title and Arrow Controls on the right */}
          <div className="max-w-[1440px] mx-auto px-6 md:px-12 flex items-end justify-between gap-6 pb-6 border-b border-neutral-200/80">
            <div>
              <span className="block text-[11px] sm:text-[12px] font-mono uppercase tracking-[0.24em] text-[#FB1D10] font-bold mb-2">
                {shapingSec.subtitle || 'CORE CAPABILITIES & SPECIALIZATIONS'}
              </span>
              <h2 className="text-[34px] sm:text-[46px] md:text-[54px] lg:text-[60px] font-black tracking-[-0.035em] leading-[1.05] text-[#141212]">
                {shapingSec.title || 'Shaping the future'}
              </h2>
            </div>

            {/* Carousel Arrow Controls */}
            <div className="flex items-center gap-2 shrink-0 mb-1">
              <button
                type="button"
                onClick={() => scrollServices('left')}
                className="w-10 h-10 border border-neutral-300 hover:border-[#3B82F6] hover:text-[#3B82F6] hover:bg-neutral-50 active:scale-95 flex items-center justify-center transition-all duration-150 cursor-pointer shadow-2xs select-none"
                aria-label="Previous capabilities"
              >
                <ChevronLeft size={18} className="text-current" />
              </button>
              <button
                type="button"
                onClick={() => scrollServices('right')}
                className="w-10 h-10 border border-neutral-300 hover:border-[#3B82F6] hover:text-[#3B82F6] hover:bg-neutral-50 active:scale-95 flex items-center justify-center transition-all duration-150 cursor-pointer shadow-2xs select-none"
                aria-label="Next capabilities"
              >
                <ChevronRight size={18} className="text-current" />
              </button>
            </div>
          </div>

          {/* Horizontal Card Track with Left/Right Bleed & Continuous Momentum Drag */}
          <div
            ref={servicesScrollRef}
            onMouseDown={handleServicesMouseDown}
            onDragStart={(e) => e.preventDefault()}
            className="flex gap-6 sm:gap-7 overflow-x-auto scrollbar-none pt-8 pb-8 px-6 md:px-12 select-none cursor-grab active:cursor-grabbing scroll-smooth"
          >
            {serviceList.map((svc, i) => (
              <div
                key={svc.slug || i}
                className="w-[260px] sm:w-[300px] md:w-[330px] lg:w-[350px] shrink-0"
              >
                <Link
                  href={`/services/${svc.slug}`}
                  onClick={(e) => {
                    if (servicesHasDraggedRef.current) {
                      e.preventDefault();
                    }
                  }}
                  draggable={false}
                  onDragStart={(e) => e.preventDefault()}
                  className="group block relative"
                >
                  {/* Clean Visual Card Image matching exact WSP aspect & look */}
                  <div className="aspect-[16/10] overflow-hidden bg-neutral-100 relative border border-neutral-200/90 group-hover:border-[#3B82F6] transition-all duration-300 shadow-sm group-hover:shadow-[0_10px_30px_rgba(59,130,246,0.18)]">
                    <img
                      src={svc.imageUrl || '/real-media/service-topographic-uav.png'}
                      alt={svc.title}
                      className="w-full h-full object-cover group-hover:scale-[1.04] group-hover:brightness-105 transition-transform duration-700 ease-out pointer-events-none"
                    />
                    {/* Top-Right Corner Accent */}
                    <div className="absolute top-0 right-0 w-5 h-5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="absolute top-0 right-0 w-full h-[2px] bg-[#3B82F6]" />
                      <span className="absolute top-0 right-0 h-full w-[2px] bg-[#3B82F6]" />
                    </div>
                  </div>

                  {/* Clean Bold Title directly underneath photo */}
                  <h3 className="text-[17px] sm:text-[19px] font-bold text-[#141212] mt-3.5 leading-snug tracking-[-0.02em] group-hover:text-[#3B82F6] transition-colors">
                    {svc.title}
                  </h3>
                </Link>
              </div>
            ))}
          </div>

          {/* Bottom Manifesto & Action Button matching WSP Layout */}
          <div className="max-w-[1440px] mx-auto px-6 md:px-12 pt-2">
            <div className="max-w-[760px] space-y-6">
              <p className="text-[17px] sm:text-[19px] font-normal leading-[1.5] text-neutral-800">
                {shapingSec.content?.manifestoQuote || shapingSec.content?.description || 'We combine future-focused thinking and technical know-how to power local impact. Our teams develop deep understanding and a partnership of trust with our clients across over 100 sectors and services.'}
              </p>

              <div>
                <Link
                  href={shapingSec.content?.btnHref || '/services'}
                  className="group relative inline-flex items-center gap-2.5 px-6 py-2.5 border border-neutral-300 hover:border-neutral-900 bg-white hover:bg-neutral-950 text-neutral-900 hover:text-white text-[13px] font-semibold tracking-wide transition-all duration-200"
                >
                  <span>{shapingSec.content?.btnText || 'What we do'}</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-200" />
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* =========================================================================
          SECTION 4: "PIONEERING PROJECTS" (FEATURED PROJECT SHOWCASE)
          Exact WSP Layout: Pure white background (#FFFFFF), horizontal multi-card scrollable track,
          Left edge bleed: previous card peeks from left screen edge, active card centered/dominant,
          Right column with two-line bold title, narrative, "View all projects" button, and < > 1 — 8 pager.
          Hover glow: luminous corner bloom outwards in brand electric blue & survey red.
          ========================================================================= */}
      <section className="wsp-projects bg-[#FFFFFF] text-[#141212] py-20 md:py-28 overflow-hidden select-none">
        <div className="w-full flex flex-col lg:flex-row items-start justify-between gap-8 lg:gap-12">
          
          {/* Left Column: Horizontal Scrollable Carousel bleeding from left screen edge */}
          <div className="w-full lg:w-[68%] xl:w-[72%] relative min-w-0">
            <div
              ref={scrollProjectsRef}
              onScroll={handleProjectsScroll}
              onMouseDown={handleMouseDown}
              onDragStart={(e) => e.preventDefault()}
              className="flex gap-6 sm:gap-8 overflow-x-auto scrollbar-none py-6 pl-4 sm:pl-6 lg:pl-0 pr-8 select-none cursor-grab active:cursor-grabbing"
            >
              {extendedProjects.map((project, idx) => (
                <div
                  key={`${project.id}-${idx}`}
                  className="w-[85vw] sm:w-[580px] md:w-[660px] lg:w-[700px] xl:w-[760px] shrink-0"
                >
                  <Link
                    href={`/projects/${project.slug}`}
                    onClick={(e) => {
                      if (hasDraggedRef.current) {
                        e.preventDefault();
                      }
                    }}
                    draggable={false}
                    onDragStart={(e) => e.preventDefault()}
                    className="group block relative"
                  >
                    {/* Top Level: Project Image Container with Brand Colored Border */}
                    <div className="aspect-[16/10] overflow-hidden bg-neutral-900 relative shadow-md transition-all duration-500 border-2 border-[#3B82F6]/60 group-hover:border-[#3B82F6] group-hover:shadow-[0_12px_40px_rgba(59,130,246,0.35)]">
                      <img
                        src={project.imageUrl || '/real-media/project-badc-web-ais-khulna.jpg'}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-[1.03] group-hover:brightness-105 transition-all duration-700 ease-out pointer-events-none"
                        draggable={false}
                      />

                      {/* Luminous Corner Radiant Glow Blooms (Blooming outwards from corners!) */}
                      <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-[radial-gradient(circle,_rgba(59,130,246,0.7)_0%,_rgba(59,130,246,0.2)_45%,_transparent_75%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl pointer-events-none z-20" />
                      <div className="absolute -bottom-12 -left-12 w-64 h-64 rounded-full bg-[radial-gradient(circle,_rgba(251,29,16,0.55)_0%,_rgba(251,29,16,0.15)_45%,_transparent_75%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl pointer-events-none z-20" />

                      {/* Subtle Ambient Corner Flash from Top-Right */}
                      <div className="absolute top-0 right-0 w-44 h-44 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.45)_0%,_transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10" />

                      {/* Precision Brand Corner Accents */}
                      <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none z-20">
                        <span className="absolute top-0 right-0 w-full h-[2.5px] bg-[#3B82F6]" />
                        <span className="absolute top-0 right-0 h-full w-[2.5px] bg-[#3B82F6]" />
                      </div>
                      <div className="absolute bottom-0 left-0 w-8 h-8 pointer-events-none z-20">
                        <span className="absolute bottom-0 left-0 w-full h-[2.5px] bg-[#FB1D10]" />
                        <span className="absolute bottom-0 left-0 h-full w-[2.5px] bg-[#FB1D10]" />
                      </div>
                    </div>

                    {/* Below Image: Location & Title (Matching WSP Reference Exactly!) */}
                    <div className="mt-4 sm:mt-5 space-y-1 sm:space-y-1.5">
                      <span className="text-[11px] sm:text-[12px] font-semibold uppercase tracking-[0.16em] text-neutral-500 group-hover:text-[#3B82F6] transition-colors block">
                        {project.location || 'DHAKA, BANGLADESH'}
                      </span>
                      <h3 className="text-[20px] sm:text-[24px] lg:text-[26px] font-bold text-[#141212] leading-[1.22] tracking-[-0.02em] group-hover:text-[#FB1D10] transition-colors line-clamp-2">
                        {project.title}
                      </h3>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Title, Narrative, Button & Pager */}
          <div className="w-full lg:w-[32%] xl:w-[28%] px-6 sm:px-8 lg:px-0 lg:pr-12 xl:pr-16 shrink-0 space-y-6 lg:pt-2">
            <h2 className="text-[38px] sm:text-[46px] lg:text-[52px] font-extrabold tracking-[-0.035em] leading-[1.06] text-[#141212]">
              {projSec.title || <>Pioneering<br />projects</>}
            </h2>

            <p className="text-[16px] sm:text-[17px] font-normal leading-[1.55] text-neutral-600 max-w-sm">
              {projSec.content?.description || 'Across Bangladesh, we work with clients to dream big, challenge conventions and transform our world for the better.'}
            </p>

            <div className="pt-2">
              <Link
                href={projSec.content?.btnHref || '/projects'}
                className="inline-block px-7 py-3 border border-[#8B1D1D] sm:border-[#141212] hover:border-[#FB1D10] text-[13px] font-semibold uppercase tracking-[0.12em] text-[#141212] hover:text-[#FB1D10] transition-all duration-200"
              >
                {projSec.content?.btnText || 'View all projects'}
              </Link>
            </div>

            {/* Pager: < > 1 — 8 */}
            <div className="flex items-center gap-6 pt-6">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => scrollProjects('left')}
                  className="w-10 h-10 border border-neutral-300 hover:border-neutral-900 active:scale-95 hover:bg-neutral-100 flex items-center justify-center text-[#141212] transition-all duration-150 cursor-pointer shadow-2xs select-none"
                  aria-label="Previous project"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => scrollProjects('right')}
                  className="w-10 h-10 border border-neutral-300 hover:border-neutral-900 active:scale-95 hover:bg-neutral-100 flex items-center justify-center text-[#141212] transition-all duration-150 cursor-pointer shadow-2xs select-none"
                  aria-label="Next project"
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              <div className="text-[14px] font-semibold text-[#141212] tracking-wider font-mono">
                <span>{activeProjectIdx + 1}</span> — {projectList.length}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 5: PHYSICAL & TECHNICAL RESOURCES (FROM SLIDE 42-44)
          Multi-brand geodetic fleet, enterprise UAV drones, RTK GNSS & GIS workstations.
          ========================================================================= */}
      <section className="wsp-resources bg-[#0B0D12] text-white py-24 md:py-32 border-t border-b border-white/[0.08]">
        <motion.div
          initial={{ opacity: 0, y: 45, filter: 'blur(4px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true, amount: 0.12 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-[1440px] mx-auto px-6 md:px-12 space-y-16"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 border-b border-white/10">
            <div>
              <span className="block text-[12px] sm:text-[13px] font-mono uppercase tracking-[0.25em] text-[#FB1D10] mb-3 font-bold">
                {equipSec.subtitle || 'PHYSICAL & TECHNICAL RESOURCES'}
              </span>
              <h2 className="text-[44px] sm:text-[56px] md:text-[68px] lg:text-[76px] font-extrabold tracking-[-0.035em] leading-[0.98] text-white">
                {equipSec.title ? equipSec.title : <>Instruments &amp; <span className="text-[#3B82F6]">facilities</span></>}
              </h2>
            </div>
            <p className="text-neutral-400 max-w-md text-sm sm:text-base leading-relaxed">
              {equipSec.content?.description || 'Geospatial Works maintains an extensive inventory of geodetic GNSS receivers, enterprise UAV systems, optical instruments, and dedicated high-performance workstations.'}
            </p>
          </div>

          {/* 3-Column Equipment Cards with Exact Slide Data (Slides 42 & 43) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1: GNSS Satellite Positioning (Slide 42) */}
            <div className="border border-white/10 bg-neutral-950 p-8 space-y-6 hover:border-[#3B82F6]/60 transition-colors group">
              <div className="aspect-[4/3] overflow-hidden bg-neutral-900 border border-white/5">
                <img
                  src="/real-media/slide_42_img_193.jpg"
                  alt="CHCNAV i83 RTK GNSS Receiver"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="space-y-3">
                <span className="text-[11px] font-mono text-[#3B82F6] uppercase tracking-wider block font-bold">
                  GNSS POSITIONING • 8 UNITS
                </span>
                <h3 className="text-xl font-bold text-white uppercase group-hover:text-[#3B82F6] transition-colors">
                  CHCNAV i83 RTK GNSS
                </h3>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  Eight CHCNAV i83 units tracking 1,408 channels with static GNSS and GSM-based RTK operation up to 30 km range for millimeter-level geodetic control and boundary demarcation.
                </p>
                <div className="pt-3 border-t border-white/5 flex flex-wrap gap-2 text-[11px] font-mono text-neutral-400">
                  <span className="px-2 py-1 bg-white/5 border border-white/5">1,408 Channels</span>
                  <span className="px-2 py-1 bg-white/5 border border-white/5">30 km GSM Range</span>
                  <span className="px-2 py-1 bg-white/5 border border-white/5">Static & RTK</span>
                </div>
              </div>
            </div>

            {/* Card 2: UAV Drone Fleet (Slide 42) */}
            <div className="border border-white/10 bg-neutral-950 p-8 space-y-6 hover:border-[#FB1D10]/50 transition-colors group">
              <div className="aspect-[4/3] overflow-hidden bg-neutral-900 border border-white/5">
                <img
                  src="/real-media/equipment-drone-fleet.jpg"
                  alt="DJI Enterprise Drone Fleet"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="space-y-3">
                <span className="text-[11px] font-mono text-[#FB1D10] uppercase tracking-wider block font-bold">
                  AERIAL MAPPING • 3 AIRFRAMES
                </span>
                <h3 className="text-xl font-bold text-white uppercase group-hover:text-[#FB1D10] transition-colors">
                  DJI Enterprise Fleet
                </h3>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  DJI Mavic 3 Enterprise, Mavic 3 Multispectral, and Matrice 4 Enterprise with 7 dedicated batteries per model for uninterrupted aerial photogrammetry and multispectral sensing.
                </p>
                <div className="pt-3 border-t border-white/5 flex flex-wrap gap-2 text-[11px] font-mono text-neutral-400">
                  <span className="px-2 py-1 bg-white/5 border border-white/5">Mavic 3 Enterprise</span>
                  <span className="px-2 py-1 bg-white/5 border border-white/5">Multispectral</span>
                  <span className="px-2 py-1 bg-white/5 border border-white/5">Matrice 4 Enterprise</span>
                </div>
              </div>
            </div>

            {/* Card 3: Optical & Hydrographic (Slide 43) */}
            <div className="border border-white/10 bg-neutral-950 p-8 space-y-6 hover:border-[#3B82F6]/60 transition-colors group">
              <div className="aspect-[4/3] overflow-hidden bg-neutral-900 border border-white/5">
                <img
                  src="/real-media/slide_43_total_station.png"
                  alt="Total Stations & Optical Instruments"
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="space-y-3">
                <span className="text-[11px] font-mono text-[#3B82F6] uppercase tracking-wider block font-bold">
                  TERRESTRIAL & HYDROGRAPHIC
                </span>
                <h3 className="text-xl font-bold text-white uppercase group-hover:text-[#3B82F6] transition-colors">
                  Total Stations & Sounders
                </h3>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  Multi-brand total stations (Topcon, Sokkia, CHCNAV, Kolida), Sokkia B 20A and Topcon AT B 3 automatic levels, and CHCNAV D270 digital echo sounder for bathymetric depth surveys.
                </p>
                <div className="pt-3 border-t border-white/5 flex flex-wrap gap-2 text-[11px] font-mono text-neutral-400">
                  <span className="px-2 py-1 bg-white/5 border border-white/5">Sokkia / Topcon</span>
                  <span className="px-2 py-1 bg-white/5 border border-white/5">Echo Sounder D270</span>
                  <span className="px-2 py-1 bg-white/5 border border-white/5">Automatic Levels</span>
                </div>
              </div>
            </div>
          </div>

          {/* Slide 44: Computational Hardware & Specialized Software Suite */}
          <div className="p-5 sm:p-6 border border-white/10 bg-neutral-950/70 space-y-5">
            {/* Header: Clean, Compact, Architectural */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#3B82F6] font-bold block">
                  PROCESSING LAB &amp; SOFTWARE ARCHITECTURE
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  {equipSec.content?.labTitle || 'High-Throughput Spatial Compute & Modeling Stack'}
                </h3>
              </div>
              <p className="text-xs text-neutral-400 max-w-md leading-relaxed hidden sm:block">
                Multi-core workstation nodes, DDR5 memory, NVIDIA RTX acceleration, and 40TB centralized NAS for photogrammetry, GIS geodatabases, and BIM models.
              </p>
            </div>

            {/* Workstations Specification Grid: Dynamic or Default */}
            <div className="border border-white/10 divide-y sm:divide-y-0 sm:divide-x divide-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 bg-black/40">
              {(
                equipSec.content?.workstations && equipSec.content.workstations.length > 0
                  ? equipSec.content.workstations
                  : [
                      { id: 'NODE 01', cpu: 'Intel Core i9', ram: '64GB DDR5', gpu: 'RTX 4060 Ti', isAccent: false },
                      { id: 'NODE 02', cpu: 'Intel Core i9', ram: '64GB DDR5', gpu: 'RTX 4060 Ti', isAccent: false },
                      { id: 'NODE 03', cpu: 'Intel Ultra 7', ram: '64GB DDR5', gpu: 'RTX 5060 Ti', isAccent: true },
                      { id: 'NODE 04', cpu: 'Intel Core i7', ram: '32GB DDR5', gpu: 'Processing Node', isAccent: false },
                    ]
              ).map((node: any) => (
                <div key={node.id} className="p-4 sm:p-5 flex flex-col justify-between hover:bg-white/[0.02] transition-colors">
                  <div>
                    <span className={`text-[10px] font-mono tracking-[0.16em] uppercase font-bold block mb-1.5 ${node.isAccent ? 'text-[#FB1D10]' : 'text-[#3B82F6]'}`}>
                      {node.id}
                    </span>
                    <div className="text-[17px] font-bold text-white tracking-tight">
                      {node.cpu}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono">
                    <span className="text-neutral-400">{node.ram}</span>
                    <span className={`font-semibold ${node.isAccent ? 'text-[#FB1D10]' : node.gpu === 'Processing Node' ? 'text-neutral-400' : 'text-[#3B82F6]'}`}>
                      {node.gpu}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Central Storage Strip */}
            <div className="px-5 py-3 border border-white/10 bg-black/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-[#3B82F6]" />
                <span className="text-white font-bold tracking-wider">
                  CENTRALIZED 40TB NAS REPOSITORY:
                </span>
                <span className="text-neutral-400">
                  {equipSec.content?.nasText || 'UAV Point Clouds • Orthomosaics • LiDAR & Geodatabases'}
                </span>
              </div>
              <span className="text-[#3B82F6] font-bold uppercase tracking-wider shrink-0">
                24/7 Redundant Storage
              </span>
            </div>

            {/* Software Facilities: Dynamic Software Badges & Logos Banner */}
            <div className="pt-2.5 border-t border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#3B82F6] font-bold">
                  CORE GEOSPATIAL &amp; ENGINEERING SOFTWARE
                </span>
                <span className="text-[11px] font-mono text-neutral-400">
                  {equipSec.content?.softwareList && equipSec.content.softwareList.length > 0
                    ? `${equipSec.content.softwareList.length} Enterprise Tools`
                    : 'Enterprise Geospatial Suite'}
                </span>
              </div>

              {equipSec.content?.softwareList && equipSec.content.softwareList.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1">
                  {equipSec.content.softwareList.map((sw: any, idx: number) => (
                    <div key={idx} className="p-2.5 bg-neutral-900/80 border border-white/10 rounded space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-mono uppercase text-neutral-400 truncate">{sw.category}</span>
                        <span className="text-[9px] font-mono font-bold text-[#3B82F6]">{sw.badge}</span>
                      </div>
                      <div className="text-xs font-bold text-white truncate">{sw.name}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* High-Impact Full-Width Software Logos Banner */}
              <div className="w-full pt-1 pb-0">
                <img
                  src="/software-logos/geospatial-logos-banner-dark-trimmed.png"
                  alt="ArcGIS Pro, QGIS, Agisoft Metashape, AutoCAD Civil 3D, Leica Geo Office"
                  className="w-full h-auto max-h-[64px] sm:max-h-[76px] md:max-h-[88px] lg:max-h-[96px] object-contain mx-auto transition-all duration-300 opacity-95 hover:opacity-100 hover:scale-[1.01] drop-shadow-[0_8px_32px_rgba(59,130,246,0.35)] pointer-events-none select-none"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* =========================================================================
          SECTION 5.5: "INNOVATIVE THINKING" & "LATEST NEWS"
          Exact WSP Layout: Dark pitch background (#141212). Top has 3 article cards,
          Bottom has "Latest news" on left and interactive news list with red dates on right.
          ========================================================================= */}
      <section className="wsp-insights bg-[#0B0D12] text-white py-24 md:py-32 border-b border-white/[0.08]">
        <motion.div
          initial={{ opacity: 0, y: 45, filter: 'blur(4px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true, amount: 0.12 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-[1440px] mx-auto px-6 md:px-12 space-y-20"
        >
          {/* Top Half: Innovative Thinking */}
          <div>
            <div className="flex items-center justify-between pb-10 border-b border-white/10">
              <div>
                <span className="block text-[12px] sm:text-[13px] font-mono uppercase tracking-[0.25em] text-[#3B82F6] font-bold mb-3">
                  RESEARCH & APPLIED GEODESY
                </span>
                <h2 className="text-[44px] sm:text-[56px] md:text-[68px] lg:text-[76px] font-extrabold tracking-[-0.035em] leading-[0.98] text-white">
                  Innovative <span className="text-[#3B82F6]">thinking</span>
                </h2>
              </div>

              <Link href="/insights" className="wsp-btn wsp-btn-outline-blue btn-slice">
                Read all insights
              </Link>
            </div>

            {/* 3-Column Visual Article Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-10">
              {[
                {
                  title: 'Rapid Deployment of DJI Matrice 4E UAV Photogrammetry for DTCA Bus Route Rationalization',
                  img: '/projects-extracted/page_31/img_01.jpg',
                  slug: 'dtca-bus-route-rationalization',
                  tag: 'UAV PHOTOGRAMMETRY',
                  isBlue: true,
                },
                {
                  title: 'Generating 0.20cm Digital Terrain Models & High-Resolution Orthomosaics for Railway Bypasses',
                  img: '/projects-extracted/page_29/img_02.jpg',
                  slug: 'abdulpur-railway-bypass',
                  tag: 'TERRAIN MODELING',
                  isBlue: false,
                },
                {
                  title: 'Coastal Mangrove Accretion Assessment Using RTK-Enabled UAVs for Bangladesh Forest Department',
                  img: '/projects-extracted/page_25/img_02.jpg',
                  slug: 'coastal-mangrove-assessment',
                  tag: 'REMOTE SENSING',
                  isBlue: true,
                },
              ].map((article, i) => (
                <Link
                  key={i}
                  href={`/insights/${article.slug}`}
                  className="group block space-y-4"
                >
                  <div className="aspect-[16/10] overflow-hidden bg-neutral-900 relative">
                    <img
                      src={article.img}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                    <div className={`absolute top-3 left-3 text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 text-white ${article.isBlue ? 'bg-[#3B82F6]' : 'bg-[#FB1D10]'}`}>
                      {article.tag}
                    </div>
                  </div>
                  <h3 className="text-[19px] font-bold text-white leading-snug group-hover:text-[#3B82F6] transition-colors">
                    {article.title}
                  </h3>
                </Link>
              ))}
            </div>
          </div>

          {/* Bottom Half: Latest News */}
          <div className="pt-10 border-t border-white/10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
              {/* Left: Latest News Header & Button */}
              <div className="lg:col-span-4 space-y-8">
                <h3 className="text-[34px] sm:text-[44px] font-extrabold tracking-[-0.03em] leading-none text-white">
                  Latest news
                </h3>
                <div>
                  <Link href="/insights" className="wsp-btn wsp-btn-outline btn-slice">
                    Go to the newsroom
                  </Link>
                </div>
              </div>

              {/* Right: Interactive News Entries with Alternating Blue & Red Dates */}
              <div className="lg:col-span-8 divide-y divide-white/10">
                {newsList.map((item, i) => {
                  const isBlue = i % 2 === 0;
                  return (
                    <Link
                      key={i}
                      href={item.href}
                      className="group py-6 first:pt-0 flex items-baseline justify-between gap-6 block hover:bg-white/[0.02] px-2 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-baseline gap-4 sm:gap-8 flex-1">
                        <span className={`text-[14px] font-mono font-bold whitespace-nowrap ${isBlue ? 'text-[#3B82F6]' : 'text-[#FB1D10]'}`}>
                          {item.date}
                        </span>
                        <div className="space-y-1">
                          <span className={`block text-[11px] font-bold uppercase tracking-wider ${isBlue ? 'text-blue-400/90' : 'text-neutral-400'}`}>
                            {item.tag}
                          </span>
                          <h4 className={`text-[18px] sm:text-[20px] font-medium text-white transition-colors leading-snug ${isBlue ? 'group-hover:text-[#3B82F6]' : 'group-hover:text-[#FB1D10]'}`}>
                            {item.title}
                          </h4>
                        </div>
                      </div>

                      <ArrowRight
                        size={20}
                        className={`text-neutral-400 ${isBlue ? 'group-hover:text-[#3B82F6]' : 'group-hover:text-[#FB1D10]'} group-hover:translate-x-1 transition-all flex-none`}
                      />
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* =========================================================================
          SECTION 6: "LEAD AND GROW" (CAREERS)
          Exact WSP Layout: Dark pitch background (#141212), smiling engineer portrait
          with bold red & blue geometric ribbon pattern on left, narrative + two buttons on right.
          ========================================================================= */}
      <section className="wsp-careers bg-[#141212] text-white py-24 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 45, filter: 'blur(4px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true, amount: 0.12 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-[1440px] mx-auto px-6 md:px-12"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left: Professional Portrait with Dual Blue & Red Graphic Motif */}
            <div className="lg:col-span-6 relative">
              {/* Dual Brand Blue & Red Glow Orbs behind image */}
              <div className="absolute -left-6 -top-6 w-36 h-36 bg-[#3B82F6]/25 rounded-full blur-2xl" />
              <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-[#FB1D10]/20 rounded-full blur-2xl" />
              <div className="relative aspect-[4/3] rounded-none overflow-hidden bg-neutral-900 border-l-4 border-[#3B82F6] shadow-2xl">
                <img
                  src="/real-media/career-engineering-team.jpg"
                  alt="Geospatial Works Professional Surveyor"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Right: Narrative & Button Group */}
            <div className="lg:col-span-6 space-y-8">
              <span className="block text-[12px] sm:text-[13px] font-mono uppercase tracking-[0.25em] text-[#3B82F6] font-bold mb-3">
                {cultureSec.subtitle || 'NATIONAL TALENT & ENGINEERING CAREERS'}
              </span>
              <h2 className="text-[44px] sm:text-[56px] md:text-[68px] lg:text-[76px] font-extrabold tracking-[-0.035em] leading-[0.98] text-white">
                {cultureSec.title ? cultureSec.title : <>Lead and <span className="text-[#FB1D10]">grow</span></>}
              </h2>

              <p className="text-[20px] sm:text-[24px] font-normal leading-[1.4] text-neutral-300">
                {cultureSec.content?.description || 'What if you could build a career that’s as unique as you? With us you can.'}
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link href={cultureSec.content?.btn1Href || '/career'} className="wsp-btn wsp-btn-solid btn-slice">
                  {cultureSec.content?.btn1Text || 'Search and apply'}
                </Link>
                <Link href={cultureSec.content?.btn2Href || '/career'} className="wsp-btn wsp-btn-outline-blue btn-slice">
                  {cultureSec.content?.btn2Text || 'Life at Geospatial Works'}
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* =========================================================================
          SECTION 7: KEEP IN TOUCH (STUNNING WSP-STYLE SECTION WITH FORM & MAPBOX)
          ========================================================================= */}
      <KeepInTouchSection />
    </div>
  );
}

