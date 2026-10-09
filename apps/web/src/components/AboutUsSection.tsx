'use client';
import React, { useState, useEffect } from 'react';
import { Crosshair, Globe, FileCheck, MapPin, ArrowRight } from 'lucide-react';
import ScrollReveal from './ScrollReveal';
import { motion, AnimatePresence } from 'framer-motion';

const AboutUsSection = () => {
  const [activeTab, setActiveTab] = useState(0);

  const pillars = [
    {
      id: 'p1',
      icon: <Crosshair className="w-5 h-5 md:w-6 md:h-6 text-white" />,
      tabName: 'Surveying',
      image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&q=75&w=600",
      title: 'Sub-Centimeter Surveying',
      subtitle: 'Tied to SOB Geodetic Network',
      desc: 'High-precision boundary demarcation. We specialize in CS, SA, RS, and BS Cadastral Mouza sheet digitizing and legal demarcation.',
      tags: ['Mouza Digitizing', 'SOB Network']
    },
    {
      id: 'p2',
      icon: <Globe className="w-5 h-5 md:w-6 md:h-6 text-white" />,
      tabName: 'UAV / Drone',
      image: "https://images.unsplash.com/photo-1579820010410-c10411aaaa88?auto=format&fit=crop&q=75&w=600",
      title: 'UAV Photogrammetry',
      subtitle: '1cm/pixel Aerial Mapping',
      desc: 'Utilizing advanced mapping drones to capture ultra-high-resolution aerial data, orthomosaics, 3D point clouds, and contour mapping.',
      tags: ['Orthomosaics', 'DEM & DTM']
    },
    {
      id: 'p3',
      icon: <FileCheck className="w-5 h-5 md:w-6 md:h-6 text-white" />,
      tabName: 'Valuation',
      image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=75&w=600",
      title: 'Certified Land Valuation',
      subtitle: 'Bank & Government Enlisted',
      desc: 'Delivering comprehensive, certified valuation reports for infrastructure projects, corporate assets, and government land acquisitions.',
      tags: ['Govt Certified', 'Asset Valuation']
    }
  ];

  return (
    <section 
      id="about" 
      className="w-full relative bg-transparent pt-24 pb-32"
    >
      <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Section Header */}
        <ScrollReveal variant="pop-zoom">
          <div className="mb-12 text-center flex flex-col items-center">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-[2px] bg-[#20bc2e] rounded-full"></div>
              <span className="text-[#20bc2e] font-bold text-xs md:text-sm tracking-[0.2em] uppercase">About Us</span>
              <div className="w-10 h-[2px] bg-[#20bc2e] rounded-full"></div>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-extrabold text-gray-900 tracking-tight leading-tight">
              Geospatial Works <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#20bc2e] to-[#127a1b]">Bangladesh</span>
            </h2>
          </div>
        </ScrollReveal>

        {/* ========================================================================= */}
        {/* DESKTOP GRID VIEW */}
        {/* ========================================================================= */}
        <div className="hidden sm:grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6">
          
          {/* Top Left: Surveyor Photo Background Card */}
          <ScrollReveal variant="pop-zoom" delay={0.1} className="lg:col-span-2 relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#20bc2e] to-[#0f6c17] rounded-[2.6rem] blur-xl opacity-[0.15] group-hover:opacity-45 transition-all duration-700 -z-10 group-hover:scale-[1.01] pointer-events-none" />
            
            <div className="relative w-full rounded-[2.5rem] overflow-hidden min-h-[360px] md:min-h-[420px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] bg-gray-900 border border-gray-100 h-full">
              <img 
                src="/about_surveyor_arch.png" 
                onError={(e) => {
                  e.currentTarget.src = "https://images.unsplash.com/photo-1582269438706-e7e0b53d169c?auto=format&fit=crop&q=75&w=800";
                }}
                alt="Surveyor with Leica Total Station" 
                loading="lazy"
                decoding="async"
                width={800}
                height={500}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0a140d]/95 via-[#0a140d]/75 to-transparent pointer-events-none"></div>
              
              <div className="relative z-10 p-8 md:p-12 h-full flex flex-col justify-center max-w-xl">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-5 leading-snug tracking-tight">
                  Transforming Bangladesh’s terrain with precise, high-quality <span className="text-[#20bc2e]">GIS surveying and consultancy</span>.
                </h3>
                
                <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-5 md:p-6 shadow-xl">
                  <p className="text-gray-200 text-sm md:text-base leading-relaxed">
                    Geospatial Works is a leading consultancy specializing in high-quality geospatial services. Utilizing <strong className="text-white font-semibold">ArcGIS, QGIS, RTK GNSS, Total Stations</strong>, and <strong className="text-white font-semibold">UAV Drones</strong> to support urban planning, environmental management, and infrastructure development.
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Top Right: Stats & CTA Card */}
          <ScrollReveal variant="pop-zoom" delay={0.2} className="w-full h-full relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#20bc2e] to-[#0f6c17] rounded-[2.6rem] blur-xl opacity-[0.2] group-hover:opacity-50 transition-all duration-700 -z-10 group-hover:scale-[1.01] pointer-events-none" />
            
            <div className="bg-[#122417] rounded-[2.5rem] p-8 md:p-10 flex flex-col justify-center items-center text-center relative overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-green-900/10 h-full">
              <div className="absolute top-[-50px] right-[-50px] w-40 h-40 bg-[#20bc2e]/20 blur-[50px] rounded-full pointer-events-none transition-all duration-700 group-hover:bg-[#20bc2e]/30"></div>
              
              <div className="w-16 h-16 bg-[#1a3623] rounded-2xl flex items-center justify-center mb-6 border border-green-900/50 shadow-inner">
                <MapPin className="w-8 h-8 text-[#20bc2e]" />
              </div>
              
              <h4 className="text-[56px] md:text-[64px] font-extrabold text-white tracking-tighter leading-none mb-2 drop-shadow-md">
                50<span className="text-[#20bc2e]">+</span>
              </h4>
              <p className="text-gray-400 text-xs md:text-sm font-semibold uppercase tracking-[0.15em] leading-relaxed mb-8 max-w-[200px]">
                Projects Completed Across All 64 Districts
              </p>
              
              <a href="#expertise" className="inline-flex items-center space-x-2 bg-[#20bc2e] hover:bg-[#1ca829] text-white px-7 py-3.5 rounded-full text-sm font-bold transition-all duration-300 shadow-[0_8px_20px_rgba(32,188,46,0.25)] hover:shadow-[0_12px_25px_rgba(32,188,46,0.35)] hover:-translate-y-0.5">
                <span>Explore Services</span>
                <ArrowRight size={18} />
              </a>
            </div>
          </ScrollReveal>

          {/* Bottom Row: Pillar Cards */}
          {pillars.map((pillar, idx) => (
            <ScrollReveal 
              key={pillar.id} 
              variant="pop-zoom" 
              delay={idx * 0.15} 
              className="w-full h-full"
            >
              <div className="bg-white rounded-[2.2rem] p-3.5 md:p-4 flex flex-col group hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] transition-all duration-500 border border-gray-100 hover:-translate-y-1 relative h-full">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#20bc2e]/80 to-[#0f6c17]/80 rounded-[2.3rem] blur-xl opacity-[0.12] group-hover:opacity-35 transition-all duration-700 -z-10 group-hover:scale-[1.01] pointer-events-none" />
                
                <div className="w-full aspect-square rounded-[1.8rem] overflow-hidden relative mb-6 bg-gray-100">
                  <img 
                    src={pillar.image} 
                    alt={pillar.title} 
                    loading="lazy"
                    decoding="async"
                    width={400}
                    height={400}
                    className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110"
                  />
                  
                  <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:bg-[#20bc2e] transition-all duration-500">
                    <div className="text-white drop-shadow-sm transition-transform duration-500 group-hover:scale-110">
                      {pillar.icon}
                    </div>
                  </div>
                </div>

                <div className="px-2 pb-2 flex flex-col flex-grow">
                  <h4 className="text-xl md:text-[22px] font-extrabold text-gray-900 mb-1.5 leading-tight tracking-tight">
                    {pillar.title}
                  </h4>
                  <p className="text-[11px] font-bold text-[#20bc2e] mb-5 uppercase tracking-[0.12em]">
                    {pillar.subtitle}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mt-auto">
                    {pillar.tags.map((tag, i) => (
                      <span 
                        key={i} 
                        className="inline-flex items-center px-3 py-1.5 rounded-full bg-gray-50 border border-gray-100 text-[11px] font-semibold text-gray-500 transition-colors duration-300 group-hover:bg-green-50 group-hover:text-[#1a9c25] group-hover:border-green-200/60"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* ========================================================================= */}
        {/* MOBILE INTERACTIVE TAB & HUD DETAILS CARD VIEW */}
        {/* ========================================================================= */}
        <div className="block sm:hidden space-y-6 px-2">
          
          {/* Segmented Selector Tabs */}
          <ScrollReveal variant="pop-zoom" className="w-full">
            <div className="flex justify-center items-center bg-gray-100/95 border border-gray-200/60 p-1.5 rounded-2xl shadow-sm gap-1.5">
              {pillars.map((pillar, idx) => (
                <button
                  key={pillar.id}
                  onClick={() => setActiveTab(idx)}
                  className={`flex-1 flex items-center justify-center py-2.5 rounded-xl text-[10.5px] font-extrabold tracking-wide uppercase transition-all duration-300 cursor-pointer ${
                    activeTab === idx
                      ? 'bg-[#122417] text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {pillar.tabName}
                </button>
              ))}
            </div>
          </ScrollReveal>

          {/* Active Option Detail Frame */}
          <ScrollReveal variant="pop-zoom" delay={0.08} className="w-full">
            <div className="relative w-full aspect-[4/4.8] rounded-[2.2rem] overflow-hidden bg-gray-950 shadow-xl border border-emerald-950 flex flex-col justify-end p-5">
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 w-full h-full"
                >
                  <img
                    src={pillars[activeTab].image}
                    alt={pillars[activeTab].title}
                    loading="lazy"
                    decoding="async"
                    width={400}
                    height={480}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent z-10" />
                </motion.div>
              </AnimatePresence>

              {/* Bottom Overlaid Details */}
              <div className="relative z-20 flex flex-col space-y-2 text-white">
                <div className="inline-flex items-center space-x-1.5 self-start px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[9px] font-bold uppercase tracking-wider">
                  <span>Geospatial Core Pillar</span>
                </div>
                
                <h4 className="text-xl font-black leading-tight tracking-tight">
                  {pillars[activeTab].title}
                </h4>
                
                <p className="text-[10px] font-bold text-[#20bc2e] uppercase tracking-wide">
                  {pillars[activeTab].subtitle}
                </p>

                <p className="text-[11px] text-gray-300 font-normal leading-relaxed pt-1">
                  {pillars[activeTab].desc}
                </p>
              </div>
            </div>
          </ScrollReveal>

          {/* Interactive Stat Banner below Tab Card */}
          <ScrollReveal variant="pop-zoom" delay={0.12} className="w-full">
            <div className="bg-[#122417] rounded-3xl p-5 flex items-center justify-between border border-emerald-950 shadow-md relative overflow-hidden">
              <div className="absolute top-[-30px] right-[-30px] w-28 h-28 bg-[#20bc2e]/20 blur-[40px] rounded-full pointer-events-none" />
              
              <div className="flex items-center space-x-3.5">
                <div className="w-10 h-10 bg-[#1a3623] rounded-xl flex items-center justify-center shrink-0 border border-green-900/50">
                  <MapPin className="w-5 h-5 text-[#20bc2e]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">National Footprint</span>
                  <span className="text-[11px] text-white leading-tight font-medium max-w-[170px]">
                    Completed across all 64 districts.
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-3xl font-black text-[#20bc2e] tracking-tighter">50+</span>
              </div>
            </div>
          </ScrollReveal>

        </div>

      </div>
    </section>
  );
};

export default AboutUsSection;
