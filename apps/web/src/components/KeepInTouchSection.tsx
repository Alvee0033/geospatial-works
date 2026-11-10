'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Phone, Mail, Compass } from 'lucide-react';
import CorporateContactForm from './CorporateContactForm';
import MapboxOfficeMap from './MapboxOfficeMap';
import { OFFICE_COORDINATES } from '@/lib/contact-info';
import { contactAddress, phoneHref, PublicContactInfo } from '@/lib/contact-info';
import { usePublicContactInfo } from '@/hooks/use-public-contact-info';

interface KeepInTouchSectionProps {
  title?: string;
  subtitle?: string;
  description?: string;
  showForm?: boolean;
  className?: string;
  theme?: 'dark' | 'light';
  contactInfo?: PublicContactInfo | null;
}

export default function KeepInTouchSection({
  title = 'Keep in touch',
  subtitle = '// CONTACT & INQUIRIES',
  description = 'From corridor surveying to UAV photogrammetry and spatial databases, reach our engineering team for technical consultation and deployment.',
  showForm = true,
  className = '',
  theme = 'dark',
  contactInfo: suppliedContactInfo,
}: KeepInTouchSectionProps) {
  const isDark = theme === 'dark';
  const loadedContactInfo = usePublicContactInfo();
  const contactInfo = suppliedContactInfo ?? loadedContactInfo;
  const address = contactInfo ? contactAddress(contactInfo) : '';

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
              lat={Number(contactInfo?.latitude) || OFFICE_COORDINATES.latitude}
              lng={Number(contactInfo?.longitude) || OFFICE_COORDINATES.longitude}
              zoom={15}
              theme={theme}
              heightClass="h-[240px] sm:h-[260px]"
              locationName={contactInfo?.companyName || 'Geospatial Works'}
            />

            {/* Studio Info Card */}
            <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-6 space-y-5">
              <div>
                <span className="block text-[10px] font-mono uppercase tracking-[0.18em] text-neutral-500 mb-1">
                  {contactInfo?.officeName || 'Corporate Office'}
                </span>
                <p className="text-sm font-medium text-neutral-200 leading-relaxed">
                  {contactInfo?.companyName}<br />
                  {address || 'Contact details are loading…'}
                </p>
              </div>

              <div className="h-px bg-white/[0.06]" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="block text-[10px] font-mono uppercase tracking-[0.18em] text-neutral-500 mb-1">
                    Phone
                  </span>
                  {contactInfo?.phone && <a
                    href={phoneHref(contactInfo.phone)}
                    className="block text-xs font-mono text-neutral-200 hover:text-[#FB1D10] transition-colors"
                  >
                    {contactInfo.phone}
                  </a>}
                </div>

                <div>
                  <span className="block text-[10px] font-mono uppercase tracking-[0.18em] text-neutral-500 mb-1">
                    Email
                  </span>
                  {contactInfo?.email && <a
                    href={`mailto:${contactInfo.email}`}
                    className="block text-xs text-neutral-200 hover:text-[#FB1D10] transition-colors truncate"
                  >
                    {contactInfo.email}
                  </a>}
                  {contactInfo?.website && <a href={contactInfo.website} target="_blank" rel="noreferrer" className="mt-1 block text-[11px] text-neutral-400 hover:text-white transition-colors truncate">{contactInfo.website.replace(/^https?:\/\//, '')}</a>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
