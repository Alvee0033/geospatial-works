'use client';
import { ArrowDown } from 'lucide-react';

const HeroSection = () => {
  return (
    <section id="home" className="w-full max-w-full mx-auto px-4 sm:px-2 md:px-3 pt-20 sm:pt-24 pb-0 bg-white relative">
      
      {/* ========================================================================= */}
      {/* DESKTOP / TABLET HERO VIEW */}
      {/* ========================================================================= */}
      <div className="hidden sm:flex relative w-full rounded-[3rem] overflow-hidden bg-gray-900 min-h-[580px] lg:h-[80vh] flex-col justify-between group shadow-2xl">
        {/* Optimized Video Background with instant WebP poster */}
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          poster="/hero-poster.webp"
          className="absolute inset-0 w-full h-full object-cover object-center"
        >
          <source src="/hero.mp4" type="video/mp4" />
          <source src="/hero.webm" type="video/webm" />
        </video>

        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent pointer-events-none z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent pointer-events-none z-10" />
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/80 to-transparent pointer-events-none z-10" />

        <div className="relative z-20 w-full px-8 md:px-14 pb-[110px] flex flex-col md:flex-row justify-between items-end gap-8 mt-auto">
          <div className="max-w-xl text-white">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold uppercase tracking-widest mb-4 backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-[#20bc2e] animate-pulse"></span>
              <span>Geospatial Works Bangladesh</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-extrabold leading-[1.12] tracking-tight mb-4 drop-shadow-md">
              Empowering Decisions<br />With <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#20bc2e] via-green-300 to-emerald-200">Precision</span>
            </h1>
            <p className="text-sm md:text-base text-gray-200 font-normal opacity-95 leading-relaxed mb-8 max-w-lg drop-shadow">
              Transforming Bangladesh’s terrain with precise, high-quality GIS surveying, digital mapping, and remote sensing consultancy.
            </p>
          </div>
        </div>

        {/* Blended Section Bottom Curve */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-20 pointer-events-none translate-y-[2px]">
          <svg
            viewBox="0 0 1000 120"
            preserveAspectRatio="none"
            className="w-full h-[70px] sm:h-[80px] md:h-[90px] block"
          >
            <path
              d="M 0,140 L 0,120 L 415,120 C 452,120 470,30 500,30 C 530,30 548,120 585,120 L 1000,120 L 1000,140 Z"
              fill="#ffffff"
            />
          </svg>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MOBILE HERO VIEW (9:16 Reel Format) */}
      {/* ========================================================================= */}
      <div 
        className="flex sm:hidden relative w-full rounded-[2rem] overflow-hidden bg-gray-950 flex-col justify-end p-6 shadow-2xl border border-white/10 aspect-[9/16]"
      >
        {/* Optimized Video Background with instant WebP poster */}
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          poster="/hero-poster.webp"
          className="absolute inset-0 w-full h-full object-cover object-center z-0"
        >
          <source src="/hero.mp4" type="video/mp4" />
          <source src="/hero.webm" type="video/webm" />
        </video>

        {/* Gradient vignette overlays for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent z-10 pointer-events-none" />

        {/* Bottom content overlay (Minimal Design) */}
        <div className="relative z-20 flex flex-col space-y-3.5 text-white">
          <div className="inline-flex items-center space-x-1.5 self-start px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[8px] font-bold uppercase tracking-wider">
            <span className="w-1 h-1 rounded-full bg-[#20bc2e] animate-pulse"></span>
            <span>Geospatial Works Bangladesh</span>
          </div>
          
          <h1 className="text-[26px] font-black leading-[1.15] tracking-tight">
            Empowering Decisions<br />With <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#20bc2e] via-green-300 to-emerald-300">Precision</span>
          </h1>

          <p className="text-[11px] text-gray-300 font-normal leading-relaxed max-w-xs">
            Transforming Bangladesh’s terrain with high-quality GIS surveying, digital mapping, and remote sensing consultancy.
          </p>

          <div className="flex items-center justify-between pt-1">
            <button 
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-4 py-2.5 bg-[#20bc2e] hover:bg-[#1fa92a] text-white text-xs font-bold rounded-lg shadow-md transition-colors"
            >
              Contact Us
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SCROLL BUTTON (Desktop/Tablet Only) */}
      {/* ========================================================================= */}
      <div className="absolute left-1/2 -bottom-[10px] sm:-bottom-[12px] md:-bottom-[14px] -translate-x-1/2 h-[58px] w-[58px] sm:h-[66px] sm:w-[66px] z-30 pointer-events-none hidden sm:block">
        <div className="absolute inset-0 rounded-full border border-[#20bc2e]/60 pointer-events-none animate-pulse-ring" />
        <button
          onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
          className="absolute inset-0 flex items-center justify-center rounded-full bg-[#081d0e] hover:bg-black text-white transition-transform hover:scale-105 shadow-lg group cursor-pointer border border-[#20bc2e]/20 overflow-hidden pointer-events-auto"
          aria-label="Scroll Down"
        >
          <ArrowDown size={24} strokeWidth={2.8} className="text-white animate-scroll-down" />
        </button>
      </div>

    </section>
  );
};

export default HeroSection;
