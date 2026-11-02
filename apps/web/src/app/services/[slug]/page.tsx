import { notFound } from 'next/navigation';
import CorporateShell from '@/components/CorporateShell';
import { InteriorCta, InteriorHeading, InteriorHero } from '@/components/InteriorDesign';
import { ServiceGrid } from '@/components/CorporateSections';
import { services } from '@/lib/corporate-data';
import '../../corporate.css';
import '../../interior.css';

export function generateStaticParams() { return services.map(({ slug }) => ({ slug })); }

export default async function ServiceDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = services.find(item => item.slug === slug);
  if (!service) notFound();
  return <CorporateShell><main className="interior-page interior-detail">
    <InteriorHero eyebrow={`SERVICES / ${service.category}`} title={service.title} description={service.description} image="/inner/banner-services.webp" mobileImage="/inner/field-surveyor.webp" imageAlt="Surveyor working beside a river" dark action={{ label: 'Discuss this service', href: '/contact' }} />
    <section className="interior-section reveal"><div className="interior-shell interior-detail-grid"><div><InteriorHeading number="01" eyebrow="SERVICE OVERVIEW" title="A clearer view of the site." /><p>{service.description} We tailor the scope and outputs to the site and project requirements.</p><div className="interior-photo interior-detail-photo"><img src={service.image} alt="" loading="lazy" /></div></div><aside><span className="interior-kicker">TYPICAL DELIVERABLES</span><ul>{service.details.map((detail, index) => <li key={detail}><b>{String(index + 1).padStart(2, '0')}</b>{detail}</li>)}</ul></aside></div></section>
    <section className="interior-section interior-soft reveal"><div className="interior-shell"><InteriorHeading number="02" eyebrow="EXPLORE MORE" title="Other services" href="/services" linkText="All services" /><ServiceGrid limit={3} /></div></section>
    <InteriorCta title="Let’s map what your project needs." />
  </main></CorporateShell>;
}
