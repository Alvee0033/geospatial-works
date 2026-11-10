import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ChevronRight, Cpu, HardDrive, Send } from 'lucide-react';
import CorporateShell from '@/components/CorporateShell';
import KeepInTouchSection from '@/components/KeepInTouchSection';
import { CmsApi } from '@/lib/cms-api';
import { softwareExpertise } from '@/lib/software-expertise';
import '../../corporate.css';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Instruments & Facilities | Geospatial Works',
  description: 'A clear look at the survey instruments, computers, and software used by Geospatial Works.',
};

const instruments = [
  {
    name: 'CHCNAV i83 GNSS receivers',
    label: 'FIELD POSITIONING · 8 UNITS',
    detail: 'Satellite positioning equipment for land surveys, mapping, and boundary work.',
    image: '/real-media/equipment-rtk-gnss-station.jpg',
    facts: ['1,408 channels', 'Static & RTK', 'Up to 30 km GSM range'],
  },
  {
    name: 'DJI survey drones',
    label: 'AERIAL MAPPING · 3 AIRCRAFT',
    detail: 'Mavic 3 Enterprise, Mavic 3 Multispectral, and Matrice 4 Enterprise for aerial survey work.',
    image: '/real-media/equipment-drone-fleet.jpg',
    facts: ['RGB & multispectral', '7 batteries per model', 'Large-area surveys'],
  },
  {
    name: 'Total stations',
    label: 'LAND SURVEYING · MULTI-BRAND',
    detail: 'Topcon, Sokkia, CHCNAV, and Kolida instruments for measuring angles, distance, and site positions.',
    image: '/real-media/equipment-total-stations.jpg',
    facts: ['Topcon & Sokkia', 'CHCNAV & Kolida', 'Site layout & boundaries'],
  },
  {
    name: 'Levels & river sounder',
    label: 'LEVELS AND WATER SURVEYS',
    detail: 'Sokkia and Topcon optical levels, with a CHCNAV D270 echo sounder for river and canal depth surveys.',
    image: '/real-media/equipment-level-machines.jpg',
    facts: ['Sokkia B 20A', 'Topcon AT B 3', 'CHCNAV D270'],
  },
];

const workstations = [
  ['Workstation 01', 'Intel Core i9', '64 GB DDR5', 'NVIDIA RTX 4060 Ti'],
  ['Workstation 02', 'Intel Core i9', '64 GB DDR5', 'NVIDIA RTX 4060 Ti'],
  ['Workstation 03', 'Intel Core Ultra 7', '64 GB DDR5', 'NVIDIA RTX 5060 Ti'],
  ['Workstation 04', 'Intel Core i7', '32 GB DDR5', 'Dedicated graphics'],
];

