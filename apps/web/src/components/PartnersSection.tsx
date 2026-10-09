'use client';
import React from 'react';
import ScrollReveal from './ScrollReveal';

const partnerLogos = [
  { id: 'p1', name: 'Partner 1', src: '/partners/p1.png' },
  { id: 'p2', name: 'Dhaka North City Corporation', src: '/partners/p2.webp' },
  { id: 'p3', name: 'Partner 3', src: '/partners/p3.png' },
  { id: 'p4', name: 'Partner 4', src: '/partners/p4.png' },
  { id: 'p5', name: 'Bangladesh Power Development Board', src: '/partners/p5.png' },
  { id: 'p6', name: 'BETS Consulting', src: '/partners/p6.png' },
  { id: 'p7', name: 'EPC Consulting', src: '/partners/p7.png' },
  { id: 'p8', name: 'Partner 8', src: '/partners/p8.png' },
];

const PartnersSection = () => {
  return (
    <section className="w-full bg-transparent pt-20 pb-16 md:pt-36 md:pb-20 relative overflow-hidden">
      <style>{`
        @keyframes conveyorScroll {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
        .animate-conveyor {
          display: flex;
          width: max-content;
          animation: conveyorScroll 25s linear infinite;
          will-change: transform;
        }
        .animate-conveyor:hover {
          animation-play-state: paused;
        }
      `}</style>

      <ScrollReveal variant="pop-zoom" margin="0px 0px 200px 0px">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 mb-6 md:mb-8 text-center">
          <p className="text-gray-400 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em]">
            Trusted By Government Departments & Private Enterprises
          </p>
        </div>
      </ScrollReveal>

      {/* Infinite Conveyor Track - Visible on Desktop/Tablet */}
      <div className="hidden sm:block">
        <ScrollReveal variant="pop-zoom" delay={0.15} margin="0px 0px 200px 0px">
          <div className="relative w-full flex items-center overflow-hidden py-3">
            {/* Soft edge blur masks */}
            <div className="absolute left-0 top-0 bottom-0 w-24 md:w-48 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-24 md:w-48 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none" />

            <div className="animate-conveyor flex items-center space-x-8 md:space-x-12">
              {/* Multiply list 2x for a perfectly seamless infinite loop */}
              {[...partnerLogos, ...partnerLogos].map((partner, idx) => (
                <div 
                  key={idx}
                  className="flex items-center justify-center h-24 md:h-28 px-8 md:px-10 bg-white rounded-2xl border border-gray-200/90 shadow-sm hover:shadow-md hover:border-emerald-500/50 transition-all duration-300 transform hover:-translate-y-1 group cursor-pointer shrink-0"
                  title={partner.name}
                >
                  <img 
                    src={partner.src} 
                    alt={partner.name} 
                    loading="lazy"
                    decoding="async"
                    width={180}
                    height={64}
                    className="max-h-16 md:max-h-18 max-w-[180px] md:max-w-[220px] w-auto object-contain transition-all duration-300 opacity-100 group-hover:scale-105"
                  />
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>

      {/* Stunning Grid Showcase - Visible on Mobile Only */}
      <div className="block sm:hidden px-6">
        <div className="grid grid-cols-2 gap-3.5">
          {partnerLogos.map((partner, idx) => (
            <ScrollReveal key={partner.id} variant="pop-zoom" delay={idx * 0.04} margin="0px 0px 200px 0px">
              <div 
                className="flex items-center justify-center h-20 px-4 bg-white rounded-2xl border border-gray-200/60 shadow-sm hover:shadow-md active:scale-98 transition-all duration-300"
                title={partner.name}
              >
                <img 
                  src={partner.src} 
                  alt={partner.name} 
                  loading="lazy"
                  decoding="async"
                  width={140}
                  height={44}
                  className="max-h-11 max-w-full w-auto object-contain transition-all duration-300 opacity-95"
                />
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>

    </section>
  );
};

export default PartnersSection;
