import React from 'react';
import Link from 'next/link';
import { Mail, Phone, Clock, MapPin, ArrowUpRight } from 'lucide-react';
import CorporateShell from '@/components/CorporateShell';
import CorporateContactForm from '@/components/CorporateContactForm';
import MapboxOfficeMap from '@/components/MapboxOfficeMap';
import '../corporate.css';

export const metadata = {
  title: 'Contact | Geospatial Works Bangladesh',
  description:
    'Consult with Geospatial Works headquarters in Dhaka for engineering surveying, drone LiDAR, bathymetric mapping, and GIS spatial intelligence.',
};

export default function ContactPage() {
  return (
    <CorporateShell>
      <main className="min-h-screen bg-[#0B0D12] text-white font-sans antialiased selection:bg-[#FB1D10] selection:text-white">
        {/* =========================================================================
            HEADER & HERO NARRATIVE
            ========================================================================= */}
        <section className="border-b border-white/[0.08] pt-12 pb-16">
          <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
            {/* Minimal Breadcrumb */}
            <nav
              className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-neutral-500 mb-8"
              aria-label="Breadcrumb"
            >
              <Link href="/" className="hover:text-white transition-colors">
                Home
              </Link>
              <span className="text-neutral-700">/</span>
              <span className="text-[#FB1D10]">Contact</span>
            </nav>

            <div className="max-w-3xl space-y-4">
              <span className="inline-block text-[11px] sm:text-[12px] font-mono uppercase tracking-[0.25em] text-[#FB1D10] font-bold">
                // CONTACT & CONSULTATION
              </span>
              <h1 className="text-[36px] sm:text-[54px] lg:text-[68px] font-black tracking-[-0.035em] leading-[1.02] uppercase">
                Let’s discuss your project.
              </h1>
              <p className="text-[16px] sm:text-[19px] text-neutral-400 font-normal leading-relaxed">
                Connect directly with our licensed surveyors, drone flight planners, and spatial engineers. We provide technical consultation and mobilization for infrastructure across Bangladesh.
              </p>
            </div>
          </div>
        </section>

        {/* =========================================================================
            MAIN CONTACT GRID (FORM & OFFICE DETAILS)
            ========================================================================= */}
        <section className="max-w-[1440px] mx-auto px-6 lg:px-12 py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            {/* Left 7 Columns: Minimal Inquiry Form */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-1 pb-4 border-b border-white/[0.08]">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  Send an Inquiry
                </h2>
                <p className="text-sm text-neutral-400">
                  Outline your site location and requirements. Our engineering team reviews all requests within 24 hours.
                </p>
              </div>

              <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-6 sm:p-8">
                <CorporateContactForm theme="dark" />
              </div>
            </div>

            {/* Right 5 Columns: Studio Details & Map */}
            <aside className="lg:col-span-5 space-y-6">
              <div className="space-y-1 pb-4 border-b border-white/[0.08]">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  Dhaka Studio & Headquarters
                </h2>
                <p className="text-sm text-neutral-400">
                  Central coordination hub for geodetic instruments, drone fleet, and spatial data compute.
                </p>
              </div>

              {/* Minimal Architectural Map */}
              <MapboxOfficeMap
                lat={23.7505}
                lng={90.3807}
                zoom={15}
                theme="dark"
                heightClass="h-[280px] sm:h-[320px]"
              />

              {/* Directory Details */}
              <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-6 sm:p-7 space-y-6">
                {/* Physical Location */}
                <div className="space-y-1.5">
                  <span className="block text-[11px] font-mono uppercase tracking-[0.16em] text-neutral-500">
                    Location
                  </span>
                  <div className="text-sm font-medium text-neutral-200 leading-relaxed">
                    Geospatial Works Ltd.<br />
                    64/1 (D1), Lake Circus, Kalabagan<br />
                    Dhaka 1205, Bangladesh
                  </div>
                </div>

                <div className="h-px bg-white/[0.06]" />

                {/* Direct Communications */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1">
                    <span className="block text-[11px] font-mono uppercase tracking-[0.16em] text-neutral-500">
                      Telephone
                    </span>
                    <a
                      href="tel:+8801303772216"
                      className="block text-sm font-mono font-medium text-neutral-200 hover:text-[#FB1D10] transition-colors"
                    >
                      +88 01303 772216
                    </a>
                    <a
                      href="tel:+8801713907779"
                      className="block text-xs font-mono text-neutral-400 hover:text-white transition-colors"
                    >
                      +88 01713 907779
                    </a>
                  </div>

                  <div className="space-y-1">
                    <span className="block text-[11px] font-mono uppercase tracking-[0.16em] text-neutral-500">
                      Inquiries
                    </span>
                    <a
                      href="mailto:info@geospatialworks.com.bd"
                      className="block text-sm text-neutral-200 hover:text-[#FB1D10] transition-colors truncate"
                    >
                      info@geospatialworks.com.bd
                    </a>
                    <a
                      href="mailto:careers@geospatialworks.com.bd"
                      className="block text-xs text-neutral-400 hover:text-white transition-colors truncate"
                    >
                      careers@geospatialworks.com.bd
                    </a>
                  </div>
                </div>

                <div className="h-px bg-white/[0.06]" />

                {/* Operating Schedule */}
                <div className="space-y-1">
                  <span className="block text-[11px] font-mono uppercase tracking-[0.16em] text-neutral-500">
                    Studio Hours
                  </span>
                  <div className="text-xs text-neutral-300 leading-relaxed">
                    Sunday – Thursday: 9:00 AM – 6:00 PM BST
                  </div>
                  <div className="text-[11px] font-mono text-emerald-400 pt-0.5">
                    Field crews available for rapid mobilization nationwide.
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </section>
      </main>
    </CorporateShell>
  );
}
