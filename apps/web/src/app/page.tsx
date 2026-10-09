import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import PartnersSection from '@/components/PartnersSection';
import AboutUsSection from '@/components/AboutUsSection';
import CoreExpertiseSection from '@/components/CoreExpertiseSection';
import ProjectsShowcaseSection from '@/components/ProjectsShowcaseSection';
import StatsImpactSection from '@/components/StatsImpactSection';
import Footer from '@/components/Footer';
import FloatingContact from '@/components/FloatingContact';

import ContactSection from '@/components/ContactSection';

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-green-100 selection:text-green-900 overflow-x-clip">
      <Navbar />
      <FloatingContact />
      <main>
        <HeroSection />
        {/* Unified Continuous Gradient Canvas for all middle sections */}
        <div 
          className="w-full relative overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, #ffffff 0%, rgba(32, 188, 46, 0.08) 25%, rgba(16, 185, 129, 0.14) 65%, #f0fdf4 100%)'
          }}
        >
          {/* High-Tech Geospatial Grid Pattern Overlay with Radial Mask (Zero hard edges) */}
          <div 
            className="absolute inset-0 opacity-[0.2] pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(32, 188, 46, 0.35) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(32, 188, 46, 0.35) 1px, transparent 1px)
              `,
              backgroundSize: '70px 70px',
              maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 50%, transparent 100%)'
            }}
          />

          {/* Corner Edge Lighting Spotlights */}
          <div 
            className="absolute inset-0 pointer-events-none z-0"
            style={{
              background: `
                radial-gradient(ellipse 600px 500px at 0% 0%, rgba(32, 188, 46, 0.22) 0%, transparent 70%),
                radial-gradient(ellipse 600px 500px at 100% 0%, rgba(16, 185, 129, 0.20) 0%, transparent 70%),
                radial-gradient(ellipse 700px 600px at 100% 45%, rgba(32, 188, 46, 0.18) 0%, transparent 70%),
                radial-gradient(ellipse 600px 500px at 0% 80%, rgba(16, 185, 129, 0.22) 0%, transparent 70%)
              `
            }}
          />

          {/* Soft Floating Ambient Glowing Orbs */}
          <div className="absolute top-[8%] left-1/2 -translate-x-1/2 w-[1100px] h-[650px] bg-[#20bc2e]/12 blur-[180px] rounded-full pointer-events-none" />
          <div className="absolute top-[38%] right-0 w-[900px] h-[750px] bg-emerald-400/14 blur-[180px] rounded-full pointer-events-none" />
          <div className="absolute top-[72%] left-0 w-[900px] h-[750px] bg-green-400/14 blur-[180px] rounded-full pointer-events-none" />

          {/* Top & Bottom Soft Vignette Fade Layers */}
          <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-white via-white/50 to-transparent pointer-events-none z-10" />
          <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-[#f0fdf4] via-[#f0fdf4]/80 to-transparent pointer-events-none z-10" />

          {/* Decorative Corner Coordinate Indicators */}
          <div className="absolute top-12 left-10 font-mono text-[10px] text-emerald-600/40 tracking-widest pointer-events-none hidden md:block z-20">
            + 23.8103° N, 90.4125° E [SOB_DATUM_GRID]
          </div>
          <div className="absolute top-12 right-10 font-mono text-[10px] text-emerald-600/40 tracking-widest pointer-events-none hidden md:block z-20">
            BTM_ZONE_45N [SURVEY_PRECISION]
          </div>

          <PartnersSection />
          <AboutUsSection />
          <CoreExpertiseSection />
          <ProjectsShowcaseSection />
        </div>
        <StatsImpactSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
