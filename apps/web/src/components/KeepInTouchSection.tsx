'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Phone, Mail, Compass } from 'lucide-react';
import CorporateContactForm from './CorporateContactForm';
import MapboxOfficeMap from './MapboxOfficeMap';

interface KeepInTouchSectionProps {
  title?: string;
  subtitle?: string;
  description?: string;
  showForm?: boolean;
  className?: string;
  theme?: 'dark' | 'light';
}

export default function KeepInTouchSection({
  title = 'Keep in touch',
  subtitle = '// CONTACT & INQUIRIES',
  description = 'From corridor surveying to UAV photogrammetry and spatial databases, reach our engineering team for technical consultation and deployment.',
  showForm = true,
  className = '',
  theme = 'dark',
}: KeepInTouchSectionProps) {
  const isDark = theme === 'dark';

  return (
    <section
      id="keep-in-touch"
      className={`wsp-keep-in-touch-section relative overflow-hidden py-20 lg:py-24 border-t border-white/[0.08] ${
        isDark ? 'bg-[#0B0D12] text-white' : 'bg-neutral-50 text-neutral-900'
      } ${className}`}
    >
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 space-y-12">
        {/* =========================================================================
            HEADER & TOP ACTIONS
            ========================================================================= */}
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6 pb-8 border-b border-white/[0.08]">
          <div className="max-w-2xl space-y-2.5">
            <span className="block text-[11px] font-mono uppercase tracking-[0.22em] text-[#FB1D10] font-bold">
              {subtitle}
            </span>
            <h2 className="text-[34px] sm:text-[46px] lg:text-[54px] font-black tracking-[-0.035em] leading-[1.04] uppercase">
              {title}
            </h2>
            <p className="text-[15px] sm:text-[17px] text-neutral-400 font-normal leading-relaxed">
              {description}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-mono uppercase tracking-wider bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20 transition-all"
            >
              <span>Visit Contact Page</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* =========================================================================
            SPLIT GRID (FORM & DIRECT STUDIO CHANNELS)
            ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left 7 Columns: Form */}
          {showForm && (
            <div className="lg:col-span-7 space-y-5">
              <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-6 sm:p-8">
                <CorporateContactForm theme={theme} />
              </div>
            </div>
          )}

          {/* Right 5 Columns: Studio Details & Map */}
          <div className={`${showForm ? 'lg:col-span-5' : 'lg:col-span-8 lg:col-start-3'} space-y-5`}>
            {/* Map */}
            <MapboxOfficeMap
              lat={23.7505}
              lng={90.3807}
              zoom={15}
              theme={theme}
              heightClass="h-[240px] sm:h-[260px]"
            />

            {/* Studio Info Card */}
            <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-6 space-y-5">
              <div>
                <span className="block text-[10px] font-mono uppercase tracking-[0.18em] text-neutral-500 mb-1">
                  Dhaka Headquarters
                </span>
                <p className="text-sm font-medium text-neutral-200 leading-relaxed">
                  Geospatial Works Ltd.<br />
                  64/1 (D1), Lake Circus, Kalabagan, Dhaka 1205
                </p>
              </div>

              <div className="h-px bg-white/[0.06]" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="block text-[10px] font-mono uppercase tracking-[0.18em] text-neutral-500 mb-1">
                    Phone
                  </span>
                  <a
                    href="tel:+8801303772216"
                    className="block text-xs font-mono text-neutral-200 hover:text-[#FB1D10] transition-colors"
                  >
                    +88 01303 772216
                  </a>
                  <a
                    href="tel:+8801713907779"
                    className="block text-[11px] font-mono text-neutral-400 hover:text-white transition-colors"
                  >
                    +88 01713 907779
                  </a>
                </div>

                <div>
                  <span className="block text-[10px] font-mono uppercase tracking-[0.18em] text-neutral-500 mb-1">
                    Email
                  </span>
                  <a
                    href="mailto:info@geospatialworks.com.bd"
                    className="block text-xs text-neutral-200 hover:text-[#FB1D10] transition-colors truncate"
                  >
                    info@geospatialworks.com.bd
                  </a>
                  <a
                    href="mailto:careers@geospatialworks.com.bd"
                    className="block text-[11px] text-neutral-400 hover:text-white transition-colors truncate"
                  >
                    careers@geospatialworks.com.bd
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
