'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, ArrowRight, ArrowUpRight, ChevronDown, ChevronLeft, ChevronRight, Calendar, Sparkles } from 'lucide-react';

interface ArticleItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  date: string;
  summary: string;
  imageUrl: string;
}

const articlesData: ArticleItem[] = [
  {
    id: '1',
    slug: 'river-delta-resilience-bathymetry',
    title: 'River Delta Resilience: Advanced Bathymetric Sounding and Riverbed Morphology Modeling',
    category: 'Case Study',
    date: '26.11.04',
    summary: 'How dual-frequency sonar and acoustic Doppler current profilers (ADCP) provide civil engineers with the cross-section hydrography required to stabilize river training structures along the Jamuna basin.',
    imageUrl: '/geospatial-river-hero.webp',
  },
  {
    id: '2',
    slug: 'rtk-gnss-national-corridor-geodesy',
    title: 'Sub-Centimeter Geodesy: Establishing Reliable Vertical Control for National Transport Corridors',
    category: 'Technical Bulletin',
    date: '26.10.29',
    summary: 'A deep dive into high-precision RTK GNSS base-rover networks, geoid undulation corrections, and benchmark tying across tidal delta floodplains.',
    imageUrl: '/field-surveyor-v2.webp',
  },
  {
    id: '3',
    slug: 'dhaka-wasa-smart-utility-digital-twin',
    title: 'Transforming Municipal Water Distribution into Enterprise GIS Digital Twins',
    category: 'Press Release',
    date: '26.10.15',
    summary: 'Geospatial Works successfully completes subsurface pipeline detection and valve geodatabase integration covering 450 km of municipal pipelines in Dhaka.',
    imageUrl: '/delta-hero-v2.webp',
  },
  {
    id: '4',
    slug: 'high-density-uav-lidar-flood-defenses',
    title: 'High-Density Airborne UAV LiDAR: Piercing Dense Vegetative Canopy for Flood Modeling',
    category: 'Technical Bulletin',
    date: '26.09.28',
    summary: 'Extracting bare-earth digital elevation models (DEM) through dense mangrove and delta vegetation to assist disaster management boards.',
    imageUrl: '/hero-poster.jpg',
  },
  {
    id: '5',
    slug: 'ground-penetrating-radar-urban-expressway',
    title: 'Ground Penetrating Radar in Dense Urban Corridors: Mitigating Utility Strikes',
    category: 'Case Study',
    date: '26.09.12',
    summary: 'Best practices for multi-frequency electromagnetic locating and GPR radargrams prior to deep piling for elevated viaducts.',
    imageUrl: '/inner/field-surveyor.webp',
  },
  {
    id: '6',
    slug: 'national-spatial-data-infrastructure-growth',
    title: 'Geospatial Works Expands Regional Field Survey Bases Across 8 Administrative Divisions',
    category: 'Press Release',
    date: '26.08.30',
    summary: 'Mobilizing certified total station and RTK field survey crews to support expedited infrastructure feasibility studies across Bangladesh.',
    imageUrl: '/inner/field-team.webp',
  },
];

