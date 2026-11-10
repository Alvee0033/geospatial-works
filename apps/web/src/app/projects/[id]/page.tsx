import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, MapPin } from 'lucide-react';
import CorporateShell from '@/components/CorporateShell';
import { CmsApi } from '@/lib/cms-api';
import '../../corporate.css';

export const dynamic = 'force-dynamic';

function strings(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [project, allProjects] = await Promise.all([CmsApi.getProject(id), CmsApi.getProjects()]);
  if (!project) notFound();

  const detail = project.details || {};
  const overview = typeof detail.overview === 'string' ? detail.overview : project.description;
  const related = allProjects.filter((item) => item.slug !== id).slice(0, 3);
  const sections = [
    { title: 'The challenge', items: strings(detail.challenges) },
    { title: 'Our approach', items: strings(detail.approach) },
    { title: 'The result', items: strings(detail.results) },
  ].filter((section) => section.items.length > 0);

  return <CorporateShell><main className="wsp-project-detail bg-white text-[#141212] font-sans antialiased">
    <header className="bg-white pt-28 pb-10 border-b border-neutral-100"><div className="max-w-[1440px] mx-auto px-6 md:px-12">
      <nav className="text-xs text-neutral-500 mb-6"><Link href="/projects" className="hover:text-[#F4382D]">Projects</Link> / {project.title}</nav>
      <span className="text-xs font-extrabold uppercase tracking-widest text-[#F4382D]">{project.category}</span>
      <h1 className="max-w-4xl text-[34px] sm:text-[46px] lg:text-[54px] font-extrabold tracking-tight leading-tight mt-4">{project.title}</h1>
      <p className="max-w-3xl text-lg text-neutral-600 mt-5 leading-relaxed">{project.description}</p>
    </div></header>
    {project.imageUrl && <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-8"><div className="aspect-[21/9] sm:aspect-[16/8] overflow-hidden bg-neutral-100"><img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover" /></div></div>}
    <section className="max-w-[1440px] mx-auto px-6 md:px-12 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
      <div className="lg:col-span-8 space-y-12">
        <div><h2 className="text-3xl font-bold mb-4">Project overview</h2><p className="text-neutral-700 leading-[1.8]">{overview}</p></div>
        {sections.map((section) => <div key={section.title}><h2 className="text-2xl font-bold mb-4">{section.title}</h2><ul className="space-y-3">{section.items.map((item) => <li key={item} className="border-l-2 border-[#F4382D] pl-4 text-neutral-700 leading-relaxed">{item}</li>)}</ul></div>)}
        {project.deliverables && <div className="bg-[#141212] text-white p-8"><h2 className="text-2xl font-bold mb-3">What we delivered</h2><p className="text-neutral-200 leading-relaxed">{project.deliverables}</p></div>}
      </div>
      <aside className="lg:col-span-4"><div className="border border-neutral-200 bg-[#FBFBFB] p-8 space-y-5 sticky top-28">
        <h2 className="text-xl font-bold">Project facts</h2>
        <div><span className="text-xs uppercase text-neutral-500">Client</span><p className="font-semibold">{project.client}</p></div>
        {project.location && <div><span className="text-xs uppercase text-neutral-500">Location</span><p className="font-semibold flex items-center gap-2"><MapPin size={16} />{project.location}</p></div>}
        {typeof detail.timeline === 'string' && <div><span className="text-xs uppercase text-neutral-500">Timeline</span><p className="font-semibold">{detail.timeline}</p></div>}
        {strings(detail.toolsUsed).length > 0 && <div><span className="text-xs uppercase text-neutral-500">Tools used</span><p className="font-semibold">{strings(detail.toolsUsed).join(', ')}</p></div>}
      </div></aside>
    </section>
    {related.length > 0 && <section className="max-w-[1440px] mx-auto px-6 md:px-12 py-12 border-t border-neutral-200"><h2 className="text-2xl font-bold mb-6">More projects</h2><div className="grid md:grid-cols-3 gap-5">{related.map((item) => <Link key={item.id} href={`/projects/${item.slug}`} className="border border-neutral-200 hover:border-[#F4382D] transition-colors group">{item.imageUrl && <img src={item.imageUrl} alt="" className="w-full aspect-[16/10] object-cover" />}<div className="p-4 flex justify-between gap-2 font-semibold">{item.title}<ArrowRight className="shrink-0 group-hover:translate-x-1 transition-transform" size={18} /></div></Link>)}</div></section>}
  </main></CorporateShell>;
}
