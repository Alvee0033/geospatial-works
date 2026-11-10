import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, ArrowRight, CheckCircle2, ShieldCheck, Wrench, Layers } from 'lucide-react';
import CorporateShell from '@/components/CorporateShell';
import { CmsApi } from '@/lib/cms-api';
import '../../corporate.css';

export const revalidate = 10;

interface ServiceDetail {
  slug: string;
  title: string;
  category: string;
  lead: string;
  description: string;
  image: string;
  equipment: string[];
  deliverables: string[];
  standards: string[];
  benefits: string[];
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const cmsServices = await CmsApi.getServices();
  const dbService = cmsServices.find((item) => item.slug === slug);
  if (!dbService) notFound();

  const detail = dbService.details || {};
  const service: ServiceDetail = {
    slug: dbService.slug,
    title: dbService.title,
    category: dbService.category,
    lead: detail.lead || dbService.description,
    description: dbService.description,
    image: dbService.imageUrl || '',
    equipment: detail.equipment || [],
    deliverables: dbService.features || [],
    standards: detail.standards || [],
    benefits: detail.benefits || [],
  };
  const related = cmsServices.filter((item) => item.slug !== slug).slice(0, 2)
    .map((item) => ({ ...item, image: item.imageUrl || '', lead: item.details?.lead || item.description }));

