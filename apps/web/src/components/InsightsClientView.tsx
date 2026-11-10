'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, ArrowRight, ArrowUpRight, ChevronDown, ChevronLeft, ChevronRight, Calendar, Sparkles } from 'lucide-react';

interface ArticleItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  date?: string;
  summary: string;
  imageUrl?: string | null;
}

export default function InsightsClientView() {
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [featuredIndex, setFeaturedIndex] = useState<number>(0);
  const [showFeatured, setShowFeatured] = useState<boolean>(true);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  React.useEffect(() => {
    fetch('/api/articles')
      .then((res) => {
        if (!res.ok) throw new Error('API failed');
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          const mapped = data.map((d: any) => ({
            id: d.id,
            slug: d.slug,
            title: d.title,
            category: d.category || 'Press Release',
            date: d.publishDate || undefined,
            summary: d.summary || '',
            imageUrl: d.imageUrl,
          }));
          setArticles(mapped);
          setLoadError(false);
        }
      })
      .catch((err) => {
        console.warn('News articles could not be loaded:', err);
        setLoadError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  const categories = ['All', ...Array.from(new Set(articles.map((article) => article.category)))];

  const filteredArticles = articles.filter((art) => {
    const matchesCategory =
      activeCategory === 'All' || art.category.toLowerCase() === activeCategory.toLowerCase();
    const matchesQuery =
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const featuredList = filteredArticles;
  const activeFeatured = featuredList.length ? featuredList[featuredIndex % featuredList.length] : null;
  const listArticles = filteredArticles.filter((art) => art.id !== activeFeatured?.id);

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
              Read about our completed projects: who they served, where the work took place, and what our team delivered.
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
                FEATURED PROJECT CASE STUDY
              </span>
              <span className="hidden md:inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-100 text-[#F4382D]">
                Project story
              </span>
            </div>

            {/* Right: Responsive Selector Toggle & Navigation */}
            <div className="flex items-center flex-wrap gap-2 sm:gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
              {/* Mobile/Tablet Dropdown Selector */}
              <div className="block lg:hidden flex-1 min-w-[140px] max-w-[240px]">
                <select
                  aria-label="Select featured insight"
                  value={featuredList.length ? featuredIndex % featuredList.length : ''}
                  onChange={(e) => setFeaturedIndex(Number(e.target.value))}
                  disabled={!featuredList.length}
                  className="w-full bg-white text-[12px] font-semibold text-neutral-800 border border-neutral-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-black shadow-2xs truncate"
                >
                  {featuredList.map((fa, idx) => (
                    <option key={fa.id || idx} value={idx}>
                      0{idx + 1}. {fa.category} — {fa.title.slice(0, 30)}...
                    </option>
                  ))}
                </select>
              </div>

              {/* Desktop Selector Pills */}
              <div className="hidden lg:flex items-center bg-white p-1 rounded-xl border border-neutral-200 shadow-2xs">
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
                      <span className="hidden xl:inline ml-1.5 font-medium max-w-[110px] truncate inline-block align-bottom">
                        {fa.category}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Prev / Next Step Arrows */}
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-neutral-200 shadow-2xs shrink-0">
                <button
                  type="button"
                  onClick={() => setFeaturedIndex((prev) => (prev > 0 ? prev - 1 : featuredList.length - 1))}
                  disabled={!featuredList.length}
                  className="p-1.5 rounded-lg text-neutral-500 hover:text-black hover:bg-neutral-100 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Previous Story"
                >
                  <ChevronLeft size={15} />
                </button>
                <span className="text-[11px] font-mono font-bold text-neutral-400 px-1">
                  {featuredList.length ? (featuredIndex % featuredList.length) + 1 : 0}/{featuredList.length}
                </span>
                <button
                  type="button"
                  onClick={() => setFeaturedIndex((prev) => (prev + 1) % featuredList.length)}
                  disabled={!featuredList.length}
                  className="p-1.5 rounded-lg text-neutral-500 hover:text-black hover:bg-neutral-100 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Next Story"
                >
                  <ChevronRight size={15} />
                </button>
              </div>

              {/* Spotlight Toggle Button */}
              <button
                type="button"
                onClick={() => setShowFeatured(!showFeatured)}
                disabled={!featuredList.length}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-neutral-100 border border-neutral-200 rounded-xl text-[11px] font-bold text-neutral-700 transition cursor-pointer shadow-2xs shrink-0"
                title={showFeatured ? 'Collapse featured story' : 'Expand featured story'}
              >
                <span>{showFeatured ? 'Hide' : 'Show'}</span>
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
                  {activeFeatured.imageUrl ? <Image src={activeFeatured.imageUrl} alt={activeFeatured.title} fill sizes="(max-width: 1024px) 100vw, 58vw" quality={72} className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out" /> : <span className="flex h-full items-center justify-center px-8 text-center text-white text-xl font-bold">{activeFeatured.title}</span>}
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
                    {activeFeatured.date && <span className="flex items-center gap-1.5 font-medium drop-shadow-sm">
                      <Calendar size={13} className="text-[#F4382D]" />
                      <span>{activeFeatured.date}</span>
                    </span>}
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
                    0{((featuredIndex % featuredList.length) + 1)} / PROJECT CASE STUDY
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
                    <span>Read the full project story</span>
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
        {loading && <p className="py-12 text-center text-neutral-500" role="status">Loading project stories…</p>}
        {!loading && loadError && <p className="py-12 text-center text-neutral-600" role="alert">Project stories could not be loaded. Please try again shortly.</p>}
        {!loading && !loadError && filteredArticles.length === 0 && <p className="py-12 text-center text-neutral-500">No project stories match those filters yet.</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {listArticles.map((art) => (
            <Link
              key={art.id}
              href={`/insights/${art.slug}`}
              className="group block space-y-4 bg-white border border-neutral-200 p-6 hover:shadow-lg transition-all"
            >
              <div className="aspect-[16/10] overflow-hidden bg-neutral-100 relative">
                {art.imageUrl ? <Image src={art.imageUrl} alt={art.title} fill sizes="(max-width: 768px) 100vw, 33vw" quality={72} className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out" /> : <span className="flex h-full items-center justify-center px-6 text-center text-lg font-bold text-neutral-700">{art.title}</span>}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  {art.date && <span className="text-[12px] font-mono font-bold text-[#F4382D]">{art.date}</span>}
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

