'use client';
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FloatingContact from '@/components/FloatingContact';
import ScrollReveal from '@/components/ScrollReveal';
import { Target, Users, Landmark, Trophy, ShieldCheck, Compass, Sparkles, Star } from 'lucide-react';

export default function AboutPage() {
  const corePillars = [
    {
      icon: <Target className="w-6 h-6 text-[#20bc2e]" />,
      title: "Sub-Centimeter Geodetic Precision",
      subtitle: "Tied to SOB Datum Grid",
      desc: "Every boundary verification is georeferenced using multi-frequency L1/L2 RTK GNSS receivers, tied directly to the Survey of Bangladesh (SOB) Geodetic network monuments. We don't estimate coordinates; we establish them with absolute precision."
    },
    {
      icon: <Landmark className="w-6 h-6 text-[#20bc2e]" />,
      title: "Historical Mouza Sheet Superimposition",
      subtitle: "Cadastral Survey Alignment",
      desc: "Our cartographic division specializes in resolving discrepancies between CS (1888), SA (1956), RS (1965), and BS/City Survey (1998) records by digitizing Mouza sheets at original scale ratios (16 inch = 1 mile) and superimposing modern coordinates."
    },
    {
      icon: <Trophy className="w-6 h-6 text-[#20bc2e]" />,
      title: "UAV Photogrammetry & LiDAR",
      subtitle: "1cm/px Ground Resolution",
      desc: "Deploying enterprise DJI RTK drone systems calibrated with physical Ground Control Points (GCPs). We generate highly accurate 3D point clouds, digital terrain models (DTM), and orthomosaics for infrastructure audits and topographic analysis."
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-[#20bc2e]" />,
      title: "Official Government Enlistment",
      subtitle: "Legally Certified Reporting",
      desc: "Our engineers are certified and enlisted with major banks, financial corporations, and government acquisition authorities across Bangladesh, ensuring all land survey and valuation reports carry absolute legal validity."
    }
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-green-100 selection:text-green-900 overflow-x-clip flex flex-col justify-between">
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
          {/* Radial mask overlay for grid fading */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050b07] via-transparent to-[#0c1a10] opacity-80" />
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] sm:w-[600px] h-[320px] sm:h-[400px] bg-[#20bc2e]/15 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 relative z-10 text-center space-y-6">
            <ScrollReveal variant="slide-up">
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight">
                Precision Rooted in <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#20bc2e] via-emerald-400 to-[#10b981]">Geospatial Integrity</span>
              </h1>
              <p className="text-gray-300 text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed font-light">
                Geospatial Works is Bangladesh's premier surveying and GIS consultancy, providing legal boundary verification, drone mapping, and enlistment-level valuations.
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* Dynamic canvas with grids and orbs */}
        <div 
          className="w-full relative pb-16 sm:pb-24"
          style={{
            background: 'linear-gradient(180deg, #ffffff 0%, rgba(244, 250, 246, 0.6) 30%, rgba(32, 188, 46, 0.03) 70%, #f0fdf4 100%)'
          }}
        >
          {/* Subtle Grid Overlay */}
          <div 
            className="absolute inset-0 opacity-[0.1] pointer-events-none overflow-hidden"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(32, 188, 46, 0.15) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(32, 188, 46, 0.15) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px',
              maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 60%, transparent 100%)'
            }}
          />

          {/* Coordinate Accents */}
          <div className="absolute top-8 left-6 font-mono text-[8px] text-emerald-600/30 tracking-widest pointer-events-none hidden md:block">
            LAT: 23.8103° N | LON: 90.4125° E
          </div>
          <div className="absolute top-8 right-6 font-mono text-[8px] text-emerald-600/30 tracking-widest pointer-events-none hidden md:block">
            BTM GRID ZONE 45N | SOB_DATUM
          </div>

          {/* Company Brief & Story */}
          <section className="py-8 sm:py-16 max-w-[1280px] mx-auto px-4 sm:px-6 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <ScrollReveal variant="slide-right" className="lg:col-span-7 space-y-6">
                <div className="flex items-center space-x-2 text-[#20bc2e]">
                  <Compass size={16} />
                  <span className="text-xs font-bold uppercase tracking-widest">ABOUT GEOSPATIAL WORKS</span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
                  Demarcating Boundaries, Valuing Assets, and <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-800 to-[#20bc2e]">Mapping Bangladesh</span>
                </h2>
                <div className="space-y-4 text-gray-600 text-sm sm:text-base leading-relaxed font-light">
                  <p>
                    Established to bring modern space-geodetic surveying and cartography standards to Bangladesh, Geospatial Works bridges the gap between historical cadastre databases and modern sub-centimeter global navigation systems.
                  </p>
                  <p>
                    We specialize in resolving complex land boundary overlapping issues by georeferencing historic CS, SA, RS, and BS maps directly onto local ellipsoids. We support government agencies, financial organizations, and infrastructure developers with precise, legally-defensible spatial analytics and asset appraisals.
                  </p>
                </div>
                <div className="p-5 bg-gradient-to-r from-[#f4faf6] to-white border border-[#20bc2e]/10 rounded-2xl flex items-start gap-4">
                  <div className="p-2.5 bg-[#20bc2e] text-white rounded-lg flex-shrink-0">
                    <Star size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm mb-0.5">High-Tech Equipment Base</h4>
                    <p className="text-gray-500 text-xs font-light">Equipped with Leica Total Stations, multi-band RTK receivers, and calibrated mapping drones.</p>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal variant="slide-left" className="lg:col-span-5 relative group">
                <div className="absolute -inset-2 bg-gradient-to-r from-[#20bc2e] to-emerald-600 rounded-[2rem] blur-xl opacity-[0.08] group-hover:opacity-20 transition duration-700 -z-10" />
                <div className="relative rounded-[2rem] overflow-hidden border border-[#20bc2e]/20 shadow-md aspect-[4/3] bg-gray-100">
                  <img 
                    src="/about_surveyor_arch.png"
                    onError={(e) => {
                      e.currentTarget.src = "https://images.unsplash.com/photo-1582269438706-e7e0b53d169c?auto=format&fit=crop&q=80&w=800";
                    }}
                    alt="Leica surveying equipment set" 
                    className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                  <div className="absolute bottom-5 left-5 text-white font-mono text-[9px] tracking-widest bg-black/40 backdrop-blur-md px-3 py-1 rounded-md">
                    SOB CONTROL STATION GRID MATCH
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </section>

          {/* Pillars of Precision */}
          <section className="py-16 sm:py-24 bg-white/70 backdrop-blur-md border-y border-emerald-500/10">
            <div className="max-w-[1280px] mx-auto px-4 sm:px-6 relative z-10 space-y-16">
              <ScrollReveal variant="pop-zoom" className="text-center max-w-2xl mx-auto space-y-4">
                <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                  Core Elements of Our Technical Framework
                </h2>
                <p className="text-gray-500 text-sm sm:text-base font-light">
                  How we deliver geodetic-grade accuracy across all cadastral, drone, and asset assessment operations.
                </p>
              </ScrollReveal>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {corePillars.map((pillar, idx) => (
                  <ScrollReveal key={idx} variant="slide-up" delay={idx * 0.05}>
                    <div className="bg-gradient-to-b from-[#f4faf6]/50 to-white hover:from-white hover:to-white border border-emerald-500/10 hover:border-[#20bc2e]/30 rounded-3xl p-6 sm:p-8 hover:shadow-xl transition-all duration-300 group h-full flex flex-col items-start space-y-5">
                      <div className="p-3 bg-[#f4faf6] border border-[#20bc2e]/20 rounded-2xl text-[#20bc2e] transition-transform duration-300 group-hover:scale-110">
                        {pillar.icon}
                      </div>
                      <div className="space-y-2">
                        <span className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">{pillar.subtitle}</span>
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#20bc2e] transition-colors leading-tight">
                          {pillar.title}
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed font-light">
                          {pillar.desc}
                        </p>
                      </div>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>

          {/* Call to Action */}
          <section className="pt-16 sm:pt-24 max-w-[1280px] mx-auto px-4 sm:px-6 relative z-10">
            <ScrollReveal variant="slide-up">
              <div className="bg-gradient-to-br from-[#122417] to-[#050b07] rounded-[2.5rem] p-6 sm:p-14 text-white border border-green-900/40 relative overflow-hidden shadow-2xl space-y-6 lg:space-y-0 lg:flex lg:items-center lg:justify-between">
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#20bc2e]/10 blur-[100px] rounded-full pointer-events-none" />
                
                <div className="space-y-3 max-w-xl z-10">
                  <span className="text-[#20bc2e] font-black text-[10px] tracking-wider uppercase">COLLABORATION WORKFLOW</span>
                  <h3 className="text-xl sm:text-3xl font-extrabold tracking-tight leading-snug">
                    Need Legally Recognized Land Valuations?
                  </h3>
                  <p className="text-gray-300 text-xs sm:text-sm leading-relaxed font-light">
                    Our team of certified surveyors and appraisers provide legally binding demarcation reports and certified valuations recognized by courts, banks, and public sectors in Bangladesh.
                  </p>
                </div>
                
                <button 
                  onClick={() => window.location.href = '/#contact'}
                  className="w-full lg:w-auto px-8 py-4 bg-[#20bc2e] hover:bg-[#1ba829] text-white font-extrabold text-xs uppercase tracking-wider rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-98 z-10 cursor-pointer text-center"
                >
                  Consult an Expert Surveyor
                </button>
              </div>
            </ScrollReveal>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
