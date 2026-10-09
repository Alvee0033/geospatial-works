'use client';
import React from 'react';
import { ArrowRight, PhoneCall, FileText, CheckCircle2, ShieldAlert } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

const CTASection = () => {
  return (
    <section className="w-full bg-white py-24 md:py-32 relative overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 relative z-10">
        <ScrollReveal variant="slide-up">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#06190a] via-[#0b2b10] to-[#041207] text-white p-8 sm:p-12 md:p-16 border border-emerald-800/40 shadow-2xl">
            {/* Glowing neon green underglow effect inside card */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#20bc2e]/20 blur-[140px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#0f6c17]/30 blur-[120px] rounded-full pointer-events-none" />

            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              {/* Text & Value Prop */}
              <div className="lg:col-span-7">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-6">
                  <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Official SOB Registered Survey Consultancy</span>
                </div>

                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight mb-6">
                  Ready to Start Your <br className="hidden sm:inline" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#20bc2e] via-green-300 to-emerald-200">
                    High-Precision Survey Project?
                  </span>
                </h2>

                <p className="text-gray-300 text-base sm:text-lg leading-relaxed mb-8 max-w-2xl">
                  Consult with our senior licensed surveyors for CS/RS/BS Mouza demarcation, drone photogrammetry, land valuation, or infrastructure GIS integration.
                </p>

                {/* Benefits List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  {[
                    'SOB Datum & BTM Grid Certified',
                    '24-Hour Express Field Deployment',
                    'Bank & Court Acceptable Reports',
                    'End-to-End GIS Vector Deliverables'
                  ].map((benefit, i) => (
                    <div key={i} className="flex items-center space-x-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#20bc2e] shrink-0" />
                      <span className="text-xs sm:text-sm font-semibold text-gray-200">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Cards & Buttons */}
              <div className="lg:col-span-5 flex flex-col space-y-4">
                <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/15">
                  <h3 className="text-lg font-bold text-white mb-2">Instant Site Survey Inquiry</h3>
                  <p className="text-xs text-gray-300 mb-6 leading-relaxed">
                    Get an accurate timeline and cost estimate tailored to your land area & location in Bangladesh.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <a
                      href="#contact"
                      className="flex-1 inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-[#20bc2e] hover:bg-[#199d25] text-white font-bold text-sm transition-all duration-300 shadow-lg shadow-emerald-950/40 hover:scale-[1.02] cursor-pointer"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Request Quote</span>
                      <ArrowRight className="w-4 h-4" />
                    </a>

                    <a
                      href="tel:+8801303772216"
                      className="inline-flex items-center justify-center space-x-2 px-5 py-3.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-sm transition-all duration-300 border border-white/20 hover:scale-[1.02] cursor-pointer"
                    >
                      <PhoneCall className="w-4 h-4 text-emerald-400" />
                      <span>+88 01303 772216</span>
                    </a>
                  </div>
                </div>

                {/* Office Info Badge */}
                <div className="px-5 py-3 rounded-xl bg-black/40 border border-white/10 backdrop-blur-sm flex items-center justify-between text-xs text-gray-300">
                  <span>64/1 (D1), Lake Circus, Kalabagan, Dhaka 1205</span>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default CTASection;