export default async function FutureReadyPage() {
  const sections = await CmsApi.getSections('future-ready').catch(() => ({} as Record<string, any>));
  const wysiwyg = (sections as Record<string, any>)['full_page_wysiwyg']?.content;
  const configuredTitle = wysiwyg?.heroTitle;
  const title = configuredTitle && !/future[ -]?ready geodesy/i.test(configuredTitle)
    ? configuredTitle
    : 'Instruments & Facilities';
  const description = wysiwyg?.heroSubtitle || 'A closer look at the tools our team uses to survey land, make maps, and support projects across Bangladesh.';
  const heroImage = wysiwyg?.heroImage || '/real-media/equipment-dji-drones.jpg';

  return (
    <CorporateShell>
      <main className="min-h-screen bg-[#f7f7f3] text-[#0B1F44] font-sans antialiased">
        <section className="relative isolate min-h-[390px] overflow-hidden bg-[#0B1F44] text-white sm:min-h-[440px]">
          <Image src={heroImage} alt="Survey equipment in the field" fill priority sizes="100vw" className="-z-20 object-cover object-center" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#071326]/95 via-[#0B1F44]/75 to-[#0B1F44]/20" />
          <div className="mx-auto flex min-h-[390px] max-w-[1440px] flex-col justify-center px-6 py-16 sm:min-h-[440px] md:px-12">
            <div className="mb-8 flex items-center gap-2 text-xs font-medium text-white/70">
              <Link href="/" className="transition hover:text-white">Home</Link><ChevronRight size={13} />
              <Link href="/about" className="transition hover:text-white">About</Link><ChevronRight size={13} />
              <span className="text-white">Instruments &amp; Facilities</span>
            </div>
            <div className="max-w-2xl">
              <span className="mb-4 inline-flex items-center gap-3 text-[11px] font-bold uppercase tracking-[.22em] text-[#60A5FA]"><i className="h-px w-8 bg-gradient-to-r from-[#3B82F6] to-[#FB1D10]" />{wysiwyg?.heroKicker || 'HOW WE DO THE WORK'}</span>
              <h1 className="text-4xl font-semibold leading-[1.04] tracking-[-.045em] sm:text-6xl">{title}</h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-white/75 sm:text-lg">{description}</p>
              <Link href="/contact" className="mt-7 inline-flex min-h-11 items-center gap-3 bg-[#FB1D10] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#3B82F6]">
                Ask about our equipment <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1440px] px-6 py-14 md:px-12 md:py-20">
          <div className="mb-8 flex flex-col justify-between gap-4 border-b border-[#d9ded8] pb-6 sm:flex-row sm:items-end">
            <div>
              <p className="mb-3 text-[11px] font-bold uppercase tracking-[.2em] text-[#1B4B9D]">01 / IN THE FIELD</p>
              <h2 className="max-w-xl text-3xl font-semibold leading-tight tracking-[-.035em] sm:text-4xl">Tools chosen for the work at hand.</h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-[#53656a]">From land measurements to aerial photos and river depths, our teams use equipment suited to each site.</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {instruments.map((item, index) => (
              <article key={item.name} className="group min-w-0 border-t-2 border-[#dce2dc] bg-white transition-colors hover:border-[#FB1D10]">
                <div className="relative aspect-[1.65] overflow-hidden bg-[#e8ece8]">
                  <Image src={item.image} alt={item.name} fill sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw" className="object-cover transition duration-700 group-hover:scale-[1.035]" />
                  <span className="absolute left-3 top-3 bg-[#f7f7f3] px-2 py-1 text-[10px] font-bold tracking-[.14em] text-[#1B4B9D]">0{index + 1}</span>
                </div>
                <div className="p-5">
                  <p className="text-[9px] font-bold tracking-[.16em] text-[#1B4B9D]">{item.label}</p>
                  <h3 className="mt-2 text-xl font-semibold tracking-[-.025em]">{item.name}</h3>
                  <p className="mt-2 min-h-[48px] text-sm leading-6 text-[#53656a]">{item.detail}</p>
                  <div className="mt-4 flex flex-wrap gap-2 border-t border-[#e8ebe6] pt-4">
                    {item.facts.map((fact) => <span key={fact} className="text-[10px] font-medium text-[#466066]">{fact}</span>)}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-[#0B1F44] text-white">
          <div className="mx-auto grid max-w-[1440px] gap-10 px-6 py-12 md:grid-cols-[.8fr_1.4fr] md:items-center md:px-12 md:py-16">
            <div>
              <p className="mb-3 text-[11px] font-bold uppercase tracking-[.2em] text-[#60A5FA]">02 / IN THE OFFICE</p>
              <h2 className="text-3xl font-semibold leading-tight tracking-[-.035em] sm:text-4xl">Room to process the detail.</h2>
              <p className="mt-4 max-w-sm text-sm leading-6 text-white/65">Our workstations support mapping, survey processing, drawings, and 3D models. A 40 TB storage system keeps project files together.</p>
            </div>
            <div>
              <div className="grid grid-cols-2 border-l border-t border-white/15 sm:grid-cols-4">
                {workstations.map(([name, cpu, ram, gpu]) => (
                  <div key={name} className="min-h-[126px] border-b border-r border-white/15 p-4 sm:p-5">
                    <span className="text-[9px] font-bold uppercase tracking-[.15em] text-[#60A5FA]">{name}</span>
                    <p className="mt-3 text-sm font-semibold">{cpu}</p>
                    <p className="mt-1 text-xs text-white/55">{ram}</p>
                    <p className="mt-2 text-[10px] text-white/75">{gpu}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-3 border-b border-white/15 py-3 text-xs text-white/70">
                <HardDrive size={16} className="text-[#FB1D10]" /><span><strong className="text-white">40 TB central storage</strong> · Survey photos, maps, and project files</span>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1440px] px-6 py-14 md:px-12 md:py-20">
          <div className="mb-8 flex flex-col justify-between gap-4 border-b border-[#d9ded8] pb-6 sm:flex-row sm:items-end">
            <div>
              <p className="mb-3 text-[11px] font-bold uppercase tracking-[.2em] text-[#1B4B9D]">03 / SOFTWARE &amp; DIGITAL TOOLS</p>
              <h2 className="text-3xl font-semibold leading-tight tracking-[-.035em] sm:text-4xl">Tools our team works with.</h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-[#53656a]">A selection of the software used for survey work, maps, design, and project planning.</p>
          </div>
          <div className="grid grid-cols-2 border-l border-t border-[#dce2dc] sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {softwareExpertise.map((tool) => (
              <article key={tool.name} className="group flex min-h-[142px] flex-col justify-between border-b border-r border-[#dce2dc] bg-transparent p-4 transition-colors hover:bg-white sm:p-5">
                <div className="flex h-[62px] items-center justify-start">
                  <Image src={tool.logo} alt={`${tool.name} logo`} width={108} height={62} sizes="108px" className="max-h-[58px] w-auto max-w-[122px] object-contain object-left" />
                </div>
                <div className="pt-3">
                  <h3 className="text-sm font-semibold leading-snug text-[#0B1F44]">{tool.name}</h3>
                  <p className="mt-1 text-[10px] leading-4 text-[#6c7b7b]">{tool.category}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-[#edf2fa]">
          <div className="mx-auto flex max-w-[1440px] flex-col justify-between gap-5 px-6 py-8 sm:flex-row sm:items-center md:px-12">
            <div className="flex items-start gap-3"><Cpu size={20} className="mt-1 text-[#1B4B9D]" /><p className="max-w-xl text-sm leading-6 text-[#42585d]">Have a project that needs a particular survey instrument or mapping setup?</p></div>
            <Link href="/contact" className="inline-flex min-h-11 items-center gap-2 bg-[#0B1F44] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#FB1D10]"><Send size={15} /> Talk with our team <ArrowRight size={15} /></Link>
          </div>
        </section>
        <KeepInTouchSection />
      </main>
    </CorporateShell>
  );
}
