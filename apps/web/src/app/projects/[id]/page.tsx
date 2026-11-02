import { notFound } from 'next/navigation';
import CorporateShell from '@/components/CorporateShell';
import { InteriorCta, InteriorHeading, InteriorHero } from '@/components/InteriorDesign';
import { ProjectGrid } from '@/components/CorporateSections';
import { projects } from '@/lib/corporate-data';
import '../../corporate.css';
import '../../interior.css';

export function generateStaticParams() { return projects.map(({ slug }) => ({ id: slug })); }

export default async function ProjectDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = projects.find(item => item.slug === id);
  if (!project) notFound();
  return <CorporateShell><main className="interior-page interior-detail">
    <InteriorHero eyebrow={`PROJECTS / ${project.category}`} title={project.title} description={project.location} image="/inner/banner-projects.webp" mobileImage="/inner/bridge-aerial.webp" imageAlt="Aerial view of a bridge and river corridor" />
    <section className="interior-section reveal"><div className="interior-shell interior-detail-grid"><div><InteriorHeading number="01" eyebrow="PROJECT OVERVIEW" title="The work in context." /><p>{project.summary}</p><div className="interior-photo interior-detail-photo"><img src={project.image} alt="" loading="lazy" /></div></div><aside><span className="interior-kicker">PROJECT DETAILS</span><ul><li><b>01</b>{project.category}</li><li><b>02</b>{project.location}</li></ul></aside></div></section>
    <section className="interior-section interior-soft reveal"><div className="interior-shell"><InteriorHeading number="02" eyebrow="MORE WORK" title="Other projects" href="/projects" linkText="All projects" /><ProjectGrid limit={3} /></div></section>
    <InteriorCta title="Have a place you need to understand?" />
  </main></CorporateShell>;
}
