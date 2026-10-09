'use client';
import React from 'react';
import { ShieldCheck, Compass, Award } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

const stats = [
  {
    number: '5+',
    label: 'Years of Excellence',
    subtext: 'With over 5 years of experience, we have mastered our skills in GIS surveying and consultancy services.',
    icon: <Award className="w-5 h-5 text-emerald-400" />
  },
  {
    number: '10+',
    label: 'Satisfied Clients, Accurate Surveys',
    subtext: 'We have successfully served over 1000 clients who have relied on our precise and reliable survey solutions.',
    icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />
  },
  {
    number: '50+',
    label: 'Projects Completed Across All 64 Districts',
    subtext: 'Our comprehensive survey solutions have been recognized by leading industry professionals and have garnered numerous commendations.',
    icon: <Compass className="w-5 h-5 text-emerald-400" />
  }
];

const StatsImpactSection = () => {
  return (
    <section className="w-full bg-[#031007] text-white pt-28 pb-32 md:pt-40 md:pb-44 relative overflow-hidden">
      {/* Top U-Curve Architectural Arch */}
      <div className="absolute top-0 left-0 right-0 w-full overflow-hidden leading-none z-20 pointer-events-none -translate-y-[1px]">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-[60px] sm:h-[90px] md:h-[120px] block"
          preserveAspectRatio="none"
        >
          <path
            d="M0 0 H1440 V40 C1200 120 960 120 720 120 C480 120 240 120 0 40 Z"
            fill="#f0fdf4"
          />
        </svg>
      </div>

      {/* High-Craft Tech Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* Subtle Corner Spotlights */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-emerald-500/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-green-500/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Section Header */}
        <ScrollReveal variant="pop-zoom">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Our Precision GIS Survey Services</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight mb-5">
              National Impact & <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-300">Standards</span>
            </h2>
            <p className="text-gray-400 text-sm sm:text-base font-normal leading-relaxed max-w-2xl mx-auto">
              Discover the exceptional expertise of Geospatial Works Bangladesh. We have made a significant impact throughout Dhaka and beyond. Here are some of our key highlights:
            </p>
          </div>
        </ScrollReveal>

        {/* Radar Scanning Sweep Styles */}
        <style>{`
          @keyframes radarSweep {
            0% { transform: translateY(-100%); opacity: 0; }
            50% { opacity: 0.15; }
            100% { transform: translateY(100%); opacity: 0; }
          }
          .radar-sweep-effect {
            animation: radarSweep 8s ease-in-out infinite;
          }
        `}</style>

        {/* Stats Grid - Crisp, Structured & Tech-styled */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat, idx) => (
            <ScrollReveal key={idx} variant="pop-zoom" delay={idx * 0.1}>
              <div className="relative bg-[#081e0f]/90 border border-emerald-950/80 rounded-3xl p-6 sm:p-8 hover:border-emerald-400/50 hover:bg-[#0b2915] transition-all duration-500 group flex flex-col justify-between h-full shadow-[0_12px_40px_rgba(0,0,0,0.3)] overflow-hidden">
                
                {/* Luminous Hover Radial Edge Spotlight */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_var(--x,50%)_var(--y,50%),rgba(32,188,46,0.12)_0%,transparent_50%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                {/* Animated Tech Scanner Line */}
                <div className="absolute inset-x-0 h-1/2 bg-gradient-to-b from-[#20bc2e]/10 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 radar-sweep-effect" />

                {/* Geodetic Corner Crosshairs (+) */}
                <span className="absolute top-3 left-3 text-[10px] text-emerald-800/80 font-mono select-none group-hover:text-emerald-400 transition-colors duration-300">+</span>
                <span className="absolute top-3 right-3 text-[10px] text-emerald-800/80 font-mono select-none group-hover:text-emerald-400 transition-colors duration-300">+</span>
                <span className="absolute bottom-3 left-3 text-[10px] text-emerald-800/80 font-mono select-none group-hover:text-emerald-400 transition-colors duration-300">+</span>
                <span className="absolute bottom-3 right-3 text-[10px] text-emerald-800/80 font-mono select-none group-hover:text-emerald-400 transition-colors duration-300">+</span>

                <div>
                  {/* Icon Box */}
                  <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-900/60 flex items-center justify-center mb-6 sm:mb-8 text-emerald-400 shadow-inner group-hover:scale-105 transition-transform duration-300">
                    {stat.icon}
                  </div>

                  {/* Luminous Metric */}
                  <div className="text-[46px] sm:text-[52px] md:text-[60px] font-black tracking-tighter leading-none mb-3 text-transparent bg-clip-text bg-gradient-to-r from-white via-emerald-300 to-[#20bc2e]">
                    {stat.number}
                  </div>

                  {/* Label */}
                  <h3 className="text-base sm:text-lg font-extrabold text-white mb-4 leading-snug tracking-tight">
                    {stat.label}
                  </h3>
                </div>

                {/* Subtext description */}
                <p className="text-xs sm:text-sm text-gray-400 font-normal leading-relaxed pt-4 sm:pt-5 border-t border-emerald-900/30">
                  {stat.subtext}
                </p>

              </div>
            </ScrollReveal>
          ))}
        </div>

      </div>

      {/* Bottom U-Curve Architectural Arch */}
      <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none z-20 pointer-events-none translate-y-[1px]">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-[60px] sm:h-[90px] md:h-[120px] block"
          preserveAspectRatio="none"
        >
          <path
            d="M0 120 H1440 V80 C1200 0 960 0 720 0 C480 0 240 0 0 80 Z"
            fill="#ffffff"
          />
        </svg>
      </div>
    </section>
  );
};

export default StatsImpactSection;
