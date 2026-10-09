'use client';
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FloatingContact from '@/components/FloatingContact';
import ScrollReveal from '@/components/ScrollReveal';
import { Calendar, Clock, ArrowRight, BookOpen, Search, User, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function BlogPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { code: 'all', label: 'All Articles' },
    { code: 'uav', label: 'UAV Mapping' },
    { code: 'cadastral', label: 'Cadastral Surveys' },
    { code: 'gis', label: 'GIS & Databases' },
    { code: 'hydro', label: 'Hydrographic Depth' }
  ];

  const posts = [
    {
      id: 1,
      category: 'uav',
      title: "The Future of UAV Drone Mapping in Bangladesh's Infrastructure Projects",
      summary: "Explore how high-resolution drone photogrammetry is replacing legacy land survey loops, generating sub-centimeter orthomosaics, and accelerating mega highway construction.",
      content: "UAV drone photogrammetry combined with active LiDAR sensors has revolutionized topography capturing in vegetation-dense sectors of the Ganges-Brahmaputra delta. Traditional optical imagery fails to penetrate canopy layers, resulting in inaccurate DTMs. By deploying active LiDAR pulses from the Zenmuse L1 payload on a DJI Matrice 300 RTK, we extract bare-earth measurements (ground classification) within ASPRS Class 1 tolerances, even through thick underbrush.",
      image: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&q=70&w=600",
      date: "May 12, 2026",
      readTime: "5 min read",
      author: "Engr. Alvee Rahman"
    },
    {
      id: 2,
      category: 'cadastral',
      title: "Understanding Cadastral Mouza Sheets: CS, SA, RS, and BS Explained",
      summary: "Navigating Bangladesh's historical land boundary archives. How georeferencing and boundary superimposition verify property coordinates for legal safety.",
      content: "Mouza sheets in Bangladesh span four historical land registries (CS: 1888, SA: 1956, RS: 1965, and modern BS). As these sheets were drawn on varying paper types at scales like 16 inch = 1 mile or 8 inch = 1 mile, they undergo structural warping over decades. Using Helmert boundary coordinate transformations and georeferencing them directly to the Survey of Bangladesh Geodetic Grid, our GIS team resolves boundary disputes with millimeter-level precision.",
      image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=70&w=600",
      date: "April 28, 2026",
      readTime: "7 min read",
      author: "L.S. Kabir Ahmed"
    },
    {
      id: 3,
      category: 'gis',
      title: "Building Interactive Web-GIS Map Portals for Municipal Development",
      summary: "How municipal authorities use open-source mapping engines like QGIS, PostGIS, and Leaflet to map holdings, utilities, and tax collection points.",
      content: "Municipal city corporations in Bangladesh face massive challenges in holding tracking and property tax valuation. By digitizing city grids, linking vector shapes to a central PostgreSQL/PostGIS database, and exposing them on custom React-Mapbox dashboards, administrative officers can query property categories, building heights, ownership details, and water connection statuses with a single click.",
      image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=70&w=600",
      date: "March 18, 2026",
      readTime: "6 min read",
      author: "GIS Lead J. Hossain"
    },
    {
      id: 4,
      category: 'hydro',
      title: "Why Hydrographic Surveying is Essential for River Delta Management",
      summary: "A technical overview of bathymetric mapping, depth echolocation profiling, and siltation volume analysis in critical dredging corridors.",
      content: "Managing siltation in Bangladesh's shipping channels requires constant hydrographic auditing. Deploying digital echo sounders (like the South SDE-28S) tied to dual-frequency RTK GNSS correctors allows us to compute dynamic riverbed profiles. We calculate sediment accumulation rates and volume profiles to optimize capital dredging routes.",
      image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=70&w=600",
      date: "Feb 05, 2026",
      readTime: "4 min read",
      author: "Hydrographer S. Dewan"
    }
  ];

  // Filtering logic
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          post.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#fafdfb] text-gray-900 font-sans selection:bg-green-100 selection:text-green-900 overflow-x-clip flex flex-col justify-between">
      <Navbar />
      <FloatingContact />

      <main className="flex-grow pt-24 md:pt-32">
        {/* Banner Hero */}
        <section className="relative w-full py-16 md:py-28 overflow-hidden bg-gradient-to-br from-[#0c1a10] via-[#050b07] to-[#0a140d] border-b border-emerald-950">
          <div 
            className="absolute inset-0 opacity-[0.18] pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(32, 188, 46, 0.3) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(32, 188, 46, 0.3) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050b07] via-transparent to-[#0c1a10] opacity-80" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] sm:w-[600px] h-[320px] sm:h-[400px] bg-[#20bc2e]/15 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 relative z-10 text-center space-y-6">
            <ScrollReveal variant="slide-up">
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight">
                Geospatial <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#20bc2e] via-emerald-400 to-[#10b981]">Insights & Studies</span>
              </h1>
              <p className="text-gray-300 text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed font-light">
                Deep-dives into surveying technologies, GIS databases, and property boundary laws in Bangladesh.
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* Filter Canvas */}
        <div 
          className="w-full relative overflow-hidden pb-16 sm:pb-24"
          style={{
            background: 'linear-gradient(180deg, #ffffff 0%, rgba(244, 250, 246, 0.6) 30%, rgba(32, 188, 46, 0.03) 70%, #f0fdf4 100%)'
          }}
        >
          {/* Subtle Grid Overlay */}
          <div 
            className="absolute inset-0 opacity-[0.1] pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(32, 188, 46, 0.15) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(32, 188, 46, 0.15) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px',
              maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 60%, transparent 100%)'
            }}
          />

          {/* Filtering & Search Bar */}
          <section className="pt-8 sm:pt-12 pb-4 sm:pb-6 max-w-[1280px] mx-auto px-4 sm:px-6 relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6 bg-white border border-emerald-500/10 p-4 sm:p-5 rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.01)]">
              {/* Category tags */}
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {categories.map(cat => (
                  <button
                    key={cat.code}
                    onClick={() => setSelectedCategory(cat.code)}
                    className={`px-3 sm:px-4 py-2 rounded-xl text-[10px] sm:text-xs font-black transition-all cursor-pointer ${
                      selectedCategory === cat.code
                        ? 'bg-gradient-to-r from-emerald-800 to-green-700 text-white shadow-md'
                        : 'bg-[#f4faf6] text-emerald-800 border border-emerald-500/5 hover:bg-emerald-500/10'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Search bar */}
              <div className="relative max-w-sm w-full">
                <input
                  type="text"
                  placeholder="Search technical papers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 focus:border-[#20bc2e]/50 focus:bg-white text-xs sm:text-sm px-4 py-2.5 pl-10 rounded-2xl outline-none transition-all font-light"
                />
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </section>

          {/* Blog Cards Grid */}
          <section className="py-4 sm:py-8 max-w-[1280px] mx-auto px-4 sm:px-6 relative z-10">
            {filteredPosts.length === 0 ? (
              <div className="text-center py-20 bg-white border border-[#20bc2e]/10 rounded-[2rem] shadow-sm">
                <p className="text-gray-400 text-sm">No articles match your search criteria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                {filteredPosts.map((post, idx) => (
                  <ScrollReveal key={post.id} variant="slide-up" delay={idx * 0.05}>
                    <div className="bg-white border border-emerald-500/10 rounded-[2rem] overflow-hidden shadow-[0_4px_25px_rgba(0,0,0,0.01)] hover:shadow-xl hover:border-[#20bc2e]/30 transition-all duration-500 group flex flex-col justify-between h-full">
                      <Link href={`/blog/${post.id}`} className="cursor-pointer block flex-grow">
                        {/* Featured Image */}
                        <div className="h-48 sm:h-60 w-full overflow-hidden relative">
                          <img 
                            src={post.image} 
                            alt={post.title} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#050b07]/75 to-transparent"></div>
                          
                          {/* Floating Category Badge */}
                          <span className="absolute top-4 left-4 bg-emerald-800/90 backdrop-blur-md text-white font-extrabold text-[9px] sm:text-[10px] uppercase tracking-wider px-3.5 py-1.5 rounded-full border border-emerald-500/20">
                            {post.category === 'uav' ? 'UAV Mapping' :
                             post.category === 'cadastral' ? 'Cadastral Surveys' :
                             post.category === 'gis' ? 'GIS Systems' : 'Hydrographic'}
                          </span>
                        </div>

                        {/* Text Block */}
                        <div className="p-6 sm:p-8 space-y-3 sm:space-y-4">
                          {/* Metadata row */}
                          <div className="flex items-center space-x-4 text-[10px] sm:text-xs text-gray-400 font-light">
                            <span className="flex items-center gap-1.5">
                              <Calendar size={12} className="text-[#20bc2e]" />
                              {post.date}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Clock size={12} className="text-[#20bc2e]" />
                              {post.readTime}
                            </span>
                          </div>

                          <h3 className="text-base sm:text-xl font-bold text-gray-900 tracking-tight group-hover:text-[#20bc2e] transition-colors leading-snug">
                            {post.title}
                          </h3>
                          <p className="text-gray-500 text-xs sm:text-sm leading-relaxed font-light">
                            {post.summary}
                          </p>
                        </div>
                      </Link>

                      {/* Footer Actions */}
                      <div className="px-6 sm:px-8 pb-6 sm:pb-8 pt-4 border-t border-gray-50 flex items-center justify-between mt-auto">
                        <div className="flex items-center space-x-2 text-[10px] sm:text-xs text-gray-500 font-medium">
                          <div className="w-6 h-6 rounded-full bg-[#f4faf6] flex items-center justify-center text-[10px] font-black text-emerald-800 border border-[#20bc2e]/10">
                            <User size={10} />
                          </div>
                          <span>{post.author}</span>
                        </div>

                        <Link 
                          href={`/blog/${post.id}`}
                          className="flex items-center space-x-1.5 text-[10px] sm:text-xs font-black text-[#20bc2e] hover:text-[#1ba829] tracking-wider uppercase transition-all duration-300 group/btn cursor-pointer"
                        >
                          <span>Read Article</span>
                          <ArrowRight size={12} className="transition-transform duration-300 group-hover/btn:translate-x-1" />
                        </Link>
                      </div>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