export default function InsightsClientView() {
  const [articles, setArticles] = useState<ArticleItem[]>(articlesData);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [featuredIndex, setFeaturedIndex] = useState<number>(0);
  const [showFeatured, setShowFeatured] = useState<boolean>(true);

  React.useEffect(() => {
    fetch('http://localhost:4000/api/v1/articles')
      .then((res) => {
        if (!res.ok) throw new Error('API failed');
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((d: any) => ({
            id: d.id,
            slug: d.slug,
            title: d.title,
            category: d.category || 'Press Release',
            date: d.publishDate || (d.createdAt ? new Date(d.createdAt).toISOString().split('T')[0] : 'Recent'),
            summary: d.summary || '',
            imageUrl: d.imageUrl || '/delta-hero-v2.webp',
          }));
          setArticles(mapped);
        }
      })
      .catch((err) => {
        console.warn('Using fallback news articles:', err);
      });
  }, []);

  const categories = ['All', 'Press Release', 'Technical Bulletin', 'Case Study'];

  const filteredArticles = articles.filter((art) => {
    const matchesCategory =
      activeCategory === 'All' || art.category.toLowerCase() === activeCategory.toLowerCase();
    const matchesQuery =
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const featuredList = filteredArticles.length > 0 ? filteredArticles : articlesData;
  const activeFeatured = featuredList[featuredIndex % featuredList.length];
  const listArticles = filteredArticles.filter((art) => art.id !== activeFeatured.id);

  return (
    <div className="wsp-insights-page bg-white text-[#141212] pt-6 pb-24">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        {/* Breadcrumb */}
        <div className="text-[12px] font-semibold text-neutral-500 mb-6">
          <Link href="/" className="hover:text-black">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-[#141212]">News & Insights</span>
        </div>

        {/* Page Title & Search Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
          <div className="lg:col-span-8 space-y-5">
            <h1 className="text-[44px] sm:text-[60px] md:text-[72px] font-extrabold text-[#141212] tracking-[-0.035em] leading-none">
              News & Insights
            </h1>
            <p className="text-[18px] sm:text-[22px] font-normal leading-[1.4] text-neutral-700 max-w-[800px]">
              Our geospatial experts offer compelling technical insights, research bulletins, and field case studies reframing river delta resilience, geodetic datums, and smart urban digital twins across Bangladesh.
            </p>
          </div>

          <div className="lg:col-span-4 lg:pt-6">
            <div className="relative border border-neutral-300 focus-within:border-black transition-colors">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles and press releases..."
                className="w-full py-3.5 pl-4 pr-10 text-[14px] text-[#141212] placeholder-neutral-500 outline-none"
              />
              <Search
                size={18}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
              />
            </div>
          </div>
        </div>

        {/* =========================================================================
            FEATURED CONTENT / NEWS SPOTLIGHT SHOWCASE (WITH BEAUTIFUL SELECTOR TOGGLE)
            ========================================================================= */}
        <div className="mb-14 bg-neutral-50 border border-neutral-200/90 rounded-2xl p-5 md:p-7 shadow-xs space-y-6">
          {/* Top Bar matching Mega Menu aesthetic + Sleek Selector Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
            {/* Left: Featured Label */}
            <div className="flex items-center gap-3">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F4382D] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#F4382D]"></span>
              </span>
              <span className="text-[12px] font-extrabold uppercase tracking-widest text-[#141212]">
                FEATURED TECHNICAL BULLETIN &amp; PRESS RELEASE
              </span>
              <span className="hidden md:inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-100 text-[#F4382D]">
                Top Insight
              </span>
            </div>

            {/* Right: Beautiful Selector Toggle & Navigation */}
            <div className="flex items-center flex-wrap gap-2.5 sm:self-auto">
              {/* Quick Selector Pills */}
              <div className="flex items-center bg-white p-1 rounded-xl border border-neutral-200 shadow-2xs">
                {featuredList.slice(0, 5).map((fa, idx) => {
                  const isCurrent = idx === (featuredIndex % featuredList.length);
                  return (
                    <button
                      key={fa.id || idx}
                      type="button"
                      onClick={() => setFeaturedIndex(idx)}
                      className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                        isCurrent
                          ? 'bg-[#141212] text-white shadow-xs'
                          : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100'
                      }`}
                      title={fa.title}
                    >
                      <span>0{idx + 1}</span>
                      <span className="hidden lg:inline ml-1.5 font-medium max-w-[120px] truncate inline-block align-bottom">
                        {fa.category}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Prev / Next Step Arrows */}
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-neutral-200 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setFeaturedIndex((prev) => (prev > 0 ? prev - 1 : featuredList.length - 1))}
                  className="p-1.5 rounded-lg text-neutral-500 hover:text-black hover:bg-neutral-100 transition cursor-pointer"
                  title="Previous Story"
                >
                  <ChevronLeft size={15} />
                </button>
                <span className="text-[11px] font-mono font-bold text-neutral-400 px-1">
                  {(featuredIndex % featuredList.length) + 1}/{featuredList.length}
                </span>
                <button
                  type="button"
                  onClick={() => setFeaturedIndex((prev) => (prev + 1) % featuredList.length)}
                  className="p-1.5 rounded-lg text-neutral-500 hover:text-black hover:bg-neutral-100 transition cursor-pointer"
                  title="Next Story"
                >
                  <ChevronRight size={15} />
                </button>
              </div>

              {/* Spotlight Toggle Button */}
              <button
                type="button"
                onClick={() => setShowFeatured(!showFeatured)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-neutral-100 border border-neutral-200 rounded-xl text-[11px] font-bold text-neutral-700 transition cursor-pointer shadow-2xs"
                title={showFeatured ? 'Collapse featured story' : 'Expand featured story'}
              >
                <span>{showFeatured ? 'Hide Spotlight' : 'Show Spotlight'}</span>
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${showFeatured ? 'rotate-180' : ''}`}
                />
              </button>
            </div>
          </div>

          {/* Featured Content Body */}
          {showFeatured && activeFeatured && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center animate-in fade-in duration-200">
              {/* Media Card matching Mega Menu featured card style */}
              <div className="lg:col-span-7 aspect-[16/10] overflow-hidden rounded-xl bg-neutral-900 relative shadow-md border border-neutral-200">
                <Link href={`/insights/${activeFeatured.slug}`} className="block w-full h-full group">
                  <img
                    src={activeFeatured.imageUrl || '/geospatial-river-hero.webp'}
                    alt={activeFeatured.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/geospatial-river-hero.webp';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-75" />
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-black/80 text-white backdrop-blur-xs">
                      {activeFeatured.category}
                    </span>
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#F4382D] text-white">
                      Featured
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-[12px]">
                    <span className="flex items-center gap-1.5 font-medium drop-shadow-sm">
                      <Calendar size={13} className="text-[#F4382D]" />
                      <span>{activeFeatured.date}</span>
                    </span>
                    <span className="text-[11px] font-mono text-white/80 drop-shadow-sm">
                      Geospatial Works Publications
                    </span>
                  </div>
                </Link>
              </div>

              {/* Text & Content Details */}
              <div className="lg:col-span-5 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#F4382D] font-bold">
                    0{((featuredIndex % featuredList.length) + 1)} / SPOTLIGHT BULLETIN
                  </span>
                </div>

                <Link href={`/insights/${activeFeatured.slug}`} className="group block">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#141212] leading-tight group-hover:text-[#F4382D] transition-colors">
                    {activeFeatured.title}
                  </h2>
                </Link>

                <p className="text-[14px] sm:text-[15px] text-neutral-600 leading-relaxed font-normal">
                  {activeFeatured.summary}
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <Link
                    href={`/insights/${activeFeatured.slug}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#141212] hover:bg-[#F4382D] text-white text-xs font-bold transition-all shadow-sm group"
                  >
                    <span>Read Full Technical Bulletin</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveCategory(activeFeatured.category);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-neutral-100 border border-neutral-200 text-neutral-700 text-xs font-bold transition cursor-pointer"
                  >
                    <span>Filter: {activeFeatured.category}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Dropdown (No Side Scroll) + Desktop Tabs */}
        <div className="block sm:hidden w-full mb-8">
          <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5 block">
            Filter by Topic
          </label>
          <div className="relative">
            <select
              value={activeCategory}
              onChange={(e) => setActiveCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-bold text-neutral-900 focus:bg-white focus:outline-none focus:border-red-500 appearance-none cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? 'All Insights' : cat}
                </option>
              ))}
            </select>
            <ChevronDown size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
          </div>
        </div>

        {/* Desktop Category Tabs Filter Bar */}
        <div className="hidden sm:flex flex-wrap items-center gap-2 pb-6 border-b border-neutral-200 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2.5 text-[13px] font-bold tracking-wide transition-colors ${
                activeCategory === cat
                  ? 'bg-[#141212] text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              {cat === 'All' ? 'All Insights' : cat}
            </button>
          ))}
        </div>

        {/* 3-Column Grid of Articles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {listArticles.map((art) => (
            <Link
              key={art.id}
              href={`/insights/${art.slug}`}
              className="group block space-y-4 bg-white border border-neutral-200 p-6 hover:shadow-lg transition-all"
            >
              <div className="aspect-[16/10] overflow-hidden bg-neutral-100 relative">
                <img
                  src={art.imageUrl}
                  alt={art.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-[12px] font-mono font-bold text-[#F4382D]">
                    {art.date}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                    {art.category}
                  </span>
                </div>

                <h3 className="text-[19px] font-bold text-[#141212] leading-snug group-hover:text-[#F4382D] transition-colors">
                  {art.title}
                </h3>

                <p className="text-[13px] text-neutral-600 leading-relaxed line-clamp-3">
                  {art.summary}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* WSP Keep in Touch Pre-Footer */}
        <div className="mt-28 pt-16 border-t border-neutral-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <h2 className="text-[36px] sm:text-[48px] font-extrabold tracking-[-0.03em] leading-none text-[#141212]">
            Keep in touch
          </h2>

          <div className="flex flex-wrap items-center gap-4">
            <Link href="/contact" className="wsp-btn wsp-btn-solid">
              Contact us
            </Link>
            <Link href="/contact#office" className="wsp-btn wsp-btn-outline-dark">
              Our Dhaka HQ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