  return (
    <CorporateShell>
      <main className="wsp-service-detail bg-white text-[#141212] font-sans antialiased">
        {/* =========================================================================
            BREADCRUMBS & HERO
            ========================================================================= */}
        <section className="bg-white pt-28 pb-10 border-b border-neutral-100">
          <div className="max-w-[1440px] mx-auto px-6 md:px-12">
            <nav className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-500 mb-6" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-[#F4382D] transition-colors">
                Home
              </Link>
              <span className="text-neutral-300">/</span>
              <Link href="/services" className="hover:text-[#F4382D] transition-colors">
                What We Do
              </Link>
              <span className="text-neutral-300">/</span>
              <span className="text-[#F4382D] line-clamp-1">{service.title}</span>
            </nav>

            <div className="max-w-4xl space-y-4">
              <span className="inline-block text-[12px] font-extrabold uppercase tracking-[0.16em] text-[#F4382D]">
                {service.category}
              </span>
              <h1 className="text-[34px] sm:text-[46px] lg:text-[54px] font-extrabold text-[#141212] tracking-[-0.03em] leading-[1.1]">
                {service.title}
              </h1>
              <p className="text-[18px] sm:text-[21px] text-neutral-600 font-normal leading-relaxed pt-1">
                {service.lead}
              </p>
            </div>
          </div>
        </section>

        {/* =========================================================================
            FEATURED HERO PHOTOGRAPHY
            ========================================================================= */}
        <section className="max-w-[1440px] mx-auto px-6 md:px-12 py-8">
          <div className="aspect-[21/9] sm:aspect-[16/8] overflow-hidden bg-neutral-900 shadow-xl relative">
            <img
              src={service.image || undefined}
              alt={service.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-6 bg-black/70 backdrop-blur-md px-4 py-2 text-white text-[12px] font-semibold tracking-wide">
              {service.title} • Field Equipment & In-Situ Standards
            </div>
          </div>
        </section>

        {/* =========================================================================
            TECHNICAL SPECIFICATIONS GRID (8:4 SPLIT)
            ========================================================================= */}
        <section className="max-w-[1440px] mx-auto px-6 md:px-12 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            {/* Left 8 Cols: Overview, Equipment & Deliverables */}
            <div className="lg:col-span-8 space-y-12">
              <div className="space-y-4">
                <span className="text-[12px] font-bold uppercase tracking-[0.14em] text-neutral-500">
                  01 / CAPABILITY OVERVIEW
                </span>
                <h2 className="text-[26px] sm:text-[30px] font-extrabold tracking-[-0.02em] text-[#141212] leading-tight">
                  Uncompromising Standards for Critical Infrastructure
                </h2>
                <p className="text-[16px] text-neutral-700 leading-[1.8]">
                  {service.description}
                </p>
              </div>

              {/* Key Deliverables */}
              <div className="space-y-4 border-l-2 border-[#F4382D] pl-6 py-2 bg-neutral-50/70">
                <span className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#F4382D]">
                  02 / TYPICAL DELIVERABLES
                </span>
                <h3 className="text-[22px] font-bold text-[#141212]">
                  What You Receive
                </h3>
                <ul className="space-y-2 pt-2">
                  {service.deliverables.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-[15px] text-neutral-800">
                      <CheckCircle2 size={18} className="text-[#F4382D] shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Deployed Equipment Suite */}
              <div className="space-y-6">
                <span className="text-[12px] font-bold uppercase tracking-[0.14em] text-neutral-500">
                  03 / EQUIPMENT SUITE
                </span>
                <h3 className="text-[24px] font-bold text-[#141212]">
                  Survey-Grade Instrumentation
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                  {service.equipment.map((eq, idx) => (
                    <div key={idx} className="p-5 border border-neutral-200 bg-white shadow-sm space-y-2">
                      <Wrench size={20} className="text-[#F4382D]" />
                      <p className="text-[14px] font-bold text-[#141212] leading-snug">{eq}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Why Work With GW */}
              <div className="space-y-4">
                <span className="text-[12px] font-bold uppercase tracking-[0.14em] text-neutral-500">
                  04 / PROJECT ADVANTAGES
                </span>
                <h3 className="text-[24px] font-bold text-[#141212]">
                  Why Engineering Leaders Choose Geospatial Works
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  {service.benefits.map((b, idx) => (
                    <div key={idx} className="p-5 bg-neutral-50 border border-neutral-200 space-y-1">
                      <span className="text-[12px] font-bold text-[#F4382D]">0{idx + 1}</span>
                      <p className="text-[14px] font-semibold text-neutral-800">{b}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right 4 Cols: Factsheet & Direct Inquiry */}
            <aside className="lg:col-span-4 space-y-8 sticky top-28">
              <div className="border border-neutral-200 p-8 bg-[#FBFBFB] space-y-6 shadow-sm">
                <div className="border-b border-neutral-200 pb-4">
                  <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-500">
                    COMPLIANCE & STANDARDS
                  </span>
                  <h3 className="text-[20px] font-extrabold text-[#141212] pt-1">
                    Quality Benchmarks
                  </h3>
                </div>

                <div className="space-y-3">
                  {service.standards.map((st, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-[13px] text-neutral-700">
                      <ShieldCheck size={16} className="text-[#F4382D] shrink-0 mt-0.5" />
                      <span>{st}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-neutral-200 space-y-3">
                  <Link
                    href="/contact"
                    className="w-full text-center block bg-[#F4382D] hover:bg-[#d62f25] text-white text-[13px] font-bold py-3.5 tracking-wide transition-colors"
                  >
                    Request a Service Proposal
                  </Link>
                  <Link
                    href="/services"
                    className="w-full text-center block border border-neutral-300 hover:border-black text-[#141212] text-[13px] font-bold py-3 transition-colors"
                  >
                    ← All Capabilities
                  </Link>
                </div>
              </div>

              {/* Direct Support Card */}
              <div className="bg-[#141212] text-white p-7 space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#F4382D]">
                  CONSULTATION
                </span>
                <h4 className="text-[17px] font-bold">Have unique site requirements?</h4>
                <p className="text-[13px] text-neutral-400 leading-normal">
                  Our survey engineers will review your site plans and propose the optimal mix of ground, aerial, and subsurface instruments.
                </p>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-1.5 text-[13px] font-bold text-white hover:text-[#F4382D] transition-colors pt-1"
                >
                  Speak with our Chief Surveyor <ArrowRight size={14} />
                </Link>
              </div>
            </aside>
          </div>
        </section>

        {/* =========================================================================
            RELATED CAPABILITIES
            ========================================================================= */}
        {related.length > 0 && (
          <section className="bg-neutral-50 py-20 border-t border-neutral-200">
            <div className="max-w-[1440px] mx-auto px-6 md:px-12">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-[28px] sm:text-[34px] font-extrabold text-[#141212] tracking-tight">
                  Complementary Capabilities
                </h3>
                <Link
                  href="/services"
                  className="text-[14px] font-bold text-[#F4382D] hover:underline flex items-center gap-1"
                >
                  View all capabilities <ChevronRight size={16} />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {related.map((rel) => (
                  <Link
                    key={rel.slug}
                    href={`/services/${rel.slug}`}
                    className="group block bg-white p-6 border border-neutral-200 hover:border-neutral-400 transition-all shadow-sm space-y-4"
                  >
                    <div className="aspect-[16/9] overflow-hidden bg-neutral-100">
                      <img
                        src={rel.image || undefined}
                        alt={rel.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-neutral-500">
                        {rel.category}
                      </span>
                      <h4 className="text-[18px] font-bold text-[#141212] group-hover:text-[#F4382D] transition-colors leading-snug mt-1">
                        {rel.title}
                      </h4>
                      <p className="text-[13px] text-neutral-600 line-clamp-2 mt-2">
                        {rel.lead}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* =========================================================================
            WSP KEEP IN TOUCH PRE-FOOTER
            ========================================================================= */}
        <section className="bg-[#141212] text-white py-20 border-t border-white/10">
          <div className="max-w-[1440px] mx-auto px-6 md:px-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="space-y-2">
              <span className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#F4382D]">
                START A CONVERSATION
              </span>
              <h2 className="text-[36px] sm:text-[46px] font-extrabold tracking-[-0.03em] leading-none text-white">
                Keep in touch
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <Link href="/contact" className="wsp-btn wsp-btn-solid">
                Contact us
              </Link>
              <Link href="/contact#office" className="wsp-btn wsp-btn-outline">
                Our Dhaka HQ
              </Link>
            </div>
          </div>
        </section>
      </main>
    </CorporateShell>
  );
}
