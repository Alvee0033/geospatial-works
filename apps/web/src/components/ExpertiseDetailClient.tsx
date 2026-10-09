'use client';
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FloatingContact from '@/components/FloatingContact';
import ScrollReveal from '@/components/ScrollReveal';
import Link from 'next/link';
import { 
  ArrowLeft, CheckCircle2, ShieldCheck, Sparkles, Compass, 
  Ruler, Crosshair, Database, Waves, Activity, Scale, Layers
} from 'lucide-react';

export interface ExpertiseItemData {
  id: number;
  category: string;
  title: string;
  iconName: string;
  desc: string;
  image: string;
  features: string[];
  fullDetails: {
    overview: string;
    methodology: string;
    applications: string[];
    deliverables: string[];
    accuracyStandards: string;
  };
}

export default function ExpertiseDetailClient({ item }: { item: ExpertiseItemData }) {
  const getIcon = (name: string) => {
    switch (name) {
      case 'Ruler': return <Ruler className="w-5 h-5 text-white" />;
      case 'Crosshair': return <Crosshair className="w-5 h-5 text-white" />;
      case 'Database': return <Database className="w-5 h-5 text-white" />;
      case 'Waves': return <Waves className="w-5 h-5 text-white" />;
      case 'Activity': return <Activity className="w-5 h-5 text-white" />;
      case 'Scale': return <Scale className="w-5 h-5 text-white" />;
      default: return <Compass className="w-5 h-5 text-white" />;
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-green-100 selection:text-green-900 overflow-x-hidden flex flex-col justify-between">
      <Navbar />
      <FloatingContact />

      <main className="flex-grow pt-24 md:pt-32">
        {/* Top back navigation */}
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 mb-6">
          <Link 
            href="/expertise" 
            className="inline-flex items-center space-x-2 text-xs font-bold text-emerald-800 hover:text-[#20bc2e] tracking-widest uppercase transition-colors group cursor-pointer"
          >
            <ArrowLeft size={14} className="transition-transform duration-200 group-hover:-translate-x-1" />
            <span>Back to All Expertise</span>
          </Link>
        </div>

        {/* Detail article header */}
        <article className="max-w-[1100px] mx-auto px-4 sm:px-6 pb-24 space-y-12">
          
          <ScrollReveal variant="slide-up" className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#20bc2e] to-emerald-700 flex items-center justify-center shadow-md">
                {getIcon(item.iconName)}
              </div>
              <span className="bg-[#f4faf6] border border-[#20bc2e]/20 text-emerald-800 font-black text-[10px] uppercase tracking-wider px-3.5 py-1.5 rounded-full">
                TECHNICAL CAPABILITY FOCUS
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight leading-tight">
              {item.title}
            </h1>
            
            <p className="text-gray-600 text-base sm:text-xl font-light leading-relaxed max-w-3xl">
              {item.desc}
            </p>
          </ScrollReveal>

          {/* Hero Banner Image */}
          <ScrollReveal variant="pop-zoom" className="w-full">
            <div className="relative rounded-[2.5rem] overflow-hidden border border-emerald-500/20 shadow-2xl h-[300px] sm:h-[450px]">
              <img 
                src={item.image} 
                alt={item.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-white text-xs font-mono">
                <span className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                  Precision Rating: {item.fullDetails.accuracyStandards}
                </span>
                <span className="bg-[#20bc2e] text-white px-4 py-2 rounded-full font-bold uppercase tracking-wider">
                  Verified SOB Standard
                </span>
              </div>
            </div>
          </ScrollReveal>

          {/* Grid Layout of Technical Details */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pt-4">
            
            {/* Main content body */}
            <div className="lg:col-span-8 space-y-10 text-gray-700 leading-relaxed font-light">
              
              <section className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900 border-b border-emerald-500/10 pb-3 flex items-center gap-2">
                  <Layers size={18} className="text-[#20bc2e]" />
                  <span>Technical Overview & Standard Operating Procedure</span>
                </h3>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                  {item.fullDetails.overview}
                </p>
              </section>

              <section className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900 border-b border-emerald-500/10 pb-3 flex items-center gap-2">
                  <ShieldCheck size={18} className="text-[#20bc2e]" />
                  <span>Execution Methodology & Equipment Calibration</span>
                </h3>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                  {item.fullDetails.methodology}
                </p>
              </section>

              <section className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900 border-b border-emerald-500/10 pb-3">
                  Key Application Scenarios
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {item.fullDetails.applications.map((app, aidx) => (
                    <div key={aidx} className="flex items-start space-x-3 bg-[#f4faf6] p-4 rounded-2xl border border-[#20bc2e]/10">
                      <CheckCircle2 size={16} className="text-[#20bc2e] mt-0.5 flex-shrink-0" />
                      <span className="text-xs sm:text-sm text-gray-800 font-medium">{app}</span>
                    </div>
                  ))}
                </div>
              </section>

            </div>

            {/* Right sidebar deliverables */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-[#f4faf6] border border-[#20bc2e]/20 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm sticky top-28">
                <h4 className="font-extrabold text-gray-900 text-sm tracking-wider uppercase border-b border-[#20bc2e]/10 pb-3 flex items-center gap-2">
                  <Sparkles size={14} className="text-[#20bc2e]" />
                  <span>Client Deliverables</span>
                </h4>
                
                <ul className="space-y-3">
                  {item.fullDetails.deliverables.map((deliv, didx) => (
                    <li key={didx} className="flex items-start space-x-2.5 text-xs text-gray-800 font-medium">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#20bc2e] mt-1.5 flex-shrink-0" />
                      <span>{deliv}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-4 border-t border-[#20bc2e]/10 space-y-3">
                  <span className="text-[10px] text-gray-400 font-mono block uppercase">Accuracy Benchmark</span>
                  <div className="p-3 bg-white rounded-xl border border-emerald-500/20 text-xs font-bold text-emerald-900">
                    {item.fullDetails.accuracyStandards}
                  </div>
                </div>
              </div>
            </div>

          </div>

        </article>
      </main>

      <Footer />
    </div>
  );
}
